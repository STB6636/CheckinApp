---
id: "sb_fix_v19_realtime_shift_filter_and_personnel_modal"
title: "Post-mortem V19: แก้ไขระบบกรองช่วงเวลากะตามเวลาจริง (filter_shifts_by_realtime) และปรับปรุง Layout ฟอร์มประวัติบุคลากร"
type: "postmortem"
linked_flows: ["FLOW_CHECKIN_01", "FLOW_CHECKIN_03", "FLOW_PERSONNEL_01", "FLOW_SETTINGS_01"]
created_at: "2026-10-26"
---

# Post-mortem V19: แก้ไข `filter_shifts_by_realtime` & ฟอร์มประวัติและข้อมูลบุคลากร

## 1. ปัญหาการตั้งค่า "กรองช่วงเวลากะตามเวลาจริง" (`filter_shifts_by_realtime`) กลับมาติ๊กถูกเองหลังบันทึก
- **Flows ที่เกี่ยวข้อง:** `Flow 3` (`FLOW_CHECKIN_01`), `Flow 5` (`FLOW_CHECKIN_03`), `Flow 11` (`FLOW_SETTINGS_01`)
- **สาเหตุ (Root Cause):**
  1. `SettingsController.#collectMainAndColorFieldsIntoSettings` ไม่ได้อ่านค่า `.checked` จาก `#toggleFilterShiftsByRealtime` เข้าสู่ `this.settings.filter_shifts_by_realtime`
  2. `CheckinController.#evaluateTimeWindowAndPopulateShifts`, `#updateStatusCardsAndMainButton`, และ `#handleMainCheckin` ยังคงบังคับตัดกะปกติทิ้งหรือซ่อนตัวเลือกกะเมื่ออยู่นอกช่วงเวลาราชการ แม้จะตั้งค่า `filter_shifts_by_realtime = false` แล้วก็ตาม
- **การแก้ไข:**
  - อ่านค่า `#toggleFilterShiftsByRealtime.checked` ใน `SettingsController.js` และผูก Event `change`
  - บันทึกค่า Boolean พร้อม `localStorage` Fallback (`bma_filter_shifts_by_realtime`) และ Schema Retry ใน `SettingsModel.js`
  - ปรับเงื่อนไข `isRealtimeFilterEnabled` ใน `CheckinController.js` ให้แสดงและเลือกกะเวลาได้ทุกกะเมื่อปิดตัวกรองตามเวลาจริง

## 2. ปัญหา Layout ฟอร์มประวัติและข้อมูลบุคลากร (`#modalPersonnelResumeProfile`) เพี้ยนและแสดงข้อมูลซ้ำซ้อน
- **Flows ที่เกี่ยวข้อง:** `Flow 9` (`FLOW_PERSONNEL_01`)
- **สาเหตุ (Root Cause):**
  1. กฎ CSS `#modalPersonnelResumeProfile > div { max-height: 520px; }` ใน `bma-theme.css` ตัดความสูงของการ์ดสีขาวใน `personnel.html` ที่ `520px` ทำให้ปุ่มท้ายฟอร์มลอยหลุดกรอบสีขาวลงมาด้านล่าง
  2. ข้อมูลสังกัดราชการแสดงซ้ำทั้งในส่วนหัวและในกล่องโครงสร้างสังกัด 4 ระดับ และเลขประจำตัวประชาชน 13 หลักแสดงซ้ำกับช่อง Username
- **การแก้ไข:**
  - ปรับ `max-height: calc(100vh - 2.5rem); overflow: hidden;` ใน `bma-theme.css`
  - จัดกลุ่มข้อมูลใหม่ใน `personnel.html` และ `PersonnelController.js` แบบไร้ความซ้ำซ้อน (Zero Duplication): ใช้ Initials Avatar Badge, รวมประเภทตำแหน่งคู่กับชื่อตำแหน่งที่ส่วนหัว, แสดงเลขประจำตัวประชาชนคู่กับสถานะบัญชีผู้ใช้งาน และแสดงสังกัด 4 ระดับเฉพาะในกล่องโครงสร้างสังกัดเพียงจุดเดียว

