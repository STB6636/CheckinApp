/**
 * @file assets/js/models/SettingsModel.js
 * @description คลาสจัดการข้อมูลตั้งค่าระบบ (รองรับ allow_checkin_start_time, checkout_grace_minutes, filter_shifts_by_realtime และการแสดงชื่อช่วงเวลามาตรฐาน)
 */

import { Config } from '../core/Config.js';
import { DatabaseService } from '../core/DatabaseService.js';
import { UIHelpers } from '../core/UIHelpers.js';

export class SettingsModel {
    /**
     * จัดรูปแบบชื่อช่วงเวลาให้เป็นมาตรฐาน: "ชื่อตามที่ตั้งเอาไว้ ('เวลาเริ่มงาน' - 'เวลาเลิกงาน')"
     * และหากเป็นเวลาเลิกงานข้ามวัน ให้เพิ่ม "(ข้ามวัน)" ต่อท้ายตัวเลือก
     * @param {Object} shift
     * @returns {string}
     */
    static formatShiftDisplayText(shift) {
        if (!shift) return '-';
        // ตัดวงเล็บเวลาเดิมที่อาจติดอยู่ในชื่อออกก่อน เพื่อไม่ให้แสดงวงเล็บเวลาซ้ำซ้อน
        const cleanBaseName = String(shift.name || 'ช่วงเวลาทำงาน')
            .replace(/\s*\(\d{1,2}[:.]\d{2}\s*-\s*\d{1,2}[:.]\d{2}.*?\)/g, '')
            .replace(/\s*\(ระบุเวลาเอง\)/g, '')
            .replace(/\s*\(ข้ามวัน\)/g, '')
            .trim();

        if (shift.is_custom) {
            return `${cleanBaseName} (ระบุเวลาเอง)`;
        }

        const checkIn = UIHelpers.formatTime24(shift.check_in || '08:30');
        const checkOut = UIHelpers.formatTime24(shift.check_out || '16:30');
        const inMin = UIHelpers.timeToMinutes(checkIn);
        const outMin = UIHelpers.timeToMinutes(checkOut);
        const isOvernight = Boolean(shift.is_overnight || (inMin >= 0 && outMin >= 0 && outMin < inMin));

        return `${cleanBaseName} (${checkIn} - ${checkOut})${isOvernight ? ' (ข้ามวัน)' : ''}`;
    }

    static async getSettings(forceRefresh = false) {
        if (!forceRefresh) {
            const cached = sessionStorage.getItem(Config.STORAGE_KEYS.CACHED_SETTINGS);
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch (e) {
                    console.warn('Invalid cached settings:', e);
                }
            }
        }

        const db = DatabaseService.getInstance().client;
        let { data, error } = await db
            .from('system_settings')
            .select('*')
            .eq('id', 1)
            .maybeSingle();

        if (error || !data) {
            console.warn('Using fallback default settings:', error);
            return structuredClone(Config.DEFAULT_SETTINGS);
        }

        const mergedColors = {
            ...Config.DEFAULT_SETTINGS.category_colors,
            ...(data.category_colors || {})
        };

        const rawShifts = Array.isArray(data.work_shifts) && data.work_shifts.length > 0
            ? data.work_shifts
            : Config.DEFAULT_SETTINGS.work_shifts;

        const normalizedShifts = rawShifts.map(s => {
            const checkIn = UIHelpers.formatTime24(s.check_in || '08:30');
            const checkOut = UIHelpers.formatTime24(s.check_out || '16:30');
            const inMin = UIHelpers.timeToMinutes(checkIn);
            const outMin = UIHelpers.timeToMinutes(checkOut);
            const isOvernight = Boolean(s.is_overnight || (inMin > 0 && outMin >= 0 && outMin < inMin));

            return {
                name: s.name || 'เวลาราชการปกติ',
                check_in: checkIn,
                check_out: checkOut,
                is_custom: Boolean(s.is_custom),
                is_overtime: Boolean(s.is_overtime),
                is_overnight: isOvernight
            };
        });

        const merged = {
            ...Config.DEFAULT_SETTINGS,
            ...data,
            header_system_title: String(data.header_system_title || Config.DEFAULT_SETTINGS.header_system_title),
            allow_checkin_start_time: UIHelpers.formatTime24(data.allow_checkin_start_time || Config.DEFAULT_SETTINGS.allow_checkin_start_time),
            standard_check_in: UIHelpers.formatTime24(data.standard_check_in || Config.DEFAULT_SETTINGS.standard_check_in),
            standard_check_out: UIHelpers.formatTime24(data.standard_check_out || Config.DEFAULT_SETTINGS.standard_check_out),
            late_threshold_minutes: Number(data.late_threshold_minutes ?? Config.DEFAULT_SETTINGS.late_threshold_minutes),
            checkout_grace_minutes: Number(data.checkout_grace_minutes ?? Config.DEFAULT_SETTINGS.checkout_grace_minutes),
            filter_shifts_by_realtime: typeof data.filter_shifts_by_realtime === 'boolean'
                ? data.filter_shifts_by_realtime
                : (localStorage.getItem('bma_filter_shifts_by_realtime') !== null
                    ? localStorage.getItem('bma_filter_shifts_by_realtime') !== 'false'
                    : Boolean(Config.DEFAULT_SETTINGS.filter_shifts_by_realtime)),
            google_drive_script_url: String(data.google_drive_script_url ?? ''),
            google_drive_folder_id: String(data.google_drive_folder_id ?? ''),
            footer_description: String(data.footer_description ?? Config.DEFAULT_SETTINGS.footer_description),
            single_click_checkin: Boolean(data.single_click_checkin ?? Config.DEFAULT_SETTINGS.single_click_checkin),
            prefixes: Array.isArray(data.prefixes) ? data.prefixes : Config.DEFAULT_SETTINGS.prefixes,
            positions: Array.isArray(data.positions) ? data.positions : Config.DEFAULT_SETTINGS.positions,
            affiliations: Array.isArray(data.affiliations) ? data.affiliations : Config.DEFAULT_SETTINGS.affiliations,
            remarks: Array.isArray(data.remarks) ? data.remarks : Config.DEFAULT_SETTINGS.remarks,
            work_shifts: normalizedShifts,
            category_colors: mergedColors
        };

        sessionStorage.setItem(Config.STORAGE_KEYS.CACHED_SETTINGS, JSON.stringify(merged));
        return merged;
    }

    static async updateSettings(payload) {
        const db = DatabaseService.getInstance().client;
        const updateData = {
            id: 1,
            organization_name: payload.organization_name || 'กรุงเทพมหานคร',
            bureau_name: payload.bureau_name || 'สำนักเทศกิจ',
            header_system_title: payload.header_system_title || 'BMA e-Government Time Attendance System',
            logo_url: payload.logo_url || '',
            footer_description: payload.footer_description ?? '',
            require_photo: Boolean(payload.require_photo),
            require_gps: Boolean(payload.require_gps),
            single_click_checkin: Boolean(payload.single_click_checkin),
            allow_checkin_start_time: UIHelpers.formatTime24(payload.allow_checkin_start_time || '06:00'),
            standard_check_in: UIHelpers.formatTime24(payload.standard_check_in || '08:30'),
            standard_check_out: UIHelpers.formatTime24(payload.standard_check_out || '16:30'),
            late_threshold_minutes: Number(payload.late_threshold_minutes ?? 30),
            checkout_grace_minutes: Number(payload.checkout_grace_minutes ?? 30),
            filter_shifts_by_realtime: payload.filter_shifts_by_realtime !== false,
            google_drive_script_url: String(payload.google_drive_script_url || '').trim(),
            google_drive_folder_id: String(payload.google_drive_folder_id || '').trim(),
            prefixes: payload.prefixes || [],
            positions: payload.positions || [],
            affiliations: payload.affiliations || [],
            remarks: payload.remarks || [],
            work_shifts: payload.work_shifts || [],
            category_colors: payload.category_colors || Config.DEFAULT_SETTINGS.category_colors,
            updated_at: new Date().toISOString()
        };

        let { data, error } = await db
            .from('system_settings')
            .upsert(updateData, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            if (String(error.message || '').includes('filter_shifts_by_realtime')) {
                const fallbackUpdateData = { ...updateData };
                delete fallbackUpdateData.filter_shifts_by_realtime;
                const retryRes = await db.from('system_settings').upsert(fallbackUpdateData, { onConflict: 'id' }).select().single();
                data = retryRes.data;
                error = retryRes.error;
            }
        }
        if (error) {
            console.error('Update system_settings error:', error);
            return { success: false, message: 'ไม่สามารถบันทึกการตั้งค่าระบบได้: ' + error.message };
        }

        const filterRealtimeVal = payload.filter_shifts_by_realtime !== false;
        localStorage.setItem('bma_filter_shifts_by_realtime', String(filterRealtimeVal));
        const normalizedSavedData = {
            ...Config.DEFAULT_SETTINGS,
            ...data,
            filter_shifts_by_realtime: typeof data?.filter_shifts_by_realtime === 'boolean'
                ? data.filter_shifts_by_realtime
                : filterRealtimeVal
        };
        sessionStorage.setItem(Config.STORAGE_KEYS.CACHED_SETTINGS, JSON.stringify(normalizedSavedData));
        window.dispatchEvent(new CustomEvent('bma:settings-updated', { detail: normalizedSavedData }));

        return {
            success: true,
            data: normalizedSavedData,
            message: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว'
        };
    }

    static moveItemInArray(arr, fromIndex, direction) {
        if (!Array.isArray(arr)) return false;
        const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
        if (toIndex < 0 || toIndex >= arr.length) return false;

        const temp = arr[fromIndex];
        arr[fromIndex] = arr[toIndex];
        arr[toIndex] = temp;
        return true;
    }

    static fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }

    static getUniquePositionTypes(settings) {
        const positions = settings?.positions || [];
        return [...new Set(positions.map(p => p.type).filter(Boolean))];
    }

    static getUniquePositionTitles(settings, filterType = '') {
        const positions = settings?.positions || [];
        const filtered = filterType
            ? positions.filter(p => p.type === filterType)
            : positions;
        return [...new Set(filtered.map(p => p.title).filter(Boolean))];
    }

    static getUniquePositionLevels(settings, filterType = '', filterTitle = '') {
        let positions = settings?.positions || [];
        if (filterType) {
            positions = positions.filter(p => p.type === filterType);
        }
        if (filterTitle) {
            positions = positions.filter(p => p.title === filterTitle);
        }
        return [...new Set(positions.map(p => p.level).filter(Boolean))];
    }

    static getUniqueOrganizations(settings) {
        const affiliations = settings?.affiliations || [];
        const list = [...new Set(affiliations.map(a => a.organization).filter(Boolean))];
        return list.length > 0 ? list : [settings?.organization_name || 'กรุงเทพมหานคร'];
    }

    static getUniqueBureaus(settings, filterOrg = '') {
        let affiliations = settings?.affiliations || [];
        if (filterOrg) {
            affiliations = affiliations.filter(a => a.organization === filterOrg);
        }
        const list = [...new Set(affiliations.map(a => a.bureau).filter(Boolean))];
        return list.length > 0 ? list : [settings?.bureau_name || 'สำนักเทศกิจ'];
    }

    static getUniqueDivisions(settings, filterBureau = '', filterOrg = '') {
        let affiliations = settings?.affiliations || [];
        if (filterOrg) {
            affiliations = affiliations.filter(a => a.organization === filterOrg);
        }
        if (filterBureau) {
            affiliations = affiliations.filter(a => a.bureau === filterBureau);
        }
        return [...new Set(affiliations.map(a => a.division).filter(Boolean))];
    }

    static getUniqueGroups(settings, filterBureau = '', filterDivision = '', filterOrg = '') {
        let affiliations = settings?.affiliations || [];
        if (filterOrg) {
            affiliations = affiliations.filter(a => a.organization === filterOrg);
        }
        if (filterBureau) {
            affiliations = affiliations.filter(a => a.bureau === filterBureau);
        }
        if (filterDivision) {
            affiliations = affiliations.filter(a => a.division === filterDivision);
        }
        return [...new Set(affiliations.map(a => a.group).filter(Boolean))];
    }
}