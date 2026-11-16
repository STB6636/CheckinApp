# ADR 0031: Mobile Drawer Logout Z-Index Hierarchy, 7-Day Sliding Session Preservation Across Cache Purge & Cross-Browser Camera Lifecycle

- **Date**: 2026-11-16
- **Status**: Accepted & Verified (`Build ID: 20261116_b9b109ff`)
- **Task ID**: `PIPE-20261116-fix-mobile-logout-session-camera`
- **Linked Flows**: `FLOW_LAYOUT_01`, `FLOW_AUTH_01`, `FLOW_CHECKIN_01`, `FLOW_PHOTO_01`
- **Active Supabase Schema**: `staging` (Zero DB schema edits)

---

## Context & Problem Statement
1. **Mobile Hamburger Logout Confirm Hidden Behind Drawer**:
   - `#mobileHistoryDrawer` (`checkin.html:643`) was elevated to `z-[9999]` (`w-full` on mobile), whereas SweetAlert2 v11 defaults `.swal2-container` to `z-index: 1060`. Clicking `#btnDrawerLogout` opened the confirm dialog behind the drawer overlay until the drawer was manually closed. Same bug affected 5 `z-[9999]` overlays in `checkin.html` plus `SystemUpdateModal`.
2. **Daily Session Loss (~1 Day Expiry Instead of 7 Days)**:
   - While `AuthService.SESSION_TTL_MS` implements a 7-day sliding window (`bma_checkin_session_user_v2_7`), all 8 root HTML entry files hardcoded stale keys `['bma_auth_session_v2', 'bma_theme_mode', BUILD_STORAGE_KEY]` in `PRESERVE_KEYS`. Every deploy bumped `buildId` and caused `performHardCachePurge()` to wipe `localStorage` session, theme, remember-me, and seen-update keys. Additionally, `visibilitychange` handlers did not renew the session, and `#handleMainCheckin()` / `#handleSubmitSpecialRequest()` ignored `null` returns from `AuthService.getCurrentUser(true)`.
3. **Repeated Camera Permission Prompts & WebKit / Brave Pitfalls**:
   - **Browser/OS**: Browsers do not show a single `"Permanent Allow"` button on prompts: Brave Android defaults to `"Until I close this site"`, Chrome Android contrasts `"While visiting the site"` vs `"Only this time"`, Android OS App Permission may be `"Ask every time"`, Safari iOS defaults to `"Ask"` (expiring on reload/close or ~60s idle after `track.stop()`), and Chrome iOS (`WKWebView`) may reset on older builds without sticky `Always Allow`.
   - **Code Bugs**: Unconditional 2nd `getUserMedia()` retry on `NotAllowedError`; DOM event-bubbling loop (`#cameraFallbackFileInput` inside `#photoPreviewCard` without `e.stopPropagation()`); silent `#cameraFallbackFileInput.click()` masking blocked permissions on Android and failing WebKit Transient User Activation after `await`; `enumerateDevices()` returning `[]` under Brave anti-fingerprinting; missing `Swal.close()` in `#handleFallbackFileSelected()`; stale-session races on hint banner / `isCameraOpening`; and outdated `manual-user.html` instructions (`"ถาม" หรือ "อนุญาต"` for Safari).

---

## Decision & Implementation
1. **Unified Overlay Stacking Context (`assets/css/bma-theme.css`)**:
   - Added `.swal2-container { z-index: 99990 !important; }` after the SweetAlert2 skinning block (`L1321-1324`), establishing clean ordering: `z-40/50` (Admin sidebar) `< 9999` (Drawer & 5 Modals + `SystemUpdateModal`) `< 99990` (`.swal2-container`) `< 99999` (`#bmaTopProgressBar`) `< 100000` (`#bmaToastWrapper`) `< 999999` (`#bmaGlobalSpinner`).
2. **7-Day Sliding Session Preservation & Renewal (`8 HTML files`, `CheckinController.js`, `AppLayout.js`)**:
   - Updated `PRESERVE_KEYS` across all 8 HTML files (`L15`) to `['bma_checkin_session_user_v2_7', 'bma_checkin_theme_mode_v2_7', 'bma_remember_me', 'bma_remember_username', 'bma_last_seen_update_build', BUILD_STORAGE_KEY]`.
   - Added `AuthService.getCurrentUser(true)` sliding renewal + expired-session redirect on `!document.hidden` `visibilitychange` in `CheckinController.js` and `AppLayout.js`, plus pre-submit expiry guards at the top of `#handleMainCheckin()` and `#handleSubmitSpecialRequest()`.
   - Synced `rule_remote_version_hard_cache_purge_autostamp.md` and `remote_version_hard_cache_purge/SKILL.md` with the live `PRESERVE_KEYS` list.
3. **Cross-Browser Camera Lifecycle & Guidance (`checkin.html`, `CheckinController.js`, `docs/manual/manual-user.html`)**:
   - Changed `#cameraFallbackFileInput` (`checkin.html:318`) from `class="hidden"` to `class="sr-only"` and added non-blocking `#cameraPermissionHintBanner` inside `#modalFullscreenCamera`.
   - Unified `#openFullscreenCamera()` and `#openCameraOnDemand()` around `#startCameraSession()` with `cameraSessionToken` & `isCameraOpening` race-condition guards (including `Swal` error-modal release and stale-session isolation), `track.onended` + `visibilitychange` dead-track cleanup, synchronous LINE fallback before any `await`, click `e.stopPropagation()` + `#photoPreviewCard` target guard, `Swal.close()` + error reset on `#handleFallbackFileSelected()`, safe `enumerateDevices()` ignoring `[]`/errors, targeted retries (`OverconstrainedError` fallback, single 300ms `NotReadableError`/`AbortError` retry preserving hardware-busy classification, **zero retry** on `NotAllowedError`), non-blocking 120ms prompt banner + `try/catch` `permissions.query`, and browser-specific `Swal` guidance with synchronous `<label for="cameraFallbackFileInput">` when `allow_gallery_fallback` is enabled.
   - Updated `docs/manual/manual-user.html` (`L203`, `L434`, `L440-472`, `L1044-1052`) covering Brave Android, Chrome Android, Safari iOS (iOS 17/18+ icons, `"อนุญาต"` only), and Chrome iOS.
   - Excluded PWA `manifest.json` because iOS standalone apps partition `localStorage` away from Safari and fail to improve `getUserMedia` persistence, while `performHardCachePurge()` unregisters Service Workers.

---

## Verification
- `node --check` passed on all modified JS files (`0` errors).
- `qa_fix_mobile_logout_session_camera.mjs`: **30 / 30 PASSED** (`0` failures).
- Regression suites: `qa_split_dropdowns_verification.mjs` (**8 / 8 PASSED**) and `qa_deep_adversarial_verification.mjs` (**20 / 20 PASSED**).
- Cache sync verified at `buildId: 20261116_b9b109ff` across `version.json` and all 8 root HTML entry files.
