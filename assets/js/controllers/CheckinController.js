/**
 * @file assets/js/controllers/CheckinController.js
 * @description คลาสควบคุมหน้าลงเวลาปฏิบัติราชการ (ป้องกันกล้องทำงานตลอดเวลา: เริ่มต้นปิดกล้อง -> กดเปิดกล้องเพื่อถ่ายรูป -> บันทึกเสร็จกลับมาปิดกล้อง)
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
        this.activeHistoryTab = 'today';
        this.todayHistoryList = [];
        this.pastHistoryList = [];
        this.pastPageSize = 5;
        this.pastCurrentPage = 1;
        this.specialRequestsList = [];
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

        // ป้องกันกล้องทำงานตลอดเวลา: ทุกครั้งที่เข้ามาให้ปิดกล้องไว้ก่อนเสมอ
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
        };
        updateClock();
        setInterval(updateClock, 1000);
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
            photoBadge.textContent = 'บังคับถ่ายภาพ 3:4';
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

        const shifts = this.settings.work_shifts || [];
        const shiftOptionsHtml = shifts.map((s, idx) => {
            const otLabel = s.is_overtime ? ' [ปฏิบัติงานนอกเวลา]' : '';
            const overnightLabel = s.is_overnight ? ' (ข้ามวัน)' : '';
            return `<option value="${idx}">${s.name}${otLabel}${overnightLabel}</option>`;
        }).join('');

        document.getElementById('checkinShiftSelect').innerHTML = shiftOptionsHtml;
        document.getElementById('spShiftSelect').innerHTML = shiftOptionsHtml;

        const remarks = this.settings.remarks || [];
        document.getElementById('spRemarkSelect').innerHTML = remarks.map(r =>
            `<option value="${r}">${r}</option>`
        ).join('');

        document.getElementById('spWorkDate').value = UIHelpers.getTodayISO();
    }

    async #refreshAllAttendanceData() {
        const todayIso = UIHelpers.getTodayISO();
        const [regularRecord, allHistory, specialRequests] = await Promise.all([
            AttendanceModel.getTodayRegularRecordForUser(this.currentUser.personnel_id, this.currentUser.id, todayIso),
            AttendanceModel.getPersonalAttendanceHistory(this.currentUser.personnel_id, this.currentUser.id, 150),
            AttendanceModel.getPersonalSpecialRequests(this.currentUser.personnel_id, this.currentUser.id)
        ]);

        this.todayHistoryList = allHistory.filter(item => item.work_date === todayIso);
        this.pastHistoryList = allHistory.filter(item => item.work_date !== todayIso);
        this.specialRequestsList = specialRequests;

        this.#updateStatusCardsAndMainButton(regularRecord);
        this.#renderPersonalAttendanceTabs();
        this.#renderSpecialRequestsHistoryTable();
    }

    #updateStatusCardsAndMainButton(regularRecord) {
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

        const shiftIdx = parseInt(document.getElementById('checkinShiftSelect')?.value || '0', 10);
        const shiftObj = (this.settings?.work_shifts || [])[shiftIdx] || {};
        const isOvertimeShift = Boolean(shiftObj.is_overtime);
        const isSingleClick = Boolean(this.settings?.single_click_checkin || isOvertimeShift);
        const shiftStartRef = UIHelpers.formatTime24(shiftObj.check_in || this.settings?.standard_check_in || '08:30');
        const shiftEndRef = UIHelpers.formatTime24(shiftObj.check_out || this.settings?.standard_check_out || '16:30');

        if (shiftObj.is_custom || String(shiftObj.name || '').includes('อื่นๆ')) {
            mainCustomBox?.classList.remove('hidden');
        } else {
            mainCustomBox?.classList.add('hidden');
        }

        if (isOvertimeShift) {
            if (modeTag) {
                modeTag.textContent = 'ปฏิบัติงานนอกเวลา (ลงได้หลายครั้ง ไม่ซ้ำช่วงเวลา)';
                modeTag.className = 'bma-badge-pastel-purple';
            }
        } else if (this.settings?.single_click_checkin) {
            if (modeTag) {
                modeTag.textContent = `รูปแบบพิเศษ (บันทึกเวลา ${shiftStartRef} - ${shiftEndRef} น.)`;
                modeTag.className = 'bma-badge bma-badge-indigo';
            }
        } else {
            if (modeTag) {
                modeTag.textContent = 'เวลาทำการปกติ (เข้าและออกได้ครั้งเดียวต่อวัน)';
                modeTag.className = 'bma-badge bma-badge-success';
            }
        }

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

        if (isOvertimeShift) {
            noticeBox?.classList.add('hidden');
            if (btnSubmitMain) btnSubmitMain.disabled = false;
            if (btnSubmitLabel) {
                btnSubmitLabel.textContent = `บันทึกลงเวลาปฏิบัติงานนอกเวลา (${shiftStartRef} - ${shiftEndRef} น.)`;
            }
        } else {
            const isRegularCompletedToday = Boolean(regularRecord && regularRecord.check_in_time && regularRecord.check_out_time);
            if (isRegularCompletedToday) {
                noticeBox?.classList.remove('hidden');
                if (noticeText) {
                    noticeText.textContent = `วันนี้ท่านได้ลงเวลาเข้างานและออกงานในเวลาทำการปกติครบ 1 ครั้งแล้ว จะสามารถเริ่มลงเวลาเข้างานได้อีกครั้งในเวลา ${shiftStartRef} น. ของวันถัดไป (หากต้องการลงเวลานอกเวลา กรุณาเลือกช่วงเวลา "ปฏิบัติงานนอกเวลา" ในช่องด้านบน)`;
                }
                if (btnSubmitMain) btnSubmitMain.disabled = true;
                if (btnSubmitLabel) btnSubmitLabel.textContent = 'ลงเวลาทำการปกติของวันนี้ครบแล้ว';
            } else {
                noticeBox?.classList.add('hidden');
                if (btnSubmitMain) btnSubmitMain.disabled = false;
                if (!regularRecord) {
                    btnSubmitLabel.textContent = isSingleClick
                        ? `บันทึกลงเวลารูปแบบพิเศษ (${shiftStartRef} - ${shiftEndRef} น.)`
                        : 'บันทึกลงเวลาเข้าปฏิบัติราชการ';
                } else {
                    btnSubmitLabel.textContent = 'บันทึกลงเวลาออกปฏิบัติราชการ';
                }
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

    // ========================================================================
    // ระบบควบคุมการเปิด/ปิดกล้อง (ป้องกันกล้องทำงานตลอดเวลา)
    // ========================================================================

    /**
     * หยุดการทำงานของสตรีมกล้องทันที (ตัดไฟสถานะกล้อง)
     */
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

    /**
     * ปิดกล้องและแสดงหน้าจอพัก (Standby) เพื่อรอให้ผู้ใช้กดเปิดกล้องเองเมื่อต้องการถ่ายรูป
     */
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

    /**
     * เปิดกล้องเมื่อผู้ใช้กดปุ่ม "เปิดกล้องเพื่อถ่ายรูป" เท่านั้น
     */
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

    /**
     * กดปุ่มถ่ายภาพ -> บันทึกภาพลงตัวแปร และสั่งหยุดสตรีมกล้องทันทีเพื่อไม่ให้กล้องทำงานค้างไว้
     */
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

        // ปิดสตรีมกล้องทันทีหลังจากได้ภาพถ่ายแล้ว
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

    /**
     * รีเซ็ตและกลับมาปิดกล้องทันทีเมื่อบันทึกเวลาเสร็จสิ้น
     */
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
        locNameEl.textContent = 'กำลังค้นหาชื่อสถานที่...';

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

        // ปุ่มเปิดกล้อง, ปุ่มถ่ายภาพ, ปุ่มปิดกล้อง, และปุ่มถ่ายใหม่อีกครั้ง
        document.getElementById('btnStartCameraOverlay')?.addEventListener('click', () => this.#openCameraOnDemand());
        document.getElementById('btnStartCameraBottom')?.addEventListener('click', () => this.#openCameraOnDemand());
        document.getElementById('btnCapturePhoto')?.addEventListener('click', () => this.#capturePhotoAndStopStream());
        document.getElementById('btnStopCamera')?.addEventListener('click', () => this.#stopCameraAndShowStandby());
        document.getElementById('btnRetakePhoto')?.addEventListener('click', () => this.#openCameraOnDemand());

        document.getElementById('btnRefreshGps')?.addEventListener('click', () => this.#initGpsLocation());

        document.getElementById('checkinShiftSelect')?.addEventListener('change', () => {
            this.#refreshAllAttendanceData();
        });

        document.getElementById('btnSubmitCheckinMain')?.addEventListener('click', () => this.#handleMainCheckin());

        // สลับแท็บตารางประวัติส่วนตัว
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
            name: 'เวลาราชการปกติ (08:30 - 16:30)',
            check_in: '08:30',
            check_out: '16:30',
            is_custom: false,
            is_overtime: false,
            is_overnight: false
        };

        const isCustomShift = Boolean(shiftObj.is_custom || shiftObj.name.includes('อื่นๆ'));
        const customCheckIn = isCustomShift ? UIHelpers.formatTime24(document.getElementById('mainCustomCheckin')?.value) : '';
        const customCheckOut = isCustomShift ? UIHelpers.formatTime24(document.getElementById('mainCustomCheckout')?.value) : '';

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
                shift_name: shiftObj.name,
                shift_check_in: shiftObj.check_in || this.settings.standard_check_in || '08:30',
                shift_check_out: shiftObj.check_out || this.settings.standard_check_out || '16:30',
                custom_check_in_time: customCheckIn || '',
                custom_check_out_time: customCheckOut || '',
                is_overtime_shift: Boolean(shiftObj.is_overtime),
                is_overnight: Boolean(shiftObj.is_overnight),
                single_click_checkin: Boolean(this.settings.single_click_checkin || shiftObj.is_overtime),
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

            // เมื่อบันทึกเสร็จ ให้กลับมาปิดกล้องและรีเฟรชข้อมูลทันที
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
            name: 'เวลาราชการปกติ (08:30 - 16:30)',
            check_in: '08:30',
            check_out: '16:30',
            is_custom: false,
            is_overtime: false
        };
        const remark = document.getElementById('spRemarkSelect').value;

        let checkInTime = shiftObj.check_in || this.settings.standard_check_in || '08:30';
        let checkOutTime = shiftObj.check_out || this.settings.standard_check_out || '16:30';

        if (shiftObj.is_custom || shiftObj.name.includes('อื่นๆ')) {
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
                shift_name: shiftObj.name,
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