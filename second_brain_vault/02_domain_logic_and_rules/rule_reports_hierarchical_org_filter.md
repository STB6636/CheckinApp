# Domain Rule: ตัวกรองโครงสร้างองค์กรแบบลำดับชั้น (Hierarchical Organization Filter) ในหน้ารายงานการลงเวลา

- **Flow ID:** `FLOW_REPORTS_01`
- **Related Files:** 
  - `reports.html` (`#hierarchicalOrgFilterDock`, `#selectFilterBureau`, `#selectFilterDivision`, `#selectFilterWorkGroup`)
  - `assets/js/controllers/ReportsController.js` (`#initHierarchicalOrgFilter`, `#populateHierarchicalOrgFilter`, `#getFilteredRecords`)

---

## 1. ขอบเขตสิทธิ์การมองเห็น (Role Visibility Scope)
1. **แสดงตัวกรองเฉพาะ:**
   - `SuperAdmin` (ผู้ดูแลระบบสูงสุด)
   - `Admin` ที่มีขอบเขตการมองเห็นระดับ **สำนักงาน/กอง** (`this.isAdminBureau`)
2. **ซ่อนตัวกรองโดยสิ้นเชิง (`hidden` class):**
   - `Admin` ที่มีขอบเขตการมองเห็นระดับ **ส่วน/ฝ่าย** (`this.isAdminDivision`)
   - ผู้ใช้งานทั่วไป (`User`)

---

## 2. โครงสร้างลำดับชั้นและค่าเริ่มต้น (Hierarchy & Default Values)
- ประกอบด้วย Dropdown 3 ระดับ:
  1. **สำนักงาน/กอง** (`#selectFilterBureau`)
  2. **ส่วน/ฝ่าย** (`#selectFilterDivision`)
  3. **กลุ่มงาน** (`#selectFilterWorkGroup`)
- **ค่าเริ่มต้นของทุก Dropdown ต้องเป็น "แสดงทั้งหมด" (`value="all"`)** เสมอ

---

## 3. พฤติกรรม Cascading & Reset
- เมื่อผู้ใช้เปลี่ยนค่าใน Dropdown ระดับบน:
  - **เปลี่ยน "สำนักงาน/กอง":**
    - ตัวเลือกใน "ส่วน/ฝ่าย" จะถูกกรองให้เหลือเฉพาะส่วน/ฝ่ายที่สังกัดสำนักงาน/กองนั้น และรีเซ็ตค่าเป็น `all` ("แสดงทั้งหมด")
    - ตัวเลือกใน "กลุ่มงาน" จะถูกกรองให้เหลือเฉพาะกลุ่มงานที่สังกัดสำนักงาน/กองนั้น และรีเซ็ตค่าเป็น `all` ("แสดงทั้งหมด")
  - **เปลี่ยน "ส่วน/ฝ่าย":**
    - ตัวเลือกใน "กลุ่มงาน" จะถูกกรองให้เหลือเฉพาะกลุ่มงานที่สังกัดสำนักงาน/กอง และส่วน/ฝ่ายนั้น และรีเซ็ตค่าเป็น `all` ("แสดงทั้งหมด")
- มีการจัดเรียงภาษาไทยตามพจนานุกรมด้วย `localeCompare(b, 'th')` ในทุกระดับ

---

## 4. ความสัมพันธ์กับการกรองส่วนอื่น (Orthogonal Multi-layer Filtering)
1. **การกรองผ่าน `#getFilteredRecords()`:**
   - กรอง `this.records` ด้วยเงื่อนไข Bureau, Division, Work Group ที่เลือก (หากไม่ใช่ `all`)
2. **TAG สถานะ (Status Filter Chips):**
   - ปุ่ม TAG (`#statusTagsFilterContainer`) นำผลลัพธ์จาก `#getFilteredRecords()` ไปจัดกลุ่มตามสถานะ
   - ตัวเลขนับจำนวน (Badge) บนปุ่ม TAG แต่ละอันจะสะท้อนยอดรวมตามขอบเขต Org ที่เลือกโดยทันที
3. **ตารางแสดงผล & Modal ประวัติบุคลากร:**
   - โครงสร้างตาราง, คอลัมน์, ความกว้าง Colgroup, พิกัด GPS 2 คอลัมน์ยังคงแสดงผลตามปกติ
   - คลิกแถวเพื่อเปิดประวัติบุคลากร (`#modalPersonnelResumeProfile`) ทำงานได้สมบูรณ์
4. **การส่งออก Excel (Export):**
   - ปุ่ม `btnExportReportExcel` ดึงข้อมูลผ่าน `#getFilteredRecords()` และกรองตาม TAG สถานะที่เลือก จึงได้ข้อมูลที่แม่นยำตรงกับสิ่งที่แสดงบนหน้าจอ
