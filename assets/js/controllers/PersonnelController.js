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
        this.bulkImportRows = [];
        this.isProcessingBulkImport = false;
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

        // แสดง '-' หากกลุ่มงานเป็น 'ไม่มี' หรือว่างเปล่า
        const workGroupText = (!person.work_group || person.work_group.trim() === 'ไม่มี') ? '-' : person.work_group;

        // สิทธิ์ระดับบัญชี: หากยังไม่มีบัญชี ให้แสดงปุ่ม [+ สร้างบัญชี]
        const roleColumnHtml = person.has_account === false
            ? `
                <button type="button" data-action="auto-create-account" data-id="${person.id}" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-2xs" title="คลิกเพื่อสร้างบัญชีผู้ใช้งานอัตโนมัติ">
                    <i class="fa-solid fa-user-plus text-[11px]"></i>
                    <span>+ สร้างบัญชี</span>
                </button>
            `
            : `
                <span class="bma-badge ${roleMeta.badgeClass}">${roleMeta.label}</span>
            `;

        const dotClass = person.has_account === false ? 'bg-amber-400' : (roleMeta.dotClass || 'bg-emerald-400');

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
                        <span class="w-3 h-3 rounded-full shrink-0 ${dotClass}"></span>
                        <span class="font-bold bma-text-main">${fullName}</span>
                    </div>
                </td>
                <td>
                    <span class="font-semibold bma-text-main">${posFull}</span>
                    <span class="block text-xs bma-text-sub">${person.position_type || ''}</span>
                </td>
                <td class="text-xs bma-text-sub">${workGroupText}</td>
                <td class="text-center">
                    ${roleColumnHtml}
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

        document.getElementById('btnOpenBulkImportModal')?.addEventListener('click', () => {
            this.#openBulkImportModal();
        });

        document.getElementById('btnTemplatePersonnelExcel')?.addEventListener('click', () => {
            this.#downloadMultiSheetTemplate();
        });

        document.getElementById('inputImportPersonnelExcel')?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            e.target.value = '';
            this.#processBulkImportFile(file);
        });

        document.getElementById('personnelTableBody')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (btn) {
                const action = btn.dataset.action;
                const id = btn.dataset.id;

                if (action === 'auto-create-account') {
                    await this.#handleQuickCreateAccount(id);
                    return;
                }

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

        // Event listeners ระบบ Smart Bulk Import Modal
        document.getElementById('btnCloseBulkImportModal')?.addEventListener('click', () => {
            this.#closeBulkImportModal();
        });
        document.getElementById('btnCancelBulkImport')?.addEventListener('click', () => {
            this.#closeBulkImportModal();
        });
        document.getElementById('btnDownloadImportTemplate')?.addEventListener('click', () => {
            this.#downloadMultiSheetTemplate();
        });

        const dropzone = document.getElementById('dropzoneBulkPersonnel');
        const inputBulkFile = document.getElementById('inputBulkPersonnelFile');

        dropzone?.addEventListener('click', (e) => {
            if (e.target.closest('#btnDownloadImportTemplate')) return;
            inputBulkFile?.click();
        });

        dropzone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('border-emerald-600', 'bg-emerald-100/50');
        });

        dropzone?.addEventListener('dragleave', () => {
            dropzone.classList.remove('border-emerald-600', 'bg-emerald-100/50');
        });

        dropzone?.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-emerald-600', 'bg-emerald-100/50');
            const file = e.dataTransfer.files?.[0];
            if (file) this.#processBulkImportFile(file);
        });

        inputBulkFile?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            this.#processBulkImportFile(file);
        });

        document.getElementById('btnConfirmBulkImport')?.addEventListener('click', async () => {
            await this.#handleExecuteBulkImport();
        });

        // Preview Table Inline Edit, Select Change & Row Delete
        const previewTbody = document.getElementById('bulkImportPreviewTableBody');
        previewTbody?.addEventListener('blur', (e) => {
            const cell = e.target.closest('[contenteditable="true"]');
            if (cell) {
                const tr = cell.closest('tr');
                const rIdx = parseInt(tr.dataset.rowIdx, 10);
                const field = cell.dataset.field;
                if (!isNaN(rIdx) && this.bulkImportRows[rIdx] && field) {
                    this.bulkImportRows[rIdx].cells[field].value = cell.textContent.trim();
                    this.#revalidateRow(rIdx);
                }
            }
        }, true);

        previewTbody?.addEventListener('change', (e) => {
            const select = e.target.closest('.bulk-inline-select');
            if (select) {
                const rIdx = parseInt(select.dataset.rowIdx, 10);
                const field = select.dataset.field;
                const newVal = select.value.trim();
                if (!isNaN(rIdx) && this.bulkImportRows[rIdx] && field && newVal) {
                    const cell = this.bulkImportRows[rIdx].cells[field];
                    cell.value = newVal;
                    cell.status = 'healed';
                    delete cell.availableOptions;
                    this.#revalidateRow(rIdx);
                }
            }
        });

        previewTbody?.addEventListener('click', (e) => {
            const delBtn = e.target.closest('button[data-action="delete-preview-row"]');
            if (delBtn) {
                const idx = parseInt(delBtn.dataset.idx, 10);
                if (!isNaN(idx)) {
                    this.bulkImportRows.splice(idx, 1);
                    this.#renderBulkImportPreview();
                }
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
        const btnResumeCreate = document.getElementById('btnResumeCreateAccount');

        if (person.has_account === false) {
            if (elBadge) {
                elBadge.className = 'bma-badge bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold';
                elBadge.textContent = 'ยังไม่มีบัญชี';
            }
            if (btnResumeCreate) {
                btnResumeCreate.classList.remove('hidden');
                btnResumeCreate.onclick = async () => {
                    await this.#handleQuickCreateAccount(person.id);
                };
            }
        } else {
            if (elBadge) {
                elBadge.className = `bma-badge ${roleMeta.badgeClass} text-xs px-2.5 py-0.5 rounded-full font-bold`;
                elBadge.textContent = roleMeta.label;
            }
            if (btnResumeCreate) {
                btnResumeCreate.classList.add('hidden');
            }
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
        if (elWorkGroup) {
            const wg = (!person.work_group || person.work_group.trim() === 'ไม่มี') ? '-' : person.work_group;
            elWorkGroup.textContent = wg;
        }

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

    async #handleQuickCreateAccount(personId) {
        const person = this.personnelList.find(p => p.id === personId);
        if (!person) return;

        const cleanNid = String(person.national_id || '').replace(/\D/g, '');
        if (cleanNid.length !== 13) {
            await UIHelpers.alert(
                'ข้อมูลไม่ครบถ้วน',
                `ไม่สามารถสร้างบัญชีได้เนื่องจากบุคลากรท่านนี้มีเลขประจำตัวประชาชนไม่ครบ 13 หลัก (ปัจจุบันมี ${cleanNid.length} หลัก)\nกรุณาแก้ไขข้อมูลบุคลากรให้ถูกต้องก่อนดำเนินการ`,
                'warning'
            );
            return;
        }

        const fullName = `${person.prefix || ''}${person.first_name || ''} ${person.last_name || ''}`.trim();
        const autoPass = UIHelpers.getLast6DigitsFromNationalId(cleanNid);

        const confirmed = await UIHelpers.confirm(
            'ยืนยันการสร้างบัญชีผู้ใช้งาน',
            `ต้องการสร้างบัญชีผู้ใช้งานสำหรับ "${fullName}" หรือไม่?\n• ชื่อผู้ใช้ (Username): ${cleanNid}\n• รหัสผ่านเริ่มต้น (Password): ${autoPass}\n• ระดับบัญชี: User`,
            'สร้างบัญชีทันที',
            'question'
        );
        if (!confirmed) return;

        UIHelpers.showLoading('กำลังสร้างบัญชีผู้ใช้งาน...');
        const res = await PersonnelModel.quickCreateAccount(personId);
        UIHelpers.hideLoading();

        if (!res.success) {
            await UIHelpers.alert('สร้างบัญชีไม่สำเร็จ', res.message, 'error');
            return;
        }

        // Reactive State & UI Update
        person.has_account = true;
        person.account_role = 'User';
        person.account_username = res.username;
        person.role_meta = PersonnelModel.getRolePastelMeta('User');

        this.#renderGroupedTable();

        const resumeModal = document.getElementById('modalPersonnelResumeProfile');
        if (resumeModal && !resumeModal.classList.contains('hidden')) {
            this.#openPersonnelResumeModal(person);
        }

        await Swal.fire({
            icon: 'success',
            title: 'สร้างบัญชีผู้ใช้งานสำเร็จ!',
            html: `
                <div class="text-left text-xs sm:text-sm space-y-2.5 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mt-2 font-sans">
                    <div><b>ชื่อ-นามสกุล:</b> <span class="text-slate-800 dark:text-slate-200">${res.fullName || fullName}</span></div>
                    <div><b>ชื่อผู้ใช้ (Username):</b> <code class="text-emerald-700 dark:text-emerald-400 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">${res.username}</code></div>
                    <div><b>รหัสผ่านเริ่มต้น (Password):</b> <code class="text-rose-600 dark:text-rose-400 font-mono font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">${res.password}</code></div>
                    <div class="text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">หมายเหตุ: รหัสผ่านเริ่มต้นคือเลขบัตรประชาชน 6 ตัวท้าย สามารถแจ้งให้ผู้ใช้เข้าสู่ระบบได้ทันที</div>
                </div>
            `,
            confirmButtonColor: '#00744B',
            confirmButtonText: 'ตกลง'
        });
    }

    #diceCoefficient(str1, str2) {
        const s1 = String(str1 || '').trim().toLowerCase();
        const s2 = String(str2 || '').trim().toLowerCase();
        if (s1 === s2) return 1.0;
        if (s1.length < 2 || s2.length < 2) return 0.0;
        const getBigrams = str => {
            const map = new Map();
            for (let i = 0; i < str.length - 1; i++) {
                const bg = str.substring(i, i + 2);
                map.set(bg, (map.get(bg) || 0) + 1);
            }
            return map;
        };
        const b1 = getBigrams(s1);
        const b2 = getBigrams(s2);
        let intersection = 0;
        for (const [key, val] of b1) {
            if (b2.has(key)) intersection += Math.min(val, b2.get(key));
        }
        return (2.0 * intersection) / ((s1.length - 1) + (s2.length - 1));
    }

    #findBestFuzzyMatch(value, candidates, threshold = 0.5) {
        if (!value || !candidates || candidates.length === 0) return { match: null, score: 0, isExact: false };
        const trimmed = String(value).trim();
        const exact = candidates.find(c => c.trim().toLowerCase() === trimmed.toLowerCase());
        if (exact) return { match: exact, score: 1.0, isExact: true };

        let bestMatch = null;
        let bestScore = 0;
        for (const c of candidates) {
            const score = this.#diceCoefficient(trimmed, c);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = c;
            }
        }
        return (bestScore >= threshold) ? { match: bestMatch, score: bestScore, isExact: false } : { match: null, score: bestScore, isExact: false };
    }

    #openBulkImportModal(initialFile = null) {
        this.bulkImportRows = [];
        this.isProcessingBulkImport = false;

        const modal = document.getElementById('modalPersonnelBulkImport');
        if (!modal) return;

        // Reset KPIs
        document.getElementById('bulkImportKpiTotal').textContent = '0 รายการ';
        document.getElementById('bulkImportKpiValid').textContent = '0 รายการ';
        document.getElementById('bulkImportKpiHealed').textContent = '0 รายการ';
        document.getElementById('bulkImportKpiErrors').textContent = '0 รายการ';

        // Reset Progress
        const prog = document.getElementById('bulkImportProgressContainer');
        if (prog) prog.classList.add('hidden');
        const pbar = document.getElementById('bulkImportProgressBar');
        if (pbar) pbar.style.width = '0%';

        // Reset Table
        const tbody = document.getElementById('bulkImportPreviewTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="14" class="text-center py-8 text-slate-400">กรุณาเลือกหรือวางไฟล์ Excel เพื่อแสดงผลตัวอย่างการตรวจสอบข้อมูล</td></tr>`;
        }

        // Reset Buttons
        const confirmBtn = document.getElementById('btnConfirmBulkImport');
        if (confirmBtn) confirmBtn.disabled = true;

        modal.classList.remove('hidden');

        if (initialFile) {
            this.#processBulkImportFile(initialFile);
        }
    }

    #closeBulkImportModal() {
        if (this.isProcessingBulkImport) return;
        const modal = document.getElementById('modalPersonnelBulkImport');
        modal?.classList.add('hidden');
        const inputFile = document.getElementById('inputBulkPersonnelFile');
        if (inputFile) inputFile.value = '';
        const inputImport = document.getElementById('inputImportPersonnelExcel');
        if (inputImport) inputImport.value = '';
    }

    async #processBulkImportFile(file) {
        const tbody = document.getElementById('bulkImportPreviewTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="14" class="text-center py-8 text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2 text-[#00744B]"></i>กำลังอ่านและวิเคราะห์ความสมบูรณ์ของโครงสร้างข้อมูล (Data Health Analysis)...</td></tr>`;
        }

        try {
            const rawRows = await UIHelpers.parseExcelFileUTF8(file);
            if (!Array.isArray(rawRows) || rawRows.length === 0) {
                if (tbody) tbody.innerHTML = `<tr><td colspan="14" class="text-center py-8 text-rose-500 font-bold">ไม่พบข้อมูลแถวในไฟล์ที่เลือก กรุณาตรวจสอบไฟล์</td></tr>`;
                return;
            }

            // Reference master datasets from settings
            const prefixes = this.settings.prefixes || ['นาย', 'นาง', 'นางสาว'];
            const posTypes = SettingsModel.getUniquePositionTypes(this.settings);
            const validPosTypes = posTypes.length > 0 ? posTypes : ['ประเภททั่วไป', 'ประเภทวิชาการ', 'ประเภทอำนวยการ', 'ประเภทบริหาร'];
            const posTitles = SettingsModel.getUniquePositionTitles(this.settings, '');
            const rawPosLevels = SettingsModel.getUniquePositionLevels(this.settings, '', '');
            const posLevels = rawPosLevels.length > 0 ? rawPosLevels : ['ปฏิบัติงาน', 'ชำนาญงาน', 'อาวุโส', 'ทักษะพิเศษ', 'ปฏิบัติการ', 'ชำนาญการ', 'ชำนาญการพิเศษ', 'เชี่ยวชาญ', 'ทรงคุณวุฒิ'];
            const orgs = SettingsModel.getUniqueOrganizations(this.settings);
            const validOrgs = orgs.length > 0 ? orgs : ['กรุงเทพมหานคร'];
            const bureaus = SettingsModel.getUniqueBureaus(this.settings, '');
            const divisions = SettingsModel.getUniqueDivisions(this.settings, '');

            const existingNidsInDb = new Set(this.personnelList.map(p => String(p.national_id || '').replace(/\D/g, '')).filter(Boolean));
            const seenNidsInFile = new Set();

            const parsedRows = [];

            for (let i = 0; i < rawRows.length; i++) {
                const row = rawRows[i];

                // 1. National ID (13 หลัก)
                const rawNid = String(row['เลขบัตรประชาชน'] || row['เลขประจำตัวประชาชน'] || row['national_id'] || row['id_card'] || '').replace(/\D/g, '');
                let nidStatus = 'valid';
                let nidMsg = '';
                if (!rawNid) {
                    nidStatus = 'error';
                    nidMsg = 'ไม่ได้ระบุเลขบัตรประชาชน';
                } else if (rawNid.length !== 13) {
                    nidStatus = 'error';
                    nidMsg = `เลขบัตรไม่ครบ 13 หลัก (${rawNid.length} หลัก)`;
                } else if (!UIHelpers.validateThaiNationalId(rawNid, false).valid) {
                    nidStatus = 'error';
                    nidMsg = 'รูปแบบเลขบัตรประชาชนไม่ถูกต้องตามหลักตรวจสอบ (Checksum)';
                } else if (seenNidsInFile.has(rawNid)) {
                    nidStatus = 'error';
                    nidMsg = 'เลขบัตรประชาชนซ้ำในไฟล์ชุดนี้';
                } else if (existingNidsInDb.has(rawNid)) {
                    nidStatus = 'error';
                    nidMsg = 'เลขบัตรประชาชนนี้มีอยู่ในฐานข้อมูลแล้ว';
                } else {
                    seenNidsInFile.add(rawNid);
                }

                // 2. Prefix (คำนำหน้า)
                const rawPrefix = String(row['คำนำหน้า'] || row['คำนำหน้านาม'] || row['prefix'] || '').trim();
                let prefixVal = rawPrefix;
                let prefixStatus = 'valid';
                let prefixOpts = null;
                if (!rawPrefix) {
                    prefixStatus = 'error';
                    prefixOpts = prefixes;
                } else {
                    const match = this.#findBestFuzzyMatch(rawPrefix, prefixes, 0.55);
                    if (match.isExact) {
                        prefixVal = match.match;
                        prefixStatus = 'valid';
                    } else if (match.match) {
                        prefixVal = match.match;
                        prefixStatus = 'healed';
                    } else {
                        prefixStatus = 'error';
                        prefixOpts = prefixes;
                    }
                }

                // 3. First Name & Last Name (ชื่อ และ นามสกุล)
                const firstName = String(row['ชื่อ'] || row['first_name'] || row['name'] || '').trim();
                const firstNameStatus = firstName ? 'valid' : 'error';

                const lastName = String(row['นามสกุล'] || row['last_name'] || row['surname'] || '').trim();
                const lastNameStatus = lastName ? 'valid' : 'error';

                // 4. Position Type (ประเภทตำแหน่ง)
                const rawPosType = String(row['ประเภทตำแหน่ง'] || row['ประเภท'] || row['position_type'] || '').trim();
                let posTypeVal = rawPosType;
                let posTypeStatus = 'valid';
                let posTypeOpts = null;
                if (!rawPosType) {
                    posTypeVal = validPosTypes[0] || 'ประเภททั่วไป';
                    posTypeStatus = 'healed';
                } else {
                    const match = this.#findBestFuzzyMatch(rawPosType, validPosTypes, 0.55);
                    if (match.isExact) {
                        posTypeVal = match.match;
                        posTypeStatus = 'valid';
                    } else if (match.match) {
                        posTypeVal = match.match;
                        posTypeStatus = 'healed';
                    } else {
                        posTypeStatus = 'error';
                        posTypeOpts = validPosTypes;
                    }
                }

                // 5. Position Title (ตำแหน่ง)
                const rawPosTitle = String(row['ตำแหน่ง'] || row['ตำแหน่งในสายงาน'] || row['position_title'] || row['position'] || '').trim();
                let posTitleVal = rawPosTitle;
                let posTitleStatus = 'valid';
                let posTitleOpts = null;
                if (!rawPosTitle) {
                    posTitleStatus = 'error';
                    posTitleOpts = posTitles;
                } else {
                    const match = this.#findBestFuzzyMatch(rawPosTitle, posTitles, 0.55);
                    if (match.isExact) {
                        posTitleVal = match.match;
                        posTitleStatus = 'valid';
                    } else if (match.match) {
                        posTitleVal = match.match;
                        posTitleStatus = 'healed';
                    } else {
                        posTitleStatus = 'error';
                        posTitleOpts = posTitles;
                    }
                }

                // 6. Position Level (ระดับ)
                const rawPosLevel = String(row['ระดับ'] || row['ระดับตำแหน่ง'] || row['position_level'] || row['level'] || '').trim();
                let posLevelVal = rawPosLevel;
                let posLevelStatus = 'valid';
                let posLevelOpts = null;
                if (!rawPosLevel) {
                    posLevelVal = 'ปฏิบัติงาน';
                    posLevelStatus = 'healed';
                } else {
                    const match = this.#findBestFuzzyMatch(rawPosLevel, posLevels, 0.55);
                    if (match.isExact) {
                        posLevelVal = match.match;
                        posLevelStatus = 'valid';
                    } else if (match.match) {
                        posLevelVal = match.match;
                        posLevelStatus = 'healed';
                    } else {
                        posLevelStatus = 'error';
                        posLevelOpts = posLevels;
                    }
                }

                // 7. Organization (หน่วยงาน)
                const rawOrg = String(row['หน่วยงาน'] || row['สังกัดใหญ่'] || row['organization'] || '').trim();
                let orgVal = rawOrg;
                let orgStatus = 'valid';
                if (!rawOrg) {
                    orgVal = validOrgs[0] || 'กรุงเทพมหานคร';
                    orgStatus = 'healed';
                } else {
                    const match = this.#findBestFuzzyMatch(rawOrg, validOrgs, 0.55);
                    if (match.isExact) {
                        orgVal = match.match;
                        orgStatus = 'valid';
                    } else if (match.match) {
                        orgVal = match.match;
                        orgStatus = 'healed';
                    } else {
                        orgVal = validOrgs[0] || 'กรุงเทพมหานคร';
                        orgStatus = 'healed';
                    }
                }

                // 8. Bureau (สำนักงาน/กอง)
                const rawBureau = String(row['สำนักงาน/กอง'] || row['สำนัก'] || row['กอง'] || row['bureau'] || '').trim();
                let bureauVal = rawBureau;
                let bureauStatus = 'valid';
                let bureauOpts = null;
                if (!rawBureau) {
                    bureauVal = this.currentUser.scope_bureau || 'สำนักเทศกิจ';
                    bureauStatus = 'healed';
                } else {
                    const match = this.#findBestFuzzyMatch(rawBureau, bureaus, 0.55);
                    if (match.isExact) {
                        bureauVal = match.match;
                        bureauStatus = 'valid';
                    } else if (match.match) {
                        bureauVal = match.match;
                        bureauStatus = 'healed';
                    } else {
                        bureauStatus = 'error';
                        bureauOpts = bureaus;
                    }
                }

                // 9. Division (ส่วน/ฝ่าย)
                const rawDivision = String(row['ส่วน/ฝ่าย'] || row['ฝ่าย'] || row['ส่วน'] || row['division'] || '').trim();
                let divisionVal = rawDivision;
                let divisionStatus = 'valid';
                let divisionOpts = null;
                if (!rawDivision) {
                    divisionVal = this.currentUser.scope_division || 'ฝ่ายบริหารงานทั่วไป';
                    divisionStatus = 'healed';
                } else {
                    const match = this.#findBestFuzzyMatch(rawDivision, divisions, 0.55);
                    if (match.isExact) {
                        divisionVal = match.match;
                        divisionStatus = 'valid';
                    } else if (match.match) {
                        divisionVal = match.match;
                        divisionStatus = 'healed';
                    } else {
                        divisionStatus = 'error';
                        divisionOpts = divisions;
                    }
                }

                // 10. Work Group (กลุ่มงาน)
                const rawWorkGroup = String(row['กลุ่มงาน'] || row['งาน'] || row['work_group'] || '').trim();
                const workGroupVal = (!rawWorkGroup || rawWorkGroup === 'ไม่มี') ? '-' : rawWorkGroup;
                const workGroupStatus = 'valid';

                // Row overall health
                const cells = {
                    national_id: { value: rawNid, status: nidStatus, msg: nidMsg },
                    prefix: { value: prefixVal, status: prefixStatus, ...(prefixOpts ? { availableOptions: prefixOpts, msg: 'กรุณาเลือกคำนำหน้าที่ถูกต้อง' } : {}) },
                    first_name: { value: firstName, status: firstNameStatus, ...(firstNameStatus === 'error' ? { msg: 'กรุณาระบุชื่อ' } : {}) },
                    last_name: { value: lastName, status: lastNameStatus, ...(lastNameStatus === 'error' ? { msg: 'กรุณาระบุนามสกุล' } : {}) },
                    position_type: { value: posTypeVal, status: posTypeStatus, ...(posTypeOpts ? { availableOptions: posTypeOpts, msg: 'กรุณาเลือกประเภทตำแหน่งที่ถูกต้อง' } : {}) },
                    position_title: { value: posTitleVal, status: posTitleStatus, ...(posTitleOpts ? { availableOptions: posTitleOpts, msg: 'กรุณาเลือกตำแหน่งที่ถูกต้อง' } : {}) },
                    position_level: { value: posLevelVal, status: posLevelStatus, ...(posLevelOpts ? { availableOptions: posLevelOpts, msg: 'กรุณาเลือกระดับที่ถูกต้อง' } : {}) },
                    organization: { value: orgVal, status: orgStatus },
                    bureau: { value: bureauVal, status: bureauStatus, ...(bureauOpts ? { availableOptions: bureauOpts, msg: 'กรุณาเลือกสำนักงาน/กองที่ถูกต้อง' } : {}) },
                    division: { value: divisionVal, status: divisionStatus, ...(divisionOpts ? { availableOptions: divisionOpts, msg: 'กรุณาเลือกส่วน/ฝ่ายที่ถูกต้อง' } : {}) },
                    work_group: { value: workGroupVal, status: workGroupStatus }
                };

                const hasError = Object.values(cells).some(c => c.status === 'error');
                const hasHealed = Object.values(cells).some(c => c.status === 'healed');
                const overallStatus = hasError ? 'error' : (hasHealed ? 'healed' : 'valid');

                parsedRows.push({
                    index: i + 1,
                    status: overallStatus,
                    cells
                });
            }

            this.bulkImportRows = parsedRows;
            this.#renderBulkImportPreview();

        } catch (err) {
            console.error('Process bulk import file error:', err);
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="14" class="text-center py-8 text-rose-500 font-bold">เกิดข้อผิดพลาดในการประมวลผลไฟล์: ${err.message}</td></tr>`;
            }
        }
    }

    #renderBulkImportPreview() {
        const tbody = document.getElementById('bulkImportPreviewTableBody');
        if (!tbody) return;

        let total = this.bulkImportRows.length;
        let validCount = 0;
        let healedCount = 0;
        let errorCount = 0;

        let html = '';
        this.bulkImportRows.forEach((row, rIdx) => {
            if (row.status === 'valid') validCount++;
            else if (row.status === 'healed') healedCount++;
            else if (row.status === 'error') errorCount++;

            const statusBadge = row.status === 'valid'
                ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">ถูกต้อง</span>`
                : (row.status === 'healed'
                    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">ปรับแก้</span>`
                    : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300">ผิดพลาด</span>`);

            const c = row.cells;

            const renderCell = (field, cell) => {
                if (cell.status === 'error' && Array.isArray(cell.availableOptions) && cell.availableOptions.length > 0) {
                    return `
                        <td class="p-1 cell-health-error" title="${cell.msg || ''}">
                            <select class="bma-select-inline-fix text-xs rounded-lg border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 py-1 px-1.5 bulk-inline-select cursor-pointer focus:ring-1 focus:ring-emerald-500 w-full" data-row-idx="${rIdx}" data-field="${field}">
                                <option value="" disabled selected>${cell.value ? `เลือกแทน "${cell.value}"` : '-- เลือกข้อมูลที่ถูกต้อง --'}</option>
                                ${cell.availableOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                            </select>
                        </td>
                    `;
                }
                return `<td class="p-2.5 cell-health-${cell.status}" contenteditable="true" data-field="${field}" title="${cell.msg || ''}">${cell.value || ''}</td>`;
            };

            html += `
                <tr data-row-idx="${rIdx}" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td class="p-2.5 text-center font-mono text-slate-400">${rIdx + 1}</td>
                    <td class="p-2.5 text-center">${statusBadge}</td>
                    <td class="p-2.5 font-mono cell-health-${c.national_id.status}" contenteditable="true" data-field="national_id" title="${c.national_id.msg || ''}">${c.national_id.value}</td>
                    ${renderCell('prefix', c.prefix)}
                    ${renderCell('first_name', c.first_name)}
                    ${renderCell('last_name', c.last_name)}
                    ${renderCell('position_type', c.position_type)}
                    ${renderCell('position_title', c.position_title)}
                    ${renderCell('position_level', c.position_level)}
                    ${renderCell('organization', c.organization)}
                    ${renderCell('bureau', c.bureau)}
                    ${renderCell('division', c.division)}
                    ${renderCell('work_group', c.work_group)}
                    <td class="p-2.5 text-center">
                        <button type="button" data-action="delete-preview-row" data-idx="${rIdx}" class="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors" title="ลบแถวนี้">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

        // Update KPIs
        document.getElementById('bulkImportKpiTotal').textContent = `${total} รายการ`;
        document.getElementById('bulkImportKpiValid').textContent = `${validCount} รายการ`;
        document.getElementById('bulkImportKpiHealed').textContent = `${healedCount} รายการ`;
        document.getElementById('bulkImportKpiErrors').textContent = `${errorCount} รายการ`;

        // Update Confirm button
        const confirmBtn = document.getElementById('btnConfirmBulkImport');
        if (confirmBtn) {
            confirmBtn.disabled = (validCount + healedCount === 0);
        }
    }

    #revalidateRow(rIdx) {
        const row = this.bulkImportRows[rIdx];
        if (!row) return;

        const c = row.cells;
        const rawNid = String(c.national_id.value || '').replace(/\D/g, '');
        c.national_id.value = rawNid;

        if (rawNid.length === 13 && UIHelpers.validateThaiNationalId(rawNid, false).valid) {
            c.national_id.status = 'valid';
            c.national_id.msg = '';
        } else {
            c.national_id.status = 'error';
            c.national_id.msg = 'เลขบัตร ปชช. ไม่ถูกต้อง (ต้องมี 13 หลักและคำนวณ Checksum ผ่าน)';
        }

        c.first_name.status = c.first_name.value.trim() ? 'valid' : 'error';
        c.last_name.status = c.last_name.value.trim() ? 'valid' : 'error';
        c.prefix.status = c.prefix.value.trim() ? (c.prefix.status === 'healed' ? 'healed' : 'valid') : 'error';
        c.position_type.status = c.position_type.value.trim() ? (c.position_type.status === 'healed' ? 'healed' : 'valid') : 'error';
        c.position_title.status = c.position_title.value.trim() ? (c.position_title.status === 'healed' ? 'healed' : 'valid') : 'error';
        c.position_level.status = c.position_level.value.trim() ? (c.position_level.status === 'healed' ? 'healed' : 'valid') : 'error';
        c.organization.status = c.organization.value.trim() ? 'valid' : 'error';
        c.bureau.status = c.bureau.value.trim() ? (c.bureau.status === 'healed' ? 'healed' : 'valid') : 'error';
        c.division.status = c.division.value.trim() ? (c.division.status === 'healed' ? 'healed' : 'valid') : 'error';
        c.work_group.status = 'valid';

        const hasError = Object.values(c).some(cell => cell.status === 'error');
        const hasHealed = Object.values(c).some(cell => cell.status === 'healed');
        row.status = hasError ? 'error' : (hasHealed ? 'healed' : 'valid');

        this.#renderBulkImportPreview();
    }

    async #handleExecuteBulkImport() {
        const importable = this.bulkImportRows.filter(r => r.status === 'valid' || r.status === 'healed');
        if (importable.length === 0) {
            await UIHelpers.alert('ไม่พบรายการที่ถูกต้อง', 'กรุณาแก้ไขข้อมูลที่ผิดพลาดให้ถูกต้องก่อนยืนยันการนำเข้า', 'warning');
            return;
        }

        const autoCreateAccounts = document.getElementById('chkAutoCreateAccountsBulk')?.checked ?? true;

        const confirmed = await UIHelpers.confirm(
            'ยืนยันการนำเข้าข้อมูลบุคลากร',
            `ระบบจะนำเข้าข้อมูลที่ผ่านการตรวจสอบจำนวน ${importable.length} รายการ (จากทั้งหมด ${this.bulkImportRows.length} รายการ)\n${autoCreateAccounts ? '• พร้อมสร้างบัญชีผู้ใช้อัตโนมัติ (Username: เลขบัตร 13 หลัก / Password: 6 ตัวท้าย)\n' : ''}ยืนยันการดำเนินการหรือไม่?`,
            'ยืนยันนำเข้าข้อมูล',
            'question'
        );
        if (!confirmed) return;

        this.isProcessingBulkImport = true;
        const confirmBtn = document.getElementById('btnConfirmBulkImport');
        const cancelBtn = document.getElementById('btnCancelBulkImport');
        if (confirmBtn) confirmBtn.disabled = true;
        if (cancelBtn) cancelBtn.disabled = true;

        const progressContainer = document.getElementById('bulkImportProgressContainer');
        const progressBar = document.getElementById('bulkImportProgressBar');
        const progressText = document.getElementById('bulkImportProgressText');
        progressContainer?.classList.remove('hidden');

        let successCount = 0;
        let accountCount = 0;
        const total = importable.length;
        const chunkSize = 5;

        for (let i = 0; i < total; i += chunkSize) {
            const chunk = importable.slice(i, i + chunkSize);

            for (const r of chunk) {
                const c = r.cells;
                const payload = {
                    national_id: c.national_id.value,
                    prefix: c.prefix.value,
                    first_name: c.first_name.value,
                    last_name: c.last_name.value,
                    position_type: c.position_type.value || 'ประเภททั่วไป',
                    position_title: c.position_title.value,
                    position_level: c.position_level.value,
                    organization: c.organization.value || 'กรุงเทพมหานคร',
                    bureau: c.bureau.value,
                    division: c.division.value,
                    work_group: (!c.work_group.value || c.work_group.value === '-') ? '' : c.work_group.value
                };

                const shouldAutoCreate = autoCreateAccounts && payload.national_id.length === 13;
                const res = await PersonnelModel.create(payload, shouldAutoCreate);
                if (res.success) {
                    successCount++;
                    if (res.accountCreated) accountCount++;
                }
            }

            const processed = Math.min(i + chunkSize, total);
            const percent = Math.round((processed / total) * 100);
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (progressText) progressText.textContent = `กำลังนำเข้าข้อมูล... ${percent}% (${processed}/${total} รายการ)`;

            await new Promise(resolve => setTimeout(resolve, 40));
        }

        this.isProcessingBulkImport = false;
        if (confirmBtn) confirmBtn.disabled = false;
        if (cancelBtn) cancelBtn.disabled = false;

        this.#closeBulkImportModal();
        await this.loadPersonnelData();

        await Swal.fire({
            icon: 'success',
            title: 'นำเข้าข้อมูลบุคลากรสำเร็จ!',
            html: `
                <div class="text-left text-sm space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mt-2 font-sans">
                    <p><b>บันทึกข้อมูลบุคลากรสำเร็จ:</b> <span class="text-emerald-600 font-bold">${successCount}</span> รายการ</p>
                    ${autoCreateAccounts ? `<p><b>สร้างบัญชีผู้ใช้งานอัตโนมัติ:</b> <span class="text-emerald-600 font-bold">${accountCount}</span> บัญชี</p>` : ''}
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">ข้อมูลได้รับการบันทึกและพร้อมใช้งานในระบบทันที</p>
                </div>
            `,
            confirmButtonColor: '#00744B',
            confirmButtonText: 'ตกลง'
        });
    }

    /**
     * ดาวน์โหลดไฟล์แม่แบบ Excel แบบหลายแผ่นงาน (3 แผ่นงาน: ตารางข้อมูลนำเข้า, โครงสร้างสังกัด, โครงสร้างตำแหน่ง)
     */
    #downloadMultiSheetTemplate() {
        // 1. แผ่นงานที่ 1: ตารางข้อมูลนำเข้า (พร้อมตัวอย่างข้อมูล 2 รายการตามมาตรฐาน 11 คอลัมน์)
        const templateRows = [
            {
                'เลขบัตรประชาชน': '1100400123456',
                'คำนำหน้า': 'นาย',
                'ชื่อ': 'สมชาย',
                'นามสกุล': 'ใจดี',
                'ประเภทตำแหน่ง': 'ประเภททั่วไป',
                'ตำแหน่ง': 'เจ้าพนักงานเทศกิจ',
                'ระดับ': 'ปฏิบัติงาน',
                'หน่วยงาน': 'กรุงเทพมหานคร',
                'สำนักงาน/กอง': 'สำนักเทศกิจ',
                'ส่วน/ฝ่าย': 'ฝ่ายบริหารงานทั่วไป',
                'กลุ่มงาน': 'งานสารบรรณ'
            },
            {
                'เลขบัตรประชาชน': '1100400789012',
                'คำนำหน้า': 'นางสาว',
                'ชื่อ': 'สมศรี',
                'นามสกุล': 'รักสงบ',
                'ประเภทตำแหน่ง': 'ประเภทวิชาการ',
                'ตำแหน่ง': 'นิติกร',
                'ระดับ': 'ปฏิบัติการ',
                'หน่วยงาน': 'กรุงเทพมหานคร',
                'สำนักงาน/กอง': 'สำนักเทศกิจ',
                'ส่วน/ฝ่าย': 'กองนิติการและบังคับคดี',
                'กลุ่มงาน': 'กลุ่มงานคดี'
            }
        ];
        const templateColWidths = [
            { wch: 18 }, // เลขบัตรประชาชน
            { wch: 12 }, // คำนำหน้า
            { wch: 16 }, // ชื่อ
            { wch: 16 }, // นามสกุล
            { wch: 16 }, // ประเภทตำแหน่ง
            { wch: 22 }, // ตำแหน่ง
            { wch: 14 }, // ระดับ
            { wch: 18 }, // หน่วยงาน
            { wch: 24 }, // สำนักงาน/กอง
            { wch: 24 }, // ส่วน/ฝ่าย
            { wch: 20 }  // กลุ่มงาน
        ];

        // 2. แผ่นงานที่ 2: โครงสร้างสังกัด (ดึงจาก Master Settings)
        const affiliations = this.settings.affiliations || [];
        const affiliationRows = affiliations.map(a => ({
            'หน่วยงาน': a.organization || 'กรุงเทพมหานคร',
            'สำนักงาน/กอง': a.bureau || '',
            'ส่วน/ฝ่าย': a.division || '',
            'กลุ่มงาน': a.group || '-'
        }));
        const affiliationColWidths = [
            { wch: 18 },
            { wch: 26 },
            { wch: 26 },
            { wch: 22 }
        ];

        // 3. แผ่นงานที่ 3: โครงสร้างตำแหน่ง (ดึงจาก Master Settings)
        const positions = this.settings.positions || [];
        const positionRows = positions.map(p => ({
            'ประเภทตำแหน่ง': p.type || '',
            'ตำแหน่ง': p.title || '',
            'ระดับ': p.level || ''
        }));
        const positionColWidths = [
            { wch: 18 },
            { wch: 24 },
            { wch: 16 }
        ];

        UIHelpers.exportMultiSheetExcel([
            { sheetName: 'ตารางข้อมูลนำเข้า', data: templateRows, colWidths: templateColWidths },
            { sheetName: 'โครงสร้างสังกัด', data: affiliationRows, colWidths: affiliationColWidths },
            { sheetName: 'โครงสร้างตำแหน่ง', data: positionRows, colWidths: positionColWidths }
        ], 'Template_นำเข้าข้อมูลบุคลากร_กทม');
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