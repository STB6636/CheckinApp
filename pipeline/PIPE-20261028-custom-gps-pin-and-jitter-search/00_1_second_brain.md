# Second Brain Retrieval — PIPE-20261028-custom-gps-pin-and-jitter-search

- **Flow ID:** `FLOW_GPS_01` & `FLOW_SPECIAL_REQ_01`
- **Topic:** ระบบสุ่มระยะ GPS ขาออกพร้อมค้นหาสถานที่จนกว่าจะได้ค่า + ระบบเลือกพิกัด GPS เอง (ค้นหา/พิมพ์พิกัด/ลากหมุดแผนที่สไตล์ LINE) ในคำขอลงเวลากรณีพิเศษ
- **Relevant Existing Vault Files:**
  - `second_brain_vault/02_domain_logic_and_rules/rule_dual_gps_columns_and_jitter.md`
  - `second_brain_vault/02_domain_logic_and_rules/rule_desktop_zero_scroll_and_gps_layout.md`
- **Domain Logic to Ingest:**
  1. **ระบบสุ่มระยะ GPS ขาออกงาน (Jitter Location Resolution Loop):**
     - เมธอด `AttendanceModel.resolveJitteredCheckoutWithLocation(baseLat, baseLng, radiusMeters, maxAttempts)` ทำการสุ่มพิกัดและเรียก `resolveLocationWithZoomMeta` วนซ้ำ (สูงสุด 3-4 รอบ) จนกระทั่งได้ชื่อสถานที่หรือซอยที่ถูกต้อง ไม่เป็นค่าว่างหรือ "ไม่ระบุสถานที่"
  2. **คำขอลงเวลากรณีพิเศษ (Special Request GPS Selection):**
     - ผู้ใช้สามารถสลับเลือก:
       - (1) พิกัด GPS ปัจจุบัน (จากอุปกรณ์)
       - (2) กำหนดพิกัดเอง (ค้นหาชื่อสถานที่, ระบุพิกัดโดยตรง, หรือลากหมุดบนแผนที่ Leaflet คล้าย LINE location picker)
     - พิกัดที่เลือกนี้จะใช้เป็นพิกัดเข้างาน (`lat`, `lng`, `location_name`) และนำไปเป็นพิกัดตั้งต้นสำหรับการสุ่มพิกัดขาออกงาน (`out_lat`, `out_lng`, `checkout_location_name`) ตามการตั้งค่าระบบ

