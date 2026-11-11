/**
 * QA Automated Test Suite: Checkin Camera Stream Protection & Lifecycle Fix
 * Task ID: PIPE-20261111-checkin-camera-lifecycle-fix
 * SubAgent: subagent_02_qa_auditor (Enhanced Deep Dynamic Verification)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import assert from 'node:assert';

console.log('================================================================');
console.log(' QA AUDIT SUITE: Checkin Camera Lifecycle Fix (PIPE-20261111)');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, fn) {
    totalTests++;
    try {
        fn();
        console.log(`[PASS] Test ${totalTests}: ${testName}`);
        passedTests++;
    } catch (err) {
        console.error(`[FAIL] Test ${totalTests}: ${testName}`);
        console.error(`       Error: ${err.message}`);
        failedTests++;
    }
}

async function runAsyncTest(testName, fn) {
    totalTests++;
    try {
        await fn();
        console.log(`[PASS] Test ${totalTests}: ${testName}`);
        passedTests++;
    } catch (err) {
        console.error(`[FAIL] Test ${totalTests}: ${testName}`);
        console.error(`       Error: ${err.message}`);
        failedTests++;
    }
}

// -------------------------------------------------------------
// Test 1: Syntax Verification via node --check
// -------------------------------------------------------------
runTest('Syntax Verification (node --check CheckinController.js)', () => {
    const filePath = 'assets/js/controllers/CheckinController.js';
    assert(fs.existsSync(filePath), `File does not exist: ${filePath}`);
    const output = execSync(`node --check ${filePath}`, { encoding: 'utf8' });
    assert.strictEqual(output.trim(), '', 'Syntax check produced unexpected output');
});

// -------------------------------------------------------------
// Test 2: Source Code Static Guards & Architectural Checks
// -------------------------------------------------------------
const controllerSrc = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');

runTest('VisibilityChange Guard: Prevents settings sync if camera is active or modal open', () => {
    const visibilityPattern = /document\.addEventListener\('visibilitychange',\s*async\s*\(\)\s*=>\s*\{[\s\S]*?if\s*\(!document\.hidden\)\s*\{[\s\S]*?const\s+modalCamera\s*=\s*document\.getElementById\('modalFullscreenCamera'\);[\s\S]*?if\s*\(this\.isCameraRunning\s*\|\|\s*isModalOpen\)\s*\{[\s\S]*?return;[\s\S]*?await\s+this\.#syncSettingsHotReload\(\);/;
    assert(visibilityPattern.test(controllerSrc), 'VisibilityChange listener must check isCameraRunning and isModalOpen before calling #syncSettingsHotReload()');
});

runTest('Idempotent Settings Sync: Guard against running while camera is active', () => {
    const syncGuardPattern = /async\s+#syncSettingsHotReload\(\)\s*\{[\s\S]*?const\s+modalCamera\s*=\s*document\.getElementById\('modalFullscreenCamera'\);[\s\S]*?if\s*\(this\.isCameraRunning\s*\|\|\s*isModalOpen\)\s*\{[\s\S]*?return;/;
    assert(syncGuardPattern.test(controllerSrc), '#syncSettingsHotReload must return early if isCameraRunning or modal is open');
});

runTest('Idempotent Settings Sync: Guard re-checked post async fetch against in-flight race condition', () => {
    const postAwaitGuardPattern = /const\s+fresh\s*=\s*await\s+SettingsModel\.getSettings\(true\);[\s\S]*?const\s+modalCameraNow\s*=\s*document\.getElementById\('modalFullscreenCamera'\);[\s\S]*?if\s*\(this\.isCameraRunning\s*\|\|\s*isModalOpenNow\)\s*\{[\s\S]*?return;/;
    assert(postAwaitGuardPattern.test(controllerSrc), '#syncSettingsHotReload must verify camera status again post-await before proceeding');
});

runTest('Idempotent Settings Sync: Diffing fresh settings before applying', () => {
    const diffPattern = /if\s*\(JSON\.stringify\(fresh\)\s*===\s*JSON\.stringify\(this\.settings\)\)\s*\{[\s\S]*?return;[\s\S]*?\}/;
    assert(diffPattern.test(controllerSrc), '#syncSettingsHotReload must compare JSON.stringify(fresh) === JSON.stringify(this.settings) and return early');
});

runTest('Apply Settings Guard: Protects active camera hardware stream from being stopped', () => {
    const applyGuardPattern = /const\s+isCameraActive\s*=\s*this\.isCameraRunning\s*\|\|\s*isModalOpen;[\s\S]*?if\s*\(this\.settings\.require_photo\)\s*\{[\s\S]*?if\s*\(!this\.capturedPhotoDataUrl\s*&&\s*!isCameraActive\)\s*\{[\s\S]*?this\.#stopCameraAndShowStandby\(\);[\s\S]*?\}[\s\S]*?\}\s*else\s*if\s*\(!isCameraActive\)\s*\{[\s\S]*?this\.#stopCameraHardwareStream\(\);/;
    assert(applyGuardPattern.test(controllerSrc), '#applySettingsHotReload must guard both require_photo and non-require_photo branches with !isCameraActive');
});

runTest('Fullscreen Camera: Robust constraints with fallback and video.play()', () => {
    const fallbackPattern = /try\s*\{[\s\S]*?navigator\.mediaDevices\.getUserMedia\(\{\s*video:\s*\{\s*facingMode:\s*'user',\s*width:\s*\{\s*ideal:\s*720\s*\},\s*height:\s*\{\s*ideal:\s*960\s*\}\s*\}[\s\S]*?catch\s*\(constraintErr\)\s*\{[\s\S]*?navigator\.mediaDevices\.getUserMedia\(\{\s*video:\s*\{\s*facingMode:\s*'user'\s*\}[\s\S]*?video\.play\(\)/;
    assert(fallbackPattern.test(controllerSrc), '#openFullscreenCamera must attempt ideal 720x960, catch error, fallback to {facingMode:"user"}, and call video.play()');
});

runTest('Capture Photo Guard: Validates video.readyState and dimensions before snapshot', () => {
    const readyStatePattern = /if\s*\(video\.readyState\s*<\s*2\s*\|\|\s*!video\.videoWidth\s*\|\|\s*!video\.videoHeight\)\s*\{[\s\S]*?UIHelpers\.alert\('กล้องกำลังเริ่มต้น'[\s\S]*?return;[\s\S]*?\}/;
    assert(readyStatePattern.test(controllerSrc), '#captureAndCloseCamera must check readyState < 2 || !videoWidth || !videoHeight before capturing');
});

runTest('Hardware Stream Cleanup: Safe pause before srcObject clear in #stopCameraHardwareStream', () => {
    const pausePattern = /if\s*\(video\)\s*\{[\s\S]*?try\s*\{\s*video\.pause\(\);\s*\}\s*catch\s*\(_\)\s*\{\s*\}[\s\S]*?video\.srcObject\s*=\s*null;/;
    assert(pausePattern.test(controllerSrc), '#stopCameraHardwareStream must safely call video.pause() before clearing srcObject');
});

// -------------------------------------------------------------
// Test 3: Live Dynamic CheckinController Execution & Verification
// -------------------------------------------------------------
function setupControllerHarness(options = {}) {
    const domElements = {};
    function getOrCreateElem(id) {
        if (!domElements[id]) {
            domElements[id] = {
                id,
                classList: {
                    _classes: new Set(['hidden']),
                    contains(c) { return this._classes.has(c); },
                    add(c) { this._classes.add(c); },
                    remove(c) { this._classes.delete(c); },
                    toggle(c, force) {
                        if (force !== undefined) { force ? this.add(c) : this.remove(c); return force; }
                        if (this.contains(c)) { this.remove(c); return false; } else { this.add(c); return true; }
                    }
                },
                listeners: {},
                addEventListener(t, fn) { this.listeners[t] = this.listeners[t] || []; this.listeners[t].push(fn); },
                click() { (this.listeners['click'] || []).forEach(fn => fn({ preventDefault: () => {}, stopPropagation: () => {} })); },
                play: async () => { harness.videoPlayCalls++; },
                pause: () => { harness.videoPauseCalls++; },
                value: '',
                style: {},
                srcObject: null,
                readyState: options.defaultReadyState ?? 4,
                videoWidth: options.defaultVideoWidth ?? 720,
                videoHeight: options.defaultVideoHeight ?? 960
            };
        }
        return domElements[id];
    }

    const harness = {
        domElements,
        getOrCreateElem,
        gUMCalls: [],
        videoPlayCalls: 0,
        videoPauseCalls: 0,
        trackStoppedCount: 0,
        alerts: []
    };

    function createChainableProxy(table = '') {
        return new Proxy({}, {
            get(t, prop) {
                if (prop === 'then') {
                    return (resolve) => {
                        if (table === 'system_settings') {
                            return resolve({
                                data: {
                                    id: 1,
                                    require_photo: options.requirePhoto !== false,
                                    require_gps: false,
                                    allow_gallery_fallback: options.allowGalleryFallback !== false,
                                    category_colors: {}
                                },
                                error: null
                            });
                        }
                        return resolve({ data: [], error: null });
                    };
                }
                if (prop === 'catch') return () => Promise.resolve();
                return (...args) => createChainableProxy(table);
            }
        });
    }

    const mockDb = {
        from: (table) => createChainableProxy(table),
        channel: () => ({ on: function() { return this; }, subscribe: function() { return this; } })
    };

    globalThis.window = {
        addEventListener: (t, fn) => { window._listeners[t] = window._listeners[t] || []; window._listeners[t].push(fn); },
        removeEventListener: () => {},
        scrollTo: () => {},
        location: { href: 'http://localhost/', replace: () => {} },
        history: { replaceState: () => {} },
        supabase: { createClient: () => mockDb },
        _listeners: {}
    };

    globalThis.document = {
        addEventListener: (t, fn) => { document._listeners[t] = document._listeners[t] || []; document._listeners[t].push(fn); },
        removeEventListener: () => {},
        getElementById: (id) => getOrCreateElem(id),
        querySelector: () => null,
        querySelectorAll: () => [],
        documentElement: { classList: { contains: () => false, add: () => {}, remove: () => {} } },
        hidden: false,
        _listeners: {}
    };

    const mockTrack = {
        stop: () => { harness.trackStoppedCount++; }
    };
    const mockStream = {
        getTracks: () => [mockTrack]
    };
    harness.mockStream = mockStream;
    harness.mockTrack = mockTrack;

    Object.defineProperty(globalThis, 'navigator', {
        value: {
            userAgent: options.userAgent || 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
            mediaDevices: {
                getUserMedia: async (constraints) => {
                    harness.gUMCalls.push(constraints);
                    if (options.failHighResConstraints && constraints.video.width) {
                        const err = new Error('OverconstrainedError');
                        err.name = 'OverconstrainedError';
                        throw err;
                    }
                    return mockStream;
                },
                enumerateDevices: async () => [{ kind: 'videoinput' }]
            }
        },
        configurable: true,
        writable: true
    });

    const user = { id: 'P001', role: 'User', full_name: 'Test Auditor', expires_at: Date.now() + 1000000 };
    globalThis.localStorage = { getItem: () => JSON.stringify(user), setItem: () => {}, removeItem: () => {} };
    globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

    return harness;
}

await runAsyncTest('Live Controller: Stream is NOT stopped during visibilitychange hot-reload when camera active', async () => {
    const harness = setupControllerHarness();
    const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
    const ctrl = new CheckinController();
    await new Promise(r => setTimeout(r, 60));

    // Open camera modal and establish active stream
    const card = harness.getOrCreateElem('photoPreviewCard');
    const modal = harness.getOrCreateElem('modalFullscreenCamera');
    const video = harness.getOrCreateElem('cameraVideoStream');
    card.click();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(ctrl.isCameraRunning, true, 'isCameraRunning must be true when camera open');
    assert.strictEqual(modal.classList.contains('hidden'), false, 'Modal must NOT be hidden');
    assert.strictEqual(video.srcObject, harness.mockStream, 'video.srcObject must be connected to stream');
    const initialStops = harness.trackStoppedCount;

    // Trigger visibilitychange event
    const visListeners = globalThis.document._listeners['visibilitychange'] || [];
    assert(visListeners.length > 0, 'visibilitychange listener must be registered');
    for (const fn of visListeners) {
        await fn();
    }

    assert.strictEqual(harness.trackStoppedCount, initialStops, 'MediaTrack must NOT be stopped by visibilitychange');
    assert.strictEqual(video.srcObject, harness.mockStream, 'video.srcObject must remain connected');
    assert.strictEqual(ctrl.isCameraRunning, true, 'isCameraRunning must remain true');
    assert.strictEqual(modal.classList.contains('hidden'), false, 'Modal must remain open');
});

await runAsyncTest('Live Controller: Stream is NOT stopped during bma:settings-updated broadcast while camera active', async () => {
    const harness = setupControllerHarness();
    const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
    const ctrl = new CheckinController();
    await new Promise(r => setTimeout(r, 60));

    const card = harness.getOrCreateElem('photoPreviewCard');
    const modal = harness.getOrCreateElem('modalFullscreenCamera');
    const video = harness.getOrCreateElem('cameraVideoStream');
    card.click();
    await new Promise(r => setTimeout(r, 60));

    const initialStops = harness.trackStoppedCount;

    // Broadcast settings update that turns off photo requirement
    const setListeners = globalThis.window._listeners['bma:settings-updated'] || [];
    assert(setListeners.length > 0, 'bma:settings-updated listener must be registered');
    for (const fn of setListeners) {
        fn({ detail: { require_photo: false, require_gps: false } });
    }

    assert.strictEqual(harness.trackStoppedCount, initialStops, 'MediaTrack must NOT be stopped by settings hot-reload');
    assert.strictEqual(video.srcObject, harness.mockStream, 'video.srcObject must remain connected');
    assert.strictEqual(ctrl.isCameraRunning, true, 'isCameraRunning must remain true');
    assert.strictEqual(modal.classList.contains('hidden'), false, 'Modal must remain open');
});

await runAsyncTest('Live Controller: Shutter rejects and preserves stream when readyState < 2 or dimensions 0', async () => {
    const harness = setupControllerHarness();
    const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
    const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');

    const originalAlert = UIHelpers.alert;
    const alertCalls = [];
    UIHelpers.alert = (title, text, type) => { alertCalls.push({ title, text, type }); };

    try {
        const ctrl = new CheckinController();
        await new Promise(r => setTimeout(r, 60));

        const card = harness.getOrCreateElem('photoPreviewCard');
        const modal = harness.getOrCreateElem('modalFullscreenCamera');
        const video = harness.getOrCreateElem('cameraVideoStream');
        const shutter = harness.getOrCreateElem('btnFullscreenShutter');

        // Set video to unready state
        video.readyState = 1;
        video.videoWidth = 0;
        video.videoHeight = 0;

        card.click();
        await new Promise(r => setTimeout(r, 60));

        const initialStops = harness.trackStoppedCount;

        // User taps shutter button prematurely
        shutter.click();

        assert(alertCalls.length > 0, 'UIHelpers.alert must be called');
        assert.strictEqual(alertCalls[0].title, 'กล้องกำลังเริ่มต้น', 'Alert must be "กล้องกำลังเริ่มต้น"');
        assert.strictEqual(alertCalls[0].type, 'info', 'Alert type must be info');
        assert.strictEqual(harness.trackStoppedCount, initialStops, 'Stream track must NOT be stopped on premature click');
        assert.strictEqual(video.srcObject, harness.mockStream, 'video.srcObject must remain intact');
        assert.strictEqual(ctrl.isCameraRunning, true, 'isCameraRunning must remain true');
        assert.strictEqual(modal.classList.contains('hidden'), false, 'Modal must remain open');
        assert.strictEqual(ctrl.capturedPhotoDataUrl, '', 'Photo data must not be set yet');
    } finally {
        UIHelpers.alert = originalAlert;
    }
});

await runAsyncTest('Live Controller: Shutter captures successfully when readyState === 4 and valid dimensions', async () => {
    const harness = setupControllerHarness();
    const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');
    const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');

    const originalCapture = UIHelpers.capturePortrait3x4FromVideo;
    UIHelpers.capturePortrait3x4FromVideo = () => 'data:image/jpeg;base64,mockcapturedvaliddata';

    try {
        const ctrl = new CheckinController();
        await new Promise(r => setTimeout(r, 60));

        const card = harness.getOrCreateElem('photoPreviewCard');
        const modal = harness.getOrCreateElem('modalFullscreenCamera');
        const video = harness.getOrCreateElem('cameraVideoStream');
        const shutter = harness.getOrCreateElem('btnFullscreenShutter');

        video.readyState = 4;
        video.videoWidth = 720;
        video.videoHeight = 960;

        card.click();
        await new Promise(r => setTimeout(r, 60));

        // User taps shutter button with ready stream
        shutter.click();

        assert.strictEqual(ctrl.capturedPhotoDataUrl, 'data:image/jpeg;base64,mockcapturedvaliddata', 'Photo data must be set');
        assert(harness.trackStoppedCount > 0, 'Hardware stream tracks must be stopped after capture');
        assert.strictEqual(ctrl.isCameraRunning, false, 'isCameraRunning must be reset to false');
        assert.strictEqual(modal.classList.contains('hidden'), true, 'Modal must be hidden after capture');
    } finally {
        UIHelpers.capturePortrait3x4FromVideo = originalCapture;
    }
});

await runAsyncTest('Live Controller: Fullscreen camera handles OverconstrainedError with fallback & video.play()', async () => {
    const harness = setupControllerHarness({ failHighResConstraints: true });
    const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');

    const ctrl = new CheckinController();
    await new Promise(r => setTimeout(r, 60));

    const card = harness.getOrCreateElem('photoPreviewCard');
    const modal = harness.getOrCreateElem('modalFullscreenCamera');
    const video = harness.getOrCreateElem('cameraVideoStream');

    card.click();
    await new Promise(r => setTimeout(r, 60));

    assert.strictEqual(harness.gUMCalls.length, 2, 'getUserMedia must be called twice (initial ideal + fallback)');
    assert.deepStrictEqual(harness.gUMCalls[0].video, { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } });
    assert.deepStrictEqual(harness.gUMCalls[1].video, { facingMode: 'user' });
    assert.strictEqual(harness.videoPlayCalls > 0, true, 'video.play() must be invoked');
    assert.strictEqual(ctrl.isCameraRunning, true, 'isCameraRunning must be true');
    assert.strictEqual(modal.classList.contains('hidden'), false, 'Modal must be displayed');
});

await runAsyncTest('Live Controller: Close button gracefully stops tracks and clears video.srcObject', async () => {
    const harness = setupControllerHarness();
    const { CheckinController } = await import('../../assets/js/controllers/CheckinController.js');

    const ctrl = new CheckinController();
    await new Promise(r => setTimeout(r, 60));

    const card = harness.getOrCreateElem('photoPreviewCard');
    const modal = harness.getOrCreateElem('modalFullscreenCamera');
    const video = harness.getOrCreateElem('cameraVideoStream');
    const closeBtn = harness.getOrCreateElem('btnCloseFullscreenCamera');

    card.click();
    await new Promise(r => setTimeout(r, 60));
    assert.strictEqual(ctrl.isCameraRunning, true);

    closeBtn.click();

    assert(harness.trackStoppedCount > 0, 'Tracks must be stopped on close');
    assert.strictEqual(ctrl.isCameraRunning, false, 'isCameraRunning must be reset');
    assert.strictEqual(modal.classList.contains('hidden'), true, 'Modal must be hidden');
    assert.strictEqual(video.srcObject, null, 'video.srcObject must be null');
});

// -------------------------------------------------------------
// Test 4: Cache Version Synchronization Audit
// -------------------------------------------------------------
runTest('Mandatory Cache Version Sync: version.json exists and is valid', () => {
    assert(fs.existsSync('version.json'), 'version.json does not exist');
    const versionData = JSON.parse(fs.readFileSync('version.json', 'utf8'));
    assert(versionData.buildId, 'version.json missing buildId');
    assert(versionData.contentHash, 'version.json missing contentHash');
    assert(versionData.updatedAt, 'version.json missing updatedAt');
});

runTest('Mandatory Cache Version Sync: All 8 HTML files match buildId 100%', () => {
    const versionData = JSON.parse(fs.readFileSync('version.json', 'utf8'));
    const targetBuild = versionData.buildId;
    const htmlFiles = [
        'index.html',
        'checkin.html',
        'dashboard.html',
        'approvals.html',
        'reports.html',
        'personnel.html',
        'settings.html',
        'users.html'
    ];

    for (const file of htmlFiles) {
        assert(fs.existsSync(file), `HTML file missing: ${file}`);
        const content = fs.readFileSync(file, 'utf8');

        // Check CURRENT_APP_BUILD constant
        const buildMatch = content.match(/CURRENT_APP_BUILD\s*=\s*'([^']+)'/);
        assert(buildMatch, `${file}: CURRENT_APP_BUILD declaration missing`);
        assert.strictEqual(buildMatch[1], targetBuild, `${file}: CURRENT_APP_BUILD ${buildMatch[1]} !== ${targetBuild}`);

        // Check asset query params for CSS and JS
        const assetMatches = [...content.matchAll(/(?:href|src)="assets\/[^"?]+\?v=([^"&]+)"/g)];
        assert(assetMatches.length > 0, `${file}: No stamped assets found`);
        for (const match of assetMatches) {
            assert.strictEqual(match[1], targetBuild, `${file}: Asset query param ${match[0]} has wrong build ${match[1]}`);
        }
    }
});

// -------------------------------------------------------------
// Test 5: Working Tree & Scope Audit
// -------------------------------------------------------------
runTest('Scope Audit: Working tree changes are strictly confined to expected scope', () => {
    const rawStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    const lines = rawStatus.split(/\r?\n/).map(l => l.trimEnd()).filter(Boolean);
    const allowedPatterns = [
        /^\.?ai_map\//,
        /version\.json$/,
        /assets\/js\/controllers\/CheckinController\.js$/,
        /^second_brain_vault\//,
        /pipeline\/PIPE-20261111-checkin-camera-lifecycle-fix\//,
        /(index|checkin|dashboard|approvals|reports|personnel|settings|users)\.html$/
    ];

    for (const line of lines) {
        const filePath = line.slice(3).trim();
        const isAllowed = allowedPatterns.some(pattern => pattern.test(filePath));
        assert(isAllowed, `Unintended file modification detected: ${filePath}`);
    }
});

console.log('\n================================================================');
console.log(` AUDIT SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
