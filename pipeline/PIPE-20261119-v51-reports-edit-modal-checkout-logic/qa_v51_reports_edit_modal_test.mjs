/**
 * @file pipeline/PIPE-20261119-v51-reports-edit-modal-checkout-logic/qa_v51_reports_edit_modal_test.mjs
 * @description Dedicated QA Verification Suite for V51 Rev 2 (Reports Edit Modal Checkout Logic & Duplicate Guard):
 *   1) Edit unclosed record (log_id set, check_out_time: null) -> #repCheckoutTime empty (NOT '16:30'), #repPersonnelSelect & #repWorkDate disabled, #repEditModeBadge & #repCheckoutHintBanner visible, Quick-Fill & Clear buttons work
 *   2) Add new / Virtual row -> #repCheckoutTime empty, personnel & date enabled, #repDuplicateWarningBanner shows when person already has regular log
 *   3) Invalid HH:MM rejected; empty checkout saves check_out_time: null; chronological guard warns when out <= in on non-OT
 *   4) AttendanceModel.saveAdminAttendanceRecord: UPDATE preserves existing shift_name / is_special_request / approval_status & saves check_out_time: null; INSERT blocks duplicate regular record (duplicate: true) while allowing OT on same day
 *   5) Playwright headless Chromium (390x844) on reports.html verifying Modal Edit unclosed record visually & functionally (0 clipped elements, empty checkout, disabled personnel+date, Quick-Fill/Clear, save null checkout)
 *   6) 10-HTML Cache Version Sync (version.json & all 10 root HTML files)
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

function createMockSupabaseDb(seedTables = {}) {
    const tables = {
        attendance_logs: (seedTables.attendance_logs || []).map(r => ({ ...r }))
    };
    const operations = [];

    const makeBuilder = (tableName) => {
        const state = { op: 'select', filters: [], payload: null };
        const applyFilters = (rows) => rows.filter(r => state.filters.every(f => {
            if (f.type === 'eq') return String(r[f.col] ?? '') === String(f.val ?? '');
            return true;
        }));
        const exec = async () => {
            const list = tables[tableName] || [];
            if (state.op === 'select') {
                return { data: applyFilters(list).map(r => ({ ...r })), error: null };
            }
            if (state.op === 'update') {
                operations.push({ op: 'update', payload: { ...state.payload }, filters: [...state.filters] });
                const matched = applyFilters(list);
                for (const row of matched) Object.assign(row, state.payload);
                return { data: matched.map(r => ({ ...r })), error: null };
            }
            if (state.op === 'insert') {
                operations.push({ op: 'insert', payload: { ...state.payload } });
                const inserted = { id: `log-ins-${list.length + 1}`, ...state.payload };
                list.push(inserted);
                return { data: [inserted], error: null };
            }
            return { data: [], error: null };
        };
        const builder = {
            select: () => builder,
            update: (p) => { state.op = 'update'; state.payload = p; return builder; },
            insert: (p) => { state.op = 'insert'; state.payload = p; return builder; },
            eq: (col, val) => { state.filters.push({ type: 'eq', col, val }); return builder; },
            then: (resolve, reject) => exec().then(resolve, reject)
        };
        return builder;
    };

    return {
        tables,
        operations,
        client: { from: (t) => makeBuilder(t) }
    };
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
        querySelector: () => null,
        body: { classList: { add: () => {}, remove: () => {}, toggle: () => {} } }
    };
    globalThis.window = {
        location: { pathname: '/reports.html', protocol: 'http:', search: '', hash: '' },
        history: { replaceState: () => {} },
        dispatchEvent: () => {},
        addEventListener: () => {},
        __BMA_SPA_ROUTER_ACTIVE__: true
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
    console.log('🧪 Starting V51 Rev 2 Reports Edit Modal & Checkout Logic QA Suite');
    console.log('======================================================================\n');

    createDomStubs();
    const { AttendanceModel } = await import('../../assets/js/models/AttendanceModel.js');
    const { DatabaseService } = await import('../../assets/js/core/DatabaseService.js');
    const { SettingsModel } = await import('../../assets/js/models/SettingsModel.js');

    const baseSettings = {
        id: 1,
        organization_name: 'กรุงเทพมหานคร',
        bureau_name: 'สำนักเทศกิจ',
        standard_check_in: '08:30',
        standard_check_out: '16:30',
        late_threshold_minutes: 30,
        checkout_grace_minutes: 30,
        require_gps: false,
        work_shifts: [
            { name: 'เวลาราชการปกติ', check_in: '08:30', check_out: '16:30', is_overtime: false, is_custom: false }
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
    SettingsModel.getSettings = async () => baseSettings;

    console.log('▶️ Suite 1: Static Contracts & 10-HTML Cache Version Sync');
    runTest('reports.html removes hardcoded value="16:30", adds V51 controls (#repEditModeBadge, #btnQuickFillCheckout, #btnClearCheckout, #repCheckoutHintBanner, #repDuplicateWarningBanner), preserves 3-zone mobile modal', () => {
        const html = fs.readFileSync(path.join(ROOT_DIR, 'reports.html'), 'utf8');
        const checkoutInputMatch = html.match(/<input[^>]*id="repCheckoutTime"[^>]*>/);
        assert.ok(checkoutInputMatch, '#repCheckoutTime input must exist');
        assert.strictEqual(checkoutInputMatch[0].includes('value="16:30"'), false, '#repCheckoutTime must NOT hardcode value="16:30"');
        assert.ok(checkoutInputMatch[0].includes('placeholder="ยังไม่ลงเวลาออก"'));
        for (const id of ['repEditModeBadge', 'repTitleText', 'btnQuickFillCheckout', 'btnClearCheckout', 'repCheckoutHintBanner', 'repDuplicateWarningBanner', 'modalReportAttendance', 'formReportAttendance']) {
            assert.ok(html.includes(`id="${id}"`), `Missing #${id} in reports.html`);
        }
        assert.ok(html.includes('max-h-[calc(100dvh-1.25rem)]') && html.includes('overflow-y-auto overscroll-contain'));
    });

    runTest('version.json & all 10 root HTML files match buildId 100%', () => {
        const versionJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'version.json'), 'utf8'));
        const buildId = versionJson.buildId;
        assert.ok(buildId, 'Missing buildId in version.json');
        for (const pageFile of HTML_PAGES_10) {
            const pageHtml = fs.readFileSync(path.join(ROOT_DIR, pageFile), 'utf8');
            assert.ok(pageHtml.includes(`CURRENT_APP_BUILD = '${buildId}'`), `${pageFile} CURRENT_APP_BUILD mismatch`);
            assert.ok(pageHtml.includes(`?v=${buildId}`), `${pageFile} ?v= mismatch`);
        }
    });

    console.log('\n▶️ Suite 2: AttendanceModel.saveAdminAttendanceRecord (UPDATE Preservation & User-Priority Duplicate Guard)');
    await runAsyncTest('UPDATE preserves existing shift_name, is_special_request & approval_status while saving check_out_time: null cleanly', async () => {
        const mockDb = createMockSupabaseDb({
            attendance_logs: [{
                id: 'log-existing-1',
                personnel_id: 'per-1',
                work_date: '2026-11-19',
                shift_name: 'กะพิเศษ (09:00 - 17:00)',
                check_in_time: '08:25',
                check_out_time: null,
                status: 'ปฏิบัติงานปกติ',
                is_special_request: true,
                approval_status: 'pending',
                remark: ''
            }]
        });
        DatabaseService.getInstance = () => ({
            client: mockDb.client,
            broadcastRealtimeEvent: () => {}
        });

        const res = await AttendanceModel.saveAdminAttendanceRecord({
            log_id: 'log-existing-1',
            personnel_id: 'per-1',
            work_date: '2026-11-19',
            check_in_time: '08:25',
            check_out_time: null,
            status: 'ปฏิบัติงานปกติ',
            remark: 'ปฏิบัติงานปกติในสถานที่'
        });

        assert.strictEqual(res.success, true);
        const updOp = mockDb.operations.find(op => op.op === 'update');
        assert.ok(updOp, 'Expected update operation');
        assert.strictEqual(updOp.payload.check_out_time, null, 'check_out_time must remain null');
        assert.strictEqual('shift_name' in updOp.payload, false, 'UPDATE must NOT overwrite shift_name with default');
        assert.strictEqual('is_special_request' in updOp.payload, false, 'UPDATE must NOT overwrite is_special_request with false');
        assert.strictEqual('approval_status' in updOp.payload, false, 'UPDATE must NOT overwrite approval_status with approved');

        const stored = mockDb.tables.attendance_logs[0];
        assert.strictEqual(stored.shift_name, 'กะพิเศษ (09:00 - 17:00)');
        assert.strictEqual(stored.is_special_request, true);
        assert.strictEqual(stored.approval_status, 'pending');
        assert.strictEqual(stored.check_out_time, null);
    });

    await runAsyncTest('INSERT enforces User-Priority Duplicate Guard (blocks duplicate regular log, allows non-duplicate OT on same day, blocks identical OT)', async () => {
        const mockDb = createMockSupabaseDb({
            attendance_logs: [{
                id: 'log-user-live',
                personnel_id: 'per-1',
                work_date: '2026-11-19',
                shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
                check_in_time: '08:20',
                check_out_time: null,
                status: 'ปฏิบัติงานปกติ',
                is_overtime: false
            }]
        });
        DatabaseService.getInstance = () => ({
            client: mockDb.client,
            broadcastRealtimeEvent: () => {}
        });

        // 1) Attempt duplicate regular INSERT -> blocked with duplicate: true
        const dupReg = await AttendanceModel.saveAdminAttendanceRecord({
            log_id: null,
            personnel_id: 'per-1',
            work_date: '2026-11-19',
            check_in_time: '08:30',
            check_out_time: null,
            status: 'ปฏิบัติงานปกติ',
            remark: 'แอดมินเพิ่มซ้ำ'
        });
        assert.strictEqual(dupReg.success, false);
        assert.strictEqual(dupReg.duplicate, true);
        assert.strictEqual(dupReg.existingRecord?.id, 'log-user-live');
        assert.ok(dupReg.message.includes('08:20') && dupReg.message.includes('ยึดข้อมูลการลงเวลาของผู้ใช้เป็นหลัก'));
        assert.strictEqual(mockDb.tables.attendance_logs.length, 1);

        // 2) Insert non-duplicate OT on same day -> allowed with check_out_time: null
        const otRes = await AttendanceModel.saveAdminAttendanceRecord({
            log_id: null,
            personnel_id: 'per-1',
            work_date: '2026-11-19',
            check_in_time: '17:00',
            check_out_time: null,
            status: 'ปฏิบัติงานนอกเวลา',
            remark: 'OT เย็น'
        });
        assert.strictEqual(otRes.success, true);
        assert.strictEqual(mockDb.tables.attendance_logs.length, 2);
        assert.strictEqual(mockDb.tables.attendance_logs[1].check_out_time, null);

        // 3) Insert identical OT -> blocked with duplicate: true
        const dupOt = await AttendanceModel.saveAdminAttendanceRecord({
            log_id: null,
            personnel_id: 'per-1',
            work_date: '2026-11-19',
            check_in_time: '17:00',
            check_out_time: null,
            status: 'ปฏิบัติงานนอกเวลา',
            remark: 'OT ซ้ำ'
        });
        assert.strictEqual(dupOt.success, false);
        assert.strictEqual(dupOt.duplicate, true);
    });

    console.log('\n▶️ Suite 3: Playwright Real-Browser Verification on reports.html (390x844)');
    const pwMod = await import(pathToFileURL('C:/Users/OliMal2u/AppData/Local/Programs/Python/Python314/Lib/site-packages/playwright/driver/package/index.mjs').href);
    const { server, baseUrl } = await startStaticServer();
    const browser = await pwMod.chromium.launch({ headless: true });

    try {
        const versionJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'version.json'), 'utf8'));
        const buildId = versionJson.buildId;
        const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

        const superAdmin = {
            id: 'usr-sa-v51',
            personnel_id: 'per-sa-v51',
            username: 'sa_v51',
            full_name: 'นายผู้ดูแล ระบบ',
            role: 'SuperAdmin',
            visibility_level: 'all',
            is_active: true,
            personnel: { id: 'per-sa-v51', prefix: 'นาย', first_name: 'ผู้ดูแล', last_name: 'ระบบ', bureau: 'สำนักเทศกิจ', division: 'ส่วน A' },
            expires_at: Date.now() + 86400000
        };

        const personnelList = [
            {
                id: 'per-u1',
                prefix: 'นาย',
                first_name: 'สมชาย',
                last_name: 'ยังไม่ออก',
                position_type: 'ประเภททั่วไป',
                position_title: 'เจ้าพนักงานเทศกิจ',
                position_level: 'ปฏิบัติงาน',
                bureau: 'สำนักเทศกิจ',
                division: 'ส่วน A',
                work_group: 'กลุ่ม 1',
                is_active: true
            },
            {
                id: 'per-u2',
                prefix: 'นางสาว',
                first_name: 'วิไล',
                last_name: 'ไม่ลงเวลา',
                position_type: 'ประเภทวิชาการ',
                position_title: 'นักจัดการงานเทศกิจ',
                position_level: 'ชำนาญการ',
                bureau: 'สำนักเทศกิจ',
                division: 'ส่วน A',
                work_group: 'กลุ่ม 1',
                is_active: true
            }
        ];

        const dbLogs = [
            {
                id: 'log-unclosed-1',
                personnel_id: 'per-u1',
                work_date: today,
                shift_name: 'กะพิเศษ (09:00 - 17:00)',
                check_in_time: '08:25',
                check_out_time: null,
                status: 'ปฏิบัติงานปกติ',
                remark: '',
                location_mode: 'ONSITE',
                is_overtime: false,
                is_special_request: false,
                approval_status: 'approved'
            }
        ];
        let capturedUpdatePayloads = [];

        const setupRoutes = async (page) => {
            await page.route('**/*.supabase.co/**', async (route) => {
                const req = route.request();
                const u = req.url();
                const method = req.method();
                const isSingle = (req.headers()['accept'] || '').includes('object') || u.includes('limit=1');
                if (u.includes('/system_settings')) {
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? baseSettings : [baseSettings]) });
                }
                if (u.includes('/user_accounts')) {
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? superAdmin : [superAdmin]) });
                }
                if (u.includes('/personnel')) {
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(personnelList) });
                }
                if (u.includes('/attendance_logs')) {
                    if (method === 'PATCH') {
                        const patch = req.postDataJSON();
                        capturedUpdatePayloads.push(patch);
                        Object.assign(dbLogs[0], patch);
                        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([dbLogs[0]]) });
                    }
                    if (u.includes('is_special_request=eq.true') || u.includes('correction_status=eq.pending')) {
                        return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
                    }
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(dbLogs) });
                }
                return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
            });
        };

        await runAsyncTest('reports.html (390x844): Edit unclosed record keeps checkout empty (NOT 16:30), disables personnel+date, tests Quick-Fill/Clear, rejects invalid HH:MM, saves null checkout & preserves shift_name', async () => {
            const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
            const page = await ctx.newPage();

            await page.addInitScript(({ bId, sess }) => {
                localStorage.setItem('bma_app_build', bId);
                localStorage.setItem('bma_checkin_session_user_v2_7', JSON.stringify(sess));
                localStorage.setItem('bma_last_seen_announcement_id', 'qa-seen');
                sessionStorage.setItem('bma_reloaded_build', bId);
            }, { bId: buildId, sess: superAdmin });
            await setupRoutes(page);

            await page.goto(`${baseUrl}/reports.html`, { waitUntil: 'load' });
            await page.waitForSelector('button[data-action="edit-record"]');

            // Click Edit on per-u1 unclosed log (check_in=08:25, check_out=null)
            const editBtn = page.locator('#reportTablesMasterContainer button[data-action="edit-record"]').first();
            await editBtn.click();
            await page.waitForSelector('#modalReportAttendance:not(.hidden)');

            const editState = await page.evaluate(() => {
                const modal = document.getElementById('modalReportAttendance');
                const panel = modal?.firstElementChild;
                const rect = panel?.getBoundingClientRect();
                return {
                    title: document.getElementById('repTitleText')?.textContent?.trim(),
                    badgeHidden: document.getElementById('repEditModeBadge')?.classList.contains('hidden'),
                    personnelDisabled: document.getElementById('repPersonnelSelect')?.disabled,
                    workDateDisabled: document.getElementById('repWorkDate')?.disabled,
                    checkinVal: document.getElementById('repCheckinTime')?.value,
                    checkoutVal: document.getElementById('repCheckoutTime')?.value,
                    hintHidden: document.getElementById('repCheckoutHintBanner')?.classList.contains('hidden'),
                    clearHidden: document.getElementById('btnClearCheckout')?.classList.contains('hidden'),
                    fitsViewport: rect ? (rect.top >= 0 && rect.bottom <= window.innerHeight && rect.width <= window.innerWidth) : false
                };
            });

            assert.strictEqual(editState.title, 'แก้ไขเวลาปฏิบัติราชการ');
            assert.strictEqual(editState.badgeHidden, false, '#repEditModeBadge must be visible');
            assert.strictEqual(editState.personnelDisabled, true, '#repPersonnelSelect must be disabled on Edit');
            assert.strictEqual(editState.workDateDisabled, true, '#repWorkDate must be disabled on Edit');
            assert.strictEqual(editState.checkinVal, '08:25');
            assert.strictEqual(editState.checkoutVal, '', 'Unclosed record MUST leave #repCheckoutTime empty (NEVER 16:30)');
            assert.strictEqual(editState.hintHidden, false, '#repCheckoutHintBanner must be visible when unclosed');
            assert.strictEqual(editState.clearHidden, true, '#btnClearCheckout must be hidden when empty');
            assert.strictEqual(editState.fitsViewport, true, 'Modal must fit 390x844 viewport without clipping');

            // Test Quick-Fill ('ตามกะ') -> fills 16:30, hides hint, reveals Clear ('ล้าง')
            await page.click('#btnQuickFillCheckout');
            const afterQuickFill = await page.evaluate(() => ({
                checkoutVal: document.getElementById('repCheckoutTime')?.value,
                hintHidden: document.getElementById('repCheckoutHintBanner')?.classList.contains('hidden'),
                clearHidden: document.getElementById('btnClearCheckout')?.classList.contains('hidden')
            }));
            assert.strictEqual(afterQuickFill.checkoutVal, '16:30');
            assert.strictEqual(afterQuickFill.hintHidden, true);
            assert.strictEqual(afterQuickFill.clearHidden, false);

            // Test Clear ('ล้าง') -> clears back to '', shows hint again
            await page.click('#btnClearCheckout');
            const afterClear = await page.evaluate(() => ({
                checkoutVal: document.getElementById('repCheckoutTime')?.value,
                hintHidden: document.getElementById('repCheckoutHintBanner')?.classList.contains('hidden')
            }));
            assert.strictEqual(afterClear.checkoutVal, '');
            assert.strictEqual(afterClear.hintHidden, false);

            // Test invalid HH:MM validation -> blocks save & shows Swal warning
            await page.fill('#repCheckoutTime', '99:99');
            await page.click('#formReportAttendance button[type="submit"]');
            await page.waitForSelector('.swal2-popup');
            const errTitle = await page.locator('.swal2-title').innerText();
            assert.ok(errTitle.includes('รูปแบบเวลาไม่ถูกต้อง'));
            await page.click('.swal2-confirm');
            await page.waitForFunction(() => !document.querySelector('.swal2-popup'));

            // Clear back to empty and submit -> sends check_out_time: null and preserves shift_name
            await page.click('#btnClearCheckout');
            await page.fill('#repRemarkInput', 'ปรับปรุงหมายเหตุ');
            await page.click('#formReportAttendance button[type="submit"]');
            await page.waitForFunction(() => document.getElementById('modalReportAttendance')?.classList.contains('hidden'));

            assert.strictEqual(capturedUpdatePayloads.length, 1);
            assert.strictEqual(capturedUpdatePayloads[0].check_out_time, null);
            assert.strictEqual('shift_name' in capturedUpdatePayloads[0], false);
            assert.strictEqual(dbLogs[0].shift_name, 'กะพิเศษ (09:00 - 17:00)');

            // Now test Add New mode -> empty checkout, personnel & date enabled, duplicate warning banner shown for per-u1
            await page.click('#btnOpenAddReportRecord');
            await page.waitForSelector('#modalReportAttendance:not(.hidden)');
            const addState = await page.evaluate(() => ({
                title: document.getElementById('repTitleText')?.textContent?.trim(),
                badgeHidden: document.getElementById('repEditModeBadge')?.classList.contains('hidden'),
                personnelDisabled: document.getElementById('repPersonnelSelect')?.disabled,
                workDateDisabled: document.getElementById('repWorkDate')?.disabled,
                checkinVal: document.getElementById('repCheckinTime')?.value,
                checkoutVal: document.getElementById('repCheckoutTime')?.value,
                dupBannerHidden: document.getElementById('repDuplicateWarningBanner')?.classList.contains('hidden')
            }));
            assert.strictEqual(addState.title, 'เพิ่มบันทึกเวลาปฏิบัติราชการ');
            assert.strictEqual(addState.badgeHidden, true);
            assert.strictEqual(addState.personnelDisabled, false);
            assert.strictEqual(addState.workDateDisabled, false);
            assert.strictEqual(addState.checkinVal, '08:30');
            assert.strictEqual(addState.checkoutVal, '', 'Add New mode MUST keep checkout empty by default');
            assert.strictEqual(addState.dupBannerHidden, false, '#repDuplicateWarningBanner must show when selecting person with existing regular log');

            // Switch to per-u2 (no log) -> duplicate warning banner hides
            await page.selectOption('#repPersonnelSelect', 'per-u2');
            const dupHiddenForU2 = await page.evaluate(() => document.getElementById('repDuplicateWarningBanner')?.classList.contains('hidden'));
            assert.strictEqual(dupHiddenForU2, true);

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
    console.log('🎉 ALL V51 REV 2 TESTS PASSED 100%!');
}

main().catch((err) => {
    console.error('❌ Fatal QA error:', err);
    process.exit(1);
});
