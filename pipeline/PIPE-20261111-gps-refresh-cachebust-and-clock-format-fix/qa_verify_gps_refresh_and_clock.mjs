import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log(' QA Pre-flight Diagnostic: GPS Refresh Cache-Busting & Clock');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function check(desc, condition) {
    if (condition) {
        console.log(`[PASS] ${desc}`);
        passCount++;
    } else {
        console.error(`[FAIL] ${desc}`);
        failCount++;
    }
}

// 1. Inspect checkin.html
const checkinHtml = fs.readFileSync('checkin.html', 'utf8');

check('checkin.html contains #liveClockDisplay', checkinHtml.includes('id="liveClockDisplay"'));
check('checkin.html contains #btnRefreshGps', checkinHtml.includes('id="btnRefreshGps"'));
check('checkin.html contains #gpsRefreshSpinnerIcon', checkinHtml.includes('id="gpsRefreshSpinnerIcon"'));
check('checkin.html contains #gpsCardHeaderSpinner', checkinHtml.includes('id="gpsCardHeaderSpinner"'));

// 2. Inspect CheckinController.js for root causes
const controllerJs = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');

// Root Cause 1: maximumAge currently hardcoded to 30000
const hasMaximumAge30000 = controllerJs.includes('maximumAge: 30000');
check('Root Cause 1 identified: CheckinController has maximumAge: 30000 which returns cached GPS', hasMaximumAge30000);

// Root Cause 2: Clock currently formats with seconds
const hasClockSeconds = controllerJs.includes('${hh}:${mm}:${ss} น.');
check('Target 2 identified: CheckinController formats clock with ${hh}:${mm}:${ss} น.', hasClockSeconds);

// Root Cause 3: btnRefreshGps currently does not pass forceRefresh
const refreshGpsListener = controllerJs.slice(controllerJs.indexOf('btnRefreshGps'));
const refreshGpsBlock = refreshGpsListener.slice(0, 300);
check('Root Cause 3 identified: btnRefreshGps currently calls #initGpsLocation() without forceRefresh', refreshGpsBlock.includes('await this.#initGpsLocation();'));

// 3. Inspect AttendanceModel.js for cache clear capabilities
const modelJs = fs.readFileSync('assets/js/models/AttendanceModel.js', 'utf8');
check('AttendanceModel has clearLocationCache method', modelJs.includes('clearLocationCache()'));
check('AttendanceModel supports bypassCache option', modelJs.includes('!opts.bypassCache'));

// 4. Test Clock Formatter Logic
function formatTimeHHmm(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm} น.`;
}

const testDate = new Date(2026, 10, 11, 13, 45, 29);
const formatted = formatTimeHHmm(testDate);
check('Clock Formatter logic produces HH:mm น. without seconds (13:45 น.)', formatted === '13:45 น.');

console.log(`\nDiagnostic summary: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) process.exit(1);
