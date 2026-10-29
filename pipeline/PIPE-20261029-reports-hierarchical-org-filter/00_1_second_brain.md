# Phase 0.1: Second Brain Retrieval

- **Pipeline ID:** `PIPE-20261029-reports-hierarchical-org-filter`
- **Context & Flow IDs:**
  - `FLOW_REPORTS_01` (Daily/Range Attendance Reports, Grouping & Tag Filtering)
  - `FLOW_LAYOUT_01` (Responsive Layout & Filter Docks)
  - `FLOW_AUTH_01` (Double-Layer RBAC: SuperAdmin vs Admin Bureau vs Admin Division)
  - Relevant Rules:
    - `second_brain_vault/01_architecture_decisions/adr_003_double_layer_rbac_hierarchy.md`
    - `second_brain_vault/02_domain_logic_and_rules/rule_dual_gps_columns_and_jitter.md`
    - `second_brain_vault/02_domain_logic_and_rules/rule_desktop_zero_scroll_and_gps_layout.md`

## Insights & Architecture Analysis:
1. **Target User Roles:**
   - **SuperAdmin (`currentUser.role === 'SuperAdmin'`):** Full organization visibility. Can filter Bureau > Division > Work Group across the entire system.
   - **Admin Bureau (`currentUser.role === 'Admin' && currentUser.visibility_level !== 'division'`):** Bureau scope. Bureau is preselected/fixed to their bureau, and can filter Division > Work Group.
   - **Admin Division (`currentUser.role === 'Admin' && currentUser.visibility_level === 'division'`):** Already locked to a single division; hierarchical filter dock remains hidden.
2. **Hierarchical Cascading Logic:**
   - All 3 dropdowns default to `"all"` ("แสดงทั้งหมด").
   - Bureau change -> filters Division dropdown, resets Division & Work Group to "all", re-renders report tables.
   - Division change -> filters Work Group dropdown, resets Work Group to "all", re-renders report tables.
   - Work Group change -> re-renders report tables.
3. **Safeguards (ข้อควรระวังสำคัญ):**
   - Must preserve the Tag multi-select filter dock (`#statusTagsFilterContainer`), status chips, and `this.selectedStatusKeys` completely intact.
   - Master tables container (`#reportTablesMasterContainer`), colgroup, table headers, and click-to-view profile modal (`#modalPersonnelResumeProfile`) must function normally without alteration.

