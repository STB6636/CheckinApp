# สารบัญไฟล์และฟังก์ชันของโปรเจกต์ (VS Code Automated File & Function Index)

- **อัปเดตล่าสุด (Last Indexed):** `2026-11-17T10:46:47.711Z`
- **จำนวนไฟล์ที่สแกนทั้งหมด (Total Files):** `180` | **จำนวนฟังก์ชัน/สัญลักษณ์ทั้งหมด (Total Symbols):** `1113`
- **กฎการใช้งานสำหรับ AI (Token-Saving Rule):** ห้ามอ่านไฟล์ทั้งหมด ให้ดูช่วงบรรทัด `L_start - L_end` ในตารางด้านล่าง แล้วดึงเฉพาะช่วงบรรทัดที่ต้องการใช้งานเท่านั้น

---

## File: `approvals.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `137988ed146bd101` | **Total Lines:** `222` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L115** | `<head>` | HTML DOM Section L3-L115 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L119 - L119** | `id="bmaSidebarContainer"` | HTML DOM Section L119-L119 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L123 - L123** | `id="bmaTopbarContainer"` | HTML DOM Section L123-L123 |
| `<main>` | `html_dom_section` | **L125 - L213** | `<main>` | HTML DOM Section L125-L213 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L215 - L215** | `id="bmaFooterContainer"` | HTML DOM Section L215-L215 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L220 - L220** | `<script>` | Bootstrap script L220-L220 |

---

## File: `assets/js/components/AppLayout.js`
- **Layer:** Shared UI Component Layer
- **Hash:** `c5ab07d59d14b706` | **Total Lines:** `1059` | **Imports:** `8` | **Exports:** `AppLayout`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `AppLayout` | `class` | **L15 - L1059** | `export class AppLayout` | Class Definition (1045 lines) |
| `AppLayout.canViewUsersMenu` | `static public method` | **L68 - L75** | `(user) => any` | static public method L68-L75 (8 lines) |
| `AppLayout.initAdminLayout` | `static public async method` | **L77 - L156** | `({ activePage, pageTitle, pageSubtitle = '' }) => Promise<any>` | static public async method L77-L156 (80 lines) |
| `AppLayout.checkAndShowWelcomeToast` | `static public method` | **L158 - L167** | `(currentUser) => any` | static public method L158-L167 (10 lines) |
| `AppLayout.#updateActiveNavState` | `static private method` | **L169 - L206** | `(activePage, pageTitle, pageSubtitle) => any` | static private method L169-L206 (38 lines) |
| `AppLayout.renderMainSkeleton` | `static public method` | **L212 - L250** | `() => any` | static public method L212-L250 (39 lines) |
| `AppLayout.navigateAjaxPage` | `static public async method` | **L258 - L374** | `(targetFile, pushHistory = true) => Promise<any>` | static public async method L258-L374 (117 lines) |
| `AppLayout.#renderSidebar` | `static private method` | **L376 - L488** | `(currentUser, settings, activePage) => any` | static private method L376-L488 (113 lines) |
| `AppLayout.#renderTopbar` | `static private method` | **L490 - L546** | `(currentUser, settings, pageTitle, pageSubtitle) => any` | static private method L490-L546 (57 lines) |
| `AppLayout.#renderMobileBottomNav` | `static private method` | **L548 - L574** | `(currentUser, activePage) => any` | static private method L548-L574 (27 lines) |
| `AppLayout.getMobileShortcutGridHtml` | `static public method` | **L576 - L606** | `(currentUser) => any` | static public method L576-L606 (31 lines) |
| `AppLayout.#renderFooter` | `static private method` | **L608 - L627** | `(settings) => any` | static private method L608-L627 (20 lines) |
| `AppLayout.refreshNotificationBell` | `static public async method` | **L629 - L802** | `(currentUser) => Promise<any>` | static public async method L629-L802 (174 lines) |
| `AppLayout.initAdminRealtimeSync` | `static public method` | **L804 - L943** | `(currentUser) => any` | static public method L804-L943 (140 lines) |
| `AppLayout.#bindGlobalDelegatedEvents` | `static private method` | **L945 - L1058** | `() => any` | static private method L945-L1058 (114 lines) |

---

## File: `assets/js/components/SystemUpdateModal.js`
- **Layer:** Shared UI Component Layer
- **Hash:** `25997808387d8005` | **Total Lines:** `836` | **Imports:** `0` | **Exports:** `SystemUpdateModal`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SystemUpdateModal` | `class` | **L8 - L835** | `export class SystemUpdateModal` | พร้อมระบบนับการรับทราบ 1 ครั้งต่อ 1 รอบประกาศ (bma_last_seen_announcement_id) ข้ามทั้งหน้า Login และ Session 7 วัน |
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
| `SystemUpdateModal.close` | `static public method` | **L802 - L826** | `(saveAcknowledge = true) => any` | static public method L802-L826 (25 lines) |
| `SystemUpdateModal.getVersionData` | `static public method` | **L832 - L834** | `() => any` | static public method L832-L834 (3 lines) |

---

## File: `assets/js/controllers/ApprovalsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `cce632e8019b14d5` | **Total Lines:** `545` | **Imports:** `4` | **Exports:** `ApprovalsController`

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
- **Hash:** `a1cba438f2de79cf` | **Total Lines:** `4474` | **Imports:** `7` | **Exports:** `CheckinController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `CheckinController` | `class` | **L14 - L912** | `export class CheckinController` | Class Definition (899 lines) |
| `CheckinController.constructor` | `public constructor` | **L15 - L72** | `() => any` | public constructor L15-L72 (58 lines) |
| `CheckinController.init` | `public async method` | **L74 - L153** | `() => Promise<any>` | public async method L74-L153 (80 lines) |
| `CheckinController.#initRealtimeSettingsListener` | `private method` | **L155 - L217** | `() => any` | private method L155-L217 (63 lines) |
| `triggerDebouncedPersonalSync` | `arrow_fn` | **L162 - L170** | `(payload) => inferred` | Arrow Function L162-L170 |
| `CheckinController.#syncPersonalAttendanceSilent` | `private async method` | **L219 - L225** | `() => Promise<any>` | private async method L219-L225 (7 lines) |
| `CheckinController.#syncSettingsHotReload` | `private async method` | **L227 - L248** | `() => Promise<any>` | private async method L227-L248 (22 lines) |
| `CheckinController.#applySettingsHotReload` | `private method` | **L250 - L276** | `(newSettings) => any` | private method L250-L276 (27 lines) |
| `CheckinController.#applyDynamicWorkspaceLayout` | `private method` | **L278 - L309** | `() => any` | private method L278-L309 (32 lines) |
| `CheckinController.#updateThemeButtonUI` | `private method` | **L311 - L329** | `() => any` | private method L311-L329 (19 lines) |
| `CheckinController.#checkAndShowWelcomeToast` | `private method` | **L331 - L339** | `() => any` | private method L331-L339 (9 lines) |
| `CheckinController.#startLiveClock24` | `private method` | **L341 - L367** | `() => any` | private method L341-L367 (27 lines) |
| `updateClock` | `arrow_fn` | **L342 - L364** | `() => inferred` | Arrow Function L342-L364 |
| `CheckinController.#isShiftAlreadyRecordedToday` | `private method` | **L369 - L417** | `(shift) => any` | private method L369-L417 (49 lines) |
| `CheckinController.#isShiftActiveAtCurrentTime` | `private method` | **L419 - L454** | `(shift, nowMin, allowStartMin) => any` | private method L419-L454 (36 lines) |
| `CheckinController.#evaluateTimeWindowAndPopulateShifts` | `private method` | **L456 - L560** | `() => any` | private method L456-L560 (105 lines) |
| `CheckinController.#calculateHaversineMeters` | `private method` | **L565 - L577** | `(lat1, lon1, lat2, lon2) => any` | คำนวณระยะทางแบบ Haversine (หน่วย: เมตร) |
| `CheckinController.evaluateOnsiteGeofence` | `public method` | **L585 - L666** | `(currentLat, currentLng) => any` | public method L585-L666 (82 lines) |
| `CheckinController.#renderGeofenceStatusUI` | `private method` | **L668 - L738** | `() => any` | private method L668-L738 (71 lines) |
| `CheckinController.#initLocaV2ModeAndChips` | `private method` | **L740 - L742** | `() => any` | private method L740-L742 (3 lines) |
| `CheckinController.#initModeSwitcher` | `private method` | **L744 - L854** | `() => any` | private method L744-L854 (111 lines) |
| `setActiveOffsiteGps` | `arrow_fn` | **L751 - L760** | `(source) => inferred` | Arrow Function L751-L760 |
| `CheckinController.#initViewGpsMapModal` | `private method` | **L856 - L863** | `() => any` | private method L856-L863 (8 lines) |
| `CheckinController.#openViewGpsMapModal` | `private method` | **L865 - L911** | `() => any` | private method L865-L911 (47 lines) |
| `#goToStep` | `private method` | **L914 - L979** | `(step) => any` | private method L914-L979 (66 lines) |
| `#updateStep1Validation` | `private method` | **L981 - L1016** | `() => any` | private method L981-L1016 (36 lines) |
| `#openOffsiteMapModal` | `private method` | **L1018 - L1113** | `() => any` | private method L1018-L1113 (96 lines) |
| `#updateOffsiteModalMarker` | `private async method` | **L1116 - L1176** | `(lat, lng, explicitName = null, extent = null) => Promise<any>` | private async method L1116-L1176 (61 lines) |
| `#initOffsiteModalGps` | `private method` | **L1178 - L1404** | `() => any` | private method L1178-L1404 (227 lines) |
| `escapeHtml` | `arrow_fn` | **L1187 - L1195** | `(str) => inferred` | Arrow Function L1187-L1195 |
| `hideSearchResults` | `arrow_fn` | **L1197 - L1202** | `() => inferred` | Arrow Function L1197-L1202 |
| `closeModal` | `arrow_fn` | **L1204 - L1207** | `() => inferred` | Arrow Function L1204-L1207 |
| `performSearch` | `async_arrow_fn` | **L1255 - L1369** | `() => inferred` | Arrow Function L1255-L1369 |
| `#renderUserAndSettingsInfo` | `private method` | **L1408 - L1539** | `() => any` | private method L1408-L1539 (132 lines) |
| `setElText` | `arrow_fn` | **L1413 - L1416** | `(id, text) => inferred` | Arrow Function L1413-L1416 |
| `#refreshAllAttendanceData` | `private async method` | **L1541 - L1558** | `() => Promise<any>` | private async method L1541-L1558 (18 lines) |
| `#updateStatusCardsAndMainButton` | `private method` | **L1560 - L1844** | `() => any` | private method L1560-L1844 (285 lines) |
| `applyGpsSearchingLock` | `arrow_fn` | **L1587 - L1597** | `() => inferred` | Arrow Function L1587-L1597 |
| `setShiftCardVisibility` | `arrow_fn` | **L1599 - L1608** | `(visible) => inferred` | Arrow Function L1599-L1608 |
| `#renderPersonalAttendanceTabs` | `private method` | **L1846 - L1889** | `() => any` | private method L1846-L1889 (44 lines) |
| `#buildHistoryRowHtml` | `private method` | **L1891 - L1911** | `(item, rowNumber) => any` | private method L1891-L1911 (21 lines) |
| `#renderSpecialRequestsHistoryTable` | `private method` | **L1913 - L1960** | `() => any` | private method L1913-L1960 (48 lines) |
| `#openFullscreenCamera` | `private async method` | **L1965 - L1967** | `() => Promise<any>` | เปิดกล้องแบบเต็มหน้าจอเพื่อถ่ายภาพยืนยันตัวตน |
| `#captureAndCloseCamera` | `private method` | **L1969 - L2009** | `() => any` | private method L1969-L2009 (41 lines) |
| `#closeFullscreenCamera` | `private method` | **L2011 - L2016** | `() => any` | private method L2011-L2016 (6 lines) |
| `#checkCameraHardware` | `private async method` | **L2022 - L2039** | `() => Promise<any>` | private async method L2022-L2039 (18 lines) |
| `#handleFallbackFileSelected` | `private method` | **L2041 - L2125** | `(file) => any` | private method L2041-L2125 (85 lines) |
| `resetFileInput` | `arrow_fn` | **L2047 - L2050** | `() => inferred` | Arrow Function L2047-L2050 |
| `notifyReadError` | `arrow_fn` | **L2051 - L2058** | `() => inferred` | Arrow Function L2051-L2058 |
| `#stopCameraHardwareStream` | `private method` | **L2127 - L2146** | `() => any` | private method L2127-L2146 (20 lines) |
| `#stopCameraAndShowStandby` | `private method` | **L2148 - L2176** | `() => any` | private method L2148-L2176 (29 lines) |
| `#openCameraOnDemand` | `private async method` | **L2181 - L2199** | `() => Promise<any>` | เปิดกล้องอัตโนมัติเมื่อเข้าสู่ Step 2 (คงการอัปเดต DOM สำหรับโหมด On-Demand) |
| `#startCameraSession` | `private async method` | **L2206 - L2332** | `({ showFullscreenModal = true } = {}) => Promise<any>` | private async method L2206-L2332 (127 lines) |
| `#acquireCameraStreamWithRetry` | `private async method` | **L2340 - L2391** | `(initialStreamPromise, sessionToken) => Promise<any>` | private async method L2340-L2391 (52 lines) |
| `#bindCameraStreamLifecycle` | `private method` | **L2397 - L2405** | `(stream) => any` | private method L2397-L2405 (9 lines) |
| `#handleUnexpectedCameraStreamStop` | `private method` | **L2411 - L2438** | `(message = '') => any` | private method L2411-L2438 (28 lines) |
| `#detectCameraBrowserProfile` | `private method` | **L2444 - L2472** | `() => any` | private method L2444-L2472 (29 lines) |
| `#getCameraPermissionHintHtml` | `private method` | **L2479 - L2492** | `(profile) => any` | private method L2479-L2492 (14 lines) |
| `#hideCameraPermissionHint` | `private method` | **L2511 - L2517** | `() => any` | ซ่อนแบนเนอร์แนะนำสิทธิ์กล้องและยกเลิก Timer ที่ค้างอยู่ |
| `#scheduleCameraPermissionHint` | `private method` | **L2523 - L2552** | `(sessionToken = this.cameraSessionToken) => any` | private method L2523-L2552 (30 lines) |
| `#classifyCameraErrorReason` | `private method` | **L2559 - L2574** | `(err) => any` | private method L2559-L2574 (16 lines) |
| `#getBrowserPermissionRecoveryStepsHtml` | `private method` | **L2581 - L2620** | `(profile) => any` | private method L2581-L2620 (40 lines) |
| `#showCameraGuidanceModal` | `private async method` | **L2626 - L2707** | `({ reason, allowFallback }) => Promise<any>` | private async method L2626-L2707 (82 lines) |
| `#capturePhotoAndStopStream` | `private method` | **L2709 - L2741** | `() => any` | private method L2709-L2741 (33 lines) |
| `#resetPageAfterSave` | `private async method` | **L2743 - L2758** | `() => Promise<any>` | private async method L2743-L2758 (16 lines) |
| `#initGpsLocation` | `private async method` | **L2766 - L2923** | `({ forceRefresh = false } = {}) => Promise<any>` | 3. หากยังไม่พบ จะดึง ซอย / ซอยย่อย -> แสดง ["ใกล้เคียง " + ชื่อซอย] |
| `#renderInlineGpsMap` | `private method` | **L2925 - L2991** | `(lat, lng) => any` | private method L2925-L2991 (67 lines) |
| `#bindEvents` | `private method` | **L2994 - L3298** | `() => any` | private method L2994-L3298 (305 lines) |
| `openSpecialModal` | `arrow_fn` | **L3162 - L3165** | `() => inferred` | Arrow Function L3162-L3165 |
| `setDesktopActiveTab` | `arrow_fn` | **L3202 - L3221** | `(activeName) => inferred` | Arrow Function L3202-L3221 |
| `openMobileDrawer` | `arrow_fn` | **L3232 - L3250** | `() => inferred` | Arrow Function L3232-L3250 |
| `closeMobileDrawer` | `arrow_fn` | **L3252 - L3279** | `(targetTab = null) => inferred` | Arrow Function L3252-L3279 |
| `#handleMainCheckin` | `private async method` | **L3300 - L3732** | `() => Promise<any>` | private async method L3300-L3732 (433 lines) |
| `#openSpecialRequestModal` | `private method` | **L3734 - L3811** | `() => any` | private method L3734-L3811 (78 lines) |
| `#initModalSpecialRequest` | `private method` | **L3813 - L3865** | `() => any` | private method L3813-L3865 (53 lines) |
| `#initSpecialModalGps` | `private method` | **L3867 - L3993** | `() => any` | private method L3867-L3993 (127 lines) |
| `updateCustomPinAndLocation` | `async_arrow_fn` | **L3879 - L3950** | `(lat, lng, flyTo = false, explicitName = null, extent = null) => inferred` | Arrow Function L3879-L3950 |
| `setupMapIfAvailable` | `arrow_fn` | **L3952 - L3987** | `() => inferred` | Arrow Function L3952-L3987 |
| `getDistanceInMeters` | `arrow_fn` | **L4012 - L4031** | `(lat1, lon1, lat2, lon2) => inferred` | Arrow Function L4012-L4031 |
| `calculateDistance` | `arrow_fn` | **L4033 - L4042** | `(lat1, lon1, lat2, lon2) => inferred` | Arrow Function L4033-L4042 |
| `getCategoryLabel` | `arrow_fn` | **L4044 - L4083** | `(item) => inferred` | Arrow Function L4044-L4083 |
| `escapeHtml` | `arrow_fn` | **L4085 - L4093** | `(str) => inferred` | Arrow Function L4085-L4093 |
| `formatSubAddress` | `arrow_fn` | **L4095 - L4111** | `(item) => inferred` | Arrow Function L4095-L4111 |
| `getMainName` | `arrow_fn` | **L4113 - L4121** | `(item) => inferred` | Arrow Function L4113-L4121 |
| `hideSearchResults` | `arrow_fn` | **L4123 - L4128** | `() => inferred` | Arrow Function L4123-L4128 |
| `bindResultItemClicks` | `arrow_fn` | **L4130 - L4150** | `() => inferred` | Arrow Function L4130-L4150 |
| `renderCoordsResult` | `arrow_fn` | **L4152 - L4176** | `(lat, lng) => inferred` | Arrow Function L4152-L4176 |
| `renderPlaceResults` | `arrow_fn` | **L4178 - L4224** | `(items) => inferred` | Arrow Function L4178-L4224 |
| `performSearch` | `async_arrow_fn` | **L4229 - L4290** | `() => inferred` | Arrow Function L4229-L4290 |
| `#handleSubmitSpecialRequest` | `private async method` | **L4330 - L4469** | `(closeModalCallback) => Promise<any>` | private async method L4330-L4469 (140 lines) |

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
- **Hash:** `8552135bddecbdb3` | **Total Lines:** `334` | **Imports:** `5` | **Exports:** `LoginController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `LoginController` | `class` | **L12 - L330** | `export class LoginController` | Class Definition (319 lines) |
| `LoginController.constructor` | `public constructor` | **L13 - L16** | `() => any` | public constructor L13-L16 (4 lines) |
| `LoginController.init` | `public async method` | **L18 - L39** | `() => Promise<any>` | public async method L18-L39 (22 lines) |
| `LoginController.#loadOrganizationBranding` | `private async method` | **L41 - L101** | `() => Promise<any>` | private async method L41-L101 (61 lines) |
| `LoginController.#updateThemeButtonUI` | `private method` | **L103 - L113** | `() => any` | private method L103-L113 (11 lines) |
| `LoginController.#bindEvents` | `private method` | **L115 - L220** | `() => any` | private method L115-L220 (106 lines) |
| `openChangeModal` | `arrow_fn` | **L156 - L165** | `() => inferred` | Arrow Function L156-L165 |
| `validatePasswordMatch` | `arrow_fn` | **L172 - L194** | `() => inferred` | Arrow Function L172-L194 |
| `openForgotModal` | `arrow_fn` | **L205 - L209** | `() => inferred` | Arrow Function L205-L209 |
| `LoginController.#handleLogin` | `private async method` | **L222 - L243** | `(mode) => Promise<any>` | private async method L222-L243 (22 lines) |
| `LoginController.#loadRememberedUser` | `private method` | **L245 - L265** | `() => any` | private method L245-L265 (21 lines) |
| `LoginController.#persistRememberedUser` | `private method` | **L267 - L282** | `(username) => any` | private method L267-L282 (16 lines) |
| `LoginController.#handleChangePasswordSubmit` | `private async method` | **L284 - L308** | `(closeModalCallback) => Promise<any>` | private async method L284-L308 (25 lines) |
| `LoginController.#handleForgotPasswordSubmit` | `private async method` | **L310 - L329** | `(closeModalCallback) => Promise<any>` | private async method L310-L329 (20 lines) |

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
- **Hash:** `2d353ab81e86be84` | **Total Lines:** `2218` | **Imports:** `5` | **Exports:** `SettingsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SettingsController` | `class` | **L12 - L2209** | `export class SettingsController` | Class Definition (2198 lines) |
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
| `SettingsController.#openAnnouncementPreviewModal` | `private method` | **L357 - L422** | `() => any` | private method L357-L422 (66 lines) |
| `SettingsController.#closeAnnouncementPreviewModal` | `private method` | **L424 - L426** | `() => any` | private method L424-L426 (3 lines) |
| `SettingsController.#saveAnnouncementTab` | `private async method` | **L428 - L461** | `() => Promise<any>` | private async method L428-L461 (34 lines) |
| `SettingsController.#updateColorPreviewBadges` | `private method` | **L463 - L479** | `() => any` | private method L463-L479 (17 lines) |
| `SettingsController.#syncCheckinModeUI` | `private method` | **L484 - L515** | `(isSingleClick) => any` | ย่อข้อความป้าย Tag ให้เหลือแค่ "รูปแบบพิเศษ" หรือ "รูปแบบปกติ" เพื่อไม่ให้ล้นจอหรือเบียดข้อความในมือถือ |
| `SettingsController.#updateLogoPreview` | `private method` | **L517 - L525** | `(url) => any` | private method L517-L525 (9 lines) |
| `SettingsController.#buildSortButtonsHtml` | `private method` | **L527 - L540** | `(category, index, totalLength) => any` | private method L527-L540 (14 lines) |
| `SettingsController.#renderPrefixes` | `private method` | **L542 - L562** | `() => any` | private method L542-L562 (21 lines) |
| `SettingsController.#renderRemarks` | `private method` | **L564 - L584** | `() => any` | private method L564-L584 (21 lines) |
| `SettingsController.#renderOffsiteJobTypes` | `private method` | **L586 - L609** | `() => any` | private method L586-L609 (24 lines) |
| `SettingsController.#renderSpecialReasons` | `private method` | **L611 - L634** | `() => any` | private method L611-L634 (24 lines) |
| `SettingsController.#renderShifts` | `private method` | **L636 - L688** | `() => any` | private method L636-L688 (53 lines) |
| `SettingsController.#renderPositions` | `private method` | **L690 - L711** | `() => any` | private method L690-L711 (22 lines) |
| `SettingsController.#renderAffiliations` | `private method` | **L713 - L735** | `() => any` | private method L713-L735 (23 lines) |
| `SettingsController.#renderOfficialLocations` | `private method` | **L737 - L801** | `() => any` | private method L737-L801 (65 lines) |
| `SettingsController.#openOfficialLocationModal` | `private method` | **L803 - L950** | `(editIndex = null) => any` | private method L803-L950 (148 lines) |
| `updateMapLink` | `arrow_fn` | **L942 - L947** | `() => inferred` | Arrow Function L942-L947 |
| `SettingsController.#collectMainAndColorFieldsIntoSettings` | `private method` | **L952 - L1028** | `() => any` | private method L952-L1028 (77 lines) |
| `SettingsController.#persistSettings` | `private async method` | **L1030 - L1083** | `(showToastAlert = true) => Promise<any>` | private async method L1030-L1083 (54 lines) |
| `SettingsController.#openModal` | `private method` | **L1085 - L1090** | `(title, bodyHtml, onSubmitCallback) => any` | private method L1085-L1090 (6 lines) |
| `SettingsController.#closeModal` | `private method` | **L1092 - L1095** | `() => any` | private method L1092-L1095 (4 lines) |
| `SettingsController.#buildMultiRowInputsHtml` | `private method` | **L1097 - L1116** | `(fieldLabel, placeholder) => any` | private method L1097-L1116 (20 lines) |
| `SettingsController.#bindDynamicMultiRowEvents` | `private method` | **L1118 - L1146** | `(placeholder = 'ระบุข้อมูล...') => any` | private method L1118-L1146 (29 lines) |
| `SettingsController.#getDynamicMultiRowValues` | `private method` | **L1148 - L1153** | `() => any` | private method L1148-L1153 (6 lines) |
| `SettingsController.#bindEvents` | `private method` | **L1155 - L1729** | `() => any` | private method L1155-L1729 (575 lines) |
| `mainClickHandler` | `async_arrow_fn` | **L1607 - L1725** | `(e) => inferred` | Arrow Function L1607-L1725 |
| `SettingsController.#openShiftModal` | `private method` | **L1731 - L1822** | `(editIndex = null) => any` | private method L1731-L1822 (92 lines) |
| `checkOvernightAuto` | `arrow_fn` | **L1812 - L1819** | `() => inferred` | Arrow Function L1812-L1819 |
| `SettingsController.#openAddPositionStep1Modal` | `private method` | **L1824 - L1840** | `() => any` | private method L1824-L1840 (17 lines) |
| `SettingsController.#openAddPositionStep2Modal` | `private method` | **L1842 - L1885** | `() => any` | private method L1842-L1885 (44 lines) |
| `SettingsController.#openAddPositionStep3Modal` | `private method` | **L1887 - L1951** | `() => any` | private method L1887-L1951 (65 lines) |
| `SettingsController.#openEditSinglePositionModal` | `private method` | **L1953 - L1976** | `(editIndex) => any` | private method L1953-L1976 (24 lines) |
| `SettingsController.#openAddAffiliationStep1OrgModal` | `private method` | **L1978 - L1994** | `() => any` | private method L1978-L1994 (17 lines) |
| `SettingsController.#openAddAffiliationStep2BureauModal` | `private method` | **L1996 - L2034** | `() => any` | private method L1996-L2034 (39 lines) |
| `SettingsController.#openAddAffiliationStep3DivisionModal` | `private method` | **L2036 - L2092** | `() => any` | private method L2036-L2092 (57 lines) |
| `SettingsController.#openAddAffiliationStep4GroupModal` | `private method` | **L2094 - L2178** | `() => any` | private method L2094-L2178 (85 lines) |
| `SettingsController.#openEditSingleAffiliationModal` | `private method` | **L2180 - L2208** | `(editIndex) => any` | private method L2180-L2208 (29 lines) |

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
- **Hash:** `29b06e280c7d276f` | **Total Lines:** `1272` | **Imports:** `1` | **Exports:** `UIHelpers`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `UIHelpers` | `class` | **L8 - L1272** | `export class UIHelpers` | Class Definition (1265 lines) |
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
| `UIHelpers.verifyGoogleDriveLink` | `static public async method` | **L354 - L413** | `(scriptUrl, folderId = '', options = {}) => Promise<any>` | static public async method L354-L413 (60 lines) |
| `UIHelpers.uploadPhotoToGoogleDrive` | `static public async method` | **L415 - L509** | `(base64DataUrl, fileNamePrefix, settings, options = {}) => Promise<any>` | static public async method L415-L509 (95 lines) |
| `UIHelpers.showLoading` | `static public method` | **L516 - L578** | `(message = 'กำลังประมวลผลข้อมูล กรุณารอสักครู่...') => any` | static public method L516-L578 (63 lines) |
| `UIHelpers.#updateProgressDOM` | `static private method` | **L580 - L587** | `(percent) => any` | static private method L580-L587 (8 lines) |
| `UIHelpers.hideLoading` | `static public method` | **L589 - L614** | `() => any` | static public method L589-L614 (26 lines) |
| `UIHelpers.renderTableSkeleton` | `static public method` | **L616 - L626** | `(rows = 5, cols = 6) => any` | static public method L616-L626 (11 lines) |
| `UIHelpers.alert` | `static public async method` | **L628 - L663** | `(title, text = '', icon = 'success') => Promise<any>` | static public async method L628-L663 (36 lines) |
| `UIHelpers.confirm` | `static public async method` | **L665 - L715** | `(title, text = '', confirmText = 'ยืนยัน', icon = 'warning', options = {}) => Promise<any>` | static public async method L665-L715 (51 lines) |
| `UIHelpers.validateThaiNationalId` | `static public method` | **L717 - L736** | `(id, strictCheckDigit = false) => any` | static public method L717-L736 (20 lines) |
| `UIHelpers.getLast6DigitsFromNationalId` | `static public method` | **L738 - L742** | `(nationalId) => any` | static public method L738-L742 (5 lines) |
| `UIHelpers.exportToExcelUTF8` | `static public method` | **L744 - L769** | `(dataRows, fileName = 'export_data', sheetName = 'Sheet1') => any` | static public method L744-L769 (26 lines) |
| `UIHelpers.exportMultiSheetExcel` | `static public method` | **L776 - L796** | `(sheets, fileName = 'export_data') => any` | static public method L776-L796 (21 lines) |
| `UIHelpers.exportTemplateWithValidationsExcel` | `static public async method` | **L805 - L1068** | `({ settings, templateRows, fileName = 'Template_นำเข้าบุคลากร_กทม' }) => Promise<any>` | static public async method L805-L1068 (264 lines) |
| `UIHelpers.parseExcelFileUTF8` | `static public method` | **L1070 - L1092** | `(file) => any` | static public method L1070-L1092 (23 lines) |
| `UIHelpers.printReportInNewTab` | `static public method` | **L1094 - L1271** | `({ title, subtitle, tableHtml, headerColor = '#007B3E' }) => any` | static public method L1094-L1271 (178 lines) |

---

## File: `assets/js/models/AttendanceModel.js`
- **Layer:** Data Model & Supabase Repository Layer
- **Hash:** `75466ad8d4803b5a` | **Total Lines:** `2758` | **Imports:** `5` | **Exports:** `AttendanceModel`

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
- **Hash:** `28eec00476ab7e8a` | **Total Lines:** `370` | **Imports:** `3` | **Exports:** `UserModel`

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
- **Hash:** `d6d1368444fc532a` | **Total Lines:** `1073` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L179** | `<head>` | HTML DOM Section L3-L179 |
| `<main>` | `html_dom_section` | **L260 - L648** | `<main>` | HTML DOM Section L260-L648 |
| `<div#checkinWorkspaceWrapper>` | `html_dom_section` | **L263 - L506** | `id="checkinWorkspaceWrapper"` | HTML DOM Section L263-L506 |
| `<div#photoPreviewCard>` | `html_dom_section` | **L306 - L327** | `id="photoPreviewCard"` | HTML DOM Section L306-L327 |
| `<div#gpsSectionCard>` | `html_dom_section` | **L330 - L367** | `id="gpsSectionCard"` | HTML DOM Section L330-L367 |
| `<div#googleMapEmbedWrapper>` | `html_dom_section` | **L364 - L364** | `id="googleMapEmbedWrapper"` | HTML DOM Section L364-L364 |
| `<div#onsiteGeofenceStatusCard>` | `html_dom_section` | **L388 - L399** | `id="onsiteGeofenceStatusCard"` | HTML DOM Section L388-L399 |
| `<div#offsiteLocationSection>` | `html_dom_section` | **L402 - L438** | `id="offsiteLocationSection"` | HTML DOM Section L402-L438 |
| `<div#offsiteRemarkChipsContainer>` | `html_dom_section` | **L434 - L434** | `id="offsiteRemarkChipsContainer"` | HTML DOM Section L434-L434 |
| `<div#checkinActionCard>` | `html_dom_section` | **L442 - L475** | `id="checkinActionCard"` | HTML DOM Section L442-L475 |
| `<div#shiftSelectorContainer>` | `html_dom_section` | **L452 - L457** | `id="shiftSelectorContainer"` | HTML DOM Section L452-L457 |
| `<div#mainCustomTimeContainer>` | `html_dom_section` | **L459 - L468** | `id="mainCustomTimeContainer"` | HTML DOM Section L459-L468 |
| `<div#checkinStep1Container>` | `html_dom_section` | **L488 - L488** | `id="checkinStep1Container"` | HTML DOM Section L488-L488 |
| `<div#checkinStep2Container>` | `html_dom_section` | **L489 - L489** | `id="checkinStep2Container"` | HTML DOM Section L489-L489 |
| `<div#rightColumnWrapper>` | `html_dom_section` | **L490 - L490** | `id="rightColumnWrapper"` | HTML DOM Section L490-L490 |
| `<div#cameraSectionCard>` | `html_dom_section` | **L494 - L494** | `id="cameraSectionCard"` | HTML DOM Section L494-L494 |
| `<div#cameraStandbyOverlay>` | `html_dom_section` | **L502 - L502** | `id="cameraStandbyOverlay"` | HTML DOM Section L502-L502 |
| `<div#desktopPanesContainer>` | `html_dom_section` | **L509 - L646** | `id="desktopPanesContainer"` | HTML DOM Section L509-L646 |
| `<div#desktopHistoryWrapper>` | `html_dom_section` | **L512 - L601** | `id="desktopHistoryWrapper"` | HTML DOM Section L512-L601 |
| `<div#todayHistoryTabPanel>` | `html_dom_section` | **L538 - L555** | `id="todayHistoryTabPanel"` | HTML DOM Section L538-L555 |
| `<div#pastHistoryTabPanel>` | `html_dom_section` | **L558 - L598** | `id="pastHistoryTabPanel"` | HTML DOM Section L558-L598 |
| `<div#desktopSpecialWrapper>` | `html_dom_section` | **L604 - L644** | `id="desktopSpecialWrapper"` | HTML DOM Section L604-L644 |
| `<div#mobileDrawerPanel>` | `html_dom_section` | **L656 - L746** | `id="mobileDrawerPanel"` | HTML DOM Section L656-L746 |
| `<div#spCustomTimeContainer>` | `html_dom_section` | **L779 - L788** | `id="spCustomTimeContainer"` | HTML DOM Section L779-L788 |
| `<div#spOnsiteSection>` | `html_dom_section` | **L816 - L823** | `id="spOnsiteSection"` | HTML DOM Section L816-L823 |
| `<div#spOffsiteSection>` | `html_dom_section` | **L826 - L907** | `id="spOffsiteSection"` | HTML DOM Section L826-L907 |
| `<div#spOffsiteReasonContainer>` | `html_dom_section` | **L827 - L834** | `id="spOffsiteReasonContainer"` | HTML DOM Section L827-L834 |
| `<div#spSearchWrapper>` | `html_dom_section` | **L876 - L882** | `id="spSearchWrapper"` | HTML DOM Section L876-L882 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L934 - L934** | `<script>` | Bootstrap script L934-L934 |

---

## File: `dashboard.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `d4dacd5873efcfe1` | **Total Lines:** `279` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L116** | `<head>` | HTML DOM Section L3-L116 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L120 - L120** | `id="bmaSidebarContainer"` | HTML DOM Section L120-L120 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L126 - L126** | `id="bmaTopbarContainer"` | HTML DOM Section L126-L126 |
| `<main>` | `html_dom_section` | **L129 - L268** | `<main>` | HTML DOM Section L129-L268 |
| `<div#mobileShortcutContainer>` | `html_dom_section` | **L132 - L132** | `id="mobileShortcutContainer"` | HTML DOM Section L132-L132 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L271 - L271** | `id="bmaFooterContainer"` | HTML DOM Section L271-L271 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L277 - L277** | `<script>` | Bootstrap script L277-L277 |

---

## File: `docs/manual/index.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `9d9685e1863f6d04` | **Total Lines:** `685` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L58** | `<head>` | HTML DOM Section L3-L58 |
| `<main>` | `html_dom_section` | **L130 - L623** | `<main>` | HTML DOM Section L130-L623 |

---

## File: `docs/manual/manual-admin.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `e78775b29773b405` | **Total Lines:** `1299` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L57** | `<head>` | HTML DOM Section L3-L57 |
| `<div#mobileTocPanel>` | `html_dom_section` | **L96 - L107** | `id="mobileTocPanel"` | HTML DOM Section L96-L107 |
| `<main>` | `html_dom_section` | **L177 - L1075** | `<main>` | HTML DOM Section L177-L1075 |
| `<div#mockupModal>` | `html_dom_section` | **L1084 - L1110** | `id="mockupModal"` | HTML DOM Section L1084-L1110 |
| `<div#mockupModalPanel>` | `html_dom_section` | **L1086 - L1109** | `id="mockupModalPanel"` | HTML DOM Section L1086-L1109 |

---

## File: `docs/manual/manual-superadmin.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `6dbef44223ecb34f` | **Total Lines:** `1574` | **Imports:** `0` | **Exports:** `None`

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
- **Hash:** `49e3dfa3acf4aa8b` | **Total Lines:** `1410` | **Imports:** `0` | **Exports:** `None`

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
- **Hash:** `45a8b560ead8a3d0` | **Total Lines:** `432` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L193** | `<head>` | HTML DOM Section L3-L193 |
| `<div#mobileOrgLogoWrapper>` | `html_dom_section` | **L218 - L218** | `id="mobileOrgLogoWrapper"` | HTML DOM Section L218-L218 |
| `<main>` | `html_dom_section` | **L225 - L337** | `<main>` | HTML DOM Section L225-L337 |
| `<div#orgLogoWrapper>` | `html_dom_section` | **L232 - L234** | `id="orgLogoWrapper"` | HTML DOM Section L232-L234 |
| `<form#loginForm>` | `html_dom_section` | **L246 - L334** | `id="loginForm"` | HTML DOM Section L246-L334 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L430 - L430** | `<script>` | Bootstrap script L430-L430 |

---

## File: `loading.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `fdf893e2309c3d2c` | **Total Lines:** `449` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L301** | `<head>` | HTML DOM Section L3-L301 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L447 - L447** | `<script>` | Bootstrap script L447-L447 |

---

## File: `personnel.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `8e09c44394525167` | **Total Lines:** `683` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L117** | `<head>` | HTML DOM Section L3-L117 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L121 - L121** | `id="bmaSidebarContainer"` | HTML DOM Section L121-L121 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L125 - L125** | `id="bmaTopbarContainer"` | HTML DOM Section L125-L125 |
| `<main>` | `html_dom_section` | **L127 - L259** | `<main>` | HTML DOM Section L127-L259 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L261 - L261** | `id="bmaFooterContainer"` | HTML DOM Section L261-L261 |
| `<div#modalPersonnelForm>` | `html_dom_section` | **L267 - L378** | `id="modalPersonnelForm"` | HTML DOM Section L267-L378 |
| `<div#bulkImportPreviewContainer>` | `html_dom_section` | **L594 - L635** | `id="bulkImportPreviewContainer"` | HTML DOM Section L594-L635 |
| `<div#bulkImportProgressContainer>` | `html_dom_section` | **L655 - L663** | `id="bulkImportProgressContainer"` | HTML DOM Section L655-L663 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L681 - L681** | `<script>` | Bootstrap script L681-L681 |

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

## File: `reports.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `754a1ce407fdb21f` | **Total Lines:** `537` | **Imports:** `0` | **Exports:** `None`

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
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L535 - L535** | `<script>` | Bootstrap script L535-L535 |

---

## File: `settings.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `c7e0f0e93d4897c2` | **Total Lines:** `1082` | **Imports:** `0` | **Exports:** `None`

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

## File: `users.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `5cf67f44f2798806` | **Total Lines:** `432` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L116** | `<head>` | HTML DOM Section L3-L116 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L120 - L120** | `id="bmaSidebarContainer"` | HTML DOM Section L120-L120 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L124 - L124** | `id="bmaTopbarContainer"` | HTML DOM Section L124-L124 |
| `<main>` | `html_dom_section` | **L126 - L295** | `<main>` | HTML DOM Section L126-L295 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L297 - L297** | `id="bmaFooterContainer"` | HTML DOM Section L297-L297 |
| `<div#modalUserAccountForm>` | `html_dom_section` | **L303 - L428** | `id="modalUserAccountForm"` | HTML DOM Section L303-L428 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L430 - L430** | `<script>` | Bootstrap script L430-L430 |

---

