# Phase 0.2 — Skill Matching & Registry
**Pipeline ID:** `PIPE-20261029-update-system-manuals-and-critic`

---

## 1. Activated Skills
- **`ai-software-pipeline`**: Multi-agent software engineering pipeline v3.0, enforcing Phase 0 through Phase 6, zero-token AST indexing, and subagent coordination.
- **`vscode_surgical_codebase_mapping`**: Precision AST line range mapping.

## 2. Subagent Architecture Allocation (Lean Token Strategy)
ตามคำสั่งของผู้ใช้อย่างเคร่งครัดเพื่อลดการใช้โทเคน:
1. **SubAgent 1 (Flash 3.8 High) — Manual Author & Editor**:
   - อ่านและอัปเดตไฟล์คู่มือใน `docs/manual/` ทั้ง 4 ไฟล์ ให้สอดคล้องกับฟังก์ชันล่าสุด
   - เขียนอธิบายอย่างละเอียดเป็นขั้นตอน พร้อม Tips, ข้อควรระวัง, และ Diagram เพื่อให้อ่านเข้าใจได้ในครั้งเดียว
2. **SubAgent 2 (Flash 3.8 High) — Manual Critic & QA Auditor**:
   - ทำหน้าที่วิจารณ์คู่มือ (Manual Review & Critical Appraisal) ประเมินความครอบคลุม ความเข้าใจง่าย และจุดที่ควรระวัง
   - ตรวจทานกับแผนงาน และเปรียบเทียบ Code Diff กับ Branch `main`
   - จัดทำรายงานบทวิจารณ์คู่มือ (Criticism Report) นำเสนอต่อ Orchestrator
3. **Orchestrator**:
   - ควบคุม SubAgents รวบรวมข้อมูล จัดทำแผนงาน และสรุปรายงานต่อผู้ใช้

