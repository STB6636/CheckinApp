# Stage 3 QA, SQL Parity, 10-HTML Cache Sync & Main-Diff Audit Report

- **Task ID:** `PIPE-20261121-switch-schema-staging-to-public`
- **Auditor:** `subagent_02_qa_auditor`
- **Branch:** `Loca-V2` (`HEAD` == `origin/Loca-V2`, `0` ahead / `0` behind before local edits)
- **Target Build ID (`version.json`):** `20261121_e7690051` (`appVersion: v2.10.0`, `contentHash: e76900510f41a5881f11ce2e658e2d1d0039b06151f9673d163a62383ddf950a`)
- **Final Verdict:** **PASS**

---

## 1. JS Syntax, Schema Switch & Runtime Verification

### 1.1 Syntax Checks (`node --check`)
- `node --check assets/js/core/Config.js` — **PASS** (exit code `0`)
- `node --check assets/js/models/AttendanceModel.js` — **PASS** (exit code `0`)
- Full repository JS syntax sweep (`assets/js/**/*.js`, **21 files checked**) — **PASS** (`ALL_JS_SYNTAX_OK: 21 files checked`, exit code `0`)

### 1.2 Modified Target Verification & Runtime ESM Behavior
- [`assets/js/core/Config.js`](file:///d:/STB%20ChkIn/CheckinApp/assets/js/core/Config.js#L6-L12):
  - Line 9 verified as `static SUPABASE_SCHEMA = 'public';`
- [`assets/js/models/AttendanceModel.js`](file:///d:/STB%20ChkIn/CheckinApp/assets/js/models/AttendanceModel.js#L2695-L2714):
  - Lines 2708–2711 verified:
    ```js
    const migrationFile = DatabaseService.getActiveSchema() === 'public'
        ? 'sql/migration_public_full_loca_v2_sync.sql'
        : 'sql/alter_v2_11_time_correction_staging.sql';
    return { success: false, message: `ฐานข้อมูลยังไม่ได้อัปเดตคอลัมน์ระบบขอแก้ไขเวลา (กรุณารัน ${migrationFile})` };
    ```
- Live Node ESM execution check (`--input-type=module`):
  - `Config.SUPABASE_SCHEMA` resolved to `'public'`
  - `DatabaseService.getActiveSchema()` resolved to `'public'`
  - Mocked missing-column (`42703`) call to `AttendanceModel.submitTimeCorrectionRequest(...)` returned:
    `{"success":false,"message":"ฐานข้อมูลยังไม่ได้อัปเดตคอลัมน์ระบบขอแก้ไขเวลา (กรุณารัน sql/migration_public_full_loca_v2_sync.sql)"}`

### 1.3 Runtime `'staging'` Reference Scan (`*.html`, `assets/**`, `google_apps_script/**`)
Scanned **35** text/code runtime files across root `*.html`, `assets/**`, and `google_apps_script/**` for `/staging/i`. Exactly **3** matches exist, and all **3** are confirmed safe non-active fallback/branch lines:

1. [`assets/js/core/DatabaseService.js`](file:///d:/STB%20ChkIn/CheckinApp/assets/js/core/DatabaseService.js#L119-L124) (L120):
   - `console.warn('[DatabaseService] Schema staging is not exposed in Supabase Dashboard yet, falling back to public schema');`
   - Only fires on `The schema must be one of the following: public` error. `getActiveSchema()` returns `'public'` (L36–38), `#initClient()` omits `clientOptions.db.schema` when `activeSchema === 'public'` (L53–56), and `broadcastRealtimeEvent` tags `schema: DatabaseService.getActiveSchema()` (`'public'`, L102).
2. [`assets/js/models/AttendanceModel.js`](file:///d:/STB%20ChkIn/CheckinApp/assets/js/models/AttendanceModel.js#L2708-L2711) (L2710):
   - `: 'sql/alter_v2_11_time_correction_staging.sql';`
   - Inactive else-branch of `DatabaseService.getActiveSchema() === 'public'`.
3. [`assets/js/models/SettingsModel.js`](file:///d:/STB%20ChkIn/CheckinApp/assets/js/models/SettingsModel.js#L78-L84) (L79):
   - `console.warn('[SettingsModel] Staging schema not exposed yet, falling back to public schema');`
   - Guard-only fallback on schema-not-exposed error; never fires under `'public'`.

Dynamic realtime subscribers verified cleanly resolving `'public'`:
- [`assets/js/components/AppLayout.js`](file:///d:/STB%20ChkIn/CheckinApp/assets/js/components/AppLayout.js#L902-L957): uses `activeSchema` (`'public'`) for channel `bma_admin_realtime_public` and `postgres_changes` listeners on `attendance_logs`, `user_accounts`, `personnel`, `system_settings`.
- [`assets/js/controllers/CheckinController.js`](file:///d:/STB%20ChkIn/CheckinApp/assets/js/controllers/CheckinController.js#L183-L198): uses `activeSchema` (`'public'`) for channel `bma_checkin_settings_public` and `postgres_changes` listeners on `system_settings` and `attendance_logs`.

**Result:** Zero unintended hardcoded `'staging'` schema values remain in runtime HTML, JS, CSS, or Google Apps Script files.

---

## 2. SQL Migration Completeness & Safety Audit

Target file: [`sql/migration_public_full_loca_v2_sync.sql`](file:///d:/STB%20ChkIn/CheckinApp/sql/migration_public_full_loca_v2_sync.sql) (270 lines)

| Check Item | Requirement | Observed Evidence | Status |
|:--|:--|:--|:--|
| `public.system_settings` (+13 cols) | All 13 missing columns via `ADD COLUMN IF NOT EXISTS` | **13 / 13 verified:** `official_locations`, `enforce_geofence_radius`, `offsite_job_types`, `special_request_reasons`, `announcement_enabled`, `announcement_mode`, `announcement_start_date`, `announcement_end_date`, `announcement_title`, `announcement_body`, `announcement_image_url`, `announcement_drive_folder_id`, `announcement_updated_at` (L13–46) | **PASS** |
| Pre-seed & Defaults (`system_settings`) | Official location `"สำนักเทศกิจ"`, idempotent pre-seed, union `remarks` | `LOC-289985` (`13.738721075492425, 100.49554097825852`, `radius_meters: 150`); pre-seed gated by `WHERE id = 1 AND COALESCE(announcement_updated_at, '') = ''`; `remarks` merged via `DISTINCT` union (L15–71) | **PASS** |
| `public.attendance_logs` (+15 cols) | All 15 missing columns (6 Loca-V2 + 9 Time Correction v2.11) via `ADD COLUMN IF NOT EXISTS` | **15 / 15 verified:** `location_mode`, `distance_from_official_meters`, `offsite_reason`, `check_out_location_mode`, `check_out_distance_from_official_meters`, `check_out_offsite_reason`, `correction_status`, `correction_requested_at`, `correction_request_reason`, `correction_reviewed_by`, `correction_reviewed_at`, `correction_reject_reason`, `correction_original_check_in`, `correction_original_check_out`, `correction_original_status` (L80–100) | **PASS** |
| Legacy 691-row safety | `location_mode` and `check_out_location_mode` MUST be `TEXT DEFAULT NULL` | Verified exact definitions: `location_mode TEXT DEFAULT NULL` (L81) and `check_out_location_mode TEXT DEFAULT NULL` (L84). Zero `NOT NULL DEFAULT 'ONSITE'`. | **PASS** |
| `correction_status` constraint | `CHECK (correction_status IN ('none', 'pending', 'approved', 'rejected')) NOT NULL DEFAULT 'none'` | Verified exact constraint and default at L90–92. | **PASS** |
| Foreign Key (Idempotent) | `fk_public_attendance_correction_reviewer` (`correction_reviewed_by` → `public.user_accounts(id) ON DELETE SET NULL`) | Verified `DO $$` `pg_constraint` guard for `conrelid = 'public.attendance_logs'::regclass` at L106–119. | **PASS** |
| Partial Index | `idx_public_attendance_correction_status` | Verified `CREATE INDEX IF NOT EXISTS idx_public_attendance_correction_status ON public.attendance_logs (correction_status, work_date DESC) WHERE correction_status <> 'none';` at L121–123. | **PASS** |
| Realtime Publication | Idempotent `ALTER PUBLICATION supabase_realtime ADD TABLE` for all 4 `public` tables | Verified `attendance_logs`, `system_settings`, `personnel`, `user_accounts` inside `pg_publication` check with `EXCEPTION WHEN duplicate_object OR undefined_table` (L163–183). | **PASS** |
| Grants & Schema Reload | `GRANT` for `anon`, `authenticated`, `service_role` + `NOTIFY pgrst, 'reload schema';` | Verified at L189–193. | **PASS** |
| Verification Queries | Column count (`42` / `40`), column listing, legacy NULL rows check | Verified sections 7.1–7.4 at L200–270. | **PASS** |
| Zero Destructive SQL | No `DROP TABLE`, `TRUNCATE`, or `DELETE FROM` | Verified `0` occurrences in non-comment SQL. | **PASS** |

---

## 3. Mandatory 10-HTML Cache Version Sync Audit

`version.json` verified:
- `buildId`: `"20261121_e7690051"`
- `appVersion`: `"v2.10.0"`
- `contentHash`: `"e76900510f41a5881f11ce2e658e2d1d0039b06151f9673d163a62383ddf950a"`

Automated verification across all **10 root HTML files** confirmed **100% match** (`CURRENT_APP_BUILD` and every `assets/...` reference):

| # | HTML File | `CURRENT_APP_BUILD` | Asset Refs (`assets/...`) | Query `?v=` Mismatches | Status |
|:--:|:--|:--|:--:|:--:|:--:|
| 1 | [`index.html`](file:///d:/STB%20ChkIn/CheckinApp/index.html) | `20261121_e7690051` | 2 (`bma-theme.css`, `LoginController.js`) | 0 | **OK** |
| 2 | [`loading.html`](file:///d:/STB%20ChkIn/CheckinApp/loading.html) | `20261121_e7690051` | 2 (`bma-theme.css`, `LoadingController.js`) | 0 | **OK** |
| 3 | [`checkin.html`](file:///d:/STB%20ChkIn/CheckinApp/checkin.html) | `20261121_e7690051` | 2 (`bma-theme.css`, `CheckinController.js`) | 0 | **OK** |
| 4 | [`dashboard.html`](file:///d:/STB%20ChkIn/CheckinApp/dashboard.html) | `20261121_e7690051` | 2 (`bma-theme.css`, `DashboardController.js`) | 0 | **OK** |
| 5 | [`approvals.html`](file:///d:/STB%20ChkIn/CheckinApp/approvals.html) | `20261121_e7690051` | 2 (`bma-theme.css`, `ApprovalsController.js`) | 0 | **OK** |
| 6 | [`time-corrections.html`](file:///d:/STB%20ChkIn/CheckinApp/time-corrections.html) | `20261121_e7690051` | 2 (`bma-theme.css`, `TimeCorrectionsController.js`) | 0 | **OK** |
| 7 | [`reports.html`](file:///d:/STB%20ChkIn/CheckinApp/reports.html) | `20261121_e7690051` | 2 (`bma-theme.css`, `ReportsController.js`) | 0 | **OK** |
| 8 | [`settings.html`](file:///d:/STB%20ChkIn/CheckinApp/settings.html) | `20261121_e7690051` | 2 (`bma-theme.css`, `SettingsController.js`) | 0 | **OK** |
| 9 | [`personnel.html`](file:///d:/STB%20ChkIn/CheckinApp/personnel.html) | `20261121_e7690051` | 2 (`bma-theme.css`, `PersonnelController.js`) | 0 | **OK** |
| 10 | [`users.html`](file:///d:/STB%20ChkIn/CheckinApp/users.html) | `20261121_e7690051` | 2 (`bma-theme.css`, `UsersController.js`) | 0 | **OK** |

---

## 4. Git Diff & Surgical Scope Audit

### 4.1 `git diff origin/Loca-V2 --stat` (`STRICT_SURGICAL_SCOPE_ONLY`)
Modified tracked files (**15 files**, strictly within manifest scope):
- `assets/js/core/Config.js` (`2 +-` — line 9 `'staging'` → `'public'`)
- `assets/js/models/AttendanceModel.js` (`5 +-` — lines 2708–2711 dynamic migration file hint)
- `version.json` (`6 +-` — `buildId`, `contentHash`, `updatedAt`)
- 10 HTML files (`approvals.html`, `checkin.html`, `dashboard.html`, `index.html`, `loading.html`, `personnel.html`, `reports.html`, `settings.html`, `time-corrections.html`, `users.html`; `6 +-` each — ONLY `CURRENT_APP_BUILD` + CSS/JS `?v=20261121_e7690051`)
- `.ai_map/01_FILE_FUNCTION_INDEX.md`, `.ai_map/CODE_INDEX.json` (AST mapper sync)

Untracked files (**only task artifacts & new SQL migration**):
- `sql/migration_public_full_loca_v2_sync.sql`
- `pipeline/PIPE-20261121-switch-schema-staging-to-public/*`

Exact JS diffs verified:
- `Config.js`: `- static SUPABASE_SCHEMA = 'staging';` / `+ static SUPABASE_SCHEMA = 'public';`
- `AttendanceModel.js`: only lines 2708–2711 inside `submitTimeCorrectionRequest`.

### 4.2 `git diff main --stat`
- Confirmed `349 files changed, 66034 insertions(+), 6954 deletions(-)` representing the full cumulative `Loca-V2` feature branch divergence over `main` (v2.8–v2.11, AI workflow files, pipeline reports, second brain, SQL scripts, UI upgrades), with our current working tree adding only the clean `public` schema switch, full additive migration SQL, and `buildId` `20261121_e7690051` cache stamp on top of `origin/Loca-V2` (`3c4f41a`). No unintended edits or conflicts introduced.

---

## 5. Final Audit Verdict

**PASS** — All Stage 3 requirements, syntax checks, schema-switch checks, SQL parity & legacy-row safety checks, 10-HTML cache version synchronization (`20261121_e7690051`), and `STRICT_SURGICAL_SCOPE_ONLY` git diff checks passed with zero defects.
