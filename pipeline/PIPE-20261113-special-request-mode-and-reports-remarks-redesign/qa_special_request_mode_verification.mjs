/**
 * QA Verification Suite: PIPE-20261113-special-request-mode-and-reports-remarks-redesign
 * 
 * Tests:
 * 1. DOM verification for #modalSpecialRequest in checkin.html:
 *    - Segmented buttons (spModeOnsite, spModeOffsite)
 *    - Offsite reason container and select (spOffsiteReasonContainer, spOffsiteReasonSelect)
 *    - Existing DOM IDs preserved intact
 * 2. CheckinController logic:
 *    - #initModalSpecialRequest and mode switching logic
 *    - #handleSubmitSpecialRequest passing location_mode, check_out_location_mode, offsite_reason, distance
 * 3. AttendanceModel logic:
 *    - submitSpecialRequest checkout coordinates reference checkin coordinates + jitter
 *    - persistence of location_mode, check_out_location_mode, offsite_reason, check_out_offsite_reason, distance
 *    - getSpecialRequests select query includes dedicated columns
 * 4. ReportsController logic:
 *    - #resolveReportRemark for special requests renders 2 lines (Line 1: กรณีพิเศษ, Line 2: reason)
 *    - Web DOM, Print PDF, and Excel export sync
 *    - #resolveLocationMode for special requests inherits check-in mode when check_out_location_mode is null
 *    - Zero raw lat/lng coordinate numbers in Web View, Print PDF, and Excel
 * 5. Cache Version & BuildId synchronization across 8 HTML files
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✅ [PASS] ${testName}`);
    } else {
        failedTests++;
        failures.push({ testName, details });
        console.error(`  ❌ [FAIL] ${testName} - ${details}`);
    }
}

console.log('======================================================================');
console.log('🧪 Starting Special Request Mode & Reports Remarks Redesign QA Suite');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: DOM Verification for checkin.html
// -----------------------------------------------------------------------------
console.log('▶️ Suite 1: checkin.html DOM Structure & Elements');
{
    const checkinHtml = fs.readFileSync(path.resolve('checkin.html'), 'utf8');

    assert(checkinHtml.includes('id="spModeOnsite"'), 'Test 1.1: spModeOnsite button exists in checkin.html');
    assert(checkinHtml.includes('id="spModeOffsite"'), 'Test 1.2: spModeOffsite button exists in checkin.html');
    assert(checkinHtml.includes('id="spOffsiteReasonContainer"'), 'Test 1.3: spOffsiteReasonContainer exists in checkin.html');
    assert(checkinHtml.includes('id="spOffsiteReasonSelect"'), 'Test 1.4: spOffsiteReasonSelect exists in checkin.html');

    // Verify existing DOM IDs preserved
    const mandatoryIds = [
        'modalSpecialRequest',
        'btnCloseSpecialModal',
        'formSpecialRequest',
        'spWorkDate',
        'spShiftSelect',
        'spCustomTimeContainer',
        'spCustomCheckin',
        'spCustomCheckout',
        'spRemarkSelect',
        'spGpsModeCurrent',
        'spGpsModeCustom',
        'spCurrentGpsBox',
        'spCurrentCoordsText',
        'spCurrentLocNameText',
        'spCustomGpsBox',
        'spMapSearchInput',
        'btnSpMapSearch',
        'spMapSearchResults',
        'spLeafletMap',
        'spCustomCoordsDisplay',
        'spCustomLocNameDisplay',
        'btnCancelSpecialModal',
        'btnSubmitSpecialModal'
    ];

    for (const id of mandatoryIds) {
        assert(checkinHtml.includes(`id="${id}"`), `Test 1.5: Preserved mandatory DOM ID "${id}"`);
    }
}

// -----------------------------------------------------------------------------
// Suite 2: Controller & Model Syntax Checks
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 2: JavaScript Syntax Verification');
{
    try {
        execSync('node --check assets/js/controllers/CheckinController.js');
        assert(true, 'Test 2.1: CheckinController.js syntax check passed');
    } catch (e) {
        assert(false, 'Test 2.1: CheckinController.js syntax error', e.message);
    }

    try {
        execSync('node --check assets/js/models/AttendanceModel.js');
        assert(true, 'Test 2.2: AttendanceModel.js syntax check passed');
    } catch (e) {
        assert(false, 'Test 2.2: AttendanceModel.js syntax error', e.message);
    }

    try {
        execSync('node --check assets/js/controllers/ReportsController.js');
        assert(true, 'Test 2.3: ReportsController.js syntax check passed');
    } catch (e) {
        assert(false, 'Test 2.3: ReportsController.js syntax error', e.message);
    }
}

// -----------------------------------------------------------------------------
// Suite 3: CheckinController Static Analysis
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 3: CheckinController Implementation Audit');
{
    const checkinCtrlCode = fs.readFileSync(path.resolve('assets/js/controllers/CheckinController.js'), 'utf8');

    assert(checkinCtrlCode.includes('#initModalSpecialRequest()'), 'Test 3.1: CheckinController defines #initModalSpecialRequest');
    assert(checkinCtrlCode.includes('this.specialModalLocationMode = \'ONSITE\';'), 'Test 3.2: specialModalLocationMode defaults to ONSITE');
    assert(checkinCtrlCode.includes('location_mode: locationMode'), 'Test 3.3: #handleSubmitSpecialRequest transmits location_mode');
    assert(checkinCtrlCode.includes('check_out_location_mode: locationMode'), 'Test 3.4: #handleSubmitSpecialRequest transmits check_out_location_mode');
    assert(checkinCtrlCode.includes('offsite_reason: offsiteReason'), 'Test 3.5: #handleSubmitSpecialRequest transmits offsite_reason');
    assert(checkinCtrlCode.includes('check_out_offsite_reason: offsiteReason'), 'Test 3.6: #handleSubmitSpecialRequest transmits check_out_offsite_reason');
    assert(checkinCtrlCode.includes('distance_from_official_meters: distanceMeters'), 'Test 3.7: #handleSubmitSpecialRequest transmits distance_from_official_meters');
}

// -----------------------------------------------------------------------------
// Suite 4: AttendanceModel Static Analysis
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 4: AttendanceModel Implementation Audit');
{
    const modelCode = fs.readFileSync(path.resolve('assets/js/models/AttendanceModel.js'), 'utf8');

    assert(modelCode.includes('let outLat = payload.lat ?? null;'), 'Test 4.1: submitSpecialRequest check-out lat strictly references check-in lat');
    assert(modelCode.includes('let outLng = payload.lng ?? null;'), 'Test 4.2: submitSpecialRequest check-out lng strictly references check-in lng');
    assert(modelCode.includes('settings.randomize_gps_checkout'), 'Test 4.3: submitSpecialRequest checks settings.randomize_gps_checkout');
    assert(modelCode.includes('location_mode: locMode,'), 'Test 4.4: submitSpecialRequest sets location_mode');
    assert(modelCode.includes('check_out_location_mode: outLocMode,'), 'Test 4.5: submitSpecialRequest sets check_out_location_mode');
    assert(modelCode.includes('offsite_reason: offReason,'), 'Test 4.6: submitSpecialRequest sets offsite_reason');
    assert(modelCode.includes('check_out_offsite_reason: outOffReason,'), 'Test 4.7: submitSpecialRequest sets check_out_offsite_reason');
    assert(modelCode.includes('check_out_location_mode, check_out_offsite_reason'), 'Test 4.8: getSpecialRequests select query includes check_out_location_mode and check_out_offsite_reason');
    assert(modelCode.includes("location_mode: log?.location_mode || 'ONSITE'"), 'Test 4.9: AttendanceModel.#formatReportRow maps location_mode');
    assert(modelCode.includes("check_out_location_mode: log?.check_out_location_mode || (log?.is_special_request ? (log?.location_mode || 'ONSITE') : (log?.check_out_time ? 'ONSITE' : null))"), 'Test 4.10: AttendanceModel.#formatReportRow inherits location_mode for special requests when check_out_location_mode is null');
    assert(modelCode.includes("check_out_offsite_reason: log?.check_out_offsite_reason || (log?.is_special_request ? (log?.offsite_reason || null) : null)"), 'Test 4.11: AttendanceModel.#formatReportRow inherits offsite_reason for special requests');
    assert(modelCode.includes("check_out_lat: log?.check_out_lat ?? (log?.is_special_request ? (log?.check_in_lat ?? null) : null)"), 'Test 4.12: AttendanceModel.#formatReportRow check_out_lat inherits check_in_lat for special requests');
}

// -----------------------------------------------------------------------------
// Suite 5: ReportsController Dynamic Test Harness Evaluation
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 5: ReportsController Functional Evaluation (Web, PDF, Excel)');
{
    const reportsPath = path.resolve('assets/js/controllers/ReportsController.js');
    let reportsCode = fs.readFileSync(reportsPath, 'utf8');

    reportsCode = reportsCode.replace(/#([a-zA-Z0-9_]+)/g, '_$1');
    reportsCode = reportsCode.replace(/import\s+.*?from\s+.*?;/g, '');
    reportsCode = reportsCode.replace(/export\s+class\s+ReportsController/, 'class ReportsControllerHarness');
    reportsCode = reportsCode.replace(/if\s*\(!window\.__BMA_SPA_ROUTER_ACTIVE__\)[\s\S]*$/, '');

    const harnessScript = reportsCode + '\nreturn ReportsControllerHarness;';
    const createHarnessClass = new Function(
        'Config',
        'UIHelpers',
        'AppLayout',
        'SettingsModel',
        'PersonnelModel',
        'AttendanceModel',
        'AuthService',
        'DOMDiffHelper',
        harnessScript
    );

    const mockUIHelpers = {
        formatPosition: (title, level, type) => [title, level, type ? `(${type})` : ''].filter(Boolean).join(' '),
        formatTime24: (t) => t,
        formatThaiShortDate: (d) => d,
        formatThaiFullDate: (d) => d
    };

    const mockAuthService = {
        canEditAttendanceRecord: () => true,
        canDeleteAttendanceRecord: () => true
    };

    const ReportsControllerHarness = createHarnessClass(
        {},
        mockUIHelpers,
        {},
        {},
        {},
        {},
        mockAuthService,
        {}
    );

    const harness = Object.create(ReportsControllerHarness.prototype);
    harness.settings = {
        require_gps: true,
        official_locations: [
            {
                id: 'LOC-001',
                name: 'สำนักเทศกิจ',
                latitude: 13.733790,
                longitude: 100.468261,
                radius_meters: 180,
                is_active: true
            }
        ]
    };
    harness.canManageRecords = true;

    function buildExcelRow(controller, rec, idx = 1) {
        const inMode = controller._resolveLocationMode(rec, 'check_in');
        const inLocFormatted = controller._formatLocationName(rec.check_in_location || (rec.is_special_request ? rec.check_out_location : ''));
        let inGpsDisplay = '-';
        if (inMode) {
            const modeText = inMode === 'ONSITE' ? 'ในสถานที่' : 'นอกสถานที่';
            inGpsDisplay = (inLocFormatted && inLocFormatted !== '-') ? `${modeText}\n${inLocFormatted}` : modeText;
        }

        const outMode = controller._resolveLocationMode(rec, 'check_out');
        const outRawLoc = (rec.check_out_location || (rec.is_special_request ? rec.check_in_location : '') || '').trim();
        const outLocFormatted = controller._formatLocationName(outRawLoc);
        let outGpsDisplay = '-';
        if (outMode) {
            const modeText = outMode === 'ONSITE' ? 'ในสถานที่' : 'นอกสถานที่';
            outGpsDisplay = (outLocFormatted && outLocFormatted !== '-') ? `${modeText}\n${outLocFormatted}` : modeText;
        }

        const resolvedRemark = controller._resolveReportRemark(rec, { forExcel: true });

        return {
            'ลำดับ': idx,
            'ชื่อ-นามสกุล': rec.full_name || 'นายมนัสวี สุขใจ',
            'พิกัด GPS เข้างาน': inGpsDisplay,
            'พิกัด GPS ออกงาน': outGpsDisplay,
            'สถานะ': rec.status_label || 'ปฏิบัติงานปกติ',
            'หมายเหตุ': resolvedRemark
        };
    }

    const rawCoordsRegex = /\d{1,2}\.\d{4,}°?\s*[NSEW]?/g;

    // Test 5A: Special Request with Remark (ลืมลงเวลาปฏิบัติราชการ)
    const specialReqOnsite = {
        log_id: 'LOG-SP-001',
        full_name: 'นายมนัสวี สุขใจ',
        position_title: 'นักวิชาการคอมพิวเตอร์',
        position_level: 'ชำนาญการ',
        position_type: 'วิชาการ',
        work_date: '2026-11-13',
        shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
        check_in_time: '08:30',
        check_out_time: '16:30',
        check_in_lat: 13.733790,
        check_in_lng: 100.468261,
        check_in_location: 'สำนักเทศกิจ',
        check_out_lat: 13.733790,
        check_out_lng: 100.468261,
        check_out_location: 'สำนักเทศกิจ',
        is_special_request: true,
        location_mode: 'ONSITE',
        check_out_location_mode: 'ONSITE',
        remark: 'ลืมลงเวลาปฏิบัติราชการ',
        status_label: 'ปฏิบัติงานปกติ'
    };

    const inModeSp = harness._resolveLocationMode(specialReqOnsite, 'check_in');
    const outModeSp = harness._resolveLocationMode(specialReqOnsite, 'check_out');
    const remarkSpWeb = harness._resolveReportRemark(specialReqOnsite);
    const remarkSpExcel = harness._resolveReportRemark(specialReqOnsite, { forExcel: true });
    const webHtmlSp = harness._buildSingleRowHtml(specialReqOnsite, 1, false);
    const pdfHtmlSp = harness._buildSingleRowHtml(specialReqOnsite, 1, true);
    const excelRowSp = buildExcelRow(harness, specialReqOnsite, 1);

    assert(inModeSp === 'ONSITE', 'Test 5.1: Special request inMode is ONSITE');
    assert(outModeSp === 'ONSITE', 'Test 5.2: Special request outMode is ONSITE');
    assert(remarkSpWeb.includes('กรณีพิเศษ') && remarkSpWeb.includes('ลืมลงเวลาปฏิบัติราชการ'), 'Test 5.3: Web remark displays 2-line format (กรณีพิเศษ + ลืมลงเวลาปฏิบัติราชการ)');
    assert(remarkSpExcel === 'กรณีพิเศษ\nลืมลงเวลาปฏิบัติราชการ', 'Test 5.4: Excel remark matches 2-line format "กรณีพิเศษ\\nลืมลงเวลาปฏิบัติราชการ"');
    assert(webHtmlSp.includes('กรณีพิเศษ') && webHtmlSp.includes('ลืมลงเวลาปฏิบัติราชการ'), 'Test 5.5: Web HTML includes both lines in Remark column');
    assert(pdfHtmlSp.includes('กรณีพิเศษ') && pdfHtmlSp.includes('ลืมลงเวลาปฏิบัติราชการ'), 'Test 5.6: Print PDF includes both lines in Remark column');
    assert(excelRowSp['หมายเหตุ'] === 'กรณีพิเศษ\nลืมลงเวลาปฏิบัติราชการ', 'Test 5.7: Excel row remark matches expected format');
    assert(!rawCoordsRegex.test(webHtmlSp), 'Test 5.8: Zero raw coordinates in Web HTML');
    assert(!rawCoordsRegex.test(pdfHtmlSp), 'Test 5.9: Zero raw coordinates in Print PDF');

    // Test 5B: Special Request Check-out Mode Inheritance when check_out_location_mode is null
    const specialReqLegacyNullCheckoutMode = {
        log_id: 'LOG-SP-002',
        full_name: 'นายมนัสวี สุขใจ',
        is_special_request: true,
        location_mode: 'ONSITE',
        check_out_location_mode: null, // Legacy null field
        check_in_lat: 13.733790,
        check_in_lng: 100.468261,
        check_out_lat: 13.733790,
        check_out_lng: 100.468261,
        remark: 'โทรศัพท์/อุปกรณ์ขัดข้อง'
    };

    const outModeInherited = harness._resolveLocationMode(specialReqLegacyNullCheckoutMode, 'check_out');
    assert(outModeInherited === 'ONSITE', 'Test 5.10: Check-out mode inherits ONSITE from check-in when check_out_location_mode is null');

    const specialReqOffsiteInherited = {
        log_id: 'LOG-SP-003',
        full_name: 'นายมนัสวี สุขใจ',
        is_special_request: true,
        location_mode: 'OFFSITE',
        check_out_location_mode: null,
        check_in_lat: 13.750000,
        check_in_lng: 100.520000,
        check_out_lat: 13.750000,
        check_out_lng: 100.520000,
        remark: 'ไปประชุม / สัมมนา / ฝึกอบรม'
    };

    const outModeOffsiteInherited = harness._resolveLocationMode(specialReqOffsiteInherited, 'check_out');
    assert(outModeOffsiteInherited === 'OFFSITE', 'Test 5.11: Check-out mode inherits OFFSITE from check-in when check_out_location_mode is null');

    // Test 5C: Special Request with empty remark shows "กรณีพิเศษ"
    const specialReqEmptyRemark = {
        log_id: 'LOG-SP-004',
        is_special_request: true,
        location_mode: 'ONSITE',
        remark: ''
    };
    const remarkEmptyWeb = harness._resolveReportRemark(specialReqEmptyRemark);
    const remarkEmptyExcel = harness._resolveReportRemark(specialReqEmptyRemark, { forExcel: true });
    assert(remarkEmptyWeb.includes('กรณีพิเศษ'), 'Test 5.12: Special request with empty remark displays "กรณีพิเศษ" in Web');
    assert(remarkEmptyExcel === 'กรณีพิเศษ', 'Test 5.13: Special request with empty remark displays "กรณีพิเศษ" in Excel');

    // Test 5D: Regular Onsite & Offsite records preserve their rules
    const regularOnsite = {
        log_id: 'LOG-REG-001',
        location_mode: 'ONSITE',
        remark: 'ในสถานที่',
        is_special_request: false
    };
    assert(harness._resolveReportRemark(regularOnsite) === '-', 'Test 5.14: Regular onsite record remark is "-"');

    const regularOffsite = {
        log_id: 'LOG-REG-002',
        location_mode: 'OFFSITE',
        offsite_reason: 'อบรม',
        remark: 'อบรม',
        is_special_request: false
    };
    assert(harness._resolveReportRemark(regularOffsite) === 'อบรม', 'Test 5.15: Regular offsite record remark is "อบรม"');

    // Test 5.16 & 5.17: Special request with generic remark 'ปฏิบัติงานนอกสถานที่' and specific offsite_reason resolves to specific reason
    const specialReqGenericRemark = {
        log_id: 'LOG-SP-005',
        is_special_request: true,
        location_mode: 'OFFSITE',
        remark: 'ปฏิบัติงานนอกสถานที่',
        offsite_reason: 'ไปประชุม / สัมมนา / ฝึกอบรม'
    };
    const remarkGenericWeb = harness._resolveReportRemark(specialReqGenericRemark);
    const remarkGenericExcel = harness._resolveReportRemark(specialReqGenericRemark, { forExcel: true });
    assert(remarkGenericWeb.includes('ไปประชุม / สัมมนา / ฝึกอบรม'), 'Test 5.16: Special request with generic remark resolves to specific offsite_reason on line 2 (Web)');
    assert(remarkGenericExcel === 'กรณีพิเศษ\nไปประชุม / สัมมนา / ฝึกอบรม', 'Test 5.17: Special request with generic remark resolves to specific offsite_reason on line 2 (Excel)');
}

// -----------------------------------------------------------------------------
// Suite 6: Cache Version & BuildId Synchronization
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 6: Cache Version & BuildId Synchronization');
{
    const versionPath = path.resolve('version.json');
    const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    const expectedBuildId = versionData.buildId;

    assert(Boolean(expectedBuildId), `Test 6.1: version.json contains valid buildId: ${expectedBuildId}`);

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
        const filePath = path.resolve(file);
        const htmlContent = fs.readFileSync(filePath, 'utf8');

        const buildMatch = htmlContent.match(/CURRENT_APP_BUILD\s*=\s*['"]([^'"]+)['"]/);
        assert(buildMatch && buildMatch[1] === expectedBuildId, `Test 6.2 (${file}): CURRENT_APP_BUILD matches version.json (${expectedBuildId})`);

        const assetQueryRegex = /(?:href|src)=["'](?:assets\/[^"']+\.(?:css|js))(?:\?v=([^"']+))?["']/g;
        let match;
        let fileAssetsSynced = true;
        let assetCount = 0;
        while ((match = assetQueryRegex.exec(htmlContent)) !== null) {
            assetCount++;
            if (match[1] !== expectedBuildId) {
                fileAssetsSynced = false;
            }
        }
        assert(fileAssetsSynced && assetCount > 0, `Test 6.3 (${file}): all ${assetCount} asset query parameters ?v= match buildId`);
    }
}

// -----------------------------------------------------------------------------
// Final Summary
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`📊 Test Summary: Total ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('======================================================================\n');

if (failedTests > 0) {
    console.error('❌ QA SUITE FAILED WITH FAILURES:');
    for (const f of failures) {
        console.error(`  - ${f.testName}: ${f.details}`);
    }
    process.exit(1);
} else {
    console.log(`🎉 ALL ${passedTests} ASSERTIONS PASSED WITH 100% SUCCESS!\n`);
    process.exit(0);
}
