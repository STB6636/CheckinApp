# Phase 0.1 — Second Brain Retrieval (`PIPE-20261121-fix-cloudflare-loading-path-loop`)

- **Task ID**: `PIPE-20261121-fix-cloudflare-loading-path-loop`
- **Target Branches**: `Loca-V2` → Merge & Push `main`
- **Linked Flow IDs**: `FLOW_AUTH_01`, `FLOW_LAYOUT_01`

## Relevant Second Brain Notes Retrieved
1. **`ADR_0032_standalone_boot_loading_screen_and_3d_dual_logo_flip.md`**
   - กำหนดให้ `loading.html` เป็นหน้า Boot Loading แยกไฟล์ รองรับ 3 เส้นทางเข้า (`index.html`, `?entry=login`, `?entry=session`)
   - คงข้อกำหนดว่า `UIHelpers.KNOWN_PAGES_REGEX` ต้องไม่จับ `loading.html` เพื่อไม่ให้เขียนทับ `VIEW_PAGE_STORAGE_KEY`
2. **`ADR_0031_mobile_logout_zindex_session_7day_and_cross_browser_camera.md`**
   - รักษา Session 7 วันข้ามการล้างแคช (`PRESERVE_KEYS`)
3. **`rule_remote_version_hard_cache_purge_autostamp.md`**
   - ทุกครั้งที่แก้ Frontend (`*.html`, `assets/js/**`) ต้องรัน `node ./.ai_map/vscode_ast_mapper.mjs` ซิงก์ `buildId` ครบทั้ง **10 หน้า HTML**

## Root Cause & Past Pitfalls to Avoid (`past_pitfalls_to_avoid`)
- **Cloudflare Pages Pretty URLs (`/loading.html` → `/loading`):** บน Cloudflare Pages ระบบตัด `.html` ออกอัตโนมัติ ทำให้ `UIHelpers.getRootBasePath()` (L37–46) ไม่ตรงทั้ง `KNOWN_PAGES_REGEX` (L39) และ `\.html$` (L42) จึงตกลง L45 กลายเป็น `/loading/` และทุก Relative Redirect (`loading.html`, `checkin.html`, `dashboard.html`) ซ้อนเป็น `/loading/loading.html?entry=session` จนวนลูปค้างหน้าจอเขียว
- **ห้ามใส่ `loading` เข้าไปใน `KNOWN_PAGES_REGEX` โดยไม่กัน `VIEW_PAGE_STORAGE_KEY`:** ต้องคง `KNOWN_PAGES_REGEX` เดิม (หรือกัน `loading.html` ไม่ให้บันทึกลง `VIEW_PAGE_STORAGE_KEY`) เพื่อไม่ให้ Regression tests ใน `PIPE-20261116-loading-entry-screen` พัง
- **ต้องรองรับทั้ง Root Hosting (Cloudflare Pages: `/`) และ Subpath Hosting (GitHub Pages: `/CheckinApp/`):** ห้ามฮาร์ดโค้ด `/loading.html` จาก root `/` ตรงๆ เพราะจะพังบน `stb6636.github.io/CheckinApp/` ต้องคำนวณ `appRootPath` แบบ Dynamic เสมอ
- **ต้องแก้ Self-Healing ใน `<head>` ของ `index.html` ด้วย:** เพื่อให้ผู้ใช้ที่ค้างอยู่ที่ `/loading/loading.html?entry=session` หลุดจากลูปได้ทันทีเมื่อรีเฟรช
