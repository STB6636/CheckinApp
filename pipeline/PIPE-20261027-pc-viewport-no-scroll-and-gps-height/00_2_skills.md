# Phase 0.2: Skill Matching
**Pipeline ID:** PIPE-20261027-pc-viewport-no-scroll-and-gps-height
**Target Flows:** `FLOW_LAYOUT_01`, `FLOW_GPS_01`
**Date:** 2026-10-27

## Matched Skills
1. **`ai-software-pipeline`**:
   - Streamlined multi-agent execution with 2 subagents (Flash 3.8 High model) to save tokens:
     - 1 Worker SubAgent (Flash model) for file editing.
     - 1 QA / Reviewer SubAgent (Flash model) for verification and git diff comparison with `origin/main`.
2. **`generative_ui`**:
   - Used to generate `interactive_plan.html` for rich visual proposal and wireframes.
3. **`surgical_context_access`**:
   - Surgical line-range editing in `checkin.html` and `CheckinController.js`.

