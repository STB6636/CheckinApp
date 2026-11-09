---
id: "rule_gps_map_card_replica_and_shutter_overlay"
title: "Domain Rule: การ์ดพิกัด GPS แผนที่จริงในตัวการ์ด (Embedded Leaflet) หัวการ์ดสีเทานวล และปุ่มชัตเตอร์รีเฟรชลอยตรงกลางด้านล่าง"
type: "rule"
last_updated_phase: "PIPE-20261105-loca-v2-gps-symmetry-compact"
flow_links: ["FLOW_CHECKIN_01", "FLOW_GPS_01", "FLOW_LAYOUT_01"]
---

# 📌 Domain Rule: การ์ดพิกัด GPS แผนที่จริงในตัวการ์ด (Embedded Leaflet) หัวการ์ดสีเทานวล และปุ่มชัตเตอร์รีเฟรชลอยตรงกลางด้านล่าง

## 1. บริบทและวัตถุประสงค์ (Context & Purpose)
ถอดแบบการ์ดพิกัด GPS ตามแบบตัวอย่างอ้างอิง 100% เพื่อให้แสดงผลเป็นตลับแผนที่เสมือนจริงในตัวการ์ด (`#gpsSectionCard`) โดยจับคู่สมมาตรกับกล้องถ่ายรูปด้านซ้าย (`#photoPreviewCard`) ในอัตราส่วน 3:4 และรักษาโครงสร้างหน้าจอเดิมโดยไม่มีการเพิ่มช่องกรอกหมายเหตุ

## 2. องค์ประกอบเชิงสถาปัตยกรรม (Component Architecture)
1. **หัวการ์ดสีเทาอ่อนนวลตา (`bg-[#F1F3F5]`):**
   - ไม่ใช้คลาส `dark:bg-slate-800` เพื่อป้องกันไม่ให้โหมด Dark Mode ของระบบปฏิบัติการทำให้หัวการ์ดกลายเป็นสีดำ
   - แสดงไอคอนหมุดพิกัดสีเขียวอมฟ้า Teal `fa-location-dot`
   - ข้อความ 2 บรรทัด: บรรทัดบน "พื้นที่ใกล้เคียง" พร้อมไอคอน `(i)` และบรรทัดล่างชื่อสถานที่ตัวหนาเข้ม
   - ขวา: ไอคอนลูกศร `^` (`fa-chevron-up`)
2. **แผนที่จริงในตัวการ์ด (Embedded Leaflet Map `#inlineGpsLeafletMap`):**
   - วางแนบชิดใต้หัวการ์ด ขอบล่างมน `rounded-b-2xl`
   - ปักหมุดสีแดง (พิกัด GPS ของผู้ใช้) และหมุดสีน้ำเงิน (จุดสถานที่ปฏิบัติงานหลัก/รัศมี)
   - มีระบบ `invalidateSize()` เมื่อโหลดหรือปรับขนาดหน้าจอ
3. **ปุ่มชัตเตอร์รีเฟรชตรงกลางล่าง (`#btnRefreshGps`):**
   - ลอย Overlay อยู่ที่ตำแหน่งกึ่งกลางด้านล่างของแผนที่ (`absolute bottom-2.5 inset-x-0 flex justify-center`)
   - ทรงกลมมนสีขาวนวล มีเงาและความลึกสไตล์ปุ่มชัตเตอร์กล้อง (`shutter-glow`)
   - แสดงไอคอนหมุน `fa-arrows-rotate` พร้อมแอนิเมชัน `fa-spin` ขณะค้นหาตำแหน่ง
4. **ความสมมาตร 100%:**
   - การ์ดกล้องและ GPS ใช้เส้นขอบ `border border-slate-200/80` หนา 1px เท่ากัน
   - ทั้งสองการ์ดถูกล็อกด้วย `aspect-[3/4] max-h-[30dvh]` เท่ากันทุกหน้าจอ

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
