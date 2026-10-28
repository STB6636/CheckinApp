# Phase 0.1: Second Brain Retrieval

- **Pipeline ID:** `PIPE-20261028-approvals-gps-location-column`
- **Context & Flow IDs:**
  - `FLOW_SPECIAL_REQ_01` (Special Attendance Request & Approval)
  - `FLOW_GPS_01` (GPS data and location tracking)
  - `FLOW_LAYOUT_01` (Admin layout and responsive tables)
  - Relevant Rules:
    - `second_brain_vault/02_domain_logic_and_rules/rule_compact_action_buttons_and_approvals.md`
    - `second_brain_vault/02_domain_logic_and_rules/rule_special_request_custom_gps_and_jitter.md`
    - `second_brain_vault/02_domain_logic_and_rules/rule_dual_gps_columns_and_jitter.md`

## Insights & Architecture:
- In `attendance_logs`, special request records store `check_in_lat`, `check_in_lng`, `check_in_location` (as well as `check_out_lat`, `check_out_lng`, `check_out_location`).
- `AttendanceModel.getSpecialRequests` currently queries `attendance_logs` without selecting GPS columns.
- `ApprovalsController.js` and `approvals.html` present 7 columns with `colspan="7"` on group header rows.
- Adding "พิกัดสถานที่" requires:
  1. Selecting `check_in_lat, check_in_lng, check_in_location` in `AttendanceModel.getSpecialRequests`.
  2. Adding `<th>พิกัดสถานที่</th>` in `approvals.html`.
  3. Inserting the location and coordinate cell in `ApprovalsController.#buildRequestRowHtml`.
  4. Updating `colspan="7"` to `colspan="8"` in `ApprovalsController.#renderGroupedApprovalsTable`.
  5. Harmonizing column widths for symmetrical, balanced table responsiveness.

