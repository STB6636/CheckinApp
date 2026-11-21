import fs from 'fs';
import path from 'path';

console.log('--- QA Test: GPS Searching Header & Button Lock Verification ---');

let passCount = 0;
let totalCount = 0;

function assert(condition, message) {
    totalCount++;
    if (condition) {
        passCount++;
        console.log(`[PASS] ${message}`);
    } else {
        console.error(`[FAIL] ${message}`);
    }
}

// 1. Check checkin.html DOM structure
const checkinHtml = fs.readFileSync('checkin.html', 'utf8');
assert(checkinHtml.includes('id="gpsCardHeaderTitle"'), 'checkin.html contains #gpsCardHeaderTitle');
assert(checkinHtml.includes('id="gpsCardHeaderSpinner"'), 'checkin.html contains #gpsCardHeaderSpinner');
assert(checkinHtml.includes('id="gpsCardHeaderInfoIcon"'), 'checkin.html contains #gpsCardHeaderInfoIcon');
assert(checkinHtml.includes('id="gpsLocationNameText"'), 'checkin.html contains #gpsLocationNameText');
assert(checkinHtml.includes('<span id="gpsCardHeaderTitle">พื้นที่ใกล้เคียง</span>'), 'Header title is "พื้นที่ใกล้เคียง" (not redundant with "กำลังค้นหา")');
assert(checkinHtml.includes('fa-spinner fa-spin text-teal-600'), 'Spinner icon uses fa-spinner fa-spin');

// 2. Check CheckinController.js implementation
const controllerJs = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');
assert(controllerJs.includes('this.isResolvingLocation = false;'), 'CheckinController initializes isResolvingLocation = false');
assert(controllerJs.includes('this.isResolvingLocation = true;'), 'CheckinController sets isResolvingLocation = true on init');
assert(controllerJs.includes("headerTitleEl.textContent = 'พื้นที่ใกล้เคียง'"), 'CheckinController preserves "พื้นที่ใกล้เคียง" header title');
assert(controllerJs.includes("headerSpinnerEl?.classList.remove('hidden')"), 'CheckinController shows headerSpinnerEl while searching');
assert(controllerJs.includes("headerSpinnerEl?.classList.add('hidden')"), 'CheckinController hides headerSpinnerEl when resolved');
assert(controllerJs.includes("locNameEl.textContent = 'กำลังค้นหาสถานที่ใกล้เคียง...'"), 'CheckinController sets searching placeholder in locNameEl');
assert(controllerJs.includes('applyGpsSearchingLock'), 'CheckinController has applyGpsSearchingLock logic');
assert(controllerJs.includes('กำลังค้นหาสถานที่ใกล้เคียง...'), 'CheckinController sets button text to "กำลังค้นหาสถานที่ใกล้เคียง..." when searching');
assert(controllerJs.includes('btnSubmit.disabled = true;'), 'CheckinController disables btnSubmit while searching');
assert(controllerJs.includes('ระบบกำลังค้นหาสถานที่ใกล้เคียง กรุณารอสักครู่จนกว่าจะขึ้นสถานที่ใกล้เคียงก่อนกดบันทึกลงเวลา'), 'CheckinController has guard alert in #handleMainCheckin');

console.log(`\nResult: ${passCount}/${totalCount} tests passed.`);
if (passCount !== totalCount) {
    process.exit(1);
}
