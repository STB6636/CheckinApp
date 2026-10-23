/**
 * @file assets/js/controllers/CheckinController.js
 * @description คลาสควบคุมหน้าลงเวลาปฏิบัติราชการ (กล้อง 3:4, Google Drive URL, Google Map สด, นอกเวลาราชการ, ตารางประวัติส่วนตัว)
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
        this.capturedPhotoDataUrl = '';
        this.gpsData = {
            ready: false,
            lat: null,
            lng: null,
            locationName: ''
        };
        this.init();
    }

    async init() {
        UIHelpers.initTheme();
        this.currentUser = AuthService.requireAuth(['SuperAdmin', 'Admin', 'User']);
        if (!this.currentUser) return;

        // ตรวจสอบและแสดง Popup "ยินดีต้อนรับคุณ [ชื่อ + นามสกุล]" สัก 2-3 วินาทีแล้วหายไป
        this.#checkAndShowWelcomeToast();

        this.#startLiveClock24();
        this.#bindEvents();

        UIHelpers.showLoading('กำลังเตรียมระบบลงเวลาปฏิบัติราชการ...');
        this.settings = await SettingsModel.getSettings(true);
        this.#renderUserAndSettingsInfo();
        await this.#refreshTodayAttendanceAndHistory();
        UIHelpers.hideLoading();

        await this.#initCamera();
        await this.#initGpsLocation();
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

    /**
     * นาฬิกาดิจิทัลรูปแบบ 24 ชั่วโมง และวันที่แบบไทยย่อ เช่น "15 ม.ค. 69"
     */
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

        // เติมข้อมูล Dropdown ช่วงเวลาปฏิบัติราชการ (แสดงป้ายกำกับกะนอกเวลาและกะข้ามวันชัดเจน)
        const shifts = this.settings.work_shifts || [];
        const shiftOptionsHtml = shifts.map((s, idx) => {
            const otLabel = s.is_overtime ? ' [นอกเวลาราชการ]' : '';
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
        this.#updateSelectedShiftModeUI();
    }

    /**
     * อัปเดตป้ายบอกรูปแบบการลงเวลาและปุ่มกดเมื่อเปลี่ยนช่วงเวลาใน Dropdown
     */
    #updateSelectedShiftModeUI() {
        const shiftIdx = parseInt(document.getElementById('checkinShiftSelect')?.value || '0', 10);
        const shiftObj = (this.settings?.work_shifts || [])[shiftIdx] || {};
        const modeTag = document.getElementById('checkinRecordingModeTag');
        const btnLabel = document.getElementById('btnSubmitCheckinLabel');
        const mainCustomBox = document.getElementById('mainCustomTimeContainer');

        if (shiftObj.is_custom || String(shiftObj.name || '').includes('อื่นๆ')) {
            mainCustomBox?.classList.remove('hidden');
        } else {
            mainCustomBox?.classList.add('hidden');
        }

        if (shiftObj.is_overtime) {
            if (modeTag) {
                modeTag.textContent = 'ปฏิบัติงานนอกเวลาราชการ (คลิกครั้งเดียวเข้า-เลิกงาน)';
                modeTag.className = 'bma-badge bma-badge-indigo';
            }
            if (btnLabel) {
                btnLabel.textContent = `ลงเวลาปฏิบัติงานนอกเวลาราชการ (${shiftObj.check_in} - ${shiftObj.check_out} น.)`;
            }
        } else if (this.settings?.single_click_checkin) {
            if (modeTag) {
                modeTag.textContent = 'รูปแบบพิเศษ (คลิกครั้งเดียวลงทั้งเข้าและเลิกงาน)';
                modeTag.className = 'bma-badge bma-badge-indigo';
            }
        } else {
            if (modeTag) {
                modeTag.textContent = 'รูปแบบปกติ (ลงเวลาเข้าและเลิกงานตามปกติ)';
                modeTag.className = 'bma-badge bma-badge-success';
            }
        }
    }

    async #refreshTodayAttendanceAndHistory() {
        const [regularRecord, historyList] = await Promise.all([
            AttendanceModel.getTodayRegularRecordForUser(this.currentUser.personnel_id, this.currentUser.id),
            AttendanceModel.getPersonalAttendanceHistory(this.currentUser.personnel_id, this.currentUser.id, 30)
        ]);

        const checkinTimeEl = document.getElementById('todayCheckinTime');
        const checkinBadgeEl = document.getElementById('todayCheckinBadge');
        const checkoutTimeEl = document.getElementById('todayCheckoutTime');
        const checkoutBadgeEl = document.getElementById('todayCheckoutBadge');
        const btnSubmitLabel = document.getElementById('btnSubmitCheckinLabel');

        const shiftIdx = parseInt(document.getElementById('checkinShiftSelect')?.value || '0', 10);
        const shiftObj = (this.settings?.work_shifts || [])[shiftIdx] || {};
        const isSingleClick = Boolean(this.settings?.single_click_checkin || shiftObj.is_overtime);

        if (!regularRecord) {
            checkinTimeEl.textContent = 'ยังไม่ได้ลงเวลา';
            checkinBadgeEl.textContent = 'รอลงเวลาเข้า';
            checkinBadgeEl.className = 'bma-badge bma-badge-warning';

            checkoutTimeEl.textContent = 'ยังไม่ได้ลงเวลา';
            checkoutBadgeEl.textContent = 'รอลงเวลาออก';
            checkoutBadgeEl.className = 'bma-badge bma-badge-sky';

            if (!shiftObj.is_overtime) {
                btnSubmitLabel.textContent = isSingleClick
                    ? 'บันทึกลงเวลาเข้าและเลิกงาน (ในครั้งเดียว)'
                    : 'บันทึกลงเวลาเข้าปฏิบัติราชการ';
            }
        } else {
            const evalStatus = AttendanceModel.evaluateOfficialStatus(regularRecord, this.settings);
            checkinTimeEl.textContent = regularRecord.check_in_time ? `${UIHelpers.formatTime24(regularRecord.check_in_time)} น.` : '-';
            checkinBadgeEl.textContent = evalStatus.status_label;
            checkinBadgeEl.className = 'bma-badge text-white';
            checkinBadgeEl.style.backgroundColor = evalStatus.row_color;

            if (regularRecord.check_out_time) {
                checkoutTimeEl.textContent = `${UIHelpers.formatTime24(regularRecord.check_out_time)} น.`;
                checkoutBadgeEl.textContent = 'ลงเวลาเลิกงานแล้ว';
                checkoutBadgeEl.className = 'bma-badge bma-badge-success';
                if (!shiftObj.is_overtime) {
                    btnSubmitLabel.textContent = 'บันทึกลงเวลาปฏิบัติงานนอกเวลาราชการ (หลังเลิกงาน)';
                }
            } else {
                checkoutTimeEl.textContent = 'ยังไม่ได้ลงเวลาออก';
                checkoutBadgeEl.textContent = 'รอลงเวลาเลิกงาน';
                checkoutBadgeEl.className = 'bma-badge bma-badge-warning';
                if (!shiftObj.is_overtime) {
                    btnSubmitLabel.textContent = isSingleClick
                        ? 'บันทึกลงเวลาเข้าและเลิกงาน (ในครั้งเดียว)'
                        : 'บันทึกลงเวลาเลิกงาน';
                }
            }
        }

        this.#renderPersonalHistoryTable(historyList);
    }

    /**
     * เรนเดอร์ตารางประวัติการลงเวลาส่วนตัวด้านล่างหน้าลงเวลา
     */
    #renderPersonalHistoryTable(historyList) {
        const tbody = document.getElementById('personalHistoryTableBody');
        if (!tbody) return;

        if (!historyList || historyList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 bma-text-sub">ยังไม่มีประวัติการลงเวลาปฏิบัติราชการ</td></tr>`;
            return;
        }

        tbody.innerHTML = historyList.map((item, idx) => `
            <tr>
                <td class="text-center font-semibold">${idx + 1}</td>
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
        `).join('');
    }

    async #initCamera() {
        const video = document.getElementById('cameraVideoStream');
        const overlay = document.getElementById('cameraStatusOverlay');
        const msgEl = document.getElementById('cameraStatusMessage');

        try {
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
            }
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
                audio: false
            });
            video.srcObject = this.mediaStream;
            overlay.classList.add('hidden');
        } catch (err) {
            console.warn('Camera access error:', err);
            overlay.classList.remove('hidden');
            msgEl.textContent = 'ไม่สามารถเข้าถึงกล้องถ่ายรูปได้ กรุณาอนุญาตการใช้กล้องบนเบราว์เซอร์';
            if (this.settings.require_photo) {
                await UIHelpers.alert(
                    'แจ้งเตือนการเปิดกล้องถ่ายรูป',
                    'ระบบกำหนดให้ต้องเปิดกล้องและถ่ายภาพยืนยันตัวตนก่อนบันทึกลงเวลา กรุณาอนุญาตการใช้งานกล้อง',
                    'warning'
                );
            }
        }
    }

    /**
     * ถ่ายภาพแนวตั้ง อัตราส่วน 3:4 ขนาดเล็กคมชัดสูง
     */
    #capturePhoto() {
        const video = document.getElementById('cameraVideoStream');
        const canvas = document.getElementById('cameraCaptureCanvas');
        const preview = document.getElementById('capturedPhotoPreview');
        const btnCapture = document.getElementById('btnCapturePhoto');
        const btnRetake = document.getElementById('btnRetakePhoto');

        if (!video.srcObject) {
            UIHelpers.alert('กล้องยังไม่พร้อมใช้งาน', 'กรุณาอนุญาตให้เบราว์เซอร์เปิดกล้องก่อนถ่ายภาพ', 'warning');
            return;
        }

        this.capturedPhotoDataUrl = UIHelpers.capturePortrait3x4FromVideo(video, canvas);
        preview.src = this.capturedPhotoDataUrl;

        video.classList.add('hidden');
        preview.classList.remove('hidden');
        btnCapture.classList.add('hidden');
        btnRetake.classList.remove('hidden');
    }

    #retakePhoto() {
        const video = document.getElementById('cameraVideoStream');
        const preview = document.getElementById('capturedPhotoPreview');
        const btnCapture = document.getElementById('btnCapturePhoto');
        const btnRetake = document.getElementById('btnRetakePhoto');

        this.capturedPhotoDataUrl = '';
        preview.src = '';
        preview.classList.add('hidden');
        video.classList.remove('hidden');
        btnRetake.classList.add('hidden');
        btnCapture.classList.remove('hidden');
    }

    /**
     * ดึงพิกัด GPS, แสดงชื่อสถานที่ (ตรงจุด หรือ "ใกล้เคียง ...") และเรนเดอร์แผนที่ Google Map จริง
     */
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

                // แสดงแผนที่ Google Map จริงปักหมุดพิกัดปัจจุบันทันที
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
            const mode = UIHelpers.toggleTheme();
            const icon = document.getElementById('checkinThemeIcon');
            if (icon) {
                icon.className = mode === 'dark' ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-emerald-800';
            }
        });

        document.getElementById('btnCheckinLogout')?.addEventListener('click', async () => {
            const confirmed = await UIHelpers.confirm(
                'ยืนยันการออกจากระบบ',
                'คุณต้องการออกจากระบบลงเวลาปฏิบัติราชการใช่หรือไม่?',
                'ออกจากระบบ',
                'question'
            );
            if (confirmed) {
                if (this.mediaStream) {
                    this.mediaStream.getTracks().forEach(t => t.stop());
                }
                AuthService.clearSession();
                window.location.href = 'index.html';
            }
        });

        document.getElementById('btnCapturePhoto')?.addEventListener('click', () => this.#capturePhoto());
        document.getElementById('btnRetakePhoto')?.addEventListener('click', () => this.#retakePhoto());
        document.getElementById('btnRefreshGps')?.addEventListener('click', () => this.#initGpsLocation());
        document.getElementById('btnRefreshPersonalHistory')?.addEventListener('click', () => this.#refreshTodayAttendanceAndHistory());

        document.getElementById('checkinShiftSelect')?.addEventListener('change', () => {
            this.#updateSelectedShiftModeUI();
            this.#refreshTodayAttendanceAndHistory();
        });

        document.getElementById('btnSubmitCheckinMain')?.addEventListener('click', () => this.#handleMainCheckin());

        // Modal ขอลงเวลากรณีพิเศษ
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
                'กรุณาถ่ายภาพก่อนลงเวลา',
                'ระบบเปิดใช้งานการบังคับถ่ายภาพ กรุณากดปุ่ม "ถ่ายภาพ" เพื่อยืนยันตัวตนก่อนบันทึกลงเวลา',
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

        UIHelpers.showLoading('กำลังอัปโหลดภาพถ่ายและบันทึกเวลาปฏิบัติราชการ...');

        try {
            // 1. อัปโหลดรูปถ่ายแนวตั้ง 3:4 ที่บีบอัดแล้วไปยัง Google Drive เพื่อเก็บเฉพาะ URL ลงใน Supabase
            let finalPhotoUrl = '';
            if (this.capturedPhotoDataUrl) {
                finalPhotoUrl = await UIHelpers.uploadPhotoToGoogleDrive(
                    this.capturedPhotoDataUrl,
                    `Checkin_${this.currentUser.username}`,
                    this.settings
                );
            }

            // 2. บันทึกข้อมูลการลงเวลาลงฐานข้อมูล Supabase
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
                await UIHelpers.alert('บันทึกลงเวลาไม่สำเร็จ', res.message, 'warning');
                return;
            }

            await this.#refreshTodayAttendanceAndHistory();
            await UIHelpers.showToast(res.message, 'success', 3000);
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
        }
    }

    /**
     * ส่งคำขอลงเวลากรณีพิเศษ (บันทึกทั้งเวลาเข้าและเลิกงานอัตโนมัติ และได้สถานะตามช่วงเวลาที่เลือก)
     */
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
            await this.#refreshTodayAttendanceAndHistory();
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