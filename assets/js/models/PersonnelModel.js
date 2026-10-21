/**
 * @file assets/js/models/PersonnelModel.js
 * @description คลาสจัดการข้อมูลบุคลากร การสร้างบัญชีผู้ใช้อัตโนมัติ และการจัดกลุ่ม Group By 2 มุมมอง
 */

import { DatabaseService } from '../core/DatabaseService.js';
import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';

export class PersonnelModel {
    /**
     * ดึงข้อมูลบุคลากรทั้งหมดตามขอบเขตการมองเห็นของผู้ใช้งานที่ล็อกอินอยู่
     * @param {Object|null} currentUser ข้อมูลผู้ใช้ที่ล็อกอิน
     * @returns {Promise<Array<Object>>}
     */
    static async getAll(currentUser = null) {
        const db = DatabaseService.getInstance().client;
        const { data, error } = await db
            .from('personnel')
            .select('*')
            .order('bureau', { ascending: true })
            .order('division', { ascending: true })
            .order('work_group', { ascending: true })
            .order('first_name', { ascending: true });

        if (error) {
            console.error('Error fetching personnel:', error);
            return [];
        }

        const list = data || [];
        if (!currentUser || currentUser.role === 'SuperAdmin') {
            return list;
        }

        return list.filter(item => AuthService.canViewRecordByScope(currentUser, item));
    }

    /**
     * ดึงข้อมูลบุคลากรรายบุคคลตาม ID
     * @param {string} id UUID ของบุคลากร
     * @returns {Promise<Object|null>}
     */
    static async getById(id) {
        const db = DatabaseService.getInstance().client;
        const { data, error } = await db
            .from('personnel')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching personnel by id:', error);
            return null;
        }
        return data;
    }

    /**
     * เพิ่มข้อมูลบุคลากรใหม่ พร้อมตัวเลือก "เพิ่มบัญชีผู้ใช้อัตโนมัติ" (V2.1)
     * หาก autoCreateAccount = true ระบบจะสร้างบัญชีผู้ใช้โดยใช้:
     * - Username: หมายเลขบัตรประชาชน 13 หลัก
     * - Password: หมายเลข 6 ตัวท้ายของบัตรประชาชน
     * - Role: User
     * @param {Object} payload ข้อมูลบุคลากร
     * @param {boolean} autoCreateAccount ติ๊กถูกเพิ่มบัญชีผู้ใช้อัตโนมัติหรือไม่
     * @returns {Promise<{success: boolean, data?: Object, accountCreated?: boolean, message: string}>}
     */
    static async create(payload, autoCreateAccount = false) {
        const cleanNationalId = String(payload.national_id || '').replace(/[\s-]/g, '');

        // ตรวจสอบเลขบัตรประชาชนกรณีกรอกข้อมูล หรือกรณีเลือกสร้างบัญชีอัตโนมัติ
        if (autoCreateAccount && cleanNationalId.length !== 13) {
            return {
                success: false,
                message: 'กรณีเลือก "เพิ่มบัญชีผู้ใช้อัตโนมัติ" กรุณากรอกหมายเลขบัตรประจำตัวประชาชนให้ครบ 13 หลัก'
            };
        }

        if (cleanNationalId) {
            const idValidation = UIHelpers.validateThaiNationalId(cleanNationalId, false);
            if (!idValidation.valid) {
                return { success: false, message: idValidation.message };
            }
        }

        const db = DatabaseService.getInstance().client;

        // บันทึกข้อมูลลงตาราง personnel
        const insertPayload = {
            national_id: cleanNationalId || null,
            prefix: String(payload.prefix || '').trim(),
            first_name: String(payload.first_name || '').trim(),
            last_name: String(payload.last_name || '').trim(),
            position_type: String(payload.position_type || '').trim(),
            position_title: String(payload.position_title || '').trim(),
            position_level: String(payload.position_level || '').trim(),
            organization: String(payload.organization || 'กรุงเทพมหานคร').trim(),
            bureau: String(payload.bureau || '').trim(),
            division: String(payload.division || '').trim(),
            work_group: String(payload.work_group || '').trim(),
            badge_color: payload.badge_color || '#00744B'
        };

        const { data: createdPerson, error: personErr } = await db
            .from('personnel')
            .insert(insertPayload)
            .select()
            .single();

        if (personErr) {
            console.error('Create personnel error:', personErr);
            if (personErr.code === '23505') {
                return { success: false, message: 'หมายเลขบัตรประจำตัวประชาชนนี้มีอยู่ในระบบแล้ว' };
            }
            return { success: false, message: 'ไม่สามารถเพิ่มข้อมูลบุคลากรได้: ' + personErr.message };
        }

        let accountCreated = false;
        let autoPassword = '';

        // สร้างบัญชีผู้ใช้อัตโนมัติตามข้อกำหนด V2.1
        if (autoCreateAccount && cleanNationalId.length === 13) {
            autoPassword = UIHelpers.getLast6DigitsFromNationalId(cleanNationalId);
            const fullName = `${insertPayload.prefix}${insertPayload.first_name} ${insertPayload.last_name}`.trim();

            const userPayload = {
                personnel_id: createdPerson.id,
                username: cleanNationalId,
                password: autoPassword,
                full_name: fullName,
                national_id: cleanNationalId,
                role: 'User',
                visibility_level: 'none',
                scope_bureau: insertPayload.bureau,
                scope_division: insertPayload.division,
                is_active: true
            };

            const { error: userErr } = await db
                .from('user_accounts')
                .insert(userPayload);

            if (!userErr) {
                accountCreated = true;
            } else {
                console.warn('Auto user account creation warning:', userErr);
            }
        }

        const msg = accountCreated
            ? `เพิ่มข้อมูลบุคลากรและสร้างบัญชีผู้ใช้อัตโนมัติสำเร็จ (Username: ${cleanNationalId} / รหัสผ่าน: ${autoPassword})`
            : 'เพิ่มข้อมูลบุคลากรเรียบร้อยแล้ว';

        return {
            success: true,
            data: createdPerson,
            accountCreated,
            message: msg
        };
    }

    /**
     * แก้ไขข้อมูลบุคลากร และอัปเดตชื่อ-สกุล/สังกัดในตาราง user_accounts ที่ผูกไว้ให้ตรงกัน
     * @param {string} id UUID ของบุคลากร
     * @param {Object} payload ข้อมูลที่แก้ไข
     * @returns {Promise<{success: boolean, data?: Object, message: string}>}
     */
    static async update(id, payload) {
        const cleanNationalId = String(payload.national_id || '').replace(/[\s-]/g, '');
        if (cleanNationalId) {
            const idValidation = UIHelpers.validateThaiNationalId(cleanNationalId, false);
            if (!idValidation.valid) {
                return { success: false, message: idValidation.message };
            }
        }

        const db = DatabaseService.getInstance().client;
        const updatePayload = {
            national_id: cleanNationalId || null,
            prefix: String(payload.prefix || '').trim(),
            first_name: String(payload.first_name || '').trim(),
            last_name: String(payload.last_name || '').trim(),
            position_type: String(payload.position_type || '').trim(),
            position_title: String(payload.position_title || '').trim(),
            position_level: String(payload.position_level || '').trim(),
            organization: String(payload.organization || 'กรุงเทพมหานคร').trim(),
            bureau: String(payload.bureau || '').trim(),
            division: String(payload.division || '').trim(),
            work_group: String(payload.work_group || '').trim(),
            badge_color: payload.badge_color || '#00744B',
            updated_at: new Date().toISOString()
        };

        const { data, error } = await db
            .from('personnel')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { success: false, message: 'ไม่สามารถแก้ไขข้อมูลบุคลากรได้: ' + error.message };
        }

        // ซิงค์ชื่อ-นามสกุล และเลขบัตรประชาชนไปยังบัญชีผู้ใช้ที่ผูกอยู่
        const fullName = `${updatePayload.prefix}${updatePayload.first_name} ${updatePayload.last_name}`.trim();
        await db
            .from('user_accounts')
            .update({
                full_name: fullName,
                national_id: cleanNationalId || null,
                 updated_at: new Date().toISOString()
            })
            .eq('personnel_id', id);

        return {
            success: true,
            data,
            message: 'อัปเดตข้อมูลบุคลากรเรียบร้อยแล้ว'
        };
    }

    /**
     * ลบข้อมูลบุคลากร
     * @param {string} id UUID ของบุคลากร
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async delete(id) {
        const db = DatabaseService.getInstance().client;
        const { error } = await db
            .from('personnel')
            .delete()
            .eq('id', id);

        if (error) {
            return { success: false, message: 'ไม่สามารถลบข้อมูลบุคลากรได้: ' + error.message };
        }
        return { success: true, message: 'ลบข้อมูลบุคลากรเรียบร้อยแล้ว' };
    }

    /**
     * จัดกลุ่มข้อมูลบุคลากรสำหรับแสดงในตาราง 2 มุมมอง (Group By)
     * - มุมมองที่ 1 ('division'): สำนักงาน/กอง > ส่วน/ฝ่าย
     * - มุมมองที่ 2 ('group'): สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน
     * @param {Array<Object>} personnelList
     * @param {'division'|'group'} viewMode
     * @returns {Object} โครงสร้าง Tree สำหรับเรนเดอร์ตาราง
     */
    static groupPersonnel(personnelList, viewMode = 'division') {
        const grouped = {};

        for (const person of personnelList) {
            const bureau = person.bureau || 'ไม่ระบุสำนักงาน/กอง';
            const division = person.division || 'ไม่ระบุส่วน/ฝ่าย';
            const workGroup = person.work_group || 'ไม่ระบุกลุ่มงาน';

            if (!grouped[bureau]) {
                grouped[bureau] = {};
            }
            if (!grouped[bureau][division]) {
                grouped[bureau][division] = viewMode === 'group' ? {} : [];
            }

            if (viewMode === 'group') {
                if (!grouped[bureau][division][workGroup]) {
                    grouped[bureau][division][workGroup] = [];
                }
                grouped[bureau][division][workGroup].push(person);
            } else {
                grouped[bureau][division].push(person);
            }
        }

        return grouped;
    }

    /**
     * นำเข้าข้อมูลบุคลากรจำนวนมากจากไฟล์ Excel รองรับภาษาไทย UTF-8
     * พร้อมสร้างบัญชีผู้ใช้อัตโนมัติหากมีเลขบัตรประชาชน 13 หลักและเปิดใช้งาน autoCreateAccount
     * @param {Array<Object>} excelRows
     * @param {boolean} autoCreateAccount
     * @returns {Promise<{success: boolean, importedCount: number, accountCount: number, message: string}>}
     */
    static async bulkImportFromExcel(excelRows, autoCreateAccount = true) {
        if (!Array.isArray(excelRows) || excelRows.length === 0) {
            return { success: false, importedCount: 0, accountCount: 0, message: 'ไม่พบข้อมูลในไฟล์ Excel ที่นำเข้า' };
        }

        let importedCount = 0;
        let accountCount = 0;

        for (const row of excelRows) {
            const nationalId = String(row['เลขบัตรประชาชน'] || row['national_id'] || '').replace(/[\s-]/g, '');
            const prefix = String(row['คำนำหน้า'] || row['prefix'] || 'นาย').trim();
            const firstName = String(row['ชื่อ'] || row['first_name'] || '').trim();
            const lastName = String(row['นามสกุล'] || row['last_name'] || '').trim();

            if (!firstName || !lastName) continue;

            const payload = {
                national_id: nationalId,
                prefix,
                first_name: firstName,
                last_name: lastName,
                position_type: String(row['ประเภทตำแหน่ง'] || row['position_type'] || 'ประเภททั่วไป').trim(),
                position_title: String(row['ตำแหน่ง'] || row['position_title'] || 'เจ้าพนักงานเทศกิจ').trim(),
                position_level: String(row['ระดับ'] || row['position_level'] || 'ปฏิบัติงาน').trim(),
                organization: String(row['หน่วยงาน'] || row['organization'] || 'กรุงเทพมหานคร').trim(),
                bureau: String(row['สำนักงาน/กอง'] || row['bureau'] || 'สำนักเทศกิจ').trim(),
                division: String(row['ส่วน/ฝ่าย'] || row['division'] || 'สำนักงานเลขานุการ').trim(),
                work_group: String(row['กลุ่มงาน'] || row['work_group'] || '').trim(),
                badge_color: String(row['สีป้ายกำกับ'] || row['badge_color'] || '#00744B').trim()
            };

            const shouldAutoCreate = autoCreateAccount && nationalId.length === 13;
            const res = await PersonnelModel.create(payload, shouldAutoCreate);
            if (res.success) {
                importedCount++;
                if (res.accountCreated) accountCount++;
            }
        }

        return {
            success: importedCount > 0,
            importedCount,
            accountCount,
            message: `นำเข้าข้อมูลบุคลากรสำเร็จ ${importedCount} รายการ (สร้างบัญชีผู้ใช้อัตโนมัติ ${accountCount} บัญชี)`
        };
    }

    /**
     * สร้างข้อมูลตัวอย่างสำหรับดาวน์โหลด Template Excel ข้อมูลบุคลากร
     * @returns {Array<Object>}
     */
    static getExcelTemplateRows() {
        return [
            {
                'เลขบัตรประชาชน': '1231254684532',
                'คำนำหน้า': 'นาย',
                'ชื่อ': 'สมชาย',
                'นามสกุล': 'สายตรวจ',
                'ประเภทตำแหน่ง': 'ประเภททั่วไป',
                'ตำแหน่ง': 'เจ้าพนักงานเทศกิจ',
                'ระดับ': 'ปฏิบัติงาน',
                'หน่วยงาน': 'กรุงเทพมหานคร',
                'สำนักงาน/กอง': 'สำนักเทศกิจ',
                'ส่วน/ฝ่าย': 'กองตรวจและปฏิบัติการพื้นที่ 1',
                'กลุ่มงาน': 'กลุ่มงานตรวจและปฏิบัติการ 1',
                'สีป้ายกำกับ': '#059669'
            }
        ];
    }
}