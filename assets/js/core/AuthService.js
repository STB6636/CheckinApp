/**
 * @file assets/js/core/AuthService.js
 * @description คลาสจัดการการยืนยันตัวตน ระบบจดจำ Session 7 วัน และรองรับการซ่อนชื่อไฟล์ .html บน URL ทุกหน้า
 */

import { Config } from './Config.js';
import { DatabaseService } from './DatabaseService.js';
import { UIHelpers } from './UIHelpers.js';

export class AuthService {
    static SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

    static getCurrentUser(extendSession = true) {
        try {
            const raw = localStorage.getItem(Config.STORAGE_KEYS.SESSION_USER);
            if (!raw) return null;

            const sessionData = JSON.parse(raw);
            if (!sessionData || !sessionData.id) {
                AuthService.clearSession();
                return null;
            }

            const now = Date.now();

            if (sessionData.expires_at && now > sessionData.expires_at) {
                AuthService.clearSession();
                return null;
            }

            if (extendSession) {
                sessionData.last_active_at = now;
                sessionData.expires_at = now + AuthService.SESSION_TTL_MS;
                localStorage.setItem(Config.STORAGE_KEYS.SESSION_USER, JSON.stringify(sessionData));
            }

            return sessionData;
        } catch (err) {
            console.error('Failed to read session user:', err);
            return null;
        }
    }

    static setCurrentUser(userObj, loginMode = 'checkin') {
        const now = Date.now();
        const payload = {
            ...userObj,
            last_login_mode: loginMode || userObj.last_login_mode || 'checkin',
            last_active_at: now,
            expires_at: now + AuthService.SESSION_TTL_MS
        };
        localStorage.setItem(Config.STORAGE_KEYS.SESSION_USER, JSON.stringify(payload));
    }

    static clearSession() {
        localStorage.removeItem(Config.STORAGE_KEYS.SESSION_USER);
        sessionStorage.removeItem(UIHelpers.VIEW_PAGE_STORAGE_KEY);
    }

    static async verifySessionWithDatabase() {
        const current = AuthService.getCurrentUser(false);
        if (!current || !current.id) return false;

        try {
            const db = DatabaseService.getInstance().client;
            const { data: user, error } = await db
                .from('user_accounts')
                .select(`
                    id, personnel_id, username, full_name, national_id,
                    role, visibility_level, scope_bureau, scope_division, is_active,
                    personnel:personnel_id (
                        id, national_id, prefix, first_name, last_name,
                        position_type, position_title, position_level,
                        organization, bureau, division, work_group, badge_color
                    )
                `)
                .eq('id', current.id)
                .maybeSingle();

            if (error) {
                return true;
            }

            if (!user || !user.is_active) {
                AuthService.clearSession();
                return false;
            }

            AuthService.setCurrentUser({
                ...current,
                personnel_id: user.personnel_id,
                username: user.username,
                full_name: user.full_name,
                national_id: user.national_id || (user.personnel ? user.personnel.national_id : ''),
                role: user.role,
                visibility_level: user.visibility_level,
                scope_bureau: user.scope_bureau || (user.personnel ? user.personnel.bureau : ''),
                scope_division: user.scope_division || (user.personnel ? user.personnel.division : ''),
                personnel: user.personnel || null
            }, current.last_login_mode || 'checkin');

            return true;
        } catch (err) {
            return true;
        }
    }

    /**
     * คืนค่าหน้าเว็บปลายทางของ Session ปัจจุบัน (รองรับการเปิดหน้าล่าสุดที่ค้างไว้เมื่อกด Refresh บน Root URL)
     * @param {Object} sessionUser
     * @returns {string}
     */
    static getRedirectUrlForSession(sessionUser) {
        if (!sessionUser) return UIHelpers.getRootBasePath();

        const savedViewPage = sessionStorage.getItem(UIHelpers.VIEW_PAGE_STORAGE_KEY);
        if (savedViewPage && savedViewPage !== 'index.html') {
            if (sessionUser.role === 'User') {
                return 'checkin.html';
            }
            if (savedViewPage === 'settings.html' && sessionUser.role !== 'SuperAdmin') {
                return 'dashboard.html';
            }
            return savedViewPage;
        }

        if (sessionUser.last_login_mode === 'admin' && ['SuperAdmin', 'Admin'].includes(sessionUser.role)) {
            return 'dashboard.html';
        }
        return 'checkin.html';
    }

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

        if (loginMode === 'admin' && !['SuperAdmin', 'Admin'].includes(user.role)) {
            return {
                success: false,
                message: 'ท่านไม่มีสิทธิ์ใช้งาน'
            };
        }

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

        AuthService.setCurrentUser(sessionPayload, loginMode);
        sessionStorage.setItem(Config.STORAGE_KEYS.WELCOME_TOAST, sessionPayload.full_name);

        const redirectUrl = loginMode === 'admin' ? 'dashboard.html' : 'checkin.html';
        sessionStorage.setItem(UIHelpers.VIEW_PAGE_STORAGE_KEY, redirectUrl);

        return {
            success: true,
            user: sessionPayload,
            redirectUrl,
            message: 'เข้าสู่ระบบสำเร็จ'
        };
    }

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

    static async requestPasswordResetByNationalId(nationalId) {
        const cleanId = String(nationalId || '').replace(/[\s-]/g, '');
        const check = UIHelpers.validateThaiNationalId(cleanId, false);
        if (!check.valid || cleanId.length !== 13) {
            return { success: false, message: 'กรุณากรอกหมายเลขบัตรประจำตัวประชาชน 13 หลักให้ถูกต้อง' };
        }

        const db = DatabaseService.getInstance().client;
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
            message: `ส่งคำขอรีเซ็ตรหัสผ่านของ "${targetAccount.full_name}" เรียบร้อยแล้ว กรุณารอผู้ดูแลระบบอนุมัติ`
        };
    }

    static requireAuth(allowedRoles = ['SuperAdmin', 'Admin', 'User']) {
        const user = AuthService.getCurrentUser(true);
        if (!user) {
            window.location.replace(UIHelpers.getRootBasePath());
            return null;
        }
        if (!allowedRoles.includes(user.role)) {
            if (user.role === 'User') {
                window.location.replace('checkin.html');
            } else {
                window.location.replace('dashboard.html');
            }
            return null;
        }

        AuthService.verifySessionWithDatabase().then(isValid => {
            if (!isValid) {
                window.location.replace(UIHelpers.getRootBasePath());
            }
        });

        return user;
    }

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