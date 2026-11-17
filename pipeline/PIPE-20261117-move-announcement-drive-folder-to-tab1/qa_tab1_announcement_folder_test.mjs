import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, '../..');

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
// Lightweight HTML-Parsing DOM + Browser Mock (supports real settings.html DOM)
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
    _tokens() { return String(this.el._className || '').split(/\s+/).filter(Boolean); }
    _save(tokens) { this.el._className = tokens.join(' '); }
    add(...cls) {
        const s = new Set(this._tokens());
        cls.forEach(c => { if (c) s.add(c); });
        this._save([...s]);
    }
    remove(...cls) {
        const rm = new Set(cls);
        this._save(this._tokens().filter(c => !rm.has(c)));
    }
    contains(c) { return this._tokens().includes(c); }
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
        attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
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
        if (!isSelfClosing) stack.push(child);
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
        for (const child of node.children) walk(child, nextAncestors);
    }

    for (const child of root.children) walk(child, [root]);
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
        files: [],
        focusedCount: 0,
        lastFocusOptions: null,
        scrollIntoViewCount: 0,
        clickCount: 0,
        children: [],
        attributes: {},
        dataset: {},
        style: {},
        listeners: {},
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
        remove() { if (this.parentNode) this.parentNode.removeChild(this); },
        addEventListener(ev, fn) { (this.listeners[ev] ||= []).push(fn); },
        removeEventListener(ev, fn) {
            if (!this.listeners[ev]) return;
            this.listeners[ev] = this.listeners[ev].filter(f => f !== fn);
        },
        async dispatchEventAsync(ev) {
            ev.target = ev.target || this;
            ev.preventDefault = ev.preventDefault || (() => {});
            let cur = this;
            while (cur) {
                const fns = cur.listeners?.[ev.type] || [];
                for (const fn of fns) {
                    await fn(ev);
                }
                cur = cur.parentNode;
            }
        },
        dispatchEvent(ev) {
            ev.target = ev.target || this;
            ev.preventDefault = ev.preventDefault || (() => {});
            let cur = this;
            while (cur) {
                const fns = cur.listeners?.[ev.type] || [];
                for (const fn of fns) fn(ev);
                cur = cur.parentNode;
            }
        },
        click() {
            this.clickCount++;
            this.dispatchEvent({ type: 'click', target: this });
        },
        focus(opts = undefined) { this.focusedCount++; this.lastFocusOptions = opts ?? null; },
        scrollIntoView() { this.scrollIntoViewCount++; },
        querySelector(sel) { return querySelectorAllInTree(this, sel)[0] || null; },
        querySelectorAll(sel) { return querySelectorAllInTree(this, sel); },
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

const dbState = {
    settingsRow: {
        id: 1,
        organization_name: 'กรุงเทพมหานคร',
        bureau_name: 'สำนักเทศกิจ',
        header_system_title: 'BMA e-Government Time Attendance System',
        logo_url: '',
        footer_description: 'ระบบลงเวลาทดสอบ',
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
        google_drive_script_url: 'https://script.google.com/macros/s/TEST_SCRIPT/exec',
        google_drive_folder_id: 'CHECKIN_FOLDER_001',
        announcement_enabled: true,
        announcement_mode: 'image',
        announcement_start_date: '2026-11-01',
        announcement_end_date: '2026-11-30',
        announcement_title: 'ประกาศทดสอบเดิม',
        announcement_body: '- รายละเอียดเดิม',
        announcement_image_url: 'https://lh3.googleusercontent.com/d/ORIGINAL_IMG_ID',
        announcement_drive_folder_id: 'ANN_FOLDER_INIT_001',
        announcement_updated_at: '2026-11-17T08:00:00.000Z',
        prefixes: ['นาย', 'นาง'],
        positions: [{ type: 'ประเภททั่วไป', title: 'เจ้าพนักงานเทศกิจ', level: 'ปฏิบัติงาน' }],
        affiliations: [{ organization: 'กรุงเทพมหานคร', bureau: 'สำนักเทศกิจ', division: 'สำนักงานเลขานุการ', group: 'กลุ่มงานการเจ้าหน้าที่' }],
        official_locations: [{ id: 'LOC-001', name: 'สำนักเทศกิจ', latitude: 13.756331, longitude: 100.501765, radius_meters: 150, is_active: true }],
        remarks: ['ประชุม'],
        offsite_job_types: ['ตรวจพื้นที่'],
        special_request_reasons: ['ลืมลงเวลา'],
        work_shifts: [{ name: 'เวลาราชการปกติ', check_in: '08:30', check_out: '16:30', is_custom: false, is_overtime: false, is_overnight: false, allow_early_checkin: false }],
        category_colors: { normal: '#007B3E', late: '#EAB308', absent_duty: '#EA580C', no_checkin: '#E11D48', overtime: '#2563EB', group_header: '#007B3E' },
        updated_at: '2026-11-17T08:00:00.000Z'
    },
    lastSavedUpdatePayload: null
};

function makeQueryChain(table) {
    let isSingle = false;
    const chain = {
        select() { return chain; },
        eq() { return chain; },
        neq() { return chain; },
        in() { return chain; },
        order() { return chain; },
        limit() { return chain; },
        maybeSingle() { isSingle = true; return chain; },
        single() { isSingle = true; return chain; },
        update(patch) {
            if (table === 'system_settings') {
                dbState.lastSavedUpdatePayload = structuredClone(patch);
                dbState.settingsRow = { ...dbState.settingsRow, ...patch, updated_at: new Date().toISOString() };
            }
            return chain;
        },
        upsert(patch) {
            if (table === 'system_settings') {
                dbState.lastSavedUpdatePayload = structuredClone(patch);
                dbState.settingsRow = { ...dbState.settingsRow, ...patch, updated_at: new Date().toISOString() };
            }
            return chain;
        },
        then(resolve) {
            if (table === 'system_settings') {
                return resolve({ data: isSingle ? structuredClone(dbState.settingsRow) : [structuredClone(dbState.settingsRow)], error: null });
            }
            if (table === 'user_accounts' && isSingle) {
                return resolve({
                    data: {
                        id: 'superadmin-1',
                        username: 'superadmin',
                        full_name: 'ผู้ดูแลระบบสูงสุด',
                        role: 'SuperAdmin',
                        is_active: true,
                        personnel: null
                    },
                    error: null
                });
            }
            return resolve({ data: isSingle ? null : [], error: null });
        }
    };
    return chain;
}

const mockSupabaseClient = {
    from(table) { return makeQueryChain(table); },
    channel() {
        const ch = { on() { return ch; }, subscribe() { return ch; }, async send() { return { status: 'ok' }; } };
        return ch;
    }
};

globalThis.localStorage = mockLocalStorage;
globalThis.sessionStorage = mockSessionStorage;
globalThis.CustomEvent = class { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } };
globalThis.history = { pushState() {}, replaceState() {} };
globalThis.window = {
    location: { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/settings.html', href: 'https://stb6636.github.io/CheckinApp/settings.html', protocol: 'https:', replace() {} },
    history: globalThis.history,
    supabase: { createClient() { return mockSupabaseClient; } },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {},
    __BMA_SPA_ROUTER_ACTIVE__: true
};
globalThis.document = {
    head: mockHead,
    body: mockBody,
    documentElement: mockDocEl,
    createElement(tag) { return createMockElement(tag); },
    getElementById(id) { return findByIdInTree(mockDocEl, id); },
    getElementsByTagName() { return [mockHead]; },
    querySelector(sel) { return querySelectorAllInTree(mockDocEl, sel)[0] || null; },
    querySelectorAll(sel) { return querySelectorAllInTree(mockDocEl, sel); },
    addEventListener() {},
    removeEventListener() {}
};

// Import real project modules
const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');
const { AppLayout } = await import('../../assets/js/components/AppLayout.js');
const { SettingsModel } = await import('../../assets/js/models/SettingsModel.js');
const { SystemUpdateModal } = await import('../../assets/js/components/SystemUpdateModal.js');
const { SettingsController } = await import('../../assets/js/controllers/SettingsController.js');

const settingsHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'settings.html'), 'utf8');
const manualSuperHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'docs/manual/manual-superadmin.html'), 'utf8');
const versionJson = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'version.json'), 'utf8'));

console.log('====================================================================');
console.log('QA VERIFICATION: PIPE-20261117-move-announcement-drive-folder-to-tab1');
console.log('====================================================================\n');

// -------------------------------------------------------------------------
// 1. Static HTML Structure & Manual Consistency Checks
// -------------------------------------------------------------------------
console.log('--- 1. settings.html DOM Placement & Manual Consistency ---');

test('settings.html places #setAnnouncementDriveFolderId, #announcementFolderVerifyBadge, and #btnVerifyAnnouncementFolder uniquely inside Tab 1 Left Card', () => {
    const countMatches = (id) => (settingsHtml.match(new RegExp(`id="${id}"`, 'g')) || []).length;
    assert.strictEqual(countMatches('setAnnouncementDriveFolderId'), 1, 'Must have exactly one #setAnnouncementDriveFolderId');
    assert.strictEqual(countMatches('announcementFolderVerifyBadge'), 1, 'Must have exactly one #announcementFolderVerifyBadge');
    assert.strictEqual(countMatches('btnVerifyAnnouncementFolder'), 1, 'Must have exactly one #btnVerifyAnnouncementFolder');
    assert.strictEqual(countMatches('tab7AnnouncementFolderHint'), 1, 'Must have exactly one #tab7AnnouncementFolderHint');

    const tab1Start = settingsHtml.indexOf('id="tab-panel-general"');
    const rightCardStart = settingsHtml.indexOf('การควบคุมฟังก์ชันลงเวลา', tab1Start);
    const tab7Start = settingsHtml.indexOf('id="tab-panel-announcement"');
    assert(tab1Start > 0 && rightCardStart > tab1Start && tab7Start > rightCardStart);

    const tab1LeftCard = settingsHtml.slice(tab1Start, rightCardStart);
    const tab7Section = settingsHtml.slice(tab7Start);

    assert(tab1LeftCard.includes('ข้อมูลหน่วยงาน และข้อความระบบ'), 'Tab 1 Left Card heading must exist');
    assert(tab1LeftCard.includes('id="setGDriveScriptUrl"'));
    assert(tab1LeftCard.includes('id="setGDriveFolderId"'));
    assert(tab1LeftCard.includes('id="btnVerifyGDrive"'));
    assert(tab1LeftCard.includes('id="setAnnouncementDriveFolderId"'));
    assert(tab1LeftCard.includes('id="announcementFolderVerifyBadge"'));
    assert(tab1LeftCard.includes('id="btnVerifyAnnouncementFolder"'));
    assert(tab1LeftCard.indexOf('id="btnVerifyGDrive"') < tab1LeftCard.indexOf('id="setAnnouncementDriveFolderId"'), 'Announcement folder must be directly under #btnVerifyGDrive');

    assert(!tab7Section.includes('id="setAnnouncementDriveFolderId"'), 'Tab 7 must NOT have #setAnnouncementDriveFolderId');
    assert(!tab7Section.includes('id="announcementFolderVerifyBadge"'), 'Tab 7 must NOT have #announcementFolderVerifyBadge');
    assert(!tab7Section.includes('id="btnVerifyAnnouncementFolder"'), 'Tab 7 must NOT have #btnVerifyAnnouncementFolder');
    assert(tab7Section.includes('id="tab7AnnouncementFolderHint"'), 'Tab 7 must display #tab7AnnouncementFolderHint');
    assert(tab7Section.includes('data-jump-tab="tab-panel-general"'), 'Tab 7 must include quick-jump button to Tab 1');
});

test('docs/manual/manual-superadmin.html updates Tab 1/Tab 7 guides without duplicating moved Drive DOM IDs', () => {
    for (const forbiddenId of [
        'id="setAnnouncementDriveFolderId"',
        'id="announcementFolderVerifyBadge"',
        'id="btnVerifyAnnouncementFolder"',
        'id="tab7AnnouncementFolderHint"',
        'id="setGDriveScriptUrl"',
        'id="setGDriveFolderId"'
    ]) {
        assert(!manualSuperHtml.includes(forbiddenId), `manual-superadmin.html must NOT duplicate real DOM ${forbiddenId}`);
    }
    assert(manualSuperHtml.includes('เก็บรูปประกาศ'), 'Manual should describe announcement Drive folder');
    assert(manualSuperHtml.includes('ไปตั้งค่าในแท็บ 1'), 'Manual Tab 7 simulator should reference Tab 1 shortcut');
});

// -------------------------------------------------------------------------
// 2. Runtime SettingsController Integration with Real settings.html <main>
// -------------------------------------------------------------------------
console.log('\n--- 2. Real SettingsController Runtime Behavior & Edge Cases ---');

// Extract <main>...</main> + modals from settings.html into mockBody
const mainStart = settingsHtml.indexOf('<main');
const footerStart = settingsHtml.indexOf('<div id="bmaFooterContainer"></div>');
const modalsStart = settingsHtml.indexOf('<div id="modalSettingsItem"');
const scriptsStart = settingsHtml.indexOf('<script type="module"');
assert(mainStart >= 0 && footerStart > mainStart && modalsStart > footerStart && scriptsStart > modalsStart, 'settings.html DOM slice boundaries must be valid');
const mainAndModalsHtml = settingsHtml.slice(mainStart, footerStart) + settingsHtml.slice(modalsStart, scriptsStart);

const origInitAdminLayout = AppLayout.initAdminLayout;
const origFileToDataUrl = SettingsModel.fileToDataUrl;
const origShowLoading = UIHelpers.showLoading;
const origHideLoading = UIHelpers.hideLoading;
const origShowToast = UIHelpers.showToast;
const origAlert = UIHelpers.alert;
const origFetch = globalThis.fetch;

const alertsCaptured = [];
UIHelpers.showLoading = () => {};
UIHelpers.hideLoading = () => {};
UIHelpers.showToast = async () => {};
UIHelpers.alert = async (title, text, icon) => {
    alertsCaptured.push({ title, text, icon });
};
AppLayout.initAdminLayout = async () => ({
    currentUser: { id: 'superadmin-1', username: 'superadmin', role: 'SuperAdmin', full_name: 'ผู้ดูแลระบบสูงสุด' },
    settings: structuredClone(dbState.settingsRow)
});

function mountRealSettingsDom() {
    mockBody.innerHTML = mainAndModalsHtml;
    mockSessionStorage.clear();
    mockLocalStorage.clear();
    alertsCaptured.length = 0;
    dbState.lastSavedUpdatePayload = null;
}

await testAsync('A. Initial render populates Tab 1 #setAnnouncementDriveFolderId, #announcementFolderVerifyBadge, and Tab 7 #tab7AnnouncementFolderHint', async () => {
    mountRealSettingsDom();
    const ctrl = new SettingsController();
    await new Promise(r => setTimeout(r, 40));

    assert.strictEqual(document.getElementById('setAnnouncementDriveFolderId').value, 'ANN_FOLDER_INIT_001');
    assert.strictEqual(document.getElementById('announcementFolderVerifyBadge').textContent, 'ระบุโฟลเดอร์แล้ว');
    const hintHtml = document.getElementById('tab7AnnouncementFolderHint').innerHTML;
    assert(hintHtml.includes('ANN_FOLDER_INIT_001'), 'Tab 7 hint should reflect saved folder ID');
    assert(hintHtml.includes('แท็บ 1'), 'Tab 7 hint should reference Tab 1');
    assert.ok(ctrl);
});

await testAsync('B. Saving Tab 1 (#btnSaveMainSettings) persists new announcement_drive_folder_id WITHOUT mutating 8 popup keys or announcement_updated_at & keeps token identical', async () => {
    mountRealSettingsDom();
    const beforeToken = SystemUpdateModal.getAnnouncementToken(dbState.settingsRow);
    const ctrl = new SettingsController();
    await new Promise(r => setTimeout(r, 40));

    const annFolderInput = document.getElementById('setAnnouncementDriveFolderId');
    annFolderInput.value = '  NEW_TAB1_ANN_FOLDER_777  ';
    await document.getElementById('btnSaveMainSettings').dispatchEventAsync({ type: 'click' });

    assert.ok(dbState.lastSavedUpdatePayload, 'updateSettings must have executed');
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_drive_folder_id, 'NEW_TAB1_ANN_FOLDER_777');
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_enabled, true);
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_mode, 'image');
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_start_date, '2026-11-01');
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_end_date, '2026-11-30');
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_title, 'ประกาศทดสอบเดิม');
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_body, '- รายละเอียดเดิม');
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_image_url, 'https://lh3.googleusercontent.com/d/ORIGINAL_IMG_ID');
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_updated_at, '2026-11-17T08:00:00.000Z');

    const afterToken = SystemUpdateModal.getAnnouncementToken(dbState.settingsRow);
    assert.strictEqual(afterToken, beforeToken, 'Announcement dismissal token MUST NOT change when saving Tab 1 Drive folder');
    assert(document.getElementById('tab7AnnouncementFolderHint').innerHTML.includes('NEW_TAB1_ANN_FOLDER_777'));
    assert.ok(ctrl);
});

await testAsync('C. #btnVerifyAnnouncementFolder validates empty Script URL ("ด้านบน"), empty folder, success/fail badge + Tab 7 hint refresh, and live XSS-escaped input sync', async () => {
    mountRealSettingsDom();
    dbState.settingsRow.announcement_drive_folder_id = 'ANN_FOLDER_VERIFY_OK';
    const ctrl = new SettingsController();
    await new Promise(r => setTimeout(r, 40));

    const scriptInput = document.getElementById('setGDriveScriptUrl');
    const folderInput = document.getElementById('setAnnouncementDriveFolderId');
    const verifyBtn = document.getElementById('btnVerifyAnnouncementFolder');
    const badge = document.getElementById('announcementFolderVerifyBadge');
    const hintEl = document.getElementById('tab7AnnouncementFolderHint');

    // 1. Missing Script URL
    scriptInput.value = '';
    scriptInput.dispatchEvent({ type: 'input' });
    assert(hintEl.innerHTML.includes('ยังไม่ได้ระบุ Google Apps Script Web App URL'));
    let fetchCalls = 0;
    globalThis.fetch = async () => { fetchCalls++; return { json: async () => ({}) }; };
    await verifyBtn.dispatchEventAsync({ type: 'click' });
    assert.strictEqual(fetchCalls, 0);
    assert(alertsCaptured.at(-1).text.includes('ด้านบน'), 'Alert when scriptUrl missing should direct admin to input above');

    // 2. Empty folderId
    scriptInput.value = 'https://script.google.com/macros/s/TEST_SCRIPT/exec';
    folderInput.value = '   ';
    folderInput.dispatchEvent({ type: 'input' });
    assert.strictEqual(badge.textContent, 'รอระบุโฟลเดอร์');
    await verifyBtn.dispatchEventAsync({ type: 'click' });
    assert.strictEqual(fetchCalls, 0);
    assert.strictEqual(alertsCaptured.at(-1).title, 'กรุณาระบุโฟลเดอร์ประกาศ');

    // 3. Valid verification success
    folderInput.value = 'ANN_FOLDER_VERIFY_OK';
    globalThis.fetch = async () => {
        fetchCalls++;
        return { json: async () => ({ success: true, folderName: 'PosterImages', message: 'เชื่อมต่อโฟลเดอร์ PosterImages สำเร็จ' }) };
    };
    await verifyBtn.dispatchEventAsync({ type: 'click' });
    assert.strictEqual(fetchCalls, 1);
    assert.strictEqual(badge.textContent, '✓ PosterImages');
    assert(hintEl.innerHTML.includes('PosterImages'), 'Tab 7 hint must update after verification success');

    // 4. Failed verification
    globalThis.fetch = async () => ({ json: async () => ({ success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }) });
    await verifyBtn.dispatchEventAsync({ type: 'click' });
    assert.strictEqual(badge.textContent, '✗ โฟลเดอร์ไม่ถูกต้อง');
    assert(hintEl.innerHTML.includes('ตรวจสอบโฟลเดอร์รูปประกาศไม่ผ่าน'));

    // 5. XSS safety on live input
    folderInput.value = '<img src=x onerror=alert(1)>';
    folderInput.dispatchEvent({ type: 'input' });
    assert(!hintEl.innerHTML.includes('<img'), 'HTML in folderId must be escaped in Tab 7 hint');
    assert(hintEl.innerHTML.includes('&lt;img'), 'Escaped folderId must render safely');
    assert.ok(ctrl);
});

await testAsync('D. Tab 7 quick-jump [data-jump-tab="tab-panel-general"] switches back to Tab 1 and focuses #setAnnouncementDriveFolderId; upload guards guide to Tab 1', async () => {
    mountRealSettingsDom();
    const ctrl = new SettingsController();
    await new Promise(r => setTimeout(r, 40));

    // Switch to Tab 7 via Tab button
    const tab7Btn = document.querySelector('#settingsTabNav .settings-tab-btn[data-tab-target="tab-panel-announcement"]');
    tab7Btn.click();
    assert.strictEqual(document.getElementById('tab-panel-general').classList.contains('hidden'), true);
    assert.strictEqual(document.getElementById('tab-panel-announcement').classList.contains('hidden'), false);

    // Click jump-to-Tab-1 button inside Tab 7
    const jumpBtn = document.querySelector('[data-jump-tab="tab-panel-general"]');
    const annInput = document.getElementById('setAnnouncementDriveFolderId');
    const focusBefore = annInput.focusedCount;
    const scrollBefore = annInput.scrollIntoViewCount;
    jumpBtn.click();

    assert.strictEqual(document.getElementById('tab-panel-general').classList.contains('hidden'), false, 'Tab 1 panel must become visible');
    assert.strictEqual(document.getElementById('tab-panel-announcement').classList.contains('hidden'), true, 'Tab 7 panel must become hidden');
    assert(annInput.focusedCount > focusBefore, '#setAnnouncementDriveFolderId should receive focus');
    assert.deepStrictEqual(annInput.lastFocusOptions, { preventScroll: true }, 'focus() must pass { preventScroll: true } to avoid cancelling smooth scroll');
    assert(annInput.scrollIntoViewCount > scrollBefore, '#setAnnouncementDriveFolderId should scroll into view');

    // Test upload file guard when folderId is empty -> alert tells admin to set in Tab 1
    annInput.value = '';
    const fileInput = document.getElementById('setAnnouncementImageFile');
    fileInput.files = [{ type: 'image/png', size: 1024, name: 'poster.png' }];
    await fileInput.dispatchEventAsync({ type: 'change', target: fileInput });
    assert(alertsCaptured.at(-1).text.includes('แท็บ 1'), 'Upload missing-folder alert must direct user to Tab 1');

    // Test strictFolder error in UIHelpers.uploadPhotoToGoogleDrive
    let strictErr = null;
    try {
        await UIHelpers.uploadPhotoToGoogleDrive(
            'data:image/png;base64,iVBORw0KGgo=',
            'Announcement',
            { google_drive_script_url: 'https://script.google.com/macros/s/TEST_SCRIPT/exec', google_drive_folder_id: 'CHECKIN_ONLY' },
            { folderId: '', strictFolder: true }
        );
    } catch (err) {
        strictErr = err;
    }
    assert.ok(strictErr && strictErr.message.includes('แท็บ 1'), 'UIHelpers strictFolder empty error must mention Tab 1');
    assert.ok(ctrl);
});

await testAsync('E. Partial DOM resilience: #renderAllSettings and #readAnnouncementFormDraft fallback work even when Tab 7 or Tab 1 nodes are absent', async () => {
    // Only Tab 1 Drive node, no #setAnnouncementEnabled -> #renderAllSettings must still populate Tab 1 folder & badge
    mockSessionStorage.clear();
    mockLocalStorage.clear();
    mockBody.innerHTML = `
        <main>
            <input id="setOrgName" /><input id="setBureauName" /><input id="setHeaderSystemTitle" />
            <input id="setFooterDescInput" /><input id="setLogoUrlInput" />
            <input id="setGDriveScriptUrl" /><input id="setGDriveFolderId" />
            <input id="setAnnouncementDriveFolderId" />
            <span id="announcementFolderVerifyBadge"></span>
            <input id="toggleRequirePhoto" type="checkbox" /><input id="toggleRequireGps" type="checkbox" />
            <input id="setStdCheckIn" /><input id="setStdCheckOut" /><input id="setLateThresholdMin" />
            <input id="setColorNormal" /><input id="setColorLate" /><input id="setColorAbsentDuty" />
            <input id="setColorNoCheckin" /><input id="setColorOvertime" /><input id="setColorGroupHeader" />
            <div id="tab7AnnouncementFolderHint"></div>
        </main>
    `;
    dbState.settingsRow.announcement_drive_folder_id = 'PARTIAL_DOM_FOLDER';
    const ctrl = new SettingsController();
    await new Promise(r => setTimeout(r, 40));

    assert.strictEqual(document.getElementById('setAnnouncementDriveFolderId').value, 'PARTIAL_DOM_FOLDER');
    assert.strictEqual(document.getElementById('announcementFolderVerifyBadge').textContent, 'ระบุโฟลเดอร์แล้ว');
    assert(document.getElementById('tab7AnnouncementFolderHint').innerHTML.includes('PARTIAL_DOM_FOLDER'));

    // Now test Tab 7 Save when #setAnnouncementDriveFolderId is absent in partial DOM -> preserves saved folder ID
    mockSessionStorage.clear();
    mockLocalStorage.clear();
    mockBody.innerHTML = `
        <main>
            <input id="setOrgName" /><input id="setBureauName" /><input id="setHeaderSystemTitle" />
            <input id="setFooterDescInput" /><input id="setLogoUrlInput" />
            <input id="setGDriveScriptUrl" /><input id="setGDriveFolderId" />
            <input id="toggleRequirePhoto" type="checkbox" /><input id="toggleRequireGps" type="checkbox" />
            <input id="setStdCheckIn" /><input id="setStdCheckOut" /><input id="setLateThresholdMin" />
            <input id="setColorNormal" /><input id="setColorLate" /><input id="setColorAbsentDuty" />
            <input id="setColorNoCheckin" /><input id="setColorOvertime" /><input id="setColorGroupHeader" />
            <input id="setAnnouncementEnabled" type="checkbox" />
            <input id="radioAnnouncementModeText" type="radio" />
            <input id="radioAnnouncementModeImage" type="radio" />
            <input id="setAnnouncementStartDate" /><input id="setAnnouncementEndDate" />
            <input id="setAnnouncementTitle" /><textarea id="setAnnouncementBody"></textarea>
            <input id="setAnnouncementImageUrl" />
            <button id="btnSaveAnnouncementSettings" type="button">บันทึก</button>
        </main>
    `;
    dbState.settingsRow.announcement_drive_folder_id = 'PRESERVED_WHEN_NODE_MISSING';
    dbState.lastSavedUpdatePayload = null;
    const ctrl2 = new SettingsController();
    await new Promise(r => setTimeout(r, 40));
    await document.getElementById('btnSaveAnnouncementSettings').dispatchEventAsync({ type: 'click' });
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_drive_folder_id, 'PRESERVED_WHEN_NODE_MISSING');

    // Now test when #setAnnouncementDriveFolderId IS present and explicitly cleared -> clears announcement_drive_folder_id
    mountRealSettingsDom();
    dbState.settingsRow.announcement_drive_folder_id = 'BEFORE_CLEAR';
    const ctrl3 = new SettingsController();
    await new Promise(r => setTimeout(r, 40));
    document.getElementById('setAnnouncementDriveFolderId').value = '   ';
    await document.getElementById('btnSaveAnnouncementSettings').dispatchEventAsync({ type: 'click' });
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_drive_folder_id, '');
    assert.ok(ctrl);
    assert.ok(ctrl2);
    assert.ok(ctrl3);
});

await testAsync('F. Edge cases: non-/exec Script URL guards, Tab 1 clear+save, Tab 2 save isolation, and Tab 7 upload using Tab 1 folder', async () => {
    mountRealSettingsDom();
    dbState.settingsRow.announcement_drive_folder_id = 'INIT_BEFORE_EDGE_TESTS';
    dbState.settingsRow.announcement_updated_at = '2026-11-17T08:00:00.000Z';
    const beforeToken = SystemUpdateModal.getAnnouncementToken(dbState.settingsRow);
    const ctrl = new SettingsController();
    await new Promise(r => setTimeout(r, 40));

    const scriptInput = document.getElementById('setGDriveScriptUrl');
    const folderInput = document.getElementById('setAnnouncementDriveFolderId');
    const verifyBtn = document.getElementById('btnVerifyAnnouncementFolder');
    const badge = document.getElementById('announcementFolderVerifyBadge');
    const hintEl = document.getElementById('tab7AnnouncementFolderHint');
    const fileInput = document.getElementById('setAnnouncementImageFile');

    // 1. Non-/exec script.google.com URL must be flagged in Tab 7 hint and blocked before verify/upload
    scriptInput.value = 'https://script.google.com/macros/s/TEST_SCRIPT/dev';
    scriptInput.dispatchEvent({ type: 'input' });
    assert(hintEl.innerHTML.includes('ยังไม่ได้ระบุ Google Apps Script Web App URL'), 'Non-/exec URL must warn in Tab 7 hint');

    let fetchCalls = 0;
    globalThis.fetch = async () => { fetchCalls++; return { json: async () => ({ success: true }) }; };
    await verifyBtn.dispatchEventAsync({ type: 'click' });
    assert.strictEqual(fetchCalls, 0, 'Verify must block non-/exec URL before fetching');
    assert(alertsCaptured.at(-1).text.includes('ด้านบน'), 'Tab 1 verify alert for non-/exec URL must point to field above');
    assert.notStrictEqual(badge.textContent, '✗ โฟลเดอร์ไม่ถูกต้อง', 'Missing /exec must not falsely mark folder badge invalid');

    fileInput.files = [{ type: 'image/png', size: 1024, name: 'poster.png' }];
    await fileInput.dispatchEventAsync({ type: 'change', target: fileInput });
    assert.strictEqual(fetchCalls, 0, 'Upload must block non-/exec URL before fetching');
    assert(alertsCaptured.at(-1).text.includes('แท็บ 1'), 'Upload alert for non-/exec URL must guide to Tab 1');

    let nonExecStrictErr = null;
    try {
        await UIHelpers.uploadPhotoToGoogleDrive(
            'data:image/png;base64,iVBORw0KGgo=',
            'Announcement',
            { google_drive_script_url: 'https://script.google.com/macros/s/TEST_SCRIPT/dev' },
            { folderId: 'FOLDER_ABC', strictFolder: true }
        );
    } catch (err) {
        nonExecStrictErr = err;
    }
    assert.ok(nonExecStrictErr && nonExecStrictErr.message.includes('.../exec'), 'UIHelpers strictFolder must require .../exec');

    // 2. Clearing announcement folder in Tab 1 and clicking #btnSaveMainSettings persists '' without mutating 8 popup keys
    scriptInput.value = 'https://script.google.com/macros/s/TEST_SCRIPT/exec';
    folderInput.value = '   ';
    await document.getElementById('btnSaveMainSettings').dispatchEventAsync({ type: 'click' });
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_drive_folder_id, '');
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_updated_at, '2026-11-17T08:00:00.000Z');
    assert.strictEqual(SystemUpdateModal.getAnnouncementToken(dbState.settingsRow), beforeToken);

    // 3. Editing announcement folder in Tab 1 and clicking Tab 2 #btnSaveStatusAndColors persists folder without mutating 8 popup keys
    folderInput.value = 'TAB2_SAVE_PRESERVES_FOLDER';
    await document.getElementById('btnSaveStatusAndColors').dispatchEventAsync({ type: 'click' });
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_drive_folder_id, 'TAB2_SAVE_PRESERVES_FOLDER');
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_updated_at, '2026-11-17T08:00:00.000Z');
    assert.strictEqual(SystemUpdateModal.getAnnouncementToken(dbState.settingsRow), beforeToken);

    // 4. Editing announcement folder in Tab 1 (unsaved) + uploading image in Tab 7 uses Tab 1's folderId strictly, then Tab 7 Save persists both
    folderInput.value = 'TAB1_UNSAVED_UPLOAD_FOLDER';
    let uploadReqBody = null;
    SettingsModel.fileToDataUrl = async () => 'data:image/png;base64,iVBORw0KGgo=';
    globalThis.fetch = async (_url, opts) => {
        fetchCalls++;
        uploadReqBody = JSON.parse(opts.body);
        return { json: async () => ({ success: true, url: 'https://lh3.googleusercontent.com/d/UPLOADED_POSTER_999' }) };
    };
    fileInput.files = [{ type: 'image/png', size: 2048, name: 'poster.png' }];
    await fileInput.dispatchEventAsync({ type: 'change', target: fileInput });
    assert.strictEqual(fetchCalls, 1);
    assert.strictEqual(uploadReqBody.folderId, 'TAB1_UNSAVED_UPLOAD_FOLDER');
    assert.strictEqual(uploadReqBody.strictFolder, true);
    assert.strictEqual(document.getElementById('setAnnouncementImageUrl').value, 'https://lh3.googleusercontent.com/d/UPLOADED_POSTER_999');

    await document.getElementById('btnSaveAnnouncementSettings').dispatchEventAsync({ type: 'click' });
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_drive_folder_id, 'TAB1_UNSAVED_UPLOAD_FOLDER');
    assert.strictEqual(dbState.lastSavedUpdatePayload.announcement_image_url, 'https://lh3.googleusercontent.com/d/UPLOADED_POSTER_999');
    assert.ok(ctrl);
});

// -------------------------------------------------------------------------
// 3. Cache Version Sync Across 9 Root HTML Pages
// -------------------------------------------------------------------------
console.log('\n--- 3. Mandatory Cache Version Sync Verification ---');

const ALL_9_HTML = [
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

test('version.json buildId matches CURRENT_APP_BUILD and asset ?v=<buildId> across all 9 HTML pages', () => {
    assert.ok(versionJson.buildId && versionJson.buildId.length >= 8, 'version.json must have buildId');
    for (const file of ALL_9_HTML) {
        const html = fs.readFileSync(path.join(WORKSPACE_ROOT, file), 'utf8');
        assert(html.includes(`CURRENT_APP_BUILD = '${versionJson.buildId}'`), `${file} CURRENT_APP_BUILD mismatch`);
        const assetRefs = html.match(/(?:href|src)="assets\/[^"]+"/g) || [];
        assert(assetRefs.length > 0, `${file} must have asset references`);
        for (const ref of assetRefs) {
            assert(ref.includes(`?v=${versionJson.buildId}`), `${file} asset ${ref} missing ?v=${versionJson.buildId}`);
        }
    }
});

// Restore mocks
AppLayout.initAdminLayout = origInitAdminLayout;
SettingsModel.fileToDataUrl = origFileToDataUrl;
UIHelpers.showLoading = origShowLoading;
UIHelpers.hideLoading = origHideLoading;
UIHelpers.showToast = origShowToast;
UIHelpers.alert = origAlert;
globalThis.fetch = origFetch;

console.log(`\n====================================================================`);
console.log(`QA TAB1 ANNOUNCEMENT FOLDER RESULTS: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log(`====================================================================`);

if (failed > 0) process.exit(1);
