---
id: "adr_005_lean_2_subagent_ai_workflow"
title: "ADR-005: สถาปัตยกรรม Lean 2-SubAgent + 1-Orchestrator AI Workflow (v3.5) เพื่อลดขั้นตอนและประหยัดโทเคน"
type: "architecture_decision"
last_updated_phase: "PIPE-20261104-lean-ai-workflow"
related_flows:
  - "FLOW_AUTH_01"
  - "FLOW_CHECKIN_01"
  - "FLOW_DASHBOARD_01"
  - "FLOW_REPORTS_01"
  - "FLOW_SPECIAL_REQ_01"
  - "FLOW_USERS_01"
  - "FLOW_SETTINGS_01"
---

# ADR-005: สถาปัตยกรรม Lean 2-SubAgent + 1-Orchestrator AI Workflow (v3.5)

## 1. บริบทและปัญหา (Context & Problem)
- โครงสร้าง AI Workflow เดิม (v3.0) กำหนดให้มี SubAgent ถึง 9 ตัว (`agent_01_ba_sa` ถึง `agent_09_code_mapper`) และส่งต่องานถึง 12 ขั้นตอน ทำให้สิ้นเปลืองโทเคนและเวลาในการส่งผ่าน Context ซ้ำซ้อน

## 2. การตัดสินใจทางสถาปัตยกรรม (Decision)
ยุบรวมกระบวนการทำงานให้เป็น **Lean 2-SubAgent + 1-Orchestrator Architecture (4 Stages)** โดยกำหนดบทบาทหน้าที่อย่างชัดเจน:
1. **Orchestrator (`agent_00_orchestrator` / Main Agent)**:
   - ดำเนินการ Phase 0 ด้วยตนเอง (ค้น `second_brain_vault/00_INDEX_MOC.md`, `ai_skills_registry/SKILL_CATALOG.json`, และ `.ai_map/`)
   - สร้างแผนงานคู่ขนาน (`implementation_plan.md` artifact พร้อม `RequestFeedback: true` + `interactive_plan.html`) เสนอผู้ใช้และรอการอนุมัติ (`Proceed`)
   - รวบรวมและควบคุม SubAgents ทั้ง 2 ตัว
   - ดำเนินการ Phase 6 (อัปเดต Second Brain และ Skill Catalog) และรายงานผลสรุปให้ผู้ใช้ทราบ
2. **SubAgent ตัวที่ 1 (`subagent_01_implementer` — โมเดล `Flash 3.8 High` / `flash` จำนวน 1 ตัว)**:
   - เข้าไปอ่านไฟล์เฉพาะช่วงบรรทัดเป้าหมาย (`StartLine`–`EndLine`) และแก้ไขโค้ดตามแผนที่กำหนดไว้เท่านั้น
   - ยึดกฎเหล็ก: **"แก้ไขเฉพาะส่วนที่ต้องแก้ไข, ไม่แก้ไขส่วนที่ไม่เกี่ยวข้อง"** (`STRICT_SURGICAL_SCOPE_ONLY`)
   - รัน `node ./.ai_map/vscode_ast_mapper.mjs` เพื่อซิงค์แผนที่โค้ด `.ai_map/` หลังแก้ไขเสร็จ
3. **SubAgent ตัวที่ 2 (`subagent_02_qa_auditor` — โมเดล `Flash 3.8 High` / `flash` จำนวน 1 ตัว)**:
   - ตรวจทานงานที่แก้ไขเทียบกับแผนที่อนุมัติครบทุกข้อ
   - รันตรวจสอบไวยากรณ์/ชุดทดสอบ และเปรียบเทียบความแตกต่างกับ Branch `main` (`git diff main`) เพื่อยืนยันความเข้ากันได้และตรวจสอบว่าไม่มีส่วนที่ไม่เกี่ยวข้องถูกแก้ไข

## 3. ผลลัพธ์ (Consequences)
- ประหยัดโทเคนลงประมาณ ~75% ต่อรอบการทำงาน
- รับประกันความแม่นยำด้วยการผ่าตัดโค้ดเฉพาะจุด (`MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`) และการตรวจสอบเทียบกับ Branch `main` ทุกครั้ง
- ห้ามรัน `git push` ขึ้น GitHub โดยอัตโนมัติ เว้นแต่ผู้ใช้สั่งชัดเจน

