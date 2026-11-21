# สรุปผลส่งมอบงาน: หน้าโหลดเข้าระบบแบบแยกไฟล์ (`loading.html` + `LoadingController.js`)

- **Task ID:** `PIPE-20261116-loading-entry-screen`
- **วันที่ดำเนินการ:** 2026-11-16
- **สาขา Git (Branch):** `Loca-V2` (Schema: `staging` — ไม่มีการแก้ไขสคีมาฐานข้อมูลและไม่มีการ `git push`)
- **Build ID ล่าสุด (`version.json`):** `20261116_c4c52e6f` (ซิงค์ครบทั้ง 9 หน้า HTML)
- **สถานะ QA Audit:** **`PASS`**

---

## 1. สิ่งที่สร้างและปรับปรุงเฉพาะจุด (`Strict Surgical Scope`)
1. **[loading.html](file:///f:/STB%20System/CheckinApp-UXUI/loading.html) *(สร้างใหม่)*:**
   - ออกแบบตามโครงสร้างแอนิเมชัน Dual-Logo Split-Half 3D Flip (`@keyframes logo-flip` พร้อม `-webkit-clip-path` และ Fallback SVG Base64 ในกรณี Offline/รูปเสีย) ผสานธีม CheckinApp (`.login-vertical-gradient` Light & Eye-Care Dark Mode `html.dark`, การ์ด `.ld-card` พร้อม `.login-card-header-gradient`, Font Awesome 6.5 Status Chip, แถบ `.ld-bar` สีเขียวมรกต-ทอง)
   - รองรับ `PRESERVE_KEYS` 6 ตัวใน CacheBuster `<head>`, Pre-hydration 0ms สำหรับธีมและ `bma_cached_brand_v2_7` (กรองโปรโตคอลและตรวจโดเมน Google Drive ก่อน rewrite URL), Responsive `--ld-size: 84px` บนมือถือโดยคงความสมมาตร `±0.16`, Watchdog Fallback (`#ldFallbackActions`), และ `pageshow` ป้องกัน BFCache ค้าง
2. **[LoadingController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/LoadingController.js) *(สร้างใหม่)*:**
   - อ่านพารามิเตอร์ `?entry=` ก่อนเรียก `UIHelpers.initTheme()`, รอ `window.__bmaPurgePromise` (สูงสุด 1.5s), ตรวจสอบและต่ออายุ Session 7 วันด้วย `AuthService.getCurrentUser(true)`
   - โหลด `SettingsModel.getSettings(true)` (Timeout 3,000ms) และตรวจสอบสิทธิ์บัญชีกับ Supabase ผ่าน `AuthService.verifySessionWithDatabase()` (Timeout fallback 2,500ms), แปลงลิงก์ Google Drive เฉพาะโดเมน Google + Preflight `new Image()` (1,800ms), ป้องกัน Self-Redirect Loop บน `targetUrl`, คง Minimum Display Floor (~750ms), และเปิด Watchdog Recovery 12 วินาที
3. **[index.html](file:///f:/STB%20System/CheckinApp-UXUI/index.html) & [LoginController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/LoginController.js) *(แก้ไขเฉพาะจุด)*:**
   - **กรณีที่ 1 (ไม่มี Session):** เข้า `index.html` โดยตรงและคง `#loginVersionBadgeSlot` + `SystemUpdateModal` + Modal จัดการรหัสผ่านไว้ทั้งหมด
   - **กรณีที่ 2 (กด Login):** ตรวจรหัสผ่านบน `index.html` ก่อน (รหัสผิดแจ้งทันที) เมื่อสำเร็จจะเปลี่ยนหน้าไป `loading.html?entry=login` ทันทีโดยตัด Toast Delay 2 วินาทีเดิมออก
   - **กรณีที่ 3 (มี Session 7 วันอยู่แล้ว):** สคริปต์ Fast-path ใน `<head>` เพิ่มคลาส `html.bma-session-redirecting` ซ่อน Body ตั้งแต่ก่อนวาดจอ (Zero FOUC) ประสานกับ `performHardCachePurge()` แล้วส่งเข้า `loading.html?entry=session` และเด้งต่อเข้าหน้าระบบอัตโนมัติ
4. **[vscode_ast_mapper.mjs](file:///f:/STB%20System/CheckinApp-UXUI/.ai_map/vscode_ast_mapper.mjs) & [version.json](file:///f:/STB%20System/CheckinApp-UXUI/version.json):**
   - เพิ่ม `'loading.html'` ใน `ROOT_HTML_ENTRIES` และ Stamp `CURRENT_APP_BUILD` + `?v=20261116_c4c52e6f` ครบทั้ง 9 หน้า HTML โดยไม่แก้ไข Logic ของหน้าทำงานหลัก (`checkin.html` – `users.html`) และ Core Services (`AuthService.js`, `UIHelpers.js`, `Config.js`, `SettingsModel.js`, `AppLayout.js`)

---

## 2. สรุปการทดสอบหลังแก้ไขครั้งสุดท้าย
- `node --check` ทุกไฟล์เป้าหมาย (`LoadingController.js`, `LoginController.js`, `vscode_ast_mapper.mjs`, `qa_test_suite.mjs`, `qa_runtime_deep_simulation.mjs`): **0 Errors**
- `pipeline/PIPE-20261116-loading-entry-screen/qa_test_suite.mjs`: **130 / 130 PASSED**
- `pipeline/PIPE-20261116-loading-entry-screen/qa_runtime_deep_simulation.mjs`: **29 / 29 PASSED**
- เอกสาร Second Brain: [ADR_0032_standalone_boot_loading_screen_and_3d_dual_logo_flip.md](file:///f:/STB%20System/CheckinApp-UXUI/second_brain_vault/02_Architecture_Decisions/ADR_0032_standalone_boot_loading_screen_and_3d_dual_logo_flip.md) และ [00_INDEX_MOC.md](file:///f:/STB%20System/CheckinApp-UXUI/second_brain_vault/00_INDEX_MOC.md)
