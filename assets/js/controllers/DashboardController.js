/**
 * @file assets/js/controllers/DashboardController.js
 * @description คลาสควบคุมหน้า "ภาพรวม" (แสดง Jewel-Tone Stat Cards, Progress Fill, ตารางสถานะรายบุคคล และ Mobile Shortcuts)
 */

import { UIHelpers } from '../core/UIHelpers.js';
import { AppLayout } from '../components/AppLayout.js';
import { AttendanceModel } from '../models/AttendanceModel.js';

export class DashboardController {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.dailyRecords = [];
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
            pageTitle: 'ภาพรวม',
            pageSubtitle: 'สรุปสถิติการลงเวลาปฏิบัติราชการประจำวันตามขอบเขตการมองเห็น'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;
        this.settings = layout.settings;

        // เรนเดอร์ไอคอนทางลัดสีสไตล์ iPhone สำหรับ Responsive Mobile
        const mobileShortcutEl = document.getElementById('mobileShortcutContainer');
        if (mobileShortcutEl) {
            mobileShortcutEl.innerHTML = AppLayout.getMobileShortcutGridHtml(this.currentUser);
        }

        // ตั้งค่าเริ่มต้นของตัวเลือกวันที่และ Color Picker
        const dateFilterEl = document.getElementById('dashboardDateFilter');
        if (dateFilterEl) dateFilterEl.value = UIHelpers.getTodayISO();

        const cpNormal = document.getElementById('colorPickerNormal');
        const cpLate = document.getElementById('colorPickerLate');
        const cpSpecial = document.getElementById('colorPickerSpecial');
        const cpAbsent = document.getElementById('colorPickerAbsent');

        if (cpNormal) cpNormal.value = this.customColors.normal;
        if (cpLate) cpLate.value = this.customColors.late;
        if (cpSpecial) cpSpecial.value = this.customColors.special;
        if (cpAbsent) cpAbsent.value = this.customColors.absent;

        this.#bindEvents();
        await this.loadDashboardData();
    }

    #bindEvents() {
        document.getElementById('dashboardDateFilter')?.addEventListener('change', () => this.loadDashboardData());
        document.getElementById('btnRefreshDashboard')?.addEventListener('click', () => this.loadDashboardData());

        const handleColorChange = () => {
            this.customColors.normal = document.getElementById('colorPickerNormal')?.value || '#007B3E';
            this.customColors.late = document.getElementById('colorPickerLate')?.value || '#F59E0B';
            this.customColors.special = document.getElementById('colorPickerSpecial')?.value || '#6366F1';
            this.customColors.absent = document.getElementById('colorPickerAbsent')?.value || '#E11D48';

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
    }

    async loadDashboardData() {
        const selectedDate = document.getElementById('dashboardDateFilter')?.value || UIHelpers.getTodayISO();
        const tableBody = document.getElementById('dashboardRecentTableBody');
        if (tableBody) {
            tableBody.innerHTML = UIHelpers.renderTableSkeleton(5, 7);
        }

        UIHelpers.showLoading('กำลังโหลดข้อมูลหน้าภาพรวม...');
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
        this.#renderTable();
    }

    /**
     * สร้าง Jewel-Tone Stat Cards พร้อมวงกลมเรืองแสง .deco-1, .deco-2 และหลอด Progress Fill
     */
    #renderJewelToneStatCards(metrics) {
        const grid = document.getElementById('dashboardKpiCardsGrid');
        if (!grid) return;

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

// รันอัตโนมัติเฉพาะเมื่อเปิดไฟล์หน้านี้โดยตรง (หากสลับผ่าน AJAX SPA ระบบ AppLayout จะเป็นผู้เรียก new DashboardController() เอง)
if (!window.__BMA_SPA_ROUTER_ACTIVE__) {
    window.__BMA_SPA_ROUTER_ACTIVE__ = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new DashboardController());
    } else {
        new DashboardController();
    }
}