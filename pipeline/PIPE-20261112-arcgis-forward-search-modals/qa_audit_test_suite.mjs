import assert from 'node:assert';
import { AttendanceModel } from '../../assets/js/models/AttendanceModel.js';

console.log('================================================================');
console.log('🧪 Starting QA & Verification Audit Test Suite for PIPE-20261112');
console.log('================================================================');

let passedTests = 0;
let totalTests = 0;

function it(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Reason: ${err.message}`);
        throw err;
    }
}

async function itAsync(name, fn) {
    totalTests++;
    try {
        await fn();
        console.log(`  ✅ PASS: ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Reason: ${err.message}`);
        throw err;
    }
}

// -------------------------------------------------------------
// Suite 1: Query Normalization & Thai Acronym Expansion Tests
// -------------------------------------------------------------
console.log('\n--- Suite 1: normalizeSearchQuery Tests ---');

it('Handles empty, null, undefined, and non-string inputs safely', () => {
    assert.strictEqual(AttendanceModel.normalizeSearchQuery(''), '');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery(null), '');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery(undefined), '');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery(123), '');
});

it('Expands BTS and MRT prefixes', () => {
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('bts หมอชิต'), 'สถานีรถไฟฟ้า หมอชิต');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('BTS อโศก'), 'สถานีรถไฟฟ้า อโศก');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('mrt พระราม 9'), 'สถานีรถไฟฟ้า พระราม 9');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('MRT สุขุมวิท'), 'สถานีรถไฟฟ้า สุขุมวิท');
});

it('Expands Police, Hospital, and School acronyms', () => {
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('สน.ทองหล่อ'), 'สถานีตำรวจนครบาล ทองหล่อ');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('สน. ดินแดง'), 'สถานีตำรวจนครบาล ดินแดง');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('รพ.ศิริราช'), 'โรงพยาบาล ศิริราช');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('รพ. ราชวิถี'), 'โรงพยาบาล ราชวิถี');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('รร.เตรียมอุดม'), 'โรงเรียน เตรียมอุดม');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('รร. สวนกุหลาบ'), 'โรงเรียน สวนกุหลาบ');
});

it('Expands University acronyms without duplicating suffixes', () => {
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('ม.เกษตร'), 'มหาวิทยาลัยเกษตรศาสตร์');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('ม.เกษตรศาสตร์'), 'มหาวิทยาลัยเกษตรศาสตร์');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('ม.ธรรมศาสตร์'), 'มหาวิทยาลัยธรรมศาสตร์');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('ม.ราม'), 'มหาวิทยาลัยรามคำแหง');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('ม.รามคำแหง'), 'มหาวิทยาลัยรามคำแหง');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('ม.รามคำแหง หัวหมาก'), 'มหาวิทยาลัยรามคำแหง หัวหมาก');
});

it('Expands Chulalongkorn without duplicating and protects "จุฬาภรณ์"', () => {
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('จุฬา'), 'จุฬาลงกรณ์มหาวิทยาลัย');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('ม.จุฬา'), 'จุฬาลงกรณ์มหาวิทยาลัย');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('จุฬาลงกรณ์'), 'จุฬาลงกรณ์มหาวิทยาลัย');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('จุฬาลงกรณ์มหาวิทยาลัย'), 'จุฬาลงกรณ์มหาวิทยาลัย');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('จุฬาฯ'), 'จุฬาลงกรณ์มหาวิทยาลัย');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('รพ.จุฬา'), 'โรงพยาบาลจุฬาลงกรณ์');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('รพ. จุฬา'), 'โรงพยาบาลจุฬาลงกรณ์');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('โรงพยาบาลจุฬา'), 'โรงพยาบาลจุฬาลงกรณ์');
    
    // Critical protection check:
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('จุฬาภรณ์'), 'จุฬาภรณ์');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('โรงพยาบาลจุฬาภรณ์'), 'โรงพยาบาลจุฬาภรณ์');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('รพ.จุฬาภรณ์'), 'โรงพยาบาล จุฬาภรณ์');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('สถาบันวิจัยจุฬาภรณ์'), 'สถาบันวิจัยจุฬาภรณ์');
});

it('Expands BMA and กทม. with or without periods', () => {
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('bma'), 'ศาลาว่าการกรุงเทพมหานคร');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('bma 2'), 'ศาลาว่าการกรุงเทพมหานคร 2');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('กทม'), 'ศาลาว่าการกรุงเทพมหานคร');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('กทม.'), 'ศาลาว่าการกรุงเทพมหานคร');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('กทม 2'), 'ศาลาว่าการกรุงเทพมหานคร 2');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('กทม2'), 'ศาลาว่าการกรุงเทพมหานคร 2');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('กทม. 2 ดินแดง'), 'ศาลาว่าการกรุงเทพมหานคร 2 ดินแดง');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('กทม.2'), 'ศาลาว่าการกรุงเทพมหานคร 2');
});

it('Expands regional Thai university acronyms like มธ and มช', () => {
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('มธ'), 'มหาวิทยาลัยธรรมศาสตร์');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('มธ. รังสิต'), 'มหาวิทยาลัยธรรมศาสตร์ รังสิต');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('มช'), 'มหาวิทยาลัยเชียงใหม่');
    assert.strictEqual(AttendanceModel.normalizeSearchQuery('มช. สวนดอก'), 'มหาวิทยาลัยเชียงใหม่ สวนดอก');
});

// -------------------------------------------------------------
// Suite 2: Direct Coordinate Detection & Swap Resilience
// -------------------------------------------------------------
console.log('\n--- Suite 2: Direct Coordinate Detection in searchPlaces ---');

await itAsync('Detects comma-separated standard latitude, longitude', async () => {
    const res = await AttendanceModel.searchPlaces('13.75414, 100.50152', { refLat: 13.75414, refLng: 100.50152 });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].isCoordinate, true);
    assert.strictEqual(res[0].source, 'coordinates');
    assert.strictEqual(res[0].category, 'พิกัด GPS');
    assert.strictEqual(res[0].lat, 13.75414);
    assert.strictEqual(res[0].lng, 100.50152);
    assert.strictEqual(res[0].distanceMeters, 0);
    assert.strictEqual(res[0].distStr, '• 0 ม.');
});

await itAsync('Detects inverted coordinates (lng, lat) and swaps them safely', async () => {
    // 100.50152 is > 90, so it must be longitude. 13.75414 is latitude.
    const res = await AttendanceModel.searchPlaces('100.50152, 13.75414', { refLat: 13.75414, refLng: 100.50152 });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].lat, 13.75414);
    assert.strictEqual(res[0].lng, 100.50152);
});

await itAsync('Calculates kilometer distance for coordinates far from reference', async () => {
    // Chiang Mai coordinates from Bangkok ref
    const res = await AttendanceModel.searchPlaces('18.7883, 98.9853', { refLat: 13.75414, refLng: 100.50152 });
    assert.strictEqual(res.length, 1);
    assert.ok(res[0].distanceMeters > 500000);
    assert.ok(res[0].distStr.includes('กม.'));
});

// -------------------------------------------------------------
// Suite 3: Live ArcGIS Forward Geocoding & Province/Proximity Bias
// -------------------------------------------------------------
console.log('\n--- Suite 3: Live Forward Geocoding & Priority Sorting ---');

await itAsync('Resolves official government landmarks with high accuracy via ArcGIS', async () => {
    const res = await AttendanceModel.searchPlaces('ศาลาว่าการกรุงเทพมหานคร', {
        refLat: 13.75414,
        refLng: 100.50152,
        userProvince: 'กรุงเทพมหานคร',
        limit: 5
    });
    assert.ok(res.length > 0);
    const top = res[0];
    assert.strictEqual(top.source, 'arcgis');
    assert.ok(top.score >= 70);
    assert.ok(top.mainName.includes('ศาลาว่าการกรุงเทพมหานคร'));
    assert.strictEqual(top.category, 'สถานที่ราชการ กทม.');
    assert.ok(top.extent !== null);
    assert.ok(top.extent.ymin <= top.extent.ymax, 'Extent ymin must be <= ymax');
    assert.ok(top.extent.xmin <= top.extent.xmax, 'Extent xmin must be <= xmax');
});

await itAsync('Correctly identifies BMA District Offices as สถานที่ราชการ กทม.', async () => {
    const res = await AttendanceModel.searchPlaces('สำนักงานเขตพระนคร', {
        refLat: 13.75414,
        refLng: 100.50152,
        limit: 5
    });
    assert.ok(res.length > 0);
    assert.strictEqual(res[0].category, 'สถานที่ราชการ กทม.');
});

await itAsync('Deduplicates nearby identical landmark candidates into clean results', async () => {
    const res = await AttendanceModel.searchPlaces('ศาลาว่าการกรุงเทพมหานคร 2', {
        limit: 5
    });
    assert.ok(res.length > 0);
    // There should be no two items with identical mainName and distance < 250m
    const names = res.map(r => r.mainName.toLowerCase());
    const uniqueNames = new Set(names);
    assert.strictEqual(names.length, uniqueNames.size, 'Results should be deduplicated by name and campus distance');
});

await itAsync('Strictly honors limit option parameter', async () => {
    const res = await AttendanceModel.searchPlaces('สยาม', { limit: 3 });
    assert.ok(res.length <= 3, `Expected at most 3 results, got ${res.length}`);
});

await itAsync('Applies Province Bias correctly when searching non-Bangkok locations', async () => {
    const resChiangMai = await AttendanceModel.searchPlaces('โรงพยาบาลกรุงเทพ', {
        refLat: 18.788,
        refLng: 98.985,
        userProvince: 'จ.เชียงใหม่',
        limit: 5
    });
    assert.ok(resChiangMai.length > 0);
    // Top result should be Chiang Mai branch
    const topText = `${resChiangMai[0].mainName} ${resChiangMai[0].subAddr}`;
    assert.ok(topText.includes('เชียงใหม่'), `Expected Chiang Mai in top result, got: ${topText}`);
});

await itAsync('Handles nationwide offsite searches smoothly without clipping', async () => {
    // User is in Bangkok, but searching for Pattaya City Hall in Chonburi
    const resPattaya = await AttendanceModel.searchPlaces('ศาลาว่าการเมืองพัทยา', {
        refLat: 13.75414,
        refLng: 100.50152,
        userProvince: 'กรุงเทพมหานคร',
        limit: 5
    });
    assert.ok(resPattaya.length > 0);
    assert.ok(resPattaya[0].mainName.includes('พัทยา'));
    assert.ok(resPattaya[0].distanceMeters > 90000, 'Distance should be ~100km from Bangkok');
});

// -------------------------------------------------------------
// Suite 4: Fallback & Error Resilience Mocking
// -------------------------------------------------------------
console.log('\n--- Suite 4: Multi-Engine Fallback Resilience ---');

await itAsync('Gracefully handles empty query or whitespace', async () => {
    const res1 = await AttendanceModel.searchPlaces('');
    assert.deepStrictEqual(res1, []);
    const res2 = await AttendanceModel.searchPlaces('    ');
    assert.deepStrictEqual(res2, []);
});

await itAsync('Does not crash on invalid/extreme lat/lng options', async () => {
    const res = await AttendanceModel.searchPlaces('สยามพารากอน', {
        refLat: NaN,
        refLng: Infinity,
        limit: -5
    });
    assert.ok(Array.isArray(res));
});

await itAsync('Detects space-separated coordinates without comma', async () => {
    const res = await AttendanceModel.searchPlaces('13.75414 100.50152', { refLat: 13.75414, refLng: 100.50152 });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].lat, 13.75414);
    assert.strictEqual(res[0].lng, 100.50152);
    assert.strictEqual(res[0].source, 'coordinates');
});

await itAsync('Rejects out-of-range coordinates (> 90 lat and > 180 lng) from direct coordinate match', async () => {
    // 95 and 190 are impossible coordinates
    const res = await AttendanceModel.searchPlaces('95.0, 190.0');
    // Shouldn't be treated as coordinate
    assert.ok(res.length === 0 || !res[0].isCoordinate);
});

// -------------------------------------------------------------
// Suite 5: Fallback Cascade Simulation
// -------------------------------------------------------------
console.log('\n--- Suite 5: Fallback Cascade Simulation ---');

await itAsync('Cascades to Photon when ArcGIS returns empty or fails', async () => {
    // We mock global fetch to fail for ArcGIS URL, succeed for Photon
    const originalFetch = globalThis.fetch;
    try {
        globalThis.fetch = async (url, options) => {
            const urlStr = String(url);
            if (urlStr.includes('geocode.arcgis.com')) {
                // Return empty candidates to trigger fallback
                return {
                    ok: true,
                    json: async () => ({ candidates: [] })
                };
            }
            if (urlStr.includes('photon.komoot.io')) {
                return {
                    ok: true,
                    json: async () => ({
                        features: [
                            {
                                geometry: { coordinates: [100.5348, 13.7465] },
                                properties: {
                                    name: 'Siam Paragon Photon Fallback',
                                    street: 'Rama I Road',
                                    city: 'Bangkok',
                                    country: 'Thailand',
                                    osm_key: 'shop',
                                    osm_value: 'mall',
                                    extent: [100.53, 13.74, 100.54, 13.75]
                                }
                            }
                        ]
                    })
                };
            }
            return originalFetch(url, options);
        };

        const res = await AttendanceModel.searchPlaces('สยามพารากอน');
        assert.ok(res.length > 0);
        assert.strictEqual(res[0].source, 'photon');
        assert.strictEqual(res[0].mainName, 'Siam Paragon Photon Fallback');
        assert.strictEqual(res[0].category, 'ห้างสรรพสินค้า / ตลาด');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

await itAsync('Cascades to Nominatim when both ArcGIS and Photon fail', async () => {
    const originalFetch = globalThis.fetch;
    try {
        globalThis.fetch = async (url, options) => {
            const urlStr = String(url);
            if (urlStr.includes('geocode.arcgis.com')) {
                throw new Error('ArcGIS 500 error simulated');
            }
            if (urlStr.includes('photon.komoot.io')) {
                throw new Error('Photon timeout simulated');
            }
            if (urlStr.includes('nominatim.openstreetmap.org')) {
                return {
                    ok: true,
                    json: async () => ([
                        {
                            lat: '13.7500',
                            lon: '100.5000',
                            name: 'Nominatim Fallback POI',
                            display_name: 'Nominatim Fallback POI, Bangkok, Thailand',
                            class: 'amenity',
                            type: 'police',
                            boundingbox: ['13.749', '13.751', '100.499', '100.501']
                        }
                    ])
                };
            }
            return originalFetch(url, options);
        };

        const res = await AttendanceModel.searchPlaces('สน. ทดสอบ fallback');
        assert.ok(res.length > 0);
        assert.strictEqual(res[0].source, 'nominatim');
        assert.strictEqual(res[0].mainName, 'Nominatim Fallback POI');
        assert.strictEqual(res[0].category, 'สถานที่ราชการ');
        assert.ok(res[0].extent.ymin <= res[0].extent.ymax);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

await itAsync('Handles total network outage across all 3 tiers gracefully without throwing', async () => {
    const originalFetch = globalThis.fetch;
    try {
        globalThis.fetch = async () => {
            throw new Error('Total network offline');
        };

        const res = await AttendanceModel.searchPlaces('สถานที่ทดสอบไฟดับ');
        assert.deepStrictEqual(res, []);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

console.log('\n================================================================');
console.log(`📊 QA Audit Test Summary: ${passedTests}/${totalTests} PASSED (100% Green)`);
console.log('================================================================\n');
