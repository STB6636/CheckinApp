# ADR 0017: Single-Variable Schema Binding, Dual-Layer Settings Persistence & Watermark Realtime Sync (Rev 2)

- **Date**: 2026-11-10
- **Status**: Accepted & Verified (`Build ID: 20261110_7dac4bca`)
- **Task ID**: `PIPE-20261110-realtime-sync-expansion-and-settings-geofence`
- **Linked Flows**: `FLOW_02` (Check-in / Check-out), `FLOW_03` (Executive Dashboard), `FLOW_05` (Daily Reports), `FLOW_07` (System Settings)

## Context & Root Causes Solved
1. **Single-Point Schema Variable (`Config.SUPABASE_SCHEMA`)**:
   - Previously, `AppLayout.js` and `CheckinController.js` hardcoded `schema: 'public'` in `.on('postgres_changes', ...)`, whereas `Config.SUPABASE_SCHEMA` was `'staging'`.
   - **Decision**: All database clients (`DatabaseService.getActiveSchema()`) and Realtime listeners (`AppLayout.js`, `CheckinController.js`) now dynamically read `Config.SUPABASE_SCHEMA || 'public'` from `assets/js/core/Config.js`. Changing `Config.SUPABASE_SCHEMA` in 1 place switches the entire application between `'staging'` and `'public'`.
2. **Cumulative SQL Synchronization (`staging` + `public`)**:
   - Every schema change made on `staging` (`sql/create_staging_schema.sql`) is cumulatively tracked in `sql/alter_v2_8_loca_v2_schema.sql` for `public`, including `enforce_geofence_radius BOOLEAN NOT NULL DEFAULT true` and `ALTER PUBLICATION supabase_realtime ADD TABLE ...`.
3. **Dual-Layer Persistence for `enforce_geofence_radius` (`SettingsModel.js`)**:
   - `SettingsModel.updateSettings()` saves `enforce_geofence_radius` both to the top-level column `enforce_geofence_radius` AND inside `category_colors.enforce_geofence_radius` JSONB (with automatic fallback on PostgreSQL `42703`), guaranteeing cross-device persistence even before the SQL migration is executed.
4. **Watermark-Driven Delta Sync (`AttendanceModel.getTodaySyncWatermark()` + `AppLayout.js`)**:
   - Replicates the proven polling + WebSocket + Broadcast hybrid mechanism from `approvals.html` across `dashboard.html`, `reports.html`, and `checkin.html`.
5. **Cross-Table Status Row Movement in `ReportsController.syncReportsSilent()`**:
   - When a person's status changes across status tables (e.g., `absent` -> `ontime`), `syncReportsSilent()` preserves scroll position, re-renders category tables, and highlights the moved row with `bg-emerald-500/15`.
