# Skill Matching — PIPE-20261028-custom-gps-pin-and-jitter-search

- **Skill:** `ai-software-pipeline`
- **Execution Mode:** PLAN Mode -> User Review -> Proceed -> 2 SubAgents (Flash 3.8 High)
- **SubAgent 1 (Implementer):** Flash 3.8 High (`flash`) — ดำเนินการปรับปรุงโค้ดใน `AttendanceModel.js`, `checkin.html`, และ `CheckinController.js`
- **SubAgent 2 (QA Auditor):** Flash 3.8 High (`flash`) — ตรวจทานการทำงานของระบบสุ่มพิกัด, การทำงานของแผนที่ Leaflet ในโมดอล, และเปรียบเทียบ Git diff กับ `main`
- **Orchestrator:** ควบคุม รวบรวมงาน รัน AST Mapper และรายงานผล

