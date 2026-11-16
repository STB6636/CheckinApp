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
    static DEFAULT_BMA_LOGO = 'https://pr-bangkok.com/wp-content/uploads/2025/06/231116_BMA-Emblem_Edited_Green-600x600.png';
    static DEFAULT_DEPT_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/3/35/Patch_of_Bangkok_City_Law_Enforcement_Department.png';
    static DEFAULT_BMA_FALLBACK_SVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgMTIwIj4KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSI1OCIgZmlsbD0iIzAwNzQ0QiIgc3Ryb2tlPSIjRjZERTUxIiBzdHJva2Utd2lkdGg9IjMiLz4KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSI1MSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRjZERTUxIiBzdHJva2Utd2lkdGg9IjEuMiIgc3Ryb2tlLWRhc2hhcnJheT0iMywyIi8+CiAgPGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNDYiIGZpbGw9IiMwMDVBM0EiLz4KICA8cGF0aCBkPSJNNjAgMjIgTDYzIDMyIEw2OSAzNCBMNjQgMzggTDY1IDQ0IEw2MCA0MSBMNTUgNDQgTDU2IDM4IEw1MSAzNCBMNTcgMzIgWiIgZmlsbD0iI0Y2REU1MSIvPgogIDxwYXRoIGQ9Ik01NyA0MiBDNTcgMzkgNjMgMzkgNjMgNDIgTDY0IDUwIEM2NiA1MiA2OCA1NSA2OCA1OSBMNTIgNTkgQzUyIDU1IDU0IDUyIDU2IDUwIFoiIGZpbGw9IiNGRkZGRkYiLz4KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjQwIiByPSIzLjUiIGZpbGw9IiNGNkRFNTEiLz4KICA8cGF0aCBkPSJNNjYgNDMgTDcyIDM4IE03MSAzNiBMNzMgNDAiIHN0cm9rZT0iI0Y2REU1MSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8cGF0aCBkPSJNNDIgNjYgQzQwIDYwIDQ2IDU0IDUyIDU2IEM1NCA1MyA2NiA1MyA2OCA1NiBDNzQgNTQgODAgNjAgNzggNjYgQzc3IDc0IDc0IDgxIDcyIDg3IEM3MCA5MSA2NiA5MSA2NiA4NSBDNjYgNzkgNjcgNzMgNjYgNjkgQzY1IDY3IDYzIDY2IDYwIDY2IEM1NyA2NiA1NSA2NyA1NCA2OSBDNTMgNzMgNTQgNzkgNTQgODUgQzU0IDkxIDUwIDkxIDQ4IDg3IEM0NiA4MSA0MyA3NCA0MiA2NiBaIiBmaWxsPSIjRkZGRkZGIi8+CiAgPHBhdGggZD0iTTQ3IDcwIEM0NCA3MiA0MCA3MCAzOCA2NiBDNDAgNjcgNDQgNjcgNDYgNjggTTczIDcwIEM3NiA3MiA4MCA3MCA4MiA2NiBDODAgNjcgNzYgNjcgNzQgNjgiIHN0cm9rZT0iI0Y2REU1MSIgc3Ryb2tlLXdpZHRoPSIyLjUiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik0zOCA5MCBDNDUgODYgNTIgODggNjAgODggQzY4IDg4IDc1IDg2IDgyIDkwIEM3NSA5NCA2OCA5NSA2MCA5NSBDNTIgOTUgNDUgOTQgMzggOTAgWiIgZmlsbD0iI0Y2REU1MSIvPgogIDxwYXRoIGQ9Ik00MiA5MCBRNjAgOTggNzggOTAgUTYwIDk0IDQyIDkwIFoiIGZpbGw9IiMwMDc0NEIiLz4KPC9zdmc+';
    static DEFAULT_DEPT_FALLBACK_SVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgMTIwIj4KICA8cGF0aCBkPSJNNjAgMTIgTDk2IDIyIEM5NiA2MiA4MiA5NCA2MCAxMDggQzM4IDk0IDI0IDYyIDI0IDIyIFoiIGZpbGw9IiMxMzJFMjIiIHN0cm9rZT0iI0Y2REU1MSIgc3Ryb2tlLXdpZHRoPSIzLjUiLz4KICA8cGF0aCBkPSJNNjAgMTggTDkxIDI2LjUgQzkxIDYwIDc4IDg5IDYwIDEwMSBDNDIgODkgMjkgNjAgMjkgMjYuNSBaIiBmaWxsPSIjMUI0RDM2IiBzdHJva2U9IiMwMEMwOEEiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgPHBhdGggZD0iTTMzIDMwIFE2MCAyMiA4NyAzMCBMODUgMzggUTYwIDMxIDM1IDM4IFoiIGZpbGw9IiNGNkRFNTEiLz4KICA8dGV4dCB4PSI2MCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjciIGZvbnQtd2VpZ2h0PSI5MDAiIGZpbGw9IiMxMzJFMjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJBTkdLT0s8L3RleHQ+CiAgPGxpbmUgeDE9IjYwIiB5MT0iNDIiIHgyPSI2MCIgeTI9Ijg0IiBzdHJva2U9IiNGNkRFNTEiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPHBvbHlnb24gcG9pbnRzPSI2MCwzOSA1Nyw0NCA2Myw0NCIgZmlsbD0iI0Y2REU1MSIvPgogIDxsaW5lIHgxPSI1MyIgeTE9Ijg0IiB4Mj0iNjciIHkyPSI4NCIgc3Ryb2tlPSIjRjZERTUxIiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPGxpbmUgeDE9IjQwIiB5MT0iNTIiIHgyPSI4MCIgeTI9IjUyIiBzdHJva2U9IiNGNkRFNTEiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjUyIiByPSIzIiBmaWxsPSIjRkZGRkZGIi8+CiAgPGxpbmUgeDE9IjQwIiB5MT0iNTIiIHgyPSIzNSIgeTI9IjY1IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxsaW5lIHgxPSI0MCIgeTE9IjUyIiB4Mj0iNDUiIHkyPSI2NSIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cGF0aCBkPSJNMzMgNjUgUTQwIDcwIDQ3IDY1IFoiIGZpbGw9IiNGNkRFNTEiLz4KICA8bGluZSB4MT0iODAiIHkxPSI1MiIgeDI9Ijc1IiB5Mj0iNjUiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPGxpbmUgeDE9IjgwIiB5MT0iNTIiIHgyPSI4NSIgeTI9IjY1IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxwYXRoIGQ9Ik03MyA2NSBRODAgNzAgODcgNjUgWiIgZmlsbD0iI0Y2REU1MSIvPgogIDxjaXJjbGUgY3g9IjYwIiBjeT0iNzQiIHI9IjUiIGZpbGw9IiMwMDc0NEIiIHN0cm9rZT0iI0Y2REU1MSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8cG9seWdvbiBwb2ludHM9IjYwLDcwIDYxLjUsNzMgNjUsNzQgNjEuNSw3NSA2MCw3OCA1OC41LDc1IDU1LDc0IDU4LjUsNzMiIGZpbGw9IiNGNkRFNTEiLz4KPC9zdmc+';

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
            window.location.replace('index.html');
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
                window.location.replace('index.html');
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
            window.location.replace('loading.html?entry=' + encodeURIComponent(this.#entryMode));
        });

        document.getElementById('btnBackToLogin')?.addEventListener('click', () => {
            this.#clearWatchdog();
            AuthService.clearSession();
            window.location.replace('index.html');
        });
    }

    #hydrateFromLocalBrandCache() {
        try {
            const raw = localStorage.getItem(LoadingController.BRAND_STORAGE_KEY);
            if (!raw) return;
            const b = JSON.parse(raw);
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

            if (b.logoUrl) {
                this.#sanitizeAndApplyLogoCssVar('--logo-dept', b.logoUrl, LoadingController.DEFAULT_DEPT_FALLBACK_SVG);
            }
            if (b.bmaLogoUrl) {
                this.#sanitizeAndApplyLogoCssVar('--logo-bma', b.bmaLogoUrl, LoadingController.DEFAULT_BMA_FALLBACK_SVG);
            }
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
            this.#applyLiveSettingsBranding(settingsResult.value);
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

    #applyLiveSettingsBranding(settings) {
        if (!settings) return;

        const orgName = settings.organization_name || 'กรุงเทพมหานคร';
        const bureauName = settings.bureau_name || 'สำนักเทศกิจ';
        const headerTitle = settings.header_system_title || 'BMA e-Government Time Attendance System';
        const logoUrl = settings.logo_url || '';

        const orgEl = document.getElementById('ldOrgName');
        const bureauEl = document.getElementById('ldBureauName');
        const titleEl = document.getElementById('ldSystemTitle');

        if (orgEl) orgEl.textContent = orgName;
        if (bureauEl) bureauEl.textContent = bureauName;
        if (titleEl) titleEl.textContent = headerTitle;

        // แปลง URL Google Drive ให้เป็น Direct Thumbnail Link ก่อนบันทึกแคช
        let normalizedLogoUrl = '';
        if (logoUrl) {
            const isGoogleDrive = /(?:drive\.google\.com|docs\.google\.com|lh3\.googleusercontent\.com)/i.test(logoUrl);
            if (isGoogleDrive) {
                const driveMatch = String(logoUrl).match(/(?:\/d\/|[?&]id=|\/file\/d\/)([-\w]{20,})/);
                normalizedLogoUrl = driveMatch && driveMatch[1] ? `https://lh3.googleusercontent.com/d/${driveMatch[1]}` : logoUrl;
            } else {
                normalizedLogoUrl = logoUrl;
            }
        }

        // บันทึกลง Local Brand Cache สำหรับการเปิดครั้งถัดไป
        try {
            const brandPayload = {
                orgName,
                bureauName,
                headerSystemTitle: headerTitle,
                logoUrl: normalizedLogoUrl,
                bmaLogoUrl: LoadingController.DEFAULT_BMA_LOGO
            };
            localStorage.setItem(LoadingController.BRAND_STORAGE_KEY, JSON.stringify(brandPayload));
        } catch (_) {}

        if (normalizedLogoUrl) {
            this.#sanitizeAndApplyLogoCssVar('--logo-dept', normalizedLogoUrl, LoadingController.DEFAULT_DEPT_FALLBACK_SVG);
        } else {
            this.#sanitizeAndApplyLogoCssVar('--logo-dept', '', LoadingController.DEFAULT_DEPT_FALLBACK_SVG);
        }
    }

    async #sanitizeAndApplyLogoCssVar(varName, rawUrl, fallbackUrl) {
        const fallback = fallbackUrl || (varName === '--logo-bma' ? LoadingController.DEFAULT_BMA_FALLBACK_SVG : LoadingController.DEFAULT_DEPT_FALLBACK_SVG);
        const clean = String(rawUrl || '').trim();
        if (!clean) {
            document.documentElement.style.setProperty(varName, `url('${fallback}')`);
            return;
        }

        // ตรวจสอบความปลอดภัยของ URL ป้องกัน CSS Injection
        const isSafeProtocol = /^(?:https?:\/\/[^\s'"()<>]+|data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)$/i.test(clean);
        if (!isSafeProtocol) {
            document.documentElement.style.setProperty(varName, `url('${fallback}')`);
            return;
        }

        // แปลง URL Google Drive ให้เป็น Direct Thumbnail Link (ถ้าเข้าข่าย)
        let resolvedUrl = clean;
        const isGoogleDrive = /(?:drive\.google\.com|docs\.google\.com|lh3\.googleusercontent\.com)/i.test(clean);
        if (isGoogleDrive) {
            const driveMatch = clean.match(/(?:\/d\/|[?&]id=|\/file\/d\/)([-\w]{20,})/);
            if (driveMatch && driveMatch[1]) {
                resolvedUrl = `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
            }
        }

        // Preload รูปภาพก่อนเปลี่ยน Property เพื่อความราบรื่น
        try {
            await new Promise((resolve) => {
                const img = new Image();
                let settled = false;
                const timer = setTimeout(() => {
                    if (!settled) {
                        settled = true;
                        resolve(false);
                    }
                }, 1800);

                img.onload = () => {
                    if (!settled) {
                        settled = true;
                        clearTimeout(timer);
                        resolve(true);
                    }
                };
                img.onerror = () => {
                    if (!settled) {
                        settled = true;
                        clearTimeout(timer);
                        resolve(false);
                    }
                };
                img.src = resolvedUrl;
            }).then((success) => {
                const target = success ? resolvedUrl : fallback;
                const sanitized = target.replace(/['"\\]/g, '');
                document.documentElement.style.setProperty(varName, `url('${sanitized}')`);
            });
        } catch (_) {
            document.documentElement.style.setProperty(varName, `url('${fallback}')`);
        }
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
        window.location.replace(targetUrl);
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
