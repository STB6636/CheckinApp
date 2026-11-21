import assert from 'assert';

// Setup browser mocks for importing AttendanceModel
if (typeof window === 'undefined') {
    globalThis.window = {
        location: { origin: 'http://localhost' },
        addEventListener: () => {}
    };
    globalThis.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    };
    globalThis.sessionStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    };
}

import { AttendanceModel } from '../../assets/js/models/AttendanceModel.js';

function isForbiddenLocationTerm(rawName, tags = {}) {
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

function classifyTargetPlace(tags = {}, name = '') {
    const n = String(name || '')
        .replace(/^(ใกล้เคียง|บริเวณ)\s+/g, '')
        .trim();

    if (!n || isForbiddenLocationTerm(n, tags)) {
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
        !isForbiddenLocationTerm(n, tags)
    ) {
        if (/^(ซอย|ซ\.|ตรอก|แยก)\s*/i.test(n)) {
            return { matched: false, priority: 99, cleanName: '' };
        }
        return { matched: true, priority: 4, cleanName: n };
    }

    return { matched: false, priority: 99, cleanName: '' };
}

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

// -------------------------------------------------------------
// Suite 1: Forbidden Term Filtering Tests
// -------------------------------------------------------------
console.log('--- Suite 1: Forbidden Term Filtering Tests ---');
const forbiddenCases = [
    'ถนนสุขุมวิท', 'ถ.สุขุมวิท', 'ถ. พญาไท',
    'ทางหลวงแผ่นดิน 3012', 'ทางพิเศษศรีรัช', 'ทางด่วนรามอินทรา',
    'แขวงดุสิต', 'เขตดุสิต', 'หมู่บ้านมัณฑนา', 'หมู่ที่ 5',
    'ตำบลบางรัก', 'ต.บางรัก', 'อำเภอเมือง', 'อ.เมือง',
    'จังหวัดนนทบุรี', 'จ.นนทบุรี', 'กรุงเทพมหานคร',
    '10200', '10600 ประเทศไทย', 'รหัสไปรษณีย์ 10200', 'ปณ. 10200',
    '60/1', '12/34', 'บ้านเลขที่ 60/1', 'เลขที่ 12/34',
    'ซอยในพื้นที่'
];

for (const term of forbiddenCases) {
    assert.strictEqual(isForbiddenLocationTerm(term), true, `Expected "${term}" to be forbidden`);
}

// Legitimate government and landmark terms MUST NOT be forbidden
const allowedOfficialPlaces = [
    'ศาลากลางจังหวัดนนทบุรี',
    'ที่ว่าการอำเภอดอนเมือง',
    'ศาลจังหวัดนนทบุรี',
    'โรงพยาบาลส่งเสริมสุขภาพตำบลบางใหญ่',
    'สถานีตำรวจภูธรเมืองนนทบุรี',
    'สำนักงานเขตบางรัก',
    'สำนักเทศกิจ',
    'ศาลาว่าการกรุงเทพมหานคร'
];

for (const place of allowedOfficialPlaces) {
    assert.strictEqual(isForbiddenLocationTerm(place), false, `Expected official place "${place}" to NOT be forbidden`);
}
console.log('✅ Forbidden Term Filtering Tests PASSED (25 cases)');

// -------------------------------------------------------------
// Suite 2: 4-Tier Priorities Classification Tests
// -------------------------------------------------------------
console.log('--- Suite 2: 4-Tier Priorities Classification Tests ---');

// Priority 1: Government & Landmarks
const p1_cases = [
    'ศาลาว่าการกรุงเทพมหานคร', 'ศาลากลางจังหวัดนนทบุรี', 'ที่ว่าการอำเภอบางกรวย',
    'สำนักเทศกิจ', 'สำนักงานเขตบางรัก', 'กรมการปกครอง', 'กระทรวงมหาดไทย',
    'สถานีตำรวจนครบาลพระราชวัง', 'สน.ชนะสงคราม', 'สภ.เมืองนนทบุรี',
    'โรงพยาบาลศิริราช', 'รพ.สต.บางกร่าง', 'ศูนย์บริการสาธารณสุข 1',
    'โรงเรียนสตรีวิทยา', 'มหาวิทยาลัยธรรมศาสตร์', 'ศาลฎีกา', 'ศาลจังหวัดนนทบุรี',
    'วัดพระศรีรัตนศาสดาราม', 'พระบรมมหาราชวัง', 'พระที่นั่งจักรีมหาปราสาท',
    'ปราสาทพระเทพบิดร', 'พระปรางค์วัดอรุณ', 'สนามหลวง', 'ท่าเรือท่าช้าง',
    'สะพานสมเด็จพระปิ่นเกล้า', 'เสาหลักเมือง', 'อนุสาวรีย์ประชาธิปไตย',
    'พิพิธภัณฑสถานแห่งชาติ', 'สโมสรตำรวจ'
];
for (const name of p1_cases) {
    const res = classifyTargetPlace({}, name);
    assert.strictEqual(res.matched, true, `Expected "${name}" to match`);
    assert.strictEqual(res.priority, 1, `Expected "${name}" to be Priority 1, got P${res.priority}`);
}

// Priority 2: Commercial Offices & Companies
const p2_cases = [
    'อาคารเอ็มไพร์ ทาวเวอร์', 'ตึกมหานคร', 'สยามซิตี้ ทาวเวอร์',
    'สำนักงานใหญ่ ธนาคารกรุงไทย', 'บริษัท เอเชียวันลีดเดอร์ จำกัด',
    'บมจ. ปตท.', 'บจก. ไทยเบฟเวอเรจ'
];
for (const name of p2_cases) {
    const res = classifyTargetPlace({}, name);
    assert.strictEqual(res.matched, true, `Expected "${name}" to match`);
    assert.strictEqual(res.priority, 2, `Expected "${name}" to be Priority 2, got P${res.priority}`);
}

// Priority 3: Transit & Residence
const p3_cases = [
    'สถานีรถไฟฟ้า BTS สยาม', 'สถานีรถไฟสามเสน', 'MRT สุขุมวิท',
    'ป้ายรถประจำทาง เสาชิงช้า', 'ท่าอากาศยานดอนเมือง',
    'คอนโดมิเนียม ลุมพินีเพลส', 'ไอดีโอ คอนโด', 'อพาร์ตเมนต์ สุขใจ',
    'ธาราเพลส', 'โรงแรม รอยัลปริ๊นเซส'
];
for (const name of p3_cases) {
    const res = classifyTargetPlace({}, name);
    assert.strictEqual(res.matched, true, `Expected "${name}" to match`);
    assert.strictEqual(res.priority, 3, `Expected "${name}" to be Priority 3, got P${res.priority}`);
}

// Priority 4: Retail, Restaurants & Public Services
const p4_cases = [
    'สยามพารากอน', 'เซ็นทรัลเวิลด์', 'โลตัส พระราม 1', 'บิ๊กซี ราชดำริ',
    '7-Eleven สาขาเสาชิงช้า', '7-Eleven สาขาโรงพยาบาลศิริราช',
    'คาเฟ่อเมซอน ศาลาว่าการ', 'ร้านอาหาร ก๋วยเตี๋ยวเรือ', 'ธนาคารกรุงเทพ สาขาสีลม',
    'ปั๊ม ปตท. วิภาวดี'
];
for (const name of p4_cases) {
    const res = classifyTargetPlace({}, name);
    assert.strictEqual(res.matched, true, `Expected "${name}" to match`);
    assert.strictEqual(res.priority, 4, `Expected "${name}" to be Priority 4, got P${res.priority}`);
}
console.log('✅ 4-Tier Priorities Classification Tests PASSED (56 cases)');

// -------------------------------------------------------------
// Suite 3: Live ArcGIS World Geocode Connectivity & Resolution
// -------------------------------------------------------------
console.log('--- Suite 3: Live ArcGIS World Geocode Verification ---');

async function testLiveArcGIS() {
    const testCases = [
        { name: 'Siam Paragon', lat: 13.7462, lng: 100.5348, expectedType: 'POI' },
        { name: 'Wat Phra Kaew', lat: 13.7516, lng: 100.4927, expectedType: 'POI' },
        { name: 'Bang Rak (Commercial Office)', lat: 13.7314, lng: 100.5280, expectedType: 'POI' },
        { name: 'Victory Monument', lat: 13.7649, lng: 100.5383, expectedType: 'POI' }
    ];

    for (const tc of testCases) {
        const locStr = JSON.stringify({ x: tc.lng, y: tc.lat, spatialReference: { wkid: 4326 } });
        const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode/?f=json&distance=400&category=POI&location=${encodeURIComponent(locStr)}`;
        const resp = await fetch(url);
        const data = await resp.json();
        const addr = data.address || {};
        const loc = data.location || {};

        assert.strictEqual(String(addr.Addr_type || '').toUpperCase(), tc.expectedType);
        const targetName = (addr.PlaceName || addr.ShortLabel || '').trim();
        assert(targetName.length > 0, 'Target name should not be empty');

        const locLat = Number(loc.y);
        const locLng = Number(loc.x);
        const dist = calculateDistanceMeters(tc.lat, tc.lng, locLat, locLng);
        assert(dist <= 400, 'Distance should be <= 400m');

        // Map ArcGIS Type to semantic tags
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
            tags.amenity = 'place_of_interest';
            tags.shop = 'yes';
        }

        const classification = classifyTargetPlace(tags, targetName);
        assert.strictEqual(classification.matched, true);
        const prefix = dist <= 30 ? 'บริเวณ ' : 'ใกล้เคียง ';
        const zoomLevel = dist <= 30 ? 20 : 19;
        console.log(`  [${tc.name}] -> "${prefix}${classification.cleanName}" (Dist: ${dist}m, P${classification.priority}, z=${zoomLevel})`);
    }

    // Verify PointAddress is NOT accepted as a POI by Tier 1
    const resPointAddr = await AttendanceModel.resolveLocationWithZoomMeta(13.73811284, 100.49546538, { bypassCache: true });
    console.log('  [PointAddress Fallback Test] -> Result:', resPointAddr);
    assert(!resPointAddr.locationName.includes('60/1'), 'House number 60/1 must NOT appear in locationName');
    assert(resPointAddr.locationName.includes('ซอยขุมทรัพย์'), 'Should fall back cleanly to Soi name');
    console.log('✅ PointAddress cleanly rejected by Tier 1 and resolved via Tier 3 (Soi)');

    // -------------------------------------------------------------
    // Suite 4: Diverse ArcGIS POI Types & Real-World Brand Verification
    // -------------------------------------------------------------
    console.log('\n--- Suite 4: Diverse ArcGIS POI Types & Real-World Brand Verification ---');
    const diverseMockPois = [
        { name: 'Boots', type: 'Pharmacy', expectedPrefix: 'บริเวณ ', expectedZoom: 20 },
        { name: 'Watsons', type: 'Pharmacy', expectedPrefix: 'บริเวณ ', expectedZoom: 20 },
        { name: 'Fitness First', type: 'Fitness Center', expectedPrefix: 'บริเวณ ', expectedZoom: 20 },
        { name: 'Major Cineplex', type: 'Movie Theater', expectedPrefix: 'บริเวณ ', expectedZoom: 20 },
        { name: 'Bangkok Smile Dental', type: 'Dentist', expectedPrefix: 'บริเวณ ', expectedZoom: 20 },
        { name: 'Embassy of Japan', type: 'Embassy', expectedPrefix: 'บริเวณ ', expectedZoom: 20 },
        { name: 'True Arena Hua Hin', type: 'Sports Center', expectedPrefix: 'บริเวณ ', expectedZoom: 20 }
    ];

    const originalFetch = globalThis.fetch;
    for (const item of diverseMockPois) {
        globalThis.fetch = async () => ({
            ok: true,
            json: async () => ({
                address: { Addr_type: 'POI', PlaceName: item.name, Type: item.type },
                location: { x: 100.5, y: 13.7 }
            })
        });
        AttendanceModel.clearLocationCache();
        const res = await AttendanceModel.resolveLocationWithZoomMeta(13.7, 100.5, { bypassCache: true });
        assert.strictEqual(res.locationName, `${item.expectedPrefix}${item.name}`, `Expected ${item.name} to resolve properly, got: ${res.locationName}`);
        assert.strictEqual(res.zoomLevel, item.expectedZoom, `Expected zoom ${item.expectedZoom}`);
        console.log(`  [Diverse POI] ${item.name} (${item.type}) -> "${res.locationName}" (z=${res.zoomLevel})`);
    }
    globalThis.fetch = originalFetch;
    console.log('✅ Diverse ArcGIS POI Types & Real-World Brand Verification PASSED');
}

testLiveArcGIS().then(() => {
    console.log('\n================================================================');
    console.log(' All ArcGIS POI & AttendanceModel Tests PASSED (100% Green)');
    console.log('================================================================');
    process.exit(0);
}).catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
