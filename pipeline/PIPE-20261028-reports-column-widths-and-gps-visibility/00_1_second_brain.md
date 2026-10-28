---
pipeline_id: "PIPE-20261028-reports-column-widths-and-gps-visibility"
phase: "0.1 Second Brain Retrieve"
related_rules:
  - "rule_dual_gps_columns_and_jitter"
  - "rule_desktop_zero_scroll_and_gps_layout"
flow_links:
  - "FLOW_REPORTS_01"
  - "FLOW_GPS_01"
---

# 0.1 Second Brain Retrieval
1. `rule_dual_gps_columns_and_jitter`:
   - Colspan calculation must be dynamic depending on visible columns:
     - With GPS: 9 cols (web), 8 cols (PDF)
     - Without GPS: 7 cols (web), 6 cols (PDF)
   - Null-safety guard in row rendering to prevent table disappearance when selecting tags.
2. `FLOW_REPORTS_01`:
   - `ReportsController.js` manages `#renderSingleStatusTableHtml`, `#buildGroupedRowsForTag`, `#buildSingleRowHtml`.
   - `SettingsModel` supplies `require_gps` setting (`true` / `false`).

