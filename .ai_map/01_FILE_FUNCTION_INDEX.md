# สารบัญไฟล์และฟังก์ชันของโปรเจกต์ (VS Code Automated File & Function Index)

- **อัปเดตล่าสุด (Last Indexed):** `2026-11-10T10:54:05.569Z`
- **จำนวนไฟล์ที่สแกนทั้งหมด (Total Files):** `127` | **จำนวนฟังก์ชัน/สัญลักษณ์ทั้งหมด (Total Symbols):** `741`
- **กฎการใช้งานสำหรับ AI (Token-Saving Rule):** ห้ามอ่านไฟล์ทั้งหมด ให้ดูช่วงบรรทัด `L_start - L_end` ในตารางด้านล่าง แล้วดึงเฉพาะช่วงบรรทัดที่ต้องการใช้งานเท่านั้น

---

## File: `approvals.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `e5c30100c25a7bee` | **Total Lines:** `214` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L107** | `<head>` | HTML DOM Section L3-L107 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L111 - L111** | `id="bmaSidebarContainer"` | HTML DOM Section L111-L111 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L115 - L115** | `id="bmaTopbarContainer"` | HTML DOM Section L115-L115 |
| `<main>` | `html_dom_section` | **L117 - L205** | `<main>` | HTML DOM Section L117-L205 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L207 - L207** | `id="bmaFooterContainer"` | HTML DOM Section L207-L207 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L212 - L212** | `<script>` | Bootstrap script L212-L212 |

---

## File: `assets/js/components/AppLayout.js`
- **Layer:** Shared UI Component Layer
- **Hash:** `9006441bf7bee2bf` | **Total Lines:** `992` | **Imports:** `7` | **Exports:** `AppLayout`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `AppLayout` | `class` | **L14 - L992** | `export class AppLayout` | Class Definition (979 lines) |
| `AppLayout.canViewUsersMenu` | `static public method` | **L64 - L71** | `(user) => any` | static public method L64-L71 (8 lines) |
| `AppLayout.initAdminLayout` | `static public async method` | **L73 - L132** | `({ activePage, pageTitle, pageSubtitle = '' }) => Promise<any>` | static public async method L73-L132 (60 lines) |
| `AppLayout.checkAndShowWelcomeToast` | `static public method` | **L134 - L143** | `(currentUser) => any` | static public method L134-L143 (10 lines) |
| `AppLayout.#updateActiveNavState` | `static private method` | **L145 - L181** | `(activePage, pageTitle, pageSubtitle) => any` | static private method L145-L181 (37 lines) |
| `AppLayout.renderMainSkeleton` | `static public method` | **L187 - L225** | `() => any` | static public method L187-L225 (39 lines) |
| `AppLayout.navigateAjaxPage` | `static public async method` | **L233 - L349** | `(targetFile, pushHistory = true) => Promise<any>` | static public async method L233-L349 (117 lines) |
| `AppLayout.#renderSidebar` | `static private method` | **L351 - L458** | `(currentUser, settings, activePage) => any` | static private method L351-L458 (108 lines) |
| `AppLayout.#renderTopbar` | `static private method` | **L460 - L516** | `(currentUser, settings, pageTitle, pageSubtitle) => any` | static private method L460-L516 (57 lines) |
| `AppLayout.#renderMobileBottomNav` | `static private method` | **L518 - L544** | `(currentUser, activePage) => any` | static private method L518-L544 (27 lines) |
| `AppLayout.getMobileShortcutGridHtml` | `static public method` | **L546 - L576** | `(currentUser) => any` | static public method L546-L576 (31 lines) |
| `AppLayout.#renderFooter` | `static private method` | **L578 - L597** | `(settings) => any` | static private method L578-L597 (20 lines) |
| `AppLayout.refreshNotificationBell` | `static public async method` | **L599 - L761** | `(currentUser) => Promise<any>` | static public async method L599-L761 (163 lines) |
| `AppLayout.initAdminRealtimeSync` | `static public method` | **L763 - L876** | `(currentUser) => any` | static public method L763-L876 (114 lines) |
| `AppLayout.#bindGlobalDelegatedEvents` | `static private method` | **L878 - L991** | `() => any` | static private method L878-L991 (114 lines) |

---

## File: `assets/js/controllers/ApprovalsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `63bfe5af8592fbd7` | **Total Lines:** `370` | **Imports:** `4` | **Exports:** `ApprovalsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ApprovalsController` | `class` | **L11 - L366** | `export class ApprovalsController` | Class Definition (356 lines) |
| `ApprovalsController.constructor` | `public constructor` | **L12 - L18** | `() => any` | public constructor L12-L18 (7 lines) |
| `ApprovalsController.init` | `public async method` | **L20 - L32** | `() => Promise<any>` | public async method L20-L32 (13 lines) |
| `ApprovalsController.loadRequests` | `public async method` | **L34 - L51** | `() => Promise<any>` | public async method L34-L51 (18 lines) |
| `ApprovalsController.#updateBulkSelectionCount` | `private method` | **L53 - L63** | `() => any` | private method L53-L63 (11 lines) |
| `ApprovalsController.#renderGroupedApprovalsTable` | `private method` | **L70 - L134** | `() => any` | - 'group': สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน |
| `ApprovalsController.#buildRequestRowHtml` | `private method` | **L136 - L203** | `(req, indexNo) => any` | private method L136-L203 (68 lines) |
| `ApprovalsController.syncRequestsSilent` | `public async method` | **L205 - L266** | `(deltaDetail = null) => Promise<any>` | public async method L205-L266 (62 lines) |
| `ApprovalsController.#bindEvents` | `private method` | **L268 - L331** | `() => any` | private method L268-L331 (64 lines) |
| `ApprovalsController.#processDecision` | `private async method` | **L333 - L365** | `(ids, decision) => Promise<any>` | private async method L333-L365 (33 lines) |

---

## File: `assets/js/controllers/CheckinController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `cc46b35a4d4c6ea7` | **Total Lines:** `3524` | **Imports:** `6` | **Exports:** `CheckinController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `CheckinController` | `class` | **L13 - L851** | `export class CheckinController` | Class Definition (839 lines) |
| `CheckinController.constructor` | `public constructor` | **L14 - L66** | `() => any` | public constructor L14-L66 (53 lines) |
| `CheckinController.init` | `public async method` | **L68 - L120** | `() => Promise<any>` | public async method L68-L120 (53 lines) |
| `CheckinController.#initRealtimeSettingsListener` | `private method` | **L122 - L184** | `() => any` | private method L122-L184 (63 lines) |
| `triggerDebouncedPersonalSync` | `arrow_fn` | **L129 - L137** | `(payload) => inferred` | Arrow Function L129-L137 |
| `CheckinController.#syncPersonalAttendanceSilent` | `private async method` | **L186 - L192** | `() => Promise<any>` | private async method L186-L192 (7 lines) |
| `CheckinController.#syncSettingsHotReload` | `private async method` | **L194 - L202** | `() => Promise<any>` | private async method L194-L202 (9 lines) |
| `CheckinController.#applySettingsHotReload` | `private method` | **L204 - L226** | `(newSettings) => any` | private method L204-L226 (23 lines) |
| `CheckinController.#applyDynamicWorkspaceLayout` | `private method` | **L228 - L259** | `() => any` | private method L228-L259 (32 lines) |
| `CheckinController.#updateThemeButtonUI` | `private method` | **L261 - L279** | `() => any` | private method L261-L279 (19 lines) |
| `CheckinController.#checkAndShowWelcomeToast` | `private method` | **L281 - L289** | `() => any` | private method L281-L289 (9 lines) |
| `CheckinController.#startLiveClock24` | `private method` | **L291 - L318** | `() => any` | private method L291-L318 (28 lines) |
| `updateClock` | `arrow_fn` | **L292 - L315** | `() => inferred` | Arrow Function L292-L315 |
| `CheckinController.#isShiftAlreadyRecordedToday` | `private method` | **L320 - L368** | `(shift) => any` | private method L320-L368 (49 lines) |
| `CheckinController.#isShiftActiveAtCurrentTime` | `private method` | **L370 - L405** | `(shift, nowMin, allowStartMin) => any` | private method L370-L405 (36 lines) |
| `CheckinController.#evaluateTimeWindowAndPopulateShifts` | `private method` | **L407 - L511** | `() => any` | private method L407-L511 (105 lines) |
| `CheckinController.#calculateHaversineMeters` | `private method` | **L516 - L528** | `(lat1, lon1, lat2, lon2) => any` | คำนวณระยะทางแบบ Haversine (หน่วย: เมตร) |
| `CheckinController.evaluateOnsiteGeofence` | `public method` | **L536 - L617** | `(currentLat, currentLng) => any` | public method L536-L617 (82 lines) |
| `CheckinController.#renderGeofenceStatusUI` | `private method` | **L619 - L689** | `() => any` | private method L619-L689 (71 lines) |
| `CheckinController.#initLocaV2ModeAndChips` | `private method` | **L691 - L693** | `() => any` | private method L691-L693 (3 lines) |
| `CheckinController.#initModeSwitcher` | `private method` | **L695 - L793** | `() => any` | private method L695-L793 (99 lines) |
| `setActiveOffsiteGps` | `arrow_fn` | **L702 - L711** | `(source) => inferred` | Arrow Function L702-L711 |
| `CheckinController.#initViewGpsMapModal` | `private method` | **L795 - L802** | `() => any` | private method L795-L802 (8 lines) |
| `CheckinController.#openViewGpsMapModal` | `private method` | **L804 - L850** | `() => any` | private method L804-L850 (47 lines) |
| `#goToStep` | `private method` | **L853 - L918** | `(step) => any` | private method L853-L918 (66 lines) |
| `#updateStep1Validation` | `private method` | **L920 - L955** | `() => any` | private method L920-L955 (36 lines) |
| `#openOffsiteMapModal` | `private method` | **L957 - L1018** | `() => any` | private method L957-L1018 (62 lines) |
| `#updateOffsiteModalMarker` | `private async method` | **L1021 - L1057** | `(lat, lng, explicitName = null) => Promise<any>` | private async method L1021-L1057 (37 lines) |
| `#initOffsiteModalGps` | `private method` | **L1059 - L1160** | `() => any` | private method L1059-L1160 (102 lines) |
| `closeModal` | `arrow_fn` | **L1068 - L1074** | `() => inferred` | Arrow Function L1068-L1074 |
| `performSearch` | `async_arrow_fn` | **L1119 - L1159** | `() => inferred` | Arrow Function L1119-L1159 |
| `#renderUserAndSettingsInfo` | `private method` | **L1173 - L1262** | `() => any` | private method L1173-L1262 (90 lines) |
| `setElText` | `arrow_fn` | **L1178 - L1181** | `(id, text) => inferred` | Arrow Function L1178-L1181 |
| `#refreshAllAttendanceData` | `private async method` | **L1264 - L1281** | `() => Promise<any>` | private async method L1264-L1281 (18 lines) |
| `#updateStatusCardsAndMainButton` | `private method` | **L1283 - L1550** | `() => any` | private method L1283-L1550 (268 lines) |
| `setShiftCardVisibility` | `arrow_fn` | **L1310 - L1319** | `(visible) => inferred` | Arrow Function L1310-L1319 |
| `#renderPersonalAttendanceTabs` | `private method` | **L1552 - L1595** | `() => any` | private method L1552-L1595 (44 lines) |
| `#buildHistoryRowHtml` | `private method` | **L1597 - L1616** | `(item, rowNumber) => any` | private method L1597-L1616 (20 lines) |
| `#renderSpecialRequestsHistoryTable` | `private method` | **L1618 - L1660** | `() => any` | private method L1618-L1660 (43 lines) |
| `#openFullscreenCamera` | `private async method` | **L1662 - L1708** | `() => Promise<any>` | private async method L1662-L1708 (47 lines) |
| `#captureAndCloseCamera` | `private method` | **L1710 - L1741** | `() => any` | private method L1710-L1741 (32 lines) |
| `#closeFullscreenCamera` | `private method` | **L1743 - L1746** | `() => any` | private method L1743-L1746 (4 lines) |
| `#checkCameraHardware` | `private async method` | **L1748 - L1762** | `() => Promise<any>` | private async method L1748-L1762 (15 lines) |
| `#handleFallbackFileSelected` | `private method` | **L1764 - L1828** | `(file) => any` | private method L1764-L1828 (65 lines) |
| `#stopCameraHardwareStream` | `private method` | **L1830 - L1841** | `() => any` | private method L1830-L1841 (12 lines) |
| `#stopCameraAndShowStandby` | `private method` | **L1843 - L1869** | `() => any` | private method L1843-L1869 (27 lines) |
| `#openCameraOnDemand` | `private async method` | **L1871 - L1940** | `() => Promise<any>` | private async method L1871-L1940 (70 lines) |
| `#capturePhotoAndStopStream` | `private method` | **L1942 - L1974** | `() => any` | private method L1942-L1974 (33 lines) |
| `#resetPageAfterSave` | `private async method` | **L1976 - L1991** | `() => Promise<any>` | private async method L1976-L1991 (16 lines) |
| `#initGpsLocation` | `private async method` | **L1999 - L2096** | `() => Promise<any>` | 3. หากยังไม่พบ จะดึง ซอย / ซอยย่อย -> แสดง ["ใกล้เคียง " + ชื่อซอย] |
| `#renderInlineGpsMap` | `private method` | **L2098 - L2164** | `(lat, lng) => any` | private method L2098-L2164 (67 lines) |
| `#bindEvents` | `private method` | **L2167 - L2464** | `() => any` | private method L2167-L2464 (298 lines) |
| `openSpecialModal` | `arrow_fn` | **L2330 - L2333** | `() => inferred` | Arrow Function L2330-L2333 |
| `setDesktopActiveTab` | `arrow_fn` | **L2368 - L2387** | `(activeName) => inferred` | Arrow Function L2368-L2387 |
| `openMobileDrawer` | `arrow_fn` | **L2398 - L2416** | `() => inferred` | Arrow Function L2398-L2416 |
| `closeMobileDrawer` | `arrow_fn` | **L2418 - L2445** | `(targetTab = null) => inferred` | Arrow Function L2418-L2445 |
| `#handleMainCheckin` | `private async method` | **L2466 - L2864** | `() => Promise<any>` | private async method L2466-L2864 (399 lines) |
| `#openSpecialRequestModal` | `private method` | **L2866 - L2896** | `() => any` | private method L2866-L2896 (31 lines) |
| `#initSpecialModalGps` | `private method` | **L2898 - L3001** | `() => any` | private method L2898-L3001 (104 lines) |
| `updateCustomPinAndLocation` | `async_arrow_fn` | **L2910 - L2958** | `(lat, lng, flyTo = false, explicitName = null) => inferred` | Arrow Function L2910-L2958 |
| `setupMapIfAvailable` | `arrow_fn` | **L2960 - L2995** | `() => inferred` | Arrow Function L2960-L2995 |
| `getDistanceInMeters` | `arrow_fn` | **L3020 - L3039** | `(lat1, lon1, lat2, lon2) => inferred` | Arrow Function L3020-L3039 |
| `calculateDistance` | `arrow_fn` | **L3041 - L3050** | `(lat1, lon1, lat2, lon2) => inferred` | Arrow Function L3041-L3050 |
| `getCategoryLabel` | `arrow_fn` | **L3052 - L3091** | `(item) => inferred` | Arrow Function L3052-L3091 |
| `escapeHtml` | `arrow_fn` | **L3093 - L3101** | `(str) => inferred` | Arrow Function L3093-L3101 |
| `formatSubAddress` | `arrow_fn` | **L3103 - L3119** | `(item) => inferred` | Arrow Function L3103-L3119 |
| `getMainName` | `arrow_fn` | **L3121 - L3129** | `(item) => inferred` | Arrow Function L3121-L3129 |
| `hideSearchResults` | `arrow_fn` | **L3131 - L3136** | `() => inferred` | Arrow Function L3131-L3136 |
| `bindResultItemClicks` | `arrow_fn` | **L3138 - L3154** | `() => inferred` | Arrow Function L3138-L3154 |
| `renderCoordsResult` | `arrow_fn` | **L3156 - L3180** | `(lat, lng) => inferred` | Arrow Function L3156-L3180 |
| `renderPlaceResults` | `arrow_fn` | **L3182 - L3227** | `(items) => inferred` | Arrow Function L3182-L3227 |
| `performSearch` | `async_arrow_fn` | **L3232 - L3404** | `() => inferred` | Arrow Function L3232-L3404 |
| `#handleSubmitSpecialRequest` | `private async method` | **L3444 - L3519** | `(closeModalCallback) => Promise<any>` | private async method L3444-L3519 (76 lines) |

---

## File: `assets/js/controllers/DashboardController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `6442f09d14021a81` | **Total Lines:** `455` | **Imports:** `6` | **Exports:** `DashboardController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `DashboardController` | `class` | **L13 - L446** | `export class DashboardController` | Class Definition (434 lines) |
| `DashboardController.constructor` | `public constructor` | **L14 - L23** | `() => any` | public constructor L14-L23 (10 lines) |
| `DashboardController.init` | `public async method` | **L25 - L50** | `() => Promise<any>` | public async method L25-L50 (26 lines) |
| `DashboardController.#bindEvents` | `private method` | **L52 - L110** | `() => any` | private method L52-L110 (59 lines) |
| `triggerDebouncedSync` | `arrow_fn` | **L53 - L58** | `() => inferred` | Arrow Function L53-L58 |
| `DashboardController.loadDashboardData` | `public async method` | **L112 - L175** | `(silent = false) => Promise<any>` | public async method L112-L175 (64 lines) |
| `DashboardController.#updateKpiMetricsDifferentially` | `private method` | **L177 - L207** | `(oldMetrics, newMetrics) => any` | private method L177-L207 (31 lines) |
| `DashboardController.#syncRecentTableDifferentially` | `private method` | **L209 - L293** | `(colors) => any` | private method L209-L293 (85 lines) |
| `DashboardController.#renderAllVisuals` | `private method` | **L295 - L310** | `() => any` | private method L295-L310 (16 lines) |
| `DashboardController.#renderJewelToneStatCards` | `private method` | **L312 - L381** | `(metrics, colors) => any` | private method L312-L381 (70 lines) |
| `DashboardController.#buildDashboardRowHtml` | `private method` | **L383 - L405** | `(rec, runningNo, colors) => any` | private method L383-L405 (23 lines) |
| `DashboardController.#renderTable` | `private method` | **L407 - L445** | `(colors) => any` | private method L407-L445 (39 lines) |

---

## File: `assets/js/controllers/LoginController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `f440671fee411685` | **Total Lines:** `303` | **Imports:** `4` | **Exports:** `LoginController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `LoginController` | `class` | **L11 - L299** | `export class LoginController` | Class Definition (289 lines) |
| `LoginController.constructor` | `public constructor` | **L12 - L15** | `() => any` | public constructor L12-L15 (4 lines) |
| `LoginController.init` | `public async method` | **L17 - L33** | `() => Promise<any>` | public async method L17-L33 (17 lines) |
| `LoginController.#loadOrganizationBranding` | `private async method` | **L35 - L69** | `() => Promise<any>` | private async method L35-L69 (35 lines) |
| `LoginController.#updateThemeButtonUI` | `private method` | **L71 - L81** | `() => any` | private method L71-L81 (11 lines) |
| `LoginController.#bindEvents` | `private method` | **L83 - L188** | `() => any` | private method L83-L188 (106 lines) |
| `openChangeModal` | `arrow_fn` | **L124 - L133** | `() => inferred` | Arrow Function L124-L133 |
| `validatePasswordMatch` | `arrow_fn` | **L140 - L162** | `() => inferred` | Arrow Function L140-L162 |
| `openForgotModal` | `arrow_fn` | **L173 - L177** | `() => inferred` | Arrow Function L173-L177 |
| `LoginController.#handleLogin` | `private async method` | **L190 - L212** | `(mode) => Promise<any>` | private async method L190-L212 (23 lines) |
| `LoginController.#loadRememberedUser` | `private method` | **L214 - L234** | `() => any` | private method L214-L234 (21 lines) |
| `LoginController.#persistRememberedUser` | `private method` | **L236 - L251** | `(username) => any` | private method L236-L251 (16 lines) |
| `LoginController.#handleChangePasswordSubmit` | `private async method` | **L253 - L277** | `(closeModalCallback) => Promise<any>` | private async method L253-L277 (25 lines) |
| `LoginController.#handleForgotPasswordSubmit` | `private async method` | **L279 - L298** | `(closeModalCallback) => Promise<any>` | private async method L279-L298 (20 lines) |

---

## File: `assets/js/controllers/PersonnelController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `e5b43f595b7cfa05` | **Total Lines:** `1671` | **Imports:** `5` | **Exports:** `PersonnelController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `PersonnelController` | `class` | **L12 - L1662** | `export class PersonnelController` | Class Definition (1651 lines) |
| `PersonnelController.constructor` | `public constructor` | **L13 - L30** | `() => any` | public constructor L13-L30 (18 lines) |
| `PersonnelController.init` | `public async method` | **L32 - L56** | `() => Promise<any>` | public async method L32-L56 (25 lines) |
| `PersonnelController.#initHierarchicalOrgFilter` | `private method` | **L58 - L87** | `() => any` | private method L58-L87 (30 lines) |
| `PersonnelController.#populateHierarchicalOrgFilter` | `private method` | **L89 - L106** | `() => any` | private method L89-L106 (18 lines) |
| `PersonnelController.#updateFilterDivisionOptions` | `private method` | **L108 - L140** | `() => any` | private method L108-L140 (33 lines) |
| `PersonnelController.#updateFilterWorkGroupOptions` | `private method` | **L142 - L172** | `() => any` | private method L142-L172 (31 lines) |
| `PersonnelController.#populateDropdownsFromSettings` | `private method` | **L174 - L203** | `() => any` | private method L174-L203 (30 lines) |
| `PersonnelController.#updatePositionSubDropdowns` | `private method` | **L205 - L223** | `(selectedType, selectedTitle = '', selectedLevel = '') => any` | private method L205-L223 (19 lines) |
| `PersonnelController.#updateAffiliationSubDropdowns` | `private method` | **L225 - L249** | `(selectedBureau, selectedDivision = '', selectedGroup = '') => any` | private method L225-L249 (25 lines) |
| `PersonnelController.loadPersonnelData` | `public async method` | **L251 - L265** | `() => Promise<any>` | public async method L251-L265 (15 lines) |
| `PersonnelController.#renderGroupedTable` | `private method` | **L267 - L331** | `() => any` | private method L267-L331 (65 lines) |
| `PersonnelController.#buildPersonRowHtml` | `private method` | **L333 - L389** | `(person, indexNo) => any` | private method L333-L389 (57 lines) |
| `PersonnelController.#openModal` | `private method` | **L391 - L432** | `(editPerson = null) => any` | private method L391-L432 (42 lines) |
| `PersonnelController.#closeModal` | `private method` | **L434 - L438** | `() => any` | private method L434-L438 (5 lines) |
| `PersonnelController.syncPersonnelSilent` | `public async method` | **L440 - L480** | `(deltaDetail = null) => Promise<any>` | public async method L440-L480 (41 lines) |
| `PersonnelController.#bindEvents` | `private method` | **L482 - L760** | `() => any` | private method L482-L760 (279 lines) |
| `validateNationalIdInput` | `arrow_fn` | **L522 - L545** | `() => inferred` | Arrow Function L522-L545 |
| `PersonnelController.#openPersonnelResumeModal` | `private method` | **L766 - L895** | `(person) => any` | private method L766-L895 (130 lines) |
| `PersonnelController.#closePersonnelResumeModal` | `private method` | **L897 - L900** | `() => any` | private method L897-L900 (4 lines) |
| `PersonnelController.#handleSavePersonnel` | `private async method` | **L902 - L939** | `() => Promise<any>` | private async method L902-L939 (38 lines) |
| `PersonnelController.#handleQuickCreateAccount` | `private async method` | **L941 - L1002** | `(personId) => Promise<any>` | private async method L941-L1002 (62 lines) |
| `PersonnelController.#diceCoefficient` | `private method` | **L1004 - L1024** | `(str1, str2) => any` | private method L1004-L1024 (21 lines) |
| `PersonnelController.#findBestFuzzyMatch` | `private method` | **L1026 - L1042** | `(value, candidates, threshold = 0.5) => any` | private method L1026-L1042 (17 lines) |
| `PersonnelController.#openBulkImportModal` | `private method` | **L1044 - L1078** | `(initialFile = null) => any` | private method L1044-L1078 (35 lines) |
| `PersonnelController.#closeBulkImportModal` | `private method` | **L1080 - L1088** | `() => any` | private method L1080-L1088 (9 lines) |
| `PersonnelController.#processBulkImportFile` | `private async method` | **L1090 - L1164** | `(file) => Promise<any>` | private async method L1090-L1164 (75 lines) |
| `PersonnelController.#validateRowCascading` | `private method` | **L1171 - L1462** | `(row, changedField = null) => any` | private method L1171-L1462 (292 lines) |
| `PersonnelController.#revalidateRowCascading` | `private method` | **L1469 - L1475** | `(rIdx, changedField = null) => any` | private method L1469-L1475 (7 lines) |
| `PersonnelController.#renderBulkImportPreview` | `private method` | **L1477 - L1551** | `() => any` | private method L1477-L1551 (75 lines) |
| `renderCell` | `arrow_fn` | **L1500 - L1512** | `(field, cell) => inferred` | Arrow Function L1500-L1512 |
| `PersonnelController.#handleExecuteBulkImport` | `private async method` | **L1553 - L1641** | `() => Promise<any>` | private async method L1553-L1641 (89 lines) |
| `PersonnelController.#downloadMultiSheetTemplate` | `private async method` | **L1646 - L1661** | `() => Promise<any>` | ดาวน์โหลดไฟล์แม่แบบ Excel แบบหลายแผ่นงาน พร้อม Data Validation Dropdowns ด้วย ExcelJS |

---

## File: `assets/js/controllers/ReportsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `2325c302f40a19fc` | **Total Lines:** `1371` | **Imports:** `8` | **Exports:** `ReportsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ReportsController` | `class` | **L15 - L1362** | `export class ReportsController` | Class Definition (1348 lines) |
| `ReportsController.constructor` | `public constructor` | **L16 - L30** | `() => any` | public constructor L16-L30 (15 lines) |
| `ReportsController.init` | `public async method` | **L32 - L73** | `() => Promise<any>` | public async method L32-L73 (42 lines) |
| `ReportsController.#initHierarchicalOrgFilter` | `private method` | **L75 - L110** | `() => any` | private method L75-L110 (36 lines) |
| `ReportsController.#getStatusColor` | `private method` | **L112 - L118** | `(statusKey) => any` | private method L112-L118 (7 lines) |
| `ReportsController.#renderStatusTagFilterChips` | `private method` | **L120 - L143** | `() => any` | private method L120-L143 (24 lines) |
| `ReportsController.#getFormattedReportDateSubtitle` | `private method` | **L145 - L154** | `() => any` | private method L145-L154 (10 lines) |
| `ReportsController.loadReportData` | `public async method` | **L156 - L203** | `() => Promise<any>` | public async method L156-L203 (48 lines) |
| `ReportsController.#populatePersonnelDropdown` | `private method` | **L205 - L214** | `() => any` | private method L205-L214 (10 lines) |
| `ReportsController.#populateHierarchicalOrgFilter` | `private method` | **L216 - L239** | `() => any` | private method L216-L239 (24 lines) |
| `ReportsController.#updateDivisionOptions` | `private method` | **L241 - L276** | `() => any` | private method L241-L276 (36 lines) |
| `ReportsController.#updateWorkGroupOptions` | `private method` | **L278 - L314** | `() => any` | private method L278-L314 (37 lines) |
| `ReportsController.#getFilteredRecords` | `private method` | **L316 - L328** | `() => any` | private method L316-L328 (13 lines) |
| `ReportsController.#formatGpsCoordinates` | `private method` | **L330 - L338** | `(lat, lng) => any` | private method L330-L338 (9 lines) |
| `ReportsController.#renderSeparateTablesBySelectedTags` | `private method` | **L340 - L408** | `(forPrintPdf = false) => any` | private method L340-L408 (69 lines) |
| `ReportsController.#renderSingleStatusTableHtml` | `private method` | **L410 - L538** | `(statusMeta, statusColor, tagRecords, daySubtitle, groupHeaderColor, forPrintPdf) => any` | private method L410-L538 (129 lines) |
| `ReportsController.#buildGroupedRowsForTag` | `private method` | **L540 - L592** | `(tagRecords, groupHeaderColor, forPrintPdf) => any` | private method L540-L592 (53 lines) |
| `ReportsController.#buildSingleRowHtml` | `private method` | **L594 - L693** | `(rec, indexNo, forPrintPdf) => any` | private method L594-L693 (100 lines) |
| `ReportsController.#openResumeProfileForSpecificRow` | `private method` | **L702 - L906** | `(rowUid) => any` | private method L702-L906 (205 lines) |
| `setupPhotoBox` | `arrow_fn` | **L771 - L814** | `(boxId, linkId, photo, fallbackMsg, isOut = false) => inferred` | Arrow Function L771-L814 |
| `setupGpsAndMap` | `arrow_fn` | **L853 - L883** | `(coordsId, linkId, iframeId, placeholderId, locNameId, lat, lng, locName, fallbackMsg) => inferred` | Arrow Function L853-L883 |
| `ReportsController.#closeResumeModal` | `private method` | **L908 - L918** | `() => any` | private method L908-L918 (11 lines) |
| `ReportsController.#openModal` | `private method` | **L920 - L952** | `(rec = null) => any` | private method L920-L952 (33 lines) |
| `ReportsController.#closeModal` | `private method` | **L954 - L956** | `() => any` | private method L954-L956 (3 lines) |
| `ReportsController.syncReportsSilent` | `public async method` | **L958 - L1095** | `(deltaDetail = null) => Promise<any>` | public async method L958-L1095 (138 lines) |
| `ReportsController.#bindEvents` | `private method` | **L1097 - L1321** | `() => any` | private method L1097-L1321 (225 lines) |
| `triggerDebouncedReportSync` | `arrow_fn` | **L1098 - L1103** | `(detail) => inferred` | Arrow Function L1098-L1103 |
| `ReportsController.#handleSaveReportRecord` | `private async method` | **L1323 - L1361** | `() => Promise<any>` | private async method L1323-L1361 (39 lines) |

---

## File: `assets/js/controllers/SettingsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `101345b0f959654a` | **Total Lines:** `1491` | **Imports:** `4` | **Exports:** `SettingsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SettingsController` | `class` | **L11 - L1482** | `export class SettingsController` | Class Definition (1472 lines) |
| `SettingsController.constructor` | `public constructor` | **L12 - L17** | `() => any` | public constructor L12-L17 (6 lines) |
| `SettingsController.init` | `public async method` | **L19 - L37** | `() => Promise<any>` | public async method L19-L37 (19 lines) |
| `SettingsController.#renderAllSettings` | `private method` | **L39 - L170** | `() => any` | private method L39-L170 (132 lines) |
| `syncEarlyWindowVisibility` | `arrow_fn` | **L92 - L102** | `() => inferred` | Arrow Function L92-L102 |
| `syncRadiusVisibility` | `arrow_fn` | **L120 - L130** | `() => inferred` | Arrow Function L120-L130 |
| `SettingsController.#updateColorPreviewBadges` | `private method` | **L172 - L188** | `() => any` | private method L172-L188 (17 lines) |
| `SettingsController.#syncCheckinModeUI` | `private method` | **L193 - L224** | `(isSingleClick) => any` | ย่อข้อความป้าย Tag ให้เหลือแค่ "รูปแบบพิเศษ" หรือ "รูปแบบปกติ" เพื่อไม่ให้ล้นจอหรือเบียดข้อความในมือถือ |
| `SettingsController.#updateLogoPreview` | `private method` | **L226 - L234** | `(url) => any` | private method L226-L234 (9 lines) |
| `SettingsController.#buildSortButtonsHtml` | `private method` | **L236 - L249** | `(category, index, totalLength) => any` | private method L236-L249 (14 lines) |
| `SettingsController.#renderPrefixes` | `private method` | **L251 - L271** | `() => any` | private method L251-L271 (21 lines) |
| `SettingsController.#renderRemarks` | `private method` | **L273 - L293** | `() => any` | private method L273-L293 (21 lines) |
| `SettingsController.#renderShifts` | `private method` | **L295 - L347** | `() => any` | private method L295-L347 (53 lines) |
| `SettingsController.#renderPositions` | `private method` | **L349 - L370** | `() => any` | private method L349-L370 (22 lines) |
| `SettingsController.#renderAffiliations` | `private method` | **L372 - L394** | `() => any` | private method L372-L394 (23 lines) |
| `SettingsController.#renderOfficialLocations` | `private method` | **L396 - L460** | `() => any` | private method L396-L460 (65 lines) |
| `SettingsController.#openOfficialLocationModal` | `private method` | **L462 - L609** | `(editIndex = null) => any` | private method L462-L609 (148 lines) |
| `updateMapLink` | `arrow_fn` | **L601 - L606** | `() => inferred` | Arrow Function L601-L606 |
| `SettingsController.#collectMainAndColorFieldsIntoSettings` | `private method` | **L611 - L661** | `() => any` | private method L611-L661 (51 lines) |
| `SettingsController.#persistSettings` | `private async method` | **L663 - L686** | `(showToastAlert = true) => Promise<any>` | private async method L663-L686 (24 lines) |
| `SettingsController.#openModal` | `private method` | **L688 - L693** | `(title, bodyHtml, onSubmitCallback) => any` | private method L688-L693 (6 lines) |
| `SettingsController.#closeModal` | `private method` | **L695 - L698** | `() => any` | private method L695-L698 (4 lines) |
| `SettingsController.#buildMultiRowInputsHtml` | `private method` | **L700 - L719** | `(fieldLabel, placeholder) => any` | private method L700-L719 (20 lines) |
| `SettingsController.#bindDynamicMultiRowEvents` | `private method` | **L721 - L749** | `(placeholder = 'ระบุข้อมูล...') => any` | private method L721-L749 (29 lines) |
| `SettingsController.#getDynamicMultiRowValues` | `private method` | **L751 - L756** | `() => any` | private method L751-L756 (6 lines) |
| `SettingsController.#bindEvents` | `private method` | **L758 - L1002** | `() => any` | private method L758-L1002 (245 lines) |
| `SettingsController.#openShiftModal` | `private method` | **L1004 - L1095** | `(editIndex = null) => any` | private method L1004-L1095 (92 lines) |
| `checkOvernightAuto` | `arrow_fn` | **L1085 - L1092** | `() => inferred` | Arrow Function L1085-L1092 |
| `SettingsController.#openAddPositionStep1Modal` | `private method` | **L1097 - L1113** | `() => any` | private method L1097-L1113 (17 lines) |
| `SettingsController.#openAddPositionStep2Modal` | `private method` | **L1115 - L1158** | `() => any` | private method L1115-L1158 (44 lines) |
| `SettingsController.#openAddPositionStep3Modal` | `private method` | **L1160 - L1224** | `() => any` | private method L1160-L1224 (65 lines) |
| `SettingsController.#openEditSinglePositionModal` | `private method` | **L1226 - L1249** | `(editIndex) => any` | private method L1226-L1249 (24 lines) |
| `SettingsController.#openAddAffiliationStep1OrgModal` | `private method` | **L1251 - L1267** | `() => any` | private method L1251-L1267 (17 lines) |
| `SettingsController.#openAddAffiliationStep2BureauModal` | `private method` | **L1269 - L1307** | `() => any` | private method L1269-L1307 (39 lines) |
| `SettingsController.#openAddAffiliationStep3DivisionModal` | `private method` | **L1309 - L1365** | `() => any` | private method L1309-L1365 (57 lines) |
| `SettingsController.#openAddAffiliationStep4GroupModal` | `private method` | **L1367 - L1451** | `() => any` | private method L1367-L1451 (85 lines) |
| `SettingsController.#openEditSingleAffiliationModal` | `private method` | **L1453 - L1481** | `(editIndex) => any` | private method L1453-L1481 (29 lines) |

---

## File: `assets/js/controllers/UsersController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `dda0161a13ef00d7` | **Total Lines:** `841` | **Imports:** `6` | **Exports:** `UsersController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `UsersController` | `class` | **L13 - L832** | `export class UsersController` | Class Definition (820 lines) |
| `UsersController.constructor` | `public constructor` | **L14 - L30** | `() => any` | public constructor L14-L30 (17 lines) |
| `UsersController.init` | `public async method` | **L32 - L69** | `() => Promise<any>` | public async method L32-L69 (38 lines) |
| `UsersController.#initHierarchicalOrgFilter` | `private method` | **L71 - L103** | `() => any` | private method L71-L103 (33 lines) |
| `UsersController.#populateHierarchicalOrgFilter` | `private method` | **L105 - L126** | `() => any` | private method L105-L126 (22 lines) |
| `UsersController.#updateDivisionOptions` | `private method` | **L128 - L166** | `() => any` | private method L128-L166 (39 lines) |
| `UsersController.#updateWorkGroupOptions` | `private method` | **L168 - L210** | `() => any` | private method L168-L210 (43 lines) |
| `UsersController.#toggleManageColumnHeader` | `private method` | **L215 - L223** | `() => any` | ซ่อนหรือแสดงหัวคอลัมน์ "จัดการ" ในตารางตามสิทธิ์ของผู้ใช้งาน (index 5) |
| `UsersController.#populateScopeDropdowns` | `private method` | **L225 - L236** | `() => any` | private method L225-L236 (12 lines) |
| `UsersController.#updateScopeDivisionDropdown` | `private method` | **L238 - L251** | `(selectedBureau, selectedDivision = '') => any` | private method L238-L251 (14 lines) |
| `UsersController.loadUsersAndPersonnel` | `public async method` | **L253 - L279** | `() => Promise<any>` | public async method L253-L279 (27 lines) |
| `UsersController.#renderPersonnelSelectOptions` | `private method` | **L281 - L300** | `(filterText = '', selectedPersonnelId = '') => any` | private method L281-L300 (20 lines) |
| `UsersController.#getFilteredUsers` | `private method` | **L302 - L337** | `() => any` | private method L302-L337 (36 lines) |
| `UsersController.#buildUserRowHtml` | `private method` | **L339 - L378** | `(u, indexNo) => any` | private method L339-L378 (40 lines) |
| `UsersController.#renderUsersTable` | `private method` | **L380 - L487** | `() => any` | private method L380-L487 (108 lines) |
| `UsersController.#toggleAdminScopeUI` | `private method` | **L489 - L505** | `() => any` | private method L489-L505 (17 lines) |
| `UsersController.#openModal` | `private method` | **L507 - L562** | `(editUser = null) => any` | private method L507-L562 (56 lines) |
| `UsersController.#closeModal` | `private method` | **L564 - L566** | `() => any` | private method L564-L566 (3 lines) |
| `UsersController.syncUsersSilent` | `public async method` | **L568 - L623** | `(deltaDetail = null) => Promise<any>` | public async method L568-L623 (56 lines) |
| `UsersController.#bindEvents` | `private method` | **L625 - L787** | `() => any` | private method L625-L787 (163 lines) |
| `handleTableActionClick` | `async_arrow_fn` | **L724 - L783** | `(e) => inferred` | Arrow Function L724-L783 |
| `UsersController.#handleSaveUserAccount` | `private async method` | **L789 - L831** | `() => Promise<any>` | private async method L789-L831 (43 lines) |

---

## File: `assets/js/core/AuthService.js`
- **Layer:** Core Service & Infrastructure Layer
- **Hash:** `6ecb4ba989cb6124` | **Total Lines:** `372` | **Imports:** `3` | **Exports:** `AuthService`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `AuthService` | `class` | **L10 - L371** | `export class AuthService` | Class Definition (362 lines) |
| `AuthService.getCurrentUser` | `static public method` | **L13 - L49** | `(extendSession = true) => any` | static public method L13-L49 (37 lines) |
| `AuthService.setCurrentUser` | `static public method` | **L51 - L66** | `(userObj, loginMode = 'checkin') => any` | static public method L51-L66 (16 lines) |
| `AuthService.clearSession` | `static public method` | **L68 - L71** | `() => any` | static public method L68-L71 (4 lines) |
| `AuthService.verifySessionWithDatabase` | `static public async method` | **L73 - L119** | `() => Promise<any>` | static public async method L73-L119 (47 lines) |
| `AuthService.getRedirectUrlForSession` | `static public method` | **L126 - L144** | `(sessionUser) => any` | static public method L126-L144 (19 lines) |
| `AuthService.login` | `static public async method` | **L146 - L212** | `(username, password, loginMode = 'checkin') => Promise<any>` | static public async method L146-L212 (67 lines) |
| `AuthService.changePassword` | `static public async method` | **L214 - L263** | `(username, oldPassword, newPassword, confirmPassword) => Promise<any>` | static public async method L214-L263 (50 lines) |
| `AuthService.requestPasswordResetByNationalId` | `static public async method` | **L265 - L306** | `(nationalId) => Promise<any>` | static public async method L265-L306 (42 lines) |
| `AuthService.requireAuth` | `static public method` | **L308 - L330** | `(allowedRoles = ['SuperAdmin', 'Admin', 'User']) => any` | static public method L308-L330 (23 lines) |
| `AuthService.canViewRecordByScope` | `static public method` | **L332 - L348** | `(currentUser, targetRecord) => any` | static public method L332-L348 (17 lines) |
| `AuthService.canEditAttendanceRecord` | `static public method` | **L350 - L362** | `(currentUser, record = null) => any` | static public method L350-L362 (13 lines) |
| `AuthService.canDeleteAttendanceRecord` | `static public method` | **L364 - L370** | `(currentUser, record = null) => any` | static public method L364-L370 (7 lines) |

---

## File: `assets/js/core/Config.js`
- **Layer:** Core Service & Infrastructure Layer
- **Hash:** `d795be328d1e1e4c` | **Total Lines:** `100` | **Imports:** `0` | **Exports:** `Config`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `Config` | `class` | **L6 - L100** | `export class Config` | คลาสเก็บค่าคงที่ การตั้งค่าเชื่อมต่อ Supabase และค่ามาตรฐานของระบบ V2.7 |

---

## File: `assets/js/core/DatabaseService.js`
- **Layer:** Core Service & Infrastructure Layer
- **Hash:** `95df56e4f1362392` | **Total Lines:** `131` | **Imports:** `1` | **Exports:** `DatabaseService`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `DatabaseService` | `class` | **L8 - L131** | `export class DatabaseService` | Class Definition (124 lines) |
| `DatabaseService.constructor` | `public constructor` | **L13 - L19** | `() => any` | public constructor L13-L19 (7 lines) |
| `DatabaseService.getInstance` | `static public method` | **L25 - L30** | `() => any` | static public method L25-L30 (6 lines) |
| `DatabaseService.getActiveSchema` | `static public method` | **L36 - L38** | `() => any` | static public method L36-L38 (3 lines) |
| `DatabaseService.#initClient` | `private method` | **L43 - L68** | `() => any` | เริ่มต้นสร้าง Supabase Client จาก Global Object window.supabase |
| `DatabaseService.broadcastRealtimeEvent` | `public async method` | **L96 - L107** | `(eventName, payload = {}) => Promise<any>` | public async method L96-L107 (12 lines) |
| `DatabaseService.checkConnection` | `public async method` | **L113 - L130** | `() => Promise<any>` | public async method L113-L130 (18 lines) |

---

## File: `assets/js/core/UIHelpers.js`
- **Layer:** Core Service & Infrastructure Layer
- **Hash:** `f527443c128722ff` | **Total Lines:** `1199` | **Imports:** `1` | **Exports:** `UIHelpers`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `UIHelpers` | `class` | **L8 - L1199** | `export class UIHelpers` | Class Definition (1192 lines) |
| `UIHelpers.escapeHtml` | `static public method` | **L27 - L35** | `(str) => any` | static public method L27-L35 (9 lines) |
| `UIHelpers.getRootBasePath` | `static public method` | **L37 - L46** | `() => any` | static public method L37-L46 (10 lines) |
| `UIHelpers.maskUrlToRoot` | `static public method` | **L48 - L71** | `(explicitPageName = '') => any` | static public method L48-L71 (24 lines) |
| `UIHelpers.initTheme` | `static public method` | **L73 - L90** | `() => any` | static public method L73-L90 (18 lines) |
| `UIHelpers.toggleTheme` | `static public method` | **L92 - L98** | `() => any` | static public method L92-L98 (7 lines) |
| `UIHelpers.showToast` | `static public method` | **L100 - L132** | `(message, type = 'success', durationMs = 2600) => any` | static public method L100-L132 (33 lines) |
| `UIHelpers.formatThaiShortDate` | `static public method` | **L134 - L150** | `(dateStr) => any` | static public method L134-L150 (17 lines) |
| `UIHelpers.formatThaiFullDate` | `static public method` | **L152 - L167** | `(dateStr) => any` | static public method L152-L167 (16 lines) |
| `UIHelpers.formatThaiDate` | `static public method` | **L169 - L171** | `(dateStr) => any` | static public method L169-L171 (3 lines) |
| `UIHelpers.formatTime24` | `static public method` | **L173 - L181** | `(timeStr) => any` | static public method L173-L181 (9 lines) |
| `UIHelpers.timeToMinutes` | `static public method` | **L183 - L189** | `(timeStr) => any` | static public method L183-L189 (7 lines) |
| `UIHelpers.getTodayISO` | `static public method` | **L191 - L195** | `() => any` | static public method L191-L195 (5 lines) |
| `UIHelpers.getTodayDateString` | `static public method` | **L197 - L199** | `() => any` | static public method L197-L199 (3 lines) |
| `UIHelpers.getCurrentTimeHHMM` | `static public method` | **L201 - L206** | `() => any` | static public method L201-L206 (6 lines) |
| `UIHelpers.formatPosition` | `static public method` | **L220 - L256** | `(title = '', level = '', positionType = '', fullFallback = '') => any` | static public method L220-L256 (37 lines) |
| `UIHelpers.capturePortrait3x4FromVideo` | `static public method` | **L258 - L292** | `(videoEl, canvasEl) => any` | static public method L258-L292 (35 lines) |
| `UIHelpers.verifyImageUrl` | `static public method` | **L294 - L352** | `(rawUrl) => any` | static public method L294-L352 (59 lines) |
| `UIHelpers.verifyGoogleDriveLink` | `static public async method` | **L354 - L396** | `(scriptUrl, folderId = '') => Promise<any>` | static public async method L354-L396 (43 lines) |
| `UIHelpers.uploadPhotoToGoogleDrive` | `static public async method` | **L398 - L462** | `(base64DataUrl, fileNamePrefix, settings) => Promise<any>` | static public async method L398-L462 (65 lines) |
| `UIHelpers.showLoading` | `static public method` | **L469 - L531** | `(message = 'กำลังประมวลผลข้อมูล กรุณารอสักครู่...') => any` | static public method L469-L531 (63 lines) |
| `UIHelpers.#updateProgressDOM` | `static private method` | **L533 - L540** | `(percent) => any` | static private method L533-L540 (8 lines) |
| `UIHelpers.hideLoading` | `static public method` | **L542 - L567** | `() => any` | static public method L542-L567 (26 lines) |
| `UIHelpers.renderTableSkeleton` | `static public method` | **L569 - L579** | `(rows = 5, cols = 6) => any` | static public method L569-L579 (11 lines) |
| `UIHelpers.alert` | `static public async method` | **L581 - L616** | `(title, text = '', icon = 'success') => Promise<any>` | static public async method L581-L616 (36 lines) |
| `UIHelpers.confirm` | `static public async method` | **L618 - L668** | `(title, text = '', confirmText = 'ยืนยัน', icon = 'warning', options = {}) => Promise<any>` | static public async method L618-L668 (51 lines) |
| `UIHelpers.validateThaiNationalId` | `static public method` | **L670 - L689** | `(id, strictCheckDigit = false) => any` | static public method L670-L689 (20 lines) |
| `UIHelpers.getLast6DigitsFromNationalId` | `static public method` | **L691 - L695** | `(nationalId) => any` | static public method L691-L695 (5 lines) |
| `UIHelpers.exportToExcelUTF8` | `static public method` | **L697 - L722** | `(dataRows, fileName = 'export_data', sheetName = 'Sheet1') => any` | static public method L697-L722 (26 lines) |
| `UIHelpers.exportMultiSheetExcel` | `static public method` | **L729 - L749** | `(sheets, fileName = 'export_data') => any` | static public method L729-L749 (21 lines) |
| `UIHelpers.exportTemplateWithValidationsExcel` | `static public async method` | **L758 - L1021** | `({ settings, templateRows, fileName = 'Template_นำเข้าบุคลากร_กทม' }) => Promise<any>` | static public async method L758-L1021 (264 lines) |
| `UIHelpers.parseExcelFileUTF8` | `static public method` | **L1023 - L1045** | `(file) => any` | static public method L1023-L1045 (23 lines) |
| `UIHelpers.printReportInNewTab` | `static public method` | **L1047 - L1198** | `({ title, subtitle, tableHtml, headerColor = '#007B3E' }) => any` | static public method L1047-L1198 (152 lines) |

---

## File: `assets/js/models/AttendanceModel.js`
- **Layer:** Data Model & Supabase Repository Layer
- **Hash:** `40c5dabcbac238a1` | **Total Lines:** `1848` | **Imports:** `5` | **Exports:** `AttendanceModel`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `AttendanceModel` | `class` | **L12 - L1848** | `export class AttendanceModel` | Class Definition (1837 lines) |
| `AttendanceModel.#calculateDistanceMeters` | `static private method` | **L16 - L27** | `(lat1, lon1, lat2, lon2) => any` | static private method L16-L27 (12 lines) |
| `AttendanceModel.#minutesToTime24` | `static private method` | **L29 - L34** | `(totalMinutes) => any` | static private method L29-L34 (6 lines) |
| `AttendanceModel.#isForbiddenLocationTerm` | `static private method` | **L44 - L74** | `(rawName, tags = {}) => any` | static private method L44-L74 (31 lines) |
| `AttendanceModel.#classifyTargetPlace` | `static private method` | **L87 - L168** | `(tags = {}, name = '') => any` | static private method L87-L168 (82 lines) |
| `AttendanceModel.#extractValidPlaceFromNominatim` | `static private method` | **L175 - L215** | `(nomData) => any` | static private method L175-L215 (41 lines) |
| `AttendanceModel.#extractCleanSoiOrSubSoi` | `static private method` | **L225 - L293** | `(lat, lng, nominatimList = [], overpassElements = []) => any` | static private method L225-L293 (69 lines) |
| `AttendanceModel.#fetchWithFastTimeout` | `static private async method` | **L295 - L310** | `(url, timeoutMs = 1100) => Promise<any>` | static private async method L295-L310 (16 lines) |
| `AttendanceModel.#queryOverpassFast` | `static private async method` | **L312 - L328** | `(query, timeoutMs = 1200) => Promise<any>` | static private async method L312-L328 (17 lines) |
| `AttendanceModel.resolveLocationWithZoomMeta` | `static public async method` | **L340 - L567** | `(lat, lng) => Promise<any>` | static public async method L340-L567 (228 lines) |
| `classifyElementsWithinRadius` | `arrow_fn` | **L367 - L398** | `(elements, minExclusiveMeters, maxInclusiveMeters) => inferred` | คัดแยกสถานที่เป้าหมายจาก Overpass พร้อมคำนวณระยะห่างจริง |
| `AttendanceModel.resolveLocationName` | `static public async method` | **L575 - L578** | `(lat, lng) => Promise<any>` | static public async method L575-L578 (4 lines) |
| `AttendanceModel.calculateGpsJitter` | `static public method` | **L588 - L602** | `(lat, lng, maxRadiusMeters = 20, minRadiusMeters = null) => any` | static public method L588-L602 (15 lines) |
| `AttendanceModel.resolveJitteredCheckoutWithLocation` | `static public async method` | **L612 - L653** | `(baseLat, baseLng, radiusMeters = 20, maxAttempts = 3) => Promise<any>` | static public async method L612-L653 (42 lines) |
| `AttendanceModel.evaluateOfficialStatus` | `static public method` | **L655 - L756** | `(log, settings) => any` | static public method L655-L756 (102 lines) |
| `AttendanceModel.getActiveRegularRecordForCheckout` | `static public async method` | **L785 - L816** | `(personnelId, userId, settings) => Promise<any>` | static public async method L785-L816 (32 lines) |
| `AttendanceModel.getPersonalAttendanceHistory` | `static public async method` | **L818 - L854** | `(personnelId, userId, limit = 35) => Promise<any>` | static public async method L818-L854 (37 lines) |
| `AttendanceModel.getPersonalSpecialRequests` | `static public async method` | **L856 - L882** | `(personnelId, userId) => Promise<any>` | static public async method L856-L882 (27 lines) |
| `AttendanceModel.deletePendingSpecialRequestByUser` | `static public async method` | **L884 - L918** | `(logId, personnelId, userId) => Promise<any>` | static public async method L884-L918 (35 lines) |
| `AttendanceModel.submitCheckinOrCheckout` | `static public async method` | **L920 - L1317** | `(payload) => Promise<any>` | static public async method L920-L1317 (398 lines) |
| `AttendanceModel.submitSpecialRequest` | `static public async method` | **L1319 - L1413** | `(payload) => Promise<any>` | static public async method L1319-L1413 (95 lines) |
| `AttendanceModel.getSpecialRequests` | `static public async method` | **L1415 - L1455** | `(currentUser, statusFilter = 'pending') => Promise<any>` | static public async method L1415-L1455 (41 lines) |
| `AttendanceModel.processSpecialRequestsBulk` | `static public async method` | **L1457 - L1526** | `(logIds, decision, approverUserId) => Promise<any>` | static public async method L1457-L1526 (70 lines) |
| `AttendanceModel.getDatesBetween` | `static public method` | **L1528 - L1545** | `(startDate, endDate) => any` | static public method L1528-L1545 (18 lines) |
| `AttendanceModel.getReportRecordsByDateRange` | `static public async method` | **L1547 - L1606** | `(startDate, endDate, currentUser) => Promise<any>` | static public async method L1547-L1606 (60 lines) |
| `AttendanceModel.#formatReportRow` | `static private method` | **L1608 - L1652** | `(person, log, workDate, evalStatus) => any` | static private method L1608-L1652 (45 lines) |
| `AttendanceModel.getDailyReportRecords` | `static public async method` | **L1654 - L1656** | `(workDate, currentUser) => Promise<any>` | static public async method L1654-L1656 (3 lines) |
| `AttendanceModel.saveAdminAttendanceRecord` | `static public async method` | **L1658 - L1722** | `(payload) => Promise<any>` | static public async method L1658-L1722 (65 lines) |
| `AttendanceModel.deleteAttendanceRecord` | `static public async method` | **L1724 - L1742** | `(logId) => Promise<any>` | static public async method L1724-L1742 (19 lines) |
| `AttendanceModel.calculateDashboardMetrics` | `static public method` | **L1744 - L1807** | `(dailyRecords) => any` | static public method L1744-L1807 (64 lines) |
| `AttendanceModel.getTodaySyncWatermark` | `static public async method` | **L1813 - L1847** | `() => Promise<any>` | static public async method L1813-L1847 (35 lines) |

---

## File: `assets/js/models/PersonnelModel.js`
- **Layer:** Data Model & Supabase Repository Layer
- **Hash:** `d1d1b72045d7aa42` | **Total Lines:** `448` | **Imports:** `3` | **Exports:** `PersonnelModel`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `PersonnelModel` | `class` | **L10 - L448** | `export class PersonnelModel` | Class Definition (439 lines) |
| `PersonnelModel.getRolePastelMeta` | `static public method` | **L19 - L45** | `(role = 'User') => any` | static public method L19-L45 (27 lines) |
| `PersonnelModel.getAll` | `static public async method` | **L52 - L94** | `(currentUser = null) => Promise<any>` | static public async method L52-L94 (43 lines) |
| `PersonnelModel.getById` | `static public async method` | **L96 - L112** | `(id) => Promise<any>` | static public async method L96-L112 (17 lines) |
| `PersonnelModel.quickCreateAccount` | `static public async method` | **L119 - L196** | `(personId) => Promise<any>` | static public async method L119-L196 (78 lines) |
| `PersonnelModel.create` | `static public async method` | **L201 - L289** | `(payload, autoCreateAccount = false) => Promise<any>` | เพิ่มข้อมูลบุคลากรใหม่ (สีป้ายกำกับกำหนดตายตัวเป็นสีเขียวพาสเทลสำหรับ User) |
| `PersonnelModel.update` | `static public async method` | **L291 - L342** | `(id, payload) => Promise<any>` | static public async method L291-L342 (52 lines) |
| `PersonnelModel.delete` | `static public async method` | **L344 - L355** | `(id) => Promise<any>` | static public async method L344-L355 (12 lines) |
| `PersonnelModel.groupPersonnel` | `static public method` | **L357 - L383** | `(personnelList, viewMode = 'division') => any` | static public method L357-L383 (27 lines) |
| `PersonnelModel.bulkImportFromExcel` | `static public async method` | **L385 - L429** | `(excelRows, autoCreateAccount = true) => Promise<any>` | static public async method L385-L429 (45 lines) |
| `PersonnelModel.getExcelTemplateRows` | `static public method` | **L431 - L447** | `() => any` | static public method L431-L447 (17 lines) |

---

## File: `assets/js/models/SettingsModel.js`
- **Layer:** Data Model & Supabase Repository Layer
- **Hash:** `a843eaaf96d9f574` | **Total Lines:** `411` | **Imports:** `3` | **Exports:** `SettingsModel`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SettingsModel` | `class` | **L10 - L411** | `export class SettingsModel` | Class Definition (402 lines) |
| `SettingsModel.formatShiftDisplayText` | `static public method` | **L17 - L37** | `(shift) => any` | static public method L17-L37 (21 lines) |
| `SettingsModel.getSettings` | `static public async method` | **L39 - L172** | `(forceRefresh = false) => Promise<any>` | static public async method L39-L172 (134 lines) |
| `SettingsModel.updateSettings` | `static public async method` | **L174 - L326** | `(payload) => Promise<any>` | static public async method L174-L326 (153 lines) |
| `SettingsModel.moveItemInArray` | `static public method` | **L328 - L337** | `(arr, fromIndex, direction) => any` | static public method L328-L337 (10 lines) |
| `SettingsModel.fileToDataUrl` | `static public method` | **L339 - L346** | `(file) => any` | static public method L339-L346 (8 lines) |
| `SettingsModel.getUniquePositionTypes` | `static public method` | **L348 - L351** | `(settings) => any` | static public method L348-L351 (4 lines) |
| `SettingsModel.getUniquePositionTitles` | `static public method` | **L353 - L359** | `(settings, filterType = '') => any` | static public method L353-L359 (7 lines) |
| `SettingsModel.getUniquePositionLevels` | `static public method` | **L361 - L370** | `(settings, filterType = '', filterTitle = '') => any` | static public method L361-L370 (10 lines) |
| `SettingsModel.getUniqueOrganizations` | `static public method` | **L372 - L376** | `(settings) => any` | static public method L372-L376 (5 lines) |
| `SettingsModel.getUniqueBureaus` | `static public method` | **L378 - L385** | `(settings, filterOrg = '') => any` | static public method L378-L385 (8 lines) |
| `SettingsModel.getUniqueDivisions` | `static public method` | **L387 - L396** | `(settings, filterBureau = '', filterOrg = '') => any` | static public method L387-L396 (10 lines) |
| `SettingsModel.getUniqueGroups` | `static public method` | **L398 - L410** | `(settings, filterBureau = '', filterDivision = '', filterOrg = '') => any` | static public method L398-L410 (13 lines) |

---

## File: `assets/js/models/UserModel.js`
- **Layer:** Data Model & Supabase Repository Layer
- **Hash:** `17921335099d5452` | **Total Lines:** `370` | **Imports:** `3` | **Exports:** `UserModel`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `UserModel` | `class` | **L10 - L370** | `export class UserModel` | Class Definition (361 lines) |
| `UserModel.getAll` | `static public async method` | **L17 - L54** | `(currentUser) => Promise<any>` | static public async method L17-L54 (38 lines) |
| `UserModel.getPendingPasswordResetRequests` | `static public async method` | **L61 - L64** | `(currentUser) => Promise<any>` | static public async method L61-L64 (4 lines) |
| `UserModel.create` | `static public async method` | **L72 - L134** | `(payload, currentUser) => Promise<any>` | static public async method L72-L134 (63 lines) |
| `UserModel.update` | `static public async method` | **L143 - L195** | `(id, payload, currentUser) => Promise<any>` | static public async method L143-L195 (53 lines) |
| `UserModel.delete` | `static public async method` | **L203 - L227** | `(id, currentUser) => Promise<any>` | static public async method L203-L227 (25 lines) |
| `UserModel.processPasswordResetRequest` | `static public async method` | **L236 - L301** | `(userId, isApproved) => Promise<any>` | static public async method L236-L301 (66 lines) |
| `UserModel.bulkImportFromExcel` | `static public async method` | **L309 - L350** | `(excelRows, currentUser) => Promise<any>` | static public async method L309-L350 (42 lines) |
| `UserModel.getExcelTemplateRows` | `static public method` | **L356 - L369** | `() => any` | static public method L356-L369 (14 lines) |

---

## File: `assets/js/utils/DOMDiffHelper.js`
- **Layer:** Application Module
- **Hash:** `cfa5908ccef75054` | **Total Lines:** `164` | **Imports:** `0` | **Exports:** `DOMDiffHelper`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `DOMDiffHelper` | `class` | **L6 - L163** | `export class DOMDiffHelper` | ผู้ช่วยจัดการ DOM แบบ Differential Sync และ Animation สำหรับตารางและตัวชี้วัดในระบบ |
| `DOMDiffHelper.reindexTableSequence` | `static public method` | **L13 - L27** | `(tbody, seqSelector = '.seq-num', startIndex = 1) => any` | static public method L13-L27 (15 lines) |
| `DOMDiffHelper.lockRowForConcurrentAdmin` | `static public method` | **L35 - L55** | `(rowEl, adminName = 'ผู้ดูแลระบบ', actionText = 'อนุมัติแล้ว') => any` | static public method L35-L55 (21 lines) |
| `DOMDiffHelper.prependRowWithAnimation` | `static public method` | **L64 - L83** | `(tbody, rowHtml, highlightClass = 'row-enter-highlight') => any` | static public method L64-L83 (20 lines) |
| `DOMDiffHelper.removeRowWithFade` | `static public method` | **L91 - L106** | `(rowEl, durationMs = 600, onComplete = null) => any` | static public method L91-L106 (16 lines) |
| `DOMDiffHelper.highlightRowUpdate` | `static public method` | **L112 - L120** | `(rowEl) => any` | static public method L112-L120 (9 lines) |
| `DOMDiffHelper.animateNumericValue` | `static public method` | **L129 - L162** | `(element, startVal, endVal, durationMs = 800) => any` | static public method L129-L162 (34 lines) |
| `step` | `arrow_fn` | **L144 - L160** | `(currentTime) => inferred` | Arrow Function L144-L160 |

---

## File: `checkin.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `398a7c1d8ea3c89b` | **Total Lines:** `1014` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L171** | `<head>` | HTML DOM Section L3-L171 |
| `<main>` | `html_dom_section` | **L252 - L645** | `<main>` | HTML DOM Section L252-L645 |
| `<div#checkinWorkspaceWrapper>` | `html_dom_section` | **L255 - L503** | `id="checkinWorkspaceWrapper"` | HTML DOM Section L255-L503 |
| `<div#photoPreviewCard>` | `html_dom_section` | **L298 - L319** | `id="photoPreviewCard"` | HTML DOM Section L298-L319 |
| `<div#gpsSectionCard>` | `html_dom_section` | **L322 - L358** | `id="gpsSectionCard"` | HTML DOM Section L322-L358 |
| `<div#googleMapEmbedWrapper>` | `html_dom_section` | **L355 - L355** | `id="googleMapEmbedWrapper"` | HTML DOM Section L355-L355 |
| `<div#onsiteGeofenceStatusCard>` | `html_dom_section` | **L379 - L390** | `id="onsiteGeofenceStatusCard"` | HTML DOM Section L379-L390 |
| `<div#offsiteLocationSection>` | `html_dom_section` | **L393 - L429** | `id="offsiteLocationSection"` | HTML DOM Section L393-L429 |
| `<div#offsiteRemarkChipsContainer>` | `html_dom_section` | **L425 - L425** | `id="offsiteRemarkChipsContainer"` | HTML DOM Section L425-L425 |
| `<div#checkinActionCard>` | `html_dom_section` | **L433 - L473** | `id="checkinActionCard"` | HTML DOM Section L433-L473 |
| `<div#shiftSelectorContainer>` | `html_dom_section` | **L443 - L448** | `id="shiftSelectorContainer"` | HTML DOM Section L443-L448 |
| `<div#mainCustomTimeContainer>` | `html_dom_section` | **L450 - L459** | `id="mainCustomTimeContainer"` | HTML DOM Section L450-L459 |
| `<div#checkinStep1Container>` | `html_dom_section` | **L485 - L485** | `id="checkinStep1Container"` | HTML DOM Section L485-L485 |
| `<div#checkinStep2Container>` | `html_dom_section` | **L486 - L486** | `id="checkinStep2Container"` | HTML DOM Section L486-L486 |
| `<div#rightColumnWrapper>` | `html_dom_section` | **L487 - L487** | `id="rightColumnWrapper"` | HTML DOM Section L487-L487 |
| `<div#cameraSectionCard>` | `html_dom_section` | **L491 - L491** | `id="cameraSectionCard"` | HTML DOM Section L491-L491 |
| `<div#cameraStandbyOverlay>` | `html_dom_section` | **L499 - L499** | `id="cameraStandbyOverlay"` | HTML DOM Section L499-L499 |
| `<div#desktopPanesContainer>` | `html_dom_section` | **L506 - L643** | `id="desktopPanesContainer"` | HTML DOM Section L506-L643 |
| `<div#desktopHistoryWrapper>` | `html_dom_section` | **L509 - L598** | `id="desktopHistoryWrapper"` | HTML DOM Section L509-L598 |
| `<div#todayHistoryTabPanel>` | `html_dom_section` | **L535 - L552** | `id="todayHistoryTabPanel"` | HTML DOM Section L535-L552 |
| `<div#pastHistoryTabPanel>` | `html_dom_section` | **L555 - L595** | `id="pastHistoryTabPanel"` | HTML DOM Section L555-L595 |
| `<div#desktopSpecialWrapper>` | `html_dom_section` | **L601 - L641** | `id="desktopSpecialWrapper"` | HTML DOM Section L601-L641 |
| `<div#mobileDrawerPanel>` | `html_dom_section` | **L653 - L743** | `id="mobileDrawerPanel"` | HTML DOM Section L653-L743 |
| `<div#spCustomTimeContainer>` | `html_dom_section` | **L776 - L785** | `id="spCustomTimeContainer"` | HTML DOM Section L776-L785 |
| `<div#spSearchWrapper>` | `html_dom_section` | **L827 - L833** | `id="spSearchWrapper"` | HTML DOM Section L827-L833 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L883 - L883** | `<script>` | Bootstrap script L883-L883 |

---

## File: `dashboard.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `a960c0cd7740ef80` | **Total Lines:** `271` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L108** | `<head>` | HTML DOM Section L3-L108 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L112 - L112** | `id="bmaSidebarContainer"` | HTML DOM Section L112-L112 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L118 - L118** | `id="bmaTopbarContainer"` | HTML DOM Section L118-L118 |
| `<main>` | `html_dom_section` | **L121 - L260** | `<main>` | HTML DOM Section L121-L260 |
| `<div#mobileShortcutContainer>` | `html_dom_section` | **L124 - L124** | `id="mobileShortcutContainer"` | HTML DOM Section L124-L124 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L263 - L263** | `id="bmaFooterContainer"` | HTML DOM Section L263-L263 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L269 - L269** | `<script>` | Bootstrap script L269-L269 |

---

## File: `docs/manual/index.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `3894bdb0fb23a1bb` | **Total Lines:** `683` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L58** | `<head>` | HTML DOM Section L3-L58 |
| `<main>` | `html_dom_section` | **L130 - L621** | `<main>` | HTML DOM Section L130-L621 |

---

## File: `docs/manual/manual-admin.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `425a99d1903e85ec` | **Total Lines:** `1289` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L57** | `<head>` | HTML DOM Section L3-L57 |
| `<div#mobileTocPanel>` | `html_dom_section` | **L96 - L107** | `id="mobileTocPanel"` | HTML DOM Section L96-L107 |
| `<main>` | `html_dom_section` | **L177 - L1065** | `<main>` | HTML DOM Section L177-L1065 |
| `<div#mockupModal>` | `html_dom_section` | **L1074 - L1100** | `id="mockupModal"` | HTML DOM Section L1074-L1100 |
| `<div#mockupModalPanel>` | `html_dom_section` | **L1076 - L1099** | `id="mockupModalPanel"` | HTML DOM Section L1076-L1099 |

---

## File: `docs/manual/manual-superadmin.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `f079c2a2df23ea80` | **Total Lines:** `1478` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L57** | `<head>` | HTML DOM Section L3-L57 |
| `<div#mobileTocPanel>` | `html_dom_section` | **L96 - L107** | `id="mobileTocPanel"` | HTML DOM Section L96-L107 |
| `<main>` | `html_dom_section` | **L170 - L1226** | `<main>` | HTML DOM Section L170-L1226 |
| `<div#mockupModal>` | `html_dom_section` | **L1235 - L1261** | `id="mockupModal"` | HTML DOM Section L1235-L1261 |
| `<div#mockupModalPanel>` | `html_dom_section` | **L1237 - L1260** | `id="mockupModalPanel"` | HTML DOM Section L1237-L1260 |

---

## File: `docs/manual/manual-user.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `bde6d6d5d54045fb` | **Total Lines:** `1375` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L57** | `<head>` | HTML DOM Section L3-L57 |
| `<div#mobileTocPanel>` | `html_dom_section` | **L96 - L107** | `id="mobileTocPanel"` | HTML DOM Section L96-L107 |
| `<main>` | `html_dom_section` | **L170 - L1135** | `<main>` | HTML DOM Section L170-L1135 |
| `<div#mockupModal>` | `html_dom_section` | **L1144 - L1170** | `id="mockupModal"` | HTML DOM Section L1144-L1170 |
| `<div#mockupModalPanel>` | `html_dom_section` | **L1146 - L1169** | `id="mockupModalPanel"` | HTML DOM Section L1146-L1169 |

---

## File: `google_apps_script/DriveUploadBridge.gs`
- **Layer:** Google Apps Script Serverless Bridge
- **Hash:** `1ac041a0d3b1bc90` | **Total Lines:** `109` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `doGet` | `function` | **L7 - L11** | `(e) => inferred` | และคืนค่า Direct URL เพื่อให้ Supabase จัดเก็บเฉพาะ URL เท่านั้น |
| `doPost` | `function` | **L13 - L67** | `(e) => inferred` | Function L13-L67 |
| `handleVerifyFolder` | `function` | **L69 - L85** | `(folderId) => inferred` | Function L69-L85 |
| `getOrCreateTargetFolder` | `function` | **L87 - L98** | `(folderId) => inferred` | Function L87-L98 |
| `extractFolderIdFromInput` | `function` | **L100 - L103** | `(input) => inferred` | Function L100-L103 |
| `createJsonResponse` | `function` | **L105 - L109** | `(obj) => inferred` | Function L105-L109 |

---

## File: `index.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `d645fb5b11bda651` | **Total Lines:** `378` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L140** | `<head>` | HTML DOM Section L3-L140 |
| `<div#mobileOrgLogoWrapper>` | `html_dom_section` | **L165 - L165** | `id="mobileOrgLogoWrapper"` | HTML DOM Section L165-L165 |
| `<main>` | `html_dom_section` | **L172 - L283** | `<main>` | HTML DOM Section L172-L283 |
| `<div#orgLogoWrapper>` | `html_dom_section` | **L178 - L180** | `id="orgLogoWrapper"` | HTML DOM Section L178-L180 |
| `<form#loginForm>` | `html_dom_section` | **L192 - L280** | `id="loginForm"` | HTML DOM Section L192-L280 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L376 - L376** | `<script>` | Bootstrap script L376-L376 |

---

## File: `personnel.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `17544bb3acbd46cd` | **Total Lines:** `675` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L109** | `<head>` | HTML DOM Section L3-L109 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L113 - L113** | `id="bmaSidebarContainer"` | HTML DOM Section L113-L113 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L117 - L117** | `id="bmaTopbarContainer"` | HTML DOM Section L117-L117 |
| `<main>` | `html_dom_section` | **L119 - L251** | `<main>` | HTML DOM Section L119-L251 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L253 - L253** | `id="bmaFooterContainer"` | HTML DOM Section L253-L253 |
| `<div#modalPersonnelForm>` | `html_dom_section` | **L259 - L370** | `id="modalPersonnelForm"` | HTML DOM Section L259-L370 |
| `<div#bulkImportPreviewContainer>` | `html_dom_section` | **L586 - L627** | `id="bulkImportPreviewContainer"` | HTML DOM Section L586-L627 |
| `<div#bulkImportProgressContainer>` | `html_dom_section` | **L647 - L655** | `id="bulkImportProgressContainer"` | HTML DOM Section L647-L655 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L673 - L673** | `<script>` | Bootstrap script L673-L673 |

---

## File: `pipeline/PIPE-20261027-add-manual-menu-sidebar-and-checkin/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `269405843be2f177` | **Total Lines:** `226` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L23** | `<head>` | HTML DOM Section L3-L23 |

---

## File: `pipeline/PIPE-20261027-camera-mirror-and-detailed-confirm-modal/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `a2e9256164a60ce7` | **Total Lines:** `355` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L13** | `<head>` | HTML DOM Section L3-L13 |

---

## File: `pipeline/PIPE-20261027-camera-portrait-aspect-ratio-and-margins/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `ab4ebb062e0dc4e2` | **Total Lines:** `182` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261027-camera-width-expansion-and-title-rename/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `de07177de4aa6ffa` | **Total Lines:** `146` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261027-dual-gps-columns-and-jitter/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `d8f9d28beeea67ca` | **Total Lines:** `345` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L23** | `<head>` | HTML DOM Section L3-L23 |

---

## File: `pipeline/PIPE-20261027-limit-personal-history-30/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `04c368434ba84688` | **Total Lines:** `197` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L23** | `<head>` | HTML DOM Section L3-L23 |

---

## File: `pipeline/PIPE-20261027-limit-personal-history-30/qa_test.mjs`
- **Layer:** Application Module
- **Hash:** `5cccbdcafde1c13b` | **Total Lines:** `58` | **Imports:** `2` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261027-pc-viewport-no-scroll-and-gps-height/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `d8438262b3b9be12` | **Total Lines:** `183` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261027-shift-select-empty-and-soft-ui-confirm-alert/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `7501d75c20368c2c` | **Total Lines:** `139` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261027-shift-select-empty-default-and-scroll-alert/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `282c2f2eefdc3606` | **Total Lines:** `128` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261027-soft-ui-logout-alert/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `0c7f7e41c9f4f39c` | **Total Lines:** `218` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L13** | `<head>` | HTML DOM Section L3-L13 |

---

## File: `pipeline/PIPE-20261027-user-manuals-html/analyze_issues.js`
- **Layer:** Application Module
- **Hash:** `ce821e564d05ce1c` | **Total Lines:** `95` | **Imports:** `0` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261027-user-manuals-html/inspect_manuals.js`
- **Layer:** Application Module
- **Hash:** `ce160764b8ec7c79` | **Total Lines:** `45` | **Imports:** `0` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261027-user-manuals-html/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `f42730b4a12ee79a` | **Total Lines:** `90` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L10** | `<head>` | HTML DOM Section L3-L10 |

---

## File: `pipeline/PIPE-20261027-user-manuals-html/test_comprehensive_audit.js`
- **Layer:** Application Module
- **Hash:** `e1cc372d333b9867` | **Total Lines:** `167` | **Imports:** `0` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261027-user-manuals-html/test_inspect.js`
- **Layer:** Application Module
- **Hash:** `b3dec0e5adb736c7` | **Total Lines:** `10` | **Imports:** `0` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261027-user-manuals-html/test_qa_check.js`
- **Layer:** Application Module
- **Hash:** `a37ef6d93fece8a2` | **Total Lines:** `73` | **Imports:** `0` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261028-approvals-gps-location-column/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `913c3951f520ab88` | **Total Lines:** `161` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L13** | `<head>` | HTML DOM Section L3-L13 |

---

## File: `pipeline/PIPE-20261028-block-normal-hours-checkin/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `6e8a18ea5680078c` | **Total Lines:** `75` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L17** | `<head>` | HTML DOM Section L3-L17 |

---

## File: `pipeline/PIPE-20261028-custom-gps-pin-and-jitter-search/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `810e5f874e8ffe60` | **Total Lines:** `88` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L16** | `<head>` | HTML DOM Section L3-L16 |

---

## File: `pipeline/PIPE-20261028-direct-place-name-without-proximity-prefix/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `ca3dd536d14355d1` | **Total Lines:** `105` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L13** | `<head>` | HTML DOM Section L3-L13 |

---

## File: `pipeline/PIPE-20261028-line-and-no-camera-gallery-fallback/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `6dcb65dd4e9b2d80` | **Total Lines:** `183` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L23** | `<head>` | HTML DOM Section L3-L23 |
| `<div#simCapturedOverlay>` | `html_dom_section` | **L72 - L76** | `id="simCapturedOverlay"` | HTML DOM Section L72-L76 |
| `<div#simRadiusContainer>` | `html_dom_section` | **L118 - L129** | `id="simRadiusContainer"` | HTML DOM Section L118-L129 |

---

## File: `pipeline/PIPE-20261028-rename-special-request-button/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `fff085d68ac093ef` | **Total Lines:** `51` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L16** | `<head>` | HTML DOM Section L3-L16 |

---

## File: `pipeline/PIPE-20261028-reports-column-widths-and-gps-visibility/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `db54b71ffb8383ab` | **Total Lines:** `231` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L23** | `<head>` | HTML DOM Section L3-L23 |

---

## File: `pipeline/PIPE-20261028-smart-place-search-2s-debounce/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `c3fcf10e27d40aee` | **Total Lines:** `155` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L13** | `<head>` | HTML DOM Section L3-L13 |

---

## File: `pipeline/PIPE-20261028-soft-ui-sweetalert/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `a6aa87e487ecbae1` | **Total Lines:** `66` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L16** | `<head>` | HTML DOM Section L3-L16 |

---

## File: `pipeline/PIPE-20261028-special-modal-place-autocomplete/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `eac6a91bea2a8923` | **Total Lines:** `227` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L13** | `<head>` | HTML DOM Section L3-L13 |

---

## File: `pipeline/PIPE-20261029-fix-early-shift-ot-selection/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `15763143f369d55e` | **Total Lines:** `101` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261029-fix-reports-hierarchical-filter-crash/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `2e9c5df238828f9f` | **Total Lines:** `96` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L11** | `<head>` | HTML DOM Section L3-L11 |

---

## File: `pipeline/PIPE-20261029-hide-recorded-shifts/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `d2db77322f89efef` | **Total Lines:** `100` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261029-hide-recorded-shifts/qa_scenario_test.mjs`
- **Layer:** Application Module
- **Hash:** `0f4e1762abed9737` | **Total Lines:** `497` | **Imports:** `7` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `createMockElement` | `function` | **L18 - L55** | `(id, tagName = 'div') => inferred` | ----------------------------------------------------------------------------- |
| `scrollIntoView` | `public method` | **L52 - L52** | `() => any` | public method L52-L52 (1 lines) |
| `focus` | `public method` | **L53 - L53** | `() => any` | public method L53-L53 (1 lines) |
| `getOrCreateElement` | `function` | **L61 - L66** | `(id) => inferred` | Function L61-L66 |
| `test_evaluateTimeWindowAndPopulateShifts` | `public method` | **L106 - L106** | `() => any` | public method L106-L106 (1 lines) |
| `test_updateStatusCardsAndMainButton` | `public method` | **L107 - L107** | `() => any` | public method L107-L107 (1 lines) |
| `test_isShiftAlreadyRecordedToday` | `public method` | **L108 - L108** | `(s) => any` | public method L108-L108 (1 lines) |
| `test_isShiftActiveAtCurrentTime` | `public method` | **L109 - L109** | `(s, nowMin, allowStartMin) => any` | public method L109-L109 (1 lines) |
| `createControllerInstance` | `function` | **L147 - L175** | `(customSettings = {}) => inferred` | Function L147-L175 |

---

## File: `pipeline/PIPE-20261029-hide-recorded-shifts/temp_test_controller.mjs`
- **Layer:** Application Module
- **Hash:** `f26f80b75f18c80c` | **Total Lines:** `2499` | **Imports:** `5` | **Exports:** `CheckinController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `CheckinController` | `class` | **L12 - L2416** | `export class CheckinController` | Class Definition (2405 lines) |
| `CheckinController.constructor` | `public constructor` | **L13 - L45** | `() => any` | public constructor L13-L45 (33 lines) |
| `CheckinController.init` | `public async method` | **L47 - L88** | `() => Promise<any>` | public async method L47-L88 (42 lines) |
| `CheckinController.#applyDynamicWorkspaceLayout` | `private method` | **L90 - L130** | `() => any` | private method L90-L130 (41 lines) |
| `CheckinController.#updateThemeButtonUI` | `private method` | **L132 - L150** | `() => any` | private method L132-L150 (19 lines) |
| `CheckinController.#checkAndShowWelcomeToast` | `private method` | **L152 - L160** | `() => any` | private method L152-L160 (9 lines) |
| `CheckinController.#startLiveClock24` | `private method` | **L162 - L189** | `() => any` | private method L162-L189 (28 lines) |
| `updateClock` | `arrow_fn` | **L163 - L186** | `() => inferred` | Arrow Function L163-L186 |
| `CheckinController.#isShiftAlreadyRecordedToday` | `private method` | **L191 - L239** | `(shift) => any` | private method L191-L239 (49 lines) |
| `CheckinController.#isShiftActiveAtCurrentTime` | `private method` | **L241 - L276** | `(shift, nowMin, allowStartMin) => any` | private method L241-L276 (36 lines) |
| `CheckinController.#evaluateTimeWindowAndPopulateShifts` | `private method` | **L278 - L378** | `() => any` | private method L278-L378 (101 lines) |
| `CheckinController.#renderUserAndSettingsInfo` | `private method` | **L380 - L468** | `() => any` | private method L380-L468 (89 lines) |
| `setElText` | `arrow_fn` | **L385 - L388** | `(id, text) => inferred` | Arrow Function L385-L388 |
| `CheckinController.#refreshAllAttendanceData` | `private async method` | **L470 - L487** | `() => Promise<any>` | private async method L470-L487 (18 lines) |
| `CheckinController.#updateStatusCardsAndMainButton` | `private method` | **L489 - L773** | `() => any` | private method L489-L773 (285 lines) |
| `CheckinController.#renderPersonalAttendanceTabs` | `private method` | **L775 - L818** | `() => any` | private method L775-L818 (44 lines) |
| `CheckinController.#buildHistoryRowHtml` | `private method` | **L820 - L839** | `(item, rowNumber) => any` | private method L820-L839 (20 lines) |
| `CheckinController.#renderSpecialRequestsHistoryTable` | `private method` | **L841 - L883** | `() => any` | private method L841-L883 (43 lines) |
| `CheckinController.#checkCameraHardware` | `private async method` | **L885 - L899** | `() => Promise<any>` | private async method L885-L899 (15 lines) |
| `CheckinController.#handleFallbackFileSelected` | `private method` | **L901 - L958** | `(file) => any` | private method L901-L958 (58 lines) |
| `CheckinController.#stopCameraHardwareStream` | `private method` | **L960 - L971** | `() => any` | private method L960-L971 (12 lines) |
| `CheckinController.#stopCameraAndShowStandby` | `private method` | **L973 - L999** | `() => any` | private method L973-L999 (27 lines) |
| `CheckinController.#openCameraOnDemand` | `private async method` | **L1001 - L1070** | `() => Promise<any>` | private async method L1001-L1070 (70 lines) |
| `CheckinController.#capturePhotoAndStopStream` | `private method` | **L1072 - L1104** | `() => any` | private method L1072-L1104 (33 lines) |
| `CheckinController.#resetPageAfterSave` | `private async method` | **L1106 - L1114** | `() => Promise<any>` | private async method L1106-L1114 (9 lines) |
| `CheckinController.#initGpsLocation` | `private async method` | **L1122 - L1210** | `() => Promise<any>` | 3. หากยังไม่พบ จะดึง ซอย / ซอยย่อย -> แสดง ["ใกล้เคียง " + ชื่อซอย] |
| `CheckinController.#bindEvents` | `private method` | **L1212 - L1494** | `() => any` | private method L1212-L1494 (283 lines) |
| `openSpecialModal` | `arrow_fn` | **L1363 - L1366** | `() => inferred` | Arrow Function L1363-L1366 |
| `setDesktopActiveTab` | `arrow_fn` | **L1401 - L1420** | `(activeName) => inferred` | Arrow Function L1401-L1420 |
| `openMobileDrawer` | `arrow_fn` | **L1431 - L1448** | `() => inferred` | Arrow Function L1431-L1448 |
| `closeMobileDrawer` | `arrow_fn` | **L1450 - L1475** | `(targetTab = null) => inferred` | Arrow Function L1450-L1475 |
| `CheckinController.#handleMainCheckin` | `private async method` | **L1496 - L1838** | `() => Promise<any>` | private async method L1496-L1838 (343 lines) |
| `CheckinController.#openSpecialRequestModal` | `private method` | **L1840 - L1870** | `() => any` | private method L1840-L1870 (31 lines) |
| `CheckinController.#initSpecialModalGps` | `private method` | **L1872 - L1975** | `() => any` | private method L1872-L1975 (104 lines) |
| `updateCustomPinAndLocation` | `async_arrow_fn` | **L1884 - L1932** | `(lat, lng, flyTo = false, explicitName = null) => inferred` | Arrow Function L1884-L1932 |
| `setupMapIfAvailable` | `arrow_fn` | **L1934 - L1969** | `() => inferred` | Arrow Function L1934-L1969 |
| `getDistanceInMeters` | `arrow_fn` | **L1994 - L2013** | `(lat1, lon1, lat2, lon2) => inferred` | Arrow Function L1994-L2013 |
| `calculateDistance` | `arrow_fn` | **L2015 - L2024** | `(lat1, lon1, lat2, lon2) => inferred` | Arrow Function L2015-L2024 |
| `getCategoryLabel` | `arrow_fn` | **L2026 - L2065** | `(item) => inferred` | Arrow Function L2026-L2065 |
| `escapeHtml` | `arrow_fn` | **L2067 - L2075** | `(str) => inferred` | Arrow Function L2067-L2075 |
| `formatSubAddress` | `arrow_fn` | **L2077 - L2093** | `(item) => inferred` | Arrow Function L2077-L2093 |
| `getMainName` | `arrow_fn` | **L2095 - L2103** | `(item) => inferred` | Arrow Function L2095-L2103 |
| `hideSearchResults` | `arrow_fn` | **L2105 - L2110** | `() => inferred` | Arrow Function L2105-L2110 |
| `bindResultItemClicks` | `arrow_fn` | **L2112 - L2128** | `() => inferred` | Arrow Function L2112-L2128 |
| `renderCoordsResult` | `arrow_fn` | **L2130 - L2154** | `(lat, lng) => inferred` | Arrow Function L2130-L2154 |
| `renderPlaceResults` | `arrow_fn` | **L2156 - L2201** | `(items) => inferred` | Arrow Function L2156-L2201 |
| `performSearch` | `async_arrow_fn` | **L2206 - L2378** | `() => inferred` | Arrow Function L2206-L2378 |
| `#handleSubmitSpecialRequest` | `private async method` | **L2418 - L2493** | `(closeModalCallback) => Promise<any>` | private async method L2418-L2493 (76 lines) |
| `test_evaluateTimeWindowAndPopulateShifts` | `public method` | **L2495 - L2495** | `() => any` | QA TEST BRIDGES |
| `test_updateStatusCardsAndMainButton` | `public method` | **L2496 - L2496** | `() => any` | public method L2496-L2496 (1 lines) |
| `test_isShiftAlreadyRecordedToday` | `public method` | **L2497 - L2497** | `(s) => any` | public method L2497-L2497 (1 lines) |
| `test_isShiftActiveAtCurrentTime` | `public method` | **L2498 - L2498** | `(s, nowMin, allowStartMin) => any` | public method L2498-L2498 (1 lines) |

---

## File: `pipeline/PIPE-20261029-reports-hierarchical-filter-settings-cascade/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `93b0fc6a16aefec8` | **Total Lines:** `138` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L11** | `<head>` | HTML DOM Section L3-L11 |

---

## File: `pipeline/PIPE-20261029-reports-hierarchical-filter-settings-cascade/test_qa_assertions.mjs`
- **Layer:** Application Module
- **Hash:** `3c26ef7b1265e530` | **Total Lines:** `483` | **Imports:** `6` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `MockElement` | `class` | **L80 - L102** | `class MockElement` | Class Definition (23 lines) |
| `MockElement.constructor` | `public constructor` | **L81 - L88** | `(id) => any` | public constructor L81-L88 (8 lines) |
| `MockElement.addEventListener` | `public method` | **L90 - L93** | `(event, fn) => any` | public method L90-L93 (4 lines) |
| `MockElement.trigger` | `public method` | **L95 - L101** | `(event, eventObj = {}) => any` | public method L95-L101 (7 lines) |
| `ReportsControllerSimulation` | `class` | **L114 - L276** | `class ReportsControllerSimulation` | Mock controller logic matching ReportsController implementation |
| `ReportsControllerSimulation.constructor` | `public constructor` | **L115 - L128** | `(settings, personnel, records, role = 'SuperAdmin') => any` | public constructor L115-L128 (14 lines) |
| `ReportsControllerSimulation.initHierarchicalOrgFilter` | `public method` | **L130 - L159** | `() => any` | public method L130-L159 (30 lines) |
| `ReportsControllerSimulation.populateHierarchicalOrgFilter` | `public method` | **L161 - L182** | `() => any` | public method L161-L182 (22 lines) |
| `ReportsControllerSimulation.updateDivisionOptions` | `public method` | **L184 - L215** | `() => any` | public method L184-L215 (32 lines) |
| `ReportsControllerSimulation.updateWorkGroupOptions` | `public method` | **L217 - L249** | `() => any` | public method L217-L249 (33 lines) |
| `ReportsControllerSimulation.getFilteredRecords` | `public method` | **L251 - L263** | `() => any` | public method L251-L263 (13 lines) |
| `ReportsControllerSimulation.renderStatusTagFilterChips` | `public method` | **L265 - L271** | `() => any` | public method L265-L271 (7 lines) |
| `ReportsControllerSimulation.renderTables` | `public method` | **L273 - L275** | `() => any` | public method L273-L275 (3 lines) |

---

## File: `pipeline/PIPE-20261029-reports-hierarchical-org-filter/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `839c82bcb93ea6e0` | **Total Lines:** `150` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L13** | `<head>` | HTML DOM Section L3-L13 |

---

## File: `pipeline/PIPE-20261029-settings-early-shift-realtime-filter/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `087379600a9c9458` | **Total Lines:** `165` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L15** | `<head>` | HTML DOM Section L3-L15 |

---

## File: `pipeline/PIPE-20261029-update-manual-ot-early-window-coexistence/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `b2dd037ae0ae333f` | **Total Lines:** `87` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261029-update-system-manuals-and-critic/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `faf5a0c401959a83` | **Total Lines:** `121` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261029-users-hierarchical-filter-and-group-view/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `b9e8b167f13551cd` | **Total Lines:** `143` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L11** | `<head>` | HTML DOM Section L3-L11 |

---

## File: `pipeline/PIPE-20261029-users-hierarchical-filter-and-group-view/test_qa_users_filter.mjs`
- **Layer:** Application Module
- **Hash:** `4c7b9bd2149071f1` | **Total Lines:** `397` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `MockElement` | `class` | **L78 - L121** | `class MockElement` | Class Definition (44 lines) |
| `MockElement.constructor` | `public constructor` | **L79 - L102** | `(id, tagName = 'div') => any` | public constructor L79-L102 (24 lines) |
| `MockElement.addEventListener` | `public method` | **L103 - L106** | `(event, fn) => any` | public method L103-L106 (4 lines) |
| `MockElement.dispatchEvent` | `public method` | **L107 - L112** | `(event, payload = {}) => any` | public method L107-L112 (6 lines) |
| `MockElement.closest` | `public method` | **L113 - L115** | `(selector) => any` | public method L113-L115 (3 lines) |
| `MockElement.remove` | `public method` | **L116 - L120** | `() => any` | public method L116-L120 (5 lines) |
| `MockDocument` | `class` | **L123 - L159** | `class MockDocument` | Class Definition (37 lines) |
| `MockDocument.constructor` | `public constructor` | **L124 - L142** | `() => any` | public constructor L124-L142 (19 lines) |
| `MockDocument.getElementById` | `public method` | **L143 - L148** | `(id) => any` | public method L143-L148 (6 lines) |
| `MockDocument.querySelectorAll` | `public method` | **L149 - L157** | `(selector) => any` | public method L149-L157 (9 lines) |
| `MockDocument.addEventListener` | `public method` | **L158 - L158** | `() => any` | public method L158-L158 (1 lines) |

---

## File: `pipeline/PIPE-20261030-hide-none-position-level/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `0a426c2889e87496` | **Total Lines:** `356` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261030-hide-none-position-level/qa_position_format_test.mjs`
- **Layer:** Application Module
- **Hash:** `eb7e9ddf6cbefb7b` | **Total Lines:** `282` | **Imports:** `1` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L13 - L24** | `(description, actual, expected) => inferred` | Function L13-L24 |

---

## File: `pipeline/PIPE-20261104-fix-staging-table-relations/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `7d44056a9bdb417a` | **Total Lines:** `196` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L13** | `<head>` | HTML DOM Section L3-L13 |

---

## File: `pipeline/PIPE-20261104-lean-ai-workflow/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `bd26ac30913a5b32` | **Total Lines:** `164` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261104-loca-v2-onsite-offsite-nextstep/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `3aacfb4b78b96b32` | **Total Lines:** `134` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L13** | `<head>` | HTML DOM Section L3-L13 |

---

## File: `pipeline/PIPE-20261104-loca-v2-onsite-offsite-nextstep/qa_loca_v2_verification.mjs`
- **Layer:** Application Module
- **Hash:** `ad9ead718c9dee87` | **Total Lines:** `341` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L14 - L24** | `(description, isConditionMet, extraInfo = '') => inferred` | Function L14-L24 |
| `calculateHaversineMeters` | `function` | **L46 - L57** | `(lat1, lon1, lat2, lon2) => inferred` | Function L46-L57 |
| `evaluateOnsiteGeofence` | `function` | **L59 - L126** | `(currentLat, currentLng, officialLocations) => inferred` | Function L59-L126 |
| `formatSubmitRemark` | `function` | **L268 - L279** | `(locationMode, selectedChip, customInput) => inferred` | Function L268-L279 |
| `filterPersonnel` | `function` | **L300 - L313** | `(list, selBureau, selDivision, selWorkGroup) => inferred` | Function L300-L313 |

---

## File: `pipeline/PIPE-20261104-loca-v2-ux-zero-scroll-camera-fix/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `ef35adbb2d2d1565` | **Total Lines:** `609` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L32** | `<head>` | HTML DOM Section L3-L32 |
| `<div#simViewMapModal>` | `html_dom_section` | **L313 - L337** | `id="simViewMapModal"` | HTML DOM Section L313-L337 |
| `<div#simCameraModal>` | `html_dom_section` | **L340 - L360** | `id="simCameraModal"` | HTML DOM Section L340-L360 |
| `<div#simMapModal>` | `html_dom_section` | **L386 - L409** | `id="simMapModal"` | HTML DOM Section L386-L409 |

---

## File: `pipeline/PIPE-20261104-loca-v2-ux-zero-scroll-camera-fix/qa_zero_scroll_test.mjs`
- **Layer:** Application Module
- **Hash:** `ba0df63fd43f1d5b` | **Total Lines:** `260` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L13 - L23** | `(description, isConditionMet, extraInfo = '') => inferred` | Function L13-L23 |

---

## File: `pipeline/PIPE-20261105-loca-v2-3to4-zero-scroll/qa_3to4_zero_scroll_audit.mjs`
- **Layer:** Application Module
- **Hash:** `784e708257ad7745` | **Total Lines:** `246` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `test` | `function` | **L14 - L29** | `(name, assertionFn) => inferred` | Function L14-L29 |

---

## File: `pipeline/PIPE-20261105-loca-v2-cockpit-split-layout/qa_cockpit_split_test.mjs`
- **Layer:** Application Module
- **Hash:** `ed864983a4037a3c` | **Total Lines:** `327` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L20 - L29** | `(description, condition, extraInfo = '') => inferred` | Function L20-L29 |

---

## File: `pipeline/PIPE-20261105-loca-v2-gps-card-refine/qa_loca_v2_gps_card_refine_audit.mjs`
- **Layer:** Application Module
- **Hash:** `c6df485d154a960c` | **Total Lines:** `140` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `test` | `function` | **L15 - L29** | `(description, fn) => inferred` | Function L15-L29 |

---

## File: `pipeline/PIPE-20261105-loca-v2-gps-symmetry-compact/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `c82916fd7a05fc2e` | **Total Lines:** `352` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L44** | `<head>` | HTML DOM Section L3-L44 |
| `<main>` | `html_dom_section` | **L75 - L273** | `<main>` | HTML DOM Section L75-L273 |
| `<div#gpsSectionCard>` | `html_dom_section` | **L164 - L202** | `id="gpsSectionCard"` | HTML DOM Section L164-L202 |
| `<div#leafletMapContainer>` | `html_dom_section` | **L188 - L188** | `id="leafletMapContainer"` | HTML DOM Section L188-L188 |
| `<div#googleMapEmbedWrapper>` | `html_dom_section` | **L199 - L199** | `id="googleMapEmbedWrapper"` | HTML DOM Section L199-L199 |

---

## File: `pipeline/PIPE-20261105-loca-v2-gps-symmetry-compact/qa_gps_symmetry_test.mjs`
- **Layer:** Application Module
- **Hash:** `03d9d7ed698ed5e7` | **Total Lines:** `221` | **Imports:** `4` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L20 - L28** | `(condition, testName, details = '') => inferred` | Function L20-L28 |

---

## File: `pipeline/PIPE-20261105-loca-v2-material-tailwind-cards/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `87418c6c3d0fa5a8` | **Total Lines:** `697` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L56** | `<head>` | HTML DOM Section L3-L56 |
| `<main>` | `html_dom_section` | **L89 - L358** | `<main>` | HTML DOM Section L89-L358 |
| `<div#cardPreviewContainer>` | `html_dom_section` | **L212 - L214** | `id="cardPreviewContainer"` | HTML DOM Section L212-L214 |
| `<div#gpsSectionCard>` | `html_dom_section` | **L375 - L421** | `id="gpsSectionCard"` | HTML DOM Section L375-L421 |
| `<div#googleMapEmbedWrapper>` | `html_dom_section` | **L419 - L419** | `id="googleMapEmbedWrapper"` | HTML DOM Section L419-L419 |
| `<div#gpsSectionCard>` | `html_dom_section` | **L436 - L481** | `id="gpsSectionCard"` | HTML DOM Section L436-L481 |
| `<div#googleMapEmbedWrapper>` | `html_dom_section` | **L479 - L479** | `id="googleMapEmbedWrapper"` | HTML DOM Section L479-L479 |
| `<div#gpsSectionCard>` | `html_dom_section` | **L496 - L538** | `id="gpsSectionCard"` | HTML DOM Section L496-L538 |
| `<div#googleMapEmbedWrapper>` | `html_dom_section` | **L536 - L536** | `id="googleMapEmbedWrapper"` | HTML DOM Section L536-L536 |
| `<div#gpsSectionCard>` | `html_dom_section` | **L553 - L591** | `id="gpsSectionCard"` | HTML DOM Section L553-L591 |
| `<div#googleMapEmbedWrapper>` | `html_dom_section` | **L589 - L589** | `id="googleMapEmbedWrapper"` | HTML DOM Section L589-L589 |
| `<div#gpsSectionCard>` | `html_dom_section` | **L606 - L648** | `id="gpsSectionCard"` | HTML DOM Section L606-L648 |
| `<div#googleMapEmbedWrapper>` | `html_dom_section` | **L646 - L646** | `id="googleMapEmbedWrapper"` | HTML DOM Section L646-L646 |

---

## File: `pipeline/PIPE-20261105-loca-v2-material-tailwind-cards/qa_material_tailwind_test.mjs`
- **Layer:** Application Module
- **Hash:** `841b5ace65f0238a` | **Total Lines:** `151` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L17 - L26** | `(description, condition, extraInfo = '') => inferred` | Function L17-L26 |

---

## File: `pipeline/PIPE-20261105-loca-v2-polish/qa_loca_v2_polish_audit.mjs`
- **Layer:** Application Module
- **Hash:** `9067a4ef8530d0ed` | **Total Lines:** `99` | **Imports:** `1` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `test` | `function` | **L7 - L10** | `(name, pass, details = '') => inferred` | Function L7-L10 |

---

## File: `pipeline/PIPE-20261109-admin-realtime-differential-table-sync/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `eb7b4899bbe550d6` | **Total Lines:** `770` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L69** | `<head>` | HTML DOM Section L3-L69 |
| `<div#tabContent-personnel-modal>` | `html_dom_section` | **L480 - L532** | `id="tabContent-personnel-modal"` | HTML DOM Section L480-L532 |

---

## File: `pipeline/PIPE-20261109-admin-realtime-differential-table-sync/qa_cache_audit.mjs`
- **Layer:** Application Module
- **Hash:** `bf683afec1a72744` | **Total Lines:** `68` | **Imports:** `1` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261109-admin-realtime-differential-table-sync/qa_dom_diff_unit_test.mjs`
- **Layer:** Application Module
- **Hash:** `7cabe8b1b23895fa` | **Total Lines:** `217` | **Imports:** `1` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `MockClassList` | `class` | **L4 - L17** | `class MockClassList` | Mock DOM elements |
| `MockClassList.constructor` | `public constructor` | **L5 - L7** | `() => any` | public constructor L5-L7 (3 lines) |
| `MockClassList.add` | `public method` | **L8 - L10** | `(...names) => any` | public method L8-L10 (3 lines) |
| `MockClassList.remove` | `public method` | **L11 - L13** | `(...names) => any` | public method L11-L13 (3 lines) |
| `MockClassList.contains` | `public method` | **L14 - L16** | `(name) => any` | public method L14-L16 (3 lines) |
| `MockElement` | `class` | **L19 - L107** | `class MockElement` | Class Definition (89 lines) |
| `MockElement.constructor` | `public constructor` | **L20 - L30** | `(tagName) => any` | public constructor L20-L30 (11 lines) |
| `MockElement.setAttribute` | `public method` | **L32 - L34** | `(name, val) => any` | public method L32-L34 (3 lines) |
| `MockElement.getAttribute` | `public method` | **L36 - L38** | `(name) => any` | public method L36-L38 (3 lines) |
| `MockElement.appendChild` | `public method` | **L40 - L44** | `(child) => any` | public method L40-L44 (5 lines) |
| `MockElement.removeChild` | `public method` | **L46 - L53** | `(child) => any` | public method L46-L53 (8 lines) |
| `MockElement.remove` | `public method` | **L55 - L59** | `() => any` | public method L55-L59 (5 lines) |
| `MockElement.querySelectorAll` | `public method` | **L69 - L81** | `(selector) => any` | public method L69-L81 (13 lines) |
| `traverse` | `arrow_fn` | **L71 - L78** | `(node) => inferred` | Arrow Function L71-L78 |
| `MockElement.querySelector` | `public method` | **L83 - L85** | `(selector) => any` | public method L83-L85 (3 lines) |
| `MockElement.closest` | `public method` | **L87 - L94** | `(selector) => any` | public method L87-L94 (8 lines) |
| `MockElement.insertAdjacentHTML` | `public method` | **L96 - L106** | `(position, html) => any` | public method L96-L106 (11 lines) |
| `matches` | `function` | **L109 - L118** | `(el, selector) => inferred` | Function L109-L118 |

---

## File: `pipeline/PIPE-20261109-onsite-offsite-gps-refresh-and-custom-map-sync/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `38f23e696ded318b` | **Total Lines:** `497` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L38** | `<head>` | HTML DOM Section L3-L38 |
| `<div#simGpsCard>` | `html_dom_section` | **L171 - L201** | `id="simGpsCard"` | HTML DOM Section L171-L201 |
| `<div#simOnsiteGeofenceCard>` | `html_dom_section` | **L220 - L231** | `id="simOnsiteGeofenceCard"` | HTML DOM Section L220-L231 |
| `<div#simOffsiteSection>` | `html_dom_section` | **L234 - L264** | `id="simOffsiteSection"` | HTML DOM Section L234-L264 |

---

## File: `pipeline/PIPE-20261110-realtime-diff-sync-robustness-fix/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `859782ae5f8429e2` | **Total Lines:** `142` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L14** | `<head>` | HTML DOM Section L3-L14 |

---

## File: `pipeline/PIPE-20261110-realtime-diff-sync-robustness-fix/qa_cache_audit.mjs`
- **Layer:** Application Module
- **Hash:** `875a992ddf90dcf2` | **Total Lines:** `68` | **Imports:** `1` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-diff-sync-robustness-fix/qa_functional_robustness_test.mjs`
- **Layer:** Application Module
- **Hash:** `742111fb296344e2` | **Total Lines:** `284` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `StorageMock` | `class` | **L11 - L17** | `class StorageMock` | Class Definition (7 lines) |
| `StorageMock.constructor` | `public constructor` | **L12 - L12** | `() => any` | public constructor L12-L12 (1 lines) |
| `StorageMock.getItem` | `public method` | **L13 - L13** | `(k) => any` | public method L13-L13 (1 lines) |
| `StorageMock.setItem` | `public method` | **L14 - L14** | `(k, v) => any` | public method L14-L14 (1 lines) |
| `StorageMock.removeItem` | `public method` | **L15 - L15** | `(k) => any` | public method L15-L15 (1 lines) |
| `StorageMock.clear` | `public method` | **L16 - L16** | `() => any` | public method L16-L16 (1 lines) |

---

## File: `pipeline/PIPE-20261110-realtime-diff-sync-robustness-fix/scratch_patch_app_layout.mjs`
- **Layer:** Application Module
- **Hash:** `6a6d1a90b975d135` | **Total Lines:** `184` | **Imports:** `1` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-diff-sync-robustness-fix/scratch_patch_attendance_model.mjs`
- **Layer:** Application Module
- **Hash:** `5cf78dd64cf632d0` | **Total Lines:** `358` | **Imports:** `1` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-diff-sync-robustness-fix/scratch_patch_checkin.mjs`
- **Layer:** Application Module
- **Hash:** `098682ffc77649e3` | **Total Lines:** `134` | **Imports:** `1` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-diff-sync-robustness-fix/scratch_patch_dashboard.mjs`
- **Layer:** Application Module
- **Hash:** `6f0116dd21203e09` | **Total Lines:** `70` | **Imports:** `1` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-diff-sync-robustness-fix/scratch_patch_reports.mjs`
- **Layer:** Application Module
- **Hash:** `07ef5eeaf087acf9` | **Total Lines:** `121` | **Imports:** `1` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/inspect_staging_schema.mjs`
- **Layer:** Application Module
- **Hash:** `34578b11310ad8cc` | **Total Lines:** `133` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `queryPostgrest` | `async_function` | **L4 - L36** | `(path, schema = 'staging', options = {}) => inferred` | Function L4-L36 |
| `inspect` | `async_function` | **L38 - L130** | `() => inferred` | Function L38-L130 |

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `ab36a9c0cd2c55b6` | **Total Lines:** `224` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L14** | `<head>` | HTML DOM Section L3-L14 |

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/qa_cache_audit.mjs`
- **Layer:** Application Module
- **Hash:** `172da6c29bc306dc` | **Total Lines:** `74` | **Imports:** `1` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/qa_comprehensive_test.mjs`
- **Layer:** Application Module
- **Hash:** `d87d1929f093d2c1` | **Total Lines:** `124` | **Imports:** `2` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/qa_live_persistence_test.mjs`
- **Layer:** Application Module
- **Hash:** `ee29c199dd71d23c` | **Total Lines:** `100` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `StorageMock` | `class` | **L11 - L27** | `class StorageMock` | Mock localStorage and sessionStorage |
| `StorageMock.constructor` | `public constructor` | **L12 - L14** | `() => any` | public constructor L12-L14 (3 lines) |
| `StorageMock.getItem` | `public method` | **L15 - L17** | `(key) => any` | public method L15-L17 (3 lines) |
| `StorageMock.setItem` | `public method` | **L18 - L20** | `(key, val) => any` | public method L18-L20 (3 lines) |
| `StorageMock.removeItem` | `public method` | **L21 - L23** | `(key) => any` | public method L21-L23 (3 lines) |
| `StorageMock.clear` | `public method` | **L24 - L26** | `() => any` | public method L24-L26 (3 lines) |
| `runLivePersistenceTest` | `async_function` | **L46 - L94** | `() => inferred` | Function L46-L94 |

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/qa_rev2_verification_test.mjs`
- **Layer:** Application Module
- **Hash:** `5ceadf6f54684575` | **Total Lines:** `88` | **Imports:** `2` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_applayout_realtime_js.mjs`
- **Layer:** Application Module
- **Hash:** `654bccafd3c3fc9e` | **Total Lines:** `63` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `StorageMock` | `class` | **L8 - L14** | `class StorageMock` | Class Definition (7 lines) |
| `StorageMock.constructor` | `public constructor` | **L9 - L9** | `() => any` | public constructor L9-L9 (1 lines) |
| `StorageMock.getItem` | `public method` | **L10 - L10** | `(k) => any` | public method L10-L10 (1 lines) |
| `StorageMock.setItem` | `public method` | **L11 - L11** | `(k, v) => any` | public method L11-L11 (1 lines) |
| `StorageMock.removeItem` | `public method` | **L12 - L12** | `(k) => any` | public method L12-L12 (1 lines) |
| `StorageMock.clear` | `public method` | **L13 - L13** | `() => any` | public method L13-L13 (1 lines) |

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_broadcast_behavior.mjs`
- **Layer:** Application Module
- **Hash:** `f940ae6471ebbce7` | **Total Lines:** `63` | **Imports:** `2` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_daily_report_records.mjs`
- **Layer:** Application Module
- **Hash:** `665cb702462272f8` | **Total Lines:** `44` | **Imports:** `2` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_live_ws_trigger.mjs`
- **Layer:** Application Module
- **Hash:** `5ec5d12d8a3a4298` | **Total Lines:** `74` | **Imports:** `0` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_non_existent_table_sub.mjs`
- **Layer:** Application Module
- **Hash:** `bfcd14b107a75c1e` | **Total Lines:** `33` | **Imports:** `2` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_realtime_crud_live.mjs`
- **Layer:** Application Module
- **Hash:** `a5971a764c73d573` | **Total Lines:** `97` | **Imports:** `2` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_settings_checkin_flow.mjs`
- **Layer:** Application Module
- **Hash:** `43af9bc5286ec09a` | **Total Lines:** `28` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `StorageMock` | `class` | **L7 - L13** | `class StorageMock` | Class Definition (7 lines) |
| `StorageMock.constructor` | `public constructor` | **L8 - L8** | `() => any` | public constructor L8-L8 (1 lines) |
| `StorageMock.getItem` | `public method` | **L9 - L9** | `(k) => any` | public method L9-L9 (1 lines) |
| `StorageMock.setItem` | `public method` | **L10 - L10** | `(k, v) => any` | public method L10-L10 (1 lines) |
| `StorageMock.removeItem` | `public method` | **L11 - L11** | `(k) => any` | public method L11-L11 (1 lines) |
| `StorageMock.clear` | `public method` | **L12 - L12** | `() => any` | public method L12-L12 (1 lines) |

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_settings_columns.mjs`
- **Layer:** Application Module
- **Hash:** `62c84bd9c2f55431` | **Total Lines:** `19` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `testSettingsColumns` | `async_function` | **L4 - L16** | `() => inferred` | Function L4-L16 |

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_settings_watermark.mjs`
- **Layer:** Application Module
- **Hash:** `50927bd4091763b9` | **Total Lines:** `19` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `testSettingsWatermark` | `async_function` | **L4 - L16** | `() => inferred` | Function L4-L16 |

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_supabase_realtime_ws.mjs`
- **Layer:** Application Module
- **Hash:** `1d02d30f6bf46175` | **Total Lines:** `58` | **Imports:** `0` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_watermark_debug.mjs`
- **Layer:** Application Module
- **Hash:** `2f31d06487c2a984` | **Total Lines:** `41` | **Imports:** `2` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_watermark_live.mjs`
- **Layer:** Application Module
- **Hash:** `8b8ff6e6c281c1bd` | **Total Lines:** `47` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `verifyWatermark` | `async_function` | **L4 - L44** | `() => inferred` | Function L4-L44 |

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_watermark_query.mjs`
- **Layer:** Application Module
- **Hash:** `08a3d9167cf2c55e` | **Total Lines:** `19` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `testQuery` | `async_function` | **L4 - L16** | `() => inferred` | Function L4-L16 |

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_watermark_safe.mjs`
- **Layer:** Application Module
- **Hash:** `fa42408d36be917b` | **Total Lines:** `19` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `testQueryWithoutWorkMode` | `async_function` | **L4 - L16** | `() => inferred` | Function L4-L16 |

---

## File: `pipeline/PIPE-20261110-realtime-sync-expansion-and-settings-geofence/test_write_postgrest.mjs`
- **Layer:** Application Module
- **Hash:** `395d2623bcf39637` | **Total Lines:** `27` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `testWrite` | `async_function` | **L4 - L24** | `() => inferred` | Function L4-L24 |

---

## File: `reports.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `2dcafb7680c433f0` | **Total Lines:** `529` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L108** | `<head>` | HTML DOM Section L3-L108 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L112 - L112** | `id="bmaSidebarContainer"` | HTML DOM Section L112-L112 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L116 - L116** | `id="bmaTopbarContainer"` | HTML DOM Section L116-L116 |
| `<main>` | `html_dom_section` | **L118 - L275** | `<main>` | HTML DOM Section L118-L275 |
| `<div#reportMobileShortcutContainer>` | `html_dom_section` | **L120 - L120** | `id="reportMobileShortcutContainer"` | HTML DOM Section L120-L120 |
| `<div#statusTagsFilterContainer>` | `html_dom_section` | **L266 - L266** | `id="statusTagsFilterContainer"` | HTML DOM Section L266-L266 |
| `<div#reportTablesMasterContainer>` | `html_dom_section` | **L273 - L273** | `id="reportTablesMasterContainer"` | HTML DOM Section L273-L273 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L277 - L277** | `id="bmaFooterContainer"` | HTML DOM Section L277-L277 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L527 - L527** | `<script>` | Bootstrap script L527-L527 |

---

## File: `settings.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `a4c59c88086f9ea8` | **Total Lines:** `807` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L107** | `<head>` | HTML DOM Section L3-L107 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L111 - L111** | `id="bmaSidebarContainer"` | HTML DOM Section L111-L111 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L115 - L115** | `id="bmaTopbarContainer"` | HTML DOM Section L115-L115 |
| `<main>` | `html_dom_section` | **L117 - L721** | `<main>` | HTML DOM Section L117-L721 |
| `<div#prefixListContainer>` | `html_dom_section` | **L567 - L567** | `id="prefixListContainer"` | HTML DOM Section L567-L567 |
| `<div#remarkListContainer>` | `html_dom_section` | **L584 - L584** | `id="remarkListContainer"` | HTML DOM Section L584-L584 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L723 - L723** | `id="bmaFooterContainer"` | HTML DOM Section L723-L723 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L750 - L750** | `<script>` | Bootstrap script L750-L750 |

---

## File: `sql/alter_v2_3_1_schema.sql`
- **Layer:** Database Schema & Migration Layer (PostgreSQL/Supabase)
- **Hash:** `cec130340cfb009d` | **Total Lines:** `47` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ALTER public.system_settings (L8)` | `sql_alter` | **L8 - L14** | `ALTER TABLE public.system_settings` | Schema Alteration L8-L14 |
| `ALTER public.attendance_logs (L17)` | `sql_alter` | **L17 - L18** | `ALTER TABLE public.attendance_logs` | Schema Alteration L17-L18 |

---

## File: `sql/alter_v2_5_schema.sql`
- **Layer:** Database Schema & Migration Layer (PostgreSQL/Supabase)
- **Hash:** `ad6a27c3cc128360` | **Total Lines:** `12` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ALTER public.system_settings (L6)` | `sql_alter` | **L6 - L7** | `ALTER TABLE public.system_settings` | Schema Alteration L6-L7 |

---

## File: `sql/alter_v2_7_schema.sql`
- **Layer:** Database Schema & Migration Layer (PostgreSQL/Supabase)
- **Hash:** `3eb5f67402dcd0aa` | **Total Lines:** `17` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ALTER public.system_settings (L6)` | `sql_alter` | **L6 - L9** | `ALTER TABLE public.system_settings` | Schema Alteration L6-L9 |

---

## File: `sql/alter_v2_8_loca_v2_schema.sql`
- **Layer:** Database Schema & Migration Layer (PostgreSQL/Supabase)
- **Hash:** `26b7337735cdd7a0` | **Total Lines:** `78` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ALTER public.system_settings (L8)` | `sql_alter` | **L8 - L10** | `ALTER TABLE public.system_settings` | Schema Alteration L8-L10 |
| `ALTER public.system_settings (L12)` | `sql_alter` | **L12 - L13** | `ALTER TABLE public.system_settings` | Schema Alteration L12-L13 |
| `ALTER public.attendance_logs (L34)` | `sql_alter` | **L34 - L35** | `ALTER TABLE public.attendance_logs` | Schema Alteration L34-L35 |
| `ALTER public.attendance_logs (L37)` | `sql_alter` | **L37 - L38** | `ALTER TABLE public.attendance_logs` | Schema Alteration L37-L38 |
| `ALTER public.attendance_logs (L40)` | `sql_alter` | **L40 - L44** | `ALTER TABLE public.attendance_logs` | Schema Alteration L40-L44 |

---

## File: `sql/create_staging_schema.sql`
- **Layer:** Database Schema & Migration Layer (PostgreSQL/Supabase)
- **Hash:** `deb2664907929682` | **Total Lines:** `120` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `TABLE staging.system_settings` | `sql_table` | **L12 - L12** | `CREATE TABLE staging.system_settings` | DDL Table Definition L12-L12 |
| `TABLE staging.personnel` | `sql_table` | **L13 - L13** | `CREATE TABLE staging.personnel` | DDL Table Definition L13-L13 |
| `TABLE staging.user_accounts` | `sql_table` | **L14 - L14** | `CREATE TABLE staging.user_accounts` | DDL Table Definition L14-L14 |
| `TABLE staging.attendance_logs` | `sql_table` | **L15 - L15** | `CREATE TABLE staging.attendance_logs` | DDL Table Definition L15-L15 |
| `SEED staging.system_settings (L18)` | `sql_seed` | **L18 - L18** | `INSERT INTO staging.system_settings` | Seed Data Statement L18-L18 |
| `SEED staging.personnel (L19)` | `sql_seed` | **L19 - L19** | `INSERT INTO staging.personnel` | Seed Data Statement L19-L19 |
| `SEED staging.user_accounts (L20)` | `sql_seed` | **L20 - L20** | `INSERT INTO staging.user_accounts` | Seed Data Statement L20-L20 |
| `SEED staging.attendance_logs (L21)` | `sql_seed` | **L21 - L21** | `INSERT INTO staging.attendance_logs` | Seed Data Statement L21-L21 |
| `ALTER staging.system_settings (L24)` | `sql_alter` | **L24 - L26** | `ALTER TABLE staging.system_settings` | Schema Alteration L24-L26 |
| `ALTER staging.system_settings (L28)` | `sql_alter` | **L28 - L29** | `ALTER TABLE staging.system_settings` | Schema Alteration L28-L29 |
| `ALTER staging.attendance_logs (L50)` | `sql_alter` | **L50 - L51** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L50-L51 |
| `ALTER staging.attendance_logs (L53)` | `sql_alter` | **L53 - L54** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L53-L54 |
| `ALTER staging.attendance_logs (L56)` | `sql_alter` | **L56 - L60** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L56-L60 |
| `ALTER staging.system_settings (L63)` | `sql_alter` | **L63 - L63** | `ALTER TABLE staging.system_settings ENABLE ROW LEVEL SECURIT` | Schema Alteration L63-L63 |
| `ALTER staging.personnel (L64)` | `sql_alter` | **L64 - L64** | `ALTER TABLE staging.personnel ENABLE ROW LEVEL SECURITY;` | Schema Alteration L64-L64 |
| `ALTER staging.user_accounts (L65)` | `sql_alter` | **L65 - L65** | `ALTER TABLE staging.user_accounts ENABLE ROW LEVEL SECURITY;` | Schema Alteration L65-L65 |
| `ALTER staging.attendance_logs (L66)` | `sql_alter` | **L66 - L66** | `ALTER TABLE staging.attendance_logs ENABLE ROW LEVEL SECURIT` | Schema Alteration L66-L66 |
| `POLICY "staging_system_settings_all" ON staging.system_settings` | `sql_rls_policy` | **L70 - L70** | `ON staging.system_settings` | Supabase RLS Policy L70-L70 |
| `POLICY "staging_personnel_all" ON staging.personnel` | `sql_rls_policy` | **L73 - L73** | `ON staging.personnel` | Supabase RLS Policy L73-L73 |
| `POLICY "staging_user_accounts_all" ON staging.user_accounts` | `sql_rls_policy` | **L76 - L76** | `ON staging.user_accounts` | Supabase RLS Policy L76-L76 |
| `POLICY "staging_attendance_logs_all" ON staging.attendance_logs` | `sql_rls_policy` | **L79 - L79** | `ON staging.attendance_logs` | Supabase RLS Policy L79-L79 |

---

## File: `sql/fix_staging_foreign_keys.sql`
- **Layer:** Database Schema & Migration Layer (PostgreSQL/Supabase)
- **Hash:** `a30e70683a5f8c75` | **Total Lines:** `24` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ALTER staging.user_accounts (L1)` | `sql_alter` | **L1 - L2** | `ALTER TABLE staging.user_accounts` | Schema Alteration L1-L2 |
| `ALTER staging.user_accounts (L4)` | `sql_alter` | **L4 - L6** | `ALTER TABLE staging.user_accounts` | Schema Alteration L4-L6 |
| `ALTER staging.attendance_logs (L8)` | `sql_alter` | **L8 - L9** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L8-L9 |
| `ALTER staging.attendance_logs (L11)` | `sql_alter` | **L11 - L13** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L11-L13 |
| `ALTER staging.attendance_logs (L15)` | `sql_alter` | **L15 - L16** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L15-L16 |
| `ALTER staging.attendance_logs (L18)` | `sql_alter` | **L18 - L20** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L18-L20 |

---

## File: `sql/supabase_schema.sql`
- **Layer:** Database Schema & Migration Layer (PostgreSQL/Supabase)
- **Hash:** `5745065e21643d4a` | **Total Lines:** `184` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `TABLE public.system_settings` | `sql_table` | **L10 - L51** | `CREATE TABLE public.system_settings` | DDL Table Definition L10-L51 |
| `TABLE public.personnel` | `sql_table` | **L54 - L70** | `CREATE TABLE public.personnel` | DDL Table Definition L54-L70 |
| `TABLE public.user_accounts` | `sql_table` | **L73 - L90** | `CREATE TABLE public.user_accounts` | DDL Table Definition L73-L90 |
| `TABLE public.attendance_logs` | `sql_table` | **L93 - L118** | `CREATE TABLE public.attendance_logs` | DDL Table Definition L93-L118 |
| `ALTER public.system_settings (L129)` | `sql_alter` | **L129 - L129** | `ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY` | Schema Alteration L129-L129 |
| `ALTER public.personnel (L130)` | `sql_alter` | **L130 - L130** | `ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;` | Schema Alteration L130-L130 |
| `ALTER public.user_accounts (L131)` | `sql_alter` | **L131 - L131** | `ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;` | Schema Alteration L131-L131 |
| `ALTER public.attendance_logs (L132)` | `sql_alter` | **L132 - L132** | `ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY` | Schema Alteration L132-L132 |
| `POLICY "Allow full access to system_settings" ON public.system_settings` | `sql_rls_policy` | **L135 - L135** | `ON public.system_settings` | Supabase RLS Policy L135-L135 |
| `POLICY "Allow full access to personnel" ON public.personnel` | `sql_rls_policy` | **L138 - L138** | `ON public.personnel` | Supabase RLS Policy L138-L138 |
| `POLICY "Allow full access to user_accounts" ON public.user_accounts` | `sql_rls_policy` | **L141 - L141** | `ON public.user_accounts` | Supabase RLS Policy L141-L141 |
| `POLICY "Allow full access to attendance_logs" ON public.attendance_logs` | `sql_rls_policy` | **L144 - L144** | `ON public.attendance_logs` | Supabase RLS Policy L144-L144 |
| `SEED public.system_settings (L147)` | `sql_seed` | **L147 - L149** | `INSERT INTO public.system_settings` | Seed Data Statement L147-L149 |
| `SEED public.personnel (L159)` | `sql_seed` | **L159 - L161** | `INSERT INTO public.personnel` | Seed Data Statement L159-L161 |
| `SEED public.user_accounts (L163)` | `sql_seed` | **L163 - L164** | `INSERT INTO public.user_accounts` | Seed Data Statement L163-L164 |
| `SEED public.personnel (L168)` | `sql_seed` | **L168 - L170** | `INSERT INTO public.personnel` | Seed Data Statement L168-L170 |
| `SEED public.user_accounts (L172)` | `sql_seed` | **L172 - L173** | `INSERT INTO public.user_accounts` | Seed Data Statement L172-L173 |
| `SEED public.personnel (L177)` | `sql_seed` | **L177 - L179** | `INSERT INTO public.personnel` | Seed Data Statement L177-L179 |
| `SEED public.user_accounts (L181)` | `sql_seed` | **L181 - L182** | `INSERT INTO public.user_accounts` | Seed Data Statement L181-L182 |

---

## File: `users.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `5e1fb514d09409a8` | **Total Lines:** `424` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L108** | `<head>` | HTML DOM Section L3-L108 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L112 - L112** | `id="bmaSidebarContainer"` | HTML DOM Section L112-L112 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L116 - L116** | `id="bmaTopbarContainer"` | HTML DOM Section L116-L116 |
| `<main>` | `html_dom_section` | **L118 - L287** | `<main>` | HTML DOM Section L118-L287 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L289 - L289** | `id="bmaFooterContainer"` | HTML DOM Section L289-L289 |
| `<div#modalUserAccountForm>` | `html_dom_section` | **L295 - L420** | `id="modalUserAccountForm"` | HTML DOM Section L295-L420 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L422 - L422** | `<script>` | Bootstrap script L422-L422 |

---

