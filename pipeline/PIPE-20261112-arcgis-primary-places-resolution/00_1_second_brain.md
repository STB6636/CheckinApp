# Second Brain Retrieval (Phase 0.1)
**Task ID**: `PIPE-20261112-arcgis-primary-places-resolution`  
**Flows**: `FLOW_GPS_01` (Multi-Tier Reverse Geocoding & POI Resolution Flow), `FLOW_CHECKIN_01` (Checkin Layout & GPS Card Flow)  
**Date**: 2026-11-12  

---

## Retrieved Notes & Architectural Decisions
1. **[[ADR_0021_GPS_5Tier_Nearby_Places_Resolution_Architecture]]**:
   - Initial 5-Tier architecture: Tier 0 Official In-Memory, Tier 1 POI (Overpass + Nominatim 80m), Tier 2 Soi, Tier 3 Radial Expansion, Tier 4 Semantic Fallback.
   - Identified limitation: Overpass & OSM in Thailand lack comprehensive/modern POIs in non-commercial areas, leading to missing places.
2. **[[ADR_0022_GPS_Hardware_Cache_Busting_And_Live_Clock_Format]]**:
   - Hardware cache busting (`maximumAge: 0`, `timeout: 12000`, `forceRefresh: true`).
   - `#btnRefreshGps` click handler with spinner and location cache clearing.
   - Clock formatting `${hh}:${mm} น.`.
   - Must be preserved 100% without regression.
3. **[[rule_gps_map_card_replica_and_shutter_overlay]] & [[rule_material_tailwind_gps_card_elevation]]**:
   - Leaflet embedded map, header with `#gpsCardHeaderSpinner` and `#gpsCardHeaderTitle` ("พื้นที่ใกล้เคียง").
   - Action button lock while resolving location (`isResolvingLocation = true`).
4. **[[rule_remote_version_hard_cache_purge_autostamp]]**:
   - Mandatory cache version auto-stamping via `.ai_map/vscode_ast_mapper.mjs`.
