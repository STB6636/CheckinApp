# Phase 0.2 — Skill Matching & Registry
**Pipeline ID:** `PIPE-20261029-settings-early-shift-realtime-filter`

---

## 1. Activated Skills
- **`ai-software-pipeline`**: Multi-agent software engineering pipeline v3.0, enforcing Phase 0 through Phase 6, zero-token AST indexing, and subagent coordination.
- **`vscode_surgical_codebase_mapping`**: Precision AST line range mapping via `.ai_map/01_FILE_FUNCTION_INDEX.md`.

## 2. Subagent Architecture Allocation (Lean Token Strategy)
As explicitly requested by the user to minimize token usage:
1. **Flash Implementer SubAgent (Flash 3.8 High, 1 agent)**:
   - Perform surgical edits on target files according to exact plan specifications.
   - Run syntax verification (`node -c`) and AST mapper update.
2. **Flash QA Auditor SubAgent (Flash 3.8 High, 1 agent)**:
   - Audit diff against `main` (`git diff main`).
   - Verify boundary calculations (e.g. 17:00 - 30 min = 16:30, overnight shifts, wrap-around).
   - Ensure table layout and dropdown safeguards are 100% intact.
3. **Orchestrator (Parent)**:
   - Controls workflow, delivers artifacts, reports progress and SQL statements.

