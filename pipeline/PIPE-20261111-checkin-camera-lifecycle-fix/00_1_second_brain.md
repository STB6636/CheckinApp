# Second Brain Retrieval — Camera Lifecycle & Fallback Robustness

- **Task ID:** `PIPE-20261111-checkin-camera-lifecycle-fix`
- **Timestamp:** 2026-11-11T09:55:00+07:00
- **Flow Links:** `FLOW_PHOTO_01`, `FLOW_CHECKIN_01`

## 1. Retrieved Notes
1. **`rule_loca_v2_ultra_zero_scroll_fullscreen_camera_and_modal_map.md`**:
   - หน้าจอลงเวลามือถือใช้สถาปัตยกรรม Ultra Zero-Scroll
   - กล้องถ่ายภาพบุคคล 3:4 ถูกแยกไปเปิดใน On-Demand Fullscreen Modal (`#modalFullscreenCamera`)
   - การ์ดรูปถ่ายบนหน้าหลัก (`#photoPreviewCard`) เป็นเพียงส่วนแสดงพรีวิวภาพที่ถ่ายแล้ว
   - กล้องในโมดอลใช้ `video#cameraVideoStream` พร้อมปุ่มชัตเตอร์ `#btnFullscreenShutter`
2. **`02_domain_logic_and_rules/rule_camera_portrait_3_4_aspect_ratio.md`**:
   - ฮาร์ดแวร์สตรีมกล้อง: `facingMode: 'user'`, `width: { ideal: 720 }, height: { ideal: 960 }`
   - การจับภาพ: `UIHelpers.capturePortrait3x4FromVideo` ทำการ crop กึ่งกลางเป็นอัตราส่วน 3:4 (480x640 / 720x960)
   - DOM Contract Invariance: ต้องรักษา ID ของ Elements กล้องเดิมไว้ครบถ้วน
3. **`02_domain_logic_and_rules/rule_line_and_no_camera_gallery_fallback.md`**:
   - Single Button Smart Fallback: เมื่อเปิดใน LINE In-App Browser หรือไม่มีกล้อง จะเปิด `<input type="file" id="cameraFallbackFileInput">`
   - มีการตั้งค่า `allow_gallery_fallback` ใน `settings`

## 2. Past Pitfalls to Avoid
- **Pitfall 1 (Background Sync Killing Active MediaStream):** การมี background interval polling (`setInterval(..., 5000)`) หรือ `visibilitychange` listener ที่สั่งรัน `#applySettingsHotReload()` ซึ่งเรียก `#stopCameraAndShowStandby()` / `#stopCameraHardwareStream()` โดยไม่ตรวจสอบว่าผู้ใช้กำลังใช้งานกล้องอยู่ (`isCameraRunning === true`) จะทำให้ฮาร์ดแวร์กล้องถูกตัดการเชื่อมต่อ (tracks stopped, `video.srcObject = null`) ในขณะที่หน้าจอโมดอลยังเปิดค้างอยู่
- **Pitfall 2 (Unconditional Re-render on Interval):** การดึง settings ซ้ำทุก 5 วินาทีแล้วเรียก render UI ซ้ำทุก 5 วินาทีทั้งที่ค่า settings ไม่ได้เปลี่ยน ทำให้เกิดการแย่งทรัพยากร DOM และรีเซ็ตสถานะของ components
- **Pitfall 3 (Silent Null Pointer / Premature Shutter Tap):** เมื่อกล้องถูกตัดสตรีมหรือยังไม่พร้อม การกดปุ่มชัตเตอร์จะเข้าเงื่อนไข `!video || !video.srcObject` แล้วแสดงแจ้งเตือน "กล้องยังไม่พร้อมใช้งาน กรุณารอสักครู่แล้วลองใหม่อีกครั้ง"
