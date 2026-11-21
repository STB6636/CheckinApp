# Matched Skills: PIPE-20261111-gps-refresh-cachebust-and-clock-format-fix

## Active Skills
1. **ai-software-pipeline** (`.agents/skills/ai-software-pipeline/SKILL.md`):
   - Architecture: Lean 2-SubAgent + 1-Orchestrator Architecture
   - SubAgent 1: `subagent_01_implementer` (Flash 3.8 High)
   - SubAgent 2: `subagent_02_qa_auditor` (Flash 3.8 High)
   - Rules: `MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`, `STRICT_SURGICAL_SCOPE_ONLY`, Mandatory Cache Version Sync via `node ./.ai_map/vscode_ast_mapper.mjs`.

2. **multi_tier_resilient_reverse_geocoding** (`ai_skills_registry/skills/multi_tier_resilient_reverse_geocoding/SKILL.md`):
   - Cache Busting Protocol: Force-refreshing requires passing `bypassCache: true` or calling `clearLocationCache()` to prevent stale in-memory POI mappings.
   - W3C Geolocation Spec: Hardware-level cache invalidation via `maximumAge: 0`.
