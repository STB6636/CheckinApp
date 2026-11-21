const SUPABASE_URL = 'https://yicatrqogmcncfpqdyra.supabase.co';
const ANON_KEY = 'sb_publishable_eF5hCLSrg74gre5UXNtVgw_UsPRbPZl';

async function queryPostgrest(path, schema = 'staging', options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
    'Accept-Profile': schema,
    'Content-Profile': schema,
    'Prefer': 'count=exact',
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const contentRange = res.headers.get('content-range');
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = await res.text();
  }

  return {
    status: res.status,
    statusText: res.statusText,
    ok: res.ok,
    contentRange,
    data
  };
}

async function inspect() {
  console.log('====================================================');
  console.log('🔎 ตรวจสอบ SCHEMA "staging" บน SUPABASE');
  console.log('====================================================');

  const tables = ['system_settings', 'personnel', 'user_accounts', 'attendance_logs'];

  // 1. ตรวจสอบตารางทั้ง 4 ใน staging
  for (const table of tables) {
    const res = await queryPostgrest(`${table}?select=*&limit=1`, 'staging');
    if (res.ok) {
      console.log(`\n✅ ตาราง staging.${table}: มีอยู่จริงและเข้าถึงได้ (HTTP ${res.status})`);
      console.log(`   จำนวนแถวทั้งหมด (Content-Range): ${res.contentRange || 'N/A'}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        const columns = Object.keys(res.data[0]);
        console.log(`   จำนวนคอลัมน์: ${columns.length} คอลัมน์`);
        console.log(`   รายชื่อคอลัมน์: ${columns.join(', ')}`);
      } else {
        console.log(`   (ไม่มีข้อมูล หรือเป็นตารางว่าง)`);
      }
    } else {
      console.log(`\n❌ ตาราง staging.${table}: เข้าถึงไม่ได้ (HTTP ${res.status} ${res.statusText})`);
      console.log(`   รายละเอียด Error:`, res.data);
    }
  }

  // 2. ตรวจสอบคอลัมน์สำคัญใน staging.system_settings
  console.log('\n----------------------------------------------------');
  console.log('🔎 ตรวจสอบคอลัมน์พิเศษใน staging.system_settings:');
  const settingsRes = await queryPostgrest(`system_settings?id=eq.1&select=*`, 'staging');
  if (settingsRes.ok && Array.isArray(settingsRes.data) && settingsRes.data.length > 0) {
    const row = settingsRes.data[0];
    console.log(`- enforce_geofence_radius คอลัมน์ตรง:`, 
      'enforce_geofence_radius' in row 
        ? `มีอยู่จริง ค่า = ${row.enforce_geofence_radius} (ประเภท: ${typeof row.enforce_geofence_radius})` 
        : '❌ ไม่มีคอลัมน์นี้');
    
    console.log(`- official_locations (พิกัดหลายจุด):`, 
      'official_locations' in row 
        ? `มีอยู่จริง (${Array.isArray(row.official_locations) ? row.official_locations.length : typeof row.official_locations} จุด)` 
        : '❌ ไม่มีคอลัมน์นี้');
    
    console.log(`- category_colors (JSONB สำรอง):`, 
      row.category_colors 
        ? `มีอยู่จริง (enforce_geofence_radius ใน JSONB = ${row.category_colors.enforce_geofence_radius})` 
        : 'ไม่มี');
    
    console.log(`- remarks (ตัวเลือกเหตุผลนอกสถานที่):`, 
      Array.isArray(row.remarks) ? `${row.remarks.length} รายการ: ${row.remarks.slice(0, 3).join(', ')}...` : 'N/A');
  } else {
    console.log('❌ ไม่สามารถอ่านแถว id=1 ใน staging.system_settings');
  }

  // 3. ตรวจสอบคอลัมน์สำคัญใน staging.attendance_logs
  console.log('\n----------------------------------------------------');
  console.log('🔎 ตรวจสอบคอลัมน์ใน staging.attendance_logs:');
  const logsRes = await queryPostgrest(`attendance_logs?select=*&limit=1`, 'staging');
  if (logsRes.ok && Array.isArray(logsRes.data) && logsRes.data.length > 0) {
    const log = logsRes.data[0];
    console.log(`- work_mode:`, 'work_mode' in log ? `มี (${log.work_mode})` : 'ไม่มี');
    console.log(`- location_mode:`, 'location_mode' in log ? `มี (${log.location_mode})` : 'ไม่มี');
    console.log(`- distance_from_official_meters:`, 'distance_from_official_meters' in log ? `มี (${log.distance_from_official_meters})` : 'ไม่มี');
    console.log(`- offsite_reason:`, 'offsite_reason' in log ? `มี` : 'ไม่มี');
  }

  // 4. ทดสอบสิทธิ์การเขียน (Update) บน staging.system_settings
  console.log('\n----------------------------------------------------');
  console.log('✍️ ทดสอบสิทธิ์การเขียน (Update Permission) บน staging:');
  const testPatch = await queryPostgrest(`system_settings?id=eq.1`, 'staging', {
    method: 'PATCH',
    headers: { 'Prefer': 'return=representation' },
    body: { updated_at: new Date().toISOString() }
  });

  if (testPatch.ok) {
    console.log(`✅ เขียนข้อมูลสำเร็จ (HTTP ${testPatch.status}): RLS อนุญาตให้แก้ไขข้อมูลบน staging ได้ 100%`);
  } else {
    console.log(`❌ เขียนข้อมูลไม่สำเร็จ (HTTP ${testPatch.status}):`, testPatch.data);
  }

  // 5. เปรียบเทียบจำนวนแถว staging vs public
  console.log('\n----------------------------------------------------');
  console.log('📊 เปรียบเทียบจำนวนข้อมูลระหว่าง staging และ public:');
  for (const table of tables) {
    const sRes = await queryPostgrest(`${table}?select=id`, 'staging');
    const pRes = await queryPostgrest(`${table}?select=id`, 'public');
    const sCount = sRes.contentRange ? sRes.contentRange.split('/')[1] : (Array.isArray(sRes.data) ? sRes.data.length : 'N/A');
    const pCount = pRes.contentRange ? pRes.contentRange.split('/')[1] : (Array.isArray(pRes.data) ? pRes.data.length : 'N/A');
    console.log(`- ${table.padEnd(16)}: staging = ${sCount.toString().padStart(4)} แถว | public = ${pCount.toString().padStart(4)} แถว`);
  }

  console.log('\n====================================================');
}

inspect().catch(console.error);
