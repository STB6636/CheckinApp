# ADR 0036: CheckinApp Mobile Card-Lists (< lg) and Hamburger Drawer AJAX SPA Architecture

- **Date**: 2026-11-18
- **Status**: Accepted & Verified (`Build ID: 20261118_069d6bc8`, `App Version: v2.10.0`)
- **Task ID**: `PIPE-20261118-mobile-cards-and-drawer-spa-redesign`
- **Linked Flows**: `FLOW_CHECKIN_01`, `FLOW_LAYOUT_01`, `FLOW_SPECIAL_REQ_01`
- **Active Supabase Schema**: `'staging'` (Zero DDL/SQL changes)

---

## Context & Problem Statement
On mobile viewports (`< lg`), `checkin.html` rendered personal attendance history (`#desktopHistoryWrapper`) and special request history (`#desktopSpecialWrapper`) inside `.bma-table` (`min-width: 720px; overflow-x: auto !important`), clipping columns horizontally inside the Hamburger Drawer (`#mobileDrawerPanel`). In addition:
1. `AttendanceModel.getPersonalAttendanceHistory()` (`L1596`) and `getPersonalSpecialRequests()` (`L1630-1631`) lacked `check_out_location` (plus `check_in_location` in `selectFallback` and `PGRST204` retry handling), preventing two-location check-in / check-out card display.
2. `#mobileDrawerPanel` duplicated organization branding in Header + white Profile Capsule in Body (~76px height), kept `btnDrawerNavCheckin` highlighted green permanently, mounted both history and special request wrappers simultaneously (`scrollIntoView` instead of separated SPA sub-views), and lacked overnight `+1 วัน` checkout date calculation.
3. Hard QA contracts prohibited removing any DOM ID vs `HEAD:checkin.html` (`adr_004` 30 IDs, `qa_fix_mobile_logout_session_camera.mjs`), required preserving the literal `#btnOpenSpecialFromDesktopTab` click binding (`qa_deep_adversarial_verification.mjs:413`), and enforced `ONSITE` remark purity.

---

## Decision & Implementation
1. **[UIHelpers.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/core/UIHelpers.js)**:
   - Added `formatThaiShortDateFullYear(dateStr)` (4-digit B.E. year, e.g., `17 พ.ย. 2569`) and UTC-safe `shiftDateISO(dateStr, deltaDays)` (`Date.UTC`) for overnight shift `+1` day date calculation.
2. **[AttendanceModel.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/models/AttendanceModel.js)**:
   - Added `evaluateSplitAttendanceStatus(log, settings)` evaluating separate check-in (`normal` / `late` / `absent_duty` / `overtime` / `no_checkin`) and check-out (`normal` / `overtime` / `absent_duty` for early exit / unclosed `'รอลงเวลาออก'`) statuses with overnight shift support.
   - Updated `getPersonalAttendanceHistory(personnelId, userId, limit = 35)` and `getPersonalSpecialRequests(personnelId, userId)` to select `check_out_location` (plus `location_mode / offsite_reason` in primary query with `42703` & `PGRST204` fallback to base columns including `check_in_location, check_out_location`).
3. **[checkin.html](file:///f:/STB%20System/CheckinApp-UXUI/checkin.html) & [assets/css/bma-theme.css](file:///f:/STB%20System/CheckinApp-UXUI/assets/css/bma-theme.css)**:
   - **Mobile Cards vs Desktop Tables:** Changed `.bma-checkin-table-card` surface to `bg-slate-100/80 lg:bg-white dark:bg-slate-900/60 lg:dark:bg-slate-800`, wrapped `.bma-table-container` in `hidden lg:block`, added `lg:hidden space-y-3` containers (`#todayPersonalCardsContainer`, `#pastPersonalCardsContainer`, `#personalSpecialRequestsCardsContainer`), and hid `#btnOpenSpecialFromDesktopTab` below `lg` (`hidden lg:inline-flex`) without removing any DOM ID (`211` unique IDs, `0` removed vs `HEAD`, `30/30` `adr_004` intact).
   - **Drawer Head/Body & Spacing:** Replaced Head static title with user avatar badge, `#drawerUserFullName`, and `#drawerUserPosition`; removed the visible white Body profile capsule while retaining `#drawerUserRole` and `#drawerUserAffiliation` inside `<div class="hidden" aria-hidden="true">`; added `#mobileDrawerBodyScroll`, `#drawerSpecialQuickAction`, and `#drawerSpaShimmer`, plus scoped `#mobileDrawerHistoryMount .bma-checkin-table-card` margins in `bma-theme.css`.
4. **[CheckinController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/CheckinController.js)**:
   - Hydrated `#drawerUserPosition` via 4-arg `UIHelpers.formatPosition(p.position_title, p.position_level, p.position_type, p.position_full)` with role fallback.
   - Built XSS-escaped mobile card renderers (`#buildHistoryCardHtml`, `#buildSpecialRequestCardHtml`) using confirmed labels `'สถานะเข้างาน'` / `'สถานะออกงาน'`, WCAG AA dark/light Tailwind status classes (`#getStatusTextClass` mapping BMA colors `#00744B`, `#0971CE`, `#D97706`, `#EA580C`, `#E11D48`), `text-slate-500 dark:text-slate-400` field labels, overnight `+1 วัน` checkout shift, `ONSITE` remark purity (`locMode === 'OFFSITE'`), dual-container delete delegation, fixed history tab contrast (`bg-white text-[#00744B]`), and separated AJAX SPA drawer navigation (`#setDrawerActiveNav`, `#switchDrawerView` with `_drawerFetchSeq` concurrency guard).
5. **[docs/manual/manual-user.html](file:///f:/STB%20System/CheckinApp-UXUI/docs/manual/manual-user.html)**:
   - Updated Topics 3, 7, and 8 for the SPA drawer, mobile card presentation, and pagination choices `[5, 10, 15, 20, 30]`.

---

## Verification
- Audited by `subagent_02_qa_auditor` (`gemini-4-hydrogen-high`) & verified post-edit (`buildId: 20261118_069d6bc8`):
  - `node --check` on modified JS/MJS: **4/4 PASS**
  - `qa_mobile_cards_drawer_spa_test.mjs`: **12/12 PASS**
  - `qa_test.mjs` (`PIPE-20261027`): **ALL PASSED**
  - `qa_post_implementation_test.mjs` (`PIPE-20261113`): **29/29 PASS**
  - `qa_deep_adversarial_verification.mjs` (`PIPE-20261113`): **ALL PASSED**
  - `qa_loca_v2_verification.mjs` (`PIPE-20261104`): **25/25 PASS**
  - `qa_fix_mobile_logout_session_camera.mjs` (`PIPE-20261116`): **26/30 PASS** (`#15` DOM ID invariance / `adr_004` PASS; 4 failures `#06/#07/#17/#30` are pre-existing baseline shifts from `PIPE-20261117`).
- Cache Version Sync verified across `version.json` and all 9 root HTML pages (`20261118_069d6bc8`).
