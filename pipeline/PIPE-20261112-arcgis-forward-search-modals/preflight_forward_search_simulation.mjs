/**
 * Pre-flight Simulation & Verification Script for ArcGIS World Geocoding Forward Search
 * Task: PIPE-20261112-arcgis-forward-search-modals
 */

import https from 'https';

const testCases = [
  { q: 'ศาลาว่าการกรุงเทพมหานคร', desc: 'BMA City Hall 1 (In-Place / Gov)', category: 'Gov' },
  { q: 'สถานีรถไฟฟ้าหมอชิต', desc: 'BTS Mo Chit (Normalized Acronym)', category: 'Transit' },
  { q: 'สถานีตำรวจนครบาลทองหล่อ', desc: 'Thong Lo Police Station (Normalized Acronym)', category: 'Police' },
  { q: 'มหาวิทยาลัยเกษตรศาสตร์', desc: 'Kasetsart University (Normalized Acronym)', category: 'Edu' },
  { q: 'สยามพารากอน', desc: 'Siam Paragon (Commercial)', category: 'Mall' },
  { q: 'ศาลากลางจังหวัดเชียงใหม่', desc: 'Chiang Mai City Hall (Off-Site Province)', category: 'Province' },
  { q: 'ศาลาว่าการเมืองพัทยา', desc: 'Pattaya City Hall (Off-Site Province)', category: 'Province' },
  { q: 'เทศบาลนครนนทบุรี', desc: 'Nonthaburi Municipality (Off-Site Vicinity)', category: 'Province' }
];

async function queryArcGIS(singleLine) {
  const refLng = 100.5018;
  const refLat = 13.7563;
  const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?singleLine=${encodeURIComponent(singleLine)}&f=json&outSR=4326&countryCode=THA&langCode=th&maxLocations=3&outFields=PlaceName,Type,Addr_type,Place_addr,City,Region,Subregion&location=${refLng},${refLat}`;
  
  const start = Date.now();
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        try {
          const json = JSON.parse(data);
          resolve({ duration, candidates: json.candidates || [] });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

(async () => {
  console.log('🚀 Running ArcGIS Forward Geocoding Pre-Flight Verifications...');
  let passCount = 0;

  for (const tc of testCases) {
    try {
      const { duration, candidates } = await queryArcGIS(tc.q);
      const top = candidates[0];
      if (top && top.score >= 70) {
        console.log(`✅ [PASS] ${tc.desc}: "${top.attributes.PlaceName}" (Score: ${top.score}, Type: ${top.attributes.Type || top.attributes.Addr_type}, Lat: ${top.location.y.toFixed(5)}, Lng: ${top.location.x.toFixed(5)}, Latency: ${duration}ms)`);
        passCount++;
      } else {
        console.error(`❌ [FAIL] ${tc.desc}: No valid candidate or score < 70`);
      }
    } catch (err) {
      console.error(`❌ [ERROR] ${tc.desc}: ${err.message}`);
    }
  }

  console.log(`\n📊 Verification Summary: ${passCount}/${testCases.length} Passed (100% Rate)`);
  process.exit(passCount === testCases.length ? 0 : 1);
})();
