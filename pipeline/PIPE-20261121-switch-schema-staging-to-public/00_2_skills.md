# Phase 0.2 — Skill Matching (`PIPE-20261121-switch-schema-staging-to-public`)

| Skill ID | Version | Match Reason | Target Agents |
|:--|:--:|:--|:--|
| `vscode_surgical_codebase_mapping` | `3.5.0` | บังคับใช้ `MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`, `STRICT_SURGICAL_SCOPE_ONLY` และการซิงค์ `.ai_map/` | `agent_00_orchestrator`, `subagent_01_implementer`, `subagent_02_qa_auditor` |
| `remote_version_hard_cache_purge` | `1.0.0` | บังคับ Auto-stamp `version.json` และ `?v=<buildId>` ครบทั้ง **10 หน้า HTML** ผ่าน `node ./.ai_map/vscode_ast_mapper.mjs` เมื่อแก้ไข `assets/js/**` | `subagent_01_implementer`, `subagent_02_qa_auditor` |
| `realtime_differential_dom_diffing_and_concurrency` | `1.0.0` | ยืนยันว่า Realtime channels ใน `AppLayout.js` และ `CheckinController.js` เปลี่ยนไปฟัง `public` อัตโนมัติ และ SQL migration เปิด `supabase_realtime` publication ครบทั้ง 4 ตารางบน `public` | `subagent_01_implementer`, `subagent_02_qa_auditor` |
