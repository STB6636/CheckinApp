---
id: "ADR_0040_Reports_Edit_Modal_Checkout_Logic_And_User_Priority_Guard"
title: "ADR-0040: ออกแบบ Logic ใหม่ฟอร์มบันทึก/แก้ไขเวลาปฏิบัติราชการ (reports.html) — ป้องกันเติม 16:30 อัตโนมัติ, Disabled บุคลากร+วันที่ตอนแก้ไข, และ User-Priority Duplicate Guard (V51)"
type: "decision"
status: "accepted"
date: "2026-11-19"
pipeline_id: "PIPE-20261119-v51-reports-edit-modal-checkout-logic"
flow_ids:
  - "FLOW_REPORTS_01"
  - "FLOW_TIME_CORRECTION_01"
related:
  - "[[ADR_0038_mobile_modals_dvh_3zone_scroll_and_z9990_hierarchy]]"
  - "[[ADR_0039_Time_Correction_Request_And_Executive_RBAC]]"
  - "[[rule_remote_version_hard_cache_purge_autostamp]]"
---

# ADR-0040: ออกแบบ Logic ใหม่ฟอร์มบันทึก/แก้ไขเวลาปฏิบัติราชการ (`reports.html`) และ User-Priority Duplicate Guard (V51)

## 1. บริบทและปัญหา (Context)
- เดิม `ReportsController.#openModal` (`L1319`) และ `reports.html` (`L326`) ใส่ fallback `16:30` ลงในช่อง `เวลาเลิกงาน` อัตโนมัติแม้บุคลากรยังไม่ได้ลงเวลาออก (`check_out_time = null`) ทำให้ผู้ดูแลระบบเสี่ยงบันทึกเวลาเลิกงานปลอมโดยไม่ตั้งใจ
- นอกจากนี้ `AttendanceModel.saveAdminAttendanceRecord` เขียนทับ `shift_name` และ `is_special_request` ด้วยค่า default บน UPDATE และยังไม่มีตัวกันสร้างรายการซ้ำเมื่อผู้ใช้ได้ลงเวลาเองแล้ว

## 2. การตัดสินใจทางสถาปัตยกรรม (Decisions)
1. **3-Mode Modal Logic (`ReportsController.#openModal` & `reports.html`):**
   - **โหมดแก้ไขรายการเดิม (`rec?.log_id`):** Disabled ทั้ง `#repPersonnelSelect` และ `#repWorkDate` + แสดงป้าย `#repEditModeBadge` (`แก้ไขบันทึกเดิม`), คงค่าจริงของ `check_in_time` / `check_out_time` (ไม่เติม `16:30` อัตโนมัติเมื่อ `null`), แสดง `#repCheckoutHintBanner` เมื่อยังไม่มีเวลาออก
   - **โหมดเพิ่มบันทึกใหม่ / แถวไม่ลงเวลา (`!rec?.log_id`):** ปล่อย `#repCheckoutTime` ว่างไว้เป็นค่าเริ่มต้นทั้ง 3 โหมด, มีปุ่มลัด `#btnQuickFillCheckout` (`ตามกะ`) และ `#btnClearCheckout` (`ล้าง`) ให้แอดมินตั้งใจคลิกเอง, พร้อม `#repDuplicateWarningBanner` เตือนล่วงหน้าเมื่อเลือก `(บุคลากร + วันที่)` ที่มีข้อมูลแล้ว
2. **Strict 24h Validation & Chronological Guard (`ReportsController.#handleSaveReportRecord`):**
   - ตรวจรูปแบบ 24 ชม. (`/^(?:[01]?\d|2[0-3])[:.]([0-5]\d)$/`), แปลงช่องเวลาออกว่าง/`'-'` → `null`, และยืนยันผ่าน `UIHelpers.confirm` หาก `checkOutMin <= checkInMin` ในกะปกติ
3. **UPDATE Preservation & INSERT User-Priority Duplicate Guard (`AttendanceModel.saveAdminAttendanceRecord`):**
   - **UPDATE (`payload.log_id`):** ไม่เขียนทับ `shift_name`, `is_special_request`, `approval_status` หากไม่ได้ส่งค่ามา
   - **INSERT (`!payload.log_id`):** Query ตาราง `attendance_logs` สดตาม `(personnel_id, work_date)` ก่อน Insert — บล็อกทันที (`{ success: false, duplicate: true, existingRecord }`) หากบุคลากรลงเวลาราชการปกติไว้แล้ว เพื่อให้ระบบยึดการลงเวลาของผู้ใช้เป็นหลักเสมอ (อนุญาตเฉพาะ OT ที่เวลาไม่ซ้ำ)

## 3. การตรวจสอบ (Verification)
- `qa_v51_reports_edit_modal_test.mjs`: 5/5 PASS (รวม Playwright `390×844` บน `reports.html`)
- Regression Suites: `qa_reports_redesign_verification.mjs` (96/96), `qa_v48_mobile_modals_test.mjs` (10/10), `qa_v49_time_correction_test.mjs` (7/7), `qa_v50_verification_test.mjs` (6/6), `qa_print_simulation_test.mjs` (3/3) — ผ่าน 100%
- `buildId: 20261119_98c821d6` ซิงค์ครบ 10/10 หน้า HTML หลัก
