---
id: "rule_gps_map_card_replica_and_shutter_overlay"
title: "Domain Rule: การ์ดพิกัด GPS แผนที่จริงในตัวการ์ด (Embedded Leaflet) หัวการ์ดสีเทานวล และปุ่มชัตเตอร์รีเฟรชลอยตรงกลางด้านล่าง"
type: "rule"
last_updated_phase: "PIPE-20261109-gps-replica-and-drawer-zindex"
flow_links: ["FLOW_CHECKIN_01", "FLOW_GPS_01", "FLOW_LAYOUT_01"]
---

# 📌 Domain Rule: การ์ดพิกัด GPS แผนที่จริงในตัวการ์ด (Embedded Leaflet) หัวการ์ดสีเทานวล และปุ่มชัตเตอร์รีเฟรชลอยตรงกลางด้านล่าง

## 1. บริบทและวัตถุประสงค์ (Context & Purpose)
ถอดแบบการ์ดพิกัด GPS ตามแบบตัวอย่างอ้างอิง 100% เพื่อให้แสดงผลเป็นตลับแผนที่เสมือนจริงในตัวการ์ด (`#gpsSectionCard`) โดยจับคู่สมมาตรกับกล้องถ่ายรูปด้านซ้าย (`#photoPreviewCard`) ในอัตราส่วน 3:4 เป็นการ์ดชิ้นเดียวจบไร้กรอบขาวซ้อนกรอบ พร้อมระบบกักขัง Stacking Context ป้องกันแผนที่ลอยทะลุเมนู Drawer

## 2. องค์ประกอบเชิงสถาปัตยกรรม (Component Architecture)
1. **การ์ดชิ้นเดียวจบ (Single Capsule Design) & ความสมมาตร 100%:**
   - การ์ดกล้องและ GPS ใช้เส้นขอบ `border border-slate-200/80` หนา 1px เท่ากัน
   - ล็อกอัตราส่วนด้วย `aspect-[3/4] max-h-[30dvh] rounded-2xl overflow-hidden` เท่ากันเป๊ะ
   - ไม่มีกรอบขาวภายนอก (Zero Nested Boxes) หรือ Dead White Space
2. **หัวการ์ดสีเทาอ่อนนวลตา (`bg-[#F1F3F5]`):**
   - ไม่ใช้คลาส `dark:bg-slate-800` เพื่อป้องกันไม่ให้โหมด Dark Mode ของระบบปฏิบัติการทำให้หัวการ์ดกลายเป็นสีดำ
   - แสดงไอคอนหมุดพิกัดสีเขียวอมฟ้า Teal `fa-location-dot text-teal-600`
   - ข้อความ 2 บรรทัด: บรรทัดบน "พื้นที่ใกล้เคียง" พร้อมไอคอน `(i)` และบรรทัดล่างชื่อสถานที่ตัวหนาเข้ม
   - ขวา: ไอคอนลูกศร `^` (`fa-chevron-up text-slate-400`)
3. **การแสดงผลชื่อสถานที่ (Geocoded Location Display):**
   - แสดงผลชื่อสถานที่ตามผลลัพธ์ของ Geolocation Reverse Geocoding (`AttendanceModel.resolveLocationWithZoomMeta(lat, lng)`) ใน `#gpsLocationNameText` อย่างเป็นธรรมชาติ โดยคงตรรกะเดิมไว้ 100% ตามข้อกำหนดของผู้ใช้ (User Scope Directive: ไม่แตะต้องตรรกะชื่อสถานที่)
4. **แผนที่จริงในตัวการ์ด (Embedded Leaflet Map `#inlineGpsLeafletMap`):**
   - วางแนบชิดใต้หัวการ์ด ขอบล่างมน `rounded-b-2xl`
   - ปักหมุดสีแดง (พิกัด GPS ของผู้ใช้) และหมุดสีน้ำเงิน (จุดสถานที่ปฏิบัติงานหลัก/รัศมี)
   - มีระบบ `invalidateSize()` เมื่อโหลดหรือปรับขนาดหน้าจอ
5. **ปุ่มชัตเตอร์รีเฟรชตรงกลางล่าง (`#btnRefreshGps`):**
   - ลอย Overlay อยู่ที่ตำแหน่งกึ่งกลางด้านล่างของแผนที่ (`absolute bottom-2.5 inset-x-0 flex justify-center z-[10]`)
   - ทรงกลมมนสีขาวนวล มีเงาและความลึกสไตล์ปุ่มชัตเตอร์กล้อง (`shutter-glow`)
   - แสดงไอคอนหมุน `fa-arrows-rotate` พร้อมแอนิเมชัน `fa-spin` ขณะค้นหาตำแหน่ง
6. **ระบบป้องกันแผนที่ซ้อนทับเมนู Drawer (Triple Stacking Defense):**
   - การ์ด `#gpsSectionCard` มี `style="isolation: isolate; z-index: 0;"` กักขัง Z-Index ทั้งหมดของ Leaflet (400-1000) ให้อยู่เฉพาะในบริบท 0
   - เลเยอร์ `#mobileHistoryDrawer` และ `#modalSpecialRequest` ยกขึ้นเป็น `z-[9999]`
   - ฟังก์ชัน `openMobileDrawer()` ซ่อนแผนที่ด้วยคลาส `invisible` และ `closeMobileDrawer()` กู้คืนพร้อมเรียก `invalidateSize()`
7. **การป้องกันการเขียนทับคลาส Padding ใน JavaScript (Zero Padding Enforcement):**
   - ใน `CheckinController.js` เมธอด `#applyDynamicWorkspaceLayout()` ต้องไม่กำหนด `gpsCard.className = 'bma-card p-3.5 ...'` เด็ดขาด เพราะจะทำให้เบราว์เซอร์เติม padding 14px ล้อมรอบการ์ด GPS จนกลายเป็นการ์ดซ้อนในการ์ด
   - ต้องใช้เพียง `classList.toggle('hidden', ...)` และบังคับ `padding: 0 !important;` บน `#gpsSectionCard` ทั้งใน inline style และ global CSS เพื่อให้หัวข้อและแผนที่แสดงผลแนบชิดขอบการ์ด 100% ("เต็มการ์ด") ตามต้นแบบเสมอ

## 3. รายการ DOM IDs ที่ต้องรักษาไว้ครบถ้วน (Zero Breaking Changes)
- `gpsSectionCard`
- `gpsRequirementBadge`
- `gpsLocationNameText`
- `gpsLocationName`
- `gpsCoordsText`
- `btnRefreshGps`
- `btnViewGpsMapModal`
- `googleMapEmbedWrapper`
- `linkViewGoogleMap`
- `inlineGpsLeafletMap`
- `gpsRefreshSpinnerIcon`
