---
id: "sb_04_project_contexts_checkinapp"
title: "CheckinApp (BMA Check-in App V2.1–V2.7) — บริบทโปรเจกต์และดัชนีกระบวนการทำงาน"
type: "project_context"
tags: ["checkinapp", "html", "javascript", "supabase", "github_pages", "bma_design_system", "ai_map"]
related_notes: ["[[adr_001_vscode_surgical_codebase_map]]"]
related_skills: ["vscode_surgical_codebase_mapping"]
last_updated_phase: "PIPE-20261026-codebase-mapping-v3"
status: "verified_active"
---

# CheckinApp (BMA Check-in App V2.1–V2.7) — บริบทโปรเจกต์และดัชนีกระบวนการทำงาน

## 1. บริบทและปัญหา (Context & Problem Statement)
ระบบลงเวลาปฏิบัติราชการออนไลน์ (Check-in) ของกรุงเทพมหานคร พัฒนาด้วยสถาปัตยกรรม OOP แยกไฟล์ตามกลุ่มการใช้งาน (`core`, `models`, `controllers`, `components`) และแยกหน้าจอ HTML หน้าละไฟล์ เชื่อมต่อฐานข้อมูล Supabase และ Google Apps Script Bridge สำหรับอัปโหลดรูปถ่ายเข้า Google Drive โฮสต์บน GitHub Pages ภายใต้ระบบสี BMA Enterprise Design System รองรับ Light Mode และ Eye-Care Dark Mode (`#111816`)

- Repository: `https://github.com/STB6636/CheckinApp.git` — branch ปัจจุบัน: `Test-UXUI`
- Project Report (GitHub README): ปรับปรุงเป็นรายงานฉบับสมบูรณ์ (GFM, Badges, 12 Flows, Architecture Mermaid, Security Guidelines) ใน `README.md`
- Supabase Project Ref: `yicatrqogmcncfpqdyra`
- Codebase Map: สแกนแล้ว **30 ไฟล์ / 367 สัญลักษณ์** ใน `.ai_map/01_FILE_FUNCTION_INDEX.md` และ `.ai_map/CODE_INDEX.json`

## 2. โครงสร้างทางเทคนิคและดัชนีกระบวนการทำงาน (`Flow ID` ใน `.ai_map/00_PROCESS_FLOW_MAP.md`)
- **`FLOW_AUTH_01`**: การเข้าสู่ระบบ 2 โหมด (`checkin` / `manage`), การตรวจสอบสิทธิ์ และการต่ออายุ Session 7 วัน (`index.html` -> `LoginController` -> `AuthService`)
- **`FLOW_AUTH_02`**: การเปลี่ยนรหัสผ่านด้วยตนเอง และการแจ้งลืมรหัสผ่านด้วยเลขบัตรประชาชน 13 หลัก (`LoginController` -> `AuthService`)
- **`FLOW_LAYOUT_01`**: โครงสร้างหน้าผู้ดูแลระบบ (Sidebar/Topbar/Mobile Nav), AJAX SPA Navigation, การซ่อน `.html` บน URL, การสลับธีม และกระดิ่งแจ้งเตือน (`AppLayout` -> `UIHelpers`)
- **`FLOW_CHECKIN_01`**: การลงเวลามาและกลับปฏิบัติราชการปกติ รองรับทั้งโหมด 2 คลิก และโหมดพิเศษกดครั้งเดียว (`single_click_checkout`) พร้อมประเมินสถานะทางการ (`checkin.html` -> `CheckinController` -> `AttendanceModel`)
- **`FLOW_GPS_01`**: การค้นหาและจำแนกชื่อสถานที่จากพิกัด GPS อัตโนมัติ 3 ระดับ (`z=19` ใกล้เคียง... -> `z=20` บริเวณ... -> ซอย/ซอยย่อย) พร้อมกรองคำต้องห้าม (`CheckinController.#initGpsLocation` -> `AttendanceModel.resolveLocationWithZoomMeta`)
- **`FLOW_PHOTO_01`**: การเปิดกล้องถ่ายภาพอัตราส่วน 3:4 เมื่อต้องการใช้งาน และอัปโหลดเข้าสู่ Google Drive ผ่าน Google Apps Script (`CheckinController` -> `UIHelpers.uploadPhotoToGoogleDrive` -> `DriveUploadBridge.gs`)
- **`FLOW_SPECIAL_REQ_01`**: การยื่นคำขอลงเวลาพิเศษ/ย้อนหลัง และการพิจารณาอนุมัติแบบรายรายการหรือแบบกลุ่ม (`CheckinController` / `ApprovalsController` -> `AttendanceModel`)
- **`FLOW_DASHBOARD_01`**: กระดานสรุปสถิติการปฏิบัติราชการประจำวันและการ์ดโทนสีอัญมณี (`dashboard.html` -> `DashboardController` -> `AttendanceModel.calculateDashboardMetrics`)
- **`FLOW_PERSONNEL_01`**: การจัดการบุคลากร ประวัติย่อ การสร้างบัญชีด่วน และการนำเข้า/ส่งออก Excel แบบหลายแผ่นงานพร้อมตรวจสอบความถูกต้องแบบ Cascading & Fuzzy Match (`personnel.html` -> `PersonnelController` -> `PersonnelModel` & `UIHelpers`)
- **`FLOW_REPORTS_01`**: การออกรายงานการลงเวลาตามช่วงวันที่ การกรองด้วยป้ายสถานะ การแก้ไขข้อมูลโดยผู้ดูแล และการพิมพ์ PDF / ส่งออก Excel (`reports.html` -> `ReportsController` -> `AttendanceModel` & `UIHelpers`)
- **`FLOW_SETTINGS_01`**: การตั้งค่าระบบ องค์กร สีอัตลักษณ์ โหมดลงเวลา กะเวลาทำงาน โครงสร้างตำแหน่ง 3 ระดับ และโครงสร้างสังกัด 4 ระดับ (`settings.html` -> `SettingsController` -> `SettingsModel`)
- **`FLOW_USERS_01`**: การจัดการบัญชีผู้ใช้งาน การกำหนดขอบเขตสิทธิ์ผู้ดูแล (`admin_scope_bureau`, `admin_scope_division`) และการอนุมัติรีเซ็ตรหัสผ่าน (`users.html` -> `UsersController` -> `UserModel`)

## 3. ข้อควรระวังและกรณีศึกษา (Pitfalls & Edge Cases)
- ทุกครั้งที่จะอ่านหรือแก้ไขซอร์สโค้ด ต้องใช้ `.ai_map/00_PROCESS_FLOW_MAP.md` และ `.ai_map/01_FILE_FUNCTION_INDEX.md` เพื่อดึงเฉพาะช่วงบรรทัด `L_start - L_end` เท่านั้น (กฎ `MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`)
- ขอบเขตสิทธิ์ของ `Admin` ถูกจำกัดด้วย `admin_scope_bureau` และ `admin_scope_division` ผ่าน `AuthService.canViewRecordByScope()` (บรรทัด `L332 - L348`)
- ระบบ GPS ห้ามคืนค่าชื่อสถานที่ที่เป็นคำต้องห้าม (`ถนน`, `แขวง`, `เขต`, `หมู่บ้าน`, `ตำบล`, `อำเภอ`, `จังหวัด`) ตามลอจิกใน `AttendanceModel.#isForbiddenLocationTerm()` (บรรทัด `L44 - L74`)

## 4. ความเชื่อมโยงในระบบความรู้ (Knowledge Graph Links)
- เชื่อมโยงกับสถาปัตยกรรม: [[adr_001_vscode_surgical_codebase_map]]
- เชื่อมโยงกับสกิลที่ใช้: [[vscode_surgical_codebase_mapping]]
