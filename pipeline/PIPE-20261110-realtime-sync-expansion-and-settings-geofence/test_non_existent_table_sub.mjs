import fs from 'fs';
import vm from 'vm';

global.window = global;
global.window.dispatchEvent = () => true;

// Load supabase
const supabaseCode = await (await fetch('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2')).text();
vm.runInThisContext(supabaseCode);

const SUPABASE_URL = 'https://yicatrqogmcncfpqdyra.supabase.co';
const ANON_KEY = 'sb_publishable_eF5hCLSrg74gre5UXNtVgw_UsPRbPZl';

const client = global.supabase.createClient(SUPABASE_URL, ANON_KEY, {
  db: { schema: 'staging' },
  auth: { persistSession: false }
});

console.log('Testing channel with non-existent table password_reset_requests...');

const channel = client.channel('test_channel_tables')
  .on('postgres_changes', { event: '*', schema: 'staging', table: 'attendance_logs' }, (p) => console.log('Log event:', p.eventType))
  .on('postgres_changes', { event: '*', schema: 'staging', table: 'password_reset_requests' }, (p) => console.log('Reset event:', p.eventType))
  .on('postgres_changes', { event: '*', schema: 'staging', table: 'system_settings' }, (p) => console.log('Settings event:', p.eventType))
  .subscribe((status, err) => {
    console.log('Channel subscription status:', status, err || '');
  });

setTimeout(() => {
  console.log('Test done.');
  process.exit(0);
}, 4000);
