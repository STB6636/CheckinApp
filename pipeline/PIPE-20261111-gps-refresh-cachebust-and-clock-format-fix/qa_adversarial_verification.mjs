import fs from 'fs';
import assert from 'assert';

console.log('================================================================');
console.log(' Adversarial QA Test: GPS Cache Busting & Re-entrancy Resilience');
console.log('================================================================\n');

let pass = 0;
let fail = 0;

function runTest(name, fn) {
    try {
        fn();
        console.log(`[PASS] ${name}`);
        pass++;
    } catch (e) {
        console.error(`[FAIL] ${name}\n       ${e.message}`);
        fail++;
    }
}

// 1. Verify Re-entrancy Protection in btnRefreshGps listener
runTest('btnRefreshGps has re-entrancy guard (isResolvingLocation) and pointer-events disabling', () => {
    const js = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');
    const refreshIdx = js.indexOf("document.getElementById('btnRefreshGps')");
    assert(refreshIdx !== -1, 'btnRefreshGps not found');
    const block = js.slice(refreshIdx, refreshIdx + 1200);
    assert(block.includes('if (this.isResolvingLocation) return;'), 'Guard for isResolvingLocation missing');
    assert(block.includes("btn?.classList.add('pointer-events-none', 'opacity-70');"), 'Pointer events lock missing');
    assert(block.includes("btn?.classList.remove('pointer-events-none', 'opacity-70');"), 'Pointer events release missing');
});

// 2. Verify Success Toast is conditioned on res?.ready (No false positive on error)
runTest('Success toast is only shown when res?.ready is true', () => {
    const js = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');
    const refreshIdx = js.indexOf("document.getElementById('btnRefreshGps')");
    const block = js.slice(refreshIdx, refreshIdx + 1200);
    assert(block.includes('if (res?.ready) {'), 'Success toast condition res?.ready missing');
    assert(!block.includes('await this.#initGpsLocation({ forceRefresh: true });\n                UIHelpers.showToast(\'ตรวจสอบตำแหน่ง GPS ปัจจุบันสำเร็จ\', \'success\');'), 'Unconditional toast found');
});

// 3. Verify Memory State Purge in #initGpsLocation on forceRefresh
runTest('forceRefresh purges ready, lat, lng and updates geofence & step 1 validation immediately', () => {
    const js = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');
    const initIdx = js.indexOf("async #initGpsLocation({ forceRefresh = false } = {})");
    assert(initIdx !== -1, '#initGpsLocation not found');
    const block = js.slice(initIdx, initIdx + 8000);

    assert(block.includes('this.gpsData.ready = false;'), 'gpsData.ready = false missing on forceRefresh');
    assert(block.includes('this.gpsData.lat = null;'), 'gpsData.lat = null missing on forceRefresh');
    assert(block.includes('this.gpsData.lng = null;'), 'gpsData.lng = null missing on forceRefresh');
    assert(block.includes('this.#renderGeofenceStatusUI();'), 'Immediate renderGeofenceStatusUI missing');
    assert(block.includes('this.#updateStep1Validation();'), 'Immediate updateStep1Validation missing');
});

// 4. Verify Geolocation error callback cleans up coordinates and state
runTest('Geolocation error callback resets lat, lng, and locationName', () => {
    const js = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');
    const initIdx = js.indexOf("async #initGpsLocation({ forceRefresh = false } = {})");
    const block = js.slice(initIdx, initIdx + 8000);

    assert(block.includes('async (err) => {'), 'Error callback not found');
    assert(block.includes('this.gpsData.ready = false;'), 'gpsData.ready = false missing in error callback');
    assert(block.includes('this.gpsData.lat = null;'), 'gpsData.lat = null missing in error callback');
    assert(block.includes('this.gpsData.lng = null;'), 'gpsData.lng = null missing in error callback');
    assert(block.includes("this.gpsData.locationName = 'ไม่สามารถระบุสถานที่ได้';"), 'locationName fallback missing in error callback');
});

// 5. Verify Offsite current GPS button bypasses cache with forceRefresh: true
runTest('btnCurrent in offsite section uses forceRefresh: true and guards toast', () => {
    const js = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');
    const btnCurrentIdx = js.indexOf("btnCurrent?.addEventListener('click'");
    assert(btnCurrentIdx !== -1, 'btnCurrent listener not found');
    const block = js.slice(btnCurrentIdx, btnCurrentIdx + 600);

    assert(block.includes('await this.#initGpsLocation({ forceRefresh: true });'), 'btnCurrent does not use forceRefresh: true');
    assert(block.includes('if (gpsRes?.ready) {'), 'btnCurrent toast not guarded by gpsRes?.ready');
});

// 6. Verify Clock in checkin.html and CheckinController.js
runTest('Clock format is strictly HH:mm น. without seconds in HTML and JS', () => {
    const html = fs.readFileSync('checkin.html', 'utf8');
    const js = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');

    assert(!html.includes('00:00:00'), 'checkin.html contains seconds in clock placeholder');
    assert(html.includes('00:00 น.'), 'checkin.html does not contain 00:00 น.');
    assert(js.includes('clockEl.textContent = `${hh}:${mm} น.`;'), 'CheckinController does not format as ${hh}:${mm} น.');
    assert(!js.includes('clockEl.textContent = `${hh}:${mm}:${ss} น.`;'), 'CheckinController still contains seconds in live clock');
});

// 7. Verify Cache Version Sync across all 8 HTML files and version.json
runTest('version.json matches CURRENT_APP_BUILD and ?v= on all 8 HTML files', () => {
    const version = JSON.parse(fs.readFileSync('version.json', 'utf8'));
    const buildId = version.buildId;
    assert(buildId, 'Missing buildId');

    const files = ['index.html', 'checkin.html', 'dashboard.html', 'approvals.html', 'reports.html', 'personnel.html', 'settings.html', 'users.html'];
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        assert(content.includes(`const CURRENT_APP_BUILD = '${buildId}';`), `Build ID mismatch in ${file}`);
        assert(content.includes(`?v=${buildId}`), `Asset version query mismatch in ${file}`);
    }
});

console.log(`\nAdversarial QA Results: ${pass} passed, ${fail} failed.`);
if (fail > 0) process.exit(1);
