# Phase 0.1 — Second Brain Knowledge Retrieval
**Pipeline ID:** `PIPE-20261029-settings-early-shift-realtime-filter`
**Mode:** `PLAN`
**Linked Flows:** `FLOW_SETTINGS_01`, `FLOW_CHECKIN_01`

---

## 1. Retrieved Architecture Decisions & Domain Rules
1. **[[adr_001_vscode_surgical_codebase_map]]**:
   - Requires line-range surgical read/writes and AST map synchronization via `node ./.ai_map/vscode_ast_mapper.mjs`.
2. **[[rule_lock_normal_hours_checkin]]** & **[[fix_v19_realtime_shift_filter_and_personnel_modal]]**:
   - `filter_shifts_by_realtime` toggles whether work shifts in dropdown are filtered by the current clock time.
   - When enabled, only shifts where `nowMin` matches the shift's active window are shown.
   - Previous fix established that settings must persist gracefully with both Supabase upsert and localStorage fallback (`bma_filter_shifts_by_realtime`) to prevent schema discrepancy errors.
3. **[[rule_shift_select_empty_and_soft_ui_alerts]]**:
   - Check-in shift select dropdown must retain standard placeholder: `-- กรุณาเลือกช่วงเวลาปฏิบัติงาน --`.

## 2. Ingest Targets for Phase 6
- Ingest new Domain Rule: `second_brain_vault/02_domain_logic_and_rules/rule_early_shift_realtime_filter.md`
- Update `second_brain_vault/00_INDEX_MOC.md` linking to `FLOW_SETTINGS_01` and `FLOW_CHECKIN_01`.

