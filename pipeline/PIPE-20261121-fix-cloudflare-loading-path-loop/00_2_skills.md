# Phase 0.2 — Skill Matching (`PIPE-20261121-fix-cloudflare-loading-path-loop`)

| Skill ID | Version | Match Reason | Target Agents |
|:--|:--:|:--|:--|
| `vscode_surgical_codebase_mapping` | `3.5.0` | บังคับใช้ `MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`, `STRICT_SURGICAL_SCOPE_ONLY` และการซิงค์ `.ai_map/` | `agent_00_orchestrator`, `subagent_01_implementer`, `subagent_02_qa_auditor` |
| `remote_version_hard_cache_purge` | `1.0.0` | บังคับ Auto-stamp `version.json` และ `?v=<buildId>` ครบทั้ง **10 หน้า HTML** ผ่าน `node ./.ai_map/vscode_ast_mapper.mjs` | `subagent_01_implementer`, `subagent_02_qa_auditor` |
