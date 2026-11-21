import fs from 'fs';
import vm from 'vm';

global.window = global;
global.window.dispatchEvent = () => true;

// Load supabase-js from CDN
const supabaseCode = await (await fetch('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2')).text();
vm.runInThisContext(supabaseCode);

const SUPABASE_URL = 'https://yicatrqogmcncfpqdyra.supabase.co';
const ANON_KEY = 'sb_publishable_eF5hCLSrg74gre5UXNtVgw_UsPRbPZl';

const client = global.supabase.createClient(SUPABASE_URL, ANON_KEY, {
  db: { schema: 'staging' },
  auth: { persistSession: false }
});

console.log('Subscribing to staging.attendance_logs on Supabase...');

let receivedInsert = false;
let receivedUpdate = false;
let receivedDelete = false;

const channel = client.channel('test_realtime_events_all')
  .on('postgres_changes', { event: '*', schema: 'staging', table: 'attendance_logs' }, (payload) => {
    console.log(`\n🎉🎉🎉 RECEIVED REALTIME EVENT [${payload.eventType}]! 🎉🎉🎉`);
    console.log('Record ID:', payload.new?.id || payload.old?.id);
    console.log('Status:', payload.new?.status);
    if (payload.eventType === 'INSERT') receivedInsert = true;
    if (payload.eventType === 'UPDATE') receivedUpdate = true;
    if (payload.eventType === 'DELETE') receivedDelete = true;
  })
  .subscribe(async (status, err) => {
    console.log('Subscription status:', status, err || '');
    if (status === 'SUBSCRIBED') {
      console.log('\n--- 1. Testing INSERT into staging.attendance_logs ---');
      const testInsert = {
        work_date: '2026-11-10',
        shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
        check_in_time: '08:25:00',
        status: 'ปฏิบัติงานปกติ',
        remark: 'ทดสอบ Realtime Diff Sync',
        location_mode: 'ONSITE',
        is_overtime: false,
        is_special_request: false,
        approval_status: 'approved'
      };

      const { data: insertedData, error: insertError } = await client
        .from('attendance_logs')
        .insert(testInsert)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert Error:', insertError);
      } else {
        console.log('✅ Inserted Record ID:', insertedData.id);

        // Wait 2s then test UPDATE
        setTimeout(async () => {
          console.log('\n--- 2. Testing UPDATE on staging.attendance_logs ---');
          const { error: updateError } = await client
            .from('attendance_logs')
            .update({ check_out_time: '16:35:00', status: 'ปฏิบัติงานปกติ' })
            .eq('id', insertedData.id);

          if (updateError) console.error('❌ Update Error:', updateError);
          else console.log('✅ Updated Record ID:', insertedData.id);

          // Wait 2s then test DELETE (clean up)
          setTimeout(async () => {
            console.log('\n--- 3. Testing DELETE on staging.attendance_logs ---');
            const { error: delError } = await client
              .from('attendance_logs')
              .delete()
              .eq('id', insertedData.id);

            if (delError) console.error('❌ Delete Error:', delError);
            else console.log('✅ Deleted Record ID:', insertedData.id);
          }, 2000);
        }, 2000);
      }
    }
  });

setTimeout(() => {
  console.log('\n=======================================');
  console.log('RESULTS:');
  console.log('- Received INSERT:', receivedInsert);
  console.log('- Received UPDATE:', receivedUpdate);
  console.log('- Received DELETE:', receivedDelete);
  console.log('=======================================');
  process.exit(0);
}, 9000);
