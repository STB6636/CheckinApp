# สารบัญไฟล์และฟังก์ชันของโปรเจกต์ (VS Code Automated File & Function Index)

- **อัปเดตล่าสุด (Last Indexed):** `2026-11-09T03:39:04.722Z`
- **จำนวนไฟล์ที่สแกนทั้งหมด (Total Files):** `93` | **จำนวนฟังก์ชัน/สัญลักษณ์ทั้งหมด (Total Symbols):** `651`
- **กฎการใช้งานสำหรับ AI (Token-Saving Rule):** ห้ามอ่านไฟล์ทั้งหมด ให้ดูช่วงบรรทัด `L_start - L_end` ในตารางด้านล่าง แล้วดึงเฉพาะช่วงบรรทัดที่ต้องการใช้งานเท่านั้น

---

## File: `approvals.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `8522d5e94fd54f77` | **Total Lines:** `124` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L17** | `<head>` | HTML DOM Section L3-L17 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L21 - L21** | `id="bmaSidebarContainer"` | HTML DOM Section L21-L21 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L25 - L25** | `id="bmaTopbarContainer"` | HTML DOM Section L25-L25 |
| `<main>` | `html_dom_section` | **L27 - L115** | `<main>` | HTML DOM Section L27-L115 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L117 - L117** | `id="bmaFooterContainer"` | HTML DOM Section L117-L117 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L122 - L122** | `<script>` | Bootstrap script L122-L122 |

---

## File: `assets/js/components/AppLayout.js`
- **Layer:** Shared UI Component Layer
- **Hash:** `8647c754d089efa7` | **Total Lines:** `836` | **Imports:** `6` | **Exports:** `AppLayout`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `AppLayout` | `class` | **L13 - L836** | `export class AppLayout` | Class Definition (824 lines) |
| `AppLayout.canViewUsersMenu` | `static public method` | **L59 - L66** | `(user) => any` | static public method L59-L66 (8 lines) |
| `AppLayout.initAdminLayout` | `static public async method` | **L68 - L127** | `({ activePage, pageTitle, pageSubtitle = '' }) => Promise<any>` | static public async method L68-L127 (60 lines) |
| `AppLayout.checkAndShowWelcomeToast` | `static public method` | **L129 - L138** | `(currentUser) => any` | static public method L129-L138 (10 lines) |
| `AppLayout.#updateActiveNavState` | `static private method` | **L140 - L176** | `(activePage, pageTitle, pageSubtitle) => any` | static private method L140-L176 (37 lines) |
| `AppLayout.renderMainSkeleton` | `static public method` | **L182 - L220** | `() => any` | static public method L182-L220 (39 lines) |
| `AppLayout.navigateAjaxPage` | `static public async method` | **L228 - L344** | `(targetFile, pushHistory = true) => Promise<any>` | static public async method L228-L344 (117 lines) |
| `AppLayout.#renderSidebar` | `static private method` | **L346 - L453** | `(currentUser, settings, activePage) => any` | static private method L346-L453 (108 lines) |
| `AppLayout.#renderTopbar` | `static private method` | **L455 - L511** | `(currentUser, settings, pageTitle, pageSubtitle) => any` | static private method L455-L511 (57 lines) |
| `AppLayout.#renderMobileBottomNav` | `static private method` | **L513 - L539** | `(currentUser, activePage) => any` | static private method L513-L539 (27 lines) |
| `AppLayout.getMobileShortcutGridHtml` | `static public method` | **L541 - L571** | `(currentUser) => any` | static public method L541-L571 (31 lines) |
| `AppLayout.#renderFooter` | `static private method` | **L573 - L592** | `(settings) => any` | static private method L573-L592 (20 lines) |
| `AppLayout.refreshNotificationBell` | `static public async method` | **L594 - L691** | `(currentUser) => Promise<any>` | static public async method L594-L691 (98 lines) |
| `AppLayout.initAdminRealtimeSync` | `static public method` | **L693 - L720** | `(currentUser) => any` | static public method L693-L720 (28 lines) |
| `AppLayout.#bindGlobalDelegatedEvents` | `static private method` | **L722 - L835** | `() => any` | static private method L722-L835 (114 lines) |

---

## File: `assets/js/controllers/ApprovalsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `20b9afa8b1a00e7a` | **Total Lines:** `303` | **Imports:** `3` | **Exports:** `ApprovalsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ApprovalsController` | `class` | **L10 - L299** | `export class ApprovalsController` | Class Definition (290 lines) |
| `ApprovalsController.constructor` | `public constructor` | **L11 - L17** | `() => any` | public constructor L11-L17 (7 lines) |
| `ApprovalsController.init` | `public async method` | **L19 - L31** | `() => Promise<any>` | public async method L19-L31 (13 lines) |
| `ApprovalsController.loadRequests` | `public async method` | **L33 - L50** | `() => Promise<any>` | public async method L33-L50 (18 lines) |
| `ApprovalsController.#updateBulkSelectionCount` | `private method` | **L52 - L62** | `() => any` | private method L52-L62 (11 lines) |
| `ApprovalsController.#renderGroupedApprovalsTable` | `private method` | **L69 - L133** | `() => any` | - 'group': สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน |
| `ApprovalsController.#buildRequestRowHtml` | `private method` | **L135 - L202** | `(req, indexNo) => any` | private method L135-L202 (68 lines) |
| `ApprovalsController.#bindEvents` | `private method` | **L204 - L264** | `() => any` | private method L204-L264 (61 lines) |
| `ApprovalsController.#processDecision` | `private async method` | **L266 - L298** | `(ids, decision) => Promise<any>` | private async method L266-L298 (33 lines) |

---

## File: `assets/js/controllers/CheckinController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `ced7a3f0ce7bfe06` | **Total Lines:** `3167` | **Imports:** `5` | **Exports:** `CheckinController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `CheckinController` | `class` | **L12 - L710** | `export class CheckinController` | Class Definition (699 lines) |
| `CheckinController.constructor` | `public constructor` | **L13 - L64** | `() => any` | public constructor L13-L64 (52 lines) |
| `CheckinController.init` | `public async method` | **L66 - L111** | `() => Promise<any>` | public async method L66-L111 (46 lines) |
| `CheckinController.#applyDynamicWorkspaceLayout` | `private method` | **L113 - L153** | `() => any` | private method L113-L153 (41 lines) |
| `CheckinController.#updateThemeButtonUI` | `private method` | **L155 - L173** | `() => any` | private method L155-L173 (19 lines) |
| `CheckinController.#checkAndShowWelcomeToast` | `private method` | **L175 - L183** | `() => any` | private method L175-L183 (9 lines) |
| `CheckinController.#startLiveClock24` | `private method` | **L185 - L212** | `() => any` | private method L185-L212 (28 lines) |
| `updateClock` | `arrow_fn` | **L186 - L209** | `() => inferred` | Arrow Function L186-L209 |
| `CheckinController.#isShiftAlreadyRecordedToday` | `private method` | **L214 - L262** | `(shift) => any` | private method L214-L262 (49 lines) |
| `CheckinController.#isShiftActiveAtCurrentTime` | `private method` | **L264 - L299** | `(shift, nowMin, allowStartMin) => any` | private method L264-L299 (36 lines) |
| `CheckinController.#evaluateTimeWindowAndPopulateShifts` | `private method` | **L301 - L410** | `() => any` | private method L301-L410 (110 lines) |
| `CheckinController.#calculateHaversineMeters` | `private method` | **L415 - L427** | `(lat1, lon1, lat2, lon2) => any` | คำนวณระยะทางแบบ Haversine (หน่วย: เมตร) |
| `CheckinController.evaluateOnsiteGeofence` | `public method` | **L435 - L504** | `(currentLat, currentLng) => any` | public method L435-L504 (70 lines) |
| `CheckinController.#renderGeofenceStatusUI` | `private method` | **L506 - L556** | `() => any` | private method L506-L556 (51 lines) |
| `CheckinController.#initLocaV2ModeAndChips` | `private method` | **L558 - L560** | `() => any` | private method L558-L560 (3 lines) |
| `CheckinController.#initModeSwitcher` | `private method` | **L562 - L652** | `() => any` | private method L562-L652 (91 lines) |
| `setActiveOffsiteGps` | `arrow_fn` | **L614 - L623** | `(source) => inferred` | Arrow Function L614-L623 |
| `CheckinController.#initViewGpsMapModal` | `private method` | **L654 - L661** | `() => any` | private method L654-L661 (8 lines) |
| `CheckinController.#openViewGpsMapModal` | `private method` | **L663 - L709** | `() => any` | private method L663-L709 (47 lines) |
| `#goToStep` | `private method` | **L712 - L777** | `(step) => any` | private method L712-L777 (66 lines) |
| `#updateStep1Validation` | `private method` | **L779 - L814** | `() => any` | private method L779-L814 (36 lines) |
| `#openOffsiteMapModal` | `private method` | **L816 - L877** | `() => any` | private method L816-L877 (62 lines) |
| `#updateOffsiteModalMarker` | `private async method` | **L880 - L916** | `(lat, lng, explicitName = null) => Promise<any>` | private async method L880-L916 (37 lines) |
| `#initOffsiteModalGps` | `private method` | **L918 - L1015** | `() => any` | private method L918-L1015 (98 lines) |
| `closeModal` | `arrow_fn` | **L927 - L933** | `() => inferred` | Arrow Function L927-L933 |
| `performSearch` | `async_arrow_fn` | **L974 - L1014** | `() => inferred` | Arrow Function L974-L1014 |
| `#renderUserAndSettingsInfo` | `private method` | **L1028 - L1117** | `() => any` | private method L1028-L1117 (90 lines) |
| `setElText` | `arrow_fn` | **L1033 - L1036** | `(id, text) => inferred` | Arrow Function L1033-L1036 |
| `#refreshAllAttendanceData` | `private async method` | **L1119 - L1136** | `() => Promise<any>` | private async method L1119-L1136 (18 lines) |
| `#updateStatusCardsAndMainButton` | `private method` | **L1138 - L1231** | `() => any` | private method L1138-L1231 (94 lines) |
| `#renderPersonalAttendanceTabs` | `private method` | **L1233 - L1276** | `() => any` | private method L1233-L1276 (44 lines) |
| `#buildHistoryRowHtml` | `private method` | **L1278 - L1297** | `(item, rowNumber) => any` | private method L1278-L1297 (20 lines) |
| `#renderSpecialRequestsHistoryTable` | `private method` | **L1299 - L1341** | `() => any` | private method L1299-L1341 (43 lines) |
| `#openFullscreenCamera` | `private async method` | **L1343 - L1389** | `() => Promise<any>` | private async method L1343-L1389 (47 lines) |
| `#captureAndCloseCamera` | `private method` | **L1391 - L1422** | `() => any` | private method L1391-L1422 (32 lines) |
| `#closeFullscreenCamera` | `private method` | **L1424 - L1427** | `() => any` | private method L1424-L1427 (4 lines) |
| `#checkCameraHardware` | `private async method` | **L1429 - L1443** | `() => Promise<any>` | private async method L1429-L1443 (15 lines) |
| `#handleFallbackFileSelected` | `private method` | **L1445 - L1509** | `(file) => any` | private method L1445-L1509 (65 lines) |
| `#stopCameraHardwareStream` | `private method` | **L1511 - L1522** | `() => any` | private method L1511-L1522 (12 lines) |
| `#stopCameraAndShowStandby` | `private method` | **L1524 - L1550** | `() => any` | private method L1524-L1550 (27 lines) |
| `#openCameraOnDemand` | `private async method` | **L1552 - L1621** | `() => Promise<any>` | private async method L1552-L1621 (70 lines) |
| `#capturePhotoAndStopStream` | `private method` | **L1623 - L1655** | `() => any` | private method L1623-L1655 (33 lines) |
| `#resetPageAfterSave` | `private async method` | **L1657 - L1672** | `() => Promise<any>` | private async method L1657-L1672 (16 lines) |
| `#initGpsLocation` | `private async method` | **L1680 - L1777** | `() => Promise<any>` | 3. หากยังไม่พบ จะดึง ซอย / ซอยย่อย -> แสดง ["ใกล้เคียง " + ชื่อซอย] |
| `#renderInlineGpsMap` | `private method` | **L1779 - L1845** | `(lat, lng) => any` | private method L1779-L1845 (67 lines) |
| `#bindEvents` | `private method` | **L1848 - L2142** | `() => any` | private method L1848-L2142 (295 lines) |
| `openSpecialModal` | `arrow_fn` | **L2011 - L2014** | `() => inferred` | Arrow Function L2011-L2014 |
| `setDesktopActiveTab` | `arrow_fn` | **L2049 - L2068** | `(activeName) => inferred` | Arrow Function L2049-L2068 |
| `openMobileDrawer` | `arrow_fn` | **L2079 - L2096** | `() => inferred` | Arrow Function L2079-L2096 |
| `closeMobileDrawer` | `arrow_fn` | **L2098 - L2123** | `(targetTab = null) => inferred` | Arrow Function L2098-L2123 |
| `#handleMainCheckin` | `private async method` | **L2144 - L2507** | `() => Promise<any>` | private async method L2144-L2507 (364 lines) |
| `#openSpecialRequestModal` | `private method` | **L2509 - L2539** | `() => any` | private method L2509-L2539 (31 lines) |
| `#initSpecialModalGps` | `private method` | **L2541 - L2644** | `() => any` | private method L2541-L2644 (104 lines) |
| `updateCustomPinAndLocation` | `async_arrow_fn` | **L2553 - L2601** | `(lat, lng, flyTo = false, explicitName = null) => inferred` | Arrow Function L2553-L2601 |
| `setupMapIfAvailable` | `arrow_fn` | **L2603 - L2638** | `() => inferred` | Arrow Function L2603-L2638 |
| `getDistanceInMeters` | `arrow_fn` | **L2663 - L2682** | `(lat1, lon1, lat2, lon2) => inferred` | Arrow Function L2663-L2682 |
| `calculateDistance` | `arrow_fn` | **L2684 - L2693** | `(lat1, lon1, lat2, lon2) => inferred` | Arrow Function L2684-L2693 |
| `getCategoryLabel` | `arrow_fn` | **L2695 - L2734** | `(item) => inferred` | Arrow Function L2695-L2734 |
| `escapeHtml` | `arrow_fn` | **L2736 - L2744** | `(str) => inferred` | Arrow Function L2736-L2744 |
| `formatSubAddress` | `arrow_fn` | **L2746 - L2762** | `(item) => inferred` | Arrow Function L2746-L2762 |
| `getMainName` | `arrow_fn` | **L2764 - L2772** | `(item) => inferred` | Arrow Function L2764-L2772 |
| `hideSearchResults` | `arrow_fn` | **L2774 - L2779** | `() => inferred` | Arrow Function L2774-L2779 |
| `bindResultItemClicks` | `arrow_fn` | **L2781 - L2797** | `() => inferred` | Arrow Function L2781-L2797 |
| `renderCoordsResult` | `arrow_fn` | **L2799 - L2823** | `(lat, lng) => inferred` | Arrow Function L2799-L2823 |
| `renderPlaceResults` | `arrow_fn` | **L2825 - L2870** | `(items) => inferred` | Arrow Function L2825-L2870 |
| `performSearch` | `async_arrow_fn` | **L2875 - L3047** | `() => inferred` | Arrow Function L2875-L3047 |
| `#handleSubmitSpecialRequest` | `private async method` | **L3087 - L3162** | `(closeModalCallback) => Promise<any>` | private async method L3087-L3162 (76 lines) |

---

## File: `assets/js/controllers/DashboardController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `fc02aac65b953258` | **Total Lines:** `292` | **Imports:** `5` | **Exports:** `DashboardController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `DashboardController` | `class` | **L12 - L283** | `export class DashboardController` | Class Definition (272 lines) |
| `DashboardController.constructor` | `public constructor` | **L13 - L21** | `() => any` | public constructor L13-L21 (9 lines) |
| `DashboardController.init` | `public async method` | **L23 - L48** | `() => Promise<any>` | public async method L23-L48 (26 lines) |
| `DashboardController.#bindEvents` | `private method` | **L50 - L100** | `() => any` | private method L50-L100 (51 lines) |
| `DashboardController.loadDashboardData` | `public async method` | **L102 - L128** | `() => Promise<any>` | public async method L102-L128 (27 lines) |
| `DashboardController.#renderAllVisuals` | `private method` | **L130 - L145** | `() => any` | private method L130-L145 (16 lines) |
| `DashboardController.#renderJewelToneStatCards` | `private method` | **L147 - L216** | `(metrics, colors) => any` | private method L147-L216 (70 lines) |
| `DashboardController.#renderTable` | `private method` | **L224 - L282** | `(colors) => any` | - จัดขนาดคอลัมน์ให้พอดีกับข้อมูล ไม่ให้ชื่อ-นามสกุลล้นหรือตกบรรทัด |

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
- **Hash:** `cc971968f8b10909` | **Total Lines:** `1617` | **Imports:** `4` | **Exports:** `PersonnelController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `PersonnelController` | `class` | **L11 - L1608** | `export class PersonnelController` | Class Definition (1598 lines) |
| `PersonnelController.constructor` | `public constructor` | **L12 - L28** | `() => any` | public constructor L12-L28 (17 lines) |
| `PersonnelController.init` | `public async method` | **L30 - L54** | `() => Promise<any>` | public async method L30-L54 (25 lines) |
| `PersonnelController.#initHierarchicalOrgFilter` | `private method` | **L56 - L85** | `() => any` | private method L56-L85 (30 lines) |
| `PersonnelController.#populateHierarchicalOrgFilter` | `private method` | **L87 - L104** | `() => any` | private method L87-L104 (18 lines) |
| `PersonnelController.#updateFilterDivisionOptions` | `private method` | **L106 - L138** | `() => any` | private method L106-L138 (33 lines) |
| `PersonnelController.#updateFilterWorkGroupOptions` | `private method` | **L140 - L170** | `() => any` | private method L140-L170 (31 lines) |
| `PersonnelController.#populateDropdownsFromSettings` | `private method` | **L172 - L201** | `() => any` | private method L172-L201 (30 lines) |
| `PersonnelController.#updatePositionSubDropdowns` | `private method` | **L203 - L221** | `(selectedType, selectedTitle = '', selectedLevel = '') => any` | private method L203-L221 (19 lines) |
| `PersonnelController.#updateAffiliationSubDropdowns` | `private method` | **L223 - L247** | `(selectedBureau, selectedDivision = '', selectedGroup = '') => any` | private method L223-L247 (25 lines) |
| `PersonnelController.loadPersonnelData` | `public async method` | **L249 - L263** | `() => Promise<any>` | public async method L249-L263 (15 lines) |
| `PersonnelController.#renderGroupedTable` | `private method` | **L265 - L329** | `() => any` | private method L265-L329 (65 lines) |
| `PersonnelController.#buildPersonRowHtml` | `private method` | **L331 - L387** | `(person, indexNo) => any` | private method L331-L387 (57 lines) |
| `PersonnelController.#openModal` | `private method` | **L389 - L428** | `(editPerson = null) => any` | private method L389-L428 (40 lines) |
| `PersonnelController.#closeModal` | `private method` | **L430 - L432** | `() => any` | private method L430-L432 (3 lines) |
| `PersonnelController.#bindEvents` | `private method` | **L434 - L706** | `() => any` | private method L434-L706 (273 lines) |
| `validateNationalIdInput` | `arrow_fn` | **L468 - L491** | `() => inferred` | Arrow Function L468-L491 |
| `PersonnelController.#openPersonnelResumeModal` | `private method` | **L712 - L841** | `(person) => any` | private method L712-L841 (130 lines) |
| `PersonnelController.#closePersonnelResumeModal` | `private method` | **L843 - L846** | `() => any` | private method L843-L846 (4 lines) |
| `PersonnelController.#handleSavePersonnel` | `private async method` | **L848 - L885** | `() => Promise<any>` | private async method L848-L885 (38 lines) |
| `PersonnelController.#handleQuickCreateAccount` | `private async method` | **L887 - L948** | `(personId) => Promise<any>` | private async method L887-L948 (62 lines) |
| `PersonnelController.#diceCoefficient` | `private method` | **L950 - L970** | `(str1, str2) => any` | private method L950-L970 (21 lines) |
| `PersonnelController.#findBestFuzzyMatch` | `private method` | **L972 - L988** | `(value, candidates, threshold = 0.5) => any` | private method L972-L988 (17 lines) |
| `PersonnelController.#openBulkImportModal` | `private method` | **L990 - L1024** | `(initialFile = null) => any` | private method L990-L1024 (35 lines) |
| `PersonnelController.#closeBulkImportModal` | `private method` | **L1026 - L1034** | `() => any` | private method L1026-L1034 (9 lines) |
| `PersonnelController.#processBulkImportFile` | `private async method` | **L1036 - L1110** | `(file) => Promise<any>` | private async method L1036-L1110 (75 lines) |
| `PersonnelController.#validateRowCascading` | `private method` | **L1117 - L1408** | `(row, changedField = null) => any` | private method L1117-L1408 (292 lines) |
| `PersonnelController.#revalidateRowCascading` | `private method` | **L1415 - L1421** | `(rIdx, changedField = null) => any` | private method L1415-L1421 (7 lines) |
| `PersonnelController.#renderBulkImportPreview` | `private method` | **L1423 - L1497** | `() => any` | private method L1423-L1497 (75 lines) |
| `renderCell` | `arrow_fn` | **L1446 - L1458** | `(field, cell) => inferred` | Arrow Function L1446-L1458 |
| `PersonnelController.#handleExecuteBulkImport` | `private async method` | **L1499 - L1587** | `() => Promise<any>` | private async method L1499-L1587 (89 lines) |
| `PersonnelController.#downloadMultiSheetTemplate` | `private async method` | **L1592 - L1607** | `() => Promise<any>` | ดาวน์โหลดไฟล์แม่แบบ Excel แบบหลายแผ่นงาน พร้อม Data Validation Dropdowns ด้วย ExcelJS |

---

## File: `assets/js/controllers/ReportsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `c891dd80bd19c66a` | **Total Lines:** `1219` | **Imports:** `7` | **Exports:** `ReportsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ReportsController` | `class` | **L14 - L1210** | `export class ReportsController` | Class Definition (1197 lines) |
| `ReportsController.constructor` | `public constructor` | **L15 - L29** | `() => any` | public constructor L15-L29 (15 lines) |
| `ReportsController.init` | `public async method` | **L31 - L72** | `() => Promise<any>` | public async method L31-L72 (42 lines) |
| `ReportsController.#initHierarchicalOrgFilter` | `private method` | **L74 - L109** | `() => any` | private method L74-L109 (36 lines) |
| `ReportsController.#getStatusColor` | `private method` | **L111 - L117** | `(statusKey) => any` | private method L111-L117 (7 lines) |
| `ReportsController.#renderStatusTagFilterChips` | `private method` | **L119 - L142** | `() => any` | private method L119-L142 (24 lines) |
| `ReportsController.#getFormattedReportDateSubtitle` | `private method` | **L144 - L153** | `() => any` | private method L144-L153 (10 lines) |
| `ReportsController.loadReportData` | `public async method` | **L155 - L202** | `() => Promise<any>` | public async method L155-L202 (48 lines) |
| `ReportsController.#populatePersonnelDropdown` | `private method` | **L204 - L213** | `() => any` | private method L204-L213 (10 lines) |
| `ReportsController.#populateHierarchicalOrgFilter` | `private method` | **L215 - L238** | `() => any` | private method L215-L238 (24 lines) |
| `ReportsController.#updateDivisionOptions` | `private method` | **L240 - L275** | `() => any` | private method L240-L275 (36 lines) |
| `ReportsController.#updateWorkGroupOptions` | `private method` | **L277 - L313** | `() => any` | private method L277-L313 (37 lines) |
| `ReportsController.#getFilteredRecords` | `private method` | **L315 - L327** | `() => any` | private method L315-L327 (13 lines) |
| `ReportsController.#formatGpsCoordinates` | `private method` | **L329 - L337** | `(lat, lng) => any` | private method L329-L337 (9 lines) |
| `ReportsController.#renderSeparateTablesBySelectedTags` | `private method` | **L339 - L407** | `(forPrintPdf = false) => any` | private method L339-L407 (69 lines) |
| `ReportsController.#renderSingleStatusTableHtml` | `private method` | **L409 - L537** | `(statusMeta, statusColor, tagRecords, daySubtitle, groupHeaderColor, forPrintPdf) => any` | private method L409-L537 (129 lines) |
| `ReportsController.#buildGroupedRowsForTag` | `private method` | **L539 - L591** | `(tagRecords, groupHeaderColor, forPrintPdf) => any` | private method L539-L591 (53 lines) |
| `ReportsController.#buildSingleRowHtml` | `private method` | **L593 - L692** | `(rec, indexNo, forPrintPdf) => any` | private method L593-L692 (100 lines) |
| `ReportsController.#openResumeProfileForSpecificRow` | `private method` | **L701 - L905** | `(rowUid) => any` | private method L701-L905 (205 lines) |
| `setupPhotoBox` | `arrow_fn` | **L770 - L813** | `(boxId, linkId, photo, fallbackMsg, isOut = false) => inferred` | Arrow Function L770-L813 |
| `setupGpsAndMap` | `arrow_fn` | **L852 - L882** | `(coordsId, linkId, iframeId, placeholderId, locNameId, lat, lng, locName, fallbackMsg) => inferred` | Arrow Function L852-L882 |
| `ReportsController.#closeResumeModal` | `private method` | **L907 - L917** | `() => any` | private method L907-L917 (11 lines) |
| `ReportsController.#openModal` | `private method` | **L919 - L951** | `(rec = null) => any` | private method L919-L951 (33 lines) |
| `ReportsController.#closeModal` | `private method` | **L953 - L955** | `() => any` | private method L953-L955 (3 lines) |
| `ReportsController.#bindEvents` | `private method` | **L957 - L1169** | `() => any` | private method L957-L1169 (213 lines) |
| `ReportsController.#handleSaveReportRecord` | `private async method` | **L1171 - L1209** | `() => Promise<any>` | private async method L1171-L1209 (39 lines) |

---

## File: `assets/js/controllers/SettingsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `97bbb2d43ec0dbe5` | **Total Lines:** `1483` | **Imports:** `4` | **Exports:** `SettingsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SettingsController` | `class` | **L11 - L1474** | `export class SettingsController` | Class Definition (1464 lines) |
| `SettingsController.constructor` | `public constructor` | **L12 - L17** | `() => any` | public constructor L12-L17 (6 lines) |
| `SettingsController.init` | `public async method` | **L19 - L37** | `() => Promise<any>` | public async method L19-L37 (19 lines) |
| `SettingsController.#renderAllSettings` | `private method` | **L39 - L166** | `() => any` | private method L39-L166 (128 lines) |
| `syncEarlyWindowVisibility` | `arrow_fn` | **L88 - L98** | `() => inferred` | Arrow Function L88-L98 |
| `syncRadiusVisibility` | `arrow_fn` | **L116 - L126** | `() => inferred` | Arrow Function L116-L126 |
| `SettingsController.#updateColorPreviewBadges` | `private method` | **L168 - L184** | `() => any` | private method L168-L184 (17 lines) |
| `SettingsController.#syncCheckinModeUI` | `private method` | **L189 - L220** | `(isSingleClick) => any` | ย่อข้อความป้าย Tag ให้เหลือแค่ "รูปแบบพิเศษ" หรือ "รูปแบบปกติ" เพื่อไม่ให้ล้นจอหรือเบียดข้อความในมือถือ |
| `SettingsController.#updateLogoPreview` | `private method` | **L222 - L230** | `(url) => any` | private method L222-L230 (9 lines) |
| `SettingsController.#buildSortButtonsHtml` | `private method` | **L232 - L245** | `(category, index, totalLength) => any` | private method L232-L245 (14 lines) |
| `SettingsController.#renderPrefixes` | `private method` | **L247 - L267** | `() => any` | private method L247-L267 (21 lines) |
| `SettingsController.#renderRemarks` | `private method` | **L269 - L289** | `() => any` | private method L269-L289 (21 lines) |
| `SettingsController.#renderShifts` | `private method` | **L291 - L343** | `() => any` | private method L291-L343 (53 lines) |
| `SettingsController.#renderPositions` | `private method` | **L345 - L366** | `() => any` | private method L345-L366 (22 lines) |
| `SettingsController.#renderAffiliations` | `private method` | **L368 - L390** | `() => any` | private method L368-L390 (23 lines) |
| `SettingsController.#renderOfficialLocations` | `private method` | **L392 - L456** | `() => any` | private method L392-L456 (65 lines) |
| `SettingsController.#openOfficialLocationModal` | `private method` | **L458 - L605** | `(editIndex = null) => any` | private method L458-L605 (148 lines) |
| `updateMapLink` | `arrow_fn` | **L597 - L602** | `() => inferred` | Arrow Function L597-L602 |
| `SettingsController.#collectMainAndColorFieldsIntoSettings` | `private method` | **L607 - L653** | `() => any` | private method L607-L653 (47 lines) |
| `SettingsController.#persistSettings` | `private async method` | **L655 - L678** | `(showToastAlert = true) => Promise<any>` | private async method L655-L678 (24 lines) |
| `SettingsController.#openModal` | `private method` | **L680 - L685** | `(title, bodyHtml, onSubmitCallback) => any` | private method L680-L685 (6 lines) |
| `SettingsController.#closeModal` | `private method` | **L687 - L690** | `() => any` | private method L687-L690 (4 lines) |
| `SettingsController.#buildMultiRowInputsHtml` | `private method` | **L692 - L711** | `(fieldLabel, placeholder) => any` | private method L692-L711 (20 lines) |
| `SettingsController.#bindDynamicMultiRowEvents` | `private method` | **L713 - L741** | `(placeholder = 'ระบุข้อมูล...') => any` | private method L713-L741 (29 lines) |
| `SettingsController.#getDynamicMultiRowValues` | `private method` | **L743 - L748** | `() => any` | private method L743-L748 (6 lines) |
| `SettingsController.#bindEvents` | `private method` | **L750 - L994** | `() => any` | private method L750-L994 (245 lines) |
| `SettingsController.#openShiftModal` | `private method` | **L996 - L1087** | `(editIndex = null) => any` | private method L996-L1087 (92 lines) |
| `checkOvernightAuto` | `arrow_fn` | **L1077 - L1084** | `() => inferred` | Arrow Function L1077-L1084 |
| `SettingsController.#openAddPositionStep1Modal` | `private method` | **L1089 - L1105** | `() => any` | private method L1089-L1105 (17 lines) |
| `SettingsController.#openAddPositionStep2Modal` | `private method` | **L1107 - L1150** | `() => any` | private method L1107-L1150 (44 lines) |
| `SettingsController.#openAddPositionStep3Modal` | `private method` | **L1152 - L1216** | `() => any` | private method L1152-L1216 (65 lines) |
| `SettingsController.#openEditSinglePositionModal` | `private method` | **L1218 - L1241** | `(editIndex) => any` | private method L1218-L1241 (24 lines) |
| `SettingsController.#openAddAffiliationStep1OrgModal` | `private method` | **L1243 - L1259** | `() => any` | private method L1243-L1259 (17 lines) |
| `SettingsController.#openAddAffiliationStep2BureauModal` | `private method` | **L1261 - L1299** | `() => any` | private method L1261-L1299 (39 lines) |
| `SettingsController.#openAddAffiliationStep3DivisionModal` | `private method` | **L1301 - L1357** | `() => any` | private method L1301-L1357 (57 lines) |
| `SettingsController.#openAddAffiliationStep4GroupModal` | `private method` | **L1359 - L1443** | `() => any` | private method L1359-L1443 (85 lines) |
| `SettingsController.#openEditSingleAffiliationModal` | `private method` | **L1445 - L1473** | `(editIndex) => any` | private method L1445-L1473 (29 lines) |

---

## File: `assets/js/controllers/UsersController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `9bf0499185d72382` | **Total Lines:** `777` | **Imports:** `5` | **Exports:** `UsersController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `UsersController` | `class` | **L12 - L768** | `export class UsersController` | Class Definition (757 lines) |
| `UsersController.constructor` | `public constructor` | **L13 - L29** | `() => any` | public constructor L13-L29 (17 lines) |
| `UsersController.init` | `public async method` | **L31 - L68** | `() => Promise<any>` | public async method L31-L68 (38 lines) |
| `UsersController.#initHierarchicalOrgFilter` | `private method` | **L70 - L102** | `() => any` | private method L70-L102 (33 lines) |
| `UsersController.#populateHierarchicalOrgFilter` | `private method` | **L104 - L125** | `() => any` | private method L104-L125 (22 lines) |
| `UsersController.#updateDivisionOptions` | `private method` | **L127 - L165** | `() => any` | private method L127-L165 (39 lines) |
| `UsersController.#updateWorkGroupOptions` | `private method` | **L167 - L209** | `() => any` | private method L167-L209 (43 lines) |
| `UsersController.#toggleManageColumnHeader` | `private method` | **L214 - L222** | `() => any` | ซ่อนหรือแสดงหัวคอลัมน์ "จัดการ" ในตารางตามสิทธิ์ของผู้ใช้งาน (index 5) |
| `UsersController.#populateScopeDropdowns` | `private method` | **L224 - L235** | `() => any` | private method L224-L235 (12 lines) |
| `UsersController.#updateScopeDivisionDropdown` | `private method` | **L237 - L250** | `(selectedBureau, selectedDivision = '') => any` | private method L237-L250 (14 lines) |
| `UsersController.loadUsersAndPersonnel` | `public async method` | **L252 - L278** | `() => Promise<any>` | public async method L252-L278 (27 lines) |
| `UsersController.#renderPersonnelSelectOptions` | `private method` | **L280 - L299** | `(filterText = '', selectedPersonnelId = '') => any` | private method L280-L299 (20 lines) |
| `UsersController.#getFilteredUsers` | `private method` | **L301 - L336** | `() => any` | private method L301-L336 (36 lines) |
| `UsersController.#buildUserRowHtml` | `private method` | **L338 - L377** | `(u, indexNo) => any` | private method L338-L377 (40 lines) |
| `UsersController.#renderUsersTable` | `private method` | **L379 - L486** | `() => any` | private method L379-L486 (108 lines) |
| `UsersController.#toggleAdminScopeUI` | `private method` | **L488 - L504** | `() => any` | private method L488-L504 (17 lines) |
| `UsersController.#openModal` | `private method` | **L506 - L561** | `(editUser = null) => any` | private method L506-L561 (56 lines) |
| `UsersController.#closeModal` | `private method` | **L563 - L565** | `() => any` | private method L563-L565 (3 lines) |
| `UsersController.#bindEvents` | `private method` | **L567 - L723** | `() => any` | private method L567-L723 (157 lines) |
| `handleTableActionClick` | `async_arrow_fn` | **L660 - L719** | `(e) => inferred` | Arrow Function L660-L719 |
| `UsersController.#handleSaveUserAccount` | `private async method` | **L725 - L767** | `() => Promise<any>` | private async method L725-L767 (43 lines) |

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
- **Hash:** `1e1ab805b0c3b9cd` | **Total Lines:** `99` | **Imports:** `0` | **Exports:** `Config`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `Config` | `class` | **L6 - L99** | `export class Config` | คลาสเก็บค่าคงที่ การตั้งค่าเชื่อมต่อ Supabase และค่ามาตรฐานของระบบ V2.7 |

---

## File: `assets/js/core/DatabaseService.js`
- **Layer:** Core Service & Infrastructure Layer
- **Hash:** `da27ea0229c0d165` | **Total Lines:** `100` | **Imports:** `1` | **Exports:** `DatabaseService`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `DatabaseService` | `class` | **L8 - L100** | `export class DatabaseService` | Class Definition (93 lines) |
| `DatabaseService.constructor` | `public constructor` | **L13 - L19** | `() => any` | public constructor L13-L19 (7 lines) |
| `DatabaseService.getInstance` | `static public method` | **L25 - L30** | `() => any` | static public method L25-L30 (6 lines) |
| `DatabaseService.#initClient` | `private method` | **L35 - L59** | `() => any` | เริ่มต้นสร้าง Supabase Client จาก Global Object window.supabase |
| `DatabaseService.checkConnection` | `public async method` | **L82 - L99** | `() => Promise<any>` | public async method L82-L99 (18 lines) |

---

## File: `assets/js/core/UIHelpers.js`
- **Layer:** Core Service & Infrastructure Layer
- **Hash:** `a2d28bc60b94846e` | **Total Lines:** `1195` | **Imports:** `1` | **Exports:** `UIHelpers`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `UIHelpers` | `class` | **L8 - L1195** | `export class UIHelpers` | Class Definition (1188 lines) |
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
| `UIHelpers.getCurrentTimeHHMM` | `static public method` | **L197 - L202** | `() => any` | static public method L197-L202 (6 lines) |
| `UIHelpers.formatPosition` | `static public method` | **L216 - L252** | `(title = '', level = '', positionType = '', fullFallback = '') => any` | static public method L216-L252 (37 lines) |
| `UIHelpers.capturePortrait3x4FromVideo` | `static public method` | **L254 - L288** | `(videoEl, canvasEl) => any` | static public method L254-L288 (35 lines) |
| `UIHelpers.verifyImageUrl` | `static public method` | **L290 - L348** | `(rawUrl) => any` | static public method L290-L348 (59 lines) |
| `UIHelpers.verifyGoogleDriveLink` | `static public async method` | **L350 - L392** | `(scriptUrl, folderId = '') => Promise<any>` | static public async method L350-L392 (43 lines) |
| `UIHelpers.uploadPhotoToGoogleDrive` | `static public async method` | **L394 - L458** | `(base64DataUrl, fileNamePrefix, settings) => Promise<any>` | static public async method L394-L458 (65 lines) |
| `UIHelpers.showLoading` | `static public method` | **L465 - L527** | `(message = 'กำลังประมวลผลข้อมูล กรุณารอสักครู่...') => any` | static public method L465-L527 (63 lines) |
| `UIHelpers.#updateProgressDOM` | `static private method` | **L529 - L536** | `(percent) => any` | static private method L529-L536 (8 lines) |
| `UIHelpers.hideLoading` | `static public method` | **L538 - L563** | `() => any` | static public method L538-L563 (26 lines) |
| `UIHelpers.renderTableSkeleton` | `static public method` | **L565 - L575** | `(rows = 5, cols = 6) => any` | static public method L565-L575 (11 lines) |
| `UIHelpers.alert` | `static public async method` | **L577 - L612** | `(title, text = '', icon = 'success') => Promise<any>` | static public async method L577-L612 (36 lines) |
| `UIHelpers.confirm` | `static public async method` | **L614 - L664** | `(title, text = '', confirmText = 'ยืนยัน', icon = 'warning', options = {}) => Promise<any>` | static public async method L614-L664 (51 lines) |
| `UIHelpers.validateThaiNationalId` | `static public method` | **L666 - L685** | `(id, strictCheckDigit = false) => any` | static public method L666-L685 (20 lines) |
| `UIHelpers.getLast6DigitsFromNationalId` | `static public method` | **L687 - L691** | `(nationalId) => any` | static public method L687-L691 (5 lines) |
| `UIHelpers.exportToExcelUTF8` | `static public method` | **L693 - L718** | `(dataRows, fileName = 'export_data', sheetName = 'Sheet1') => any` | static public method L693-L718 (26 lines) |
| `UIHelpers.exportMultiSheetExcel` | `static public method` | **L725 - L745** | `(sheets, fileName = 'export_data') => any` | static public method L725-L745 (21 lines) |
| `UIHelpers.exportTemplateWithValidationsExcel` | `static public async method` | **L754 - L1017** | `({ settings, templateRows, fileName = 'Template_นำเข้าบุคลากร_กทม' }) => Promise<any>` | static public async method L754-L1017 (264 lines) |
| `UIHelpers.parseExcelFileUTF8` | `static public method` | **L1019 - L1041** | `(file) => any` | static public method L1019-L1041 (23 lines) |
| `UIHelpers.printReportInNewTab` | `static public method` | **L1043 - L1194** | `({ title, subtitle, tableHtml, headerColor = '#007B3E' }) => any` | static public method L1043-L1194 (152 lines) |

---

## File: `assets/js/models/AttendanceModel.js`
- **Layer:** Data Model & Supabase Repository Layer
- **Hash:** `929bc437ac541091` | **Total Lines:** `1735` | **Imports:** `5` | **Exports:** `AttendanceModel`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `AttendanceModel` | `class` | **L12 - L1735** | `export class AttendanceModel` | Class Definition (1724 lines) |
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
| `AttendanceModel.submitCheckinOrCheckout` | `static public async method` | **L920 - L1285** | `(payload) => Promise<any>` | static public async method L920-L1285 (366 lines) |
| `AttendanceModel.submitSpecialRequest` | `static public async method` | **L1287 - L1373** | `(payload) => Promise<any>` | static public async method L1287-L1373 (87 lines) |
| `AttendanceModel.getSpecialRequests` | `static public async method` | **L1375 - L1415** | `(currentUser, statusFilter = 'pending') => Promise<any>` | static public async method L1375-L1415 (41 lines) |
| `AttendanceModel.processSpecialRequestsBulk` | `static public async method` | **L1417 - L1478** | `(logIds, decision, approverUserId) => Promise<any>` | static public async method L1417-L1478 (62 lines) |
| `AttendanceModel.getDatesBetween` | `static public method` | **L1480 - L1497** | `(startDate, endDate) => any` | static public method L1480-L1497 (18 lines) |
| `AttendanceModel.getReportRecordsByDateRange` | `static public async method` | **L1499 - L1558** | `(startDate, endDate, currentUser) => Promise<any>` | static public async method L1499-L1558 (60 lines) |
| `AttendanceModel.#formatReportRow` | `static private method` | **L1560 - L1601** | `(person, log, workDate, evalStatus) => any` | static private method L1560-L1601 (42 lines) |
| `AttendanceModel.getDailyReportRecords` | `static public async method` | **L1603 - L1605** | `(workDate, currentUser) => Promise<any>` | static public async method L1603-L1605 (3 lines) |
| `AttendanceModel.saveAdminAttendanceRecord` | `static public async method` | **L1607 - L1656** | `(payload) => Promise<any>` | static public async method L1607-L1656 (50 lines) |
| `AttendanceModel.deleteAttendanceRecord` | `static public async method` | **L1658 - L1669** | `(logId) => Promise<any>` | static public async method L1658-L1669 (12 lines) |
| `AttendanceModel.calculateDashboardMetrics` | `static public method` | **L1671 - L1734** | `(dailyRecords) => any` | static public method L1671-L1734 (64 lines) |

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
- **Hash:** `42d5907bbba41e73` | **Total Lines:** `374` | **Imports:** `3` | **Exports:** `SettingsModel`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SettingsModel` | `class` | **L10 - L374** | `export class SettingsModel` | Class Definition (365 lines) |
| `SettingsModel.formatShiftDisplayText` | `static public method` | **L17 - L37** | `(shift) => any` | static public method L17-L37 (21 lines) |
| `SettingsModel.getSettings` | `static public async method` | **L39 - L157** | `(forceRefresh = false) => Promise<any>` | static public async method L39-L157 (119 lines) |
| `SettingsModel.updateSettings` | `static public async method` | **L159 - L289** | `(payload) => Promise<any>` | static public async method L159-L289 (131 lines) |
| `SettingsModel.moveItemInArray` | `static public method` | **L291 - L300** | `(arr, fromIndex, direction) => any` | static public method L291-L300 (10 lines) |
| `SettingsModel.fileToDataUrl` | `static public method` | **L302 - L309** | `(file) => any` | static public method L302-L309 (8 lines) |
| `SettingsModel.getUniquePositionTypes` | `static public method` | **L311 - L314** | `(settings) => any` | static public method L311-L314 (4 lines) |
| `SettingsModel.getUniquePositionTitles` | `static public method` | **L316 - L322** | `(settings, filterType = '') => any` | static public method L316-L322 (7 lines) |
| `SettingsModel.getUniquePositionLevels` | `static public method` | **L324 - L333** | `(settings, filterType = '', filterTitle = '') => any` | static public method L324-L333 (10 lines) |
| `SettingsModel.getUniqueOrganizations` | `static public method` | **L335 - L339** | `(settings) => any` | static public method L335-L339 (5 lines) |
| `SettingsModel.getUniqueBureaus` | `static public method` | **L341 - L348** | `(settings, filterOrg = '') => any` | static public method L341-L348 (8 lines) |
| `SettingsModel.getUniqueDivisions` | `static public method` | **L350 - L359** | `(settings, filterBureau = '', filterOrg = '') => any` | static public method L350-L359 (10 lines) |
| `SettingsModel.getUniqueGroups` | `static public method` | **L361 - L373** | `(settings, filterBureau = '', filterDivision = '', filterOrg = '') => any` | static public method L361-L373 (13 lines) |

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

## File: `checkin.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `8c2bd8a12726923c` | **Total Lines:** `949` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L104** | `<head>` | HTML DOM Section L3-L104 |
| `<main>` | `html_dom_section` | **L185 - L580** | `<main>` | HTML DOM Section L185-L580 |
| `<div#checkinWorkspaceWrapper>` | `html_dom_section` | **L188 - L438** | `id="checkinWorkspaceWrapper"` | HTML DOM Section L188-L438 |
| `<div#photoPreviewCard>` | `html_dom_section` | **L231 - L252** | `id="photoPreviewCard"` | HTML DOM Section L231-L252 |
| `<div#gpsSectionCard>` | `html_dom_section` | **L255 - L293** | `id="gpsSectionCard"` | HTML DOM Section L255-L293 |
| `<div#googleMapEmbedWrapper>` | `html_dom_section` | **L290 - L290** | `id="googleMapEmbedWrapper"` | HTML DOM Section L290-L290 |
| `<div#onsiteGeofenceStatusCard>` | `html_dom_section` | **L314 - L325** | `id="onsiteGeofenceStatusCard"` | HTML DOM Section L314-L325 |
| `<div#offsiteLocationSection>` | `html_dom_section` | **L328 - L364** | `id="offsiteLocationSection"` | HTML DOM Section L328-L364 |
| `<div#offsiteRemarkChipsContainer>` | `html_dom_section` | **L360 - L360** | `id="offsiteRemarkChipsContainer"` | HTML DOM Section L360-L360 |
| `<div#checkinActionCard>` | `html_dom_section` | **L368 - L408** | `id="checkinActionCard"` | HTML DOM Section L368-L408 |
| `<div#shiftSelectorContainer>` | `html_dom_section` | **L378 - L383** | `id="shiftSelectorContainer"` | HTML DOM Section L378-L383 |
| `<div#mainCustomTimeContainer>` | `html_dom_section` | **L385 - L394** | `id="mainCustomTimeContainer"` | HTML DOM Section L385-L394 |
| `<div#checkinStep1Container>` | `html_dom_section` | **L420 - L420** | `id="checkinStep1Container"` | HTML DOM Section L420-L420 |
| `<div#checkinStep2Container>` | `html_dom_section` | **L421 - L421** | `id="checkinStep2Container"` | HTML DOM Section L421-L421 |
| `<div#rightColumnWrapper>` | `html_dom_section` | **L422 - L422** | `id="rightColumnWrapper"` | HTML DOM Section L422-L422 |
| `<div#cameraSectionCard>` | `html_dom_section` | **L426 - L426** | `id="cameraSectionCard"` | HTML DOM Section L426-L426 |
| `<div#cameraStandbyOverlay>` | `html_dom_section` | **L434 - L434** | `id="cameraStandbyOverlay"` | HTML DOM Section L434-L434 |
| `<div#desktopPanesContainer>` | `html_dom_section` | **L441 - L578** | `id="desktopPanesContainer"` | HTML DOM Section L441-L578 |
| `<div#desktopHistoryWrapper>` | `html_dom_section` | **L444 - L533** | `id="desktopHistoryWrapper"` | HTML DOM Section L444-L533 |
| `<div#todayHistoryTabPanel>` | `html_dom_section` | **L470 - L487** | `id="todayHistoryTabPanel"` | HTML DOM Section L470-L487 |
| `<div#pastHistoryTabPanel>` | `html_dom_section` | **L490 - L530** | `id="pastHistoryTabPanel"` | HTML DOM Section L490-L530 |
| `<div#desktopSpecialWrapper>` | `html_dom_section` | **L536 - L576** | `id="desktopSpecialWrapper"` | HTML DOM Section L536-L576 |
| `<div#mobileDrawerPanel>` | `html_dom_section` | **L588 - L678** | `id="mobileDrawerPanel"` | HTML DOM Section L588-L678 |
| `<div#spCustomTimeContainer>` | `html_dom_section` | **L711 - L720** | `id="spCustomTimeContainer"` | HTML DOM Section L711-L720 |
| `<div#spSearchWrapper>` | `html_dom_section` | **L762 - L768** | `id="spSearchWrapper"` | HTML DOM Section L762-L768 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L818 - L818** | `<script>` | Bootstrap script L818-L818 |

---

## File: `dashboard.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `cd1320ed523ea373` | **Total Lines:** `181` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L18** | `<head>` | HTML DOM Section L3-L18 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L22 - L22** | `id="bmaSidebarContainer"` | HTML DOM Section L22-L22 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L28 - L28** | `id="bmaTopbarContainer"` | HTML DOM Section L28-L28 |
| `<main>` | `html_dom_section` | **L31 - L170** | `<main>` | HTML DOM Section L31-L170 |
| `<div#mobileShortcutContainer>` | `html_dom_section` | **L34 - L34** | `id="mobileShortcutContainer"` | HTML DOM Section L34-L34 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L173 - L173** | `id="bmaFooterContainer"` | HTML DOM Section L173-L173 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L179 - L179** | `<script>` | Bootstrap script L179-L179 |

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
- **Hash:** `28f91152b5e46064` | **Total Lines:** `288` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L50** | `<head>` | HTML DOM Section L3-L50 |
| `<div#mobileOrgLogoWrapper>` | `html_dom_section` | **L75 - L75** | `id="mobileOrgLogoWrapper"` | HTML DOM Section L75-L75 |
| `<main>` | `html_dom_section` | **L82 - L193** | `<main>` | HTML DOM Section L82-L193 |
| `<div#orgLogoWrapper>` | `html_dom_section` | **L88 - L90** | `id="orgLogoWrapper"` | HTML DOM Section L88-L90 |
| `<form#loginForm>` | `html_dom_section` | **L102 - L190** | `id="loginForm"` | HTML DOM Section L102-L190 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L286 - L286** | `<script>` | Bootstrap script L286-L286 |

---

## File: `personnel.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `508361203348b019` | **Total Lines:** `585` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L19** | `<head>` | HTML DOM Section L3-L19 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L23 - L23** | `id="bmaSidebarContainer"` | HTML DOM Section L23-L23 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L27 - L27** | `id="bmaTopbarContainer"` | HTML DOM Section L27-L27 |
| `<main>` | `html_dom_section` | **L29 - L161** | `<main>` | HTML DOM Section L29-L161 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L163 - L163** | `id="bmaFooterContainer"` | HTML DOM Section L163-L163 |
| `<div#modalPersonnelForm>` | `html_dom_section` | **L169 - L280** | `id="modalPersonnelForm"` | HTML DOM Section L169-L280 |
| `<div#bulkImportPreviewContainer>` | `html_dom_section` | **L496 - L537** | `id="bulkImportPreviewContainer"` | HTML DOM Section L496-L537 |
| `<div#bulkImportProgressContainer>` | `html_dom_section` | **L557 - L565** | `id="bulkImportProgressContainer"` | HTML DOM Section L557-L565 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L583 - L583** | `<script>` | Bootstrap script L583-L583 |

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

## File: `reports.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `40a5b70622973aec` | **Total Lines:** `439` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L18** | `<head>` | HTML DOM Section L3-L18 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L22 - L22** | `id="bmaSidebarContainer"` | HTML DOM Section L22-L22 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L26 - L26** | `id="bmaTopbarContainer"` | HTML DOM Section L26-L26 |
| `<main>` | `html_dom_section` | **L28 - L185** | `<main>` | HTML DOM Section L28-L185 |
| `<div#reportMobileShortcutContainer>` | `html_dom_section` | **L30 - L30** | `id="reportMobileShortcutContainer"` | HTML DOM Section L30-L30 |
| `<div#statusTagsFilterContainer>` | `html_dom_section` | **L176 - L176** | `id="statusTagsFilterContainer"` | HTML DOM Section L176-L176 |
| `<div#reportTablesMasterContainer>` | `html_dom_section` | **L183 - L183** | `id="reportTablesMasterContainer"` | HTML DOM Section L183-L183 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L187 - L187** | `id="bmaFooterContainer"` | HTML DOM Section L187-L187 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L437 - L437** | `<script>` | Bootstrap script L437-L437 |

---

## File: `settings.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `bb65a58168734e72` | **Total Lines:** `688` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L17** | `<head>` | HTML DOM Section L3-L17 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L21 - L21** | `id="bmaSidebarContainer"` | HTML DOM Section L21-L21 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L25 - L25** | `id="bmaTopbarContainer"` | HTML DOM Section L25-L25 |
| `<main>` | `html_dom_section` | **L27 - L602** | `<main>` | HTML DOM Section L27-L602 |
| `<div#prefixListContainer>` | `html_dom_section` | **L448 - L448** | `id="prefixListContainer"` | HTML DOM Section L448-L448 |
| `<div#remarkListContainer>` | `html_dom_section` | **L465 - L465** | `id="remarkListContainer"` | HTML DOM Section L465-L465 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L604 - L604** | `id="bmaFooterContainer"` | HTML DOM Section L604-L604 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L631 - L631** | `<script>` | Bootstrap script L631-L631 |

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
- **Hash:** `5f0ec6cf762a97ee` | **Total Lines:** `36` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ALTER public.system_settings (L8)` | `sql_alter` | **L8 - L10** | `ALTER TABLE public.system_settings` | Schema Alteration L8-L10 |
| `ALTER public.attendance_logs (L24)` | `sql_alter` | **L24 - L25** | `ALTER TABLE public.attendance_logs` | Schema Alteration L24-L25 |
| `ALTER public.attendance_logs (L27)` | `sql_alter` | **L27 - L28** | `ALTER TABLE public.attendance_logs` | Schema Alteration L27-L28 |

---

## File: `sql/create_staging_schema.sql`
- **Layer:** Database Schema & Migration Layer (PostgreSQL/Supabase)
- **Hash:** `ecf30b62ffa075e5` | **Total Lines:** `78` | **Imports:** `0` | **Exports:** `None`

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
| `ALTER staging.attendance_logs (L40)` | `sql_alter` | **L40 - L41** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L40-L41 |
| `ALTER staging.attendance_logs (L43)` | `sql_alter` | **L43 - L44** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L43-L44 |
| `ALTER staging.system_settings (L47)` | `sql_alter` | **L47 - L47** | `ALTER TABLE staging.system_settings ENABLE ROW LEVEL SECURIT` | Schema Alteration L47-L47 |
| `ALTER staging.personnel (L48)` | `sql_alter` | **L48 - L48** | `ALTER TABLE staging.personnel ENABLE ROW LEVEL SECURITY;` | Schema Alteration L48-L48 |
| `ALTER staging.user_accounts (L49)` | `sql_alter` | **L49 - L49** | `ALTER TABLE staging.user_accounts ENABLE ROW LEVEL SECURITY;` | Schema Alteration L49-L49 |
| `ALTER staging.attendance_logs (L50)` | `sql_alter` | **L50 - L50** | `ALTER TABLE staging.attendance_logs ENABLE ROW LEVEL SECURIT` | Schema Alteration L50-L50 |
| `POLICY "staging_system_settings_all" ON staging.system_settings` | `sql_rls_policy` | **L54 - L54** | `ON staging.system_settings` | Supabase RLS Policy L54-L54 |
| `POLICY "staging_personnel_all" ON staging.personnel` | `sql_rls_policy` | **L57 - L57** | `ON staging.personnel` | Supabase RLS Policy L57-L57 |
| `POLICY "staging_user_accounts_all" ON staging.user_accounts` | `sql_rls_policy` | **L60 - L60** | `ON staging.user_accounts` | Supabase RLS Policy L60-L60 |
| `POLICY "staging_attendance_logs_all" ON staging.attendance_logs` | `sql_rls_policy` | **L63 - L63** | `ON staging.attendance_logs` | Supabase RLS Policy L63-L63 |

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
- **Hash:** `9b881b8d60224f72` | **Total Lines:** `334` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L18** | `<head>` | HTML DOM Section L3-L18 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L22 - L22** | `id="bmaSidebarContainer"` | HTML DOM Section L22-L22 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L26 - L26** | `id="bmaTopbarContainer"` | HTML DOM Section L26-L26 |
| `<main>` | `html_dom_section` | **L28 - L197** | `<main>` | HTML DOM Section L28-L197 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L199 - L199** | `id="bmaFooterContainer"` | HTML DOM Section L199-L199 |
| `<div#modalUserAccountForm>` | `html_dom_section` | **L205 - L330** | `id="modalUserAccountForm"` | HTML DOM Section L205-L330 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L332 - L332** | `<script>` | Bootstrap script L332-L332 |

---

