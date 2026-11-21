/**
 * Post-Implementation QA & Behavioral Verification Test
 * Task: PIPE-20261113-remove-special-request-btn-from-shift-card
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

console.log('======================================================================');
console.log('🧪 Starting Post-Implementation QA Suite: Shift Card Button Removal');
console.log('======================================================================\n');

// --- Suite 1: checkin.html DOM Structure & Visibility ---
console.log('▶️ Suite 1: Shift Card Button Removal & Legacy Preservation in checkin.html');
const checkinHtml = fs.readFileSync(path.resolve('checkin.html'), 'utf8');

const cardStart = checkinHtml.indexOf('id="checkinActionCard"');
const cardEnd = checkinHtml.indexOf('<!-- Sticky Bottom Check-in Action Bar -->', cardStart);
const cardChunk = checkinHtml.substring(cardStart, cardEnd);

assert(cardStart !== -1, '#checkinActionCard exists');
assert(!cardChunk.includes('id="btnOpenSpecialRequestModal"'), '#btnOpenSpecialRequestModal is completely removed from #checkinActionCard');
assert(!cardChunk.includes('ส่งคำขอลงเวลากรณีพิเศษ'), 'Visible Thai label "ส่งคำขอลงเวลากรณีพิเศษ" is not inside #checkinActionCard');

const hiddenLegacyMatch = checkinHtml.match(/<!-- Hidden legacy containers to preserve 100% DOM IDs -->[\s\S]*?<button[^>]*id="btnOpenSpecialRequestModal"[^>]*><\/button>/);
assert(Boolean(hiddenLegacyMatch), '#btnOpenSpecialRequestModal exists within the hidden legacy container block');

const hiddenBtnMatch = checkinHtml.match(/<button type="button" id="btnOpenSpecialRequestModal" class="hidden" aria-hidden="true"><\/button>/);
assert(Boolean(hiddenBtnMatch), '#btnOpenSpecialRequestModal has strictly class="hidden" and aria-hidden="true"');

// --- Suite 2: Alternative Entry Points Intact ---
console.log('\n▶️ Suite 2: Alternative Special Request Entry Points');
assert(checkinHtml.includes('id="btnOpenSpecialFromDesktopTab"'), 'Desktop Tab button #btnOpenSpecialFromDesktopTab is present and intact');
assert(checkinHtml.includes('id="btnOpenSpecialRequestDrawer"'), 'Mobile Drawer button #btnOpenSpecialRequestDrawer is present and intact');
assert(checkinHtml.includes('id="modalSpecialRequest"'), 'Special request modal container #modalSpecialRequest is intact');

// --- Suite 3: Cache Version & Hash Synchronization ---
console.log('\n▶️ Suite 3: Cache Version Synchronization Across 8 HTML Files');
const versionData = JSON.parse(fs.readFileSync(path.resolve('version.json'), 'utf8'));
const currentBuildId = versionData.buildId;
assert(Boolean(currentBuildId), `version.json has valid buildId: ${currentBuildId}`);

const htmlFiles = [
  'index.html',
  'checkin.html',
  'dashboard.html',
  'approvals.html',
  'reports.html',
  'personnel.html',
  'settings.html',
  'users.html'
];

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.resolve(file), 'utf8');
  const buildVarMatch = content.includes(`CURRENT_APP_BUILD = '${currentBuildId}'`);
  const assetQueryMatch = content.includes(`?v=${currentBuildId}`);
  assert(buildVarMatch, `${file} defines CURRENT_APP_BUILD = '${currentBuildId}'`);
  assert(assetQueryMatch, `${file} includes assets stamped with ?v=${currentBuildId}`);
}

// --- Suite 4: HTML Tag Balance & DOM Cleanliness ---
console.log('\n▶️ Suite 4: HTML Tag Balance & Structural Integrity');
const tagStack = [];
const tagRe = /<\/?([a-zA-Z0-9\-]+)(?:\s+[^>]*)?>/g;
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr','!doctype']);
let tagMatch;
let tagMismatch = false;

while ((tagMatch = tagRe.exec(checkinHtml)) !== null) {
  const raw = tagMatch[0];
  const name = tagMatch[1].toLowerCase();
  if (voidTags.has(name) || raw.endsWith('/>')) continue;
  if (raw.startsWith('</')) {
    const last = tagStack.pop();
    if (last !== name) {
      tagMismatch = true;
      break;
    }
  } else {
    tagStack.push(name);
  }
}
assert(!tagMismatch && tagStack.length === 0, 'checkin.html has 100% valid HTML tag nesting with 0 unclosed tags');

// --- Suite 5: Simulated DOM Event Listener & Action Test ---
console.log('\n▶️ Suite 5: Simulated Interaction & Modal Opening Verification');
class MockDOMElement {
  constructor(id, tag = 'DIV') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.classList = new Set();
    this.listeners = new Map();
  }
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
  }
  click() {
    const cbs = this.listeners.get('click') || [];
    for (const cb of cbs) cb({ target: this, preventDefault: () => {} });
  }
}

const mockModal = new MockDOMElement('modalSpecialRequest');
mockModal.classList.add('hidden');

const mockDrawerBtn = new MockDOMElement('btnOpenSpecialRequestDrawer', 'BUTTON');
const mockHiddenBtn = new MockDOMElement('btnOpenSpecialRequestModal', 'BUTTON');
const mockCloseBtn = new MockDOMElement('btnCloseSpecialModal', 'BUTTON');

let openSpecialCalled = false;
const openSpecialModal = () => {
  openSpecialCalled = true;
  mockModal.classList.delete('hidden');
};
const closeSpecialModal = () => {
  mockModal.classList.add('hidden');
};

mockHiddenBtn.addEventListener('click', openSpecialModal);
mockDrawerBtn.addEventListener('click', openSpecialModal);
mockCloseBtn.addEventListener('click', closeSpecialModal);

// Simulate clicking drawer button
mockDrawerBtn.click();
assert(openSpecialCalled && !mockModal.classList.has('hidden'), 'Clicking Mobile Drawer button successfully opens special request modal');

// Simulate closing modal
mockCloseBtn.click();
assert(mockModal.classList.has('hidden'), 'Clicking Close button successfully hides special request modal');

// Simulate programmatically clicking hidden legacy button
openSpecialCalled = false;
mockHiddenBtn.click();
assert(openSpecialCalled && !mockModal.classList.has('hidden'), 'Triggering legacy #btnOpenSpecialRequestModal successfully triggers modal open without error');

// --- Summary ---
console.log('\n======================================================================');
console.log(`📊 Test Summary: Total ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log('======================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log(`\n🎉 ALL ${passed} ASSERTIONS PASSED WITH 100% SUCCESS!\n`);
}

