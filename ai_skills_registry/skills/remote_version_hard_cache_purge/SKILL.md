---
name: remote_version_hard_cache_purge
description: Dual-layer client-side cache invalidation (Remote version.json no-store probe + Hard Cache Purge + URL ?_cb redirect) combined with automated AST content-hash stamping across all HTML entry pages.
version: 1.0.0
---

# Remote `version.json` + Hard Cache Purge + Auto-Stamp Pattern (`v1.0.0`)

## When to Use
Use this skill whenever:
1. Modifying any frontend file (`*.html`, `assets/css/**`, `assets/js/**`) in a static/GitHub Pages/MPA/SPA web application where mobile browsers (LINE In-App Browser, iOS Safari, Android Chrome/Brave) aggressively cache HTML and ES Modules.
2. Auditing cache-busting consistency across all HTML entry points before releasing or committing updates.

## Core Architecture
1. **Deterministic Auto-Stamper (`.ai_map/vscode_ast_mapper.mjs` -> `syncFrontendCacheVersion()`)**:
   - Normalizes frontend file contents (stripping existing `CURRENT_APP_BUILD` and `?v=...` tokens) and computes a composite SHA-256 `contentHash`.
   - When `contentHash` changes, writes root `version.json` (`{ buildId, contentHash, updatedAt }`) and stamps `CURRENT_APP_BUILD = '<buildId>'` and `?v=<buildId>` across all 8 HTML entry pages (`index.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`).
   - 100% idempotent when run repeatedly without code changes.
2. **Client-Side Hard Cache Purge & Remote Poller (`<head>` of all 8 HTML pages)**:
   - Preserves `bma_auth_session_v2` and `bma_theme_mode` so users are never logged out during an update.
   - Checks both inline `CURRENT_APP_BUILD` and remote `./version.json?_t=${Date.now()}` (`cache: 'no-store'`) on page load, `pageshow` (BFCache), and `visibilitychange`.
   - On mismatch: clears `window.caches`, unregisters Service Workers, overwrites disk cache via `fetch(window.location.pathname, { cache: 'reload' })`, and redirects to `?_cb=<buildId>` (guarded by `sessionStorage`), cleaning up `_cb` via `history.replaceState` after reload.

