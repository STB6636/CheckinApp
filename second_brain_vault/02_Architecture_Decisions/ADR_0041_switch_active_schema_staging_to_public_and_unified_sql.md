# ADR 0041: Switch Active Supabase Schema from `staging` to `public` & Unified Additive SQL Migration (`v2.8–v2.11`)

- **Date**: 2026-11-21
- **Status**: Accepted & Verified (`Build ID: 20261121_e7690051`)
- **Task ID**: `PIPE-20261121-switch-schema-staging-to-public`
- **Linked Flows**: `FLOW_AUTH_01`, `FLOW_LAYOUT_01`, `FLOW_CHECKIN_01`, `FLOW_SETTINGS_01`, `FLOW_REPORTS_01`, `FLOW_APPROVALS_01`, `FLOW_TIME_CORRECTION_01`

---

## Context & Problem Statement
Branch `Loca-V2` previously targeted the isolated `staging` schema (`Config.SUPABASE_SCHEMA = 'staging'`) while accumulating schema additions across `v2.8–v2.11` (`+13` columns on `system_settings` and `+15` columns on `attendance_logs`). To switch `Loca-V2` over to `public` safely without breaking existing `public` data (`691` rows in `public.attendance_logs`), both the Single-Point-of-Truth config and a unified additive SQL migration for `public` were required.

---

## Decision & Implementation
1. **Single-Point-of-Truth Schema Switch (`assets/js/core/Config.js`, L9)**:
   - Updated `static SUPABASE_SCHEMA = 'public';`.
   - Verified `DatabaseService.js`, `AppLayout.js`, `CheckinController.js`, and `SettingsModel.js` dynamically follow `Config.SUPABASE_SCHEMA` (including Realtime channel names and `postgres_changes` schema subscriptions).
2. **Dynamic Error Hint (`assets/js/models/AttendanceModel.js`, L2708–2711)**:
   - Updated `submitTimeCorrectionRequest` missing-column error message to dynamically reference `sql/migration_public_full_loca_v2_sync.sql` when active schema is `'public'`.
3. **Unified Additive & Idempotent SQL Migration (`sql/migration_public_full_loca_v2_sync.sql`)**:
   - Adds all **13 missing columns** to `public.system_settings` (reaching 42 columns) and all **15 missing columns** to `public.attendance_logs` (reaching 40 columns).
   - **Legacy 691-Row Protection**: Uses `location_mode TEXT DEFAULT NULL` and `check_out_location_mode TEXT DEFAULT NULL` (instead of `NOT NULL DEFAULT 'ONSITE'`) so existing production rows retain `NULL` and accurately trigger geofence/remark fallback in `ReportsController` and `ApprovalsController`.
   - Includes idempotent FK `fk_public_attendance_correction_reviewer`, partial index `idx_public_attendance_correction_status`, `supabase_realtime` publication for all 4 `public` tables, `GRANT` statements, `NOTIFY pgrst, 'reload schema';`, and verification `SELECT` queries.
4. **Mandatory 10-HTML Cache Version Sync**:
   - Executed `node ./.ai_map/vscode_ast_mapper.mjs` → `buildId: 20261121_e7690051` synced across `version.json`, all 10 root HTML files, and `.ai_map/`.

---

## Verification Summary
- `node --check` passed on all 21 JS files (`0` errors).
- Live ESM check confirmed `Config.SUPABASE_SCHEMA === 'public'`, `DatabaseService.getActiveSchema() === 'public'`, and dynamic SQL hint in `AttendanceModel.submitTimeCorrectionRequest`.
- All 10 root HTML files 100% synced to `buildId: 20261121_e7690051`.
- SQL parity verified 13/13 `system_settings` + 15/15 `attendance_logs` columns with zero destructive DDL.
