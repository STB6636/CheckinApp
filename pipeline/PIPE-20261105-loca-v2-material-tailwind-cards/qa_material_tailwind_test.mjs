/**
 * @file pipeline/PIPE-20261105-loca-v2-material-tailwind-cards/qa_material_tailwind_test.mjs
 * @description Automated QA Test Suite for Material Tailwind Cards (Civic Emerald Inset) Audit
 */

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const checkinHtmlPath = path.join(rootDir, 'checkin.html');
const checkinHtml = fs.readFileSync(checkinHtmlPath, 'utf8');

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
console.log('🧪 Starting QA Automated Test Suite: Material Tailwind Cards Audit');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Group 1: DOM Compatibility (9 Required DOM IDs)
// -----------------------------------------------------------------------------
console.log('▶️ Group 1: Critical DOM Compatibility Check');

const requiredIds = [
    'gpsSectionCard',
    'gpsRequirementBadge',
    'gpsLocationNameText',
    'gpsLocationName',
    'gpsCoordsText',
    'btnRefreshGps',
    'btnViewGpsMapModal',
    'googleMapEmbedWrapper',
    'linkViewGoogleMap'
];

requiredIds.forEach(id => {
    assert(
        `DOM Element ID exists: #${id}`,
        checkinHtml.includes(`id="${id}"`),
        `Missing id="${id}" in checkin.html`
    );
});

// Additional legacy map embeds
assert(
    'Legacy Embed: #googleMapPlaceholder exists',
    checkinHtml.includes('id="googleMapPlaceholder"')
);
assert(
    'Legacy Embed: #googleMapRealtimeIframe exists',
    checkinHtml.includes('id="googleMapRealtimeIframe"')
);

// -----------------------------------------------------------------------------
// Group 2: Material Tailwind Layout & CSS Verification
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 2: Material Tailwind Layout & CSS Verification');

assert(
    'Root Container: #gpsSectionCard has p-0, flex, flex-col, overflow-hidden, aspect-[3/4], max-h-[30dvh]',
    checkinHtml.includes('id="gpsSectionCard"') &&
    checkinHtml.includes('p-0 flex flex-col w-full aspect-[3/4] max-h-[30dvh] overflow-hidden')
);

assert(
    'Elevated Inset Header: Gradient from-[#00351B] to-[#00744B] with shadow-md and rounded-xl inset',
    checkinHtml.includes('bg-gradient-to-r from-[#00351B] to-[#00744B]') &&
    checkinHtml.includes('shadow-md') &&
    checkinHtml.includes('mx-2.5 mt-2.5 py-2 px-3 rounded-xl')
);

assert(
    'Header Badge: Live status indicator "พร้อม" with animate-ping dot',
    checkinHtml.includes('animate-ping') &&
    checkinHtml.includes('พร้อม')
);

assert(
    'Middle Body: flex-1 flex flex-col justify-center px-2.5 py-1 text-center',
    checkinHtml.includes('flex-1 flex flex-col justify-center px-2.5 py-1 text-center')
);

assert(
    'Middle Body Styling: Emerald tinted rounded box with border and responsive font',
    checkinHtml.includes('bg-emerald-50/50 dark:bg-emerald-950/20') &&
    checkinHtml.includes('border-emerald-200/60 dark:border-emerald-800/40') &&
    checkinHtml.includes('id="gpsLocationNameText" class="font-black text-xs sm:text-[13px]')
);

assert(
    'Docked Footer: Action buttons docked with mt-auto px-2.5 pb-2.5 pt-0 space-y-1.5',
    checkinHtml.includes('mt-auto px-2.5 pb-2.5 pt-0 space-y-1.5 shrink-0 w-full')
);

assert(
    'Docked Buttons: Primary #btnRefreshGps has BMA Civic Emerald bg-[#00744B]',
    checkinHtml.includes('id="btnRefreshGps"') &&
    checkinHtml.includes('bg-[#00744B]') &&
    checkinHtml.includes('hover:bg-[#005b3a]')
);

assert(
    'Docked Buttons: Secondary #btnViewGpsMapModal has emerald light fill/outline and text-[#00744B]',
    checkinHtml.includes('id="btnViewGpsMapModal"') &&
    checkinHtml.includes('bg-emerald-50/80') &&
    checkinHtml.includes('text-[#00744B]')
);

// -----------------------------------------------------------------------------
// Group 3: Zero Unwanted Dead White Space & Viewport Fit
// -----------------------------------------------------------------------------
console.log('\n▶️ Group 3: Zero Dead White Space & Cockpit Grid Layout');

assert(
    'No amber-50 legacy classes inside #gpsSectionCard',
    !checkinHtml.includes('bg-amber-50/80 dark:bg-amber-950/40') &&
    !checkinHtml.includes('border-amber-200/80')
);

assert(
    'Aspect ratio aligned with Left Column (Camera card)',
    checkinHtml.includes('aspect-[3/4]') &&
    checkinHtml.includes('max-h-[30dvh]')
);

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`📊 Test Results: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
console.log('======================================================================');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
