import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('========================================================================');
console.log(' ADVERSARIAL QA AUDIT & STRESS TEST: Reports Print / Export PDF Fix');
console.log('========================================================================\n');

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

// -----------------------------------------------------------------------------
// Test 1: Node syntax validation
// -----------------------------------------------------------------------------
runTest('Check Node ESM syntax of UIHelpers.js and ReportsController.js', () => {
    assert.doesNotThrow(async () => {
        await import('../../assets/js/core/UIHelpers.js');
    });
});

// -----------------------------------------------------------------------------
// Test 2: UIHelpers CSS Paged Media Specification Conformance
// -----------------------------------------------------------------------------
const uiHelpersRaw = fs.readFileSync('assets/js/core/UIHelpers.js', 'utf8').replace(/\r\n/g, '\n');

runTest('UIHelpers CSS: Paged Media Specification Conformance', () => {
    // 1. Tag Section Block
    assert.ok(uiHelpersRaw.includes('.tag-section-block {\n            margin-bottom: 22px;\n            page-break-inside: auto;\n            break-inside: auto;\n        }'),
        'Must have explicit page-break-inside: auto and break-inside: auto');
    assert.ok(!uiHelpersRaw.includes('.tag-section-block {\n            margin-bottom: 22px;\n            page-break-inside: avoid;'),
        'Must NOT have page-break-inside: avoid');

    // 2. Report Header
    assert.ok(uiHelpersRaw.includes('.report-header {\n            text-align: center;\n            margin-bottom: 16px;\n            border-bottom: 2px solid ${headerColor};\n            padding-bottom: 10px;\n            page-break-after: avoid;\n            break-after: avoid;\n        }'),
        'Report header must avoid orphan break');

    // 3. Tag Section Title
    assert.ok(uiHelpersRaw.includes('.tag-section-title {\n            font-size: 14px;\n            font-weight: 700;\n            padding: 7px 14px;\n            border-radius: 6px;\n            color: #FFFFFF;\n            margin-bottom: 6px;\n            page-break-after: avoid;\n            break-after: avoid;\n        }'),
        'Tag section title must avoid break after');

    // 4. Day Section Banner
    assert.ok(uiHelpersRaw.includes('.day-section-banner {\n            page-break-after: avoid;\n            break-after: avoid;\n        }'),
        'Day section banner must avoid break after in UIHelpers CSS');

    // 5. Table Layout
    assert.ok(uiHelpersRaw.includes('table {\n            width: 100%;\n            table-layout: fixed;\n            border-collapse: collapse;\n            font-size: 13px;\n            margin-bottom: 12px;\n            page-break-inside: auto;\n            break-inside: auto;\n        }'),
        'Table layout must be fixed with collapse and auto break');

    // 6. Thead Repeating
    assert.ok(uiHelpersRaw.includes('thead {\n            display: table-header-group;\n            page-break-inside: avoid;\n            break-inside: avoid;\n            page-break-after: avoid;\n            break-after: avoid;\n        }'),
        'Thead must be table-header-group with break avoidance');

    // 7. Table Row Break Inside Avoidance
    assert.ok(uiHelpersRaw.includes('tr {\n            page-break-inside: avoid;\n            break-inside: avoid;\n        }'),
        'tr must avoid breaking inside');

    // 8. Group Rows
    assert.ok(uiHelpersRaw.includes('.group-row, .sub-group-row {\n            page-break-after: avoid;\n            break-after: avoid;\n        }'),
        'Group rows must avoid break after');

    // 9. @page Margins & Orientation
    assert.ok(uiHelpersRaw.includes('@page {\n            size: A4 landscape;\n            margin: 8mm 10mm;\n        }'),
        '@page must be A4 landscape with 8mm 10mm margins');

    // 10. Print media reset
    assert.ok(uiHelpersRaw.includes('@media print {\n            .toolbar { display: none !important; }\n            body {\n                margin: 0;\n                padding: 0;\n            }\n        }'),
        '@media print must reset body margin & padding to 0');
});

// -----------------------------------------------------------------------------
// Test 3: UIHelpers.printReportInNewTab Robustness & Edge Cases
// -----------------------------------------------------------------------------
const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');

runTest('UIHelpers.printReportInNewTab: Popup blocked handling', () => {
    let alertCalled = false;
    const origOpen = global.window ? global.window.open : undefined;
    global.window = {
        open: () => null // simulate popup blocker
    };
    UIHelpers.alert = (title, msg, type) => {
        alertCalled = true;
        assert.ok(title.includes('ไม่สามารถเปิดแท็บใหม่ได้'));
    };

    UIHelpers.printReportInNewTab({
        title: 'Test',
        subtitle: 'Test Sub',
        tableHtml: '<div>Test</div>'
    });

    assert.ok(alertCalled, 'Must show alert when window.open returns null');
    if (origOpen) global.window.open = origOpen;
});

runTest('UIHelpers.printReportInNewTab: HTML Document Assembly & Security', () => {
    let outputHtml = '';
    global.window = {
        open: () => ({
            document: {
                open: () => {},
                write: (content) => { outputHtml = content; },
                close: () => {}
            }
        })
    };

    UIHelpers.printReportInNewTab({
        title: 'รายงานการลงเวลาประจำวัน',
        subtitle: 'สังกัด: สำนักตรวจสอบและบังคับการ',
        tableHtml: '<div class="tag-section-block"><table><thead><tr><th>ลำดับ</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table></div>',
        headerColor: '#123456'
    });

    assert.ok(outputHtml.includes('<!DOCTYPE html>'));
    assert.ok(outputHtml.includes('<html lang="th">'));
    assert.ok(outputHtml.includes('border-bottom: 2px solid #123456;'));
    assert.ok(outputHtml.includes('background-color: #123456;'));
    assert.ok(outputHtml.includes('size: A4 landscape;'));
    assert.ok(outputHtml.includes('margin: 8mm 10mm;'));
    assert.ok(outputHtml.includes('display: table-header-group;'));
    assert.ok(outputHtml.includes('window.print()'));
});

// -----------------------------------------------------------------------------
// Test 4: Simulation of 250-row "ไม่ลงเวลา" Report Generation
// -----------------------------------------------------------------------------
runTest('Stress Test: 250 Records Pagination & Row Integrity', () => {
    // Generate 250 rows resembling real records
    let rowsHtml = '';
    for (let i = 1; i <= 250; i++) {
        rowsHtml += `<tr><td style="text-align: center;">${i}</td><td>เจ้าหน้าที่ ทดสอบ ${i}</td><td>เจ้าพนักงานเทศกิจปฏิบัติการ</td><td style="text-align: center;">-</td><td style="text-align: center;">-</td><td>-</td><td>-</td><td>ยังไม่ลงเวลา</td></tr>`;
    }

    const testTableHtml = `
        <div class="tag-section-block">
            <div class="tag-section-title" style="background-color: #EF4444; page-break-after: avoid; break-after: avoid;">
                ตารางสถานะ: ไม่ลงเวลา - ประจำวันที่ 11 พฤศจิกายน 2569 (จำนวน 250 รายการ)
            </div>
            <table>
                <colgroup>
                    <col style="width: 5%;">
                    <col style="width: 18%;">
                    <col style="width: 17%;">
                    <col style="width: 9%;">
                    <col style="width: 9%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 12%;">
                </colgroup>
                <thead>
                    <tr>
                        <th>ลำดับ</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>ตำแหน่ง</th>
                        <th>เวลาเข้างาน</th>
                        <th>เวลาออกงาน</th>
                        <th>พิกัด GPS เข้างาน</th>
                        <th>พิกัด GPS ออกงาน</th>
                        <th>หมายเหตุ</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    `;

    let generatedPage = '';
    global.window = {
        open: () => ({
            document: {
                open: () => {},
                write: (h) => { generatedPage = h; },
                close: () => {}
            }
        })
    };

    UIHelpers.printReportInNewTab({
        title: 'รายงานการลงเวลาปฏิบัติราชการ สำนักเทศกิจ',
        subtitle: 'ประจำวันที่ 11 พฤศจิกายน 2569',
        tableHtml: testTableHtml
    });

    // Normalize whitespace for CSS check
    const normalizedPage = generatedPage.replace(/\s+/g, ' ');
    assert.ok(normalizedPage.includes('.tag-section-block { margin-bottom: 22px; page-break-inside: auto; break-inside: auto; }'));
    assert.ok(normalizedPage.includes('display: table-header-group;'));
    assert.ok(normalizedPage.includes('tr { page-break-inside: avoid; break-inside: avoid; }'));
    assert.ok(generatedPage.includes('ตารางสถานะ: ไม่ลงเวลา - ประจำวันที่ 11 พฤศจิกายน 2569 (จำนวน 250 รายการ)'));
    assert.ok(generatedPage.includes('เจ้าหน้าที่ ทดสอบ 250'));
});

// -----------------------------------------------------------------------------
// Test 5: Cache Version Synchronization Across 8 HTML Files
// -----------------------------------------------------------------------------
runTest('Mandatory Cache Version Sync Audit across 8 HTML files and version.json', () => {
    const versionData = JSON.parse(fs.readFileSync('version.json', 'utf8'));
    const expectedBuildId = '20261111_da291023';
    assert.strictEqual(versionData.buildId, expectedBuildId, `version.json buildId must be ${expectedBuildId}`);

    const htmlFiles = [
        'index.html', 'checkin.html', 'dashboard.html', 'approvals.html',
        'reports.html', 'personnel.html', 'settings.html', 'users.html'
    ];

    for (const hf of htmlFiles) {
        const content = fs.readFileSync(hf, 'utf8');
        
        // 1. Inlined CURRENT_APP_BUILD check
        const matchBuild = content.match(/const\s+CURRENT_APP_BUILD\s*=\s*'([^']+)'/);
        assert.ok(matchBuild, `${hf} must have CURRENT_APP_BUILD defined`);
        assert.strictEqual(matchBuild[1], expectedBuildId, `${hf} CURRENT_APP_BUILD is ${matchBuild[1]}, expected ${expectedBuildId}`);

        // 2. Query param ?v= check for all assets/ references
        const assetMatches = content.match(/(?:src|href)="assets\/[^"]+"/g) || [];
        assert.ok(assetMatches.length > 0, `${hf} must have at least one assets/ reference`);
        for (const ref of assetMatches) {
            assert.ok(ref.includes(`?v=${expectedBuildId}`), `${hf} asset tag ${ref} does not match ?v=${expectedBuildId}`);
        }
    }
});

// -----------------------------------------------------------------------------
// Test 6: Working Tree Surgical Scope Validation
// -----------------------------------------------------------------------------
runTest('Working Tree Scope: Zero unintended modifications', () => {
    const allowedExact = new Set([
        'approvals.html',
        'assets/js/controllers/ReportsController.js',
        'assets/js/core/UIHelpers.js',
        'checkin.html',
        'dashboard.html',
        'index.html',
        'personnel.html',
        'reports.html',
        'settings.html',
        'users.html',
        'version.json',
        '.ai_map/01_FILE_FUNCTION_INDEX.md',
        '.ai_map/CODE_INDEX.json'
    ]);

    const gitStatus = fs.readFileSync(0, 'utf8');
    const lines = gitStatus.split(/\r?\n/).filter(Boolean);

    for (const line of lines) {
        const trimmed = line.trim();
        // Ignore untracked pipeline files
        if (trimmed.startsWith('?? pipeline/')) continue;
        
        // Match modified files
        const match = trimmed.match(/^[MADRCU?!]{1,2}\s+(.+)$/);
        if (match) {
            const filePath = match[1].trim();
            if (filePath.startsWith('pipeline/')) continue;
            assert.ok(allowedExact.has(filePath), `Unintended file touched in working tree: ${filePath}`);
        }
    }
});

console.log('\n========================================================================');
console.log(` FINAL AUDIT RESULTS: Total: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);
console.log('========================================================================\n');

if (failCount > 0) process.exit(1);
