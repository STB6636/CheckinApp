/**
 * @file assets/js/controllers/CheckinController.js
 * @description คลาสควบคุมหน้าลงเวลาปฏิบัติราชการ (รองรับการค้นหาสถานที่ใกล้เคียงสถาปัตยกรรม 5-Tier Nearby Places Resolution พร้อมปรับซูมแผนที่อัตโนมัติ)
 */

import { Config } from '../core/Config.js';
import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { AttendanceModel } from '../models/AttendanceModel.js';
import { DatabaseService } from '../core/DatabaseService.js';

export class CheckinController {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.mediaStream = null;
        this.isCameraRunning = false;
        this.capturedPhotoDataUrl = '';
        this.isResolvingLocation = false;
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
        this.currentStep = 1;
        this.locationMode = 'ONSITE';
        this.geofenceResult = null;
        this.selectedOffsiteRemark = 'ปฏิบัติงานนอกสถานที่';
        this.selectedOffsiteGpsSource = 'current';
        this.offsiteCustomGps = {
            mode: 'current',
            lat: null,
            lng: null,
            locationName: ''
        };
        this.offsiteLeafletMap = null;
        this.offsiteMarker = null;
        this.tempOffsiteLocation = null;
        this.viewGpsLeafletMap = null;
        this.viewGpsLeafletMarker = null;
        this.inlineGpsMap = null;
        this.inlineUserMarker = null;
        this.inlineOfficeMarker = null;
        this.inlineRadiusCircle = null;
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
            this.settings = await SettingsModel.getSettings(true);
            this.#renderUserAndSettingsInfo();
            this.#initModeSwitcher();
            this.#initOffsiteModalGps();
            this.#initViewGpsMapModal();
            this.#renderGeofenceStatusUI();
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

        this.#initRealtimeSettingsListener();
        document.addEventListener('visibilitychange', async () => {
            if (!document.hidden) {
                const modalCamera = document.getElementById('modalFullscreenCamera');
                const isModalOpen = modalCamera && !modalCamera.classList.contains('hidden');
                if (this.isCameraRunning || isModalOpen) {
                    return;
                }
                await this.#syncSettingsHotReload();
            }
        });
    }

    #initRealtimeSettingsListener() {
        window.addEventListener('bma:settings-updated', (e) => {
            if (e.detail) {
                this.#applySettingsHotReload(e.detail);
            }
        });

        const triggerDebouncedPersonalSync = (payload) => {
            const affectedPersonId = payload?.personnel_id || payload?.new?.personnel_id || payload?.old?.personnel_id;
            if (!affectedPersonId || String(affectedPersonId) === String(this.currentUser?.personnel_id)) {
                if (this._realtimePersonalSyncTimer) clearTimeout(this._realtimePersonalSyncTimer);
                this._realtimePersonalSyncTimer = setTimeout(() => {
                    this.#syncPersonalAttendanceSilent();
                }, 250);
            }
        };

        window.addEventListener('bma:realtime-delta-sync', (e) => {
            if (e.detail?.table === 'attendance_logs') {
                triggerDebouncedPersonalSync(e.detail);
            }
        });

        try {
            const activeSchema = (typeof Config !== 'undefined' && Config.SUPABASE_SCHEMA) ? Config.SUPABASE_SCHEMA : 'public';
            const client = window.supabaseClient || (typeof DatabaseService !== 'undefined' ? DatabaseService.getInstance().client : null);
            if (client) {
                client.channel(`bma_checkin_settings_${activeSchema}`)
                    .on('postgres_changes', { event: '*', schema: activeSchema, table: 'system_settings' }, async (payload) => {
                        const newSettings = payload.new;
                        if (newSettings) {
                            sessionStorage.removeItem(Config.STORAGE_KEYS.CACHED_SETTINGS);
                            const fresh = await SettingsModel.getSettings(true);
                            this.#applySettingsHotReload(fresh);
                        }
                    })
                    .on('postgres_changes', { event: '*', schema: activeSchema, table: 'attendance_logs' }, (payload) => {
                        triggerDebouncedPersonalSync(payload);
                    })
                    .subscribe();

                client.channel('bma_global_realtime_bus')
                    .on('broadcast', { event: '*' }, async (e) => {
                        if (e.event === 'settings_updated') {
                            sessionStorage.removeItem(Config.STORAGE_KEYS.CACHED_SETTINGS);
                            const fresh = await SettingsModel.getSettings(true);
                            this.#applySettingsHotReload(fresh);
                        } else if (e.event === 'attendance_updated') {
                            triggerDebouncedPersonalSync(e.payload);
                        }
                    })
                    .subscribe();
            }
        } catch (err) {
            console.warn('Realtime settings subscription error:', err);
        }

        setInterval(async () => {
            if (!document.hidden) {
                await this.#syncSettingsHotReload();
            }
        }, 5000);
    }

    async #syncPersonalAttendanceSilent() {
        try {
            await this.#refreshAllAttendanceData();
        } catch (err) {
            console.warn('[CheckinController] Sync personal attendance silent error:', err);
        }
    }

    async #syncSettingsHotReload() {
        const modalCamera = document.getElementById('modalFullscreenCamera');
        const isModalOpen = modalCamera && !modalCamera.classList.contains('hidden');
        if (this.isCameraRunning || isModalOpen) {
            return;
        }
        try {
            sessionStorage.removeItem(Config.STORAGE_KEYS.CACHED_SETTINGS);
            const fresh = await SettingsModel.getSettings(true);
            const modalCameraNow = document.getElementById('modalFullscreenCamera');
            const isModalOpenNow = modalCameraNow && !modalCameraNow.classList.contains('hidden');
            if (this.isCameraRunning || isModalOpenNow) {
                return;
            }
            if (JSON.stringify(fresh) === JSON.stringify(this.settings)) {
                return;
            }
            this.#applySettingsHotReload(fresh);
        } catch (err) {
            console.warn('Sync settings hot reload error:', err);
        }
    }

    #applySettingsHotReload(newSettings) {
        if (!newSettings) return;
        this.settings = newSettings;
        this.#renderUserAndSettingsInfo();
        this.#renderGeofenceStatusUI();
        this.#applyDynamicWorkspaceLayout();
        this.#evaluateTimeWindowAndPopulateShifts();
        this.#updateStatusCardsAndMainButton();

        const modalCamera = document.getElementById('modalFullscreenCamera');
        const isModalOpen = modalCamera && !modalCamera.classList.contains('hidden');
        const isCameraActive = this.isCameraRunning || isModalOpen;

        if (this.settings.require_photo) {
            if (!this.capturedPhotoDataUrl && !isCameraActive) {
                this.#stopCameraAndShowStandby();
            }
        } else if (!isCameraActive) {
            this.#stopCameraHardwareStream();
        }

        if (this.settings.require_gps) {
            if (!this.gpsData.ready || this.gpsData.lat === null) {
                this.#initGpsLocation();
            }
        }
    }

    #applyDynamicWorkspaceLayout() {
        const showPhoto = Boolean(this.settings?.require_photo);
        const showGps = Boolean(this.settings?.require_gps);

        const cameraCard = document.getElementById('cameraSectionCard');
        const photoPreviewCard = document.getElementById('photoPreviewCard');
        const gpsCard = document.getElementById('gpsSectionCard');
        const pairGrid = photoPreviewCard?.parentElement || gpsCard?.parentElement;
        const geofenceCard = document.getElementById('onsiteGeofenceStatusCard');

        if (photoPreviewCard) {
            photoPreviewCard.classList.toggle('hidden', !showPhoto);
        }
        if (cameraCard) {
            cameraCard.classList.toggle('hidden', !showPhoto);
        }
        if (gpsCard) {
            gpsCard.classList.toggle('hidden', !showGps);
        }
        if (pairGrid) {
            if (!showPhoto && !showGps) {
                pairGrid.classList.add('hidden');
            } else {
                pairGrid.classList.remove('hidden');
                pairGrid.classList.toggle('grid-cols-2', showPhoto && showGps);
                pairGrid.classList.toggle('grid-cols-1', showPhoto !== showGps);
            }
        }
        if (geofenceCard && !showGps) {
            geofenceCard.classList.add('hidden');
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
            Boolean(s.is_overtime) &&
            !this.#isShiftAlreadyRecordedToday(s) &&
            this.#isShiftActiveAtCurrentTime(s, nowMin, allowStartMin)
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

        const isNormalModeSetting = !Boolean(this.settings?.single_click_checkin);
        const isBeforeAllowStart = nowMin < allowStartMin;
        const isAfterStdOut = nowMin > stdOutMin;
        const isRealtimeFilterEnabled = this.settings?.filter_shifts_by_realtime !== false;
        const isNormalHoursDisabledNow = Boolean(this.settings?.disable_normal_hours_checkin && isWithinNormalHours);
        const mustUseOvertimeWindow = !hasUnclosedRegular && (
            hasCompletedRegularToday ||
            (isRealtimeFilterEnabled && (isBeforeAllowStart || isAfterStdOut)) ||
            (isNormalModeSetting && hasActiveOtShifts) ||
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

        // 3) ถ้าต้องใช้ OT Window (ในรูปแบบปกติให้แสดงเฉพาะปฏิบัติงานนอกเวลาเท่านั้น)
        if (mustUseOvertimeWindow) {
            const otOnly = candidateShifts.filter(s => isNormalModeSetting ? Boolean(s.is_overtime) : Boolean(s.is_overtime || s.is_custom));
            if (isNormalModeSetting || otOnly.length > 0) {
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

    /**
     * คำนวณระยะทางแบบ Haversine (หน่วย: เมตร)
     */
    #calculateHaversineMeters(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const p1 = (lat1 * Math.PI) / 180;
        const p2 = (lat2 * Math.PI) / 180;
        const dp = ((lat2 - lat1) * Math.PI) / 180;
        const dl = ((lon2 - lon1) * Math.PI) / 180;

        const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
                  Math.cos(p1) * Math.cos(p2) *
                  Math.sin(dl / 2) * Math.sin(dl / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    }

    /**
     * ประเมินพิกัดว่าอยู่ในรัศมีสถานที่ทำงานทางการแห่งใดแห่งหนึ่งหรือไม่ (พร้อม Buffer 25 เมตร)
     * @param {number} currentLat
     * @param {number} currentLng
     * @returns {{matched: boolean, location: Object|null, distanceMeters: number, allowedRadius: number, message: string}}
     */
    evaluateOnsiteGeofence(currentLat, currentLng) {
        const officialLocations = (this.settings?.official_locations && Array.isArray(this.settings.official_locations) && this.settings.official_locations.length > 0)
            ? this.settings.official_locations.filter(loc => loc.is_active !== false)
            : (Config.DEFAULT_OFFICIAL_LOCATIONS || []).filter(loc => loc.is_active !== false);

        if (!currentLat || !currentLng || isNaN(currentLat) || isNaN(currentLng)) {
            return {
                matched: false,
                location: null,
                distanceMeters: 0,
                allowedRadius: 0,
                message: 'ยังไม่สามารถระบุพิกัด GPS ได้'
            };
        }

        if (officialLocations.length === 0) {
            return {
                matched: true,
                location: { name: 'สถานที่ทำงาน (ไม่จำกัดรัศมี)' },
                distanceMeters: 0,
                allowedRadius: 999999,
                message: 'อยู่ในสถานที่ปฏิบัติงาน'
            };
        }

        const accuracyBuffer = 25;
        let closestLocation = null;
        let minDistance = Infinity;
        let matchedLocation = null;

        for (const loc of officialLocations) {
            const locLat = Number(loc.latitude);
            const locLng = Number(loc.longitude);
            if (isNaN(locLat) || isNaN(locLng)) continue;

            const dist = this.#calculateHaversineMeters(currentLat, currentLng, locLat, locLng);
            const effectiveRadius = (Number(loc.radius_meters) || 150) + accuracyBuffer;

            if (dist < minDistance) {
                minDistance = dist;
                closestLocation = loc;
            }

            if (dist <= effectiveRadius) {
                matchedLocation = loc;
                minDistance = dist;
                break;
            }
        }

        if (matchedLocation) {
            return {
                matched: true,
                location: matchedLocation,
                distanceMeters: minDistance,
                allowedRadius: Number(matchedLocation.radius_meters) || 150,
                message: `อยู่ในสถานที่ปฏิบัติงาน "${matchedLocation.name}" (ห่าง ${minDistance} ม. / รัศมี ${matchedLocation.radius_meters} ม.)`
            };
        }

        const closestName = closestLocation ? closestLocation.name : 'สถานที่ทำงาน';
        const closestRadius = closestLocation ? (closestLocation.radius_meters || 150) : 150;

        if (this.settings?.enforce_geofence_radius === false) {
            const distText = minDistance !== Infinity ? ` (ห่างจาก "${closestName}" ประมาณ ${minDistance} ม.)` : '';
            return {
                matched: true,
                location: closestLocation || { name: 'สถานที่ทำงาน (ไม่จำกัดรัศมี)' },
                distanceMeters: minDistance === Infinity ? 0 : minDistance,
                allowedRadius: 999999,
                message: `ระบบเปิดให้ลงเวลาโดยไม่จำกัดรัศมีสถานที่ทำงาน${distText} (บันทึกพิกัดจริง)`
            };
        }

        return {
            matched: false,
            location: closestLocation,
            distanceMeters: minDistance,
            allowedRadius: closestRadius,
            message: `พิกัดตำแหน่งอยู่นอกสถานที่ทำงาน (ห่างจาก "${closestName}" ประมาณ ${minDistance} ม. เกินรัศมีที่อนุญาต ${closestRadius} ม.)`
        };
    }

    #renderGeofenceStatusUI() {
        const statusCard = document.getElementById('onsiteGeofenceStatusCard');
        const badgeEl = document.getElementById('onsiteGeofenceBadge');
        const iconEl = document.getElementById('onsiteGeofenceIcon');
        const textEl = document.getElementById('onsiteGeofenceDetailText');

        if (!statusCard || !badgeEl || !textEl) return;

        if (this.locationMode === 'OFFSITE') {
            statusCard.classList.add('hidden');
            return;
        }

        statusCard.classList.remove('hidden');

        if (!this.settings?.require_gps) {
            badgeEl.className = 'bma-badge bma-badge-emerald text-[10px] font-bold px-2.5 py-0.5 rounded-full';
            badgeEl.textContent = 'ไม่จำกัดพิกัด';
            textEl.textContent = 'ระบบไม่ได้เปิดบังคับตรวจสอบรัศมีสถานที่ทำงาน';
            return;
        }

        // ถ้าปิดการบังคับรัศมี หรือไม่บังคับ GPS ให้แสดงโหมดไม่จำกัดรัศมีทันที แม้ยังไม่ได้พิกัด GPS
        if (this.settings?.enforce_geofence_radius === false || this.settings?.require_gps === false) {
            statusCard.className = 'p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5';
            badgeEl.className = 'bma-badge bma-badge-emerald text-[10px] font-bold px-2.5 py-0.5 rounded-full';
            badgeEl.textContent = 'ไม่จำกัดรัศมี';
            if (iconEl) iconEl.className = 'fa-solid fa-circle-check text-[#00744B] dark:text-emerald-400';
            textEl.className = 'text-[11px] font-semibold text-[#00744B] dark:text-emerald-300 leading-relaxed';

            if (this.gpsData.ready && this.gpsData.lat != null) {
                const evalRes = this.evaluateOnsiteGeofence(this.gpsData.lat, this.gpsData.lng);
                this.geofenceResult = evalRes;
                textEl.textContent = evalRes.message || 'โหมดไม่บังคับรัศมี (บันทึกพิกัดจริง)';
            } else {
                textEl.textContent = 'โหมดไม่บังคับรัศมี (ลงเวลาได้ทุกพื้นที่ สามารถกดถัดไปได้ทันที)';
            }
            this.#updateStep1Validation();
            return;
        }

        if (!this.gpsData.ready || this.gpsData.lat == null) {
            badgeEl.className = 'bma-badge bma-badge-warning text-[10px] font-bold px-2.5 py-0.5 rounded-full';
            badgeEl.textContent = 'กำลังรอพิกัด GPS...';
            textEl.textContent = 'กำลังรอสัญญาณ GPS เพื่อประเมินรัศมีสถานที่ทำงาน...';
            if (iconEl) iconEl.className = 'fa-solid fa-spinner fa-spin text-amber-500';
            this.#updateStep1Validation();
            return;
        }

        const evalRes = this.evaluateOnsiteGeofence(this.gpsData.lat, this.gpsData.lng);
        this.geofenceResult = evalRes;

        if (evalRes.matched) {
            statusCard.className = 'p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5';
            badgeEl.className = 'bma-badge bma-badge-emerald text-[10px] font-bold px-2.5 py-0.5 rounded-full';
            badgeEl.textContent = 'อยู่ในสถานที่';
            if (iconEl) iconEl.className = 'fa-solid fa-circle-check text-[#00744B] dark:text-emerald-400';
            textEl.className = 'text-[11px] font-semibold text-[#00744B] dark:text-emerald-300 leading-relaxed';
            textEl.textContent = evalRes.message;
        } else {
            statusCard.className = 'p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs space-y-1.5';
            badgeEl.className = 'bma-badge bma-badge-danger text-[10px] font-bold px-2.5 py-0.5 rounded-full';
            badgeEl.textContent = 'อยู่นอกสถานที่';
            if (iconEl) iconEl.className = 'fa-solid fa-triangle-exclamation text-rose-600 dark:text-rose-400';
            textEl.className = 'text-[11px] font-semibold text-rose-700 dark:text-rose-300 leading-relaxed';
            textEl.textContent = `${evalRes.message} กรุณาตรวจสอบตำแหน่ง GPS หรือเลือกโหมด "นอกสถานที่"`;
        }

        this.#updateStep1Validation();
    }

    #initLocaV2ModeAndChips() {
        this.#initModeSwitcher();
    }

    #initModeSwitcher() {
        const btnOnsite = document.getElementById('btnModeOnsite');
        const btnOffsite = document.getElementById('btnModeOffsite');
        const offsiteSection = document.getElementById('offsiteLocationSection');
        const btnCurrent = document.getElementById('btnOffsiteGpsCurrent');
        const btnMap = document.getElementById('btnOpenOffsiteMapModal');

        const setActiveOffsiteGps = (source) => {
            if (!btnCurrent || !btnMap) return;
            if (source === 'current') {
                btnCurrent.className = 'py-2 px-2.5 rounded-xl bg-[#00744B] text-white shadow-md border-2 border-[#005B2E] text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer';
                btnMap.className = 'py-2 px-2.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer';
            } else {
                btnMap.className = 'py-2 px-2.5 rounded-xl bg-indigo-600 text-white shadow-md border-2 border-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer';
                btnCurrent.className = 'py-2 px-2.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer';
            }
        };

        setActiveOffsiteGps('current');
        this.selectedOffsiteGpsSource = 'current';

        btnOnsite?.addEventListener('click', async () => {
            const wasOffsite = this.locationMode === 'OFFSITE';
            this.locationMode = 'ONSITE';
            btnOnsite.className = 'py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all bg-[#00744B] text-white shadow-xs';
            btnOffsite.className = 'py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
            offsiteSection?.classList.add('hidden');
            if (wasOffsite) {
                await this.#initGpsLocation();
            }
            this.#renderGeofenceStatusUI();
            this.#updateStatusCardsAndMainButton();
        });

        btnOffsite?.addEventListener('click', () => {
            this.locationMode = 'OFFSITE';
            this.selectedOffsiteGpsSource = 'current';
            setActiveOffsiteGps('current');
            btnOffsite.className = 'py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all bg-sky-600 text-white shadow-xs';
            btnOnsite.className = 'py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
            offsiteSection?.classList.remove('hidden');
            this.#renderGeofenceStatusUI();
            this.#updateStatusCardsAndMainButton();
        });

        const selectEl = document.getElementById('offsiteRemarkSelect');
        const customRemarkBox = document.getElementById('offsiteCustomRemarkBox');
        const customRemarkInput = document.getElementById('offsiteCustomRemarkInput');

        const remarks = (this.settings?.remarks && Array.isArray(this.settings.remarks) && this.settings.remarks.length > 0)
            ? this.settings.remarks
            : ['ปฏิบัติงานที่บ้าน (WFH)', 'ปฏิบัติงานนอกสถานที่ (WFA)', 'ไปประชุม / สัมมนา / ฝึกอบรม', 'ตรวจพื้นที่ / ตรวจราชการภายนอก', 'อื่นๆ'];

        if (selectEl) {
            selectEl.innerHTML = remarks.map(r => `<option value="${r}">${r}</option>`).join('');
            if (!remarks.includes('อื่นๆ')) {
                selectEl.innerHTML += `<option value="อื่นๆ">อื่นๆ (ระบุหมายเหตุเพิ่มเติม)</option>`;
            }
            this.selectedOffsiteRemark = selectEl.value;

            selectEl.addEventListener('change', () => {
                this.selectedOffsiteRemark = selectEl.value;
                if (selectEl.value === 'อื่นๆ') {
                    customRemarkBox?.classList.remove('hidden');
                    customRemarkInput?.focus();
                } else {
                    customRemarkBox?.classList.add('hidden');
                }
            });
        }

        btnCurrent?.addEventListener('click', async () => {
            this.selectedOffsiteGpsSource = 'current';
            setActiveOffsiteGps('current');
            const gpsRes = await this.#initGpsLocation({ forceRefresh: true });
            if (gpsRes?.ready) {
                UIHelpers.showToast('อัปเดตพิกัดปัจจุบันสำหรับการปฏิบัติงานนอกสถานที่แล้ว', 'success');
            } else {
                UIHelpers.showToast('ไม่สามารถระบุพิกัด GPS ได้ กรุณาตรวจสอบการเปิดใช้งาน GPS', 'warning');
            }
        });

        btnMap?.addEventListener('click', () => {
            this.selectedOffsiteGpsSource = 'map';
            setActiveOffsiteGps('map');
            this.#openOffsiteMapModal();
        });

        document.getElementById('btnRefreshGps')?.addEventListener('click', async (e) => {
            if (this.isResolvingLocation) return;
            const btn = e.currentTarget;
            const spinner = document.getElementById('gpsRefreshSpinnerIcon');
            spinner?.classList.add('fa-spin');
            btn?.classList.add('pointer-events-none', 'opacity-70');
            try {
                const res = await this.#initGpsLocation({ forceRefresh: true });
                if (res?.ready) {
                    UIHelpers.showToast('ตรวจสอบตำแหน่ง GPS ปัจจุบันสำเร็จ', 'success');
                }
            } catch (err) {
                console.warn('GPS refresh error:', err);
            } finally {
                spinner?.classList.remove('fa-spin');
                btn?.classList.remove('pointer-events-none', 'opacity-70');
            }
        });

        document.getElementById('btnViewGpsMapModal')?.addEventListener('click', () => {
            this.#openViewGpsMapModal();
        });
    }

    #initViewGpsMapModal() {
        document.getElementById('btnCloseViewGpsMapModal')?.addEventListener('click', () => {
            document.getElementById('modalViewGpsMap')?.classList.add('hidden');
        });
        document.getElementById('btnConfirmCloseViewGpsMap')?.addEventListener('click', () => {
            document.getElementById('modalViewGpsMap')?.classList.add('hidden');
        });
    }

    #openViewGpsMapModal() {
        const modal = document.getElementById('modalViewGpsMap');
        if (!modal) return;
        modal.classList.remove('hidden');

        const lat = this.gpsData?.lat || 13.7563;
        const lng = this.gpsData?.lng || 100.5018;
        const locTitle = this.gpsData?.locationName || 'พิกัดปัจจุบัน';

        const titleEl = document.getElementById('viewGpsModalLocTitle');
        const coordsEl = document.getElementById('viewGpsModalPinCoords');
        const distEl = document.getElementById('viewGpsModalDistanceInfo');

        if (titleEl) titleEl.textContent = locTitle;
        if (coordsEl) coordsEl.textContent = `พิกัด: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        if (this.geofenceResult && this.geofenceResult.distanceMeters !== undefined) {
            if (distEl) distEl.textContent = `ระยะห่างจากจุดเช็คอินหลัก: ${this.geofenceResult.distanceMeters.toLocaleString()} ม. (${this.geofenceResult.isInside ? 'อยู่ในรัศมีที่อนุญาต' : 'อยู่นอกรัศมี'})`;
        } else if (distEl) {
            distEl.textContent = 'โหมดปฏิบัติงานนอกสถานที่';
        }

        setTimeout(() => {
            const mapContainer = document.getElementById('viewGpsLeafletMap');
            if (!mapContainer || typeof L === 'undefined') return;

            if (!this.viewGpsLeafletMap) {
                this.viewGpsLeafletMap = L.map(mapContainer, {
                    zoomControl: true,
                    attributionControl: false
                }).setView([lat, lng], 16);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19
                }).addTo(this.viewGpsLeafletMap);

                this.viewGpsLeafletMarker = L.marker([lat, lng]).addTo(this.viewGpsLeafletMap);
            } else {
                this.viewGpsLeafletMap.invalidateSize();
                this.viewGpsLeafletMap.setView([lat, lng], 16);
                if (this.viewGpsLeafletMarker) {
                    this.viewGpsLeafletMarker.setLatLng([lat, lng]);
                } else {
                    this.viewGpsLeafletMarker = L.marker([lat, lng]).addTo(this.viewGpsLeafletMap);
                }
            }
        }, 200);
    }

    #goToStep(step) {
        const step1Container = document.getElementById('checkinStep1Container');
        const step2Container = document.getElementById('checkinStep2Container');
        const step2Badge = document.getElementById('step2SummaryText');

        if (step === 2) {
            if (this.locationMode === 'ONSITE') {
                if (this.settings?.require_gps && this.settings?.enforce_geofence_radius !== false) {
                    const evalRes = this.evaluateOnsiteGeofence(this.gpsData.lat, this.gpsData.lng);
                    if (!evalRes.matched) {
                        UIHelpers.alert(
                            'พิกัดอยู่นอกสถานที่ทำงาน',
                            `${evalRes.message}\n\nกรุณาตรวจสอบสัญญาณ GPS หรือเลือกโหมด "นอกสถานที่"`,
                            'warning'
                        );
                        return;
                    }
                }
            } else if (this.locationMode === 'OFFSITE') {
                const finalRemark = (this.selectedOffsiteRemark === 'อื่นๆ')
                    ? document.getElementById('offsiteCustomRemarkInput')?.value?.trim()
                    : this.selectedOffsiteRemark;
                if (!finalRemark) {
                    UIHelpers.alert('กรุณาระบุหมายเหตุ', 'กรุณาระบุลักษณะงานนอกสถานที่ให้ครบถ้วนก่อนดำเนินการต่อ', 'warning');
                    return;
                }
                if (this.offsiteCustomGps.mode === 'map' && !this.offsiteCustomGps.lat) {
                    UIHelpers.alert('กรุณาระบุตำแหน่งในแผนที่', 'กรุณากดปุ่ม "เลือกหมุด" เพื่อเลือกตำแหน่งในแผนที่', 'warning');
                    return;
                }
            }

            const shiftSelectEl = document.getElementById('checkinShiftSelect');
            const shiftIdx = (shiftSelectEl && shiftSelectEl.value !== '') ? parseInt(shiftSelectEl.value, 10) : 0;
            const shiftObj = (this.settings?.work_shifts || [])[shiftIdx] || { name: 'เวลาราชการปกติ' };
            const shiftName = SettingsModel.formatShiftDisplayText(shiftObj);

            if (step2Badge) {
                if (this.locationMode === 'ONSITE') {
                    const locName = this.geofenceResult?.location?.name || 'สถานที่ทำงาน';
                    step2Badge.textContent = `ในสถานที่ (${locName}) • ${shiftName}`;
                } else {
                    const remarkLabel = (this.selectedOffsiteRemark === 'อื่นๆ')
                        ? (document.getElementById('offsiteCustomRemarkInput')?.value?.trim() || 'อื่นๆ')
                        : this.selectedOffsiteRemark;
                    step2Badge.textContent = `นอกสถานที่ (${remarkLabel}) • ${shiftName}`;
                }
            }

            this.currentStep = 2;
            step1Container?.classList.add('hidden');
            step2Container?.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (this.settings?.require_photo && !this.capturedPhotoDataUrl && !this.isCameraRunning) {
                this.#openCameraOnDemand();
            }
        } else {
            this.currentStep = 1;
            step2Container?.classList.add('hidden');
            step1Container?.classList.remove('hidden');
            this.#stopCameraHardwareStream();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.#updateStep1Validation();
        }
    }

    #updateStep1Validation() {
        const btnNext = document.getElementById('btnNextStepCheckin');
        if (!btnNext) return;

        let isValid = true;

        if (this.locationMode === 'ONSITE') {
            if (this.settings?.require_gps && this.settings?.enforce_geofence_radius !== false) {
                if (!this.gpsData.ready || this.gpsData.lat == null) {
                    isValid = false;
                } else {
                    const evalRes = this.evaluateOnsiteGeofence(this.gpsData.lat, this.gpsData.lng);
                    if (!evalRes.matched) {
                        isValid = false;
                    }
                }
            }
        } else if (this.locationMode === 'OFFSITE') {
            const finalRemark = (this.selectedOffsiteRemark === 'อื่นๆ')
                ? document.getElementById('offsiteCustomRemarkInput')?.value?.trim()
                : this.selectedOffsiteRemark;
            if (!finalRemark) {
                isValid = false;
            }
            if (this.offsiteCustomGps.mode === 'map' && !this.offsiteCustomGps.lat) {
                isValid = false;
            }
        }

        btnNext.disabled = !isValid;
        if (!isValid) {
            btnNext.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            btnNext.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    #openOffsiteMapModal() {
        const modal = document.getElementById('modalOffsiteMapSearch');
        if (!modal) return;
        modal.classList.remove('hidden');

        const initialLat = this.offsiteCustomGps.lat ?? this.gpsData.lat ?? 13.7563;
        const initialLng = this.offsiteCustomGps.lng ?? this.gpsData.lng ?? 100.5018;

        const coordsDisp = document.getElementById('offsiteCustomCoordsDisplay');
        const locNameDisp = document.getElementById('offsiteCustomLocNameDisplay');

        if (coordsDisp) {
            coordsDisp.textContent = `${Number(initialLat).toFixed(6)}, ${Number(initialLng).toFixed(6)}`;
        }

        const initialName = this.offsiteCustomGps.locationName || this.gpsData.locationName;
        if (locNameDisp) {
            if (initialName) {
                locNameDisp.textContent = initialName.replace(/^(ใกล้เคียง|บริเวณ)\s*/, '').trim();
            } else {
                locNameDisp.textContent = 'กำลังตรวจสอบชื่อสถานที่...';
            }
        }
        this.tempOffsiteLocation = {
            lat: Number(initialLat),
            lng: Number(initialLng),
            name: locNameDisp?.textContent || `พิกัด (${Number(initialLat).toFixed(5)}, ${Number(initialLng).toFixed(5)})`
        };

        this._offsiteUpdateSeq = (this._offsiteUpdateSeq || 0) + 1;
        const openSeq = this._offsiteUpdateSeq;

        // On modal open, ensure initial coordinate name is resolved via AttendanceModel.resolveLocationName so the text does not stay blank or generic
        if (!this.offsiteCustomGps.locationName || this.offsiteCustomGps.locationName.startsWith('พิกัด')) {
            AttendanceModel.resolveLocationName(initialLat, initialLng, {
                officialLocations: (this.settings?.official_locations || Config.DEFAULT_SETTINGS?.official_locations || [])
            }).then(resolved => {
                if (openSeq !== this._offsiteUpdateSeq) return;
                const clean = (resolved || '').replace(/^(ใกล้เคียง|บริเวณ)\s*/, '').trim() || `พิกัด (${Number(initialLat).toFixed(5)}, ${Number(initialLng).toFixed(5)})`;
                if (locNameDisp) locNameDisp.textContent = clean;
                if (this.tempOffsiteLocation) this.tempOffsiteLocation.name = clean;
            }).catch(() => {
                if (openSeq !== this._offsiteUpdateSeq) return;
                const fallback = `พิกัด (${Number(initialLat).toFixed(5)}, ${Number(initialLng).toFixed(5)})`;
                if (locNameDisp && !locNameDisp.textContent) locNameDisp.textContent = fallback;
                if (this.tempOffsiteLocation) this.tempOffsiteLocation.name = fallback;
            });
        }

        setTimeout(() => {
            if (typeof L === 'undefined') {
                console.warn('Leaflet is not loaded');
                return;
            }

            if (!this.offsiteLeafletMap) {
                const mapEl = document.getElementById('offsiteLeafletMap');
                if (!mapEl) return;

                this.offsiteLeafletMap = L.map('offsiteLeafletMap', {
                    zoomControl: true,
                    attributionControl: false
                }).setView([initialLat, initialLng], 16);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19
                }).addTo(this.offsiteLeafletMap);

                const customIcon = L.divIcon({
                    html: '<div style="background-color: #00744B; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;"><i class="fa-solid fa-map-pin text-sm"></i></div>',
                    className: 'offsite-custom-marker-icon',
                    iconSize: [28, 28],
                    iconAnchor: [14, 28]
                });

                this.offsiteMarker = L.marker([initialLat, initialLng], {
                    draggable: true,
                    icon: customIcon
                }).addTo(this.offsiteLeafletMap);

                this.offsiteMarker.on('dragend', async (e) => {
                    const pos = e.target.getLatLng();
                    this.#updateOffsiteModalMarker(pos.lat, pos.lng);
                });

                this.offsiteLeafletMap.on('click', async (e) => {
                    this.#updateOffsiteModalMarker(e.latlng.lat, e.latlng.lng);
                });
            } else {
                this.offsiteLeafletMap.invalidateSize();
                this.offsiteLeafletMap.setView([initialLat, initialLng], 16);
                if (this.offsiteMarker) {
                    this.offsiteMarker.setLatLng([initialLat, initialLng]);
                }
            }
        }, 150);
    }

    async #updateOffsiteModalMarker(lat, lng, explicitName = null, extent = null) {
        const numLat = Number(lat);
        const numLng = Number(lng);
        if (isNaN(numLat) || isNaN(numLng)) return;

        this._offsiteUpdateSeq = (this._offsiteUpdateSeq || 0) + 1;
        const currentSeq = this._offsiteUpdateSeq;

        if (this.offsiteMarker) {
            this.offsiteMarker.setLatLng([numLat, numLng]);
        }
        if (this.offsiteLeafletMap) {
            if (extent && extent.ymin != null && extent.xmin != null && extent.ymax != null && extent.xmax != null) {
                const south = Math.min(Number(extent.ymin), Number(extent.ymax));
                const north = Math.max(Number(extent.ymin), Number(extent.ymax));
                const west = Math.min(Number(extent.xmin), Number(extent.xmax));
                const east = Math.max(Number(extent.xmin), Number(extent.xmax));
                if (Number.isFinite(south) && Number.isFinite(north) && Number.isFinite(west) && Number.isFinite(east)) {
                    this.offsiteLeafletMap.fitBounds([
                        [south, west],
                        [north, east]
                    ], { animate: true, maxZoom: 18, padding: [30, 30] });
                } else {
                    this.offsiteLeafletMap.setView([numLat, numLng], Math.max(this.offsiteLeafletMap.getZoom() || 16, 16));
                }
            } else {
                this.offsiteLeafletMap.setView([numLat, numLng], Math.max(this.offsiteLeafletMap.getZoom() || 16, 16));
            }
        }

        const coordsDisp = document.getElementById('offsiteCustomCoordsDisplay');
        const locNameDisp = document.getElementById('offsiteCustomLocNameDisplay');

        if (coordsDisp) {
            coordsDisp.textContent = `${numLat.toFixed(6)}, ${numLng.toFixed(6)}`;
        }

        if (explicitName) {
            const clean = String(explicitName).replace(/^(ใกล้เคียง|บริเวณ)\s*/, '').trim();
            if (locNameDisp) locNameDisp.textContent = clean;
            this.tempOffsiteLocation = { lat: numLat, lng: numLng, name: clean };
            return;
        }

        if (locNameDisp) locNameDisp.textContent = 'กำลังตรวจสอบชื่อสถานที่...';
        try {
            const resolveOptions = {
                officialLocations: (this.settings?.official_locations || Config.DEFAULT_SETTINGS?.official_locations || [])
            };
            const locName = await AttendanceModel.resolveLocationName(numLat, numLng, resolveOptions);
            if (currentSeq !== this._offsiteUpdateSeq) return;
            const cleanName = (locName || '').replace(/^(ใกล้เคียง|บริเวณ)\s*/, '').trim() || `พิกัด (${numLat.toFixed(5)}, ${numLng.toFixed(5)})`;
            if (locNameDisp) locNameDisp.textContent = cleanName;
            this.tempOffsiteLocation = { lat: numLat, lng: numLng, name: cleanName };
        } catch (e) {
            if (currentSeq !== this._offsiteUpdateSeq) return;
            const fallback = `พิกัด (${numLat.toFixed(5)}, ${numLng.toFixed(5)})`;
            if (locNameDisp) locNameDisp.textContent = fallback;
            this.tempOffsiteLocation = { lat: numLat, lng: numLng, name: fallback };
        }
    }

    #initOffsiteModalGps() {
        const modal = document.getElementById('modalOffsiteMapSearch');
        const searchInput = document.getElementById('offsiteMapSearchInput');
        const btnSearch = document.getElementById('btnOffsiteMapSearch');
        const searchResultsEl = document.getElementById('offsiteMapSearchResults');
        const btnClose = document.getElementById('btnCloseOffsiteMapModal');
        const btnCancel = document.getElementById('btnCancelOffsiteMapModal');
        const btnConfirm = document.getElementById('btnConfirmOffsiteCustomLocation');

        const escapeHtml = (str) => {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        const hideSearchResults = () => {
            if (searchResultsEl) {
                searchResultsEl.classList.add('hidden');
                searchResultsEl.innerHTML = '';
            }
        };

        const closeModal = () => {
            modal?.classList.add('hidden');
            hideSearchResults();
        };

        btnClose?.addEventListener('click', closeModal);
        btnCancel?.addEventListener('click', closeModal);

        btnConfirm?.addEventListener('click', () => {
            if (this.tempOffsiteLocation) {
                this.offsiteCustomGps.lat = this.tempOffsiteLocation.lat;
                this.offsiteCustomGps.lng = this.tempOffsiteLocation.lng;
                this.offsiteCustomGps.locationName = this.tempOffsiteLocation.name;
                this.offsiteCustomGps.mode = 'map';
                this.selectedOffsiteGpsSource = 'map';

                this.gpsData.lat = this.tempOffsiteLocation.lat;
                this.gpsData.lng = this.tempOffsiteLocation.lng;
                this.gpsData.locationName = this.tempOffsiteLocation.name;
                this.gpsData.ready = true;

                const nameEl = document.getElementById('offsiteSelectedLocationName');
                const coordsEl = document.getElementById('offsiteSelectedLocationCoords');
                if (nameEl) nameEl.textContent = this.tempOffsiteLocation.name;
                if (coordsEl) coordsEl.textContent = `${this.tempOffsiteLocation.lat.toFixed(6)}, ${this.tempOffsiteLocation.lng.toFixed(6)}`;

                const mainGpsCoords = document.getElementById('gpsCoordsText');
                const mainGpsName = document.getElementById('gpsLocationNameText');
                if (mainGpsCoords) mainGpsCoords.textContent = `${this.gpsData.lat.toFixed(6)}, ${this.gpsData.lng.toFixed(6)}`;
                if (mainGpsName) mainGpsName.textContent = this.gpsData.locationName;

                this.#renderInlineGpsMap(this.gpsData.lat, this.gpsData.lng);

                const btnCurrent = document.getElementById('btnOffsiteGpsCurrent');
                const btnMap = document.getElementById('btnOpenOffsiteMapModal');
                if (btnMap && btnCurrent) {
                    btnMap.className = 'py-2 px-2.5 rounded-xl bg-indigo-600 text-white shadow-md border-2 border-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer';
                    btnCurrent.className = 'py-2 px-2.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer';
                }

                this.#renderGeofenceStatusUI();
                this.#updateStatusCardsAndMainButton();
                UIHelpers.showToast(`เลือกสถานที่: ${this.offsiteCustomGps.locationName}`, 'success');
            }
            closeModal();
            this.#updateStep1Validation();
        });

        let searchSeq = 0;
        let debounceTimer = null;

        const performSearch = async () => {
            const query = (searchInput?.value || '').trim();
            if (!query) {
                hideSearchResults();
                return;
            }

            const currentSeq = ++searchSeq;
            if (searchResultsEl) {
                searchResultsEl.innerHTML = `
                    <div class="p-4 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-spinner fa-spin text-emerald-600"></i>
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
            let userProvince = '';
            if (this.gpsData?.locationName) {
                const pMatch = this.gpsData.locationName.match(/(?:จ\.|จังหวัด|กรุงเทพมหานคร|กรุงเทพฯ|กทม\.)([^\s,]+)?/i);
                if (pMatch) userProvince = pMatch[0].trim();
            }

            try {
                const items = await AttendanceModel.searchPlaces(query, {
                    refLat,
                    refLng,
                    userProvince,
                    limit: 8
                });

                if (currentSeq !== searchSeq) return;

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

                const html = items.map(item => {
                    const itemLat = parseFloat(item.lat);
                    const itemLng = parseFloat(item.lng ?? item.lon);
                    const mainName = item.mainName || 'สถานที่ที่เลือก';
                    const subAddr = item.subAddr || '';
                    const category = item.category || 'สถานที่ทั่วไป';
                    const distHtml = item.distStr ? `<span class="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] shrink-0">${escapeHtml(item.distStr)}</span>` : '';
                    const extentAttr = item.extent ? ` data-extent="${escapeHtml(JSON.stringify(item.extent))}"` : '';

                    return `
                        <div class="offsite-search-item p-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer flex items-start gap-3 transition" data-lat="${itemLat}" data-lng="${itemLng}" data-name="${escapeHtml(mainName)}"${extentAttr}>
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

                searchResultsEl.querySelectorAll('.offsite-search-item').forEach(el => {
                    el.addEventListener('click', async () => {
                        const lat = parseFloat(el.dataset.lat);
                        const lng = parseFloat(el.dataset.lng);
                        const name = (el.dataset.name || '').replace(/^(ใกล้เคียง|บริเวณ)\s*/, '').trim();
                        let extent = null;
                        try {
                            if (el.dataset.extent) extent = JSON.parse(el.dataset.extent);
                        } catch (_) {}
                        if (searchInput) searchInput.value = name;
                        hideSearchResults();
                        await this.#updateOffsiteModalMarker(lat, lng, name, extent);
                    });
                });
            } catch (err) {
                if (currentSeq !== searchSeq) return;
                console.warn('Offsite map search error:', err);
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
            if (debounceTimer) clearTimeout(debounceTimer);
            const query = (searchInput?.value || '').trim();
            if (!query || query.length < 2) {
                hideSearchResults();
                return;
            }
            debounceTimer = setTimeout(() => {
                performSearch();
            }, 450);
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
            if (searchInput && searchResultsEl && !searchInput.contains(e.target) && !searchResultsEl.contains(e.target) && (!btnSearch || !btnSearch.contains(e.target))) {
                hideSearchResults();
            }
        });
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
            const formattedPos = UIHelpers.formatPosition(p.position_title, p.position_level, p.position_type);
            setElText('userPositionText', `${formattedPos} (${p.position_type || '-'})`);
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
        const checkInTime = this.activeRegularRecord?.check_in_time || this.activeRegularRecord?.checkin_time;
        const checkOutTime = this.activeRegularRecord?.check_out_time || this.activeRegularRecord?.checkout_time;
        const hasUnclosedRegular = Boolean(checkInTime && !checkOutTime);
        const isRegularCompletedToday = Boolean(
            this.activeRegularRecord &&
            this.activeRegularRecord.check_in_time &&
            this.activeRegularRecord.check_out_time &&
            this.activeRegularRecord.work_date === UIHelpers.getTodayISO()
        );

        const banner = document.getElementById('unifiedStatusBanner');
        const bannerStatusText = document.getElementById('bannerStatusText');
        const bannerSubText = document.getElementById('bannerSubText');
        const modeContextBadge = document.getElementById('modeContextBadge');

        const actionCard = document.getElementById('checkinActionCard');
        const shiftSelectorContainer = document.getElementById('shiftSelectorContainer');
        const mainCustomBox = document.getElementById('mainCustomTimeContainer');
        const noticeBox = document.getElementById('regularCompletedNoticeBox');
        const noticeText = document.getElementById('regularCompletedNoticeText');
        const modeTag = document.getElementById('checkinRecordingModeTag');

        const btnSubmit = document.getElementById('btnSubmitCheckinMain');
        const btnSubmitIcon = document.getElementById('btnSubmitCheckinIcon');
        const btnSubmitLabel = document.getElementById('btnSubmitCheckinLabel');

        const applyGpsSearchingLock = () => {
            if (this.settings?.require_gps && (this.isResolvingLocation || !this.gpsData?.locationName || this.gpsData.locationName.includes('กำลังค้นหา'))) {
                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.classList.add('opacity-60', 'cursor-not-allowed', 'pointer-events-none');
                    btnSubmit.classList.remove('cursor-pointer', 'hover:bg-[#005e3c]', 'hover:bg-[#7F1D1D]');
                    if (btnSubmitIcon) btnSubmitIcon.className = 'fa-solid fa-spinner fa-spin text-lg';
                    if (btnSubmitLabel) btnSubmitLabel.textContent = 'กำลังค้นหาสถานที่ใกล้เคียง...';
                }
            }
        };

        const setShiftCardVisibility = (visible) => {
            if (!visible) {
                actionCard?.classList.add('hidden');
                shiftSelectorContainer?.classList.add('hidden');
                mainCustomBox?.classList.add('hidden');
            } else {
                actionCard?.classList.remove('hidden');
                shiftSelectorContainer?.classList.remove('hidden', 'opacity-60', 'pointer-events-none');
            }
        };

        const nowMin = UIHelpers.timeToMinutes(UIHelpers.getCurrentTimeHHMM());
        const allowStartMin = UIHelpers.timeToMinutes(this.settings?.allow_checkin_start_time || '06:00');
        const stdInRef = UIHelpers.formatTime24(this.settings?.standard_check_in || '08:30');
        const stdOutRef = UIHelpers.formatTime24(this.settings?.standard_check_out || '16:30');
        const stdInMin = UIHelpers.timeToMinutes(stdInRef);
        const stdOutMin = UIHelpers.timeToMinutes(stdOutRef);
        const isWithinNormalHours = (stdInMin <= stdOutMin)
            ? (nowMin >= stdInMin && nowMin < stdOutMin)
            : (nowMin >= stdInMin || nowMin < stdOutMin);

        const allShifts = this.settings?.work_shifts || [];
        const hasActiveOtShifts = allShifts.some(s =>
            Boolean(s.is_overtime) &&
            !this.#isShiftAlreadyRecordedToday(s) &&
            this.#isShiftActiveAtCurrentTime(s, nowMin, allowStartMin)
        );

        const isNormalModeSetting = !Boolean(this.settings?.single_click_checkin);
        const isBeforeAllowStart = nowMin < allowStartMin;
        const isAfterStdOut = nowMin > stdOutMin;
        const isRealtimeFilterEnabled = this.settings?.filter_shifts_by_realtime !== false;

        // อัปเดต Badge ระบุโหมดสถานที่
        const modeBadge = document.getElementById('modeBadge');
        if (modeBadge) {
            modeBadge.textContent = this.locationMode === 'OFFSITE' ? 'นอกสถานที่' : 'ในสถานที่';
            modeBadge.className = this.locationMode === 'OFFSITE'
                ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
        }

        const isOffsite = (this.locationMode === 'OFFSITE');
        if (modeContextBadge) {
            modeContextBadge.textContent = isOffsite ? 'โหมดปฏิบัติงานนอกสถานที่' : 'โหมดในสถานที่ (พิกัดตามจุดเช็คอิน)';
            modeContextBadge.className = isOffsite
                ? 'text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                : 'text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
        }

        // 1. กรณีรูปแบบปกติ และมีรายการเข้างานปกติค้างอยู่
        if (isNormalModeSetting && hasUnclosedRegular) {
            setShiftCardVisibility(false);
            noticeBox?.classList.add('hidden');
            if (banner) {
                banner.className = 'w-full mb-3 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between transition-all bg-gradient-to-r from-[#7F1D1D] to-[#DC2626]';
            }
            if (bannerStatusText) bannerStatusText.textContent = 'ลงเวลาออกงาน';
            if (bannerSubText) bannerSubText.textContent = `เข้างานเมื่อ: ${UIHelpers.formatTime24(checkInTime)}`;

            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                btnSubmit.className = 'w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-base shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#991B1B] hover:bg-[#7F1D1D]';
            }
            if (btnSubmitIcon) btnSubmitIcon.className = 'fa-solid fa-arrow-right-from-bracket text-lg';
            if (btnSubmitLabel) {
                btnSubmitLabel.textContent = this.activeRegularRecord?.work_date !== UIHelpers.getTodayISO()
                    ? `บันทึกลงเวลาเลิกงาน (${UIHelpers.formatThaiShortDate(this.activeRegularRecord.work_date)})`
                    : 'บันทึกลงเวลาเลิกงาน';
            }
            applyGpsSearchingLock();
            return;
        }

        // 2. กรณีเปิดฟังก์ชัน "ปิดการลงเวลาในช่วงเวลาปกติ (08:30 - 16:30 น.)"
        if (this.settings?.disable_normal_hours_checkin && isWithinNormalHours) {
            noticeBox?.classList.add('hidden');
            if (hasActiveOtShifts && !hasUnclosedRegular && this.availableShiftsForCurrentWindow?.length > 0) {
                setShiftCardVisibility(true);
                const shiftSelect = document.getElementById('checkinShiftSelect');
                const selectedShiftIdx = shiftSelect ? parseInt(shiftSelect.value, 10) : NaN;
                const shiftObj = !isNaN(selectedShiftIdx) ? allShifts[selectedShiftIdx] : null;

                const isCustomShift = Boolean(shiftObj && (shiftObj.is_custom || String(shiftObj.name || '').includes('อื่นๆ')));
                mainCustomBox?.classList.toggle('hidden', !isCustomShift);

                if (modeTag) {
                    modeTag.textContent = 'ปฏิบัติงานนอกเวลา';
                    modeTag.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
                }

                if (banner) {
                    banner.className = 'w-full mb-3 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between transition-all bg-gradient-to-r from-amber-700 to-amber-600';
                }
                if (bannerStatusText) bannerStatusText.textContent = 'ลงเวลาปฏิบัติงานนอกเวลา';
                if (bannerSubText) bannerSubText.textContent = shiftObj ? (shiftObj.name || 'พร้อมบันทึกเวลานอกเวลา') : 'กรุณาเลือกช่วงเวลาปฏิบัติงานนอกเวลาด้านล่าง';

                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                    btnSubmit.className = 'w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-base shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#00744B] hover:bg-[#005e3c]';
                }
                if (btnSubmitIcon) btnSubmitIcon.className = 'fa-solid fa-arrow-right-to-bracket text-lg';
                if (btnSubmitLabel) {
                    btnSubmitLabel.textContent = shiftObj ? 'บันทึกลงเวลาปฏิบัติงานนอกเวลา' : 'กรุณาเลือกช่วงเวลาปฏิบัติงานนอกเวลา';
                }
                applyGpsSearchingLock();
                return;
            } else {
                if (isNormalModeSetting) {
                    setShiftCardVisibility(false);
                } else {
                    setShiftCardVisibility(true);
                }
                if (banner) {
                    banner.className = 'w-full mb-3 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between transition-all bg-gradient-to-r from-slate-700 to-slate-800';
                }
                if (bannerStatusText) bannerStatusText.textContent = 'ปิดรับการลงเวลาช่วงปกติ';
                if (bannerSubText) bannerSubText.textContent = `งดบันทึกเวลาในช่วงเวลาปกติ (${stdInRef} - ${stdOutRef} น.)`;

                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.className = 'w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-base shadow-none transition-all flex items-center justify-center gap-2 cursor-not-allowed bg-slate-400 dark:bg-slate-700 opacity-50 pointer-events-none';
                }
                if (btnSubmitIcon) btnSubmitIcon.className = 'fa-solid fa-ban text-lg';
                if (btnSubmitLabel) {
                    btnSubmitLabel.textContent = `ปิดรับการลงเวลาในช่วงเวลาปกติ (${stdInRef} - ${stdOutRef} น.)`;
                }
                return;
            }
        }

        // 3. กรณีรูปแบบปกติ ในช่วงเวลาปฏิบัติงานปกติ เมื่อเปิด filter_shifts_by_realtime และไม่มีกะนอกเวลาที่เปิดให้ลงในขณะนั้น
        if (isNormalModeSetting && isRealtimeFilterEnabled && !isBeforeAllowStart && !isAfterStdOut && !(hasActiveOtShifts && !hasUnclosedRegular && this.availableShiftsForCurrentWindow?.length > 0)) {
            setShiftCardVisibility(false);
            noticeBox?.classList.add('hidden');

            if (isRegularCompletedToday) {
                if (banner) {
                    banner.className = 'w-full mb-3 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between transition-all bg-gradient-to-r from-slate-700 to-slate-800';
                }
                if (bannerStatusText) bannerStatusText.textContent = 'บันทึกเวลาครบแล้ว';
                if (bannerSubText) bannerSubText.textContent = `เข้า: ${UIHelpers.formatTime24(checkInTime)} • ออก: ${UIHelpers.formatTime24(checkOutTime)}`;

                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    btnSubmit.className = 'w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-base shadow-none transition-all flex items-center justify-center gap-2 cursor-not-allowed bg-slate-400 dark:bg-slate-700 opacity-50 pointer-events-none';
                }
                if (btnSubmitIcon) btnSubmitIcon.className = 'fa-solid fa-check-double text-lg';
                if (btnSubmitLabel) btnSubmitLabel.textContent = 'บันทึกเวลาครบแล้ววันนี้';
            } else {
                if (banner) {
                    banner.className = 'w-full mb-3 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between transition-all bg-gradient-to-r from-[#00351B] to-[#00744B]';
                }
                if (bannerStatusText) bannerStatusText.textContent = 'ลงเวลาเข้างาน';
                if (bannerSubText) bannerSubText.textContent = 'พร้อมบันทึกเวลาเข้างานวันนี้';

                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                    btnSubmit.className = 'w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-base shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#00744B] hover:bg-[#005e3c]';
                }
                if (btnSubmitIcon) btnSubmitIcon.className = 'fa-solid fa-arrow-right-to-bracket text-lg';
                if (btnSubmitLabel) btnSubmitLabel.textContent = 'บันทึกลงเวลาเข้าปฏิบัติงาน';
                applyGpsSearchingLock();
            }
            return;
        }

        // 4. กรณีต้องแสดงการ์ดเลือกช่วงเวลา แต่ไม่มีช่วงเวลาเหลือให้เลือกเลย
        if (!hasUnclosedRegular && (!this.availableShiftsForCurrentWindow || this.availableShiftsForCurrentWindow.length === 0)) {
            setShiftCardVisibility(true);
            noticeBox?.classList.remove('hidden');
            if (noticeText) {
                noticeText.textContent = 'ท่านได้บันทึกลงเวลาปฏิบัติงานในทุกช่วงเวลาที่เปิดให้ลงเวลาเรียบร้อยแล้ว หรือไม่มีช่วงเวลาปฏิบัติงานที่เปิดให้ลงเวลาในขณะนี้';
            }

            if (banner) {
                banner.className = 'w-full mb-3 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between transition-all bg-gradient-to-r from-slate-700 to-slate-800';
            }
            if (bannerStatusText) {
                bannerStatusText.textContent = isRegularCompletedToday ? 'บันทึกเวลาครบแล้ว' : 'ไม่มีช่วงเวลาที่เปิดให้ลงเวลา';
            }
            if (bannerSubText) {
                bannerSubText.textContent = isRegularCompletedToday
                    ? `เข้า: ${UIHelpers.formatTime24(checkInTime)} • ออก: ${UIHelpers.formatTime24(checkOutTime)}`
                    : 'ไม่มีช่วงเวลาที่เปิดให้ลงเวลาในขณะนี้';
            }

            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.className = 'w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-base shadow-none transition-all flex items-center justify-center gap-2 cursor-not-allowed bg-slate-400 dark:bg-slate-700 opacity-50 pointer-events-none';
            }
            if (btnSubmitIcon) btnSubmitIcon.className = 'fa-solid fa-calendar-xmark text-lg';
            if (btnSubmitLabel) btnSubmitLabel.textContent = 'ไม่มีช่วงเวลาปฏิบัติงานให้บันทึก';
            return;
        }

        // 5. กรณีแสดงการ์ดเลือกช่วงเวลาและมีช่วงเวลาให้เลือก
        setShiftCardVisibility(true);
        noticeBox?.classList.add('hidden');

        const shiftSelect = document.getElementById('checkinShiftSelect');
        const selectedShiftIdx = shiftSelect ? parseInt(shiftSelect.value, 10) : NaN;
        const shiftObj = !isNaN(selectedShiftIdx) ? allShifts[selectedShiftIdx] : null;

        const isCustomShift = Boolean(shiftObj && (shiftObj.is_custom || String(shiftObj.name || '').includes('อื่นๆ')));
        mainCustomBox?.classList.toggle('hidden', !isCustomShift);

        const isOvertimeContext = Boolean(shiftObj?.is_overtime || isNormalModeSetting || (isRealtimeFilterEnabled && (isBeforeAllowStart || isAfterStdOut)) || isRegularCompletedToday);

        if (modeTag) {
            if (isOvertimeContext) {
                modeTag.textContent = 'ปฏิบัติงานนอกเวลา';
                modeTag.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
            } else {
                modeTag.textContent = 'รูปแบบพิเศษ';
                modeTag.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20';
            }
        }

        if (banner) {
            banner.className = isOvertimeContext
                ? 'w-full mb-3 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between transition-all bg-gradient-to-r from-amber-700 to-amber-600'
                : 'w-full mb-3 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between transition-all bg-gradient-to-r from-[#00351B] to-[#00744B]';
        }
        if (bannerStatusText) {
            bannerStatusText.textContent = isOvertimeContext ? 'ลงเวลาปฏิบัติงานนอกเวลา' : 'ลงเวลาเข้างาน';
        }
        if (bannerSubText) {
            bannerSubText.textContent = shiftObj ? (shiftObj.name || 'พร้อมบันทึกเวลา') : (isOvertimeContext ? 'กรุณาเลือกช่วงเวลาปฏิบัติงานนอกเวลาด้านล่าง' : 'กรุณาเลือกช่วงเวลาปฏิบัติงานด้านล่าง');
        }

        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            btnSubmit.className = 'w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-base shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#00744B] hover:bg-[#005e3c]';
        }
        if (btnSubmitIcon) btnSubmitIcon.className = 'fa-solid fa-arrow-right-to-bracket text-lg';
        if (btnSubmitLabel) {
            btnSubmitLabel.textContent = isOvertimeContext ? 'บันทึกลงเวลาปฏิบัติงานนอกเวลา' : 'บันทึกลงเวลาเข้าปฏิบัติงาน';
        }

        applyGpsSearchingLock();
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

    async #openFullscreenCamera() {
        const modal = document.getElementById('modalFullscreenCamera');
        const video = document.getElementById('cameraVideoStream');

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
            modal?.classList.remove('hidden');

            try {
                this.mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
                    audio: false
                });
            } catch (constraintErr) {
                console.warn('High-res camera constraints failed, falling back to standard user camera:', constraintErr);
                this.mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' },
                    audio: false
                });
            }

            this.isCameraRunning = true;
            if (video) {
                video.srcObject = this.mediaStream;
                video.classList.remove('hidden');
                await video.play().catch(playErr => console.warn('Video play error:', playErr));
            }
        } catch (err) {
            console.warn('Fullscreen camera access error:', err);
            this.#stopCameraHardwareStream();
            modal?.classList.add('hidden');
            if (allowFallback) {
                const fallbackInput = document.getElementById('cameraFallbackFileInput');
                if (fallbackInput) {
                    fallbackInput.click();
                    return;
                }
            }
            await UIHelpers.alert(
                'ไม่สามารถเข้าถึงกล้องถ่ายรูปได้',
                'กรุณาอนุญาตการเข้าถึงกล้องบนเบราว์เซอร์เพื่อถ่ายภาพยืนยันตัวตน',
                'warning'
            );
        }
    }

    #captureAndCloseCamera() {
        const video = document.getElementById('cameraVideoStream');
        const canvas = document.getElementById('cameraCaptureCanvas');
        const preview = document.getElementById('capturedPhotoPreview');
        const placeholder = document.getElementById('photoPlaceholder');
        const centerIcon = document.getElementById('centerPhotoIcon');
        const statusText = document.getElementById('photoStatusBadgeText');
        const modal = document.getElementById('modalFullscreenCamera');

        if (!video || !video.srcObject || !canvas) {
            UIHelpers.alert('กล้องยังไม่พร้อมใช้งาน', 'กรุณารอสักครู่แล้วลองใหม่อีกครั้ง', 'warning');
            return;
        }

        if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
            UIHelpers.alert('กล้องกำลังเริ่มต้น', 'กรุณารอสักครู่ให้ภาพปรากฏชัดเจนแล้วกดถ่ายใหม่อีกครั้ง', 'info');
            return;
        }

        this.capturedPhotoDataUrl = UIHelpers.capturePortrait3x4FromVideo(video, canvas);
        if (!this.capturedPhotoDataUrl) {
            UIHelpers.alert('ถ่ายภาพไม่สำเร็จ', 'ไม่สามารถบันทึกภาพจากกล้องได้ กรุณาลองใหม่อีกครั้ง', 'warning');
            return;
        }
        this.#stopCameraHardwareStream();

        if (preview) {
            preview.src = this.capturedPhotoDataUrl;
            preview.classList.remove('hidden');
        }
        placeholder?.classList.add('hidden');

        if (centerIcon) {
            centerIcon.className = 'fa-solid fa-rotate-right text-base text-amber-300';
        }
        if (statusText) {
            statusText.textContent = 'ถ่ายภาพแล้ว (แตะเพื่อถ่ายใหม่)';
        }

        modal?.classList.add('hidden');
    }

    #closeFullscreenCamera() {
        this.#stopCameraHardwareStream();
        document.getElementById('modalFullscreenCamera')?.classList.add('hidden');
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
                const placeholder = document.getElementById('photoPlaceholder');
                const centerIcon = document.getElementById('centerPhotoIcon');
                const statusText = document.getElementById('photoStatusBadgeText');
                placeholder?.classList.add('hidden');
                if (centerIcon) centerIcon.className = 'fa-solid fa-rotate-right text-base text-amber-300';
                if (statusText) statusText.textContent = 'เลือกภาพแล้ว (แตะเพื่อเปลี่ยนภาพ)';
                document.getElementById('modalFullscreenCamera')?.classList.add('hidden');

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
                btnRetake?.classList.add('hidden');

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
            try {
                video.pause();
            } catch (_) {}
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
        btnRetake?.classList.add('hidden');
    }

    async #resetPageAfterSave() {
        this.#stopCameraHardwareStream();
        this.capturedPhotoDataUrl = '';
        const preview = document.getElementById('capturedPhotoPreview');
        const placeholder = document.getElementById('photoPlaceholder');
        const centerIcon = document.getElementById('centerPhotoIcon');
        const statusText = document.getElementById('photoStatusBadgeText');
        const btnRetake = document.getElementById('btnRetakePhoto');
        btnRetake?.classList.add('hidden');
        if (preview) { preview.src = ''; preview.classList.add('hidden'); }
        placeholder?.classList.remove('hidden');
        if (centerIcon) centerIcon.className = 'fa-solid fa-camera text-base text-amber-300';
        if (statusText) statusText.textContent = 'แตะเพื่อถ่ายรูป';
        await this.#refreshAllAttendanceData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * จับพิกัด GPS และค้นหาสถานที่ใกล้เคียงตามลำดับ:
     * 1. ซูมแผนที่เริ่มต้นที่ระยะ z = 19 (ประมาณ 20 เมตร) ก่อน -> แสดง ["ใกล้เคียง " + ชื่อสถานที่]
     * 2. หากไม่พบใน z = 19 ระบบจะสลับไปใช้ z = 20 (ประมาณ 10 เมตร) -> แสดง ["บริเวณ " + ชื่อสถานที่] และปรับซูมแผนที่เป็น z = 20
     * 3. หากยังไม่พบ จะดึง ซอย / ซอยย่อย -> แสดง ["ใกล้เคียง " + ชื่อซอย]
     */
    async #initGpsLocation({ forceRefresh = false } = {}) {
        if (!this.settings?.require_gps) return null;

        const coordsEl = document.getElementById('gpsCoordsText');
        const locNameEl = document.getElementById('gpsLocationNameText');
        const mapLink = document.getElementById('linkViewGoogleMap');
        const mapIframe = document.getElementById('googleMapRealtimeIframe');
        const mapPlaceholder = document.getElementById('googleMapPlaceholder');
        const headerTitleEl = document.getElementById('gpsCardHeaderTitle');
        const headerSpinnerEl = document.getElementById('gpsCardHeaderSpinner');
        const headerInfoIconEl = document.getElementById('gpsCardHeaderInfoIcon');

        if (!navigator.geolocation) {
            this.isResolvingLocation = false;
            if (headerTitleEl) headerTitleEl.textContent = 'พื้นที่ใกล้เคียง';
            headerSpinnerEl?.classList.add('hidden');
            headerInfoIconEl?.classList.remove('hidden');
            if (coordsEl) coordsEl.textContent = 'อุปกรณ์ไม่รองรับ GPS';
            if (locNameEl) locNameEl.textContent = 'ไม่สามารถระบุสถานที่ได้';
            this.#updateStatusCardsAndMainButton();
            return null;
        }

        if (forceRefresh) {
            AttendanceModel.clearLocationCache();
            this.gpsData.ready = false;
            this.gpsData.lat = null;
            this.gpsData.lng = null;
            this.gpsData.locationName = 'กำลังค้นหาสถานที่ใกล้เคียง...';
        }

        this.isResolvingLocation = true;
        if (headerTitleEl) headerTitleEl.textContent = 'พื้นที่ใกล้เคียง';
        headerSpinnerEl?.classList.remove('hidden');
        headerInfoIconEl?.classList.add('hidden');
        if (coordsEl) {
            coordsEl.textContent = forceRefresh ? 'กำลังดึงพิกัด GPS ใหม่...' : 'กำลังดึงพิกัด GPS...';
        }
        if (locNameEl) locNameEl.textContent = 'กำลังค้นหาสถานที่ใกล้เคียง...';
        this.gpsData.locationName = 'กำลังค้นหาสถานที่ใกล้เคียง...';
        this.#renderGeofenceStatusUI();
        this.#updateStep1Validation();
        this.#updateStatusCardsAndMainButton();

        const geoOptions = {
            enableHighAccuracy: true,
            timeout: forceRefresh ? 12000 : 8000,
            maximumAge: forceRefresh ? 0 : 5000
        };

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    this.gpsData.lat = lat;
                    this.gpsData.lng = lng;
                    this.gpsData.ready = true;
                    this.gpsData.zoomLevel = 19;

                    if (coordsEl) coordsEl.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

                    // Render inline Leaflet map
                    this.#renderInlineGpsMap(lat, lng);

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

                    // ค้นหาสถานที่ใกล้เคียงตามลำดับ Tier 0 (ราชการ) -> Tier 1 (POI/สถานที่จริง) -> Tier 2 (ซอย/ซอยย่อย) -> Tier 3/4
                    const resolveOptions = {
                        officialLocations: (this.settings?.official_locations || Config.DEFAULT_SETTINGS?.official_locations || []),
                        bypassCache: forceRefresh
                    };
                    this.locationResolvePromise = AttendanceModel.resolveLocationWithZoomMeta(lat, lng, resolveOptions).then(resMeta => {
                        this.isResolvingLocation = false;
                        if (headerTitleEl) headerTitleEl.textContent = 'พื้นที่ใกล้เคียง';
                        headerSpinnerEl?.classList.add('hidden');
                        headerInfoIconEl?.classList.remove('hidden');

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

                        this.#renderGeofenceStatusUI();
                        this.#updateStep1Validation();
                        this.#updateStatusCardsAndMainButton();
                        resolve(this.gpsData);
                        return resMeta.locationName;
                    }).catch(err => {
                        console.warn('Location resolve error:', err);
                        this.isResolvingLocation = false;
                        if (headerTitleEl) headerTitleEl.textContent = 'พื้นที่ใกล้เคียง';
                        headerSpinnerEl?.classList.add('hidden');
                        headerInfoIconEl?.classList.remove('hidden');
                        this.#renderGeofenceStatusUI();
                        this.#updateStep1Validation();
                        this.#updateStatusCardsAndMainButton();
                        resolve(this.gpsData);
                    });
                    this.#renderGeofenceStatusUI();
                    this.#updateStep1Validation();
                    this.#updateStatusCardsAndMainButton();
                },
                async (err) => {
                    console.warn('Geolocation error:', err);
                    this.isResolvingLocation = false;
                    if (headerTitleEl) headerTitleEl.textContent = 'พื้นที่ใกล้เคียง';
                    headerSpinnerEl?.classList.add('hidden');
                    headerInfoIconEl?.classList.remove('hidden');
                    this.gpsData.ready = false;
                    this.gpsData.lat = null;
                    this.gpsData.lng = null;
                    this.gpsData.locationName = 'ไม่สามารถระบุสถานที่ได้';
                    if (coordsEl) coordsEl.textContent = 'ไม่ได้เปิดการใช้งาน GPS';
                    if (locNameEl) locNameEl.textContent = 'กรุณาเปิดบริการตำแหน่งที่ตั้ง (Location Services)';
                    this.#renderGeofenceStatusUI();
                    this.#updateStep1Validation();
                    this.#updateStatusCardsAndMainButton();

                    if (this.settings?.require_gps) {
                        await UIHelpers.alert(
                            'กรุณาเปิดการใช้งานตำแหน่งที่ตั้ง (GPS)',
                            'ระบบบังคับให้ต้องเปิด GPS เพื่อระบุพิกัดและชื่อสถานที่ก่อนบันทึกลงเวลาปฏิบัติราชการ',
                            'warning'
                        );
                    }
                    resolve(this.gpsData);
                },
                geoOptions
            );
        });
    }

    #renderInlineGpsMap(lat, lng) {
        const container = document.getElementById('inlineGpsLeafletMap');
        if (!container || typeof L === 'undefined') return;

        const targetLat = Number(lat) || 13.7563;
        const targetLng = Number(lng) || 100.5018;

        // Determine office / workplace target coordinates
        const firstLoc = this.settings?.official_locations?.[0];
        const officeLat = Number(this.settings?.workplace_lat) || Number(firstLoc?.latitude) || 13.7387;
        const officeLng = Number(this.settings?.workplace_lng) || Number(firstLoc?.longitude) || 100.4958;

        try {
            if (!this.inlineGpsMap) {
                this.inlineGpsMap = L.map(container, {
                    zoomControl: false,
                    attributionControl: false,
                    dragging: true,
                    touchZoom: true,
                    scrollWheelZoom: false
                }).setView([targetLat, targetLng], 16);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19
                }).addTo(this.inlineGpsMap);

                // Red Marker: User GPS Location
                const redIcon = L.divIcon({
                    className: 'custom-pin-red',
                    html: '<div style="color: #dc2626; font-size: 18px; filter: drop-shadow(0 2px 4px rgba(220,38,38,0.5));"><i class="fa-solid fa-location-dot"></i></div>',
                    iconSize: [18, 18],
                    iconAnchor: [9, 18]
                });
                this.inlineUserMarker = L.marker([targetLat, targetLng], { icon: redIcon }).addTo(this.inlineGpsMap);

                // Blue Marker: Workplace Location
                const blueIcon = L.divIcon({
                    className: 'custom-pin-blue',
                    html: '<div style="color: #2563eb; font-size: 18px; filter: drop-shadow(0 2px 4px rgba(37,99,235,0.5));"><i class="fa-solid fa-location-dot"></i></div>',
                    iconSize: [18, 18],
                    iconAnchor: [9, 18]
                });
                this.inlineOfficeMarker = L.marker([officeLat, officeLng], { icon: blueIcon }).addTo(this.inlineGpsMap);

                // Workplace Radius Circle
                const radiusMeters = Number(this.settings?.geofence_radius) || Number(firstLoc?.radius_meters) || 700;
                this.inlineRadiusCircle = L.circle([officeLat, officeLng], {
                    radius: radiusMeters,
                    color: '#10b981',
                    fillColor: '#10b981',
                    fillOpacity: 0.12,
                    weight: 1.5
                }).addTo(this.inlineGpsMap);

                setTimeout(() => {
                    this.inlineGpsMap?.invalidateSize();
                }, 250);
            } else {
                this.inlineGpsMap.invalidateSize();
                this.inlineGpsMap.setView([targetLat, targetLng], 16);
                if (this.inlineUserMarker) {
                    this.inlineUserMarker.setLatLng([targetLat, targetLng]);
                }
            }
        } catch (e) {
            console.warn('[CheckinController] Inline GPS map initialization warning:', e);
        }
    }

    #bindEvents() {
        window.addEventListener('storage', (e) => {
            if (e.key === Config.STORAGE_KEYS.SESSION_USER && !e.newValue) {
                window.location.replace(UIHelpers.getRootBasePath());
            }
        });

        window.addEventListener('resize', () => {
            this.inlineGpsMap?.invalidateSize();
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

        document.getElementById('photoPreviewCard')?.addEventListener('click', () => this.#openFullscreenCamera());
        document.getElementById('btnCenterPhotoOverlay')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.#openFullscreenCamera();
        });
        document.getElementById('btnCloseFullscreenCamera')?.addEventListener('click', () => this.#closeFullscreenCamera());
        document.getElementById('btnFullscreenShutter')?.addEventListener('click', () => this.#captureAndCloseCamera());
        document.getElementById('btnStartCameraOverlay')?.addEventListener('click', () => this.#openFullscreenCamera());
        document.getElementById('btnStartCameraBottom')?.addEventListener('click', () => this.#openFullscreenCamera());
        document.getElementById('btnCapturePhoto')?.addEventListener('click', () => this.#captureAndCloseCamera());
        document.getElementById('btnInFrameShutter')?.addEventListener('click', () => this.#captureAndCloseCamera());
        document.getElementById('btnStopCamera')?.addEventListener('click', () => this.#closeFullscreenCamera());
        document.getElementById('btnRetakePhoto')?.addEventListener('click', () => this.#openFullscreenCamera());
        document.getElementById('cameraFallbackFileInput')?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (file) this.#handleFallbackFileSelected(file);
        });

        document.getElementById('btnNextStepCheckin')?.addEventListener('click', () => this.#goToStep(2));
        document.getElementById('btnPrevStepCheckin')?.addEventListener('click', () => this.#goToStep(1));

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
            document.getElementById('inlineGpsLeafletMap')?.classList.add('invisible');
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
                document.getElementById('inlineGpsLeafletMap')?.classList.remove('invisible');
                this.inlineGpsMap?.invalidateSize();
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

            const actionCard = document.getElementById('checkinActionCard');
            const shiftSelectEl = document.getElementById('checkinShiftSelect');
            const shiftContainer = document.getElementById('shiftSelectorContainer');
            const isShiftSelectorActive = Boolean(
                actionCard && !actionCard.classList.contains('hidden') &&
                shiftContainer && !shiftContainer.classList.contains('hidden')
            );
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
                'ระบบเปิดใช้งานการบังคับถ่ายภาพ กรุณาแตะที่กล่องรูปถ่ายเพื่อเปิดกล้องแล้วถ่ายภาพก่อนบันทึกลงเวลา',
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

        if (this.settings?.require_gps && (this.isResolvingLocation || !this.gpsData.locationName || this.gpsData.locationName.includes('กำลังค้นหา'))) {
            await UIHelpers.alert(
                'กำลังค้นหาสถานที่ใกล้เคียง',
                'ระบบกำลังค้นหาสถานที่ใกล้เคียง กรุณารอสักครู่จนกว่าจะขึ้นสถานที่ใกล้เคียงก่อนกดบันทึกลงเวลา',
                'warning'
            );
            return;
        }

        if (this.locationMode === 'ONSITE') {
            if (this.settings?.require_gps && this.settings?.enforce_geofence_radius !== false) {
                const evalRes = this.evaluateOnsiteGeofence(this.gpsData.lat, this.gpsData.lng);
                if (!evalRes.matched) {
                    await UIHelpers.alert(
                        'พิกัดอยู่นอกสถานที่ทำงาน',
                        `${evalRes.message}\n\nกรุณาตรวจสอบสัญญาณ GPS หรือเลือกโหมด "นอกสถานที่"`,
                        'warning'
                    );
                    return;
                }
            }
        } else if (this.locationMode === 'OFFSITE') {
            const finalRemark = (this.selectedOffsiteRemark === 'อื่นๆ')
                ? document.getElementById('offsiteCustomRemarkInput')?.value?.trim()
                : this.selectedOffsiteRemark;
            if (!finalRemark) {
                await UIHelpers.alert('กรุณาระบุหมายเหตุ', 'กรุณาระบุลักษณะงานนอกสถานที่ให้ครบถ้วนก่อนบันทึกลงเวลา', 'warning');
                return;
            }
            if (this.offsiteCustomGps.mode === 'map' && !this.offsiteCustomGps.lat) {
                await UIHelpers.alert('กรุณาระบุตำแหน่งในแผนที่', 'กรุณากดปุ่ม "ค้นหาพิกัดเอง" เพื่อเลือกตำแหน่งในแผนที่ก่อนบันทึกลงเวลา', 'warning');
                return;
            }
        }

        const btnSubmitMain = document.getElementById('btnSubmitCheckinMain');
        const originalBtnHtml = btnSubmitMain ? btnSubmitMain.innerHTML : '';
        if (btnSubmitMain) btnSubmitMain.disabled = true;

        const actionCard = document.getElementById('checkinActionCard');
        const shiftSelectEl = document.getElementById('checkinShiftSelect');
        const shiftContainer = document.getElementById('shiftSelectorContainer');
        const isShiftSelectorActive = Boolean(
            actionCard && !actionCard.classList.contains('hidden') &&
            shiftContainer && !shiftContainer.classList.contains('hidden')
        );

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
            (isNormalModeSetting && isShiftSelectorActive && (shiftObj.is_overtime || shiftObj.is_custom)) ||
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

        const locName = (this.gpsData?.locationName || document.getElementById('gpsLocationNameText')?.textContent || document.getElementById('gpsLocationName')?.textContent || 'ไม่ได้ระบุตำแหน่ง').trim();
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

            const finalLat = (this.locationMode === 'OFFSITE' && this.offsiteCustomGps.mode === 'map' && this.offsiteCustomGps.lat)
                ? this.offsiteCustomGps.lat
                : (this.settings.require_gps ? this.gpsData.lat : null);
            const finalLng = (this.locationMode === 'OFFSITE' && this.offsiteCustomGps.mode === 'map' && this.offsiteCustomGps.lng)
                ? this.offsiteCustomGps.lng
                : (this.settings.require_gps ? this.gpsData.lng : null);
            const finalLocName = (this.locationMode === 'OFFSITE' && this.offsiteCustomGps.mode === 'map' && this.offsiteCustomGps.locationName)
                ? this.offsiteCustomGps.locationName
                : (this.settings.require_gps ? this.gpsData.locationName : '');
            const finalRemark = (this.locationMode === 'OFFSITE')
                ? (this.selectedOffsiteRemark === 'อื่นๆ' ? (document.getElementById('offsiteCustomRemarkInput')?.value?.trim() || 'อื่นๆ') : this.selectedOffsiteRemark)
                : 'ในสถานที่';
            const finalDistanceMeters = (this.locationMode === 'ONSITE' && this.geofenceResult?.distanceMeters !== undefined)
                ? this.geofenceResult.distanceMeters
                : null;

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
                lat: finalLat,
                lng: finalLng,
                location_name: finalLocName,
                location_mode: this.locationMode,
                remark: finalRemark,
                distance_from_official_meters: finalDistanceMeters
            });

            UIHelpers.hideLoading();
            if (!res.success) {
                this.#updateStatusCardsAndMainButton();
                await UIHelpers.alert('ไม่สามารถลงเวลาได้', res.message, 'warning');
                return;
            }

            this.capturedPhotoDataUrl = '';
            this.#goToStep(1);
            await this.#resetPageAfterSave();
            await UIHelpers.alert('ลงเวลาปฏิบัติงานเรียบร้อยแล้ว', res.message, 'success');
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
            const resolveOptions = {
                officialLocations: (this.settings?.official_locations || Config.DEFAULT_SETTINGS?.official_locations || [])
            };
            AttendanceModel.resolveLocationName(this.gpsData.lat, this.gpsData.lng, resolveOptions).then(locName => {
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

        const updateCustomPinAndLocation = async (lat, lng, flyTo = false, explicitName = null, extent = null) => {
            const numLat = Number(lat);
            const numLng = Number(lng);
            if (isNaN(numLat) || isNaN(numLng)) return;

            this._spLocationUpdateSeq = (this._spLocationUpdateSeq || 0) + 1;
            const currentSeq = this._spLocationUpdateSeq;

            this.specialModalGps.customLat = numLat;
            this.specialModalGps.customLng = numLng;

            if (customCoordsDisp) {
                customCoordsDisp.textContent = `${numLat.toFixed(6)}, ${numLng.toFixed(6)}`;
            }

            if (this.spLeafletMarker) {
                this.spLeafletMarker.setLatLng([numLat, numLng]);
            }
            if (this.spLeafletMap && flyTo) {
                if (extent && extent.ymin != null && extent.xmin != null && extent.ymax != null && extent.xmax != null) {
                    const south = Math.min(Number(extent.ymin), Number(extent.ymax));
                    const north = Math.max(Number(extent.ymin), Number(extent.ymax));
                    const west = Math.min(Number(extent.xmin), Number(extent.xmax));
                    const east = Math.max(Number(extent.xmin), Number(extent.xmax));
                    if (Number.isFinite(south) && Number.isFinite(north) && Number.isFinite(west) && Number.isFinite(east)) {
                        this.spLeafletMap.fitBounds([
                            [south, west],
                            [north, east]
                        ], { animate: true, maxZoom: 18, padding: [30, 30] });
                    } else {
                        this.spLeafletMap.flyTo([numLat, numLng], 16, { animate: true, duration: 1 });
                    }
                } else {
                    this.spLeafletMap.flyTo([numLat, numLng], 16, { animate: true, duration: 1 });
                }
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
                const resolveOptions = {
                    officialLocations: (this.settings?.official_locations || Config.DEFAULT_SETTINGS?.official_locations || [])
                };
                const rawLocName = await AttendanceModel.resolveLocationName(numLat, numLng, resolveOptions);
                if (currentSeq !== this._spLocationUpdateSeq) return;
                const locName = (rawLocName || '').replace(/^(ใกล้เคียง|บริเวณ)\s*/, '').trim();
                this.specialModalGps.customLocationName = locName;
                if (customLocDisp) {
                    customLocDisp.textContent = locName || `พิกัด (${numLat.toFixed(5)}, ${numLng.toFixed(5)})`;
                }
            } catch (err) {
                if (currentSeq !== this._spLocationUpdateSeq) return;
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
                    let extent = null;
                    try {
                        if (itemEl.dataset.extent) extent = JSON.parse(itemEl.dataset.extent);
                    } catch (_) {}
                    if (searchInput) {
                        searchInput.value = name;
                    }
                    hideSearchResults();
                    if (!isNaN(lat) && !isNaN(lng)) {
                        await updateCustomPinAndLocation(lat, lng, true, name, extent);
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
                const extentAttr = item.extent ? ` data-extent="${escapeHtml(JSON.stringify(item.extent))}"` : '';

                return `
                    <div class="sp-search-item p-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer flex items-start gap-3 transition" data-lat="${itemLat}" data-lng="${itemLng}" data-name="${escapeHtml(mainName)}"${extentAttr}>
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
            let userProvince = '';
            if (this.gpsData?.locationName) {
                const pMatch = this.gpsData.locationName.match(/(?:จ\.|จังหวัด|กรุงเทพมหานคร|กรุงเทพฯ|กทม\.)([^\s,]+)?/i);
                if (pMatch) userProvince = pMatch[0].trim();
            }

            try {
                const items = await AttendanceModel.searchPlaces(query, {
                    refLat,
                    refLng,
                    userProvince,
                    limit: 8
                });

                if (currentSeq !== searchSeq) return;

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
            }, 450);
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
}

document.addEventListener('DOMContentLoaded', () => {
    new CheckinController();
});