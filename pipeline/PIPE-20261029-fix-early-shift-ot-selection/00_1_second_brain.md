# Phase 0.1 — Second Brain Knowledge Retrieval
**Pipeline ID:** `PIPE-20261029-fix-early-shift-ot-selection`
**Mode:** `PLAN`
**Linked Flows:** `FLOW_SETTINGS_01`, `FLOW_CHECKIN_01`, `FLOW_CHECKIN_03`

---

## 1. Retrieved Architecture Decisions & Domain Rules
1. **[[rule_early_shift_realtime_filter]]**:
   - ระบบอนุญาตให้เลือกช่วงเวลาปฏิบัติงานก่อนเวลาเริ่มงานจริงตามจำนวนนาที `early_shift_window_minutes`
   - เช่น กะ 17:00 - 01:00 น. ตั้งล่วงหน้า 60 นาที ต้องเริ่มปรากฏให้เลือกได้ตั้งแต่เวลา 16:00 น.
2. **[[rule_lock_normal_hours_checkin]]**:
   - วัตถุประสงค์ของ `disable_normal_hours_checkin` คือ **ปิดรับการลงเวลาใน "เวลาราชการปกติ" (08:30 - 16:30 น.)**
   - ไม่ได้มีเจตนาปิดกั้นการลงเวลาของ **"ช่วงเวลาปฏิบัติงานนอกเวลา (OT)"** ที่ได้รับอนุญาตให้เริ่มเข้างานล่วงหน้า (Early Check-in)
3. **Root Cause Analysis (สาเหตุของปัญหาที่เกิดขึ้นที่เวลา 16:02 น.):**
   - เวลา 16:02 น. ยังอยู่ในช่วง 08:30 - 16:30 น. (`isWithinNormalHours = true`)
   - ใน `CheckinController.#updateStatusCardsAndMainButton`:
     - เมื่อ `disable_normal_hours_checkin && isWithinNormalHours` เป็นจริง ระบบสั่งซ่อน `#shiftSelectorContainer` และ Disable ปุ่มบันทึกเวลาหน้าหลักทันที โดยไม่ได้ตรวจสอบว่ามีกะนอกเวลาที่ Active อยู่ในขณะนั้นหรือไม่
   - ใน `CheckinController.#evaluateTimeWindowAndPopulateShifts`:
     - `mustUseOvertimeWindow` ถูกคำนวณจาก `nowMin < allowStartMin || nowMin > stdOutMin` (ก่อน 06:00 หรือ หลัง 16:30) ทำให้ที่เวลา 16:02 น. ไม่ถูกจัดเป็นหน้าต่างเวลา OT
   - ใน `CheckinController.#handleMainCheckin`:
     - มีการดัก `isWithinNormalHours` ตัดจบด้วย Alert โดยไม่ได้ยกเว้นกรณีที่ผู้ใช้เลือกลงเวลาเป็นกะนอกเวลา (`shiftObj.is_overtime`)
     - มีการคำนวณ `effectiveOvertimeShift` ผิดพลาดในโหมดปกติ ทำให้ข้อมูลกะนอกเวลาถูกทับเป็นเวลาราชการปกติ

