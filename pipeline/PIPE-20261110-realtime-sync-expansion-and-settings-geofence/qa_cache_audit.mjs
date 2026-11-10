import fs from 'fs';

const version = JSON.parse(fs.readFileSync('version.json', 'utf8'));
const targetBuildId = "20261110_1f88c57a";
console.log('Target Build ID:', targetBuildId);
console.log('version.json buildId:', version.buildId);

if (version.buildId !== targetBuildId) {
  console.error(`MISMATCH: version.json has ${version.buildId} instead of ${targetBuildId}`);
  process.exit(1);
}

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

let allPassed = true;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  console.log(`=== Checking ${file} ===`);
  
  // Check CURRENT_APP_BUILD
  const buildMatch = content.match(/CURRENT_APP_BUILD\s*=\s*['"]([^'"]+)['"]/);
  if (buildMatch) {
    if (buildMatch[1] === targetBuildId) {
      console.log(`  CURRENT_APP_BUILD: PASS (${buildMatch[1]})`);
    } else {
      console.error(`  CURRENT_APP_BUILD: MISMATCH (${buildMatch[1]} !== ${targetBuildId})`);
      allPassed = false;
    }
  } else {
    console.error('  CURRENT_APP_BUILD: Not found!');
    allPassed = false;
  }

  // Check ?v= query params in local links and scripts
  const tagRegex = /<(?:link|script)[^>]+(?:href|src)=["']([^"']+)["'][^>]*>/gi;
  let tagMatch;
  let localAssetCount = 0;
  let correctAssetCount = 0;
  let mismatchedAssets = [];

  while ((tagMatch = tagRegex.exec(content)) !== null) {
    const url = tagMatch[1];
    if (url.includes('assets/')) {
      localAssetCount++;
      const vMatch = url.match(/[?&]v=([^&#]+)/);
      if (vMatch && vMatch[1] === targetBuildId) {
        correctAssetCount++;
      } else {
        mismatchedAssets.push({ url, actualVersion: vMatch ? vMatch[1] : 'none' });
        allPassed = false;
      }
    }
  }

  console.log(`  Local assets checked: ${localAssetCount}, Correctly stamped: ${correctAssetCount}`);
  if (mismatchedAssets.length > 0) {
    console.error(`  MISMATCHES found in ${file}:`, mismatchedAssets);
  }
});

console.log('-------------------------------------------');
console.log('OVERALL CACHE SYNC VERDICT:', allPassed ? 'PASS' : 'FAIL');
process.exit(allPassed ? 0 : 1);
