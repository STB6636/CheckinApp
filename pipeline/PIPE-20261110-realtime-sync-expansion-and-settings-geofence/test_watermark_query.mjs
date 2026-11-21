const SUPABASE_URL = 'https://yicatrqogmcncfpqdyra.supabase.co';
const ANON_KEY = 'sb_publishable_eF5hCLSrg74gre5UXNtVgw_UsPRbPZl';

async function testQuery() {
  const url = `${SUPABASE_URL}/rest/v1/attendance_logs?select=id,status,work_mode,check_in_time,check_out_time,approval_status,updated_at&limit=1`;
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

testQuery();
