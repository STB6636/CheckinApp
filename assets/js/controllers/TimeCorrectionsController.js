/**
 * @file assets/js/controllers/TimeCorrectionsController.js
 * @description คลาสควบคุมหน้าอนุมัติคำขอแก้ไขเวลาเข้า-ออกงาน (Double-Layer Executive RBAC, Group By, Bulk/Single & Realtime Sync)
 */

import { UIHelpers } from '../core/UIHelpers.js';
import { AuthService } from '../core/AuthService.js';
import { AppLayout } from '../components/AppLayout.js';
import { AttendanceModel } from '../models/AttendanceModel.js';
import { DOMDiffHelper } from '../utils/DOMDiffHelper.js';

export class TimeCorrectionsController {
    constructor() {
        this.currentUser = null;
        this.requestsList = [];
        this.selectedIds = new Set();
        this.groupViewMode = 'division';
        if (typeof window !== 'undefined') {
            if (window.__bmaTimeCorrectionAbort) {
                window.__bmaTimeCorrectionAbort.abort();
            }
            this._abortController = new AbortController();
            window.__bmaTimeCorrectionAbort = this._abortController;
        } else {
            this._abortController = null;
        }
        this.init();
    }

    async init() {
        const layout = await AppLayout.initAdminLayout({
            activePage: 'time-corrections',
            pageTitle: 'อนุมัติแก้ไขเวลาเข้า-ออกงาน',
            pageSubtitle: 'พิจารณาคำขอแก้ไขเวลาปฏิบัติราชการตามขอบเขตและสายบังคับบัญชา'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;

        this.#bindEvents();
        await this.loadRequests();
    }

    async loadRequests() {
        const statusFilter = document.getElementById('selectCorrectionStatusFilter')?.value || 'pending';
        const tbody = document.getElementById('timeCorrectionsTableBody');
        const cardsContainer = document.getElementById('timeCorrectionsCardsContainer');
        if (tbody) {
            tbody.innerHTML = UIHelpers.renderTableSkeleton(5, 8);
        }
        if (cardsContainer) {
            cardsContainer.innerHTML = this.#renderMobileCardsSkeleton(3);
        }

        UIHelpers.showLoading('กำลังดึงรายการคำขอแก้ไขเวลา...');
        try {
            const [list, pendingOnly] = await Promise.all([
                AttendanceModel.getTimeCorrectionRequests(this.currentUser, statusFilter),
                statusFilter === 'pending'
                    ? Promise.resolve(null)
                    : AttendanceModel.getTimeCorrectionRequests(this.currentUser, 'pending')
            ]);
            this.requestsList = list;
            const pendingCount = statusFilter === 'pending'
                ? this.requestsList.length
                : (pendingOnly || []).length;
            this.#updatePendingCountBadge(pendingCount);
            this.selectedIds.clear();
            this.#updateBulkSelectionCount();
            this.#renderGroupedCorrectionsTable();
            await AppLayout.refreshNotificationBell(this.currentUser);
        } catch (err) {
            console.error('Load time corrections error:', err);
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-rose-500 font-bold">เกิดข้อผิดพลาดในการโหลดรายการคำขอแก้ไขเวลา</td></tr>`;
            }
            if (cardsContainer) {
                cardsContainer.innerHTML = `<div class="rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800/60 p-6 text-center text-xs font-bold text-rose-600 dark:text-rose-400 shadow-xs">เกิดข้อผิดพลาดในการโหลดรายการคำขอแก้ไขเวลา</div>`;
            }
        } finally {
            UIHelpers.hideLoading();
        }
    }

    #updatePendingCountBadge(pendingCount) {
        const badge = document.getElementById('timeCorrectionsPendingCountBadge');
        if (badge) {
            badge.textContent = `${pendingCount} รออนุมัติ`;
        }
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

    #isRowSelectable(req) {
        if (!req || req.correction_status !== 'pending') return false;
        const perm = req.approvalPermission || AuthService.canApproveTimeCorrection(this.currentUser, req);
        return Boolean(perm?.allowed);
    }

    #updateBulkSelectionCount() {
        const countEl = document.getElementById('selectedBulkCorrectionCount');
        if (countEl) {
            countEl.textContent = String(this.selectedIds.size);
        }
        const selectAllChk = document.getElementById('chkSelectAllCorrections');
        const selectAllMobileChk = document.getElementById('chkSelectAllCorrectionsMobile');
        const mobileBar = document.getElementById('correctionsSelectAllMobileBar');
        const mobileHint = document.getElementById('correctionsMobilePendingHint');

        const selectableRows = this.requestsList.filter(r => this.#isRowSelectable(r));
        const allChecked = selectableRows.length > 0 && selectableRows.every(r => this.selectedIds.has(r.id));

        if (selectAllChk) selectAllChk.checked = allChecked;
        if (selectAllMobileChk) {
            selectAllMobileChk.checked = allChecked;
            selectAllMobileChk.disabled = selectableRows.length === 0;
        }
        if (mobileBar) {
            mobileBar.classList.toggle('hidden', selectableRows.length === 0);
        }
        if (mobileHint) {
            mobileHint.textContent = selectableRows.length > 0 ? `${this.selectedIds.size}/${selectableRows.length} รายการ` : '';
        }
    }

    #renderGroupedCorrectionsTable() {
        const tbody = document.getElementById('timeCorrectionsTableBody');
        const cardsContainer = document.getElementById('timeCorrectionsCardsContainer');
        if (!tbody && !cardsContainer) return;

        if (this.requestsList.length === 0) {
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-slate-400">ไม่มีรายการคำขอแก้ไขเวลาในหมวดหมู่นี้</td></tr>`;
            }
            if (cardsContainer) {
                cardsContainer.innerHTML = `<div class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-8 text-center text-xs font-medium text-slate-500 dark:text-slate-400 shadow-xs">ไม่มีรายการคำขอแก้ไขเวลาในหมวดหมู่นี้</div>`;
            }
            this.#updateBulkSelectionCount();
            return;
        }

        const grouped = {};
        for (const req of this.requestsList) {
            const p = req.personnel || {};
            const bureau = p.bureau || 'ไม่ระบุสำนักงาน/กอง';
            const division = p.division || 'ไม่ระบุส่วน/ฝ่าย';
            const group = (!p.work_group || p.work_group.trim() === 'ไม่มี') ? 'ทั่วไป / ไม่มีกลุ่มงานย่อย' : p.work_group;

            if (!grouped[bureau]) grouped[bureau] = {};
            if (!grouped[bureau][division]) {
                grouped[bureau][division] = this.groupViewMode === 'group' ? {} : [];
            }

            if (this.groupViewMode === 'group') {
                if (!grouped[bureau][division][group]) grouped[bureau][division][group] = [];
                grouped[bureau][division][group].push(req);
            } else {
                grouped[bureau][division].push(req);
            }
        }

        let html = '';
        let cardsHtml = '';
        let runningNo = 1;
        let cardRunningNo = 1;

        for (const [bureauName, divisionsObj] of Object.entries(grouped)) {
            for (const [divisionName, content] of Object.entries(divisionsObj)) {
                html += `
                    <tr class="bg-indigo-500/10">
                        <td colspan="8" class="font-bold text-sm py-2.5 px-4 text-indigo-600 dark:text-indigo-300" style="border-left: 4px solid #6366F1;">
                            <i class="fa-solid fa-building-shield mr-1.5"></i>${UIHelpers.escapeHtml(bureauName)} &gt; ${UIHelpers.escapeHtml(divisionName)}
                        </td>
                    </tr>
                `;
                cardsHtml += `
                    <div class="rounded-xl px-3.5 py-2 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold text-xs shadow-xs border-l-4 border-indigo-500">
                        <i class="fa-solid fa-building-shield mr-1.5"></i>${UIHelpers.escapeHtml(bureauName)} &gt; ${UIHelpers.escapeHtml(divisionName)}
                    </div>
                `;

                if (this.groupViewMode === 'group') {
                    for (const [groupName, items] of Object.entries(content)) {
                        html += `
                            <tr class="bg-slate-100/80 dark:bg-slate-800/50">
                                <td colspan="8" class="font-semibold text-xs py-2 pl-8 bma-text-main">
                                    <i class="fa-solid fa-layer-group mr-1.5 text-emerald-600"></i>กลุ่มงาน: ${UIHelpers.escapeHtml(groupName)} (${items.length} รายการ)
                                </td>
                            </tr>
                        `;
                        cardsHtml += `
                            <div class="px-3 py-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800/70 font-semibold text-[11px] bma-text-main">
                                <i class="fa-solid fa-layer-group mr-1.5 text-emerald-600 dark:text-emerald-400"></i>กลุ่มงาน: ${UIHelpers.escapeHtml(groupName)} (${items.length} รายการ)
                            </div>
                        `;
                        for (const req of items) {
                            html += this.#buildRequestRowHtml(req, runningNo++);
                            cardsHtml += this.#buildRequestCardHtml(req, cardRunningNo++);
                        }
                    }
                } else {
                    for (const req of content) {
                        html += this.#buildRequestRowHtml(req, runningNo++);
                        cardsHtml += this.#buildRequestCardHtml(req, cardRunningNo++);
                    }
                }
            }
        }

        if (tbody) tbody.innerHTML = html;
        if (cardsContainer) cardsContainer.innerHTML = cardsHtml;
        this.#updateBulkSelectionCount();
    }

    #formatTimeCompareHtml(req) {
        const preview = req.preview || {};
        const origIn = req.correction_original_check_in || req.check_in_time || '-';
        const origOut = req.correction_original_check_out || req.check_out_time || 'ไม่ออกงาน';
        const targetIn = preview.newCheckIn || req.check_in_time || '-';
        const targetOut = preview.newCheckOut || req.check_out_time || 'ไม่ออกงาน';

        const inChanged = Boolean(preview.checkInNeedsFix || (req.correction_status === 'approved' && origIn !== targetIn));
        const outChanged = Boolean(preview.checkOutNeedsFix || (req.correction_status === 'approved' && origOut !== targetOut));

        const inLine = inChanged
            ? `<div class="font-mono text-xs"><span class="text-slate-500">เข้า:</span> <span class="text-rose-600 dark:text-rose-400 line-through">${UIHelpers.escapeHtml(origIn)}</span> &rarr; <span class="font-extrabold text-[#00744B] dark:text-emerald-400">${UIHelpers.escapeHtml(targetIn)} น.</span></div>`
            : `<div class="font-mono text-xs"><span class="text-slate-500">เข้า:</span> <span class="font-semibold">${UIHelpers.escapeHtml(origIn)}${origIn !== '-' ? ' น.' : ''}</span></div>`;

        const outLine = outChanged
            ? `<div class="font-mono text-xs mt-0.5"><span class="text-slate-500">ออก:</span> <span class="text-rose-600 dark:text-rose-400 line-through">${UIHelpers.escapeHtml(origOut)}</span> &rarr; <span class="font-extrabold text-[#00744B] dark:text-emerald-400">${UIHelpers.escapeHtml(targetOut)} น.</span></div>`
            : `<div class="font-mono text-xs mt-0.5"><span class="text-slate-500">ออก:</span> <span class="font-semibold">${UIHelpers.escapeHtml(origOut)}${origOut !== 'ไม่ออกงาน' && origOut !== '-' ? ' น.' : ''}</span></div>`;

        return `${inLine}${outLine}`;
    }

    #buildRoleTagHtml(requesterRole) {
        if (requesterRole === 'SuperAdmin') {
            return `<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ml-1">SuperAdmin</span>`;
        }
        if (requesterRole === 'Admin') {
            return `<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 ml-1">Admin</span>`;
        }
        return '';
    }

    #buildRequestRowHtml(req, indexNo) {
        const p = req.personnel || {};
        const fullName = p.first_name ? `${p.prefix}${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อบุคลากร';
        const posFull = UIHelpers.formatPosition(p.position_title, p.position_level, p.position_type, p.position_full);
        const isPending = req.correction_status === 'pending';
        const perm = req.approvalPermission || AuthService.canApproveTimeCorrection(this.currentUser, req);
        const canAct = Boolean(isPending && perm?.allowed);
        const isChecked = this.selectedIds.has(req.id) ? 'checked' : '';
        const preview = req.preview || {};

        let actionHtml = '';
        if (canAct) {
            actionHtml = `
                <div class="flex items-center justify-center gap-1.5">
                    <button type="button" data-action="approve-single" data-id="${UIHelpers.escapeHtml(req.id)}" class="w-8.5 h-8.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white flex items-center justify-center transition cursor-pointer" title="อนุมัติแก้ไขเวลา">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button type="button" data-action="reject-single" data-id="${UIHelpers.escapeHtml(req.id)}" class="w-8.5 h-8.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-500 dark:text-rose-400 hover:text-white flex items-center justify-center transition cursor-pointer" title="ไม่อนุมัติคำขอ">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;
        } else if (isPending) {
            actionHtml = `<span class="inline-block px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/60 leading-snug">${UIHelpers.escapeHtml(perm?.reason || 'สงวนสิทธิ์อนุมัติเฉพาะผู้บริหาร / SuperAdmin')}</span>`;
        } else if (req.correction_status === 'approved') {
            actionHtml = `<span class="bma-badge bma-badge-success">อนุมัติแล้ว</span>`;
        } else {
            actionHtml = `<span class="bma-badge bma-badge-danger">ไม่อนุมัติ</span>`;
        }

        const reasonHtml = req.correction_request_reason
            ? `<div class="text-xs font-semibold text-slate-700 dark:text-slate-200 break-words">เหตุผล: ${UIHelpers.escapeHtml(req.correction_request_reason)}</div>`
            : `<div class="text-[11px] text-slate-400 italic">ไม่ระบุเหตุผลเพิ่มเติม</div>`;
        const targetRemarkHtml = `<div class="text-[11px] font-bold text-[#00744B] dark:text-emerald-400 mt-0.5">หมายเหตุหลังแก้: ${UIHelpers.escapeHtml(preview.newRemark || 'ขอแก้ไขเวลา')}</div>`;
        const rejectReasonHtml = req.correction_reject_reason
            ? `<div class="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 break-words">เหตุผลไม่อนุมัติ: ${UIHelpers.escapeHtml(req.correction_reject_reason)}</div>`
            : '';

        return `
            <tr data-row-id="${UIHelpers.escapeHtml(req.id)}" class="hover:bg-slate-500/5 transition">
                <td class="text-center">
                    ${canAct ? `<input type="checkbox" class="chk-correction-row w-4 h-4 accent-[#00744B] rounded cursor-pointer" data-id="${UIHelpers.escapeHtml(req.id)}" ${isChecked}>` : ''}
                </td>
                <td class="text-center font-semibold seq-num">${indexNo}</td>
                <td class="font-bold whitespace-nowrap bma-text-main">${UIHelpers.escapeHtml(fullName)}${this.#buildRoleTagHtml(req.requester_role)}</td>
                <td class="text-xs bma-text-sub">${UIHelpers.escapeHtml(posFull)}</td>
                <td class="text-xs">
                    <div class="font-bold bma-text-main">${UIHelpers.formatThaiShortDateFullYear(req.work_date)}</div>
                    <div class="bma-text-sub">${UIHelpers.escapeHtml(req.shift_name || '-')}</div>
                </td>
                <td>${this.#formatTimeCompareHtml(req)}</td>
                <td class="text-xs">${reasonHtml}${targetRemarkHtml}${rejectReasonHtml}</td>
                <td class="text-center">${actionHtml}</td>
            </tr>
        `;
    }

    #buildRequestCardHtml(req, indexNo) {
        const p = req.personnel || {};
        const fullName = p.first_name ? `${p.prefix}${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อบุคลากร';
        const posFull = UIHelpers.formatPosition(p.position_title, p.position_level, p.position_type, p.position_full);
        const isPending = req.correction_status === 'pending';
        const perm = req.approvalPermission || AuthService.canApproveTimeCorrection(this.currentUser, req);
        const canAct = Boolean(isPending && perm?.allowed);
        const isChecked = this.selectedIds.has(req.id) ? 'checked' : '';
        const preview = req.preview || {};

        let statusBadgeHtml = '';
        let actionsHtml = '';
        if (canAct) {
            statusBadgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">รออนุมัติ</span>`;
            actionsHtml = `
                <div class="pt-2.5 mt-1 border-t border-slate-100 dark:border-slate-700/70 grid grid-cols-2 gap-2">
                    <button type="button" data-action="approve-single" data-id="${UIHelpers.escapeHtml(req.id)}" class="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition">
                        <i class="fa-solid fa-check"></i><span>อนุมัติ</span>
                    </button>
                    <button type="button" data-action="reject-single" data-id="${UIHelpers.escapeHtml(req.id)}" class="w-full py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition">
                        <i class="fa-solid fa-xmark"></i><span>ไม่อนุมัติ</span>
                    </button>
                </div>
            `;
        } else if (isPending) {
            statusBadgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">รออนุมัติ</span>`;
            actionsHtml = `
                <div class="pt-2 mt-1 border-t border-slate-100 dark:border-slate-700/70">
                    <div class="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-[11px] font-bold text-amber-700 dark:text-amber-300 text-center">
                        ${UIHelpers.escapeHtml(perm?.reason || 'สงวนสิทธิ์อนุมัติเฉพาะผู้บริหาร / SuperAdmin')}
                    </div>
                </div>
            `;
        } else if (req.correction_status === 'approved') {
            statusBadgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">อนุมัติแล้ว</span>`;
        } else {
            statusBadgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 shrink-0">ไม่อนุมัติ</span>`;
        }

        const checkboxHtml = canAct
            ? `<input type="checkbox" class="chk-correction-row w-4 h-4 accent-[#00744B] rounded cursor-pointer shrink-0" data-id="${UIHelpers.escapeHtml(req.id)}" ${isChecked}>`
            : '';

        return `
            <div data-card-item="true" data-card-id="${UIHelpers.escapeHtml(req.id)}" class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 p-4 shadow-xs space-y-2 text-xs transition">
                <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-700/70">
                    <div class="flex items-center gap-2 min-w-0">
                        ${checkboxHtml}
                        <span class="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-[11px] seq-num">${indexNo}</span>
                        <span class="font-extrabold text-slate-800 dark:text-slate-100 truncate">${UIHelpers.escapeHtml(fullName)}${this.#buildRoleTagHtml(req.requester_role)}</span>
                    </div>
                    ${statusBadgeHtml}
                </div>
                <div class="flex items-start justify-between gap-3">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">ตำแหน่ง</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-200 text-right break-words">${UIHelpers.escapeHtml(posFull)}</span>
                </div>
                <div class="flex items-start justify-between gap-3">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">วันที่ปฏิบัติงาน</span>
                    <span class="font-bold text-slate-800 dark:text-slate-100 text-right">${UIHelpers.formatThaiShortDateFullYear(req.work_date)}</span>
                </div>
                <div class="flex items-start justify-between gap-3">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">ช่วงเวลา</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-200 text-right break-words">${UIHelpers.escapeHtml(req.shift_name || '-')}</span>
                </div>
                <div class="flex items-start justify-between gap-3 pt-1 border-t border-slate-100/80 dark:border-slate-700/50">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">เวลาเดิม &rarr; หลังอนุมัติ</span>
                    <div class="text-right">${this.#formatTimeCompareHtml(req)}</div>
                </div>
                ${req.correction_request_reason ? `
                    <div class="flex items-start justify-between gap-3">
                        <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">เหตุผลที่ขอ</span>
                        <span class="font-semibold text-slate-700 dark:text-slate-200 text-right break-words">${UIHelpers.escapeHtml(req.correction_request_reason)}</span>
                    </div>
                ` : ''}
                <div class="flex items-start justify-between gap-3">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">หมายเหตุหลังแก้</span>
                    <span class="font-bold text-[#00744B] dark:text-emerald-400 text-right break-words">${UIHelpers.escapeHtml(preview.newRemark || 'ขอแก้ไขเวลา')}</span>
                </div>
                ${req.correction_reject_reason ? `
                    <div class="flex items-start justify-between gap-3">
                        <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">เหตุผลไม่อนุมัติ</span>
                        <span class="font-semibold text-rose-600 dark:text-rose-400 text-right break-words">${UIHelpers.escapeHtml(req.correction_reject_reason)}</span>
                    </div>
                ` : ''}
                ${actionsHtml}
            </div>
        `;
    }

    async syncRequestsSilent(deltaDetail = null) {
        const statusFilter = document.getElementById('selectCorrectionStatusFilter')?.value || 'pending';
        const tbody = document.getElementById('timeCorrectionsTableBody');
        const cardsContainer = document.getElementById('timeCorrectionsCardsContainer');
        if (!tbody && !cardsContainer) return;

        const isSelfActor = Boolean(
            this.currentUser && (
                (deltaDetail?.actor_id && String(deltaDetail.actor_id) === String(this.currentUser.id)) ||
                (deltaDetail?.actor && String(deltaDetail.actor) === String(this.currentUser.full_name))
            )
        );

        if (!isSelfActor && deltaDetail?.actor && this.currentUser && deltaDetail.record?.id) {
            const targetId = String(deltaDetail.record.id);
            const rowEl = tbody?.querySelector(`tr[data-row-id="${targetId}"]`);
            const cardEl = cardsContainer?.querySelector(`[data-card-id="${targetId}"]`);
            const cStatus = deltaDetail.record?.correction_status;
            if ((rowEl || cardEl) && (cStatus === 'approved' || cStatus === 'rejected')) {
                this.selectedIds.delete(targetId);
                const actionText = cStatus === 'approved' ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ';
                if (rowEl) {
                    DOMDiffHelper.lockRowForConcurrentAdmin(rowEl, deltaDetail.actor, actionText);
                    DOMDiffHelper.removeRowWithFade(rowEl, 2500, () => {
                        DOMDiffHelper.reindexTableSequence(tbody, '.seq-num');
                    });
                }
                if (cardEl) {
                    DOMDiffHelper.lockCardForConcurrentAdmin(cardEl, deltaDetail.actor, actionText);
                    DOMDiffHelper.removeRowWithFade(cardEl, 2500, () => {
                        DOMDiffHelper.reindexCardSequence(cardsContainer, '[data-card-item]', '.seq-num');
                    });
                }
                this.requestsList = this.requestsList.filter(r => String(r.id) !== targetId);
                if (statusFilter === 'pending') {
                    this.#updatePendingCountBadge(this.requestsList.length);
                }
                this.#updateBulkSelectionCount();
                await AppLayout.refreshNotificationBell(this.currentUser);
                return;
            }
        }

        try {
            const [freshList, pendingOnly] = await Promise.all([
                AttendanceModel.getTimeCorrectionRequests(this.currentUser, statusFilter),
                statusFilter === 'pending'
                    ? Promise.resolve(null)
                    : AttendanceModel.getTimeCorrectionRequests(this.currentUser, 'pending')
            ]);
            const freshMap = new Map(freshList.map(r => [String(r.id), r]));

            if (tbody) {
                const existingRows = Array.from(tbody.querySelectorAll('tr[data-row-id]'));
                const existingIds = new Set(existingRows.map(r => r.getAttribute('data-row-id')));
                for (const row of existingRows) {
                    const id = row.getAttribute('data-row-id');
                    if (!freshMap.has(id)) {
                        this.selectedIds.delete(id);
                        DOMDiffHelper.removeRowWithFade(row, 600, () => {
                            DOMDiffHelper.reindexTableSequence(tbody, '.seq-num');
                        });
                    }
                }
                for (const req of freshList) {
                    const reqId = String(req.id);
                    if (!existingIds.has(reqId)) {
                        const emptyTd = tbody.querySelector('td[colspan="8"]');
                        if (emptyTd) tbody.innerHTML = '';
                        DOMDiffHelper.prependRowWithAnimation(tbody, this.#buildRequestRowHtml(req, 1));
                    }
                }
                DOMDiffHelper.reindexTableSequence(tbody, '.seq-num');
            }

            if (cardsContainer) {
                const existingCards = Array.from(cardsContainer.querySelectorAll('[data-card-id]'));
                const existingCardIds = new Set(existingCards.map(c => c.getAttribute('data-card-id')));
                for (const card of existingCards) {
                    const id = card.getAttribute('data-card-id');
                    if (!freshMap.has(id)) {
                        this.selectedIds.delete(id);
                        DOMDiffHelper.removeRowWithFade(card, 600, () => {
                            DOMDiffHelper.reindexCardSequence(cardsContainer, '[data-card-item]', '.seq-num');
                        });
                    }
                }
                for (const req of freshList) {
                    const reqId = String(req.id);
                    if (!existingCardIds.has(reqId)) {
                        DOMDiffHelper.prependCardWithAnimation(cardsContainer, this.#buildRequestCardHtml(req, 1));
                    }
                }
                DOMDiffHelper.reindexCardSequence(cardsContainer, '[data-card-item]', '.seq-num');
            }

            this.requestsList = freshList;
            const pendingCount = statusFilter === 'pending' ? freshList.length : (pendingOnly || []).length;
            this.#updatePendingCountBadge(pendingCount);
            this.#updateBulkSelectionCount();
            await AppLayout.refreshNotificationBell(this.currentUser);
        } catch (err) {
            console.warn('[TimeCorrectionsController] syncRequestsSilent error:', err);
        }
    }

    #bindEvents() {
        const signal = this._abortController?.signal;
        if (typeof window !== 'undefined') {
            window.addEventListener('bma:realtime-delta-sync', (e) => {
                if (!document.getElementById('timeCorrectionsTableBody') && !document.getElementById('timeCorrectionsCardsContainer')) {
                    this._abortController?.abort();
                    return;
                }
                this.syncRequestsSilent(e.detail);
            }, signal ? { signal } : undefined);

            window.addEventListener('bma:realtime-sync', () => {
                if (!document.getElementById('timeCorrectionsTableBody') && !document.getElementById('timeCorrectionsCardsContainer')) {
                    this._abortController?.abort();
                    return;
                }
                this.syncRequestsSilent();
            }, signal ? { signal } : undefined);
        }

        document.getElementById('selectCorrectionStatusFilter')?.addEventListener('change', () => this.loadRequests());
        document.getElementById('selectCorrectionGroupBy')?.addEventListener('change', (e) => {
            this.groupViewMode = e.target.value;
            this.#renderGroupedCorrectionsTable();
        });
        document.getElementById('btnRefreshTimeCorrections')?.addEventListener('click', () => this.loadRequests());

        const handleSelectAllChange = (e) => {
            const checked = e.target.checked;
            const selectableRows = this.requestsList.filter(r => this.#isRowSelectable(r));
            if (checked) {
                selectableRows.forEach(r => this.selectedIds.add(r.id));
            } else {
                this.selectedIds.clear();
            }
            document.querySelectorAll('.chk-correction-row').forEach(chk => {
                chk.checked = checked;
            });
            this.#updateBulkSelectionCount();
        };
        document.getElementById('chkSelectAllCorrections')?.addEventListener('change', handleSelectAllChange);
        document.getElementById('chkSelectAllCorrectionsMobile')?.addEventListener('change', handleSelectAllChange);

        const handleRowCheckChange = (e) => {
            if (e.target.classList.contains('chk-correction-row')) {
                const id = e.target.dataset.id;
                if (e.target.checked) {
                    this.selectedIds.add(id);
                } else {
                    this.selectedIds.delete(id);
                }
                document.querySelectorAll(`.chk-correction-row[data-id="${id}"]`).forEach(chk => {
                    if (chk !== e.target) chk.checked = e.target.checked;
                });
                this.#updateBulkSelectionCount();
            }
        };

        const handleActionClick = async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === 'approve-single') {
                await this.#processDecision([id], true);
            } else if (action === 'reject-single') {
                await this.#processDecision([id], false);
            }
        };

        document.getElementById('timeCorrectionsTableBody')?.addEventListener('change', handleRowCheckChange);
        document.getElementById('timeCorrectionsCardsContainer')?.addEventListener('change', handleRowCheckChange);
        document.getElementById('timeCorrectionsTableBody')?.addEventListener('click', handleActionClick);
        document.getElementById('timeCorrectionsCardsContainer')?.addEventListener('click', handleActionClick);

        document.getElementById('btnBulkApproveCorrections')?.addEventListener('click', async () => {
            await this.#processDecision([...this.selectedIds], true);
        });
        document.getElementById('btnBulkRejectCorrections')?.addEventListener('click', async () => {
            await this.#processDecision([...this.selectedIds], false);
        });
    }

    async #processDecision(ids, isApproved) {
        if (!ids || ids.length === 0) {
            await UIHelpers.alert('กรุณาเลือกรายการ', 'โปรดติ๊กเลือกรายการคำขอแก้ไขเวลาที่ต้องการดำเนินการอย่างน้อย 1 รายการ', 'warning');
            return;
        }

        const label = isApproved ? 'อนุมัติ' : 'ไม่อนุมัติ';
        let confirmed = false;
        let rejectReason = '';

        if (!isApproved) {
            const modalRes = await UIHelpers.confirmWithInput(`ยืนยันการ${label}คำขอแก้ไขเวลา`, {
                icon: 'warning',
                infoIcon: 'fa-circle-exclamation',
                infoIconClass: 'text-rose-500',
                infoHtml: `คุณต้องการไม่อนุมัติคำขอแก้ไขเวลาจำนวน <b>${ids.length}</b> รายการใช่หรือไม่?`,
                inputId: 'swalCorrectionRejectReasonInput',
                inputLabel: 'เหตุผลที่ไม่อนุมัติ (ไม่บังคับ)',
                inputPlaceholder: 'ระบุเหตุผลประกอบการพิจารณา หรือเว้นว่างเพื่อกดส่งได้ทันที...',
                confirmText: 'ยืนยันไม่อนุมัติ',
                confirmIcon: '<i class="fa-solid fa-xmark mr-1.5"></i>',
                confirmGradient: 'from-rose-600 to-red-500',
                cancelButtonText: 'ยกเลิก',
                popupClass: 'rounded-2xl p-5 shadow-2xl border border-rose-500/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md max-w-sm sm:max-w-md',
                focusRingClass: 'focus:ring-rose-500'
            });
            confirmed = modalRes.isConfirmed;
            rejectReason = modalRes.value;
        } else {
            confirmed = await UIHelpers.confirm(
                `ยืนยันการ${label}คำขอแก้ไขเวลา`,
                `คุณต้องการ${label}รายการคำขอแก้ไขเวลาจำนวน ${ids.length} รายการใช่หรือไม่?`,
                `ยืนยัน${label}`,
                'question'
            );
        }

        if (!confirmed) return;

        UIHelpers.showLoading(`กำลังบันทึกผลการ${label}...`);
        try {
            const res = await AttendanceModel.processTimeCorrectionsBulk(ids, isApproved, this.currentUser, rejectReason);
            UIHelpers.hideLoading();

            if (!res.success) {
                await UIHelpers.alert('ไม่สามารถดำเนินการได้', res.message, res.forbidden ? 'warning' : 'error');
                return;
            }

            await this.loadRequests();
            await UIHelpers.alert('ดำเนินการสำเร็จ', res.message, 'success');
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
        }
    }
}

if (!window.__BMA_SPA_ROUTER_ACTIVE__) {
    window.__BMA_SPA_ROUTER_ACTIVE__ = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new TimeCorrectionsController());
    } else {
        new TimeCorrectionsController();
    }
}
