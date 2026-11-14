import fs from 'node:fs';

// Setup Mock DOM
const mockElements = new Map();

function createMockElement(tag = 'div', id = '') {
    const el = {
        tagName: tag.toUpperCase(),
        id,
        innerHTML: '',
        textContent: '',
        value: '',
        checked: false,
        classList: {
            add: () => {},
            remove: () => {},
            contains: () => false
        },
        querySelector: (sel) => {
            if (sel.includes('colspan="8"')) return null;
            return null;
        },
        querySelectorAll: () => [],
        addEventListener: () => {},
        setAttribute: () => {},
        getAttribute: () => null
    };
    if (id) mockElements.set(id, el);
    return el;
}

const tbody = createMockElement('tbody', 'approvalsTableBody');
const statusFilter = createMockElement('select', 'selectApprovalStatusFilter');
statusFilter.value = 'pending';
const bulkCount = createMockElement('span', 'selectedBulkCount');
const selectAllChk = createMockElement('input', 'chkSelectAllApprovals');

globalThis.document = {
    addEventListener: () => {},
    getElementById: (id) => mockElements.get(id) || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: (tag) => createMockElement(tag),
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

async function testRealApprovalsController() {
    console.log('--- STARTING REAL ApprovalsController INSTANCE TEST ---');

    const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');
    const { AppLayout } = await import('../../assets/js/components/AppLayout.js');
    const { AttendanceModel } = await import('../../assets/js/models/AttendanceModel.js');
    const { ApprovalsController } = await import('../../assets/js/controllers/ApprovalsController.js');

    // Mock AppLayout.initAdminLayout so init() doesn't fail
    AppLayout.initAdminLayout = async () => ({
        currentUser: {
            id: 'admin-001',
            full_name: 'ผู้ดูแลระบบ ทดสอบ',
            role: 'superadmin',
            role_level: 1
        }
    });

    // Mock notification bell refresh
    AppLayout.refreshNotificationBell = async () => {};

    // Mock UIHelpers loading
    UIHelpers.showLoading = () => {};
    UIHelpers.hideLoading = () => {};
    UIHelpers.renderTableSkeleton = () => '<tr><td>Loading...</td></tr>';

    const testRecords = [
        {
            id: 101,
            remark: 'ปฏิบัติงานภารกิจเร่งด่วน',
            offsite_reason: 'ปฏิบัติงานนอกสถานที่',
            location_mode: 'OFFSITE',
            approval_status: 'pending',
            work_date: '2026-11-14',
            shift_name: 'เวรเช้า',
            check_in_time: '08:30:00',
            check_out_time: '16:30:00',
            personnel: { bureau: 'สำนักเทศกิจ', division: 'ส่วนตรวจและบังคับการ', work_group: 'กลุ่มงานตรวจ 1', prefix: 'นาย', first_name: 'ทดสอบ', last_name: 'หนึ่ง' }
        },
        {
            id: 102,
            remark: 'ปฏิบัติงานภารกิจเร่งด่วน (ปฏิบัติงานนอกสถานที่)',
            offsite_reason: null,
            location_mode: null,
            approval_status: 'pending',
            work_date: '2026-11-14',
            shift_name: 'เวรเช้า',
            personnel: { bureau: 'สำนักเทศกิจ', division: 'ส่วนตรวจและบังคับการ', work_group: 'กลุ่มงานตรวจ 1', prefix: 'นาย', first_name: 'ทดสอบ', last_name: 'สอง' }
        },
        {
            id: 103,
            remark: 'ปฏิบัติงานที่บ้าน (WFH)',
            offsite_reason: null,
            location_mode: 'OFFSITE',
            approval_status: 'pending',
            work_date: '2026-11-14',
            shift_name: 'เวรเช้า',
            personnel: { bureau: 'สำนักเทศกิจ', division: 'ส่วนตรวจและบังคับการ', work_group: 'กลุ่มงานตรวจ 1', prefix: 'นาย', first_name: 'ทดสอบ', last_name: 'สาม' }
        },
        {
            id: 104,
            remark: 'ลืมลงเวลาปฏิบัติราชการ',
            offsite_reason: 'อบรม/สัมมนา/ประชุมราชการ',
            location_mode: 'ONSITE',
            approval_status: 'pending',
            work_date: '2026-11-14',
            shift_name: 'เวรเช้า',
            personnel: { bureau: 'สำนักเทศกิจ', division: 'ส่วนตรวจและบังคับการ', work_group: 'กลุ่มงานตรวจ 1', prefix: 'นาย', first_name: 'ทดสอบ', last_name: 'สี่' }
        },
        {
            id: 105,
            remark: '<script>alert("xss")</script>',
            offsite_reason: '<b>นอกสถานที่</b>',
            location_mode: 'OFFSITE',
            approval_status: 'pending',
            work_date: '2026-11-14',
            shift_name: 'เวรเช้า',
            personnel: { bureau: 'สำนักเทศกิจ', division: 'ส่วนตรวจและบังคับการ', work_group: 'กลุ่มงานตรวจ 1', prefix: 'นาย', first_name: 'ทดสอบ', last_name: 'ห้า' }
        },
        {
            id: 106,
            remark: 'ปฏิบัติงานนอกสถานที่ (ปฏิบัติงานนอกสถานที่)',
            offsite_reason: null,
            location_mode: 'OFFSITE',
            approval_status: 'pending',
            work_date: '2026-11-14',
            shift_name: 'เวรเช้า',
            personnel: { bureau: 'สำนักเทศกิจ', division: 'ส่วนตรวจและบังคับการ', work_group: 'กลุ่มงานตรวจ 1', prefix: 'นาย', first_name: 'ทดสอบ', last_name: 'หก' }
        },
        {
            id: 107,
            remark: 'ปฏิบัติงานที่บ้าน (WFH)',
            offsite_reason: 'WFH',
            location_mode: 'OFFSITE',
            approval_status: 'pending',
            work_date: '2026-11-14',
            shift_name: 'เวรเช้า',
            personnel: { bureau: 'สำนักเทศกิจ', division: 'ส่วนตรวจและบังคับการ', work_group: 'กลุ่มงานตรวจ 1', prefix: 'นาย', first_name: 'ทดสอบ', last_name: 'เจ็ด' }
        },
        {
            id: 108,
            remark: 'ลืมลงเวลาปฏิบัติราชการ',
            offsite_reason: '-',
            location_mode: null,
            approval_status: 'pending',
            work_date: '2026-11-14',
            shift_name: 'เวรเช้า',
            personnel: { bureau: 'สำนักเทศกิจ', division: 'ส่วนตรวจและบังคับการ', work_group: 'กลุ่มงานตรวจ 1', prefix: 'นาย', first_name: 'ทดสอบ', last_name: 'แปด' }
        }
    ];

    // Mock AttendanceModel.getSpecialRequests to supply our records
    AttendanceModel.getSpecialRequests = async () => testRecords;

    // Instantiate REAL controller
    const ctrl = new ApprovalsController();
    await ctrl.init();

    const renderedHtml = tbody.innerHTML;

    let allPassed = true;

    function getRowHtml(id) {
        const match = renderedHtml.match(new RegExp(`<tr data-row-id="${id}">[\\s\\S]*?<\\/tr>`));
        return match ? match[0] : null;
    }

    // Test 1: Record 101 rendered 2 lines
    const row1Html = getRowHtml(101);
    if (row1Html && row1Html.includes('ปฏิบัติงานภารกิจเร่งด่วน') && row1Html.includes('(ปฏิบัติงานนอกสถานที่)') && row1Html.includes('[นอกสถานที่]')) {
        console.log('✅ [PASS] Real ApprovalsController: Separated offsite request rendered 2 lines');
    } else {
        console.error('❌ [FAIL] Real ApprovalsController: Separated offsite request failed', row1Html);
        allPassed = false;
    }

    // Test 2: Record 102 rendered 2 lines from pre-combined string
    const row2Html = getRowHtml(102);
    if (row2Html && row2Html.includes('ปฏิบัติงานภารกิจเร่งด่วน') && row2Html.includes('(ปฏิบัติงานนอกสถานที่)') && !row2Html.includes('((ปฏิบัติงานนอกสถานที่))')) {
        console.log('✅ [PASS] Real ApprovalsController: Pre-combined string split cleanly without double parentheses');
    } else {
        console.error('❌ [FAIL] Real ApprovalsController: Pre-combined string split failed', row2Html);
        allPassed = false;
    }

    // Test 3: Record 103 standalone WFH rendered 1 line
    const row3Html = getRowHtml(103);
    if (row3Html && row3Html.includes('ปฏิบัติงานที่บ้าน (WFH)') && !row3Html.includes('flex-col')) {
        console.log('✅ [PASS] Real ApprovalsController: Standalone WFH rendered on single line (no flex-col)');
    } else {
        console.error('❌ [FAIL] Real ApprovalsController: Standalone WFH wrongly split into 2 lines', row3Html);
        allPassed = false;
    }

    // Test 4: Record 104 ONSITE with stale offsite reason
    const row4Html = getRowHtml(104);
    if (row4Html && row4Html.includes('ลืมลงเวลาปฏิบัติราชการ') && !row4Html.includes('อบรม/สัมมนา') && row4Html.includes('[ในสถานที่]')) {
        console.log('✅ [PASS] Real ApprovalsController: ONSITE request omitted stale offsite reason and stayed single line');
    } else {
        console.error('❌ [FAIL] Real ApprovalsController: ONSITE request leaked stale offsite reason', row4Html);
        allPassed = false;
    }

    // Test 5: Record 105 XSS escaping
    const row5Html = getRowHtml(105);
    if (row5Html &&
        row5Html.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;') &&
        row5Html.includes('(&lt;b&gt;นอกสถานที่&lt;/b&gt;)') &&
        !row5Html.includes('<script>') && !row5Html.includes('<b>')) {
        console.log('✅ [PASS] Real ApprovalsController: XSS payloads safely escaped in DOM output');
    } else {
        console.error('❌ [FAIL] Real ApprovalsController: XSS payload escaping failed', row5Html);
        allPassed = false;
    }

    // Test 6: Record 106 Pre-combined duplicate remark string deduplicated to single line
    const row6Html = getRowHtml(106);
    if (row6Html && row6Html.includes('ปฏิบัติงานนอกสถานที่') && !row6Html.includes('flex-col')) {
        console.log('✅ [PASS] Real ApprovalsController: Pre-combined duplicate remark string deduplicated to single line');
    } else {
        console.error('❌ [FAIL] Real ApprovalsController: Duplicate remark string not deduplicated', row6Html);
        allPassed = false;
    }

    // Test 7: Record 107 Standalone WFH with offsite_reason="WFH" preserved as single line
    const row7Html = getRowHtml(107);
    if (row7Html && row7Html.includes('ปฏิบัติงานที่บ้าน (WFH)') && !row7Html.includes('flex-col')) {
        console.log('✅ [PASS] Real ApprovalsController: Standalone WFH with offsite_reason="WFH" preserved as single line');
    } else {
        console.error('❌ [FAIL] Real ApprovalsController: Standalone WFH with WFH offsite_reason wrongly split', row7Html);
        allPassed = false;
    }

    // Test 8: Record 108 Dash offsite reason with null location_mode correctly tagged as [ในสถานที่]
    const row8Html = getRowHtml(108);
    if (row8Html && row8Html.includes('ลืมลงเวลาปฏิบัติราชการ') && row8Html.includes('[ในสถานที่]') && !row8Html.includes('[นอกสถานที่]')) {
        console.log('✅ [PASS] Real ApprovalsController: Dash offsite reason with null location_mode correctly tagged as [ในสถานที่]');
    } else {
        console.error('❌ [FAIL] Real ApprovalsController: Dash offsite reason wrongly tagged as offsite', row8Html);
        allPassed = false;
    }

    if (!allPassed) {
        process.exit(1);
    }
    console.log('--- REAL ApprovalsController INSTANCE TEST COMPLETED SUCCESSFULLY ---');
}

testRealApprovalsController().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
});
