# สรุปผลส่งมอบงาน: ปรับปรุงโลโก้หน้าโหลดเข้าระบบเป็นรูปจริงจากตั้งค่าระบบ (`system_settings.logo_url`)

- **Task ID:** `PIPE-20261116-loading-settings-logo-fix`
- **วันที่ดำเนินการ:** 2026-11-16
- **สาขา Git (Branch):** `Loca-V2` (Schema: `staging` — ไม่มีการแก้ไขสคีมาฐานข้อมูลและไม่มีการ `git push`)
- **Build ID ล่าสุด (`version.json`):** `20261116_ea0302f2` (ซิงค์ครบทั้ง 9 หน้า HTML)
- **สถานะ QA Audit:** **`PASS`**

---

## 1. สิ่งที่ปรับปรุงแก้ไขเฉพาะจุด (`Strict Surgical Scope`)
1. **[loading.html](file:///f:/STB%20System/CheckinApp-UXUI/loading.html):**
   - ลบโลโก้ฮาร์ดโค้ด (`pr-bangkok.com`, `wikimedia.org`), CSS `--logo-bma*` / `--logo-dept*`, dual `background-image`, และ `@keyframes logo-flip` ผ่าครึ่งออกทั้งหมด
   - ใช้แท็ก `<img id="ldOrgLogo" src="https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc">` แสดงโลโก้จริงจากตั้งค่าระบบแบบเต็มดวงตั้งแต่ 0ms ทุกเส้นทาง URL ในกรอบ Civic Orbital Halo (`.halo-ring`) + gentle pulse รองรับทั้ง Light Mode และ Eye-Care Dark Mode (`html.dark`) และ Fallback เป็น `<i class="fa-solid fa-landmark">` (`#ldLogoFallback`) เฉพาะเมื่อรูปเกิด `onerror`
   - ตั้งข้อความ HTML เริ่มต้น (`สำนักเทศกิจ` / `สำนักงานตรวจและบังคับการ` / `ระบบลงเวลาปฏิบัติราชการ (สตบ.สนท.)`) ย้าย `<script src="@supabase/supabase-js@2">` มาไว้ท้าย `<body>` หน้า `LoadingController.js`, และอัปเดต 0ms inline hydration ให้อ่าน `localStorage.bma_cached_brand_v2_7` พร้อม Fallback แบบรายฟิลด์ไป `sessionStorage.bma_checkin_cached_settings_v2_7`
2. **[LoadingController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/LoadingController.js):**
   - กำหนด `static OFFICIAL_SETTINGS_LOGO = 'https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc'` แทนค่าคงที่ฮาร์ดโค้ดเดิมทั้งหมด
   - ปรับ `#hydrateFromLocalBrandCache()`, `#applyLiveSettingsBranding()`, และ `#renderOrgLogo(rawUrl)` ให้รองรับ 2-tier cache fallback, Google-domain Drive rewrite (`https://lh3.googleusercontent.com/d/<ID>`), protocol sanitization, รักษา state fallback เดิมหาก URL ไม่เปลี่ยน, และประสาน `logoImg.decode()` ภายในเพดาน `500ms` ควบคู่ ~`750ms` smooth display floor
3. **[LoginController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/LoginController.js) & [SettingsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/SettingsController.js):**
   - เพิ่มการ Sanitize และซิงค์ `{ orgName, bureauName, headerSystemTitle, logoUrl }` ลง `localStorage.bma_cached_brand_v2_7` ใน `#loadOrganizationBranding()` และ `#persistSettings()`
4. **QA Tests & Build Sync:**
   - อัปเดต [qa_test_suite.mjs](file:///f:/STB%20System/CheckinApp-UXUI/pipeline/PIPE-20261116-loading-entry-screen/qa_test_suite.mjs) (**139 / 139 PASSED**) และ [qa_runtime_deep_simulation.mjs](file:///f:/STB%20System/CheckinApp-UXUI/pipeline/PIPE-20261116-loading-entry-screen/qa_runtime_deep_simulation.mjs) (**40 / 40 PASSED**)
   - รัน `node ./.ai_map/vscode_ast_mapper.mjs` ซิงค์ `version.json` และ 9 หน้า HTML ที่ `buildId: 20261116_ea0302f2` และอัปเดต [ADR_0032](file:///f:/STB%20System/CheckinApp-UXUI/second_brain_vault/02_Architecture_Decisions/ADR_0032_standalone_boot_loading_screen_and_3d_dual_logo_flip.md) + [00_INDEX_MOC.md](file:///f:/STB%20System/CheckinApp-UXUI/second_brain_vault/00_INDEX_MOC.md)
