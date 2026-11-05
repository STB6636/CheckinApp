---
id: "rule_loca_v2_ultra_zero_scroll_fullscreen_camera_and_modal_map"
title: "สถาปัตยกรรมหน้าลงเวลามือถือ Cockpit Split 2-Column Layout (~315px) พร้อมกล้องเต็มจอสด และโมดอลแผนที่ Leaflet On-Demand"
type: "rule"
tags: ["ux-ui", "zero-scroll", "cockpit-split", "camera", "leaflet", "bma-theme", "loca-v2"]
related_flows: ["FLOW_CHECKIN_01", "FLOW_GPS_01", "FLOW_PHOTO_01", "FLOW_SETTINGS_01"]
created_phase: "PIPE-20261104-loca-v2-ux-zero-scroll-camera-fix"
last_updated: "2026-11-05"
---

# สถาปัตยกรรมหน้าลงเวลามือถือ Cockpit Split 2-Column Layout (~315px) พร้อมกล้องเต็มจอสด และโมดอลแผนที่ Leaflet On-Demand

## 1. บริบทและปัญหาเดิม (Context & Root Cause)
1. **ปัญหา Top Bar 3 ชั้นซ้อนทับ (Header Stacking Redundancy)**: หน้าจอมือถือเดิมมี Header ซ้อน 3 ชั้น (โลโก้+ชื่อยาว, แถบชื่อผู้ใช้สีเขียวแคบ, แบนเนอร์นาฬิกา) กินพื้นที่กว่า 120px
2. **ปัญหาการจัดวางแนวตั้งยาวเกินไป**: การวางการ์ดรูปถ่ายไว้บน แล้วการ์ด GPS ไว้ล่าง ทำให้กินความสูงแนวตั้งรวมเกือบ 200px
3. **ปัญหาแถบสีขาวในกรอบรูป**: เกิดจากปุ่มควบคุม Legacy เดิม (`#btnRetakePhoto`) ถูก JS เดิมถอดคลาส `hidden` ออก จึงโผล่ออกมาในกรอบรูปถ่าย
4. **ปุ่มเลือกแหล่งพิกัดนอกสถานที่ขาดความเด่นชัด**: ไม่มีสถานะสี Active/Inactive ที่ชัดเจน และมีข้อความกำกับยาวเกินไป

## 2. โซลูชันสถาปัตยกรรมใหม่ (Architectural Blueprint)

### 2.1 Top Bar บนมือถือชั้นเดียว (Single-Tier Header ~38px)
- รวมแถบ Header บนมือถือ (`max-lg`) ให้เหลือเพียงแถบเดียว แสดงชื่อผู้ใช้ `[ 👤 นายวิศรุต โต๊ะพาน ]` ฝั่งซ้าย และปุ่มแฮมเบอร์เกอร์ 42x42px (`w-11 h-11`) ฝั่งขวา
- ซ่อนกล่องตราโลโก้และชื่อระบบที่ซ้ำซ้อนบนมือถือ (แต่คงไว้บนจอเดสก์ท็อป `lg:`)
- ลบ Slim Banner แถบเขียวแคบเดิมออกอย่างถาวร ประหยัดพื้นที่ได้ถึง ~55px

### 2.2 Dynamic Unified Status Banner (~48px)
- 🟢 **เข้างาน**: ไล่เฉดเขียวเทศกิจ `from-[#00351B] to-[#00744B]` ข้อความ `"ลงเวลาเข้างาน • [วันที่]"`
- 🔴 **ออกงาน**: ไล่เฉดแดงทับทิม `from-[#7F1D1D] to-[#DC2626]` ข้อความ `"ลงเวลาออกงาน • [วันที่]"`
- นาฬิกาดิจิทัลวินาทีเรียลไทม์ 24 ชม. ฝั่งขวา

### 2.3 Cockpit Split 2-Column Grid (ความสูง ~20dvh / ~145px)
- รวบหัวใจสำคัญของการลงเวลา (ใบหน้า + พิกัด) มาไว้เคียงข้างกันในแถวเดียว `grid grid-cols-2 gap-2.5 items-stretch h-36 sm:h-40`:
  * **ฝั่งซ้าย (Photo Card)**: รูปถ่ายบุคคล 3:4 สวยงามเต็มกรอบ ไร้ขอบซ้อนทับ พร้อมปุ่มวงกลมตรงกลาง (#btnCenterPhotoOverlay) สลับไอคอนกล้องและถ่ายใหม่ `fa-rotate-right`
  * **ขจัดบั๊กแถบขาวถาวร**: ย้ายปุ่ม Legacy ทั้งหมดออกจาก Photo Card ไปไว้ใน `#legacyHiddenCameraElements` (display: none !important) ที่ท้ายฟอร์ม
  * **ฝั่งขวา (GPS Card)**: แสดงไอคอน, ป้ายพิกัดจริง, พิกัดละติจูด/ลองจิจูด, ชื่อสถานที่ใกล้เคียง (line-clamp-2) พร้อมปุ่มคู่ `[ 🔄 ตรวจสอบ GPS ]` และ `[ 🗺️ ดูแผนที่ ]`

### 2.4 การ์ดรูปแบบการปฏิบัติงาน (Active State เด่นชัด & เรียงตามระบบ)
- ปรับ Label เป็น `"ลักษณะงานนอกสถานที่ *"` (ตัดคำว่า "(ดึงจาก settings.remarks)" ออก)
- Dropdown ตัวเลือกนอกสถานที่ เรียงลำดับตาม Array ใน `this.settings.remarks` (ตั้งค่าระบบ แท็บ 2) 100%
- ปุ่มเลือกแหล่งพิกัดมี Active State เด่นชัดมาก:
  * เมื่อเลือก **GPS ปัจจุบัน**: สีเขียวเทศกิจเด่นชัด `bg-[#00744B] text-white shadow-md border-2 border-[#005B2E]`
  * เมื่อเลือก **ค้นหาพิกัดเอง**: สีม่วงครามเด่นชัด `bg-indigo-600 text-white shadow-md border-2 border-indigo-700`

### 2.5 Modals & Fallback System
- **Fullscreen Camera Modal (`#modalFullscreenCamera`)**: กล้องสดแนวตั้ง 3:4 พร้อมปุ่มชัตเตอร์ (ไม่มีปุ่มคลังภาพ)
- **LINE Browser & No-Camera Fallback**: หากเปิดใน LINE หรืออุปกรณ์ไม่มีกล้อง + `allow_gallery_fallback: true` ระบบจะเปิดตัวเลือกไฟล์ภาพให้อัตโนมัติ
- **Leaflet Map Modal (`#modalViewGpsMap`)**: เปิดแผนที่ขนาดใหญ่ดูหมุดพิกัดและระยะ Geofence แบบ On-Demand

### 2.6 High-Visibility Sticky Action Button
- ยึดติดขอบล่างหน้าจอมือถือ (Docked)
- สีเขียวเทศกิจ `#00744B` (เข้างาน), สีแดงทับทิม `#991B1B` (ออกงาน), สีเทา `#94A3B8` (ล็อกปุ่ม)
- รองรับการตั้งค่าระบบเดิมทั้ง 12 ฟังก์ชันครบ 100%
