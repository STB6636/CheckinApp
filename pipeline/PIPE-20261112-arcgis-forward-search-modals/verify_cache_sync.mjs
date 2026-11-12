import fs from 'node:fs';

const v = JSON.parse(fs.readFileSync('version.json', 'utf8'));
const targetBuild = v.buildId;
console.log('Target buildId:', targetBuild);

const files = ['index.html', 'checkin.html', 'dashboard.html', 'approvals.html', 'reports.html', 'personnel.html', 'settings.html', 'users.html'];
let allMatched = true;

for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    const buildMatch = text.includes(`CURRENT_APP_BUILD = '${targetBuild}'`);
    const qMatches = [...text.matchAll(/assets\/(?:css|js)\/[^"'?]+\?v=([^"'&>]+)/g)];
    const nonMatching = qMatches.filter(m => m[1] !== targetBuild);
    if (!buildMatch || nonMatching.length > 0) {
        console.error('MISMATCH in', f, { buildMatch, nonMatching: nonMatching.length });
        allMatched = false;
    } else {
        console.log(`PASS: ${f} (${qMatches.length} asset query tags synced to ${targetBuild})`);
    }
}

if (!allMatched) {
    console.error('FAILED: Not all files match target buildId!');
    process.exit(1);
} else {
    console.log('ALL 8 HTML FILES 100% SYNCED WITH version.json!');
}
