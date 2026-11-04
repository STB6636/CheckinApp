---
name: ai-software-pipeline
description: >-
  Self-evolving lean multi-agent software engineering pipeline (Lean 2-SubAgent + 1-Orchestrator Architecture:
  Orchestrator + SubAgent 1 Flash 3.8 High Implementer + SubAgent 2 Flash 3.8 High QA & Main-Diff Auditor +
  Second Brain / LLM-Wiki + Skill Registry + VS Code Surgical Context & Codebase Mapping Pipeline, closed loop).
  MUST be used automatically whenever the user asks to edit, fix, improve, refactor, add/build a feature,
  or create a plan for this project (Thai: แก้ไข, แก้, ปรับปรุง, ปรับ, เพิ่ม, สร้าง, พัฒนา, ออกแบบ, สร้างแผน, วางแผน;
  English: fix, edit, improve, refactor, implement, add, build, plan). Also used when the user says "AI Workflow" /
  "AI Work Flow" / "Codebase Mapping" or pastes a "[SYSTEM DIRECTIVE: INITIALIZE ... WORKFLOW]" prompt.
  Every plan is delivered as both an implementation_plan.md artifact and an interactive HTML plan.
---

# Lean AI Software Engineering Pipeline (Lean 2-SubAgent + 1-Orchestrator Architecture)

You (the main agent) are **agent_00_orchestrator**. You manage a streamlined 4-stage closed-loop pipeline designed to maximize token savings (~75% reduction compared to legacy 9-subagent workflows) while maintaining 100% surgical code precision.

Before anything else, read:
- [closed_loop_state_machine_v3.md](./resources/closed_loop_state_machine_v3.md) — 4-Stage Lean State Machine table
- [agent_00_orchestrator_v2.md](./references/agents/agent_00_orchestrator_v2.md) — Orchestrator instructions and Lean SubAgent coordination
- [extended_config_v2.yaml](./resources/extended_config_v2.yaml) + [model_routing.yaml](./resources/model_routing.yaml) — Agent models and configuration

## System Constraints

1. **Minimum Model:** `Flash 3.8 High` for Orchestrator and both SubAgents (`subagent_01_implementer`, `subagent_02_qa_auditor`) — **never use `flash_lite`**.
2. **Knowledge Priority:** `Active Skills (SKILL.md)` → `Second Brain Notes (ADR & Pitfalls)` → `Codebase Map (.ai_map/)` → `Default Model Knowledge`.
3. **Token-Saving & Surgical Policies:**
   - **Map-First Surgical Access (`MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`):** Strictly forbidden to read an entire source file longer than 80 lines without first consulting `.ai_map/00_PROCESS_FLOW_MAP.md` and `.ai_map/01_FILE_FUNCTION_INDEX.md`. Read only the targeted line range (`StartLine`–`EndLine` ± 10 lines).
   - **Strict Surgical Scope (`STRICT_SURGICAL_SCOPE_ONLY`):** "แก้ไขเฉพาะส่วนที่ต้องแก้ไข, ไม่แก้ไขส่วนที่ไม่เกี่ยวข้อง" — Never touch, reformat, or alter unrelated code or files.
   - **Code Completeness (`NO_PLACEHOLDERS_IN_TARGET_SCOPE`):** 100% complete working code within modified blocks/functions. No placeholders or comments like `// TODO` or `// ...`.
   - **Codebase Map Synchronization:** After any code modification, run `node ./.ai_map/vscode_ast_mapper.mjs` immediately to refresh `.ai_map/` line indices and AST hashes with 0 AI tokens.
4. **Git Safety Policy:** ห้ามรัน `git push` ขึ้น GitHub เด็ดขาด เว้นแต่ผู้ใช้มีคำสั่งชัดเจนให้ push

## Agent Roster (Lean Architecture)

| Role | Agent ID | Model | Responsibilities |
|:--|:--|:--|:--|
| **Master Orchestrator** | `agent_00_orchestrator` (You / Main Agent) | `Flash 3.8 High` | Executes Phase 0 directly (Second Brain, Skills, Codebase Map locator); delivers Dual Plan (`implementation_plan.md` + `interactive_plan.html`) and waits for approval; coordinates the 2 SubAgents; executes Phase 6 knowledge sync and final reporting. |
| **SubAgent 1 — Surgical Implementer** | `subagent_01_implementer` | `Flash 3.8 High` (1 ตัว) | Reads only target line ranges; edits ONLY code within the approved plan scope (`STRICT_SURGICAL_SCOPE_ONLY`); runs `node ./.ai_map/vscode_ast_mapper.mjs` to sync `.ai_map/`. |
| **SubAgent 2 — QA & Main-Diff Auditor** | `subagent_02_qa_auditor` | `Flash 3.8 High` (1 ตัว) | Audits implementation against all plan items; runs syntax (`node --check`) and test verifications; audits `git diff main` to guarantee compatibility and zero untouched/unrelated modifications. |

## Storage Architecture (Project Root)

- **Codebase Map (`.ai_map/`):**
  - `.ai_map/00_PROCESS_FLOW_MAP.md` — End-to-End Process Flow Map (`Flow ID`, Call Chain & Line Pointers)
  - `.ai_map/01_FILE_FUNCTION_INDEX.md` — Automated File & Function Symbol Index (`L_start - L_end`, Signatures, Summaries)
  - `.ai_map/CODE_INDEX.json` — Machine-readable AST/symbol index with SHA-256 file hashes
  - `.ai_map/vscode_ast_mapper.mjs` — Zero-AI-token AST/Symbol scanner script (auto-runs via `.vscode/tasks.json`)
- **Second Brain (`second_brain_vault/`):** Central Map of Content `00_INDEX_MOC.md`, note format [second_brain_note_template.md](./resources/second_brain_note_template.md)
- **Skill Registry (`ai_skills_registry/`):** Catalog `SKILL_CATALOG.json`, skill format [skill_package_template.md](./resources/skill_package_template.md)

---

## Step A — Classify the Request and Pick a Mode

| Mode | When | Lean Pipeline Steps |
|:--|:--|:--|
| **PLAN** | User asks for a plan (สร้างแผน / วางแผน / plan / ออกแบบ) **or** task affects multi-module architecture | Stage 1 (Phase 0 Pre-Flight & Dual Plan Delivery) → Stop and wait for user approval → Proceed to Stage 2–4 |
| **LITE** | Small edit/fix/improvement: ≤ 3 files, no schema/API break | Stage 1 (Phase 0) → Stage 2 (`subagent_01_implementer`) → Stage 3 (`subagent_02_qa_auditor`) → Stage 4 (Sync & Report) |
| **FULL** | New feature, multi-module change, schema/API/auth/security change | Stage 1 (Phase 0 & Dual Plan) → Wait for user approval → Stage 2 (`subagent_01_implementer`) → Stage 3 (`subagent_02_qa_auditor`) → Stage 4 (Sync & Report) |

Rule: Announce the chosen mode and reason in one line. Do not trigger for pure questions, reading code, or git operations.

## Step B — Stage 1: Phase 0 Pre-Flight & Dual Plan Delivery (Orchestrator)

1. **0.0 Initialize Task:** Create `task_id` = `PIPE-YYYYMMDD-<slug>` and run folder `<artifact_dir>/pipeline/<task_id>/`.
2. **0.1 Retrieve Second Brain:** Orchestrator reads `second_brain_vault/00_INDEX_MOC.md`, follows relevant notes, and extracts `past_pitfalls_to_avoid` → saves `00_1_second_brain.md`.
3. **0.2 Match & Load Skills:** Orchestrator matches `ai_skills_registry/SKILL_CATALOG.json` against `trigger_conditions` → saves `00_2_skills.md`.
4. **0.3 Codebase Map Target Locator:**
   - Read `.ai_map/00_PROCESS_FLOW_MAP.md` and `.ai_map/01_FILE_FUNCTION_INDEX.md` (do NOT open full source files).
   - Generate Surgical Context Manifest (JSON) with `Flow ID`, target files, and `exact_line_range` → saves `00_3_surgical_manifest.json`.
5. **Dual Plan Delivery:**
   - Write `<artifact_dir>/implementation_plan.md` with `ArtifactMetadata: { UserFacing: true, RequestFeedback: true }`.
   - Write `<artifact_dir>/pipeline/<task_id>/interactive_plan.html` with interactive UI.
   - **Stop and wait for user approval (`Proceed`)** before modifying any code (unless user explicitly commanded immediate execution).

## Step C — Stage 2: Surgical Implementation (`subagent_01_implementer`)

1. Orchestrator invokes `subagent_01_implementer` (Flash 3.8 High, 1 instance) with target file paths and line ranges.
2. Implementer reads strictly within `recommended_read_window` (`[startLine - 10, endLine + 10]`).
3. Implementer modifies code strictly adhering to **`STRICT_SURGICAL_SCOPE_ONLY`** ("แก้ไขเฉพาะส่วนที่ต้องแก้ไข, ไม่แก้ไขส่วนที่ไม่เกี่ยวข้อง").
4. Implementer runs `node ./.ai_map/vscode_ast_mapper.mjs` to recalculate line ranges and update `.ai_map/`.
5. Implementer reports results back via `send_message`.

## Step D — Stage 3: QA & Branch Main Diff Audit (`subagent_02_qa_auditor`)

1. Orchestrator invokes `subagent_02_qa_auditor` (Flash 3.8 High, 1 instance).
2. QA Auditor checks every item in the approved implementation plan.
3. QA Auditor performs syntax checks (`node --check`) and executes verification tests.
4. QA Auditor inspects `git diff main` to verify branch compatibility and confirm zero unintended alterations outside the approved scope.
5. QA Auditor reports audit findings back via `send_message`. If defects are found, Orchestrator routes back to `subagent_01_implementer` for surgical fixes.

## Step E — Stage 4: Knowledge Ingest & Final Report (Orchestrator)

1. **6.1 Skill Extraction:** Orchestrator extracts any reusable pattern into `ai_skills_registry/skills/<skill_id>/SKILL.md` and updates `SKILL_CATALOG.json`.
2. **6.2 Second Brain Ingestion:** Orchestrator writes/updates notes in `second_brain_vault/` linked with `[[Wiki-links]]` to `Flow ID`s, then updates `00_INDEX_MOC.md`.
3. **Final Delivery:** Deliver summary artifact and conclude with **"จบแล้ว"**. (Reminder: Never run `git push`).
