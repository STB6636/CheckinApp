import fs from 'fs';

const v = JSON.parse(fs.readFileSync('version.json', 'utf8')).buildId;
const files = [
    'index.html',
    'checkin.html',
    'dashboard.html',
    'approvals.html',
    'reports.html',
    'personnel.html',
    'settings.html',
    'users.html'
];

let totalAssetsChecked = 0;
let errors = 0;

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes(`CURRENT_APP_BUILD = '${v}'`)) {
        console.error(`FAIL: ${file} missing CURRENT_APP_BUILD = '${v}'`);
        errors++;
    }
    const tagMatches = content.match(/(?:src|href)="assets\/[^"]+"/g) || [];
    for (const tag of tagMatches) {
        totalAssetsChecked++;
        if (!tag.includes(`?v=${v}`)) {
            console.error(`FAIL: ${file} has unversioned or mismatched asset: ${tag}`);
            errors++;
        }
    }
}

console.log(`Audited ${files.length} HTML files, checked ${totalAssetsChecked} asset tags.`);
if (errors === 0) {
    console.log(`ALL 8 HTML files and ${totalAssetsChecked} asset references perfectly matched buildId: ${v}`);
    process.exit(0);
} else {
    console.error(`Found ${errors} versioning errors!`);
    process.exit(1);
}
