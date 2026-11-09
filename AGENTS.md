# Project Rules — CheckinApp

## Auto-run the Lean AI Workflow (mandatory)

Whenever the user's message asks to **change or plan** something in this project, you MUST activate the
workspace skill `ai-software-pipeline` (`.agents/skills/ai-software-pipeline/SKILL.md`) and follow the
**Lean 2-SubAgent + 1-Orchestrator Architecture**, before editing any project file.

Trigger intents (Thai or English, any phrasing):
- แก้ไข / แก้ / fix / bug / edit
- ปรับปรุง / ปรับ / improve / refactor / optimize / redesign
- เพิ่ม / สร้าง / พัฒนา / add / build / implement / feature
- สร้างแผน / วางแผน / ออกแบบ / plan / design / proposal

Behaviour:
1. Pick the mode (PLAN / LITE / FULL) as defined in the skill and state it in one line.
2. **Orchestrator (คุณ / Main Agent)**:
   - Always run **Phase 0** directly (`0.1` Second Brain retrieve + `0.2` Skill matching + `0.3` Surgical Codebase Map target locator) without spawning separate subagents to save tokens.
   - Deliver plans as **both** an `implementation_plan.md` artifact (`RequestFeedback: true`) **and** an interactive HTML plan (`interactive_plan.html`), then wait for user approval (`Proceed`) before changing files (unless the user explicitly commands immediate execution).
   - Coordinate and invoke the 2 subagents.
   - Always run **Phase 6** (`6.1` Skill extraction + `6.2` Second Brain ingest linked to `Flow ID`s) and deliver final summary report to the user.
3. **SubAgent 1 (`subagent_01_implementer` — Flash 3.8 High / flash, 1 ตัว)**:
   - Enforce **Map-First Surgical Line-Range Access (`MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`)**:
     * Never blind-read an entire source file (>80 lines) before checking `.ai_map/00_PROCESS_FLOW_MAP.md` and `.ai_map/01_FILE_FUNCTION_INDEX.md`.
     * Read only the target symbol's line range (`StartLine`–`EndLine` ± 10 lines).
   - **กฎเหล็ก**: "แก้ไขเฉพาะส่วนที่ต้องแก้ไข, ไม่แก้ไขส่วนที่ไม่เกี่ยวข้อง" (`STRICT_SURGICAL_SCOPE_ONLY`).
   - **Mandatory Cache Version Sync**: Whenever any file in `*.html`, `assets/css/**`, or `assets/js/**` is modified, MUST run `node ./.ai_map/vscode_ast_mapper.mjs` to auto-stamp a fresh `buildId` in `version.json` and sync `CURRENT_APP_BUILD` and `?v=<buildId>` across all 8 root HTML files.
   - After code edits, sync `.ai_map/` by running `node ./.ai_map/vscode_ast_mapper.mjs`.
4. **SubAgent 2 (`subagent_02_qa_auditor` — Flash 3.8 High / flash, 1 ตัว)**:
   - Audit the implementation against all requirements in the approved plan.
   - Run syntax and functional checks (`node --check`, verification tests).
   - **Audit Cache Version Sync**: Verify that `version.json` exists and that `CURRENT_APP_BUILD` and asset `?v=<buildId>` query params across all 8 HTML files match `version.json` exactly before issuing `PASS`.
   - Compare differences against branch `main` (`git diff main`) to verify compatibility and confirm zero unintended changes to unrelated code.
5. **Git Policy**: ห้ามรัน `git push` ขึ้น GitHub เด็ดขาด เว้นแต่ผู้ใช้มีคำสั่งชัดเจนให้ push

Do NOT trigger for: pure questions/explanations, reading or searching code, git operations (clone, commit,
branch), or when the user explicitly says not to use the workflow (e.g. "ไม่ต้องใช้ workflow", "แก้ตรงๆ เลย").

## Mandatory Cache Version Synchronization (ข้อกำหนดเหล็กการบังคับเคลียร์แคช)
1. ทุกครั้งที่มีการแก้ไขไฟล์ส่วน Frontend (`*.html`, `assets/css/**`, `assets/js/**`):
   - `subagent_01_implementer` **ต้อง** รันคำสั่ง `node ./.ai_map/vscode_ast_mapper.mjs` ทุกครั้ง
   - สคริปต์จะคำนวณ Content SHA-256 Hash แบบ Idempotent, สร้าง `buildId` ใหม่ใน `version.json`, และ Stamp `CURRENT_APP_BUILD = '<buildId>'` รวมทั้ง `?v=<buildId>` ให้กับ `<link href="assets/...">` และ `<script src="assets/...">` ในไฟล์ HTML ทั้ง 8 หน้าหลัก (`index.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`)
2. `subagent_02_qa_auditor` **ต้อง** ตรวจสอบว่าค่า `buildId` ใน `version.json` ตรงกับค่า `CURRENT_APP_BUILD` และ Query Parameter `?v=` ในไฟล์ HTML ทั้ง 8 หน้า 100% จึงจะอนุมัติให้ `PASS`

## Knowledge stores & Codebase Map
- **VS Code Surgical Codebase Map**: `.ai_map/`
  - Process flows & call chains: `.ai_map/00_PROCESS_FLOW_MAP.md`
  - File & function line-range index: `.ai_map/01_FILE_FUNCTION_INDEX.md`
  - Machine AST index: `.ai_map/CODE_INDEX.json`
  - Zero-token AST scanner: `node ./.ai_map/vscode_ast_mapper.mjs` (configured in `.vscode/tasks.json`)
- **Second Brain (LLM-Wiki)**: `second_brain_vault/` — start at `second_brain_vault/00_INDEX_MOC.md`
- **Skill registry**: `ai_skills_registry/SKILL_CATALOG.json`
- **Source documents of the workflow**: `AI Work Flow/`
