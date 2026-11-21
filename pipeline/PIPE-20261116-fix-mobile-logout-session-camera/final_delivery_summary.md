# Final Delivery Summary: Mobile Logout Z-Index, 7-Day Session Preservation & Cross-Browser Camera Lifecycle

- **Task ID**: `PIPE-20261116-fix-mobile-logout-session-camera`
- **Build ID**: `20261116_b9b109ff`
- **Target Branch**: `Loca-V2` (Uncommitted changes prepared cleanly for user review; **no `git push` executed per policy**)
- **Active Supabase Schema**: `staging` (Zero database schema changes; `public` untouched)
- **QA Verdict**: **`PASS`**

---

## 1. Summary of Root Causes & Implemented Fixes

### 1.1 Mobile Hamburger Logout Confirmation Dialog Layering (`bma-theme.css`)
- **Root Cause**: `#mobileHistoryDrawer` (`checkin.html:643`) uses `z-[9999]` (`w-full` on mobile), whereas SweetAlert2 v11 defaults `.swal2-container` to `z-index: 1060`. Clicking `#btnDrawerLogout` rendered the confirm dialog beneath the open drawer until the drawer was closed.
- **Fix**: Added `.swal2-container { z-index: 99990 !important; }` after the SweetAlert2 Civic Material Skinning block in `assets/css/bma-theme.css` (`L1321-L1324`), placing dialogs strictly above `z-[9999]` drawer/modals/update-modal and below `#bmaTopProgressBar` (`99999`), `#bmaToastWrapper` (`100000`), and `#bmaGlobalSpinner` (`999999`) while keeping `#mobileHistoryDrawer` intact on cancel.

### 1.2 7-Day Sliding Session Preservation & Renewal (`8 HTML Files`, `CheckinController.js`, `AppLayout.js`)
- **Root Cause**: `AuthService.SESSION_TTL_MS` is configured for a 7-day sliding window (`bma_checkin_session_user_v2_7`), but `<head>` `performHardCachePurge()` scripts across all 8 root HTML entry pages preserved outdated keys `['bma_auth_session_v2', 'bma_theme_mode', BUILD_STORAGE_KEY]`, wiping live `localStorage` session, theme, remember-me, and release-notes state on every deploy (`~1 day`). Additionally, `visibilitychange` handlers did not renew sessions and pre-submit checks ignored `null` returns.
- **Fix**:
  - Updated `PRESERVE_KEYS` at line `15` across all 8 root HTML files (`index.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`) to `['bma_checkin_session_user_v2_7', 'bma_checkin_theme_mode_v2_7', 'bma_remember_me', 'bma_remember_username', 'bma_last_seen_update_build', BUILD_STORAGE_KEY]`.
  - Added `AuthService.getCurrentUser(true)` sliding renewal + expired-session redirect on `!document.hidden` in `CheckinController.js` (`L120-L129`) and `AppLayout.js` (`L870-L881`), and guarded expiry before check-in/special-request submission in `CheckinController.js` (`#handleMainCheckin`, `#handleSubmitSpecialRequest`).

### 1.3 Cross-Browser Camera Lifecycle & Guidance (`checkin.html`, `CheckinController.js`, `docs/manual/manual-user.html`)
- **Browser/OS Behavior Clarified**: Browsers do not expose a single `"Permanent Allow"` dialog button — Brave Android defaults to `"จนกว่าจะปิดเว็บไซต์นี้"` (requiring `"ตลอดไป"` or Tune/Sliders site settings + Shields *"Forget me when I close this site"* OFF + Android App Permission *"อนุญาตขณะใช้งานแอปเท่านั้น"*), Chrome Android offers `"อนุญาตขณะเข้าชมเว็บไซต์"`, Safari iOS defaults to `"ถาม"` (expiring on reload/close or ~60s idle after `track.stop()` unless set to `"อนุญาต"` via `aA` / Page Menu > Website Settings), and Chrome iOS (`WKWebView`) may reset on older builds without sticky `Always Allow`.
- **Code Bugs Fixed**:
  - Changed `#cameraFallbackFileInput` (`checkin.html:318`) from `class="hidden"` to `class="sr-only"` and added non-blocking `#cameraPermissionHintBanner` inside `#modalFullscreenCamera`.
  - Fixed `#cameraFallbackFileInput` click `e.stopPropagation()` + `#photoPreviewCard` target guard (stopping the DOM bubbling re-entrancy loop) and added `Swal.close()` + `reader.onerror`/`img.onerror` input reset in `#handleFallbackFileSelected()`.
  - Unified `#openFullscreenCamera()` and `#openCameraOnDemand()` around `#startCameraSession()` with `cameraSessionToken` + `isCameraOpening` race protection, synchronous LINE fallback before any `await`, safe `enumerateDevices()` handling anti-fingerprinting `[]`/errors, targeted retries (constraint fallback only on `OverconstrainedError`/`ConstraintNotSatisfiedError`, 1-time 300ms retry only on `NotReadableError`/`AbortError` preserving hardware-busy classification, **zero retry** on `NotAllowedError`), non-blocking 120ms prompt hint timer + safe `permissions.query`, `track.onended` + `visibilitychange` dead-track reset, and 4-browser recovery guidance with synchronous `<label for="cameraFallbackFileInput">` when `allow_gallery_fallback` is active.
  - Updated `docs/manual/manual-user.html` (`L203`, `L434`, `L440-L472`, `L1044-L1052`) across Brave Android, Chrome Android, Safari iOS (iOS 17/18+ UI, `"อนุญาต"` only), and Chrome iOS.

---

## 2. Verification & QA Audit Results
- **Syntax Checks (`node --check`)**: Exit `0` on `CheckinController.js`, `AppLayout.js`, `AuthService.js`, `UIHelpers.js`, `vscode_ast_mapper.mjs`, and `qa_fix_mobile_logout_session_camera.mjs`.
- **Primary QA Suite (`qa_fix_mobile_logout_session_camera.mjs`)**: **`30 / 30 PASSED | 0 FAILED`** (mocked Node ESM/VM environment).
- **Regression Suites**: `qa_split_dropdowns_verification.mjs` (**8 / 8 PASSED**) and `qa_deep_adversarial_verification.mjs` (**20 / 20 PASSED** across 11 suites).
- **Cache Version Sync**: `version.json` (`buildId: 20261116_b9b109ff`) and all 8 root HTML entry pages match 100%, with `.ai_map/` indexing 172 files / 900 symbols.
- **Knowledge & Skill Sync**: Updated `remote_version_hard_cache_purge/SKILL.md`, `rule_remote_version_hard_cache_purge_autostamp.md`, added `ADR_0031_mobile_logout_zindex_session_7day_and_cross_browser_camera.md`, and updated `second_brain_vault/00_INDEX_MOC.md`.

> **Unverified Physical Hardware Note**: Real Android (Brave/Chrome) and iOS (Safari/Chrome) device prompts, native `<label>` picker opening on mobile WebKit, and `100dvh` overlay rendering should be spot-checked on real mobile devices once pushed/deployed by user command.
