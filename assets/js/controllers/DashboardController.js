/**
 * @file assets/js/controllers/DashboardController.js
 * @description คลาสควบคุมหน้า "ภาพรวม" (แสดง 5 รายการล่าสุด + Pagination [5,10,15,20], คอลัมน์สังกัด 2 บรรทัด, และปรับขนาดคอลัมน์พอดีข้อมูล)
 */

import { Config } from '../core/Config.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { AppLayout } from '../components/AppLayout.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { AttendanceModel } from '../models/AttendanceModel.js';
import { DOMDiffHelper } from '../utils/DOMDiffHelper.js';

export class DashboardController {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.dailyRecords = [];
        this.checkedInRecords = [];
        this.pageSize = 5; // ค่าเริ่มต้นแสดง 5 รายการล่าสุด
        this.currentPage = 1;
        this.lastMetrics = null;
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
        const triggerDebouncedSync = () => {
            if (this._realtimeDebounceTimer) clearTimeout(this._realtimeDebounceTimer);
            this._realtimeDebounceTimer = setTimeout(() => {
                this.loadDashboardData(true);
            }, 250);
        };
        window.addEventListener('bma:realtime-delta-sync', triggerDebouncedSync);
        window.addEventListener('bma:realtime-sync', triggerDebouncedSync);
        document.getElementById('dashboardDateFilter')?.addEventListener('change', (e) => {
            const thaiBadge = document.getElementById('dashboardThaiDateBadge');
            if (thaiBadge) thaiBadge.textContent = UIHelpers.formatThaiShortDate(e.target.value);
            this.currentPage = 1;
        this.lastMetrics = null;
            this.loadDashboardData();
        });

        document.getElementById('btnRefreshDashboard')?.addEventListener('click', () => {
            this.currentPage = 1;
        this.lastMetrics = null;
            this.loadDashboardData();
        });

        // ตัวเลือกจำนวนรายการต่อหน้า [5, 10, 15, 20]
        document.getElementById('dashboardPageSizeSelect')?.addEventListener('change', (e) => {
            this.pageSize = parseInt(e.target.value, 10) || 5;
            this.currentPage = 1;
        this.lastMetrics = null;
            const colors = {
                ...Config.DEFAULT_SETTINGS.category_colors,
                ...(this.settings?.category_colors || {})
            };
            this.#renderTable(colors);
        });

        // ปุ่มหน้าก่อนหน้า / หน้าถัดไป
        document.getElementById('btnDashboardPrevPage')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                const colors = {
                    ...Config.DEFAULT_SETTINGS.category_colors,
                    ...(this.settings?.category_colors || {})
                };
                this.#renderTable(colors);
            }
        });

        document.getElementById('btnDashboardNextPage')?.addEventListener('click', () => {
            const totalPages = Math.max(1, Math.ceil(this.checkedInRecords.length / this.pageSize));
            if (this.currentPage < totalPages) {
                this.currentPage++;
                const colors = {
                    ...Config.DEFAULT_SETTINGS.category_colors,
                    ...(this.settings?.category_colors || {})
                };
                this.#renderTable(colors);
            }
        });
    }

    async loadDashboardData(silent = false) {
        const selectedDate = document.getElementById('dashboardDateFilter')?.value || UIHelpers.getTodayISO();
        const tableBody = document.getElementById('dashboardRecentTableBody');
        const cardsContainer = document.getElementById('dashboardRecentCardsContainer');
        if (!silent) {
            if (tableBody) {
                tableBody.innerHTML = UIHelpers.renderTableSkeleton(5, 7);
            }
            if (cardsContainer) {
                cardsContainer.innerHTML = this.#renderMobileCardsSkeleton(3);
            }
            UIHelpers.showLoading('กำลังโหลดข้อมูลหน้าภาพรวม...');
        }

        try {
            this.settings = await SettingsModel.getSettings(false);
            const freshRecords = await AttendanceModel.getDailyReportRecords(selectedDate, this.currentUser);

            // กรองเฉพาะผู้ที่ลงเวลาปฏิบัติงานแล้ว และเรียงลำดับรายการล่าสุดขึ้นก่อน
            const freshCheckedIn = (freshRecords || [])
                .filter(rec => Boolean(rec.log_id))
                .sort((a, b) => {
                    const timeB = b.updated_at || b.created_at;
                    const timeA = a.updated_at || a.created_at;
                    if (timeB && timeA) {
                        const diff = new Date(timeB) - new Date(timeA);
                        if (diff !== 0) return diff;
                    }
                    const checkOutDiff = (b.check_out_time || '').localeCompare(a.check_out_time || '');
                    if (checkOutDiff !== 0) return checkOutDiff;
                    return (b.check_in_time || '').localeCompare(a.check_in_time || '');
                });

            const oldMetrics = this.lastMetrics;
            const newMetrics = AttendanceModel.calculateDashboardMetrics(freshRecords);
            const colors = {
                ...Config.DEFAULT_SETTINGS.category_colors,
                ...(this.settings?.category_colors || {})
            };

            newMetrics.categories.forEach(cat => {
                if (colors[cat.key]) {
                    cat.color = colors[cat.key];
                }
            });

            this.dailyRecords = freshRecords;
            this.checkedInRecords = freshCheckedIn;

            if (silent && oldMetrics) {
                this.#updateKpiMetricsDifferentially(oldMetrics, newMetrics);
                this.#syncRecentTableDifferentially(colors);
            } else {
                this.#renderJewelToneStatCards(newMetrics, colors);
                this.#renderTable(colors);
            }
            this.lastMetrics = newMetrics;
        } catch (err) {
            console.error('Load dashboard error:', err);
            if (!silent && tableBody) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-rose-500 font-bold">เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณากดอัปเดตข้อมูลอีกครั้ง</td></tr>`;
            }
            if (!silent && cardsContainer) {
                cardsContainer.innerHTML = `<div class="rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800/60 p-6 text-center text-xs font-bold text-rose-600 dark:text-rose-400 shadow-xs">เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณากดอัปเดตข้อมูลอีกครั้ง</div>`;
            }
        } finally {
            if (!silent) {
                UIHelpers.hideLoading();
            }
        }
    }

    #updateKpiMetricsDifferentially(oldMetrics, newMetrics) {
        if (!oldMetrics || !newMetrics) return;

        if (oldMetrics.total !== newMetrics.total) {
            const totalEl = document.querySelector('[data-stat-key="total"]');
            if (totalEl) {
                DOMDiffHelper.animateNumericValue(totalEl, oldMetrics.total, newMetrics.total);
            }
        }

        const oldCatMap = new Map((oldMetrics.categories || []).map(c => [c.key, c]));
        for (const newCat of (newMetrics.categories || [])) {
            const oldCat = oldCatMap.get(newCat.key);
            const oldVal = oldCat ? oldCat.count : 0;
            if (oldVal !== newCat.count) {
                const countEl = document.querySelector(`[data-stat-key="${newCat.key}"]`);
                if (countEl) {
                    DOMDiffHelper.animateNumericValue(countEl, oldVal, newCat.count);
                }
            }

            const percentEl = document.querySelector(`.stat-percent[data-stat-key="${newCat.key}"]`);
            if (percentEl) {
                percentEl.textContent = `${newCat.percent}%`;
            }
            const barEl = document.querySelector(`.stat-progress-fill[data-progress-key="${newCat.key}"]`);
            if (barEl) {
                barEl.style.width = `${newCat.percent}%`;
            }
        }
    }

    #syncRecentTableDifferentially(colors) {
        const tbody = document.getElementById('dashboardRecentTableBody');
        const cardsContainer = document.getElementById('dashboardRecentCardsContainer');
        if (!tbody && !cardsContainer) return;

        const totalItems = this.checkedInRecords.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
        const pageInfoEl = document.getElementById('dashboardPageInfoText');
        const btnPrev = document.getElementById('btnDashboardPrevPage');
        const btnNext = document.getElementById('btnDashboardNextPage');

        if (pageInfoEl) {
            pageInfoEl.textContent = `หน้า ${this.currentPage} / ${totalPages} (รวม ${totalItems} รายการ)`;
        }
        if (btnPrev) btnPrev.disabled = this.currentPage <= 1;
        if (btnNext) btnNext.disabled = this.currentPage >= totalPages;

        if (totalItems === 0) {
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center py-10 bma-text-sub font-bold text-sm">
                            <i class="fa-regular fa-calendar-xmark text-2xl mb-2 block text-emerald-700/60"></i>
                            ไม่พบผู้ลงเวลาปฏิบัติงาน
                        </td>
                    </tr>
                `;
            }
            if (cardsContainer) {
                cardsContainer.innerHTML = this.#renderEmptyCardsHtml();
            }
            return;
        }

        if (this.currentPage === 1) {
            const targetPaged = this.checkedInRecords.slice(0, this.pageSize);

            if (tbody) {
                const existingRows = Array.from(tbody.querySelectorAll('tr[data-row-id]'));
                const existingIds = new Set(existingRows.map(r => r.getAttribute('data-row-id')));
                const newRecordsToPrepend = targetPaged.filter(rec => !existingIds.has(String(rec.log_id)));

                if (newRecordsToPrepend.length > 0) {
                    const placeholder = tbody.querySelector('td[colspan="7"]');
                    if (placeholder) tbody.innerHTML = '';

                    for (let i = newRecordsToPrepend.length - 1; i >= 0; i--) {
                        const rec = newRecordsToPrepend[i];
                        const rowHtml = this.#buildDashboardRowHtml(rec, 1, colors);
                        DOMDiffHelper.prependRowWithAnimation(tbody, rowHtml);
                    }

                    while (tbody.children.length > this.pageSize) {
                        tbody.lastElementChild.remove();
                    }

                    DOMDiffHelper.reindexTableSequence(tbody, '.seq-num', 1);
                }

                for (const rec of targetPaged) {
                    const rowEl = tbody.querySelector(`tr[data-row-id="${rec.log_id}"]`);
                    if (rowEl) {
                        const cells = rowEl.querySelectorAll('td');
                        let isUpdated = false;
                        if (cells[4]) {
                            const newIn = rec.check_in_time ? rec.check_in_time + ' น.' : '-';
                            if (cells[4].textContent.trim() !== newIn) {
                                cells[4].textContent = newIn;
                                isUpdated = true;
                            }
                        }
                        if (cells[5]) {
                            const newOut = rec.check_out_time ? rec.check_out_time + ' น.' : '-';
                            if (cells[5].textContent.trim() !== newOut) {
                                cells[5].textContent = newOut;
                                isUpdated = true;
                            }
                        }
                        if (cells[6]) {
                            const color = colors[rec.status_category] || rec.row_color || '#007B3E';
                            const badge = cells[6].querySelector('.bma-badge');
                            if (badge && (badge.textContent.trim() !== rec.status_label || badge.style.backgroundColor !== color)) {
                                badge.textContent = rec.status_label;
                                badge.style.backgroundColor = color;
                                isUpdated = true;
                            }
                        }
                        if (isUpdated) {
                            DOMDiffHelper.highlightRowUpdate(rowEl);
                        }
                    }
                }
            }

            if (cardsContainer) {
                const existingCards = Array.from(cardsContainer.querySelectorAll('[data-card-id]'));
                const existingCardIds = new Set(existingCards.map(c => c.getAttribute('data-card-id')));
                const newCardRecs = targetPaged.filter(rec => !existingCardIds.has(String(rec.log_id)));

                if (newCardRecs.length > 0) {
                    for (let i = newCardRecs.length - 1; i >= 0; i--) {
                        const rec = newCardRecs[i];
                        const cardHtml = this.#buildDashboardCardHtml(rec, 1);
                        DOMDiffHelper.prependCardWithAnimation(cardsContainer, cardHtml);
                    }

                    while (cardsContainer.children.length > this.pageSize) {
                        cardsContainer.lastElementChild.remove();
                    }

                    DOMDiffHelper.reindexCardSequence(cardsContainer, '[data-card-item]', '.seq-num', 1);
                }

                for (const rec of targetPaged) {
                    const cardEl = cardsContainer.querySelector(`[data-card-id="${rec.log_id}"]`);
                    if (cardEl) {
                        let cardUpdated = false;
                        const inEl = cardEl.querySelector('[data-field="check-in"]');
                        if (inEl) {
                            const newIn = rec.check_in_time ? `${rec.check_in_time} น.` : '-';
                            if (inEl.textContent.trim() !== newIn) {
                                inEl.textContent = newIn;
                                cardUpdated = true;
                            }
                        }
                        const outEl = cardEl.querySelector('[data-field="check-out"]');
                        if (outEl) {
                            const newOut = rec.check_out_time ? `${rec.check_out_time} น.` : '-';
                            if (outEl.textContent.trim() !== newOut) {
                                outEl.textContent = newOut;
                                cardUpdated = true;
                            }
                        }
                        const statusEl = cardEl.querySelector('[data-field="status"]');
                        if (statusEl) {
                            const newLabel = rec.status_label || '-';
                            const nextClass = `font-extrabold text-right ${this.#getStatusTextClass(rec.status_category)}`;
                            if (statusEl.textContent.trim() !== newLabel || statusEl.className !== nextClass) {
                                statusEl.textContent = newLabel;
                                statusEl.className = nextClass;
                                cardUpdated = true;
                            }
                        }
                        if (cardUpdated) {
                            DOMDiffHelper.highlightRowUpdate(cardEl);
                        }
                    }
                }
            }
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

    #renderJewelToneStatCards(metrics, colors) {
        const grid = document.getElementById('dashboardKpiCardsGrid');
        if (!grid) return;

        const cardGradients = {
            normal: `linear-gradient(135deg, ${colors.normal || '#007B3E'} 0%, #22C55E 100%)`,
            late: `linear-gradient(135deg, ${colors.late || '#EAB308'} 0%, #F59E0B 100%)`,
            absent_duty: `linear-gradient(135deg, ${colors.absent_duty || '#EA580C'} 0%, #F97316 100%)`,
            overtime: `linear-gradient(135deg, ${colors.overtime || '#2563EB'} 0%, #3B82F6 100%)`
        };

        let html = `
            <div class="stat-card stat-card-total" style="background: linear-gradient(135deg, #00351B 0%, #005B2E 52%, #007B3E 100%); color: #FFFFFF;">
                <div class="deco-1"></div>
                <div class="deco-2"></div>
                <div class="stat-content flex flex-col justify-between h-full">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-emerald-100">บุคลากรทั้งหมด</span>
                            <h3 class="text-3xl font-extrabold text-white mt-1"><span class="stat-num" data-stat-key="total">${metrics.total}</span> <span class="text-sm font-semibold text-emerald-100">คน</span></h3>
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
                                <h3 class="text-3xl font-extrabold text-white mt-1"><span class="stat-num" data-stat-key="${cat.key}">${cat.count}</span> <span class="text-sm font-semibold text-white/90">คน</span></h3>
                            </div>
                            <div class="stat-icon-box">
                                <i class="fa-solid ${cat.icon}"></i>
                            </div>
                        </div>
                        <div class="mt-4">
                            <div class="flex items-center justify-between text-xs font-bold text-white/95 mb-1">
                                <span>คิดเป็นร้อยละ</span>
                                <span class="stat-percent" data-stat-key="${cat.key}">${cat.percent}%</span>
                            </div>
                            <div class="stat-progress-track">
                                <div class="stat-progress-fill" data-progress-key="${cat.key}" style="width: ${cat.percent}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        grid.innerHTML = html;
    }

    #getStatusTextClass(statusCategory) {
        const classMap = {
            normal: 'text-[#00744B] dark:text-emerald-400',
            overtime: 'text-[#0971CE] dark:text-sky-400',
            late: 'text-[#D97706] dark:text-amber-400',
            absent_duty: 'text-[#EA580C] dark:text-orange-400',
            no_checkin: 'text-[#E11D48] dark:text-rose-400'
        };
        return classMap[statusCategory] || 'text-[#00744B] dark:text-emerald-400';
    }

    #renderMobileCardsSkeleton(count = 3) {
        return Array.from({ length: count }, () => `
            <div class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-4 space-y-2.5">
                <div class="h-4 w-2/3 rounded-lg bma-skeleton-shimmer"></div>
                <div class="h-3 w-full rounded-lg bma-skeleton-shimmer"></div>
                <div class="h-3 w-4/5 rounded-lg bma-skeleton-shimmer"></div>
                <div class="h-3 w-1/2 rounded-lg bma-skeleton-shimmer"></div>
            </div>
        `).join('');
    }

    #renderEmptyCardsHtml() {
        return `
            <div data-card-empty="true" class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-8 text-center text-xs font-bold bma-text-sub shadow-xs">
                <i class="fa-regular fa-calendar-xmark text-2xl mb-2 block text-emerald-700/60 dark:text-emerald-400/60"></i>
                ไม่พบผู้ลงเวลาปฏิบัติงาน
            </div>
        `;
    }

    #buildDashboardRowHtml(rec, runningNo, colors) {
        const color = colors[rec.status_category] || rec.row_color || '#007B3E';
        const mergedPosition = UIHelpers.formatPosition(rec.position_title, rec.position_level, rec.position_type, rec.position_full);

        return `
            <tr data-row-id="${UIHelpers.escapeHtml(rec.log_id)}">
                <td class="font-semibold text-center whitespace-nowrap seq-num">${runningNo}</td>
                <td class="font-bold bma-text-main whitespace-nowrap">${UIHelpers.escapeHtml(rec.full_name)}</td>
                <td class="font-medium bma-text-main whitespace-nowrap">${UIHelpers.escapeHtml(mergedPosition)}</td>
                <td class="leading-snug">
                    <div class="font-bold text-xs" style="color: var(--bma-primary);">${UIHelpers.escapeHtml(rec.bureau || '-')}</div>
                    <div class="text-xs bma-text-sub mt-0.5">${UIHelpers.escapeHtml(rec.division || '-')}</div>
                </td>
                <td class="font-mono font-bold text-center whitespace-nowrap">${rec.check_in_time ? UIHelpers.escapeHtml(rec.check_in_time) + ' น.' : '-'}</td>
                <td class="font-mono font-bold text-center whitespace-nowrap">${rec.check_out_time ? UIHelpers.escapeHtml(rec.check_out_time) + ' น.' : '-'}</td>
                <td class="text-center whitespace-nowrap">
                    <span class="bma-badge text-white shadow-xs" style="background-color: ${color};">
                        ${UIHelpers.escapeHtml(rec.status_label)}
                    </span>
                </td>
            </tr>
        `;
    }

    #buildDashboardCardHtml(rec, runningNo) {
        const mergedPosition = UIHelpers.formatPosition(rec.position_title, rec.position_level, rec.position_type, rec.position_full);
        const statusColorClass = this.#getStatusTextClass(rec.status_category);
        const affiliationText = [rec.bureau, rec.division].filter(Boolean).join(' > ') || '-';

        return `
            <div data-card-item="true" data-card-id="${UIHelpers.escapeHtml(rec.log_id)}" class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 p-4 shadow-xs space-y-2 text-xs">
                <div class="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-700/70">
                    <div class="flex items-center gap-2 min-w-0">
                        <span class="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-[11px] seq-num">${runningNo}</span>
                        <span class="font-extrabold text-slate-800 dark:text-slate-100 truncate">${UIHelpers.escapeHtml(rec.full_name)}</span>
                    </div>
                </div>
                <div class="flex items-start justify-between gap-3 py-0.5">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">ตำแหน่ง</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-200 text-right break-words">${UIHelpers.escapeHtml(mergedPosition)}</span>
                </div>
                <div class="flex items-start justify-between gap-3 py-0.5">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">สังกัด</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-200 text-right break-words">${UIHelpers.escapeHtml(affiliationText)}</span>
                </div>
                <div class="flex items-center justify-between gap-3 py-0.5">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">เวลาเข้างาน</span>
                    <span data-field="check-in" class="font-bold text-slate-800 dark:text-slate-100 text-right font-mono">${rec.check_in_time ? UIHelpers.escapeHtml(rec.check_in_time) + ' น.' : '-'}</span>
                </div>
                <div class="flex items-center justify-between gap-3 py-0.5">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">เวลาออกงาน</span>
                    <span data-field="check-out" class="font-bold text-slate-800 dark:text-slate-100 text-right font-mono">${rec.check_out_time ? UIHelpers.escapeHtml(rec.check_out_time) + ' น.' : '-'}</span>
                </div>
                <div class="flex items-center justify-between gap-3 py-0.5">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">สถานะ</span>
                    <span data-field="status" class="font-extrabold text-right ${statusColorClass}">${UIHelpers.escapeHtml(rec.status_label || '-')}</span>
                </div>
            </div>
        `;
    }

    #renderTable(colors) {
        const tbody = document.getElementById('dashboardRecentTableBody');
        const cardsContainer = document.getElementById('dashboardRecentCardsContainer');
        const pageInfoEl = document.getElementById('dashboardPageInfoText');
        const btnPrev = document.getElementById('btnDashboardPrevPage');
        const btnNext = document.getElementById('btnDashboardNextPage');

        if (!tbody && !cardsContainer) return;

        const totalItems = this.checkedInRecords.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
        if (this.currentPage > totalPages) this.currentPage = totalPages;
        if (this.currentPage < 1) this.currentPage = 1;

        if (pageInfoEl) {
            pageInfoEl.textContent = `หน้า ${this.currentPage} / ${totalPages} (รวม ${totalItems} รายการ)`;
        }
        if (btnPrev) btnPrev.disabled = this.currentPage <= 1;
        if (btnNext) btnNext.disabled = this.currentPage >= totalPages;

        if (totalItems === 0) {
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center py-10 bma-text-sub font-bold text-sm">
                            <i class="fa-regular fa-calendar-xmark text-2xl mb-2 block text-emerald-700/60"></i>
                            ไม่พบผู้ลงเวลาปฏิบัติงาน
                        </td>
                    </tr>
                `;
            }
            if (cardsContainer) {
                cardsContainer.innerHTML = this.#renderEmptyCardsHtml();
            }
            return;
        }

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const pagedRecords = this.checkedInRecords.slice(startIndex, startIndex + this.pageSize);

        if (tbody) {
            tbody.innerHTML = pagedRecords.map((rec, idx) => {
                const runningNo = startIndex + idx + 1;
                return this.#buildDashboardRowHtml(rec, runningNo, colors);
            }).join('');
        }
        if (cardsContainer) {
            cardsContainer.innerHTML = pagedRecords.map((rec, idx) => {
                const runningNo = startIndex + idx + 1;
                return this.#buildDashboardCardHtml(rec, runningNo);
            }).join('');
        }
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