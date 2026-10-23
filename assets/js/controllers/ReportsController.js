/**
 * @file assets/js/controllers/ReportsController.js
 * @description คลาสควบคุมหน้ารายงานการลงเวลา (เลือกวันที่เดี่ยว/ช่วงวันที่ 15 มกราคม 2569, กรอง Multi-Select Status Tags และแยกตารางตาม Tag ที่เลือก)
 */

import { Config } from '../core/Config.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { AppLayout } from '../components/AppLayout.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { PersonnelModel } from '../models/PersonnelModel.js';
import { AttendanceModel } from '../models/AttendanceModel.js';

export class ReportsController {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.allPersonnel = [];
        this.records = [];
        this.dateMode = 'single'; // 'single' หรือ 'range'
        this.groupViewMode = 'division'; // 'division' หรือ 'group'
        // ค่าเริ่มต้นของ Tag สถานะที่เลือกคือ "ปฏิบัติงานปกติ" (normal) และ "มาสาย" (late)
        this.selectedStatusKeys = new Set(['normal', 'late']);
        this.init();
    }

    async init() {
        const layout = await AppLayout.initAdminLayout({
            activePage: 'reports',
            pageTitle: 'รายงานการลงเวลาปฏิบัติราชการ',
            pageSubtitle: 'ฟิลเตอร์ตามวันที่/ช่วงวันที่ และแยกตารางรายงานตาม TAG สถานะที่เลือก'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;
        this.settings = await SettingsModel.getSettings(true);

        const mobileShortcutEl = document.getElementById('reportMobileShortcutContainer');
        if (mobileShortcutEl) {
            mobileShortcutEl.innerHTML = AppLayout.getMobileShortcutGridHtml(this.currentUser);
        }

        const todayIso = UIHelpers.getTodayISO();
        const singleInput = document.getElementById('reportSingleDateInput');
        const startInput = document.getElementById('reportStartDateInput');
        const endInput = document.getElementById('reportEndDateInput');

        if (singleInput) singleInput.value = todayIso;
        if (startInput) startInput.value = todayIso;
        if (endInput) endInput.value = todayIso;

        this.#renderStatusTagFilterChips();
        this.#bindEvents();
        await this.loadReportData();
    }

    /**
     * ดึงสีประจำสถานะจากเมนูตั้งค่าระบบ
     */
    #getStatusColor(statusKey) {
        const colors = {
            ...Config.DEFAULT_SETTINGS.category_colors,
            ...(this.settings?.category_colors || {})
        };
        return colors[statusKey] || '#007B3E';
    }

    /**
     * เรนเดอร์ปุ่มเลือก TAG สถานะทั้ง 5 รายการ
     */
    #renderStatusTagFilterChips() {
        const container = document.getElementById('statusTagsFilterContainer');
        if (!container) return;

        container.innerHTML = Config.OFFICIAL_STATUSES.map(st => {
            const isSelected = this.selectedStatusKeys.has(st.key);
            const color = this.#getStatusColor(st.key);
            const countInStatus = this.records.filter(r => r.status_category === st.key).length;

            return `
                <button type="button"
                        data-tag-key="${st.key}"
                        class="status-tag-chip ${isSelected ? 'active' : ''}"
                        style="${isSelected ? `background-color: ${color}; border-color: ${color};` : `border-color: ${color}55;`}">
                    <i class="fa-solid ${isSelected ? 'fa-square-check' : 'fa-square'}"></i>
                    <span>${st.label}</span>
                    <span class="px-1.5 py-0.2 rounded-full text-[11px] ${isSelected ? 'bg-black/25 text-white' : 'bma-info-box bma-text-main'}">
                        ${countInStatus}
                    </span>
                </button>
            `;
        }).join('');
    }

    /**
     * อัปเดตข้อความหัวข้อวันที่ในรูปแบบเต็ม เช่น "15 มกราคม 2569"
     */
    #getFormattedReportDateSubtitle() {
        if (this.dateMode === 'single') {
            const d = document.getElementById('reportSingleDateInput')?.value || UIHelpers.getTodayISO();
            return `ประจำวันที่ ${UIHelpers.formatThaiFullDate(d)}`;
        } else {
            const s = document.getElementById('reportStartDateInput')?.value || UIHelpers.getTodayISO();
            const e = document.getElementById('reportEndDateInput')?.value || s;
            return `ตั้งแต่วันที่ ${UIHelpers.formatThaiFullDate(s)} ถึงวันที่ ${UIHelpers.formatThaiFullDate(e)}`;
        }
    }

    async loadReportData() {
        let startDate = UIHelpers.getTodayISO();
        let endDate = startDate;

        if (this.dateMode === 'single') {
            startDate = document.getElementById('reportSingleDateInput')?.value || startDate;
            endDate = startDate;
        } else {
            startDate = document.getElementById('reportStartDateInput')?.value || startDate;
            endDate = document.getElementById('reportEndDateInput')?.value || startDate;
            if (endDate < startDate) {
                endDate = startDate;
                document.getElementById('reportEndDateInput').value = startDate;
            }
        }

        const subtitleEl = document.getElementById('reportDateDisplaySubtitle');
        if (subtitleEl) {
            subtitleEl.textContent = this.#getFormattedReportDateSubtitle();
        }

        UIHelpers.showLoading('กำลังประมวลผลข้อมูลรายงานการลงเวลา...');
        try {
            const [records, personnel] = await Promise.all([
                AttendanceModel.getReportRecordsByDateRange(startDate, endDate, this.currentUser),
                PersonnelModel.getAll(this.currentUser)
            ]);
            this.records = records;
            this.allPersonnel = personnel;
            this.#populatePersonnelDropdown();
            this.#renderStatusTagFilterChips();
            this.#renderSeparateTablesBySelectedTags(false);
        } finally {
            UIHelpers.hideLoading();
        }
    }

    #populatePersonnelDropdown() {
        const selectEl = document.getElementById('repPersonnelSelect');
        if (!selectEl) return;
        selectEl.innerHTML = this.allPersonnel.map(p =>
            `<option value="${p.id}">${p.prefix}${p.first_name} ${p.last_name} (${p.division})</option>`
        ).join('');
    }

    /**
     * เรนเดอร์แยกตารางตาม TAG สถานะที่ผู้ดูแลระบบกดเลือกไว้:
     * - เลือก 1 Tag แสดง 1 ตาราง
     * - เลือก 2 Tags แสดง 2 ตารางแยกกัน
     * - เลือก N Tags แสดง N ตารางแยกกัน
     * @param {boolean} forPrintPdf
     * @returns {string} HTML สำหรับโหมดพิมพ์ PDF
     */
    #renderSeparateTablesBySelectedTags(forPrintPdf = false) {
        const masterContainer = document.getElementById('reportTablesMasterContainer');
        const activeStatuses = Config.OFFICIAL_STATUSES.filter(st => this.selectedStatusKeys.has(st.key));

        if (activeStatuses.length === 0) {
            if (!forPrintPdf && masterContainer) {
                masterContainer.innerHTML = `
                    <div class="bma-card p-8 text-center bma-text-sub">
                        <i class="fa-solid fa-tags text-3xl mb-2 text-emerald-600 block"></i>
                        กรุณาคลิกเลือก TAG สถานะด้านบนอย่างน้อย 1 สถานะ เพื่อแสดงตารางรายงาน
                    </div>
                `;
            }
            return '';
        }

        const groupHeaderColor = this.settings?.category_colors?.group_header || '#007B3E';
        let combinedHtml = '';

        for (const statusMeta of activeStatuses) {
            const statusColor = this.#getStatusColor(statusMeta.key);
            const tagRecords = this.records.filter(r => r.status_category === statusMeta.key);

            const tableRowsHtml = this.#buildGroupedRowsForTag(tagRecords, groupHeaderColor, forPrintPdf);

            if (forPrintPdf) {
                combinedHtml += `
                    <div class="tag-section-block">
                        <div class="tag-section-title" style="background-color: ${statusColor};">
                            ตารางสถานะ: ${statusMeta.label} (จำนวน ${tagRecords.length} รายการ)
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 45px; text-align: center;">ลำดับ</th>
                                    <th style="width: 120px;">วันที่ปฏิบัติงาน</th>
                                    <th>คำนำหน้า + ชื่อ + นามสกุล</th>
                                    <th>ตำแหน่ง + ระดับ</th>
                                    <th style="width: 85px; text-align: center;">เวลาเข้างาน</th>
                                    <th style="width: 85px; text-align: center;">เวลาออกงาน</th>
                                    <th style="width: 145px; text-align: center;">สถานะ / หมายเหตุ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRowsHtml}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                combinedHtml += `
                    <div class="bma-card p-5 space-y-3" style="border-top: 4px solid ${statusColor};">
                        <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b bma-border">
                            <div class="flex items-center gap-2.5">
                                <span class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shadow-xs" style="background-color: ${statusColor};">
                                    <i class="fa-solid ${statusMeta.icon}"></i>
                                </span>
                                <div>
                                    <h3 class="text-base font-extrabold bma-text-main">
                                        ตารางรายงานสถานะ: <span style="color: ${statusColor};">${statusMeta.label}</span>
                                    </h3>
                                    <p class="text-xs bma-text-sub">${this.#getFormattedReportDateSubtitle()}</p>
                                </div>
                            </div>
                            <span class="bma-badge text-white text-xs px-3 py-1 shadow-xs" style="background-color: ${statusColor};">
                                รวม ${tagRecords.length} รายการ
                            </span>
                        </div>

                        <div class="bma-table-container">
                            <table class="bma-table text-sm">
                                <thead>
                                    <tr>
                                        <th class="w-14 text-center">ลำดับ</th>
                                        <th class="w-36">วันที่ปฏิบัติงาน</th>
                                        <th>คำนำหน้า + ชื่อ + นามสกุล</th>
                                        <th>ตำแหน่ง + ระดับ</th>
                                        <th class="text-center">เวลาเข้างาน</th>
                                        <th class="text-center">เวลาออกงาน</th>
                                        <th class="text-center">สถานะ / หมายเหตุ</th>
                                        <th class="w-28 text-center no-print">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tableRowsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }
        }

        if (!forPrintPdf && masterContainer) {
            masterContainer.innerHTML = combinedHtml;
        }
        return combinedHtml;
    }

    /**
     * จัดกลุ่มข้อมูลภายในแต่ละตารางตามมุมมอง Group By 2 มุมมอง
     */
    #buildGroupedRowsForTag(tagRecords, groupHeaderColor, forPrintPdf) {
        const colSpan = forPrintPdf ? 7 : 8;
        if (!tagRecords || tagRecords.length === 0) {
            return `<tr><td colspan="${colSpan}" class="text-center py-6 bma-text-sub">ไม่มีข้อมูลบุคลากรในสถานะนี้</td></tr>`;
        }

        const grouped = PersonnelModel.groupPersonnel(tagRecords, this.groupViewMode);
        let rowsHtml = '';
        let runningNo = 1;

        for (const [bureauName, divisionsObj] of Object.entries(grouped)) {
            for (const [divisionName, content] of Object.entries(divisionsObj)) {
                rowsHtml += `
                    <tr class="group-row" style="background-color: ${groupHeaderColor}18;">
                        <td colspan="${colSpan}" class="font-bold text-sm py-2.5 px-4" style="color: ${groupHeaderColor}; border-left: 4px solid ${groupHeaderColor};">
                            <i class="fa-solid fa-building-user mr-1.5"></i>${bureauName} &gt; ${divisionName}
                        </td>
                    </tr>
                `;

                if (this.groupViewMode === 'group') {
                    for (const [groupName, members] of Object.entries(content)) {
                        rowsHtml += `
                            <tr class="sub-group-row bg-emerald-950/5 dark:bg-slate-800/50">
                                <td colspan="${colSpan}" class="font-semibold text-xs py-2 pl-8 bma-text-main">
                                    กลุ่มงาน: ${groupName} (${members.length} รายการ)
                                </td>
                            </tr>
                        `;
                        for (const rec of members) {
                            rowsHtml += this.#buildSingleRowHtml(rec, runningNo++, forPrintPdf);
                        }
                    }
                } else {
                    for (const rec of content) {
                        rowsHtml += this.#buildSingleRowHtml(rec, runningNo++, forPrintPdf);
                    }
                }
            }
        }

        return rowsHtml;
    }

    #buildSingleRowHtml(rec, indexNo, forPrintPdf) {
        const badgeColor = this.#getStatusColor(rec.status_category);
        const statusText = rec.remark ? `${rec.status_label} (${rec.remark})` : rec.status_label;
        const fullDateText = rec.work_date_thai_full || UIHelpers.formatThaiFullDate(rec.work_date);

        if (forPrintPdf) {
            return `
                <tr>
                    <td style="text-align: center;">${indexNo}</td>
                    <td>${fullDateText}</td>
                    <td>${rec.full_name}</td>
                    <td>${rec.position_full}</td>
                    <td style="text-align: center;">${rec.check_in_time || '-'}</td>
                    <td style="text-align: center;">${rec.check_out_time || '-'}</td>
                    <td style="text-align: center; color: ${badgeColor}; font-weight: 700;">${statusText}</td>
                </tr>
            `;
        }

        return `
            <tr>
                <td class="text-center font-semibold">${indexNo}</td>
                <td class="text-xs font-bold whitespace-nowrap">${fullDateText}</td>
                <td>
                    <div class="font-bold bma-text-main">${rec.full_name}</div>
                    ${rec.check_in_location ? `<div class="text-[11px] bma-text-sub"><i class="fa-solid fa-location-dot mr-1 text-emerald-600"></i>${rec.check_in_location}</div>` : ''}
                </td>
                <td>${rec.position_full}</td>
                <td class="text-center font-mono font-bold">${rec.check_in_time ? rec.check_in_time + ' น.' : '-'}</td>
                <td class="text-center font-mono font-bold">${rec.check_out_time ? rec.check_out_time + ' น.' : '-'}</td>
                <td class="text-center">
                    <span class="bma-badge text-white shadow-xs" style="background-color: ${badgeColor};">
                        ${rec.status_label}
                    </span>
                    ${rec.remark ? `<div class="text-[11px] bma-text-sub mt-0.5">${rec.remark}</div>` : ''}
                </td>
                <td class="text-center space-x-1 whitespace-nowrap">
                    <button type="button" data-action="edit-record" data-pid="${rec.personnel_id}" data-logid="${rec.log_id || ''}" data-date="${rec.work_date}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500" title="บันทึก/แก้ไขเวลา">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    ${rec.log_id ? `
                        <button type="button" data-action="delete-record" data-logid="${rec.log_id}" data-name="${rec.full_name}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500" title="ลบเวลา">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }

    #openModal(rec = null) {
        const modal = document.getElementById('modalReportAttendance');
        const defaultDate = document.getElementById('reportSingleDateInput')?.value || UIHelpers.getTodayISO();

        document.getElementById('repLogId').value = rec?.log_id || '';
        if (rec?.personnel_id) {
            document.getElementById('repPersonnelSelect').value = rec.personnel_id;
        }
        document.getElementById('repWorkDate').value = rec?.work_date || defaultDate;
        document.getElementById('repCheckinTime').value = rec?.check_in_time || this.settings.standard_check_in || '08:30';
        document.getElementById('repCheckoutTime').value = rec?.check_out_time || this.settings.standard_check_out || '16:30';
        document.getElementById('repStatusSelect').value = rec?.status_label && rec.status_label !== 'ไม่ลงเวลา'
            ? rec.status_label
            : 'ปฏิบัติงานปกติ';
        document.getElementById('repRemarkInput').value = rec?.remark || '';

        modal?.classList.remove('hidden');
    }

    #closeModal() {
        document.getElementById('modalReportAttendance')?.classList.add('hidden');
    }

    #bindEvents() {
        // สลับโหมดการเลือกวันที่: วันเดียว vs ช่วงวันที่
        const btnSingle = document.getElementById('btnModeSingleDate');
        const btnRange = document.getElementById('btnModeRangeDate');
        const singleBox = document.getElementById('singleDatePickerBox');
        const rangeBox = document.getElementById('rangeDatePickerBox');

        btnSingle?.addEventListener('click', () => {
            this.dateMode = 'single';
            btnSingle.className = 'py-1.5 px-2.5 rounded-lg text-xs font-bold transition bg-[#007B3E] text-white shadow-xs cursor-pointer';
            btnRange.className = 'py-1.5 px-2.5 rounded-lg text-xs font-bold transition bma-text-sub hover:bg-black/5 cursor-pointer';
            singleBox?.classList.remove('hidden');
            rangeBox?.classList.add('hidden');
            this.loadReportData();
        });

        btnRange?.addEventListener('click', () => {
            this.dateMode = 'range';
            btnRange.className = 'py-1.5 px-2.5 rounded-lg text-xs font-bold transition bg-[#007B3E] text-white shadow-xs cursor-pointer';
            btnSingle.className = 'py-1.5 px-2.5 rounded-lg text-xs font-bold transition bma-text-sub hover:bg-black/5 cursor-pointer';
            singleBox?.classList.add('hidden');
            rangeBox?.classList.remove('hidden');
            this.loadReportData();
        });

        document.getElementById('reportSingleDateInput')?.addEventListener('change', () => this.loadReportData());
        document.getElementById('reportStartDateInput')?.addEventListener('change', () => this.loadReportData());
        document.getElementById('reportEndDateInput')?.addEventListener('change', () => this.loadReportData());

        document.getElementById('selectReportGroupBy')?.addEventListener('change', (e) => {
            this.groupViewMode = e.target.value;
            this.#renderSeparateTablesBySelectedTags(false);
        });

        // คลิกเลือก/ยกเลิก TAG สถานะ
        document.getElementById('statusTagsFilterContainer')?.addEventListener('click', (e) => {
            const chip = e.target.closest('button[data-tag-key]');
            if (!chip) return;
            const key = chip.dataset.tagKey;
            if (this.selectedStatusKeys.has(key)) {
                this.selectedStatusKeys.delete(key);
            } else {
                this.selectedStatusKeys.add(key);
            }
            this.#renderStatusTagFilterChips();
            this.#renderSeparateTablesBySelectedTags(false);
        });

        // ปุ่มลัดเลือกค่าเริ่มต้น (ปฏิบัติงานปกติ + มาสาย) และ เลือกทั้งหมด
        document.getElementById('btnSelectDefaultTags')?.addEventListener('click', () => {
            this.selectedStatusKeys = new Set(['normal', 'late']);
            this.#renderStatusTagFilterChips();
            this.#renderSeparateTablesBySelectedTags(false);
        });

        document.getElementById('btnSelectAllStatusTags')?.addEventListener('click', () => {
            this.selectedStatusKeys = new Set(Config.OFFICIAL_STATUSES.map(s => s.key));
            this.#renderStatusTagFilterChips();
            this.#renderSeparateTablesBySelectedTags(false);
        });

        // ปุ่มเปิด/ปิด Modal
        document.getElementById('btnOpenAddReportRecord')?.addEventListener('click', () => this.#openModal(null));
        document.getElementById('btnCloseReportModal')?.addEventListener('click', () => this.#closeModal());
        document.getElementById('btnCancelReportModal')?.addEventListener('click', () => this.#closeModal());

        document.getElementById('formReportAttendance')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.#handleSaveReportRecord();
        });

        // พิมพ์และส่งออกเป็น PDF โดยเปิด Tab ใหม่ (รวมทุกตารางตาม Tag ที่เลือกไว้)
        document.getElementById('btnPrintPdfNewTab')?.addEventListener('click', () => {
            const tableHtml = this.#renderSeparateTablesBySelectedTags(true);
            if (!tableHtml) {
                UIHelpers.alert('กรุณาเลือกสถานะ', 'โปรดเลือก TAG สถานะอย่างน้อย 1 รายการก่อนสั่งพิมพ์ PDF', 'warning');
                return;
            }
            const headerColor = this.settings?.category_colors?.group_header || '#007B3E';
            UIHelpers.printReportInNewTab({
                title: `รายงานการลงเวลาปฏิบัติราชการ ${this.settings.organization_name}`,
                subtitle: `สังกัด: ${this.settings.bureau_name} • ${this.#getFormattedReportDateSubtitle()}`,
                tableHtml,
                headerColor
            });
        });

        // ส่งออกไฟล์ Excel UTF-8 (เฉพาะรายการที่อยู่ใน Tag ที่เลือก)
        document.getElementById('btnExportReportExcel')?.addEventListener('click', () => {
            const filtered = this.records.filter(r => this.selectedStatusKeys.has(r.status_category));
            if (filtered.length === 0) {
                UIHelpers.alert('ไม่มีข้อมูลส่งออก', 'ไม่พบรายการใน TAG สถานะที่เลือก', 'warning');
                return;
            }
            const rows = filtered.map((r, idx) => ({
                'ลำดับ': idx + 1,
                'วันที่ปฏิบัติราชการ': r.work_date_thai_full,
                'คำนำหน้า+ชื่อ+นามสกุล': r.full_name,
                'ตำแหน่ง+ระดับ': r.position_full,
                'สำนักงาน/กอง': r.bureau,
                'ส่วน/ฝ่าย': r.division,
                'กลุ่มงาน': r.work_group,
                'เวลาเข้างาน (24 ชม.)': r.check_in_time || '-',
                'เวลาออกงาน (24 ชม.)': r.check_out_time || '-',
                'สถานที่ปฏิบัติงาน': r.check_in_location || '-',
                'สถานะ': r.status_label,
                'หมายเหตุ': r.remark || ''
            }));
            UIHelpers.exportToExcelUTF8(rows, `รายงานลงเวลาปฏิบัติราชการ_${UIHelpers.getTodayISO()}`, 'AttendanceReport');
        });

        document.getElementById('btnTemplateReportExcel')?.addEventListener('click', () => {
            const sample = [{
                'ลำดับ': 1,
                'วันที่ปฏิบัติราชการ': UIHelpers.formatThaiFullDate(UIHelpers.getTodayISO()),
                'คำนำหน้า+ชื่อ+นามสกุล': 'นายสมชาย สายตรวจ',
                'ตำแหน่ง+ระดับ': 'เจ้าพนักงานเทศกิจ ระดับปฏิบัติงาน',
                'สำนักงาน/กอง': 'สำนักเทศกิจ',
                'ส่วน/ฝ่าย': 'กองตรวจและปฏิบัติการพื้นที่ 1',
                'กลุ่มงาน': 'กลุ่มงานตรวจและปฏิบัติการ 1',
                'เวลาเข้างาน (24 ชม.)': '08:15',
                'เวลาออกงาน (24 ชม.)': '16:35',
                'สถานะ': 'ปฏิบัติงานปกติ',
                'หมายเหตุ': ''
            }];
            UIHelpers.exportToExcelUTF8(sample, 'Template_รายงานการลงเวลา', 'Template');
        });

        // Event Delegation สำหรับปุ่มแก้ไขและลบในตารางทั้งหมด
        document.getElementById('reportTablesMasterContainer')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;

            if (action === 'edit-record') {
                const pid = btn.dataset.pid;
                const logId = btn.dataset.logid;
                const workDate = btn.dataset.date;
                const rec = this.records.find(r =>
                    (logId && r.log_id === logId) ||
                    (r.personnel_id === pid && r.work_date === workDate)
                );
                if (rec) this.#openModal(rec);
            } else if (action === 'delete-record') {
                const logId = btn.dataset.logid;
                const name = btn.dataset.name;
                const confirmed = await UIHelpers.confirm(
                    'ยืนยันการลบข้อมูลลงเวลา',
                    `ต้องการลบข้อมูลการลงเวลาของ "${name}" รายการนี้ใช่หรือไม่?`,
                    'ลบรายการ',
                    'warning'
                );
                if (confirmed) {
                    UIHelpers.showLoading('กำลังลบรายการลงเวลา...');
                    const res = await AttendanceModel.deleteAttendanceRecord(logId);
                    UIHelpers.hideLoading();
                    if (res.success) {
                        await this.loadReportData();
                        await UIHelpers.showToast(res.message, 'success', 2500);
                    } else {
                        await UIHelpers.alert('ลบไม่สำเร็จ', res.message, 'error');
                    }
                }
            }
        });
    }

    async #handleSaveReportRecord() {
        const payload = {
            log_id: document.getElementById('repLogId').value || null,
            personnel_id: document.getElementById('repPersonnelSelect').value,
            work_date: document.getElementById('repWorkDate').value,
            check_in_time: UIHelpers.formatTime24(document.getElementById('repCheckinTime').value),
            check_out_time: UIHelpers.formatTime24(document.getElementById('repCheckoutTime').value),
            status: document.getElementById('repStatusSelect').value,
            remark: document.getElementById('repRemarkInput').value
        };

        UIHelpers.showLoading('กำลังบันทึกข้อมูลการลงเวลา...');
        try {
            const res = await AttendanceModel.saveAdminAttendanceRecord(payload);
            UIHelpers.hideLoading();
            if (!res.success) {
                await UIHelpers.alert('บันทึกไม่สำเร็จ', res.message, 'error');
                return;
            }
            this.#closeModal();
            await this.loadReportData();
            await UIHelpers.showToast(res.message, 'success', 2500);
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
        }
    }
}

if (!window.__BMA_SPA_ROUTER_ACTIVE__) {
    window.__BMA_SPA_ROUTER_ACTIVE__ = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new ReportsController());
    } else {
        new ReportsController();
    }
}