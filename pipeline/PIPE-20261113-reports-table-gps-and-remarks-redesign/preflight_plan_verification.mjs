import fs from 'fs';
import path from 'path';

console.log('=== Pre-Flight Plan Verification: Reports Table GPS & Remarks Redesign ===');

const reportsPath = path.resolve('assets/js/controllers/ReportsController.js');
const modelPath = path.resolve('assets/js/models/AttendanceModel.js');

let passed = 0;
let total = 0;

function assert(condition, desc) {
    total++;
    if (condition) {
        console.log(`[PASS] ${desc}`);
        passed++;
    } else {
        console.error(`[FAIL] ${desc}`);
    }
}

// 1. Check ReportsController exists
assert(fs.existsSync(reportsPath), 'ReportsController.js exists');
const reportsCode = fs.readFileSync(reportsPath, 'utf8');

// 2. Check #buildSingleRowHtml exists
assert(reportsCode.includes('#buildSingleRowHtml(rec, indexNo, forPrintPdf)'), '#buildSingleRowHtml method exists');

// 3. Check forPrintPdf and Web branches
assert(reportsCode.includes('if (forPrintPdf) {'), 'forPrintPdf branch exists in #buildSingleRowHtml');

// 4. Check AttendanceModel exists
assert(fs.existsSync(modelPath), 'AttendanceModel.js exists');
const modelCode = fs.readFileSync(modelPath, 'utf8');

// 5. Check getReportRecordsByDateRange exists
assert(modelCode.includes('getReportRecordsByDateRange'), 'getReportRecordsByDateRange exists in AttendanceModel');

// 6. Check #formatReportRow exists
assert(modelCode.includes('#formatReportRow(person, log, workDate, evalStatus)'), '#formatReportRow exists in AttendanceModel');

console.log(`\nPre-Flight Result: ${passed}/${total} assertions passed (${Math.round((passed/total)*100)}%)`);
if (passed === total) {
    console.log('>>> Structural Pre-Flight Verification SUCCESSFUL <<<');
} else {
    process.exit(1);
}
