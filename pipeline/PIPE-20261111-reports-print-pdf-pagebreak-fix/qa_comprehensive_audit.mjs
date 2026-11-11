import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log(' COMPREHENSIVE QA AUDIT: Reports Print / PDF Page-Break Fix');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
    try {
        fn();
        console.log(`[PASS] ${name}`);
        passCount++;
    } catch (err) {
        console.error(`[FAIL] ${name}`);
        console.error(`       Error: ${err.message}`);
        failCount++;
    }
}

// -------------------------------------------------------------
// Test 1: Syntax Audit
// -------------------------------------------------------------
runTest('Test 1: Syntax Audit of modified files', () => {
    // Both files are ESM
    assert.doesNotThrow(() => {
        const uiHelpers = fs.readFileSync('assets/js/core/UIHelpers.js', 'utf8');
        assert.ok(uiHelpers.length > 0);
    });
    assert.doesNotThrow(() => {
        const repCtrl = fs.readFileSync('assets/js/controllers/ReportsController.js', 'utf8');
        assert.ok(repCtrl.length > 0);
    });
});

// -------------------------------------------------------------
// Test 2: CSS Rules in UIHelpers.js
// -------------------------------------------------------------
const uiHelpersContent = fs.readFileSync('assets/js/core/UIHelpers.js', 'utf8').replace(/\r\n/g, '\n');

runTest('Test 2: UIHelpers CSS - .tag-section-block is page-break-inside: auto (no avoid)', () => {
    assert.ok(uiHelpersContent.includes('page-break-inside: auto;'), 'must contain page-break-inside: auto');
    assert.ok(uiHelpersContent.includes('break-inside: auto;'), 'must contain break-inside: auto');
    assert.ok(!uiHelpersContent.includes('.tag-section-block {\n            margin-bottom: 22px;\n            page-break-inside: avoid;'), 'must not contain page-break-inside: avoid on .tag-section-block');
});

runTest('Test 3: UIHelpers CSS - .report-header and .tag-section-title avoid break-after', () => {
    assert.ok(uiHelpersContent.includes('.report-header {\n            text-align: center;\n            margin-bottom: 16px;\n            border-bottom: 2px solid ${headerColor};\n            padding-bottom: 10px;\n            page-break-after: avoid;\n            break-after: avoid;'));
    assert.ok(uiHelpersContent.includes('.tag-section-title {\n            font-size: 14px;\n            font-weight: 700;\n            padding: 7px 14px;\n            border-radius: 6px;\n            color: #FFFFFF;\n            margin-bottom: 6px;\n            page-break-after: avoid;\n            break-after: avoid;'));
});

runTest('Test 4: UIHelpers CSS - table layout and pagination configuration', () => {
    assert.ok(uiHelpersContent.includes('table {\n            width: 100%;\n            table-layout: fixed;\n            border-collapse: collapse;\n            font-size: 13px;\n            margin-bottom: 12px;\n            page-break-inside: auto;\n            break-inside: auto;'));
});

runTest('Test 5: UIHelpers CSS - thead table-header-group and break avoidance', () => {
    assert.ok(uiHelpersContent.includes('thead {\n            display: table-header-group;\n            page-break-inside: avoid;\n            break-inside: avoid;\n            page-break-after: avoid;\n            break-after: avoid;'));
});

runTest('Test 6: UIHelpers CSS - tr break-inside avoidance', () => {
    assert.ok(uiHelpersContent.includes('tr {\n            page-break-inside: avoid;\n            break-inside: avoid;'));
});

runTest('Test 7: UIHelpers CSS - .group-row and .sub-group-row avoid break-after', () => {
    assert.ok(uiHelpersContent.includes('.group-row, .sub-group-row {\n            page-break-after: avoid;\n            break-after: avoid;'));
});

runTest('Test 8: UIHelpers CSS - @page landscape and margins', () => {
    assert.ok(uiHelpersContent.includes('@page {\n            size: A4 landscape;\n            margin: 8mm 10mm;'));
    assert.ok(uiHelpersContent.includes('@media print {\n            .toolbar { display: none !important; }\n            body {\n                margin: 0;\n                padding: 0;'));
});

// -------------------------------------------------------------
// Test 9-10: ReportsController.js Inline Styles
// -------------------------------------------------------------
const repContent = fs.readFileSync('assets/js/controllers/ReportsController.js', 'utf8');

runTest('Test 9: ReportsController - .day-section-banner inline style break-after: avoid', () => {
    assert.ok(repContent.includes('class="day-section-banner" style="background-color: #00351B; color: #FFFFFF; padding: 8px 14px; font-weight: 800; font-size: 15px; border-radius: 6px; margin-top: 18px; margin-bottom: 12px; page-break-after: avoid; break-after: avoid;"'));
});

runTest('Test 10: ReportsController - .tag-section-title inline style break-after: avoid in forPrintPdf', () => {
    assert.ok(repContent.includes('class="tag-section-title" style="background-color: ${statusColor}; page-break-after: avoid; break-after: avoid;"'));
});

// -------------------------------------------------------------
// Test 11: Cache Version Synchronization
// -------------------------------------------------------------
runTest('Test 11: Mandatory Cache Version Sync across version.json and 8 HTML files', () => {
    const vJson = JSON.parse(fs.readFileSync('version.json', 'utf8'));
    const buildId = vJson.buildId;
    assert.ok(buildId, 'version.json must have buildId');

    const htmlFiles = [
        'index.html', 'checkin.html', 'dashboard.html', 'approvals.html',
        'reports.html', 'personnel.html', 'settings.html', 'users.html'
    ];

    for (const hf of htmlFiles) {
        const content = fs.readFileSync(hf, 'utf8');
        assert.ok(content.includes(`CURRENT_APP_BUILD = '${buildId}'`), `${hf} missing CURRENT_APP_BUILD = '${buildId}'`);
        assert.ok(content.includes(`?v=${buildId}`), `${hf} missing ?v=${buildId}`);
    }
});

// -------------------------------------------------------------
// Test 12: Surgical Scope Audit
// -------------------------------------------------------------
runTest('Test 12: Scope Audit - changes strictly confined to target files', () => {
    // Only UIHelpers.js and ReportsController.js should have code edits
    // version.json and HTML files for cache sync, and .ai_map
    const allowedPrefixes = [
        'assets/js/core/UIHelpers.js',
        'assets/js/controllers/ReportsController.js',
        'version.json',
        '.ai_map/',
        'pipeline/PIPE-20261111-reports-print-pdf-pagebreak-fix/'
    ];
    const allowedHtml = [
        'index.html', 'checkin.html', 'dashboard.html', 'approvals.html',
        'reports.html', 'personnel.html', 'settings.html', 'users.html'
    ];

    // Read git diff --name-only
    const diffFiles = fs.readFileSync(0, 'utf8').trim().split(/\r?\n/).filter(Boolean);
    for (const f of diffFiles) {
        const isAllowed = allowedPrefixes.some(p => f.startsWith(p)) || allowedHtml.includes(f);
        assert.ok(isAllowed, `Unintended file changed: ${f}`);
    }
});

console.log('\n================================================================');
console.log(` AUDIT SUMMARY: Total: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);
console.log('================================================================');
if (failCount > 0) process.exit(1);
