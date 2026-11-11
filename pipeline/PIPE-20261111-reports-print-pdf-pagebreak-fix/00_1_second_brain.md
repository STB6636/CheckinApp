# Second Brain Retrieval — Reports Print / Export PDF Page-Break Architecture

- **Task ID:** `PIPE-20261111-reports-print-pdf-pagebreak-fix`
- **Timestamp:** 2026-11-11T10:58:00+07:00
- **Flow Links:** `FLOW_REPORTS_01`

## 1. Retrieved Notes
1. **`rule_reports_hierarchical_org_filter.md`**:
   - การจัดกลุ่มรายงานแบ่งตามสำนักงาน/กอง, ส่วน/ฝ่าย, และกลุ่มงาน
   - ตารางพิมพ์ PDF รองรับทั้งการพิมพ์วันเดียว (Single Date) และช่วงวันที่ (Date Range)
2. **`ADR_0018_Tri_Layer_Realtime_Differential_Sync_Robustness.md`**:
   - โครงสร้างข้อมูลแถวรายงานผ่านการ format ใน `AttendanceModel.#formatReportRow()`
   - รองรับทั้งการแสดงบนหน้าเว็บและการสร้าง HTML สำหรับพิมพ์ PDF ผ่าน `ReportsController.#renderSeparateTablesBySelectedTags(true)`

## 2. Past Pitfalls to Avoid in CSS Paged Media (Printing)
- **Pitfall 1 (`page-break-inside: avoid` on Large Containers):**
  การใส่ `page-break-inside: avoid;` (หรือ `break-inside: avoid;`) บน container ขนาดใหญ่ที่หุ้มทั้งตาราง เช่น `.tag-section-block` ซึ่งมีแถวข้อมูล 50-250 แถว (สูงกว่า 1 หน้ากระดาษ)
  -> **ผลลัพธ์:** เบราว์เซอร์ตรวจพบว่าบล็อกนี้ไม่สามารถบรรจุลงในพื้นที่ที่เหลือของหน้า 1 ได้ จึงทำการแทรก Page Break ก่อนหน้าบล็อกนั้น และผลักทั้งตารางไปเริ่มที่หน้า 2 ส่งผลให้หน้า 1 เหลือเพียงหัวข้อ Header โดดเดี่ยวและพื้นที่สีขาวว่างเปล่าเกือบทั้งหน้า!
- **Pitfall 2 (Orphaned Headers & Titles):**
  การปล่อยให้หัวเรื่อง `.report-header`, `.day-section-banner`, หรือ `.tag-section-title` ถูกตัดแยกจากแถวแรกของตาราง ต้องบังคับใส่ `page-break-after: avoid; break-after: avoid;` เสมอ
- **Pitfall 3 (Missing Repeating Table Headers):**
  หากไม่มี `thead { display: table-header-group; }` เบราว์เซอร์จะไม่พิมพ์หัวตาราง (ลำดับ, ชื่อ-นามสกุล, ตำแหน่ง...) ซ้ำบนหน้า 2, 3, 4 ทำให้ผู้อ่านไม่ทราบว่าแต่ละคอลัมน์คืออะไร
- **Pitfall 4 (Split Rows):**
  หากไม่มี `tr { page-break-inside: avoid; break-inside: avoid; }` แถวข้อมูลบุคคลอาจถูกตัดครึ่งตามแนวนอนระหว่างเปลี่ยนหน้ากระดาษ
