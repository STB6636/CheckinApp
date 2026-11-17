# สรุปผลการส่งมอบงาน (`PIPE-20261117-move-announcement-drive-folder-to-tab1`)

- **Pipeline ID:** `PIPE-20261117-move-announcement-drive-folder-to-tab1`
- **Branch / Schema:** `Loca-V2` (Base Commit: `70fbeaf`, Schema: `staging`)
- **App Version / Build ID:** `v2.10.0` / `20261117_3f505c30`
- **สถานะ QA Audit:** `PASS` ([02_qa_and_main_diff_audit.md](file:///f:/STB%20System/CheckinApp-UXUI/pipeline/PIPE-20261117-move-announcement-drive-folder-to-tab1/02_qa_and_main_diff_audit.md))
- **Second Brain ADR:** [ADR_0035_tab1_announcement_drive_folder_relocation_and_sync_invariance.md](file:///f:/STB%20System/CheckinApp-UXUI/second_brain_vault/02_Architecture_Decisions/ADR_0035_tab1_announcement_drive_folder_relocation_and_sync_invariance.md)

## สรุปการเปลี่ยนแปลงตามขอบเขตแผน

1. **[settings.html](file:///f:/STB%20System/CheckinApp-UXUI/settings.html):**
   - ย้าย `#setAnnouncementDriveFolderId`, `#announcementFolderVerifyBadge` และ `#btnVerifyAnnouncementFolder` เข้าไปใน **แท็บ 1 (`#tab-panel-general`) → การ์ดซ้าย `"ข้อมูลหน่วยงาน และข้อความระบบ"` → บล็อก Google Drive** (`L224-L266`) ใต้ `#btnVerifyGDrive` พร้อมปรับป้าย `#setGDriveScriptUrl` (`ใช้ร่วมกันทั้งระบบ`) และ `#setGDriveFolderId` (`เก็บรูปถ่ายลงเวลา`) ให้ชัดเจน
   - แทนที่ช่องกรอกเดิมใน **แท็บ 7 (`#tab-panel-announcement` → `#announcementPanelImage`)** (`L895-L910`) ด้วยการ์ดสถานะแบบอ่านอย่างเดียว `#tab7AnnouncementFolderHint` และปุ่มลัด `ไปตั้งค่าในแท็บ 1` (`[data-jump-tab="tab-panel-general"]`) โดยไม่มี DOM ID ซ้ำ (`117` IDs ไม่ซ้ำ)
2. **[SettingsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/SettingsController.js):**
   - `#renderAllSettings()` และ `#renderAnnouncementTab()` เติมค่า `#setAnnouncementDriveFolderId` และซิงก์ `#announcementFolderVerifyBadge` + `#tab7AnnouncementFolderHint` (`#syncAnnouncementDriveFolderUI()`).
   - `#collectMainAndColorFieldsIntoSettings()` เก็บ `this.settings.announcement_drive_folder_id` ตอนกดบันทึกแท็บ 1 โดยคงกฎไม่แตะต้องอีก 8 คีย์ป๊อปอัปประกาศและ `announcement_updated_at` เพื่อให้ป๊อปอัปประกาศไม่เด้งซ้ำหาผู้ใช้
   - ผูกปุ่มลัด `[data-jump-tab]` (`scrollIntoView({ behavior: 'smooth', block: 'center' })` + `focus({ preventScroll: true })`), ซิงก์ live input ทั้ง `#setGDriveScriptUrl` และ `#setAnnouncementDriveFolderId`, และบังคับตรวจ `script.google.com` + `/exec` พร้อมปรับข้อความแจ้งเตือนใน `#btnVerifyAnnouncementFolder` และ `#setAnnouncementImageFile`.
3. **[UIHelpers.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/core/UIHelpers.js):**
   - `uploadPhotoToGoogleDrive` (`strictFolder`) ตรวจ `!/exec` และปรับข้อความ error เมื่อไม่มีโฟลเดอร์ประกาศให้ระบุว่าต้องตั้งค่าในแท็บ 1 (`L436-L443`).
4. **[manual-superadmin.html](file:///f:/STB%20System/CheckinApp-UXUI/docs/manual/manual-superadmin.html):**
   - ปรับคู่มือและหน้าจอจำลอง (`#sim-panel-1`, `#sim-panel-7`, `#topic-1`, `#topic-2`, `#topic-4`, `#topic-announcement`) ให้ตรงตาม UI ใหม่ (`39` IDs ไม่ซ้ำกับ `settings.html`).
5. **QA Suites & Cache Version Sync:**
   - ปรับ assertion ใน [qa_v2_10_announcement_verification.mjs](file:///f:/STB%20System/CheckinApp-UXUI/pipeline/PIPE-20261117-system-announcement-and-v2-10-sync/qa_v2_10_announcement_verification.mjs) และเพิ่ม [qa_tab1_announcement_folder_test.mjs](file:///f:/STB%20System/CheckinApp-UXUI/pipeline/PIPE-20261117-move-announcement-drive-folder-to-tab1/qa_tab1_announcement_folder_test.mjs).
   - รัน `node ./.ai_map/vscode_ast_mapper.mjs` ซิงก์ `buildId: 20261117_3f505c30` ลง `version.json`, ไฟล์ HTML หลักทั้ง 9 หน้า และ `.ai_map/`.
