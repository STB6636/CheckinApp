/**
 * qa_split_dropdowns_verification.mjs
 * Verification test for split dropdowns, special request official locations, and UI components
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('--- STARTING QA VERIFICATION FOR PIPE-20261113 ---');

// 1. Verify Config.js
import { Config } from '../../assets/js/core/Config.js';
assert.ok(Array.isArray(Config.DEFAULT_SETTINGS.offsite_job_types), 'Config should have offsite_job_types');
assert.ok(Config.DEFAULT_SETTINGS.offsite_job_types.length >= 4, 'offsite_job_types should have at least 4 items');
assert.ok(Array.isArray(Config.DEFAULT_SETTINGS.special_request_reasons), 'Config should have special_request_reasons');
assert.ok(Config.DEFAULT_SETTINGS.special_request_reasons.length >= 4, 'special_request_reasons should have at least 4 items');
assert.ok(Array.isArray(Config.DEFAULT_SETTINGS.remarks), 'Config should keep remarks for backward compatibility');
console.log('✓ 1. Config.js defaults verified');

// 2. Verify settings.html
const settingsHtml = fs.readFileSync('settings.html', 'utf8');
assert.ok(settingsHtml.includes('4. คำนำหน้า, ลักษณะงาน &amp; หมายเหตุ') || settingsHtml.includes('4. คำนำหน้า, ลักษณะงาน & หมายเหตุ'), 'settings.html Tab 4 title updated');
assert.ok(settingsHtml.includes('id="prefixListContainer"'), 'settings.html has prefixListContainer');
assert.ok(settingsHtml.includes('id="btnAddPrefix"'), 'settings.html has btnAddPrefix');
assert.ok(settingsHtml.includes('id="offsiteJobTypeListContainer"'), 'settings.html has offsiteJobTypeListContainer');
assert.ok(settingsHtml.includes('id="btnAddOffsiteJobType"'), 'settings.html has btnAddOffsiteJobType');
assert.ok(settingsHtml.includes('id="specialReasonListContainer"'), 'settings.html has specialReasonListContainer');
assert.ok(settingsHtml.includes('id="btnAddSpecialReason"'), 'settings.html has btnAddSpecialReason');
console.log('✓ 2. settings.html Tab 4 structure verified (3 cards)');

// 3. Verify checkin.html
const checkinHtml = fs.readFileSync('checkin.html', 'utf8');
const spWorkDateIdx = checkinHtml.indexOf('id="spWorkDate"');
const spShiftSelectIdx = checkinHtml.indexOf('id="spShiftSelect"');
const spRemarkSelectIdx = checkinHtml.indexOf('id="spRemarkSelect"');
const spModeOnsiteIdx = checkinHtml.indexOf('id="spModeOnsite"');
const spOfficialLocSelectIdx = checkinHtml.indexOf('id="spOfficialLocationSelect"');
const spOffsiteReasonSelectIdx = checkinHtml.indexOf('id="spOffsiteReasonSelect"');

assert.ok(spWorkDateIdx > 0, 'spWorkDate exists');
assert.ok(spShiftSelectIdx > spWorkDateIdx, 'spShiftSelect is after spWorkDate');
assert.ok(spRemarkSelectIdx > spShiftSelectIdx, 'spRemarkSelect (Step 3) is after spShiftSelect');
assert.ok(spModeOnsiteIdx > spRemarkSelectIdx, 'spModeOnsite (Step 4) is after spRemarkSelect (Step 3)');
assert.ok(spOfficialLocSelectIdx > spModeOnsiteIdx, 'spOfficialLocationSelect exists in Onsite section');
assert.ok(spOffsiteReasonSelectIdx > spModeOnsiteIdx, 'spOffsiteReasonSelect exists in Offsite section');
assert.ok(checkinHtml.includes('id="offsiteRemarkSelect"'), 'checkin.html has offsiteRemarkSelect for normal checkin');
console.log('✓ 3. checkin.html form order and elements verified (Step 3 remark before Step 4 location)');

// 4. Verify SettingsController.js
const settingsCtrlJs = fs.readFileSync('assets/js/controllers/SettingsController.js', 'utf8');
assert.ok(settingsCtrlJs.includes('#renderOffsiteJobTypes()'), 'SettingsController has #renderOffsiteJobTypes');
assert.ok(settingsCtrlJs.includes('#renderSpecialReasons()'), 'SettingsController has #renderSpecialReasons');
assert.ok(settingsCtrlJs.includes('btnAddOffsiteJobType'), 'SettingsController listens to btnAddOffsiteJobType');
assert.ok(settingsCtrlJs.includes('btnAddSpecialReason'), 'SettingsController listens to btnAddSpecialReason');
assert.ok(settingsCtrlJs.includes('edit-offsite-job-type'), 'SettingsController handles edit-offsite-job-type');
assert.ok(settingsCtrlJs.includes('delete-offsite-job-type'), 'SettingsController handles delete-offsite-job-type');
assert.ok(settingsCtrlJs.includes('edit-special-reason'), 'SettingsController handles edit-special-reason');
assert.ok(settingsCtrlJs.includes('delete-special-reason'), 'SettingsController handles delete-special-reason');
console.log('✓ 4. SettingsController.js methods and handlers verified');

// 5. Verify CheckinController.js
const checkinCtrlJs = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');
assert.ok(checkinCtrlJs.includes('spOfficialLocationSelect'), 'CheckinController references spOfficialLocationSelect');
assert.ok(checkinCtrlJs.includes('spOffsiteReasonSelect'), 'CheckinController references spOffsiteReasonSelect');
assert.ok(checkinCtrlJs.includes('special_request_reasons'), 'CheckinController references special_request_reasons');
assert.ok(checkinCtrlJs.includes('offsite_job_types'), 'CheckinController references offsite_job_types');
assert.ok(checkinCtrlJs.includes('distanceMeters = 0;'), 'CheckinController sets distanceMeters = 0 for onsite special requests');
console.log('✓ 5. CheckinController.js special request logic verified');

// 6. Verify ReportsController.js remark formatting logic
const reportsCtrlJs = fs.readFileSync('assets/js/controllers/ReportsController.js', 'utf8');
assert.ok(reportsCtrlJs.includes('combinedReason = `${validRemark} (${validOffsite})`'), 'ReportsController combines validRemark and validOffsite');
console.log('✓ 6. ReportsController.js special request remark combination verified');

// 7. Verify ApprovalsController.js badge logic
const approvalsCtrlJs = fs.readFileSync('assets/js/controllers/ApprovalsController.js', 'utf8');
assert.ok(approvalsCtrlJs.includes('[ในสถานที่]'), 'ApprovalsController has [ในสถานที่] badge');
assert.ok(approvalsCtrlJs.includes('[นอกสถานที่]'), 'ApprovalsController has [นอกสถานที่] badge');
console.log('✓ 7. ApprovalsController.js badges verified');

// 8. Verify cache version sync across all 8 HTML files
const versionInfo = JSON.parse(fs.readFileSync('version.json', 'utf8'));
const buildId = versionInfo.buildId;
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
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(content.includes(`CURRENT_APP_BUILD = '${buildId}'`), `${file} contains CURRENT_APP_BUILD = '${buildId}'`);
    assert.ok(content.includes(`?v=${buildId}`), `${file} contains assets query param ?v=${buildId}`);
}
console.log(`✓ 8. Cache version sync verified across all 8 HTML files (buildId: ${buildId})`);

console.log('--- ALL QA CHECKS PASSED SUCCESSFULLY ---');
