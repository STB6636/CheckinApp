# ADR 0033: DB-Driven System Announcement Modal (`Tab 7: ประกาศระบบ`), Strict Google Drive Image Upload, SQL Staging/Public Parity & `v2.10.0` Alignment

- **Date**: 2026-11-17
- **Status**: Accepted & Verified (`Build ID: 20261117_d723e0d9`, `App Version: v2.10.0`)
- **Task ID**: `PIPE-20261117-system-announcement-and-v2-10-sync`
- **Linked Flows**: `FLOW_AUTH_01`, `FLOW_LAYOUT_01`, `FLOW_SETTINGS_01`, `FLOW_CHECKIN_01`
- **Active Supabase Schema**: `staging` (SQL DDL scripts provided for both `staging` and `public` merge parity)

---

## Context & Problem Statement
1. The system needed a database-configurable announcement modal ("ประกาศระบบ") replacing the previous static `version.json`-triggered popup, with once-per-announcement delivery (`bma_last_seen_announcement_id`) covering BOTH unauthenticated `index.html` visitors AND returning 7-day auto-login users (`loading.html?entry=session` → `checkin.html` / Admin `AppLayout`).
2. SuperAdmins needed a new **Tab 7 (`7. ประกาศระบบ`)** inside [settings.html](file:///f:/STB%20System/CheckinApp-UXUI/settings.html) supporting Enable/Disable, inclusive Bangkok (`UTC+7`) start/end date window (optional `end_date`), Text mode (Head + auto-formatted Body bullets), Image mode replacing body text (with dedicated Google Drive folder field, strict verification, direct PNG/JPG/WebP upload + mobile size hints, and live Preview modal), plus updated `DriveUploadBridge.gs` backward-compatible with `main`.
3. Schema inspection confirmed PostgREST/ANON_KEY permits `SELECT` and row DML (`INSERT`/`UPDATE`/`UPSERT`), while DDL (`ALTER TABLE`) requires manual SQL execution in Supabase SQL Editor — and uncovered `5` drift bugs in `sql/alter_v2_8_loca_v2_schema.sql` (`offsite_job_types`, `special_request_reasons`, `check_out_location_mode`, `check_out_distance_from_official_meters`, and unused `work_mode`/`check_out_work_mode`).
4. System version (`v2.10.0`, `17 พฤศจิกายน 2569`), 9-HTML `PRESERVE_KEYS` + docs count, and all 4 standalone manuals in `docs/manual/` needed full alignment with `Loca-V2`.

---

## Decision & Implementation
1. **Database & SQL Deliverables (`sql/`)**:
   - Created [alter_v2_10_announcement_staging.sql](file:///f:/STB%20System/CheckinApp-UXUI/sql/alter_v2_10_announcement_staging.sql) adding `9` `announcement_*` columns to `staging.system_settings`, pre-seeding `id = 1` with `announcement_enabled = true`, `announcement_mode = 'text'`, `announcement_start_date = '2026-11-17'`, `announcement_title = 'แจ้งปรับปรุง ระบบลงเวลาปฏิบัติราชการ (สตบ.)'`, and the 4 `v2.10.0` bullets, plus `NOTIFY pgrst, 'reload schema';`.
   - Fixed the 5 schema-drift bugs in [alter_v2_8_loca_v2_schema.sql](file:///f:/STB%20System/CheckinApp-UXUI/sql/alter_v2_8_loca_v2_schema.sql) and synced [create_staging_schema.sql](file:///f:/STB%20System/CheckinApp-UXUI/sql/create_staging_schema.sql) with the 9 announcement columns.
2. **Resilient Model & Cache Sync ([Config.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/core/Config.js), [SettingsModel.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/models/SettingsModel.js))**:
   - Added 9 announcement fields to `DEFAULT_SETTINGS`, `getSettings()`, and `updateSettings()`. Raised `maxRetries` from `6` to `25`, added `PGRST204` detection, invalidated stale pre-v2.10.0 `sessionStorage` caches when `typeof parsed.announcement_enabled !== 'boolean'`, added `category_colors._announcement` fallback persistence if columns are temporarily unmigrated, and broadcasted `announcement_updated_at` via `settings_updated`.
3. **DB-Driven Modal & Zero Double-Popup Flow ([SystemUpdateModal.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/components/SystemUpdateModal.js), [LoginController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/LoginController.js), [CheckinController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/CheckinController.js), [AppLayout.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/components/AppLayout.js))**:
   - Retired automatic `version.json` popup; added `initWithAnnouncement`, `checkAndShowAnnouncement`, `isAnnouncementActive` (`Asia/Bangkok` `UTC+7` date bounds), FNV-1a token fallback `getAnnouncementToken`, XSS-safe Text bullet auto-formatter (`fa-bullhorn`), portrait mobile-first Image mode with `onerror` fallback box, and `isPreview` non-persisting preview mode.
   - Added `'bma_last_seen_announcement_id'` to 7-key `PRESERVE_KEYS` across all 9 HTML pages and [vscode_ast_mapper.mjs](file:///f:/STB%20System/CheckinApp-UXUI/.ai_map/vscode_ast_mapper.mjs).
4. **Tab 7 UI & Strict Google Drive Upload ([settings.html](file:///f:/STB%20System/CheckinApp-UXUI/settings.html), [SettingsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/SettingsController.js), [UIHelpers.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/core/UIHelpers.js), [DriveUploadBridge.gs](file:///f:/STB%20System/CheckinApp-UXUI/google_apps_script/DriveUploadBridge.gs))**:
   - Added `#tab-panel-announcement` + `body > #modalAnnouncementPreview` (outside `<main>` for Admin SPA routing compatibility), deduplicated `<main>` click listener (`__bmaSettingsMainClickHandler`), guarded `#collectMainAndColorFieldsIntoSettings()` so Tabs 1–6 never clobber or bump `announcement_updated_at`, and enforced `strictFolder: true` + `script.google.com/.../exec` check + PNG/WebP/SVG MIME decoding while remaining 100% backward compatible with `main` branch check-in callers.
5. **Versioning (`v2.10.0`) & Manuals ([version.json](file:///f:/STB%20System/CheckinApp-UXUI/version.json), `docs/manual/*.html`, Repo Docs)**:
   - Updated `version.json`, all 4 user manuals (`V2.10.0 — 17 พฤศจิกายน 2569`), `README.md`, `AGENTS.md`, skills, and rules (`9 HTML` pages).

---

## Verification
- `node --check` passed on all modified JS/MJS files (`0` errors) and all inline `<script>` blocks across 9 root HTML pages + 4 manual HTML files parsed via `vm.Script` (`0` errors).
- [qa_v2_10_announcement_verification.mjs](file:///f:/STB%20System/CheckinApp-UXUI/pipeline/PIPE-20261117-system-announcement-and-v2-10-sync/qa_v2_10_announcement_verification.mjs): **20 / 20 PASSED**.
- Regression suites: `qa_test_suite.mjs` (**139 / 139**), `qa_runtime_deep_simulation.mjs` (**40 / 40**), `qa_real_instance_test.mjs` (**8 / 8**), `qa_split_dropdowns_verification.mjs` (**8 / 8**).
- Cache Version Sync verified at `buildId: 20261117_d723e0d9` across `version.json` and all 9 HTML pages; zero `git push` executed.
