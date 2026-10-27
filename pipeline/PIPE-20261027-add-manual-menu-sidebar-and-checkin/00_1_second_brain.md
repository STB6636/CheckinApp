---
pipeline_id: "PIPE-20261027-add-manual-menu-sidebar-and-checkin"
flow_ids:
  - "FLOW_LAYOUT_01"
  - "FLOW_CHECKIN_01"
---

# 00.1 Second Brain Context Retrieval

### Knowledge Vault References:
- `second_brain_vault/doc_system_user_manuals_html.md`: เอกสารคู่มือ 4 ไฟล์ Standalone HTML ใน `docs/manual/`
- `second_brain_vault/adr_002_mobile_checkin_sticky_drawer.md`: โครงสร้าง Mobile Drawer & Viewport ของ Checkin
- `second_brain_vault/adr_003_double_layer_rbac_hierarchy.md`: ระดับสิทธิ์และการแสดงผลเมนู

### Architectural Constraints:
1. การเพิ่มเมนูใน Sidebar ของ `AppLayout.js` ต้องอยู่ระหว่างรายการเมนูหลักและปุ่ม "ไปหน้าลงเวลาปฏิบัติราชการ" แสดงทั้ง SuperAdmin และ Admin
2. ใน `checkin.html`:
   - มุมมอง PC/Tablet: เป็นปุ่มแท็บต่อท้ายแท็บ "ประวัติการขอลงเวลากรณีพิเศษ"
   - มุมมอง Mobile: นำปุ่ม "คู่มือ" มาแสดงบน Top Header แทนปุ่ม "ระบบผู้ดูแล" (เนื่องจากปุ่มระบบผู้ดูแลมีอยู่ในแฮมเบอร์เกอร์เมนูแล้ว)
3. ต้องไม่กระทบความสูงของหน้าจอ PC หรือทำให้เกิด Scrollbar โดยไม่จำเป็น

