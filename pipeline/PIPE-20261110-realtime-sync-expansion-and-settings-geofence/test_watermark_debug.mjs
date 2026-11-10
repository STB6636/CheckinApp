import fs from 'fs';
import vm from 'vm';

global.window = global;
global.document = {
  getElementById: (id) => {
    console.log(`[DOM] getElementById: ${id}`);
    if (id === 'dashboardRecentTableBody') {
      return {
        children: [],
        innerHTML: '',
        querySelectorAll: () => [],
        querySelector: () => null
      };
    }
    return { value: '2026-11-10', textContent: '' };
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};
global.CustomEvent = class CustomEvent { constructor(name, detail) { this.name = name; this.detail = detail; } };
global.window.addEventListener = () => {};
global.window.dispatchEvent = () => true;

// Load supabase
const supabaseCode = await (await fetch('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2')).text();
vm.runInThisContext(supabaseCode);

const { UIHelpers } = await import('../../assets/js/core/UIHelpers.js');
const { AttendanceModel } = await import('../../assets/js/models/AttendanceModel.js');

console.log('--- Checking UIHelpers.getTodayDateString ---');
console.log('UIHelpers.getTodayDateString:', typeof UIHelpers.getTodayDateString);
console.log('UIHelpers.getTodayISO:', typeof UIHelpers.getTodayISO);

console.log('\n--- Calling AttendanceModel.getTodaySyncWatermark ---');
UIHelpers.getTodayDateString = UIHelpers.getTodayISO;
const watermark = await AttendanceModel.getTodaySyncWatermark();
console.log('Watermark Result:', watermark);
