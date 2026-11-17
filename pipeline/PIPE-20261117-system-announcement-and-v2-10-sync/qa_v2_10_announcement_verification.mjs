import fs from 'fs';
import path from 'path';
import assert from 'assert';
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
        console.error(`  [FAIL] ${name}\n         -> ${err.message}`);
        failed++;
    }
}

async function testAsync(name, fn) {
    try {
        await fn();
        console.log(`  [PASS] ${name}`);
        passed++;
    } catch (err) {
        console.error(`  [FAIL] ${name}\n         -> ${err.message}`);
        failed++;
    }
}

// =========================================================================
// Minimal Browser Environment Mock for Real ES Module Imports
// =========================================================================
class MockStorage {
    constructor() { this.map = new Map(); }
    getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
    setItem(k, v) { this.map.set(k, String(v)); }
    removeItem(k) { this.map.delete(k); }
    clear() { this.map.clear(); }
}

function createMockElement(tag = 'div', id = '') {
    const el = {
        tagName: tag.toUpperCase(),
        id,
        className: '',
        innerHTML: '',
        textContent: '',
        children: [],
        attributes: {},
        style: {},
        listeners: {},
        parentNode: null,
        classList: {
            set: new Set(),
            add(...c) { c.forEach(x => this.set.add(x)); },
            remove(...c) { c.forEach(x => this.set.delete(x)); },
            contains(c) { return this.set.has(c); },
            toggle(c, f) { if (f === undefined) { if (this.set.has(c)) this.set.delete(c); else this.set.add(c); } else if (f) this.set.add(c); else this.set.delete(c); }
        },
        setAttribute(k, v) { this.attributes[k] = String(v); },
        getAttribute(k) { return this.attributes[k] || null; },
        appendChild(child) { child.parentNode = this; this.children.push(child); return child; },
        removeChild(child) {
            this.children = this.children.filter(c => c !== child);
            child.parentNode = null;
        },
        addEventListener(ev, fn) { (this.listeners[ev] ||= []).push(fn); },
        querySelector(sel) {
            if (sel.startsWith('#')) {
                const targetId = sel.slice(1);
                const m = this.innerHTML.match(new RegExp(`id="${targetId}"`));
                if (m) return createMockElement('div', targetId);
            }
            return null;
        }
    };
    return el;
}

const mockLocalStorage = new MockStorage();
const mockSessionStorage = new MockStorage();
const mockHead = createMockElement('head');
const mockBody = createMockElement('body');
const elementRegistry = new Map();

const origAppend = mockBody.appendChild.bind(mockBody);
mockBody.appendChild = (child) => {
    if (child.id) elementRegistry.set(child.id, child);
    return origAppend(child);
};
const origRemove = mockBody.removeChild.bind(mockBody);
mockBody.removeChild = (child) => {
    if (child.id) elementRegistry.delete(child.id);
    return origRemove(child);
};

globalThis.localStorage = mockLocalStorage;
globalThis.sessionStorage = mockSessionStorage;
globalThis.window = {
    location: { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/index.html', href: 'https://stb6636.github.io/CheckinApp/index.html' },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {},
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } }
};
globalThis.document = {
    head: mockHead,
    body: mockBody,
    createElement(tag) { return createMockElement(tag); },
    getElementById(id) {
        if (id === 'bmaSystemUpdateModalStyles') return elementRegistry.get(id) || null;
        return elementRegistry.get(id) || null;
    },
    getElementsByTagName() { return [mockHead]; },
    querySelector(sel) {
        if (sel === '#loginVersionBadgeSlot') return createMockElement('div', 'loginVersionBadgeSlot');
        return null;
    }
};

// =========================================================================
// Import Real Project Modules
// =========================================================================
const { SystemUpdateModal } = await import('../../assets/js/components/SystemUpdateModal.js');
const { Config } = await import('../../assets/js/core/Config.js');
const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');
const { SettingsModel } = await import('../../assets/js/models/SettingsModel.js');
const { DatabaseService } = await import('../../assets/js/core/DatabaseService.js');

console.log('====================================================================');
console.log('QA VERIFICATION: PIPE-20261117 System Announcement & v2.10.0 Sync');
console.log('====================================================================\n');

// -------------------------------------------------------------------------
// Group 1: SQL Deliverables Verification
// -------------------------------------------------------------------------
console.log('--- 1. SQL Scripts & Schema Drift Fixes ---');
const sqlStaging = fs.readFileSync(path.join(WORKSPACE_ROOT, 'sql/alter_v2_10_announcement_staging.sql'), 'utf8');
const sqlPublic = fs.readFileSync(path.join(WORKSPACE_ROOT, 'sql/alter_v2_8_loca_v2_schema.sql'), 'utf8');
const sqlCreateStaging = fs.readFileSync(path.join(WORKSPACE_ROOT, 'sql/create_staging_schema.sql'), 'utf8');

const ANNOUNCEMENT_COLS = [
    'announcement_enabled',
    'announcement_mode',
    'announcement_start_date',
    'announcement_end_date',
    'announcement_title',
    'announcement_body',
    'announcement_image_url',
    'announcement_drive_folder_id',
    'announcement_updated_at'
];

test('alter_v2_10_announcement_staging.sql adds all 9 columns + pre-seeds id=1 + NOTIFY pgrst', () => {
    for (const col of ANNOUNCEMENT_COLS) {
        assert(sqlStaging.includes(col), `Missing column ${col}`);
    }
    assert(sqlStaging.includes("announcement_enabled = true"));
    assert(sqlStaging.includes("announcement_mode = 'text'"));
    assert(sqlStaging.includes("announcement_start_date = '2026-11-17'"));
    assert(sqlStaging.includes("announcement_title = 'แจ้งปรับปรุง ระบบลงเวลาปฏิบัติราชการ (สตบ.)'"));
    assert(sqlStaging.includes('ปรับปรุงหน้าลงเวลาปฏิบัติราชการใหม่ ใช้ง่ายกว่าเดิม'));
    assert(sqlStaging.includes('เพิ่มเลือก "ในสถานที่/นอกสถานที่"'));
    assert(sqlStaging.includes('เพิ่มฟังชั่น Sync ข้อมูล RealTime'));
    assert(sqlStaging.includes('แก้ไขการพิมพ์ข้อมูลหน้ารายงาน'));
    assert(sqlStaging.includes("NOTIFY pgrst, 'reload schema';"));
});

test('alter_v2_8_loca_v2_schema.sql fixes all 5 drift bugs + includes 9 announcement columns', () => {
    assert(sqlPublic.includes('offsite_job_types'));
    assert(sqlPublic.includes('special_request_reasons'));
    assert(sqlPublic.includes('check_out_location_mode'));
    assert(sqlPublic.includes('check_out_distance_from_official_meters'));
    assert(!/\bwork_mode\b/.test(sqlPublic), 'Unused work_mode should be removed');
    assert(!/\bcheck_out_work_mode\b/.test(sqlPublic), 'Unused check_out_work_mode should be removed');
    for (const col of ANNOUNCEMENT_COLS) {
        assert(sqlPublic.includes(col), `Missing ${col} in alter_v2_8_loca_v2_schema.sql`);
    }
    assert(sqlPublic.includes("NOTIFY pgrst, 'reload schema';"));
});

test('create_staging_schema.sql synced with all 9 announcement columns', () => {
    for (const col of ANNOUNCEMENT_COLS) {
        assert(sqlCreateStaging.includes(col), `Missing ${col} in create_staging_schema.sql`);
    }
});

// -------------------------------------------------------------------------
// Group 2: SystemUpdateModal Announcement Engine Tests
// -------------------------------------------------------------------------
console.log('\n--- 2. SystemUpdateModal Announcement Engine (UTC+7, Modes, XSS, Once-Only) ---');

test('DEFAULT_DATA updated to v2.10.0 and 17 พฤศจิกายน 2569', () => {
    assert.strictEqual(SystemUpdateModal.DEFAULT_DATA.appVersion, 'v2.10.0');
    assert.strictEqual(SystemUpdateModal.DEFAULT_DATA.releaseNotes.releaseDate, '17 พฤศจิกายน 2569');
});

test('getTodayBangkokISO converts UTC boundary accurately to UTC+7', () => {
    // 2026-11-17 16:59:59 UTC == 2026-11-17 23:59:59 BKK
    assert.strictEqual(SystemUpdateModal.getTodayBangkokISO(new Date('2026-11-17T16:59:59Z')), '2026-11-17');
    // 2026-11-17 17:00:00 UTC == 2026-11-18 00:00:00 BKK
    assert.strictEqual(SystemUpdateModal.getTodayBangkokISO(new Date('2026-11-17T17:00:00Z')), '2026-11-18');
});

test('isAnnouncementActive enforces inclusive Bangkok date bounds & empty end_date', () => {
    const base = {
        announcement_enabled: true,
        announcement_mode: 'text',
        announcement_title: 'หัวข้อทดสอบ',
        announcement_body: '- รายการ 1',
        announcement_start_date: '2026-11-17',
        announcement_end_date: '2026-11-19'
    };
    assert.strictEqual(SystemUpdateModal.isAnnouncementActive({ ...base, announcement_enabled: false }, new Date('2026-11-18T05:00:00Z')), false);
    assert.strictEqual(SystemUpdateModal.isAnnouncementActive(base, new Date('2026-11-16T16:59:00Z')), false); // Nov 16 BKK
    assert.strictEqual(SystemUpdateModal.isAnnouncementActive(base, new Date('2026-11-16T17:05:00Z')), true);  // Nov 17 00:05 BKK
    assert.strictEqual(SystemUpdateModal.isAnnouncementActive(base, new Date('2026-11-19T16:55:00Z')), true);  // Nov 19 23:55 BKK
    assert.strictEqual(SystemUpdateModal.isAnnouncementActive(base, new Date('2026-11-19T17:05:00Z')), false); // Nov 20 00:05 BKK

    const continuous = { ...base, announcement_end_date: '' };
    assert.strictEqual(SystemUpdateModal.isAnnouncementActive(continuous, new Date('2027-03-01T05:00:00Z')), true);

    const immediateBothEmpty = { ...base, announcement_start_date: '', announcement_end_date: '' };
    assert.strictEqual(SystemUpdateModal.isAnnouncementActive(immediateBothEmpty, new Date('2026-11-17T05:00:00Z')), true);

    const emptyImage = { announcement_enabled: true, announcement_mode: 'image', announcement_image_url: '' };
    assert.strictEqual(SystemUpdateModal.isAnnouncementActive(emptyImage, new Date('2026-11-17T05:00:00Z')), false);
});

test('formatAnnouncementBodyHtml formats bullets into cards and escapes XSS payloads', () => {
    const html = SystemUpdateModal.formatAnnouncementBodyHtml(
        '- ข้อหนึ่ง <script>alert(1)</script>\n• ข้อสอง\n1. ข้อสาม\n<img src=x onerror=alert(2)>'
    );
    assert(!html.includes('<script>'), 'Must escape <script>');
    assert(!html.includes('<img'), 'Must escape <img>');
    assert(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert(html.includes('ข้อสอง'));
    assert(html.includes('ข้อสาม'));
});

test('sanitizeImageUrl normalizes Google Drive links and blocks javascript: URLs', () => {
    assert.strictEqual(SystemUpdateModal.sanitizeImageUrl('javascript:alert(1)'), '');
    assert.strictEqual(
        SystemUpdateModal.sanitizeImageUrl('https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view?usp=sharing'),
        'https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOpQrStUvWxYz'
    );
});

test('Single-view deduplication across Login & 7-day Session, plus Preview never writes ACK', () => {
    mockLocalStorage.clear();
    const ann = {
        announcement_enabled: true,
        announcement_mode: 'text',
        announcement_start_date: '',
        announcement_end_date: '',
        announcement_title: 'ประกาศระบบ',
        announcement_body: '- ทดสอบ 1',
        announcement_updated_at: '2026-11-17T05:00:00.000Z'
    };

    // Preview does NOT record acknowledgment
    SystemUpdateModal.showAnnouncement(ann, { isPreview: true });
    assert(elementRegistry.has(SystemUpdateModal.MODAL_CONTAINER_ID), 'Preview modal rendered');
    SystemUpdateModal.close(true);
    assert.strictEqual(mockLocalStorage.getItem('bma_last_seen_announcement_id'), null, 'Preview close must NOT set ACK');

    // First auto-check shows modal
    const shown1 = SystemUpdateModal.checkAndShowAnnouncement(ann);
    assert.strictEqual(shown1, true);
    assert(elementRegistry.has(SystemUpdateModal.MODAL_CONTAINER_ID));
    SystemUpdateModal.close(true);
    assert.strictEqual(mockLocalStorage.getItem('bma_last_seen_announcement_id'), '2026-11-17T05:00:00.000Z');

    // Second check (e.g. after login into CheckinController / AppLayout) does NOT show again
    const shown2 = SystemUpdateModal.checkAndShowAnnouncement(ann);
    assert.strictEqual(shown2, false);

    // Admin updates announcement timestamp -> shows once again
    const annV2 = { ...ann, announcement_updated_at: '2026-11-17T09:30:00.000Z' };
    const shown3 = SystemUpdateModal.checkAndShowAnnouncement(annV2);
    assert.strictEqual(shown3, true);
    SystemUpdateModal.close(true);
    assert.strictEqual(mockLocalStorage.getItem('bma_last_seen_announcement_id'), '2026-11-17T09:30:00.000Z');

    // Empty announcement_updated_at still yields distinct tokens when body suffix differs with same length
    const t1 = SystemUpdateModal.getAnnouncementToken({
        announcement_mode: 'text',
        announcement_title: 'ประกาศ',
        announcement_body: 'รายละเอียดเหมือนกันช่วงต้น 1234567890 ABCDEF'
    });
    const t2 = SystemUpdateModal.getAnnouncementToken({
        announcement_mode: 'text',
        announcement_title: 'ประกาศ',
        announcement_body: 'รายละเอียดเหมือนกันช่วงต้น 1234567890 XYZ123'
    });
    assert.notStrictEqual(t1, t2, 'Fallback token must hash full announcement signature');
});

test('Image mode renders portrait showcase max-h-[70dvh] object-contain replacing text body', () => {
    mockLocalStorage.clear();
    const imgAnn = {
        announcement_enabled: true,
        announcement_mode: 'image',
        announcement_title: 'โปสเตอร์ประกาศ',
        announcement_body: 'ข้อความนี้ต้องไม่แสดงในโหมดรูป',
        announcement_image_url: 'https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOpQrStUvWxYz',
        announcement_updated_at: '2026-11-17T10:00:00.000Z'
    };
    SystemUpdateModal.showAnnouncement(imgAnn, { isPreview: false });
    const modal = elementRegistry.get(SystemUpdateModal.MODAL_CONTAINER_ID);
    assert(modal.innerHTML.includes('max-h-[70dvh]'));
    assert(modal.innerHTML.includes('object-contain'));
    assert(modal.innerHTML.includes('https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOpQrStUvWxYz'));
    assert(!modal.innerHTML.includes('ข้อความนี้ต้องไม่แสดงในโหมดรูป'));
    SystemUpdateModal.close(false);
});

await testAsync('Retired version.json auto-popup: init() does not auto-open modal without announcement settings', async () => {
    mockLocalStorage.clear();
    globalThis.fetch = async () => ({
        ok: true,
        json: async () => ({ buildId: '20261117_new', appVersion: 'v2.10.0', releaseNotes: SystemUpdateModal.DEFAULT_DATA.releaseNotes })
    });
    await SystemUpdateModal.init({ targetBadgeSlot: '#loginVersionBadgeSlot' });
    assert(!elementRegistry.has(SystemUpdateModal.MODAL_CONTAINER_ID), 'init() must NOT auto-popup version.json');
});

// -------------------------------------------------------------------------
// Group 3: SettingsModel PGRST204 Retry & Fallback Backup
// -------------------------------------------------------------------------
console.log('\n--- 3. SettingsModel (PGRST204 Retry maxRetries=16, _announcement Backup, Broadcast) ---');

await testAsync('SettingsModel.updateSettings retries on PGRST204 across missing columns & stores _announcement backup', async () => {
    mockLocalStorage.clear();
    mockSessionStorage.clear();

    const missingCols = [...ANNOUNCEMENT_COLS];
    let upsertCalls = 0;
    let lastUpsertPayload = null;
    let broadcastCalls = [];

    // Inject mock DatabaseService singleton
    const fakeDbClient = {
        from() {
            return {
                upsert(payload) {
                    upsertCalls++;
                    lastUpsertPayload = payload;
                    return {
                        select() {
                            return {
                                async single() {
                                    for (const col of missingCols) {
                                        if (col in payload) {
                                            return {
                                                data: null,
                                                error: {
                                                    code: 'PGRST204',
                                                    message: `Could not find the '${col}' column of 'system_settings' in the schema cache`
                                                }
                                            };
                                        }
                                    }
                                    return { data: { ...payload }, error: null };
                                }
                            };
                        }
                    };
                }
            };
        }
    };

    const origGetInstance = DatabaseService.getInstance;
    DatabaseService.getInstance = () => ({
        client: fakeDbClient,
        publicClient: fakeDbClient,
        broadcastRealtimeEvent(ev, p) { broadcastCalls.push({ ev, p }); }
    });

    try {
        const res = await SettingsModel.updateSettings({
            ...Config.DEFAULT_SETTINGS,
            announcement_enabled: true,
            announcement_mode: 'text',
            announcement_title: 'ทดสอบสำรองข้อมูล',
            announcement_body: '- ทดสอบ PGRST204',
            announcement_updated_at: '2026-11-17T12:00:00.000Z'
        });

        assert.strictEqual(res.success, true, 'Update must succeed after PGRST204 retries');
        assert.strictEqual(upsertCalls, 10, `Expected 10 upsert calls (1 initial + 9 stripped), got ${upsertCalls}`);
        assert(lastUpsertPayload.category_colors._announcement, 'Backup must be written into category_colors._announcement');
        assert.strictEqual(res.data.announcement_title, 'ทดสอบสำรองข้อมูล');
        assert(!('_announcement' in res.data.category_colors), 'Normalized category_colors must not expose _announcement');
        assert.strictEqual(broadcastCalls[0].ev, 'settings_updated');
        assert.strictEqual(broadcastCalls[0].p.announcement_updated_at, '2026-11-17T12:00:00.000Z');
    } finally {
        DatabaseService.getInstance = origGetInstance;
    }
});

await testAsync('SettingsModel.updateSettings handles all 19 optional columns missing (maxRetries >= 19)', async () => {
    mockLocalStorage.clear();
    mockSessionStorage.clear();

    const all19OptionalCols = [
        'offsite_job_types', 'special_request_reasons', 'official_locations',
        'allow_gallery_fallback', 'filter_shifts_by_realtime', 'disable_normal_hours_checkin',
        'randomize_gps_radius_meters', 'randomize_gps_checkout', 'early_shift_window_minutes',
        'enforce_geofence_radius', ...ANNOUNCEMENT_COLS
    ];
    let upsertCalls = 0;

    const fakeDbClient = {
        from() {
            return {
                upsert(payload) {
                    upsertCalls++;
                    return {
                        select() {
                            return {
                                async single() {
                                    for (const col of all19OptionalCols) {
                                        if (col in payload) {
                                            return {
                                                data: null,
                                                error: {
                                                    code: 'PGRST204',
                                                    message: `Could not find the '${col}' column of 'system_settings' in the schema cache`
                                                }
                                            };
                                        }
                                    }
                                    return { data: { ...payload }, error: null };
                                }
                            };
                        }
                    };
                }
            };
        }
    };

    const origGetInstance = DatabaseService.getInstance;
    DatabaseService.getInstance = () => ({
        client: fakeDbClient,
        publicClient: fakeDbClient,
        broadcastRealtimeEvent() {}
    });

    try {
        const res = await SettingsModel.updateSettings({
            ...Config.DEFAULT_SETTINGS,
            announcement_enabled: true,
            announcement_title: 'ทดสอบ 19 คอลัมน์'
        });
        assert.strictEqual(res.success, true, 'Must survive stripping all 19 optional columns');
        assert.strictEqual(upsertCalls, 20, `Expected 20 upsert calls (1 + 19), got ${upsertCalls}`);
    } finally {
        DatabaseService.getInstance = origGetInstance;
    }
});

await testAsync('SettingsModel.getSettings(false) bypasses stale pre-v2.10.0 sessionStorage without announcement_enabled', async () => {
    mockSessionStorage.clear();
    mockSessionStorage.setItem(Config.STORAGE_KEYS.CACHED_SETTINGS, JSON.stringify({
        id: 1,
        organization_name: 'Old Cached Org'
    }));

    let dbFetchCount = 0;
    const fakeDbClient = {
        from() {
            return {
                select() {
                    return {
                        eq() {
                            return {
                                async maybeSingle() {
                                    dbFetchCount++;
                                    return {
                                        data: {
                                            id: 1,
                                            organization_name: 'Fresh DB Org',
                                            announcement_enabled: true,
                                            announcement_title: 'ประกาศจาก DB'
                                        },
                                        error: null
                                    };
                                }
                            };
                        }
                    };
                }
            };
        }
    };

    const origGetInstance = DatabaseService.getInstance;
    DatabaseService.getInstance = () => ({ client: fakeDbClient, publicClient: fakeDbClient });
    try {
        const settings = await SettingsModel.getSettings(false);
        assert.strictEqual(dbFetchCount, 1, 'Must fetch from DB when cached settings lack boolean announcement_enabled');
        assert.strictEqual(settings.announcement_enabled, true);
        assert.strictEqual(settings.announcement_title, 'ประกาศจาก DB');
    } finally {
        DatabaseService.getInstance = origGetInstance;
    }
});

// -------------------------------------------------------------------------
// Group 4: DriveUploadBridge.gs & UIHelpers strictFolder
// -------------------------------------------------------------------------
console.log('\n--- 4. DriveUploadBridge.gs & UIHelpers strictFolder / MIME Preservation ---');

const gsContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'google_apps_script/DriveUploadBridge.gs'), 'utf8');
test('DriveUploadBridge.gs supports PNG/WebP base64 regex & strictFolder without fallback', () => {
    assert(gsContent.includes('/^data:image\\/[a-zA-Z0-9+.-]+;base64,/'));
    assert(gsContent.includes("e.parameter.strictFolder === 'true'"));
    assert(gsContent.includes('payload.strictFolder === true'));
    assert(gsContent.includes('if (strictFolder)'));
});

await testAsync('UIHelpers.verifyGoogleDriveLink(strictFolder: true) rejects empty folderId and drive.google.com non-script URLs', async () => {
    const resEmpty = await UIHelpers.verifyGoogleDriveLink('https://script.google.com/macros/s/abc/exec', '', { strictFolder: true });
    assert.strictEqual(resEmpty.success, false);
    const resDriveOnly = await UIHelpers.verifyGoogleDriveLink('https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz', '1AnnFolderId123456789012345', { strictFolder: true });
    assert.strictEqual(resDriveOnly.success, false, 'strictFolder must reject drive.google.com URL without Apps Script /exec');
});

await testAsync('UIHelpers.uploadPhotoToGoogleDrive(strictFolder: true) preserves PNG MIME & throws on Drive failure without fallback', async () => {
    let sentBody = null;
    globalThis.fetch = async (_url, opts) => {
        sentBody = JSON.parse(opts.body);
        return { json: async () => ({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงโฟลเดอร์' }) };
    };
    let threw = false;
    try {
        await UIHelpers.uploadPhotoToGoogleDrive(
            'data:image/png;base64,iVBORw0KGgo=',
            'Announcement',
            { google_drive_script_url: 'https://script.google.com/macros/s/abc/exec', google_drive_folder_id: 'OLD_CHECKIN_FOLDER' },
            { folderId: 'ANN_FOLDER_123456789012345', strictFolder: true }
        );
    } catch (err) {
        threw = true;
        assert(err.message.includes('ไม่มีสิทธิ์เข้าถึงโฟลเดอร์'));
    }
    assert.strictEqual(threw, true, 'Must throw error in strictFolder mode instead of silent fallback');
    assert.strictEqual(sentBody.folderId, 'ANN_FOLDER_123456789012345');
    assert.strictEqual(sentBody.mimeType, 'image/png');
    assert(sentBody.fileName.endsWith('.png'));
    assert.strictEqual(sentBody.strictFolder, true);
});

// -------------------------------------------------------------------------
// Group 5: SettingsController Isolation, 9 HTML Cache Sync, & Manuals
// -------------------------------------------------------------------------
console.log('\n--- 5. Settings Tab 7 Safeguards, 9 HTML Cache Sync & Manuals ---');

const settingsCtrlSrc = fs.readFileSync(path.join(WORKSPACE_ROOT, 'assets/js/controllers/SettingsController.js'), 'utf8');
const settingsHtmlSrc = fs.readFileSync(path.join(WORKSPACE_ROOT, 'settings.html'), 'utf8');
const versionJson = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'version.json'), 'utf8'));

test('SettingsController preserves announcement_* in #collectMainAndColorFieldsIntoSettings & scopes/dedupes SPA bindings', () => {
    const collectStart = settingsCtrlSrc.indexOf('#collectMainAndColorFieldsIntoSettings()');
    const persistStart = settingsCtrlSrc.indexOf('async #persistSettings(');
    const collectBlock = settingsCtrlSrc.slice(collectStart, persistStart);
    assert(!collectBlock.includes('this.settings.announcement_'), 'Tabs 1-6 collect method must NEVER mutate announcement_*');
    assert(settingsCtrlSrc.includes('__bmaSettingsMainClickHandler'), 'Must deduplicate <main> click listener across SPA re-entry');
    assert(settingsCtrlSrc.includes('modalAnnouncementPreviewImgError'), 'Preview modal must include image error fallback');
    assert(settingsHtmlSrc.includes('data-tab-target="tab-panel-announcement"'));
    assert(settingsHtmlSrc.includes('id="tab-panel-announcement"'));
    assert(settingsHtmlSrc.includes('id="modalAnnouncementPreview"'));
    assert(settingsHtmlSrc.indexOf('id="modalAnnouncementPreview"') > settingsHtmlSrc.indexOf('</main>'), 'Preview modal must be outside <main>');
});

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

test('version.json is v2.10.0 and all 9 HTML pages match buildId + preserve bma_last_seen_announcement_id', () => {
    assert.strictEqual(versionJson.appVersion, 'v2.10.0');
    assert.strictEqual(versionJson.releaseNotes.releaseDate, '17 พฤศจิกายน 2569');
    for (const file of ALL_9_HTML) {
        const html = fs.readFileSync(path.join(WORKSPACE_ROOT, file), 'utf8');
        assert(html.includes(`CURRENT_APP_BUILD = '${versionJson.buildId}'`), `${file} CURRENT_APP_BUILD mismatch`);
        assert(html.includes("'bma_last_seen_announcement_id'"), `${file} missing bma_last_seen_announcement_id in PRESERVE_KEYS`);
    }
});

test('All 4 user manuals updated to V2.10.0 and 17 พฤศจิกายน 2569', () => {
    const manualFiles = [
        'docs/manual/index.html',
        'docs/manual/manual-user.html',
        'docs/manual/manual-admin.html',
        'docs/manual/manual-superadmin.html'
    ];
    for (const mf of manualFiles) {
        const content = fs.readFileSync(path.join(WORKSPACE_ROOT, mf), 'utf8');
        assert(content.includes('V2.10.0'), `${mf} missing V2.10.0`);
        assert(content.includes('17 พฤศจิกายน 2569'), `${mf} missing 17 พฤศจิกายน 2569`);
    }
    const superManual = fs.readFileSync(path.join(WORKSPACE_ROOT, 'docs/manual/manual-superadmin.html'), 'utf8');
    assert(superManual.includes('sim-panel-6') && superManual.includes('sim-panel-7'), 'SuperAdmin manual simulator must include Tabs 6 & 7');
});

console.log(`\n====================================================================`);
console.log(`QA VERIFICATION RESULTS: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log(`====================================================================`);

if (failed > 0) process.exit(1);
