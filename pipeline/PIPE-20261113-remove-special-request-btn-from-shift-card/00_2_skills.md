# Phase 0.2: Matched Skills Registry

- **Task ID**: `PIPE-20261113-remove-special-request-btn-from-shift-card`
- **Date**: 2026-11-13

## Matched Skills from `ai_skills_registry/SKILL_CATALOG.json`

| Skill ID | Version | Description & Trigger Rationale |
|:--|:--|:--|
| `vscode_surgical_codebase_mapping` | `3.5.0` | **Mandatory Active Skill**: Enforces `MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`, `STRICT_SURGICAL_SCOPE_ONLY`, and zero-token AST scanner `node ./.ai_map/vscode_ast_mapper.mjs` for cache buster synchronization across `version.json` and 8 HTML files. |

## Specialized Development Guidelines
1. **Target Isolation**:
   - Only modify `checkin.html` lines 468–486.
   - Zero changes to JavaScript logic, CSS, or backend schemas.
2. **Backward Compatibility Preservation**:
   - Relocate `#btnOpenSpecialRequestModal` into the hidden legacy container block.
3. **Cache Synchronization**:
   - Run `node ./.ai_map/vscode_ast_mapper.mjs` to auto-stamp a fresh `buildId` in `version.json` and sync `CURRENT_APP_BUILD` and `?v=<buildId>` across all 8 root HTML files.
