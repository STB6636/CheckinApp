/**
 * @file assets/js/controllers/DashboardController.js
 * @description คลาสควบคุมหน้าแดชบอร์ดผู้ดูแลระบบ (KPI Cards, Progress Fill, Chart.js, Mobile Shortcuts)
 */

import { UIHelpers } from '../core/UIHelpers.js';
import { AppLayout } from '../components/AppLayout.js';
import { AttendanceModel } from '../models/AttendanceModel.js';

export class DashboardController {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.dailyRecords = [];
        this.doughnutChart = null;
        this.barChart = null;
        this.customColors = {
            normal: '#059669',
            late: '#F59E0B',
            special: '#6366F1',
            absent: '#E11D48'
        };
        this.init();
    }

    async init() {
        const layout = await AppLayout.initAdminLayout({
            activePage: 'dashboard',
            pageTitle: 'แดชบอร์ดภาพรวมการลงเวลาปฏิบัติราชการ',
            pageSubtitle: 'สรุปสถิติการปฏิบัติราชการแบบเรียลไทม์ตามขอบเขตการมองเห็น'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;
        this.settings = layout.settings;

        if (this.settings?.category_colors) {
            this.customColors = { ...this.customColors, ...this.settings.category_colors };
        }

        // เรนเดอร์ไอคอนทางลัดสีสไตล์ iPhone สำหรับ Responsive Mobile
        const mobileShortcutEl = document.getElementById('mobileShortcutContainer');
        if (mobileShortcutEl) {
            mobileShortcutEl.innerHTML = AppLayout.getMobileShortcutGridHtml(this.currentUser);
        }

        // ตั้งค่าเริ่มต้นของตัวเลือกวันที่และ Color Picker
        document.getElementById('dashboardDateFilter').value = UIHelpers.getTodayISO();
        document.getElementById('colorPickerNormal').value = this.customColors.normal;
        document.getElementById('colorPickerLate').value = this.customColors.late;
        document.getElementById('colorPickerSpecial').value = this.customColors.special;
        document.getElementById('colorPickerAbsent').value = this.customColors.absent;

        this.#bindEvents();
        await this.loadDashboardData();
    }

    #bindEvents() {
        document.getElementById('dashboardDateFilter')?.addEventListener('change', () => this.loadDashboardData());
        document.getElementById('btnRefreshDashboard')?.addEventListener('click', () => this.loadDashboardData());

        const handleColorChange = () => {
            this.customColors.normal = document.getElementById('colorPickerNormal').value;
            this.customColors.late = document.getElementById('colorPickerLate').value;
            this.customColors.special = document.getElementById('colorPickerSpecial').value;
            this.customColors.absent = document.getElementById('colorPickerAbsent').value;
            this.#renderAllVisuals();
        };

        document.getElementById('colorPickerNormal')?.addEventListener('input', handleColorChange);
        document.getElementById('colorPickerLate')?.addEventListener('input', handleColorChange);
        document.getElementById('colorPickerSpecial')?.addEventListener('input', handleColorChange);
        document.getElementById('colorPickerAbsent')?.addEventListener('input', handleColorChange);

        window.addEventListener('bma:theme-changed', () => {
            this.#renderCharts(AttendanceModel.calculateDashboardMetrics(this.dailyRecords));
        });
    }

    async loadDashboardData() {
        const selectedDate = document.getElementById('dashboardDateFilter')?.value || UIHelpers.getTodayISO();
        const tableBody = document.getElementById('dashboardRecentTableBody');
        if (tableBody) {
            tableBody.innerHTML = UIHelpers.renderTableSkeleton(5, 7);
        }

        UIHelpers.showLoading('กำลังประมวลผลข้อมูลแดชบอร์ด...');
        try {
            this.dailyRecords = await AttendanceModel.getDailyReportRecords(selectedDate, this.currentUser);
            this.#renderAllVisuals();
        } finally {
            UIHelpers.hideLoading();
        }
    }

    #renderAllVisuals() {
        const metrics = AttendanceModel.calculateDashboardMetrics(this.dailyRecords);
        // อัปเดตสีตาม Color Picker
        metrics.categories.forEach(cat => {
            if (this.customColors[cat.key]) {
                cat.color = this.customColors[cat.key];
            }
        });

        this.#renderKpiCards(metrics);
        this.#renderCharts(metrics);
        this.#renderTable();
    }

    /**
     * สร้าง Card แสดงจำนวนทั้งหมด และ Card แยกตามแต่ละประเภท พร้อมหลอด Progress Fill
     */
    #renderKpiCards(metrics) {
        const grid = document.getElementById('dashboardKpiCardsGrid');
        if (!grid) return;

        // การ์ดใบแรก: จำนวนบุคลากรทั้งหมด
        let html = `
            <div class="bma-card p-5 flex flex-col justify-between relative overflow-hidden" style="border-left: 5px solid var(--bma-primary);">
                <div class="flex items-start justify-between">
                    <div>
                        <span class="text-xs font-bold uppercase tracking-wider bma-text-sub">จำนวนบุคลากรทั้งหมด</span>
                        <h3 class="text-3xl font-extrabold bma-text-main mt-1">${metrics.total} <span class="text-sm font-medium bma-text-sub">คน</span></h3>
                    </div>
                    <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow" style="background-color: var(--bma-primary);">
                        <i class="fa-solid fa-users text-lg"></i>
                    </div>
                </div>
                <div class="mt-4">
                    <div class="flex items-center justify-between text-xs font-semibold mb-1">
                        <span class="bma-text-sub">สัดส่วนรวมทั้งหมด</span>
                        <span style="color: var(--bma-primary);">100%</span>
                    </div>
                    <div class="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" style="width: 100%; background-color: var(--bma-primary);"></div>
                    </div>
                </div>
            </div>
        `;

        // การ์ดแยกตามแต่ละประเภท พร้อมเติมสีตามที่กำหนดและ Progress Fill
        for (const cat of metrics.categories) {
            html += `
                <div class="bma-card p-5 flex flex-col justify-between relative overflow-hidden" style="border-left: 5px solid ${cat.color};">
                    <div class="flex items-start justify-between">
                        <div>
                            <span class="text-xs font-bold bma-text-sub">${cat.label}</span>
                            <h3 class="text-3xl font-extrabold bma-text-main mt-1">${cat.count} <span class="text-sm font-medium bma-text-sub">คน</span></h3>
                        </div>
                        <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow" style="background-color: ${cat.color};">
                            <i class="fa-solid ${cat.icon} text-lg"></i>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="flex items-center justify-between text-xs font-semibold mb-1">
                            <span class="bma-text-sub">คิดเป็นร้อยละของทั้งหมด</span>
                            <span style="color: ${cat.color};">${cat.percent}%</span>
                        </div>
                        <div class="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div class="h-full rounded-full transition-all duration-500" style="width: ${cat.percent}%; background-color: ${cat.color};"></div>
                        </div>
                    </div>
                </div>
            `;
        }

        grid.innerHTML = html;
    }

    /**
     * วาดกราฟ Chart.js ทั้ง Doughnut Chart และ Stacked Bar Chart
     */
    #renderCharts(metrics) {
        if (!window.Chart) return;
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#F1F5F9' : '#0F172A';
        const gridColor = isDark ? '#2D3F3A' : '#E2E8F0';

        // 1. Doughnut Chart
        const doughnutCtx = document.getElementById('attendanceDoughnutChart')?.getContext('2d');
        if (doughnutCtx) {
            if (this.doughnutChart) this.doughnutChart.destroy();
            this.doughnutChart = new window.Chart(doughnutCtx, {
                type: 'doughnut',
                data: {
                    labels: metrics.categories.map(c => c.label),
                    datasets: [{
                        data: metrics.categories.map(c => c.count),
                        backgroundColor: metrics.categories.map(c => c.color),
                        borderWidth: 2,
                        borderColor: isDark ? '#1A2522' : '#FFFFFF'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, font: { family: 'Sarabun', size: 12 } }
                        }
                    }
                }
            });
        }

        // 2. Division Bar Chart
        const barCtx = document.getElementById('divisionBarChart')?.getContext('2d');
        if (barCtx) {
            if (this.barChart) this.barChart.destroy();
            const divisionNames = Object.keys(metrics.divisionBreakdown);
            this.barChart = new window.Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: divisionNames,
                    datasets: [
                        {
                            label: 'ปกติ',
                            data: divisionNames.map(d => metrics.divisionBreakdown[d].normal),
                            backgroundColor: this.customColors.normal,
                            borderRadius: 6
                        },
                        {
                            label: 'มาสาย',
                            data: divisionNames.map(d => metrics.divisionBreakdown[d].late),
                            backgroundColor: this.customColors.late,
                            borderRadius: 6
                        },
                        {
                            label: 'กรณีพิเศษ',
                            data: divisionNames.map(d => metrics.divisionBreakdown[d].special),
                            backgroundColor: this.customColors.special,
                            borderRadius: 6
                        },
                        {
                            label: 'ยังไม่ลงเวลา',
                            data: divisionNames.map(d => metrics.divisionBreakdown[d].absent),
                            backgroundColor: this.customColors.absent,
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: { color: textColor, font: { family: 'Sarabun' } },
                            grid: { color: gridColor }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, color: textColor, font: { family: 'Sarabun' } },
                            grid: { color: gridColor }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, font: { family: 'Sarabun', size: 12 } }
                        }
                    }
                }
            });
        }
    }

    #renderTable() {
        const tbody = document.getElementById('dashboardRecentTableBody');
        if (!tbody) return;

        if (this.dailyRecords.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 bma-text-sub">ไม่พบข้อมูลบุคลากรในขอบเขตการมองเห็น</td></tr>`;
            return;
        }

        tbody.innerHTML = this.dailyRecords.map((rec, idx) => {
            const color = this.customColors[rec.status_category] || rec.row_color;
            return `
                <tr>
                    <td class="font-semibold">${idx + 1}</td>
                    <td class="font-semibold bma-text-main">${rec.full_name}</td>
                    <td>${rec.position_full}</td>
                    <td class="text-xs bma-text-sub">${rec.bureau} > ${rec.division}</td>
                    <td class="font-mono font-semibold">${rec.check_in_time || '-'}</td>
                    <td class="font-mono font-semibold">${rec.check_out_time || '-'}</td>
                    <td>
                        <span class="bma-badge text-white" style="background-color: ${color};">
                            ${rec.status_label}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DashboardController();
});