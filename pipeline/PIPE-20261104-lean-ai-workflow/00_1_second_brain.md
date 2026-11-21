# Phase 0.1 — Second Brain Retrieval (`PIPE-20261104-lean-ai-workflow`)

## Retrieved Context from `second_brain_vault/`
- **`00_INDEX_MOC.md`**: Central Map of Content for CheckinApp-UXUI architecture, business rules, and engineering learnings.
- **Root Cause Identified**:
  - Previous AI Workflow v3.0 mandated 9 distinct subagents (`agent_01_ba_sa` through `agent_09_code_mapper`) across 12 sequential handoffs.
  - This caused excessive token consumption and redundant context passing.
- **Target Architecture (Lean 2-SubAgent + 1-Orchestrator Pipeline)**:
  1. **Orchestrator (Main Agent)**:
     - Performs Phase 0 (`0.1` Second Brain retrieval, `0.2` Skill matching, `0.3` Surgical Codebase Map locator) directly.
     - Creates Dual Plan (`implementation_plan.md` artifact + `interactive_plan.html`) and waits for user approval.
     - Controls SubAgents, synthesizes results, updates Second Brain & Skill Registry (Phase 6), and reports to the user.
  2. **SubAgent 1 — Surgical Implementer (`Flash 3.8 High` / `flash`, 1 instance)**:
     - Reads only the targeted files/line ranges specified in the approved plan.
     - Edits ONLY the targeted sections (`แก้ไขเฉพาะส่วนที่ต้องแก้ไข, ไม่แก้ไขส่วนที่ไม่เกี่ยวข้อง`).
     - Runs `node ./.ai_map/vscode_ast_mapper.mjs` to sync the Codebase Map after code edits.
  3. **SubAgent 2 — QA Auditor & Branch `main` Diff Specialist (`Flash 3.8 High` / `flash`, 1 instance)**:
     - Audits the implementation against the approved plan.
     - Compares changes against Branch `main` (`git diff main`) to verify compatibility and ensure no unrelated code was modified.

