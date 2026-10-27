---
id: "rule_camera_portrait_3_4_aspect_ratio"
title: "กฎและมาตรฐานการกำหนดขนาดกรอบกล้องแนวตั้ง 3:4 และการขยายเต็มการ์ดโมดอล"
type: "rule"
status: "accepted"
date: "2026-10-27"
tags: ["camera", "aspect-ratio", "checkin", "portrait", "FLOW_PHOTO_01"]
linked_flows: ["FLOW_PHOTO_01", "FLOW_CHECKIN_01"]
related_notes: ["[[adr_004_checkin_viewport_lock_and_drawer]]", "[[checkinapp_project_context]]"]
---

# กฎและมาตรฐานการกำหนดขนาดกรอบกล้องแนวตั้ง 3:4 และการขยายเต็มการ์ดโมดอล

## 1. บริบทและปัญหาเดิม
- การจำกัดความสูง `max-height: 160px; max-width: 220px;` บนหน้าจอเดสก์ท็อปและ `max-height: 175px; max-width: 240px;` บนมือถือ ทำให้กรอบกล้องถูกบีบกลายเป็นสี่เหลี่ยมผืนผ้าแนวนอน (1.37:1) ขัดแย้งกับสเปกถ่ายภาพบุคคลแนวตั้ง (Portrait 3:4)
- การ์ด `#cameraSectionCard` เหลือพื้นที่ว่างสีขาวขนาดใหญ่รอบกรอบกล้อง

## 2. กฎการกำหนดสไตล์ (Style & Architecture Rules)
1. **True Portrait Aspect Ratio:**
   - ใช้ `aspect-ratio: 3 / 4;` ควบคู่กับ `width: 100%;` และลบ `max-height`/`max-width` ที่บีบสัดส่วนออก
   - สอดคล้องกับขนาดฮาร์ดแวร์สตรีมกล้อง `width: { ideal: 720 }, height: { ideal: 960 }` (สัดส่วน 3:4) และการ Crop บันทึกภาพ `480 x 640` ใน `UIHelpers.capturePortrait3x4FromVideo`
2. **Compact Card Padding (~2px to 4px Border):**
   - กำหนด padding ของ `#cameraSectionCard` ให้กระชับด้วย `p-2 sm:p-2.5` เพื่อให้ระยะขอบระหว่างกรอบกล้องกับขอบการ์ดเหลือประมาณ 2px - 4px
   - ใน `CheckinController.#applyDynamicWorkspaceLayout()` ต้องรักษาคลาส `p-2 sm:p-2.5` ไม่ให้เขียนทับด้วย `p-3.5 lg:p-4`
3. **DOM Contract Invariance:**
   - ต้องรักษา DOM IDs ทั้ง 12 จุดของระบบกล้องให้คงอยู่ครบถ้วน 100%

