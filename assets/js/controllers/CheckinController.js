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
        this.pastPageSize = 5;
        this.pastCurrentPage = 1;
        this.specialRequestsList = [];
        this.lastEvaluatedMinute = -1;
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
        this.settings = await SettingsModel.getSettings(false);
        this.#renderUserAndSettingsInfo();
        this.#applyDynamicWorkspaceLayout();
        await this.#refreshAllAttendanceData();
        UIHelpers.hideLoading();

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

            cameraCard.className = 'lg:col-span-5 bma-card p-5 flex flex-col justify-between';
            rightWrapper.className = 'lg:col-span-7 flex flex-col justify-between gap-6';
            gpsCard.className = 'bma-card p-5 space-y-3.5 flex flex-col justify-between';
            actionCard.className = 'bma-card p-5 space-y-4 flex flex-col justify-between';
        } else if (!showPhoto && showGps) {
            cameraCard.classList.add('hidden');
            gpsCard.classList.remove('hidden');

            rightWrapper.className = 'lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch';
            gpsCard.className = 'lg:col-span-7 bma-card p-5 space-y-3.5 flex flex-col justify-between h-full';
            actionCard.className = 'lg:col-span-5 bma-card p-5 space-y-4 flex flex-col justify-between h-full';
        } else if (showPhoto && !showGps) {
            cameraCard.classList.remove('hidden');
            gpsCard.classList.add('hidden');

            cameraCard.className = 'lg:col-span-5 bma-card p-5 flex flex-col justify-between h-full';
            rightWrapper.className = 'lg:col-span-7 flex flex-col justify-stretch';
            actionCard.className = 'bma-card p-6 space-y-5 flex flex-col justify-between h-full w-full';
        } else {
            cameraCard.classList.add('hidden');
            gpsCard.classList.add('hidden');

            rightWrapper.className = 'lg:col-span-12 max-w-2xl w-full mx-auto';
            actionCard.className = 'bma-card p-6 sm:p-8 space-y-5 flex flex-col justify-between w-full shadow-xl';
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

        const isOvernight = Boolean(shift.is_overnight || endMin < startMin);

        if (isOvernight) {
            return (nowMin >= startMin) || (nowMin <= endMin);
        }

        const effectiveStartMin = shift.is_overtime ? startMin : Math.min(startMin, allowStartMin);
        return nowMin >= effectiveStartMin && nowMin <= endMin;
    }

    #evaluateTimeWindowAndPopulateShifts() {
        const allShifts = this.settings?.work_shifts || [];
        const selectEl = document.getElementById('checkinShiftSelect');
        const labelEl = document.getElementById('checkinShiftSelectLabel');
        if (!selectEl) return;

        const prevSelectedIdx = selectEl.value;
        const nowMin = UIHelpers.timeToMinutes(UIHelpers.getCurrentTimeHHMM());
        const allowStartMin = UIHelpers.timeToMinutes(this.settings?.allow_checkin_start_time || '06:00');
        const stdOutMin = UIHelpers.timeToMinutes(this.settings?.standard_check_out || '16:30');

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
        const mustUseOvertimeWindow = !hasUnclosedRegular && (hasCompletedRegularToday || (isRealtimeFilterEnabled && (isBeforeAllowStart || isAfterStdOut)));

        let candidateShifts = allShifts.map((s, originalIdx) => ({ ...s, originalIdx }));

        if (mustUseOvertimeWindow) {
            const otOnly = candidateShifts.filter(s => s.is_overtime || s.is_custom);
            if (otOnly.length > 0) {
                candidateShifts = otOnly;
            }
        }

        let timeFilteredShifts = candidateShifts.filter(s =>
            this.#isShiftActiveAtCurrentTime(s, nowMin, allowStartMin)
        );

        if (timeFilteredShifts.length === 0) {
            timeFilteredShifts = candidateShifts;
        }

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

        selectEl.innerHTML = timeFilteredShifts.map(s => {
            const displayText = SettingsModel.formatShiftDisplayText(s);
            return `<option value="${s.originalIdx}">${displayText}</option>`;
        }).join('');

        if (prevSelectedIdx && timeFilteredShifts.some(s => String(s.originalIdx) === String(prevSelectedIdx))) {
            selectEl.value = prevSelectedIdx;
        }
    }

    #renderUserAndSettingsInfo() {
        const org = this.settings.organization_name || 'กรุงเทพมหานคร';
        const bureau = this.settings.bureau_name || 'สำนักเทศกิจ';
        const footerDesc = this.settings.footer_description || '';

        document.getElementById('checkinOrgName').textContent = org;
        document.getElementById('checkinBureauName').textContent = bureau;
        document.getElementById('footerCheckinOrg').textContent = org;
        document.getElementById('footerCheckinBureau').textContent = bureau;

        const descEl = document.getElementById('footerCheckinDesc');
        if (descEl) {
            descEl.textContent = footerDesc;
            descEl.classList.toggle('hidden', !footerDesc);
        }

        if (this.settings.logo_url) {
            document.getElementById('checkinLogoBox').innerHTML = `<img src="${this.settings.logo_url}" alt="Logo" class="w-full h-full object-contain rounded-xl bg-white p-0.5">`;
        }

        if (['SuperAdmin', 'Admin'].includes(this.currentUser.role)) {
            document.getElementById('btnGoAdminDashboard')?.classList.remove('hidden');
        }

        document.getElementById('userFullNameText').textContent = this.currentUser.full_name;
        document.getElementById('userRoleBadge').textContent = this.currentUser.role;

        const p = this.currentUser.personnel;
        if (p) {
            document.getElementById('userPositionText').textContent = `${p.position_title} ${p.position_level ? 'ระดับ' + p.position_level : ''} (${p.position_type || '-'})`;
            document.getElementById('userAffiliationText').textContent = `${p.organization} • ${p.bureau} • ${p.division} ${p.work_group ? '• ' + p.work_group : ''}`;
        } else {
            document.getElementById('userPositionText').textContent = `รหัสผู้ใช้งาน: ${this.currentUser.username}`;
            document.getElementById('userAffiliationText').textContent = `${org} • ${this.currentUser.scope_bureau || bureau}`;
        }

        const allShifts = this.settings.work_shifts || [];
        const spSelect = document.getElementById('spShiftSelect');
        if (spSelect) {
            spSelect.innerHTML = allShifts.map((s, idx) =>
                `<option value="${idx}">${SettingsModel.formatShiftDisplayText(s)}</option>`
            ).join('');
        }

        const remarks = this.settings.remarks || [];
        document.getElementById('spRemarkSelect').innerHTML = remarks.map(r =>
            `<option value="${r}">${r}</option>`
        ).join('');

        document.getElementById('spWorkDate').value = UIHelpers.getTodayISO();
    }

    async #refreshAllAttendanceData() {
        const todayIso = UIHelpers.getTodayISO();
        const [activeReg, allHistory, specialRequests] = await Promise.all([
            AttendanceModel.getActiveRegularRecordForCheckout(this.currentUser.personnel_id, this.currentUser.id, this.settings),
            AttendanceModel.getPersonalAttendanceHistory(this.currentUser.personnel_id, this.currentUser.id, 150),
            AttendanceModel.getPersonalSpecialRequests(this.currentUser.personnel_id, this.currentUser.id)
        ]);

        this.activeRegularRecord = activeReg;
        this.todayHistoryList = allHistory.filter(item => item.work_date === todayIso);
        this.pastHistoryList = allHistory.filter(item => item.work_date !== todayIso);
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
        const shiftIdx = parseInt(document.getElementById('checkinShiftSelect')?.value || '0', 10);
        const shiftObj = (this.settings?.work_shifts || [])[shiftIdx] || {};

        const nowMin = UIHelpers.timeToMinutes(UIHelpers.getCurrentTimeHHMM());
        const allowStartRef = UIHelpers.formatTime24(this.settings?.allow_checkin_start_time || '06:00');
        const allowStartMin = UIHelpers.timeToMinutes(allowStartRef);
        const stdInRef = UIHelpers.formatTime24(this.settings?.standard_check_in || '08:30');
        const stdOutRef = UIHelpers.formatTime24(this.settings?.standard_check_out || '16:30');
        const stdOutMin = UIHelpers.timeToMinutes(stdOutRef);
        const graceMin = Number(this.settings?.checkout_grace_minutes ?? 30);

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
        if (isNormalModeSetting && isRealtimeFilterEnabled && !isRegularCompletedToday && !isBeforeAllowStart && !isAfterStdOut) {
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

    #stopCameraHardwareStream() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        const video = document.getElementById('cameraVideoStream');
        if (video) {
            video.srcObject = null;
        }
        this.isCameraRunning = false;
    }

    #stopCameraAndShowStandby() {
        this.#stopCameraHardwareStream();
        this.capturedPhotoDataUrl = '';

        const video = document.getElementById('cameraVideoStream');
        const preview = document.getElementById('capturedPhotoPreview');
        const standbyOverlay = document.getElementById('cameraStandbyOverlay');

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

        const btnStartBottom = document.getElementById('btnStartCameraBottom');
        const btnCapture = document.getElementById('btnCapturePhoto');
        const btnStop = document.getElementById('btnStopCamera');
        const btnRetake = document.getElementById('btnRetakePhoto');

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

            btnStartBottom?.classList.add('hidden');
            btnRetake?.classList.add('hidden');
            btnCapture?.classList.remove('hidden');
            btnStop?.classList.remove('hidden');
        } catch (err) {
            console.warn('Camera access error:', err);
            this.#stopCameraHardwareStream();
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
                'question'
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
        document.getElementById('btnStopCamera')?.addEventListener('click', () => this.#stopCameraAndShowStandby());
        document.getElementById('btnRetakePhoto')?.addEventListener('click', () => this.#openCameraOnDemand());

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
            this.pastPageSize = parseInt(e.target.value, 10) || 5;
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

        document.getElementById('btnOpenSpecialRequestModal')?.addEventListener('click', () => {
            modalSpecial?.classList.remove('hidden');
        });
        document.getElementById('btnCloseSpecialModal')?.addEventListener('click', closeSpecialModal);
        document.getElementById('btnCancelSpecialModal')?.addEventListener('click', closeSpecialModal);

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

        // Mobile Hamburger Drawer
        document.getElementById('btnMobileHistoryMenu')?.addEventListener('click', () => {
            if (drawerMount && paneHistory && paneSpecial) {
                drawerMount.appendChild(paneHistory);
                drawerMount.appendChild(paneSpecial);
                paneHistory.classList.remove('hidden');
                paneSpecial.classList.remove('hidden');
            }
            drawer?.classList.remove('hidden');
            this.#renderPersonalAttendanceTabs();
            this.#renderSpecialRequestsHistoryTable();
        });

        const closeMobileDrawer = () => {
            drawer?.classList.add('hidden');
            if (desktopPanes && paneHistory && paneSpecial) {
                desktopPanes.appendChild(paneHistory);
                desktopPanes.appendChild(paneSpecial);
                paneHistory.classList.add('hidden');
                paneSpecial.classList.add('hidden');
            }
        };

        document.getElementById('btnCloseMobileDrawer')?.addEventListener('click', closeMobileDrawer);
        document.getElementById('btnMobileHistoryDrawerBackdrop')?.addEventListener('click', closeMobileDrawer);
        document.getElementById('btnOpenSpecialRequestDrawer')?.addEventListener('click', () => {
            modalSpecial?.classList.remove('hidden');
        });
    }

    async #handleMainCheckin() {
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
        if (btnSubmitMain) btnSubmitMain.disabled = true;

        const isNormalModeSetting = !Boolean(this.settings?.single_click_checkin);
        const shiftIdx = parseInt(document.getElementById('checkinShiftSelect')?.value || '0', 10);
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
            ((!isNormalModeSetting || !isRealtimeFilterEnabled) && shiftObj.is_overtime) ||
            isOvertimeByTimeWindow
        );

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

            const stdInRef = UIHelpers.formatTime24(this.settings.standard_check_in || '08:30');
            const stdOutRef = UIHelpers.formatTime24(this.settings.standard_check_out || '16:30');

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
                lat: this.settings.require_gps ? this.gpsData.lat : null,
                lng: this.settings.require_gps ? this.gpsData.lng : null,
                location_name: (this.settings.require_gps && this.gpsData.locationName) ? this.gpsData.locationName : 'ขอลงเวลากรณีพิเศษ'
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
}

document.addEventListener('DOMContentLoaded', () => {
    new CheckinController();
});