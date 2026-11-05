---
id: "rule_loca_v2_ultra_zero_scroll_fullscreen_camera_and_modal_map"
title: "สถาปัตยกรรมหน้าลงเวลามือถือ Ultra Zero-Scroll (~345px) พร้อมกล้องเต็มจอสด และโมดอลแผนที่ Leaflet On-Demand"
type: "rule"
tags: ["ux-ui", "zero-scroll", "camera", "leaflet", "bma-theme", "loca-v2"]
related_flows: ["FLOW_CHECKIN_01", "FLOW_GPS_01", "FLOW_PHOTO_01", "FLOW_SETTINGS_01"]
created_phase: "PIPE-20261104-loca-v2-ux-zero-scroll-camera-fix"
last_updated: "2026-11-05"
---

# สถาปัตยกรรมหน้าลงเวลามือถือ Ultra Zero-Scroll (~345px) พร้อมกล้องเต็มจอสด และโมดอลแผนที่ Leaflet On-Demand

## 1. บริบทและปัญหาเดิม (Context & Root Cause)
1. **ปัญหาหน้าจอยาวล้นเกิน 1 หน้า (Multi-Screen Overflow)**: หน้าลงเวลาเดิมบนมือถือมีความสูงรวมเกิน 2 หน้าจอ ผู้ใช้ต้องเลื่อนขึ้นลงหลายครั้ง
2. **ปัญหากล้องไม่ทำงานเมื่อกดถัดไป (Camera Blank Bug)**: การแยก Step 1 และ Step 2 แบบเดิมเกิดบั๊กโครงสร้าง DOM ซ้อนทับ ทำให้เมื่อสั่งซ่อน Step 1 กลับทำให้ Step 2 ถูกซ่อนตามไปด้วย
3. **ปัญหาการฝังแผนที่หนักบนหน้าจอหลัก**: การฝัง Google Map iframe กินพื้นที่หน้าจอ ~80-280px และทำให้โหลดช้า

## 2. โซลูชันสถาปัตยกรรมใหม่ (Architectural Blueprint)

### 2.1 Single-Screen Ultra Zero-Scroll (~345px 100dvh)
- รวมทุกองค์ประกอบบนหน้าเดียว (Single Integrated View) ไม่ใช้ Step ซ้อน
- ความสูงรวมของคอนเทนต์หน้าจอหลักลดลงเหลือเพียง **~345px** การันตีว่าไม่เกิด Scrollbar บนมือถือทุกรุ่น

### 2.2 Top Bar มือถือกะทัดรัด (Slim Mobile Top Bar)
- ซ่อนป้ายสถานะ `[SuperAdmin]` บนจอเล็ก เหลือเฉพาะ `[ 👤 นายวิศรุต โต๊ะพาน ]`
- ขยายปุ่มเมนูแฮมเบอร์เกอร์ (`#btnMobileHistoryMenu`) เป็นขนาด **42x42px** (`w-11 h-11`) ขอบเขียวเทศกิจเด่นชัด สัมผัสนิ้วโป้งง่าย

### 2.3 Dynamic Unified Status Banner
- 🟢 **เข้างาน**: ไล่เฉดเขียวเทศกิจ `from-[#00351B] to-[#00744B]` ข้อความ `"ลงเวลาเข้างาน • [วันที่]"`
- 🔴 **ออกงาน**: ไล่เฉดแดงทับทิม `from-[#7F1D1D] to-[#DC2626]` ข้อความ `"ลงเวลาออกงาน • [วันที่]"`
- นาฬิกาดิจิทัลวินาทีเรียลไทม์ 24 ชม. ฝั่งขวา

### 2.4 Compact Photo Box & Fullscreen Camera on Demand
- กล่องรูปถ่ายกะทัดรัดความสูง ~85px (`h-24`)
- ปุ่มวงกลมลอยตรงกลาง (`#btnCenterPhotoOverlay`) สลับไอคอนกล้อง (ก่อนถ่าย) และไอคอนรีเฟรชถ่ายใหม่ `fa-rotate-right` (หลังถ่าย)
- **Fullscreen Camera Modal (`#modalFullscreenCamera`)**: เมื่อแตะกล่องจะเปิดกล้องเต็มจอแนวตั้ง 3:4 มีเฉพาะปุ่มชัตเตอร์ ไม่มีปุ่มคลังภาพ
- **LINE / No-Camera Graceful Fallback**: หากเปิดใน LINE หรืออุปกรณ์ไม่มีกล้อง ระบบจะ Fallback เปิดตัวเลือกไฟล์ภาพอัตโนมัติตาม `allow_gallery_fallback: true`

### 2.5 Work Mode Switcher เปิดให้เลือกนอกสถานที่ได้ทั้งเข้าและออกงาน
- ผู้ใช้สามารถสลับ `[ ในสถานที่ ]` / `[ นอกสถานที่ ]` ได้ทั้งตอนเข้างานและตอนออกงาน
- โหมดนอกสถานที่ดึงตัวเลือกจาก `this.settings.remarks` ไดนามิก 100% พร้อมกล่องพิมพ์เมื่อเลือก "อื่นๆ"

### 2.6 GPS Card & Leaflet Map Modal On-Demand
- ตัดกล่อง iframe แผนที่ที่ฝังค้างบนหน้าหลักออก (ประหยัดพื้นที่ ~70-280px)
- เพิ่มปุ่มคู่แอ็กชัน: `[ 🔄 ตรวจสอบ GPS ]` และ `[ 🗺️ ดูแผนที่ตามพิกัด ]` (`#btnViewGpsMapModal`)
- เมื่อแตะดูแผนที่ จะเด้งโมดอลแผนที่ Leaflet (`#modalViewGpsMap`) แสดงหมุดพิกัดและรัศมี Geofence คมชัดเต็มจอ

### 2.7 High-Visibility Sticky Action Button
- ยึดติดขอบล่างหน้าจอมือถือ (Docked)
- สีเขียวเทศกิจ `#00744B` (เข้างาน), สีแดงทับทิม `#991B1B` (ออกงาน), สีเทา `#94A3B8` (ล็อกปุ่ม)
- รองรับการตั้งค่าระบบทั้ง 12 ฟังก์ชันครบ 100%
