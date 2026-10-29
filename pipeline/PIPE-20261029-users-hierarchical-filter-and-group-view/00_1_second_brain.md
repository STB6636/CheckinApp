# Phase 0.1: Second Brain Retrieval
- **Task ID:** PIPE-20261029-users-hierarchical-filter-and-group-view
- **Target Flow:** `FLOW_USERS_01`, `FLOW_SETTINGS_01`
- **Related Rules:**
  - `second_brain_vault/02_domain_logic_and_rules/rule_reports_hierarchical_org_filter.md`
  - `second_brain_vault/01_architecture_decisions/adr_003_double_layer_rbac_hierarchy.md`

## Context & Architecture Insights:
1. **Hierarchical Org Filter Pattern:**
   - 3-tier sequential cascading dropdowns ([สำนักงาน/กอง] > [ส่วน/ฝ่าย] > [กลุ่มงาน])
   - Powered by `SettingsModel.getUniqueBureaus(this.settings)`, `SettingsModel.getUniqueDivisions(this.settings, bureau)`, and `SettingsModel.getUniqueGroups(this.settings, bureau, division)`
   - Sequential enforcement: [สำนักงาน/กอง] is enabled by default ('all'); [ส่วน/ฝ่าย] and [กลุ่มงาน] start disabled ('all') with visual cues (`opacity-60 cursor-not-allowed bg-slate-100`) and are unlocked step-by-step
   - Role visibility: visible only to `SuperAdmin` and `Admin` with visibility "สำนักงาน/กอง" (`this.isSuperAdmin || this.isAdminBureau`); hidden for `Admin` with visibility "ส่วน/ฝ่าย" (`isAdminDivision`)
2. **Two Grouping Views (มุมมองจัดกลุ่ม 2 มุมมอง - จาก PersonnelController):**
   - Mode 1 (`division`): `สำนักงาน/กอง > ส่วน/ฝ่าย`
   - Mode 2 (`group`): `สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน`
   - Powered by `PersonnelModel.groupPersonnel(filteredUsers, this.groupViewMode)`
   - Renders group headers with colored accents and running index numbers
3. **Safeguards:**
   - Table columns (6 columns: ลำดับ, Username, ชื่อ-นามสกุล, Role, ขอบเขตการมองเห็น, จัดการ) intact
   - Table 2 (คำสั่งอนุมัติเปลี่ยนรหัสผ่าน) intact
   - Action buttons (edit, delete, reset password) intact
   - Excel export and import intact

