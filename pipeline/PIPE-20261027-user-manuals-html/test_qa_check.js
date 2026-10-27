const fs = require('fs');
const path = require('path');

const dir = 'docs/manual';
const files = ['index.html', 'manual-user.html', 'manual-admin.html', 'manual-superadmin.html'];

console.log('=== DETAILED QA AUDIT OF MANUALS ===\n');

files.forEach(file => {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log(`\n========================================`);
    console.log(`AUDITING FILE: ${file} (${content.length} bytes)`);
    console.log(`========================================`);

    // 1. Table overflow check
    let tIdx = 0;
    let tCount = 0;
    while ((tIdx = content.indexOf('<table', tIdx)) !== -1) {
        tCount++;
        const surrounding = content.substring(Math.max(0, tIdx - 200), tIdx);
        const hasOverflow = surrounding.includes('overflow-x-auto');
        console.log(`  [Table #${tCount}] Wrapper has overflow-x-auto? ${hasOverflow}`);
        if (!hasOverflow) {
            console.log(`    WARNING: Table #${tCount} is missing 'overflow-x-auto'! Surrounding snippet:\n    ${surrounding.trim().replace(/\n/g, ' ')}`);
        }
        tIdx += 6;
    }
    if (tCount === 0) console.log(`  [Tables] No tables found in this file.`);

    // 2. Buttons check
    const btnRegex = /<button[\s\S]*?<\/button>/gi;
    let bMatch;
    let bCount = 0;
    while ((bMatch = btnRegex.exec(content)) !== null) {
        bCount++;
        const fullBtn = bMatch[0];
        const idMatch = fullBtn.match(/id=["']([^"']*)["']/i);
        const onclickMatch = fullBtn.match(/onclick=["']([^"']*)["']/i);
        const text = fullBtn.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
        console.log(`  [Button #${bCount}] ID: "${idMatch ? idMatch[1] : ''}", onclick: "${onclickMatch ? onclickMatch[1] : ''}", Text: "${text}"`);
    }

    // 3. Check for mockups or interactive buttons inside mockups
    const mockupMatches = content.match(/<div[^>]*?(?:phone-mockup|screen-mockup|browser-mockup|mockup|bg-slate-900|bg-slate-800)[^>]*?>[\s\S]*?<\/div>/gi) || [];
    console.log(`  [Mockups] Potential mockup blocks count: ${mockupMatches.length}`);

    // Check for elements with cursor-pointer or hover that could be simulated buttons
    const pointerRegex = /<([a-z0-9]+)[^>]*?class=["'][^"']*?(?:cursor-pointer|btn|rounded-xl|rounded-2xl)[^"']*?["'][^>]*?>([\s\S]*?)<\/\1>/gi;
    let pMatch;
    let pCount = 0;
    const simulatedButtons = [];
    while ((pMatch = pointerRegex.exec(content)) !== null) {
        const tag = pMatch[1];
        const innerText = pMatch[2].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
        const fullTag = pMatch[0];
        // If it's inside mockup or says something like "บันทึกเวลา", "เลือกช่วงเวลา", "เปิดกล้อง", etc.
        if (/(บันทึกเวลา|เข้าสู่ระบบ|ยืนยัน|ส่งคำขอ|เปิดกล้อง|อนุมัติ|ปฏิเสธ|ล้างข้อมูล|ค้นหา)/.test(innerText)) {
            simulatedButtons.push({ tag, text: innerText, html: fullTag.substring(0, 150) });
        }
    }
    console.log(`  [Simulated Action Elements] Found ${simulatedButtons.length} action elements:`);
    simulatedButtons.forEach((sb, idx) => {
        console.log(`    #${idx+1} <${sb.tag}> "${sb.text}"`);
    });

    // 4. Accordions & Tabs
    const detailsCount = (content.match(/<details/gi) || []).length;
    const tabCount = (content.match(/data-tab/gi) || []).length;
    console.log(`  [Accordions] <details> tags: ${detailsCount}`);
    console.log(`  [Tabs] data-tab attributes: ${tabCount}`);
});
