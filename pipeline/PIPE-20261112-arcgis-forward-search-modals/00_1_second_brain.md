# Phase 0.1: Second Brain Notes & Past Pitfalls (RETRIEVE)

- **Task ID**: `PIPE-20261112-arcgis-forward-search-modals`
- **Date**: 2026-11-12
- **Linked Flows**: `FLOW_SPECIAL_REQ_01` (Special Attendance Request Flow), `FLOW_GPS_01` (Multi-Tier Reverse Geocoding & POI Resolution Flow), `FLOW_CHECKIN_01` (Checkin Layout Flow)

## 1. Relevant Architecture Decision Records (ADRs)
- **[[ADR_0024_ArcGIS_Primary_POI_Resolution_Architecture]]**:
  - ArcGIS World Geocoding Service reverseGeocode endpoint (`category=POI`, `distance=400`) resolved the missing POI and outdated landmark issue on OpenStreetMap.
  - Zero API Key required for public CORS reverse lookup.
  - Prefix formatting: $\le 30$m `"บริเวณ [ชื่อ]"`, $31-400$m `"ใกล้เคียง [ชื่อ]"`.
  - Deterministic 4-tier priorities and strict forbidden term filtering (`#isForbiddenLocationTerm`).
- **[[ADR_0021_GPS_5Tier_Nearby_Places_Resolution_Architecture]]**:
  - Overpass 1200ms timeout / HTTP 406 rate limit issues.
  - Anti-cache-poisoning and `#locationCache` management.
- **[[rule_remote_version_hard_cache_purge_autostamp]]**:
  - Mandatory Cache Version Sync across `version.json` and all 8 HTML files via `node ./.ai_map/vscode_ast_mapper.mjs`.

## 2. Past Pitfalls & Critical Traps to Avoid
1. **PITFALL 1: Hard Spatial Filter (`searchExtent`) in ArcGIS Forward Geocoding**:
   - `searchExtent` in `findAddressCandidates` cuts off any results outside the box completely (Hard Filter).
   - *Trap*: If set to Bangkok bounding box, users doing Off-Site work in Nonthaburi, Pathum Thani, Samut Prakan, or external field trips across Thailand will get **0 results**.
   - *Mitigation*: DO NOT use `searchExtent` as a default. Use `countryCode=THA` with `location={lng},{lat}` as a **Soft Proximity Bias**.
2. **PITFALL 2: Acronym Blindspot in ArcGIS (Thai Abbreviations)**:
   - ArcGIS/Nostra Map stores official formal names ("สถานีรถไฟฟ้า...", "สถานีตำรวจนครบาล...", "มหาวิทยาลัย...").
   - Searching "BTS หมอชิต" or "สน.ทองหล่อ" returns 0 candidates or wrong neighborhood.
   - *Mitigation*: Implement `Smart Thai Query Normalizer` on client-side model before querying ArcGIS.
3. **PITFALL 3: Semantic Discrepancy between Forward Search and Map Pin Drag**:
   - When searching via Photon/Nominatim, user gets OSM names; but dragging the pin 1m flips to ArcGIS name via `AttendanceModel.resolveLocationName`.
   - *Mitigation*: Unify Forward Geocoding to use ArcGIS `findAddressCandidates` as Tier 1, so search results and reverse geocode share the exact same Nostra/Esri POI database.
4. **PITFALL 4: Endpoint Selection (`findAddressCandidates` vs `suggest`)**:
   - `suggest` endpoint requires a 2nd network round-trip with `magicKey` to obtain `{lat, lng}`.
   - *Mitigation*: Use `findAddressCandidates` directly (Single Round-Trip), providing `location`, `Type`, `Place_addr`, `score`, and `extent` in one call.
