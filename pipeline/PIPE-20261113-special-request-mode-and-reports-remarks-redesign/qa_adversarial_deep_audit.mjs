/**
 * @file pipeline/PIPE-20261113-special-request-mode-and-reports-remarks-redesign/qa_adversarial_deep_audit.mjs
 * @description Adversarial Deep Edge Case Verification Suite for Special Request Redesign
 */

import fs from 'fs';
import path from 'path';

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
console.log('🧪 Starting Adversarial Deep Edge-Case Audit');
console.log('======================================================================\n');

// 1. Setup ReportsController Harness
const reportsPath = path.resolve('assets/js/controllers/ReportsController.js');
let reportsCode = fs.readFileSync(reportsPath, 'utf8');
reportsCode = reportsCode.replace(/#([a-zA-Z0-9_]+)/g, '_$1');
reportsCode = reportsCode.replace(/import\s+.*?from\s+.*?;/g, '');
reportsCode = reportsCode.replace(/export\s+class\s+ReportsController/, 'class ReportsControllerHarness');
reportsCode = reportsCode.replace(/if\s*\(!window\.__BMA_SPA_ROUTER_ACTIVE__\)[\s\S]*$/, '');

const harnessScript = reportsCode + '\nreturn ReportsControllerHarness;';
const createHarnessClass = new Function(
    'Config', 'UIHelpers', 'AppLayout', 'SettingsModel', 'PersonnelModel', 'AttendanceModel', 'AuthService', 'DOMDiffHelper',
    harnessScript
);

const mockUIHelpers = {
    formatPosition: (t, l, ty) => [t, l, ty ? `(${ty})` : ''].filter(Boolean).join(' '),
    formatTime24: (t) => t,
    formatThaiShortDate: (d) => d,
    formatThaiFullDate: (d) => d
};

const ReportsControllerClass = createHarnessClass(
    { DEFAULT_SETTINGS: { official_locations: [{ id: 'LOC-001', name: 'สำนักเทศกิจ', latitude: 13.733790, longitude: 100.468261, radius_meters: 150 }] } },
    mockUIHelpers, {}, {}, {}, {}, { canEditAttendanceRecord: () => true, canDeleteAttendanceRecord: () => true }, {}
);

const harness = new ReportsControllerClass();
harness.settings = {
    require_gps: true,
    official_locations: [{ id: 'LOC-001', name: 'สำนักเทศกิจ', latitude: 13.733790, longitude: 100.468261, radius_meters: 150 }]
};

console.log('▶️ Suite A: Remark Formatting Under Extreme Edge Cases');

// A1: Completely null/undefined remark & offsite_reason
{
    const recNull = { log_id: 'R-01', is_special_request: true, remark: null, offsite_reason: null };
    const webHtml = harness._resolveReportRemark(recNull);
    const excelVal = harness._resolveReportRemark(recNull, { forExcel: true });
    assert(webHtml.includes('กรณีพิเศษ') && !webHtml.includes('undefined') && !webHtml.includes('null'), 'A1.1: Web remark handles null remark without undefined/null strings');
    assert(excelVal === 'กรณีพิเศษ', 'A1.2: Excel remark handles null as "กรณีพิเศษ"');
}

// A2: Whitespace only remark
{
    const recWs = { log_id: 'R-02', is_special_request: true, remark: '   ', offsite_reason: '' };
    const webHtml = harness._resolveReportRemark(recWs);
    const excelVal = harness._resolveReportRemark(recWs, { forExcel: true });
    assert(webHtml.includes('กรณีพิเศษ'), 'A2.1: Web remark handles whitespace only');
    assert(excelVal === 'กรณีพิเศษ', 'A2.2: Excel remark handles whitespace only');
}

// A3: Remark is literal status that should be suppressed (e.g. 'ปฏิบัติงานปกติ' or 'มาสาย')
{
    const recStatus = { log_id: 'R-03', is_special_request: true, remark: 'ปฏิบัติงานปกติ', offsite_reason: 'ไปราชการนอกพื้นที่' };
    const webHtml = harness._resolveReportRemark(recStatus);
    const excelVal = harness._resolveReportRemark(recStatus, { forExcel: true });
    assert(webHtml.includes('ไปราชการนอกพื้นที่'), 'A3.1: Suppresses tag status and picks valid offsite_reason for Line 2 (Web)');
    assert(excelVal === 'กรณีพิเศษ\nไปราชการนอกพื้นที่', 'A3.2: Suppresses tag status and picks valid offsite_reason for Line 2 (Excel)');
}

// A4: Remark is 'กรณีพิเศษ' itself with offsite_reason
{
    const recSelf = { log_id: 'R-04', is_special_request: true, remark: 'กรณีพิเศษ', offsite_reason: 'ลืมลงเวลาช่วงเช้า' };
    const webHtml = harness._resolveReportRemark(recSelf);
    const excelVal = harness._resolveReportRemark(recSelf, { forExcel: true });
    assert(webHtml.includes('ลืมลงเวลาช่วงเช้า'), 'A4.1: Avoids duplicate "กรณีพิเศษ" on Line 2 (Web)');
    assert(excelVal === 'กรณีพิเศษ\nลืมลงเวลาช่วงเช้า', 'A4.2: Avoids duplicate "กรณีพิเศษ" on Line 2 (Excel)');
}

// A5: HTML entity safety / special characters in remark
{
    const recSpecial = { log_id: 'R-05', is_special_request: true, remark: 'ประชุม & สัมมนา (ตึก 1)' };
    const webHtml = harness._resolveReportRemark(recSpecial);
    const excelVal = harness._resolveReportRemark(recSpecial, { forExcel: true });
    assert(webHtml.includes('ประชุม & สัมมนา (ตึก 1)'), 'A5.1: Preserves ampersand and parentheses in Web');
    assert(excelVal === 'กรณีพิเศษ\nประชุม & สัมมนา (ตึก 1)', 'A5.2: Preserves special chars in Excel');
}

console.log('\n▶️ Suite B: Location Mode Inheritance & GPS Robustness');

// B1: Special request with check_out_location_mode = null and location_mode = OFFSITE
{
    const recOff = {
        log_id: 'R-06',
        is_special_request: true,
        location_mode: 'OFFSITE',
        check_out_location_mode: null,
        check_in_lat: 13.7500,
        check_in_lng: 100.5000,
        check_out_lat: null,
        check_out_lng: null
    };
    const outMode = harness._resolveLocationMode(recOff, 'check_out');
    assert(outMode === 'OFFSITE', 'B1.1: Special request check-out mode inherits OFFSITE');
}

// B2: Special request with check_out_location_mode = null and location_mode = ONSITE
{
    const recOn = {
        log_id: 'R-07',
        is_special_request: true,
        location_mode: 'ONSITE',
        check_out_location_mode: null,
        check_in_lat: 13.733790,
        check_in_lng: 100.468261,
        check_out_lat: null,
        check_out_lng: null
    };
    const outMode = harness._resolveLocationMode(recOn, 'check_out');
    assert(outMode === 'ONSITE', 'B2.1: Special request check-out mode inherits ONSITE');
}

// B3: Special request with missing check_out_location in row
{
    const recRow = {
        log_id: 'R-08',
        is_special_request: true,
        location_mode: 'ONSITE',
        check_in_location: 'สำนักเทศกิจ',
        check_out_location: '',
        check_in_lat: 13.733790,
        check_in_lng: 100.468261,
        check_out_lat: null,
        check_out_lng: null,
        check_in_time: '08:30',
        check_out_time: '16:30',
        remark: 'ลืมลงเวลา'
    };
    const webRow = harness._buildSingleRowHtml(recRow, 1, false);
    const pdfRow = harness._buildSingleRowHtml(recRow, 1, true);
    assert(webRow.includes('สำนักเทศกิจ'), 'B3.1: Fallback uses check_in_location for check_out in Web');
    assert(pdfRow.includes('สำนักเทศกิจ'), 'B3.2: Fallback uses check_in_location for check_out in PDF');
}

console.log('\n▶️ Suite C: AttendanceModel #formatReportRow Edge Cases');

const attPath = path.resolve('assets/js/models/AttendanceModel.js');
let attCode = fs.readFileSync(attPath, 'utf8');
attCode = attCode.replace(/#([a-zA-Z0-9_]+)/g, '_$1');
attCode = attCode.replace(/import\s+.*?from\s+.*?;/g, '');
attCode = attCode.replace(/export\s+class\s+AttendanceModel/, 'class AttendanceModelHarness');

const attHarnessScript = attCode + '\nreturn AttendanceModelHarness;';
const createAttClass = new Function(
    'Config', 'DatabaseService', 'SettingsModel', 'UIHelpers', 'PersonnelModel',
    attHarnessScript
);

const AttendanceModelClass = createAttClass(
    { DEFAULT_SETTINGS: { category_colors: {} } },
    { getInstance: () => ({ client: {} }) },
    { getSettings: async () => ({}) },
    mockUIHelpers,
    {}
);

{
    const rawSpecialLog = {
        id: 'LOG-999',
        is_special_request: true,
        location_mode: 'OFFSITE',
        offsite_reason: 'ไปราชการต่างจังหวัด',
        check_in_lat: 13.7200,
        check_in_lng: 100.4500,
        check_in_location: 'ศาลากลาง',
        check_out_lat: null,
        check_out_lng: null,
        check_out_location: null,
        check_out_location_mode: null,
        check_out_offsite_reason: null,
        remark: 'ลืมบัตรลงเวลา',
        status: 'ปฏิบัติงานปกติ'
    };

    const mockPerson = { id: 'P-1', prefix: 'นาย', first_name: 'สมเกียรติ', last_name: 'กล้าหาญ', position_title: 'นักวิชาการ', position_level: 'ชำนาญการ', position_type: 'วิชาการ', organization: 'กทม.', bureau: 'สำนักเทศกิจ', division: 'สำนักงานเลขานุการ', work_group: 'งานบริหาร' };
    const mockEval = { status_key: 'normal', status_label: 'ปฏิบัติงานปกติ', row_color: '#007B3E' };
    const formatted = AttendanceModelClass._formatReportRow(mockPerson, rawSpecialLog, '2026-11-13', mockEval);
    assert(formatted.check_out_lat === 13.7200, 'C1.1: check_out_lat inherits check_in_lat for special request');
    assert(formatted.check_out_lng === 100.4500, 'C1.2: check_out_lng inherits check_in_lng for special request');
    assert(formatted.check_out_location === 'ศาลากลาง', 'C1.3: check_out_location inherits check_in_location for special request');
    assert(formatted.check_out_location_mode === 'OFFSITE', 'C1.4: check_out_location_mode inherits location_mode for special request');
    assert(formatted.check_out_offsite_reason === 'ไปราชการต่างจังหวัด', 'C1.5: check_out_offsite_reason inherits offsite_reason for special request');
}

console.log('\n======================================================================');
console.log(`📊 Deep Audit Summary: Total ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('======================================================================\n');

if (failedTests > 0) {
    process.exit(1);
} else {
    console.log('🎉 100% ALL ADVERSARIAL EDGE CASES PASSED!\n');
    process.exit(0);
}
