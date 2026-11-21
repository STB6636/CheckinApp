/**
 * @file assets/js/controllers/LoginController.js
 * @description คลาสควบคุมหน้าเข้าสู่ระบบ (ซ่อนชื่อไฟล์ .html ทุกหน้าให้แสดงเฉพาะ https://stb6636.github.io/CheckinApp/ และกู้คืนหน้าเดิมเมื่อกด Refresh)
 */

import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { Config } from '../core/Config.js';
import { SystemUpdateModal } from '../components/SystemUpdateModal.js';

export class LoginController {
    constructor() {
        this.settings = null;
        this.init();
    }

    async init() {
        // ซ่อนชื่อไฟล์ .html ทันทีให้เหลือเฉพาะ https://stb6636.github.io/CheckinApp/
        UIHelpers.initTheme();

        // ตรวจสอบ Session 7 วัน: หากมี Session อยู่แล้ว ให้พาเข้าสู่หน้าโหลดเพื่อตรวจสอบสถานะก่อนเข้าสู่ระบบ
        const existingSessionUser = AuthService.getCurrentUser(true);
        if (existingSessionUser) {
            window.location.replace(UIHelpers.resolveAppUrl('loading.html?entry=session'));
            return;
        }

        this.#updateThemeButtonUI();
        this.#bindEvents();
        this.#loadRememberedUser();
        await Promise.allSettled([
            this.#loadOrganizationBranding(),
            SystemUpdateModal.init({ targetBadgeSlot: '#loginVersionBadgeSlot' })
        ]);
        if (this.settings) {
            SystemUpdateModal.checkAndShowAnnouncement(this.settings);
        }
    }

    async #loadOrganizationBranding() {
        try {
            this.settings = await SettingsModel.getSettings(true);
            const orgName = this.settings.organization_name || 'กรุงเทพมหานคร';
            const bureauName = this.settings.bureau_name || 'สำนักเทศกิจ';
            const headerTitle = this.settings.header_system_title || 'BMA e-Government Time Attendance System';
            const footerDesc = this.settings.footer_description || '';

            const headerTitleEl = document.getElementById('headerSystemTitleText');
            if (headerTitleEl) headerTitleEl.textContent = headerTitle;

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

            // Sync brand cache for loading.html instant 0ms pre-hydration
            try {
                let resolvedLogoUrl = '';
                const rawLogo = String(this.settings.logo_url || '').trim();
                const isSafeProtocol = /^(?:https?:\/\/[^\s'"()<>]+|data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)$/i.test(rawLogo);
                if (rawLogo && isSafeProtocol) {
                    const isGoogleDrive = /(?:drive\.google\.com|docs\.google\.com|lh3\.googleusercontent\.com)/i.test(rawLogo);
                    if (isGoogleDrive) {
                        const m = rawLogo.match(/(?:\/d\/|[?&]id=|\/file\/d\/)([-\w]{20,})/);
                        resolvedLogoUrl = m && m[1] ? `https://lh3.googleusercontent.com/d/${m[1]}` : rawLogo;
                    } else {
                        resolvedLogoUrl = rawLogo;
                    }
                } else {
                    resolvedLogoUrl = 'https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc';
                }

                const brandPayload = {
                    orgName,
                    bureauName,
                    headerSystemTitle: headerTitle,
                    logoUrl: resolvedLogoUrl
                };
                localStorage.setItem('bma_cached_brand_v2_7', JSON.stringify(brandPayload));
            } catch (_) {}
        } catch (err) {
            console.warn('Could not load branding settings on login page:', err);
        }
    }

    #updateThemeButtonUI() {
        const isDark = document.documentElement.classList.contains('dark');
        const icon = document.getElementById('loginThemeIcon');
        const label = document.getElementById('loginThemeLabel');
        if (icon) {
            icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
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

        document.getElementById('loginUsername')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('loginPassword')?.focus();
            }
        });

        document.getElementById('loginPassword')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.#handleLogin('checkin');
            }
        });

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
            UIHelpers.prepareModalOpen(modalChange);
        };
        const closeChangeModal = () => {
            modalChange?.classList.add('hidden');
            UIHelpers.syncBodyModalLock();
        };

        document.getElementById('btnOpenChangePwdModal')?.addEventListener('click', openChangeModal);
        document.getElementById('btnCloseChangePwdModal')?.addEventListener('click', closeChangeModal);
        document.getElementById('btnCancelChangePwd')?.addEventListener('click', closeChangeModal);
        UIHelpers.bindModalDismiss(modalChange, closeChangeModal);

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

        const modalForgot = document.getElementById('modalForgotPassword');
        const openForgotModal = () => {
            const currentTypedUser = document.getElementById('loginUsername')?.value || '';
            document.getElementById('fpNationalId').value = /^\d{1,13}$/.test(currentTypedUser) ? currentTypedUser : '';
            modalForgot?.classList.remove('hidden');
            UIHelpers.prepareModalOpen(modalForgot);
        };
        const closeForgotModal = () => {
            modalForgot?.classList.add('hidden');
            UIHelpers.syncBodyModalLock();
        };

        document.getElementById('btnOpenForgotPwdModal')?.addEventListener('click', openForgotModal);
        document.getElementById('btnCloseForgotPwdModal')?.addEventListener('click', closeForgotModal);
        document.getElementById('btnCancelForgotPwd')?.addEventListener('click', closeForgotModal);
        UIHelpers.bindModalDismiss(modalForgot, closeForgotModal);

        document.getElementById('formForgotPassword')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.#handleForgotPasswordSubmit(closeForgotModal);
        });
    }

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

            this.#persistRememberedUser(username);

            window.location.replace(UIHelpers.resolveAppUrl('loading.html?entry=login'));
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.showToast(err.message || 'ไม่สามารถเข้าสู่ระบบได้', 'error', 2800);
        }
    }

    #loadRememberedUser() {
        try {
            const storageKeyMe = Config.STORAGE_KEYS?.REMEMBER_ME || 'bma_remember_me';
            const storageKeyUser = Config.STORAGE_KEYS?.REMEMBER_USERNAME || 'bma_remember_username';
            const rememberedUsername = localStorage.getItem(storageKeyUser);
            const isRemember = localStorage.getItem(storageKeyMe) === 'true';
            const chkEl = document.getElementById('chkRememberMe');
            const userInput = document.getElementById('loginUsername');
            const pwdInput = document.getElementById('loginPassword');

            if (chkEl && isRemember && rememberedUsername) {
                chkEl.checked = true;
                if (userInput) userInput.value = rememberedUsername;
                if (pwdInput) {
                    setTimeout(() => pwdInput.focus(), 50);
                }
            }
        } catch (err) {
            console.warn('Could not read remembered user credentials from localStorage:', err);
        }
    }

    #persistRememberedUser(username) {
        try {
            const storageKeyMe = Config.STORAGE_KEYS?.REMEMBER_ME || 'bma_remember_me';
            const storageKeyUser = Config.STORAGE_KEYS?.REMEMBER_USERNAME || 'bma_remember_username';
            const isRemember = document.getElementById('chkRememberMe')?.checked;
            if (isRemember && username && username.trim()) {
                localStorage.setItem(storageKeyUser, username.trim());
                localStorage.setItem(storageKeyMe, 'true');
            } else {
                localStorage.removeItem(storageKeyUser);
                localStorage.setItem(storageKeyMe, 'false');
            }
        } catch (err) {
            console.warn('Could not persist remembered user credentials:', err);
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