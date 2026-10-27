# Phase 0.1: Second Brain Retrieval

**Pipeline ID:** `PIPE-20261027-camera-mirror-and-detailed-confirm-modal`  
**Flows ที่เกี่ยวข้อง:**
- `FLOW_PHOTO_01`: On-Demand Camera Capture & Google Drive Direct URL Upload
- `FLOW_CHECKIN_01`: Regular Check-in & Check-out, 1-Click / 2-Click Mode & Official Status Evaluation
- `FLOW_GPS_01`: Multi-Tier Reverse Geocoding & GPS Location Resolution
- `FLOW_LAYOUT_01`: Viewport Lock, Zero-Scroll Integrity & Tailwind CSS Soft UI Dashboard

## 1. ข้อมูลจาก Second Brain Vault
- `[[rule_camera_portrait_3_4_aspect_ratio]]`: กำหนดกรอบกล้องแนวตั้งอัตราส่วน 3:4 และการแสดงผลแบบเต็มการ์ด
- `[[rule_shift_select_empty_and_soft_ui_alerts]]`: การใช้งาน SweetAlerts Soft UI Dashboard ร่วมกับการเลือกกะเวลา
- `[[rule_desktop_zero_scroll_and_gps_layout]]`: การคุมความสูงจอเดสก์ท็อป PC (~840px ไร้ Scroll Bar 100%)

## 2. การวิเคราะห์ปัญหาและการออกแบบแนวทางแก้ไข
1. **ปัญหากล้องกลับด้าน (User หันซ้าย ภาพหันขวา):**
   - สาเหตุ: `<video>` แสดงผล Raw Stream แบบมุมมองบุคคลที่สาม (Observer View)
   - แนวทางแก้ไข: เพิ่ม CSS Mirror Effect `transform: scaleX(-1);` (Tailwind: `-scale-x-100`) ให้กับ `<video id="cameraVideoStream">` และในขั้นตอนการบันทึกภาพลง Canvas ใน `UIHelpers.capturePortrait3x4FromVideo` ทำการ Flip ในแกนนอน (`ctx.translate(targetWidth, 0); ctx.scale(-1, 1);`) เพื่อให้ภาพถ่ายที่ได้ตรงกับภาพพรีวิวที่ผู้ใช้เห็น
2. **การปรับแต่ง SweetAlerts Confirmation Modal ตามรูปแบบ (ปกติ vs พิเศษ):**
   - **รูปแบบพิเศษ (Special Shift / Overtime / Single-Click / Custom):**
     1. ชื่อช่วงเวลา (`shiftObj.name`)
     2. เวลาเข้างาน (`shiftCheckIn` น.)
     3. เวลาออกงาน (`shiftCheckOut` น.)
     4. สถานที่ ตาม GPS: แสดงชื่อสถานที่ใกล้เคียง และพิกัดในบรรทัดถัดมา
   - **รูปแบบปกติ (Standard Civil Servant Hours):**
     1. ช่วงเวลา [เวลาเข้างาน, เวลาออกงาน]: `เวลาราชการปกติ [08:30 - 16:30 น.]`
     2. เวลาขณะบันทึก: เวลาปัจจุบัน (`currentTimeFormatted`)
     3. สถานที่ ตาม GPS: แสดงชื่อสถานที่ใกล้เคียง และพิกัดในบรรทัดถัดมา

