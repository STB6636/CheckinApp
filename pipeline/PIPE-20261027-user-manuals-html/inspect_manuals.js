const fs = require('fs');
const path = require('path');

const dir = 'docs/manual';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    const filePath = path.join(dir, f);
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log(`\n==============================`);
    console.log(`FILE: ${f} (${content.length} bytes)`);
    console.log(`==============================`);

    // Check buttons
    const btnRegex = /<button[\s\S]*?<\/button>/gi;
    let match;
    let btnCount = 0;
    while ((match = btnRegex.exec(content)) !== null) {
        btnCount++;
        const btnHtml = match[0];
        const idMatch = btnHtml.match(/id=["']([^"']*)["']/i);
        const onclickMatch = btnHtml.match(/onclick=["']([^"']*)["']/i);
        const text = btnHtml.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
        console.log(`  Button #${btnCount}: id="${idMatch ? idMatch[1] : ''}" onclick="${onclickMatch ? onclickMatch[1] : ''}" text="${text}"`);
    }
    console.log(`Total Buttons: ${btnCount}`);

    // Check script contents & functions
    const scriptRegex = /<script[\s\S]*?>([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    let scriptCount = 0;
    while ((scriptMatch = scriptRegex.exec(content)) !== null) {
        scriptCount++;
        const scriptBody = scriptMatch[1].trim();
        console.log(`  Script #${scriptCount} length: ${scriptBody.length}`);
        // List declared functions
        const fnMatches = scriptBody.match(/function\s+([a-zA-Z0-9_]+)/g) || [];
        console.log(`    Functions declared: ${fnMatches.join(', ') || 'none'}`);
        // List event listeners
        const elMatches = scriptBody.match(/addEventListener\s*\(\s*['"]([a-zA-Z0-9_]+)['"]/g) || [];
        console.log(`    EventListeners: ${elMatches.join(', ') || 'none'}`);
    }
});

