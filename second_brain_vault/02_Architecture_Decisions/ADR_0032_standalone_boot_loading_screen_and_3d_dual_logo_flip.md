# ADR 0032: Standalone Boot Loading Screen (`loading.html` + `LoadingController.js`), 3-Scenario Entry Routing & Intact Civic Logo Stage with System Settings Synchronization

- **Date**: 2026-11-16
- **Status**: Accepted & Verified (Updated under `PIPE-20261116-loading-settings-logo-fix`)
- **Task IDs**: `PIPE-20261116-loading-entry-screen`, `PIPE-20261116-loading-settings-logo-fix`
- **Linked Flows**: `FLOW_AUTH_01`, `FLOW_LAYOUT_01`, `FLOW_SETTINGS_01`
- **Active Supabase Schema**: `staging` (Zero DB schema edits)

---

## Context & Problem Statement
1. Users logging in or returning with an active 7-day session needed a branded CheckinApp boot loading screen supporting Light & Eye-Care Dark modes without risking hangs, FOUC (flash of login UI), or edits to unrelated core attendance/admin modules.
2. In the initial revision, a 3D dual-logo flip animation caused split-half clipping distortion and flashed a hardcoded BMA emblem (`pr-bangkok.com`) / SVG shield rather than the official organization logo configured in `system_settings.logo_url`.
3. The requirement was upgraded to display the official System Settings logo (`https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc`) intact immediately at 0ms across all loader URLs (`loading.html`, `?entry=login`, `?entry=session`, root path), with dynamic synchronization when settings change, 2-tier cache hydration (`localStorage` + `sessionStorage`), and an offline landmark fallback (`fa-landmark`).
4. Unauthenticated cold visitors should NOT be stalled behind a splash redirect loop — they should land directly on `index.html`, authenticate on the login form first (so wrong credentials alert without persisting passwords in storage), and enter `loading.html` immediately after authentication or immediately when returning with a non-expired 7-day session.

---

## Decision & Implementation
1. **Dedicated Boot Loading View & Controller ([loading.html](file:///f:/STB%20System/CheckinApp-UXUI/loading.html), [LoadingController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/LoadingController.js))**:
   - Styled identically to CheckinApp (`.login-vertical-gradient` 9-color civic palette + `html.dark` Eye-Care mode + `.ld-card` + `.login-card-header-gradient` accent stripe + Font Awesome 6.5 icons + `.ld-bar` emerald-gold progress bar).
   - Replaced split-half clipping `@keyframes logo-flip` and hardcoded external logos with an intact single-logo stage (`#ldLogoStage`) featuring Civic Orbital Halo (`.halo-ring`) + gentle pulse animation, 84px mobile scaling, and `prefers-reduced-motion` support.
   - Embedded `<img id="ldOrgLogo" src="https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc" alt="Organization Logo" decoding="async" fetchpriority="high">` rendering immediately at 0ms across all entry routes.
   - Added `#ldLogoFallback` (`<i class="fa-solid fa-landmark"></i>`) displayed strictly on image `onerror` when offline/unreachable, backed by `#ldOrgLogo.hidden` / `#ldLogoFallback.hidden` (`display: none !important;`) to prevent ID specificity leaks.
   - Moved parser-blocking `@supabase/supabase-js@2` down to the bottom of `<body>` right before `LoadingController.js`.
   - 0ms inline pre-hydration restores Light/Dark theme (`bma_checkin_theme_mode_v2_7`) and organization branding (`bma_cached_brand_v2_7`) with seamless fallback to `sessionStorage.bma_checkin_cached_settings_v2_7`.
   - `LoadingController.OFFICIAL_SETTINGS_LOGO` defines `'https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc'` as the universal default. `#renderOrgLogo(rawUrl)` normalizes Google Drive URLs strictly on Google domains (`drive.google.com`, `docs.google.com`, `lh3.googleusercontent.com`), skips redundant re-assignments when `src` is unchanged, preserves error fallback states, and coordinates bounded decode readiness within ~750ms display floor.
2. **3-Scenario Entry Routing ([index.html](file:///f:/STB%20System/CheckinApp-UXUI/index.html), [LoginController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/LoginController.js))**:
   - **Scenario 1 (Cold URL / No Session)**: Renders `index.html` directly with `#loginVersionBadgeSlot`, `SystemUpdateModal`, and all modals intact.
   - **Scenario 2 (Login Submit)**: Authenticates on `index.html` via `AuthService.login()` first, then immediately redirects via `window.location.replace('loading.html?entry=login')` without the prior 2s blocking toast delay.
   - **Scenario 3 (Active 7-Day Session)**: `<head>` fast-path checks `bma_checkin_session_user_v2_7`, hides `<body>` via `html.bma-session-redirecting` (Zero FOUC), coordinates cleanly with `performHardCachePurge()` via `window.__bmaPurgePromise` / direct redirect to `loading.html?entry=session&_cb=<buildId>`, and hands off to `LoadingController`.
3. **Cross-Controller Brand Cache Synchronization ([LoginController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/LoginController.js), [SettingsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/SettingsController.js))**:
   - Both controllers sanitize and sync `{ orgName, bureauName, headerSystemTitle, logoUrl }` to `localStorage.bma_cached_brand_v2_7` whenever settings are loaded or saved, ensuring loader screens always have the latest branding pre-cached.
4. **9-Page Cache Version Sync ([vscode_ast_mapper.mjs](file:///f:/STB%20System/CheckinApp-UXUI/.ai_map/vscode_ast_mapper.mjs))**:
   - Added `'loading.html'` to `ROOT_HTML_ENTRIES` so `node ./.ai_map/vscode_ast_mapper.mjs` hashes and auto-stamps `CURRENT_APP_BUILD` and `?v=<buildId>` across all 9 HTML pages (`index.html`, `loading.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`).

---

## Verification
- `node --check` passed cleanly across all created/modified scripts (`0` errors).
- `pipeline/PIPE-20261116-loading-entry-screen/qa_test_suite.mjs`: Total: 139 | Passed: 139 | Failed: 0.
- `pipeline/PIPE-20261116-loading-entry-screen/qa_runtime_deep_simulation.mjs`: Total: 40 | Passed: 40 | Failed: 0.
- Cache Version Sync verified across `version.json` and all 9 HTML files, with zero unintended core modifications and zero `git push`.
