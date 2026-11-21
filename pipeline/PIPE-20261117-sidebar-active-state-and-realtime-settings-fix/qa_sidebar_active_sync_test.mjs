import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  [PASS] ${name}`);
        passed++;
    } catch (err) {
        console.error(`  [FAIL] ${name}\n         -> ${err.stack || err.message}`);
        failed++;
    }
}

async function testAsync(name, fn) {
    try {
        await fn();
        console.log(`  [PASS] ${name}`);
        passed++;
    } catch (err) {
        console.error(`  [FAIL] ${name}\n         -> ${err.stack || err.message}`);
        failed++;
    }
}

// ============================================================================
// Lightweight HTML-Parsing DOM + Browser Mock for Real ES Modules
// ============================================================================
class MockStorage {
    constructor() { this.map = new Map(); }
    getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
    setItem(k, v) { this.map.set(k, String(v)); }
    removeItem(k) { this.map.delete(k); }
    clear() { this.map.clear(); }
}

class MockClassList {
    constructor(el) { this.el = el; }
    _tokens() {
        return String(this.el._className || '').split(/\s+/).filter(Boolean);
    }
    _save(tokens) {
        this.el._className = tokens.join(' ');
    }
    add(...cls) {
        const s = new Set(this._tokens());
        cls.forEach(c => { if (c) s.add(c); });
        this._save([...s]);
    }
    remove(...cls) {
        const rm = new Set(cls);
        this._save(this._tokens().filter(c => !rm.has(c)));
    }
    contains(c) {
        return this._tokens().includes(c);
    }
    toggle(c, force) {
        const has = this.contains(c);
        const want = force !== undefined ? Boolean(force) : !has;
        if (want) this.add(c);
        else this.remove(c);
        return want;
    }
}

function parseAttributes(attrStr) {
    const attrs = {};
    const re = /([a-zA-Z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    let m;
    while ((m = re.exec(attrStr)) !== null) {
        const key = m[1];
        const val = m[2] ?? m[3] ?? m[4] ?? '';
        attrs[key] = val;
    }
    return attrs;
}

function parseHtmlIntoChildren(parent, html) {
    parent.children = [];
    if (!html) return;

    const voidTags = new Set(['img', 'input', 'br', 'hr', 'meta', 'link']);
    const tokenRe = /<!--[\s\S]*?-->|<\/?([a-zA-Z0-9-]+)([^>]*)>|([^<]+)/g;
    const stack = [parent];
    let match;

    while ((match = tokenRe.exec(html)) !== null) {
        const full = match[0];
        if (full.startsWith('<!--')) continue;

        if (match[3] !== undefined) {
            const top = stack[stack.length - 1];
            top._text = (top._text || '') + match[3];
            continue;
        }

        const tag = match[1].toLowerCase();
        const attrRaw = match[2] || '';
        const isClosing = full.startsWith('</');
        const isSelfClosing = full.endsWith('/>') || voidTags.has(tag);

        if (isClosing) {
            for (let i = stack.length - 1; i >= 1; i--) {
                if (stack[i].tagName.toLowerCase() === tag) {
                    stack.length = i;
                    break;
                }
            }
            continue;
        }

        const attrs = parseAttributes(attrRaw);
        const child = createMockElement(tag, attrs.id || '');
        for (const [k, v] of Object.entries(attrs)) {
            if (k === 'class') child._className = v;
            else if (k === 'id') child.id = v;
            else if (k === 'value') child.value = v;
            else if (k === 'checked') child.checked = true;
            else child.attributes[k] = v;
            if (k.startsWith('data-')) {
                const camel = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                child.dataset[camel] = v;
            }
        }
        const top = stack[stack.length - 1];
        top.appendChild(child);
        if (!isSelfClosing) {
            stack.push(child);
        }
    }
}

function collectText(el) {
    let out = el._text || '';
    for (const c of el.children) out += collectText(c);
    return out;
}

function matchesSimpleSelector(el, part) {
    let rem = part.trim();
    if (!rem) return false;

    const tagMatch = rem.match(/^([a-zA-Z0-9_-]+)/);
    if (tagMatch) {
        if (el.tagName.toLowerCase() !== tagMatch[1].toLowerCase()) return false;
        rem = rem.slice(tagMatch[1].length);
    }

    while (rem.length > 0) {
        if (rem[0] === '#') {
            const m = rem.match(/^#([a-zA-Z0-9_-]+)/);
            if (!m || el.id !== m[1]) return false;
            rem = rem.slice(m[0].length);
        } else if (rem[0] === '.') {
            const m = rem.match(/^\.([a-zA-Z0-9_-]+)/);
            if (!m || !el.classList.contains(m[1])) return false;
            rem = rem.slice(m[0].length);
        } else if (rem[0] === '[') {
            const m = rem.match(/^\[([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\]]*)))?\]/);
            if (!m) return false;
            const attrName = m[1];
            const expected = m[2] ?? m[3] ?? m[4];
            const actual = el.getAttribute(attrName);
            if (actual === null) return false;
            if (expected !== undefined && actual !== expected) return false;
            rem = rem.slice(m[0].length);
        } else {
            return false;
        }
    }
    return true;
}

function querySelectorAllInTree(root, selector) {
    const selectors = selector.split(',').map(s => s.trim()).filter(Boolean);
    const results = [];

    function walk(node, ancestors) {
        for (const sel of selectors) {
            const parts = sel.split(/\s+/).filter(Boolean);
            if (parts.length === 1) {
                if (matchesSimpleSelector(node, parts[0])) {
                    results.push(node);
                    break;
                }
            } else if (parts.length === 2) {
                if (matchesSimpleSelector(node, parts[1]) && ancestors.some(a => matchesSimpleSelector(a, parts[0]))) {
                    results.push(node);
                    break;
                }
            }
        }
        const nextAncestors = [...ancestors, node];
        for (const child of node.children) {
            walk(child, nextAncestors);
        }
    }

    for (const child of root.children) {
        walk(child, [root]);
    }
    return results;
}

function findByIdInTree(root, id) {
    for (const child of root.children) {
        if (child.id === id) return child;
        const found = findByIdInTree(child, id);
        if (found) return found;
    }
    return null;
}

function createMockElement(tag = 'div', id = '') {
    const el = {
        tagName: tag.toUpperCase(),
        id,
        _className: '',
        _innerHTML: '',
        _text: '',
        value: '',
        checked: false,
        disabled: false,
        children: [],
        attributes: {},
        dataset: {},
        style: {},
        listeners: {},
        listenerAddCounts: {},
        parentNode: null,
        get className() { return this._className; },
        set className(val) { this._className = String(val || ''); },
        get innerHTML() { return this._innerHTML; },
        set innerHTML(val) {
            this._innerHTML = String(val || '');
            this._text = '';
            parseHtmlIntoChildren(this, this._innerHTML);
        },
        get textContent() { return collectText(this); },
        set textContent(val) {
            this._text = String(val ?? '');
            this.children = [];
            this._innerHTML = this._text;
        },
        setAttribute(k, v) {
            if (k === 'id') this.id = String(v);
            else if (k === 'class') this._className = String(v);
            else this.attributes[k] = String(v);
        },
        getAttribute(k) {
            if (k === 'id') return this.id || null;
            if (k === 'class') return this._className;
            return k in this.attributes ? this.attributes[k] : null;
        },
        appendChild(child) {
            child.parentNode = this;
            this.children.push(child);
            return child;
        },
        removeChild(child) {
            this.children = this.children.filter(c => c !== child);
            child.parentNode = null;
        },
        remove() {
            if (this.parentNode) this.parentNode.removeChild(this);
        },
        cloneNode() {
            const clone = createMockElement(this.tagName.toLowerCase(), this.id);
            clone._className = this._className;
            clone._innerHTML = this._innerHTML;
            clone._text = this._text;
            clone.attributes = { ...this.attributes };
            clone.dataset = { ...this.dataset };
            clone.children = this.children.map(c => {
                const cc = c.cloneNode();
                cc.parentNode = clone;
                return cc;
            });
            return clone;
        },
        addEventListener(ev, fn) {
            (this.listeners[ev] ||= []).push(fn);
            this.listenerAddCounts[ev] = (this.listenerAddCounts[ev] || 0) + 1;
        },
        removeEventListener(ev, fn) {
            if (!this.listeners[ev]) return;
            this.listeners[ev] = this.listeners[ev].filter(f => f !== fn);
        },
        dispatchEvent(ev) {
            const fns = this.listeners[ev.type] || [];
            ev.target = ev.target || this;
            for (const fn of fns) fn(ev);
        },
        querySelector(sel) {
            return querySelectorAllInTree(this, sel)[0] || null;
        },
        querySelectorAll(sel) {
            return querySelectorAllInTree(this, sel);
        },
        closest(sel) {
            let cur = this;
            while (cur) {
                if (matchesSimpleSelector(cur, sel)) return cur;
                cur = cur.parentNode;
            }
            return null;
        }
    };
    el.classList = new MockClassList(el);
    return el;
}

const mockLocalStorage = new MockStorage();
const mockSessionStorage = new MockStorage();
const mockHead = createMockElement('head');
const mockBody = createMockElement('body');
const mockDocEl = createMockElement('html');
mockDocEl.appendChild(mockHead);
mockDocEl.appendChild(mockBody);

const windowListeners = new Map();
const docListeners = new Map();

class MockCustomEvent {
    constructor(type, init = {}) {
        this.type = type;
        this.detail = init.detail;
    }
}

globalThis.localStorage = mockLocalStorage;
globalThis.sessionStorage = mockSessionStorage;
globalThis.CustomEvent = MockCustomEvent;
globalThis.history = {
    pushState() {},
    replaceState() {}
};

// Mock Supabase client capturing realtime callbacks & tracking queries
const dbState = {
    settingsRow: {
        id: 1,
        organization_name: 'กรุงเทพมหานคร',
        bureau_name: 'สำนักเทศกิจ',
        header_system_title: 'BMA e-Government Time Attendance System',
        logo_url: '',
        footer_description: 'ระบบลงเวลาทดสอบ v2.10',
        require_photo: true,
        allow_gallery_fallback: true,
        require_gps: true,
        enforce_geofence_radius: true,
        single_click_checkin: false,
        randomize_gps_checkout: false,
        randomize_gps_radius_meters: 20,
        allow_checkin_start_time: '06:00',
        standard_check_in: '08:30',
        standard_check_out: '16:30',
        disable_normal_hours_checkin: false,
        late_threshold_minutes: 30,
        checkout_grace_minutes: 30,
        filter_shifts_by_realtime: true,
        early_shift_window_minutes: 30,
        google_drive_script_url: '',
        google_drive_folder_id: '',
        announcement_enabled: false,
        announcement_mode: 'text',
        announcement_start_date: '',
        announcement_end_date: '',
        announcement_title: '',
        announcement_body: '',
        announcement_image_url: '',
        announcement_drive_folder_id: '',
        announcement_updated_at: '',
        prefixes: ['นาย', 'นาง'],
        positions: [{ type: 'ประเภททั่วไป', title: 'เจ้าพนักงานเทศกิจ', level: 'ปฏิบัติงาน' }],
        affiliations: [{ organization: 'กรุงเทพมหานคร', bureau: 'สำนักเทศกิจ', division: 'สำนักงานเลขานุการ', group: 'กลุ่มงานการเจ้าหน้าที่' }],
        official_locations: [{ id: 'LOC-001', name: 'สำนักเทศกิจ', latitude: 13.756331, longitude: 100.501765, radius_meters: 150, is_active: true }],
        remarks: ['ประชุม'],
        offsite_job_types: ['ตรวจพื้นที่'],
        special_request_reasons: ['ลืมลงเวลา'],
        work_shifts: [{ name: 'เวลาราชการปกติ', check_in: '08:30', check_out: '16:30', is_custom: false, is_overtime: false, is_overnight: false, allow_early_checkin: false }],
        category_colors: { normal: '#007B3E', late: '#EAB308', absent_duty: '#EA580C', no_checkin: '#E11D48', overtime: '#2563EB', group_header: '#007B3E' },
        updated_at: '2026-11-17T08:00:00Z'
    },
    pendingSpecialRows: [
        { id: 'sp-1', approval_status: 'pending', work_date: '2026-11-17', personnel: { full_name: 'นายสมชาย', division: 'กองตรวจ', bureau: 'สำนักเทศกิจ', position: 'เจ้าหน้าที่' } },
        { id: 'sp-2', approval_status: 'pending', work_date: '2026-11-17', personnel: { full_name: 'นางสมหญิง', division: 'กองตรวจ', bureau: 'สำนักเทศกิจ', position: 'เจ้าหน้าที่' } }
    ],
    pendingResetRows: [
        { id: 'rst-1', status: 'pending', password_reset_requested: true, username: 'user1', full_name: 'นายทดสอบ', role: 'User', is_active: true, personnel: null }
    ],
    watermarkCallCount: 0,
    settingsSelectCount: 0,
    throwOnSettingsFetch: false
};

const realtimeHandlers = {
    postgresSystemSettings: null,
    broadcastGlobal: null
};

function makeQueryChain(table) {
    let isSingle = false;
    let selectedCols = '*';
    const chain = {
        select(cols) { selectedCols = cols || '*'; return chain; },
        eq() { return chain; },
        neq() { return chain; },
        in() { return chain; },
        order() { return chain; },
        limit() { return chain; },
        maybeSingle() { isSingle = true; return chain; },
        single() { isSingle = true; return chain; },
        update(patch) {
            if (table === 'system_settings') {
                dbState.settingsRow = { ...dbState.settingsRow, ...patch, updated_at: new Date().toISOString() };
            }
            return chain;
        },
        upsert(patch) {
            if (table === 'system_settings') {
                dbState.settingsRow = { ...dbState.settingsRow, ...patch, updated_at: new Date().toISOString() };
            }
            return chain;
        },
        then(resolve, reject) {
            try {
                if (table === 'system_settings') {
                    if (selectedCols.includes('enforce_geofence_radius') && !selectedCols.includes('*')) {
                        // Watermark query
                        const s = dbState.settingsRow;
                        return resolve({
                            data: {
                                id: s.id,
                                updated_at: s.updated_at,
                                enforce_geofence_radius: s.enforce_geofence_radius,
                                require_gps: s.require_gps,
                                require_photo: s.require_photo,
                                category_colors: s.category_colors
                            },
                            error: null
                        });
                    }
                    dbState.settingsSelectCount++;
                    if (dbState.throwOnSettingsFetch) {
                        return reject(new Error('Simulated network timeout fetching system_settings'));
                    }
                    return resolve({ data: isSingle ? structuredClone(dbState.settingsRow) : [structuredClone(dbState.settingsRow)], error: null });
                }
                if (table === 'attendance_logs') {
                    if (selectedCols.includes('personnel')) {
                        return resolve({ data: structuredClone(dbState.pendingSpecialRows), error: null });
                    }
                    return resolve({ data: [], error: null });
                }
                if (table === 'user_accounts') {
                    if (isSingle) {
                        return resolve({
                            data: {
                                id: 'admin-001',
                                personnel_id: null,
                                username: 'superadmin',
                                full_name: 'ผู้ดูแลระบบสูงสุด',
                                national_id: '1100100100101',
                                role: 'SuperAdmin',
                                visibility_level: 'all',
                                scope_bureau: 'สำนักเทศกิจ',
                                scope_division: '',
                                is_active: true,
                                personnel: null
                            },
                            error: null
                        });
                    }
                    return resolve({ data: structuredClone(dbState.pendingResetRows), error: null });
                }
                if (table === 'password_reset_requests') {
                    return resolve({ data: structuredClone(dbState.pendingResetRows), error: null });
                }
                return resolve({ data: isSingle ? null : [], error: null });
            } catch (err) {
                return reject(err);
            }
        }
    };
    return chain;
}

const mockSupabaseClient = {
    from(table) {
        return makeQueryChain(table);
    },
    channel(name) {
        const ch = {
            on(type, filter, cb) {
                if (type === 'postgres_changes' && filter?.table === 'system_settings') {
                    realtimeHandlers.postgresSystemSettings = cb;
                }
                if (type === 'broadcast' && name === 'bma_global_realtime_bus') {
                    realtimeHandlers.broadcastGlobal = cb;
                }
                return ch;
            },
            subscribe() { return ch; },
            async send() { return { status: 'ok' }; }
        };
        return ch;
    }
};

globalThis.window = {
    location: {
        origin: 'https://stb6636.github.io',
        pathname: '/CheckinApp/dashboard.html',
        href: 'https://stb6636.github.io/CheckinApp/dashboard.html',
        protocol: 'https:',
        replace() {}
    },
    history: globalThis.history,
    supabase: {
        createClient() { return mockSupabaseClient; }
    },
    CustomEvent: MockCustomEvent,
    addEventListener(type, fn) {
        if (!windowListeners.has(type)) windowListeners.set(type, []);
        windowListeners.get(type).push(fn);
    },
    removeEventListener(type, fn) {
        if (!windowListeners.has(type)) return;
        windowListeners.set(type, windowListeners.get(type).filter(f => f !== fn));
    },
    dispatchEvent(ev) {
        const list = windowListeners.get(ev.type) || [];
        for (const fn of list) fn(ev);
        return true;
    },
    __BMA_SPA_ROUTER_ACTIVE__: false
};

globalThis.document = {
    readyState: 'complete',
    documentElement: mockDocEl,
    head: mockHead,
    body: mockBody,
    title: 'CheckinApp',
    hidden: false,
    createElement(tag) { return createMockElement(tag); },
    getElementById(id) { return findByIdInTree(mockBody, id); },
    querySelector(sel) { return querySelectorAllInTree(mockBody, sel)[0] || null; },
    querySelectorAll(sel) { return querySelectorAllInTree(mockBody, sel); },
    addEventListener(type, fn) {
        if (!docListeners.has(type)) docListeners.set(type, []);
        docListeners.get(type).push(fn);
    },
    dispatchEvent(ev) {
        const list = docListeners.get(ev.type) || [];
        for (const fn of list) fn(ev);
    }
};

// Mount base admin shell containers into mockBody
function mountAdminDomContainers() {
    mockBody.innerHTML = '';
    const sidebarContainer = createMockElement('div', 'bmaSidebarContainer');
    const topbarContainer = createMockElement('div', 'bmaTopbarContainer');
    const mainEl = createMockElement('main', 'mainContent');
    const mobileNavContainer = createMockElement('div', 'bmaMobileBottomNav');
    const footerContainer = createMockElement('div', 'bmaFooterContainer');
    const modalsContainer = createMockElement('div', 'bmaPageModalsContainer');
    mockBody.appendChild(sidebarContainer);
    mockBody.appendChild(topbarContainer);
    mockBody.appendChild(mainEl);
    mockBody.appendChild(mobileNavContainer);
    mockBody.appendChild(footerContainer);
    mockBody.appendChild(modalsContainer);
}

mountAdminDomContainers();

// Import Real Modules
const { Config } = await import('../../assets/js/core/Config.js');
const { AuthService } = await import('../../assets/js/core/AuthService.js');
const { AppLayout } = await import('../../assets/js/components/AppLayout.js');
const { SettingsModel } = await import('../../assets/js/models/SettingsModel.js');
const { AttendanceModel } = await import('../../assets/js/models/AttendanceModel.js');

// Wrap AttendanceModel.getTodaySyncWatermark to count calls accurately
const origGetWatermark = AttendanceModel.getTodaySyncWatermark.bind(AttendanceModel);
AttendanceModel.getTodaySyncWatermark = async () => {
    dbState.watermarkCallCount++;
    return origGetWatermark();
};

// Seed SuperAdmin Session
AuthService.setCurrentUser({
    id: 'admin-001',
    username: 'superadmin',
    full_name: 'ผู้ดูแลระบบสูงสุด',
    role: 'SuperAdmin',
    visibility_level: 'all',
    scope_bureau: 'สำนักเทศกิจ'
}, 'admin');

console.log('\n=== QA Suite: Sidebar Active State & Realtime Settings Fix ===\n');

// ============================================================================
// 1. Mount Admin Layout on dashboard.html and navigate SPA across all 6 pages
// ============================================================================
await testAsync('1. Direct load dashboard.html -> SPA navigation across all 6 admin pages keeps Sidebar .active & badges synced', async () => {
    await AppLayout.initAdminLayout({
        activePage: 'dashboard',
        pageTitle: 'ภาพรวม'
    });

    await AppLayout.refreshNotificationBell(AuthService.getCurrentUser(false));

    let activeLink = document.querySelector('#bmaSidebarDrawer a.active');
    assert.strictEqual(activeLink?.dataset?.navId, 'dashboard', 'Initial active sidebar link should be dashboard');
    assert.strictEqual(document.getElementById('sidebarSpecialBadge')?.textContent, '2');
    assert.strictEqual(document.getElementById('sidebarSpecialBadge')?.classList.contains('hidden'), false);
    assert.strictEqual(document.getElementById('sidebarResetBadge')?.textContent, '1');
    assert.strictEqual(document.getElementById('sidebarResetBadge')?.classList.contains('hidden'), false);

    // Simulate SPA navigation to each admin page ending on settings.html
    const pages = [
        { activePage: 'reports', pageTitle: 'รายงานการลงเวลาปฏิบัติราชการ' },
        { activePage: 'approvals', pageTitle: 'อนุมัติลงเวลาปฏิบัติราชการกรณีพิเศษ' },
        { activePage: 'personnel', pageTitle: 'จัดการข้อมูลบุคลากร' },
        { activePage: 'users', pageTitle: 'จัดการบัญชีผู้ใช้งานและสิทธิ์การเข้าถึง' },
        { activePage: 'settings', pageTitle: 'ตั้งค่าระบบพื้นฐาน (สำหรับ SuperAdmin)' }
    ];

    for (const p of pages) {
        await AppLayout.initAdminLayout(p);
        activeLink = document.querySelector('#bmaSidebarDrawer a.active');
        assert.strictEqual(activeLink?.dataset?.navId, p.activePage, `SPA nav to ${p.activePage} must set a.active`);
        assert.ok(activeLink.className.includes('from-[#00744B]'), `SPA nav to ${p.activePage} must apply emerald gradient`);
        const allActive = document.querySelectorAll('#bmaSidebarDrawer a.active');
        assert.strictEqual(allActive.length, 1, 'Exactly one sidebar item should have .active');
    }
});

// ============================================================================
// 2. Save Tab 7 (Announcement) & Tabs 1-6 while on settings.html after SPA nav
// ============================================================================
await testAsync('2. Saving Tab 7 & Tabs 1-6 via SettingsModel.updateSettings preserves Sidebar .active on settings & badges & no circular watermark calls', async () => {
    const beforeWatermarks = dbState.watermarkCallCount;

    // Save Tab 7 announcement update
    const tab7Payload = {
        ...dbState.settingsRow,
        announcement_enabled: true,
        announcement_mode: 'text',
        announcement_title: 'ประกาศทดสอบระบบ v2.10',
        announcement_body: 'ข้อความทดสอบแท็บ 7',
        announcement_updated_at: '2026-11-17T09:05:00Z'
    };
    const saveTab7Res = await SettingsModel.updateSettings(tab7Payload);
    assert.strictEqual(saveTab7Res.success, true);

    // Verify Sidebar stayed on settings, kept .active + gradient, mobile nav stayed on settings, badges stayed visible
    const activeLinksTab7 = document.querySelectorAll('#bmaSidebarDrawer a.active');
    assert.strictEqual(activeLinksTab7.length, 1, 'Must keep exactly 1 .active link after Tab 7 save');
    assert.strictEqual(activeLinksTab7[0].dataset.navId, 'settings', 'Sidebar MUST stay on settings (not revert to dashboard)');
    assert.ok(activeLinksTab7[0].className.includes('from-[#00744B]'), 'Sidebar settings item must keep emerald gradient');

    const mobileSettingsLink = document.querySelector('#bmaMobileBottomNav a[data-nav-id="settings"]');
    assert.strictEqual(mobileSettingsLink?.classList.contains('bma-text-sub'), false, 'Mobile bottom nav settings must remain active');

    assert.strictEqual(document.getElementById('sidebarSpecialBadge')?.textContent, '2');
    assert.strictEqual(document.getElementById('sidebarSpecialBadge')?.classList.contains('hidden'), false);
    assert.strictEqual(document.getElementById('sidebarResetBadge')?.textContent, '1');
    assert.strictEqual(document.getElementById('sidebarResetBadge')?.classList.contains('hidden'), false);

    // Verify bma:settings-updated listener did NOT circularly trigger refreshNotificationBell/getTodaySyncWatermark
    assert.strictEqual(dbState.watermarkCallCount, beforeWatermarks, 'bma:settings-updated must NOT circularly call refreshNotificationBell()');

    // Save Tabs 1-6 update
    const tabs1to6Payload = {
        ...saveTab7Res.data,
        organization_name: 'กรุงเทพมหานคร (อัปเดต)',
        bureau_name: 'สำนักเทศกิจ (ทดสอบ)',
        footer_description: 'Footer ทดสอบ Tabs 1-6'
    };
    const saveTabs16Res = await SettingsModel.updateSettings(tabs1to6Payload);
    assert.strictEqual(saveTabs16Res.success, true);

    const activeAfter16 = document.querySelector('#bmaSidebarDrawer a.active');
    assert.strictEqual(activeAfter16?.dataset?.navId, 'settings', 'Sidebar MUST stay on settings after Tabs 1-6 save');
    assert.ok(!document.getElementById('bmaFooterContainer').innerHTML.includes('undefined'), 'Footer must never render undefined');
    assert.ok(document.getElementById('bmaFooterContainer').innerHTML.includes('กรุงเทพมหานคร (อัปเดต)'));
});

// ============================================================================
// 3. Watermark Poll Change (6-col settingsRow) hydrates normalized settings & keeps Sidebar on settings
// ============================================================================
await testAsync('3. Watermark poll change hydrates full normalized settings, avoids "undefined" org/footer, and runs watermark query once', async () => {
    dbState.settingsRow = {
        ...dbState.settingsRow,
        organization_name: 'กรุงเทพมหานคร (Watermark)',
        bureau_name: 'สำนักเทศกิจ (Watermark)',
        footer_description: 'Footer จาก DB เต็ม',
        updated_at: '2026-11-17T09:10:00Z'
    };

    const callsBefore = dbState.watermarkCallCount;
    await AppLayout.refreshNotificationBell(AuthService.getCurrentUser(false));
    assert.strictEqual(dbState.watermarkCallCount, callsBefore + 1, 'Watermark check must run exactly once without circular re-entry');

    const activeLink = document.querySelector('#bmaSidebarDrawer a.active');
    assert.strictEqual(activeLink?.dataset?.navId, 'settings', 'Sidebar must stay on settings after watermark sync');

    const sidebarHtml = document.getElementById('bmaSidebarContainer').innerHTML;
    const footerHtml = document.getElementById('bmaFooterContainer').innerHTML;
    assert.ok(!sidebarHtml.includes('undefined'), 'Sidebar must never contain "undefined"');
    assert.ok(!footerHtml.includes('undefined'), 'Footer must never contain "undefined"');
    assert.ok(footerHtml.includes('กรุงเทพมหานคร (Watermark)'), 'Footer must reflect hydrated organization_name');

    const cachedRaw = sessionStorage.getItem(Config.STORAGE_KEYS.CACHED_SETTINGS);
    assert.ok(cachedRaw, 'CACHED_SETTINGS should be populated with normalized settings');
    const cached = JSON.parse(cachedRaw);
    assert.strictEqual(typeof cached.announcement_enabled, 'boolean', 'CACHED_SETTINGS must remain normalized');
    assert.strictEqual(cached.organization_name, 'กรุงเทพมหานคร (Watermark)');
});

// ============================================================================
// 4. Realtime postgres_changes & broadcast handlers hydrate full settings & preserve Sidebar active
// ============================================================================
await testAsync('4. Realtime postgres_changes and broadcast hydrate full settings, keep CACHED_SETTINGS normalized, and preserve Sidebar active', async () => {
    assert.strictEqual(typeof realtimeHandlers.postgresSystemSettings, 'function', 'postgres_changes handler should be registered');
    assert.strictEqual(typeof realtimeHandlers.broadcastGlobal, 'function', 'broadcast handler should be registered');

    // Simulate postgres_changes with partial/raw record
    dbState.settingsRow = {
        ...dbState.settingsRow,
        organization_name: 'กรุงเทพมหานคร (PG)',
        bureau_name: 'สำนักเทศกิจ (PG)',
        footer_description: 'Footer จาก PG Realtime',
        updated_at: '2026-11-17T09:15:00Z'
    };
    await realtimeHandlers.postgresSystemSettings({
        eventType: 'UPDATE',
        new: { id: 1, updated_at: '2026-11-17T09:15:00Z', enforce_geofence_radius: false }
    });

    assert.strictEqual(document.querySelector('#bmaSidebarDrawer a.active')?.dataset?.navId, 'settings');
    assert.ok(document.getElementById('bmaFooterContainer').innerHTML.includes('กรุงเทพมหานคร (PG)'));
    const cachedAfterPg = JSON.parse(sessionStorage.getItem(Config.STORAGE_KEYS.CACHED_SETTINGS));
    assert.strictEqual(typeof cachedAfterPg.announcement_enabled, 'boolean', 'CACHED_SETTINGS after postgres_changes must be normalized');

    // Simulate broadcast 4-key payload
    dbState.settingsRow = {
        ...dbState.settingsRow,
        organization_name: 'กรุงเทพมหานคร (Broadcast)',
        bureau_name: 'สำนักเทศกิจ (Broadcast)',
        footer_description: 'Footer จาก Broadcast',
        updated_at: '2026-11-17T09:20:00Z'
    };
    await realtimeHandlers.broadcastGlobal({
        event: 'settings_updated',
        payload: { timestamp: Date.now(), updated_by: 'SuperAdmin', announcement_enabled: true, source: 'broadcast' }
    });

    assert.strictEqual(document.querySelector('#bmaSidebarDrawer a.active')?.dataset?.navId, 'settings');
    assert.ok(!document.getElementById('bmaSidebarContainer').innerHTML.includes('undefined'));
    assert.ok(!document.getElementById('bmaFooterContainer').innerHTML.includes('undefined'));
    assert.ok(document.getElementById('bmaFooterContainer').innerHTML.includes('กรุงเทพมหานคร (Broadcast)'));

    // Also test network failure fallback during broadcast: must NOT overwrite org/bureau/footer with "undefined"
    dbState.throwOnSettingsFetch = true;
    await realtimeHandlers.broadcastGlobal({
        event: 'settings_updated',
        payload: { timestamp: Date.now(), updated_by: 'SuperAdmin' }
    });
    dbState.throwOnSettingsFetch = false;

    assert.ok(!document.getElementById('bmaSidebarContainer').innerHTML.includes('undefined'), 'Network fallback must never render undefined in Sidebar');
    assert.ok(!document.getElementById('bmaFooterContainer').innerHTML.includes('undefined'), 'Network fallback must never render undefined in Footer');
    assert.strictEqual(document.querySelector('#bmaSidebarDrawer a.active')?.dataset?.navId, 'settings');
});

// ============================================================================
// 5. ApprovalsController direct-load vs SPA router guard
// ============================================================================
await testAsync('5. ApprovalsController sets __BMA_SPA_ROUTER_ACTIVE__ on direct load and prevents double-boot under SPA', async () => {
    window.__BMA_SPA_ROUTER_ACTIVE__ = false;
    let approvalInitCount = 0;
    const origInitLayout = AppLayout.initAdminLayout.bind(AppLayout);
    AppLayout.initAdminLayout = async (opts) => {
        if (opts?.activePage === 'approvals') approvalInitCount++;
        return origInitLayout(opts);
    };

    // First direct import when __BMA_SPA_ROUTER_ACTIVE__ === false
    await import(`../../assets/js/controllers/ApprovalsController.js?direct=${Date.now()}`);
    await new Promise(r => setTimeout(r, 30));
    assert.strictEqual(window.__BMA_SPA_ROUTER_ACTIVE__, true, 'Direct load of ApprovalsController must set __BMA_SPA_ROUTER_ACTIVE__ = true');
    assert.strictEqual(approvalInitCount, 1, 'Direct load must boot ApprovalsController exactly once');

    // Second import while __BMA_SPA_ROUTER_ACTIVE__ === true (simulates SPA nav or re-evaluation)
    await import(`../../assets/js/controllers/ApprovalsController.js?spa=${Date.now()}`);
    await new Promise(r => setTimeout(r, 30));
    assert.strictEqual(approvalInitCount, 1, 'Guard must prevent auto-instantiation when __BMA_SPA_ROUTER_ACTIVE__ is already true');

    AppLayout.initAdminLayout = origInitLayout;
});

// ============================================================================
// 6. SettingsController #bindEvents vs #renderAllSettings (no duplicate change listeners)
// ============================================================================
await testAsync('6. SettingsController binds filterRealtime & randomizeGps change listeners once in #bindEvents() without duplicating on repeated renders', async () => {
    // Mount minimal settings form DOM
    const mainEl = document.getElementById('mainContent');
    const settingsIds = [
        'setOrgName', 'setBureauName', 'setHeaderSystemTitle', 'setFooterDescInput',
        'setLogoUrlInput', 'setGDriveScriptUrl', 'setGDriveFolderId',
        'toggleRequirePhoto', 'toggleAllowGalleryFallback', 'toggleRequireGps', 'toggleEnforceGeofenceRadius',
        'toggleFilterShiftsByRealtime', 'setEarlyShiftWindowMinutes', 'containerEarlyShiftWindow',
        'toggleDisableNormalHoursCheckin', 'setRandomizeGpsRadius', 'toggleRandomizeGpsCheckout', 'containerRandomizeGpsRadius',
        'setAllowCheckinStartTime', 'setStdCheckIn', 'setStdCheckOut', 'setLateThresholdMin', 'setCheckoutGraceMin',
        'setColorNormal', 'setColorLate', 'setColorAbsentDuty', 'setColorNoCheckin', 'setColorOvertime', 'setColorGroupHeader',
        'setAnnouncementEnabled', 'setAnnouncementStartDate', 'setAnnouncementEndDate', 'setAnnouncementTitle',
        'setAnnouncementBody', 'setAnnouncementDriveFolderId', 'setAnnouncementImageUrl',
        'radioAnnouncementModeText', 'radioAnnouncementModeImage'
    ];
    mainEl.innerHTML = settingsIds.map(id => {
        if (id.startsWith('toggle') || id.startsWith('setAnnouncementEnabled') || id.startsWith('radio')) {
            return `<input id="${id}" type="checkbox" />`;
        }
        if (id.startsWith('container')) {
            return `<div id="${id}" class=""></div>`;
        }
        return `<input id="${id}" type="text" />`;
    }).join('') + '<button id="btnSaveMainSettings" type="button">บันทึก</button>';

    const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');
    const origAlert = UIHelpers.alert;
    UIHelpers.alert = async () => {};

    window.__BMA_SPA_ROUTER_ACTIVE__ = true;
    const { SettingsController } = await import('../../assets/js/controllers/SettingsController.js');

    // Instantiate via SPA (constructor triggers async init())
    const ctrl = new SettingsController();
    await new Promise(r => setTimeout(r, 40));

    const filterEl = document.getElementById('toggleFilterShiftsByRealtime');
    const randGpsEl = document.getElementById('toggleRandomizeGpsCheckout');
    const earlyContainer = document.getElementById('containerEarlyShiftWindow');
    const radiusContainer = document.getElementById('containerRandomizeGpsRadius');
    const saveBtn = document.getElementById('btnSaveMainSettings');

    assert.strictEqual(filterEl.listenerAddCounts['change'] || 0, 1, 'toggleFilterShiftsByRealtime must have exactly 1 change listener after init');
    assert.strictEqual(randGpsEl.listenerAddCounts['change'] || 0, 1, 'toggleRandomizeGpsCheckout must have exactly 1 change listener after init');

    // Trigger real save -> #persistSettings(true) -> #renderAllSettings() twice
    for (const fn of (saveBtn.listeners['click'] || [])) await fn({});
    for (const fn of (saveBtn.listeners['click'] || [])) await fn({});

    assert.strictEqual(filterEl.listenerAddCounts['change'], 1, 'Repeated saves/re-renders must NOT add duplicate change listeners to toggleFilterShiftsByRealtime');
    assert.strictEqual(randGpsEl.listenerAddCounts['change'], 1, 'Repeated saves/re-renders must NOT add duplicate change listeners to toggleRandomizeGpsCheckout');

    // Verify visibility sync works when toggling checkboxes
    filterEl.checked = false;
    filterEl.dispatchEvent({ type: 'change', target: filterEl });
    assert.strictEqual(earlyContainer.classList.contains('opacity-40'), true, 'Unchecking filterRealtime should dim early window container');
    assert.strictEqual(document.getElementById('setEarlyShiftWindowMinutes').disabled, true);

    randGpsEl.checked = true;
    randGpsEl.dispatchEvent({ type: 'change', target: randGpsEl });
    assert.strictEqual(radiusContainer.classList.contains('opacity-40'), false, 'Checking randomizeGps should enable radius container');
    assert.strictEqual(document.getElementById('setRandomizeGpsRadius').disabled, false);

    UIHelpers.alert = origAlert;
    assert.ok(ctrl);
});

// ============================================================================
// 7. Partial & explicit-undefined payload resilience on bma:settings-updated
// ============================================================================
await testAsync('7. bma:settings-updated with partial or explicit-undefined keys never overwrites Sidebar/Footer with "undefined"', async () => {
    await AppLayout.initAdminLayout({
        activePage: 'settings',
        pageTitle: 'ตั้งค่าระบบพื้นฐาน (สำหรับ SuperAdmin)'
    });

    window.dispatchEvent(new CustomEvent('bma:settings-updated', {
        detail: {
            organization_name: undefined,
            bureau_name: undefined,
            footer_description: undefined,
            announcement_enabled: true
        }
    }));

    const sidebarHtml = document.getElementById('bmaSidebarContainer').innerHTML;
    const footerHtml = document.getElementById('bmaFooterContainer').innerHTML;
    assert.ok(!sidebarHtml.includes('undefined'), 'Sidebar must never render "undefined" even on explicit undefined keys');
    assert.ok(!footerHtml.includes('undefined'), 'Footer must never render "undefined" even on explicit undefined keys');
    assert.strictEqual(document.querySelector('#bmaSidebarDrawer a.active')?.dataset?.navId, 'settings');
});

// ============================================================================
// 8. End-to-End AppLayout.navigateAjaxPage + real settings.html + SettingsController Tab 7 & Tabs 1-6 save + approvals->SPA single-boot
// ============================================================================
await testAsync('8. Full navigateAjaxPage(settings.html) -> SettingsController Tab 7 & Tabs 1-6 clicks keep Sidebar on settings & direct approvals.html -> SPA boots destination once', async () => {
    const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');
    const origAlert = UIHelpers.alert;
    UIHelpers.alert = async () => {};

    // Start on approvals.html via direct load (simulating approvals.html direct entry)
    window.__BMA_SPA_ROUTER_ACTIVE__ = false;
    await import(`../../assets/js/controllers/ApprovalsController.js?direct2=${Date.now()}`);
    await new Promise(r => setTimeout(r, 30));
    assert.strictEqual(window.__BMA_SPA_ROUTER_ACTIVE__, true);

    await AppLayout.initAdminLayout({
        activePage: 'approvals',
        pageTitle: 'อนุมัติลงเวลาปฏิบัติราชการกรณีพิเศษ'
    });
    sessionStorage.setItem(UIHelpers.VIEW_PAGE_STORAGE_KEY, 'approvals.html');
    await AppLayout.refreshNotificationBell(AuthService.getCurrentUser(false));

    // Mock fetch + DOMParser using the real settings.html file on disk
    const settingsHtmlPath = path.resolve(__dirname, '../../settings.html');
    const realSettingsHtml = fs.readFileSync(settingsHtmlPath, 'utf8');
    const origFetch = globalThis.fetch;
    const origDOMParser = globalThis.DOMParser;

    globalThis.DOMParser = class {
        parseFromString(html) {
            const sanitized = String(html || '')
                .replace(/<!DOCTYPE[^>]*>/gi, '')
                .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
            const docRoot = createMockElement('div', '__parsedDoc');
            docRoot.innerHTML = sanitized;
            const mainMatch = sanitized.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
            const parsedMain = docRoot.querySelector('main');
            if (parsedMain && mainMatch) {
                parsedMain._innerHTML = mainMatch[1];
            }
            return {
                querySelector(sel) { return docRoot.querySelector(sel); },
                querySelectorAll(sel) { return docRoot.querySelectorAll(sel); }
            };
        }
    };

    let midFetchDispatched = false;
    globalThis.fetch = async (url) => {
        assert.ok(String(url).includes('settings.html'), `Expected fetch for settings.html, got ${url}`);
        // Dispatch bma:settings-updated mid-SPA-transition before fetch resolves
        midFetchDispatched = true;
        window.dispatchEvent(new CustomEvent('bma:settings-updated', {
            detail: { announcement_enabled: true }
        }));
        return { ok: true, status: 200, text: async () => realSettingsHtml };
    };

    // Track how many times SettingsController initializes during navigateAjaxPage
    let settingsInitCount = 0;
    const origInitLayout = AppLayout.initAdminLayout.bind(AppLayout);
    AppLayout.initAdminLayout = async (opts) => {
        if (opts?.activePage === 'settings') settingsInitCount++;
        return origInitLayout(opts);
    };

    await AppLayout.navigateAjaxPage('settings.html', true);
    await new Promise(r => setTimeout(r, 50));

    assert.strictEqual(midFetchDispatched, true);
    assert.strictEqual(settingsInitCount, 1, 'SPA navigation from direct-loaded approvals.html must instantiate destination SettingsController exactly once');
    assert.strictEqual(document.querySelector('#bmaSidebarDrawer a.active')?.dataset?.navId, 'settings', 'Sidebar must be active on settings after navigateAjaxPage');

    // Now click real Tab 7 save button (#btnSaveAnnouncementSettings) & Tab 1 save button (#btnSaveMainSettings)
    const annTitleEl = document.getElementById('setAnnouncementTitle');
    const annBodyEl = document.getElementById('setAnnouncementBody');
    const annEnabledEl = document.getElementById('setAnnouncementEnabled');
    if (annEnabledEl) annEnabledEl.checked = true;
    if (annTitleEl) annTitleEl.value = 'ประกาศทดสอบ E2E SPA';
    if (annBodyEl) annBodyEl.value = '- ทดสอบกดปุ่มบันทึกแท็บ 7 จริง';

    const btnSaveTab7 = document.getElementById('btnSaveAnnouncementSettings');
    assert.ok(btnSaveTab7, 'settings.html Tab 7 save button must exist after navigateAjaxPage');
    for (const fn of (btnSaveTab7.listeners['click'] || [])) await fn({});

    assert.strictEqual(document.querySelector('#bmaSidebarDrawer a.active')?.dataset?.navId, 'settings', 'Sidebar MUST stay on settings after clicking #btnSaveAnnouncementSettings');
    assert.strictEqual(document.getElementById('sidebarSpecialBadge')?.textContent, '2');
    assert.strictEqual(document.getElementById('sidebarResetBadge')?.textContent, '1');

    const orgEl = document.getElementById('setOrgName');
    if (orgEl) orgEl.value = 'กรุงเทพมหานคร E2E';
    const btnSaveMain = document.getElementById('btnSaveMainSettings');
    assert.ok(btnSaveMain, 'settings.html Main save button must exist after navigateAjaxPage');
    for (const fn of (btnSaveMain.listeners['click'] || [])) await fn({});

    assert.strictEqual(document.querySelector('#bmaSidebarDrawer a.active')?.dataset?.navId, 'settings', 'Sidebar MUST stay on settings after clicking #btnSaveMainSettings');
    assert.ok(document.getElementById('bmaFooterContainer').innerHTML.includes('กรุงเทพมหานคร E2E'));

    AppLayout.initAdminLayout = origInitLayout;
    globalThis.fetch = origFetch;
    globalThis.DOMParser = origDOMParser;
    UIHelpers.alert = origAlert;
});

console.log(`\nSummary: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
