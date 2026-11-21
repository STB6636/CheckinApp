# Skill Matching — Reports Print PDF Fix

- **Task ID:** `PIPE-20261111-reports-print-pdf-pagebreak-fix`
- **Timestamp:** 2026-11-11T10:58:00+07:00

## Active Skills
1. **`vscode_surgical_codebase_mapping` (v3.5.0)**:
   - บังคับใช้ `MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`
   - กฎเหล็ก `STRICT_SURGICAL_SCOPE_ONLY` แก้ไขเฉพาะส่วนที่ต้องแก้ไข
   - ซิงค์สารบัญ `.ai_map/` ด้วย `node ./.ai_map/vscode_ast_mapper.mjs`
2. **`remote_version_hard_cache_purge` (v1.0.0)**:
   - Mandatory Cache Version Synchronization: อัปเดต `buildId` ใน `version.json` และซิงค์ `CURRENT_APP_BUILD` รวมถึง `?v=` ใน HTML ทั้ง 8 หน้าหลัก
