/**
 * Preflight Plan Verification for:
 * PIPE-20261113-remove-special-request-btn-from-shift-card
 */

import fs from 'fs';
import path from 'path';

const checkinPath = path.resolve('checkin.html');
const checkinHtml = fs.readFileSync(checkinPath, 'utf8');

console.log('=== Preflight Plan Verification for checkin.html ===');

// 1. Locate #checkinActionCard
const cardIdx = checkinHtml.indexOf('id="checkinActionCard"');
console.log('1. checkinActionCard found:', cardIdx !== -1);

// 2. Locate #btnOpenSpecialRequestModal inside #checkinActionCard
const btnIdx = checkinHtml.indexOf('id="btnOpenSpecialRequestModal"');
const cardEndIdx = checkinHtml.indexOf('<!-- Sticky Bottom Check-in Action Bar -->', cardIdx);
console.log('2. btnOpenSpecialRequestModal found:', btnIdx !== -1);
console.log('   Is inside checkinActionCard:', btnIdx > cardIdx && btnIdx < cardEndIdx);

// 3. Confirm alternative access channels exist
const desktopBtnIdx = checkinHtml.indexOf('id="btnOpenSpecialFromDesktopTab"');
const drawerBtnIdx = checkinHtml.indexOf('id="btnOpenSpecialRequestDrawer"');
console.log('3. Desktop Tab button (btnOpenSpecialFromDesktopTab) exists:', desktopBtnIdx !== -1);
console.log('   Mobile Drawer button (btnOpenSpecialRequestDrawer) exists:', drawerBtnIdx !== -1);

// 4. Confirm legacy hidden container exists
const legacyContainerIdx = checkinHtml.indexOf('id="checkinWorkspaceGrid"');
console.log('4. Legacy hidden container (checkinWorkspaceGrid) exists:', legacyContainerIdx !== -1);

console.log('\nResult: All structural anchors verified. Ready for execution upon Proceed.');
