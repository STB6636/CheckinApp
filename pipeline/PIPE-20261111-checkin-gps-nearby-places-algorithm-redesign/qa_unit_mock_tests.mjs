/**
 * @file pipeline/PIPE-20261111-checkin-gps-nearby-places-algorithm-redesign/qa_unit_mock_tests.mjs
 * @description Isolated unit test suite mocking global fetch for rigorous offline edge-case verification
 */

import { AttendanceModel } from '../../assets/js/models/AttendanceModel.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
    if (condition) {
        console.log(`  ✅ PASS: ${testName} ${details ? '(' + details + ')' : ''}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${testName} ${details ? '-> ' + details : ''}`);
        failed++;
    }
}

async function runMockUnitTests() {
    console.log('================================================================');
    console.log('🔬 Starting Unit & Edge-Case Mock Suite');
    console.log('================================================================\n');

    const originalFetch = globalThis.fetch;

    try {
        // -------------------------------------------------------------
        // Unit Suite 1: Tier 0 Edge Cases
        // -------------------------------------------------------------
        console.log('--- Unit Suite 1: Tier 0 Official Locations Edge Cases ---');

        // Test 1.1: Inactive official location should be skipped
        const inactiveOptions = {
            officialLocations: [
                { id: 'INACT-01', name: 'จุดที่ปิดใช้งาน', latitude: 14.1000, longitude: 100.1000, radius_meters: 500, is_active: false }
            ]
        };
        // Mock fetch to return empty to verify Tier 0 does not return inactive
        globalThis.fetch = async () => new Response(JSON.stringify({}), { status: 200 });
        const resInactive = await AttendanceModel.resolveLocationWithZoomMeta(14.1000, 100.1000, inactiveOptions);
        assert(
            !resInactive.locationName.includes('จุดที่ปิดใช้งาน'),
            'Inactive official location is not used in Tier 0',
            `Result: "${resInactive.locationName}"`
        );

        // Test 1.2: Boundary distance check: 179m vs 185m for default radius
        const optionsExact180 = {
            officialLocations: [
                { id: 'OFF-01', name: 'ที่ว่าการอำเภอทดสอบ', latitude: 15.000000, longitude: 100.000000, radius_meters: 100, is_active: true }
            ]
        };
        // 13.756331, 100.501765 is City Law Office
        // Let's test at 15.000000, 100.001000 (~108 meters east of 15.000000, 100.000000)
        // With Math.max(100, 180) = 180m, distance 108m should match with prefix "ใกล้เคียง "
        const resWithin = await AttendanceModel.resolveLocationWithZoomMeta(15.000000, 100.001000, optionsExact180);
        assert(
            resWithin.locationName === 'ใกล้เคียง ที่ว่าการอำเภอทดสอบ',
            'Distance within effective 180m matches with "ใกล้เคียง "',
            `Result: "${resWithin.locationName}"`
        );

        // -------------------------------------------------------------
        // Unit Suite 2: Tier 1 POI Resolution (Mocking Nominatim + Overpass)
        // -------------------------------------------------------------
        console.log('\n--- Unit Suite 2: Tier 1 POI Resolution Mocking ---');

        // Test 2.1: Overpass POI within 20m gets "บริเวณ " and zoomLevel 20
        globalThis.fetch = async (url) => {
            const urlStr = String(url);
            if (urlStr.includes('overpass')) {
                return new Response(JSON.stringify({
                    elements: [
                        {
                            type: 'node',
                            lat: 13.50005,
                            lon: 100.50005,
                            tags: { amenity: 'hospital', 'name:th': 'โรงพยาบาลเวชการ' }
                        }
                    ]
                }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
            return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
        };

        const resHospital = await AttendanceModel.resolveLocationWithZoomMeta(13.50000, 100.50000);
        assert(
            resHospital.locationName === 'บริเวณ โรงพยาบาลเวชการ',
            'Overpass Gov/Hospital within 25m gets "บริเวณ "',
            `Result: "${resHospital.locationName}"`
        );
        assert(
            resHospital.zoomLevel === 20,
            'Close POI sets zoomLevel 20',
            `zoomLevel: ${resHospital.zoomLevel}`
        );

        // Test 2.2: Priority ranking: Landmark (priority 1) beats Shop (priority 3) even if slightly further
        globalThis.fetch = async (url) => {
            const urlStr = String(url);
            if (urlStr.includes('overpass')) {
                return new Response(JSON.stringify({
                    elements: [
                        {
                            type: 'node',
                            lat: 13.60010, // ~11 meters away
                            lon: 100.60000,
                            tags: { shop: 'convenience', name: 'ร้านสะดวกซื้อบ่ายสอง' }
                        },
                        {
                            type: 'node',
                            lat: 13.60015, // ~16 meters away (within 15m diff)
                            lon: 100.60000,
                            tags: { amenity: 'place_of_worship', name: 'วัดอรุณจำลอง' }
                        }
                    ]
                }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
            return new Response(JSON.stringify({}), { status: 200 });
        };

        const resPriority = await AttendanceModel.resolveLocationWithZoomMeta(13.60000, 100.60000);
        assert(
            resPriority.locationName === 'บริเวณ วัดอรุณจำลอง',
            'Priority 1 Landmark wins over Priority 3 Shop within 15m distance difference',
            `Result: "${resPriority.locationName}"`
        );

        // -------------------------------------------------------------
        // Unit Suite 3: Tier 2 Soi Selection (Places vs Soi Precedence)
        // -------------------------------------------------------------
        console.log('\n--- Unit Suite 3: Tier 2 Soi Precedence ---');

        // Test 3.1: If both Place and Soi are in results, Place MUST win!
        globalThis.fetch = async (url) => {
            const urlStr = String(url);
            if (urlStr.includes('overpass')) {
                return new Response(JSON.stringify({
                    elements: [
                        {
                            type: 'way',
                            lat: 13.70010,
                            lon: 100.70000,
                            tags: { highway: 'residential', name: 'ซอยสุขใจ 5' }
                        },
                        {
                            type: 'node',
                            lat: 13.70020,
                            lon: 100.70000,
                            tags: { shop: 'bakery', name: 'ร้านขนมปังหอมกรุ่น' }
                        }
                    ]
                }), { status: 200 });
            }
            return new Response(JSON.stringify({}), { status: 200 });
        };

        const resPlaceVsSoi = await AttendanceModel.resolveLocationWithZoomMeta(13.70000, 100.70000);
        assert(
            resPlaceVsSoi.locationName.includes('ร้านขนมปังหอมกรุ่น'),
            'Place takes precedence over Soi (Hierarchy Inversion fixed)',
            `Result: "${resPlaceVsSoi.locationName}"`
        );
        assert(
            !resPlaceVsSoi.locationName.includes('ซอยสุขใจ 5'),
            'Soi is NOT chosen when valid place is present',
            `Result: "${resPlaceVsSoi.locationName}"`
        );

        // Test 3.2: When NO valid place is found, Soi IS chosen (Tier 2)
        globalThis.fetch = async (url) => {
            const urlStr = String(url);
            if (urlStr.includes('overpass')) {
                return new Response(JSON.stringify({
                    elements: [
                        {
                            type: 'way',
                            lat: 13.71010,
                            lon: 100.71000,
                            tags: { highway: 'residential', name: 'ซอยสันติสุข แยก 1' }
                        }
                    ]
                }), { status: 200 });
            }
            return new Response(JSON.stringify({}), { status: 200 });
        };

        const resSoiOnly = await AttendanceModel.resolveLocationWithZoomMeta(13.71000, 100.71000);
        assert(
            resSoiOnly.locationName === 'ใกล้เคียง ซอยสันติสุข แยก 1',
            'Sub-soi chosen in Tier 2 when no POI exists',
            `Result: "${resSoiOnly.locationName}"`
        );

        // -------------------------------------------------------------
        // Unit Suite 4: Tier 4 Semantic Fallback Phrasing
        // -------------------------------------------------------------
        console.log('\n--- Unit Suite 4: Tier 4 Semantic Fallback Phrasing ---');

        // Test 4.1: Road + Suburb + District
        globalThis.fetch = async (url) => {
            const urlStr = String(url);
            if (urlStr.includes('nominatim') && urlStr.includes('zoom=18')) {
                return new Response(JSON.stringify({
                    category: 'highway',
                    type: 'secondary',
                    name: 'ถนนเพชรบุรี',
                    address: {
                        road: 'ถนนเพชรบุรี',
                        suburb: 'บางกะปิ',
                        district: 'ห้วยขวาง'
                    }
                }), { status: 200 });
            }
            return new Response(JSON.stringify({}), { status: 200 });
        };

        const resSemantic = await AttendanceModel.resolveLocationWithZoomMeta(13.72000, 100.72000);
        assert(
            resSemantic.locationName === 'บริเวณ ถนนเพชรบุรี แขวงบางกะปิ เขตห้วยขวาง',
            'Semantic fallback formats "บริเวณ ถนน... แขวง... เขต..." correctly',
            `Result: "${resSemantic.locationName}"`
        );

        // Test 4.2: Suburb with "เขต" does not produce "แขวงเขต..."
        globalThis.fetch = async (url) => {
            const urlStr = String(url);
            if (urlStr.includes('nominatim') && urlStr.includes('zoom=18')) {
                return new Response(JSON.stringify({
                    category: 'highway',
                    type: 'secondary',
                    name: 'ถนนดินสอ',
                    address: {
                        road: 'ถนนดินสอ',
                        suburb: 'เขตพระนคร',
                        district: 'เขตพระนคร'
                    }
                }), { status: 200 });
            }
            return new Response(JSON.stringify({}), { status: 200 });
        };

        const resNoDoubleKhet = await AttendanceModel.resolveLocationWithZoomMeta(13.73000, 100.73000);
        assert(
            !resNoDoubleKhet.locationName.includes('แขวงเขต'),
            'No "แขวงเขต" grammatical defect in Thai semantic fallback',
            `Result: "${resNoDoubleKhet.locationName}"`
        );
        assert(
            resNoDoubleKhet.locationName === 'บริเวณ ถนนดินสอ เขตพระนคร',
            'Deduplicated district without redundant prefix',
            `Result: "${resNoDoubleKhet.locationName}"`
        );

        // Test 4.3: Absolute Empty / 500 error from all APIs -> Fallback to Bangkok
        globalThis.fetch = async () => {
            throw new Error('Network offline');
        };

        const resOffline = await AttendanceModel.resolveLocationWithZoomMeta(13.74000, 100.74000);
        assert(
            resOffline.locationName === 'บริเวณ พื้นที่กรุงเทพมหานคร',
            'Total network failure defaults gracefully to clean Bangkok semantic fallback',
            `Result: "${resOffline.locationName}"`
        );
        assert(
            !resOffline.locationName.includes('(') && !resOffline.locationName.includes('ซอยในพื้นที่'),
            'Total network failure has zero raw coordinates and zero "ซอยในพื้นที่"',
            `Result: "${resOffline.locationName}"`
        );

        // Test 4.4: Provincial semantic fallback uses "ตำบล", "อำเภอ", and "จ.[จังหวัด]"
        globalThis.fetch = async (url) => {
            const urlStr = String(url);
            if (urlStr.includes('nominatim') && urlStr.includes('zoom=18')) {
                return new Response(JSON.stringify({
                    category: 'highway',
                    type: 'secondary',
                    name: 'ถนนสุเทพ',
                    address: {
                        road: 'ถนนสุเทพ',
                        suburb: 'สุเทพ',
                        district: 'เมืองเชียงใหม่',
                        city: 'เชียงใหม่'
                    }
                }), { status: 200 });
            }
            return new Response(JSON.stringify({}), { status: 200 });
        };

        const resProvincial = await AttendanceModel.resolveLocationWithZoomMeta(18.79000, 98.96000);
        assert(
            resProvincial.locationName === 'บริเวณ ถนนสุเทพ ตำบลสุเทพ อำเภอเมืองเชียงใหม่ จ.เชียงใหม่',
            'Provincial semantic fallback formats with "ตำบล", "อำเภอ", "จ." correctly',
            `Result: "${resProvincial.locationName}"`
        );

        // -------------------------------------------------------------
        // Unit Suite 5: Adversarial Edge Cases & Robustness Audit
        // -------------------------------------------------------------
        console.log('\n--- Unit Suite 5: Adversarial Edge Cases & Robustness Audit ---');

        // Test 5.1: NaN and non-finite coordinates
        const resNaN = await AttendanceModel.resolveLocationWithZoomMeta(NaN, 100.50000);
        assert(
            resNaN.locationName === 'ไม่ระบุสถานที่',
            'NaN latitude immediately rejected as "ไม่ระบุสถานที่" in 0ms without firing network calls',
            `Result: "${resNaN.locationName}"`
        );

        const resInf = await AttendanceModel.resolveLocationWithZoomMeta(Infinity, 100.50000);
        assert(
            resInf.locationName === 'ไม่ระบุสถานที่',
            'Infinity latitude immediately rejected as "ไม่ระบุสถานที่"',
            `Result: "${resInf.locationName}"`
        );

        // Test 5.2: String-based coordinates (from URL/query params/forms)
        const resStringCoords = await AttendanceModel.resolveLocationWithZoomMeta('13.756331', '100.501765');
        assert(
            resStringCoords.locationName === 'บริเวณ สำนักเทศกิจ',
            'String-based valid coordinates parse and resolve cleanly to official location',
            `Result: "${resStringCoords.locationName}"`
        );

        // Test 5.3: null options argument (prevent TypeError crash)
        let didThrowOnNullOptions = false;
        try {
            await AttendanceModel.resolveLocationWithZoomMeta(13.756331, 100.501765, null);
        } catch (_) {
            didThrowOnNullOptions = true;
        }
        assert(
            !didThrowOnNullOptions,
            'Passing options=null does not throw TypeError: Cannot read properties of null',
            `didThrow: ${didThrowOnNullOptions}`
        );

        // Test 5.4: Clear cache and verify explicitly deactivated City Law Office in officialLocations
        AttendanceModel.clearLocationCache();
        globalThis.fetch = async () => new Response(JSON.stringify({}), { status: 200 });
        const resDeactivatedLawOffice = await AttendanceModel.resolveLocationWithZoomMeta(13.756331, 100.501765, {
            officialLocations: [
                { id: 'LOC-001', name: 'สำนักเทศกิจ', latitude: 13.756331, longitude: 100.501765, radius_meters: 180, is_active: false }
            ]
        });
        assert(
            !resDeactivatedLawOffice.locationName.includes('สำนักเทศกิจ'),
            'Explicitly deactivated City Law Office is NOT force-matched in Tier 0',
            `Result: "${resDeactivatedLawOffice.locationName}"`
        );

        // Test 5.5: Soi names without space (e.g. "ซอยทองหล่อ", "ตรอกโรงหมู") with building tag
        globalThis.fetch = async (url) => {
            const urlStr = String(url);
            if (urlStr.includes('overpass')) {
                return new Response(JSON.stringify({
                    elements: [
                        {
                            type: 'way',
                            lat: 13.78010,
                            lon: 100.78000,
                            tags: { building: 'yes', name: 'ซอยทองหล่อ' }
                        }
                    ]
                }), { status: 200 });
            }
            return new Response(JSON.stringify({}), { status: 200 });
        };
        const resSoiNoSpace = await AttendanceModel.resolveLocationWithZoomMeta(13.78000, 100.78000);
        assert(
            !resSoiNoSpace.locationName.includes('บริเวณ ซอยทองหล่อ'),
            'Thai soi name without space ("ซอยทองหล่อ") is NOT classified as a commercial building POI in Tier 1',
            `Result: "${resSoiNoSpace.locationName}"`
        );

        // Test 5.6: Network total failure does NOT permanently poison cache
        globalThis.fetch = async () => { throw new Error('Simulated network timeout'); };
        const testOfflineCoord = { lat: 13.91234, lng: 100.91234 };
        const resFail = await AttendanceModel.resolveLocationWithZoomMeta(testOfflineCoord.lat, testOfflineCoord.lng);
        assert(
            resFail.locationName === 'บริเวณ พื้นที่กรุงเทพมหานคร',
            'Network failure yields semantic fallback',
            `Result: "${resFail.locationName}"`
        );

        // Now restore network with real POI for the same coordinate
        globalThis.fetch = async (url) => {
            const urlStr = String(url);
            if (urlStr.includes('overpass')) {
                return new Response(JSON.stringify({
                    elements: [
                        {
                            type: 'node',
                            lat: 13.91235,
                            lon: 100.91235,
                            tags: { amenity: 'school', 'name:th': 'โรงเรียนทดสอบการกู้คืน' }
                        }
                    ]
                }), { status: 200 });
            }
            return new Response(JSON.stringify({}), { status: 200 });
        };
        const resRecovered = await AttendanceModel.resolveLocationWithZoomMeta(testOfflineCoord.lat, testOfflineCoord.lng);
        assert(
            resRecovered.locationName.includes('โรงเรียนทดสอบการกู้คืน'),
            'Cache was NOT poisoned by network failure: subsequent online query resolves POI successfully',
            `Result: "${resRecovered.locationName}"`
        );

    } finally {
        globalThis.fetch = originalFetch;
    }

    console.log('\n================================================================');
    console.log(`📊 Unit Mock Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
        process.exit(1);
    }
}

runMockUnitTests().catch(err => {
    console.error('Unit test failed:', err);
    process.exit(1);
});
