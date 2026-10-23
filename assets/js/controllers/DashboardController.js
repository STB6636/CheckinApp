/**
 * @file assets/js/controllers/DashboardController.js
 * @description คลาสควบคุมหน้า "ภาพรวม" (แก้สีการ์ดบุคลากรทั้งหมด, แก้ตารางโหลดค้าง และแจ้ง "ไม่พบผู้ลงเวลาปฏิบัติงาน" เมื่อยังไม่มีข้อมูล)
 */

import { Config } from '../core/Config.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { AppLayout } from '../components/AppLayout.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { AttendanceModel } from '../models/AttendanceModel.js';

export class DashboardController {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.dailyRecords = [];
        this.init();
    }

    async init() {
        const layout = await AppLayout.initAdminLayout({
            activePage: 'dashboard',
            pageTitle: 'ภาพรวม',
            pageSubtitle: 'สรุปสถิติการปฏิบัติราชการประจำวันตามขอบเขตการมองเห็น'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;
        this.settings = layout.settings || await SettingsModel.getSettings(false);

        const mobileShortcutEl = document.getElementById('mobileShortcutContainer');
        if (mobileShortcutEl) {
            mobileShortcutEl.innerHTML = AppLayout.getMobileShortcutGridHtml(this.currentUser);
        }

        const todayIso = UIHelpers.getTodayISO();
        const dateFilterEl = document.getElementById('dashboardDateFilter');
        if (dateFilterEl) dateFilterEl.value = todayIso;

        const thaiBadge = document.getElementById('dashboardThaiDateBadge');
        if (thaiBadge) thaiBadge.textContent = UIHelpers.formatThaiShortDate(todayIso);

        this.#bindEvents();
        await this.loadDashboardData();
    }

    #bindEvents() {
        document.getElementById('dashboardDateFilter')?.addEventListener('change', (e) => {
            const thaiBadge = document.getElementById('dashboardThaiDateBadge');
            if (thaiBadge) thaiBadge.textContent = UIHelpers.formatThaiShortDate(e.target.value);
            this.loadDashboardData();
        });

        document.getElementById('btnRefreshDashboard')?.addEventListener('click', () => this.loadDashboardData());
    }

    async loadDashboardData() {
        const selectedDate = document.getElementById('dashboardDateFilter')?.value || UIHelpers.getTodayISO();
        const tableBody = document.getElementById('dashboardRecentTableBody');
        if (tableBody) {
            tableBody.innerHTML = UIHelpers.renderTableSkeleton(4, 7);
        }

        UIHelpers.showLoading('กำลังโหลดข้อมูลหน้าภาพรวม...');
        try {
            this.settings = await SettingsModel.getSettings(false);
            this.dailyRecords = await AttendanceModel.getDailyReportRecords(selectedDate, this.currentUser);
            this.#renderAllVisuals();
        } catch (err) {
            console.error('Load dashboard error:', err);
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-rose-500 font-bold">เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณากดอัปเดตข้อมูลอีกครั้ง</td></tr>`;
            }
        } finally {
            UIHelpers.hideLoading();
        }
    }

    #renderAllVisuals() {
        const metrics = AttendanceModel.calculateDashboardMetrics(this.dailyRecords);
        const colors = {
            ...Config.DEFAULT_SETTINGS.category_colors,
            ...(this.settings?.category_colors || {})
        };

        metrics.categories.forEach(cat => {
            if (colors[cat.key]) {
                cat.color = colors[cat.key];
            }
        });

        this.#renderJewelToneStatCards(metrics, colors);
        this.#renderTable(colors);
    }

    /**
     * เรนเดอร์การ์ดสถิติทั้ง 5 ใบ โดยการ์ด "บุคลากรทั้งหมด" ใช้ Inline Gradient สีเขียวมรกตเข้มชัดเจน ไม่เป็นสีใส
     */
    #renderJewelToneStatCards(metrics, colors) {
        const grid = document.getElementById('dashboardKpiCardsGrid');
        if (!grid) return;

        const cardGradients = {
            normal: `linear-gradient(135deg, ${colors.normal || '#007B3E'} 0%, #22C55E 100%)`,
            late: `linear-gradient(135deg, ${colors.late || '#EAB308'} 0%, #F59E0B 100%)`,
            absent_duty: `linear-gradient(135deg, ${colors.absent_duty || '#EA580C'} 0%, #F97316 100%)`,
            overtime: `linear-gradient(135deg, ${colors.overtime || '#2563EB'} 0%, #3B82F6 100%)`
        };

        // 1. การ์ด "บุคลากรทั้งหมด" (กำหนด Inline Style สีเขียวมรกตเข้มหลวง BMA ตัดกับสีทองเทศกิจ)
        let html = `
            <div class="stat-card stat-card-total" style="background: linear-gradient(135deg, #00351B 0%, #005B2E 52%, #007B3E 100%); color: #FFFFFF;">
                <div class="deco-1"></div>
                <div class="deco-2"></div>
                <div class="stat-content flex flex-col justify-between h-full">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-emerald-100">บุคลากรทั้งหมด</span>
                            <h3 class="text-3xl font-extrabold text-white mt-1">${metrics.total} <span class="text-sm font-semibold text-emerald-100">คน</span></h3>
                        </div>
                        <div class="stat-icon-box">
                            <i class="fa-solid fa-users text-[#FDD835]"></i>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="flex items-center justify-between text-xs font-bold text-emerald-100 mb-1">
                            <span>สัดส่วนรวม</span>
                            <span class="text-[#FDD835]">100%</span>
                        </div>
                        <div class="stat-progress-track">
                            <div class="stat-progress-fill" style="width: 100%; background: #FDD835;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 2. การ์ดสถานะทั้ง 4 หมวดหมู่หลัก
        for (const cat of metrics.categories) {
            const bgGradient = cardGradients[cat.key] || `linear-gradient(135deg, ${cat.color}, ${cat.color})`;
            html += `
                <div class="stat-card" style="background: ${bgGradient}; color: #FFFFFF;">
                    <div class="deco-1"></div>
                    <div class="deco-2"></div>
                    <div class="stat-content flex flex-col justify-between h-full">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <span class="text-xs font-bold text-white/95">${cat.label}</span>
                                <h3 class="text-3xl font-extrabold text-white mt-1">${cat.count} <span class="text-sm font-semibold text-white/90">คน</span></h3>
                            </div>
                            <div class="stat-icon-box">
                                <i class="fa-solid ${cat.icon}"></i>
                            </div>
                        </div>
                        <div class="mt-4">
                            <div class="flex items-center justify-between text-xs font-bold text-white/95 mb-1">
                                <span>คิดเป็นร้อยละ</span>
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
     * เรนเดอร์ตารางรายการสถานะการลงเวลาปฏิบัติราชการรายบุคคล
     * กรณียังไม่มีผู้ลงเวลาในวันนั้น ให้แจ้งว่า "ไม่พบผู้ลงเวลาปฏิบัติงาน"
     */
    #renderTable(colors) {
        const tbody = document.getElementById('dashboardRecentTableBody');
        if (!tbody) return;

        // กรองเฉพาะผู้ที่มีการลงเวลาปฏิบัติงานแล้วในวันนั้น (log_id !== null)
        const checkedInRecords = (this.dailyRecords || []).filter(rec => Boolean(rec.log_id));

        if (checkedInRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-10 bma-text-sub font-bold text-sm">
                        <i class="fa-regular fa-calendar-xmark text-2xl mb-2 block text-emerald-700/60"></i>
                        ไม่พบผู้ลงเวลาปฏิบัติงาน
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = checkedInRecords.map((rec, idx) => {
            const color = colors[rec.status_category] || rec.row_color || '#007B3E';
            return `
                <tr>
                    <td class="font-semibold text-center">${idx + 1}</td>
                    <td class="font-bold bma-text-main">${rec.full_name}</td>
                    <td>${rec.position_full}</td>
                    <td class="text-xs bma-text-sub">${rec.bureau} &gt; ${rec.division}</td>
                    <td class="font-mono font-bold text-center">${rec.check_in_time ? rec.check_in_time + ' น.' : '-'}</td>
                    <td class="font-mono font-bold text-center">${rec.check_out_time ? rec.check_out_time + ' น.' : '-'}</td>
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

if (!window.__BMA_SPA_ROUTER_ACTIVE__) {
    window.__BMA_SPA_ROUTER_ACTIVE__ = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new DashboardController());
    } else {
        new DashboardController();
    }
}