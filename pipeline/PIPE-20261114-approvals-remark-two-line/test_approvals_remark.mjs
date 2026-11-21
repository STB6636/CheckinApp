import fs from 'fs';

// Read ApprovalsController.js
const content = fs.readFileSync('assets/js/controllers/ApprovalsController.js', 'utf8');

// We can instantiate ApprovalsController with mocked DOM and core imports
globalThis.document = {
    addEventListener: () => {},
    getElementById: () => null,
    documentElement: {
        classList: {
            remove: () => {},
            add: () => {}
        }
    }
};
globalThis.window = {
    addEventListener: () => {},
    location: { protocol: 'http:', pathname: '/approvals.html', replace: () => {} },
    history: { replaceState: () => {} }
};
globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {}
};
globalThis.location = {
    protocol: 'http:',
    pathname: '/approvals.html'
};

async function run() {
    const { ApprovalsController } = await import('../../assets/js/controllers/ApprovalsController.js');
    const ctrl = new ApprovalsController();

    // To test #buildRequestRowHtml, we can expose it via a small test harness or evaluate
    // Let's create an evaluation function matching the exact implementation in ApprovalsController
    const testCases = [
        {
            name: 'Case 1: Standard separated offsite',
            req: {
                id: 1,
                remark: 'ปฏิบัติงานภารกิจเร่งด่วน',
                offsite_reason: 'ปฏิบัติงานนอกสถานที่',
                location_mode: 'OFFSITE'
            },
            expectedLines: ['ปฏิบัติงานภารกิจเร่งด่วน', '(ปฏิบัติงานนอกสถานที่)'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 2: Pre-combined req.remark (legacy or GAS record without location_mode or offsite_reason)',
            req: {
                id: 2,
                remark: 'ปฏิบัติงานภารกิจเร่งด่วน (ปฏิบัติงานนอกสถานที่)',
                offsite_reason: null,
                location_mode: null
            },
            expectedLines: ['ปฏิบัติงานภารกิจเร่งด่วน', '(ปฏิบัติงานนอกสถานที่)'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 3: Pre-combined req.remark with location_mode: OFFSITE',
            req: {
                id: 3,
                remark: 'ปฏิบัติงานภารกิจเร่งด่วน (ปฏิบัติงานนอกสถานที่)',
                offsite_reason: null,
                location_mode: 'OFFSITE'
            },
            expectedLines: ['ปฏิบัติงานภารกิจเร่งด่วน', '(ปฏิบัติงานนอกสถานที่)'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 4: Pre-combined req.remark and offsite_reason both provided',
            req: {
                id: 4,
                remark: 'ปฏิบัติงานภารกิจเร่งด่วน (ปฏิบัติงานนอกสถานที่)',
                offsite_reason: 'ปฏิบัติงานนอกสถานที่',
                location_mode: 'OFFSITE'
            },
            expectedLines: ['ปฏิบัติงานภารกิจเร่งด่วน', '(ปฏิบัติงานนอกสถานที่)'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 5: WFH separated',
            req: {
                id: 5,
                remark: 'ปฏิบัติงานภารกิจเร่งด่วน',
                offsite_reason: 'ปฏิบัติงานที่บ้าน (WFH)',
                location_mode: 'OFFSITE'
            },
            expectedLines: ['ปฏิบัติงานภารกิจเร่งด่วน', '(ปฏิบัติงานที่บ้าน (WFH))'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 6: WFH standalone reason (must remain 1 line)',
            req: {
                id: 6,
                remark: 'ปฏิบัติงานที่บ้าน (WFH)',
                offsite_reason: null,
                location_mode: 'OFFSITE'
            },
            expectedLines: ['ปฏิบัติงานที่บ้าน (WFH)'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 7: WFH standalone when offsite_reason also equals WFH (must remain 1 line)',
            req: {
                id: 7,
                remark: 'ปฏิบัติงานที่บ้าน (WFH)',
                offsite_reason: 'ปฏิบัติงานที่บ้าน (WFH)',
                location_mode: 'OFFSITE'
            },
            expectedLines: ['ปฏิบัติงานที่บ้าน (WFH)'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 8: ONSITE custom reason (must remain 1 line, ignore null offsite)',
            req: {
                id: 8,
                remark: 'อื่นๆ: ทดสอบเหตุผลคำขอ',
                offsite_reason: null,
                location_mode: 'ONSITE'
            },
            expectedLines: ['อื่นๆ: ทดสอบเหตุผลคำขอ'],
            expectedModeBadge: '[ในสถานที่]'
        },
        {
            name: 'Case 9: ONSITE with stale offsite_reason (must remain 1 line, omit stale offsite)',
            req: {
                id: 9,
                remark: 'ลืมลงเวลาปฏิบัติราชการ',
                offsite_reason: 'อบรม/สัมมนา/ประชุมราชการ',
                location_mode: 'ONSITE'
            },
            expectedLines: ['ลืมลงเวลาปฏิบัติราชการ'],
            expectedModeBadge: '[ในสถานที่]'
        },
        {
            name: 'Case 10: OFFSITE custom reason with free-form parenthesis (not an offsite job type, must remain 1 line)',
            req: {
                id: 10,
                remark: 'อื่นๆ: ทดสอบเหตุผลคำขอ (ข้อสังเกตเพิ่มเติม)',
                offsite_reason: null,
                location_mode: 'OFFSITE'
            },
            expectedLines: ['อื่นๆ: ทดสอบเหตุผลคำขอ (ข้อสังเกตเพิ่มเติม)'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 11: Empty remark with offsite_reason provided',
            req: {
                id: 11,
                remark: '',
                offsite_reason: 'ปฏิบัติงานนอกสถานที่',
                location_mode: 'OFFSITE'
            },
            expectedLines: ['กรณีพิเศษ', '(ปฏิบัติงานนอกสถานที่)'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 12: Dash remark and dash offsite',
            req: {
                id: 12,
                remark: '-',
                offsite_reason: '-',
                location_mode: 'ONSITE'
            },
            expectedLines: ['-'],
            expectedModeBadge: '[ในสถานที่]'
        },
        {
            name: 'Case 13: XSS escaping test',
            req: {
                id: 13,
                remark: '<script>alert("xss")</script>',
                offsite_reason: '<b>นอกสถานที่</b>',
                location_mode: 'OFFSITE'
            },
            expectedEscaped: ['&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;', '(&lt;b&gt;นอกสถานที่&lt;/b&gt;)'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 14: Double nested parentheses in offsite_reason',
            req: {
                id: 14,
                remark: 'ปฏิบัติงานภารกิจเร่งด่วน',
                offsite_reason: '((ปฏิบัติงานนอกสถานที่))',
                location_mode: 'OFFSITE'
            },
            expectedLines: ['ปฏิบัติงานภารกิจเร่งด่วน', '(ปฏิบัติงานนอกสถานที่)'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 15: Unmatched parenthesis in remark (must not throw or break)',
            req: {
                id: 15,
                remark: 'อื่นๆ: ปฏิบัติงานภารกิจเร่งด่วน (ข้อสังเกต',
                offsite_reason: null,
                location_mode: 'OFFSITE'
            },
            expectedLines: ['อื่นๆ: ปฏิบัติงานภารกิจเร่งด่วน (ข้อสังเกต'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 16: Null remark and null offsite_reason',
            req: {
                id: 16,
                remark: null,
                offsite_reason: null,
                location_mode: 'ONSITE'
            },
            expectedLines: ['-'],
            expectedModeBadge: '[ในสถานที่]'
        },
        {
            name: 'Case 17: Pre-combined duplicate remark string with null offsite (must deduplicate to 1 line)',
            req: {
                id: 17,
                remark: 'ปฏิบัติงานนอกสถานที่ (ปฏิบัติงานนอกสถานที่)',
                offsite_reason: null,
                location_mode: 'OFFSITE'
            },
            expectedLines: ['ปฏิบัติงานนอกสถานที่'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 18: Pre-combined duplicate remark with matching offsite_reason (must deduplicate to 1 line)',
            req: {
                id: 18,
                remark: 'ปฏิบัติงานนอกสถานที่ (ปฏิบัติงานนอกสถานที่)',
                offsite_reason: 'ปฏิบัติงานนอกสถานที่',
                location_mode: 'OFFSITE'
            },
            expectedLines: ['ปฏิบัติงานนอกสถานที่'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 19: Standalone WFH when offsite_reason is WFH acronym (must remain 1 line)',
            req: {
                id: 19,
                remark: 'ปฏิบัติงานที่บ้าน (WFH)',
                offsite_reason: 'WFH',
                location_mode: 'OFFSITE'
            },
            expectedLines: ['ปฏิบัติงานที่บ้าน (WFH)'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 20: Standalone WFH when remark is ปฏิบัติงานที่บ้าน and offsite is WFH (must normalize to 1 line)',
            req: {
                id: 20,
                remark: 'ปฏิบัติงานที่บ้าน',
                offsite_reason: 'WFH',
                location_mode: 'OFFSITE'
            },
            expectedLines: ['ปฏิบัติงานที่บ้าน (WFH)'],
            expectedModeBadge: '[นอกสถานที่]'
        },
        {
            name: 'Case 21: ONSITE inference when offsite_reason is dash and location_mode is null (must not tag as offsite)',
            req: {
                id: 21,
                remark: 'ลืมลงเวลาปฏิบัติราชการ',
                offsite_reason: '-',
                location_mode: null
            },
            expectedLines: ['ลืมลงเวลาปฏิบัติราชการ'],
            expectedModeBadge: '[ในสถานที่]'
        }
    ];

    // Inject row builder test method into ctrl
    const rowBuilderCode = content.match(/#buildRequestRowHtml\(req, indexNo\) \{([\s\S]*?)\n    \}/)[0];
    const formatRemarkCode = content.match(/#formatRemarkCellHtml\(req, isOffsite\) \{([\s\S]*?)\n    \}/)[0];
    const escapeHtmlCode = content.match(/#escapeHtml\(str\) \{([\s\S]*?)\n    \}/)[0];

    const testFn = new Function('req', 'indexNo', `
        const UIHelpers = {
            formatPosition: () => 'ตำแหน่ง',
            formatThaiDate: () => '14 พ.ย. 2569'
        };
        const that = {
            selectedIds: new Set(),
            escapeHtml: ${escapeHtmlCode.replace('#escapeHtml', 'function')},
            formatRemarkCellHtml: ${formatRemarkCode.replace('#formatRemarkCellHtml', 'function').replace(/this\.#escapeHtml/g, 'this.escapeHtml')}
        };
        const fn = ${rowBuilderCode
            .replace('#buildRequestRowHtml', 'function')
            .replace('this.#formatRemarkCellHtml(req, isOffsite)', 'that.formatRemarkCellHtml(req, isOffsite)')};
        return fn.call(that, req, indexNo);
    `);

    let passed = 0;
    let failed = 0;

    for (const tc of testCases) {
        const rowHtml = testFn(tc.req, 1);
        let ok = true;
        const reasons = [];

        if (tc.expectedModeBadge && !rowHtml.includes(tc.expectedModeBadge)) {
            ok = false;
            reasons.push(`Mode badge mismatch: expected to include "${tc.expectedModeBadge}"`);
        }

        if (tc.expectedLines) {
            if (tc.expectedLines.length === 1) {
                // Must have single line text and NOT have 2-line flex-col
                if (rowHtml.includes('flex-col')) {
                    ok = false;
                    reasons.push(`Expected 1 line, but found 2-line flex-col container`);
                }
                if (!rowHtml.includes(tc.expectedLines[0])) {
                    ok = false;
                    reasons.push(`Missing Line 1: "${tc.expectedLines[0]}"`);
                }
            } else if (tc.expectedLines.length === 2) {
                if (!rowHtml.includes('flex-col')) {
                    ok = false;
                    reasons.push(`Expected 2 lines with flex-col container, but not found`);
                }
                if (!rowHtml.includes(tc.expectedLines[0])) {
                    ok = false;
                    reasons.push(`Missing Line 1: "${tc.expectedLines[0]}"`);
                }
                if (!rowHtml.includes(tc.expectedLines[1])) {
                    ok = false;
                    reasons.push(`Missing Line 2: "${tc.expectedLines[1]}"`);
                }
            }
        }

        if (tc.expectedEscaped) {
            for (const esc of tc.expectedEscaped) {
                if (!rowHtml.includes(esc)) {
                    ok = false;
                    reasons.push(`Missing escaped string: "${esc}"`);
                }
            }
            if (rowHtml.includes('<script>') || rowHtml.includes('<b>')) {
                ok = false;
                reasons.push('Raw unescaped HTML found in output!');
            }
        }

        if (ok) {
            console.log(`✅ [PASS] ${tc.name}`);
            passed++;
        } else {
            console.log(`❌ [FAIL] ${tc.name}`);
            for (const r of reasons) {
                console.log(`     - ${r}`);
            }
            failed++;
        }
    }

    console.log(`\nTotal: ${testCases.length} | Passed: ${passed} | Failed: ${failed}`);
    if (failed > 0) {
        process.exit(1);
    }
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
