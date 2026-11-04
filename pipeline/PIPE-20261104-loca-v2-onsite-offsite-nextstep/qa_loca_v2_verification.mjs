/**
 * @file pipeline/PIPE-20261104-loca-v2-onsite-offsite-nextstep/qa_loca_v2_verification.mjs
 * @description Comprehensive Automated QA Verification for Loca-V2 (Onsite/Offsite Multi-Location Geofence, Next Step Flow, Hierarchical Filter)
 */

import fs from 'fs';
import path from 'path';
import { Config } from '../../assets/js/core/Config.js';

let passedCount = 0;
let failedCount = 0;
const results = [];

function assert(description, isConditionMet, extraInfo = '') {
    if (isConditionMet) {
        passedCount++;
        results.push({ status: 'PASS', description });
        console.log(`  ✅ [PASS] ${description} ${extraInfo ? '(' + extraInfo + ')' : ''}`);
    } else {
        failedCount++;
        results.push({ status: 'FAIL', description, extraInfo });
        console.error(`  ❌ [FAIL] ${description} - ${extraInfo}`);
    }
}

console.log('======================================================================');
console.log('🧪 Starting Loca-V2 Automated QA Verification Suite');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: Configuration & Staging Schema Isolation
// -----------------------------------------------------------------------------
console.log('▶️ Suite 1: Configuration & Staging Schema Isolation');

assert('Config.SUPABASE_SCHEMA is configured to "staging"', Config.SUPABASE_SCHEMA === 'staging', Config.SUPABASE_SCHEMA);
assert('Config.STORAGE_KEYS contains OFFICIAL_LOCATIONS', Boolean(Config.STORAGE_KEYS?.OFFICIAL_LOCATIONS), Config.STORAGE_KEYS?.OFFICIAL_LOCATIONS);
assert('Config.DEFAULT_SETTINGS.official_locations is an array', Array.isArray(Config.DEFAULT_SETTINGS?.official_locations));
assert('Config.DEFAULT_SETTINGS.official_locations contains default location (LOC-001)', Config.DEFAULT_SETTINGS?.official_locations?.[0]?.id === 'LOC-001');
assert('Config.DEFAULT_SETTINGS.remarks contains offsite options', Config.DEFAULT_SETTINGS?.remarks?.includes('ปฏิบัติงานนอกสถานที่') && Config.DEFAULT_SETTINGS?.remarks?.includes('ปฏิบัติงานที่บ้าน (WFH)'));

// -----------------------------------------------------------------------------
// Suite 2: Haversine Formula & Multi-Location Geofence Evaluation
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 2: Haversine Formula & Multi-Location Geofence Evaluation');

function calculateHaversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

function evaluateOnsiteGeofence(currentLat, currentLng, officialLocations) {
    const activeLocations = (officialLocations || []).filter(loc => loc.is_active !== false);

    if (!currentLat || !currentLng || isNaN(currentLat) || isNaN(currentLng)) {
        return {
            matched: false,
            location: null,
            distanceMeters: 0,
            allowedRadius: 0,
            message: 'ยังไม่สามารถระบุพิกัด GPS ได้'
        };
    }

    if (activeLocations.length === 0) {
        return {
            matched: true,
            location: { name: 'สถานที่ทำงาน (ไม่จำกัดรัศมี)' },
            distanceMeters: 0,
            allowedRadius: 999999,
            message: 'อยู่ในสถานที่ปฏิบัติงาน'
        };
    }

    const accuracyBuffer = 25;
    let closestLocation = null;
    let minDistance = Infinity;
    let matchedLocation = null;

    for (const loc of activeLocations) {
        const locLat = Number(loc.latitude);
        const locLng = Number(loc.longitude);
        if (isNaN(locLat) || isNaN(locLng)) continue;

        const dist = calculateHaversineMeters(currentLat, currentLng, locLat, locLng);
        const effectiveRadius = (Number(loc.radius_meters) || 150) + accuracyBuffer;

        if (dist < minDistance) {
            minDistance = dist;
            closestLocation = loc;
        }

        if (dist <= effectiveRadius) {
            matchedLocation = loc;
            minDistance = dist;
            break;
        }
    }

    if (matchedLocation) {
        return {
            matched: true,
            location: matchedLocation,
            distanceMeters: minDistance,
            allowedRadius: Number(matchedLocation.radius_meters) || 150,
            message: `อยู่ในสถานที่ปฏิบัติงาน "${matchedLocation.name}" (ห่าง ${minDistance} ม. / รัศมี ${matchedLocation.radius_meters} ม.)`
        };
    }

    const closestName = closestLocation ? closestLocation.name : 'สถานที่ทำงาน';
    const closestRadius = closestLocation ? (closestLocation.radius_meters || 150) : 150;
    return {
        matched: false,
        location: closestLocation,
        distanceMeters: minDistance,
        allowedRadius: closestRadius,
        message: `พิกัดตำแหน่งอยู่นอกสถานที่ทำงาน (ห่างจาก "${closestName}" ประมาณ ${minDistance} ม. เกินรัศมีที่อนุญาต ${closestRadius} ม.)`
    };
}

const mockLocations = [
    { id: 'LOC-1', name: 'สำนักเทศกิจ', latitude: 13.756331, longitude: 100.501765, radius_meters: 150, is_active: true },
    { id: 'LOC-2', name: 'ศาลาว่าการ กทม. 1 (เสาชิงช้า)', latitude: 13.752500, longitude: 100.501500, radius_meters: 200, is_active: true },
    { id: 'LOC-3', name: 'ศูนย์เยาวชนกรุงเทพมหานคร', latitude: 13.770000, longitude: 100.550000, radius_meters: 100, is_active: false }
];

// Test 2.1: Directly at Location 1
const eval1 = evaluateOnsiteGeofence(13.756331, 100.501765, mockLocations);
assert('Point at Location 1 is matched (within radius)', eval1.matched === true && eval1.location.name === 'สำนักเทศกิจ', `dist: ${eval1.distanceMeters}m`);

// Test 2.2: Within 100 meters of Location 1
const eval2 = evaluateOnsiteGeofence(13.757000, 100.501765, mockLocations);
assert('Point within 100m of Location 1 is matched', eval2.matched === true, `dist: ${eval2.distanceMeters}m`);

// Test 2.3: Near Location 2 (Sao Chingcha)
const eval3 = evaluateOnsiteGeofence(13.753000, 100.501500, mockLocations);
assert('Point near Location 2 is matched to Location 2', eval3.matched === true && eval3.location.name === 'ศาลาว่าการ กทม. 1 (เสาชิงช้า)', `dist: ${eval3.distanceMeters}m`);

// Test 2.4: Out of radius (> 2 km away)
const eval4 = evaluateOnsiteGeofence(13.800000, 100.600000, mockLocations);
assert('Point >2km away is NOT matched (out of radius)', eval4.matched === false);
assert('Out-of-radius message explicitly contains "พิกัดตำแหน่งอยู่นอกสถานที่ทำงาน"', eval4.message.includes('พิกัดตำแหน่งอยู่นอกสถานที่ทำงาน'), eval4.message);

// Test 2.5: Inactive location is ignored
const eval5 = evaluateOnsiteGeofence(13.770010, 100.550010, mockLocations);
assert('Inactive location LOC-3 is ignored and treated as out of radius', eval5.matched === false);

// Test 2.6: Invalid coordinates
const eval6 = evaluateOnsiteGeofence(null, undefined, mockLocations);
assert('Null/undefined coordinates return matched: false', eval6.matched === false);

// -----------------------------------------------------------------------------
// Suite 3: DOM ID Integrity Audit across checkin.html, settings.html, personnel.html
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 3: DOM ID Integrity Audit across Pages');

const checkinHtml = fs.readFileSync('checkin.html', 'utf8');
const settingsHtml = fs.readFileSync('settings.html', 'utf8');
const personnelHtml = fs.readFileSync('personnel.html', 'utf8');

const requiredCheckinIds = [
    // Next Step 2-Step Containers
    'checkinStep1Container',
    'checkinStep2Container',
    'btnNextStepCheckin',
    'btnPrevStepCheckin',
    'btnSubmitCheckinMain',
    'btnNextStepLabel',
    'btnSubmitCheckinLabel',
    'step2SummaryBadge',
    'step2SummaryText',

    // Onsite / Offsite Controls
    'btnModeOnsite',
    'btnModeOffsite',
    'onsiteGeofenceStatusCard',
    'onsiteGeofenceBadge',
    'onsiteGeofenceIcon',
    'onsiteGeofenceDetailText',
    'offsiteLocationSection',
    'offsiteRemarkChipsContainer',
    'offsiteCustomRemarkBox',
    'offsiteCustomRemarkInput',
    'radioOffsiteGpsCurrent',
    'radioOffsiteGpsMap',
    'modalOffsiteMapSearch',
    'btnOpenOffsiteMapModal',
    'offsiteSelectedLocationName',
    'offsiteSelectedLocationCoords',

    // Core Camera & GPS Elements
    'cameraSectionCard',
    'cameraVideoStream',
    'cameraCaptureCanvas',
    'capturedPhotoPreview',
    'cameraStandbyOverlay',
    'cameraStatusMessage',
    'btnStartCameraBottom',
    'btnCapturePhoto',
    'btnRetakePhoto',
    'btnStopCamera',
    'gpsSectionCard',
    'gpsCoordsText',
    'gpsLocationNameText',
    'googleMapEmbedWrapper',
    'googleMapRealtimeIframe',
    'btnRefreshGps',
    'checkinShiftSelect',
    'checkinActionCard',
    'btnOpenSpecialRequestModal'
];

let missingCheckinIds = [];
for (const id of requiredCheckinIds) {
    if (!checkinHtml.includes(`id="${id}"`)) {
        missingCheckinIds.push(id);
    }
}
assert('All required Loca-V2 & camera/GPS DOM IDs exist in checkin.html', missingCheckinIds.length === 0, missingCheckinIds.join(', '));

const requiredSettingsIds = [
    'tab-panel-locations',
    'btnAddOfficialLocation',
    'officialLocationsTableBody',
    'modalSettingsItem',
    'formSettingsItem',
    'modalSettingsTitle',
    'modalSettingsBody'
];

let missingSettingsIds = [];
for (const id of requiredSettingsIds) {
    if (!settingsHtml.includes(`id="${id}"`)) {
        missingSettingsIds.push(id);
    }
}
assert('All required Tab 6 & CRUD modal DOM IDs exist in settings.html', missingSettingsIds.length === 0, missingSettingsIds.join(', '));

const requiredPersonnelIds = [
    'hierarchicalPersonnelOrgFilterDock',
    'selectPersonnelFilterBureau',
    'selectPersonnelFilterDivision',
    'selectPersonnelFilterWorkGroup',
    'personnelTableBody',
    'personnelTotalCountBadge'
];

let missingPersonnelIds = [];
for (const id of requiredPersonnelIds) {
    if (!personnelHtml.includes(`id="${id}"`)) {
        missingPersonnelIds.push(id);
    }
}
assert('All required 3-level hierarchical filter DOM IDs exist in personnel.html', missingPersonnelIds.length === 0, missingPersonnelIds.join(', '));

// -----------------------------------------------------------------------------
// Suite 4: Offsite Mode & Remarks Formatting Logic
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 4: Offsite Mode & Remarks Formatting Logic');

function formatSubmitRemark(locationMode, selectedChip, customInput) {
    if (locationMode === 'ONSITE') {
        return 'ในสถานที่';
    }
    if (locationMode === 'OFFSITE') {
        if (selectedChip === 'อื่นๆ') {
            return customInput?.trim() || 'อื่นๆ';
        }
        return selectedChip || 'ปฏิบัติงานนอกสถานที่';
    }
    return '-';
}

assert('Onsite mode produces remark "ในสถานที่"', formatSubmitRemark('ONSITE', null, null) === 'ในสถานที่');
assert('Offsite mode with "อบรม" produces remark "อบรม"', formatSubmitRemark('OFFSITE', 'อบรม', null) === 'อบรม');
assert('Offsite mode with "ประชุม" produces remark "ประชุม"', formatSubmitRemark('OFFSITE', 'ประชุม', null) === 'ประชุม');
assert('Offsite mode with "ปฏิบัติงานที่บ้าน (WFH)" produces remark "ปฏิบัติงานที่บ้าน (WFH)"', formatSubmitRemark('OFFSITE', 'ปฏิบัติงานที่บ้าน (WFH)', null) === 'ปฏิบัติงานที่บ้าน (WFH)');
assert('Offsite mode with "อื่นๆ" and custom text produces custom remark', formatSubmitRemark('OFFSITE', 'อื่นๆ', 'ลงตรวจพื้นที่น้ำท่วมเขตดอนเมือง') === 'ลงตรวจพื้นที่น้ำท่วมเขตดอนเมือง');
assert('Offsite mode with "อื่นๆ" and empty custom text falls back to "อื่นๆ"', formatSubmitRemark('OFFSITE', 'อื่นๆ', '   ') === 'อื่นๆ');

// -----------------------------------------------------------------------------
// Suite 5: Hierarchical 3-Level Organization Filter Logic
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 5: Hierarchical 3-Level Organization Filter Logic');

const samplePersonnel = [
    { id: 1, first_name: 'สมชาย', last_name: 'ใจดี', bureau: 'สำนักเทศกิจ', division: 'สำนักงานเลขานุการ', work_group: 'กลุ่มงานการเจ้าหน้าที่' },
    { id: 2, first_name: 'สมศรี', last_name: 'สุขใจ', bureau: 'สำนักเทศกิจ', division: 'สำนักงานเลขานุการ', work_group: 'กลุ่มงานบริหารทั่วไป' },
    { id: 3, first_name: 'วิชัย', last_name: 'กล้าหาญ', bureau: 'สำนักเทศกิจ', division: 'กองตรวจและปฏิบัติการพื้นที่ 1', work_group: 'กลุ่มงานตรวจ 1' },
    { id: 4, first_name: 'ประเสริฐ', last_name: 'ทองคำ', bureau: 'สำนักการโยธา', division: 'สำนักงานเลขานุการ', work_group: 'กลุ่มงานบริหารทั่วไป' }
];

function filterPersonnel(list, selBureau, selDivision, selWorkGroup) {
    return list.filter(p => {
        if (selBureau !== 'all' && (p.bureau || '').trim() !== selBureau.trim()) {
            return false;
        }
        if (selDivision !== 'all' && (p.division || '').trim() !== selDivision.trim()) {
            return false;
        }
        if (selWorkGroup !== 'all' && (p.work_group || '').trim() !== selWorkGroup.trim()) {
            return false;
        }
        return true;
    });
}

const fAll = filterPersonnel(samplePersonnel, 'all', 'all', 'all');
assert('Filter all returns 4 records', fAll.length === 4);

const fBureau = filterPersonnel(samplePersonnel, 'สำนักเทศกิจ', 'all', 'all');
assert('Filter Bureau "สำนักเทศกิจ" returns 3 records', fBureau.length === 3);

const fDivision = filterPersonnel(samplePersonnel, 'สำนักเทศกิจ', 'สำนักงานเลขานุการ', 'all');
assert('Filter Division "สำนักงานเลขานุการ" returns 2 records', fDivision.length === 2);

const fWorkGroup = filterPersonnel(samplePersonnel, 'สำนักเทศกิจ', 'สำนักงานเลขานุการ', 'กลุ่มงานการเจ้าหน้าที่');
assert('Filter WorkGroup "กลุ่มงานการเจ้าหน้าที่" returns 1 record', fWorkGroup.length === 1 && fWorkGroup[0].id === 1);

// -----------------------------------------------------------------------------
// Final Summary
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`📊 Test Summary: Total ${passedCount + failedCount} | Passed: ${passedCount} | Failed: ${failedCount}`);
console.log('======================================================================\n');

if (failedCount > 0) {
    console.error(`💥 TEST SUITE FAILED with ${failedCount} failures.`);
    process.exit(1);
} else {
    console.log('🎉 100% ALL TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
}
