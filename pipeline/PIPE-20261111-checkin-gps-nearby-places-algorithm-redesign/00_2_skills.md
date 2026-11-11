# Phase 0.2: Skills Matching Report
- **Task ID**: `PIPE-20261111-checkin-gps-nearby-places-algorithm-redesign`
- **Date**: 2026-11-11

## Active Skills & Rules
1. **`ai-software-pipeline`**:
   - Lean 2-SubAgent + 1-Orchestrator Architecture
   - Map-First Surgical Line-Range Access (`MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`)
   - Strict Surgical Scope (`STRICT_SURGICAL_SCOPE_ONLY`): ไม่แก้ไขส่วนที่ไม่เกี่ยวข้อง
   - Mandatory Cache Version Sync: `node ./.ai_map/vscode_ast_mapper.mjs`
   - Git Safety: ห้าม push ขึ้น GitHub เว้นแต่มีคำสั่งชัดเจน
2. **`remote_version_hard_cache_purge`**:
   - บังคับรัน `node ./.ai_map/vscode_ast_mapper.mjs` หลังการแก้ไขโค้ดทุกครั้งเพื่อสร้าง deterministic `buildId` และ stamp ทุกลิงก์ CSS/JS
