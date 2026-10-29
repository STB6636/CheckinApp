---
id: "sb_rule_early_shift_realtime_filter"
title: "Domain Rule: ระบบอนุญาตให้เริ่มเลือกทำงานก่อนเวลาเริ่มงานได้ (Early Shift Real-time Filter Window)"
type: "rule"
linked_flows: ["FLOW_SETTINGS_01", "FLOW_CHECKIN_01"]
created_at: "2026-10-29"
---

# Domain Rule: ระบบอนุญาตให้เริ่มเลือกทำงานก่อนเวลาเริ่มงานได้ (Early Shift Real-time Filter Window)

## 1. วัตถุประสงค์ (Purpose)
เพื่อรองรับความยืดหยุ่นในการลงเวลาปฏิบัติงานสำหรับช่วงเวลาที่อนุญาตให้เจ้าหน้าที่เข้างานล่วงหน้า โดยยังคงความสามารถในการกรองช่วงเวลากะตามเวลาจริง (Real-time Filter) ไว้อย่างถูกต้อง ไม่แสดงกะที่ยังไม่ถึงเวลา แต่สามารถแสดงตัวเลือกก่อนเวลาเริ่มงานจริงตามจำนวนนาทีที่กำหนดไว้

## 2. กฎการทำงานทางธุรกิจ (Business Logic & Rules)

1. **ระดับการตั้งค่าส่วนกลาง (System-wide Level):**
   - ในหน้าตั้งค่าระบบ แท็บ 1 ("ข้อมูลหน่วยงาน & ระบบ") มีช่องกรอก `เวลาเริ่มทำงานก่อนเวลาของช่วงเวลา (นาที)` (`early_shift_window_minutes`)
   - ค่าเริ่มต้นคือ 30 นาที (ช่วงที่อนุญาต 0 - 360 นาที)
   - หากผู้ใช้ปิดสวิตช์ Real-time Filter ช่องกรอกจะถูกลดความเข้ม (dimmed) และ disabled อัตโนมัติ

2. **ระดับช่วงเวลาทำงาน (Shift Level):**
   - แต่ละกะใน `work_shifts` สามารถเลือกเงื่อนไข `[x] ให้เริ่มเลือก ทำงานก่อนเวลาเริ่มงานได้` (`allow_early_checkin: boolean`)
   - มีผลเฉพาะกะที่มีค่า `allow_early_checkin: true` เท่านั้น กะอื่นๆ ที่ไม่ได้เลือกเงื่อนไขนี้จะยังคงปรากฏตามเวลาเริ่มงานปกติ

3. **สูตรการคำนวณเวลาเริ่มต้นที่แสดงใน Dropdown:**
   - เมื่อเปิด `filter_shifts_by_realtime` และกะนั้นมี `allow_early_checkin = true`:
     $$\text{shiftStartMin} = \text{check\_in\_minutes} - \text{early\_shift\_window\_minutes}$$
   - ตัวอย่าง: กะเริ่ม 17:00 น. (1020 นาที), ตั้งค่าเวลาล่วงหน้า 30 นาที:
     $$\text{shiftStartMin} = 1020 - 30 = 990 \text{ นาที (16:30 น.)}$$
     กะนี้จะปรากฏให้เลือกในหน้าลงเวลาตั้งแต่เวลา 16:30 น. เป็นต้นไปจนถึงเวลาสิ้นสุดของกะ

4. **การรองรับกะข้ามวัน (Overnight Shifts & Midnight Wrap-around):**
   - หาก $\text{shiftStartMin} < 0$ (เช่น กะเริ่ม 00:15 น. ล่วงหน้า 30 นาที คือ 23:45 น. ของวันก่อนหน้า):
     $$\text{normalizedShiftStart} = \text{shiftStartMin} + 1440$$
     ระบบจะตรวจสอบเงื่อนไข $(\text{nowMin} \ge \text{normalizedShiftStart}) \lor (\text{nowMin} \le \text{endMin})$ ได้อย่างแม่นยำ

5. **ความทนทานต่อฐานข้อมูล (Database Resilience & Backward Compatibility):**
   - ตาราง `system_settings` จัดเก็บ `early_shift_window_minutes INTEGER DEFAULT 30`
   - ใน `SettingsModel.js` มีระบบ Retry Fallback หากยังไม่ได้รันคำสั่ง SQL ใน Supabase โดยจะลบฟิลด์ออกจาก Payload อัตโนมัติ และสำรองค่าไว้ใน `localStorage` (`bma_early_shift_window_minutes`) ทำให้ระบบทำงานได้อย่างต่อเนื่องไม่มีการ Crash
