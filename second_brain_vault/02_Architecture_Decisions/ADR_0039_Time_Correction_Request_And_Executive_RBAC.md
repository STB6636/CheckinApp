---
id: "ADR_0039_Time_Correction_Request_And_Executive_RBAC"
title: "ADR-0039: ระบบคำขอแก้ไขเวลาเข้า-ออกงาน (Time Correction), หน้าอนุมัติแก้ไขเวลา, Executive RBAC 5 ตำแหน่ง และ Drawer Layout สมมาตร (V49)"
type: "decision"
status: "accepted"
date: "2026-11-19"
pipeline_id: "PIPE-20261119-time-correction-request-and-approvals"
flow_ids:
  - "FLOW_TIME_CORRECTION_01"
  - "FLOW_CHECKIN_01"
  - "FLOW_AUTH_01"
  - "FLOW_LAYOUT_01"
  - "FLOW_REPORTS_01"
  - "FLOW_DASHBOARD_01"
related:
  - "[[adr_003_double_layer_rbac_hierarchy]]"
  - "[[ADR_0036_mobile_card_lists_and_drawer_ajax_spa]]"
  - "[[ADR_0037_admin_mobile_cards_users_2tab_rbac_badges_and_hydrogen_high]]"
  - "[[rule_remote_version_hard_cache_purge_autostamp]]"
---

# ADR-0039: ระบบขอแก้ไขเวลาเข้า-ออกงาน (Time Correction), หน้าอนุมัติแก้ไขเวลา (`time-corrections.html`), Double-Layer Executive RBAC และ Drawer Layout สมมาตร (V49)

## 1. บริบทและปัญหา (Context)
บุคลากรที่ลงเวลาปกติแล้วเกิดสถานะ **`มาสาย`** หรือ **`ขาดราชการ`** (เช่น มาสายเกินเกณฑ์, หรือลงเวลาออกก่อนเวลาเลิกงาน) จำเป็นต้องยื่นคำขอแก้ไขเวลาให้ผู้บังคับบัญชาพิจารณาอนุมัติโดยแยกขาดจากระบบ **"คำขอลงเวลากรณีพิเศษ (`is_special_request`)"** เพื่อไม่ให้กระทบการกรองคำขอพิเศษและการรายงานเดิม พร้อมควบคุมสิทธิ์การอนุมัติคำขอของ `Admin` (ระดับกอง/ฝ่าย) อย่างเข้มงวดไม่ให้สามารถอนุมัติตนเองได้

## 2. การตัดสินใจทางสถาปัตยกรรม (Architectural Decisions)

### 2.1 Schema Isolation & Additive Columns (`sql/alter_v2_11_time_correction_staging.sql` & `public`)
- เพิ่มคอลัมน์กลุ่ม `correction_*` 9 คอลัมน์บน `staging.attendance_logs` (และสร้างไฟล์คู่ขนาน `public.attendance_logs`) แบบ Additive & Idempotent 100%:
  - `correction_status` (`none | pending | approved | rejected`, `DEFAULT 'none'`)
  - `correction_requested_at`, `correction_request_reason` (Optional), `correction_reviewed_by` (FK → `user_accounts(id) ON DELETE SET NULL`), `correction_reviewed_at`, `correction_reject_reason` (Optional)
  - `correction_original_check_in`, `correction_original_check_out`, `correction_original_status` (Nullish `??` Per-Leg Audit Snapshot)
- เพิ่ม Partial Index `idx_*_attendance_correction_status ON attendance_logs (correction_status, work_date DESC) WHERE correction_status <> 'none'` และใส่ `42703` / `PGRST204` Graceful Fallback ในฝั่ง Model เผื่อกรณีเปิดใช้งานก่อนรัน SQL

### 2.2 Leg-Selective Calculation & Idempotent `(แก้ไขเวลา)` Remark (`AttendanceModel.js`)
- รวมตรรกะอ่านกะเวลาไว้ที่ `#resolveShiftTimesForLog(log, settings)` (`!is_custom` `work_shifts` → regex normalized ผ่าน `UIHelpers.formatTime24` → fallback `standard_check_in/out`)
- กรองเฉพาะบันทึกปกติ (`!is_special_request && !is_overtime`) ที่ `correction_status !== 'approved'` และมีขาที่สถานะเป็น **`มาสาย`** หรือ **`ขาดราชการ`** เท่านั้น (ตัด **`ไม่ลงเวลา`** ออกเด็ดขาด)
- เมื่ออนุมัติ: ปรับเฉพาะขาที่ `late` / `absent_duty` เป็น `stdStart` / `stdEnd` โดย **คงค่าขาที่ปกติ (`17:45`, `19:30`, `08:15`) หรือ `null` ไว้ครบถ้วน**, ประเมินสถานะใหม่ด้วย `'กำลังประเมิน'` bypass → `'ปฏิบัติงานปกติ'`
- **กฎหมายเหตุ (`#buildCorrectedRemark`):**
  - ไม่มีหมายเหตุเดิม (`''`, `'-'`, `'ในสถานที่'`, คำสถานะ) → `'ขอแก้ไขเวลา'`
  - มีหมายเหตุเดิม (เช่น `'ประชุม'`, `offsite_reason`) → `'<remark เดิม> (แก้ไขเวลา)'` พร้อม Idempotent Guard กันเติมวงเล็บซ้ำซ้อน
- **Edge-Case Safeguards:**
  - 2-Round Snapshot (`??`): คงค่าเวลาเดิมขาเช้าไว้แม้มีการขอแก้ขาออกรอบที่ 2 (`submitCheckinOrCheckout` รีเซ็ต `correction_status = 'none'` เมื่อลงออกก่อนเวลา)
  - Phantom-Pending Cleanup: `saveAdminAttendanceRecord` เคลียร์ `correction_status = 'pending'` เมื่อ Admin แก้เวลาใน `reports.html` จนเป็น `'ปฏิบัติงานปกติ'`
  - Watermark Sync: `getTodaySyncWatermark` รวมแถว `correction_status <> 'none'` ล่าสุดไม่จำกัดเฉพาะวันปัจจุบัน

### 2.3 Double-Layer Executive RBAC (`AuthService.canApproveTimeCorrection` — Updated V50)
บังคับตรวจ 2 ชั้น (UI Checkbox/Action Gate ใน `TimeCorrectionsController.js` + Server/Model Gate ใน `AttendanceModel.processTimeCorrectionsBulk`):
- **ผู้ขอเป็น `User`:** `SuperAdmin` หรือ `Admin` (ระดับกอง/ฝ่าย ในขอบเขต `canViewRecordByScope`) อนุมัติได้
- **ผู้ขอเป็น `Admin` หรือ `SuperAdmin`:** อนุญาตเฉพาะ **`SuperAdmin` (ไม่จำกัดประเภทตำแหน่ง)** หรือ **`Admin` ในขอบเขต (`ส่วน/ฝ่าย` หรือ `สำนักงาน/กอง`, ไม่ใช่เจ้าตัว)** ที่ `position_type === 'ประเภทผู้บริหาร'` **และ** `position_title` อยู่ใน 6 ตำแหน่ง: `['ผู้อำนวยการส่วน', 'ผู้อำนวยการกอง', 'เลขานุการ', 'เลขานุการสำนัก', 'หัวหน้ากลุ่มงาน', 'หัวหน้าฝ่าย']`

### 2.3.1 V50 UI/UX Refinements (`PIPE-20261119-v50-toast-swal-superadmin-rbac`)
- **Dynamic Prefix-Free Welcome Toast (`UIHelpers.formatWelcomeDisplayName`):** ใช้ `personnel.first_name + last_name` เป็นอันดับแรก และ fallback ตัดคำนำหน้าแบบ Dynamic จาก `system_settings.prefixes` (เรียงยาว→สั้น, ไม่ Hardcode) แสดงผลเป็น `ยินดีต้อนรับคุณ<ชื่อ นามสกุล>`
- **Soft UI Confirm-With-Input (`UIHelpers.confirmWithInput`):** มาตรฐาน SweetAlert2 พร้อมช่องกรอกเหตุผลแบบ Optional (`buttonsStyling: false`, `rounded-2xl`, `backdrop-blur-md`, ปุ่ม Gradient + ไอคอน) ใช้ร่วมกันทั้ง Popup `"ยืนยันส่งคำขอแก้ไขเวลา"` (`CheckinController.js`) และ Popup `"ยืนยันการไม่อนุมัติคำขอแก้ไขเวลา"` (`TimeCorrectionsController.js`)
- **Mobile Shortcut Label:** ปรับ `"อนุมัติแก้ไขเวลา"` → `"อนุมัติแก้เวลา"` ใน `AppLayout.getMobileShortcutGridHtml` เพื่อไม่ให้ตัดคำ `...` บนมือถือ

### 2.4 Symmetrical Hamburger Drawer Layout & Retirement of `#btnDrawerNavCheckin` (`checkin.html` & `CheckinController.js`)
- ลบปุ่ม `"ลงเวลาปฏิบัติงาน"` และ DOM ID `#btnDrawerNavCheckin` ออกถาวร (ไม่ใช่ชุด 30 ID ของ `adr_004`; อัปเดต whitelist ใน `qa_mobile_cards_drawer_spa_test.mjs`) พร้อมคงกล่องซ่อน `#drawerUserRole` / `#drawerUserAffiliation`
- โครงสร้าง Grid สมมาตร (`grid grid-cols-2 grid-rows-2 gap-2 items-stretch`) เรียง DOM `[คำขอพิเศษ, ประวัติการลงเวลา, แก้ไขเวลา, ระบบผู้ดูแล]`:
  - **`SuperAdmin` + `Admin`:** ตาราง 2×2 สมมาตร 4 ปุ่ม
  - **`User`:** ซ่อนปุ่ม `"ระบบผู้ดูแล"`, ฝั่งซ้ายแบ่งครึ่งบน-ล่าง (`คำขอพิเศษ` / `แก้ไขเวลา` + `#drawerCorrectionBadge`), ฝั่งขวา `#btnDrawerNavHistory` ขยายเต็มความสูง `row-span-2 flex-col justify-center items-center text-center` และรักษาคลาสไว้ทุกครั้งใน `setDrawerActiveNav`
- เพิ่มแท็บ Desktop `#tabDesktopCorrection` + `#tabDesktopCorrectionBadge` และรองรับ 3-View SPA (`history | special | correction`) ครบ 4 จุด Reparenting

### 2.5 Admin Portal Navigation & 10-HTML Mandatory Cache Sync
- เพิ่มหน้า `time-corrections.html` + `TimeCorrectionsController.js` ต่อจาก `approvals.html` ใน Sidebar, Shortcut Grid, Notification Bell (`#topBellBadgeCount`), และ Mobile Bottom Nav (`"อนุมัติพิเศษ"` + `"แก้เวลา"` 7 ปุ่มรองรับ `overflow-x-auto no-scrollbar` บนจอ 360px)
- อัปเดต `.ai_map/vscode_ast_mapper.mjs` และ `AGENTS.md` จาก **9 หน้า → 10 หน้า HTML หลัก** สำหรับ Mandatory Cache Version Synchronization (`version.json` + `?v=<buildId>` + `CURRENT_APP_BUILD`)

## 3. ผลกระทบและการตรวจสอบ (Consequences & Verification)
- ผ่านการตรวจสอบ 12/12 QA Suites (`qa_v49_time_correction_test.mjs` 7/7 + Playwright `360px`/`390px`/`1280px` + 11 Regression Suites เดิม)
- ฐานข้อมูล Staging ต้องรัน `sql/alter_v2_11_time_correction_staging.sql` ใน Supabase SQL Editor ก่อนใช้งานจริงบน Staging (และรัน `public` ตอน Merge เข้า `main`)
