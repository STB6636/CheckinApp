# ADR 0034: AppLayout Authoritative Active-Page State, Circular Watermark Break, Full Settings Hydration & SPA Controller Hygiene

- **Date**: 2026-11-17
- **Status**: Accepted & Verified (`Build ID: 20261117_e60fdbe3`, `App Version: v2.10.0`)
- **Task ID**: `PIPE-20261117-sidebar-active-state-and-realtime-settings-fix`
- **Linked Flows**: `FLOW_LAYOUT_01`, `FLOW_SETTINGS_01`, `FLOW_APPROVALS_01`
- **Active Supabase Schema**: `staging` (Zero DB schema edits)

---

## Context & Problem Statement
After logging into the Admin Portal (`dashboard.html`), SPA-navigating via [AppLayout.navigateAjaxPage()](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/components/AppLayout.js#L242-L358) to another admin page (such as `settings.html` → `7. ประกาศระบบ`) and clicking Save caused the left Sidebar highlight to snap back to `"ภาพรวม"` (`dashboard`) while `<main>`, Topbar, `#bmaMobileBottomNav`, and `VIEW_PAGE_STORAGE_KEY` remained on `settings`. Three cooperating defects in `AppLayout.js` triggered this behavior:
1. **`#renderSidebar()` (`L430`) omitted `.active`** and reset `#sidebarSpecialBadge` / `#sidebarResetBadge` to `0` (`hidden`), whereas `#updateActiveNavState()` (`L168`) added `.active`.
2. **Stale closure `activePage` + circular re-entrancy**: `bma:settings-updated` (`L114-120`) was bound once on initial layout mount (`activePage = 'dashboard'`) and resolved active page via `a.active || activePage`, then re-entered `refreshNotificationBell()` (`L119`). Dispatch #1 (`SettingsModel.updateSettings`) stripped `.active`, leaving Dispatch #2 (`refreshNotificationBell` `L667` before `L679` saved `#lastSettingsWatermark`) and Dispatch #3 (`postgres_changes` `L835`) with `a.active === null`, reverting Sidebar highlight to `'dashboard'` and triggering extra watermark queries.
3. **Partial payloads & raw cache overwrite**: `L667` dispatched a 6-column `watermark.settingsRow` and `L856` dispatched a 4-key broadcast object directly into `AppLayout.#settings` (temporarily flashing `"undefined"` in org/footer), while `L834` wrote un-normalized `payload.new` directly to `sessionStorage[CACHED_SETTINGS]`.

Two secondary SPA defects were also resolved: missing `!window.__BMA_SPA_ROUTER_ACTIVE__` in [ApprovalsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/ApprovalsController.js#L538-L545), and duplicate checkbox `change` listeners attached on every save inside [SettingsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/SettingsController.js).

---

## Decision & Implementation
1. **[AppLayout.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/components/AppLayout.js)**:
   - Added `static #isSettingsListenerBound = false` (`L18`) and `static #currentActivePage = 'dashboard'` (`L21`), updated on both `initAdminLayout()` (`L104`) and `#updateActiveNavState()` (`L170`).
   - Updated `#renderSidebar()` (`L443-L459`) to emit `.active` matching `#updateActiveNavState()` (`L184`) and immediately restore `#sidebarSpecialBadge` / `#sidebarResetBadge` counts from `#lastPendingSpecialCount` / `#lastPendingResetCount` (`> 0`).
   - Updated the `bma:settings-updated` listener (`L117-L135`): added `#isSettingsListenerBound` guard, kept synchronous execution, filtered out `undefined`-valued entries before merging `e.detail` onto `AppLayout.#settings || Config.DEFAULT_SETTINGS`, resolved `currentActive` from `AppLayout.#currentActivePage`, re-rendered Sidebar + Mobile Bottom Nav + Footer using `AppLayout.#currentUser || currentUser`, and removed `AppLayout.refreshNotificationBell()` to break circular re-entrancy.
   - Updated all 3 upstream emitters (`refreshNotificationBell` `L685-L711` saving `#lastSettingsWatermark` before `await`/dispatch, `postgres_changes` `L861-L889`, `broadcast` `L895-L911`) to invalidate `CACHED_SETTINGS` and hydrate normalized settings via `await SettingsModel.getSettings(true)` (with safe merge fallback on network error).
2. **[ApprovalsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/ApprovalsController.js#L538-L545)**:
   - Added `if (!window.__BMA_SPA_ROUTER_ACTIVE__) { window.__BMA_SPA_ROUTER_ACTIVE__ = true; ... }` bootstrap guard preventing double-initialization when navigating away from a direct-loaded `approvals.html`.
3. **[SettingsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/SettingsController.js)**:
   - Extracted `#syncEarlyWindowVisibility()` and `#syncRadiusVisibility()` and moved `#toggleFilterShiftsByRealtime` / `#toggleRandomizeGpsCheckout` `change` bindings from `#renderAllSettings()` to `#bindEvents()`.

---

## Verification
- `node --check` passed cleanly (`0` errors) across modified files and QA suite.
- [qa_sidebar_active_sync_test.mjs](file:///f:/STB%20System/CheckinApp-UXUI/pipeline/PIPE-20261117-sidebar-active-state-and-realtime-settings-fix/qa_sidebar_active_sync_test.mjs): **8 / 8 PASSED** (covering all 6 admin pages SPA navigation + Tab 7 / Tabs 1–6 save + 3-dispatch cascade + explicit-`undefined` payload protection + E2E `navigateAjaxPage` + `approvals.html` SPA boot guard).
- Full regression suites passed: `qa_v2_10_announcement_verification.mjs` (**20 / 20**), `qa_test_suite.mjs` (**139 / 139**), `qa_runtime_deep_simulation.mjs` (**40 / 40**), `qa_real_instance_test.mjs` (**8 / 8**), `qa_split_dropdowns_verification.mjs` (**8 / 8**).
- Cache Version Sync verified at `buildId: 20261117_e60fdbe3` across `version.json` and all 9 HTML files (`0` non-buildId HTML changes, zero `git push`).
