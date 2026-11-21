# Final Delivery Summary: Switch Schema `staging` → `public` & Unified SQL Migration

- **Task ID**: `PIPE-20261121-switch-schema-staging-to-public`
- **Build ID**: `20261121_e7690051`
- **Target Branch**: `Loca-V2`
- **Status**: Completed, QA Verified (`PASS`), Committed & Pushed to `origin/Loca-V2`

## 1. Summary of Changes
1. **`assets/js/core/Config.js` (L9)**: Switched `Config.SUPABASE_SCHEMA` from `'staging'` to `'public'`.
2. **`assets/js/models/AttendanceModel.js` (L2708–2711)**: Updated missing-column error message to dynamically reference `sql/migration_public_full_loca_v2_sync.sql` when active schema is `'public'`.
3. **`sql/migration_public_full_loca_v2_sync.sql`**: Created unified additive & idempotent SQL migration for `public` covering all 13 missing `system_settings` columns and all 15 missing `attendance_logs` columns (`location_mode` and `check_out_location_mode` as `TEXT DEFAULT NULL` to protect 691 legacy rows), FK, partial index, Realtime publication for 4 tables, grants, `NOTIFY pgrst, 'reload schema';`, and verification queries.
4. **10-HTML Cache Sync & `.ai_map/`**: Auto-stamped `buildId: 20261121_e7690051` across `version.json` and all 10 root HTML files via `node ./.ai_map/vscode_ast_mapper.mjs`.
5. **Second Brain Ingestion**: Added `ADR_0041_switch_active_schema_staging_to_public_and_unified_sql.md` and updated `00_INDEX_MOC.md`.

## 2. QA Verification (`PASS`)
- `node --check`: 0 errors across all 21 JS files.
- Runtime ESM verification: `Config.SUPABASE_SCHEMA === 'public'`, `DatabaseService.getActiveSchema() === 'public'`, dynamic SQL hint verified.
- SQL parity: 13/13 `system_settings` + 15/15 `attendance_logs` columns verified, 0 destructive DDL.
- Cache Version Sync: 10/10 root HTML files 100% matched to `20261121_e7690051`.
