const WebSocket = globalThis.WebSocket;

const SUPABASE_URL = 'https://yicatrqogmcncfpqdyra.supabase.co';
const ANON_KEY = 'sb_publishable_eF5hCLSrg74gre5UXNtVgw_UsPRbPZl';

const wsUrl = `wss://yicatrqogmcncfpqdyra.supabase.co/realtime/v1/websocket?apikey=${ANON_KEY}&vsn=1.0.0`;

console.log('Connecting to Supabase Realtime WebSocket...');
const ws = new WebSocket(wsUrl);

let receivedChange = false;

ws.onopen = () => {
  console.log('✅ WebSocket Connected!');

  // Join staging attendance_logs channel
  const joinMsg = JSON.stringify({
    topic: 'realtime:bma_test_live_event',
    event: 'phx_join',
    payload: {
      config: {
        postgres_changes: [
          {
            event: '*',
            schema: 'staging',
            table: 'attendance_logs'
          }
        ]
      }
    },
    ref: '1'
  });
  ws.send(joinMsg);
};

ws.onmessage = async (event) => {
  const msg = JSON.parse(event.data);
  console.log(`📩 Received [${msg.event}]:`, JSON.stringify(msg.payload));

  if (msg.event === 'system' && msg.payload.status === 'ok') {
    console.log('\n🚀 Successfully subscribed! Now performing a test UPDATE on staging.attendance_logs...');
    
    // Trigger an update on the first record in staging.attendance_logs
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/attendance_logs?id=eq.c2bbdc9f-0b4a-47cb-9990-3b40c59e86e5`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Accept-Profile': 'staging',
        'Content-Profile': 'staging',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ updated_at: new Date().toISOString() })
    });

    console.log('PATCH Status:', patchRes.status);
    const patchData = await patchRes.json();
    console.log('Updated record updated_at:', patchData[0]?.updated_at);
  }

  if (msg.event === 'postgres_changes') {
    console.log('🎉🎉🎉 RECEIVED POSTGRES_CHANGES EVENT OVER WEBSOCKET! 🎉🎉🎉');
    console.log('Payload:', msg.payload);
    receivedChange = true;
  }
};

setTimeout(() => {
  console.log('\nTest completed. Received postgres_changes?', receivedChange);
  ws.close();
  process.exit(0);
}, 8000);
