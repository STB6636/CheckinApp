# Phase 0.2 — Skill Matching & Registry
**Pipeline ID:** `PIPE-20261030-hide-none-position-level`

---

## 1. Activated Skills
- **`ai-software-pipeline`**: Multi-agent software engineering pipeline v3.0 (Lean execution).
- **`vscode_surgical_codebase_mapping`**: Precision AST line range mapping.

## 2. Subagent Architecture Allocation (Lean Token Strategy)
- **SubAgent 1 (Flash 3.8 High) — Surgical Implementer:**
  - เพิ่ม Static Method `UIHelpers.formatPosition(title, level, fullFallback)` ใน `assets/js/core/UIHelpers.js`
  - ปรับปรุงการจัดรูปแบบตำแหน่งใน:
    1. `assets/js/controllers/DashboardController.js` (#renderTable)
    2. `assets/js/models/AttendanceModel.js` (#formatReportRow -> position_full)
    3. `assets/js/controllers/ReportsController.js` (#buildSingleRowHtml & #openResumeProfileForSpecificRow)
    4. `assets/js/controllers/ApprovalsController.js` (#buildRequestRowHtml)
    5. `assets/js/controllers/PersonnelController.js` (#buildPersonRowHtml & #openPersonnelResumeModal)
    6. `assets/js/controllers/CheckinController.js` (#renderUserAndSettingsInfo)
  - รัน `node ./.ai_map/vscode_ast_mapper.mjs` ซิงค์ AST แผนที่โค้ด
- **SubAgent 2 (Flash 3.8 High) — QA Auditor & Diff Specialist:**
  - สร้างไฟล์ทดสอบสถานการณ์จริง (Unit & Integration Scenario Test) ตรวจสอบค่าผลลัพธ์ตำแหน่งทั้งกรณี "ไม่มี", มีระดับปกติ, มีระดับตัวเลข, และค่าว่าง
  - ตรวจทานความถูกต้องกับแผนงานและภาพ Screenshot ที่ผู้ใช้แนบมา
  - ตรวจสอบ `git diff main` เพื่อให้แน่ใจว่าแก้ไขเฉพาะส่วนที่จำเป็น ไม่กระทบส่วนอื่น
- **Orchestrator:**
  - รวบรวมและควบคุม SubAgents จัดทำแผนและรายงานผลลัพธ์ต่อผู้ใช้

