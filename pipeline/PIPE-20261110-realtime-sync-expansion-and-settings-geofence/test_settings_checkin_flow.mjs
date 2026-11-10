import fs from 'fs';
import vm from 'vm';

global.window = global;
global.window.dispatchEvent = () => true;

class StorageMock {
  constructor() { this.store = new Map(); }
  getItem(k) { return this.store.get(k) || null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
}
global.localStorage = new StorageMock();
global.sessionStorage = new StorageMock();

// Load supabase
const supabaseCode = await (await fetch('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2')).text();
vm.runInThisContext(supabaseCode);

const { Config } = await import('../../assets/js/core/Config.js');
const { SettingsModel } = await import('../../assets/js/models/SettingsModel.js');

console.log('Testing SettingsModel.getSettings(true) on fresh client...');
const settings = await SettingsModel.getSettings(true);
console.log('Fetched settings.enforce_geofence_radius:', settings.enforce_geofence_radius);
console.log('Type of enforce_geofence_radius:', typeof settings.enforce_geofence_radius);
