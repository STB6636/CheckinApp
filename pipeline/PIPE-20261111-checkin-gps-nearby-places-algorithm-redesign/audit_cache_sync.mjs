import fs from 'fs';

const v = JSON.parse(fs.readFileSync('version.json', 'utf8'));
console.log('version.json buildId:', v.buildId);

const files = [
  'index.html', 'checkin.html', 'dashboard.html', 'approvals.html',
  'reports.html', 'personnel.html', 'settings.html', 'users.html'
];

let allMatch = true;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const buildMatch = content.match(/CURRENT_APP_BUILD\s*=\s*['"]([^'"]+)['"]/);
  if (!buildMatch) {
    console.error(`FAIL: ${file} missing CURRENT_APP_BUILD`);
    allMatch = false;
    continue;
  }
  const appBuild = buildMatch[1];
  if (appBuild !== v.buildId) {
    console.error(`FAIL: ${file} CURRENT_APP_BUILD (${appBuild}) !== version.json (${v.buildId})`);
    allMatch = false;
  }
  
  // check ?v= tags
  const assetRegex = /(?:href|src)=['"]assets\/[^?]+(?:\?v=([^'"]+))?['"]/g;
  let m;
  let assetCount = 0;
  let mismatchedAssets = 0;
  while ((m = assetRegex.exec(content)) !== null) {
    assetCount++;
    const queryV = m[1];
    if (queryV !== v.buildId) {
      console.error(`FAIL: ${file} asset ${m[0]} has ?v=${queryV} !== ${v.buildId}`);
      mismatchedAssets++;
      allMatch = false;
    }
  }
  console.log(`OK: ${file} -> CURRENT_APP_BUILD=${appBuild}, verified ${assetCount} assets, mismatches=${mismatchedAssets}`);
}

if (allMatch) {
  console.log('CACHE_SYNC_AUDIT: PASS (100% synchronized across version.json and 8 HTML files)');
  process.exit(0);
} else {
  console.error('CACHE_SYNC_AUDIT: FAIL (Mismatches found)');
  process.exit(1);
}
