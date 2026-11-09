import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

console.log('====================================================');
console.log('QA AUDIT TEST SUITE: GPS SYMMETRY & COMPACT MAP CARD');
console.log('Task: PIPE-20261105-loca-v2-gps-symmetry-compact');
console.log('Branch: Loca-V2');
console.log('Project Root:', projectRoot);
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
    if (condition) {
        console.log(`[PASS] ${testName}`);
        passCount++;
    } else {
        console.error(`[FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
        failCount++;
    }
}

// -----------------------------------------------------------------------------
// 1. DOM Compatibility Check (checkin.html)
// -----------------------------------------------------------------------------
console.log('--- 1. DOM COMPATIBILITY & ID VERIFICATION ---');
const checkinHtmlPath = path.join(projectRoot, 'checkin.html');
assert(fs.existsSync(checkinHtmlPath), 'checkin.html exists');

const htmlContent = fs.readFileSync(checkinHtmlPath, 'utf8');

const criticalDomIds = [
    'gpsSectionCard',
    'gpsRequirementBadge',
    'gpsLocationNameText',
    'gpsLocationName',
    'gpsCoordsText',
    'btnRefreshGps',
    'btnViewGpsMapModal',
    'googleMapEmbedWrapper',
    'linkViewGoogleMap',
    'inlineGpsLeafletMap',
    'gpsRefreshSpinnerIcon'
];

criticalDomIds.forEach(id => {
    const idRegex = new RegExp(`id=["']${id}["']`);
    assert(idRegex.test(htmlContent), `Critical DOM element #${id} exists in checkin.html`);
});

const photoDomIds = [
    'photoPreviewCard',
    'photoPlaceholder',
    'capturedPhotoPreview',
    'cameraCaptureCanvas',
    'btnCenterPhotoOverlay',
    'centerPhotoIcon',
    'photoStatusBadgeText',
    'cameraFallbackFileInput'
];

photoDomIds.forEach(id => {
    const idRegex = new RegExp(`id=["']${id}["']`);
    assert(idRegex.test(htmlContent), `Photo DOM element #${id} exists in checkin.html`);
});

// -----------------------------------------------------------------------------
// 2. Visual & Architectural Symmetry Check
// -----------------------------------------------------------------------------
console.log('\n--- 2. VISUAL & ARCHITECTURAL SYMMETRY CHECK ---');

// Extract photoPreviewCard attributes
const photoMatch = htmlContent.match(/<div[^>]*id=["']photoPreviewCard["'][^>]*class=["']([^"']+)["']/i);
assert(photoMatch !== null, 'photoPreviewCard class attribute extracted');
const photoClasses = photoMatch ? photoMatch[1] : '';

// Extract gpsSectionCard attributes
const gpsMatch = htmlContent.match(/<div[^>]*id=["']gpsSectionCard["'][^>]*class=["']([^"']+)["']/i);
assert(gpsMatch !== null, 'gpsSectionCard class attribute extracted');
const gpsClasses = gpsMatch ? gpsMatch[1] : '';

// Verify 1px border border-slate-200/80
assert(
    photoClasses.includes('border border-slate-200/80'),
    'photoPreviewCard has 1px border (border border-slate-200/80)',
    `Actual: ${photoClasses}`
);
assert(
    gpsClasses.includes('border border-slate-200/80'),
    'gpsSectionCard has 1px border (border border-slate-200/80)',
    `Actual: ${gpsClasses}`
);

// Verify aspect-[3/4]
assert(photoClasses.includes('aspect-[3/4]'), 'photoPreviewCard has aspect-[3/4]');
assert(gpsClasses.includes('aspect-[3/4]'), 'gpsSectionCard has aspect-[3/4]');

// Verify max-h-[30dvh]
assert(photoClasses.includes('max-h-[30dvh]'), 'photoPreviewCard has max-h-[30dvh]');
assert(gpsClasses.includes('max-h-[30dvh]'), 'gpsSectionCard has max-h-[30dvh]');

// Verify rounded-2xl
assert(photoClasses.includes('rounded-2xl'), 'photoPreviewCard has rounded-2xl');
assert(gpsClasses.includes('rounded-2xl'), 'gpsSectionCard has rounded-2xl');

// Verify Header Bar bg-[#F1F3F5] and NOT dark:bg-slate-800
const headerSnippetMatch = htmlContent.match(/<div[^>]*id=["']gpsSectionCard["'][\s\S]*?<!-- 1\. Header Bar[^\n]*\n\s*<div[^>]*class=["']([^"']+)["']/i);
assert(headerSnippetMatch !== null, 'gpsSectionCard Header element extracted');
const headerClasses = headerSnippetMatch ? headerSnippetMatch[1] : '';

assert(
    headerClasses.includes('bg-[#F1F3F5]'),
    'gpsSectionCard Header has light gray bg-[#F1F3F5]',
    `Actual: ${headerClasses}`
);
assert(
    !headerClasses.includes('dark:bg-slate-800'),
    'gpsSectionCard Header does NOT have dark:bg-slate-800 (preserves clean light look)',
    `Actual: ${headerClasses}`
);

// Verify Shutter Refresh Button Overlay Position: bottom-2.5 inset-x-0
const shutterOverlayMatch = htmlContent.match(/<!-- 3\. Shutter-Style Floating Refresh Button[^\n]*\n\s*<div[^>]*class=["']([^"']+)["']/i);
assert(shutterOverlayMatch !== null, 'Floating shutter refresh button overlay extracted');
const shutterClasses = shutterOverlayMatch ? shutterOverlayMatch[1] : '';

assert(
    shutterClasses.includes('absolute bottom-2.5 inset-x-0'),
    'Floating shutter refresh button positioned at absolute bottom-2.5 inset-x-0',
    `Actual: ${shutterClasses}`
);

// Verify NO generic remark input ("ช่องหมายเหตุ") on the main screen
const mainCheckinSection = htmlContent.split('<!-- Cockpit Split 2-Column Grid')[1]?.split('<!-- Shift Selection Card')[0] || '';
assert(
    !mainCheckinSection.includes('ช่องหมายเหตุ'),
    'No generic remark input ("ช่องหมายเหตุ") on main checkin screen'
);

// -----------------------------------------------------------------------------
// 3. Controller Integration Check (CheckinController.js)
// -----------------------------------------------------------------------------
console.log('\n--- 3. CONTROLLER INTEGRATION & LOGIC CHECK ---');
const controllerPath = path.join(projectRoot, 'assets/js/controllers/CheckinController.js');
assert(fs.existsSync(controllerPath), 'CheckinController.js exists');

const controllerContent = fs.readFileSync(controllerPath, 'utf8');

// Verify private method #renderInlineGpsMap(lat, lng)
assert(
    controllerContent.includes('#renderInlineGpsMap(lat, lng)'),
    'CheckinController defines private method #renderInlineGpsMap(lat, lng)'
);

// Verify #renderInlineGpsMap invocation inside #initGpsLocation
assert(
    controllerContent.includes('this.#renderInlineGpsMap(lat, lng);'),
    'CheckinController calls this.#renderInlineGpsMap(lat, lng) during GPS initialization'
);

// Verify #btnRefreshGps click handler with spinner animation
assert(
    controllerContent.includes("document.getElementById('btnRefreshGps')?.addEventListener('click'") &&
    controllerContent.includes("spinner?.classList.add('fa-spin')") &&
    controllerContent.includes("spinner?.classList.remove('fa-spin')"),
    '#btnRefreshGps click handler animates gpsRefreshSpinnerIcon with fa-spin'
);

// Verify Leaflet map markers: user red marker, office blue marker, radius circle
assert(
    controllerContent.includes('custom-pin-red') &&
    controllerContent.includes('custom-pin-blue') &&
    controllerContent.includes('L.circle'),
    'Leaflet map includes dual custom markers (red for user, blue for office) and geofence circle'
);

// Verify resize invalidation
assert(
    controllerContent.includes("window.addEventListener('resize'") &&
    controllerContent.includes('this.inlineGpsMap?.invalidateSize()'),
    'CheckinController handles window resize to invalidate Leaflet map size'
);

// Syntax verification using node --check
try {
    execSync(`node --check "${controllerPath}"`, { stdio: 'pipe' });
    assert(true, 'CheckinController.js passes syntax check (node --check)');
} catch (err) {
    assert(false, 'CheckinController.js passes syntax check (node --check)', err.message);
}

// -----------------------------------------------------------------------------
// 4. AST Synchronization Check
// -----------------------------------------------------------------------------
console.log('\n--- 4. AST MAPPER SYNCHRONIZATION CHECK ---');
try {
    const astOutput = execSync(`node ./.ai_map/vscode_ast_mapper.mjs`, { cwd: projectRoot, encoding: 'utf8' });
    assert(astOutput.includes('Indexed') && astOutput.includes('symbols'), 'AST mapper executed successfully', astOutput.trim());
} catch (err) {
    assert(false, 'AST mapper executed successfully', err.message);
}

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log(`VERDICT: ${failCount === 0 ? 'ALL CHECKS PASSED (PASS)' : 'CHECKS FAILED (FAIL)'}`);
console.log('====================================================');

if (failCount > 0) {
    process.exit(1);
}
