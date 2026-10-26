# Project Rules — CheckinApp

## Auto-run the AI Workflow v3.0 (mandatory)

Whenever the user's message asks to **change or plan** something in this project, you MUST activate the
workspace skill `ai-software-pipeline` (`.agents/skills/ai-software-pipeline/SKILL.md`) and follow it,
before editing any project file.

Trigger intents (Thai or English, any phrasing):
- แก้ไข / แก้ / fix / bug / edit
- ปรับปรุง / ปรับ / improve / refactor / optimize / redesign
- เพิ่ม / สร้าง / พัฒนา / add / build / implement / feature
- สร้างแผน / วางแผน / ออกแบบ / plan / design / proposal

Behaviour:
1. Pick the mode (PLAN / LITE / FULL) as defined in the skill and state it in one line.
2. Always run **Phase 0** (`0.1` Second Brain retrieve + `0.2` Skill matching + `0.3` Surgical Codebase Map target locator) and **Phase 6** (`6.1` Skill extraction + `6.2` Second Brain ingest linked to `Flow ID`s).
3. Enforce **Map-First Surgical Line-Range Access (`MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`)**:
   - Never blind-read an entire source file (>80 lines) before checking `.ai_map/00_PROCESS_FLOW_MAP.md` and `.ai_map/01_FILE_FUNCTION_INDEX.md`.
   - Read only the target symbol's line range (`StartLine`–`EndLine` ± 10 lines) and sync `.ai_map/` after edits by running `node ./.ai_map/vscode_ast_mapper.mjs` (Phase 3.5).
4. Any plan is delivered as **both** an `implementation_plan.md` artifact (RequestFeedback) **and** an
   interactive HTML plan, then wait for user approval before changing files (unless the user explicitly commands immediate execution in their prompt).

Do NOT trigger for: pure questions/explanations, reading or searching code, git operations (clone, commit,
push, branch), or when the user explicitly says not to use the workflow (e.g. "ไม่ต้องใช้ workflow", "แก้ตรงๆ เลย").

## Knowledge stores & Codebase Map
- **VS Code Surgical Codebase Map**: `.ai_map/`
  - Process flows & call chains: `.ai_map/00_PROCESS_FLOW_MAP.md`
  - File & function line-range index: `.ai_map/01_FILE_FUNCTION_INDEX.md`
  - Machine AST index: `.ai_map/CODE_INDEX.json`
  - Zero-token AST scanner: `node ./.ai_map/vscode_ast_mapper.mjs` (configured in `.vscode/tasks.json`)
- **Second Brain (LLM-Wiki)**: `second_brain_vault/` — start at `second_brain_vault/00_INDEX_MOC.md`
- **Skill registry**: `ai_skills_registry/SKILL_CATALOG.json`
- **Source documents of the workflow** (do not edit as part of normal tasks): `AI Work Flow/`
