# ADR 0024: ArcGIS World Geocoding Primary POI Resolution & 4-Tier Priority Architecture

- **Date**: 2026-11-12
- **Status**: Accepted & Verified (`Build ID: 20261112_b48a3780`)
- **Task ID**: `PIPE-20261112-arcgis-primary-places-resolution`
- **Linked Flows**: `FLOW_GPS_01` (Multi-Tier Reverse Geocoding & POI Resolution Flow), `FLOW_CHECKIN_01` (Checkin Layout & GPS Card Flow), `FLOW_SPECIAL_REQ_01` (Special Attendance Request Custom Pin Resolution)

## Context & Problem Statement
Prior to this architectural upgrade, nearby places resolution relied heavily on OpenStreetMap (OSM) / Overpass API and Nominatim. In real-world urban and suburban usage across Bangkok and Thailand, this presented critical limitations:
1. **Outdated & Incomplete OSM POI Database**: OSM often lacked local landmarks, government sub-units, corporate headquarters, and daily commercial spots. Consequently, lookups frequently collapsed to street/soi names (`"ใกล้เคียง ซอยในพื้นที่"`) or broad administrative zones.
2. **HRMS BMA 2,000-Meter Over-Expansion Jump**: Inspections of HRMS BMA (`hrms-checkin.bangkok.go.th`) showed their ArcGIS implementation queried up to 2,000 meters (`maxLocations=100`), causing GPS cards to display landmarks 1.5–2.0 km away rather than where the user was actually standing.
3. **Multi-Scenario Handling**: The resolution engine must seamlessly support:
   - **In-Place (ในสถานที่)**: Verify against official boundaries ($\le 180$m) and geofence ($\le 400$m).
   - **Off-Site (นอกสถานที่)**: WFH, meetings, or field visits requiring accurate real-world venue names without failing or falling back to generic street names.
   - **Special Attendance Request (ยื่นคำขอกรณีพิเศษ)**: Real-time resolution for both device GPS and interactive Leaflet map pin drag-and-drop.
4. **Leakage of Raw House Numbers & Administrative Terms**: Unfiltered reverse geocodes exposed personal home addresses (e.g., `60/1 ซอย...`), raw postal codes, or bare district labels as place names.

## Decision & Implementation
Replaced the primary external POI provider with **ArcGIS World Geocoding Service** as the dedicated Tier 1 engine directly inside `assets/js/models/AttendanceModel.js`:

### 1. Zero-Key Public Endpoint with Radius Lock ($\le 400$m)
- Endpoint: `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode/`
- Parameters: `location={lng},{lat}&distance=400&f=pjson&langCode=th&outSR=4326`
- **Zero API Key Requirement**: Esri's public reverse geocode endpoint allows browser CORS requests without an API key for reverse lookup.
- **Strict 400m Radius Guard**: Fixed the HRMS 2,000m jump by bounding requests strictly to $\le 400$ meters. If ArcGIS returns an address with distance $> 400$m, it is discarded.

### 2. Strict POI Validation (`Addr_type === 'POI'`)
- ArcGIS returns `Addr_type: 'PointAddress'` or `'StreetAddress'` for personal residential house numbers (e.g. `60/1 ซอยขุมทรัพย์`).
- By requiring `addr.Addr_type === 'POI'`, the engine rejects raw personal house numbers and safely delegates to Tier 3 (Clean Soi name: `ใกล้เคียง ซอยขุมทรัพย์`), protecting user privacy and preventing stale number leakage.

### 3. Strict Forbidden Terms Filter (`#isForbiddenLocationTerm`)
Rejects terms that do not constitute meaningful standalone place names:
- Bounded administrative prefixes: `^(ตำบล|ต\.|อำเภอ|อ\.|จังหวัด|จ\.)` (ensuring government venues like `ศาลากลางจังหวัดนนทบุรี` are preserved while bare `จังหวัด นนทบุรี` is blocked).
- Standalone words: `ถนน`, `ถ.`, `แขวง`, `ข.` , `เขต`, `หมู่บ้าน`, `ม.`
- Numbers: House numbers (`\d+/\d+`), raw digits/zipcodes (`\d{5}`).
- Generic fallbacks: `"ซอยในพื้นที่"`.

### 4. Deterministic 4-Tier Priority Classification (`#classifyTargetPlace`)
When ranking candidate POIs within 400m:
- **Priority 1 (Highest - สถานที่ราชการและสถานที่สำคัญ)**: ศาลาว่าการ, สำนัก (with negative lookahead `สำนัก(?!งาน(ใหญ่|สาขา))`), สำนักงานเขต, กอง, กรม, กระทรวง, สถานีตำรวจ, โรงพยาบาล, โรงเรียน, มหาวิทยาลัย, ศาล, วัด, พระอาราม, สนามหลวง, ท่าเรือ, สะพาน, เสาหลักเมือง, อนุสาวรีย์, พิพิธภัณฑ์, **สโมสร**, ศาสนสถาน, สวนสาธารณะ, ศูนย์ราชการ.
- **Priority 2 (อาคารสำนักงานและพาณิชย์อื่นๆ)**: Corporate/Commercial buildings with specific names (อาคาร, ทาวเวอร์, ตึก, บิลดิ้ง, ซิตี้, เซ็นเตอร์, สำนักงานใหญ่/สาขา, บริษัท, บจก., บมจ., หจก., คอมเพล็กซ์).
- **Priority 3 (ระบบขนส่งและที่พักอาศัย)**: สถานีรถไฟ, BTS/MRT/ARL/SRT, ป้ายรถเมล์, ท่ารถ, สถานีขนส่ง, คอนโดมิเนียม, อพาร์ตเมนต์, หอพัก, แมนชั่น, โรงแรม, เรสซิเดนซ์.
- **Priority 4 (ร้านค้าและบริการสาธารณะ)**: ห้างสรรพสินค้า (เซ็นทรัล, เดอะมอลล์, พารากอน, เอ็มควอเทียร์), 7-Eleven / เซเว่น, ซูเปอร์มาร์เก็ต (โลตัส, บิ๊กซี, แม็คโคร, ท็อปส์), ร้านสะดวกซื้อ, คาเฟ่, ร้านอาหาร, ธนาคาร, ปั๊มน้ำมัน.

### 5. Distance vs. Priority Resolution Formula
- Distance delta $\le 20\text{m}$: Selects the higher priority tier (e.g. Government office at 35m beats commercial shop at 20m).
- Distance delta $> 20\text{m}$: Selects the closer real-world place.
- Prefix formatting:
  - $\le 30\text{m}$: `"บริเวณ [ชื่อสถานที่]"`
  - $31 - 400\text{m}$: `"ใกล้เคียง [ชื่อสถานที่]"`

### 6. Seamless Multi-Scenario Integration
- **In-Place (ในสถานที่)**: Tier 0 Official In-Memory resolves in $<1$ms ($\le 180$m). If beyond, Tier 1 ArcGIS resolves landmark, followed by Controller geofence check.
- **Off-Site (นอกสถานที่)**: Uses ArcGIS directly to accurately resolve WFH residences, external meeting venues, or field offices without boundary errors.
- **Special Attendance Request (ยื่นคำขอกรณีพิเศษ)**: `AttendanceModel.resolveLocationName(lat, lng)` automatically calls this pipeline on both device GPS acquisition and custom Leaflet pin moves.

## Verification & Impact
- **Node.js Syntax Audit**: `node --check assets/js/models/AttendanceModel.js` passed with 0 errors.
- **Live Preflight Network Test**: `preflight_arcgis_simulation.mjs` passed 5/5 live queries to Esri ArcGIS servers.
- **Comprehensive Unit & Stress Suite**: `test_attendance_model_arcgis.mjs` passed 88/88 test cases (including boundary edge-cases, mock latency, negative lookaheads, and null inputs).
- **End-to-End Simulation Suite**: `test_attendance_model_e2e.mjs` passed 6/6 test cases across In-Place, Off-Site, and Special Request scenarios.
- **Full Regression Test Suite**: Total 128/128 test assertions passed (including `qa_unit_mock_tests.mjs` and `qa_adversarial_verification.mjs`).
- **Cache Version Sync**: Auto-stamped `buildId: 20261112_b48a3780` synchronized across `version.json` and all 8 root HTML files.
- **Surgical Codebase Isolation**: 100% of functional code changes confined to `assets/js/models/AttendanceModel.js`.
