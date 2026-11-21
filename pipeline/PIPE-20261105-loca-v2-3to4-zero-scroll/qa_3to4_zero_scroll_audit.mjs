import fs from 'fs';
import path from 'path';

const checkinHtmlPath = path.resolve('checkin.html');
const controllerJsPath = path.resolve('assets/js/controllers/CheckinController.js');

const htmlContent = fs.readFileSync(checkinHtmlPath, 'utf8');
const jsContent = fs.readFileSync(controllerJsPath, 'utf8');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, assertionFn) {
    totalTests++;
    try {
        const result = assertionFn();
        if (result === true || result === undefined) {
            console.log(`  ✅ [PASS] ${name}`);
            passedTests++;
        } else {
            console.error(`  ❌ [FAIL] ${name}: ${result}`);
            failedTests++;
        }
    } catch (err) {
        console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
        failedTests++;
    }
}

console.log('======================================================================');
console.log('🧪 Starting QA Audit: PIPE-20261105-loca-v2-3to4-zero-scroll');
console.log('======================================================================\n');

console.log('▶️ Group 1: 3:4 Aspect Ratio on Cockpit Split Cards');
test('#photoPreviewCard has aspect-[3/4] class', () => {
    const match = htmlContent.match(/id=["']photoPreviewCard["'][^>]*class=["']([^"']*)["']/);
    if (!match) return 'photoPreviewCard element not found';
    const classes = match[1];
    if (!classes.includes('aspect-[3/4]')) return `photoPreviewCard missing aspect-[3/4], found: ${classes}`;
    return true;
});

test('#gpsSectionCard has aspect-[3/4] class', () => {
    const match = htmlContent.match(/id=["']gpsSectionCard["'][^>]*class=["']([^"']*)["']/);
    if (!match) return 'gpsSectionCard element not found';
    const classes = match[1];
    if (!classes.includes('aspect-[3/4]')) return `gpsSectionCard missing aspect-[3/4], found: ${classes}`;
    return true;
});

test('#photoPreviewCard and #gpsSectionCard have max-h-[30dvh] for viewport safety', () => {
    const photoMatch = htmlContent.match(/id=["']photoPreviewCard["'][^>]*class=["']([^"']*)["']/);
    const gpsMatch = htmlContent.match(/id=["']gpsSectionCard["'][^>]*class=["']([^"']*)["']/);
    if (!photoMatch[1].includes('max-h-[30dvh]')) return 'photoPreviewCard missing max-h-[30dvh]';
    if (!gpsMatch[1].includes('max-h-[30dvh]')) return 'gpsSectionCard missing max-h-[30dvh]';
    return true;
});

console.log('\n▶️ Group 2: Photo Preview Classes & Layout');
test('#capturedPhotoPreview has class="hidden w-full h-full object-cover"', () => {
    const match = htmlContent.match(/<img[^>]*id=["']capturedPhotoPreview["'][^>]*class=["']([^"']*)["']/);
    if (!match) return 'capturedPhotoPreview element not found';
    const classes = match[1].trim();
    if (!classes.includes('hidden') || !classes.includes('w-full') || !classes.includes('h-full') || !classes.includes('object-cover')) {
        return `capturedPhotoPreview classes expected 'hidden w-full h-full object-cover', got: '${classes}'`;
    }
    return true;
});

console.log('\n▶️ Group 3: GPS Card Typography & Label Cleanup');
test('#gpsSectionCard has no visible "บันทึกพิกัดจริง"', () => {
    const gpsCardSection = htmlContent.slice(
        htmlContent.indexOf('id="gpsSectionCard"'),
        htmlContent.indexOf('<!-- Work Mode Segmented Switcher')
    );
    if (gpsCardSection.includes('>บันทึกพิกัดจริง<') || gpsCardSection.includes('บันทึกพิกัดจริง')) {
        return 'Found "บันทึกพิกัดจริง" text in gpsSectionCard!';
    }
    return true;
});

test('#gpsRequirementBadge is preserved with class="hidden"', () => {
    const match = htmlContent.match(/<span[^>]*id=["']gpsRequirementBadge["'][^>]*class=["']([^"']*)["'][^>]*><\/span>/);
    if (!match) return 'gpsRequirementBadge not found or not empty span';
    if (!match[1].includes('hidden')) return 'gpsRequirementBadge not hidden';
    return true;
});

test('"พิกัด:" and "สถานที่:" labels are removed from GPS card', () => {
    const gpsCardSection = htmlContent.slice(
        htmlContent.indexOf('id="gpsSectionCard"'),
        htmlContent.indexOf('<!-- Work Mode Segmented Switcher')
    );
    if (gpsCardSection.includes('>พิกัด:<') || gpsCardSection.includes('พิกัด:')) {
        return 'Found "พิกัด:" label in gpsSectionCard';
    }
    if (gpsCardSection.includes('>สถานที่:<') || gpsCardSection.includes('สถานที่:')) {
        return 'Found "สถานที่:" label in gpsSectionCard';
    }
    return true;
});

test('Location name (#gpsLocationNameText) is prominent at top, coordinates (#gpsCoordsText) subtle mono at bottom', () => {
    const gpsCardSection = htmlContent.slice(
        htmlContent.indexOf('id="gpsSectionCard"'),
        htmlContent.indexOf('<!-- Work Mode Segmented Switcher')
    );
    const locIdx = gpsCardSection.indexOf('id="gpsLocationNameText"');
    const coordsIdx = gpsCardSection.indexOf('id="gpsCoordsText"');
    if (locIdx === -1) return 'gpsLocationNameText not found';
    if (coordsIdx === -1) return 'gpsCoordsText not found';
    if (locIdx >= coordsIdx) return 'gpsLocationNameText is not placed before gpsCoordsText';

    // Verify prominent styling on Location Name
    const locSnippet = gpsCardSection.slice(locIdx - 50, locIdx + 120);
    if (!locSnippet.includes('font-extrabold')) return 'gpsLocationNameText missing font-extrabold';

    // Verify subtle mono styling on coordinates (on parent container)
    const coordsSnippet = gpsCardSection.slice(coordsIdx - 200, coordsIdx + 100);
    if (!coordsSnippet.includes('font-mono')) return 'gpsCoordsText missing font-mono';
    return true;
});

console.log('\n▶️ Group 4: Work Mode Header & Switcher Layout');
test('Work Mode card header "รูปแบบการปฏิบัติงาน *" is removed', () => {
    const workModeSection = htmlContent.slice(
        htmlContent.indexOf('<!-- Work Mode Segmented Switcher'),
        htmlContent.indexOf('<!-- Offsite Reason Card')
    );
    if (workModeSection.includes('รูปแบบการปฏิบัติงาน *')) {
        return 'Found "รูปแบบการปฏิบัติงาน *" header text in work mode card';
    }
    return true;
});

test('Hidden spans #modeContextBadge and #modeBadge are preserved', () => {
    const workModeSection = htmlContent.slice(
        htmlContent.indexOf('<!-- Work Mode Segmented Switcher'),
        htmlContent.indexOf('<!-- Offsite Reason Card')
    );
    if (!workModeSection.includes('id="modeContextBadge"')) return 'modeContextBadge not found';
    if (!workModeSection.includes('id="modeBadge"')) return 'modeBadge not found';

    // Verify they are hidden
    const badge1 = workModeSection.match(/id=["']modeContextBadge["'][^>]*class=["']([^"']*)["']/);
    const badge2 = workModeSection.match(/id=["']modeBadge["'][^>]*class=["']([^"']*)["']/);
    if (!badge1 || !badge1[1].includes('hidden')) return 'modeContextBadge is not hidden';
    if (!badge2 || !badge2[1].includes('hidden')) return 'modeBadge is not hidden';
    return true;
});

test('Mode switcher [ ในสถานที่ (Onsite) ] / [ นอกสถานที่ (Offsite) ] is top visible element', () => {
    const workModeSection = htmlContent.slice(
        htmlContent.indexOf('<!-- Work Mode Segmented Switcher'),
        htmlContent.indexOf('<!-- Offsite Reason Card')
    );
    const onsiteButtonIdx = workModeSection.indexOf('<button type="button" id="btnModeOnsite"');
    const offsiteIdx = workModeSection.indexOf('id="btnModeOffsite"');
    if (onsiteButtonIdx === -1 || offsiteIdx === -1) return 'Mode switcher buttons not found';

    // Check that there is no visible text before btnModeOnsite in workModeSection
    const beforeOnsite = workModeSection.slice(0, onsiteButtonIdx);
    // Remove tags and comments
    const visibleText = beforeOnsite
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<span[^>]*class=["'][^"']*hidden[^"']*["'][^>]*>[\s\S]*?<\/span>/g, '')
        .replace(/<[^>]+>/g, '')
        .trim();
    if (visibleText.length > 0) {
        return `Unexpected visible text before switcher: "${visibleText}"`;
    }
    return true;
});

console.log('\n▶️ Group 5: Controller Logic for #checkinActionCard OT & Normal Hours');
test('#checkinActionCard is conditionally toggled in CheckinController', () => {
    if (!jsContent.includes("document.getElementById('checkinActionCard')")) {
        return 'CheckinController does not reference checkinActionCard';
    }
    if (!jsContent.includes("actionCard.classList.remove('hidden')")) {
        return 'CheckinController missing actionCard.classList.remove("hidden")';
    }
    if (!jsContent.includes("actionCard.classList.add('hidden')")) {
        return 'CheckinController missing actionCard.classList.add("hidden")';
    }
    return true;
});

test('Logic checks for hasActiveOtShifts and (mustUseOvertimeWindow || isNormalHoursDisabledNow || hasCompletedRegularToday)', () => {
    const targetBlock = jsContent.match(/const actionCard = document\.getElementById\('checkinActionCard'\);([\s\S]*?)candidateShifts/);
    if (!targetBlock) return 'Target block not found in CheckinController';
    const blockCode = targetBlock[1];
    if (!blockCode.includes('hasActiveOtShifts')) return 'Missing hasActiveOtShifts check';
    if (!blockCode.includes('mustUseOvertimeWindow')) return 'Missing mustUseOvertimeWindow check';
    if (!blockCode.includes('isNormalHoursDisabledNow')) return 'Missing isNormalHoursDisabledNow check';
    if (!blockCode.includes('hasCompletedRegularToday')) return 'Missing hasCompletedRegularToday check';
    return true;
});

console.log('\n▶️ Group 6: DOM ID Preservation & Compatibility');
const requiredIds = [
    'photoPreviewCard',
    'photoPlaceholder',
    'capturedPhotoPreview',
    'cameraCaptureCanvas',
    'btnCenterPhotoOverlay',
    'centerPhotoIcon',
    'photoStatusBadgeText',
    'cameraFallbackFileInput',
    'gpsSectionCard',
    'gpsRequirementBadge',
    'gpsLocationNameText',
    'gpsLocationName',
    'gpsCoordsText',
    'btnRefreshGps',
    'btnViewGpsMapModal',
    'modeContextBadge',
    'modeBadge',
    'btnModeOnsite',
    'btnModeOffsite',
    'checkinActionCard',
    'btnSubmitCheckinMain',
    'modalFullscreenCamera',
    'modalViewGpsMap'
];

requiredIds.forEach(id => {
    test(`Critical DOM ID preserved: #${id}`, () => {
        if (!htmlContent.includes(`id="${id}"`)) {
            return `Missing DOM ID: ${id}`;
        }
        return true;
    });
});

console.log('\n======================================================================');
console.log(`📊 Audit Summary: Total ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('======================================================================');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
