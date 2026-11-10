const SUPABASE_URL = 'https://yicatrqogmcncfpqdyra.supabase.co';
const ANON_KEY = 'sb_publishable_eF5hCLSrg74gre5UXNtVgw_UsPRbPZl';

async function verifyWatermark() {
  const todayStr = new Date().toISOString().split('T')[0];
  console.log('Testing Watermark Query for date:', todayStr);

  const [logsRes, settingsRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/attendance_logs?select=id,status,check_in_time,check_out_time,approval_status,updated_at&work_date=eq.${todayStr}&order=updated_at.desc&limit=50`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Accept-Profile': 'staging'
      }
    }),
    fetch(`${SUPABASE_URL}/rest/v1/system_settings?id=eq.1&select=id,updated_at,enforce_geofence_radius,require_gps,require_photo,category_colors`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Accept-Profile': 'staging'
      }
    })
  ]);

  console.log('logsRes HTTP status:', logsRes.status);
  console.log('settingsRes HTTP status:', settingsRes.status);

  const logs = await logsRes.json();
  const settings = await settingsRes.json();

  console.log('logs count today:', Array.isArray(logs) ? logs.length : logs);
  console.log('settings row:', settings);

  if (logsRes.ok && settingsRes.ok) {
    const sRow = Array.isArray(settings) ? settings[0] : settings;
    const settingsSignature = sRow
      ? `${sRow.updated_at || ''}:${sRow.enforce_geofence_radius}:${sRow.require_gps}:${sRow.require_photo}:${JSON.stringify(sRow.category_colors || {})}`
      : '';
    console.log('✓ Generated Settings Signature:', settingsSignature);
    console.log('✅ ALL QUERIES SUCCEEDED WITH ZERO ERRORS (HTTP 200)!');
  } else {
    console.log('❌ Failed');
  }
}

verifyWatermark();
