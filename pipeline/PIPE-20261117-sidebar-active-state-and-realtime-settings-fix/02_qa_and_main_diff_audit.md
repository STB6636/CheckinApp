# รายงานการตรวจรับงานและประเมินผล Main-Diff (QA & Main-Diff Audit Report)

- **รหัสงาน (Task ID):** `PIPE-20261117-sidebar-active-state-and-realtime-settings-fix`
- **ผู้ตรวจสอบ (Auditor):** `subagent_02_qa_auditor`
- **สาขา Git (Branch):** `Loca-V2` (Supabase target schema: `staging`)
- **เวอร์ชัน / Build ID:** `v2.10.0` / `20261117_e60fdbe3`
- **ผลการตรวจรับรวม (Verdict):** **`PASS`**

---

## 1. ผลการตรวจรับโค้ดและ Diff ตามแผน (`implementation_plan.md` & `00_3_surgical_manifest.json`)

### 1.1 [assets/js/components/AppLayout.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/components/AppLayout.js)
- **Authoritative Static State (`L18, L21`):** เพิ่ม `static #isSettingsListenerBound = false;` และ `static #currentActivePage = 'dashboard';`
- **ซิงก์ `#currentActivePage` (`L104, L170`):** อัปเดต `AppLayout.#currentActivePage = activePage || AppLayout.#currentActivePage;` ทั้งใน `initAdminLayout()` และต้น `#updateActiveNavState()`
- **`#renderSidebar()` (`L443-L459`):**
  - ใส่คลาส `.active` บน `<a data-nav-id="...">` เมื่อ `isActive` เป็นจริง ตรงกับ `#updateActiveNavState()` (`L184`)
  - กู้คืนตัวเลขและสถานะแสดงผลของ `#sidebarSpecialBadge` และ `#sidebarResetBadge` จาก `AppLayout.#lastPendingSpecialCount` / `#lastPendingResetCount` (`> 0`) ทันทีที่ re-render
- **Listener `bma:settings-updated` (`L117-L135`):**
  - ป้องกันการผูกซ้ำด้วย `AppLayout.#isSettingsListenerBound`
  - ทำงานแบบ Synchronous, กรองคีย์ที่มีค่า `undefined` ออกจาก `e.detail` ก่อน Merge เข้า `AppLayout.#settings || Config.DEFAULT_SETTINGS`
  - อ่าน `currentActive` จาก `AppLayout.#currentActivePage || document.querySelector('#bmaSidebarDrawer a.active')?.dataset?.navId || activePage` (ไม่ตกกลับไป `'dashboard'` จาก Stale Closure)
  - ใช้ `activeUser = AppLayout.#currentUser || currentUser`, อัปเดต `#renderSidebar`, `#renderMobileBottomNav`, และ `#renderFooter`, และ **นำ `AppLayout.refreshNotificationBell(currentUser)` ออก** เพื่อตัดวงจร Circular Re-entrancy
- **Upstream Emitters ทั้ง 3 จุด (`L685-L711, L861-L889, L895-L911`):**
  - `refreshNotificationBell`: บันทึก `AppLayout.#lastSettingsWatermark = watermark.settingsSignature` **ก่อน** `await`/Dispatch, ลบ `CACHED_SETTINGS`, และเรียก `await SettingsModel.getSettings(true)` พร้อม `try/catch` Fallback แบบ Safe Merge
  - `postgres_changes` (`system_settings`) และ `broadcast` (`settings_updated`): เลิกเขียน Raw Payload ลง `sessionStorage[CACHED_SETTINGS]` โดยตรง เปลี่ยนเป็นลบ `CACHED_SETTINGS` แล้ว Hydrate ผ่าน `await SettingsModel.getSettings(true)` พร้อม `try/catch` Safe Merge Fallback ก่อน Dispatch `bma:settings-updated` และ `bma:realtime-delta-sync`

### 1.2 [assets/js/controllers/ApprovalsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/ApprovalsController.js)
- **DOMContentLoaded Guard (`L538-L545`):** เพิ่ม `if (!window.__BMA_SPA_ROUTER_ACTIVE__) { window.__BMA_SPA_ROUTER_ACTIVE__ = true; ... }` ตรงตามรูปแบบของอีก 5 Admin Controllers ป้องกัน Double Instantiation เมื่อเปิด `approvals.html` ตรงแล้วสลับหน้าแบบ SPA

### 1.3 [assets/js/controllers/SettingsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/SettingsController.js)
- **`#renderAllSettings()` vs `#bindEvents()` (`L90-L93, L104-L108, L150-L176, L1173-L1181`):** แยก `#syncEarlyWindowVisibility()` และ `#syncRadiusVisibility()` ออกมา และย้ายการผูก `change` listener ของ `#toggleFilterShiftsByRealtime` และ `#toggleRandomizeGpsCheckout` จาก `#renderAllSettings()` ไปผูกครั้งเดียวใน `#bindEvents()` โดยคงการอัปเดต UI state ใน `#renderAllSettings()` ไม่สะสม Listener ซ้ำเมื่อกดบันทึกหลายครั้ง

---

## 2. ผลการรัน Syntax Check และ Test Suites (`Deep Verification`)

### 2.1 Syntax Check (`node --check`) — ผ่าน 5/5 ไฟล์
- `assets/js/components/AppLayout.js` -> PASS
- `assets/js/controllers/ApprovalsController.js` -> PASS
- `assets/js/controllers/SettingsController.js` -> PASS
- `.ai_map/vscode_ast_mapper.mjs` -> PASS
- `pipeline/PIPE-20261117-sidebar-active-state-and-realtime-settings-fix/qa_sidebar_active_sync_test.mjs` -> PASS

### 2.2 Automated QA & Regression Suites
1. `node pipeline/PIPE-20261117-sidebar-active-state-and-realtime-settings-fix/qa_sidebar_active_sync_test.mjs` -> **8/8 PASS** (0 failed)
   - ทดสอบ real ES modules ครอบคลุม SPA navigation 6 หน้า Admin, บันทึก Tab 7 & Tabs 1–6, Watermark poll change, `postgres_changes` & `broadcast` (รวม network failure fallback), `ApprovalsController` `__BMA_SPA_ROUTER_ACTIVE__` guard, `SettingsController` single-bind checkbox listeners, explicit-`undefined` payload resilience, และ E2E `AppLayout.navigateAjaxPage('settings.html')` กับ `settings.html` จริงบนดิสก์
2. `node pipeline/PIPE-20261117-system-announcement-and-v2-10-sync/qa_v2_10_announcement_verification.mjs` -> **20/20 PASS**
3. `node pipeline/PIPE-20261116-loading-entry-screen/qa_test_suite.mjs` -> **139/139 PASS**
4. `node pipeline/PIPE-20261116-loading-entry-screen/qa_runtime_deep_simulation.mjs` -> **40/40 PASS**
5. `node pipeline/PIPE-20261114-approvals-remark-two-line/qa_real_instance_test.mjs` -> **8/8 PASS**
6. `node pipeline/PIPE-20261113-split-dropdowns-and-special-request-official-locations/qa_split_dropdowns_verification.mjs` -> **8/8 PASS**

---

## 3. การตรวจสอบ Mandatory Cache Version Sync (9 HTML Pages)

- **`version.json`:** `buildId = "20261117_e60fdbe3"`, `contentHash = "e60fdbe3bb2015d6f3267a47f0948bf4e8f63f6574c5e81851ad4b63422dd4f1"`
- **ตรวจสอบทั้ง 9 หน้า HTML** (`index.html`, `loading.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`):
  - `CURRENT_APP_BUILD === '20261117_e60fdbe3'` ตรงกัน **9/9 หน้า**
  - Asset query string `?v=20261117_e60fdbe3` ตรงกัน **100%** (2 assets ต่อหน้า, `badAssets = []` ทุกหน้า)
  - ตรวจ `git diff` ของ HTML ทั้ง 9 ไฟล์ยืนยันว่าแก้ไขเฉพาะ `CURRENT_APP_BUILD` และ `?v=` เท่านั้น

---

## 4. ขอบเขตการเปลี่ยนแปลง (Scope & Git Policy Check)

- **`git status --short` / `git diff --stat` (Working Tree):**
  - แก้ไขเฉพาะ `AppLayout.js`, `ApprovalsController.js`, `SettingsController.js`, `version.json`, 9 ไฟล์ HTML (auto-stamp `?v=` / `CURRENT_APP_BUILD`), `.ai_map/01_FILE_FUNCTION_INDEX.md`, `.ai_map/CODE_INDEX.json`, และเพิ่ม `pipeline/PIPE-20261117-sidebar-active-state-and-realtime-settings-fix/qa_sidebar_active_sync_test.mjs` + รายงานฉบับนี้
  - ไฟล์ต้องห้ามตาม Manifest (`SettingsModel.js`, `SystemUpdateModal.js`, `AuthService.js`, `Config.js`, `sql/*`, และเนื้อหา HTML ใน `settings.html` / `loading.html`) ไม่ถูกแก้ไขใน Working Tree
- **`git diff main --stat`:** แสดงขอบเขตสะสมของสาขา `Loca-V2` เทียบ `main` ตามประวัติ Commit ก่อนหน้า (`2caa556` และก่อนหน้า) ไม่มีไฟล์นอกเหนือที่ระบุ
- **Git Policy:** ยังไม่ได้รัน `git commit` หรือ `git push` (Working tree สะอาดตามสิทธิ์)

---

## 5. ข้อจำกัดที่ไม่ได้ทดสอบ (Unverified Aspects & Minor Risks)

- **Unverified in Real Browser / Live Staging DB:** การทดสอบรันใน Node.js ESM พร้อม Mock DOM/Supabase (`fetch`, `DOMParser`, `supabase`) ยังไม่ได้เปิดทดสอบในเบราว์เซอร์จริงต่อกับ Supabase `staging` WebSocket จริง
- **Minor Robustness Risk (Pre-existing in `SettingsModel.getSettings`):** หาก Supabase คืน `{ data: null, error }` โดยไม่ Throw `SettingsModel.getSettings(true)` จะคืน `Config.DEFAULT_SETTINGS` ตามพฤติกรรมเดิม (ปลอดภัยไม่เกิด `"undefined"`) และหาก Mobile Sidebar Drawer เปิดค้างอยู่ขณะที่ `bma:settings-updated` ทำงาน `#renderSidebar()` จะปิด Drawer (`-translate-x-full`) ตาม Template เดิม
