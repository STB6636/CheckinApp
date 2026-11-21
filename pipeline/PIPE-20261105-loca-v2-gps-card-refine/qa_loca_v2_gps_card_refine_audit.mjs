import fs from 'fs';
import path from 'path';

console.log('======================================================================');
console.log('🧪 Starting QA Audit: PIPE-20261105-loca-v2-gps-card-refine');
console.log('Task: GPS Card UI Refinement in checkin.html | Branch: Loca-V2');
console.log('======================================================================\n');

const checkinPath = path.resolve('checkin.html');
const htmlContent = fs.readFileSync(checkinPath, 'utf8');

let passCount = 0;
let failCount = 0;

function test(description, fn) {
    try {
        const result = fn();
        if (result === true) {
            console.log(`  ✅ [PASS] ${description}`);
            passCount++;
        } else {
            console.log(`  ❌ [FAIL] ${description}: ${result}`);
            failCount++;
        }
    } catch (e) {
        console.log(`  ❌ [FAIL] ${description}: Exception ${e.message}`);
        failCount++;
    }
}

const gpsStart = htmlContent.indexOf('id="gpsSectionCard"');
const gpsEnd = htmlContent.indexOf('<!-- Work Mode Segmented Switcher');
const gpsSnippet = htmlContent.slice(gpsStart, gpsEnd);

console.log('▶️ Group 1: GPS Card Header Compliance');
test('GPS Card exists and has aspect-[3/4] & max-h-[30dvh]', () => {
    if (gpsStart === -1) return '#gpsSectionCard not found';
    if (!gpsSnippet.includes('aspect-[3/4]')) return 'missing aspect-[3/4]';
    if (!gpsSnippet.includes('max-h-[30dvh]')) return 'missing max-h-[30dvh]';
    return true;
});

test('Header matches rounded box with icon and text "พิกัด (GPS)" in amber tone', () => {
    if (!gpsSnippet.includes('fa-location-dot')) return 'missing location icon';
    if (!gpsSnippet.includes('พิกัด (GPS)')) return 'missing header text พิกัด (GPS)';
    if (!gpsSnippet.includes('bg-amber-50') || !gpsSnippet.includes('border-amber-200')) {
        return 'header missing amber background or border';
    }
    if (!gpsSnippet.includes('text-amber-950') && !gpsSnippet.includes('text-amber-900')) {
        return 'header text missing amber tone';
    }
    return true;
});

test('Absolutely NO visible badge on header (#gpsRequirementBadge is hidden)', () => {
    const badgeMatch = gpsSnippet.match(/<span[^>]*id=["']gpsRequirementBadge["'][^>]*class=["']([^"']*)["'][^>]*><\/span>/);
    if (!badgeMatch) return '#gpsRequirementBadge not found or not empty span';
    if (!badgeMatch[1].includes('hidden')) return '#gpsRequirementBadge missing hidden class';
    if (gpsSnippet.includes('บันทึกพิกัดจริง')) return 'contains visible text บันทึกพิกัดจริง';
    return true;
});

console.log('\n▶️ Group 2: Middle Location & Coords Box Compliance');
test('Location box matches status card pattern with amber-50 bg, amber border, dark amber text', () => {
    if (!gpsSnippet.includes('bg-amber-50') || !gpsSnippet.includes('border-amber-300')) {
        return 'missing amber-50 background or amber-300 border';
    }
    if (!gpsSnippet.includes('text-amber-950')) {
        return 'missing text-amber-950 for location text';
    }
    return true;
});

test('Coordinates (#gpsCoordsText) has font-mono, font-bold, readable amber tone', () => {
    if (!gpsSnippet.includes('id="gpsCoordsText"')) return 'missing #gpsCoordsText';
    if (!gpsSnippet.includes('font-mono') || !gpsSnippet.includes('font-bold')) {
        return 'coords missing font-mono or font-bold';
    }
    if (!gpsSnippet.includes('text-amber-800')) {
        return 'coords missing readable text-amber-800';
    }
    return true;
});

console.log('\n▶️ Group 3: Action Buttons Docked at Bottom');
test('Buttons container is docked at bottom edge with mt-auto', () => {
    if (!gpsSnippet.includes('mt-auto')) return 'buttons container missing mt-auto';
    return true;
});

test('#btnRefreshGps has solid amber-500 styling with white bold text "ค้นหาพิกัดใหม่"', () => {
    const btnRefreshMatch = gpsSnippet.match(/<button[^>]*id=["']btnRefreshGps["'][^>]*>([\s\S]*?)<\/button>/);
    if (!btnRefreshMatch) return '#btnRefreshGps button not found';
    const btnTag = btnRefreshMatch[0];
    if (!btnTag.includes('bg-amber-500')) return '#btnRefreshGps missing bg-amber-500';
    if (!btnTag.includes('text-white')) return '#btnRefreshGps missing text-white';
    if (!btnRefreshMatch[1].includes('ค้นหาพิกัดใหม่')) return '#btnRefreshGps missing text ค้นหาพิกัดใหม่';
    return true;
});

test('#btnViewGpsMapModal has soft amber styling with text "ดูแผนที่"', () => {
    const btnMapMatch = gpsSnippet.match(/<button[^>]*id=["']btnViewGpsMapModal["'][^>]*>([\s\S]*?)<\/button>/);
    if (!btnMapMatch) return '#btnViewGpsMapModal button not found';
    const btnTag = btnMapMatch[0];
    if (!btnTag.includes('bg-amber-50')) return '#btnViewGpsMapModal missing bg-amber-50';
    if (!btnTag.includes('border-amber-300')) return '#btnViewGpsMapModal missing border-amber-300';
    if (!btnMapMatch[1].includes('ดูแผนที่')) return '#btnViewGpsMapModal missing text ดูแผนที่';
    return true;
});

console.log('\n▶️ Group 4: DOM ID Integrity & Legacy Elements Preservation');
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

for (const id of requiredIds) {
    test(`DOM ID intact: #${id}`, () => {
        if (!gpsSnippet.includes(`id="${id}"`)) return `missing #${id} in gpsSnippet`;
        return true;
    });
}

console.log('\n======================================================================');
console.log(`📊 Audit Summary: Total ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);
console.log('======================================================================');

if (failCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
