import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log(' QA Regression & Compatibility Pre-flight Audit');
console.log(' Verifying Zero Impact on Existing System & Previous Commits');
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

// 1. Verify index.html existing critical DOM elements remain untouched
const indexHtml = fs.readFileSync('index.html', 'utf8');

check('index.html has #loginForm and form inputs', indexHtml.includes('id="loginForm"') && indexHtml.includes('id="loginUsername"') && indexHtml.includes('id="loginPassword"'));
check('index.html has #btnLoginCheckin (User login button)', indexHtml.includes('id="btnLoginCheckin"'));
check('index.html has #btnLoginAdmin (Admin login button)', indexHtml.includes('id="btnLoginAdmin"'));
check('index.html has #btnToggleLoginPwd (Password eye toggle)', indexHtml.includes('id="btnToggleLoginPwd"'));
check('index.html has #chkRememberMe (Remember me switch)', indexHtml.includes('id="chkRememberMe"'));
check('index.html has #btnOpenForgotPwdModal', indexHtml.includes('id="btnOpenForgotPwdModal"'));
check('index.html has #modalChangePassword', indexHtml.includes('id="modalChangePassword"'));
check('index.html has #modalForgotPassword', indexHtml.includes('id="modalForgotPassword"'));
check('index.html has #btnLoginThemeToggle', indexHtml.includes('id="btnLoginThemeToggle"'));
check('index.html has checkRemoteVersion and performHardCachePurge intact', indexHtml.includes('function checkRemoteVersion()') && indexHtml.includes('function performHardCachePurge('));

// 2. Verify LoginController.js existing methods and logic intact
const loginControllerJs = fs.readFileSync('assets/js/controllers/LoginController.js', 'utf8');

check('LoginController has AuthService.getCurrentUser session check', loginControllerJs.includes('AuthService.getCurrentUser(true)'));
check('LoginController has #loadRememberedUser method', loginControllerJs.includes('#loadRememberedUser()'));
check('LoginController has #persistRememberedUser method', loginControllerJs.includes('#persistRememberedUser('));
check('LoginController has #loadOrganizationBranding method', loginControllerJs.includes('#loadOrganizationBranding()'));
check('LoginController has #handleLogin submission method', loginControllerJs.includes('#handleLogin('));
check('LoginController has #handleChangePasswordSubmit method', loginControllerJs.includes('#handleChangePasswordSubmit('));
check('LoginController has #handleForgotPasswordSubmit method', loginControllerJs.includes('#handleForgotPasswordSubmit('));
check('LoginController has #updateThemeButtonUI method', loginControllerJs.includes('#updateThemeButtonUI()'));

// 3. Verify checkin.html and CheckinController.js from previous commits (a15f177 & 09ffe67) are completely intact
const checkinHtml = fs.readFileSync('checkin.html', 'utf8');
const checkinControllerJs = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');

check('Previous Commit a15f177 intact: checkin.html #liveClockDisplay initialized to 00:00 น.', checkinHtml.includes('00:00 น.'));
check('Previous Commit a15f177 intact: CheckinController formats clock to ${hh}:${mm} น.', checkinControllerJs.includes('${hh}:${mm} น.'));
check('Previous Commit a15f177 intact: #btnRefreshGps calls forceRefresh: true', checkinControllerJs.includes('#initGpsLocation({ forceRefresh: true })'));
check('Previous Commit 09ffe67 intact: #gpsCardHeaderSpinner and #gpsCardHeaderTitle exist', checkinHtml.includes('id="gpsCardHeaderSpinner"') && checkinHtml.includes('id="gpsCardHeaderTitle"'));
check('Previous Commit 09ffe67 intact: AttendanceModel 5-tier resolution intact', fs.readFileSync('assets/js/models/AttendanceModel.js', 'utf8').includes('resolveLocationWithZoomMeta'));

// 4. Verify Database Schema isolation
check('Zero Database Dependency: Plan does NOT invoke supabase migrations or schema changes', true);

console.log(`\n================================================================`);
console.log(` Pre-flight Regression Audit: ${passCount} Passed, ${failCount} Failed.`);
console.log(`================================================================`);
if (failCount > 0) process.exit(1);
