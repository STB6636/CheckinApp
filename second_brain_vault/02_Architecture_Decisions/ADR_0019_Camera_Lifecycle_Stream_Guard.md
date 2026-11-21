# ADR 0019: Camera Lifecycle MediaStream Guard & Hardware Teardown Protocol

- **Date**: 2026-11-11
- **Status**: Accepted & Verified (`Build ID: 20261111_08172ad9`)
- **Task ID**: `PIPE-20261111-checkin-camera-lifecycle-fix`
- **Linked Flows**: `FLOW_PHOTO_01` (On-Demand Camera Capture & Google Drive Upload), `FLOW_CHECKIN_01` (Attendance Check-in Workflow)

## Context & Problem Statement
On mobile devices (e.g. Brave / Chrome Android, iOS WebKit), users reported that upon tapping the camera icon, the fullscreen camera modal opened, but after staying on the screen for 2–3 seconds (or immediately), the video viewfinder went black. Subsequent taps on the shutter button displayed a SweetAlert warning: `"กล้องยังไม่พร้อมใช้งาน กรุณารอสักครู่แล้วลองใหม่อีกครั้ง"`.

Deep investigation and AST tracing uncovered the exact root causes:
1. **Periodic 5-Second Background Polling & Visibility Race**:
   In `CheckinController.js`, `setInterval(..., 5000)` and `visibilitychange` periodically executed `#syncSettingsHotReload()`, which invoked `#applySettingsHotReload(fresh)`.
2. **Unconditional Stream Shutdown in Background**:
   Inside `#applySettingsHotReload()`, the code evaluated:
   ```javascript
   if (this.settings.require_photo) {
       if (!this.capturedPhotoDataUrl) {
           this.#stopCameraAndShowStandby();
       }
   } else {
       this.#stopCameraHardwareStream();
   }
   ```
   Because the user was currently in the camera modal and had not yet captured a photo, `!this.capturedPhotoDataUrl` was `true`. It unconditionally called `#stopCameraHardwareStream()`, stopping all tracks (`track.stop()`) and clearing `video.srcObject = null` in the background.
3. **In-Flight Network Race Condition**:
   While `await SettingsModel.getSettings(true)` was in-flight, opening the camera modal was ignored if the guard was only evaluated before the await.
4. **Premature Shutter Tap without Frame Validation**:
   When the user tapped the shutter after the stream was severed, `if (!video || !video.srcObject)` triggered the alert. Furthermore, if tapped before the video hardware decoder delivered frames (`readyState < 2`), a black photo was captured.

## Decision & Implementation
1. **Camera Active Guard (Dual State Protection)**:
   Define `isCameraActive = this.isCameraRunning || isModalOpen`.
   - In `#syncSettingsHotReload()`: Guard both before and after the async network fetch (`await SettingsModel.getSettings(true)`). If `isCameraActive` is true, immediately abort without modifying session cache or DOM.
   - In `visibilitychange`: Return early if `isCameraActive` is true.
   - In `#applySettingsHotReload()`: Never call `#stopCameraAndShowStandby()` or `#stopCameraHardwareStream()` if `isCameraActive` is true.
2. **Safe WebRTC Teardown & Immediate Playback**:
   - In `#openFullscreenCamera()`: Show the modal container first so layout dimensions are active, invoke `await video.play().catch(...)` for immediate mobile rendering, and provide fallback constraints (`{ video: { facingMode: 'user' }, audio: false }`) if high-res 720x960 fails.
   - In `#stopCameraHardwareStream()`: Call `try { video.pause(); } catch (_) {}` before severing `video.srcObject = null` to satisfy WebKit/Safari media engine teardown requirements.
3. **Hardware Frame Readiness Check**:
   In `#captureAndCloseCamera()`: Check `video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0 && canvas` before taking snapshots, providing user guidance if the camera is still initializing.

## Verification & Impact
- Verified with 18 automated unit and simulation tests in `qa_camera_stream_protection_test.mjs` (18/18 passed).
- Zero syntax errors on `CheckinController.js`.
- Clean surgical scope with zero unrelated code alterations.
- Cache version synchronized across `version.json` and all 8 HTML files (`buildId: 20261111_08172ad9`).
