# Phase 0.1: Second Brain Retrieval

- **Pipeline ID:** `PIPE-20261028-smart-place-search-2s-debounce`
- **Context & Flow IDs:**
  - `FLOW_SPECIAL_REQ_01` (Special checkin request & modal)
  - `FLOW_GPS_01` (GPS & Location search)
  - `FLOW_LAYOUT_01` (Autocomplete dropdown UI)
  - Relevant Rules:
    - `second_brain_vault/02_domain_logic_and_rules/rule_special_request_custom_gps_and_jitter.md`

## Insights & Root Cause Analysis:
1. **Debounce 2 seconds:**
   - Currently, debounce is 350ms, which fires prematurely while users type complex Thai text.
   - Requirement: Wait 2,000ms (2 seconds) after typing stops, or fire immediately when user presses Enter or clicks Search button.
2. **Missing results for prefixes like "สำนัก":**
   - Nominatim uses exact word tokens and fails on Thai prefixes without trailing spaces (`"สำนัก"` returns 0 results).
   - Solution: Use Photon (Komoot Elasticsearch OSM) as primary search engine (`https://photon.komoot.io/api/?q=...`) which natively handles Thai substrings, prefixes ("สำนัก" -> 5+ results), and multi-word terms, with Nominatim as reliable fallback.
3. **GPS Province / Distance Bias:**
   - When user GPS is active, pass `lat` and `lon` to Photon (`&lat=${lat}&lon=${lng}`). Photon automatically prioritizes places within the user's province/neighborhood first.
   - For Nominatim fallback, supply `viewbox` and sort by distance.
4. **Multi-word queries ("วัดภู กรุงเทพ"):**
   - Photon natively splits whitespace tokens and matches both POI name and administrative boundaries (district, province).
   - Custom post-ranking will score items matching both tokens and nearby provinces higher.

