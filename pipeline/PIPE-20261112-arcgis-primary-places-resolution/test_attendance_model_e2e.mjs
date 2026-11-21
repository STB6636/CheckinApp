// Setup browser mocks if necessary for node test
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
import assert from 'assert';

async function runEndToEndVerification() {
    console.log('================================================================');
    console.log(' AttendanceModel.resolveLocationWithZoomMeta Deep Verification');
    console.log('================================================================\n');

    AttendanceModel.clearLocationCache();

    // 1. Tier 0 Test: สำนักเทศกิจ (Official Location)
    console.log('[Test 1] Tier 0: Official Location (สำนักเทศกิจ)');
    const t0 = await AttendanceModel.resolveLocationWithZoomMeta(13.756331, 100.501765);
    console.log('  Result:', t0);
    assert.strictEqual(t0.locationName, 'บริเวณ สำนักเทศกิจ');
    assert.strictEqual(t0.zoomLevel, 20);
    console.log('  -> PASS');

    // 2. Tier 1 Test: Live ArcGIS Resolution for off-site location (e.g. Victory Monument)
    console.log('\n[Test 2] Tier 1: ArcGIS Resolution (Victory Monument)');
    AttendanceModel.clearLocationCache();
    const t1 = await AttendanceModel.resolveLocationWithZoomMeta(13.7649, 100.5383, { bypassCache: true });
    console.log('  Result:', t1);
    assert(t1.locationName.includes('อนุสาวรีย์ชัยสมรภูมิ'), 'Expected Victory Monument');
    assert(t1.zoomLevel === 19 || t1.zoomLevel === 20, 'Expected zoom 19 or 20');
    console.log('  -> PASS');

    // 3. Fallback Test: Residential point without POI cleanly falls back to Tier 3 (Soi)
    console.log('\n[Test 3] Fallback to Tier 3 (Soi resolution without house number)');
    AttendanceModel.clearLocationCache();
    const t2 = await AttendanceModel.resolveLocationWithZoomMeta(13.73811284, 100.49546538, { bypassCache: true });
    console.log('  Result:', t2);
    assert(t2.locationName.includes('ซอยขุมทรัพย์'), 'Expected Khumsap');
    assert(!t2.locationName.includes('60/1'), 'House number 60/1 must NOT appear');
    console.log('  -> PASS');

    // 4. Cache test: Second call should retrieve from cache
    console.log('\n[Test 4] Cache Verification: Second call within cache');
    const t2_cached = await AttendanceModel.resolveLocationWithZoomMeta(13.73811284, 100.49546538);
    assert.deepStrictEqual(t2_cached, t2, 'Cached result must match');
    console.log('  -> PASS');

    // 5. Invalid / Boundary coordinates test
    console.log('\n[Test 5] Boundary / Invalid coordinate handling');
    const inv1 = await AttendanceModel.resolveLocationWithZoomMeta(NaN, 100);
    assert.strictEqual(inv1.locationName, 'ไม่ระบุสถานที่');
    const inv2 = await AttendanceModel.resolveLocationWithZoomMeta(999, 100);
    assert.strictEqual(inv2.locationName, 'ไม่ระบุสถานที่');
    console.log('  -> PASS');

    // 6. Test 6: Fallback when ArcGIS returns null (e.g. simulated by coordinates far out at sea)
    console.log('\n[Test 6] Fallback behavior when ArcGIS has no POI (Sea coordinates)');
    AttendanceModel.clearLocationCache();
    const seaResult = await AttendanceModel.resolveLocationWithZoomMeta(11.5, 100.8, { bypassCache: true });
    console.log('  Sea fallback result:', seaResult);
    assert(seaResult.locationName, 'Expected a non-empty location name');
    assert(seaResult.locationName.startsWith('บริเวณ'), 'Expected "บริเวณ" prefix');
    console.log('  -> PASS: Successfully fell back to Semantic Address Fallback');

    console.log('\n================================================================');
    console.log(' All End-to-End Deep Verification Tests PASSED (100% Green)');
    console.log('================================================================\n');
}

runEndToEndVerification()
    .then(() => {
        console.log('E2E Verification script completed successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Verification failed:', err);
        process.exit(1);
    });
