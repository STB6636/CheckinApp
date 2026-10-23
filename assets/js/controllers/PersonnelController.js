/**
 * @file assets/js/controllers/PersonnelController.js
 * @description คลาสควบคุมหน้าจัดการข้อมูลบุคลากร (ใช้สีป้ายกำกับตายตัวตามระดับบัญชี SuperAdmin แดงพาสเทล, Admin เหลืองพาสเทล, User เขียวพาสเทล)
 */

import { UIHelpers } from '../core/UIHelpers.js';
import { AppLayout } from '../components/AppLayout.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { PersonnelModel } from '../models/PersonnelModel.js';

export class PersonnelController {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.personnelList = [];
        this.groupViewMode = 'division';
        this.headerColor = '#007B3E';
        this.searchKeyword = '';
        this.init();
    }

    async init() {
        const layout = await AppLayout.initAdminLayout({
            activePage: 'personnel',
            pageTitle: 'จัดการข้อมูลบุคลากร',
            pageSubtitle: 'เพิ่ม แก้ไข ลบ ข้อมูลบุคลากร และสร้างบัญชีผู้ใช้งานอัตโนมัติตามขอบเขตการมองเห็น'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;
        this.settings = layout.settings || await SettingsModel.getSettings(false);

        if (this.settings?.category_colors?.group_header) {
            this.headerColor = this.settings.category_colors.group_header;
        }

        this.#populateDropdownsFromSettings();
        this.#bindEvents();
        await this.loadPersonnelData();
    }

    #populateDropdownsFromSettings() {
        const prefixes = this.settings.prefixes || ['นาย', 'นาง', 'นางสาว'];
        const prefixEl = document.getElementById('perPrefix');
        if (prefixEl) {
            prefixEl.innerHTML = prefixes.map(p => `<option value="${p}">${p}</option>`).join('');
        }

        const posTypes = SettingsModel.getUniquePositionTypes(this.settings);
        const posTypeSelect = document.getElementById('perPosType');
        if (posTypeSelect) {
            posTypeSelect.innerHTML = posTypes.map(t => `<option value="${t}">${t}</option>`).join('');
            this.#updatePositionSubDropdowns(posTypeSelect.value);
        }

        const orgs = SettingsModel.getUniqueOrganizations(this.settings);
        const orgSelect = document.getElementById('perOrganization');
        if (orgSelect) {
            orgSelect.innerHTML = orgs.map(o => `<option value="${o}">${o}</option>`).join('');
        }

        let bureaus = SettingsModel.getUniqueBureaus(this.settings, orgSelect?.value || '');
        if (this.currentUser.role === 'Admin' && this.currentUser.scope_bureau) {
            bureaus = [this.currentUser.scope_bureau];
        }
        const bureauSelect = document.getElementById('perBureau');
        if (bureauSelect) {
            bureauSelect.innerHTML = bureaus.map(b => `<option value="${b}">${b}</option>`).join('');
            this.#updateAffiliationSubDropdowns(bureauSelect.value);
        }
    }

    #updatePositionSubDropdowns(selectedType, selectedTitle = '', selectedLevel = '') {
        const titles = SettingsModel.getUniquePositionTitles(this.settings, selectedType);
        const titleSelect = document.getElementById('perPosTitle');
        if (!titleSelect) return;

        titleSelect.innerHTML = titles.map(t => `<option value="${t}">${t}</option>`).join('');
        if (selectedTitle && titles.includes(selectedTitle)) {
            titleSelect.value = selectedTitle;
        }

        const levels = SettingsModel.getUniquePositionLevels(this.settings, selectedType, titleSelect.value);
        const levelSelect = document.getElementById('perPosLevel');
        if (!levelSelect) return;

        levelSelect.innerHTML = levels.map(l => `<option value="${l}">${l}</option>`).join('');
        if (selectedLevel && levels.includes(selectedLevel)) {
            levelSelect.value = selectedLevel;
        }
    }

    #updateAffiliationSubDropdowns(selectedBureau, selectedDivision = '', selectedGroup = '') {
        let divisions = SettingsModel.getUniqueDivisions(this.settings, selectedBureau);
        if (this.currentUser.role === 'Admin' && this.currentUser.visibility_level === 'division' && this.currentUser.scope_division) {
            divisions = [this.currentUser.scope_division];
        }

        const divSelect = document.getElementById('perDivision');
        if (!divSelect) return;

        divSelect.innerHTML = divisions.map(d => `<option value="${d}">${d}</option>`).join('');
        if (selectedDivision && divisions.includes(selectedDivision)) {
            divSelect.value = selectedDivision;
        }

        const groups = SettingsModel.getUniqueGroups(this.settings, selectedBureau, divSelect.value);
        const groupSelect = document.getElementById('perWorkGroup');
        if (!groupSelect) return;

        groupSelect.innerHTML = groups.length > 0
            ? groups.map(g => `<option value="${g}">${g}</option>`).join('')
            : `<option value="งานบริหารทั่วไป">งานบริหารทั่วไป</option>`;
        if (selectedGroup && groups.includes(selectedGroup)) {
            groupSelect.value = selectedGroup;
        }
    }

    async loadPersonnelData() {
        const tbody = document.getElementById('personnelTableBody');
        if (tbody) {
            tbody.innerHTML = UIHelpers.renderTableSkeleton(6, 7);
        }

        UIHelpers.showLoading('กำลังโหลดข้อมูลบุคลากร...');
        try {
            this.personnelList = await PersonnelModel.getAll(this.currentUser);
            this.#renderGroupedTable();
        } finally {
            UIHelpers.hideLoading();
        }
    }

    #renderGroupedTable() {
        const tbody = document.getElementById('personnelTableBody');
        const totalBadge = document.getElementById('personnelTotalCountBadge');
        if (!tbody) return;

        const keyword = this.searchKeyword.toLowerCase().trim();
        const filtered = this.personnelList.filter(p => {
            if (!keyword) return true;
            const fullText = `${p.prefix}${p.first_name} ${p.last_name} ${p.national_id || ''} ${p.position_title} ${p.position_level} ${p.bureau} ${p.division} ${p.work_group} ${p.account_role || ''}`.toLowerCase();
            return fullText.includes(keyword);
        });

        if (totalBadge) totalBadge.textContent = String(filtered.length);

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 bma-text-sub">ไม่พบข้อมูลบุคลากรที่ค้นหา</td></tr>`;
            return;
        }

        const grouped = PersonnelModel.groupPersonnel(filtered, this.groupViewMode);
        let html = '';
        let runningNo = 1;

        for (const [bureauName, divisionsObj] of Object.entries(grouped)) {
            for (const [divisionName, content] of Object.entries(divisionsObj)) {
                html += `
                    <tr style="background-color: ${this.headerColor}18;">
                        <td colspan="7" class="font-bold text-sm py-2.5 px-4" style="color: ${this.headerColor}; border-left: 4px solid ${this.headerColor};">
                            <i class="fa-solid fa-building-user mr-1.5"></i>${bureauName} &gt; ${divisionName}
                        </td>
                    </tr>
                `;

                if (this.groupViewMode === 'group') {
                    for (const [groupName, members] of Object.entries(content)) {
                        html += `
                            <tr class="bg-slate-100/80 dark:bg-slate-800/50">
                                <td colspan="7" class="font-semibold text-xs py-2 pl-8 bma-text-main">
                                    <i class="fa-solid fa-layer-group mr-1.5 text-emerald-600"></i>กลุ่มงาน: ${groupName} (${members.length} คน)
                                </td>
                            </tr>
                        `;
                        for (const person of members) {
                            html += this.#buildPersonRowHtml(person, runningNo++);
                        }
                    }
                } else {
                    for (const person of content) {
                        html += this.#buildPersonRowHtml(person, runningNo++);
                    }
                }
            }
        }

        tbody.innerHTML = html;
    }

    #buildPersonRowHtml(person, indexNo) {
        const fullName = `${person.prefix}${person.first_name} ${person.last_name}`;
        const posFull = `${person.position_title}${person.position_level ? ' ระดับ' + person.position_level : ''}`;
        const roleMeta = person.role_meta || PersonnelModel.getRolePastelMeta(person.account_role || 'User');

        return `
            <tr>
                <td class="text-center font-semibold">${indexNo}</td>
                <td>
                    <div class="flex items-center gap-2.5">
                        <span class="w-3 h-3 rounded-full shrink-0 ${roleMeta.dotClass}"></span>
                        <span class="font-bold bma-text-main">${fullName}</span>
                    </div>
                </td>
                <td>
                    <span class="font-semibold bma-text-main">${posFull}</span>
                    <span class="block text-xs bma-text-sub">${person.position_type || ''}</span>
                </td>
                <td class="font-mono text-xs">${person.national_id || '<span class="bma-text-muted">ไม่ระบุ</span>'}</td>
                <td class="text-xs bma-text-sub">${person.work_group || '-'}</td>
                <td class="text-center">
                    <span class="bma-badge ${roleMeta.badgeClass}">${roleMeta.label}</span>
                </td>
                <td class="text-center space-x-1 whitespace-nowrap">
                    <button type="button" data-action="edit-personnel" data-id="${person.id}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500" title="แก้ไข">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" data-action="delete-personnel" data-id="${person.id}" data-name="${fullName}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500" title="ลบ">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    #openModal(editPerson = null) {
        const modal = document.getElementById('modalPersonnelForm');
        const titleEl = document.getElementById('modalPersonnelTitle');
        const autoBox = document.getElementById('autoCreateAccountBox');
        const chkAuto = document.getElementById('chkAutoCreateAccount');
        const statusEl = document.getElementById('perNationalIdStatus');
        const previewEl = document.getElementById('autoPasswordPreview');

        statusEl?.classList.add('hidden');
        if (previewEl) previewEl.textContent = '';

        if (!editPerson) {
            titleEl.innerHTML = `<i class="fa-solid fa-user-plus" style="color: var(--bma-primary);"></i><span>เพิ่มข้อมูลบุคลากรใหม่</span>`;
            document.getElementById('perId').value = '';
            document.getElementById('perFirstName').value = '';
            document.getElementById('perLastName').value = '';
            document.getElementById('perNationalId').value = '';
            autoBox?.classList.remove('hidden');
            if (chkAuto) chkAuto.checked = true;
            this.#populateDropdownsFromSettings();
        } else {
            titleEl.innerHTML = `<i class="fa-solid fa-user-pen" style="color: var(--bma-primary);"></i><span>แก้ไขข้อมูลบุคลากร</span>`;
            document.getElementById('perId').value = editPerson.id;
            document.getElementById('perPrefix').value = editPerson.prefix;
            document.getElementById('perFirstName').value = editPerson.first_name;
            document.getElementById('perLastName').value = editPerson.last_name;
            document.getElementById('perNationalId').value = editPerson.national_id || '';
            autoBox?.classList.add('hidden');
            if (chkAuto) chkAuto.checked = false;

            document.getElementById('perPosType').value = editPerson.position_type;
            this.#updatePositionSubDropdowns(editPerson.position_type, editPerson.position_title, editPerson.position_level);

            document.getElementById('perOrganization').value = editPerson.organization;
            document.getElementById('perBureau').value = editPerson.bureau;
            this.#updateAffiliationSubDropdowns(editPerson.bureau, editPerson.division, editPerson.work_group);
        }

        modal?.classList.remove('hidden');
    }

    #closeModal() {
        document.getElementById('modalPersonnelForm')?.classList.add('hidden');
    }

    #bindEvents() {
        document.getElementById('searchPersonnelInput')?.addEventListener('input', (e) => {
            this.searchKeyword = e.target.value;
            this.#renderGroupedTable();
        });

        document.getElementById('selectPersonnelGroupBy')?.addEventListener('change', (e) => {
            this.groupViewMode = e.target.value;
            this.#renderGroupedTable();
        });

        document.getElementById('btnOpenAddPersonnel')?.addEventListener('click', () => this.#openModal(null));
        document.getElementById('btnClosePersonnelModal')?.addEventListener('click', () => this.#closeModal());
        document.getElementById('btnCancelPersonnelModal')?.addEventListener('click', () => this.#closeModal());

        document.getElementById('perPosType')?.addEventListener('change', (e) => {
            this.#updatePositionSubDropdowns(e.target.value);
        });
        document.getElementById('perPosTitle')?.addEventListener('change', (e) => {
            const posType = document.getElementById('perPosType').value;
            const levels = SettingsModel.getUniquePositionLevels(this.settings, posType, e.target.value);
            document.getElementById('perPosLevel').innerHTML = levels.map(l => `<option value="${l}">${l}</option>`).join('');
        });
        document.getElementById('perBureau')?.addEventListener('change', (e) => {
            this.#updateAffiliationSubDropdowns(e.target.value);
        });
        document.getElementById('perDivision')?.addEventListener('change', (e) => {
            const bureau = document.getElementById('perBureau').value;
            const groups = SettingsModel.getUniqueGroups(this.settings, bureau, e.target.value);
            document.getElementById('perWorkGroup').innerHTML = groups.length > 0
                ? groups.map(g => `<option value="${g}">${g}</option>`).join('')
                : `<option value="งานบริหารทั่วไป">งานบริหารทั่วไป</option>`;
        });

        const validateNationalIdInput = () => {
            const rawVal = document.getElementById('perNationalId').value.replace(/\D/g, '');
            document.getElementById('perNationalId').value = rawVal;
            const statusEl = document.getElementById('perNationalIdStatus');
            const previewEl = document.getElementById('autoPasswordPreview');

            if (!rawVal) {
                statusEl.classList.add('hidden');
                previewEl.textContent = '';
                return;
            }

            statusEl.classList.remove('hidden');
            if (rawVal.length === 13) {
                const last6 = UIHelpers.getLast6DigitsFromNationalId(rawVal);
                statusEl.textContent = `✓ เลขบัตรประชาชนครบ 13 หลัก`;
                statusEl.className = 'text-xs mt-1 text-emerald-600 font-bold';
                previewEl.textContent = `(Username: ${rawVal} / Password: ${last6})`;
            } else {
                statusEl.textContent = `กรอกแล้ว ${rawVal.length}/13 หลัก`;
                statusEl.className = 'text-xs mt-1 text-amber-600 font-bold';
                previewEl.textContent = '';
            }
        };

        document.getElementById('perNationalId')?.addEventListener('input', validateNationalIdInput);

        document.getElementById('formPersonnel')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.#handleSavePersonnel();
        });

        document.getElementById('btnExportPersonnelExcel')?.addEventListener('click', () => {
            const rows = this.personnelList.map((p, idx) => ({
                'ลำดับ': idx + 1,
                'เลขบัตรประชาชน': p.national_id || '',
                'คำนำหน้า': p.prefix,
                'ชื่อ': p.first_name,
                'นามสกุล': p.last_name,
                'ประเภทตำแหน่ง': p.position_type,
                'ตำแหน่ง': p.position_title,
                'ระดับ': p.position_level,
                'หน่วยงาน': p.organization,
                'สำนักงาน/กอง': p.bureau,
                'ส่วน/ฝ่าย': p.division,
                'กลุ่มงาน': p.work_group,
                'ระดับบัญชี': p.account_role || 'User'
            }));
            UIHelpers.exportToExcelUTF8(rows, `ข้อมูลบุคลากร_${UIHelpers.getTodayISO()}`, 'Personnel');
        });

        document.getElementById('btnTemplatePersonnelExcel')?.addEventListener('click', () => {
            const templateRows = PersonnelModel.getExcelTemplateRows();
            UIHelpers.exportToExcelUTF8(templateRows, 'Template_นำเข้าข้อมูลบุคลากร', 'Template');
        });

        document.getElementById('inputImportPersonnelExcel')?.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            e.target.value = '';

            UIHelpers.showLoading('กำลังอ่านและนำเข้าข้อมูลบุคลากรจากไฟล์ Excel...');
            try {
                const rows = await UIHelpers.parseExcelFileUTF8(file);
                const res = await PersonnelModel.bulkImportFromExcel(rows, true);
                UIHelpers.hideLoading();
                await this.loadPersonnelData();
                await UIHelpers.alert(res.success ? 'นำเข้าข้อมูลสำเร็จ' : 'แจ้งเตือนการนำเข้า', res.message, res.success ? 'success' : 'warning');
            } catch (err) {
                UIHelpers.hideLoading();
                await UIHelpers.alert('ไม่สามารถอ่านไฟล์ Excel ได้', err.message, 'error');
            }
        });

        document.getElementById('personnelTableBody')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === 'edit-personnel') {
                const person = this.personnelList.find(p => p.id === id);
                if (person) this.#openModal(person);
            } else if (action === 'delete-personnel') {
                const name = btn.dataset.name || 'รายชื่อนี้';
                const confirmed = await UIHelpers.confirm(
                    'ยืนยันการลบข้อมูลบุคลากร',
                    `คุณต้องการลบข้อมูลของ "${name}" ออกจากระบบใช่หรือไม่?`,
                    'ลบข้อมูล',
                    'warning'
                );
                if (confirmed) {
                    UIHelpers.showLoading('กำลังลบข้อมูลบุคลากร...');
                    const res = await PersonnelModel.delete(id);
                    UIHelpers.hideLoading();
                    if (res.success) {
                        await this.loadPersonnelData();
                        await UIHelpers.showToast(res.message, 'success', 2500);
                    } else {
                        await UIHelpers.alert('ลบไม่สำเร็จ', res.message, 'error');
                    }
                }
            }
        });
    }

    async #handleSavePersonnel() {
        const id = document.getElementById('perId').value;
        const autoCreate = document.getElementById('chkAutoCreateAccount').checked;

        const payload = {
            prefix: document.getElementById('perPrefix').value,
            first_name: document.getElementById('perFirstName').value,
            last_name: document.getElementById('perLastName').value,
            national_id: document.getElementById('perNationalId').value,
            position_type: document.getElementById('perPosType').value,
            position_title: document.getElementById('perPosTitle').value,
            position_level: document.getElementById('perPosLevel').value,
            organization: document.getElementById('perOrganization').value,
            bureau: document.getElementById('perBureau').value,
            division: document.getElementById('perDivision').value,
            work_group: document.getElementById('perWorkGroup').value
        };

        UIHelpers.showLoading('กำลังบันทึกข้อมูลบุคลากร...');
        try {
            const res = id
                ? await PersonnelModel.update(id, payload)
                : await PersonnelModel.create(payload, autoCreate);

            UIHelpers.hideLoading();
            if (!res.success) {
                await UIHelpers.alert('บันทึกไม่สำเร็จ', res.message, 'error');
                return;
            }

            this.#closeModal();
            await this.loadPersonnelData();
            await UIHelpers.showToast(res.message, 'success', 2800);
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
        }
    }
}

if (!window.__BMA_SPA_ROUTER_ACTIVE__) {
    window.__BMA_SPA_ROUTER_ACTIVE__ = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new PersonnelController());
    } else {
        new PersonnelController();
    }
}