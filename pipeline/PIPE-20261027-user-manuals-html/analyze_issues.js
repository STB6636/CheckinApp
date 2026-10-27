const fs = require('fs');
const path = require('path');

const manualDir = 'docs/manual';
const files = ['index.html', 'manual-user.html', 'manual-admin.html', 'manual-superadmin.html'];

console.log('=== ANALYZING MANUALS FOR BUGS & LAYOUT ISSUES ===\n');

files.forEach(f => {
    const fullPath = path.join(manualDir, f);
    const content = fs.readFileSync(fullPath, 'utf-8');
    console.log(`\n--------------------------------------------------`);
    console.log(`FILE: ${f} (${content.length} bytes, ${content.split('\n').length} lines)`);
    console.log(`--------------------------------------------------`);

    // 1. Check all tables
    let tableIndex = 0;
    let tableMatchCount = 0;
    while ((tableIndex = content.indexOf('<table', tableIndex)) !== -1) {
        tableMatchCount++;
        const snippetBefore = content.substring(Math.max(0, tableIndex - 200), tableIndex);
        const hasOverflow = snippetBefore.includes('overflow-x-auto');
        if (!hasOverflow) {
            console.log(`  [ALERT] Table #${tableMatchCount} at char ${tableIndex} missing overflow-x-auto wrapper! Snippet before:\n${snippetBefore.trim()}`);
        }
        tableIndex += 6;
    }
    console.log(`  Total tables: ${tableMatchCount}`);

    // 2. Check all buttons and clickable elements
    const buttonRegex = /<button[\s\S]*?<\/button>/gi;
    let btn;
    let totalBtns = 0;
    while ((btn = buttonRegex.exec(content)) !== null) {
        totalBtns++;
        const bHtml = btn[0];
        const id = (bHtml.match(/id=["']([^"']*)["']/) || [])[1] || '';
        const onclick = (bHtml.match(/onclick=["']([^"']*)["']/) || [])[1] || '';
        const text = bHtml.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
        const classes = (bHtml.match(/class=["']([^"']*)["']/) || [])[1] || '';
        console.log(`  Btn #${totalBtns}: id="${id}" | onclick="${onclick}" | text="${text.substring(0, 30)}"`);
    }

    // 3. Check for any elements that look like buttons but are div / a / span with button classes or cursor-pointer without href or onclick
    const pseudoBtnRegex = /<(div|span|a)\s+[^>]*class=["'][^"']*(?:btn|cursor-pointer)[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi;
    let pBtn;
    let pseudoCount = 0;
    while ((pBtn = pseudoBtnRegex.exec(content)) !== null) {
        pseudoCount++;
        const tag = pBtn[1];
        const pHtml = pBtn[0];
        const href = (pHtml.match(/href=["']([^"']*)["']/) || [])[1] || '';
        const onclick = (pHtml.match(/onclick=["']([^"']*)["']/) || [])[1] || '';
        const id = (pHtml.match(/id=["']([^"']*)["']/) || [])[1] || '';
        const text = pBtn[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
        if (tag !== 'a' || (!href && !onclick)) {
            console.log(`  Pseudo-btn #${pseudoCount}: <${tag}> id="${id}" href="${href}" onclick="${onclick}" text="${text.substring(0, 30)}"`);
        }
    }

    // 4. Check broken anchor links
    const hrefRegex = /href=["']#([^"']+)["']/g;
    let hrefMatch;
    const anchorTargets = new Set();
    const idRegex = /id=["']([^"']+)["']/g;
    let idMatch;
    while ((idMatch = idRegex.exec(content)) !== null) {
        anchorTargets.add(idMatch[1]);
    }
    const missingAnchors = [];
    while ((hrefMatch = hrefRegex.exec(content)) !== null) {
        const targetId = hrefMatch[1];
        if (!anchorTargets.has(targetId)) {
            missingAnchors.push(targetId);
        }
    }
    if (missingAnchors.length > 0) {
        console.log(`  [ALERT] Broken anchor links: ${missingAnchors.join(', ')}`);
    } else {
        console.log(`  Anchor links: All internal #${'...'} links matched valid IDs.`);
    }

    // 5. Check CSS / Layout issues
    // Check for fixed pixel widths that can break mobile
    const fixedWidths = content.match(/w-\[\d{3,}px\]/g) || [];
    if (fixedWidths.length > 0) {
        console.log(`  Fixed widths found: ${Array.from(new Set(fixedWidths)).join(', ')}`);
    }
    const minWidths = content.match(/min-w-\[\d{3,}px\]/g) || [];
    if (minWidths.length > 0) {
        console.log(`  Min widths found: ${Array.from(new Set(minWidths)).join(', ')}`);
    }
});

