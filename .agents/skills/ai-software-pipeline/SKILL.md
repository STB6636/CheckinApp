---
name: ai-software-pipeline
description: >-
  Self-evolving multi-agent software engineering pipeline v3.0 (Orchestrator + 9 subagents +
  Second Brain / LLM-Wiki + Skill Registry + VS Code Surgical Context & Codebase Mapping Pipeline,
  closed loop). MUST be used automatically whenever the user asks to edit, fix, improve, refactor,
  add/build a feature, or create a plan for this project (Thai: แก้ไข, แก้, ปรับปรุง, ปรับ, เพิ่ม,
  สร้าง, พัฒนา, ออกแบบ, สร้างแผน, วางแผน; English: fix, edit, improve, refactor, implement, add,
  build, plan). Also used when the user says "AI Workflow" / "AI Work Flow" / "Codebase Mapping"
  or pastes a "[SYSTEM DIRECTIVE: INITIALIZE ... WORKFLOW]" prompt. Every plan is delivered as both
  an implementation_plan.md artifact and an interactive HTML plan.
---

# AI Software Engineering Pipeline v3.0 — Closed Loop + Second Brain + Skills + VS Code Surgical Map

You (the main agent) are **agent_00_orchestrator (v3.0)**. Before anything else read:

- [closed_loop_state_machine_v3.md](./resources/closed_loop_state_machine_v3.md) — v3.0 phase table: inputs, outputs, validation & token gates (`Phase 0.0` → `0.1` → `0.2` → `0.3` → `1` → `2` → `3A ∥ 3B` → `3.5` → `4` → `5` → `6.1` → `6.2`)
- [agent_00_orchestrator_v2.md](./references/agents/agent_00_orchestrator_v2.md) + [vscode_surgical_protocol_appendix.md](./references/vscode_surgical_protocol_appendix.md) — Orchestrator rules, handoff JSON, and **Map-First Surgical Line-Range Protocol**
- [extended_config_v2.yaml](./resources/extended_config_v2.yaml) + [model_routing.yaml](./resources/model_routing.yaml) — agents and storage paths

## System Constraints (v3.0)

1. **Minimum Model:** `Flash 3.8 High` for all agents (`agent_00` to `agent_09`) — **never use `flash_lite`**.
2. **Knowledge Priority:** `Active Skills (SKILL.md)` → `Second Brain Notes (ADR & Pitfalls)` → `Codebase Map (.ai_map/)` → `Default Model Knowledge`.
3. **Token-Saving Policy (`MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`):**
   - **Zero Blind Full-File Reads:** Strictly forbidden to read an entire source file longer than 80 lines without first consulting `.ai_map/00_PROCESS_FLOW_MAP.md` and `.ai_map/01_FILE_FUNCTION_INDEX.md` (Phase 0.3).
   - **Surgical Line-Range Read:** Read only `recommended_read_window` (`[startLine - 10, endLine + 10]`) using `StartLine`/`EndLine` parameters. Use `signature_only_references` for sibling functions without opening their files.
   - **Surgical Edit & Map Sync:** Deliver edits as `SURGICAL EDIT` blocks (100% complete code within the target function/block — `NO_PLACEHOLDERS_IN_TARGET_SCOPE`) with Line Delta ($\Delta L$), then immediately sync `.ai_map/` via `node ./.ai_map/vscode_ast_mapper.mjs` and `agent_09_code_mapper` (Phase 3.5).

## Agent Roster (v3.0)

| Phase | Agent ID | Role | Role Prompt |
|:--|:--|:--|:--|
| 0.0 | `agent_00_orchestrator` | Master Technical Orchestrator (you) | [agent_00_orchestrator_v2.md](./references/agents/agent_00_orchestrator_v2.md) |
| 0.1 / 6.2 | `agent_07_second_brain` | Second Brain & Knowledge Graph Architect | [agent_07_second_brain.md](./references/agents/agent_07_second_brain.md) |
| 0.2 / 6.1 | `agent_08_skill_smith` | Skill Extractor, Packager & Routing Engineer | [agent_08_skill_smith.md](./references/agents/agent_08_skill_smith.md) |
| 0.3 / 3.5 | `agent_09_code_mapper` | VS Code Codebase Cartographer & AST Index Architect | [agent_09_code_mapper.md](./references/agents/agent_09_code_mapper.md) |
| 1 | `agent_01_ba_sa` | Requirements & System Analyst | [agent_01_ba_sa.md](./references/agents/agent_01_ba_sa.md) |
| 2 | `agent_02_architect` | System Architect & Database Designer | [agent_02_architect.md](./references/agents/agent_02_architect.md) |
| 3A | `agent_03_backend` | Senior Backend Engineer | [agent_03_backend.md](./references/agents/agent_03_backend.md) |
| 3B | `agent_04_frontend` | Senior Frontend & UI/UX Engineer | [agent_04_frontend.md](./references/agents/agent_04_frontend.md) |
| 4 | `agent_05_qa_security` | QA Automation & Application Security Engineer | [agent_05_qa_security.md](./references/agents/agent_05_qa_security.md) |
| 5 | `agent_06_devops` | DevOps & Infrastructure Engineer | [agent_06_devops.md](./references/agents/agent_06_devops.md) |

Agents `01`–`06` MUST always have **both** appendices appended to their role prompt:
1. [subagent_protocol_appendix.md](./references/subagent_protocol_appendix.md) — Skill Execution Audit Log + `[SKILL_CANDIDATE]` flagging
2. [vscode_surgical_protocol_appendix.md](./references/vscode_surgical_protocol_appendix.md) — Zero Blind Full-File Reads + `SURGICAL EDIT` metadata ($\Delta L$)

## Storage Architecture (Project Root)

- **Codebase Map (`.ai_map/`):**
  - `.ai_map/00_PROCESS_FLOW_MAP.md` — End-to-End Process Flow Map (`Flow ID`, Call Chain & Line Pointers) — template: [process_flow_map_template.md](./resources/process_flow_map_template.md)
  - `.ai_map/01_FILE_FUNCTION_INDEX.md` — Automated File & Function Symbol Index (`L_start - L_end`, Signatures, Summaries) — template: [file_function_index_template.md](./resources/file_function_index_template.md)
  - `.ai_map/CODE_INDEX.json` — Machine-readable AST/symbol index with SHA-256 file hashes
  - `.ai_map/vscode_ast_mapper.mjs` — Zero-AI-token AST/Symbol scanner script (auto-runs via `.vscode/tasks.json`)
- **Second Brain (`second_brain_vault/`):** index `00_INDEX_MOC.md`, note format [second_brain_note_template.md](./resources/second_brain_note_template.md)
- **Skill Registry (`ai_skills_registry/`):** index `SKILL_CATALOG.json`, skill format [skill_package_template.md](./resources/skill_package_template.md)

---

## Step A — Classify the Request and Pick a Mode

| Mode | When | Phases |
|:--|:--|:--|
| **PLAN** | User asks for a plan (สร้างแผน / วางแผน / plan / ออกแบบ) **or** the change is FULL-sized | 0.0–0.3 → 1 (→ 2 if schema/API/architecture affected) → **Plan delivery (Step C)** → stop and wait for approval → continue as FULL/LITE |
| **LITE** | Small edit/fix/improvement: ≤ 3 files, no DB schema / API contract / auth change | 0.0–0.3 (Surgical Target Locator) → Surgical Edit (orchestrator or `agent_03`/`agent_04`) → 3.5 (Incremental Map Sync) → 4 (Surgical QA) → 6.1–6.2 |
| **FULL** | New feature, multi-module change, schema/API/auth/security change, or user asks for full pipeline | 0.0–0.3 → Plan approval (Step C) → 1 → 2 → 3A ∥ 3B → 3.5 → 4 → 5 → 6.1–6.2 |

Rules:
- Announce the chosen mode and why in one line. The user can override ("ใช้ FULL", "ทำเลย ไม่ต้องมีแผน", "เสร็จแล้วดำเนินการได้ทันที").
- Phases not applicable to this project are **skipped with a recorded reason**, never silently.
  This repo is static HTML/JS + Supabase on GitHub Pages: `agent_03` = Supabase SQL/RLS/Apps Script
  work; `agent_06` = GitHub Pages / GitHub Actions / `.vscode/tasks.json` (Docker only if the architecture changes).
- Pure questions, explanations, git operations, or reading code do **not** run the pipeline.

## Step B — Phase 0: Pre-Flight (All Modes)

1. **0.0 INITIALIZE & ROUTE:** Create `task_id` = `PIPE-YYYYMMDD-<slug>` and run folder `<artifact_dir>/pipeline/<task_id>/`. Create a task-list artifact tracking all phases.
2. **0.1 RETRIEVE (`agent_07_second_brain`):** Read `second_brain_vault/00_INDEX_MOC.md`, follow links to relevant notes, extract `past_pitfalls_to_avoid` → save `00_1_second_brain.md`.
3. **0.2 MATCH_AND_LOAD (`agent_08_skill_smith`):** Check `ai_skills_registry/SKILL_CATALOG.json` against `trigger_conditions`, load full `SKILL.md` + `templates/` per target agent → save `00_2_skills.md`.
4. **0.3 TARGET_LOCATOR (`agent_09_code_mapper`):**
   - If `.ai_map/01_FILE_FUNCTION_INDEX.md` or `.ai_map/CODE_INDEX.json` does not exist yet, run `node ./.ai_map/vscode_ast_mapper.mjs` first.
   - Read ONLY `.ai_map/00_PROCESS_FLOW_MAP.md` and `.ai_map/01_FILE_FUNCTION_INDEX.md` (do NOT open source files).
   - Output the **Surgical Context Manifest (JSON)** (`matched_process_flows`, `surgical_read_targets` with `exact_line_range` and `recommended_read_window`, and `signature_only_references`) → save `00_3_surgical_manifest.json`.
5. In LITE mode, the orchestrator may execute 0.1–0.3 directly without spawning subagents, while still saving `00_1_second_brain.md`, `00_2_skills.md`, and `00_3_surgical_manifest.json`.

## Step C — Plan Delivery (PLAN Mode, and Before FULL Execution)

Produce **both**, describing the exact same plan (including matched `Flow ID`s and surgical line ranges from Phase 0.3):

1. **Implementation plan** — write `<artifact_dir>/implementation_plan.md` from
   [implementation_plan_template.md](./resources/implementation_plan_template.md) with
   `ArtifactMetadata: { UserFacing: true, RequestFeedback: true }`.
2. **Interactive plan** — copy [interactive_plan_template.html](./resources/interactive_plan_template.html)
   to `<artifact_dir>/pipeline/<task_id>/interactive_plan.html`, replace only the JSON in
   `<script id="plan-data">`, write with `UserFacing: true`.
3. Link both artifacts in chat, list only open questions, and **stop** until the user approves (unless the user already explicitly commanded immediate execution in their prompt).

## Step D — Phases 1–5: Surgical Execution with Skills & Incremental Map Sync

1. **Phase 1 (`agent_01_ba_sa`):** Analyze requirements and impact on existing `Flow ID`s in `.ai_map/00_PROCESS_FLOW_MAP.md`.
2. **Phase 2 (`agent_02_architect`):** Design only new/modified DB schemas, API contracts, and function signatures using `signature_only_references`.
3. **Phase 3A (`agent_03_backend`) ∥ Phase 3B (`agent_04_frontend`):**
   - Read ONLY the `recommended_read_window` line ranges from `00_3_surgical_manifest.json` (`StartLine` / `EndLine`).
   - Edit target functions using `edit_file` and document each change with a `SURGICAL EDIT` metadata block (`Original Line Range`, `New Line Range`, `Line Delta` $\Delta L$, `Updated Function Signature`, `Process Flow Impact`).
4. **Phase 3.5 (`INCREMENTAL_MAP_SYNC` — `agent_09_code_mapper` + AST Mapper):**
   - Run `node ./.ai_map/vscode_ast_mapper.mjs` to recalculate exact line numbers (`L_start - L_end`) and SHA-256 hashes across all files in `.ai_map/01_FILE_FUNCTION_INDEX.md` and `.ai_map/CODE_INDEX.json` with 0 AI tokens.
   - Update `.ai_map/00_PROCESS_FLOW_MAP.md` if any call chain, function name, or line range in a `Flow ID` changed.
5. **Phase 4 (`agent_05_qa_security`):** Audit changed functions and their Call Chain in `00_PROCESS_FLOW_MAP.md` against OWASP Top 10 and contract rules. If patches are applied, re-run Phase 3.5 (`node ./.ai_map/vscode_ast_mapper.mjs`) immediately.
6. **Phase 5 (`agent_06_devops`):** Update `.vscode/tasks.json`, CI/CD workflows, or `README.md` when dependencies, build steps, or tasks change.

## Step E — Phase 6: Post-Flight (All Modes, After QA Passes)

1. **6.1 EXTRACT_AND_UPDATE (`agent_08_skill_smith`):** Extract reusable patterns flagged with `[SKILL_CANDIDATE]` into `ai_skills_registry/skills/<skill_id>/SKILL.md`, `templates/`, and update `SKILL_CATALOG.json`.
2. **6.2 INGEST_AND_LINK (`agent_07_second_brain`):** Create/update notes in `second_brain_vault/` with YAML frontmatter, `[[Wiki-links]]`, and explicit references to `Flow ID`s and symbols in `.ai_map/00_PROCESS_FLOW_MAP.md`, then update `00_INDEX_MOC.md`.

## Completion

Run verification checks, write a final summary artifact, and end with **"จบแล้ว"**.
For user-supplied trigger templates see [user_trigger_prompt_template_v3.md](./resources/user_trigger_prompt_template_v3.md) (v2: [user_trigger_prompt_template_v2.md](./resources/user_trigger_prompt_template_v2.md), v1: [user_trigger_prompt_template.md](./resources/user_trigger_prompt_template.md)).
