---
id: "rule_personal_attendance_history_limit_and_pagination"
title: "Domain Rule: การจำกัดข้อมูลประวัติการลงเวลาส่วนตัวย้อนหลัง 30 รายการ และระบบแบ่งหน้า [5, 10, 15, 20, 30]"
type: "rule"
last_updated_phase: "PIPE-20261027-limit-personal-history-30"
flows:
  - "FLOW_CHECKIN_01"
---

# 📜 กฎการจำกัดข้อมูลประวัติการลงเวลาส่วนตัวย้อนหลัง และระบบแบ่งหน้า (Personal Attendance History Policy)

## 1. วัตถุประสงค์ (Purpose)
เพื่อเพิ่มประสิทธิภาพความเร็วในการคิวรีฐานข้อมูล Supabase และแสดงเฉพาะข้อมูลการปฏิบัติงานที่มีนัยสำคัญล่าสุด ระบบจึงกำหนดเพดานการแสดงประวัติการลงเวลาย้อนหลังของตนเองไว้สูงสุดไม่เกิน **30 รายการล่าสุด**

## 2. นโยบายการดึงข้อมูลและการแสดงผล (Data Fetching & Slicing Policy)
1. **การคิวรีฐานข้อมูล (`AttendanceModel.getPersonalAttendanceHistory`):**
   - กำหนดค่า `limit = 35` (เผื่อรายการของวันปัจจุบันและการคำนวณสถานะ)
2. **การคัดกรองใน Controller (`CheckinController.#refreshAllAttendanceData`):**
   - แยก `todayHistoryList` เฉพาะวันที่ตรงกับวันนี้ (`work_date === todayIso`)
   - สำหรับประวัติย้อนหลัง `pastHistoryList` ทำการกรองวันก่อนหน้าและตัดความยาวอย่างเคร่งครัด:
     ```javascript
     this.pastHistoryList = allHistory.filter(item => item.work_date !== todayIso).slice(0, 30);
     ```
3. **ตัวเลือกขนาดหน้า (Page Size Selector):**
   - ตัวเลือกใน `<select id="selectPastPageSize">`: `[5, 10, 15, 20, 30]` รายการ
   - ค่าเริ่มต้น (Default Selected): `10` รายการ
4. **การแบ่งหน้า (Pagination Calculation):**
   - `totalPages = Math.max(1, Math.ceil(totalPast / this.pastPageSize))`
   - ปุ่ม Next และ Prev สลับสถานะ `disabled` ตามหน้าปัจจุบันและหน้าสุดท้ายอย่างถูกต้อง

