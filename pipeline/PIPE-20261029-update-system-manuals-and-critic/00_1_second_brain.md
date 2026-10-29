# Phase 0.1 — Second Brain Knowledge Retrieval
**Pipeline ID:** `PIPE-20261029-update-system-manuals-and-critic`
**Mode:** `PLAN`
**Linked Flows:** `FLOW_AUTH_01`, `FLOW_LAYOUT_01`, `FLOW_CHECKIN_01`, `FLOW_DASHBOARD_01`, `FLOW_REPORTS_01`, `FLOW_SPECIAL_REQ_01`, `FLOW_PERSONNEL_01`, `FLOW_SETTINGS_01`, `FLOW_USERS_01`

---

## 1. Retrieved Architecture Decisions & Domain Rules
1. **[[doc_system_user_manuals_html]]**:
   - เอกสารคู่มือระบบ Standalone HTML 4 ไฟล์ใน `docs/manual/` แยกตามบทบาท (`index.html`, `manual-user.html`, `manual-admin.html`, `manual-superadmin.html`)
   - ธีมสีราชการ กทม. (BMA Emerald `#00744B`, Sky `#0971CE`, Amber `#FFB449`, Purple `#480080`), Dark Mode ถนอมสายตา, และ Print-to-PDF
2. **[[rule_early_shift_realtime_filter]]** (Latest Rule on `TimeCheckin`):
   - การเปิดฟังก์ชัน Real-time Filter และเงื่อนไข "ทำงานก่อนเวลาเริ่มงานได้" ในช่วงเวลากะ
   - การตั้งค่า `เวลาเริ่มทำงานก่อนเวลาของช่วงเวลา (นาที)` ในแท็บ 1 ของ `settings.html`
   - การปรากฏของตัวเลือกกะใน Dropdown ก่อนเวลาเริ่มงานจริง
3. **[[rule_reports_hierarchical_org_filter]]**:
   - ตัวกรองโครงสร้างองค์กร 3 ระดับ ([สำนักงาน/กอง] > [ส่วน/ฝ่าย] > [กลุ่มงาน]) ในหน้ารายงาน
   - การเชื่อมโยงกับโครงสร้างสังกัดที่ตั้งค่าไว้ และการเลือกตามลำดับชั้นเสมอ
4. **[[rule_users_hierarchical_org_filter_and_grouping]]**:
   - ตัวกรองโครงสร้างองค์กร 3 ระดับในหน้าจัดการบัญชีผู้ใช้งาน
   - การเพิ่ม 2 มุมมองจัดกลุ่ม (Grouping Views) เหมือนในหน้าจัดการข้อมูลบุคลากร
5. **[[rule_lock_normal_hours_checkin]]**:
   - นโยบายปิดการลงเวลาหน้าหลักในช่วงเวลาราชการปกติ (08:30 - 16:30 น.)
6. **[[rule_dual_gps_columns_and_jitter]]**:
   - แยก 2 คอลัมน์พิกัด GPS ขาเข้า และ GPS ขาออก พร้อมระบบสุ่มระยะ GPS 20 เมตร

