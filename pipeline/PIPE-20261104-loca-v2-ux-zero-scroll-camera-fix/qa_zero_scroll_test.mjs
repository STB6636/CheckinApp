/**
 * @file pipeline/PIPE-20261104-loca-v2-ux-zero-scroll-camera-fix/qa_zero_scroll_test.mjs
 * @description Automated QA Test Suite for Zero-Scroll 100dvh Layout, Compact Photo Box, Fullscreen Camera Modal, Mode Switcher, and Leaflet Map Modal
 */

import fs from 'fs';
import path from 'path';

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
console.log('🧪 Starting QA Automated Test Suite: Zero-Scroll & Camera Fix');
console.log('======================================================================\n');

const checkinHtml = fs.readFileSync('checkin.html', 'utf8');
const controllerJs = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');

// -----------------------------------------------------------------------------
// Group 1: Mobile Top Bar & Zero-Scroll Layout
// -----------------------------------------------------------------------------
console.log('▶️ Group 1: Mobile Top Bar & Zero-Scroll Layout');

assert(
    'Top Bar: #userRoleBadge is hidden on mobile screens',
    checkinHtml.includes('id="userRoleBadge" class="hidden sm:inline-block')
);

assert(
    'Top Bar: #btnMobileHistoryMenu has w-11 h-11 dimensions and emerald styling',
    checkinHtml.includes('id="btnMobileHistoryMenu"') && checkinHtml.includes('w-11 h-11') && checkinHtml.includes('border-emerald-500')
);

assert(
    'Main layout: #checkinWorkspaceWrapper exists with compact vertical spacing',
    checkinHtml.includes('id="checkinWorkspaceWrapper" class="space-y-2 lg:space-y-2.5"')
);

// -----------------------------------------------------------------------------
// Group 2: Unified Status Banner & Real-time Clock
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 2: Unified Status Banner & Real-time Clock');

assert(
    'Banner: #unifiedStatusBanner exists with gradient and dynamic text elements',
    checkinHtml.includes('id="unifiedStatusBanner"') &&
    checkinHtml.includes('id="bannerStatusText"') &&
    checkinHtml.includes('id="liveDateDisplay"') &&
    checkinHtml.includes('id="liveClockDisplay"')
);

assert(
    'Clock: CheckinController.#startLiveClock24 formats time with seconds (hh:mm:ss น.)',
    controllerJs.includes('${hh}:${mm}:${ss} น.') && controllerJs.includes('setInterval(updateClock, 1000)')
);

// -----------------------------------------------------------------------------
// Group 3: Compact Photo Box (~85px / h-24)
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 3: Compact Photo Box (~85px / h-24)');

assert(
    'Photo Box: #photoPreviewCard exists with compact height and centered button overlay',
    (checkinHtml.includes('id="photoPreviewCard" class="relative w-full h-24') || checkinHtml.includes('id="photoPreviewCard" class="relative w-full h-full')) &&
    checkinHtml.includes('id="btnCenterPhotoOverlay"') &&
    checkinHtml.includes('id="centerPhotoIcon"') &&
    checkinHtml.includes('id="photoStatusBadgeText"')
);

assert(
    'Photo Box: #capturedPhotoPreview and #cameraCaptureCanvas are present',
    checkinHtml.includes('id="capturedPhotoPreview"') && checkinHtml.includes('id="cameraCaptureCanvas"')
);

assert(
    'Photo Box: #cameraFallbackFileInput is present for LINE / no-camera fallback',
    checkinHtml.includes('id="cameraFallbackFileInput"')
);

// -----------------------------------------------------------------------------
// Group 4: Fullscreen Camera Modal
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 4: Fullscreen Camera Modal');

assert(
    'Modal: #modalFullscreenCamera exists with 3:4 portrait viewfinder and shutter button',
    checkinHtml.includes('id="modalFullscreenCamera"') &&
    checkinHtml.includes('id="cameraVideoStream"') &&
    checkinHtml.includes('id="btnFullscreenShutter"') &&
    checkinHtml.includes('id="btnCloseFullscreenCamera"')
);

assert(
    'Camera Logic: CheckinController has #openFullscreenCamera with LINE/hardware fallback detection',
    controllerJs.includes('#openFullscreenCamera') &&
    controllerJs.includes('/Line\\//i.test(navigator.userAgent)') &&
    controllerJs.includes('cameraFallbackFileInput')
);

assert(
    'Camera Logic: CheckinController.#captureAndCloseCamera captures 3:4 portrait and updates UI',
    controllerJs.includes('#captureAndCloseCamera') &&
    controllerJs.includes('UIHelpers.capturePortrait3x4FromVideo') &&
    controllerJs.includes('centerIcon.className = \'fa-solid fa-rotate-right text-base text-amber-300\'')
);

// -----------------------------------------------------------------------------
// Group 5: Work Mode Switcher & Dynamic Remarks
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 5: Work Mode Switcher & Dynamic Remarks');

assert(
    'Mode Switcher: #btnModeOnsite and #btnModeOffsite exist in checkin.html',
    checkinHtml.includes('id="btnModeOnsite"') && checkinHtml.includes('id="btnModeOffsite"')
);

assert(
    'Offsite: #offsiteRemarkSelect dropdown and #offsiteCustomRemarkBox exist',
    checkinHtml.includes('id="offsiteRemarkSelect"') &&
    checkinHtml.includes('id="offsiteCustomRemarkBox"') &&
    checkinHtml.includes('id="offsiteCustomRemarkInput"')
);

assert(
    'Offsite GPS: #btnOffsiteGpsCurrent and #btnOpenOffsiteMapModal exist',
    checkinHtml.includes('id="btnOffsiteGpsCurrent"') && checkinHtml.includes('id="btnOpenOffsiteMapModal"')
);

assert(
    'Controller: #initModeSwitcher dynamically populates remarks and handles "อื่นๆ"',
    controllerJs.includes('#initModeSwitcher') &&
    controllerJs.includes('this.settings?.remarks') &&
    controllerJs.includes('selectEl.value === \'อื่นๆ\'')
);

// -----------------------------------------------------------------------------
// Group 6: GPS Section Card & Leaflet Modal
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 6: GPS Section Card & Leaflet Modal');

assert(
    'GPS Card: #gpsSectionCard has coordinates, location name, and paired buttons (no embedded iframe)',
    checkinHtml.includes('id="gpsCoordsText"') &&
    checkinHtml.includes('id="gpsLocationNameText"') &&
    checkinHtml.includes('id="btnRefreshGps"') &&
    checkinHtml.includes('id="btnViewGpsMapModal"') &&
    checkinHtml.includes('id="googleMapEmbedWrapper" class="hidden"')
);

assert(
    'Leaflet Modal: #modalViewGpsMap exists with #viewGpsLeafletMap, title, and distance info',
    checkinHtml.includes('id="modalViewGpsMap"') &&
    checkinHtml.includes('id="viewGpsLeafletMap"') &&
    checkinHtml.includes('id="viewGpsModalLocTitle"') &&
    checkinHtml.includes('id="viewGpsModalPinCoords"') &&
    checkinHtml.includes('id="viewGpsModalDistanceInfo"')
);

assert(
    'Controller: #initViewGpsMapModal and #openViewGpsMapModal initialize Leaflet map with pin',
    controllerJs.includes('#initViewGpsMapModal') &&
    controllerJs.includes('#openViewGpsMapModal') &&
    controllerJs.includes('this.viewGpsLeafletMap = L.map')
);

// -----------------------------------------------------------------------------
// Group 7: Sticky Action Button & Banner State Sync
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 7: Sticky Action Button & Banner State Sync');

assert(
    'Sticky Button: #btnSubmitCheckinMain exists with icon and label',
    checkinHtml.includes('id="btnSubmitCheckinMain"') &&
    checkinHtml.includes('id="btnSubmitCheckinIcon"') &&
    checkinHtml.includes('id="btnSubmitCheckinLabel"')
);

assert(
    'Button States: Green for Check-In, Red for Check-Out, and Slate for Completed/Disabled',
    controllerJs.includes('bg-[#00744B] hover:bg-[#005e3c]') && // Green checkin
    controllerJs.includes('bg-[#991B1B] hover:bg-[#7F1D1D]') && // Red checkout
    controllerJs.includes('bg-slate-400 dark:bg-slate-700')    // Slate disabled
);

assert(
    'Banner States: Green gradient for Check-In and Red gradient for Check-Out',
    controllerJs.includes('from-[#00351B] to-[#00744B]') && // Green banner
    controllerJs.includes('from-[#7F1D1D] to-[#DC2626]')    // Red banner
);

// -----------------------------------------------------------------------------
// Group 8: Zero Breaking Changes (Preserved Legacy DOM IDs)
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 8: Zero Breaking Changes (Preserved Legacy DOM IDs)');

const legacyIds = [
    'cameraSectionCard',
    'photoRequirementBadge',
    'btnStartCameraBottom',
    'btnStartCameraOverlay',
    'btnCapturePhoto',
    'btnRetakePhoto',
    'btnStopCamera',
    'cameraStandbyOverlay',
    'cameraStatusMessage',
    'checkinWorkspaceGrid',
    'checkinStep1Container',
    'checkinStep2Container',
    'btnNextStepCheckin',
    'btnPrevStepCheckin',
    'rightColumnWrapper',
    'todayCheckinCardTitle',
    'todayCheckinBadge',
    'todayCheckinTime',
    'todayCheckoutCardTitle',
    'todayCheckoutBadge',
    'todayCheckoutTime',
    'googleMapEmbedWrapper',
    'googleMapRealtimeIframe',
    'googleMapPlaceholder',
    'linkViewGoogleMap'
];

let missingLegacyIds = [];
for (const id of legacyIds) {
    if (!checkinHtml.includes(`id="${id}"`)) {
        missingLegacyIds.push(id);
    }
}
assert(
    'All 25 legacy DOM IDs are preserved in checkin.html to prevent any JS breakage',
    missingLegacyIds.length === 0,
    missingLegacyIds.join(', ')
);

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
