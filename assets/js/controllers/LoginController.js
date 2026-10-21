/**
 * @file assets/js/controllers/LoginController.js
 * @description คลาสควบคุมหน้าเข้าสู่ระบบ (index.html) เปลี่ยนรหัสผ่าน และลืมรหัสผ่าน
 */

import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { SettingsModel } from '../models/SettingsModel.js';

export class LoginController {
    constructor() {
        this.settings = null;
        this.init();
    }

    async init() {
        UIHelpers.initTheme();
        this.#updateThemeButtonUI();
        this.#bindEvents();
        await this.#loadOrganizationBranding();
    }

    /**
     * ดึงข้อมูลโลโก้ ชื่อหน่วยงาน และชื่อสังกัด [สำนักงาน/กอง] จากฐานข้อมูลมาแสดงผลบนการ์ดแนวนอนและ Footer
     */
    async #loadOrganizationBranding() {
        try {
            this.settings = await SettingsModel.getSettings(true);
            const orgName = this.settings.organization_name || 'กรุงเทพมหานคร';
            const bureauName = this.settings.bureau_name || 'สำนักเทศกิจ';

            document.getElementById('orgNameText').textContent = orgName;
            document.getElementById('bureauNameText').textContent = bureauName;
            document.getElementById('footerOrgName').textContent = orgName;
            document.getElementById('footerBureauName').textContent = bureauName;

            if (this.settings.logo_url) {
                const logoWrapper = document.getElementById('orgLogoWrapper');
                logoWrapper.innerHTML = `<img src="${this.settings.logo_url}" alt="Logo" class="w-full h-full object-contain rounded-xl">`;
            }
        } catch (err) {
            console.warn('Could not load branding settings on login page:', err);
        }
    }

    #updateThemeButtonUI() {
        const isDark = document.documentElement.classList.contains('dark');
        const icon = document.getElementById('loginThemeIcon');
        const label = document.getElementById('loginThemeLabel');
        if (icon) {
            icon.className = isDark ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon';
        }
        if (label) {
            label.textContent = isDark ? 'โหมดสว่าง' : 'โหมดถนอมสายตา';
        }
    }

    #bindEvents() {
        // ปุ่มสลับโหมดสี
        document.getElementById('btnLoginThemeToggle')?.addEventListener('click', () => {
            UIHelpers.toggleTheme();
            this.#updateThemeButtonUI();
        });

        // ปุ่มแสดง/ซ่อนรหัสผ่าน
        document.getElementById('btnToggleLoginPwd')?.addEventListener('click', () => {
            const pwdInput = document.getElementById('loginPassword');
            const icon = document.querySelector('#btnToggleLoginPwd i');
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                icon.className = 'fa-solid fa-eye-slash';
            } else {
                pwdInput.type = 'password';
                icon.className = 'fa-solid fa-eye';
            }
        });

        // ปุ่มเข้าสู่ระบบสำหรับลงเวลาปฏิบัติราชการ
        document.getElementById('btnLoginCheckin')?.addEventListener('click', () => {
            this.#handleLogin('checkin');
        });

        // ปุ่มเข้าสู่ระบบสำหรับผู้ดูแลระบบ (SuperAdmin, Admin)
        document.getElementById('btnLoginAdmin')?.addEventListener('click', () => {
            this.#handleLogin('admin');
        });

        // รองรับการกด Enter ในช่องรหัสผ่านเพื่อเข้าสู่ระบบลงเวลา
        document.getElementById('loginPassword')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.#handleLogin('checkin');
            }
        });

        // จัดการ Modal เปลี่ยนรหัสผ่านด้วยตนเอง
        const modalChange = document.getElementById('modalChangePassword');
        const openChangeModal = () => {
            const currentTypedUser = document.getElementById('loginUsername')?.value || '';
            document.getElementById('cpUsername').value = currentTypedUser;
            document.getElementById('cpOldPassword').value = '';
            document.getElementById('cpNewPassword').value = '';
            document.getElementById('cpConfirmPassword').value = '';
            document.getElementById('cpMatchStatus').classList.add('hidden');
            document.getElementById('btnSubmitChangePwd').disabled = true;
            modalChange?.classList.remove('hidden');
        };
        const closeChangeModal = () => modalChange?.classList.add('hidden');

        document.getElementById('btnOpenChangePwdModal')?.addEventListener('click', openChangeModal);
        document.getElementById('btnCloseChangePwdModal')?.addEventListener('click', closeChangeModal);
        document.getElementById('btnCancelChangePwd')?.addEventListener('click', closeChangeModal);

        // ตรวจสอบรหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ให้ตรงกันแบบเรียลไทม์จึงจะกดบันทึกได้
        const validatePasswordMatch = () => {
            const newPwd = document.getElementById('cpNewPassword').value;
            const confirmPwd = document.getElementById('cpConfirmPassword').value;
            const statusEl = document.getElementById('cpMatchStatus');
            const submitBtn = document.getElementById('btnSubmitChangePwd');

            if (!newPwd && !confirmPwd) {
                statusEl.classList.add('hidden');
                submitBtn.disabled = true;
                return;
            }

            statusEl.classList.remove('hidden');
            if (newPwd === confirmPwd && newPwd.length >= 4) {
                statusEl.textContent = '✓ รหัสผ่านใหม่ตรงกัน สามารถกดบันทึกได้';
                statusEl.className = 'text-xs mt-1 text-emerald-500 font-semibold';
                submitBtn.disabled = false;
            } else {
                statusEl.textContent = '✗ รหัสผ่านใหม่และการยืนยันยังไม่ตรงกัน (อย่างน้อย 4 ตัวอักษร)';
                statusEl.className = 'text-xs mt-1 text-rose-500 font-semibold';
                submitBtn.disabled = true;
            }
        };

        document.getElementById('cpNewPassword')?.addEventListener('input', validatePasswordMatch);
        document.getElementById('cpConfirmPassword')?.addEventListener('input', validatePasswordMatch);

        document.getElementById('formChangePassword')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.#handleChangePasswordSubmit(closeChangeModal);
        });

        // จัดการ Modal ลืมรหัสผ่าน
        const modalForgot = document.getElementById('modalForgotPassword');
        const openForgotModal = () => {
            const currentTypedUser = document.getElementById('loginUsername')?.value || '';
            document.getElementById('fpNationalId').value = /^\d{1,13}$/.test(currentTypedUser) ? currentTypedUser : '';
            modalForgot?.classList.remove('hidden');
        };
        const closeForgotModal = () => modalForgot?.classList.add('hidden');

        document.getElementById('btnOpenForgotPwdModal')?.addEventListener('click', openForgotModal);
        document.getElementById('btnCloseForgotPwdModal')?.addEventListener('click', closeForgotModal);
        document.getElementById('btnCancelForgotPwd')?.addEventListener('click', closeForgotModal);

        document.getElementById('formForgotPassword')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.#handleForgotPasswordSubmit(closeForgotModal);
        });
    }

    /**
     * ประมวลผลการเข้าสู่ระบบ
     * @param {'checkin'|'admin'} mode
     */
    async #handleLogin(mode) {
        const username = document.getElementById('loginUsername')?.value || '';
        const password = document.getElementById('loginPassword')?.value || '';

        UIHelpers.showLoading('กำลังตรวจสอบสิทธิ์การเข้าสู่ระบบ...');
        try {
            const result = await AuthService.login(username, password, mode);
            UIHelpers.hideLoading();

            if (!result.success) {
                await UIHelpers.alert('ไม่สามารถเข้าสู่ระบบได้', result.message, 'error');
                return;
            }

            await UIHelpers.alert('เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับ ${result.user.full_name}`, 'success');
            window.location.href = result.redirectUrl;
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถเข้าสู่ระบบได้', 'error');
        }
    }

    /**
     * ประมวลผลการเปลี่ยนรหัสผ่านใหม่ด้วยตนเอง
     */
    async #handleChangePasswordSubmit(closeModalCallback) {
        const username = document.getElementById('cpUsername').value;
        const oldPwd = document.getElementById('cpOldPassword').value;
        const newPwd = document.getElementById('cpNewPassword').value;
        const confirmPwd = document.getElementById('cpConfirmPassword').value;

        UIHelpers.showLoading('กำลังบันทึกรหัสผ่านใหม่...');
        try {
            const res = await AuthService.changePassword(username, oldPwd, newPwd, confirmPwd);
            UIHelpers.hideLoading();

            if (!res.success) {
                await UIHelpers.alert('เปลี่ยนรหัสผ่านไม่สำเร็จ', res.message, 'error');
                return;
            }

            closeModalCallback();
            document.getElementById('loginUsername').value = username.trim();
            document.getElementById('loginPassword').value = '';
            await UIHelpers.alert('เปลี่ยนรหัสผ่านใหม่สำเร็จ', res.message, 'success');
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
        }
    }

    /**
     * ประมวลผลการส่งคำขอลืมรหัสผ่านด้วยหมายเลขบัตรประชาชน 13 หลัก
     */
    async #handleForgotPasswordSubmit(closeModalCallback) {
        const nationalId = document.getElementById('fpNationalId').value;

        UIHelpers.showLoading('กำลังส่งคำขอรีเซ็ตรหัสผ่านเข้าระบบ...');
        try {
            const res = await AuthService.requestPasswordResetByNationalId(nationalId);
            UIHelpers.hideLoading();

            if (!res.success) {
                await UIHelpers.alert('ไม่สามารถส่งคำขอได้', res.message, 'warning');
                return;
            }

            closeModalCallback();
            await UIHelpers.alert('ส่งคำขอเรียบร้อยแล้ว', res.message, 'success');
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LoginController();
});