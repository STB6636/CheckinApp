/**
 * @file assets/js/controllers/PersonnelController.js
 * @description คลาสควบคุมหน้าจัดการข้อมูลบุคลากร (จำกัดสิทธิ์ Admin ทั้งขอบเขต "ส่วน/ฝ่าย" และ "สำนักงาน" ไม่ให้สามารถลบข้อมูลบุคลากรได้)
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
        this.canDeletePersonnel = false;
        this.init();
    }

    async init() {
        const layout = await AppLayout.initAdminLayout({
            activePage: 'personnel',
            pageTitle: 'จัดการข้อมูลบุคลากร',
            pageSubtitle: 'เพิ่ม แก้ไข ข้อมูลบุคลากร และสร้างบัญชีผู้ใช้งานอัตโนมัติตามขอบเขตการมองเห็น'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;
        this.settings = layout.settings || await SettingsModel.getSettings(false);

        // กฎ: บัญชีผู้ใช้งานระดับ Admin ขอบเขตการมองเห็น "ส่วน/ฝ่าย" และ "สำนักงาน" จะไม่สามารถลบข้อมูลในเมนูจัดการข้อมูลบุคลากรได้
        this.canDeletePersonnel = this.currentUser.role === 'SuperAdmin';

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
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 bma-text-sub">ไม่พบข้อมูลบุคลากรที่ค้นหา</td></tr>`;
            return;
        }

        const grouped = PersonnelModel.groupPersonnel(filtered, this.groupViewMode);
        let html = '';
        let runningNo = 1;

        for (const [bureauName, divisionsObj] of Object.entries(grouped)) {
            for (const [divisionName, content] of Object.entries(divisionsObj)) {
                html += `
                    <tr style="background-color: ${this.headerColor}18;">
                        <td colspan="6" class="font-bold text-sm py-2.5 px-4" style="color: ${this.headerColor}; border-left: 4px solid ${this.headerColor};">
                            <i class="fa-solid fa-building-user mr-1.5"></i>${bureauName} &gt; ${divisionName}
                        </td>
                    </tr>
                `;

                if (this.groupViewMode === 'group') {
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
                    for (const person of content) {
                        html += this.#buildPersonRowHtml(person, runningNo++);
                    }
                }
            }
        }

        tbody.innerHTML = html;
    }

    #buildPersonRowHtml(person, indexNo) {
        const fullName = `${person.prefix || ''}${person.first_name || ''} ${person.last_name || ''}`.trim();
        const posFull = `${person.position_title || ''}${person.position_level || ''}`;
        const roleMeta = person.role_meta || PersonnelModel.getRolePastelMeta(person.account_role || 'User');

        // ซ่อนปุ่มลบหากเป็น Admin (ทั้งขอบเขต "ส่วน/ฝ่าย" และ "สำนักงาน") อนุญาตให้ลบได้เฉพาะ SuperAdmin
        const deleteBtnHtml = this.canDeletePersonnel
            ? `
                <button type="button" data-action="delete-personnel" data-id="${person.id}" data-name="${fullName}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500" title="ลบ">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `
            : '';

        return `
            <tr class="cursor-pointer hover:bg-emerald-50/60 dark:hover:bg-slate-700/50 transition-colors" data-person-id="${person.id}">
                <td class="text-center font-semibold">${indexNo}</td>
                <td>
                    <div class="flex items-center gap-2.5 whitespace-nowrap">
                        <span class="w-3 h-3 rounded-full shrink-0 ${roleMeta.dotClass}"></span>
                        <span class="font-bold bma-text-main">${fullName}</span>
                    </div>
                </td>
                <td>
                    <span class="font-semibold bma-text-main">${posFull}</span>
                    <span class="block text-xs bma-text-sub">${person.position_type || ''}</span>
                </td>
                <td class="text-xs bma-text-sub">${person.work_group || '-'}</td>
                <td class="text-center">
                    <span class="bma-badge ${roleMeta.badgeClass}">${roleMeta.label}</span>
                </td>
                <td class="text-center space-x-1 whitespace-nowrap">
                    <button type="button" data-action="edit-personnel" data-id="${person.id}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500" title="แก้ไข">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    ${deleteBtnHtml}
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
            if (btn) {
                const action = btn.dataset.action;
                const id = btn.dataset.id;

                if (action === 'edit-personnel') {
                    const person = this.personnelList.find(p => p.id === id);
                    if (person) this.#openModal(person);
                } else if (action === 'delete-personnel') {
                    // บล็อกคำสั่งลบทันทีหากไม่ใช่ SuperAdmin
                    if (!this.canDeletePersonnel) {
                        await UIHelpers.alert('ไม่มีสิทธิ์ลบข้อมูล', 'บัญชีผู้ใช้งานระดับ Admin ไม่สามารถลบข้อมูลในเมนูจัดการข้อมูลบุคลากรได้', 'warning');
                        return;
                    }

                    const name = btn.dataset.name || 'รายชื่อนี้';
                    const confirmed = await UIHelpers.confirm(
                        'ยืนยันการลบข้อมูลบุคลากร',
                        `คุณต้องการลบข้อมูลของ "${name}" ออกจากระบบใช่หรือไม่?`,
                        'ลบข้อมูล',
                        'warning'
                    );
                    if (confirmed) {
                        UIHelpers.showLoading('กำลังลบข้อมูลบุคลากร...');
                        const res = await PersonnelModel.delete(id, this.currentUser);
                        UIHelpers.hideLoading();
                        if (res.success) {
                            await this.loadPersonnelData();
                            await UIHelpers.showToast(res.message, 'success', 2500);
                        } else {
                            await UIHelpers.alert('ลบไม่สำเร็จ', res.message, 'error');
                        }
                    }
                }
                return;
            }

            // คลิกที่แถวบุคลากรเพื่อเปิด Resume Profile Modal
            const row = e.target.closest('tr[data-person-id]');
            if (row) {
                const personId = row.dataset.personId;
                const person = this.personnelList.find(p => p.id === personId);
                if (person) {
                    this.#openPersonnelResumeModal(person);
                }
            }
        });

        // Event listeners ปิด Resume Profile Modal
        document.getElementById('btnClosePersonnelResumeModal')?.addEventListener('click', () => {
            this.#closePersonnelResumeModal();
        });
        document.getElementById('btnClosePersonnelResumeModalBottom')?.addEventListener('click', () => {
            this.#closePersonnelResumeModal();
        });
        document.getElementById('modalPersonnelResumeProfile')?.addEventListener('click', (e) => {
            if (e.target.id === 'modalPersonnelResumeProfile') {
                this.#closePersonnelResumeModal();
            }
        });
    }

    /**
     * เปิด Resume Profile Modal แสดงข้อมูลประวัติบุคลากรแบบละเอียด
     * @param {Object} person 
     */
    #openPersonnelResumeModal(person) {
        const modal = document.getElementById('modalPersonnelResumeProfile');
        if (!modal || !person) return;

        const fullName = `${person.prefix || ''}${person.first_name || ''} ${person.last_name || ''}`.trim();
        const posFull = `${person.position_title || ''}${person.position_level || ''}`;
        const roleMeta = person.role_meta || PersonnelModel.getRolePastelMeta(person.account_role || 'User');

        const elFullName = document.getElementById('perResumeFullName');
        if (elFullName) elFullName.textContent = fullName || '-';

        const elPosition = document.getElementById('perResumePositionHeadline');
        if (elPosition) elPosition.textContent = posFull || '-';

        const elAffiliation = document.getElementById('perResumeAffiliationHeadline');
        if (elAffiliation) {
            const affText = `${person.bureau || '-'} > ${person.division || '-'}`;
            elAffiliation.innerHTML = `<i class="fa-solid fa-building-user text-slate-400"></i><span>${affText}</span>`;
        }

        const elBadge = document.getElementById('perResumeRoleBadge');
        if (elBadge) {
            elBadge.className = `bma-badge ${roleMeta.badgeClass} text-xs px-2.5 py-0.5 rounded-full font-bold`;
            elBadge.textContent = roleMeta.label;
        }

        const elNationalId = document.getElementById('perResumeNationalId');
        if (elNationalId) {
            const rawNid = String(person.national_id || '').replace(/\D/g, '');
            const formattedNid = rawNid.length === 13
                ? `${rawNid[0]}-${rawNid.slice(1, 5)}-${rawNid.slice(5, 10)}-${rawNid.slice(10, 12)}-${rawNid[12]}`
                : (person.national_id || '-');
            elNationalId.textContent = formattedNid;
        }

        const elUsername = document.getElementById('perResumeUsername');
        if (elUsername) {
            elUsername.textContent = person.username || person.national_id || '-';
        }

        const elPosType = document.getElementById('perResumePositionType');
        if (elPosType) elPosType.textContent = person.position_type || '-';

        const elOrg = document.getElementById('perResumeOrgName');
        if (elOrg) elOrg.textContent = person.organization || 'กรุงเทพมหานคร';

        const elBureau = document.getElementById('perResumeBureauName');
        if (elBureau) elBureau.textContent = person.bureau || '-';

        const elDivision = document.getElementById('perResumeDivisionName');
        if (elDivision) elDivision.textContent = person.division || '-';

        const elWorkGroup = document.getElementById('perResumeWorkGroupName');
        if (elWorkGroup) elWorkGroup.textContent = person.work_group || '-';

        // จัดการปุ่มแก้ไขใน Resume Modal
        const btnEdit = document.getElementById('btnResumeEditPersonnel');
        if (btnEdit) {
            btnEdit.onclick = () => {
                this.#closePersonnelResumeModal();
                this.#openModal(person);
            };
        }

        // จัดการปุ่มลบใน Resume Modal (เฉพาะ SuperAdmin เท่านั้น)
        const btnDelete = document.getElementById('btnResumeDeletePersonnel');
        if (btnDelete) {
            btnDelete.classList.toggle('hidden', !this.canDeletePersonnel);
            btnDelete.onclick = async () => {
                if (!this.canDeletePersonnel) return;
                const confirmed = await UIHelpers.confirm(
                    'ยืนยันการลบข้อมูลบุคลากร',
                    `คุณต้องการลบข้อมูลของ "${fullName}" ออกจากระบบใช่หรือไม่?`,
                    'ลบข้อมูล',
                    'warning'
                );
                if (confirmed) {
                    this.#closePersonnelResumeModal();
                    UIHelpers.showLoading('กำลังลบข้อมูลบุคลากร...');
                    const res = await PersonnelModel.delete(person.id, this.currentUser);
                    UIHelpers.hideLoading();
                    if (res.success) {
                        await this.loadPersonnelData();
                        await UIHelpers.showToast(res.message, 'success', 2500);
                    } else {
                        await UIHelpers.alert('ลบไม่สำเร็จ', res.message, 'error');
                    }
                }
            };
        }

        modal.classList.remove('hidden');
    }

    #closePersonnelResumeModal() {
        const modal = document.getElementById('modalPersonnelResumeProfile');
        modal?.classList.add('hidden');
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