# Phase 0.1 — Second Brain Retrieval (`PIPE-20261114-approvals-remark-two-line`)

- **Task ID**: `PIPE-20261114-approvals-remark-two-line`
- **Target Branch**: `Loca-V2`
- **Linked Flow IDs**: `FLOW_SPECIAL_REQ_01`, `FLOW_APPROVALS_01`

## Relevant Second Brain Notes Retrieved
1. **`ADR_0029_split_dropdowns_and_special_request_official_locations.md`**
   - แยก `offsite_job_types` (ลักษณะงานนอกสถานที่) และ `special_request_reasons` (เหตุผลลงเวลากรณีพิเศษ) ออกจากกัน
   - ใน `ApprovalsController.#buildRequestRowHtml` เดิมรวม string เป็น `${req.remark || 'กรณีพิเศษ'} (${req.offsite_reason})` ไว้ในบรรทัดเดียวภายใน `.bma-badge.bma-badge-indigo`
   - **Rule จาก Test 11.1**: กรณี `ONSITE` (`!isOffsite`) ห้ามนำ `offsite_reason` ที่ค้างอยู่ใน record มาแสดงต่อท้ายเด็ดขาด
2. **`ADR_0028_special_request_mode_and_reports_remarks_redesign.md`**
   - แนวทางมาตรฐานการแสดงผลหมายเหตุ 2 บรรทัดในระบบ (แยกบรรทัดที่ 1 หลัก และบรรทัดที่ 2 รายละเอียดเพิ่มเติม)
3. **`rule_remote_version_hard_cache_purge_autostamp.md`**
   - **Mandatory Cache Version Sync**: ทุกครั้งที่แก้ไขไฟล์ Frontend (`assets/js/**`, `assets/css/**`, `*.html`) ต้องรัน `node ./.ai_map/vscode_ast_mapper.mjs` เพื่อสร้าง `buildId` ใหม่ใน `version.json` และอัปเดต `CURRENT_APP_BUILD` + `?v=` ครบทั้ง 8 ไฟล์ HTML หลัก

## Past Pitfalls to Avoid (`past_pitfalls_to_avoid`)
- **ห้ามแก้ `.bma-badge` แบบ Global ใน `bma-theme.css`:** เพราะ `.bma-badge` มี `white-space: nowrap; border-radius: 9999px` และถูกใช้งานร่วมกับป้ายสถานะทุกหน้า (เช่น `อนุมัติแล้ว`, `ไม่อนุมัติ`, `Dashboard`, `Users`) ควรปรับเฉพาะการแสดงผลในคอลัมน์หมายเหตุของ `ApprovalsController.js` (หรือใช้ class/inline layout เฉพาะจุด)
- **ห้ามแสดง `offsite_reason` เมื่อ `locMode === 'ONSITE'`:** ต้องตรวจสอบ `isOffsite` ก่อนแสดงบรรทัดที่ 2 เสมอ
- **ระวังกรณี `(WFH)` ใน `"ปฏิบัติงานที่บ้าน (WFH)"`:** หากมี Logic แยกวงเล็บท้ายประโยค ต้องไม่เผลอตัด `(WFH)` แยกบรรทัดโดยไม่ตั้งใจ
- **ต้องรัน `vscode_ast_mapper.mjs` ทุกครั้งหลังแก้ JS:** มิฉะนั้นผู้ใช้บน GitHub Pages จะติด Cache ไฟล์ `ApprovalsController.js` เก่า
- **ห้าม Push ก่อนได้รับอนุมัติ:** ในรอบนี้ผู้ใช้สั่ง `สร้างแผนปรับปรุงและพัฒนา (ยังไม่ Proceed)` และกำหนดให้มีขั้นตอน `Push Branch Loca-V2 บน GitHub` ในแผนหลังดำเนินการและผ่าน QA แล้วเท่านั้น
