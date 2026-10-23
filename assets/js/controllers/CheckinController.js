/**
 * @file assets/js/controllers/CheckinController.js
 * @description คลาสควบคุมหน้าลงเวลาปฏิบัติราชการ (ป้าย Tag กระชับไม่ล้นจอ, กรองตัวเลือกช่วงเวลาตามเวลาจริง, และควบคุมเงื่อนไขรูปแบบปกติ/รูปแบบพิเศษครบทุกข้อ)
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
            locationName: ''
        };
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
        this.#updateThemeButtonUI();
        this.currentUser = AuthService.requireAuth(['SuperAdmin', 'Admin', 'User']);
        if (!this.currentUser) return;

        this.#checkAndShowWelcomeToast();
        this.#startLiveClock24();
        this.#bindEvents();

        UIHelpers.showLoading('กำลังเตรียมระบบลงเวลาปฏิบัติราชการ...');
        this.settings = await SettingsModel.getSettings(false);
        this.#renderUserAndSettingsInfo();
        await this.#refreshAllAttendanceData();
        UIHelpers.hideLoading();

        this.#stopCameraAndShowStandby();
        await this.#initGpsLocation();
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
                clockEl.textContent = `${hh}:${mm}:${ss} น.`;
            }
            if (dateEl) {
                dateEl.textContent = UIHelpers.formatThaiShortDate(UIHelpers.getTodayISO());
            }

            // อัปเดตตัวเลือกช่วงเวลาตามเวลาจริงทุกครั้งเมื่อนาทีเปลี่ยน (เช่น เมื่อถึง 14:01 น. ให้ซ่อนกะที่หมดเวลา 14:00 น. ทันที)
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

    /**
     * ตรวจสอบว่าช่วงเวลา (shift) นี้อยู่ในกรอบเวลาจริงปัจจุบันหรือไม่ (ตามข้อ 5.1 และ 1.2.1)
     * เช่น ปฏิบัติงานนอกเวลา (05:00 - 14:00) จะแสดงตั้งแต่เวลาจริง 05:00 - 14:00 น. พอถึง 14:01 น. จะซ่อนอัตโนมัติ
     * @param {Object} shift
     * @param {number} nowMin นาทีปัจจุบันนับจาก 00:00
     * @param {number} allowStartMin เวลาเริ่มเปิดให้บันทึกเข้างานปกติ (เช่น 06:00 = 360)
     * @returns {boolean}
     */
    #isShiftActiveAtCurrentTime(shift, nowMin, allowStartMin) {
        if (!this.settings?.filter_shifts_by_realtime) {
            return true; // กรณียกเลิกการติ๊กในตั้งค่าระบบ ให้แสดงตัวเลือกทั้งหมด
        }
        if (shift.is_custom) {
            return true;
        }

        const startMin = UIHelpers.timeToMinutes(shift.check_in || '08:30');
        const endMin = UIHelpers.timeToMinutes(shift.check_out || '16:30');
        if (startMin < 0 || endMin < 0) return true;

        const isOvernight = Boolean(shift.is_overnight || endMin < startMin);

        if (isOvernight) {
            // กะข้ามวัน เช่น 22:00 - 01:00 น. แสดงตั้งแต่เริ่มกะไปจนถึงเวลาเลิกงานในวันถัดไป
            return (nowMin >= startMin) || (nowMin <= endMin);
        }

        // สำหรับกะทำงานปกติ: เปิดให้เลือกได้ตั้งแต่ "เริ่มเวลาเข้างาน" (เช่น 06:00 น.) ไปจนถึงเวลาเลิกงานของกะนั้น
        const effectiveStartMin = shift.is_overtime ? startMin : Math.min(startMin, allowStartMin);
        return nowMin >= effectiveStartMin && nowMin <= endMin;
    }

    /**
     * ประเมินช่วงเวลาจริงปัจจุบัน และกรองตัวเลือกใน Dropdown ตามกฎข้อ 1 - 6
     */
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

        // ตรวจสอบว่าขณะนี้อยู่ในโหมดบังคับเลือก "ช่วงเวลาปฏิบัติงานนอกเวลา" หรือไม่:
        // - ข้อ 4: เข้ามาก่อนเวลาเริ่มบันทึกเวลาตามข้อ 1 (เช่น ก่อน 06:00 น.) และไม่มีรายการค้างออกงาน
        // - ข้อ 3 & 3.1: เวลาจริงเกินกว่าเวลาออกงานที่ตั้งค่าไว้แล้ว (> 16:30 น.) และไม่ได้ค้างกดออกงานปกติ (หรือลงเวลาปกติครบแล้ว)
        const isBeforeAllowStart = nowMin < allowStartMin;
        const isAfterStdOut = nowMin > stdOutMin;
        const mustUseOvertimeWindow = !hasUnclosedRegular && (isBeforeAllowStart || isAfterStdOut || hasCompletedRegularToday);

        let candidateShifts = allShifts.map((s, originalIdx) => ({ ...s, originalIdx }));

        if (mustUseOvertimeWindow) {
            const otOnly = candidateShifts.filter(s => s.is_overtime || s.is_custom);
            if (otOnly.length > 0) {
                candidateShifts = otOnly;
            }
        }

        // กรองตามเวลาจริง (ข้อ 5 / 5.1 และ ข้อ 1.2 / 1.2.1) หากเปิดใช้งาน filter_shifts_by_realtime
        let timeFilteredShifts = candidateShifts.filter(s =>
            this.#isShiftActiveAtCurrentTime(s, nowMin, allowStartMin)
        );

        // กรณีกรองตามเวลาจริงแล้วไม่มีกะใดตรงเวลาปัจจุบันเลย ให้แสดงเฉพาะกะนอกเวลาหรือกะ "อื่นๆ" สำรองไว้
        if (timeFilteredShifts.length === 0) {
            timeFilteredShifts = candidateShifts;
        }

        this.availableShiftsForCurrentWindow = timeFilteredShifts;

        // เปลี่ยนชื่อหัวข้อ Dropdown ตามโหมดปัจจุบัน
        if (labelEl) {
            if (mustUseOvertimeWindow) {
                labelEl.textContent = 'เลือกช่วงเวลาปฏิบัติงานนอกเวลา';
            } else if (this.settings?.single_click_checkin) {
                labelEl.textContent = 'เลือกช่วงเวลาปฏิบัติงาน';
            } else {
                labelEl.textContent = 'เลือกช่วงเวลาทำงาน';
            }
        }

        // สร้างรายการตัวเลือกในรูปแบบ: ["ชื่อตามที่ตั้งเอาไว้" + " ('เวลาเริ่มงาน' - 'เวลาเลิกงาน')"] + "(ข้ามวัน)"
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

        const photoBadge = document.getElementById('photoRequirementBadge');
        if (this.settings.require_photo) {
            photoBadge.textContent = 'บังคับถ่ายภาพ';
            photoBadge.className = 'bma-badge bma-badge-danger';
        } else {
            photoBadge.textContent = 'ไม่บังคับถ่ายภาพ';
            photoBadge.className = 'bma-badge bma-badge-success';
        }

        const gpsBadge = document.getElementById('gpsRequirementBadge');
        if (this.settings.require_gps) {
            gpsBadge.textContent = 'บังคับเปิด GPS';
            gpsBadge.className = 'bma-badge bma-badge-danger';
        } else {
            gpsBadge.textContent = 'ไม่บังคับ GPS';
            gpsBadge.className = 'bma-badge bma-badge-success';
        }

        // สำหรับ Modal ขอลงเวลากรณีพิเศษ ให้แสดงตัวเลือกช่วงเวลาทั้งหมดในรูปแบบมาตรฐานเดียวกัน
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

    /**
     * อัปเดตการ์ดสถานะ ป้าย Tag (ย่อให้สั้นกระชับไม่ล้นกรอบ: "รูปแบบปกติ", "รูปแบบพิเศษ", "ปฏิบัติงานนอกเวลา")
     * และควบคุมปุ่มกดลงเวลาตามเงื่อนไขเวลาจริง
     */
    #updateStatusCardsAndMainButton() {
        const regularRecord = this.activeRegularRecord;
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

        const shiftIdx = parseInt(document.getElementById('checkinShiftSelect')?.value || '0', 10);
        const shiftObj = (this.settings?.work_shifts || [])[shiftIdx] || {};

        const nowMin = UIHelpers.timeToMinutes(UIHelpers.getCurrentTimeHHMM());
        const allowStartRef = UIHelpers.formatTime24(this.settings?.allow_checkin_start_time || '06:00');
        const allowStartMin = UIHelpers.timeToMinutes(allowStartRef);
        const stdOutRef = UIHelpers.formatTime24(this.settings?.standard_check_out || '16:30');
        const stdOutMin = UIHelpers.timeToMinutes(stdOutRef);

        const hasUnclosedRegular = Boolean(
            regularRecord &&
            regularRecord.check_in_time &&
            !regularRecord.check_out_time
        );

        const isBeforeAllowStart = nowMin < allowStartMin;
        const isAfterStdOut = nowMin > stdOutMin;

        // ตรวจสอบว่าเป็นโหมดปฏิบัติงานนอกเวลาหรือไม่ (ตามข้อ 3, 3.1 และ ข้อ 4)
        const isOvertimeContext = Boolean(
            shiftObj.is_overtime ||
            (!hasUnclosedRegular && (isBeforeAllowStart || isAfterStdOut))
        );

        if (shiftObj.is_custom || String(shiftObj.name || '').includes('อื่นๆ')) {
            mainCustomBox?.classList.remove('hidden');
        } else {
            mainCustomBox?.classList.add('hidden');
        }

        // แสดงป้าย Tag สั้นกระชับไม่ล้นกรอบ: "ปฏิบัติงานนอกเวลา" / "รูปแบบพิเศษ" / "รูปแบบปกติ"
        if (modeTag) {
            if (!this.settings?.single_click_checkin && hasUnclosedRegular) {
                modeTag.textContent = 'รูปแบบปกติ';
                modeTag.className = 'bma-badge bma-badge-success';
            } else if (isOvertimeContext) {
                modeTag.textContent = 'ปฏิบัติงานนอกเวลา';
                modeTag.className = 'bma-badge-pastel-purple';
            } else if (this.settings?.single_click_checkin) {
                modeTag.textContent = 'รูปแบบพิเศษ';
                modeTag.className = 'bma-badge bma-badge-indigo';
            } else {
                modeTag.textContent = 'รูปแบบปกติ';
                modeTag.className = 'bma-badge bma-badge-success';
            }
        }

        // อัปเดตการ์ดเวลาเข้า-ออกงานปกติวันนี้
        if (!regularRecord) {
            checkinTimeEl.textContent = 'ยังไม่ได้ลงเวลา';
            checkinBadgeEl.textContent = 'รอลงเวลาเข้า';
            checkinBadgeEl.className = 'bma-badge bma-badge-warning';
            checkinBadgeEl.style.backgroundColor = '';

            checkoutTimeEl.textContent = 'ยังไม่ได้ลงเวลา';
            checkoutBadgeEl.textContent = 'รอลงเวลาออก';
            checkoutBadgeEl.className = 'bma-badge bma-badge-sky';
        } else {
            const evalStatus = AttendanceModel.evaluateOfficialStatus(regularRecord, this.settings);
            checkinTimeEl.textContent = regularRecord.check_in_time ? `${UIHelpers.formatTime24(regularRecord.check_in_time)} น.` : '-';
            checkinBadgeEl.textContent = evalStatus.status_label;
            checkinBadgeEl.className = 'bma-badge text-white';
            checkinBadgeEl.style.backgroundColor = evalStatus.row_color;

            if (regularRecord.check_out_time) {
                checkoutTimeEl.textContent = `${UIHelpers.formatTime24(regularRecord.check_out_time)} น.`;
                checkoutBadgeEl.textContent = 'ลงเวลาออกงานแล้ว';
                checkoutBadgeEl.className = 'bma-badge bma-badge-success';
            } else {
                checkoutTimeEl.textContent = 'ยังไม่ได้ลงเวลาออก';
                checkoutBadgeEl.textContent = 'รอลงเวลาออกงาน';
                checkoutBadgeEl.className = 'bma-badge bma-badge-warning';
            }
        }

        // กรณีที่ 1 (ข้อ 2 & ข้อ 3.1): รูปแบบปกติ และยังไม่ได้กดบันทึกเวลาออกงานตามปกติ -> ต้องกดบันทึกเวลาออกงานก่อน!
        if (!this.settings?.single_click_checkin && hasUnclosedRegular) {
            shiftSelectorContainer?.classList.add('opacity-60', 'pointer-events-none');
            noticeBox?.classList.remove('hidden');
            const graceMin = Number(this.settings?.checkout_grace_minutes ?? 30);
            if (noticeText) {
                noticeText.textContent = `ท่านได้ลงเวลาเข้างานไว้เมื่อ ${UIHelpers.formatTime24(regularRecord.check_in_time)} น. กรุณากดบันทึกเวลาออกงานตามปกติก่อน (หากเลยเวลาเลิกงานไม่เกิน ${graceMin} นาทีจะบันทึกเวลาจริง หากเกิน ${graceMin} นาทีจะบันทึกเป็น เวลาออกงาน+${graceMin} นาที)`;
            }
            if (btnSubmitMain) btnSubmitMain.disabled = false;
            if (btnSubmitLabel) btnSubmitLabel.textContent = 'บันทึกลงเวลาออกปฏิบัติราชการ';
            return;
        }

        shiftSelectorContainer?.classList.remove('opacity-60', 'pointer-events-none');

        // กรณีที่ 2: โหมดปฏิบัติงานนอกเวลา (ก่อนเวลาเริ่มเข้างาน 06:00 น. หรือหลังเวลาเลิกงาน หรือเลือกกะนอกเวลา)
        if (isOvertimeContext) {
            noticeBox?.classList.remove('hidden');
            if (noticeText) {
                if (isBeforeAllowStart) {
                    noticeText.textContent = `ขณะนี้อยู่ก่อนเวลาเริ่มบันทึกเข้างานปกติ (${allowStartRef} น.) ระบบสลับให้เลือก "ช่วงเวลาปฏิบัติงานนอกเวลา" และบันทึกเวลารูปแบบพิเศษอัตโนมัติ`;
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

        // กรณีที่ 3: อยู่ในช่วงเวลาทำงานปกติ
        const isRegularCompletedToday = Boolean(regularRecord && regularRecord.check_in_time && regularRecord.check_out_time);
        if (isRegularCompletedToday) {
            noticeBox?.classList.remove('hidden');
            if (noticeText) {
                noticeText.textContent = `วันนี้ท่านได้ลงเวลาเข้างานและออกงานในเวลาทำการปกติครบแล้ว สามารถเลือกช่วงเวลา "ปฏิบัติงานนอกเวลา" หากต้องการลงเวลานอกเวลา`;
            }
            if (btnSubmitMain) btnSubmitMain.disabled = true;
            if (btnSubmitLabel) btnSubmitLabel.textContent = 'ลงเวลาทำการปกติของวันนี้ครบแล้ว';
        } else {
            noticeBox?.classList.add('hidden');
            if (btnSubmitMain) btnSubmitMain.disabled = false;
            if (this.settings?.single_click_checkin) {
                btnSubmitLabel.textContent = 'บันทึกลงเวลาปฏิบัติงาน (รูปแบบพิเศษ)';
            } else {
                btnSubmitLabel.textContent = 'บันทึกลงเวลาเข้าปฏิบัติราชการ';
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
        this.#stopCameraAndShowStandby();
        await this.#refreshAllAttendanceData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async #initGpsLocation() {
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

        coordsEl.textContent = 'กำลังดึงพิกัดดาวเทียม GPS...';
        locNameEl.textContent = 'กำลังค้นหาชื่อสถานที่ใกล้เคียง...';

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                this.gpsData.lat = lat;
                this.gpsData.lng = lng;
                this.gpsData.ready = true;

                coordsEl.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

                if (mapIframe) {
                    mapIframe.src = `https://maps.google.com/maps?q=${lat},${lng}&hl=th&z=17&output=embed`;
                    mapIframe.classList.remove('hidden');
                    mapPlaceholder?.classList.add('hidden');
                }

                if (mapLink) {
                    mapLink.href = `https://www.google.com/maps?q=${lat},${lng}`;
                    mapLink.classList.remove('hidden');
                }

                const resolvedPlace = await AttendanceModel.resolveLocationName(lat, lng);
                this.gpsData.locationName = resolvedPlace;
                locNameEl.textContent = resolvedPlace;
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
                timeout: 12000,
                maximumAge: 0
            }
        );
    }

    #bindEvents() {
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
                window.location.href = 'index.html';
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
    }

    async #handleMainCheckin() {
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

        const shiftIdx = parseInt(document.getElementById('checkinShiftSelect')?.value || '0', 10);
        const shiftObj = (this.settings.work_shifts || [])[shiftIdx] || {
            name: 'เวลาราชการปกติ',
            check_in: '08:30',
            check_out: '16:30',
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
        const hasUnclosedRegular = Boolean(
            this.activeRegularRecord &&
            this.activeRegularRecord.check_in_time &&
            !this.activeRegularRecord.check_out_time
        );

        const isOvertimeByTimeWindow = !hasUnclosedRegular && (nowMin < allowStartMin || nowMin > stdOutMin);
        const effectiveOvertimeShift = Boolean(shiftObj.is_overtime || isOvertimeByTimeWindow);

        UIHelpers.showLoading('กำลังบันทึกเวลาปฏิบัติราชการ...');

        try {
            let finalPhotoUrl = '';
            if (this.capturedPhotoDataUrl) {
                finalPhotoUrl = await UIHelpers.uploadPhotoToGoogleDrive(
                    this.capturedPhotoDataUrl,
                    `Checkin_${this.currentUser.username}`,
                    this.settings
                );
            }

            const res = await AttendanceModel.submitCheckinOrCheckout({
                personnel_id: this.currentUser.personnel_id,
                user_id: this.currentUser.id,
                work_date: UIHelpers.getTodayISO(),
                shift_name: formattedShiftName,
                shift_check_in: shiftObj.check_in || this.settings.standard_check_in || '08:30',
                shift_check_out: shiftObj.check_out || this.settings.standard_check_out || '16:30',
                custom_check_in_time: customCheckIn || '',
                custom_check_out_time: customCheckOut || '',
                is_overtime_shift: effectiveOvertimeShift,
                is_overnight: Boolean(shiftObj.is_overnight),
                single_click_checkin: Boolean(this.settings.single_click_checkin || effectiveOvertimeShift),
                photo_url: finalPhotoUrl,
                lat: this.gpsData.lat,
                lng: this.gpsData.lng,
                location_name: this.gpsData.locationName
            });

            UIHelpers.hideLoading();
            if (!res.success) {
                await UIHelpers.alert('ไม่สามารถลงเวลาได้', res.message, 'warning');
                return;
            }

            await this.#resetPageAfterSave();
            await UIHelpers.showToast(res.message, 'success', 3000);
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
        }
    }

    async #handleSubmitSpecialRequest(closeModalCallback) {
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

        UIHelpers.showLoading('กำลังส่งคำขอลงเวลากรณีพิเศษ...');
        try {
            let finalPhotoUrl = '';
            if (this.capturedPhotoDataUrl) {
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
                lat: this.gpsData.lat,
                lng: this.gpsData.lng,
                location_name: this.gpsData.locationName || 'ขอลงเวลากรณีพิเศษ'
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