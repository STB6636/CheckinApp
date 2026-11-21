# QA & Main-Diff Audit Report — PIPE-20261119-v50-toast-swal-superadmin-rbac (V50 Rev 2)

**Auditor:** `auditor` (`subagent_02_qa_auditor`)  
**Date:** `2026-11-19`  
**Branch / Base Commit:** `Loca-V2` @ `0d377de` (verified against working tree + `git diff main --stat`)  
**Supabase Schema Scope:** `staging` (`db_changes_required: false`)  
**Verified `buildId`:** `20261119_b752d4a8`  
**Verified `contentHash`:** `b752d4a8fe9b0e109c4e56a54a3f7322c34f82b2b3145fb28392ec76aac47dae`  
**Overall Verdict:** **PASS**

---

## 1. Surgical Scope & Git Diff Hygiene

- **`git status --short` & `git diff --check`**: Exited `0` with zero whitespace or conflict-marker errors. Zero `git commit` and zero `git push` executed.
- **Modified & Untracked Files (In-Scope V50 Rev 2):**
  - Core / Layout / Controllers: `assets/js/core/UIHelpers.js`, `assets/js/core/AuthService.js`, `assets/js/components/AppLayout.js`, `assets/js/controllers/CheckinController.js`, `assets/js/controllers/TimeCorrectionsController.js`
  - 10 Root HTML Cache Stamps & Manifest: `index.html`, `loading.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `time-corrections.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`, `version.json`
  - Codebase Map: `.ai_map/CODE_INDEX.json`, `.ai_map/01_FILE_FUNCTION_INDEX.md`
  - QA Suites: `pipeline/PIPE-20261119-time-correction-request-and-approvals/qa_v49_time_correction_test.mjs`, `pipeline/PIPE-20261119-v50-toast-swal-superadmin-rbac/qa_v50_verification_test.mjs`
- **`sql/*` untouched** (`0` edits) and **`docs/manual/*` untouched** (`0` edits).

---

## 2. Code & Contract Audit

### 2.1 Dynamic Prefix-Free Welcome Toast (`UIHelpers.js`, `AuthService.js`, `AppLayout.js`, `CheckinController.js`)
- `UIHelpers.formatWelcomeDisplayName(userOrName, prefixes = null)` (`assets/js/core/UIHelpers.js` L100–162):
  - **Zero hardcoded Thai prefix list**.
  - Priority 1: When given an object with `personnel?.first_name ?? first_name`, returns `${firstName}${lastName ? ` ${lastName}` : ''}`.trim().
  - Priority 2: Dynamically resolves prefixes from `prefixes` parameter -> `sessionStorage` / `localStorage` `Config.STORAGE_KEYS.CACHED_SETTINGS` (`.prefixes`) -> `Config.DEFAULT_SETTINGS.prefixes`, merges `personnel?.prefix` / `prefix`, sorts candidates longest-first (`b.length - a.length`), escapes regex metacharacters (`/[.*+?^${}()|[\]\\]/g`), and strips matching leading prefix + whitespace (`^${escaped}\s*`).
- `AuthService.js` (L201–204): Stores `UIHelpers.formatWelcomeDisplayName(sessionPayload)` in `sessionStorage(Config.STORAGE_KEYS.WELCOME_TOAST)`.
- `AppLayout.checkAndShowWelcomeToast` (`AppLayout.js` L165–179) & `CheckinController.#checkAndShowWelcomeToast` (`CheckinController.js` L335–349): Pass `prefixes` (`AppLayout.#settings?.prefixes` / `this.settings?.prefixes`) into `UIHelpers.formatWelcomeDisplayName(...)` and emit **`ยินดีต้อนรับคุณ${cleanName}`** (zero space after `คุณ`), falling back to `'ยินดีต้อนรับเข้าสู่ระบบ'` when empty.

### 2.2 Soft UI Confirm-With-Input Popups (`UIHelpers.js`, `CheckinController.js`, `TimeCorrectionsController.js`)
- `UIHelpers.confirmWithInput(title, options = {})` (`assets/js/core/UIHelpers.js` L823–897):
  - Replicates `UIHelpers.confirm()` Soft UI Dashboard SweetAlert2 styling: `buttonsStyling: false`, `reverseButtons: true`, `showCancelButton: true`, `rounded-2xl p-5 shadow-2xl`, `backdrop-blur-md`, `max-w-sm sm:max-w-md`, light/dark `background` & `color`, gradient `confirmButton` + icon, and `bg-slate-100 ... dark:bg-slate-700` `cancelButton`.
  - Escapes `inputId`, `inputPlaceholder`, `inputLabel`, `text`, and `infoIcon` with `UIHelpers.escapeHtml(...)`, and returns `{ isConfirmed, value }` via `preConfirm`.
- `CheckinController.#handleSubmitTimeCorrectionFromUser` (`CheckinController.js` L2445–2490): Upgraded `'ยืนยันส่งคำขอแก้ไขเวลา'` to `UIHelpers.confirmWithInput` with `from-[#00744B] to-emerald-500` and `#swalCorrectionReasonInput` (`UIHelpers.escapeHtml(dateLabel)`).
- `TimeCorrectionsController.#processDecision` (`TimeCorrectionsController.js` L602–620): Upgraded `'ยืนยันการไม่อนุมัติคำขอแก้ไขเวลา'` to `UIHelpers.confirmWithInput` with `from-rose-600 to-red-500` and `#swalCorrectionRejectReasonInput`.

### 2.3 SuperAdmin Time Correction RBAC (`AuthService.js`) & Mobile Shortcut Label (`AppLayout.js`)
- `AuthService.EXECUTIVE_APPROVER_POSITION_TITLES` (`AuthService.js` L367–374): Contains all 6 required titles: `['ผู้อำนวยการส่วน', 'ผู้อำนวยการกอง', 'เลขานุการ', 'เลขานุการสำนัก', 'หัวหน้ากลุ่มงาน', 'หัวหน้าฝ่าย']`.
- `AuthService.canApproveTimeCorrection(currentUser, targetRequest)` (`AuthService.js` L384–425):
  - `SuperAdmin` (any position): allowed (`true`).
  - `Admin` (`division` or `bureau`, checked via `AuthService.canViewRecordByScope`): allowed for `Admin` and `SuperAdmin` requests (`requesterRole === 'admin' || requesterRole === 'superadmin'`) when NOT self (`id` / `personnel_id` mismatch) AND `position_type === 'ประเภทผู้บริหาร'` AND `EXECUTIVE_APPROVER_POSITION_TITLES.includes(posTitle)`. Blocks Non-Exec Admin, Out-of-Scope Admin, and Self-Admin.
- `AppLayout.getMobileShortcutGridHtml` (`AppLayout.js` L608): Uses `'อนุมัติแก้เวลา'` for `time-corrections.html`.

---

## 3. Cache Version Sync & Codebase Map Verification

- `version.json`: `buildId = 20261119_b752d4a8`, `contentHash = b752d4a8fe9b0e109c4e56a54a3f7322c34f82b2b3145fb28392ec76aac47dae` — normalized SHA-256 hash matches disk (`contentHashMatch: true`).
- All 10 root HTML files (`index.html`, `loading.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `time-corrections.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`) carry `CURRENT_APP_BUILD = '20261119_b752d4a8'` and `?v=20261119_b752d4a8` (`htmlSyncAll10: true`).
- `.ai_map/CODE_INDEX.json`: `189/189` files (`1268` symbols), `0` mismatches (`idxMismatches: 0`).
- `node --check`: All 7 modified/new JS & MJS files exited `0` (`ALL_7_JS_MJS_SYNTAX_OK`).

---

## 4. Independent Test Execution Results (7/7 Suites PASS)

| # | Test Script | Result | Notes |
|---|---|---|---|
| 1 | `pipeline/PIPE-20261119-v50-toast-swal-superadmin-rbac/qa_v50_verification_test.mjs` | **PASS** (`6/6`, exit `0`) | Dynamic prefix-free toast, Playwright `390x844` Soft UI `confirmWithInput` (`checkin.html` & `time-corrections.html`), SuperAdmin/Executive RBAC (6 titles), `'อนุมัติแก้เวลา'`, 10-HTML cache sync |
| 2 | `pipeline/PIPE-20261119-time-correction-request-and-approvals/qa_v49_time_correction_test.mjs` | **PASS** (`7/7`, exit `0`) | SQL, 10-HTML sync, V50 executive RBAC, 5 cases/threshold/snapshots, Playwright `360/390/1280`, Reports & Dashboard contracts |
| 3 | `pipeline/PIPE-20261118-mobile-cards-and-drawer-spa-redesign/qa_mobile_cards_drawer_spa_test.mjs` | **PASS** (`12/12`, exit `0`) | Drawer SPA & mobile card-list regression |
| 4 | `pipeline/PIPE-20261118-admin-mobile-cards-and-users-tabs/qa_admin_mobile_cards_users_tabs_test.mjs` | **PASS** (`17/17`, exit `0`) | Admin mobile cards & 2-tab users parity |
| 5 | `pipeline/PIPE-20261118-admin-mobile-modals-clipping-fix/qa_v48_mobile_modals_test.mjs` | **PASS** (`10/10`, exit `0`) | Mobile modals `dvh` 3-zone scroll & z-index hierarchy |
| 6 | `pipeline/PIPE-20261117-sidebar-active-state-and-realtime-settings-fix/qa_sidebar_active_sync_test.mjs` | **PASS** (`8/8`, exit `0`) | SPA sidebar `.active` sync & realtime settings hydration |
| 7 | `pipeline/PIPE-20261029-reports-hierarchical-filter-settings-cascade/test_qa_assertions.mjs` | **PASS** (Suites 1–3, exit `0`) | Hierarchical org filter & system settings assertions |

---

## 5. Final Conclusion

All V50 Rev 2 requirements (`formatWelcomeDisplayName` dynamic prefix stripping & `ยินดีต้อนรับคุณ<name>` toast, Soft UI `confirmWithInput` across `checkin.html` & `time-corrections.html`, `'อนุมัติแก้เวลา'` mobile shortcut, 6-title executive RBAC including `'เลขานุการ'` for `SuperAdmin` requests), cache version sync (`20261119_b752d4a8`), `.ai_map/CODE_INDEX.json` (`189/189`), and 7/7 QA/regression suites pass with zero defects. **Recommendation: PASS.**
