/**
 * qa_fix_mobile_logout_session_camera.mjs
 * Comprehensive Stage 3 QA & Runtime Verification Suite for PIPE-20261116-fix-mobile-logout-session-camera
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT_DIR = process.cwd();
const HTML_FILES = [
    'index.html',
    'checkin.html',
    'dashboard.html',
    'approvals.html',
    'reports.html',
    'personnel.html',
    'settings.html',
    'users.html'
];
const EXPECTED_PRESERVE_KEYS = [
    'bma_checkin_session_user_v2_7',
    'bma_checkin_theme_mode_v2_7',
    'bma_remember_me',
    'bma_remember_username',
    'bma_last_seen_update_build',
    'bma_app_build'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`[PASS] #${String(totalTests).padStart(2, '0')}: ${name}`);
    } catch (err) {
        failedTests++;
        console.error(`[FAIL] #${String(totalTests).padStart(2, '0')}: ${name}`);
        console.error(`       ${err.stack || err.message}`);
    }
}

async function runAsyncTest(name, fn) {
    totalTests++;
    try {
        await fn();
        passedTests++;
        console.log(`[PASS] #${String(totalTests).padStart(2, '0')}: ${name}`);
    } catch (err) {
        failedTests++;
        console.error(`[FAIL] #${String(totalTests).padStart(2, '0')}: ${name}`);
        console.error(`       ${err.stack || err.message}`);
    }
}

function makeMockStream(harness, opts = {}) {
    const track = {
        kind: 'video',
        readyState: opts.readyState || 'live',
        onended: null,
        stop() {
            this.readyState = 'ended';
            harness.trackStoppedCount++;
            if (opts.onStop) opts.onStop();
        }
    };
    const stream = {
        _id: opts.id || `stream_${Math.random().toString(36).slice(2, 8)}`,
        _track: track,
        getTracks: () => [track],
        getVideoTracks: () => [track]
    };
    return { stream, track };
}

let activeHarnessRef = null;

function createSharedMockDb() {
    function createChainableProxy(table = '', op = 'select', isSingle = false) {
        return new Proxy({}, {
            get(_, prop) {
                if (prop === 'then') {
                    return (resolve) => {
                        const h = activeHarnessRef;
                        if (h && op !== 'select') {
                            h.dbWrites.push({ table, op });
                        }
                        if (table === 'system_settings') {
                            return resolve({ data: h ? h.defaultSettings : {}, error: null });
                        }
                        if (table === 'user_accounts') {
                            if (isSingle) {
                                return resolve({
                                    data: {
                                        id: h?.initialUser?.id || 'U1',
                                        personnel_id: h?.initialUser?.personnel_id || 'P1',
                                        username: 'qa_auditor',
                                        full_name: 'QA Auditor',
                                        role: h?.initialUser?.role || 'User',
                                        is_active: true,
                                        personnel: { id: 'P1', prefix: 'นาย', first_name: 'QA', last_name: 'Auditor', bureau: 'B1', division: 'D1' }
                                    },
                                    error: null
                                });
                            }
                            return resolve({ data: [], error: null, count: 0 });
                        }
                        if (table === 'attendance_logs') {
                            return resolve({ data: [], error: null, count: 0 });
                        }
                        return resolve({ data: [], error: null, count: 0 });
                    };
                }
                if (prop === 'catch') return () => Promise.resolve();
                if (prop === 'maybeSingle' || prop === 'single') {
                    return () => createChainableProxy(table, op, true);
                }
                if (prop === 'insert' || prop === 'update' || prop === 'upsert' || prop === 'delete') {
                    return () => createChainableProxy(table, prop, isSingle);
                }
                return () => createChainableProxy(table, op, isSingle);
            }
        });
    }
    return {
        from: (table) => createChainableProxy(table),
        channel: () => ({ on() { return this; }, subscribe(cb) { if (cb) cb('SUBSCRIBED'); return this; } })
    };
}

const SHARED_MOCK_DB = createSharedMockDb();
const REAL_SET_INTERVAL = globalThis.setInterval;

function setupBrowserHarness(options = {}) {
    if (activeHarnessRef) {
        activeHarnessRef.cleanup();
    }
    const store = new Map(Object.entries(options.initialLocalStorage || {}));
    const sessionStore = new Map(Object.entries(options.initialSessionStorage || {}));
    const intervals = [];
    const domElements = {};

    class MockClassList {
        constructor(initial = []) {
            this._set = new Set(initial);
        }
        contains(c) { return this._set.has(c); }
        add(...cls) { cls.forEach(c => this._set.add(c)); }
        remove(...cls) { cls.forEach(c => this._set.delete(c)); }
        toggle(c, force) {
            if (force !== undefined) {
                if (force) this._set.add(c);
                else this._set.delete(c);
                return Boolean(force);
            }
            if (this._set.has(c)) { this._set.delete(c); return false; }
            this._set.add(c);
            return true;
        }
        toString() { return [...this._set].join(' '); }
    }

    function getOrCreateElem(id, defaults = {}) {
        if (!domElements[id]) {
            const initialClasses = defaults.classes ?? (
                id === 'modalFullscreenCamera' ||
                id === 'cameraPermissionHintBanner' ||
                id === 'mobileHistoryDrawer' ||
                id === 'modalSpecialRequest'
                    ? ['hidden']
                    : []
            );
            const el = {
                id,
                tagName: defaults.tagName || 'DIV',
                parentElement: null,
                children: [],
                classList: new MockClassList(initialClasses),
                className: initialClasses.join(' '),
                listeners: {},
                dataset: {},
                style: {},
                value: defaults.value ?? '',
                checked: false,
                disabled: false,
                textContent: '',
                innerHTML: '',
                src: '',
                srcObject: null,
                files: [],
                width: 720,
                height: 960,
                readyState: options.defaultReadyState ?? 4,
                videoWidth: options.defaultVideoWidth ?? 720,
                videoHeight: options.defaultVideoHeight ?? 960,
                appendChild(child) {
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
                        _propagationStopped: false,
                        preventDefault() {},
                        stopPropagation() { this._propagationStopped = true; },
                        ...evt
                    };
                    let cur = this;
                    while (cur && !event._propagationStopped) {
                        event.currentTarget = cur;
                        for (const fn of (cur.listeners[event.type] || [])) {
                            fn(event);
                        }
                        cur = cur.parentElement;
                    }
                    return event;
                },
                click() {
                    if (id === 'cameraFallbackFileInput') {
                        harness.fallbackClickCount++;
                    }
                    return this.dispatchEvent({ type: 'click', target: this });
                },
                play: async () => { harness.videoPlayCalls++; },
                pause: () => { harness.videoPauseCalls++; },
                remove: () => { el.parentElement = null; },
                focus: () => {},
                scrollIntoView: () => {},
                getContext: () => ({ drawImage: () => { harness.canvasDrawCalls++; } }),
                toDataURL: () => 'data:image/jpeg;base64,MOCK_IMAGE_DATA'
            };
            domElements[id] = el;
        }
        return domElements[id];
    }

    // Establish parent-child relationship matching checkin.html
    const photoPreviewCard = getOrCreateElem('photoPreviewCard');
    const cameraFallbackFileInput = getOrCreateElem('cameraFallbackFileInput', { tagName: 'INPUT' });
    photoPreviewCard.appendChild(cameraFallbackFileInput);
    const modalFullscreenCamera = getOrCreateElem('modalFullscreenCamera');
    const cameraPermissionHintBanner = getOrCreateElem('cameraPermissionHintBanner');
    const cameraPermissionHintText = getOrCreateElem('cameraPermissionHintText', { tagName: 'SPAN' });
    cameraPermissionHintBanner.appendChild(cameraPermissionHintText);
    modalFullscreenCamera.appendChild(cameraPermissionHintBanner);

    const harness = {
        store,
        sessionStore,
        domElements,
        getOrCreateElem,
        redirects: [],
        alerts: [],
        toasts: [],
        swalCalls: [],
        swalVisible: false,
        swalClosedCount: 0,
        swalNextResponse: { isConfirmed: true },
        swalPendingResolver: null,
        gumCalls: [],
        videoPlayCalls: 0,
        videoPauseCalls: 0,
        canvasDrawCalls: 0,
        trackStoppedCount: 0,
        fallbackClickCount: 0,
        dbWrites: [],
        failFileReader: false,
        failImageLoad: false,
        intervals,
        cleanup() {
            for (const id of intervals) clearInterval(id);
            intervals.length = 0;
        }
    };

    if (options.initialUser) {
        store.set('bma_checkin_session_user_v2_7', JSON.stringify(options.initialUser));
    }

    harness.initialUser = options.initialUser || null;
    harness.defaultSettings = {
        id: 1,
        require_photo: true,
        require_gps: false,
        allow_gallery_fallback: true,
        disable_normal_hours_checkin: false,
        standard_check_in: '08:30',
        standard_check_out: '16:30',
        enforce_geofence_radius: true,
        allowed_radius_meters: 400,
        office_lat: 13.7563,
        office_lng: 100.5018,
        official_locations: [{ id: 'loc1', name: 'สำนักเทศกิจ', latitude: 13.7563, longitude: 100.5018, radius_meters: 400, is_active: true }],
        work_shifts: [{ name: 'เวลาราชการปกติ', check_in: '08:30', check_out: '16:30', is_custom: false, is_overtime: false }],
        remarks: ['ปฏิบัติงานนอกสถานที่'],
        offsite_job_types: ['ออกตรวจพื้นที่'],
        special_request_reasons: ['ไปราชการนอกสถานที่'],
        category_colors: {},
        ...(options.settingsOverride || {})
    };
    activeHarnessRef = harness;

    globalThis.localStorage = {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => { store.set(k, String(v)); },
        removeItem: (k) => { store.delete(k); },
        clear: () => { store.clear(); }
    };
    globalThis.sessionStorage = {
        getItem: (k) => (sessionStore.has(k) ? sessionStore.get(k) : null),
        setItem: (k, v) => { sessionStore.set(k, String(v)); },
        removeItem: (k) => { sessionStore.delete(k); },
        clear: () => { sessionStore.clear(); }
    };
    Object.defineProperty(globalThis, 'localStorage', { value: globalThis.localStorage, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'sessionStorage', { value: globalThis.sessionStorage, configurable: true, writable: true });

    const windowObj = {
        _listeners: {},
        addEventListener(t, fn) { this._listeners[t] = this._listeners[t] || []; this._listeners[t].push(fn); },
        removeEventListener() {},
        dispatchEvent(evt) { (this._listeners[evt?.type] || []).forEach(fn => fn(evt)); },
        scrollTo: () => {},
        location: {
            href: 'https://stb6636.github.io/CheckinApp/checkin.html',
            pathname: '/CheckinApp/checkin.html',
            search: '',
            hash: '',
            replace: (url) => { harness.redirects.push(url); }
        },
        history: { replaceState: () => {} },
        supabase: { createClient: () => SHARED_MOCK_DB },
        Swal: {
            isVisible: () => harness.swalVisible,
            close: () => {
                harness.swalVisible = false;
                harness.swalClosedCount++;
                if (harness.swalPendingResolver) {
                    const res = harness.swalPendingResolver;
                    harness.swalPendingResolver = null;
                    res({ isConfirmed: false, isDismissed: true });
                }
            },
            fire: (opts) => {
                harness.swalCalls.push(opts);
                harness.swalVisible = true;
                if (options.holdSwalOpen) {
                    return new Promise((resolve) => {
                        harness.swalPendingResolver = resolve;
                    });
                }
                harness.swalVisible = false;
                return Promise.resolve(typeof harness.swalNextResponse === 'function' ? harness.swalNextResponse(opts) : harness.swalNextResponse);
            }
        },
        confirm: () => true
    };
    globalThis.window = windowObj;
    globalThis.requestAnimationFrame = (cb) => { cb(); return 1; };
    globalThis.CustomEvent = class CustomEvent {
        constructor(type, init = {}) {
            this.type = type;
            this.detail = init.detail;
        }
    };

    const documentObj = {
        _listeners: {},
        hidden: false,
        visibilityState: 'visible',
        body: getOrCreateElem('__body__'),
        documentElement: { classList: new MockClassList() },
        addEventListener(t, fn) { this._listeners[t] = this._listeners[t] || []; this._listeners[t].push(fn); },
        removeEventListener() {},
        getElementById: (id) => getOrCreateElem(id),
        createElement: (tag) => getOrCreateElem(`__dyn_${tag}_${Math.random().toString(36).slice(2, 6)}`, { tagName: tag.toUpperCase() }),
        querySelector: () => null,
        querySelectorAll: () => []
    };
    globalThis.document = documentObj;

    globalThis.FileReader = class MockFileReader {
        readAsDataURL() {
            setTimeout(() => {
                if (harness.failFileReader) {
                    this.onerror?.(new Error('File read error'));
                } else {
                    this.onload?.({ target: { result: 'data:image/jpeg;base64,RAW' } });
                }
            }, 0);
        }
    };
    globalThis.Image = class MockImage {
        set src(_v) {
            setTimeout(() => {
                if (harness.failImageLoad) {
                    this.onerror?.(new Error('Corrupt image'));
                } else {
                    this.width = 800;
                    this.height = 1000;
                    this.onload?.();
                }
            }, 0);
        }
    };

    const navObj = {
        userAgent: options.userAgent || 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
        platform: options.platform || 'Linux armv8l',
        maxTouchPoints: options.maxTouchPoints ?? 5,
        brave: options.isBrave ? {} : undefined,
        mediaDevices: options.mediaDevices !== undefined ? options.mediaDevices : {
            getUserMedia: async (constraints) => {
                harness.gumCalls.push(constraints);
                if (options.getUserMediaImpl) {
                    return await options.getUserMediaImpl(constraints, harness.gumCalls.length);
                }
                const { stream } = makeMockStream(harness);
                return stream;
            },
            enumerateDevices: options.enumerateDevices || (async () => [{ kind: 'videoinput', deviceId: 'cam1' }])
        },
        permissions: options.permissions
    };
    Object.defineProperty(globalThis, 'navigator', { value: navObj, configurable: true, writable: true });

    // Wrap setInterval to track and clean up open handles across tests
    globalThis.setInterval = (fn, ms) => {
        const id = REAL_SET_INTERVAL(fn, ms);
        intervals.push(id);
        return id;
    };

    return harness;
}

async function flushMicrotasks(ms = 30) {
    await new Promise(r => setTimeout(r, ms));
}

async function main() {
    console.log('========================================================================');
    console.log(' QA AUDIT SUITE: PIPE-20261116-fix-mobile-logout-session-camera');
    console.log('========================================================================\n');

    // =========================================================================
    // GROUP A: Syntax Check, Cache Version Sync, PRESERVE_KEYS & Hard Purge VM
    // =========================================================================
    const jsTargets = [
        'assets/js/controllers/CheckinController.js',
        'assets/js/components/AppLayout.js',
        '.ai_map/vscode_ast_mapper.mjs',
        'assets/js/core/AuthService.js',
        'assets/js/core/UIHelpers.js'
    ];
    for (const file of jsTargets) {
        runTest(`Syntax Check: node --check ${file}`, () => {
            assert.ok(fs.existsSync(file), `Missing file: ${file}`);
            execFileSync('node', ['--check', file], { encoding: 'utf8' });
        });
    }

    const versionJson = JSON.parse(fs.readFileSync('version.json', 'utf8'));
    const expectedBuildId = versionJson.buildId;

    runTest('Cache Sync & PRESERVE_KEYS Static Audit across ALL 8 HTML files + SHA-256 contentHash', () => {
        assert.ok(expectedBuildId && /^\d{8}_[a-f0-9]+$/i.test(expectedBuildId), `Invalid version.json buildId: ${expectedBuildId}`);
        const walkAssets = (dir, out = []) => {
            if (!fs.existsSync(dir)) return out;
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) walkAssets(full, out);
                else if (entry.isFile() && ['.css', '.js'].includes(path.extname(entry.name).toLowerCase())) {
                    out.push(path.relative(ROOT_DIR, full).replace(/\\/g, '/'));
                }
            }
            return out;
        };
        const targetFiles = [...HTML_FILES, ...walkAssets('assets/css'), ...walkAssets('assets/js')].sort((a, b) => a.localeCompare(b));
        const hasher = crypto.createHash('sha256');
        for (const rel of targetFiles) {
            const normalized = fs.readFileSync(rel, 'utf8')
                .replace(/\r\n/g, '\n')
                .replace(/CURRENT_APP_BUILD\s*=\s*['"][^'"]*['"]/g, "CURRENT_APP_BUILD = '__BUILD_ID__'")
                .replace(/\?v=[0-9A-Za-z_.-]+/g, '?v=__BUILD_ID__');
            hasher.update(`${rel}\n${normalized}\n`, 'utf8');
        }
        const computedHash = hasher.digest('hex');
        assert.strictEqual(versionJson.contentHash, computedHash, 'version.json contentHash must match live frontend files SHA-256');
        assert.ok(expectedBuildId.endsWith(`_${computedHash.slice(0, 8)}`), 'buildId suffix must match SHA-256 prefix');

        for (const htmlFile of HTML_FILES) {
            const html = fs.readFileSync(htmlFile, 'utf8');
            const buildMatch = html.match(/const\s+CURRENT_APP_BUILD\s*=\s*'([^']+)'/);
            assert.ok(buildMatch, `${htmlFile}: missing CURRENT_APP_BUILD`);
            assert.strictEqual(buildMatch[1], expectedBuildId, `${htmlFile}: CURRENT_APP_BUILD mismatch (${buildMatch[1]} !== ${expectedBuildId})`);

            const buildKeyMatch = html.match(/const\s+BUILD_STORAGE_KEY\s*=\s*'([^']+)'/);
            assert.ok(buildKeyMatch && buildKeyMatch[1] === 'bma_app_build', `${htmlFile}: BUILD_STORAGE_KEY must be 'bma_app_build'`);

            const preserveMatch = html.match(/const\s+PRESERVE_KEYS\s*=\s*(\[[\s\S]*?\]);/);
            assert.ok(preserveMatch, `${htmlFile}: missing PRESERVE_KEYS array`);
            const evaluatedKeys = vm.runInNewContext(
                `(() => { const BUILD_STORAGE_KEY = 'bma_app_build'; return ${preserveMatch[1]}; })()`,
                {}
            );
            assert.deepStrictEqual([...evaluatedKeys], EXPECTED_PRESERVE_KEYS, `${htmlFile}: PRESERVE_KEYS must exactly match the 6 expected keys`);
            const preserveBody = preserveMatch[1];
            assert.ok(!preserveBody.includes('bma_auth_session_v2'), `${htmlFile}: still has stale bma_auth_session_v2`);
            assert.ok(!preserveBody.includes('bma_theme_mode'), `${htmlFile}: still has stale bma_theme_mode`);

            // Verify EVERY assets/css or assets/js reference uses ?v=<expectedBuildId>
            const assetRefs = [...html.matchAll(/(?:href|src)\s*=\s*["']([^"']*assets\/(?:css|js)\/[^"']+)["']/gi)].map(m => m[1]);
            assert.ok(assetRefs.length >= 2, `${htmlFile}: expected at least 2 asset references, found ${assetRefs.length}`);
            for (const ref of assetRefs) {
                assert.ok(ref.endsWith(`?v=${expectedBuildId}`), `${htmlFile}: asset '${ref}' missing ?v=${expectedBuildId}`);
            }
        }
    });

    await runAsyncTest('Runtime Simulation: inline <head> performHardCachePurge() preserves all 6 keys across ALL 8 HTML files (local mismatch & remote version.json)', async () => {
        for (const htmlFile of HTML_FILES) {
            const html = fs.readFileSync(htmlFile, 'utf8');
            const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
            assert.ok(headMatch, `${htmlFile}: missing <head>`);
            const scriptBlocks = [...headMatch[1].matchAll(/<script>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
            const inlineJs = scriptBlocks.find(s => s.includes('performHardCachePurge'));
            assert.ok(inlineJs, `${htmlFile}: failed to extract inline cache-buster script`);

            const runPurgeScenario = async ({ storedBuild, remoteBuildResponse }) => {
                const localMap = new Map([
                    ['bma_app_build', storedBuild],
                    ['bma_checkin_session_user_v2_7', JSON.stringify({ id: 'U1', expires_at: Date.now() + 500000 })],
                    ['bma_checkin_theme_mode_v2_7', 'dark'],
                    ['bma_remember_me', 'true'],
                    ['bma_remember_username', 'somchai.bma'],
                    ['bma_last_seen_update_build', '20261113_oldbuild'],
                    ['bma_official_locations_v2', 'stale_locations'],
                    ['bma_checkin_cached_settings_v2_7', 'stale_settings'],
                    ['bma_legacy_garbage_key', 'should_be_deleted']
                ]);
                const sessionMap = new Map();
                const replacedUrls = [];
                const deletedCaches = [];
                let unregisteredSW = 0;

                const fakeLocalStorage = new Proxy({}, {
                    get(_, prop) {
                        if (prop === 'getItem') return (k) => (localMap.has(k) ? localMap.get(k) : null);
                        if (prop === 'setItem') return (k, v) => { localMap.set(k, String(v)); };
                        if (prop === 'removeItem') return (k) => { localMap.delete(k); };
                        return localMap.get(String(prop));
                    },
                    ownKeys() { return [...localMap.keys()]; },
                    getOwnPropertyDescriptor(_, prop) {
                        return { enumerable: true, configurable: true, value: localMap.get(String(prop)) };
                    }
                });

                const sandbox = {
                    URL,
                    Promise,
                    console,
                    localStorage: fakeLocalStorage,
                    sessionStorage: {
                        getItem: (k) => (sessionMap.has(k) ? sessionMap.get(k) : null),
                        setItem: (k, v) => { sessionMap.set(k, String(v)); }
                    },
                    window: {
                        location: {
                            href: `https://stb6636.github.io/CheckinApp/${htmlFile}`,
                            pathname: `/CheckinApp/${htmlFile}`,
                            replace: (u) => { replacedUrls.push(u); }
                        },
                        history: { replaceState: () => {} },
                        caches: {
                            keys: async () => ['bma-v1'],
                            delete: async (n) => { deletedCaches.push(n); return true; }
                        },
                        addEventListener: () => {}
                    },
                    navigator: {
                        serviceWorker: {
                            getRegistrations: async () => [{ unregister: async () => { unregisteredSW++; } }]
                        }
                    },
                    document: {
                        visibilityState: 'visible',
                        addEventListener: () => {}
                    },
                    fetch: async (url) => {
                        if (String(url).includes('version.json') && remoteBuildResponse) {
                            return { ok: true, json: async () => ({ buildId: remoteBuildResponse }) };
                        }
                        return { ok: false };
                    }
                };
                sandbox.window.localStorage = fakeLocalStorage;
                sandbox.window.sessionStorage = sandbox.sessionStorage;

                vm.runInNewContext(inlineJs, sandbox);
                await flushMicrotasks(25);
                return { localMap, replacedUrls, deletedCaches, unregisteredSW };
            };

            // Scenario 1: Local build mismatch triggers performHardCachePurge(CURRENT_APP_BUILD)
            const s1 = await runPurgeScenario({ storedBuild: '20261113_oldbuild', remoteBuildResponse: null });
            for (const key of EXPECTED_PRESERVE_KEYS) {
                assert.ok(s1.localMap.has(key), `${htmlFile} (local mismatch): expected '${key}' to survive`);
            }
            assert.strictEqual(s1.localMap.get('bma_app_build'), expectedBuildId, `${htmlFile}: bma_app_build updated`);
            assert.strictEqual(s1.localMap.has('bma_official_locations_v2'), false, `${htmlFile}: bma_official_locations_v2 purged`);
            assert.strictEqual(s1.localMap.has('bma_checkin_cached_settings_v2_7'), false, `${htmlFile}: cached settings purged`);
            assert.strictEqual(s1.localMap.has('bma_legacy_garbage_key'), false, `${htmlFile}: stale key purged`);
            assert.strictEqual(s1.deletedCaches.length, 1, `${htmlFile}: caches.delete called`);
            assert.strictEqual(s1.unregisteredSW, 1, `${htmlFile}: SW unregistered`);
            assert.ok(s1.replacedUrls[0]?.includes(`_cb=${expectedBuildId}`), `${htmlFile}: location.replace includes _cb`);

            // Scenario 2: Local build matches CURRENT_APP_BUILD, remote version.json announces newer build
            const nextRemote = '20261117_deadbeef';
            const s2 = await runPurgeScenario({ storedBuild: expectedBuildId, remoteBuildResponse: nextRemote });
            for (const key of EXPECTED_PRESERVE_KEYS) {
                assert.ok(s2.localMap.has(key), `${htmlFile} (remote update): expected '${key}' to survive`);
            }
            assert.strictEqual(s2.localMap.get('bma_app_build'), nextRemote, `${htmlFile}: remote build stamped`);
            assert.strictEqual(s2.localMap.has('bma_official_locations_v2'), false, `${htmlFile}: remote update purged locations cache`);
            assert.ok(s2.replacedUrls[0]?.includes(`_cb=${nextRemote}`), `${htmlFile}: remote update location.replace includes _cb`);
        }
    });

    // =========================================================================
    // GROUP B: Task 1 — Z-Index Hierarchy & Drawer Logout Behavior
    // =========================================================================
    runTest('Task 1: Z-Index hierarchy strictly orders overlays < .swal2-container < progress < toast < spinner', () => {
        const css = fs.readFileSync('assets/css/bma-theme.css', 'utf8');
        const checkinHtml = fs.readFileSync('checkin.html', 'utf8');
        const uiHelpersSrc = fs.readFileSync('assets/js/core/UIHelpers.js', 'utf8');
        const updateModalSrc = fs.readFileSync('assets/js/components/SystemUpdateModal.js', 'utf8');

        const allSwalRules = [...css.matchAll(/\.swal2-container\s*\{([^}]*)\}/g)];
        assert.strictEqual(allSwalRules.length, 1, 'bma-theme.css must define exactly 1 .swal2-container rule');
        const swalZMatch = allSwalRules[0][1].match(/z-index:\s*(\d+)\s*!important;/);
        assert.ok(swalZMatch, 'bma-theme.css .swal2-container must declare !important z-index');
        const swalZ = Number(swalZMatch[1]);
        assert.strictEqual(swalZ, 99990, '.swal2-container z-index must be 99990');

        const swalScriptIdx = checkinHtml.indexOf('sweetalert2@11');
        const themeCssIdx = checkinHtml.indexOf('assets/css/bma-theme.css');
        assert.ok(swalScriptIdx > 0 && themeCssIdx > swalScriptIdx, 'bma-theme.css must load after sweetalert2@11 script');

        const mainCloseIdx = checkinHtml.indexOf('</main>');
        const overlayIds = ['mobileHistoryDrawer', 'modalSpecialRequest', 'modalOffsiteMapSearch', 'modalFullscreenCamera', 'modalViewGpsMap'];
        for (const id of overlayIds) {
            const m = checkinHtml.match(new RegExp(`id="${id}"[^>]*z-\\[(\\d+)\\]`));
            assert.ok(m, `checkin.html #${id} must declare z-[9999]`);
            assert.strictEqual(Number(m[1]), 9999);
            assert.ok(checkinHtml.indexOf(`id="${id}"`) > mainCloseIdx, `checkin.html #${id} must sit outside </main> at root body level`);
        }
        assert.ok(updateModalSrc.includes('z-[9999]'), 'SystemUpdateModal must use z-[9999]');

        const topBarZ = Number(css.match(/#bmaTopProgressBar[\s\S]*?z-index:\s*(\d+)/)[1]);
        const toastZ = Number(css.match(/#bmaToastWrapper[\s\S]*?z-index:\s*(\d+)/)[1]);
        const spinnerZ = Number(uiHelpersSrc.match(/bmaGlobalSpinner[\s\S]*?z-index:\s*(\d+)/)[1]);

        assert.ok(9999 < swalZ, `Drawer/Modal (9999) < .swal2-container (${swalZ})`);
        assert.ok(swalZ < topBarZ, `.swal2-container (${swalZ}) < #bmaTopProgressBar (${topBarZ})`);
        assert.ok(topBarZ < toastZ, `#bmaTopProgressBar (${topBarZ}) < #bmaToastWrapper (${toastZ})`);
        assert.ok(toastZ < spinnerZ, `#bmaToastWrapper (${toastZ}) < #bmaGlobalSpinner (${spinnerZ})`);
    });

    await runAsyncTest('Task 1 Runtime: #btnDrawerLogout keeps #mobileHistoryDrawer open WHILE Swal confirm is open, on cancel, & clears session on confirm', async () => {
        const validUser = { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 };
        const harness = setupBrowserHarness({ initialUser: validUser, holdSwalOpen: true });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        const ctrl = new CheckinController();
        await flushMicrotasks(40);

        const drawer = harness.getOrCreateElem('mobileHistoryDrawer');
        drawer.classList.remove('hidden'); // Simulate open drawer

        // Open logout confirm & verify drawer stays open WHILE Swal is visible
        harness.getOrCreateElem('btnDrawerLogout').click();
        await flushMicrotasks(20);
        assert.strictEqual(harness.swalCalls.length, 1, 'Swal confirm must open');
        assert.strictEqual(harness.swalVisible, true, 'Swal confirm must be actively visible');
        assert.strictEqual(drawer.classList.contains('hidden'), false, '#mobileHistoryDrawer must remain open WHILE Swal confirm is open');

        // Cancel logout
        harness.swalVisible = false;
        harness.swalPendingResolver({ isConfirmed: false, isDismissed: true });
        harness.swalPendingResolver = null;
        await flushMicrotasks(20);
        assert.strictEqual(drawer.classList.contains('hidden'), false, '#mobileHistoryDrawer must stay open on cancel');
        assert.ok(harness.store.has('bma_checkin_session_user_v2_7'), 'Session must remain on cancel');
        assert.strictEqual(harness.redirects.length, 0, 'No redirect on cancel');

        // Confirm logout
        harness.getOrCreateElem('btnDrawerLogout').click();
        await flushMicrotasks(20);
        assert.strictEqual(harness.swalVisible, true, 'Swal confirm must reopen');
        harness.swalVisible = false;
        harness.swalPendingResolver({ isConfirmed: true });
        harness.swalPendingResolver = null;
        await flushMicrotasks(20);
        assert.strictEqual(harness.store.has('bma_checkin_session_user_v2_7'), false, 'Session cleared on confirm');
        assert.strictEqual(harness.redirects.length, 1, 'Redirect triggered on confirm');
    });

    // =========================================================================
    // GROUP C: Task 2 & 3 — Session 7-Day Sliding Window & Guards
    // =========================================================================
    await runAsyncTest('Task 2 Runtime: AuthService.getCurrentUser(true) extends 7 days and expires >7 days', async () => {
        const sixDaysAgo = Date.now() - (6 * 24 * 60 * 60 * 1000);
        const nearExpiryUser = {
            id: 'U1',
            role: 'User',
            last_active_at: sixDaysAgo,
            expires_at: sixDaysAgo + (7 * 24 * 60 * 60 * 1000)
        };
        const harness = setupBrowserHarness({ initialUser: nearExpiryUser });
        const { AuthService } = await import('../../assets/js/core/AuthService.js');

        const before = Date.now();
        const active = AuthService.getCurrentUser(true);
        assert.ok(active && active.id === 'U1', 'Near-expiry valid session must return user');
        const stored = JSON.parse(harness.store.get('bma_checkin_session_user_v2_7'));
        const expectedMin = before + AuthService.SESSION_TTL_MS - 1000;
        assert.ok(stored.expires_at >= expectedMin, 'expires_at must be extended by full 7 days');

        // Expire session (>7 days)
        harness.store.set('bma_checkin_session_user_v2_7', JSON.stringify({
            id: 'U1',
            role: 'User',
            expires_at: Date.now() - 1000
        }));
        const expired = AuthService.getCurrentUser(true);
        assert.strictEqual(expired, null, 'Expired session (>7 days) must return null');
        assert.strictEqual(harness.store.has('bma_checkin_session_user_v2_7'), false, 'Expired session must be cleared');
    });

    await runAsyncTest('Task 2 & 3 Runtime: CheckinController.visibilitychange extends valid session & stops stream + redirects on expiry', async () => {
        const nearExpiry = Date.now() + 60 * 60 * 1000;
        const harness = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: nearExpiry }
        });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        const ctrl = new CheckinController();
        await flushMicrotasks(40);

        // Valid session visibility return extends 7 days without redirecting
        const { stream } = makeMockStream(harness);
        ctrl.mediaStream = stream;
        ctrl.isCameraRunning = true;
        globalThis.document.hidden = false;
        for (const fn of (globalThis.document._listeners['visibilitychange'] || [])) {
            await fn();
        }
        const extended = JSON.parse(harness.store.get('bma_checkin_session_user_v2_7'));
        assert.ok(extended.expires_at > nearExpiry + (5 * 24 * 60 * 60 * 1000), 'visibilitychange must extend session by 7 days');
        assert.strictEqual(harness.redirects.length, 0, 'Must not redirect when valid');
        assert.strictEqual(ctrl.isCameraRunning, true, 'Live camera stream must keep running');

        // Expired session visibility return stops stream and redirects
        harness.store.set('bma_checkin_session_user_v2_7', JSON.stringify({
            id: 'U1',
            personnel_id: 'P1',
            role: 'User',
            expires_at: Date.now() - 5000
        }));
        for (const fn of (globalThis.document._listeners['visibilitychange'] || [])) {
            await fn();
        }
        assert.strictEqual(harness.trackStoppedCount, 1, 'Expired session must stop active camera track');
        assert.strictEqual(harness.redirects.length, 1, 'Expired session on visibilitychange must redirect');
    });

    await runAsyncTest('Task 2 & 3 Runtime: #handleMainCheckin() renews valid session 7 days & blocks expired session (including disable_normal_hours_checkin=true)', async () => {
        for (const disableNormal of [false, true]) {
            const nearExpiry = Date.now() + 60 * 60 * 1000;
            const harness = setupBrowserHarness({
                initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: nearExpiry },
                settingsOverride: {
                    disable_normal_hours_checkin: disableNormal,
                    standard_check_in: '00:00',
                    standard_check_out: '23:59'
                }
            });
            const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
            const ctrl = new CheckinController();
            await flushMicrotasks(40);
            assert.strictEqual(ctrl.settings.disable_normal_hours_checkin, disableNormal, 'Mock settings loaded accurately');

            // 1) Valid near-expiry session gets renewed by +7 days on submit attempt
            harness.store.set('bma_checkin_session_user_v2_7', JSON.stringify({
                id: 'U1',
                personnel_id: 'P1',
                role: 'User',
                expires_at: nearExpiry
            }));
            harness.getOrCreateElem('btnSubmitCheckinMain').click();
            await flushMicrotasks(25);
            const renewed = JSON.parse(harness.store.get('bma_checkin_session_user_v2_7'));
            assert.ok(renewed.expires_at > nearExpiry + (5 * 24 * 60 * 60 * 1000), `disable_normal_hours_checkin=${disableNormal}: valid submit must renew session 7 days`);
            assert.strictEqual(harness.redirects.length, 0, 'Valid session must not redirect');

            // 2) Expired session is blocked & redirected BEFORE normal-hours check
            harness.swalCalls.length = 0;
            harness.store.set('bma_checkin_session_user_v2_7', JSON.stringify({
                id: 'U1',
                personnel_id: 'P1',
                role: 'User',
                expires_at: Date.now() - 2000
            }));

            harness.getOrCreateElem('btnSubmitCheckinMain').click();
            await flushMicrotasks(25);

            assert.ok(harness.swalCalls.some(c => String(c.title).includes('เซสชันหมดอายุ')), `disable_normal_hours_checkin=${disableNormal}: must alert session expired`);
            assert.strictEqual(harness.redirects.length, 1, `disable_normal_hours_checkin=${disableNormal}: must redirect`);
            assert.strictEqual(harness.dbWrites.length, 0, 'Must perform zero DB writes');
        }
    });

    await runAsyncTest('Task 2 & 3 Runtime: #handleSubmitSpecialRequest() renews valid session 7 days & blocks expired session', async () => {
        const nearExpiry = Date.now() + 60 * 60 * 1000;
        const harness = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: nearExpiry }
        });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        const ctrl = new CheckinController();
        await flushMicrotasks(40);

        const modalSp = harness.getOrCreateElem('modalSpecialRequest');
        modalSp.classList.remove('hidden');

        // 1) Valid near-expiry session gets renewed by +7 days (validation returns early before DB write)
        harness.store.set('bma_checkin_session_user_v2_7', JSON.stringify({
            id: 'U1',
            personnel_id: 'P1',
            role: 'User',
            expires_at: nearExpiry
        }));
        harness.getOrCreateElem('spRemarkSelect').value = 'อื่นๆ';
        harness.getOrCreateElem('spCustomRemarkInput').value = '';
        const form = harness.getOrCreateElem('formSpecialRequest');
        for (const fn of (form.listeners['submit'] || [])) {
            await fn({ preventDefault: () => {} });
        }
        const renewed = JSON.parse(harness.store.get('bma_checkin_session_user_v2_7'));
        assert.ok(renewed.expires_at > nearExpiry + (5 * 24 * 60 * 60 * 1000), 'Valid special request submit must renew session 7 days');
        assert.strictEqual(harness.redirects.length, 0, 'Valid session must not redirect');

        // 2) Expired session closes modal, alerts, and redirects
        harness.swalCalls.length = 0;
        harness.store.set('bma_checkin_session_user_v2_7', JSON.stringify({
            id: 'U1',
            personnel_id: 'P1',
            role: 'User',
            expires_at: Date.now() - 2000
        }));

        for (const fn of (form.listeners['submit'] || [])) {
            await fn({ preventDefault: () => {} });
        }

        assert.strictEqual(modalSp.classList.contains('hidden'), true, 'Special request modal must close on expired session');
        assert.ok(harness.swalCalls.some(c => String(c.title).includes('เซสชันหมดอายุ')), 'Must alert session expired');
        assert.strictEqual(harness.redirects.length, 1, 'Must redirect to login');
        assert.strictEqual(harness.dbWrites.length, 0, 'Must perform zero DB writes');
    });

    await runAsyncTest('Task 2 & 3 Runtime: AppLayout visibilitychange extends valid session & redirects on expiry', async () => {
        const nearExpiry = Date.now() + 60 * 60 * 1000;
        const adminUser = { id: 'A1', personnel_id: 'PA1', role: 'SuperAdmin', expires_at: nearExpiry };
        const harness = setupBrowserHarness({
            initialUser: adminUser,
            trackIntervals: true
        });
        try {
            const { AppLayout } = await import('../../assets/js/components/AppLayout.js');
            let realtimeSyncFired = 0;
            globalThis.window.addEventListener('bma:realtime-sync', () => { realtimeSyncFired++; });

            AppLayout.initAdminRealtimeSync(adminUser);
            const visListeners = globalThis.document._listeners['visibilitychange'] || [];
            assert.ok(visListeners.length > 0, 'AppLayout must register visibilitychange listener');

            // Valid session return
            globalThis.document.hidden = false;
            visListeners.forEach(fn => fn());
            await flushMicrotasks(10);
            const extended = JSON.parse(harness.store.get('bma_checkin_session_user_v2_7'));
            assert.ok(extended.expires_at > nearExpiry + (5 * 24 * 60 * 60 * 1000), 'AppLayout must extend session by 7 days');
            assert.strictEqual(realtimeSyncFired, 1, 'Must dispatch bma:realtime-sync when active');
            assert.strictEqual(harness.redirects.length, 0, 'Must not redirect while active');

            // Expired session return
            harness.store.set('bma_checkin_session_user_v2_7', JSON.stringify({
                id: 'A1',
                role: 'SuperAdmin',
                expires_at: Date.now() - 1000
            }));
            visListeners.forEach(fn => fn());
            assert.strictEqual(harness.redirects.length, 1, 'AppLayout must redirect when session expired');
            assert.strictEqual(realtimeSyncFired, 1, 'Must not fire realtime sync after expiry');
        } finally {
            harness.cleanup();
        }
    });

    // =========================================================================
    // GROUP D: Task 4 & 5 — checkin.html, Bubbling, #checkCameraHardware & Camera
    // =========================================================================
    runTest('Task 4 & 5 Static: checkin.html sr-only input, hint banner, and zero DOM IDs removed vs HEAD / adr_004', () => {
        const checkinHtml = fs.readFileSync('checkin.html', 'utf8');
        const inputMatch = checkinHtml.match(/<input[^>]*id="cameraFallbackFileInput"[^>]*>/);
        assert.ok(inputMatch, 'Missing #cameraFallbackFileInput');
        assert.ok(/\bclass="[^"]*\bsr-only\b[^"]*"/.test(inputMatch[0]), '#cameraFallbackFileInput must have class sr-only');
        assert.ok(!/\bclass="[^"]*\bhidden\b[^"]*"/.test(inputMatch[0]), '#cameraFallbackFileInput must NOT have class hidden');

        assert.ok(checkinHtml.includes('id="cameraPermissionHintBanner"'), 'Missing #cameraPermissionHintBanner');
        assert.ok(checkinHtml.includes('id="cameraPermissionHintText"'), 'Missing #cameraPermissionHintText');

        const headHtml = execFileSync('git', ['show', 'HEAD:checkin.html'], { encoding: 'utf8' });
        const getIds = (src) => new Set([...src.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]));
        const headIds = getIds(headHtml);
        const curIds = getIds(checkinHtml);
        const removed = [...headIds].filter(id => !curIds.has(id));
        assert.deepStrictEqual(removed, [], `DOM IDs removed vs HEAD: ${removed.join(', ')}`);

        // Verify all 30 adr_004 IDs that existed in HEAD remain intact in working checkin.html
        const adr004Src = fs.readFileSync('second_brain_vault/01_architecture_decisions/adr_004_checkin_viewport_lock_and_drawer.md', 'utf8');
        const adrIds = [...new Set([...adr004Src.matchAll(/`([A-Za-z][A-Za-z0-9_]+)`/g)].map(m => m[1]))]
            .filter(id => !['100dvh', '100vh', 'checkin', 'html', 'CheckinController', 'js', 'bma', 'theme', 'css', 'FLOW_CHECKIN_01', 'FLOW_LAYOUT_01', 'FLOW_SPECIAL_REQ_01', 'SuperAdmin', 'Admin'].includes(id));
        const adrInHead = adrIds.filter(id => headIds.has(id));
        assert.strictEqual(adrInHead.length, 30, 'Expected 30 adr_004 DOM IDs present in HEAD');
        const adrRemovedNow = adrInHead.filter(id => !curIds.has(id));
        assert.deepStrictEqual(adrRemovedNow, [], `adr_004 DOM IDs removed in working copy: ${adrRemovedNow.join(', ')}`);
    });

    await runAsyncTest('Task 4 & 5 Runtime: Event bubbling guard on #cameraFallbackFileInput & #photoPreviewCard + #handleFallbackFileSelected', async () => {
        const harness = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 }
        });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        const ctrl = new CheckinController();
        await flushMicrotasks(40);

        // 1) Click on #cameraFallbackFileInput stops propagation before reaching #photoPreviewCard
        const fallbackInput = harness.getOrCreateElem('cameraFallbackFileInput');
        const card = harness.getOrCreateElem('photoPreviewCard');
        const evt = fallbackInput.click();
        await flushMicrotasks(20);
        assert.strictEqual(evt._propagationStopped, true, 'fallbackInput click must call e.stopPropagation()');
        assert.strictEqual(harness.gumCalls.length, 0, 'Clicking fallbackInput must NOT re-enter #openFullscreenCamera');

        // 2) Direct bubbling simulation onto #photoPreviewCard with target inside #cameraFallbackFileInput
        card.dispatchEvent({ type: 'click', target: fallbackInput });
        await flushMicrotasks(20);
        assert.strictEqual(harness.gumCalls.length, 0, '#photoPreviewCard must ignore events from #cameraFallbackFileInput');

        // 3) #handleFallbackFileSelected closes visible Swal, renders preview, and resets fileInput.value
        harness.swalVisible = true;
        fallbackInput.value = 'C:\\fakepath\\selfie.jpg';
        fallbackInput.files = [{ name: 'selfie.jpg' }];
        fallbackInput.dispatchEvent({ type: 'change', target: fallbackInput });
        await flushMicrotasks(40);
        assert.strictEqual(harness.swalClosedCount, 1, '#handleFallbackFileSelected must call Swal.close() when visible');
        assert.strictEqual(harness.canvasDrawCalls, 1, 'Image drawn to 3:4 canvas');
        assert.ok(ctrl.capturedPhotoDataUrl.startsWith('data:image/jpeg;base64,'), 'capturedPhotoDataUrl set');
        assert.strictEqual(fallbackInput.value, '', 'fileInput.value reset after success');

        // 4) reader.onerror resets fileInput.value and alerts
        harness.failFileReader = true;
        fallbackInput.value = 'C:\\fakepath\\bad_read.jpg';
        fallbackInput.files = [{ name: 'bad_read.jpg' }];
        fallbackInput.dispatchEvent({ type: 'change', target: fallbackInput });
        await flushMicrotasks(30);
        assert.strictEqual(fallbackInput.value, '', 'fileInput.value reset on reader.onerror');
        assert.ok(harness.swalCalls.some(c => String(c.title).includes('ไม่สามารถอ่านไฟล์รูปภาพได้')), 'Alert shown on reader.onerror');

        // 5) img.onerror resets fileInput.value and alerts
        harness.failFileReader = false;
        harness.failImageLoad = true;
        harness.swalCalls.length = 0;
        fallbackInput.value = 'C:\\fakepath\\corrupt.txt';
        fallbackInput.files = [{ name: 'corrupt.txt' }];
        fallbackInput.dispatchEvent({ type: 'change', target: fallbackInput });
        await flushMicrotasks(30);
        assert.strictEqual(fallbackInput.value, '', 'fileInput.value reset on img.onerror');
        assert.ok(harness.swalCalls.some(c => String(c.title).includes('ไม่สามารถอ่านไฟล์รูปภาพได้')), 'Alert shown on img.onerror');
    });

    await runAsyncTest('Task 4 & 5 Runtime: #checkCameraHardware() covers all 4 branches accurately', async () => {
        const harness = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 }
        });

        // Build an in-memory ESM bridge for the exact CheckinController.js source so we execute #checkCameraHardware() directly
        const rawSrc = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');
        const resolvedSrc = rawSrc
            .replace(/from '\.\.\/core\/([^']+)'/g, (_, f) => `from '${pathToFileURL(path.resolve('assets/js/core', f)).href}'`)
            .replace(/from '\.\.\/models\/([^']+)'/g, (_, f) => `from '${pathToFileURL(path.resolve('assets/js/models', f)).href}'`)
            .replace('async #checkCameraHardware() {', 'async qaCheckCameraHardware() { return await this.#checkCameraHardware(); }\n    async #checkCameraHardware() {');
        const dataUrl = 'data:text/javascript;base64,' + Buffer.from(resolvedSrc, 'utf8').toString('base64');
        const { CheckinController: BridgedCtrl } = await import(dataUrl);
        const ctrl = new BridgedCtrl();
        await flushMicrotasks(40);

        // Branch 1: No getUserMedia -> false
        Object.defineProperty(globalThis, 'navigator', {
            value: { userAgent: 'test', mediaDevices: undefined },
            configurable: true,
            writable: true
        });
        assert.strictEqual(await ctrl.qaCheckCameraHardware(), false, 'No mediaDevices -> false');

        // Branch 2: Non-empty devices WITH videoinput -> true
        Object.defineProperty(globalThis, 'navigator', {
            value: {
                userAgent: 'test',
                mediaDevices: {
                    getUserMedia: async () => {},
                    enumerateDevices: async () => [{ kind: 'audioinput' }, { kind: 'videoinput' }]
                }
            },
            configurable: true,
            writable: true
        });
        assert.strictEqual(await ctrl.qaCheckCameraHardware(), true, 'Devices with videoinput -> true');

        // Branch 3: Non-empty devices WITHOUT videoinput -> false
        Object.defineProperty(globalThis, 'navigator', {
            value: {
                userAgent: 'test',
                mediaDevices: {
                    getUserMedia: async () => {},
                    enumerateDevices: async () => [{ kind: 'audioinput' }, { kind: 'audiooutput' }]
                }
            },
            configurable: true,
            writable: true
        });
        assert.strictEqual(await ctrl.qaCheckCameraHardware(), false, 'Devices without videoinput -> false');

        // Branch 4a: Empty array [] (Brave/Safari anti-fingerprinting) -> true
        Object.defineProperty(globalThis, 'navigator', {
            value: {
                userAgent: 'test',
                mediaDevices: {
                    getUserMedia: async () => {},
                    enumerateDevices: async () => []
                }
            },
            configurable: true,
            writable: true
        });
        assert.strictEqual(await ctrl.qaCheckCameraHardware(), true, 'Empty enumerateDevices [] -> true');

        // Branch 4b: Throwing enumerateDevices() -> true
        Object.defineProperty(globalThis, 'navigator', {
            value: {
                userAgent: 'test',
                mediaDevices: {
                    getUserMedia: async () => {},
                    enumerateDevices: async () => { throw new Error('Anti-fingerprint error'); }
                }
            },
            configurable: true,
            writable: true
        });
        const origWarn = console.warn;
        console.warn = () => {};
        try {
            assert.strictEqual(await ctrl.qaCheckCameraHardware(), true, 'Throwing enumerateDevices -> true');
        } finally {
            console.warn = origWarn;
        }
    });

    await runAsyncTest('Task 4 & 5 Runtime: Sync LINE fallback (fullscreen & OnDemand) + allow_gallery_fallback=false behavior', async () => {
        // 1) Fullscreen LINE fallback=true -> sync click before await
        const harnessA = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari Line/14.1.0'
        });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        new CheckinController();
        await flushMicrotasks(40);

        harnessA.getOrCreateElem('photoPreviewCard').click();
        assert.strictEqual(harnessA.fallbackClickCount, 1, 'LINE fallbackInput.click() must execute synchronously before await');
        assert.strictEqual(harnessA.gumCalls.length, 0, 'LINE must not invoke getUserMedia when fallback is enabled');

        // 2) OnDemand LINE fallback=true -> sync click before await, keeps standby overlay
        const harnessB = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Mobile Safari/537.36 Line/14.1.0'
        });
        const ctrlB = new CheckinController();
        await flushMicrotasks(40);
        ctrlB.capturedPhotoDataUrl = '';
        ctrlB.gpsData = { ready: true, lat: 13.7563, lng: 100.5018, locationName: 'สำนักเทศกิจ', zoomLevel: 19 };
        harnessB.getOrCreateElem('btnNextStepCheckin').click();
        assert.strictEqual(harnessB.fallbackClickCount, 1, 'OnDemand LINE fallbackInput.click() must run synchronously before await');
        assert.strictEqual(harnessB.gumCalls.length, 0, 'OnDemand LINE must not invoke getUserMedia when fallback enabled');
        assert.strictEqual(harnessB.getOrCreateElem('cameraStandbyOverlay').classList.contains('hidden'), false, 'Standby overlay preserved');

        // 3) LINE allow_gallery_fallback=false -> must NOT auto-click fallbackInput
        const harnessC = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari Line/14.1.0',
            settingsOverride: { allow_gallery_fallback: false },
            mediaDevices: null
        });
        new CheckinController();
        await flushMicrotasks(40);
        harnessC.getOrCreateElem('photoPreviewCard').click();
        await flushMicrotasks(25);
        assert.strictEqual(harnessC.fallbackClickCount, 0, 'LINE with allow_gallery_fallback=false must not silently click fallbackInput');
        assert.strictEqual(harnessC.swalCalls.length, 1, 'Unsupported guidance modal shown when no getUserMedia');
        assert.ok(!String(harnessC.swalCalls[0].html || '').includes('<label for="cameraFallbackFileInput"'), 'No <label> fallback when disabled');
    });

    await runAsyncTest('Task 4 & 5 Runtime: Cancel-while-pending allows reopen (gumCalls=2) and stops stale stream', async () => {
        const resolvers = [];
        const streams = [];
        const harness = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            getUserMediaImpl: () => new Promise((resolve) => resolvers.push(resolve))
        });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        const ctrl = new CheckinController();
        await flushMicrotasks(40);

        // 1) Open session 1 (pending)
        harness.getOrCreateElem('photoPreviewCard').click();
        assert.strictEqual(harness.gumCalls.length, 1, '1st getUserMedia called');
        assert.strictEqual(ctrl.isCameraOpening, true);

        // 2) Cancel while pending -> immediately reopen
        harness.getOrCreateElem('btnCloseFullscreenCamera').click();
        assert.strictEqual(ctrl.isCameraOpening, false, 'Cancel must clear isCameraOpening');
        harness.getOrCreateElem('photoPreviewCard').click();
        assert.strictEqual(harness.gumCalls.length, 2, 'Reopen after cancel must call getUserMedia a 2nd time (gumCalls=2)');

        // 3) Resolve stale stream1 then active stream2
        const s1 = makeMockStream(harness, { id: 's1' });
        const s2 = makeMockStream(harness, { id: 's2' });
        streams.push(s1, s2);
        resolvers[0](s1.stream);
        await flushMicrotasks(20);
        assert.strictEqual(s1.track.readyState, 'ended', 'Stale stream1 must be stopped immediately');

        resolvers[1](s2.stream);
        await flushMicrotasks(20);
        assert.strictEqual(ctrl.mediaStream, s2.stream, 'Active stream must be stream2');
        assert.strictEqual(ctrl.isCameraRunning, true);
    });

    await runAsyncTest('Task 4 & 5 Runtime: Cancelled NotReadableError skips 300ms 2nd call (nrCalls=1)', async () => {
        const harness = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            getUserMediaImpl: async () => {
                const err = new Error('Hardware busy');
                err.name = 'NotReadableError';
                throw err;
            }
        });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        const ctrl = new CheckinController();
        await flushMicrotasks(40);

        harness.getOrCreateElem('photoPreviewCard').click();
        await flushMicrotasks(40); // Inside 300ms retry delay
        assert.strictEqual(harness.gumCalls.length, 1, 'Only 1st call made so far');

        harness.getOrCreateElem('btnCloseFullscreenCamera').click();
        await flushMicrotasks(360); // Wait past 300ms delay

        assert.strictEqual(harness.gumCalls.length, 1, 'Cancelled NotReadableError must skip 2nd getUserMedia call (nrCalls=1)');
        assert.strictEqual(harness.swalCalls.length, 0, 'Cancelled session must not pop guidance modal');
    });

    await runAsyncTest('Task 4 & 5 Runtime: NotAllowedError has zero retries, zero silent click, 4-browser steps & allowFallback gating', async () => {
        const profiles = [
            {
                name: 'Brave Android',
                ua: 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
                isBrave: true,
                mustInclude: ['Brave (Android)', 'ตลอดไป', 'Forget me when I close this site', 'ปรับแต่ง'],
                mustExclude: []
            },
            {
                name: 'Chrome Android',
                ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
                isBrave: false,
                mustInclude: ['Chrome (Android)', 'อนุญาตขณะเข้าชมเว็บไซต์', 'ปรับแต่ง'],
                mustExclude: []
            },
            {
                name: 'Safari iOS',
                ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
                isBrave: false,
                mustInclude: ['Safari (iOS)', 'aA', 'เมนูหน้าเว็บ', 'การตั้งค่าเว็บไซต์', 'อนุญาต', 'Safari'],
                mustExclude: ['"ถาม"']
            },
            {
                name: 'Chrome iOS',
                ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.6723.90 Mobile/15E148 Safari/604.1',
                isBrave: false,
                mustInclude: ['Chrome (iOS)', 'Page Info', 'Always Allow', 'Safari'],
                mustExclude: []
            }
        ];

        for (const allowFallback of [true, false]) {
            for (const p of profiles) {
                const harness = setupBrowserHarness({
                    initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
                    userAgent: p.ua,
                    isBrave: p.isBrave,
                    settingsOverride: { allow_gallery_fallback: allowFallback },
                    getUserMediaImpl: async () => {
                        const err = new Error('Permission denied');
                        err.name = 'NotAllowedError';
                        throw err;
                    }
                });
                const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
                const ctrl = new CheckinController();
                await flushMicrotasks(40);
                assert.strictEqual(ctrl.settings.allow_gallery_fallback, allowFallback, 'Mock allow_gallery_fallback loaded accurately');

                harness.getOrCreateElem('photoPreviewCard').click();
                await flushMicrotasks(30);

                assert.strictEqual(harness.gumCalls.length, 1, `${p.name} (fallback=${allowFallback}): NotAllowedError must NEVER retry`);
                assert.strictEqual(harness.fallbackClickCount, 0, `${p.name} (fallback=${allowFallback}): NotAllowedError must NEVER silently click fallbackInput`);
                assert.strictEqual(harness.swalCalls.length, 1, `${p.name}: Guidance modal must open`);

                const html = harness.swalCalls[0].html || '';
                for (const tok of p.mustInclude) {
                    assert.ok(html.includes(tok), `${p.name}: guidance missing '${tok}'`);
                }
                for (const bad of p.mustExclude) {
                    assert.ok(!html.includes(bad), `${p.name}: guidance must NOT include '${bad}'`);
                }
                if (allowFallback) {
                    assert.ok(html.includes('<label for="cameraFallbackFileInput"'), `${p.name}: must include <label for="cameraFallbackFileInput"> when allow_gallery_fallback=true`);
                } else {
                    assert.ok(!html.includes('<label for="cameraFallbackFileInput"'), `${p.name}: must hide <label for="cameraFallbackFileInput"> when allow_gallery_fallback=false`);
                }
            }
        }
    });

    await runAsyncTest('Task 4 & 5 Runtime: OverconstrainedError / ConstraintNotSatisfiedError fallback & NotReadableError 2nd-try success', async () => {
        for (const errName of ['OverconstrainedError', 'ConstraintNotSatisfiedError']) {
            const harness = setupBrowserHarness({
                initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
                getUserMediaImpl: async (constraints, callIdx) => {
                    if (callIdx === 1) {
                        const err = new Error(errName);
                        err.name = errName;
                        throw err;
                    }
                    return makeMockStream(harness).stream;
                }
            });
            const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
            const ctrl = new CheckinController();
            await flushMicrotasks(40);

            harness.getOrCreateElem('photoPreviewCard').click();
            await flushMicrotasks(30);

            assert.strictEqual(harness.gumCalls.length, 2, `${errName} must trigger 1 fallback getUserMedia`);
            assert.deepStrictEqual(harness.gumCalls[1], { video: { facingMode: 'user' }, audio: false });
            assert.strictEqual(ctrl.isCameraRunning, true);
        }

        // NotReadableError succeeds on 2nd attempt after 300ms
        const harnessNR = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            getUserMediaImpl: async (_c, callIdx) => {
                if (callIdx === 1) {
                    const e = new Error('Busy');
                    e.name = 'NotReadableError';
                    throw e;
                }
                return makeMockStream(harnessNR).stream;
            }
        });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        const ctrlNR = new CheckinController();
        await flushMicrotasks(40);
        harnessNR.getOrCreateElem('photoPreviewCard').click();
        await flushMicrotasks(360);
        assert.strictEqual(harnessNR.gumCalls.length, 2, 'NotReadableError retries once after 300ms');
        assert.strictEqual(ctrlNR.isCameraRunning, true, 'Camera starts when 2nd NotReadableError retry succeeds');
        assert.strictEqual(harnessNR.swalCalls.length, 0, 'No error modal when 2nd retry succeeds');
    });

    await runAsyncTest('Task 4 & 5 Runtime: NotReadableError -> NotAllowedError retry preserves hardware_busy classification', async () => {
        const harness = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            getUserMediaImpl: async (_constraints, callIdx) => {
                if (callIdx === 1) {
                    const e1 = new Error('Busy');
                    e1.name = 'NotReadableError';
                    throw e1;
                }
                const e2 = new Error('WebKit user activation expired');
                e2.name = 'NotAllowedError';
                throw e2;
            }
        });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        const ctrl = new CheckinController();
        await flushMicrotasks(40);

        harness.getOrCreateElem('photoPreviewCard').click();
        await flushMicrotasks(380);

        assert.strictEqual(harness.gumCalls.length, 2, 'Must retry once after 300ms');
        assert.strictEqual(harness.swalCalls.length, 1);
        assert.strictEqual(harness.swalCalls[0].title, 'กล้องกำลังถูกใช้งานอยู่', 'Must preserve hardware_busy title instead of permission_denied');
    });

    await runAsyncTest('Task 4 & 5 Runtime: Safari permissions.query TypeError triggers 120ms banner & stale query does not overwrite newer session', async () => {
        // Subcase A: Safari TypeError on permissions.query -> 120ms banner appears without breaking getUserMedia
        let resolveGum;
        const harnessA = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
            permissions: { query: () => { throw new TypeError("camera is not a valid PermissionName"); } },
            getUserMediaImpl: () => new Promise(r => { resolveGum = r; })
        });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        const ctrlA = new CheckinController();
        await flushMicrotasks(40);

        const bannerA = harnessA.getOrCreateElem('cameraPermissionHintBanner');
        harnessA.getOrCreateElem('photoPreviewCard').click();
        assert.strictEqual(harnessA.gumCalls.length, 1, 'getUserMedia must run even if permissions.query throws TypeError');
        assert.strictEqual(bannerA.classList.contains('hidden'), true, 'Banner initially hidden before 120ms');
        await flushMicrotasks(150);
        assert.strictEqual(bannerA.classList.contains('hidden'), false, '120ms timer must reveal Safari hint banner');
        resolveGum(makeMockStream(harnessA).stream);
        await flushMicrotasks(20);
        assert.strictEqual(bannerA.classList.contains('hidden'), true, 'Banner hides once video plays');

        // Subcase B: Stale permissions.query from session 1 does NOT hide session 2 banner
        let resolveStalePerm;
        let callPermIdx = 0;
        const harnessB = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            permissions: {
                query: () => {
                    callPermIdx++;
                    if (callPermIdx === 1) return new Promise(r => { resolveStalePerm = r; });
                    return Promise.resolve({ state: 'prompt' });
                }
            },
            getUserMediaImpl: () => new Promise(() => {}) // keep pending
        });
        const ctrlB = new CheckinController();
        await flushMicrotasks(40);

        const bannerB = harnessB.getOrCreateElem('cameraPermissionHintBanner');
        // Session 1 starts (slow permissions.query)
        harnessB.getOrCreateElem('photoPreviewCard').click();
        // Cancel Session 1 and immediately start Session 2 ('prompt')
        harnessB.getOrCreateElem('btnCloseFullscreenCamera').click();
        harnessB.getOrCreateElem('photoPreviewCard').click();
        await flushMicrotasks(20);
        assert.strictEqual(bannerB.classList.contains('hidden'), false, 'Session 2 prompt banner visible');

        // Now Session 1 stale query resolves with 'granted'
        resolveStalePerm({ state: 'granted' });
        await flushMicrotasks(20);
        assert.strictEqual(bannerB.classList.contains('hidden'), false, 'Stale Session 1 permissions.query must NOT hide Session 2 banner');
    });

    await runAsyncTest('Task 4 & 5 Runtime: track.onended & visibilitychange dead-track reset + #openCameraOnDemand()', async () => {
        const streams = [];
        const harness = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            getUserMediaImpl: async () => {
                const pair = makeMockStream(harness);
                streams.push(pair);
                return pair.stream;
            }
        });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        const ctrl = new CheckinController();
        await flushMicrotasks(40);

        // 1) Open fullscreen camera and trigger track.onended
        harness.getOrCreateElem('photoPreviewCard').click();
        await flushMicrotasks(20);
        assert.strictEqual(ctrl.isCameraRunning, true);
        assert.strictEqual(harness.getOrCreateElem('modalFullscreenCamera').classList.contains('hidden'), false);
        const staleOnended = streams[0].track.onended;
        assert.strictEqual(typeof staleOnended, 'function', 'track.onended handler must be attached');

        streams[0].track.onended();
        assert.strictEqual(streams[0].track.onended, null, 'track.onended must be cleared during cleanup');
        assert.strictEqual(ctrl.isCameraRunning, false, 'track.onended resets isCameraRunning');
        assert.strictEqual(ctrl.mediaStream, null, 'track.onended clears mediaStream');
        assert.strictEqual(harness.getOrCreateElem('modalFullscreenCamera').classList.contains('hidden'), true, 'track.onended closes modal');

        // 2) Reopen, mark track readyState='ended' silently (no onended), trigger visibilitychange
        harness.getOrCreateElem('photoPreviewCard').click();
        await flushMicrotasks(20);
        assert.strictEqual(ctrl.isCameraRunning, true);
        streams[1].track.readyState = 'ended';
        globalThis.document.hidden = false;
        for (const fn of (globalThis.document._listeners['visibilitychange'] || [])) {
            await fn();
        }
        assert.strictEqual(ctrl.isCameraRunning, false, 'visibilitychange dead-track check resets isCameraRunning');
        assert.strictEqual(ctrl.mediaStream, null, 'visibilitychange dead-track check clears mediaStream');
        assert.strictEqual(harness.getOrCreateElem('modalFullscreenCamera').classList.contains('hidden'), true, 'visibilitychange dead-track closes modal');

        // 3) Stale track.onended must NOT stop newer stream
        harness.getOrCreateElem('photoPreviewCard').click();
        await flushMicrotasks(20);
        assert.strictEqual(ctrl.isCameraRunning, true);
        staleOnended(); // Old queued track handler fires late
        assert.strictEqual(ctrl.isCameraRunning, true, 'Stale track.onended must not stop active stream');

        // 4) visibilitychange while isModalOpen && isCameraOpening must NOT stop pending camera prompt
        harness.getOrCreateElem('btnCloseFullscreenCamera').click();
        const pendingHarness = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            getUserMediaImpl: () => new Promise(() => {})
        });
        const pendingCtrl = new CheckinController();
        await flushMicrotasks(40);
        pendingHarness.getOrCreateElem('photoPreviewCard').click();
        assert.strictEqual(pendingCtrl.isCameraOpening, true);
        assert.strictEqual(pendingHarness.getOrCreateElem('modalFullscreenCamera').classList.contains('hidden'), false);
        globalThis.document.hidden = false;
        for (const fn of (globalThis.document._listeners['visibilitychange'] || [])) {
            await fn();
        }
        assert.strictEqual(pendingCtrl.isCameraOpening, true, 'visibilitychange must NOT interrupt pending camera opening');
        assert.strictEqual(pendingHarness.getOrCreateElem('modalFullscreenCamera').classList.contains('hidden'), false, 'Modal remains open while permission prompt is pending');

        // 5) #openCameraOnDemand() via #btnNextStepCheckin (Step 2)
        const step2Harness = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            getUserMediaImpl: async () => makeMockStream(step2Harness).stream
        });
        const step2Ctrl = new CheckinController();
        await flushMicrotasks(40);
        step2Ctrl.capturedPhotoDataUrl = '';
        step2Ctrl.gpsData = { ready: true, lat: 13.7563, lng: 100.5018, locationName: 'สำนักเทศกิจ', zoomLevel: 19 };
        step2Harness.getOrCreateElem('btnNextStepCheckin').click();
        await flushMicrotasks(30);
        assert.strictEqual(step2Harness.gumCalls.length, 1, '#openCameraOnDemand invoked via Step 2');
        assert.strictEqual(step2Ctrl.isCameraRunning, true, '#openCameraOnDemand starts camera stream');
        assert.strictEqual(step2Harness.getOrCreateElem('btnCapturePhoto').classList.contains('hidden'), false, '#openCameraOnDemand reveals capture button');
    });

    await runAsyncTest('Task 4 & 5 Runtime: #openCameraOnDemand() NotAllowedError has zero retries & shows tailored guidance', async () => {
        const harness = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
            isBrave: true,
            getUserMediaImpl: async () => {
                const err = new Error('Denied');
                err.name = 'NotAllowedError';
                throw err;
            }
        });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        const ctrl = new CheckinController();
        await flushMicrotasks(40);

        ctrl.capturedPhotoDataUrl = '';
        ctrl.gpsData = { ready: true, lat: 13.7563, lng: 100.5018, locationName: 'สำนักเทศกิจ', zoomLevel: 19 };
        harness.getOrCreateElem('btnNextStepCheckin').click();
        await flushMicrotasks(30);

        assert.strictEqual(harness.gumCalls.length, 1, '#openCameraOnDemand NotAllowedError must NEVER retry');
        assert.strictEqual(harness.fallbackClickCount, 0, '#openCameraOnDemand NotAllowedError must NEVER silently click fallbackInput');
        assert.strictEqual(harness.getOrCreateElem('cameraStandbyOverlay').classList.contains('hidden'), false, 'Standby overlay visible on failure');
        assert.strictEqual(harness.swalCalls.length, 1, 'Guidance modal shown on #openCameraOnDemand NotAllowedError');
        assert.ok(harness.swalCalls[0].html.includes('Brave (Android)') && harness.swalCalls[0].html.includes('<label for="cameraFallbackFileInput"'), 'Guidance modal has Brave steps and <label> trigger');
    });

    await runAsyncTest('Task 4 & 5 Runtime: PermissionDeniedError, NotFoundError, and unsupported getUserMedia across fullscreen & OnDemand', async () => {
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');

        // 1) PermissionDeniedError -> zero retries
        const hPerm = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            getUserMediaImpl: async () => {
                const e = new Error('Denied');
                e.name = 'PermissionDeniedError';
                throw e;
            }
        });
        new CheckinController();
        await flushMicrotasks(40);
        hPerm.getOrCreateElem('photoPreviewCard').click();
        await flushMicrotasks(30);
        assert.strictEqual(hPerm.gumCalls.length, 1, 'PermissionDeniedError must never retry');
        assert.strictEqual(hPerm.swalCalls[0]?.title, 'กรุณาอนุญาตการใช้กล้อง');

        // 2) NotFoundError -> not_found modal gated by allow_gallery_fallback
        for (const allowFallback of [true, false]) {
            const hNF = setupBrowserHarness({
                initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
                settingsOverride: { allow_gallery_fallback: allowFallback },
                getUserMediaImpl: async () => {
                    const e = new Error('No device');
                    e.name = 'NotFoundError';
                    throw e;
                }
            });
            new CheckinController();
            await flushMicrotasks(40);
            hNF.getOrCreateElem('photoPreviewCard').click();
            await flushMicrotasks(30);
            assert.strictEqual(hNF.gumCalls.length, 1, 'NotFoundError must not retry');
            assert.strictEqual(hNF.fallbackClickCount, 0, 'NotFoundError must not auto-click hidden input');
            assert.strictEqual(hNF.swalCalls[0]?.title, 'ไม่พบกล้องบนอุปกรณ์นี้');
            assert.strictEqual(String(hNF.swalCalls[0]?.html || '').includes('<label for="cameraFallbackFileInput"'), allowFallback);
        }

        // 3) Unsupported (!navigator.mediaDevices.getUserMedia) in OnDemand mode
        const hUnsup = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            mediaDevices: {}
        });
        const ctrlUnsup = new CheckinController();
        await flushMicrotasks(40);
        ctrlUnsup.capturedPhotoDataUrl = '';
        ctrlUnsup.gpsData = { ready: true, lat: 13.7563, lng: 100.5018, locationName: 'สำนักเทศกิจ', zoomLevel: 19 };
        hUnsup.getOrCreateElem('btnNextStepCheckin').click();
        await flushMicrotasks(30);
        assert.strictEqual(hUnsup.swalCalls[0]?.title, 'เบราว์เซอร์ไม่รองรับการเปิดกล้อง');
        assert.strictEqual(hUnsup.getOrCreateElem('cameraStandbyOverlay').classList.contains('hidden'), false);
    });

    await runAsyncTest('Task 4 & 5 Adversarial Defect A: Stale Session 1 resolving must NOT hide Session 2 active #cameraPermissionHintBanner', async () => {
        const resolvers = [];
        const harness = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
            permissions: { query: () => { throw new TypeError('Safari camera PermissionName unsupported'); } },
            getUserMediaImpl: () => new Promise((resolve) => resolvers.push(resolve))
        });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        const ctrl = new CheckinController();
        await flushMicrotasks(40);

        const banner = harness.getOrCreateElem('cameraPermissionHintBanner');

        // Session 1 starts -> cancelled -> Session 2 starts immediately
        harness.getOrCreateElem('photoPreviewCard').click();
        harness.getOrCreateElem('btnCloseFullscreenCamera').click();
        harness.getOrCreateElem('photoPreviewCard').click();
        assert.strictEqual(harness.gumCalls.length, 2, 'Session 2 getUserMedia started');

        // Wait past 120ms so Session 2 hint banner is actively displayed while awaiting Safari permission prompt
        await flushMicrotasks(160);
        assert.strictEqual(banner.classList.contains('hidden'), false, 'Precondition: Session 2 hint banner is visible after 120ms');

        // Stale Session 1 resolves while Session 2 is STILL pending on the prompt
        const s1 = makeMockStream(harness, { id: 'stale_s1' });
        resolvers[0](s1.stream);
        await flushMicrotasks(20);

        assert.strictEqual(s1.track.readyState, 'ended', 'Stale stream 1 stopped');
        assert.strictEqual(banner.classList.contains('hidden'), false, 'DEFECT (CheckinController.js:2265): Stale Session 1 hid Session 2 active #cameraPermissionHintBanner');
    });

    await runAsyncTest('Task 4 & 5 Adversarial Defect B: isCameraOpening must be false while #showCameraGuidanceModal is open / closing', async () => {
        const harness = setupBrowserHarness({
            initialUser: { id: 'U1', personnel_id: 'P1', role: 'User', expires_at: Date.now() + 86400000 },
            holdSwalOpen: true,
            getUserMediaImpl: async () => {
                const err = new Error('Denied');
                err.name = 'NotAllowedError';
                throw err;
            }
        });
        const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
        const ctrl = new CheckinController();
        await flushMicrotasks(40);

        harness.getOrCreateElem('photoPreviewCard').click();
        await flushMicrotasks(30);

        assert.strictEqual(harness.swalVisible, true, 'Guidance Swal modal is open');
        assert.strictEqual(ctrl.isCameraOpening, false, 'DEFECT (CheckinController.js:2317): ctrl.isCameraOpening remained true while guidance modal is open/closing');
    });

    // =========================================================================
    // GROUP E: Task 6 — User Manual Verification
    // =========================================================================
    runTest('Task 6 Static: docs/manual/manual-user.html updated for 4 browsers, Tune/Sliders, Safari iOS (NO "ถาม" option)', () => {
        const lines = fs.readFileSync('docs/manual/manual-user.html', 'utf8').split(/\r?\n/);
        const line203 = lines[202] || '';
        const line434 = lines[433] || '';
        const sec4Block = lines.slice(439, 472).join('\n');
        const faqQ1Block = lines.slice(1033, 1053).join('\n');

        assert.ok(line203.includes('Brave') && line203.includes('Chrome') && line203.includes('Safari'), 'Line 203 mentions Brave, Chrome, Safari');
        assert.ok(line434.includes('Session 7 วัน') && line434.includes('Brave'), 'Line 434 mentions Session 7 วัน and Brave');
        assert.ok(sec4Block.includes('Brave (Android)') && sec4Block.includes('ตลอดไป') && sec4Block.includes('Forget me when I close this site'), 'Sec 4 covers Brave Android');
        assert.ok(sec4Block.includes('Chrome (Android)') && sec4Block.includes('อนุญาตขณะเข้าชมเว็บไซต์'), 'Sec 4 covers Chrome Android');
        assert.ok(sec4Block.includes('Safari (iOS)') && sec4Block.includes('aA') && sec4Block.includes('ไอคอนเมนูหน้าเว็บ [สี่เหลี่ยมมีขีด]') && sec4Block.includes('การตั้งค่า &gt; แอป &gt; Safari'), 'Sec 4 covers Safari iOS aA/PageMenu & iOS 18 Settings');
        assert.ok(sec4Block.includes('Chrome (iOS)') && sec4Block.includes('Always Allow'), 'Sec 4 covers Chrome iOS');

        assert.ok(faqQ1Block.includes('ไอคอนปรับแต่ง/ขีดสองขีด'), 'FAQ Q1 mentions Tune/Sliders icon');
        assert.ok(faqQ1Block.includes('Brave (Android)') && faqQ1Block.includes('อนุญาตขณะใช้งานแอปเท่านั้น'), 'FAQ Q1 covers Brave Android & OS app permissions');
        assert.ok(faqQ1Block.includes('Google Chrome (คอมพิวเตอร์ / Android)') && faqQ1Block.includes('อนุญาตขณะเข้าชมเว็บไซต์'), 'FAQ Q1 covers Chrome Android');
        assert.ok(faqQ1Block.includes('Safari (iPhone / iPad)') && faqQ1Block.includes('aA') && faqQ1Block.includes('ไอคอนเมนูหน้าเว็บ [สี่เหลี่ยมมีขีด]') && faqQ1Block.includes('การตั้งค่า (Settings) ของ iOS &gt; แอป &gt; Safari'), 'FAQ Q1 covers Safari iOS');
        assert.ok(faqQ1Block.includes('"อนุญาต" (Allow) เท่านั้น'), 'FAQ Q1 Safari uses Allow only');
        assert.ok(!faqQ1Block.includes('"ถาม"') && !sec4Block.includes('"ถาม"'), 'Manual must NOT recommend Safari "ถาม" option');
        assert.ok(faqQ1Block.includes('Google Chrome (iPhone / iPad)') && faqQ1Block.includes('Page Info &gt; Permissions &gt; Camera'), 'FAQ Q1 covers Chrome iOS');
    });

    if (activeHarnessRef) {
        activeHarnessRef.cleanup();
    }

    console.log('\n========================================================================');
    console.log(` SUMMARY: ${passedTests}/${totalTests} PASSED | ${failedTests} FAILED`);
    console.log('========================================================================');

    if (failedTests > 0) {
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('Fatal test runner failure:', err);
    process.exit(1);
});
