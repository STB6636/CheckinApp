# Phase 0.1: Second Brain Vault Knowledge Retrieval
**Pipeline ID:** PIPE-20261027-shift-select-empty-default-and-scroll-alert
**Target Flows:** `FLOW_CHECKIN_01` (Attendance Recording Flow), `FLOW_LAYOUT_01` (Zero-Scroll & Responsive Behavior)
**Date:** 2026-10-27

## Retrieved Context & Architectural Constraints
1. **Rule Desktop Zero-Scroll & GPS Layout:**
   - File: `second_brain_vault/02_domain_logic_and_rules/rule_desktop_zero_scroll_and_gps_layout.md`
   - Total height on Desktop PC must stay within the 840px safe zone.
   - Adjusting dropdown options and adding validation logic does not increase container height, so Zero-Scroll on PC is preserved 100%.
2. **DOM Contract Invariance (110 DOM IDs):**
   - Retain `#checkinShiftSelect`, `#checkinShiftSelectLabel`, `#shiftSelectorContainer`, `#btnSubmitCheckinMain`, and all other 106 IDs intact.
3. **Shift Validation & Mobile Scroll Architecture:**
   - Shift selector dropdown must not auto-select index 0; it must start with `<option value="">-- กรุณาเลือกช่วงเวลาปฏิบัติงาน --</option>`.
   - On clicking submit, if shift is not selected (`value === ""`), show warning alert, smooth scroll to `#checkinShiftSelect`, focus the element, and add a temporary highlight ring for visual feedback.

