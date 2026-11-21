# Phase 0.1: Second Brain Retrieval Report
- **Task ID**: `PIPE-20261111-checkin-gps-nearby-places-algorithm-redesign`
- **Date**: 2026-11-11
- **Focus**: สถาปัตยกรรมการระบุสถานที่ใกล้เคียงจากการ์ด GPS บนหน้าลงเวลาปฏิบัติราชการ (`checkin.html` & `AttendanceModel.js`)

## Retrieved Architecture Decisions & Domain Rules
1. **`rule_gps_map_card_replica_and_shutter_overlay.md`**:
   - ข้อกำหนดการแสดงผลชื่อสถานที่บนการ์ด GPS (`#gpsSectionCard` -> `#gpsLocationNameText`):
     - เรียกใช้งานผ่าน `AttendanceModel.resolveLocationWithZoomMeta(lat, lng)`
     - ต้องรักษา DOM IDs ทั้ง 10 จุด (`gpsSectionCard`, `gpsLocationNameText`, `gpsCoordsText`, `btnRefreshGps`, `inlineGpsLeafletMap`, etc.) ไร้ breaking change
2. **`rule_loca_v2_onsite_offsite_nextstep_and_staging_schema.md`**:
   - ระบบลงเวลาในสถานที่/นอกสถานที่ และการคำนวณ `evaluateOnsiteGeofence` จาก `official_locations`
3. **`ADR_0019_Camera_Lifecycle_Stream_Guard.md`**:
   - ห้ามรบกวน Camera Lifecycle หรือกระบวนการ Init กล้องใน `CheckinController`

## Past Pitfalls to Avoid (ข้อควรระวังสำคัญ)
- **Pitfall 1: Fallback String Hardcoded**: สตริง `ใกล้เคียง ซอยในพื้นที่ (${lat.toFixed(5)}, ${lng.toFixed(5)})` ที่บรรทัด 562 เป็นสาเหตุโดยตรงที่ทำให้ผู้ใช้เห็น "(พิกัด)"
- **Pitfall 2: Overpass Timeout 1200ms ในเครือข่ายไทย**: Overpass public mirrors ในยุโรปใช้เวลาเฉลี่ย 5-25 วินาที ทำให้ timeout 1.2 วินาทีล้มเหลว 100% ตลอดเวลา
- **Pitfall 3: Hierarchy Inversion (Soi ก่อน Places)**: การตรวจหาซอย (`extractCleanSoiOrSubSoi`) ถูกวางไว้ก่อนการตรวจหาสถานที่รอบนอก (>22 เมตร) ทำให้เมื่อพบชื่อถนน/ซอยใน Nominatim จะตัดจบและคืนค่าชื่อซอยทันที ทั้งที่มีร้านค้า/อาคารสำคัญอยู่ใกล้ๆ
- **Pitfall 4: Nominatim ขาด User-Agent Header**: Nominatim ปฏิเสธหรือ throttle คำขอที่ไม่มี User-Agent ที่ถูกต้อง
- **Pitfall 5: ละเลย Official Workplace Locations**: พิกัดสำนักเทศกิจและสถานที่ทางการในฐานข้อมูลไม่ถูกนำมาพิจารณาในฟังก์ชัน Reverse Geocoding เลย
