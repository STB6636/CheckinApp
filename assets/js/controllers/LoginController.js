/**
 * @file assets/js/controllers/LoginController.js
 * @description คลาสควบคุมหน้าเข้าสู่ระบบ (index.html) แสดง Toast Popup อัตโนมัติโดยไม่ต้องกดปุ่มตกลง
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

    async #loadOrganizationBranding() {
        try {
            this.settings = await SettingsModel.getSettings(true);
            const orgName = this.settings.organization_name || 'กรุงเทพมหานคร';
            const bureauName = this.settings.bureau_name || 'สำนักเทศกิจ';
            const footerDesc = this.settings.footer_description || '';

            document.getElementById('orgNameText').textContent = orgName;
            document.getElementById('bureauNameText').textContent = bureauName;
            document.getElementById('mobileOrgNameText').textContent = orgName;
            document.getElementById('mobileBureauNameText').textContent = bureauName;
            document.getElementById('footerOrgName').textContent = orgName;
            document.getElementById('footerBureauName').textContent = bureauName;

            const footerDescEl = document.getElementById('footerDescriptionText');
            if (footerDescEl) {
                footerDescEl.textContent = footerDesc;
                footerDescEl.classList.toggle('hidden', !footerDesc);
            }

            if (this.settings.logo_url) {
                const logoImgHtml = `<img src="${this.settings.logo_url}" alt="Logo" class="w-full h-full object-contain rounded-xl">`;
                const desktopLogo = document.getElementById('orgLogoWrapper');
                const mobileLogo = document.getElementById('mobileOrgLogoWrapper');
                if (desktopLogo) desktopLogo.innerHTML = logoImgHtml;
                if (mobileLogo) mobileLogo.innerHTML = logoImgHtml;
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
            icon.className = isDark ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-emerald-800';
        }
        if (label) {
            label.textContent = isDark ? 'โหมดสว่าง' : 'โหมดถนอมสายตา';
        }
    }

    #bindEvents() {
        document.getElementById('btnLoginThemeToggle')?.addEventListener('click', () => {
            UIHelpers.toggleTheme();
            this.#updateThemeButtonUI();
        });

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

        document.getElementById('btnLoginCheckin')?.addEventListener('click', () => {
            this.#handleLogin('checkin');
        });

        document.getElementById('btnLoginAdmin')?.addEventListener('click', () => {
            this.#handleLogin('admin');
        });

        document.getElementById('loginPassword')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.#handleLogin('checkin');
            }
        });

        // Modal เปลี่ยนรหัสผ่านด้วยตนเอง
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
                statusEl.className = 'text-xs mt-1 text-emerald-600 font-bold';
                submitBtn.disabled = false;
            } else {
                statusEl.textContent = '✗ รหัสผ่านใหม่และการยืนยันยังไม่ตรงกัน (อย่างน้อย 4 ตัวอักษร)';
                statusEl.className = 'text-xs mt-1 text-rose-600 font-bold';
                submitBtn.disabled = true;
            }
        };

        document.getElementById('cpNewPassword')?.addEventListener('input', validatePasswordMatch);
        document.getElementById('cpConfirmPassword')?.addEventListener('input', validatePasswordMatch);

        document.getElementById('formChangePassword')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.#handleChangePasswordSubmit(closeChangeModal);
        });

        // Modal ลืมรหัสผ่าน
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
     * ประมวลผลการเข้าสู่ระบบ:
     * - หากสำเร็จ: แสดง Popup เล็กๆ มุมขวาบน (หรือด้านบนในมือถือ) ว่า "เข้าสู่ระบบสำเร็จ" 2 วินาที แล้วเปลี่ยนหน้าทันทีโดยไม่ต้องกดปุ่มใดๆ
     * - หาก User กดเข้าผู้ดูแลระบบ: แจ้งเตือนว่า "ท่านไม่มีสิทธิ์ใช้งาน"
     */
    async #handleLogin(mode) {
        const username = document.getElementById('loginUsername')?.value || '';
        const password = document.getElementById('loginPassword')?.value || '';

        UIHelpers.showLoading('กำลังตรวจสอบสิทธิ์การเข้าสู่ระบบ...');
        try {
            const result = await AuthService.login(username, password, mode);
            UIHelpers.hideLoading();

            if (!result.success) {
                await UIHelpers.showToast(result.message, 'error', 2800);
                return;
            }

            // แสดง Popup เล็กๆ "เข้าสู่ระบบสำเร็จ" ประมาณ 2 วินาที แล้วเข้าสู่ระบบทันทีโดยไม่ต้องกดปุ่มตกลง
            await UIHelpers.showToast('เข้าสู่ระบบสำเร็จ', 'success', 2000);
            window.location.href = result.redirectUrl;
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.showToast(err.message || 'ไม่สามารถเข้าสู่ระบบได้', 'error', 2800);
        }
    }

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