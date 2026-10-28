# Skill Matching — PIPE-20261028-block-normal-hours-checkin

- **Skill:** `ai-software-pipeline`
- **Execution Mode:** PLAN Mode -> User Review -> Proceed -> 2 SubAgents (Flash 3.8 High)
- **SubAgent 1 (Implementer):** Flash 3.8 High (`flash`) — จัดการแก้ไขไฟล์เฉพาะจุดตาม Line-ranges
- **SubAgent 2 (QA Auditor):** Flash 3.8 High (`flash`) — ตรวจทานโค้ดกับแผน และเทียบการเปลี่ยนแปลงกับ Branch `main`
- **Orchestrator:** ควบคุม ดูแล รวบรวมผลงาน รัน AST Mapper และรายงานต่อผู้ใช้

