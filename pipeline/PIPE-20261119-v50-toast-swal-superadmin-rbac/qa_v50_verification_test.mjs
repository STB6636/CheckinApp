/**
 * @file pipeline/PIPE-20261119-v50-toast-swal-superadmin-rbac/qa_v50_verification_test.mjs
 * @description Dedicated QA Verification Suite for V50 Rev 2:
 *   1) Dynamic prefix-free Welcome Toast (NO hardcoded Thai prefix list; reads system_settings.prefixes + personnel)
 *   2) Soft UI Dashboard SweetAlert2 confirmWithInput popup on checkin.html & time-corrections.html (Playwright 390x844)
 *   3) SuperAdmin Time Correction Approval RBAC (6 executive titles incl. เลขานุการ & เลขานุการสำนัก, division/bureau scope)
 *   4) Mobile shortcut label 'อนุมัติแก้เวลา' & 10-HTML Cache Version Sync
 */

import assert from 'node:assert';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT_DIR = path.resolve(process.cwd());
const HTML_PAGES_10 = [
    'index.html',
    'loading.html',
    'checkin.html',
    'dashboard.html',
    'approvals.html',
    'time-corrections.html',
    'reports.html',
    'settings.html',
    'personnel.html',
    'users.html'
];

let passed = 0;
let failed = 0;

function runTest(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ✅ [PASS] #${String(passed + failed).padStart(2, '0')}: ${name}`);
    } catch (err) {
        failed++;
        console.error(`  ❌ [FAIL] #${String(passed + failed).padStart(2, '0')}: ${name}`);
        console.error(`     ${err.stack || err.message}`);
    }
}

async function runAsyncTest(name, fn) {
    try {
        await fn();
        passed++;
        console.log(`  ✅ [PASS] #${String(passed + failed).padStart(2, '0')}: ${name}`);
    } catch (err) {
        failed++;
        console.error(`  ❌ [FAIL] #${String(passed + failed).padStart(2, '0')}: ${name}`);
        console.error(`     ${err.stack || err.message}`);
    }
}

function createDomStubs() {
    const storeLocal = new Map();
    const storeSession = new Map();
    const classSet = new Set();

    globalThis.localStorage = {
        getItem: (k) => (storeLocal.has(k) ? storeLocal.get(k) : null),
        setItem: (k, v) => storeLocal.set(k, String(v)),
        removeItem: (k) => storeLocal.delete(k),
        clear: () => storeLocal.clear()
    };
    globalThis.sessionStorage = {
        getItem: (k) => (storeSession.has(k) ? storeSession.get(k) : null),
        setItem: (k, v) => storeSession.set(k, String(v)),
        removeItem: (k) => storeSession.delete(k),
        clear: () => storeSession.clear()
    };
    globalThis.document = {
        documentElement: {
            classList: {
                contains: (c) => classSet.has(c),
                add: (c) => classSet.add(c),
                remove: (c) => classSet.delete(c),
                toggle: (c) => (classSet.has(c) ? (classSet.delete(c), false) : (classSet.add(c), true))
            }
        },
        getElementById: () => null,
        createElement: () => ({ id: '', className: '', innerHTML: '', classList: { add: () => {} } }),
        body: { appendChild: () => {} }
    };
    globalThis.window = {
        location: { pathname: '/checkin.html', protocol: 'http:', search: '', hash: '' },
        history: { replaceState: () => {} },
        dispatchEvent: () => {},
        addEventListener: () => {}
    };
}

function startStaticServer() {
    const mimeMap = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.mjs': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };

    const server = http.createServer((req, res) => {
        try {
            const reqUrl = new URL(req.url || '/', 'http://127.0.0.1');
            let relPath = decodeURIComponent(reqUrl.pathname).replace(/^\/+/, '');
            if (!relPath) relPath = 'index.html';
            const filePath = path.resolve(ROOT_DIR, relPath);
            if (!filePath.startsWith(ROOT_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
            fs.createReadStream(filePath).pipe(res);
        } catch (err) {
            res.writeHead(500);
            res.end(String(err.message || err));
        }
    });

    return new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => {
            const addr = server.address();
            resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
        });
    });
}

async function main() {
    console.log('======================================================================');
    console.log('🧪 Starting V50 Rev 2 QA Verification Suite');
    console.log('======================================================================\n');

    createDomStubs();
    const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');
    const { AuthService } = await import('../../assets/js/core/AuthService.js');
    const { AppLayout } = await import('../../assets/js/components/AppLayout.js');
    const { Config } = await import('../../assets/js/core/Config.js');

    console.log('▶️ Suite 1: Dynamic Prefix-Free Welcome Name & Toast Formatting');
    runTest('UIHelpers.formatWelcomeDisplayName has NO hardcoded Thai prefix list and strips dynamic prefixes longest-first', () => {
        const uiSrc = fs.readFileSync(path.join(ROOT_DIR, 'assets/js/core/UIHelpers.js'), 'utf8');
        const fnMatch = uiSrc.match(/static formatWelcomeDisplayName\([\s\S]*?\n    \}/);
        assert.ok(fnMatch, 'formatWelcomeDisplayName method must exist in UIHelpers.js');
        for (const hardcodedPrefix of ['นาย', 'นาง', 'นางสาว', 'ว่าที่ร้อยเอก', 'ว่าที่ร้อยตรี']) {
            assert.strictEqual(
                fnMatch[0].includes(`'${hardcodedPrefix}'`) || fnMatch[0].includes(`"${hardcodedPrefix}"`),
                false,
                `formatWelcomeDisplayName must NOT hardcode prefix '${hardcodedPrefix}'`
            );
        }

        // Priority 1: personnel.first_name + last_name
        assert.strictEqual(
            UIHelpers.formatWelcomeDisplayName({
                full_name: 'ว่าที่ร้อยเอก อัษฎาวุธ ก๋ามะ',
                personnel: { prefix: 'ว่าที่ร้อยเอก', first_name: 'อัษฎาวุธ', last_name: 'ก๋ามะ' }
            }),
            'อัษฎาวุธ ก๋ามะ'
        );

        // Priority 2: dynamic prefixes from system_settings.prefixes (longest-first + regex-safe)
        const dynamicPrefixes = ['นาง', 'นาย', 'นางสาว', 'ว่าที่ร้อยเอก', 'จ่าสิบเอก', 'น.ส.'];
        assert.strictEqual(UIHelpers.formatWelcomeDisplayName('ว่าที่ร้อยเอก อัษฎาวุธ ก๋ามะ', dynamicPrefixes), 'อัษฎาวุธ ก๋ามะ');
        assert.strictEqual(UIHelpers.formatWelcomeDisplayName('นางสาวสมหญิง ใจดี', dynamicPrefixes), 'สมหญิง ใจดี');
        assert.strictEqual(UIHelpers.formatWelcomeDisplayName('นางมาลี ใจดี', dynamicPrefixes), 'มาลี ใจดี');
        assert.strictEqual(UIHelpers.formatWelcomeDisplayName('จ่าสิบเอก วินัย ภักดี', dynamicPrefixes), 'วินัย ภักดี');
        assert.strictEqual(UIHelpers.formatWelcomeDisplayName('น.ส.อรุณี สดใส', dynamicPrefixes), 'อรุณี สดใส');
        assert.strictEqual(UIHelpers.formatWelcomeDisplayName('นายอัษฎาวุธ ก๋ามะ', dynamicPrefixes), 'อัษฎาวุธ ก๋ามะ');

        // Fallback from localStorage CACHED_SETTINGS when prefixes param omitted
        localStorage.setItem(Config.STORAGE_KEYS.CACHED_SETTINGS, JSON.stringify({
            prefixes: ['พลตำรวจเอก']
        }));
        assert.strictEqual(UIHelpers.formatWelcomeDisplayName('พลตำรวจเอก สมชาย กล้าหาญ'), 'สมชาย กล้าหาญ');
        localStorage.removeItem(Config.STORAGE_KEYS.CACHED_SETTINGS);
    });

    await runAsyncTest('AppLayout.checkAndShowWelcomeToast emits exact "ยินดีต้อนรับคุณ<name>" (no space) and empty fallback', async () => {
        const shownToasts = [];
        const origShowToast = UIHelpers.showToast;
        UIHelpers.showToast = (msg, type, dur) => { shownToasts.push({ msg, type, dur }); };

        try {
            localStorage.setItem(Config.STORAGE_KEYS.CACHED_SETTINGS, JSON.stringify({
                prefixes: ['นาย', 'ว่าที่ร้อยเอก', 'จ่าสิบเอก']
            }));
            sessionStorage.setItem(Config.STORAGE_KEYS.WELCOME_TOAST, 'นายอัษฎาวุธ ก๋ามะ');
            AppLayout.checkAndShowWelcomeToast({ full_name: 'นายอัษฎาวุธ ก๋ามะ' });
            await new Promise(r => setTimeout(r, 260));
            assert.strictEqual(shownToasts[0]?.msg, 'ยินดีต้อนรับคุณอัษฎาวุธ ก๋ามะ');

            // Empty after prefix strip fallback
            sessionStorage.setItem(Config.STORAGE_KEYS.WELCOME_TOAST, 'นาย');
            AppLayout.checkAndShowWelcomeToast({});
            await new Promise(r => setTimeout(r, 260));
            assert.strictEqual(shownToasts[1]?.msg, 'ยินดีต้อนรับเข้าสู่ระบบ');
        } finally {
            UIHelpers.showToast = origShowToast;
            localStorage.removeItem(Config.STORAGE_KEYS.CACHED_SETTINGS);
        }
    });

    console.log('\n▶️ Suite 2: SuperAdmin Time Correction Approval RBAC Matrix');
    runTest('AuthService.canApproveTimeCorrection allows SuperAdmin & in-scope Executive Admin (6 titles incl. เลขานุการ & เลขานุการสำนัก) for SuperAdmin requests', () => {
        const superReq = {
            id: 'req-sa-1',
            user_id: 'u-sa-req',
            personnel_id: 'p-sa-req',
            bureau: 'สำนักเทศกิจ',
            division: 'สำนักงานเลขานุการ',
            requester_role: 'SuperAdmin'
        };

        const superApprover = { id: 'u-sa-2', personnel_id: 'p-sa-2', role: 'SuperAdmin', visibility_level: 'all' };
        const selfSuperApprover = { id: 'u-sa-req', personnel_id: 'p-sa-req', role: 'SuperAdmin', visibility_level: 'all' };
        assert.strictEqual(AuthService.canApproveTimeCorrection(superApprover, superReq).allowed, true);
        assert.strictEqual(AuthService.canApproveTimeCorrection(selfSuperApprover, superReq).allowed, true);

        const expectedTitles = ['ผู้อำนวยการส่วน', 'ผู้อำนวยการกอง', 'เลขานุการ', 'เลขานุการสำนัก', 'หัวหน้ากลุ่มงาน', 'หัวหน้าฝ่าย'];
        assert.deepStrictEqual(AuthService.EXECUTIVE_APPROVER_POSITION_TITLES, expectedTitles);

        // Division-scoped & Bureau-scoped Executive Admins across all 6 titles CAN approve SuperAdmin requests
        for (const title of expectedTitles) {
            const divExecAdmin = {
                id: 'u-adm-div',
                personnel_id: 'p-adm-div',
                role: 'Admin',
                visibility_level: 'division',
                scope_bureau: 'สำนักเทศกิจ',
                scope_division: 'สำนักงานเลขานุการ',
                personnel: { position_type: 'ประเภทผู้บริหาร', position_title: title }
            };
            const bureauExecAdmin = {
                id: 'u-adm-bur',
                personnel_id: 'p-adm-bur',
                role: 'Admin',
                visibility_level: 'bureau',
                scope_bureau: 'สำนักเทศกิจ',
                personnel: { position_type: 'ประเภทผู้บริหาร', position_title: title }
            };
            assert.strictEqual(AuthService.canApproveTimeCorrection(divExecAdmin, superReq).allowed, true, `div exec '${title}' allowed`);
            assert.strictEqual(AuthService.canApproveTimeCorrection(bureauExecAdmin, superReq).allowed, true, `bureau exec '${title}' allowed`);
        }

        // Non-exec Admin blocked
        const nonExecAdmin = {
            id: 'u-adm-nonexec',
            personnel_id: 'p-adm-nonexec',
            role: 'Admin',
            visibility_level: 'bureau',
            scope_bureau: 'สำนักเทศกิจ',
            personnel: { position_type: 'ประเภททั่วไป', position_title: 'เจ้าพนักงานเทศกิจ' }
        };
        const nonExecRes = AuthService.canApproveTimeCorrection(nonExecAdmin, superReq);
        assert.strictEqual(nonExecRes.allowed, false);
        assert.strictEqual(nonExecRes.reason, 'สงวนสิทธิ์อนุมัติเฉพาะผู้บริหาร / SuperAdmin');

        // Out-of-scope Executive Admin blocked
        const outOfScopeExec = {
            id: 'u-adm-oos',
            personnel_id: 'p-adm-oos',
            role: 'Admin',
            visibility_level: 'division',
            scope_bureau: 'สำนักเทศกิจ',
            scope_division: 'กองตรวจและปฏิบัติการพื้นที่ 1',
            personnel: { position_type: 'ประเภทผู้บริหาร', position_title: 'เลขานุการ' }
        };
        const oosRes = AuthService.canApproveTimeCorrection(outOfScopeExec, superReq);
        assert.strictEqual(oosRes.allowed, false);
        assert.strictEqual(oosRes.reason, 'อยู่นอกขอบเขตสังกัดที่รับผิดชอบ');
    });

    console.log('\n▶️ Suite 3: Mobile Shortcut Label & 10-HTML Cache Sync');
    runTest('AppLayout mobile shortcut uses "อนุมัติแก้เวลา" & all 10 root HTMLs match version.json buildId', () => {
        const html = AppLayout.getMobileShortcutGridHtml({ role: 'SuperAdmin' });
        assert.ok(html.includes('>อนุมัติแก้เวลา<'), 'Mobile shortcut label must be "อนุมัติแก้เวลา"');
        assert.strictEqual(html.includes('อนุมัติแก้ไขเวลา'), false, 'Old long label must not appear in shortcut grid');

        const versionJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'version.json'), 'utf8'));
        const buildId = versionJson.buildId;
        assert.ok(buildId, 'version.json missing buildId');
        for (const pageFile of HTML_PAGES_10) {
            const pageHtml = fs.readFileSync(path.join(ROOT_DIR, pageFile), 'utf8');
            assert.ok(pageHtml.includes(`CURRENT_APP_BUILD = '${buildId}'`), `${pageFile} CURRENT_APP_BUILD mismatch`);
            assert.ok(pageHtml.includes(`?v=${buildId}`), `${pageFile} ?v= mismatch`);
        }
    });

    console.log('\n▶️ Suite 4: Playwright Real-Browser Verification (390x844)');
    const pwMod = await import(pathToFileURL('C:/Users/OliMal2u/AppData/Local/Programs/Python/Python314/Lib/site-packages/playwright/driver/package/index.mjs').href);
    const { server, baseUrl } = await startStaticServer();
    const browser = await pwMod.chromium.launch({ headless: true });

    try {
        const versionJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'version.json'), 'utf8'));
        const buildId = versionJson.buildId;
        const baseSettings = {
            id: 1,
            organization_name: 'กรุงเทพมหานคร',
            bureau_name: 'สำนักเทศกิจ',
            standard_check_in: '08:30',
            standard_check_out: '16:30',
            late_threshold_minutes: 30,
            checkout_grace_minutes: 30,
            prefixes: ['นาย', 'นาง', 'นางสาว', 'ว่าที่ร้อยเอก', 'ว่าที่ร้อยตรี', 'จ่าสิบเอก'],
            work_shifts: [
                { name: 'เวลาราชการปกติ', check_in: '08:30', check_out: '16:30', is_overtime: false, is_custom: false }
            ],
            official_locations: [
                { id: 'loc1', name: 'สำนักเทศกิจ', lat: 13.7563, lng: 100.5018, radius: 500, is_active: true }
            ],
            category_colors: {
                normal: '#00744B',
                overtime: '#0971CE',
                late: '#D97706',
                absent_duty: '#EA580C',
                no_checkin: '#E11D48'
            },
            announcement_enabled: false
        };

        await runAsyncTest('checkin.html (390x844): Prefix-free Welcome Toast & Soft UI confirmWithInput popup ("ยืนยันส่งคำขอแก้ไขเวลา")', async () => {
            const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
            const ctx = await browser.newContext({
                viewport: { width: 390, height: 844 },
                permissions: ['geolocation'],
                geolocation: { latitude: 13.7563, longitude: 100.5018 }
            });
            const page = await ctx.newPage();

            const loginUser = {
                id: 'usr-v50-1',
                personnel_id: 'per-v50-1',
                username: 'asada',
                full_name: 'ว่าที่ร้อยเอก อัษฎาวุธ ก๋ามะ',
                role: 'User',
                visibility_level: 'none',
                is_active: true,
                personnel: {
                    id: 'per-v50-1',
                    prefix: 'ว่าที่ร้อยเอก',
                    first_name: 'อัษฎาวุธ',
                    last_name: 'ก๋ามะ',
                    position_type: 'ข้าราชการ',
                    position_title: 'เจ้าพนักงานเทศกิจ',
                    bureau: 'สำนักเทศกิจ',
                    division: 'สำนักงานเลขานุการ'
                },
                expires_at: Date.now() + 86400000
            };

            const corrLog = {
                id: 'log-v50-1',
                personnel_id: 'per-v50-1',
                user_id: 'usr-v50-1',
                work_date: '2026-11-18',
                shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
                check_in_time: '08:45',
                check_out_time: '16:35',
                status: 'มาสาย',
                is_special_request: false,
                is_overtime: false,
                correction_status: 'none'
            };

            await page.addInitScript(({ bId, sess }) => {
                localStorage.setItem('bma_app_build', bId);
                localStorage.setItem('bma_checkin_session_user_v2_7', JSON.stringify(sess));
                localStorage.setItem('bma_last_seen_announcement_id', 'qa-seen');
                sessionStorage.setItem('bma_reloaded_build', bId);
                // Simulate legacy or custom prefix string still in WELCOME_TOAST
                sessionStorage.setItem('bma_checkin_welcome_toast_v2_7', 'ว่าที่ร้อยเอก อัษฎาวุธ ก๋ามะ');
            }, { bId: buildId, sess: loginUser });

            await page.route('**/*.openstreetmap.org/**', r => r.abort());
            await page.route('**/*.supabase.co/**', async (route) => {
                const req = route.request();
                const u = req.url();
                const isSingle = (req.headers()['accept'] || '').includes('object') || u.includes('limit=1');
                if (u.includes('/system_settings')) {
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? baseSettings : [baseSettings]) });
                }
                if (u.includes('/user_accounts')) {
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? loginUser : [loginUser]) });
                }
                if (u.includes('/attendance_logs')) {
                    if (req.method() === 'PATCH') {
                        const patch = req.postDataJSON();
                        Object.assign(corrLog, patch);
                        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? corrLog : [corrLog]) });
                    }
                    if (u.includes('id=eq.log-v50-1')) {
                        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? corrLog : [corrLog]) });
                    }
                    if (u.includes('is_special_request=eq.true') || u.includes(`work_date=eq.${today}`)) {
                        return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
                    }
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([corrLog]) });
                }
                return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
            });

            await page.goto(`${baseUrl}/checkin.html`, { waitUntil: 'load' });
            await page.waitForSelector('#bmaToastWrapper .bma-toast-item');
            const toastText = await page.locator('#bmaToastWrapper .bma-toast-item').first().innerText();
            assert.ok(toastText.includes('ยินดีต้อนรับคุณอัษฎาวุธ ก๋ามะ'), `Expected prefix-free toast without space, got: ${toastText}`);
            assert.strictEqual(toastText.includes('ว่าที่ร้อยเอก'), false, 'Toast must strip prefix');

            await page.waitForFunction(() => document.getElementById('drawerCorrectionBadge')?.textContent === '1', { timeout: 15000 });
            await page.evaluate(() => {
                document.getElementById('bmaToastWrapper')?.remove();
                if (window.Swal?.isVisible()) window.Swal.close();
            });
            await page.click('#btnMobileHistoryMenu');
            await page.waitForSelector('#btnDrawerNavCorrection');
            await page.click('#btnDrawerNavCorrection');
            await page.waitForSelector('#personalTimeCorrectionCardsContainer [data-action="request-time-correction"]');
            await page.click('#personalTimeCorrectionCardsContainer [data-action="request-time-correction"]');
            await page.waitForSelector('.swal2-popup #swalCorrectionReasonInput');

            const swalAudit = await page.evaluate(() => {
                const popup = document.querySelector('.swal2-popup');
                const confirmBtn = document.querySelector('.swal2-confirm');
                const cancelBtn = document.querySelector('.swal2-cancel');
                const titleEl = document.querySelector('.swal2-title');
                return {
                    popupClass: popup?.className || '',
                    confirmClass: confirmBtn?.className || '',
                    cancelClass: cancelBtn?.className || '',
                    titleClass: titleEl?.className || '',
                    titleText: titleEl?.textContent?.trim() || '',
                    confirmStyled: confirmBtn?.classList.contains('swal2-styled')
                };
            });

            assert.strictEqual(swalAudit.titleText, 'ยืนยันส่งคำขอแก้ไขเวลา');
            assert.ok(swalAudit.popupClass.includes('rounded-2xl') && swalAudit.popupClass.includes('backdrop-blur-md'), 'Swal popup must use Soft UI rounded-2xl + backdrop-blur-md');
            assert.ok(swalAudit.confirmClass.includes('bg-gradient-to-tl') && swalAudit.confirmClass.includes('from-[#00744B]'), 'Confirm button must use BMA emerald gradient');
            assert.ok(swalAudit.cancelClass.includes('bg-slate-100'), 'Cancel button must use Soft UI slate style');
            assert.strictEqual(swalAudit.confirmStyled, false, 'buttonsStyling: false must remove default .swal2-styled');

            // Optional 1-click submit without typing reason
            await page.click('.swal2-confirm');
            await page.waitForFunction(() => document.getElementById('drawerCorrectionBadge')?.textContent !== '1', { timeout: 10000 });
            assert.strictEqual(corrLog.correction_status, 'pending');
            await ctx.close();
        });

        await runAsyncTest('time-corrections.html (390x844): Executive Admin ("เลขานุการ") can approve SuperAdmin request & Soft UI Reject popup works', async () => {
            const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
            const page = await ctx.newPage();

            const execSecretaryAdmin = {
                id: 'usr-adm-sec',
                personnel_id: 'per-adm-sec',
                username: 'adm_sec',
                full_name: 'นางสุภาพร เลขา',
                role: 'Admin',
                visibility_level: 'division',
                scope_bureau: 'สำนักเทศกิจ',
                scope_division: 'สำนักงานเลขานุการ',
                is_active: true,
                personnel: {
                    id: 'per-adm-sec',
                    prefix: 'นาง',
                    first_name: 'สุภาพร',
                    last_name: 'เลขา',
                    position_type: 'ประเภทผู้บริหาร',
                    position_title: 'เลขานุการ',
                    bureau: 'สำนักเทศกิจ',
                    division: 'สำนักงานเลขานุการ'
                },
                expires_at: Date.now() + 86400000
            };

            const seedAccounts = [
                { id: 'usr-adm-sec', personnel_id: 'per-adm-sec', role: 'Admin', visibility_level: 'division', is_active: true },
                { id: 'usr-sa-req', personnel_id: 'per-sa-req', role: 'SuperAdmin', visibility_level: 'all', is_active: true }
            ];

            const tcRows = [
                {
                    id: 'req-sa-target',
                    personnel_id: 'per-sa-req',
                    user_id: 'usr-sa-req',
                    work_date: '2026-11-18',
                    shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
                    check_in_time: '08:50',
                    check_out_time: '16:35',
                    status: 'มาสาย',
                    remark: '',
                    location_mode: 'ONSITE',
                    correction_status: 'pending',
                    correction_requested_at: '2026-11-18T02:00:00Z',
                    personnel: {
                        id: 'per-sa-req',
                        prefix: 'นาย',
                        first_name: 'ผู้ดูแล',
                        last_name: 'สูงสุด',
                        position_type: 'ประเภทวิชาการ',
                        position_title: 'นักวิชาการคอมพิวเตอร์',
                        position_level: 'ชำนาญการ',
                        bureau: 'สำนักเทศกิจ',
                        division: 'สำนักงานเลขานุการ',
                        work_group: 'กลุ่มงานการเจ้าหน้าที่'
                    }
                }
            ];

            await page.addInitScript(({ bId, sess }) => {
                localStorage.setItem('bma_app_build', bId);
                localStorage.setItem('bma_checkin_session_user_v2_7', JSON.stringify(sess));
                localStorage.setItem('bma_last_seen_announcement_id', 'qa-seen');
                sessionStorage.setItem('bma_reloaded_build', bId);
            }, { bId: buildId, sess: execSecretaryAdmin });

            await page.route('**/*.supabase.co/**', async (route) => {
                const req = route.request();
                const u = req.url();
                const isSingle = (req.headers()['accept'] || '').includes('object') || u.includes('limit=1');
                if (u.includes('/system_settings')) {
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? baseSettings : [baseSettings]) });
                }
                if (u.includes('/user_accounts')) {
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? seedAccounts[0] : seedAccounts) });
                }
                if (u.includes('/attendance_logs')) {
                    if (req.method() === 'PATCH') {
                        const patch = req.postDataJSON();
                        Object.assign(tcRows[0], patch);
                        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([tcRows[0]]) });
                    }
                    if (u.includes('is_special_request=eq.true')) {
                        return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
                    }
                    if (u.includes('correction_status=eq.pending')) {
                        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tcRows.filter(r => r.correction_status === 'pending')) });
                    }
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tcRows) });
                }
                return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
            });

            await page.goto(`${baseUrl}/time-corrections.html`, { waitUntil: 'load' });
            await page.waitForSelector('#timeCorrectionsCardsContainer [data-card-id="req-sa-target"]');

            const cardState = await page.evaluate(() => {
                const card = document.querySelector('#timeCorrectionsCardsContainer [data-card-id="req-sa-target"]');
                return {
                    hasApproveBtn: Boolean(card?.querySelector('[data-action="approve-single"]')),
                    hasRejectBtn: Boolean(card?.querySelector('[data-action="reject-single"]')),
                    hasCheckbox: Boolean(card?.querySelector('.chk-correction-row')),
                    hasBlockedBadge: card?.innerText.includes('สงวนสิทธิ์อนุมัติเฉพาะ') || false
                };
            });

            assert.strictEqual(cardState.hasApproveBtn, true, 'Executive Admin (เลขานุการ) must see Approve button for SuperAdmin request');
            assert.strictEqual(cardState.hasRejectBtn, true, 'Executive Admin (เลขานุการ) must see Reject button for SuperAdmin request');
            assert.strictEqual(cardState.hasCheckbox, true, 'Executive Admin (เลขานุการ) must see checkbox for SuperAdmin request');
            assert.strictEqual(cardState.hasBlockedBadge, false, 'SuperAdmin request must NOT show blocked badge for Executive Admin');

            // Test Soft UI confirmWithInput reject modal
            await page.click('#timeCorrectionsCardsContainer [data-card-id="req-sa-target"] [data-action="reject-single"]');
            await page.waitForSelector('.swal2-popup #swalCorrectionRejectReasonInput');
            const rejectAudit = await page.evaluate(() => ({
                popupClass: document.querySelector('.swal2-popup')?.className || '',
                confirmClass: document.querySelector('.swal2-confirm')?.className || '',
                confirmStyled: document.querySelector('.swal2-confirm')?.classList.contains('swal2-styled')
            }));
            assert.ok(rejectAudit.popupClass.includes('rounded-2xl'));
            assert.ok(rejectAudit.confirmClass.includes('from-rose-600'));
            assert.strictEqual(rejectAudit.confirmStyled, false);

            await page.click('.swal2-confirm');
            await page.waitForFunction(() => document.querySelector('.swal2-title')?.textContent?.includes('ดำเนินการสำเร็จ'), { timeout: 10000 });
            assert.strictEqual(tcRows[0].correction_status, 'rejected');
            await ctx.close();
        });
    } finally {
        await browser.close();
        server.close();
    }

    console.log('\n======================================================================');
    console.log(`📊 Test Summary: Total ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log('======================================================================');
    if (failed > 0) {
        process.exit(1);
    }
    console.log('🎉 ALL V50 REV 2 TESTS PASSED 100%!');
}

main().catch((err) => {
    console.error('❌ Fatal QA error:', err);
    process.exit(1);
});
