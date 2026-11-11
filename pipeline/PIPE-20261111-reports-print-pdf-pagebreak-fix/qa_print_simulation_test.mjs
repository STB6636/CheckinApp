import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log(' SIMULATION QA AUDIT: Reports Print PDF Generation Scenarios');
console.log('================================================================\n');

// Mock DOM elements and environment
global.window = {
    __BMA_SPA_ROUTER_ACTIVE__: true,
    location: {
        protocol: 'http:',
        host: 'localhost',
        pathname: '/reports.html',
        search: '',
        hash: '',
        replace: () => {}
    },
    addEventListener: () => {},
    localStorage: {
        getItem: () => null,
        setItem: () => {}
    }
};

global.document = {
    readyState: 'complete',
    documentElement: {
        classList: {
            add: () => {},
            remove: () => {},
            contains: () => false
        }
    },
    addEventListener: () => {},
    getElementById: (id) => {
        if (id === 'reportSingleDateInput') return { value: '2026-11-11' };
        if (id === 'reportTablesMasterContainer') return { innerHTML: '' };
        return null;
    }
};

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

// Import UIHelpers
const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');

// Test 1: UIHelpers.printReportInNewTab HTML structure
runTest('Scenario 1: UIHelpers.printReportInNewTab HTML generation', () => {
    let capturedHtml = '';
    const fakeWindow = {
        document: {
            open: () => {},
            write: (html) => { capturedHtml = html; },
            close: () => {}
        }
    };
    const origOpen = global.window.open;
    global.window.open = () => fakeWindow;

    UIHelpers.printReportInNewTab({
        title: 'รายงานการลงเวลาปฏิบัติราชการ สำนักเทศกิจ',
        subtitle: 'สังกัด: สำนักตรวจสอบและบังคับการ • ประจำวันที่ 11 พฤศจิกายน 2569',
        tableHtml: `
            <div class="tag-section-block">
                <div class="tag-section-title" style="background-color: #EF4444; page-break-after: avoid; break-after: avoid;">
                    ตารางสถานะ: ไม่ลงเวลา - ประจำวันที่ 11 พฤศจิกายน 2569 (จำนวน 243 รายการ)
                </div>
                <table>
                    <colgroup><col style="width: 5%;"><col style="width: 95%;"></colgroup>
                    <thead><tr><th>ลำดับ</th><th>ชื่อ-นามสกุล</th></tr></thead>
                    <tbody><tr><td>1</td><td>นายทดสอบ</td></tr></tbody>
                </table>
            </div>
        `,
        headerColor: '#007B3E'
    });

    global.window.open = origOpen;

    assert.ok(capturedHtml.includes('<!DOCTYPE html>'), 'Valid HTML doctype');
    assert.ok(capturedHtml.includes('size: A4 landscape;'), 'A4 landscape defined');
    assert.ok(capturedHtml.includes('margin: 8mm 10mm;'), '8mm 10mm margin defined');
    assert.ok(capturedHtml.includes('page-break-inside: auto;'), 'page-break-inside: auto defined');
    assert.ok(capturedHtml.includes('break-inside: auto;'), 'break-inside: auto defined');
    assert.ok(capturedHtml.includes('display: table-header-group;'), 'table-header-group defined');
    assert.ok(capturedHtml.includes('tr {\n            page-break-inside: avoid;\n            break-inside: avoid;'), 'tr avoids break inside');
    assert.ok(capturedHtml.includes('.group-row, .sub-group-row {\n            page-break-after: avoid;\n            break-after: avoid;'), 'group-row avoids break after');
    assert.ok(capturedHtml.includes('.report-header {\n            text-align: center;\n            margin-bottom: 16px;\n            border-bottom: 2px solid #007B3E;\n            padding-bottom: 10px;\n            page-break-after: avoid;\n            break-after: avoid;'), 'report-header avoids break after');
    assert.ok(capturedHtml.includes('รายงานการลงเวลาปฏิบัติราชการ สำนักเทศกิจ'), 'Title present');
    assert.ok(capturedHtml.includes('ตารางสถานะ: ไม่ลงเวลา'), 'Table HTML injected properly');
});

// Test 2: CSS Pagination Properties Integrity
runTest('Scenario 2: CSS Pagination Rules in UIHelpers.js', () => {
    const uiSrc = fs.readFileSync('assets/js/core/UIHelpers.js', 'utf8').replace(/\r\n/g, '\n');

    // Root cause fix: .tag-section-block must be auto, not avoid
    assert.ok(uiSrc.includes('.tag-section-block {\n            margin-bottom: 22px;\n            page-break-inside: auto;\n            break-inside: auto;\n        }'),
        '.tag-section-block must have page-break-inside: auto and break-inside: auto');
    assert.ok(!uiSrc.includes('.tag-section-block {\n            margin-bottom: 22px;\n            page-break-inside: avoid;'),
        '.tag-section-block must NOT have page-break-inside: avoid');

    // Thead must repeat on every page
    assert.ok(uiSrc.includes('thead {\n            display: table-header-group;\n            page-break-inside: avoid;\n            break-inside: avoid;\n            page-break-after: avoid;\n            break-after: avoid;\n        }'),
        'thead must be table-header-group and avoid breaking');

    // Table rows must not split across pages
    assert.ok(uiSrc.includes('tr {\n            page-break-inside: avoid;\n            break-inside: avoid;\n        }'),
        'tr must avoid breaking inside');

    // Page margins
    assert.ok(uiSrc.includes('@page {\n            size: A4 landscape;\n            margin: 8mm 10mm;\n        }'),
        '@page must be A4 landscape with 8mm 10mm margin');

    // Print body margin & padding reset
    assert.ok(uiSrc.includes('@media print {\n            .toolbar { display: none !important; }\n            body {\n                margin: 0;\n                padding: 0;\n            }\n        }'),
        '@media print must reset body margin & padding to 0 and hide toolbar');
});

// Test 3: ReportsController.js inline styles
runTest('Scenario 3: ReportsController.js inline styles integrity', () => {
    const repSrc = fs.readFileSync('assets/js/controllers/ReportsController.js', 'utf8');

    // day-section-banner
    assert.ok(repSrc.includes('class="day-section-banner" style="background-color: #00351B; color: #FFFFFF; padding: 8px 14px; font-weight: 800; font-size: 15px; border-radius: 6px; margin-top: 18px; margin-bottom: 12px; page-break-after: avoid; break-after: avoid;"'),
        'day-section-banner has inline break-after: avoid');

    // tag-section-title in forPrintPdf branch
    assert.ok(repSrc.includes('class="tag-section-title" style="background-color: ${statusColor}; page-break-after: avoid; break-after: avoid;"'),
        'tag-section-title has inline break-after: avoid');
});

console.log('\n================================================================');
console.log(` SIMULATION SUMMARY: Total: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);
console.log('================================================================');
if (failCount > 0) process.exit(1);
