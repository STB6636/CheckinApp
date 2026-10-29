# Phase 0.1 — Second Brain Knowledge Retrieval
**Pipeline ID:** `PIPE-20261029-update-manual-ot-early-window-coexistence`
**Mode:** `PLAN`
**Linked Flows:** `FLOW_SETTINGS_01`, `FLOW_CHECKIN_01`

---

## 1. Retrieved Architecture Decisions & Domain Rules
1. **[[rule_early_shift_realtime_filter]] (Section 6: การทำงานร่วมกับนโยบายปิดการลงเวลาในเวลาปกติ):**
   - เมื่อเปิดใช้งาน `disable_normal_hours_checkin` ควบคู่กับ Real-time Filter และเวลาปัจจุบันอยู่ในช่วง 08:30 - 16:30 น. (เช่น 16:02 น.)
   - หากมีกะนอกเวลา (OT) ที่อนุญาตให้เริ่มเข้างานล่วงหน้าและ Active อยู่ (เช่น กะ 17:00 น. ล่วงหน้า 60 นาที เริ่ม 16:00 น.) ระบบจะไม่ซ่อนกล่องเลือกกะ แต่จะแสดง Dropdown ให้เลือกเฉพาะกะนอกเวลาที่ Active ในขณะนั้น
   - การลงเวลาราชการปกติจะถูกปิดตามนโยบาย แต่ผู้ใช้สามารถกดบันทึกเวลาของกะนอกเวลาที่เลือกได้อย่างถูกต้อง และระบบจะบันทึกประเภทเป็น `is_overtime_shift`
2. **[[rule_lock_normal_hours_checkin]]**:
   - นโยบายปิดลงเวลาราชการปกติมีผลเฉพาะกะปกติ (08:30 - 16:30 น.) ไม่ปิดกั้นกะนอกเวลา (OT) ที่เจ้าหน้าที่ต้องปฏิบัติงานล่วงหน้า
3. **[[doc_system_user_manuals_html]]**:
   - อัปเดตคู่มือทั้ง 4 ไฟล์ใน `docs/manual/` ให้สอดคล้องกัน โดยเฉพาะการยกตัวอย่างจริงที่เวลา 16:02 น. เพื่อให้ผู้ใช้งานและผู้ดูแลระบบเข้าใจตรงกันในครั้งเดียว

