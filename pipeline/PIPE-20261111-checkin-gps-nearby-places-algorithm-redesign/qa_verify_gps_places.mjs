/**
 * @file pipeline/PIPE-20261111-checkin-gps-nearby-places-algorithm-redesign/qa_verify_gps_places.mjs
 * @description Comprehensive automated verification test for 5-Tier Nearby Places Resolution Architecture
 */

import dns from 'dns';
dns.setDefaultResultOrder?.('ipv4first');

import { AttendanceModel } from '../../assets/js/models/AttendanceModel.js';
import { Config } from '../../assets/js/core/Config.js';
import fs from 'fs';
import path from 'path';

async function runTests() {
    console.log('================================================================');
    console.log('🧪 Starting 5-Tier Nearby Places Resolution Verification Suite');
    console.log('================================================================\n');

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

    // -------------------------------------------------------------
    // Test 1: Tier 0 Official Locations (City Law Office - 0ms In-Memory)
    // -------------------------------------------------------------
    console.log('--- Test Suite 1: Tier 0 In-Memory Official Locations ---');
    const t0Start = performance.now();
    const cityLawOfficeResult = await AttendanceModel.resolveLocationWithZoomMeta(13.756331, 100.501765);
    const t0Duration = performance.now() - t0Start;

    assert(
        cityLawOfficeResult.locationName === 'บริเวณ สำนักเทศกิจ',
        'Tier 0: Exact City Law Office coordinates',
        `Returned: "${cityLawOfficeResult.locationName}", Time: ${t0Duration.toFixed(2)}ms`
    );
    assert(
        cityLawOfficeResult.zoomLevel === 20,
        'Tier 0: City Law Office Zoom Level',
        `zoomLevel: ${cityLawOfficeResult.zoomLevel}`
    );
    assert(
        t0Duration <= 50,
        'Tier 0: Latency Criterion <= 50ms',
        `Actual: ${t0Duration.toFixed(2)}ms`
    );

    // Test 1.2: Nearby City Law Office (within 180m, e.g. ~80m away)
    const nearCityLawOffice = await AttendanceModel.resolveLocationWithZoomMeta(13.7569, 100.5018);
    assert(
        nearCityLawOffice.locationName === 'ใกล้เคียง สำนักเทศกิจ',
        'Tier 0: Within 180m prefix "ใกล้เคียง "',
        `Returned: "${nearCityLawOffice.locationName}"`
    );

    // Test 1.3: Custom official locations passed in options
    const customOptions = {
        officialLocations: [
            { id: 'TEST-01', name: 'ศาลาว่าการ กทม. เสาชิงช้า', latitude: 13.752500, longitude: 100.501400, radius_meters: 150, is_active: true }
        ]
    };
    const customLocResult = await AttendanceModel.resolveLocationWithZoomMeta(13.752500, 100.501400, customOptions);
    assert(
        customLocResult.locationName === 'บริเวณ ศาลาว่าการ กทม. เสาชิงช้า',
        'Tier 0: Custom options.officialLocations match',
        `Returned: "${customLocResult.locationName}"`
    );

    // -------------------------------------------------------------
    // Test 2: Live/Simulated Coordinates Resolution (Siam, Ari, Sukhumvit, etc.)
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 2: Bangkok Benchmark Coordinates ---');
    const testPoints = [
        { name: 'สยามพารากอน', lat: 13.7460, lng: 100.5348 },
        { name: 'อารีย์ (พหลโยธิน)', lat: 13.7797, lng: 100.5448 },
        { name: 'สุขุมวิท 39', lat: 13.7380, lng: 100.5700 },
        { name: 'กทม. 2 ดินแดง', lat: 13.7709, lng: 100.5574 },
        { name: 'สนามหลวง / วัดพระแก้ว', lat: 13.7535, lng: 100.4930 }
    ];

    for (const pt of testPoints) {
        const start = performance.now();
        const res = await AttendanceModel.resolveLocationWithZoomMeta(pt.lat, pt.lng);
        const dur = performance.now() - start;

        console.log(`  📍 Point: ${pt.name} -> "${res.locationName}" (zoom: ${res.zoomLevel}, ${dur.toFixed(0)}ms)`);

        assert(
            !res.locationName.includes('ซอยในพื้นที่'),
            `No "ซอยในพื้นที่" for ${pt.name}`,
            `locationName: "${res.locationName}"`
        );

        assert(
            !/\(\d+\.\d+,\s*\d+\.\d+\)/.test(res.locationName),
            `No raw coordinates in parentheses for ${pt.name}`,
            `locationName: "${res.locationName}"`
        );

        assert(
            res.locationName.length > 5 && (res.locationName.startsWith('บริเวณ ') || res.locationName.startsWith('ใกล้เคียง ')),
            `Well-formed location name with proper prefix for ${pt.name}`,
            `locationName: "${res.locationName}"`
        );

        assert(
            !res.locationName.includes('พื้นที่กรุงเทพมหานคร'),
            `Identified specific place/soi (not generic fallback) for ${pt.name}`,
            `locationName: "${res.locationName}"`
        );
    }

    // -------------------------------------------------------------
    // Test 3: Tier 4 Semantic Fallback for unknown / boundary coordinates
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 3: Tier 4 Smart Semantic Fallback ---');
    const remotePoint = { lat: 13.8500, lng: 100.6500 }; // suburban Bangkok
    const remoteRes = await AttendanceModel.resolveLocationWithZoomMeta(remotePoint.lat, remotePoint.lng);
    console.log(`  📍 Suburban point -> "${remoteRes.locationName}"`);

    assert(
        !remoteRes.locationName.includes('ซอยในพื้นที่'),
        'Semantic fallback does not contain "ซอยในพื้นที่"',
        `locationName: "${remoteRes.locationName}"`
    );
    assert(
        !/\(\d+\.\d+,\s*\d+\.\d+\)/.test(remoteRes.locationName),
        'Semantic fallback does not contain raw coordinate numbers in parentheses',
        `locationName: "${remoteRes.locationName}"`
    );

    // Test 3.2: Provincial boundary coordinates
    const provPoint = { lat: 18.7900, lng: 98.9600 }; // Chiang Mai
    const provRes = await AttendanceModel.resolveLocationWithZoomMeta(provPoint.lat, provPoint.lng);
    console.log(`  📍 Provincial point -> "${provRes.locationName}"`);
    assert(
        !provRes.locationName.includes('ซอยในพื้นที่') && !/\(\d+\.\d+,\s*\d+\.\d+\)/.test(provRes.locationName),
        'Provincial fallback clean of raw coordinates and "ซอยในพื้นที่"',
        `locationName: "${provRes.locationName}"`
    );

    // -------------------------------------------------------------
    // Test 4: Static Inspection of Code Requirements
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 4: Static Code Compliance ---');
    const attendanceModelSource = fs.readFileSync('assets/js/models/AttendanceModel.js', 'utf8');
    const checkinControllerSource = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');

    // 4.1 Check User-Agent in AttendanceModel
    assert(
        attendanceModelSource.includes('BMA-CheckinApp-Mobile/2.7 (Bangkok Metropolitan Administration)'),
        'AttendanceModel includes official BMA User-Agent header'
    );

    // 4.2 Check Nominatim z=18 query present
    assert(
        attendanceModelSource.includes('zoom=18') && attendanceModelSource.includes('nomUrlZ18'),
        'AttendanceModel includes Nominatim zoom=18 query'
    );

    // 4.3 Check Overpass targeted query
    assert(
        attendanceModelSource.includes('nwr(around:80') && attendanceModelSource.includes('["amenity"]["name"]'),
        'AttendanceModel includes targeted Overpass query for POIs'
    );

    // 4.4 Check CheckinController passes officialLocations
    assert(
        checkinControllerSource.includes('officialLocations:') && checkinControllerSource.includes('resolveLocationWithZoomMeta'),
        'CheckinController passes officialLocations to AttendanceModel.resolveLocationWithZoomMeta'
    );

    console.log('\n================================================================');
    console.log(`📊 Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
});
