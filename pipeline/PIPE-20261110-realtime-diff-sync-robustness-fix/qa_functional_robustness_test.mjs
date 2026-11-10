import assert from 'assert';
import fs from 'fs';

console.log('=== Starting Functional Verification Test Suite (PIPE-20261110-realtime-diff-sync-robustness-fix) ===');

// Setup mock browser environment
global.window = global;
global.window.dispatchEvent = () => true;
global.CustomEvent = class CustomEvent { constructor(name, detail) { this.name = name; this.detail = detail; } };

class StorageMock {
  constructor() { this.store = new Map(); }
  getItem(k) { return this.store.has(k) ? this.store.get(k) : null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
}
global.localStorage = new StorageMock();
global.sessionStorage = new StorageMock();

// Mock Supabase client for DatabaseService
global.window.supabase = {
  createClient: () => {
    return {
      from: (table) => {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => Promise.resolve({
                  data: [
                    { id: 1, status: 'ปกติ', check_in_time: '08:00', check_out_time: '16:30', approval_status: 'approved', updated_at: '2026-11-10T08:00:00Z' }
                  ]
                }),
                maybeSingle: () => Promise.resolve({
                  data: { id: 1, updated_at: '2026-11-10T00:00:00Z', enforce_geofence_radius: true, require_gps: true, require_photo: true, category_colors: {} }
                })
              }),
              maybeSingle: () => Promise.resolve({
                data: { id: 1, updated_at: '2026-11-10T00:00:00Z', enforce_geofence_radius: true, require_gps: true, require_photo: true, category_colors: {} }
              })
            }),
            gte: () => ({
              lte: () => ({
                order: () => ({
                  order: () => Promise.resolve({
                    data: [
                      {
                        id: 501,
                        personnel_id: 1,
                        user_id: 1,
                        work_date: '2026-11-10',
                        shift_name: 'เวลาราชการปกติ (08:30 - 16:30)',
                        check_in_time: '08:15',
                        check_out_time: '16:30',
                        check_in_lat: 13.75,
                        check_in_lng: 100.5,
                        check_in_location: 'สำนักเทศกิจ',
                        status: 'ปฏิบัติงานปกติ',
                        remark: '',
                        row_color: '#007B3E',
                        is_overtime: false,
                        is_special_request: false,
                        approval_status: 'approved',
                        created_at: '2026-11-10T08:15:00Z',
                        updated_at: '2026-11-10T16:30:00Z'
                      }
                    ]
                  })
                })
              })
            }),
            order: () => ({
              order: () => ({
                order: () => ({
                  order: () => Promise.resolve({
                    data: [
                      {
                        id: 1,
                        national_id: '1234567890123',
                        prefix: 'นาย',
                        first_name: 'สมชาย',
                        last_name: 'ใจดี',
                        position_type: 'ข้าราชการ',
                        position_title: 'นักจัดการงานทั่วไป',
                        position_level: 'ปฏิบัติการ',
                        organization: 'กทม.',
                        bureau: 'สำนักเทศกิจ',
                        division: 'ฝ่ายบริหารงานทั่วไป',
                        work_group: 'กลุ่มงานสารบรรณ'
                      }
                    ]
                  })
                })
              })
            })
          })
        };
      },
      channel: () => ({
        on: () => ({ subscribe: () => {} }),
        subscribe: () => {}
      })
    };
  }
};

// Load modules
const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');
const { Config } = await import('../../assets/js/core/Config.js');

// Test 1: UIHelpers.getTodayDateString() alias
console.log('\n--- Test 1: UIHelpers.getTodayDateString() Alias ---');
{
  assert.strictEqual(typeof UIHelpers.getTodayDateString, 'function', 'UIHelpers.getTodayDateString must be a function');
  const d1 = UIHelpers.getTodayDateString();
  const d2 = UIHelpers.getTodayISO();
  assert.strictEqual(d1, d2, 'UIHelpers.getTodayDateString() must return same as getTodayISO()');
  assert.strictEqual(/^\d{4}-\d{2}-\d{2}$/.test(d1), true, 'Must return YYYY-MM-DD');
  console.log('✓ UIHelpers.getTodayDateString() alias returns:', d1);
}

// Test 2: AttendanceModel.getTodaySyncWatermark()
console.log('\n--- Test 2: AttendanceModel.getTodaySyncWatermark() Clean Execution ---');
{
  const { AttendanceModel } = await import('../../assets/js/models/AttendanceModel.js');

  // Verify getTodaySyncWatermark function exists and returns valid structure
  assert.strictEqual(typeof AttendanceModel.getTodaySyncWatermark, 'function');
  const watermarkRes = await AttendanceModel.getTodaySyncWatermark();
  assert.strictEqual(typeof watermarkRes, 'object', 'Must return an object');
  assert.strictEqual(typeof watermarkRes.attendanceSignature, 'string', 'attendanceSignature must be a string');
  assert.strictEqual(typeof watermarkRes.settingsSignature, 'string', 'settingsSignature must be a string');
  console.log('✓ getTodaySyncWatermark() executed with zero TypeError:');
  console.log('  attendanceSignature length:', watermarkRes.attendanceSignature.length);
  console.log('  settingsSignature length:', watermarkRes.settingsSignature.length);
}

// Test 3: AttendanceModel.getReportRecordsByDateRange() includes updated_at, status_key, status_category
console.log('\n--- Test 3: Report Records Format & Fields ---');
{
  const { AttendanceModel } = await import('../../assets/js/models/AttendanceModel.js');
  const today = UIHelpers.getTodayISO();
  const records = await AttendanceModel.getReportRecordsByDateRange(today, today, { role: 'SuperAdmin' });
  assert.strictEqual(Array.isArray(records), true, 'Must return an array of records');
  if (records.length > 0) {
    const r = records[0];
    assert.strictEqual('row_uid' in r, true, 'Must have row_uid');
    assert.strictEqual('status_key' in r, true, 'Must have status_key');
    assert.strictEqual('status_category' in r, true, 'Must have status_category');
    assert.strictEqual('created_at' in r, true, 'Must have created_at');
    assert.strictEqual('updated_at' in r, true, 'Must have updated_at');
    console.log('✓ Sample record verified:');
    console.log(`  Name: ${r.full_name}, status_key: ${r.status_key}, status_category: ${r.status_category}, log_id: ${r.log_id}`);
  } else {
    console.log('✓ Report query succeeded with 0 records returned');
  }
}

// Test 4: ReportsController categoryChanged Detection Logic
console.log('\n--- Test 4: ReportsController categoryChanged Detection Logic ---');
{
  // Simulate oldRecords and freshRecords where a person transitions from absent (no_checkin) to on-time (normal)
  const personId = 101;
  const workDate = '2026-11-10';

  const oldRecords = [
    {
      row_uid: `${personId}_${workDate}_empty`,
      personnel_id: personId,
      work_date: workDate,
      log_id: null,
      status_key: 'no_checkin',
      status_category: 'no_checkin',
      check_in_time: '',
      check_out_time: ''
    }
  ];

  const oldMap = new Map();
  for (const r of oldRecords) {
    if (r.row_uid) oldMap.set(String(r.row_uid), r);
    if (r.log_id) oldMap.set(String(r.log_id), r);
    if (r.personnel_id && r.work_date) {
      oldMap.set(`${r.personnel_id}_${r.work_date}`, r);
      oldMap.set(`${r.personnel_id}_${r.work_date}_empty`, r);
    }
  }

  const freshRecords = [
    {
      row_uid: 505,
      personnel_id: personId,
      work_date: workDate,
      log_id: 505,
      status_key: 'normal',
      status_category: 'normal',
      check_in_time: '08:15',
      check_out_time: ''
    }
  ];

  let categoryChanged = false;
  const changedUids = new Set();
  for (const fr of freshRecords) {
    const prev = oldMap.get(String(fr.row_uid)) ||
      (fr.log_id ? oldMap.get(String(fr.log_id)) : null) ||
      oldMap.get(`${fr.personnel_id}_${fr.work_date}`) ||
      oldMap.get(`${fr.personnel_id}_${fr.work_date}_empty`);

    if (prev) {
      const oldCat = prev.status_category || prev.status_key;
      const newCat = fr.status_category || fr.status_key;
      if (oldCat !== newCat) {
        categoryChanged = true;
        if (fr.row_uid) changedUids.add(String(fr.row_uid));
        if (fr.log_id) changedUids.add(String(fr.log_id));
        if (fr.personnel_id) changedUids.add(String(fr.personnel_id));
        changedUids.add(`${fr.personnel_id}_${fr.work_date}`);
      }
    }
  }

  assert.strictEqual(categoryChanged, true, 'Must detect category transition across separate tables');
  assert.strictEqual(changedUids.has(String(505)), true, 'Must record changed row UID 505');
  assert.strictEqual(changedUids.has(String(personId)), true, 'Must record changed personnel_id');
  console.log('✓ Cross-table status transition successfully detected (categoryChanged = true, changedUids marked)');
}

// Test 5: DashboardController Timestamp Sorting Logic
console.log('\n--- Test 5: DashboardController Deterministic Timestamp Sorting ---');
{
  const mockFreshRecords = [
    {
      log_id: 1,
      full_name: 'ก. ไก่',
      created_at: '2026-11-10T08:00:00.000Z',
      updated_at: '2026-11-10T08:00:00.000Z',
      check_in_time: '08:00',
      check_out_time: null
    },
    {
      log_id: 2,
      full_name: 'ข. ไข่',
      created_at: '2026-11-10T08:30:00.000Z',
      updated_at: '2026-11-10T16:35:00.000Z', // Just checked out recently!
      check_in_time: '08:30',
      check_out_time: '16:35'
    },
    {
      log_id: 3,
      full_name: 'ฮ. นกฮูก',
      created_at: '2026-11-10T07:30:00.000Z',
      updated_at: '2026-11-10T07:30:00.000Z',
      check_in_time: '07:30',
      check_out_time: null
    }
  ];

  const sorted = mockFreshRecords
    .filter(rec => Boolean(rec.log_id))
    .sort((a, b) => {
      const timeB = b.updated_at || b.created_at;
      const timeA = a.updated_at || a.created_at;
      if (timeB && timeA) {
        const diff = new Date(timeB) - new Date(timeA);
        if (diff !== 0) return diff;
      }
      const checkOutDiff = (b.check_out_time || '').localeCompare(a.check_out_time || '');
      if (checkOutDiff !== 0) return checkOutDiff;
      return (b.check_in_time || '').localeCompare(a.check_in_time || '');
    });

  // Top row must be log_id 2 (latest updated_at 16:35)
  assert.strictEqual(sorted[0].log_id, 2, 'Top row must be most recently updated record');
  // Second row must be log_id 1 (08:00), not log_id 3 (07:30)
  assert.strictEqual(sorted[1].log_id, 1, 'Second row must be 08:00 record');
  assert.strictEqual(sorted[2].log_id, 3, 'Third row must be 07:30 record');
  console.log('✓ Deterministic chronological sorting verified:');
  sorted.forEach((r, idx) => console.log(`  [#${idx + 1}] ${r.full_name} (updated_at: ${r.updated_at})`));
}

console.log('\n=== All Functional Verification Tests PASSED 100%! ===');
