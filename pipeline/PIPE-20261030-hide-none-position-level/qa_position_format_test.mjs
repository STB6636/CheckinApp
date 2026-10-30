/**
 * @file pipeline/PIPE-20261030-hide-none-position-level/qa_position_format_test.mjs
 * @description Comprehensive Automated QA Test Suite for BMA Position Formatting & Level Suppression
 * Pipeline: PIPE-20261030-hide-none-position-level
 */

import { UIHelpers } from '../../assets/js/core/UIHelpers.js';

let passedCount = 0;
let failedCount = 0;
const results = [];

function assert(description, actual, expected) {
    const isPass = actual === expected;
    if (isPass) {
        passedCount++;
        results.push({ status: 'PASS', description, actual, expected });
        console.log(`  ✅ [PASS] ${description} -> "${actual}"`);
    } else {
        failedCount++;
        results.push({ status: 'FAIL', description, actual, expected });
        console.error(`  ❌ [FAIL] ${description}\n       Expected: "${expected}"\n       Actual:   "${actual}"`);
    }
}

console.log('======================================================================');
console.log('🧪 Starting QA Automated Test Suite: UIHelpers.formatPosition');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Group A: Executive & Leadership Roles (Omits level)
// -----------------------------------------------------------------------------
console.log('▶️ Group A: Executive & Leadership Roles (Should omit level)');

assert(
    'A.1 ผู้อำนวยการส่วน with positionType "ประเภทผู้บริหาร"',
    UIHelpers.formatPosition('ผู้อำนวยการส่วน', 'อำนวยการระดับสูง', 'ประเภทผู้บริหาร'),
    'ผู้อำนวยการส่วน'
);

assert(
    'A.2 ผู้อำนวยการส่วน with positionType "ประเภทอำนวยการ"',
    UIHelpers.formatPosition('ผู้อำนวยการส่วน', 'อำนวยการระดับสูง', 'ประเภทอำนวยการ'),
    'ผู้อำนวยการส่วน'
);

assert(
    'A.3 ผู้อำนวยการส่วน without positionType (auto-detected executive title)',
    UIHelpers.formatPosition('ผู้อำนวยการส่วน', 'อำนวยการระดับสูง'),
    'ผู้อำนวยการส่วน'
);

assert(
    'A.4 หัวหน้ากลุ่มงาน with positionType "ประเภทผู้บริหาร"',
    UIHelpers.formatPosition('หัวหน้ากลุ่มงาน', 'ชำนาญการพิเศษ', 'ประเภทผู้บริหาร'),
    'หัวหน้ากลุ่มงาน'
);

assert(
    'A.5 หัวหน้ากลุ่มงาน without positionType (auto-detected leader title)',
    UIHelpers.formatPosition('หัวหน้ากลุ่มงาน', 'ชำนาญการพิเศษ'),
    'หัวหน้ากลุ่มงาน'
);

assert(
    'A.6 ผู้อำนวยการสำนัก with executive level',
    UIHelpers.formatPosition('ผู้อำนวยการสำนัก', 'บริหารระดับสูง', 'ประเภทผู้บริหาร'),
    'ผู้อำนวยการสำนัก'
);

assert(
    'A.7 หัวหน้าฝ่าย with positionType "ประเภทอำนวยการ"',
    UIHelpers.formatPosition('หัวหน้าฝ่ายปกครอง', 'อำนวยการระดับต้น', 'ประเภทอำนวยการ'),
    'หัวหน้าฝ่ายปกครอง'
);

// -----------------------------------------------------------------------------
// Group B: Non-Level Roles (No level / level is 'ไม่มี')
// -----------------------------------------------------------------------------
console.log('\n▶️ Group B: Non-Level Roles (Should omit level)');

assert(
    'B.1 พนักงานเทศกิจ with level "ไม่มี"',
    UIHelpers.formatPosition('พนักงานเทศกิจ', 'ไม่มี'),
    'พนักงานเทศกิจ'
);

assert(
    'B.2 พนักงานขับรถยนต์ with level "ไม่มี"',
    UIHelpers.formatPosition('พนักงานขับรถยนต์', 'ไม่มี'),
    'พนักงานขับรถยนต์'
);

assert(
    'B.3 พนักงานสถานที่ with level "ไม่มี" and positionType "ลูกจ้างชั่วคราว"',
    UIHelpers.formatPosition('พนักงานสถานที่', 'ไม่มี', 'ลูกจ้างชั่วคราว'),
    'พนักงานสถานที่'
);

assert(
    'B.4 พนักงานธุรการ with level "ไม่มี"',
    UIHelpers.formatPosition('พนักงานธุรการ', 'ไม่มี'),
    'พนักงานธุรการ'
);

// -----------------------------------------------------------------------------
// Group C: Permanent Employees / [ส 1-4, บ 1-4, numbers] (1 Space)
// -----------------------------------------------------------------------------
console.log('\n▶️ Group C: Permanent Employees / Employee Pattern (Should have 1 space)');

assert(
    'C.1 พนักงานเทศกิจ with level "ส 2" and positionType "ลูกจ้างประจำ"',
    UIHelpers.formatPosition('พนักงานเทศกิจ', 'ส 2', 'ลูกจ้างประจำ'),
    'พนักงานเทศกิจ ส 2'
);

assert(
    'C.2 พนักงานเทศกิจ with level "ส 2" without positionType (pattern auto-detected)',
    UIHelpers.formatPosition('พนักงานเทศกิจ', 'ส 2'),
    'พนักงานเทศกิจ ส 2'
);

assert(
    'C.3 พนักงานเทศกิจ with level "ส.2"',
    UIHelpers.formatPosition('พนักงานเทศกิจ', 'ส.2'),
    'พนักงานเทศกิจ ส.2'
);

assert(
    'C.4 พนักงานขับรถยนต์ with level "2" and positionType "ลูกจ้างประจำ"',
    UIHelpers.formatPosition('พนักงานขับรถยนต์', '2', 'ลูกจ้างประจำ'),
    'พนักงานขับรถยนต์ 2'
);

assert(
    'C.5 พนักงานขับรถยนต์ with level "2" without positionType (numeric level auto-detected)',
    UIHelpers.formatPosition('พนักงานขับรถยนต์', '2'),
    'พนักงานขับรถยนต์ 2'
);

assert(
    'C.6 พนักงานขับรถยนต์ with level "บ 1"',
    UIHelpers.formatPosition('พนักงานขับรถยนต์', 'บ 1'),
    'พนักงานขับรถยนต์ บ 1'
);

assert(
    'C.7 พนักงานขับรถยนต์ with level "บ 4" and positionType "ลูกจ้างประจำ"',
    UIHelpers.formatPosition('พนักงานขับรถยนต์', 'บ 4', 'ลูกจ้างประจำ'),
    'พนักงานขับรถยนต์ บ 4'
);

assert(
    'C.8 นายช่างผังเมือง with level "ส 4"',
    UIHelpers.formatPosition('นายช่างผังเมือง', 'ส 4', 'ลูกจ้างประจำ'),
    'นายช่างผังเมือง ส 4'
);

// -----------------------------------------------------------------------------
// Group D: General Civil Servants (Concatenated without space)
// -----------------------------------------------------------------------------
console.log('\n▶️ Group D: General Civil Servants (Concatenated without space)');

assert(
    'D.1 นักจัดการงานทั่วไป with level "ปฏิบัติการ" and civil servant type',
    UIHelpers.formatPosition('นักจัดการงานทั่วไป', 'ปฏิบัติการ', 'ข้าราชการกรุงเทพมหานครสามัญ'),
    'นักจัดการงานทั่วไปปฏิบัติการ'
);

assert(
    'D.2 นักจัดการงานทั่วไป with level "ปฏิบัติการ" without type',
    UIHelpers.formatPosition('นักจัดการงานทั่วไป', 'ปฏิบัติการ'),
    'นักจัดการงานทั่วไปปฏิบัติการ'
);

assert(
    'D.3 เจ้าพนักงานเทศกิจ with level "ชำนาญการ"',
    UIHelpers.formatPosition('เจ้าพนักงานเทศกิจ', 'ชำนาญการ'),
    'เจ้าพนักงานเทศกิจชำนาญการ'
);

assert(
    'D.4 นิติกร with level "ชำนาญการพิเศษ"',
    UIHelpers.formatPosition('นิติกร', 'ชำนาญการพิเศษ'),
    'นิติกรชำนาญการพิเศษ'
);

assert(
    'D.5 เจ้าพนักงานธุรการ with level "ปฏิบัติงาน"',
    UIHelpers.formatPosition('เจ้าพนักงานธุรการ', 'ปฏิบัติงาน'),
    'เจ้าพนักงานธุรการปฏิบัติงาน'
);

assert(
    'D.6 นายช่างโยธา with level "อาวุโส"',
    UIHelpers.formatPosition('นายช่างโยธา', 'อาวุโส'),
    'นายช่างโยธาอาวุโส'
);

// -----------------------------------------------------------------------------
// Group E: Edge Cases & Fallbacks
// -----------------------------------------------------------------------------
console.log('\n▶️ Group E: Edge Cases & Fallbacks');

assert(
    'E.1 Level is "ระดับไม่มี"',
    UIHelpers.formatPosition('พนักงานเทศกิจ', 'ระดับไม่มี'),
    'พนักงานเทศกิจ'
);

assert(
    'E.2 Level is "-"',
    UIHelpers.formatPosition('เจ้าพนักงานเทศกิจ', '-'),
    'เจ้าพนักงานเทศกิจ'
);

assert(
    'E.3 Level is empty string ""',
    UIHelpers.formatPosition('เจ้าพนักงานเทศกิจ', ''),
    'เจ้าพนักงานเทศกิจ'
);

assert(
    'E.4 Level is null',
    UIHelpers.formatPosition('เจ้าพนักงานเทศกิจ', null),
    'เจ้าพนักงานเทศกิจ'
);

assert(
    'E.5 Level is undefined',
    UIHelpers.formatPosition('เจ้าพนักงานเทศกิจ', undefined),
    'เจ้าพนักงานเทศกิจ'
);

assert(
    'E.6 Level with prefix "ระดับชำนาญการ"',
    UIHelpers.formatPosition('เจ้าพนักงานเทศกิจ', 'ระดับชำนาญการ'),
    'เจ้าพนักงานเทศกิจชำนาญการ'
);

assert(
    'E.7 Fallback cleaned when title and level are empty (with "ระดับไม่มี")',
    UIHelpers.formatPosition('', '', '', 'พนักงานเทศกิจ ระดับไม่มี'),
    'พนักงานเทศกิจ'
);

assert(
    'E.8 Fallback cleaned when title and level are empty (with trailing "ไม่มี")',
    UIHelpers.formatPosition('', '', '', 'พนักงานขับรถยนต์ ไม่มี'),
    'พนักงานขับรถยนต์'
);

assert(
    'E.9 Fallback with normal civil servant',
    UIHelpers.formatPosition('', '', '', 'เจ้าพนักงานเทศกิจ ระดับ ปฏิบัติงาน'),
    'เจ้าพนักงานเทศกิจปฏิบัติงาน'
);

assert(
    'E.10 All inputs are empty/null/undefined',
    UIHelpers.formatPosition('', '', '', ''),
    '-'
);

assert(
    'E.11 All parameters omitted',
    UIHelpers.formatPosition(),
    '-'
);

console.log('\n======================================================================');
console.log(`📊 Test Summary: Total ${passedCount + failedCount} | Passed: ${passedCount} | Failed: ${failedCount}`);
console.log('======================================================================\n');

if (failedCount > 0) {
    console.error(`💥 TEST SUITE FAILED with ${failedCount} failures.`);
    process.exit(1);
} else {
    console.log('🎉 100% ALL TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
}
