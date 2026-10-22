/**
 * @file assets/js/controllers/DashboardController.js
 * @description คลาสควบคุมหน้าแดชบอร์ดผู้ดูแลระบบ (Jewel-Tone Stat Cards .deco-1/.deco-2, Progress Fill, Chart.js, Mobile Shortcuts)
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
            normal: '#007B3E',
            late: '#F59E0B',
            special: '#6366F1',
            absent: '#E11D48'
        };
        this.customGradients = {
            normal: 'linear-gradient(135deg, #007B3E 0%, #4EBA6F 100%)',
            late: 'linear-gradient(135deg, #F59E0B 0%, #FB923C 100%)',
            special: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            absent: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)'
        };
        this.init();
    }

    async init() {
        const layout = await AppLayout.initAdminLayout({
            activePage: 'dashboard',
            pageTitle: 'แดชบอร์ดภาพรวมการลงเวลาปฏิบัติราชการ',
            pageSubtitle: 'สรุปสถิติการปฏิบัติราชการแบบเรียลไทม์ตามขอบเขตการมองเห็น (BMA Green Emerald Theme)'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;
        this.settings = layout.settings;

        // เรนเดอร์ไอคอนทางลัดสีสไตล์ iPhone สำหรับ Responsive Mobile
        const mobileShortcutEl = document.getElementById('mobileShortcutContainer');
        if (mobileShortcutEl) {
            mobileShortcutEl.innerHTML = AppLayout.getMobileShortcutGridHtml(this.currentUser);
        }

        // ตั้งค่าเริ่มต้นของตัวเลือกวันที่และ Color Picker ตามโทนสี portal.css
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

            this.customGradients.normal = `linear-gradient(135deg, ${this.customColors.normal} 0%, #4EBA6F 100%)`;
            this.customGradients.late = `linear-gradient(135deg, ${this.customColors.late} 0%, #FB923C 100%)`;
            this.customGradients.special = `linear-gradient(135deg, ${this.customColors.special} 0%, #8B5CF6 100%)`;
            this.customGradients.absent = `linear-gradient(135deg, ${this.customColors.absent} 0%, #F43F5E 100%)`;

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
        metrics.categories.forEach(cat => {
            if (this.customColors[cat.key]) {
                cat.color = this.customColors[cat.key];
            }
        });

        this.#renderJewelToneStatCards(metrics);
        this.#renderCharts(metrics);
        this.#renderTable();
    }

    /**
     * สร้าง Jewel-Tone Stat Cards พร้อมวงกลมเรืองแสง .deco-1, .deco-2 และหลอด Progress Fill แบบ Glassmorphism
     */
    #renderJewelToneStatCards(metrics) {
        const grid = document.getElementById('dashboardKpiCardsGrid');
        if (!grid) return;

        // 1. การ์ดแสดงจำนวนบุคลากรทั้งหมด (Deep Emerald Gradient)
        let html = `
            <div class="stat-card stat-card-total">
                <div class="deco-1"></div>
                <div class="deco-2"></div>
                <div class="stat-content flex flex-col justify-between h-full">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-emerald-100/90">จำนวนบุคลากรทั้งหมด</span>
                            <h3 class="text-3xl font-extrabold text-white mt-1">${metrics.total} <span class="text-sm font-semibold text-emerald-100">คน</span></h3>
                        </div>
                        <div class="stat-icon-box">
                            <i class="fa-solid fa-users"></i>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="flex items-center justify-between text-xs font-bold text-emerald-100 mb-1">
                            <span>ฐานข้อมูลในสังกัด</span>
                            <span class="text-[#FDD835]">100%</span>
                        </div>
                        <div class="stat-progress-track">
                            <div class="stat-progress-fill" style="width: 100%; background: #FDD835;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 2. การ์ดสถิติ 4 ประเภทหลักแบบ Jewel-Tone Stat Cards
        for (const cat of metrics.categories) {
            const bgGradient = this.customGradients[cat.key] || `linear-gradient(135deg, ${cat.color}, ${cat.color})`;
            html += `
                <div class="stat-card" style="background: ${bgGradient};">
                    <div class="deco-1"></div>
                    <div class="deco-2"></div>
                    <div class="stat-content flex flex-col justify-between h-full">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <span class="text-xs font-bold text-white/90">${cat.label}</span>
                                <h3 class="text-3xl font-extrabold text-white mt-1">${cat.count} <span class="text-sm font-semibold text-white/85">คน</span></h3>
                            </div>
                            <div class="stat-icon-box">
                                <i class="fa-solid ${cat.icon}"></i>
                            </div>
                        </div>
                        <div class="mt-4">
                            <div class="flex items-center justify-between text-xs font-bold text-white/90 mb-1">
                                <span>สัดส่วนของทั้งหมด</span>
                                <span>${cat.percent}%</span>
                            </div>
                            <div class="stat-progress-track">
                                <div class="stat-progress-fill" style="width: ${cat.percent}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        grid.innerHTML = html;
    }

    /**
     * วาดกราฟ Chart.js ทั้ง Doughnut Chart และ Bar Chart
     */
    #renderCharts(metrics) {
        if (!window.Chart) return;
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#F1F5F9' : '#0F172A';
        const gridColor = isDark ? '#2B3645' : '#d8e6dd';

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
                        borderColor: isDark ? '#161B22' : '#FFFFFF'
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
                    <td class="font-semibold text-center">${idx + 1}</td>
                    <td class="font-bold bma-text-main">${rec.full_name}</td>
                    <td>${rec.position_full}</td>
                    <td class="text-xs bma-text-sub">${rec.bureau} &gt; ${rec.division}</td>
                    <td class="font-mono font-bold text-center">${rec.check_in_time || '-'}</td>
                    <td class="font-mono font-bold text-center">${rec.check_out_time || '-'}</td>
                    <td class="text-center">
                        <span class="bma-badge text-white shadow-xs" style="background-color: ${color};">
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