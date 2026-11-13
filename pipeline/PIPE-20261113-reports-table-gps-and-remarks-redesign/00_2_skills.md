# Skill Matching & Loading — Task: PIPE-20261113-reports-table-gps-and-remarks-redesign

- **Task ID**: `PIPE-20261113-reports-table-gps-and-remarks-redesign`
- **Execution Date**: 2026-11-13

---

## 1. Matched Skills from `ai_skills_registry/SKILL_CATALOG.json`

| Skill ID | Name | Version | Reason for Activation |
|:---|:---|:---|:---|
| `vscode_surgical_codebase_mapping` | VS Code Surgical Context & Automated AST Codebase Mapping | `3.5.0` | **Mandatory** for zero-token AST indexing, line-range pinpointing, and enforcing `MAP_FIRST_SURGICAL_LINE_RANGE_ONLY` & `STRICT_SURGICAL_SCOPE_ONLY`. |
| `remote_version_hard_cache_purge` | Remote version.json + Hard Cache Purge + Auto-Stamp Pipeline | `1.0.0` | **Mandatory** whenever frontend JavaScript (`ReportsController.js`, `AttendanceModel.js`) is modified to auto-stamp a fresh `buildId` across `version.json` and all 8 HTML files. |
| `civil_servant_position_level_formatter` | Civil Service Position & Level String Normalizer Pattern | `1.0.0` | Active in Reports table for rendering civil servant position and rank without regressions. |
| `realtime_differential_dom_diffing_and_concurrency` | Realtime Differential DOM Diffing & Concurrency Engine Pattern | `1.0.0` | Active in `ReportsController` for maintaining smooth table updates without full DOM flashes. |
| `multi_tier_resilient_reverse_geocoding` | Multi-Tier Resilient Reverse Geocoding & POI Resolution Pattern | `1.0.0` | Relevant for location name resolution and geofence distance calculation. |

---

## 2. Active Guidelines & Constraints
1. **Target Files Only**:
   - `assets/js/controllers/ReportsController.js` (Lines 594–705, 1200–1245)
   - `assets/js/models/AttendanceModel.js` (Lines 2330–2340, 2400–2425)
2. **Zero Unrelated Edits**: Do not touch auth logic, camera streaming, settings schema, or styling in unrelated files.
3. **Cache Invalidation**: Must run `node ./.ai_map/vscode_ast_mapper.mjs` immediately after code changes.
