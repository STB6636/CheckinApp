# สรุปผลส่งมอบงาน: ระบบประกาศระบบ (`v2.10.0`), แท็บตั้งค่า 7. ประกาศระบบ, SQL Staging/Public และคู่มือ

- **Task ID:** `PIPE-20261117-system-announcement-and-v2-10-sync`
- **วันที่ดำเนินการ:** 2026-11-17 (`17 พฤศจิกายน 2569`)
- **สาขา Git:** `Loca-V2` | **Schema เป้าหมาย:** `staging` *(พร้อมแก้ไขสคีมาสะสม `public`)*
- **App Version & Build ID:** `v2.10.0` (`20261117_d723e0d9` ซิงค์ครบทั้ง 9 หน้า HTML)
- **สถานะ QA Audit:** **`PASS`** *(ยังไม่ได้รัน `git push`)*

---

## 1. สิ่งที่พัฒนาและปรับปรุงครบทุกข้อ
1. **รายงานสิทธิ์ Supabase & ไฟล์ SQL Migration:**
   - **สถานะสิทธิ์ Supabase:** จากสภาพแวดล้อมนี้อ่าน (`SELECT`) และแก้แถวข้อมูล (`INSERT`/`UPDATE`/`UPSERT`) ผ่าน `ANON_KEY` **ได้** แต่คำสั่ง DDL (`ALTER TABLE`/`ADD COLUMN`/`NOTIFY pgrst`) **ทำไม่ได้ตรงจากเครื่อง** — จึงจัดทำไฟล์ SQL พร้อมรันใน Supabase SQL Editor:
     * [alter_v2_10_announcement_staging.sql](file:///f:/STB%20System/CheckinApp-UXUI/sql/alter_v2_10_announcement_staging.sql): เพิ่ม 9 คอลัมน์ประกาศระบบบน `staging.system_settings`, **Pre-seed เปิดใช้งานทันที** ด้วยหัวข้อ `แจ้งปรับปรุง ระบบลงเวลาปฏิบัติราชการ (สตบ.)` และเนื้อหา 4 ข้อตามสั่ง + `NOTIFY pgrst, 'reload schema';`
     * [alter_v2_8_loca_v2_schema.sql](file:///f:/STB%20System/CheckinApp-UXUI/sql/alter_v2_8_loca_v2_schema.sql) & [create_staging_schema.sql](file:///f:/STB%20System/CheckinApp-UXUI/sql/create_staging_schema.sql): แก้ไข Drift 5 จุดสำหรับ `public` (`offsite_job_types`, `special_request_reasons`, `check_out_location_mode`, `check_out_distance_from_official_meters`, และเอา `work_mode`/`check_out_work_mode` ที่ไม่ได้ใช้ออก) + เพิ่ม 9 คอลัมน์ประกาศระบบ
2. **ระบบประกาศจากฐานข้อมูล (แทนที่ `version.json` Auto-Popup):**
   - [SystemUpdateModal.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/components/SystemUpdateModal.js): ยกเลิกการเด้งอัตโนมัติจาก `version.json` เปลี่ยนมาแสดงประกาศจาก `system_settings` (เปิด/ปิด + ช่วงวันที่เวลาไทย `00:00–23:59` + นับการรับทราบ `bma_last_seen_announcement_id` ครั้งเดียวข้ามทั้ง `index.html` และ Session 7 วันใน [LoginController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/LoginController.js), [CheckinController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/CheckinController.js), และ [AppLayout.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/components/AppLayout.js))
   - รองรับโหมดข้อความ (`fa-bullhorn` + Head + Auto-formatted bullets & XSS-safe) และโหมดรูปภาพแทนตัวหนังสือ (`max-h-[70dvh]` แนวมือถือ + Fallback error box)
3. **แท็บใหม่ `7. ประกาศระบบ` & Google Drive Upload (`SPA-Safe`):**
   - [settings.html](file:///f:/STB%20System/CheckinApp-UXUI/settings.html) & [SettingsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/SettingsController.js): เพิ่มแท็บ 7, สวิตช์เปิด/ปิด, ช่วงวันที่, ตัวเลือกรูปแบบ `[เขียนข้อความเอง, อัปโหลดรูป]`, คำแนะนำขนาดภาพมือถือ `1080×1350 (4:5) / 1080×1920 (9:16)`, ฟิลด์โฟลเดอร์ Google Drive แยกเฉพาะ + ปุ่มตรวจสอบลิงก์เข้มงวด, Preview Modal (`body > #modalAnnouncementPreview`), และการอัปเดต `announcement_updated_at` เฉพาะเมื่อบันทึกแท็บ 7 (แท็บ 1–6 ไม่เขียนทับ)
   - [UIHelpers.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/core/UIHelpers.js) & [DriveUploadBridge.gs](file:///f:/STB%20System/CheckinApp-UXUI/google_apps_script/DriveUploadBridge.gs): เพิ่มโหมด `strictFolder: true` และแก้ Regex รองรับ PNG/WebP/SVG โดยคงความเข้ากันได้กับ Branch `main` 100%
   - [SettingsModel.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/models/SettingsModel.js) & [Config.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/core/Config.js): รองรับ `PGRST204` (`maxRetries = 25`), Fallback `category_colors._announcement` หากยังไม่ได้รัน SQL, และ Refresh `sessionStorage` เก่า
4. **อัปเดตเวอร์ชัน `v2.10.0`, `PRESERVE_KEYS` 9 หน้า, คู่มือ 4 ไฟล์ & Second Brain:**
   - [version.json](file:///f:/STB%20System/CheckinApp-UXUI/version.json) และ `9` หน้า HTML ซิงค์ `v2.10.0` / `20261117_d723e0d9` พร้อม `bma_last_seen_announcement_id` ใน `PRESERVE_KEYS`
   - อัปเดตคู่มือทั้ง 4 ไฟล์ใน `docs/manual/` (`index.html`, `manual-user.html`, `manual-admin.html`, `manual-superadmin.html` ครบ 7 แท็บ) เป็น `V2.10.0 (17 พฤศจิกายน 2569)` รวมถึง `README.md`, `AGENTS.md`, `skills`, และบันทึก [ADR_0033](file:///f:/STB%20System/CheckinApp-UXUI/second_brain_vault/02_Architecture_Decisions/ADR_0033_db_driven_system_announcement_tab7_and_v2_10_sync.md)

---

## 2. ขั้นตอนฝั่งผู้ดูแลระบบหลังรับงาน (1-Time Deployment Steps)
1. **รัน SQL บน Supabase Dashboard → SQL Editor (`staging`):** นำเนื้อหาใน [alter_v2_10_announcement_staging.sql](file:///f:/STB%20System/CheckinApp-UXUI/sql/alter_v2_10_announcement_staging.sql) ไปกด **Run**
2. **อัปเดต Google Apps Script (`script.google.com`):** นำโค้ดจาก [DriveUploadBridge.gs](file:///f:/STB%20System/CheckinApp-UXUI/google_apps_script/DriveUploadBridge.gs) ไปวางแล้วกด **Deploy → Manage deployments → Edit (✏️) → New version → Deploy** *(คง URL เดิมไว้เพื่อให้ Branch `main` และ `Loca-V2` ใช้ร่วมกันได้ทันที)*
3. หากตรวจสอบเรียบร้อยแล้วสามารถสั่ง `Push Branch Loca-V2 บน Github` ได้ทันทีครับ
