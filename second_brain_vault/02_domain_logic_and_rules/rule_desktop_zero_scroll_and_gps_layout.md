---
id: "rule_desktop_zero_scroll_and_gps_layout"
title: "กฎการจัดสัดส่วน Grid 4:8 และความสูง Zero-Scroll บนหน้าจอเดสก์ท็อป PC"
type: "rule"
status: "accepted"
date: "2026-10-27"
tags: ["desktop-layout", "zero-scroll", "grid-4-8", "gps-height", "FLOW_LAYOUT_01", "FLOW_GPS_01"]
linked_flows: ["FLOW_LAYOUT_01", "FLOW_GPS_01", "FLOW_PHOTO_01"]
related_notes: ["[[rule_camera_portrait_3_4_aspect_ratio]]", "[[adr_004_checkin_viewport_lock_and_drawer]]"]
---

# กฎการจัดสัดส่วน Grid 4:8 และความสูง Zero-Scroll บนหน้าจอเดสก์ท็อป PC

## 1. บริบทและปัญหาเดิม
- บนหน้าจอเดสก์ท็อป PC (1080p และ 1366x768): เมื่อใช้ Grid เดิม 5:7 คอลัมน์ การ์ดกล้องจะกว้าง ~390px เมื่อสัดส่วนเป็นแนวตั้ง 3:4 ความสูงกล้องพุ่งถึง 500px ทำให้ความสูงรวมทั้งหน้าจอเกิน 950px และเกิด Scroll Bar แนวตั้ง
- คอลัมน์ขวาใช้ `justify-between` ทำให้การ์ด GPS และการ์ดบันทึกเวลาแยกหัวท้าย เกิดช่องว่างสีขาวขนาดใหญ่ตรงกลาง (>150px) และแผนที่ GPS สั้นเกินไป (`lg:h-20` / 80px)

## 2. กฎและมาตรฐานสถาปัตยกรรม (Architecture & Layout Rules)
1. **Desktop Grid 350px 1fr Proportion:**
   - การ์ดกล้องใช้ความกว้างคงที่ 350px (`lg:grid-cols-[350px_1fr]`) ทำให้กล้องแนวตั้ง 3:4 กว้าง ~330px และสูง ~440px สัดส่วนเต็มตาพอดี ไม่แคบ และไม่ดันหน้าจอล้น
   - ในการ์ดกล้องใช้ `flex flex-col justify-start` นำ `justify-between` ออก ทำให้ปุ่มเปิดกล้องอยู่ชิดติดด้านล่างกรอบกล้องในระยะห่างพอดีตา ไร้ช่องว่างสีขาวโหว่
   - ชื่อหัวข้อการ์ดกำหนดเป็น "ถ่ายภาพยืนยันตัวตน"
   - คอลัมน์ขวาใช้ `1fr` (~590px) รองรับการ์ด GPS และการ์ดบันทึกเวลาได้อย่างสมดุลสวยงาม
2. **Compact Viewport Budget (Zero-Scroll PC):**
   - Padding แนวตั้งบน Desktop ต้องกระชับด้วย `lg:py-1.5` ใน `<main>` และการ์ดส่วนบน
   - ความสูงรวมทั้งหน้าจอต้องอยู่ระหว่าง 780px - 810px เพื่อให้แสดงผลใน 1080p พอดี 100% ไร้ Scroll Bar
3. **GPS Viewfinder Height & Natural Spacing:**
   - กรอบแผนที่ Google Map Realtime บน PC ใช้ `lg:h-32` (128px) ทำให้การ์ด GPS สูงขึ้นเป็น ~220px
   - ห้ามใช้ `justify-between` ในคอนเทนเนอร์คอลัมน์ขวา ให้ใช้ `flex flex-col gap-3 lg:gap-3.5` เพื่อให้ระยะห่างระหว่างการ์ด GPS กับการ์ดบันทึกเวลาเป็นระเบียบสวยงาม (12px - 14px)

