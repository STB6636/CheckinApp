# Final Delivery Summary: ArcGIS Primary POI Resolution & 4-Tier Priority Architecture

- **Task ID**: `PIPE-20261112-arcgis-primary-places-resolution`
- **Build ID**: `20261112_b48a3780`
- **Date**: 2026-11-12
- **Status**: Complete & Verified (PASS 100%)
- **Target Branch**: `Loca-V2`

---

## 1. Executive Summary

ผู้ใช้ได้สั่งการปรับปรุงระบบค้นหาสถานที่ใกล้เคียงในการ์ดพิกัด GPS เพื่อแก้ปัญหาฐานข้อมูลสถานที่เดิมบน OpenStreetMap/Overpass ที่มีจำกัด ไม่ทันสมัย และมักค้นหาสถานที่ไม่เจอ โดยมีข้อกำหนดหลักดังนี้:
1. **นำ ArcGIS World Geocoding Service มาใช้เป็นตัวเลือกหลัก (Tier 1 Primary POI Engine)** เพื่อค้นหาสถานที่ได้ครอบคลุมและแม่นยำสูง
2. **จำกัดรัศมีการค้นหาที่ชาญฉลาด ($\le 400$ เมตร)** เพื่อป้องกันปัญหาพิกัดกระโดดไกลถึง 2,000 เมตรตามที่ตรวจพบในระบบ HRMS BMA
3. **รองรับทั้ง 3 กรณีการใช้งานหลัก**:
   - **ในสถานที่ (In-Place)**: สำนักเทศกิจ $\le 180$ ม. ดึงจาก In-Memory ทันที ($<1$ ms), หากเกินระยะใช้ ArcGIS ตรวจสอบสถานที่จริงพร้อมการประเมิน Geofence 400 ม.
   - **นอกสถานที่ (Off-Site)**: ใช้ ArcGIS ค้นหาสถานที่ปฏิบัติงานจริง (WFH, การประชุมภายนอก, ปฏิบัติงานภาคสนาม) โดยไม่ติดล็อกขอบเขตพิกัด 400 ม.
   - **ยื่นคำขอกรณีพิเศษ (Special Request)**: รองรับทั้งพิกัด GPS ปัจจุบันและการลากหมุดแผนที่บน Leaflet Map ผ่าน `AttendanceModel.resolveLocationName(lat, lng)`
4. **ระบบคัดกรองคำต้องห้าม (`#isForbiddenLocationTerm`)**: ตัดคำว่า ถนน, ถ., แขวง, ข., เขต, หมู่บ้าน, ม., ตำบล, ต., อำเภอ, อ., จังหวัด, จ., บ้านเลขที่ดิบ, รหัสไปรษณีย์ 5 หลัก และคำว่า "ซอยในพื้นที่" ไม่ให้นำมาเป็นชื่อสถานที่เดี่ยวๆ
5. **ระบบจำแนกลำดับความสำคัญ 4 ลำดับ (`#classifyTargetPlace`)**:
   - **ลำดับที่ 1 (สถานที่ราชการและสถานที่สำคัญ)**: ศาลาว่าการ, สำนัก (พร้อม Negative Lookahead), สำนักงานเขต, กอง, กรม, กระทรวง, สถานีตำรวจ, โรงพยาบาล, โรงเรียน, มหาวิทยาลัย, ศาล, วัด, พระอาราม, สนามหลวง, ท่าเรือ, วงเวียน, สะพาน, เสาหลักเมือง, อนุสาวรีย์, พิพิธภัณฑ์, **สโมสร**, ศาสนสถาน, สวนสาธารณะ, ศูนย์ราชการ
   - **ลำดับที่ 2 (อาคารสำนักงานและพาณิชย์อื่นๆ)**: อาคารสำนักงานที่มีชื่อเฉพาะ (อาคาร, ทาวเวอร์, ตึก, บิลดิ้ง, ซิตี้, เซ็นเตอร์, สำนักงานใหญ่/สาขา, บริษัท, บจก., บมจ., หจก.)
   - **ลำดับที่ 3 (ระบบขนส่งและที่พักอาศัย)**: สถานีรถไฟ, BTS/MRT/ARL/SRT, ป้ายรถเมล์, ท่ารถ, สถานีขนส่ง, คอนโดมิเนียม, อพาร์ตเมนต์, หอพัก, แมนชั่น, โรงแรม, เรสซิเดนซ์
   - **ลำดับที่ 4 (ร้านค้าและบริการสาธารณะ)**: ห้างสรรพสินค้า (เซ็นทรัล, เดอะมอลล์, พารากอน, เอ็มควอเทียร์), 7-Eleven / เซเว่น, ซูเปอร์มาร์เก็ต (โลตัส, บิ๊กซี, แม็คโคร, ท็อปส์), ร้านสะดวกซื้อ, คาเฟ่, ร้านอาหาร, ธนาคาร, ปั๊มน้ำมัน
6. **กฎการเลือกผลลัพธ์**: หากระยะทางต่างกัน $\le 20$ ม. ให้เลือกลำดับความสำคัญที่สูงกว่า หากต่างกัน $> 20$ ม. ให้เลือกสถานที่ที่ใกล้จริง พร้อมใส่คำนำหน้า $\le 30$ ม. `"บริเวณ [ชื่อ]"` และ $31-400$ ม. `"ใกล้เคียง [ชื่อ]"`
7. **กฎเหล็กความปลอดภัยเชิงศัลยกรรม (Strict Surgical Scope Only)**: แก้ไขเฉพาะไฟล์ `assets/js/models/AttendanceModel.js` โดยไม่มีการแตะต้องฐานข้อมูล, ไม่มีผลข้างเคียงต่อ Controller อื่นๆ และ Push ขึ้น Branch `Loca-V2`

---

## 2. Changes Summary

| ไฟล์เป้าหมาย | สัญลักษณ์ที่แก้ไข | สรุปการปรับปรุงเชิงศัลยกรรม |
|:--|:--|:--|
| `assets/js/models/AttendanceModel.js` | `#isForbiddenLocationTerm` (L48-L88) | อัปเดต Regex คัดกรองคำต้องห้ามแบบ Prefix-bounded `^(ตำบล|ต\.|อำเภอ|อ\.|จังหวัด|จ\.)` ป้องกันการบล็อกสถานที่ราชการ เช่น "ศาลากลางจังหวัด...", คัดทิ้งบ้านเลขที่ดิบ, รหัสไปรษณีย์, และ "ซอยในพื้นที่" |
| `assets/js/models/AttendanceModel.js` | `#classifyTargetPlace` (L98-L215) | เพิ่มการจัดกลุ่ม 4 Priorities ครบถ้วนตามข้อกำหนดผู้ใช้: ศาลาว่าการ, สโมสร, กอง/กรม, Negative Lookahead สำหรับ `สำนัก(?!งาน(ใหญ่|สาขา))`, แบรนด์เนมภาษาไทย (โลตัส, บิ๊กซี, ท็อปส์) |
| `assets/js/models/AttendanceModel.js` | `#queryArcGISWorldGeocode` (L220-L280) | เพิ่ม Private Engine เชื่อมต่อ ArcGIS World Geocode Server แบบสาธารณะ (No API Key), ตรวจสอบ `Addr_type === 'POI'`, ป้องกันบ้านเลขที่ส่วนตัว, และแปลง Tag เข้าสู่ระบบ Ranking |
| `assets/js/models/AttendanceModel.js` | `resolveLocationWithZoomMeta` (L380-L450) | สลับลำดับ Engine: วิ่ง In-Memory Official Locations (Tier 0) $\le 180$ ม. ก่อนเป็นอันดับแรก จากนั้นวิ่ง ArcGIS World Geocode (Tier 1) $\le 400$ ม. ตามด้วย Overpass / Nominatim / Soi ตามลำดับ Fallback |
| `version.json` & 8 Root HTML Files | `CURRENT_APP_BUILD` & `?v=` | ซิงก์เวอร์ชันแอปพลิเคชันเป็น `20261112_b48a3780` ครบทุกไฟล์ 100% ตามข้อกำหนดเหล็กการบังคับเคลียร์แคช |
| `second_brain_vault/` | `ADR_0024`, `00_INDEX_MOC.md` | บันทึก Architecture Decision Record ADR-0024 และเชื่อมโยงเข้า Second Brain Index |

---

## 3. Verification & Evidence Table

| รายการทดสอบ | ไฟล์ชุดทดสอบ | จำนวนเคส | ผลการทดสอบ | สถานะ |
|:--|:--|:--:|-:|:--:|
| **ArcGIS Preflight Network Check** | `preflight_arcgis_simulation.mjs` | 5 | 5 ผ่าน (100%) | **PASS** |
| **AttendanceModel Unit & Priority Tests** | `test_attendance_model_arcgis.mjs` | 88 | 88 ผ่าน (100%) | **PASS** |
| **End-to-End Multi-Scenario Tests** | `test_attendance_model_e2e.mjs` | 6 | 6 ผ่าน (100%) | **PASS** |
| **Regression Unit Mock Tests** | `qa_unit_mock_tests.mjs` | 22 | 22 ผ่าน (100%) | **PASS** |
| **Adversarial Resiliency Tests** | `qa_adversarial_verification.mjs` | 7 | 7 ผ่าน (100%) | **PASS** |
| **Total Test Suite** | - | **128** | **128 ผ่าน (100%)** | **PASS** |
| **Node.js AST Syntax Check** | `node --check assets/js/models/AttendanceModel.js` | 1 | 0 Errors | **PASS** |
| **Mandatory Cache Version Sync** | `version.json` vs 8 HTML files | 8 | Build `20261112_b48a3780` ตรงกัน 100% | **PASS** |
