/**
 * @file assets/js/models/AttendanceModel.js
 * @description คลาสจัดการการลงเวลาปฏิบัติราชการ (อัปเกรดระบบค้นหาสถานที่ใกล้เคียงความเร็วสูง เฉพาะหมวดหมู่เป้าหมาย + ซอย เพื่อไม่ให้หน่วงตอนบันทึกข้อมูล)
 */

import { Config } from '../core/Config.js';
import { DatabaseService } from '../core/DatabaseService.js';
import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { SettingsModel } from './SettingsModel.js';

export class AttendanceModel {
    // แคชเก็บชื่อสถานที่ตามพิกัด เพื่อให้การเรียกซ้ำในจุดเดิมทำงานเร็ว 0 มิลลิวินาที
    static #locationCache = new Map();

    static #calculateDistanceMeters(lat1, lon1, lat2, lon2) {
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

    static #minutesToTime24(totalMinutes) {
        const normalized = ((totalMinutes % 1440) + 1440) % 1440;
        const hh = String(Math.floor(normalized / 60)).padStart(2, '0');
        const mm = String(normalized % 60).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    /**
     * ตรวจสอบว่าสถานที่นี้อยู่ใน 5 กลุ่มเป้าหมายที่กำหนดหรือไม่:
     * 1. สถานที่สำคัญ (วัด, สนามหลวง, ท่าเรือ, วงเวียน, สะพาน, เสาหลักเมือง)
     * 2. สถานที่ราชการ
     * 3. บริการสาธารณะ (สถานีรถไฟ, สถานีรถไฟฟ้า, ป้ายรถเมล์)
     * 4. อพาร์ทเม้นส์, คอนโด, หอพัก
     * 5. ร้านค้า, ร้านอาหาร
     * @param {Object} tags
     * @param {string} name
     * @returns {{matched: boolean, priority: number}}
     */
    static #classifyTargetPlace(tags = {}, name = '') {
        const n = String(name || '').trim();
        if (!n) return { matched: false, priority: 99 };

        // 1. สถานที่สำคัญ (วัด, สนามหลวง, ท่าเรือ, วงเวียน, สะพาน, เสาหลักเมือง)
        const isLandmarkTag =
            tags.amenity === 'place_of_worship' ||
            tags.amenity === 'ferry_terminal' ||
            tags.man_made === 'pier' ||
            tags.man_made === 'bridge' ||
            tags.junction === 'roundabout' ||
            tags.historic === 'monument' ||
            tags.historic === 'memorial' ||
            tags.leisure === 'park';
        const isLandmarkName = /(วัด|พระอาราม|สนามหลวง|ท่าเรือ|ท่าข้าม|วงเวียน|สะพาน|เสาหลักเมือง|อนุสาวรีย์)/.test(n);
        if (isLandmarkTag || isLandmarkName) {
            return { matched: true, priority: 1 };
        }

        // 2. สถานที่ราชการ
        const isGovTag =
            tags.office === 'government' ||
            tags.building === 'government' ||
            tags.building === 'public' ||
            ['townhall', 'police', 'courthouse', 'public_building', 'fire_station', 'post_office', 'hospital', 'school', 'university', 'college'].includes(tags.amenity);
        const isGovName = /(สำนัก|สำนักงาน|กอง|กรม|กระทรวง|ศาลาว่าการ|เทศกิจ|เขต|สถานีตำรวจ|สน\.|โรงพยาบาล|รพ\.|โรงเรียน|มหาวิทยาลัย|วิทยาลัย|ศาล)/.test(n);
        if (isGovTag || isGovName) {
            return { matched: true, priority: 1 };
        }

        // 3. บริการสาธารณะ (สถานีรถไฟ, สถานีรถไฟฟ้า, ป้ายรถเมล์)
        const isTransitTag =
            tags.railway === 'station' ||
            tags.railway === 'halt' ||
            tags.railway === 'subway_entrance' ||
            tags.highway === 'bus_stop' ||
            tags.amenity === 'bus_station' ||
            Boolean(tags.public_transport);
        const isTransitName = /(สถานีรถไฟ|สถานีรถไฟฟ้า|BTS|MRT|ARL|ป้ายรถประจำทาง|ป้ายรถเมล์|ท่ารถ)/.test(n);
        if (isTransitTag || isTransitName) {
            return { matched: true, priority: 2 };
        }

        // 4. อพาร์ทเม้นส์, คอนโด, หอพัก
        const isResidenceTag =
            ['apartments', 'dormitory', 'residential', 'condominium', 'hotel', 'hostel'].includes(tags.building) ||
            ['apartment', 'hotel', 'hostel', 'guest_house', 'motel'].includes(tags.tourism);
        const isResidenceName = /(อพาร์ทเม้น|อพาร์ตเมนต์|คอนโด|หอพัก|แมนชั่น|เรสซิเดนซ์|เพลส|คอร์ท|ทาวเวอร์|วิลล่า|โฮเทล|โรงแรม|Apartment|Condo|Mansion|Residence|Place)/i.test(n);
        if (isResidenceTag || isResidenceName) {
            return { matched: true, priority: 2 };
        }

        // 5. ร้านค้า, ร้านอาหาร
        const isShopFoodTag =
            Boolean(tags.shop) ||
            ['restaurant', 'cafe', 'fast_food', 'food_court', 'marketplace', 'convenience', 'bakery', 'pharmacy'].includes(tags.amenity);
        const isShopFoodName = /(ร้าน|ภัตตาคาร|คาเฟ่|กาแฟ|ข้าวมันไก่|ก๋วยเตี๋ยว|ตามสั่ง|ตลาด|มินิมาร์ท|เซเว่น|7-Eleven|7-11|Lotus|Big\s*C|Tops|Cafe)/i.test(n);
        if (isShopFoodTag || isShopFoodName) {
            return { matched: true, priority: 3 };
        }

        return { matched: false, priority: 99 };
    }

    /**
     * ดึงชื่อ "ซอย" จากข้อมูลที่อยู่หรือเส้นทางรอบพิกัด (ใช้เมื่อไม่มีสถานที่ใน 5 กลุ่มหลัก)
     * @param {Object} nominatimData
     * @param {Array} overpassElements
     * @returns {string}
     */
    static #extractSoiFallback(nominatimData, overpassElements = []) {
        // 1. ค้นหาชื่อที่มีคำว่า "ซอย" หรือ "ตรอก" จากเส้นทางใน Overpass รัศมีใกล้เคียง
        for (const el of overpassElements) {
            const name = String(el?.tags?.['name:th'] || el?.tags?.name || '').trim();
            if (/(ซอย|ซ\.|ตรอก)/.test(name)) {
                return name;
            }
        }

        // 2. ค้นหาจากข้อมูล Nominatim
        if (nominatimData) {
            const addr = nominatimData.address || {};
            const candidates = [
                nominatimData.name,
                addr.soi,
                addr.road,
                addr. residential,
                addr.neighbourhood,
                addr.hamlet,
                addr.quarter
            ].filter(Boolean);

            for (const c of candidates) {
                const text = String(c).trim();
                if (/(ซอย|ซ\.|ตรอก)/.test(text)) {
                    return text;
                }
            }

            // ตรวจสอบใน display_name ว่ามีคำว่า "ซอย..." หรือไม่
            const displayParts = String(nominatimData.display_name || '').split(',').map(s => s.trim());
            const soiPart = displayParts.find(p => /(ซอย|ซ\.|ตรอก)/.test(p));
            if (soiPart) {
                return soiPart;
            }

            // หากเป็นถนนสายย่อยหรือถนนในจุดนั้น
            if (addr.road) {
                return String(addr.road).trim();
            }
            if (addr.suburb) {
                return `แขวง${String(addr.suburb).replace(/^แขวง/, '').trim()}`;
            }
        }

        return '';
    }

    /**
     * ค้นหาด้วย Fetch พร้อมกำหนดเวลาตัดจบ (Timeout) สั้นที่สุดเพื่อไม่ให้หน่วงระบบ
     */
    static async #fetchWithFastTimeout(url, timeoutMs = 1200) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
            clearTimeout(timer);
            if (!response.ok) return null;
            return await response.json();
        } catch (err) {
            clearTimeout(timer);
            return null;
        }
    }

    /**
     * ระบบค้นหาสถานที่ใกล้เคียงความเร็วสูง (Ultra-Fast Targeted Location Resolver):
     * - ใช้พิกัด Cache (0 มิลลิวินาที) หากพิกัดอยู่ในระยะเดิม
     * - ยิง Overpass API ([timeout:1]) และ Nominatim (zoom=18) พร้อมกันแบบขนาน ตัดจบภายใน 1.2 วินาที
     * - คัดกรองเฉพาะ: สถานที่สำคัญ (วัด, สนามหลวง, ท่าเรือ, วงเวียน, สะพาน, เสาหลักเมือง), สถานที่ราชการ,
     *   บริการสาธารณะ (สถานีรถไฟ, สถานีรถไฟฟ้า, ป้ายรถเมล์), ร้านค้า, ร้านอาหาร, อพาร์ทเม้นส์, คอนโด, หอพัก
     * - หากบริเวณนั้นไม่มีสถานที่ในกลุ่มข้างต้น จะดึง "ซอย" มาแสดงทันที
     * @param {number} lat
     * @param {number} lng
     * @returns {Promise<string>}
     */
    static async resolveLocationName(lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return 'ไม่ระบุสถานที่';
        }

        // 1. ตรวจสอบจาก Fast Coordinate Cache (ความละเอียดทศนิยม 4 ตำแหน่ง ~ 11 เมตร)
        const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        if (AttendanceModel.#locationCache.has(cacheKey)) {
            return AttendanceModel.#locationCache.get(cacheKey);
        }

        const overpassQuery = `[out:json][timeout:1];(node(around:60,${lat},${lng})["name"];way(around:60,${lat},${lng})["name"];);out center;`;
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&namedetails=1&accept-language=th`;

        // 2. ดึงข้อมูลทั้ง 2 แหล่งพร้อมกันแบบขนาน (ใช้เวลาไม่เกิน 1.2 วินาที)
        const [ovData, nomData] = await Promise.all([
            AttendanceModel.#fetchWithFastTimeout(overpassUrl, 1200),
            AttendanceModel.#fetchWithFastTimeout(nominatimUrl, 1200)
        ]);

        const elements = ovData?.elements || [];
        const matchedPlaces = [];

        // 3. ตรวจสอบสถานที่ในรัศมี 60 เมตรจาก Overpass ที่ตรงกับ 5 หมวดหมู่เป้าหมาย
        for (const el of elements) {
            const tags = el.tags || {};
            const placeName = String(tags['name:th'] || tags.name || '').trim();
            if (!placeName) continue;

            const classification = AttendanceModel.#classifyTargetPlace(tags, placeName);
            if (!classification.matched) continue;

            const elLat = el.lat ?? el.center?.lat;
            const elLon = el.lon ?? el.center?.lon;
            const dist = (typeof elLat === 'number' && typeof elLon === 'number')
                ? AttendanceModel.#calculateDistanceMeters(lat, lng, elLat, elLon)
                : 30;

            matchedPlaces.push({
                name: placeName,
                dist,
                priority: classification.priority
            });
        }

        // 4. ตรวจสอบสถานที่จาก Nominatim เพิ่มเติมเผื่อกรณีตรงจุดพิกัดพอดี
        if (nomData) {
            const addr = nomData.address || {};
            const namedetails = nomData.namedetails || {};
            const nomName = String(
                namedetails['name:th'] ||
                namedetails.name ||
                nomData.name ||
                addr.apartments ||
                addr.building ||
                addr.amenity ||
                addr.office ||
                addr.shop ||
                addr.tourism ||
                ''
            ).trim();

            if (nomName) {
                const classification = AttendanceModel.#classifyTargetPlace(
                    {
                        amenity: nomData.type,
                        building: nomData.category === 'building' ? nomData.type : '',
                        office: nomData.category === 'office' ? nomData.type : '',
                        shop: nomData.category === 'shop' ? nomData.type : '',
                        tourism: nomData.category === 'tourism' ? nomData.type : ''
                    },
                    nomName
                );

                if (classification.matched) {
                    const nLat = parseFloat(nomData.lat);
                    const nLon = parseFloat(nomData.lon);
                    const dist = (!isNaN(nLat) && !isNaN(nLon))
                        ? AttendanceModel.#calculateDistanceMeters(lat, lng, nLat, nLon)
                        : 10;

                    matchedPlaces.push({
                        name: nomName,
                        dist,
                        priority: classification.priority
                    });
                }
            }
        }

        // 5. หากพบสถานที่ในหมวดหมู่เป้าหมาย ให้เรียงตามระยะทางที่ใกล้ที่สุดก่อน
        if (matchedPlaces.length > 0) {
            matchedPlaces.sort((a, b) => {
                if (Math.abs(a.dist - b.dist) <= 12 && a.priority !== b.priority) {
                    return a.priority - b.priority;
                }
                return a.dist - b.dist;
            });

            const best = matchedPlaces[0];
            const finalResult = best.dist <= 20 ? best.name : `ใกล้เคียง ${best.name}`;
            AttendanceModel.#locationCache.set(cacheKey, finalResult);
            return finalResult;
        }

        // 6. หากบริเวณนั้นไม่มีสถานที่ใน 5 กลุ่มเป้าหมาย ให้ดึง "ซอย" มาแสดงทันที
        const soiOrRoad = AttendanceModel.#extractSoiFallback(nomData, elements);
        if (soiOrRoad) {
            const finalSoi = /(ซอย|ซ\.|ตรอก)/.test(soiOrRoad) ? soiOrRoad : `ใกล้เคียง ${soiOrRoad}`;
            AttendanceModel.#locationCache.set(cacheKey, finalSoi);
            return finalSoi;
        }

        const coordFallback = `พิกัด (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
        AttendanceModel.#locationCache.set(cacheKey, coordFallback);
        return coordFallback;
    }

    static evaluateOfficialStatus(log, settings) {
        const colors = {
            ...Config.DEFAULT_SETTINGS.category_colors,
            ...(settings?.category_colors || {})
        };

        if (!log) {
            return {
                status_key: 'no_checkin',
                status_label: 'ไม่ลงเวลา',
                row_color: colors.no_checkin || '#E11D48'
            };
        }

        const matchingShift = (settings?.work_shifts || []).find(s =>
            s.name === log.shift_name || SettingsModel.formatShiftDisplayText(s) === log.shift_name
        );

        if (
            log.is_overtime ||
            matchingShift?.is_overtime ||
            log.status === 'ปฏิบัติงานนอกเวลาราชการ'
        ) {
            return {
                status_key: 'overtime',
                status_label: 'ปฏิบัติงานนอกเวลาราชการ',
                row_color: colors.overtime || '#2563EB'
            };
        }

        if (log.is_special_request) {
            if (log.approval_status === 'rejected') {
                return {
                    status_key: 'absent_duty',
                    status_label: 'ขาดราชการ',
                    row_color: colors.absent_duty || '#EA580C'
                };
            }
            return {
                status_key: 'normal',
                status_label: 'ปฏิบัติงานปกติ',
                row_color: colors.normal || '#007B3E'
            };
        }

        if (log.status === 'ขาดราชการ') {
            return {
                status_key: 'absent_duty',
                status_label: 'ขาดราชการ',
                row_color: colors.absent_duty || '#EA580C'
            };
        }

        const stdStart = matchingShift?.check_in || settings?.standard_check_in || '08:30';
        const stdEnd = matchingShift?.check_out || settings?.standard_check_out || '16:30';
        const lateThreshold = Number(settings?.late_threshold_minutes ?? 30);

        const startMin = UIHelpers.timeToMinutes(stdStart);
        const endMin = UIHelpers.timeToMinutes(stdEnd);
        const checkInMin = UIHelpers.timeToMinutes(log.check_in_time);
        const checkOutMin = log.check_out_time ? UIHelpers.timeToMinutes(log.check_out_time) : -1;

        if (checkInMin < 0) {
            return {
                status_key: 'no_checkin',
                status_label: 'ไม่ลงเวลา',
                row_color: colors.no_checkin || '#E11D48'
            };
        }

        if (checkInMin > startMin + lateThreshold) {
            return {
                status_key: 'absent_duty',
                status_label: 'ขาดราชการ',
                row_color: colors.absent_duty || '#EA580C'
            };
        }

        const isOvernight = Boolean(matchingShift?.is_overnight || endMin < startMin);
        if (!isOvernight && checkOutMin !== -1 && checkOutMin < endMin) {
            return {
                status_key: 'absent_duty',
                status_label: 'ขาดราชการ',
                row_color: colors.absent_duty || '#EA580C'
            };
        }

        if (checkInMin > startMin) {
            return {
                status_key: 'late',
                status_label: 'มาสาย',
                row_color: colors.late || '#EAB308'
            };
        }

        return {
            status_key: 'normal',
            status_label: 'ปฏิบัติงานปกติ',
            row_color: colors.normal || '#007B3E'
        };
    }

    static async getTodayRecordsListForUser(personnelId, userId, workDate = UIHelpers.getTodayISO()) {
        const db = DatabaseService.getInstance().client;
        let query = db
            .from('attendance_logs')
            .select('id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time, check_in_location, check_out_location, status, remark, row_color, is_overtime, is_special_request, approval_status, created_at')
            .eq('work_date', workDate)
            .order('created_at', { ascending: true });

        if (personnelId) {
            query = query.eq('personnel_id', personnelId);
        } else if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching today records list:', error);
            return [];
        }
        return (data || []).filter(r => !r.is_special_request || r.approval_status === 'approved');
    }

    static async getTodayRegularRecordForUser(personnelId, userId, workDate = UIHelpers.getTodayISO()) {
        const list = await AttendanceModel.getTodayRecordsListForUser(personnelId, userId, workDate);
        return list.find(r => !r.is_overtime && r.status !== 'ปฏิบัติงานนอกเวลาราชการ') || null;
    }

    static async getActiveRegularRecordForCheckout(personnelId, userId, settings) {
        const todayIso = UIHelpers.getTodayISO();
        const todayReg = await AttendanceModel.getTodayRegularRecordForUser(personnelId, userId, todayIso);
        if (todayReg) {
            return todayReg;
        }

        const nowMin = UIHelpers.timeToMinutes(UIHelpers.getCurrentTimeHHMM());
        const startAllowMin = UIHelpers.timeToMinutes(settings?.allow_checkin_start_time || '06:00');

        if (nowMin < startAllowMin) {
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const offsetMs = yesterdayDate.getTimezoneOffset() * 60000;
            const yesterdayIso = new Date(yesterdayDate.getTime() - offsetMs).toISOString().slice(0, 10);

            const yesterdayReg = await AttendanceModel.getTodayRegularRecordForUser(personnelId, userId, yesterdayIso);
            if (yesterdayReg && yesterdayReg.check_in_time && !yesterdayReg.check_out_time) {
                return yesterdayReg;
            }
        }

        return null;
    }

    static async getPersonalAttendanceHistory(personnelId, userId, limit = 150) {
        const db = DatabaseService.getInstance().client;
        const settings = await SettingsModel.getSettings(false);

        let query = db
            .from('attendance_logs')
            .select('id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time, check_in_location, status, remark, row_color, is_overtime, is_special_request, approval_status, created_at')
            .order('work_date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit);

        if (personnelId) {
            query = query.eq('personnel_id', personnelId);
        } else if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching personal history:', error);
            return [];
        }

        const activeLogs = (data || []).filter(r => !r.is_special_request || r.approval_status === 'approved');

        return activeLogs.map(log => {
            const evalStatus = AttendanceModel.evaluateOfficialStatus(log, settings);
            return {
                ...log,
                check_in_time: UIHelpers.formatTime24(log.check_in_time),
                check_out_time: UIHelpers.formatTime24(log.check_out_time),
                status_key: evalStatus.status_key,
                status_label: evalStatus.status_label,
                row_color: evalStatus.row_color
            };
        });
    }

    static async getPersonalSpecialRequests(personnelId, userId) {
        const db = DatabaseService.getInstance().client;
        let query = db
            .from('attendance_logs')
            .select('id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time, status, remark, is_overtime, is_special_request, approval_status, created_at')
            .eq('is_special_request', true)
            .order('work_date', { ascending: false })
            .order('created_at', { ascending: false });

        if (personnelId) {
            query = query.eq('personnel_id', personnelId);
        } else if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching personal special requests:', error);
            return [];
        }

        return (data || []).map(item => ({
            ...item,
            check_in_time: UIHelpers.formatTime24(item.check_in_time),
            check_out_time: UIHelpers.formatTime24(item.check_out_time)
        }));
    }

    static async deletePendingSpecialRequestByUser(logId, personnelId, userId) {
        const db = DatabaseService.getInstance().client;

        const { data: target, error: findErr } = await db
            .from('attendance_logs')
            .select('id, personnel_id, user_id, is_special_request, approval_status')
            .eq('id', logId)
            .maybeSingle();

        if (findErr || !target) {
            return { success: false, message: 'ไม่พบรายการคำขอที่ต้องการลบ' };
        }

        if (!target.is_special_request || target.approval_status !== 'pending') {
            return {
                success: false,
                message: 'ไม่สามารถลบได้ เนื่องจากคำขอนี้ได้รับการพิจารณาอนุมัติหรือปฏิเสธไปแล้ว'
            };
        }

        if (personnelId && target.personnel_id && target.personnel_id !== personnelId) {
            return { success: false, message: 'คุณไม่มีสิทธิ์ลบคำขอของผู้อื่น' };
        }

        const { error: delErr } = await db
            .from('attendance_logs')
            .delete()
            .eq('id', logId);

        if (delErr) {
            return { success: false, message: 'เกิดข้อผิดพลาดในการลบคำขอ: ' + delErr.message };
        }

        return { success: true, message: 'ลบคำขอลงเวลากรณีพิเศษเรียบร้อยแล้ว' };
    }

    static async submitCheckinOrCheckout(payload) {
        const db = DatabaseService.getInstance().client;
        const settings = await SettingsModel.getSettings(false);
        const colors = settings.category_colors || Config.DEFAULT_SETTINGS.category_colors;

        const today = payload.work_date || UIHelpers.getTodayISO();
        const currentTime = UIHelpers.formatTime24(payload.time || UIHelpers.getCurrentTimeHHMM());
        const nowMin = UIHelpers.timeToMinutes(currentTime);

        const shiftStartRef = UIHelpers.formatTime24(payload.shift_check_in || settings.standard_check_in || '08:30');
        const shiftEndRef = UIHelpers.formatTime24(payload.shift_check_out || settings.standard_check_out || '16:30');

        const activeRegularRecord = await AttendanceModel.getActiveRegularRecordForCheckout(
            payload.personnel_id,
            payload.user_id,
            settings
        );

        const hasUnclosedRegular = Boolean(
            activeRegularRecord &&
            activeRegularRecord.check_in_time &&
            !activeRegularRecord.check_out_time
        );

        if (!payload.single_click_checkin && hasUnclosedRegular && !payload.force_overtime) {
            const matchingShift = (settings.work_shifts || []).find(s =>
                s.name === activeRegularRecord.shift_name ||
                SettingsModel.formatShiftDisplayText(s) === activeRegularRecord.shift_name
            );
            const targetOutRef = UIHelpers.formatTime24(matchingShift?.check_out || settings.standard_check_out || shiftEndRef);
            const targetOutMin = UIHelpers.timeToMinutes(targetOutRef);
            const graceMinutes = Number(settings.checkout_grace_minutes ?? 30);

            let effectiveCheckOutTime = payload.custom_check_out_time || currentTime;

            if (!payload.custom_check_out_time) {
                const isNextDayCheckout = activeRegularRecord.work_date !== today;
                const effectiveNowMin = isNextDayCheckout ? (nowMin + 1440) : nowMin;

                if (effectiveNowMin > targetOutMin) {
                    if (effectiveNowMin <= targetOutMin + graceMinutes) {
                        effectiveCheckOutTime = currentTime;
                    } else {
                        effectiveCheckOutTime = AttendanceModel.#minutesToTime24(targetOutMin + graceMinutes);
                    }
                }
            }

            const evalOut = AttendanceModel.evaluateOfficialStatus({
                check_in_time: activeRegularRecord.check_in_time,
                check_out_time: effectiveCheckOutTime,
                shift_name: activeRegularRecord.shift_name,
                is_overtime: false,
                is_special_request: false
            }, settings);

            const updateOut = {
                check_out_time: effectiveCheckOutTime,
                check_out_photo: payload.photo_url || activeRegularRecord.check_out_photo || '',
                check_out_lat: payload.lat ?? activeRegularRecord.check_out_lat,
                check_out_lng: payload.lng ?? activeRegularRecord.check_out_lng,
                check_out_location: payload.location_name || activeRegularRecord.check_out_location || '',
                status: evalOut.status_label,
                row_color: evalOut.row_color,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await db
                .from('attendance_logs')
                .update(updateOut)
                .eq('id', activeRegularRecord.id)
                .select()
                .single();

            if (error) {
                return { success: false, message: 'ไม่สามารถบันทึกลงเวลาออกงานได้: ' + error.message };
            }

            return {
                success: true,
                data,
                message: `บันทึกลงเวลาออกงานสำเร็จ เวลา ${effectiveCheckOutTime} น. (สถานะ: ${evalOut.status_label})`
            };
        }

        const todayLogs = await AttendanceModel.getTodayRecordsListForUser(
            payload.personnel_id,
            payload.user_id,
            today
        );

        const isOvertimeFlow = Boolean(payload.is_overtime_shift);

        if (isOvertimeFlow) {
            const otShiftName = payload.shift_name || `ปฏิบัติงานนอกเวลา (${shiftStartRef} - ${shiftEndRef})`;
            const otCheckIn = UIHelpers.formatTime24(payload.custom_check_in_time || shiftStartRef);
            const otCheckOut = UIHelpers.formatTime24(payload.custom_check_out_time || shiftEndRef);

            const duplicateOt = todayLogs.find(r =>
                (r.is_overtime || r.status === 'ปฏิบัติงานนอกเวลาราชการ') &&
                (
                    r.shift_name === otShiftName ||
                    (UIHelpers.formatTime24(r.check_in_time) === otCheckIn && UIHelpers.formatTime24(r.check_out_time) === otCheckOut)
                )
            );

            if (duplicateOt) {
                return {
                    success: false,
                    message: `ไม่สามารถลงเวลาซ้ำได้ เนื่องจากท่านได้ลงเวลาปฏิบัติงานนอกเวลาในช่วง "${otShiftName}" ในวันนี้ไปแล้ว`
                };
            }

            const insertOtData = {
                personnel_id: payload.personnel_id || null,
                user_id: payload.user_id || null,
                work_date: today,
                shift_name: otShiftName,
                check_in_time: otCheckIn,
                check_out_time: otCheckOut,
                check_in_photo: payload.photo_url || '',
                check_out_photo: payload.photo_url || '',
                check_in_lat: payload.lat ?? null,
                check_in_lng: payload.lng ?? null,
                check_in_location: payload.location_name || '',
                check_out_lat: payload.lat ?? null,
                check_out_lng: payload.lng ?? null,
                check_out_location: payload.location_name || '',
                status: 'ปฏิบัติงานนอกเวลาราชการ',
                remark: payload.remark || (payload.is_overnight ? 'ปฏิบัติงานนอกเวลา (ข้ามวัน)' : 'ปฏิบัติงานนอกเวลา'),
                row_color: colors.overtime || '#2563EB',
                is_overtime: true,
                is_special_request: false,
                approval_status: 'approved'
            };

            const { data: createdOt, error: otError } = await db
                .from('attendance_logs')
                .insert(insertOtData)
                .select()
                .single();

            if (otError) {
                return { success: false, message: 'ไม่สามารถบันทึกลงเวลาปฏิบัติงานนอกเวลาได้: ' + otError.message };
            }

            return {
                success: true,
                data: createdOt,
                message: `บันทึก "ปฏิบัติงานนอกเวลา" สำเร็จ (${otCheckIn} - ${otCheckOut} น.)`
            };
        }

        const regularRecordToday = todayLogs.find(r => !r.is_overtime && r.status !== 'ปฏิบัติงานนอกเวลาราชการ') || null;
        const startAllowRef = UIHelpers.formatTime24(settings.allow_checkin_start_time || '06:00');
        const startAllowMin = UIHelpers.timeToMinutes(startAllowRef);

        if (nowMin < startAllowMin) {
            return {
                success: false,
                message: `สามารถเริ่มบันทึกเวลาเข้างานปกติได้ตั้งแต่เวลา ${startAllowRef} น. เป็นต้นไป (ขณะนี้สามารถเลือกบันทึกช่วงเวลาปฏิบัติงานนอกเวลาได้)`
            };
        }

        if (regularRecordToday && regularRecordToday.check_in_time && regularRecordToday.check_out_time) {
            return {
                success: false,
                message: `วันนี้ท่านได้ลงเวลาเข้างาน (${UIHelpers.formatTime24(regularRecordToday.check_in_time)} น.) และออกงาน (${UIHelpers.formatTime24(regularRecordToday.check_out_time)} น.) ในเวลาทำการปกติครบ 1 ครั้งแล้ว`
            };
        }

        const isSingleClickMode = Boolean(payload.single_click_checkin);

        if (isSingleClickMode) {
            const checkInFinal = UIHelpers.formatTime24(payload.custom_check_in_time || shiftStartRef);
            const checkOutFinal = UIHelpers.formatTime24(payload.custom_check_out_time || shiftEndRef);

            const evalResult = AttendanceModel.evaluateOfficialStatus({
                check_in_time: checkInFinal,
                check_out_time: checkOutFinal,
                shift_name: payload.shift_name,
                is_overtime: false,
                is_special_request: false
            }, settings);

            const insertBoth = {
                personnel_id: payload.personnel_id || null,
                user_id: payload.user_id || null,
                work_date: today,
                shift_name: payload.shift_name || `เวลาราชการปกติ (${shiftStartRef} - ${shiftEndRef})`,
                check_in_time: checkInFinal,
                check_out_time: checkOutFinal,
                check_in_photo: payload.photo_url || '',
                check_out_photo: payload.photo_url || '',
                check_in_lat: payload.lat ?? null,
                check_in_lng: payload.lng ?? null,
                check_in_location: payload.location_name || '',
                check_out_lat: payload.lat ?? null,
                check_out_lng: payload.lng ?? null,
                check_out_location: payload.location_name || '',
                status: evalResult.status_label,
                remark: payload.remark || '',
                row_color: evalResult.row_color,
                is_overtime: false,
                is_special_request: false,
                approval_status: 'approved'
            };

            const { data, error } = await db
                .from('attendance_logs')
                .insert(insertBoth)
                .select()
                .single();

            if (error) {
                return { success: false, message: 'ไม่สามารถบันทึกลงเวลาได้: ' + error.message };
            }

            return {
                success: true,
                data,
                message: `บันทึกลงเวลารูปแบบพิเศษสำเร็จ! เข้างาน ${checkInFinal} น. / ออกงาน ${checkOutFinal} น. (สถานะ: ${evalResult.status_label})`
            };
        }

        const checkInTime = UIHelpers.formatTime24(payload.custom_check_in_time || currentTime);
        const evalIn = AttendanceModel.evaluateOfficialStatus({
            check_in_time: checkInTime,
            check_out_time: null,
            shift_name: payload.shift_name,
            is_overtime: false,
            is_special_request: false
        }, settings);

        const insertIn = {
            personnel_id: payload.personnel_id || null,
            user_id: payload.user_id || null,
            work_date: today,
            shift_name: payload.shift_name || `เวลาราชการปกติ (${shiftStartRef} - ${shiftEndRef})`,
            check_in_time: checkInTime,
            check_in_photo: payload.photo_url || '',
            check_in_lat: payload.lat ?? null,
            check_in_lng: payload.lng ?? null,
            check_in_location: payload.location_name || '',
            status: evalIn.status_label,
            remark: payload.remark || '',
            row_color: evalIn.row_color,
            is_overtime: false,
            is_special_request: false,
            approval_status: 'approved'
        };

        const { data, error } = await db
            .from('attendance_logs')
            .insert(insertIn)
            .select()
            .single();

        if (error) {
            return { success: false, message: 'ไม่สามารถบันทึกลงเวลาเข้างานได้: ' + error.message };
        }

        return {
            success: true,
            data,
            message: `บันทึกลงเวลาเข้างานสำเร็จ เวลา ${checkInTime} น. (สถานะ: ${evalIn.status_label})`
        };
    }

    static async submitSpecialRequest(payload) {
        if (!payload.work_date || !payload.shift_name || !payload.remark) {
            return { success: false, message: 'กรุณาเลือกวันที่ ช่วงเวลา และระบุหมายเหตุให้ครบถ้วน' };
        }

        const settings = await SettingsModel.getSettings(false);
        const colors = settings.category_colors || Config.DEFAULT_SETTINGS.category_colors;

        const isOvertimeShift = Boolean(payload.is_overtime);
        const targetStatus = isOvertimeShift ? 'ปฏิบัติงานนอกเวลาราชการ' : 'ปฏิบัติงานปกติ';
        const targetColor = isOvertimeShift ? (colors.overtime || '#2563EB') : (colors.normal || '#007B3E');

        const checkIn24 = UIHelpers.formatTime24(payload.check_in_time || settings.standard_check_in || '08:30');
        const checkOut24 = UIHelpers.formatTime24(payload.check_out_time || settings.standard_check_out || '16:30');

        const db = DatabaseService.getInstance().client;
        const insertData = {
            personnel_id: payload.personnel_id || null,
            user_id: payload.user_id || null,
            work_date: payload.work_date,
            shift_name: payload.shift_name,
            check_in_time: checkIn24,
            check_out_time: checkOut24,
            check_in_photo: payload.photo_url || '',
            check_out_photo: payload.photo_url || '',
            check_in_lat: payload.lat ?? null,
            check_in_lng: payload.lng ?? null,
            check_in_location: payload.location_name || 'ขอลงเวลากรณีพิเศษ',
            status: targetStatus,
            remark: payload.remark,
            row_color: targetColor,
            is_overtime: isOvertimeShift,
            is_special_request: true,
            approval_status: 'pending'
        };

        const { data, error } = await db
            .from('attendance_logs')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            return { success: false, message: 'ไม่สามารถส่งคำขอลงเวลากรณีพิเศษได้: ' + error.message };
        }

        return {
            success: true,
            data,
            message: `ส่งคำขอลงเวลากรณีพิเศษสำเร็จ (${checkIn24} - ${checkOut24} น. สถานะ: ${targetStatus}) รอผู้ดูแลระบบอนุมัติ`
        };
    }

    static async getSpecialRequests(currentUser, statusFilter = 'pending') {
        const db = DatabaseService.getInstance().client;
        let query = db
            .from('attendance_logs')
            .select(`
                id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time,
                status, remark, row_color, is_overtime, is_special_request, approval_status, created_at,
                personnel:personnel_id (
                    id, national_id, prefix, first_name, last_name,
                    position_type, position_title, position_level,
                    organization, bureau, division, work_group
                )
            `)
            .eq('is_special_request', true)
            .order('work_date', { ascending: false })
            .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
            query = query.eq('approval_status', statusFilter);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching special requests:', error);
            return [];
        }

        const list = data || [];
        if (!currentUser || currentUser.role === 'SuperAdmin') {
            return list;
        }

        return list.filter(item => {
            const p = item.personnel || {};
            return AuthService.canViewRecordByScope(currentUser, {
                bureau: p.bureau || '',
                division: p.division || ''
            });
        });
    }

    static async processSpecialRequestsBulk(logIds, decision, approverUserId) {
        if (!Array.isArray(logIds) || logIds.length === 0) {
            return { success: false, count: 0, message: 'กรุณาเลือกรายการที่ต้องการดำเนินการอย่างน้อย 1 รายการ' };
        }

        const db = DatabaseService.getInstance().client;
        const settings = await SettingsModel.getSettings(false);
        const colors = settings.category_colors || Config.DEFAULT_SETTINGS.category_colors;

        const { data: targetLogs } = await db
            .from('attendance_logs')
            .select('id, is_overtime, status')
            .in('id', logIds);

        let updatedCount = 0;
        for (const item of (targetLogs || [])) {
            const isOt = Boolean(item.is_overtime || item.status === 'ปฏิบัติงานนอกเวลาราชการ');
            const newStatus = decision === 'approved'
                ? (isOt ? 'ปฏิบัติงานนอกเวลาราชการ' : 'ปฏิบัติงานปกติ')
                : 'ขาดราชการ';
            const newColor = decision === 'approved'
                ? (isOt ? (colors.overtime || '#2563EB') : (colors.normal || '#007B3E'))
                : (colors.absent_duty || '#EA580C');

            const { error } = await db
                .from('attendance_logs')
                .update({
                    approval_status: decision,
                    status: newStatus,
                    row_color: newColor,
                    approved_by: approverUserId || null,
                    approved_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', item.id);

            if (!error) updatedCount++;
        }

        const actionLabel = decision === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ';
        return {
            success: updatedCount > 0,
            count: updatedCount,
            message: `${actionLabel}รายการลงเวลากรณีพิเศษจำนวน ${updatedCount} รายการเรียบร้อยแล้ว`
        };
    }

    static getDatesBetween(startDate, endDate) {
        const dates = [];
        const start = new Date(startDate);
        const end = new Date(endDate || startDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            return [startDate];
        }

        const cursor = new Date(start);
        let guard = 0;
        while (cursor <= end && guard < 95) {
            const iso = cursor.toISOString().slice(0, 10);
            dates.push(iso);
            cursor.setDate(cursor.getDate() + 1);
            guard++;
        }
        return dates;
    }

    static async getReportRecordsByDateRange(startDate, endDate, currentUser) {
        const db = DatabaseService.getInstance().client;
        const settings = await SettingsModel.getSettings(false);
        const effectiveEnd = endDate && endDate >= startDate ? endDate : startDate;
        const dateList = AttendanceModel.getDatesBetween(startDate, effectiveEnd);

        const [personnelRes, logsRes] = await Promise.all([
            db.from('personnel')
                .select('id, national_id, prefix, first_name, last_name, position_type, position_title, position_level, organization, bureau, division, work_group')
                .order('bureau', { ascending: true })
                .order('division', { ascending: true })
                .order('work_group', { ascending: true })
                .order('first_name', { ascending: true }),
            db.from('attendance_logs')
                .select('id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time, check_in_lat, check_in_lng, check_in_location, check_out_lat, check_out_lng, check_out_location, check_in_photo, check_out_photo, status, remark, row_color, is_overtime, is_special_request, approval_status, created_at')
                .gte('work_date', startDate)
                .lte('work_date', effectiveEnd)
                .order('work_date', { ascending: true })
                .order('created_at', { ascending: true })
        ]);

        const allPersonnel = (personnelRes.data || []).filter(p =>
            !currentUser || currentUser.role === 'SuperAdmin'
                ? true
                : AuthService.canViewRecordByScope(currentUser, p)
        );

        const logsMap = new Map();
        for (const log of (logsRes.data || [])) {
            if (!log.personnel_id) continue;
            if (log.is_special_request && log.approval_status !== 'approved') continue;

            const key = `${log.personnel_id}_${log.work_date}`;
            if (!logsMap.has(key)) {
                logsMap.set(key, []);
            }
            logsMap.get(key).push(log);
        }

        const resultRows = [];

        for (const workDate of dateList) {
            for (const person of allPersonnel) {
                const key = `${person.id}_${workDate}`;
                const personDayLogs = logsMap.get(key) || [];

                if (personDayLogs.length === 0) {
                    const evalEmpty = AttendanceModel.evaluateOfficialStatus(null, settings);
                    resultRows.push(AttendanceModel.#formatReportRow(person, null, workDate, evalEmpty));
                } else {
                    for (const log of personDayLogs) {
                        const evalLog = AttendanceModel.evaluateOfficialStatus(log, settings);
                        resultRows.push(AttendanceModel.#formatReportRow(person, log, workDate, evalLog));
                    }
                }
            }
        }

        return resultRows;
    }

    static #formatReportRow(person, log, workDate, evalStatus) {
        const rowUid = log ? log.id : `${person.id}_${workDate}_empty`;
        return {
            row_uid: rowUid,
            personnel_id: person.id,
            log_id: log ? log.id : null,
            national_id: person.national_id || '',
            prefix: person.prefix,
            first_name: person.first_name,
            last_name: person.last_name,
            full_name: `${person.prefix}${person.first_name} ${person.last_name}`,
            position_type: person.position_type,
            position_title: person.position_title,
            position_level: person.position_level,
            position_full: `${person.position_title}${person.position_level ? ' ระดับ' + person.position_level : ''}`,
            organization: person.organization,
            bureau: person.bureau,
            division: person.division,
            work_group: person.work_group,
            work_date: workDate,
            work_date_thai_short: UIHelpers.formatThaiShortDate(workDate),
            work_date_thai_full: UIHelpers.formatThaiFullDate(workDate),
            shift_name: log?.shift_name || 'เวลาราชการปกติ (08:30 - 16:30)',
            check_in_time: log?.check_in_time ? UIHelpers.formatTime24(log.check_in_time) : '',
            check_out_time: log?.check_out_time ? UIHelpers.formatTime24(log.check_out_time) : '',
            check_in_lat: log?.check_in_lat ?? null,
            check_in_lng: log?.check_in_lng ?? null,
            check_in_location: log?.check_in_location || '',
            check_out_lat: log?.check_out_lat ?? null,
            check_out_lng: log?.check_out_lng ?? null,
            check_out_location: log?.check_out_location || '',
            check_in_photo: log?.check_in_photo || '',
            check_out_photo: log?.check_out_photo || '',
            remark: log?.remark || '',
            status_category: evalStatus.status_key,
            status_label: evalStatus.status_label,
            row_color: evalStatus.row_color,
            is_overtime: Boolean(log?.is_overtime || evalStatus.status_key === 'overtime'),
            is_special_request: Boolean(log?.is_special_request),
            approval_status: log?.approval_status || 'none'
        };
    }

    static async getDailyReportRecords(workDate, currentUser) {
        return AttendanceModel.getReportRecordsByDateRange(workDate, workDate, currentUser);
    }

    static async saveAdminAttendanceRecord(payload) {
        const db = DatabaseService.getInstance().client;
        const settings = await SettingsModel.getSettings(false);
        const colors = settings.category_colors || Config.DEFAULT_SETTINGS.category_colors;

        const isOvertime = payload.status === 'ปฏิบัติงานนอกเวลาราชการ';
        const statusColorMap = {
            'ปฏิบัติงานปกติ': colors.normal || '#007B3E',
            'มาสาย': colors.late || '#EAB308',
            'ขาดราชการ': colors.absent_duty || '#EA580C',
            'ไม่ลงเวลา': colors.no_checkin || '#E11D48',
            'ปฏิบัติงานนอกเวลาราชการ': colors.overtime || '#2563EB'
        };

        const recordData = {
            personnel_id: payload.personnel_id,
            work_date: payload.work_date,
            shift_name: payload.shift_name || (isOvertime ? 'ปฏิบัติงานนอกเวลาราชการ' : 'เวลาราชการปกติ (08:30 - 16:30)'),
            check_in_time: payload.check_in_time ? UIHelpers.formatTime24(payload.check_in_time) : null,
            check_out_time: payload.check_out_time ? UIHelpers.formatTime24(payload.check_out_time) : null,
            status: payload.status || 'ปฏิบัติงานปกติ',
            remark: payload.remark || '',
            row_color: payload.row_color || statusColorMap[payload.status] || '#007B3E',
            is_overtime: isOvertime,
            is_special_request: Boolean(payload.is_special_request),
            approval_status: payload.approval_status || 'approved',
            updated_at: new Date().toISOString()
        };

        if (payload.log_id) {
            const { error } = await db
                .from('attendance_logs')
                .update(recordData)
                .eq('id', payload.log_id);
            if (error) {
                return { success: false, message: 'ไม่สามารถแก้ไขข้อมูลการลงเวลาได้: ' + error.message };
            }
            return { success: true, message: 'อัปเดตข้อมูลการลงเวลาเรียบร้อยแล้ว' };
        } else {
            const { error } = await db
                .from('attendance_logs')
                .insert(recordData);
            if (error) {
                return { success: false, message: 'ไม่สามารถเพิ่มข้อมูลการลงเวลาได้: ' + error.message };
            }
            return { success: true, message: 'เพิ่มข้อมูลการลงเวลาเรียบร้อยแล้ว' };
        }
    }

    static async deleteAttendanceRecord(logId) {
        const db = DatabaseService.getInstance().client;
        const { error } = await db
            .from('attendance_logs')
            .delete()
            .eq('id', logId);

        if (error) {
            return { success: false, message: 'ไม่สามารถลบข้อมูลการลงเวลาได้: ' + error.message };
        }
        return { success: true, message: 'ลบรายการลงเวลาเรียบร้อยแล้ว' };
    }

    static calculateDashboardMetrics(dailyRecords) {
        const uniquePersonnelSet = new Set(
            (dailyRecords || []).map(r => r.personnel_id).filter(Boolean)
        );
        const total = uniquePersonnelSet.size;

        const normalSet = new Set();
        const lateSet = new Set();
        const absentSet = new Set();
        const overtimeSet = new Set();

        for (const r of (dailyRecords || [])) {
            if (!r.personnel_id) continue;
            if (r.status_category === 'normal') normalSet.add(r.personnel_id);
            else if (r.status_category === 'late') lateSet.add(r.personnel_id);
            else if (r.status_category === 'absent_duty' || r.status_category === 'no_checkin') absentSet.add(r.personnel_id);
            else if (r.status_category === 'overtime') overtimeSet.add(r.personnel_id);
        }

        const normalCount = normalSet.size;
        const lateCount = lateSet.size;
        const absentCount = absentSet.size;
        const overtimeCount = overtimeSet.size;

        const calcPercent = (val) => (total > 0 ? Math.min(100, Math.round((val / total) * 100)) : 0);

        return {
            total,
            categories: [
                {
                    key: 'normal',
                    label: 'ปฏิบัติงานปกติ',
                    count: normalCount,
                    percent: calcPercent(normalCount),
                    color: '#007B3E',
                    icon: 'fa-user-check'
                },
                {
                    key: 'late',
                    label: 'มาสาย',
                    count: lateCount,
                    percent: calcPercent(lateCount),
                    color: '#EAB308',
                    icon: 'fa-user-clock'
                },
                {
                    key: 'absent_duty',
                    label: 'ขาดราชการ',
                    count: absentCount,
                    percent: calcPercent(absentCount),
                    color: '#EA580C',
                    icon: 'fa-user-slash'
                },
                {
                    key: 'overtime',
                    label: 'ปฏิบัติงานนอกเวลาราชการ',
                    count: overtimeCount,
                    percent: calcPercent(overtimeCount),
                    color: '#2563EB',
                    icon: 'fa-business-time'
                }
            ]
        };
    }
}