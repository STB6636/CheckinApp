# Phase 0.2: Matched Skills Registry

- **Task ID**: `PIPE-20261112-arcgis-forward-search-modals`
- **Date**: 2026-11-12

## Matched Skills from `ai_skills_registry/SKILL_CATALOG.json`

| Skill ID | Version | Description & Trigger Rationale |
|:--|:--|:--|
| `vscode_surgical_codebase_mapping` | `3.5.0` | **Mandatory Active Skill**: Enforces `MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`, `STRICT_SURGICAL_SCOPE_ONLY`, and zero-token AST scanner `node ./.ai_map/vscode_ast_mapper.mjs` for cache buster synchronization across `version.json` and 8 HTML files. |

## Specialized Development Guidelines
1. **Model First (DRY Architecture)**:
   - Centralize all Forward Geocoding logic into `AttendanceModel.searchPlaces(query, options)`.
   - Never duplicate fetch calls or regex parsers inside Controllers.
2. **Controller Surgical Hookup**:
   - `#modalSpecialRequest`: Replace custom Photon+Nominatim fetch with `AttendanceModel.searchPlaces`. Reduce debounce from 2000ms to 450ms.
   - `#modalOffsiteMapSearch`: Upgrade from raw Nominatim fetch to `AttendanceModel.searchPlaces`. Add 450ms debounce and distance/category badge rendering.
3. **Cache Synchronization**:
   - Run `node ./.ai_map/vscode_ast_mapper.mjs` to auto-stamp `buildId` across `version.json` and all 8 HTML files.
