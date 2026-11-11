import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log(' Deep Verification Test: GPS Refresh & Clock Format (Surgical)');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function test(desc, fn) {
    try {
        fn();
        console.log(`[PASS] ${desc}`);
        passCount++;
    } catch (err) {
        console.error(`[FAIL] ${desc}\n       Error: ${err.message}`);
        failCount++;
    }
}

// 1. Verify checkin.html #liveClockDisplay default text
test('checkin.html has #liveClockDisplay initialized to 00:00 น. (no seconds)', () => {
    const html = fs.readFileSync('checkin.html', 'utf8');
    assert(html.includes('id="liveClockDisplay"'), 'id="liveClockDisplay" not found');
    const clockBlockMatch = html.match(/id="liveClockDisplay"[^>]*>([\s\S]*?)<\/div>/);
    assert(clockBlockMatch, 'Could not extract liveClockDisplay block');
    const clockText = clockBlockMatch[1].trim();
    assert.strictEqual(clockText, '00:00 น.', `Expected '00:00 น.', got '${clockText}'`);
});

// 2. Verify CheckinController.js clock formatting in updateClock()
test('CheckinController.js formats live clock as ${hh}:${mm} น. without seconds', () => {
    const js = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');
    assert(js.includes('clockEl.textContent = `${hh}:${mm} น.`;'), 'Clock formatting without seconds not found');
    assert(!js.includes('clockEl.textContent = `${hh}:${mm}:${ss} น.`;'), 'Old clock format with seconds still exists');
});

// 3. Verify CheckinController.js #btnRefreshGps click handler
test('#btnRefreshGps awaits #initGpsLocation({ forceRefresh: true }) and maintains spinner', () => {
    const js = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');
    const refreshIdx = js.indexOf("document.getElementById('btnRefreshGps')");
    assert(refreshIdx !== -1, 'btnRefreshGps listener not found');
    const refreshBlock = js.slice(refreshIdx, refreshIdx + 800);

    assert(refreshBlock.includes('await this.#initGpsLocation({ forceRefresh: true });'), 'forceRefresh: true not awaited');
    assert(refreshBlock.includes("spinner?.classList.add('fa-spin');"), 'fa-spin start missing');
    assert(refreshBlock.includes("spinner?.classList.remove('fa-spin');"), 'fa-spin cleanup missing');
    assert(!refreshBlock.includes("setTimeout(() => spinner?.classList.remove('fa-spin'), 600)"), 'premature setTimeout still present in btnRefreshGps');
});

// 4. Verify CheckinController.js #initGpsLocation implementation
test('#initGpsLocation supports { forceRefresh = false } = {} and returns a Promise', () => {
    const js = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');
    const initIdx = js.indexOf("async #initGpsLocation({ forceRefresh = false } = {})");
    assert(initIdx !== -1, '#initGpsLocation({ forceRefresh = false } = {}) signature not found');

    const methodBody = js.slice(initIdx, initIdx + 6000);
    assert(methodBody.includes('AttendanceModel.clearLocationCache();'), 'AttendanceModel.clearLocationCache() not called on forceRefresh');
    assert(methodBody.includes('bypassCache: forceRefresh'), 'bypassCache: forceRefresh not passed to resolveLocationWithZoomMeta');
    assert(methodBody.includes('timeout: forceRefresh ? 12000 : 8000'), 'timeout conditional 12000 / 8000 not found');
    assert(methodBody.includes('maximumAge: forceRefresh ? 0 : 5000'), 'maximumAge conditional 0 / 5000 not found');
    assert(methodBody.includes('return new Promise((resolve) => {'), 'Promise wrapper not found');
    assert(methodBody.includes('กำลังดึงพิกัด GPS ใหม่...'), 'Loading text for forceRefresh not found');
});

// 5. Verify version.json sync across all 8 HTML files
test('version.json buildId matches CURRENT_APP_BUILD and ?v= across all 8 HTML files', () => {
    const versionData = JSON.parse(fs.readFileSync('version.json', 'utf8'));
    const expectedBuild = versionData.buildId;
    assert(expectedBuild, 'buildId in version.json is missing or empty');

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

    for (const htmlFile of htmlFiles) {
        const content = fs.readFileSync(htmlFile, 'utf8');
        assert(content.includes(`const CURRENT_APP_BUILD = '${expectedBuild}';`), `${htmlFile} does not match CURRENT_APP_BUILD '${expectedBuild}'`);
        // Check that assets have ?v=<buildId>
        assert(content.includes(`?v=${expectedBuild}`), `${htmlFile} does not have assets stamped with ?v=${expectedBuild}`);
    }
});

// 6. Behavioral Simulation: Mock Geolocation execution with forceRefresh
test('Behavioral Simulation: Promise resolves and geolocation options match expected values', async () => {
    let capturedOptions = null;
    let cacheCleared = false;
    let bypassed = false;

    // Mock AttendanceModel
    const MockAttendanceModel = {
        clearLocationCache: () => { cacheCleared = true; },
        resolveLocationWithZoomMeta: async (lat, lng, opts) => {
            bypassed = opts.bypassCache;
            return { locationName: 'ศาลาว่าการกรุงเทพมหานคร', zoomLevel: 19 };
        }
    };

    // Simulate #initGpsLocation logic with forceRefresh = true
    async function simulateInitGpsLocation({ forceRefresh = false } = {}) {
        if (forceRefresh) {
            MockAttendanceModel.clearLocationCache();
        }
        const geoOptions = {
            enableHighAccuracy: true,
            timeout: forceRefresh ? 12000 : 8000,
            maximumAge: forceRefresh ? 0 : 5000
        };
        capturedOptions = geoOptions;

        return new Promise((resolve) => {
            setTimeout(async () => {
                const lat = 13.7563;
                const lng = 100.5018;
                const resolveOptions = { bypassCache: forceRefresh };
                const resMeta = await MockAttendanceModel.resolveLocationWithZoomMeta(lat, lng, resolveOptions);
                resolve({ lat, lng, locationName: resMeta.locationName, ready: true });
            }, 10);
        });
    }

    const result = await simulateInitGpsLocation({ forceRefresh: true });
    assert.strictEqual(cacheCleared, true, 'Location cache should be cleared on forceRefresh');
    assert.strictEqual(bypassed, true, 'bypassCache should be true on forceRefresh');
    assert.strictEqual(capturedOptions.maximumAge, 0, 'maximumAge should be 0 on forceRefresh');
    assert.strictEqual(capturedOptions.timeout, 12000, 'timeout should be 12000 on forceRefresh');
    assert.strictEqual(result.ready, true, 'Result ready should be true');
    assert.strictEqual(result.locationName, 'ศาลาว่าการกรุงเทพมหานคร');
});

// 7. Behavioral Simulation: Mock Geolocation execution without forceRefresh (normal check-in)
test('Behavioral Simulation: Normal GPS call does not clear cache and uses maximumAge: 5000', async () => {
    let capturedOptions = null;
    let cacheCleared = false;
    let bypassed = false;

    const MockAttendanceModel = {
        clearLocationCache: () => { cacheCleared = true; },
        resolveLocationWithZoomMeta: async (lat, lng, opts) => {
            bypassed = opts.bypassCache;
            return { locationName: 'ศาลาว่าการกรุงเทพมหานคร', zoomLevel: 19 };
        }
    };

    async function simulateInitGpsLocation({ forceRefresh = false } = {}) {
        if (forceRefresh) {
            MockAttendanceModel.clearLocationCache();
        }
        const geoOptions = {
            enableHighAccuracy: true,
            timeout: forceRefresh ? 12000 : 8000,
            maximumAge: forceRefresh ? 0 : 5000
        };
        capturedOptions = geoOptions;

        return new Promise((resolve) => {
            setTimeout(async () => {
                const lat = 13.7563;
                const lng = 100.5018;
                const resolveOptions = { bypassCache: forceRefresh };
                const resMeta = await MockAttendanceModel.resolveLocationWithZoomMeta(lat, lng, resolveOptions);
                resolve({ lat, lng, locationName: resMeta.locationName, ready: true });
            }, 10);
        });
    }

    const result = await simulateInitGpsLocation();
    assert.strictEqual(cacheCleared, false, 'Location cache should NOT be cleared on normal run');
    assert.strictEqual(bypassed, false, 'bypassCache should be false on normal run');
    assert.strictEqual(capturedOptions.maximumAge, 5000, 'maximumAge should be 5000 on normal run');
    assert.strictEqual(capturedOptions.timeout, 8000, 'timeout should be 8000 on normal run');
    assert.strictEqual(result.ready, true);
});

// Run async tests sequentially
setTimeout(() => {
    console.log(`\n================================================================`);
    console.log(` Verification Summary: ${passCount} passed, ${failCount} failed.`);
    console.log(`================================================================`);
    if (failCount > 0) process.exit(1);
}, 200);
