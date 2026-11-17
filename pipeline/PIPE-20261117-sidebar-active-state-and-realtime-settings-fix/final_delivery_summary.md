# สรุปผลส่งมอบงาน: แก้ปัญหา Sidebar กระโดดไปไฮไลต์ "ภาพรวม" หลังกดบันทึกตั้งค่าระบบ

- **Task ID:** `PIPE-20261117-sidebar-active-state-and-realtime-settings-fix`
- **วันที่ดำเนินการ:** 2026-11-17
- **สาขา Git:** `Loca-V2` (Schema: `staging` — ไม่มีการแก้ไขฐานข้อมูลและยังไม่มีการ `git push`)
- **Build ID ล่าสุด (`version.json`):** `20261117_e60fdbe3` (`v2.10.0` ซิงค์ครบทั้ง 9 หน้า HTML)
- **สถานะ QA Audit:** **`PASS`**

---

## 1. สิ่งที่แก้ไขเฉพาะจุด (`Strict Surgical Scope`)
1. **[AppLayout.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/components/AppLayout.js):**
   - เพิ่ม `static #currentActivePage` และ `static #isSettingsListenerBound` เพื่ออ้างอิงหน้าปัจจุบันอย่างแม่นยำทั้งตอนโหลดตรงและสลับหน้าแบบ AJAX SPA (`initAdminLayout` & `#updateActiveNavState`)
   - แก้ไข `#renderSidebar()` ให้คงคลาส `.active` บนเมนูที่เลือก และกู้คืน `#sidebarSpecialBadge` / `#sidebarResetBadge` จาก `#lastPendingSpecialCount` / `#lastPendingResetCount` ทันทีที่ re-render
   - แก้ไข Listener `bma:settings-updated`: กัน bind ซ้ำ, กรองคีย์ `undefined` ก่อน Merge `#settings`, อัปเดต Sidebar + Mobile Bottom Nav + Footer ด้วย `AppLayout.#currentActivePage` และ `AppLayout.#currentUser`, และลบ `AppLayout.refreshNotificationBell()` ออกจาก Listener เพื่อตัดวงจร Circular Re-entrancy
   - แก้ไขจุดส่งทั้ง 3 แหล่ง (`refreshNotificationBell` โดยบันทึก `#lastSettingsWatermark` ก่อน `await`/dispatch, `postgres_changes`, และ `broadcast`) ให้ล้าง `CACHED_SETTINGS` แล้ว Hydrate ข้อมูลเต็มที่ Normalize แล้วผ่าน `await SettingsModel.getSettings(true)` (พร้อม Safe Fallback) แทนการส่ง Payload บางส่วนหรือเขียน Raw Row ลง `sessionStorage`
2. **[ApprovalsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/ApprovalsController.js#L538-L545):**
   - เพิ่ม Guard `!window.__BMA_SPA_ROUTER_ACTIVE__` ให้สอดคล้องกับหน้าผู้ดูแลระบบอื่น ป้องกันการสร้าง Controller ซ้อนเมื่อเปิด `approvals.html` ตรงแล้วสลับหน้า SPA
3. **[SettingsController.js](file:///f:/STB%20System/CheckinApp-UXUI/assets/js/controllers/SettingsController.js):**
   - ย้าย `change` listener ของ Checkbox (`#toggleFilterShiftsByRealtime`, `#toggleRandomizeGpsCheckout`) ออกจาก `#renderAllSettings()` มาผูกครั้งเดียวใน `#bindEvents()` เพื่อไม่ให้สะสม Listener ซ้ำเมื่อกดบันทึกหลายครั้ง

---

## 2. ผลการทดสอบหลังแก้ไขครั้งสุดท้าย
- `node --check` ผ่านครบ `0` Errors และ Cache Version Sync `buildId: 20261117_e60fdbe3` ตรงกันทั้ง `9` หน้า HTML
- [qa_sidebar_active_sync_test.mjs](file:///f:/STB%20System/CheckinApp-UXUI/pipeline/PIPE-20261117-sidebar-active-state-and-realtime-settings-fix/qa_sidebar_active_sync_test.mjs): **8 / 8 PASSED** (`0` failed)
- ชุดทดสอบย้อนหลังทั้งหมด: `qa_v2_10_announcement_verification.mjs` (**20 / 20**), `qa_test_suite.mjs` (**139 / 139**), `qa_runtime_deep_simulation.mjs` (**40 / 40**), `qa_real_instance_test.mjs` (**8 / 8**), `qa_split_dropdowns_verification.mjs` (**8 / 8**)
- บันทึก [ADR_0034](file:///f:/STB%20System/CheckinApp-UXUI/second_brain_vault/02_Architecture_Decisions/ADR_0034_sidebar_active_state_watermark_reentrancy_and_spa_hygiene.md) และอัปเดต [00_INDEX_MOC.md](file:///f:/STB%20System/CheckinApp-UXUI/second_brain_vault/00_INDEX_MOC.md) เรียบร้อย
