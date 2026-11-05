# Phase 0.1: Second Brain Retrieval (Fullscreen Camera & Offsite Map Search)

**Task ID**: PIPE-20261104-loca-v2-ux-zero-scroll-camera-fix  
**Date**: 2026-11-05  
**Orchestrator**: agent_00_orchestrator  

## 1. Retrieved Notes
- `second_brain_vault/00_INDEX_MOC.md` (Central Map of Content)
- `second_brain_vault/01_architecture_decisions/adr_002_mobile_checkin_sticky_drawer.md` (Zero-Scroll Mobile Layout Architecture)
- `second_brain_vault/02_domain_logic_and_rules/rule_camera_portrait_3_4_aspect_ratio.md` (Camera Portrait & Fullscreen Guidelines)
- `second_brain_vault/02_domain_logic/rule_loca_v2_onsite_offsite_nextstep_and_staging_schema.md` (Offsite Location & Remark Architecture)

## 2. Key Refinements & User Feedback
1. **Fullscreen Camera on Demand (`FULLSCREEN_CAMERA_ON_DEMAND`)**:
   - Main screen has a compact photo preview card (~75px-85px).
   - Tapping it opens a Fullscreen Camera Modal (`modalFullscreenCamera`) with in-frame shutter.
   - Taking the photo captures the image, closes the fullscreen modal, and returns to the main page showing the photo thumbnail.
   - Eliminates video stream lag and excessive vertical height on the main screen.
2. **Offsite Custom Map Search Popup Flow (`OFFSITE_CUSTOM_MAP_SEARCH_POPUP`)**:
   - In Offsite mode, choosing "ค้นหาพิกัดเอง" launches `modalOffsiteMapSearch`.
   - Confirming location in the modal closes it and injects coordinates/place name directly into Card 5 (GPS card) on the main screen.
3. **100% Settings Compatibility Matrix**:
   - Guarantees seamless compatibility across all 12 settings (`require_photo`, `allow_gallery_fallback`, `require_gps`, `single_click_checkin`, `randomize_gps_checkout`, `allow_checkin_start_time`, `standard_check_in`, `disable_normal_hours_checkin`, `filter_shifts_by_realtime`, `official_locations`, `remarks`).
