import fs from 'fs';
import vm from 'vm';

global.window = global;
global.window.dispatchEvent = (e) => console.log('Event dispatched:', e.type, e.detail);
global.CustomEvent = class CustomEvent { constructor(name, detail) { this.name = name; this.detail = detail; } };

class StorageMock {
  constructor() { this.store = new Map(); }
  getItem(k) { return this.store.get(k) || null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
}
global.localStorage = new StorageMock();
global.sessionStorage = new StorageMock();

// Load supabase-js from CDN
console.log('Fetching supabase-js from CDN...');
const supabaseCode = await (await fetch('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2')).text();
vm.runInThisContext(supabaseCode);
global.window.supabase = global.supabase;

const { Config } = await import('../../assets/js/core/Config.js');
const { DatabaseService } = await import('../../assets/js/core/DatabaseService.js');

console.log('Testing AppLayout-like Supabase channel subscription...');

const client = DatabaseService.getInstance().client;
const activeSchema = Config.SUPABASE_SCHEMA;

console.log('Active Schema:', activeSchema);

const channel = client.channel(`bma_admin_realtime_${activeSchema}`)
  .on('postgres_changes', { event: '*', schema: activeSchema, table: 'attendance_logs' }, (payload) => {
    console.log('🎉 RECEIVED ATTENDANCE_LOGS IN JS CLIENT CALLBACK!', payload);
  })
  .subscribe((status, err) => {
    console.log('Channel subscription status callback:', status, err || '');
  });

setTimeout(async () => {
  console.log('\nTriggering a PATCH on staging.attendance_logs...');
  const res = await fetch(`${Config.SUPABASE_URL}/rest/v1/attendance_logs?id=eq.c2bbdc9f-0b4a-47cb-9990-3b40c59e86e5`, {
    method: 'PATCH',
    headers: {
      'apikey': Config.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${Config.SUPABASE_ANON_KEY}`,
      'Accept-Profile': 'staging',
      'Content-Profile': 'staging',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ updated_at: new Date().toISOString() })
  });
  console.log('PATCH response status:', res.status);
}, 2500);

setTimeout(() => {
  console.log('Test completed.');
  process.exit(0);
}, 7000);
