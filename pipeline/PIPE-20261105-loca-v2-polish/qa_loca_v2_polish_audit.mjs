import fs from 'fs';

const html = fs.readFileSync('checkin.html', 'utf8');

const tests = [];

function test(name, pass, details = '') {
  tests.push({ name, pass, details });
  console.log((pass ? '✅ [PASS] ' : '❌ [FAIL] ') + name + (details ? ' (' + details + ')' : ''));
}

console.log('======================================================================');
console.log('🧪 QA Polish Audit: Programmatic Checklist Verification');
console.log('Task: PIPE-20261105-loca-v2-polish | Branch: Loca-V2');
console.log('======================================================================\n');

// 1.1 Viewport meta
const viewportMatch = html.match(/<meta\s+name=["']viewport["'][^>]*>/i);
const hasViewportFit = viewportMatch && viewportMatch[0].includes('viewport-fit=cover');
test('1.1 <meta name="viewport"> includes viewport-fit=cover', hasViewportFit, viewportMatch ? viewportMatch[0].trim() : 'Not found');

// 1.2 CSS text-size-adjust & touch-action
const hasTextAdjustWebkit = html.includes('-webkit-text-size-adjust: 100% !important;');
const hasTextAdjustStd = html.includes('text-size-adjust: 100% !important;');
const hasTouchAction = html.includes('touch-action: pan-y;');
test('1.2 CSS contains -webkit-text-size-adjust: 100% !important;', hasTextAdjustWebkit);
test('1.2 CSS contains text-size-adjust: 100% !important;', hasTextAdjustStd);
test('1.2 CSS contains touch-action: pan-y;', hasTouchAction);

// 1.3 #btnMobileHistoryMenu
const menuBtnMatch = html.match(/<button\s+id=["']btnMobileHistoryMenu["'][^>]*>([\s\S]*?)<\/button>/i);
const hasMenuBtn = !!menuBtnMatch;
const hasEmeraldBg = menuBtnMatch && menuBtnMatch[0].includes('bg-[#00744B]');
const hasWhiteIcon = menuBtnMatch && /fa-bars\s+text-lg\s+text-white/i.test(menuBtnMatch[1]);
test('1.3 #btnMobileHistoryMenu exists', hasMenuBtn);
test('1.3 #btnMobileHistoryMenu has solid emerald background bg-[#00744B]', hasEmeraldBg);
test('1.3 #btnMobileHistoryMenu has white icon with high contrast', hasWhiteIcon);

// 1.4 #gpsSectionCard Header
const gpsCardMatch = html.match(/<div\s+id=["']gpsSectionCard["'][\s\S]*?<\/div>\s*<\/div>/i);
const hasGpsCard = !!gpsCardMatch;
const hasSkyGradientBanner = gpsCardMatch && /bg-gradient-to-r\s+from-sky-600\s+to-\[#0971CE\]/i.test(gpsCardMatch[0]);
const hasGpsHeaderText = gpsCardMatch && /พิกัด \(GPS\)/.test(gpsCardMatch[0]);
test('1.4 #gpsSectionCard exists', hasGpsCard);
test('1.4 #gpsSectionCard has colored top header banner (gradient sky)', hasSkyGradientBanner);
test('1.4 #gpsSectionCard header has text "พิกัด (GPS)"', hasGpsHeaderText);

// 1.5 GPS Action buttons in 2 separate rows full width
const refreshBtnMatch = html.match(/<button[^>]*id=["']btnRefreshGps["'][^>]*>([\s\S]*?)<\/button>/i);
const viewMapBtnMatch = html.match(/<button[^>]*id=["']btnViewGpsMapModal["'][^>]*>([\s\S]*?)<\/button>/i);

const refreshIsFullWidth = refreshBtnMatch && refreshBtnMatch[0].includes('w-full');
const refreshTextCorrect = refreshBtnMatch && /ค้นหาพิกัดใหม่/.test(refreshBtnMatch[1]);
const viewMapIsFullWidth = viewMapBtnMatch && viewMapBtnMatch[0].includes('w-full');
const viewMapTextCorrect = viewMapBtnMatch && /ดูแผนที่/.test(viewMapBtnMatch[1]);

// Check they are in separate rows (space-y container rather than grid-cols-2)
const actionsContainer = html.match(/<!-- Action buttons:[^>]*-->\s*<div\s+class=["']([^"']*)["']>/i);
const isSeparateRows = actionsContainer && actionsContainer[1].includes('space-y-1.5');

test('1.5 #btnRefreshGps has w-full and text ค้นหาพิกัดใหม่', refreshIsFullWidth && refreshTextCorrect);
test('1.5 #btnViewGpsMapModal has w-full and text ดูแผนที่', viewMapIsFullWidth && viewMapTextCorrect);
test('1.5 Action buttons container stacks buttons vertically in separate rows (space-y)', isSeparateRows);

// 1.6 DOM IDs intact
const requiredIds = [
  'btnRefreshGps',
  'btnViewGpsMapModal',
  'gpsLocationNameText',
  'gpsCoordsText',
  'gpsRequirementBadge',
  'btnMobileHistoryMenu',
  'btnModeOnsite',
  'btnModeOffsite',
  'photoPreviewCard',
  'btnSubmitCheckinMain'
];
requiredIds.forEach(id => {
  const exists = html.includes('id="' + id + '"');
  test('1.6 DOM ID intact: #' + id, exists);
});

// 1.7 Mode buttons text
const onsiteBtnMatch = html.match(/<button[^>]*id=["']btnModeOnsite["'][^>]*>([\s\S]*?)<\/button>/i);
const offsiteBtnMatch = html.match(/<button[^>]*id=["']btnModeOffsite["'][^>]*>([\s\S]*?)<\/button>/i);

const onsiteHasCleanText = onsiteBtnMatch && onsiteBtnMatch[1].includes('ในสถานที่') && !onsiteBtnMatch[1].includes('(Onsite)');
const offsiteHasCleanText = offsiteBtnMatch && offsiteBtnMatch[1].includes('นอกสถานที่') && !offsiteBtnMatch[1].includes('(Offsite)');
test('1.7 #btnModeOnsite text is strictly "ในสถานที่" (without English suffix)', onsiteHasCleanText);
test('1.7 #btnModeOffsite text is strictly "นอกสถานที่" (without English suffix)', offsiteHasCleanText);

const total = tests.length;
const passed = tests.filter(t => t.pass).length;
console.log('\n======================================================================');
console.log(`📊 Audit Summary: Total ${total} | Passed: ${passed} | Failed: ${total - passed}`);
console.log('======================================================================');

if (passed !== total) process.exit(1);
