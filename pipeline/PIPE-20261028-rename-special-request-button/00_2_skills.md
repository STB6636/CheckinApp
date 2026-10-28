# Skill Matching — PIPE-20261028-rename-special-request-button

- **Skill:** `ai-software-pipeline`
- **Execution Mode:** PLAN Mode -> User Review -> Proceed -> 2 SubAgents (Flash 3.8 High)
- **SubAgent 1 (Implementer):** Flash 3.8 High (`flash`) — ดำเนินการแก้ไขเฉพาะจุดใน `checkin.html`
- **SubAgent 2 (QA Auditor):** Flash 3.8 High (`flash`) — ตรวจทานข้อความปุ่ม และเปรียบเทียบ Git diff กับ `main`
- **Orchestrator:** ควบคุม รวบรวมงาน รัน AST Mapper และรายงานผล

