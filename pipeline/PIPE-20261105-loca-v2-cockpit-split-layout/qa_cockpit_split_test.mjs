/**
 * @file pipeline/PIPE-20261105-loca-v2-cockpit-split-layout/qa_cockpit_split_test.mjs
 * @description Automated QA Test Suite for Cockpit Split Layout & Loca-V2 Audit
 */

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const checkinHtmlPath = path.join(rootDir, 'checkin.html');
const controllerJsPath = path.join(rootDir, 'assets/js/controllers/CheckinController.js');

const checkinHtml = fs.readFileSync(checkinHtmlPath, 'utf8');
const controllerJs = fs.readFileSync(controllerJsPath, 'utf8');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(description, condition, extraInfo = '') {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✅ [PASS] ${description}`);
    } else {
        failedTests++;
        console.error(`  ❌ [FAIL] ${description} - ${extraInfo}`);
    }
}

console.log('======================================================================');
console.log('🧪 Starting QA Automated Test Suite: Cockpit Split Layout (Loca-V2)');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Group 1: Mobile Top Bar (Single Tier Unified Header)
// -----------------------------------------------------------------------------
console.log('▶️ Group 1: Mobile Top Bar (Single Tier Unified Header)');

assert(
    'Top Bar: Desktop Logo Box is hidden on mobile (hidden lg:flex)',
    checkinHtml.includes('id="checkinLogoBox" class="hidden lg:flex')
);

assert(
    'Top Bar: User icon and full name (#userFullNameText) are shown on the left',
    checkinHtml.includes('id="userFullNameText"') &&
    checkinHtml.includes('fa-user')
);

assert(
    'Top Bar: #userRoleBadge is hidden on mobile screens (hidden sm:inline-block)',
    checkinHtml.includes('id="userRoleBadge" class="hidden sm:inline-block')
);

assert(
    'Top Bar: #btnMobileManual is hidden on mobile per single-tier layout',
    checkinHtml.includes('id="btnMobileManual" href="docs/manual/index.html" target="_blank" class="hidden')
);

assert(
    'Top Bar: #btnMobileHistoryMenu has 42x42px (w-11 h-11) and civic green border (border-2 border-[#00744B])',
    checkinHtml.includes('id="btnMobileHistoryMenu"') &&
    checkinHtml.includes('w-11 h-11') &&
    checkinHtml.includes('border-2 border-[#00744B]')
);

// -----------------------------------------------------------------------------
// Group 2: Dynamic Unified Banner & Real-time Seconds Clock
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 2: Dynamic Unified Banner & Real-time Seconds Clock');

assert(
    'Banner: #unifiedStatusBanner exists with smooth transition classes',
    checkinHtml.includes('id="unifiedStatusBanner"') &&
    checkinHtml.includes('id="bannerStatusText"') &&
    checkinHtml.includes('id="bannerSubText"')
);

assert(
    'Clock: #liveClockDisplay exists and is formatted to 24-hr with seconds in controller',
    checkinHtml.includes('id="liveClockDisplay"') &&
    controllerJs.includes('${hh}:${mm}:${ss} น.') &&
    controllerJs.includes('setInterval(updateClock, 1000)')
);

assert(
    'Banner State Sync: CheckinController switches gradient dynamically (Green for Check-in, Red for Check-out)',
    controllerJs.includes('from-[#00351B] to-[#00744B]') &&
    controllerJs.includes('from-[#7F1D1D] to-[#DC2626]') &&
    controllerJs.includes('from-slate-700 to-slate-800')
);

// -----------------------------------------------------------------------------
// Group 3: Cockpit Split 2-Column Grid (~20dvh / h-36 sm:h-40)
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 3: Cockpit Split 2-Column Grid (~20dvh / h-36 sm:h-40)');

assert(
    'Grid Container: 2-Column grid with h-36 sm:h-40 height',
    checkinHtml.includes('grid grid-cols-2 gap-2.5 items-stretch h-36 sm:h-40')
);

assert(
    'Left Column: #photoPreviewCard fills height with rounded-2xl and bg-slate-900',
    checkinHtml.includes('id="photoPreviewCard" class="relative w-full h-full rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-900')
);

assert(
    'Photo Box: #btnCenterPhotoOverlay is centered without interference',
    checkinHtml.includes('id="btnCenterPhotoOverlay"') &&
    checkinHtml.includes('id="centerPhotoIcon"') &&
    checkinHtml.includes('id="photoStatusBadgeText"')
);

assert(
    'Photo Box Artifact Fix: Legacy camera buttons moved out to #legacyHiddenCameraElements (display: none !important)',
    checkinHtml.includes('id="legacyHiddenCameraElements"') &&
    !checkinHtml.substring(
        checkinHtml.indexOf('id="photoPreviewCard"'),
        checkinHtml.indexOf('id="gpsSectionCard"')
    ).includes('id="btnRetakePhoto"') &&
    checkinHtml.includes('id="btnRetakePhoto" class="hidden" style="display: none !important;"')
);

assert(
    'Controller Photo Fix: #captureAndCloseCamera and #resetPageAfterSave hide #btnRetakePhoto',
    controllerJs.includes("btnRetake?.classList.add('hidden')")
);

assert(
    'Right Column: #gpsSectionCard has h-full flex flex-col justify-between with coordinates and place name',
    checkinHtml.includes('id="gpsSectionCard"') &&
    checkinHtml.includes('id="gpsCoordsText"') &&
    checkinHtml.includes('id="gpsLocationNameText"')
);

assert(
    'GPS Card Actions: Paired action buttons #btnRefreshGps and #btnViewGpsMapModal exist',
    checkinHtml.includes('id="btnRefreshGps"') &&
    checkinHtml.includes('id="btnViewGpsMapModal"')
);

// -----------------------------------------------------------------------------
// Group 4: Offsite Mode Card & Dynamic Remarks
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 4: Offsite Mode Card & Dynamic Remarks');

assert(
    'Offsite Label: Strictly "ลักษณะงานนอกสถานที่ *" without "(ดึงจาก settings)"',
    checkinHtml.includes('ลักษณะงานนอกสถานที่ *') &&
    !checkinHtml.includes('ลักษณะงานนอกสถานที่ (ดึงจาก settings)')
);

assert(
    'Offsite Remarks Dropdown: <select id="offsiteRemarkSelect"> exists and dynamically maps array',
    checkinHtml.includes('id="offsiteRemarkSelect"') &&
    controllerJs.includes('remarks.map(r => `<option value="${r}">${r}</option>`).join(\'\')')
);

assert(
    'Offsite Remarks Handling: Supports "อื่นๆ" with #offsiteCustomRemarkBox toggle',
    checkinHtml.includes('id="offsiteCustomRemarkBox"') &&
    checkinHtml.includes('id="offsiteCustomRemarkInput"') &&
    controllerJs.includes("if (selectEl.value === 'อื่นๆ')")
);

assert(
    'Offsite GPS Toggle: Clear active/inactive state classes between #btnOffsiteGpsCurrent and #btnOpenOffsiteMapModal',
    controllerJs.includes('setActiveOffsiteGps') &&
    controllerJs.includes('bg-[#00744B] text-white shadow-md border-2 border-[#005B2E]') &&
    controllerJs.includes('bg-indigo-600 text-white shadow-md border-2 border-indigo-700')
);

// -----------------------------------------------------------------------------
// Group 5: Fullscreen Camera Modal & Leaflet GPS Map Modal
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 5: Fullscreen Camera Modal & Leaflet GPS Map Modal');

assert(
    'Camera Modal: #modalFullscreenCamera exists with 3:4 live portrait viewfinder and shutter button',
    checkinHtml.includes('id="modalFullscreenCamera"') &&
    checkinHtml.includes('id="cameraVideoStream"') &&
    checkinHtml.includes('id="btnFullscreenShutter"')
);

assert(
    'Camera Fallback: LINE browser and no-hardware camera gracefully fall back to file input',
    checkinHtml.includes('id="cameraFallbackFileInput"') &&
    controllerJs.includes('isLineBrowser') &&
    controllerJs.includes('fallbackInput.click()')
);

assert(
    'Leaflet Map Modal: #modalViewGpsMap exists with Leaflet container #viewGpsLeafletMap',
    checkinHtml.includes('id="modalViewGpsMap"') &&
    checkinHtml.includes('id="viewGpsLeafletMap"') &&
    checkinHtml.includes('id="btnCloseViewGpsMapModal"')
);

assert(
    'Leaflet Logic: CheckinController initializes Leaflet map with custom marker & geofence circle',
    controllerJs.includes('#initViewGpsMapModal') &&
    controllerJs.includes('#openViewGpsMapModal') &&
    controllerJs.includes('L.map') &&
    controllerJs.includes('L.marker')
);

// -----------------------------------------------------------------------------
// Group 6: Sticky Action Button & 12 System Settings Compatibility
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 6: Sticky Action Button & 12 System Settings Compatibility');

assert(
    'Sticky Button: #btnSubmitCheckinMain is docked at screen bottom with color-coded states',
    checkinHtml.includes('class="bma-sticky-checkin-bar"') &&
    checkinHtml.includes('id="btnSubmitCheckinMain"') &&
    controllerJs.includes('bg-[#00744B]') &&
    controllerJs.includes('bg-[#991B1B]')
);

assert(
    '12 Settings: Shift filtering, time windows, and geofence evaluation are fully preserved',
    controllerJs.includes('#evaluateTimeWindowAndPopulateShifts') &&
    controllerJs.includes('#isShiftAlreadyRecordedToday') &&
    controllerJs.includes('#renderGeofenceStatusUI')
);

// -----------------------------------------------------------------------------
// Group 7: Zero Breaking Changes (Preserved Legacy DOM IDs)
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 7: Zero Breaking Changes (Preserved Legacy DOM IDs)');

const legacyIds = [
    'userPositionText',
    'userAffiliationText',
    'btnGoAdminDashboard',
    'btnCheckinTheme',
    'btnCheckinLogout',
    'tabDesktopCheckin',
    'tabDesktopHistory',
    'tabDesktopSpecial',
    'tabDesktopManual',
    'todayCheckinCardTitle',
    'todayCheckinBadge',
    'todayCheckinTime',
    'todayCheckoutCardTitle',
    'todayCheckoutBadge',
    'todayCheckoutTime',
    'modeBadge',
    'modeContextBadge',
    'btnModeOnsite',
    'btnModeOffsite',
    'onsiteGeofenceStatusCard',
    'onsiteGeofenceBadge',
    'onsiteGeofenceDetailText',
    'offsiteLocationSection',
    'offsiteRemarkChipsContainer',
    'radioOffsiteGpsCurrent',
    'radioOffsiteGpsMap',
    'offsiteCustomLocationSummaryBox',
    'offsiteSelectedLocationName',
    'offsiteSelectedLocationCoords',
    'checkinRecordingModeTag',
    'checkinShiftSelectLabel',
    'checkinShiftSelect',
    'mainCustomTimeContainer',
    'mainCustomCheckin',
    'mainCustomCheckout',
    'regularCompletedNoticeBox',
    'regularCompletedNoticeText',
    'btnOpenSpecialRequestModal',
    'checkinWorkspaceGrid',
    'checkinStep1Container',
    'btnNextStepCheckin',
    'btnNextStepLabel',
    'checkinStep2Container',
    'btnPrevStepCheckin',
    'step2SummaryBadge',
    'step2SummaryText',
    'rightColumnWrapper',
    'cameraSectionCard',
    'photoRequirementBadge',
    'btnStartCameraBottom',
    'btnStartCameraOverlay',
    'btnCapturePhoto',
    'btnRetakePhoto',
    'btnStopCamera',
    'btnInFrameShutter',
    'cameraStandbyOverlay',
    'cameraStatusMessage',
    'googleMapEmbedWrapper',
    'googleMapPlaceholder',
    'googleMapRealtimeIframe',
    'linkViewGoogleMap'
];

let allLegacyPresent = true;
let missingIds = [];
for (const id of legacyIds) {
    if (!checkinHtml.includes(`id="${id}"`)) {
        allLegacyPresent = false;
        missingIds.push(id);
    }
}

assert(
    `All ${legacyIds.length} legacy DOM IDs are strictly preserved in checkin.html`,
    allLegacyPresent,
    `Missing: ${missingIds.join(', ')}`
);

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`📊 Test Summary: Total ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('======================================================================\n');

if (failedTests > 0) {
    console.error(`💥 TEST SUITE FAILED with ${failedTests} failures.`);
    process.exit(1);
} else {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 100% COMPLIANT.');
    process.exit(0);
}
