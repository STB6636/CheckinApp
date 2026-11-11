import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('--- STARTING VERIFICATION: Reports Print / PDF Page-Break Fix ---');

// 1. Verify UIHelpers.js
const uiHelpersPath = path.resolve('assets/js/core/UIHelpers.js');
const uiHelpersContent = fs.readFileSync(uiHelpersPath, 'utf8').replace(/\r\n/g, '\n');

// Check .tag-section-block
assert.ok(
    uiHelpersContent.includes('.tag-section-block {\n            margin-bottom: 22px;\n            page-break-inside: auto;\n            break-inside: auto;'),
    '.tag-section-block must have page-break-inside: auto and break-inside: auto'
);
assert.ok(
    !uiHelpersContent.includes('.tag-section-block {\n            margin-bottom: 22px;\n            page-break-inside: avoid;'),
    '.tag-section-block must NOT have page-break-inside: avoid'
);
console.log('✔ UIHelpers.js: .tag-section-block break-inside is auto');

// Check .report-header
assert.ok(
    uiHelpersContent.includes('.report-header {\n            text-align: center;\n            margin-bottom: 16px;\n            border-bottom: 2px solid ${headerColor};\n            padding-bottom: 10px;\n            page-break-after: avoid;\n            break-after: avoid;'),
    '.report-header must have page-break-after: avoid and break-after: avoid'
);
console.log('✔ UIHelpers.js: .report-header break-after is avoid');

// Check .tag-section-title
assert.ok(
    uiHelpersContent.includes('.tag-section-title {\n            font-size: 14px;\n            font-weight: 700;\n            padding: 7px 14px;\n            border-radius: 6px;\n            color: #FFFFFF;\n            margin-bottom: 6px;\n            page-break-after: avoid;\n            break-after: avoid;'),
    '.tag-section-title must have page-break-after: avoid and break-after: avoid'
);
console.log('✔ UIHelpers.js: .tag-section-title break-after is avoid');

// Check table
assert.ok(
    uiHelpersContent.includes('table {\n            width: 100%;\n            table-layout: fixed;\n            border-collapse: collapse;\n            font-size: 13px;\n            margin-bottom: 12px;\n            page-break-inside: auto;\n            break-inside: auto;'),
    'table must have page-break-inside: auto and break-inside: auto'
);
console.log('✔ UIHelpers.js: table break-inside is auto');

// Check thead
assert.ok(
    uiHelpersContent.includes('thead {\n            display: table-header-group;\n            page-break-inside: avoid;\n            break-inside: avoid;\n            page-break-after: avoid;\n            break-after: avoid;'),
    'thead must have display: table-header-group and avoid breaks'
);
console.log('✔ UIHelpers.js: thead repeats on page-break (table-header-group) and avoids breaks');

// Check tr
assert.ok(
    uiHelpersContent.includes('tr {\n            page-break-inside: avoid;\n            break-inside: avoid;'),
    'tr must have page-break-inside: avoid and break-inside: avoid'
);
console.log('✔ UIHelpers.js: tr avoids page-break inside');

// Check .group-row and .sub-group-row
assert.ok(
    uiHelpersContent.includes('.group-row, .sub-group-row {\n            page-break-after: avoid;\n            break-after: avoid;'),
    '.group-row and .sub-group-row must have page-break-after: avoid and break-after: avoid'
);
console.log('✔ UIHelpers.js: group and sub-group rows avoid break-after');

// Check @page and print media
assert.ok(
    uiHelpersContent.includes('@page {\n            size: A4 landscape;\n            margin: 8mm 10mm;'),
    '@page must have size: A4 landscape; margin: 8mm 10mm;'
);
assert.ok(
    uiHelpersContent.includes('body {\n                margin: 0;\n                padding: 0;'),
    'media print body must have margin: 0; padding: 0;'
);
console.log('✔ UIHelpers.js: @page margins and print body padding verified');

// 2. Verify ReportsController.js
const reportsControllerPath = path.resolve('assets/js/controllers/ReportsController.js');
const reportsControllerContent = fs.readFileSync(reportsControllerPath, 'utf8');

// Check day-section-banner
assert.ok(
    reportsControllerContent.includes('class="day-section-banner" style="background-color: #00351B; color: #FFFFFF; padding: 8px 14px; font-weight: 800; font-size: 15px; border-radius: 6px; margin-top: 18px; margin-bottom: 12px; page-break-after: avoid; break-after: avoid;"'),
    '.day-section-banner must have page-break-after: avoid; break-after: avoid;'
);
console.log('✔ ReportsController.js: .day-section-banner inline style break-after is avoid');

// Check tag-section-title in print PDF
assert.ok(
    reportsControllerContent.includes('class="tag-section-title" style="background-color: ${statusColor}; page-break-after: avoid; break-after: avoid;"'),
    '.tag-section-title in print PDF mode must have page-break-after: avoid; break-after: avoid;'
);
console.log('✔ ReportsController.js: .tag-section-title inline style break-after is avoid');

// 3. Verify Cache version sync across 8 HTML files
const versionJson = JSON.parse(fs.readFileSync('version.json', 'utf8'));
const buildId = versionJson.buildId;
assert.ok(buildId, 'buildId in version.json must exist');

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

for (const htmlFile of htmlFiles) {
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    assert.ok(
        htmlContent.includes(`CURRENT_APP_BUILD = '${buildId}'`),
        `${htmlFile} must declare CURRENT_APP_BUILD = '${buildId}'`
    );
    assert.ok(
        htmlContent.includes(`?v=${buildId}`),
        `${htmlFile} must have asset tags stamped with ?v=${buildId}`
    );
    console.log(`✔ Cache sync: ${htmlFile} buildId matched (${buildId})`);
}

console.log('--- ALL VERIFICATIONS PASSED SUCCESSFULLY! ---');
