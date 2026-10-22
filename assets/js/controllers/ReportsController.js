/**
 * @file assets/js/controllers/ReportsController.js
 * @description คลาสควบคุมหน้ารายงานการลงเวลา (ตาราง Group By 2 มุมมอง, พิมพ์ PDF Tab ใหม่, ส่งออก Excel UTF-8 รองรับ AJAX SPA)
 */

import { UIHelpers } from '../core/UIHelpers.js';
import { AppLayout } from '../components/AppLayout.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { PersonnelModel } from '../models/PersonnelModel.js';
import { AttendanceModel } from '../models/AttendanceModel.js';

export class ReportsController {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.records = [];
        this.groupViewMode = 'division';
        this.colors = {
            header: '#007B3E',
            normal: '#007B3E',
            late: '#F59E0B',
            special: '#6366F1',
            absent: '#E11D48'
        };
        this.init();
    }

    async init() {
        const layout = await AppLayout.initAdminLayout({
            activePage: 'reports',
            pageTitle: 'รายงานการลงเวลาปฏิบัติราชการ',
            pageSubtitle: 'ตารางการลงเวลา 2 มุมมอง พิมพ์รายงาน PDF (เปิดแท็บใหม่) และส่งออกไฟล์ Excel UTF-8'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;
        this.settings = await SettingsModel.getSettings(true);

        const mobileShortcutEl = document.getElementById('reportMobileShortcutContainer');
        if (mobileShortcutEl) {
            mobileShortcutEl.innerHTML = AppLayout.getMobileShortcutGridHtml(this.currentUser);
        }

        const dateInput = document.getElementById('reportDateInput');
        if (dateInput) dateInput.value = UIHelpers.getTodayISO();

        this.#bindEvents();
        await this.loadReportData();
    }

    async loadReportData() {
        const workDate = document.getElementById('reportDateInput')?.value || UIHelpers.getTodayISO();
        const tbody = document.getElementById('reportTableBody');
        if (tbody) {
            tbody.innerHTML = UIHelpers.renderTableSkeleton(6, 7);
        }

        UIHelpers.showLoading('กำลังประมวลผลตารางรายงานการลงเวลา...');
        try {
            this.records = await AttendanceModel.getDailyReportRecords(workDate, this.currentUser);
            this.#populatePersonnelDropdown();
            this.#renderGroupedReportTable(false);
        } finally {
            UIHelpers.hideLoading();
        }
    }

    #populatePersonnelDropdown() {
        const selectEl = document.getElementById('repPersonnelSelect');
        if (!selectEl) return;
        selectEl.innerHTML = this.records.map(r =>
            `<option value="${r.personnel_id}">${r.full_name} (${r.division})</option>`
        ).join('');
    }

    /**
     * สร้างโครงสร้างตารางแสดงการลงเวลาปฏิบัติราชการ Group By 2 มุมมอง
     * คอลัมน์: ลำดับ, คำนำหน้า+ชื่อ+นามสกุล, ตำแหน่ง+ระดับ, เวลาเข้างาน, เวลาออกงาน
     */
    #renderGroupedReportTable(forPrintPdf = false) {
        const grouped = PersonnelModel.groupPersonnel(this.records, this.groupViewMode);
        let rowsHtml = '';
        let runningNo = 1;

        for (const [bureauName, divisionsObj] of Object.entries(grouped)) {
            for (const [divisionName, content] of Object.entries(divisionsObj)) {
                rowsHtml += `
                    <tr class="group-row" style="background-color: ${this.colors.header}18;">
                        <td colspan="${forPrintPdf ? 6 : 7}" class="font-bold text-sm py-2.5 px-4" style="color: ${this.colors.header}; border-left: 4px solid ${this.colors.header};">
                            <i class="fa-solid fa-building-user mr-1.5"></i>${bureauName} &gt; ${divisionName}
                        </td>
                    </tr>
                `;

                if (this.groupViewMode === 'group') {
                    for (const [groupName, members] of Object.entries(content)) {
                        rowsHtml += `
                            <tr class="sub-group-row bg-emerald-950/5 dark:bg-slate-800/50">
                                <td colspan="${forPrintPdf ? 6 : 7}" class="font-semibold text-xs py-2 pl-8 bma-text-main">
                                    กลุ่มงาน: ${groupName} (${members.length} คน)
                                </td>
                            </tr>
                        `;
                        for (const rec of members) {
                            rowsHtml += this.#buildReportRowHtml(rec, runningNo++, forPrintPdf);
                        }
                    }
                } else {
                    for (const rec of content) {
                        rowsHtml += this.#buildReportRowHtml(rec, runningNo++, forPrintPdf);
                    }
                }
            }
        }

        if (forPrintPdf) {
            return `
                <table>
                    <thead>
                        <tr>
                            <th style="width: 50px; text-align: center;">ลำดับ</th>
                            <th>คำนำหน้า + ชื่อ + นามสกุล</th>
                            <th>ตำแหน่ง + ระดับ</th>
                            <th style="width: 95px; text-align: center;">เวลาเข้างาน</th>
                            <th style="width: 95px; text-align: center;">เวลาออกงาน</th>
                            <th style="width: 140px; text-align: center;">สถานะ / หมายเหตุ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            `;
        }

        const tbody = document.getElementById('reportTableBody');
        if (tbody) {
            tbody.innerHTML = rowsHtml || `<tr><td colspan="7" class="text-center py-8 bma-text-sub">ไม่พบข้อมูลในวันที่เลือก</td></tr>`;
        }
        return '';
    }

    #buildReportRowHtml(rec, indexNo, forPrintPdf = false) {
        const badgeColor = this.colors[rec.status_category] || rec.row_color;
        const statusText = rec.remark ? `${rec.status_label} (${rec.remark})` : rec.status_label;

        if (forPrintPdf) {
            return `
                <tr>
                    <td style="text-align: center;">${indexNo}</td>
                    <td>${rec.full_name}</td>
                    <td>${rec.position_full}</td>
                    <td style="text-align: center;">${rec.check_in_time || '-'}</td>
                    <td style="text-align: center;">${rec.check_out_time || '-'}</td>
                    <td style="text-align: center; color: ${badgeColor}; font-weight: 600;">${statusText}</td>
                </tr>
            `;
        }

        return `
            <tr>
                <td class="text-center font-semibold">${indexNo}</td>
                <td class="font-bold bma-text-main">${rec.full_name}</td>
                <td>${rec.position_full}</td>
                <td class="text-center font-mono font-bold">${rec.check_in_time || '-'}</td>
                <td class="text-center font-mono font-bold">${rec.check_out_time || '-'}</td>
                <td class="text-center">
                    <span class="bma-badge text-white shadow-xs" style="background-color: ${badgeColor};">
                        ${rec.status_label}
                    </span>
                    ${rec.remark ? `<div class="text-[11px] bma-text-sub mt-0.5">${rec.remark}</div>` : ''}
                </td>
                <td class="text-center space-x-1 whitespace-nowrap">
                    <button type="button" data-action="edit-record" data-pid="${rec.personnel_id}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500" title="บันทึก/แก้ไขเวลา">
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
        const workDate = document.getElementById('reportDateInput')?.value || UIHelpers.getTodayISO();

        document.getElementById('repLogId').value = rec?.log_id || '';
        if (rec?.personnel_id) {
            document.getElementById('repPersonnelSelect').value = rec.personnel_id;
        }
        document.getElementById('repWorkDate').value = rec?.work_date || workDate;
        document.getElementById('repCheckinTime').value = rec?.check_in_time || '08:30';
        document.getElementById('repCheckoutTime').value = rec?.check_out_time || '16:30';
        document.getElementById('repStatusSelect').value = rec?.status_category === 'late' ? 'สาย' : 'ปกติ';
        document.getElementById('repRowColorPicker').value = rec?.row_color || '#007B3E';
        document.getElementById('repRemarkInput').value = rec?.remark || '';

        modal?.classList.remove('hidden');
    }

    #closeModal() {
        document.getElementById('modalReportAttendance')?.classList.add('hidden');
    }

    #bindEvents() {
        document.getElementById('reportDateInput')?.addEventListener('change', () => this.loadReportData());
        document.getElementById('selectReportGroupBy')?.addEventListener('change', (e) => {
            this.groupViewMode = e.target.value;
            this.#renderGroupedReportTable(false);
        });

        const updateColors = () => {
            this.colors.header = document.getElementById('repColorHeader')?.value || '#007B3E';
            this.colors.normal = document.getElementById('repColorNormal')?.value || '#007B3E';
            this.colors.late = document.getElementById('repColorLate')?.value || '#F59E0B';
            this.colors.absent = document.getElementById('repColorAbsent')?.value || '#E11D48';
            this.#renderGroupedReportTable(false);
        };
        document.getElementById('repColorHeader')?.addEventListener('input', updateColors);
        document.getElementById('repColorNormal')?.addEventListener('input', updateColors);
        document.getElementById('repColorLate')?.addEventListener('input', updateColors);
        document.getElementById('repColorAbsent')?.addEventListener('input', updateColors);

        document.getElementById('btnOpenAddReportRecord')?.addEventListener('click', () => this.#openModal(null));
        document.getElementById('btnCloseReportModal')?.addEventListener('click', () => this.#closeModal());
        document.getElementById('btnCancelReportModal')?.addEventListener('click', () => this.#closeModal());

        document.getElementById('formReportAttendance')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.#handleSaveReportRecord();
        });

        document.getElementById('btnPrintPdfNewTab')?.addEventListener('click', () => {
            const workDate = document.getElementById('reportDateInput')?.value || UIHelpers.getTodayISO();
            const tableHtml = this.#renderGroupedReportTable(true);
            UIHelpers.printReportInNewTab({
                title: `รายงานการลงเวลาปฏิบัติราชการ ${this.settings.organization_name}`,
                subtitle: `สังกัด: ${this.settings.bureau_name} • ประจำวันที่ ${UIHelpers.formatThaiDate(workDate)}`,
                tableHtml,
                headerColor: this.colors.header
            });
        });

        document.getElementById('btnExportReportExcel')?.addEventListener('click', () => {
            const workDate = document.getElementById('reportDateInput')?.value || UIHelpers.getTodayISO();
            const rows = this.records.map((r, idx) => ({
                'ลำดับ': idx + 1,
                'คำนำหน้า+ชื่อ+นามสกุล': r.full_name,
                'ตำแหน่ง+ระดับ': r.position_full,
                'สำนักงาน/กอง': r.bureau,
                'ส่วน/ฝ่าย': r.division,
                'กลุ่มงาน': r.work_group,
                'วันที่': r.work_date,
                'เวลาเข้างาน': r.check_in_time || '-',
                'เวลาออกงาน': r.check_out_time || '-',
                'สถานะ': r.status_label,
                'หมายเหตุ': r.remark || ''
            }));
            UIHelpers.exportToExcelUTF8(rows, `รายงานลงเวลาปฏิบัติราชการ_${workDate}`, 'AttendanceReport');
        });

        document.getElementById('btnTemplateReportExcel')?.addEventListener('click', () => {
            const sample = [{
                'ลำดับ': 1,
                'คำนำหน้า+ชื่อ+นามสกุล': 'นายสมชาย สายตรวจ',
                'ตำแหน่ง+ระดับ': 'เจ้าพนักงานเทศกิจ ระดับปฏิบัติงาน',
                'สำนักงาน/กอง': 'สำนักเทศกิจ',
                'ส่วน/ฝ่าย': 'กองตรวจและปฏิบัติการพื้นที่ 1',
                'กลุ่มงาน': 'กลุ่มงานตรวจและปฏิบัติการ 1',
                'วันที่': UIHelpers.getTodayISO(),
                'เวลาเข้างาน': '08:15',
                'เวลาออกงาน': '16:35',
                'สถานะ': 'ปกติ',
                'หมายเหตุ': ''
            }];
            UIHelpers.exportToExcelUTF8(sample, 'Template_รายงานการลงเวลา', 'Template');
        });

        document.getElementById('reportTableBody')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;

            if (action === 'edit-record') {
                const pid = btn.dataset.pid;
                const rec = this.records.find(r => r.personnel_id === pid);
                if (rec) this.#openModal(rec);
            } else if (action === 'delete-record') {
                const logId = btn.dataset.logid;
                const name = btn.dataset.name;
                const confirmed = await UIHelpers.confirm(
                    'ยืนยันการลบข้อมูลลงเวลา',
                    `ต้องการลบข้อมูลการลงเวลาของ "${name}" ในวันนี้ใช่หรือไม่?`,
                    'ลบรายการ',
                    'warning'
                );
                if (confirmed) {
                    UIHelpers.showLoading('กำลังลบรายการลงเวลา...');
                    const res = await AttendanceModel.deleteAttendanceRecord(logId);
                    UIHelpers.hideLoading();
                    if (res.success) {
                        await this.loadReportData();
                        await UIHelpers.alert('ลบสำเร็จ', res.message, 'success');
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
            check_in_time: document.getElementById('repCheckinTime').value,
            check_out_time: document.getElementById('repCheckoutTime').value,
            status: document.getElementById('repStatusSelect').value,
            row_color: document.getElementById('repRowColorPicker').value,
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
        document.addEventListener('DOMContentLoaded', () => new ReportsController());
    } else {
        new ReportsController();
    }
}