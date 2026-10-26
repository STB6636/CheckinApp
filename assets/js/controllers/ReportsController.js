/**
 * @file assets/js/controllers/ReportsController.js
 * @description คลาสควบคุมหน้ารายงานการลงเวลา (คลิกแถวดูฟอร์มโปรไฟล์เฉพาะของ Row นั้นๆ พร้อมรูปถ่ายขนาดใหญ่และพิกัด Google Map)
 */

import { Config } from '../core/Config.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { AppLayout } from '../components/AppLayout.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { PersonnelModel } from '../models/PersonnelModel.js';
import { AttendanceModel } from '../models/AttendanceModel.js';

export class ReportsController {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.allPersonnel = [];
        this.records = [];
        this.dateMode = 'single';
        this.groupViewMode = 'division';
        this.selectedStatusKeys = new Set(['normal', 'late']);
        this.currentPhotoBlobUrl = null;
        this.init();
    }

    async init() {
        const layout = await AppLayout.initAdminLayout({
            activePage: 'reports',
            pageTitle: 'รายงานการลงเวลาปฏิบัติราชการ',
            pageSubtitle: 'ฟิลเตอร์ตามวันที่/ช่วงวันที่ แยกตารางตาม TAG สถานะ พิมพ์ PDF A4 แนวนอน และคลิกแถวดูโปรไฟล์เฉพาะรายการ'
        });

        if (!layout.currentUser) return;
        this.currentUser = layout.currentUser;
        this.settings = layout.settings || await SettingsModel.getSettings(false);

        // สิทธิ์ 3 ระดับ: SuperAdmin = แก้+ลบ, Admin กอง = แก้ได้ ห้ามลบ, Admin ฝ่าย = Read-only
        this.isSuperAdmin = this.currentUser.role === 'SuperAdmin';
        this.isAdminBureau = this.currentUser.role === 'Admin' && this.currentUser.visibility_level !== 'division';
        this.isAdminDivision = this.currentUser.role === 'Admin' && this.currentUser.visibility_level === 'division';
        this.canAddRecord = this.isSuperAdmin || this.isAdminBureau;
        this.canManageRecords = this.isSuperAdmin || this.isAdminBureau;

        const btnAdd = document.getElementById('btnOpenAddReportRecord');
        if (btnAdd) {
            btnAdd.classList.toggle('hidden', !this.canAddRecord);
        }

        const mobileShortcutEl = document.getElementById('reportMobileShortcutContainer');
        if (mobileShortcutEl) {
            mobileShortcutEl.innerHTML = AppLayout.getMobileShortcutGridHtml(this.currentUser);
        }

        const todayIso = UIHelpers.getTodayISO();
        const singleInput = document.getElementById('reportSingleDateInput');
        const startInput = document.getElementById('reportStartDateInput');
        const endInput = document.getElementById('reportEndDateInput');

        if (singleInput) singleInput.value = todayIso;
        if (startInput) startInput.value = todayIso;
        if (endInput) endInput.value = todayIso;

        this.#renderStatusTagFilterChips();
        this.#bindEvents();
        await this.loadReportData();
    }

    #getStatusColor(statusKey) {
        const colors = {
            ...Config.DEFAULT_SETTINGS.category_colors,
            ...(this.settings?.category_colors || {})
        };
        return colors[statusKey] || '#007B3E';
    }

    #renderStatusTagFilterChips() {
        const container = document.getElementById('statusTagsFilterContainer');
        if (!container) return;

        container.innerHTML = Config.OFFICIAL_STATUSES.map(st => {
            const isSelected = this.selectedStatusKeys.has(st.key);
            const color = this.#getStatusColor(st.key);
            const countInStatus = this.records.filter(r => r.status_category === st.key).length;

            return `
                <button type="button"
                        data-tag-key="${st.key}"
                        class="status-tag-chip ${isSelected ? 'active' : ''}"
                        style="${isSelected ? `background-color: ${color}; border-color: ${color};` : `border-color: ${color}55;`}">
                    <i class="fa-solid ${isSelected ? 'fa-square-check' : 'fa-square'}"></i>
                    <span>${st.label}</span>
                    <span class="px-1.5 py-0.2 rounded-full text-[11px] ${isSelected ? 'bg-black/25 text-white' : 'bma-info-box bma-text-main'}">
                        ${countInStatus}
                    </span>
                </button>
            `;
        }).join('');
    }

    #getFormattedReportDateSubtitle() {
        if (this.dateMode === 'single') {
            const d = document.getElementById('reportSingleDateInput')?.value || UIHelpers.getTodayISO();
            return `ประจำวันที่ ${UIHelpers.formatThaiFullDate(d)}`;
        } else {
            const s = document.getElementById('reportStartDateInput')?.value || UIHelpers.getTodayISO();
            const e = document.getElementById('reportEndDateInput')?.value || s;
            return `ตั้งแต่วันที่ ${UIHelpers.formatThaiFullDate(s)} ถึงวันที่ ${UIHelpers.formatThaiFullDate(e)}`;
        }
    }

    async loadReportData() {
        let startDate = UIHelpers.getTodayISO();
        let endDate = startDate;

        if (this.dateMode === 'single') {
            startDate = document.getElementById('reportSingleDateInput')?.value || startDate;
            endDate = startDate;
        } else {
            startDate = document.getElementById('reportStartDateInput')?.value || startDate;
            endDate = document.getElementById('reportEndDateInput')?.value || startDate;
            if (endDate < startDate) {
                endDate = startDate;
                document.getElementById('reportEndDateInput').value = startDate;
            }
        }

        const subtitleEl = document.getElementById('reportDateDisplaySubtitle');
        if (subtitleEl) {
            subtitleEl.textContent = this.#getFormattedReportDateSubtitle();
        }

        UIHelpers.showLoading('กำลังประมวลผลข้อมูลรายงานการลงเวลา...');
        try {
            const [records, personnel] = await Promise.all([
                AttendanceModel.getReportRecordsByDateRange(startDate, endDate, this.currentUser),
                PersonnelModel.getAll(this.currentUser)
            ]);
            this.records = records;
            this.allPersonnel = personnel;
            this.#populatePersonnelDropdown();
            this.#renderStatusTagFilterChips();
            this.#renderSeparateTablesBySelectedTags(false);
        } finally {
            UIHelpers.hideLoading();
        }
    }

    #populatePersonnelDropdown() {
        const selectEl = document.getElementById('repPersonnelSelect');
        if (!selectEl) return;
        const allowedPersonnel = this.isSuperAdmin
            ? (this.allPersonnel || [])
            : (this.allPersonnel || []).filter(p => AuthService.canViewRecordByScope(this.currentUser, p));
        selectEl.innerHTML = allowedPersonnel.map(p =>
            `<option value="${p.id}">${p.prefix}${p.first_name} ${p.last_name} (${p.division})</option>`
        ).join('');
    }

    #formatGpsCoordinates(lat, lng) {
        if (lat === null || lat === undefined || lng === null || lng === undefined) return '';
        const nLat = parseFloat(lat);
        const nLng = parseFloat(lng);
        if (isNaN(nLat) || isNaN(nLng)) return '';
        const latDir = nLat >= 0 ? 'N' : 'S';
        const lngDir = nLng >= 0 ? 'E' : 'W';
        return `${Math.abs(nLat).toFixed(6)}° ${latDir}, ${Math.abs(nLng).toFixed(6)}° ${lngDir}`;
    }

    #renderSeparateTablesBySelectedTags(forPrintPdf = false) {
        const masterContainer = document.getElementById('reportTablesMasterContainer');
        const activeStatuses = Config.OFFICIAL_STATUSES.filter(st => this.selectedStatusKeys.has(st.key));

        if (activeStatuses.length === 0) {
            if (!forPrintPdf && masterContainer) {
                masterContainer.innerHTML = `
                    <div class="bma-card p-8 text-center bma-text-sub">
                        <i class="fa-solid fa-tags text-3xl mb-2 text-emerald-600 block"></i>
                        กรุณาคลิกเลือก TAG สถานะด้านบนอย่างน้อย 1 สถานะ เพื่อแสดงตารางรายงาน
                    </div>
                `;
            }
            return '';
        }

        const groupHeaderColor = this.settings?.category_colors?.group_header || '#007B3E';
        let combinedHtml = '';

        if (this.dateMode === 'range') {
            const uniqueDates = [...new Set(this.records.map(r => r.work_date))].filter(Boolean).sort();
            for (const dayDate of uniqueDates) {
                const dayRecords = this.records.filter(r => r.work_date === dayDate);
                const dayThaiFull = UIHelpers.formatThaiFullDate(dayDate);

                if (forPrintPdf) {
                    combinedHtml += `
                        <div class="day-section-banner" style="background-color: #00351B; color: #FFFFFF; padding: 8px 14px; font-weight: 800; font-size: 15px; border-radius: 6px; margin-top: 18px; margin-bottom: 12px; page-break-after: avoid;">
                            รายงานประจำวันที่ ${dayThaiFull}
                        </div>
                    `;
                } else {
                    combinedHtml += `
                        <div class="p-3.5 rounded-2xl bg-gradient-to-r from-[#00351B] to-[#00744B] text-white shadow-md flex items-center justify-between mt-6 first:mt-0">
                            <div class="flex items-center gap-2.5">
                                <span class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[#FDD835]">
                                    <i class="fa-solid fa-calendar-day"></i>
                                </span>
                                <h3 class="text-sm sm:text-base font-extrabold text-white">รายงานประจำวันที่ ${dayThaiFull}</h3>
                            </div>
                            <span class="text-xs text-emerald-100 font-semibold bg-white/10 px-3 py-1 rounded-full">
                                รวม ${dayRecords.length} รายการ
                            </span>
                        </div>
                    `;
                }

                for (const statusMeta of activeStatuses) {
                    const statusColor = this.#getStatusColor(statusMeta.key);
                    const tagRecords = dayRecords.filter(r => r.status_category === statusMeta.key);
                    combinedHtml += this.#renderSingleStatusTableHtml(statusMeta, statusColor, tagRecords, dayThaiFull, groupHeaderColor, forPrintPdf);
                }
            }
        } else {
            const singleDate = document.getElementById('reportSingleDateInput')?.value || UIHelpers.getTodayISO();
            const dayThaiFull = UIHelpers.formatThaiFullDate(singleDate);
            for (const statusMeta of activeStatuses) {
                const statusColor = this.#getStatusColor(statusMeta.key);
                const tagRecords = this.records.filter(r => r.status_category === statusMeta.key);
                combinedHtml += this.#renderSingleStatusTableHtml(statusMeta, statusColor, tagRecords, dayThaiFull, groupHeaderColor, forPrintPdf);
            }
        }

        if (!forPrintPdf && masterContainer) {
            masterContainer.innerHTML = combinedHtml;
        }
        return combinedHtml;
    }

    #renderSingleStatusTableHtml(statusMeta, statusColor, tagRecords, daySubtitle, groupHeaderColor, forPrintPdf) {
        const tableRowsHtml = this.#buildGroupedRowsForTag(tagRecords, groupHeaderColor, forPrintPdf);

        if (forPrintPdf) {
            return `
                <div class="tag-section-block">
                    <div class="tag-section-title" style="background-color: ${statusColor};">
                        ตารางสถานะ: ${statusMeta.label} - ประจำวันที่ ${daySubtitle} (จำนวน ${tagRecords.length} รายการ)
                    </div>
                    <table>
                        <colgroup>
                            <col style="width: 5%;">
                            <col style="width: 20%;">
                            <col style="width: 20%;">
                            <col style="width: 10%;">
                            <col style="width: 10%;">
                            <col style="width: 20%;">
                            <col style="width: 15%;">
                        </colgroup>
                        <thead>
                            <tr>
                                <th style="text-align: center;">ลำดับ</th>
                                <th>ชื่อ-นามสกุล</th>
                                <th>ตำแหน่ง</th>
                                <th style="text-align: center;">เวลาเข้างาน</th>
                                <th style="text-align: center;">เวลาออกงาน</th>
                                <th>พิกัด GPS</th>
                                <th>หมายเหตุ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHtml}
                        </tbody>
                    </table>
                </div>
            `;
        }

        return `
            <div class="bma-card p-5 space-y-3" style="border-top: 4px solid ${statusColor};">
                <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b bma-border">
                    <div class="flex items-center gap-2.5">
                        <span class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shadow-xs" style="background-color: ${statusColor};">
                            <i class="fa-solid ${statusMeta.icon}"></i>
                        </span>
                        <div>
                            <h3 class="text-base font-extrabold bma-text-main">
                                ตารางรายงานสถานะ: <span style="color: ${statusColor};">${statusMeta.label}</span>
                            </h3>
                            <p class="text-xs bma-text-sub">ประจำวันที่ ${daySubtitle}</p>
                        </div>
                    </div>
                    <span class="bma-badge text-white text-xs px-3 py-1 shadow-xs" style="background-color: ${statusColor};">
                        รวม ${tagRecords.length} รายการ
                    </span>
                </div>

                <div class="bma-table-container">
                    <table class="bma-table text-sm">
                        <thead>
                            <tr>
                                <th class="w-14 text-center">ลำดับ</th>
                                <th class="min-w-[180px]">ชื่อ-นามสกุล</th>
                                <th class="min-w-[180px]">ตำแหน่ง</th>
                                <th class="w-28 text-center">เวลาเข้างาน</th>
                                <th class="w-28 text-center">เวลาออกงาน</th>
                                <th class="min-w-[200px]">พิกัด GPS</th>
                                <th class="min-w-[140px]">หมายเหตุ</th>
                                ${this.canManageRecords ? '<th class="w-24 text-center no-print">จัดการ</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    #buildGroupedRowsForTag(tagRecords, groupHeaderColor, forPrintPdf) {
        const colSpan = (forPrintPdf || !this.canManageRecords) ? 7 : 8;
        if (!tagRecords || tagRecords.length === 0) {
            return `<tr><td colspan="${colSpan}" class="text-center py-6 bma-text-sub">ไม่มีข้อมูลบุคลากรในสถานะนี้</td></tr>`;
        }

        const grouped = PersonnelModel.groupPersonnel(tagRecords, this.groupViewMode);
        let rowsHtml = '';
        let runningNo = 1;

        for (const [bureauName, divisionsObj] of Object.entries(grouped)) {
            for (const [divisionName, content] of Object.entries(divisionsObj)) {
                rowsHtml += `
                    <tr class="group-row" style="background-color: ${groupHeaderColor}18;">
                        <td colspan="${colSpan}" class="font-bold text-sm py-2.5 px-4" style="color: ${groupHeaderColor}; border-left: 4px solid ${groupHeaderColor};">
                            <i class="fa-solid fa-building-user mr-1.5"></i>${bureauName} &gt; ${divisionName}
                        </td>
                    </tr>
                `;

                if (this.groupViewMode === 'group') {
                    for (const [groupName, members] of Object.entries(content)) {
                        rowsHtml += `
                            <tr class="sub-group-row bg-emerald-950/5 dark:bg-slate-800/50">
                                <td colspan="${colSpan}" class="font-semibold text-xs py-2 pl-8 bma-text-main">
                                    กลุ่มงาน: ${groupName} (${members.length} รายการ)
                                </td>
                            </tr>
                        `;
                        for (const rec of members) {
                            rowsHtml += this.#buildSingleRowHtml(rec, runningNo++, forPrintPdf);
                        }
                    }
                } else {
                    for (const rec of content) {
                        rowsHtml += this.#buildSingleRowHtml(rec, runningNo++, forPrintPdf);
                    }
                }
            }
        }

        return rowsHtml;
    }

    #buildSingleRowHtml(rec, indexNo, forPrintPdf) {
        const posDisplay = rec.position_full || '-';
        const remarkDisplay = rec.remark || '-';
        const lat = rec.check_in_lat ?? rec.check_out_lat;
        const lng = rec.check_in_lng ?? rec.check_out_lng;
        const gpsCoords = this.#formatGpsCoordinates(lat, lng);
        const locName = (rec.check_in_location || rec.check_out_location || '').trim();

        if (forPrintPdf) {
            return `
                <tr>
                    <td style="text-align: center;">${indexNo}</td>
                    <td>${rec.full_name}</td>
                    <td>${posDisplay}</td>
                    <td style="text-align: center; font-family: monospace; font-weight: 700;">${rec.check_in_time || '-'}</td>
                    <td style="text-align: center; font-family: monospace; font-weight: 700;">${rec.check_out_time || '-'}</td>
                    <td style="font-size: 11px;">
                        <div style="font-weight: 600;">${locName || '-'}</div>
                        ${gpsCoords ? `<div style="font-family: monospace; font-size: 10px; color: #64748B;">${gpsCoords}</div>` : ''}
                    </td>
                    <td>${remarkDisplay}</td>
                </tr>
            `;
        }

        return `
            <tr class="report-person-row cursor-pointer transition" data-row-uid="${rec.row_uid}" title="คลิกเพื่อดูโปรไฟล์ รูปถ่าย และพิกัด Google Map ของรายการนี้">
                <td class="text-center font-semibold">${indexNo}</td>
                <td>
                    <div class="font-bold bma-text-main flex items-center gap-1.5">
                        <span>${rec.full_name}</span>
                        <i class="fa-regular fa-id-badge text-xs text-emerald-600 opacity-75"></i>
                    </div>
                </td>
                <td class="font-medium">${posDisplay}</td>
                <td class="text-center font-mono font-bold">${rec.check_in_time ? rec.check_in_time + ' น.' : '-'}</td>
                <td class="text-center font-mono font-bold">${rec.check_out_time ? rec.check_out_time + ' น.' : '-'}</td>
                <td>
                    <div class="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title="${locName || '-'}">
                        ${locName ? `<i class="fa-solid fa-location-dot text-emerald-600 mr-1"></i>${locName}` : '-'}
                    </div>
                    ${gpsCoords ? `<div class="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${gpsCoords}</div>` : ''}
                </td>
                <td class="text-xs text-slate-600 dark:text-slate-300">
                    ${remarkDisplay}
                </td>
${this.canManageRecords ? `
                <td class="text-center space-x-1 whitespace-nowrap no-print">
                    ${AuthService.canEditAttendanceRecord(this.currentUser, rec) ? `
                        <button type="button" data-action="edit-record" data-row-uid="${rec.row_uid}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500" title="บันทึก/แก้ไขเวลา">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                    ` : ''}
                    ${(AuthService.canDeleteAttendanceRecord(this.currentUser, rec) && rec.log_id) ? `
                        <button type="button" data-action="delete-record" data-logid="${rec.log_id}" data-name="${rec.full_name}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500" title="ลบเวลา">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    ` : ''}
                </td>
                ` : ''}
            </tr>
        `;
    }

    /**
     * เปิดแสดงฟอร์มโปรไฟล์เฉพาะของ Row ที่คลิก:
     * 1. แสดงข้อมูลเฉพาะของ Row นั้นๆ แม้จะเป็นคนเดียวกันก็ตาม
     * 2. แสดงรูปที่ถ่ายมาขนาดใหญ่กว่าเดิม (3:4 Large Frame)
     * 3. แสดงพิกัดตำแหน่งและแผนที่ Google Map ของ Row นั้น
     * @param {string} rowUid
     */
    #openResumeProfileForSpecificRow(rowUid) {
        const rec = this.records.find(r => r.row_uid === rowUid);
        if (!rec) return;

        const person = this.allPersonnel.find(p => p.id === rec.personnel_id) || rec;
        const roleMeta = person.role_meta || PersonnelModel.getRolePastelMeta(person.account_role || 'User');
        const statusColor = this.#getStatusColor(rec.status_category);

        // 1. ส่วนหัว Banner (ซ่อนป้ายตาม Plan V2.23 และรักษา 100% Contract)
        const roleBadge = document.getElementById('resumeRoleBadge');
        if (roleBadge) {
            roleBadge.textContent = roleMeta.label;
            roleBadge.className = 'hidden';
        }

        const cleanTitle = (person.position_title || rec.position_title || '').trim();
        const cleanLevel = (person.position_level || rec.position_level || '').replace(/^ระดับ\s*/, '').trim();
        const mergedPosition = (cleanTitle && cleanLevel)
            ? `${cleanTitle}${cleanLevel}`
            : (cleanTitle || cleanLevel || rec.position_full || '-');

        const division = (rec.division || person.division || '').trim();
        const workGroup = (rec.work_group || person.work_group || '').trim();
        const orgParts = [];
        if (division) orgParts.push(division);
        if (workGroup) orgParts.push(workGroup);
        const hierarchyLine = orgParts.length > 0 ? `• ${orgParts.join(' • ')}` : '• -';

        const fullNameEl = document.getElementById('resumeFullName');
        if (fullNameEl) fullNameEl.textContent = rec.full_name;

        const posEl = document.getElementById('resumePositionHeadline');
        if (posEl) posEl.textContent = mergedPosition;

        const orgEl = document.getElementById('resumeOrgHeadline');
        if (orgEl) orgEl.textContent = hierarchyLine;

        const dateHeadline = document.getElementById('resumeRowDateHeadline');
        if (dateHeadline) {
            dateHeadline.textContent = rec.work_date_thai_full;
            dateHeadline.className = 'hidden';
        }

        const rowStatusBadge = document.getElementById('resumeRowStatusBadge');
        if (rowStatusBadge) {
            rowStatusBadge.textContent = rec.status_label;
            rowStatusBadge.style.backgroundColor = statusColor;
            rowStatusBadge.className = 'hidden';
        }

        // 2. รูปที่ถ่ายมาขนาดใหญ่ของ Row นั้นๆ
        const photoUrl = rec.check_in_photo || rec.check_out_photo || '';
        const largePhotoBox = document.getElementById('resumeLargePhotoBox');
        const fullPhotoLink = document.getElementById('resumeOpenFullPhotoLink');

        if (this.currentPhotoBlobUrl) {
            URL.revokeObjectURL(this.currentPhotoBlobUrl);
            this.currentPhotoBlobUrl = null;
        }

        if (largePhotoBox) {
            if (photoUrl) {
                largePhotoBox.innerHTML = `<img src="${photoUrl}" alt="${rec.full_name}" class="w-full h-full object-cover">`;
                if (fullPhotoLink) {
                    if (photoUrl.startsWith('data:image/')) {
                        try {
                            const parts = photoUrl.split(',');
                            const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
                            const bstr = atob(parts[1]);
                            let n = bstr.length;
                            const u8arr = new Uint8Array(n);
                            while (n--) {
                                u8arr[n] = bstr.charCodeAt(n);
                            }
                            const blob = new Blob([u8arr], { type: mime });
                            this.currentPhotoBlobUrl = URL.createObjectURL(blob);
                            fullPhotoLink.href = this.currentPhotoBlobUrl;
                        } catch (err) {
                            fullPhotoLink.href = photoUrl;
                        }
                    } else {
                        fullPhotoLink.href = photoUrl;
                    }
                    fullPhotoLink.classList.remove('hidden');
                }
            } else {
                largePhotoBox.innerHTML = `
                    <div class="text-center p-4 text-emerald-200/80 text-xs">
                        <i class="fa-solid fa-camera-slash text-4xl mb-2 block text-[#FDD835]"></i>
                        <span>รายการนี้ไม่มีภาพถ่ายบันทึกไว้</span>
                    </div>
                `;
                fullPhotoLink?.classList.add('hidden');
            }
        }

        // 3. ข้อมูลประจำตัว (รักษา 100% Contract)
        const natEl = document.getElementById('resumeNationalId');
        if (natEl) natEl.textContent = rec.national_id || person.national_id || 'ไม่ระบุ';
        const userEl = document.getElementById('resumeUsername');
        if (userEl) userEl.textContent = person.account_username || rec.national_id || '-';
        const specEl = document.getElementById('resumePosSpec');
        if (specEl) specEl.textContent = `${rec.position_type || '-'} / ${rec.position_full}`;

        // 4. ข้อมูลการลงเวลาเฉพาะของ Row นี้
        const fullDateEl = document.getElementById('resumeRowFullDate');
        if (fullDateEl) fullDateEl.textContent = rec.work_date_thai_full;
        const shiftEl = document.getElementById('resumeRowShiftName');
        if (shiftEl) shiftEl.textContent = rec.shift_name || '-';
        const inEl = document.getElementById('resumeRowCheckinTime');
        if (inEl) inEl.textContent = rec.check_in_time ? `${rec.check_in_time} น.` : 'ไม่ได้ลงเวลา';
        const outEl = document.getElementById('resumeRowCheckoutTime');
        if (outEl) outEl.textContent = rec.check_out_time ? `${rec.check_out_time} น.` : 'ไม่ได้ลงเวลา';
        const remEl = document.getElementById('resumeRowRemark');
        if (remEl) remEl.textContent = rec.remark || 'ไม่มีหมายเหตุ';

        // 5. พิกัดตำแหน่งและแผนที่ Google Map เฉพาะของ Row นี้
        const lat = rec.check_in_lat ?? rec.check_out_lat;
        const lng = rec.check_in_lng ?? rec.check_out_lng;
        const locName = (rec.check_in_location || rec.check_out_location || 'ไม่ระบุสถานที่').trim();

        const locNameEl = document.getElementById('resumeRowLocationName');
        if (locNameEl) locNameEl.textContent = locName;

        const coordsEl = document.getElementById('resumeRowGpsCoords');
        const mapLinkEl = document.getElementById('resumeRowGoogleMapLink');
        const mapIframeEl = document.getElementById('resumeRowMapIframe');
        const mapPlaceholderEl = document.getElementById('resumeRowMapPlaceholder');

        if (typeof lat === 'number' && typeof lng === 'number') {
            const formattedGps = this.#formatGpsCoordinates(lat, lng);
            if (coordsEl) coordsEl.textContent = formattedGps || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            if (mapLinkEl) {
                mapLinkEl.href = `https://www.google.com/maps?q=${lat},${lng}`;
                mapLinkEl.classList.remove('hidden');
            }
            if (mapIframeEl) {
                mapIframeEl.src = `https://maps.google.com/maps?q=${lat},${lng}&hl=th&z=17&output=embed`;
                mapIframeEl.classList.remove('hidden');
                mapPlaceholderEl?.classList.add('hidden');
            }
        } else {
            if (coordsEl) coordsEl.textContent = 'ไม่ได้บันทึกพิกัด GPS';
            mapLinkEl?.classList.add('hidden');
            if (mapIframeEl) {
                mapIframeEl.src = '';
                mapIframeEl.classList.add('hidden');
            }
            mapPlaceholderEl?.classList.remove('hidden');
        }

        // 6. โครงสร้างสังกัด (รักษา 100% Contract)
        const orgNameEl = document.getElementById('resumeOrgName');
        if (orgNameEl) orgNameEl.textContent = rec.organization || 'กรุงเทพมหานคร';
        const burEl = document.getElementById('resumeBureauName');
        if (burEl) burEl.textContent = rec.bureau || '-';
        const divEl = document.getElementById('resumeDivisionName');
        if (divEl) divEl.textContent = rec.division || '-';
        const wgEl = document.getElementById('resumeWorkGroupName');
        if (wgEl) wgEl.textContent = rec.work_group || '-';

        document.getElementById('modalPersonnelResumeProfile')?.classList.remove('hidden');
    }

    #closeResumeModal() {
        if (this.currentPhotoBlobUrl) {
            URL.revokeObjectURL(this.currentPhotoBlobUrl);
            this.currentPhotoBlobUrl = null;
        }
        document.getElementById('modalPersonnelResumeProfile')?.classList.add('hidden');
    }

    #openModal(rec = null) {
        if (!rec && !this.canAddRecord) {
            UIHelpers.alert('ไม่มีสิทธิ์เข้าถึง', 'ผู้ดูแลระบบระดับส่วน/ฝ่าย ไม่มีสิทธิ์เพิ่มข้อมูลการลงเวลา', 'warning');
            return;
        }
        if (rec) {
            if (this.isAdminDivision) {
                UIHelpers.alert('ไม่มีสิทธิ์เข้าถึง', 'ผู้ดูแลระบบระดับส่วน/ฝ่าย ไม่มีสิทธิ์แก้ไขข้อมูลการลงเวลา', 'warning');
                return;
            }
            if (!this.isSuperAdmin && !AuthService.canViewRecordByScope(this.currentUser, rec)) {
                UIHelpers.alert('ไม่มีสิทธิ์เข้าถึง', 'คุณไม่มีสิทธิ์แก้ไขข้อมูลของบุคลากรนอกสังกัดที่ได้รับมอบหมาย', 'warning');
                return;
            }
        }
        this.#populatePersonnelDropdown();
        const modal = document.getElementById('modalReportAttendance');
        const defaultDate = document.getElementById('reportSingleDateInput')?.value || UIHelpers.getTodayISO();

        document.getElementById('repLogId').value = rec?.log_id || '';
        if (rec?.personnel_id) {
            document.getElementById('repPersonnelSelect').value = rec.personnel_id;
        }
        document.getElementById('repWorkDate').value = rec?.work_date || defaultDate;
        document.getElementById('repCheckinTime').value = rec?.check_in_time || this.settings.standard_check_in || '08:30';
        document.getElementById('repCheckoutTime').value = rec?.check_out_time || this.settings.standard_check_out || '16:30';
        document.getElementById('repStatusSelect').value = rec?.status_label && rec.status_label !== 'ไม่ลงเวลา'
            ? rec.status_label
            : 'ปฏิบัติงานปกติ';
        document.getElementById('repRemarkInput').value = rec?.remark || '';

        modal?.classList.remove('hidden');
    }

    #closeModal() {
        document.getElementById('modalReportAttendance')?.classList.add('hidden');
    }

    #bindEvents() {
        const btnSingle = document.getElementById('btnModeSingleDate');
        const btnRange = document.getElementById('btnModeRangeDate');
        const singleBox = document.getElementById('singleDatePickerBox');
        const rangeBox = document.getElementById('rangeDatePickerBox');

        btnSingle?.addEventListener('click', () => {
            this.dateMode = 'single';
            btnSingle.className = 'py-1.5 px-2.5 rounded-lg text-xs font-bold transition bg-[#007B3E] text-white shadow-xs cursor-pointer';
            btnRange.className = 'py-1.5 px-2.5 rounded-lg text-xs font-bold transition bma-text-sub hover:bg-black/5 cursor-pointer';
            singleBox?.classList.remove('hidden');
            rangeBox?.classList.add('hidden');
            this.loadReportData();
        });

        btnRange?.addEventListener('click', () => {
            this.dateMode = 'range';
            btnRange.className = 'py-1.5 px-2.5 rounded-lg text-xs font-bold transition bg-[#007B3E] text-white shadow-xs cursor-pointer';
            btnSingle.className = 'py-1.5 px-2.5 rounded-lg text-xs font-bold transition bma-text-sub hover:bg-black/5 cursor-pointer';
            singleBox?.classList.add('hidden');
            rangeBox?.classList.remove('hidden');
            this.loadReportData();
        });

        document.getElementById('reportSingleDateInput')?.addEventListener('change', () => this.loadReportData());
        document.getElementById('reportStartDateInput')?.addEventListener('change', () => this.loadReportData());
        document.getElementById('reportEndDateInput')?.addEventListener('change', () => this.loadReportData());

        document.getElementById('selectReportGroupBy')?.addEventListener('change', (e) => {
            this.groupViewMode = e.target.value;
            this.#renderSeparateTablesBySelectedTags(false);
        });

        document.getElementById('statusTagsFilterContainer')?.addEventListener('click', (e) => {
            const chip = e.target.closest('button[data-tag-key]');
            if (!chip) return;
            const key = chip.dataset.tagKey;
            if (this.selectedStatusKeys.has(key)) {
                this.selectedStatusKeys.delete(key);
            } else {
                this.selectedStatusKeys.add(key);
            }
            this.#renderStatusTagFilterChips();
            this.#renderSeparateTablesBySelectedTags(false);
        });

        document.getElementById('btnSelectDefaultTags')?.addEventListener('click', () => {
            this.selectedStatusKeys = new Set(['normal', 'late']);
            this.#renderStatusTagFilterChips();
            this.#renderSeparateTablesBySelectedTags(false);
        });

        document.getElementById('btnSelectAllStatusTags')?.addEventListener('click', () => {
            this.selectedStatusKeys = new Set(Config.OFFICIAL_STATUSES.map(s => s.key));
            this.#renderStatusTagFilterChips();
            this.#renderSeparateTablesBySelectedTags(false);
        });

        document.getElementById('btnOpenAddReportRecord')?.addEventListener('click', () => this.#openModal(null));
        document.getElementById('btnCloseReportModal')?.addEventListener('click', () => this.#closeModal());
        document.getElementById('btnCancelReportModal')?.addEventListener('click', () => this.#closeModal());

        document.getElementById('btnCloseResumeModalTop')?.addEventListener('click', () => this.#closeResumeModal());
        document.getElementById('btnCloseResumeModalBottom')?.addEventListener('click', () => this.#closeResumeModal());

        document.getElementById('formReportAttendance')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.#handleSaveReportRecord();
        });

        document.getElementById('btnPrintPdfNewTab')?.addEventListener('click', () => {
            const tableHtml = this.#renderSeparateTablesBySelectedTags(true);
            if (!tableHtml) {
                UIHelpers.alert('กรุณาเลือกสถานะ', 'โปรดเลือก TAG สถานะอย่างน้อย 1 รายการก่อนสั่งพิมพ์ PDF', 'warning');
                return;
            }
            const headerColor = this.settings?.category_colors?.group_header || '#007B3E';
            UIHelpers.printReportInNewTab({
                title: `รายงานการลงเวลาปฏิบัติราชการ ${this.settings.organization_name}`,
                subtitle: `สังกัด: ${this.settings.bureau_name} • ${this.#getFormattedReportDateSubtitle()}`,
                tableHtml,
                headerColor
            });
        });

        document.getElementById('btnExportReportExcel')?.addEventListener('click', () => {
            const filtered = this.records.filter(r => this.selectedStatusKeys.has(r.status_category));
            if (filtered.length === 0) {
                UIHelpers.alert('ไม่มีข้อมูลส่งออก', 'ไม่พบรายการใน TAG สถานะที่เลือก', 'warning');
                return;
            }
            const rows = filtered.map((r, idx) => {
                const lat = r.check_in_lat ?? r.check_out_lat;
                const lng = r.check_in_lng ?? r.check_out_lng;
                const gpsCoords = this.#formatGpsCoordinates(lat, lng);
                const locName = (r.check_in_location || r.check_out_location || '').trim();
                const gpsDisplay = [locName, gpsCoords].filter(Boolean).join(' ') || '-';

                return {
                    'ลำดับ': idx + 1,
                    'วันที่ปฏิบัติราชการ': r.work_date_thai_full,
                    'ชื่อ-นามสกุล': r.full_name,
                    'ตำแหน่ง': r.position_full,
                    'สำนักงาน/กอง': r.bureau || '-',
                    'ส่วน/ฝ่าย': r.division || '-',
                    'กลุ่มงาน': r.work_group || '-',
                    'เวลาเข้างาน (24 ชม.)': r.check_in_time || '-',
                    'เวลาออกงาน (24 ชม.)': r.check_out_time || '-',
                    'พิกัด GPS': gpsDisplay,
                    'สถานะ': r.status_label,
                    'หมายเหตุ': r.remark || ''
                };
            });
            UIHelpers.exportToExcelUTF8(rows, `รายงานลงเวลาปฏิบัติราชการ_${UIHelpers.getTodayISO()}`, 'AttendanceReport');
        });

        document.getElementById('btnTemplateReportExcel')?.addEventListener('click', () => {
            const sample = [{
                'ลำดับ': 1,
                'วันที่ปฏิบัติราชการ': UIHelpers.formatThaiFullDate(UIHelpers.getTodayISO()),
                'ชื่อ-นามสกุล': 'นายสมชาย สายตรวจ',
                'ตำแหน่ง': 'เจ้าพนักงานเทศกิจปฏิบัติการ',
                'สำนักงาน/กอง': 'สำนักเทศกิจ',
                'ส่วน/ฝ่าย': 'กองตรวจและปฏิบัติการพื้นที่ 1',
                'กลุ่มงาน': 'กลุ่มงานตรวจและปฏิบัติการ 1',
                'เวลาเข้างาน (24 ชม.)': '08:15',
                'เวลาออกงาน (24 ชม.)': '16:35',
                'พิกัด GPS': 'สำนักเทศกิจ 13.733790° N, 100.468261° E',
                'สถานะ': 'ปฏิบัติงานปกติ',
                'หมายเหตุ': ''
            }];
            UIHelpers.exportToExcelUTF8(sample, 'Template_รายงานการลงเวลา', 'Template');
        });

        // Event Delegation สำหรับปุ่มแก้ไข/ลบ หรือคลิกที่แถว (Row) เพื่อเปิดดูฟอร์มโปรไฟล์เฉพาะของ Row นั้นๆ
        document.getElementById('reportTablesMasterContainer')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (btn) {
                e.stopPropagation();
                const action = btn.dataset.action;

                if (action === 'edit-record') {
                    const rowUid = btn.dataset.rowUid;
                    const rec = this.records.find(r => r.row_uid === rowUid);
                    if (!rec) return;

                    if (!AuthService.canEditAttendanceRecord(this.currentUser, rec)) {
                        UIHelpers.alert('ไม่มีสิทธิ์เข้าถึง', 'คุณไม่มีสิทธิ์แก้ไขข้อมูลการลงเวลาของรายการนี้', 'warning');
                        return;
                    }

                    this.#openModal(rec);
                } else if (action === 'delete-record') {
                    if (!AuthService.canDeleteAttendanceRecord(this.currentUser)) {
                        UIHelpers.alert('ไม่มีสิทธิ์เข้าถึง', 'เฉพาะผู้ดูแลระบบระดับสูงสุด (SuperAdmin) เท่านั้นที่สามารถลบข้อมูลการลงเวลาได้', 'warning');
                        return;
                    }
                    const logId = btn.dataset.logid;
                    const name = btn.dataset.name;
                    const confirmed = await UIHelpers.confirm(
                        'ยืนยันการลบข้อมูลลงเวลา',
                        `ต้องการลบข้อมูลการลงเวลาของ "${name}" รายการนี้ใช่หรือไม่?`,
                        'ลบรายการ',
                        'warning'
                    );
                    if (confirmed) {
                        UIHelpers.showLoading('กำลังลบรายการลงเวลา...');
                        const res = await AttendanceModel.deleteAttendanceRecord(logId);
                        UIHelpers.hideLoading();
                        if (res.success) {
                            await this.loadReportData();
                            await UIHelpers.showToast(res.message, 'success', 2500);
                        } else {
                            await UIHelpers.alert('ลบไม่สำเร็จ', res.message, 'error');
                        }
                    }
                }
                return;
            }

            const personRow = e.target.closest('tr.report-person-row');
            if (personRow && personRow.dataset.rowUid) {
                this.#openResumeProfileForSpecificRow(personRow.dataset.rowUid);
            }
        });
    }

    async #handleSaveReportRecord() {
        if (this.isAdminDivision) {
            await UIHelpers.alert('ไม่มีสิทธิ์ดำเนินการ', 'ผู้ดูแลระบบระดับส่วน/ฝ่าย ไม่มีสิทธิ์เพิ่มหรือแก้ไขข้อมูลการลงเวลา', 'warning');
            return;
        }

        const selectedPersonnelId = document.getElementById('repPersonnelSelect').value;
        const targetPerson = (this.allPersonnel || []).find(p => p.id === selectedPersonnelId);
        if (!this.isSuperAdmin && targetPerson && !AuthService.canViewRecordByScope(this.currentUser, targetPerson)) {
            await UIHelpers.alert('ไม่มีสิทธิ์ดำเนินการ', 'ไม่สามารถบันทึกข้อมูลบุคลากรนอกสังกัดที่ได้รับมอบหมายได้', 'warning');
            return;
        }

        const payload = {
            log_id: document.getElementById('repLogId').value || null,
            personnel_id: selectedPersonnelId,
            work_date: document.getElementById('repWorkDate').value,
            check_in_time: UIHelpers.formatTime24(document.getElementById('repCheckinTime').value),
            check_out_time: UIHelpers.formatTime24(document.getElementById('repCheckoutTime').value),
            status: document.getElementById('repStatusSelect').value,
            remark: document.getElementById('repRemarkInput').value
        };

        UIHelpers.showLoading('กำลังบันทึกข้อมูลการลงเวลา...');
        try {
            const res = await AttendanceModel.saveAdminAttendanceRecord(payload);
            UIHelpers.hideLoading();
            if (!res.success) {
                await UIHelpers.alert('บันทึกไม่สำเร็จ', res.message, 'error');
                return;
            }
            this.#closeModal();
            await this.loadReportData();
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
        document.addEventListener('DOMContentLoaded', () => new ReportsController());
    } else {
        new ReportsController();
    }
}