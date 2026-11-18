/**
 * qa_v48_mobile_modals_test.mjs
 * Dedicated Playwright + Static QA Suite for PIPE-20261118-admin-mobile-modals-clipping-fix (V48)
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'file:///C:/Users/OliMal2u/AppData/Local/Programs/Python/Python314/Lib/site-packages/playwright/driver/package/index.mjs';

const ROOT_DIR = process.cwd();
const HTML_PAGES_9 = [
    'index.html',
    'loading.html',
    'checkin.html',
    'dashboard.html',
    'approvals.html',
    'reports.html',
    'personnel.html',
    'settings.html',
    'users.html'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`  ✅ [PASS] #${String(totalTests).padStart(2, '0')}: ${name}`);
    } catch (err) {
        failedTests++;
        console.error(`  ❌ [FAIL] #${String(totalTests).padStart(2, '0')}: ${name}`);
        console.error(`     ${err.stack || err.message}`);
    }
}

async function runAsyncTest(name, fn) {
    totalTests++;
    try {
        await fn();
        passedTests++;
        console.log(`  ✅ [PASS] #${String(totalTests).padStart(2, '0')}: ${name}`);
    } catch (err) {
        failedTests++;
        console.error(`  ❌ [FAIL] #${String(totalTests).padStart(2, '0')}: ${name}`);
        console.error(`     ${err.stack || err.message}`);
    }
}

function checkBalancedHtmlTags(filePath, html) {
    const cleaned = html.replace(/<!--[\s\S]*?-->/g, '');
    const tagStack = [];
    const tagRe = /<\/?([a-zA-Z0-9\-]+)(?:\s+[^>]*)?>/g;
    const voidTags = new Set([
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype'
    ]);
    let m;
    while ((m = tagRe.exec(cleaned)) !== null) {
        const raw = m[0];
        const name = m[1].toLowerCase();
        if (voidTags.has(name) || raw.endsWith('/>')) continue;
        if (raw.startsWith('</')) {
            const last = tagStack.pop();
            assert.strictEqual(last, name, `${filePath} tag mismatch: expected </${last}> got </${name}>`);
        } else {
            tagStack.push(name);
        }
    }
    assert.strictEqual(tagStack.length, 0, `${filePath} unclosed tags: ${tagStack.join(', ')}`);
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
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
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
            res.writeHead(200, {
                'Content-Type': mimeMap[ext] || 'application/octet-stream',
                'Cache-Control': 'no-store'
            });
            fs.createReadStream(filePath).pipe(res);
        } catch (err) {
            res.writeHead(500);
            res.end(err.message);
        }
    });

    return new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => {
            const addr = server.address();
            resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
        });
    });
}

function buildMockSettingsRow() {
    return {
        id: 1,
        organization_name: 'กรุงเทพมหานคร',
        bureau_name: 'สำนักเทศกิจ',
        system_title: 'ระบบลงเวลาปฏิบัติราชการ (V48 QA)',
        standard_check_in: '08:30',
        standard_check_out: '16:30',
        late_grace_minutes: 15,
        geofence_radius_meters: 500,
        official_lat: 13.7563,
        official_lng: 100.5018,
        prefixes: ['นาย', 'นาง', 'นางสาว'],
        remarks: ['ปฏิบัติงานปกติ'],
        special_reasons: ['ไปราชการ', 'ประชุมสัมมนา'],
        offsite_job_types: ['ตรวจตราพื้นที่', 'อื่นๆ'],
        official_locations: [
            { id: 'loc1', name: 'สำนักเทศกิจ', lat: 13.7563, lng: 100.5018, radius: 500, is_active: true }
        ],
        work_shifts: [
            { name: 'เวลาราชการปกติ', check_in: '08:30', check_out: '16:30', is_overtime: false, is_custom: false }
        ],
        position_mappings: [
            { position_type: 'ข้าราชการ', position_title: 'เจ้าพนักงานเทศกิจ', position_level: 'ปฏิบัติการ' }
        ],
        affiliation_mappings: [
            { organization: 'กรุงเทพมหานคร', bureau: 'สำนักเทศกิจ', division: 'สำนักงานตรวจและบังคับการ', work_group: 'กลุ่มงานตรวจพื้นที่ 1' },
            { organization: 'กรุงเทพมหานคร', bureau: 'สำนักงานเขตพระนคร', division: 'ฝ่ายเทศกิจ', work_group: 'งานตรวจตรา' }
        ],
        announcement_enabled: false
    };
}

function buildMockSupabaseRows() {
    const settingsRow = buildMockSettingsRow();
    const personnelRow = {
        id: 'per-1',
        prefix: 'นาย',
        first_name: 'สมชาย',
        last_name: 'ใจดี',
        national_id: '1100100100101',
        position_type: 'ข้าราชการ',
        position_title: 'เจ้าพนักงานเทศกิจ',
        position_level: 'ปฏิบัติการ',
        organization: 'กรุงเทพมหานคร',
        bureau: 'สำนักเทศกิจ',
        division: 'สำนักงานตรวจและบังคับการ',
        work_group: 'กลุ่มงานตรวจพื้นที่ 1',
        is_active: true
    };
    const userRow = {
        id: 'usr-1',
        username: '1100100100101',
        full_name: 'นายสมชาย ใจดี',
        national_id: '1100100100101',
        role: 'SuperAdmin',
        visibility_level: 'bureau',
        scope_bureau: 'สำนักเทศกิจ',
        scope_division: 'สำนักงานตรวจและบังคับการ',
        personnel_id: 'per-1',
        is_active: true,
        password_reset_requested: false
    };
    const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const logRow = {
        id: 'log-1',
        log_id: 'log-1',
        personnel_id: 'per-1',
        work_date: today,
        check_in_time: '08:25',
        check_out_time: '16:35',
        shift_name: 'เวลาราชการปกติ',
        status_label: 'ปฏิบัติงานปกติ',
        location_name: 'สำนักเทศกิจ',
        check_out_location: 'สำนักเทศกิจ',
        location_mode: 'ONSITE',
        lat: 13.7563,
        lng: 100.5018,
        check_out_lat: 13.7563,
        check_out_lng: 100.5018,
        remark: 'ทดสอบระบบ',
        personnel: personnelRow
    };
    return { settingsRow, personnelRow, userRow, logRow };
}

async function setupBrowserPage(browser, buildId, viewport, options = {}) {
    const context = await browser.newContext({
        viewport,
        permissions: ['geolocation'],
        geolocation: { latitude: 13.7563, longitude: 100.5018 }
    });
    const page = await context.newPage();
    const { settingsRow, personnelRow, userRow, logRow } = buildMockSupabaseRows();

    const sessionPayload = options.loggedOut ? null : {
        id: 'usr-admin-1',
        username: 'admin_qa',
        full_name: 'ผู้ดูแลระบบ ทดสอบ',
        role: 'SuperAdmin',
        visibility_level: 'bureau',
        scope_bureau: 'สำนักเทศกิจ',
        scope_division: '',
        personnel_id: 'per-1',
        position_title: 'เจ้าพนักงานเทศกิจ',
        position_level: 'ชำนาญการ',
        is_active: true,
        last_login_mode: 'admin',
        last_active_at: Date.now(),
        expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000
    };

    await page.addInitScript(({ buildIdVal, sessionVal }) => {
        localStorage.setItem('bma_app_build', buildIdVal);
        if (sessionVal) {
            localStorage.setItem('bma_checkin_session_user_v2_7', JSON.stringify(sessionVal));
        } else {
            localStorage.removeItem('bma_checkin_session_user_v2_7');
        }
        localStorage.setItem('bma_last_seen_announcement_id', 'qa-seen');
        sessionStorage.setItem('bma_reloaded_build', buildIdVal);
    }, { buildIdVal: buildId, sessionVal: sessionPayload });

    await page.route('**/*.openstreetmap.org/**', (route) => route.abort());
    await page.route('**/*.supabase.co/**', async (route) => {
        const url = route.request().url();
        const accept = route.request().headers()['accept'] || '';
        const isSingle = accept.includes('vnd.pgrst.object+json') || url.includes('limit=1');
        let body = [];
        if (url.includes('/system_settings')) {
            body = isSingle ? settingsRow : [settingsRow];
        } else if (url.includes('/personnel')) {
            body = isSingle ? personnelRow : [personnelRow];
        } else if (url.includes('/user_accounts')) {
            body = isSingle ? userRow : [userRow];
        } else if (url.includes('/attendance_logs')) {
            body = [logRow];
        }
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(body)
        });
    });

    return { context, page };
}

async function assertModalGeometry(page, modalSelector, expectedZ, options = {}) {
    const res = await page.evaluate(({ sel, opts }) => {
        const modal = document.querySelector(sel);
        if (!modal) return { error: `Modal ${sel} not found` };
        const cs = getComputedStyle(modal);
        const card = modal.firstElementChild;
        const cardRect = card ? card.getBoundingClientRect() : modal.getBoundingClientRect();
        const header = card ? card.firstElementChild : null;
        const footer = card ? card.lastElementChild : null;
        const headerRect = header ? header.getBoundingClientRect() : cardRect;
        const footerRect = footer ? footer.getBoundingClientRect() : cardRect;
        const scrollables = Array.from(modal.querySelectorAll('.overflow-y-auto, .overflow-auto')).filter(el => el !== modal);
        const scrollInfo = scrollables.map(el => ({
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            scrollTop: el.scrollTop
        }));
        return {
            hidden: modal.classList.contains('hidden'),
            display: cs.display,
            zIndex: cs.zIndex,
            backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter || 'none',
            bodyLocked: document.body.classList.contains('bma-modal-open'),
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            cardTop: cardRect.top,
            cardBottom: cardRect.bottom,
            cardLeft: cardRect.left,
            cardRight: cardRect.right,
            headerTop: headerRect.top,
            footerBottom: footerRect.bottom,
            scrollInfo,
            modalScrollTop: modal.scrollTop
        };
    }, { sel: modalSelector, opts: options });

    assert.ok(!res.error, res.error);
    assert.strictEqual(res.hidden, false, `${modalSelector}: should be visible`);
    assert.strictEqual(res.display, 'flex', `${modalSelector}: display should be flex`);
    assert.strictEqual(res.zIndex, String(expectedZ), `${modalSelector}: zIndex must be ${expectedZ}, got ${res.zIndex}`);
    if (!options.skipBlurCheck) {
        assert.notStrictEqual(res.backdropFilter, 'none', `${modalSelector}: backdropFilter must compile (no Tailwind v4 backdrop-blur-xs)`);
    }
    assert.strictEqual(res.bodyLocked, true, `${modalSelector}: body.bma-modal-open must be active while open`);
    assert.ok(res.headerTop >= -1, `${modalSelector}: headerTop (${res.headerTop}) clipped above viewport!`);
    assert.ok(res.footerBottom <= res.innerHeight + 1, `${modalSelector}: footerBottom (${res.footerBottom}) exceeds innerHeight (${res.innerHeight})!`);
    assert.ok(res.cardLeft >= -1 && res.cardRight <= res.innerWidth + 1, `${modalSelector}: horizontal overflow [${res.cardLeft}, ${res.cardRight}] vs ${res.innerWidth}`);
    return res;
}

async function main() {
    console.log('======================================================================');
    console.log('🧪 Starting V48 Mobile Modals Clipping Fix QA Suite (Playwright + Static)');
    console.log('======================================================================\n');

    const versionJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'version.json'), 'utf8'));
    const buildId = versionJson.buildId;

    console.log('▶️ Suite 1: Static & Contract Verification');
    runTest('Zero backdrop-blur-xs remains in HTML/JS files and all 6 modified HTML files have balanced tags', () => {
        const htmlTargets = ['personnel.html', 'users.html', 'reports.html', 'settings.html', 'index.html', 'checkin.html'];
        for (const f of htmlTargets) {
            const content = fs.readFileSync(path.join(ROOT_DIR, f), 'utf8');
            assert.strictEqual(content.includes('backdrop-blur-xs'), false, `${f} still contains backdrop-blur-xs`);
            checkBalancedHtmlTags(f, content);
        }
        const jsTargets = [
            'assets/js/components/AppLayout.js',
            'assets/js/components/SystemUpdateModal.js'
        ];
        for (const f of jsTargets) {
            const content = fs.readFileSync(path.join(ROOT_DIR, f), 'utf8');
            assert.strictEqual(content.includes('backdrop-blur-xs'), false, `${f} still contains backdrop-blur-xs`);
        }
    });

    runTest('bma-theme.css enforces body.bma-modal-open lock, drops legacy #modalPersonnelResumeProfile override, preserves #modalSettingsBody & Swal2 z-index', () => {
        const css = fs.readFileSync(path.join(ROOT_DIR, 'assets/css/bma-theme.css'), 'utf8');
        assert.ok(css.includes('body.bma-modal-open'), 'Missing body.bma-modal-open rule');
        assert.ok(css.includes('#modalSettingsBody {\r\n    display: block !important;\r\n}') || css.includes('#modalSettingsBody {\n    display: block !important;\n}'), 'Missing #modalSettingsBody block override');
        assert.ok(css.includes('.swal2-container {\r\n    z-index: 99990 !important;\r\n}') || css.includes('.swal2-container {\n    z-index: 99990 !important;\n}'), 'Missing .swal2-container z-index');
        assert.strictEqual(css.includes('#modalPersonnelResumeProfile > div'), false, 'Legacy #modalPersonnelResumeProfile > div override must be removed');
    });

    runTest('Preserved literals & 9-HTML cache version sync match version.json', () => {
        const reportsCtrl = fs.readFileSync(path.join(ROOT_DIR, 'assets/js/controllers/ReportsController.js'), 'utf8');
        assert.ok(reportsCtrl.includes("document.getElementById('modalPersonnelResumeProfile')?.classList.remove('hidden');"));
        const checkinCtrl = fs.readFileSync(path.join(ROOT_DIR, 'assets/js/controllers/CheckinController.js'), 'utf8');
        assert.ok(checkinCtrl.includes("document.getElementById('btnOpenSpecialFromDesktopTab')?.addEventListener('click', openSpecialModal);"));
        for (const htmlFile of HTML_PAGES_9) {
            const html = fs.readFileSync(path.join(ROOT_DIR, htmlFile), 'utf8');
            assert.ok(html.includes(`CURRENT_APP_BUILD = '${buildId}'`), `${htmlFile} CURRENT_APP_BUILD mismatch`);
            assert.ok(html.includes(`?v=${buildId}`), `${htmlFile} asset ?v= mismatch`);
        }
    });

    console.log('\n▶️ Suite 2: Playwright Real-Browser Mobile Viewport Verification');
    const { server, baseUrl } = await startStaticServer();
    const browser = await chromium.launch({ headless: true });

    try {
        await runAsyncTest('personnel.html (390x844 & 390x420): Add/Edit, Resume Profile & Bulk Import modals fit viewport without bottom clipping, scroll cleanly, reset scrollTop, and dismiss via backdrop/ESC', async () => {
            const { context, page } = await setupBrowserPage(browser, buildId, { width: 390, height: 844 });
            try {
                await page.goto(`${baseUrl}/personnel.html`, { waitUntil: 'load' });
                await page.waitForSelector('#btnOpenAddPersonnel');

                // 1) Add/Edit Form Modal
                await page.click('#btnOpenAddPersonnel');
                await assertModalGeometry(page, '#modalPersonnelForm', 9990);
                await page.evaluate(() => {
                    const body = document.querySelector('#formPersonnel .overflow-y-auto');
                    if (body) body.scrollTop = 220;
                });
                await page.keyboard.press('Escape');
                await page.waitForFunction(() => document.getElementById('modalPersonnelForm')?.classList.contains('hidden'));
                assert.strictEqual(await page.evaluate(() => document.body.classList.contains('bma-modal-open')), false);

                // Reopen & verify scrollTop reset + backdrop click
                await page.click('#btnOpenAddPersonnel');
                const scrollReset = await page.evaluate(() => document.querySelector('#formPersonnel .overflow-y-auto')?.scrollTop ?? -1);
                assert.strictEqual(scrollReset, 0, 'Personnel form body scrollTop must reset to 0 on reopen');
                await page.mouse.click(5, 5);
                await page.waitForFunction(() => document.getElementById('modalPersonnelForm')?.classList.contains('hidden'));

                // 2) Resume Profile Modal at 390x844 & 390x420
                await page.waitForSelector('#personnelCardsContainer [data-person-id]');
                await page.click('#personnelCardsContainer [data-person-id]');
                const resumeGeom = await assertModalGeometry(page, '#modalPersonnelResumeProfile', 9990);
                assert.ok(resumeGeom.footerBottom <= 844, 'Resume footer must sit inside 844px viewport');

                await page.setViewportSize({ width: 390, height: 420 });
                const tinyGeom = await assertModalGeometry(page, '#modalPersonnelResumeProfile', 9990);
                assert.ok(tinyGeom.scrollInfo.some(s => s.scrollHeight > s.clientHeight), 'Resume body must become scrollable at 390x420');
                await page.click('#btnClosePersonnelResumeModalBottom');
                assert.strictEqual(await page.evaluate(() => document.body.classList.contains('bma-modal-open')), false);

                // 3) Bulk Import Modal at 390x560
                await page.setViewportSize({ width: 390, height: 560 });
                await page.click('#btnOpenBulkImportModal');
                await assertModalGeometry(page, '#modalPersonnelBulkImport', 9990);
                await page.click('#btnCancelBulkImport');
            } finally {
                await context.close();
            }
        });

        await runAsyncTest('users.html (390x844, 390x560, 390x420): User Form has ZERO negative-Y top clipping, expands Admin scope inside scrollable body while keeping sticky footer reachable', async () => {
            const { context, page } = await setupBrowserPage(browser, buildId, { width: 390, height: 844 });
            try {
                await page.goto(`${baseUrl}/users.html`, { waitUntil: 'load' });
                await page.waitForSelector('#btnOpenAddUserModal');

                await page.click('#btnOpenAddUserModal');
                await assertModalGeometry(page, '#modalUserAccountForm', 9990);

                // Select Admin role to expand scope box and shrink viewport to 390x420
                await page.click('input[name="usrRoleRadio"][value="Admin"]');
                await page.setViewportSize({ width: 390, height: 420 });
                const tinyGeom = await assertModalGeometry(page, '#modalUserAccountForm', 9990);
                assert.ok(tinyGeom.headerTop >= 0, 'Users modal header must never clip at negative Y');
                assert.ok(tinyGeom.scrollInfo.some(s => s.scrollHeight > s.clientHeight), 'Users form body must scroll at 390x420');

                await page.keyboard.press('Escape');
                await page.waitForFunction(() => document.getElementById('modalUserAccountForm')?.classList.contains('hidden'));
                assert.strictEqual(await page.evaluate(() => document.body.classList.contains('bma-modal-open')), false);
            } finally {
                await context.close();
            }
        });

        await runAsyncTest('reports.html (390x844 & 390x560): Report Attendance Form & Dual-GPS Resume Modal stay within viewport and dismiss cleanly', async () => {
            const { context, page } = await setupBrowserPage(browser, buildId, { width: 390, height: 844 });
            try {
                await page.goto(`${baseUrl}/reports.html`, { waitUntil: 'load' });
                await page.waitForSelector('#btnOpenAddReportRecord');

                await page.click('#btnOpenAddReportRecord');
                await assertModalGeometry(page, '#modalReportAttendance', 9990);
                await page.keyboard.press('Escape');
                await page.waitForFunction(() => document.getElementById('modalReportAttendance')?.classList.contains('hidden'));

                await page.setViewportSize({ width: 390, height: 560 });
                await page.waitForSelector('#reportTablesMasterContainer .report-person-card[data-row-uid]');
                await page.click('#reportTablesMasterContainer .report-person-card[data-row-uid]');
                const resumeGeom = await assertModalGeometry(page, '#modalPersonnelResumeProfile', 9990);
                assert.ok(resumeGeom.scrollInfo.some(s => s.scrollHeight > s.clientHeight), 'Reports Resume body must scroll at 390x560');
                await page.mouse.click(5, 5);
                await page.waitForFunction(() => document.getElementById('modalPersonnelResumeProfile')?.classList.contains('hidden'));
            } finally {
                await context.close();
            }
        });

        await runAsyncTest('settings.html (390x844 & 390x420): #modalSettingsItem (#modalSettingsBody display:block) and #modalAnnouncementPreview fit cleanly', async () => {
            const { context, page } = await setupBrowserPage(browser, buildId, { width: 390, height: 420 });
            try {
                await page.goto(`${baseUrl}/settings.html`, { waitUntil: 'load' });
                await page.waitForSelector('[data-tab-target="tab-panel-prefixes"]');
                await page.click('[data-tab-target="tab-panel-prefixes"]');
                await page.waitForSelector('#btnAddPrefix');

                await page.click('#btnAddPrefix');
                await assertModalGeometry(page, '#modalSettingsItem', 9990);
                const settingsBodyDisplay = await page.evaluate(() => getComputedStyle(document.getElementById('modalSettingsBody')).display);
                assert.strictEqual(settingsBodyDisplay, 'block', '#modalSettingsBody must keep display: block');
                await page.keyboard.press('Escape');
                await page.waitForFunction(() => document.getElementById('modalSettingsItem')?.classList.contains('hidden'));

                // Switch to Tab 7 Announcement & open Preview Modal
                await page.click('[data-tab-target="tab-panel-announcement"]');
                await page.waitForSelector('#btnPreviewAnnouncement');
                await page.click('#btnPreviewAnnouncement');
                await assertModalGeometry(page, '#modalAnnouncementPreview', 9990);
                await page.mouse.click(5, 5);
                await page.waitForFunction(() => document.getElementById('modalAnnouncementPreview')?.classList.contains('hidden'));
            } finally {
                await context.close();
            }
        });

        await runAsyncTest('index.html (390x740 & 390x420): Change Password & Forgot Password modals fit viewport and support ESC/backdrop', async () => {
            const { context, page } = await setupBrowserPage(browser, buildId, { width: 390, height: 740 }, { loggedOut: true });
            try {
                await page.goto(`${baseUrl}/index.html`, { waitUntil: 'load' });
                await page.waitForSelector('#btnOpenChangePwdModal');

                await page.click('#btnOpenChangePwdModal');
                await page.setViewportSize({ width: 390, height: 420 });
                await assertModalGeometry(page, '#modalChangePassword', 9990);
                await page.keyboard.press('Escape');
                await page.waitForFunction(() => document.getElementById('modalChangePassword')?.classList.contains('hidden'));

                await page.setViewportSize({ width: 390, height: 740 });
                await page.click('#btnOpenForgotPwdModal');
                await page.setViewportSize({ width: 390, height: 420 });
                await assertModalGeometry(page, '#modalForgotPassword', 9990);
                await page.mouse.click(5, 5);
                await page.waitForFunction(() => document.getElementById('modalForgotPassword')?.classList.contains('hidden'));
            } finally {
                await context.close();
            }
        });

        await runAsyncTest('checkin.html (390x844 & 390x420): Special Request, Offsite Map & View GPS Map keep z-[9999], fit viewport, and lock/unlock body', async () => {
            const { context, page } = await setupBrowserPage(browser, buildId, { width: 390, height: 844 });
            try {
                await page.goto(`${baseUrl}/checkin.html`, { waitUntil: 'load' });
                await page.waitForFunction(
                    () => !document.querySelector('.swal2-popup:not(.swal2-toast)') && document.getElementById('modalSpecialRequest')?.dataset?.bmaDismissBound === '1',
                    { timeout: 15000 }
                );
                await page.setViewportSize({ width: 390, height: 420 });

                // Open Special Request modal cleanly on mobile
                await page.evaluate(() => document.getElementById('btnOpenSpecialRequestModal')?.click());
                const spGeom = await assertModalGeometry(page, '#modalSpecialRequest', 9999);
                assert.ok(spGeom.scrollInfo.some(s => s.scrollHeight > s.clientHeight), 'Special Request body must scroll at 390x420');
                await page.keyboard.press('Escape');
                await page.waitForFunction(() => document.getElementById('modalSpecialRequest')?.classList.contains('hidden'), { timeout: 5000 });
                assert.strictEqual(await page.evaluate(() => document.body.classList.contains('bma-modal-open')), false);

                await page.evaluate(() => document.getElementById('btnOpenOffsiteMapModal')?.click());
                await assertModalGeometry(page, '#modalOffsiteMapSearch', 9999);
                await page.keyboard.press('Escape');
                await page.waitForFunction(() => document.getElementById('modalOffsiteMapSearch')?.classList.contains('hidden'));

                await page.evaluate(() => document.getElementById('btnViewGpsMapModal')?.click());
                await assertModalGeometry(page, '#modalViewGpsMap', 9999);
                await page.keyboard.press('Escape');
                await page.waitForFunction(() => document.getElementById('modalViewGpsMap')?.classList.contains('hidden'));
            } finally {
                await context.close();
            }
        });

        await runAsyncTest('SPA Navigation & SystemUpdateModal (390x420): SPA page switch clears stale bma-modal-open lock, rebinds modal cleanly, and SystemUpdateModal fits viewport', async () => {
            const { context, page } = await setupBrowserPage(browser, buildId, { width: 390, height: 420 });
            try {
                await page.goto(`${baseUrl}/personnel.html`, { waitUntil: 'load' });
                await page.waitForSelector('#btnOpenAddPersonnel');

                // Open modal on personnel.html -> lock active
                await page.click('#btnOpenAddPersonnel');
                assert.strictEqual(await page.evaluate(() => document.body.classList.contains('bma-modal-open')), true);

                // Navigate via SPA (AppLayout.navigateAjaxPage) to users.html -> stale lock must clear!
                await page.evaluate(async () => {
                    const mod = await import('./assets/js/components/AppLayout.js');
                    await mod.AppLayout.navigateAjaxPage('users.html', true);
                });
                await page.waitForSelector('#btnOpenAddUserModal');
                assert.strictEqual(await page.evaluate(() => document.body.classList.contains('bma-modal-open')), false, 'SPA navigation must clear bma-modal-open lock');

                // Open Users modal after SPA switch & dismiss via ESC
                await page.click('#btnOpenAddUserModal');
                await assertModalGeometry(page, '#modalUserAccountForm', 9990);
                await page.keyboard.press('Escape');
                await page.waitForFunction(() => document.getElementById('modalUserAccountForm')?.classList.contains('hidden'));

                // Open SystemUpdateModal.show() and verify 390x420 geometry + unlock
                await page.evaluate(async () => {
                    const mod = await import('./assets/js/components/SystemUpdateModal.js');
                    mod.SystemUpdateModal.show();
                });
                await assertModalGeometry(page, '#bmaSystemUpdateModal', 9999);
                await page.click('#btnModalCloseBottomAck');
                assert.strictEqual(await page.evaluate(() => document.body.classList.contains('bma-modal-open')), false);
            } finally {
                await context.close();
            }
        });
    } finally {
        await browser.close();
        server.close();
    }

    console.log('\n======================================================================');
    console.log(`📊 Test Summary: Total ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
    console.log('======================================================================');
    if (failedTests > 0) {
        process.exitCode = 1;
    } else {
        console.log('🎉 ALL V48 MOBILE MODALS CLIPPING FIX TESTS PASSED 100%!');
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
