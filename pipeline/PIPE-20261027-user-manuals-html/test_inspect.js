const fs = require('fs');

const content = fs.readFileSync('docs/manual/manual-user.html', 'utf-8');

// Find all elements that look like interactive buttons or elements in mockups
const matches = content.match(/<(?:button|a|div|span)[^>]*?(?:บันทึก|เข้าสู่ระบบ|ยืนยัน|อนุมัติ|ส่งคำขอ|เปิดกล้อง|สลับ|ค้นหา|รีเซ็ต)[^>]*?>/gi) || [];
console.log('Interactive text elements found:', matches.length);
matches.slice(0, 20).forEach(m => console.log('  ', m));

