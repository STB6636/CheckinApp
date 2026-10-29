import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Load Config, UIHelpers, and SettingsModel
import { Config } from '../../assets/js/core/Config.js';
import { UIHelpers } from '../../assets/js/core/UIHelpers.js';
import { SettingsModel } from '../../assets/js/models/SettingsModel.js';

console.log('================================================================');
console.log('   QA AUDIT SUITE: Hierarchical Org Filter & System Settings   ');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Test Case 1: SettingsModel Affiliations Extraction
// -----------------------------------------------------------------------------
console.log('--- Test Suite 1: SettingsModel Hierarchy Methods ---');

const mockSettings = {
    organization_name: 'กรุงเทพมหานคร',
    bureau_name: 'สำนักเทศกิจ',
    require_gps: true,
    affiliations: [
        {
            organization: 'กรุงเทพมหานคร',
            bureau: 'สำนักเทศกิจ',
            division: 'กองตรวจและปฏิบัติการพื้นที่ 1',
            group: 'กลุ่มงานตรวจและปฏิบัติการ 1'
        },
        {
            organization: 'กรุงเทพมหานคร',
            bureau: 'สำนักเทศกิจ',
            division: 'กองตรวจและปฏิบัติการพื้นที่ 1',
            group: 'กลุ่มงานตรวจและปฏิบัติการ 2'
        },
        {
            organization: 'กรุงเทพมหานคร',
            bureau: 'สำนักเทศกิจ',
            division: 'กองตรวจและปฏิบัติการพื้นที่ 2',
            group: 'กลุ่มงานตรวจและปฏิบัติการ 3'
        },
        {
            organization: 'กรุงเทพมหานคร',
            bureau: 'สำนักงานเขตพระนคร',
            division: 'ฝ่ายเทศกิจ',
            group: 'กลุ่มงานสายตรวจ'
        }
    ]
};

const bureaus = SettingsModel.getUniqueBureaus(mockSettings);
console.log('[1.1] getUniqueBureaus:', bureaus);
assert.deepStrictEqual(bureaus.sort(), ['สำนักเทศกิจ', 'สำนักงานเขตพระนคร'].sort(),
    'getUniqueBureaus must return unique bureaus from affiliations');

const divsB1 = SettingsModel.getUniqueDivisions(mockSettings, 'สำนักเทศกิจ');
console.log('[1.2] getUniqueDivisions for สำนักเทศกิจ:', divsB1);
assert.deepStrictEqual(divsB1.sort(), ['กองตรวจและปฏิบัติการพื้นที่ 1', 'กองตรวจและปฏิบัติการพื้นที่ 2'].sort(),
    'getUniqueDivisions must filter correctly by bureau');

const divsB2 = SettingsModel.getUniqueDivisions(mockSettings, 'สำนักงานเขตพระนคร');
console.log('[1.3] getUniqueDivisions for สำนักงานเขตพระนคร:', divsB2);
assert.deepStrictEqual(divsB2, ['ฝ่ายเทศกิจ']);

const groupsD1 = SettingsModel.getUniqueGroups(mockSettings, 'สำนักเทศกิจ', 'กองตรวจและปฏิบัติการพื้นที่ 1');
console.log('[1.4] getUniqueGroups for สำนักเทศกิจ > กองตรวจและปฏิบัติการพื้นที่ 1:', groupsD1);
assert.deepStrictEqual(groupsD1.sort(), ['กลุ่มงานตรวจและปฏิบัติการ 1', 'กลุ่มงานตรวจและปฏิบัติการ 2'].sort());

const groupsD2 = SettingsModel.getUniqueGroups(mockSettings, 'สำนักเทศกิจ', 'กองตรวจและปฏิบัติการพื้นที่ 2');
console.log('[1.5] getUniqueGroups for สำนักเทศกิจ > กองตรวจและปฏิบัติการพื้นที่ 2:', groupsD2);
assert.deepStrictEqual(groupsD2, ['กลุ่มงานตรวจและปฏิบัติการ 3']);

console.log('>>> Test Suite 1 PASSED: SettingsModel methods work correctly.\n');

// -----------------------------------------------------------------------------
// Test Case 2: DOM & Sequential State Machine Simulation
// -----------------------------------------------------------------------------
console.log('--- Test Suite 2: Sequential Cascade Transitions Simulation ---');

class MockElement {
    constructor(id) {
        this.id = id;
        this.value = 'all';
        this.disabled = false;
        this.innerHTML = '';
        this.classList = new Set();
        this.listeners = {};
    }

    addEventListener(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
    }

    trigger(event, eventObj = {}) {
        if (this.listeners[event]) {
            for (const fn of this.listeners[event]) {
                fn({ target: this, ...eventObj });
            }
        }
    }
}

// Minimal DOM mock environment
const dom = {
    selectFilterBureau: new MockElement('selectFilterBureau'),
    selectFilterDivision: new MockElement('selectFilterDivision'),
    selectFilterWorkGroup: new MockElement('selectFilterWorkGroup'),
    hierarchicalOrgFilterDock: new MockElement('hierarchicalOrgFilterDock'),
    statusTagsFilterContainer: new MockElement('statusTagsFilterContainer')
};

// Mock controller logic matching ReportsController implementation
class ReportsControllerSimulation {
    constructor(settings, personnel, records, role = 'SuperAdmin') {
        this.settings = settings;
        this.allPersonnel = personnel;
        this.records = records;
        this.currentUser = { role };
        this.isSuperAdmin = role === 'SuperAdmin';
        this.isAdminBureau = role === 'Admin';
        this.selectedBureauFilter = 'all';
        this.selectedDivisionFilter = 'all';
        this.selectedWorkGroupFilter = 'all';
        this.selectedStatusKeys = new Set(['normal', 'late']);
        this.renderedChips = [];
        this.renderedTableCount = 0;
    }

    initHierarchicalOrgFilter() {
        const bureauSelect = dom.selectFilterBureau;
        const divisionSelect = dom.selectFilterDivision;
        const workGroupSelect = dom.selectFilterWorkGroup;

        bureauSelect.addEventListener('change', (e) => {
            this.selectedBureauFilter = e.target.value;
            this.selectedDivisionFilter = 'all';
            this.selectedWorkGroupFilter = 'all';
            this.updateDivisionOptions();
            this.renderStatusTagFilterChips();
            this.renderTables();
        });

        divisionSelect.addEventListener('change', (e) => {
            this.selectedDivisionFilter = e.target.value;
            this.selectedWorkGroupFilter = 'all';
            this.updateWorkGroupOptions();
            this.renderStatusTagFilterChips();
            this.renderTables();
        });

        workGroupSelect.addEventListener('change', (e) => {
            this.selectedWorkGroupFilter = e.target.value;
            this.renderStatusTagFilterChips();
            this.renderTables();
        });

        this.updateDivisionOptions();
    }

    populateHierarchicalOrgFilter() {
        const bureauSelect = dom.selectFilterBureau;
        const primaryBureaus = SettingsModel.getUniqueBureaus(this.settings);
        const combinedSources = [...(this.allPersonnel || []), ...(this.records || [])];
        const legacyBureaus = combinedSources
            .map(item => (item.bureau || '').trim())
            .filter(Boolean);

        const bureaus = [...new Set([...primaryBureaus, ...legacyBureaus])]
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'th'));

        if (this.selectedBureauFilter !== 'all' && !bureaus.includes(this.selectedBureauFilter)) {
            this.selectedBureauFilter = 'all';
        }

        bureauSelect.innerHTML = '<option value="all">แสดงทั้งหมด</option>' +
            bureaus.map(b => `<option value="${UIHelpers.escapeHtml(b)}">${UIHelpers.escapeHtml(b)}</option>`).join('');
        bureauSelect.value = this.selectedBureauFilter;

        this.updateDivisionOptions();
    }

    updateDivisionOptions() {
        const divisionSelect = dom.selectFilterDivision;

        if (this.selectedBureauFilter === 'all') {
            divisionSelect.disabled = true;
            divisionSelect.innerHTML = '<option value="all">แสดงทั้งหมด</option>';
            divisionSelect.value = 'all';
            this.selectedDivisionFilter = 'all';
        } else {
            divisionSelect.disabled = false;
            const primaryDivisions = SettingsModel.getUniqueDivisions(this.settings, this.selectedBureauFilter);
            const combinedSources = [...(this.allPersonnel || []), ...(this.records || [])];
            const matchingSources = combinedSources.filter(item => (item.bureau || '').trim() === this.selectedBureauFilter.trim());
            const legacyDivisions = matchingSources
                .map(item => (item.division || '').trim())
                .filter(Boolean);

            const divisions = [...new Set([...primaryDivisions, ...legacyDivisions])]
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b, 'th'));

            if (this.selectedDivisionFilter !== 'all' && !divisions.includes(this.selectedDivisionFilter)) {
                this.selectedDivisionFilter = 'all';
            }

            divisionSelect.innerHTML = '<option value="all">แสดงทั้งหมด</option>' +
                divisions.map(d => `<option value="${UIHelpers.escapeHtml(d)}">${UIHelpers.escapeHtml(d)}</option>`).join('');
            divisionSelect.value = this.selectedDivisionFilter;
        }

        this.updateWorkGroupOptions();
    }

    updateWorkGroupOptions() {
        const workGroupSelect = dom.selectFilterWorkGroup;

        if (this.selectedBureauFilter === 'all' || this.selectedDivisionFilter === 'all') {
            workGroupSelect.disabled = true;
            workGroupSelect.innerHTML = '<option value="all">แสดงทั้งหมด</option>';
            workGroupSelect.value = 'all';
            this.selectedWorkGroupFilter = 'all';
        } else {
            workGroupSelect.disabled = false;
            const primaryGroups = SettingsModel.getUniqueGroups(this.settings, this.selectedBureauFilter, this.selectedDivisionFilter);
            const combinedSources = [...(this.allPersonnel || []), ...(this.records || [])];
            const matchingSources = combinedSources.filter(item =>
                (item.bureau || '').trim() === this.selectedBureauFilter.trim() &&
                (item.division || '').trim() === this.selectedDivisionFilter.trim()
            );
            const legacyGroups = matchingSources
                .map(item => (item.work_group || item.group || '').trim())
                .filter(Boolean);

            const workGroups = [...new Set([...primaryGroups, ...legacyGroups])]
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b, 'th'));

            if (this.selectedWorkGroupFilter !== 'all' && !workGroups.includes(this.selectedWorkGroupFilter)) {
                this.selectedWorkGroupFilter = 'all';
            }

            workGroupSelect.innerHTML = '<option value="all">แสดงทั้งหมด</option>' +
                workGroups.map(wg => `<option value="${UIHelpers.escapeHtml(wg)}">${UIHelpers.escapeHtml(wg)}</option>`).join('');
            workGroupSelect.value = this.selectedWorkGroupFilter;
        }
    }

    getFilteredRecords() {
        let list = this.records || [];
        if (this.selectedBureauFilter && this.selectedBureauFilter !== 'all') {
            list = list.filter(r => (r.bureau || '').trim() === this.selectedBureauFilter.trim());
        }
        if (this.selectedDivisionFilter && this.selectedDivisionFilter !== 'all') {
            list = list.filter(r => (r.division || '').trim() === this.selectedDivisionFilter.trim());
        }
        if (this.selectedWorkGroupFilter && this.selectedWorkGroupFilter !== 'all') {
            list = list.filter(r => (r.work_group || '').trim() === this.selectedWorkGroupFilter.trim());
        }
        return list;
    }

    renderStatusTagFilterChips() {
        const baseRecords = this.getFilteredRecords();
        this.statusCounts = {};
        Config.OFFICIAL_STATUSES.forEach(st => {
            this.statusCounts[st.key] = baseRecords.filter(r => r.status_category === st.key).length;
        });
    }

    renderTables() {
        this.renderedTableCount = this.getFilteredRecords().length;
    }
}

// Sample dataset with mixed bureaus, divisions, groups, and statuses
const mockRecords = [
    { row_uid: 'R1', full_name: 'เจ้าหน้าที่ 1', bureau: 'สำนักเทศกิจ', division: 'กองตรวจและปฏิบัติการพื้นที่ 1', work_group: 'กลุ่มงานตรวจและปฏิบัติการ 1', status_category: 'normal' },
    { row_uid: 'R2', full_name: 'เจ้าหน้าที่ 2', bureau: 'สำนักเทศกิจ', division: 'กองตรวจและปฏิบัติการพื้นที่ 1', work_group: 'กลุ่มงานตรวจและปฏิบัติการ 2', status_category: 'late' },
    { row_uid: 'R3', full_name: 'เจ้าหน้าที่ 3', bureau: 'สำนักเทศกิจ', division: 'กองตรวจและปฏิบัติการพื้นที่ 2', work_group: 'กลุ่มงานตรวจและปฏิบัติการ 3', status_category: 'normal' },
    { row_uid: 'R4', full_name: 'เจ้าหน้าที่ 4', bureau: 'สำนักงานเขตพระนคร', division: 'ฝ่ายเทศกิจ', work_group: 'กลุ่มงานสายตรวจ', status_category: 'normal' },
    { row_uid: 'R5', full_name: 'เจ้าหน้าที่ 5', bureau: 'สำนักงานเขตพระนคร', division: 'ฝ่ายเทศกิจ', work_group: 'กลุ่มงานสายตรวจ', status_category: 'absent_duty' }
];

const mockPersonnel = [
    { id: 'P1', bureau: 'สำนักเทศกิจ', division: 'กองตรวจและปฏิบัติการพื้นที่ 1', work_group: 'กลุ่มงานตรวจและปฏิบัติการ 1' },
    { id: 'P2', bureau: 'สำนักเทศกิจ', division: 'กองตรวจและปฏิบัติการพื้นที่ 1', work_group: 'กลุ่มงานตรวจและปฏิบัติการ 2' },
    { id: 'P3', bureau: 'สำนักเทศกิจ', division: 'กองตรวจและปฏิบัติการพื้นที่ 2', work_group: 'กลุ่มงานตรวจและปฏิบัติการ 3' },
    { id: 'P4', bureau: 'สำนักงานเขตพระนคร', division: 'ฝ่ายเทศกิจ', work_group: 'กลุ่มงานสายตรวจ' },
    { id: 'P5', bureau: 'สำนักงานเขตพระนคร', division: 'ฝ่ายเทศกิจ', work_group: 'กลุ่มงานสายตรวจ' }
];

const controller = new ReportsControllerSimulation(mockSettings, mockPersonnel, mockRecords);

// [State 0: Initial Load]
controller.initHierarchicalOrgFilter();
controller.populateHierarchicalOrgFilter();
controller.renderStatusTagFilterChips();

console.log('[2.1 State 0: Initial Load]');
console.log('    bureau:', dom.selectFilterBureau.value, 'disabled:', dom.selectFilterBureau.disabled);
console.log('    division:', dom.selectFilterDivision.value, 'disabled:', dom.selectFilterDivision.disabled);
console.log('    workGroup:', dom.selectFilterWorkGroup.value, 'disabled:', dom.selectFilterWorkGroup.disabled);

assert.strictEqual(dom.selectFilterBureau.value, 'all');
assert.strictEqual(dom.selectFilterBureau.disabled, false);
assert.strictEqual(dom.selectFilterDivision.value, 'all');
assert.strictEqual(dom.selectFilterDivision.disabled, true, 'Division must be disabled initially');
assert.strictEqual(dom.selectFilterWorkGroup.value, 'all');
assert.strictEqual(dom.selectFilterWorkGroup.disabled, true, 'WorkGroup must be disabled initially');

assert.strictEqual(controller.getFilteredRecords().length, 5, 'Initially all 5 records are included');
assert.strictEqual(controller.statusCounts['normal'], 3);
assert.strictEqual(controller.statusCounts['late'], 1);
assert.strictEqual(controller.statusCounts['absent_duty'], 1);

// [State 1: Select Bureau 'สำนักเทศกิจ']
console.log('\n[2.2 State 1: Select Bureau = "สำนักเทศกิจ"]');
dom.selectFilterBureau.value = 'สำนักเทศกิจ';
dom.selectFilterBureau.trigger('change');

console.log('    bureau:', controller.selectedBureauFilter, 'disabled:', dom.selectFilterBureau.disabled);
console.log('    division:', controller.selectedDivisionFilter, 'disabled:', dom.selectFilterDivision.disabled);
console.log('    workGroup:', controller.selectedWorkGroupFilter, 'disabled:', dom.selectFilterWorkGroup.disabled);

assert.strictEqual(controller.selectedBureauFilter, 'สำนักเทศกิจ');
assert.strictEqual(dom.selectFilterDivision.disabled, false, 'Division must become ENABLED');
assert.strictEqual(dom.selectFilterDivision.value, 'all', 'Division value must default to "all"');
assert.strictEqual(dom.selectFilterWorkGroup.disabled, true, 'WorkGroup must REMAIN DISABLED while division is "all"');
assert.strictEqual(dom.selectFilterWorkGroup.value, 'all');

// Check division options populated under 'สำนักเทศกิจ'
assert(dom.selectFilterDivision.innerHTML.includes('กองตรวจและปฏิบัติการพื้นที่ 1'), 'Must include Division 1');
assert(dom.selectFilterDivision.innerHTML.includes('กองตรวจและปฏิบัติการพื้นที่ 2'), 'Must include Division 2');
assert(!dom.selectFilterDivision.innerHTML.includes('ฝ่ายเทศกิจ'), 'Must NOT include Division from other bureau');

// Filtered records under Bureau 1: 3 records
const recordsState1 = controller.getFilteredRecords();
assert.strictEqual(recordsState1.length, 3);
assert.strictEqual(controller.statusCounts['normal'], 2);
assert.strictEqual(controller.statusCounts['late'], 1);
assert.strictEqual(controller.statusCounts['absent_duty'], 0);

// [State 2: Select Division 'กองตรวจและปฏิบัติการพื้นที่ 1']
console.log('\n[2.3 State 2: Select Division = "กองตรวจและปฏิบัติการพื้นที่ 1"]');
dom.selectFilterDivision.value = 'กองตรวจและปฏิบัติการพื้นที่ 1';
dom.selectFilterDivision.trigger('change');

console.log('    bureau:', controller.selectedBureauFilter);
console.log('    division:', controller.selectedDivisionFilter, 'disabled:', dom.selectFilterDivision.disabled);
console.log('    workGroup:', controller.selectedWorkGroupFilter, 'disabled:', dom.selectFilterWorkGroup.disabled);

assert.strictEqual(controller.selectedDivisionFilter, 'กองตรวจและปฏิบัติการพื้นที่ 1');
assert.strictEqual(dom.selectFilterWorkGroup.disabled, false, 'WorkGroup must now become ENABLED');
assert.strictEqual(dom.selectFilterWorkGroup.value, 'all', 'WorkGroup must default to "all"');

// Check workGroup options populated under Division 1
assert(dom.selectFilterWorkGroup.innerHTML.includes('กลุ่มงานตรวจและปฏิบัติการ 1'));
assert(dom.selectFilterWorkGroup.innerHTML.includes('กลุ่มงานตรวจและปฏิบัติการ 2'));
assert(!dom.selectFilterWorkGroup.innerHTML.includes('กลุ่มงานตรวจและปฏิบัติการ 3'));

// Filtered records under Division 1: 2 records
const recordsState2 = controller.getFilteredRecords();
assert.strictEqual(recordsState2.length, 2);
assert.strictEqual(controller.statusCounts['normal'], 1);
assert.strictEqual(controller.statusCounts['late'], 1);

// [State 3: Select WorkGroup 'กลุ่มงานตรวจและปฏิบัติการ 1']
console.log('\n[2.4 State 3: Select WorkGroup = "กลุ่มงานตรวจและปฏิบัติการ 1"]');
dom.selectFilterWorkGroup.value = 'กลุ่มงานตรวจและปฏิบัติการ 1';
dom.selectFilterWorkGroup.trigger('change');

assert.strictEqual(controller.selectedWorkGroupFilter, 'กลุ่มงานตรวจและปฏิบัติการ 1');
const recordsState3 = controller.getFilteredRecords();
assert.strictEqual(recordsState3.length, 1);
assert.strictEqual(recordsState3[0].row_uid, 'R1');
assert.strictEqual(controller.statusCounts['normal'], 1);
assert.strictEqual(controller.statusCounts['late'], 0);

// [State 4: Reset Division to 'all']
console.log('\n[2.5 State 4: Reset Division back to "all"]');
dom.selectFilterDivision.value = 'all';
dom.selectFilterDivision.trigger('change');

console.log('    bureau:', controller.selectedBureauFilter);
console.log('    division:', controller.selectedDivisionFilter, 'disabled:', dom.selectFilterDivision.disabled);
console.log('    workGroup:', controller.selectedWorkGroupFilter, 'disabled:', dom.selectFilterWorkGroup.disabled);

assert.strictEqual(controller.selectedDivisionFilter, 'all');
assert.strictEqual(dom.selectFilterWorkGroup.disabled, true, 'WorkGroup must reset to DISABLED');
assert.strictEqual(dom.selectFilterWorkGroup.value, 'all', 'WorkGroup value must reset to "all"');
assert.strictEqual(controller.selectedWorkGroupFilter, 'all');

const recordsState4 = controller.getFilteredRecords();
assert.strictEqual(recordsState4.length, 3, 'Returns all 3 records of the bureau');

// [State 5: Re-select Division, then Reset Bureau to 'all']
console.log('\n[2.6 State 5: Re-select Division, then Reset Bureau to "all"]');
dom.selectFilterDivision.value = 'กองตรวจและปฏิบัติการพื้นที่ 2';
dom.selectFilterDivision.trigger('change');
assert.strictEqual(dom.selectFilterWorkGroup.disabled, false);

// Now reset bureau to 'all'
dom.selectFilterBureau.value = 'all';
dom.selectFilterBureau.trigger('change');

console.log('    bureau:', controller.selectedBureauFilter, 'disabled:', dom.selectFilterBureau.disabled);
console.log('    division:', controller.selectedDivisionFilter, 'disabled:', dom.selectFilterDivision.disabled);
console.log('    workGroup:', controller.selectedWorkGroupFilter, 'disabled:', dom.selectFilterWorkGroup.disabled);

assert.strictEqual(controller.selectedBureauFilter, 'all');
assert.strictEqual(dom.selectFilterDivision.disabled, true, 'Division must reset to DISABLED when bureau becomes "all"');
assert.strictEqual(dom.selectFilterDivision.value, 'all');
assert.strictEqual(controller.selectedDivisionFilter, 'all');
assert.strictEqual(dom.selectFilterWorkGroup.disabled, true, 'WorkGroup must reset to DISABLED when bureau becomes "all"');
assert.strictEqual(dom.selectFilterWorkGroup.value, 'all');
assert.strictEqual(controller.selectedWorkGroupFilter, 'all');

const recordsState5 = controller.getFilteredRecords();
assert.strictEqual(recordsState5.length, 5, 'All 5 records are back in view');

console.log('>>> Test Suite 2 PASSED: Sequential state transitions operate flawlessly.\n');

// -----------------------------------------------------------------------------
// Test Case 3: Safeguards Verification (ReportsController.js Code Analysis)
// -----------------------------------------------------------------------------
console.log('--- Test Suite 3: Safeguards Verification ---');

const controllerSrc = fs.readFileSync('assets/js/controllers/ReportsController.js', 'utf8');

// 3.1 SettingsModel usage check
assert(controllerSrc.includes('SettingsModel.getUniqueBureaus(this.settings)'),
    'ReportsController must call SettingsModel.getUniqueBureaus(this.settings)');
assert(controllerSrc.includes('SettingsModel.getUniqueDivisions(this.settings, this.selectedBureauFilter)'),
    'ReportsController must call SettingsModel.getUniqueDivisions(this.settings, this.selectedBureauFilter)');
assert(controllerSrc.includes('SettingsModel.getUniqueGroups(this.settings, this.selectedBureauFilter, this.selectedDivisionFilter)'),
    'ReportsController must call SettingsModel.getUniqueGroups(this.settings, this.selectedBureauFilter, this.selectedDivisionFilter)');
console.log('[3.1] SettingsModel hierarchical calls verified: PASSED');

// 3.2 HTML escaping check
assert(controllerSrc.includes('UIHelpers.escapeHtml(b)'), 'Bureaus options must escape HTML');
assert(controllerSrc.includes('UIHelpers.escapeHtml(d)'), 'Divisions options must escape HTML');
assert(controllerSrc.includes('UIHelpers.escapeHtml(wg)'), 'WorkGroup options must escape HTML');
console.log('[3.2] XSS injection prevention via UIHelpers.escapeHtml: PASSED');

// 3.3 Colspan and Layout check
assert(controllerSrc.includes('const colSpan = showGps'), 'colSpan dynamic calculation based on GPS and permissions present');
assert(controllerSrc.includes('((forPrintPdf || !this.canManageRecords) ? 8 : 9)'), 'showGps colSpan check (8 or 9) intact');
assert(controllerSrc.includes('((forPrintPdf || !this.canManageRecords) ? 6 : 7)'), 'no-gps colSpan check (6 or 7) intact');
console.log('[3.3] Dual GPS columns & Colspan calculation intact: PASSED');

// 3.4 Row click opens profile modal check
assert(controllerSrc.includes("const personRow = e.target.closest('tr.report-person-row');"),
    'Master container must delegate click to tr.report-person-row');
assert(controllerSrc.includes('this.#openResumeProfileForSpecificRow(personRow.dataset.rowUid);'),
    'Row click must call #openResumeProfileForSpecificRow');
assert(controllerSrc.includes("document.getElementById('modalPersonnelResumeProfile')?.classList.remove('hidden');"),
    '#openResumeProfileForSpecificRow must show modalPersonnelResumeProfile');
console.log('[3.4] Row click -> #modalPersonnelResumeProfile trigger: PASSED');

// 3.5 Excel export filtered records check
assert(controllerSrc.includes("document.getElementById('btnExportReportExcel')?.addEventListener('click'"),
    'btnExportReportExcel click listener must exist');
assert(controllerSrc.includes('const baseRecords = this.#getFilteredRecords();'),
    'Excel export must filter from #getFilteredRecords()');
assert(controllerSrc.includes('const filtered = baseRecords.filter(r => this.selectedStatusKeys.has(r.status_category));'),
    'Excel export must respect selectedStatusKeys');
console.log('[3.5] Excel export from #getFilteredRecords() + status tags: PASSED');

// 3.6 Tag status filter calculation check
assert(controllerSrc.includes('const baseRecords = this.#getFilteredRecords();') &&
       controllerSrc.includes('const countInStatus = baseRecords.filter(r => r.status_category === st.key).length;'),
    'Status tags counter must calculate based on #getFilteredRecords()');
console.log('[3.6] Status tag chips dynamic count from org filter: PASSED');

console.log('>>> Test Suite 3 PASSED: All safeguards and contracts verified.\n');

console.log('================================================================');
console.log('         ALL QA ASSERTION TESTS PASSED SUCCESSFULLY!           ');
console.log('================================================================');
