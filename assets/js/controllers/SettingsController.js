/**
 * @file assets/js/controllers/SettingsController.js
 * @description คลาสควบคุมหน้าตั้งค่าระบบสำหรับ SuperAdmin (รองรับการเปิด/ปิดโหมดลงเวลาปกติ และโหมดพิเศษกดครั้งเดียวลงทั้งเข้าและออก)
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
            pageSubtitle: 'จัดการข้อมูลหน่วยงาน โครงสร้างสังกัด ตำแหน่ง ช่วงเวลา กล้อง/GPS และรูปแบบการบันทึกเวลาปฏิบัติราชการ'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;
        this.settings = await SettingsModel.getSettings(true);

        this.#renderAllSettings();
        this.#bindEvents();
    }

    #renderAllSettings() {
        document.getElementById('setOrgName').value = this.settings.organization_name || '';
        document.getElementById('setBureauName').value = this.settings.bureau_name || '';
        document.getElementById('setLogoUrlInput').value = this.settings.logo_url || '';
        document.getElementById('toggleRequirePhoto').checked = Boolean(this.settings.require_photo);
        document.getElementById('toggleRequireGps').checked = Boolean(this.settings.require_gps);

        // ตั้งค่าสถานะการบันทึกการลงเวลาปฏิบัติงาน (รูปแบบปกติ vs รูปแบบพิเศษครั้งเดียว)
        const isSingleClick = Boolean(this.settings.single_click_checkin);
        this.#syncCheckinModeUI(isSingleClick);

        this.#updateLogoPreview(this.settings.logo_url);
        this.#renderPrefixes();
        this.#renderRemarks();
        this.#renderShifts();
        this.#renderPositions();
        this.#renderAffiliations();
    }

    /**
     * ซิงค์การแสดงผลระหว่าง Checkbox สวิตช์, ป้าย Badge และการ์ด Radio ทั้ง 2 รูปแบบ
     * @param {boolean} isSingleClick true = รูปแบบพิเศษ, false = รูปแบบปกติ
     */
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

    #renderPrefixes() {
        const container = document.getElementById('prefixListContainer');
        const prefixes = this.settings.prefixes || [];
        container.innerHTML = prefixes.map((prefix, idx) => `
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border bma-border bg-emerald-500/5 text-sm font-semibold bma-text-main">
                <span>${prefix}</span>
                <button type="button" data-action="edit-prefix" data-index="${idx}" class="text-sky-500 hover:text-sky-600 text-xs cursor-pointer" title="แก้ไข">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" data-action="delete-prefix" data-index="${idx}" class="text-rose-500 hover:text-rose-600 text-xs cursor-pointer" title="ลบ">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    #renderRemarks() {
        const container = document.getElementById('remarkListContainer');
        const remarks = this.settings.remarks || [];
        container.innerHTML = remarks.map((remark, idx) => `
            <div class="flex items-center justify-between p-2.5 rounded-xl border bma-border text-sm">
                <span class="font-medium bma-text-main">${idx + 1}. ${remark}</span>
                <div class="flex items-center gap-2">
                    <button type="button" data-action="edit-remark" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500">
                        <i class="fa-solid fa-pen"></i> แก้ไข
                    </button>
                    <button type="button" data-action="delete-remark" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500">
                        <i class="fa-solid fa-trash"></i> ลบ
                    </button>
                </div>
            </div>
        `).join('');
    }

    #renderShifts() {
        const tbody = document.getElementById('shiftsTableBody');
        const shifts = this.settings.work_shifts || [];
        tbody.innerHTML = shifts.map((shift, idx) => `
            <tr>
                <td class="text-center font-semibold">${idx + 1}</td>
                <td class="font-bold">${shift.name}</td>
                <td class="font-mono">${shift.is_custom ? 'ผู้ใช้ระบุเอง' : (shift.check_in || '-')}</td>
                <td class="font-mono">${shift.is_custom ? 'ผู้ใช้ระบุเอง' : (shift.check_out || '-')}</td>
                <td>
                    <span class="bma-badge ${shift.is_custom ? 'bma-badge-indigo' : 'bma-badge-success'}">
                        ${shift.is_custom ? 'กำหนดเวลาเอง (อื่นๆ)' : 'เวลามาตรฐาน'}
                    </span>
                </td>
                <td class="text-center space-x-1">
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
        const positions = this.settings.positions || [];
        tbody.innerHTML = positions.map((pos, idx) => `
            <tr>
                <td class="text-center font-semibold">${idx + 1}</td>
                <td><span class="bma-badge bma-badge-sky">${pos.type}</span></td>
                <td class="font-bold">${pos.title}</td>
                <td>${pos.level || '-'}</td>
                <td class="text-center space-x-1">
                    <button type="button" data-action="edit-position" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" data-action="delete-position" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    #renderAffiliations() {
        const tbody = document.getElementById('affiliationsTableBody');
        const affiliations = this.settings.affiliations || [];
        tbody.innerHTML = affiliations.map((aff, idx) => `
            <tr>
                <td class="text-center font-semibold">${idx + 1}</td>
                <td>${aff.organization}</td>
                <td class="font-bold" style="color: var(--bma-primary);">${aff.bureau}</td>
                <td class="font-semibold">${aff.division}</td>
                <td>${aff.group || '-'}</td>
                <td class="text-center space-x-1">
                    <button type="button" data-action="edit-affiliation" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" data-action="delete-affiliation" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async #persistSettings() {
        UIHelpers.showLoading('กำลังบันทึกการตั้งค่าระบบลงฐานข้อมูล...');
        try {
            const res = await SettingsModel.updateSettings(this.settings);
            UIHelpers.hideLoading();
            if (!res.success) {
                await UIHelpers.alert('บันทึกไม่สำเร็จ', res.message, 'error');
                return false;
            }
            this.#renderAllSettings();
            await UIHelpers.alert('บันทึกสำเร็จ', res.message, 'success');
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

        // ผูกเหตุการณ์สลับรูปแบบการบันทึกเวลา (Checkbox <-> Radio Cards)
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
            await this.#persistSettings();
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

        // ปุ่มเพิ่มคำนำหน้า
        document.getElementById('btnAddPrefix')?.addEventListener('click', () => {
            this.#openModal('เพิ่มคำนำหน้าชื่อ', `
                <div>
                    <label class="block text-xs font-semibold bma-text-main mb-1">คำนำหน้าชื่อ *</label>
                    <input type="text" id="modalInputPrefix" class="bma-input" placeholder="เช่น นาย, นาง, นางสาว, ว่าที่ร้อยตรี" required>
                </div>
            `, async () => {
                const val = document.getElementById('modalInputPrefix').value.trim();
                if (val) {
                    this.settings.prefixes.push(val);
                    await this.#persistSettings();
                }
            });
        });

        // ปุ่มเพิ่มหมายเหตุ
        document.getElementById('btnAddRemark')?.addEventListener('click', () => {
            this.#openModal('เพิ่มตัวเลือกหมายเหตุ', `
                <div>
                    <label class="block text-xs font-semibold bma-text-main mb-1">ข้อความหมายเหตุ *</label>
                    <input type="text" id="modalInputRemark" class="bma-input" placeholder="เช่น ปฏิบัติราชการนอกสถานที่" required>
                </div>
            `, async () => {
                const val = document.getElementById('modalInputRemark').value.trim();
                if (val) {
                    this.settings.remarks.push(val);
                    await this.#persistSettings();
                }
            });
        });

        // ปุ่มเพิ่มช่วงเวลาปฏิบัติราชการ
        document.getElementById('btnAddShift')?.addEventListener('click', () => {
            this.#openShiftModal();
        });

        // ปุ่มเพิ่มตำแหน่ง
        document.getElementById('btnAddPosition')?.addEventListener('click', () => {
            this.#openPositionModal();
        });

        // ปุ่มเพิ่มสังกัด
        document.getElementById('btnAddAffiliation')?.addEventListener('click', () => {
            this.#openAffiliationModal();
        });

        // Event Delegation สำหรับปุ่มแก้ไขและลบในตารางทั้งหมด
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const idx = parseInt(btn.dataset.index, 10);

            if (action === 'edit-prefix') {
                const currentVal = this.settings.prefixes[idx];
                this.#openModal('แก้ไขคำนำหน้าชื่อ', `
                    <div>
                        <label class="block text-xs font-semibold bma-text-main mb-1">คำนำหน้าชื่อ *</label>
                        <input type="text" id="modalInputPrefix" class="bma-input" value="${currentVal}" required>
                    </div>
                `, async () => {
                    this.settings.prefixes[idx] = document.getElementById('modalInputPrefix').value.trim();
                    await this.#persistSettings();
                });
            } else if (action === 'delete-prefix') {
                if (await UIHelpers.confirm('ยืนยันการลบคำนำหน้า', `ต้องการลบ "${this.settings.prefixes[idx]}" ใช่หรือไม่?`, 'ลบรายการ')) {
                    this.settings.prefixes.splice(idx, 1);
                    await this.#persistSettings();
                }
            } else if (action === 'edit-remark') {
                const currentVal = this.settings.remarks[idx];
                this.#openModal('แก้ไขหมายเหตุ', `
                    <div>
                        <label class="block text-xs font-semibold bma-text-main mb-1">ข้อความหมายเหตุ *</label>
                        <input type="text" id="modalInputRemark" class="bma-input" value="${currentVal}" required>
                    </div>
                `, async () => {
                    this.settings.remarks[idx] = document.getElementById('modalInputRemark').value.trim();
                    await this.#persistSettings();
                });
            } else if (action === 'delete-remark') {
                if (await UIHelpers.confirm('ยืนยันการลบหมายเหตุ', `ต้องการลบ "${this.settings.remarks[idx]}" ใช่หรือไม่?`, 'ลบรายการ')) {
                    this.settings.remarks.splice(idx, 1);
                    await this.#persistSettings();
                }
            } else if (action === 'edit-shift') {
                this.#openShiftModal(idx);
            } else if (action === 'delete-shift') {
                if (await UIHelpers.confirm('ยืนยันการลบช่วงเวลา', `ต้องการลบ "${this.settings.work_shifts[idx].name}" ใช่หรือไม่?`, 'ลบรายการ')) {
                    this.settings.work_shifts.splice(idx, 1);
                    await this.#persistSettings();
                }
            } else if (action === 'edit-position') {
                this.#openPositionModal(idx);
            } else if (action === 'delete-position') {
                if (await UIHelpers.confirm('ยืนยันการลบตำแหน่ง', `ต้องการลบตำแหน่ง "${this.settings.positions[idx].title}" ใช่หรือไม่?`, 'ลบรายการ')) {
                    this.settings.positions.splice(idx, 1);
                    await this.#persistSettings();
                }
            } else if (action === 'edit-affiliation') {
                this.#openAffiliationModal(idx);
            } else if (action === 'delete-affiliation') {
                if (await UIHelpers.confirm('ยืนยันการลบสังกัด', `ต้องการลบสังกัด "${this.settings.affiliations[idx].division}" ใช่หรือไม่?`, 'ลบรายการ')) {
                    this.settings.affiliations.splice(idx, 1);
                    await this.#persistSettings();
                }
            }
        });
    }

    #openShiftModal(editIndex = null) {
        const item = editIndex !== null ? this.settings.work_shifts[editIndex] : { name: '', check_in: '08:30', check_out: '16:30', is_custom: false };
        this.#openModal(editIndex !== null ? 'แก้ไขช่วงเวลาปฏิบัติราชการ' : 'เพิ่มช่วงเวลาปฏิบัติราชการ', `
            <div>
                <label class="block text-xs font-semibold bma-text-main mb-1">ชื่อช่วงเวลา *</label>
                <input type="text" id="mShiftName" class="bma-input" value="${item.name}" placeholder="เช่น เวลาราชการปกติ (08:30 - 16:30) หรือ อื่นๆ" required>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-semibold bma-text-main mb-1">เวลาเข้างาน</label>
                    <input type="time" id="mShiftIn" class="bma-input" value="${item.check_in || '08:30'}">
                </div>
                <div>
                    <label class="block text-xs font-semibold bma-text-main mb-1">เวลาออกงาน</label>
                    <input type="time" id="mShiftOut" class="bma-input" value="${item.check_out || '16:30'}">
                </div>
            </div>
            <label class="flex items-center gap-2 pt-2 text-xs font-semibold bma-text-main cursor-pointer">
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
            await this.#persistSettings();
        });
    }

    #openPositionModal(editIndex = null) {
        const item = editIndex !== null ? this.settings.positions[editIndex] : { type: 'ประเภททั่วไป', title: '', level: 'ปฏิบัติงาน' };
        this.#openModal(editIndex !== null ? 'แก้ไขข้อมูลตำแหน่ง' : 'เพิ่มข้อมูลตำแหน่ง', `
            <div>
                <label class="block text-xs font-semibold bma-text-main mb-1">ประเภทตำแหน่ง *</label>
                <input type="text" id="mPosType" class="bma-input" value="${item.type}" placeholder="เช่น ประเภททั่วไป, ประเภทวิชาการ, ประเภทอำนวยการ" required>
            </div>
            <div>
                <label class="block text-xs font-semibold bma-text-main mb-1">ชื่อตำแหน่งในสายงาน *</label>
                <input type="text" id="mPosTitle" class="bma-input" value="${item.title}" placeholder="เช่น เจ้าพนักงานเทศกิจ, นักจัดการงานเทศกิจ" required>
            </div>
            <div>
                <label class="block text-xs font-semibold bma-text-main mb-1">ระดับตำแหน่ง *</label>
                <input type="text" id="mPosLevel" class="bma-input" value="${item.level}" placeholder="เช่น ปฏิบัติงาน, ชำนาญงาน, ปฏิบัติการ, ชำนาญการ" required>
            </div>
        `, async () => {
            const payload = {
                type: document.getElementById('mPosType').value.trim(),
                title: document.getElementById('mPosTitle').value.trim(),
                level: document.getElementById('mPosLevel').value.trim()
            };
            if (editIndex !== null) {
                this.settings.positions[editIndex] = payload;
            } else {
                this.settings.positions.push(payload);
            }
            await this.#persistSettings();
        });
    }

    #openAffiliationModal(editIndex = null) {
        const item = editIndex !== null ? this.settings.affiliations[editIndex] : {
            organization: this.settings.organization_name || 'กรุงเทพมหานคร',
            bureau: this.settings.bureau_name || 'สำนักเทศกิจ',
            division: '',
            group: ''
        };
        this.#openModal(editIndex !== null ? 'แก้ไขโครงสร้างสังกัด' : 'เพิ่มโครงสร้างสังกัด', `
            <div>
                <label class="block text-xs font-semibold bma-text-main mb-1">ชื่อหน่วยงานหลัก *</label>
                <input type="text" id="mAffOrg" class="bma-input" value="${item.organization}" required>
            </div>
            <div>
                <label class="block text-xs font-semibold bma-text-main mb-1">สำนักงาน/กอง *</label>
                <input type="text" id="mAffBureau" class="bma-input" value="${item.bureau}" required>
            </div>
            <div>
                <label class="block text-xs font-semibold bma-text-main mb-1">ส่วน/ฝ่าย *</label>
                <input type="text" id="mAffDivision" class="bma-input" value="${item.division}" placeholder="เช่น กองตรวจและปฏิบัติการพื้นที่ 1" required>
            </div>
            <div>
                <label class="block text-xs font-semibold bma-text-main mb-1">กลุ่มงาน *</label>
                <input type="text" id="mAffGroup" class="bma-input" value="${item.group}" placeholder="เช่น กลุ่มงานตรวจและปฏิบัติการ 1" required>
            </div>
        `, async () => {
            const payload = {
                organization: document.getElementById('mAffOrg').value.trim(),
                bureau: document.getElementById('mAffBureau').value.trim(),
                division: document.getElementById('mAffDivision').value.trim(),
                group: document.getElementById('mAffGroup').value.trim()
            };
            if (editIndex !== null) {
                this.settings.affiliations[editIndex] = payload;
            } else {
                this.settings.affiliations.push(payload);
            }
            await this.#persistSettings();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SettingsController();
});