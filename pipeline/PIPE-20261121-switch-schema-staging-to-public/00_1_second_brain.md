# Phase 0.1 — Second Brain Retrieval (`PIPE-20261121-switch-schema-staging-to-public`)

- **Task ID**: `PIPE-20261121-switch-schema-staging-to-public`
- **Target Branch**: `Loca-V2`
- **Linked Flow IDs**: `FLOW_AUTH_01`, `FLOW_LAYOUT_01`, `FLOW_CHECKIN_01`, `FLOW_SETTINGS_01`, `FLOW_REPORTS_01`, `FLOW_APPROVALS_01`, `FLOW_TIME_CORRECTION_01`

## Relevant Second Brain Notes Retrieved
1. **`rule_loca_v2_onsite_offsite_nextstep_and_staging_schema.md`** — แยก Schema `staging` ผ่าน `Config.SUPABASE_SCHEMA` (Single-Point of Truth) และ `DatabaseService.getActiveSchema()`
2. **`ADR_0033_db_driven_system_announcement_tab7_and_v2_10_sync.md`** — เพิ่มคอลัมน์ประกาศระบบ 9 คอลัมน์ใน `system_settings` (`announcement_*`) และระบุว่า DDL (`ALTER TABLE`) ต้องรันใน Supabase SQL Editor ด้วยมือ
3. **`ADR_0039_Time_Correction_Request_And_Executive_RBAC.md`** — เพิ่มคอลัมน์ระบบขอแก้ไขเวลา 9 คอลัมน์ใน `attendance_logs` (`correction_*`), Foreign Key `correction_reviewed_by`, Partial Index และ Cache Sync ครบ **10 หน้า HTML** (`index.html`, `loading.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `time-corrections.html`, `reports.html`, `settings.html`, `personnel.html`, `users.html`)
4. **`rule_remote_version_hard_cache_purge_autostamp.md`** — ทุกครั้งที่แก้ไขไฟล์ Frontend (`assets/js/**`, `*.html`) ต้องรัน `node ./.ai_map/vscode_ast_mapper.mjs` เพื่อ Auto-stamp `buildId` ใหม่ใน `version.json` และ 10 หน้า HTML

## Past Pitfalls to Avoid (`past_pitfalls_to_avoid`)
- **ห้ามตั้ง `location_mode TEXT NOT NULL DEFAULT 'ONSITE'` และ `check_out_location_mode TEXT DEFAULT 'ONSITE'` ทับข้อมูลเก่า 691 แถวบน `public.attendance_logs`:** เพราะ `ReportsController.#resolveLocationMode` และ `ApprovalsController` จะเชื่อค่า `location_mode` จาก DB ก่อน หากบังคับเป็น `'ONSITE'` ข้อมูลนอกสถานที่ย้อนหลังใน `public` จะถูกแสดงเป็น `[ในสถานที่]` ผิดทั้งหมด ให้ใช้ `TEXT DEFAULT NULL` เพื่อให้ระบบคำนวณพิกัด Geofence/remark ย้อนหลังได้ถูกต้อง 100%
- **ห้ามใช้ `sql/alter_v2_8_loca_v2_schema.sql` แยกไฟล์เดียว:** เพราะขาด 9 คอลัมน์ของระบบ Time Correction (v2.11.0) ต้องรวมทุกคอลัมน์ที่ขาดจริงจาก Live Supabase (`system_settings` +13 คอลัมน์, `attendance_logs` +15 คอลัมน์) ไว้ในสคริปต์เดียวแบบ Idempotent
- **ตรวจสอบข้อความ Error ที่ยังอ้างชื่อไฟล์ `staging`:** พบใน `assets/js/models/AttendanceModel.js` L2708 (`sql/alter_v2_11_time_correction_staging.sql`) ต้องปรับให้สอดคล้องกับ Schema ปัจจุบัน
- **ระวังชื่อ Branch แบบ Case-Sensitive บน GitHub:** Branch จริงคือ `Loca-V2` (ตัว V ใหญ่) ไม่ใช่ `Loca-v2`
- **ต้องรัน `node ./.ai_map/vscode_ast_mapper.mjs` หลังแก้ JS:** เพื่อซิงก์ `version.json` และ 10 หน้า HTML
