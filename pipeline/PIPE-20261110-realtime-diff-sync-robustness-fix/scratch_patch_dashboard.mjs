import fs from 'fs';

const filePath = 'assets/js/controllers/DashboardController.js';
let content = fs.readFileSync(filePath, 'utf8');
const isCrlf = content.includes('\r\n');
const eol = isCrlf ? '\r\n' : '\n';

// 1. Debounce in #bindEvents
const targetBind = [
'    #bindEvents() {',
'        window.addEventListener(\'bma:realtime-delta-sync\', () => {',
'            this.loadDashboardData(true);',
'        });',
'        window.addEventListener(\'bma:realtime-sync\', () => {',
'            this.loadDashboardData(true);',
'        });'
].join(eol);

const repBind = [
'    #bindEvents() {',
'        const triggerDebouncedSync = () => {',
'            if (this._realtimeDebounceTimer) clearTimeout(this._realtimeDebounceTimer);',
'            this._realtimeDebounceTimer = setTimeout(() => {',
'                this.loadDashboardData(true);',
'            }, 250);',
'        };',
'        window.addEventListener(\'bma:realtime-delta-sync\', triggerDebouncedSync);',
'        window.addEventListener(\'bma:realtime-sync\', triggerDebouncedSync);'
].join(eol);

if (!content.includes(targetBind)) {
    console.error('Target bind not found in DashboardController.js');
    process.exit(1);
}
content = content.replace(targetBind, repBind);

// 2. Sort freshCheckedIn instead of .reverse()
const targetSort = [
'            // กรองเฉพาะผู้ที่ลงเวลาปฏิบัติงานแล้ว และเรียงลำดับรายการล่าสุดขึ้นก่อน',
'            const freshCheckedIn = (freshRecords || [])',
'                .filter(rec => Boolean(rec.log_id))',
'                .reverse();'
].join(eol);

const repSort = [
'            // กรองเฉพาะผู้ที่ลงเวลาปฏิบัติงานแล้ว และเรียงลำดับรายการล่าสุดขึ้นก่อน',
'            const freshCheckedIn = (freshRecords || [])',
'                .filter(rec => Boolean(rec.log_id))',
'                .sort((a, b) => {',
'                    const timeB = b.updated_at || b.created_at;',
'                    const timeA = a.updated_at || a.created_at;',
'                    if (timeB && timeA) {',
'                        const diff = new Date(timeB) - new Date(timeA);',
'                        if (diff !== 0) return diff;',
'                    }',
'                    const checkOutDiff = (b.check_out_time || \'\').localeCompare(a.check_out_time || \'\');',
'                    if (checkOutDiff !== 0) return checkOutDiff;',
'                    return (b.check_in_time || \'\').localeCompare(a.check_in_time || \'\');',
'                });'
].join(eol);

if (!content.includes(targetSort)) {
    console.error('Target sort not found in DashboardController.js');
    process.exit(1);
}
content = content.replace(targetSort, repSort);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched DashboardController.js');
