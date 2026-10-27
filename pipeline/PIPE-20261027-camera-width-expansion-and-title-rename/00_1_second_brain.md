# Phase 0.1: Second Brain Vault Knowledge Retrieval
**Pipeline ID:** PIPE-20261027-camera-width-expansion-and-title-rename
**Target Flows:** `FLOW_LAYOUT_01` (Desktop Grid Balance), `FLOW_PHOTO_01` (Camera Card Title & Proportions), `FLOW_GPS_01` (GPS Right Column Balance)
**Date:** 2026-10-27

## Retrieved Context & Architectural Constraints
1. **Rule Desktop Zero-Scroll & GPS Layout:**
   - File: `second_brain_vault/02_domain_logic_and_rules/rule_desktop_zero_scroll_and_gps_layout.md`
   - Total height budget on Desktop PC must stay under 850px to ensure Zero-Scroll.
   - Using grid ratio `350px 1fr` (~350px left, ~590px right) expands camera card width comfortably while keeping camera vertical height at ~440px and total grid height at ~540px.
2. **Camera Card Gap Control:**
   - Changing `#cameraSectionCard` from `justify-between` to `justify-start` with `mt-2.5` / `mt-3` below camera viewfinder eliminates the excessive vertical gap between camera and bottom button.
3. **Card Title Renaming:**
   - Renaming `ภาพถ่ายยืนยันตัวตน (3:4)` to `ถ่ายภาพยืนยันตัวตน` per user instruction.
4. **DOM Contract Invariance (110 DOM IDs):**
   - Retain all 110 DOM IDs intact on `checkin.html`.

