# Phase 0.1: Second Brain Vault Knowledge Retrieval
**Pipeline ID:** PIPE-20261027-shift-select-empty-and-soft-ui-confirm-alert
**Target Flows:** `FLOW_CHECKIN_01` (Attendance Recording Flow), `FLOW_LAYOUT_01` (Soft UI SweetAlerts & Viewport Integrity)
**Date:** 2026-10-27

## Retrieved Context & Architectural Constraints
1. **Rule Desktop Zero-Scroll & GPS Layout:**
   - File: `second_brain_vault/02_domain_logic_and_rules/rule_desktop_zero_scroll_and_gps_layout.md`
   - Total height on Desktop PC must stay within the 840px safe zone.
   - Adding a confirmation dialog and dropdown validation has zero impact on DOM layout height, preserving Zero-Scroll 100%.
2. **Creative Tim Soft UI Dashboard SweetAlerts Specification:**
   - Reference: `https://www.creative-tim.com/learning-lab/tailwind/html/sweetAlerts/soft-ui-dashboard/`
   - Standard Soft UI styling uses `buttonsStyling: false` with custom Tailwind classes:
     - Confirm button: `bg-gradient-to-tl from-[#00744B] to-emerald-500 text-white rounded-xl font-bold shadow-md hover:scale-102 active:scale-95`
     - Cancel button: `bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200`
     - Popup: `rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md`
3. **DOM Contract Invariance (110 DOM IDs):**
   - Retain all 110 DOM IDs intact on `checkin.html`.

