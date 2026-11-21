# Implementation Report: Realtime Differential Sync, Geofence Radius Toggle & Tailwind Switches (Rev 2)

**Task ID:** `PIPE-20261110-realtime-sync-expansion-and-settings-geofence`  
**Subagent:** `subagent_01_implementer`  
**Date:** 2026-11-10  
**Build ID:** `20261110_7dac4bca`  
**Status:** Completed & Verified (0 Syntax Errors)

---

## 1. Summary of Surgical Changes (Strict Surgical Scope)

### 1.1 `sql/create_staging_schema.sql` (Lines 23–38 & End)
- Added `enforce_geofence_radius BOOLEAN NOT NULL DEFAULT true` column to `staging.system_settings`.
- Added `UPDATE staging.system_settings SET enforce_geofence_radius = COALESCE((category_colors->>'enforce_geofence_radius')::boolean, enforce_geofence_radius, true);`.
- Appended `DO $$ ... END $$;` publication block to attach `staging.attendance_logs`, `staging.system_settings`, `staging.personnel`, and `staging.holidays` to `PUBLICATION supabase_realtime`.
- Appended `NOTIFY pgrst, 'reload schema';`.

### 1.2 `sql/alter_v2_8_loca_v2_schema.sql` (Lines 1–68)
- Updated as Cumulative Public Migration:
  1. `ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS official_locations ...;`
  2. `ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS enforce_geofence_radius BOOLEAN NOT NULL DEFAULT true;`
  3. `UPDATE public.system_settings SET enforce_geofence_radius = ...;`
  4. Updated `remarks` in `public.system_settings` for offsite duty reasons.
  5. `ALTER TABLE public.attendance_logs ADD COLUMN IF NOT EXISTS location_mode TEXT NOT NULL DEFAULT 'ONSITE', ADD COLUMN IF NOT EXISTS distance_from_official_meters DOUBLE PRECISION ...;`
  6. Added `work_mode`, `offsite_reason`, `check_out_work_mode`, `check_out_offsite_reason` to `public.attendance_logs`.
  7. `DO $$ ... END $$;` publication block for `public.attendance_logs`, `public.system_settings`, `public.personnel`, and `public.holidays`.
  8. `NOTIFY pgrst, 'reload schema';`.

### 1.3 `assets/js/core/DatabaseService.js` (Lines 25–85)
- Added `static getActiveSchema()` returning `(typeof Config !== 'undefined' && Config.SUPABASE_SCHEMA) ? Config.SUPABASE_SCHEMA : 'public'`.
- Added getter `get activeSchema() { return DatabaseService.getActiveSchema(); }`.
- In `#initClient()`, replaced inline fallback with `const activeSchema = DatabaseService.getActiveSchema();`.
- Added `broadcastRealtimeEvent(eventName, payload)` transmitting over Supabase broadcast channel `'bma_global_realtime_bus'`.

### 1.4 `assets/js/models/SettingsModel.js` (Lines 120–135 & 165–275)
- In `getSettings(forceRefresh = false)`:
  - Reads `enforce_geofence_radius` primarily from database column `data.enforce_geofence_radius`.
  - Fallback to `data.category_colors?.enforce_geofence_radius`.
  - Fallback to `localStorage.getItem('bma_enforce_geofence_radius')`.
  - Syncs back to `localStorage.setItem('bma_enforce_geofence_radius', String(enforceGeofence))`.
- In `updateSettings(payload)`:
  - Calculates `const enforceGeofenceFlag = Boolean(payload.enforce_geofence_radius !== false);`.
  - Embeds into `category_colors` JSONB as dual-layer persistence: `const mergedCategoryColors = { ...(payload.category_colors || Config.DEFAULT_SETTINGS.category_colors), enforce_geofence_radius: enforceGeofenceFlag };`.
  - Includes both in `updateData`.
  - In error fallback (`error.code === '42703'`), removes `enforce_geofence_radius` and retains `category_colors: mergedCategoryColors` so settings are saved to Supabase without loss even before running SQL.
  - Broadcasts `settings_updated` event via `DatabaseService.getInstance().broadcastRealtimeEvent()`.

### 1.5 `assets/js/models/AttendanceModel.js` (End of Class)
- Added static method `getTodaySyncWatermark()`:
  - Queries latest 50 attendance logs of today and `system_settings` (`id = 1`).
  - Generates lightweight hash signatures `attendanceSignature` and `settingsSignature`.
  - Returns `{ attendanceSignature, settingsSignature, settingsRow }`.

### 1.6 `assets/js/components/AppLayout.js` (Lines 20–25 & 597–820)
- Added static fields `#lastAttendanceWatermark = null;` and `#lastSettingsWatermark = null;`.
- In `refreshNotificationBell()`:
  - Calls `AttendanceModel.getTodaySyncWatermark()`.
  - Dispatches `bma:realtime-delta-sync` when `attendanceSignature` changes.
  - Clears `sessionStorage` and dispatches `bma:settings-updated` & `bma:realtime-delta-sync` when `settingsSignature` changes.
- In `initAdminRealtimeSync()`:
  - Uses `const activeSchema = (typeof Config !== 'undefined' && Config.SUPABASE_SCHEMA) ? Config.SUPABASE_SCHEMA : 'public';`.
  - Sets channel to `` `bma_admin_realtime_${activeSchema}` `` and subscriptions for `attendance_logs`, `password_reset_requests`, `personnel`, and `system_settings` all to `schema: activeSchema`.
  - Subscribed to `'bma_global_realtime_bus'` broadcast for `settings_updated` and `attendance_updated`.
  - Adjusted polling interval from 15s to **6s**.

### 1.7 `assets/js/controllers/ReportsController.js` (Lines 970–1040)
- In `syncReportsSilent()`:
  - Compares `freshRecords` against `oldRecords`.
  - If any person changes `status_key` (moving across status tables, e.g. from "ไม่ลงเวลา" to "ปฏิบัติงานปกติ"):
    - Preserves `window.scrollY`.
    - Re-renders all separate tables via `this.#renderSeparateTablesBySelectedTags(false)`.
    - Restores `window.scrollY` instantly.
    - Applies green highlight `bg-emerald-500/15` (fade out over 2200ms) to the person's row in the new table.
  - If within the same table, performs in-place cell update with `DOMDiffHelper.highlightRowUpdate(row)`.

### 1.8 `assets/js/controllers/CheckinController.js` (Lines 79–85, 122–165, 595–640, 800–895)
- In `init()`: Changed to `this.settings = await SettingsModel.getSettings(true);` to guarantee fresh fetch from Supabase on reload/new link.
- In `#initRealtimeSettingsListener()`:
  - Uses `const activeSchema = (typeof Config !== 'undefined' && Config.SUPABASE_SCHEMA) ? Config.SUPABASE_SCHEMA : 'public';`.
  - Listens to `bma_checkin_settings_${activeSchema}` and `bma_global_realtime_bus`.
  - Added 5s background sync polling when `!document.hidden`.
- In `#renderGeofenceStatusUI()`:
  - Checked `enforce_geofence_radius === false || require_gps === false` **before** checking GPS readiness.
  - Displays green badge `"ไม่จำกัดรัศมี"` with subtext `"โหมดไม่บังคับรัศมี (ลงเวลาได้ทุกพื้นที่ สามารถกดถัดไปได้ทันที)"`.
  - Explicitly invokes `this.#updateStep1Validation()` so the Next button unlocks immediately.
- In `#goToStep(2)` & `#updateStep1Validation()`:
  - Checked `if (this.settings?.require_gps && this.settings?.enforce_geofence_radius !== false)` so geofence boundaries do not block step progression when disabled.

---

## 2. Verification & Quality Gates

1. **Syntax Verification (`node --check`)**:
   - `assets/js/core/Config.js` - Passed (0 errors)
   - `assets/js/core/DatabaseService.js` - Passed (0 errors)
   - `assets/js/models/SettingsModel.js` - Passed (0 errors)
   - `assets/js/models/AttendanceModel.js` - Passed (0 errors)
   - `assets/js/components/AppLayout.js` - Passed (0 errors)
   - `assets/js/controllers/DashboardController.js` - Passed (0 errors)
   - `assets/js/controllers/ReportsController.js` - Passed (0 errors)
   - `assets/js/controllers/CheckinController.js` - Passed (0 errors)
   - `assets/js/controllers/SettingsController.js` - Passed (0 errors)

2. **AST & Cache Version Synchronization**:
   - Script: `node ./.ai_map/vscode_ast_mapper.mjs`
   - Generated Build ID: `20261110_7dac4bca`
   - Synced across `version.json` and 8 HTML files with `?v=20261110_7dac4bca`.
   - Re-indexed 101 files and 701 symbols.
