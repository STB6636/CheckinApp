/**
 * @file assets/js/controllers/ApprovalsController.js
 * @description คลาสควบคุมหน้าอนุมัติลงเวลากรณีพิเศษ (Group By 2 มุมมอง และอนุมัติหลายรายการพร้อมกัน)
 */

import { UIHelpers } from '../core/UIHelpers.js';
import { AppLayout } from '../components/AppLayout.js';
import { AttendanceModel } from '../models/AttendanceModel.js';
import { DOMDiffHelper } from '../utils/DOMDiffHelper.js';

export class ApprovalsController {
    constructor() {
        this.currentUser = null;
        this.requestsList = [];
        this.selectedIds = new Set();
        this.groupViewMode = 'division';
        this.init();
    }

    async init() {
        const layout = await AppLayout.initAdminLayout({
            activePage: 'approvals',
            pageTitle: 'อนุมัติลงเวลาปฏิบัติราชการกรณีพิเศษ',
            pageSubtitle: 'พิจารณาอนุมัติคำขอลงเวลากรณีพิเศษตามขอบเขตการมองเห็น'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;

        this.#bindEvents();
        await this.loadRequests();
    }

    async loadRequests() {
        const statusFilter = document.getElementById('selectApprovalStatusFilter')?.value || 'pending';
        const tbody = document.getElementById('approvalsTableBody');
        const cardsContainer = document.getElementById('approvalsCardsContainer');
        if (tbody) {
            tbody.innerHTML = UIHelpers.renderTableSkeleton(5, 7);
        }
        if (cardsContainer) {
            cardsContainer.innerHTML = this.#renderMobileCardsSkeleton(3);
        }

        UIHelpers.showLoading('กำลังดึงรายการขออนุมัติลงเวลากรณีพิเศษ...');
        try {
            const [list, pendingOnly] = await Promise.all([
                AttendanceModel.getSpecialRequests(this.currentUser, statusFilter),
                statusFilter === 'pending'
                    ? Promise.resolve(null)
                    : AttendanceModel.getSpecialRequests(this.currentUser, 'pending')
            ]);
            this.requestsList = list;
            const pendingCount = statusFilter === 'pending'
                ? this.requestsList.length
                : (pendingOnly || []).length;
            this.#updatePendingCountBadge(pendingCount);
            this.selectedIds.clear();
            this.#updateBulkSelectionCount();
            this.#renderGroupedApprovalsTable();
            await AppLayout.refreshNotificationBell(this.currentUser);
        } catch (err) {
            console.error('Load approvals error:', err);
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-rose-500 font-bold">เกิดข้อผิดพลาดในการโหลดรายการคำขอ</td></tr>`;
            }
            if (cardsContainer) {
                cardsContainer.innerHTML = `<div class="rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800/60 p-6 text-center text-xs font-bold text-rose-600 dark:text-rose-400 shadow-xs">เกิดข้อผิดพลาดในการโหลดรายการคำขอ</div>`;
            }
        } finally {
            UIHelpers.hideLoading();
        }
    }

    #updatePendingCountBadge(pendingCount) {
        const badge = document.getElementById('approvalsPendingCountBadge');
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

    #updateBulkSelectionCount() {
        const countEl = document.getElementById('selectedBulkCount');
        if (countEl) {
            countEl.textContent = String(this.selectedIds.size);
        }
        const selectAllChk = document.getElementById('chkSelectAllApprovals');
        const selectAllMobileChk = document.getElementById('chkSelectAllApprovalsMobile');
        const mobileBar = document.getElementById('approvalsSelectAllMobileBar');
        const mobileHint = document.getElementById('approvalsMobilePendingHint');
        const pendingIds = this.requestsList.filter(r => r.approval_status === 'pending').map(r => r.id);
        const allChecked = pendingIds.length > 0 && pendingIds.every(id => this.selectedIds.has(id));
        if (selectAllChk) {
            selectAllChk.checked = allChecked;
        }
        if (selectAllMobileChk) {
            selectAllMobileChk.checked = allChecked;
        }
        if (mobileBar) {
            mobileBar.classList.toggle('hidden', pendingIds.length === 0);
        }
        if (mobileHint) {
            mobileHint.textContent = `รออนุมัติ ${pendingIds.length} รายการ`;
        }
    }

    /**
     * จัดกลุ่มรายการคำขอลงเวลากรณีพิเศษตามโครงสร้าง Group By 2 มุมมอง:
     * - 'division': สำนักงาน/กอง > ส่วน/ฝ่าย
     * - 'group': สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน
     */
    #renderGroupedApprovalsTable() {
        const tbody = document.getElementById('approvalsTableBody');
        const cardsContainer = document.getElementById('approvalsCardsContainer');
        if (!tbody && !cardsContainer) return;

        if (this.requestsList.length === 0) {
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 bma-text-sub">ไม่มีรายการคำขอลงเวลากรณีพิเศษในสถานะที่เลือก</td></tr>`;
            }
            if (cardsContainer) {
                cardsContainer.innerHTML = `<div data-card-empty="true" class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-8 text-center text-xs font-medium bma-text-sub shadow-xs">ไม่มีรายการคำขอลงเวลากรณีพิเศษในสถานะที่เลือก</div>`;
            }
            return;
        }

        const grouped = {};
        for (const req of this.requestsList) {
            const p = req.personnel || {};
            const bureau = p.bureau || 'สำนักเทศกิจ';
            const division = p.division || 'ไม่ระบุส่วน/ฝ่าย';
            const group = p.work_group || 'ไม่ระบุกลุ่มงาน';

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
                            <i class="fa-solid fa-building-shield mr-1.5"></i>${bureauName} &gt; ${divisionName}
                        </td>
                    </tr>
                `;
                cardsHtml += `
                    <div class="rounded-xl px-3.5 py-2 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold text-xs shadow-xs border-l-4 border-indigo-500">
                        <i class="fa-solid fa-building-shield mr-1.5"></i>${this.#escapeHtml(bureauName)} &gt; ${this.#escapeHtml(divisionName)}
                    </div>
                `;

                if (this.groupViewMode === 'group') {
                    for (const [groupName, items] of Object.entries(content)) {
                        html += `
                            <tr class="bg-slate-100/80 dark:bg-slate-800/50">
                                <td colspan="8" class="font-semibold text-xs py-2 pl-8 bma-text-main">
                                    <i class="fa-solid fa-layer-group mr-1.5 text-emerald-600"></i>กลุ่มงาน: ${groupName} (${items.length} รายการ)
                                </td>
                            </tr>
                        `;
                        cardsHtml += `
                            <div class="px-3 py-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800/70 font-semibold text-[11px] bma-text-main">
                                <i class="fa-solid fa-layer-group mr-1.5 text-emerald-600 dark:text-emerald-400"></i>กลุ่มงาน: ${this.#escapeHtml(groupName)} (${items.length} รายการ)
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
    }

    #buildRequestRowHtml(req, indexNo) {
        const p = req.personnel || {};
        const fullName = p.first_name ? `${p.prefix}${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อบุคลากร';
        const posFull = UIHelpers.formatPosition(p.position_title, p.position_level, p.position_type, p.position_full);
        const timeRange = `${req.check_in_time ? req.check_in_time.slice(0, 5) : '-'} - ${req.check_out_time ? req.check_out_time.slice(0, 5) : '-'} น.`;
        const isPending = req.approval_status === 'pending';
        const isChecked = this.selectedIds.has(req.id) ? 'checked' : '';

        const locName = req.check_in_location || 'ขอลงเวลากรณีพิเศษ';
        const hasCoords = req.check_in_lat != null && req.check_in_lng != null && !isNaN(Number(req.check_in_lat)) && !isNaN(Number(req.check_in_lng));
        const latNum = hasCoords ? Number(req.check_in_lat).toFixed(5) : null;
        const lngNum = hasCoords ? Number(req.check_in_lng).toFixed(5) : null;

        const hasValidOffsiteReason = Boolean(req.offsite_reason && String(req.offsite_reason).trim() && String(req.offsite_reason).trim() !== '-');
        const locMode = req.location_mode || (
            hasValidOffsiteReason || 
            (req.remark && (
                ['อบรม', 'ประชุม', 'ปฏิบัติงานนอกสถานที่', 'ปฏิบัติงานที่บ้าน (WFH)', 'ปฏิบัติงานเวรประจำวัน'].includes(String(req.remark).trim()) ||
                /(?:นอกสถานที่|อบรม|ประชุม|สัมมนา|WFH|ปฏิบัติงานที่บ้าน|เวรประจำวัน|ปฏิบัติงานเวร)/i.test(String(req.remark))
            ))
            ? 'OFFSITE' 
            : 'ONSITE'
        );
        const isOffsite = locMode === 'OFFSITE';
        const modeBadgeHtml = isOffsite
            ? `<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 mr-1 shrink-0">[นอกสถานที่]</span>`
            : `<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mr-1 shrink-0">[ในสถานที่]</span>`;

        const remarkCellHtml = this.#formatRemarkCellHtml(req, isOffsite);

        let commandColHtml = '';
        if (isPending) {
            commandColHtml = `
                <div class="flex items-center justify-center gap-1.5">
                    <button type="button" data-action="approve-single" data-id="${req.id}" class="w-8.5 h-8.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-xs flex items-center justify-center transition cursor-pointer" title="อนุมัติ">
                        <i class="fa-solid fa-check text-sm"></i>
                    </button>
                    <button type="button" data-action="reject-single" data-id="${req.id}" class="w-8.5 h-8.5 rounded-lg text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-xs flex items-center justify-center transition cursor-pointer" title="ไม่อนุมัติ">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>
            `;
        } else if (req.approval_status === 'approved') {
            commandColHtml = `<span class="bma-badge bma-badge-success"><i class="fa-solid fa-circle-check"></i> อนุมัติแล้ว</span>`;
        } else {
            commandColHtml = `<span class="bma-badge bma-badge-danger"><i class="fa-solid fa-circle-xmark"></i> ไม่อนุมัติ</span>`;
        }

        return `
            <tr data-row-id="${req.id}">
                <td class="text-center">
                    ${isPending ? `<input type="checkbox" class="chk-approval-row w-4 h-4 accent-emerald-600 cursor-pointer" data-id="${req.id}" ${isChecked}>` : '-'}
                </td>
                <td class="text-center font-semibold seq-num">${indexNo}</td>
                <td class="font-semibold bma-text-main">${fullName}</td>
                <td>${posFull}</td>
                <td>
                    <div class="font-semibold bma-text-main">${UIHelpers.formatThaiDate(req.work_date)}</div>
                    <div class="text-xs bma-text-sub">${req.shift_name} (${timeRange})</div>
                </td>
                <td class="text-xs">
                    <div class="flex items-start gap-1.5">
                        <i class="${isOffsite ? 'fa-solid fa-map-location-dot text-sky-600 dark:text-sky-400' : 'fa-solid fa-building-circle-check text-emerald-600 dark:text-emerald-400'} mt-0.5 shrink-0"></i>
                        <div class="min-w-0">
                            <div class="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug" title="${locName}">
                                ${modeBadgeHtml}${locName}
                            </div>
                            ${hasCoords ? `
                                <div class="mt-0.5 flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                    <span>${latNum}, ${lngNum}</span>
                                    <a href="https://www.google.com/maps?q=${latNum},${lngNum}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-0.5" title="เปิดแผนที่ Google Maps">
                                        <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    ${remarkCellHtml}
                </td>
                <td class="text-center">${commandColHtml}</td>
            </tr>
        `;
    }

    #escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    #formatRemarkCellHtml(req, isOffsite) {
        let rawRemark = (req?.remark || '').trim();
        if (rawRemark === '-') rawRemark = '';
        let primaryRemark = rawRemark;
        let offsiteDetail = '';

        if (isOffsite) {
            let offsiteReason = (req?.offsite_reason || '').trim();
            if (offsiteReason === '-') offsiteReason = '';

            if (offsiteReason) {
                let unparenthesizedOffsite = offsiteReason;
                while (unparenthesizedOffsite.startsWith('(') && unparenthesizedOffsite.endsWith(')')) {
                    const inner = unparenthesizedOffsite.slice(1, -1).trim();
                    let depth = 0;
                    let balanced = true;
                    for (let i = 0; i < inner.length; i++) {
                        if (inner[i] === '(') depth++;
                        else if (inner[i] === ')') {
                            depth--;
                            if (depth < 0) {
                                balanced = false;
                                break;
                            }
                        }
                    }
                    if (balanced && depth === 0) {
                        unparenthesizedOffsite = inner;
                    } else {
                        break;
                    }
                }

                if (primaryRemark) {
                    if (
                        (primaryRemark === 'ปฏิบัติงานที่บ้าน' || primaryRemark === 'ปฏิบัติงานที่บ้าน (WFH)') &&
                        (unparenthesizedOffsite === 'WFH' || unparenthesizedOffsite === 'ปฏิบัติงานที่บ้าน (WFH)')
                    ) {
                        primaryRemark = 'ปฏิบัติงานที่บ้าน (WFH)';
                        offsiteDetail = '';
                    } else {
                        const bracketedWithOriginal = `(${offsiteReason})`;
                        const bracketedWithUnparenthesized = `(${unparenthesizedOffsite})`;

                        if (primaryRemark === offsiteReason || primaryRemark === unparenthesizedOffsite || primaryRemark === bracketedWithOriginal || primaryRemark === bracketedWithUnparenthesized) {
                            primaryRemark = offsiteReason;
                            offsiteDetail = '';
                        } else if (primaryRemark.endsWith(bracketedWithOriginal)) {
                            primaryRemark = primaryRemark.slice(0, -bracketedWithOriginal.length).trim();
                            offsiteDetail = unparenthesizedOffsite;
                        } else if (primaryRemark.endsWith(bracketedWithUnparenthesized)) {
                            primaryRemark = primaryRemark.slice(0, -bracketedWithUnparenthesized.length).trim();
                            offsiteDetail = unparenthesizedOffsite;
                        } else if (primaryRemark.endsWith(unparenthesizedOffsite)) {
                            primaryRemark = primaryRemark.slice(0, -unparenthesizedOffsite.length).trim();
                            offsiteDetail = unparenthesizedOffsite;
                        } else {
                            offsiteDetail = unparenthesizedOffsite;
                        }

                        if (primaryRemark === offsiteDetail) {
                            offsiteDetail = '';
                        }
                    }
                } else {
                    primaryRemark = 'กรณีพิเศษ';
                    offsiteDetail = unparenthesizedOffsite;
                }
            } else if (primaryRemark) {
                const match = primaryRemark.match(/^(.*?)\s*\(([^()]*?(?:\([^()]*?\)[^()]*?)*)\)$/);
                if (match) {
                    const candidatePrimary = match[1].trim();
                    const candidateOffsite = match[2].trim();
                    if (candidatePrimary === 'ปฏิบัติงานที่บ้าน' && candidateOffsite === 'WFH') {
                        // คงข้อความ 'ปฏิบัติงานที่บ้าน (WFH)' ไว้เป็นเหตุผลหลักบรรทัดเดียว
                    } else if (candidatePrimary === candidateOffsite) {
                        primaryRemark = candidatePrimary;
                        offsiteDetail = '';
                    } else if (candidatePrimary && /(?:นอกสถานที่|อบรม|ประชุม|สัมมนา|WFH|ปฏิบัติงานที่บ้าน|เวรประจำวัน|ปฏิบัติงานเวร)/i.test(candidateOffsite)) {
                        primaryRemark = candidatePrimary;
                        offsiteDetail = candidateOffsite;
                    }
                }
            }
        }

        if (!primaryRemark) {
            primaryRemark = '-';
        }

        let formattedOffsite = '';
        if (offsiteDetail) {
            let cleanOffsite = offsiteDetail.trim();
            while (cleanOffsite.startsWith('(') && cleanOffsite.endsWith(')')) {
                const inner = cleanOffsite.slice(1, -1).trim();
                let depth = 0;
                let balanced = true;
                for (let i = 0; i < inner.length; i++) {
                    if (inner[i] === '(') depth++;
                    else if (inner[i] === ')') {
                        depth--;
                        if (depth < 0) {
                            balanced = false;
                            break;
                        }
                    }
                }
                if (balanced && depth === 0) {
                    cleanOffsite = inner;
                } else {
                    break;
                }
            }

            if (
                (primaryRemark === 'ปฏิบัติงานที่บ้าน' || primaryRemark === 'ปฏิบัติงานที่บ้าน (WFH)') &&
                (cleanOffsite === 'WFH' || cleanOffsite === 'ปฏิบัติงานที่บ้าน (WFH)')
            ) {
                primaryRemark = 'ปฏิบัติงานที่บ้าน (WFH)';
                cleanOffsite = '';
            } else if (cleanOffsite === primaryRemark) {
                cleanOffsite = '';
            }

            formattedOffsite = cleanOffsite ? `(${cleanOffsite})` : '';
        }

        if (formattedOffsite) {
            return `
                <div class="bma-badge-indigo inline-flex flex-col items-start gap-0.5 px-2.5 py-1.5 rounded-xl text-xs leading-snug max-w-[240px] text-left whitespace-normal">
                    <span class="font-semibold break-words">${this.#escapeHtml(primaryRemark)}</span>
                    <span class="text-[11px] font-medium opacity-90 break-words">${this.#escapeHtml(formattedOffsite)}</span>
                </div>
            `.trim();
        }

        return `
            <div class="bma-badge-indigo inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold leading-snug max-w-[240px] break-words text-left whitespace-normal">
                <span>${this.#escapeHtml(primaryRemark)}</span>
            </div>
        `.trim();
    }

    #buildRequestCardHtml(req, indexNo) {
        const p = req.personnel || {};
        const fullName = p.first_name ? `${p.prefix || ''}${p.first_name} ${p.last_name || ''}` : 'ไม่ระบุชื่อบุคลากร';
        const posFull = UIHelpers.formatPosition(p.position_title, p.position_level, p.position_type, p.position_full);
        const timeRange = `${req.check_in_time ? req.check_in_time.slice(0, 5) : '-'} - ${req.check_out_time ? req.check_out_time.slice(0, 5) : '-'} น.`;
        const isPending = req.approval_status === 'pending';
        const isChecked = this.selectedIds.has(req.id) ? 'checked' : '';
        const safeId = this.#escapeHtml(req.id);

        const locName = req.check_in_location || 'ขอลงเวลากรณีพิเศษ';
        const hasCoords = req.check_in_lat != null && req.check_in_lng != null && !isNaN(Number(req.check_in_lat)) && !isNaN(Number(req.check_in_lng));
        const latNum = hasCoords ? Number(req.check_in_lat).toFixed(5) : null;
        const lngNum = hasCoords ? Number(req.check_in_lng).toFixed(5) : null;

        const hasValidOffsiteReason = Boolean(req.offsite_reason && String(req.offsite_reason).trim() && String(req.offsite_reason).trim() !== '-');
        const locMode = req.location_mode || (
            hasValidOffsiteReason ||
            (req.remark && (
                ['อบรม', 'ประชุม', 'ปฏิบัติงานนอกสถานที่', 'ปฏิบัติงานที่บ้าน (WFH)', 'ปฏิบัติงานเวรประจำวัน'].includes(String(req.remark).trim()) ||
                /(?:นอกสถานที่|อบรม|ประชุม|สัมมนา|WFH|ปฏิบัติงานที่บ้าน|เวรประจำวัน|ปฏิบัติงานเวร)/i.test(String(req.remark))
            ))
            ? 'OFFSITE'
            : 'ONSITE'
        );
        const isOffsite = locMode === 'OFFSITE';
        const modeBadgeHtml = isOffsite
            ? `<span class="inline-block px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 text-[10px] font-bold mr-1.5">[นอกสถานที่]</span>`
            : `<span class="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold mr-1.5">[ในสถานที่]</span>`;

        const remarkCellHtml = this.#formatRemarkCellHtml(req, isOffsite);

        const statusRowHtml = !isPending ? `
            <div class="flex items-center justify-between gap-3 py-0.5">
                <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">สถานะคำขอ</span>
                <span class="font-extrabold text-right ${req.approval_status === 'approved' ? 'text-[#00744B] dark:text-emerald-400' : 'text-[#E11D48] dark:text-rose-400'}">
                    ${req.approval_status === 'approved' ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ'}
                </span>
            </div>
        ` : '';

        const actionFooterHtml = isPending ? `
            <div data-card-actions="true" class="pt-2.5 mt-1 border-t border-slate-100 dark:border-slate-700/70 flex items-center gap-2">
                <button type="button" data-action="approve-single" data-id="${safeId}" class="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#00744B] hover:bg-[#005B3A] shadow-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer">
                    <i class="fa-solid fa-check"></i> อนุมัติ
                </button>
                <button type="button" data-action="reject-single" data-id="${safeId}" class="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 shadow-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer">
                    <i class="fa-solid fa-xmark"></i> ไม่อนุมัติ
                </button>
            </div>
        ` : '';

        return `
            <div data-card-item="true" data-card-id="${safeId}" class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 p-4 shadow-xs space-y-2 text-xs">
                <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-700/70">
                    <div class="flex items-center gap-2 min-w-0">
                        ${isPending ? `<input type="checkbox" class="chk-approval-row w-4 h-4 accent-[#00744B] rounded cursor-pointer shrink-0" data-id="${safeId}" ${isChecked}>` : ''}
                        <span class="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-[11px] seq-num">${indexNo}</span>
                        <span class="font-extrabold text-slate-800 dark:text-slate-100 truncate">${this.#escapeHtml(fullName)}</span>
                    </div>
                    ${isPending ? `<span class="text-[10px] font-extrabold text-[#D97706] dark:text-amber-400 shrink-0">รออนุมัติ</span>` : ''}
                </div>
                <div class="flex items-start justify-between gap-3 py-0.5">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">ตำแหน่ง</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-200 text-right break-words">${this.#escapeHtml(posFull)}</span>
                </div>
                <div class="flex items-center justify-between gap-3 py-0.5">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">วันที่ขอ</span>
                    <span class="font-bold text-slate-800 dark:text-slate-100 text-right">${this.#escapeHtml(UIHelpers.formatThaiDate(req.work_date))}</span>
                </div>
                <div class="flex items-start justify-between gap-3 py-0.5">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">ช่วงเวลา</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-200 text-right break-words">${this.#escapeHtml(req.shift_name || '-')} (${this.#escapeHtml(timeRange)})</span>
                </div>
                <div class="flex items-start justify-between gap-3 py-0.5">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">พิกัดสถานที่</span>
                    <div class="text-right font-semibold text-slate-700 dark:text-slate-200 break-words">
                        <div>${modeBadgeHtml}${this.#escapeHtml(locName)}</div>
                        ${hasCoords ? `
                            <div class="mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                <span>${latNum}, ${lngNum}</span>
                                <a href="https://www.google.com/maps?q=${latNum},${lngNum}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5" title="เปิดแผนที่ Google Maps">
                                    <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="flex items-start justify-between gap-3 py-0.5">
                    <span class="text-slate-500 dark:text-slate-400 font-medium shrink-0">หมายเหตุ</span>
                    <div class="text-right break-words">${remarkCellHtml}</div>
                </div>
                ${statusRowHtml}
                ${actionFooterHtml}
            </div>
        `;
    }

    async syncRequestsSilent(deltaDetail = null) {
        const statusFilter = document.getElementById('selectApprovalStatusFilter')?.value || 'pending';
        const tbody = document.getElementById('approvalsTableBody');
        const cardsContainer = document.getElementById('approvalsCardsContainer');
        if (!tbody && !cardsContainer) return;

        // หากมีผู้ดูแลระบบท่านอื่นดำเนินการรายการนี้ไปแล้ว
        if (deltaDetail?.actor && this.currentUser && deltaDetail.actor !== this.currentUser.full_name && deltaDetail.record?.id) {
            const targetId = String(deltaDetail.record.id);
            const rowEl = tbody?.querySelector(`tr[data-row-id="${targetId}"]`);
            const cardEl = cardsContainer?.querySelector(`[data-card-id="${targetId}"]`);
            if (rowEl || cardEl) {
                this.selectedIds.delete(targetId);
                const actionText = deltaDetail.action === 'approved' ? 'อนุมัติแล้ว' : (deltaDetail.action === 'rejected' ? 'ไม่อนุมัติ' : 'ดำเนินการแล้ว');
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

        // Silent delta reconciliation โดยไม่ทำลาย DOM
        try {
            const [freshList, pendingOnly] = await Promise.all([
                AttendanceModel.getSpecialRequests(this.currentUser, statusFilter),
                statusFilter === 'pending'
                    ? Promise.resolve(null)
                    : AttendanceModel.getSpecialRequests(this.currentUser, 'pending')
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
                        if (emptyTd) {
                            tbody.innerHTML = '';
                        }
                        const rowHtml = this.#buildRequestRowHtml(req, 1);
                        DOMDiffHelper.prependRowWithAnimation(tbody, rowHtml);
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
                        const cardHtml = this.#buildRequestCardHtml(req, 1);
                        DOMDiffHelper.prependCardWithAnimation(cardsContainer, cardHtml);
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
            console.warn('[ApprovalsController] syncRequestsSilent error:', err);
        }
    }

    #bindEvents() {
        window.addEventListener('bma:realtime-delta-sync', (e) => {
            this.syncRequestsSilent(e.detail);
        });
        window.addEventListener('bma:realtime-sync', () => {
            this.syncRequestsSilent();
        });
        document.getElementById('selectApprovalStatusFilter')?.addEventListener('change', () => this.loadRequests());
        document.getElementById('selectApprovalGroupBy')?.addEventListener('change', (e) => {
            this.groupViewMode = e.target.value;
            this.#renderGroupedApprovalsTable();
        });
        document.getElementById('btnRefreshApprovals')?.addEventListener('click', () => this.loadRequests());

        // เลือกทั้งหมด (ซิงก์ 2 ทาง Desktop & Mobile)
        const handleSelectAllChange = (e) => {
            const checked = e.target.checked;
            const pendingRows = this.requestsList.filter(r => r.approval_status === 'pending');
            if (checked) {
                pendingRows.forEach(r => this.selectedIds.add(r.id));
            } else {
                this.selectedIds.clear();
            }
            document.querySelectorAll('.chk-approval-row').forEach(chk => {
                chk.checked = checked;
            });
            this.#updateBulkSelectionCount();
        };
        document.getElementById('chkSelectAllApprovals')?.addEventListener('change', handleSelectAllChange);
        document.getElementById('chkSelectAllApprovalsMobile')?.addEventListener('change', handleSelectAllChange);

        // เลือกรายแถว/ราย์การ์ดและกดปุ่มอนุมัติเดี่ยว
        const handleRowCheckChange = (e) => {
            if (e.target.classList.contains('chk-approval-row')) {
                const id = e.target.dataset.id;
                if (e.target.checked) {
                    this.selectedIds.add(id);
                } else {
                    this.selectedIds.delete(id);
                }
                document.querySelectorAll(`.chk-approval-row[data-id="${id}"]`).forEach(chk => {
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
                await this.#processDecision([id], 'approved');
            } else if (action === 'reject-single') {
                await this.#processDecision([id], 'rejected');
            }
        };

        document.getElementById('approvalsTableBody')?.addEventListener('change', handleRowCheckChange);
        document.getElementById('approvalsCardsContainer')?.addEventListener('change', handleRowCheckChange);
        document.getElementById('approvalsTableBody')?.addEventListener('click', handleActionClick);
        document.getElementById('approvalsCardsContainer')?.addEventListener('click', handleActionClick);

        // ปุ่มอนุมัติและไม่อนุมัติหลายรายการพร้อมกัน
        document.getElementById('btnBulkApprove')?.addEventListener('click', async () => {
            await this.#processDecision([...this.selectedIds], 'approved');
        });

        document.getElementById('btnBulkReject')?.addEventListener('click', async () => {
            await this.#processDecision([...this.selectedIds], 'rejected');
        });
    }

    async #processDecision(ids, decision) {
        if (!ids || ids.length === 0) {
            await UIHelpers.alert('กรุณาเลือกรายการ', 'โปรดติ๊กเลือกรายการคำขอที่ต้องการดำเนินการอย่างน้อย 1 รายการ', 'warning');
            return;
        }

        const label = decision === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ';
        const confirmed = await UIHelpers.confirm(
            `ยืนยันการ${label}คำขอลงเวลากรณีพิเศษ`,
            `คุณต้องการ${label}รายการคำขอจำนวน ${ids.length} รายการใช่หรือไม่?`,
            `ยืนยัน${label}`,
            decision === 'approved' ? 'question' : 'warning'
        );

        if (!confirmed) return;

        UIHelpers.showLoading(`กำลังบันทึกผลการ${label}...`);
        try {
            const res = await AttendanceModel.processSpecialRequestsBulk(ids, decision, this.currentUser.id);
            UIHelpers.hideLoading();

            if (!res.success) {
                await UIHelpers.alert('เกิดข้อผิดพลาด', res.message, 'error');
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
        document.addEventListener('DOMContentLoaded', () => new ApprovalsController());
    } else {
        new ApprovalsController();
    }
}