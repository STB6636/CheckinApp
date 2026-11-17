# ADR 0035: Relocating System Announcement Google Drive Folder to Tab 1 with Save Persistence & Popup State Invariance

- **Date**: 2026-11-17
- **Status**: Accepted & Verified (`Build ID: 20261117_3f505c30`, `App Version: v2.10.0`)
- **Task ID**: `PIPE-20261117-move-announcement-drive-folder-to-tab1`
- **Linked Flows**: `FLOW_SETTINGS_01`, `FLOW_AUTH_01`, `FLOW_LAYOUT_01`
- **Active Supabase Schema**: `staging` (Zero DB schema edits)

---

## Context & Problem Statement
Previously (introduced in `ADR_0033`), `#setAnnouncementDriveFolderId`, `#announcementFolderVerifyBadge`, and `#btnVerifyAnnouncementFolder` lived inside Tab 7 (`#tab-panel-announcement` → `#announcementPanelImage`) while relying on `#setGDriveScriptUrl` (the shared Google Apps Script Web App URL) configured in Tab 1 (`#tab-panel-general` → Card `"ข้อมูลหน่วยงาน และข้อความระบบ"`). Keeping the Apps Script URL and Check-in Photo Folder ID in Tab 1 while placing the Announcement Image Folder ID in Tab 7 split related Google Drive settings across tabs and left Tab 1's Left Card visibly shorter than its Right Card.

Relocating the Announcement Folder input directly into Tab 1 (`#tab-panel-general` → Card `"ข้อมูลหน่วยงาน และข้อความระบบ"`) introduced two subtle engineering requirements:
1. `#collectMainAndColorFieldsIntoSettings()` (`SettingsController.js`) intentionally avoided all `announcement_*` keys so Tabs 1–6 saves would never overwrite announcement content or bump `announcement_updated_at` (which re-triggers dismissed update popups for all users). Once `#setAnnouncementDriveFolderId` lives in Tab 1, failing to collect `announcement_drive_folder_id` during `#btnSaveMainSettings` would silently discard user edits and revert to the cached DB value on re-render — while touching `announcement_updated_at` would unwantedly re-open modals.
2. `#syncAnnouncementDriveFolderUI()`, `#btnVerifyAnnouncementFolder`, `#setAnnouncementImageFile`, and `UIHelpers.uploadPhotoToGoogleDrive(..., { strictFolder: true })` needed consistent `script.google.com` + `/exec` validation, unique DOM IDs (no duplicate input/badge IDs in Tab 7 or `docs/manual/manual-superadmin.html`), and clean jump-back navigation (`[data-jump-tab="tab-panel-general"]` with `{ preventScroll: true }` after smooth scroll).

---

## Decision & Implementation
1. **[settings.html](file:///f:/STB%20System/CheckinApp-UXUI/settings.html)**:
   - **Tab 1 (`#tab-panel-general`, `L224-L266`)**: Moved `#setAnnouncementDriveFolderId`, `#announcementFolderVerifyBadge`, and `#btnVerifyAnnouncementFolder` cleanly below `#btnVerifyGDrive` inside the existing Google Drive sub-card of `"ข้อมูลหน่วยงาน และข้อความระบบ"`, separated by `border-t`, with clarified labels (`Google Apps Script Web App URL (ใช้ร่วมกันทั้งระบบ)` and `Google Drive Folder ID (เก็บรูปถ่ายลงเวลา)`).
   - **Tab 7 (`#tab-panel-announcement` → `#announcementPanelImage`, `L895-L910`)**: Removed the duplicate folder form controls and inserted a compact read-only status box `#tab7AnnouncementFolderHint` plus shortcut button `[data-jump-tab="tab-panel-general"]` (`ไปตั้งค่าในแท็บ 1`). Verified 0 duplicate IDs (`117` unique IDs).
2. **[SettingsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/SettingsController.js)**:
   - `#renderAllSettings()` (`L51-L78`) populates `#setAnnouncementDriveFolderId` and invokes `#syncAnnouncementDriveFolderUI()` (`L184-L226`), which updates both `#announcementFolderVerifyBadge` and escaped `#tab7AnnouncementFolderHint` HTML.
   - `#renderAnnouncementTab()` (`L246-L250`) syncs `#setAnnouncementDriveFolderId` and `#syncAnnouncementDriveFolderUI()` prior to checking `#setAnnouncementEnabled` for partial DOM safety.
   - `#collectMainAndColorFieldsIntoSettings()` (`L952-L1028`) collects **only** `this.settings.announcement_drive_folder_id = annFolderEl.value.trim()` (`L967-L968`) while strictly leaving all 8 popup announcement fields (`announcement_enabled`, `announcement_mode`, `announcement_start_date`, `announcement_end_date`, `announcement_title`, `announcement_body`, `announcement_image_url`, `announcement_updated_at`) untouched.
   - Added live `input` listeners (`L1299-L1304`) on `#setGDriveScriptUrl` and `#setAnnouncementDriveFolderId`, wired `[data-jump-tab]` (`L1274-L1297`) with smooth scroll + `focus({ preventScroll: true })`, and aligned `script.google.com` + `/exec` validation & Tab 1 error guidance on `#btnVerifyAnnouncementFolder` (`L1343-L1369`) and `#setAnnouncementImageFile` (`L1375-L1405`).
3. **[UIHelpers.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/core/UIHelpers.js#L436-L443)**:
   - Updated `uploadPhotoToGoogleDrive` `strictFolder` branch to enforce `!scriptUrl.includes('/exec')` (`L437`) and clarify `'กรุณาระบุโฟลเดอร์ Google Drive เก็บรูปประกาศในแท็บ 1 ก่อนอัปโหลด'` (`L441`).
4. **[docs/manual/manual-superadmin.html](file:///f:/STB%20System/CheckinApp-UXUI/docs/manual/manual-superadmin.html)**:
   - Updated interactive simulators (`#sim-panel-1`, `#sim-panel-7`) and manual topics (`#topic-1`, `#topic-2`, `#topic-4`, `#topic-announcement`) with `39` unique IDs and zero collisions with `settings.html`.

---

## Verification
- `node --check` passed cleanly (`0` errors) on modified JS/MJS files.
- [qa_v2_10_announcement_verification.mjs](file:///f:/STB%20System/CheckinApp-UXUI/pipeline/PIPE-20261117-system-announcement-and-v2-10-sync/qa_v2_10_announcement_verification.mjs): **20 / 20 PASSED** (`L571-L588` updated to permit `announcement_drive_folder_id` in `#collectMainAndColorFieldsIntoSettings()` while strictly prohibiting the 8 popup fields).
- [qa_sidebar_active_sync_test.mjs](file:///f:/STB%20System/CheckinApp-UXUI/pipeline/PIPE-20261117-sidebar-active-state-and-realtime-settings-fix/qa_sidebar_active_sync_test.mjs): **8 / 8 PASSED**.
- [qa_tab1_announcement_folder_test.mjs](file:///f:/STB%20System/CheckinApp-UXUI/pipeline/PIPE-20261117-move-announcement-drive-folder-to-tab1/qa_tab1_announcement_folder_test.mjs): **9 / 9 PASSED**.
- Cache Version Sync verified via `node ./.ai_map/vscode_ast_mapper.mjs` at `buildId: 20261117_3f505c30` (`appVersion: v2.10.0`) across `version.json` and all 9 root HTML pages (`180` files / `1,113` AST symbols).
