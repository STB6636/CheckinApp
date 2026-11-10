import fs from 'fs';

const filePath = 'assets/js/controllers/ReportsController.js';
let content = fs.readFileSync(filePath, 'utf8');
const isCrlf = content.includes('\r\n');
const eol = isCrlf ? '\r\n' : '\n';

// 1. In syncReportsSilent: enhance oldMap and detection loop
const targetOldMap = [
'            const oldRecords = this.records || [];',
'            const oldMap = new Map();',
'            for (const r of oldRecords) {',
'                const k = r.row_uid || r.log_id || `${r.personnel_id}_${r.work_date}`;',
'                oldMap.set(String(k), r);',
'            }',
'',
'            const freshRecords = await AttendanceModel.getReportRecordsByDateRange(startDate, endDate, this.currentUser);',
'',
'            let categoryChanged = false;',
'            const changedUids = new Set();',
'            for (const fr of freshRecords) {',
'                const k = fr.row_uid || fr.log_id || `${fr.personnel_id}_${fr.work_date}`;',
'                const prev = oldMap.get(String(k));',
'                if (prev) {',
'                    if (prev.status_key !== fr.status_key) {',
'                        categoryChanged = true;',
'                        changedUids.add(String(k));',
'                        if (fr.row_uid) changedUids.add(String(fr.row_uid));',
'                        if (fr.log_id) changedUids.add(String(fr.log_id));',
'                        if (fr.personnel_id) changedUids.add(String(fr.personnel_id));',
'                    } else if (prev.check_in_time !== fr.check_in_time || prev.check_out_time !== fr.check_out_time) {',
'                        changedUids.add(String(k));',
'                        if (fr.row_uid) changedUids.add(String(fr.row_uid));',
'                        if (fr.log_id) changedUids.add(String(fr.log_id));',
'                    }',
'                }',
'            }'
].join(eol);

const repOldMap = [
'            const oldRecords = this.records || [];',
'            const oldMap = new Map();',
'            for (const r of oldRecords) {',
'                if (r.row_uid) oldMap.set(String(r.row_uid), r);',
'                if (r.log_id) oldMap.set(String(r.log_id), r);',
'                if (r.personnel_id && r.work_date) {',
'                    oldMap.set(`${r.personnel_id}_${r.work_date}`, r);',
'                    oldMap.set(`${r.personnel_id}_${r.work_date}_empty`, r);',
'                }',
'            }',
'',
'            const freshRecords = await AttendanceModel.getReportRecordsByDateRange(startDate, endDate, this.currentUser);',
'',
'            let categoryChanged = false;',
'            const changedUids = new Set();',
'            for (const fr of freshRecords) {',
'                const prev = oldMap.get(String(fr.row_uid)) ||',
'                    (fr.log_id ? oldMap.get(String(fr.log_id)) : null) ||',
'                    oldMap.get(`${fr.personnel_id}_${fr.work_date}`) ||',
'                    oldMap.get(`${fr.personnel_id}_${fr.work_date}_empty`);',
'',
'                if (prev) {',
'                    const oldCat = prev.status_category || prev.status_key;',
'                    const newCat = fr.status_category || fr.status_key;',
'                    if (oldCat !== newCat) {',
'                        categoryChanged = true;',
'                        if (fr.row_uid) changedUids.add(String(fr.row_uid));',
'                        if (fr.log_id) changedUids.add(String(fr.log_id));',
'                        if (fr.personnel_id) changedUids.add(String(fr.personnel_id));',
'                        changedUids.add(`${fr.personnel_id}_${fr.work_date}`);',
'                    } else if (prev.check_in_time !== fr.check_in_time || prev.check_out_time !== fr.check_out_time) {',
'                        if (fr.row_uid) changedUids.add(String(fr.row_uid));',
'                        if (fr.log_id) changedUids.add(String(fr.log_id));',
'                        changedUids.add(`${fr.personnel_id}_${fr.work_date}`);',
'                    }',
'                }',
'            }'
].join(eol);

if (!content.includes(targetOldMap)) {
    console.error('Target old map not found in ReportsController.js');
    process.exit(1);
}
content = content.replace(targetOldMap, repOldMap);

// 2. In #bindEvents: add debounce timer 250ms
const targetBind = [
'    #bindEvents() {',
'        window.addEventListener(\'bma:realtime-delta-sync\', (e) => {',
'            this.syncReportsSilent(e.detail);',
'        });',
'        window.addEventListener(\'bma:realtime-sync\', () => {',
'            this.syncReportsSilent();',
'        });'
].join(eol);

const repBind = [
'    #bindEvents() {',
'        const triggerDebouncedReportSync = (detail) => {',
'            if (this._realtimeDebounceTimer) clearTimeout(this._realtimeDebounceTimer);',
'            this._realtimeDebounceTimer = setTimeout(() => {',
'                this.syncReportsSilent(detail);',
'            }, 250);',
'        };',
'        window.addEventListener(\'bma:realtime-delta-sync\', (e) => {',
'            triggerDebouncedReportSync(e.detail);',
'        });',
'        window.addEventListener(\'bma:realtime-sync\', () => {',
'            triggerDebouncedReportSync();',
'        });'
].join(eol);

if (!content.includes(targetBind)) {
    console.error('Target bind not found in ReportsController.js');
    process.exit(1);
}
content = content.replace(targetBind, repBind);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched ReportsController.js');
