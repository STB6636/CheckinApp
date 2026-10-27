# Phase 0.1: Second Brain Vault Knowledge Retrieval
**Pipeline ID:** PIPE-20261027-camera-portrait-aspect-ratio-and-margins
**Target Flow:** `FLOW_PHOTO_01` (Face Verification & Camera Viewfinder Layout)
**Date:** 2026-10-27

## Retrieved Context & Architectural Constraints
1. **ADR-004 (Checkin Viewport Lock & Drawer Architecture):**
   - File: `second_brain_vault/01_architecture_decisions/adr_004_checkin_viewport_lock_and_drawer.md`
   - Key point: Viewport lock requires careful height budgeting. However, previous fix introduced overly restrictive `max-height: 160px` / `max-width: 220px` which squashed the camera viewfinder into a landscape/square box and created excessive empty margins.
2. **DOM Contract Invariance (110 DOM IDs):**
   - All camera DOM elements must remain completely untouched:
     - `#cameraSectionCard`
     - `.camera-portrait-3-4`
     - `#cameraVideoStream`
     - `#cameraCaptureCanvas`
     - `#capturedPhotoPreview`
     - `#cameraStandbyOverlay`
     - `#cameraStatusMessage`
     - `#btnStartCameraOverlay`
     - `#btnStartCameraBottom`
     - `#btnCapturePhoto`
     - `#btnRetakePhoto`
     - `#btnStopCamera`
     - `#photoRequirementBadge`
3. **Stream Resolution Alignment:**
   - In `CheckinController.js`:
     ```javascript
     navigator.mediaDevices.getUserMedia({
         video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } }
     });
     ```
   - In `UIHelpers.js`: `capturePortrait3x4FromVideo` uses `480 x 640` (ratio 0.75 = 3:4).
   - Thus, UI aspect ratio `aspect-ratio: 3 / 4;` perfectly matches camera stream and capture dimensions.

