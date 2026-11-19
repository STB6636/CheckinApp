/**
 * qa_v49_time_correction_test.mjs
 * Dedicated Comprehensive QA Suite for PIPE-20261119-time-correction-request-and-approvals (V49 Rev 3)
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'file:///C:/Users/OliMal2u/AppData/Local/Programs/Python/Python314/Lib/site-packages/playwright/driver/package/index.mjs';

const ROOT_DIR = process.cwd();
const HTML_PAGES_10 = [
    'index.html',
    'loading.html',
    'checkin.html',
    'dashboard.html',
    'approvals.html',
    'time-corrections.html',
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

function setupNodeMocks() {
    const ls = new Map();
    const ss = new Map();
    globalThis.localStorage = {
        getItem: (k) => (ls.has(k) ? ls.get(k) : null),
        setItem: (k, v) => ls.set(k, String(v)),
        removeItem: (k) => ls.delete(k)
    };
    globalThis.sessionStorage = {
        getItem: (k) => (ss.has(k) ? ss.get(k) : null),
        setItem: (k, v) => ss.set(k, String(v)),
        removeItem: (k) => ss.delete(k)
    };
    globalThis.window = globalThis.window || {
        location: { pathname: '/', origin: 'http://localhost', href: 'http://localhost/', replace: () => {} },
        addEventListener: () => {},
        dispatchEvent: () => {},
        history: { replaceState: () => {}, pushState: () => {} }
    };
    globalThis.document = globalThis.document || {
        addEventListener: () => {},
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        body: { classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false } }
    };
    globalThis.CustomEvent = globalThis.CustomEvent || class CustomEvent {
        constructor(type, init = {}) { this.type = type; this.detail = init.detail; }
    };
}

function createFakeSupabaseDb(initialLogs = [], initialAccounts = []) {
    const tables = {
        attendance_logs: initialLogs.map(r => ({ ...r })),
        user_accounts: initialAccounts.map(r => ({ ...r }))
    };

    const applyFilter = (rows, filters) => rows.filter(row => {
        for (const f of filters) {
            if (f.type === 'eq' && row[f.col] !== f.val) return false;
            if (f.type === 'neq' && row[f.col] === f.val) return false;
            if (f.type === 'in' && !f.vals.includes(row[f.col])) return false;
            if (f.type === 'gte' && String(row[f.col] || '') < String(f.val)) return false;
            if (f.type === 'lte' && String(row[f.col] || '') > String(f.val)) return false;
            if (f.type === 'is' && row[f.col] !== f.val) return false;
        }
        return true;
    });

    const makeBuilder = (tableName) => {
        const state = {
            op: 'select',
            filters: [],
            payload: null,
            orders: [],
            limitN: null
        };

        const exec = async () => {
            const list = tables[tableName] || [];
            if (state.op === 'select') {
                let res = applyFilter(list, state.filters).map(r => ({ ...r }));
                if (state.orders.length > 0) {
                    res.sort((a, b) => {
                        for (const o of state.orders) {
                            const av = a[o.col] || '';
                            const bv = b[o.col] || '';
                            if (av < bv) return o.asc ? -1 : 1;
                            if (av > bv) return o.asc ? 1 : -1;
                        }
                        return 0;
                    });
                }
                if (state.limitN != null) res = res.slice(0, state.limitN);
                return { data: res, error: null };
            }
            if (state.op === 'update') {
                const matched = applyFilter(list, state.filters);
                for (const row of matched) {
                    Object.assign(row, state.payload);
                }
                return { data: matched.map(r => ({ ...r })), error: null };
            }
            if (state.op === 'insert') {
                const inserted = { id: `log-${Date.now()}-${Math.random()}`, ...state.payload };
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
            neq: (col, val) => { state.filters.push({ type: 'neq', col, val }); return builder; },
            in: (col, vals) => { state.filters.push({ type: 'in', col, vals }); return builder; },
            gte: (col, val) => { state.filters.push({ type: 'gte', col, val }); return builder; },
            lte: (col, val) => { state.filters.push({ type: 'lte', col, val }); return builder; },
            is: (col, val) => { state.filters.push({ type: 'is', col, val }); return builder; },
            order: (col, opts = {}) => { state.orders.push({ col, asc: opts.ascending !== false }); return builder; },
            limit: (n) => { state.limitN = n; return builder; },
            maybeSingle: async () => {
                const res = await exec();
                return { data: res.data[0] || null, error: res.error };
            },
            single: async () => {
                const res = await exec();
                return { data: res.data[0] || null, error: res.error };
            },
            then: (resolve, reject) => exec().then(resolve, reject)
        };
        return builder;
    };

    return {
        tables,
        client: {
            from: (tableName) => makeBuilder(tableName)
        }
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

async function main() {
    console.log('======================================================================');
    console.log('🧪 Starting V49 Rev 3 Time Correction Request & Approvals QA Suite');
    console.log('======================================================================\n');

    setupNodeMocks();

    const { AuthService } = await import('../../assets/js/core/AuthService.js');
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

    SettingsModel.getSettings = async () => baseSettings;

    console.log('▶️ Suite 1: SQL Migration Files & 10-HTML Cache Sync');
    runTest('SQL migrations for staging & public include all 9 correction_* columns, FK, partial index, GRANTs & NOTIFY pgrst', () => {
        const stagingSql = fs.readFileSync(path.join(ROOT_DIR, 'sql/alter_v2_11_time_correction_staging.sql'), 'utf8');
        const publicSql = fs.readFileSync(path.join(ROOT_DIR, 'sql/alter_v2_11_time_correction_public.sql'), 'utf8');
        const requiredCols = [
            'correction_status',
            'correction_requested_at',
            'correction_request_reason',
            'correction_reviewed_by',
            'correction_reviewed_at',
            'correction_reject_reason',
            'correction_original_check_in',
            'correction_original_check_out',
            'correction_original_status'
        ];
        for (const col of requiredCols) {
            assert.ok(stagingSql.includes(col), `staging SQL missing ${col}`);
            assert.ok(publicSql.includes(col), `public SQL missing ${col}`);
        }
        assert.ok(stagingSql.includes('staging.attendance_logs') && stagingSql.includes('fk_staging_attendance_correction_reviewer'));
        assert.ok(publicSql.includes('public.attendance_logs') && publicSql.includes('fk_public_attendance_correction_reviewer'));
        assert.ok(stagingSql.includes('idx_staging_attendance_correction_status') && stagingSql.includes("NOTIFY pgrst, 'reload schema'"));
        assert.ok(publicSql.includes('idx_public_attendance_correction_status') && publicSql.includes("NOTIFY pgrst, 'reload schema'"));
    });

    runTest('version.json & all 10 root HTML files (including time-corrections.html) match buildId 100%', () => {
        const versionJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'version.json'), 'utf8'));
        const buildId = versionJson.buildId;
        assert.ok(buildId, 'Missing buildId in version.json');
        for (const htmlFile of HTML_PAGES_10) {
            const html = fs.readFileSync(path.join(ROOT_DIR, htmlFile), 'utf8');
            assert.ok(html.includes(`CURRENT_APP_BUILD = '${buildId}'`), `${htmlFile} CURRENT_APP_BUILD mismatch`);
            assert.ok(html.includes(`?v=${buildId}`), `${htmlFile} asset ?v= mismatch`);
        }
        const agentsMd = fs.readFileSync(path.join(ROOT_DIR, 'AGENTS.md'), 'utf8');
        assert.ok(agentsMd.includes('10 หน้าหลัก') && agentsMd.includes('time-corrections.html'));
    });

    console.log('\n▶️ Suite 2: Executive RBAC Matrix (AuthService.canApproveTimeCorrection)');
    runTest('Enforces User, Admin (5 executive titles vs non-exec vs self), and SuperAdmin approval matrix', () => {
        const userReq = { id: 'req-u', user_id: 'u1', personnel_id: 'p1', bureau: 'สำนักเทศกิจ', division: 'ส่วน A', requester_role: 'User' };
        const adminReq = { id: 'req-a', user_id: 'u-admin1', personnel_id: 'p-admin1', bureau: 'สำนักเทศกิจ', division: 'ส่วน A', requester_role: 'Admin' };
        const superReq = { id: 'req-s', user_id: 'u-sa', personnel_id: 'p-sa', bureau: 'สำนักเทศกิจ', division: 'ส่วน A', requester_role: 'SuperAdmin' };

        const superAdmin = { id: 'sa-1', role: 'SuperAdmin', visibility_level: 'all' };
        const divNonExecAdmin = {
            id: 'u-admin2', personnel_id: 'p-admin2', role: 'Admin', visibility_level: 'division',
            scope_bureau: 'สำนักเทศกิจ', scope_division: 'ส่วน A',
            personnel: { position_type: 'ข้าราชการ', position_title: 'เจ้าพนักงานเทศกิจ' }
        };
        const outOfScopeExecAdmin = {
            id: 'u-admin3', personnel_id: 'p-admin3', role: 'Admin', visibility_level: 'division',
            scope_bureau: 'สำนักเทศกิจ', scope_division: 'ส่วน B',
            personnel: { position_type: 'ประเภทผู้บริหาร', position_title: 'ผู้อำนวยการส่วน' }
        };
        const selfExecAdmin = {
            id: 'u-admin1', personnel_id: 'p-admin1', role: 'Admin', visibility_level: 'bureau',
            scope_bureau: 'สำนักเทศกิจ',
            personnel: { position_type: 'ประเภทผู้บริหาร', position_title: 'ผู้อำนวยการกอง' }
        };
        const regularUser = { id: 'u1', personnel_id: 'p1', role: 'User' };

        // SuperAdmin can approve User, Admin, SuperAdmin
        assert.strictEqual(AuthService.canApproveTimeCorrection(superAdmin, userReq).allowed, true);
        assert.strictEqual(AuthService.canApproveTimeCorrection(superAdmin, adminReq).allowed, true);
        assert.strictEqual(AuthService.canApproveTimeCorrection(superAdmin, superReq).allowed, true);

        // User cannot approve anyone
        assert.strictEqual(AuthService.canApproveTimeCorrection(regularUser, userReq).allowed, false);

        // Non-exec in-scope Admin: approves User, blocked from Admin & SuperAdmin
        assert.strictEqual(AuthService.canApproveTimeCorrection(divNonExecAdmin, userReq).allowed, true);
        const nonExecOnAdmin = AuthService.canApproveTimeCorrection(divNonExecAdmin, adminReq);
        assert.strictEqual(nonExecOnAdmin.allowed, false);
        assert.strictEqual(nonExecOnAdmin.reason, 'สงวนสิทธิ์อนุมัติเฉพาะผู้บริหาร / SuperAdmin');
        assert.strictEqual(AuthService.canApproveTimeCorrection(divNonExecAdmin, superReq).allowed, false);

        // Self-approval blocked even for executive Admin
        const selfRes = AuthService.canApproveTimeCorrection(selfExecAdmin, adminReq);
        assert.strictEqual(selfRes.allowed, false);
        assert.strictEqual(selfRes.reason, 'คำขอของตนเอง (รอผู้บริหาร/SuperAdmin)');

        // Out-of-scope executive Admin blocked
        assert.strictEqual(AuthService.canApproveTimeCorrection(outOfScopeExecAdmin, adminReq).allowed, false);

        // All 5 executive titles allowed on other Admin within scope
        const execTitles = ['ผู้อำนวยการส่วน', 'ผู้อำนวยการกอง', 'เลขานุการสำนัก', 'หัวหน้ากลุ่มงาน', 'หัวหน้าฝ่าย'];
        for (const title of execTitles) {
            const execAdmin = {
                id: 'u-exec', personnel_id: 'p-exec', role: 'Admin', visibility_level: 'bureau',
                scope_bureau: 'สำนักเทศกิจ',
                personnel: { position_type: 'ประเภทผู้บริหาร', position_title: title }
            };
            assert.strictEqual(
                AuthService.canApproveTimeCorrection(execAdmin, adminReq).allowed,
                true,
                `Executive title '${title}' must be allowed`
            );
        }
    });

    console.log('\n▶️ Suite 3: All 5 Calculation Cases, Threshold 30/60, Remark Preservation, Lifecycle & Safeguards');
    await runAsyncTest('Cases 1-5, threshold=30/60, exclude ไม่ลงเวลา, remark (แก้ไขเวลา) idempotency, 2-round snapshot & phantom-pending clear', async () => {
        const personU = {
            id: 'p-u1', prefix: 'นาย', first_name: 'สมชาย', last_name: 'ปกติ',
            position_type: 'ข้าราชการ', position_title: 'เจ้าพนักงานเทศกิจ', position_level: 'ปฏิบัติการ',
            bureau: 'สำนักเทศกิจ', division: 'ส่วน A', work_group: 'กลุ่ม 1'
        };
        const personAdm = {
            id: 'p-adm1', prefix: 'นาง', first_name: 'วิไล', last_name: 'แอดมิน',
            position_type: 'ข้าราชการ', position_title: 'นักวิชาการ', position_level: 'ชำนาญการ',
            bureau: 'สำนักเทศกิจ', division: 'ส่วน A', work_group: 'กลุ่ม 1'
        };

        const seedLogs = [
            // Case 1: Late check-in, no checkout, no remark -> 'ขอแก้ไขเวลา'
            {
                id: 'c1', personnel_id: 'p-u1', user_id: 'u-1', work_date: '2026-11-10',
                shift_name: 'เวลาราชการปกติ (08:30 - 16:30)', check_in_time: '08:45:00', check_out_time: null,
                status: 'มาสาย', remark: '', location_mode: 'ONSITE', is_special_request: false, is_overtime: false,
                correction_status: 'none', personnel: personU
            },
            // Case 2: Late check-in, normal late checkout 17:45 preserved, existing remark 'ประชุม' -> 'ประชุม (แก้ไขเวลา)'
            {
                id: 'c2', personnel_id: 'p-u1', user_id: 'u-1', work_date: '2026-11-11',
                shift_name: 'เวลาราชการปกติ (08:30 - 16:30)', check_in_time: '08:55:00', check_out_time: '17:45:00',
                status: 'มาสาย', remark: 'ประชุม', location_mode: 'OFFSITE', offsite_reason: 'ประชุม',
                is_special_request: false, is_overtime: false, correction_status: 'none', personnel: personU
            },
            // Case 3: Absent check-in 09:30 (>30m threshold), no checkout -> 08:30 / null
            {
                id: 'c3', personnel_id: 'p-u1', user_id: 'u-1', work_date: '2026-11-12',
                shift_name: 'เวลาราชการปกติ (08:30 - 16:30)', check_in_time: '09:30:00', check_out_time: null,
                status: 'ขาดราชการ', remark: 'ในสถานที่', location_mode: 'ONSITE',
                is_special_request: false, is_overtime: false, correction_status: 'none', personnel: personU
            },
            // Case 4: Absent check-in 09:55, normal checkout 19:30 preserved -> 08:30 / 19:30
            {
                id: 'c4', personnel_id: 'p-u1', user_id: 'u-1', work_date: '2026-11-13',
                shift_name: 'เวลาราชการปกติ (08:30 - 16:30)', check_in_time: '09:55:00', check_out_time: '19:30:00',
                status: 'ขาดราชการ', remark: '', location_mode: 'ONSITE',
                is_special_request: false, is_overtime: false, correction_status: 'none', personnel: personU
            },
            // Case 5: Normal check-in 08:15 preserved, early checkout 14:25 -> 08:15 / 16:30
            {
                id: 'c5', personnel_id: 'p-u1', user_id: 'u-1', work_date: '2026-11-14',
                shift_name: 'เวลาราชการปกติ (08:30 - 16:30)', check_in_time: '08:15:00', check_out_time: '14:25:00',
                status: 'ขาดราชการ', remark: 'ขอแก้ไขเวลา', location_mode: 'ONSITE',
                is_special_request: false, is_overtime: false, correction_status: 'none', personnel: personU
            },
            // Excluded: normal check-in with no_checkin checkout (ไม่ลงเวลา only -> must NOT appear!)
            {
                id: 'excl-noout', personnel_id: 'p-u1', user_id: 'u-1', work_date: '2026-11-15',
                shift_name: 'เวลาราชการปกติ (08:30 - 16:30)', check_in_time: '08:15:00', check_out_time: null,
                status: 'ปฏิบัติงานปกติ', remark: '', location_mode: 'ONSITE',
                is_special_request: false, is_overtime: false, correction_status: 'none', personnel: personU
            },
            // Admin's own request (pending) for RBAC server-side enforcement test
            {
                id: 'c-adm', personnel_id: 'p-adm1', user_id: 'u-adm1', work_date: '2026-11-16',
                shift_name: 'เวลาราชการปกติ (08:30 - 16:30)', check_in_time: '08:50:00', check_out_time: '16:35:00',
                status: 'มาสาย', remark: 'อบรม (แก้ไขเวลา)', location_mode: 'OFFSITE',
                is_special_request: false, is_overtime: false, correction_status: 'pending', personnel: personAdm
            }
        ];

        const fakeAccounts = [
            { id: 'u-1', personnel_id: 'p-u1', role: 'User', visibility_level: 'none' },
            { id: 'u-adm1', personnel_id: 'p-adm1', role: 'Admin', visibility_level: 'division' }
        ];

        const fakeDb = createFakeSupabaseDb(seedLogs, fakeAccounts);
        DatabaseService.getInstance = () => ({ client: fakeDb.client, broadcastRealtimeEvent: () => {} });

        // Threshold 30 vs 60 verification on Case 3 (09:30)
        const listT30 = await AttendanceModel.getPersonalTimeCorrectionLogs('p-u1', 'u-1', { ...baseSettings, late_threshold_minutes: 30 });
        const listT60 = await AttendanceModel.getPersonalTimeCorrectionLogs('p-u1', 'u-1', { ...baseSettings, late_threshold_minutes: 60 });
        assert.strictEqual(listT30.some(r => r.id === 'excl-noout'), false, 'Normal check-in with no_checkin checkout must be excluded');
        assert.strictEqual(listT30.length, 5);
        assert.strictEqual(listT30.find(r => r.id === 'c3').check_in_status.status_key, 'absent_duty');
        assert.strictEqual(listT60.find(r => r.id === 'c3').check_in_status.status_key, 'late');

        // Lifecycle: submit (optional empty reason) -> pending -> reject -> re-submit -> approve -> disappears!
        const userCtx = { id: 'u-1', personnel_id: 'p-u1', full_name: 'นายสมชาย ปกติ', role: 'User' };
        const execAdminCtx = {
            id: 'u-exec', personnel_id: 'p-exec', full_name: 'ผอ.ส่วน', role: 'Admin',
            visibility_level: 'bureau', scope_bureau: 'สำนักเทศกิจ',
            personnel: { position_type: 'ประเภทผู้บริหาร', position_title: 'ผู้อำนวยการส่วน' }
        };
        const nonExecAdminCtx = {
            id: 'u-adm2', personnel_id: 'p-adm2', full_name: 'แอดมินทั่วไป', role: 'Admin',
            visibility_level: 'division', scope_bureau: 'สำนักเทศกิจ', scope_division: 'ส่วน A',
            personnel: { position_type: 'ข้าราชการ', position_title: 'เจ้าพนักงานเทศกิจ' }
        };

        // Server-side RBAC block: non-exec Admin cannot approve Admin's request
        const forbiddenRes = await AttendanceModel.processTimeCorrectionsBulk(['c-adm'], true, nonExecAdminCtx);
        assert.strictEqual(forbiddenRes.success, false);
        assert.strictEqual(forbiddenRes.forbidden, true);
        assert.strictEqual(fakeDb.tables.attendance_logs.find(r => r.id === 'c-adm').correction_status, 'pending');

        // Exec Admin approves c-adm -> idempotent '(แก้ไขเวลา)' preserved!
        const execRes = await AttendanceModel.processTimeCorrectionsBulk(['c-adm'], true, execAdminCtx);
        assert.strictEqual(execRes.success, true);
        assert.strictEqual(fakeDb.tables.attendance_logs.find(r => r.id === 'c-adm').remark, 'อบรม (แก้ไขเวลา)');

        // User submits c1 with empty reason -> pending
        const sub1 = await AttendanceModel.submitTimeCorrectionRequest('c1', userCtx, '');
        assert.strictEqual(sub1.success, true);
        assert.strictEqual(sub1.data.correction_status, 'pending');
        assert.strictEqual(sub1.data.correction_request_reason, null);
        assert.strictEqual(sub1.data.correction_original_check_in, '08:45:00');

        // Reject c1 with reason -> rejected, times untouched
        const rej1 = await AttendanceModel.processTimeCorrectionsBulk(['c1'], false, nonExecAdminCtx, 'กรุณาแนบหลักฐาน');
        assert.strictEqual(rej1.success, true);
        const c1AfterRej = fakeDb.tables.attendance_logs.find(r => r.id === 'c1');
        assert.strictEqual(c1AfterRej.correction_status, 'rejected');
        assert.strictEqual(c1AfterRej.correction_reject_reason, 'กรุณาแนบหลักฐาน');
        assert.strictEqual(c1AfterRej.check_in_time, '08:45:00');

        // Re-submit c1 -> pending, submit c2..c5 -> pending -> approve all 5!
        await AttendanceModel.submitTimeCorrectionRequest('c1', userCtx, 'ยืนยันเหตุผล');
        await AttendanceModel.submitTimeCorrectionRequest('c2', userCtx, '');
        await AttendanceModel.submitTimeCorrectionRequest('c3', userCtx, '');
        await AttendanceModel.submitTimeCorrectionRequest('c4', userCtx, '');
        await AttendanceModel.submitTimeCorrectionRequest('c5', userCtx, '');

        const appAll = await AttendanceModel.processTimeCorrectionsBulk(['c1', 'c2', 'c3', 'c4', 'c5'], true, nonExecAdminCtx);
        assert.strictEqual(appAll.success, true);
        assert.strictEqual(appAll.count, 5);

        const row1 = fakeDb.tables.attendance_logs.find(r => r.id === 'c1');
        const row2 = fakeDb.tables.attendance_logs.find(r => r.id === 'c2');
        const row3 = fakeDb.tables.attendance_logs.find(r => r.id === 'c3');
        const row4 = fakeDb.tables.attendance_logs.find(r => r.id === 'c4');
        const row5 = fakeDb.tables.attendance_logs.find(r => r.id === 'c5');

        assert.deepStrictEqual([row1.check_in_time, row1.check_out_time, row1.status, row1.remark], ['08:30', null, 'ปฏิบัติงานปกติ', 'ขอแก้ไขเวลา']);
        assert.deepStrictEqual([row2.check_in_time, row2.check_out_time, row2.status, row2.remark], ['08:30', '17:45', 'ปฏิบัติงานปกติ', 'ประชุม (แก้ไขเวลา)']);
        assert.deepStrictEqual([row3.check_in_time, row3.check_out_time, row3.status, row3.remark], ['08:30', null, 'ปฏิบัติงานปกติ', 'ขอแก้ไขเวลา']);
        assert.deepStrictEqual([row4.check_in_time, row4.check_out_time, row4.status, row4.remark], ['08:30', '19:30', 'ปฏิบัติงานปกติ', 'ขอแก้ไขเวลา']);
        assert.deepStrictEqual([row5.check_in_time, row5.check_out_time, row5.status, row5.remark], ['08:15', '16:30', 'ปฏิบัติงานปกติ', 'ขอแก้ไขเวลา']);

        // Approved rows disappear from getPersonalTimeCorrectionLogs immediately
        const afterApproveList = await AttendanceModel.getPersonalTimeCorrectionLogs('p-u1', 'u-1', baseSettings);
        assert.strictEqual(afterApproveList.length, 0);

        // 2-round same-day early checkout resets correction_status='none' while preserving correction_original_check_in
        AttendanceModel.getActiveRegularRecordForCheckout = async () => ({ ...row1 });
        await AttendanceModel.submitCheckinOrCheckout({
            personnel_id: 'p-u1', user_id: 'u-1', work_date: '2026-11-10', time: '14:25', location_name: 'สำนักเทศกิจ'
        });
        const row1AfterEarlyOut = fakeDb.tables.attendance_logs.find(r => r.id === 'c1');
        assert.strictEqual(row1AfterEarlyOut.correction_status, 'none');
        assert.strictEqual(row1AfterEarlyOut.correction_original_check_in, '08:45:00', 'Must keep original morning check-in snapshot');
        assert.strictEqual(row1AfterEarlyOut.correction_original_check_out, '14:25');

        // Phantom pending cleared by saveAdminAttendanceRecord when manually fixed to ปฏิบัติงานปกติ
        fakeDb.tables.attendance_logs.push({
            id: 'c-phantom', personnel_id: 'p-u1', work_date: '2026-11-18',
            check_in_time: '08:45', status: 'มาสาย', correction_status: 'pending'
        });
        await AttendanceModel.saveAdminAttendanceRecord({
            log_id: 'c-phantom', personnel_id: 'p-u1', work_date: '2026-11-18',
            check_in_time: '08:30', check_out_time: '16:30', status: 'ปฏิบัติงานปกติ', remark: ''
        });
        assert.strictEqual(fakeDb.tables.attendance_logs.find(r => r.id === 'c-phantom').correction_status, 'none');
    });

    console.log('\n▶️ Suite 4: Playwright Real-Browser Verification (360px / 390px / 1280px)');
    const { server, baseUrl } = await startStaticServer();
    const browser = await chromium.launch({ headless: true });

    try {
        await runAsyncTest('checkin.html (390x844 & 1280x800): Symmetrical Drawer Layout (Admin 2x2 vs User row-span-2), #btnDrawerNavCheckin removed, Badges & Optional Reason Submit', async () => {
            const versionJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'version.json'), 'utf8'));
            const buildId = versionJson.buildId;

            const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
            const makeSeedLogs = () => ([
                {
                    id: 'tc-1', personnel_id: 'per-1', user_id: 'usr-1', work_date: '2026-11-10',
                    shift_name: 'เวลาราชการปกติ (08:30 - 16:30)', check_in_time: '08:48', check_out_time: '16:35',
                    status: 'มาสาย', remark: 'ในสถานที่', location_mode: 'ONSITE',
                    is_special_request: false, is_overtime: false, correction_status: 'none'
                },
                {
                    id: 'tc-2', personnel_id: 'per-1', user_id: 'usr-1', work_date: '2026-11-11',
                    shift_name: 'เวลาราชการปกติ (08:30 - 16:30)', check_in_time: '09:35', check_out_time: null,
                    status: 'ขาดราชการ', remark: 'ประชุม', location_mode: 'OFFSITE', offsite_reason: 'ประชุม',
                    correction_reject_reason: 'ขอทราบเลขหนังสือ',
                    is_special_request: false, is_overtime: false, correction_status: 'rejected'
                }
            ]);

            // 1) Admin Role Drawer (2x2 symmetrical grid) + Badges + Optional-Reason Submit
            {
                let liveLogs = makeSeedLogs();
                const ctx = await browser.newContext({
                    viewport: { width: 390, height: 844 },
                    permissions: ['geolocation'],
                    geolocation: { latitude: 13.7563, longitude: 100.5018 }
                });
                const page = await ctx.newPage();
                const adminUser = {
                    id: 'usr-1', personnel_id: 'per-1', username: 'admin_qa', full_name: 'นางวิไล แอดมิน',
                    role: 'Admin', visibility_level: 'bureau', scope_bureau: 'สำนักเทศกิจ', is_active: true,
                    personnel: { position_type: 'ข้าราชการ', position_title: 'นักวิชาการ', bureau: 'สำนักเทศกิจ', division: 'ส่วน A' },
                    expires_at: Date.now() + 86400000
                };
                await page.addInitScript(({ bId, sess }) => {
                    localStorage.setItem('bma_app_build', bId);
                    localStorage.setItem('bma_checkin_session_user_v2_7', JSON.stringify(sess));
                    localStorage.setItem('bma_last_seen_announcement_id', 'qa-seen');
                    sessionStorage.setItem('bma_reloaded_build', bId);
                }, { bId: buildId, sess: adminUser });

                await page.route('**/*.openstreetmap.org/**', r => r.abort());
                await page.route('**/*.supabase.co/**', async (route) => {
                    const req = route.request();
                    const u = req.url();
                    const method = req.method();
                    const isSingle = (req.headers()['accept'] || '').includes('object') || u.includes('limit=1');
                    if (u.includes('/system_settings')) {
                        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? baseSettings : [baseSettings]) });
                    }
                    if (u.includes('/user_accounts')) {
                        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? adminUser : [adminUser]) });
                    }
                    if (u.includes('/attendance_logs')) {
                        if (method === 'PATCH') {
                            const patch = req.postDataJSON();
                            const idMatch = u.match(/id=eq\.([^&]+)/);
                            const target = liveLogs.find(l => l.id === idMatch?.[1]) || liveLogs[0];
                            Object.assign(target, patch);
                            return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? target : [target]) });
                        }
                        if (u.includes('is_special_request=eq.true')) {
                            return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
                        }
                        if (u.includes(`work_date=eq.${today}`)) {
                            return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
                        }
                        if (u.includes('id=eq.tc-1')) {
                            return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? liveLogs[0] : [liveLogs[0]]) });
                        }
                        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(liveLogs) });
                    }
                    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
                });

                await page.goto(`${baseUrl}/checkin.html`, { waitUntil: 'load' });
                await page.waitForFunction(() => document.getElementById('drawerCorrectionBadge')?.textContent === '2', { timeout: 15000 });

                // Verify #btnDrawerNavCheckin removed & Admin 2x2 grid
                const adminDrawer = await page.evaluate(() => {
                    const hasCheckinBtn = !!document.getElementById('btnDrawerNavCheckin');
                    const adminLink = document.getElementById('drawerLinkAdminDashboard');
                    const histBtn = document.getElementById('btnDrawerNavHistory');
                    return {
                        hasCheckinBtn,
                        adminVisible: !adminLink?.classList.contains('hidden'),
                        histHasRowSpan2: histBtn?.classList.contains('row-span-2'),
                        drawerBadge: document.getElementById('drawerCorrectionBadge')?.textContent,
                        desktopBadge: document.getElementById('tabDesktopCorrectionBadge')?.textContent
                    };
                });
                assert.strictEqual(adminDrawer.hasCheckinBtn, false, '#btnDrawerNavCheckin must be removed');
                assert.strictEqual(adminDrawer.adminVisible, true, 'Admin must see #drawerLinkAdminDashboard');
                assert.strictEqual(adminDrawer.histHasRowSpan2, false, 'Admin 2x2 grid must not apply row-span-2');
                assert.strictEqual(adminDrawer.drawerBadge, '2');
                assert.strictEqual(adminDrawer.desktopBadge, '2');

                // Open Drawer -> switch to 'แก้ไขเวลา' -> submit optional empty reason in 1 click
                await page.click('#btnMobileHistoryMenu');
                await page.waitForSelector('#btnDrawerNavCorrection');
                await page.click('#btnDrawerNavCorrection');
                await page.waitForSelector('#personalTimeCorrectionCardsContainer button[data-action="request-time-correction"]');
                await page.click('#personalTimeCorrectionCardsContainer button[data-action="request-time-correction"][data-id="tc-1"]');
                await page.waitForSelector('#swalCorrectionReasonInput');
                await page.click('.swal2-confirm');
                await page.waitForFunction(() => document.getElementById('drawerCorrectionBadge')?.textContent === '1', { timeout: 10000 });
                const bodyText = await page.textContent('#personalTimeCorrectionCardsContainer');
                assert.ok(bodyText.includes('อยู่ระหว่างรออนุมัติ'));
                assert.ok(bodyText.includes('ขอแก้ไขเวลาอีกครั้ง'));

                // Switch to Desktop viewport & test #tabDesktopCorrection
                await page.click('#btnCloseMobileDrawer');
                await page.waitForTimeout(350);
                await page.setViewportSize({ width: 1280, height: 800 });
                await page.click('#tabDesktopCorrection');
                const desktopVisible = await page.evaluate(() => !document.getElementById('desktopCorrectionWrapper')?.classList.contains('hidden'));
                assert.strictEqual(desktopVisible, true, 'Desktop tab #tabDesktopCorrection must show #desktopCorrectionWrapper');
                await ctx.close();
            }

            // 2) User Role Drawer (row-span-2 symmetrical layout preserved across tab switches)
            {
                const ctx = await browser.newContext({
                    viewport: { width: 390, height: 844 },
                    permissions: ['geolocation'],
                    geolocation: { latitude: 13.7563, longitude: 100.5018 }
                });
                const page = await ctx.newPage();
                const regularUser = {
                    id: 'usr-u1', personnel_id: 'per-u1', username: 'user_qa', full_name: 'นายสมชาย ผู้ใช้',
                    role: 'User', is_active: true,
                    personnel: { position_type: 'ข้าราชการ', position_title: 'เจ้าพนักงานเทศกิจ', bureau: 'สำนักเทศกิจ', division: 'ส่วน A' },
                    expires_at: Date.now() + 86400000
                };
                await page.addInitScript(({ bId, sess }) => {
                    localStorage.setItem('bma_app_build', bId);
                    localStorage.setItem('bma_checkin_session_user_v2_7', JSON.stringify(sess));
                    localStorage.setItem('bma_last_seen_announcement_id', 'qa-seen');
                    sessionStorage.setItem('bma_reloaded_build', bId);
                }, { bId: buildId, sess: regularUser });

                await page.route('**/*.openstreetmap.org/**', r => r.abort());
                await page.route('**/*.supabase.co/**', async (route) => {
                    const req = route.request();
                    const u = req.url();
                    const isSingle = (req.headers()['accept'] || '').includes('object') || u.includes('limit=1');
                    if (u.includes('/system_settings')) {
                        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? baseSettings : [baseSettings]) });
                    }
                    if (u.includes('/user_accounts')) {
                        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? regularUser : [regularUser]) });
                    }
                    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
                });

                await page.goto(`${baseUrl}/checkin.html`, { waitUntil: 'load' });
                await page.waitForSelector('#btnMobileHistoryMenu');
                await page.click('#btnMobileHistoryMenu');
                await page.waitForSelector('#btnDrawerNavCorrection');

                // Switch to Correction tab, then back to History tab — row-span-2 symmetry MUST persist!
                await page.click('#btnDrawerNavCorrection');
                await page.click('#btnDrawerNavHistory');
                const userSymmetry = await page.evaluate(() => {
                    const adminLink = document.getElementById('drawerLinkAdminDashboard');
                    const histBtn = document.getElementById('btnDrawerNavHistory');
                    const specBtn = document.getElementById('btnDrawerNavSpecial');
                    const corrBtn = document.getElementById('btnDrawerNavCorrection');
                    const histRect = histBtn.getBoundingClientRect();
                    const specRect = specBtn.getBoundingClientRect();
                    const corrRect = corrBtn.getBoundingClientRect();
                    return {
                        adminHidden: adminLink?.classList.contains('hidden'),
                        histHasRowSpan2: histBtn?.classList.contains('row-span-2'),
                        histHeight: histRect.height,
                        leftSpanHeight: corrRect.bottom - specRect.top
                    };
                });
                assert.strictEqual(userSymmetry.adminHidden, true, 'User must hide #drawerLinkAdminDashboard');
                assert.strictEqual(userSymmetry.histHasRowSpan2, true, 'User #btnDrawerNavHistory must keep row-span-2');
                assert.ok(Math.abs(userSymmetry.histHeight - userSymmetry.leftSpanHeight) <= 3, `User right History height (${userSymmetry.histHeight}) must match left stacked height (${userSymmetry.leftSpanHeight})`);
                await ctx.close();
            }
        });

        await runAsyncTest('time-corrections.html (360x740 & 1280x800): 7-item 360px Bottom Nav, Executive RBAC gating, Before->After preview & Optional Reject', async () => {
            const versionJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'version.json'), 'utf8'));
            const buildId = versionJson.buildId;

            const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
            const page = await ctx.newPage();

            const nonExecAdmin = {
                id: 'usr-adm-nonexec', personnel_id: 'per-adm-nonexec', username: 'adm_nonexec', full_name: 'นายสุชาติ แอดมิน',
                role: 'Admin', visibility_level: 'bureau', scope_bureau: 'สำนักเทศกิจ',
                personnel: { position_type: 'ข้าราชการ', position_title: 'เจ้าพนักงานเทศกิจ', bureau: 'สำนักเทศกิจ', division: 'ส่วน A' },
                expires_at: Date.now() + 86400000
            };

            const seedAccounts = [
                { id: 'usr-adm-nonexec', personnel_id: 'per-adm-nonexec', role: 'Admin', visibility_level: 'bureau', is_active: true },
                { id: 'usr-adm-other', personnel_id: 'per-adm-other', role: 'Admin', visibility_level: 'division', is_active: true },
                { id: 'usr-u1', personnel_id: 'per-u1', role: 'User', visibility_level: 'none', is_active: true }
            ];

            let tcRows = [
                // 1) Self Admin request -> blocked
                {
                    id: 'req-self', personnel_id: 'per-adm-nonexec', user_id: 'usr-adm-nonexec', work_date: '2026-11-17',
                    shift_name: 'เวลาราชการปกติ (08:30 - 16:30)', check_in_time: '08:45', check_out_time: '16:35',
                    status: 'มาสาย', remark: '', location_mode: 'ONSITE', correction_status: 'pending',
                    correction_requested_at: '2026-11-17T02:00:00Z',
                    personnel: { id: 'per-adm-nonexec', prefix: 'นาย', first_name: 'สุชาติ', last_name: 'แอดมิน', position_type: 'ข้าราชการ', position_title: 'เจ้าพนักงานเทศกิจ', position_level: 'ชำนาญการ', bureau: 'สำนักเทศกิจ', division: 'ส่วน A', work_group: 'กลุ่ม 1' }
                },
                // 2) Other Admin request viewed by Non-Exec Admin -> blocked
                {
                    id: 'req-other-admin', personnel_id: 'per-adm-other', user_id: 'usr-adm-other', work_date: '2026-11-17',
                    shift_name: 'เวลาราชการปกติ (08:30 - 16:30)', check_in_time: '08:52', check_out_time: '16:30',
                    status: 'มาสาย', remark: '', location_mode: 'ONSITE', correction_status: 'pending',
                    correction_requested_at: '2026-11-17T01:50:00Z',
                    personnel: { id: 'per-adm-other', prefix: 'นาง', first_name: 'วิไล', last_name: 'แอดมินสอง', position_type: 'ข้าราชการ', position_title: 'นักวิชาการ', position_level: 'ชำนาญการ', bureau: 'สำนักเทศกิจ', division: 'ส่วน A', work_group: 'กลุ่ม 1' }
                },
                // 3) User request -> allowed!
                {
                    id: 'req-user', personnel_id: 'per-u1', user_id: 'usr-u1', work_date: '2026-11-17',
                    shift_name: 'เวลาราชการปกติ (08:30 - 16:30)', check_in_time: '08:45', check_out_time: '16:35',
                    status: 'มาสาย', remark: 'ประชุม', location_mode: 'OFFSITE', offsite_reason: 'ประชุม', correction_status: 'pending',
                    correction_requested_at: '2026-11-17T01:40:00Z', correction_request_reason: 'รถติดหน้าสำนักงาน',
                    personnel: { id: 'per-u1', prefix: 'นาย', first_name: 'สมชาย', last_name: 'ผู้ใช้', position_type: 'ข้าราชการ', position_title: 'เจ้าพนักงานเทศกิจ', position_level: 'ปฏิบัติการ', bureau: 'สำนักเทศกิจ', division: 'ส่วน A', work_group: 'กลุ่ม 1' }
                }
            ];

            await page.addInitScript(({ bId, sess }) => {
                localStorage.setItem('bma_app_build', bId);
                localStorage.setItem('bma_checkin_session_user_v2_7', JSON.stringify(sess));
                localStorage.setItem('bma_last_seen_announcement_id', 'qa-seen');
                sessionStorage.setItem('bma_reloaded_build', bId);
            }, { bId: buildId, sess: nonExecAdmin });

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
                        const idMatch = u.match(/id=eq\.([^&]+)/);
                        const target = tcRows.find(r => r.id === idMatch?.[1]);
                        if (target) Object.assign(target, patch);
                        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(target ? [target] : []) });
                    }
                    if (u.includes('is_special_request=eq.true')) {
                        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
                    }
                    if (u.includes('correction_status=eq.pending')) {
                        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tcRows.filter(r => r.correction_status === 'pending')) });
                    }
                    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tcRows) });
                }
                return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
            });

            await page.goto(`${baseUrl}/time-corrections.html`, { waitUntil: 'load' });
            await page.waitForSelector('#timeCorrectionsCardsContainer [data-card-id="req-user"]');

            const mobileAudit = await page.evaluate(() => {
                const nav = document.querySelector('#bmaMobileBottomNav nav');
                const navLinks = Array.from(nav.querySelectorAll('a'));
                const selfCard = document.querySelector('#timeCorrectionsCardsContainer [data-card-id="req-self"]');
                const otherAdmCard = document.querySelector('#timeCorrectionsCardsContainer [data-card-id="req-other-admin"]');
                const userCard = document.querySelector('#timeCorrectionsCardsContainer [data-card-id="req-user"]');
                return {
                    navRectWidth: nav.getBoundingClientRect().width,
                    navOverflowX: getComputedStyle(nav).overflowX,
                    navLabels: navLinks.map(a => a.querySelector('span')?.textContent?.trim()),
                    corrBadgeText: document.getElementById('mobileNavCorrectionBadge')?.textContent?.trim(),
                    selfHasCheckbox: !!selfCard?.querySelector('.chk-correction-row'),
                    selfText: selfCard?.textContent,
                    otherAdmHasCheckbox: !!otherAdmCard?.querySelector('.chk-correction-row'),
                    otherAdmText: otherAdmCard?.textContent,
                    userHasCheckbox: !!userCard?.querySelector('.chk-correction-row'),
                    userText: userCard?.textContent
                };
            });

            assert.ok(mobileAudit.navRectWidth <= 360, `360px bottom nav width ${mobileAudit.navRectWidth}`);
            assert.strictEqual(mobileAudit.navOverflowX, 'auto');
            assert.ok(mobileAudit.navLabels.includes('อนุมัติพิเศษ') && mobileAudit.navLabels.includes('แก้เวลา'));
            assert.strictEqual(mobileAudit.corrBadgeText, '3');
            assert.strictEqual(mobileAudit.selfHasCheckbox, false, 'Self Admin card must not have checkbox');
            assert.ok(mobileAudit.selfText.includes('คำขอของตนเอง (รอผู้บริหาร/SuperAdmin)'));
            assert.strictEqual(mobileAudit.otherAdmHasCheckbox, false, 'Other Admin card must not have checkbox for non-exec Admin');
            assert.ok(mobileAudit.otherAdmText.includes('สงวนสิทธิ์อนุมัติเฉพาะผู้บริหาร / SuperAdmin'));
            assert.strictEqual(mobileAudit.userHasCheckbox, true, 'User card must have checkbox');
            assert.ok(mobileAudit.userText.includes('ประชุม (แก้ไขเวลา)'));

            // Test reject button opens optional reason SweetAlert and skips empty input cleanly
            await page.click('#timeCorrectionsCardsContainer [data-card-id="req-user"] button[data-action="reject-single"]');
            await page.waitForSelector('#swalCorrectionRejectReasonInput');
            await page.click('.swal2-confirm');
            await page.waitForFunction(() => document.querySelector('.swal2-title')?.textContent?.includes('ดำเนินการสำเร็จ'), { timeout: 10000 });
            assert.strictEqual(tcRows.find(r => r.id === 'req-user').correction_status, 'rejected');

            await ctx.close();
        });
    } finally {
        await browser.close();
        server.close();
    }

    console.log('\n▶️ Suite 5: Reports & Dashboard Propagation Contracts');
    runTest('ReportsController preserves ขอแก้ไขเวลา & <remark> (แก้ไขเวลา) across Web/Print/Excel while suppressing ในสถานที่; DashboardController diffs check-in', () => {
        const reportsSrc = fs.readFileSync(path.join(ROOT_DIR, 'assets/js/controllers/ReportsController.js'), 'utf8');
        const dashSrc = fs.readFileSync(path.join(ROOT_DIR, 'assets/js/controllers/DashboardController.js'), 'utf8');
        assert.ok(reportsSrc.includes("rawRemarkCheck === 'ขอแก้ไขเวลา' || rawRemarkCheck.endsWith('(แก้ไขเวลา)')"));
        assert.ok(reportsSrc.includes('data-field="remark"'));
        assert.ok(reportsSrc.includes("const remarkTd = row.querySelector('td[data-field=\"remark\"]')"));
        assert.ok(dashSrc.includes('data-field="check-in"'));
        assert.ok(dashSrc.includes('if (cells[4])'));
    });

    console.log('\n======================================================================');
    console.log(`📊 Test Summary: Total ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
    console.log('======================================================================');
    if (failedTests > 0) {
        process.exitCode = 1;
    } else {
        console.log('🎉 ALL V49 TIME CORRECTION & APPROVALS TESTS PASSED 100%!');
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
