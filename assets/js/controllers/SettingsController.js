/**
 * @file assets/js/controllers/SettingsController.js
 * @description คลาสควบคุมหน้าตั้งค่าระบบ (เรียงลำดับลูกศร ขึ้น/ลง และเพิ่มข้อมูลแม่-ลูกแบบหลายแถวพร้อมกัน)
 */

import { UIHelpers } from '../core/UIHelpers.js';
import { AppLayout } from '../components/AppLayout.js';
import { SettingsModel } from '../models/SettingsModel.js';

export class SettingsController {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.activeModalHandler = null;
        this.init();
    }

    async init() {
        const layout = await AppLayout.initAdminLayout({
            activePage: 'settings',
            pageTitle: 'ตั้งค่าระบบพื้นฐาน (สำหรับ SuperAdmin)',
            pageSubtitle: 'จัดเรียงลำดับข้อมูล (ขึ้น/ลง) และจัดการโครงสร้างตำแหน่ง/สังกัดแบบเชื่อมโยงแม่-ลูก'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;

        UIHelpers.showLoading('กำลังโหลดข้อมูลตั้งค่าระบบ...');
        try {
            this.settings = await SettingsModel.getSettings(true);
            this.#renderAllSettings();
            this.#bindEvents();
        } finally {
            UIHelpers.hideLoading();
        }
    }

    #renderAllSettings() {
        document.getElementById('setOrgName').value = this.settings.organization_name || '';
        document.getElementById('setBureauName').value = this.settings.bureau_name || '';
        document.getElementById('setLogoUrlInput').value = this.settings.logo_url || '';
        document.getElementById('toggleRequirePhoto').checked = Boolean(this.settings.require_photo);
        document.getElementById('toggleRequireGps').checked = Boolean(this.settings.require_gps);

        const isSingleClick = Boolean(this.settings.single_click_checkin);
        this.#syncCheckinModeUI(isSingleClick);

        this.#updateLogoPreview(this.settings.logo_url);
        this.#renderPrefixes();
        this.#renderRemarks();
        this.#renderShifts();
        this.#renderPositions();
        this.#renderAffiliations();
    }

    #syncCheckinModeUI(isSingleClick) {
        const toggleChk = document.getElementById('toggleSingleClickCheckin');
        const badgeEl = document.getElementById('checkinModeStatusBadge');
        const radioNormal = document.querySelector('input[name="checkinRecordingMode"][value="normal"]');
        const radioSingle = document.querySelector('input[name="checkinRecordingMode"][value="single_click"]');
        const cardNormal = document.getElementById('cardModeNormal');
        const cardSingle = document.getElementById('cardModeSingleClick');

        if (toggleChk) toggleChk.checked = isSingleClick;
        if (radioNormal) radioNormal.checked = !isSingleClick;
        if (radioSingle) radioSingle.checked = isSingleClick;

        if (badgeEl) {
            if (isSingleClick) {
                badgeEl.textContent = 'รูปแบบพิเศษ (กดครั้งเดียวเข้า-ออก)';
                badgeEl.className = 'bma-badge bma-badge-indigo';
            } else {
                badgeEl.textContent = 'รูปแบบปกติ (เข้า-ออกตามปกติ)';
                badgeEl.className = 'bma-badge bma-badge-success';
            }
        }

        if (cardNormal && cardSingle) {
            if (isSingleClick) {
                cardSingle.style.borderColor = 'var(--g1)';
                cardNormal.style.borderColor = 'var(--bma-border)';
            } else {
                cardNormal.style.borderColor = 'var(--g1)';
                cardSingle.style.borderColor = 'var(--bma-border)';
            }
        }
    }

    #updateLogoPreview(url) {
        const box = document.getElementById('setLogoPreviewBox');
        if (!box) return;
        if (url) {
            box.innerHTML = `<img src="${url}" alt="Logo Preview" class="w-full h-full object-contain rounded-xl">`;
        } else {
            box.innerHTML = `<i class="fa-solid fa-image text-2xl text-slate-400"></i>`;
        }
    }

    /**
     * สร้างปุ่มลูกศร ขึ้น / ลง สำหรับเรียงลำดับข้อมูล
     */
    #buildSortButtonsHtml(category, index, totalLength) {
        const disableUp = index === 0 ? 'disabled' : '';
        const disableDown = index === totalLength - 1 ? 'disabled' : '';
        return `
            <div class="inline-flex items-center gap-1">
                <button type="button" class="btn-sort-arrow" data-action="move-item" data-category="${category}" data-index="${index}" data-dir="up" ${disableUp} title="เลื่อนขึ้น">
                    <i class="fa-solid fa-arrow-up"></i>
                </button>
                <button type="button" class="btn-sort-arrow" data-action="move-item" data-category="${category}" data-index="${index}" data-dir="down" ${disableDown} title="เลื่อนลง">
                    <i class="fa-solid fa-arrow-down"></i>
                </button>
            </div>
        `;
    }

    #renderPrefixes() {
        const container = document.getElementById('prefixListContainer');
        if (!container) return;
        const prefixes = this.settings.prefixes || [];
        container.innerHTML = prefixes.map((prefix, idx) => `
            <div class="flex items-center justify-between p-2.5 rounded-xl border bma-border text-sm">
                <div class="flex items-center gap-2.5">
                    ${this.#buildSortButtonsHtml('prefixes', idx, prefixes.length)}
                    <span class="font-bold bma-text-main">${idx + 1}. ${prefix}</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <button type="button" data-action="edit-prefix" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" data-action="delete-prefix" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    #renderRemarks() {
        const container = document.getElementById('remarkListContainer');
        if (!container) return;
        const remarks = this.settings.remarks || [];
        container.innerHTML = remarks.map((remark, idx) => `
            <div class="flex items-center justify-between p-2.5 rounded-xl border bma-border text-sm">
                <div class="flex items-center gap-2.5">
                    ${this.#buildSortButtonsHtml('remarks', idx, remarks.length)}
                    <span class="font-semibold bma-text-main">${idx + 1}. ${remark}</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <button type="button" data-action="edit-remark" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" data-action="delete-remark" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    #renderShifts() {
        const tbody = document.getElementById('shiftsTableBody');
        if (!tbody) return;
        const shifts = this.settings.work_shifts || [];
        tbody.innerHTML = shifts.map((shift, idx) => `
            <tr>
                <td class="text-center font-semibold">${idx + 1}</td>
                <td class="text-center">${this.#buildSortButtonsHtml('work_shifts', idx, shifts.length)}</td>
                <td class="font-bold bma-text-main">${shift.name}</td>
                <td class="font-mono">${shift.is_custom ? 'ผู้ใช้ระบุเอง' : (shift.check_in || '-')}</td>
                <td class="font-mono">${shift.is_custom ? 'ผู้ใช้ระบุเอง' : (shift.check_out || '-')}</td>
                <td>
                    <span class="bma-badge ${shift.is_custom ? 'bma-badge-indigo' : 'bma-badge-success'}">
                        ${shift.is_custom ? 'กำหนดเวลาเอง (อื่นๆ)' : 'เวลามาตรฐาน'}
                    </span>
                </td>
                <td class="text-center space-x-1 whitespace-nowrap">
                    <button type="button" data-action="edit-shift" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" data-action="delete-shift" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    #renderPositions() {
        const tbody = document.getElementById('positionsTableBody');
        if (!tbody) return;
        const positions = this.settings.positions || [];
        tbody.innerHTML = positions.map((pos, idx) => `
            <tr>
                <td class="text-center font-semibold">${idx + 1}</td>
                <td class="text-center">${this.#buildSortButtonsHtml('positions', idx, positions.length)}</td>
                <td><span class="bma-badge bma-badge-sky">${pos.type || '-'}</span></td>
                <td class="font-bold bma-text-main">${pos.title || '<span class="bma-text-muted text-xs italic">(ยังไม่ได้เพิ่มตำแหน่งลูก)</span>'}</td>
                <td>${pos.level ? `<span class="bma-badge bma-badge-success">${pos.level}</span>` : '<span class="bma-text-muted text-xs italic">(ยังไม่ได้เพิ่มระดับลูก)</span>'}</td>
                <td class="text-center space-x-1 whitespace-nowrap">
                    <button type="button" data-action="edit-position" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500" title="แก้ไขแถวนี้">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" data-action="delete-position" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500" title="ลบแถวนี้">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    #renderAffiliations() {
        const tbody = document.getElementById('affiliationsTableBody');
        if (!tbody) return;
        const affiliations = this.settings.affiliations || [];
        tbody.innerHTML = affiliations.map((aff, idx) => `
            <tr>
                <td class="text-center font-semibold">${idx + 1}</td>
                <td class="text-center">${this.#buildSortButtonsHtml('affiliations', idx, affiliations.length)}</td>
                <td class="font-semibold">${aff.organization || '-'}</td>
                <td class="font-bold" style="color: var(--bma-primary);">${aff.bureau || '<span class="bma-text-muted text-xs italic">(รอกำหนดสำนักงาน/กอง)</span>'}</td>
                <td class="font-semibold bma-text-main">${aff.division || '<span class="bma-text-muted text-xs italic">(รอกำหนดส่วน/ฝ่าย)</span>'}</td>
                <td>${aff.group || '<span class="bma-text-muted text-xs italic">(รอกำหนดกลุ่มงาน)</span>'}</td>
                <td class="text-center space-x-1 whitespace-nowrap">
                    <button type="button" data-action="edit-affiliation" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500" title="แก้ไขแถวนี้">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" data-action="delete-affiliation" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500" title="ลบแถวนี้">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async #persistSettings(showAlert = true) {
        UIHelpers.showLoading('กำลังบันทึกการตั้งค่าระบบ...');
        try {
            const res = await SettingsModel.updateSettings(this.settings);
            UIHelpers.hideLoading();
            if (!res.success) {
                await UIHelpers.alert('บันทึกไม่สำเร็จ', res.message, 'error');
                return false;
            }
            this.#renderAllSettings();
            if (showAlert) {
                await UIHelpers.alert('บันทึกสำเร็จ', res.message, 'success');
            }
            return true;
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
            return false;
        }
    }

    #openModal(title, bodyHtml, onSubmitCallback) {
        document.getElementById('modalSettingsTitle').textContent = title;
        document.getElementById('modalSettingsBody').innerHTML = bodyHtml;
        this.activeModalHandler = onSubmitCallback;
        document.getElementById('modalSettingsItem').classList.remove('hidden');
    }

    #closeModal() {
        document.getElementById('modalSettingsItem').classList.add('hidden');
        this.activeModalHandler = null;
    }

    /**
     * สร้าง HTML กล่องกรอกข้อมูลแบบกด "+ เพิ่มแถวรายการ" เพื่อบันทึกได้หลายค่าพร้อมกันในครั้งเดียว
     * @param {string} fieldLabel ป้ายกำกับช่องกรอกข้อมูล
     * @param {string} placeholder ข้อความตัวอย่าง
     */
    #buildMultiRowInputsHtml(fieldLabel, placeholder) {
        return `
            <div class="space-y-2.5">
                <div class="flex items-center justify-between">
                    <label class="text-xs font-extrabold bma-text-main">${fieldLabel} (เพิ่มได้หลายรายการพร้อมกัน) *</label>
                    <button type="button" id="btnAddDynamicRow" class="btn-bma-soft text-xs py-1 px-2.5">
                        <i class="fa-solid fa-plus"></i> เพิ่มแถวรายการ
                    </button>
                </div>
                <div id="dynamicMultiRowsContainer" class="space-y-2">
                    <div class="flex items-center gap-2 dynamic-row-item">
                        <input type="text" class="bma-input text-sm dynamic-row-input" placeholder="${placeholder}" required>
                        <button type="button" class="btn-remove-dynamic-row btn-bma-outline py-2 px-2.5 text-rose-500 text-xs" title="ลบแถวนี้">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * ผูกเหตุการณ์ปุ่ม "+ เพิ่มแถวรายการ" และปุ่มลบแถวภายใน Modal
     */
    #bindDynamicMultiRowEvents(placeholder = 'ระบุข้อมูล...') {
        const btnAdd = document.getElementById('btnAddDynamicRow');
        const container = document.getElementById('dynamicMultiRowsContainer');
        if (!btnAdd || !container) return;

        btnAdd.addEventListener('click', () => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'flex items-center gap-2 dynamic-row-item';
            rowDiv.innerHTML = `
                <input type="text" class="bma-input text-sm dynamic-row-input" placeholder="${placeholder}" required>
                <button type="button" class="btn-remove-dynamic-row btn-bma-outline py-2 px-2.5 text-rose-500 text-xs" title="ลบแถวนี้">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            container.appendChild(rowDiv);
            rowDiv.querySelector('input')?.focus();
        });

        container.addEventListener('click', (e) => {
            const rmBtn = e.target.closest('.btn-remove-dynamic-row');
            if (!rmBtn) return;
            const allRows = container.querySelectorAll('.dynamic-row-item');
            if (allRows.length <= 1) {
                allRows[0].querySelector('input').value = '';
                return;
            }
            rmBtn.closest('.dynamic-row-item')?.remove();
        });
    }

    /**
     * ดึงค่าทั้งหมดจากช่องกรอกหลายแถวใน Modal (กรองค่าว่างออก)
     * @returns {Array<string>}
     */
    #getDynamicMultiRowValues() {
        const inputs = document.querySelectorAll('#dynamicMultiRowsContainer .dynamic-row-input');
        return Array.from(inputs)
            .map(inp => inp.value.trim())
            .filter(Boolean);
    }

    #bindEvents() {
        // อัปโหลดไฟล์โลโก้เป็น Base64 Preview
        document.getElementById('setLogoFileInput')?.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const dataUrl = await SettingsModel.fileToDataUrl(file);
            document.getElementById('setLogoUrlInput').value = dataUrl;
            this.#updateLogoPreview(dataUrl);
        });

        document.getElementById('setLogoUrlInput')?.addEventListener('input', (e) => {
            this.#updateLogoPreview(e.target.value.trim());
        });

        document.getElementById('btnClearLogo')?.addEventListener('click', () => {
            document.getElementById('setLogoUrlInput').value = '';
            document.getElementById('setLogoFileInput').value = '';
            this.#updateLogoPreview('');
        });

        // สลับรูปแบบการบันทึกเวลา (Checkbox <-> Radio Cards)
        document.getElementById('toggleSingleClickCheckin')?.addEventListener('change', (e) => {
            this.#syncCheckinModeUI(e.target.checked);
        });

        document.querySelectorAll('input[name="checkinRecordingMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.#syncCheckinModeUI(e.target.value === 'single_click');
            });
        });

        // บันทึกการตั้งค่าหลักทั้งหมด
        document.getElementById('btnSaveMainSettings')?.addEventListener('click', async () => {
            this.settings.organization_name = document.getElementById('setOrgName').value.trim() || 'กรุงเทพมหานคร';
            this.settings.bureau_name = document.getElementById('setBureauName').value.trim() || 'สำนักเทศกิจ';
            this.settings.logo_url = document.getElementById('setLogoUrlInput').value.trim();
            this.settings.require_photo = document.getElementById('toggleRequirePhoto').checked;
            this.settings.require_gps = document.getElementById('toggleRequireGps').checked;
            this.settings.single_click_checkin = document.getElementById('toggleSingleClickCheckin').checked;
            await this.#persistSettings(true);
        });

        // ปิด Modal
        document.getElementById('btnCloseSettingsModal')?.addEventListener('click', () => this.#closeModal());
        document.getElementById('btnCancelSettingsModal')?.addEventListener('click', () => this.#closeModal());

        document.getElementById('formSettingsItem')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (typeof this.activeModalHandler === 'function') {
                await this.activeModalHandler();
                this.#closeModal();
            }
        });

        // ปุ่มเพิ่มคำนำหน้าชื่อ (รองรับการเพิ่มหลายแถวพร้อมกัน)
        document.getElementById('btnAddPrefix')?.addEventListener('click', () => {
            this.#openModal(
                'เพิ่มคำนำหน้าชื่อ',
                this.#buildMultiRowInputsHtml('คำนำหน้าชื่อ', 'เช่น นาย, นาง, นางสาว, ว่าที่ร้อยตรี'),
                async () => {
                    const values = this.#getDynamicMultiRowValues();
                    if (values.length > 0) {
                        this.settings.prefixes.push(...values);
                        await this.#persistSettings(true);
                    }
                }
            );
            this.#bindDynamicMultiRowEvents('เช่น นาย, นาง, นางสาว');
        });

        // ปุ่มเพิ่มหมายเหตุ (รองรับการเพิ่มหลายแถวพร้อมกัน)
        document.getElementById('btnAddRemark')?.addEventListener('click', () => {
            this.#openModal(
                'เพิ่มตัวเลือกหมายเหตุ',
                this.#buildMultiRowInputsHtml('ข้อความหมายเหตุ', 'เช่น ปฏิบัติราชการนอกสถานที่'),
                async () => {
                    const values = this.#getDynamicMultiRowValues();
                    if (values.length > 0) {
                        this.settings.remarks.push(...values);
                        await this.#persistSettings(true);
                    }
                }
            );
            this.#bindDynamicMultiRowEvents('เช่น ปฏิบัติราชการนอกสถานที่');
        });

        // ปุ่มเพิ่มช่วงเวลาปฏิบัติราชการ
        document.getElementById('btnAddShift')?.addEventListener('click', () => {
            this.#openShiftModal();
        });

        // ====================================================================
        // ปุ่มเพิ่มข้อมูลตำแหน่งแบบแยกส่วน 3 ระดับ (ประเภทตำแหน่ง > ตำแหน่ง > ระดับ)
        // ====================================================================
        document.getElementById('btnAddPosStep1Type')?.addEventListener('click', () => {
            this.#openAddPositionStep1Modal();
        });
        document.getElementById('btnAddPosStep2Title')?.addEventListener('click', () => {
            this.#openAddPositionStep2Modal();
        });
        document.getElementById('btnAddPosStep3Level')?.addEventListener('click', () => {
            this.#openAddPositionStep3Modal();
        });

        // ====================================================================
        // ปุ่มเพิ่มโครงสร้างสังกัดแบบแยกส่วน 4 ระดับ (หน่วยงาน > สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน)
        // ====================================================================
        document.getElementById('btnAddAffStep1Org')?.addEventListener('click', () => {
            this.#openAddAffiliationStep1OrgModal();
        });
        document.getElementById('btnAddAffStep2Bureau')?.addEventListener('click', () => {
            this.#openAddAffiliationStep2BureauModal();
        });
        document.getElementById('btnAddAffStep3Division')?.addEventListener('click', () => {
            this.#openAddAffiliationStep3DivisionModal();
        });
        document.getElementById('btnAddAffStep4Group')?.addEventListener('click', () => {
            this.#openAddAffiliationStep4GroupModal();
        });

        // Event Delegation สำหรับปุ่มลูกศรเรียงลำดับ (ขึ้น/ลง) และปุ่มแก้ไข/ลบในหน้าตั้งค่าระบบ
        document.querySelector('main')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const idx = parseInt(btn.dataset.index, 10);

            // 1. การกดปุ่มลูกศร ขึ้น / ลง เพื่อเรียงลำดับ
            if (action === 'move-item') {
                const category = btn.dataset.category;
                const dir = btn.dataset.dir;
                const targetArray = this.settings[category];
                if (SettingsModel.moveItemInArray(targetArray, idx, dir)) {
                    await this.#persistSettings(false);
                }
                return;
            }

            // 2. แก้ไข / ลบ คำนำหน้าชื่อ
            if (action === 'edit-prefix') {
                const currentVal = this.settings.prefixes[idx];
                this.#openModal('แก้ไขคำนำหน้าชื่อ', `
                    <div>
                        <label class="block text-xs font-bold bma-text-main mb-1">คำนำหน้าชื่อ *</label>
                        <input type="text" id="modalInputPrefix" class="bma-input" value="${currentVal}" required>
                    </div>
                `, async () => {
                    this.settings.prefixes[idx] = document.getElementById('modalInputPrefix').value.trim();
                    await this.#persistSettings(true);
                });
            } else if (action === 'delete-prefix') {
                if (await UIHelpers.confirm('ยืนยันการลบคำนำหน้า', `ต้องการลบ "${this.settings.prefixes[idx]}" ใช่หรือไม่?`, 'ลบรายการ')) {
                    this.settings.prefixes.splice(idx, 1);
                    await this.#persistSettings(true);
                }
            }
            // 3. แก้ไข / ลบ หมายเหตุ
            else if (action === 'edit-remark') {
                const currentVal = this.settings.remarks[idx];
                this.#openModal('แก้ไขหมายเหตุ', `
                    <div>
                        <label class="block text-xs font-bold bma-text-main mb-1">ข้อความหมายเหตุ *</label>
                        <input type="text" id="modalInputRemark" class="bma-input" value="${currentVal}" required>
                    </div>
                `, async () => {
                    this.settings.remarks[idx] = document.getElementById('modalInputRemark').value.trim();
                    await this.#persistSettings(true);
                });
            } else if (action === 'delete-remark') {
                if (await UIHelpers.confirm('ยืนยันการลบหมายเหตุ', `ต้องการลบ "${this.settings.remarks[idx]}" ใช่หรือไม่?`, 'ลบรายการ')) {
                    this.settings.remarks.splice(idx, 1);
                    await this.#persistSettings(true);
                }
            }
            // 4. แก้ไข / ลบ ช่วงเวลาปฏิบัติราชการ
            else if (action === 'edit-shift') {
                this.#openShiftModal(idx);
            } else if (action === 'delete-shift') {
                if (await UIHelpers.confirm('ยืนยันการลบช่วงเวลา', `ต้องการลบ "${this.settings.work_shifts[idx].name}" ใช่หรือไม่?`, 'ลบรายการ')) {
                    this.settings.work_shifts.splice(idx, 1);
                    await this.#persistSettings(true);
                }
            }
            // 5. แก้ไข / ลบ ตำแหน่ง
            else if (action === 'edit-position') {
                this.#openEditSinglePositionModal(idx);
            } else if (action === 'delete-position') {
                const pos = this.settings.positions[idx];
                if (await UIHelpers.confirm('ยืนยันการลบรายการตำแหน่ง', `ต้องการลบ "${pos.type} > ${pos.title || '-'} > ${pos.level || '-'}" ใช่หรือไม่?`, 'ลบรายการ')) {
                    this.settings.positions.splice(idx, 1);
                    await this.#persistSettings(true);
                }
            }
            // 6. แก้ไข / ลบ สังกัด
            else if (action === 'edit-affiliation') {
                this.#openEditSingleAffiliationModal(idx);
            } else if (action === 'delete-affiliation') {
                const aff = this.settings.affiliations[idx];
                if (await UIHelpers.confirm('ยืนยันการลบรายการสังกัด', `ต้องการลบ "${aff.bureau || aff.organization} > ${aff.division || '-'} > ${aff.group || '-'}" ใช่หรือไม่?`, 'ลบรายการ')) {
                    this.settings.affiliations.splice(idx, 1);
                    await this.#persistSettings(true);
                }
            }
        });
    }

    // ========================================================================
    // ส่วนจัดการ Modal ข้อมูลตำแหน่งแบบแยกส่วนเชื่อมโยงแม่-ลูก (3 ระดับ)
    // ========================================================================

    /**
     * ระดับที่ 1: เพิ่มประเภทตำแหน่ง (ค่าหลักแม่ระดับบนสุด) รองรับการเพิ่มหลายแถวพร้อมกัน
     */
    #openAddPositionStep1Modal() {
        this.#openModal(
            '1. เพิ่มประเภทตำแหน่ง (เพิ่มได้หลายรายการ)',
            this.#buildMultiRowInputsHtml('ชื่อประเภทตำแหน่ง', 'เช่น ประเภททั่วไป, ประเภทวิชาการ, ประเภทอำนวยการ'),
            async () => {
                const types = this.#getDynamicMultiRowValues();
                for (const t of types) {
                    const exists = this.settings.positions.some(p => p.type === t);
                    if (!exists) {
                        this.settings.positions.push({ type: t, title: '', level: '' });
                    }
                }
                await this.#persistSettings(true);
            }
        );
        this.#bindDynamicMultiRowEvents('เช่น ประเภททั่วไป, ประเภทวิชาการ');
    }

    /**
     * ระดับที่ 2: เลือก "ประเภทตำแหน่ง (แม่)" แล้วเพิ่ม "ชื่อตำแหน่งในสายงาน (ลูก)" ได้หลายแถวพร้อมกัน
     */
    #openAddPositionStep2Modal() {
        const types = SettingsModel.getUniquePositionTypes(this.settings);
        if (types.length === 0) {
            UIHelpers.alert('ยังไม่มีประเภทตำแหน่ง', 'กรุณากดปุ่ม "1. + เพิ่มประเภทตำแหน่ง" ก่อน', 'warning');
            return;
        }

        const bodyHtml = `
            <div class="p-3.5 rounded-xl bma-info-box space-y-2">
                <label class="block text-xs font-extrabold bma-text-main">1. เลือกประเภทตำแหน่ง (ค่าหลักแม่) *</label>
                <select id="modalParentPosType" class="bma-select text-sm font-semibold" required>
                    ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
            </div>
            ${this.#buildMultiRowInputsHtml('2. ชื่อตำแหน่งในสายงาน (ค่าลูก)', 'เช่น เจ้าพนักงานเทศกิจ, นักจัดการงานเทศกิจ')}
        `;

        this.#openModal('2. เพิ่มตำแหน่งในสายงาน (เชื่อมโยงประเภทตำแหน่ง)', bodyHtml, async () => {
            const parentType = document.getElementById('modalParentPosType').value;
            const childTitles = this.#getDynamicMultiRowValues();
            if (!parentType || childTitles.length === 0) return;

            for (const title of childTitles) {
                // ตรวจสอบว่ามีแถวโครงร่างว่างของประเภทตำแหน่งแม่อยู่หรือไม่
                const emptyIdx = this.settings.positions.findIndex(p => p.type === parentType && !p.title);
                if (emptyIdx !== -1) {
                    this.settings.positions[emptyIdx].title = title;
                } else {
                    // แทรกต่อท้ายกลุ่มของประเภทตำแหน่งแม่
                    let lastTypeIdx = -1;
                    this.settings.positions.forEach((p, idx) => {
                        if (p.type === parentType) lastTypeIdx = idx;
                    });
                    const newObj = { type: parentType, title, level: '' };
                    if (lastTypeIdx !== -1) {
                        this.settings.positions.splice(lastTypeIdx + 1, 0, newObj);
                    } else {
                        this.settings.positions.push(newObj);
                    }
                }
            }
            await this.#persistSettings(true);
        });

        this.#bindDynamicMultiRowEvents('ระบุชื่อตำแหน่งในสายงาน...');
    }

    /**
     * ระดับที่ 3: เลือก "ประเภทตำแหน่ง (แม่)" > เลือก "ตำแหน่งในสายงาน (แม่)" แล้วเพิ่ม "ระดับตำแหน่ง (ลูก)" ได้หลายแถวพร้อมกัน
     */
    #openAddPositionStep3Modal() {
        const types = SettingsModel.getUniquePositionTypes(this.settings);
        if (types.length === 0) {
            UIHelpers.alert('ยังไม่มีข้อมูลตำแหน่ง', 'กรุณาเพิ่มประเภทตำแหน่งและชื่อตำแหน่งก่อน', 'warning');
            return;
        }

        const initialTitles = SettingsModel.getUniquePositionTitles(this.settings, types[0]);

        const bodyHtml = `
            <div class="p-3.5 rounded-xl bma-info-box space-y-3">
                <div>
                    <label class="block text-xs font-extrabold bma-text-main mb-1">1. เลือกประเภทตำแหน่ง (ค่าหลักแม่) *</label>
                    <select id="modalStep3PosType" class="bma-select text-sm font-semibold" required>
                        ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-extrabold bma-text-main mb-1">2. เลือกชื่อตำแหน่งในสายงาน (ค่าแม่) *</label>
                    <select id="modalStep3PosTitle" class="bma-select text-sm font-semibold" required>
                        ${initialTitles.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                </div>
            </div>
            ${this.#buildMultiRowInputsHtml('3. ระดับตำแหน่ง (ค่าลูก)', 'เช่น ปฏิบัติงาน, ชำนาญงาน, อาวุโส')}
        `;

        this.#openModal('3. เพิ่มระดับตำแหน่ง (เชื่อมโยงประเภทและชื่อตำแหน่ง)', bodyHtml, async () => {
            const parentType = document.getElementById('modalStep3PosType').value;
            const parentTitle = document.getElementById('modalStep3PosTitle').value;
            const childLevels = this.#getDynamicMultiRowValues();

            if (!parentType || !parentTitle) {
                await UIHelpers.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกประเภทตำแหน่งและชื่อตำแหน่งแม่ให้ครบถ้วน', 'warning');
                return;
            }

            for (const level of childLevels) {
                const emptyIdx = this.settings.positions.findIndex(
                    p => p.type === parentType && p.title === parentTitle && !p.level
                );
                if (emptyIdx !== -1) {
                    this.settings.positions[emptyIdx].level = level;
                } else {
                    let lastTitleIdx = -1;
                    this.settings.positions.forEach((p, idx) => {
                        if (p.type === parentType && p.title === parentTitle) lastTitleIdx = idx;
                    });
                    const newObj = { type: parentType, title: parentTitle, level };
                    if (lastTitleIdx !== -1) {
                        this.settings.positions.splice(lastTitleIdx + 1, 0, newObj);
                    } else {
                        this.settings.positions.push(newObj);
                    }
                }
            }
            await this.#persistSettings(true);
        });

        // ผูก Cascading Dropdown ภายใน Modal ระดับที่ 3
        document.getElementById('modalStep3PosType')?.addEventListener('change', (e) => {
            const titles = SettingsModel.getUniquePositionTitles(this.settings, e.target.value);
            document.getElementById('modalStep3PosTitle').innerHTML = titles.length > 0
                ? titles.map(t => `<option value="${t}">${t}</option>`).join('')
                : `<option value="">-- ยังไม่มีตำแหน่งในประเภทนี้ --</option>`;
        });

        this.#bindDynamicMultiRowEvents('เช่น ปฏิบัติงาน, ชำนาญงาน, ปฏิบัติการ, ชำนาญการ');
    }

    /**
     * แก้ไขแถวตำแหน่งรายบรรทัด
     */
    #openEditSinglePositionModal(editIndex) {
        const item = this.settings.positions[editIndex];
        this.#openModal('แก้ไขรายการตำแหน่ง', `
            <div>
                <label class="block text-xs font-bold bma-text-main mb-1">1. ประเภทตำแหน่ง *</label>
                <input type="text" id="mPosType" class="bma-input" value="${item.type || ''}" required>
            </div>
            <div>
                <label class="block text-xs font-bold bma-text-main mb-1">2. ชื่อตำแหน่งในสายงาน</label>
                <input type="text" id="mPosTitle" class="bma-input" value="${item.title || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold bma-text-main mb-1">3. ระดับตำแหน่ง</label>
                <input type="text" id="mPosLevel" class="bma-input" value="${item.level || ''}">
            </div>
        `, async () => {
            this.settings.positions[editIndex] = {
                type: document.getElementById('mPosType').value.trim(),
                title: document.getElementById('mPosTitle').value.trim(),
                level: document.getElementById('mPosLevel').value.trim()
            };
            await this.#persistSettings(true);
        });
    }

    // ========================================================================
    // ส่วนจัดการ Modal โครงสร้างสังกัดแบบแยกส่วนเชื่อมโยงแม่-ลูก (4 ระดับ)
    // (หน่วยงาน > สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน)
    // ========================================================================

    /**
     * ระดับที่ 1: เพิ่มหน่วยงาน (ค่าหลักแม่ระดับบนสุด) รองรับการเพิ่มหลายแถวพร้อมกัน
     */
    #openAddAffiliationStep1OrgModal() {
        this.#openModal(
            '1. เพิ่มหน่วยงานหลัก (เพิ่มได้หลายรายการ)',
            this.#buildMultiRowInputsHtml('ชื่อหน่วยงานหลัก', 'เช่น กรุงเทพมหานคร'),
            async () => {
                const orgs = this.#getDynamicMultiRowValues();
                for (const org of orgs) {
                    const exists = this.settings.affiliations.some(a => a.organization === org);
                    if (!exists) {
                        this.settings.affiliations.push({ organization: org, bureau: '', division: '', group: '' });
                    }
                }
                await this.#persistSettings(true);
            }
        );
        this.#bindDynamicMultiRowEvents('เช่น กรุงเทพมหานคร');
    }

    /**
     * ระดับที่ 2: เลือก "หน่วยงาน (แม่)" แล้วเพิ่ม "สำนักงาน/กอง (ลูก)" ได้หลายแถวพร้อมกัน
     */
    #openAddAffiliationStep2BureauModal() {
        const orgs = SettingsModel.getUniqueOrganizations(this.settings);
        const bodyHtml = `
            <div class="p-3.5 rounded-xl bma-info-box space-y-2">
                <label class="block text-xs font-extrabold bma-text-main">1. เลือกหน่วยงานหลัก (ค่าแม่) *</label>
                <select id="modalAffParentOrg" class="bma-select text-sm font-semibold" required>
                    ${orgs.map(o => `<option value="${o}">${o}</option>`).join('')}
                </select>
            </div>
            ${this.#buildMultiRowInputsHtml('2. ชื่อสำนักงาน/กอง (ค่าลูก)', 'เช่น สำนักเทศกิจ')}
        `;

        this.#openModal('2. เพิ่มสำนักงาน/กอง (เชื่อมโยงหน่วยงานหลัก)', bodyHtml, async () => {
            const parentOrg = document.getElementById('modalAffParentOrg').value;
            const bureaus = this.#getDynamicMultiRowValues();
            if (!parentOrg || bureaus.length === 0) return;

            for (const bureau of bureaus) {
                const emptyIdx = this.settings.affiliations.findIndex(a => a.organization === parentOrg && !a.bureau);
                if (emptyIdx !== -1) {
                    this.settings.affiliations[emptyIdx].bureau = bureau;
                } else {
                    let lastOrgIdx = -1;
                    this.settings.affiliations.forEach((a, idx) => {
                        if (a.organization === parentOrg) lastOrgIdx = idx;
                    });
                    const newObj = { organization: parentOrg, bureau, division: '', group: '' };
                    if (lastOrgIdx !== -1) {
                        this.settings.affiliations.splice(lastOrgIdx + 1, 0, newObj);
                    } else {
                        this.settings.affiliations.push(newObj);
                    }
                }
            }
            await this.#persistSettings(true);
        });

        this.#bindDynamicMultiRowEvents('ระบุชื่อสำนักงาน/กอง...');
    }

    /**
     * ระดับที่ 3: เลือก "หน่วยงาน" > เลือก "สำนักงาน/กอง (แม่)" แล้วเพิ่ม "ส่วน/ฝ่าย (ลูก)" ได้หลายแถวพร้อมกัน
     */
    #openAddAffiliationStep3DivisionModal() {
        const orgs = SettingsModel.getUniqueOrganizations(this.settings);
        const initialBureaus = SettingsModel.getUniqueBureaus(this.settings, orgs[0]);

        const bodyHtml = `
            <div class="p-3.5 rounded-xl bma-info-box space-y-3">
                <div>
                    <label class="block text-xs font-extrabold bma-text-main mb-1">1. เลือกหน่วยงานหลัก *</label>
                    <select id="modalStep3AffOrg" class="bma-select text-sm font-semibold" required>
                        ${orgs.map(o => `<option value="${o}">${o}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-extrabold bma-text-main mb-1">2. เลือกสำนักงาน/กอง (ค่าแม่) *</label>
                    <select id="modalStep3AffBureau" class="bma-select text-sm font-semibold" required>
                        ${initialBureaus.map(b => `<option value="${b}">${b}</option>`).join('')}
                    </select>
                </div>
            </div>
            ${this.#buildMultiRowInputsHtml('3. ชื่อส่วน/ฝ่าย (ค่าลูก)', 'เช่น สำนักงานเลขานุการ, กองตรวจและปฏิบัติการพื้นที่ 1')}
        `;

        this.#openModal('3. เพิ่มส่วน/ฝ่าย (เชื่อมโยงสำนักงาน/กอง)', bodyHtml, async () => {
            const parentOrg = document.getElementById('modalStep3AffOrg').value;
            const parentBureau = document.getElementById('modalStep3AffBureau').value;
            const divisions = this.#getDynamicMultiRowValues();
            if (!parentOrg || !parentBureau || divisions.length === 0) return;

            for (const div of divisions) {
                const emptyIdx = this.settings.affiliations.findIndex(
                    a => a.organization === parentOrg && a.bureau === parentBureau && !a.division
                );
                if (emptyIdx !== -1) {
                    this.settings.affiliations[emptyIdx].division = div;
                } else {
                    let lastBureauIdx = -1;
                    this.settings.affiliations.forEach((a, idx) => {
                        if (a.organization === parentOrg && a.bureau === parentBureau) lastBureauIdx = idx;
                    });
                    const newObj = { organization: parentOrg, bureau: parentBureau, division: div, group: '' };
                    if (lastBureauIdx !== -1) {
                        this.settings.affiliations.splice(lastBureauIdx + 1, 0, newObj);
                    } else {
                        this.settings.affiliations.push(newObj);
                    }
                }
            }
            await this.#persistSettings(true);
        });

        document.getElementById('modalStep3AffOrg')?.addEventListener('change', (e) => {
            const bureaus = SettingsModel.getUniqueBureaus(this.settings, e.target.value);
            document.getElementById('modalStep3AffBureau').innerHTML = bureaus.map(b => `<option value="${b}">${b}</option>`).join('');
        });

        this.#bindDynamicMultiRowEvents('เช่น กองตรวจและปฏิบัติการพื้นที่ 1');
    }

    /**
     * ระดับที่ 4: เลือก "หน่วยงาน" > "สำนักงาน/กอง" > "ส่วน/ฝ่าย (แม่)" แล้วเพิ่ม "กลุ่มงาน (ลูก)" ได้หลายแถวพร้อมกัน
     */
    #openAddAffiliationStep4GroupModal() {
        const orgs = SettingsModel.getUniqueOrganizations(this.settings);
        const initialBureaus = SettingsModel.getUniqueBureaus(this.settings, orgs[0]);
        const initialDivisions = SettingsModel.getUniqueDivisions(this.settings, initialBureaus[0], orgs[0]);

        const bodyHtml = `
            <div class="p-3.5 rounded-xl bma-info-box space-y-3">
                <div>
                    <label class="block text-xs font-extrabold bma-text-main mb-1">1. เลือกหน่วยงานหลัก *</label>
                    <select id="modalStep4AffOrg" class="bma-select text-sm font-semibold" required>
                        ${orgs.map(o => `<option value="${o}">${o}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-extrabold bma-text-main mb-1">2. เลือกสำนักงาน/กอง *</label>
                    <select id="modalStep4AffBureau" class="bma-select text-sm font-semibold" required>
                        ${initialBureaus.map(b => `<option value="${b}">${b}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-extrabold bma-text-main mb-1">3. เลือกส่วน/ฝ่าย (ค่าแม่) *</label>
                    <select id="modalStep4AffDivision" class="bma-select text-sm font-semibold" required>
                        ${initialDivisions.length > 0
                            ? initialDivisions.map(d => `<option value="${d}">${d}</option>`).join('')
                            : `<option value="">-- กรุณาเพิ่มส่วน/ฝ่ายก่อน --</option>`}
                    </select>
                </div>
            </div>
            ${this.#buildMultiRowInputsHtml('4. ชื่อกลุ่มงาน (ค่าลูก)', 'เช่น กลุ่มงานการเจ้าหน้าที่, กลุ่มงานตรวจและปฏิบัติการ 1')}
        `;

        this.#openModal('4. เพิ่มกลุ่มงาน (เชื่อมโยงส่วน/ฝ่าย)', bodyHtml, async () => {
            const parentOrg = document.getElementById('modalStep4AffOrg').value;
            const parentBureau = document.getElementById('modalStep4AffBureau').value;
            const parentDivision = document.getElementById('modalStep4AffDivision').value;
            const groups = this.#getDynamicMultiRowValues();

            if (!parentOrg || !parentBureau || !parentDivision) {
                await UIHelpers.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกหน่วยงาน สำนักงาน/กอง และส่วน/ฝ่ายแม่ให้ครบถ้วน', 'warning');
                return;
            }

            for (const grp of groups) {
                const emptyIdx = this.settings.affiliations.findIndex(
                    a => a.organization === parentOrg && a.bureau === parentBureau && a.division === parentDivision && !a.group
                );
                if (emptyIdx !== -1) {
                    this.settings.affiliations[emptyIdx].group = grp;
                } else {
                    let lastDivIdx = -1;
                    this.settings.affiliations.forEach((a, idx) => {
                        if (a.organization === parentOrg && a.bureau === parentBureau && a.division === parentDivision) {
                            lastDivIdx = idx;
                        }
                    });
                    const newObj = { organization: parentOrg, bureau: parentBureau, division: parentDivision, group: grp };
                    if (lastDivIdx !== -1) {
                        this.settings.affiliations.splice(lastDivIdx + 1, 0, newObj);
                    } else {
                        this.settings.affiliations.push(newObj);
                    }
                }
            }
            await this.#persistSettings(true);
        });

        // ผูก Cascading Dropdown 3 ชั้นภายใน Modal
        const orgSel = document.getElementById('modalStep4AffOrg');
        const bureauSel = document.getElementById('modalStep4AffBureau');
        const divSel = document.getElementById('modalStep4AffDivision');

        orgSel?.addEventListener('change', () => {
            const bureaus = SettingsModel.getUniqueBureaus(this.settings, orgSel.value);
            bureauSel.innerHTML = bureaus.map(b => `<option value="${b}">${b}</option>`).join('');
            const divs = SettingsModel.getUniqueDivisions(this.settings, bureauSel.value, orgSel.value);
            divSel.innerHTML = divs.length > 0
                ? divs.map(d => `<option value="${d}">${d}</option>`).join('')
                : `<option value="">-- ยังไม่มีส่วน/ฝ่ายในสังกัดนี้ --</option>`;
        });

        bureauSel?.addEventListener('change', () => {
            const divs = SettingsModel.getUniqueDivisions(this.settings, bureauSel.value, orgSel.value);
            divSel.innerHTML = divs.length > 0
                ? divs.map(d => `<option value="${d}">${d}</option>`).join('')
                : `<option value="">-- ยังไม่มีส่วน/ฝ่ายในสังกัดนี้ --</option>`;
        });

        this.#bindDynamicMultiRowEvents('เช่น กลุ่มงานการเจ้าหน้าที่');
    }

    /**
     * แก้ไขแถวสังกัดรายบรรทัด
     */
    #openEditSingleAffiliationModal(editIndex) {
        const item = this.settings.affiliations[editIndex];
        this.#openModal('แก้ไขรายการโครงสร้างสังกัด', `
            <div>
                <label class="block text-xs font-bold bma-text-main mb-1">1. หน่วยงานหลัก *</label>
                <input type="text" id="mAffOrg" class="bma-input" value="${item.organization || ''}" required>
            </div>
            <div>
                <label class="block text-xs font-bold bma-text-main mb-1">2. สำนักงาน/กอง</label>
                <input type="text" id="mAffBureau" class="bma-input" value="${item.bureau || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold bma-text-main mb-1">3. ส่วน/ฝ่าย</label>
                <input type="text" id="mAffDivision" class="bma-input" value="${item.division || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold bma-text-main mb-1">4. กลุ่มงาน</label>
                <input type="text" id="mAffGroup" class="bma-input" value="${item.group || ''}">
            </div>
        `, async () => {
            this.settings.affiliations[editIndex] = {
                organization: document.getElementById('mAffOrg').value.trim(),
                bureau: document.getElementById('mAffBureau').value.trim(),
                division: document.getElementById('mAffDivision').value.trim(),
                group: document.getElementById('mAffGroup').value.trim()
            };
            await this.#persistSettings(true);
        });
    }

    /**
     * เพิ่ม/แก้ไข ช่วงเวลาปฏิบัติราชการ
     */
    #openShiftModal(editIndex = null) {
        const item = editIndex !== null
            ? this.settings.work_shifts[editIndex]
            : { name: '', check_in: '08:30', check_out: '16:30', is_custom: false };

        this.#openModal(editIndex !== null ? 'แก้ไขช่วงเวลาปฏิบัติราชการ' : 'เพิ่มช่วงเวลาปฏิบัติราชการ', `
            <div>
                <label class="block text-xs font-bold bma-text-main mb-1">ชื่อช่วงเวลา *</label>
                <input type="text" id="mShiftName" class="bma-input" value="${item.name}" placeholder="เช่น เวลาราชการปกติ (08:30 - 16:30) หรือ อื่นๆ" required>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold bma-text-main mb-1">เวลาเข้างาน</label>
                    <input type="time" id="mShiftIn" class="bma-input" value="${item.check_in || '08:30'}">
                </div>
                <div>
                    <label class="block text-xs font-bold bma-text-main mb-1">เวลาออกงาน</label>
                    <input type="time" id="mShiftOut" class="bma-input" value="${item.check_out || '16:30'}">
                </div>
            </div>
            <label class="flex items-center gap-2 pt-2 text-xs font-bold bma-text-main cursor-pointer">
                <input type="checkbox" id="mShiftCustom" class="w-4 h-4 accent-emerald-600" ${item.is_custom ? 'checked' : ''}>
                <span>เป็นตัวเลือก "อื่นๆ" (ให้ผู้ใช้กรอกเวลาเข้างานและเวลาออกงานเองได้)</span>
            </label>
        `, async () => {
            const payload = {
                name: document.getElementById('mShiftName').value.trim(),
                check_in: document.getElementById('mShiftIn').value,
                check_out: document.getElementById('mShiftOut').value,
                is_custom: document.getElementById('mShiftCustom').checked
            };
            if (editIndex !== null) {
                this.settings.work_shifts[editIndex] = payload;
            } else {
                this.settings.work_shifts.push(payload);
            }
            await this.#persistSettings(true);
        });
    }
}

if (!window.__BMA_SPA_ROUTER_ACTIVE__) {
    window.__BMA_SPA_ROUTER_ACTIVE__ = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new SettingsController());
    } else {
        new SettingsController();
    }
}