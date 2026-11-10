import fs from 'fs';
import vm from 'vm';
import assert from 'assert';

// 1. Setup browser-like environment in Node
global.window = global;
global.window.dispatchEvent = () => true;
global.CustomEvent = class CustomEvent { constructor(name, detail) { this.name = name; this.detail = detail; } };

// Mock localStorage and sessionStorage
class StorageMock {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, val) {
    this.store.set(key, String(val));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

global.localStorage = new StorageMock();
global.sessionStorage = new StorageMock();

// Load supabase.umd.js
vm.runInThisContext(fs.readFileSync('supabase.umd.js', 'utf8'));
global.window.supabase = global.supabase;

console.log('✓ Supabase JS loaded successfully. Initializing models...');

// Import application modules
const { Config } = await import('../../assets/js/core/Config.js');
const { DatabaseService } = await import('../../assets/js/core/DatabaseService.js');
const { SettingsModel } = await import('../../assets/js/models/SettingsModel.js');

console.log('Target Schema:', Config.SUPABASE_SCHEMA);
assert.strictEqual(Config.SUPABASE_SCHEMA, 'staging', 'Config.SUPABASE_SCHEMA must be staging');

async function runLivePersistenceTest() {
  console.log('\n--- Step 1: Live Fetch initial settings from Supabase (staging) ---');
  const initialSettings = await SettingsModel.getSettings(true);
  console.log('Initial enforce_geofence_radius:', initialSettings.enforce_geofence_radius);
  const originalEnforce = initialSettings.enforce_geofence_radius;

  console.log('\n--- Step 2: Live Update enforce_geofence_radius = false to Supabase ---');
  const updatePayload = {
    ...initialSettings,
    enforce_geofence_radius: false
  };

  const updateResult = await SettingsModel.updateSettings(updatePayload);
  console.log('Update result:', updateResult);
  assert.strictEqual(updateResult.success, true, 'updateSettings must return success: true');

  console.log('\n--- Step 3: Simulate New Device (Clear localStorage & sessionStorage) ---');
  global.localStorage.clear();
  global.sessionStorage.clear();
  assert.strictEqual(global.localStorage.getItem('bma_enforce_geofence_radius'), null, 'localStorage must be empty');
  assert.strictEqual(global.sessionStorage.getItem(Config.STORAGE_KEYS.CACHED_SETTINGS), null, 'sessionStorage must be empty');

  console.log('\n--- Step 4: Fetch fresh settings from Supabase without any local cache ---');
  const freshSettingsWithoutCache = await SettingsModel.getSettings(true);
  console.log('Fetched enforce_geofence_radius on clean device:', freshSettingsWithoutCache.enforce_geofence_radius);
  assert.strictEqual(
    freshSettingsWithoutCache.enforce_geofence_radius,
    false,
    'enforce_geofence_radius must be false from Supabase Dual-Layer persistence!'
  );
  console.log('✓ Dual-Layer Persistence Verified: Settings persisted to Supabase and restored on fresh client!');

  console.log('\n--- Step 5: Restore original enforce_geofence_radius back to Supabase ---');
  const restorePayload = {
    ...freshSettingsWithoutCache,
    enforce_geofence_radius: originalEnforce
  };
  const restoreResult = await SettingsModel.updateSettings(restorePayload);
  assert.strictEqual(restoreResult.success, true, 'Restore updateSettings must succeed');

  global.localStorage.clear();
  global.sessionStorage.clear();
  const verifiedRestored = await SettingsModel.getSettings(true);
  console.log('Verified restored enforce_geofence_radius:', verifiedRestored.enforce_geofence_radius);
  assert.strictEqual(verifiedRestored.enforce_geofence_radius, originalEnforce, 'Value successfully restored to original');
  console.log('✓ Value cleanly restored to original state!');

  console.log('\n=== LIVE DB PERSISTENCE TEST PASSED 100% ===');
}

runLivePersistenceTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
