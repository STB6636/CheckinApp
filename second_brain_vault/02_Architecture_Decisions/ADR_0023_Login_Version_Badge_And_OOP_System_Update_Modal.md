# ADR 0023: Login Version Badge & OOP Dynamic System Update Modal

> **Status**: Accepted & Implemented  
> **Date**: 2026-11-11  
> **Task ID**: `PIPE-20261111-login-version-badge-and-whats-new-modal`  
> **Build ID**: `20261111_c71e33f4`  
> **Flows**: `FLOW_AUTH_01` (Authentication & Login Flow), `FLOW_LAYOUT_01` (Civic Theme & Header UI)

---

## Context & Problem
1. **User Awareness of New Deployments**:
   - When new features and bug fixes are pushed, users had no visual indicator on the login portal (`index.html`) regarding the currently active software release version.
   - Users were unaware of critical changes (e.g., GPS 5-Tier algorithm, zero-cache satellite refresh, time format improvements) unless verbally instructed.
2. **Architecture & Scope Constraints**:
   - Zero Database Modifications: All version data must be static or client-driven without altering PostgreSQL/Supabase tables.
   - Code Cleanliness & OOP: Avoid embedding large inline HTML modals or duplicate modal structures across pages.
   - Automatic Version Coupling: Must synchronize with `version.json` and `.ai_map/vscode_ast_mapper.mjs` automatically upon every build.
   - Zero Clash with Cache-Purge: Must not conflict with the existing `checkRemoteVersion` and `performHardCachePurge` mechanisms in `index.html`.
   - Single-View Enforcement: The "What's New" modal must only appear once per build version automatically, but allow users to click the badge to review update notes at any time.

---

## Decision & Implementation
1. **Pure OOP Component (`SystemUpdateModal.js`)**:
   - Created `assets/js/components/SystemUpdateModal.js` with zero dependencies beyond Font Awesome & Tailwind.
   - Features self-contained HTML/CSS rendering, animated backdrop, card entry animations, and safe HTML sanitization (`#escapeHtml`).
   - Supports dual close actions: circular top-right close `X` button and prominent center-bottom acknowledge button ("รับทราบและเข้าสู่ระบบ").
   - Closes gracefully on `Escape` key press or backdrop click without memory leaks.
2. **Glassmorphism Version Badge**:
   - Injected into slot `#loginVersionBadgeSlot` at the top-right corner of the login card header in `index.html`.
   - Styled with Tailwind glassmorphism (`bg-white/15 backdrop-blur-md border border-white/25 shadow-sm text-white/90 hover:bg-white/25 hover:scale-105 active:scale-95`).
   - Uses dual icon classes `fa-wand-magic-sparkles fa-sparkles text-[#F6DE51]` with fallback CSS pseudo-element for 100% Font Awesome 6.5.1 Free compatibility.
   - Interactive: clicking badge opens the full release details modal on demand.
3. **Automated Version & Release Notes Synchronization**:
   - Updated `.ai_map/vscode_ast_mapper.mjs` (`syncFrontendCacheVersion()`) to preserve `existingVersion?.appVersion` and `existingVersion?.releaseNotes`.
   - Populated `version.json` with structured release notes, highlights, icons, and colors.
   - Resolved active build ID dynamically from `localStorage.getItem('bma_app_build')` or `CURRENT_APP_BUILD` to prevent offline fallback race conditions.
4. **Single-View Policy & Storage Separation**:
   - Stored view state under `localStorage.getItem('bma_last_seen_update_build')`.
   - Distinct from `bma_app_build` and `bma_reloaded_build`, guaranteeing that hard cache purge logic and modal presentation logic remain fully decoupled.
5. **Non-Blocking Concurrent Initialization**:
   - In `LoginController.js`, invoked `SystemUpdateModal.init()` concurrently via `Promise.allSettled` alongside `#loadOrganizationBranding()`.

---

## Consequences
- **Positive**: 
  - Zero database overhead; purely static and client-side.
  - Highly reusable, zero code duplication, clean separation of concerns.
  - Automatic version bumping and release note preservation across GitHub pushes.
  - Smooth user experience with clear changelog visibility and single-view auto-popup.
- **Negative/Tradeoff**:
  - Updating release notes copy requires editing `version.json` prior to running the build mapper.
