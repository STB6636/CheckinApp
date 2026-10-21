/**
 * @file assets/js/models/AttendanceModel.js
 * @description คลาสจัดการการลงเวลาปฏิบัติราชการ พิกัด GPS รูปถ่าย คำขอพิเศษ การอนุมัติ และข้อมูลรายงาน
 */

import { DatabaseService } from '../core/DatabaseService.js';
import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';

export class AttendanceModel {
    /**
     * แปลงพิกัดละติจูด/ลองจิจูด เป็นชื่อสถานที่ภาษาไทย (Reverse Geocoding ผ่าน Nominatim OpenStreetMap / Google Maps Format)
     * เก็บครบทั้ง 2 ส่วนคือ พิกัด และชื่อสถานที่ตามข้อกำหนดเมนูตั้งค่าระบบ
     * @param {number} lat
     * @param {number} lng
     * @returns {Promise<string>}
     */
    static async resolveLocationName(lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return 'ไม่ระบุสถานที่';
        }
        const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=th`,
                { headers: { 'Accept': 'application/json' } }
            );
            if (!response.ok) {
                return `พิกัด (${coordString})`;
            }
            const data = await response.json();
            const placeName = data.display_name || 'พื้นที่ปฏิบัติราชการ กรุงเทพมหานคร';
            return `${placeName} (${coordString})`;
        } catch (err) {
            console.warn('Reverse geocoding fallback:', err);
            return `พื้นที่ปฏิบัติราชการ (${coordString})`;
        }
    }

    /**
     * ดึงข้อมูลการลงเวลาของวันนี้สำหรับผู้ใช้งานที่ล็อกอินอยู่
     * @param {string} personnelId
     * @param {string} userId
     * @param {string} workDate YYYY-MM-DD
     * @returns {Promise<Object|null>}
     */
    static async getTodayRecordForUser(personnelId, userId, workDate = UIHelpers.getTodayISO()) {
        const db = DatabaseService.getInstance().client;
        let query = db
            .from('attendance_logs')
            .select('*')
            .eq('work_date', workDate)
            .order('created_at', { ascending: false })
            .limit(1);

        if (personnelId) {
            query = query.eq('personnel_id', personnelId);
        } else if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query.maybeSingle();
        if (error) {
            console.error('Error fetching today attendance:', error);
            return null;
        }
        return data;
    }

    /**
     * บันทึกลงเวลาปฏิบัติราชการ (เข้างาน หรือ ออกงาน) พร้อมรูปถ่ายจากกล้องและพิกัด GPS
     * @param {Object} payload
     * @returns {Promise<{success: boolean, data?: Object, message: string}>}
     */
    static async submitCheckinOrCheckout(payload) {
        const db = DatabaseService.getInstance().client;
        const today = payload.work_date || UIHelpers.getTodayISO();
        const currentTime = payload.time || UIHelpers.getCurrentTimeHHMM();

        // ตรวจสอบว่าวันนี้เคยลงเวลาเข้างานไว้หรือยัง
        const existing = await AttendanceModel.getTodayRecordForUser(
            payload.personnel_id,
            payload.user_id,
            today
        );

        // คำนวณสถานะ (ปกติ / สาย) เทียบกับเวลา 08:30 น.
        let status = 'ปกติ';
        let rowColor = '#059669';
        if (currentTime > '08:30') {
            status = 'สาย';
            rowColor = '#F59E0B';
        }

        if (!existing) {
            // บันทึกเวลาเข้างาน (Check-in)
            const insertData = {
                personnel_id: payload.personnel_id || null,
                user_id: payload.user_id || null,
                work_date: today,
                shift_name: payload.shift_name || 'เวลาราชการปกติ (08:30 - 16:30)',
                check_in_time: currentTime,
                check_in_photo: payload.photo_data || '',
                check_in_lat: payload.lat ?? null,
                check_in_lng: payload.lng ?? null,
                check_in_location: payload.location_name || '',
                status,
                remark: payload.remark || '',
                row_color: rowColor,
                is_special_request: false,
                approval_status: 'approved'
            };

            const { data, error } = await db
                .from('attendance_logs')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                return { success: false, message: 'ไม่สามารถบันทึกลงเวลาเข้างานได้: ' + error.message };
            }

            return {
                success: true,
                data,
                message: `บันทึกลงเวลาเข้างานสำเร็จ เวลา ${currentTime} น.`
            };
        } else {
            // บันทึกเวลาออกงาน (Check-out)
            const updateData = {
                check_out_time: currentTime,
                check_out_photo: payload.photo_data || existing.check_out_photo || '',
                check_out_lat: payload.lat ?? existing.check_out_lat,
                check_out_lng: payload.lng ?? existing.check_out_lng,
                check_out_location: payload.location_name || existing.check_out_location || '',
                updated_at: new Date().toISOString()
            };

            const { data, error } = await db
                .from('attendance_logs')
                .update(updateData)
                .eq('id', existing.id)
                .select()
                .single();

            if (error) {
                return { success: false, message: 'ไม่สามารถบันทึกลงเวลาออกงานได้: ' + error.message };
            }

            return {
                success: true,
                data,
                message: `บันทึกลงเวลาออกงานสำเร็จ เวลา ${currentTime} น.`
            };
        }
    }

    /**
     * ส่งคำขอลงเวลากรณีพิเศษ (ผู้ใช้เลือกวันที่, เลือกช่วงเวลา, หมายเหตุ แล้วส่งคำขอให้ SuperAdmin/Admin อนุมัติ)
     * @param {Object} payload
     * @returns {Promise<{success: boolean, data?: Object, message: string}>}
     */
    static async submitSpecialRequest(payload) {
        if (!payload.work_date || !payload.shift_name || !payload.remark) {
            return { success: false, message: 'กรุณาเลือกวันที่ ช่วงเวลา และระบุหมายเหตุให้ครบถ้วน' };
        }

        const db = DatabaseService.getInstance().client;
        const insertData = {
            personnel_id: payload.personnel_id || null,
            user_id: payload.user_id || null,
            work_date: payload.work_date,
            shift_name: payload.shift_name,
            check_in_time: payload.check_in_time || '08:30',
            check_out_time: payload.check_out_time || '16:30',
            check_in_photo: payload.photo_data || '',
            check_in_lat: payload.lat ?? null,
            check_in_lng: payload.lng ?? null,
            check_in_location: payload.location_name || 'ขอลงเวลากรณีพิเศษ',
            status: 'ขออนุมัติกรณีพิเศษ',
            remark: payload.remark,
            row_color: '#6366F1',
            is_special_request: true,
            approval_status: 'pending'
        };

        const { data, error } = await db
            .from('attendance_logs')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            return { success: false, message: 'ไม่สามารถส่งคำขอลงเวลากรณีพิเศษได้: ' + error.message };
        }

        return {
            success: true,
            data,
            message: 'ส่งคำขอลงเวลากรณีพิเศษเรียบร้อยแล้ว กรุณารอผู้ดูแลระบบ (SuperAdmin/Admin) อนุมัติ'
        };
    }

    /**
     * ดึงรายการคำขอลงเวลากรณีพิเศษตามสถานะ (กรองตามขอบเขตการมองเห็นของ SuperAdmin/Admin)
     * @param {Object} currentUser
     * @param {'pending'|'approved'|'rejected'|'all'} statusFilter
     * @returns {Promise<Array<Object>>}
     */
    static async getSpecialRequests(currentUser, statusFilter = 'pending') {
        const db = DatabaseService.getInstance().client;
        let query = db
            .from('attendance_logs')
            .select(`
                *,
                personnel:personnel_id (
                    id, national_id, prefix, first_name, last_name,
                    position_type, position_title, position_level,
                    organization, bureau, division, work_group, badge_color
                )
            `)
            .eq('is_special_request', true)
            .order('work_date', { ascending: false })
            .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
            query = query.eq('approval_status', statusFilter);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching special requests:', error);
            return [];
        }

        const list = data || [];
        if (!currentUser || currentUser.role === 'SuperAdmin') {
            return list;
        }

        return list.filter(item => {
            const p = item.personnel || {};
            return AuthService.canViewRecordByScope(currentUser, {
                bureau: p.bureau || '',
                division: p.division || ''
            });
        });
    }

    /**
     * อนุมัติ หรือ ไม่อนุมัติ คำขอลงเวลากรณีพิเศษ (รองรับทั้งแบบรายการเดียวและหลายรายการพร้อมกัน Bulk Action)
     * @param {Array<string>} logIds รายการ UUID ของ attendance_logs
     * @param {'approved'|'rejected'} decision
     * @param {string} approverUserId UUID ของผู้ดูแลระบบที่กดอนุมัติ
     * @returns {Promise<{success: boolean, count: number, message: string}>}
     */
    static async processSpecialRequestsBulk(logIds, decision, approverUserId) {
        if (!Array.isArray(logIds) || logIds.length === 0) {
            return { success: false, count: 0, message: 'กรุณาเลือกรายการที่ต้องการดำเนินการอย่างน้อย 1 รายการ' };
        }

        const db = DatabaseService.getInstance().client;
        const newStatusText = decision === 'approved' ? 'อนุมัติกรณีพิเศษ' : 'ไม่อนุมัติ';
        const newRowColor = decision === 'approved' ? '#059669' : '#E11D48';

        const { data, error } = await db
            .from('attendance_logs')
            .update({
                approval_status: decision,
                status: newStatusText,
                row_color: newRowColor,
                approved_by: approverUserId || null,
                approved_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .in('id', logIds)
            .select();

        if (error) {
            return { success: false, count: 0, message: 'เกิดข้อผิดพลาดในการบันทึกผลการอนุมัติ: ' + error.message };
        }

        const count = data ? data.length : logIds.length;
        const actionLabel = decision === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ';
        return {
            success: true,
            count,
            message: `${actionLabel}รายการลงเวลากรณีพิเศษจำนวน ${count} รายการเรียบร้อยแล้ว`
        };
    }

    /**
     * ดึงข้อมูลการลงเวลาปฏิบัติราชการตามวันที่เลือก ผสานกับรายชื่อบุคลากรทั้งหมดในขอบเขตการมองเห็น
     * เพื่อแสดงทั้งผู้ที่มาปฏิบัติราชการปกติ, มาสาย, ขออนุมัติกรณีพิเศษ และยังไม่ลงเวลา
     * @param {string} workDate YYYY-MM-DD
     * @param {Object} currentUser
     * @returns {Promise<Array<Object>>}
     */
    static async getDailyReportRecords(workDate, currentUser) {
        const db = DatabaseService.getInstance().client;

        // 1. ดึงรายชื่อบุคลากรทั้งหมดตามขอบเขต
        const { data: personnelData } = await db
            .from('personnel')
            .select('*')
            .order('bureau', { ascending: true })
            .order('division', { ascending: true })
            .order('work_group', { ascending: true })
            .order('first_name', { ascending: true });

        const allPersonnel = (personnelData || []).filter(p =>
            !currentUser || currentUser.role === 'SuperAdmin'
                ? true
                : AuthService.canViewRecordByScope(currentUser, p)
        );

        // 2. ดึงข้อมูลการลงเวลาของวันที่เลือก
        const { data: logsData } = await db
            .from('attendance_logs')
            .select('*')
            .eq('work_date', workDate);

        const logsByPersonnelId = new Map();
        for (const log of (logsData || [])) {
            if (log.personnel_id) {
                logsByPersonnelId.set(log.personnel_id, log);
            }
        }

        // 3. ผสานข้อมูลบุคลากรเข้ากับเวลาเข้า-ออกงาน
        return allPersonnel.map(person => {
            const log = logsByPersonnelId.get(person.id) || null;
            let statusCategory = 'absent';
            let statusLabel = 'ยังไม่ลงเวลา';
            let rowColor = '#E11D48';

            if (log) {
                if (log.is_special_request) {
                    statusCategory = 'special';
                    statusLabel = log.approval_status === 'pending'
                        ? 'รออนุมัติกรณีพิเศษ'
                        : (log.approval_status === 'approved' ? 'อนุมัติกรณีพิเศษ' : 'ไม่อนุมัติกรณีพิเศษ');
                    rowColor = log.row_color || '#6366F1';
                } else if (log.status === 'สาย' || (log.check_in_time && log.check_in_time.slice(0, 5) > '08:30')) {
                    statusCategory = 'late';
                    statusLabel = 'มาสาย';
                    rowColor = log.row_color || '#F59E0B';
                } else {
                    statusCategory = 'normal';
                    statusLabel = 'ปกติ';
                    rowColor = log.row_color || '#059669';
                }
            }

            return {
                personnel_id: person.id,
                log_id: log ? log.id : null,
                national_id: person.national_id || '',
                prefix: person.prefix,
                first_name: person.first_name,
                last_name: person.last_name,
                full_name: `${person.prefix}${person.first_name} ${person.last_name}`,
                position_type: person.position_type,
                position_title: person.position_title,
                position_level: person.position_level,
                position_full: `${person.position_title}${person.position_level ? ' ระดับ' + person.position_level : ''}`,
                organization: person.organization,
                bureau: person.bureau,
                division: person.division,
                work_group: person.work_group,
                work_date: workDate,
                shift_name: log?.shift_name || 'เวลาราชการปกติ (08:30 - 16:30)',
                check_in_time: log?.check_in_time ? log.check_in_time.slice(0, 5) : '',
                check_out_time: log?.check_out_time ? log.check_out_time.slice(0, 5) : '',
                check_in_location: log?.check_in_location || '',
                check_in_photo: log?.check_in_photo || '',
                remark: log?.remark || '',
                status_category: statusCategory,
                status_label: statusLabel,
                row_color: rowColor,
                is_special_request: Boolean(log?.is_special_request),
                approval_status: log?.approval_status || 'none'
            };
        });
    }

    /**
     * เพิ่มหรือแก้ไขข้อมูลการลงเวลาโดยผู้ดูแลระบบ (Modal เพิ่ม/แก้ไขในหน้ารายงาน)
     * @param {Object} payload
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async saveAdminAttendanceRecord(payload) {
        const db = DatabaseService.getInstance().client;
        const recordData = {
            personnel_id: payload.personnel_id,
            work_date: payload.work_date,
            shift_name: payload.shift_name || 'เวลาราชการปกติ (08:30 - 16:30)',
            check_in_time: payload.check_in_time || null,
            check_out_time: payload.check_out_time || null,
            status: payload.status || 'ปกติ',
            remark: payload.remark || '',
            row_color: payload.row_color || '#059669',
            is_special_request: Boolean(payload.is_special_request),
            approval_status: payload.approval_status || 'approved',
            updated_at: new Date().toISOString()
        };

        if (payload.log_id) {
            const { error } = await db
                .from('attendance_logs')
                .update(recordData)
                .eq('id', payload.log_id);
            if (error) {
                return { success: false, message: 'ไม่สามารถแก้ไขข้อมูลการลงเวลาได้: ' + error.message };
            }
            return { success: true, message: 'อัปเดตข้อมูลการลงเวลาเรียบร้อยแล้ว' };
        } else {
            const { error } = await db
                .from('attendance_logs')
                .insert(recordData);
            if (error) {
                return { success: false, message: 'ไม่สามารถเพิ่มข้อมูลการลงเวลาได้: ' + error.message };
            }
            return { success: true, message: 'เพิ่มข้อมูลการลงเวลาเรียบร้อยแล้ว' };
        }
    }

    /**
     * ลบข้อมูลการลงเวลา (ในหน้ารายงาน)
     * @param {string} logId
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async deleteAttendanceRecord(logId) {
        const db = DatabaseService.getInstance().client;
        const { error } = await db
            .from('attendance_logs')
            .delete()
            .eq('id', logId);

        if (error) {
            return { success: false, message: 'ไม่สามารถลบข้อมูลการลงเวลาได้: ' + error.message };
        }
        return { success: true, message: 'ลบรายการลงเวลาเรียบร้อยแล้ว' };
    }

    /**
     * คำนวณสถิติสำหรับแสดงในการ์ด KPI, หลอด Progress Fill และกราฟ Chart.js
     * @param {Array<Object>} dailyRecords รายการจาก getDailyReportRecords
     * @returns {Object}
     */
    static calculateDashboardMetrics(dailyRecords) {
        const total = dailyRecords.length;
        const normalCount = dailyRecords.filter(r => r.status_category === 'normal').length;
        const lateCount = dailyRecords.filter(r => r.status_category === 'late').length;
        const specialCount = dailyRecords.filter(r => r.status_category === 'special').length;
        const absentCount = dailyRecords.filter(r => r.status_category === 'absent').length;

        const calcPercent = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);

        // สรุปจำนวนแยกตาม ส่วน/ฝ่าย สำหรับสร้างกราฟแท่ง Chart.js
        const divisionStatsMap = {};
        for (const rec of dailyRecords) {
            const div = rec.division || 'ไม่ระบุส่วน/ฝ่าย';
            if (!divisionStatsMap[div]) {
                divisionStatsMap[div] = { normal: 0, late: 0, special: 0, absent: 0, total: 0 };
            }
            divisionStatsMap[div][rec.status_category]++;
            divisionStatsMap[div].total++;
        }

        return {
            total,
            categories: [
                {
                    key: 'normal',
                    label: 'มาปฏิบัติราชการปกติ',
                    count: normalCount,
                    percent: calcPercent(normalCount),
                    color: '#059669',
                    icon: 'fa-user-check'
                },
                {
                    key: 'late',
                    label: 'มาสาย (หลัง 08:30 น.)',
                    count: lateCount,
                    percent: calcPercent(lateCount),
                    color: '#F59E0B',
                    icon: 'fa-user-clock'
                },
                {
                    key: 'special',
                    label: 'ขอลงเวลากรณีพิเศษ',
                    count: specialCount,
                    percent: calcPercent(specialCount),
                    color: '#6366F1',
                    icon: 'fa-file-signature'
                },
                {
                    key: 'absent',
                    label: 'ยังไม่ลงเวลาปฏิบัติราชการ',
                    count: absentCount,
                    percent: calcPercent(absentCount),
                    color: '#E11D48',
                    icon: 'fa-user-xmark'
                }
            ],
            divisionBreakdown: divisionStatsMap
        };
    }
}