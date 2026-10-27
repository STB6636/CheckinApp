---
pipeline_id: "PIPE-20261027-dual-gps-columns-and-jitter"
flow_ids:
  - "FLOW_REPORTS_01"
  - "FLOW_SETTINGS_01"
  - "FLOW_CHECKIN_01"
  - "FLOW_GPS_01"
---

# 00.1 Second Brain Context Retrieval

### Knowledge Vault References:
- `second_brain_vault/00_INDEX_MOC.md`: ดัชนีสถาปัตยกรรมระบบ
- `second_brain_vault/02_domain_logic_and_rules/rule_desktop_zero_scroll_and_gps_layout.md`: กฎ Zero-Scroll และการจัด Layout พิกัด GPS
- `second_brain_vault/rule_shift_select_empty_and_soft_ui_alerts.md`: กฎการแสดงผลและแจ้งเตือน

### Architectural Constraints:
1. หน้ารายงานการลงเวลา (`reports.html` & `ReportsController.js`):
   - แยกคอลัมน์ "พิกัด GPS เข้างาน" และ "พิกัด GPS ออกงาน" ในตารางรายงานสถานะทุกตาราง
   - ปรับ `colSpan` ให้ถูกต้องเพื่อป้องกันข้อผิดพลาดตารางไม่แสดงเมื่อคลิกเลือก TAG
   - ในกรณีลงเวลารูปแบบพิเศษ (Single-click / OT / ขอลงเวลาพิเศษ) ข้อมูลรูปและสถานที่จะใช้ชุดเดียว แต่แยกแสดงผลเหมือนรูปแบบปกติ
2. ฟอร์มแสดงโปรไฟล์ข้อมูล (Resume Modal):
   - เพิ่มข้อมูลรูปถ่ายหลังออกงาน และพิกัด GPS ออกงาน
   - จัด Layout ให้สวยงาม กระชับ ความสูงไม่เกินหน้าจอเนื้อหา vh (Zero-Scroll บน PC)
3. ฟังก์ชันสุ่มระยะ GPS (Randomized GPS Jitter ในรัศมี 20 เมตร):
   - ใช้กับการลงเวลารูปแบบพิเศษ โดยสุ่มพิกัดขาออกในรัศมี 20 เมตร เพื่อให้พิกัดเข้าและออกไม่ซ้ำกัน
   - สามารถเปิด/ปิดได้ในเมนูตั้งค่าระบบ (`settings.html`)

