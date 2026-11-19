---
name: leg_selective_correction_and_executive_rbac
version: 1.0.0
description: Reusable pattern for leg-selective attendance time correction, idempotent remark suffix preservation, nullish per-leg audit snapshots, and Double-Layer Executive RBAC (UI + Model/API).
---

# Skill: Leg-Selective Time Correction & Double-Layer Executive RBAC (`v1.0.0`)

## When to Apply
Use this skill whenever implementing or extending an approval workflow that corrects abnormal attendance timestamps (late / absent legs) without overwriting normal legs, preserves original remarks and multi-round audit history, and requires tiered executive authority when an Admin submits their own request.

## Core Rules

1. **Leg-Selective Mutation Only (`#computeCorrectionTarget`)**
   - Evaluate split attendance status per leg (`checkIn`, `checkOut`) against the resolved shift window (`#resolveShiftTimesForLog`).
   - Mutate ONLY legs in `['late', 'absent_duty']` (plus `status === 'ขาดราชการ' && !check_out_time` on check-in) to the shift's `stdStart` / `stdEnd`.
   - Preserve untouched normal legs (e.g. `17:45`, `19:30`, `08:15`) and `null` checkouts intact.
   - Re-evaluate status with `status: 'กำลังประเมิน'` bypass so pre-existing stored statuses do not short-circuit recalculation.

2. **Idempotent Remark Suffix Preservation (`#buildCorrectedRemark`)**
   - If there is no prior meaningful remark (`''`, `'-'`, `'ในสถานที่'`, or raw status labels), set `'ขอแก้ไขเวลา'`.
   - If a meaningful prior remark exists (including `OFFSITE` reason), append `' (แก้ไขเวลา)'`.
   - Always guard idempotently (`clean === 'ขอแก้ไขเวลา' || clean.includes('(แก้ไขเวลา)')`) so repeated corrections never duplicate parentheses.

3. **Per-Leg Nullish Audit Snapshot & Edge-Case Guards**
   - Persist original snapshots using nullish coalescing (`log.correction_original_check_in ?? log.check_in_time`, `log.correction_original_check_out ?? log.check_out_time`, `log.correction_original_status ?? log.status`) so a second correction round on the same day never destroys round-1 originals.
   - Reset `correction_status = 'none'` if a mid-day regular checkout triggers `absent_duty` after morning approval.
   - Clear phantom `'pending'` requests in admin manual override (`saveAdminAttendanceRecord`) when a log is manually fixed to `'ปฏิบัติงานปกติ'`.
   - Provide `42703` / `PGRST204` graceful fallbacks whenever new additive SQL columns might lag behind frontend deployment.

4. **Double-Layer Executive RBAC (`AuthService.canApproveTimeCorrection`)**
   - Enforce identically at BOTH UI (hide checkbox & disable action buttons with explicit Thai status badge) and Model/Bulk mutation (`processTimeCorrectionsBulk`):
     - `User` requester → `SuperAdmin` or in-scope `Admin`.
     - `Admin` or `SuperAdmin` requester → `SuperAdmin` (any position) OR non-self in-scope `Admin` (`division`/`bureau`) with `position_type === 'ประเภทผู้บริหาร'` AND `position_title` in `['ผู้อำนวยการส่วน', 'ผู้อำนวยการกอง', 'เลขานุการ', 'เลขานุการสำนัก', 'หัวหน้ากลุ่มงาน', 'หัวหน้าฝ่าย']`.
