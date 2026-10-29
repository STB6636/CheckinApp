# Phase 0.1: Second Brain Retrieval
- **Task ID:** PIPE-20261029-reports-hierarchical-filter-settings-cascade
- **Target Flow:** `FLOW_REPORTS_01`, `FLOW_SETTINGS_01`
- **Related Rules:**
  - `second_brain_vault/02_domain_logic_and_rules/rule_reports_hierarchical_org_filter.md`

## Context & Findings:
1. **System Settings Affiliations Structure:**
   - In `system_settings`, organizational hierarchy is configured in `settings.affiliations` as an array of objects:
     `{ organization, bureau, division, group }`
   - `SettingsModel` already provides static utility methods:
     - `SettingsModel.getUniqueBureaus(settings)`
     - `SettingsModel.getUniqueDivisions(settings, filterBureau)`
     - `SettingsModel.getUniqueGroups(settings, filterBureau, filterDivision)`
2. **Sequential Selection Enforcement (การเลือกแบบไล่ลำดับชั้น):**
   - Step 1: User selects [สำนักงาน/กอง].
     - If "แสดงทั้งหมด" (`all`), [ส่วน/ฝ่าย] and [กลุ่มงาน] must be disabled with value `all`.
   - Step 2: Once a specific [สำนักงาน/กอง] is selected, [ส่วน/ฝ่าย] is enabled and populated with divisions under that bureau from `SettingsModel`.
     - If [ส่วน/ฝ่าย] is "แสดงทั้งหมด" (`all`), [กลุ่มงาน] remains disabled with value `all`.
   - Step 3: Once a specific [ส่วน/ฝ่าย] is selected, [กลุ่มงาน] is enabled and populated with work groups under that bureau and division from `SettingsModel`.
3. **Safeguards:**
   - Filtering via `#getFilteredRecords()` continues to feed TAG status filter badges, table rendering, and Excel export seamlessly.
   - Table columns, colgroups, modal `#modalPersonnelResumeProfile` on row click are unaffected.

