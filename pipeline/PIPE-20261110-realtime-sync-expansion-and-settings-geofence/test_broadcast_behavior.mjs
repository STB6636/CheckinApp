import fs from 'fs';
import vm from 'vm';

global.window = global;
global.window.dispatchEvent = () => true;

// Load supabase-js from CDN
const supabaseCode = await (await fetch('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2')).text();
vm.runInThisContext(supabaseCode);

const SUPABASE_URL = 'https://yicatrqogmcncfpqdyra.supabase.co';
const ANON_KEY = 'sb_publishable_eF5hCLSrg74gre5UXNtVgw_UsPRbPZl';

const client1 = global.supabase.createClient(SUPABASE_URL, ANON_KEY);
const client2 = global.supabase.createClient(SUPABASE_URL, ANON_KEY);

console.log('Client 1 subscribing to bma_global_realtime_bus...');
client1.channel('bma_global_realtime_bus')
  .on('broadcast', { event: '*' }, (e) => {
    console.log('🎉 Client 1 received broadcast:', e);
  })
  .subscribe((status) => {
    console.log('Client 1 status:', status);
  });

// Now test sending without subscribe as in DatabaseService.broadcastRealtimeEvent
setTimeout(async () => {
  console.log('\nTesting DatabaseService-style broadcast (unsubscribed new channel instance)...');
  try {
    const ch = client2.channel('bma_global_realtime_bus');
    const sendResult = await ch.send({
      type: 'broadcast',
      event: 'settings_updated',
      payload: { test: 123 }
    });
    console.log('Send result without subscribe:', sendResult);
  } catch (err) {
    console.error('Send error:', err);
  }
}, 2000);

// Now test sending WITH subscribe
setTimeout(async () => {
  console.log('\nTesting sending WITH subscribe and wait for SUBSCRIBED...');
  const chSub = client2.channel('bma_global_realtime_bus_2');
  chSub.subscribe(async (status) => {
    console.log('chSub status:', status);
    if (status === 'SUBSCRIBED') {
      const res = await chSub.send({
        type: 'broadcast',
        event: 'settings_updated',
        payload: { test: 456 }
      });
      console.log('Send result WITH subscribe:', res);
    }
  });
}, 4000);

setTimeout(() => {
  console.log('\nTest completed.');
  process.exit(0);
}, 6000);
