import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Load Config, UIHelpers, SettingsModel, AttendanceModel
import { Config } from '../../assets/js/core/Config.js';
import { UIHelpers } from '../../assets/js/core/UIHelpers.js';
import { SettingsModel } from '../../assets/js/models/SettingsModel.js';
import { AttendanceModel } from '../../assets/js/models/AttendanceModel.js';

console.log('================================================================');
console.log('  QA AUDIT SUITE: CheckinController Shift Filtering & Scenarios  ');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Helper: Mock DOM Element Factory
// -----------------------------------------------------------------------------
function createMockElement(id, tagName = 'div') {
    const classSet = new Set();
    return {
        id,
        tagName: tagName.toUpperCase(),
        _innerHTML: '',
        _value: '',
        textContent: '',
        style: {},
        disabled: false,
        get value() { return this._value; },
        set value(v) { this._value = String(v ?? ''); },
        get innerHTML() { return this._innerHTML; },
        set innerHTML(html) {
            this._innerHTML = html;
            // Basic value reset simulation
            if (!html.includes(`value="${this._value}"`)) {
                this._value = '';
            }
        },
        classList: {
            add(...cls) { cls.forEach(c => c && classSet.add(c)); },
            remove(...cls) { cls.forEach(c => classSet.delete(c)); },
            contains(cls) { return classSet.has(cls); },
            toggle(cls, force) {
                if (force !== undefined) {
                    if (force) classSet.add(cls); else classSet.delete(cls);
                } else {
                    if (classSet.has(cls)) classSet.delete(cls); else classSet.add(cls);
                }
            },
            get length() { return classSet.size; },
            toString() { return Array.from(classSet).join(' '); }
        },
        scrollIntoView() {},
        focus() {}
    };
}

// -----------------------------------------------------------------------------
// Setup Global Mocks for Node.js environment
// -----------------------------------------------------------------------------
const domElements = new Map();
function getOrCreateElement(id) {
    if (!domElements.has(id)) {
        domElements.set(id, createMockElement(id));
    }
    return domElements.get(id);
}

global.window = {
    location: { pathname: '/checkin.html', protocol: 'http:', replace: () => {}, assign: () => {} },
    history: { replaceState: () => {} },
    Swal: { fire: async () => ({ isConfirmed: true }) }
};
global.sessionStorage = {
    getItem: (key) => {
        if (key === Config.STORAGE_KEYS.CURRENT_USER) {
            return JSON.stringify({ id: 'user-001', personnel_id: 'pers-001', role: 'User' });
        }
        return null;
    },
    setItem: () => {},
    removeItem: () => {}
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.document = {
    documentElement: {
        setAttribute: () => {},
        classList: { add: () => {}, remove: () => {}, contains: () => false }
    },
    getElementById: (id) => getOrCreateElement(id),
    addEventListener: () => {}
};

// -----------------------------------------------------------------------------
// Dynamically build Testable CheckinController with exposed test bridge
// -----------------------------------------------------------------------------
const controllerSourcePath = path.resolve('assets/js/controllers/CheckinController.js');
let rawCode = fs.readFileSync(controllerSourcePath, 'utf8');

// Strip the auto DOMContentLoaded bootstrap
rawCode = rawCode.replace(/document\.addEventListener\('DOMContentLoaded'[\s\S]*?\);?\s*$/, '');

// Expose private methods for explicit QA verification
rawCode = rawCode.replace(
    /}\s*$/,
    `  // QA TEST BRIDGES
  test_evaluateTimeWindowAndPopulateShifts() { return this.#evaluateTimeWindowAndPopulateShifts(); }
  test_updateStatusCardsAndMainButton() { return this.#updateStatusCardsAndMainButton(); }
  test_isShiftAlreadyRecordedToday(s) { return this.#isShiftAlreadyRecordedToday(s); }
  test_isShiftActiveAtCurrentTime(s, nowMin, allowStartMin) { return this.#isShiftActiveAtCurrentTime(s, nowMin, allowStartMin); }
}`
);

const tempTestControllerPath = path.resolve('assets/js/controllers/temp_qa_test_controller.mjs');
fs.writeFileSync(tempTestControllerPath, rawCode, 'utf8');

const { CheckinController } = await import('../../assets/js/controllers/temp_qa_test_controller.mjs');

// Clean up temporary file immediately
try { fs.unlinkSync(tempTestControllerPath); } catch (e) {}

// Setup standard test shifts
const TEST_SHIFTS = [
    {
        name: 'เวลาราชการปกติ (08:30 - 16:30)',
        check_in: '08:30',
        check_out: '16:30',
        is_overtime: false,
        is_custom: false
    },
    {
        name: 'ปฏิบัติงานนอกเวลา (16:30 - 20:30)',
        check_in: '16:30',
        check_out: '20:30',
        is_overtime: true,
        is_custom: false
    },
    {
        name: 'ปฏิบัติงานนอกเวลา (17:00 - 01:00) (ข้ามวัน)',
        check_in: '17:00',
        check_out: '01:00',
        is_overtime: true,
        is_custom: false,
        is_overnight: true
    }
];

function createControllerInstance(customSettings = {}) {
    // Reset DOM Elements
    domElements.clear();
    const selectEl = getOrCreateElement('checkinShiftSelect');
    selectEl.tagName = 'SELECT';
    const btnSubmit = getOrCreateElement('btnSubmitCheckinMain');
    btnSubmit.disabled = false;
    const btnLabel = getOrCreateElement('btnSubmitCheckinLabel');
    const noticeBox = getOrCreateElement('regularCompletedNoticeBox');
    const noticeText = getOrCreateElement('regularCompletedNoticeText');
    const shiftSelectorContainer = getOrCreateElement('shiftSelectorContainer');

    const ctrl = new CheckinController();
    ctrl.settings = {
        standard_check_in: '08:30',
        standard_check_out: '16:30',
        allow_checkin_start_time: '06:00',
        checkout_grace_minutes: 30,
        filter_shifts_by_realtime: false, // allow all active candidate shifts unless overridden
        single_click_checkin: false,
        disable_normal_hours_checkin: false,
        work_shifts: structuredClone(TEST_SHIFTS),
        ...customSettings
    };
    ctrl.todayHistoryList = [];
    ctrl.activeRegularRecord = null;
    ctrl.currentUser = { id: 'user-001', personnel_id: 'pers-001', role: 'User' };
    return { ctrl, selectEl, btnSubmit, btnLabel, noticeBox, noticeText, shiftSelectorContainer };
}

// =============================================================================
// TEST SUITE 1: #isShiftAlreadyRecordedToday(shift)
// =============================================================================
console.log('--- Test Suite 1: #isShiftAlreadyRecordedToday Unit Verification ---');

{
    const { ctrl } = createControllerInstance();
    const todayIso = UIHelpers.getTodayISO();

    // 1.1 Null / undefined check
    assert.strictEqual(ctrl.test_isShiftAlreadyRecordedToday(null), false, 'null shift must return false');

    // 1.2 Normal shift with activeRegularRecord today
    ctrl.activeRegularRecord = { work_date: todayIso, check_in_time: '08:25:00' };
    assert.strictEqual(
        ctrl.test_isShiftAlreadyRecordedToday(TEST_SHIFTS[0]),
        true,
        'Regular shift must return true when activeRegularRecord is clocked in today'
    );

    // 1.3 Normal shift without activeRegularRecord
    ctrl.activeRegularRecord = null;
    assert.strictEqual(
        ctrl.test_isShiftAlreadyRecordedToday(TEST_SHIFTS[0]),
        false,
        'Regular shift must return false when no activeRegularRecord and not in todayHistoryList'
    );

    // 1.4 Overtime Shift A in todayHistoryList
    ctrl.todayHistoryList = [
        {
            work_date: todayIso,
            shift_name: 'ปฏิบัติงานนอกเวลา (17:00 - 01:00) (ข้ามวัน)',
            shift_check_in: '17:00',
            shift_check_out: '01:00',
            check_in_time: '17:02'
        }
    ];

    assert.strictEqual(
        ctrl.test_isShiftAlreadyRecordedToday(TEST_SHIFTS[2]),
        true,
        'OT Shift A (17:00-01:00) must return true when present in todayHistoryList'
    );

    // 1.5 Overtime Shift B NOT in todayHistoryList
    assert.strictEqual(
        ctrl.test_isShiftAlreadyRecordedToday(TEST_SHIFTS[1]),
        false,
        'OT Shift B (16:30-20:30) must return false when NOT present in todayHistoryList'
    );

    console.log('  [PASS] Test Suite 1 Passed: #isShiftAlreadyRecordedToday logic accurate');
}

// =============================================================================
// TEST SUITE 2: Scenario 1 - disable_normal_hours_checkin: true
// =============================================================================
console.log('\n--- Test Suite 2: Scenario 1 - disable_normal_hours_checkin: true ---');

{
    const { ctrl, selectEl } = createControllerInstance({
        disable_normal_hours_checkin: true
    });

    ctrl.test_evaluateTimeWindowAndPopulateShifts();

    // Verify candidate shifts do not contain regular shift
    const availableNames = ctrl.availableShiftsForCurrentWindow.map(s => s.name);
    console.log('  Available shifts with disable_normal_hours_checkin:', availableNames);

    assert(
        !availableNames.some(name => name.includes('เวลาราชการปกติ')),
        'Candidate shifts must NOT contain เวลาราชการปกติ'
    );
    assert(
        !selectEl.innerHTML.includes('เวลาราชการปกติ'),
        'Dropdown HTML must NOT render เวลาราชการปกติ'
    );
    assert(
        selectEl.innerHTML.includes('ปฏิบัติงานนอกเวลา (16:30 - 20:30)'),
        'Dropdown HTML must still include OT Shift B'
    );
    assert(
        selectEl.innerHTML.includes('ปฏิบัติงานนอกเวลา (17:00 - 01:00)'),
        'Dropdown HTML must still include OT Shift A'
    );

    console.log('  [PASS] Scenario 1 Passed: เวลาราชการปกติ disappeared immediately from dropdown');
}

// =============================================================================
// TEST SUITE 3: Scenario 2 - Shift A Recorded -> Disappears from Dropdown
// =============================================================================
console.log('\n--- Test Suite 3: Scenario 2 - Shift A recorded -> Disappears from Dropdown ---');

{
    const { ctrl, selectEl } = createControllerInstance();
    const todayIso = UIHelpers.getTodayISO();

    // Simulate Shift A recorded
    ctrl.todayHistoryList = [
        {
            work_date: todayIso,
            shift_name: 'ปฏิบัติงานนอกเวลา (17:00 - 01:00) (ข้ามวัน)',
            shift_check_in: '17:00',
            shift_check_out: '01:00'
        }
    ];

    ctrl.test_evaluateTimeWindowAndPopulateShifts();

    const availableNames = ctrl.availableShiftsForCurrentWindow.map(s => s.name);
    console.log('  Available shifts after Shift A recorded:', availableNames);

    assert(
        !availableNames.some(name => name.includes('17:00 - 01:00')),
        'Shift A (17:00 - 01:00) must NOT be in available shifts'
    );
    assert(
        !selectEl.innerHTML.includes('17:00 - 01:00'),
        'Dropdown HTML must NOT include Shift A (17:00 - 01:00)'
    );

    console.log('  [PASS] Scenario 2 Passed: Shift A disappeared from Dropdown upon next render');
}

// =============================================================================
// TEST SUITE 4: Scenario 3 - Shift B Unrecorded -> Still Visible in Dropdown
// =============================================================================
console.log('\n--- Test Suite 4: Scenario 3 - Shift B unrecorded -> Still in Dropdown ---');

{
    const { ctrl, selectEl } = createControllerInstance();
    const todayIso = UIHelpers.getTodayISO();

    // Shift A is recorded, but Shift B is NOT recorded
    ctrl.todayHistoryList = [
        {
            work_date: todayIso,
            shift_name: 'ปฏิบัติงานนอกเวลา (17:00 - 01:00) (ข้ามวัน)',
            shift_check_in: '17:00',
            shift_check_out: '01:00'
        }
    ];

    ctrl.test_evaluateTimeWindowAndPopulateShifts();

    const availableNames = ctrl.availableShiftsForCurrentWindow.map(s => s.name);
    console.log('  Available shifts remaining:', availableNames);

    assert(
        availableNames.some(name => name.includes('16:30 - 20:30')),
        'Shift B (16:30 - 20:30) MUST be in available shifts'
    );
    assert(
        selectEl.innerHTML.includes('ปฏิบัติงานนอกเวลา (16:30 - 20:30)'),
        'Dropdown HTML MUST contain Shift B option'
    );

    console.log('  [PASS] Scenario 3 Passed: Shift B remains available in Dropdown');
}

// =============================================================================
// TEST SUITE 5: Scenario 4 - All Shifts Recorded -> Dropdown Empty & Button Disabled
// =============================================================================
console.log('\n--- Test Suite 5: Scenario 4 - All shifts recorded -> Disabled Button & Message ---');

{
    const { ctrl, selectEl, btnSubmit, btnLabel, noticeBox, noticeText } = createControllerInstance();
    const todayIso = UIHelpers.getTodayISO();

    // All shifts recorded
    ctrl.activeRegularRecord = {
        work_date: todayIso,
        check_in_time: '08:25',
        check_out_time: '16:35'
    };
    ctrl.todayHistoryList = [
        {
            work_date: todayIso,
            shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
            shift_check_in: '08:30',
            shift_check_out: '16:30'
        },
        {
            work_date: todayIso,
            shift_name: 'ปฏิบัติงานนอกเวลา (16:30 - 20:30)',
            shift_check_in: '16:30',
            shift_check_out: '20:30'
        },
        {
            work_date: todayIso,
            shift_name: 'ปฏิบัติงานนอกเวลา (17:00 - 01:00) (ข้ามวัน)',
            shift_check_in: '17:00',
            shift_check_out: '01:00'
        }
    ];

    ctrl.test_evaluateTimeWindowAndPopulateShifts();
    ctrl.test_updateStatusCardsAndMainButton();

    console.log('  Available shifts count:', ctrl.availableShiftsForCurrentWindow.length);
    console.log('  Dropdown HTML:', selectEl.innerHTML);
    console.log('  Button disabled:', btnSubmit.disabled);
    console.log('  Button label:', btnLabel.textContent);
    console.log('  Notice box hidden:', noticeBox.classList.contains('hidden'));
    console.log('  Notice text:', noticeText.textContent);

    assert.strictEqual(ctrl.availableShiftsForCurrentWindow.length, 0, 'No available shifts should remain');
    assert(
        selectEl.innerHTML.includes('บันทึกลงเวลาครบทุกช่วงเวลาแล้ว'),
        'Dropdown must display completed/no active shifts message'
    );
    assert.strictEqual(selectEl.value, '', 'Dropdown value must be empty string');
    assert.strictEqual(btnSubmit.disabled, true, 'Main submit button must be disabled');
    assert(btnSubmit.classList.contains('opacity-50'), 'Button must have opacity-50');
    assert(btnSubmit.classList.contains('cursor-not-allowed'), 'Button must have cursor-not-allowed');
    assert(btnSubmit.classList.contains('pointer-events-none'), 'Button must have pointer-events-none');
    assert.strictEqual(btnLabel.textContent, 'ไม่มีช่วงเวลาปฏิบัติงานให้บันทึก', 'Button label must match specification');
    assert(!noticeBox.classList.contains('hidden'), 'Notice box must be visible');
    assert(
        noticeText.textContent.includes('ท่านได้บันทึกลงเวลาปฏิบัติงานในทุกช่วงเวลาที่เปิดให้ลงเวลาเรียบร้อยแล้ว'),
        'Notice text must inform user that all shifts have been recorded'
    );

    console.log('  [PASS] Scenario 4 Passed: Dropdown shows completed and main button is disabled');
}

// =============================================================================
// TEST SUITE 6: Scenario 5 - Unclosed Regular Record (hasUnclosedRegular = true)
// =============================================================================
console.log('\n--- Test Suite 6: Scenario 5 - Unclosed regular record (waiting to check out) ---');

{
    const { ctrl, btnSubmit, btnLabel } = createControllerInstance();
    const todayIso = UIHelpers.getTodayISO();

    // User checked in regular hours earlier, waiting to check out
    ctrl.activeRegularRecord = {
        work_date: todayIso,
        check_in_time: '08:29:00',
        check_out_time: null
    };

    ctrl.test_evaluateTimeWindowAndPopulateShifts();
    ctrl.test_updateStatusCardsAndMainButton();

    console.log('  Button disabled:', btnSubmit.disabled);
    console.log('  Button classes:', btnSubmit.classList.toString());
    console.log('  Button label:', btnLabel.textContent);

    assert.strictEqual(
        btnSubmit.disabled,
        false,
        'Main button MUST NOT be disabled when waiting to check out (hasUnclosedRegular = true)'
    );
    assert(
        !btnSubmit.classList.contains('opacity-50'),
        'Main button must NOT have opacity-50'
    );
    assert(
        !btnSubmit.classList.contains('pointer-events-none'),
        'Main button must NOT have pointer-events-none'
    );
    assert.strictEqual(
        btnLabel.textContent,
        'บันทึกลงเวลาเลิกงาน',
        'Button label must be "บันทึกลงเวลาเลิกงาน"'
    );

    console.log('  [PASS] Scenario 5 Passed: Checkout button remains active and clickable');
}

// =============================================================================
// TEST SUITE 7: Additional Edge Cases
// =============================================================================
console.log('\n--- Test Suite 7: Additional Edge Cases (Single-click mode & Past unclosed) ---');

{
    // 7.1 Past unclosed regular record
    const { ctrl, btnSubmit, btnLabel } = createControllerInstance();
    ctrl.activeRegularRecord = {
        work_date: '2026-10-28',
        check_in_time: '08:30:00',
        check_out_time: null
    };

    ctrl.test_evaluateTimeWindowAndPopulateShifts();
    ctrl.test_updateStatusCardsAndMainButton();

    assert.strictEqual(btnSubmit.disabled, false, 'Past unclosed record button must NOT be disabled');
    assert(btnLabel.textContent.includes('บันทึกลงเวลาเลิกงาน'), 'Label must prompt to checkout past record');
    console.log('  [PASS] 7.1 Past unclosed regular record handled correctly');
}

{
    // 7.2 Single-click checkin mode when all shifts recorded
    const { ctrl, selectEl, btnSubmit, btnLabel } = createControllerInstance({
        single_click_checkin: true
    });
    const todayIso = UIHelpers.getTodayISO();
    ctrl.todayHistoryList = [
        { work_date: todayIso, shift_name: 'เวลาราชการปกติ (08:30 - 16:30)', shift_check_in: '08:30', shift_check_out: '16:30' },
        { work_date: todayIso, shift_name: 'ปฏิบัติงานนอกเวลา (16:30 - 20:30)', shift_check_in: '16:30', shift_check_out: '20:30' },
        { work_date: todayIso, shift_name: 'ปฏิบัติงานนอกเวลา (17:00 - 01:00) (ข้ามวัน)', shift_check_in: '17:00', shift_check_out: '01:00' }
    ];

    ctrl.test_evaluateTimeWindowAndPopulateShifts();
    ctrl.test_updateStatusCardsAndMainButton();

    assert.strictEqual(ctrl.availableShiftsForCurrentWindow.length, 0, 'No shifts remaining');
    assert.strictEqual(btnSubmit.disabled, true, 'Button must be disabled in single-click mode too');
    assert.strictEqual(btnLabel.textContent, 'ไม่มีช่วงเวลาปฏิบัติงานให้บันทึก');
    console.log('  [PASS] 7.2 Single-click mode with all shifts recorded correctly disabled');
}

console.log('\n================================================================');
console.log('  ALL QA AUDIT SUITE SCENARIOS PASSED WITH ZERO ERRORS!         ');
console.log('================================================================\n');
