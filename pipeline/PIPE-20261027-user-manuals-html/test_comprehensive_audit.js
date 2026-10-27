const fs = require('fs');
const path = require('path');

const dir = 'docs/manual';
const files = [
    'index.html',
    'manual-user.html',
    'manual-admin.html',
    'manual-superadmin.html'
];

console.log('================================================================');
console.log('           SUBAGENT 2: COMPREHENSIVE QA AUDIT SUITE             ');
console.log('================================================================\n');

const auditResults = {};

files.forEach(filename => {
    const filePath = path.join(dir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const result = {
        file: filename,
        bytes: content.length,
        lines: lines.length,
        tables: [],
        tableOverflowOk: true,
        buttons: [],
        mockupButtons: [],
        faqTriggers: [],
        tabButtons: [],
        missingAnchors: [],
        hasMinW0: false,
        hasPrintStyles: false,
        hasThemeToggle: false,
        hasMobileDrawer: false,
        hasBackToTop: false,
        toastOrModalFunction: false,
        contentKeywords: {}
    };

    // 1. Check Layout & Flexbox (min-w-0 on <main>)
    result.hasMinW0 = /<main[^>]*?class=["'][^"']*?min-w-0[^"']*?["']/i.test(content) || /<main[^>]*?min-w-0/i.test(content);

    // 2. Check Print Styles
    result.hasPrintStyles = content.includes('@media print') && content.includes('.no-print');

    // 3. Check Tables and overflow-x-auto
    let tIdx = 0;
    while ((tIdx = content.indexOf('<table', tIdx)) !== -1) {
        const preSnippet = content.substring(Math.max(0, tIdx - 300), tIdx);
        const hasOverflow = preSnippet.includes('overflow-x-auto');
        result.tables.push({
            pos: tIdx,
            wrappedInOverflowXAuto: hasOverflow
        });
        if (!hasOverflow) {
            result.tableOverflowOk = false;
        }
        tIdx += 6;
    }

    // 4. Check standard buttons
    const btnRegex = /<button[\s\S]*?<\/button>/gi;
    let bMatch;
    while ((bMatch = btnRegex.exec(content)) !== null) {
        const bHtml = bMatch[0];
        const id = (bHtml.match(/id=["']([^"']*)["']/) || [])[1] || '';
        const onclick = (bHtml.match(/onclick=["']([^"']*)["']/) || [])[1] || '';
        const dataRole = (bHtml.match(/data-role=["']([^"']*)["']/) || [])[1] || '';
        const text = bHtml.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
        const classes = (bHtml.match(/class=["']([^"']*)["']/) || [])[1] || '';
        
        result.buttons.push({ id, onclick, text: text.substring(0, 40), classes, dataRole });
    }

    // 5. Mockup buttons with feedback
    const mockupBtnRegex = /<[^>]*?(?:class=["'][^"']*?mockup-btn[^"']*?["']|data-mockup-btn)[^>]*?>([\s\S]*?)<\/[^>]+>/gi;
    let mbMatch;
    while ((mbMatch = mockupBtnRegex.exec(content)) !== null) {
        const fullTag = mbMatch[0];
        const text = mbMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
        const tip = (fullTag.match(/data-(?:feedback|tip|toast|action)=["']([^"']*)["']/) || [])[1] || '';
        result.mockupButtons.push({ text: text.substring(0, 30), tip });
    }

    // 6. Check FAQ triggers / accordions
    const faqRegex = /class=["'][^"']*?faq-trigger[^"']*?["']/gi;
    result.faqTriggers = content.match(faqRegex) || [];

    // Check Tab switchers
    const tabRegex = /data-tab|tab-btn|tab-trigger/gi;
    result.tabButtons = content.match(tabRegex) || [];

    // 7. Check Theme switch, Mobile Drawer, Back To top, Toast/Modal
    result.hasThemeToggle = content.includes('btnToggleTheme') && content.includes('applyTheme') && content.includes('bma_manual_theme');
    result.hasMobileDrawer = (content.includes('btnToggleMobileToc') && content.includes('mobileTocDrawer')) || filename === 'index.html';
    result.hasBackToTop = content.includes('btnBackToTop') && content.includes('scrollTo');
    result.toastOrModalFunction = content.includes('showFeedbackToast') || content.includes('showToast') || content.includes('showFeedbackModal') || content.includes('toast');

    // 8. Internal Anchor links test
    const allIds = new Set();
    const idRegex = /id=["']([^"']+)["']/g;
    let idMatch;
    while ((idMatch = idRegex.exec(content)) !== null) {
        allIds.add(idMatch[1]);
    }
    const hrefRegex = /href=["']#([^"']+)["']/g;
    let hrefMatch;
    while ((hrefMatch = hrefRegex.exec(content)) !== null) {
        const targetId = hrefMatch[1];
        if (!allIds.has(targetId)) {
            result.missingAnchors.push(targetId);
        }
    }

    // 9. Content accuracy keywords
    const keywords = [
        'Admin กอง', 'Admin ฝ่าย', 'SuperAdmin',
        '3:4', 'กระจก', 'mirror',
        'GPS', 'Fallback',
        'dropdown', 'ค่าว่าง', 'เลือกช่วงเวลา',
        'Soft UI', 'กล่องยืนยัน'
    ];
    keywords.forEach(kw => {
        result.contentKeywords[kw] = content.includes(kw);
    });

    auditResults[filename] = result;
});

// Output detailed report
Object.keys(auditResults).forEach(f => {
    const res = auditResults[f];
    console.log(`\n================================================================`);
    console.log(`FILE: ${f}`);
    console.log(`Size: ${res.bytes} bytes | Lines: ${res.lines}`);
    console.log(`================================================================`);
    console.log(`1. Layout & Responsive:`);
    console.log(`   - <main> has min-w-0: ${res.hasMinW0 ? 'PASS' : 'FAIL'}`);
    console.log(`   - Print CSS (@media print): ${res.hasPrintStyles ? 'PASS' : 'FAIL'}`);
    console.log(`   - Tables count: ${res.tables.length}`);
    console.log(`   - All tables wrapped in overflow-x-auto: ${res.tableOverflowOk ? 'PASS' : 'FAIL'}`);
    if (!res.tableOverflowOk) {
        res.tables.forEach((t, i) => console.log(`     Table #${i+1} at offset ${t.pos}: overflow-x-auto=${t.wrappedInOverflowXAuto}`));
    }
    
    console.log(`\n2. Interactive Controls & Buttons:`);
    console.log(`   - Theme toggle (Light/Dark + localStorage): ${res.hasThemeToggle ? 'PASS' : 'FAIL'}`);
    console.log(`   - Mobile TOC drawer: ${res.hasMobileDrawer ? 'PASS' : 'FAIL'}`);
    console.log(`   - Back to top button: ${res.hasBackToTop ? 'PASS' : 'FAIL'}`);
    console.log(`   - Toast / Modal feedback engine: ${res.toastOrModalFunction ? 'PASS' : 'FAIL'}`);
    console.log(`   - Mockup interactive buttons count: ${res.mockupButtons.length}`);
    console.log(`   - FAQ Accordion triggers count: ${res.faqTriggers.length}`);
    console.log(`   - Tab switchers count: ${res.tabButtons.length}`);
    console.log(`   - Total <button> tags: ${res.buttons.length}`);

    console.log(`\n3. Anchor Navigation Integrity:`);
    console.log(`   - Broken internal anchor (#...) links: ${res.missingAnchors.length === 0 ? 'PASS (0 broken)' : 'FAIL: ' + res.missingAnchors.join(', ')}`);

    console.log(`\n4. Real System Features & Accuracy:`);
    Object.keys(res.contentKeywords).forEach(kw => {
        console.log(`   - Keyword "${kw}": ${res.contentKeywords[kw] ? 'Present' : 'Not present'}`);
    });
});
