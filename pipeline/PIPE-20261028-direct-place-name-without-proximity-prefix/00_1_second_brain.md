# Phase 0.1: Second Brain Retrieval

- **Pipeline ID:** `PIPE-20261028-direct-place-name-without-proximity-prefix`
- **Context & Flow IDs:**
  - `FLOW_SPECIAL_REQ_01` (Special check-in request submission)
  - `FLOW_GPS_01` (GPS location naming and reverse geocoding)
  - `FLOW_LAYOUT_01` (Modal UI & display)
  - Relevant Rules:
    - `second_brain_vault/02_domain_logic_and_rules/rule_special_request_custom_gps_and_jitter.md`
    - `second_brain_vault/02_domain_logic_and_rules/rule_compact_action_buttons_and_approvals.md`

## Insights & Root Cause:
- Currently, when a user selects a place from autocomplete search results in `#modalSpecialRequest`, `updateCustomPinAndLocation` calls `AttendanceModel.resolveLocationName(lat, lng)`.
- `resolveLocationName` applies proximity prefixes (`"ใกล้เคียง <ชื่อ>"` or `"บริเวณ <ชื่อ>"`).
- Requirement: When the user chooses a specific place from search, record the exact place name without `"ใกล้เคียง"` or `"บริเวณ"` as the check-in location name (`check_in_location`).
- The check-out location (`check_out_location`) continues to use the designed randomized jitter resolution loop (`resolveJitteredCheckoutWithLocation`) as usual.

