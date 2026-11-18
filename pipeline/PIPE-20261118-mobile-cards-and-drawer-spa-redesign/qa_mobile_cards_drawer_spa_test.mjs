/**
 * qa_mobile_cards_drawer_spa_test.mjs
 * Dedicated QA Suite for PIPE-20261118-mobile-cards-and-drawer-spa-redesign
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

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

function createHarness(options = {}) {
    const store = new Map(Object.entries(options.localStorage || {}));
    const sessionStore = new Map(Object.entries(options.sessionStorage || {}));
    const domElements = {};
    const intervals = [];
    const timeouts = [];
    const REAL_SET_INTERVAL = globalThis.setInterval;
    const REAL_SET_TIMEOUT = globalThis.setTimeout;

    class MockClassList {
        constructor(el, initial = []) {
            this._el = el;
            this._set = new Set(initial);
        }
        contains(c) { return this._set.has(c); }
        add(...cls) {
            cls.forEach(c => this._set.add(c));
            this._el._syncClassName();
        }
        remove(...cls) {
            cls.forEach(c => this._set.delete(c));
            this._el._syncClassName();
        }
        toggle(c, force) {
            if (force !== undefined) {
                if (force) this._set.add(c);
                else this._set.delete(c);
                this._el._syncClassName();
                return Boolean(force);
            }
            const next = !this._set.has(c);
            if (next) this._set.add(c);
            else this._set.delete(c);
            this._el._syncClassName();
            return next;
        }
        toString() { return [...this._set].join(' '); }
    }

    function getOrCreateElem(id, initialClasses = []) {
        if (!domElements[id]) {
            const el = {
                id,
                tagName: 'DIV',
                parentElement: null,
                children: [],
                listeners: {},
                dataset: {},
                style: {},
                textContent: '',
                innerHTML: '',
                value: '',
                disabled: false,
                scrollTop: 0,
                _className: initialClasses.join(' '),
                _syncClassName() {
                    this._className = this.classList.toString();
                },
                appendChild(child) {
                    if (child.parentElement && Array.isArray(child.parentElement.children)) {
                        child.parentElement.children = child.parentElement.children.filter(c => c !== child);
                    }
                    child.parentElement = this;
                    this.children.push(child);
                    return child;
                },
                contains(other) {
                    let cur = other;
                    while (cur) {
                        if (cur === this) return true;
                        cur = cur.parentElement;
                    }
                    return false;
                },
                closest(selector) {
                    if (selector && selector.startsWith('#')) {
                        const targetId = selector.slice(1);
                        let cur = this;
                        while (cur) {
                            if (cur.id === targetId) return cur;
                            cur = cur.parentElement;
                        }
                    }
                    return null;
                },
                addEventListener(type, fn) {
                    this.listeners[type] = this.listeners[type] || [];
                    this.listeners[type].push(fn);
                },
                dispatchEvent(evt) {
                    const event = {
                        type: evt.type,
                        target: evt.target || this,
                        currentTarget: this,
                        preventDefault() {},
                        stopPropagation() {},
                        ...evt
                    };
                    for (const fn of (this.listeners[event.type] || [])) {
                        fn(event);
                    }
                    return event;
                },
                click() {
                    return this.dispatchEvent({ type: 'click', target: this });
                },
                querySelectorAll: () => [],
                querySelector: () => null
            };
            el.classList = new MockClassList(el, initialClasses);
            Object.defineProperty(el, 'className', {
                get() { return this._className; },
                set(val) {
                    this._className = String(val || '');
                    this.classList._set = new Set(this._className.split(/\s+/).filter(Boolean));
                }
            });
            domElements[id] = el;
        }
        return domElements[id];
    }

    // Wire key containers
    const desktopPanes = getOrCreateElem('desktopPanesContainer');
    const checkinPane = getOrCreateElem('checkinWorkspaceWrapper');
    const historyPane = getOrCreateElem('desktopHistoryWrapper', ['hidden']);
    const specialPane = getOrCreateElem('desktopSpecialWrapper', ['hidden']);
    desktopPanes.appendChild(historyPane);
    desktopPanes.appendChild(specialPane);

    const drawer = getOrCreateElem('mobileHistoryDrawer', ['hidden']);
    const drawerPanel = getOrCreateElem('mobileDrawerPanel', ['translate-x-full']);
    const drawerScroll = getOrCreateElem('mobileDrawerBodyScroll');
    const drawerMount = getOrCreateElem('mobileDrawerHistoryMount');
    const drawerQuick = getOrCreateElem('drawerSpecialQuickAction', ['hidden']);
    const drawerShimmer = getOrCreateElem('drawerSpaShimmer', ['hidden']);
    drawer.appendChild(drawerPanel);
    drawerPanel.appendChild(drawerScroll);
    drawerScroll.appendChild(drawerQuick);
    drawerScroll.appendChild(drawerShimmer);
    drawerScroll.appendChild(drawerMount);

    getOrCreateElem('drawerLinkAdminDashboard', ['hidden']);
    getOrCreateElem('todayHistoryTabPanel');
    getOrCreateElem('pastHistoryTabPanel', ['hidden']);

    const mockDoc = {
        hidden: false,
        documentElement: { classList: new MockClassList({ _syncClassName() {} }, []) },
        body: { innerHTML: '', appendChild() {} },
        getElementById: (id) => getOrCreateElem(id),
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        createElement: () => getOrCreateElem(`dyn_${Math.random().toString(36).slice(2, 7)}`)
    };

    const mockWindow = {
        location: { pathname: '/checkin.html', href: 'http://localhost/checkin.html', replace() {}, reload() {} },
        localStorage: {
            getItem: (k) => (store.has(k) ? store.get(k) : null),
            setItem: (k, v) => store.set(k, String(v)),
            removeItem: (k) => store.delete(k)
        },
        sessionStorage: {
            getItem: (k) => (sessionStore.has(k) ? sessionStore.get(k) : null),
            setItem: (k, v) => sessionStore.set(k, String(v)),
            removeItem: (k) => sessionStore.delete(k)
        },
        history: { replaceState() {} },
        addEventListener: () => {},
        matchMedia: () => ({ matches: false }),
        navigator: { userAgent: 'Mozilla/5.0' }
    };

    const sessionUser = options.user || {
        id: 'U-QA-1',
        personnel_id: 'P-QA-1',
        username: 'qa_user',
        full_name: 'นายวิศรุต โต๊ะพาน',
        role: 'User',
        personnel: {
            id: 'P-QA-1',
            position_title: 'นักจัดการงานทั่วไป',
            position_level: 'ปฏิบัติการ',
            position_type: 'ประเภทวิชาการ',
            organization: 'กรุงเทพมหานคร',
            bureau: 'สำนักเทศกิจ',
            division: 'สำนักงานเลขานุการ',
            work_group: 'กลุ่มงานการเจ้าหน้าที่'
        },
        expires_at: Date.now() + 86400000
    };
    store.set('bma_checkin_session_user_v2_7', JSON.stringify(sessionUser));

    globalThis.document = mockDoc;
    globalThis.window = mockWindow;
    globalThis.localStorage = mockWindow.localStorage;
    globalThis.sessionStorage = mockWindow.sessionStorage;
    globalThis.requestAnimationFrame = (cb) => cb();
    globalThis.Swal = {
        isVisible: () => false,
        close: () => {},
        fire: async () => ({ isConfirmed: true }),
        showLoading: () => {}
    };
    globalThis.supabase = {
        createClient: () => ({
            from: () => ({
                select() { return this; },
                eq() { return this; },
                neq() { return this; },
                is() { return this; },
                order() { return this; },
                limit() { return this; },
                maybeSingle() { return Promise.resolve({ data: null, error: null }); },
                then(resolve) { return resolve({ data: [], error: null }); }
            }),
            channel: () => ({ on() { return this; }, subscribe() { return this; } })
        })
    };
    globalThis.setInterval = (fn, ms) => {
        const id = REAL_SET_INTERVAL(fn, ms);
        intervals.push(id);
        return id;
    };
    globalThis.setTimeout = (fn, ms) => {
        const id = REAL_SET_TIMEOUT(fn, ms);
        timeouts.push(id);
        return id;
    };

    return {
        domElements,
        getOrCreateElem,
        cleanup() {
            intervals.forEach(id => clearInterval(id));
            timeouts.forEach(id => clearTimeout(id));
            globalThis.setInterval = REAL_SET_INTERVAL;
            globalThis.setTimeout = REAL_SET_TIMEOUT;
        }
    };
}

console.log('======================================================================');
console.log('🧪 Starting Dedicated QA Suite: Mobile Card-List & Hamburger Drawer SPA');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: DOM IDs Invariance & Structural Markup in checkin.html + bma-theme.css
// -----------------------------------------------------------------------------
console.log('▶️ Suite 1: checkin.html DOM IDs Invariance & Drawer / Card Structure');
const checkinHtml = fs.readFileSync('checkin.html', 'utf8');
const cssText = fs.readFileSync('assets/css/bma-theme.css', 'utf8');
const controllerSrc = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');

runTest('Zero DOM IDs removed vs HEAD:checkin.html and all 30 adr_004 IDs preserved', () => {
    const headHtml = execFileSync('git', ['show', 'HEAD:checkin.html'], { encoding: 'utf8' });
    const getIds = (src) => new Set([...src.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]));
    const headIds = getIds(headHtml);
    const curIds = getIds(checkinHtml);
    const removed = [...headIds].filter(id => !curIds.has(id));
    assert.deepStrictEqual(removed, [], `Removed DOM IDs: ${removed.join(', ')}`);

    const adr004Src = fs.readFileSync('second_brain_vault/01_architecture_decisions/adr_004_checkin_viewport_lock_and_drawer.md', 'utf8');
    const adrIds = [...new Set([...adr004Src.matchAll(/`([A-Za-z][A-Za-z0-9_]+)`/g)].map(m => m[1]))]
        .filter(id => !['100dvh', '100vh', 'checkin', 'html', 'CheckinController', 'js', 'bma', 'theme', 'css', 'FLOW_CHECKIN_01', 'FLOW_LAYOUT_01', 'FLOW_SPECIAL_REQ_01', 'SuperAdmin', 'Admin'].includes(id));
    const adrInHead = adrIds.filter(id => headIds.has(id));
    assert.strictEqual(adrInHead.length, 30);
    const adrRemoved = adrInHead.filter(id => !curIds.has(id));
    assert.deepStrictEqual(adrRemoved, []);
});

runTest('Drawer Head displays #drawerUserFullName & #drawerUserPosition, and hides #drawerUserRole/#drawerUserAffiliation inside #mobileDrawerPanel', () => {
    const drawerStart = checkinHtml.indexOf('id="mobileDrawerPanel"');
    const drawerFooter = checkinHtml.indexOf('<!-- Drawer Footer:', drawerStart);
    const drawerChunk = checkinHtml.slice(drawerStart, drawerFooter);

    assert.ok(drawerChunk.includes('id="drawerUserFullName"'), 'Missing #drawerUserFullName in drawer');
    assert.ok(drawerChunk.includes('id="drawerUserPosition"'), 'Missing #drawerUserPosition in drawer');
    assert.ok(!drawerChunk.includes('ระบบลงเวลาปฏิบัติราชการ'), 'Static system header text removed from drawer head');
    assert.ok(!drawerChunk.includes('กรุงเทพมหานคร • สำนักเทศกิจ'), 'Static bureau subtitle removed from drawer head');

    const hiddenBlock = drawerChunk.match(/<div class="hidden" aria-hidden="true">[\s\S]*?<span id="drawerUserRole">[\s\S]*?<span id="drawerUserAffiliation">[\s\S]*?<\/div>/);
    assert.ok(hiddenBlock, '#drawerUserRole and #drawerUserAffiliation preserved in hidden aria-hidden container inside #mobileDrawerPanel');
});

runTest('SPA scroll container, quick action container, shimmer container, and mobile Card-List containers exist', () => {
    assert.ok(checkinHtml.includes('id="mobileDrawerBodyScroll"'));
    assert.ok(checkinHtml.includes('id="drawerSpecialQuickAction" class="hidden'));
    assert.ok(checkinHtml.includes('id="drawerSpaShimmer" class="hidden'));
    assert.ok(checkinHtml.includes('id="todayPersonalCardsContainer" class="lg:hidden space-y-3"'));
    assert.ok(checkinHtml.includes('id="pastPersonalCardsContainer" class="lg:hidden space-y-3"'));
    assert.ok(checkinHtml.includes('id="personalSpecialRequestsCardsContainer" class="lg:hidden space-y-3"'));
    assert.ok(checkinHtml.includes('bg-slate-100/80 lg:bg-white dark:bg-slate-900/60 lg:dark:bg-slate-800'));

    const btnDesktopSpecial = checkinHtml.match(/<button[^>]*id="btnOpenSpecialFromDesktopTab"[^>]*>/)[0];
    assert.ok(btnDesktopSpecial.includes('hidden lg:inline-flex'), '#btnOpenSpecialFromDesktopTab hidden on mobile');
    assert.ok(!btnDesktopSpecial.includes('onclick='), 'Inline onclick removed from #btnOpenSpecialFromDesktopTab');
    assert.ok(!checkinHtml.includes('+ ยื่นขอลงเวลาใหม่'), 'Duplicate "+ " removed from desktop special request button');
    assert.ok(controllerSrc.includes("document.getElementById('btnOpenSpecialFromDesktopTab')?.addEventListener('click', openSpecialModal);"));
    assert.ok(cssText.includes('#mobileDrawerHistoryMount .bma-checkin-table-card'));
});

runTest('checkin.html has balanced HTML tag nesting', () => {
    const tagStack = [];
    const tagRe = /<\/?([a-zA-Z0-9\-]+)(?:\s+[^>]*)?>/g;
    const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype']);
    let m;
    while ((m = tagRe.exec(checkinHtml)) !== null) {
        const raw = m[0];
        const name = m[1].toLowerCase();
        if (voidTags.has(name) || raw.endsWith('/>')) continue;
        if (raw.startsWith('</')) {
            const last = tagStack.pop();
            assert.strictEqual(last, name, `Tag mismatch: expected </${last}> got </${name}>`);
        } else {
            tagStack.push(name);
        }
    }
    assert.strictEqual(tagStack.length, 0, `Unclosed tags: ${tagStack.join(', ')}`);
});

// -----------------------------------------------------------------------------
// Suite 2: UIHelpers Date & Overnight Shift Helpers
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 2: UIHelpers 4-Digit B.E. Date & Overnight Date Shift');
const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');

runTest('UIHelpers.formatThaiShortDateFullYear returns 4-digit B.E. year', () => {
    assert.strictEqual(UIHelpers.formatThaiShortDateFullYear('2026-11-17'), '17 พ.ย. 2569');
    assert.strictEqual(UIHelpers.formatThaiShortDateFullYear('2026-01-05'), '5 ม.ค. 2569');
    assert.strictEqual(UIHelpers.formatThaiShortDateFullYear(''), '-');
});

runTest('UIHelpers.shiftDateISO shifts +1 day cleanly across month and year boundaries without DST drift', () => {
    assert.strictEqual(UIHelpers.shiftDateISO('2026-11-14', 1), '2026-11-15');
    assert.strictEqual(UIHelpers.shiftDateISO('2026-11-30', 1), '2026-12-01');
    assert.strictEqual(UIHelpers.shiftDateISO('2026-12-31', 1), '2027-01-01');
    assert.strictEqual(UIHelpers.shiftDateISO('2026-02-28', 1), '2026-03-01');
});

// -----------------------------------------------------------------------------
// Suite 3: AttendanceModel Split Status Evaluation & Query Fallback (42703 / PGRST204)
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 3: AttendanceModel Split Status & Supabase 42703/PGRST204 Fallback');
const harnessForModel = createHarness();
const { AttendanceModel } = await import('../../assets/js/models/AttendanceModel.js');
const { DatabaseService } = await import('../../assets/js/core/DatabaseService.js');
const { SettingsModel } = await import('../../assets/js/models/SettingsModel.js');
const { Config } = await import('../../assets/js/core/Config.js');

const defaultSettings = Config.DEFAULT_SETTINGS;

runTest('evaluateSplitAttendanceStatus handles normal, late, early checkout, unclosed, absent, and overnight OT with BMA semantic colors', () => {
    const normal = AttendanceModel.evaluateSplitAttendanceStatus({
        shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
        check_in_time: '08:05',
        check_out_time: '17:17',
        is_overtime: false
    }, defaultSettings);
    assert.strictEqual(normal.checkIn.status_key, 'normal');
    assert.strictEqual(normal.checkIn.color, '#00744B');
    assert.strictEqual(normal.checkOut.status_key, 'normal');
    assert.strictEqual(normal.checkOut.color, '#00744B');
    assert.strictEqual(normal.isOvernight, false);

    const lateInNormalOut = AttendanceModel.evaluateSplitAttendanceStatus({
        shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
        check_in_time: '08:42',
        check_out_time: '16:35',
        is_overtime: false
    }, defaultSettings);
    assert.strictEqual(lateInNormalOut.checkIn.status_key, 'late');
    assert.strictEqual(lateInNormalOut.checkIn.color, '#D97706');
    assert.strictEqual(lateInNormalOut.checkOut.status_key, 'normal');
    assert.strictEqual(lateInNormalOut.checkOut.color, '#00744B');

    const earlyOut = AttendanceModel.evaluateSplitAttendanceStatus({
        shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
        check_in_time: '08:15',
        check_out_time: '15:00',
        is_overtime: false
    }, defaultSettings);
    assert.strictEqual(earlyOut.checkIn.status_key, 'normal');
    assert.strictEqual(earlyOut.checkOut.status_key, 'absent_duty');
    assert.strictEqual(earlyOut.checkOut.color, '#EA580C');

    const unclosed = AttendanceModel.evaluateSplitAttendanceStatus({
        shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
        check_in_time: '08:20',
        check_out_time: null,
        is_overtime: false
    }, defaultSettings);
    assert.strictEqual(unclosed.checkIn.status_key, 'normal');
    assert.strictEqual(unclosed.checkOut.status_key, 'no_checkin');
    assert.strictEqual(unclosed.checkOut.color, '#E11D48');

    const overnightOt = AttendanceModel.evaluateSplitAttendanceStatus({
        shift_name: 'ปฏิบัติงานนอกเวลา (17:00 - 01:00) (ข้ามวัน)',
        check_in_time: '17:00',
        check_out_time: '01:00',
        is_overtime: true
    }, defaultSettings);
    assert.strictEqual(overnightOt.checkIn.status_key, 'overtime');
    assert.strictEqual(overnightOt.checkIn.color, '#0971CE');
    assert.strictEqual(overnightOt.checkOut.status_key, 'overtime');
    assert.strictEqual(overnightOt.checkOut.color, '#0971CE');
    assert.strictEqual(overnightOt.isOvernight, true);
});

await runAsyncTest('getPersonalAttendanceHistory selects check_out_location and falls back cleanly on PGRST204', async () => {
    const modelSrc = fs.readFileSync('assets/js/models/AttendanceModel.js', 'utf8');
    assert.ok(modelSrc.includes('getPersonalAttendanceHistory(personnelId, userId, limit = 35)'), 'limit = 35 signature intact');

    const origGetInstance = DatabaseService.getInstance;
    const origGetSettings = SettingsModel.getSettings;
    const selectedCols = [];

    SettingsModel.getSettings = async () => defaultSettings;
    DatabaseService.getInstance = () => ({
        client: {
            from() {
                let cols = '';
                const chain = {
                    select(c) { cols = c; selectedCols.push(c); return chain; },
                    order() { return chain; },
                    limit() { return chain; },
                    eq() { return chain; },
                    then(resolve) {
                        if (cols.includes('location_mode')) {
                            return resolve({ data: null, error: { code: 'PGRST204', message: 'column not found in schema cache' } });
                        }
                        return resolve({
                            data: [{
                                id: 'L1',
                                work_date: '2026-11-17',
                                shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
                                check_in_time: '08:05',
                                check_out_time: '17:17',
                                check_in_location: '30 ซอยอรุณอมรินทร์ 4',
                                check_out_location: 'สำนักงานปศุสัตว์กรุงเทพมหานคร',
                                status: 'ปฏิบัติงานปกติ',
                                is_overtime: false,
                                is_special_request: false
                            }],
                            error: null
                        });
                    }
                };
                return chain;
            }
        }
    });

    try {
        const list = await AttendanceModel.getPersonalAttendanceHistory('P1', 'U1', 35);
        assert.strictEqual(selectedCols.length, 2, 'Primary + fallback queries executed');
        assert.ok(selectedCols[0].includes('check_out_location'));
        assert.ok(selectedCols[1].includes('check_out_location'));
        assert.strictEqual(list.length, 1);
        assert.strictEqual(list[0].check_out_location, 'สำนักงานปศุสัตว์กรุงเทพมหานคร');
        assert.strictEqual(list[0].check_in_status.color, '#00744B');
        assert.strictEqual(list[0].check_out_status.color, '#00744B');
    } finally {
        DatabaseService.getInstance = origGetInstance;
        SettingsModel.getSettings = origGetSettings;
    }
});

await runAsyncTest('getPersonalSpecialRequests selects check_out_location and falls back cleanly on 42703 & PGRST204', async () => {
    const origGetInstance = DatabaseService.getInstance;
    const selectedCols = [];
    DatabaseService.getInstance = () => ({
        client: {
            from() {
                let cols = '';
                const chain = {
                    select(c) { cols = c; selectedCols.push(c); return chain; },
                    eq() { return chain; },
                    order() { return chain; },
                    then(resolve) {
                        if (cols.includes('location_mode')) {
                            return resolve({ data: null, error: { code: '42703', message: 'column does not exist' } });
                        }
                        return resolve({
                            data: [{
                                id: 'SR1',
                                work_date: '2026-11-14',
                                shift_name: 'ปฏิบัติงานนอกเวลา (17:00 - 01:00) (ข้ามวัน)',
                                check_in_time: '17:00',
                                check_out_time: '01:00',
                                check_in_location: 'สำนักเทศกิจ',
                                check_out_location: 'สำนักเทศกิจ',
                                remark: 'ลืมลงเวลาปฏิบัติราชการ',
                                is_overtime: true,
                                is_special_request: true,
                                approval_status: 'pending'
                            }],
                            error: null
                        });
                    }
                };
                return chain;
            }
        }
    });

    try {
        const list = await AttendanceModel.getPersonalSpecialRequests('P1', 'U1');
        assert.strictEqual(selectedCols.length, 2);
        assert.ok(selectedCols[0].includes('check_out_location'));
        assert.ok(selectedCols[1].includes('check_in_location'));
        assert.ok(selectedCols[1].includes('check_out_location'));
        assert.strictEqual(list.length, 1);
        assert.strictEqual(list[0].check_out_location, 'สำนักเทศกิจ');
    } finally {
        DatabaseService.getInstance = origGetInstance;
    }
});

harnessForModel.cleanup();

// -----------------------------------------------------------------------------
// Suite 4: CheckinController Runtime SPA, Race Guard, Mobile Cards & Delete Delegation
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 4: CheckinController Runtime SPA, Mobile Cards & Race Guard');

await runAsyncTest('CheckinController renders drawer position, Image-1 mobile cards, overnight +1 day, ONSITE remark purity, and AJAX SPA exclusive views', async () => {
    const h = createHarness();
    const origGetSettings = SettingsModel.getSettings;
    const origGetActive = AttendanceModel.getActiveRegularRecordForCheckout;
    const origGetHistory = AttendanceModel.getPersonalAttendanceHistory;
    const origGetSpecial = AttendanceModel.getPersonalSpecialRequests;

    let resolveSlowHistory = null;
    let historyCallCount = 0;

    SettingsModel.getSettings = async () => defaultSettings;
    AttendanceModel.getActiveRegularRecordForCheckout = async () => null;

    const todayIso = UIHelpers.getTodayISO();
    const sampleHistory = [
        {
            id: 'H-TODAY',
            work_date: todayIso,
            shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
            check_in_time: '08:05',
            check_out_time: '17:17',
            check_in_location: '30 ซอยอรุณอมรินทร์ 4',
            check_out_location: 'สำนักงานปศุสัตว์กรุงเทพมหานคร',
            status_label: 'ปฏิบัติงานปกติ',
            row_color: '#007B3E',
            location_mode: 'ONSITE',
            remark: 'ในสถานที่',
            check_in_status: { status_key: 'normal', status_label: 'ปฏิบัติงานปกติ', color: '#00744B' },
            check_out_status: { status_key: 'normal', status_label: 'ปฏิบัติงานปกติ', color: '#00744B' },
            is_overnight: false
        },
        {
            id: 'H-PAST-OT',
            work_date: '2026-11-14',
            shift_name: 'ปฏิบัติงานนอกเวลา (17:00 - 01:00) (ข้ามวัน)',
            check_in_time: '17:00',
            check_out_time: '01:00',
            check_in_location: 'สำนักเทศกิจ',
            check_out_location: 'ถนนราชดำเนิน',
            status_label: 'ปฏิบัติงานนอกเวลา',
            row_color: '#2563EB',
            location_mode: 'ONSITE',
            remark: 'ในสถานที่',
            check_in_status: { status_key: 'overtime', status_label: 'ปฏิบัติงานนอกเวลา', color: '#0971CE' },
            check_out_status: { status_key: 'overtime', status_label: 'ปฏิบัติงานนอกเวลา', color: '#0971CE' },
            is_overnight: true
        },
        {
            id: 'H-PAST-UNCLOSED',
            work_date: '2026-11-13',
            shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
            check_in_time: '08:42',
            check_out_time: null,
            check_in_location: 'สำนักเทศกิจ',
            check_out_location: null,
            status_label: 'มาสาย',
            row_color: '#EAB308',
            location_mode: 'ONSITE',
            remark: 'ในสถานที่',
            check_in_status: { status_key: 'late', status_label: 'มาสาย', color: '#D97706' },
            check_out_status: { status_key: 'no_checkin', status_label: 'ไม่ลงเวลา', color: '#E11D48' },
            is_overnight: false
        }
    ];

    const sampleSpecial = [
        {
            id: 'SP-1',
            work_date: '2026-11-14',
            shift_name: 'ปฏิบัติงานนอกเวลา (17:00 - 01:00) (ข้ามวัน)',
            check_in_time: '17:00',
            check_out_time: '01:00',
            check_in_location: 'สำนักเทศกิจ',
            check_out_location: 'สำนักเทศกิจ',
            location_mode: 'ONSITE',
            remark: 'ลืมลงเวลาปฏิบัติราชการ',
            offsite_reason: 'อบรม/สัมมนา/ประชุมราชการ',
            approval_status: 'pending'
        }
    ];

    AttendanceModel.getPersonalAttendanceHistory = async () => {
        historyCallCount++;
        if (historyCallCount === 2) {
            return await new Promise((resolve) => { resolveSlowHistory = resolve; });
        }
        return sampleHistory;
    };
    AttendanceModel.getPersonalSpecialRequests = async () => sampleSpecial;

    try {
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        new CheckinController();
        await new Promise(r => setTimeout(r, 30));

        // 1. Drawer Head Position
        assert.strictEqual(h.getOrCreateElem('drawerUserFullName').textContent, 'นายวิศรุต โต๊ะพาน');
        assert.strictEqual(h.getOrCreateElem('drawerUserPosition').textContent, 'นักจัดการงานทั่วไปปฏิบัติการ');

        // 2. Mobile Card Rendering & Dark-Mode WCAG AA Contrast
        const todayCardsHtml = h.getOrCreateElem('todayPersonalCardsContainer').innerHTML;
        assert.ok(todayCardsHtml.includes('30 ซอยอรุณอมรินทร์ 4'));
        assert.ok(todayCardsHtml.includes('สำนักงานปศุสัตว์กรุงเทพมหานคร'));
        assert.ok(todayCardsHtml.includes('สถานะเข้างาน'));
        assert.ok(todayCardsHtml.includes('สถานะออกงาน'));
        assert.ok(todayCardsHtml.includes('text-[#00744B] dark:text-emerald-400'), 'Normal status includes WCAG AA dark-mode color');
        assert.ok(todayCardsHtml.includes('text-slate-500 dark:text-slate-400'), 'Card labels use text-slate-500 for light-mode contrast');
        assert.ok(!todayCardsHtml.includes('style="color:'), 'No inline style color overriding dark mode');

        const pastCardsHtml = h.getOrCreateElem('pastPersonalCardsContainer').innerHTML;
        assert.ok(pastCardsHtml.includes('14 พ.ย. 2569 17:00 น.'), 'Overnight check-in uses 4-digit B.E. start date');
        assert.ok(pastCardsHtml.includes('15 พ.ย. 2569 01:00 น.'), 'Overnight checkout shifts date +1 day to 15 พ.ย. 2569');
        assert.ok(pastCardsHtml.includes('(+1 วัน)'), 'Overnight badge rendered');
        assert.ok(pastCardsHtml.includes('ยังไม่ได้ลงเวลาออกงาน'), 'Unclosed checkout shows clear Thai notice');
        assert.ok(pastCardsHtml.includes('text-[#0971CE] dark:text-sky-400'), 'Overtime status includes dark-mode contrast');
        assert.ok(pastCardsHtml.includes('text-[#D97706] dark:text-amber-400'), 'Late status includes dark-mode contrast');
        assert.ok(pastCardsHtml.includes('text-[#E11D48] dark:text-rose-400'), 'No-checkin status includes dark-mode contrast');

        // 3. Special Requests Card & ONSITE Remark Purity + XSS Escaping
        const spCardsHtml = h.getOrCreateElem('personalSpecialRequestsCardsContainer').innerHTML;
        assert.ok(spCardsHtml.includes('[ในสถานที่]'));
        assert.ok(spCardsHtml.includes('15 พ.ย. 2569 01:00 น.'), 'Special overnight request shifts checkout +1 day');
        assert.ok(spCardsHtml.includes('ลืมลงเวลาปฏิบัติราชการ'));
        assert.ok(!spCardsHtml.includes('อบรม/สัมมนา/ประชุมราชการ'), 'ONSITE remark must NOT leak offsite_reason');
        assert.ok(spCardsHtml.includes('data-action="delete-special-req"'), 'Pending special card shows delete button');
        assert.ok(spCardsHtml.includes('text-[#D97706] dark:text-amber-400'), 'Pending status includes dark-mode contrast');
        assert.ok(!spCardsHtml.includes('style="color:'), 'No inline style color on special cards');

        const ctrlSrcCheck = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');
        assert.ok(ctrlSrcCheck.includes('UIHelpers.escapeHtml(item.check_in_time)'), 'History check_in_time XSS escaped');
        assert.ok(ctrlSrcCheck.includes('UIHelpers.escapeHtml(item.check_out_time)'), 'History check_out_time XSS escaped');
        assert.ok(ctrlSrcCheck.includes('UIHelpers.escapeHtml(req.id)'), 'Special req.id XSS escaped in data-id');
        assert.ok(ctrlSrcCheck.includes('UIHelpers.escapeHtml(req.check_in_time'), 'Special req.check_in_time XSS escaped');
        assert.ok(ctrlSrcCheck.includes('UIHelpers.escapeHtml(req.check_out_time'), 'Special req.check_out_time XSS escaped');

        // 4. Open Mobile Drawer -> triggers AJAX SPA History view (call #2 is slow)
        h.getOrCreateElem('btnMobileHistoryMenu').click();
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(h.getOrCreateElem('drawerSpaShimmer').classList.contains('hidden'), false, 'Shimmer shows while fetching');
        assert.ok(h.getOrCreateElem('btnDrawerNavHistory').className.includes('from-[#00744B]'), 'History nav button is active emerald');

        // 5. User switches rapidly to Special view before slow history resolves -> race guard!
        h.getOrCreateElem('btnDrawerNavSpecial').click();
        await new Promise(r => setTimeout(r, 20));
        assert.ok(h.getOrCreateElem('btnDrawerNavSpecial').className.includes('from-[#00744B]'), 'Special nav button is active emerald');
        assert.ok(!h.getOrCreateElem('btnDrawerNavHistory').className.includes('from-[#00744B]'), 'History nav button deactivated');
        assert.strictEqual(h.getOrCreateElem('drawerSpecialQuickAction').classList.contains('hidden'), false, 'Special quick action visible in special SPA view');
        assert.strictEqual(h.getOrCreateElem('desktopSpecialWrapper').classList.contains('hidden'), false, 'Special wrapper visible');
        assert.strictEqual(h.getOrCreateElem('desktopHistoryWrapper').classList.contains('hidden'), true, 'History wrapper hidden in special view');

        // Now resolve stale history fetch -> must NOT overwrite special view!
        if (resolveSlowHistory) resolveSlowHistory(sampleHistory);
        await new Promise(r => setTimeout(r, 20));
        assert.strictEqual(h.getOrCreateElem('desktopSpecialWrapper').classList.contains('hidden'), false, 'Race guard prevented stale history from hiding special view');
        assert.strictEqual(h.getOrCreateElem('desktopHistoryWrapper').classList.contains('hidden'), true, 'Race guard kept history view hidden');
    } finally {
        SettingsModel.getSettings = origGetSettings;
        AttendanceModel.getActiveRegularRecordForCheckout = origGetActive;
        AttendanceModel.getPersonalAttendanceHistory = origGetHistory;
        AttendanceModel.getPersonalSpecialRequests = origGetSpecial;
        h.cleanup();
    }
});

// -----------------------------------------------------------------------------
// Suite 5: Manual Sync & 9 Root HTML Cache Version Sync
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 5: User Manual & Mandatory 9-HTML Cache Version Sync');

runTest('docs/manual/manual-user.html updated for SPA drawer, mobile cards, and [5, 10, 15, 20, 30] page sizes', () => {
    const manualHtml = fs.readFileSync('docs/manual/manual-user.html', 'utf8');
    assert.ok(manualHtml.includes('SPA'), 'Manual describes SPA drawer');
    assert.ok(manualHtml.includes('5, 10, 15, 20, 30'), 'Manual lists all 5 page sizes');
    assert.ok(manualHtml.includes('สถานะเข้างาน'), 'Manual mentions split check-in/out card details');
});

runTest('version.json and all 9 root HTML files match buildId 100%', () => {
    const versionData = JSON.parse(fs.readFileSync('version.json', 'utf8'));
    const buildId = versionData.buildId;
    assert.ok(buildId && buildId.length > 8, `Valid buildId: ${buildId}`);

    const rootHtmls = [
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
    for (const file of rootHtmls) {
        const src = fs.readFileSync(file, 'utf8');
        assert.ok(src.includes(`CURRENT_APP_BUILD = '${buildId}'`), `${file} CURRENT_APP_BUILD matches ${buildId}`);
        assert.ok(src.includes(`?v=${buildId}`), `${file} assets stamped with ?v=${buildId}`);
    }
});

console.log('\n======================================================================');
console.log(`📊 Test Summary: Total ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('======================================================================');
if (failedTests > 0) process.exit(1);
console.log('🎉 ALL MOBILE CARDS & DRAWER SPA TESTS PASSED 100%!\n');
