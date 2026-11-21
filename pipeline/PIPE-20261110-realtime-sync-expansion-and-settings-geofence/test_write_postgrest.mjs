const SUPABASE_URL = 'https://yicatrqogmcncfpqdyra.supabase.co';
const ANON_KEY = 'sb_publishable_eF5hCLSrg74gre5UXNtVgw_UsPRbPZl';

async function testWrite() {
  const url = `${SUPABASE_URL}/rest/v1/system_settings?id=eq.1`;
  const headers = {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
    'Accept-Profile': 'staging',
    'Content-Profile': 'staging',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ updated_at: new Date().toISOString() })
  });

  console.log('PATCH Status:', res.status);
  const data = await res.json();
  console.log('PATCH Result:', data);
}

testWrite();
