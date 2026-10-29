/**
 * @file test_qa_users_filter.mjs
 * @description QA Automated Test Suite for UsersController & users.html
 */

import assert from 'node:assert';
import fs from 'node:fs';

console.log('=== STARTING QA AUDIT SUITE ===\n');

// -------------------------------------------------------------
// PART 1: Static HTML Analysis of users.html
// -------------------------------------------------------------
console.log('--- Test Suite 1: Static Analysis of users.html ---');
const usersHtml = fs.readFileSync('users.html', 'utf8');

// 1.1 Hierarchical filter dock
assert.ok(usersHtml.includes('id="hierarchicalUserOrgFilterDock"'), 'users.html MUST contain #hierarchicalUserOrgFilterDock');
assert.ok(usersHtml.includes('id="selectUserFilterBureau"'), 'users.html MUST contain #selectUserFilterBureau');
assert.ok(usersHtml.includes('id="selectUserFilterDivision"'), 'users.html MUST contain #selectUserFilterDivision');
assert.ok(usersHtml.includes('id="selectUserFilterWorkGroup"'), 'users.html MUST contain #selectUserFilterWorkGroup');

// 1.2 Disabled attributes on division and workGroup in HTML initially
const divMatches = usersHtml.match(/<select id="selectUserFilterDivision"[^>]*>/);
assert.ok(divMatches && divMatches[0].includes('disabled'), '#selectUserFilterDivision MUST be disabled initially in HTML');

const wgMatches = usersHtml.match(/<select id="selectUserFilterWorkGroup"[^>]*>/);
assert.ok(wgMatches && wgMatches[0].includes('disabled'), '#selectUserFilterWorkGroup MUST be disabled initially in HTML');

// 1.3 Group By Select
assert.ok(usersHtml.includes('id="selectUserGroupBy"'), 'users.html MUST contain #selectUserGroupBy');
const groupByRegex = /<select id="selectUserGroupBy"[\s\S]*?<\/select>/;
const groupByMatch = usersHtml.match(groupByRegex);
assert.ok(groupByMatch, 'Found #selectUserGroupBy');
const groupByContent = groupByMatch[0];
assert.ok(groupByContent.includes('value="division"'), '#selectUserGroupBy must have option value="division"');
assert.ok(groupByContent.includes('value="group"'), '#selectUserGroupBy must have option value="group"');
assert.ok(groupByContent.includes('สำนักงาน/กอง &gt; ส่วน/ฝ่าย'), '#selectUserGroupBy option 1 label must contain สำนักงาน/กอง > ส่วน/ฝ่าย');
assert.ok(groupByContent.includes('สำนักงาน/กอง &gt; ส่วน/ฝ่าย &gt; กลุ่มงาน'), '#selectUserGroupBy option 2 label must contain สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน');

// 1.4 Table 1 Safeguards (6 Columns)
assert.ok(usersHtml.includes('id="usersTableBody"'), 'users.html MUST contain #usersTableBody');
const tableHeadersRegex = /<thead[\s\S]*?<\/thead>/g;
const tableHeaders = [...usersHtml.matchAll(tableHeadersRegex)];
assert.ok(tableHeaders.length >= 2, 'users.html must contain at least 2 table theads (Users and Password Reset)');

const table1Head = tableHeaders[0][0];
const thMatches1 = [...table1Head.matchAll(/<th[\s>]/g)];
assert.strictEqual(thMatches1.length, 6, 'Table 1 thead MUST have exactly 6 columns');
assert.ok(table1Head.includes('ลำดับ'), 'Table 1 th contains ลำดับ');
assert.ok(table1Head.includes('ชื่อบัญชี (Username)'), 'Table 1 th contains ชื่อบัญชี');
assert.ok(table1Head.includes('ชื่อ-นามสกุล'), 'Table 1 th contains ชื่อ-นามสกุล');
assert.ok(table1Head.includes('ระดับสิทธิ์ (Role)'), 'Table 1 th contains ระดับสิทธิ์');
assert.ok(table1Head.includes('ขอบเขตการมองเห็น'), 'Table 1 th contains ขอบเขตการมองเห็น');
assert.ok(table1Head.includes('จัดการ'), 'Table 1 th contains จัดการ');

// 1.5 Table 2 Safeguards (Password Reset)
assert.ok(usersHtml.includes('id="passwordResetTableBody"'), 'users.html MUST contain #passwordResetTableBody');
assert.ok(usersHtml.includes('id="pendingResetCountBadge"'), 'users.html MUST contain #pendingResetCountBadge');
const table2Head = tableHeaders[1][0];
const thMatches2 = [...table2Head.matchAll(/<th[\s>]/g)];
assert.strictEqual(thMatches2.length, 6, 'Table 2 thead MUST have exactly 6 columns');
assert.ok(table2Head.includes('คำสั่งดำเนินการ'), 'Table 2 th contains คำสั่งดำเนินการ');

// 1.6 Action buttons preserved
assert.ok(usersHtml.includes('id="btnOpenAddUserModal"'), 'Preserved #btnOpenAddUserModal');
assert.ok(usersHtml.includes('id="inputImportUsersExcel"'), 'Preserved #inputImportUsersExcel');
assert.ok(usersHtml.includes('id="btnExportUsersExcel"'), 'Preserved #btnExportUsersExcel');
assert.ok(usersHtml.includes('id="btnTemplateUsersExcel"'), 'Preserved #btnTemplateUsersExcel');

console.log('✓ Test Suite 1: Static HTML assertions PASSED!\n');

// -------------------------------------------------------------
// PART 2: Headless DOM Simulation of UsersController
// -------------------------------------------------------------
console.log('--- Test Suite 2: Controller & DOM Logic Simulation ---');

class MockElement {
    constructor(id, tagName = 'div') {
        this.id = id;
        this.tagName = tagName;
        this.classList = {
            classes: new Set(),
            add(...c) { c.forEach(x => this.classes.add(x)); },
            remove(...c) { c.forEach(x => this.classes.delete(x)); },
            toggle(c, force) {
                if (force === undefined) {
                    if (this.classes.has(c)) { this.classes.delete(c); return false; }
                    else { this.classes.add(c); return true; }
                }
                if (force) { this.classes.add(c); return true; }
                else { this.classes.delete(c); return false; }
            },
            contains(c) { return this.classes.has(c); }
        };
        this.attributes = {};
        this.listeners = {};
        this.value = (id && id.toLowerCase().includes('search')) ? '' : 'all';
        this.disabled = false;
        this.innerHTML = '';
        this.textContent = '';
    }
    addEventListener(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
    }
    dispatchEvent(event, payload = {}) {
        const fns = this.listeners[event] || [];
        for (const fn of fns) {
            fn({ target: this, ...payload });
        }
    }
    closest(selector) {
        return mockDoc.mockTable;
    }
    remove() {
        if (this.parentElement) {
            this.parentElement = null;
        }
    }
}

class MockDocument {
    constructor() {
        this.elements = {};
        this.tableHeaders = [
            new MockElement('th0'),
            new MockElement('th1'),
            new MockElement('th2'),
            new MockElement('th3'),
            new MockElement('th4'),
            new MockElement('th5')
        ];
        this.mockTable = {
            querySelectorAll: (sel) => {
                if (sel === 'thead th') {
                    return this.tableHeaders;
                }
                return [];
            }
        };
    }
    getElementById(id) {
        if (!this.elements[id]) {
            this.elements[id] = new MockElement(id);
        }
        return this.elements[id];
    }
    querySelectorAll(selector) {
        if (selector === '#usersTableBody') {
            return [this.getElementById('usersTableBody')];
        }
        if (selector === 'thead th') {
            return this.tableHeaders;
        }
        return [];
    }
    addEventListener() {}
}

const mockDoc = new MockDocument();
global.document = mockDoc;
global.window = {
    location: { href: '' },
    history: { replaceState() {} },
    __BMA_SPA_ROUTER_ACTIVE__: true
};
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

// Import actual Models & Components
const { SettingsModel } = await import('./assets/js/models/SettingsModel.js');
const { PersonnelModel } = await import('./assets/js/models/PersonnelModel.js');
const { UserModel } = await import('./assets/js/models/UserModel.js');
const { AppLayout } = await import('./assets/js/components/AppLayout.js');
const { UIHelpers } = await import('./assets/js/core/UIHelpers.js');

// Mock UIHelpers UI calls that require browser DOM
UIHelpers.showLoading = () => {};
UIHelpers.hideLoading = () => {};
UIHelpers.alert = async () => {};
UIHelpers.confirm = async () => true;
UIHelpers.showToast = () => {};
AppLayout.refreshNotificationBell = async () => {};

// Mock test dataset
const mockSettings = {
    category_colors: { group_header: '#6F42C1' },
    affiliations: [
        { bureau: 'สำนักการแพทย์', division: 'กองการพยาบาล', group: 'งานบริหารทั่วไป' },
        { bureau: 'สำนักการแพทย์', division: 'กองการพยาบาล', group: 'งานวิชาการ' },
        { bureau: 'สำนักการแพทย์', division: 'กองเภสัชกรรม', group: 'งานคลังยา' },
        { bureau: 'สำนักการโยธา', division: 'สำนักงานการก่อสร้าง', group: 'กลุ่มงานออกแบบ' }
    ]
};

const mockPersonnelList = [
    { id: 'p1', prefix: 'นาย', first_name: 'สมชาย', last_name: 'ใจดี', national_id: '1100100000011', bureau: 'สำนักการแพทย์', division: 'กองการพยาบาล', work_group: 'งานบริหารทั่วไป' },
    { id: 'p2', prefix: 'นาง', first_name: 'สมศรี', last_name: 'มีสุข', national_id: '1100100000022', bureau: 'สำนักการแพทย์', division: 'กองการพยาบาล', work_group: 'งานวิชาการ' },
    { id: 'p3', prefix: 'นาย', first_name: 'วิชัย', last_name: 'กล้าหาญ', national_id: '1100100000033', bureau: 'สำนักการโยธา', division: 'สำนักงานการก่อสร้าง', work_group: 'กลุ่มงานออกแบบ' }
];

const mockUsersList = [
    {
        id: 'u1', username: 'somchai.j', full_name: 'นายสมชาย ใจดี', role: 'User', visibility_level: 'none',
        national_id: '1100100000011', personnel_id: 'p1', password_reset_requested: false,
        personnel: mockPersonnelList[0]
    },
    {
        id: 'u2', username: 'somsri.m', full_name: 'นางสมศรี มีสุข', role: 'Admin', visibility_level: 'division',
        national_id: '1100100000022', personnel_id: 'p2', scope_bureau: 'สำนักการแพทย์', scope_division: 'กองการพยาบาล',
        password_reset_requested: true,
        personnel: mockPersonnelList[1]
    },
    {
        id: 'u3', username: 'wichai.k', full_name: 'นายวิชัย กล้าหาญ', role: 'SuperAdmin', visibility_level: 'all',
        national_id: '1100100000033', personnel_id: 'p3', scope_bureau: 'สำนักการโยธา', scope_division: 'สำนักงานการก่อสร้าง',
        password_reset_requested: false,
        personnel: mockPersonnelList[2]
    }
];

// Mock Model calls
UserModel.getAll = async () => mockUsersList;
PersonnelModel.getAll = async () => mockPersonnelList;
SettingsModel.getSettings = async () => mockSettings;

// 2.1 Test SettingsModel Unique Extractors
console.log('Test 2.1: SettingsModel unique extractors');
const uniqueBureaus = SettingsModel.getUniqueBureaus(mockSettings);
assert.deepStrictEqual(uniqueBureaus, ['สำนักการแพทย์', 'สำนักการโยธา'], 'getUniqueBureaus must return correct bureaus');

const uniqueDivisionsMed = SettingsModel.getUniqueDivisions(mockSettings, 'สำนักการแพทย์');
assert.deepStrictEqual(uniqueDivisionsMed, ['กองการพยาบาล', 'กองเภสัชกรรม'], 'getUniqueDivisions must return divisions for bureau');

const uniqueGroupsNursing = SettingsModel.getUniqueGroups(mockSettings, 'สำนักการแพทย์', 'กองการพยาบาล');
assert.deepStrictEqual(uniqueGroupsNursing, ['งานบริหารทั่วไป', 'งานวิชาการ'], 'getUniqueGroups must return groups for division');
console.log('✓ Test 2.1 PASSED');

// 2.2 Test Controller Lifecycle for SuperAdmin
console.log('Test 2.2: SuperAdmin Lifecycle & Sequential Filter Behavior');
AppLayout.initAdminLayout = async () => ({
    currentUser: { role: 'SuperAdmin', visibility_level: 'all' },
    settings: mockSettings
});

const { UsersController } = await import('./assets/js/controllers/UsersController.js');

const ctrl = new UsersController();
// Wait for async init() to complete
await new Promise(r => setTimeout(r, 80));

const dock = mockDoc.getElementById('hierarchicalUserOrgFilterDock');
const bureauSelect = mockDoc.getElementById('selectUserFilterBureau');
const divisionSelect = mockDoc.getElementById('selectUserFilterDivision');
const workGroupSelect = mockDoc.getElementById('selectUserFilterWorkGroup');
const usersTbody = mockDoc.getElementById('usersTableBody');
const resetTbody = mockDoc.getElementById('passwordResetTableBody');
const groupBySelect = mockDoc.getElementById('selectUserGroupBy');

// State 0: Initial State
assert.strictEqual(dock.classList.contains('hidden'), false, 'Dock must be visible for SuperAdmin');
assert.strictEqual(ctrl.selectedBureauFilter, 'all', 'Initial bureau filter must be all');
assert.strictEqual(ctrl.selectedDivisionFilter, 'all', 'Initial division filter must be all');
assert.strictEqual(ctrl.selectedWorkGroupFilter, 'all', 'Initial workGroup filter must be all');
assert.strictEqual(bureauSelect.disabled, false, 'Bureau select must be enabled');
assert.strictEqual(divisionSelect.disabled, true, 'Division select must be disabled initially');
assert.strictEqual(workGroupSelect.disabled, true, 'WorkGroup select must be disabled initially');
assert.ok(bureauSelect.innerHTML.includes('สำนักการแพทย์'), 'Bureau select must contain สำนักการแพทย์');
assert.ok(bureauSelect.innerHTML.includes('สำนักการโยธา'), 'Bureau select must contain สำนักการโยธา');
console.log('✓ State 0 (Initial Load): Sequential lock verified');

// State 1: Select Bureau "สำนักการแพทย์"
bureauSelect.value = 'สำนักการแพทย์';
bureauSelect.dispatchEvent('change');

assert.strictEqual(ctrl.selectedBureauFilter, 'สำนักการแพทย์', 'selectedBureauFilter must update');
assert.strictEqual(ctrl.selectedDivisionFilter, 'all', 'selectedDivisionFilter must reset to all');
assert.strictEqual(ctrl.selectedWorkGroupFilter, 'all', 'selectedWorkGroupFilter must reset to all');
assert.strictEqual(divisionSelect.disabled, false, 'Division select must become ENABLED');
assert.strictEqual(workGroupSelect.disabled, true, 'WorkGroup select must remain DISABLED');
assert.ok(divisionSelect.innerHTML.includes('กองการพยาบาล'), 'Division select must include กองการพยาบาล');
assert.ok(divisionSelect.innerHTML.includes('กองเภสัชกรรม'), 'Division select must include กองเภสัชกรรม');
assert.ok(!divisionSelect.innerHTML.includes('สำนักงานการก่อสร้าง'), 'Division select must not include other bureaus');
console.log('✓ State 1 (Bureau Selected): Division unlocked, WorkGroup locked');

// State 2: Select Division "กองการพยาบาล"
divisionSelect.value = 'กองการพยาบาล';
divisionSelect.dispatchEvent('change');

assert.strictEqual(ctrl.selectedDivisionFilter, 'กองการพยาบาล', 'selectedDivisionFilter must update');
assert.strictEqual(ctrl.selectedWorkGroupFilter, 'all', 'selectedWorkGroupFilter must reset to all');
assert.strictEqual(workGroupSelect.disabled, false, 'WorkGroup select must become ENABLED');
assert.ok(workGroupSelect.innerHTML.includes('งานบริหารทั่วไป'), 'WorkGroup select must include งานบริหารทั่วไป');
assert.ok(workGroupSelect.innerHTML.includes('งานวิชาการ'), 'WorkGroup select must include งานวิชาการ');
assert.ok(!workGroupSelect.innerHTML.includes('กลุ่มงานออกแบบ'), 'WorkGroup select must not include other divisions');
console.log('✓ State 2 (Division Selected): WorkGroup unlocked');

// State 3: Select WorkGroup "งานบริหารทั่วไป"
workGroupSelect.value = 'งานบริหารทั่วไป';
workGroupSelect.dispatchEvent('change');
assert.strictEqual(ctrl.selectedWorkGroupFilter, 'งานบริหารทั่วไป');
console.log('✓ State 3 (WorkGroup Selected): Full 3-tier filter applied');

// State 4: Cascading Reset - Division back to 'all'
divisionSelect.value = 'all';
divisionSelect.dispatchEvent('change');

assert.strictEqual(ctrl.selectedDivisionFilter, 'all');
assert.strictEqual(ctrl.selectedWorkGroupFilter, 'all');
assert.strictEqual(workGroupSelect.disabled, true, 'WorkGroup must be DISABLED when division is all');
console.log('✓ State 4 (Division Reset to all): WorkGroup disabled & reset');

// State 5: Cascading Reset - Bureau back to 'all'
bureauSelect.value = 'all';
bureauSelect.dispatchEvent('change');

assert.strictEqual(ctrl.selectedBureauFilter, 'all');
assert.strictEqual(ctrl.selectedDivisionFilter, 'all');
assert.strictEqual(ctrl.selectedWorkGroupFilter, 'all');
assert.strictEqual(divisionSelect.disabled, true, 'Division must be DISABLED when bureau is all');
assert.strictEqual(workGroupSelect.disabled, true, 'WorkGroup must be DISABLED when bureau is all');
console.log('✓ State 5 (Bureau Reset to all): Full cascade reset verified');

// 2.3 Test Grouping Views
console.log('Test 2.3: Grouping Views (division vs group)');

// View 1: division
groupBySelect.value = 'division';
groupBySelect.dispatchEvent('change');
assert.strictEqual(ctrl.groupViewMode, 'division');
let table1Html = usersTbody.innerHTML;
assert.ok(table1Html.includes('สำนักการแพทย์ &gt; กองการพยาบาล'), 'Table 1 must render bureau > division header');
assert.ok(table1Html.includes('border-left: 4px solid #6F42C1'), 'Header must contain styled border-left with headerColor');
assert.ok(table1Html.includes('background-color: #6F42C118'), 'Header must contain background-color with headerColor alpha');
assert.ok(!table1Html.includes('กลุ่มงาน: งานบริหารทั่วไป'), 'View 1 must not render sub-group header');
assert.ok(table1Html.includes('data-action="edit-user"'), 'SuperAdmin row must contain edit button');
assert.ok(table1Html.includes('data-action="delete-user"'), 'SuperAdmin row must contain delete button');

// View 2: group
groupBySelect.value = 'group';
groupBySelect.dispatchEvent('change');
assert.strictEqual(ctrl.groupViewMode, 'group');
table1Html = usersTbody.innerHTML;
assert.ok(table1Html.includes('สำนักการแพทย์ &gt; กองการพยาบาล'), 'Table 1 must render bureau > division header');
assert.ok(table1Html.includes('กลุ่มงาน: งานบริหารทั่วไป'), 'View 2 MUST render sub-group header');
assert.ok(table1Html.includes('fa-layer-group'), 'View 2 MUST render fa-layer-group icon');
console.log('✓ Test 2.3 (Grouping Views): View 1 & View 2 rendering verified');

// 2.4 Test Admin (Bureau Scope) Safeguard
console.log('Test 2.4: Admin with Bureau scope safeguard');
AppLayout.initAdminLayout = async () => ({
    currentUser: { role: 'Admin', visibility_level: 'bureau', scope_bureau: 'สำนักการแพทย์' },
    settings: mockSettings
});

const adminCtrl = new UsersController();
await new Promise(r => setTimeout(r, 80));

assert.strictEqual(adminCtrl.isSuperAdmin, false, 'Admin is not superadmin');
assert.strictEqual(adminCtrl.isAdminBureau, true, 'Admin is bureau admin');
assert.strictEqual(adminCtrl.canEditOrDeleteUsers, false, 'canEditOrDeleteUsers must be false for Admin Bureau');

const adminTable1Html = usersTbody.innerHTML;
assert.ok(!adminTable1Html.includes('data-action="edit-user"'), 'Admin bureau row MUST NOT have edit button');
assert.ok(!adminTable1Html.includes('data-action="delete-user"'), 'Admin bureau row MUST NOT have delete button');
assert.strictEqual(mockDoc.tableHeaders[5].classList.contains('hidden'), true, 'Manage column header th must be hidden for Admin');
console.log('✓ Test 2.4 (Admin Bureau Safeguard): Manage column strictly hidden & actions omitted');

// 2.5 Test Table 2 (Password Reset) Rendering & Filtering
console.log('Test 2.5: Table 2 Password Reset Safeguard & Exception Check');
const resetHtml = resetTbody.innerHTML;
assert.ok(resetHtml.includes('somsri.m'), 'Table 2 must display pending reset user somsri.m');
assert.ok(resetHtml.includes('data-action="approve-reset"'), 'Table 2 must have approve button');
assert.ok(resetHtml.includes('data-action="reject-reset"'), 'Table 2 must have reject button');
const badgeResetCount = mockDoc.getElementById('pendingResetCountBadge');
assert.strictEqual(badgeResetCount.textContent, '1', 'Badge count must be 1 for pending resets');
console.log('✓ Test 2.5 (Password Reset Safeguard): Fully functional without errors');

// 2.6 Test Admin (Division Scope) Safeguard - Redirect to dashboard
console.log('Test 2.6: Admin with Division scope safeguard');
global.window.location.href = '';
AppLayout.initAdminLayout = async () => ({
    currentUser: { role: 'Admin', visibility_level: 'division', scope_bureau: 'สำนักการแพทย์', scope_division: 'กองการพยาบาล' },
    settings: mockSettings
});

const adminDivCtrl = new UsersController();
await new Promise(r => setTimeout(r, 80));
assert.strictEqual(global.window.location.href, 'dashboard.html', 'Admin division MUST be redirected to dashboard.html');
console.log('✓ Test 2.6 (Admin Division Redirect): Successfully redirected to dashboard.html');

console.log('\n=== ALL QA ASSERTION TESTS PASSED SUCCESSFULLY! ===');
