# Phase 0.2 — Skill Matching & Registry
**Pipeline ID:** `PIPE-20261029-hide-recorded-shifts`

---

## 1. Activated Skills
- **`ai-software-pipeline`**: Multi-agent software engineering pipeline v3.0 (Lean execution).
- **`vscode_surgical_codebase_mapping`**: Precision AST line range mapping.

## 2. Subagent Architecture Allocation (Lean Token Strategy)
- **SubAgent 1 (Flash 3.8 High) — Surgical Implementer:**
  - เพิ่มเมธอด `#isShiftAlreadyRecordedToday(shift)` ใน `CheckinController.js`
  - กรองกะที่บันทึกแล้วออกจาก `candidateShifts` และ `timeFilteredShifts`
  - ปิดปุ่มบันทึกลงเวลาเมื่อไม่มีตัวเลือกช่วงเวลาเหลืออยู่
- **SubAgent 2 (Flash 3.8 High) — QA Auditor:**
  - ทดสอบจำลองสถานการณ์:
    1) กะ A เมื่อลงเวลาแล้ว กะ A จะหายไปจาก Dropdown
    2) หากมีกะ B เหลืออยู่ กะ B ยังคงเลือกได้ตามปกติ
    3) หากไม่มีกะเหลืออยู่เลย ปุ่มบันทึกเวลาจะ Disabled
  - ตรวจทาน Code Diff เทียบกับ Branch `main`
- **Orchestrator:**
  - วางแผน ควบคุม และสรุปรายงาน

