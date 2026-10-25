/**
 * @file assets/js/controllers/UsersController.js
 * @description คลาสควบคุมหน้าจัดการบัญชีผู้ใช้งาน (จำกัดสิทธิ์ Admin ส่วน/ฝ่าย ไม่ให้เห็นเมนู และ Admin สำนักงาน ไม่ให้เห็นคอลัมน์ "จัดการ" / ไม่มีสิทธิ์แก้ไขหรือลบ)
 */

import { UIHelpers } from '../core/UIHelpers.js';
import { AppLayout } from '../components/AppLayout.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { PersonnelModel } from '../models/PersonnelModel.js';
import { UserModel } from '../models/UserModel.js';

export class UsersController {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.usersList = [];
        this.personnelList = [];
        this.canEditOrDeleteUsers = false;
        this.init();
    }

    async init() {
        const layout = await AppLayout.initAdminLayout({
            activePage: 'users',
            pageTitle: 'จัดการบัญชีผู้ใช้งานและสิทธิ์การเข้าถึง',
            pageSubtitle: 'ผูกบัญชีผู้ใช้งานกับบุคลากร กำหนดขอบเขตการมองเห็น และอนุมัติคำขอรีเซ็ตรหัสผ่าน'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;

        // กฎ: บัญชีผู้ใช้ระดับ Admin ขอบเขตการมองเห็น "ส่วน/ฝ่าย" จะมองไม่เห็นและเข้าเมนูจัดการบัญชีผู้ใช้งานไม่ได้
        if (this.currentUser.role === 'Admin' && this.currentUser.visibility_level === 'division') {
            window.location.href = 'dashboard.html';
            return;
        }

        // กฎ: บัญชีผู้ใช้ระดับ Admin ขอบเขตการมองเห็น "สำนักงาน" จะมองเห็นเมนูนี้ แต่มองไม่เห็นคอลัมน์ "จัดการ" (ไม่มีสิทธิ์แก้ไขหรือลบ)
        this.canEditOrDeleteUsers = this.currentUser.role === 'SuperAdmin';

        this.settings = layout.settings || await SettingsModel.getSettings(false);

        if (this.currentUser.role === 'Admin') {
            document.getElementById('optFilterSuperAdmin')?.remove();
            document.getElementById('radioRoleSuperAdminWrap')?.classList.add('hidden');
        }

        // ซ่อนหัวคอลัมน์ "จัดการ" ทันทีหากเป็น Admin ขอบเขต "สำนักงาน"
        this.#toggleManageColumnHeader();

        this.#populateScopeDropdowns();
        this.#bindEvents();
        await this.loadUsersAndPersonnel();
    }

    /**
     * ซ่อนหรือแสดงหัวคอลัมน์ "จัดการ" ในตารางตามสิทธิ์ของผู้ใช้งาน (index 5)
     */
    #toggleManageColumnHeader() {
        const tableHeaders = document.querySelectorAll('#usersTableBody')?.[0]?.closest('table')?.querySelectorAll('thead th');
        if (tableHeaders && tableHeaders.length >= 6) {
            const manageHeaderTh = tableHeaders[5];
            if (manageHeaderTh) {
                manageHeaderTh.classList.toggle('hidden', !this.canEditOrDeleteUsers);
            }
        }
    }

    #populateScopeDropdowns() {
        let bureaus = SettingsModel.getUniqueBureaus(this.settings);
        if (this.currentUser.role === 'Admin' && this.currentUser.scope_bureau) {
            bureaus = [this.currentUser.scope_bureau];
        }

        const bureauSelect = document.getElementById('usrScopeBureau');
        if (bureauSelect) {
            bureauSelect.innerHTML = bureaus.map(b => `<option value="${b}">${b}</option>`).join('');
            this.#updateScopeDivisionDropdown(bureauSelect.value);
        }
    }

    #updateScopeDivisionDropdown(selectedBureau, selectedDivision = '') {
        let divisions = SettingsModel.getUniqueDivisions(this.settings, selectedBureau);
        if (this.currentUser.role === 'Admin' && this.currentUser.visibility_level === 'division' && this.currentUser.scope_division) {
            divisions = [this.currentUser.scope_division];
        }

        const divSelect = document.getElementById('usrScopeDivision');
        if (!divSelect) return;

        divSelect.innerHTML = divisions.map(d => `<option value="${d}">${d}</option>`).join('');
        if (selectedDivision && divisions.includes(selectedDivision)) {
            divSelect.value = selectedDivision;
        }
    }

    async loadUsersAndPersonnel() {
        const tbody = document.getElementById('usersTableBody');
        const resetTbody = document.getElementById('passwordResetTableBody');
        const colCount = this.canEditOrDeleteUsers ? 6 : 5;
        if (tbody) {
            tbody.innerHTML = UIHelpers.renderTableSkeleton(5, colCount);
        }
        if (resetTbody) {
            resetTbody.innerHTML = UIHelpers.renderTableSkeleton(3, 6);
        }

        UIHelpers.showLoading('กำลังโหลดข้อมูลบัญชีผู้ใช้งาน...');
        try {
            const [users, personnel] = await Promise.all([
                UserModel.getAll(this.currentUser),
                PersonnelModel.getAll(this.currentUser)
            ]);
            this.usersList = users;
            this.personnelList = personnel;
            this.#renderPersonnelSelectOptions('');
            this.#renderUsersTable();
            await AppLayout.refreshNotificationBell(this.currentUser);
        } finally {
            UIHelpers.hideLoading();
        }
    }

    #renderPersonnelSelectOptions(filterText = '', selectedPersonnelId = '') {
        const selectEl = document.getElementById('usrPersonnelSelect');
        if (!selectEl) return;

        const keyword = filterText.toLowerCase().trim();
        const filtered = this.personnelList.filter(p => {
            if (!keyword) return true;
            const full = `${p.prefix}${p.first_name} ${p.last_name} ${p.national_id || ''} ${p.division}`.toLowerCase();
            return full.includes(keyword);
        });

        let html = `<option value="">-- เลือกบุคลากร (${filtered.length} รายชื่อ) --</option>`;
        for (const p of filtered) {
            const fullName = `${p.prefix}${p.first_name} ${p.last_name}`;
            const nid = p.national_id ? ` (${p.national_id})` : '';
            const isSelected = p.id === selectedPersonnelId ? 'selected' : '';
            html += `<option value="${p.id}" ${isSelected}>${fullName}${nid} - ${p.division}</option>`;
        }
        selectEl.innerHTML = html;
    }

    #renderUsersTable() {
        this.#toggleManageColumnHeader();
        const tbody = document.getElementById('usersTableBody');
        const resetTbody = document.getElementById('passwordResetTableBody');
        const badgeResetCount = document.getElementById('pendingResetCountBadge');
        if (!tbody) return;

        const keyword = (document.getElementById('searchUserInput')?.value || '').toLowerCase().trim();
        const roleFilter = document.getElementById('filterUserRole')?.value || 'all';
        const resetFilter = document.getElementById('filterResetRequest')?.value || 'all';

        // 1. ตารางหลัก: บัญชีผู้ใช้งาน (Main Users Table - 6 คอลัมน์)
        const filtered = this.usersList.filter(u => {
            if (roleFilter !== 'all' && u.role !== roleFilter) return false;
            if (resetFilter === 'pending' && !u.password_reset_requested) return false;
            if (!keyword) return true;
            const text = `${u.username} ${u.full_name} ${u.national_id || ''} ${u.scope_bureau || ''} ${u.scope_division || ''}`.toLowerCase();
            return text.includes(keyword);
        });

        const colSpan = this.canEditOrDeleteUsers ? 6 : 5;

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center py-8 bma-text-sub">ไม่พบข้อมูลบัญชีผู้ใช้งาน</td></tr>`;
        } else {
            tbody.innerHTML = filtered.map((u, idx) => {
                const roleMeta = PersonnelModel.getRolePastelMeta(u.role);

                let scopeDesc = 'เฉพาะบันทึกเวลาตนเอง';
                if (u.role === 'SuperAdmin') {
                    scopeDesc = 'ทุกหน่วยงาน / ทุกสังกัด';
                } else if (u.role === 'Admin') {
                    scopeDesc = u.visibility_level === 'bureau'
                        ? `ระดับสำนักงาน/กอง: ${u.scope_bureau || '-'}`
                        : `ระดับส่วน/ฝ่าย: ${u.scope_division || '-'}`;
                }

                // คอลัมน์ "จัดการ": แสดงเฉพาะผู้ที่มีสิทธิ์แก้ไขหรือลบ (SuperAdmin) เท่านั้น ส่วน Admin ขอบเขต "สำนักงาน" จะมองไม่เห็นคอลัมน์นี้
                const manageColumnHtml = this.canEditOrDeleteUsers
                    ? `
                        <td class="text-center space-x-1 whitespace-nowrap">
                            <button type="button" data-action="edit-user" data-id="${u.id}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500" title="แก้ไข">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button type="button" data-action="delete-user" data-id="${u.id}" data-name="${u.full_name}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500" title="ลบ">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    `
                    : '';

                return `
                    <tr class="${u.password_reset_requested ? 'bg-amber-500/5' : ''}">
                        <td class="text-center font-semibold">${idx + 1}</td>
                        <td class="font-mono font-bold bma-text-main">${u.username}</td>
                        <td>
                            <div class="font-bold bma-text-main whitespace-nowrap">${u.full_name}</div>
                            <div class="text-xs bma-text-sub">เลขบัตร: ${u.national_id || u.personnel?.national_id || '-'}</div>
                        </td>
                        <td><span class="bma-badge ${roleMeta.badgeClass}">${u.role}</span></td>
                        <td class="text-xs bma-text-sub">${scopeDesc}</td>
                        ${manageColumnHtml}
                    </tr>
                `;
            }).join('');
        }

        // 2. ตารางที่ 2: คำขอรีเซ็ตรหัสผ่าน (Password Reset Requests Table - 6 คอลัมน์)
        const totalPendingResets = this.usersList.filter(u => u.password_reset_requested);
        if (badgeResetCount) {
            badgeResetCount.textContent = String(totalPendingResets.length);
        }

        if (resetTbody) {
            const filteredResets = totalPendingResets.filter(u => {
                if (roleFilter !== 'all' && u.role !== roleFilter) return false;
                if (!keyword) return true;
                const text = `${u.username} ${u.full_name} ${u.national_id || ''} ${u.scope_bureau || ''} ${u.scope_division || ''}`.toLowerCase();
                return text.includes(keyword);
            });

            if (filteredResets.length === 0) {
                resetTbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 bma-text-sub">ไม่มีคำขอเปลี่ยนรหัสผ่าน</td></tr>`;
            } else {
                resetTbody.innerHTML = filteredResets.map((u, idx) => {
                    const roleMeta = PersonnelModel.getRolePastelMeta(u.role);

                    let scopeDesc = 'เฉพาะบันทึกเวลาตนเอง';
                    if (u.role === 'SuperAdmin') {
                        scopeDesc = 'ทุกหน่วยงาน / ทุกสังกัด';
                    } else if (u.role === 'Admin') {
                        scopeDesc = u.visibility_level === 'bureau'
                            ? `ระดับสำนักงาน/กอง: ${u.scope_bureau || '-'}`
                            : `ระดับส่วน/ฝ่าย: ${u.scope_division || '-'}`;
                    }

                    return `
                        <tr class="bg-amber-50/20 dark:bg-amber-950/10">
                            <td class="text-center font-semibold">${idx + 1}</td>
                            <td class="font-mono font-bold bma-text-main">${u.username}</td>
                            <td>
                                <div class="font-bold bma-text-main whitespace-nowrap">${u.full_name}</div>
                                <div class="text-xs bma-text-sub">เลขบัตร: ${u.national_id || u.personnel?.national_id || '-'}</div>
                            </td>
                            <td><span class="bma-badge ${roleMeta.badgeClass}">${u.role}</span></td>
                            <td class="text-xs bma-text-sub">${scopeDesc}</td>
                            <td class="text-center whitespace-nowrap">
                                <div class="flex items-center justify-center gap-1.5">
                                    <button type="button" data-action="approve-reset" data-id="${u.id}" data-name="${u.full_name}" class="btn-bma-primary py-1 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm" title="อนุมัติรีเซ็ตรหัสผ่าน">
                                        <i class="fa-solid fa-check"></i> อนุมัติ
                                    </button>
                                    <button type="button" data-action="reject-reset" data-id="${u.id}" data-name="${u.full_name}" class="btn-bma-outline py-1 px-3 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-300 dark:border-rose-800 rounded-lg" title="ไม่อนุมัติ">
                                        <i class="fa-solid fa-xmark"></i> ไม่อนุมัติ
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }
    }

    #toggleAdminScopeUI() {
        const selectedRole = document.querySelector('input[name="usrRoleRadio"]:checked')?.value || 'User';
        const scopeBox = document.getElementById('adminScopeConfigBox');
        const visLevel = document.querySelector('input[name="usrVisibilityLevel"]:checked')?.value || 'division';
        const divWrap = document.getElementById('usrScopeDivisionWrap');

        if (selectedRole === 'Admin') {
            scopeBox?.classList.remove('hidden');
            if (visLevel === 'bureau') {
                divWrap?.classList.add('hidden');
            } else {
                divWrap?.classList.remove('hidden');
            }
        } else {
            scopeBox?.classList.add('hidden');
        }
    }

    #openModal(editUser = null) {
        if (editUser && !this.canEditOrDeleteUsers) {
            UIHelpers.alert('ไม่มีสิทธิ์ดำเนินการ', 'บัญชีระดับ Admin ไม่มีสิทธิ์แก้ไขข้อมูลบัญชีผู้ใช้งาน', 'warning');
            return;
        }

        const modal = document.getElementById('modalUserAccountForm');
        const titleEl = document.getElementById('modalUserTitle');
        document.getElementById('usrPersonnelSearchFilter').value = '';

        if (!editUser) {
            titleEl.innerHTML = `<i class="fa-solid fa-user-plus" style="color: var(--bma-primary);"></i><span>เพิ่มบัญชีผู้ใช้งานและผูกข้อมูลบุคลากร</span>`;
            document.getElementById('usrAccountId').value = '';
            this.#renderPersonnelSelectOptions('', '');
            document.getElementById('usrFullName').value = '';
            document.getElementById('usrNationalId').value = '';
            document.getElementById('usrUsername').value = '';
            document.getElementById('usrPassword').value = '';
            document.getElementById('usrConfirmPassword').value = '';
            document.getElementById('usrPassword').required = true;
            document.getElementById('usrConfirmPassword').required = true;
            document.getElementById('usrPwdRequiredStar').classList.remove('hidden');
            document.getElementById('usrConfirmRequiredStar').classList.remove('hidden');

            const userRadio = document.querySelector('input[name="usrRoleRadio"][value="User"]');
            if (userRadio) userRadio.checked = true;
        } else {
            titleEl.innerHTML = `<i class="fa-solid fa-user-pen" style="color: var(--bma-primary);"></i><span>แก้ไขบัญชีผู้ใช้งาน</span>`;
            document.getElementById('usrAccountId').value = editUser.id;
            this.#renderPersonnelSelectOptions('', editUser.personnel_id || '');
            document.getElementById('usrFullName').value = editUser.full_name || '';
            document.getElementById('usrNationalId').value = editUser.national_id || editUser.personnel?.national_id || '';
            document.getElementById('usrUsername').value = editUser.username || '';
            document.getElementById('usrPassword').value = '';
            document.getElementById('usrConfirmPassword').value = '';
            document.getElementById('usrPassword').required = false;
            document.getElementById('usrConfirmPassword').required = false;
            document.getElementById('usrPwdRequiredStar').classList.add('hidden');
            document.getElementById('usrConfirmRequiredStar').classList.add('hidden');

            const roleRadio = document.querySelector(`input[name="usrRoleRadio"][value="${editUser.role}"]`);
            if (roleRadio) roleRadio.checked = true;

            const visVal = editUser.visibility_level === 'bureau' ? 'bureau' : 'division';
            const visRadio = document.querySelector(`input[name="usrVisibilityLevel"][value="${visVal}"]`);
            if (visRadio) visRadio.checked = true;

            if (editUser.scope_bureau) {
                document.getElementById('usrScopeBureau').value = editUser.scope_bureau;
                this.#updateScopeDivisionDropdown(editUser.scope_bureau, editUser.scope_division);
            }
        }

        this.#toggleAdminScopeUI();
        modal?.classList.remove('hidden');
    }

    #closeModal() {
        document.getElementById('modalUserAccountForm')?.classList.add('hidden');
    }

    #bindEvents() {
        document.getElementById('searchUserInput')?.addEventListener('input', () => this.#renderUsersTable());
        document.getElementById('filterUserRole')?.addEventListener('change', () => this.#renderUsersTable());
        document.getElementById('filterResetRequest')?.addEventListener('change', () => this.#renderUsersTable());

        document.getElementById('btnOpenAddUserModal')?.addEventListener('click', () => this.#openModal(null));
        document.getElementById('btnCloseUserModal')?.addEventListener('click', () => this.#closeModal());
        document.getElementById('btnCancelUserModal')?.addEventListener('click', () => this.#closeModal());

        document.getElementById('usrPersonnelSearchFilter')?.addEventListener('input', (e) => {
            const currentSelected = document.getElementById('usrPersonnelSelect').value;
            this.#renderPersonnelSelectOptions(e.target.value, currentSelected);
        });

        document.getElementById('usrPersonnelSelect')?.addEventListener('change', (e) => {
            const personId = e.target.value;
            const person = this.personnelList.find(p => p.id === personId);
            if (!person) return;

            document.getElementById('usrFullName').value = `${person.prefix}${person.first_name} ${person.last_name}`;
            document.getElementById('usrNationalId').value = person.national_id || '';

            const isEditing = Boolean(document.getElementById('usrAccountId').value);
            if (!isEditing && person.national_id && person.national_id.length === 13) {
                const last6 = UIHelpers.getLast6DigitsFromNationalId(person.national_id);
                document.getElementById('usrUsername').value = person.national_id;
                document.getElementById('usrPassword').value = last6;
                document.getElementById('usrConfirmPassword').value = last6;
            }

            if (person.bureau) {
                document.getElementById('usrScopeBureau').value = person.bureau;
                this.#updateScopeDivisionDropdown(person.bureau, person.division);
            }
        });

        document.querySelectorAll('input[name="usrRoleRadio"]').forEach(r => {
            r.addEventListener('change', () => this.#toggleAdminScopeUI());
        });
        document.querySelectorAll('input[name="usrVisibilityLevel"]').forEach(r => {
            r.addEventListener('change', () => this.#toggleAdminScopeUI());
        });

        document.getElementById('usrScopeBureau')?.addEventListener('change', (e) => {
            this.#updateScopeDivisionDropdown(e.target.value);
        });

        document.getElementById('formUserAccount')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.#handleSaveUserAccount();
        });

        document.getElementById('btnExportUsersExcel')?.addEventListener('click', () => {
            const rows = this.usersList.map((u, idx) => ({
                'ลำดับ': idx + 1,
                'ชื่อบัญชีผู้ใช้ (Username)': u.username,
                'ชื่อ-นามสกุล': u.full_name,
                'เลขบัตรประชาชน': u.national_id || '',
                'บทบาท (Role)': u.role,
                'ระดับการมองเห็น': u.visibility_level,
                'สำนักงาน/กอง': u.scope_bureau || '',
                'ส่วน/ฝ่าย': u.scope_division || ''
            }));
            UIHelpers.exportToExcelUTF8(rows, `บัญชีผู้ใช้งาน_${UIHelpers.getTodayISO()}`, 'Users');
        });

        document.getElementById('btnTemplateUsersExcel')?.addEventListener('click', () => {
            const templateRows = UserModel.getExcelTemplateRows();
            UIHelpers.exportToExcelUTF8(templateRows, 'Template_นำเข้าบัญชีผู้ใช้งาน', 'Template');
        });

        document.getElementById('inputImportUsersExcel')?.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            e.target.value = '';

            UIHelpers.showLoading('กำลังนำเข้าบัญชีผู้ใช้งานจากไฟล์ Excel...');
            try {
                const rows = await UIHelpers.parseExcelFileUTF8(file);
                const res = await UserModel.bulkImportFromExcel(rows, this.currentUser);
                UIHelpers.hideLoading();
                await this.loadUsersAndPersonnel();
                await UIHelpers.alert(res.success ? 'นำเข้าสำเร็จ' : 'แจ้งเตือน', res.message, res.success ? 'success' : 'warning');
            } catch (err) {
                UIHelpers.hideLoading();
                await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
            }
        });

        const handleTableActionClick = async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;
            const name = btn.dataset.name || '';

            if (action === 'approve-reset') {
                const confirmed = await UIHelpers.confirm(
                    'ยืนยันการอนุมัติรีเซ็ตรหัสผ่าน',
                    `เมื่ออนุมัติแล้ว รหัสผ่านของ "${name}" จะถูกรีเซ็ตกลับเป็นหมายเลข 6 ตัวท้ายของบัตรประชาชนทันที`,
                    'อนุมัติรีเซ็ตรหัสผ่าน',
                    'question'
                );
                if (confirmed) {
                    UIHelpers.showLoading('กำลังรีเซ็ตรหัสผ่านเป็นเลข 6 ตัวท้ายบัตรประชาชน...');
                    const res = await UserModel.processPasswordResetRequest(id, true);
                    UIHelpers.hideLoading();
                    await this.loadUsersAndPersonnel();
                    await UIHelpers.alert(res.success ? 'อนุมัติสำเร็จ' : 'ไม่สามารถอนุมัติได้', res.message, res.success ? 'success' : 'error');
                }
            } else if (action === 'reject-reset') {
                const confirmed = await UIHelpers.confirm(
                    'ไม่อนุมัติคำขอเปลี่ยนรหัสผ่าน',
                    `คุณต้องการปฏิเสธคำขอรีเซ็ตรหัสผ่านของ "${name}" ใช่หรือไม่?`,
                    'ไม่อนุมัติ',
                    'warning'
                );
                if (confirmed) {
                    UIHelpers.showLoading('กำลังบันทึกผลการไม่อนุมัติ...');
                    const res = await UserModel.processPasswordResetRequest(id, false);
                    UIHelpers.hideLoading();
                    await this.loadUsersAndPersonnel();
                    await UIHelpers.alert('ดำเนินการเรียบร้อย', res.message, 'info');
                }
            } else if (action === 'edit-user') {
                if (!this.canEditOrDeleteUsers) return;
                const target = this.usersList.find(u => u.id === id);
                if (target) this.#openModal(target);
            } else if (action === 'delete-user') {
                if (!this.canEditOrDeleteUsers) return;
                const confirmed = await UIHelpers.confirm(
                    'ยืนยันการลบบัญชีผู้ใช้งาน',
                    `ต้องการลบบัญชีผู้ใช้งานของ "${name}" ออกจากระบบใช่หรือไม่?`,
                    'ลบบัญชี',
                    'warning'
                );
                if (confirmed) {
                    UIHelpers.showLoading('กำลังลบบัญชีผู้ใช้งาน...');
                    const res = await UserModel.delete(id, this.currentUser);
                    UIHelpers.hideLoading();
                    if (res.success) {
                        await this.loadUsersAndPersonnel();
                        await UIHelpers.showToast(res.message, 'success', 2500);
                    } else {
                        await UIHelpers.alert('ลบไม่สำเร็จ', res.message, 'error');
                    }
                }
            }
        };

        document.getElementById('usersTableBody')?.addEventListener('click', handleTableActionClick);
        document.getElementById('passwordResetTableBody')?.addEventListener('click', handleTableActionClick);
    }

    async #handleSaveUserAccount() {
        const id = document.getElementById('usrAccountId').value;
        if (id && !this.canEditOrDeleteUsers) {
            await UIHelpers.alert('ไม่มีสิทธิ์แก้ไข', 'บัญชีระดับ Admin ไม่มีสิทธิ์แก้ไขข้อมูลบัญชีผู้ใช้งาน', 'error');
            return;
        }

        const role = document.querySelector('input[name="usrRoleRadio"]:checked')?.value || 'User';
        const visibilityLevel = document.querySelector('input[name="usrVisibilityLevel"]:checked')?.value || 'division';

        const payload = {
            personnel_id: document.getElementById('usrPersonnelSelect').value || null,
            full_name: document.getElementById('usrFullName').value,
            national_id: document.getElementById('usrNationalId').value,
            username: document.getElementById('usrUsername').value,
            password: document.getElementById('usrPassword').value,
            confirm_password: document.getElementById('usrConfirmPassword').value,
            role,
            visibility_level: role === 'Admin' ? visibilityLevel : (role === 'SuperAdmin' ? 'all' : 'none'),
            scope_bureau: document.getElementById('usrScopeBureau').value,
            scope_division: document.getElementById('usrScopeDivision').value
        };

        UIHelpers.showLoading('กำลังบันทึกข้อมูลบัญชีผู้ใช้งาน...');
        try {
            const res = id
                ? await UserModel.update(id, payload, this.currentUser)
                : await UserModel.create(payload, this.currentUser);

            UIHelpers.hideLoading();
            if (!res.success) {
                await UIHelpers.alert('บันทึกไม่สำเร็จ', res.message, 'error');
                return;
            }

            this.#closeModal();
            await this.loadUsersAndPersonnel();
            await UIHelpers.showToast(res.message, 'success', 2500);
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
        }
    }
}

if (!window.__BMA_SPA_ROUTER_ACTIVE__) {
    window.__BMA_SPA_ROUTER_ACTIVE__ = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new UsersController());
    } else {
        new UsersController();
    }
}