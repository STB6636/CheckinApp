# รายงานการตรวจรับงานและประเมินผล Main-Diff (QA & Main-Diff Audit Report)

- **รหัสงาน (Pipeline ID):** `PIPE-20261117-move-announcement-drive-folder-to-tab1`
- **ผู้ตรวจสอบ (Auditor):** `subagent_02_qa_auditor`
- **สาขา Git (Branch):** `Loca-V2` (Baseline Commit: `70fbeaf`, Schema: `staging`, 40 commits ahead of `main`)
- **เวอร์ชัน / Build ID:** `v2.10.0` / `20261117_3f505c30`
- **ผลการตรวจรับรวม (Verdict):** **`PASS`**

---

## 1. ผลการตรวจรับโค้ดและ Surgical Manifest (`implementation_plan.md` & `00_3_surgical_manifest.json`)

### 1.1 [settings.html](file:///f:/STB%20System/CheckinApp-UXUI/settings.html)
- **แท็บ 1 (`#tab-panel-general`) → การ์ดซ้าย `"ข้อมูลหน่วยงาน และข้อความระบบ"` (`L224-L266`):**
  - ย้าย `#setAnnouncementDriveFolderId`, `#announcementFolderVerifyBadge`, และ `#btnVerifyAnnouncementFolder` มาวางต่อท้ายภายในกล่อง Google Drive ใต้ `#btnVerifyGDrive` คั่นด้วยเส้นแบ่ง `border-t` (`L248-L264`)
  - ปรับ label ของ `#setGDriveScriptUrl` เป็น `Google Apps Script Web App URL (ใช้ร่วมกันทั้งระบบ)` (`L236`), `#setGDriveFolderId` เป็น `Google Drive Folder ID (เก็บรูปถ่ายลงเวลา)` (`L240`) และคำอธิบายใต้ `#setAnnouncementDriveFolderId` อ้างอิง Web App URL ด้านบนและการบันทึกผ่านแท็บ 1 (`L263`)
- **แท็บ 7 (`#tab-panel-announcement`) → `#announcementPanelImage` (`L895-L910`):**
  - ลบฟิลด์กรอก Folder ID และปุ่มตรวจสอบชุดเดิมออกจากแท็บ 7 แล้ววางการ์ดสรุปสถานะแบบอ่านอย่างเดียว (`#tab7AnnouncementFolderHint`) พร้อมปุ่มลัด `[data-jump-tab="tab-panel-general"]` (`ไปตั้งค่าในแท็บ 1`) (`L902-L909`)
- **ตรวจสอบ DOM ID ซ้ำ:** สแกนทั้งไฟล์ `settings.html` พบ 117 IDs — **`duplicates = []` (0 รายการซ้ำ)**

### 1.2 [assets/js/controllers/SettingsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/SettingsController.js)
- **`#renderAllSettings()` (`L51-L78`):** เติมค่า `#setAnnouncementDriveFolderId` และเรียก `this.#syncAnnouncementDriveFolderUI()` คู่กับ `#setGDriveScriptUrl` / `#setGDriveFolderId`
- **`#syncAnnouncementDriveFolderUI()` (`L184-L226`):** อัปเดตทั้ง `#announcementFolderVerifyBadge` และ `#tab7AnnouncementFolderHint` จากค่า DOM ปัจจุบัน (หรือ fallback `this.settings`) พร้อม escape HTML ด้วย `UIHelpers.escapeHtml(...)`
- **`#activateSettingsTab()` & `#renderAnnouncementTab()` (`L228-L250`):** ซิงก์ `#setAnnouncementDriveFolderId` และ `#syncAnnouncementDriveFolderUI()` ก่อนตรวจ `#setAnnouncementEnabled` เพื่อรองรับ Partial DOM
- **`#readAnnouncementFormDraft()` (`L298-L315`):** อ่าน `#setAnnouncementDriveFolderId` พร้อม fallback ไป `this.settings?.announcement_drive_folder_id` เมื่อไม่มี node ใน DOM
- **`#collectMainAndColorFieldsIntoSettings()` (`L952-L1028`):**
  - เก็บ `this.settings.announcement_drive_folder_id = annFolderEl.value.trim()` (`L967-L968`)
  - **ยืนยันความถูกต้องของ Invariant:** คีย์ป๊อปอัปประกาศทั้ง 8 ตัว (`announcement_enabled`, `announcement_mode`, `announcement_start_date`, `announcement_end_date`, `announcement_title`, `announcement_body`, `announcement_image_url`, `announcement_updated_at`) **ไม่ปรากฏและไม่ถูกแก้ไข** ภายใน `#collectMainAndColorFieldsIntoSettings()`
- **Event Bindings (`L1274-L1405`):**
  - ผูก `[data-jump-tab]` ให้คลิกแท็บเป้าหมาย, fallback `this.#activateSettingsTab()`, `scrollIntoView({ behavior: 'smooth', block: 'center' })` และ `focus({ preventScroll: true })` ที่ `#setAnnouncementDriveFolderId` (`L1274-L1297`)
  - ผูก `input` listener บน `#setGDriveScriptUrl` และ `#setAnnouncementDriveFolderId` เพื่อซิงก์ `#announcementFolderVerifyBadge` + `#tab7AnnouncementFolderHint` แบบเรียลไทม์ (`L1299-L1304`)
  - `#btnVerifyAnnouncementFolder` ตรวจ `script.google.com` + `/exec` พร้อมข้อความชี้ `"ด้านบน"` (`L1349-L1352`) และเรียก `#syncAnnouncementDriveFolderUI({ verifiedFolderName | verifyFailed })` (`L1362-L1368`)
  - `#setAnnouncementImageFile` มี fallback ไป `this.settings.announcement_drive_folder_id`, ตรวจ `script.google.com` + `/exec`, และแจ้งเตือนให้ตั้งค่าใน `แท็บ 1 (ข้อมูลหน่วยงาน & ระบบ) > การ์ด "ข้อมูลหน่วยงาน และข้อความระบบ"` (`L1391-L1404`)

### 1.3 [assets/js/core/UIHelpers.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/core/UIHelpers.js)
- **`uploadPhotoToGoogleDrive` (`strictFolder` branch, `L436-L443`):** บังคับตรวจ `!scriptUrl || !scriptUrl.includes('script.google.com') || !scriptUrl.includes('/exec')` (`L437`) และปรับข้อความ error เมื่อ `cleanFolderId` ว่างให้ระบุ `"กรุณาระบุโฟลเดอร์ Google Drive เก็บรูปประกาศในแท็บ 1 ก่อนอัปโหลด"` (`L441`)

### 1.4 [docs/manual/manual-superadmin.html](file:///f:/STB%20System/CheckinApp-UXUI/docs/manual/manual-superadmin.html)
- ปรับเนื้อหา `#topic-1` (`L236`), `#sim-panel-1` (`L327-L355`, `L428`), `#sim-panel-7` (`L611-L617`), `#topic-2` (`L672`), `#topic-4` (`L916-L925`), และ `#topic-announcement` (`L1141, L1145`) ให้ตรงกับตำแหน่งใหม่ในแท็บ 1 + ปุ่มลัดจากแท็บ 7
- สแกนทั้งไฟล์พบ 39 IDs — **`duplicates = []`** และไม่พบ DOM ID จริงจาก `settings.html` (`setAnnouncementDriveFolderId`, `announcementFolderVerifyBadge`, `btnVerifyAnnouncementFolder`, `tab7AnnouncementFolderHint`, `setGDriveScriptUrl`, `setGDriveFolderId`) ซ้ำในคู่มือ
- ตรวจสอบโครงสร้าง Tag HTML ใน `settings.html` และ `docs/manual/manual-superadmin.html`: **`remainingStack = []`, `errors = []`** (ปิดแท็กครบสมบูรณ์)

### 1.5 ชุดทดสอบ (`qa_v2_10_announcement_verification.mjs` & `qa_tab1_announcement_folder_test.mjs`)
- **`qa_v2_10_announcement_verification.mjs` (`L571-L588`):** ปรับ assertion เฉพาะจุดที่เดิมห้าม `this.settings.announcement_` ทั้งหมด ให้ตรวจว่าต้องมี `this.settings.announcement_drive_folder_id` และต้องไม่มีคีย์ประกาศทั้ง 8 ตัวใน `collectBlock` (อีก 19 tests เดิมไม่ถูกอ่อนแอลง)
- **`qa_tab1_announcement_folder_test.mjs` (892 บรรทัด):** ใช้ real `settings.html` DOM + real ES modules (`UIHelpers`, `AppLayout`, `SettingsModel`, `SystemUpdateModal`, `SettingsController`) ทดสอบทั้งการจัดวาง DOM, การบันทึกแท็บ 1/แท็บ 2 โดยไม่เปลี่ยน `announcement_updated_at` หรือ token รับทราบประกาศ, `#btnVerifyAnnouncementFolder`, XSS escaping บน `#tab7AnnouncementFolderHint`, ปุ่มลัด `[data-jump-tab]`, partial DOM resilience, non-`/exec` guards, การอัปโหลดรูปแท็บ 7 จากโฟลเดอร์แท็บ 1, และ Cache Sync 9 HTML

---

## 2. ผลการรัน Syntax Check และ Test Suites (`Deep Verification`)

### 2.1 Syntax Check (`node --check`) — ผ่าน 6/6 ไฟล์
- `assets/js/controllers/SettingsController.js` -> Exit `0`
- `assets/js/core/UIHelpers.js` -> Exit `0`
- `pipeline/PIPE-20261117-system-announcement-and-v2-10-sync/qa_v2_10_announcement_verification.mjs` -> Exit `0`
- `pipeline/PIPE-20261117-move-announcement-drive-folder-to-tab1/qa_tab1_announcement_folder_test.mjs` -> Exit `0`
- `pipeline/PIPE-20261117-sidebar-active-state-and-realtime-settings-fix/qa_sidebar_active_sync_test.mjs` -> Exit `0`
- `.ai_map/vscode_ast_mapper.mjs` -> Exit `0`

### 2.2 Automated QA Suites (ผลลัพธ์จริงที่สังเกตได้)
1. `node pipeline/PIPE-20261117-system-announcement-and-v2-10-sync/qa_v2_10_announcement_verification.mjs`
   - Result: **`Total: 20 | Passed: 20 | Failed: 0`** (Exit `0`)
2. `node pipeline/PIPE-20261117-sidebar-active-state-and-realtime-settings-fix/qa_sidebar_active_sync_test.mjs`
   - Result: **`Summary: 8 passed, 0 failed`** (Exit `0`)
3. `node pipeline/PIPE-20261117-move-announcement-drive-folder-to-tab1/qa_tab1_announcement_folder_test.mjs`
   - Result: **`Total: 9 | Passed: 9 | Failed: 0`** (Exit `0`)
4. Additional Ad-Hoc Edge-Case Runtime Probes (5/5 ผ่าน: `ALL_EXTRA_PROBES_PASSED=true`):
   - `null` DB fields (`announcement_drive_folder_id: null`, `google_drive_script_url: null`) แสดงค่าว่างโดยไม่เกิด `"null"`
   - XSS payload ใน `verifiedFolderName` จาก Apps Script ถูก escape ก่อนใส่ใน `#tab7AnnouncementFolderHint`
   - ค่า `setGDriveScriptUrl` + `setAnnouncementDriveFolderId` ที่ยังไม่กดบันทึกในแท็บ 1 ถูกส่งต่อครบเมื่ออัปโหลดในแท็บ 7
   - การบันทึกผ่าน Modal แท็บ 3–6 (`#btnAddPrefix` / `formSettingsItem`) คงค่า `announcement_drive_folder_id` จากแท็บ 1 โดยไม่เปลี่ยน `announcement_updated_at`
   - การกด `#btnPreviewAnnouncement` ไม่เขียน ACK (`bma_last_seen_announcement_id`) และไม่เปลี่ยน `announcement_updated_at`

---

## 3. การตรวจสอบ Mandatory Cache Version Sync และ `.ai_map/`

- **`version.json`:**
  - `buildId`: `20261117_3f505c30`
  - `appVersion`: `v2.10.0`
  - `contentHash`: `3f505c3056f24537437afb1a5264bfc5c34d23a9acc90413d30893842340241b`
  - ตรวจคำนวณ SHA-256 Hash แบบ Normalized จากไฟล์ Frontend จริงบนดิสก์: **`computedHash === version.json.contentHash: true`**
- **9 Root HTML Pages** (`index.html`, `loading.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`):
  - `CURRENT_APP_BUILD === '20261117_3f505c30'` ตรงกัน **9/9 ไฟล์**
  - `assetRefs = 2`, `badAssets = []` (`?v=20261117_3f505c30`) ครบ **100% ทุกไฟล์**
- **`.ai_map/` Sync:**
  - `.ai_map/01_FILE_FUNCTION_INDEX.md` (`Last Indexed: 2026-11-17T10:46:47.711Z`, `180` files, `1113` symbols) และ `.ai_map/CODE_INDEX.json` ตรงกับ SHA-256 Hash ของไฟล์จริงบนดิสก์ครบทั้ง **`180/180` ไฟล์ (`hashMismatches = []`)** และไม่มี symbol/line-range คลาดเคลื่อนในไฟล์ที่แก้ไข (`settings.html` = `c7e0f0e93d4897c2`, `SettingsController.js` = `2d353ab81e86be84`, `UIHelpers.js` = `29b06e280c7d276f`, `manual-superadmin.html` = `6dbef44223ecb34f`)

---

## 4. การตรวจสอบขอบเขต Git Diff และไฟล์ต้องห้าม

- **`git status --short` (เทียบ Baseline `70fbeaf`):**
  - แก้ไขเฉพาะ 16 ไฟล์ที่อยู่ใน Scope (`settings.html`, `SettingsController.js`, `UIHelpers.js`, `docs/manual/manual-superadmin.html`, `qa_v2_10_announcement_verification.mjs`, `version.json`, 8 ไฟล์ Root HTML ที่เหลือจาก Cache Sync, `.ai_map/01_FILE_FUNCTION_INDEX.md`, `.ai_map/CODE_INDEX.json`) + เพิ่มโฟลเดอร์ `pipeline/PIPE-20261117-move-announcement-drive-folder-to-tab1/` (`qa_tab1_announcement_folder_test.mjs` และรายงานฉบับนี้)
- **Non-Target Files Check (`git diff -- ...` เทียบ `70fbeaf`):**
  - `SettingsModel.js`, `SystemUpdateModal.js`, `AppLayout.js`, `CheckinController.js`, `LoginController.js`, `LoadingController.js`, `sql/*` — **ไม่มีการแก้ไข (0 diff, Exit `0`)**
- **`git diff --check`:** ผ่าน (ไม่มี conflict markers หรือ trailing whitespace errors)
- **`git diff main --stat`:** แสดงผลต่างสะสมของสาขา `Loca-V2` เทียบ `main` (40 commits ahead); เมื่อกรองดู 13 ไฟล์ใน Scope (`git diff main --stat -- ...`) สอดคล้องกับประวัติสาขา `Loca-V2` และการย้ายฟิลด์รอบนี้
- **Git Policy:** ไม่มีการรัน `git commit` หรือ `git push`

---

## 5. สิ่งที่ยังไม่ได้ทดสอบจริง (Unverified Aspects)

- การทดสอบทั้ง 3 ชุดรันใน Node.js ESM โดยจำลอง `window`, `document`, `fetch` และ Supabase Client (ไม่ได้เปิดเบราว์เซอร์จริงหรือเชื่อม Google Apps Script Web App `/exec` และ Supabase `staging` จริงแบบ End-to-End เพื่อตรวจ layout responsiveness บนหน้าจอมือถือ/เดสก์ท็อปจริงและการโฟกัส/เลื่อนหน้าจอหลังกด `ไปตั้งค่าในแท็บ 1`)
