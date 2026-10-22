/**
 * @file assets/js/controllers/CheckinController.js
 * @description คลาสควบคุมหน้าลงเวลาปฏิบัติราชการ (รองรับทั้งรูปแบบปกติ และรูปแบบพิเศษกดครั้งเดียวลงทั้งเวลาเข้าและออกงาน)
 */

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

        this.#startLiveClock();
        this.#bindEvents();

        UIHelpers.showLoading('กำลังเตรียมระบบลงเวลาปฏิบัติราชการ...');
        this.settings = await SettingsModel.getSettings(true);
        this.#renderUserAndSettingsInfo();
        await this.#refreshTodayAttendanceStatus();
        UIHelpers.hideLoading();

        // เริ่มต้นเปิดกล้องและดึงพิกัด GPS ตามการตั้งค่าระบบ
        await this.#initCamera();
        await this.#initGpsLocation();
    }

    #startLiveClock() {
        const updateClock = () => {
            const now = new Date();
            const clockEl = document.getElementById('liveClockDisplay');
            const dateEl = document.getElementById('liveDateDisplay');
            if (clockEl) {
                clockEl.textContent = now.toLocaleTimeString('th-TH', { hour12: false });
            }
            if (dateEl) {
                dateEl.textContent = now.toLocaleDateString('th-TH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    #renderUserAndSettingsInfo() {
        const org = this.settings.organization_name || 'กรุงเทพมหานคร';
        const bureau = this.settings.bureau_name || 'สำนักเทศกิจ';

        document.getElementById('checkinOrgName').textContent = org;
        document.getElementById('checkinBureauName').textContent = bureau;
        document.getElementById('footerCheckinOrg').textContent = org;
        document.getElementById('footerCheckinBureau').textContent = bureau;

        if (this.settings.logo_url) {
            document.getElementById('checkinLogoBox').innerHTML = `<img src="${this.settings.logo_url}" alt="Logo" class="w-full h-full object-contain rounded-xl bg-white p-0.5">`;
        }

        // แสดงปุ่มเข้าหลังบ้านหากเป็น SuperAdmin หรือ Admin
        if (['SuperAdmin', 'Admin'].includes(this.currentUser.role)) {
            document.getElementById('btnGoAdminDashboard')?.classList.remove('hidden');
        }

        // ข้อมูลผู้ใช้งาน
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

        // แสดงสถานะการบังคับถ่ายภาพและบังคับเปิด GPS จากตั้งค่าระบบ
        const photoBadge = document.getElementById('photoRequirementBadge');
        if (this.settings.require_photo) {
            photoBadge.textContent = 'บังคับถ่ายภาพก่อนลงเวลา';
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

        // แสดงสถานะรูปแบบการบันทึกการลงเวลา (รูปแบบปกติ vs รูปแบบพิเศษกดครั้งเดียว)
        const modeTag = document.getElementById('checkinRecordingModeTag');
        if (modeTag) {
            if (this.settings.single_click_checkin) {
                modeTag.textContent = 'รูปแบบพิเศษ (กดครั้งเดียวลงทั้งเข้าและออก)';
                modeTag.className = 'bma-badge bma-badge-indigo';
            } else {
                modeTag.textContent = 'รูปแบบปกติ (เข้า-ออกตามปกติ)';
                modeTag.className = 'bma-badge bma-badge-success';
            }
        }

        // เติมข้อมูล Dropdown ช่วงเวลาปฏิบัติราชการ และ หมายเหตุ จากเมนูตั้งค่าระบบ
        const shifts = this.settings.work_shifts || [];
        const shiftOptionsHtml = shifts.map((s, idx) =>
            `<option value="${idx}">${s.name}</option>`
        ).join('');

        document.getElementById('checkinShiftSelect').innerHTML = shiftOptionsHtml;
        document.getElementById('spShiftSelect').innerHTML = shiftOptionsHtml;

        const remarks = this.settings.remarks || [];
        document.getElementById('spRemarkSelect').innerHTML = remarks.map(r =>
            `<option value="${r}">${r}</option>`
        ).join('');

        document.getElementById('spWorkDate').value = UIHelpers.getTodayISO();
    }

    async #refreshTodayAttendanceStatus() {
        const record = await AttendanceModel.getTodayRecordForUser(
            this.currentUser.personnel_id,
            this.currentUser.id
        );

        const checkinTimeEl = document.getElementById('todayCheckinTime');
        const checkinBadgeEl = document.getElementById('todayCheckinBadge');
        const checkoutTimeEl = document.getElementById('todayCheckoutTime');
        const checkoutBadgeEl = document.getElementById('todayCheckoutBadge');
        const btnSubmitLabel = document.getElementById('btnSubmitCheckinLabel');
        const isSingleClickMode = Boolean(this.settings?.single_click_checkin);

        if (!record) {
            checkinTimeEl.textContent = 'ยังไม่ได้ลงเวลา';
            checkinBadgeEl.textContent = 'รอลงเวลาเข้า';
            checkinBadgeEl.className = 'bma-badge bma-badge-warning';

            checkoutTimeEl.textContent = 'ยังไม่ได้ลงเวลา';
            checkoutBadgeEl.textContent = 'รอลงเวลาออก';
            checkoutBadgeEl.className = 'bma-badge bma-badge-sky';

            btnSubmitLabel.textContent = isSingleClickMode
                ? 'บันทึกลงเวลาเข้าและออกงาน (ในครั้งเดียว)'
                : 'บันทึกลงเวลาเข้าปฏิบัติราชการ';
        } else {
            checkinTimeEl.textContent = record.check_in_time ? `${record.check_in_time.slice(0, 5)} น.` : '-';
            checkinBadgeEl.textContent = record.status || 'ลงเวลาแล้ว';
            checkinBadgeEl.className = 'bma-badge bma-badge-success';

            if (record.check_out_time) {
                checkoutTimeEl.textContent = `${record.check_out_time.slice(0, 5)} น.`;
                checkoutBadgeEl.textContent = 'ลงเวลาออกแล้ว';
                checkoutBadgeEl.className = 'bma-badge bma-badge-success';
                btnSubmitLabel.textContent = isSingleClickMode
                    ? 'อัปเดตเวลาเข้าและออกงานอีกครั้ง (ในครั้งเดียว)'
                    : 'อัปเดตเวลาออกปฏิบัติราชการอีกครั้ง';
            } else {
                checkoutTimeEl.textContent = 'ยังไม่ได้ลงเวลาออก';
                checkoutBadgeEl.textContent = 'รอลงเวลาออก';
                checkoutBadgeEl.className = 'bma-badge bma-badge-warning';
                btnSubmitLabel.textContent = isSingleClickMode
                    ? 'บันทึกลงเวลาเข้าและออกงาน (ในครั้งเดียว)'
                    : 'บันทึกลงเวลาออกปฏิบัติราชการ';
            }
        }
    }

    /**
     * เริ่มต้นเปิดกล้องถ่ายรูป (บังคับเปิดกล้องเมื่อตั้งค่าระบบกำหนดไว้)
     */
    async #initCamera() {
        const video = document.getElementById('cameraVideoStream');
        const overlay = document.getElementById('cameraStatusOverlay');
        const msgEl = document.getElementById('cameraStatusMessage');

        try {
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
            }
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 360 } },
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
     * ถ่ายภาพจากกล้อง และสลับปุ่มเป็น "ถ่ายใหม่อีกครั้ง"
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

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        this.capturedPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.72);
        preview.src = this.capturedPhotoDataUrl;

        video.classList.add('hidden');
        preview.classList.remove('hidden');
        btnCapture.classList.add('hidden');
        btnRetake.classList.remove('hidden');
    }

    /**
     * กดปุ่ม "ถ่ายใหม่อีกครั้ง" เพื่อล้างภาพเดิมและเปิดกล้องสดใหม่
     */
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
     * ดึงพิกัดและชื่อสถานที่จาก GPS (หากไม่เปิด GPS ระบบจะแจ้งเตือนและบังคับเปิด GPS)
     */
    async #initGpsLocation() {
        const coordsEl = document.getElementById('gpsCoordsText');
        const locNameEl = document.getElementById('gpsLocationNameText');
        const mapLink = document.getElementById('linkViewGoogleMap');

        if (!navigator.geolocation) {
            coordsEl.textContent = 'อุปกรณ์ไม่รองรับ GPS';
            locNameEl.textContent = 'ไม่สามารถระบุสถานที่ได้';
            if (this.settings.require_gps) {
                await UIHelpers.alert('อุปกรณ์ไม่รองรับ GPS', 'กรุณาใช้อุปกรณ์ที่รองรับการระบุตำแหน่งพิกัด GPS', 'error');
            }
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
                const resolvedPlace = await AttendanceModel.resolveLocationName(lat, lng);
                this.gpsData.locationName = resolvedPlace;
                locNameEl.textContent = resolvedPlace;

                if (mapLink) {
                    mapLink.href = `https://www.google.com/maps?q=${lat},${lng}`;
                    mapLink.classList.remove('hidden');
                }
            },
            async (err) => {
                console.warn('Geolocation error:', err);
                this.gpsData.ready = false;
                coordsEl.textContent = 'ไม่ได้เปิดการใช้งาน GPS';
                locNameEl.textContent = 'กรุณาเปิดบริการตำแหน่งที่ตั้ง (Location Services)';

                if (this.settings.require_gps) {
                    await UIHelpers.alert(
                        'กรุณาเปิดการใช้งานตำแหน่งที่ตั้ง (GPS)',
                        'ระบบบังคับให้ต้องเปิด GPS เพื่อระบุพิกัดและชื่อสถานที่ก่อนบันทึกลงเวลาปฏิบัติราชการ กรุณาอนุญาตการเข้าถึงตำแหน่งแล้วกดปุ่ม "ตรวจสอบพิกัด GPS อีกครั้ง"',
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
        // สลับโหมดสี
        document.getElementById('btnCheckinTheme')?.addEventListener('click', () => {
            const mode = UIHelpers.toggleTheme();
            const icon = document.getElementById('checkinThemeIcon');
            if (icon) {
                icon.className = mode === 'dark' ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-emerald-800';
            }
        });

        // ออกจากระบบ
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

        // ปุ่มถ่ายภาพ และ ถ่ายใหม่อีกครั้ง
        document.getElementById('btnCapturePhoto')?.addEventListener('click', () => this.#capturePhoto());
        document.getElementById('btnRetakePhoto')?.addEventListener('click', () => this.#retakePhoto());

        // ปุ่มรีเฟรชพิกัด GPS
        document.getElementById('btnRefreshGps')?.addEventListener('click', () => this.#initGpsLocation());

        // ตรวจสอบกรณีเลือกช่วงเวลาในหน้าหลักเป็น "อื่นๆ" ให้แสดงช่องกรอกเวลาเข้างานและเวลาออกงานเอง
        document.getElementById('checkinShiftSelect')?.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value, 10);
            const selectedShift = (this.settings.work_shifts || [])[idx];
            const mainCustomBox = document.getElementById('mainCustomTimeContainer');
            if (selectedShift && (selectedShift.is_custom || selectedShift.name.includes('อื่นๆ'))) {
                mainCustomBox.classList.remove('hidden');
            } else {
                mainCustomBox.classList.add('hidden');
            }
        });

        // ปุ่มบันทึกลงเวลาหลัก
        document.getElementById('btnSubmitCheckinMain')?.addEventListener('click', () => this.#handleMainCheckin());

        // Modal ขอลงเวลากรณีพิเศษ
        const modalSpecial = document.getElementById('modalSpecialRequest');
        const closeSpecialModal = () => modalSpecial?.classList.add('hidden');

        document.getElementById('btnOpenSpecialRequestModal')?.addEventListener('click', () => {
            modalSpecial?.classList.remove('hidden');
        });
        document.getElementById('btnCloseSpecialModal')?.addEventListener('click', closeSpecialModal);
        document.getElementById('btnCancelSpecialModal')?.addEventListener('click', closeSpecialModal);

        // ตรวจสอบกรณีเลือกช่วงเวลาใน Modal พิเศษเป็น "อื่นๆ"
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

        // ส่งคำขอลงเวลากรณีพิเศษ
        document.getElementById('formSpecialRequest')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.#handleSubmitSpecialRequest(closeSpecialModal);
        });
    }

    /**
     * ประมวลผลการกดปุ่มบันทึกลงเวลาปฏิบัติราชการ
     * รองรับทั้งรูปแบบปกติ และรูปแบบพิเศษ (กดครั้งเดียวลงทั้งเวลาเข้างานและออกงาน)
     */
    async #handleMainCheckin() {
        if (this.settings.require_photo && !this.capturedPhotoDataUrl) {
            await UIHelpers.alert(
                'กรุณาถ่ายภาพก่อนลงเวลา',
                'ระบบเปิดใช้งานการบังคับถ่ายภาพ กรุณากดปุ่ม "ถ่ายภาพ" เพื่อยืนยันตัวตนก่อนบันทึกลงเวลาปฏิบัติราชการ',
                'warning'
            );
            return;
        }

        if (this.settings.require_gps && !this.gpsData.ready) {
            await UIHelpers.alert(
                'กรุณาเปิด GPS ก่อนลงเวลา',
                'ระบบเปิดใช้งานการบังคับระบุตำแหน่งสถานที่จาก GPS กรุณาเปิด GPS บนอุปกรณ์แล้วกดปุ่ม "ตรวจสอบพิกัด GPS อีกครั้ง"',
                'warning'
            );
            return;
        }

        const shiftIdx = parseInt(document.getElementById('checkinShiftSelect')?.value || '0', 10);
        const shiftObj = (this.settings.work_shifts || [])[shiftIdx] || {
            name: 'เวลาราชการปกติ (08:30 - 16:30)',
            check_in: '08:30',
            check_out: '16:30',
            is_custom: false
        };

        const isCustomShift = Boolean(shiftObj.is_custom || shiftObj.name.includes('อื่นๆ'));
        const customCheckIn = isCustomShift ? document.getElementById('mainCustomCheckin')?.value : '';
        const customCheckOut = isCustomShift ? document.getElementById('mainCustomCheckout')?.value : '';

        UIHelpers.showLoading(
            this.settings.single_click_checkin
                ? 'กำลังบันทึกทั้งเวลาเข้างานและเวลาออกงานในครั้งเดียว...'
                : 'กำลังบันทึกเวลาปฏิบัติราชการลงฐานข้อมูล...'
        );

        try {
            const res = await AttendanceModel.submitCheckinOrCheckout({
                personnel_id: this.currentUser.personnel_id,
                user_id: this.currentUser.id,
                work_date: UIHelpers.getTodayISO(),
                shift_name: shiftObj.name,
                shift_check_in: shiftObj.check_in || '08:30',
                shift_check_out: shiftObj.check_out || '16:30',
                custom_check_in_time: customCheckIn || '',
                custom_check_out_time: customCheckOut || '',
                single_click_checkin: Boolean(this.settings.single_click_checkin),
                photo_data: this.capturedPhotoDataUrl,
                lat: this.gpsData.lat,
                lng: this.gpsData.lng,
                location_name: this.gpsData.locationName
            });

            UIHelpers.hideLoading();
            if (!res.success) {
                await UIHelpers.alert('บันทึกลงเวลาไม่สำเร็จ', res.message, 'error');
                return;
            }

            await this.#refreshTodayAttendanceStatus();
            await UIHelpers.alert('บันทึกลงเวลาสำเร็จ', res.message, 'success');
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
        }
    }

    /**
     * ประมวลผลการส่งคำขอลงเวลากรณีพิเศษ
     */
    async #handleSubmitSpecialRequest(closeModalCallback) {
        const workDate = document.getElementById('spWorkDate').value;
        const shiftIdx = parseInt(document.getElementById('spShiftSelect').value || '0', 10);
        const shiftObj = (this.settings.work_shifts || [])[shiftIdx] || {
            name: 'เวลาราชการปกติ (08:30 - 16:30)',
            check_in: '08:30',
            check_out: '16:30',
            is_custom: false
        };
        const remark = document.getElementById('spRemarkSelect').value;

        let checkInTime = shiftObj.check_in || '08:30';
        let checkOutTime = shiftObj.check_out || '16:30';

        if (shiftObj.is_custom || shiftObj.name.includes('อื่นๆ')) {
            checkInTime = document.getElementById('spCustomCheckin').value || '08:30';
            checkOutTime = document.getElementById('spCustomCheckout').value || '16:30';
        }

        UIHelpers.showLoading('กำลังส่งคำขอลงเวลากรณีพิเศษ...');
        try {
            const res = await AttendanceModel.submitSpecialRequest({
                personnel_id: this.currentUser.personnel_id,
                user_id: this.currentUser.id,
                work_date: workDate,
                shift_name: shiftObj.name,
                check_in_time: checkInTime,
                check_out_time: checkOutTime,
                remark,
                photo_data: this.capturedPhotoDataUrl,
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
            await UIHelpers.alert('ส่งคำขอสำเร็จ', res.message, 'success');
        } catch (err) {
            UIHelpers.hideLoading();
            await UIHelpers.alert('เกิดข้อผิดพลาด', err.message, 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CheckinController();
});