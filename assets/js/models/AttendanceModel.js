/**
 * @file assets/js/models/AttendanceModel.js
 * @description คลาสจัดการการลงเวลาปฏิบัติราชการ (อัปเกรดระบบ GPS จับอพาร์ทเม้นส์/อาคารระยะใกล้แม่นยำ + คำนวณเวลาออกงานหลังเลิกงาน +30 นาที)
 */

import { Config } from '../core/Config.js';
import { DatabaseService } from '../core/DatabaseService.js';
import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { SettingsModel } from './SettingsModel.js';

export class AttendanceModel {
    /**
     * คำนวณระยะห่างระหว่างพิกัด 2 จุดเป็นเมตร (Haversine Formula)
     */
    static #calculateDistanceMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const toRad = (deg) => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * แปลงจำนวนนาทีรวมกลับเป็นเวลา HH:mm (24 ชม.)
     * @param {number} totalMinutes
     * @returns {string}
     */
    static #minutesToTime24(totalMinutes) {
        const normalized = ((totalMinutes % 1440) + 1440) % 1440;
        const hh = String(Math.floor(normalized / 60)).padStart(2, '0');
        const mm = String(normalized % 60).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    /**
     * อัปเกรดระบบจับสถานที่ใกล้เคียง (Multi-Layer POI & Building Detection):
     * ขั้นที่ 1: ค้นหาหมุดสถานที่ อาคาร อพาร์ทเม้นส์ ร้านค้า สำนักงาน ในรัศมี 65 เมตรผ่าน Overpass API
     *          เรียงลำดับตามระยะห่างจริงจากพิกัดผู้ใช้ (หาก <= 20 เมตร ใช้ชื่อสถานที่นั้นเลย / หาก > 20 เมตร ใช้ "ใกล้เคียง [ชื่อสถานที่]")
     * ขั้นที่ 2: หากไม่พบใน Overpass จึงค้นหาจาก Nominatim ระดับอาคาร/ซอย/ถนน ก่อนจะไปถึงระดับแขวง/เขต
     * @param {number} lat
     * @param {number} lng
     * @returns {Promise<string>}
     */
    static async resolveLocationName(lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return 'ไม่ระบุสถานที่';
        }

        // ขั้นที่ 1: กวาดหาสถานที่ที่มีชื่อ (อพาร์ทเม้นส์, อาคาร, ร้านค้า, หน่วยงาน) ในรัศมี 65 เมตรด้วย Overpass API
        try {
            const overpassQuery = `[out:json][timeout:4];(node(around:65,${lat},${lng})["name"];way(around:65,${lat},${lng})["name"];);out center;`;
            const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
            const ovRes = await fetch(overpassUrl);

            if (ovRes.ok) {
                const ovData = await ovRes.json();
                const elements = ovData?.elements || [];

                const candidates = [];
                for (const el of elements) {
                    const tags = el.tags || {};
                    const placeName = (tags['name:th'] || tags.name || '').trim();
                    if (!placeName) continue;

                    // ข้ามเส้นถนนหลักหรือเขตการปกครองในรอบแรก เพื่อให้ความสำคัญกับอาคาร/อพาร์ทเม้นส์/สถานที่ก่อน
                    if (tags.boundary === 'administrative' || tags.place) continue;

                    const elLat = el.lat ?? el.center?.lat;
                    const elLon = el.lon ?? el.center?.lon;
                    if (typeof elLat !== 'number' || typeof elLon !== 'number') continue;

                    const dist = AttendanceModel.#calculateDistanceMeters(lat, lng, elLat, elLon);
                    // ให้คะแนนความสำคัญกับ อาคาร/อพาร์ทเม้นส์/สำนักงาน/ร้านค้า มากกว่าเส้นทางถนน
                    const isHighway = Boolean(tags.highway);
                    candidates.push({
                        name: placeName,
                        dist,
                        isHighway
                    });
                }

                // เรียงลำดับโดยเลือกสถานที่ที่ไม่ใช่เส้นถนนก่อน และเรียงตามระยะทางที่ใกล้ที่สุด
                candidates.sort((a, b) => {
                    if (a.isHighway !== b.isHighway) {
                        return a.isHighway ? 1 : -1;
                    }
                    return a.dist - b.dist;
                });

                if (candidates.length > 0) {
                    const nearest = candidates[0];
                    if (!nearest.isHighway) {
                        if (nearest.dist <= 20) {
                            return nearest.name;
                        }
                        return `ใกล้เคียง ${nearest.name}`;
                    }
                }
            }
        } catch (ovErr) {
            console.warn('Overpass POI lookup fallback to Nominatim:', ovErr);
        }

        // ขั้นที่ 2: ค้นหาผ่าน Nominatim Reverse Geocoding (zoom=18)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&namedetails=1&accept-language=th`,
                { headers: { 'Accept': 'application/json' } }
            );

            if (response.ok) {
                const data = await response.json();
                const addr = data.address || {};
                const namedetails = data.namedetails || {};

                const directPoiName =
                    namedetails['name:th'] ||
                    namedetails.name ||
                    data.name ||
                    addr.apartments ||
                    addr.building ||
                    addr.amenity ||
                    addr.office ||
                    addr.shop ||
                    addr.tourism ||
                    addr.residential ||
                    addr.commercial ||
                    '';

                const placeLat = parseFloat(data.lat);
                const placeLon = parseFloat(data.lon);
                const distMeters = (!isNaN(placeLat) && !isNaN(placeLon))
                    ? AttendanceModel.#calculateDistanceMeters(lat, lng, placeLat, placeLon)
                    : 0;

                // ตรวจสอบว่า directPoiName ไม่ใช่ชื่อถนนหรือชื่อเขต
                if (directPoiName && directPoiName !== addr.road && directPoiName !== addr.city_district) {
                    if (distMeters <= 25) {
                        return directPoiName.trim();
                    }
                    return `ใกล้เคียง ${directPoiName.trim()}`;
                }

                // หากไม่มีชื่ออาคาร ให้ใช้ชื่อซอย / ถนน / หมู่บ้าน / แขวง ตามลำดับ
                const specificStreetOrArea =
                    addr.Aeroway ||
                    addr.hamlet ||
                    addr.neighbourhood ||
                    addr.quarter ||
                    addr.road ||
                    addr.suburb ||
                    addr.city_district ||
                    'พื้นที่ปฏิบัติราชการ';

                return `ใกล้เคียง ${specificStreetOrArea.trim()}`;
            }
        } catch (err) {
            console.warn('Reverse geocoding error:', err);
        }

        return `ใกล้เคียง พื้นที่ปฏิบัติราชการ (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    }

    static evaluateOfficialStatus(log, settings) {
        const colors = {
            ...Config.DEFAULT_SETTINGS.category_colors,
            ...(settings?.category_colors || {})
        };

        if (!log) {
            return {
                status_key: 'no_checkin',
                status_label: 'ไม่ลงเวลา',
                row_color: colors.no_checkin || '#E11D48'
            };
        }

        const matchingShift = (settings?.work_shifts || []).find(s =>
            s.name === log.shift_name || SettingsModel.formatShiftDisplayText(s) === log.shift_name
        );

        if (
            log.is_overtime ||
            matchingShift?.is_overtime ||
            log.status === 'ปฏิบัติงานนอกเวลาราชการ'
        ) {
            return {
                status_key: 'overtime',
                status_label: 'ปฏิบัติงานนอกเวลาราชการ',
                row_color: colors.overtime || '#2563EB'
            };
        }

        if (log.is_special_request) {
            if (log.approval_status === 'rejected') {
                return {
                    status_key: 'absent_duty',
                    status_label: 'ขาดราชการ',
                    row_color: colors.absent_duty || '#EA580C'
                };
            }
            return {
                status_key: 'normal',
                status_label: 'ปฏิบัติงานปกติ',
                row_color: colors.normal || '#007B3E'
            };
        }

        if (log.status === 'ขาดราชการ') {
            return {
                status_key: 'absent_duty',
                status_label: 'ขาดราชการ',
                row_color: colors.absent_duty || '#EA580C'
            };
        }

        const stdStart = matchingShift?.check_in || settings?.standard_check_in || '08:30';
        const stdEnd = matchingShift?.check_out || settings?.standard_check_out || '16:30';
        const lateThreshold = Number(settings?.late_threshold_minutes ?? 30);

        const startMin = UIHelpers.timeToMinutes(stdStart);
        const endMin = UIHelpers.timeToMinutes(stdEnd);
        const checkInMin = UIHelpers.timeToMinutes(log.check_in_time);
        const checkOutMin = log.check_out_time ? UIHelpers.timeToMinutes(log.check_out_time) : -1;

        if (checkInMin < 0) {
            return {
                status_key: 'no_checkin',
                status_label: 'ไม่ลงเวลา',
                row_color: colors.no_checkin || '#E11D48'
            };
        }

        if (checkInMin > startMin + lateThreshold) {
            return {
                status_key: 'absent_duty',
                status_label: 'ขาดราชการ',
                row_color: colors.absent_duty || '#EA580C'
            };
        }

        const isOvernight = Boolean(matchingShift?.is_overnight || endMin < startMin);
        if (!isOvernight && checkOutMin !== -1 && checkOutMin < endMin) {
            return {
                status_key: 'absent_duty',
                status_label: 'ขาดราชการ',
                row_color: colors.absent_duty || '#EA580C'
            };
        }

        if (checkInMin > startMin) {
            return {
                status_key: 'late',
                status_label: 'มาสาย',
                row_color: colors.late || '#EAB308'
            };
        }

        return {
            status_key: 'normal',
            status_label: 'ปฏิบัติงานปกติ',
            row_color: colors.normal || '#007B3E'
        };
    }

    static async getTodayRecordsListForUser(personnelId, userId, workDate = UIHelpers.getTodayISO()) {
        const db = DatabaseService.getInstance().client;
        let query = db
            .from('attendance_logs')
            .select('id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time, check_in_location, check_out_location, status, remark, row_color, is_overtime, is_special_request, approval_status, created_at')
            .eq('work_date', workDate)
            .order('created_at', { ascending: true });

        if (personnelId) {
            query = query.eq('personnel_id', personnelId);
        } else if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching today records list:', error);
            return [];
        }
        return (data || []).filter(r => !r.is_special_request || r.approval_status === 'approved');
    }

    static async getTodayRegularRecordForUser(personnelId, userId, workDate = UIHelpers.getTodayISO()) {
        const list = await AttendanceModel.getTodayRecordsListForUser(personnelId, userId, workDate);
        return list.find(r => !r.is_overtime && r.status !== 'ปฏิบัติงานนอกเวลาราชการ') || null;
    }

    /**
     * ตรวจสอบว่ามีรายการลงเวลาเข้างานปกติที่ยังไม่ได้กดลงเวลาออกงานค้างอยู่หรือไม่
     * - หากอยู่ในวันเดียวกันและยังไม่ได้กดออกงาน -> คืนค่ารายการนั้นเพื่อให้กดออกงานก่อน
     * - หากข้ามมาวันถัดไปแล้ว แต่เวลาจริงยังไม่ถึงเวลาเริ่มบันทึกเวลาเข้างานของวันใหม่ (เช่น ก่อน 06:00 น.) -> ยังคงให้กดออกงานของเมื่อวานได้
     * - หากข้ามมาวันถัดไปแล้ว และเวลาจริงเข้าสู่ช่วงเริ่มปฏิบัติงานตามข้อ 1 (>= 06:00 น.) -> เริ่มรอบวันใหม่ตามข้อ 1
     */
    static async getActiveRegularRecordForCheckout(personnelId, userId, settings) {
        const todayIso = UIHelpers.getTodayISO();
        const todayReg = await AttendanceModel.getTodayRegularRecordForUser(personnelId, userId, todayIso);
        if (todayReg) {
            return todayReg;
        }

        // ตรวจสอบกรณีข้ามเที่ยงคืนแต่ยังไม่ถึงเวลาเริ่มเข้างานของวันใหม่ (เช่น ก่อน 06:00 น.)
        const nowMin = UIHelpers.timeToMinutes(UIHelpers.getCurrentTimeHHMM());
        const startAllowMin = UIHelpers.timeToMinutes(settings?.allow_checkin_start_time || '06:00');

        if (nowMin < startAllowMin) {
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const offsetMs = yesterdayDate.getTimezoneOffset() * 60000;
            const yesterdayIso = new Date(yesterdayDate.getTime() - offsetMs).toISOString().slice(0, 10);

            const yesterdayReg = await AttendanceModel.getTodayRegularRecordForUser(personnelId, userId, yesterdayIso);
            if (yesterdayReg && yesterdayReg.check_in_time && !yesterdayReg.check_out_time) {
                return yesterdayReg;
            }
        }

        return null;
    }

    static async getPersonalAttendanceHistory(personnelId, userId, limit = 150) {
        const db = DatabaseService.getInstance().client;
        const settings = await SettingsModel.getSettings(false);

        let query = db
            .from('attendance_logs')
            .select('id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time, check_in_location, status, remark, row_color, is_overtime, is_special_request, approval_status, created_at')
            .order('work_date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit);

        if (personnelId) {
            query = query.eq('personnel_id', personnelId);
        } else if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching personal history:', error);
            return [];
        }

        const activeLogs = (data || []).filter(r => !r.is_special_request || r.approval_status === 'approved');

        return activeLogs.map(log => {
            const evalStatus = AttendanceModel.evaluateOfficialStatus(log, settings);
            return {
                ...log,
                check_in_time: UIHelpers.formatTime24(log.check_in_time),
                check_out_time: UIHelpers.formatTime24(log.check_out_time),
                status_key: evalStatus.status_key,
                status_label: evalStatus.status_label,
                row_color: evalStatus.row_color
            };
        });
    }

    static async getPersonalSpecialRequests(personnelId, userId) {
        const db = DatabaseService.getInstance().client;
        let query = db
            .from('attendance_logs')
            .select('id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time, status, remark, is_overtime, is_special_request, approval_status, created_at')
            .eq('is_special_request', true)
            .order('work_date', { ascending: false })
            .order('created_at', { ascending: false });

        if (personnelId) {
            query = query.eq('personnel_id', personnelId);
        } else if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching personal special requests:', error);
            return [];
        }

        return (data || []).map(item => ({
            ...item,
            check_in_time: UIHelpers.formatTime24(item.check_in_time),
            check_out_time: UIHelpers.formatTime24(item.check_out_time)
        }));
    }

    static async deletePendingSpecialRequestByUser(logId, personnelId, userId) {
        const db = DatabaseService.getInstance().client;

        const { data: target, error: findErr } = await db
            .from('attendance_logs')
            .select('id, personnel_id, user_id, is_special_request, approval_status')
            .eq('id', logId)
            .maybeSingle();

        if (findErr || !target) {
            return { success: false, message: 'ไม่พบรายการคำขอที่ต้องการลบ' };
        }

        if (!target.is_special_request || target.approval_status !== 'pending') {
            return {
                success: false,
                message: 'ไม่สามารถลบได้ เนื่องจากคำขอนี้ได้รับการพิจารณาอนุมัติหรือปฏิเสธไปแล้ว'
            };
        }

        if (personnelId && target.personnel_id && target.personnel_id !== personnelId) {
            return { success: false, message: 'คุณไม่มีสิทธิ์ลบคำขอของผู้อื่น' };
        }

        const { error: delErr } = await db
            .from('attendance_logs')
            .delete()
            .eq('id', logId);

        if (delErr) {
            return { success: false, message: 'เกิดข้อผิดพลาดในการลบคำขอ: ' + delErr.message };
        }

        return { success: true, message: 'ลบคำขอลงเวลากรณีพิเศษเรียบร้อยแล้ว' };
    }

    /**
     * บันทึกลงเวลาปฏิบัติราชการ รองรับเงื่อนไขใหม่ครบทุกข้อ:
     * - กรณีมีรายการเข้างานปกติที่ยังไม่ได้กดออกงานค้างอยู่ (ข้อ 2 และ 3.1):
     *   หากเลยเวลาเลิกงานที่ตั้งไว้แต่ไม่เกิน checkout_grace_minutes (เช่น 30 นาที) ให้บันทึกเวลาออกตามจริง
     *   หากเกิน 30 นาที ให้บันทึกเวลาเป็น [เวลาออกงานที่ตั้งไว้ + 30 นาที]
     * - กรณีเป็นช่วงเวลาปฏิบัติงานนอกเวลา (ข้อ 3 และ 4): บันทึกเป็นรูปแบบพิเศษอัตโนมัติ (ทั้งเข้าและออกตามที่ตั้งไว้)
     * - กรณีเป็นรูปแบบพิเศษ (single_click_checkin): บันทึกทั้งเวลาเข้าและออกตามที่ตั้งไว้ในระบบ
     */
    static async submitCheckinOrCheckout(payload) {
        const db = DatabaseService.getInstance().client;
        const settings = await SettingsModel.getSettings(false);
        const colors = settings.category_colors || Config.DEFAULT_SETTINGS.category_colors;

        const today = payload.work_date || UIHelpers.getTodayISO();
        const currentTime = UIHelpers.formatTime24(payload.time || UIHelpers.getCurrentTimeHHMM());
        const nowMin = UIHelpers.timeToMinutes(currentTime);

        const shiftStartRef = UIHelpers.formatTime24(payload.shift_check_in || settings.standard_check_in || '08:30');
        const shiftEndRef = UIHelpers.formatTime24(payload.shift_check_out || settings.standard_check_out || '16:30');

        const activeRegularRecord = await AttendanceModel.getActiveRegularRecordForCheckout(
            payload.personnel_id,
            payload.user_id,
            settings
        );

        const hasUnclosedRegular = Boolean(
            activeRegularRecord &&
            activeRegularRecord.check_in_time &&
            !activeRegularRecord.check_out_time
        );

        // ====================================================================
        // ข้อ 2 & ข้อ 3.1: กรณีเป็นรูปแบบปกติ และยังไม่ได้กดบันทึกเวลาออกงานตามปกติ
        // ผู้ใช้จะต้องกดบันทึกเวลาออกงานก่อน!
        // - ถ้าเลยเวลาเลิกงานแต่ยังไม่เกิน checkout_grace_minutes (30 นาที) -> บันทึกเวลาตามจริง
        // - ถ้าเลยเวลาเลิกงานเกินกว่า checkout_grace_minutes (30 นาที) -> บันทึก [เวลาออกงาน + 30 นาที]
        // ====================================================================
        if (!payload.single_click_checkin && hasUnclosedRegular && !payload.force_overtime) {
            const matchingShift = (settings.work_shifts || []).find(s =>
                s.name === activeRegularRecord.shift_name ||
                SettingsModel.formatShiftDisplayText(s) === activeRegularRecord.shift_name
            );
            const targetOutRef = UIHelpers.formatTime24(matchingShift?.check_out || settings.standard_check_out || shiftEndRef);
            const targetOutMin = UIHelpers.timeToMinutes(targetOutRef);
            const graceMinutes = Number(settings.checkout_grace_minutes ?? 30);

            let effectiveCheckOutTime = payload.custom_check_out_time || currentTime;

            if (!payload.custom_check_out_time) {
                const isNextDayCheckout = activeRegularRecord.work_date !== today;
                const effectiveNowMin = isNextDayCheckout ? (nowMin + 1440) : nowMin;

                if (effectiveNowMin > targetOutMin) {
                    if (effectiveNowMin <= targetOutMin + graceMinutes) {
                        // เกินเวลาเลิกงาน แต่ยังไม่เกิน 30 นาที -> บันทึกเวลาตามจริง
                        effectiveCheckOutTime = currentTime;
                    } else {
                        // เกินกว่า 30 นาทีหลังเวลาเลิกงาน -> บันทึกเป็น [เวลาออกงาน + 30 นาที]
                        effectiveCheckOutTime = AttendanceModel.#minutesToTime24(targetOutMin + graceMinutes);
                    }
                }
            }

            const evalOut = AttendanceModel.evaluateOfficialStatus({
                check_in_time: activeRegularRecord.check_in_time,
                check_out_time: effectiveCheckOutTime,
                shift_name: activeRegularRecord.shift_name,
                is_overtime: false,
                is_special_request: false
            }, settings);

            const updateOut = {
                check_out_time: effectiveCheckOutTime,
                check_out_photo: payload.photo_url || activeRegularRecord.check_out_photo || '',
                check_out_lat: payload.lat ?? activeRegularRecord.check_out_lat,
                check_out_lng: payload.lng ?? activeRegularRecord.check_out_lng,
                check_out_location: payload.location_name || activeRegularRecord.check_out_location || '',
                status: evalOut.status_label,
                row_color: evalOut.row_color,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await db
                .from('attendance_logs')
                .update(updateOut)
                .eq('id', activeRegularRecord.id)
                .select()
                .single();

            if (error) {
                return { success: false, message: 'ไม่สามารถบันทึกลงเวลาออกงานได้: ' + error.message };
            }

            return {
                success: true,
                data,
                message: `บันทึกลงเวลาออกงานสำเร็จ เวลา ${effectiveCheckOutTime} น. (สถานะ: ${evalOut.status_label})`
            };
        }

        const todayLogs = await AttendanceModel.getTodayRecordsListForUser(
            payload.personnel_id,
            payload.user_id,
            today
        );

        const isOvertimeFlow = Boolean(payload.is_overtime_shift);

        // ====================================================================
        // กรณีที่ 1: การลงเวลา "ปฏิบัติงานนอกเวลา" (ใช้การบันทึกเวลารูปแบบพิเศษอัตโนมัติ)
        // ====================================================================
        if (isOvertimeFlow) {
            const otShiftName = payload.shift_name || `ปฏิบัติงานนอกเวลา (${shiftStartRef} - ${shiftEndRef})`;
            const otCheckIn = UIHelpers.formatTime24(payload.custom_check_in_time || shiftStartRef);
            const otCheckOut = UIHelpers.formatTime24(payload.custom_check_out_time || shiftEndRef);

            const duplicateOt = todayLogs.find(r =>
                (r.is_overtime || r.status === 'ปฏิบัติงานนอกเวลาราชการ') &&
                (
                    r.shift_name === otShiftName ||
                    (UIHelpers.formatTime24(r.check_in_time) === otCheckIn && UIHelpers.formatTime24(r.check_out_time) === otCheckOut)
                )
            );

            if (duplicateOt) {
                return {
                    success: false,
                    message: `ไม่สามารถลงเวลาซ้ำได้ เนื่องจากท่านได้ลงเวลาปฏิบัติงานนอกเวลาในช่วง "${otShiftName}" ในวันนี้ไปแล้ว`
                };
            }

            const insertOtData = {
                personnel_id: payload.personnel_id || null,
                user_id: payload.user_id || null,
                work_date: today,
                shift_name: otShiftName,
                check_in_time: otCheckIn,
                check_out_time: otCheckOut,
                check_in_photo: payload.photo_url || '',
                check_out_photo: payload.photo_url || '',
                check_in_lat: payload.lat ?? null,
                check_in_lng: payload.lng ?? null,
                check_in_location: payload.location_name || '',
                check_out_lat: payload.lat ?? null,
                check_out_lng: payload.lng ?? null,
                check_out_location: payload.location_name || '',
                status: 'ปฏิบัติงานนอกเวลาราชการ',
                remark: payload.remark || (payload.is_overnight ? 'ปฏิบัติงานนอกเวลา (ข้ามวัน)' : 'ปฏิบัติงานนอกเวลา'),
                row_color: colors.overtime || '#2563EB',
                is_overtime: true,
                is_special_request: false,
                approval_status: 'approved'
            };

            const { data: createdOt, error: otError } = await db
                .from('attendance_logs')
                .insert(insertOtData)
                .select()
                .single();

            if (otError) {
                return { success: false, message: 'ไม่สามารถบันทึกลงเวลาปฏิบัติงานนอกเวลาได้: ' + otError.message };
            }

            return {
                success: true,
                data: createdOt,
                message: `บันทึก "ปฏิบัติงานนอกเวลา" สำเร็จ (${otCheckIn} - ${otCheckOut} น.)`
            };
        }

        // ====================================================================
        // กรณีที่ 2: การลงเวลาในเวลาทำการปกติ (รูปแบบพิเศษ vs รูปแบบปกติ)
        // ====================================================================
        const regularRecordToday = todayLogs.find(r => !r.is_overtime && r.status !== 'ปฏิบัติงานนอกเวลาราชการ') || null;
        const startAllowRef = UIHelpers.formatTime24(settings.allow_checkin_start_time || '06:00');
        const startAllowMin = UIHelpers.timeToMinutes(startAllowRef);

        if (nowMin < startAllowMin) {
            return {
                success: false,
                message: `สามารถเริ่มบันทึกเวลาเข้างานปกติได้ตั้งแต่เวลา ${startAllowRef} น. เป็นต้นไป (ขณะนี้สามารถเลือกบันทึกช่วงเวลาปฏิบัติงานนอกเวลาได้)`
            };
        }

        if (regularRecordToday && regularRecordToday.check_in_time && regularRecordToday.check_out_time) {
            return {
                success: false,
                message: `วันนี้ท่านได้ลงเวลาเข้างาน (${UIHelpers.formatTime24(regularRecordToday.check_in_time)} น.) และออกงาน (${UIHelpers.formatTime24(regularRecordToday.check_out_time)} น.) ในเวลาทำการปกติครบ 1 ครั้งแล้ว`
            };
        }

        const isSingleClickMode = Boolean(payload.single_click_checkin);

        if (isSingleClickMode) {
            const checkInFinal = UIHelpers.formatTime24(payload.custom_check_in_time || shiftStartRef);
            const checkOutFinal = UIHelpers.formatTime24(payload.custom_check_out_time || shiftEndRef);

            const evalResult = AttendanceModel.evaluateOfficialStatus({
                check_in_time: checkInFinal,
                check_out_time: checkOutFinal,
                shift_name: payload.shift_name,
                is_overtime: false,
                is_special_request: false
            }, settings);

            const insertBoth = {
                personnel_id: payload.personnel_id || null,
                user_id: payload.user_id || null,
                work_date: today,
                shift_name: payload.shift_name || `เวลาราชการปกติ (${shiftStartRef} - ${shiftEndRef})`,
                check_in_time: checkInFinal,
                check_out_time: checkOutFinal,
                check_in_photo: payload.photo_url || '',
                check_out_photo: payload.photo_url || '',
                check_in_lat: payload.lat ?? null,
                check_in_lng: payload.lng ?? null,
                check_in_location: payload.location_name || '',
                check_out_lat: payload.lat ?? null,
                check_out_lng: payload.lng ?? null,
                check_out_location: payload.location_name || '',
                status: evalResult.status_label,
                remark: payload.remark || '',
                row_color: evalResult.row_color,
                is_overtime: false,
                is_special_request: false,
                approval_status: 'approved'
            };

            const { data, error } = await db
                .from('attendance_logs')
                .insert(insertBoth)
                .select()
                .single();

            if (error) {
                return { success: false, message: 'ไม่สามารถบันทึกลงเวลาได้: ' + error.message };
            }

            return {
                success: true,
                data,
                message: `บันทึกลงเวลารูปแบบพิเศษสำเร็จ! เข้างาน ${checkInFinal} น. / ออกงาน ${checkOutFinal} น. (สถานะ: ${evalResult.status_label})`
            };
        }

        // รูปแบบปกติ: บันทึกเวลาเข้างานตามเวลาจริง
        const checkInTime = UIHelpers.formatTime24(payload.custom_check_in_time || currentTime);
        const evalIn = AttendanceModel.evaluateOfficialStatus({
            check_in_time: checkInTime,
            check_out_time: null,
            shift_name: payload.shift_name,
            is_overtime: false,
            is_special_request: false
        }, settings);

        const insertIn = {
            personnel_id: payload.personnel_id || null,
            user_id: payload.user_id || null,
            work_date: today,
            shift_name: payload.shift_name || `เวลาราชการปกติ (${shiftStartRef} - ${shiftEndRef})`,
            check_in_time: checkInTime,
            check_in_photo: payload.photo_url || '',
            check_in_lat: payload.lat ?? null,
            check_in_lng: payload.lng ?? null,
            check_in_location: payload.location_name || '',
            status: evalIn.status_label,
            remark: payload.remark || '',
            row_color: evalIn.row_color,
            is_overtime: false,
            is_special_request: false,
            approval_status: 'approved'
        };

        const { data, error } = await db
            .from('attendance_logs')
            .insert(insertIn)
            .select()
            .single();

        if (error) {
            return { success: false, message: 'ไม่สามารถบันทึกลงเวลาเข้างานได้: ' + error.message };
        }

        return {
            success: true,
            data,
            message: `บันทึกลงเวลาเข้างานสำเร็จ เวลา ${checkInTime} น. (สถานะ: ${evalIn.status_label})`
        };
    }

    static async submitSpecialRequest(payload) {
        if (!payload.work_date || !payload.shift_name || !payload.remark) {
            return { success: false, message: 'กรุณาเลือกวันที่ ช่วงเวลา และระบุหมายเหตุให้ครบถ้วน' };
        }

        const settings = await SettingsModel.getSettings(false);
        const colors = settings.category_colors || Config.DEFAULT_SETTINGS.category_colors;

        const isOvertimeShift = Boolean(payload.is_overtime);
        const targetStatus = isOvertimeShift ? 'ปฏิบัติงานนอกเวลาราชการ' : 'ปฏิบัติงานปกติ';
        const targetColor = isOvertimeShift ? (colors.overtime || '#2563EB') : (colors.normal || '#007B3E');

        const checkIn24 = UIHelpers.formatTime24(payload.check_in_time || settings.standard_check_in || '08:30');
        const checkOut24 = UIHelpers.formatTime24(payload.check_out_time || settings.standard_check_out || '16:30');

        const db = DatabaseService.getInstance().client;
        const insertData = {
            personnel_id: payload.personnel_id || null,
            user_id: payload.user_id || null,
            work_date: payload.work_date,
            shift_name: payload.shift_name,
            check_in_time: checkIn24,
            check_out_time: checkOut24,
            check_in_photo: payload.photo_url || '',
            check_out_photo: payload.photo_url || '',
            check_in_lat: payload.lat ?? null,
            check_in_lng: payload.lng ?? null,
            check_in_location: payload.location_name || 'ขอลงเวลากรณีพิเศษ',
            status: targetStatus,
            remark: payload.remark,
            row_color: targetColor,
            is_overtime: isOvertimeShift,
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
            message: `ส่งคำขอลงเวลากรณีพิเศษสำเร็จ (${checkIn24} - ${checkOut24} น. สถานะ: ${targetStatus}) รอผู้ดูแลระบบอนุมัติ`
        };
    }

    static async getSpecialRequests(currentUser, statusFilter = 'pending') {
        const db = DatabaseService.getInstance().client;
        let query = db
            .from('attendance_logs')
            .select(`
                id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time,
                status, remark, row_color, is_overtime, is_special_request, approval_status, created_at,
                personnel:personnel_id (
                    id, national_id, prefix, first_name, last_name,
                    position_type, position_title, position_level,
                    organization, bureau, division, work_group
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

    static async processSpecialRequestsBulk(logIds, decision, approverUserId) {
        if (!Array.isArray(logIds) || logIds.length === 0) {
            return { success: false, count: 0, message: 'กรุณาเลือกรายการที่ต้องการดำเนินการอย่างน้อย 1 รายการ' };
        }

        const db = DatabaseService.getInstance().client;
        const settings = await SettingsModel.getSettings(false);
        const colors = settings.category_colors || Config.DEFAULT_SETTINGS.category_colors;

        const { data: targetLogs } = await db
            .from('attendance_logs')
            .select('id, is_overtime, status')
            .in('id', logIds);

        let updatedCount = 0;
        for (const item of (targetLogs || [])) {
            const isOt = Boolean(item.is_overtime || item.status === 'ปฏิบัติงานนอกเวลาราชการ');
            const newStatus = decision === 'approved'
                ? (isOt ? 'ปฏิบัติงานนอกเวลาราชการ' : 'ปฏิบัติงานปกติ')
                : 'ขาดราชการ';
            const newColor = decision === 'approved'
                ? (isOt ? (colors.overtime || '#2563EB') : (colors.normal || '#007B3E'))
                : (colors.absent_duty || '#EA580C');

            const { error } = await db
                .from('attendance_logs')
                .update({
                    approval_status: decision,
                    status: newStatus,
                    row_color: newColor,
                    approved_by: approverUserId || null,
                    approved_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', item.id);

            if (!error) updatedCount++;
        }

        const actionLabel = decision === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ';
        return {
            success: updatedCount > 0,
            count: updatedCount,
            message: `${actionLabel}รายการลงเวลากรณีพิเศษจำนวน ${updatedCount} รายการเรียบร้อยแล้ว`
        };
    }

    static getDatesBetween(startDate, endDate) {
        const dates = [];
        const start = new Date(startDate);
        const end = new Date(endDate || startDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            return [startDate];
        }

        const cursor = new Date(start);
        let guard = 0;
        while (cursor <= end && guard < 95) {
            const iso = cursor.toISOString().slice(0, 10);
            dates.push(iso);
            cursor.setDate(cursor.getDate() + 1);
            guard++;
        }
        return dates;
    }

    static async getReportRecordsByDateRange(startDate, endDate, currentUser) {
        const db = DatabaseService.getInstance().client;
        const settings = await SettingsModel.getSettings(false);
        const effectiveEnd = endDate && endDate >= startDate ? endDate : startDate;
        const dateList = AttendanceModel.getDatesBetween(startDate, effectiveEnd);

        const [personnelRes, logsRes] = await Promise.all([
            db.from('personnel')
                .select('id, national_id, prefix, first_name, last_name, position_type, position_title, position_level, organization, bureau, division, work_group')
                .order('bureau', { ascending: true })
                .order('division', { ascending: true })
                .order('work_group', { ascending: true })
                .order('first_name', { ascending: true }),
            db.from('attendance_logs')
                .select('id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time, check_in_lat, check_in_lng, check_in_location, check_out_lat, check_out_lng, check_out_location, check_in_photo, check_out_photo, status, remark, row_color, is_overtime, is_special_request, approval_status, created_at')
                .gte('work_date', startDate)
                .lte('work_date', effectiveEnd)
                .order('work_date', { ascending: true })
                .order('created_at', { ascending: true })
        ]);

        const allPersonnel = (personnelRes.data || []).filter(p =>
            !currentUser || currentUser.role === 'SuperAdmin'
                ? true
                : AuthService.canViewRecordByScope(currentUser, p)
        );

        const logsMap = new Map();
        for (const log of (logsRes.data || [])) {
            if (!log.personnel_id) continue;
            if (log.is_special_request && log.approval_status !== 'approved') continue;

            const key = `${log.personnel_id}_${log.work_date}`;
            if (!logsMap.has(key)) {
                logsMap.set(key, []);
            }
            logsMap.get(key).push(log);
        }

        const resultRows = [];

        for (const workDate of dateList) {
            for (const person of allPersonnel) {
                const key = `${person.id}_${workDate}`;
                const personDayLogs = logsMap.get(key) || [];

                if (personDayLogs.length === 0) {
                    const evalEmpty = AttendanceModel.evaluateOfficialStatus(null, settings);
                    resultRows.push(AttendanceModel.#formatReportRow(person, null, workDate, evalEmpty));
                } else {
                    for (const log of personDayLogs) {
                        const evalLog = AttendanceModel.evaluateOfficialStatus(log, settings);
                        resultRows.push(AttendanceModel.#formatReportRow(person, log, workDate, evalLog));
                    }
                }
            }
        }

        return resultRows;
    }

    static #formatReportRow(person, log, workDate, evalStatus) {
        const rowUid = log ? log.id : `${person.id}_${workDate}_empty`;
        return {
            row_uid: rowUid,
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
            work_date_thai_short: UIHelpers.formatThaiShortDate(workDate),
            work_date_thai_full: UIHelpers.formatThaiFullDate(workDate),
            shift_name: log?.shift_name || 'เวลาราชการปกติ (08:30 - 16:30)',
            check_in_time: log?.check_in_time ? UIHelpers.formatTime24(log.check_in_time) : '',
            check_out_time: log?.check_out_time ? UIHelpers.formatTime24(log.check_out_time) : '',
            check_in_lat: log?.check_in_lat ?? null,
            check_in_lng: log?.check_in_lng ?? null,
            check_in_location: log?.check_in_location || '',
            check_out_lat: log?.check_out_lat ?? null,
            check_out_lng: log?.check_out_lng ?? null,
            check_out_location: log?.check_out_location || '',
            check_in_photo: log?.check_in_photo || '',
            check_out_photo: log?.check_out_photo || '',
            remark: log?.remark || '',
            status_category: evalStatus.status_key,
            status_label: evalStatus.status_label,
            row_color: evalStatus.row_color,
            is_overtime: Boolean(log?.is_overtime || evalStatus.status_key === 'overtime'),
            is_special_request: Boolean(log?.is_special_request),
            approval_status: log?.approval_status || 'none'
        };
    }

    static async getDailyReportRecords(workDate, currentUser) {
        return AttendanceModel.getReportRecordsByDateRange(workDate, workDate, currentUser);
    }

    static async saveAdminAttendanceRecord(payload) {
        const db = DatabaseService.getInstance().client;
        const settings = await SettingsModel.getSettings(false);
        const colors = settings.category_colors || Config.DEFAULT_SETTINGS.category_colors;

        const isOvertime = payload.status === 'ปฏิบัติงานนอกเวลาราชการ';
        const statusColorMap = {
            'ปฏิบัติงานปกติ': colors.normal || '#007B3E',
            'มาสาย': colors.late || '#EAB308',
            'ขาดราชการ': colors.absent_duty || '#EA580C',
            'ไม่ลงเวลา': colors.no_checkin || '#E11D48',
            'ปฏิบัติงานนอกเวลาราชการ': colors.overtime || '#2563EB'
        };

        const recordData = {
            personnel_id: payload.personnel_id,
            work_date: payload.work_date,
            shift_name: payload.shift_name || (isOvertime ? 'ปฏิบัติงานนอกเวลาราชการ' : 'เวลาราชการปกติ (08:30 - 16:30)'),
            check_in_time: payload.check_in_time ? UIHelpers.formatTime24(payload.check_in_time) : null,
            check_out_time: payload.check_out_time ? UIHelpers.formatTime24(payload.check_out_time) : null,
            status: payload.status || 'ปฏิบัติงานปกติ',
            remark: payload.remark || '',
            row_color: payload.row_color || statusColorMap[payload.status] || '#007B3E',
            is_overtime: isOvertime,
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

    static calculateDashboardMetrics(dailyRecords) {
        const uniquePersonnelSet = new Set(
            (dailyRecords || []).map(r => r.personnel_id).filter(Boolean)
        );
        const total = uniquePersonnelSet.size;

        const normalSet = new Set();
        const lateSet = new Set();
        const absentSet = new Set();
        const overtimeSet = new Set();

        for (const r of (dailyRecords || [])) {
            if (!r.personnel_id) continue;
            if (r.status_category === 'normal') normalSet.add(r.personnel_id);
            else if (r.status_category === 'late') lateSet.add(r.personnel_id);
            else if (r.status_category === 'absent_duty' || r.status_category === 'no_checkin') absentSet.add(r.personnel_id);
            else if (r.status_category === 'overtime') overtimeSet.add(r.personnel_id);
        }

        const normalCount = normalSet.size;
        const lateCount = lateSet.size;
        const absentCount = absentSet.size;
        const overtimeCount = overtimeSet.size;

        const calcPercent = (val) => (total > 0 ? Math.min(100, Math.round((val / total) * 100)) : 0);

        return {
            total,
            categories: [
                {
                    key: 'normal',
                    label: 'ปฏิบัติงานปกติ',
                    count: normalCount,
                    percent: calcPercent(normalCount),
                    color: '#007B3E',
                    icon: 'fa-user-check'
                },
                {
                    key: 'late',
                    label: 'มาสาย',
                    count: lateCount,
                    percent: calcPercent(lateCount),
                    color: '#EAB308',
                    icon: 'fa-user-clock'
                },
                {
                    key: 'absent_duty',
                    label: 'ขาดราชการ',
                    count: absentCount,
                    percent: calcPercent(absentCount),
                    color: '#EA580C',
                    icon: 'fa-user-slash'
                },
                {
                    key: 'overtime',
                    label: 'ปฏิบัติงานนอกเวลาราชการ',
                    count: overtimeCount,
                    percent: calcPercent(overtimeCount),
                    color: '#2563EB',
                    icon: 'fa-business-time'
                }
            ]
        };
    }
}