# ADR 0037: Admin Portal Mobile Card-Lists (5 Pages), Users 2-Tab Isolation, RBAC Main-Nav/Tab Count Badges & Gemini 4 Hydrogen (High) Workflow Upgrade

- **Date**: 2026-11-18
- **Status**: Accepted & Verified (`Build ID: 20261118_d72b67f4`, `App Version: v2.10.0`)
- **Task ID**: `PIPE-20261118-admin-mobile-cards-and-users-tabs`
- **Linked Flows**: `FLOW_DASHBOARD_01`, `FLOW_REPORTS_01`, `FLOW_APPROVALS_01`, `FLOW_PERSONNEL_01`, `FLOW_USERS_01`, `FLOW_LAYOUT_01`
- **Active Supabase Schema**: `'staging'` (Zero SQL/DDL changes)

---

## Context & Problem Statement
All 5 Admin Portal data tables (`dashboard.html`, `reports.html`, `approvals.html`, `personnel.html`, `users.html`) rendered `.bma-table` (`min-width: 720px`), forcing horizontal swiping on mobile viewports (`< lg`). In addition:
1. `DOMDiffHelper.js` (`L13-55`) table helpers (`reindexTableSequence`, `lockRowForConcurrentAdmin`) queried `<tr>`/`<td>` exclusively and would silently fail on `<div id="...CardsContainer">` card lists.
2. `.bma-card` (`bma-theme.css:342`) enforces `background-color: var(--bma-surface-1) !important`, flattening mobile white-on-white cards unless bypassed on inner containers or replaced.
3. `#resolveReportRemark()` (`ReportsController.js:488-489`) injected inline `color: #1e293b`/`#475569`, hurting Dark Mode legibility, while `forPrintPdf === true` needed strict PDF print-table purity (`ADR_0020`).
4. `users.html` stacked Users and Password Resets vertically without tabs, filtered resets via Tab 1's inputs, risked colliding with `AppLayout.js`'s `.settings-tab-btn` document handler, lacked main-nav Mobile Bottom Nav / Tab count notification pills, and `UserModel.processPasswordResetRequest()` lacked an internal `currentUser` RBAC scope check.
5. `AGENTS.md` and `.agents/skills/ai-software-pipeline/` needed their standard SubAgent & Orchestrator model updated from `Flash 3.8 High` to `Gemini 4 Hydrogen (High)` (`gemini-4-hydrogen-high`).

---

## Decision & Implementation
1. **[DOMDiffHelper.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/utils/DOMDiffHelper.js)**:
   - Kept all table methods (`reindexTableSequence`, `lockRowForConcurrentAdmin`, `prependRowWithAnimation`, `removeRowWithFade`, `highlightRowUpdate`, `animateNumericValue`) untouched.
   - Added card-aware helpers: `reindexCardSequence`, `lockCardForConcurrentAdmin` (WCAG AA light/dark lock banner + XSS-safe strings), and `prependCardWithAnimation`.
2. **Unified Mobile Card-Lists (`< lg`) Across 5 Admin Pages (Desktop `hidden lg:block` Preserved)**:
   - Borderless 2-column `Label : Value` white rounded cards (`rounded-2xl bg-white dark:bg-slate-800`) on slate canvas (`bg-slate-100/80 dark:bg-slate-900/60`), hairline borders reserved solely for checkbox/badge headers or action footers, WCAG AA light/dark semantic status colors, XSS escaping, and mirrored mobile shimmer skeletons & empty/error fallbacks:
     * **[dashboard.html](file:///f:/STB%20System/CheckinApp-UXUI/dashboard.html) & [DashboardController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/DashboardController.js)**: `#dashboardRecentCardsContainer`, `flex-wrap` pagination bar, differential card updates + preserved `qa_comprehensive_test.mjs` literals.
     * **[ReportsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/ReportsController.js)**: `forPrintPdf === true` stays strictly print-table-only; web mode renders `.report-person-card` cards inside `lg:hidden` slate wrapper (bypassing `.bma-card !important`), `#resolveReportRemark({ forExcel, forPrint })` fixes Dark Mode readability, `.report-person-card` opens Resume Modal (excluding `button[data-action]`), local `#escapeHtml` supports `qa_reports_redesign_verification.mjs`, RBAC Edit/Delete gating preserved.
     * **[approvals.html](file:///f:/STB%20System/CheckinApp-UXUI/approvals.html) & [ApprovalsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/ApprovalsController.js)**: `#approvalsPendingCountBadge`, `#approvalsSelectAllMobileBar` (`#chkSelectAllApprovalsMobile` synced 2-way with `#chkSelectAllApprovals`), separate `#buildRequestCardHtml` preserving `#buildRequestRowHtml`/`#formatRemarkCellHtml`/`#escapeHtml` (`test_approvals_remark.mjs`), null-guarded elements (`qa_real_instance_test.mjs`), card differential lock/fade/prepend.
     * **[personnel.html](file:///f:/STB%20System/CheckinApp-UXUI/personnel.html) & [PersonnelController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/PersonnelController.js)**: `justify-start lg:justify-end` legend, PDPA-compliant `#personnelCardsContainer` (`national_id` omitted), `[+ สร้างบัญชี]`, `[แก้ไข]`, `SuperAdmin`-only `[ลบ]` (`canDeletePersonnel`), card tap -> `#openPersonnelResumeModal`.
3. **Users 2-Tab Layout, Count Badges & RBAC Hardening**:
   - **[users.html](file:///f:/STB%20System/CheckinApp-UXUI/users.html) & [UsersController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/UsersController.js)**: Isolated `#usersTabNav` (`.users-tab-btn`, `[data-users-tab-target]`, `.users-tab-pane`) avoiding `AppLayout` `.settings-tab-btn`; Tab 1 `บัญชีผู้ใช้งาน` (`#usersTotalTabBadge`) & Tab 2 `อนุมัติการเปลี่ยนรหัสผ่าน` (`#pendingResetTabBadge` + decoupled `#searchPasswordResetInput`); `Edit`/`Delete` gated by `this.canEditOrDeleteUsers`; `syncUsersSilent` empty-state & card diffing; `test_qa_users_filter.mjs` IDs/headers intact.
   - **[AppLayout.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/components/AppLayout.js#L550-L581)**: Added `#mobileNavSpecialBadge` & `#mobileNavResetBadge` (gated behind `canViewUsersMenu`), synced across `#renderMobileBottomNav`, `refreshNotificationBell`, Sidebar (`#sidebarSpecialBadge`, `#sidebarResetBadge`), and Topbar Bell, plus bell deep-link to `tab-panel-password-resets`.
   - **[UserModel.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/models/UserModel.js#L237-L270)**: Added `currentUser = null` RBAC guard inside `processPasswordResetRequest()` rejecting division Admins, `SuperAdmin` targets, and out-of-scope bureaus/divisions.
4. **Workflow Model Upgrade & Manual**:
   - Updated [AGENTS.md](file:///f:/STB%20System/CheckinApp-UXUI/AGENTS.md) and `.agents/skills/ai-software-pipeline/` from `Flash 3.8 High` to `Gemini 4 Hydrogen (High)` (`gemini-4-hydrogen-high`).
   - Updated [manual-admin.html](file:///f:/STB%20System/CheckinApp-UXUI/docs/manual/manual-admin.html) Topic 8.

---

## Verification
- Executed via `implementer` & `auditor` on `gemini-4-hydrogen-high` (`buildId: 20261118_d72b67f4`), followed by full local Orchestrator verification:
  - `node --check` (modified/new JS/MJS): Exit `0`.
  - [qa_admin_mobile_cards_users_tabs_test.mjs](file:///f:/STB%20System/CheckinApp-UXUI/pipeline/PIPE-20261118-admin-mobile-cards-and-users-tabs/qa_admin_mobile_cards_users_tabs_test.mjs): **17 / 17 PASS**.
  - Plus regression suites across Loading (`139/139`), DOMDiff (`5/5`), Reports (`96/96`), Print (`3/3`), Approvals (`21/21` + `8/8`), Loca-V2 (`25/25`), Shift Card (`29/29`), Check-in Cards/SPA (`12/12`), v2.10 Announcement (`20/20`), Sidebar Active (`8/8`), Settings Tab 1 (`9/9`), Position Format (`36/36`), and 9-HTML Cache Sync (`20261118_d72b67f4`).
