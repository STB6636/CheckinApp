import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- 1. Testing checkin.html dropdown options ---');
const checkinHtml = fs.readFileSync('checkin.html', 'utf8');
const selectMatch = checkinHtml.match(/<select id="selectPastPageSize"[\s\S]*?<\/select>/);
assert(selectMatch, 'selectPastPageSize not found in checkin.html');
const selectContent = selectMatch[0];
console.log('Found selectPastPageSize:', selectContent);

const expectedOptions = ['5', '10', '15', '20', '30'];
expectedOptions.forEach(opt => {
    assert(selectContent.includes(`value="${opt}"`), `Option value=${opt} missing`);
});
console.log('Dropdown options check: PASSED');

console.log('\n--- 2. Testing CheckinController.js ---');
const controllerJs = fs.readFileSync('assets/js/controllers/CheckinController.js', 'utf8');
assert(controllerJs.includes('this.pastHistoryList = allHistory.filter(item => item.work_date !== todayIso).slice(0, 30);'),
    'pastHistoryList does not cap at slice(0, 30)');
assert(controllerJs.includes('AttendanceModel.getPersonalAttendanceHistory(this.currentUser.personnel_id, this.currentUser.id, 35)'),
    'getPersonalAttendanceHistory call does not use limit 35');
console.log('CheckinController limit and slice check: PASSED');

console.log('\n--- 3. Testing AttendanceModel.js ---');
const modelJs = fs.readFileSync('assets/js/models/AttendanceModel.js', 'utf8');
assert(modelJs.includes('getPersonalAttendanceHistory(personnelId, userId, limit = 35)'),
    'AttendanceModel getPersonalAttendanceHistory default limit is not 35');
console.log('AttendanceModel default limit check: PASSED');

console.log('\n--- 4. Testing Pagination with 30 items ---');
const dummyPastHistory = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, date: `2026-10-${30 - i}` }));

expectedOptions.forEach(sizeStr => {
    const pageSize = parseInt(sizeStr, 10);
    const totalPast = dummyPastHistory.length;
    const totalPages = Math.max(1, Math.ceil(totalPast / pageSize));
    
    // Simulate paging forward and backward
    let currentPage = 1;
    let seenItems = 0;
    while (currentPage <= totalPages) {
        const startIndex = (currentPage - 1) * pageSize;
        const paged = dummyPastHistory.slice(startIndex, startIndex + pageSize);
        assert(paged.length <= pageSize);
        seenItems += paged.length;
        if (currentPage < totalPages) {
            currentPage++;
        } else {
            break;
        }
    }
    assert.strictEqual(seenItems, 30, `Total items traversed for pageSize ${pageSize} should be 30`);
});
console.log('Pagination simulation test: PASSED');

console.log('\nALL QA CHECKS PASSED SUCCESSFULLY!');
