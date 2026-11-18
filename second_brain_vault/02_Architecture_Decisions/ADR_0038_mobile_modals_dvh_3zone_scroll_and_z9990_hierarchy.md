# ADR 0038: Unified 3-Zone Responsive Mobile Modal Architecture (`100dvh` + `my-auto`), `z-[9990]` Layering & SPA Modal Lifecycle Hygiene

- **Date**: 2026-11-18
- **Status**: Accepted & Verified (`Build ID: 20261118_a554aa4b`, `App Version: v2.10.0`)
- **Task ID**: `PIPE-20261118-admin-mobile-modals-clipping-fix`
- **Linked Flows**: `FLOW_LAYOUT_01`, `FLOW_PERSONNEL_01`, `FLOW_USERS_01`, `FLOW_REPORTS_01`, `FLOW_SETTINGS_01`, `FLOW_AUTH_01`, `FLOW_AUTH_02`, `FLOW_CHECKIN_01`, `FLOW_SPECIAL_REQ_01`
- **Active Supabase Schema**: `'staging'` (Zero SQL/DDL changes)

---

## Context & Problem Statement
Mobile usability audits on real Android Chrome/Brave browsers (`390w`) and headless Chromium (`390x844`, `390x740`, `390x560`, `390x420`) exposed four structural modal defects across the application:
1. **Personnel Profile Cutoff & Bottom Nav Exposure (`personnel.html` `#modalPersonnelResumeProfile`, Screenshot 1)**:
   - Legacy CSS rule `#modalPersonnelResumeProfile > div` (`assets/css/bma-theme.css:1620-1631`, added in V19) clamped modal card height to `calc(100vh - 2.5rem)` with `overflow: hidden` (`>= 600px`) while `personnel.html:386-514` lacked any internal scrollable body container (`flex-1 min-h-0 overflow-y-auto`) or `shrink-0` header/footer. This severed `"3. ส่วน / ฝ่าย:"` onward (`"4. กลุ่มงาน:"` & action footer buttons), spilled card content below `600px`, left a ~48px exposed band showing `z-30` `#bmaMobileBottomNav` beneath the clipped box, and collided via shared ID with `reports.html:356`.
2. **Flexbox `items-center` Negative-Y Top Clipping (`users.html` `#modalUserAccountForm` Screenshot 2, `personnel.html` `#modalPersonnelForm`, `settings.html` `#modalSettingsItem`)**:
   - Unconstrained tall forms (`963px`–`1285px`) inside `flex items-center justify-center overflow-y-auto` overflowed symmetrically into negative `y` coordinates (`-206px` to `-432px`), making headers, close `[X]` buttons, and top fields (`#usrPersonnelSearchFilter`) unreachable even at `scrollTop = 0`, while `#modalSettingsItem` also overflowed starting at `740px` (`max-h-[65vh]` + `my-8` + header/footer).
3. **`z-50` Layer Collisions & Invalid Tailwind v4 `backdrop-blur-xs`**:
   - Page modals at `z-50` tied with `#bmaSidebarDrawer` (`z-50`) and `#notificationDropdownMenu` (`z-50`), while Tailwind Play CDN v3 ignored `backdrop-blur-xs` (`backdropFilter: "none"`) across 16 overlays/components.
4. **Inconsistent Scroll Lock, Scroll Reset & SPA Lock Cleanup**:
   - Only `SystemUpdateModal` locked `body.bma-modal-open`; static modals retained stale scroll positions when reopened, lacked uniform backdrop/ESC close handlers, and needed `AppLayout.navigateAjaxPage()` body-lock synchronization.

---

## Decision & Implementation
1. **CSS Contract Stabilization ([bma-theme.css](file:///f:/STB%20System/CheckinApp-UXUI/assets/css/bma-theme.css))**:
   - Defined permanent `body.bma-modal-open { overflow: hidden !important; overscroll-behavior: contain; }` (`L1511-1514`).
   - Removed the obsolete `#modalPersonnelResumeProfile > div` `100vh` / `overflow: hidden` override while preserving `.fixed.inset-0` rules, `#modalSettingsBody { display: block !important; }`, and single `.swal2-container { z-index: 99990 !important; }` (`ADR_0031`).
2. **Unified 3-Zone Flex Column + `100dvh` + `my-auto` + `z-[9990]` Standard**:
   - Admin & Login modals ([personnel.html](file:///f:/STB%20System/CheckinApp-UXUI/personnel.html), [users.html](file:///f:/STB%20System/CheckinApp-UXUI/users.html), [reports.html](file:///f:/STB%20System/CheckinApp-UXUI/reports.html), [settings.html](file:///f:/STB%20System/CheckinApp-UXUI/settings.html), [index.html](file:///f:/STB%20System/CheckinApp-UXUI/index.html)) upgraded to `z-[9990]`, `backdrop-blur-sm`, `my-auto`, `max-h-[calc(100dvh-1.25rem)] sm:max-h-[90dvh]` (`92dvh` for preview), `shrink-0` Header, `flex-1 min-h-0 overflow-y-auto overscroll-contain` Body (`<form class="flex-1 min-h-0 flex flex-col overflow-hidden">` for form modals), and `shrink-0` Sticky Footer.
   - All 5 [checkin.html](file:///f:/STB%20System/CheckinApp-UXUI/checkin.html) overlays (`#mobileHistoryDrawer`, `#modalSpecialRequest`, `#modalOffsiteMapSearch`, `#modalFullscreenCamera`, `#modalViewGpsMap`) and [SystemUpdateModal.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/components/SystemUpdateModal.js) preserve exact `z-[9999]` and all `adr_004` DOM IDs (`#cameraFallbackFileInput` stays `sr-only`) while adopting `backdrop-blur-sm`, `dvh`, `my-auto`, `min-h-0`, and internal scrollability. [AppLayout.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/components/AppLayout.js) `#bmaSidebarBackdrop` upgraded to `backdrop-blur-sm` and calls `UIHelpers.syncBodyModalLock()` across SPA transitions.
3. **Non-Breaking Shared Lifecycle Helpers ([UIHelpers.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/core/UIHelpers.js#L1318-L1409)) & Controller Wiring**:
   - Added `UIHelpers.syncBodyModalLock()`, `UIHelpers.prepareModalOpen(modalEl)`, and `UIHelpers.bindModalDismiss(modalEl, closeCallback)` (preserving direct `.classList.remove('hidden')` literals for QA contract compatibility across `PersonnelController`, `UsersController`, `ReportsController`, `SettingsController`, `LoginController`, and `CheckinController`).
4. **Skill Extracted**: Added `viewport_bounded_3zone_modal_lifecycle` to `ai_skills_registry/`.

---

## Verification
- Implemented & audited on `Gemini 4 Hydrogen (High)` (`buildId: 20261118_a554aa4b`):
  - `git diff --check`: Clean (`0` exit code).
  - `node --check` on all 9 edited JS files + `.mjs` scripts: **PASS**.
  - [qa_v48_mobile_modals_test.mjs](file:///f:/STB%20System/CheckinApp-UXUI/pipeline/PIPE-20261118-admin-mobile-modals-clipping-fix/qa_v48_mobile_modals_test.mjs) (Playwright Chromium `390x844`, `390x740`, `390x560`, `390x420` across all 6 runtime modal pages, SPA transition, and `SystemUpdateModal`): **10 / 10 PASS**.
  - Regression suites: `qa_v2_10_announcement_verification.mjs` (**20 / 20 PASS**), `test_qa_assertions.mjs` (**ALL PASS**), `qa_admin_mobile_cards_users_tabs_test.mjs` (**17 / 17 PASS**), `qa_mobile_cards_drawer_spa_test.mjs` (**12 / 12 PASS**), and `qa_fix_mobile_logout_session_camera.mjs` (**#08 Z-Index hierarchy + Camera Runtime PASS**; 4 pre-existing baseline line/hash assertions `#06/#07/#17/#30` from `PIPE-20261117`).
  - Cache Version Sync: `version.json`, all **9 HTML** files (`20261118_a554aa4b`), and `.ai_map/CODE_INDEX.json` 100% synchronized.
