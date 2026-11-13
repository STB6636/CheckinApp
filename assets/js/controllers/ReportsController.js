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
import { AuthService } from '../core/AuthService.js';
import { DOMDiffHelper } from '../utils/DOMDiffHelper.js';

export class ReportsController {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.allPersonnel = [];
        this.records = [];
        this.selectedBureauFilter = 'all';
        this.selectedDivisionFilter = 'all';
        this.selectedWorkGroupFilter = 'all';
        this.dateMode = 'single';
        this.groupViewMode = 'division';
        this.selectedStatusKeys = new Set(['normal', 'late']);
        this.currentPhotoBlobUrl = null;
        this.currentPhotoBlobUrlOut = null;
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

        this.#initHierarchicalOrgFilter();
        this.#renderStatusTagFilterChips();
        this.#bindEvents();
        await this.loadReportData();
    }

    #initHierarchicalOrgFilter() {
        const dock = document.getElementById('hierarchicalOrgFilterDock');
        if (dock) {
            const canUseOrgFilter = this.isSuperAdmin || this.isAdminBureau;
            dock.classList.toggle('hidden', !canUseOrgFilter);
        }

        const bureauSelect = document.getElementById('selectFilterBureau');
        const divisionSelect = document.getElementById('selectFilterDivision');
        const workGroupSelect = document.getElementById('selectFilterWorkGroup');

        bureauSelect?.addEventListener('change', (e) => {
            this.selectedBureauFilter = e.target.value;
            this.selectedDivisionFilter = 'all';
            this.selectedWorkGroupFilter = 'all';
            this.#updateDivisionOptions();
            this.#renderStatusTagFilterChips();
            this.#renderSeparateTablesBySelectedTags(false);
        });

        divisionSelect?.addEventListener('change', (e) => {
            this.selectedDivisionFilter = e.target.value;
            this.selectedWorkGroupFilter = 'all';
            this.#updateWorkGroupOptions();
            this.#renderStatusTagFilterChips();
            this.#renderSeparateTablesBySelectedTags(false);
        });

        workGroupSelect?.addEventListener('change', (e) => {
            this.selectedWorkGroupFilter = e.target.value;
            this.#renderStatusTagFilterChips();
            this.#renderSeparateTablesBySelectedTags(false);
        });

        this.#updateDivisionOptions();
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

        const baseRecords = this.#getFilteredRecords();
        container.innerHTML = Config.OFFICIAL_STATUSES.map(st => {
            const isSelected = this.selectedStatusKeys.has(st.key);
            const color = this.#getStatusColor(st.key);
            const countInStatus = baseRecords.filter(r => r.status_category === st.key).length;

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
            this.#populateHierarchicalOrgFilter();
            this.#renderStatusTagFilterChips();
            this.#renderSeparateTablesBySelectedTags(false);
        } catch (err) {
            console.error('[ReportsController] loadReportData failed:', err);
            const masterContainer = document.getElementById('reportTablesMasterContainer');
            if (masterContainer) {
                masterContainer.innerHTML = `
                    <div class="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
                        <i class="bi bi-exclamation-triangle-fill text-red-500 text-3xl mb-2 inline-block"></i>
                        <p class="text-sm font-semibold text-red-700">เกิดข้อผิดพลาดในการโหลดข้อมูลรายงาน</p>
                        <p class="text-xs text-red-500 mt-1">${UIHelpers.escapeHtml(err.message || 'ไม่สามารถประมวลผลข้อมูลได้')}</p>
                    </div>`;
            }
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

    #populateHierarchicalOrgFilter() {
        const bureauSelect = document.getElementById('selectFilterBureau');
        if (!bureauSelect) return;

        const primaryBureaus = SettingsModel.getUniqueBureaus(this.settings);
        const combinedSources = [...(this.allPersonnel || []), ...(this.records || [])];
        const legacyBureaus = combinedSources
            .map(item => (item.bureau || '').trim())
            .filter(Boolean);

        const bureaus = [...new Set([...primaryBureaus, ...legacyBureaus])]
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'th'));

        if (this.selectedBureauFilter !== 'all' && !bureaus.includes(this.selectedBureauFilter)) {
            this.selectedBureauFilter = 'all';
        }

        bureauSelect.innerHTML = '<option value="all">แสดงทั้งหมด</option>' +
            bureaus.map(b => `<option value="${UIHelpers.escapeHtml(b)}">${UIHelpers.escapeHtml(b)}</option>`).join('');
        bureauSelect.value = this.selectedBureauFilter;

        this.#updateDivisionOptions();
    }

    #updateDivisionOptions() {
        const divisionSelect = document.getElementById('selectFilterDivision');
        if (!divisionSelect) return;

        if (this.selectedBureauFilter === 'all') {
            divisionSelect.disabled = true;
            divisionSelect.classList.add('opacity-60', 'cursor-not-allowed', 'bg-slate-100', 'dark:bg-slate-800');
            divisionSelect.innerHTML = '<option value="all">แสดงทั้งหมด</option>';
            divisionSelect.value = 'all';
            this.selectedDivisionFilter = 'all';
        } else {
            divisionSelect.disabled = false;
            divisionSelect.classList.remove('opacity-60', 'cursor-not-allowed', 'bg-slate-100', 'dark:bg-slate-800');

            const primaryDivisions = SettingsModel.getUniqueDivisions(this.settings, this.selectedBureauFilter);
            const combinedSources = [...(this.allPersonnel || []), ...(this.records || [])];
            const matchingSources = combinedSources.filter(item => (item.bureau || '').trim() === this.selectedBureauFilter.trim());
            const legacyDivisions = matchingSources
                .map(item => (item.division || '').trim())
                .filter(Boolean);

            const divisions = [...new Set([...primaryDivisions, ...legacyDivisions])]
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b, 'th'));

            if (this.selectedDivisionFilter !== 'all' && !divisions.includes(this.selectedDivisionFilter)) {
                this.selectedDivisionFilter = 'all';
            }

            divisionSelect.innerHTML = '<option value="all">แสดงทั้งหมด</option>' +
                divisions.map(d => `<option value="${UIHelpers.escapeHtml(d)}">${UIHelpers.escapeHtml(d)}</option>`).join('');
            divisionSelect.value = this.selectedDivisionFilter;
        }

        this.#updateWorkGroupOptions();
    }

    #updateWorkGroupOptions() {
        const workGroupSelect = document.getElementById('selectFilterWorkGroup');
        if (!workGroupSelect) return;

        if (this.selectedBureauFilter === 'all' || this.selectedDivisionFilter === 'all') {
            workGroupSelect.disabled = true;
            workGroupSelect.classList.add('opacity-60', 'cursor-not-allowed', 'bg-slate-100', 'dark:bg-slate-800');
            workGroupSelect.innerHTML = '<option value="all">แสดงทั้งหมด</option>';
            workGroupSelect.value = 'all';
            this.selectedWorkGroupFilter = 'all';
        } else {
            workGroupSelect.disabled = false;
            workGroupSelect.classList.remove('opacity-60', 'cursor-not-allowed', 'bg-slate-100', 'dark:bg-slate-800');

            const primaryGroups = SettingsModel.getUniqueGroups(this.settings, this.selectedBureauFilter, this.selectedDivisionFilter);
            const combinedSources = [...(this.allPersonnel || []), ...(this.records || [])];
            const matchingSources = combinedSources.filter(item =>
                (item.bureau || '').trim() === this.selectedBureauFilter.trim() &&
                (item.division || '').trim() === this.selectedDivisionFilter.trim()
            );
            const legacyGroups = matchingSources
                .map(item => (item.work_group || item.group || '').trim())
                .filter(Boolean);

            const workGroups = [...new Set([...primaryGroups, ...legacyGroups])]
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b, 'th'));

            if (this.selectedWorkGroupFilter !== 'all' && !workGroups.includes(this.selectedWorkGroupFilter)) {
                this.selectedWorkGroupFilter = 'all';
            }

            workGroupSelect.innerHTML = '<option value="all">แสดงทั้งหมด</option>' +
                workGroups.map(wg => `<option value="${UIHelpers.escapeHtml(wg)}">${UIHelpers.escapeHtml(wg)}</option>`).join('');
            workGroupSelect.value = this.selectedWorkGroupFilter;
        }
    }

    #getFilteredRecords() {
        let list = this.records || [];
        if (this.selectedBureauFilter && this.selectedBureauFilter !== 'all') {
            list = list.filter(r => (r.bureau || '').trim() === this.selectedBureauFilter.trim());
        }
        if (this.selectedDivisionFilter && this.selectedDivisionFilter !== 'all') {
            list = list.filter(r => (r.division || '').trim() === this.selectedDivisionFilter.trim());
        }
        if (this.selectedWorkGroupFilter && this.selectedWorkGroupFilter !== 'all') {
            list = list.filter(r => (r.work_group || '').trim() === this.selectedWorkGroupFilter.trim());
        }
        return list;
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

    #calculateDistanceMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const toRad = (deg) => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    #isWithinGeofence(lat, lng) {
        if (lat === null || lat === undefined || lng === null || lng === undefined) return null;
        const numLat = parseFloat(lat);
        const numLng = parseFloat(lng);
        if (isNaN(numLat) || isNaN(numLng)) return null;

        const officialList = this.settings?.official_locations || Config.DEFAULT_SETTINGS?.official_locations || [];
        if (!Array.isArray(officialList) || officialList.length === 0) {
            const d = this.#calculateDistanceMeters(numLat, numLng, 13.756331, 100.501765);
            return d <= 180;
        }

        for (const loc of officialList) {
            if (!loc || loc.is_active === false) continue;
            const locLat = Number(loc.latitude ?? loc.lat);
            const locLng = Number(loc.longitude ?? loc.lng ?? loc.lon);
            if (!Number.isFinite(locLat) || !Number.isFinite(locLng)) continue;

            const radius = Math.max(loc.radius_meters || 150, 180);
            const dist = this.#calculateDistanceMeters(numLat, numLng, locLat, locLng);
            if (dist <= radius) {
                return true;
            }
        }
        return false;
    }

    #formatLocationName(locName) {
        if (!locName) return '-';
        const trimmed = String(locName).trim();
        if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
            return '-';
        }
        if (/^(บริเวณ|ใกล้เคียง)/.test(trimmed)) {
            return trimmed;
        }
        return `บริเวณ ${trimmed}`;
    }

    #resolveLocationMode(rec, type = 'check_in') {
        if (!rec || !rec.log_id) return null;

        if (type === 'check_in') {
            const hasCheckIn = Boolean(rec.check_in_time || rec.check_in_lat || rec.check_in_location);
            if (!hasCheckIn && !rec.is_special_request) {
                return null;
            }
            if (rec.location_mode === 'OFFSITE') return 'OFFSITE';
            if (rec.location_mode === 'ONSITE') return 'ONSITE';

            const inLat = rec.check_in_lat ?? (rec.is_special_request ? rec.check_out_lat : null);
            const inLng = rec.check_in_lng ?? (rec.is_special_request ? rec.check_out_lng : null);
            if (inLat !== null && inLng !== null) {
                const inGeofence = this.#isWithinGeofence(inLat, inLng);
                if (inGeofence !== null) {
                    return inGeofence ? 'ONSITE' : 'OFFSITE';
                }
            }
            if (rec.remark && ['อบรม', 'ประชุม', 'ปฏิบัติงานนอกสถานที่', 'ปฏิบัติงานที่บ้าน (WFH)', 'ปฏิบัติงานเวรประจำวัน'].includes(rec.remark.trim())) {
                return 'OFFSITE';
            }
            return 'ONSITE';
        }

        if (type === 'check_out') {
            const isCheckedOut = Boolean(rec.check_out_time || rec.check_out_lat || rec.check_out_location);
            if (!isCheckedOut && !rec.is_special_request) {
                return null;
            }
            const outLat = rec.check_out_lat ?? (rec.is_special_request ? rec.check_in_lat : null);
            const outLng = rec.check_out_lng ?? (rec.is_special_request ? rec.check_in_lng : null);
            if (outLat !== null && outLng !== null) {
                const outGeofence = this.#isWithinGeofence(outLat, outLng);
                if (outGeofence !== null) {
                    return outGeofence ? 'ONSITE' : 'OFFSITE';
                }
            }
            if (rec.location_mode === 'OFFSITE') return 'OFFSITE';
            return 'ONSITE';
        }

        return null;
    }

    #resolveReportRemark(rec) {
        if (!rec || !rec.log_id) return '-';

        const SUPPRESSED_STATUS_REMARKS = new Set([
            'ปฏิบัติงานปกติ',
            'มาสาย',
            'ขาดราชการ',
            'ไม่ลงเวลา',
            'ปฏิบัติงานนอกเวลา',
            'ปฏิบัติงานนอกเวลาราชการ',
            'ในสถานที่'
        ]);

        if (rec.is_special_request) {
            const spRemark = (rec.remark || '').trim();
            if (!spRemark || spRemark === '-' || SUPPRESSED_STATUS_REMARKS.has(spRemark)) {
                return '-';
            }
            return spRemark;
        }

        const inMode = this.#resolveLocationMode(rec, 'check_in');
        if (inMode === 'ONSITE') {
            return '-';
        }

        if (inMode === 'OFFSITE') {
            const rawRemark = (rec.remark || '').trim();
            if (!rawRemark || rawRemark === '-' || SUPPRESSED_STATUS_REMARKS.has(rawRemark)) {
                return 'ปฏิบัติงานนอกสถานที่';
            }
            return rawRemark;
        }

        return '-';
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
        const activeRecords = this.#getFilteredRecords();

        if (this.dateMode === 'range') {
            const uniqueDates = [...new Set(activeRecords.map(r => r.work_date))].filter(Boolean).sort();
            for (const dayDate of uniqueDates) {
                const dayRecords = activeRecords.filter(r => r.work_date === dayDate);
                const dayThaiFull = UIHelpers.formatThaiFullDate(dayDate);

                if (forPrintPdf) {
                    combinedHtml += `
                        <div class="day-section-banner" style="background-color: #00351B; color: #FFFFFF; padding: 8px 14px; font-weight: 800; font-size: 15px; border-radius: 6px; margin-top: 18px; margin-bottom: 12px; page-break-after: avoid; break-after: avoid;">
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
                const tagRecords = activeRecords.filter(r => r.status_category === statusMeta.key);
                combinedHtml += this.#renderSingleStatusTableHtml(statusMeta, statusColor, tagRecords, dayThaiFull, groupHeaderColor, forPrintPdf);
            }
        }

        if (!forPrintPdf && masterContainer) {
            masterContainer.innerHTML = combinedHtml;
        }
        return combinedHtml;
    }

    #renderSingleStatusTableHtml(statusMeta, statusColor, tagRecords, daySubtitle, groupHeaderColor, forPrintPdf) {
        const showGps = Boolean(this.settings?.require_gps);
        const colSpan = showGps
            ? ((forPrintPdf || !this.canManageRecords) ? 8 : 9)
            : ((forPrintPdf || !this.canManageRecords) ? 6 : 7);

        const tableRowsHtml = this.#buildGroupedRowsForTag(tagRecords, groupHeaderColor, forPrintPdf);

        if (forPrintPdf) {
            const colgroupHtml = showGps ? `
                        <colgroup>
                            <col style="width: 5%;">
                            <col style="width: 18%;">
                            <col style="width: 17%;">
                            <col style="width: 9%;">
                            <col style="width: 9%;">
                            <col style="width: 15%;">
                            <col style="width: 15%;">
                            <col style="width: 12%;">
                        </colgroup>
            ` : `
                        <colgroup>
                            <col style="width: 6%;">
                            <col style="width: 25%;">
                            <col style="width: 25%;">
                            <col style="width: 12%;">
                            <col style="width: 12%;">
                            <col style="width: 20%;">
                        </colgroup>
            `;

            const theadHtml = showGps ? `
                        <thead>
                            <tr>
                                <th style="text-align: center;">ลำดับ</th>
                                <th>ชื่อ-นามสกุล</th>
                                <th>ตำแหน่ง</th>
                                <th style="text-align: center;">เวลาเข้างาน</th>
                                <th style="text-align: center;">เวลาออกงาน</th>
                                <th>พิกัด GPS เข้างาน</th>
                                <th>พิกัด GPS ออกงาน</th>
                                <th>หมายเหตุ</th>
                            </tr>
                        </thead>
            ` : `
                        <thead>
                            <tr>
                                <th style="text-align: center;">ลำดับ</th>
                                <th>ชื่อ-นามสกุล</th>
                                <th>ตำแหน่ง</th>
                                <th style="text-align: center;">เวลาเข้างาน</th>
                                <th style="text-align: center;">เวลาออกงาน</th>
                                <th>หมายเหตุ</th>
                            </tr>
                        </thead>
            `;

            return `
                <div class="tag-section-block">
                    <div class="tag-section-title" style="background-color: ${statusColor}; page-break-after: avoid; break-after: avoid;">
                        ตารางสถานะ: ${statusMeta.label} - ประจำวันที่ ${daySubtitle} (จำนวน ${tagRecords.length} รายการ)
                    </div>
                    <table>
                        ${colgroupHtml}
                        ${theadHtml}
                        <tbody>
                            ${tableRowsHtml}
                        </tbody>
                    </table>
                </div>
            `;
        }

        const theadWebHtml = showGps ? `
                            <tr>
                                <th class="w-14 text-center">ลำดับ</th>
                                <th class="min-w-[170px]">ชื่อ-นามสกุล</th>
                                <th class="min-w-[160px]">ตำแหน่ง</th>
                                <th class="w-28 text-center">เวลาเข้างาน</th>
                                <th class="w-28 text-center">เวลาออกงาน</th>
                                <th class="w-44 min-w-[180px]">พิกัด GPS เข้างาน</th>
                                <th class="w-44 min-w-[180px]">พิกัด GPS ออกงาน</th>
                                <th class="min-w-[130px]">หมายเหตุ</th>
                                ${this.canManageRecords ? '<th class="w-24 text-center no-print">จัดการ</th>' : ''}
                            </tr>
        ` : `
                            <tr>
                                <th class="w-14 text-center">ลำดับ</th>
                                <th class="min-w-[200px]">ชื่อ-นามสกุล</th>
                                <th class="min-w-[200px]">ตำแหน่ง</th>
                                <th class="w-32 text-center">เวลาเข้างาน</th>
                                <th class="w-32 text-center">เวลาออกงาน</th>
                                <th class="min-w-[180px]">หมายเหตุ</th>
                                ${this.canManageRecords ? '<th class="w-24 text-center no-print">จัดการ</th>' : ''}
                            </tr>
        `;

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
                            ${theadWebHtml}
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
        const showGps = Boolean(this.settings?.require_gps);
        const colSpan = showGps
            ? ((forPrintPdf || !this.canManageRecords) ? 8 : 9)
            : ((forPrintPdf || !this.canManageRecords) ? 6 : 7);

        if (!tagRecords || tagRecords.length === 0) {
            return `<tr><td colspan="${colSpan}" class="text-center py-6 bma-text-sub">ไม่มีข้อมูลบุคลากรในสถานะนี้</td></tr>`;
        }

        const grouped = PersonnelModel.groupPersonnel(tagRecords, this.groupViewMode);
        let rowsHtml = '';
        let runningNo = 1;

        for (const [bureauName, divisionsObj] of Object.entries(grouped || {})) {
            for (const [divisionName, content] of Object.entries(divisionsObj || {})) {
                rowsHtml += `
                    <tr class="group-row" style="background-color: ${groupHeaderColor}18;">
                        <td colspan="${colSpan}" class="font-bold text-sm py-2.5 px-4" style="color: ${groupHeaderColor}; border-left: 4px solid ${groupHeaderColor};">
                            <i class="fa-solid fa-building-user mr-1.5"></i>${bureauName || '-'} &gt; ${divisionName || '-'}
                        </td>
                    </tr>
                `;

                if (this.groupViewMode === 'group') {
                    for (const [groupName, members] of Object.entries(content || {})) {
                        const memberList = Array.isArray(members) ? members : [];
                        rowsHtml += `
                            <tr class="sub-group-row bg-emerald-950/5 dark:bg-slate-800/50">
                                <td colspan="${colSpan}" class="font-semibold text-xs py-2 pl-8 bma-text-main">
                                    กลุ่มงาน: ${groupName || '-'} (${memberList.length} รายการ)
                                </td>
                            </tr>
                        `;
                        for (const rec of memberList) {
                            if (rec) {
                                rowsHtml += this.#buildSingleRowHtml(rec, runningNo++, forPrintPdf);
                            }
                        }
                    }
                } else {
                    const contentList = Array.isArray(content) ? content : [];
                    for (const rec of contentList) {
                        if (rec) {
                            rowsHtml += this.#buildSingleRowHtml(rec, runningNo++, forPrintPdf);
                        }
                    }
                }
            }
        }

        return rowsHtml;
    }

    #buildSingleRowHtml(rec, indexNo, forPrintPdf) {
        if (!rec) return '';

        const showGps = Boolean(this.settings?.require_gps);
        const posDisplay = rec.position_full || UIHelpers.formatPosition(rec.position_title, rec.position_level, rec.position_type) || '-';
        const remarkDisplay = this.#resolveReportRemark(rec);
        const fullName = rec.full_name || '-';
        const rowUid = rec.row_uid || '';

        const inMode = this.#resolveLocationMode(rec, 'check_in');
        const inLocName = this.#formatLocationName(rec.check_in_location || (rec.is_special_request ? rec.check_out_location : ''));

        const outMode = this.#resolveLocationMode(rec, 'check_out');
        const outRawLoc = (rec.check_out_location || (rec.is_special_request ? rec.check_in_location : '') || '').trim();
        const outLocName = this.#formatLocationName(outRawLoc);

        if (forPrintPdf) {
            const gpsPrintCells = showGps ? `
                    <td style="font-size: 11px; vertical-align: middle;">
                        ${inMode ? `
                            <div><span style="display: inline-block; padding: 1px 6px; border-radius: 9999px; background: ${inMode === 'ONSITE' ? '#D1FAE5' : '#E0F2FE'}; color: ${inMode === 'ONSITE' ? '#065F46' : '#0369A1'}; font-weight: 700; font-size: 10px;">${inMode === 'ONSITE' ? 'ในสถานที่' : 'นอกสถานที่'}</span></div>
                            <div style="font-size: 10px; color: #334155; margin-top: 2px;">${inLocName}</div>
                        ` : `<div style="text-align: center; color: #64748B;">-</div>`}
                    </td>
                    <td style="font-size: 11px; vertical-align: middle;">
                        ${outMode ? `
                            <div><span style="display: inline-block; padding: 1px 6px; border-radius: 9999px; background: ${outMode === 'ONSITE' ? '#D1FAE5' : '#E0F2FE'}; color: ${outMode === 'ONSITE' ? '#065F46' : '#0369A1'}; font-weight: 700; font-size: 10px;">${outMode === 'ONSITE' ? 'ในสถานที่' : 'นอกสถานที่'}</span></div>
                            <div style="font-size: 10px; color: #334155; margin-top: 2px;">${outLocName}</div>
                        ` : `<div style="text-align: center; color: #64748B;">-</div>`}
                    </td>
            ` : '';

            return `
                <tr>
                    <td style="text-align: center;">${indexNo}</td>
                    <td>${fullName}</td>
                    <td>${posDisplay}</td>
                    <td style="text-align: center; font-family: monospace; font-weight: 700;">${rec.check_in_time || '-'}</td>
                    <td style="text-align: center; font-family: monospace; font-weight: 700;">${rec.check_out_time || '-'}</td>
                    ${gpsPrintCells}
                    <td>${remarkDisplay}</td>
                </tr>
            `;
        }

        const timeColClass = showGps
            ? 'w-28 text-center font-mono font-bold'
            : 'w-32 text-center font-mono font-bold';

        const inBadge = inMode === 'ONSITE'
            ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40"><i class="fa-solid fa-building text-[10px]"></i>ในสถานที่</span>`
            : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300/40"><i class="fa-solid fa-map-location-dot text-[10px]"></i>นอกสถานที่</span>`;

        const inLocDisp = (inLocName && inLocName !== '-')
            ? `<div class="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[170px] mt-1" title="${inLocName}"><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i>${inLocName}</div>`
            : `<div class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">-</div>`;

        const outBadge = outMode === 'ONSITE'
            ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40"><i class="fa-solid fa-building text-[10px]"></i>ในสถานที่</span>`
            : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300/40"><i class="fa-solid fa-map-location-dot text-[10px]"></i>นอกสถานที่</span>`;

        const outLocDisp = (outLocName && outLocName !== '-')
            ? `<div class="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[170px] mt-1" title="${outLocName}"><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i>${outLocName}</div>`
            : `<div class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">-</div>`;

        const inCellHtml = inMode
            ? `<td class="w-44 min-w-[180px] py-2">
                    <div class="flex flex-col items-start justify-center">
                        ${inBadge}
                        ${inLocDisp}
                    </div>
               </td>`
            : `<td class="w-44 min-w-[180px] text-center text-slate-500 dark:text-slate-400 font-medium">-</td>`;

        const outCellHtml = outMode
            ? `<td class="w-44 min-w-[180px] py-2">
                    <div class="flex flex-col items-start justify-center">
                        ${outBadge}
                        ${outLocDisp}
                    </div>
               </td>`
            : `<td class="w-44 min-w-[180px] text-center text-slate-500 dark:text-slate-400 font-medium">-</td>`;

        const gpsWebCells = showGps ? `
                ${inCellHtml}
                ${outCellHtml}
        ` : '';

        return `
            <tr class="report-person-row cursor-pointer transition" data-row-uid="${rowUid}" data-row-id="${rec.log_id || rowUid}" title="คลิกเพื่อดูโปรไฟล์ รูปถ่าย และพิกัด Google Map ของรายการนี้">
                <td class="w-14 text-center font-semibold seq-num">${indexNo}</td>
                <td class="${showGps ? 'min-w-[170px]' : 'min-w-[200px]'}">
                    <div class="font-bold bma-text-main flex items-center gap-1.5">
                        <span>${fullName}</span>
                        <i class="fa-regular fa-id-badge text-xs text-emerald-600 opacity-75"></i>
                    </div>
                </td>
                <td class="${showGps ? 'min-w-[160px]' : 'min-w-[200px]'} font-medium">${posDisplay}</td>
                <td class="${timeColClass}">${rec.check_in_time ? rec.check_in_time + ' น.' : '-'}</td>
                <td class="${timeColClass}">${rec.check_out_time ? rec.check_out_time + ' น.' : '-'}</td>
                ${gpsWebCells}
                <td class="${showGps ? 'min-w-[130px]' : 'min-w-[180px]'} text-xs text-slate-600 dark:text-slate-300">
                    ${remarkDisplay}
                </td>
${this.canManageRecords ? `
                <td class="w-24 text-center space-x-1 whitespace-nowrap no-print">
                    ${AuthService.canEditAttendanceRecord(this.currentUser, rec) ? `
                        <button type="button" data-action="edit-record" data-row-uid="${rowUid}" class="btn-bma-outline py-1 px-2.5 text-xs text-sky-500" title="บันทึก/แก้ไขเวลา">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                    ` : ''}
                    ${(AuthService.canDeleteAttendanceRecord(this.currentUser, rec) && rec.log_id) ? `
                        <button type="button" data-action="delete-record" data-logid="${rec.log_id}" data-name="${fullName}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-500" title="ลบเวลา">
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

        const mergedPosition = UIHelpers.formatPosition(
            person.position_title || rec.position_title,
            person.position_level || rec.position_level,
            person.position_type || rec.position_type,
            rec.position_full
        );

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

        // 2. รูปถ่ายเข้างาน และ รูปถ่ายออกงาน
        const photoUrlIn = rec.check_in_photo || (rec.is_special_request ? rec.check_out_photo : '') || '';
        let photoUrlOut = rec.check_out_photo || '';
        if (!photoUrlOut && rec.is_special_request) {
            photoUrlOut = rec.check_in_photo || '';
        }

        const isCheckedOut = Boolean(rec.check_out_time || rec.check_out_lat || rec.check_out_location || rec.check_out_photo);

        if (this.currentPhotoBlobUrl) {
            URL.revokeObjectURL(this.currentPhotoBlobUrl);
            this.currentPhotoBlobUrl = null;
        }
        if (this.currentPhotoBlobUrlOut) {
            URL.revokeObjectURL(this.currentPhotoBlobUrlOut);
            this.currentPhotoBlobUrlOut = null;
        }

        const setupPhotoBox = (boxId, linkId, photo, fallbackMsg, isOut = false) => {
            const photoBox = document.getElementById(boxId);
            const photoLink = document.getElementById(linkId);
            if (!photoBox) return;

            if (photo) {
                photoBox.innerHTML = `<img src="${photo}" alt="${rec.full_name || ''}" class="w-full h-full object-cover">`;
                if (photoLink) {
                    if (photo.startsWith('data:image/')) {
                        try {
                            const parts = photo.split(',');
                            const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
                            const bstr = atob(parts[1]);
                            let n = bstr.length;
                            const u8arr = new Uint8Array(n);
                            while (n--) {
                                u8arr[n] = bstr.charCodeAt(n);
                            }
                            const blob = new Blob([u8arr], { type: mime });
                            const blobUrl = URL.createObjectURL(blob);
                            if (isOut) {
                                this.currentPhotoBlobUrlOut = blobUrl;
                            } else {
                                this.currentPhotoBlobUrl = blobUrl;
                            }
                            photoLink.href = blobUrl;
                        } catch (err) {
                            photoLink.href = photo;
                        }
                    } else {
                        photoLink.href = photo;
                    }
                    photoLink.classList.remove('hidden');
                }
            } else {
                photoBox.innerHTML = `
                    <div class="text-center p-3 text-emerald-200/80 text-xs">
                        <i class="fa-solid fa-camera-slash text-3xl mb-1.5 block text-[#FDD835]"></i>
                        <span class="text-[11px] leading-tight block">${fallbackMsg}</span>
                    </div>
                `;
                photoLink?.classList.add('hidden');
            }
        };

        setupPhotoBox('resumeLargePhotoBox', 'resumeOpenFullPhotoLink', photoUrlIn, 'รายการนี้ไม่มีภาพถ่ายบันทึกไว้', false);
        const outPhotoFallback = (isCheckedOut || rec.is_special_request) ? 'รายการนี้ไม่มีภาพถ่ายขาออก' : 'ยังไม่ได้ลงเวลาออกงาน';
        setupPhotoBox('resumeLargePhotoBoxOut', 'resumeOpenFullPhotoLinkOut', photoUrlOut, outPhotoFallback, true);

        // 3. ข้อมูลประจำตัว (รักษา 100% Contract)
        const natEl = document.getElementById('resumeNationalId');
        if (natEl) natEl.textContent = rec.national_id || person.national_id || 'ไม่ระบุ';
        const userEl = document.getElementById('resumeUsername');
        if (userEl) userEl.textContent = person.account_username || rec.national_id || '-';
        const specEl = document.getElementById('resumePosSpec');
        if (specEl) specEl.textContent = `${rec.position_type || '-'} / ${rec.position_full || '-'}`;

        // 4. ข้อมูลการลงเวลาเฉพาะของ Row นี้
        const fullDateEl = document.getElementById('resumeRowFullDate');
        if (fullDateEl) fullDateEl.textContent = rec.work_date_thai_full || '-';
        const shiftEl = document.getElementById('resumeRowShiftName');
        if (shiftEl) shiftEl.textContent = rec.shift_name || '-';
        const inEl = document.getElementById('resumeRowCheckinTime');
        if (inEl) inEl.textContent = rec.check_in_time ? `${rec.check_in_time} น.` : 'ไม่ได้ลงเวลา';
        const outEl = document.getElementById('resumeRowCheckoutTime');
        if (outEl) outEl.textContent = rec.check_out_time ? `${rec.check_out_time} น.` : 'ไม่ได้ลงเวลา';
        const remEl = document.getElementById('resumeRowRemark');
        if (remEl) remEl.textContent = rec.remark || 'ไม่มีหมายเหตุ';

        // 5. พิกัดตำแหน่งและแผนที่ Google Map เฉพาะของ Row นี้ (ทั้งขาเข้า และ ขาออก)
        const inLat = rec.check_in_lat ?? (rec.is_special_request ? rec.check_out_lat : null);
        const inLng = rec.check_in_lng ?? (rec.is_special_request ? rec.check_out_lng : null);
        const inLocName = (rec.check_in_location || (rec.is_special_request ? rec.check_out_location : '') || 'ไม่ระบุสถานที่').trim();

        const outLat = rec.check_out_lat ?? (rec.is_special_request ? rec.check_in_lat : null);
        const outLng = rec.check_out_lng ?? (rec.is_special_request ? rec.check_in_lng : null);
        let outLocName = (rec.check_out_location || (rec.is_special_request ? rec.check_in_location : '') || '').trim();
        if (!outLocName) {
            outLocName = (isCheckedOut || rec.is_special_request) ? 'ไม่ระบุสถานที่' : '-';
        }
        const outFallbackGps = (isCheckedOut || rec.is_special_request) ? 'ไม่ได้บันทึกพิกัด GPS' : 'ยังไม่ได้ลงเวลาออกงาน';

        const setupGpsAndMap = (coordsId, linkId, iframeId, placeholderId, locNameId, lat, lng, locName, fallbackMsg) => {
            const locNameEl = document.getElementById(locNameId);
            if (locNameEl) locNameEl.textContent = locName || '-';

            const coordsEl = document.getElementById(coordsId);
            const mapLinkEl = document.getElementById(linkId);
            const mapIframeEl = document.getElementById(iframeId);
            const mapPlaceholderEl = document.getElementById(placeholderId);

            if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
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
                if (coordsEl) coordsEl.textContent = fallbackMsg || 'ไม่ได้บันทึกพิกัด GPS';
                mapLinkEl?.classList.add('hidden');
                if (mapIframeEl) {
                    mapIframeEl.src = '';
                    mapIframeEl.classList.add('hidden');
                }
                mapPlaceholderEl?.classList.remove('hidden');
            }
        };

        setupGpsAndMap(
            'resumeRowGpsCoords', 'resumeRowGoogleMapLink', 'resumeRowMapIframe', 'resumeRowMapPlaceholder', 'resumeRowLocationName',
            inLat, inLng, inLocName, 'ไม่ได้บันทึกพิกัด GPS'
        );

        setupGpsAndMap(
            'resumeRowGpsCoordsOut', 'resumeRowGoogleMapLinkOut', 'resumeRowMapIframeOut', 'resumeRowMapPlaceholderOut', 'resumeRowLocationNameOut',
            outLat, outLng, outLocName, outFallbackGps
        );

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
        if (this.currentPhotoBlobUrlOut) {
            URL.revokeObjectURL(this.currentPhotoBlobUrlOut);
            this.currentPhotoBlobUrlOut = null;
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

    async syncReportsSilent(deltaDetail = null) {
        let startDate = UIHelpers.getTodayISO();
        let endDate = startDate;
        if (this.dateMode === 'single') {
            startDate = document.getElementById('reportSingleDateInput')?.value || startDate;
            endDate = startDate;
        } else {
            startDate = document.getElementById('reportStartDateInput')?.value || startDate;
            endDate = document.getElementById('reportEndDateInput')?.value || startDate;
        }

        try {
            const oldRecords = this.records || [];
            const oldMap = new Map();
            for (const r of oldRecords) {
                if (r.row_uid) oldMap.set(String(r.row_uid), r);
                if (r.log_id) oldMap.set(String(r.log_id), r);
                if (r.personnel_id && r.work_date) {
                    oldMap.set(`${r.personnel_id}_${r.work_date}`, r);
                    oldMap.set(`${r.personnel_id}_${r.work_date}_empty`, r);
                }
            }

            const freshRecords = await AttendanceModel.getReportRecordsByDateRange(startDate, endDate, this.currentUser);

            let categoryChanged = false;
            const changedUids = new Set();
            for (const fr of freshRecords) {
                const prev = oldMap.get(String(fr.row_uid)) ||
                    (fr.log_id ? oldMap.get(String(fr.log_id)) : null) ||
                    oldMap.get(`${fr.personnel_id}_${fr.work_date}`) ||
                    oldMap.get(`${fr.personnel_id}_${fr.work_date}_empty`);

                if (prev) {
                    const oldCat = prev.status_category || prev.status_key;
                    const newCat = fr.status_category || fr.status_key;
                    if (oldCat !== newCat) {
                        categoryChanged = true;
                        if (fr.row_uid) changedUids.add(String(fr.row_uid));
                        if (fr.log_id) changedUids.add(String(fr.log_id));
                        if (fr.personnel_id) changedUids.add(String(fr.personnel_id));
                        changedUids.add(`${fr.personnel_id}_${fr.work_date}`);
                    } else if (prev.check_in_time !== fr.check_in_time || prev.check_out_time !== fr.check_out_time) {
                        if (fr.row_uid) changedUids.add(String(fr.row_uid));
                        if (fr.log_id) changedUids.add(String(fr.log_id));
                        changedUids.add(`${fr.personnel_id}_${fr.work_date}`);
                    }
                }
            }

            this.records = freshRecords;
            this.#renderStatusTagFilterChips();

            const masterContainer = document.getElementById('reportTablesMasterContainer');
            if (categoryChanged && masterContainer) {
                // ย้ายแถวข้ามตารางสถานะ พร้อมคงตำแหน่ง Scroll เดิม
                const prevScrollY = window.scrollY;
                this.#renderSeparateTablesBySelectedTags(false);
                window.scrollTo({ top: prevScrollY, behavior: 'instant' });

                // ไฮไลต์แถวของบุคคลที่สถานะเปลี่ยนข้ามตาราง
                const rows = masterContainer.querySelectorAll('tr.report-person-row');
                for (const row of rows) {
                    const uid = row.getAttribute('data-row-uid');
                    const logId = row.getAttribute('data-row-id');
                    if (changedUids.has(uid) || changedUids.has(logId)) {
                        row.classList.add('bg-emerald-500/15', 'transition-colors', 'duration-1000');
                        setTimeout(() => {
                            row.classList.remove('bg-emerald-500/15', 'transition-colors', 'duration-1000');
                        }, 2200);
                    }
                }
            } else if (masterContainer) {
                // อัปเดตเฉพาะเซลล์แบบ In-Place หากสถานะตารางเดิมไม่เปลี่ยน
                const freshMap = new Map();
                for (const r of freshRecords) {
                    if (r.row_uid) freshMap.set(String(r.row_uid), r);
                    if (r.log_id) freshMap.set(String(r.log_id), r);
                    if (r.personnel_id && r.work_date) {
                        freshMap.set(`${r.personnel_id}_${r.work_date}`, r);
                        freshMap.set(`${r.personnel_id}_${r.work_date}_empty`, r);
                    }
                }

                const showGps = Boolean(this.settings?.require_gps);
                const visibleRows = masterContainer.querySelectorAll('tr.report-person-row');
                for (const row of visibleRows) {
                    const uid = row.getAttribute('data-row-uid');
                    const logId = row.getAttribute('data-row-id');
                    const updated = freshMap.get(uid) || freshMap.get(logId);
                    if (updated) {
                        const cells = row.querySelectorAll('td');
                        let isUpdated = false;

                        // cell 3: เวลาเข้า
                        if (cells[3]) {
                            const newIn = updated.check_in_time ? updated.check_in_time + ' น.' : '-';
                            if (cells[3].textContent.trim() !== newIn) {
                                cells[3].textContent = newIn;
                                isUpdated = true;
                            }
                        }
                        // cell 4: เวลาออก
                        if (cells[4]) {
                            const newOut = updated.check_out_time ? updated.check_out_time + ' น.' : '-';
                            if (cells[4].textContent.trim() !== newOut) {
                                cells[4].textContent = newOut;
                                isUpdated = true;
                            }
                        }
                        // GPS location names
                        if (showGps) {
                            if (cells[5] && updated.check_in_location) {
                                const inLocDiv = cells[5].querySelector('div');
                                if (inLocDiv && !inLocDiv.textContent.includes(updated.check_in_location)) {
                                    inLocDiv.innerHTML = `<i class="fa-solid fa-location-dot text-emerald-600 mr-1"></i>${updated.check_in_location}`;
                                    isUpdated = true;
                                }
                            }
                            if (cells[6] && updated.check_out_location) {
                                const outLocDiv = cells[6].querySelector('div');
                                if (outLocDiv && !outLocDiv.textContent.includes(updated.check_out_location)) {
                                    outLocDiv.innerHTML = `<i class="fa-solid fa-location-dot text-teal-600 mr-1"></i>${updated.check_out_location}`;
                                    isUpdated = true;
                                }
                            }
                        }

                        if (isUpdated) {
                            DOMDiffHelper.highlightRowUpdate(row);
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('[ReportsController] syncReportsSilent error:', err);
        }
    }

    #bindEvents() {
        const triggerDebouncedReportSync = (detail) => {
            if (this._realtimeDebounceTimer) clearTimeout(this._realtimeDebounceTimer);
            this._realtimeDebounceTimer = setTimeout(() => {
                this.syncReportsSilent(detail);
            }, 250);
        };
        window.addEventListener('bma:realtime-delta-sync', (e) => {
            triggerDebouncedReportSync(e.detail);
        });
        window.addEventListener('bma:realtime-sync', () => {
            triggerDebouncedReportSync();
        });
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
            const baseRecords = this.#getFilteredRecords();
            const filtered = baseRecords.filter(r => this.selectedStatusKeys.has(r.status_category));
            if (filtered.length === 0) {
                UIHelpers.alert('ไม่มีข้อมูลส่งออก', 'ไม่พบรายการใน TAG สถานะที่เลือก', 'warning');
                return;
            }
            const showGps = Boolean(this.settings?.require_gps);
            const rows = filtered.map((r, idx) => {
                const inMode = this.#resolveLocationMode(r, 'check_in');
                const inLocFormatted = this.#formatLocationName(r.check_in_location || (r.is_special_request ? r.check_out_location : ''));
                let inGpsDisplay = '-';
                if (inMode) {
                    const modeText = inMode === 'ONSITE' ? 'ในสถานที่' : 'นอกสถานที่';
                    inGpsDisplay = (inLocFormatted && inLocFormatted !== '-') ? `${modeText} ${inLocFormatted}` : modeText;
                }

                const outMode = this.#resolveLocationMode(r, 'check_out');
                const outRawLoc = (r.check_out_location || (r.is_special_request ? r.check_in_location : '') || '').trim();
                const outLocFormatted = this.#formatLocationName(outRawLoc);
                let outGpsDisplay = '-';
                if (outMode) {
                    const modeText = outMode === 'ONSITE' ? 'ในสถานที่' : 'นอกสถานที่';
                    outGpsDisplay = (outLocFormatted && outLocFormatted !== '-') ? `${modeText} ${outLocFormatted}` : modeText;
                }

                const resolvedRemark = this.#resolveReportRemark(r);

                const rowObj = {
                    'ลำดับ': idx + 1,
                    'วันที่ปฏิบัติราชการ': r.work_date_thai_full,
                    'ชื่อ-นามสกุล': r.full_name,
                    'ตำแหน่ง': r.position_full,
                    'สำนักงาน/กอง': r.bureau || '-',
                    'ส่วน/ฝ่าย': r.division || '-',
                    'กลุ่มงาน': r.work_group || '-',
                    'เวลาเข้างาน (24 ชม.)': r.check_in_time || '-',
                    'เวลาออกงาน (24 ชม.)': r.check_out_time || '-'
                };

                if (showGps) {
                    rowObj['พิกัด GPS เข้างาน'] = inGpsDisplay;
                    rowObj['พิกัด GPS ออกงาน'] = outGpsDisplay;
                }

                rowObj['สถานะ'] = r.status_label;
                rowObj['หมายเหตุ'] = resolvedRemark;

                return rowObj;
            });
            UIHelpers.exportToExcelUTF8(rows, `รายงานลงเวลาปฏิบัติราชการ_${UIHelpers.getTodayISO()}`, 'AttendanceReport');
        });

        document.getElementById('btnTemplateReportExcel')?.addEventListener('click', () => {
            const showGps = Boolean(this.settings?.require_gps);
            const sampleItem = {
                'ลำดับ': 1,
                'วันที่ปฏิบัติราชการ': UIHelpers.formatThaiFullDate(UIHelpers.getTodayISO()),
                'ชื่อ-นามสกุล': 'นายสมชาย สายตรวจ',
                'ตำแหน่ง': 'เจ้าพนักงานเทศกิจปฏิบัติการ',
                'สำนักงาน/กอง': 'สำนักเทศกิจ',
                'ส่วน/ฝ่าย': 'กองตรวจและปฏิบัติการพื้นที่ 1',
                'กลุ่มงาน': 'กลุ่มงานตรวจและปฏิบัติการ 1',
                'เวลาเข้างาน (24 ชม.)': '08:15',
                'เวลาออกงาน (24 ชม.)': '16:35'
            };

            if (showGps) {
                sampleItem['พิกัด GPS เข้างาน'] = 'ในสถานที่ บริเวณ สำนักเทศกิจ';
                sampleItem['พิกัด GPS ออกงาน'] = 'ในสถานที่ บริเวณ ศาลาว่าการ กทม.';
            }

            sampleItem['สถานะ'] = 'ปฏิบัติงานปกติ';
            sampleItem['หมายเหตุ'] = '-';

            const sample = [sampleItem];
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