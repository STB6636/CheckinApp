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

### 2.3 Cockpit Split 2-Column Grid (อัตราส่วนแนวตั้ง 3:4 สมมาตรคู่, aspect-[3/4] max-h-[30dvh])
- รวบหัวใจสำคัญของการลงเวลา (ใบหน้า + พิกัด) มาไว้เคียงข้างกันในแถวเดียว `grid grid-cols-2 gap-2.5 items-stretch w-full`:
  * **ฝั่งซ้าย (Photo Card)**: สัดส่วน `aspect-[3/4] max-h-[30dvh]` รูปถ่ายบุคคล 3:4 พอดีกับเซนเซอร์กล้อง 720x960 ไร้ขอบดำและไม่ครอปใบหน้า พร้อมปุ่มวงกลมตรงกลาง (#btnCenterPhotoOverlay)
  * **ขจัดบั๊กแถบขาวถาวร**: ย้ายปุ่ม Legacy ทั้งหมดออกจาก Photo Card ไปไว้ใน `#legacyHiddenCameraElements` (display: none !important) ที่ท้ายฟอร์ม
  * **ฝั่งขวา (GPS Card)**: สัดส่วน `aspect-[3/4] max-h-[30dvh]` เท่ากันสมมาตร จัดวางชื่อสถานที่ขนาดใหญ่ตัวหนาโดดเด่นด้านบน (#gpsLocationNameText line-clamp-3), เส้นคั่นกลาง, และพิกัดละติจูด/ลองจิจูดขนาดเล็กแบบ Mono (#gpsCoordsText) ตัดคำว่า "สถานที่:" และ "พิกัด:" ออกเพื่อความคลีน พร้อมลบ Tag "บันทึกพิกัดจริง"
  * **ปุ่มคู่ด้านล่าง**: `[ 🔄 ตรวจสอบ ]` และ `[ 🗺️ ดูแผนที่ ]`

### 2.4 การ์ดรูปแบบการปฏิบัติงาน (Clean Segmented Mode Switcher)
- ลบ Label หัวข้อ `"รูปแบบการปฏิบัติงาน *"` และแท็กโหมดซ้ำซ้อนออก เพื่อประหยัดพื้นที่แนวตั้ง ~25px
- คงแท็ก `<span id="modeContextBadge" class="hidden"></span>` และ `<span id="modeBadge" class="hidden"></span>` ไว้ใน DOM เพื่อความเข้ากันได้ของ JS
- ปุ่มสลับโหมด `[ 🏢 ในสถานที่ (Onsite) ]` และ `[ 📍 นอกสถานที่ (Offsite) ]` เป็นองค์ประกอบแรกของการ์ด
- Dropdown ตัวเลือกนอกสถานที่ เรียงลำดับตาม Array ใน `this.settings.remarks` (ตั้งค่าระบบ แท็บ 2) 100%
- ปุ่มเลือกแหล่งพิกัดมี Active State เด่นชัดมาก:
  * เมื่อเลือก **GPS ปัจจุบัน**: สีเขียวเทศกิจเด่นชัด `bg-[#00744B] text-white shadow-md border-2 border-[#005B2E]`
  * เมื่อเลือก **ค้นหาพิกัดเอง**: สีม่วงครามเด่นชัด `bg-indigo-600 text-white shadow-md border-2 border-indigo-700`

### 2.5 การ์ดเลือกช่วงเวลาทำงาน (#checkinActionCard) แบบแสดงผลตามเงื่อนไข (Zero-Scroll Enabler)
- **ในเวลาราชการปกติ (08:30–16:30 น.)**: ซ่อนการ์ด `#checkinActionCard` ออกจากหน้าหลัก (`actionCard.classList.add('hidden')`) ประหยัดพื้นที่แนวตั้ง ~190px ช่วยให้หน้าจอพอดี 100dvh Zero-Scroll บนทุกอุปกรณ์
- **นอกเวลาราชการ (OT) หรือช่วง Early Shift Window ก่อนเริ่ม OT**: แสดงการ์ดอัตโนมัติเมื่อมีกะ OT ที่เปิดให้ลงเวลา (`hasActiveOtShifts && (mustUseOvertimeWindow || isNormalHoursDisabledNow || hasCompletedRegularToday)`)
- บุคลากรสามารถส่งคำขอลงเวลากรณีพิเศษในเวลาปกติได้ตลอดเวลาผ่านปุ่มแฮมเบอร์เกอร์ -> คำขอพิเศษ ในแถบด้านข้าง (Mobile Drawer)

### 2.6 Modals & Fallback System
- **Fullscreen Camera Modal (`#modalFullscreenCamera`)**: กล้องสดแนวตั้ง 3:4 พร้อมปุ่มชัตเตอร์ (ไม่มีปุ่มคลังภาพ)
- **LINE Browser & No-Camera Fallback**: หากเปิดใน LINE หรืออุปกรณ์ไม่มีกล้อง + `allow_gallery_fallback: true` ระบบจะเปิดตัวเลือกไฟล์ภาพให้อัตโนมัติ
- **Leaflet Map Modal (`#modalViewGpsMap`)**: เปิดแผนที่ขนาดใหญ่ดูหมุดพิกัดและระยะ Geofence แบบ On-Demand

### 2.7 High-Visibility Sticky Action Button
- ยึดติดขอบล่างหน้าจอมือถือ (Docked)
- สีเขียวเทศกิจ `#00744B` (เข้างาน), สีแดงทับทิม `#991B1B` (ออกงาน), สีเทา `#94A3B8` (ล็อกปุ่ม)
- รองรับการตั้งค่าระบบเดิมทั้ง 12 ฟังก์ชันครบ 100%
