# Phase 0.1 — Second Brain Knowledge Retrieval
**Pipeline ID:** `PIPE-20261029-hide-recorded-shifts`
**Mode:** `PLAN`
**Linked Flows:** `FLOW_CHECKIN_01`, `FLOW_CHECKIN_02`, `FLOW_SETTINGS_01`

---

## 1. Retrieved Architecture Decisions & Domain Rules
1. **[[rule_early_shift_realtime_filter]]**:
   - การคำนวณช่วงเวลา Active ของกะตามเวลาจริงและเวลาเริ่มงานล่วงหน้า
2. **[[rule_shift_select_empty_and_soft_ui_alerts]]**:
   - การควบคุม Dropdown กะ และการแจ้งเตือนเมื่อยังไม่ได้เลือกช่วงเวลาก่อนบันทึก
3. **ข้อกำหนดใหม่ (New Domain Rule to Ingest in Phase 6):**
   - **One-time Shift Selection per Day Cycle (กะที่ลงเวลาแล้วจะถูกซ่อน):**
     - หากผู้ใช้บันทึกลงเวลากะ A (เช่น เวลาราชการปกติ หรือ ปฏิบัติงานนอกเวลา) เรียบร้อยแล้วในวันนี้ กะ A จะหายไปจากตัวเลือก Dropdown
     - หากไม่มีตัวเลือกช่วงเวลาเหลืออยู่เลย (หรือกะทั้งหมดในรอบวันถูกบันทึกครบแล้ว) ปุ่มบันทึกลงเวลาปฏิบัติงานหน้าหลักจะถูกปิดการทำงาน (Disabled) และแสดงข้อความชี้แจง

