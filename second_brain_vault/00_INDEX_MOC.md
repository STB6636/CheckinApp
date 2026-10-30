---
id: "sb_00_index_moc"
title: "Second Brain — Map of Content (MOC)"
type: "index"
last_updated_phase: "PIPE-20261026-enhance-approval-perm-checkin-overview"
---

# 🧠 Second Brain — Map of Content (v3.0)

> อ่านไฟล์นี้เป็นอันดับแรกเสมอ (`agent_07_second_brain` / `RETRIEVE`) แล้วติดตาม `[[Wiki-links]]` ไปยังโน้ตที่เกี่ยวข้อง
> ทุกครั้งที่สร้าง/อัปเดตโน้ต (`INGEST_AND_LINK`) ต้องเพิ่มลิงก์ในหมวดที่ถูกต้องด้านล่าง และเชื่อมโยงกับ `Flow ID` ใน `.ai_map/00_PROCESS_FLOW_MAP.md`

## 01 — Architecture Decisions (ADR)
- [[adr_001_vscode_surgical_codebase_map]] — ADR-001: ระบบสารบัญโค้ดอัตโนมัติและการเข้าถึงไฟล์แบบเจาะจงบรรทัด (VS Code Surgical Context & Codebase Mapping v3.0)
- [[adr_002_mobile_checkin_sticky_drawer]] — ADR-002: สถาปัตยกรรมหน้าลงเวลามือถือแบบ Zero-Scroll ด้วย Sticky Bottom Bar, Two-Tier Banner และ Hamburger History Drawer (Flow 1, 2, 4)
- [[adr_003_double_layer_rbac_hierarchy]] — ADR-003: สถาปัตยกรรม Double-Layer RBAC 3 ระดับ (SuperAdmin, Admin กอง, Admin ฝ่าย) ใน AuthService.js และ ReportsController.js (`FLOW_AUTH_01`, `FLOW_REPORTS_01`, `FLOW_USERS_01`)
- [[adr_004_checkin_viewport_lock_and_drawer]] — ADR-004: สถาปัตยกรรม Off-canvas Slide Drawer และ Zero-Scroll Viewport Lock บน checkin.html พร้อมการรักษา DOM IDs 98 จุด (`FLOW_CHECKIN_01`, `FLOW_LAYOUT_01`, `FLOW_SPECIAL_REQ_01`)

## 02 — Domain Logic & Rules
- [[rule_compact_action_buttons_and_approvals]] — Domain Rule: มาตรฐานปุ่มคำสั่งไอคอนเดี่ยว (Single-Action Icon Buttons w-8.5 h-8.5) ในตารางอนุมัติพิเศษ และการจัดรูปแบบตำแหน่ง+ระดับติดกัน (`FLOW_SPECIAL_REQ_01`, `FLOW_DASHBOARD_01`)
- [[rule_camera_portrait_3_4_aspect_ratio]] — Domain Rule: กฎและมาตรฐานการกำหนดขนาดกรอบกล้องแนวตั้ง 3:4 และการขยายเต็มการ์ดโมดอล (ขอบ ~2px-4px) บน checkin.html (`FLOW_PHOTO_01`, `FLOW_CHECKIN_01`)
- [[rule_desktop_zero_scroll_and_gps_layout]] — Domain Rule: กฎการจัดสัดส่วน Grid 4:8 และความสูง Zero-Scroll บนหน้าจอเดสก์ท็อป PC (`FLOW_LAYOUT_01`, `FLOW_GPS_01`)
- [[rule_shift_select_empty_and_soft_ui_alerts]] — Domain Rule: Dropdown กะว่างเริ่มต้น, การเลื่อนจอ Smooth Scroll และ SweetAlerts Soft UI Dashboard (`FLOW_CHECKIN_01`, `FLOW_LAYOUT_01`)
- [[rule_personal_attendance_history_limit_and_pagination]] — Domain Rule: การจำกัดข้อมูลประวัติการลงเวลาส่วนตัวย้อนหลัง 30 รายการ และระบบแบ่งหน้า [5, 10, 15, 20, 30] (`FLOW_CHECKIN_01`)
- [[rule_dual_gps_columns_and_jitter]] — Domain Rule: แยก 2 คอลัมน์พิกัด GPS เข้า-ออก, ระบบสุ่มระยะ GPS 20 ม. และการป้องกันตาราง Tag หาย (`FLOW_REPORTS_01`, `FLOW_GPS_01`, `FLOW_SPECIAL_REQ_01`)
- [[rule_line_and_no_camera_gallery_fallback]] — Domain Rule: ปุ่มชัตเตอร์บนกรอบกล้อง 3:4, ปุ่มเดียวอัจฉริยะ (LINE & No-Camera) และการกำหนดระยะสุ่ม GPS (`FLOW_PHOTO_01`, `FLOW_CHECKIN_01`, `FLOW_GPS_01`)
- [[rule_lock_normal_hours_checkin]] — Domain Rule: ปิดการลงเวลาหน้าหลักในเวลาราชการปกติ (08:30-16:30), ปิดปุ่มทั้งปกติและพิเศษครั้งเดียว และซ่อนตัวเลือกเวลาราชการปกติในโมดอลพิเศษ (`FLOW_CHECKIN_01`, `FLOW-020`)
- [[rule_soft_ui_dashboard_sweetalerts]] — Domain Rule: มาตรฐานการแจ้งเตือน SweetAlert2 สไตล์ Soft UI Dashboard (Creative Tim Tailwind) สำหรับ alert และ confirm (`FLOW_LAYOUT_01`)
- [[rule_special_request_custom_gps_and_jitter]] — Domain Rule: ระบบสุ่มระยะ GPS ขาออกงานแบบค้นหาจนกว่าจะได้ค่า และการปักหมุดแผนที่ในคำขอลงเวลากรณีพิเศษ (`FLOW_GPS_01`, `FLOW_SPECIAL_REQ_01`, `FLOW_CHECKIN_01`)
- [[rule_reports_hierarchical_org_filter]] — Domain Rule: ตัวกรองโครงสร้างองค์กรแบบลำดับชั้น 3 ระดับ ([สำนักงาน/กอง] > [ส่วน/ฝ่าย] > [กลุ่มงาน]) ในหน้ารายงานการลงเวลา (`FLOW_REPORTS_01`)
- [[rule_users_hierarchical_org_filter_and_grouping]] — Domain Rule: ตัวกรองโครงสร้างองค์กรแบบลำดับชั้น 3 ระดับและมุมมองจัดกลุ่ม 2 รูปแบบในหน้าจัดการบัญชีผู้ใช้งาน (`FLOW_USERS_01`, `FLOW_SETTINGS_01`)

- [[rule_early_shift_realtime_filter]] — Domain Rule: ระบบอนุญาตให้เริ่มเลือกทำงานก่อนเวลาเริ่มงานได้ (Early Shift Real-time Filter Window) พร้อมการตั้งค่านาทีล่วงหน้า (FLOW_SETTINGS_01, FLOW_CHECKIN_01)

- [[rule_hide_recorded_shifts_and_disable_btn]] — Domain Rule: ซ่อนช่วงเวลาที่ลงเวลาแล้ว และปิดปุ่มบันทึกเมื่อไม่มีตัวเลือกช่วงเวลา (FLOW_CHECKIN_01, FLOW_SETTINGS_01)
- [[rule_format_position_and_hide_non_level]] — Domain Rule: การจัดรูปแบบแสดงผลตำแหน่งและระดับ (ซ่อน 'ไม่มี', ซ่อนระดับผู้บริหาร, และเว้นวรรค 1 ช่องลูกจ้างประจำ) (`FLOW_ADMIN_DASHBOARD_01`, `FLOW_REPORTS_01`, `FLOW_APPROVALS_01`, `FLOW_USERS_01`, `FLOW_CHECKIN_01`)

## 03 — Bug Post-mortems & Fixes
- [[fix_v19_realtime_shift_filter_and_personnel_modal]] — Post-mortem V19: แก้ไข `filter_shifts_by_realtime` (Flow 3, 5, 11) และปรับปรุง Layout ฟอร์มประวัติบุคลากรไร้ข้อมูลซ้ำซ้อน (Flow 9)
- [[fix_v22_checkin_loading_hang_92_percent]] — Post-mortem V22: แก้ไขหน้าลงเวลาค้างที่ 92% จาก CDN Scripts และ DOM IDs ตกหล่นใน `checkin.html` (Flow 4, 6)
- [[fix_attendance_model_missing_position_level]] — Post-mortem: แก้ไข Root Cause คีย์ position_level ตกหล่นใน AttendanceModel และการจัดรูปแบบตำแหน่ง+ระดับติดกันใน DashboardController (`FLOW_DASHBOARD_01`, `FLOW_REPORTS_01`, `FLOW_SPECIAL_REQ_01`)

## 04 — Project Contexts
- [[checkinapp_project_context]] — CheckinApp (BMA Check-in App V2.1–V2.7): โครงสร้างโปรเจกต์, Supabase, GitHub Pages และดัชนีกระบวนการทำงานทั้ง 12 Flows (`FLOW_AUTH_01` – `FLOW_USERS_01`)
- [[doc_system_user_manuals_html]] — คู่มือการใช้งานระบบ CheckinApp แบบ Standalone HTML แยก 3 ระดับสิทธิ์ (User / Admin / SuperAdmin) ใน `docs/manual/`

## Codebase Map (`.ai_map/`)
- สารบัญกระบวนการทำงานและ Call Chain: `.ai_map/00_PROCESS_FLOW_MAP.md`
- สารบัญไฟล์และฟังก์ชันพร้อมเลขบรรทัด (30 ไฟล์ / 367 สัญลักษณ์): `.ai_map/01_FILE_FUNCTION_INDEX.md`
- ดัชนีโครงสร้างโค้ด JSON: `.ai_map/CODE_INDEX.json`
- สคริปต์สแกนอัตโนมัติ (0 AI Tokens): `.ai_map/vscode_ast_mapper.mjs`

## Skill Registry (`ai_skills_registry/`)
- ดัชนีสกิล: `ai_skills_registry/SKILL_CATALOG.json`
- [[vscode_surgical_codebase_mapping]] — VS Code Surgical Context & Automated AST Codebase Mapping (`v3.0.0`)
- [[client_side_hierarchical_rbac]] — Client-Side 3-Tier Granular Permission Gate Pattern (`v1.0.0`)
- [[offcanvas_drawer_race_free_tab_mounting]] — Zero-Scroll Viewport-Locked & Race-Free Mobile Slide Drawer Pattern (`v1.0.0`)
- [[civil_servant_position_level_formatter]] — Civil Service Position & Level String Normalizer Pattern (`v1.0.0`)
