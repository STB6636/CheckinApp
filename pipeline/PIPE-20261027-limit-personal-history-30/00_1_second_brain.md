---
pipeline_id: "PIPE-20261027-limit-personal-history-30"
flow_ids:
  - "FLOW_CHECKIN_01"
---

# 00.1 Second Brain Context Retrieval

### Knowledge Vault References:
- `second_brain_vault/00_INDEX_MOC.md`: สารบัญสถาปัตยกรรมระบบ
- `second_brain_vault/adr_002_mobile_checkin_sticky_drawer.md`: การแสดงผลประวัติใน Drawer มือถือ และแท็บบน Desktop

### Architectural Constraints:
- แสดงข้อมูลประวัติการลงเวลาส่วนตัวย้อนหลังล่าสุดสูงสุด 30 รายการเท่านั้น (`.slice(0, 30)`)
- ตัวเลือกแสดงรายการต่อหน้าเพิ่มเป็น `[5, 10, 15, 20, 30]` รายการ
- ปุ่มย้อนกลับและถัดไป (Pagination) ทำงานได้อย่างถูกต้องตามจำนวนรายการและหน้าที่เลือก
- ไม่กระทบความสูงของหน้าจอหรือเกิด Scrollbar ผิดปกติ

