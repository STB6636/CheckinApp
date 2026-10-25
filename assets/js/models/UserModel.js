/**
 * @file assets/js/models/UserModel.js
 * @description คลาสจัดการบัญชีผู้ใช้งาน การผูกข้อมูลบุคลากร ขอบเขตการมองเห็น และการอนุมัติรีเซ็ตรหัสผ่าน
 */

import { DatabaseService } from '../core/DatabaseService.js';
import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';

export class UserModel {
    /**
     * ดึงรายการบัญชีผู้ใช้งานทั้งหมดตามสิทธิ์และขอบเขตการมองเห็นของผู้ดูแลระบบ
     * กฎ V2.1: Admin จะไม่เห็นบัญชีระดับ SuperAdmin และเห็นเฉพาะบุคลากรในขอบเขตของตน
     * @param {Object} currentUser ผู้ใช้ที่ล็อกอินอยู่
     * @returns {Promise<Array<Object>>}
     */
    static async getAll(currentUser) {
        const db = DatabaseService.getInstance().client;
        const { data, error } = await db
            .from('user_accounts')
            .select(`
                *,
                personnel:personnel_id (
                    id, national_id, prefix, first_name, last_name,
                    position_type, position_title, position_level,
                    organization, bureau, division, work_group, badge_color
                )
            `)
            .order('password_reset_requested', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user_accounts:', error);
            return [];
        }

        const accounts = (data || []).map(acc => ({ ...acc, id: String(acc.id) }));
        if (!currentUser || currentUser.role === 'SuperAdmin') {
            return accounts;
        }

        // กรณีเป็น Admin: ห้ามเห็นบัญชีระดับ SuperAdmin และกรองตามขอบเขตการมองเห็น
        return accounts.filter(acc => {
            if (acc.role === 'SuperAdmin') return false;

            const recordBureau = acc.personnel?.bureau || acc.scope_bureau || '';
            const recordDivision = acc.personnel?.division || acc.scope_division || '';

            return AuthService.canViewRecordByScope(currentUser, {
                bureau: recordBureau,
                division: recordDivision
            });
        });
    }

    /**
     * ดึงรายการคำขอรีเซ็ตรหัสผ่านที่รออนุมัติ (สำหรับแสดงที่กระดิ่งแจ้งเตือนของ SuperAdmin/Admin)
     * @param {Object} currentUser
     * @returns {Promise<Array<Object>>}
     */
    static async getPendingPasswordResetRequests(currentUser) {
        const allVisible = await UserModel.getAll(currentUser);
        return allVisible.filter(acc => acc.password_reset_requested === true);
    }

    /**
     * สร้างบัญชีผู้ใช้งานใหม่และผูกข้อมูลบุคลากร
     * @param {Object} payload ข้อมูลฟอร์มบัญชีผู้ใช้
     * @param {Object} currentUser ผู้ดูแลระบบที่ทำรายการ
     * @returns {Promise<{success: boolean, data?: Object, message: string}>}
     */
    static async create(payload, currentUser) {
        // กฎ V2.1: Admin ไม่สามารถแต่งตั้งสิทธิ์เกินกว่า Admin ได้
        if (currentUser?.role === 'Admin' && payload.role === 'SuperAdmin') {
            return {
                success: false,
                message: 'ผู้ดูแลระบบระดับ Admin ไม่สามารถแต่งตั้งสิทธิ์บัญชีระดับ SuperAdmin ได้'
            };
        }

        const username = String(payload.username || '').trim();
        const password = String(payload.password || '').trim();
        const confirmPassword = String(payload.confirm_password ?? password).trim();

        if (!username || !password) {
            return { success: false, message: 'กรุณากรอกชื่อบัญชีผู้ใช้งานและรหัสผ่านให้ครบถ้วน' };
        }

        if (password !== confirmPassword) {
            return { success: false, message: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน' };
        }

        // กำหนดระดับการมองเห็น (Visibility Scope)
        let visibilityLevel = 'none';
        if (payload.role === 'SuperAdmin') {
            visibilityLevel = 'all';
        } else if (payload.role === 'Admin') {
            visibilityLevel = payload.visibility_level === 'bureau' ? 'bureau' : 'division';
        }

        const db = DatabaseService.getInstance().client;

        const insertData = {
            personnel_id: payload.personnel_id || null,
            username,
            password,
            full_name: String(payload.full_name || '').trim(),
            national_id: String(payload.national_id || '').replace(/[\s-]/g, '') || null,
            role: payload.role || 'User',
            visibility_level: visibilityLevel,
            scope_bureau: String(payload.scope_bureau || '').trim(),
            scope_division: String(payload.scope_division || '').trim(),
            is_active: true
        };

        const { data, error } = await db
            .from('user_accounts')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return { success: false, message: 'ชื่อบัญชีผู้ใช้งาน (Username) นี้มีอยู่ในระบบแล้ว' };
            }
            return { success: false, message: 'ไม่สามารถสร้างบัญชีผู้ใช้งานได้: ' + error.message };
        }

        return {
            success: true,
            data,
            message: 'เพิ่มบัญชีผู้ใช้งานและผูกข้อมูลบุคลากรเรียบร้อยแล้ว'
        };
    }

    /**
     * แก้ไขข้อมูลบัญชีผู้ใช้งาน
     * @param {string} id UUID ของบัญชีผู้ใช้งาน
     * @param {Object} payload ข้อมูลที่ต้องการแก้ไข
     * @param {Object} currentUser ผู้ดูแลระบบที่ทำรายการ
     * @returns {Promise<{success: boolean, data?: Object, message: string}>}
     */
    static async update(id, payload, currentUser) {
        if (currentUser?.role === 'Admin' && payload.role === 'SuperAdmin') {
            return {
                success: false,
                message: 'ผู้ดูแลระบบระดับ Admin ไม่สามารถแก้ไขสิทธิ์บัญชีให้เป็น SuperAdmin ได้'
            };
        }

        if (payload.password && payload.confirm_password && payload.password !== payload.confirm_password) {
            return { success: false, message: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน' };
        }

        let visibilityLevel = 'none';
        if (payload.role === 'SuperAdmin') {
            visibilityLevel = 'all';
        } else if (payload.role === 'Admin') {
            visibilityLevel = payload.visibility_level === 'bureau' ? 'bureau' : 'division';
        }

        const updateData = {
            personnel_id: payload.personnel_id || null,
            username: String(payload.username || '').trim(),
            full_name: String(payload.full_name || '').trim(),
            national_id: String(payload.national_id || '').replace(/[\s-]/g, '') || null,
            role: payload.role || 'User',
            visibility_level: visibilityLevel,
            scope_bureau: String(payload.scope_bureau || '').trim(),
            scope_division: String(payload.scope_division || '').trim(),
            updated_at: new Date().toISOString()
        };

        if (payload.password && String(payload.password).trim() !== '') {
            updateData.password = String(payload.password).trim();
        }

        const db = DatabaseService.getInstance().client;
        const { data, error } = await db
            .from('user_accounts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { success: false, message: 'ไม่สามารถแก้ไขบัญชีผู้ใช้งานได้: ' + error.message };
        }

        return {
            success: true,
            data,
            message: 'อัปเดตข้อมูลบัญชีผู้ใช้งานเรียบร้อยแล้ว'
        };
    }

    /**
     * ลบบัญชีผู้ใช้งาน
     * @param {string} id UUID ของบัญชีผู้ใช้งาน
     * @param {Object} currentUser ผู้ดูแลระบบที่ทำรายการ
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async delete(id, currentUser) {
        const db = DatabaseService.getInstance().client;

        // ตรวจสอบก่อนลบว่า Admin พยายามลบบัญชี SuperAdmin หรือไม่
        const { data: target } = await db
            .from('user_accounts')
            .select('id, role')
            .eq('id', id)
            .maybeSingle();

        if (currentUser?.role === 'Admin' && target?.role === 'SuperAdmin') {
            return { success: false, message: 'คุณไม่มีสิทธิ์ลบบัญชีระดับ SuperAdmin' };
        }

        const { error } = await db
            .from('user_accounts')
            .delete()
            .eq('id', id);

        if (error) {
            return { success: false, message: 'ไม่สามารถลบบัญชีผู้ใช้งานได้: ' + error.message };
        }

        return { success: true, message: 'ลบบัญชีผู้ใช้งานเรียบร้อยแล้ว' };
    }

    /**
     * อนุมัติ หรือ ไม่อนุมัติ คำขอเปลี่ยนรหัสผ่าน (กรณีลืมรหัสผ่านใน V2.1)
     * เมื่ออนุมัติแล้ว รหัสผ่านของ User จะถูกรีเซ็ตกลับเป็นหมายเลข 6 ตัวท้ายของหมายเลขบัตรประชาชน
     * @param {string} userId UUID ของบัญชีผู้ใช้
     * @param {boolean} isApproved true = อนุมัติ, false = ไม่อนุมัติ
     * @returns {Promise<{success: boolean, resetPasswordTo?: string, message: string}>}
     */
    static async processPasswordResetRequest(userId, isApproved) {
        const db = DatabaseService.getInstance().client;

        const { data: account, error: fetchErr } = await db
            .from('user_accounts')
            .select(`
                id, username, full_name, national_id,
                personnel:personnel_id ( national_id )
            `)
            .eq('id', userId)
            .maybeSingle();

        if (fetchErr || !account) {
            return { success: false, message: 'ไม่พบข้อมูลบัญชีผู้ใช้งานที่ต้องการดำเนินการ' };
        }

        if (!isApproved) {
            const { error: rejectErr } = await db
                .from('user_accounts')
                .update({
                    password_reset_requested: false,
                    password_reset_status: 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (rejectErr) {
                return { success: false, message: 'ไม่สามารถบันทึกผลการไม่อนุมัติได้' };
            }
            return { success: true, message: `ไม่อนุมัติคำขอรีเซ็ตรหัสผ่านของ "${account.full_name}" เรียบร้อยแล้ว` };
        }

        // ดึงหมายเลขบัตรประชาชน 13 หลักจากบัญชี หรือจากข้อมูลบุคลากรที่ผูกไว้ หรือจาก username
        const nationalId = account.national_id
            || account.personnel?.national_id
            || (/^\d{13}$/.test(account.username) ? account.username : '');

        if (!nationalId || nationalId.length < 6) {
            return {
                success: false,
                message: 'ไม่พบหมายเลขบัตรประชาชน 13 หลักของบัญชีนี้ จึงไม่สามารถรีเซ็ตรหัสผ่านเป็นเลข 6 ตัวท้ายได้ กรุณาแก้ไขรหัสผ่านให้ผู้ใช้โดยตรง'
            };
        }

        const newPasswordLast6 = UIHelpers.getLast6DigitsFromNationalId(nationalId);

        const { error: approveErr } = await db
            .from('user_accounts')
            .update({
                password: newPasswordLast6,
                password_reset_requested: false,
                password_reset_status: 'approved',
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (approveErr) {
            return { success: false, message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' };
        }

        return {
            success: true,
            resetPasswordTo: newPasswordLast6,
            message: `อนุมัติสำเร็จ! รหัสผ่านของ "${account.full_name}" ถูกรีเซ็ตกลับเป็นหมายเลข 6 ตัวท้ายของบัตรประชาชน (${newPasswordLast6}) เรียบร้อยแล้ว`
        };
    }

    /**
     * นำเข้าบัญชีผู้ใช้งานจากไฟล์ Excel (รองรับ UTF-8)
     * @param {Array<Object>} excelRows
     * @param {Object} currentUser
     * @returns {Promise<{success: boolean, importedCount: number, message: string}>}
     */
    static async bulkImportFromExcel(excelRows, currentUser) {
        if (!Array.isArray(excelRows) || excelRows.length === 0) {
            return { success: false, importedCount: 0, message: 'ไม่พบข้อมูลในไฟล์ Excel' };
        }

        let importedCount = 0;
        for (const row of excelRows) {
            const username = String(row['ชื่อบัญชีผู้ใช้ (Username)'] || row['username'] || '').trim();
            const password = String(row['รหัสผ่าน (Password)'] || row['password'] || '').trim();
            const fullName = String(row['ชื่อ-นามสกุล'] || row['full_name'] || '').trim();
            const nationalId = String(row['เลขบัตรประชาชน'] || row['national_id'] || '').replace(/[\s-]/g, '');
            let role = String(row['บทบาท (Role)'] || row['role'] || 'User').trim();

            if (!username || !password || !fullName) continue;
            if (!['SuperAdmin', 'Admin', 'User'].includes(role)) role = 'User';
            if (currentUser?.role === 'Admin' && role === 'SuperAdmin') role = 'Admin';

            const visibilityLevel = String(row['ระดับการมองเห็น'] || row['visibility_level'] || (role === 'Admin' ? 'division' : 'none')).trim();
            const scopeBureau = String(row['สำนักงาน/กอง'] || row['scope_bureau'] || currentUser?.scope_bureau || 'สำนักเทศกิจ').trim();
            const scopeDivision = String(row['ส่วน/ฝ่าย'] || row['scope_division'] || currentUser?.scope_division || '').trim();

            const res = await UserModel.create({
                username,
                password,
                confirm_password: password,
                full_name: fullName,
                national_id: nationalId,
                role,
                visibility_level: visibilityLevel,
                scope_bureau: scopeBureau,
                scope_division: scopeDivision
            }, currentUser);

            if (res.success) importedCount++;
        }

        return {
            success: importedCount > 0,
            importedCount,
            message: `นำเข้าบัญชีผู้ใช้งานสำเร็จ ${importedCount} รายการ`
        };
    }

    /**
     * สร้างข้อมูลตัวอย่างสำหรับดาวน์โหลด Template Excel บัญชีผู้ใช้งาน
     * @returns {Array<Object>}
     */
    static getExcelTemplateRows() {
        return [
            {
                'ชื่อบัญชีผู้ใช้ (Username)': '1231254684532',
                'รหัสผ่าน (Password)': '684532',
                'ชื่อ-นามสกุล': 'นายสมชาย สายตรวจ',
                'เลขบัตรประชาชน': '1231254684532',
                'บทบาท (Role)': 'User',
                'ระดับการมองเห็น': 'none',
                'สำนักงาน/กอง': 'สำนักเทศกิจ',
                'ส่วน/ฝ่าย': 'กองตรวจและปฏิบัติการพื้นที่ 1'
            }
        ];
    }
}