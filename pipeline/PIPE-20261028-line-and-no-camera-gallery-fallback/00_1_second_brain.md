---
pipeline_id: "PIPE-20261028-line-and-no-camera-gallery-fallback"
phase: "0.1 Second Brain Retrieve"
related_rules:
  - "rule_camera_portrait_3_4_aspect_ratio"
flow_links:
  - "FLOW_PHOTO_01"
  - "FLOW_CHECKIN_01"
---

# 0.1 Second Brain Retrieval
1. `rule_camera_portrait_3_4_aspect_ratio`:
   - รูปภาพทั้งหมดต้องถูกประมวลผลเป็นแนวตั้ง 3:4 (เช่น 720x960 หรือ 900x1200) เพื่อความสวยงามและมาตรฐานเดียวกันของระบบ
   - เมื่อผู้ใช้เลือกรูปผ่านไฟล์ fallback จะต้องนำภาพมาเข้า `<canvas>` ทำ center-crop และ resize เป็น 3:4 ก่อนแปลงเป็น JPEG Data URL
2. `FLOW_PHOTO_01`:
   - `CheckinController.js` ควบคุมการเปิด/ปิดสตรีมกล้องและการถ่ายภาพยืนยันตัวตน
   - `SettingsModel` และ `Config` ควบคุมการเปิด/ปิดฟังก์ชันผ่าน `allow_gallery_fallback`

