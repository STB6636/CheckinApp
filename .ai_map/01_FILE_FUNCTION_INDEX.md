# สารบัญไฟล์และฟังก์ชันของโปรเจกต์ (VS Code Automated File & Function Index)

- **อัปเดตล่าสุด (Last Indexed):** `2026-11-19T08:46:16.135Z`
- **จำนวนไฟล์ที่สแกนทั้งหมด (Total Files):** `190` | **จำนวนฟังก์ชัน/สัญลักษณ์ทั้งหมด (Total Symbols):** `1281`
- **กฎการใช้งานสำหรับ AI (Token-Saving Rule):** ห้ามอ่านไฟล์ทั้งหมด ให้ดูช่วงบรรทัด `L_start - L_end` ในตารางด้านล่าง แล้วดึงเฉพาะช่วงบรรทัดที่ต้องการใช้งานเท่านั้น

---

## File: `approvals.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `43c0968555d6d866` | **Total Lines:** `239` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L115** | `<head>` | HTML DOM Section L3-L115 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L119 - L119** | `id="bmaSidebarContainer"` | HTML DOM Section L119-L119 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L123 - L123** | `id="bmaTopbarContainer"` | HTML DOM Section L123-L123 |
| `<main>` | `html_dom_section` | **L125 - L230** | `<main>` | HTML DOM Section L125-L230 |
| `<div#approvalsCardsContainer>` | `html_dom_section` | **L202 - L202** | `id="approvalsCardsContainer"` | HTML DOM Section L202-L202 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L232 - L232** | `id="bmaFooterContainer"` | HTML DOM Section L232-L232 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L237 - L237** | `<script>` | Bootstrap script L237-L237 |

---

## File: `assets/js/components/AppLayout.js`
- **Layer:** Shared UI Component Layer
- **Hash:** `ea7c7e0929961365` | **Total Lines:** `1167` | **Imports:** `8` | **Exports:** `AppLayout`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `AppLayout` | `class` | **L15 - L1167** | `export class AppLayout` | Class Definition (1153 lines) |
| `AppLayout.canViewUsersMenu` | `static public method` | **L75 - L82** | `(user) => any` | static public method L75-L82 (8 lines) |
| `AppLayout.initAdminLayout` | `static public async method` | **L84 - L163** | `({ activePage, pageTitle, pageSubtitle = '' }) => Promise<any>` | static public async method L84-L163 (80 lines) |
| `AppLayout.checkAndShowWelcomeToast` | `static public method` | **L165 - L179** | `(currentUser) => any` | static public method L165-L179 (15 lines) |
| `AppLayout.#updateActiveNavState` | `static private method` | **L181 - L218** | `(activePage, pageTitle, pageSubtitle) => any` | static private method L181-L218 (38 lines) |
| `AppLayout.renderMainSkeleton` | `static public method` | **L224 - L262** | `() => any` | static public method L224-L262 (39 lines) |
| `AppLayout.navigateAjaxPage` | `static public async method` | **L270 - L387** | `(targetFile, pushHistory = true) => Promise<any>` | static public async method L270-L387 (118 lines) |
| `AppLayout.#renderSidebar` | `static private method` | **L389 - L504** | `(currentUser, settings, activePage) => any` | static private method L389-L504 (116 lines) |
| `AppLayout.#renderTopbar` | `static private method` | **L506 - L562** | `(currentUser, settings, pageTitle, pageSubtitle) => any` | static private method L506-L562 (57 lines) |
| `AppLayout.#renderMobileBottomNav` | `static private method` | **L564 - L600** | `(currentUser, activePage) => any` | static private method L564-L600 (37 lines) |
| `AppLayout.getMobileShortcutGridHtml` | `static public method` | **L602 - L633** | `(currentUser) => any` | static public method L602-L633 (32 lines) |
| `AppLayout.#renderFooter` | `static private method` | **L635 - L654** | `(settings) => any` | static private method L635-L654 (20 lines) |
| `AppLayout.refreshNotificationBell` | `static public async method` | **L656 - L896** | `(currentUser) => Promise<any>` | static public async method L656-L896 (241 lines) |
| `AppLayout.initAdminRealtimeSync` | `static public method` | **L898 - L1046** | `(currentUser) => any` | static public method L898-L1046 (149 lines) |
| `AppLayout.#bindGlobalDelegatedEvents` | `static private method` | **L1048 - L1166** | `() => any` | static private method L1048-L1166 (119 lines) |

---

## File: `assets/js/components/SystemUpdateModal.js`
- **Layer:** Shared UI Component Layer
- **Hash:** `4af5dd89ce3ec22b` | **Total Lines:** `843` | **Imports:** `0` | **Exports:** `SystemUpdateModal`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SystemUpdateModal` | `class` | **L8 - L842** | `export class SystemUpdateModal` | พร้อมระบบนับการรับทราบ 1 ครั้งต่อ 1 รอบประกาศ (bma_last_seen_announcement_id) ข้ามทั้งหน้า Login และ Session 7 วัน |
| `SystemUpdateModal.getCurrentAppBuild` | `static public method` | **L59 - L69** | `() => any` | static public method L59-L69 (11 lines) |
| `SystemUpdateModal.#escapeHtml` | `static private method` | **L76 - L84** | `(str) => any` | static private method L76-L84 (9 lines) |
| `SystemUpdateModal.sanitizeImageUrl` | `static public method` | **L91 - L104** | `(rawUrl) => any` | static public method L91-L104 (14 lines) |
| `SystemUpdateModal.getAnnouncementToken` | `static public method` | **L176 - L186** | `(settings) => any` | static public method L176-L186 (11 lines) |
| `SystemUpdateModal.formatAnnouncementBodyHtml` | `static public method` | **L194 - L238** | `(rawBody) => any` | static public method L194-L238 (45 lines) |
| `SystemUpdateModal.#resolveVersionUrl` | `static private method` | **L244 - L252** | `() => any` | static private method L244-L252 (9 lines) |
| `SystemUpdateModal.#injectStyles` | `static private method` | **L257 - L289** | `() => any` | ติดตั้ง CSS Animations และสไตล์ที่จำเป็นแบบ Self-contained |
| `SystemUpdateModal.init` | `static public async method` | **L297 - L312** | `(options = {}) => Promise<any>` | static public async method L297-L312 (16 lines) |
| `SystemUpdateModal.initWithAnnouncement` | `static public async method` | **L320 - L327** | `(settings, options = {}) => Promise<any>` | static public async method L320-L327 (8 lines) |
| `SystemUpdateModal.fetchVersionData` | `static public async method` | **L333 - L368** | `() => Promise<any>` | static public async method L333-L368 (36 lines) |
| `SystemUpdateModal.renderBadge` | `static public method` | **L375 - L414** | `(targetSlotSelector = '#loginVersionBadgeSlot') => any` | static public method L375-L414 (40 lines) |
| `SystemUpdateModal.checkAndShowAuto` | `static public method` | **L419 - L424** | `() => any` | (Retired version.json auto-popup) ตรวจสอบประกาศระบบจากฐานข้อมูลแทนหากมี |
| `SystemUpdateModal.checkAndShowAnnouncement` | `static public method` | **L431 - L451** | `(settings) => any` | static public method L431-L451 (21 lines) |
| `SystemUpdateModal.showAnnouncement` | `static public method` | **L459 - L611** | `(settings, { isPreview = false } = {}) => any` | static public method L459-L611 (153 lines) |
| `SystemUpdateModal.#bindModalCloseHandlers` | `static private method` | **L617 - L649** | `(modalDiv) => any` | static private method L617-L649 (33 lines) |
| `SystemUpdateModal.show` | `static public method` | **L654 - L789** | `() => any` | เปิดหน้าต่างสรุปข้อมูลเวอร์ชันปัจจุบัน (เรียกเมื่อกด Badge เวอร์ชันในกรณีที่ไม่มีประกาศเปิดใช้งาน) |
| `SystemUpdateModal.open` | `static public method` | **L794 - L796** | `() => any` | Alias for show() |
| `SystemUpdateModal.close` | `static public method` | **L802 - L833** | `(saveAcknowledge = true) => any` | static public method L802-L833 (32 lines) |
| `SystemUpdateModal.getVersionData` | `static public method` | **L839 - L841** | `() => any` | static public method L839-L841 (3 lines) |

---

## File: `assets/js/controllers/ApprovalsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `1a7b670ddbd9548c` | **Total Lines:** `771` | **Imports:** `4` | **Exports:** `ApprovalsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ApprovalsController` | `class` | **L11 - L762** | `export class ApprovalsController` | Class Definition (752 lines) |
| `ApprovalsController.constructor` | `public constructor` | **L12 - L18** | `() => any` | public constructor L12-L18 (7 lines) |
| `ApprovalsController.init` | `public async method` | **L20 - L32** | `() => Promise<any>` | public async method L20-L32 (13 lines) |
| `ApprovalsController.loadRequests` | `public async method` | **L34 - L73** | `() => Promise<any>` | public async method L34-L73 (40 lines) |
| `ApprovalsController.#updatePendingCountBadge` | `private method` | **L75 - L80** | `(pendingCount) => any` | private method L75-L80 (6 lines) |
| `ApprovalsController.#renderMobileCardsSkeleton` | `private method` | **L82 - L91** | `(count = 3) => any` | private method L82-L91 (10 lines) |
| `ApprovalsController.#updateBulkSelectionCount` | `private method` | **L93 - L116** | `() => any` | private method L93-L116 (24 lines) |
| `ApprovalsController.#renderGroupedApprovalsTable` | `private method` | **L123 - L208** | `() => any` | - 'group': สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน |
| `ApprovalsController.#buildRequestRowHtml` | `private method` | **L210 - L294** | `(req, indexNo) => any` | private method L210-L294 (85 lines) |
| `ApprovalsController.#escapeHtml` | `private method` | **L296 - L304** | `(str) => any` | private method L296-L304 (9 lines) |
| `ApprovalsController.#formatRemarkCellHtml` | `private method` | **L306 - L447** | `(req, isOffsite) => any` | private method L306-L447 (142 lines) |
| `ApprovalsController.#buildRequestCardHtml` | `private method` | **L449 - L544** | `(req, indexNo) => any` | private method L449-L544 (96 lines) |
| `ApprovalsController.syncRequestsSilent` | `public async method` | **L546 - L652** | `(deltaDetail = null) => Promise<any>` | public async method L546-L652 (107 lines) |
| `ApprovalsController.#bindEvents` | `private method` | **L654 - L727** | `() => any` | private method L654-L727 (74 lines) |
| `handleSelectAllChange` | `arrow_fn` | **L669 - L681** | `(e) => inferred` | เลือกทั้งหมด (ซิงก์ 2 ทาง Desktop & Mobile) |
| `handleRowCheckChange` | `arrow_fn` | **L686 - L699** | `(e) => inferred` | เลือกรายแถว/ราย์การ์ดและกดปุ่มอนุมัติเดี่ยว |
| `handleActionClick` | `async_arrow_fn` | **L701 - L712** | `(e) => inferred` | Arrow Function L701-L712 |
| `ApprovalsController.#processDecision` | `private async method` | **L729 - L761** | `(ids, decision) => Promise<any>` | private async method L729-L761 (33 lines) |

---

## File: `assets/js/controllers/CheckinController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `049f44120e9d0a96` | **Total Lines:** `5143` | **Imports:** `7` | **Exports:** `CheckinController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `CheckinController` | `class` | **L14 - L925** | `export class CheckinController` | Class Definition (912 lines) |
| `CheckinController.constructor` | `public constructor` | **L15 - L76** | `() => any` | public constructor L15-L76 (62 lines) |
| `CheckinController.init` | `public async method` | **L78 - L157** | `() => Promise<any>` | public async method L78-L157 (80 lines) |
| `CheckinController.#initRealtimeSettingsListener` | `private method` | **L159 - L221** | `() => any` | private method L159-L221 (63 lines) |
| `triggerDebouncedPersonalSync` | `arrow_fn` | **L166 - L174** | `(payload) => inferred` | Arrow Function L166-L174 |
| `CheckinController.#syncPersonalAttendanceSilent` | `private async method` | **L223 - L229** | `() => Promise<any>` | private async method L223-L229 (7 lines) |
| `CheckinController.#syncSettingsHotReload` | `private async method` | **L231 - L252** | `() => Promise<any>` | private async method L231-L252 (22 lines) |
| `CheckinController.#applySettingsHotReload` | `private method` | **L254 - L280** | `(newSettings) => any` | private method L254-L280 (27 lines) |
| `CheckinController.#applyDynamicWorkspaceLayout` | `private method` | **L282 - L313** | `() => any` | private method L282-L313 (32 lines) |
| `CheckinController.#updateThemeButtonUI` | `private method` | **L315 - L333** | `() => any` | private method L315-L333 (19 lines) |
| `CheckinController.#checkAndShowWelcomeToast` | `private method` | **L335 - L349** | `() => any` | private method L335-L349 (15 lines) |
| `CheckinController.#startLiveClock24` | `private method` | **L351 - L377** | `() => any` | private method L351-L377 (27 lines) |
| `updateClock` | `arrow_fn` | **L352 - L374** | `() => inferred` | Arrow Function L352-L374 |
| `CheckinController.#isShiftAlreadyRecordedToday` | `private method` | **L379 - L427** | `(shift) => any` | private method L379-L427 (49 lines) |
| `CheckinController.#isShiftActiveAtCurrentTime` | `private method` | **L429 - L464** | `(shift, nowMin, allowStartMin) => any` | private method L429-L464 (36 lines) |
| `CheckinController.#evaluateTimeWindowAndPopulateShifts` | `private method` | **L466 - L570** | `() => any` | private method L466-L570 (105 lines) |
| `CheckinController.#calculateHaversineMeters` | `private method` | **L575 - L587** | `(lat1, lon1, lat2, lon2) => any` | คำนวณระยะทางแบบ Haversine (หน่วย: เมตร) |
| `CheckinController.evaluateOnsiteGeofence` | `public method` | **L595 - L676** | `(currentLat, currentLng) => any` | public method L595-L676 (82 lines) |
| `CheckinController.#renderGeofenceStatusUI` | `private method` | **L678 - L748** | `() => any` | private method L678-L748 (71 lines) |
| `CheckinController.#initLocaV2ModeAndChips` | `private method` | **L750 - L752** | `() => any` | private method L750-L752 (3 lines) |
| `CheckinController.#initModeSwitcher` | `private method` | **L754 - L864** | `() => any` | private method L754-L864 (111 lines) |
| `setActiveOffsiteGps` | `arrow_fn` | **L761 - L770** | `(source) => inferred` | Arrow Function L761-L770 |
| `CheckinController.#initViewGpsMapModal` | `private method` | **L866 - L875** | `() => any` | private method L866-L875 (10 lines) |
| `closeViewGpsMapModal` | `arrow_fn` | **L868 - L871** | `() => inferred` | Arrow Function L868-L871 |
| `CheckinController.#openViewGpsMapModal` | `private method` | **L877 - L924** | `() => any` | private method L877-L924 (48 lines) |
| `#goToStep` | `private method` | **L927 - L992** | `(step) => any` | private method L927-L992 (66 lines) |
| `#updateStep1Validation` | `private method` | **L994 - L1029** | `() => any` | private method L994-L1029 (36 lines) |
| `#openOffsiteMapModal` | `private method` | **L1031 - L1127** | `() => any` | private method L1031-L1127 (97 lines) |
| `#updateOffsiteModalMarker` | `private async method` | **L1130 - L1190** | `(lat, lng, explicitName = null, extent = null) => Promise<any>` | private async method L1130-L1190 (61 lines) |
| `#initOffsiteModalGps` | `private method` | **L1192 - L1420** | `() => any` | private method L1192-L1420 (229 lines) |
| `escapeHtml` | `arrow_fn` | **L1201 - L1209** | `(str) => inferred` | Arrow Function L1201-L1209 |
| `hideSearchResults` | `arrow_fn` | **L1211 - L1216** | `() => inferred` | Arrow Function L1211-L1216 |
| `closeModal` | `arrow_fn` | **L1218 - L1222** | `() => inferred` | Arrow Function L1218-L1222 |
| `performSearch` | `async_arrow_fn` | **L1271 - L1385** | `() => inferred` | Arrow Function L1271-L1385 |
| `#renderUserAndSettingsInfo` | `private method` | **L1424 - L1569** | `() => any` | private method L1424-L1569 (146 lines) |
| `setElText` | `arrow_fn` | **L1429 - L1432** | `(id, text) => inferred` | Arrow Function L1429-L1432 |
| `#refreshAllAttendanceData` | `private async method` | **L1571 - L1592** | `() => Promise<any>` | private async method L1571-L1592 (22 lines) |
| `#updateStatusCardsAndMainButton` | `private method` | **L1594 - L1878** | `() => any` | private method L1594-L1878 (285 lines) |
| `applyGpsSearchingLock` | `arrow_fn` | **L1621 - L1631** | `() => inferred` | Arrow Function L1621-L1631 |
| `setShiftCardVisibility` | `arrow_fn` | **L1633 - L1642** | `(visible) => inferred` | Arrow Function L1633-L1642 |
| `#renderPersonalAttendanceTabs` | `private method` | **L1880 - L1939** | `() => any` | private method L1880-L1939 (60 lines) |
| `#buildHistoryRowHtml` | `private method` | **L1941 - L1970** | `(item, rowNumber) => any` | private method L1941-L1970 (30 lines) |
| `#getStatusTextClass` | `private method` | **L1972 - L1984** | `(statusKey) => any` | private method L1972-L1984 (13 lines) |
| `#buildHistoryCardHtml` | `private method` | **L1986 - L2074** | `(item) => any` | private method L1986-L2074 (89 lines) |
| `#renderSpecialRequestsHistoryTable` | `private method` | **L2076 - L2138** | `() => any` | private method L2076-L2138 (63 lines) |
| `#buildSpecialRequestCardHtml` | `private method` | **L2140 - L2229** | `(req) => any` | private method L2140-L2229 (90 lines) |
| `#syncDrawerNavRoleLayout` | `private method` | **L2235 - L2264** | `(viewKey = 'history') => any` | private method L2235-L2264 (30 lines) |
| `#updateTimeCorrectionBadges` | `private method` | **L2266 - L2282** | `() => any` | private method L2266-L2282 (17 lines) |
| `#renderPersonalTimeCorrectionList` | `private method` | **L2284 - L2308** | `() => any` | private method L2284-L2308 (25 lines) |
| `#buildTimeCorrectionRowHtml` | `private method` | **L2310 - L2366** | `(item, rowNumber) => any` | private method L2310-L2366 (57 lines) |
| `#buildTimeCorrectionCardHtml` | `private method` | **L2368 - L2443** | `(item) => any` | private method L2368-L2443 (76 lines) |
| `#handleSubmitTimeCorrectionFromUser` | `private async method` | **L2445 - L2490** | `(logId) => Promise<any>` | private async method L2445-L2490 (46 lines) |
| `#openFullscreenCamera` | `private async method` | **L2495 - L2497** | `() => Promise<any>` | เปิดกล้องแบบเต็มหน้าจอเพื่อถ่ายภาพยืนยันตัวตน |
| `#captureAndCloseCamera` | `private method` | **L2499 - L2540** | `() => any` | private method L2499-L2540 (42 lines) |
| `#closeFullscreenCamera` | `private method` | **L2542 - L2548** | `() => any` | private method L2542-L2548 (7 lines) |
| `#checkCameraHardware` | `private async method` | **L2554 - L2571** | `() => Promise<any>` | private async method L2554-L2571 (18 lines) |
| `#handleFallbackFileSelected` | `private method` | **L2573 - L2657** | `(file) => any` | private method L2573-L2657 (85 lines) |
| `resetFileInput` | `arrow_fn` | **L2579 - L2582** | `() => inferred` | Arrow Function L2579-L2582 |
| `notifyReadError` | `arrow_fn` | **L2583 - L2590** | `() => inferred` | Arrow Function L2583-L2590 |
| `#stopCameraHardwareStream` | `private method` | **L2659 - L2678** | `() => any` | private method L2659-L2678 (20 lines) |
| `#stopCameraAndShowStandby` | `private method` | **L2680 - L2708** | `() => any` | private method L2680-L2708 (29 lines) |
| `#openCameraOnDemand` | `private async method` | **L2713 - L2731** | `() => Promise<any>` | เปิดกล้องอัตโนมัติเมื่อเข้าสู่ Step 2 (คงการอัปเดต DOM สำหรับโหมด On-Demand) |
| `#startCameraSession` | `private async method` | **L2738 - L2866** | `({ showFullscreenModal = true } = {}) => Promise<any>` | private async method L2738-L2866 (129 lines) |
| `#acquireCameraStreamWithRetry` | `private async method` | **L2874 - L2925** | `(initialStreamPromise, sessionToken) => Promise<any>` | private async method L2874-L2925 (52 lines) |
| `#bindCameraStreamLifecycle` | `private method` | **L2931 - L2939** | `(stream) => any` | private method L2931-L2939 (9 lines) |
| `#handleUnexpectedCameraStreamStop` | `private method` | **L2945 - L2973** | `(message = '') => any` | private method L2945-L2973 (29 lines) |
| `#detectCameraBrowserProfile` | `private method` | **L2979 - L3007** | `() => any` | private method L2979-L3007 (29 lines) |
| `#getCameraPermissionHintHtml` | `private method` | **L3014 - L3027** | `(profile) => any` | private method L3014-L3027 (14 lines) |
| `#hideCameraPermissionHint` | `private method` | **L3046 - L3052** | `() => any` | ซ่อนแบนเนอร์แนะนำสิทธิ์กล้องและยกเลิก Timer ที่ค้างอยู่ |
| `#scheduleCameraPermissionHint` | `private method` | **L3058 - L3087** | `(sessionToken = this.cameraSessionToken) => any` | private method L3058-L3087 (30 lines) |
| `#classifyCameraErrorReason` | `private method` | **L3094 - L3109** | `(err) => any` | private method L3094-L3109 (16 lines) |
| `#getBrowserPermissionRecoveryStepsHtml` | `private method` | **L3116 - L3155** | `(profile) => any` | private method L3116-L3155 (40 lines) |
| `#showCameraGuidanceModal` | `private async method` | **L3161 - L3242** | `({ reason, allowFallback }) => Promise<any>` | private async method L3161-L3242 (82 lines) |
| `#capturePhotoAndStopStream` | `private method` | **L3244 - L3276** | `() => any` | private method L3244-L3276 (33 lines) |
| `#resetPageAfterSave` | `private async method` | **L3278 - L3293** | `() => Promise<any>` | private async method L3278-L3293 (16 lines) |
| `#initGpsLocation` | `private async method` | **L3301 - L3458** | `({ forceRefresh = false } = {}) => Promise<any>` | 3. หากยังไม่พบ จะดึง ซอย / ซอยย่อย -> แสดง ["ใกล้เคียง " + ชื่อซอย] |
| `#renderInlineGpsMap` | `private method` | **L3460 - L3526** | `(lat, lng) => any` | private method L3460-L3526 (67 lines) |
| `#bindEvents` | `private method` | **L3529 - L3967** | `() => any` | private method L3529-L3967 (439 lines) |
| `resetDrawerScrollTop` | `arrow_fn` | **L3628 - L3631** | `() => inferred` | Arrow Function L3628-L3631 |
| `handleSpecialRequestActionClick` | `async_arrow_fn` | **L3676 - L3705** | `(e) => inferred` | Arrow Function L3676-L3705 |
| `closeSpecialModal` | `arrow_fn` | **L3711 - L3714** | `() => inferred` | Arrow Function L3711-L3714 |
| `openSpecialModal` | `arrow_fn` | **L3716 - L3720** | `() => inferred` | Arrow Function L3716-L3720 |
| `setDesktopActiveTab` | `arrow_fn` | **L3760 - L3784** | `(activeName) => inferred` | Arrow Function L3760-L3784 |
| `setDrawerActiveNav` | `arrow_fn` | **L3803 - L3805** | `(viewKey) => inferred` | Arrow Function L3803-L3805 |
| `switchDrawerView` | `async_arrow_fn` | **L3807 - L3880** | `(viewKey, { fetchFresh = true } = {}) => inferred` | Arrow Function L3807-L3880 |
| `openMobileDrawer` | `arrow_fn` | **L3882 - L3902** | `() => inferred` | Arrow Function L3882-L3902 |
| `closeMobileDrawer` | `arrow_fn` | **L3904 - L3936** | `(targetTab = null) => inferred` | Arrow Function L3904-L3936 |
| `handleTimeCorrectionClick` | `async_arrow_fn` | **L3955 - L3962** | `(e) => inferred` | Arrow Function L3955-L3962 |
| `#handleMainCheckin` | `private async method` | **L3969 - L4401** | `() => Promise<any>` | private async method L3969-L4401 (433 lines) |
| `#openSpecialRequestModal` | `private method` | **L4403 - L4480** | `() => any` | private method L4403-L4480 (78 lines) |
| `#initModalSpecialRequest` | `private method` | **L4482 - L4534** | `() => any` | private method L4482-L4534 (53 lines) |
| `#initSpecialModalGps` | `private method` | **L4536 - L4662** | `() => any` | private method L4536-L4662 (127 lines) |
| `updateCustomPinAndLocation` | `async_arrow_fn` | **L4548 - L4619** | `(lat, lng, flyTo = false, explicitName = null, extent = null) => inferred` | Arrow Function L4548-L4619 |
| `setupMapIfAvailable` | `arrow_fn` | **L4621 - L4656** | `() => inferred` | Arrow Function L4621-L4656 |
| `getDistanceInMeters` | `arrow_fn` | **L4681 - L4700** | `(lat1, lon1, lat2, lon2) => inferred` | Arrow Function L4681-L4700 |
| `calculateDistance` | `arrow_fn` | **L4702 - L4711** | `(lat1, lon1, lat2, lon2) => inferred` | Arrow Function L4702-L4711 |
| `getCategoryLabel` | `arrow_fn` | **L4713 - L4752** | `(item) => inferred` | Arrow Function L4713-L4752 |
| `escapeHtml` | `arrow_fn` | **L4754 - L4762** | `(str) => inferred` | Arrow Function L4754-L4762 |
| `formatSubAddress` | `arrow_fn` | **L4764 - L4780** | `(item) => inferred` | Arrow Function L4764-L4780 |
| `getMainName` | `arrow_fn` | **L4782 - L4790** | `(item) => inferred` | Arrow Function L4782-L4790 |
| `hideSearchResults` | `arrow_fn` | **L4792 - L4797** | `() => inferred` | Arrow Function L4792-L4797 |
| `bindResultItemClicks` | `arrow_fn` | **L4799 - L4819** | `() => inferred` | Arrow Function L4799-L4819 |
| `renderCoordsResult` | `arrow_fn` | **L4821 - L4845** | `(lat, lng) => inferred` | Arrow Function L4821-L4845 |
| `renderPlaceResults` | `arrow_fn` | **L4847 - L4893** | `(items) => inferred` | Arrow Function L4847-L4893 |
| `performSearch` | `async_arrow_fn` | **L4898 - L4959** | `() => inferred` | Arrow Function L4898-L4959 |
| `#handleSubmitSpecialRequest` | `private async method` | **L4999 - L5138** | `(closeModalCallback) => Promise<any>` | private async method L4999-L5138 (140 lines) |

---

## File: `assets/js/controllers/DashboardController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `3360f7429debfc00` | **Total Lines:** `610` | **Imports:** `6` | **Exports:** `DashboardController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `DashboardController` | `class` | **L13 - L601** | `export class DashboardController` | Class Definition (589 lines) |
| `DashboardController.constructor` | `public constructor` | **L14 - L23** | `() => any` | public constructor L14-L23 (10 lines) |
| `DashboardController.init` | `public async method` | **L25 - L50** | `() => Promise<any>` | public async method L25-L50 (26 lines) |
| `DashboardController.#bindEvents` | `private method` | **L52 - L110** | `() => any` | private method L52-L110 (59 lines) |
| `triggerDebouncedSync` | `arrow_fn` | **L53 - L58** | `() => inferred` | Arrow Function L53-L58 |
| `DashboardController.loadDashboardData` | `public async method` | **L112 - L182** | `(silent = false) => Promise<any>` | public async method L112-L182 (71 lines) |
| `DashboardController.#updateKpiMetricsDifferentially` | `private method` | **L184 - L214** | `(oldMetrics, newMetrics) => any` | private method L184-L214 (31 lines) |
| `DashboardController.#syncRecentTableDifferentially` | `private method` | **L216 - L366** | `(colors) => any` | private method L216-L366 (151 lines) |
| `DashboardController.#renderAllVisuals` | `private method` | **L368 - L383** | `() => any` | private method L368-L383 (16 lines) |
| `DashboardController.#renderJewelToneStatCards` | `private method` | **L385 - L454** | `(metrics, colors) => any` | private method L385-L454 (70 lines) |
| `DashboardController.#getStatusTextClass` | `private method` | **L456 - L465** | `(statusCategory) => any` | private method L456-L465 (10 lines) |
| `DashboardController.#renderMobileCardsSkeleton` | `private method` | **L467 - L476** | `(count = 3) => any` | private method L467-L476 (10 lines) |
| `DashboardController.#renderEmptyCardsHtml` | `private method` | **L478 - L485** | `() => any` | private method L478-L485 (8 lines) |
| `DashboardController.#buildDashboardRowHtml` | `private method` | **L487 - L509** | `(rec, runningNo, colors) => any` | private method L487-L509 (23 lines) |
| `DashboardController.#buildDashboardCardHtml` | `private method` | **L511 - L546** | `(rec, runningNo) => any` | private method L511-L546 (36 lines) |
| `DashboardController.#renderTable` | `private method` | **L548 - L600** | `(colors) => any` | private method L548-L600 (53 lines) |

---

## File: `assets/js/controllers/LoadingController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `149d433961142d62` | **Total Lines:** `382` | **Imports:** `4` | **Exports:** `LoadingController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `LoadingController` | `class` | **L14 - L368** | `export class LoadingController` | Class Definition (355 lines) |
| `LoadingController.constructor` | `public constructor` | **L22 - L24** | `() => any` | public constructor L22-L24 (3 lines) |
| `LoadingController.init` | `public async method` | **L26 - L102** | `() => Promise<any>` | public async method L26-L102 (77 lines) |
| `LoadingController.#bindFallbackEvents` | `private method` | **L104 - L114** | `() => any` | private method L104-L114 (11 lines) |
| `LoadingController.#hydrateFromLocalBrandCache` | `private method` | **L116 - L164** | `() => any` | private method L116-L164 (49 lines) |
| `LoadingController.#verifyAndPreloadData` | `private async method` | **L166 - L190** | `(sessionUser) => Promise<any>` | private async method L166-L190 (25 lines) |
| `LoadingController.#fetchSettingsWithTimeout` | `private async method` | **L192 - L206** | `(timeoutMs) => Promise<any>` | private async method L192-L206 (15 lines) |
| `LoadingController.#verifySessionWithTimeout` | `private async method` | **L208 - L222** | `(timeoutMs) => Promise<any>` | private async method L208-L222 (15 lines) |
| `LoadingController.#applyLiveSettingsBranding` | `private async method` | **L224 - L279** | `(settings) => Promise<any>` | private async method L224-L279 (56 lines) |
| `LoadingController.#renderOrgLogo` | `private method` | **L281 - L325** | `(rawUrl) => any` | private method L281-L325 (45 lines) |
| `LoadingController.#setStepLabel` | `private method` | **L327 - L332** | `(text) => any` | private method L327-L332 (6 lines) |
| `LoadingController.#armWatchdog` | `private method` | **L334 - L344** | `() => any` | private method L334-L344 (11 lines) |
| `LoadingController.#clearWatchdog` | `private method` | **L346 - L351** | `() => any` | private method L346-L351 (6 lines) |
| `LoadingController.#navigateToTarget` | `private async method` | **L353 - L367** | `(targetUrl) => Promise<any>` | private async method L353-L367 (15 lines) |
| `bootLoadingController` | `function` | **L371 - L375** | `() => inferred` | Bootstrap Singleton |

---

## File: `assets/js/controllers/LoginController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `ef6e24c8c43c4917` | **Total Lines:** `344` | **Imports:** `5` | **Exports:** `LoginController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `LoginController` | `class` | **L12 - L340** | `export class LoginController` | Class Definition (329 lines) |
| `LoginController.constructor` | `public constructor` | **L13 - L16** | `() => any` | public constructor L13-L16 (4 lines) |
| `LoginController.init` | `public async method` | **L18 - L39** | `() => Promise<any>` | public async method L18-L39 (22 lines) |
| `LoginController.#loadOrganizationBranding` | `private async method` | **L41 - L101** | `() => Promise<any>` | private async method L41-L101 (61 lines) |
| `LoginController.#updateThemeButtonUI` | `private method` | **L103 - L113** | `() => any` | private method L103-L113 (11 lines) |
| `LoginController.#bindEvents` | `private method` | **L115 - L230** | `() => any` | private method L115-L230 (116 lines) |
| `openChangeModal` | `arrow_fn` | **L156 - L166** | `() => inferred` | Arrow Function L156-L166 |
| `closeChangeModal` | `arrow_fn` | **L167 - L170** | `() => inferred` | Arrow Function L167-L170 |
| `validatePasswordMatch` | `arrow_fn` | **L177 - L199** | `() => inferred` | Arrow Function L177-L199 |
| `openForgotModal` | `arrow_fn` | **L210 - L215** | `() => inferred` | Arrow Function L210-L215 |
| `closeForgotModal` | `arrow_fn` | **L216 - L219** | `() => inferred` | Arrow Function L216-L219 |
| `LoginController.#handleLogin` | `private async method` | **L232 - L253** | `(mode) => Promise<any>` | private async method L232-L253 (22 lines) |
| `LoginController.#loadRememberedUser` | `private method` | **L255 - L275** | `() => any` | private method L255-L275 (21 lines) |
| `LoginController.#persistRememberedUser` | `private method` | **L277 - L292** | `(username) => any` | private method L277-L292 (16 lines) |
| `LoginController.#handleChangePasswordSubmit` | `private async method` | **L294 - L318** | `(closeModalCallback) => Promise<any>` | private async method L294-L318 (25 lines) |
| `LoginController.#handleForgotPasswordSubmit` | `private async method` | **L320 - L339** | `(closeModalCallback) => Promise<any>` | private async method L320-L339 (20 lines) |

---

## File: `assets/js/controllers/PersonnelController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `05a0ad40f7d2a91d` | **Total Lines:** `1799` | **Imports:** `5` | **Exports:** `PersonnelController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `PersonnelController` | `class` | **L12 - L1790** | `export class PersonnelController` | Class Definition (1779 lines) |
| `PersonnelController.constructor` | `public constructor` | **L13 - L30** | `() => any` | public constructor L13-L30 (18 lines) |
| `PersonnelController.init` | `public async method` | **L32 - L56** | `() => Promise<any>` | public async method L32-L56 (25 lines) |
| `PersonnelController.#initHierarchicalOrgFilter` | `private method` | **L58 - L87** | `() => any` | private method L58-L87 (30 lines) |
| `PersonnelController.#populateHierarchicalOrgFilter` | `private method` | **L89 - L106** | `() => any` | private method L89-L106 (18 lines) |
| `PersonnelController.#updateFilterDivisionOptions` | `private method` | **L108 - L140** | `() => any` | private method L108-L140 (33 lines) |
| `PersonnelController.#updateFilterWorkGroupOptions` | `private method` | **L142 - L172** | `() => any` | private method L142-L172 (31 lines) |
| `PersonnelController.#populateDropdownsFromSettings` | `private method` | **L174 - L203** | `() => any` | private method L174-L203 (30 lines) |
| `PersonnelController.#updatePositionSubDropdowns` | `private method` | **L205 - L223** | `(selectedType, selectedTitle = '', selectedLevel = '') => any` | private method L205-L223 (19 lines) |
| `PersonnelController.#updateAffiliationSubDropdowns` | `private method` | **L225 - L249** | `(selectedBureau, selectedDivision = '', selectedGroup = '') => any` | private method L225-L249 (25 lines) |
| `PersonnelController.loadPersonnelData` | `public async method` | **L251 - L277** | `() => Promise<any>` | public async method L251-L277 (27 lines) |
| `PersonnelController.#renderMobileCardsSkeleton` | `private method` | **L279 - L287** | `(count = 3) => any` | private method L279-L287 (9 lines) |
| `PersonnelController.#renderGroupedTable` | `private method` | **L289 - L374** | `() => any` | private method L289-L374 (86 lines) |
| `PersonnelController.#buildPersonCardHtml` | `private method` | **L376 - L434** | `(person, indexNo) => any` | private method L376-L434 (59 lines) |
| `PersonnelController.#buildPersonRowHtml` | `private method` | **L436 - L492** | `(person, indexNo) => any` | private method L436-L492 (57 lines) |
| `PersonnelController.#openModal` | `private method` | **L494 - L536** | `(editPerson = null) => any` | private method L494-L536 (43 lines) |
| `PersonnelController.#closeModal` | `private method` | **L538 - L543** | `() => any` | private method L538-L543 (6 lines) |
| `PersonnelController.syncPersonnelSilent` | `public async method` | **L545 - L598** | `(deltaDetail = null) => Promise<any>` | public async method L545-L598 (54 lines) |
| `PersonnelController.#bindEvents` | `private method` | **L600 - L884** | `() => any` | private method L600-L884 (285 lines) |
| `validateNationalIdInput` | `arrow_fn` | **L640 - L663** | `() => inferred` | Arrow Function L640-L663 |
| `handlePersonnelContainerClick` | `async_arrow_fn` | **L722 - L775** | `(e) => inferred` | Arrow Function L722-L775 |
| `PersonnelController.#openPersonnelResumeModal` | `private method` | **L890 - L1020** | `(person) => any` | private method L890-L1020 (131 lines) |
| `PersonnelController.#closePersonnelResumeModal` | `private method` | **L1022 - L1026** | `() => any` | private method L1022-L1026 (5 lines) |
| `PersonnelController.#handleSavePersonnel` | `private async method` | **L1028 - L1065** | `() => Promise<any>` | private async method L1028-L1065 (38 lines) |
| `PersonnelController.#handleQuickCreateAccount` | `private async method` | **L1067 - L1128** | `(personId) => Promise<any>` | private async method L1067-L1128 (62 lines) |
| `PersonnelController.#diceCoefficient` | `private method` | **L1130 - L1150** | `(str1, str2) => any` | private method L1130-L1150 (21 lines) |
| `PersonnelController.#findBestFuzzyMatch` | `private method` | **L1152 - L1168** | `(value, candidates, threshold = 0.5) => any` | private method L1152-L1168 (17 lines) |
| `PersonnelController.#openBulkImportModal` | `private method` | **L1170 - L1205** | `(initialFile = null) => any` | private method L1170-L1205 (36 lines) |
| `PersonnelController.#closeBulkImportModal` | `private method` | **L1207 - L1216** | `() => any` | private method L1207-L1216 (10 lines) |
| `PersonnelController.#processBulkImportFile` | `private async method` | **L1218 - L1292** | `(file) => Promise<any>` | private async method L1218-L1292 (75 lines) |
| `PersonnelController.#validateRowCascading` | `private method` | **L1299 - L1590** | `(row, changedField = null) => any` | private method L1299-L1590 (292 lines) |
| `PersonnelController.#revalidateRowCascading` | `private method` | **L1597 - L1603** | `(rIdx, changedField = null) => any` | private method L1597-L1603 (7 lines) |
| `PersonnelController.#renderBulkImportPreview` | `private method` | **L1605 - L1679** | `() => any` | private method L1605-L1679 (75 lines) |
| `renderCell` | `arrow_fn` | **L1628 - L1640** | `(field, cell) => inferred` | Arrow Function L1628-L1640 |
| `PersonnelController.#handleExecuteBulkImport` | `private async method` | **L1681 - L1769** | `() => Promise<any>` | private async method L1681-L1769 (89 lines) |
| `PersonnelController.#downloadMultiSheetTemplate` | `private async method` | **L1774 - L1789** | `() => Promise<any>` | ดาวน์โหลดไฟล์แม่แบบ Excel แบบหลายแผ่นงาน พร้อม Data Validation Dropdowns ด้วย ExcelJS |

---

## File: `assets/js/controllers/ReportsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `a57672798b895c84` | **Total Lines:** `2000` | **Imports:** `8` | **Exports:** `ReportsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ReportsController` | `class` | **L15 - L1991** | `export class ReportsController` | Class Definition (1977 lines) |
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
| `ReportsController.#calculateDistanceMeters` | `private method` | **L340 - L351** | `(lat1, lon1, lat2, lon2) => any` | private method L340-L351 (12 lines) |
| `ReportsController.#isWithinGeofence` | `private method` | **L353 - L378** | `(lat, lng) => any` | private method L353-L378 (26 lines) |
| `ReportsController.#formatLocationName` | `private method` | **L380 - L395** | `(locName) => any` | private method L380-L395 (16 lines) |
| `ReportsController.#resolveLocationMode` | `private method` | **L397 - L454** | `(rec, type = 'check_in') => any` | private method L397-L454 (58 lines) |
| `ReportsController.#escapeHtml` | `private method` | **L456 - L464** | `(val) => any` | private method L456-L464 (9 lines) |
| `ReportsController.#resolveReportRemark` | `private method` | **L466 - L537** | `(rec, { forExcel = false, forPrint = false } = {}) => any` | private method L466-L537 (72 lines) |
| `ReportsController.#renderSeparateTablesBySelectedTags` | `private method` | **L539 - L607** | `(forPrintPdf = false) => any` | private method L539-L607 (69 lines) |
| `ReportsController.#renderSingleStatusTableHtml` | `private method` | **L609 - L747** | `(statusMeta, statusColor, tagRecords, daySubtitle, groupHeaderColor, forPrintPdf) => any` | private method L609-L747 (139 lines) |
| `ReportsController.#buildGroupedCardsForTag` | `private method` | **L749 - L792** | `(tagRecords, groupHeaderColor) => any` | private method L749-L792 (44 lines) |
| `ReportsController.#buildReportCardHtml` | `private method` | **L794 - L874** | `(rec, indexNo) => any` | private method L794-L874 (81 lines) |
| `renderModeLoc` | `arrow_fn` | **L811 - L818** | `(mode, locText) => inferred` | Arrow Function L811-L818 |
| `ReportsController.#buildGroupedRowsForTag` | `private method` | **L876 - L928** | `(tagRecords, groupHeaderColor, forPrintPdf) => any` | private method L876-L928 (53 lines) |
| `ReportsController.#buildSingleRowHtml` | `private method` | **L930 - L1050** | `(rec, indexNo, forPrintPdf) => any` | private method L930-L1050 (121 lines) |
| `ReportsController.#openResumeProfileForSpecificRow` | `private method` | **L1059 - L1279** | `(rowUid) => any` | private method L1059-L1279 (221 lines) |
| `setupPhotoBox` | `arrow_fn` | **L1128 - L1171** | `(boxId, linkId, photo, fallbackMsg, isOut = false) => inferred` | Arrow Function L1128-L1171 |
| `setupGpsAndMap` | `arrow_fn` | **L1225 - L1255** | `(coordsId, linkId, iframeId, placeholderId, locNameId, lat, lng, locName, fallbackMsg) => inferred` | Arrow Function L1225-L1255 |
| `ReportsController.#closeResumeModal` | `private method` | **L1281 - L1292** | `() => any` | private method L1281-L1292 (12 lines) |
| `ReportsController.#normalizeModalTimeValue` | `private method` | **L1294 - L1303** | `(val) => any` | private method L1294-L1303 (10 lines) |
| `ReportsController.#syncCheckoutControlState` | `private method` | **L1305 - L1319** | `(isEditExisting = null) => any` | private method L1305-L1319 (15 lines) |
| `ReportsController.#syncDuplicateWarningBanner` | `private method` | **L1321 - L1360** | `() => any` | private method L1321-L1360 (40 lines) |
| `ReportsController.#bindReportModalHelperEvents` | `private method` | **L1362 - L1400** | `() => any` | private method L1362-L1400 (39 lines) |
| `ReportsController.#openModal` | `private method` | **L1402 - L1465** | `(rec = null) => any` | private method L1402-L1465 (64 lines) |
| `ReportsController.#closeModal` | `private method` | **L1467 - L1470** | `() => any` | private method L1467-L1470 (4 lines) |
| `ReportsController.syncReportsSilent` | `public async method` | **L1472 - L1675** | `(deltaDetail = null) => Promise<any>` | public async method L1472-L1675 (204 lines) |
| `ReportsController.#bindEvents` | `private method` | **L1677 - L1913** | `() => any` | private method L1677-L1913 (237 lines) |
| `triggerDebouncedReportSync` | `arrow_fn` | **L1678 - L1683** | `(detail) => inferred` | Arrow Function L1678-L1683 |
| `ReportsController.#handleSaveReportRecord` | `private async method` | **L1915 - L1990** | `() => Promise<any>` | private async method L1915-L1990 (76 lines) |

---

## File: `assets/js/controllers/SettingsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `9dc60748ed4345aa` | **Total Lines:** `2222` | **Imports:** `5` | **Exports:** `SettingsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SettingsController` | `class` | **L12 - L2213** | `export class SettingsController` | Class Definition (2202 lines) |
| `SettingsController.constructor` | `public constructor` | **L13 - L18** | `() => any` | public constructor L13-L18 (6 lines) |
| `SettingsController.init` | `public async method` | **L20 - L38** | `() => Promise<any>` | public async method L20-L38 (19 lines) |
| `SettingsController.#renderAllSettings` | `private method` | **L40 - L154** | `() => any` | private method L40-L154 (115 lines) |
| `SettingsController.#syncEarlyWindowVisibility` | `private method` | **L156 - L168** | `() => any` | private method L156-L168 (13 lines) |
| `SettingsController.#syncRadiusVisibility` | `private method` | **L170 - L182** | `() => any` | private method L170-L182 (13 lines) |
| `SettingsController.#syncAnnouncementDriveFolderUI` | `private method` | **L184 - L226** | `({ verifiedFolderName = null, verifyFailed = false } = {}) => any` | private method L184-L226 (43 lines) |
| `SettingsController.#activateSettingsTab` | `private method` | **L228 - L244** | `(targetId) => any` | private method L228-L244 (17 lines) |
| `SettingsController.#renderAnnouncementTab` | `private method` | **L246 - L288** | `() => any` | private method L246-L288 (43 lines) |
| `SettingsController.#syncAnnouncementModePanels` | `private method` | **L290 - L296** | `() => any` | private method L290-L296 (7 lines) |
| `SettingsController.#readAnnouncementFormDraft` | `private method` | **L298 - L315** | `() => any` | private method L298-L315 (18 lines) |
| `SettingsController.#updateAnnouncementStatusBadge` | `private method` | **L317 - L341** | `() => any` | private method L317-L341 (25 lines) |
| `SettingsController.#updateAnnouncementImagePreview` | `private method` | **L343 - L355** | `(rawUrl) => any` | private method L343-L355 (13 lines) |
| `SettingsController.#openAnnouncementPreviewModal` | `private method` | **L357 - L423** | `() => any` | private method L357-L423 (67 lines) |
| `SettingsController.#closeAnnouncementPreviewModal` | `private method` | **L425 - L428** | `() => any` | private method L425-L428 (4 lines) |
| `SettingsController.#saveAnnouncementTab` | `private async method` | **L430 - L463** | `() => Promise<any>` | private async method L430-L463 (34 lines) |
| `SettingsController.#updateColorPreviewBadges` | `private method` | **L465 - L481** | `() => any` | private method L465-L481 (17 lines) |
| `SettingsController.#syncCheckinModeUI` | `private method` | **L486 - L517** | `(isSingleClick) => any` | ย่อข้อความป้าย Tag ให้เหลือแค่ "รูปแบบพิเศษ" หรือ "รูปแบบปกติ" เพื่อไม่ให้ล้นจอหรือเบียดข้อความในมือถือ |
| `SettingsController.#updateLogoPreview` | `private method` | **L519 - L527** | `(url) => any` | private method L519-L527 (9 lines) |
| `SettingsController.#buildSortButtonsHtml` | `private method` | **L529 - L542** | `(category, index, totalLength) => any` | private method L529-L542 (14 lines) |
| `SettingsController.#renderPrefixes` | `private method` | **L544 - L564** | `() => any` | private method L544-L564 (21 lines) |
| `SettingsController.#renderRemarks` | `private method` | **L566 - L586** | `() => any` | private method L566-L586 (21 lines) |
| `SettingsController.#renderOffsiteJobTypes` | `private method` | **L588 - L611** | `() => any` | private method L588-L611 (24 lines) |
| `SettingsController.#renderSpecialReasons` | `private method` | **L613 - L636** | `() => any` | private method L613-L636 (24 lines) |
| `SettingsController.#renderShifts` | `private method` | **L638 - L690** | `() => any` | private method L638-L690 (53 lines) |
| `SettingsController.#renderPositions` | `private method` | **L692 - L713** | `() => any` | private method L692-L713 (22 lines) |
| `SettingsController.#renderAffiliations` | `private method` | **L715 - L737** | `() => any` | private method L715-L737 (23 lines) |
| `SettingsController.#renderOfficialLocations` | `private method` | **L739 - L803** | `() => any` | private method L739-L803 (65 lines) |
| `SettingsController.#openOfficialLocationModal` | `private method` | **L805 - L952** | `(editIndex = null) => any` | private method L805-L952 (148 lines) |
| `updateMapLink` | `arrow_fn` | **L944 - L949** | `() => inferred` | Arrow Function L944-L949 |
| `SettingsController.#collectMainAndColorFieldsIntoSettings` | `private method` | **L954 - L1030** | `() => any` | private method L954-L1030 (77 lines) |
| `SettingsController.#persistSettings` | `private async method` | **L1032 - L1085** | `(showToastAlert = true) => Promise<any>` | private async method L1032-L1085 (54 lines) |
| `SettingsController.#openModal` | `private method` | **L1087 - L1094** | `(title, bodyHtml, onSubmitCallback) => any` | private method L1087-L1094 (8 lines) |
| `SettingsController.#closeModal` | `private method` | **L1096 - L1100** | `() => any` | private method L1096-L1100 (5 lines) |
| `SettingsController.#buildMultiRowInputsHtml` | `private method` | **L1102 - L1121** | `(fieldLabel, placeholder) => any` | private method L1102-L1121 (20 lines) |
| `SettingsController.#bindDynamicMultiRowEvents` | `private method` | **L1123 - L1151** | `(placeholder = 'ระบุข้อมูล...') => any` | private method L1123-L1151 (29 lines) |
| `SettingsController.#getDynamicMultiRowValues` | `private method` | **L1153 - L1158** | `() => any` | private method L1153-L1158 (6 lines) |
| `SettingsController.#bindEvents` | `private method` | **L1160 - L1733** | `() => any` | private method L1160-L1733 (574 lines) |
| `mainClickHandler` | `async_arrow_fn` | **L1611 - L1729** | `(e) => inferred` | Arrow Function L1611-L1729 |
| `SettingsController.#openShiftModal` | `private method` | **L1735 - L1826** | `(editIndex = null) => any` | private method L1735-L1826 (92 lines) |
| `checkOvernightAuto` | `arrow_fn` | **L1816 - L1823** | `() => inferred` | Arrow Function L1816-L1823 |
| `SettingsController.#openAddPositionStep1Modal` | `private method` | **L1828 - L1844** | `() => any` | private method L1828-L1844 (17 lines) |
| `SettingsController.#openAddPositionStep2Modal` | `private method` | **L1846 - L1889** | `() => any` | private method L1846-L1889 (44 lines) |
| `SettingsController.#openAddPositionStep3Modal` | `private method` | **L1891 - L1955** | `() => any` | private method L1891-L1955 (65 lines) |
| `SettingsController.#openEditSinglePositionModal` | `private method` | **L1957 - L1980** | `(editIndex) => any` | private method L1957-L1980 (24 lines) |
| `SettingsController.#openAddAffiliationStep1OrgModal` | `private method` | **L1982 - L1998** | `() => any` | private method L1982-L1998 (17 lines) |
| `SettingsController.#openAddAffiliationStep2BureauModal` | `private method` | **L2000 - L2038** | `() => any` | private method L2000-L2038 (39 lines) |
| `SettingsController.#openAddAffiliationStep3DivisionModal` | `private method` | **L2040 - L2096** | `() => any` | private method L2040-L2096 (57 lines) |
| `SettingsController.#openAddAffiliationStep4GroupModal` | `private method` | **L2098 - L2182** | `() => any` | private method L2098-L2182 (85 lines) |
| `SettingsController.#openEditSingleAffiliationModal` | `private method` | **L2184 - L2212** | `(editIndex) => any` | private method L2184-L2212 (29 lines) |

---

## File: `assets/js/controllers/TimeCorrectionsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `3b4d80be1d7cb810` | **Total Lines:** `658` | **Imports:** `5` | **Exports:** `TimeCorrectionsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `TimeCorrectionsController` | `class` | **L12 - L648** | `export class TimeCorrectionsController` | Class Definition (637 lines) |
| `TimeCorrectionsController.constructor` | `public constructor` | **L13 - L28** | `() => any` | public constructor L13-L28 (16 lines) |
| `TimeCorrectionsController.init` | `public async method` | **L30 - L42** | `() => Promise<any>` | public async method L30-L42 (13 lines) |
| `TimeCorrectionsController.loadRequests` | `public async method` | **L44 - L83** | `() => Promise<any>` | public async method L44-L83 (40 lines) |
| `TimeCorrectionsController.#updatePendingCountBadge` | `private method` | **L85 - L90** | `(pendingCount) => any` | private method L85-L90 (6 lines) |
| `TimeCorrectionsController.#renderMobileCardsSkeleton` | `private method` | **L92 - L101** | `(count = 3) => any` | private method L92-L101 (10 lines) |
| `TimeCorrectionsController.#isRowSelectable` | `private method` | **L103 - L107** | `(req) => any` | private method L103-L107 (5 lines) |
| `TimeCorrectionsController.#updateBulkSelectionCount` | `private method` | **L109 - L133** | `() => any` | private method L109-L133 (25 lines) |
| `TimeCorrectionsController.#renderGroupedCorrectionsTable` | `private method` | **L135 - L222** | `() => any` | private method L135-L222 (88 lines) |
| `TimeCorrectionsController.#formatTimeCompareHtml` | `private method` | **L224 - L243** | `(req) => any` | private method L224-L243 (20 lines) |
| `TimeCorrectionsController.#buildRoleTagHtml` | `private method` | **L245 - L253** | `(requesterRole) => any` | private method L245-L253 (9 lines) |
| `TimeCorrectionsController.#buildRequestRowHtml` | `private method` | **L255 - L310** | `(req, indexNo) => any` | private method L255-L310 (56 lines) |
| `TimeCorrectionsController.#buildRequestCardHtml` | `private method` | **L312 - L400** | `(req, indexNo) => any` | private method L312-L400 (89 lines) |
| `TimeCorrectionsController.syncRequestsSilent` | `public async method` | **L402 - L506** | `(deltaDetail = null) => Promise<any>` | public async method L402-L506 (105 lines) |
| `TimeCorrectionsController.#bindEvents` | `private method` | **L508 - L590** | `() => any` | private method L508-L590 (83 lines) |
| `handleSelectAllChange` | `arrow_fn` | **L535 - L547** | `(e) => inferred` | Arrow Function L535-L547 |
| `handleRowCheckChange` | `arrow_fn` | **L551 - L564** | `(e) => inferred` | Arrow Function L551-L564 |
| `handleActionClick` | `async_arrow_fn` | **L566 - L577** | `(e) => inferred` | Arrow Function L566-L577 |
| `TimeCorrectionsController.#processDecision` | `private async method` | **L592 - L647** | `(ids, isApproved) => Promise<any>` | private async method L592-L647 (56 lines) |

---

## File: `assets/js/controllers/UsersController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `96561f2cb91844a4` | **Total Lines:** `1147` | **Imports:** `6` | **Exports:** `UsersController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `UsersController` | `class` | **L13 - L1138** | `export class UsersController` | Class Definition (1126 lines) |
| `UsersController.constructor` | `public constructor` | **L14 - L31** | `() => any` | public constructor L14-L31 (18 lines) |
| `UsersController.init` | `public async method` | **L33 - L81** | `() => Promise<any>` | public async method L33-L81 (49 lines) |
| `UsersController.#switchUsersTab` | `private method` | **L83 - L114** | `(targetTabId) => any` | private method L83-L114 (32 lines) |
| `UsersController.#initHierarchicalOrgFilter` | `private method` | **L116 - L148** | `() => any` | private method L116-L148 (33 lines) |
| `UsersController.#populateHierarchicalOrgFilter` | `private method` | **L150 - L171** | `() => any` | private method L150-L171 (22 lines) |
| `UsersController.#updateDivisionOptions` | `private method` | **L173 - L211** | `() => any` | private method L173-L211 (39 lines) |
| `UsersController.#updateWorkGroupOptions` | `private method` | **L213 - L255** | `() => any` | private method L213-L255 (43 lines) |
| `UsersController.#toggleManageColumnHeader` | `private method` | **L260 - L268** | `() => any` | ซ่อนหรือแสดงหัวคอลัมน์ "จัดการ" ในตารางตามสิทธิ์ของผู้ใช้งาน (index 5) |
| `UsersController.#populateScopeDropdowns` | `private method` | **L270 - L281** | `() => any` | private method L270-L281 (12 lines) |
| `UsersController.#updateScopeDivisionDropdown` | `private method` | **L283 - L296** | `(selectedBureau, selectedDivision = '') => any` | private method L283-L296 (14 lines) |
| `UsersController.loadUsersAndPersonnel` | `public async method` | **L298 - L343** | `() => Promise<any>` | public async method L298-L343 (46 lines) |
| `UsersController.#renderMobileCardsSkeleton` | `private method` | **L345 - L353** | `(count = 3) => any` | private method L345-L353 (9 lines) |
| `UsersController.#renderPersonnelSelectOptions` | `private method` | **L355 - L374** | `(filterText = '', selectedPersonnelId = '') => any` | private method L355-L374 (20 lines) |
| `UsersController.#getFilteredUsers` | `private method` | **L376 - L411** | `() => any` | private method L376-L411 (36 lines) |
| `UsersController.#buildUserRowHtml` | `private method` | **L413 - L452** | `(u, indexNo) => any` | private method L413-L452 (40 lines) |
| `UsersController.#getUserScopeDescription` | `private method` | **L454 - L462** | `(u) => any` | private method L454-L462 (9 lines) |
| `UsersController.#buildUserCardHtml` | `private method` | **L464 - L511** | `(u, indexNo) => any` | private method L464-L511 (48 lines) |
| `UsersController.#buildResetCardHtml` | `private method` | **L513 - L551** | `(u, indexNo) => any` | private method L513-L551 (39 lines) |
| `UsersController.#updateTabCountBadges` | `private method` | **L553 - L567** | `(totalUsersCount, pendingResetCount) => any` | private method L553-L567 (15 lines) |
| `UsersController.#renderUsersTable` | `private method` | **L569 - L693** | `() => any` | private method L569-L693 (125 lines) |
| `UsersController.#toggleAdminScopeUI` | `private method` | **L695 - L711** | `() => any` | private method L695-L711 (17 lines) |
| `UsersController.#openModal` | `private method` | **L713 - L769** | `(editUser = null) => any` | private method L713-L769 (57 lines) |
| `UsersController.#closeModal` | `private method` | **L771 - L774** | `() => any` | private method L771-L774 (4 lines) |
| `UsersController.syncUsersSilent` | `public async method` | **L776 - L912** | `(deltaDetail = null) => Promise<any>` | public async method L776-L912 (137 lines) |
| `UsersController.#bindEvents` | `private method` | **L914 - L1093** | `() => any` | private method L914-L1093 (180 lines) |
| `handleTableActionClick` | `async_arrow_fn` | **L1028 - L1087** | `(e) => inferred` | Arrow Function L1028-L1087 |
| `UsersController.#handleSaveUserAccount` | `private async method` | **L1095 - L1137** | `() => Promise<any>` | private async method L1095-L1137 (43 lines) |

---

## File: `assets/js/core/AuthService.js`
- **Layer:** Core Service & Infrastructure Layer
- **Hash:** `1f53b369a89a4080` | **Total Lines:** `435` | **Imports:** `3` | **Exports:** `AuthService`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `AuthService` | `class` | **L10 - L434** | `export class AuthService` | Class Definition (425 lines) |
| `AuthService.getCurrentUser` | `static public method` | **L13 - L49** | `(extendSession = true) => any` | static public method L13-L49 (37 lines) |
| `AuthService.setCurrentUser` | `static public method` | **L51 - L66** | `(userObj, loginMode = 'checkin') => any` | static public method L51-L66 (16 lines) |
| `AuthService.clearSession` | `static public method` | **L68 - L71** | `() => any` | static public method L68-L71 (4 lines) |
| `AuthService.verifySessionWithDatabase` | `static public async method` | **L73 - L119** | `() => Promise<any>` | static public async method L73-L119 (47 lines) |
| `AuthService.getRedirectUrlForSession` | `static public method` | **L126 - L144** | `(sessionUser) => any` | static public method L126-L144 (19 lines) |
| `AuthService.login` | `static public async method` | **L146 - L215** | `(username, password, loginMode = 'checkin') => Promise<any>` | static public async method L146-L215 (70 lines) |
| `AuthService.changePassword` | `static public async method` | **L217 - L266** | `(username, oldPassword, newPassword, confirmPassword) => Promise<any>` | static public async method L217-L266 (50 lines) |
| `AuthService.requestPasswordResetByNationalId` | `static public async method` | **L268 - L309** | `(nationalId) => Promise<any>` | static public async method L268-L309 (42 lines) |
| `AuthService.requireAuth` | `static public method` | **L311 - L333** | `(allowedRoles = ['SuperAdmin', 'Admin', 'User']) => any` | static public method L311-L333 (23 lines) |
| `AuthService.canViewRecordByScope` | `static public method` | **L335 - L351** | `(currentUser, targetRecord) => any` | static public method L335-L351 (17 lines) |
| `AuthService.canEditAttendanceRecord` | `static public method` | **L353 - L365** | `(currentUser, record = null) => any` | static public method L353-L365 (13 lines) |
| `AuthService.canApproveTimeCorrection` | `static public method` | **L384 - L425** | `(currentUser, targetRequest) => any` | static public method L384-L425 (42 lines) |
| `AuthService.canDeleteAttendanceRecord` | `static public method` | **L427 - L433** | `(currentUser, record = null) => any` | static public method L427-L433 (7 lines) |

---

## File: `assets/js/core/Config.js`
- **Layer:** Core Service & Infrastructure Layer
- **Hash:** `8bc325eb9be74dcf` | **Total Lines:** `124` | **Imports:** `0` | **Exports:** `Config`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `Config` | `class` | **L6 - L124** | `export class Config` | คลาสเก็บค่าคงที่ การตั้งค่าเชื่อมต่อ Supabase และค่ามาตรฐานของระบบ v2.10.0 |

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
- **Hash:** `568b6adc4cc9f18e` | **Total Lines:** `1549` | **Imports:** `1` | **Exports:** `UIHelpers`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `UIHelpers` | `class` | **L8 - L1549** | `export class UIHelpers` | Class Definition (1542 lines) |
| `UIHelpers.escapeHtml` | `static public method` | **L27 - L35** | `(str) => any` | static public method L27-L35 (9 lines) |
| `UIHelpers.getRootBasePath` | `static public method` | **L37 - L46** | `() => any` | static public method L37-L46 (10 lines) |
| `UIHelpers.maskUrlToRoot` | `static public method` | **L48 - L71** | `(explicitPageName = '') => any` | static public method L48-L71 (24 lines) |
| `UIHelpers.initTheme` | `static public method` | **L73 - L90** | `() => any` | static public method L73-L90 (18 lines) |
| `UIHelpers.toggleTheme` | `static public method` | **L92 - L98** | `() => any` | static public method L92-L98 (7 lines) |
| `UIHelpers.formatWelcomeDisplayName` | `static public method` | **L100 - L162** | `(userOrName, prefixes = null) => any` | static public method L100-L162 (63 lines) |
| `UIHelpers.showToast` | `static public method` | **L164 - L196** | `(message, type = 'success', durationMs = 2600) => any` | static public method L164-L196 (33 lines) |
| `UIHelpers.formatThaiShortDate` | `static public method` | **L198 - L214** | `(dateStr) => any` | static public method L198-L214 (17 lines) |
| `UIHelpers.formatThaiShortDateFullYear` | `static public method` | **L221 - L235** | `(dateStr) => any` | static public method L221-L235 (15 lines) |
| `UIHelpers.shiftDateISO` | `static public method` | **L243 - L256** | `(dateStr, deltaDays = 0) => any` | static public method L243-L256 (14 lines) |
| `UIHelpers.formatThaiFullDate` | `static public method` | **L258 - L273** | `(dateStr) => any` | static public method L258-L273 (16 lines) |
| `UIHelpers.formatThaiDate` | `static public method` | **L275 - L277** | `(dateStr) => any` | static public method L275-L277 (3 lines) |
| `UIHelpers.formatTime24` | `static public method` | **L279 - L287** | `(timeStr) => any` | static public method L279-L287 (9 lines) |
| `UIHelpers.timeToMinutes` | `static public method` | **L289 - L295** | `(timeStr) => any` | static public method L289-L295 (7 lines) |
| `UIHelpers.getTodayISO` | `static public method` | **L297 - L301** | `() => any` | static public method L297-L301 (5 lines) |
| `UIHelpers.getTodayDateString` | `static public method` | **L303 - L305** | `() => any` | static public method L303-L305 (3 lines) |
| `UIHelpers.getCurrentTimeHHMM` | `static public method` | **L307 - L312** | `() => any` | static public method L307-L312 (6 lines) |
| `UIHelpers.formatPosition` | `static public method` | **L326 - L362** | `(title = '', level = '', positionType = '', fullFallback = '') => any` | static public method L326-L362 (37 lines) |
| `UIHelpers.capturePortrait3x4FromVideo` | `static public method` | **L364 - L398** | `(videoEl, canvasEl) => any` | static public method L364-L398 (35 lines) |
| `UIHelpers.verifyImageUrl` | `static public method` | **L400 - L458** | `(rawUrl) => any` | static public method L400-L458 (59 lines) |
| `UIHelpers.verifyGoogleDriveLink` | `static public async method` | **L460 - L519** | `(scriptUrl, folderId = '', options = {}) => Promise<any>` | static public async method L460-L519 (60 lines) |
| `UIHelpers.uploadPhotoToGoogleDrive` | `static public async method` | **L521 - L615** | `(base64DataUrl, fileNamePrefix, settings, options = {}) => Promise<any>` | static public async method L521-L615 (95 lines) |
| `UIHelpers.showLoading` | `static public method` | **L622 - L684** | `(message = 'กำลังประมวลผลข้อมูล กรุณารอสักครู่...') => any` | static public method L622-L684 (63 lines) |
| `UIHelpers.#updateProgressDOM` | `static private method` | **L686 - L693** | `(percent) => any` | static private method L686-L693 (8 lines) |
| `UIHelpers.hideLoading` | `static public method` | **L695 - L720** | `() => any` | static public method L695-L720 (26 lines) |
| `UIHelpers.renderTableSkeleton` | `static public method` | **L722 - L732** | `(rows = 5, cols = 6) => any` | static public method L722-L732 (11 lines) |
| `UIHelpers.alert` | `static public async method` | **L734 - L769** | `(title, text = '', icon = 'success') => Promise<any>` | static public async method L734-L769 (36 lines) |
| `UIHelpers.confirm` | `static public async method` | **L771 - L821** | `(title, text = '', confirmText = 'ยืนยัน', icon = 'warning', options = {}) => Promise<any>` | static public async method L771-L821 (51 lines) |
| `UIHelpers.confirmWithInput` | `static public async method` | **L823 - L897** | `(title, options = {}) => Promise<any>` | static public async method L823-L897 (75 lines) |
| `UIHelpers.validateThaiNationalId` | `static public method` | **L899 - L918** | `(id, strictCheckDigit = false) => any` | static public method L899-L918 (20 lines) |
| `UIHelpers.getLast6DigitsFromNationalId` | `static public method` | **L920 - L924** | `(nationalId) => any` | static public method L920-L924 (5 lines) |
| `UIHelpers.exportToExcelUTF8` | `static public method` | **L926 - L951** | `(dataRows, fileName = 'export_data', sheetName = 'Sheet1') => any` | static public method L926-L951 (26 lines) |
| `UIHelpers.exportMultiSheetExcel` | `static public method` | **L958 - L978** | `(sheets, fileName = 'export_data') => any` | static public method L958-L978 (21 lines) |
| `UIHelpers.exportTemplateWithValidationsExcel` | `static public async method` | **L987 - L1250** | `({ settings, templateRows, fileName = 'Template_นำเข้าบุคลากร_กทม' }) => Promise<any>` | static public async method L987-L1250 (264 lines) |
| `UIHelpers.parseExcelFileUTF8` | `static public method` | **L1252 - L1274** | `(file) => any` | static public method L1252-L1274 (23 lines) |
| `UIHelpers.printReportInNewTab` | `static public method` | **L1276 - L1453** | `({ title, subtitle, tableHtml, headerColor = '#007B3E' }) => any` | static public method L1276-L1453 (178 lines) |
| `UIHelpers.syncBodyModalLock` | `static public method` | **L1458 - L1481** | `() => any` | ซิงค์สถานะล็อกสกรอลล์พื้นหลัง (body.bma-modal-open) ตาม Modal ที่กำลังเปิดอยู่ |
| `UIHelpers.prepareModalOpen` | `static public method` | **L1487 - L1497** | `(modalEl) => any` | static public method L1487-L1497 (11 lines) |
| `UIHelpers.bindModalDismiss` | `static public method` | **L1504 - L1548** | `(modalEl, closeCallback) => any` | static public method L1504-L1548 (45 lines) |
| `onEsc` | `arrow_fn` | **L1529 - L1545** | `(e) => inferred` | Arrow Function L1529-L1545 |

---

## File: `assets/js/models/AttendanceModel.js`
- **Layer:** Data Model & Supabase Repository Layer
- **Hash:** `dbb1be9681748edc` | **Total Lines:** `3464` | **Imports:** `5` | **Exports:** `AttendanceModel`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `AttendanceModel` | `class` | **L12 - L3464** | `export class AttendanceModel` | Class Definition (3453 lines) |
| `AttendanceModel.clearLocationCache` | `static public method` | **L16 - L18** | `() => any` | static public method L16-L18 (3 lines) |
| `AttendanceModel.#calculateDistanceMeters` | `static private method` | **L20 - L31** | `(lat1, lon1, lat2, lon2) => any` | static private method L20-L31 (12 lines) |
| `AttendanceModel.#minutesToTime24` | `static private method` | **L33 - L38** | `(totalMinutes) => any` | static private method L33-L38 (6 lines) |
| `AttendanceModel.#isForbiddenLocationTerm` | `static private method` | **L48 - L94** | `(rawName, tags = {}) => any` | static private method L48-L94 (47 lines) |
| `AttendanceModel.#classifyTargetPlace` | `static private method` | **L106 - L197** | `(tags = {}, name = '') => any` | static private method L106-L197 (92 lines) |
| `AttendanceModel.#extractValidPlaceFromNominatim` | `static private method` | **L204 - L248** | `(nomData) => any` | static private method L204-L248 (45 lines) |
| `AttendanceModel.#extractCleanSoiOrSubSoi` | `static private method` | **L258 - L326** | `(lat, lng, nominatimList = [], overpassElements = []) => any` | static private method L258-L326 (69 lines) |
| `AttendanceModel.#fetchWithFastTimeout` | `static private async method` | **L328 - L347** | `(url, timeoutMs = 1100, customHeaders = {}) => Promise<any>` | static private async method L328-L347 (20 lines) |
| `AttendanceModel.#queryOverpassFast` | `static private async method` | **L349 - L370** | `(query, timeoutMs = 2200) => Promise<any>` | static private async method L349-L370 (22 lines) |
| `fetchMirrorWithElements` | `async_arrow_fn` | **L359 - L365** | `(url) => inferred` | แข่งขัน (Race) ดึงข้อมูลจากกระจกเซิร์ฟเวอร์หลายจุด คืนผลลัพธ์ทันทีที่พบ elements แรก |
| `AttendanceModel.#queryArcGISWorldGeocode` | `static private async method` | **L381 - L472** | `(lat, lng, maxDistance = 400, timeoutMs = 1800) => Promise<any>` | static private async method L381-L472 (92 lines) |
| `AttendanceModel.resolveLocationWithZoomMeta` | `static public async method` | **L487 - L828** | `(lat, lng, options = {}) => Promise<any>` | static public async method L487-L828 (342 lines) |
| `classifyElementsWithinRadius` | `arrow_fn` | **L591 - L622** | `(elements, minExclusiveMeters, maxInclusiveMeters) => inferred` | Helper คัดแยกสถานที่เป้าหมายจาก Overpass พร้อมคำนวณระยะห่างจริง |
| `AttendanceModel.resolveLocationName` | `static public async method` | **L837 - L840** | `(lat, lng, options = {}) => Promise<any>` | static public async method L837-L840 (4 lines) |
| `AttendanceModel.normalizeSearchQuery` | `static public method` | **L847 - L865** | `(query) => any` | static public method L847-L865 (19 lines) |
| `AttendanceModel.#mapArcGISTypeToCategory` | `static private method` | **L874 - L913** | `(arcType = '', addrType = '', name = '') => any` | static private method L874-L913 (40 lines) |
| `AttendanceModel.#mapOsmTypeToCategory` | `static private method` | **L922 - L958** | `(osmKey = '', osmVal = '', name = '') => any` | static private method L922-L958 (37 lines) |
| `AttendanceModel.#queryArcGISForwardGeocode` | `static private async method` | **L966 - L1033** | `(query, options = {}) => Promise<any>` | static private async method L966-L1033 (68 lines) |
| `AttendanceModel.#queryPhotonForwardGeocode` | `static private async method` | **L1041 - L1109** | `(query, options = {}) => Promise<any>` | static private async method L1041-L1109 (69 lines) |
| `AttendanceModel.#queryNominatimForwardGeocode` | `static private async method` | **L1117 - L1198** | `(query, options = {}) => Promise<any>` | static private async method L1117-L1198 (82 lines) |
| `AttendanceModel.searchPlaces` | `static public async method` | **L1215 - L1350** | `(query, options = {}) => Promise<any>` | static public async method L1215-L1350 (136 lines) |
| `AttendanceModel.calculateGpsJitter` | `static public method` | **L1360 - L1374** | `(lat, lng, maxRadiusMeters = 20, minRadiusMeters = null) => any` | static public method L1360-L1374 (15 lines) |
| `AttendanceModel.resolveJitteredCheckoutWithLocation` | `static public async method` | **L1384 - L1425** | `(baseLat, baseLng, radiusMeters = 20, maxAttempts = 3) => Promise<any>` | static public async method L1384-L1425 (42 lines) |
| `AttendanceModel.#resolveShiftTimesForLog` | `static private method` | **L1434 - L1460** | `(log, settings) => any` | static private method L1434-L1460 (27 lines) |
| `AttendanceModel.evaluateOfficialStatus` | `static public method` | **L1462 - L1556** | `(log, settings) => any` | static public method L1462-L1556 (95 lines) |
| `AttendanceModel.getActiveRegularRecordForCheckout` | `static public async method` | **L1585 - L1616** | `(personnelId, userId, settings) => Promise<any>` | static public async method L1585-L1616 (32 lines) |
| `AttendanceModel.evaluateSplitAttendanceStatus` | `static public method` | **L1624 - L1710** | `(log, settings) => any` | static public method L1624-L1710 (87 lines) |
| `AttendanceModel.getPersonalAttendanceHistory` | `static public async method` | **L1712 - L1762** | `(personnelId, userId, limit = 35) => Promise<any>` | static public async method L1712-L1762 (51 lines) |
| `buildQuery` | `arrow_fn` | **L1718 - L1732** | `(columns) => inferred` | Arrow Function L1718-L1732 |
| `AttendanceModel.getPersonalSpecialRequests` | `static public async method` | **L1764 - L1810** | `(personnelId, userId) => Promise<any>` | static public async method L1764-L1810 (47 lines) |
| `AttendanceModel.deletePendingSpecialRequestByUser` | `static public async method` | **L1812 - L1846** | `(logId, personnelId, userId) => Promise<any>` | static public async method L1812-L1846 (35 lines) |
| `AttendanceModel.submitCheckinOrCheckout` | `static public async method` | **L1848 - L2286** | `(payload) => Promise<any>` | static public async method L1848-L2286 (439 lines) |
| `AttendanceModel.submitSpecialRequest` | `static public async method` | **L2288 - L2401** | `(payload) => Promise<any>` | static public async method L2288-L2401 (114 lines) |
| `AttendanceModel.getSpecialRequests` | `static public async method` | **L2403 - L2473** | `(currentUser, statusFilter = 'pending') => Promise<any>` | static public async method L2403-L2473 (71 lines) |
| `AttendanceModel.processSpecialRequestsBulk` | `static public async method` | **L2475 - L2544** | `(logIds, decision, approverUserId) => Promise<any>` | static public async method L2475-L2544 (70 lines) |
| `AttendanceModel.#buildCorrectedRemark` | `static private method` | **L2553 - L2581** | `(log) => any` | static private method L2553-L2581 (29 lines) |
| `isMeaningful` | `arrow_fn` | **L2562 - L2565** | `(val) => inferred` | Arrow Function L2562-L2565 |
| `AttendanceModel.#computeCorrectionTarget` | `static private method` | **L2589 - L2626** | `(log, settings) => any` | static private method L2589-L2626 (38 lines) |
| `AttendanceModel.getPersonalTimeCorrectionLogs` | `static public async method` | **L2632 - L2690** | `(personnelId, userId, settingsOverride = null) => Promise<any>` | (ไม่ติดเพดาน limit(35) และไม่รวมสถานะ "ไม่ลงเวลา") |
| `buildQuery` | `arrow_fn` | **L2639 - L2651** | `(columns) => inferred` | Arrow Function L2639-L2651 |
| `AttendanceModel.submitTimeCorrectionRequest` | `static public async method` | **L2695 - L2771** | `(logId, currentUser, reason = '') => Promise<any>` | ผู้ใช้งานส่งคำขอแก้ไขเวลาเข้า-ออกงานสำหรับรายการที่ระบุ (เหตุผล Optional) |
| `AttendanceModel.getTimeCorrectionRequests` | `static public async method` | **L2776 - L2874** | `(currentUser, statusFilter = 'pending') => Promise<any>` | ดึงรายการคำขอแก้ไขเวลาสำหรับผู้ดูแลระบบ พร้อมข้อมูลผู้ขอ (Role) และสิทธิ์การอนุมัติ |
| `AttendanceModel.processTimeCorrectionsBulk` | `static public async method` | **L2883 - L3011** | `(logIds, isApprovedOrDecision, currentUser, rejectReason = '') => Promise<any>` | static public async method L2883-L3011 (129 lines) |
| `AttendanceModel.getDatesBetween` | `static public method` | **L3013 - L3030** | `(startDate, endDate) => any` | static public method L3013-L3030 (18 lines) |
| `AttendanceModel.getReportRecordsByDateRange` | `static public async method` | **L3032 - L3103** | `(startDate, endDate, currentUser) => Promise<any>` | static public async method L3032-L3103 (72 lines) |
| `AttendanceModel.#formatReportRow` | `static private method` | **L3105 - L3155** | `(person, log, workDate, evalStatus) => any` | static private method L3105-L3155 (51 lines) |
| `AttendanceModel.getDailyReportRecords` | `static public async method` | **L3157 - L3159** | `(workDate, currentUser) => Promise<any>` | static public async method L3157-L3159 (3 lines) |
| `AttendanceModel.saveAdminAttendanceRecord` | `static public async method` | **L3161 - L3330** | `(payload) => Promise<any>` | static public async method L3161-L3330 (170 lines) |
| `AttendanceModel.deleteAttendanceRecord` | `static public async method` | **L3332 - L3350** | `(logId) => Promise<any>` | static public async method L3332-L3350 (19 lines) |
| `AttendanceModel.calculateDashboardMetrics` | `static public method` | **L3352 - L3415** | `(dailyRecords) => any` | static public method L3352-L3415 (64 lines) |
| `AttendanceModel.getTodaySyncWatermark` | `static public async method` | **L3421 - L3463** | `() => Promise<any>` | static public async method L3421-L3463 (43 lines) |

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
- **Hash:** `c4f79a379956b75d` | **Total Lines:** `552` | **Imports:** `3` | **Exports:** `SettingsModel`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SettingsModel` | `class` | **L10 - L552** | `export class SettingsModel` | Class Definition (543 lines) |
| `SettingsModel.formatShiftDisplayText` | `static public method` | **L17 - L37** | `(shift) => any` | static public method L17-L37 (21 lines) |
| `SettingsModel.getSettings` | `static public async method` | **L39 - L228** | `(forceRefresh = false) => Promise<any>` | static public async method L39-L228 (190 lines) |
| `SettingsModel.updateSettings` | `static public async method` | **L230 - L467** | `(payload) => Promise<any>` | static public async method L230-L467 (238 lines) |
| `isMissingColErr` | `arrow_fn` | **L299 - L307** | `(err) => inferred` | Arrow Function L299-L307 |
| `SettingsModel.moveItemInArray` | `static public method` | **L469 - L478** | `(arr, fromIndex, direction) => any` | static public method L469-L478 (10 lines) |
| `SettingsModel.fileToDataUrl` | `static public method` | **L480 - L487** | `(file) => any` | static public method L480-L487 (8 lines) |
| `SettingsModel.getUniquePositionTypes` | `static public method` | **L489 - L492** | `(settings) => any` | static public method L489-L492 (4 lines) |
| `SettingsModel.getUniquePositionTitles` | `static public method` | **L494 - L500** | `(settings, filterType = '') => any` | static public method L494-L500 (7 lines) |
| `SettingsModel.getUniquePositionLevels` | `static public method` | **L502 - L511** | `(settings, filterType = '', filterTitle = '') => any` | static public method L502-L511 (10 lines) |
| `SettingsModel.getUniqueOrganizations` | `static public method` | **L513 - L517** | `(settings) => any` | static public method L513-L517 (5 lines) |
| `SettingsModel.getUniqueBureaus` | `static public method` | **L519 - L526** | `(settings, filterOrg = '') => any` | static public method L519-L526 (8 lines) |
| `SettingsModel.getUniqueDivisions` | `static public method` | **L528 - L537** | `(settings, filterBureau = '', filterOrg = '') => any` | static public method L528-L537 (10 lines) |
| `SettingsModel.getUniqueGroups` | `static public method` | **L539 - L551** | `(settings, filterBureau = '', filterDivision = '', filterOrg = '') => any` | static public method L539-L551 (13 lines) |

---

## File: `assets/js/models/UserModel.js`
- **Layer:** Data Model & Supabase Repository Layer
- **Hash:** `766a58b289b1c2be` | **Total Lines:** `390` | **Imports:** `3` | **Exports:** `UserModel`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `UserModel` | `class` | **L10 - L390** | `export class UserModel` | Class Definition (381 lines) |
| `UserModel.getAll` | `static public async method` | **L17 - L54** | `(currentUser) => Promise<any>` | static public async method L17-L54 (38 lines) |
| `UserModel.getPendingPasswordResetRequests` | `static public async method` | **L61 - L64** | `(currentUser) => Promise<any>` | static public async method L61-L64 (4 lines) |
| `UserModel.create` | `static public async method` | **L72 - L134** | `(payload, currentUser) => Promise<any>` | static public async method L72-L134 (63 lines) |
| `UserModel.update` | `static public async method` | **L143 - L195** | `(id, payload, currentUser) => Promise<any>` | static public async method L143-L195 (53 lines) |
| `UserModel.delete` | `static public async method` | **L203 - L227** | `(id, currentUser) => Promise<any>` | static public async method L203-L227 (25 lines) |
| `UserModel.processPasswordResetRequest` | `static public async method` | **L237 - L321** | `(userId, isApproved, currentUser = null) => Promise<any>` | static public async method L237-L321 (85 lines) |
| `UserModel.bulkImportFromExcel` | `static public async method` | **L329 - L370** | `(excelRows, currentUser) => Promise<any>` | static public async method L329-L370 (42 lines) |
| `UserModel.getExcelTemplateRows` | `static public method` | **L376 - L389** | `() => any` | static public method L376-L389 (14 lines) |

---

## File: `assets/js/utils/DOMDiffHelper.js`
- **Layer:** Application Module
- **Hash:** `10662234de402079` | **Total Lines:** `249` | **Imports:** `0` | **Exports:** `DOMDiffHelper`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `DOMDiffHelper` | `class` | **L6 - L248** | `export class DOMDiffHelper` | ผู้ช่วยจัดการ DOM แบบ Differential Sync และ Animation สำหรับตารางและตัวชี้วัดในระบบ |
| `DOMDiffHelper.reindexTableSequence` | `static public method` | **L13 - L27** | `(tbody, seqSelector = '.seq-num', startIndex = 1) => any` | static public method L13-L27 (15 lines) |
| `DOMDiffHelper.lockRowForConcurrentAdmin` | `static public method` | **L35 - L55** | `(rowEl, adminName = 'ผู้ดูแลระบบ', actionText = 'อนุมัติแล้ว') => any` | static public method L35-L55 (21 lines) |
| `DOMDiffHelper.prependRowWithAnimation` | `static public method` | **L64 - L83** | `(tbody, rowHtml, highlightClass = 'row-enter-highlight') => any` | static public method L64-L83 (20 lines) |
| `DOMDiffHelper.reindexCardSequence` | `static public method` | **L92 - L106** | `(container, cardSelector = '[data-card-item]', seqSelector = '.seq-num', startIndex = 1) => any` | static public method L92-L106 (15 lines) |
| `DOMDiffHelper.lockCardForConcurrentAdmin` | `static public method` | **L114 - L142** | `(cardEl, adminName = 'ผู้ดูแลระบบ', actionText = 'อนุมัติแล้ว') => any` | static public method L114-L142 (29 lines) |
| `DOMDiffHelper.prependCardWithAnimation` | `static public method` | **L151 - L168** | `(container, cardHtml, highlightClass = 'row-enter-highlight') => any` | static public method L151-L168 (18 lines) |
| `DOMDiffHelper.removeRowWithFade` | `static public method` | **L176 - L191** | `(rowEl, durationMs = 600, onComplete = null) => any` | static public method L176-L191 (16 lines) |
| `DOMDiffHelper.highlightRowUpdate` | `static public method` | **L197 - L205** | `(rowEl) => any` | static public method L197-L205 (9 lines) |
| `DOMDiffHelper.animateNumericValue` | `static public method` | **L214 - L247** | `(element, startVal, endVal, durationMs = 800) => any` | static public method L214-L247 (34 lines) |
| `step` | `arrow_fn` | **L229 - L245** | `(currentTime) => inferred` | Arrow Function L229-L245 |

---

## File: `checkin.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `b3ca66ca1380346c` | **Total Lines:** `1138` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L179** | `<head>` | HTML DOM Section L3-L179 |
| `<main>` | `html_dom_section` | **L265 - L701** | `<main>` | HTML DOM Section L265-L701 |
| `<div#checkinWorkspaceWrapper>` | `html_dom_section` | **L268 - L511** | `id="checkinWorkspaceWrapper"` | HTML DOM Section L268-L511 |
| `<div#photoPreviewCard>` | `html_dom_section` | **L311 - L332** | `id="photoPreviewCard"` | HTML DOM Section L311-L332 |
| `<div#gpsSectionCard>` | `html_dom_section` | **L335 - L372** | `id="gpsSectionCard"` | HTML DOM Section L335-L372 |
| `<div#googleMapEmbedWrapper>` | `html_dom_section` | **L369 - L369** | `id="googleMapEmbedWrapper"` | HTML DOM Section L369-L369 |
| `<div#onsiteGeofenceStatusCard>` | `html_dom_section` | **L393 - L404** | `id="onsiteGeofenceStatusCard"` | HTML DOM Section L393-L404 |
| `<div#offsiteLocationSection>` | `html_dom_section` | **L407 - L443** | `id="offsiteLocationSection"` | HTML DOM Section L407-L443 |
| `<div#offsiteRemarkChipsContainer>` | `html_dom_section` | **L439 - L439** | `id="offsiteRemarkChipsContainer"` | HTML DOM Section L439-L439 |
| `<div#checkinActionCard>` | `html_dom_section` | **L447 - L480** | `id="checkinActionCard"` | HTML DOM Section L447-L480 |
| `<div#shiftSelectorContainer>` | `html_dom_section` | **L457 - L462** | `id="shiftSelectorContainer"` | HTML DOM Section L457-L462 |
| `<div#mainCustomTimeContainer>` | `html_dom_section` | **L464 - L473** | `id="mainCustomTimeContainer"` | HTML DOM Section L464-L473 |
| `<div#checkinStep1Container>` | `html_dom_section` | **L493 - L493** | `id="checkinStep1Container"` | HTML DOM Section L493-L493 |
| `<div#checkinStep2Container>` | `html_dom_section` | **L494 - L494** | `id="checkinStep2Container"` | HTML DOM Section L494-L494 |
| `<div#rightColumnWrapper>` | `html_dom_section` | **L495 - L495** | `id="rightColumnWrapper"` | HTML DOM Section L495-L495 |
| `<div#cameraSectionCard>` | `html_dom_section` | **L499 - L499** | `id="cameraSectionCard"` | HTML DOM Section L499-L499 |
| `<div#cameraStandbyOverlay>` | `html_dom_section` | **L507 - L507** | `id="cameraStandbyOverlay"` | HTML DOM Section L507-L507 |
| `<div#desktopPanesContainer>` | `html_dom_section` | **L514 - L699** | `id="desktopPanesContainer"` | HTML DOM Section L514-L699 |
| `<div#desktopHistoryWrapper>` | `html_dom_section` | **L517 - L612** | `id="desktopHistoryWrapper"` | HTML DOM Section L517-L612 |
| `<div#todayHistoryTabPanel>` | `html_dom_section` | **L543 - L563** | `id="todayHistoryTabPanel"` | HTML DOM Section L543-L563 |
| `<div#todayPersonalCardsContainer>` | `html_dom_section` | **L544 - L544** | `id="todayPersonalCardsContainer"` | HTML DOM Section L544-L544 |
| `<div#pastHistoryTabPanel>` | `html_dom_section` | **L566 - L609** | `id="pastHistoryTabPanel"` | HTML DOM Section L566-L609 |
| `<div#pastPersonalCardsContainer>` | `html_dom_section` | **L581 - L581** | `id="pastPersonalCardsContainer"` | HTML DOM Section L581-L581 |
| `<div#desktopSpecialWrapper>` | `html_dom_section` | **L615 - L658** | `id="desktopSpecialWrapper"` | HTML DOM Section L615-L658 |
| `<div#personalSpecialRequestsCardsContainer>` | `html_dom_section` | **L637 - L637** | `id="personalSpecialRequestsCardsContainer"` | HTML DOM Section L637-L637 |
| `<div#desktopCorrectionWrapper>` | `html_dom_section` | **L661 - L697** | `id="desktopCorrectionWrapper"` | HTML DOM Section L661-L697 |
| `<div#personalTimeCorrectionCardsContainer>` | `html_dom_section` | **L677 - L677** | `id="personalTimeCorrectionCardsContainer"` | HTML DOM Section L677-L677 |
| `<div#mobileDrawerPanel>` | `html_dom_section` | **L709 - L805** | `id="mobileDrawerPanel"` | HTML DOM Section L709-L805 |
| `<div#spCustomTimeContainer>` | `html_dom_section` | **L839 - L848** | `id="spCustomTimeContainer"` | HTML DOM Section L839-L848 |
| `<div#spOnsiteSection>` | `html_dom_section` | **L876 - L883** | `id="spOnsiteSection"` | HTML DOM Section L876-L883 |
| `<div#spOffsiteSection>` | `html_dom_section` | **L886 - L967** | `id="spOffsiteSection"` | HTML DOM Section L886-L967 |
| `<div#spOffsiteReasonContainer>` | `html_dom_section` | **L887 - L894** | `id="spOffsiteReasonContainer"` | HTML DOM Section L887-L894 |
| `<div#spSearchWrapper>` | `html_dom_section` | **L936 - L942** | `id="spSearchWrapper"` | HTML DOM Section L936-L942 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L995 - L995** | `<script>` | Bootstrap script L995-L995 |

---

## File: `dashboard.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `0886d8a9d58b4e1e` | **Total Lines:** `284` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L116** | `<head>` | HTML DOM Section L3-L116 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L120 - L120** | `id="bmaSidebarContainer"` | HTML DOM Section L120-L120 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L126 - L126** | `id="bmaTopbarContainer"` | HTML DOM Section L126-L126 |
| `<main>` | `html_dom_section` | **L129 - L273** | `<main>` | HTML DOM Section L129-L273 |
| `<div#mobileShortcutContainer>` | `html_dom_section` | **L132 - L132** | `id="mobileShortcutContainer"` | HTML DOM Section L132-L132 |
| `<div#dashboardRecentCardsContainer>` | `html_dom_section` | **L249 - L249** | `id="dashboardRecentCardsContainer"` | HTML DOM Section L249-L249 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L276 - L276** | `id="bmaFooterContainer"` | HTML DOM Section L276-L276 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L282 - L282** | `<script>` | Bootstrap script L282-L282 |

---

## File: `docs/manual/index.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `a90442b03aab373f` | **Total Lines:** `695` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L58** | `<head>` | HTML DOM Section L3-L58 |
| `<main>` | `html_dom_section` | **L130 - L633** | `<main>` | HTML DOM Section L130-L633 |

---

## File: `docs/manual/manual-admin.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `b4ff69ac53546dca` | **Total Lines:** `1318` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L57** | `<head>` | HTML DOM Section L3-L57 |
| `<div#mobileTocPanel>` | `html_dom_section` | **L96 - L107** | `id="mobileTocPanel"` | HTML DOM Section L96-L107 |
| `<main>` | `html_dom_section` | **L177 - L1094** | `<main>` | HTML DOM Section L177-L1094 |
| `<div#mockupModal>` | `html_dom_section` | **L1103 - L1129** | `id="mockupModal"` | HTML DOM Section L1103-L1129 |
| `<div#mockupModalPanel>` | `html_dom_section` | **L1105 - L1128** | `id="mockupModalPanel"` | HTML DOM Section L1105-L1128 |

---

## File: `docs/manual/manual-superadmin.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `bfb5fc0bc076f031` | **Total Lines:** `1574` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L57** | `<head>` | HTML DOM Section L3-L57 |
| `<div#mobileTocPanel>` | `html_dom_section` | **L96 - L107** | `id="mobileTocPanel"` | HTML DOM Section L96-L107 |
| `<main>` | `html_dom_section` | **L173 - L1322** | `<main>` | HTML DOM Section L173-L1322 |
| `<div#mockupModal>` | `html_dom_section` | **L1331 - L1357** | `id="mockupModal"` | HTML DOM Section L1331-L1357 |
| `<div#mockupModalPanel>` | `html_dom_section` | **L1333 - L1356** | `id="mockupModalPanel"` | HTML DOM Section L1333-L1356 |

---

## File: `docs/manual/manual-user.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `57c920a616ac7d05` | **Total Lines:** `1410` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L57** | `<head>` | HTML DOM Section L3-L57 |
| `<div#mobileTocPanel>` | `html_dom_section` | **L96 - L107** | `id="mobileTocPanel"` | HTML DOM Section L96-L107 |
| `<main>` | `html_dom_section` | **L170 - L1170** | `<main>` | HTML DOM Section L170-L1170 |
| `<div#mockupModal>` | `html_dom_section` | **L1179 - L1205** | `id="mockupModal"` | HTML DOM Section L1179-L1205 |
| `<div#mockupModalPanel>` | `html_dom_section` | **L1181 - L1204** | `id="mockupModalPanel"` | HTML DOM Section L1181-L1204 |

---

## File: `google_apps_script/DriveUploadBridge.gs`
- **Layer:** Google Apps Script Serverless Bridge
- **Hash:** `daec72808c19da2e` | **Total Lines:** `124` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `doGet` | `function` | **L7 - L12** | `(e) => inferred` | และคืนค่า Direct URL เพื่อให้ Supabase จัดเก็บเฉพาะ URL เท่านั้น |
| `doPost` | `function` | **L14 - L75** | `(e) => inferred` | Function L14-L75 |
| `handleVerifyFolder` | `function` | **L77 - L93** | `(folderId, strictFolder) => inferred` | Function L77-L93 |
| `getOrCreateTargetFolder` | `function` | **L95 - L113** | `(folderId, strictFolder) => inferred` | Function L95-L113 |
| `extractFolderIdFromInput` | `function` | **L115 - L118** | `(input) => inferred` | Function L115-L118 |
| `createJsonResponse` | `function` | **L120 - L124** | `(obj) => inferred` | Function L120-L124 |

---

## File: `index.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `9026bb75c5d3b6c4` | **Total Lines:** `436` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L193** | `<head>` | HTML DOM Section L3-L193 |
| `<div#mobileOrgLogoWrapper>` | `html_dom_section` | **L218 - L218** | `id="mobileOrgLogoWrapper"` | HTML DOM Section L218-L218 |
| `<main>` | `html_dom_section` | **L225 - L337** | `<main>` | HTML DOM Section L225-L337 |
| `<div#orgLogoWrapper>` | `html_dom_section` | **L232 - L234** | `id="orgLogoWrapper"` | HTML DOM Section L232-L234 |
| `<form#loginForm>` | `html_dom_section` | **L246 - L334** | `id="loginForm"` | HTML DOM Section L246-L334 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L434 - L434** | `<script>` | Bootstrap script L434-L434 |

---

## File: `loading.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `146ad4601ce4e7b1` | **Total Lines:** `449` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L301** | `<head>` | HTML DOM Section L3-L301 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L447 - L447** | `<script>` | Bootstrap script L447-L447 |

---

## File: `personnel.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `2529033f93f98cf1` | **Total Lines:** `694` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L117** | `<head>` | HTML DOM Section L3-L117 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L121 - L121** | `id="bmaSidebarContainer"` | HTML DOM Section L121-L121 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L125 - L125** | `id="bmaTopbarContainer"` | HTML DOM Section L125-L125 |
| `<main>` | `html_dom_section` | **L127 - L264** | `<main>` | HTML DOM Section L127-L264 |
| `<div#personnelCardsContainer>` | `html_dom_section` | **L240 - L240** | `id="personnelCardsContainer"` | HTML DOM Section L240-L240 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L266 - L266** | `id="bmaFooterContainer"` | HTML DOM Section L266-L266 |
| `<div#modalPersonnelForm>` | `html_dom_section` | **L272 - L385** | `id="modalPersonnelForm"` | HTML DOM Section L272-L385 |
| `<div#bulkImportPreviewContainer>` | `html_dom_section` | **L605 - L646** | `id="bulkImportPreviewContainer"` | HTML DOM Section L605-L646 |
| `<div#bulkImportProgressContainer>` | `html_dom_section` | **L666 - L674** | `id="bulkImportProgressContainer"` | HTML DOM Section L666-L674 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L692 - L692** | `<script>` | Bootstrap script L692-L692 |

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

## File: `pipeline/PIPE-20261111-checkin-camera-lifecycle-fix/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `4089bfbc498cc6a7` | **Total Lines:** `250` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261111-checkin-camera-lifecycle-fix/qa_camera_stream_protection_test.mjs`
- **Layer:** Application Module
- **Hash:** `71b631730bc074b2` | **Total Lines:** `492` | **Imports:** `4` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runTest` | `function` | **L20 - L31** | `(testName, fn) => inferred` | Function L20-L31 |
| `runAsyncTest` | `async_function` | **L33 - L44** | `(testName, fn) => inferred` | Function L33-L44 |
| `setupControllerHarness` | `function` | **L104 - L492** | `(options = {}) => inferred` | ------------------------------------------------------------- |
| `getOrCreateElem` | `function` | **L106 - L134** | `(id) => inferred` | Function L106-L134 |
| `createChainableProxy` | `function` | **L146 - L170** | `(table = '') => inferred` | Function L146-L170 |

---

## File: `pipeline/PIPE-20261111-checkin-gps-nearby-places-algorithm-redesign/audit_cache_sync.mjs`
- **Layer:** Application Module
- **Hash:** `33b4e39f15afc3e5` | **Total Lines:** `50` | **Imports:** `1` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261111-checkin-gps-nearby-places-algorithm-redesign/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `8c4b8fd2770a6869` | **Total Lines:** `212` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L13** | `<head>` | HTML DOM Section L3-L13 |

---

## File: `pipeline/PIPE-20261111-checkin-gps-nearby-places-algorithm-redesign/qa_unit_mock_tests.mjs`
- **Layer:** Application Module
- **Hash:** `618a241232fe53e6` | **Total Lines:** `430` | **Imports:** `1` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L11 - L19** | `(condition, testName, details = '') => inferred` | Function L11-L19 |
| `runMockUnitTests` | `async_function` | **L21 - L424** | `() => inferred` | Function L21-L424 |

---

## File: `pipeline/PIPE-20261111-checkin-gps-nearby-places-algorithm-redesign/qa_verify_gps_button_lock.mjs`
- **Layer:** Application Module
- **Hash:** `4c5b9a0a06b4987b` | **Total Lines:** `45` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L9 - L17** | `(condition, message) => inferred` | Function L9-L17 |

---

## File: `pipeline/PIPE-20261111-checkin-gps-nearby-places-algorithm-redesign/qa_verify_gps_places.mjs`
- **Layer:** Application Module
- **Hash:** `4b5fd299d3159aeb` | **Total Lines:** `194` | **Imports:** `5` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runTests` | `async_function` | **L14 - L188** | `() => inferred` | Function L14-L188 |
| `assert` | `function` | **L22 - L30** | `(condition, testName, details = '') => inferred` | Function L22-L30 |

---

## File: `pipeline/PIPE-20261111-gps-refresh-cachebust-and-clock-format-fix/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `b3250c98e3e18ed4` | **Total Lines:** `248` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L13** | `<head>` | HTML DOM Section L3-L13 |

---

## File: `pipeline/PIPE-20261111-gps-refresh-cachebust-and-clock-format-fix/qa_adversarial_verification.mjs`
- **Layer:** Application Module
- **Hash:** `3a8e926f76937ffd` | **Total Lines:** `107` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runTest` | `function` | **L11 - L20** | `(name, fn) => inferred` | Function L11-L20 |
| `assert` | `public method` | **L38 - L43** | `(block.includes('if (res?.ready) => any` | public method L38-L43 (6 lines) |
| `assert` | `public method` | **L77 - L81** | `(block.includes('if (gpsRes?.ready) => any` | public method L77-L81 (5 lines) |

---

## File: `pipeline/PIPE-20261111-gps-refresh-cachebust-and-clock-format-fix/qa_verify_gps_refresh_and_clock.mjs`
- **Layer:** Application Module
- **Hash:** `771827f9e89f9565` | **Total Lines:** `64` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `check` | `function` | **L12 - L20** | `(desc, condition) => inferred` | Function L12-L20 |
| `formatTimeHHmm` | `function` | **L52 - L56** | `(date) => inferred` | 4. Test Clock Formatter Logic |

---

## File: `pipeline/PIPE-20261111-gps-refresh-cachebust-and-clock-format-fix/test_full_verification.mjs`
- **Layer:** Application Module
- **Hash:** `1b1cd903588333db` | **Total Lines:** `191` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `test` | `function` | **L12 - L21** | `(desc, fn) => inferred` | Function L12-L21 |
| `simulateInitGpsLocation` | `async_function` | **L109 - L129** | `({ forceRefresh = false } = {}) => inferred` | Simulate #initGpsLocation logic with forceRefresh = true |
| `simulateInitGpsLocation` | `async_function` | **L154 - L174** | `({ forceRefresh = false } = {}) => inferred` | Function L154-L174 |

---

## File: `pipeline/PIPE-20261111-login-version-badge-and-whats-new-modal/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `482ae9522e98fa0b` | **Total Lines:** `290` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L16** | `<head>` | HTML DOM Section L3-L16 |
| `<div#activeOOPModal>` | `html_dom_section` | **L220 - L271** | `id="activeOOPModal"` | HTML DOM Section L220-L271 |

---

## File: `pipeline/PIPE-20261111-login-version-badge-and-whats-new-modal/qa_regression_preflight_audit.mjs`
- **Layer:** Application Module
- **Hash:** `bbe37b558bba82da` | **Total Lines:** `66` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `check` | `function` | **L13 - L21** | `(desc, condition) => inferred` | Function L13-L21 |

---

## File: `pipeline/PIPE-20261111-login-version-badge-and-whats-new-modal/qa_stress_edge_cases.mjs`
- **Layer:** Application Module
- **Hash:** `aff2048a6ed002bd` | **Total Lines:** `190` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `check` | `async_function` | **L13 - L23** | `(name, fn) => inferred` | Function L13-L23 |
| `run` | `async_function` | **L25 - L184** | `() => inferred` | Function L25-L184 |

---

## File: `pipeline/PIPE-20261111-login-version-badge-and-whats-new-modal/verify_login_version_badge_modal.mjs`
- **Layer:** Application Module
- **Hash:** `6b0e318bd230b7c5` | **Total Lines:** `275` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `test` | `async_function` | **L13 - L23** | `(description, fn) => inferred` | Function L13-L23 |
| `runSuite` | `async_function` | **L25 - L275** | `() => inferred` | Function L25-L275 |
| `MockElement` | `class` | **L134 - L183** | `class MockElement` | Class Definition (50 lines) |

---

## File: `pipeline/PIPE-20261111-reports-print-pdf-pagebreak-fix/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `21f532f6f2e96b0a` | **Total Lines:** `258` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261111-reports-print-pdf-pagebreak-fix/qa_adversarial_deep_audit.mjs`
- **Layer:** Application Module
- **Hash:** `4fd5e25ecb67b95b` | **Total Lines:** `281` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runTest` | `function` | **L12 - L22** | `(name, fn) => inferred` | Function L12-L22 |

---

## File: `pipeline/PIPE-20261111-reports-print-pdf-pagebreak-fix/qa_comprehensive_audit.mjs`
- **Layer:** Application Module
- **Hash:** `e36b0752341bf8c7` | **Total Lines:** `139` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runTest` | `function` | **L12 - L22** | `(name, fn) => inferred` | Function L12-L22 |

---

## File: `pipeline/PIPE-20261111-reports-print-pdf-pagebreak-fix/qa_html_tags_deep_audit.mjs`
- **Layer:** Application Module
- **Hash:** `210b26a8c1603ab9` | **Total Lines:** `42` | **Imports:** `1` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261111-reports-print-pdf-pagebreak-fix/qa_print_simulation_test.mjs`
- **Layer:** Application Module
- **Hash:** `8ceac785762c57bc` | **Total Lines:** `152` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runTest` | `function` | **L47 - L57** | `(name, fn) => inferred` | Function L47-L57 |

---

## File: `pipeline/PIPE-20261111-reports-print-pdf-pagebreak-fix/verify_pagebreak_rules.mjs`
- **Layer:** Application Module
- **Hash:** `ce02121fd6cbee88` | **Total Lines:** `123` | **Imports:** `3` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261112-arcgis-forward-search-modals/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `09dc9139f36c8556` | **Total Lines:** `378` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L15** | `<head>` | HTML DOM Section L3-L15 |

---

## File: `pipeline/PIPE-20261112-arcgis-forward-search-modals/preflight_forward_search_simulation.mjs`
- **Layer:** Application Module
- **Hash:** `573023b649fb4832` | **Total Lines:** `64` | **Imports:** `1` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `queryArcGIS` | `async_function` | **L19 - L40** | `(singleLine) => inferred` | Function L19-L40 |

---

## File: `pipeline/PIPE-20261112-arcgis-forward-search-modals/qa_audit_test_suite.mjs`
- **Layer:** Application Module
- **Hash:** `9f8427e6aec77e01` | **Total Lines:** `363` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `it` | `function` | **L11 - L22** | `(name, fn) => inferred` | Function L11-L22 |
| `itAsync` | `async_function` | **L24 - L35** | `(name, fn) => inferred` | Function L24-L35 |

---

## File: `pipeline/PIPE-20261112-arcgis-forward-search-modals/verify_cache_sync.mjs`
- **Layer:** Application Module
- **Hash:** `16e79d04c52cc7f8` | **Total Lines:** `29` | **Imports:** `1` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261112-arcgis-primary-places-resolution/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `82e9d84f5289d02e` | **Total Lines:** `200` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261112-arcgis-primary-places-resolution/preflight_arcgis_simulation.mjs`
- **Layer:** Application Module
- **Hash:** `434dc204883e6319` | **Total Lines:** `131` | **Imports:** `1` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `calculateDistanceMeters` | `function` | **L12 - L22** | `(lat1, lon1, lat2, lon2) => inferred` | 4. Fallback chain behaves idempotently without unhandled rejections. |
| `parseArcGISResponse` | `function` | **L24 - L57** | `(data, userLat, userLng, maxDistMeters = 400) => inferred` | Function L24-L57 |
| `runPreflightTests` | `async_function` | **L59 - L125** | `() => inferred` | Function L59-L125 |

---

## File: `pipeline/PIPE-20261112-arcgis-primary-places-resolution/test_attendance_model_arcgis.mjs`
- **Layer:** Application Module
- **Hash:** `44f250e6f084eca4` | **Total Lines:** `395` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `isForbiddenLocationTerm` | `function` | **L23 - L69** | `(rawName, tags = {}) => inferred` | Function L23-L69 |
| `classifyTargetPlace` | `function` | **L71 - L162** | `(tags = {}, name = '') => inferred` | Function L71-L162 |
| `calculateDistanceMeters` | `function` | **L164 - L174** | `(lat1, lon1, lat2, lon2) => inferred` | Function L164-L174 |
| `testLiveArcGIS` | `async_function` | **L279 - L384** | `() => inferred` | Function L279-L384 |

---

## File: `pipeline/PIPE-20261112-arcgis-primary-places-resolution/test_attendance_model_e2e.mjs`
- **Layer:** Application Module
- **Hash:** `6e353677c22c5903` | **Total Lines:** `92` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runEndToEndVerification` | `async_function` | **L22 - L81** | `() => inferred` | Function L22-L81 |

---

## File: `pipeline/PIPE-20261113-remove-special-request-btn-from-shift-card/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `b85b5690967fefa7` | **Total Lines:** `222` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L15** | `<head>` | HTML DOM Section L3-L15 |

---

## File: `pipeline/PIPE-20261113-remove-special-request-btn-from-shift-card/preflight_plan_verification.mjs`
- **Layer:** Application Module
- **Hash:** `15e72590d71fbc93` | **Total Lines:** `35` | **Imports:** `2` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261113-remove-special-request-btn-from-shift-card/qa_post_implementation_test.mjs`
- **Layer:** Application Module
- **Hash:** `05afa63faeeeff18` | **Total Lines:** `162` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L12 - L20** | `(condition, message) => inferred` | Function L12-L20 |
| `MockDOMElement` | `class` | **L101 - L116** | `class MockDOMElement` | Class Definition (16 lines) |
| `MockDOMElement.constructor` | `public constructor` | **L102 - L107** | `(id, tag = 'DIV') => any` | public constructor L102-L107 (6 lines) |
| `MockDOMElement.addEventListener` | `public method` | **L108 - L111** | `(event, callback) => any` | public method L108-L111 (4 lines) |
| `MockDOMElement.click` | `public method` | **L112 - L115** | `() => any` | public method L112-L115 (4 lines) |
| `openSpecialModal` | `arrow_fn` | **L126 - L129** | `() => inferred` | Arrow Function L126-L129 |
| `closeSpecialModal` | `arrow_fn` | **L130 - L132** | `() => inferred` | Arrow Function L130-L132 |

---

## File: `pipeline/PIPE-20261113-reports-table-gps-and-remarks-redesign/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `7e1c6e0d00300ff3` | **Total Lines:** `170` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L35** | `<head>` | HTML DOM Section L3-L35 |
| `<main>` | `html_dom_section` | **L65 - L162** | `<main>` | HTML DOM Section L65-L162 |

---

## File: `pipeline/PIPE-20261113-reports-table-gps-and-remarks-redesign/preflight_plan_verification.mjs`
- **Layer:** Application Module
- **Hash:** `2fee2287d6d2fbd6` | **Total Lines:** `48` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L12 - L20** | `(condition, desc) => inferred` | Function L12-L20 |

---

## File: `pipeline/PIPE-20261113-reports-table-gps-and-remarks-redesign/qa_reports_redesign_verification.mjs`
- **Layer:** Application Module
- **Hash:** `a5c1a6776e47939c` | **Total Lines:** `588` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L17 - L27** | `(condition, testName, details = '') => inferred` | Function L17-L27 |
| `buildExcelRow` | `function` | **L100 - L128** | `(controller, rec, idx = 1) => inferred` | Helper to simulate Excel export row generation matching ReportsController.#bindEvents |

---

## File: `pipeline/PIPE-20261113-special-request-mode-and-reports-remarks-redesign/qa_adversarial_deep_audit.mjs`
- **Layer:** Application Module
- **Hash:** `ee99ddc0ecb52330` | **Total Lines:** `225` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L14 - L24** | `(condition, testName, details = '') => inferred` | Function L14-L24 |

---

## File: `pipeline/PIPE-20261113-special-request-mode-and-reports-remarks-redesign/qa_special_request_mode_verification.mjs`
- **Layer:** Application Module
- **Hash:** `e5bb15ed3728a226` | **Total Lines:** `433` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L33 - L43** | `(condition, testName, details = '') => inferred` | Function L33-L43 |
| `buildExcelRow` | `function` | **L222 - L250** | `(controller, rec, idx = 1) => inferred` | Function L222-L250 |
| `assert` | `public method` | **L400 - L411** | `(buildMatch && buildMatch[1] === expectedBuildId, `Test 6.2 (${file}) => CURRENT_APP_BUILD matches version.json ($` | public method L400-L411 (12 lines) |
| `assert` | `public method` | **L412 - L423** | `(fileAssetsSynced && assetCount > 0, `Test 6.3 (${file}) => all $` | public method L412-L423 (12 lines) |

---

## File: `pipeline/PIPE-20261113-split-dropdowns-and-special-request-official-locations/qa_deep_adversarial_verification.mjs`
- **Layer:** Application Module
- **Hash:** `4562c61b56167fba` | **Total Lines:** `456` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `mockDbUpsert` | `async_arrow_fn` | **L24 - L41** | `(payload) => inferred` | Arrow Function L24-L41 |
| `safeLoad` | `arrow_fn` | **L106 - L113** | `(rawStored, defaultVal) => inferred` | Safe loader logic |
| `formatReportRemark` | `arrow_fn` | **L147 - L172** | `(rec, forExcel = false) => inferred` | Arrow Function L147-L172 |
| `formatApprovalsRowElements` | `arrow_fn` | **L220 - L233** | `(req) => inferred` | Arrow Function L220-L233 |
| `evaluateCheckoutCoords` | `arrow_fn` | **L375 - L388** | `(locMode, lat, lng, locName, randomizeGps) => inferred` | Simulate ONSITE special request checkout logic |
| `formatApprovalsRemark` | `arrow_fn` | **L431 - L440** | `(req) => inferred` | Arrow Function L431-L440 |

---

## File: `pipeline/PIPE-20261113-split-dropdowns-and-special-request-official-locations/qa_split_dropdowns_verification.mjs`
- **Layer:** Application Module
- **Hash:** `0dfe8b171bf47e8f` | **Total Lines:** `103` | **Imports:** `4` | **Exports:** `None`

> *ไม่มีฟังก์ชันหรือคลาสย่อย (อาจเป็นไฟล์ Config, Types หรือ Constants — อ่านเฉพาะส่วนที่ต้องการ)*

---

## File: `pipeline/PIPE-20261114-approvals-remark-two-line/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `e433a99f8a02dcc7` | **Total Lines:** `124` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L12** | `<head>` | HTML DOM Section L3-L12 |

---

## File: `pipeline/PIPE-20261114-approvals-remark-two-line/qa_real_instance_test.mjs`
- **Layer:** Application Module
- **Hash:** `5618b32df35273b3` | **Total Lines:** `280` | **Imports:** `1` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `createMockElement` | `function` | **L6 - L30** | `(tag = 'div', id = '') => inferred` | Function L6-L30 |
| `testRealApprovalsController` | `async_function` | **L68 - L274** | `() => inferred` | Function L68-L274 |
| `getRowHtml` | `function` | **L190 - L193** | `(id) => inferred` | Function L190-L193 |

---

## File: `pipeline/PIPE-20261114-approvals-remark-two-line/test_approvals_remark.mjs`
- **Layer:** Application Module
- **Hash:** `08b7a6ef3cad9055` | **Total Lines:** `367` | **Imports:** `1` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `run` | `async_function` | **L31 - L361** | `() => inferred` | Function L31-L361 |

---

## File: `pipeline/PIPE-20261116-fix-mobile-logout-session-camera/qa_fix_mobile_logout_session_camera.mjs`
- **Layer:** Application Module
- **Hash:** `d629aba93c0c1598` | **Total Lines:** `1681` | **Imports:** `7` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runTest` | `function` | **L38 - L49** | `(name, fn) => inferred` | Function L38-L49 |
| `runAsyncTest` | `async_function` | **L51 - L62** | `(name, fn) => inferred` | Function L51-L62 |
| `makeMockStream` | `function` | **L64 - L82** | `(harness, opts = {}) => inferred` | Function L64-L82 |
| `stop` | `public method` | **L69 - L73** | `() => any` | public method L69-L73 (5 lines) |
| `createSharedMockDb` | `function` | **L86 - L137** | `() => inferred` | Function L86-L137 |
| `createChainableProxy` | `function` | **L87 - L132** | `(table = '', op = 'select', isSingle = false) => inferred` | Function L87-L132 |
| `setupBrowserHarness` | `function` | **L142 - L469** | `(options = {}) => inferred` | Function L142-L469 |
| `MockClassList` | `class` | **L151 - L169** | `class MockClassList` | Class Definition (19 lines) |
| `MockClassList.constructor` | `public constructor` | **L152 - L154** | `(initial = []) => any` | public constructor L152-L154 (3 lines) |
| `MockClassList.contains` | `public method` | **L155 - L155** | `(c) => any` | public method L155-L155 (1 lines) |
| `MockClassList.add` | `public method` | **L156 - L156** | `(...cls) => any` | public method L156-L156 (1 lines) |
| `MockClassList.remove` | `public method` | **L157 - L157** | `(...cls) => any` | public method L157-L157 (1 lines) |
| `MockClassList.toggle` | `public method` | **L158 - L167** | `(c, force) => any` | public method L158-L167 (10 lines) |
| `MockClassList.toString` | `public method` | **L168 - L168** | `() => any` | public method L168-L168 (1 lines) |
| `getOrCreateElem` | `function` | **L171 - L269** | `(id, defaults = {}) => inferred` | Function L171-L269 |
| `cleanup` | `public method` | **L304 - L307** | `() => any` | public method L304-L307 (4 lines) |
| `addEventListener` | `public method` | **L354 - L354** | `(t, fn) => any` | public method L354-L354 (1 lines) |
| `removeEventListener` | `public method` | **L355 - L355** | `() => any` | public method L355-L355 (1 lines) |
| `dispatchEvent` | `public method` | **L356 - L356** | `(evt) => any` | public method L356-L356 (1 lines) |
| `constructor` | `public constructor` | **L395 - L398** | `(type, init = {}) => any` | public constructor L395-L398 (4 lines) |
| `addEventListener` | `public method` | **L407 - L407** | `(t, fn) => any` | public method L407-L407 (1 lines) |
| `removeEventListener` | `public method` | **L408 - L408** | `() => any` | public method L408-L408 (1 lines) |
| `readAsDataURL` | `public method` | **L417 - L425** | `() => any` | public method L417-L425 (9 lines) |
| `flushMicrotasks` | `async_function` | **L471 - L473** | `(ms = 30) => inferred` | Function L471-L473 |
| `main` | `async_function` | **L475 - L703** | `() => inferred` | Function L475-L703 |
| `walkAssets` | `arrow_fn` | **L502 - L512** | `(dir, out = []) => inferred` | Arrow Function L502-L512 |
| `runPurgeScenario` | `async_arrow_fn` | **L564 - L638** | `({ storedBuild, remoteBuildResponse }) => inferred` | Arrow Function L564-L638 |

---

## File: `pipeline/PIPE-20261116-loading-entry-screen/qa_runtime_deep_simulation.mjs`
- **Layer:** Application Module
- **Hash:** `38178ea0e866941a` | **Total Lines:** `526` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L18 - L27** | `(cond, desc) => inferred` | Function L18-L27 |
| `sanitizeAndResolveLogo` | `function` | **L36 - L55** | `(rawUrl, fallbackUrl) => inferred` | Function L36-L55 |
| `resolveTargetUrl` | `function` | **L264 - L270** | `(redirectUrl, sessionUser) => inferred` | Function L264-L270 |
| `simulateHydrate` | `function` | **L294 - L324** | `(localStore, sessionStore) => inferred` | Function L294-L324 |
| `MockClassList` | `class` | **L380 - L387** | `class MockClassList` | 8.5: DOM #renderOrgLogo stateful simulation (onerror preservation vs URL switch) |
| `MockClassList.constructor` | `public constructor` | **L381 - L383** | `(classes = []) => any` | public constructor L381-L383 (3 lines) |
| `MockClassList.add` | `public method` | **L384 - L384** | `(c) => any` | public method L384-L384 (1 lines) |
| `MockClassList.remove` | `public method` | **L385 - L385** | `(c) => any` | public method L385-L385 (1 lines) |
| `MockClassList.contains` | `public method` | **L386 - L386** | `(c) => any` | public method L386-L386 (1 lines) |
| `getAttribute` | `public method` | **L392 - L392** | `(k) => any` | public method L392-L392 (1 lines) |
| `simulateRenderOrgLogo` | `function` | **L403 - L424** | `(rawUrl, imgEl, fallbackEl) => inferred` | Function L403-L424 |
| `simulateSyncBrand` | `function` | **L461 - L488** | `(settings) => inferred` | Function L461-L488 |

---

## File: `pipeline/PIPE-20261116-loading-entry-screen/qa_test_suite.mjs`
- **Layer:** Application Module
- **Hash:** `7daab173e933aa12` | **Total Lines:** `431` | **Imports:** `3` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `assert` | `function` | **L41 - L50** | `(condition, message) => inferred` | Function L41-L50 |

---

## File: `pipeline/PIPE-20261117-move-announcement-drive-folder-to-tab1/qa_tab1_announcement_folder_test.mjs`
- **Layer:** Application Module
- **Hash:** `d57e5ddd76c57aee` | **Total Lines:** `893` | **Imports:** `4` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `test` | `function` | **L13 - L22** | `(name, fn) => inferred` | Function L13-L22 |
| `testAsync` | `async_function` | **L24 - L33** | `(name, fn) => inferred` | Function L24-L33 |
| `MockStorage` | `class` | **L38 - L44** | `class MockStorage` | ============================================================================ |
| `MockStorage.constructor` | `public constructor` | **L39 - L39** | `() => any` | public constructor L39-L39 (1 lines) |
| `MockStorage.getItem` | `public method` | **L40 - L40** | `(k) => any` | public method L40-L40 (1 lines) |
| `MockStorage.setItem` | `public method` | **L41 - L41** | `(k, v) => any` | public method L41-L41 (1 lines) |
| `MockStorage.removeItem` | `public method` | **L42 - L42** | `(k) => any` | public method L42-L42 (1 lines) |
| `MockStorage.clear` | `public method` | **L43 - L43** | `() => any` | public method L43-L43 (1 lines) |
| `MockClassList` | `class` | **L46 - L67** | `class MockClassList` | Class Definition (22 lines) |
| `MockClassList.constructor` | `public constructor` | **L47 - L47** | `(el) => any` | public constructor L47-L47 (1 lines) |
| `MockClassList._tokens` | `public method` | **L48 - L48** | `() => any` | public method L48-L48 (1 lines) |
| `MockClassList._save` | `public method` | **L49 - L49** | `(tokens) => any` | public method L49-L49 (1 lines) |
| `MockClassList.add` | `public method` | **L50 - L54** | `(...cls) => any` | public method L50-L54 (5 lines) |
| `MockClassList.remove` | `public method` | **L55 - L58** | `(...cls) => any` | public method L55-L58 (4 lines) |
| `MockClassList.contains` | `public method` | **L59 - L59** | `(c) => any` | public method L59-L59 (1 lines) |
| `MockClassList.toggle` | `public method` | **L60 - L66** | `(c, force) => any` | public method L60-L66 (7 lines) |
| `parseAttributes` | `function` | **L69 - L77** | `(attrStr) => inferred` | Function L69-L77 |
| `parseHtmlIntoChildren` | `function` | **L79 - L130** | `(parent, html) => inferred` | Function L79-L130 |
| `collectText` | `function` | **L132 - L136** | `(el) => inferred` | Function L132-L136 |
| `matchesSimpleSelector` | `function` | **L138 - L171** | `(el, part) => inferred` | Function L138-L171 |
| `querySelectorAllInTree` | `function` | **L173 - L198** | `(root, selector) => inferred` | Function L173-L198 |
| `walk` | `function` | **L177 - L194** | `(node, ancestors) => inferred` | Function L177-L194 |
| `findByIdInTree` | `function` | **L200 - L207** | `(root, id) => inferred` | Function L200-L207 |
| `createMockElement` | `function` | **L209 - L310** | `(tag = 'div', id = '') => inferred` | Function L209-L310 |
| `setAttribute` | `public method` | **L244 - L248** | `(k, v) => any` | public method L244-L248 (5 lines) |
| `getAttribute` | `public method` | **L249 - L253** | `(k) => any` | public method L249-L253 (5 lines) |
| `appendChild` | `public method` | **L254 - L258** | `(child) => any` | public method L254-L258 (5 lines) |
| `removeChild` | `public method` | **L259 - L262** | `(child) => any` | public method L259-L262 (4 lines) |
| `remove` | `public method` | **L263 - L263** | `() => any` | public method L263-L263 (1 lines) |
| `addEventListener` | `public method` | **L264 - L264** | `(ev, fn) => any` | public method L264-L264 (1 lines) |
| `removeEventListener` | `public method` | **L265 - L268** | `(ev, fn) => any` | public method L265-L268 (4 lines) |
| `dispatchEventAsync` | `public async method` | **L269 - L280** | `(ev) => Promise<any>` | public async method L269-L280 (12 lines) |
| `dispatchEvent` | `public method` | **L281 - L290** | `(ev) => any` | public method L281-L290 (10 lines) |
| `click` | `public method` | **L291 - L294** | `() => any` | public method L291-L294 (4 lines) |
| `focus` | `public method` | **L295 - L295** | `(opts = undefined) => any` | public method L295-L295 (1 lines) |
| `scrollIntoView` | `public method` | **L296 - L296** | `() => any` | public method L296-L296 (1 lines) |
| `querySelector` | `public method` | **L297 - L297** | `(sel) => any` | public method L297-L297 (1 lines) |
| `querySelectorAll` | `public method` | **L298 - L298** | `(sel) => any` | public method L298-L298 (1 lines) |
| `closest` | `public method` | **L299 - L306** | `(sel) => any` | public method L299-L306 (8 lines) |
| `makeQueryChain` | `function` | **L368 - L414** | `(table) => inferred` | Function L368-L414 |
| `select` | `public method` | **L371 - L371** | `() => any` | public method L371-L371 (1 lines) |
| `eq` | `public method` | **L372 - L372** | `() => any` | public method L372-L372 (1 lines) |
| `neq` | `public method` | **L373 - L373** | `() => any` | public method L373-L373 (1 lines) |
| `in` | `public method` | **L374 - L374** | `() => any` | public method L374-L374 (1 lines) |
| `order` | `public method` | **L375 - L375** | `() => any` | public method L375-L375 (1 lines) |
| `limit` | `public method` | **L376 - L376** | `() => any` | public method L376-L376 (1 lines) |
| `maybeSingle` | `public method` | **L377 - L377** | `() => any` | public method L377-L377 (1 lines) |
| `single` | `public method` | **L378 - L378** | `() => any` | public method L378-L378 (1 lines) |
| `update` | `public method` | **L379 - L385** | `(patch) => any` | public method L379-L385 (7 lines) |
| `upsert` | `public method` | **L386 - L392** | `(patch) => any` | public method L386-L392 (7 lines) |
| `then` | `public method` | **L393 - L411** | `(resolve) => any` | public method L393-L411 (19 lines) |
| `from` | `public method` | **L417 - L417** | `(table) => any` | public method L417-L417 (1 lines) |
| `channel` | `public method` | **L418 - L421** | `() => any` | public method L418-L421 (4 lines) |
| `addEventListener` | `public method` | **L432 - L432** | `() => any` | public method L432-L432 (1 lines) |
| `removeEventListener` | `public method` | **L433 - L433** | `() => any` | public method L433-L433 (1 lines) |
| `dispatchEvent` | `public method` | **L434 - L434** | `() => any` | public method L434-L434 (1 lines) |
| `createElement` | `public method` | **L441 - L441** | `(tag) => any` | public method L441-L441 (1 lines) |
| `getElementById` | `public method` | **L442 - L442** | `(id) => any` | public method L442-L442 (1 lines) |
| `getElementsByTagName` | `public method` | **L443 - L443** | `() => any` | public method L443-L443 (1 lines) |
| `querySelector` | `public method` | **L444 - L444** | `(sel) => any` | public method L444-L444 (1 lines) |
| `querySelectorAll` | `public method` | **L445 - L445** | `(sel) => any` | public method L445-L445 (1 lines) |
| `addEventListener` | `public method` | **L446 - L446** | `() => any` | public method L446-L446 (1 lines) |
| `removeEventListener` | `public method` | **L447 - L447** | `() => any` | public method L447-L447 (1 lines) |
| `mountRealSettingsDom` | `function` | **L549 - L555** | `() => inferred` | Function L549-L555 |

---

## File: `pipeline/PIPE-20261117-sidebar-active-state-and-realtime-settings-fix/qa_sidebar_active_sync_test.mjs`
- **Layer:** Application Module
- **Hash:** `e5d19958621a7251` | **Total Lines:** `1017` | **Imports:** `4` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `test` | `function` | **L12 - L21** | `(name, fn) => inferred` | Function L12-L21 |
| `testAsync` | `async_function` | **L23 - L32** | `(name, fn) => inferred` | Function L23-L32 |
| `MockStorage` | `class` | **L37 - L43** | `class MockStorage` | ============================================================================ |
| `MockStorage.constructor` | `public constructor` | **L38 - L38** | `() => any` | public constructor L38-L38 (1 lines) |
| `MockStorage.getItem` | `public method` | **L39 - L39** | `(k) => any` | public method L39-L39 (1 lines) |
| `MockStorage.setItem` | `public method` | **L40 - L40** | `(k, v) => any` | public method L40-L40 (1 lines) |
| `MockStorage.removeItem` | `public method` | **L41 - L41** | `(k) => any` | public method L41-L41 (1 lines) |
| `MockStorage.clear` | `public method` | **L42 - L42** | `() => any` | public method L42-L42 (1 lines) |
| `MockClassList` | `class` | **L45 - L72** | `class MockClassList` | Class Definition (28 lines) |
| `MockClassList.constructor` | `public constructor` | **L46 - L46** | `(el) => any` | public constructor L46-L46 (1 lines) |
| `MockClassList._tokens` | `public method` | **L47 - L49** | `() => any` | public method L47-L49 (3 lines) |
| `MockClassList._save` | `public method` | **L50 - L52** | `(tokens) => any` | public method L50-L52 (3 lines) |
| `MockClassList.add` | `public method` | **L53 - L57** | `(...cls) => any` | public method L53-L57 (5 lines) |
| `MockClassList.remove` | `public method` | **L58 - L61** | `(...cls) => any` | public method L58-L61 (4 lines) |
| `MockClassList.contains` | `public method` | **L62 - L64** | `(c) => any` | public method L62-L64 (3 lines) |
| `MockClassList.toggle` | `public method` | **L65 - L71** | `(c, force) => any` | public method L65-L71 (7 lines) |
| `parseAttributes` | `function` | **L74 - L84** | `(attrStr) => inferred` | Function L74-L84 |
| `parseHtmlIntoChildren` | `function` | **L86 - L139** | `(parent, html) => inferred` | Function L86-L139 |
| `collectText` | `function` | **L141 - L145** | `(el) => inferred` | Function L141-L145 |
| `matchesSimpleSelector` | `function` | **L147 - L180** | `(el, part) => inferred` | Function L147-L180 |
| `querySelectorAllInTree` | `function` | **L182 - L211** | `(root, selector) => inferred` | Function L182-L211 |
| `walk` | `function` | **L186 - L205** | `(node, ancestors) => inferred` | Function L186-L205 |
| `findByIdInTree` | `function` | **L213 - L220** | `(root, id) => inferred` | Function L213-L220 |
| `createMockElement` | `function` | **L222 - L319** | `(tag = 'div', id = '') => inferred` | Function L222-L319 |
| `setAttribute` | `public method` | **L253 - L257** | `(k, v) => any` | public method L253-L257 (5 lines) |
| `getAttribute` | `public method` | **L258 - L262** | `(k) => any` | public method L258-L262 (5 lines) |
| `appendChild` | `public method` | **L263 - L267** | `(child) => any` | public method L263-L267 (5 lines) |
| `removeChild` | `public method` | **L268 - L271** | `(child) => any` | public method L268-L271 (4 lines) |
| `remove` | `public method` | **L272 - L274** | `() => any` | public method L272-L274 (3 lines) |
| `cloneNode` | `public method` | **L275 - L288** | `() => any` | public method L275-L288 (14 lines) |
| `addEventListener` | `public method` | **L289 - L292** | `(ev, fn) => any` | public method L289-L292 (4 lines) |
| `removeEventListener` | `public method` | **L293 - L296** | `(ev, fn) => any` | public method L293-L296 (4 lines) |
| `dispatchEvent` | `public method` | **L297 - L301** | `(ev) => any` | public method L297-L301 (5 lines) |
| `querySelector` | `public method` | **L302 - L304** | `(sel) => any` | public method L302-L304 (3 lines) |
| `querySelectorAll` | `public method` | **L305 - L307** | `(sel) => any` | public method L305-L307 (3 lines) |
| `closest` | `public method` | **L308 - L315** | `(sel) => any` | public method L308-L315 (8 lines) |
| `MockCustomEvent` | `class` | **L332 - L337** | `class MockCustomEvent` | Class Definition (6 lines) |
| `MockCustomEvent.constructor` | `public constructor` | **L333 - L336** | `(type, init = {}) => any` | public constructor L333-L336 (4 lines) |
| `pushState` | `public method` | **L343 - L343** | `() => any` | public method L343-L343 (1 lines) |
| `replaceState` | `public method` | **L344 - L344** | `() => any` | public method L344-L344 (1 lines) |
| `makeQueryChain` | `function` | **L410 - L495** | `(table) => inferred` | Function L410-L495 |
| `select` | `public method` | **L414 - L414** | `(cols) => any` | public method L414-L414 (1 lines) |
| `eq` | `public method` | **L415 - L415** | `() => any` | public method L415-L415 (1 lines) |
| `neq` | `public method` | **L416 - L416** | `() => any` | public method L416-L416 (1 lines) |
| `in` | `public method` | **L417 - L417** | `() => any` | public method L417-L417 (1 lines) |
| `order` | `public method` | **L418 - L418** | `() => any` | public method L418-L418 (1 lines) |
| `limit` | `public method` | **L419 - L419** | `() => any` | public method L419-L419 (1 lines) |
| `maybeSingle` | `public method` | **L420 - L420** | `() => any` | public method L420-L420 (1 lines) |
| `single` | `public method` | **L421 - L421** | `() => any` | public method L421-L421 (1 lines) |
| `update` | `public method` | **L422 - L427** | `(patch) => any` | public method L422-L427 (6 lines) |
| `upsert` | `public method` | **L428 - L433** | `(patch) => any` | public method L428-L433 (6 lines) |
| `then` | `public method` | **L434 - L492** | `(resolve, reject) => any` | public method L434-L492 (59 lines) |
| `from` | `public method` | **L498 - L500** | `(table) => any` | public method L498-L500 (3 lines) |
| `channel` | `public method` | **L501 - L516** | `(name) => any` | public method L501-L516 (16 lines) |
| `replace` | `public method` | **L525 - L525** | `() => any` | public method L525-L525 (1 lines) |
| `createClient` | `public method` | **L529 - L529** | `() => any` | public method L529-L529 (1 lines) |
| `addEventListener` | `public method` | **L532 - L535** | `(type, fn) => any` | public method L532-L535 (4 lines) |
| `removeEventListener` | `public method` | **L536 - L539** | `(type, fn) => any` | public method L536-L539 (4 lines) |
| `dispatchEvent` | `public method` | **L540 - L544** | `(ev) => any` | public method L540-L544 (5 lines) |
| `createElement` | `public method` | **L555 - L555** | `(tag) => any` | public method L555-L555 (1 lines) |
| `getElementById` | `public method` | **L556 - L556** | `(id) => any` | public method L556-L556 (1 lines) |
| `querySelector` | `public method` | **L557 - L557** | `(sel) => any` | public method L557-L557 (1 lines) |
| `querySelectorAll` | `public method` | **L558 - L558** | `(sel) => any` | public method L558-L558 (1 lines) |
| `addEventListener` | `public method` | **L559 - L562** | `(type, fn) => any` | public method L559-L562 (4 lines) |
| `dispatchEvent` | `public method` | **L563 - L566** | `(ev) => any` | public method L563-L566 (4 lines) |
| `mountAdminDomContainers` | `function` | **L570 - L584** | `() => inferred` | Mount base admin shell containers into mockBody |
| `parseFromString` | `public method` | **L939 - L955** | `(html) => any` | public method L939-L955 (17 lines) |

---

## File: `pipeline/PIPE-20261117-system-announcement-and-v2-10-sync/qa_v2_10_announcement_verification.mjs`
- **Layer:** Application Module
- **Hash:** `d669838bd3068fcc` | **Total Lines:** `640` | **Imports:** `4` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `test` | `function` | **L13 - L22** | `(name, fn) => inferred` | Function L13-L22 |
| `testAsync` | `async_function` | **L24 - L33** | `(name, fn) => inferred` | Function L24-L33 |
| `MockStorage` | `class` | **L38 - L44** | `class MockStorage` | ========================================================================= |
| `MockStorage.constructor` | `public constructor` | **L39 - L39** | `() => any` | public constructor L39-L39 (1 lines) |
| `MockStorage.getItem` | `public method` | **L40 - L40** | `(k) => any` | public method L40-L40 (1 lines) |
| `MockStorage.setItem` | `public method` | **L41 - L41** | `(k, v) => any` | public method L41-L41 (1 lines) |
| `MockStorage.removeItem` | `public method` | **L42 - L42** | `(k) => any` | public method L42-L42 (1 lines) |
| `MockStorage.clear` | `public method` | **L43 - L43** | `() => any` | public method L43-L43 (1 lines) |
| `createMockElement` | `function` | **L46 - L83** | `(tag = 'div', id = '') => inferred` | Function L46-L83 |
| `setAttribute` | `public method` | **L65 - L65** | `(k, v) => any` | public method L65-L65 (1 lines) |
| `getAttribute` | `public method` | **L66 - L66** | `(k) => any` | public method L66-L66 (1 lines) |
| `appendChild` | `public method` | **L67 - L67** | `(child) => any` | public method L67-L67 (1 lines) |
| `removeChild` | `public method` | **L68 - L71** | `(child) => any` | public method L68-L71 (4 lines) |
| `addEventListener` | `public method` | **L72 - L72** | `(ev, fn) => any` | public method L72-L72 (1 lines) |
| `querySelector` | `public method` | **L73 - L80** | `(sel) => any` | public method L73-L80 (8 lines) |
| `addEventListener` | `public method` | **L106 - L106** | `() => any` | public method L106-L106 (1 lines) |
| `removeEventListener` | `public method` | **L107 - L107** | `() => any` | public method L107-L107 (1 lines) |
| `dispatchEvent` | `public method` | **L108 - L108** | `() => any` | public method L108-L108 (1 lines) |
| `createElement` | `public method` | **L114 - L114** | `(tag) => any` | public method L114-L114 (1 lines) |
| `getElementById` | `public method` | **L115 - L118** | `(id) => any` | public method L115-L118 (4 lines) |
| `getElementsByTagName` | `public method` | **L119 - L119** | `() => any` | public method L119-L119 (1 lines) |
| `querySelector` | `public method` | **L120 - L123** | `(sel) => any` | public method L120-L123 (4 lines) |
| `from` | `public method` | **L349 - L376** | `() => any` | public method L349-L376 (28 lines) |
| `broadcastRealtimeEvent` | `public method` | **L383 - L383** | `(ev, p) => any` | public method L383-L383 (1 lines) |
| `from` | `public method` | **L421 - L447** | `() => any` | public method L421-L447 (27 lines) |
| `broadcastRealtimeEvent` | `public method` | **L454 - L454** | `() => any` | public method L454-L454 (1 lines) |
| `from` | `public method` | **L479 - L502** | `() => any` | public method L479-L502 (24 lines) |

---

## File: `pipeline/PIPE-20261118-admin-mobile-cards-and-users-tabs/qa_admin_mobile_cards_users_tabs_test.mjs`
- **Layer:** Application Module
- **Hash:** `345c986f95dba2c2` | **Total Lines:** `598` | **Imports:** `2` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runTest` | `function` | **L13 - L24** | `(name, fn) => inferred` | Function L13-L24 |
| `runAsyncTest` | `async_function` | **L26 - L37** | `(name, fn) => inferred` | Function L26-L37 |
| `checkBalancedHtmlTags` | `function` | **L39 - L57** | `(filePath, html) => inferred` | Function L39-L57 |
| `setupMockEnv` | `function` | **L59 - L598** | `(options = {}) => inferred` | Function L59-L598 |
| `MockClassList` | `class` | **L70 - L92** | `class MockClassList` | Class Definition (23 lines) |
| `MockClassList.constructor` | `public constructor` | **L71 - L74** | `(el, initial = []) => any` | public constructor L71-L74 (4 lines) |
| `MockClassList.contains` | `public method` | **L75 - L75** | `(c) => any` | public method L75-L75 (1 lines) |
| `MockClassList.add` | `public method` | **L76 - L76** | `(...cls) => any` | public method L76-L76 (1 lines) |
| `MockClassList.remove` | `public method` | **L77 - L77** | `(...cls) => any` | public method L77-L77 (1 lines) |
| `MockClassList.toggle` | `public method` | **L78 - L90** | `(c, force) => any` | public method L78-L90 (13 lines) |
| `MockClassList.toString` | `public method` | **L91 - L91** | `() => any` | public method L91-L91 (1 lines) |
| `createEl` | `function` | **L94 - L191** | `(id, initialClasses = [], attrs = {}) => inferred` | Function L94-L191 |
| `walk` | `arrow_fn` | **L169 - L177** | `(n) => inferred` | Arrow Function L169-L177 |
| `getOrCreateElem` | `function` | **L193 - L198** | `(id, initialClasses = [], attrs = {}) => inferred` | Function L193-L198 |
| `constructor` | `public constructor` | **L255 - L258** | `(type, init = {}) => any` | public constructor L255-L258 (4 lines) |
| `cleanup` | `public method` | **L283 - L288** | `() => any` | public method L283-L288 (6 lines) |

---

## File: `pipeline/PIPE-20261118-admin-mobile-modals-clipping-fix/qa_v48_mobile_modals_test.mjs`
- **Layer:** Application Module
- **Hash:** `d1f5bda826731db1` | **Total Lines:** `602` | **Imports:** `5` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runTest` | `function` | **L29 - L40** | `(name, fn) => inferred` | Function L29-L40 |
| `runAsyncTest` | `async_function` | **L42 - L53** | `(name, fn) => inferred` | Function L42-L53 |
| `checkBalancedHtmlTags` | `function` | **L55 - L76** | `(filePath, html) => inferred` | Function L55-L76 |
| `startStaticServer` | `function` | **L78 - L602** | `() => inferred` | Function L78-L602 |
| `buildMockSettingsRow` | `function` | **L123 - L154** | `() => inferred` | Function L123-L154 |
| `buildMockSupabaseRows` | `function` | **L156 - L207** | `() => inferred` | Function L156-L207 |
| `setupBrowserPage` | `async_function` | **L209 - L269** | `(browser, buildId, viewport, options = {}) => inferred` | Function L209-L269 |
| `assertModalGeometry` | `async_function` | **L271 - L319** | `(page, modalSelector, expectedZ, options = {}) => inferred` | Function L271-L319 |
| `main` | `async_function` | **L321 - L596** | `() => inferred` | Function L321-L596 |

---

## File: `pipeline/PIPE-20261118-mobile-cards-and-drawer-spa-redesign/qa_mobile_cards_drawer_spa_test.mjs`
- **Layer:** Application Module
- **Hash:** `56e5aae88d606770` | **Total Lines:** `774` | **Imports:** `4` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runTest` | `function` | **L15 - L26** | `(name, fn) => inferred` | Function L15-L26 |
| `runAsyncTest` | `async_function` | **L28 - L39** | `(name, fn) => inferred` | Function L28-L39 |
| `createHarness` | `function` | **L41 - L774** | `(options = {}) => inferred` | Function L41-L774 |
| `MockClassList` | `class` | **L50 - L78** | `class MockClassList` | Class Definition (29 lines) |
| `MockClassList.constructor` | `public constructor` | **L51 - L54** | `(el, initial = []) => any` | public constructor L51-L54 (4 lines) |
| `MockClassList.contains` | `public method` | **L55 - L55** | `(c) => any` | public method L55-L55 (1 lines) |
| `MockClassList.add` | `public method` | **L56 - L59** | `(...cls) => any` | public method L56-L59 (4 lines) |
| `MockClassList.remove` | `public method` | **L60 - L63** | `(...cls) => any` | public method L60-L63 (4 lines) |
| `MockClassList.toggle` | `public method` | **L64 - L76** | `(c, force) => any` | public method L64-L76 (13 lines) |
| `MockClassList.toString` | `public method` | **L77 - L77** | `() => any` | public method L77-L77 (1 lines) |
| `getOrCreateElem` | `function` | **L80 - L161** | `(id, initialClasses = []) => inferred` | Function L80-L161 |
| `cleanup` | `public method` | **L276 - L281** | `() => any` | public method L276-L281 (6 lines) |

---

## File: `pipeline/PIPE-20261119-time-correction-request-and-approvals/qa_v49_time_correction_test.mjs`
- **Layer:** Application Module
- **Hash:** `f7d1c70a1746bbfb` | **Total Lines:** `885` | **Imports:** `5` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runTest` | `function` | **L30 - L41** | `(name, fn) => inferred` | Function L30-L41 |
| `runAsyncTest` | `async_function` | **L43 - L54** | `(name, fn) => inferred` | Function L43-L54 |
| `setupNodeMocks` | `function` | **L56 - L885** | `() => inferred` | Function L56-L885 |
| `constructor` | `public constructor` | **L83 - L83** | `(type, init = {}) => any` | public constructor L83-L83 (1 lines) |
| `createFakeSupabaseDb` | `function` | **L87 - L178** | `(initialLogs = [], initialAccounts = []) => inferred` | Function L87-L178 |
| `makeBuilder` | `arrow_fn` | **L105 - L170** | `(tableName) => inferred` | Arrow Function L105-L170 |
| `exec` | `async_arrow_fn` | **L114 - L145** | `() => inferred` | Arrow Function L114-L145 |
| `startStaticServer` | `function` | **L180 - L885** | `() => inferred` | Function L180-L885 |
| `main` | `async_function` | **L223 - L879** | `() => inferred` | Function L223-L879 |

---

## File: `pipeline/PIPE-20261119-v50-toast-swal-superadmin-rbac/qa_v50_verification_test.mjs`
- **Layer:** Application Module
- **Hash:** `910cd4aba74fdeee` | **Total Lines:** `604` | **Imports:** `5` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runTest` | `function` | **L33 - L43** | `(name, fn) => inferred` | Function L33-L43 |
| `runAsyncTest` | `async_function` | **L45 - L55** | `(name, fn) => inferred` | Function L45-L55 |
| `createDomStubs` | `function` | **L57 - L93** | `() => inferred` | Function L57-L93 |
| `startStaticServer` | `function` | **L95 - L598** | `() => inferred` | Function L95-L598 |
| `main` | `async_function` | **L135 - L183** | `() => inferred` | Function L135-L183 |

---

## File: `pipeline/PIPE-20261119-v51-reports-edit-modal-checkout-logic/qa_v51_reports_edit_modal_test.mjs`
- **Layer:** Application Module
- **Hash:** `6c4d9153c9cb798e` | **Total Lines:** `583` | **Imports:** `5` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `runTest` | `function` | **L35 - L45** | `(name, fn) => inferred` | Function L35-L45 |
| `runAsyncTest` | `async_function` | **L47 - L57** | `(name, fn) => inferred` | Function L47-L57 |
| `createMockSupabaseDb` | `function` | **L59 - L105** | `(seedTables = {}) => inferred` | Function L59-L105 |
| `makeBuilder` | `arrow_fn` | **L65 - L98** | `(tableName) => inferred` | Arrow Function L65-L98 |
| `exec` | `async_arrow_fn` | **L71 - L89** | `() => inferred` | Arrow Function L71-L89 |
| `createDomStubs` | `function` | **L107 - L144** | `() => inferred` | Function L107-L144 |
| `startStaticServer` | `function` | **L146 - L583** | `() => inferred` | Function L146-L583 |
| `main` | `async_function` | **L186 - L577** | `() => inferred` | Function L186-L577 |
| `setupRoutes` | `async_arrow_fn` | **L420 - L449** | `(page) => inferred` | Arrow Function L420-L449 |

---

## File: `reports.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `a32cbe66d88261e1` | **Total Lines:** `556` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L116** | `<head>` | HTML DOM Section L3-L116 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L120 - L120** | `id="bmaSidebarContainer"` | HTML DOM Section L120-L120 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L124 - L124** | `id="bmaTopbarContainer"` | HTML DOM Section L124-L124 |
| `<main>` | `html_dom_section` | **L126 - L283** | `<main>` | HTML DOM Section L126-L283 |
| `<div#reportMobileShortcutContainer>` | `html_dom_section` | **L128 - L128** | `id="reportMobileShortcutContainer"` | HTML DOM Section L128-L128 |
| `<div#statusTagsFilterContainer>` | `html_dom_section` | **L274 - L274** | `id="statusTagsFilterContainer"` | HTML DOM Section L274-L274 |
| `<div#reportTablesMasterContainer>` | `html_dom_section` | **L281 - L281** | `id="reportTablesMasterContainer"` | HTML DOM Section L281-L281 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L285 - L285** | `id="bmaFooterContainer"` | HTML DOM Section L285-L285 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L554 - L554** | `<script>` | Bootstrap script L554-L554 |

---

## File: `settings.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `0e457f573a95f6d4` | **Total Lines:** `1082` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L115** | `<head>` | HTML DOM Section L3-L115 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L119 - L119** | `id="bmaSidebarContainer"` | HTML DOM Section L119-L119 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L123 - L123** | `id="bmaTopbarContainer"` | HTML DOM Section L123-L123 |
| `<main>` | `html_dom_section` | **L125 - L971** | `<main>` | HTML DOM Section L125-L971 |
| `<div#prefixListContainer>` | `html_dom_section` | **L597 - L597** | `id="prefixListContainer"` | HTML DOM Section L597-L597 |
| `<div#offsiteJobTypeListContainer>` | `html_dom_section` | **L614 - L614** | `id="offsiteJobTypeListContainer"` | HTML DOM Section L614-L614 |
| `<div#specialReasonListContainer>` | `html_dom_section` | **L631 - L631** | `id="specialReasonListContainer"` | HTML DOM Section L631-L631 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L973 - L973** | `id="bmaFooterContainer"` | HTML DOM Section L973-L973 |
| `<div#modalAnnouncementPreview>` | `html_dom_section` | **L1001 - L1023** | `id="modalAnnouncementPreview"` | HTML DOM Section L1001-L1023 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L1025 - L1025** | `<script>` | Bootstrap script L1025-L1025 |

---

## File: `sql/alter_v2_10_announcement_staging.sql`
- **Layer:** Database Schema & Migration Layer (PostgreSQL/Supabase)
- **Hash:** `1f0bcb3718339863` | **Total Lines:** `63` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ALTER staging.system_settings (L7)` | `sql_alter` | **L7 - L16** | `ALTER TABLE staging.system_settings` | Schema Alteration L7-L16 |

---

## File: `sql/alter_v2_11_time_correction_public.sql`
- **Layer:** Database Schema & Migration Layer (PostgreSQL/Supabase)
- **Hash:** `22724403b295709c` | **Total Lines:** `54` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ALTER public.attendance_logs (L7)` | `sql_alter` | **L7 - L18** | `ALTER TABLE public.attendance_logs` | Schema Alteration L7-L18 |
| `ALTER public.attendance_logs (L26)` | `sql_alter` | **L26 - L29** | `ALTER TABLE public.attendance_logs` | Schema Alteration L26-L29 |

---

## File: `sql/alter_v2_11_time_correction_staging.sql`
- **Layer:** Database Schema & Migration Layer (PostgreSQL/Supabase)
- **Hash:** `70414da5b3f7a82a` | **Total Lines:** `54` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ALTER staging.attendance_logs (L7)` | `sql_alter` | **L7 - L18** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L7-L18 |
| `ALTER staging.attendance_logs (L26)` | `sql_alter` | **L26 - L29** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L26-L29 |

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
- **Hash:** `e0c7e01341941957` | **Total Lines:** `121` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ALTER public.system_settings (L8)` | `sql_alter` | **L8 - L10** | `ALTER TABLE public.system_settings` | Schema Alteration L8-L10 |
| `ALTER public.system_settings (L12)` | `sql_alter` | **L12 - L13** | `ALTER TABLE public.system_settings` | Schema Alteration L12-L13 |
| `ALTER public.system_settings (L23)` | `sql_alter` | **L23 - L25** | `ALTER TABLE public.system_settings` | Schema Alteration L23-L25 |
| `ALTER public.system_settings (L27)` | `sql_alter` | **L27 - L29** | `ALTER TABLE public.system_settings` | Schema Alteration L27-L29 |
| `ALTER public.system_settings (L32)` | `sql_alter` | **L32 - L41** | `ALTER TABLE public.system_settings` | Schema Alteration L32-L41 |
| `ALTER public.attendance_logs (L69)` | `sql_alter` | **L69 - L70** | `ALTER TABLE public.attendance_logs` | Schema Alteration L69-L70 |
| `ALTER public.attendance_logs (L72)` | `sql_alter` | **L72 - L73** | `ALTER TABLE public.attendance_logs` | Schema Alteration L72-L73 |
| `ALTER public.attendance_logs (L75)` | `sql_alter` | **L75 - L79** | `ALTER TABLE public.attendance_logs` | Schema Alteration L75-L79 |

---

## File: `sql/create_staging_schema.sql`
- **Layer:** Database Schema & Migration Layer (PostgreSQL/Supabase)
- **Hash:** `d554844dc50576ab` | **Total Lines:** `141` | **Imports:** `0` | **Exports:** `None`

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
| `ALTER staging.system_settings (L50)` | `sql_alter` | **L50 - L52** | `ALTER TABLE staging.system_settings` | Schema Alteration L50-L52 |
| `ALTER staging.system_settings (L54)` | `sql_alter` | **L54 - L56** | `ALTER TABLE staging.system_settings` | Schema Alteration L54-L56 |
| `ALTER staging.system_settings (L59)` | `sql_alter` | **L59 - L68** | `ALTER TABLE staging.system_settings` | Schema Alteration L59-L68 |
| `ALTER staging.attendance_logs (L71)` | `sql_alter` | **L71 - L72** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L71-L72 |
| `ALTER staging.attendance_logs (L74)` | `sql_alter` | **L74 - L75** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L74-L75 |
| `ALTER staging.attendance_logs (L77)` | `sql_alter` | **L77 - L81** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L77-L81 |
| `ALTER staging.system_settings (L84)` | `sql_alter` | **L84 - L84** | `ALTER TABLE staging.system_settings ENABLE ROW LEVEL SECURIT` | Schema Alteration L84-L84 |
| `ALTER staging.personnel (L85)` | `sql_alter` | **L85 - L85** | `ALTER TABLE staging.personnel ENABLE ROW LEVEL SECURITY;` | Schema Alteration L85-L85 |
| `ALTER staging.user_accounts (L86)` | `sql_alter` | **L86 - L86** | `ALTER TABLE staging.user_accounts ENABLE ROW LEVEL SECURITY;` | Schema Alteration L86-L86 |
| `ALTER staging.attendance_logs (L87)` | `sql_alter` | **L87 - L87** | `ALTER TABLE staging.attendance_logs ENABLE ROW LEVEL SECURIT` | Schema Alteration L87-L87 |
| `POLICY "staging_system_settings_all" ON staging.system_settings` | `sql_rls_policy` | **L91 - L91** | `ON staging.system_settings` | Supabase RLS Policy L91-L91 |
| `POLICY "staging_personnel_all" ON staging.personnel` | `sql_rls_policy` | **L94 - L94** | `ON staging.personnel` | Supabase RLS Policy L94-L94 |
| `POLICY "staging_user_accounts_all" ON staging.user_accounts` | `sql_rls_policy` | **L97 - L97** | `ON staging.user_accounts` | Supabase RLS Policy L97-L97 |
| `POLICY "staging_attendance_logs_all" ON staging.attendance_logs` | `sql_rls_policy` | **L100 - L100** | `ON staging.attendance_logs` | Supabase RLS Policy L100-L100 |

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

## File: `sql/migration_staging_split_dropdowns.sql`
- **Layer:** Database Schema & Migration Layer (PostgreSQL/Supabase)
- **Hash:** `b86ac35a324e0f5f` | **Total Lines:** `68` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ALTER staging.system_settings (L9)` | `sql_alter` | **L9 - L17** | `ALTER TABLE staging.system_settings` | Schema Alteration L9-L17 |
| `ALTER staging.system_settings (L20)` | `sql_alter` | **L20 - L28** | `ALTER TABLE staging.system_settings` | Schema Alteration L20-L28 |

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

## File: `time-corrections.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `ef3d3c449bb2fba1` | **Total Lines:** `240` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L115** | `<head>` | HTML DOM Section L3-L115 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L119 - L119** | `id="bmaSidebarContainer"` | HTML DOM Section L119-L119 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L123 - L123** | `id="bmaTopbarContainer"` | HTML DOM Section L123-L123 |
| `<main>` | `html_dom_section` | **L125 - L230** | `<main>` | HTML DOM Section L125-L230 |
| `<div#timeCorrectionsCardsContainer>` | `html_dom_section` | **L202 - L202** | `id="timeCorrectionsCardsContainer"` | HTML DOM Section L202-L202 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L232 - L232** | `id="bmaFooterContainer"` | HTML DOM Section L232-L232 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L237 - L237** | `<script>` | Bootstrap script L237-L237 |

---

## File: `users.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `9c5bad2e20c5bd88` | **Total Lines:** `475` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L116** | `<head>` | HTML DOM Section L3-L116 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L120 - L120** | `id="bmaSidebarContainer"` | HTML DOM Section L120-L120 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L124 - L124** | `id="bmaTopbarContainer"` | HTML DOM Section L124-L124 |
| `<main>` | `html_dom_section` | **L126 - L336** | `<main>` | HTML DOM Section L126-L336 |
| `<div#usersCardsContainer>` | `html_dom_section` | **L254 - L254** | `id="usersCardsContainer"` | HTML DOM Section L254-L254 |
| `<div#passwordResetCardsContainer>` | `html_dom_section` | **L312 - L312** | `id="passwordResetCardsContainer"` | HTML DOM Section L312-L312 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L338 - L338** | `id="bmaFooterContainer"` | HTML DOM Section L338-L338 |
| `<div#modalUserAccountForm>` | `html_dom_section` | **L344 - L471** | `id="modalUserAccountForm"` | HTML DOM Section L344-L471 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L473 - L473** | `<script>` | Bootstrap script L473-L473 |

---

