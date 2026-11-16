# สารบัญไฟล์และฟังก์ชันของโปรเจกต์ (VS Code Automated File & Function Index)

- **อัปเดตล่าสุด (Last Indexed):** `2026-11-16T05:01:21.830Z`
- **จำนวนไฟล์ที่สแกนทั้งหมด (Total Files):** `172` | **จำนวนฟังก์ชัน/สัญลักษณ์ทั้งหมด (Total Symbols):** `900`
- **กฎการใช้งานสำหรับ AI (Token-Saving Rule):** ห้ามอ่านไฟล์ทั้งหมด ให้ดูช่วงบรรทัด `L_start - L_end` ในตารางด้านล่าง แล้วดึงเฉพาะช่วงบรรทัดที่ต้องการใช้งานเท่านั้น

---

## File: `approvals.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `f95d9c0cef8ad4e2` | **Total Lines:** `221` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L114** | `<head>` | HTML DOM Section L3-L114 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L118 - L118** | `id="bmaSidebarContainer"` | HTML DOM Section L118-L118 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L122 - L122** | `id="bmaTopbarContainer"` | HTML DOM Section L122-L122 |
| `<main>` | `html_dom_section` | **L124 - L212** | `<main>` | HTML DOM Section L124-L212 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L214 - L214** | `id="bmaFooterContainer"` | HTML DOM Section L214-L214 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L219 - L219** | `<script>` | Bootstrap script L219-L219 |

---

## File: `assets/js/components/AppLayout.js`
- **Layer:** Shared UI Component Layer
- **Hash:** `0bd13e26d6aa5aee` | **Total Lines:** `998` | **Imports:** `7` | **Exports:** `AppLayout`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `AppLayout` | `class` | **L14 - L998** | `export class AppLayout` | Class Definition (985 lines) |
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
| `AppLayout.initAdminRealtimeSync` | `static public method` | **L763 - L882** | `(currentUser) => any` | static public method L763-L882 (120 lines) |
| `AppLayout.#bindGlobalDelegatedEvents` | `static private method` | **L884 - L997** | `() => any` | static private method L884-L997 (114 lines) |

---

## File: `assets/js/components/SystemUpdateModal.js`
- **Layer:** Shared UI Component Layer
- **Hash:** `34b29b1482d33e60` | **Total Lines:** `468` | **Imports:** `0` | **Exports:** `SystemUpdateModal`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SystemUpdateModal` | `class` | **L8 - L467** | `export class SystemUpdateModal` | และมีระบบตรวจสอบการเปิดดูอัตโนมัติเพียง 1 ครั้งต่อเวอร์ชันอัปเดต (Single-view per build update) |
| `SystemUpdateModal.getCurrentAppBuild` | `static public method` | **L48 - L58** | `() => any` | static public method L48-L58 (11 lines) |
| `SystemUpdateModal.#escapeHtml` | `static private method` | **L65 - L73** | `(str) => any` | static private method L65-L73 (9 lines) |
| `SystemUpdateModal.#resolveVersionUrl` | `static private method` | **L79 - L87** | `() => any` | static private method L79-L87 (9 lines) |
| `SystemUpdateModal.#injectStyles` | `static private method` | **L92 - L124** | `() => any` | ติดตั้ง CSS Animations และสไตล์ที่จำเป็นแบบ Self-contained |
| `SystemUpdateModal.init` | `static public async method` | **L133 - L144** | `(options = {}) => Promise<any>` | static public async method L133-L144 (12 lines) |
| `SystemUpdateModal.fetchVersionData` | `static public async method` | **L150 - L185** | `() => Promise<any>` | static public async method L150-L185 (36 lines) |
| `SystemUpdateModal.renderBadge` | `static public method` | **L191 - L226** | `(targetSlotSelector = '#loginVersionBadgeSlot') => any` | static public method L191-L226 (36 lines) |
| `SystemUpdateModal.checkAndShowAuto` | `static public method` | **L231 - L242** | `() => any` | ตรวจสอบว่าผู้ใช้เคยดูการแจ้งเตือนของ Build ปัจจุบันหรือยัง หากยังไม่เคยจะเปิด Modal อัตโนมัติ 1 ครั้ง |
| `SystemUpdateModal.show` | `static public method` | **L247 - L418** | `() => any` | เปิดหน้าต่างแจ้งเตือนการอัปเดตระบบ (What's New Modal) |
| `SystemUpdateModal.open` | `static public method` | **L423 - L425** | `() => any` | Alias for show() |
| `SystemUpdateModal.close` | `static public method` | **L431 - L458** | `(saveAcknowledge = true) => any` | static public method L431-L458 (28 lines) |
| `SystemUpdateModal.getVersionData` | `static public method` | **L464 - L466** | `() => any` | static public method L464-L466 (3 lines) |

---

## File: `assets/js/controllers/ApprovalsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `f7abfcad05d9c52e` | **Total Lines:** `540` | **Imports:** `4` | **Exports:** `ApprovalsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ApprovalsController` | `class` | **L11 - L536** | `export class ApprovalsController` | Class Definition (526 lines) |
| `ApprovalsController.constructor` | `public constructor` | **L12 - L18** | `() => any` | public constructor L12-L18 (7 lines) |
| `ApprovalsController.init` | `public async method` | **L20 - L32** | `() => Promise<any>` | public async method L20-L32 (13 lines) |
| `ApprovalsController.loadRequests` | `public async method` | **L34 - L51** | `() => Promise<any>` | public async method L34-L51 (18 lines) |
| `ApprovalsController.#updateBulkSelectionCount` | `private method` | **L53 - L63** | `() => any` | private method L53-L63 (11 lines) |
| `ApprovalsController.#renderGroupedApprovalsTable` | `private method` | **L70 - L134** | `() => any` | - 'group': สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน |
| `ApprovalsController.#buildRequestRowHtml` | `private method` | **L136 - L220** | `(req, indexNo) => any` | private method L136-L220 (85 lines) |
| `ApprovalsController.#escapeHtml` | `private method` | **L222 - L230** | `(str) => any` | private method L222-L230 (9 lines) |
| `ApprovalsController.#formatRemarkCellHtml` | `private method` | **L232 - L373** | `(req, isOffsite) => any` | private method L232-L373 (142 lines) |
| `ApprovalsController.syncRequestsSilent` | `public async method` | **L375 - L436** | `(deltaDetail = null) => Promise<any>` | public async method L375-L436 (62 lines) |
| `ApprovalsController.#bindEvents` | `private method` | **L438 - L501** | `() => any` | private method L438-L501 (64 lines) |
| `ApprovalsController.#processDecision` | `private async method` | **L503 - L535** | `(ids, decision) => Promise<any>` | private async method L503-L535 (33 lines) |

---

## File: `assets/js/controllers/CheckinController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `9512a6b8942cc2e4` | **Total Lines:** `4467` | **Imports:** `6` | **Exports:** `CheckinController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `CheckinController` | `class` | **L13 - L905** | `export class CheckinController` | Class Definition (893 lines) |
| `CheckinController.constructor` | `public constructor` | **L14 - L71** | `() => any` | public constructor L14-L71 (58 lines) |
| `CheckinController.init` | `public async method` | **L73 - L146** | `() => Promise<any>` | public async method L73-L146 (74 lines) |
| `CheckinController.#initRealtimeSettingsListener` | `private method` | **L148 - L210** | `() => any` | private method L148-L210 (63 lines) |
| `triggerDebouncedPersonalSync` | `arrow_fn` | **L155 - L163** | `(payload) => inferred` | Arrow Function L155-L163 |
| `CheckinController.#syncPersonalAttendanceSilent` | `private async method` | **L212 - L218** | `() => Promise<any>` | private async method L212-L218 (7 lines) |
| `CheckinController.#syncSettingsHotReload` | `private async method` | **L220 - L241** | `() => Promise<any>` | private async method L220-L241 (22 lines) |
| `CheckinController.#applySettingsHotReload` | `private method` | **L243 - L269** | `(newSettings) => any` | private method L243-L269 (27 lines) |
| `CheckinController.#applyDynamicWorkspaceLayout` | `private method` | **L271 - L302** | `() => any` | private method L271-L302 (32 lines) |
| `CheckinController.#updateThemeButtonUI` | `private method` | **L304 - L322** | `() => any` | private method L304-L322 (19 lines) |
| `CheckinController.#checkAndShowWelcomeToast` | `private method` | **L324 - L332** | `() => any` | private method L324-L332 (9 lines) |
| `CheckinController.#startLiveClock24` | `private method` | **L334 - L360** | `() => any` | private method L334-L360 (27 lines) |
| `updateClock` | `arrow_fn` | **L335 - L357** | `() => inferred` | Arrow Function L335-L357 |
| `CheckinController.#isShiftAlreadyRecordedToday` | `private method` | **L362 - L410** | `(shift) => any` | private method L362-L410 (49 lines) |
| `CheckinController.#isShiftActiveAtCurrentTime` | `private method` | **L412 - L447** | `(shift, nowMin, allowStartMin) => any` | private method L412-L447 (36 lines) |
| `CheckinController.#evaluateTimeWindowAndPopulateShifts` | `private method` | **L449 - L553** | `() => any` | private method L449-L553 (105 lines) |
| `CheckinController.#calculateHaversineMeters` | `private method` | **L558 - L570** | `(lat1, lon1, lat2, lon2) => any` | คำนวณระยะทางแบบ Haversine (หน่วย: เมตร) |
| `CheckinController.evaluateOnsiteGeofence` | `public method` | **L578 - L659** | `(currentLat, currentLng) => any` | public method L578-L659 (82 lines) |
| `CheckinController.#renderGeofenceStatusUI` | `private method` | **L661 - L731** | `() => any` | private method L661-L731 (71 lines) |
| `CheckinController.#initLocaV2ModeAndChips` | `private method` | **L733 - L735** | `() => any` | private method L733-L735 (3 lines) |
| `CheckinController.#initModeSwitcher` | `private method` | **L737 - L847** | `() => any` | private method L737-L847 (111 lines) |
| `setActiveOffsiteGps` | `arrow_fn` | **L744 - L753** | `(source) => inferred` | Arrow Function L744-L753 |
| `CheckinController.#initViewGpsMapModal` | `private method` | **L849 - L856** | `() => any` | private method L849-L856 (8 lines) |
| `CheckinController.#openViewGpsMapModal` | `private method` | **L858 - L904** | `() => any` | private method L858-L904 (47 lines) |
| `#goToStep` | `private method` | **L907 - L972** | `(step) => any` | private method L907-L972 (66 lines) |
| `#updateStep1Validation` | `private method` | **L974 - L1009** | `() => any` | private method L974-L1009 (36 lines) |
| `#openOffsiteMapModal` | `private method` | **L1011 - L1106** | `() => any` | private method L1011-L1106 (96 lines) |
| `#updateOffsiteModalMarker` | `private async method` | **L1109 - L1169** | `(lat, lng, explicitName = null, extent = null) => Promise<any>` | private async method L1109-L1169 (61 lines) |
| `#initOffsiteModalGps` | `private method` | **L1171 - L1397** | `() => any` | private method L1171-L1397 (227 lines) |
| `escapeHtml` | `arrow_fn` | **L1180 - L1188** | `(str) => inferred` | Arrow Function L1180-L1188 |
| `hideSearchResults` | `arrow_fn` | **L1190 - L1195** | `() => inferred` | Arrow Function L1190-L1195 |
| `closeModal` | `arrow_fn` | **L1197 - L1200** | `() => inferred` | Arrow Function L1197-L1200 |
| `performSearch` | `async_arrow_fn` | **L1248 - L1362** | `() => inferred` | Arrow Function L1248-L1362 |
| `#renderUserAndSettingsInfo` | `private method` | **L1401 - L1532** | `() => any` | private method L1401-L1532 (132 lines) |
| `setElText` | `arrow_fn` | **L1406 - L1409** | `(id, text) => inferred` | Arrow Function L1406-L1409 |
| `#refreshAllAttendanceData` | `private async method` | **L1534 - L1551** | `() => Promise<any>` | private async method L1534-L1551 (18 lines) |
| `#updateStatusCardsAndMainButton` | `private method` | **L1553 - L1837** | `() => any` | private method L1553-L1837 (285 lines) |
| `applyGpsSearchingLock` | `arrow_fn` | **L1580 - L1590** | `() => inferred` | Arrow Function L1580-L1590 |
| `setShiftCardVisibility` | `arrow_fn` | **L1592 - L1601** | `(visible) => inferred` | Arrow Function L1592-L1601 |
| `#renderPersonalAttendanceTabs` | `private method` | **L1839 - L1882** | `() => any` | private method L1839-L1882 (44 lines) |
| `#buildHistoryRowHtml` | `private method` | **L1884 - L1904** | `(item, rowNumber) => any` | private method L1884-L1904 (21 lines) |
| `#renderSpecialRequestsHistoryTable` | `private method` | **L1906 - L1953** | `() => any` | private method L1906-L1953 (48 lines) |
| `#openFullscreenCamera` | `private async method` | **L1958 - L1960** | `() => Promise<any>` | เปิดกล้องแบบเต็มหน้าจอเพื่อถ่ายภาพยืนยันตัวตน |
| `#captureAndCloseCamera` | `private method` | **L1962 - L2002** | `() => any` | private method L1962-L2002 (41 lines) |
| `#closeFullscreenCamera` | `private method` | **L2004 - L2009** | `() => any` | private method L2004-L2009 (6 lines) |
| `#checkCameraHardware` | `private async method` | **L2015 - L2032** | `() => Promise<any>` | private async method L2015-L2032 (18 lines) |
| `#handleFallbackFileSelected` | `private method` | **L2034 - L2118** | `(file) => any` | private method L2034-L2118 (85 lines) |
| `resetFileInput` | `arrow_fn` | **L2040 - L2043** | `() => inferred` | Arrow Function L2040-L2043 |
| `notifyReadError` | `arrow_fn` | **L2044 - L2051** | `() => inferred` | Arrow Function L2044-L2051 |
| `#stopCameraHardwareStream` | `private method` | **L2120 - L2139** | `() => any` | private method L2120-L2139 (20 lines) |
| `#stopCameraAndShowStandby` | `private method` | **L2141 - L2169** | `() => any` | private method L2141-L2169 (29 lines) |
| `#openCameraOnDemand` | `private async method` | **L2174 - L2192** | `() => Promise<any>` | เปิดกล้องอัตโนมัติเมื่อเข้าสู่ Step 2 (คงการอัปเดต DOM สำหรับโหมด On-Demand) |
| `#startCameraSession` | `private async method` | **L2199 - L2325** | `({ showFullscreenModal = true } = {}) => Promise<any>` | private async method L2199-L2325 (127 lines) |
| `#acquireCameraStreamWithRetry` | `private async method` | **L2333 - L2384** | `(initialStreamPromise, sessionToken) => Promise<any>` | private async method L2333-L2384 (52 lines) |
| `#bindCameraStreamLifecycle` | `private method` | **L2390 - L2398** | `(stream) => any` | private method L2390-L2398 (9 lines) |
| `#handleUnexpectedCameraStreamStop` | `private method` | **L2404 - L2431** | `(message = '') => any` | private method L2404-L2431 (28 lines) |
| `#detectCameraBrowserProfile` | `private method` | **L2437 - L2465** | `() => any` | private method L2437-L2465 (29 lines) |
| `#getCameraPermissionHintHtml` | `private method` | **L2472 - L2485** | `(profile) => any` | private method L2472-L2485 (14 lines) |
| `#hideCameraPermissionHint` | `private method` | **L2504 - L2510** | `() => any` | ซ่อนแบนเนอร์แนะนำสิทธิ์กล้องและยกเลิก Timer ที่ค้างอยู่ |
| `#scheduleCameraPermissionHint` | `private method` | **L2516 - L2545** | `(sessionToken = this.cameraSessionToken) => any` | private method L2516-L2545 (30 lines) |
| `#classifyCameraErrorReason` | `private method` | **L2552 - L2567** | `(err) => any` | private method L2552-L2567 (16 lines) |
| `#getBrowserPermissionRecoveryStepsHtml` | `private method` | **L2574 - L2613** | `(profile) => any` | private method L2574-L2613 (40 lines) |
| `#showCameraGuidanceModal` | `private async method` | **L2619 - L2700** | `({ reason, allowFallback }) => Promise<any>` | private async method L2619-L2700 (82 lines) |
| `#capturePhotoAndStopStream` | `private method` | **L2702 - L2734** | `() => any` | private method L2702-L2734 (33 lines) |
| `#resetPageAfterSave` | `private async method` | **L2736 - L2751** | `() => Promise<any>` | private async method L2736-L2751 (16 lines) |
| `#initGpsLocation` | `private async method` | **L2759 - L2916** | `({ forceRefresh = false } = {}) => Promise<any>` | 3. หากยังไม่พบ จะดึง ซอย / ซอยย่อย -> แสดง ["ใกล้เคียง " + ชื่อซอย] |
| `#renderInlineGpsMap` | `private method` | **L2918 - L2984** | `(lat, lng) => any` | private method L2918-L2984 (67 lines) |
| `#bindEvents` | `private method` | **L2987 - L3291** | `() => any` | private method L2987-L3291 (305 lines) |
| `openSpecialModal` | `arrow_fn` | **L3155 - L3158** | `() => inferred` | Arrow Function L3155-L3158 |
| `setDesktopActiveTab` | `arrow_fn` | **L3195 - L3214** | `(activeName) => inferred` | Arrow Function L3195-L3214 |
| `openMobileDrawer` | `arrow_fn` | **L3225 - L3243** | `() => inferred` | Arrow Function L3225-L3243 |
| `closeMobileDrawer` | `arrow_fn` | **L3245 - L3272** | `(targetTab = null) => inferred` | Arrow Function L3245-L3272 |
| `#handleMainCheckin` | `private async method` | **L3293 - L3725** | `() => Promise<any>` | private async method L3293-L3725 (433 lines) |
| `#openSpecialRequestModal` | `private method` | **L3727 - L3804** | `() => any` | private method L3727-L3804 (78 lines) |
| `#initModalSpecialRequest` | `private method` | **L3806 - L3858** | `() => any` | private method L3806-L3858 (53 lines) |
| `#initSpecialModalGps` | `private method` | **L3860 - L3986** | `() => any` | private method L3860-L3986 (127 lines) |
| `updateCustomPinAndLocation` | `async_arrow_fn` | **L3872 - L3943** | `(lat, lng, flyTo = false, explicitName = null, extent = null) => inferred` | Arrow Function L3872-L3943 |
| `setupMapIfAvailable` | `arrow_fn` | **L3945 - L3980** | `() => inferred` | Arrow Function L3945-L3980 |
| `getDistanceInMeters` | `arrow_fn` | **L4005 - L4024** | `(lat1, lon1, lat2, lon2) => inferred` | Arrow Function L4005-L4024 |
| `calculateDistance` | `arrow_fn` | **L4026 - L4035** | `(lat1, lon1, lat2, lon2) => inferred` | Arrow Function L4026-L4035 |
| `getCategoryLabel` | `arrow_fn` | **L4037 - L4076** | `(item) => inferred` | Arrow Function L4037-L4076 |
| `escapeHtml` | `arrow_fn` | **L4078 - L4086** | `(str) => inferred` | Arrow Function L4078-L4086 |
| `formatSubAddress` | `arrow_fn` | **L4088 - L4104** | `(item) => inferred` | Arrow Function L4088-L4104 |
| `getMainName` | `arrow_fn` | **L4106 - L4114** | `(item) => inferred` | Arrow Function L4106-L4114 |
| `hideSearchResults` | `arrow_fn` | **L4116 - L4121** | `() => inferred` | Arrow Function L4116-L4121 |
| `bindResultItemClicks` | `arrow_fn` | **L4123 - L4143** | `() => inferred` | Arrow Function L4123-L4143 |
| `renderCoordsResult` | `arrow_fn` | **L4145 - L4169** | `(lat, lng) => inferred` | Arrow Function L4145-L4169 |
| `renderPlaceResults` | `arrow_fn` | **L4171 - L4217** | `(items) => inferred` | Arrow Function L4171-L4217 |
| `performSearch` | `async_arrow_fn` | **L4222 - L4283** | `() => inferred` | Arrow Function L4222-L4283 |
| `#handleSubmitSpecialRequest` | `private async method` | **L4323 - L4462** | `(closeModalCallback) => Promise<any>` | private async method L4323-L4462 (140 lines) |

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
- **Hash:** `3d343836fe9cae7b` | **Total Lines:** `307` | **Imports:** `5` | **Exports:** `LoginController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `LoginController` | `class` | **L12 - L303** | `export class LoginController` | Class Definition (292 lines) |
| `LoginController.constructor` | `public constructor` | **L13 - L16** | `() => any` | public constructor L13-L16 (4 lines) |
| `LoginController.init` | `public async method` | **L18 - L37** | `() => Promise<any>` | public async method L18-L37 (20 lines) |
| `LoginController.#loadOrganizationBranding` | `private async method` | **L39 - L73** | `() => Promise<any>` | private async method L39-L73 (35 lines) |
| `LoginController.#updateThemeButtonUI` | `private method` | **L75 - L85** | `() => any` | private method L75-L85 (11 lines) |
| `LoginController.#bindEvents` | `private method` | **L87 - L192** | `() => any` | private method L87-L192 (106 lines) |
| `openChangeModal` | `arrow_fn` | **L128 - L137** | `() => inferred` | Arrow Function L128-L137 |
| `validatePasswordMatch` | `arrow_fn` | **L144 - L166** | `() => inferred` | Arrow Function L144-L166 |
| `openForgotModal` | `arrow_fn` | **L177 - L181** | `() => inferred` | Arrow Function L177-L181 |
| `LoginController.#handleLogin` | `private async method` | **L194 - L216** | `(mode) => Promise<any>` | private async method L194-L216 (23 lines) |
| `LoginController.#loadRememberedUser` | `private method` | **L218 - L238** | `() => any` | private method L218-L238 (21 lines) |
| `LoginController.#persistRememberedUser` | `private method` | **L240 - L255** | `(username) => any` | private method L240-L255 (16 lines) |
| `LoginController.#handleChangePasswordSubmit` | `private async method` | **L257 - L281** | `(closeModalCallback) => Promise<any>` | private async method L257-L281 (25 lines) |
| `LoginController.#handleForgotPasswordSubmit` | `private async method` | **L283 - L302** | `(closeModalCallback) => Promise<any>` | private async method L283-L302 (20 lines) |

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
- **Hash:** `b7bb4d8a0520829e` | **Total Lines:** `1582` | **Imports:** `8` | **Exports:** `ReportsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ReportsController` | `class` | **L15 - L1573** | `export class ReportsController` | Class Definition (1559 lines) |
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
| `ReportsController.#resolveReportRemark` | `private method` | **L456 - L510** | `(rec, { forExcel = false } = {}) => any` | private method L456-L510 (55 lines) |
| `ReportsController.#renderSeparateTablesBySelectedTags` | `private method` | **L512 - L580** | `(forPrintPdf = false) => any` | private method L512-L580 (69 lines) |
| `ReportsController.#renderSingleStatusTableHtml` | `private method` | **L582 - L710** | `(statusMeta, statusColor, tagRecords, daySubtitle, groupHeaderColor, forPrintPdf) => any` | private method L582-L710 (129 lines) |
| `ReportsController.#buildGroupedRowsForTag` | `private method` | **L712 - L764** | `(tagRecords, groupHeaderColor, forPrintPdf) => any` | private method L712-L764 (53 lines) |
| `ReportsController.#buildSingleRowHtml` | `private method` | **L766 - L886** | `(rec, indexNo, forPrintPdf) => any` | private method L766-L886 (121 lines) |
| `ReportsController.#openResumeProfileForSpecificRow` | `private method` | **L895 - L1114** | `(rowUid) => any` | private method L895-L1114 (220 lines) |
| `setupPhotoBox` | `arrow_fn` | **L964 - L1007** | `(boxId, linkId, photo, fallbackMsg, isOut = false) => inferred` | Arrow Function L964-L1007 |
| `setupGpsAndMap` | `arrow_fn` | **L1061 - L1091** | `(coordsId, linkId, iframeId, placeholderId, locNameId, lat, lng, locName, fallbackMsg) => inferred` | Arrow Function L1061-L1091 |
| `ReportsController.#closeResumeModal` | `private method` | **L1116 - L1126** | `() => any` | private method L1116-L1126 (11 lines) |
| `ReportsController.#openModal` | `private method` | **L1128 - L1160** | `(rec = null) => any` | private method L1128-L1160 (33 lines) |
| `ReportsController.#closeModal` | `private method` | **L1162 - L1164** | `() => any` | private method L1162-L1164 (3 lines) |
| `ReportsController.syncReportsSilent` | `public async method` | **L1166 - L1303** | `(deltaDetail = null) => Promise<any>` | public async method L1166-L1303 (138 lines) |
| `ReportsController.#bindEvents` | `private method` | **L1305 - L1532** | `() => any` | private method L1305-L1532 (228 lines) |
| `triggerDebouncedReportSync` | `arrow_fn` | **L1306 - L1311** | `(detail) => inferred` | Arrow Function L1306-L1311 |
| `ReportsController.#handleSaveReportRecord` | `private async method` | **L1534 - L1572** | `() => Promise<any>` | private async method L1534-L1572 (39 lines) |

---

## File: `assets/js/controllers/SettingsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `1a72884691614ab5` | **Total Lines:** `1617` | **Imports:** `4` | **Exports:** `SettingsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SettingsController` | `class` | **L11 - L1608** | `export class SettingsController` | Class Definition (1598 lines) |
| `SettingsController.constructor` | `public constructor` | **L12 - L17** | `() => any` | public constructor L12-L17 (6 lines) |
| `SettingsController.init` | `public async method` | **L19 - L37** | `() => Promise<any>` | public async method L19-L37 (19 lines) |
| `SettingsController.#renderAllSettings` | `private method` | **L39 - L172** | `() => any` | private method L39-L172 (134 lines) |
| `syncEarlyWindowVisibility` | `arrow_fn` | **L92 - L102** | `() => inferred` | Arrow Function L92-L102 |
| `syncRadiusVisibility` | `arrow_fn` | **L120 - L130** | `() => inferred` | Arrow Function L120-L130 |
| `SettingsController.#updateColorPreviewBadges` | `private method` | **L174 - L190** | `() => any` | private method L174-L190 (17 lines) |
| `SettingsController.#syncCheckinModeUI` | `private method` | **L195 - L226** | `(isSingleClick) => any` | ย่อข้อความป้าย Tag ให้เหลือแค่ "รูปแบบพิเศษ" หรือ "รูปแบบปกติ" เพื่อไม่ให้ล้นจอหรือเบียดข้อความในมือถือ |
| `SettingsController.#updateLogoPreview` | `private method` | **L228 - L236** | `(url) => any` | private method L228-L236 (9 lines) |
| `SettingsController.#buildSortButtonsHtml` | `private method` | **L238 - L251** | `(category, index, totalLength) => any` | private method L238-L251 (14 lines) |
| `SettingsController.#renderPrefixes` | `private method` | **L253 - L273** | `() => any` | private method L253-L273 (21 lines) |
| `SettingsController.#renderRemarks` | `private method` | **L275 - L295** | `() => any` | private method L275-L295 (21 lines) |
| `SettingsController.#renderOffsiteJobTypes` | `private method` | **L297 - L320** | `() => any` | private method L297-L320 (24 lines) |
| `SettingsController.#renderSpecialReasons` | `private method` | **L322 - L345** | `() => any` | private method L322-L345 (24 lines) |
| `SettingsController.#renderShifts` | `private method` | **L347 - L399** | `() => any` | private method L347-L399 (53 lines) |
| `SettingsController.#renderPositions` | `private method` | **L401 - L422** | `() => any` | private method L401-L422 (22 lines) |
| `SettingsController.#renderAffiliations` | `private method` | **L424 - L446** | `() => any` | private method L424-L446 (23 lines) |
| `SettingsController.#renderOfficialLocations` | `private method` | **L448 - L512** | `() => any` | private method L448-L512 (65 lines) |
| `SettingsController.#openOfficialLocationModal` | `private method` | **L514 - L661** | `(editIndex = null) => any` | private method L514-L661 (148 lines) |
| `updateMapLink` | `arrow_fn` | **L653 - L658** | `() => inferred` | Arrow Function L653-L658 |
| `SettingsController.#collectMainAndColorFieldsIntoSettings` | `private method` | **L663 - L713** | `() => any` | private method L663-L713 (51 lines) |
| `SettingsController.#persistSettings` | `private async method` | **L715 - L738** | `(showToastAlert = true) => Promise<any>` | private async method L715-L738 (24 lines) |
| `SettingsController.#openModal` | `private method` | **L740 - L745** | `(title, bodyHtml, onSubmitCallback) => any` | private method L740-L745 (6 lines) |
| `SettingsController.#closeModal` | `private method` | **L747 - L750** | `() => any` | private method L747-L750 (4 lines) |
| `SettingsController.#buildMultiRowInputsHtml` | `private method` | **L752 - L771** | `(fieldLabel, placeholder) => any` | private method L752-L771 (20 lines) |
| `SettingsController.#bindDynamicMultiRowEvents` | `private method` | **L773 - L801** | `(placeholder = 'ระบุข้อมูล...') => any` | private method L773-L801 (29 lines) |
| `SettingsController.#getDynamicMultiRowValues` | `private method` | **L803 - L808** | `() => any` | private method L803-L808 (6 lines) |
| `SettingsController.#bindEvents` | `private method` | **L810 - L1128** | `() => any` | private method L810-L1128 (319 lines) |
| `SettingsController.#openShiftModal` | `private method` | **L1130 - L1221** | `(editIndex = null) => any` | private method L1130-L1221 (92 lines) |
| `checkOvernightAuto` | `arrow_fn` | **L1211 - L1218** | `() => inferred` | Arrow Function L1211-L1218 |
| `SettingsController.#openAddPositionStep1Modal` | `private method` | **L1223 - L1239** | `() => any` | private method L1223-L1239 (17 lines) |
| `SettingsController.#openAddPositionStep2Modal` | `private method` | **L1241 - L1284** | `() => any` | private method L1241-L1284 (44 lines) |
| `SettingsController.#openAddPositionStep3Modal` | `private method` | **L1286 - L1350** | `() => any` | private method L1286-L1350 (65 lines) |
| `SettingsController.#openEditSinglePositionModal` | `private method` | **L1352 - L1375** | `(editIndex) => any` | private method L1352-L1375 (24 lines) |
| `SettingsController.#openAddAffiliationStep1OrgModal` | `private method` | **L1377 - L1393** | `() => any` | private method L1377-L1393 (17 lines) |
| `SettingsController.#openAddAffiliationStep2BureauModal` | `private method` | **L1395 - L1433** | `() => any` | private method L1395-L1433 (39 lines) |
| `SettingsController.#openAddAffiliationStep3DivisionModal` | `private method` | **L1435 - L1491** | `() => any` | private method L1435-L1491 (57 lines) |
| `SettingsController.#openAddAffiliationStep4GroupModal` | `private method` | **L1493 - L1577** | `() => any` | private method L1493-L1577 (85 lines) |
| `SettingsController.#openEditSingleAffiliationModal` | `private method` | **L1579 - L1607** | `(editIndex) => any` | private method L1579-L1607 (29 lines) |

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
- **Hash:** `fe6416909adb3d23` | **Total Lines:** `114` | **Imports:** `0` | **Exports:** `Config`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `Config` | `class` | **L6 - L114** | `export class Config` | คลาสเก็บค่าคงที่ การตั้งค่าเชื่อมต่อ Supabase และค่ามาตรฐานของระบบ V2.7 |

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
- **Hash:** `f8130e44622702c4` | **Total Lines:** `1225` | **Imports:** `1` | **Exports:** `UIHelpers`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `UIHelpers` | `class` | **L8 - L1225** | `export class UIHelpers` | Class Definition (1218 lines) |
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
| `UIHelpers.printReportInNewTab` | `static public method` | **L1047 - L1224** | `({ title, subtitle, tableHtml, headerColor = '#007B3E' }) => any` | static public method L1047-L1224 (178 lines) |

---

## File: `assets/js/models/AttendanceModel.js`
- **Layer:** Data Model & Supabase Repository Layer
- **Hash:** `012263d6dbdde89a` | **Total Lines:** `2758` | **Imports:** `5` | **Exports:** `AttendanceModel`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `AttendanceModel` | `class` | **L12 - L2758** | `export class AttendanceModel` | Class Definition (2747 lines) |
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
| `AttendanceModel.evaluateOfficialStatus` | `static public method` | **L1427 - L1528** | `(log, settings) => any` | static public method L1427-L1528 (102 lines) |
| `AttendanceModel.getActiveRegularRecordForCheckout` | `static public async method` | **L1557 - L1588** | `(personnelId, userId, settings) => Promise<any>` | static public async method L1557-L1588 (32 lines) |
| `AttendanceModel.getPersonalAttendanceHistory` | `static public async method` | **L1590 - L1626** | `(personnelId, userId, limit = 35) => Promise<any>` | static public async method L1590-L1626 (37 lines) |
| `AttendanceModel.getPersonalSpecialRequests` | `static public async method` | **L1628 - L1674** | `(personnelId, userId) => Promise<any>` | static public async method L1628-L1674 (47 lines) |
| `AttendanceModel.deletePendingSpecialRequestByUser` | `static public async method` | **L1676 - L1710** | `(logId, personnelId, userId) => Promise<any>` | static public async method L1676-L1710 (35 lines) |
| `AttendanceModel.submitCheckinOrCheckout` | `static public async method` | **L1712 - L2130** | `(payload) => Promise<any>` | static public async method L1712-L2130 (419 lines) |
| `AttendanceModel.submitSpecialRequest` | `static public async method` | **L2132 - L2245** | `(payload) => Promise<any>` | static public async method L2132-L2245 (114 lines) |
| `AttendanceModel.getSpecialRequests` | `static public async method` | **L2247 - L2317** | `(currentUser, statusFilter = 'pending') => Promise<any>` | static public async method L2247-L2317 (71 lines) |
| `AttendanceModel.processSpecialRequestsBulk` | `static public async method` | **L2319 - L2388** | `(logIds, decision, approverUserId) => Promise<any>` | static public async method L2319-L2388 (70 lines) |
| `AttendanceModel.getDatesBetween` | `static public method` | **L2390 - L2407** | `(startDate, endDate) => any` | static public method L2390-L2407 (18 lines) |
| `AttendanceModel.getReportRecordsByDateRange` | `static public async method` | **L2409 - L2480** | `(startDate, endDate, currentUser) => Promise<any>` | static public async method L2409-L2480 (72 lines) |
| `AttendanceModel.#formatReportRow` | `static private method` | **L2482 - L2531** | `(person, log, workDate, evalStatus) => any` | static private method L2482-L2531 (50 lines) |
| `AttendanceModel.getDailyReportRecords` | `static public async method` | **L2533 - L2535** | `(workDate, currentUser) => Promise<any>` | static public async method L2533-L2535 (3 lines) |
| `AttendanceModel.saveAdminAttendanceRecord` | `static public async method` | **L2537 - L2632** | `(payload) => Promise<any>` | static public async method L2537-L2632 (96 lines) |
| `AttendanceModel.deleteAttendanceRecord` | `static public async method` | **L2634 - L2652** | `(logId) => Promise<any>` | static public async method L2634-L2652 (19 lines) |
| `AttendanceModel.calculateDashboardMetrics` | `static public method` | **L2654 - L2717** | `(dailyRecords) => any` | static public method L2654-L2717 (64 lines) |
| `AttendanceModel.getTodaySyncWatermark` | `static public async method` | **L2723 - L2757** | `() => Promise<any>` | static public async method L2723-L2757 (35 lines) |

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
- **Hash:** `e1ba560437d925d9` | **Total Lines:** `460` | **Imports:** `3` | **Exports:** `SettingsModel`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SettingsModel` | `class` | **L10 - L460** | `export class SettingsModel` | Class Definition (451 lines) |
| `SettingsModel.formatShiftDisplayText` | `static public method` | **L17 - L37** | `(shift) => any` | static public method L17-L37 (21 lines) |
| `SettingsModel.getSettings` | `static public async method` | **L39 - L211** | `(forceRefresh = false) => Promise<any>` | static public async method L39-L211 (173 lines) |
| `SettingsModel.updateSettings` | `static public async method` | **L213 - L375** | `(payload) => Promise<any>` | static public async method L213-L375 (163 lines) |
| `SettingsModel.moveItemInArray` | `static public method` | **L377 - L386** | `(arr, fromIndex, direction) => any` | static public method L377-L386 (10 lines) |
| `SettingsModel.fileToDataUrl` | `static public method` | **L388 - L395** | `(file) => any` | static public method L388-L395 (8 lines) |
| `SettingsModel.getUniquePositionTypes` | `static public method` | **L397 - L400** | `(settings) => any` | static public method L397-L400 (4 lines) |
| `SettingsModel.getUniquePositionTitles` | `static public method` | **L402 - L408** | `(settings, filterType = '') => any` | static public method L402-L408 (7 lines) |
| `SettingsModel.getUniquePositionLevels` | `static public method` | **L410 - L419** | `(settings, filterType = '', filterTitle = '') => any` | static public method L410-L419 (10 lines) |
| `SettingsModel.getUniqueOrganizations` | `static public method` | **L421 - L425** | `(settings) => any` | static public method L421-L425 (5 lines) |
| `SettingsModel.getUniqueBureaus` | `static public method` | **L427 - L434** | `(settings, filterOrg = '') => any` | static public method L427-L434 (8 lines) |
| `SettingsModel.getUniqueDivisions` | `static public method` | **L436 - L445** | `(settings, filterBureau = '', filterOrg = '') => any` | static public method L436-L445 (10 lines) |
| `SettingsModel.getUniqueGroups` | `static public method` | **L447 - L459** | `(settings, filterBureau = '', filterDivision = '', filterOrg = '') => any` | static public method L447-L459 (13 lines) |

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
- **Hash:** `284d5abb348e46ff` | **Total Lines:** `1072` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L178** | `<head>` | HTML DOM Section L3-L178 |
| `<main>` | `html_dom_section` | **L259 - L647** | `<main>` | HTML DOM Section L259-L647 |
| `<div#checkinWorkspaceWrapper>` | `html_dom_section` | **L262 - L505** | `id="checkinWorkspaceWrapper"` | HTML DOM Section L262-L505 |
| `<div#photoPreviewCard>` | `html_dom_section` | **L305 - L326** | `id="photoPreviewCard"` | HTML DOM Section L305-L326 |
| `<div#gpsSectionCard>` | `html_dom_section` | **L329 - L366** | `id="gpsSectionCard"` | HTML DOM Section L329-L366 |
| `<div#googleMapEmbedWrapper>` | `html_dom_section` | **L363 - L363** | `id="googleMapEmbedWrapper"` | HTML DOM Section L363-L363 |
| `<div#onsiteGeofenceStatusCard>` | `html_dom_section` | **L387 - L398** | `id="onsiteGeofenceStatusCard"` | HTML DOM Section L387-L398 |
| `<div#offsiteLocationSection>` | `html_dom_section` | **L401 - L437** | `id="offsiteLocationSection"` | HTML DOM Section L401-L437 |
| `<div#offsiteRemarkChipsContainer>` | `html_dom_section` | **L433 - L433** | `id="offsiteRemarkChipsContainer"` | HTML DOM Section L433-L433 |
| `<div#checkinActionCard>` | `html_dom_section` | **L441 - L474** | `id="checkinActionCard"` | HTML DOM Section L441-L474 |
| `<div#shiftSelectorContainer>` | `html_dom_section` | **L451 - L456** | `id="shiftSelectorContainer"` | HTML DOM Section L451-L456 |
| `<div#mainCustomTimeContainer>` | `html_dom_section` | **L458 - L467** | `id="mainCustomTimeContainer"` | HTML DOM Section L458-L467 |
| `<div#checkinStep1Container>` | `html_dom_section` | **L487 - L487** | `id="checkinStep1Container"` | HTML DOM Section L487-L487 |
| `<div#checkinStep2Container>` | `html_dom_section` | **L488 - L488** | `id="checkinStep2Container"` | HTML DOM Section L488-L488 |
| `<div#rightColumnWrapper>` | `html_dom_section` | **L489 - L489** | `id="rightColumnWrapper"` | HTML DOM Section L489-L489 |
| `<div#cameraSectionCard>` | `html_dom_section` | **L493 - L493** | `id="cameraSectionCard"` | HTML DOM Section L493-L493 |
| `<div#cameraStandbyOverlay>` | `html_dom_section` | **L501 - L501** | `id="cameraStandbyOverlay"` | HTML DOM Section L501-L501 |
| `<div#desktopPanesContainer>` | `html_dom_section` | **L508 - L645** | `id="desktopPanesContainer"` | HTML DOM Section L508-L645 |
| `<div#desktopHistoryWrapper>` | `html_dom_section` | **L511 - L600** | `id="desktopHistoryWrapper"` | HTML DOM Section L511-L600 |
| `<div#todayHistoryTabPanel>` | `html_dom_section` | **L537 - L554** | `id="todayHistoryTabPanel"` | HTML DOM Section L537-L554 |
| `<div#pastHistoryTabPanel>` | `html_dom_section` | **L557 - L597** | `id="pastHistoryTabPanel"` | HTML DOM Section L557-L597 |
| `<div#desktopSpecialWrapper>` | `html_dom_section` | **L603 - L643** | `id="desktopSpecialWrapper"` | HTML DOM Section L603-L643 |
| `<div#mobileDrawerPanel>` | `html_dom_section` | **L655 - L745** | `id="mobileDrawerPanel"` | HTML DOM Section L655-L745 |
| `<div#spCustomTimeContainer>` | `html_dom_section` | **L778 - L787** | `id="spCustomTimeContainer"` | HTML DOM Section L778-L787 |
| `<div#spOnsiteSection>` | `html_dom_section` | **L815 - L822** | `id="spOnsiteSection"` | HTML DOM Section L815-L822 |
| `<div#spOffsiteSection>` | `html_dom_section` | **L825 - L906** | `id="spOffsiteSection"` | HTML DOM Section L825-L906 |
| `<div#spOffsiteReasonContainer>` | `html_dom_section` | **L826 - L833** | `id="spOffsiteReasonContainer"` | HTML DOM Section L826-L833 |
| `<div#spSearchWrapper>` | `html_dom_section` | **L875 - L881** | `id="spSearchWrapper"` | HTML DOM Section L875-L881 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L933 - L933** | `<script>` | Bootstrap script L933-L933 |

---

## File: `dashboard.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `80ac7572fa210dff` | **Total Lines:** `278` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L115** | `<head>` | HTML DOM Section L3-L115 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L119 - L119** | `id="bmaSidebarContainer"` | HTML DOM Section L119-L119 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L125 - L125** | `id="bmaTopbarContainer"` | HTML DOM Section L125-L125 |
| `<main>` | `html_dom_section` | **L128 - L267** | `<main>` | HTML DOM Section L128-L267 |
| `<div#mobileShortcutContainer>` | `html_dom_section` | **L131 - L131** | `id="mobileShortcutContainer"` | HTML DOM Section L131-L131 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L270 - L270** | `id="bmaFooterContainer"` | HTML DOM Section L270-L270 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L276 - L276** | `<script>` | Bootstrap script L276-L276 |

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
- **Hash:** `72db24cf3ec0b53b` | **Total Lines:** `1386` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L57** | `<head>` | HTML DOM Section L3-L57 |
| `<div#mobileTocPanel>` | `html_dom_section` | **L96 - L107** | `id="mobileTocPanel"` | HTML DOM Section L96-L107 |
| `<main>` | `html_dom_section` | **L170 - L1146** | `<main>` | HTML DOM Section L170-L1146 |
| `<div#mockupModal>` | `html_dom_section` | **L1155 - L1181** | `id="mockupModal"` | HTML DOM Section L1155-L1181 |
| `<div#mockupModalPanel>` | `html_dom_section` | **L1157 - L1180** | `id="mockupModalPanel"` | HTML DOM Section L1157-L1180 |

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
- **Hash:** `8f46aea0d70ef323` | **Total Lines:** `386` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L147** | `<head>` | HTML DOM Section L3-L147 |
| `<div#mobileOrgLogoWrapper>` | `html_dom_section` | **L172 - L172** | `id="mobileOrgLogoWrapper"` | HTML DOM Section L172-L172 |
| `<main>` | `html_dom_section` | **L179 - L291** | `<main>` | HTML DOM Section L179-L291 |
| `<div#orgLogoWrapper>` | `html_dom_section` | **L186 - L188** | `id="orgLogoWrapper"` | HTML DOM Section L186-L188 |
| `<form#loginForm>` | `html_dom_section` | **L200 - L288** | `id="loginForm"` | HTML DOM Section L200-L288 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L384 - L384** | `<script>` | Bootstrap script L384-L384 |

---

## File: `personnel.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `bab0afab9e4966ad` | **Total Lines:** `682` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L116** | `<head>` | HTML DOM Section L3-L116 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L120 - L120** | `id="bmaSidebarContainer"` | HTML DOM Section L120-L120 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L124 - L124** | `id="bmaTopbarContainer"` | HTML DOM Section L124-L124 |
| `<main>` | `html_dom_section` | **L126 - L258** | `<main>` | HTML DOM Section L126-L258 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L260 - L260** | `id="bmaFooterContainer"` | HTML DOM Section L260-L260 |
| `<div#modalPersonnelForm>` | `html_dom_section` | **L266 - L377** | `id="modalPersonnelForm"` | HTML DOM Section L266-L377 |
| `<div#bulkImportPreviewContainer>` | `html_dom_section` | **L593 - L634** | `id="bulkImportPreviewContainer"` | HTML DOM Section L593-L634 |
| `<div#bulkImportProgressContainer>` | `html_dom_section` | **L654 - L662** | `id="bulkImportProgressContainer"` | HTML DOM Section L654-L662 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L680 - L680** | `<script>` | Bootstrap script L680-L680 |

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

## File: `reports.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `f5664f3d64b440e2` | **Total Lines:** `536` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L115** | `<head>` | HTML DOM Section L3-L115 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L119 - L119** | `id="bmaSidebarContainer"` | HTML DOM Section L119-L119 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L123 - L123** | `id="bmaTopbarContainer"` | HTML DOM Section L123-L123 |
| `<main>` | `html_dom_section` | **L125 - L282** | `<main>` | HTML DOM Section L125-L282 |
| `<div#reportMobileShortcutContainer>` | `html_dom_section` | **L127 - L127** | `id="reportMobileShortcutContainer"` | HTML DOM Section L127-L127 |
| `<div#statusTagsFilterContainer>` | `html_dom_section` | **L273 - L273** | `id="statusTagsFilterContainer"` | HTML DOM Section L273-L273 |
| `<div#reportTablesMasterContainer>` | `html_dom_section` | **L280 - L280** | `id="reportTablesMasterContainer"` | HTML DOM Section L280-L280 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L284 - L284** | `id="bmaFooterContainer"` | HTML DOM Section L284-L284 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L534 - L534** | `<script>` | Bootstrap script L534-L534 |

---

## File: `settings.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `21366aa39bae7c95` | **Total Lines:** `831` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L114** | `<head>` | HTML DOM Section L3-L114 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L118 - L118** | `id="bmaSidebarContainer"` | HTML DOM Section L118-L118 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L122 - L122** | `id="bmaTopbarContainer"` | HTML DOM Section L122-L122 |
| `<main>` | `html_dom_section` | **L124 - L745** | `<main>` | HTML DOM Section L124-L745 |
| `<div#prefixListContainer>` | `html_dom_section` | **L574 - L574** | `id="prefixListContainer"` | HTML DOM Section L574-L574 |
| `<div#offsiteJobTypeListContainer>` | `html_dom_section` | **L591 - L591** | `id="offsiteJobTypeListContainer"` | HTML DOM Section L591-L591 |
| `<div#specialReasonListContainer>` | `html_dom_section` | **L608 - L608** | `id="specialReasonListContainer"` | HTML DOM Section L608-L608 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L747 - L747** | `id="bmaFooterContainer"` | HTML DOM Section L747-L747 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L774 - L774** | `<script>` | Bootstrap script L774-L774 |

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
- **Hash:** `848511e7669bd05d` | **Total Lines:** `129` | **Imports:** `0` | **Exports:** `None`

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
| `ALTER staging.attendance_logs (L59)` | `sql_alter` | **L59 - L60** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L59-L60 |
| `ALTER staging.attendance_logs (L62)` | `sql_alter` | **L62 - L63** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L62-L63 |
| `ALTER staging.attendance_logs (L65)` | `sql_alter` | **L65 - L69** | `ALTER TABLE staging.attendance_logs` | Schema Alteration L65-L69 |
| `ALTER staging.system_settings (L72)` | `sql_alter` | **L72 - L72** | `ALTER TABLE staging.system_settings ENABLE ROW LEVEL SECURIT` | Schema Alteration L72-L72 |
| `ALTER staging.personnel (L73)` | `sql_alter` | **L73 - L73** | `ALTER TABLE staging.personnel ENABLE ROW LEVEL SECURITY;` | Schema Alteration L73-L73 |
| `ALTER staging.user_accounts (L74)` | `sql_alter` | **L74 - L74** | `ALTER TABLE staging.user_accounts ENABLE ROW LEVEL SECURITY;` | Schema Alteration L74-L74 |
| `ALTER staging.attendance_logs (L75)` | `sql_alter` | **L75 - L75** | `ALTER TABLE staging.attendance_logs ENABLE ROW LEVEL SECURIT` | Schema Alteration L75-L75 |
| `POLICY "staging_system_settings_all" ON staging.system_settings` | `sql_rls_policy` | **L79 - L79** | `ON staging.system_settings` | Supabase RLS Policy L79-L79 |
| `POLICY "staging_personnel_all" ON staging.personnel` | `sql_rls_policy` | **L82 - L82** | `ON staging.personnel` | Supabase RLS Policy L82-L82 |
| `POLICY "staging_user_accounts_all" ON staging.user_accounts` | `sql_rls_policy` | **L85 - L85** | `ON staging.user_accounts` | Supabase RLS Policy L85-L85 |
| `POLICY "staging_attendance_logs_all" ON staging.attendance_logs` | `sql_rls_policy` | **L88 - L88** | `ON staging.attendance_logs` | Supabase RLS Policy L88-L88 |

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

## File: `users.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `b31c4d11b795b451` | **Total Lines:** `431` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L115** | `<head>` | HTML DOM Section L3-L115 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L119 - L119** | `id="bmaSidebarContainer"` | HTML DOM Section L119-L119 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L123 - L123** | `id="bmaTopbarContainer"` | HTML DOM Section L123-L123 |
| `<main>` | `html_dom_section` | **L125 - L294** | `<main>` | HTML DOM Section L125-L294 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L296 - L296** | `id="bmaFooterContainer"` | HTML DOM Section L296-L296 |
| `<div#modalUserAccountForm>` | `html_dom_section` | **L302 - L427** | `id="modalUserAccountForm"` | HTML DOM Section L302-L427 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L429 - L429** | `<script>` | Bootstrap script L429-L429 |

---

