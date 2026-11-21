# ADR 0042: Cloudflare Pages Pretty URLs (`/loading`) Path Normalization & Root-Safe App Redirects

- **Date**: 2026-11-21
- **Status**: Accepted & Verified (`Build ID: 20261121_819c1304`)
- **Task ID**: `PIPE-20261121-fix-cloudflare-loading-path-loop`
- **Linked Flows**: `FLOW_AUTH_01`, `FLOW_LAYOUT_01`

---

## Context & Problem Statement
When deployed to **Cloudflare Pages** (`checkin-stb.pages.dev`), Cloudflare automatically redirects `/loading.html` to `/loading` (Pretty URLs / extensionless routing). Because `UIHelpers.KNOWN_PAGES_REGEX` intentionally excluded `loading` (per ADR-0032 so `loading.html` would never overwrite `VIEW_PAGE_STORAGE_KEY`), `UIHelpers.getRootBasePath()` failed both `KNOWN_PAGES_REGEX` and `/\.html$/i` checks on `/loading` and appended a trailing slash (`"/loading/"`). Subsequent relative `window.location.replace('loading.html?entry=session')` calls resolved to `/loading/loading.html?entry=session`, causing Cloudflare Pages to serve `index.html` fallback which hid `<body>` via `html.bma-session-redirecting` and looped indefinitely on a blank emerald screen.

---

## Decision & Implementation
1. **`UIHelpers.js` (`L15–71`)**:
   - Preserved `KNOWN_PAGES_REGEX` unchanged (keeping `VIEW_PAGE_STORAGE_KEY` safe from `loading.html`).
   - Added `static TRANSIENT_PAGES_REGEX = /(?:\/loading(?:\.html)?)+(?=\/|$)/i;` and updated `getRootBasePath()` to strip transient `/loading` segments on both root domains (`/`) and subpath deployments (`/CheckinApp/`).
   - Added `static resolveAppUrl(targetPath = '')` resolving relative/root targets against `UIHelpers.getRootBasePath()`, preserving `https?://`, `//`, already-prefixed paths, and `file:` protocol fallback.
2. **Self-Healing 0ms Inline Guards (`index.html` L63–75 & L138–148, `loading.html` L440–451)**:
   - Computed `appRootPath` via `(window.location.pathname || '/').replace(/\/[^\/]+\.html$/i, '').replace(/(?:\/(?:index|loading)(?:\.html)?)+(?=\/?$)/i, '').replace(/\/?$/, '/')` so any client stuck at `/loading/loading.html?entry=session` self-heals immediately on reload.
3. **Controller Root-Safe Navigation (`LoadingController.js` & `LoginController.js`)**:
   - Replaced all relative `window.location.replace(...)` calls with `UIHelpers.resolveAppUrl(...)`.
4. **Mandatory 10-HTML Cache Version Sync**:
   - Ran `node ./.ai_map/vscode_ast_mapper.mjs` → `buildId: 20261121_819c1304` across `version.json`, all 10 root HTML files, and `.ai_map/`.

---

## Verification Summary
- `node --check`: 0 errors on `UIHelpers.js`, `LoadingController.js`, `LoginController.js` + VM parse check passed on all inline scripts in `index.html` and `loading.html`.
- `qa_cloudflare_loading_path_test.mjs`: **96 / 96 PASS** (covering Cloudflare Pages, GitHub Pages `/CheckinApp/`, `maskUrlToRoot()` `VIEW_PAGE_STORAGE_KEY` invariance, inline script self-healing, `file:` protocol, and 10-HTML cache sync).
- `qa_runtime_deep_simulation.mjs`: **40 / 40 PASS**.
