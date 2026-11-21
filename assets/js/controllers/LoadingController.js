/**
 * @file assets/js/controllers/LoadingController.js
 * @description คลาสควบคุมหน้าโหลดเข้าสู่ระบบ (Loading Screen Controller)
 * รองรับการตรวจสอบ/ต่ออายุ Session 7 วัน, ดึง Branding จาก SettingsModel,
 * ตรวจสอบความพร้อมของฐานข้อมูล, Preload รูปภาพโลโก้, แสดง Dual-Logo 3D Flip
 * พร้อม Watchdog 12 วินาที และ Minimum Smooth Display Floor (~750ms)
 */

import { Config } from '../core/Config.js';
import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { SettingsModel } from '../models/SettingsModel.js';

export class LoadingController {
    static BRAND_STORAGE_KEY = 'bma_cached_brand_v2_7';
    static OFFICIAL_SETTINGS_LOGO = 'https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc';

    #watchdogTimer = null;
    #isNavigating = false;
    #entryMode = 'session';

    constructor() {
        this.init();
    }

    async init() {
        const startTime = performance.now();

        // 1. แคปเจอร์พารามิเตอร์ entry ก่อนเรียก URL Masking (เพราะ initTheme จะซ่อน URL เป็น Root Path)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            this.#entryMode = urlParams.get('entry') || 'session';
        } catch (_) {
            this.#entryMode = 'session';
        }

        // 2. เรียก UIHelpers.initTheme() เพื่อซ่อน URL เป็น Root Path และตั้งค่าธีมสี
        // (UIHelpers.KNOWN_PAGES_REGEX ไม่ดัก loading.html จึงไม่เขียนทับ VIEW_PAGE_STORAGE_KEY)
        UIHelpers.initTheme();

        // 3. ผูก Event ปุ่มใน Watchdog Fallback Box
        this.#bindFallbackEvents();

        // 4. รอ Cache Purge (หากกำลังทำงานอยู่ในพื้นหลัง) สูงสุด 1.5 วินาที
        if (window.__bmaPurgeActive && window.__bmaPurgePromise) {
            try {
                await Promise.race([
                    window.__bmaPurgePromise,
                    new Promise((resolve) => setTimeout(resolve, 1500))
                ]);
            } catch (_) {}
        }

        // 5. Hydrate Branding ล่าสุดจาก Local Storage ทันที
        this.#hydrateFromLocalBrandCache();

        // 6. ตรวจสอบและต่ออายุ Session 7 วัน
        const sessionUser = AuthService.getCurrentUser(true);
        if (!sessionUser) {
            // หากไม่มี Session ให้เด้งกลับหน้า Login ทันที
            window.location.replace(UIHelpers.resolveAppUrl('index.html'));
            return;
        }

        // 7. ตั้งข้อความสถานะเริ่มต้นตามรูปแบบการเข้าใช้งาน
        if (this.#entryMode === 'login') {
            this.#setStepLabel('กำลังเตรียมข้อมูลหน่วยงาน...');
        } else {
            this.#setStepLabel('พบเซสชันที่ยังใช้งานได้...');
        }

        // 8. เปิด Watchdog Failsafe 12 วินาที
        this.#armWatchdog();

        // 9. โหลดข้อมูลแบบ Concurrent (Settings + Verify DB)
        const isReady = await this.#verifyAndPreloadData(sessionUser);
        if (!isReady) {
            // กรณีบัญชีถูกระงับสิทธิ์ในฐานข้อมูล
            this.#clearWatchdog();
            this.#setStepLabel('บัญชีผู้ใช้นี้ถูกระงับสิทธิ์การใช้งาน');
            AuthService.clearSession();
            setTimeout(() => {
                window.location.replace(UIHelpers.resolveAppUrl('index.html'));
            }, 1200);
            return;
        }

        // 10. บังคับขั้นต่ำ Minimum Smooth Display Floor (~750ms)
        const elapsed = performance.now() - startTime;
        const remainingFloor = Math.max(0, 750 - elapsed);
        if (remainingFloor > 0) {
            await new Promise((resolve) => setTimeout(resolve, remainingFloor));
        }

        // 11. ดึง URL ปลายทางและ Transition ไปยังหน้าระบบ
        this.#clearWatchdog();
        let targetUrl = AuthService.getRedirectUrlForSession(sessionUser);
        if (!targetUrl || targetUrl.includes('loading.html')) {
            targetUrl = sessionUser.role === 'User' ? 'checkin.html' : 'dashboard.html';
        }
        await this.#navigateToTarget(targetUrl);
    }

    #bindFallbackEvents() {
        document.getElementById('btnRetryLoad')?.addEventListener('click', () => {
            window.location.replace(UIHelpers.resolveAppUrl('loading.html?entry=' + encodeURIComponent(this.#entryMode)));
        });

        document.getElementById('btnBackToLogin')?.addEventListener('click', () => {
            this.#clearWatchdog();
            AuthService.clearSession();
            window.location.replace(UIHelpers.resolveAppUrl('index.html'));
        });
    }

    #hydrateFromLocalBrandCache() {
        try {
            let b = null;
            const raw = localStorage.getItem(LoadingController.BRAND_STORAGE_KEY);
            if (raw) {
                try { b = JSON.parse(raw); } catch (_) {}
            }
            let sessionSettings = null;
            const rawSettings = sessionStorage.getItem(Config.STORAGE_KEYS.CACHED_SETTINGS);
            if (rawSettings) {
                try { sessionSettings = JSON.parse(rawSettings); } catch (_) {}
            }

            if (!b || typeof b !== 'object') {
                if (sessionSettings && typeof sessionSettings === 'object') {
                    b = {
                        orgName: sessionSettings.organization_name,
                        bureauName: sessionSettings.bureau_name,
                        headerSystemTitle: sessionSettings.header_system_title,
                        logoUrl: sessionSettings.logo_url
                    };
                }
            } else if (sessionSettings && typeof sessionSettings === 'object') {
                if (!b.logoUrl && sessionSettings.logo_url) b.logoUrl = sessionSettings.logo_url;
                if (!b.orgName && sessionSettings.organization_name) b.orgName = sessionSettings.organization_name;
                if (!b.bureauName && sessionSettings.bureau_name) b.bureauName = sessionSettings.bureau_name;
                if (!b.headerSystemTitle && sessionSettings.header_system_title) b.headerSystemTitle = sessionSettings.header_system_title;
            }

            if (!b || typeof b !== 'object') return;

            if (b.orgName) {
                const el = document.getElementById('ldOrgName');
                if (el) el.textContent = b.orgName;
            }
            if (b.bureauName) {
                const el = document.getElementById('ldBureauName');
                if (el) el.textContent = b.bureauName;
            }
            if (b.headerSystemTitle) {
                const el = document.getElementById('ldSystemTitle');
                if (el) el.textContent = b.headerSystemTitle;
            }

            this.#renderOrgLogo(b.logoUrl || LoadingController.OFFICIAL_SETTINGS_LOGO);
        } catch (err) {
            console.warn('[LoadingController] Brand hydration error:', err);
        }
    }

    async #verifyAndPreloadData(sessionUser) {
        if (this.#entryMode === 'login') {
            this.#setStepLabel('กำลังเชื่อมต่อระบบลงเวลา...');
        } else {
            this.#setStepLabel('กำลังตรวจสอบสถานะบัญชี...');
        }

        const [settingsResult, dbVerifyResult] = await Promise.allSettled([
            this.#fetchSettingsWithTimeout(3000),
            this.#verifySessionWithTimeout(2500)
        ]);

        // จัดการผลลัพธ์ Settings
        if (settingsResult.status === 'fulfilled' && settingsResult.value) {
            await this.#applyLiveSettingsBranding(settingsResult.value);
        }

        // จัดการผลลัพธ์ Database Session Verification
        // หาก Database ระบุชัดเจนว่า false (บัญชีไม่ active หรือถูกลบ) ให้ถือว่าไม่พร้อม
        if (dbVerifyResult.status === 'fulfilled' && dbVerifyResult.value === false) {
            return false;
        }

        return true;
    }

    async #fetchSettingsWithTimeout(timeoutMs) {
        let timer = null;
        try {
            const fetchPromise = SettingsModel.getSettings(true);
            const timeoutPromise = new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error('Settings fetch timeout')), timeoutMs);
            });
            return await Promise.race([fetchPromise, timeoutPromise]);
        } catch (err) {
            console.warn('[LoadingController] Settings fetch warn:', err.message);
            return null;
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    async #verifySessionWithTimeout(timeoutMs) {
        let timer = null;
        try {
            const verifyPromise = AuthService.verifySessionWithDatabase();
            const timeoutPromise = new Promise((resolve) => {
                timer = setTimeout(() => resolve(true), timeoutMs);
            });
            return await Promise.race([verifyPromise, timeoutPromise]);
        } catch (err) {
            console.warn('[LoadingController] DB verify warn:', err.message);
            return true;
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    async #applyLiveSettingsBranding(settings) {
        if (!settings) return;

        const orgName = settings.organization_name || 'สำนักเทศกิจ';
        const bureauName = settings.bureau_name || 'สำนักงานตรวจและบังคับการ';
        const headerTitle = settings.header_system_title || 'ระบบลงเวลาปฏิบัติราชการ (สตบ.สนท.)';
        const rawLogoUrl = settings.logo_url || '';

        const orgEl = document.getElementById('ldOrgName');
        const bureauEl = document.getElementById('ldBureauName');
        const titleEl = document.getElementById('ldSystemTitle');

        if (orgEl) orgEl.textContent = orgName;
        if (bureauEl) bureauEl.textContent = bureauName;
        if (titleEl) titleEl.textContent = headerTitle;

        // แปลง URL Google Drive ให้เป็น Direct Thumbnail Link ก่อนบันทึกแคช
        let resolvedLogoUrl = LoadingController.OFFICIAL_SETTINGS_LOGO;
        const clean = String(rawLogoUrl || '').trim();
        if (clean) {
            const isSafeProtocol = /^(?:https?:\/\/[^\s'"()<>]+|data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)$/i.test(clean);
            if (isSafeProtocol) {
                const isGoogleDrive = /(?:drive\.google\.com|docs\.google\.com|lh3\.googleusercontent\.com)/i.test(clean);
                if (isGoogleDrive) {
                    const driveMatch = clean.match(/(?:\/d\/|[?&]id=|\/file\/d\/)([-\w]{20,})/);
                    resolvedLogoUrl = driveMatch && driveMatch[1] ? `https://lh3.googleusercontent.com/d/${driveMatch[1]}` : clean;
                } else {
                    resolvedLogoUrl = clean;
                }
            }
        }

        // บันทึกลง Local Brand Cache สำหรับการเปิดครั้งถัดไป (ไม่บันทึก bmaLogoUrl)
        try {
            const brandPayload = {
                orgName,
                bureauName,
                headerSystemTitle: headerTitle,
                logoUrl: resolvedLogoUrl
            };
            localStorage.setItem(LoadingController.BRAND_STORAGE_KEY, JSON.stringify(brandPayload));
        } catch (_) {}

        this.#renderOrgLogo(resolvedLogoUrl);

        // ประสานเวลารอรูปภาพให้พร้อมอย่างเหมาะสมถ้าเป็น URL ใหม่
        const logoImg = document.getElementById('ldOrgLogo');
        if (logoImg && !logoImg.complete && typeof logoImg.decode === 'function') {
            try {
                await Promise.race([
                    logoImg.decode(),
                    new Promise((resolve) => setTimeout(resolve, 500))
                ]);
            } catch (_) {}
        }
    }

    #renderOrgLogo(rawUrl) {
        const logoImg = document.getElementById('ldOrgLogo');
        const fallbackEl = document.getElementById('ldLogoFallback');
        if (!logoImg) return;

        let targetUrl = String(rawUrl || '').trim();
        const isSafeProtocol = /^(?:https?:\/\/[^\s'"()<>]+|data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)$/i.test(targetUrl);

        if (!targetUrl || !isSafeProtocol) {
            targetUrl = LoadingController.OFFICIAL_SETTINGS_LOGO;
        } else {
            const isGoogleDrive = /(?:drive\.google\.com|docs\.google\.com|lh3\.googleusercontent\.com)/i.test(targetUrl);
            if (isGoogleDrive) {
                const driveMatch = targetUrl.match(/(?:\/d\/|[?&]id=|\/file\/d\/)([-\w]{20,})/);
                if (driveMatch && driveMatch[1]) {
                    targetUrl = `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
                }
            }
        }

        const sanitizedUrl = targetUrl.replace(/['"\\]/g, '');

        // Safe error fallback
        logoImg.onerror = () => {
            logoImg.classList.add('hidden');
            if (fallbackEl) fallbackEl.classList.remove('hidden');
        };

        // If image already errored before this call
        if (logoImg.complete && logoImg.naturalWidth === 0 && logoImg.getAttribute('src')) {
            logoImg.classList.add('hidden');
            if (fallbackEl) fallbackEl.classList.remove('hidden');
        }

        // If current src is already the sanitized URL, do not disrupt state (keep visible or error fallback intact)
        const currentSrc = logoImg.getAttribute('src') || '';
        if (currentSrc === sanitizedUrl) {
            return;
        }

        // When switching to a different valid URL, ensure fallback is hidden and img is visible
        if (fallbackEl) fallbackEl.classList.add('hidden');
        logoImg.classList.remove('hidden');
        logoImg.src = sanitizedUrl;
    }

    #setStepLabel(text) {
        const labelEl = document.getElementById('ldStepLabel');
        if (labelEl && text) {
            labelEl.textContent = text;
        }
    }

    #armWatchdog() {
        this.#clearWatchdog();
        this.#watchdogTimer = setTimeout(() => {
            if (this.#isNavigating) return;
            const fallbackBox = document.getElementById('ldFallbackActions');
            if (fallbackBox) {
                fallbackBox.classList.remove('hidden');
            }
            this.#setStepLabel('การเชื่อมต่อล่าช้า กรุณาเลือกดำเนินการ');
        }, 12000);
    }

    #clearWatchdog() {
        if (this.#watchdogTimer) {
            clearTimeout(this.#watchdogTimer);
            this.#watchdogTimer = null;
        }
    }

    async #navigateToTarget(targetUrl) {
        if (this.#isNavigating) return;
        this.#isNavigating = true;
        this.#clearWatchdog();

        this.#setStepLabel('กำลังเข้าสู่หน้าหลัก...');

        const splashEl = document.getElementById('bmaSplash');
        if (splashEl) {
            splashEl.classList.add('sp-fade');
        }

        await new Promise((resolve) => setTimeout(resolve, 180));
        window.location.replace(UIHelpers.resolveAppUrl(targetUrl));
    }
}

// Bootstrap Singleton
function bootLoadingController() {
    if (!window.__loadingControllerInstance) {
        window.__loadingControllerInstance = new LoadingController();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootLoadingController);
} else {
    bootLoadingController();
}
