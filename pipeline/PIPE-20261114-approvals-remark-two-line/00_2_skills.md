# Phase 0.2 — Skill Matching (`PIPE-20261114-approvals-remark-two-line`)

| Skill ID | Version | Match Reason | Target Agents |
|:--|:--:|:--|:--|
| `vscode_surgical_codebase_mapping` | `3.5.0` | บังคับใช้ทุกครั้งที่ค้นหา อ่าน แก้ไข เพื่อรักษาขอบเขต `MAP_FIRST_SURGICAL_LINE_RANGE_ONLY` และ `STRICT_SURGICAL_SCOPE_ONLY` พร้อมซิงค์ `.ai_map/` | `agent_00_orchestrator`, `subagent_01_implementer`, `subagent_02_qa_auditor` |
| `remote_version_hard_cache_purge` | `1.0.0` | บังคับใช้เมื่อแก้ไฟล์ Frontend (`assets/js/controllers/ApprovalsController.js`) เพื่อ Auto-Stamp `version.json` และ `?v=<buildId>` ใน 8 Root HTML Files ผ่าน `node ./.ai_map/vscode_ast_mapper.mjs` | `subagent_01_implementer`, `subagent_02_qa_auditor` |
| `realtime_differential_dom_diffing_and_concurrency` | `1.0.0` | `ApprovalsController.#buildRequestRowHtml` ถูกเรียกทั้งตอนโหลดตารางครั้งแรกและตอน `syncRequestsSilent` (Realtime DOM Diffing) เพื่อให้แถวที่อัปเดตสดยังคงรูปแบบ 2 บรรทัดตรงกัน 100% | `subagent_01_implementer`, `subagent_02_qa_auditor` |
