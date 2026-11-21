# Second Brain Retrieval — `PIPE-20261109-onsite-offsite-gps-refresh-and-custom-map-sync`

## 1. Retrieved Notes
- `[[rule_loca_v2_ultra_zero_scroll_fullscreen_camera_and_modal_map]]` — สถาปัตยกรรมหน้าลงเวลามือถือ Cockpit Split 2-Column Layout (~315px) พร้อมกล้องเต็มจอสด และโมดอลแผนที่ Leaflet On-Demand
- `[[rule_gps_map_card_replica_and_shutter_overlay]]` — Domain Rule: การ์ดพิกัด GPS แผนที่จริงในตัวการ์ด (Embedded Leaflet) หัวการ์ดสีเทานวล และปุ่มชัตเตอร์รีเฟรชลอยตรงกลางด้านล่าง
- `[[rule_remote_version_hard_cache_purge_autostamp]]` — Domain Rule: ระบบบังคับเคลียร์แคชอัตโนมัติ

## 2. Past Pitfalls to Avoid
1. **ขาดการซิงก์พิกัดและหมุดในแผนที่การ์ด GPS เมื่อยืนยันพิกัดนอกสถานที่**:
   - ในโค้ดเดิม เมื่อผู้ใช้เลือกและยืนยันพิกัดจาก `#modalOffsiteMapSearch` ระบบอัปเดตเพียง `gpsData.lat`, `gpsData.lng`, `gpsLocationNameText` แต่ **ไม่ได้เรียก `#renderInlineGpsMap(lat, lng)`** ส่งผลให้แผนที่ Leaflet บนการ์ด GPS หน้าหลักยังคงปักหมุดและซูมอยู่ที่พิกัดเดิม
2. **สลับโหมดแต่ไม่เริ่มกระบวนการค้นหาตำแหน่งใหม่ (Stale GPS Cache)**:
   - เมื่อผู้ใช้สลับจาก "นอกสถานที่" กลับมา "ในสถานที่" หรือจาก "ค้นหาพิกัดเอง" กลับมา "GPS ปัจจุบัน" ระบบเดิมเพียงแค่เปลี่ยนตัวแปร `this.locationMode` แต่ไม่ได้เรียก `#initGpsLocation()` ทำให้ยังคงค้างค่าพิกัดเดิมที่เลือกไว้
3. **การเขียนทับคลาสการ์ด GPS (Zero Padding Violation)**:
   - ต้องไม่นำคำสั่งกำหนด `className = '... bma-card p-3.5'` กลับเข้ามาเด็ดขาด ต้องรักษาคลาส `p-0` และการแสดงผลเต็มการ์ดไว้ 100%
