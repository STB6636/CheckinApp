# Phase 0.1: Second Brain Retrieval

**Task ID**: PIPE-20261104-fix-staging-table-relations  
**Date**: 2026-11-04  
**Orchestrator**: agent_00_orchestrator  

## 1. Retrieved Notes
- `second_brain_vault/00_INDEX_MOC.md` (Central Map of Content)
- `second_brain_vault/02_domain_logic/rule_loca_v2_onsite_offsite_nextstep_and_staging_schema.md` (Staging schema isolation & Loca-V2 architecture)
- `second_brain_vault/01_architecture_decisions/adr_003_double_layer_rbac_hierarchy.md` (Double-Layer RBAC & Scope Filtering)
- `second_brain_vault/03_bug_postmortems_and_fixes/fix_attendance_model_missing_position_level.md` (PostgREST field selection patterns)

## 2. Past Pitfalls to Avoid
1. **PostgreSQL `CREATE TABLE (LIKE ... INCLUDING ALL)` does NOT copy Foreign Keys**:
   - In PostgreSQL, foreign key constraints are cross-table dependencies and are omitted during `LIKE ... INCLUDING ALL`.
   - PostgREST strictly requires foreign key constraints in the schema cache to support joined nested queries like `tableA?select=*,tableB(...)`.
   - Without explicit FKs, PostgREST returns HTTP 400 (`PGRST200`).
2. **Fragile Catch Blocks returning Empty Arrays**:
   - When a nested join query fails, returning `[]` causes the frontend table to display "0 คน" or "ไม่พบข้อมูล", hiding the true underlying error from administrators and giving an impression of wiped data.
3. **Session Verification vs Login Disconnect**:
   - `AuthService.verifySessionWithDatabase` tolerates errors and maintains the cached session, which allowed the user to remain logged in as SuperAdmin in the browser even while live queries were failing.
   - However, any fresh `AuthService.login()` call would fail with a connection error unless relations exist or resilient fallbacks are present.

## 3. Mandatory Design Constraints
- Provide an immediate SQL patch `sql/fix_staging_foreign_keys.sql` with explicit foreign key constraints and `NOTIFY pgrst, 'reload schema';`.
- Provide client-side resilient two-stage queries in `PersonnelModel.getAll()`, `UserModel.getAll()`, `AuthService.login()`, and `AttendanceModel.getSpecialRequests()` so that even if PostgREST cache reloads or foreign keys are absent, data is guaranteed to render accurately.

