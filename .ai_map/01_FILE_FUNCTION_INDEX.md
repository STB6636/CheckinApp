# สารบัญไฟล์และฟังก์ชันของโปรเจกต์ (VS Code Automated File & Function Index)

- **อัปเดตล่าสุด (Last Indexed):** `2026-10-28T07:59:28.804Z`
- **จำนวนไฟล์ที่สแกนทั้งหมด (Total Files):** `55` | **จำนวนฟังก์ชัน/สัญลักษณ์ทั้งหมด (Total Symbols):** `418`
- **กฎการใช้งานสำหรับ AI (Token-Saving Rule):** ห้ามอ่านไฟล์ทั้งหมด ให้ดูช่วงบรรทัด `L_start - L_end` ในตารางด้านล่าง แล้วดึงเฉพาะช่วงบรรทัดที่ต้องการใช้งานเท่านั้น

---

## File: `approvals.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `8a14cb01f0d9d539` | **Total Lines:** `123` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L17** | `<head>` | HTML DOM Section L3-L17 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L21 - L21** | `id="bmaSidebarContainer"` | HTML DOM Section L21-L21 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L25 - L25** | `id="bmaTopbarContainer"` | HTML DOM Section L25-L25 |
| `<main>` | `html_dom_section` | **L27 - L114** | `<main>` | HTML DOM Section L27-L114 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L116 - L116** | `id="bmaFooterContainer"` | HTML DOM Section L116-L116 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L121 - L121** | `<script>` | Bootstrap script L121-L121 |

---

## File: `assets/js/components/AppLayout.js`
- **Layer:** Shared UI Component Layer
- **Hash:** `d2c3919dfc716c8c` | **Total Lines:** `804` | **Imports:** `6` | **Exports:** `AppLayout`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `AppLayout` | `class` | **L13 - L804** | `export class AppLayout` | Class Definition (792 lines) |
| `AppLayout.canViewUsersMenu` | `static public method` | **L58 - L65** | `(user) => any` | static public method L58-L65 (8 lines) |
| `AppLayout.initAdminLayout` | `static public async method` | **L67 - L124** | `({ activePage, pageTitle, pageSubtitle = '' }) => Promise<any>` | static public async method L67-L124 (58 lines) |
| `AppLayout.checkAndShowWelcomeToast` | `static public method` | **L126 - L135** | `(currentUser) => any` | static public method L126-L135 (10 lines) |
| `AppLayout.#updateActiveNavState` | `static private method` | **L137 - L173** | `(activePage, pageTitle, pageSubtitle) => any` | static private method L137-L173 (37 lines) |
| `AppLayout.renderMainSkeleton` | `static public method` | **L179 - L217** | `() => any` | static public method L179-L217 (39 lines) |
| `AppLayout.navigateAjaxPage` | `static public async method` | **L225 - L341** | `(targetFile, pushHistory = true) => Promise<any>` | static public async method L225-L341 (117 lines) |
| `AppLayout.#renderSidebar` | `static private method` | **L343 - L450** | `(currentUser, settings, activePage) => any` | static private method L343-L450 (108 lines) |
| `AppLayout.#renderTopbar` | `static private method` | **L452 - L508** | `(currentUser, settings, pageTitle, pageSubtitle) => any` | static private method L452-L508 (57 lines) |
| `AppLayout.#renderMobileBottomNav` | `static private method` | **L510 - L536** | `(currentUser, activePage) => any` | static private method L510-L536 (27 lines) |
| `AppLayout.getMobileShortcutGridHtml` | `static public method` | **L538 - L568** | `(currentUser) => any` | static public method L538-L568 (31 lines) |
| `AppLayout.#renderFooter` | `static private method` | **L570 - L589** | `(settings) => any` | static private method L570-L589 (20 lines) |
| `AppLayout.refreshNotificationBell` | `static public async method` | **L591 - L688** | `(currentUser) => Promise<any>` | static public async method L591-L688 (98 lines) |
| `AppLayout.#bindGlobalDelegatedEvents` | `static private method` | **L690 - L803** | `() => any` | static private method L690-L803 (114 lines) |

---

## File: `assets/js/controllers/ApprovalsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `3a33be265e987154` | **Total Lines:** `279` | **Imports:** `3` | **Exports:** `ApprovalsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ApprovalsController` | `class` | **L10 - L275** | `export class ApprovalsController` | Class Definition (266 lines) |
| `ApprovalsController.constructor` | `public constructor` | **L11 - L17** | `() => any` | public constructor L11-L17 (7 lines) |
| `ApprovalsController.init` | `public async method` | **L19 - L31** | `() => Promise<any>` | public async method L19-L31 (13 lines) |
| `ApprovalsController.loadRequests` | `public async method` | **L33 - L50** | `() => Promise<any>` | public async method L33-L50 (18 lines) |
| `ApprovalsController.#updateBulkSelectionCount` | `private method` | **L52 - L62** | `() => any` | private method L52-L62 (11 lines) |
| `ApprovalsController.#renderGroupedApprovalsTable` | `private method` | **L69 - L133** | `() => any` | - 'group': สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน |
| `ApprovalsController.#buildRequestRowHtml` | `private method` | **L135 - L181** | `(req, indexNo) => any` | private method L135-L181 (47 lines) |
| `ApprovalsController.#bindEvents` | `private method` | **L183 - L240** | `() => any` | private method L183-L240 (58 lines) |
| `ApprovalsController.#processDecision` | `private async method` | **L242 - L274** | `(ids, decision) => Promise<any>` | private async method L242-L274 (33 lines) |

---

## File: `assets/js/controllers/CheckinController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `7f5d74e62c101bdc` | **Total Lines:** `1699` | **Imports:** `5` | **Exports:** `CheckinController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `CheckinController` | `class` | **L12 - L1695** | `export class CheckinController` | Class Definition (1684 lines) |
| `CheckinController.constructor` | `public constructor` | **L13 - L37** | `() => any` | public constructor L13-L37 (25 lines) |
| `CheckinController.init` | `public async method` | **L39 - L80** | `() => Promise<any>` | public async method L39-L80 (42 lines) |
| `CheckinController.#applyDynamicWorkspaceLayout` | `private method` | **L82 - L122** | `() => any` | private method L82-L122 (41 lines) |
| `CheckinController.#updateThemeButtonUI` | `private method` | **L124 - L142** | `() => any` | private method L124-L142 (19 lines) |
| `CheckinController.#checkAndShowWelcomeToast` | `private method` | **L144 - L152** | `() => any` | private method L144-L152 (9 lines) |
| `CheckinController.#startLiveClock24` | `private method` | **L154 - L181** | `() => any` | private method L154-L181 (28 lines) |
| `updateClock` | `arrow_fn` | **L155 - L178** | `() => inferred` | Arrow Function L155-L178 |
| `CheckinController.#isShiftActiveAtCurrentTime` | `private method` | **L183 - L203** | `(shift, nowMin, allowStartMin) => any` | private method L183-L203 (21 lines) |
| `CheckinController.#evaluateTimeWindowAndPopulateShifts` | `private method` | **L205 - L274** | `() => any` | private method L205-L274 (70 lines) |
| `CheckinController.#renderUserAndSettingsInfo` | `private method` | **L276 - L364** | `() => any` | private method L276-L364 (89 lines) |
| `setElText` | `arrow_fn` | **L281 - L284** | `(id, text) => inferred` | Arrow Function L281-L284 |
| `CheckinController.#refreshAllAttendanceData` | `private async method` | **L366 - L383** | `() => Promise<any>` | private async method L366-L383 (18 lines) |
| `CheckinController.#updateStatusCardsAndMainButton` | `private method` | **L385 - L602** | `() => any` | private method L385-L602 (218 lines) |
| `CheckinController.#renderPersonalAttendanceTabs` | `private method` | **L604 - L647** | `() => any` | private method L604-L647 (44 lines) |
| `CheckinController.#buildHistoryRowHtml` | `private method` | **L649 - L668** | `(item, rowNumber) => any` | private method L649-L668 (20 lines) |
| `CheckinController.#renderSpecialRequestsHistoryTable` | `private method` | **L670 - L712** | `() => any` | private method L670-L712 (43 lines) |
| `CheckinController.#checkCameraHardware` | `private async method` | **L714 - L728** | `() => Promise<any>` | private async method L714-L728 (15 lines) |
| `CheckinController.#handleFallbackFileSelected` | `private method` | **L730 - L787** | `(file) => any` | private method L730-L787 (58 lines) |
| `CheckinController.#stopCameraHardwareStream` | `private method` | **L789 - L800** | `() => any` | private method L789-L800 (12 lines) |
| `CheckinController.#stopCameraAndShowStandby` | `private method` | **L802 - L828** | `() => any` | private method L802-L828 (27 lines) |
| `CheckinController.#openCameraOnDemand` | `private async method` | **L830 - L899** | `() => Promise<any>` | private async method L830-L899 (70 lines) |
| `CheckinController.#capturePhotoAndStopStream` | `private method` | **L901 - L933** | `() => any` | private method L901-L933 (33 lines) |
| `CheckinController.#resetPageAfterSave` | `private async method` | **L935 - L943** | `() => Promise<any>` | private async method L935-L943 (9 lines) |
| `CheckinController.#initGpsLocation` | `private async method` | **L951 - L1035** | `() => Promise<any>` | 3. หากยังไม่พบ จะดึง ซอย / ซอยย่อย -> แสดง ["ใกล้เคียง " + ชื่อซอย] |
| `CheckinController.#bindEvents` | `private method` | **L1037 - L1316** | `() => any` | private method L1037-L1316 (280 lines) |
| `setDesktopActiveTab` | `arrow_fn` | **L1221 - L1240** | `(activeName) => inferred` | Arrow Function L1221-L1240 |
| `openMobileDrawer` | `arrow_fn` | **L1251 - L1268** | `() => inferred` | Arrow Function L1251-L1268 |
| `closeMobileDrawer` | `arrow_fn` | **L1270 - L1295** | `(targetTab = null) => inferred` | Arrow Function L1270-L1295 |
| `CheckinController.#handleMainCheckin` | `private async method` | **L1318 - L1631** | `() => Promise<any>` | private async method L1318-L1631 (314 lines) |
| `CheckinController.#handleSubmitSpecialRequest` | `private async method` | **L1633 - L1694** | `(closeModalCallback) => Promise<any>` | private async method L1633-L1694 (62 lines) |

---

## File: `assets/js/controllers/DashboardController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `dc96e00efca0d3c5` | **Total Lines:** `291` | **Imports:** `5` | **Exports:** `DashboardController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `DashboardController` | `class` | **L12 - L282** | `export class DashboardController` | Class Definition (271 lines) |
| `DashboardController.constructor` | `public constructor` | **L13 - L21** | `() => any` | public constructor L13-L21 (9 lines) |
| `DashboardController.init` | `public async method` | **L23 - L48** | `() => Promise<any>` | public async method L23-L48 (26 lines) |
| `DashboardController.#bindEvents` | `private method` | **L50 - L97** | `() => any` | private method L50-L97 (48 lines) |
| `DashboardController.loadDashboardData` | `public async method` | **L99 - L125** | `() => Promise<any>` | public async method L99-L125 (27 lines) |
| `DashboardController.#renderAllVisuals` | `private method` | **L127 - L142** | `() => any` | private method L127-L142 (16 lines) |
| `DashboardController.#renderJewelToneStatCards` | `private method` | **L144 - L213** | `(metrics, colors) => any` | private method L144-L213 (70 lines) |
| `DashboardController.#renderTable` | `private method` | **L221 - L281** | `(colors) => any` | - จัดขนาดคอลัมน์ให้พอดีกับข้อมูล ไม่ให้ชื่อ-นามสกุลล้นหรือตกบรรทัด |

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
- **Hash:** `db093e7066544818` | **Total Lines:** `1467` | **Imports:** `4` | **Exports:** `PersonnelController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `PersonnelController` | `class` | **L11 - L1458** | `export class PersonnelController` | Class Definition (1448 lines) |
| `PersonnelController.constructor` | `public constructor` | **L12 - L23** | `() => any` | public constructor L12-L23 (12 lines) |
| `PersonnelController.init` | `public async method` | **L25 - L46** | `() => Promise<any>` | public async method L25-L46 (22 lines) |
| `PersonnelController.#populateDropdownsFromSettings` | `private method` | **L48 - L77** | `() => any` | private method L48-L77 (30 lines) |
| `PersonnelController.#updatePositionSubDropdowns` | `private method` | **L79 - L97** | `(selectedType, selectedTitle = '', selectedLevel = '') => any` | private method L79-L97 (19 lines) |
| `PersonnelController.#updateAffiliationSubDropdowns` | `private method` | **L99 - L123** | `(selectedBureau, selectedDivision = '', selectedGroup = '') => any` | private method L99-L123 (25 lines) |
| `PersonnelController.loadPersonnelData` | `public async method` | **L125 - L138** | `() => Promise<any>` | public async method L125-L138 (14 lines) |
| `PersonnelController.#renderGroupedTable` | `private method` | **L140 - L195** | `() => any` | private method L140-L195 (56 lines) |
| `PersonnelController.#buildPersonRowHtml` | `private method` | **L197 - L253** | `(person, indexNo) => any` | private method L197-L253 (57 lines) |
| `PersonnelController.#openModal` | `private method` | **L255 - L294** | `(editPerson = null) => any` | private method L255-L294 (40 lines) |
| `PersonnelController.#closeModal` | `private method` | **L296 - L298** | `() => any` | private method L296-L298 (3 lines) |
| `PersonnelController.#bindEvents` | `private method` | **L300 - L556** | `() => any` | private method L300-L556 (257 lines) |
| `validateNationalIdInput` | `arrow_fn` | **L334 - L357** | `() => inferred` | Arrow Function L334-L357 |
| `PersonnelController.#openPersonnelResumeModal` | `private method` | **L562 - L691** | `(person) => any` | private method L562-L691 (130 lines) |
| `PersonnelController.#closePersonnelResumeModal` | `private method` | **L693 - L696** | `() => any` | private method L693-L696 (4 lines) |
| `PersonnelController.#handleSavePersonnel` | `private async method` | **L698 - L735** | `() => Promise<any>` | private async method L698-L735 (38 lines) |
| `PersonnelController.#handleQuickCreateAccount` | `private async method` | **L737 - L798** | `(personId) => Promise<any>` | private async method L737-L798 (62 lines) |
| `PersonnelController.#diceCoefficient` | `private method` | **L800 - L820** | `(str1, str2) => any` | private method L800-L820 (21 lines) |
| `PersonnelController.#findBestFuzzyMatch` | `private method` | **L822 - L838** | `(value, candidates, threshold = 0.5) => any` | private method L822-L838 (17 lines) |
| `PersonnelController.#openBulkImportModal` | `private method` | **L840 - L874** | `(initialFile = null) => any` | private method L840-L874 (35 lines) |
| `PersonnelController.#closeBulkImportModal` | `private method` | **L876 - L884** | `() => any` | private method L876-L884 (9 lines) |
| `PersonnelController.#processBulkImportFile` | `private async method` | **L886 - L960** | `(file) => Promise<any>` | private async method L886-L960 (75 lines) |
| `PersonnelController.#validateRowCascading` | `private method` | **L967 - L1258** | `(row, changedField = null) => any` | private method L967-L1258 (292 lines) |
| `PersonnelController.#revalidateRowCascading` | `private method` | **L1265 - L1271** | `(rIdx, changedField = null) => any` | private method L1265-L1271 (7 lines) |
| `PersonnelController.#renderBulkImportPreview` | `private method` | **L1273 - L1347** | `() => any` | private method L1273-L1347 (75 lines) |
| `renderCell` | `arrow_fn` | **L1296 - L1308** | `(field, cell) => inferred` | Arrow Function L1296-L1308 |
| `PersonnelController.#handleExecuteBulkImport` | `private async method` | **L1349 - L1437** | `() => Promise<any>` | private async method L1349-L1437 (89 lines) |
| `PersonnelController.#downloadMultiSheetTemplate` | `private async method` | **L1442 - L1457** | `() => Promise<any>` | ดาวน์โหลดไฟล์แม่แบบ Excel แบบหลายแผ่นงาน พร้อม Data Validation Dropdowns ด้วย ExcelJS |

---

## File: `assets/js/controllers/ReportsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `c2abaa61e608accf` | **Total Lines:** `1059` | **Imports:** `7` | **Exports:** `ReportsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `ReportsController` | `class` | **L14 - L1050** | `export class ReportsController` | Class Definition (1037 lines) |
| `ReportsController.constructor` | `public constructor` | **L15 - L26** | `() => any` | public constructor L15-L26 (12 lines) |
| `ReportsController.init` | `public async method` | **L28 - L68** | `() => Promise<any>` | public async method L28-L68 (41 lines) |
| `ReportsController.#getStatusColor` | `private method` | **L70 - L76** | `(statusKey) => any` | private method L70-L76 (7 lines) |
| `ReportsController.#renderStatusTagFilterChips` | `private method` | **L78 - L100** | `() => any` | private method L78-L100 (23 lines) |
| `ReportsController.#getFormattedReportDateSubtitle` | `private method` | **L102 - L111** | `() => any` | private method L102-L111 (10 lines) |
| `ReportsController.loadReportData` | `public async method` | **L113 - L159** | `() => Promise<any>` | public async method L113-L159 (47 lines) |
| `ReportsController.#populatePersonnelDropdown` | `private method` | **L161 - L170** | `() => any` | private method L161-L170 (10 lines) |
| `ReportsController.#formatGpsCoordinates` | `private method` | **L172 - L180** | `(lat, lng) => any` | private method L172-L180 (9 lines) |
| `ReportsController.#renderSeparateTablesBySelectedTags` | `private method` | **L182 - L249** | `(forPrintPdf = false) => any` | private method L182-L249 (68 lines) |
| `ReportsController.#renderSingleStatusTableHtml` | `private method` | **L251 - L379** | `(statusMeta, statusColor, tagRecords, daySubtitle, groupHeaderColor, forPrintPdf) => any` | private method L251-L379 (129 lines) |
| `ReportsController.#buildGroupedRowsForTag` | `private method` | **L381 - L433** | `(tagRecords, groupHeaderColor, forPrintPdf) => any` | private method L381-L433 (53 lines) |
| `ReportsController.#buildSingleRowHtml` | `private method` | **L435 - L534** | `(rec, indexNo, forPrintPdf) => any` | private method L435-L534 (100 lines) |
| `ReportsController.#openResumeProfileForSpecificRow` | `private method` | **L543 - L746** | `(rowUid) => any` | private method L543-L746 (204 lines) |
| `setupPhotoBox` | `arrow_fn` | **L611 - L654** | `(boxId, linkId, photo, fallbackMsg, isOut = false) => inferred` | Arrow Function L611-L654 |
| `setupGpsAndMap` | `arrow_fn` | **L693 - L723** | `(coordsId, linkId, iframeId, placeholderId, locNameId, lat, lng, locName, fallbackMsg) => inferred` | Arrow Function L693-L723 |
| `ReportsController.#closeResumeModal` | `private method` | **L748 - L758** | `() => any` | private method L748-L758 (11 lines) |
| `ReportsController.#openModal` | `private method` | **L760 - L792** | `(rec = null) => any` | private method L760-L792 (33 lines) |
| `ReportsController.#closeModal` | `private method` | **L794 - L796** | `() => any` | private method L794-L796 (3 lines) |
| `ReportsController.#bindEvents` | `private method` | **L798 - L1009** | `() => any` | private method L798-L1009 (212 lines) |
| `ReportsController.#handleSaveReportRecord` | `private async method` | **L1011 - L1049** | `() => Promise<any>` | private async method L1011-L1049 (39 lines) |

---

## File: `assets/js/controllers/SettingsController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `ddfd3aaf261e8ae2` | **Total Lines:** `1218` | **Imports:** `4` | **Exports:** `SettingsController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SettingsController` | `class` | **L11 - L1209** | `export class SettingsController` | Class Definition (1199 lines) |
| `SettingsController.constructor` | `public constructor` | **L12 - L17** | `() => any` | public constructor L12-L17 (6 lines) |
| `SettingsController.init` | `public async method` | **L19 - L37** | `() => Promise<any>` | public async method L19-L37 (19 lines) |
| `SettingsController.#renderAllSettings` | `private method` | **L39 - L147** | `() => any` | private method L39-L147 (109 lines) |
| `syncRadiusVisibility` | `arrow_fn` | **L98 - L108** | `() => inferred` | Arrow Function L98-L108 |
| `SettingsController.#updateColorPreviewBadges` | `private method` | **L149 - L165** | `() => any` | private method L149-L165 (17 lines) |
| `SettingsController.#syncCheckinModeUI` | `private method` | **L170 - L201** | `(isSingleClick) => any` | ย่อข้อความป้าย Tag ให้เหลือแค่ "รูปแบบพิเศษ" หรือ "รูปแบบปกติ" เพื่อไม่ให้ล้นจอหรือเบียดข้อความในมือถือ |
| `SettingsController.#updateLogoPreview` | `private method` | **L203 - L211** | `(url) => any` | private method L203-L211 (9 lines) |
| `SettingsController.#buildSortButtonsHtml` | `private method` | **L213 - L226** | `(category, index, totalLength) => any` | private method L213-L226 (14 lines) |
| `SettingsController.#renderPrefixes` | `private method` | **L228 - L248** | `() => any` | private method L228-L248 (21 lines) |
| `SettingsController.#renderRemarks` | `private method` | **L250 - L270** | `() => any` | private method L250-L270 (21 lines) |
| `SettingsController.#renderShifts` | `private method` | **L272 - L320** | `() => any` | private method L272-L320 (49 lines) |
| `SettingsController.#renderPositions` | `private method` | **L322 - L343** | `() => any` | private method L322-L343 (22 lines) |
| `SettingsController.#renderAffiliations` | `private method` | **L345 - L367** | `() => any` | private method L345-L367 (23 lines) |
| `SettingsController.#collectMainAndColorFieldsIntoSettings` | `private method` | **L369 - L411** | `() => any` | private method L369-L411 (43 lines) |
| `SettingsController.#persistSettings` | `private async method` | **L413 - L436** | `(showToastAlert = true) => Promise<any>` | private async method L413-L436 (24 lines) |
| `SettingsController.#openModal` | `private method` | **L438 - L443** | `(title, bodyHtml, onSubmitCallback) => any` | private method L438-L443 (6 lines) |
| `SettingsController.#closeModal` | `private method` | **L445 - L448** | `() => any` | private method L445-L448 (4 lines) |
| `SettingsController.#buildMultiRowInputsHtml` | `private method` | **L450 - L469** | `(fieldLabel, placeholder) => any` | private method L450-L469 (20 lines) |
| `SettingsController.#bindDynamicMultiRowEvents` | `private method` | **L471 - L499** | `(placeholder = 'ระบุข้อมูล...') => any` | private method L471-L499 (29 lines) |
| `SettingsController.#getDynamicMultiRowValues` | `private method` | **L501 - L506** | `() => any` | private method L501-L506 (6 lines) |
| `SettingsController.#bindEvents` | `private method` | **L508 - L740** | `() => any` | private method L508-L740 (233 lines) |
| `SettingsController.#openShiftModal` | `private method` | **L742 - L822** | `(editIndex = null) => any` | private method L742-L822 (81 lines) |
| `checkOvernightAuto` | `arrow_fn` | **L812 - L819** | `() => inferred` | Arrow Function L812-L819 |
| `SettingsController.#openAddPositionStep1Modal` | `private method` | **L824 - L840** | `() => any` | private method L824-L840 (17 lines) |
| `SettingsController.#openAddPositionStep2Modal` | `private method` | **L842 - L885** | `() => any` | private method L842-L885 (44 lines) |
| `SettingsController.#openAddPositionStep3Modal` | `private method` | **L887 - L951** | `() => any` | private method L887-L951 (65 lines) |
| `SettingsController.#openEditSinglePositionModal` | `private method` | **L953 - L976** | `(editIndex) => any` | private method L953-L976 (24 lines) |
| `SettingsController.#openAddAffiliationStep1OrgModal` | `private method` | **L978 - L994** | `() => any` | private method L978-L994 (17 lines) |
| `SettingsController.#openAddAffiliationStep2BureauModal` | `private method` | **L996 - L1034** | `() => any` | private method L996-L1034 (39 lines) |
| `SettingsController.#openAddAffiliationStep3DivisionModal` | `private method` | **L1036 - L1092** | `() => any` | private method L1036-L1092 (57 lines) |
| `SettingsController.#openAddAffiliationStep4GroupModal` | `private method` | **L1094 - L1178** | `() => any` | private method L1094-L1178 (85 lines) |
| `SettingsController.#openEditSingleAffiliationModal` | `private method` | **L1180 - L1208** | `(editIndex) => any` | private method L1180-L1208 (29 lines) |

---

## File: `assets/js/controllers/UsersController.js`
- **Layer:** Frontend Page Controller Layer (OOP)
- **Hash:** `8e605ed3deb48a87` | **Total Lines:** `553` | **Imports:** `5` | **Exports:** `UsersController`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `UsersController` | `class` | **L12 - L544** | `export class UsersController` | Class Definition (533 lines) |
| `UsersController.constructor` | `public constructor` | **L13 - L20** | `() => any` | public constructor L13-L20 (8 lines) |
| `UsersController.init` | `public async method` | **L22 - L54** | `() => Promise<any>` | public async method L22-L54 (33 lines) |
| `UsersController.#toggleManageColumnHeader` | `private method` | **L59 - L67** | `() => any` | ซ่อนหรือแสดงหัวคอลัมน์ "จัดการ" ในตารางตามสิทธิ์ของผู้ใช้งาน (index 5) |
| `UsersController.#populateScopeDropdowns` | `private method` | **L69 - L80** | `() => any` | private method L69-L80 (12 lines) |
| `UsersController.#updateScopeDivisionDropdown` | `private method` | **L82 - L95** | `(selectedBureau, selectedDivision = '') => any` | private method L82-L95 (14 lines) |
| `UsersController.loadUsersAndPersonnel` | `public async method` | **L97 - L122** | `() => Promise<any>` | public async method L97-L122 (26 lines) |
| `UsersController.#renderPersonnelSelectOptions` | `private method` | **L124 - L143** | `(filterText = '', selectedPersonnelId = '') => any` | private method L124-L143 (20 lines) |
| `UsersController.#renderUsersTable` | `private method` | **L145 - L266** | `() => any` | private method L145-L266 (122 lines) |
| `UsersController.#toggleAdminScopeUI` | `private method` | **L268 - L284** | `() => any` | private method L268-L284 (17 lines) |
| `UsersController.#openModal` | `private method` | **L286 - L341** | `(editUser = null) => any` | private method L286-L341 (56 lines) |
| `UsersController.#closeModal` | `private method` | **L343 - L345** | `() => any` | private method L343-L345 (3 lines) |
| `UsersController.#bindEvents` | `private method` | **L347 - L499** | `() => any` | private method L347-L499 (153 lines) |
| `handleTableActionClick` | `async_arrow_fn` | **L436 - L495** | `(e) => inferred` | Arrow Function L436-L495 |
| `UsersController.#handleSaveUserAccount` | `private async method` | **L501 - L543** | `() => Promise<any>` | private async method L501-L543 (43 lines) |

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
- **Hash:** `7dc0d48ec1b6b745` | **Total Lines:** `90` | **Imports:** `0` | **Exports:** `Config`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `Config` | `class` | **L6 - L90** | `export class Config` | คลาสเก็บค่าคงที่ การตั้งค่าเชื่อมต่อ Supabase และค่ามาตรฐานของระบบ V2.7 |

---

## File: `assets/js/core/DatabaseService.js`
- **Layer:** Core Service & Infrastructure Layer
- **Hash:** `45d67f689f30ce35` | **Total Lines:** `76` | **Imports:** `1` | **Exports:** `DatabaseService`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `DatabaseService` | `class` | **L8 - L76** | `export class DatabaseService` | Class Definition (69 lines) |
| `DatabaseService.constructor` | `public constructor` | **L12 - L18** | `() => any` | public constructor L12-L18 (7 lines) |
| `DatabaseService.getInstance` | `static public method` | **L24 - L29** | `() => any` | static public method L24-L29 (6 lines) |
| `DatabaseService.#initClient` | `private method` | **L34 - L48** | `() => any` | เริ่มต้นสร้าง Supabase Client จาก Global Object window.supabase |
| `DatabaseService.checkConnection` | `public async method` | **L64 - L75** | `() => Promise<any>` | public async method L64-L75 (12 lines) |

---

## File: `assets/js/core/UIHelpers.js`
- **Layer:** Core Service & Infrastructure Layer
- **Hash:** `962ee9e12db7e785` | **Total Lines:** `1115` | **Imports:** `1` | **Exports:** `UIHelpers`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `UIHelpers` | `class` | **L8 - L1115** | `export class UIHelpers` | Class Definition (1108 lines) |
| `UIHelpers.getRootBasePath` | `static public method` | **L27 - L36** | `() => any` | static public method L27-L36 (10 lines) |
| `UIHelpers.maskUrlToRoot` | `static public method` | **L38 - L61** | `(explicitPageName = '') => any` | static public method L38-L61 (24 lines) |
| `UIHelpers.initTheme` | `static public method` | **L63 - L80** | `() => any` | static public method L63-L80 (18 lines) |
| `UIHelpers.toggleTheme` | `static public method` | **L82 - L88** | `() => any` | static public method L82-L88 (7 lines) |
| `UIHelpers.showToast` | `static public method` | **L90 - L122** | `(message, type = 'success', durationMs = 2600) => any` | static public method L90-L122 (33 lines) |
| `UIHelpers.formatThaiShortDate` | `static public method` | **L124 - L140** | `(dateStr) => any` | static public method L124-L140 (17 lines) |
| `UIHelpers.formatThaiFullDate` | `static public method` | **L142 - L157** | `(dateStr) => any` | static public method L142-L157 (16 lines) |
| `UIHelpers.formatThaiDate` | `static public method` | **L159 - L161** | `(dateStr) => any` | static public method L159-L161 (3 lines) |
| `UIHelpers.formatTime24` | `static public method` | **L163 - L171** | `(timeStr) => any` | static public method L163-L171 (9 lines) |
| `UIHelpers.timeToMinutes` | `static public method` | **L173 - L179** | `(timeStr) => any` | static public method L173-L179 (7 lines) |
| `UIHelpers.getTodayISO` | `static public method` | **L181 - L185** | `() => any` | static public method L181-L185 (5 lines) |
| `UIHelpers.getCurrentTimeHHMM` | `static public method` | **L187 - L192** | `() => any` | static public method L187-L192 (6 lines) |
| `UIHelpers.capturePortrait3x4FromVideo` | `static public method` | **L194 - L228** | `(videoEl, canvasEl) => any` | static public method L194-L228 (35 lines) |
| `UIHelpers.verifyImageUrl` | `static public method` | **L230 - L288** | `(rawUrl) => any` | static public method L230-L288 (59 lines) |
| `UIHelpers.verifyGoogleDriveLink` | `static public async method` | **L290 - L332** | `(scriptUrl, folderId = '') => Promise<any>` | static public async method L290-L332 (43 lines) |
| `UIHelpers.uploadPhotoToGoogleDrive` | `static public async method` | **L334 - L398** | `(base64DataUrl, fileNamePrefix, settings) => Promise<any>` | static public async method L334-L398 (65 lines) |
| `UIHelpers.showLoading` | `static public method` | **L405 - L467** | `(message = 'กำลังประมวลผลข้อมูล กรุณารอสักครู่...') => any` | static public method L405-L467 (63 lines) |
| `UIHelpers.#updateProgressDOM` | `static private method` | **L469 - L476** | `(percent) => any` | static private method L469-L476 (8 lines) |
| `UIHelpers.hideLoading` | `static public method` | **L478 - L503** | `() => any` | static public method L478-L503 (26 lines) |
| `UIHelpers.renderTableSkeleton` | `static public method` | **L505 - L515** | `(rows = 5, cols = 6) => any` | static public method L505-L515 (11 lines) |
| `UIHelpers.alert` | `static public async method` | **L517 - L532** | `(title, text = '', icon = 'success') => Promise<any>` | static public async method L517-L532 (16 lines) |
| `UIHelpers.confirm` | `static public async method` | **L534 - L584** | `(title, text = '', confirmText = 'ยืนยัน', icon = 'warning', options = {}) => Promise<any>` | static public async method L534-L584 (51 lines) |
| `UIHelpers.validateThaiNationalId` | `static public method` | **L586 - L605** | `(id, strictCheckDigit = false) => any` | static public method L586-L605 (20 lines) |
| `UIHelpers.getLast6DigitsFromNationalId` | `static public method` | **L607 - L611** | `(nationalId) => any` | static public method L607-L611 (5 lines) |
| `UIHelpers.exportToExcelUTF8` | `static public method` | **L613 - L638** | `(dataRows, fileName = 'export_data', sheetName = 'Sheet1') => any` | static public method L613-L638 (26 lines) |
| `UIHelpers.exportMultiSheetExcel` | `static public method` | **L645 - L665** | `(sheets, fileName = 'export_data') => any` | static public method L645-L665 (21 lines) |
| `UIHelpers.exportTemplateWithValidationsExcel` | `static public async method` | **L674 - L937** | `({ settings, templateRows, fileName = 'Template_นำเข้าบุคลากร_กทม' }) => Promise<any>` | static public async method L674-L937 (264 lines) |
| `UIHelpers.parseExcelFileUTF8` | `static public method` | **L939 - L961** | `(file) => any` | static public method L939-L961 (23 lines) |
| `UIHelpers.printReportInNewTab` | `static public method` | **L963 - L1114** | `({ title, subtitle, tableHtml, headerColor = '#007B3E' }) => any` | static public method L963-L1114 (152 lines) |

---

## File: `assets/js/models/AttendanceModel.js`
- **Layer:** Data Model & Supabase Repository Layer
- **Hash:** `e4743e4b18679e20` | **Total Lines:** `1618` | **Imports:** `5` | **Exports:** `AttendanceModel`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `AttendanceModel` | `class` | **L12 - L1618** | `export class AttendanceModel` | Class Definition (1607 lines) |
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
| `AttendanceModel.evaluateOfficialStatus` | `static public method` | **L604 - L705** | `(log, settings) => any` | static public method L604-L705 (102 lines) |
| `AttendanceModel.getActiveRegularRecordForCheckout` | `static public async method` | **L734 - L765** | `(personnelId, userId, settings) => Promise<any>` | static public async method L734-L765 (32 lines) |
| `AttendanceModel.getPersonalAttendanceHistory` | `static public async method` | **L767 - L803** | `(personnelId, userId, limit = 35) => Promise<any>` | static public async method L767-L803 (37 lines) |
| `AttendanceModel.getPersonalSpecialRequests` | `static public async method` | **L805 - L831** | `(personnelId, userId) => Promise<any>` | static public async method L805-L831 (27 lines) |
| `AttendanceModel.deletePendingSpecialRequestByUser` | `static public async method` | **L833 - L867** | `(logId, personnelId, userId) => Promise<any>` | static public async method L833-L867 (35 lines) |
| `AttendanceModel.submitCheckinOrCheckout` | `static public async method` | **L869 - L1188** | `(payload) => Promise<any>` | static public async method L869-L1188 (320 lines) |
| `AttendanceModel.submitSpecialRequest` | `static public async method` | **L1190 - L1269** | `(payload) => Promise<any>` | static public async method L1190-L1269 (80 lines) |
| `AttendanceModel.getSpecialRequests` | `static public async method` | **L1271 - L1310** | `(currentUser, statusFilter = 'pending') => Promise<any>` | static public async method L1271-L1310 (40 lines) |
| `AttendanceModel.processSpecialRequestsBulk` | `static public async method` | **L1312 - L1357** | `(logIds, decision, approverUserId) => Promise<any>` | static public async method L1312-L1357 (46 lines) |
| `AttendanceModel.getDatesBetween` | `static public method` | **L1359 - L1376** | `(startDate, endDate) => any` | static public method L1359-L1376 (18 lines) |
| `AttendanceModel.getReportRecordsByDateRange` | `static public async method` | **L1378 - L1437** | `(startDate, endDate, currentUser) => Promise<any>` | static public async method L1378-L1437 (60 lines) |
| `AttendanceModel.#formatReportRow` | `static private method` | **L1439 - L1484** | `(person, log, workDate, evalStatus) => any` | static private method L1439-L1484 (46 lines) |
| `AttendanceModel.getDailyReportRecords` | `static public async method` | **L1486 - L1488** | `(workDate, currentUser) => Promise<any>` | static public async method L1486-L1488 (3 lines) |
| `AttendanceModel.saveAdminAttendanceRecord` | `static public async method` | **L1490 - L1539** | `(payload) => Promise<any>` | static public async method L1490-L1539 (50 lines) |
| `AttendanceModel.deleteAttendanceRecord` | `static public async method` | **L1541 - L1552** | `(logId) => Promise<any>` | static public async method L1541-L1552 (12 lines) |
| `AttendanceModel.calculateDashboardMetrics` | `static public method` | **L1554 - L1617** | `(dailyRecords) => any` | static public method L1554-L1617 (64 lines) |

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
- **Hash:** `3de0abcc70a000d4` | **Total Lines:** `334` | **Imports:** `3` | **Exports:** `SettingsModel`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `SettingsModel` | `class` | **L10 - L334** | `export class SettingsModel` | Class Definition (325 lines) |
| `SettingsModel.formatShiftDisplayText` | `static public method` | **L17 - L37** | `(shift) => any` | static public method L17-L37 (21 lines) |
| `SettingsModel.getSettings` | `static public async method` | **L39 - L137** | `(forceRefresh = false) => Promise<any>` | static public async method L39-L137 (99 lines) |
| `SettingsModel.updateSettings` | `static public async method` | **L139 - L249** | `(payload) => Promise<any>` | static public async method L139-L249 (111 lines) |
| `SettingsModel.moveItemInArray` | `static public method` | **L251 - L260** | `(arr, fromIndex, direction) => any` | static public method L251-L260 (10 lines) |
| `SettingsModel.fileToDataUrl` | `static public method` | **L262 - L269** | `(file) => any` | static public method L262-L269 (8 lines) |
| `SettingsModel.getUniquePositionTypes` | `static public method` | **L271 - L274** | `(settings) => any` | static public method L271-L274 (4 lines) |
| `SettingsModel.getUniquePositionTitles` | `static public method` | **L276 - L282** | `(settings, filterType = '') => any` | static public method L276-L282 (7 lines) |
| `SettingsModel.getUniquePositionLevels` | `static public method` | **L284 - L293** | `(settings, filterType = '', filterTitle = '') => any` | static public method L284-L293 (10 lines) |
| `SettingsModel.getUniqueOrganizations` | `static public method` | **L295 - L299** | `(settings) => any` | static public method L295-L299 (5 lines) |
| `SettingsModel.getUniqueBureaus` | `static public method` | **L301 - L308** | `(settings, filterOrg = '') => any` | static public method L301-L308 (8 lines) |
| `SettingsModel.getUniqueDivisions` | `static public method` | **L310 - L319** | `(settings, filterBureau = '', filterOrg = '') => any` | static public method L310-L319 (10 lines) |
| `SettingsModel.getUniqueGroups` | `static public method` | **L321 - L333** | `(settings, filterBureau = '', filterDivision = '', filterOrg = '') => any` | static public method L321-L333 (13 lines) |

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
- **Hash:** `ef8fb24a9f835e16` | **Total Lines:** `683` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L72** | `<head>` | HTML DOM Section L3-L72 |
| `<main>` | `html_dom_section` | **L138 - L509** | `<main>` | HTML DOM Section L138-L509 |
| `<div#checkinWorkspaceWrapper>` | `html_dom_section` | **L141 - L367** | `id="checkinWorkspaceWrapper"` | HTML DOM Section L141-L367 |
| `<div#cameraSectionCard>` | `html_dom_section` | **L194 - L261** | `id="cameraSectionCard"` | HTML DOM Section L194-L261 |
| `<div#cameraStandbyOverlay>` | `html_dom_section` | **L222 - L234** | `id="cameraStandbyOverlay"` | HTML DOM Section L222-L234 |
| `<div#rightColumnWrapper>` | `html_dom_section` | **L264 - L364** | `id="rightColumnWrapper"` | HTML DOM Section L264-L364 |
| `<div#gpsSectionCard>` | `html_dom_section` | **L267 - L310** | `id="gpsSectionCard"` | HTML DOM Section L267-L310 |
| `<div#googleMapEmbedWrapper>` | `html_dom_section` | **L291 - L297** | `id="googleMapEmbedWrapper"` | HTML DOM Section L291-L297 |
| `<div#checkinActionCard>` | `html_dom_section` | **L313 - L362** | `id="checkinActionCard"` | HTML DOM Section L313-L362 |
| `<div#shiftSelectorContainer>` | `html_dom_section` | **L323 - L328** | `id="shiftSelectorContainer"` | HTML DOM Section L323-L328 |
| `<div#mainCustomTimeContainer>` | `html_dom_section` | **L330 - L339** | `id="mainCustomTimeContainer"` | HTML DOM Section L330-L339 |
| `<div#desktopPanesContainer>` | `html_dom_section` | **L370 - L507** | `id="desktopPanesContainer"` | HTML DOM Section L370-L507 |
| `<div#desktopHistoryWrapper>` | `html_dom_section` | **L373 - L462** | `id="desktopHistoryWrapper"` | HTML DOM Section L373-L462 |
| `<div#todayHistoryTabPanel>` | `html_dom_section` | **L399 - L416** | `id="todayHistoryTabPanel"` | HTML DOM Section L399-L416 |
| `<div#pastHistoryTabPanel>` | `html_dom_section` | **L419 - L459** | `id="pastHistoryTabPanel"` | HTML DOM Section L419-L459 |
| `<div#desktopSpecialWrapper>` | `html_dom_section` | **L465 - L505** | `id="desktopSpecialWrapper"` | HTML DOM Section L465-L505 |
| `<div#mobileDrawerPanel>` | `html_dom_section` | **L517 - L607** | `id="mobileDrawerPanel"` | HTML DOM Section L517-L607 |
| `<div#spCustomTimeContainer>` | `html_dom_section` | **L640 - L649** | `id="spCustomTimeContainer"` | HTML DOM Section L640-L649 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L680 - L680** | `<script>` | Bootstrap script L680-L680 |

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
- **Hash:** `465dd9229d368ebd` | **Total Lines:** `669` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L58** | `<head>` | HTML DOM Section L3-L58 |
| `<main>` | `html_dom_section` | **L130 - L607** | `<main>` | HTML DOM Section L130-L607 |

---

## File: `docs/manual/manual-admin.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `ee285637a7c64dd5` | **Total Lines:** `1128` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L57** | `<head>` | HTML DOM Section L3-L57 |
| `<div#mobileTocPanel>` | `html_dom_section` | **L96 - L107** | `id="mobileTocPanel"` | HTML DOM Section L96-L107 |
| `<main>` | `html_dom_section` | **L177 - L904** | `<main>` | HTML DOM Section L177-L904 |
| `<div#mockupModal>` | `html_dom_section` | **L913 - L939** | `id="mockupModal"` | HTML DOM Section L913-L939 |
| `<div#mockupModalPanel>` | `html_dom_section` | **L915 - L938** | `id="mockupModalPanel"` | HTML DOM Section L915-L938 |

---

## File: `docs/manual/manual-superadmin.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `295c42df02537928` | **Total Lines:** `1192` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L57** | `<head>` | HTML DOM Section L3-L57 |
| `<div#mobileTocPanel>` | `html_dom_section` | **L96 - L107** | `id="mobileTocPanel"` | HTML DOM Section L96-L107 |
| `<main>` | `html_dom_section` | **L170 - L940** | `<main>` | HTML DOM Section L170-L940 |
| `<div#mockupModal>` | `html_dom_section` | **L949 - L975** | `id="mockupModal"` | HTML DOM Section L949-L975 |
| `<div#mockupModalPanel>` | `html_dom_section` | **L951 - L974** | `id="mockupModalPanel"` | HTML DOM Section L951-L974 |

---

## File: `docs/manual/manual-user.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `c5e7fae3cfe64fb4` | **Total Lines:** `1310` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L57** | `<head>` | HTML DOM Section L3-L57 |
| `<div#mobileTocPanel>` | `html_dom_section` | **L96 - L107** | `id="mobileTocPanel"` | HTML DOM Section L96-L107 |
| `<main>` | `html_dom_section` | **L170 - L1070** | `<main>` | HTML DOM Section L170-L1070 |
| `<div#mockupModal>` | `html_dom_section` | **L1079 - L1105** | `id="mockupModal"` | HTML DOM Section L1079-L1105 |
| `<div#mockupModalPanel>` | `html_dom_section` | **L1081 - L1104** | `id="mockupModalPanel"` | HTML DOM Section L1081-L1104 |

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
- **Hash:** `a935e6299bbdad6d` | **Total Lines:** `551` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L19** | `<head>` | HTML DOM Section L3-L19 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L23 - L23** | `id="bmaSidebarContainer"` | HTML DOM Section L23-L23 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L27 - L27** | `id="bmaTopbarContainer"` | HTML DOM Section L27-L27 |
| `<main>` | `html_dom_section` | **L29 - L127** | `<main>` | HTML DOM Section L29-L127 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L129 - L129** | `id="bmaFooterContainer"` | HTML DOM Section L129-L129 |
| `<div#modalPersonnelForm>` | `html_dom_section` | **L135 - L246** | `id="modalPersonnelForm"` | HTML DOM Section L135-L246 |
| `<div#bulkImportPreviewContainer>` | `html_dom_section` | **L462 - L503** | `id="bulkImportPreviewContainer"` | HTML DOM Section L462-L503 |
| `<div#bulkImportProgressContainer>` | `html_dom_section` | **L523 - L531** | `id="bulkImportProgressContainer"` | HTML DOM Section L523-L531 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L549 - L549** | `<script>` | Bootstrap script L549-L549 |

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

## File: `pipeline/PIPE-20261028-block-normal-hours-checkin/interactive_plan.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `225dbb5d784dcfbc` | **Total Lines:** `75` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L17** | `<head>` | HTML DOM Section L3-L17 |

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
- **Hash:** `d5004d93c2cf0448` | **Total Lines:** `51` | **Imports:** `0` | **Exports:** `None`

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

## File: `reports.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `1e8b2c012c6750c4` | **Total Lines:** `405` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L18** | `<head>` | HTML DOM Section L3-L18 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L22 - L22** | `id="bmaSidebarContainer"` | HTML DOM Section L22-L22 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L26 - L26** | `id="bmaTopbarContainer"` | HTML DOM Section L26-L26 |
| `<main>` | `html_dom_section` | **L28 - L151** | `<main>` | HTML DOM Section L28-L151 |
| `<div#reportMobileShortcutContainer>` | `html_dom_section` | **L30 - L30** | `id="reportMobileShortcutContainer"` | HTML DOM Section L30-L30 |
| `<div#statusTagsFilterContainer>` | `html_dom_section` | **L142 - L142** | `id="statusTagsFilterContainer"` | HTML DOM Section L142-L142 |
| `<div#reportTablesMasterContainer>` | `html_dom_section` | **L149 - L149** | `id="reportTablesMasterContainer"` | HTML DOM Section L149-L149 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L153 - L153** | `id="bmaFooterContainer"` | HTML DOM Section L153-L153 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L403 - L403** | `<script>` | Bootstrap script L403-L403 |

---

## File: `settings.html`
- **Layer:** Frontend HTML View & Entry Point
- **Hash:** `316c92ec23c8af3e` | **Total Lines:** `634` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L17** | `<head>` | HTML DOM Section L3-L17 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L21 - L21** | `id="bmaSidebarContainer"` | HTML DOM Section L21-L21 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L25 - L25** | `id="bmaTopbarContainer"` | HTML DOM Section L25-L25 |
| `<main>` | `html_dom_section` | **L27 - L548** | `<main>` | HTML DOM Section L27-L548 |
| `<div#prefixListContainer>` | `html_dom_section` | **L432 - L432** | `id="prefixListContainer"` | HTML DOM Section L432-L432 |
| `<div#remarkListContainer>` | `html_dom_section` | **L449 - L449** | `id="remarkListContainer"` | HTML DOM Section L449-L449 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L550 - L550** | `id="bmaFooterContainer"` | HTML DOM Section L550-L550 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L577 - L577** | `<script>` | Bootstrap script L577-L577 |

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
- **Hash:** `ca7bf3c023f74372` | **Total Lines:** `293` | **Imports:** `0` | **Exports:** `None`

| ชื่อฟังก์ชัน / เมธอด / คอมโพเนนต์ (Symbol) | ชนิด (Kind) | ช่วงบรรทัด (Line Range) | พารามิเตอร์และค่าส่งกลับ (Signature) | หน้าที่และการทำงานย่อ (Summary) |
| :--- | :--- | :--- | :--- | :--- |
| `<head>` | `html_dom_section` | **L3 - L18** | `<head>` | HTML DOM Section L3-L18 |
| `<div#bmaSidebarContainer>` | `html_dom_section` | **L22 - L22** | `id="bmaSidebarContainer"` | HTML DOM Section L22-L22 |
| `<div#bmaTopbarContainer>` | `html_dom_section` | **L26 - L26** | `id="bmaTopbarContainer"` | HTML DOM Section L26-L26 |
| `<main>` | `html_dom_section` | **L28 - L156** | `<main>` | HTML DOM Section L28-L156 |
| `<div#bmaFooterContainer>` | `html_dom_section` | **L158 - L158** | `id="bmaFooterContainer"` | HTML DOM Section L158-L158 |
| `<div#modalUserAccountForm>` | `html_dom_section` | **L164 - L289** | `id="modalUserAccountForm"` | HTML DOM Section L164-L289 |
| `<script type="module"> (Page Bootstrap)` | `html_module_script` | **L291 - L291** | `<script>` | Bootstrap script L291-L291 |

---

