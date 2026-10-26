/**
 * @file assets/js/models/AttendanceModel.js
 * @description คลาสจัดการการลงเวลาปฏิบัติราชการ (อัปเกรดระบบ GPS ค้นหาระยะ z=19 "ใกล้เคียง..." -> z=20 "บริเวณ..." -> ซอย/ซอยย่อย "ใกล้เคียง..." และวนหาใหม่เมื่อเจอ ถนน/แขวง/เขต/หมู่บ้าน/ตำบล/อำเภอ/จังหวัด)
 */

import { Config } from '../core/Config.js';
import { DatabaseService } from '../core/DatabaseService.js';
import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { SettingsModel } from './SettingsModel.js';

export class AttendanceModel {
    // แคชเก็บผลลัพธ์สถานที่ตามพิกัด (ความละเอียดทศนิยม 5 ตำแหน่ง ~ 1.1 เมตร) เพื่อความเร็วสูงสุด
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
     * ตรวจสอบว่าชื่อสถานที่ที่ได้เป็นคำต้องห้าม ได้แก่:
     * "ถนน, แขวง, เขต, หมู่บ้าน, ตำบล, อำเภอ, จังหวัด" หรือไม่
     * หากใช่ ระบบจะไม่อนุญาตให้ใช้ค่านี้ และจะวนกลับไปหาค่าใหม่อีกครั้ง
     * @param {string} rawName
     * @param {Object} tags
     * @returns {boolean}
     */
    static #isForbiddenLocationTerm(rawName, tags = {}) {
        if (!rawName) return true;
        const clean = String(rawName)
            .replace(/^(ใกล้เคียง|บริเวณ)\s+/g, '')
            .trim();
        if (!clean) return true;

        // 1. บล็อกคำว่า "หมู่บ้าน" ทุกกรณีตามข้อกำหนด (เช่น หมู่บ้าน..., บ้าน...)
        if (/(^หมู่บ้าน|หมู่บ้าน|^หมู่ที่\s*\d+|ตำบล|อำเภอ|จังหวัด)/i.test(clean)) {
            return true;
        }
        if (tags && ['village', 'hamlet', 'suburb', 'quarter', 'neighbourhood', 'Watch', 'municipality', 'district', 'city_district', 'county', 'state', 'province'].includes(tags.place)) {
            return true;
        }
        if (tags && tags.boundary === 'administrative') {
            return true;
        }

        // 2. หากมีคำว่า "ซอย", "ซ.", "ตรอก", "แยก" (และไม่ใช่หมู่บ้าน) ถือว่าเป็น ซอย/ซอยย่อย ที่อนุญาตให้ใช้ได้
        if (/(ซอย|ซ\.|ตรอก)/.test(clean)) {
            return false;
        }

        // 3. บล็อก ถนน, แขวง, เขต, ตำบล, อำเภอ, จังหวัด
        // (ยกเว้น "สำนักงานเขต..." ซึ่งเป็นสถานที่ราชการ)
        if (/^(ถนน|ถ\.|ทางหลวง|ทางพิเศษ|ทางด่วน|แขวง|เขต|ตำบล|ต\.|อำเภอ|อ\.|จังหวัด|จ\.|กรุงเทพมหานคร|พื้นที่ปฏิบัติราชการ)/i.test(clean)) {
            return true;
        }

        return false;
    }

    /**
     * คัดกรองเฉพาะสถานที่ในกลุ่มเป้าหมายตามข้อกำหนด:
     * 1. สถานที่ราชการ
     * 2. สถานที่สำคัญ (วัด, สนามหลวง, ท่าเรือ, วงเวียน, สะพาน, เสาหลักเมือง)
     * 3. บริการสาธารณะ (สถานีรถไฟ, สถานีรถไฟฟ้า, ป้ายรถเมล์)
     * 4. ร้านค้า, ร้านอาหาร
     * 5. อพาร์ทเม้นส์, คอนโด, หอพัก ฯลฯ
     * @param {Object} tags
     * @param {string} name
     * @returns {{matched: boolean, priority: number, cleanName: string}}
     */
    static #classifyTargetPlace(tags = {}, name = '') {
        const n = String(name || '')
            .replace(/^(ใกล้เคียง|บริเวณ)\s+/g, '')
            .trim();

        if (!n || AttendanceModel.#isForbiddenLocationTerm(n, tags)) {
            return { matched: false, priority: 99, cleanName: '' };
        }

        // 1. สถานที่ราชการ
        const isGovTag =
            tags.office === 'government' ||
            tags.building === 'government' ||
            tags.building === 'public' ||
            tags.building === 'civic' ||
            ['townhall', 'police', 'courthouse', 'public_building', 'fire_station', 'post_office', 'hospital', 'school', 'university', 'college', 'community_centre', 'library'].includes(tags.amenity);
        const isGovName = /(สำนัก|สำนักงาน|สำนักงานเขต|กอง|กรม|กระทรวง|ศาลาว่าการ|เทศกิจ|สถานีตำรวจ|สน\.|โรงพยาบาล|รพ\.|ศูนย์บริการสาธารณสุข|โรงเรียน|มหาวิทยาลัย|วิทยาลัย|ศาล|ไปรษณีย์|ดับเพลิง|ราชการ)/.test(n);
        if (isGovTag || isGovName) {
            return { matched: true, priority: 1, cleanName: n };
        }

        // 2. สถานที่สำคัญ (วัด, สนามหลวง, ท่าเรือ, วงเวียน, สะพาน, เสาหลักเมือง)
        const isLandmarkTag =
            tags.amenity === 'place_of_worship' ||
            tags.amenity === 'ferry_terminal' ||
            tags.man_made === 'pier' ||
            tags.man_made === 'bridge' ||
            tags.junction === 'roundabout' ||
            tags.historic === 'monument' ||
            tags.historic === 'memorial' ||
            tags.tourism === 'attraction' ||
            tags.tourism === 'museum';
        const isLandmarkName = /(วัด|พระอาราม|สนามหลวง|ท่าเรือ|ท่าข้าม|วงเวียน|สะพาน|เสาหลักเมือง|อนุสาวรีย์|พระบรมมหาราชวัง|พิพิธภัณฑ์|ศาลเจ้า|มัสยิด|โบสถ์)/.test(n);
        if (isLandmarkTag || isLandmarkName) {
            return { matched: true, priority: 1, cleanName: n };
        }

        // 3. บริการสาธารณะ (สถานีรถไฟ, สถานีรถไฟฟ้า, ป้ายรถเมล์)
        const isTransitTag =
            tags.railway === 'station' ||
            tags.railway === 'halt' ||
            tags.railway === 'subway_entrance' ||
            tags.railway === 'tram_stop' ||
            tags.highway === 'bus_stop' ||
            tags.amenity === 'bus_station' ||
            Boolean(tags.public_transport);
        const isTransitName = /(สถานีรถไฟ|สถานีรถไฟฟ้า|BTS|MRT|ARL|SRT|ป้ายรถประจำทาง|ป้ายรถเมล์|ท่ารถ|สถานีขนส่ง)/.test(n);
        if (isTransitTag || isTransitName) {
            return { matched: true, priority: 2, cleanName: n };
        }

        // 4. อพาร์ทเม้นส์, คอนโด, หอพัก ฯลฯ
        const isResidenceTag =
            ['apartments', 'dormitory', 'residential', 'condominium', 'hotel', 'hostel'].includes(tags.building) ||
            ['apartment', 'hotel', 'hostel', 'guest_house', 'motel'].includes(tags.tourism);
        const isResidenceName = /(อพาร์ทเม้น|อพาร์ตเมนต์|คอนโด|หอพัก|แมนชั่น|เรสซิเดนซ์|เพลส|คอร์ท|ทาวเวอร์|วิลล่า|โฮเทล|โรงแรม|โฮสเทล|เกสต์เฮาส์|ห้องพัก|Apartment|Condo|Mansion|Residence|Place|Court|Dorm|Hotel|Hostel|Tower)/i.test(n);
        if (isResidenceTag || isResidenceName) {
            return { matched: true, priority: 2, cleanName: n };
        }

        // 5. ร้านค้า, ร้านอาหาร ฯลฯ
        const isShopFoodTag =
            Boolean(tags.shop) ||
            ['restaurant', 'cafe', 'fast_food', 'food_court', 'marketplace', 'convenience', 'bakery', 'pharmacy', 'clinic', 'bank', 'atm', 'fuel'].includes(tags.amenity) ||
            tags.building === 'commercial' ||
            tags.building === 'retail';
        const isShopFoodName = /(ร้าน|ภัตตาคาร|คาเฟ่|กาแฟ|ข้าวมันไก่|ก๋วยเตี๋ยว|ตามสั่ง|โภชนา|เบเกอรี่|ตลาด|มินิมาร์ท|เซเว่น|7-Eleven|7-11|Lotus|Big\s*C|Tops|Makro|CJ|ห้าง|คลินิก|ขายยา|ธนาคาร|ปั๊ม|Cafe|Coffee|Shop|Store|Market|Mall)/i.test(n);
        if (isShopFoodTag || isShopFoodName) {
            return { matched: true, priority: 3, cleanName: n };
        }

        // 6. กรณีเป็นอาคารสำนักงานหรือสถานที่ที่มีชื่อเฉพาะซึ่งไม่ใช่ถนน/แขวง/เขต/หมู่บ้าน/ตำบล/อำเภอ/จังหวัด
        if (
            !tags.highway &&
            (tags.building || tags.office || tags.amenity || tags.tourism || tags.leisure) &&
            !AttendanceModel.#isForbiddenLocationTerm(n, tags)
        ) {
            return { matched: true, priority: 4, cleanName: n };
        }

        return { matched: false, priority: 99, cleanName: '' };
    }

    /**
     * สกัดชื่อสถานที่เป้าหมายจากผลลัพธ์ของ Nominatim (สำหรับการค้นหาที่ระดับ z=19 และ z=20)
     * @param {Object} nomData
     * @returns {{matched: boolean, cleanName: string, priority: number}}
     */
    static #extractValidPlaceFromNominatim(nomData) {
        if (!nomData) return { matched: false, cleanName: '', priority: 99 };

        const addr = nomData.address || {};
        const namedetails = nomData.namedetails || {};

        const candidateNames = [
            namedetails['name:th'],
            namedetails.name,
            nomData.name,
            addr.amenity,
            addr.building,
            addr.apartments,
            addr.office,
            addr.shop,
            addr.tourism,
            addr.historic,
            addr.leisure
        ].filter(Boolean);

        const pseudoTags = {
            amenity: nomData.category === 'amenity' ? nomData.type : (addr.amenity ? 'yes' : ''),
            building: nomData.category === 'building' ? nomData.type : (addr.building || addr.apartments ? 'apartments' : ''),
            office: nomData.category === 'office' ? nomData.type : (addr.office ? 'government' : ''),
            shop: nomData.category === 'shop' ? nomData.type : (addr.shop ? 'yes' : ''),
            tourism: nomData.category === 'tourism' ? nomData.type : (addr.tourism ? 'yes' : ''),
            highway: nomData.category === 'highway' && nomData.type !== 'bus_stop' ? nomData.type : '',
            railway: nomData.category === 'railway' ? nomData.type : '',
            place: nomData.category === 'place' ? nomData.type : '',
            boundary: nomData.category === 'boundary' ? nomData.type : ''
        };

        for (const rawCandidate of candidateNames) {
            const check = AttendanceModel.#classifyTargetPlace(pseudoTags, rawCandidate);
            if (check.matched && check.cleanName) {
                return check;
            }
        }

        return { matched: false, cleanName: '', priority: 99 };
    }

    /**
     * ค้นหาเฉพาะ "ซอย" หรือ "ซอยย่อย" ที่ใกล้พิกัดที่สุด (และต้องไม่ใช่ ถนน, แขวง, เขต, หมู่บ้าน, ตำบล, อำเภอ, จังหวัด)
     * @param {number} lat
     * @param {number} lng
     * @param {Array<Object>} nominatimList
     * @param {Array<Object>} overpassElements
     * @returns {string} ชื่อซอย/ซอยย่อย (ยังไม่เติมคำว่า "ใกล้เคียง")
     */
    static #extractCleanSoiOrSubSoi(lat, lng, nominatimList = [], overpassElements = []) {
        const soiCandidates = [];

        // 1. ค้นหาซอยและซอยย่อยจากเส้นทางใน Overpass พร้อมคำนวณระยะทางจริง
        for (const el of overpassElements) {
            const tags = el?.tags || {};
            const name = String(tags['name:th'] || tags.name || '').trim();
            if (!name) continue;

            if (/(ซอย|ซ\.|ตรอก)/.test(name) && !AttendanceModel.#isForbiddenLocationTerm(name, tags)) {
                const elLat = el.lat ?? el.center?.lat;
                const elLon = el.lon ?? el.center?.lon;
                const dist = (typeof elLat === 'number' && typeof elLon === 'number')
                    ? AttendanceModel.#calculateDistanceMeters(lat, lng, elLat, elLon)
                    : 50;

                // ให้ความสำคัญกับซอยย่อย (มีคำว่า แยก หรือ /) ที่อยู่ใกล้พิกัด
                const isSubSoi = /(แยก|\/)/.test(name);
                soiCandidates.push({
                    name: name.replace(/^(ใกล้เคียง|บริเวณ)\s+/g, '').trim(),
                    dist,
                    isSubSoi
                });
            }
        }

        if (soiCandidates.length > 0) {
            soiCandidates.sort((a, b) => {
                if (Math.abs(a.dist - b.dist) <= 15 && a.isSubSoi !== b.isSubSoi) {
                    return a.isSubSoi ? -1 : 1;
                }
                return a.dist - b.dist;
            });
            return soiCandidates[0].name;
        }

        // 2. ค้นหาซอย/ซอยย่อยจากข้อมูล Nominatim
        for (const nomData of nominatimList) {
            if (!nomData) continue;
            const addr = nomData.address || {};
            const fields = [
                nomData.name,
                addr.soi,
                addr.road,
                addr.residential,
                addr. pedestrian,
                addr.footway
            ].filter(Boolean);

            for (const f of fields) {
                const text = String(f).trim();
                if (/(ซอย|ซ\.|ตรอก)/.test(text) && !AttendanceModel.#isForbiddenLocationTerm(text)) {
                    return text.replace(/^(ใกล้เคียง|บริเวณ)\s+/g, '').trim();
                }
            }

            const displayParts = String(nomData.display_name || '')
                .split(',')
                .map(s => s.trim());

            for (const part of displayParts) {
                if (/(ซอย|ซ\.|ตรอก)/.test(part) && !AttendanceModel.#isForbiddenLocationTerm(part)) {
                    return part.replace(/^(ใกล้เคียง|บริเวณ)\s+/g, '').trim();
                }
            }
        }

        return '';
    }

    static async #fetchWithFastTimeout(url, timeoutMs = 1100) {
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

    static async #queryOverpassFast(query, timeoutMs = 1200) {
        const encoded = encodeURIComponent(query);
        const mirrors = [
            `https://overpass-api.de/api/interpreter?data=${encoded}`,
            `https://lz4.overpass-api.de/api/interpreter?data=${encoded}`,
            `https://overpass.kumi.systems/api/interpreter?data=${encoded}`
        ];

        try {
            const results = await Promise.all(
                mirrors.map(url => AttendanceModel.#fetchWithFastTimeout(url, timeoutMs))
            );
            return results.find(r => r && Array.isArray(r.elements) && r.elements.length > 0) || results.find(Boolean) || null;
        } catch (e) {
            return null;
        }
    }

    /**
     * ค้นหาสถานที่ใกล้เคียงพร้อมคืนค่าระดับ Zoom ที่ตรวจพบ (z=19 หรือ z=20) ตามข้อกำหนด STB Checkin แก้ไข 11:
     * 1. ค้นหาในระยะค่า z = 19 (ประมาณ 20 เมตร) ก่อน -> แสดงคำขึ้นต้นว่า "ใกล้เคียง " + ชื่อสถานที่
     * 2. หากไม่พบใน z = 19 ให้เปลี่ยนไปใช้ระยะค่า z = 20 (ประมาณ 10 เมตร) -> แสดงคำขึ้นต้นว่า "บริเวณ " + ชื่อสถานที่
     * 3. หากใช้ z = 20 แล้วยังไม่เจอสถานที่ ให้เอา ซอย / ซอยย่อย -> แสดงคำขึ้นต้นว่า "ใกล้เคียง " + ชื่อซอย
     * 4. หากได้ค่าเป็น ถนน, แขวง, เขต, หมู่บ้าน, ตำบล, อำเภอ, จังหวัด ให้วนกลับไปหาค่าใหม่อีกครั้งอัตโนมัติ
     * @param {number} lat
     * @param {number} lng
     * @returns {Promise<{locationName: string, zoomLevel: number}>}
     */
    static async resolveLocationWithZoomMeta(lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return { locationName: 'ไม่ระบุสถานที่', zoomLevel: 19 };
        }

        const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
        if (AttendanceModel.#locationCache.has(cacheKey)) {
            const cached = AttendanceModel.#locationCache.get(cacheKey);
            if (cached && !AttendanceModel.#isForbiddenLocationTerm(cached.locationName)) {
                return cached;
            }
        }

        // ยิงคำขอขนานชุดแรก: Nominatim z=19 (20m), Nominatim z=20 (10m) และ Overpass รัศมีเริ่มต้น
        const nomUrlZ19 = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=19&addressdetails=1&namedetails=1&accept-language=th`;
        const nomUrlZ20 = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=20&addressdetails=1&namedetails=1&accept-language=th`;
        const initialOverpassQuery = `[out:json][timeout:1];(node(around:45,${lat},${lng})["name"];way(around:45,${lat},${lng})["name"];);out center;`;

        const [nomZ19, nomZ20, ovInitial] = await Promise.all([
            AttendanceModel.#fetchWithFastTimeout(nomUrlZ19, 1100),
            AttendanceModel.#fetchWithFastTimeout(nomUrlZ20, 1100),
            AttendanceModel.#queryOverpassFast(initialOverpassQuery, 1200)
        ]);

        const initialElements = ovInitial?.elements || [];

        // คัดแยกสถานที่เป้าหมายจาก Overpass พร้อมคำนวณระยะห่างจริง
        const classifyElementsWithinRadius = (elements, minExclusiveMeters, maxInclusiveMeters) => {
            const list = [];
            for (const el of elements) {
                const tags = el.tags || {};
                const rawName = String(tags['name:th'] || tags.name || '').trim();
                if (!rawName) continue;

                const classification = AttendanceModel.#classifyTargetPlace(tags, rawName);
                if (!classification.matched) continue;

                const elLat = el.lat ?? el.center?.lat;
                const elLon = el.lon ?? el.center?.lon;
                const dist = (typeof elLat === 'number' && typeof elLon === 'number')
                    ? AttendanceModel.#calculateDistanceMeters(lat, lng, elLat, elLon)
                    : maxInclusiveMeters;

                if (dist > minExclusiveMeters && dist <= maxInclusiveMeters) {
                    list.push({
                        cleanName: classification.cleanName,
                        dist,
                        priority: classification.priority
                    });
                }
            }
            list.sort((a, b) => {
                if (Math.abs(a.dist - b.dist) <= 6 && a.priority !== b.priority) {
                    return a.priority - b.priority;
                }
                return a.dist - b.dist;
            });
            return list;
        };

        // ====================================================================
        // ขั้นตอนที่ 1: ค้นหาสถานที่ใกล้เคียงในระยะค่า z (Zoom Level) = 19 (ประมาณ 20 เมตร) ก่อน
        // โดยแสดงคำขึ้นต้นว่า ["ใกล้เคียง " + ชื่อสถานที่]
        // (หมายเหตุ: กรณีที่ตรวจพบจากระยะวง 10-20 เมตร หรือจาก Nominatim z=19)
        // ====================================================================
        const z19OverpassMatches = classifyElementsWithinRadius(initialElements, 10, 22);
        if (z19OverpassMatches.length > 0) {
            const bestZ19 = z19OverpassMatches[0];
            if (!AttendanceModel.#isForbiddenLocationTerm(bestZ19.cleanName)) {
                const resultObj = {
                    locationName: `ใกล้เคียง ${bestZ19.cleanName}`,
                    zoomLevel: 19
                };
                AttendanceModel.#locationCache.set(cacheKey, resultObj);
                return resultObj;
            }
        }

        const nomZ19Check = AttendanceModel.#extractValidPlaceFromNominatim(nomZ19);
        if (nomZ19Check.matched && !AttendanceModel.#isForbiddenLocationTerm(nomZ19Check.cleanName)) {
            const nLat = parseFloat(nomZ19.lat);
            const nLon = parseFloat(nomZ19.lon);
            const nDist = (!isNaN(nLat) && !isNaN(nLon))
                ? AttendanceModel.#calculateDistanceMeters(lat, lng, nLat, nLon)
                : 18;
            // หากอยู่ในระยะของ z=19 (ประมาณ 20 เมตร)
            if (nDist > 10 && nDist <= 25) {
                const resultObj = {
                    locationName: `ใกล้เคียง ${nomZ19Check.cleanName}`,
                    zoomLevel: 19
                };
                AttendanceModel.#locationCache.set(cacheKey, resultObj);
                return resultObj;
            }
        }

        // ====================================================================
        // ขั้นตอนที่ 2: หากในรัศมี z = 19 ไม่พบสถานที่ ให้เปลี่ยนไปใช้ระยะค่า z (Zoom Level) = 20 (ประมาณ 10 เมตร)
        // โดยแสดงคำขึ้นต้นว่า ["บริเวณ " + ชื่อสถานที่]
        // ====================================================================
        const z20OverpassMatches = classifyElementsWithinRadius(initialElements, -1, 10);
        if (z20OverpassMatches.length > 0) {
            const bestZ20 = z20OverpassMatches[0];
            if (!AttendanceModel.#isForbiddenLocationTerm(bestZ20.cleanName)) {
                const resultObj = {
                    locationName: `บริเวณ ${bestZ20.cleanName}`,
                    zoomLevel: 20
                };
                AttendanceModel.#locationCache.set(cacheKey, resultObj);
                return resultObj;
            }
        }

        const nomZ20Check = AttendanceModel.#extractValidPlaceFromNominatim(nomZ20);
        if (nomZ20Check.matched && !AttendanceModel.#isForbiddenLocationTerm(nomZ20Check.cleanName)) {
            const resultObj = {
                locationName: `บริเวณ ${nomZ20Check.cleanName}`,
                zoomLevel: 20
            };
            AttendanceModel.#locationCache.set(cacheKey, resultObj);
            return resultObj;
        }

        // ====================================================================
        // ขั้นตอนที่ 3: หากใช้ z = 20 แล้วยังไม่เจอสถานที่ ให้เอา "ซอย / ซอยย่อย"
        // โดยแสดงคำขึ้นต้นว่า ["ใกล้เคียง " + ชื่อสถานที่]
        // และหากได้ค่าเป็น ถนน, แขวง, เขต, หมู่บ้าน, ตำบล, อำเภอ, จังหวัด ให้วนกลับไปหาค่าใหม่อีกครั้ง
        // ====================================================================
        const initialSoi = AttendanceModel.#extractCleanSoiOrSubSoi(lat, lng, [nomZ20, nomZ19], initialElements);
        if (initialSoi && !AttendanceModel.#isForbiddenLocationTerm(initialSoi)) {
            const resultObj = {
                locationName: `ใกล้เคียง ${initialSoi}`,
                zoomLevel: 19
            };
            AttendanceModel.#locationCache.set(cacheKey, resultObj);
            return resultObj;
        }

        // ตรวจสอบว่าใน initialElements (ระยะ 22 - 45 เมตร) มีสถานที่เป้าหมายหรือไม่ก่อนขยายวง
        const widerInitialMatches = classifyElementsWithinRadius(initialElements, 22, 45);
        if (widerInitialMatches.length > 0) {
            const bestWider = widerInitialMatches[0];
            if (!AttendanceModel.#isForbiddenLocationTerm(bestWider.cleanName)) {
                const resultObj = {
                    locationName: `ใกล้เคียง ${bestWider.cleanName}`,
                    zoomLevel: 19
                };
                AttendanceModel.#locationCache.set(cacheKey, resultObj);
                return resultObj;
            }
        }

        // ====================================================================
        // ขั้นตอนที่ 4 (Retry Loop): วนกลับไปหาค่าใหม่อีกครั้งเมื่อยังไม่พบหรือติดค่าต้องห้าม
        // (ถนน, แขวง, เขต, หมู่บ้าน, ตำบล, อำเภอ, จังหวัด)
        // ====================================================================
        const retryRadii = [100, 220, 380];
        for (const radius of retryRadii) {
            const retryQuery = `[out:json][timeout:1];(node(around:${radius},${lat},${lng})["name"];way(around:${radius},${lat},${lng})["name"];);out center;`;
            const ovRetry = await AttendanceModel.#queryOverpassFast(retryQuery, 1200);
            const retryElements = ovRetry?.elements || [];

            if (retryElements.length === 0) continue;

            // 4.1 ค้นหา ซอย / ซอยย่อย ที่ใกล้ที่สุดในวงค้นหาใหม่
            const retrySoi = AttendanceModel.#extractCleanSoiOrSubSoi(lat, lng, [nomZ20, nomZ19], retryElements);
            if (retrySoi && !AttendanceModel.#isForbiddenLocationTerm(retrySoi)) {
                const resultObj = {
                    locationName: `ใกล้เคียง ${retrySoi}`,
                    zoomLevel: 19
                };
                AttendanceModel.#locationCache.set(cacheKey, resultObj);
                return resultObj;
            }

            // 4.2 ค้นหาสถานที่เป้าหมายในวงค้นหาใหม่ (ที่ไม่ใช่ ถนน/แขวง/เขต/หมู่บ้าน/ตำบล/อำเภอ/จังหวัด)
            const retryPlaces = classifyElementsWithinRadius(retryElements, -1, radius);
            if (retryPlaces.length > 0) {
                const bestRetryPlace = retryPlaces[0];
                if (!AttendanceModel.#isForbiddenLocationTerm(bestRetryPlace.cleanName)) {
                    const resultObj = {
                        locationName: `ใกล้เคียง ${bestRetryPlace.cleanName}`,
                        zoomLevel: 19
                    };
                    AttendanceModel.#locationCache.set(cacheKey, resultObj);
                    return resultObj;
                }
            }
        }

        // 4.3 กรณีพิกัดตรงจุดเป็นพื้นที่ว่าง ให้สแกนจุดพิกัดข้างเคียง 4 ทิศทางในระยะ ~40 เมตรด้วย z=20 เพื่อหาซอยย่อยหรือสถานที่อีกครั้ง
        const offsets = [
            [0.00035, 0.00035],
            [-0.00035, -0.00035]
        ];
        for (const [dLat, dLng] of offsets) {
            const probeUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${(lat + dLat).toFixed(6)}&lon=${(lng + dLng).toFixed(6)}&zoom=20&addressdetails=1&namedetails=1&accept-language=th`;
            const probeData = await AttendanceModel.#fetchWithFastTimeout(probeUrl, 900);
            if (!probeData) continue;

            const probePlace = AttendanceModel.#extractValidPlaceFromNominatim(probeData);
            if (probePlace.matched && !AttendanceModel.#isForbiddenLocationTerm(probePlace.cleanName)) {
                const resultObj = {
                    locationName: `ใกล้เคียง ${probePlace.cleanName}`,
                    zoomLevel: 20
                };
                AttendanceModel.#locationCache.set(cacheKey, resultObj);
                return resultObj;
            }

            const probeSoi = AttendanceModel.#extractCleanSoiOrSubSoi(lat, lng, [probeData], []);
            if (probeSoi && !AttendanceModel.#isForbiddenLocationTerm(probeSoi)) {
                const resultObj = {
                    locationName: `ใกล้เคียง ${probeSoi}`,
                    zoomLevel: 20
                };
                AttendanceModel.#locationCache.set(cacheKey, resultObj);
                return resultObj;
            }
        }

        const fallbackObj = {
            locationName: `ใกล้เคียง ซอยในพื้นที่ (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
            zoomLevel: 19
        };
        AttendanceModel.#locationCache.set(cacheKey, fallbackObj);
        return fallbackObj;
    }

    /**
     * เมธอดหลักสำหรับคืนค่าชื่อสถานที่ (เรียกใช้ resolveLocationWithZoomMeta)
     * @param {number} lat
     * @param {number} lng
     * @returns {Promise<string>}
     */
    static async resolveLocationName(lat, lng) {
        const res = await AttendanceModel.resolveLocationWithZoomMeta(lat, lng);
        return res.locationName;
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
            log.status === 'ปฏิบัติงานนอกเวลา' ||
            log.status === 'ปฏิบัติงานนอกเวลาราชการ'
        ) {
            return {
                status_key: 'overtime',
                status_label: 'ปฏิบัติงานนอกเวลา',
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
        return list.find(r => !r.is_overtime && r.status !== 'ปฏิบัติงานนอกเวลา' && r.status !== 'ปฏิบัติงานนอกเวลาราชการ') || null;
    }

    static async getActiveRegularRecordForCheckout(personnelId, userId, settings) {
        const db = DatabaseService.getInstance().client;

        let unclosedQuery = db
            .from('attendance_logs')
            .select('id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time, check_in_location, check_out_location, check_in_photo, check_out_photo, check_in_lat, check_in_lng, check_out_lat, check_out_lng, status, remark, row_color, is_overtime, is_special_request, approval_status, created_at')
            .eq('is_overtime', false)
            .neq('status', 'ปฏิบัติงานนอกเวลา')
            .neq('status', 'ปฏิบัติงานนอกเวลาราชการ')
            .not('check_in_time', 'is', null)
            .is('check_out_time', null)
            .order('work_date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(5);

        if (personnelId) {
            unclosedQuery = unclosedQuery.eq('personnel_id', personnelId);
        } else if (userId) {
            unclosedQuery = unclosedQuery.eq('user_id', userId);
        }

        const { data: unclosedList, error: unclosedErr } = await unclosedQuery;
        if (!unclosedErr && Array.isArray(unclosedList)) {
            const validUnclosed = unclosedList.find(r => !r.is_special_request || r.approval_status === 'approved');
            if (validUnclosed) {
                return validUnclosed;
            }
        }

        const todayIso = UIHelpers.getTodayISO();
        return await AttendanceModel.getTodayRegularRecordForUser(personnelId, userId, todayIso);
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

        const stdStartRef = UIHelpers.formatTime24(settings.standard_check_in || '08:30');
        const stdEndRef = UIHelpers.formatTime24(settings.standard_check_out || '16:30');

        const shiftStartRef = UIHelpers.formatTime24(payload.shift_check_in || stdStartRef);
        const shiftEndRef = UIHelpers.formatTime24(payload.shift_check_out || stdEndRef);

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

        if (!payload.single_click_checkin && hasUnclosedRegular) {
            const targetOutRef = stdEndRef;
            const targetOutMin = UIHelpers.timeToMinutes(targetOutRef);
            const graceMinutes = Number(settings.checkout_grace_minutes ?? 30);
            const maxAllowedOutMin = targetOutMin + graceMinutes;

            let effectiveCheckOutTime = currentTime;
            const isPastDateRecord = activeRegularRecord.work_date < today;

            if (isPastDateRecord) {
                effectiveCheckOutTime = AttendanceModel.#minutesToTime24(maxAllowedOutMin);
            } else {
                if (nowMin < targetOutMin) {
                    effectiveCheckOutTime = currentTime;
                } else if (nowMin <= maxAllowedOutMin) {
                    effectiveCheckOutTime = currentTime;
                } else {
                    effectiveCheckOutTime = AttendanceModel.#minutesToTime24(maxAllowedOutMin);
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
                return { success: false, message: 'ไม่สามารถบันทึกลงเวลาเลิกงานได้: ' + error.message };
            }

            const dateNotice = isPastDateRecord ? ` (ของวันที่ ${UIHelpers.formatThaiShortDate(activeRegularRecord.work_date)})` : '';
            return {
                success: true,
                data,
                message: `บันทึกลงเวลาเลิกงานสำเร็จ${dateNotice} เวลา ${effectiveCheckOutTime} น. (สถานะ: ${evalOut.status_label})`
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
                (r.is_overtime || r.status === 'ปฏิบัติงานนอกเวลา' || r.status === 'ปฏิบัติงานนอกเวลาราชการ') &&
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
                status: 'ปฏิบัติงานนอกเวลา',
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

        const regularRecordToday = todayLogs.find(r => !r.is_overtime && r.status !== 'ปฏิบัติงานนอกเวลา' && r.status !== 'ปฏิบัติงานนอกเวลาราชการ') || null;
        const startAllowRef = UIHelpers.formatTime24(settings.allow_checkin_start_time || '06:00');
        const startAllowMin = UIHelpers.timeToMinutes(startAllowRef);

        if (nowMin < startAllowMin) {
            return {
                success: false,
                message: `สามารถเริ่มบันทึกเวลาเข้าปฏิบัติงานปกติได้ตั้งแต่เวลา ${startAllowRef} น. เป็นต้นไป (ขณะนี้สามารถเลือกบันทึกช่วงเวลาปฏิบัติงานนอกเวลาได้)`
            };
        }

        if (regularRecordToday && regularRecordToday.check_in_time && regularRecordToday.check_out_time) {
            return {
                success: false,
                message: `วันนี้ท่านได้ลงเวลาเข้าปฏิบัติงาน (${UIHelpers.formatTime24(regularRecordToday.check_in_time)} น.) และเลิกงาน (${UIHelpers.formatTime24(regularRecordToday.check_out_time)} น.) ในเวลาทำการปกติครบ 1 ครั้งแล้ว`
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
                message: `บันทึกลงเวลารูปแบบพิเศษสำเร็จ! เข้างาน ${checkInFinal} น. / เลิกงาน ${checkOutFinal} น. (สถานะ: ${evalResult.status_label})`
            };
        }

        const normalShiftLabel = `เวลาราชการปกติ (${stdStartRef} - ${stdEndRef})`;
        const checkInTime = UIHelpers.formatTime24(currentTime);
        const evalIn = AttendanceModel.evaluateOfficialStatus({
            check_in_time: checkInTime,
            check_out_time: null,
            shift_name: normalShiftLabel,
            is_overtime: false,
            is_special_request: false
        }, settings);

        const insertIn = {
            personnel_id: payload.personnel_id || null,
            user_id: payload.user_id || null,
            work_date: today,
            shift_name: normalShiftLabel,
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
            return { success: false, message: 'ไม่สามารถบันทึกลงเวลาเข้าปฏิบัติงานได้: ' + error.message };
        }

        return {
            success: true,
            data,
            message: `บันทึกลงเวลาเข้าปฏิบัติงานสำเร็จ เวลา ${checkInTime} น. (สถานะ: ${evalIn.status_label})`
        };
    }

    static async submitSpecialRequest(payload) {
        if (!payload.work_date || !payload.shift_name || !payload.remark) {
            return { success: false, message: 'กรุณาเลือกวันที่ ช่วงเวลา และระบุหมายเหตุให้ครบถ้วน' };
        }

        const settings = await SettingsModel.getSettings(false);
        const colors = settings.category_colors || Config.DEFAULT_SETTINGS.category_colors;

        const isOvertimeShift = Boolean(payload.is_overtime);
        const targetStatus = isOvertimeShift ? 'ปฏิบัติงานนอกเวลา' : 'ปฏิบัติงานปกติ';
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
            const isOt = Boolean(item.is_overtime || item.status === 'ปฏิบัติงานนอกเวลา' || item.status === 'ปฏิบัติงานนอกเวลาราชการ');
            const newStatus = decision === 'approved'
                ? (isOt ? 'ปฏิบัติงานนอกเวลา' : 'ปฏิบัติงานปกติ')
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
            position_full: (() => {
                const cleanTitle = (person.position_title || '').trim();
                const cleanLevel = (person.position_level || '').replace(/^ระดับ\s*/, '').trim();
                return cleanTitle ? `${cleanTitle}${cleanLevel}` : '-';
            })(),
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

        const isOvertime = payload.status === 'ปฏิบัติงานนอกเวลา' || payload.status === 'ปฏิบัติงานนอกเวลาราชการ';
        const statusColorMap = {
            'ปฏิบัติงานปกติ': colors.normal || '#007B3E',
            'มาสาย': colors.late || '#EAB308',
            'ขาดราชการ': colors.absent_duty || '#EA580C',
            'ไม่ลงเวลา': colors.no_checkin || '#E11D48',
            'ปฏิบัติงานนอกเวลา': colors.overtime || '#2563EB',
            'ปฏิบัติงานนอกเวลาราชการ': colors.overtime || '#2563EB'
        };

        const canonicalStatus = payload.status === 'ปฏิบัติงานนอกเวลาราชการ' ? 'ปฏิบัติงานนอกเวลา' : (payload.status || 'ปฏิบัติงานปกติ');
        const recordData = {
            personnel_id: payload.personnel_id,
            work_date: payload.work_date,
            shift_name: payload.shift_name || (isOvertime ? 'ปฏิบัติงานนอกเวลา' : 'เวลาราชการปกติ (08:30 - 16:30)'),
            check_in_time: payload.check_in_time ? UIHelpers.formatTime24(payload.check_in_time) : null,
            check_out_time: payload.check_out_time ? UIHelpers.formatTime24(payload.check_out_time) : null,
            status: canonicalStatus,
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
                    label: 'ปฏิบัติงานนอกเวลา',
                    count: overtimeCount,
                    percent: calcPercent(overtimeCount),
                    color: '#2563EB',
                    icon: 'fa-business-time'
                }
            ]
        };
    }
}