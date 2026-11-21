# QA & Main-Diff Audit Report

**Task ID**: `PIPE-20261116-fix-mobile-logout-session-camera`  
**Target Branch**: `Loca-V2` (Base Commit: `c0ae762` | `main`: `a477a6d`)  
**Target Schema**: `staging` (No DB schema changes required or made)  
**Auditor**: `subagent_02_qa_auditor`  
**Audit Stage**: Stage 3 Final Re-Audit (Post-Surgical Fixes `#28` & `#29`)  
**Overall Verdict**: **`PASS`** (`30/30` passed, `0` failed in `qa_fix_mobile_logout_session_camera.mjs`; all `node --check` syntax checks, Cache Version Sync `20261116_95694c06` + `PRESERVE_KEYS` across all 8 HTML files, `.ai_map/` line sync, shared-file regression suites `8/8` + `20/20`, and `git status` / `git diff` / `git diff main` scope audits pass)

---

## 1. Executive Summary & Surgical Re-Audit Verification

Both camera-lifecycle race-condition defects flagged in the initial Stage 3 audit were surgically patched by `subagent_01_implementer` in [CheckinController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/CheckinController.js), followed by `node ./.ai_map/vscode_ast_mapper.mjs` re-synchronizing `version.json`, all 8 root HTML files (`buildId: 20261116_95694c06`), and `.ai_map/`:

1. **Defect `#28` Resolved — Stale Session No Longer Hides Active Session's Permission Hint Banner ([CheckinController.js#L2264-L2273](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/CheckinController.js#L2264-L2273))**:
   - `this.#hideCameraPermissionHint()` was moved **after** the `if (sessionToken !== this.cameraSessionToken)` early-return guard (`L2266-L2271`).
   - Verified in Test `#28`: when stale Session 1 resolves while Session 2 is pending with `#cameraPermissionHintBanner` visible, stale stream 1 tracks are stopped (`readyState === 'ended'`) and Session 2's `#cameraPermissionHintBanner` remains visible (`classList.contains('hidden') === false`).
2. **Defect `#29` Resolved — `isCameraOpening` Cleared Before Awaiting Guidance Modal ([CheckinController.js#L2295-L2324](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/CheckinController.js#L2295-L2324))**:
   - Inside `catch (err)`, `if (sessionToken === this.cameraSessionToken)` resets `this.isCameraOpening = false;` (`L2298`) and calls `this.#stopCameraHardwareStream();` (`L2299`) **before** `await this.#showCameraGuidanceModal({ reason, allowFallback });` (`L2318`).
   - Verified in Test `#29`: while `Swal` guidance modal is actively open (`holdSwalOpen: true`), `ctrl.isCameraOpening === false`, allowing immediate camera retry, `<label for="cameraFallbackFileInput">` selection, and hot-reload sync without lockup. Also verified stale-session rejection guard (`L2302-L2304`) and `finally` token check (`L2321-L2323`).

---

## 2. Syntax & Mandatory Cache Version Sync Audit

### 2.1 Syntax Checks (`node --check`)
Exact command outputs:
```text
$ node --check assets/js/controllers/CheckinController.js; echo "CheckinController:$LASTEXITCODE"
CheckinController:0
$ node --check assets/js/components/AppLayout.js; echo "AppLayout:$LASTEXITCODE"
AppLayout:0
$ node --check .ai_map/vscode_ast_mapper.mjs; echo "vscode_ast_mapper:$LASTEXITCODE"
vscode_ast_mapper:0
$ node --check pipeline/PIPE-20261116-fix-mobile-logout-session-camera/qa_fix_mobile_logout_session_camera.mjs; echo "qa_fix:$LASTEXITCODE"
qa_fix:0
$ node --check assets/js/core/AuthService.js; echo "AuthService:$LASTEXITCODE"
AuthService:0
$ node --check assets/js/core/UIHelpers.js; echo "UIHelpers:$LASTEXITCODE"
UIHelpers:0
```

| File | Result | Exit Code |
|---|---|---:|
| `assets/js/controllers/CheckinController.js` | PASS | `0` |
| `assets/js/components/AppLayout.js` | PASS | `0` |
| `.ai_map/vscode_ast_mapper.mjs` | PASS | `0` |
| `pipeline/PIPE-20261116-fix-mobile-logout-session-camera/qa_fix_mobile_logout_session_camera.mjs` | PASS | `0` |
| `assets/js/core/AuthService.js` | PASS | `0` |
| `assets/js/core/UIHelpers.js` | PASS | `0` |

### 2.2 `version.json`, `CURRENT_APP_BUILD`, Asset `?v=`, `PRESERVE_KEYS`, and `.ai_map/` Sync
- `version.json` `buildId`: **`20261116_95694c06`**
- `version.json` `contentHash`: **`95694c06f4cdd65b1cf671c41d487a44fbccc09c12676e5f1c3d515d57d4a6a2`** (verified in Check `#06` against live normalized SHA-256 across all 8 HTML files + `assets/css/**` + `assets/js/**`)
- `.ai_map/` AST Sync: `Last Indexed: 2026-11-16T04:40:04.371Z`, `169` files, `893` symbols (`0` SHA-256 hash or line-count mismatches across all 169 indexed files); `CheckinController.js` matches `4467` lines and `#startCameraSession` `L2199 - L2325`.
- CSS / SweetAlert2 Load Order & Stale Key Scan: All 8 root HTML files load `assets/css/bma-theme.css?v=20261116_95694c06` **after** `sweetalert2@11`; `0` occurrences of stale keys (`bma_auth_session_v2`, `bma_theme_mode`) remain across `*.html`, `assets/**/*.js`, and `docs/**/*.html`.

Exact verification printout across all 8 HTML files:
```text
version.json buildId: 20261116_95694c06 | contentHash: 95694c06f4cdd65b1cf671c41d487a44fbccc09c12676e5f1c3d515d57d4a6a2
index.html     | CURRENT_APP_BUILD=20261116_95694c06 | refs=assets/css/bma-theme.css?v=20261116_95694c06 ; assets/js/controllers/LoginController.js?v=20261116_95694c06
checkin.html   | CURRENT_APP_BUILD=20261116_95694c06 | refs=assets/css/bma-theme.css?v=20261116_95694c06 ; assets/js/controllers/CheckinController.js?v=20261116_95694c06
dashboard.html | CURRENT_APP_BUILD=20261116_95694c06 | refs=assets/css/bma-theme.css?v=20261116_95694c06 ; assets/js/controllers/DashboardController.js?v=20261116_95694c06
approvals.html | CURRENT_APP_BUILD=20261116_95694c06 | refs=assets/css/bma-theme.css?v=20261116_95694c06 ; assets/js/controllers/ApprovalsController.js?v=20261116_95694c06
reports.html   | CURRENT_APP_BUILD=20261116_95694c06 | refs=assets/css/bma-theme.css?v=20261116_95694c06 ; assets/js/controllers/ReportsController.js?v=20261116_95694c06
personnel.html | CURRENT_APP_BUILD=20261116_95694c06 | refs=assets/css/bma-theme.css?v=20261116_95694c06 ; assets/js/controllers/PersonnelController.js?v=20261116_95694c06
settings.html  | CURRENT_APP_BUILD=20261116_95694c06 | refs=assets/css/bma-theme.css?v=20261116_95694c06 ; assets/js/controllers/SettingsController.js?v=20261116_95694c06
users.html     | CURRENT_APP_BUILD=20261116_95694c06 | refs=assets/css/bma-theme.css?v=20261116_95694c06 ; assets/js/controllers/UsersController.js?v=20261116_95694c06
```
All 8 HTML files declare the exact 6-key `PRESERVE_KEYS`:
`['bma_checkin_session_user_v2_7', 'bma_checkin_theme_mode_v2_7', 'bma_remember_me', 'bma_remember_username', 'bma_last_seen_update_build', BUILD_STORAGE_KEY]` (where `BUILD_STORAGE_KEY = 'bma_app_build'`).

| HTML Entry File | `CURRENT_APP_BUILD` | Asset `?v=` Refs Synced | `PRESERVE_KEYS` (6/6 Exact Match) | VM Purge Simulation (Local & Remote) |
|---|---|---:|:---:|:---:|
| `index.html` | `20261116_95694c06` | 2/2 (`bma-theme.css`, `LoginController.js`) | ✅ 6/6 | ✅ PASS |
| `checkin.html` | `20261116_95694c06` | 2/2 (`bma-theme.css`, `CheckinController.js`) | ✅ 6/6 | ✅ PASS |
| `dashboard.html` | `20261116_95694c06` | 2/2 (`bma-theme.css`, `DashboardController.js`) | ✅ 6/6 | ✅ PASS |
| `approvals.html` | `20261116_95694c06` | 2/2 (`bma-theme.css`, `ApprovalsController.js`) | ✅ 6/6 | ✅ PASS |
| `reports.html` | `20261116_95694c06` | 2/2 (`bma-theme.css`, `ReportsController.js`) | ✅ 6/6 | ✅ PASS |
| `personnel.html` | `20261116_95694c06` | 2/2 (`bma-theme.css`, `PersonnelController.js`) | ✅ 6/6 | ✅ PASS |
| `settings.html` | `20261116_95694c06` | 2/2 (`bma-theme.css`, `SettingsController.js`) | ✅ 6/6 | ✅ PASS |
| `users.html` | `20261116_95694c06` | 2/2 (`bma-theme.css`, `UsersController.js`) | ✅ 6/6 | ✅ PASS |

---

## 3. Automated Verification Results

### 3.1 Primary Suite: `pipeline/PIPE-20261116-fix-mobile-logout-session-camera/qa_fix_mobile_logout_session_camera.mjs`
- **Command**: `node pipeline/PIPE-20261116-fix-mobile-logout-session-camera/qa_fix_mobile_logout_session_camera.mjs`
- **Result**: **`30/30 PASSED | 0 FAILED`** (Exit code `0`)
- **Command Output Summary**:
```text
========================================================================
 QA AUDIT SUITE: PIPE-20261116-fix-mobile-logout-session-camera
========================================================================

[PASS] #01: Syntax Check: node --check assets/js/controllers/CheckinController.js
[PASS] #02: Syntax Check: node --check assets/js/components/AppLayout.js
[PASS] #03: Syntax Check: node --check .ai_map/vscode_ast_mapper.mjs
[PASS] #04: Syntax Check: node --check assets/js/core/AuthService.js
[PASS] #05: Syntax Check: node --check assets/js/core/UIHelpers.js
[PASS] #06: Cache Sync & PRESERVE_KEYS Static Audit across ALL 8 HTML files + SHA-256 contentHash
[PASS] #07: Runtime Simulation: inline <head> performHardCachePurge() preserves all 6 keys across ALL 8 HTML files (local mismatch & remote version.json)
[PASS] #08: Task 1: Z-Index hierarchy strictly orders overlays < .swal2-container < progress < toast < spinner
[PASS] #09: Task 1 Runtime: #btnDrawerLogout keeps #mobileHistoryDrawer open WHILE Swal confirm is open, on cancel, & clears session on confirm
[PASS] #10: Task 2 Runtime: AuthService.getCurrentUser(true) extends 7 days and expires >7 days
[PASS] #11: Task 2 & 3 Runtime: CheckinController.visibilitychange extends valid session & stops stream + redirects on expiry
[PASS] #12: Task 2 & 3 Runtime: #handleMainCheckin() renews valid session 7 days & blocks expired session (including disable_normal_hours_checkin=true)
[PASS] #13: Task 2 & 3 Runtime: #handleSubmitSpecialRequest() renews valid session 7 days & blocks expired session
[PASS] #14: Task 2 & 3 Runtime: AppLayout visibilitychange extends valid session & redirects on expiry
[PASS] #15: Task 4 & 5 Static: checkin.html sr-only input, hint banner, and zero DOM IDs removed vs HEAD / adr_004
[PASS] #16: Task 4 & 5 Runtime: Event bubbling guard on #cameraFallbackFileInput & #photoPreviewCard + #handleFallbackFileSelected
[PASS] #17: Task 4 & 5 Runtime: #checkCameraHardware() covers all 4 branches accurately
[PASS] #18: Task 4 & 5 Runtime: Sync LINE fallback (fullscreen & OnDemand) + allow_gallery_fallback=false behavior
[PASS] #19: Task 4 & 5 Runtime: Cancel-while-pending allows reopen (gumCalls=2) and stops stale stream
[PASS] #20: Task 4 & 5 Runtime: Cancelled NotReadableError skips 300ms 2nd call (nrCalls=1)
[PASS] #21: Task 4 & 5 Runtime: NotAllowedError has zero retries, zero silent click, 4-browser steps & allowFallback gating
[PASS] #22: Task 4 & 5 Runtime: OverconstrainedError / ConstraintNotSatisfiedError fallback & NotReadableError 2nd-try success
[PASS] #23: Task 4 & 5 Runtime: NotReadableError -> NotAllowedError retry preserves hardware_busy classification
[PASS] #24: Task 4 & 5 Runtime: Safari permissions.query TypeError triggers 120ms banner & stale query does not overwrite newer session
[PASS] #25: Task 4 & 5 Runtime: track.onended & visibilitychange dead-track reset + #openCameraOnDemand()
[PASS] #26: Task 4 & 5 Runtime: #openCameraOnDemand() NotAllowedError has zero retries & shows tailored guidance
[PASS] #27: Task 4 & 5 Runtime: PermissionDeniedError, NotFoundError, and unsupported getUserMedia across fullscreen & OnDemand
[PASS] #28: Task 4 & 5 Adversarial Defect A: Stale Session 1 resolving must NOT hide Session 2 active #cameraPermissionHintBanner
[PASS] #29: Task 4 & 5 Adversarial Defect B: isCameraOpening must be false while #showCameraGuidanceModal is open / closing
[PASS] #30: Task 6 Static: docs/manual/manual-user.html updated for 4 browsers, Tune/Sliders, Safari iOS (NO "ถาม" option)

========================================================================
 SUMMARY: 30/30 PASSED | 0 FAILED
========================================================================
```

### 3.2 Shared-File Regression Suites
- **Command**: `node pipeline/PIPE-20261113-split-dropdowns-and-special-request-official-locations/qa_split_dropdowns_verification.mjs`
- **Result**: **8/8 PASSED** (Exit code `0`)
  ```text
  --- STARTING QA VERIFICATION FOR PIPE-20261113 ---
  ✓ 1. Config.js defaults verified
  ✓ 2. settings.html Tab 4 structure verified (3 cards)
  ✓ 3. checkin.html form order and elements verified (Step 3 remark before Step 4 location)
  ✓ 4. SettingsController.js methods and handlers verified
  ✓ 5. CheckinController.js special request logic verified
  ✓ 6. ReportsController.js special request remark combination verified
  ✓ 7. ApprovalsController.js badges verified
  ✓ 8. Cache version sync verified across all 8 HTML files (buildId: 20261116_95694c06)
  --- ALL QA CHECKS PASSED SUCCESSFULLY ---
  ```
- **Command**: `node pipeline/PIPE-20261113-split-dropdowns-and-special-request-official-locations/qa_deep_adversarial_verification.mjs`
- **Result**: **11 suites / 20/20 assertions PASSED** (Exit code `0`)
  ```text
  ======================================================================
  🧪 Starting Deep Adversarial Verification Suite
  ======================================================================

  ▶️ Suite 1: SettingsModel Multi-Column Retry Fallback & Remarks Sync
    ✅ [PASS] Test 1.1: Multi-column retry succeeds seamlessly when both new columns are missing in DB
    ✅ [PASS] Test 1.2: remarks aligns with union of offsite_job_types and special_request_reasons

  ▶️ Suite 2: SettingsModel Safe Fallbacks

  ▶️ Suite 3: ReportsController Deduplication and Offsite Option Retention
    ✅ [PASS] Test 3.1: Formats remark + offsite reason correctly
    ✅ [PASS] Test 3.2: Prevents double parenthesis duplication
    ✅ [PASS] Test 3.3: "ปฏิบัติงานนอกสถานที่" as offsite job type is NOT discarded
    ✅ [PASS] Test 3.4: Onsite special request shows request reason cleanly

  ▶️ Suite 4: ApprovalsController Badges and Deduplication
    ✅ [PASS] Test 4.1: Approvals table renders [ในสถานที่] badge for onsite
    ✅ [PASS] Test 4.2: Approvals table renders [นอกสถานที่] badge and deduplicates remark

  ▶️ Suite 5: CheckinController Location Selection Logic
    ✅ [PASS] Test 5.1: Numeric or string ID in official location select matches accurately

  ▶️ Suite 6: Cache Sync Integrity
    ✅ [PASS] Test 6.1: All 8 root HTML files match buildId 20261116_95694c06

  ▶️ Suite 7: SettingsModel Cached SessionStorage Normalization
    ✅ [PASS] Test 2.1: Corrupt localStorage JSON safely falls back to defaults without throwing
    ✅ [PASS] Test 2.2: Empty localStorage array safely falls back to defaults without breaking UI
    ✅ [PASS] Test 2.3: Valid custom localStorage array is preserved
    ✅ [PASS] Test 7.1: Stale cache without new fields is seamlessly normalized with defaults

  ▶️ Suite 8: SettingsController Array Initialization & Edit/Delete Safety
    ✅ [PASS] Test 8.1: SettingsController guarantees array safety on edit/delete even with initially undefined settings

  ▶️ Suite 9: AttendanceModel Onsite vs Offsite Checkout Jitter
    ✅ [PASS] Test 9.1: Onsite special request strictly preserves official coordinates and location name without jitter
    ✅ [PASS] Test 9.2: Offsite special request correctly applies jitter when enabled

  ▶️ Suite 10: CheckinController Empty Locations Fallback & Desktop Button
    ✅ [PASS] Test 10.1: Desktop Tab button + ยื่นขอลงเวลาใหม่ is properly bound to modal opening lifecycle
    ✅ [PASS] Test 10.2: Empty official_locations safely falls back to Config.DEFAULT_SETTINGS.official_locations[0]

  ▶️ Suite 11: ApprovalsController Remark Purity for Onsite Requests
    ✅ [PASS] Test 11.1: Approvals table remark does not append offsite_reason for Onsite requests

  ======================================================================
  🎉 ALL DEEP ADVERSARIAL TESTS PASSED WITH 100% SUCCESS!
  ======================================================================
  ```

### 3.3 Additional Independent Adversarial Camera Probes (Stage 3 Re-Audit)
Executed via `node --input-type=module` against live `CheckinController.js`:
1. Retrying camera (`#photoPreviewCard` click) while `#showCameraGuidanceModal` `Swal` is still open/closing → `gumCalls=2`, `ctrl.isCameraOpening=true`, dismissing old `Swal` does not break Session 2.
2. Stale Session 1 `NotAllowedError` rejecting after Session 1 cancel + Session 2 start (with active Safari permission hint banner) → does NOT close Session 2 modal, does NOT hide Session 2 banner, does NOT clear Session 2 `isCameraOpening`, and does NOT open guidance `Swal`.
3. Stale Session 1 `video.play()` settling after Session 1 cancel + Session 2 start → stops stale stream tracks, does NOT hide Session 2 `#cameraPermissionHintBanner`, and does NOT clear Session 2 `isCameraOpening`.
Result: **`ALL EXTRA ADVERSARIAL PROBES PASSED!`** (Exit code `0`).

---

## 4. Git Status, Diff & Branch `main` Audit

- **Branch / Base**: `Loca-V2` @ `c0ae762` (vs `main` @ `a477a6d`)
- **`git status -s`**:
  ```text
   M .ai_map/01_FILE_FUNCTION_INDEX.md
   M .ai_map/CODE_INDEX.json
   M approvals.html
   M assets/css/bma-theme.css
   M assets/js/components/AppLayout.js
   M assets/js/controllers/CheckinController.js
   M checkin.html
   M dashboard.html
   M docs/manual/manual-user.html
   M index.html
   M personnel.html
   M reports.html
   M settings.html
   M users.html
   M version.json
  ?? pipeline/PIPE-20261116-fix-mobile-logout-session-camera/
  ```
- **`git diff --stat HEAD`**:
  ```text
   .ai_map/01_FILE_FUNCTION_INDEX.md          |  419 +++++----
   .ai_map/CODE_INDEX.json                    | 1351 +++++++++++++++++-----------
   approvals.html                             |   15 +-
   assets/css/bma-theme.css                   |    4 +
   assets/js/components/AppLayout.js          |    8 +-
   assets/js/controllers/CheckinController.js |  699 +++++++++++---
   checkin.html                               |   25 +-
   dashboard.html                             |   15 +-
   docs/manual/manual-user.html               |   27 +-
   index.html                                 |   15 +-
   personnel.html                             |   15 +-
   reports.html                               |   15 +-
   settings.html                              |   15 +-
   users.html                                 |   15 +-
   version.json                               |    6 +-
   15 files changed, 1800 insertions(+), 844 deletions(-)
  ```
  Strictly scoped to Stage 2 approved deliverables, cache version sync, and `.ai_map/` AST sync.
- **`git diff --stat main`**:
  `272 files changed, 39002 insertions(+), 3430 deletions(-)` (all `sql/`, `.agents/`, `AGENTS.md`, `AI Work Flow/`, `second_brain_vault/`, prior `pipeline/`, and `.ai_map/vscode_ast_mapper.mjs` diffs relative to `main` pre-date `c0ae762` in earlier `Loca-V2` commits; `git diff --stat HEAD -- .ai_map/vscode_ast_mapper.mjs sql/` is empty).
- **Protected / Forbidden Files Check**:
  - `manifest.json`: Does not exist.
  - `sw.js`: Does not exist.
  - `sql/` & `.ai_map/vscode_ast_mapper.mjs`: Zero uncommitted modifications vs `HEAD`.
  - Temporary debug scripts: None.
- **DOM ID Invariance (`checkin.html`)**:
  - `HEAD` (`c0ae762`): `202` IDs → Working copy: `204` IDs (**0 removed**, **2 added**: `#cameraPermissionHintBanner`, `#cameraPermissionHintText`).
  - Historical `adr_004` (`2026-10-26`): All `30` `adr_004` IDs that existed in `HEAD` remain intact in the working copy.
- **Git Safety**: Neither `git commit` nor `git push` was executed.

---

## 5. Unverified Real-Device Aspects

- All JS/DOM checks executed in Node.js with mocked `navigator.mediaDevices`, `navigator.permissions`, `Swal`, `localStorage`, `FileReader`, `Image`, and `Supabase`.
- Real physical mobile hardware behaviors (Brave Android Shields & permission prompt, Chrome Android One-Time vs While-visiting-site, Safari iOS `aA`/Page Menu & `TypeError` timing + native `<label for="cameraFallbackFileInput">` sheet, Chrome iOS `WKWebView`, real `100dvh` visual overlap of `.swal2-container` over `#mobileHistoryDrawer`) remain unverified on physical Android/iOS hardware and should be spot-checked after deployment.
