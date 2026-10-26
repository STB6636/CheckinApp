# สารบัญกระบวนการทำงานของเว็บแอปพลิเคชัน (Web App End-to-End Process Flow Map)

- **โปรเจกต์ (Project):** ระบบลงเวลาปฏิบัติราชการออนไลน์ กรุงเทพมหานคร (BMA Check-in App V2.1–V2.7 — OOP Architecture)
- **ซิงค์ร่วมกับดัชนี (Synced With):** `.ai_map/01_FILE_FUNCTION_INDEX.md` และ `.ai_map/CODE_INDEX.json`
- **กฎการใช้งานสำหรับ AI (`agent_09_code_mapper` & Subagents):** ใช้แผนผังนี้เพื่อระบุ `Flow ID` และสายการเรียกใช้งานข้ามไฟล์ (Call Chain) จากนั้นดึงเฉพาะช่วงบรรทัด `[Lines L_start-L_end]` ที่ต้องการอ่านหรือแก้ไขเท่านั้น

---

## 1. กระบวนการ: ระบบยืนยันตัวตน การเข้าสู่ระบบ 2 โหมด และการจัดการ Session 7 วัน (User Authentication, Role Redirect & Session Management Flow)
- **Flow ID:** `FLOW_AUTH_01`
- **ลำดับการเรียกใช้งานข้ามไฟล์ (Call Chain & Line Pointers):**
  1. `[Frontend HTML View]` `index.html` -> `<form#loginForm>` **[Lines 100-188]** & `<script type="module"> (Page Bootstrap)` **[Lines 284-284]** : หน้าฟอร์มล็อกอินและปุ่มเลือกโหมดเข้าใช้งาน (`checkin` / `manage`)
  2. `[Frontend Controller]` `assets/js/controllers/LoginController.js` -> `LoginController.init()` **[Lines 17-33]** : เริ่มต้นธีม ซ่อนนามสกุล `.html` ตรวจสอบ Session เดิม โหลดตราองค์กร และผูก Event
  3. `[Frontend Controller]` `assets/js/controllers/LoginController.js` -> `LoginController.#loadOrganizationBranding()` **[Lines 35-69]** : ดึงชื่อหน่วยงานและโลโก้จาก `SettingsModel.getSettings()` มาแสดงบนหน้าล็อกอิน
  4. `[Frontend Controller]` `assets/js/controllers/LoginController.js` -> `LoginController.#bindEvents()` **[Lines 83-188]** & `LoginController.#handleLogin(mode)` **[Lines 190-212]** : รับค่า Username/Password, บันทึกการจดจำชื่อผู้ใช้ (`#persistRememberedUser()` **[Lines 236-251]**) และเรียก `AuthService.login()`
  5. `[Core Auth Service]` `assets/js/core/AuthService.js` -> `AuthService.login(username, password, loginMode)` **[Lines 146-212]** : คิวรีตาราง `user_accounts` พร้อม Join `personnel`, ตรวจสอบสถานะบัญชี/คำขอรีเซ็ตรหัสผ่าน, บันทึก Session ลง `localStorage` ผ่าน `AuthService.setCurrentUser()` **[Lines 51-66]**
  6. `[Core Auth Service]` `assets/js/core/AuthService.js` -> `AuthService.getRedirectUrlForSession(sessionUser)` **[Lines 126-144]** : คำนวณหน้าปลายทางตามสิทธิ์ (`SuperAdmin`/`Admin` ในโหมด `manage` -> `dashboard.html`, โหมด `checkin` หรือ `User` -> `checkin.html`)
  7. `[Core Auth Service]` `assets/js/core/AuthService.js` -> `AuthService.requireAuth(allowedRoles)` **[Lines 308-330]** & `AuthService.verifySessionWithDatabase()` **[Lines 73-119]** : ตรวจสอบสิทธิ์ทุกครั้งที่เปิดหน้าเพจและต่ออายุ Session 7 วัน (`AuthService.getCurrentUser()` **[Lines 13-49]**)
  8. `[Database Schema]` `sql/supabase_schema.sql` -> `TABLE public.user_accounts` **[Lines 73-90]** & `TABLE public.personnel` **[Lines 54-70]** : โครงสร้างตารางบัญชีผู้ใช้และบุคลากรบน Supabase

---

## 2. กระบวนการ: การเปลี่ยนรหัสผ่านด้วยตนเอง และการแจ้งลืมรหัสผ่านด้วยเลขบัตรประชาชน 13 หลัก (Self Password Change & National ID Password Reset Request Flow)
- **Flow ID:** `FLOW_AUTH_02`
- **ลำดับการเรียกใช้งานข้ามไฟล์ (Call Chain & Line Pointers):**
  1. `[Frontend Controller]` `assets/js/controllers/LoginController.js` -> `LoginController.#bindEvents()` **[Lines 83-188]** (`openChangeModal` **[Lines 124-133]**, `validatePasswordMatch` **[Lines 140-162]**, `openForgotModal` **[Lines 173-177]**) : เปิด Modal เปลี่ยนรหัสผ่าน/ลืมรหัสผ่าน และตรวจสอบการตรงกันของรหัสผ่านใหม่แบบ Real-time
  2. `[Frontend Controller]` `assets/js/controllers/LoginController.js` -> `LoginController.#handleChangePasswordSubmit(closeModalCallback)` **[Lines 253-277]** : ส่งคำขอเปลี่ยนรหัสผ่านไปยัง `AuthService.changePassword()`
  3. `[Core Auth Service]` `assets/js/core/AuthService.js` -> `AuthService.changePassword(username, oldPassword, newPassword, confirmPassword)` **[Lines 214-263]** : ตรวจสอบรหัสผ่านเดิมและอัปเดต `password_hash` ในตาราง `user_accounts`
  4. `[Frontend Controller]` `assets/js/controllers/LoginController.js` -> `LoginController.#handleForgotPasswordSubmit(closeModalCallback)` **[Lines 279-298]** : รับเลขบัตรประชาชน 13 หลักและส่งคำขอแจ้งลืมรหัสผ่าน
  5. `[Core Auth Service]` `assets/js/core/AuthService.js` -> `AuthService.requestPasswordResetByNationalId(nationalId)` **[Lines 265-306]** : ตรวจสอบเลขบัตรประชาชนและตั้งค่า `reset_requested = true`, `reset_requested_at` ในตาราง `user_accounts` เพื่อแจ้งเตือนไปยังผู้ดูแลระบบ

---

## 3. กระบวนการ: โครงสร้างหน้าจอผู้ดูแลระบบ การสลับหน้าแบบ AJAX SPA การซ่อน `.html` การสลับธีม และกระดิ่งแจ้งเตือน (Admin Layout Shell, AJAX SPA Navigation, URL Masking, Theme & Notification Bell Flow)
- **Flow ID:** `FLOW_LAYOUT_01`
- **ลำดับการเรียกใช้งานข้ามไฟล์ (Call Chain & Line Pointers):**
  1. `[Shared UI Component]` `assets/js/components/AppLayout.js` -> `AppLayout.initAdminLayout({ activePage, pageTitle, pageSubtitle })` **[Lines 67-124]** : สร้างโครงสร้าง Sidebar (`#renderSidebar()` **[Lines 343-443]**), Topbar (`#renderTopbar()` **[Lines 445-501]**), Mobile Bottom Nav (`#renderMobileBottomNav()` **[Lines 503-529]**) และ Footer (`#renderFooter()` **[Lines 563-582]**)
  2. `[Shared UI Component]` `assets/js/components/AppLayout.js` -> `AppLayout.navigateAjaxPage(targetFile, pushHistory)` **[Lines 225-341]** & `AppLayout.#bindGlobalDelegatedEvents()` **[Lines 683-790]** : โหลดหน้าผู้ดูแลระบบแบบ AJAX SPA พร้อมแสดง Skeleton (`AppLayout.renderMainSkeleton()` **[Lines 179-217]**) โดยไม่ต้องรีโหลดทั้งหน้า
  3. `[Core UI Utility]` `assets/js/core/UIHelpers.js` -> `UIHelpers.maskUrlToRoot(explicitPageName)` **[Lines 38-61]** & `UIHelpers.initTheme()` **[Lines 63-80]** & `UIHelpers.toggleTheme()` **[Lines 82-88]** : ซ่อนชื่อไฟล์ `.html` บน Address Bar และจัดการโหมดสี Light / Eye-Care Dark Mode (`#111816`)
  4. `[Shared UI Component]` `assets/js/components/AppLayout.js` -> `AppLayout.refreshNotificationBell(currentUser)` **[Lines 584-681]** : ดึงรายการคำขอลงเวลาพิเศษที่รออนุมัติ (`AttendanceModel.getSpecialRequests()`) และคำขอรีเซ็ตรหัสผ่าน (`UserModel.getPendingPasswordResetRequests()`) มาแสดงที่กระดิ่งแจ้งเตือนบน Topbar

---

## 4. กระบวนการ: การลงเวลามาและกลับปฏิบัติราชการปกติ (Regular Check-in & Check-out, 1-Click / 2-Click Mode & Official Status Evaluation Flow)
- **Flow ID:** `FLOW_CHECKIN_01`
- **ลำดับการเรียกใช้งานข้ามไฟล์ (Call Chain & Line Pointers):**
  1. `[Frontend HTML View]` `checkin.html` -> `<main>` **[Lines 80-422]** (`<div#cameraSectionCard>` **[Lines 146-198]**, `<div#gpsSectionCard>` **[Lines 204-246]**, `<div#checkinActionCard>` **[Lines 249-294]**) & `<script type="module">` **[Lines 492-492]** : โครงสร้างหน้าลงเวลาปฏิบัติราชการ
  2. `[Frontend Controller]` `assets/js/controllers/CheckinController.js` -> `CheckinController.init()` **[Lines 39-75]** & `CheckinController.#applyDynamicWorkspaceLayout()` **[Lines 77-117]** : โหลดการตั้งค่า ปรับเลย์เอาต์ตามการเปิด/ปิดกล้องและ GPS และดึงข้อมูลการลงเวลาปัจจุบัน (`#refreshAllAttendanceData()` **[Lines 310-327]**)
  3. `[Frontend Controller]` `assets/js/controllers/CheckinController.js` -> `CheckinController.#evaluateTimeWindowAndPopulateShifts()` **[Lines 192-256]** & `CheckinController.#updateStatusCardsAndMainButton()` **[Lines 329-513]** : ประเมินช่วงเวลากะทำงานปัจจุบันและปรับสถานะปุ่มกดลงเวลา (รองรับทั้งโหมดปกติ 2 คลิก และโหมดพิเศษกดครั้งเดียว `single_click_checkout`)
  4. `[Frontend Controller]` `assets/js/controllers/CheckinController.js` -> `CheckinController.#handleMainCheckin()` **[Lines 987-1111]** : ตรวจสอบความพร้อมของรูปถ่ายและพิกัด GPS, อัปโหลดรูปถ่าย (ถ้าเปิดใช้), และส่งข้อมูลไปยัง `AttendanceModel.submitCheckinOrCheckout()`
  5. `[Data Model Layer]` `assets/js/models/AttendanceModel.js` -> `AttendanceModel.submitCheckinOrCheckout(payload)` **[Lines 845-1114]** : บันทึกเวลาเข้า/ออกลงตาราง `attendance_logs` (รองรับทั้งการ Insert ขาเข้า, Update ขาออก และโหมด `single_click_checkout` ที่บันทึกทั้งเวลาเข้าและออกพร้อมกัน)
  6. `[Data Model Layer]` `assets/js/models/AttendanceModel.js` -> `AttendanceModel.evaluateOfficialStatus(log, settings)` **[Lines 580-681]** : คำนวณสถานะการปฏิบัติราชการ (`ontime`, `late`, `early_leave`, `absent`, `pending_approval`) เทียบกับเวลากะและเวลาผ่อนผัน (`grace_minutes`)
  7. `[Frontend Controller]` `assets/js/controllers/CheckinController.js` -> `CheckinController.#renderPersonalAttendanceTabs()` **[Lines 515-558]** & `CheckinController.#buildHistoryRowHtml()` **[Lines 560-579]** : แสดงประวัติการลงเวลาวันนี้และย้อนหลังของผู้ใช้งาน
  8. `[Database Schema]` `sql/supabase_schema.sql` -> `TABLE public.attendance_logs` **[Lines 93-118]** & `sql/alter_v2_3_1_schema.sql` **[Lines 17-18]** : ตารางจัดเก็บประวัติการลงเวลาปฏิบัติราชการ

---

## 5. กระบวนการ: การค้นหาและจำแนกชื่อสถานที่จากพิกัด GPS อัตโนมัติ 3 ระดับ (Multi-Tier Reverse Geocoding & Overpass POI Resolution Flow)
- **Flow ID:** `FLOW_GPS_01`
- **ลำดับการเรียกใช้งานข้ามไฟล์ (Call Chain & Line Pointers):**
  1. `[Frontend Controller]` `assets/js/controllers/CheckinController.js` -> `CheckinController.#initGpsLocation()` **[Lines 761-845]** : อ่านพิกัด `navigator.geolocation.getCurrentPosition`, เรียก `AttendanceModel.resolveLocationWithZoomMeta(lat, lng)` และอัปเดตแผนที่ Google Maps Embed ตามระดับซูม (`z=19` หรือ `z=20`)
  2. `[Data Model Layer]` `assets/js/models/AttendanceModel.js` -> `AttendanceModel.resolveLocationWithZoomMeta(lat, lng)` **[Lines 340-567]** : ค้นหาชื่อสถานที่แบบขนานจาก Overpass API (`#queryOverpassFast()` **[Lines 312-328]**) และ Nominatim (`#fetchWithFastTimeout()` **[Lines 295-310]**) พร้อมระบบแคช `#locationCache`
  3. `[Data Model Layer]` `assets/js/models/AttendanceModel.js` -> `AttendanceModel.#classifyTargetPlace(tags, name)` **[Lines 87-168]** & `AttendanceModel.#extractValidPlaceFromNominatim(nomData)` **[Lines 175-215]** : คัดแยกสถานที่เป้าหมายตามลำดับชั้น (ระยะ `z=19` ภายใน 65 เมตร -> `"ใกล้เคียง ..."` / ระยะ `z=20` เกิน 65 เมตรถึง 160 เมตร -> `"บริเวณ ..."`)
  4. `[Data Model Layer]` `assets/js/models/AttendanceModel.js` -> `AttendanceModel.#extractCleanSoiOrSubSoi(lat, lng, nominatimList, overpassElements)` **[Lines 225-293]** : กรณีไม่พบอาคาร/สถานที่สำคัญ จะดึงชื่อซอยหรือซอยย่อยมาแสดงในรูปแบบ `"ใกล้เคียง <ชื่อซอย>"`
  5. `[Data Model Layer]` `assets/js/models/AttendanceModel.js` -> `AttendanceModel.#isForbiddenLocationTerm(rawName, tags)` **[Lines 44-74]** : บล็อกคำต้องห้าม (`ถนน`, `แขวง`, `เขต`, `หมู่บ้าน`, `ตำบล`, `อำเภอ`, `จังหวัด`) ไม่ให้นำมาใช้เป็นชื่อสถานที่โดยเด็ดขาด

---

## 6. กระบวนการ: การถ่ายภาพลงเวลาอัตราส่วน 3:4 และการอัปโหลดเข้าสู่ Google Drive (On-Demand Camera Capture & Google Drive Direct URL Upload Flow)
- **Flow ID:** `FLOW_PHOTO_01`
- **ลำดับการเรียกใช้งานข้ามไฟล์ (Call Chain & Line Pointers):**
  1. `[Frontend Controller]` `assets/js/controllers/CheckinController.js` -> `CheckinController.#openCameraOnDemand()` **[Lines 663-711]** & `CheckinController.#capturePhotoAndStopStream()` **[Lines 713-743]** : เปิดกล้องเมื่อผู้ใช้กดปุ่ม ถ่ายภาพ และปิด Stream ทันทีหลังถ่ายเสร็จเพื่อประหยัดพลังงาน
  2. `[Core UI Utility]` `assets/js/core/UIHelpers.js` -> `UIHelpers.capturePortrait3x4FromVideo(videoEl, canvasEl)` **[Lines 194-224]** : ครอปและบีบอัดภาพจากวิดีโอเป็นอัตราส่วนแนวตั้ง 3:4 (`JPEG Data URL`)
  3. `[Core UI Utility]` `assets/js/core/UIHelpers.js` -> `UIHelpers.uploadPhotoToGoogleDrive(base64DataUrl, fileNamePrefix, settings)` **[Lines 330-394]** : ส่งภาพ Base64 ไปยัง Google Apps Script Web App (`google_drive_script_url`) และรับ Direct URL กลับมาบันทึกใน Supabase
  4. `[Google Apps Script Bridge]` `google_apps_script/DriveUploadBridge.gs` -> `doPost(e)` **[Lines 13-67]** & `getOrCreateTargetFolder(folderId)` **[Lines 87-98]** : แปลง Base64 เป็นไฟล์รูปภาพในโฟลเดอร์ Google Drive ตั้งสิทธิ์ `ANYONE_WITH_LINK` และคืนค่า `https://lh3.googleusercontent.com/d/<fileId>`
  5. `[Google Apps Script Bridge]` `google_apps_script/DriveUploadBridge.gs` -> `doGet(e)` **[Lines 7-11]** & `handleVerifyFolder(folderId)` **[Lines 69-85]** (คู่กับ `UIHelpers.verifyGoogleDriveLink()` **[Lines 286-328]**) : ตรวจสอบความถูกต้องของลิงก์ Web App และ Folder ID จากหน้าตั้งค่าระบบ

---

## 7. กระบวนการ: การยื่นคำขอลงเวลาพิเศษ/ย้อนหลัง และการพิจารณาอนุมัติ (Special Attendance Request & Bulk Approval Flow)
- **Flow ID:** `FLOW_SPECIAL_REQ_01`
- **ลำดับการเรียกใช้งานข้ามไฟล์ (Call Chain & Line Pointers):**
  1. `[Frontend Controller]` `assets/js/controllers/CheckinController.js` -> `CheckinController.#handleSubmitSpecialRequest(closeModalCallback)` **[Lines 1113-1174]** : ผู้ใช้กรอกวันที่ กะเวลา เหตุผล และเวลาที่ต้องการขออนุมัติในหน้า `checkin.html`
  2. `[Data Model Layer]` `assets/js/models/AttendanceModel.js` -> `AttendanceModel.submitSpecialRequest(payload)` **[Lines 1116-1167]** : บันทึกรายการคำขอพิเศษ (`is_special_request = true`, `approval_status = 'pending'`) ลงตาราง `attendance_logs`
  3. `[Frontend Controller]` `assets/js/controllers/CheckinController.js` -> `CheckinController.#renderSpecialRequestsHistoryTable()` **[Lines 581-623]** & `AttendanceModel.deletePendingSpecialRequestByUser()` **[Lines 809-843]** : ผู้ใช้ดูสถานะคำขอของตนเองและยกเลิกคำขอที่ยังรออนุมัติได้
  4. `[Frontend HTML View & Controller]` `approvals.html` **[Lines 27-114]** -> `assets/js/controllers/ApprovalsController.js` -> `ApprovalsController.init()` **[Lines 19-31]** & `ApprovalsController.loadRequests()` **[Lines 33-50]** : หน้าพิจารณาอนุมัติคำขอของผู้ดูแลระบบ
  5. `[Data Model Layer]` `assets/js/models/AttendanceModel.js` -> `AttendanceModel.getSpecialRequests(currentUser, statusFilter)` **[Lines 1169-1208]** : ดึงรายการคำขอตามขอบเขตสิทธิ์ (`AuthService.canViewRecordByScope()` **[Lines 332-348]**)
  6. `[Frontend Controller]` `assets/js/controllers/ApprovalsController.js` -> `ApprovalsController.#renderGroupedApprovalsTable()` **[Lines 69-133]** & `ApprovalsController.#processDecision(ids, decision)` **[Lines 240-272]** : แสดงตารางจัดกลุ่มตามสังกัดและส่งคำสั่งอนุมัติ/ไม่อนุมัติแบบรายรายการหรือแบบกลุ่ม (Bulk Approve/Reject)
  7. `[Data Model Layer]` `assets/js/models/AttendanceModel.js` -> `AttendanceModel.processSpecialRequestsBulk(logIds, decision, approverUserId)` **[Lines 1210-1255]** : อัปเดต `approval_status`, `approved_by`, `approved_at` ในตาราง `attendance_logs`

---

## 8. กระบวนการ: กระดานสรุปสถิติการปฏิบัติราชการประจำวัน (Daily Attendance Dashboard & Metrics Flow)
- **Flow ID:** `FLOW_DASHBOARD_01`
- **ลำดับการเรียกใช้งานข้ามไฟล์ (Call Chain & Line Pointers):**
  1. `[Frontend HTML View]` `dashboard.html` -> `<main>` **[Lines 31-170]** & `<script type="module">` **[Lines 179-179]** : หน้าจอ Dashboard สรุปภาพรวมประจำวัน
  2. `[Frontend Controller]` `assets/js/controllers/DashboardController.js` -> `DashboardController.init()` **[Lines 23-48]** & `DashboardController.loadDashboardData()` **[Lines 99-125]** : โหลดข้อมูลการลงเวลาตามวันที่เลือกผ่าน `AttendanceModel.getDailyReportRecords()` **[Lines 1383-1385]**
  3. `[Data Model Layer]` `assets/js/models/AttendanceModel.js` -> `AttendanceModel.getReportRecordsByDateRange(startDate, endDate, currentUser)` **[Lines 1276-1335]** & `AttendanceModel.calculateDashboardMetrics(dailyRecords)` **[Lines 1451-1514]** : คำนวณจำนวนบุคลากรทั้งหมด มาตรงเวลา มาสาย กลับก่อน รออนุมัติ และยังไม่ลงเวลา
  4. `[Frontend Controller]` `assets/js/controllers/DashboardController.js` -> `DashboardController.#renderJewelToneStatCards(metrics, colors)` **[Lines 144-213]** & `DashboardController.#renderTable(colors)` **[Lines 221-281]** : แสดงการ์ดสถิติโทนสีอัญมณี (Jewel-Tone) และตารางรายชื่อผู้ปฏิบัติราชการประจำวัน

---

## 9. กระบวนการ: การจัดการข้อมูลบุคลากร ประวัติย่อ และการนำเข้า/ส่งออก Excel แบบหลายแผ่นงาน (Personnel CRUD, Resume Modal & Multi-Sheet Excel Bulk Import Flow)
- **Flow ID:** `FLOW_PERSONNEL_01`
- **ลำดับการเรียกใช้งานข้ามไฟล์ (Call Chain & Line Pointers):**
  1. `[Frontend HTML View]` `personnel.html` -> `<main>` **[Lines 29-127]**, `<div#modalPersonnelForm>` **[Lines 135-246]**, `<div#bulkImportPreviewContainer>` **[Lines 443-484]** : หน้าจัดการบุคลากรและ Modal นำเข้าข้อมูลจาก Excel
  2. `[Frontend Controller]` `assets/js/controllers/PersonnelController.js` -> `PersonnelController.init()` **[Lines 25-46]** & `PersonnelController.loadPersonnelData()` **[Lines 125-138]** & `PersonnelController.#renderGroupedTable()` **[Lines 140-195]** : โหลดและจัดกลุ่มรายชื่อบุคลากรตามสังกัด
  3. `[Frontend Controller]` `assets/js/controllers/PersonnelController.js` -> `PersonnelController.#handleSavePersonnel()` **[Lines 682-719]** & `PersonnelController.#handleQuickCreateAccount(personId)` **[Lines 721-782]** : บันทึกข้อมูลบุคลากรและสร้างบัญชีผู้ใช้งานด่วน
  4. `[Data Model Layer]` `assets/js/models/PersonnelModel.js` -> `PersonnelModel.getAll()` **[Lines 52-94]**, `PersonnelModel.create()` **[Lines 201-289]**, `PersonnelModel.update()` **[Lines 291-342]**, `PersonnelModel.delete()` **[Lines 344-355]**, `PersonnelModel.quickCreateAccount()` **[Lines 119-196]** : จัดการข้อมูลในตาราง `personnel` และสร้างบัญชีใน `user_accounts`
  5. `[Frontend Controller]` `assets/js/controllers/PersonnelController.js` -> `PersonnelController.#downloadMultiSheetTemplate()` **[Lines 1426-1441]** -> `UIHelpers.exportTemplateWithValidationsExcel()` **[Lines 638-901]** : สร้างไฟล์แม่แบบ Excel แบบหลายแผ่นงานพร้อม Dropdown Data Validation ด้วย ExcelJS
  6. `[Frontend Controller]` `assets/js/controllers/PersonnelController.js` -> `PersonnelController.#processBulkImportFile(file)` **[Lines 870-944]** -> `PersonnelController.#validateRowCascading(row, changedField)` **[Lines 951-1242]** & `PersonnelController.#findBestFuzzyMatch()` **[Lines 806-822]** : อ่านไฟล์ Excel ตรวจสอบความถูกต้องของตำแหน่ง/สังกัดแบบ Cascading จับคู่คำใกล้เคียงด้วย Dice Coefficient และแสดงตาราง Preview แก้ไขสด (`#renderBulkImportPreview()` **[Lines 1257-1331]**)
  7. `[Frontend Controller & Model]` `assets/js/controllers/PersonnelController.js` -> `PersonnelController.#handleExecuteBulkImport()` **[Lines 1333-1421]** -> `PersonnelModel.bulkImportFromExcel(excelRows, autoCreateAccount)` **[Lines 385-429]** : นำเข้าข้อมูลบุคลากรและสร้างบัญชีผู้ใช้งานแบบกลุ่ม

---

## 10. กระบวนการ: การออกรายงานการลงเวลา การกรองป้ายสถานะ การแก้ไขโดยผู้ดูแล และการพิมพ์ PDF / ส่งออก Excel (Attendance Reports, Tag Filtering, Admin Override & Print/Export Flow)
- **Flow ID:** `FLOW_REPORTS_01`
- **ลำดับการเรียกใช้งานข้ามไฟล์ (Call Chain & Line Pointers):**
  1. `[Frontend HTML View]` `reports.html` -> `<main>` **[Lines 28-151]** (`<div#statusTagsFilterContainer>` **[Lines 142-142]**, `<div#reportTablesMasterContainer>` **[Lines 149-149]**) : หน้าจอรายงานการปฏิบัติราชการ
  2. `[Frontend Controller]` `assets/js/controllers/ReportsController.js` -> `ReportsController.init()` **[Lines 26-54]** & `ReportsController.loadReportData()` **[Lines 99-134]** : ดึงข้อมูลตามช่วงวันที่จาก `AttendanceModel.getReportRecordsByDateRange()` **[Lines 1276-1335]**
  3. `[Frontend Controller]` `assets/js/controllers/ReportsController.js` -> `ReportsController.#renderStatusTagFilterChips()` **[Lines 64-86]** & `ReportsController.#renderSeparateTablesBySelectedTags(forPrintPdf)` **[Lines 154-221]** : กรองและสร้างตารางแยกตามป้ายสถานะที่เลือก
  4. `[Frontend Controller]` `assets/js/controllers/ReportsController.js` -> `ReportsController.#openResumeProfileForSpecificRow(rowUid)` **[Lines 414-576]** : เปิดหน้าต่างดูประวัติและรายละเอียดการลงเวลารายบุคคลพร้อมภาพถ่ายและพิกัด GPS
  5. `[Frontend Controller & Model]` `assets/js/controllers/ReportsController.js` -> `ReportsController.#handleSaveReportRecord()` **[Lines 785-811]** -> `AttendanceModel.saveAdminAttendanceRecord(payload)` **[Lines 1387-1436]** & `AttendanceModel.deleteAttendanceRecord(logId)` **[Lines 1438-1449]** : ผู้ดูแลระบบเพิ่ม/แก้ไข/ลบบันทึกการลงเวลาโดยตรง
  6. `[Core UI Utility]` `assets/js/core/UIHelpers.js` -> `UIHelpers.printReportInNewTab()` **[Lines 927-1078]** & `UIHelpers.exportMultiSheetExcel()` **[Lines 609-629]** : พิมพ์รายงานรูปแบบราชการในแท็บใหม่ (Print / Save as PDF) และส่งออกไฟล์ Excel แยกแผ่นงานตามสถานะ

---

## 11. กระบวนการ: การตั้งค่าระบบ สีอัตลักษณ์ กะเวลาทำงาน โครงสร้างตำแหน่ง และโครงสร้างสังกัด 4 ระดับ (System Settings, Shifts, Positions & 4-Tier Affiliation Configuration Flow)
- **Flow ID:** `FLOW_SETTINGS_01`
- **ลำดับการเรียกใช้งานข้ามไฟล์ (Call Chain & Line Pointers):**
  1. `[Frontend HTML View]` `settings.html` -> `<main>` **[Lines 27-512]** & `<script type="module">` **[Lines 541-541]** : หน้าตั้งค่าระบบสำหรับ `SuperAdmin`
  2. `[Frontend Controller]` `assets/js/controllers/SettingsController.js` -> `SettingsController.init()` **[Lines 19-37]** & `SettingsController.#renderAllSettings()` **[Lines 39-115]** : โหลดค่าจาก `SettingsModel.getSettings()` และแสดงผลทุกหมวดหมู่
  3. `[Frontend Controller]` `assets/js/controllers/SettingsController.js` -> `SettingsController.#openShiftModal()` **[Lines 685-765]**, `#openAddPositionStep1Modal()` **[Lines 767-783]**, `#openAddPositionStep2Modal()` **[Lines 785-828]**, `#openAddPositionStep3Modal()` **[Lines 830-894]**, `#openEditSinglePositionModal()` **[Lines 896-919]**, `#openAddAffiliationStep1OrgModal()` **[Lines 921-937]**, `#openAddAffiliationStep2BureauModal()` **[Lines 939-977]**, `#openAddAffiliationStep3DivisionModal()` **[Lines 979-1035]**, `#openAddAffiliationStep4GroupModal()` **[Lines 1037-1121]**, `#openEditSingleAffiliationModal()` **[Lines 1123-1151]** : จัดการกะเวลาทำงาน โครงสร้างตำแหน่ง 3 ระดับ และโครงสร้างสังกัด 4 ระดับ (`organization` > `bureau` > `division` > `group`)
  4. `[Frontend Controller & Model]` `assets/js/controllers/SettingsController.js` -> `SettingsController.#collectMainAndColorFieldsIntoSettings()` **[Lines 337-365]** & `SettingsController.#persistSettings()` **[Lines 367-387]** -> `SettingsModel.updateSettings(payload)` **[Lines 115-163]** : บันทึกการตั้งค่าทั้งหมดลงตาราง `system_settings` บน Supabase
  5. `[Database Schema]` `sql/supabase_schema.sql` -> `TABLE public.system_settings` **[Lines 10-51]**, `sql/alter_v2_3_1_schema.sql` **[Lines 8-14]**, `sql/alter_v2_5_schema.sql` **[Lines 6-7]**, `sql/alter_v2_7_schema.sql` **[Lines 6-9]** : โครงสร้างตาราง `system_settings` และคอลัมน์ส่วนขยาย

---

## 12. กระบวนการ: การจัดการบัญชีผู้ใช้งาน ขอบเขตสิทธิ์ผู้ดูแล (Admin Scope) และการอนุมัติรีเซ็ตรหัสผ่าน (User Account Management, RBAC Scope & Password Reset Approval Flow)
- **Flow ID:** `FLOW_USERS_01`
- **ลำดับการเรียกใช้งานข้ามไฟล์ (Call Chain & Line Pointers):**
  1. `[Frontend HTML View]` `users.html` -> `<main>` **[Lines 28-156]** & `<div#modalUserAccountForm>` **[Lines 164-289]** : หน้าจัดการบัญชีผู้ใช้งาน
  2. `[Frontend Controller]` `assets/js/controllers/UsersController.js` -> `UsersController.init()` **[Lines 22-54]** & `UsersController.loadUsersAndPersonnel()` **[Lines 97-122]** & `UsersController.#renderUsersTable()` **[Lines 145-266]** : โหลดบัญชีผู้ใช้งานและแสดงตารางพร้อมป้ายสถานะคำขอรีเซ็ตรหัสผ่าน
  3. `[Frontend Controller]` `assets/js/controllers/UsersController.js` -> `UsersController.#toggleAdminScopeUI()` **[Lines 268-284]** & `UsersController.#handleSaveUserAccount()` **[Lines 501-543]** : กำหนดระดับสิทธิ์ (`SuperAdmin`, `Admin`, `User`) และขอบเขตการดูแลของ `Admin` (`admin_scope_bureau`, `admin_scope_division`)
  4. `[Data Model Layer]` `assets/js/models/UserModel.js` -> `UserModel.getAll()` **[Lines 17-54]**, `UserModel.create()` **[Lines 72-134]**, `UserModel.update()` **[Lines 143-195]**, `UserModel.delete()` **[Lines 203-227]**, `UserModel.processPasswordResetRequest(userId, isApproved)` **[Lines 236-301]** : จัดการข้อมูลตาราง `user_accounts` และอนุมัติรีเซ็ตรหัสผ่านเป็นเลข 6 หลักท้ายของบัตรประชาชน (`UIHelpers.getLast6DigitsFromNationalId()` **[Lines 571-575]**)

