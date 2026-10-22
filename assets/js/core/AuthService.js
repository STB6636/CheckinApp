/**
 * @file assets/js/core/AuthService.js
 * @description คลาสจัดการการยืนยันตัวตน สิทธิ์การเข้าถึง (RBAC) การเปลี่ยนรหัสผ่าน และการขอรีเซ็ตรหัสผ่าน
 */

import { Config } from './Config.js';
import { DatabaseService } from './DatabaseService.js';
import { UIHelpers } from './UIHelpers.js';

export class AuthService {
    /**
     * ดึงข้อมูลผู้ใช้งานที่ล็อกอินอยู่ในปัจจุบันจาก Session/LocalStorage
     * @returns {Object|null}
     */
    static getCurrentUser() {
        try {
            const raw = localStorage.getItem(Config.STORAGE_KEYS.SESSION_USER);
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.error('Failed to read session user:', err);
            return null;
        }
    }

    /**
     * บันทึกข้อมูลผู้ใช้งานลงใน Session
     * @param {Object} userObj
     */
    static setCurrentUser(userObj) {
        localStorage.setItem(Config.STORAGE_KEYS.SESSION_USER, JSON.stringify(userObj));
    }

    /**
     * ล้างข้อมูล Session เมื่อออกจากระบบ
     */
    static clearSession() {
        localStorage.removeItem(Config.STORAGE_KEYS.SESSION_USER);
    }

    /**
     * เข้าสู่ระบบสำหรับลงเวลาปฏิบัติราชการ หรือเข้าสู่ระบบผู้ดูแลระบบหลังบ้าน
     * @param {string} username ชื่อบัญชีผู้ใช้ (หรือเลขบัตรประชาชน 13 หลัก)
     * @param {string} password รหัสผ่าน
     * @param {'checkin'|'admin'} loginMode โหมดการเข้าสู่ระบบ ('checkin' สำหรับลงเวลา, 'admin' สำหรับผู้ดูแลระบบ)
     * @returns {Promise<{success: boolean, user?: Object, redirectUrl?: string, message: string}>}
     */
    static async login(username, password, loginMode = 'checkin') {
        const db = DatabaseService.getInstance().client;
        const cleanUsername = String(username || '').trim();
        const cleanPassword = String(password || '').trim();

        if (!cleanUsername || !cleanPassword) {
            return { success: false, message: 'กรุณากรอกชื่อบัญชีผู้ใช้งานและรหัสผ่านให้ครบถ้วน' };
        }

        const { data: user, error } = await db
            .from('user_accounts')
            .select(`
                *,
                personnel:personnel_id (
                    id, national_id, prefix, first_name, last_name,
                    position_type, position_title, position_level,
                    organization, bureau, division, work_group, badge_color
                )
            `)
            .eq('username', cleanUsername)
            .eq('password', cleanPassword)
            .eq('is_active', true)
            .maybeSingle();

        if (error) {
            console.error('Login query error:', error);
            return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล กรุณาลองใหม่อีกครั้ง' };
        }

        if (!user) {
            return { success: false, message: 'ชื่อบัญชีผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' };
        }

        // ตรวจสอบสิทธิ์กรณีต้องการเข้าสู่ระบบผู้ดูแลระบบหลังบ้าน (User ห้ามเข้าหลังบ้านเด็ดขาด)
        if (loginMode === 'admin' && user.role === 'User') {
            return {
                success: false,
                message: 'บัญชีระดับผู้ใช้งานทั่วไป (User) สามารถเข้าสู่ระบบเพื่อบันทึกเวลาปฏิบัติราชการได้อย่างเดียว ไม่สามารถเข้าสู่ระบบผู้ดูแลระบบหลังบ้านได้'
            };
        }

        // จัดเก็บข้อมูลลงใน Session
        const sessionPayload = {
            id: user.id,
            personnel_id: user.personnel_id,
            username: user.username,
            full_name: user.full_name,
            national_id: user.national_id || (user.personnel ? user.personnel.national_id : ''),
            role: user.role,
            visibility_level: user.visibility_level,
            scope_bureau: user.scope_bureau || (user.personnel ? user.personnel.bureau : ''),
            scope_division: user.scope_division || (user.personnel ? user.personnel.division : ''),
            personnel: user.personnel || null,
            login_at: new Date().toISOString()
        };

        AuthService.setCurrentUser(sessionPayload);

        const redirectUrl = loginMode === 'admin' ? 'dashboard.html' : 'checkin.html';
        return {
            success: true,
            user: sessionPayload,
            redirectUrl,
            message: 'เข้าสู่ระบบสำเร็จ'
        };
    }

    /**
     * เปลี่ยนรหัสผ่านด้วยตนเองจากหน้า Login > เปลี่ยนรหัสผ่าน
     * @param {string} username ชื่อผู้ใช้ หรือเลขบัตรประชาชน 13 หลัก
     * @param {string} oldPassword รหัสผ่านเก่า
     * @param {string} newPassword รหัสผ่านใหม่
     * @param {string} confirmPassword ยืนยันรหัสผ่านใหม่
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async changePassword(username, oldPassword, newPassword, confirmPassword) {
        const cleanUser = String(username || '').trim();
        const cleanOld = String(oldPassword || '').trim();
        const cleanNew = String(newPassword || '').trim();
        const cleanConfirm = String(confirmPassword || '').trim();

        if (!cleanUser || !cleanOld || !cleanNew || !cleanConfirm) {
            return { success: false, message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' };
        }

        if (cleanNew !== cleanConfirm) {
            return { success: false, message: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านใหม่ไม่ตรงกัน' };
        }

        if (cleanNew.length < 4) {
            return { success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' };
        }

        const db = DatabaseService.getInstance().client;

        // ตรวจสอบชื่อผู้ใช้และรหัสผ่านเก่า
        const { data: existingUser, error: findErr } = await db
            .from('user_accounts')
            .select('id, username')
            .eq('username', cleanUser)
            .eq('password', cleanOld)
            .maybeSingle();

        if (findErr) {
            return { success: false, message: 'ไม่สามารถตรวจสอบข้อมูลกับฐานข้อมูลได้' };
        }

        if (!existingUser) {
            return { success: false, message: 'ชื่อผู้ใช้งานหรือรหัสผ่านเก่าไม่ถูกต้อง' };
        }

        // อัปเดตรหัสผ่านใหม่และล้างสถานะคำขอรีเซ็ต
        const { error: updateErr } = await db
            .from('user_accounts')
            .update({
                password: cleanNew,
                password_reset_requested: false,
                password_reset_status: 'none',
                updated_at: new Date().toISOString()
            })
            .eq('id', existingUser.id);

        if (updateErr) {
            return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกรหัสผ่านใหม่' };
        }

        return { success: true, message: 'เปลี่ยนรหัสผ่านใหม่สำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่' };
    }

    /**
     * ส่งคำขอลืมรหัสผ่านจากหน้า Login > ลืมรหัสผ่าน โดยใช้หมายเลขบัตรประจำตัวประชาชน 13 หลัก
     * @param {string} nationalId หมายเลขบัตรประจำตัวประชาชน 13 หลัก
     * @returns {Promise<{success: boolean, message: string}>}
     */
    static async requestPasswordResetByNationalId(nationalId) {
        const cleanId = String(nationalId || '').replace(/[\s-]/g, '');
        const check = UIHelpers.validateThaiNationalId(cleanId, false);
        if (!check.valid || cleanId.length !== 13) {
            return { success: false, message: 'กรุณากรอกหมายเลขบัตรประจำตัวประชาชน 13 หลักให้ถูกต้อง' };
        }

        const db = DatabaseService.getInstance().client;

        // ค้นหาบัญชีผู้ใช้จากเลขบัตรประชาชน หรือ username ที่ตรงกับเลขบัตร 13 หลัก
        const { data: accounts, error: searchErr } = await db
            .from('user_accounts')
            .select('id, username, full_name, national_id')
            .or(`national_id.eq.${cleanId},username.eq.${cleanId}`)
            .limit(1);

        if (searchErr) {
            return { success: false, message: 'เกิดข้อผิดพลาดในการค้นหาข้อมูลในระบบ' };
        }

        if (!accounts || accounts.length === 0) {
            return { success: false, message: 'ไม่พบบัญชีผู้ใช้งานที่ผูกกับหมายเลขบัตรประชาชน 13 หลักนี้ในระบบ' };
        }

        const targetAccount = accounts[0];

        const { error: updateErr } = await db
            .from('user_accounts')
            .update({
                password_reset_requested: true,
                password_reset_requested_at: new Date().toISOString(),
                password_reset_status: 'pending',
                updated_at: new Date().toISOString()
            })
            .eq('id', targetAccount.id);

        if (updateErr) {
            return { success: false, message: 'ไม่สามารถส่งคำขอเปลี่ยนรหัสผ่านได้ในขณะนี้' };
        }

        return {
            success: true,
            message: `ส่งคำขอรีเซ็ตรหัสผ่านของ "${targetAccount.full_name}" เรียบร้อยแล้ว กรุณารอผู้ดูแลระบบ (SuperAdmin/Admin) อนุมัติ เมื่ออนุมัติแล้วรหัสผ่านจะถูกรีเซ็ตเป็นหมายเลข 6 ตัวท้ายของบัตรประชาชน`
        };
    }

    /**
     * ตรวจสอบสิทธิ์การเข้าถึงหน้าเว็บ (Route Guard)
     * @param {Array<'SuperAdmin'|'Admin'|'User'>} allowedRoles บทบาทที่อนุญาตให้เข้าหน้านี้
     * @returns {Object|null} ข้อมูลผู้ใช้หากมีสิทธิ์
     */
    static requireAuth(allowedRoles = ['SuperAdmin', 'Admin', 'User']) {
        const user = AuthService.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return null;
        }
        if (!allowedRoles.includes(user.role)) {
            if (user.role === 'User') {
                window.location.href = 'checkin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
            return null;
        }
        return user;
    }

    /**
     * ตรวจสอบว่าผู้ดูแลระบบ (SuperAdmin หรือ Admin) มีสิทธิ์มองเห็นข้อมูลของบุคลากรรายนี้ตามขอบเขตหรือไม่
     * @param {Object} currentUser ผู้ใช้ที่ล็อกอินอยู่
     * @param {Object} targetRecord ข้อมูลที่มีฟิลด์ bureau และ division
     * @returns {boolean}
     */
    static canViewRecordByScope(currentUser, targetRecord) {
        if (!currentUser) return false;
        if (currentUser.role === 'SuperAdmin') return true;
        if (currentUser.role === 'Admin') {
            if (currentUser.visibility_level === 'all') return true;
            if (currentUser.visibility_level === 'bureau') {
                return targetRecord.bureau === currentUser.scope_bureau;
            }
            if (currentUser.visibility_level === 'division') {
                return (
                    targetRecord.bureau === currentUser.scope_bureau &&
                    targetRecord.division === currentUser.scope_division
                );
            }
        }
        return false;
    }
}