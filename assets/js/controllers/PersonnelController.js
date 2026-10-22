/**
 * @file assets/js/controllers/PersonnelController.js
 * @description คลาสควบคุมหน้าจัดการข้อมูลบุคลากร (เพิ่มบัญชีอัตโนมัติ, Group By 2 มุมมอง, นำเข้า-ส่งออก Excel UTF-8)
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
        this.groupViewMode = 'division'; // 'division' หรือ 'group'
        this.headerColor = '#00744B';
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
        this.settings = await SettingsModel.getSettings(true);

        if (this.settings?.category_colors?.group_header) {
            this.headerColor = this.settings.category_colors.group_header;
            document.getElementById('personnelHeaderColorPicker').value = this.headerColor;
        }

        this.#populateDropdownsFromSettings();
        this.#bindEvents();
        await this.loadPersonnelData();
    }

    /**
     * เติมตัวเลือกในฟอร์มจากตั้งค่าระบบแบบกรองค่าไม่ซ้ำ (Unique Cascading Dropdowns)
     */
    #populateDropdownsFromSettings() {
        const prefixes = this.settings.prefixes || ['นาย', 'นาง', 'นางสาว'];
        document.getElementById('perPrefix').innerHTML = prefixes.map(p => `<option value="${p}">${p}</option>`).join('');

        // ตำแหน่ง
        const posTypes = SettingsModel.getUniquePositionTypes(this.settings);
        const posTypeSelect = document.getElementById('perPosType');
        posTypeSelect.innerHTML = posTypes.map(t => `<option value="${t}">${t}</option>`).join('');
        this.#updatePositionSubDropdowns(posTypeSelect.value);

        // สังกัด
        const orgs = SettingsModel.getUniqueOrganizations(this.settings);
        const orgSelect = document.getElementById('perOrganization');
        orgSelect.innerHTML = orgs.map(o => `<option value="${o}">${o}</option>`).join('');

        let bureaus = SettingsModel.getUniqueBureaus(this.settings, orgSelect.value);
        // กรณีเป็น Admin จำกัดขอบเขตเฉพาะสำนักงาน/กอง ของตนเอง
        if (this.currentUser.role === 'Admin' && this.currentUser.scope_bureau) {
            bureaus = [this.currentUser.scope_bureau];
        }
        const bureauSelect = document.getElementById('perBureau');
        bureauSelect.innerHTML = bureaus.map(b => `<option value="${b}">${b}</option>`).join('');
        this.#updateAffiliationSubDropdowns(bureauSelect.value);
    }

    #updatePositionSubDropdowns(selectedType, selectedTitle = '', selectedLevel = '') {
        const titles = SettingsModel.getUniquePositionTitles(this.settings, selectedType);
        const titleSelect = document.getElementById('perPosTitle');
        titleSelect.innerHTML = titles.map(t => `<option value="${t}">${t}</option>`).join('');
        if (selectedTitle && titles.includes(selectedTitle)) {
            titleSelect.value = selectedTitle;
        }

        const levels = SettingsModel.getUniquePositionLevels(this.settings, selectedType, titleSelect.value);
        const levelSelect = document.getElementById('perPosLevel');
        levelSelect.innerHTML = levels.map(l => `<option value="${l}">${l}</option>`).join('');
        if (selectedLevel && levels.includes(selectedLevel)) {
            levelSelect.value = selectedLevel;
        }
    }

    #updateAffiliationSubDropdowns(selectedBureau, selectedDivision = '', selectedGroup = '') {
        let divisions = SettingsModel.getUniqueDivisions(this.settings, selectedBureau);
        // กรณีเป็น Admin ที่จำกัดขอบเขตระดับ ส่วน/ฝ่าย
        if (this.currentUser.role === 'Admin' && this.currentUser.visibility_level === 'division' && this.currentUser.scope_division) {
            divisions = [this.currentUser.scope_division];
        }

        const divSelect = document.getElementById('perDivision');
        divSelect.innerHTML = divisions.map(d => `<option value="${d}">${d}</option>`).join('');
        if (selectedDivision && divisions.includes(selectedDivision)) {
            divSelect.value = selectedDivision;
        }

        const groups = SettingsModel.getUniqueGroups(this.settings, selectedBureau, divSelect.value);
        const groupSelect = document.getElementById('perWorkGroup');
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
            tbody.innerHTML = UIHelpers.renderTableSkeleton(6, 6);
        }

        UIHelpers.showLoading('กำลังโหลดข้อมูลบุคลากร...');
        try {
            this.personnelList = await PersonnelModel.getAll(this.currentUser);
            this.#renderGroupedTable();
        } finally {
            UIHelpers.hideLoading();
        }
    }

    /**
     * แสดงตารางข้อมูลบุคลากรแบบ Group By 2 มุมมอง:
     * - มุมมองที่ 1 ('division'): [สำนักงาน/กอง > ส่วน/ฝ่าย]
     * - มุมมองที่ 2 ('group'): [สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน]
     */
    #renderGroupedTable() {
        const tbody = document.getElementById('personnelTableBody');
        const totalBadge = document.getElementById('personnelTotalCountBadge');
        if (!tbody) return;

        const keyword = this.searchKeyword.toLowerCase().trim();
        const filtered = this.personnelList.filter(p => {
            if (!keyword) return true;
            const fullText = `${p.prefix}${p.first_name} ${p.last_name} ${p.national_id || ''} ${p.position_title} ${p.position_level} ${p.bureau} ${p.division} ${p.work_group}`.toLowerCase();
            return fullText.includes(keyword);
        });

        if (totalBadge) totalBadge.textContent = String(filtered.length);

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 bma-text-sub">ไม่พบข้อมูลบุคลากรที่ค้นหา</td></tr>`;
            return;
        }

        const grouped = PersonnelModel.groupPersonnel(filtered, this.groupViewMode);
        let html = '';
        let runningNo = 1;

        for (const [bureauName, divisionsObj] of Object.entries(grouped)) {
            for (const [divisionName, content] of Object.entries(divisionsObj)) {
                // แถวหัวข้อกลุ่มระดับ สำนักงาน/กอง > ส่วน/ฝ่าย
                html += `
                    <tr style="background-color: ${this.headerColor}18;">
                        <td colspan="6" class="font-bold text-sm py-2.5 px-4" style="color: ${this.headerColor}; border-left: 4px solid ${this.headerColor};">
                            <i class="fa-solid fa-building-user mr-1.5"></i>${bureauName} &gt; ${divisionName}
                        </td>
                    </tr>
                `;

                if (this.groupViewMode === 'group') {
                    // มุมมองที่ 2: แยกตาม กลุ่มงาน ย่อยลงไปอีกชั้น
                    for (const [groupName, members] of Object.entries(content)) {
                        html += `
                            <tr class="bg-slate-100/80 dark:bg-slate-800/50">
                                <td colspan="6" class="font-semibold text-xs py-2 pl-8 bma-text-main">
                                    <i class="fa-solid fa-layer-group mr-1.5 text-emerald-600"></i>กลุ่มงาน: ${groupName} (${members.length} คน)
                                </td>
                            </tr>
                        `;
                        for (const person of members) {
                            html += this.#buildPersonRowHtml(person, runningNo++);
                        }
                    }
                } else {
                    // มุมมองที่ 1: แสดงรายชื่อภายใต้ สำนักงาน/กอง > ส่วน/ฝ่าย
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
        const badgeColor = person.badge_color || '#00744B';

        return `
            <tr>
                <td class="text-center font-semibold">${indexNo}</td>
                <td>
                    <div class="flex items-center gap-2.5">
                        <span class="w-3 h-3 rounded-full shrink-0" style="background-color: ${badgeColor};"></span>
                        <span class="font-semibold bma-text-main">${fullName}</span>
                    </div>
                </td>
                <td>
                    <span class="font-medium bma-text-main">${posFull}</span>
                    <span class="block text-xs bma-text-sub">${person.position_type || ''}</span>
                </td>
                <td class="font-mono text-xs">${person.national_id || '<span class="bma-text-muted">ไม่ระบุ</span>'}</td>
                <td class="text-xs bma-text-sub">${person.work_group || '-'}</td>
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

        statusEl.classList.add('hidden');
        previewEl.textContent = '';

        if (!editPerson) {
            titleEl.innerHTML = `<i class="fa-solid fa-user-plus" style="color: var(--bma-primary);"></i><span>เพิ่มข้อมูลบุคลากรใหม่</span>`;
            document.getElementById('perId').value = '';
            document.getElementById('perFirstName').value = '';
            document.getElementById('perLastName').value = '';
            document.getElementById('perNationalId').value = '';
            document.getElementById('perBadgeColor').value = '#00744B';
            autoBox.classList.remove('hidden');
            chkAuto.checked = true;
            this.#populateDropdownsFromSettings();
        } else {
            titleEl.innerHTML = `<i class="fa-solid fa-user-pen" style="color: var(--bma-primary);"></i><span>แก้ไขข้อมูลบุคลากร</span>`;
            document.getElementById('perId').value = editPerson.id;
            document.getElementById('perPrefix').value = editPerson.prefix;
            document.getElementById('perFirstName').value = editPerson.first_name;
            document.getElementById('perLastName').value = editPerson.last_name;
            document.getElementById('perNationalId').value = editPerson.national_id || '';
            document.getElementById('perBadgeColor').value = editPerson.badge_color || '#00744B';
            autoBox.classList.add('hidden');
            chkAuto.checked = false;

            document.getElementById('perPosType').value = editPerson.position_type;
            this.#updatePositionSubDropdowns(editPerson.position_type, editPerson.position_title, editPerson.position_level);

            document.getElementById('perOrganization').value = editPerson.organization;
            document.getElementById('perBureau').value = editPerson.bureau;
            this.#updateAffiliationSubDropdowns(editPerson.bureau, editPerson.division, editPerson.work_group);
        }

        modal.classList.remove('hidden');
    }

    #closeModal() {
        document.getElementById('modalPersonnelForm')?.classList.add('hidden');
    }

    #bindEvents() {
        // ค้นหาและสลับมุมมอง Group By
        document.getElementById('searchPersonnelInput')?.addEventListener('input', (e) => {
            this.searchKeyword = e.target.value;
            this.#renderGroupedTable();
        });

        document.getElementById('selectPersonnelGroupBy')?.addEventListener('change', (e) => {
            this.groupViewMode = e.target.value;
            this.#renderGroupedTable();
        });

        document.getElementById('personnelHeaderColorPicker')?.addEventListener('input', (e) => {
            this.headerColor = e.target.value;
            this.#renderGroupedTable();
        });

        // ปุ่มเปิด/ปิด Modal
        document.getElementById('btnOpenAddPersonnel')?.addEventListener('click', () => this.#openModal(null));
        document.getElementById('btnClosePersonnelModal')?.addEventListener('click', () => this.#closeModal());
        document.getElementById('btnCancelPersonnelModal')?.addEventListener('click', () => this.#closeModal());

        // Cascading Dropdowns สำหรับตำแหน่งและสังกัด
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

        // ตรวจสอบเลขบัตรประชาชน 13 หลัก และแสดงตัวอย่างรหัสผ่าน 6 ตัวท้ายแบบเรียลไทม์
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
                statusEl.className = 'text-xs mt-1 text-emerald-500 font-semibold';
                previewEl.textContent = `(Username: ${rawVal} / Password: ${last6})`;
            } else {
                statusEl.textContent = `กรอกแล้ว ${rawVal.length}/13 หลัก`;
                statusEl.className = 'text-xs mt-1 text-amber-500 font-semibold';
                previewEl.textContent = '';
            }
        };

        document.getElementById('perNationalId')?.addEventListener('input', validateNationalIdInput);

        // บันทึกฟอร์มเพิ่ม/แก้ไขบุคลากร
        document.getElementById('formPersonnel')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.#handleSavePersonnel();
        });

        // ส่งออก Excel และ ดาวน์โหลด Template Excel
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
                'กลุ่มงาน': p.work_group
            }));
            UIHelpers.exportToExcelUTF8(rows, `ข้อมูลบุคลากร_${UIHelpers.getTodayISO()}`, 'Personnel');
        });

        document.getElementById('btnTemplatePersonnelExcel')?.addEventListener('click', () => {
            const templateRows = PersonnelModel.getExcelTemplateRows();
            UIHelpers.exportToExcelUTF8(templateRows, 'Template_นำเข้าข้อมูลบุคลากร', 'Template');
        });

        // นำเข้าไฟล์ Excel
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

        // Event Delegation สำหรับปุ่มแก้ไขและลบในตาราง
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
                        await UIHelpers.alert('ลบสำเร็จ', res.message, 'success');
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
            badge_color: document.getElementById('perBadgeColor').value,
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
            await UIHelpers.alert('บันทึกสำเร็จ', res.message, 'success');
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