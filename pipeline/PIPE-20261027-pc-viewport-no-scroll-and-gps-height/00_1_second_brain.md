# Phase 0.1: Second Brain Vault Knowledge Retrieval
**Pipeline ID:** PIPE-20261027-pc-viewport-no-scroll-and-gps-height
**Target Flows:** `FLOW_LAYOUT_01` (Responsive Viewport & Grid Architecture), `FLOW_GPS_01` (GPS Map Viewfinder), `FLOW_PHOTO_01` (Camera Frame Ratio)
**Date:** 2026-10-27

## Retrieved Context & Architectural Constraints
1. **ADR-004 (Checkin Viewport Lock & Drawer Architecture):**
   - File: `second_brain_vault/01_architecture_decisions/adr_004_checkin_viewport_lock_and_drawer.md`
   - Zero-scroll principle on PC and Mobile: Vertical layout height budget on Desktop PC (1080p, viewport ~880px) must not exceed viewport height so that no browser scroll bar appears.
2. **Rule: Camera Portrait 3:4 Aspect Ratio & Minimal Margin:**
   - File: `second_brain_vault/02_domain_logic_and_rules/rule_camera_portrait_3_4_aspect_ratio.md`
   - Camera frame must preserve `aspect-ratio: 3 / 4;` and fill card with ~2px margin.
   - Sizing camera card as `lg:col-span-4` (width ~310px) achieves both requirements: camera width 294px fills card completely, height is 392px, card total height is 483px (fitting 100vh on PC without scrollbar).
3. **DOM Contract Invariance (110 DOM IDs):**
   - All DOM IDs in `checkin.html` must remain 100% intact.
   - Specifically: `#cameraSectionCard`, `#rightColumnWrapper`, `#gpsSectionCard`, `#googleMapEmbedWrapper`, `#googleMapRealtimeIframe`, `#checkinActionCard`.

