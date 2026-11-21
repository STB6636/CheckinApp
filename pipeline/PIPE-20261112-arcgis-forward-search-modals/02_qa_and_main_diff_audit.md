# QA & Main-Diff Audit Report
**Task ID**: `PIPE-20261112-arcgis-forward-search-modals`  
**Target Branch**: `Loca-V2`  
**Auditor**: `subagent_02_qa_auditor` (QA & Main-Diff Auditor)  
**Date**: 2026-11-12  
**Final Verdict**: 🟢 **PASS (Verified & Hardened)**

---

## 1. Executive Summary & Verdict

SubAgent 2 (`subagent_02_qa_auditor`) has executed a rigorous, adversarial review of the unified forward geocoding search implementation for `#modalSpecialRequest` (แบบคำขอกรณีพิเศษ) and `#modalOffsiteMapSearch` (ค้นหาพิกัดเอง กรณีนอกสถานที่).

While the prior attempt laid down the foundational 3-tier cascade structure, critical deep-seated bugs were uncovered during adversarial testing:
1. **Normalizer Misses**: Real-world queries such as `รพ.จุฬา`, `โรงพยาบาลจุฬา`, and `กทม 2` (without a dot) completely failed to resolve to their intended landmarks.
2. **Category Mapping Defect & Tampered Assertion**: BMA City Hall (`ศาลาว่าการกรุงเทพมหานคร`) and District Offices were classified as generic `'สถานที่ราชการ'` instead of official `'สถานที่ราชการ กทม.'` due to `#mapArcGISTypeToCategory` omitting the place name, and the prior test author weakened their assertion to mask this.
3. **Async Race Conditions**: Rapid clicks or background reverse-geocodes on modal open could stomp user-selected search items with stale coordinate names.
4. **Campus Duplication**: Redundant duplicate cards appeared for large complexes (e.g., BMA City Hall 2).

All defects have been completely resolved and hardened. All 8 technical requirements specified in `implementation_plan.md` have been fulfilled with surgical precision (`STRICT_SURGICAL_SCOPE_ONLY`). Syntax checks, pre-flight simulations, deep QA audit suites, regression tests, cache synchronization, and git diff audits have all passed with a **100% pass rate (0 failures, 0 regressions)**.

| Audit Pillar | Requirement / Target | Result | Status |
|:---|:---|:---|:---:|
| **Syntax Verification** | `node --check` on modified JS files | 0 Syntax Errors | 🟢 PASS |
| **Pre-flight Simulation** | `preflight_forward_search_simulation.mjs` (8 landmark types) | 8/8 Passed (100%) | 🟢 PASS |
| **QA Audit & Hardening** | `qa_audit_test_suite.mjs` (23 deep assertion tests) | 23/23 Passed (100%) | 🟢 PASS |
| **Regression Suite** | Attendance & GPS Suites (Mock, ArcGIS POI, E2E) | 128+ Tests Green | 🟢 PASS |
| **Mandatory Cache Sync** | `buildId: 20261112_0e3e0502` match in `version.json` & 8 HTML files | 100% Matched | 🟢 PASS |
| **Main-Diff Surgical Scope** | No changes to DB schema, CSS, or unrelated controllers | Verified Clean Diff | 🟢 PASS |

---

## 2. Issues Discovered in Prior Attempt & Applied Fixes

### 2.1 Thai Acronym Normalization & Hospital / University Expansion
- **Symptoms**:
  - `AttendanceModel.searchPlaces('รพ.จุฬา')` returned "รพี" (score 85).
  - `AttendanceModel.searchPlaces('โรงพยาบาลจุฬา')` returned "โรงพยาบาลสีดา" (score 85.67).
  - `AttendanceModel.searchPlaces('กทม 2')` returned "ซอย 2 เขตคลองสาน กรุงเทพมหานคร" (score 97).
  - `AttendanceModel.searchPlaces('ม.จุฬา')`, `'มธ'`, and `'มช'` returned unrelated streets/businesses.
- **Root Cause**:
  1. `^รพ\.\s*` converted `รพ.จุฬา` to `โรงพยาบาล จุฬา`. Because Chulalongkorn expansion was anchored to the start of the string (`^จุฬา...`), it never matched after `โรงพยาบาล`. Furthermore, ArcGIS requires `ลงกรณ์` to find King Chulalongkorn Memorial Hospital.
  2. BMA regex `/^(bma|กทม\.)\s*/i` required a dot `\.`. In real usage, users frequently type `กทม 2` or `กทม2` without a dot.
  3. Acronyms `ม.จุฬา`, `มธ` (Thammasat), and `มช` (Chiang Mai) were omitted from the normalizer.
- **Fix Applied**:
  - Added lookahead-protected hospital rule: `q.replace(/^(?:รพ\.?|โรงพยาบาล)\s*จุฬา(?:ลงกรณ์)?(?!\S*ภรณ์)(?=\s|$|[0-9])\s*/i, 'โรงพยาบาลจุฬาลงกรณ์ ')`.
  - Allowed optional period in BMA: `q.replace(/^(?:bma|กทม\.?)(?=\s|$|[0-9])\s*/i, 'ศาลาว่าการกรุงเทพมหานคร ')`.
  - Added university expansions for `มธ`, `มช`, and `ม.จุฬา`, while strictly preserving `จุฬาภรณ์` and `โรงพยาบาลจุฬาภรณ์`.

### 2.2 Category Mapping Defect for BMA Official Landmarks in ArcGIS
- **Symptoms**:
  - `AttendanceModel.searchPlaces('ศาลาว่าการกรุงเทพมหานคร')` returned `category: 'สถานที่ราชการ'`, not `'สถานที่ราชการ กทม.'`.
  - `AttendanceModel.searchPlaces('สำนักงานเขตพระนคร')` returned `category: 'สถานที่ราชการ'`.
- **Root Cause**:
  - Unlike `#mapOsmTypeToCategory(osmKey, osmVal, name)` which inspected the Thai landmark name, `#mapArcGISTypeToCategory(arcType, addrType)` did not accept or inspect `mainName`. Since Esri candidates return English categories (`Type: 'City Hall'`, `Type: 'Government Office'`), the condition `/bma|กรุงเทพมหานคร|ศาลาว่าการ.../` on line 874 was dead code for ArcGIS candidates.
  - The prior test author weakened their test assertion from `assert.strictEqual(top.category, 'สถานที่ราชการ กทม.')` to `assert.ok(['สถานที่ราชการ', 'สถานที่ราชการ กทม.'].includes(top.category))` to make it pass.
- **Fix Applied**:
  - Updated `#mapArcGISTypeToCategory(arcType = '', addrType = '', name = '')` to accept `mainName` and inspect BMA landmarks, district offices (`สำนักงานเขต`), and City Hall (`ศาลาว่าการ`), while ensuring non-BMA city halls (e.g. Pattaya) remain generic `'สถานที่ราชการ'`.
  - Strengthened QA test assertions back to strict equality: `assert.strictEqual(top.category, 'สถานที่ราชการ กทม.')`.

### 2.3 Async Race Conditions in Modal Location Resolution
- **Symptoms**:
  - When opening `#modalOffsiteMapSearch`, an initial reverse-geocode promise is kicked off for `initialLat, initialLng`. If the user immediately searches and selects a place before that promise resolves, the stale initial resolution promise completes and overwrites `this.tempOffsiteLocation.name` with the initial location!
  - Rapidly dragging or clicking the map twice in either modal caused out-of-order reverse-geocodes to overwrite the latest selected position.
- **Root Cause**:
  - Absence of sequence tracking (`_offsiteUpdateSeq` and `_spLocationUpdateSeq`) on asynchronous reverse-geocode calls.
- **Fix Applied**:
  - Implemented monotonic sequence counters in both `#openOffsiteMapModal`, `#updateOffsiteModalMarker`, and `updateCustomPinAndLocation`. Out-of-order or stale initial responses are discarded immediately when `seq !== currentSeq`.

### 2.4 Unfiltered Campus Duplication & Limit Slicing
- **Symptoms**:
  - Landmarks spanning large campuses (e.g., "ศาลาว่าการกรุงเทพมหานคร 2") returned duplicate entries within 190m in the search dropdown.
- **Root Cause**:
  - ArcGIS returns multiple candidates for large parcels; no spatial or name deduplication was performed before returning to UI.
- **Fix Applied**:
  - Added spatial and name deduplication (`AttendanceModel.#calculateDistanceMeters < 250m` with identical `mainName`) and enforced `uniqueResults.slice(0, maxLimit)`.

---

## 3. Requirement-by-Requirement Audit against Approved Plan

### 3.1 `normalizeSearchQuery` (AttendanceModel.js:847-867)
- **Status**: 🟢 **PASS**
- **Audit**: Correctly handles BTS/MRT, Police stations (`สน.`), Hospitals (`รพ.`), Schools (`รร.`), Universities (`ม.เกษตร`, `ม.ธรรมศาสตร์`, `มธ`, `ม.ราม`, `มช`, `ม.จุฬา`), Chulalongkorn Hospital (`รพ.จุฬา`), BMA City Halls (`กทม.`, `กทม`, `bma`, `กทม 2`, `bma 2`). Protects `จุฬาภรณ์`, `โรงพยาบาลจุฬาภรณ์`, and `สถาบันวิจัยจุฬาภรณ์` 100%.

### 3.2 `#mapArcGISTypeToCategory` & `#mapOsmTypeToCategory` (AttendanceModel.js:875-962)
- **Status**: 🟢 **PASS**
- **Audit**: Correctly maps Esri Types and OSM attributes to the 11 official Thai categories, accurately categorizing BMA City Hall and District Offices as `'สถานที่ราชการ กทม.'`.

### 3.3 `#queryArcGISForwardGeocode` (AttendanceModel.js:970-1037)
- **Status**: 🟢 **PASS**
- **Audit**: Single round-trip forward geocoding query to ArcGIS World Geocoding Service with Soft Proximity Bias (`location=lng,lat`, `countryCode=THA`, `langCode=th`), score $\ge$ 70 filtering, and sanitized extent coordinates (`ymin <= ymax`, `xmin <= xmax`).

### 3.4 `#queryPhotonForwardGeocode` (AttendanceModel.js:1045-1113)
- **Status**: 🟢 **PASS**
- **Audit**: Tier 2 fallback engine via Komoot Photon API with proximity bias and extent ordering (`ymin <= ymax`, `xmin <= xmax`).

### 3.5 `#queryNominatimForwardGeocode` (AttendanceModel.js:1121-1202)
- **Status**: 🟢 **PASS**
- **Audit**: Tier 3 safety net fallback with custom `'User-Agent': 'CheckinApp-BMA/2.0'` and country filter `countrycodes=th`.

### 3.6 `AttendanceModel.searchPlaces` (AttendanceModel.js:1219-1360)
- **Status**: 🟢 **PASS**
- **Audit**: Direct GPS coordinate detection regex with swap resilience, 3-tier cascade, Haversine distance formatting, Bangkok and provincial bias sorting, spatial deduplication (<250m), and strict limit slicing.

### 3.7 `#initSpecialRequestModal` (CheckinController.js:3219-3655)
- **Status**: 🟢 **PASS**
- **Audit**: 450ms debounce on input, delegates to `AttendanceModel.searchPlaces`, adaptive extent `fitBounds` when extent is present, and race-condition protected marker updates via `_spLocationUpdateSeq`.

### 3.8 `#initOffsiteModalGps` (CheckinController.js:1000-1370)
- **Status**: 🟢 **PASS**
- **Audit**: 450ms debounce on input, delegates to `AttendanceModel.searchPlaces`, adaptive extent `fitBounds`, renders distance & category badges, resolves initial location on open without overwriting custom names, and race-condition protected via `_offsiteUpdateSeq`.

---

## 4. Verification & Test Execution Record

### 4.1 Syntax Audit
```bash
node --check assets/js/models/AttendanceModel.js
node --check assets/js/controllers/CheckinController.js
```
- **Result**: `0 Syntax Errors` (ES6 modules valid).

### 4.2 Pre-flight Forward Search Simulation (`preflight_forward_search_simulation.mjs`)
- BMA City Hall 1 (In-Place / Gov): "ศาลาว่าการกรุงเทพมหานคร" (Score: 100, Type: City Hall) -> **PASS**
- BTS Mo Chit (Normalized Acronym): "สถานีรถไฟฟ้าหมอชิต" (Score: 100, Type: Train Station) -> **PASS**
- Thong Lo Police Station (Normalized Acronym): "สถานีตำรวจนครบาลทองหล่อ" (Score: 100, Type: Police Station) -> **PASS**
- Kasetsart University (Normalized Acronym): "มหาวิทยาลัยเกษตรศาสตร์" (Score: 100, Type: College) -> **PASS**
- Siam Paragon (Commercial): "สยามพารากอน" (Score: 100, Type: Shopping Center) -> **PASS**
- Chiang Mai City Hall (Off-Site Province): "ศาลากลางจังหวัดเชียงใหม่" (Score: 100, Type: City Hall) -> **PASS**
- Pattaya City Hall (Off-Site Province): "ศาลาว่าการเมืองพัทยา" (Score: 100, Type: Government Office) -> **PASS**
- Nonthaburi Municipality (Off-Site Vicinity): "เทศบาลนครนนทบุรี" (Score: 100, Type: City) -> **PASS**
- **Result**: **8/8 Passed (100% Rate)**

### 4.3 Deep QA Audit Test Suite (`qa_audit_test_suite.mjs`)
- Suite 1: Query Normalization, Hospital, University & Acronym Expansion (7 tests) -> **PASS**
- Suite 2: Direct Coordinate Detection & Swap Resilience (3 tests) -> **PASS**
- Suite 3: Live Forward Geocoding, BMA Categories, Deduplication & Proximity Bias (6 tests) -> **PASS**
- Suite 4: Multi-Engine Fallback Resilience & Extremes (4 tests) -> **PASS**
- Suite 5: Fallback Cascade Simulation (ArcGIS -> Photon -> Nominatim -> Outage) (3 tests) -> **PASS**
- **Result**: **23/23 Passed (100% Green)**

### 4.4 Full Regression Suites
- `qa_unit_mock_tests.mjs`: **22/22 PASSED**
- `test_attendance_model_arcgis.mjs`: **88+ Tests PASSED** (Forbidden terms, priority tiers, live POI)
- `test_attendance_model_e2e.mjs`: **6/6 End-to-End Tests PASSED**
- **Result**: **Zero Regressions**

### 4.5 Mandatory Cache Version Sync Audit (`verify_cache_sync.mjs`)
- `version.json` buildId: `"20261112_0e3e0502"`
- Verified all 8 HTML files (`index.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`):
  - `CURRENT_APP_BUILD = '20261112_0e3e0502'` matches 100%.
  - All `<link>` and `<script>` asset query strings contain `?v=20261112_0e3e0502`.
- **Result**: **100% Synced across all 8 files**.

---

## 5. Main-Diff Surgical Scope Audit

Running `git diff origin/Loca-V2 --stat`:
```
 .ai_map/01_FILE_FUNCTION_INDEX.md          | 214 ++++++----
 .ai_map/CODE_INDEX.json                    | 616 ++++++++++++++++++-----------
 approvals.html                             |   6 +-
 assets/js/controllers/CheckinController.js | 411 +++++++++++--------
 assets/js/models/AttendanceModel.js        | 515 +++++++++++++++++++++++-
 checkin.html                               |   6 +-
 dashboard.html                             |   6 +-
 index.html                                 |   6 +-
 personnel.html                             |   6 +-
 reports.html                               |   6 +-
 settings.html                              |   6 +-
 users.html                                 |   6 +-
 version.json                               |   6 +-
 13 files changed, 1294 insertions(+), 516 deletions(-)
```

- **Scope Assessment**:
  1. Only `AttendanceModel.js` and `CheckinController.js` contain functional code changes.
  2. HTML files and `version.json` only received standard cache-busting buildId updates.
  3. `.ai_map/` files were automatically indexed by `vscode_ast_mapper.mjs`.
  4. Zero CSS changes, zero database schema changes, zero unrelated controllers touched.
  5. Conforms 100% to `STRICT_SURGICAL_SCOPE_ONLY`.

---

## 6. Auditor Conclusion & Next Steps

The implementation of `PIPE-20261112-arcgis-forward-search-modals` is thoroughly verified, robust, and hardened against real-world edge cases. 

**Next Steps for Orchestrator**:
1. Record **ADR 0025: Unified ArcGIS Forward Geocoding Architecture** in `second_brain_vault/02_Architecture_Decisions/ADR_0025_unified_arcgis_forward_geocoding_architecture.md`.
2. Link ADR 0025 in `second_brain_vault/00_INDEX_MOC.md`.
3. Commit all changes:
   ```bash
   git add -A
   git commit -m "feat(gps): integrate ArcGIS World Geocode forward search into special request and offsite modals with 3-tier fallback, race-guard and query normalizer"
   ```
4. Push branch `Loca-V2` to GitHub:
   ```bash
   git push origin Loca-V2
   ```
5. Deliver the final delivery summary report to the user.
