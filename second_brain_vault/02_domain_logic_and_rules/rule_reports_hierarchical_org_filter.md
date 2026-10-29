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

## 3. พฤติกรรม Cascading, Reset & Sequential Enforcement (การเลือกแบบไล่ลำดับชั้น)
- **แหล่งข้อมูลโครงสร้างองค์กร (System Settings Affiliations):**
  - อ้างอิงจากโครงสร้างในตั้งค่าระบบ (`settings.affiliations`) ผ่าน `SettingsModel.getUniqueBureaus(this.settings)`, `SettingsModel.getUniqueDivisions(this.settings, bureau)`, และ `SettingsModel.getUniqueGroups(this.settings, bureau, division)` ผสานกับข้อมูลบุคลากร/รายการบันทึกเวลาเพื่อความครอบคลุม
- **การบังคับเลือกลำดับชั้น (Sequential Selection Enforcement):**
  - **สถานะเริ่มต้น (Initial Load):**
    - [สำนักงาน/กอง] เปิดใช้งาน (`disabled = false`) ค่าเริ่มต้นเป็น `all` ("แสดงทั้งหมด")
    - [ส่วน/ฝ่าย] ปิดการใช้งาน (`disabled = true`, `classList: opacity-60 cursor-not-allowed`) ค่าเป็น `all`
    - [กลุ่มงาน] ปิดการใช้งาน (`disabled = true`, `classList: opacity-60 cursor-not-allowed`) ค่าเป็น `all`
  - **เมื่อเลือก [สำนักงาน/กอง]:**
    - [ส่วน/ฝ่าย] จะเปิดใช้งาน (`disabled = false`) และดึงข้อมูลส่วน/ฝ่ายที่สังกัดสำนักงาน/กองนั้น พร้อมตั้งค่าเป็น `all`
    - [กลุ่มงาน] ยังคงปิดการใช้งาน (`disabled = true`) จนกว่าจะมีการระบุส่วน/ฝ่าย
  - **เมื่อเลือก [ส่วน/ฝ่าย]:**
    - [กลุ่มงาน] จะเปิดใช้งาน (`disabled = false`) และดึงข้อมูลกลุ่มงานที่สังกัดสำนักงาน/กองและส่วน/ฝ่ายนั้น พร้อมตั้งค่าเป็น `all`
  - **เมื่อรีเซ็ต [ส่วน/ฝ่าย] กลับเป็น "แสดงทั้งหมด" (`all`):**
    - [กลุ่มงาน] จะถูกรีเซ็ตค่ากลับเป็น `all` และถูกปิดการใช้งาน (`disabled = true`)
  - **เมื่อรีเซ็ต [สำนักงาน/กอง] กลับเป็น "แสดงทั้งหมด" (`all`):**
    - ทั้ง [ส่วน/ฝ่าย] และ [กลุ่มงาน] จะถูกรีเซ็ตค่ากลับเป็น `all` และถูกปิดการใช้งาน (`disabled = true`) ทั้งสองระดับ
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

---

## 5. มาตรฐานการ Render Dropdown และ Sanitization
- การ Render ข้อความและ Value ภายใน `<option>` ต้องผ่าน `UIHelpers.escapeHtml(str)` เสมอเพื่อป้องกัน XSS
- ฟังก์ชัน `UIHelpers.escapeHtml(str)` รองรับทั้ง `null`, `undefined` และแปลงอักขระพิเศษ HTML 5 ตัว (`&`, `<`, `>`, `"`, `'`) ได้อย่างปลอดภัย

