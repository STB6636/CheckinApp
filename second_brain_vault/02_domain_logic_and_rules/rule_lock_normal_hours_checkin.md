# Domain Rule: ปิดการลงเวลาหน้าหลักในช่วงเวลาราชการปกติ (08:30 - 16:30 น.)

- **Flow ID:** `FLOW_CHECKIN_01` & `FLOW-020`
- **Related Settings:** `disable_normal_hours_checkin` (BOOLEAN in `system_settings`)
- **SQL Migration:**
  ```sql
  ALTER TABLE system_settings 
  ADD COLUMN IF NOT EXISTS disable_normal_hours_checkin BOOLEAN DEFAULT FALSE;
  ```

## Business Rules:
1. **การปิดรับเวลาหน้าหลัก (Main Check-in Screen):**
   - เมื่อ `settings.disable_normal_hours_checkin === true` และเวลาปัจจุบันอยู่ในช่วง `standard_check_in` ถึง `standard_check_out` (ค่ามาตรฐาน 08:30 - 16:30 น.):
     - ปุ่ม `#btnSubmitCheckinMain` จะถูกปิดกั้น (`disabled = true`, `opacity-50 pointer-events-none`)
     - แสดงข้อความในกล่องแจ้งเตือน `#regularCompletedNoticeBox`: "ขณะนี้อยู่ในช่วงเวลาราชการปกติ (08:30 - 16:30 น.) ระบบเปิดใช้งานฟังก์ชันปิดรับการลงเวลาในเวลาปกติ ไม่สามารถบันทึกลงเวลาได้"
     - ข้อบังคับนี้มีผลทั้ง **รูปแบบปกติ** และ **รูปแบบพิเศษ (Single-click)**
     - มี Guard ใน `#handleMainCheckin()` ดักหน้าก่อนส่งข้อมูลอีกชั้น

2. **การขอลงเวลากรณีพิเศษ (Special Check-in Modal):**
   - ผู้ใช้งานยังคงสามารถเปิดโมดอลและ **ยื่นคำขอลงเวลากรณีพิเศษได้ตามปกติ 24 ชั่วโมง** ไม่มีการปิดกั้น
   - หากเปิดใช้งาน `disable_normal_hours_checkin`:
     - ในตัวเลือกช่วงเวลาทำงาน (`#spShiftSelect`) จะทำการซ่อนตัวเลือก **"เวลาราชการปกติ"** ออกทั้งหมด
     - ทำให้ผู้ใช้สามารถเลือกและยื่นขอได้เฉพาะช่วงเวลาปฏิบัติงานนอกเวลา (Overtime) หรือกะพิเศษเท่านั้น
