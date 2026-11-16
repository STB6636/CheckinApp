# ADR 0032: Standalone Boot Loading Screen (`loading.html` + `LoadingController.js`), 3-Scenario Entry Routing & Dual-Logo 3D Flip Loader

- **Date**: 2026-11-16
- **Status**: Accepted & Verified (`Build ID: 20261116_c4c52e6f`)
- **Task ID**: `PIPE-20261116-loading-entry-screen`
- **Linked Flows**: `FLOW_AUTH_01`, `FLOW_LAYOUT_01`
- **Active Supabase Schema**: `staging` (Zero DB schema edits)

---

## Context & Problem Statement
1. Users logging in or returning with an active 7-day session needed a branded CheckinApp boot loading screen modeled after the 3D split-half Dual-Logo Flip Loader (`BMA Emblem` ↔ `Department Patch`), supporting Light & Eye-Care Dark modes without risking hangs, FOUC (flash of login UI), or edits to unrelated core attendance/admin modules.
2. Unauthenticated cold visitors should NOT be stalled behind a splash redirect loop — they should land directly on `index.html`, authenticate on the login form first (so wrong credentials alert without persisting passwords in storage), and enter `loading.html` immediately after authentication or immediately when returning with a non-expired 7-day session.

---

## Decision & Implementation
1. **Dedicated Boot Loading View & Controller ([loading.html](file:///f:/STB%20System/CheckinApp-UXUI/loading.html), [LoadingController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/LoadingController.js))**:
   - Styled identically to CheckinApp (`.login-vertical-gradient` 9-color civic palette + `html.dark` Eye-Care mode + `.ld-card` + `.login-card-header-gradient` accent stripe + Font Awesome 6.5 icons + `.ld-bar` emerald-gold progress bar).
   - Implements the 3D split-half Dual-Logo Flip (`@keyframes logo-flip`) with `-webkit-clip-path` WebKit vendor prefixes, symmetrical mobile scaling (`@media (max-width: 640px)` updating `:root { --ld-size: 84px; }`), `prefers-reduced-motion` support, and self-contained base64 SVG Data URI fallbacks (`--logo-bma-fallback`, `--logo-dept-fallback`).
   - 0ms inline pre-hydration restores Light/Dark theme (`bma_checkin_theme_mode_v2_7`) and organization branding (`bma_cached_brand_v2_7`, intentionally excluded from the 6-key `PRESERVE_KEYS` so new deploys refresh branding) while sanitizing protocols and strictly scoping Google Drive ID rewriting to Google domains (`drive.google.com`, `docs.google.com`, `lh3.googleusercontent.com`).
   - `LoadingController.init()` captures `?entry=` before `UIHelpers.initTheme()` (since `UIHelpers.KNOWN_PAGES_REGEX` does not match `loading.html`, URL masking hides the filename cleanly without overwriting `VIEW_PAGE_STORAGE_KEY`), awaits `window.__bmaPurgePromise` up to 1.5s if active, verifies & extends 7-day session (`AuthService.getCurrentUser(true)`), runs concurrent `SettingsModel.getSettings(true)` (3s cap) + `AuthService.verifySessionWithDatabase()` (2.5s cap), preflights `--logo-dept` via `new Image()` (1.8s timeout fallback), prevents self-redirect loops on `targetUrl`, enforces a ~750ms minimum display floor, arms a 12s inline failsafe watchdog (`#btnRetryLoad` directly to `loading.html?entry=...`, `#btnBackToLogin` clears session to `index.html`), and listens to `pageshow` for mobile BFCache restoration.
2. **3-Scenario Entry Routing ([index.html](file:///f:/STB%20System/CheckinApp-UXUI/index.html), [LoginController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/LoginController.js))**:
   - **Scenario 1 (Cold URL / No Session)**: Renders `index.html` directly with `#loginVersionBadgeSlot`, `SystemUpdateModal`, and all modals intact.
   - **Scenario 2 (Login Submit)**: Authenticates on `index.html` via `AuthService.login()` first, then immediately redirects via `window.location.replace('loading.html?entry=login')` without the prior 2s blocking toast delay.
   - **Scenario 3 (Active 7-Day Session)**: `<head>` fast-path checks `bma_checkin_session_user_v2_7`, hides `<body>` via `html.bma-session-redirecting` (Zero FOUC), coordinates cleanly with `performHardCachePurge()` via `window.__bmaPurgePromise` / direct redirect to `loading.html?entry=session&_cb=<buildId>`, and hands off to `LoadingController`.
3. **9-Page Cache Version Sync ([vscode_ast_mapper.mjs](file:///f:/STB%20System/CheckinApp-UXUI/.ai_map/vscode_ast_mapper.mjs))**:
   - Added `'loading.html'` to `ROOT_HTML_ENTRIES` so `node ./.ai_map/vscode_ast_mapper.mjs` hashes and auto-stamps `CURRENT_APP_BUILD` and `?v=<buildId>` across all 9 HTML pages (`index.html`, `loading.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`).

---

## Verification
- `node --check` passed cleanly across all created/modified scripts (`0` errors).
- `pipeline/PIPE-20261116-loading-entry-screen/qa_test_suite.mjs`: **130 / 130 PASSED** (`0` failures).
- `pipeline/PIPE-20261116-loading-entry-screen/qa_runtime_deep_simulation.mjs`: **29 / 29 PASSED** (`0` failures).
- Cache Version Sync verified at `buildId: 20261116_c4c52e6f` across `version.json` and all 9 HTML files, with zero unintended core modifications and zero `git push`.
