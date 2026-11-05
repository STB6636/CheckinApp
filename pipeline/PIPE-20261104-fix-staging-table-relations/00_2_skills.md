# Phase 0.2: Skill Matching & Activation

**Task ID**: PIPE-20261104-fix-staging-table-relations  
**Date**: 2026-11-04  

## 1. Skill Registry Scan (`ai_skills_registry/SKILL_CATALOG.json`)
- **Matched Skill 1**: `vscode_surgical_codebase_mapping` (`v3.5.0`)
  - *Trigger*: Precise line-range inspection and automated AST synchronization.
  - *Action*: Target exact line ranges in `PersonnelModel.js`, `UserModel.js`, `AuthService.js`, and `AttendanceModel.js`. Run `node ./.ai_map/vscode_ast_mapper.mjs` post-edit.
- **Matched Skill 2**: `client_side_hierarchical_rbac` (`v1.0.0`)
  - *Trigger*: Scope filtering in `UserModel.getAll` and `PersonnelModel.getAll` based on `AuthService.canViewRecordByScope`.
  - *Action*: Preserve exact RBAC scoping logic when implementing the two-stage in-memory fallback.

## 2. Applicable Architectural Patterns
- **Resilient Multi-Stage Fetch Pattern**: Try joined PostgREST query first; on error (such as PGRST200 missing relationship), automatically execute concurrent simple queries (`Promise.all([tableA.select(), tableB.select()])`) and stitch them together client-side using `Map`.

