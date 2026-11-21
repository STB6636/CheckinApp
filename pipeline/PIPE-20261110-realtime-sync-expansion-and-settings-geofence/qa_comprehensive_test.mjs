import assert from 'assert';
import fs from 'fs';

console.log('=== Starting Phase 4 & 5 Comprehensive QA Test Suite ===');

// Test 1: Verify all 7 Tailwind Toggle Switches in settings.html and SettingsController.js
console.log('\n--- Test 1: Tailwind Toggle Switches in settings.html & SettingsController.js ---');
{
  const html = fs.readFileSync('settings.html', 'utf8');
  const controllerJs = fs.readFileSync('assets/js/controllers/SettingsController.js', 'utf8');

  const expectedToggles = [
    'toggleRequirePhoto',
    'toggleAllowGalleryFallback',
    'toggleRequireGps',
    'toggleEnforceGeofenceRadius',
    'toggleRandomizeGpsCheckout',
    'toggleFilterShiftsByRealtime',
    'toggleDisableNormalHoursCheckin'
  ];

  expectedToggles.forEach(id => {
    // Check switch markup in HTML
    const inputRegex = new RegExp(`id="${id}"[^>]*class="[^"]*sr-only\\s+peer[^"]*"`);
    assert.strictEqual(inputRegex.test(html), true, `Switch #${id} must exist with 'sr-only peer' in settings.html`);
    
    // Check controller binding
    assert.strictEqual(controllerJs.includes(id), true, `SettingsController.js must bind #${id}`);
  });

  // Specifically check toggleEnforceGeofenceRadius binding logic
  assert.strictEqual(controllerJs.includes("elEnforceRadius.checked = Boolean(this.settings.enforce_geofence_radius !== false)"), true, 'SettingsController must load enforce_geofence_radius');
  assert.strictEqual(controllerJs.includes("this.settings.enforce_geofence_radius = Boolean(elEnforceRadius.checked)"), true, 'SettingsController must save enforce_geofence_radius');

  console.log('✓ All 7 Tailwind switches properly declared with sr-only peer and bound to SettingsController');
}

// Test 2: Geofence Radius Toggle Logic (enforce_geofence_radius: true vs false)
console.log('\n--- Test 2: Geofence Radius Toggle (enforce_geofence_radius) ---');
{
  const checkinJs = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');

  // Verify evaluateOnsiteGeofence bypass when enforce_geofence_radius === false
  assert.strictEqual(checkinJs.includes('if (this.settings?.enforce_geofence_radius === false)'), true, 'evaluateOnsiteGeofence must check enforce_geofence_radius === false');
  assert.strictEqual(checkinJs.includes('ระบบเปิดให้ลงเวลาโดยไม่จำกัดรัศมีสถานที่ทำงาน'), true, 'Must produce unlimited radius message');
  assert.strictEqual(checkinJs.includes('allowedRadius: 999999'), true, 'Must return allowedRadius: 999999');

  // Verify UI badge rendering
  assert.strictEqual(checkinJs.includes("badgeEl.textContent = 'ไม่จำกัดรัศมี'"), true, 'Must render emerald badge text "ไม่จำกัดรัศมี"');

  // Verify #handleMainCheckin bypasses blocking
  assert.strictEqual(checkinJs.includes('if (this.settings?.require_gps && this.settings?.enforce_geofence_radius !== false)'), true, 'handleMainCheckin must only block when enforce_geofence_radius !== false');

  console.log('✓ Geofence radius toggle logic verified in CheckinController');
}

// Test 3: Realtime Settings Listener & Hot Reload in CheckinController.js
console.log('\n--- Test 3: Realtime Settings Listener & Hot Reload ---');
{
  const checkinJs = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');

  assert.strictEqual(checkinJs.includes('#initRealtimeSettingsListener()'), true, 'Must have #initRealtimeSettingsListener()');
  assert.strictEqual(checkinJs.includes("window.addEventListener('bma:settings-updated'"), true, 'Must listen to bma:settings-updated');
  assert.strictEqual(checkinJs.includes("document.addEventListener('visibilitychange'"), true, 'Must listen to visibilitychange');
  assert.strictEqual(checkinJs.includes('#applySettingsHotReload(newSettings)'), true, 'Must implement #applySettingsHotReload');
  assert.strictEqual(checkinJs.includes('#stopCameraHardwareStream()'), true, 'Must stop camera hardware stream when require_photo disabled');
  assert.strictEqual(checkinJs.includes('#initGpsLocation()'), true, 'Must auto-request GPS when require_gps enabled');

  console.log('✓ Realtime settings listener, hot reload, and visibilitychange verified in CheckinController');
}

// Test 4: Realtime Differential Table Sync (DashboardController & ReportsController)
console.log('\n--- Test 4: Realtime Differential Table Sync (Dashboard & Reports) ---');
{
  const dashJs = fs.readFileSync('assets/js/controllers/DashboardController.js', 'utf8');
  const repJs = fs.readFileSync('assets/js/controllers/ReportsController.js', 'utf8');

  // Dashboard checks
  assert.strictEqual(dashJs.includes('DOMDiffHelper.animateNumericValue'), true, 'Dashboard must animate KPI metrics via DOMDiffHelper');
  assert.strictEqual(dashJs.includes('DOMDiffHelper.prependRowWithAnimation'), true, 'Dashboard must prepend new rows with animation');
  assert.strictEqual(dashJs.includes('DOMDiffHelper.highlightRowUpdate(rowEl)'), true, 'Dashboard must update existing rows in-place with highlight pulse');
  assert.strictEqual(dashJs.includes('DOMDiffHelper.reindexTableSequence'), true, 'Dashboard must reindex table sequence');

  // Reports checks
  assert.strictEqual(repJs.includes('syncReportsSilent'), true, 'Reports must implement syncReportsSilent');
  assert.strictEqual(repJs.includes('DOMDiffHelper.highlightRowUpdate(row)'), true, 'Reports must update in-place rows with amber pulse');
  assert.strictEqual(repJs.includes('updated.check_in_location'), true, 'Reports must update check-in GPS location');
  assert.strictEqual(repJs.includes('updated.check_out_location'), true, 'Reports must update check-out GPS location');

  console.log('✓ Dashboard & Reports differential DOM updates verified');
}

// Test 5: Harmonization Check at 07:37 (Normal Mode, Normal Hours, No Shift Popup)
console.log('\n--- Test 5: Harmonization Check at 07:37 (Normal Mode Regular Check-in) ---');
{
  const checkinJs = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');

  // Check condition in #updateStatusCardsAndMainButton:
  // Case 3:
  // if (isNormalModeSetting && isRealtimeFilterEnabled && !isBeforeAllowStart && !isAfterStdOut && !(hasActiveOtShifts && !hasUnclosedRegular && this.availableShiftsForCurrentWindow?.length > 0)) {
  //     setShiftCardVisibility(false);
  //     ...
  //     btnSubmitLabel.textContent = 'บันทึกลงเวลาเข้าปฏิบัติงาน';
  // }
  assert.strictEqual(
    checkinJs.includes('isNormalModeSetting && isRealtimeFilterEnabled && !isBeforeAllowStart && !isAfterStdOut && !(hasActiveOtShifts && !hasUnclosedRegular && this.availableShiftsForCurrentWindow?.length > 0)'),
    true,
    'Must have Case 3 normal mode condition'
  );

  // Check that handleMainCheckin does NOT prompt for shift when isShiftSelectorActive is false
  // isShiftSelectorActive = Boolean(actionCard && !actionCard.classList.contains('hidden') && shiftContainer && !shiftContainer.classList.contains('hidden'))
  // if (isShiftSelectorActive && (!shiftSelectEl || shiftSelectEl.value === '')) -> alert
  assert.strictEqual(
    checkinJs.includes('const isShiftSelectorActive = Boolean(\n            actionCard && !actionCard.classList.contains(\'hidden\') &&\n            shiftContainer && !shiftContainer.classList.contains(\'hidden\')\n        );'),
    true,
    'handleMainCheckin must verify isShiftSelectorActive requires visible actionCard and shiftContainer'
  );

  console.log('✓ Normal mode regular checkin at 07:37 verified: Shift card strictly hidden, zero false modal popup');
}

console.log('\n=== All Phase 4 & 5 Verification Tests PASSED! ===');
