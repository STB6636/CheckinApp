# ADR 0021: GPS 5-Tier Nearby Places Resolution & Searching Button Lock Architecture

- **Date**: 2026-11-11
- **Status**: Accepted & Verified (`Build ID: 20261111_e2c03bc2`)
- **Task ID**: `PIPE-20261111-checkin-gps-nearby-places-algorithm-redesign`
- **Linked Flows**: `FLOW_GPS_01` (Multi-Tier Reverse Geocoding & POI Resolution Flow), `FLOW_CHECKIN_01` (Checkin Layout & GPS Card Flow)

## Context & Problem Statement
Users reported that when checking in or opening the GPS card on `checkin.html`, coordinates frequently showed:
`"ใกล้เคียงซอย xxxx (พิกัด)"` (specifically collapsing to `"ใกล้เคียง ซอยในพื้นที่ (lat, lng)"`), even in dense urban Bangkok areas surrounded by dozens of landmarks, shops, or government departments.
Furthermore, users noted that while the system was searching for nearby places, the UI should indicate active progress via a spinner icon at the GPS header (retaining "พื้นที่ใกล้เคียง" title) and prevent premature check-in button clicks until the place name is fully resolved.

Empirical testing on 7 real Bangkok landmarks revealed 100% failure rate in the legacy algorithm caused by 5 interconnected root causes:
1. **Overpass 1200ms Timeout & HTTP 406**: Unindexed public queries timed out or failed with HTTP 406 because `'Accept': 'application/json'` rejected OSM's `application/osm3s+json`.
2. **Hierarchy Inversion**: Street/soi search was called before evaluating nearby places (>22m).
3. **Nominatim Missing Zoom 18**: Only queried zoom 19/20 (point/road features), omitting zoom 18 (building/landmark level).
4. **Ignoring Official Locations in Memory**: Failed to check `official_locations` configured in the system.
5. **Hardcoded Fallback String**: Hardcoded `"ใกล้เคียง ซอยในพื้นที่ (${lat.toFixed(5)}, ${lng.toFixed(5)})"` at line 562.

## Decision & Implementation
Implemented a resilient **5-Tier Nearby Places Resolution Pipeline & Button Lock** in `AttendanceModel.js`, `CheckinController.js`, and `checkin.html`:

1. **Tier 0: In-Memory Official Locations (0ms Latency, 100% Uptime)**:
   - Matches against `options.officialLocations` or `Config.DEFAULT_SETTINGS.official_locations`.
   - Distance $\le \max(\text{radius\_meters}, 180\text{m})$ resolves immediately to `"บริเวณ [ชื่อสถานที่]"` in $< 1$ms.
   - Respects `is_active !== false` admin settings.

2. **Tier 1: High-Priority POI Places Over Street/Soi (0–150m)**:
   - Queries Nominatim at zoom=18 (building), zoom=19, and zoom=20 with `'Accept': 'application/json, application/osm3s+json, */*'` and custom `User-Agent`.
   - Races distributed Overpass mirrors (`lz4`, `de`, `kumi`) via `Promise.any` with targeted POI query.
   - Ranks POIs (Government, Landmarks, Transit, Commercial) across 0–150m.
   - If found, returns `"บริเวณ [POI]"` ($\le 25$m) or `"ใกล้เคียง [POI]"` ($25\text{m} < \text{dist} \le 150\text{m}$).

3. **Tier 2: Clean Soi / Sub-Soi (Only When Zero POIs Exist)**:
   - Evaluates `#extractCleanSoiOrSubSoi` only after confirming zero POIs within range.
   - Accurately captures Thai sub-sois (e.g. `"ซอยพร้อมจิต แยก 2"`).

4. **Tier 3: Targeted Radial Retry (180m, 300m)**:
   - Expands search circle when the tight 80m boundary lacks elements, prioritizing places before streets.

5. **Tier 4: Smart Semantic Fallback & Anti-Cache-Poisoning**:
   - Synthesizes clean administrative address (`"บริเวณ [ถนน] แขวง[แขวง] เขต[เขต]"` for Bangkok, `"ตำบล/อำเภอ/จ.[จังหวัด]"` for provinces).
   - Zero raw coordinate numbers in parentheses.
   - Protects `#locationCache` against cache-poisoning during temporary network dropouts.
   - Added `clearLocationCache()` and `bypassCache` options.

6. **GPS Header Spinner & Action Button Lock**:
   - In `checkin.html`: Preserved header title `"พื้นที่ใกล้เคียง"` and added `#gpsCardHeaderSpinner` (`fa-spinner fa-spin`).
   - While searching (`isResolvingLocation === true`):
     - Displays `#gpsCardHeaderSpinner` to reassure user of background activity.
     - Disables `#btnSubmitCheckinMain` with `opacity-60 cursor-not-allowed pointer-events-none` and displays `"กำลังค้นหาสถานที่ใกล้เคียง..."`.
     - Adds secondary guard in `#handleMainCheckin` alerting users if invoked prematurely.
   - When resolved: Hides spinner, sets place name, and unlocks button immediately.

## Verification & Impact
- **Unit Tests**: 22/22 passed in `qa_unit_mock_tests.mjs` (handling NaN, null options, Thai regex, cache recovery).
- **Integration Tests**: 32/32 passed in `qa_verify_gps_places.mjs` across real Bangkok landmarks (Siam Paragon, Ari, Sukhumvit 39, Din Daeng, Sanam Luang).
- **Button Lock Tests**: 16/16 passed in `qa_verify_gps_button_lock.mjs`.
- **Cache Version Sync**: Auto-stamped `buildId: 20261111_e2c03bc2` synchronized 100% across `version.json` and all 8 HTML files.
- **Git Scope**: Strictly confined to `AttendanceModel.js`, `CheckinController.js`, and `checkin.html` (`STRICT_SURGICAL_SCOPE_ONLY`).
