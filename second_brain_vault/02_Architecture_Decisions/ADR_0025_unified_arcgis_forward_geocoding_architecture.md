# ADR 0025: Unified ArcGIS Forward Geocoding Architecture for Special Request and Offsite Modals

- **Date**: 2026-11-12
- **Status**: Accepted & Verified (`Build ID: 20261112_0e3e0502`)
- **Task ID**: `PIPE-20261112-arcgis-forward-search-modals`
- **Linked Flows**: `FLOW_SPECIAL_REQ_01` (Special Attendance Request Custom Pin Resolution), `FLOW_CHECKIN_01` (Offsite Mode Coordinate Map Picker), `FLOW_GPS_01` (Multi-Tier Geocoding Architecture)

## Context & Problem Statement
In ADR-0024, ArcGIS World Geocoding was successfully integrated as the primary reverse geocoding engine for device GPS coordinates. However, forward text search in modal dialogs (`#modalSpecialRequest` and `#modalOffsiteMapSearch`) still used fragmented legacy providers:
1. **Semantic Discrepancy ("Place Name Jumping")**: Users searching for a venue received an OpenStreetMap name from Photon/Nominatim. Touching or moving the pin by 1 meter triggered `AttendanceModel.resolveLocationName` (ArcGIS), flipping the displayed name to a different naming convention and causing user confusion.
2. **Missing Thai BMA Government Venues**: OSM lacked sub-division government offices, district branches, municipal schools, and public health centers, which are fully present in Esri's Nostra Map Thailand database.
3. **Modal Architectural Inconsistency**: `#modalSpecialRequest` had debounced searching, while `#modalOffsiteMapSearch` had no debounce, required Enter/click, and lacked distance/category badge rendering.
4. **Acronym Blindspots & Spatial Filter Traps**:
   - ArcGIS stores formal names (`สถานีรถไฟฟ้าหมอชิต`), failing on user acronyms (`btsหมอชิต`, `รพ.จุฬา`, `กทม 2`).
   - Hard bounding boxes (`searchExtent`) in `findAddressCandidates` cut off offsite field trips outside Bangkok.
   - Rapid pin movements caused async out-of-order promise stomping.

## Decision & Implementation
Unified forward geocoding across both modals into a centralized **Unified 3-Tier Forward Search Engine** inside `AttendanceModel.js` and hooked into `CheckinController.js`:

### 1. Smart Thai Query Normalizer (`normalizeSearchQuery`)
- Regex rules expand common colloquial acronyms into official names before querying ArcGIS:
  - Transit: `/^bts\s*/i`, `/^mrt\s*/i` $\rightarrow$ `สถานีรถไฟฟ้า`
  - Police: `/^สน\.\s*/i` $\rightarrow$ `สถานีตำรวจนครบาล`
  - Hospitals: Lookahead protected `/^(?:รพ\.|โรงพยาบาล)\s*จุฬา(?!\S*ภรณ์)/i` $\rightarrow$ `โรงพยาบาลจุฬาลงกรณ์` (protecting `จุฬาภรณ์`), generic `/^รพ\.\s*/i` $\rightarrow$ `โรงพยาบาล`
  - Universities: `/^ม\.?\s*เกษตร/i` $\rightarrow$ `มหาวิทยาลัยเกษตรศาสตร์`, `/^ม\.?\s*ธรรมศาสตร์/i`, `/^ม\.?\s*ราม/i`, `/^ม\.?\s*จุฬา/i`
  - Administration: `/^(?:bma|กทม\.?)\s*(?:2|๒)/i` $\rightarrow$ `ศาลาว่าการกรุงเทพมหานคร 2 `, generic `/^(?:bma|กทม\.?)\s+/i` $\rightarrow$ `ศาลาว่าการกรุงเทพมหานคร `

### 2. Unified 3-Tier Cascading Architecture (`searchPlaces`)
- **Tier 0**: Direct coordinate regex detection (`lat, lng` or swapped `lng, lat`) with range checking $\rightarrow$ instant GPS card (0ms).
- **Tier 1 (Primary)**: Esri ArcGIS `findAddressCandidates` via `#queryArcGISForwardGeocode`:
  - `countryCode=THA`, `langCode=th`, `maxLocations=limit`
  - Soft Proximity Bias: `&location=${refLng},${refLat}` (prioritizes nearby places without blocking other provinces).
  - Sanitized extent: `ymin: Math.min(y1, y2)`, `ymax: Math.max(y1, y2)` for Leaflet `fitBounds`.
  - Filter: `score >= 70` and finite WGS84 coordinates.
- **Tier 2 (Fallback)**: Komoot Photon API via `#queryPhotonForwardGeocode` with inverted latitude correction.
- **Tier 3 (Safety Net)**: OSM Nominatim API via `#queryNominatimForwardGeocode` with custom `'User-Agent': 'CheckinApp-BMA/2.0'`.

### 3. Spatial & Name Deduplication and Province Normalization
- Deduplicates campus POIs located within $<250$m with identical `mainName`.
- Normalizes Bangkok province matching (`กรุงเทพมหานคร`, `กรุงเทพฯ`, `กทม.`, `Bangkok`) and strips `จ.`/`จังหวัด` prefixes for non-Bangkok provinces to guarantee accurate proximity weighting.

### 4. Controller Modal Integration & Monotonic Sequence Guards
- **Debounce Optimization**: Reduced debounce timer from 2,000ms to 450ms across both `#modalSpecialRequest` and `#modalOffsiteMapSearch`.
- **Race Condition Prevention**: Added monotonic sequence counters (`_offsiteUpdateSeq` and `_spLocationUpdateSeq`) discarding stale out-of-order reverse-geocoded responses when opening modals or dragging pins.
- **Shared UI Badges**: Rendered real distance tags (`📍 450 ม.` / `📍 1.2 กม.`) and 11 category badges (BMA Gov, Police, Education, Healthcare, Transit, Malls, etc.) across both modals.

## Verification & Impact
- **Unit & Integration Suite**: 23/23 tests passed in `qa_audit_test_suite.mjs`.
- **Pre-flight Live Tests**: 8/8 network simulations passed in `preflight_forward_search_simulation.mjs` (including off-site provinces: Chiang Mai, Pattaya, Nonthaburi).
- **Regression Suite**: 128/128 passed across all previous GPS, Checkin, and Model test suites. Total: 147+ tests green.
- **Mandatory Cache Version Sync**: Auto-stamped `buildId: 20261112_0e3e0502` matched 100% across `version.json` and all 8 HTML files.
- **Strict Surgical Scope**: 100% confined to `AttendanceModel.js`, `CheckinController.js`, `version.json`, `.ai_map/`, and 8 HTML files.
