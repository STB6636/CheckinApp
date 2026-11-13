/**
 * @file assets/js/models/AttendanceModel.js
 * @description คลาสจัดการการลงเวลาปฏิบัติราชการ (ระบบระบุสถานที่ GPS สถาปัตยกรรม 6-Tier Nearby Places Resolution: Tier 0 Official Locations -> Tier 1 ArcGIS POI Engine -> Tier 2 Overpass/OSM POIs -> Tier 3 Soi/Sub-soi -> Tier 4 Retry -> Tier 5 Smart Semantic Fallback)
 */

import { Config } from '../core/Config.js';
import { DatabaseService } from '../core/DatabaseService.js';
import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { SettingsModel } from './SettingsModel.js';

export class AttendanceModel {
    // แคชเก็บผลลัพธ์สถานที่ตามพิกัด (ความละเอียดทศนิยม 5 ตำแหน่ง ~ 1.1 เมตร) เพื่อความเร็วสูงสุด
    static #locationCache = new Map();

    static clearLocationCache() {
        AttendanceModel.#locationCache.clear();
    }

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
     * "ถนน, ถ., ทางหลวง, ทางพิเศษ, ทางด่วน, แขวง, เขต, หมู่บ้าน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์/บ้านเลขที่ล้วน, ซอยในพื้นที่"
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

        // บล็อก "ซอยในพื้นที่", ตัวเลขบ้านเลขที่ล้วนๆ, รหัสไปรษณีย์ล้วน
        if (
            /ซอยในพื้นที่/i.test(clean) ||
            /^[\d\s\/\-\.]+$/.test(clean) ||
            /^(บ้านเลขที่|เลขที่)\s*[\d\s\/\-\.]+$/i.test(clean) ||
            /^(รหัสไปรษณีย์|ปณ\.)\s*\d{5}/i.test(clean) ||
            /^\d{5}(\s*,\s*|\s+)(ประเทศไทย|Thailand)?$/i.test(clean)
        ) {
            return true;
        }

        // 1. บล็อกคำว่า "หมู่บ้าน" ทุกกรณีตามข้อกำหนด (เช่น หมู่บ้าน..., หมู่ที่...)
        if (/(หมู่บ้าน|^หมู่ที่\s*\d+)/i.test(clean)) {
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

        // 3. บล็อก ถนน, ถ., ทางหลวง, ทางพิเศษ, ทางด่วน, แขวง, เขต, ตำบล, อำเภอ, จังหวัด
        // (ยกเว้น "สำนักงานเขต..." หรือสถานที่ราชการ/สำคัญ เช่น "ศาลากลางจังหวัด...", "ที่ว่าการอำเภอ...", "ศาลจังหวัด...")
        if (/^(ถนน|ถ\.|ทางหลวง|ทางพิเศษ|ทางด่วน|แขวง|เขต|ตำบล|ต\.|อำเภอ|อ\.|จังหวัด|จ\.|กรุงเทพมหานคร|พื้นที่ปฏิบัติราชการ)/i.test(clean)) {
            return true;
        }

        // 4. บล็อก Highway tags (ถนน) จาก OSM
        if (tags && tags.highway && !['bus_stop', 'platform'].includes(tags.highway) && !/(ซอย|ซ\.|ตรอก)/.test(clean)) {
            return true;
        }

        return false;
    }

    /**
     * คัดกรองเฉพาะสถานที่ในกลุ่มเป้าหมายตามข้อกำหนด 4 ลำดับความสำคัญ:
     * Priority 1 (สูงสุด): สถานที่ราชการและสถานที่สำคัญ (ศาลาว่าการ, สำนัก, สำนักงานเขต, กอง, กรม, กระทรวง, สถานีตำรวจ, โรงพยาบาล, โรงเรียน, มหาวิทยาลัย, ศาล, วัด, พระอาราม, สนามหลวง, ท่าเรือ, สะพาน, เสาหลักเมือง, อนุสาวรีย์, พิพิธภัณฑ์, สโมสร)
     * Priority 2: อาคารสำนักงานและพาณิชย์อื่นๆ (อาคารสำนักงานที่มีชื่อเฉพาะ เช่น อาคาร, ทาวเวอร์, ตึก, บิลดิ้ง, ซิตี้, เซ็นเตอร์, สำนักงานใหญ่/สาขา)
     * Priority 3: ระบบขนส่งและที่พักอาศัย (สถานีรถไฟ, BTS/MRT, ป้ายรถเมล์, คอนโดมิเนียม, อพาร์ตเมนต์, หอพัก, แมนชั่น, โรงแรม)
     * Priority 4: ร้านค้าและบริการสาธารณะ (ห้างสรรพสินค้า, 7-Eleven, ซูเปอร์มาร์เก็ต, คาเฟ่, ร้านอาหาร, ธนาคาร, ปั๊มน้ำมัน)
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

        const isShopPrefix = /^(7-Eleven|7-11|เซเว่น|ร้าน|คาเฟ่|Cafe|Coffee)/i.test(n);

        // Priority 1 (สูงสุด): สถานที่ราชการและสถานที่สำคัญ
        const isGovTag =
            tags.office === 'government' ||
            tags.building === 'government' ||
            tags.building === 'public' ||
            tags.building === 'civic' ||
            ['townhall', 'police', 'courthouse', 'public_building', 'fire_station', 'post_office', 'hospital', 'school', 'university', 'college', 'community_centre', 'library'].includes(tags.amenity);
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
        const isGovOrLandmarkName = /(ศาลาว่าการ|ศาลากลาง|ที่ว่าการ|สำนัก(?!งาน(ใหญ่|สาขา))|สำนักงานเขต|กอง|กรม|กระทรวง|สถานทูต|สถานกงสุล|Embassy|Consulate|สถานีตำรวจ|สน\.|สภ\.|โรงพยาบาล|รพ\.|รพ\.สต\.|สถานีอนามัย|ศูนย์บริการสาธารณสุข|โรงเรียน|มหาวิทยาลัย|วิทยาลัย|ศาล|ไปรษณีย์|ดับเพลิง|ราชการ|ศูนย์ราชการ|เทศกิจ|วัด|พระอาราม|สนามหลวง|ท่าเรือ|ท่าข้าม|วงเวียน|สะพาน|เสาหลักเมือง|ศาลหลักเมือง|อนุสาวรีย์|อนุสรณ์สถาน|อนุสรณ์|พระบรมราชานุสาวรีย์|พระบรมมหาราชวัง|พระราชวัง|พระที่นั่ง|ปราสาท|พระปรางค์|เจดีย์|พิพิธภัณฑ์|พิพิธภัณฑสถาน|หอสมุด|ศาลเจ้า|มัสยิด|โบสถ์|สวนสาธารณะ|อุทยาน|หอศิลป์|สนามกีฬา|ศูนย์เยาวชน|สโมสร)/i.test(n);

        if (!isShopPrefix && (isGovTag || isLandmarkTag || isGovOrLandmarkName)) {
            return { matched: true, priority: 1, cleanName: n };
        }

        // Priority 2: อาคารสำนักงานและพาณิชย์อื่นๆ (อาคารสำนักงานที่มีชื่อเฉพาะ)
        const isOfficeTag =
            tags.building === 'office' ||
            tags.building === 'commercial' ||
            Boolean(tags.office);
        const isOfficeName = /(อาคาร|ทาวเวอร์|ตึก|บิลดิ้ง|ซิตี้|เซ็นเตอร์|สำนักงานใหญ่|สำนักงานสาขา|สำนักงาน|บริษัท|บจก\.|บมจ\.|ห้างหุ้นส่วน|หจก\.|Building|Tower|Center|Centre|City|Office|Company|Corp|Corporation)/i.test(n);

        if (!isShopPrefix && (isOfficeTag || isOfficeName)) {
            if (!/^(ซอย|ซ\.|ตรอก|แยก)\s*/i.test(n)) {
                return { matched: true, priority: 2, cleanName: n };
            }
        }

        // Priority 3: ระบบขนส่งและที่พักอาศัย
        const isTransitTag =
            tags.railway === 'station' ||
            tags.railway === 'halt' ||
            tags.railway === 'subway_entrance' ||
            tags.railway === 'tram_stop' ||
            tags.highway === 'bus_stop' ||
            tags.amenity === 'bus_station' ||
            Boolean(tags.public_transport);
        const isTransitName = /(สถานีรถไฟ|สถานีรถไฟฟ้า|BTS|MRT|ARL|SRT|ป้ายรถประจำทาง|ป้ายรถเมล์|ท่ารถ|สถานีขนส่ง|ท่าอากาศยาน|สนามบิน|Airport)/i.test(n);

        const isResidenceTag =
            ['apartments', 'dormitory', 'residential', 'condominium', 'hotel', 'hostel'].includes(tags.building) ||
            ['apartment', 'hotel', 'hostel', 'guest_house', 'motel'].includes(tags.tourism);
        const isResidenceName = /(คอนโดมิเนียม|คอนโด|อพาร์ทเม้น|อพาร์ตเมนต์|หอพัก|แมนชั่น|เรสซิเดนซ์|เพลส|คอร์ท|วิลล่า|โฮเทล|โรงแรม|โฮสเทล|เกสต์เฮาส์|ห้องพัก|รีสอร์ท|Condo|Condominium|Apartment|Mansion|Residence|Place|Court|Dorm|Hotel|Hostel|Resort)/i.test(n);

        if (isTransitTag || isTransitName || isResidenceTag || isResidenceName) {
            return { matched: true, priority: 3, cleanName: n };
        }

        // Priority 4: ร้านค้าและบริการสาธารณะ
        const isShopFoodTag =
            Boolean(tags.shop) ||
            ['restaurant', 'cafe', 'fast_food', 'food_court', 'marketplace', 'convenience', 'bakery', 'pharmacy', 'clinic', 'bank', 'atm', 'fuel'].includes(tags.amenity) ||
            tags.building === 'retail';
        const isShopFoodName = /(ห้าง|เซ็นทรัล|พารากอน|เดอะมอลล์|โรบินสัน|โลตัส|บิ๊กซี|แม็คโคร|ท็อปส์|ซีเจ|Lotus|Big\s*C|Tops|Makro|CJ|7-Eleven|7-11|เซเว่น|ร้าน|ภัตตาคาร|คาเฟ่|กาแฟ|ข้าวมันไก่|ก๋วยเตี๋ยว|ตามสั่ง|โภชนา|เบเกอรี่|ตลาด|มินิมาร์ท|คลินิก|ขายยา|ธนาคาร|ปั๊ม|ปตท\.|บางจาก|เชลล์|เอสโซ่|PT|Shell|Esso|Caltex|Bangchak|Cafe|Coffee|Shop|Store|Market|Mall|Paragon|Central|The Mall|Bank|Fuel|Pharmacy|Drugstore|Cinema|Theater|Gym|Fitness|Bakery)/i.test(n);

        if (isShopFoodTag || isShopFoodName || isShopPrefix) {
            return { matched: true, priority: 4, cleanName: n };
        }

        // กรณีเป็นสถานที่เฉพาะอื่นๆ ที่ไม่ใช่ทางหลวง/การปกครอง และมีแท็กระบุตัวตน
        if (
            !tags.highway &&
            (tags.building || tags.office || tags.amenity || tags.tourism || tags.leisure || tags.historic || tags.shop) &&
            !AttendanceModel.#isForbiddenLocationTerm(n, tags)
        ) {
            if (/^(ซอย|ซ\.|ตรอก|แยก)\s*/i.test(n)) {
                return { matched: false, priority: 99, cleanName: '' };
            }
            return { matched: true, priority: 4, cleanName: n };
        }

        return { matched: false, priority: 99, cleanName: '' };
    }

    /**
     * สกัดชื่อสถานที่เป้าหมายจากผลลัพธ์ของ Nominatim (สำหรับการค้นหาที่ระดับ z=18, z=19, z=20)
     * @param {Object} nomData
     * @returns {{matched: boolean, cleanName: string, priority: number}}
     */
    static #extractValidPlaceFromNominatim(nomData) {
        if (!nomData) return { matched: false, cleanName: '', priority: 99 };

        const addr = nomData.address || {};
        const namedetails = nomData.namedetails || {};
        const displayFirstPart = (nomData.display_name || '').split(',')[0]?.trim();

        const candidateNames = [
            namedetails['name:th'],
            namedetails.name,
            nomData.name,
            displayFirstPart,
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
            historic: nomData.category === 'historic' ? nomData.type : (addr.historic ? 'yes' : ''),
            leisure: nomData.category === 'leisure' ? nomData.type : (addr.leisure ? 'yes' : ''),
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
                addr.pedestrian,
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

    static async #fetchWithFastTimeout(url, timeoutMs = 1100, customHeaders = {}) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json, application/osm3s+json, */*',
                    'User-Agent': 'BMA-CheckinApp-Mobile/2.7 (Bangkok Metropolitan Administration)',
                    ...customHeaders
                }
            });
            clearTimeout(timer);
            if (!response.ok) return null;
            return await response.json();
        } catch (err) {
            clearTimeout(timer);
            return null;
        }
    }

    static async #queryOverpassFast(query, timeoutMs = 2200) {
        const encoded = encodeURIComponent(query);
        const mirrors = [
            `https://lz4.overpass-api.de/api/interpreter?data=${encoded}`,
            `https://overpass-api.de/api/interpreter?data=${encoded}`,
            `https://overpass.kumi.systems/api/interpreter?data=${encoded}`
        ];

        try {
            // แข่งขัน (Race) ดึงข้อมูลจากกระจกเซิร์ฟเวอร์หลายจุด คืนผลลัพธ์ทันทีที่พบ elements แรก
            const fetchMirrorWithElements = async (url) => {
                const res = await AttendanceModel.#fetchWithFastTimeout(url, timeoutMs);
                if (res && Array.isArray(res.elements) && res.elements.length > 0) {
                    return res;
                }
                throw new Error('No elements');
            };
            return await Promise.any(mirrors.map(fetchMirrorWithElements));
        } catch (_) {
            return null;
        }
    }

    /**
     * ค้นหาสถานที่ใกล้เคียงด้วย ArcGIS World Geocoding Service (Reverse Geocode POI)
     * รองรับระยะค้นหาไม่เกิน 400 เมตร และ timeout ที่กำหนด
     * @param {number} lat
     * @param {number} lng
     * @param {number} [maxDistance=400]
     * @param {number} [timeoutMs=1800]
     * @returns {Promise<{cleanName: string, dist: number, priority: number, zoomLevel: number, locationName: string, source: string}|null>}
     */
    static async #queryArcGISWorldGeocode(lat, lng, maxDistance = 400, timeoutMs = 1800) {
        const numLat = Number(lat);
        const numLng = Number(lng);
        if (!Number.isFinite(numLat) || !Number.isFinite(numLng)) return null;

        try {
            const locStr = JSON.stringify({ x: numLng, y: numLat, spatialReference: { wkid: 4326 } });
            const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode/?f=json&distance=${maxDistance}&category=POI&location=${encodeURIComponent(locStr)}`;

            const data = await AttendanceModel.#fetchWithFastTimeout(url, timeoutMs);
            if (!data || !data.address) return null;

            const addr = data.address;
            const loc = data.location || {};

            // ตรวจสอบว่า ArcGIS คืนผลลัพธ์เป็นประเภท POI เท่านั้น (ไม่รับ PointAddress/StreetAddress/StreetName/Locality)
            const addrType = String(addr.Addr_type || '').toUpperCase();
            if (addrType !== 'POI') {
                return null;
            }

            const targetName = (addr.PlaceName || addr.ShortLabel || addr.Match_addr || '').trim();
            if (!targetName) return null;

            if (AttendanceModel.#isForbiddenLocationTerm(targetName)) {
                return null;
            }

            const locLat = Number(loc.y);
            const locLng = Number(loc.x);
            if (!Number.isFinite(locLat) || !Number.isFinite(locLng)) return null;

            const dist = AttendanceModel.#calculateDistanceMeters(numLat, numLng, locLat, locLng);
            if (dist > maxDistance) return null;

            // แมปประเภทสถานที่จาก ArcGIS (addr.Type) เป็นแท็กเชิงความหมายสำหรับจัดลำดับความสำคัญ
            const arcType = String(addr.Type || '').toLowerCase();
            const tags = {
                source: 'ArcGIS',
                amenity: '',
                building: '',
                office: '',
                tourism: '',
                historic: '',
                shop: '',
                railway: '',
                highway: ''
            };

            if (/government|police|court|city hall|town hall|hospital|clinic|health|medical|doctor|dentist|school|university|college|education|library|post office|fire station|embassy|consulate|public|civic/i.test(arcType)) {
                tags.office = 'government';
                tags.amenity = 'public_building';
            } else if (/landmark|historical|monument|memorial|museum|attraction|place of worship|worship|temple|church|mosque|shrine|park|garden|zoo/i.test(arcType)) {
                tags.historic = 'monument';
                tags.tourism = 'attraction';
            } else if (/office|business|professional|commercial|corporate|industrial|company/i.test(arcType)) {
                tags.office = 'yes';
                tags.building = 'office';
            } else if (/train|station|metro|subway|transit|bus|airport|ferry|pier/i.test(arcType)) {
                tags.railway = 'station';
            } else if (/hotel|motel|apartment|dorm|residence|estate|lodging|condo|hostel|resort/i.test(arcType)) {
                tags.building = 'apartments';
                tags.tourism = 'hotel';
            } else if (/coffee|cafe|restaurant|food|dining|bakery|bar|pub|nightlife|shop|store|mall|market|supermarket|convenience|grocery|retail|bank|atm|financial|gas|fuel|dealership|pharmacy|drugstore|cinema|movie|theater|entertainment|sports|stadium|arena|gym|fitness|recreation|bowling|golf|spa|beauty|service|repair|auto|car wash|laundry/i.test(arcType)) {
                tags.shop = 'yes';
                tags.amenity = 'restaurant';
            } else {
                // Fallback สำหรับ POI อื่นๆ จาก ArcGIS ที่ได้รับการรับรอง Addr_type === 'POI' แล้ว
                tags.amenity = 'place_of_interest';
                tags.shop = 'yes';
            }

            const classification = AttendanceModel.#classifyTargetPlace(tags, targetName);
            if (!classification.matched) {
                return null;
            }

            const prefix = dist <= 30 ? 'บริเวณ ' : 'ใกล้เคียง ';
            const zoomLevel = dist <= 30 ? 20 : 19;

            return {
                cleanName: classification.cleanName,
                dist,
                priority: classification.priority,
                zoomLevel,
                locationName: `${prefix}${classification.cleanName}`,
                source: 'ArcGIS'
            };
        } catch (_) {
            return null;
        }
    }

    /**
     * ค้นหาสถานที่ใกล้เคียงพร้อมคืนค่าระดับ Zoom ที่ตรวจพบ (z=19 หรือ z=20) ตามสถาปัตยกรรม 6-Tier Resilience:
     * Tier 0: ตรวจสอบสถานที่ทางการ (Official Locations) ในหน่วยความจำ (0ms, 100% Resilience)
     * Tier 1: ArcGIS World Geocoding Engine (Primary POI Resolution ระยะไม่เกิน 400m)
     * Tier 2: OpenStreetMap & Overpass API (Fallback POI Search ในระยะ 0-150m)
     * Tier 3: ค้นหา ซอย / ซอยย่อย เมื่อไม่พบ POI ใน Tier 1 และ Tier 2
     * Tier 4: Retry loop ขยายวงค้นหา Overpass (180m, 300m) พร้อม Probe พิกัดข้างเคียง
     * Tier 5: Smart Semantic Fallback แสดงชื่อย่าน/ถนน/แขวง/เขต (ไม่หลุดพิกัดดิบหรือคำว่า ซอยในพื้นที่)
     * @param {number} lat
     * @param {number} lng
     * @param {Object} [options={}]
     * @returns {Promise<{locationName: string, zoomLevel: number}>}
     */
    static async resolveLocationWithZoomMeta(lat, lng, options = {}) {
        const numLat = Number(lat);
        const numLng = Number(lng);
        if (!Number.isFinite(numLat) || !Number.isFinite(numLng) || numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
            return { locationName: 'ไม่ระบุสถานที่', zoomLevel: 19 };
        }

        const opts = options || {};
        const cacheKey = `${numLat.toFixed(5)},${numLng.toFixed(5)}`;
        if (!opts.bypassCache && AttendanceModel.#locationCache.has(cacheKey)) {
            const cached = AttendanceModel.#locationCache.get(cacheKey);
            if (cached && !AttendanceModel.#isForbiddenLocationTerm(cached.locationName)) {
                return cached;
            }
        }

        try {
            // ====================================================================
            // Tier 0: ตรวจสอบสถานที่ทางการในหน่วยความจำ (Official Locations) (0ms, 100% Resilience)
            // ====================================================================
            let officialList = opts.officialLocations || Config.DEFAULT_SETTINGS?.official_locations;
            if (!Array.isArray(officialList) || officialList.length === 0) {
                officialList = [
                    { id: 'LOC-001', name: 'สำนักเทศกิจ', latitude: 13.756331, longitude: 100.501765, radius_meters: 180, is_active: true }
                ];
            }

            let bestOfficialMatch = null;
            for (const loc of officialList) {
                if (!loc || loc.is_active === false) continue;
                const locLat = Number(loc.latitude ?? loc.lat);
                const locLng = Number(loc.longitude ?? loc.lng ?? loc.lon);
                if (!Number.isFinite(locLat) || !Number.isFinite(locLng)) continue;

                const dist = AttendanceModel.#calculateDistanceMeters(numLat, numLng, locLat, locLng);
                const threshold = Math.max(loc.radius_meters || 150, 180);
                if (dist <= threshold) {
                    if (!bestOfficialMatch || dist < bestOfficialMatch.dist) {
                        bestOfficialMatch = { name: loc.name, dist };
                    }
                }
            }

            // ตรวจสอบสำนักเทศกิจ (Default City Law Office) เสมอหากยังไม่พบ และไม่ได้ถูกระบุปิดใช้งานโดยเจตนา
            if (!bestOfficialMatch) {
                const isExplicitlyDeactivated = Array.isArray(officialList) && officialList.some(loc => {
                    if (!loc || loc.is_active !== false) return false;
                    const lLat = Number(loc.latitude ?? loc.lat);
                    const lLng = Number(loc.longitude ?? loc.lng ?? loc.lon);
                    if (!Number.isFinite(lLat) || !Number.isFinite(lLng)) return false;
                    return AttendanceModel.#calculateDistanceMeters(numLat, numLng, lLat, lLng) <= 180;
                });

                if (!isExplicitlyDeactivated) {
                    const defaultDist = AttendanceModel.#calculateDistanceMeters(numLat, numLng, 13.756331, 100.501765);
                    if (defaultDist <= 180) {
                        bestOfficialMatch = { name: 'สำนักเทศกิจ', dist: defaultDist };
                    }
                }
            }

            if (bestOfficialMatch) {
                const prefix = bestOfficialMatch.dist <= 30 ? 'บริเวณ ' : 'ใกล้เคียง ';
                const resultObj = {
                    locationName: `${prefix}${bestOfficialMatch.name}`,
                    zoomLevel: 20
                };
                AttendanceModel.#locationCache.set(cacheKey, resultObj);
                return resultObj;
            }

            // ====================================================================
            // Tier 1: ค้นหาสถานที่หลักด้วย ArcGIS World Geocoding Engine (Primary POI Resolution 0-400m)
            // ====================================================================
            const arcGisResult = await AttendanceModel.#queryArcGISWorldGeocode(numLat, numLng, 400, 1800);
            if (arcGisResult && arcGisResult.cleanName && arcGisResult.dist <= 400) {
                const prefix = arcGisResult.dist <= 30 ? 'บริเวณ ' : 'ใกล้เคียง ';
                const zoomLevel = arcGisResult.dist <= 30 ? 20 : 19;
                const resultObj = {
                    locationName: `${prefix}${arcGisResult.cleanName}`,
                    zoomLevel
                };
                AttendanceModel.#locationCache.set(cacheKey, resultObj);
                return resultObj;
            }

            // ====================================================================
            // Tier 2: ยิงคำขอขนาน OpenStreetMap & Overpass API (Fallback เมื่อไม่พบจาก ArcGIS หรือ Timeout)
            // ====================================================================
            const nomUrlZ18 = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${numLat}&lon=${numLng}&zoom=18&addressdetails=1&namedetails=1&accept-language=th`;
            const nomUrlZ19 = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${numLat}&lon=${numLng}&zoom=19&addressdetails=1&namedetails=1&accept-language=th`;
            const nomUrlZ20 = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${numLat}&lon=${numLng}&zoom=20&addressdetails=1&namedetails=1&accept-language=th`;
            const targetedOverpassQuery = `[out:json][timeout:2];(nwr(around:80,${numLat},${numLng})["amenity"]["name"];nwr(around:80,${numLat},${numLng})["shop"]["name"];nwr(around:80,${numLat},${numLng})["office"]["name"];nwr(around:80,${numLat},${numLng})["tourism"]["name"];nwr(around:80,${numLat},${numLng})["historic"]["name"];nwr(around:80,${numLat},${numLng})["building"]["name"];);out center;`;

            const [nomZ18, nomZ19, nomZ20, ovInitial] = await Promise.all([
                AttendanceModel.#fetchWithFastTimeout(nomUrlZ18, 1800),
                AttendanceModel.#fetchWithFastTimeout(nomUrlZ19, 1500),
                AttendanceModel.#fetchWithFastTimeout(nomUrlZ20, 1500),
                AttendanceModel.#queryOverpassFast(targetedOverpassQuery, 2000)
            ]);

            const initialElements = ovInitial?.elements || [];

            // Helper คัดแยกสถานที่เป้าหมายจาก Overpass พร้อมคำนวณระยะห่างจริง
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
                        ? AttendanceModel.#calculateDistanceMeters(numLat, numLng, elLat, elLon)
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
                    if (Math.abs(a.dist - b.dist) <= 15 && a.priority !== b.priority) {
                        return a.priority - b.priority;
                    }
                    return a.dist - b.dist;
                });
                return list;
            };

            // ====================================================================
            // Tier 2: OpenStreetMap & Overpass API (Fallback POI Search 0-150m)
            // ====================================================================
            const candidatePlaces = [];

            // 1.1 สถานที่จาก Overpass
            const overpassPlaces = classifyElementsWithinRadius(initialElements, -1, 150);
            for (const op of overpassPlaces) {
                if (!AttendanceModel.#isForbiddenLocationTerm(op.cleanName)) {
                    candidatePlaces.push(op);
                }
            }

            // 1.2 สถานที่จาก Nominatim (z=18, z=19, z=20)
            for (const nom of [nomZ18, nomZ19, nomZ20]) {
                if (!nom) continue;
                const placeCheck = AttendanceModel.#extractValidPlaceFromNominatim(nom);
                if (placeCheck.matched && !AttendanceModel.#isForbiddenLocationTerm(placeCheck.cleanName)) {
                    const nLat = parseFloat(nom.lat);
                    const nLon = parseFloat(nom.lon);
                    const nDist = (!isNaN(nLat) && !isNaN(nLon))
                        ? AttendanceModel.#calculateDistanceMeters(numLat, numLng, nLat, nLon)
                        : 20;

                    if (nDist <= 150) {
                        const exists = candidatePlaces.some(p => p.cleanName === placeCheck.cleanName);
                        if (!exists) {
                            candidatePlaces.push({
                                cleanName: placeCheck.cleanName,
                                dist: nDist,
                                priority: placeCheck.priority
                            });
                        }
                    }
                }
            }

            if (candidatePlaces.length > 0) {
                candidatePlaces.sort((a, b) => {
                    if (Math.abs(a.dist - b.dist) <= 15 && a.priority !== b.priority) {
                        return a.priority - b.priority;
                    }
                    return a.dist - b.dist;
                });
                const bestPlace = candidatePlaces[0];
                const prefix = bestPlace.dist <= 25 ? 'บริเวณ ' : 'ใกล้เคียง ';
                const resultObj = {
                    locationName: `${prefix}${bestPlace.cleanName}`,
                    zoomLevel: bestPlace.dist <= 25 ? 20 : 19
                };
                AttendanceModel.#locationCache.set(cacheKey, resultObj);
                return resultObj;
            }

            // ====================================================================
            // Tier 3: ค้นหา ซอย / ซอยย่อย (เมื่อไม่พบ POI ใน Tier 1 และ Tier 2 เท่านั้น)
            // ====================================================================
            const initialSoi = AttendanceModel.#extractCleanSoiOrSubSoi(numLat, numLng, [nomZ18, nomZ20, nomZ19], initialElements);
            if (initialSoi && !AttendanceModel.#isForbiddenLocationTerm(initialSoi)) {
                const resultObj = {
                    locationName: `ใกล้เคียง ${initialSoi}`,
                    zoomLevel: 19
                };
                AttendanceModel.#locationCache.set(cacheKey, resultObj);
                return resultObj;
            }

            // ====================================================================
            // Tier 4: Retry loop (ขยายวงค้นหาโดยตรวจสอบสถานที่ก่อนชื่อซอยเสมอ)
            // ====================================================================
            const retryRadii = [180, 300];
            for (const radius of retryRadii) {
                const retryQuery = `[out:json][timeout:2];(nwr(around:${radius},${numLat},${numLng})["amenity"]["name"];nwr(around:${radius},${numLat},${numLng})["shop"]["name"];nwr(around:${radius},${numLat},${numLng})["office"]["name"];nwr(around:${radius},${numLat},${numLng})["tourism"]["name"];nwr(around:${radius},${numLat},${numLng})["historic"]["name"];nwr(around:${radius},${numLat},${numLng})["building"]["name"];);out center;`;
                const ovRetry = await AttendanceModel.#queryOverpassFast(retryQuery, 1800);
                const retryElements = ovRetry?.elements || [];

                if (retryElements.length === 0) continue;

                // 4.1 ตรวจสอบสถานที่จริงก่อน
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

                // 4.2 ตรวจสอบชื่อซอยตามมา
                const retrySoi = AttendanceModel.#extractCleanSoiOrSubSoi(numLat, numLng, [nomZ18, nomZ20, nomZ19], retryElements);
                if (retrySoi && !AttendanceModel.#isForbiddenLocationTerm(retrySoi)) {
                    const resultObj = {
                        locationName: `ใกล้เคียง ${retrySoi}`,
                        zoomLevel: 19
                    };
                    AttendanceModel.#locationCache.set(cacheKey, resultObj);
                    return resultObj;
                }
            }

            // 4.3 Probe พิกัดข้างเคียง (~40m) หากจุดหลักว่างเปล่า
            const offsets = [
                [0.00035, 0.00035],
                [-0.00035, -0.00035]
            ];
            for (const [dLat, dLng] of offsets) {
                const probeUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${(numLat + dLat).toFixed(6)}&lon=${(numLng + dLng).toFixed(6)}&zoom=18&addressdetails=1&namedetails=1&accept-language=th`;
                const probeData = await AttendanceModel.#fetchWithFastTimeout(probeUrl, 1000);
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

                const probeSoi = AttendanceModel.#extractCleanSoiOrSubSoi(numLat, numLng, [probeData], []);
                if (probeSoi && !AttendanceModel.#isForbiddenLocationTerm(probeSoi)) {
                    const resultObj = {
                        locationName: `ใกล้เคียง ${probeSoi}`,
                        zoomLevel: 20
                    };
                    AttendanceModel.#locationCache.set(cacheKey, resultObj);
                    return resultObj;
                }
            }

            // ====================================================================
            // Tier 5: Smart Semantic Fallback (ระบุย่าน/ถนน/แขวง/เขต ไม่หลุดพิกัดดิบหรือซอยในพื้นที่)
            // ====================================================================
            let road = '';
            let suburb = '';
            let district = '';
            let city = '';

            for (const nom of [nomZ18, nomZ19, nomZ20]) {
                if (!nom?.address) continue;
                const a = nom.address;
                if (!road) road = a.road || a.pedestrian || a.footway || a.street || '';
                if (!suburb) suburb = a.suburb || a.quarter || a.neighbourhood || '';
                if (!district) district = a.city_district || a.district || a.county || '';
                if (!city) city = a.city || a.state || '';
            }

            road = String(road || '').trim();
            suburb = String(suburb || '').trim();
            district = String(district || '').trim();
            city = String(city || '').trim();

            const isBangkok = !city || city.includes('กรุงเทพ') || city.includes('Bangkok');
            let cleanSuburb = suburb;
            if (cleanSuburb.startsWith('เขต') || cleanSuburb.startsWith('อำเภอ') || cleanSuburb.startsWith('อ.')) {
                if (!district) district = cleanSuburb;
                cleanSuburb = '';
            } else if (cleanSuburb && !cleanSuburb.startsWith('แขวง') && !cleanSuburb.startsWith('ตำบล') && !cleanSuburb.startsWith('ต.')) {
                cleanSuburb = isBangkok ? `แขวง${cleanSuburb}` : `ตำบล${cleanSuburb}`;
            }

            let cleanDistrict = district;
            if (cleanDistrict && !cleanDistrict.startsWith('เขต') && !cleanDistrict.startsWith('อำเภอ') && !cleanDistrict.startsWith('อ.')) {
                cleanDistrict = isBangkok ? `เขต${cleanDistrict}` : `อำเภอ${cleanDistrict}`;
            }

            const semanticParts = [];
            if (road) semanticParts.push(road);
            if (cleanSuburb && cleanSuburb !== cleanDistrict) semanticParts.push(cleanSuburb);
            if (cleanDistrict) semanticParts.push(cleanDistrict);
            if (!isBangkok && city) {
                semanticParts.push(city.startsWith('จ.') || city.startsWith('จังหวัด') ? city : `จ.${city}`);
            }

            let fallbackName = '';
            if (semanticParts.length > 0) {
                fallbackName = `บริเวณ ${semanticParts.join(' ')}`;
            } else if (city) {
                fallbackName = `บริเวณ พื้นที่${city}`;
            } else {
                fallbackName = 'บริเวณ พื้นที่กรุงเทพมหานคร';
            }

            const fallbackObj = {
                locationName: fallbackName,
                zoomLevel: 19
            };

            // บันทึกแคชเฉพาะกรณีที่ได้รับข้อมูล semantic
            // หากเกิดจาก network failure ทั้งหมด (ไม่มี address details และ elements ใดๆ เลย) จะไม่แคชถาวร เพื่อให้ retry สำเร็จเมื่อเน็ตกลับมา
            const isOfflineNetworkFailure = !nomZ18?.address && !nomZ19?.address && !nomZ20?.address && initialElements.length === 0;
            if (!isOfflineNetworkFailure) {
                AttendanceModel.#locationCache.set(cacheKey, fallbackObj);
            }
            return fallbackObj;
        } catch (err) {
            console.warn('resolveLocationWithZoomMeta unhandled error:', err);
            return { locationName: 'บริเวณ พื้นที่กรุงเทพมหานคร', zoomLevel: 19 };
        }
    }

    /**
     * เมธอดหลักสำหรับคืนค่าชื่อสถานที่ (เรียกใช้ resolveLocationWithZoomMeta)
     * @param {number} lat
     * @param {number} lng
     * @param {Object} [options={}]
     * @returns {Promise<string>}
     */
    static async resolveLocationName(lat, lng, options = {}) {
        const res = await AttendanceModel.resolveLocationWithZoomMeta(lat, lng, options);
        return res.locationName;
    }

    /**
     * ขยายคำย่อภาษาไทยและอังกฤษก่อนส่งค้นหา Geocoding
     * @param {string} query
     * @returns {string}
     */
    static normalizeSearchQuery(query) {
        if (!query || typeof query !== 'string') return '';
        let q = query.trim();
        q = q.replace(/^bts\s*/i, 'สถานีรถไฟฟ้า ');
        q = q.replace(/^mrt\s*/i, 'สถานีรถไฟฟ้า ');
        q = q.replace(/^สน\.\s*/i, 'สถานีตำรวจนครบาล ');
        q = q.replace(/^รพ\.\s*/i, 'โรงพยาบาล ');
        q = q.replace(/^รร\.\s*/i, 'โรงเรียน ');
        // ขยายคำค้นโรงพยาบาลจุฬาฯ โดยปกป้องจุฬาภรณ์
        q = q.replace(/^(?:รพ\.?|โรงพยาบาล)\s*จุฬา(?:ลงกรณ์)?(?!\S*ภรณ์)(?=\s|$|[0-9])\s*/i, 'โรงพยาบาลจุฬาลงกรณ์ ');
        q = q.replace(/^ม\.?\s*เกษตร(?:ศาสตร์)?\s*/i, 'มหาวิทยาลัยเกษตรศาสตร์ ');
        q = q.replace(/^(?:ม\.?\s*ธรรมศาสตร์|มธ\.?)(?=\s|$|[0-9])\s*/i, 'มหาวิทยาลัยธรรมศาสตร์ ');
        q = q.replace(/^ม\.?\s*ราม(?:คำแหง)?\s*/i, 'มหาวิทยาลัยรามคำแหง ');
        q = q.replace(/^(?:ม\.?\s*เชียงใหม่|มช\.?)(?=\s|$|[0-9])\s*/i, 'มหาวิทยาลัยเชียงใหม่ ');
        q = q.replace(/^ม\.?\s*จุฬา(?:ลงกรณ์)?(?:มหาวิทยาลัย)?(?:ฯ)?(?!\S*ภรณ์)(?=\s|$|[0-9])\s*/i, 'จุฬาลงกรณ์มหาวิทยาลัย ');
        q = q.replace(/^จุฬา(?:ลงกรณ์)?(?:มหาวิทยาลัย)?(?:ฯ)?(?!\S*ภรณ์)(?=\s|$|[0-9])\s*/i, 'จุฬาลงกรณ์มหาวิทยาลัย ');
        q = q.replace(/^(?:bma|กทม\.?)(?=\s|$|[0-9])\s*/i, 'ศาลาว่าการกรุงเทพมหานคร ');
        return q.trim();
    }

    /**
     * แปลงหมวดหมู่สถานที่จาก ArcGIS Type / Addr_type เป็นหมวดหมู่ภาษาไทย (11 หมวด)
     * @param {string} [arcType='']
     * @param {string} [addrType='']
     * @param {string} [name='']
     * @returns {string}
     */
    static #mapArcGISTypeToCategory(arcType = '', addrType = '', name = '') {
        const typeStr = String(arcType || '').toLowerCase();
        const addrStr = String(addrType || '').toLowerCase();
        const nameStr = String(name || '').toLowerCase();
        const combined = `${typeStr} ${addrStr} ${nameStr}`;

        if (/bma|กรุงเทพมหานคร|สำนักงานเขต|bangkok metropolitan administration/i.test(nameStr) ||
            (/ศาลาว่าการ/i.test(nameStr) && !/พัทยา/i.test(nameStr)) ||
            /bma|bangkok metropolitan administration/i.test(typeStr)) {
            return 'สถานที่ราชการ กทม.';
        }
        if (/government|police|court|city hall|town hall|public|civic|fire station|post office|embassy|consulate|ministry|department/i.test(combined)) {
            return 'สถานที่ราชการ';
        }
        if (/school|university|college|education|library|academy|kindergarten/i.test(combined)) {
            return 'สถานศึกษา';
        }
        if (/hospital|clinic|health|medical|doctor|dentist|pharmacy|drugstore/i.test(combined)) {
            return 'โรงพยาบาล / สาธารณสุข';
        }
        if (/train|station|metro|subway|transit|bus|airport|ferry|pier|railway/i.test(combined)) {
            return 'สถานีขนส่ง / รถไฟฟ้า';
        }
        if (/shopping|mall|market|supermarket|convenience|grocery|retail|shop|store|department store/i.test(combined)) {
            return 'ห้างสรรพสินค้า / ตลาด';
        }
        if (/temple|worship|church|mosque|shrine|pagoda|religious/i.test(combined)) {
            return 'ศาสนสถาน';
        }
        if (/park|garden|zoo|recreation|playground|sports|stadium|arena|gym|fitness/i.test(combined)) {
            return 'สวนสาธารณะ / พักผ่อน';
        }
        if (/office|business|professional|corporate|commercial|industrial|bank|financial|company/i.test(combined)) {
            return 'อาคาร / สำนักงาน';
        }
        if (/hotel|motel|resort|hostel|lodging|apartment|dorm|condo|residence/i.test(combined)) {
            return 'โรงแรม / ที่พัก';
        }
        return 'สถานที่ / จุดสังเกต';
    }

    /**
     * แปลงหมวดหมู่สถานที่จาก OSM Key/Value เป็นหมวดหมู่ภาษาไทย (11 หมวด)
     * @param {string} [osmKey='']
     * @param {string} [osmVal='']
     * @param {string} [name='']
     * @returns {string}
     */
    static #mapOsmTypeToCategory(osmKey = '', osmVal = '', name = '') {
        const k = String(osmKey || '').toLowerCase();
        const v = String(osmVal || '').toLowerCase();
        const n = String(name || '').toLowerCase();

        if (/bma|กทม|ศาลาว่าการ|กรุงเทพมหานคร/i.test(n) || /bma/i.test(v)) {
            return 'สถานที่ราชการ กทม.';
        }
        if (k === 'government' || /government|townhall|courthouse|public_building|police|post_office|fire_station|embassy/i.test(v)) {
            return 'สถานที่ราชการ';
        }
        if (k === 'education' || /school|university|college|kindergarten|library/i.test(v)) {
            return 'สถานศึกษา';
        }
        if (/hospital|clinic|doctors|pharmacy|health/i.test(v)) {
            return 'โรงพยาบาล / สาธารณสุข';
        }
        if (k === 'railway' || /station|subway|bus_stop|bus_station|airport|ferry|pier|transit/i.test(v)) {
            return 'สถานีขนส่ง / รถไฟฟ้า';
        }
        if (k === 'shop' || /mall|supermarket|department_store|convenience|market|grocery/i.test(v)) {
            return 'ห้างสรรพสินค้า / ตลาด';
        }
        if (/worship|temple|church|mosque|shrine/i.test(v)) {
            return 'ศาสนสถาน';
        }
        if (k === 'leisure' || /park|garden|pitch|playground|sports_centre|stadium/i.test(v)) {
            return 'สวนสาธารณะ / พักผ่อน';
        }
        if (k === 'office' || /building|commercial|bank/i.test(v) || k === 'building') {
            return 'อาคาร / สำนักงาน';
        }
        if (k === 'tourism' || /hotel|motel|resort|hostel|guest_house/i.test(v)) {
            return 'โรงแรม / ที่พัก';
        }
        return 'สถานที่ / จุดสังเกต';
    }

    /**
     * ค้นหาสถานที่ไปข้างหน้าผ่าน ArcGIS World Geocoding Service (Tier 1 Primary Engine)
     * @param {string} query
     * @param {Object} [options={}]
     * @returns {Promise<Array<{lat: number, lng: number, mainName: string, subAddr: string, category: string, extent: Object|null, score: number, source: string}>>}
     */
    static async #queryArcGISForwardGeocode(query, options = {}) {
        const normQuery = AttendanceModel.normalizeSearchQuery(query);
        if (!normQuery) return [];

        const limit = Math.max(1, Math.min(options.limit || 8, 20));
        let url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?singleLine=${encodeURIComponent(normQuery)}&f=json&outSR=4326&countryCode=THA&langCode=th&maxLocations=${limit}&outFields=PlaceName,Type,Addr_type,Place_addr,City,Subregion,Region,Postal`;

        const refLat = Number(options.refLat);
        const refLng = Number(options.refLng);
        if (Number.isFinite(refLat) && Number.isFinite(refLng) && refLat >= -90 && refLat <= 90 && refLng >= -180 && refLng <= 180) {
            url += `&location=${refLng},${refLat}`;
        }

        try {
            const data = await AttendanceModel.#fetchWithFastTimeout(url, 1800);
            if (!data || !Array.isArray(data.candidates) || data.candidates.length === 0) {
                return [];
            }

            const items = [];
            for (const c of data.candidates) {
                const score = Number(c.score || 0);
                if (score < 70) continue;

                const loc = c.location || {};
                const lat = Number(loc.y);
                const lng = Number(loc.x);
                if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;

                const attrs = c.attributes || {};
                const mainName = (attrs.PlaceName || c.address || '').trim();
                if (!mainName) continue;

                const addrParts = [];
                if (attrs.Place_addr && attrs.Place_addr !== mainName) addrParts.push(attrs.Place_addr);
                if (attrs.Subregion && attrs.Subregion !== mainName && !addrParts.includes(attrs.Subregion)) addrParts.push(attrs.Subregion);
                if (attrs.City && attrs.City !== mainName && !addrParts.includes(attrs.City)) addrParts.push(attrs.City);
                if (attrs.Region && attrs.Region !== mainName && !addrParts.includes(attrs.Region)) addrParts.push(attrs.Region);
                const subAddr = addrParts.join(', ') || attrs.Place_addr || attrs.Region || '';

                const category = AttendanceModel.#mapArcGISTypeToCategory(attrs.Type, attrs.Addr_type, mainName);

                let extent = null;
                if (c.extent && c.extent.ymin != null && c.extent.ymax != null && c.extent.xmin != null && c.extent.xmax != null) {
                    extent = {
                        ymin: Math.min(Number(c.extent.ymin), Number(c.extent.ymax)),
                        ymax: Math.max(Number(c.extent.ymin), Number(c.extent.ymax)),
                        xmin: Math.min(Number(c.extent.xmin), Number(c.extent.xmax)),
                        xmax: Math.max(Number(c.extent.xmin), Number(c.extent.xmax))
                    };
                }

                items.push({
                    lat,
                    lng,
                    mainName,
                    subAddr,
                    category,
                    extent,
                    score,
                    source: 'arcgis'
                });
            }
            return items;
        } catch (_) {
            return [];
        }
    }

    /**
     * ค้นหาสถานที่ไปข้างหน้าผ่าน Photon Komoot API (Tier 2 Fallback Engine)
     * @param {string} query
     * @param {Object} [options={}]
     * @returns {Promise<Array<{lat: number, lng: number, mainName: string, subAddr: string, category: string, extent: Object|null, score: number, source: string}>>}
     */
    static async #queryPhotonForwardGeocode(query, options = {}) {
        const normQuery = AttendanceModel.normalizeSearchQuery(query);
        if (!normQuery) return [];

        const limit = Math.max(1, Math.min(options.limit || 8, 20));
        const refLat = Number(options.refLat);
        const refLng = Number(options.refLng);
        const hasRef = Number.isFinite(refLat) && Number.isFinite(refLng) && refLat >= -90 && refLat <= 90 && refLng >= -180 && refLng <= 180;

        const locParam = hasRef ? `&lat=${refLat}&lon=${refLng}` : '';
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(normQuery)}&limit=${limit}${locParam}&lang=default`;

        try {
            const data = await AttendanceModel.#fetchWithFastTimeout(url, 2000);
            if (!data || !Array.isArray(data.features) || data.features.length === 0) {
                return [];
            }

            const items = [];
            for (const f of data.features) {
                const coords = f.geometry?.coordinates || [];
                const lng = Number(coords[0]);
                const lat = Number(coords[1]);
                if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;

                const props = f.properties || {};
                const mainName = (props.name || props.street || props.district || props.city || 'สถานที่ที่เลือก').trim();

                const addrParts = [];
                if (props.street && props.street !== mainName) addrParts.push(props.street);
                if (props.district && props.district !== mainName && !addrParts.includes(props.district)) addrParts.push(props.district);
                if (props.city && props.city !== mainName && !addrParts.includes(props.city)) addrParts.push(props.city);
                if (props.state && props.state !== mainName && props.state !== props.city && !addrParts.includes(props.state)) addrParts.push(props.state);
                const subAddr = addrParts.join(', ') || props.country || '';

                const category = AttendanceModel.#mapOsmTypeToCategory(props.osm_key, props.osm_value, mainName);

                let extent = null;
                if (Array.isArray(f.properties?.extent) && f.properties.extent.length === 4) {
                    const e0 = Number(f.properties.extent[0]);
                    const e1 = Number(f.properties.extent[1]);
                    const e2 = Number(f.properties.extent[2]);
                    const e3 = Number(f.properties.extent[3]);
                    if (Number.isFinite(e0) && Number.isFinite(e1) && Number.isFinite(e2) && Number.isFinite(e3)) {
                        extent = {
                            ymin: Math.min(e1, e3),
                            ymax: Math.max(e1, e3),
                            xmin: Math.min(e0, e2),
                            xmax: Math.max(e0, e2)
                        };
                    }
                }

                items.push({
                    lat,
                    lng,
                    mainName,
                    subAddr,
                    category,
                    extent,
                    score: 80,
                    source: 'photon'
                });
            }
            return items;
        } catch (_) {
            return [];
        }
    }

    /**
     * ค้นหาสถานที่ไปข้างหน้าผ่าน Nominatim OpenStreetMap (Tier 3 Fallback Engine)
     * @param {string} query
     * @param {Object} [options={}]
     * @returns {Promise<Array<{lat: number, lng: number, mainName: string, subAddr: string, category: string, extent: Object|null, score: number, source: string}>>}
     */
    static async #queryNominatimForwardGeocode(query, options = {}) {
        const normQuery = AttendanceModel.normalizeSearchQuery(query);
        if (!normQuery) return [];

        const limit = Math.max(1, Math.min(options.limit || 6, 20));
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(normQuery)}&countrycodes=th&limit=${limit}&accept-language=th&addressdetails=1`;

        try {
            const data = await AttendanceModel.#fetchWithFastTimeout(url, 2200, {
                'User-Agent': 'CheckinApp-BMA/2.0'
            });
            if (!data || !Array.isArray(data) || data.length === 0) {
                return [];
            }

            const items = [];
            for (const it of data) {
                const lat = Number(it.lat);
                const lng = Number(it.lon);
                if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;

                let mainName = (it.name || '').trim();
                if (!mainName && it.address) {
                    const a = it.address;
                    mainName = (a.amenity || a.building || a.office || a.leisure || a.tourism || a.shop || '').trim();
                }
                if (!mainName) {
                    mainName = (it.display_name || '').split(',')[0].trim() || 'สถานที่ที่เลือก';
                }

                let subAddr = '';
                if (it.address) {
                    const a = it.address;
                    const parts = [];
                    if (a.road) parts.push(a.road);
                    const sub = a.quarter || a.suburb || a.neighbourhood;
                    if (sub && !parts.includes(sub) && sub !== mainName) parts.push(sub);
                    const dist = a.city_district || a.district || (a.suburb !== sub ? a.suburb : '') || a.county;
                    if (dist && !parts.includes(dist) && dist !== mainName) parts.push(dist);
                    const prov = a.state || a.province || a.city;
                    if (prov && !parts.includes(prov) && prov !== mainName) parts.push(prov);
                    if (parts.length > 0) subAddr = parts.join(', ');
                }
                if (!subAddr) {
                    const tokens = (it.display_name || '').split(',').map(s => s.trim());
                    subAddr = tokens.slice(1, 4).join(', ') || it.display_name || '';
                }

                const category = AttendanceModel.#mapOsmTypeToCategory(it.class, it.type, mainName);

                let extent = null;
                if (Array.isArray(it.boundingbox) && it.boundingbox.length === 4) {
                    const b0 = Number(it.boundingbox[0]);
                    const b1 = Number(it.boundingbox[1]);
                    const b2 = Number(it.boundingbox[2]);
                    const b3 = Number(it.boundingbox[3]);
                    if (Number.isFinite(b0) && Number.isFinite(b1) && Number.isFinite(b2) && Number.isFinite(b3)) {
                        extent = {
                            ymin: Math.min(b0, b1),
                            ymax: Math.max(b0, b1),
                            xmin: Math.min(b2, b3),
                            xmax: Math.max(b2, b3)
                        };
                    }
                }

                items.push({
                    lat,
                    lng,
                    mainName,
                    subAddr,
                    category,
                    extent,
                    score: 70,
                    source: 'nominatim'
                });
            }
            return items;
        } catch (_) {
            return [];
        }
    }

    /**
     * ค้นหาสถานที่ไปข้างหน้า (Forward Geocoding Search) ด้วยระบบ 3-Tier Multi-Engine Resilience:
     * Tier 0: Direct GPS Coordinate Match (หากตรงรูปแบบละติจูด, ลองจิจูด คืนการ์ดนำทางพิกัดทันที)
     * Tier 1: ArcGIS World Geocoding Engine (Primary Engine คืน POI คุณภาพสูงและ Boundary Extent)
     * Tier 2: Photon Komoot Engine (Fallback Engine รองรับ Proximity Bias)
     * Tier 3: Nominatim OpenStreetMap (Fallback Engine สุดท้าย)
     * พร้อมคำนวณระยะห่าง Haversine และจัดลำดับความสำคัญตามจังหวัดและระยะทางที่ใกล้ที่สุด
     * @param {string} query
     * @param {Object} [options={}]
     * @param {number} [options.refLat]
     * @param {number} [options.refLng]
     * @param {string} [options.userProvince]
     * @param {number} [options.limit=8]
     * @returns {Promise<Array<{lat: number, lng: number, mainName: string, subAddr: string, category: string, extent: Object|null, score: number, source: string, distanceMeters: number|null, distStr: string, isCoordinate?: boolean}>>}
     */
    static async searchPlaces(query, options = {}) {
        const rawQuery = String(query || '').trim();
        if (!rawQuery) return [];

        // 1. Direct coordinate Regex detection
        const coordRegex = /^\s*([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)\s*$/;
        const match = rawQuery.match(coordRegex);
        if (match) {
            let lat = parseFloat(match[1]);
            let lng = parseFloat(match[2]);
            if (!isNaN(lat) && !isNaN(lng)) {
                if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
                    const tmp = lat;
                    lat = lng;
                    lng = tmp;
                }
                if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    const refLat = Number(options.refLat);
                    const refLng = Number(options.refLng);
                    let distanceMeters = null;
                    let distStr = '';
                    if (Number.isFinite(refLat) && Number.isFinite(refLng)) {
                        distanceMeters = AttendanceModel.#calculateDistanceMeters(refLat, refLng, lat, lng);
                        distStr = distanceMeters < 1000 ? `• ${Math.round(distanceMeters)} ม.` : `• ${(distanceMeters / 1000).toFixed(1)} กม.`;
                    }
                    return [{
                        lat,
                        lng,
                        mainName: `พิกัด (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
                        subAddr: 'พิกัดทางภูมิศาสตร์ที่ระบุโดยตรง',
                        category: 'พิกัด GPS',
                        extent: null,
                        score: 100,
                        source: 'coordinates',
                        distanceMeters,
                        distStr,
                        isCoordinate: true
                    }];
                }
            }
        }

        // 2. Query Tier 1 ArcGIS -> fallback to Tier 2 Photon -> fallback to Tier 3 Nominatim
        let results = [];
        try {
            results = await AttendanceModel.#queryArcGISForwardGeocode(rawQuery, options);
        } catch (_) {
            results = [];
        }

        if (!results || results.length === 0) {
            try {
                results = await AttendanceModel.#queryPhotonForwardGeocode(rawQuery, options);
            } catch (_) {
                results = [];
            }
        }

        if (!results || results.length === 0) {
            try {
                results = await AttendanceModel.#queryNominatimForwardGeocode(rawQuery, options);
            } catch (_) {
                results = [];
            }
        }

        if (!results || results.length === 0) {
            return [];
        }

        // 3. Calculate distance and format display
        const refLat = Number(options.refLat);
        const refLng = Number(options.refLng);
        const hasRef = Number.isFinite(refLat) && Number.isFinite(refLng);
        const userProvince = (options.userProvince || '').trim();

        results.forEach(item => {
            if (hasRef && Number.isFinite(item.lat) && Number.isFinite(item.lng)) {
                const dist = AttendanceModel.#calculateDistanceMeters(refLat, refLng, item.lat, item.lng);
                item.distanceMeters = dist;
                item.distStr = dist < 1000 ? `• ${Math.round(dist)} ม.` : `• ${(dist / 1000).toFixed(1)} กม.`;
            } else {
                item.distanceMeters = null;
                item.distStr = '';
            }
        });

        // 4. Sort results prioritizing matching user's province then closest distance
        if (hasRef || userProvince) {
            const isBangkokUser = /กรุงเทพ|กทม|bangkok/i.test(userProvince);
            const cleanProv = userProvince
                .replace(/^(จ\.|จังหวัด)\s*/i, '')
                .replace(/^(กทม\.?|กรุงเทพฯ|กรุงเทพมหานคร)$/i, 'กรุงเทพ')
                .trim();

            results.sort((a, b) => {
                if (userProvince || cleanProv || isBangkokUser) {
                    const textA = `${a.mainName || ''} ${a.subAddr || ''}`;
                    const textB = `${b.mainName || ''} ${b.subAddr || ''}`;
                    let aProv = (userProvince && textA.includes(userProvince)) || (cleanProv && textA.includes(cleanProv));
                    let bProv = (userProvince && textB.includes(userProvince)) || (cleanProv && textB.includes(cleanProv));
                    if (isBangkokUser) {
                        if (/กรุงเทพ|กทม|bangkok/i.test(textA)) aProv = true;
                        if (/กรุงเทพ|กทม|bangkok/i.test(textB)) bProv = true;
                    }
                    if (aProv && !bProv) return -1;
                    if (!aProv && bProv) return 1;
                }
                if (a.distanceMeters != null && b.distanceMeters != null) {
                    return a.distanceMeters - b.distanceMeters;
                }
                if (a.distanceMeters != null) return -1;
                if (b.distanceMeters != null) return 1;
                return (b.score || 0) - (a.score || 0);
            });
        }

        // 5. Deduplicate results with identical mainName and close proximity (< 250m)
        const uniqueResults = [];
        for (const item of results) {
            const isDup = uniqueResults.some(u => {
                if (u.mainName.toLowerCase() === item.mainName.toLowerCase()) {
                    if (u.lat === item.lat && u.lng === item.lng) return true;
                    if (Number.isFinite(u.lat) && Number.isFinite(item.lat)) {
                        const d = AttendanceModel.#calculateDistanceMeters(u.lat, u.lng, item.lat, item.lng);
                        if (d < 250) return true;
                    }
                }
                return false;
            });
            if (!isDup) uniqueResults.push(item);
        }

        const maxLimit = Math.max(1, Math.min(options.limit || 8, 20));
        return uniqueResults.slice(0, maxLimit);
    }

    /**
     * สุ่มพิกัด GPS ขาออกในรัศมีที่กำหนด (default 6 - 20 เมตร)
     * @param {number} lat 
     * @param {number} lng 
     * @param {number} maxRadiusMeters 
     * @param {number} minRadiusMeters 
     * @returns {{lat: number|null, lng: number|null}}
     */
    static calculateGpsJitter(lat, lng, maxRadiusMeters = 20, minRadiusMeters = null) {
        if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
            return { lat: null, lng: null };
        }
        const maxR = Math.max(5, Number(maxRadiusMeters || 20));
        const minR = minRadiusMeters != null ? minRadiusMeters : Math.max(2, Math.round(maxR * 0.3));
        const r = minR + Math.random() * (maxR - minR);
        const theta = Math.random() * 2 * Math.PI;
        const deltaLat = (r * Math.cos(theta)) / 111320;
        const deltaLng = (r * Math.sin(theta)) / (111320 * Math.cos(lat * Math.PI / 180));
        return {
            lat: Number((lat + deltaLat).toFixed(7)),
            lng: Number((lng + deltaLng).toFixed(7))
        };
    }

    /**
     * สุ่มพิกัด GPS ขาออก และค้นหาชื่อสถานที่ใกล้เคียงจนกว่าจะได้ค่าที่ถูกต้องตามกฎ
     * @param {number} baseLat 
     * @param {number} baseLng 
     * @param {number} radiusMeters 
     * @param {number} maxAttempts 
     * @returns {Promise<{lat: number, lng: number, locationName: string}>}
     */
    static async resolveJitteredCheckoutWithLocation(baseLat, baseLng, radiusMeters = 20, maxAttempts = 3) {
        const numLat = Number(baseLat);
        const numLng = Number(baseLng);
        if (isNaN(numLat) || isNaN(numLng)) {
            return { lat: null, lng: null, locationName: 'ไม่ระบุสถานที่' };
        }

        const radius = Math.max(5, Number(radiusMeters || 20));
        let bestResult = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const jittered = AttendanceModel.calculateGpsJitter(numLat, numLng, radius);
            if (jittered.lat === null || jittered.lng === null) continue;

            try {
                const locMeta = await AttendanceModel.resolveLocationWithZoomMeta(jittered.lat, jittered.lng);
                const locName = locMeta?.locationName || '';

                if (locName && locName !== 'ไม่ระบุสถานที่' && !locName.includes('ไม่ระบุ')) {
                    return {
                        lat: jittered.lat,
                        lng: jittered.lng,
                        locationName: locName
                    };
                }

                bestResult = {
                    lat: jittered.lat,
                    lng: jittered.lng,
                    locationName: locName || `พิกัด (${jittered.lat.toFixed(5)}, ${jittered.lng.toFixed(5)})`
                };
            } catch (e) {
                console.warn(`Attempt ${attempt} resolve jittered location error:`, e);
            }
        }

        return bestResult || {
            lat: numLat,
            lng: numLng,
            locationName: 'ขอลงเวลากรณีพิเศษ'
        };
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
            .select('id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time, check_in_location, check_out_location, status, remark, row_color, is_overtime, is_special_request, approval_status, created_at, updated_at')
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

    static async getPersonalAttendanceHistory(personnelId, userId, limit = 35) {
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
                updated_at: new Date().toISOString(),
                check_out_location_mode: payload.check_out_location_mode || payload.location_mode || 'ONSITE',
                check_out_offsite_reason: payload.check_out_offsite_reason || null
            };
            if (payload.check_out_distance_from_official_meters !== undefined && payload.check_out_distance_from_official_meters !== null) {
                updateOut.check_out_distance_from_official_meters = Number(payload.check_out_distance_from_official_meters);
            } else if (payload.distance_from_official_meters !== undefined && payload.distance_from_official_meters !== null) {
                updateOut.check_out_distance_from_official_meters = Number(payload.distance_from_official_meters);
            }

            let { data, error } = await db
                .from('attendance_logs')
                .update(updateOut)
                .eq('id', activeRegularRecord.id)
                .select()
                .single();

            if (error && (error.message?.includes('column') || error.code === '42703' || error.message?.includes('does not exist'))) {
                delete updateOut.check_out_location_mode;
                delete updateOut.check_out_distance_from_official_meters;
                delete updateOut.check_out_offsite_reason;
                const retry = await db
                    .from('attendance_logs')
                    .update(updateOut)
                    .eq('id', activeRegularRecord.id)
                    .select()
                    .single();
                data = retry.data;
                error = retry.error;
            }

            if (error) {
                return { success: false, message: 'ไม่สามารถบันทึกลงเวลาเลิกงานได้: ' + error.message };
            }

            const dateNotice = isPastDateRecord ? ` (ของวันที่ ${UIHelpers.formatThaiShortDate(activeRegularRecord.work_date)})` : '';
            try {
                DatabaseService.getInstance().broadcastRealtimeEvent('attendance_updated', {
                    action: 'checkin_checkout',
                    id: data?.id || null,
                    personnel_id: payload.personnel_id || null,
                    timestamp: Date.now()
                });
            } catch (_) {}
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

            let outLat = payload.lat ?? null;
            let outLng = payload.lng ?? null;
            let outLocName = payload.location_name || '';

            if (settings.randomize_gps_checkout && payload.lat != null && payload.lng != null) {
                const numLat = Number(payload.lat);
                const numLng = Number(payload.lng);
                if (!isNaN(numLat) && !isNaN(numLng)) {
                    const jitterRadius = Math.max(5, Number(settings.randomize_gps_radius_meters || 20));
                    const jitterResult = await AttendanceModel.resolveJitteredCheckoutWithLocation(numLat, numLng, jitterRadius);
                    if (jitterResult.lat !== null && jitterResult.lng !== null) {
                        outLat = jitterResult.lat;
                        outLng = jitterResult.lng;
                        outLocName = jitterResult.locationName;
                    }
                }
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
                check_out_lat: outLat,
                check_out_lng: outLng,
                check_out_location: outLocName,
                status: 'ปฏิบัติงานนอกเวลา',
                remark: payload.remark || (payload.is_overnight ? 'ปฏิบัติงานนอกเวลา (ข้ามวัน)' : 'ปฏิบัติงานนอกเวลา'),
                location_mode: payload.location_mode || 'ONSITE',
                offsite_reason: payload.offsite_reason || null,
                distance_from_official_meters: (payload.distance_from_official_meters !== undefined && payload.distance_from_official_meters !== null) ? Number(payload.distance_from_official_meters) : null,
                check_out_location_mode: payload.check_out_location_mode || payload.location_mode || 'ONSITE',
                check_out_distance_from_official_meters: (payload.check_out_distance_from_official_meters !== undefined && payload.check_out_distance_from_official_meters !== null) ? Number(payload.check_out_distance_from_official_meters) : ((payload.distance_from_official_meters !== undefined && payload.distance_from_official_meters !== null) ? Number(payload.distance_from_official_meters) : null),
                check_out_offsite_reason: payload.check_out_offsite_reason || payload.offsite_reason || null,
                row_color: colors.overtime || '#2563EB',
                is_overtime: true,
                is_special_request: false,
                approval_status: 'approved'
            };

            let { data: createdOt, error: otError } = await db
                .from('attendance_logs')
                .insert(insertOtData)
                .select()
                .single();

            if (otError && (otError.message?.includes('column') || otError.code === '42703' || otError.message?.includes('does not exist'))) {
                delete insertOtData.location_mode;
                delete insertOtData.offsite_reason;
                delete insertOtData.distance_from_official_meters;
                delete insertOtData.check_out_location_mode;
                delete insertOtData.check_out_distance_from_official_meters;
                delete insertOtData.check_out_offsite_reason;
                const retry = await db
                    .from('attendance_logs')
                    .insert(insertOtData)
                    .select()
                    .single();
                createdOt = retry.data;
                otError = retry.error;
            }

            if (otError) {
                return { success: false, message: 'ไม่สามารถบันทึกลงเวลาปฏิบัติงานนอกเวลาได้: ' + otError.message };
            }

            try {
                DatabaseService.getInstance().broadcastRealtimeEvent('attendance_updated', {
                    action: 'checkin_checkout',
                    id: createdOt?.id || null,
                    personnel_id: payload.personnel_id || null,
                    timestamp: Date.now()
                });
            } catch (_) {}
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

            let outLat = payload.lat ?? null;
            let outLng = payload.lng ?? null;
            let outLocName = payload.location_name || '';

            if (settings.randomize_gps_checkout && payload.lat != null && payload.lng != null) {
                const numLat = Number(payload.lat);
                const numLng = Number(payload.lng);
                if (!isNaN(numLat) && !isNaN(numLng)) {
                    const jitterRadius = Math.max(5, Number(settings.randomize_gps_radius_meters || 20));
                    const jitterResult = await AttendanceModel.resolveJitteredCheckoutWithLocation(numLat, numLng, jitterRadius);
                    if (jitterResult.lat !== null && jitterResult.lng !== null) {
                        outLat = jitterResult.lat;
                        outLng = jitterResult.lng;
                        outLocName = jitterResult.locationName;
                    }
                }
            }

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
                check_out_lat: outLat,
                check_out_lng: outLng,
                check_out_location: outLocName,
                status: evalResult.status_label,
                remark: payload.remark || '',
                location_mode: payload.location_mode || 'ONSITE',
                offsite_reason: payload.offsite_reason || null,
                distance_from_official_meters: (payload.distance_from_official_meters !== undefined && payload.distance_from_official_meters !== null) ? Number(payload.distance_from_official_meters) : null,
                check_out_location_mode: payload.check_out_location_mode || payload.location_mode || 'ONSITE',
                check_out_distance_from_official_meters: (payload.check_out_distance_from_official_meters !== undefined && payload.check_out_distance_from_official_meters !== null) ? Number(payload.check_out_distance_from_official_meters) : ((payload.distance_from_official_meters !== undefined && payload.distance_from_official_meters !== null) ? Number(payload.distance_from_official_meters) : null),
                check_out_offsite_reason: payload.check_out_offsite_reason || payload.offsite_reason || null,
                row_color: evalResult.row_color,
                is_overtime: false,
                is_special_request: false,
                approval_status: 'approved'
            };

            let { data, error } = await db
                .from('attendance_logs')
                .insert(insertBoth)
                .select()
                .single();

            if (error && (error.message?.includes('column') || error.code === '42703' || error.message?.includes('does not exist'))) {
                delete insertBoth.location_mode;
                delete insertBoth.offsite_reason;
                delete insertBoth.distance_from_official_meters;
                delete insertBoth.check_out_location_mode;
                delete insertBoth.check_out_distance_from_official_meters;
                delete insertBoth.check_out_offsite_reason;
                const retry = await db
                    .from('attendance_logs')
                    .insert(insertBoth)
                    .select()
                    .single();
                data = retry.data;
                error = retry.error;
            }

            if (error) {
                return { success: false, message: 'ไม่สามารถบันทึกลงเวลาได้: ' + error.message };
            }

            try {
                DatabaseService.getInstance().broadcastRealtimeEvent('attendance_updated', {
                    action: 'checkin_checkout',
                    id: data?.id || null,
                    personnel_id: payload.personnel_id || null,
                    timestamp: Date.now()
                });
            } catch (_) {}
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
            location_mode: payload.location_mode || 'ONSITE',
            offsite_reason: payload.offsite_reason || null,
            distance_from_official_meters: (payload.distance_from_official_meters !== undefined && payload.distance_from_official_meters !== null) ? Number(payload.distance_from_official_meters) : null,
            row_color: evalIn.row_color,
            is_overtime: false,
            is_special_request: false,
            approval_status: 'approved'
        };

        let { data, error } = await db
            .from('attendance_logs')
            .insert(insertIn)
            .select()
            .single();

        if (error && (error.message?.includes('column') || error.code === '42703' || error.message?.includes('does not exist'))) {
            delete insertIn.location_mode;
            delete insertIn.offsite_reason;
            delete insertIn.distance_from_official_meters;
            const retry = await db
                .from('attendance_logs')
                .insert(insertIn)
                .select()
                .single();
            data = retry.data;
            error = retry.error;
        }

        if (error) {
            return { success: false, message: 'ไม่สามารถบันทึกลงเวลาเข้าปฏิบัติงานได้: ' + error.message };
        }

        try {
            DatabaseService.getInstance().broadcastRealtimeEvent('attendance_updated', {
                action: 'checkin_checkout',
                id: data?.id || null,
                personnel_id: payload.personnel_id || null,
                timestamp: Date.now()
            });
        } catch (_) {}
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

        let outLat = payload.lat ?? null;
        let outLng = payload.lng ?? null;
        let outLocName = payload.location_name || 'ขอลงเวลากรณีพิเศษ';

        if (settings.randomize_gps_checkout && payload.lat != null && payload.lng != null) {
            const numLat = Number(payload.lat);
            const numLng = Number(payload.lng);
            if (!isNaN(numLat) && !isNaN(numLng)) {
                const jitterRadius = Math.max(5, Number(settings.randomize_gps_radius_meters || 20));
                const jitterResult = await AttendanceModel.resolveJitteredCheckoutWithLocation(numLat, numLng, jitterRadius);
                if (jitterResult.lat !== null && jitterResult.lng !== null) {
                    outLat = jitterResult.lat;
                    outLng = jitterResult.lng;
                    outLocName = jitterResult.locationName;
                }
            }
        }

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
            check_out_lat: outLat,
            check_out_lng: outLng,
            check_out_location: outLocName,
            status: targetStatus,
            remark: payload.remark,
            location_mode: payload.location_mode || 'OFFSITE',
            distance_from_official_meters: (payload.distance_from_official_meters !== undefined && payload.distance_from_official_meters !== null) ? Number(payload.distance_from_official_meters) : null,
            row_color: targetColor,
            is_overtime: isOvertimeShift,
            is_special_request: true,
            approval_status: 'pending'
        };

        let { data, error } = await db
            .from('attendance_logs')
            .insert(insertData)
            .select()
            .single();

        if (error && (error.message?.includes('column') || error.code === '42703' || error.message?.includes('does not exist'))) {
            delete insertData.location_mode;
            delete insertData.distance_from_official_meters;
            const retry = await db
                .from('attendance_logs')
                .insert(insertData)
                .select()
                .single();
            data = retry.data;
            error = retry.error;
        }

        if (error) {
            return { success: false, message: 'ไม่สามารถส่งคำขอลงเวลากรณีพิเศษได้: ' + error.message };
        }

        try {
            DatabaseService.getInstance().broadcastRealtimeEvent('attendance_updated', {
                action: 'special_request_submitted',
                id: data?.id || null,
                personnel_id: payload.personnel_id || null,
                timestamp: Date.now()
            });
        } catch (_) {}
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
                check_in_lat, check_in_lng, check_in_location, check_out_lat, check_out_lng, check_out_location,
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

        // Concurrency Guard: Check if requests are still pending
        const { data: currentLogs, error: checkError } = await db
            .from('attendance_logs')
            .select('id, approval_status')
            .in('id', logIds);

        if (checkError) {
            return { success: false, message: 'ไม่สามารถตรวจสอบสถานะคำขอได้: ' + checkError.message };
        }

        const stillPendingIds = (currentLogs || []).filter(l => l.approval_status === 'pending').map(l => l.id);
        if (stillPendingIds.length === 0) {
            return { success: false, conflict: true, message: 'คำขอนี้ได้รับการดำเนินการโดยผู้ดูแลระบบท่านอื่นแล้ว' };
        }

        const settings = await SettingsModel.getSettings(false);
        const colors = settings.category_colors || Config.DEFAULT_SETTINGS.category_colors;

        const { data: targetLogs } = await db
            .from('attendance_logs')
            .select('id, is_overtime, status')
            .in('id', stillPendingIds);

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
        try {
            DatabaseService.getInstance().broadcastRealtimeEvent('attendance_updated', {
                action: 'bulk_special_approval',
                decision: decision,
                count: updatedCount,
                timestamp: Date.now()
            });
        } catch (_) {}
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

        const selectWithLocMode = 'id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time, check_in_lat, check_in_lng, check_in_location, check_out_lat, check_out_lng, check_out_location, check_in_photo, check_out_photo, status, remark, row_color, is_overtime, is_special_request, approval_status, location_mode, offsite_reason, check_out_location_mode, check_out_distance_from_official_meters, check_out_offsite_reason, created_at, updated_at';
        const selectFallback = 'id, personnel_id, user_id, work_date, shift_name, check_in_time, check_out_time, check_in_lat, check_in_lng, check_in_location, check_out_lat, check_out_lng, check_out_location, check_in_photo, check_out_photo, status, remark, row_color, is_overtime, is_special_request, approval_status, created_at, updated_at';

        let [personnelRes, logsRes] = await Promise.all([
            db.from('personnel')
                .select('id, national_id, prefix, first_name, last_name, position_type, position_title, position_level, organization, bureau, division, work_group')
                .order('bureau', { ascending: true })
                .order('division', { ascending: true })
                .order('work_group', { ascending: true })
                .order('first_name', { ascending: true }),
            db.from('attendance_logs')
                .select(selectWithLocMode)
                .gte('work_date', startDate)
                .lte('work_date', effectiveEnd)
                .order('work_date', { ascending: true })
                .order('created_at', { ascending: true })
        ]);

        if (logsRes.error && (logsRes.error.message?.includes('column') || logsRes.error.code === '42703' || logsRes.error.message?.includes('does not exist'))) {
            logsRes = await db.from('attendance_logs')
                .select(selectFallback)
                .gte('work_date', startDate)
                .lte('work_date', effectiveEnd)
                .order('work_date', { ascending: true })
                .order('created_at', { ascending: true });
        }

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
            position_full: UIHelpers.formatPosition(person.position_title, person.position_level, person.position_type),
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
            location_mode: log?.location_mode || 'ONSITE',
            offsite_reason: log?.offsite_reason || null,
            check_out_location_mode: log?.check_out_location_mode || (log?.check_out_time ? 'ONSITE' : null),
            check_out_offsite_reason: log?.check_out_offsite_reason || null,
            check_out_distance_from_official_meters: log?.check_out_distance_from_official_meters || null,
            remark: log?.remark || '',
            created_at: log?.created_at || null,
            updated_at: log?.updated_at || null,
            status_key: evalStatus.status_key,
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

        if (payload.location_mode) recordData.location_mode = payload.location_mode;
        if (payload.offsite_reason) recordData.offsite_reason = payload.offsite_reason;
        if (payload.check_out_location_mode) recordData.check_out_location_mode = payload.check_out_location_mode;
        if (payload.check_out_offsite_reason) recordData.check_out_offsite_reason = payload.check_out_offsite_reason;

        if (payload.log_id) {
            let { error } = await db
                .from('attendance_logs')
                .update(recordData)
                .eq('id', payload.log_id);

            if (error && (error.message?.includes('column') || error.code === '42703' || error.message?.includes('does not exist'))) {
                delete recordData.offsite_reason;
                delete recordData.check_out_location_mode;
                delete recordData.check_out_offsite_reason;
                delete recordData.location_mode;
                const retry = await db
                    .from('attendance_logs')
                    .update(recordData)
                    .eq('id', payload.log_id);
                error = retry.error;
            }

            if (error) {
                return { success: false, message: 'ไม่สามารถแก้ไขข้อมูลการลงเวลาได้: ' + error.message };
            }
            try {
                DatabaseService.getInstance().broadcastRealtimeEvent('attendance_updated', {
                    action: 'admin_save',
                    id: payload.log_id || null,
                    personnel_id: payload.personnel_id || null,
                    timestamp: Date.now()
                });
            } catch (_) {}
            return { success: true, message: 'อัปเดตข้อมูลการลงเวลาเรียบร้อยแล้ว' };
        } else {
            if (!recordData.location_mode) recordData.location_mode = 'ONSITE';
            let { error } = await db
                .from('attendance_logs')
                .insert(recordData);

            if (error && (error.message?.includes('column') || error.code === '42703' || error.message?.includes('does not exist'))) {
                delete recordData.offsite_reason;
                delete recordData.check_out_location_mode;
                delete recordData.check_out_offsite_reason;
                delete recordData.location_mode;
                const retry = await db
                    .from('attendance_logs')
                    .insert(recordData);
                error = retry.error;
            }

            if (error) {
                return { success: false, message: 'ไม่สามารถเพิ่มข้อมูลการลงเวลาได้: ' + error.message };
            }
            try {
                DatabaseService.getInstance().broadcastRealtimeEvent('attendance_updated', {
                    action: 'admin_save',
                    personnel_id: payload.personnel_id || null,
                    timestamp: Date.now()
                });
            } catch (_) {}
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
        try {
            DatabaseService.getInstance().broadcastRealtimeEvent('attendance_updated', {
                action: 'admin_delete',
                id: logId,
                timestamp: Date.now()
            });
        } catch (_) {}
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

    /**
     * ดึง Signature/Watermark ของ attendance_logs วันนี้และ system_settings เพื่อใช้ตรวจจับการเปลี่ยนแปลงแบบเบา (Lightweight Polling)
     * @returns {Promise<{attendanceSignature: string, settingsSignature: string, settingsRow: object|null}>}
     */
    static async getTodaySyncWatermark() {
        try {
            const db = DatabaseService.getInstance().client;
            const todayStr = UIHelpers.getTodayISO();

            const [logsRes, settingsRes] = await Promise.all([
                db.from('attendance_logs')
                    .select('id, status, check_in_time, check_out_time, approval_status, updated_at')
                    .eq('work_date', todayStr)
                    .order('updated_at', { ascending: false })
                    .limit(50),
                db.from('system_settings')
                    .select('id, updated_at, enforce_geofence_radius, require_gps, require_photo, category_colors')
                    .eq('id', 1)
                    .maybeSingle()
            ]);

            const logs = logsRes.data || [];
            const attendanceSignature = logs.map(l => `${l.id}:${l.status}:${l.check_in_time || ''}:${l.check_out_time || ''}:${l.approval_status || ''}:${l.updated_at || ''}`).join('|');

            const sRow = settingsRes.data || null;
            const settingsSignature = sRow
                ? `${sRow.updated_at || ''}:${sRow.enforce_geofence_radius}:${sRow.require_gps}:${sRow.require_photo}:${JSON.stringify(sRow.category_colors || {})}`
                : '';

            return {
                attendanceSignature,
                settingsSignature,
                settingsRow: sRow
            };
        } catch (err) {
            console.warn('[AttendanceModel.getTodaySyncWatermark] Error:', err);
            return { attendanceSignature: '', settingsSignature: '', settingsRow: null };
        }
    }
}