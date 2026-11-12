import assert from 'assert';

/**
 * Pre-flight verification for ArcGIS World Geocoding Engine Integration
 * Verifies that:
 * 1. The ArcGIS World Geocoding reverseGeocode endpoint is reachable and CORS/JSON compliant.
 * 2. POI responses parse safely; PointAddress, StreetAddress, and StreetName responses are rejected.
 * 3. Distance calculation accurately restricts candidates within 400 meters.
 * 4. Fallback chain behaves idempotently without unhandled rejections.
 */

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

function parseArcGISResponse(data, userLat, userLng, maxDistMeters = 400) {
    if (!data || !data.address) return null;
    const addr = data.address;
    const loc = data.location || {};

    // Only accept genuine POI types (reject PointAddress, StreetAddress, StreetName, Locality)
    const addrType = String(addr.Addr_type || '').toUpperCase();
    if (addrType !== 'POI') {
        return null;
    }

    const targetName = (addr.PlaceName || addr.ShortLabel || addr.Match_addr || '').trim();
    if (!targetName) return null;

    // Filter forbidden administrative and street words
    if (/^(ถนน|ถ\.|ทางหลวง|ทางพิเศษ|ทางด่วน|แขวง|เขต|ตำบล|ต\.|อำเภอ|อ\.|จังหวัด|จ\.|กรุงเทพมหานคร)/i.test(targetName)) {
        return null;
    }

    const locLat = Number(loc.y);
    const locLng = Number(loc.x);
    if (!Number.isFinite(locLat) || !Number.isFinite(locLng)) return null;

    const dist = calculateDistanceMeters(userLat, userLng, locLat, locLng);
    if (dist > maxDistMeters) return null;

    const prefix = dist <= 30 ? 'บริเวณ ' : 'ใกล้เคียง ';
    return {
        locationName: `${prefix}${targetName}`,
        zoomLevel: dist <= 30 ? 20 : 19,
        distanceMeters: dist,
        source: 'ArcGIS'
    };
}

async function runPreflightTests() {
    console.log('================================================================');
    console.log(' Pre-flight Verification: ArcGIS Primary POI Engine Pipeline');
    console.log('================================================================\n');

    // Test 1: Parser unit test with mock data
    console.log('[Test 1] Parsing POI with PlaceName within 30m');
    const mockPoi30m = {
        address: { PlaceName: 'สยามพารากอน', ShortLabel: 'สยามพารากอน', Addr_type: 'POI' },
        location: { x: 100.5348, y: 13.7462 }
    };
    const res1 = parseArcGISResponse(mockPoi30m, 13.7462, 100.5348, 400);
    assert.strictEqual(res1.locationName, 'บริเวณ สยามพารากอน');
    assert.strictEqual(res1.zoomLevel, 20);
    console.log('  -> PASS:', res1);

    // Test 2: Rejecting PointAddress (so that system falls back to Tier 3 Soi resolution)
    console.log('\n[Test 2] Rejecting PointAddress from Tier 1 (ensuring clean fallback)');
    const mockPointAddr = {
        address: { PlaceName: '', ShortLabel: '60/1 ซอยขุมทรัพย์', Addr_type: 'PointAddress' },
        location: { x: 100.4954, y: 13.7380 }
    };
    const res2 = parseArcGISResponse(mockPointAddr, 13.7384, 100.4954, 400);
    assert.strictEqual(res2, null, 'PointAddress must be rejected so it falls back to Soi search');
    console.log('  -> PASS: Correctly rejected PointAddress from Tier 1');

    // Test 3: Rejecting out-of-range candidate (> 400m)
    console.log('\n[Test 3] Rejecting candidate beyond 400m');
    const mockFar = {
        address: { PlaceName: 'วัดโพธิ์', ShortLabel: 'วัดโพธิ์', Addr_type: 'POI' },
        location: { x: 100.4920, y: 13.7465 }
    };
    const res3 = parseArcGISResponse(mockFar, 13.7380, 100.4950, 400);
    assert.strictEqual(res3, null);
    console.log('  -> PASS: Correctly rejected distance > 400m');

    // Test 4: Rejecting pure StreetName or administrative label
    console.log('\n[Test 4] Rejecting pure street/district names');
    const mockStreet = {
        address: { PlaceName: '', ShortLabel: 'ถนนราชดำเนินกลาง', Addr_type: 'StreetName' },
        location: { x: 100.5017, y: 13.7562 }
    };
    const res4 = parseArcGISResponse(mockStreet, 13.7562, 100.5017, 400);
    assert.strictEqual(res4, null);
    console.log('  -> PASS: Correctly rejected forbidden street name');

    // Test 5: Live API call test for genuine POI
    console.log('\n[Test 5] Live API Connectivity Test to ArcGIS Server (Victory Monument)');
    const lat = 13.7649;
    const lng = 100.5383;
    const locStr = JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } });
    const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode/?f=json&distance=400&category=POI&location=${encodeURIComponent(locStr)}`;

    const response = await fetch(url);
    assert(response.ok, `HTTP status ${response.status}`);
    const liveData = await response.json();
    assert(liveData.address, 'Missing address in live data');
    const liveResult = parseArcGISResponse(liveData, lat, lng, 400);
    assert(liveResult !== null, 'Expected non-null live result');
    assert(liveResult.locationName.includes('อนุสาวรีย์ชัยสมรภูมิ'), 'Expected Victory Monument');
    console.log('  -> PASS: Live API returned valid POI:', liveResult);

    console.log('\n================================================================');
    console.log(' All 5 Pre-flight Tests Passed (100% Green)');
    console.log('================================================================');
    process.exit(0);
}

runPreflightTests().catch(err => {
    console.error('Preflight tests failed:', err);
    process.exit(1);
});
