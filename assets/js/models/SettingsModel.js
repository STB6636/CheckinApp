/**
 * @file assets/js/models/SettingsModel.js
 * @description คลาสจัดการข้อมูลตั้งค่าระบบ (หน่วยงาน, โลโก้, คำนำหน้า, ตำแหน่ง, สังกัด, ช่วงเวลา, เปิด/ปิดกล้อง, GPS และโหมดลงเวลาครั้งเดียว)
 */

import { Config } from '../core/Config.js';
import { DatabaseService } from '../core/DatabaseService.js';

export class SettingsModel {
    /**
     * ดึงข้อมูลตั้งค่าระบบจาก Supabase (หากยังไม่สามารถเชื่อมต่อได้จะใช้ค่า Cache หรือค่าเริ่มต้น)
     * @param {boolean} forceRefresh บังคับดึงข้อมูลใหม่จากฐานข้อมูล
     * @returns {Promise<Object>}
     */
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
        const { data, error } = await db
            .from('system_settings')
            .select('*')
            .eq('id', 1)
            .maybeSingle();

        if (error || !data) {
            console.warn('Using fallback default settings:', error);
            return structuredClone(Config.DEFAULT_SETTINGS);
        }

        const merged = {
            ...Config.DEFAULT_SETTINGS,
            ...data,
            single_click_checkin: Boolean(data.single_click_checkin ?? Config.DEFAULT_SETTINGS.single_click_checkin),
            prefixes: Array.isArray(data.prefixes) ? data.prefixes : Config.DEFAULT_SETTINGS.prefixes,
            positions: Array.isArray(data.positions) ? data.positions : Config.DEFAULT_SETTINGS.positions,
            affiliations: Array.isArray(data.affiliations) ? data.affiliations : Config.DEFAULT_SETTINGS.affiliations,
            remarks: Array.isArray(data.remarks) ? data.remarks : Config.DEFAULT_SETTINGS.remarks,
            work_shifts: Array.isArray(data.work_shifts) ? data.work_shifts : Config.DEFAULT_SETTINGS.work_shifts,
            category_colors: data.category_colors || Config.DEFAULT_SETTINGS.category_colors
        };

        sessionStorage.setItem(Config.STORAGE_KEYS.CACHED_SETTINGS, JSON.stringify(merged));
        return merged;
    }

    /**
     * บันทึกหรืออัปเดตการตั้งค่าระบบ (เฉพาะ SuperAdmin)
     * @param {Object} payload ข้อมูลตั้งค่าระบบที่ต้องการอัปเดต
     * @returns {Promise<{success: boolean, data?: Object, message: string}>}
     */
    static async updateSettings(payload) {
        const db = DatabaseService.getInstance().client;
        const updateData = {
            ...payload,
            id: 1,
            single_click_checkin: Boolean(payload.single_click_checkin),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await db
            .from('system_settings')
            .upsert(updateData, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('Update system_settings error:', error);
            return { success: false, message: 'ไม่สามารถบันทึกการตั้งค่าระบบได้: ' + error.message };
        }

        sessionStorage.setItem(Config.STORAGE_KEYS.CACHED_SETTINGS, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('bma:settings-updated', { detail: data }));

        return {
            success: true,
            data,
            message: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว'
        };
    }

    /**
     * แปลงไฟล์รูปภาพโลโก้เป็น Base64 Data URL เพื่อจัดเก็บและแสดงผล Preview ได้ทันทีบน GitHub Pages
     * @param {File} file
     * @returns {Promise<string>}
     */
    static fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }

    /**
     * ดึงรายการประเภทตำแหน่งแบบไม่ซ้ำ (Unique Position Types)
     * @param {Object} settings
     * @returns {Array<string>}
     */
    static getUniquePositionTypes(settings) {
        const positions = settings?.positions || [];
        return [...new Set(positions.map(p => p.type).filter(Boolean))];
    }

    /**
     * ดึงรายการชื่อสายงาน/ตำแหน่งแบบไม่ซ้ำ (กรองตามประเภทตำแหน่งได้)
     * @param {Object} settings
     * @param {string} filterType
     * @returns {Array<string>}
     */
    static getUniquePositionTitles(settings, filterType = '') {
        const positions = settings?.positions || [];
        const filtered = filterType
            ? positions.filter(p => p.type === filterType)
            : positions;
        return [...new Set(filtered.map(p => p.title).filter(Boolean))];
    }

    /**
     * ดึงรายการระดับตำแหน่งแบบไม่ซ้ำ (กรองตามประเภทตำแหน่งหรือชื่อตำแหน่งได้)
     * @param {Object} settings
     * @param {string} filterType
     * @param {string} filterTitle
     * @returns {Array<string>}
     */
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

    /**
     * ดึงรายการชื่อหน่วยงานหลักแบบไม่ซ้ำ
     * @param {Object} settings
     * @returns {Array<string>}
     */
    static getUniqueOrganizations(settings) {
        const affiliations = settings?.affiliations || [];
        const list = [...new Set(affiliations.map(a => a.organization).filter(Boolean))];
        return list.length > 0 ? list : [settings?.organization_name || 'กรุงเทพมหานคร'];
    }

    /**
     * ดึงรายการ สำนักงาน/กอง แบบไม่ซ้ำ
     * @param {Object} settings
     * @param {string} filterOrg
     * @returns {Array<string>}
     */
    static getUniqueBureaus(settings, filterOrg = '') {
        let affiliations = settings?.affiliations || [];
        if (filterOrg) {
            affiliations = affiliations.filter(a => a.organization === filterOrg);
        }
        const list = [...new Set(affiliations.map(a => a.bureau).filter(Boolean))];
        return list.length > 0 ? list : [settings?.bureau_name || 'สำนักเทศกิจ'];
    }

    /**
     * ดึงรายการ ส่วน/ฝ่าย แบบไม่ซ้ำ (กรองตาม สำนักงาน/กอง ได้)
     * @param {Object} settings
     * @param {string} filterBureau
     * @returns {Array<string>}
     */
    static getUniqueDivisions(settings, filterBureau = '') {
        let affiliations = settings?.affiliations || [];
        if (filterBureau) {
            affiliations = affiliations.filter(a => a.bureau === filterBureau);
        }
        return [...new Set(affiliations.map(a => a.division).filter(Boolean))];
    }

    /**
     * ดึงรายการ กลุ่มงาน แบบไม่ซ้ำ (กรองตาม สำนักงาน/กอง และ ส่วน/ฝ่าย ได้)
     * @param {Object} settings
     * @param {string} filterBureau
     * @param {string} filterDivision
     * @returns {Array<string>}
     */
    static getUniqueGroups(settings, filterBureau = '', filterDivision = '') {
        let affiliations = settings?.affiliations || [];
        if (filterBureau) {
            affiliations = affiliations.filter(a => a.bureau === filterBureau);
        }
        if (filterDivision) {
            affiliations = affiliations.filter(a => a.division === filterDivision);
        }
        return [...new Set(affiliations.map(a => a.group).filter(Boolean))];
    }
}