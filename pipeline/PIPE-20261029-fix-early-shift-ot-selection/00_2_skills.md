# Phase 0.2 — Skill Matching & Registry
**Pipeline ID:** `PIPE-20261029-fix-early-shift-ot-selection`

---

## 1. Activated Skills
- **`ai-software-pipeline`**: Multi-agent software engineering pipeline v3.0 (Lean execution).
- **`vscode_surgical_codebase_mapping`**: Precision AST line range mapping.

## 2. Subagent Architecture Allocation (Lean Token Strategy)
ตามคำสั่งของผู้ใช้อย่างเคร่งครัดเพื่อลดขั้นตอนและประหยัดโทเคน:
1. **SubAgent 1 (Flash 3.8 High) — Surgical Implementer**:
   - แก้ไขเฉพาะไฟล์ `assets/js/controllers/CheckinController.js` อย่างแม่นยำ
   - ตรวจสอบ syntax ด้วย `node -c` และรัน `vscode_ast_mapper.mjs`
2. **SubAgent 2 (Flash 3.8 High) — QA Auditor**:
   - ตรวจทานกับแผนงานและทดสอบจำลองเวลา 16:02 น. ครอบคลุมทั้งกรณีเปิด/ปิด `disable_normal_hours_checkin`
   - รัน `git diff main` ยืนยันว่าแก้ไขเฉพาะส่วนที่จำเป็น
3. **Orchestrator**:
   - วางแผน ควบคุม และรายงานผล

