/**
 * @file assets/js/controllers/SettingsController.js
 * @description คลาสควบคุมหน้าตั้งค่าระบบ (ย่อป้าย Tag รูปแบบปกติ/รูปแบบพิเศษไม่ให้ล้นจอ และรองรับตั้งค่าเวลาเริ่มเข้างาน, นาทีหลังเลิกงาน, กรองช่วงเวลาตามเวลาจริง)
 */

import { Config } from '../core/Config.js';
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
            pageSubtitle: 'จัดการหน่วยงาน, เวลาเริ่มเข้างาน, เกณฑ์เวลาออกงาน, กรองกะตามเวลาจริง และโครงสร้างแม่-ลูก'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;

        UIHelpers.showLoading('กำลังโหลดข้อมูลตั้งค่าระบบ...');
        try {
            this.settings = await SettingsModel.getSettings(false);
            this.#renderAllSettings();
            this.#bindEvents();
        } finally {
            UIHelpers.hideLoading();
        }
    }

    #renderAllSettings() {
        document.getElementById('setOrgName').value = this.settings.organization_name || '';
        document.getElementById('setBureauName').value = this.settings.bureau_name || '';
        const headerTitleEl = document.getElementById('setHeaderSystemTitle');
        if (headerTitleEl) {
            headerTitleEl.value = this.settings.header_system_title || 'BMA e-Government Time Attendance System';
        }
        document.getElementById('setFooterDescInput').value = this.settings.footer_description || '';
        document.getElementById('setLogoUrlInput').value = this.settings.logo_url || '';
        document.getElementById('setGDriveScriptUrl').value = this.settings.google_drive_script_url || '';
        document.getElementById('setGDriveFolderId').value = this.settings.google_drive_folder_id || '';

        const logoBadge = document.getElementById('logoUrlVerifyBadge');
        if (logoBadge) {
            if (this.settings.logo_url) {
                logoBadge.textContent = 'ตั้งค่าโลโก้แล้ว';
                logoBadge.className = 'bma-badge bma-badge-success text-[11px]';
            } else {
                logoBadge.textContent = 'ยังไม่ได้ระบุโลโก้';
                logoBadge.className = 'bma-badge bma-badge-sky text-[11px]';
            }
        }

        const gdriveBadge = document.getElementById('gdriveVerifyBadge');
        if (gdriveBadge) {
            if (this.settings.google_drive_script_url) {
                gdriveBadge.textContent = 'ตั้งค่าลิงก์แล้ว';
                gdriveBadge.className = 'bma-badge bma-badge-sky text-[11px]';
            } else {
                gdriveBadge.textContent = 'ยังไม่ได้ระบุลิงก์';
                gdriveBadge.className = 'bma-badge bma-badge-warning text-[11px]';
            }
        }

        document.getElementById('toggleRequirePhoto').checked = Boolean(this.settings.require_photo);
        document.getElementById('toggleRequireGps').checked = Boolean(this.settings.require_gps);

        const filterRealtimeEl = document.getElementById('toggleFilterShiftsByRealtime');
        if (filterRealtimeEl) {
            filterRealtimeEl.checked = Boolean(this.settings.filter_shifts_by_realtime ?? true);
        }

        const isSingleClick = Boolean(this.settings.single_click_checkin);
        this.#syncCheckinModeUI(isSingleClick);

        const allowStartEl = document.getElementById('setAllowCheckinStartTime');
        if (allowStartEl) {
            allowStartEl.value = UIHelpers.formatTime24(this.settings.allow_checkin_start_time || '06:00');
        }
        document.getElementById('setStdCheckIn').value = UIHelpers.formatTime24(this.settings.standard_check_in || '08:30');
        document.getElementById('setStdCheckOut').value = UIHelpers.formatTime24(this.settings.standard_check_out || '16:30');
        document.getElementById('setLateThresholdMin').value = Number(this.settings.late_threshold_minutes ?? 30);

        const graceMinEl = document.getElementById('setCheckoutGraceMin');
        if (graceMinEl) {
            graceMinEl.value = Number(this.settings.checkout_grace_minutes ?? 30);
        }

        const colors = {
            ...Config.DEFAULT_SETTINGS.category_colors,
            ...(this.settings.category_colors || {})
        };
        document.getElementById('setColorNormal').value = colors.normal || '#007B3E';
        document.getElementById('setColorLate').value = colors.late || '#EAB308';
        document.getElementById('setColorAbsentDuty').value = colors.absent_duty || '#EA580C';
        document.getElementById('setColorNoCheckin').value = colors.no_checkin || '#E11D48';
        document.getElementById('setColorOvertime').value = colors.overtime || '#2563EB';
        document.getElementById('setColorGroupHeader').value = colors.group_header || '#007B3E';
        this.#updateColorPreviewBadges();

        this.#updateLogoPreview(this.settings.logo_url);
        this.#renderPrefixes();
        this.#renderRemarks();
        this.#renderShifts();
        this.#renderPositions();
        this.#renderAffiliations();
    }

    #updateColorPreviewBadges() {
        const map = [
            ['setColorNormal', 'previewBadgeNormal'],
            ['setColorLate', 'previewBadgeLate'],
            ['setColorAbsentDuty', 'previewBadgeAbsentDuty'],
            ['setColorNoCheckin', 'previewBadgeNoCheckin'],
            ['setColorOvertime', 'previewBadgeOvertime'],
            ['setColorGroupHeader', 'previewBadgeHeader']
        ];
        for (const [inputId, badgeId] of map) {
            const val = document.getElementById(inputId)?.value;
            const badge = document.getElementById(badgeId);
            if (val && badge) {
                badge.style.backgroundColor = val;
            }
        }
    }

    /**
     * ย่อข้อความป้าย Tag ให้เหลือแค่ "รูปแบบพิเศษ" หรือ "รูปแบบปกติ" เพื่อไม่ให้ล้นจอหรือเบียดข้อความในมือถือ
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
                badgeEl.textContent = 'รูปแบบพิเศษ';
                badgeEl.className = 'bma-badge bma-badge-indigo';
            } else {
                badgeEl.textContent = 'รูปแบบปกติ';
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

        tbody.innerHTML = shifts.map((shift, idx) => {
            const checkIn24 = UIHelpers.formatTime24(shift.check_in);
            const checkOut24 = UIHelpers.formatTime24(shift.check_out);
            const isOvernight = Boolean(shift.is_overnight || (UIHelpers.timeToMinutes(checkOut24) < UIHelpers.timeToMinutes(checkIn24)));
            const formattedDisplay = SettingsModel.formatShiftDisplayText(shift);

            let typeBadgeHtml = '';
            if (shift.is_custom) {
                typeBadgeHtml = `<span class="bma-badge bma-badge-warning">อื่นๆ</span>`;
            } else if (shift.is_overtime) {
                typeBadgeHtml = `
                    <span class="bma-badge-pastel-purple">
                        <i class="fa-solid fa-business-time"></i>
                        <span>ปฏิบัติงานนอกเวลา</span>
                    </span>
                `;
            } else {
                typeBadgeHtml = `<span class="bma-badge bma-badge-success">ปฏิบัติงานปกติ</span>`;
            }

            return `
                <tr>
                    <td class="text-center font-semibold">${idx + 1}</td>
                    <td class="text-center">${this.#buildSortButtonsHtml('work_shifts', idx, shifts.length)}</td>
                    <td>
                        <div class="font-bold bma-text-main">${formattedDisplay}</div>
                    </td>
                    <td class="text-center font-mono font-bold">${shift.is_custom ? 'ระบุเอง' : `${checkIn24} น.`}</td>
                    <td class="text-center font-mono font-bold">
                        ${shift.is_custom ? 'ระบุเอง' : `${checkOut24} น.${isOvernight ? ' (ข้ามวัน)' : ''}`}
                    </td>
                    <td class="text-center">${typeBadgeHtml}</td>
                    <td class="text-center space-x-1 whitespace-nowrap">
                        <button type="button" data-action="edit-shift" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button type="button" data-action="delete-shift" data-index="${idx}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
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

    #collectMainAndColorFieldsIntoSettings() {
        this.settings.organization_name = document.getElementById('setOrgName').value.trim() || 'กรุงเทพมหานคร';
        this.settings.bureau_name = document.getElementById('setBureauName').value.trim() || 'สำนักเทศกิจ';
        this.settings.header_system_title = document.getElementById('setHeaderSystemTitle')?.value?.trim() || 'BMA e-Government Time Attendance System';
        this.settings.footer_description = document.getElementById('setFooterDescInput').value.trim();
        this.settings.logo_url = document.getElementById('setLogoUrlInput').value.trim();
        this.settings.google_drive_script_url = document.getElementById('setGDriveScriptUrl').value.trim();
        this.settings.google_drive_folder_id = document.getElementById('setGDriveFolderId').value.trim();
        this.settings.require_photo = document.getElementById('toggleRequirePhoto').checked;
        this.settings.require_gps = document.getElementById('toggleRequireGps').checked;
        this.settings.filter_shifts_by_realtime = document.getElementById('toggleFilterShiftsByRealtime')?.checked ?? true;
        this.settings.single_click_checkin = document.getElementById('toggleSingleClickCheckin').checked;

        this.settings.allow_checkin_start_time = UIHelpers.formatTime24(document.getElementById('setAllowCheckinStartTime')?.value || '06:00');
        this.settings.standard_check_in = UIHelpers.formatTime24(document.getElementById('setStdCheckIn').value || '08:30');
        this.settings.standard_check_out = UIHelpers.formatTime24(document.getElementById('setStdCheckOut').value || '16:30');
        this.settings.late_threshold_minutes = Number(document.getElementById('setLateThresholdMin').value ?? 30);
        this.settings.checkout_grace_minutes = Number(document.getElementById('setCheckoutGraceMin')?.value ?? 30);

        this.settings.category_colors = {
            normal: document.getElementById('setColorNormal').value || '#007B3E',
            late: document.getElementById('setColorLate').value || '#EAB308',
            absent_duty: document.getElementById('setColorAbsentDuty').value || '#EA580C',
            no_checkin: document.getElementById('setColorNoCheckin').value || '#E11D48',
            overtime: document.getElementById('setColorOvertime').value || '#2563EB',
            group_header: document.getElementById('setColorGroupHeader').value || '#007B3E'
        };
    }

    async #persistSettings(showToastAlert = true) {
        this.#collectMainAndColorFieldsIntoSettings();
        UIHelpers.showLoading('กำลังบันทึกการตั้งค่าระบบ...');
        try {
            const res = await SettingsModel.updateSettings(this.settings);
            UIHelpers.hideLoading();
            if (!res.success) {
                await UIHelpers.alert('บันทึกไม่สำเร็จ', res.message, 'error');
                return false;
            }
            this.#renderAllSettings();
            if (showToastAlert) {
                await UIHelpers.showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว', 'success', 2500);
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

    #getDynamicMultiRowValues() {
        const inputs = document.querySelectorAll('#dynamicMultiRowsContainer .dynamic-row-input');
        return Array.from(inputs)
            .map(inp => inp.value.trim())
            .filter(Boolean);
    }

    #bindEvents() {
        document.getElementById('setLogoFileInput')?.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const dataUrl = await SettingsModel.fileToDataUrl(file);
            document.getElementById('setLogoUrlInput').value = dataUrl;
            this.#updateLogoPreview(dataUrl);
            const logoBadge = document.getElementById('logoUrlVerifyBadge');
            if (logoBadge) {
                logoBadge.textContent = '✓ อัปโหลดไฟล์รูปแล้ว';
                logoBadge.className = 'bma-badge bma-badge-success text-[11px]';
            }
        });

        document.getElementById('btnClearLogo')?.addEventListener('click', () => {
            document.getElementById('setLogoUrlInput').value = '';
            document.getElementById('setLogoFileInput').value = '';
            this.#updateLogoPreview('');
            const logoBadge = document.getElementById('logoUrlVerifyBadge');
            if (logoBadge) {
                logoBadge.textContent = 'ล้างโลโก้แล้ว';
                logoBadge.className = 'bma-badge bma-badge-warning text-[11px]';
            }
        });

        document.getElementById('btnVerifyLogoUrl')?.addEventListener('click', async () => {
            const rawUrl = document.getElementById('setLogoUrlInput')?.value || '';
            const logoBadge = document.getElementById('logoUrlVerifyBadge');

            UIHelpers.showLoading('กำลังตรวจสอบลิงก์รูปโลโก้หน่วยงาน...');
            const result = await UIHelpers.verifyImageUrl(rawUrl);
            UIHelpers.hideLoading();

            if (result.success) {
                document.getElementById('setLogoUrlInput').value = result.normalizedUrl;
                this.#updateLogoPreview(result.normalizedUrl);
                if (logoBadge) {
                    logoBadge.textContent = `✓ ลิงก์รูปใช้ได้ (${result.width}×${result.height})`;
                    logoBadge.className = 'bma-badge bma-badge-success text-[11px]';
                }
                await UIHelpers.alert('ตรวจสอบลิงก์รูปโลโก้สำเร็จ', result.message, 'success');
            } else {
                if (logoBadge) {
                    logoBadge.textContent = '✗ ลิงก์รูปไม่ถูกต้อง';
                    logoBadge.className = 'bma-badge bma-badge-danger text-[11px]';
                }
                await UIHelpers.alert('ไม่สามารถโหลดรูปโลโก้ได้', result.message, 'warning');
            }
        });

        document.getElementById('btnVerifyGoogleDriveLink')?.addEventListener('click', async () => {
            const scriptUrl = document.getElementById('setGDriveScriptUrl').value.trim();
            const folderId = document.getElementById('setGDriveFolderId').value.trim();
            const badge = document.getElementById('gdriveVerifyBadge');

            UIHelpers.showLoading('กำลังตรวจสอบลิงก์ Google Drive...');
            const res = await UIHelpers.verifyGoogleDriveLink(scriptUrl, folderId);
            UIHelpers.hideLoading();

            if (res.success) {
                if (badge) {
                    badge.textContent = '✓ ลิงก์พร้อมใช้งาน';
                    badge.className = 'bma-badge bma-badge-success text-[11px]';
                }
                await UIHelpers.alert('ตรวจสอบลิงก์สำเร็จ', res.message, 'success');
            } else {
                if (badge) {
                    badge.textContent = '✗ ลิงก์ไม่ถูกต้อง';
                    badge.className = 'bma-badge bma-badge-danger text-[11px]';
                }
                await UIHelpers.alert('ไม่สามารถเชื่อมต่อลิงก์ได้', res.message, 'warning');
            }
        });

        ['setColorNormal', 'setColorLate', 'setColorAbsentDuty', 'setColorNoCheckin', 'setColorOvertime', 'setColorGroupHeader'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.#updateColorPreviewBadges());
        });

        document.getElementById('toggleSingleClickCheckin')?.addEventListener('change', (e) => {
            this.#syncCheckinModeUI(e.target.checked);
        });

        document.querySelectorAll('input[name="checkinRecordingMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.#syncCheckinModeUI(e.target.value === 'single_click');
            });
        });

        document.getElementById('btnSaveMainSettings')?.addEventListener('click', async () => {
            await this.#persistSettings(true);
        });

        document.getElementById('btnSaveStatusAndColors')?.addEventListener('click', async () => {
            await this.#persistSettings(true);
        });

        document.getElementById('btnCloseSettingsModal')?.addEventListener('click', () => this.#closeModal());
        document.getElementById('btnCancelSettingsModal')?.addEventListener('click', () => this.#closeModal());

        document.getElementById('formSettingsItem')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (typeof this.activeModalHandler === 'function') {
                await this.activeModalHandler();
                this.#closeModal();
            }
        });

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

        document.getElementById('btnAddShift')?.addEventListener('click', () => {
            this.#openShiftModal();
        });

        document.getElementById('btnAddPosStep1Type')?.addEventListener('click', () => this.#openAddPositionStep1Modal());
        document.getElementById('btnAddPosStep2Title')?.addEventListener('click', () => this.#openAddPositionStep2Modal());
        document.getElementById('btnAddPosStep3Level')?.addEventListener('click', () => this.#openAddPositionStep3Modal());

        document.getElementById('btnAddAffStep1Org')?.addEventListener('click', () => this.#openAddAffiliationStep1OrgModal());
        document.getElementById('btnAddAffStep2Bureau')?.addEventListener('click', () => this.#openAddAffiliationStep2BureauModal());
        document.getElementById('btnAddAffStep3Division')?.addEventListener('click', () => this.#openAddAffiliationStep3DivisionModal());
        document.getElementById('btnAddAffStep4Group')?.addEventListener('click', () => this.#openAddAffiliationStep4GroupModal());

        document.querySelector('main')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const idx = parseInt(btn.dataset.index, 10);

            if (action === 'move-item') {
                const category = btn.dataset.category;
                const dir = btn.dataset.dir;
                const targetArray = this.settings[category];
                if (SettingsModel.moveItemInArray(targetArray, idx, dir)) {
                    await this.#persistSettings(false);
                }
                return;
            }

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
            } else if (action === 'edit-remark') {
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
            } else if (action === 'edit-shift') {
                this.#openShiftModal(idx);
            } else if (action === 'delete-shift') {
                if (await UIHelpers.confirm('ยืนยันการลบช่วงเวลา', `ต้องการลบ "${this.settings.work_shifts[idx].name}" ใช่หรือไม่?`, 'ลบรายการ')) {
                    this.settings.work_shifts.splice(idx, 1);
                    await this.#persistSettings(true);
                }
            } else if (action === 'edit-position') {
                this.#openEditSinglePositionModal(idx);
            } else if (action === 'delete-position') {
                const pos = this.settings.positions[idx];
                if (await UIHelpers.confirm('ยืนยันการลบรายการตำแหน่ง', `ต้องการลบ "${pos.type} > ${pos.title || '-'} > ${pos.level || '-'}" ใช่หรือไม่?`, 'ลบรายการ')) {
                    this.settings.positions.splice(idx, 1);
                    await this.#persistSettings(true);
                }
            } else if (action === 'edit-affiliation') {
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

    #openShiftModal(editIndex = null) {
        const item = editIndex !== null
            ? this.settings.work_shifts[editIndex]
            : { name: '', check_in: '08:30', check_out: '16:30', is_custom: false, is_overtime: false, is_overnight: false };

        const cleanName = String(item.name || '')
            .replace(/\s*\(\d{1,2}[:.]\d{2}\s*-\s*\d{1,2}[:.]\d{2}.*?\)/g, '')
            .replace(/\s*\(ข้ามวัน\)/g, '')
            .trim();

        this.#openModal(editIndex !== null ? 'แก้ไขช่วงเวลาทำงาน' : 'เพิ่มช่วงเวลาทำงาน', `
            <div>
                <label class="block text-xs font-bold bma-text-main mb-1">ชื่อช่วงเวลาทำงาน (ไม่ต้องใส่วงเล็บเวลา ระบบจะต่อท้ายเวลาให้อัตโนมัติ) *</label>
                <input type="text" id="mShiftName" class="bma-input" value="${cleanName}" placeholder="เช่น เวลาราชการปกติ หรือ ปฏิบัติงานนอกเวลา" required>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold bma-text-main mb-1">เวลาเริ่มงาน (24 ชม.) *</label>
                    <input type="text" id="mShiftIn" class="bma-input font-mono font-bold text-center" value="${UIHelpers.formatTime24(item.check_in || '08:30')}" placeholder="เช่น 08:30 หรือ 22:00">
                </div>
                <div>
                    <label class="block text-xs font-bold bma-text-main mb-1">เวลาเลิกงาน (24 ชม.) *</label>
                    <input type="text" id="mShiftOut" class="bma-input font-mono font-bold text-center" value="${UIHelpers.formatTime24(item.check_out || '16:30')}" placeholder="เช่น 16:30 หรือ 01:00">
                </div>
            </div>

            <div class="p-3.5 rounded-xl bma-info-box space-y-2.5">
                <label class="flex items-start gap-2.5 text-xs font-bold bma-text-main cursor-pointer">
                    <input type="checkbox" id="mShiftOvertime" class="w-4 h-4 accent-purple-600 mt-0.5 shrink-0" ${item.is_overtime ? 'checked' : ''}>
                    <div>
                        <span class="text-purple-700 dark:text-purple-300 font-extrabold block">ช่วงเวลานี้คือ "ปฏิบัติงานนอกเวลา"</span>
                        <span class="bma-text-sub font-normal block mt-0.5">
                            เมื่อเลือกช่วงเวลานี้ ระบบจะใช้การบันทึกเวลารูปแบบพิเศษโดยอัตโนมัติ
                        </span>
                    </div>
                </label>

                <label class="flex items-center gap-2.5 pt-2 border-t bma-border text-xs font-bold bma-text-main cursor-pointer">
                    <input type="checkbox" id="mShiftOvernight" class="w-4 h-4 accent-indigo-600 shrink-0" ${item.is_overnight ? 'checked' : ''}>
                    <span>เป็นเวลาเลิกงานข้ามวัน (ระบบจะต่อท้าย "(ข้ามวัน)" ในตัวเลือกอัตโนมัติ)</span>
                </label>

                <label class="flex items-center gap-2.5 pt-2 border-t bma-border text-xs font-bold bma-text-main cursor-pointer">
                    <input type="checkbox" id="mShiftCustom" class="w-4 h-4 accent-emerald-600 shrink-0" ${item.is_custom ? 'checked' : ''}>
                    <span>เป็นตัวเลือก "อื่นๆ" (ให้ผู้ใช้กรอกเวลาเข้างานและเวลาเลิกงานเองได้)</span>
                </label>
            </div>
        `, async () => {
            const checkIn = UIHelpers.formatTime24(document.getElementById('mShiftIn').value || '08:30');
            const checkOut = UIHelpers.formatTime24(document.getElementById('mShiftOut').value || '16:30');
            const autoOvernight = UIHelpers.timeToMinutes(checkOut) < UIHelpers.timeToMinutes(checkIn);

            const payload = {
                name: document.getElementById('mShiftName').value.trim(),
                check_in: checkIn,
                check_out: checkOut,
                is_overtime: document.getElementById('mShiftOvertime').checked,
                is_overnight: Boolean(document.getElementById('mShiftOvernight').checked || autoOvernight),
                is_custom: document.getElementById('mShiftCustom').checked
            };

            if (editIndex !== null) {
                this.settings.work_shifts[editIndex] = payload;
            } else {
                this.settings.work_shifts.push(payload);
            }
            await this.#persistSettings(true);
        });

        const checkOvernightAuto = () => {
            const inMin = UIHelpers.timeToMinutes(document.getElementById('mShiftIn')?.value);
            const outMin = UIHelpers.timeToMinutes(document.getElementById('mShiftOut')?.value);
            const chkOvernight = document.getElementById('mShiftOvernight');
            if (chkOvernight && inMin >= 0 && outMin >= 0 && outMin < inMin) {
                chkOvernight.checked = true;
            }
        };
        document.getElementById('mShiftIn')?.addEventListener('input', checkOvernightAuto);
        document.getElementById('mShiftOut')?.addEventListener('input', checkOvernightAuto);
    }

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
                const emptyIdx = this.settings.positions.findIndex(p => p.type === parentType && !p.title);
                if (emptyIdx !== -1) {
                    this.settings.positions[emptyIdx].title = title;
                } else {
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

            if (!parentType || !parentTitle) return;

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

        document.getElementById('modalStep3PosType')?.addEventListener('change', (e) => {
            const titles = SettingsModel.getUniquePositionTitles(this.settings, e.target.value);
            document.getElementById('modalStep3PosTitle').innerHTML = titles.length > 0
                ? titles.map(t => `<option value="${t}">${t}</option>`).join('')
                : `<option value="">-- ยังไม่มีตำแหน่งในประเภทนี้ --</option>`;
        });

        this.#bindDynamicMultiRowEvents('เช่น ปฏิบัติงาน, ชำนาญงาน');
    }

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

            if (!parentOrg || !parentBureau || !parentDivision) return;

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
}

if (!window.__BMA_SPA_ROUTER_ACTIVE__) {
    window.__BMA_SPA_ROUTER_ACTIVE__ = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new SettingsController());
    } else {
        new SettingsController();
    }
}