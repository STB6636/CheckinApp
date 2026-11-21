import fs from 'fs';
import vm from 'vm';

global.window = global;
global.window.dispatchEvent = () => true;

// Load supabase
const supabaseCode = await (await fetch('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2')).text();
vm.runInThisContext(supabaseCode);

const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');
const { AttendanceModel } = await import('../../assets/js/models/AttendanceModel.js');

const todayISO = UIHelpers.getTodayISO();
console.log('Today ISO:', todayISO);

console.log('\nFetching DailyReportRecords for today...');
const records = await AttendanceModel.getDailyReportRecords(todayISO, null);
console.log('Total records:', records.length);

const checkedIn = records.filter(r => Boolean(r.log_id));
console.log('Checked-in records count:', checkedIn.length);
if (checkedIn.length > 0) {
  console.log('Sample checked-in record:');
  console.log({
    row_uid: checkedIn[0].row_uid,
    personnel_id: checkedIn[0].personnel_id,
    log_id: checkedIn[0].log_id,
    full_name: checkedIn[0].full_name,
    check_in_time: checkedIn[0].check_in_time,
    check_out_time: checkedIn[0].check_out_time,
    status_label: checkedIn[0].status_label,
    status_category: checkedIn[0].status_category
  });
}

const metrics = AttendanceModel.calculateDashboardMetrics(records);
console.log('\nDashboard Metrics:');
console.log({
  total: metrics.total,
  checked_in: metrics.checked_in,
  categories: metrics.categories.map(c => `${c.label}: ${c.count}`)
});
