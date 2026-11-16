# รายงานการตรวจรับงานและประเมินผล Main-Diff (QA & Main-Diff Audit Report)

- **รหัสงาน (Task ID):** `PIPE-20261116-loading-settings-logo-fix` (ต่อยอดจาก `PIPE-20261116-loading-entry-screen`)
- **ผู้ตรวจสอบ (Auditor):** `subagent_02_qa_auditor` (Flash 3.8 High)
- **สาขา Git (Branch):** `Loca-V2`
- **เป้าหมายงาน:** ปรับปรุงหน้าโหลดเข้าระบบแยกไฟล์ (`loading.html` + `LoadingController.js`) ให้ใช้ตราโลโก้จริงจากตั้งค่าระบบ (`system_settings.logo_url` = `https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc`) แสดงผลเต็มดวง Intact ไม่ผ่าครึ่ง ไร้ Shimmer เปล่า ไร้ตรา กทม./Wikimedia ปลอม, มี 2-tier cache hydration (`localStorage` + `sessionStorage`), offline fallback (`fa-landmark`), และ Mandatory Cache Version Sync ครบทั้ง 9 ไฟล์ HTML
- **ผลการตรวจรับรวม (Verdict):** **`PASS`** (สมบูรณ์ 100% ปราศจาก Breaking Change และ Zero Unrelated Modifications)

---

## 1. ผลการตรวจ Syntax & Functional Checks (`Deep Verification`)

### 1.1 Node.js Syntax Verification (`node --check`)
- `assets/js/controllers/LoadingController.js`: **PASS** (Syntax valid ES Module)
- `assets/js/controllers/LoginController.js`: **PASS** (Syntax valid ES Module)
- `assets/js/controllers/SettingsController.js`: **PASS** (Syntax valid ES Module)
- `.ai_map/vscode_ast_mapper.mjs`: **PASS** (Syntax valid Node script)
- `pipeline/PIPE-20261116-loading-entry-screen/qa_test_suite.mjs`: **PASS**
- `pipeline/PIPE-20261116-loading-entry-screen/qa_runtime_deep_simulation.mjs`: **PASS**

### 1.2 Dedicated Test Suite Execution (`qa_test_suite.mjs`)
- **ผลรวม:** 139/139 การทดสอบ **ผ่านทั้งหมด 100% (Passed: 139 | Failed: 0)**
  - Group 1: Cache Version & `buildId` Sync across all 9 HTML files: ผ่าน 65 การตรวจสอบ (ทุกไฟล์ตรงกับ `20261116_ea0302f2` พร้อม 6-key PRESERVE_KEYS)
  - Group 2: `loading.html` UI & Single Intact Civic Logo Stage & 0ms Hydration: ผ่าน 17 การตรวจสอบ
    * Zero hardcoded `pr-bangkok.com`, `wikimedia.org`, CSS `--logo-*` vars, หรือ split-half clipping
    * `<img id="ldOrgLogo">` มี `src="https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc"` ทันทีตั้งแต่ 0ms
    * `#ldLogoFallback` ใช้ `fa-landmark` และซ่อนเป็นค่าเริ่มต้น (แสดงเฉพาะบน `onerror`)
    * สคริปต์ `@supabase/supabase-js@2` ถูกเลื่อนลงท้าย `<body>` ก่อน `LoadingController.js` ไม่บล็อก first paint
    * ข้อความเริ่มต้นบน HTML ตรงกับ DB ปัจจุบัน (`สำนักเทศกิจ`, `สำนักงานตรวจและบังคับการ`, `ระบบลงเวลาปฏิบัติราชการ (สตบ.สนท.)`) ป้องกัน Text FOUC บนมือถือช้า
  - Group 3: `LoadingController.js` Lifecycle, Safe Sanitization & Watchdog: ผ่าน 26 การตรวจสอบ
    * กำหนดค่าคงที่ `OFFICIAL_SETTINGS_LOGO = 'https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc'`
    * ไม่บันทึก `bmaLogoUrl` ลง Brand Cache
    * อ่าน `sessionStorage[Config.STORAGE_KEYS.CACHED_SETTINGS]` เป็น Fallback
    * ดักจับพารามิเตอร์ `?entry=` ก่อน URL Masking ของ `UIHelpers.initTheme()`
    * รอ Cache Purge สูงสุด 1.5s
    * Promise.allSettled Timeout: Settings 3,000ms และ DB Session 2,500ms
    * Minimum Smooth Display Floor บังคับ ~750ms
    * Watchdog Failsafe 12s ปลดล็อกปุ่มกู้คืน
  - Group 4: `index.html` Fast-Path & Cross-Controller Brand Cache Sync: ผ่าน 6 การตรวจสอบ
    * `LoginController.#loadOrganizationBranding()` และ `SettingsController.#persistSettings()` ซิงค์แบรนด์ล่าสุดลง `localStorage.bma_cached_brand_v2_7`
  - Group 5: `vscode_ast_mapper.mjs` & Core Modules Untouched Verification: ผ่าน 5 การตรวจสอบ

### 1.3 Deep Runtime Simulation & Edge Case Testing (`qa_runtime_deep_simulation.mjs`)
- **ผลรวม:** 40/40 การทดสอบ **ผ่านทั้งหมด 100% (Passed: 40 | Failed: 0)**
  - **Logo Sanitization & Malicious URL Rejection:** ป้องกัน CSS Injection และ Bypass ด้วย RegEx Protocol Sanitizer `^(?:https?:\/\/[^\s'"()<>]+|data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)$`
  - **Google Drive URL Normalization & Domain Whitelisting:** โดเมนของ Google Drive (`drive.google.com`, `docs.google.com`, `lh3.googleusercontent.com`) ถูก rewrite เป็น Direct Thumbnail Link (`https://lh3.googleusercontent.com/d/<id>`) ได้อย่างถูกต้อง ส่วน URL ทั่วไปที่ไม่ใช่ Google Drive จะคงเดิม ไม่ถูก mangling
  - **2-Tier Brand Cache Hydration:**
    * Hydrate ได้ทั้งจาก `localStorage.bma_cached_brand_v2_7` และ Fallback `sessionStorage.bma_checkin_cached_settings_v2_7`
    * Legacy payload ที่ขาด `logoUrl` จะดึงค่าจาก session storage เติมเต็มได้อัตโนมัติ
  - **Error Fallback Robustness (`onerror`):**
    * เมื่อภาพโหลดไม่ขึ้นจริง สลับไปแสดง `#ldLogoFallback` (`fa-landmark`) ทันที
    * เมื่อภาพเดิมที่แสดงอยู่แล้วถูก re-render ซ้ำ จะไม่รบกวน DOM หรือ override สถานะ error ให้กระพริบ
    * เมื่อแอดมินเปลี่ยน URL รูปใหม่ที่ถูกต้อง จะรีเซ็ต fallback และโหลดรูปใหม่ทันที
  - **Scenario 1 Cold Visit:** ไม่มีการ Redirect และไม่เพิ่ม Class `bma-session-redirecting` ฟอร์ม Login แสดงผลปกติ
  - **Scenario 2 Post-Login:** เด้งเข้า `loading.html?entry=login` ทันทีโดยไม่ต้องรอ Toast 2 วินาทีบน `index.html`
  - **Scenario 3 Active 7-Day Session:** เติม Class `bma-session-redirecting` ทันทีตั้งแต่ใน `<head>` ซ่อน Body 100% ป้องกัน FOUC แล้ว Redirect เข้า `loading.html?entry=session`
  - **Target URL Self-Redirect Loop Guard:** Controller ไม่ redirect เข้าหา `loading.html` ซ้ำ โดยจะ fallback ไปยัง `checkin.html` หรือ `dashboard.html` ตามสิทธิ์บทบาททันที
  - **Purge Race Guard & Preservation:** เมื่อมี App Update ค่า `bma_cached_brand_v2_7` ถูกล้างเพื่อรีเฟรชข้อมูลใหม่ ในขณะที่ 6 คีย์สำคัญคงเดิม
  - **URL Masking Safety:** `UIHelpers.KNOWN_PAGES_REGEX` ไม่ดักจับ `loading.html` จึงไม่ทับ `VIEW_PAGE_STORAGE_KEY` ของผู้ใช้

---

## 2. การตรวจสอบ Mandatory Cache Version Sync

- **ไฟล์ `version.json`:**
  - `buildId`: `20261116_ea0302f2`
  - `contentHash`: `ea0302f2e8c9364f5f2c7505be529ef9a65c438a5f645de0110baf4312348c91`
- **ไฟล์ HTML ทั้ง 9 หน้า:**
  - `index.html`: `CURRENT_APP_BUILD = '20261116_ea0302f2'`, Asset `?v=20261116_ea0302f2`
  - `loading.html`: `CURRENT_APP_BUILD = '20261116_ea0302f2'`, Asset `?v=20261116_ea0302f2`
  - `checkin.html`: `CURRENT_APP_BUILD = '20261116_ea0302f2'`, Asset `?v=20261116_ea0302f2`
  - `dashboard.html`: `CURRENT_APP_BUILD = '20261116_ea0302f2'`, Asset `?v=20261116_ea0302f2`
  - `approvals.html`: `CURRENT_APP_BUILD = '20261116_ea0302f2'`, Asset `?v=20261116_ea0302f2`
  - `reports.html`: `CURRENT_APP_BUILD = '20261116_ea0302f2'`, Asset `?v=20261116_ea0302f2`
  - `personnel.html`: `CURRENT_APP_BUILD = '20261116_ea0302f2'`, Asset `?v=20261116_ea0302f2`
  - `settings.html`: `CURRENT_APP_BUILD = '20261116_ea0302f2'`, Asset `?v=20261116_ea0302f2`
  - `users.html`: `CURRENT_APP_BUILD = '20261116_ea0302f2'`, Asset `?v=20261116_ea0302f2`
- **สถานะ:** **ตรงกัน 100% ทุกหน้า (100% Cache Version Synchronized)**

---

## 3. การตรวจสอบ Main-Diff & ความปลอดภัยของโค้ดหลัก (`Scope Audit`)

1. **Core Modules ที่คงสภาพเดิม 100% (Untouched Invariant):**
   - `assets/js/core/AuthService.js`: คงเดิม 100%
   - `assets/js/core/UIHelpers.js`: คงเดิม 100%
   - `assets/js/core/Config.js`: คงเดิม 100%
   - `assets/js/models/SettingsModel.js`: คงเดิม 100%
   - `assets/js/components/AppLayout.js`: คงเดิม 100%
   - `assets/js/controllers/CheckinController.js`: คงเดิม 100%
   - `sql/*`: คงเดิม 100%
2. **ไฟล์ที่มีการปรับปรุงเฉพาะจุด (`Strict Surgical Scope`):**
   - `loading.html`: ปรับโครงสร้าง Logo Stage ให้แสดงตราจริงเต็มดวงตั้งแต่ 0ms, ลบ URL/CSS แฟลชปลอม, ปรับ 0ms hydration 2 ชั้น, เลื่อน `@supabase/supabase-js`
   - `assets/js/controllers/LoadingController.js`: ลบค่าคงที่เก่า, กำหนด `OFFICIAL_SETTINGS_LOGO`, เพิ่ม 2-tier cache fallback, sanitizer, render guard
   - `assets/js/controllers/LoginController.js`: เพิ่มการซิงค์ `localStorage.bma_cached_brand_v2_7` ใน `#loadOrganizationBranding()`
   - `assets/js/controllers/SettingsController.js`: เพิ่มการซิงค์ `localStorage.bma_cached_brand_v2_7` ใน `#persistSettings()`
   - `second_brain_vault/02_Architecture_Decisions/ADR_0032_standalone_boot_loading_screen_and_3d_dual_logo_flip.md`: อัปเดตสถาปัตยกรรมตราโลโก้จริง
3. **การรักษา Invariants บน `index.html`:**
   - `#loginVersionBadgeSlot` ภายในหัวการ์ดยังคงอยู่ครบถ้วน
   - `SystemUpdateModal.init({ targetBadgeSlot: '#loginVersionBadgeSlot' })` ยังถูกเรียกใน `LoginController.init()` ตามเดิม
   - Modal สำหรับการเปลี่ยนรหัสผ่าน (`#modalChangePassword`, `#modalForgotPassword`) ยังคงอยู่ครบถ้วน
4. **Git Push Rule:**
   - **ยืนยัน: ไม่มีการรันคำสั่ง `git push` ใดๆ ทั้งสิ้น ตามข้อกำหนดความปลอดภัยของระบบ**
