/**
 * @file assets/js/controllers/ApprovalsController.js
 * @description คลาสควบคุมหน้าอนุมัติลงเวลากรณีพิเศษ (Group By 2 มุมมอง และอนุมัติหลายรายการพร้อมกัน)
 */

import { UIHelpers } from '../core/UIHelpers.js';
import { AppLayout } from '../components/AppLayout.js';
import { AttendanceModel } from '../models/AttendanceModel.js';

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
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 bma-text-sub">ไม่มีรายการคำขอลงเวลากรณีพิเศษในสถานะที่เลือก</td></tr>`;
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
                        <td colspan="7" class="font-bold text-sm py-2.5 px-4 text-indigo-600 dark:text-indigo-300" style="border-left: 4px solid #6366F1;">
                            <i class="fa-solid fa-building-shield mr-1.5"></i>${bureauName} &gt; ${divisionName}
                        </td>
                    </tr>
                `;

                if (this.groupViewMode === 'group') {
                    for (const [groupName, items] of Object.entries(content)) {
                        html += `
                            <tr class="bg-slate-100/80 dark:bg-slate-800/50">
                                <td colspan="7" class="font-semibold text-xs py-2 pl-8 bma-text-main">
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
        const posFull = p.position_title ? `${p.position_title}${p.position_level ? ' ระดับ' + p.position_level : ''}` : '-';
        const timeRange = `${req.check_in_time ? req.check_in_time.slice(0, 5) : '-'} - ${req.check_out_time ? req.check_out_time.slice(0, 5) : '-'} น.`;
        const isPending = req.approval_status === 'pending';
        const isChecked = this.selectedIds.has(req.id) ? 'checked' : '';

        let commandColHtml = '';
        if (isPending) {
            commandColHtml = `
                <div class="flex items-center justify-center gap-1.5">
                    <button type="button" data-action="approve-single" data-id="${req.id}" class="btn-bma-primary py-1.5 px-3 text-xs">
                        <i class="fa-solid fa-check"></i> อนุมัติ
                    </button>
                    <button type="button" data-action="reject-single" data-id="${req.id}" class="btn-bma-outline py-1.5 px-3 text-xs text-rose-500 border-rose-500/40">
                        <i class="fa-solid fa-xmark"></i> ไม่อนุมัติ
                    </button>
                </div>
            `;
        } else if (req.approval_status === 'approved') {
            commandColHtml = `<span class="bma-badge bma-badge-success"><i class="fa-solid fa-circle-check"></i> อนุมัติแล้ว</span>`;
        } else {
            commandColHtml = `<span class="bma-badge bma-badge-danger"><i class="fa-solid fa-circle-xmark"></i> ไม่อนุมัติ</span>`;
        }

        return `
            <tr>
                <td class="text-center">
                    ${isPending ? `<input type="checkbox" class="chk-approval-row w-4 h-4 accent-emerald-600 cursor-pointer" data-id="${req.id}" ${isChecked}>` : '-'}
                </td>
                <td class="text-center font-semibold">${indexNo}</td>
                <td class="font-semibold bma-text-main">${fullName}</td>
                <td>${posFull}</td>
                <td>
                    <div class="font-semibold bma-text-main">${UIHelpers.formatThaiDate(req.work_date)}</div>
                    <div class="text-xs bma-text-sub">${req.shift_name} (${timeRange})</div>
                </td>
                <td>
                    <span class="bma-badge bma-badge-indigo">${req.remark || '-'}</span>
                </td>
                <td class="text-center">${commandColHtml}</td>
            </tr>
        `;
    }

    #bindEvents() {
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

if (!window.__BMA_SPA_ROUTER_ACTIVE__) {
    window.__BMA_SPA_ROUTER_ACTIVE__ = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new ApprovalsController());
    } else {
        new ApprovalsController();
    }
}