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
        if (tbody) {
            tbody.innerHTML = UIHelpers.renderTableSkeleton(5, 7);
        }

        UIHelpers.showLoading('กำลังดึงรายการขออนุมัติลงเวลากรณีพิเศษ...');
        try {
            this.requestsList = await AttendanceModel.getSpecialRequests(this.currentUser, statusFilter);
            this.selectedIds.clear();
            this.#updateBulkSelectionCount();
            this.#renderGroupedApprovalsTable();
            await AppLayout.refreshNotificationBell(this.currentUser);
        } finally {
            UIHelpers.hideLoading();
        }
    }

    #updateBulkSelectionCount() {
        const countEl = document.getElementById('selectedBulkCount');
        if (countEl) {
            countEl.textContent = String(this.selectedIds.size);
        }
        const selectAllChk = document.getElementById('chkSelectAllApprovals');
        const pendingIds = this.requestsList.filter(r => r.approval_status === 'pending').map(r => r.id);
        if (selectAllChk) {
            selectAllChk.checked = pendingIds.length > 0 && pendingIds.every(id => this.selectedIds.has(id));
        }
    }

    /**
     * จัดกลุ่มรายการคำขอลงเวลากรณีพิเศษตามโครงสร้าง Group By 2 มุมมอง:
     * - 'division': สำนักงาน/กอง > ส่วน/ฝ่าย
     * - 'group': สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน
     */
    #renderGroupedApprovalsTable() {
        const tbody = document.getElementById('approvalsTableBody');
        if (!tbody) return;

        if (this.requestsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 bma-text-sub">ไม่มีรายการคำขอลงเวลากรณีพิเศษในสถานะที่เลือก</td></tr>`;
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
        let runningNo = 1;

        for (const [bureauName, divisionsObj] of Object.entries(grouped)) {
            for (const [divisionName, content] of Object.entries(divisionsObj)) {
                html += `
                    <tr class="bg-indigo-500/10">
                        <td colspan="8" class="font-bold text-sm py-2.5 px-4 text-indigo-600 dark:text-indigo-300" style="border-left: 4px solid #6366F1;">
                            <i class="fa-solid fa-building-shield mr-1.5"></i>${bureauName} &gt; ${divisionName}
                        </td>
                    </tr>
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
                        for (const req of items) {
                            html += this.#buildRequestRowHtml(req, runningNo++);
                        }
                    }
                } else {
                    for (const req of content) {
                        html += this.#buildRequestRowHtml(req, runningNo++);
                    }
                }
            }
        }

        tbody.innerHTML = html;
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

    async syncRequestsSilent(deltaDetail = null) {
        const statusFilter = document.getElementById('selectApprovalStatusFilter')?.value || 'pending';
        const tbody = document.getElementById('approvalsTableBody');
        if (!tbody) return;

        // หากมีผู้ดูแลระบบท่านอื่นดำเนินการรายการนี้ไปแล้ว
        if (deltaDetail?.actor && this.currentUser && deltaDetail.actor !== this.currentUser.full_name && deltaDetail.record?.id) {
            const targetId = String(deltaDetail.record.id);
            const rowEl = tbody.querySelector(`tr[data-row-id="${targetId}"]`);
            if (rowEl) {
                this.selectedIds.delete(targetId);
                const actionText = deltaDetail.action === 'approved' ? 'อนุมัติแล้ว' : (deltaDetail.action === 'rejected' ? 'ไม่อนุมัติ' : 'ดำเนินการแล้ว');
                DOMDiffHelper.lockRowForConcurrentAdmin(rowEl, deltaDetail.actor, actionText);
                this.#updateBulkSelectionCount();
                DOMDiffHelper.removeRowWithFade(rowEl, 2500, () => {
                    DOMDiffHelper.reindexTableSequence(tbody, '.seq-num');
                });
                this.requestsList = this.requestsList.filter(r => String(r.id) !== targetId);
                await AppLayout.refreshNotificationBell(this.currentUser);
                return;
            }
        }

        // Silent delta reconciliation โดยไม่ทำลาย DOM
        try {
            const freshList = await AttendanceModel.getSpecialRequests(this.currentUser, statusFilter);
            const freshMap = new Map(freshList.map(r => [String(r.id), r]));
            const existingRows = Array.from(tbody.querySelectorAll('tr[data-row-id]'));
            const existingIds = new Set(existingRows.map(r => r.getAttribute('data-row-id')));

            // 1. นำแถวที่ไม่มีในรายการใหม่ออกอย่างนุ่มนวล
            for (const row of existingRows) {
                const id = row.getAttribute('data-row-id');
                if (!freshMap.has(id)) {
                    this.selectedIds.delete(id);
                    DOMDiffHelper.removeRowWithFade(row, 600, () => {
                        DOMDiffHelper.reindexTableSequence(tbody, '.seq-num');
                    });
                }
            }

            // 2. แทรกรายการใหม่ด้านบนสุดพร้อม Animation
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

            this.requestsList = freshList;
            this.#updateBulkSelectionCount();
            DOMDiffHelper.reindexTableSequence(tbody, '.seq-num');
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

        // เลือกทั้งหมด
        document.getElementById('chkSelectAllApprovals')?.addEventListener('change', (e) => {
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
        });

        // เลือกรายแถวและกดปุ่มอนุมัติเดี่ยว
        document.getElementById('approvalsTableBody')?.addEventListener('change', (e) => {
            if (e.target.classList.contains('chk-approval-row')) {
                const id = e.target.dataset.id;
                if (e.target.checked) {
                    this.selectedIds.add(id);
                } else {
                    this.selectedIds.delete(id);
                }
                this.#updateBulkSelectionCount();
            }
        });

        document.getElementById('approvalsTableBody')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === 'approve-single') {
                await this.#processDecision([id], 'approved');
            } else if (action === 'reject-single') {
                await this.#processDecision([id], 'rejected');
            }
        });

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

document.addEventListener('DOMContentLoaded', () => {
    new ApprovalsController();
});