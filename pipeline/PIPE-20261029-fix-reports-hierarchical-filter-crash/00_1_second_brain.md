# Phase 0.1: Second Brain Retrieval
- **Task ID:** PIPE-20261029-fix-reports-hierarchical-filter-crash
- **Target Flow:** `FLOW_REPORTS_01`
- **Related Rules:**
  - `second_brain_vault/02_domain_logic_and_rules/rule_reports_hierarchical_org_filter.md`

## Key Finding:
- **Root Cause Analysis:**
  - In `ReportsController.js` (`#populateHierarchicalOrgFilter()` and `catch` in `loadReportData()`), `UIHelpers.escapeHtml()` is invoked.
  - However, `UIHelpers` does not define `escapeHtml()`.
  - Calling `UIHelpers.escapeHtml(b)` throws an immediate uncaught `TypeError: UIHelpers.escapeHtml is not a function`.
  - In `loadReportData()`, the execution fails during `#populateHierarchicalOrgFilter()`.
  - It jumps to `catch (err)`, which also calls `${UIHelpers.escapeHtml(...)}`, causing a second crash inside the error handler.
  - Consequently:
    1. Dropdown options are not populated (stay with static HTML `<option value="all">แสดงทั้งหมด</option>`).
    2. `#renderStatusTagFilterChips()` is never reached after data fetch, leaving Tag counts at initial `0`.
    3. `#renderSeparateTablesBySelectedTags()` is never reached, leaving table container empty.
    4. The error box in `#reportTablesMasterContainer` fails to render due to the secondary crash in the catch block.
- **Solution:**
  1. Add `static escapeHtml(str)` utility to `assets/js/core/UIHelpers.js`.
  2. Verify and guard all calls in `assets/js/controllers/ReportsController.js`.
  3. Ensure seamless population of [สำนักงาน/กอง] > [ส่วน/ฝ่าย] > [กลุ่มงาน], updating Tag count badges and rendering report tables.

