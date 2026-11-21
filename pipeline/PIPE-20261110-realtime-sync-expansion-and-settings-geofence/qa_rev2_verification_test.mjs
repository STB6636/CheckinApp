import assert from 'assert';
import fs from 'fs';

console.log('=== Starting Rev 2 Specific QA Verification Test Suite ===');

// Test 1: Single-Point Schema Binding (Config.SUPABASE_SCHEMA)
console.log('\n--- Test 1: Single-Point Schema Variable Binding ---');
{
  const dbServiceJs = fs.readFileSync('assets/js/core/DatabaseService.js', 'utf8');
  const appLayoutJs = fs.readFileSync('assets/js/components/AppLayout.js', 'utf8');
  const checkinJs = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');

  // DatabaseService checks
  assert.strictEqual(dbServiceJs.includes('static getActiveSchema()'), true, 'DatabaseService must define getActiveSchema()');
  assert.strictEqual(dbServiceJs.includes('Config.SUPABASE_SCHEMA'), true, 'DatabaseService must read Config.SUPABASE_SCHEMA');
  assert.strictEqual(dbServiceJs.includes('clientOptions.db = { schema: activeSchema };'), true, 'DatabaseService must set client db schema');

  // AppLayout checks
  assert.strictEqual(appLayoutJs.includes("const activeSchema = (typeof Config !== 'undefined' && Config.SUPABASE_SCHEMA) ? Config.SUPABASE_SCHEMA : 'public';"), true, 'AppLayout must read activeSchema from Config');
  assert.strictEqual(appLayoutJs.includes("client.channel(`bma_admin_realtime_${activeSchema}`)"), true, 'AppLayout must use activeSchema in channel name');
  assert.strictEqual(appLayoutJs.includes("schema: activeSchema, table: 'attendance_logs'"), true, 'AppLayout must use activeSchema in attendance_logs');
  assert.strictEqual(appLayoutJs.includes("schema: activeSchema, table: 'system_settings'"), true, 'AppLayout must use activeSchema in system_settings');
  assert.strictEqual(appLayoutJs.includes("schema: 'public'"), false, 'AppLayout must NOT have hardcoded schema: public');

  // CheckinController checks
  assert.strictEqual(checkinJs.includes("const activeSchema = (typeof Config !== 'undefined' && Config.SUPABASE_SCHEMA) ? Config.SUPABASE_SCHEMA : 'public';"), true, 'CheckinController must read activeSchema from Config');
  assert.strictEqual(checkinJs.includes("client.channel(`bma_checkin_settings_${activeSchema}`)"), true, 'CheckinController must use activeSchema in channel name');
  assert.strictEqual(checkinJs.includes("schema: activeSchema, table: 'system_settings'"), true, 'CheckinController must use activeSchema in system_settings listener');
  assert.strictEqual(checkinJs.includes("schema: 'public'"), false, 'CheckinController must NOT have hardcoded schema: public');

  console.log('✓ Single-point schema binding verified across all modules');
}

// Test 2: SQL Scripts Verification
console.log('\n--- Test 2: SQL Scripts Verification ---');
{
  const stagingSql = fs.readFileSync('sql/create_staging_schema.sql', 'utf8');
  const publicSql = fs.readFileSync('sql/alter_v2_8_loca_v2_schema.sql', 'utf8');

  // Staging SQL
  assert.strictEqual(stagingSql.includes('ADD COLUMN IF NOT EXISTS enforce_geofence_radius BOOLEAN NOT NULL DEFAULT true;'), true, 'create_staging_schema.sql must add enforce_geofence_radius column');
  assert.strictEqual(stagingSql.includes("ALTER PUBLICATION supabase_realtime ADD TABLE staging.attendance_logs;"), true, 'create_staging_schema.sql must enable publication for attendance_logs');
  assert.strictEqual(stagingSql.includes("ALTER PUBLICATION supabase_realtime ADD TABLE staging.system_settings;"), true, 'create_staging_schema.sql must enable publication for system_settings');

  // Public SQL
  assert.strictEqual(publicSql.includes('ADD COLUMN IF NOT EXISTS enforce_geofence_radius BOOLEAN NOT NULL DEFAULT true;'), true, 'alter_v2_8_loca_v2_schema.sql must add enforce_geofence_radius column');
  assert.strictEqual(publicSql.includes('ADD COLUMN IF NOT EXISTS location_mode TEXT NOT NULL DEFAULT \'ONSITE\';'), true, 'alter_v2_8_loca_v2_schema.sql must add location_mode to attendance_logs');
  assert.strictEqual(publicSql.includes('ADD COLUMN IF NOT EXISTS distance_from_official_meters'), true, 'alter_v2_8_loca_v2_schema.sql must add distance_from_official_meters');
  assert.strictEqual(publicSql.includes("ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_logs;"), true, 'alter_v2_8_loca_v2_schema.sql must enable publication for attendance_logs');

  console.log('✓ SQL scripts for both staging and public verified');
}

// Test 3: CheckinController Cache-Bypass Init and Immediate Unlock
console.log('\n--- Test 3: CheckinController Init & Geofence Unlock Logic ---');
{
  const checkinJs = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');

  // Init cache bypass
  assert.strictEqual(checkinJs.includes('this.settings = await SettingsModel.getSettings(true);'), true, 'CheckinController.init() must pass true to getSettings()');

  // #renderGeofenceStatusUI check
  assert.strictEqual(checkinJs.includes('if (this.settings?.enforce_geofence_radius === false || this.settings?.require_gps === false)'), true, 'renderGeofenceStatusUI must check enforce_geofence_radius === false first');
  assert.strictEqual(checkinJs.includes('this.#updateStep1Validation();\n            return;'), true, 'renderGeofenceStatusUI must invoke #updateStep1Validation() before return');

  // #goToStep(2) check
  assert.strictEqual(checkinJs.includes('if (this.settings?.require_gps && this.settings?.enforce_geofence_radius !== false)'), true, '#goToStep(2) must not block when enforce_geofence_radius is false');

  // #updateStep1Validation check
  assert.strictEqual(checkinJs.includes('if (this.settings?.require_gps && this.settings?.enforce_geofence_radius !== false)'), true, '#updateStep1Validation must not invalidate when enforce_geofence_radius is false');

  console.log('✓ CheckinController cache bypass and step unlock verified');
}

// Test 4: ReportsController Cross-Table Moving & Highlight
console.log('\n--- Test 4: ReportsController Cross-Table Differential Sync ---');
{
  const repJs = fs.readFileSync('assets/js/controllers/ReportsController.js', 'utf8');

  assert.strictEqual(repJs.includes('prev.status_key !== fr.status_key'), true, 'ReportsController must detect status_key change');
  assert.strictEqual(repJs.includes('this.#renderSeparateTablesBySelectedTags(false);'), true, 'ReportsController must re-render tables when status changes table');
  assert.strictEqual(repJs.includes("row.classList.add('bg-emerald-500/15', 'transition-colors', 'duration-1000');"), true, 'ReportsController must highlight moved rows with emerald badge pulse');

  console.log('✓ ReportsController cross-table move and row highlight verified');
}

console.log('\n=== All Rev 2 Specific Tests PASSED 100%! ===');
