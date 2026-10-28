# Phase 0.1: Second Brain Retrieval

- **Pipeline ID:** `PIPE-20261028-special-modal-place-autocomplete`
- **Context & Domain Logic:**
  - `FLOW_SPECIAL_REQ_01` (Special check-in request submission)
  - `FLOW_GPS_01` (GPS location search and reverse geocoding)
  - `FLOW_LAYOUT_01` (UI & modal interaction)
  - Relevant Rules:
    - `second_brain_vault/02_domain_logic_and_rules/rule_special_request_custom_gps_and_jitter.md`
    - `second_brain_vault/02_domain_logic_and_rules/rule_soft_ui_dashboard_sweetalerts.md`

## Insights:
- In `checkin.html`, Section 4 contains `#spMapSearchInput` and `#btnSpMapSearch`.
- Currently, when searching, it takes only `limit=1` and jumps directly.
- The user requires Google Maps style suggestions/autocomplete dropdown for near/similar places.
- We need:
  1. An absolute-positioned suggestion dropdown container `#spMapSearchResults` right below the search input.
  2. In `CheckinController.js`, handle debounce input (300ms) or explicit search button click.
  3. Query Nominatim with `limit=5` and format results showing title (POI/Building) and subtitle (Road/District/Province).
  4. Allow user to click to choose any item, moving the Leaflet marker and updating the coordinates.

