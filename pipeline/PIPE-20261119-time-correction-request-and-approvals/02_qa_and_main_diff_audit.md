# QA & Main-Diff Audit Report — PIPE-20261119-time-correction-request-and-approvals (V49 Rev 3)

**Auditor:** `auditor` (`subagent_02_qa_auditor`)  
**Date:** `2026-11-19`  
**Branch / Base Commit:** `Loca-V2` @ `e2e205f` (diff verified against working tree + `git diff main --stat`)  
**Supabase Schema Scope:** `staging` (paired DDL for `staging` & `public` delivered idempotently; zero `sql/create_staging_schema.sql` edits)  
**Verified `buildId`:** `20261119_68ea3c41`  
**Verified `contentHash`:** `68ea3c4113c6881371cca7d102e393f29128aa19e0ce49bbbabcf4e656f30380`  
**Overall Verdict:** **PASS**

---

## 1. Surgical Scope & Git Diff Hygiene

- **`git status --short` & `git diff --check`**: Exited `0` with zero whitespace errors (`trailing-whitespace`, `conflict-markers`). Zero commits or pushes performed (`git push` never called).
- **Modified & Untracked Files (In-Scope V49 Rev 3):**
  - Core / Auth / Layout: `assets/js/core/AuthService.js`, `assets/js/core/UIHelpers.js`, `assets/js/components/AppLayout.js`
  - Model / Controllers: `assets/js/models/AttendanceModel.js`, `assets/js/controllers/CheckinController.js`, `assets/js/controllers/TimeCorrectionsController.js` (new), `assets/js/controllers/ReportsController.js`, `assets/js/controllers/DashboardController.js`
  - HTML & Cache Sync: `time-corrections.html` (new), plus `?v=20261119_68ea3c41` & `CURRENT_APP_BUILD` across all 10 root HTML files (`index.html`, `loading.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `time-corrections.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`), `version.json`
  - SQL Migrations (new): `sql/alter_v2_11_time_correction_staging.sql`, `sql/alter_v2_11_time_correction_public.sql`
  - Pipeline & Docs/Tooling: `AGENTS.md`, `.ai_map/*`, `pipeline/PIPE-20261118-mobile-cards-and-drawer-spa-redesign/qa_mobile_cards_drawer_spa_test.mjs` (whitelists intentional removal of `#btnDrawerNavCheckin`), `pipeline/PIPE-20261119-time-correction-request-and-approvals/`
- **`docs/manual/*` untouched**, zero edits to unrelated admin controllers (`PersonnelController.js`, `UsersController.js`, `SettingsController.js`, `ApprovalsController.js`).

---

## 2. Database Migration & Schema Isolation Verification

Inspected both `sql/alter_v2_11_time_correction_staging.sql` (53 lines) and `sql/alter_v2_11_time_correction_public.sql` (53 lines):
- Strict schema separation: `staging.attendance_logs` / `staging.user_accounts` in `alter_v2_11_time_correction_staging.sql` vs `public.attendance_logs` / `public.user_accounts` in `alter_v2_11_time_correction_public.sql`.
- Idempotent DDL (`ADD COLUMN IF NOT EXISTS` for all 9 `correction_*` columns: `correction_status`, `correction_requested_in_time`, `correction_requested_out_time`, `correction_request_reason`, `correction_requested_at`, `correction_reviewed_by`, `correction_reviewed_at`, `correction_reject_reason`, `correction_prev_snapshot`).
- Guarded FK constraints inside `DO $$ ... IF NOT EXISTS (SELECT 1 FROM pg_constraint ...) THEN ALTER TABLE ... END IF; END $$;` referencing `user_accounts(id) ON DELETE SET NULL`.
- Partial index (`idx_*_attendance_correction_status ... WHERE correction_status <> 'none'`), explicit `GRANT`s (`anon, authenticated, service_role`), and `NOTIFY pgrst, 'reload schema';`.

---

## 3. RBAC, Core Business Engine & Race-Guard Inspection

### 3.1 Executive Approver RBAC (`assets/js/core/AuthService.js`)
- `EXECUTIVE_APPROVER_POSITION_TITLES`: `['ผู้อำนวยการส่วน', 'ผู้อำนวยการกอง', 'เลขานุการสำนัก', 'หัวหน้ากลุ่มงาน', 'หัวหน้าฝ่าย']`.
- `AuthService.canApproveTimeCorrection(currentUser, targetRequest)` enforces:
  1. `User` -> `false`.
  2. `SuperAdmin` -> `true` (can approve all including self/admin requests).
  3. `Admin` -> `false` on self-requests (`targetRequest.user_id === currentUser.id` or `targetRequest.personnel_id === currentUser.personnel_id` when present), and requires BOTH `position_type === 'ประเภทผู้บริหาร'` AND exact membership in `EXECUTIVE_APPROVER_POSITION_TITLES`.

### 3.2 Time Correction Engine (`assets/js/models/AttendanceModel.js`)
- `#resolveShiftTimesForLog(log, settings)` & `#computeCorrectionTarget(log, settings)`:
  - Mutates **only** `'late'` (`สาย`) or `'absent_duty'` (`ไม่ปฏิบัติราชการ`) legs to shift start/end times (`08:00`/`08:30` start, `16:00`/`16:30` end for normal shifts; shift-specific start/end for shift workers).
  - Leaves valid on-time/normal legs untouched (preserves `'กำลังประเมิน'` when checkout is not yet due and `'normal'`/`'early'` legs untouched).
  - `#buildCorrectedRemark(existingRemark)` appends `(แก้ไขเวลา)` idempotently without duplicating existing suffixes and strips any pending tag.
- `getPersonalTimeCorrectionLogs(personnelId, userId, settings)`:
  - Excludes `is_special_request = true`, `is_overtime = true`, `special_status === 'approved'`, `'ไม่ลงเวลา'` (`absent`), and logs where both `inCat` and `outCat` are neither `'late'` nor `'absent_duty'` (unless already tracking `correction_status` `pending`/`approved`/`rejected`).
  - Handles missing `correction_*` schema columns cleanly (`42703` / `PGRST204` fallback).
- `submitTimeCorrectionRequest(log, currentUser, optionalReason)`:
  - Optional reason (`optionalReason?.trim() || null`).
  - Snapshots `prev_in_time`, `prev_out_time`, `prev_remark` via per-leg nullish coalescing (`??`) so non-null values remain intact when updating status to `'pending'`.
  - Broadcasts `attendance_updated` with `actor_id` and `actor_name`.
- `getTimeCorrectionRequests(currentUser, statusFilter)` & `processTimeCorrectionsBulk(selectedItems, decision, currentUser, rejectReason)`:
  - Joins `user_accounts` by `user_id` / `personnel_id` for requester identity and self-approval matching.
  - Enforces server-side RBAC check via `AuthService.canApproveTimeCorrection` before mutating records.
  - Applies `.eq('correction_status', 'pending')` guard, per-leg `??` resolution on approval, `correction_reject_reason` cleanup, and broadcasts `attendance_updated` (`action: 'bulk_time_correction'`, `actor_id`, `actor_name`).
- Edge Cases Verified:
  - `submitCheckinOrCheckout` mid-day re-checkin reset clears stale `correction_*` metadata when a new regular checkin overwrites an earlier log.
  - `saveAdminAttendanceRecord` clears phantom `'pending'` `correction_status` when an admin directly edits attendance records.
  - `getTodaySyncWatermark` includes `correction_status <> 'none'` in its signature for real-time cross-tab sync.

---

## 4. Frontend Views, SPA Drawer, Reports & Realtime Sync

- **`checkin.html` & `assets/js/controllers/CheckinController.js`**:
  - `#btnDrawerNavCheckin` cleanly removed (`Select-String` confirms 0 matches in `checkin.html` and `CheckinController.js`); hidden `#drawerUserRole` / `#drawerUserAffiliation` block preserved at `checkin.html` L727–730.
  - `#syncDrawerNavRoleLayout`: `Admin`/`SuperAdmin` uses 2x2 symmetric drawer grid (`#btnDrawerNavSpecial`, `#btnDrawerNavHistory`, `#btnDrawerNavCorrection`, `#drawerLinkAdminDashboard`); `User` hides `#drawerLinkAdminDashboard` and spans `#btnDrawerNavHistory` across `row-span-2` symmetrically.
  - `#renderPersonalTimeCorrectionList` & `#handleSubmitTimeCorrectionFromUser` render eligible/pending/approved/rejected cards with Before -> After time preview and optional Swal reason input.
  - `#buildHistoryRowHtml` & `#buildHistoryCardHtml` preserve `(แก้ไขเวลา)` / `ขอแก้ไขเวลา` remarks alongside ONSITE/OFFSITE rendering rules.
  - 3-view AJAX SPA drawer (`history` | `special` | `correction`) reparents cleanly with race guard.
- **`time-corrections.html` & `assets/js/controllers/TimeCorrectionsController.js` (664 lines)**:
  - Mirrors `ApprovalsController` structure with `AbortController` cleanup, self-actor filter (`actor_id` + `actor`), Before -> After preview, optional reject reason Swal, RBAC checkbox/button disabling for ineligible requests, and `UIHelpers.escapeHtml` XSS escaping.
  - `time-corrections.html`: 17 unique DOM IDs, 0 duplicates, balanced HTML tags. `checkin.html`: 219 unique DOM IDs, 0 duplicates, balanced HTML tags.
- **`assets/js/components/AppLayout.js` & `assets/js/core/UIHelpers.js`**:
  - `UIHelpers.KNOWN_PAGES_REGEX` includes `time-corrections`.
  - `AppLayout.PAGE_ROUTES` routes `time-corrections.html` to `TimeCorrectionsController`.
  - `#renderMobileBottomNav` adds `time-corrections` (`#mobileNavCorrectionBadge`) inside `overflow-x-auto no-scrollbar` with `shrink-0 min-w-[54px]`.
  - `getMobileShortcutGridHtml` adds `time-corrections.html` tile.
  - `refreshNotificationBell` combines pending special, time correction, and password reset counts into `#topBellBadgeCount`, `#sidebarCorrectionBadge`, `#mobileNavCorrectionBadge`, and `#notificationListContainer`.
  - `initAdminRealtimeSync` propagates `correction_reviewed_by` on `postgres_changes` and `actor_id` / `actor_name` on `attendance_updated` broadcasts.
- **`assets/js/controllers/ReportsController.js` & `assets/js/controllers/DashboardController.js`**:
  - `ReportsController.#resolveReportRemark` preserves `'ขอแก้ไขเวลา'` / `'(แก้ไขเวลา)'` across web table, mobile cards, PDF print, and Excel export while keeping plain `'ในสถานที่'` as `'-'`; `syncReportsSilent` diffs `[data-field="remark"]`.
  - `DashboardController.syncDashboardSilent` updates both desktop table cells (`cells[4]`, `cells[5]`, `cells[6]`) and mobile card `[data-field="check-in"]` / `[data-field="check-out"]` / `[data-field="status"]`.

---

## 5. Cache Version Sync & Codebase Map Verification

- `version.json`: `buildId = 20261119_68ea3c41`, `contentHash = 68ea3c4113c6881371cca7d102e393f29128aa19e0ce49bbbabcf4e656f30380` — matches live normalized frontend SHA-256 hash (`true`).
- All 10 root HTML files (`index.html`, `loading.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `time-corrections.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`) match `CURRENT_APP_BUILD = '20261119_68ea3c41'` and `?v=20261119_68ea3c41` 100%.
- `.ai_map/CODE_INDEX.json`: `188/188` files match disk (`0` mismatches).
- `node --check`: All 11 modified/new JS & MJS files exited `0` (`ALL_11_JS_MJS_SYNTAX_OK`).

---

## 6. Independent Test Execution Results (12/12 Suites PASS)

| # | Test Script | Result | Notes |
|---|---|---|---|
| 1 | `pipeline/PIPE-20261119-time-correction-request-and-approvals/qa_v49_time_correction_test.mjs` | **PASS** (`7/7`, exit `0`) | RBAC, engine, schema isolation, layout, cache sync |
| 2 | `pipeline/PIPE-20261118-mobile-cards-and-drawer-spa-redesign/qa_mobile_cards_drawer_spa_test.mjs` | **PASS** (exit `0`) | Verifies drawer SPA & intentional `#btnDrawerNavCheckin` removal |
| 3 | `pipeline/PIPE-20261118-admin-mobile-cards-and-users-tabs/qa_admin_mobile_cards_users_tabs_test.mjs` | **PASS** (exit `0`) | Admin mobile cards & 2-tab users parity |
| 4 | `pipeline/PIPE-20261118-admin-mobile-modals-clipping-fix/qa_v48_mobile_modals_test.mjs` | **PASS** (exit `0`) | Mobile modals `dvh` 3-zone scroll & z-index hierarchy |
| 5 | `pipeline/PIPE-20261111-ajax-spa-sidebar-active-sync/qa_sidebar_active_sync_test.mjs` | **PASS** (exit `0`) | AJAX SPA sidebar active sync |
| 6 | `pipeline/PIPE-20261115-v2-10-system-update-announcement/qa_v2_10_announcement_verification.mjs` | **PASS** (exit `0`) | System update announcement & `SystemUpdateModal` |
| 7 | `pipeline/PIPE-20261112-reports-redesign-and-pdf-preview/qa_reports_redesign_verification.mjs` | **PASS** (exit `0`) | Reports redesign & PDF preview |
| 8 | `pipeline/PIPE-20261028-realtime-delta-sync/qa_real_instance_test.mjs` | **PASS** (exit `0`) | Realtime delta sync instance checks |
| 9 | `pipeline/PIPE-20261028-realtime-delta-sync/qa_dom_diff_unit_test.mjs` | **PASS** (exit `0`) | `DOMDiffHelper` unit tests |
| 10 | `pipeline/PIPE-20261108-fix-reports-print-pagination/qa_print_simulation_test.mjs` | **PASS** (exit `0`) | Print pagination simulation |
| 11 | `pipeline/PIPE-20261027-fix-approvals-remark/test_approvals_remark.mjs` | **PASS** (exit `0`) | Approvals remark regression |
| 12 | `pipeline/PIPE-20261027-remove-checkin-card-button/test_qa_assertions.mjs` | **PASS** (exit `0`) | Checkin card regression |

---

## 7. Final Conclusion

All V49 Rev 3 requirements, RBAC boundaries, SQL migration idempotency/schema isolation, frontend layout parity, cache version synchronization (`20261119_68ea3c41`), `.ai_map/CODE_INDEX.json` (`188/188`), and 12/12 regression & feature QA suites are verified cleanly with zero defects. **Recommendation: PASS.**
