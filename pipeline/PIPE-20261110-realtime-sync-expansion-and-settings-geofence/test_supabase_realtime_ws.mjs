// Use native WebSocket in Node
const WebSocket = globalThis.WebSocket;

const SUPABASE_URL = 'https://yicatrqogmcncfpqdyra.supabase.co';
const ANON_KEY = 'sb_publishable_eF5hCLSrg74gre5UXNtVgw_UsPRbPZl';

const wsUrl = `wss://yicatrqogmcncfpqdyra.supabase.co/realtime/v1/websocket?apikey=${ANON_KEY}&vsn=1.0.0`;

console.log('Connecting to Supabase Realtime WebSocket:', wsUrl);
const ws = new WebSocket(wsUrl);

ws.onopen = () => {
  console.log('✅ WebSocket Connected!');

  // Send heartbeat
  const heartbeatMsg = JSON.stringify({
    topic: 'phoenix',
    event: 'heartbeat',
    payload: {},
    ref: '1'
  });
  ws.send(heartbeatMsg);

  // Join staging attendance_logs channel
  const joinMsg = JSON.stringify({
    topic: 'realtime:bma_test_staging',
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
    ref: '2'
  });
  console.log('Sending join message for staging.attendance_logs...');
  ws.send(joinMsg);
};

ws.onmessage = (event) => {
  console.log('📩 Received WebSocket Message:', event.data);
};

ws.onerror = (err) => {
  console.error('❌ WebSocket Error:', err);
};

setTimeout(() => {
  console.log('Test finished after 5 seconds.');
  ws.close();
  process.exit(0);
}, 5000);
