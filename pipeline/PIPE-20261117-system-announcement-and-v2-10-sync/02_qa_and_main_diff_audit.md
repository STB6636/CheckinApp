# รายงานการตรวจรับงานและประเมินผล Main-Diff (QA & Main-Diff Audit Report)

- **รหัสงาน (Task ID):** `PIPE-20261117-system-announcement-and-v2-10-sync`
- **ผู้ตรวจสอบ (Auditor):** `subagent_02_qa_auditor`
- **สาขา Git (Branch):** `Loca-V2` (Supabase target schema: `staging`)
- **เวอร์ชันเป้าหมาย:** `v2.10.0` (`17 พฤศจิกายน 2569`)
- **ผลการตรวจรับรวม (Verdict):** **`PASS`**

---

## 1. ผลการตรวจรับตามหมวดหมู่ (Audit Checklist & Evidence)

### 1.1 SQL & Schema Audit
- **`sql/alter_v2_10_announcement_staging.sql`:**
  - เพิ่มคอลัมน์ประกาศครบทั้ง 9 คอลัมน์ (`announcement_enabled`, `announcement_mode`, `announcement_start_date`, `announcement_end_date`, `announcement_title`, `announcement_body`, `announcement_image_url`, `announcement_drive_folder_id`, `announcement_updated_at`) ด้วย `ADD COLUMN IF NOT EXISTS`
  - Pre-seed แถว `id = 1` บน `staging.system_settings` ด้วย `announcement_enabled = true`, `announcement_mode = 'text'`, `announcement_start_date = '2026-11-17'`, `announcement_end_date = ''`, `announcement_title = 'แจ้งปรับปรุง ระบบลงเวลาปฏิบัติราชการ (สตบ.)'`, และข้อความทั้ง 4 รายการครบทุกตัวอักษร
  - คืนสิทธิ์ `GRANT ALL` บน Schema `staging` และปิดท้ายด้วย `NOTIFY pgrst, 'reload schema';`
- **`sql/alter_v2_8_loca_v2_schema.sql` & `sql/create_staging_schema.sql`:**
  - แก้ Drift ครบทั้ง 5 จุดใน `alter_v2_8_loca_v2_schema.sql`: เพิ่ม `offsite_job_types`, `special_request_reasons`, `check_out_location_mode`, `check_out_distance_from_official_meters` และตรวจค้นทั้ง `sql/*.sql` และ `assets/js/**/*.js` ไม่พบคอลัมน์ที่ไม่ได้ใช้อย่าง `work_mode` หรือ `check_out_work_mode`
  - ทั้ง `alter_v2_8_loca_v2_schema.sql` และ `create_staging_schema.sql` มีคอลัมน์ `announcement_*` ครบทั้ง 9 คอลัมน์ และลงท้ายด้วย `NOTIFY pgrst, 'reload schema';`

### 1.2 Google Apps Script & Upload Audit
- **`google_apps_script/DriveUploadBridge.gs`:**
  - `doPost` (`upload`) ใช้ Regex `/^data:image\/[a-zA-Z0-9+.-]+;base64,/` รองรับ PNG, JPG, WebP, SVG และ GIF
  - รองรับ `strictFolder` ทั้งใน `doGet` (`e.parameter.strictFolder === 'true'`) และ `doPost` (`payload.strictFolder === true`) โดยหากเปิด `strictFolder` แล้ว Folder ID ว่าง/สั้นกว่า 10 ตัวอักษร/เข้าถึงไม่ได้ จะโยน Error หรือคืน `{ success: false }` ทันทีโดย **ไม่** Fallback ไปที่ `BMA_Checkin_Photos`
  - เมื่อ `strictFolder` ไม่ได้ถูกส่งมา (ผู้เรียกเดิมบน `main` / หน้ากล้องลงเวลา) พฤติกรรม Fallback ไปที่ `BMA_Checkin_Photos` ยังคงเดิม 100%
- **`assets/js/core/UIHelpers.js`:**
  - `verifyGoogleDriveLink(scriptUrl, folderId, options)` และ `uploadPhotoToGoogleDrive(base64DataUrl, fileNamePrefix, settings, options)` รองรับ `options.folderId`, `options.fileName`, `options.mimeType`, `options.strictFolder` และแปลงนามสกุลไฟล์ตาม MIME Type (`png`, `webp`, `gif`, `svg`, `jpg`) โดยไม่กระทบ Caller หน้ากล้องเดิม

### 1.3 Announcement Logic, Models & SPA Safety Audit
- **`assets/js/components/SystemUpdateModal.js`:**
  - เลิก Auto-popup จาก `version.json` ใน `init()` (ป้าย `#loginVersionBadgeSlot` ยังคงคลิกดูประกาศที่เปิดอยู่หรือสรุปเวอร์ชัน `v2.10.0` ได้)
  - `isAnnouncementActive()` ตรวจ `announcement_enabled === true`, เนื้อหาตามโหมด (`text` หรือ `image`), และช่วงวันที่เวลาไทย `Asia/Bangkok` (`UTC+7`) แบบรวมวัน (`end_date` เว้นว่าง = ต่อเนื่อง, เว้นว่างทั้งคู่ = แสดงทันที)
  - `formatAnnouncementBodyHtml()` แปลง `- `, `• `, `* `, `1. ` เป็นการ์ดไฮไลต์และผ่าน `#escapeHtml()` ป้องกัน XSS
  - โหมด `image` แสดงภาพกรอบ Portrait (`max-h-[70dvh] object-contain`) แทนข้อความ พร้อม `#bmaAnnouncementImgErrorBox` Fallback เมื่อโหลดรูปไม่ได้
  - `close(true)` บันทึก `bma_last_seen_announcement_id` บนทุกช่องทางปิด (`#btnModalCloseTopX`, `#btnModalCloseBottomAck`, Backdrop click, `Escape` keydown) ยกเว้นเมื่อ `isPreview: true` และถอน `window` `keydown` listener ใน `close()`
- **`LoginController.js`, `CheckinController.js`, `AppLayout.js`:**
  - ตรวจสอบ `checkAndShowAnnouncement()` ทั้งบน `index.html` (`LoginController.init`) และเส้นทาง 7-day Auto-Login (`CheckinController.init` และ `AppLayout.initAdminLayout` พร้อม `#hasCheckedAnnouncement` guard กันเด้งซ้ำระหว่างสลับหน้า Admin SPA)
- **`assets/js/core/Config.js` & `assets/js/models/SettingsModel.js`:**
  - `DEFAULT_SETTINGS` และ `STORAGE_KEYS.LAST_SEEN_ANNOUNCEMENT` ครบ 9 ฟิลด์ประกาศ
  - `SettingsModel.updateSettings()` ตั้ง `maxRetries = 25` (>= 20) จัดการ `PGRST204` / `42703` โดยลบคอลัมน์ที่ยังไม่มีใน DB ทีละคอลัมน์และสำรองลง `category_colors._announcement` และ `SettingsModel.getSettings()` อ่าน `_announcement` fallback ได้อัตโนมัติเมื่อยังไม่ได้รัน SQL Migration
  - `SettingsModel.getSettings(false)` ตรวจ `typeof parsed.announcement_enabled === 'boolean'` เพื่อไม่ใช้แคชเก่าก่อน `v2.10.0`
- **`settings.html` & `assets/js/controllers/SettingsController.js`:**
  - เพิ่มแท็บที่ 7 (`7. ประกาศระบบ`, `#tab-panel-announcement`) พร้อม `<div id="modalAnnouncementPreview">` นอก `<main>` (`body > #modalAnnouncementPreview`) เพื่อรองรับ SPA Relocation ใน `AppLayout.js`
  - `#collectMainAndColorFieldsIntoSettings()` ไม่แตะต้องฟิลด์ `announcement_*` หรือ `announcement_updated_at` ทำให้การบันทึกแท็บ 1–6 ไม่เขียนทับประกาศและไม่ทำให้เด้งซ้ำ
  - `#saveAnnouncementTab()` อัปเดต `announcement_updated_at = new Date().toISOString()` เฉพาะเมื่อกดบันทึกแท็บ 7
  - `<main>` click listener ผูกแบบ Deduplicated (`mainEl.__bmaSettingsMainClickHandler`) ไม่รั่วไหลเมื่อสลับหน้า SPA

### 1.4 Version `v2.10.0`, Manuals & Repo Docs Audit
- **`version.json`:** `appVersion: "v2.10.0"`, `releaseNotes.releaseDate: "17 พฤศจิกายน 2569"`, `buildId: "20261117_d723e0d9"`
- **`docs/manual/{index,manual-user,manual-admin,manual-superadmin}.html`:** อัปเดตเป็น `V2.10.0` และ `17 พฤศจิกายน 2569` ครบทั้ง 4 ไฟล์; `manual-superadmin.html` มี Tab Simulator ครบ 7 แท็บ (`sim-panel-1` ถึง `sim-panel-7`) ตรง 1:1 กับปุ่มแท็บ
- **เอกสารและ Repo Metadata:** `README.md`, `AGENTS.md`, `AttendanceModel.js`, `UserModel.js`, `reports.html`, `.ai_map/00_PROCESS_FLOW_MAP.md`, `.ai_map/vscode_ast_mapper.mjs`, `ai_skills_registry/`, `second_brain_vault/` ซิงค์เวอร์ชัน `v2.10.0` และจำนวนไฟล์ HTML 9 หน้าเรียบร้อย

---

## 2. ผลการรัน Syntax Check และ Test Suites (`Deep Verification`)

### 2.1 Syntax Verification (`node --check` & Inline `<script>` VM Parse)
- **`node --check` ผ่านทั้งหมด 12/12 ไฟล์:**
  - `Config.js`, `UIHelpers.js`, `SettingsModel.js`, `AttendanceModel.js`, `UserModel.js`, `SystemUpdateModal.js`, `AppLayout.js`, `LoginController.js`, `CheckinController.js`, `SettingsController.js`, `.ai_map/vscode_ast_mapper.mjs`, `qa_v2_10_announcement_verification.mjs`
- **Inline `<script>` Parse (`vm.Script`) ผ่านทั้งหมด:**
  - `docs/manual/index.html` (2 blocks), `manual-user.html` (2 blocks), `manual-admin.html` (2 blocks), `manual-superadmin.html` (2 blocks), และ Root HTML ทั้ง 9 ไฟล์ (รวม `settings.html` redundant tab script) — **0 syntax errors**

### 2.2 Automated Verification Suites
1. `node pipeline/PIPE-20261117-system-announcement-and-v2-10-sync/qa_v2_10_announcement_verification.mjs` -> **20/20 PASS**
2. `node pipeline/PIPE-20261116-loading-entry-screen/qa_test_suite.mjs` -> **139/139 PASS**
3. `node pipeline/PIPE-20261116-loading-entry-screen/qa_runtime_deep_simulation.mjs` -> **40/40 PASS**
4. `node pipeline/PIPE-20261114-approvals-remark-two-line/qa_real_instance_test.mjs` -> **8/8 PASS**
5. `node pipeline/PIPE-20261113-split-dropdowns-and-special-request-official-locations/qa_split_dropdowns_verification.mjs` -> **8/8 PASS**
6. **Extra Adversarial Node Checks:** ตรวจการบันทึก `bma_last_seen_announcement_id` บนทุกช่องทางปิด (`btnX`, `btnAck`, `backdrop`, `Escape`) + ล้าง `keydown` listener และตรวจ Image Error Fallback (`#bmaAnnouncementModalImg` -> `#bmaAnnouncementImgErrorBox`) -> **PASS**

---

## 3. การตรวจสอบ Mandatory Cache Version Sync (9 HTML Pages)

- `version.json`: `buildId = "20261117_d723e0d9"`, `contentHash = "d723e0d941901a6392d52c741f873ddeef611c93986d1c378d41a2c4c9c0c8e8"`
- ตรวจสอบครบทั้ง 9 หน้า (`index.html`, `loading.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`):
  - `CURRENT_APP_BUILD = '20261117_d723e0d9'` ตรงกัน **9/9 หน้า**
  - Asset query string `?v=20261117_d723e0d9` ตรงกัน **100% (0 badAssets)**
  - `PRESERVE_KEYS` มีครบ 7 คีย์เหมือนกันทุกหน้า รวมถึง `'bma_last_seen_announcement_id'`

---

## 4. ขอบเขตการเปลี่ยนแปลง (Main-Diff & Working Tree Audit) & ข้อควรทราบ

- `git diff 6781d5e --stat` (37 files modified + `sql/alter_v2_10_announcement_staging.sql` + `pipeline/PIPE-20261117-.../`) อยู่ในขอบเขตงาน `v2.10.0` และไม่มีการแก้ไขที่ไม่เกี่ยวข้อง
- **Git Policy:** ไม่ได้รัน `git push`
- **สิ่งที่ต้องดำเนินการต่อโดยผู้ใช้ (Operational Steps):**
  1. นำ `sql/alter_v2_10_announcement_staging.sql` ไปรันใน Supabase SQL Editor เพื่อเพิ่ม 9 คอลัมน์และ pre-seed บน `staging`
  2. นำ `google_apps_script/DriveUploadBridge.gs` ไปอัปเดตและ **Deploy New Version** บน Google Apps Script (`script.google.com`) เพื่อให้ `strictFolder` และ MIME Regex ทำงานบน Production/Staging
