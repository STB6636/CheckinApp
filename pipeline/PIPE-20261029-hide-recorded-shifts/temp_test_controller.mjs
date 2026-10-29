/**
 * @file assets/js/controllers/CheckinController.js
 * @description คลาสควบคุมหน้าลงเวลาปฏิบัติราชการ (รองรับการค้นหาสถานที่ใกล้เคียงระยะ z=19 "ใกล้เคียง..." -> z=20 "บริเวณ..." -> ซอย/ซอยย่อย "ใกล้เคียง..." พร้อมปรับซูมแผนที่อัตโนมัติ)
 */

import { Config } from '../core/Config.js';
import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { AttendanceModel } from '../models/AttendanceModel.js';

export class CheckinController {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.mediaStream = null;
        this.isCameraRunning = false;
        this.capturedPhotoDataUrl = '';
        this.gpsData = {
            ready: false,
            lat: null,
            lng: null,
            locationName: '',
            zoomLevel: 19
        };
        this.locationResolvePromise = null;
        this.activeRegularRecord = null;
        this.availableShiftsForCurrentWindow = [];
        this.activeHistoryTab = 'today';
        this.todayHistoryList = [];
        this.pastHistoryList = [];
        this.pastPageSize = 10;
        this.pastCurrentPage = 1;
        this.specialRequestsList = [];
        this.lastEvaluatedMinute = -1;
        this.specialModalGps = {
            mode: 'current',
            customLat: null,
            customLng: null,
            customLocationName: ''
        };
        this.spLeafletMap = null;
        this.spLeafletMarker = null;
        this.init();
    }

    async init() {
        UIHelpers.initTheme();
        UIHelpers.maskUrlToRoot('checkin.html');
        this.#updateThemeButtonUI();

        this.currentUser = AuthService.requireAuth(['SuperAdmin', 'Admin', 'User']);
        if (!this.currentUser) return;

        this.#checkAndShowWelcomeToast();
        this.#startLiveClock24();
        this.#bindEvents();

        UIHelpers.showLoading('กำลังเตรียมระบบลงเวลาปฏิบัติราชการ...');
        try {
            this.settings = await SettingsModel.getSettings(false);
            this.#renderUserAndSettingsInfo();
            this.#applyDynamicWorkspaceLayout();
            await this.#refreshAllAttendanceData();
        } catch (err) {
            console.error('CheckinController initialization error:', err);
        } finally {
            UIHelpers.hideLoading();
        }

        if (this.settings.require_photo) {
            this.#stopCameraAndShowStandby();
        } else {
            this.#stopCameraHardwareStream();
        }

        if (this.settings.require_gps) {
            this.#initGpsLocation();
        } else {
            this.gpsData = {
                ready: true,
                lat: null,
                lng: null,
                locationName: '',
                zoomLevel: 19
            };
        }
    }

    #applyDynamicWorkspaceLayout() {
        const showPhoto = Boolean(this.settings?.require_photo);
        const showGps = Boolean(this.settings?.require_gps);

        const cameraCard = document.getElementById('cameraSectionCard');
        const rightWrapper = document.getElementById('rightColumnWrapper');
        const gpsCard = document.getElementById('gpsSectionCard');
        const actionCard = document.getElementById('checkinActionCard');

        if (!cameraCard || !rightWrapper || !gpsCard || !actionCard) return;

        if (showPhoto && showGps) {
            cameraCard.classList.remove('hidden');
            gpsCard.classList.remove('hidden');

            cameraCard.className = 'w-full bma-card p-2 sm:p-2.5 flex flex-col justify-start';
            rightWrapper.className = 'w-full flex flex-col gap-3 lg:gap-3.5';
            gpsCard.className = 'bma-card p-3.5 lg:p-4 space-y-2 lg:space-y-2.5 flex flex-col justify-between';
            actionCard.className = 'bma-card p-3.5 lg:p-4 space-y-2 lg:space-y-2.5 flex flex-col justify-between';
        } else if (!showPhoto && showGps) {
            cameraCard.classList.add('hidden');
            gpsCard.classList.remove('hidden');

            rightWrapper.className = 'lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch';
            gpsCard.className = 'lg:col-span-7 bma-card p-3.5 lg:p-4 space-y-2 lg:space-y-2.5 flex flex-col justify-between h-full';
            actionCard.className = 'lg:col-span-5 bma-card p-3.5 lg:p-4 space-y-2 lg:space-y-2.5 flex flex-col justify-between h-full';
        } else if (showPhoto && !showGps) {
            cameraCard.classList.remove('hidden');
            gpsCard.classList.add('hidden');

            cameraCard.className = 'w-full bma-card p-2 sm:p-2.5 flex flex-col justify-start h-full';
            rightWrapper.className = 'w-full flex flex-col justify-stretch';
            actionCard.className = 'bma-card p-3.5 lg:p-4 space-y-2 lg:space-y-2.5 flex flex-col justify-between h-full w-full';
        } else {
            cameraCard.classList.add('hidden');
            gpsCard.classList.add('hidden');

            rightWrapper.className = 'lg:col-span-12 max-w-2xl w-full mx-auto';
            actionCard.className = 'bma-card p-4 sm:p-5 space-y-3 flex flex-col justify-between w-full shadow-xl';
        }
    }

    #updateThemeButtonUI() {
        const isDark = document.documentElement.classList.contains('dark');
        const icon = document.getElementById('checkinThemeIcon');
        const label = document.getElementById('checkinThemeLabel');
        if (icon) {
            icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
        if (label) {
            label.textContent = isDark ? 'โหมดสว่าง' : 'โหมดถนอมสายตา';
        }
        const drawerIcon = document.getElementById('drawerThemeIcon');
        const drawerLabel = document.getElementById('drawerThemeLabel');
        if (drawerIcon) {
            drawerIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
        if (drawerLabel) {
            drawerLabel.textContent = isDark ? 'โหมดสว่าง' : 'โหมดถนอมสายตา';
        }
    }

    #checkAndShowWelcomeToast() {
        const welcomeName = sessionStorage.getItem(Config.STORAGE_KEYS.WELCOME_TOAST);
        if (welcomeName) {
            sessionStorage.removeItem(Config.STORAGE_KEYS.WELCOME_TOAST);
            setTimeout(() => {
                UIHelpers.showToast(`ยินดีต้อนรับคุณ ${welcomeName}`, 'success', 2800);
            }, 250);
        }
    }

    #startLiveClock24() {
        const updateClock = () => {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');

            const clockEl = document.getElementById('liveClockDisplay');
            const dateEl = document.getElementById('liveDateDisplay');
            if (clockEl) {
                clockEl.textContent = `${hh}:${mm} น.`;
            }
            if (dateEl) {
                dateEl.textContent = UIHelpers.formatThaiShortDate(UIHelpers.getTodayISO());
            }

            const currentMinuteOfDay = (now.getHours() * 60) + now.getMinutes();
            if (this.settings && this.lastEvaluatedMinute !== -1 && currentMinuteOfDay !== this.lastEvaluatedMinute) {
                this.lastEvaluatedMinute = currentMinuteOfDay;
                this.#evaluateTimeWindowAndPopulateShifts();
                this.#updateStatusCardsAndMainButton();
            } else if (this.lastEvaluatedMinute === -1) {
                this.lastEvaluatedMinute = currentMinuteOfDay;
            }
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    #isShiftAlreadyRecordedToday(shift) {
        if (!shift) return false;
        const todayIso = UIHelpers.getTodayISO();
        const historyList = Array.isArray(this.todayHistoryList) ? this.todayHistoryList : [];

        const shiftFormattedName = SettingsModel.formatShiftDisplayText(shift).trim();
        const cleanBaseName = String(shift.name || '')
            .replace(/\s*\(\d{1,2}[:.]\d{2}\s*-\s*\d{1,2}[:.]\d{2}.*?\)/g, '')
            .replace(/\s*\(ข้ามวัน\)/g, '')
            .trim();
        const shiftIn24 = UIHelpers.formatTime24(shift.check_in);
        const shiftOut24 = UIHelpers.formatTime24(shift.check_out);

        // ถ้าเป็นเวลาราชการปกติ แล้วมีรายการ regularRecord วันนี้แล้ว
        if (!shift.is_overtime && !shift.is_custom && cleanBaseName.includes('เวลาราชการปกติ')) {
            if (this.activeRegularRecord && this.activeRegularRecord.work_date === todayIso && this.activeRegularRecord.check_in_time) {
                return true;
            }
        }

        return historyList.some(item => {
            const itemShiftName = String(item.shift_name || '').trim();
            const itemCleanBase = itemShiftName
                .replace(/\s*\(\d{1,2}[:.]\d{2}\s*-\s*\d{1,2}[:.]\d{2}.*?\)/g, '')
                .replace(/\s*\(ข้ามวัน\)/g, '')
                .trim();
            const itemIn24 = UIHelpers.formatTime24(item.shift_check_in || item.check_in_time);
            const itemOut24 = UIHelpers.formatTime24(item.shift_check_out || item.check_out_time);

            // 1. ตรงตามชื่อ Format เต็ม
            if (itemShiftName && itemShiftName === shiftFormattedName) {
                return true;
            }

            // 2. ตรงตามชื่อ Clean base + เวลาเข้าออกตรงกัน
            if (!shift.is_custom && cleanBaseName && itemCleanBase === cleanBaseName) {
                if (itemIn24 === shiftIn24 && itemOut24 === shiftOut24) {
                    return true;
                }
            }

            // 3. กะปกติ
            if (!shift.is_overtime && cleanBaseName.includes('เวลาราชการปกติ') && itemCleanBase.includes('เวลาราชการปกติ')) {
                return true;
            }

            return false;
        });
    }

    #isShiftActiveAtCurrentTime(shift, nowMin, allowStartMin) {
        if (!this.settings?.filter_shifts_by_realtime) {
            return true;
        }
        if (shift.is_custom) {
            return true;
        }

        const startMin = UIHelpers.timeToMinutes(shift.check_in || '08:30');
        const endMin = UIHelpers.timeToMinutes(shift.check_out || '16:30');
        if (startMin < 0 || endMin < 0) return true;

        let shiftStartMin;
        if (shift.allow_early_checkin) {
            const earlyWindow = Math.max(0, Number(this.settings?.early_shift_window_minutes ?? 30));
            shiftStartMin = startMin - earlyWindow;
        } else {
            shiftStartMin = shift.is_overtime ? startMin : Math.min(startMin, allowStartMin);
        }

        const isOvernight = Boolean(shift.is_overnight || endMin < startMin);

        if (isOvernight) {
            if (shiftStartMin < 0) {
                const normalizedShiftStart = shiftStartMin + 1440;
                return (nowMin >= normalizedShiftStart) || (nowMin <= endMin);
            }
            return (nowMin >= shiftStartMin) || (nowMin <= endMin);
        }

        if (shiftStartMin < 0) {
            const normalizedShiftStart = shiftStartMin + 1440;
            return (nowMin >= normalizedShiftStart) || (nowMin <= endMin);
        }
        return nowMin >= shiftStartMin && nowMin <= endMin;
    }

    #evaluateTimeWindowAndPopulateShifts() {
        const allShifts = this.settings?.work_shifts || [];
        const selectEl = document.getElementById('checkinShiftSelect');
        const labelEl = document.getElementById('checkinShiftSelectLabel');
        if (!selectEl) return;

        const prevSelectedIdx = selectEl.value;
        const nowMin = UIHelpers.timeToMinutes(UIHelpers.getCurrentTimeHHMM());
        const allowStartMin = UIHelpers.timeToMinutes(this.settings?.allow_checkin_start_time || '06:00');
        const stdInRef = UIHelpers.formatTime24(this.settings?.standard_check_in || '08:30');
        const stdOutRef = UIHelpers.formatTime24(this.settings?.standard_check_out || '16:30');
        const stdInMin = UIHelpers.timeToMinutes(stdInRef);
        const stdOutMin = UIHelpers.timeToMinutes(stdOutRef);
        const isWithinNormalHours = (stdInMin <= stdOutMin)
            ? (nowMin >= stdInMin && nowMin < stdOutMin)
            : (nowMin >= stdInMin || nowMin < stdOutMin);

        const hasActiveOtShifts = allShifts.some(s =>
            (s.is_overtime || s.is_custom) && this.#isShiftActiveAtCurrentTime(s, nowMin, allowStartMin)
        );

        const hasUnclosedRegular = Boolean(
            this.activeRegularRecord &&
            this.activeRegularRecord.check_in_time &&
            !this.activeRegularRecord.check_out_time
        );
        const hasCompletedRegularToday = Boolean(
            this.activeRegularRecord &&
            this.activeRegularRecord.check_in_time &&
            this.activeRegularRecord.check_out_time &&
            this.activeRegularRecord.work_date === UIHelpers.getTodayISO()
        );

        const isBeforeAllowStart = nowMin < allowStartMin;
        const isAfterStdOut = nowMin > stdOutMin;
        const isRealtimeFilterEnabled = this.settings?.filter_shifts_by_realtime !== false;
        const isNormalHoursDisabledNow = Boolean(this.settings?.disable_normal_hours_checkin && isWithinNormalHours);
        const mustUseOvertimeWindow = !hasUnclosedRegular && (
            hasCompletedRegularToday ||
            (isRealtimeFilterEnabled && (isBeforeAllowStart || isAfterStdOut)) ||
            (isNormalHoursDisabledNow && hasActiveOtShifts)
        );

        let candidateShifts = allShifts.map((s, originalIdx) => ({ ...s, originalIdx }));

        // 1) ซ่อนกะปกติเมื่อปิดรับเวลาปกติ
        if (this.settings?.disable_normal_hours_checkin) {
            candidateShifts = candidateShifts.filter(s => {
                const isNormalShift = String(s.name || '').includes('เวลาราชการปกติ') ||
                    (!s.is_overtime && !s.is_custom && s.check_in === stdInRef && s.check_out === stdOutRef);
                return !isNormalShift;
            });
        }

        // 2) ซ่อนกะที่ลงเวลาไปแล้วในวันนี้
        candidateShifts = candidateShifts.filter(s => !this.#isShiftAlreadyRecordedToday(s));

        // 3) ถ้าต้องใช้ OT Window
        if (mustUseOvertimeWindow) {
            const otOnly = candidateShifts.filter(s => s.is_overtime || s.is_custom);
            if (otOnly.length > 0) {
                candidateShifts = otOnly;
            }
        }

        // 4) กรองตามเวลาจริง
        let timeFilteredShifts = candidateShifts.filter(s =>
            this.#isShiftActiveAtCurrentTime(s, nowMin, allowStartMin)
        );

        this.availableShiftsForCurrentWindow = timeFilteredShifts;

        if (labelEl) {
            if (mustUseOvertimeWindow) {
                labelEl.textContent = 'เลือกช่วงเวลาปฏิบัติงานนอกเวลา';
            } else if (this.settings?.single_click_checkin) {
                labelEl.textContent = 'เลือกช่วงเวลาปฏิบัติงาน';
            } else {
                labelEl.textContent = 'เลือกช่วงเวลาทำงาน';
            }
        }

        // 5) การเรนเดอร์ Dropdown (selectEl)
        if (timeFilteredShifts.length === 0) {
            selectEl.innerHTML = '<option value="">-- บันทึกลงเวลาครบทุกช่วงเวลาแล้ว / ไม่มีช่วงเวลาที่เปิดให้ลงเวลา --</option>';
            selectEl.value = '';
        } else {
            const emptyOptionHtml = '<option value="">-- กรุณาเลือกช่วงเวลาปฏิบัติงาน --</option>';
            const shiftOptionsHtml = timeFilteredShifts.map(s => {
                const displayText = SettingsModel.formatShiftDisplayText(s);
                return `<option value="${s.originalIdx}">${displayText}</option>`;
            }).join('');
            selectEl.innerHTML = emptyOptionHtml + shiftOptionsHtml;

            if (prevSelectedIdx && timeFilteredShifts.some(s => String(s.originalIdx) === String(prevSelectedIdx))) {
                selectEl.value = prevSelectedIdx;
            } else {
                selectEl.value = '';
            }
        }
    }

    #renderUserAndSettingsInfo() {
        const org = this.settings?.organization_name || 'กรุงเทพมหานคร';
        const bureau = this.settings?.bureau_name || 'สำนักเทศกิจ';
        const footerDesc = this.settings?.footer_description || '';

        const setElText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setElText('checkinOrgName', org);
        setElText('checkinBureauName', bureau);
        setElText('footerCheckinOrg', org);
        setElText('footerCheckinBureau', bureau);

        const descEl = document.getElementById('footerCheckinDesc');
        if (descEl) {
            descEl.textContent = footerDesc;
            descEl.classList.toggle('hidden', !footerDesc);
        }

        const logoBox = document.getElementById('checkinLogoBox');
        if (this.settings?.logo_url && logoBox) {
            logoBox.innerHTML = `<img src="${this.settings.logo_url}" alt="Logo" class="w-full h-full object-contain rounded-xl bg-white p-0.5">`;
        }

        if (['SuperAdmin', 'Admin'].includes(this.currentUser.role)) {
            const btnGoAdmin = document.getElementById('btnGoAdminDashboard');
            if (btnGoAdmin) {
                btnGoAdmin.classList.remove('hidden');
                btnGoAdmin.classList.add('max-lg:hidden');
            }
            document.getElementById('drawerLinkAdminDashboard')?.classList.remove('hidden');
        }

        const p = this.currentUser.personnel;
        setElText('drawerUserFullName', this.currentUser.full_name);
        setElText('drawerUserRole', this.currentUser.role);
        if (p) {
            setElText('drawerUserAffiliation', `${p.organization || ''} • ${p.bureau || ''}`);
        } else {
            setElText('drawerUserAffiliation', `${org} • ${this.currentUser.scope_bureau || bureau}`);
        }

        setElText('userFullNameText', this.currentUser.full_name);
        setElText('userRoleBadge', this.currentUser.role);

        if (p) {
            setElText('userPositionText', `${p.position_title} ${p.position_level ? 'ระดับ' + p.position_level : ''} (${p.position_type || '-'})`);
            setElText('userAffiliationText', `${p.organization} • ${p.bureau} • ${p.division} ${p.work_group ? '• ' + p.work_group : ''}`);
        } else {
            setElText('userPositionText', `รหัสผู้ใช้งาน: ${this.currentUser.username}`);
            setElText('userAffiliationText', `${org} • ${this.currentUser.scope_bureau || bureau}`);
        }

        const allShifts = this.settings?.work_shifts || [];
        const spSelect = document.getElementById('spShiftSelect');
        if (spSelect) {
            const stdIn = UIHelpers.formatTime24(this.settings?.standard_check_in || '08:30');
            const stdOut = UIHelpers.formatTime24(this.settings?.standard_check_out || '16:30');
            const disableNormal = Boolean(this.settings?.disable_normal_hours_checkin);

            const filteredShifts = allShifts
                .map((s, idx) => ({ s, idx }))
                .filter(({ s }) => {
                    if (!disableNormal) return true;
                    const isNormalHours = String(s.name || '').includes('เวลาราชการปกติ') ||
                        (!s.is_overtime && s.check_in === stdIn && s.check_out === stdOut);
                    return !isNormalHours;
                });

            spSelect.innerHTML = filteredShifts.map(({ s, idx }) =>
                `<option value="${idx}">${SettingsModel.formatShiftDisplayText(s)}</option>`
            ).join('');
        }

        const remarks = this.settings?.remarks || [];
        const spRemarkSelect = document.getElementById('spRemarkSelect');
        if (spRemarkSelect) {
            spRemarkSelect.innerHTML = remarks.map(r =>
                `<option value="${r}">${r}</option>`
            ).join('');
        }

        const spWorkDate = document.getElementById('spWorkDate');
        if (spWorkDate) {
            spWorkDate.value = UIHelpers.getTodayISO();
        }
    }

    async #refreshAllAttendanceData() {
        const todayIso = UIHelpers.getTodayISO();
        const [activeReg, allHistory, specialRequests] = await Promise.all([
            AttendanceModel.getActiveRegularRecordForCheckout(this.currentUser.personnel_id, this.currentUser.id, this.settings),
            AttendanceModel.getPersonalAttendanceHistory(this.currentUser.personnel_id, this.currentUser.id, 35),
            AttendanceModel.getPersonalSpecialRequests(this.currentUser.personnel_id, this.currentUser.id)
        ]);

        this.activeRegularRecord = activeReg;
        this.todayHistoryList = allHistory.filter(item => item.work_date === todayIso);
        this.pastHistoryList = allHistory.filter(item => item.work_date !== todayIso).slice(0, 30);
        this.specialRequestsList = specialRequests;

        this.#evaluateTimeWindowAndPopulateShifts();
        this.#updateStatusCardsAndMainButton();
        this.#renderPersonalAttendanceTabs();
        this.#renderSpecialRequestsHistoryTable();
    }

    #updateStatusCardsAndMainButton() {
        const regularRecord = this.activeRegularRecord;
        const todayIso = UIHelpers.getTodayISO();

        const checkinCardTitleEl = document.getElementById('todayCheckinCardTitle');
        const checkoutCardTitleEl = document.getElementById('todayCheckoutCardTitle');
        const checkinTimeEl = document.getElementById('todayCheckinTime');
        const checkinBadgeEl = document.getElementById('todayCheckinBadge');
        const checkoutTimeEl = document.getElementById('todayCheckoutTime');
        const checkoutBadgeEl = document.getElementById('todayCheckoutBadge');
        const btnSubmitMain = document.getElementById('btnSubmitCheckinMain');
        const btnSubmitLabel = document.getElementById('btnSubmitCheckinLabel');
        const modeTag = document.getElementById('checkinRecordingModeTag');
        const mainCustomBox = document.getElementById('mainCustomTimeContainer');
        const noticeBox = document.getElementById('regularCompletedNoticeBox');
        const noticeText = document.getElementById('regularCompletedNoticeText');
        const shiftSelectorContainer = document.getElementById('shiftSelectorContainer');

        const isNormalModeSetting = !Boolean(this.settings?.single_click_checkin);
        const shiftSelectVal = document.getElementById('checkinShiftSelect')?.value;
        const hasSelectedShift = shiftSelectVal !== '' && shiftSelectVal !== null && shiftSelectVal !== undefined;
        const shiftIdx = hasSelectedShift ? parseInt(shiftSelectVal, 10) : null;
        const shiftObj = (shiftIdx !== null && !isNaN(shiftIdx))
            ? ((this.settings?.work_shifts || [])[shiftIdx] || {})
            : {};

        const nowMin = UIHelpers.timeToMinutes(UIHelpers.getCurrentTimeHHMM());
        const allowStartRef = UIHelpers.formatTime24(this.settings?.allow_checkin_start_time || '06:00');
        const allowStartMin = UIHelpers.timeToMinutes(allowStartRef);
        const stdInRef = UIHelpers.formatTime24(this.settings?.standard_check_in || '08:30');
        const stdOutRef = UIHelpers.formatTime24(this.settings?.standard_check_out || '16:30');
        const stdOutMin = UIHelpers.timeToMinutes(stdOutRef);
        const graceMin = Number(this.settings?.checkout_grace_minutes ?? 30);
        const stdInMin = UIHelpers.timeToMinutes(stdInRef);
        const isWithinNormalHours = (stdInMin <= stdOutMin)
            ? (nowMin >= stdInMin && nowMin < stdOutMin)
            : (nowMin >= stdInMin || nowMin < stdOutMin);
        btnSubmitMain?.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');

        const allShifts = this.settings?.work_shifts || [];
        const hasActiveOtShifts = allShifts.some(s =>
            (s.is_overtime || s.is_custom) && this.#isShiftActiveAtCurrentTime(s, nowMin, allowStartMin)
        );

        const hasUnclosedRegular = Boolean(
            regularRecord &&
            regularRecord.check_in_time &&
            !regularRecord.check_out_time
        );

        const isRegularCompletedToday = Boolean(
            regularRecord &&
            regularRecord.check_in_time &&
            regularRecord.check_out_time &&
            regularRecord.work_date === todayIso
        );

        const isBeforeAllowStart = nowMin < allowStartMin;
        const isAfterStdOut = nowMin > stdOutMin;

        if (!regularRecord) {
            if (checkinCardTitleEl) checkinCardTitleEl.textContent = 'เวลาเข้างานปกติวันนี้ (24 ชม.)';
            if (checkoutCardTitleEl) checkoutCardTitleEl.textContent = 'เวลาออกงานปกติวันนี้ (24 ชม.)';
            checkinTimeEl.textContent = 'ยังไม่ได้ลงเวลา';
            checkinBadgeEl.textContent = 'รอลงเวลาเข้า';
            checkinBadgeEl.className = 'bma-badge bma-badge-warning';
            checkinBadgeEl.style.backgroundColor = '';

            checkoutTimeEl.textContent = 'ยังไม่ได้ลงเวลา';
            checkoutBadgeEl.textContent = 'รอลงเวลาออก';
            checkoutBadgeEl.className = 'bma-badge bma-badge-sky';
        } else {
            const isPastUnclosed = regularRecord.work_date !== todayIso && !regularRecord.check_out_time;
            const dateSuffix = isPastUnclosed ? ` (${UIHelpers.formatThaiShortDate(regularRecord.work_date)})` : 'วันนี้ (24 ชม.)';
            if (checkinCardTitleEl) checkinCardTitleEl.textContent = `เวลาเข้างานปกติ${dateSuffix}`;
            if (checkoutCardTitleEl) checkoutCardTitleEl.textContent = `เวลาเลิกงานปกติ${dateSuffix}`;

            const evalStatus = AttendanceModel.evaluateOfficialStatus(regularRecord, this.settings);
            checkinTimeEl.textContent = regularRecord.check_in_time ? `${UIHelpers.formatTime24(regularRecord.check_in_time)} น.` : '-';
            checkinBadgeEl.textContent = evalStatus.status_label;
            checkinBadgeEl.className = 'bma-badge text-white';
            checkinBadgeEl.style.backgroundColor = evalStatus.row_color;

            if (regularRecord.check_out_time) {
                checkoutTimeEl.textContent = `${UIHelpers.formatTime24(regularRecord.check_out_time)} น.`;
                checkoutBadgeEl.textContent = 'ลงเวลาเลิกงานแล้ว';
                checkoutBadgeEl.className = 'bma-badge bma-badge-success';
            } else {
                checkoutTimeEl.textContent = 'ยังไม่ได้ลงเวลาเลิกงาน';
                checkoutBadgeEl.textContent = isPastUnclosed ? 'ค้างลงเวลาเลิกงาน' : 'รอลงเวลาเลิกงาน';
                checkoutBadgeEl.className = isPastUnclosed ? 'bma-badge bma-badge-danger' : 'bma-badge bma-badge-warning';
            }
        }

        if (!hasUnclosedRegular && (!this.availableShiftsForCurrentWindow || this.availableShiftsForCurrentWindow.length === 0)) {
            if (btnSubmitMain) {
                btnSubmitMain.disabled = true;
                btnSubmitMain.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            }
            if (btnSubmitLabel) {
                btnSubmitLabel.textContent = 'ไม่มีช่วงเวลาปฏิบัติงานให้บันทึก';
            }
            noticeBox?.classList.remove('hidden');
            if (noticeText) {
                noticeText.textContent = 'ท่านได้บันทึกลงเวลาปฏิบัติงานในทุกช่วงเวลาที่เปิดให้ลงเวลาเรียบร้อยแล้ว หรือไม่มีช่วงเวลาปฏิบัติงานที่เปิดให้ลงเวลาในขณะนี้';
            }
            shiftSelectorContainer?.classList.remove('hidden');
            mainCustomBox?.classList.add('hidden');
            return;
        }

        if (this.settings?.disable_normal_hours_checkin && isWithinNormalHours) {
            if (hasActiveOtShifts && !hasUnclosedRegular) {
                shiftSelectorContainer?.classList.remove('hidden', 'opacity-60', 'pointer-events-none');
                if (shiftObj.is_custom || String(shiftObj.name || '').includes('อื่นๆ')) {
                    mainCustomBox?.classList.remove('hidden');
                } else {
                    mainCustomBox?.classList.add('hidden');
                }

                if (hasSelectedShift && (shiftObj.is_overtime || shiftObj.is_custom)) {
                    if (modeTag) {
                        modeTag.textContent = 'ปฏิบัติงานนอกเวลา';
                        modeTag.className = 'bma-badge-pastel-purple';
                    }
                    if (btnSubmitMain) {
                        btnSubmitMain.disabled = false;
                        btnSubmitMain.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                    }
                    if (btnSubmitLabel) {
                        btnSubmitLabel.textContent = 'บันทึกลงเวลาปฏิบัติงานนอกเวลา';
                    }
                    noticeBox?.classList.remove('hidden');
                    if (noticeText) {
                        noticeText.textContent = 'ระบบอยู่ในโหมด "ช่วงเวลาปฏิบัติงานนอกเวลา" เมื่อกดบันทึกจะลงทั้งเวลาเข้าและเวลาเลิกงานตามช่วงเวลาที่เลือกให้อัตโนมัติ';
                    }
                    return;
                } else {
                    if (modeTag) {
                        modeTag.textContent = 'ปฏิบัติงานนอกเวลา';
                        modeTag.className = 'bma-badge-pastel-purple';
                    }
                    if (btnSubmitMain) {
                        btnSubmitMain.disabled = false;
                        btnSubmitMain.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                    }
                    if (btnSubmitLabel) {
                        btnSubmitLabel.textContent = 'กรุณาเลือกช่วงเวลาปฏิบัติงานนอกเวลา';
                    }
                    noticeBox?.classList.remove('hidden');
                    if (noticeText) {
                        noticeText.textContent = `ขณะนี้ระบบปิดรับการลงเวลาในเวลาปกติ (${stdInRef} - ${stdOutRef} น.) แต่ท่านสามารถเลือก "ช่วงเวลาปฏิบัติงานนอกเวลา" ที่เปิดให้ลงเวลาในขณะนี้ได้`;
                    }
                    return;
                }
            } else {
                shiftSelectorContainer?.classList.add('hidden');
                mainCustomBox?.classList.add('hidden');

                if (modeTag) {
                    modeTag.textContent = isNormalModeSetting ? 'รูปแบบปกติ' : 'รูปแบบพิเศษ';
                    modeTag.className = isNormalModeSetting ? 'bma-badge bma-badge-success' : 'bma-badge bma-badge-indigo';
                }

                if (btnSubmitMain) {
                    btnSubmitMain.disabled = true;
                    btnSubmitMain.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                }
                if (btnSubmitLabel) {
                    btnSubmitLabel.textContent = `ปิดรับการลงเวลาในช่วงเวลาปกติ (${stdInRef} - ${stdOutRef} น.)`;
                }
                noticeBox?.classList.remove('hidden');
                if (noticeText) {
                    noticeText.textContent = `ขณะนี้อยู่ในช่วงเวลาราชการปกติ (${stdInRef} - ${stdOutRef} น.) ระบบเปิดใช้งานฟังก์ชันปิดรับการลงเวลาในเวลาปกติ จึงไม่สามารถบันทึกลงเวลาได้`;
                }
                return;
            }
        }

        if (isNormalModeSetting && hasUnclosedRegular) {
            shiftSelectorContainer?.classList.add('hidden');
            mainCustomBox?.classList.add('hidden');

            if (modeTag) {
                modeTag.textContent = 'รูปแบบปกติ';
                modeTag.className = 'bma-badge bma-badge-success';
            }

            noticeBox?.classList.remove('hidden');
            const isPastDate = regularRecord.work_date !== todayIso;
            if (noticeText) {
                if (isPastDate) {
                    noticeText.textContent = `ท่านมีรายการลงเวลาเข้าปฏิบัติงานค้างอยู่เมื่อวันที่ ${UIHelpers.formatThaiShortDate(regularRecord.work_date)} เวลา ${UIHelpers.formatTime24(regularRecord.check_in_time)} น. กรุณากดบันทึกเวลาเลิกงานครั้งล่าสุดให้เสร็จสิ้นก่อน จึงจะสามารถลงเวลาทำงานในรอบถัดไปได้`;
                } else {
                    noticeText.textContent = `ท่านได้ลงเวลาเข้าปฏิบัติงานไว้เมื่อเวลา ${UIHelpers.formatTime24(regularRecord.check_in_time)} น. กรุณากดบันทึกลงเวลาเลิกงาน (เลิกงานก่อน ${stdOutRef} น. = ขาดราชการ | ตั้งแต่ ${stdOutRef} น. ไม่เกิน ${graceMin} นาที = บันทึกตามจริง | เกิน ${graceMin} นาที = บันทึกเวลาเลิกงาน+${graceMin} นาที)`;
                }
            }

            if (btnSubmitMain) btnSubmitMain.disabled = false;
            if (btnSubmitLabel) {
                btnSubmitLabel.textContent = isPastDate
                    ? `บันทึกลงเวลาเลิกงาน (${UIHelpers.formatThaiShortDate(regularRecord.work_date)})`
                    : 'บันทึกลงเวลาเลิกงาน';
            }
            return;
        }

        const isRealtimeFilterEnabled = this.settings?.filter_shifts_by_realtime !== false;
        if (isNormalModeSetting && isRealtimeFilterEnabled && !isRegularCompletedToday && !isBeforeAllowStart && !isAfterStdOut && !(hasActiveOtShifts && !hasUnclosedRegular)) {
            shiftSelectorContainer?.classList.add('hidden');
            mainCustomBox?.classList.add('hidden');

            if (modeTag) {
                modeTag.textContent = 'รูปแบบปกติ';
                modeTag.className = 'bma-badge bma-badge-success';
            }

            noticeBox?.classList.remove('hidden');
            if (noticeText) {
                noticeText.textContent = `เวลาราชการปกติ (${stdInRef} - ${stdOutRef} น.) เปิดให้เริ่มบันทึกเวลาเข้าปฏิบัติงานตั้งแต่เวลา ${allowStartRef} น.`;
            }

            if (btnSubmitMain) btnSubmitMain.disabled = false;
            if (btnSubmitLabel) {
                btnSubmitLabel.textContent = 'บันทึกลงเวลาเข้าปฏิบัติงาน';
            }
            return;
        }

        shiftSelectorContainer?.classList.remove('hidden', 'opacity-60', 'pointer-events-none');

        if (shiftObj.is_custom || String(shiftObj.name || '').includes('อื่นๆ')) {
            mainCustomBox?.classList.remove('hidden');
        } else {
            mainCustomBox?.classList.add('hidden');
        }

        const isOvertimeContext = Boolean(
            shiftObj.is_overtime ||
            (isRealtimeFilterEnabled && isBeforeAllowStart) ||
            (isRealtimeFilterEnabled && isAfterStdOut) ||
            isRegularCompletedToday
        );

        if (modeTag) {
            if (isOvertimeContext) {
                modeTag.textContent = 'ปฏิบัติงานนอกเวลา';
                modeTag.className = 'bma-badge-pastel-purple';
            } else {
                modeTag.textContent = 'รูปแบบพิเศษ';
                modeTag.className = 'bma-badge bma-badge-indigo';
            }
        }

        if (isOvertimeContext) {
            noticeBox?.classList.remove('hidden');
            if (noticeText) {
                if (isBeforeAllowStart) {
                    noticeText.textContent = `ขณะนี้อยู่ก่อนเวลาเริ่มบันทึกเข้าปฏิบัติงานปกติ (${allowStartRef} น.) ระบบสลับให้เลือก "ช่วงเวลาปฏิบัติงานนอกเวลา" และบันทึกเวลารูปแบบพิเศษอัตโนมัติ`;
                } else {
                    noticeText.textContent = `ระบบอยู่ในโหมด "ช่วงเวลาปฏิบัติงานนอกเวลา" เมื่อกดบันทึกจะลงทั้งเวลาเข้าและเวลาเลิกงานตามช่วงเวลาที่เลือกให้อัตโนมัติ`;
                }
            }
            if (btnSubmitMain) btnSubmitMain.disabled = false;
            if (btnSubmitLabel) {
                btnSubmitLabel.textContent = 'บันทึกลงเวลาปฏิบัติงานนอกเวลา';
            }
            return;
        }

        if (isRegularCompletedToday) {
            noticeBox?.classList.remove('hidden');
            if (noticeText) {
                noticeText.textContent = `วันนี้ท่านได้ลงเวลาเข้าและเลิกงานในเวลาทำการปกติครบแล้ว สามารถเลือกช่วงเวลา "ปฏิบัติงานนอกเวลา" หากต้องการลงเวลานอกเวลา`;
            }
            if (btnSubmitMain) btnSubmitMain.disabled = true;
            if (btnSubmitLabel) btnSubmitLabel.textContent = 'ลงเวลาทำการปกติของวันนี้ครบแล้ว';
        } else {
            noticeBox?.classList.add('hidden');
            if (btnSubmitMain) btnSubmitMain.disabled = false;
            if (btnSubmitLabel) {
                btnSubmitLabel.textContent = 'บันทึกลงเวลาเข้าปฏิบัติงาน';
            }
        }
    }

    #renderPersonalAttendanceTabs() {
        const todayCountEl = document.getElementById('todayHistoryCountBadge');
        const pastCountEl = document.getElementById('pastHistoryCountBadge');
        if (todayCountEl) todayCountEl.textContent = String(this.todayHistoryList.length);
        if (pastCountEl) pastCountEl.textContent = String(this.pastHistoryList.length);

        const todayTbody = document.getElementById('todayPersonalTableBody');
        if (todayTbody) {
            if (this.todayHistoryList.length === 0) {
                todayTbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 bma-text-sub">วันนี้ยังไม่มีรายการลงเวลาปฏิบัติราชการ</td></tr>`;
            } else {
                todayTbody.innerHTML = this.todayHistoryList.map((item, idx) => this.#buildHistoryRowHtml(item, idx + 1)).join('');
            }
        }

        const pastTbody = document.getElementById('pastPersonalTableBody');
        const pageInfoEl = document.getElementById('pastPageInfoText');
        const btnPrev = document.getElementById('btnPastPrevPage');
        const btnNext = document.getElementById('btnPastNextPage');

        const totalPast = this.pastHistoryList.length;
        const totalPages = Math.max(1, Math.ceil(totalPast / this.pastPageSize));
        if (this.pastCurrentPage > totalPages) this.pastCurrentPage = totalPages;
        if (this.pastCurrentPage < 1) this.pastCurrentPage = 1;

        const startIndex = (this.pastCurrentPage - 1) * this.pastPageSize;
        const pagedPastItems = this.pastHistoryList.slice(startIndex, startIndex + this.pastPageSize);

        if (pageInfoEl) {
            pageInfoEl.textContent = `หน้า ${this.pastCurrentPage} / ${totalPages} (ทั้งหมด ${totalPast} รายการ)`;
        }
        if (btnPrev) btnPrev.disabled = this.pastCurrentPage <= 1;
        if (btnNext) btnNext.disabled = this.pastCurrentPage >= totalPages;

        if (pastTbody) {
            if (pagedPastItems.length === 0) {
                pastTbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 bma-text-sub">ไม่พบประวัติการลงเวลาย้อนหลัง</td></tr>`;
            } else {
                pastTbody.innerHTML = pagedPastItems.map((item, idx) =>
                    this.#buildHistoryRowHtml(item, startIndex + idx + 1)
                ).join('');
            }
        }
    }

    #buildHistoryRowHtml(item, rowNumber) {
        return `
            <tr>
                <td class="text-center font-semibold">${rowNumber}</td>
                <td class="font-bold whitespace-nowrap">${UIHelpers.formatThaiShortDate(item.work_date)}</td>
                <td>
                    <div class="font-semibold bma-text-main">${item.shift_name || '-'}</div>
                    ${item.remark ? `<div class="text-xs bma-text-sub">${item.remark}</div>` : ''}
                </td>
                <td class="text-center font-mono font-bold">${item.check_in_time ? item.check_in_time + ' น.' : '-'}</td>
                <td class="text-center font-mono font-bold">${item.check_out_time ? item.check_out_time + ' น.' : '-'}</td>
                <td class="text-xs font-medium">${item.check_in_location || '-'}</td>
                <td class="text-center">
                    <span class="bma-badge text-white shadow-xs" style="background-color: ${item.row_color};">
                        ${item.status_label}
                    </span>
                </td>
            </tr>
        `;
    }

    #renderSpecialRequestsHistoryTable() {
        const tbody = document.getElementById('personalSpecialRequestsTableBody');
        const totalBadge = document.getElementById('specialRequestTotalBadge');
        if (totalBadge) totalBadge.textContent = `${this.specialRequestsList.length} รายการ`;
        if (!tbody) return;

        if (this.specialRequestsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 bma-text-sub">ยังไม่มีประวัติการขอลงเวลากรณีพิเศษ</td></tr>`;
            return;
        }

        tbody.innerHTML = this.specialRequestsList.map((req, idx) => {
            let statusBadgeHtml = '';
            let actionHtml = `<span class="text-xs bma-text-muted">ดำเนินการแล้ว</span>`;

            if (req.approval_status === 'pending') {
                statusBadgeHtml = `<span class="bma-badge bma-badge-warning"><i class="fa-regular fa-hourglass-half"></i> รออนุมัติ</span>`;
                actionHtml = `
                    <button type="button" data-action="delete-special-req" data-id="${req.id}" data-date="${UIHelpers.formatThaiShortDate(req.work_date)}" class="btn-bma-outline py-1 px-2.5 text-xs text-rose-600 border-rose-500/40 hover:bg-rose-500/10">
                        <i class="fa-solid fa-trash-can"></i> ลบคำขอ
                    </button>
                `;
            } else if (req.approval_status === 'approved') {
                statusBadgeHtml = `<span class="bma-badge bma-badge-success"><i class="fa-solid fa-circle-check"></i> อนุมัติแล้ว</span>`;
            } else {
                statusBadgeHtml = `<span class="bma-badge bma-badge-danger"><i class="fa-solid fa-circle-xmark"></i> ปฏิเสธคำขอ</span>`;
            }

            const timeRange = `${req.check_in_time || '-'} - ${req.check_out_time || '-'} น.`;

            return `
                <tr>
                    <td class="text-center font-semibold">${idx + 1}</td>
                    <td class="font-bold whitespace-nowrap">${UIHelpers.formatThaiShortDate(req.work_date)}</td>
                    <td class="font-semibold bma-text-main">${req.shift_name || '-'}</td>
                    <td class="text-center font-mono font-bold whitespace-nowrap">${timeRange}</td>
                    <td><span class="bma-badge bma-badge-indigo">${req.remark || '-'}</span></td>
                    <td class="text-center">${statusBadgeHtml}</td>
                    <td class="text-center whitespace-nowrap">${actionHtml}</td>
                </tr>
            `;
        }).join('');
    }

    async #checkCameraHardware() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return false;
            }
            if (navigator.mediaDevices.enumerateDevices) {
                const devices = await navigator.mediaDevices.enumerateDevices();
                return devices.some(d => d.kind === 'videoinput');
            }
            return true;
        } catch (e) {
            console.warn('Check camera hardware error:', e);
            return false;
        }
    }

    #handleFallbackFileSelected(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.getElementById('cameraCaptureCanvas');
                if (!canvas) return;
                const targetWidth = 720;
                const targetHeight = 960;
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');

                const imgAspect = img.width / img.height;
                const targetAspect = targetWidth / targetHeight; // 0.75 (3:4)

                let sX = 0, sY = 0, sWidth = img.width, sHeight = img.height;
                if (imgAspect > targetAspect) {
                    sWidth = img.height * targetAspect;
                    sX = (img.width - sWidth) / 2;
                } else {
                    sHeight = img.width / targetAspect;
                    sY = (img.height - sHeight) / 2;
                }

                ctx.drawImage(img, sX, sY, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
                this.capturedPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.85);

                const preview = document.getElementById('capturedPhotoPreview');
                if (preview) {
                    preview.src = this.capturedPhotoDataUrl;
                    preview.classList.remove('hidden');
                }

                const video = document.getElementById('cameraVideoStream');
                const standbyOverlay = document.getElementById('cameraStandbyOverlay');
                const btnInFrame = document.getElementById('btnInFrameShutter');
                const btnStartBottom = document.getElementById('btnStartCameraBottom');
                const btnCapture = document.getElementById('btnCapturePhoto');
                const btnStop = document.getElementById('btnStopCamera');
                const btnRetake = document.getElementById('btnRetakePhoto');

                video?.classList.add('hidden');
                standbyOverlay?.classList.add('hidden');
                btnInFrame?.classList.add('hidden');
                btnStartBottom?.classList.add('hidden');
                btnCapture?.classList.add('hidden');
                btnStop?.classList.add('hidden');
                btnRetake?.classList.remove('hidden');

                const fileInput = document.getElementById('cameraFallbackFileInput');
                if (fileInput) fileInput.value = '';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    #stopCameraHardwareStream() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        const video = document.getElementById('cameraVideoStream');
        if (video) {
            video.srcObject = null;
        }
        document.getElementById('btnInFrameShutter')?.classList.add('hidden');
        this.isCameraRunning = false;
    }

    #stopCameraAndShowStandby() {
        this.#stopCameraHardwareStream();
        this.capturedPhotoDataUrl = '';

        const video = document.getElementById('cameraVideoStream');
        const preview = document.getElementById('capturedPhotoPreview');
        const standbyOverlay = document.getElementById('cameraStandbyOverlay');
        const btnInFrame = document.getElementById('btnInFrameShutter');

        const btnStartBottom = document.getElementById('btnStartCameraBottom');
        const btnCapture = document.getElementById('btnCapturePhoto');
        const btnStop = document.getElementById('btnStopCamera');
        const btnRetake = document.getElementById('btnRetakePhoto');

        if (preview) {
            preview.src = '';
            preview.classList.add('hidden');
        }
        video?.classList.add('hidden');
        standbyOverlay?.classList.remove('hidden');
        btnInFrame?.classList.add('hidden');

        btnStartBottom?.classList.remove('hidden');
        btnCapture?.classList.add('hidden');
        btnStop?.classList.add('hidden');
        btnRetake?.classList.add('hidden');
    }

    async #openCameraOnDemand() {
        const video = document.getElementById('cameraVideoStream');
        const preview = document.getElementById('capturedPhotoPreview');
        const standbyOverlay = document.getElementById('cameraStandbyOverlay');
        const msgEl = document.getElementById('cameraStatusMessage');
        const btnInFrame = document.getElementById('btnInFrameShutter');

        const btnStartBottom = document.getElementById('btnStartCameraBottom');
        const btnCapture = document.getElementById('btnCapturePhoto');
        const btnStop = document.getElementById('btnStopCamera');
        const btnRetake = document.getElementById('btnRetakePhoto');

        const allowFallback = Boolean(this.settings?.allow_gallery_fallback !== false);
        const isLineBrowser = /Line\//i.test(navigator.userAgent);
        const hasCamera = await this.#checkCameraHardware();

        if (allowFallback && (isLineBrowser || !hasCamera)) {
            const fallbackInput = document.getElementById('cameraFallbackFileInput');
            if (fallbackInput) {
                fallbackInput.click();
                return;
            }
        }

        try {
            this.#stopCameraHardwareStream();
            this.capturedPhotoDataUrl = '';
            if (preview) {
                preview.src = '';
                preview.classList.add('hidden');
            }

            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
                audio: false
            });

            this.isCameraRunning = true;
            if (video) {
                video.srcObject = this.mediaStream;
                video.classList.remove('hidden');
            }
            standbyOverlay?.classList.add('hidden');
            btnInFrame?.classList.remove('hidden');

            btnStartBottom?.classList.add('hidden');
            btnRetake?.classList.add('hidden');
            btnCapture?.classList.remove('hidden');
            btnStop?.classList.remove('hidden');
        } catch (err) {
            console.warn('Camera access error:', err);
            this.#stopCameraHardwareStream();
            if (allowFallback) {
                const fallbackInput = document.getElementById('cameraFallbackFileInput');
                if (fallbackInput) {
                    fallbackInput.click();
                    return;
                }
            }
            standbyOverlay?.classList.remove('hidden');
            if (msgEl) {
                msgEl.textContent = 'ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้กล้องบนเบราว์เซอร์';
            }
            await UIHelpers.alert(
                'ไม่สามารถเข้าถึงกล้องถ่ายรูปได้',
                'กรุณาอนุญาตการเข้าถึงกล้องบนเบราว์เซอร์เพื่อถ่ายภาพยืนยันตัวตน',
                'warning'
            );
        }
    }

    #capturePhotoAndStopStream() {
        const video = document.getElementById('cameraVideoStream');
        const canvas = document.getElementById('cameraCaptureCanvas');
        const preview = document.getElementById('capturedPhotoPreview');
        const standbyOverlay = document.getElementById('cameraStandbyOverlay');
        const btnInFrame = document.getElementById('btnInFrameShutter');

        const btnStartBottom = document.getElementById('btnStartCameraBottom');
        const btnCapture = document.getElementById('btnCapturePhoto');
        const btnStop = document.getElementById('btnStopCamera');
        const btnRetake = document.getElementById('btnRetakePhoto');

        if (!video || !video.srcObject) {
            UIHelpers.alert('กล้องยังไม่พร้อมใช้งาน', 'กรุณากดปุ่มเปิดกล้องก่อนถ่ายภาพ', 'warning');
            return;
        }

        this.capturedPhotoDataUrl = UIHelpers.capturePortrait3x4FromVideo(video, canvas);
        this.#stopCameraHardwareStream();
        btnInFrame?.classList.add('hidden');

        if (preview) {
            preview.src = this.capturedPhotoDataUrl;
            preview.classList.remove('hidden');
        }
        video.classList.add('hidden');
        standbyOverlay?.classList.add('hidden');

        btnStartBottom?.classList.add('hidden');
        btnCapture?.classList.add('hidden');
        btnStop?.classList.add('hidden');
        btnRetake?.classList.remove('hidden');
    }

    async #resetPageAfterSave() {
        if (this.settings?.require_photo) {
            this.#stopCameraAndShowStandby();
        } else {
            this.#stopCameraHardwareStream();
        }
        await this.#refreshAllAttendanceData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * จับพิกัด GPS และค้นหาสถานที่ใกล้เคียงตามลำดับ:
     * 1. ซูมแผนที่เริ่มต้นที่ระยะ z = 19 (ประมาณ 20 เมตร) ก่อน -> แสดง ["ใกล้เคียง " + ชื่อสถานที่]
     * 2. หากไม่พบใน z = 19 ระบบจะสลับไปใช้ z = 20 (ประมาณ 10 เมตร) -> แสดง ["บริเวณ " + ชื่อสถานที่] และปรับซูมแผนที่เป็น z = 20
     * 3. หากยังไม่พบ จะดึง ซอย / ซอยย่อย -> แสดง ["ใกล้เคียง " + ชื่อซอย]
     */
    async #initGpsLocation() {
        if (!this.settings?.require_gps) return;

        const coordsEl = document.getElementById('gpsCoordsText');
        const locNameEl = document.getElementById('gpsLocationNameText');
        const mapLink = document.getElementById('linkViewGoogleMap');
        const mapIframe = document.getElementById('googleMapRealtimeIframe');
        const mapPlaceholder = document.getElementById('googleMapPlaceholder');

        if (!navigator.geolocation) {
            coordsEl.textContent = 'อุปกรณ์ไม่รองรับ GPS';
            locNameEl.textContent = 'ไม่สามารถระบุสถานที่ได้';
            return;
        }

        coordsEl.textContent = 'กำลังดึงพิกัด GPS...';
        locNameEl.textContent = 'กำลังค้นหาสถานที่ใกล้เคียง (z=19 / 20 เมตร)...';

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                this.gpsData.lat = lat;
                this.gpsData.lng = lng;
                this.gpsData.ready = true;
                this.gpsData.zoomLevel = 19;
                this.gpsData.locationName = `ใกล้เคียง ซอยในพื้นที่ (${lat.toFixed(5)}, ${lng.toFixed(5)})`;

                coordsEl.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

                // เริ่มต้นแสดงแผนที่ที่ระยะซูม z = 19 (ประมาณ 20 เมตร) ก่อน
                if (mapIframe) {
                    mapIframe.src = `https://maps.google.com/maps?q=${lat},${lng}&hl=th&z=19&output=embed`;
                    mapIframe.classList.remove('hidden');
                    mapPlaceholder?.classList.add('hidden');
                }

                if (mapLink) {
                    mapLink.href = `https://www.google.com/maps?q=${lat},${lng}&z=19`;
                    mapLink.classList.remove('hidden');
                }

                // ค้นหาสถานที่ใกล้เคียงตามลำดับ z=19 -> z=20 -> ซอย/ซอยย่อย
                this.locationResolvePromise = AttendanceModel.resolveLocationWithZoomMeta(lat, lng).then(resMeta => {
                    this.gpsData.locationName = resMeta.locationName;
                    this.gpsData.zoomLevel = resMeta.zoomLevel || 19;

                    if (locNameEl) {
                        locNameEl.textContent = resMeta.locationName;
                    }
                    const spCurrentLoc = document.getElementById('spCurrentLocNameText');
                    if (spCurrentLoc && this.specialModalGps?.mode === 'current') {
                        spCurrentLoc.textContent = resMeta.locationName;
                    }

                    // หากระบบเปลี่ยนไปใช้ระยะ z = 20 (ประมาณ 10 เมตร) ให้ปรับซูมแผนที่ Google Map เป็น z = 20 ตามทันที
                    if (resMeta.zoomLevel === 20) {
                        if (mapIframe) {
                            mapIframe.src = `https://maps.google.com/maps?q=${lat},${lng}&hl=th&z=20&output=embed`;
                        }
                        if (mapLink) {
                            mapLink.href = `https://www.google.com/maps?q=${lat},${lng}&z=20`;
                        }
                    }

                    return resMeta.locationName;
                });
            },
            async (err) => {
                console.warn('Geolocation error:', err);
                this.gpsData.ready = false;
                coordsEl.textContent = 'ไม่ได้เปิดการใช้งาน GPS';
                locNameEl.textContent = 'กรุณาเปิดบริการตำแหน่งที่ตั้ง (Location Services)';

                if (this.settings.require_gps) {
                    await UIHelpers.alert(
                        'กรุณาเปิดการใช้งานตำแหน่งที่ตั้ง (GPS)',
                        'ระบบบังคับให้ต้องเปิด GPS เพื่อระบุพิกัดและชื่อสถานที่ก่อนบันทึกลงเวลาปฏิบัติราชการ',
                        'warning'
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 6000,
                maximumAge: 30000
            }
        );
    }

    #bindEvents() {
        window.addEventListener('storage', (e) => {
            if (e.key === Config.STORAGE_KEYS.SESSION_USER && !e.newValue) {
                window.location.replace(UIHelpers.getRootBasePath());
            }
        });

        document.getElementById('btnCheckinTheme')?.addEventListener('click', () => {
            UIHelpers.toggleTheme();
            this.#updateThemeButtonUI();
        });

        document.getElementById('btnCheckinLogout')?.addEventListener('click', async () => {
            const confirmed = await UIHelpers.confirm(
                'ยืนยันการออกจากระบบ',
                'คุณต้องการออกจากระบบลงเวลาปฏิบัติราชการใช่หรือไม่?',
                'ออกจากระบบ',
                'question',
                {
                    infoNote: 'เมื่อออกจากระบบแล้ว ท่านจะต้องเข้าสู่ระบบใหม่อีกครั้งเพื่อลงเวลา',
                    confirmGradient: 'from-rose-600 to-red-500',
                    confirmIcon: '<i class="fa-solid fa-arrow-right-from-bracket mr-1.5"></i>'
                }
            );
            if (confirmed) {
                this.#stopCameraHardwareStream();
                AuthService.clearSession();
                window.location.replace(UIHelpers.getRootBasePath());
            }
        });

        document.getElementById('btnDrawerThemeToggle')?.addEventListener('click', () => {
            UIHelpers.toggleTheme();
            this.#updateThemeButtonUI();
        });

        document.getElementById('btnDrawerLogout')?.addEventListener('click', async () => {
            const confirmed = await UIHelpers.confirm(
                'ยืนยันการออกจากระบบ',
                'คุณต้องการออกจากระบบลงเวลาปฏิบัติราชการใช่หรือไม่?',
                'ออกจากระบบ',
                'question',
                {
                    infoNote: 'เมื่อออกจากระบบแล้ว ท่านจะต้องเข้าสู่ระบบใหม่อีกครั้งเพื่อลงเวลา',
                    confirmGradient: 'from-rose-600 to-red-500',
                    confirmIcon: '<i class="fa-solid fa-arrow-right-from-bracket mr-1.5"></i>'
                }
            );
            if (confirmed) {
                this.#stopCameraHardwareStream();
                AuthService.clearSession();
                window.location.replace(UIHelpers.getRootBasePath());
            }
        });

        document.getElementById('btnStartCameraOverlay')?.addEventListener('click', () => this.#openCameraOnDemand());
        document.getElementById('btnStartCameraBottom')?.addEventListener('click', () => this.#openCameraOnDemand());
        document.getElementById('btnCapturePhoto')?.addEventListener('click', () => this.#capturePhotoAndStopStream());
        document.getElementById('btnInFrameShutter')?.addEventListener('click', () => this.#capturePhotoAndStopStream());
        document.getElementById('btnStopCamera')?.addEventListener('click', () => this.#stopCameraAndShowStandby());
        document.getElementById('btnRetakePhoto')?.addEventListener('click', () => this.#openCameraOnDemand());
        document.getElementById('cameraFallbackFileInput')?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (file) this.#handleFallbackFileSelected(file);
        });

        document.getElementById('btnRefreshGps')?.addEventListener('click', () => this.#initGpsLocation());

        document.getElementById('checkinShiftSelect')?.addEventListener('change', () => {
            this.#updateStatusCardsAndMainButton();
        });

        document.getElementById('btnSubmitCheckinMain')?.addEventListener('click', () => this.#handleMainCheckin());

        const btnTabToday = document.getElementById('btnTabTodayHistory');
        const btnTabPast = document.getElementById('btnTabPastHistory');
        const todayPanel = document.getElementById('todayHistoryTabPanel');
        const pastPanel = document.getElementById('pastHistoryTabPanel');

        btnTabToday?.addEventListener('click', () => {
            this.activeHistoryTab = 'today';
            btnTabToday.className = 'py-1.5 px-3.5 rounded-lg text-xs font-bold transition bg-[#007B3E] text-white shadow-xs cursor-pointer';
            btnTabPast.className = 'py-1.5 px-3.5 rounded-lg text-xs font-bold transition bma-text-sub hover:bg-black/5 cursor-pointer';
            todayPanel?.classList.remove('hidden');
            pastPanel?.classList.add('hidden');
        });

        btnTabPast?.addEventListener('click', () => {
            this.activeHistoryTab = 'past';
            btnTabPast.className = 'py-1.5 px-3.5 rounded-lg text-xs font-bold transition bg-[#007B3E] text-white shadow-xs cursor-pointer';
            btnTabToday.className = 'py-1.5 px-3.5 rounded-lg text-xs font-bold transition bma-text-sub hover:bg-black/5 cursor-pointer';
            todayPanel?.classList.add('hidden');
            pastPanel?.classList.remove('hidden');
            this.#renderPersonalAttendanceTabs();
        });

        document.getElementById('selectPastPageSize')?.addEventListener('change', (e) => {
            this.pastPageSize = parseInt(e.target.value, 10) || 10;
            this.pastCurrentPage = 1;
            this.#renderPersonalAttendanceTabs();
        });

        document.getElementById('btnPastPrevPage')?.addEventListener('click', () => {
            if (this.pastCurrentPage > 1) {
                this.pastCurrentPage--;
                this.#renderPersonalAttendanceTabs();
            }
        });

        document.getElementById('btnPastNextPage')?.addEventListener('click', () => {
            const totalPages = Math.max(1, Math.ceil(this.pastHistoryList.length / this.pastPageSize));
            if (this.pastCurrentPage < totalPages) {
                this.pastCurrentPage++;
                this.#renderPersonalAttendanceTabs();
            }
        });

        document.getElementById('personalSpecialRequestsTableBody')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action="delete-special-req"]');
            if (!btn) return;
            const logId = btn.dataset.id;
            const dateLabel = btn.dataset.date || '';

            const confirmed = await UIHelpers.confirm(
                'ยืนยันการลบคำขอลงเวลากรณีพิเศษ',
                `คุณต้องการยกเลิกและลบคำขอลงเวลากรณีพิเศษของวันที่ ${dateLabel} ทิ้งใช่หรือไม่?`,
                'ลบคำขอ',
                'warning'
            );

            if (confirmed) {
                UIHelpers.showLoading('กำลังลบคำขอลงเวลากรณีพิเศษ...');
                const res = await AttendanceModel.deletePendingSpecialRequestByUser(
                    logId,
                    this.currentUser.personnel_id,
                    this.currentUser.id
                );
                UIHelpers.hideLoading();

                if (res.success) {
                    await this.#refreshAllAttendanceData();
                    await UIHelpers.showToast(res.message, 'success', 2500);
                } else {
                    await UIHelpers.alert('ไม่สามารถลบคำขอได้', res.message, 'error');
                }
            }
        });

        const modalSpecial = document.getElementById('modalSpecialRequest');
        const closeSpecialModal = () => modalSpecial?.classList.add('hidden');

        const openSpecialModal = () => {
            this.#openSpecialRequestModal();
            modalSpecial?.classList.remove('hidden');
        };

        document.getElementById('btnOpenSpecialRequestModal')?.addEventListener('click', openSpecialModal);
        document.getElementById('btnCloseSpecialModal')?.addEventListener('click', closeSpecialModal);
        document.getElementById('btnCancelSpecialModal')?.addEventListener('click', closeSpecialModal);

        this.#initSpecialModalGps();

        document.getElementById('spShiftSelect')?.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value, 10);
            const selectedShift = (this.settings.work_shifts || [])[idx];
            const customBox = document.getElementById('spCustomTimeContainer');
            if (selectedShift && (selectedShift.is_custom || selectedShift.name.includes('อื่นๆ'))) {
                customBox.classList.remove('hidden');
            } else {
                customBox.classList.add('hidden');
            }
        });

        document.getElementById('formSpecialRequest')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.#handleSubmitSpecialRequest(closeSpecialModal);
        });

        // Desktop Top Navigation Tabs
        const tabCheckin = document.getElementById('tabDesktopCheckin');
        const tabHistory = document.getElementById('tabDesktopHistory');
        const tabSpecial = document.getElementById('tabDesktopSpecial');
        const paneCheckin = document.getElementById('checkinWorkspaceWrapper');
        const paneHistory = document.getElementById('desktopHistoryWrapper');
        const paneSpecial = document.getElementById('desktopSpecialWrapper');
        const drawer = document.getElementById('mobileHistoryDrawer');
        const drawerMount = document.getElementById('mobileDrawerHistoryMount');
        const desktopPanes = document.getElementById('desktopPanesContainer');

        const setDesktopActiveTab = (activeName) => {
            const activeClass = 'px-4 py-2 rounded-xl text-xs font-extrabold bg-[#00744B] text-white flex items-center gap-2 shadow-xs transition cursor-pointer';
            const inactiveClass = 'px-4 py-2 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2 transition cursor-pointer';

            if (desktopPanes && paneHistory && paneSpecial && drawerMount && drawerMount.contains(paneHistory)) {
                desktopPanes.appendChild(paneHistory);
                desktopPanes.appendChild(paneSpecial);
            }

            if (tabCheckin) tabCheckin.className = activeName === 'checkin' ? activeClass : inactiveClass;
            if (tabHistory) tabHistory.className = activeName === 'history' ? activeClass : inactiveClass;
            if (tabSpecial) tabSpecial.className = activeName === 'special' ? activeClass : inactiveClass;

            paneCheckin?.classList.toggle('hidden', activeName !== 'checkin');
            paneHistory?.classList.toggle('hidden', activeName !== 'history');
            paneSpecial?.classList.toggle('hidden', activeName !== 'special');

            if (activeName === 'history') this.#renderPersonalAttendanceTabs();
            if (activeName === 'special') this.#renderSpecialRequestsHistoryTable();
        };

        tabCheckin?.addEventListener('click', () => setDesktopActiveTab('checkin'));
        tabHistory?.addEventListener('click', () => setDesktopActiveTab('history'));
        tabSpecial?.addEventListener('click', () => setDesktopActiveTab('special'));

        // Mobile Hamburger Off-canvas Slide Drawer
        const drawerPanel = document.getElementById('mobileDrawerPanel');
        const drawerBackdrop = document.getElementById('btnMobileHistoryDrawerBackdrop');
        let isDrawerClosing = false;

        const openMobileDrawer = () => {
            if (isDrawerClosing) return;
            if (drawerMount && paneHistory && paneSpecial) {
                drawerMount.appendChild(paneHistory);
                drawerMount.appendChild(paneSpecial);
                paneHistory.classList.remove('hidden');
                paneSpecial.classList.remove('hidden');
            }
            drawer?.classList.remove('hidden');
            requestAnimationFrame(() => {
                drawerBackdrop?.classList.remove('opacity-0');
                drawerBackdrop?.classList.add('opacity-100');
                drawerPanel?.classList.remove('translate-x-full');
                drawerPanel?.classList.add('translate-x-0');
            });
            this.#renderPersonalAttendanceTabs();
            this.#renderSpecialRequestsHistoryTable();
        };

        const closeMobileDrawer = (targetTab = null) => {
            if (isDrawerClosing) return;
            isDrawerClosing = true;

            drawerBackdrop?.classList.remove('opacity-100');
            drawerBackdrop?.classList.add('opacity-0');
            drawerPanel?.classList.remove('translate-x-0');
            drawerPanel?.classList.add('translate-x-full');

            setTimeout(() => {
                drawer?.classList.add('hidden');
                if (desktopPanes && paneHistory && paneSpecial && drawerMount && drawerMount.contains(paneHistory)) {
                    desktopPanes.appendChild(paneHistory);
                    desktopPanes.appendChild(paneSpecial);
                }
                if (targetTab) {
                    setDesktopActiveTab(targetTab);
                } else {
                    const isHistoryActive = tabHistory?.classList.contains('bg-[#00744B]');
                    const isSpecialActive = tabSpecial?.classList.contains('bg-[#00744B]');
                    paneHistory?.classList.toggle('hidden', !isHistoryActive);
                    paneSpecial?.classList.toggle('hidden', !isSpecialActive);
                }
                isDrawerClosing = false;
            }, 300);
        };

        document.getElementById('btnMobileHistoryMenu')?.addEventListener('click', openMobileDrawer);
        document.getElementById('btnCloseMobileDrawer')?.addEventListener('click', () => closeMobileDrawer());
        document.getElementById('btnMobileHistoryDrawerBackdrop')?.addEventListener('click', () => closeMobileDrawer());

        document.getElementById('btnDrawerNavCheckin')?.addEventListener('click', () => closeMobileDrawer('checkin'));
        document.getElementById('btnDrawerNavHistory')?.addEventListener('click', () => {
            if (paneHistory) {
                paneHistory.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        document.getElementById('btnDrawerNavSpecial')?.addEventListener('click', () => {
            if (paneSpecial) {
                paneSpecial.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        document.getElementById('btnOpenSpecialRequestDrawer')?.addEventListener('click', openSpecialModal);
    }

    async #handleMainCheckin() {
        if (this.settings?.disable_normal_hours_checkin) {
            const stdInRef = UIHelpers.formatTime24(this.settings?.standard_check_in || '08:30');
            const stdOutRef = UIHelpers.formatTime24(this.settings?.standard_check_out || '16:30');
            const stdInMin = UIHelpers.timeToMinutes(stdInRef);
            const stdOutMin = UIHelpers.timeToMinutes(stdOutRef);
            const nowMin = UIHelpers.timeToMinutes(UIHelpers.getCurrentTimeHHMM());
            const isWithinNormalHours = (stdInMin <= stdOutMin)
                ? (nowMin >= stdInMin && nowMin < stdOutMin)
                : (nowMin >= stdInMin || nowMin < stdOutMin);

            const shiftSelectEl = document.getElementById('checkinShiftSelect');
            const shiftContainer = document.getElementById('shiftSelectorContainer');
            const isShiftSelectorActive = shiftContainer && !shiftContainer.classList.contains('hidden');
            const shiftIdx = (shiftSelectEl && shiftSelectEl.value !== '') ? parseInt(shiftSelectEl.value, 10) : null;
            const shiftObj = (shiftIdx !== null && !isNaN(shiftIdx))
                ? ((this.settings?.work_shifts || [])[shiftIdx] || {})
                : {};
            const hasUnclosedRegular = Boolean(
                this.activeRegularRecord &&
                this.activeRegularRecord.check_in_time &&
                !this.activeRegularRecord.check_out_time
            );
            const isOvertimeCheckin = !hasUnclosedRegular && Boolean(shiftObj.is_overtime || shiftObj.is_custom);

            if (isWithinNormalHours && !isOvertimeCheckin) {
                if (isShiftSelectorActive && shiftIdx === null) {
                    await UIHelpers.alert(
                        'กรุณาเลือกช่วงเวลาปฏิบัติงานนอกเวลา',
                        `ขณะนี้ระบบปิดรับการลงเวลาในเวลาปกติ (${stdInRef} - ${stdOutRef} น.) กรุณาคลิกเลือก "ช่วงเวลาปฏิบัติงานนอกเวลา" จากรายการก่อนทำการบันทึก`,
                        'warning'
                    );
                    if (shiftSelectEl) {
                        shiftSelectEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        shiftSelectEl.focus();
                        shiftSelectEl.classList.add('ring-2', 'ring-rose-500', 'border-rose-500');
                        setTimeout(() => shiftSelectEl.classList.remove('ring-2', 'ring-rose-500', 'border-rose-500'), 3000);
                    }
                    return;
                }
                await UIHelpers.alert('ไม่สามารถลงเวลาได้', `ระบบปิดรับการลงเวลาในช่วงเวลาราชการปกติ (${stdInRef} - ${stdOutRef} น.)`, 'warning');
                return;
            }
        }
        AuthService.getCurrentUser(true);

        if (this.settings.require_photo && !this.capturedPhotoDataUrl) {
            await UIHelpers.alert(
                'กรุณาเปิดกล้องและถ่ายภาพก่อนลงเวลา',
                'ระบบเปิดใช้งานการบังคับถ่ายภาพ กรุณากดปุ่ม "เปิดกล้องเพื่อถ่ายรูป" แล้วกด "ถ่ายภาพ" ก่อนบันทึกลงเวลา',
                'warning'
            );
            return;
        }

        if (this.settings.require_gps && !this.gpsData.ready) {
            await UIHelpers.alert(
                'กรุณาเปิด GPS ก่อนลงเวลา',
                'ระบบเปิดใช้งานการบังคับระบุตำแหน่งสถานที่จาก GPS กรุณาเปิด GPS บนอุปกรณ์ก่อนบันทึกลงเวลา',
                'warning'
            );
            return;
        }

        const btnSubmitMain = document.getElementById('btnSubmitCheckinMain');
        const originalBtnHtml = btnSubmitMain ? btnSubmitMain.innerHTML : '';
        if (btnSubmitMain) btnSubmitMain.disabled = true;

        const shiftSelectEl = document.getElementById('checkinShiftSelect');
        const shiftContainer = document.getElementById('shiftSelectorContainer');
        const isShiftSelectorActive = shiftContainer && !shiftContainer.classList.contains('hidden');

        if (isShiftSelectorActive && (!shiftSelectEl || shiftSelectEl.value === '')) {
            if (btnSubmitMain) {
                btnSubmitMain.disabled = false;
                btnSubmitMain.innerHTML = originalBtnHtml;
            }

            if (window.Swal) {
                await window.Swal.fire({
                    title: 'กรุณาเลือกช่วงเวลาปฏิบัติงาน',
                    html: `
                        <div class="space-y-2 text-center py-1">
                            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                ระบบตรวจพบว่าท่านยังไม่ได้ระบุช่วงเวลาทำงาน
                            </p>
                            <div class="p-2.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-semibold">
                                กรุณาคลิกเลือกช่วงเวลาจากรายการก่อนทำการบันทึกลงเวลา
                            </div>
                        </div>
                    `,
                    icon: 'warning',
                    confirmButtonText: '<i class="fa-solid fa-arrow-down mr-1.5"></i> ไปเลือกช่วงเวลา',
                    buttonsStyling: false,
                    customClass: {
                        popup: 'rounded-2xl p-5 shadow-2xl border border-amber-500/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md max-w-sm',
                        title: 'text-base sm:text-lg font-bold text-slate-800 dark:text-white pt-2',
                        confirmButton: 'inline-block px-5 py-2.5 mb-0 font-bold text-center uppercase align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer shadow-soft-md bg-x-25 bg-150 leading-pro text-xs ease-soft-in tracking-tight-soft bg-gradient-to-tl from-amber-500 to-amber-600 hover:scale-102 hover:shadow-soft-xs active:opacity-85 text-white'
                    }
                });
            } else {
                await UIHelpers.alert('กรุณาเลือกช่วงเวลาปฏิบัติงาน', 'ระบบตรวจพบว่าท่านยังไม่ได้ระบุช่วงเวลาทำงาน กรุณาคลิกเลือกช่วงเวลาจากรายการก่อนทำการบันทึกลงเวลา', 'warning');
            }

            if (shiftSelectEl) {
                shiftSelectEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                shiftSelectEl.focus();
                shiftSelectEl.classList.add('ring-2', 'ring-rose-500', 'border-rose-500');
                setTimeout(() => {
                    shiftSelectEl.classList.remove('ring-2', 'ring-rose-500', 'border-rose-500');
                }, 3000);
            }
            return;
        }

        const isNormalModeSetting = !Boolean(this.settings?.single_click_checkin);
        const shiftIdx = (shiftSelectEl && shiftSelectEl.value !== '') ? parseInt(shiftSelectEl.value, 10) : 0;
        const shiftObj = (this.settings.work_shifts || [])[shiftIdx] || {
            name: 'เวลาราชการปกติ',
            check_in: this.settings.standard_check_in || '08:30',
            check_out: this.settings.standard_check_out || '16:30',
            is_custom: false,
            is_overtime: false,
            is_overnight: false
        };

        const formattedShiftName = SettingsModel.formatShiftDisplayText(shiftObj);
        const isCustomShift = Boolean(shiftObj.is_custom || String(shiftObj.name || '').includes('อื่นๆ'));
        const customCheckIn = isCustomShift ? UIHelpers.formatTime24(document.getElementById('mainCustomCheckin')?.value) : '';
        const customCheckOut = isCustomShift ? UIHelpers.formatTime24(document.getElementById('mainCustomCheckout')?.value) : '';

        const nowMin = UIHelpers.timeToMinutes(UIHelpers.getCurrentTimeHHMM());
        const allowStartMin = UIHelpers.timeToMinutes(this.settings?.allow_checkin_start_time || '06:00');
        const stdOutMin = UIHelpers.timeToMinutes(this.settings?.standard_check_out || '16:30');
        const todayIso = UIHelpers.getTodayISO();

        const hasUnclosedRegular = Boolean(
            this.activeRegularRecord &&
            this.activeRegularRecord.check_in_time &&
            !this.activeRegularRecord.check_out_time
        );

        const isRegularCompletedToday = Boolean(
            this.activeRegularRecord &&
            this.activeRegularRecord.check_in_time &&
            this.activeRegularRecord.check_out_time &&
            this.activeRegularRecord.work_date === todayIso
        );

        const isRealtimeFilterEnabled = this.settings?.filter_shifts_by_realtime !== false;
        const isOvertimeByTimeWindow = !hasUnclosedRegular && (isRegularCompletedToday || (isRealtimeFilterEnabled && (nowMin < allowStartMin || nowMin > stdOutMin)));
        const effectiveOvertimeShift = !hasUnclosedRegular && Boolean(
            shiftObj.is_overtime ||
            isOvertimeByTimeWindow
        );

        const stdInRef = UIHelpers.formatTime24(this.settings.standard_check_in || '08:30');
        const stdOutRef = UIHelpers.formatTime24(this.settings.standard_check_out || '16:30');

        let actionTitle = 'บันทึกลงเวลา';
        if (hasUnclosedRegular) {
            actionTitle = 'บันทึกลงเวลาเลิกงาน';
        } else if (effectiveOvertimeShift) {
            actionTitle = 'บันทึกลงเวลาปฏิบัติงานนอกเวลา';
        } else if (this.settings.single_click_checkin) {
            actionTitle = 'บันทึกลงเวลาปฏิบัติงาน (บันทึกครั้งเดียว)';
        } else {
            actionTitle = 'บันทึกลงเวลาเข้าปฏิบัติงาน';
        }

        let selectedShiftLabel = formattedShiftName;
        if (!isShiftSelectorActive || (isNormalModeSetting && !effectiveOvertimeShift)) {
            if (hasUnclosedRegular && this.activeRegularRecord?.shift_name) {
                selectedShiftLabel = this.activeRegularRecord.shift_name;
            } else {
                selectedShiftLabel = `เวลาราชการปกติ (${stdInRef} - ${stdOutRef} น.)`;
            }
        } else if (shiftSelectEl && shiftSelectEl.selectedIndex >= 0 && shiftSelectEl.options[shiftSelectEl.selectedIndex]?.text) {
            selectedShiftLabel = shiftSelectEl.options[shiftSelectEl.selectedIndex].text;
        }

        const isGpsActive = Boolean(this.settings?.require_gps);
        const isSpecialShiftMode = Boolean(
            effectiveOvertimeShift ||
            isCustomShift ||
            shiftObj.is_overtime ||
            Boolean(this.settings?.single_click_checkin) ||
            (isShiftSelectorActive && shiftObj.name !== 'เวลาราชการปกติ')
        );

        if (isGpsActive && this.locationResolvePromise) {
            await Promise.race([
                this.locationResolvePromise,
                new Promise(r => setTimeout(r, 600))
            ]);
        }

        const locName = (this.gpsData?.locationName || document.getElementById('gpsLocationName')?.textContent || 'ไม่ได้ระบุตำแหน่ง').trim();
        const coordsStr = (this.gpsData?.lat && this.gpsData?.lng)
            ? `${Number(this.gpsData.lat).toFixed(6)}, ${Number(this.gpsData.lng).toFixed(6)}`
            : (document.getElementById('gpsCoordsText')?.textContent || '-').trim();

        const now = new Date();
        const currentTimeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} น.`;

        let modalDetailsHtml = '';
        if (isSpecialShiftMode) {
            const shiftCheckInTime = isCustomShift ? customCheckIn : (shiftObj.check_in || stdInRef);
            const shiftCheckOutTime = isCustomShift ? customCheckOut : (shiftObj.check_out || stdOutRef);
            modalDetailsHtml = `
                <div class="flex justify-between items-center gap-2">
                    <span class="text-slate-500 dark:text-slate-400 shrink-0">ชื่อช่วงเวลา:</span>
                    <span class="font-bold text-[#00744B] dark:text-emerald-400 text-right">${shiftObj.name || selectedShiftLabel}</span>
                </div>
                <div class="flex justify-between items-center gap-2">
                    <span class="text-slate-500 dark:text-slate-400 shrink-0">เวลาเข้างาน:</span>
                    <span class="font-mono font-bold text-slate-700 dark:text-slate-300">${shiftCheckInTime} น.</span>
                </div>
                <div class="flex justify-between items-center gap-2">
                    <span class="text-slate-500 dark:text-slate-400 shrink-0">เวลาออกงาน:</span>
                    <span class="font-mono font-bold text-slate-700 dark:text-slate-300">${shiftCheckOutTime} น.</span>
                </div>
            `;
        } else {
            modalDetailsHtml = `
                <div class="flex justify-between items-center gap-2">
                    <span class="text-slate-500 dark:text-slate-400 shrink-0">ช่วงเวลาบันทึก:</span>
                    <span class="font-bold text-[#00744B] dark:text-emerald-400">${hasUnclosedRegular ? 'เวลาออกงาน' : 'เวลาเข้างาน'}</span>
                </div>
                <div class="flex justify-between items-center gap-2">
                    <span class="text-slate-500 dark:text-slate-400 shrink-0">เวลาขณะบันทึก:</span>
                    <span class="font-mono font-bold text-slate-700 dark:text-slate-300">${currentTimeFormatted}</span>
                </div>
            `;
        }

        if (isGpsActive) {
            modalDetailsHtml += `
                <div class="flex flex-col sm:flex-row sm:justify-between items-start gap-1 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span class="text-slate-500 dark:text-slate-400 shrink-0">สถานที่ ตาม GPS:</span>
                    <div class="sm:text-right text-left text-slate-800 dark:text-white font-medium text-xs leading-relaxed">
                        <div>${locName}</div>
                        <div class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">(พิกัด: ${coordsStr})</div>
                    </div>
                </div>
            `;
        }

        if (window.Swal) {
            const confirmResult = await window.Swal.fire({
                title: 'ยืนยันการบันทึกลงเวลา',
                html: `
                    <div class="space-y-3 text-left py-1 text-xs sm:text-sm">
                        <p class="text-slate-600 dark:text-slate-300 text-center">
                            กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนกดยืนยัน
                        </p>
                        <div class="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                            ${modalDetailsHtml}
                        </div>
                    </div>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '<i class="fa-solid fa-check mr-1.5"></i> ยืนยันบันทึกเวลา',
                cancelButtonText: 'ยกเลิก',
                reverseButtons: true,
                buttonsStyling: false,
                customClass: {
                    popup: 'rounded-2xl p-5 shadow-2xl border border-emerald-500/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md max-w-sm sm:max-w-md',
                    title: 'text-base sm:text-lg font-bold text-slate-800 dark:text-white pt-2',
                    actions: 'flex justify-center gap-3 mt-3',
                    confirmButton: 'inline-block px-6 py-2.5 mb-0 font-bold text-center uppercase align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer shadow-soft-md bg-x-25 bg-150 leading-pro text-xs ease-soft-in tracking-tight-soft bg-gradient-to-tl from-[#00744B] to-emerald-500 hover:scale-102 hover:shadow-soft-xs active:opacity-85 text-white',
                    cancelButton: 'inline-block px-5 py-2.5 mb-0 font-bold text-center uppercase align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer shadow-soft-md bg-x-25 bg-150 leading-pro text-xs ease-soft-in tracking-tight-soft bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 hover:scale-102 active:opacity-85'
                }
            });

            if (!confirmResult.isConfirmed) {
                if (btnSubmitMain) {
                    btnSubmitMain.disabled = false;
                    btnSubmitMain.innerHTML = originalBtnHtml;
                }
                return;
            }
        }

        UIHelpers.showLoading('กำลังบันทึกเวลาปฏิบัติงาน กรุณารอสักครู่...');

        try {
            if (this.settings.require_gps && this.locationResolvePromise) {
                await Promise.race([
                    this.locationResolvePromise,
                    new Promise(r => setTimeout(r, 900))
                ]);
            }

            let finalPhotoUrl = '';
            if (this.settings.require_photo && this.capturedPhotoDataUrl) {
                finalPhotoUrl = await UIHelpers.uploadPhotoToGoogleDrive(
                    this.capturedPhotoDataUrl,
                    `Checkin_${this.currentUser.username}`,
                    this.settings
                );
            }

            const res = await AttendanceModel.submitCheckinOrCheckout({
                personnel_id: this.currentUser.personnel_id,
                user_id: this.currentUser.id,
                work_date: todayIso,
                shift_name: (isNormalModeSetting && !effectiveOvertimeShift)
                    ? `เวลาราชการปกติ (${stdInRef} - ${stdOutRef})`
                    : formattedShiftName,
                shift_check_in: (isNormalModeSetting && !effectiveOvertimeShift)
                    ? stdInRef
                    : (shiftObj.check_in || stdInRef),
                shift_check_out: (isNormalModeSetting && !effectiveOvertimeShift)
                    ? stdOutRef
                    : (shiftObj.check_out || stdOutRef),
                custom_check_in_time: (isNormalModeSetting && !effectiveOvertimeShift) ? '' : (customCheckIn || ''),
                custom_check_out_time: (isNormalModeSetting && !effectiveOvertimeShift) ? '' : (customCheckOut || ''),
                is_overtime_shift: effectiveOvertimeShift,
                is_overnight: Boolean(shiftObj.is_overnight),
                single_click_checkin: Boolean(this.settings.single_click_checkin || effectiveOvertimeShift),
                photo_url: finalPhotoUrl,
                lat: this.settings.require_gps ? this.gpsData.lat : null,
                lng: this.settings.require_gps ? this.gpsData.lng : null,
                location_name: this.settings.require_gps ? this.gpsData.locationName : ''
            });

            UIHelpers.hideLoading();
            if (!res.success) {
                this.#updateStatusCardsAndMainButton();
                await UIHelpers.alert('ไม่สามารถลงเวลาได้', res.message, 'warning');
                return;
            }

            await this.#resetPageAfterSave();
            await UIHelpers.showToast(res.message, 'success', 3000);
        } catch (err) {
            UIHelpers.hideLoading();
            this.#updateStatusCardsAndMainButton();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
        }
    }

    #openSpecialRequestModal() {
        this.specialModalGps.mode = 'current';
        const radioCurrent = document.getElementById('spGpsModeCurrent');
        const radioCustom = document.getElementById('spGpsModeCustom');
        if (radioCurrent) radioCurrent.checked = true;
        if (radioCustom) radioCustom.checked = false;

        const currentBox = document.getElementById('spCurrentGpsBox');
        const customBox = document.getElementById('spCustomGpsBox');
        currentBox?.classList.remove('hidden');
        customBox?.classList.add('hidden');

        const coordsText = document.getElementById('spCurrentCoordsText');
        const locNameText = document.getElementById('spCurrentLocNameText');
        if (coordsText) {
            coordsText.textContent = (this.gpsData.lat != null && this.gpsData.lng != null)
                ? `${Number(this.gpsData.lat).toFixed(6)}, ${Number(this.gpsData.lng).toFixed(6)}`
                : 'ไม่สามารถระบุพิกัดได้ (กำลังดึง GPS หรือไม่ได้เปิดสิทธิ์)';
        }
        if (locNameText) {
            locNameText.textContent = this.gpsData.locationName || (this.gpsData.lat != null ? 'กำลังตรวจสอบชื่อสถานที่...' : 'ไม่ระบุสถานที่');
        }

        if (this.gpsData.lat != null && (!this.gpsData.locationName || this.gpsData.locationName.includes('กำลังตรวจสอบ'))) {
            AttendanceModel.resolveLocationName(this.gpsData.lat, this.gpsData.lng).then(locName => {
                if (locNameText && this.specialModalGps.mode === 'current') {
                    locNameText.textContent = locName;
                }
            }).catch(e => console.warn('Special modal resolve loc error:', e));
        }
    }

    #initSpecialModalGps() {
        const radioCurrent = document.getElementById('spGpsModeCurrent');
        const radioCustom = document.getElementById('spGpsModeCustom');
        const currentBox = document.getElementById('spCurrentGpsBox');
        const customBox = document.getElementById('spCustomGpsBox');
        const searchInput = document.getElementById('spMapSearchInput');
        const btnSearch = document.getElementById('btnSpMapSearch');
        const searchWrapper = document.getElementById('spSearchWrapper');
        const searchResultsEl = document.getElementById('spMapSearchResults');
        const customCoordsDisp = document.getElementById('spCustomCoordsDisplay');
        const customLocDisp = document.getElementById('spCustomLocNameDisplay');

        const updateCustomPinAndLocation = async (lat, lng, flyTo = false, explicitName = null) => {
            const numLat = Number(lat);
            const numLng = Number(lng);
            if (isNaN(numLat) || isNaN(numLng)) return;

            this.specialModalGps.customLat = numLat;
            this.specialModalGps.customLng = numLng;

            if (customCoordsDisp) {
                customCoordsDisp.textContent = `${numLat.toFixed(6)}, ${numLng.toFixed(6)}`;
            }

            if (this.spLeafletMarker) {
                this.spLeafletMarker.setLatLng([numLat, numLng]);
            }
            if (this.spLeafletMap && flyTo) {
                this.spLeafletMap.flyTo([numLat, numLng], 16, { animate: true, duration: 1 });
            }

            // หากมีชื่อสถานที่ที่เลือกมาโดยตรง ให้ใช้ชื่อนั้นทันทีโดยไม่ต้องมีคำว่า ใกล้เคียง หรือ บริเวณ
            if (explicitName) {
                const cleanName = String(explicitName).replace(/^(ใกล้เคียง|บริเวณ)\s*/, '').trim();
                this.specialModalGps.customLocationName = cleanName;
                if (customLocDisp) {
                    customLocDisp.textContent = cleanName;
                }
                return;
            }

            if (customLocDisp) {
                customLocDisp.textContent = 'กำลังตรวจสอบชื่อสถานที่...';
            }

            try {
                const rawLocName = await AttendanceModel.resolveLocationName(numLat, numLng);
                const locName = (rawLocName || '').replace(/^(ใกล้เคียง|บริเวณ)\s*/, '').trim();
                this.specialModalGps.customLocationName = locName;
                if (customLocDisp) {
                    customLocDisp.textContent = locName || `พิกัด (${numLat.toFixed(5)}, ${numLng.toFixed(5)})`;
                }
            } catch (err) {
                console.warn('Resolve custom location error:', err);
                const fallbackName = `พิกัด (${numLat.toFixed(5)}, ${numLng.toFixed(5)})`;
                this.specialModalGps.customLocationName = fallbackName;
                if (customLocDisp) {
                    customLocDisp.textContent = fallbackName;
                }
            }
        };

        const setupMapIfAvailable = () => {
            if (typeof L === 'undefined') {
                console.warn('Leaflet is not loaded yet.');
                return;
            }

            const initialLat = this.specialModalGps.customLat ?? this.gpsData.lat ?? 13.7563;
            const initialLng = this.specialModalGps.customLng ?? this.gpsData.lng ?? 100.5018;

            if (!this.spLeafletMap) {
                const mapEl = document.getElementById('spLeafletMap');
                if (!mapEl) return;

                this.spLeafletMap = L.map('spLeafletMap', {
                    zoomControl: true,
                    attributionControl: false
                }).setView([initialLat, initialLng], 16);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19
                }).addTo(this.spLeafletMap);

                this.spLeafletMarker = L.marker([initialLat, initialLng], {
                    draggable: true,
                    autoPan: true
                }).addTo(this.spLeafletMap);

                this.spLeafletMarker.on('dragend', (e) => {
                    const pos = e.target.getLatLng();
                    updateCustomPinAndLocation(pos.lat, pos.lng, false);
                });

                this.spLeafletMap.on('click', (e) => {
                    updateCustomPinAndLocation(e.latlng.lat, e.latlng.lng, false);
                });
            }

            updateCustomPinAndLocation(initialLat, initialLng, true);
            setTimeout(() => {
                this.spLeafletMap?.invalidateSize();
            }, 250);
        };

        radioCurrent?.addEventListener('change', () => {
            if (radioCurrent.checked) {
                this.specialModalGps.mode = 'current';
                currentBox?.classList.remove('hidden');
                customBox?.classList.add('hidden');
            }
        });

        radioCustom?.addEventListener('change', () => {
            if (radioCustom.checked) {
                this.specialModalGps.mode = 'custom';
                currentBox?.classList.add('hidden');
                customBox?.classList.remove('hidden');
                setupMapIfAvailable();
            }
        });

        const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
            if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
            const nLat1 = Number(lat1);
            const nLon1 = Number(lon1);
            const nLat2 = Number(lat2);
            const nLon2 = Number(lon2);
            if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return Infinity;

            const R = 6371e3; // metres
            const φ1 = nLat1 * Math.PI / 180;
            const φ2 = nLat2 * Math.PI / 180;
            const Δφ = (nLat2 - nLat1) * Math.PI / 180;
            const Δλ = (nLon2 - nLon1) * Math.PI / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const dist = getDistanceInMeters(lat1, lon1, lat2, lon2);
            if (!isFinite(dist)) return '';

            if (dist < 1000) {
                return `• ${Math.round(dist)} ม.`;
            } else {
                return `• ${(dist / 1000).toFixed(1)} กม.`;
            }
        };

        const getCategoryLabel = (item) => {
            if (!item) return 'สถานที่ทั่วไป';
            const type = (item.type || '').toLowerCase();
            const cls = (item.class || '').toLowerCase();

            if (cls === 'government' || type === 'government' || type === 'townhall' || type === 'courthouse' || type === 'public_building' || type === 'police') {
                return 'สถานที่ราชการ กทม.';
            }
            if (cls === 'place_of_worship' || type === 'place_of_worship' || type === 'temple' || type === 'church' || type === 'mosque') {
                return 'วัด / ศาสนสถาน';
            }
            if (cls === 'education' || type === 'school' || type === 'university' || type === 'college' || type === 'kindergarten') {
                return 'สถานศึกษา';
            }
            if (cls === 'leisure' || type === 'park' || type === 'garden' || type === 'pitch' || type === 'playground') {
                return 'สวนสาธารณะ / ลานกิจกรรม';
            }
            if (cls === 'building' || cls === 'office' || type === 'building' || type === 'office' || type === 'commercial') {
                return 'อาคาร / สำนักงาน';
            }
            if (type === 'hospital' || type === 'clinic' || type === 'doctors' || type === 'pharmacy') {
                return 'โรงพยาบาล / สาธารณสุข';
            }
            if (cls === 'highway' || type === 'road' || type === 'residential' || type === 'street') {
                return 'ถนน / ซอย';
            }
            if (cls === 'shop' || type === 'mall' || type === 'supermarket' || type === 'department_store') {
                return 'ห้างสรรพสินค้า / ร้านค้า';
            }
            if (cls === 'railway' || type === 'station' || type === 'subway_entrance' || type === 'bus_stop') {
                return 'สถานีขนส่ง / รถไฟฟ้า';
            }
            if (cls === 'tourism' || type === 'attraction' || type === 'hotel' || type === 'museum') {
                return 'สถานที่ท่องเที่ยว / โรงแรม';
            }
            if (cls === 'boundary' || type === 'administrative') {
                return 'เขต / แขวง / พื้นที่';
            }
            return 'สถานที่ทั่วไป';
        };

        const escapeHtml = (str) => {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        const formatSubAddress = (item) => {
            if (!item) return '';
            if (item.address) {
                const addr = item.address;
                const parts = [];
                if (addr.road) parts.push(addr.road);
                const sub = addr.quarter || addr.suburb || addr.neighbourhood;
                if (sub && !parts.includes(sub) && sub !== item.name) parts.push(sub);
                const dist = addr.city_district || addr.district || (addr.suburb !== sub ? addr.suburb : '') || addr.county;
                if (dist && !parts.includes(dist) && dist !== item.name) parts.push(dist);
                const prov = addr.state || addr.province || addr.city;
                if (prov && !parts.includes(prov) && prov !== item.name) parts.push(prov);
                if (parts.length > 0) return parts.join(', ');
            }
            const tokens = (item.display_name || '').split(',').map(s => s.trim());
            return tokens.slice(1, 4).join(', ') || item.display_name || '';
        };

        const getMainName = (item) => {
            if (item.name) return item.name;
            if (item.address) {
                const addr = item.address;
                const candidate = addr.amenity || addr.building || addr.office || addr.leisure || addr.tourism || addr.shop;
                if (candidate) return candidate;
            }
            return (item.display_name || '').split(',')[0].trim() || 'สถานที่ที่เลือก';
        };

        const hideSearchResults = () => {
            if (searchResultsEl) {
                searchResultsEl.classList.add('hidden');
                searchResultsEl.innerHTML = '';
            }
        };

        const bindResultItemClicks = () => {
            if (!searchResultsEl) return;
            searchResultsEl.querySelectorAll('.sp-search-item').forEach(itemEl => {
                itemEl.addEventListener('click', async () => {
                    const lat = parseFloat(itemEl.dataset.lat);
                    const lng = parseFloat(itemEl.dataset.lng);
                    const name = (itemEl.dataset.name || '').replace(/^(ใกล้เคียง|บริเวณ)\s*/, '').trim();
                    if (searchInput) {
                        searchInput.value = name;
                    }
                    hideSearchResults();
                    if (!isNaN(lat) && !isNaN(lng)) {
                        await updateCustomPinAndLocation(lat, lng, true, name);
                    }
                });
            });
        };

        const renderCoordsResult = (lat, lng) => {
            if (!searchResultsEl) return;
            const refLat = this.gpsData?.lat;
            const refLng = this.gpsData?.lng;
            const distStr = calculateDistance(refLat, refLng, lat, lng);
            const distHtml = distStr ? `<span class="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] shrink-0">${escapeHtml(distStr)}</span>` : '';

            searchResultsEl.innerHTML = `
                <div class="sp-search-item p-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer flex items-start gap-3 transition" data-lat="${lat}" data-lng="${lng}" data-name="พิกัด (${lat.toFixed(5)}, ${lng.toFixed(5)})">
                    <i class="fa-solid fa-location-dot text-emerald-600 dark:text-emerald-400 mt-1 text-sm shrink-0"></i>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="font-bold text-slate-800 dark:text-slate-100 text-xs">📌 ไปที่พิกัด ${lat.toFixed(6)}, ${lng.toFixed(6)}</span>
                            ${distHtml}
                        </div>
                        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">คลิกเพื่อปักหมุดและนำทางไปยังพิกัดนี้บนแผนที่</div>
                        <div class="mt-1">
                            <span class="inline-flex items-center px-2 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-medium">พิกัด GPS</span>
                        </div>
                    </div>
                </div>
            `;
            searchResultsEl.classList.remove('hidden');
            bindResultItemClicks();
        };

        const renderPlaceResults = (items) => {
            if (!searchResultsEl) return;
            if (!items || items.length === 0) {
                searchResultsEl.innerHTML = `
                    <div class="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                        <i class="fa-solid fa-triangle-exclamation text-amber-500 mb-1 block text-base"></i>
                        <span>ไม่พบสถานที่ใกล้เคียง กรุณาระบุชื่อเพิ่มเติมหรือลากหมุดบนแผนที่</span>
                    </div>
                `;
                searchResultsEl.classList.remove('hidden');
                return;
            }

            const refLat = this.gpsData?.lat;
            const refLng = this.gpsData?.lng;

            const html = items.map(item => {
                const itemLat = parseFloat(item.lat);
                const itemLng = parseFloat(item.lng ?? item.lon);
                const mainName = item.mainName || getMainName(item);
                const subAddr = item.subAddr !== undefined ? item.subAddr : formatSubAddress(item);
                const category = item.category || getCategoryLabel(item);
                const distStr = item.distStr || calculateDistance(refLat, refLng, itemLat, itemLng);
                const distHtml = distStr ? `<span class="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] shrink-0">${escapeHtml(distStr)}</span>` : '';

                return `
                    <div class="sp-search-item p-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer flex items-start gap-3 transition" data-lat="${itemLat}" data-lng="${itemLng}" data-name="${escapeHtml(mainName)}">
                        <i class="fa-solid fa-location-dot text-emerald-600 dark:text-emerald-400 mt-1 text-sm shrink-0"></i>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="font-bold text-slate-800 dark:text-slate-100 text-xs">${escapeHtml(mainName)}</span>
                                ${distHtml}
                            </div>
                            <div class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">${escapeHtml(subAddr)}</div>
                            <div class="mt-1">
                                <span class="inline-flex items-center px-2 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-medium">${escapeHtml(category)}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            searchResultsEl.innerHTML = html;
            searchResultsEl.classList.remove('hidden');
            bindResultItemClicks();
        };

        let searchSeq = 0;
        let debounceTimer = null;

        const performSearch = async () => {
            const query = (searchInput?.value || '').trim();
            if (!query) {
                hideSearchResults();
                return;
            }

            // 1. Check if coordinate format e.g. "13.7563, 100.5018"
            const coordRegex = /^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/;
            const match = query.match(coordRegex);
            if (match) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);
                if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    renderCoordsResult(lat, lng);
                    return;
                }
            }

            // 2. Dual-Engine Search: Photon (Primary) + Nominatim (Fallback)
            const currentSeq = ++searchSeq;
            if (searchResultsEl) {
                searchResultsEl.innerHTML = `
                    <div class="p-4 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-spinner fa-spin text-indigo-500"></i>
                        <span>กำลังค้นหาสถานที่ใกล้เคียง...</span>
                    </div>
                `;
                searchResultsEl.classList.remove('hidden');
            }

            const origBtnText = btnSearch ? btnSearch.innerHTML : '';
            if (btnSearch) {
                btnSearch.disabled = true;
                btnSearch.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            }

            const refLat = this.gpsData?.lat;
            const refLng = this.gpsData?.lng;

            try {
                let items = [];
                let photonSuccess = false;

                // Primary Engine: Photon API
                try {
                    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8${refLat && refLng ? `&lat=${refLat}&lon=${refLng}` : ''}&lang=default`;
                    const res = await fetch(photonUrl);
                    if (res.ok) {
                        const data = await res.json();
                        if (currentSeq !== searchSeq) return;

                        if (data && Array.isArray(data.features) && data.features.length > 0) {
                            items = data.features.map(f => {
                                const props = f.properties || {};
                                const coords = f.geometry?.coordinates || [0, 0];
                                const lng = coords[0];
                                const lat = coords[1];
                                const mainName = props.name || props.street || props.district || props.city || 'สถานที่ที่เลือก';

                                // ที่อยู่ย่อย
                                const addrParts = [];
                                if (props.street && props.street !== mainName) addrParts.push(props.street);
                                if (props.district && props.district !== mainName) addrParts.push(props.district);
                                if (props.city && props.city !== mainName) addrParts.push(props.city);
                                if (props.state && props.state !== mainName && props.state !== props.city) addrParts.push(props.state);
                                const subAddr = addrParts.join(', ') || props.country || '';

                                // หมวดหมู่
                                const category = getCategoryLabel({
                                    type: props.osm_value,
                                    class: props.osm_key
                                });

                                return {
                                    lat,
                                    lng,
                                    mainName,
                                    subAddr,
                                    category,
                                    rawProps: props
                                };
                            });
                            photonSuccess = items.length > 0;
                        }
                    }
                } catch (photonErr) {
                    console.warn('Photon search error, falling back to Nominatim:', photonErr);
                }

                if (currentSeq !== searchSeq) return;

                // Fallback Engine: Nominatim API (if Photon returns 0 results or throws error)
                if (!photonSuccess) {
                    try {
                        const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&countrycodes=th&accept-language=th&addressdetails=1`;
                        const resNom = await fetch(nomUrl, {
                            headers: { 'User-Agent': 'CheckinApp-BMA/2.0' }
                        });
                        if (resNom.ok) {
                            const dataNom = await resNom.json();
                            if (currentSeq !== searchSeq) return;

                            if (Array.isArray(dataNom) && dataNom.length > 0) {
                                items = dataNom.map(item => {
                                    const lat = parseFloat(item.lat);
                                    const lng = parseFloat(item.lon);
                                    const mainName = getMainName(item);
                                    const subAddr = formatSubAddress(item);
                                    const category = getCategoryLabel(item);

                                    return {
                                        lat,
                                        lng,
                                        mainName,
                                        subAddr,
                                        category,
                                        rawProps: item
                                    };
                                });
                            }
                        }
                    } catch (nomErr) {
                        console.warn('Nominatim search fallback error:', nomErr);
                    }
                }

                if (currentSeq !== searchSeq) return;

                // Sort results (Province & Proximity Bias) if GPS is available
                if (refLat && refLng && items.length > 0) {
                    let userProvince = '';
                    if (this.gpsData?.locationName) {
                        const pMatch = this.gpsData.locationName.match(/(?:จ\.|จังหวัด|กรุงเทพมหานคร|กรุงเทพฯ|กทม\.)([^\s,]+)?/i);
                        if (pMatch) userProvince = pMatch[0].trim();
                    }

                    items.forEach(item => {
                        item.distanceMeters = getDistanceInMeters(refLat, refLng, item.lat, item.lng);
                        item.distStr = calculateDistance(refLat, refLng, item.lat, item.lng);
                    });

                    items.sort((a, b) => {
                        if (userProvince) {
                            const aProv = `${a.subAddr || ''} ${a.rawProps?.state || ''} ${a.rawProps?.city || ''}`.includes(userProvince);
                            const bProv = `${b.subAddr || ''} ${b.rawProps?.state || ''} ${b.rawProps?.city || ''}`.includes(userProvince);
                            if (aProv && !bProv) return -1;
                            if (!aProv && bProv) return 1;
                        }
                        return (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity);
                    });
                }

                renderPlaceResults(items);
            } catch (err) {
                if (currentSeq !== searchSeq) return;
                console.warn('Search location error:', err);
                if (searchResultsEl) {
                    searchResultsEl.innerHTML = `
                        <div class="p-4 text-center text-xs text-rose-500 dark:text-rose-400">
                            <i class="fa-solid fa-circle-exclamation mb-1 block text-base"></i>
                            <span>เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ค้นหา</span>
                        </div>
                    `;
                    searchResultsEl.classList.remove('hidden');
                }
            } finally {
                if (btnSearch) {
                    btnSearch.disabled = false;
                    btnSearch.innerHTML = origBtnText;
                }
            }
        };

        searchInput?.addEventListener('input', () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            const query = (searchInput?.value || '').trim();
            if (!query || query.length < 2) {
                hideSearchResults();
                return;
            }
            debounceTimer = setTimeout(() => {
                performSearch();
            }, 2000);
        });

        btnSearch?.addEventListener('click', (e) => {
            e.preventDefault();
            if (debounceTimer) clearTimeout(debounceTimer);
            performSearch();
        });

        searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (debounceTimer) clearTimeout(debounceTimer);
                performSearch();
            } else if (e.key === 'Escape') {
                hideSearchResults();
            }
        });

        document.addEventListener('click', (e) => {
            const wrapper = document.getElementById('spSearchWrapper');
            if (wrapper && !wrapper.contains(e.target)) {
                hideSearchResults();
            }
        });
    }

    async #handleSubmitSpecialRequest(closeModalCallback) {
        AuthService.getCurrentUser(true);

        const workDate = document.getElementById('spWorkDate').value;
        const shiftIdx = parseInt(document.getElementById('spShiftSelect').value || '0', 10);
        const shiftObj = (this.settings.work_shifts || [])[shiftIdx] || {
            name: 'เวลาราชการปกติ',
            check_in: '08:30',
            check_out: '16:30',
            is_custom: false,
            is_overtime: false
        };
        const remark = document.getElementById('spRemarkSelect').value;

        let checkInTime = shiftObj.check_in || this.settings.standard_check_in || '08:30';
        let checkOutTime = shiftObj.check_out || this.settings.standard_check_out || '16:30';

        if (shiftObj.is_custom || String(shiftObj.name || '').includes('อื่นๆ')) {
            checkInTime = UIHelpers.formatTime24(document.getElementById('spCustomCheckin').value || '08:30');
            checkOutTime = UIHelpers.formatTime24(document.getElementById('spCustomCheckout').value || '16:30');
        }

        UIHelpers.showLoading('กำลังส่งคำขอลงเวลากรณีพิเศษ กรุณารอสักครู่...');
        try {
            let finalPhotoUrl = '';
            if (this.settings.require_photo && this.capturedPhotoDataUrl) {
                finalPhotoUrl = await UIHelpers.uploadPhotoToGoogleDrive(
                    this.capturedPhotoDataUrl,
                    `Special_${this.currentUser.username}`,
                    this.settings
                );
            }

            let finalLat = null;
            let finalLng = null;
            let finalLocName = 'ขอลงเวลากรณีพิเศษ';

            if (this.specialModalGps?.mode === 'custom' && this.specialModalGps.customLat != null && this.specialModalGps.customLng != null) {
                finalLat = this.specialModalGps.customLat;
                finalLng = this.specialModalGps.customLng;
                finalLocName = (this.specialModalGps.customLocationName || 'พิกัดกำหนดเอง').replace(/^(ใกล้เคียง|บริเวณ)\s*/, '').trim();
            } else {
                finalLat = this.settings.require_gps ? this.gpsData.lat : null;
                finalLng = this.settings.require_gps ? this.gpsData.lng : null;
                finalLocName = (this.settings.require_gps && this.gpsData.locationName) ? this.gpsData.locationName : 'ขอลงเวลากรณีพิเศษ';
            }

            const res = await AttendanceModel.submitSpecialRequest({
                personnel_id: this.currentUser.personnel_id,
                user_id: this.currentUser.id,
                work_date: workDate,
                shift_name: SettingsModel.formatShiftDisplayText(shiftObj),
                check_in_time: checkInTime,
                check_out_time: checkOutTime,
                is_overtime: Boolean(shiftObj.is_overtime),
                remark,
                photo_url: finalPhotoUrl,
                lat: finalLat,
                lng: finalLng,
                location_name: finalLocName
            });

            UIHelpers.hideLoading();
            if (!res.success) {
                await UIHelpers.alert('ส่งคำขอไม่สำเร็จ', res.message, 'error');
                return;
            }

            closeModalCallback();
            await this.#resetPageAfterSave();
            await UIHelpers.showToast(res.message, 'success', 3200);
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
        }
    }
  // QA TEST BRIDGES
  test_evaluateTimeWindowAndPopulateShifts() { return this.#evaluateTimeWindowAndPopulateShifts(); }
  test_updateStatusCardsAndMainButton() { return this.#updateStatusCardsAndMainButton(); }
  test_isShiftAlreadyRecordedToday(s) { return this.#isShiftAlreadyRecordedToday(s); }
  test_isShiftActiveAtCurrentTime(s, nowMin, allowStartMin) { return this.#isShiftActiveAtCurrentTime(s, nowMin, allowStartMin); }
}