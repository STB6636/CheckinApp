/**
 * @file pipeline/PIPE-20261113-reports-table-gps-and-remarks-redesign/qa_reports_redesign_verification.mjs
 * @description Comprehensive Automated QA Verification Suite for Reports Table GPS & Remarks Redesign
 * Pipeline Task: PIPE-20261113-reports-table-gps-and-remarks-redesign
 * Target Branch: Loca-V2
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
console.log('🧪 Starting Reports Table GPS & Remarks Redesign QA Verification Suite');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Test Harness Setup: Load ReportsController & AttendanceModel Logic
// -----------------------------------------------------------------------------
const reportsPath = path.resolve('assets/js/controllers/ReportsController.js');
let reportsCode = fs.readFileSync(reportsPath, 'utf8');

// Convert private methods/properties (#foo) to public (_foo) for test harness evaluation
reportsCode = reportsCode.replace(/#([a-zA-Z0-9_]+)/g, '_$1');
// Strip ES import/export statements
reportsCode = reportsCode.replace(/import\s+.*?from\s+.*?;/g, '');
reportsCode = reportsCode.replace(/export\s+class\s+ReportsController/, 'class ReportsControllerHarness');
// Remove DOM auto-instantiation footer
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

const harnessInstance = Object.create(ReportsControllerHarness.prototype);
harnessInstance.settings = {
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
harnessInstance.canManageRecords = true;

// Helper to simulate Excel export row generation matching ReportsController.#bindEvents
function buildExcelRow(controller, rec, idx = 1) {
    const inMode = controller._resolveLocationMode(rec, 'check_in');
    const inLocFormatted = controller._formatLocationName(rec.check_in_location || (rec.is_special_request ? rec.check_out_location : ''));
    let inGpsDisplay = '-';
    if (inMode) {
        const modeText = inMode === 'ONSITE' ? 'ในสถานที่' : 'นอกสถานที่';
        inGpsDisplay = (inLocFormatted && inLocFormatted !== '-') ? `${modeText} ${inLocFormatted}` : modeText;
    }

    const outMode = controller._resolveLocationMode(rec, 'check_out');
    const outRawLoc = (rec.check_out_location || (rec.is_special_request ? rec.check_in_location : '') || '').trim();
    const outLocFormatted = controller._formatLocationName(outRawLoc);
    let outGpsDisplay = '-';
    if (outMode) {
        const modeText = outMode === 'ONSITE' ? 'ในสถานที่' : 'นอกสถานที่';
        outGpsDisplay = (outLocFormatted && outLocFormatted !== '-') ? `${modeText} ${outLocFormatted}` : modeText;
    }

    const resolvedRemark = controller._resolveReportRemark(rec);

    return {
        'ลำดับ': idx,
        'ชื่อ-นามสกุล': rec.full_name || 'ทดสอบ บุคลากร',
        'พิกัด GPS เข้างาน': inGpsDisplay,
        'พิกัด GPS ออกงาน': outGpsDisplay,
        'สถานะ': rec.status_label || 'ปฏิบัติงานปกติ',
        'หมายเหตุ': resolvedRemark
    };
}

// Coordinate regex detector for strict prohibition of raw numbers
const rawCoordsRegex = /\d{1,2}\.\d{4,}°?\s*[NSEW]?/g;

// -----------------------------------------------------------------------------
// Test Case 1: Onsite Regular Check-in
// -----------------------------------------------------------------------------
console.log('▶️ Test Case 1 (Onsite Regular Check-in): Rule 2.1.1 & GPS formatting');
{
    const rec1 = {
        log_id: 'LOG-001',
        full_name: 'นายสมชาย ใจดี',
        position_title: 'เจ้าพนักงานเทศกิจ',
        position_level: 'ชำนาญงาน',
        position_type: 'ทั่วไป',
        work_date: '2026-11-13',
        shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
        check_in_time: '08:25',
        check_in_lat: 13.733790,
        check_in_lng: 100.468261,
        check_in_location: 'สำนักเทศกิจ',
        check_out_time: '',
        check_out_lat: null,
        check_out_lng: null,
        check_out_location: '',
        location_mode: 'ONSITE',
        remark: 'ในสถานที่',
        status_label: 'ปฏิบัติงานปกติ'
    };

    const inMode = harnessInstance._resolveLocationMode(rec1, 'check_in');
    const outMode = harnessInstance._resolveLocationMode(rec1, 'check_out');
    const remark = harnessInstance._resolveReportRemark(rec1);
    const webHtml = harnessInstance._buildSingleRowHtml(rec1, 1, false);
    const pdfHtml = harnessInstance._buildSingleRowHtml(rec1, 1, true);
    const excelRow = buildExcelRow(harnessInstance, rec1, 1);

    assert(inMode === 'ONSITE', 'Test 1.1: Resolved location mode for check-in is ONSITE');
    assert(outMode === null, 'Test 1.2: Check-out mode is null when not checked out');
    assert(remark === '-', 'Test 1.3: Remark is "-" for Onsite regular check-in (Rule 2.1.1)');
    assert(webHtml.includes('ในสถานที่'), 'Test 1.4: Web View displays "ในสถานที่" badge');
    assert(webHtml.includes('บริเวณ สำนักเทศกิจ'), 'Test 1.5: Web View displays "บริเวณ สำนักเทศกิจ"');
    assert(!rawCoordsRegex.test(webHtml), 'Test 1.6: Web View contains ZERO lat/lng coordinates');
    assert(pdfHtml.includes('ในสถานที่'), 'Test 1.7: Print PDF displays "ในสถานที่" badge');
    assert(pdfHtml.includes('บริเวณ สำนักเทศกิจ'), 'Test 1.8: Print PDF displays "บริเวณ สำนักเทศกิจ"');
    assert(!rawCoordsRegex.test(pdfHtml), 'Test 1.9: Print PDF contains ZERO lat/lng coordinates');
    assert(excelRow['พิกัด GPS เข้างาน'] === 'ในสถานที่ บริเวณ สำนักเทศกิจ', 'Test 1.10: Excel row GPS In formatted correctly');
    assert(excelRow['พิกัด GPS ออกงาน'] === '-', 'Test 1.11: Excel row GPS Out is "-"');
    assert(excelRow['หมายเหตุ'] === '-', 'Test 1.12: Excel row remark is "-"');
}

// -----------------------------------------------------------------------------
// Test Case 2: Offsite Regular Check-in
// -----------------------------------------------------------------------------
console.log('\n▶️ Test Case 2 (Offsite Regular Check-in): Rule 2.1.2 & Remark "อบรม"');
{
    const rec2 = {
        log_id: 'LOG-002',
        full_name: 'นางสาวสุภาภรณ์ นามสมมุติ',
        position_title: 'นักจัดการงานทั่วไป',
        position_level: 'ปฏิบัติการ',
        position_type: 'วิชาการ',
        work_date: '2026-11-13',
        shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
        check_in_time: '08:30',
        check_in_lat: 13.719850,
        check_in_lng: 100.456780,
        check_in_location: 'ใกล้เคียง มหาวิทยาลัยสยาม',
        check_out_time: '',
        check_out_lat: null,
        check_out_lng: null,
        check_out_location: '',
        location_mode: 'OFFSITE',
        remark: 'อบรม',
        status_label: 'ปฏิบัติงานปกติ'
    };

    const inMode = harnessInstance._resolveLocationMode(rec2, 'check_in');
    const remark = harnessInstance._resolveReportRemark(rec2);
    const webHtml = harnessInstance._buildSingleRowHtml(rec2, 2, false);
    const pdfHtml = harnessInstance._buildSingleRowHtml(rec2, 2, true);
    const excelRow = buildExcelRow(harnessInstance, rec2, 2);

    assert(inMode === 'OFFSITE', 'Test 2.1: Resolved location mode for check-in is OFFSITE');
    assert(remark === 'อบรม', 'Test 2.2: Remark is preserved as "อบรม" (Rule 2.1.2)');
    assert(webHtml.includes('นอกสถานที่'), 'Test 2.3: Web View displays "นอกสถานที่" badge');
    assert(webHtml.includes('ใกล้เคียง มหาวิทยาลัยสยาม'), 'Test 2.4: Web View displays "ใกล้เคียง มหาวิทยาลัยสยาม"');
    assert(webHtml.includes('อบรม'), 'Test 2.5: Web View remarks cell displays "อบรม"');
    assert(!rawCoordsRegex.test(webHtml), 'Test 2.6: Web View contains ZERO lat/lng coordinates');
    assert(pdfHtml.includes('นอกสถานที่'), 'Test 2.7: Print PDF displays "นอกสถานที่" badge');
    assert(pdfHtml.includes('อบรม'), 'Test 2.8: Print PDF displays "อบรม"');
    assert(!rawCoordsRegex.test(pdfHtml), 'Test 2.9: Print PDF contains ZERO lat/lng coordinates');
    assert(excelRow['พิกัด GPS เข้างาน'] === 'นอกสถานที่ ใกล้เคียง มหาวิทยาลัยสยาม', 'Test 2.10: Excel GPS In formatted correctly');
    assert(excelRow['หมายเหตุ'] === 'อบรม', 'Test 2.11: Excel remark is "อบรม"');
}

// -----------------------------------------------------------------------------
// Test Case 3: Regular Check-out Event (Remark Never Overwritten)
// -----------------------------------------------------------------------------
console.log('\n▶️ Test Case 3 (Regular Check-out Event): Rule 2.2 Remark Preservation');
{
    // Case 3A: Onsite checkout
    const rec3A = {
        log_id: 'LOG-003A',
        full_name: 'นายสมชาย ใจดี',
        position_title: 'เจ้าพนักงานเทศกิจ',
        position_level: 'ชำนาญงาน',
        position_type: 'ทั่วไป',
        work_date: '2026-11-13',
        shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
        check_in_time: '08:25',
        check_in_lat: 13.733790,
        check_in_lng: 100.468261,
        check_in_location: 'สำนักเทศกิจ',
        check_out_time: '16:35',
        check_out_lat: 13.733790,
        check_out_lng: 100.468261,
        check_out_location: 'สำนักเทศกิจ',
        location_mode: 'ONSITE',
        remark: 'ในสถานที่',
        status_label: 'ปฏิบัติงานปกติ'
    };

    const outMode3A = harnessInstance._resolveLocationMode(rec3A, 'check_out');
    const remark3A = harnessInstance._resolveReportRemark(rec3A);
    const webHtml3A = harnessInstance._buildSingleRowHtml(rec3A, 3, false);
    const excelRow3A = buildExcelRow(harnessInstance, rec3A, 3);

    assert(outMode3A === 'ONSITE', 'Test 3.1: Check-out mode is ONSITE');
    assert(remark3A === '-', 'Test 3.2: Check-out event does not overwrite remark (remains "-")');
    assert(webHtml3A.includes('ในสถานที่'), 'Test 3.3: Web View shows "ในสถานที่" on check-out cell');
    assert(excelRow3A['พิกัด GPS ออกงาน'] === 'ในสถานที่ บริเวณ สำนักเทศกิจ', 'Test 3.4: Excel GPS Out shows "ในสถานที่ บริเวณ สำนักเทศกิจ"');
    assert(excelRow3A['หมายเหตุ'] === '-', 'Test 3.5: Excel remark remains "-" after checkout');

    // Case 3B: Offsite check-in followed by checkout
    const rec3B = {
        log_id: 'LOG-003B',
        full_name: 'นางสาวสุภาภรณ์ นามสมมุติ',
        position_title: 'นักจัดการงานทั่วไป',
        position_level: 'ปฏิบัติการ',
        position_type: 'วิชาการ',
        work_date: '2026-11-13',
        shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
        check_in_time: '08:30',
        check_in_lat: 13.719850,
        check_in_lng: 100.456780,
        check_in_location: 'ใกล้เคียง มหาวิทยาลัยสยาม',
        check_out_time: '16:40',
        check_out_lat: 13.719850,
        check_out_lng: 100.456780,
        check_out_location: 'มหาวิทยาลัยสยาม',
        location_mode: 'OFFSITE',
        remark: 'อบรม',
        status_label: 'ปฏิบัติงานปกติ'
    };

    const remark3B = harnessInstance._resolveReportRemark(rec3B);
    const excelRow3B = buildExcelRow(harnessInstance, rec3B, 4);

    assert(remark3B === 'อบรม', 'Test 3.6: Offsite check-in remark "อบรม" is preserved intact after checkout');
    assert(excelRow3B['หมายเหตุ'] === 'อบรม', 'Test 3.7: Excel remark preserves "อบรม" without checkout overwriting');
}

// -----------------------------------------------------------------------------
// Test Case 4: Special Shift Onsite
// -----------------------------------------------------------------------------
console.log('\n▶️ Test Case 4 (Special Shift Onsite): Rule 2.3.1');
{
    const rec4 = {
        log_id: 'LOG-004',
        full_name: 'นายพงษ์ศักดิ์ ศักดิ์ศรี',
        position_title: 'เจ้าพนักงานเทศกิจ',
        position_level: 'ชำนาญงาน',
        position_type: 'ทั่วไป',
        work_date: '2026-11-13',
        shift_name: 'เวรประจำวัน (08:00 - 20:00)',
        check_in_time: '07:55',
        check_in_lat: 13.733790,
        check_in_lng: 100.468261,
        check_in_location: 'สำนักเทศกิจ',
        check_out_time: '20:05',
        check_out_lat: 13.733790,
        check_out_lng: 100.468261,
        check_out_location: 'สำนักเทศกิจ',
        location_mode: 'ONSITE',
        remark: 'ในสถานที่',
        status_label: 'ปฏิบัติงานนอกเวลา'
    };

    const inMode = harnessInstance._resolveLocationMode(rec4, 'check_in');
    const outMode = harnessInstance._resolveLocationMode(rec4, 'check_out');
    const remark = harnessInstance._resolveReportRemark(rec4);
    const webHtml = harnessInstance._buildSingleRowHtml(rec4, 5, false);
    const pdfHtml = harnessInstance._buildSingleRowHtml(rec4, 5, true);
    const excelRow = buildExcelRow(harnessInstance, rec4, 5);

    assert(inMode === 'ONSITE', 'Test 4.1: Shift GPS In mode is ONSITE');
    assert(outMode === 'ONSITE', 'Test 4.2: Shift GPS Out mode is ONSITE');
    assert(remark === '-', 'Test 4.3: Special Shift Onsite remark is "-" (Rule 2.3.1)');
    assert(!rawCoordsRegex.test(webHtml), 'Test 4.4: Web View contains ZERO lat/lng coordinates');
    assert(!rawCoordsRegex.test(pdfHtml), 'Test 4.5: Print PDF contains ZERO lat/lng coordinates');
    assert(excelRow['พิกัด GPS เข้างาน'] === 'ในสถานที่ บริเวณ สำนักเทศกิจ', 'Test 4.6: Excel GPS In correct');
    assert(excelRow['พิกัด GPS ออกงาน'] === 'ในสถานที่ บริเวณ สำนักเทศกิจ', 'Test 4.7: Excel GPS Out correct');
    assert(excelRow['หมายเหตุ'] === '-', 'Test 4.8: Excel remark is "-"');
}

// -----------------------------------------------------------------------------
// Test Case 5: Special Shift Offsite
// -----------------------------------------------------------------------------
console.log('\n▶️ Test Case 5 (Special Shift Offsite): Rule 2.3.2');
{
    const rec5 = {
        log_id: 'LOG-005',
        full_name: 'นายกิตติคุณ นามมั่น',
        position_title: 'นิติกร',
        position_level: 'ชำนาญการ',
        position_type: 'วิชาการ',
        work_date: '2026-11-13',
        shift_name: 'เวรประจำวัน (08:00 - 20:00)',
        check_in_time: '07:55',
        check_in_lat: 13.882140,
        check_in_lng: 100.565430,
        check_in_location: 'ศูนย์ราชการแจ้งวัฒนะ',
        check_out_time: '20:10',
        check_out_lat: 13.882140,
        check_out_lng: 100.565430,
        check_out_location: 'ศูนย์ราชการแจ้งวัฒนะ',
        location_mode: 'OFFSITE',
        remark: 'ประชุม',
        status_label: 'ปฏิบัติงานนอกเวลา'
    };

    const inMode = harnessInstance._resolveLocationMode(rec5, 'check_in');
    const outMode = harnessInstance._resolveLocationMode(rec5, 'check_out');
    const remark = harnessInstance._resolveReportRemark(rec5);
    const webHtml = harnessInstance._buildSingleRowHtml(rec5, 6, false);
    const pdfHtml = harnessInstance._buildSingleRowHtml(rec5, 6, true);
    const excelRow = buildExcelRow(harnessInstance, rec5, 6);

    assert(inMode === 'OFFSITE', 'Test 5.1: Shift GPS In mode is OFFSITE');
    assert(outMode === 'OFFSITE', 'Test 5.2: Shift GPS Out mode is OFFSITE');
    assert(remark === 'ประชุม', 'Test 5.3: Special Shift Offsite remark is "ประชุม" (Rule 2.3.2)');
    assert(webHtml.includes('นอกสถานที่'), 'Test 5.4: Web View displays "นอกสถานที่"');
    assert(webHtml.includes('บริเวณ ศูนย์ราชการแจ้งวัฒนะ'), 'Test 5.5: Web View prepends "บริเวณ" correctly');
    assert(!rawCoordsRegex.test(webHtml), 'Test 5.6: Web View contains ZERO lat/lng coordinates');
    assert(!rawCoordsRegex.test(pdfHtml), 'Test 5.7: Print PDF contains ZERO lat/lng coordinates');
    assert(excelRow['พิกัด GPS เข้างาน'] === 'นอกสถานที่ บริเวณ ศูนย์ราชการแจ้งวัฒนะ', 'Test 5.8: Excel GPS In correct');
    assert(excelRow['พิกัด GPS ออกงาน'] === 'นอกสถานที่ บริเวณ ศูนย์ราชการแจ้งวัฒนะ', 'Test 5.9: Excel GPS Out correct');
    assert(excelRow['หมายเหตุ'] === 'ประชุม', 'Test 5.10: Excel remark is "ประชุม"');
}

// -----------------------------------------------------------------------------
// Test Case 6: Special Request
// -----------------------------------------------------------------------------
console.log('\n▶️ Test Case 6 (Special Request): Rule 2.4');
{
    const rec6 = {
        log_id: 'LOG-006',
        full_name: 'นายมนัสวี สุขใจ',
        position_title: 'นักวิชาการคอมพิวเตอร์',
        position_level: 'ชำนาญการ',
        position_type: 'วิชาการ',
        work_date: '2026-11-13',
        shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
        check_in_time: '08:30',
        check_out_time: '16:30',
        check_in_location: '',
        check_out_location: '',
        is_special_request: true,
        location_mode: 'ONSITE',
        remark: 'ลืมลงเวลาปฏิบัติราชการ',
        status_label: 'ปฏิบัติงานปกติ'
    };

    const remark = harnessInstance._resolveReportRemark(rec6);
    const webHtml = harnessInstance._buildSingleRowHtml(rec6, 7, false);
    const pdfHtml = harnessInstance._buildSingleRowHtml(rec6, 7, true);
    const excelRow = buildExcelRow(harnessInstance, rec6, 7);

    assert(remark === 'ลืมลงเวลาปฏิบัติราชการ', 'Test 6.1: Special request remark is "ลืมลงเวลาปฏิบัติราชการ" (Rule 2.4)');
    assert(webHtml.includes('ลืมลงเวลาปฏิบัติราชการ'), 'Test 6.2: Web View displays special request remark');
    assert(pdfHtml.includes('ลืมลงเวลาปฏิบัติราชการ'), 'Test 6.3: Print PDF displays special request remark');
    assert(excelRow['หมายเหตุ'] === 'ลืมลงเวลาปฏิบัติราชการ', 'Test 6.4: Excel remark matches special request reason');

    // Test fallback when remark is blank
    const rec6Empty = { ...rec6, log_id: 'LOG-006B', remark: '' };
    assert(harnessInstance._resolveReportRemark(rec6Empty) === '-', 'Test 6.5: Special request with empty remark falls back to "-"');
}

// -----------------------------------------------------------------------------
// Test Case 7: Tag Status Suppression
// -----------------------------------------------------------------------------
console.log('\n▶️ Test Case 7 (Tag Status Suppression): No Tag Status Leaks into Remark');
{
    const suppressedLabels = [
        'ปฏิบัติงานปกติ',
        'มาสาย',
        'ขาดราชการ',
        'ไม่ลงเวลา',
        'ปฏิบัติงานนอกเวลา',
        'ปฏิบัติงานนอกเวลาราชการ',
        'ในสถานที่'
    ];

    for (const tag of suppressedLabels) {
        const dummyRec = {
            log_id: `LOG-TAG-${tag}`,
            work_date: '2026-11-13',
            location_mode: 'ONSITE',
            check_in_time: '08:30',
            remark: tag,
            status_label: tag
        };

        const resolved = harnessInstance._resolveReportRemark(dummyRec);
        assert(resolved === '-', `Test 7: Tag status "${tag}" is suppressed to "-" in remark column`);
    }
}

// -----------------------------------------------------------------------------
// Test Case 8: Zero Lat/Lng Coordinates in Any Output (Web, PDF, Excel)
// -----------------------------------------------------------------------------
console.log('\n▶️ Test Case 8 (Print PDF & Web View & Excel Export Synchronized): Zero Raw Lat/Lng');
{
    const testCases = [
        { lat: 13.733790, lng: 100.468261, loc: 'สำนักเทศกิจ', mode: 'ONSITE', rem: '-' },
        { lat: 13.756300, lng: 100.501800, loc: 'ศาลาว่าการ กทม.', mode: 'OFFSITE', rem: 'ปฏิบัติงานนอกสถานที่' },
        { lat: 13.882140, lng: 100.565430, loc: 'ศูนย์ราชการแจ้งวัฒนะ', mode: 'OFFSITE', rem: 'ประชุม' }
    ];

    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const r = {
            log_id: `LOG-SYNC-${i}`,
            full_name: `ทดสอบ ${i}`,
            position_title: 'เจ้าหน้าที่',
            position_level: 'ปฏิบัติงาน',
            position_type: 'ทั่วไป',
            work_date: '2026-11-13',
            check_in_time: '08:00',
            check_in_lat: tc.lat,
            check_in_lng: tc.lng,
            check_in_location: tc.loc,
            check_out_time: '16:00',
            check_out_lat: tc.lat,
            check_out_lng: tc.lng,
            check_out_location: tc.loc,
            location_mode: tc.mode,
            remark: tc.rem,
            status_label: 'ปฏิบัติงานปกติ'
        };

        const webHtml = harnessInstance._buildSingleRowHtml(r, i + 1, false);
        const pdfHtml = harnessInstance._buildSingleRowHtml(r, i + 1, true);
        const excelRow = buildExcelRow(harnessInstance, r, i + 1);

        assert(!rawCoordsRegex.test(webHtml), `Test 8.1[${i}]: Web View contains ZERO coordinate numbers`);
        assert(!rawCoordsRegex.test(pdfHtml), `Test 8.2[${i}]: Print PDF contains ZERO coordinate numbers`);
        assert(!rawCoordsRegex.test(excelRow['พิกัด GPS เข้างาน']), `Test 8.3[${i}]: Excel GPS In contains ZERO coordinate numbers`);
        assert(!rawCoordsRegex.test(excelRow['พิกัด GPS ออกงาน']), `Test 8.4[${i}]: Excel GPS Out contains ZERO coordinate numbers`);
    }
}

// -----------------------------------------------------------------------------
// Test Case 9: Regression Suites & Syntax Checks
// -----------------------------------------------------------------------------
console.log('\n▶️ Test Case 9: Regression Suites & File Syntax Checks');
{
    // 9.1 Syntax Check ReportsController.js
    try {
        execSync('node --check assets/js/controllers/ReportsController.js', { stdio: 'pipe' });
        assert(true, 'Test 9.1: node --check assets/js/controllers/ReportsController.js passed');
    } catch (err) {
        assert(false, 'Test 9.1: Syntax check failed on ReportsController.js', err.message);
    }

    // 9.2 Syntax Check AttendanceModel.js
    try {
        execSync('node --check assets/js/models/AttendanceModel.js', { stdio: 'pipe' });
        assert(true, 'Test 9.2: node --check assets/js/models/AttendanceModel.js passed');
    } catch (err) {
        assert(false, 'Test 9.2: Syntax check failed on AttendanceModel.js', err.message);
    }

    // 9.3 Regression: Shift Card Button Removal Test Suite
    try {
        const out = execSync('node pipeline/PIPE-20261113-remove-special-request-btn-from-shift-card/qa_post_implementation_test.mjs', { stdio: 'pipe' }).toString();
        const passed = out.includes('ALL 29 ASSERTIONS PASSED');
        assert(passed, 'Test 9.3: Regression suite PIPE-20261113-remove-special-request-btn-from-shift-card passed (29/29)');
    } catch (err) {
        assert(false, 'Test 9.3: Regression suite failed', err.message);
    }

    // 9.4 Regression: Loca-V2 Multi-location & Geofence Suite
    try {
        const out = execSync('node pipeline/PIPE-20261104-loca-v2-onsite-offsite-nextstep/qa_loca_v2_verification.mjs', { stdio: 'pipe' }).toString();
        const passed = out.includes('100% ALL TESTS PASSED SUCCESSFULLY');
        assert(passed, 'Test 9.4: Regression suite PIPE-20261104-loca-v2-onsite-offsite-nextstep passed (25/25)');
    } catch (err) {
        assert(false, 'Test 9.4: Regression suite failed', err.message);
    }

    // 9.5 AttendanceModel formatReportRow location_mode mapping verification
    const modelCode = fs.readFileSync('assets/js/models/AttendanceModel.js', 'utf8');
    const hasLocationModeSelect = modelCode.includes('location_mode') && modelCode.includes('selectWithLocMode');
    const hasLocationModeMapping = modelCode.includes("location_mode: log?.location_mode || 'ONSITE'");
    const hasGracefulFallback = modelCode.includes('selectFallback');

    assert(hasLocationModeSelect, 'Test 9.5: AttendanceModel queries location_mode in selectWithLocMode');
    assert(hasLocationModeMapping, 'Test 9.6: AttendanceModel maps location_mode: log?.location_mode || \'ONSITE\'');
    assert(hasGracefulFallback, 'Test 9.7: AttendanceModel contains graceful fallback if location_mode column absent');
}

// -----------------------------------------------------------------------------
// Cache Version & BuildId Verification Across 8 HTML Files
// -----------------------------------------------------------------------------
console.log('\n▶️ Cache Version & BuildId Audit');
{
    const versionJson = JSON.parse(fs.readFileSync('version.json', 'utf8'));
    const expectedBuildId = '20261113_6dcf28ee';
    assert(versionJson.buildId === expectedBuildId, `version.json buildId is ${expectedBuildId}`);

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
        const hasBuildConst = content.includes(`CURRENT_APP_BUILD = '${expectedBuildId}'`);
        const vMatches = content.match(/\?v=[a-zA-Z0-9_]+/g) || [];
        const allQuerySynced = vMatches.length > 0 && vMatches.every(m => m === `?v=${expectedBuildId}`);

        assert(hasBuildConst, `${file} defines CURRENT_APP_BUILD = '${expectedBuildId}'`);
        assert(allQuerySynced, `${file} has all ${vMatches.length} asset query parameters synced with ?v=${expectedBuildId}`);
    }
}

// -----------------------------------------------------------------------------
// Final Summary
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`📊 Test Summary: Total ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('======================================================================');

if (failedTests > 0) {
    console.error('\n❌ QA SUITE FAILED WITH FAILURES:');
    failures.forEach(f => console.error(`  - ${f.testName}: ${f.details}`));
    process.exit(1);
} else {
    console.log(`\n🎉 ALL ${totalTests} ASSERTIONS PASSED WITH 100% SUCCESS!`);
    process.exit(0);
}
