const SUPABASE_URL = 'https://yicatrqogmcncfpqdyra.supabase.co';
const ANON_KEY = 'sb_publishable_eF5hCLSrg74gre5UXNtVgw_UsPRbPZl';

async function testSettingsWatermark() {
  const url = `${SUPABASE_URL}/rest/v1/system_settings?id=eq.1&select=id,updated_at,enforce_geofence_radius,require_gps,require_photo,allow_offsite_checkin,max_distance_meters,category_colors`;
  const headers = {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
    'Accept-Profile': 'staging'
  };

  const res = await fetch(url, { headers });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Result:', data);
}

testSettingsWatermark();
