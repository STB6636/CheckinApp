---
id: "rule_shift_select_empty_and_soft_ui_alerts"
title: "Domain Rule: Dropdown กะว่างเริ่มต้น, การเลื่อนจอ Smooth Scroll และ SweetAlerts Soft UI Dashboard"
type: "rule"
last_updated_phase: "PIPE-20261027-shift-select-empty-and-soft-ui-confirm-alert"
flows:
  - "FLOW_CHECKIN_01"
  - "FLOW_LAYOUT_01"
---

# 📋 Domain Rule: Dropdown กะว่างเริ่มต้น, การเลื่อนจอ Smooth Scroll และ SweetAlerts Soft UI Dashboard

## 1. บริบทและวัตถุประสงค์ (Context & Objective)
เพื่อป้องกันไม่ให้ผู้ใช้ลงเวลาผิดกะโดยไม่ได้ตั้งใจ ระบบจึงกำหนดให้ Dropdown เลือกช่วงเวลาทำงาน (`#checkinShiftSelect`) ต้องมีสถานะเริ่มต้นเป็น **"ค่าว่างเปล่า"** เสมอ และบังคับให้ผู้ใช้คลิกเลือกด้วยตนเอง พร้อมทั้งใช้การแจ้งเตือนสไตล์ **Tailwind CSS SweetAlerts - Soft UI Dashboard (Creative Tim)** ทั้งการแจ้งเตือนลืมเลือกกะ (Warning Alert) และการยืนยันข้อมูลก่อนบันทึก (Confirmation Modal)

## 2. กฎเกณฑ์เชิงเทคนิค (Technical Specifications)

### 2.1 Default Empty Option ใน HTML และ Controller
1. ใน `checkin.html`:
   ```html
   <select id="checkinShiftSelect" class="bma-select text-sm font-semibold rounded-xl w-full">
       <option value="">-- กรุณาเลือกช่วงเวลาปฏิบัติงาน --</option>
   </select>
   ```
2. ใน `CheckinController.#evaluateTimeWindowAndPopulateShifts()`:
   - ต้อง prepend `<option value="">-- กรุณาเลือกช่วงเวลาปฏิบัติงาน --</option>` เสมอ
   - หากผู้ใช้ยังไม่ได้เลือกกะ ให้เซ็ต `selectEl.value = ""` ไม่เลือกกะแรกให้อัตโนมัติ

### 2.2 Validation & Mobile Smooth Scroll
- ใน `CheckinController.#handleMainCheckin()`:
  - ตรวจสอบ `isShiftSelectorActive && (!shiftSelectEl || shiftSelectEl.value === '')`
  - หากยังไม่ได้เลือก:
    1. คืนสถานะปุ่มบันทึก (`btnSubmitMain.disabled = false`, คืนข้อความเดิม)
    2. แสดง SweetAlert2 Warning สไตล์ Soft UI (Gradient Amber)
    3. เมื่อปิดกล่อง สั่ง Smooth Scroll ไปที่ `#checkinShiftSelect`, โฟกัส และใส่กรอบ Highlight สีแดง (`ring-2 ring-rose-500 border-rose-500`) 3 วินาที

### 2.3 Soft UI Dashboard Confirmation Modal
- ก่อนบันทึกข้อมูล ให้แสดง SweetAlert2 Confirmation Modal:
  - หัวข้อ: **"ยืนยันการบันทึกลงเวลา"**
  - แสดง: ประเภทรายการ (`actionTitle`), ช่วงเวลาทำงาน (`selectedShiftLabel`), เวลาปัจจุบัน (`currentTimeFormatted`)
  - ปุ่มยืนยัน: Gradient เขียวมรกต (`from-[#00744B] to-emerald-500`)
  - ปุ่มยกเลิก: สี Slate (`bg-slate-100 dark:bg-slate-700`)
  - หากกดยกเลิก: คืนสถานะปุ่มกด และหยุดการทำงานทันที
  - หากกดยืนยัน: ดำเนินการ `UIHelpers.showLoading(...)` และบันทึกลงฐานข้อมูล

### 2.4 การรักษาความสมบูรณ์ของระบบเดิม (Compatibility Guarantee)
- **โหมดปกติ (เวลาราชการปกติ 06:00-08:30 และการลงเวลาออกงาน):** `#shiftSelectorContainer` ถูกซ่อน ทำให้ `isShiftSelectorActive` เป็น `false` ระบบจึงทำงานได้รวดเร็วและไม่ถูกบล็อก
- **ระบบคำขอพิเศษ (`#spShiftSelect`):** ทำงานเป็นอิสระต่อกัน 100%
- **ความสูงหน้าจอเดสก์ท็อป PC:** SweetAlert ทำงานเป็น Modal Overlay ไม่กระทบ Layout ความสูงรวม (~840px ไร้ Scroll Bar 100%)
