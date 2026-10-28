# Second Brain Retrieval — PIPE-20261028-block-normal-hours-checkin

- **Flow ID:** `FLOW_CHECKIN_01` & `FLOW-020`
- **Topic:** ปิดรับการลงเวลาหน้าหลักในช่วงเวลาราชการปกติ (08:30 - 16:30 น.) ทั้งรูปแบบปกติและรูปแบบพิเศษ และซ่อนตัวเลือก "เวลาราชการปกติ" ในโมดอลขอลงเวลากรณีพิเศษ (โดยโมดอลยังยื่นคำขอได้ตลอดเวลา)
- **Domain Logic to Ingest:**
  - เมื่อ `settings.disable_normal_hours_checkin === true`:
    1. ในช่วงเวลา `standard_check_in` ถึง `standard_check_out` (เช่น 08:30 - 16:30 น.):
       - ปุ่มบันทึกการลงเวลาหน้าหลัก `#btnSubmitCheckinMain` ถูกปิดกั้น (`disabled = true`, แสดงป้ายเตือนปิดรับการลงเวลาในเวลาปกติ)
       - บังคับใช้ทั้งโหมดลงเวลาปกติ (Check-in/Check-out) และโหมดลงเวลารูปแบบพิเศษครั้งเดียว (Single-click)
    2. หน้าต่างโมดอลขอลงเวลากรณีพิเศษ (`#formSpecialRequest`):
       - **ยังสามารถยื่นคำขอได้ตามปกติ ตลอดเวลา (24 ชม.)** ไม่มีการบล็อกการส่งคำขอ
       - แต่ตัวเลือก **"เวลาราชการปกติ"** ใน Dropdown `#spShiftSelect` จะถูกซ่อนออก เพื่อให้เลือกยื่นได้เฉพาะผลัดนอกเวลา (Overtime) เท่านั้น
    3. คำสั่ง Supabase SQL:
       - `ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS disable_normal_hours_checkin BOOLEAN DEFAULT FALSE;`
