# Domain Rule: ตัวกรองโครงสร้างองค์กรลำดับชั้นและมุมมองจัดกลุ่มในหน้าจัดการบัญชีผู้ใช้งาน

- **Flow ID:** `FLOW_USERS_01`, `FLOW_SETTINGS_01`
- **Related Files:**
  - `users.html` (`#selectUserGroupBy`, `#hierarchicalUserOrgFilterDock`, `#selectUserFilterBureau`, `#selectUserFilterDivision`, `#selectUserFilterWorkGroup`)
  - `assets/js/controllers/UsersController.js` (`#initHierarchicalOrgFilter`, `#populateHierarchicalOrgFilter`, `#updateDivisionOptions`, `#updateWorkGroupOptions`, `#getFilteredUsers`, `#renderUsersTable`, `#buildUserRowHtml`)

---

## 1. ขอบเขตสิทธิ์การมองเห็น (Role Visibility Scope)
1. **แสดงตัวกรองลำดับชั้นเฉพาะ:**
   - `SuperAdmin` (ผู้ดูแลระบบสูงสุด)
   - `Admin` ที่มีขอบเขตการมองเห็นระดับ **สำนักงาน/กอง** (`this.isAdminBureau`)
2. **ซ่อนตัวกรองโดยสิ้นเชิง (`hidden` class):**
   - `Admin` ที่มีขอบเขตการมองเห็นระดับ **ส่วน/ฝ่าย** (`this.isAdminDivision` จะถูก silent redirect กลับหน้า dashboard.html ตามกฎความปลอดภัย)
   - ผู้ใช้งานทั่วไป (`User`)

---

## 2. แหล่งข้อมูลโครงสร้างและการบังคับเลือกลำดับชั้น (Sequential Cascade Enforcement)
1. **อ้างอิงจากตั้งค่าระบบ (`SettingsModel`):**
   - ดึงข้อมูลสังกัดจาก `settings.affiliations` ผ่าน `SettingsModel.getUniqueBureaus()`, `SettingsModel.getUniqueDivisions()`, `SettingsModel.getUniqueGroups()` ผสานกับสังกัดจริงในบัญชีผู้ใช้งานและบุคลากร
2. **การบังคับเลือกลำดับชั้น (Sequential Selection Enforcement):**
   - **เริ่มต้น:** `สำนักงาน/กอง` เปิดใช้งาน (Enabled: all), ส่วน `ส่วน/ฝ่าย` และ `กลุ่มงาน` จะถูก **ปิดการเลือก (Disabled)** พร้อมใส่คลาส `opacity-60 cursor-not-allowed bg-slate-100` และมีค่าเป็น "แสดงทั้งหมด"
   - **เมื่อเลือกสำนักงาน/กอง:** `ส่วน/ฝ่าย` จะ **ปลดล็อกเปิดใช้งาน (Enabled)** พร้อมแสดงรายชื่อฝ่ายภายใต้กองนั้น; `กลุ่มงาน` ยังคงปิดการใช้งานต่อไป
   - **เมื่อเลือกส่วน/ฝ่าย:** `กลุ่มงาน` จะ **ปลดล็อกเปิดใช้งาน (Enabled)** พร้อมแสดงรายชื่อกลุ่มงานภายใต้ฝ่ายนั้น
   - **เมื่อรีเซ็ตกลับเป็น "แสดงทั้งหมด" ในลำดับบน:** ลำดับล่างจะถูกรีเซ็ตค่าเป็น `all` และกลับไปอยู่ในสถานะ Disabled ทันที

---

## 3. มุมมองจัดกลุ่ม 2 รูปแบบ (เหมือนหน้าบุคลากร)
- Dropdown `#selectUserGroupBy`:
  - `มุมมองที่ 1: สำนักงาน/กอง > ส่วน/ฝ่าย` (`value="division"`, ค่าเริ่มต้น)
  - `มุมมองที่ 2: สำนักงาน/กอง > ส่วน/ฝ่าย > กลุ่มงาน` (`value="group"`)
- จัดกลุ่มข้อมูลบัญชีผู้ใช้ด้วย `PersonnelModel.groupPersonnel(filtered, this.groupViewMode)`
- แสดงแถวหัวข้อ กอง > ฝ่าย ด้วยสี `this.headerColor` (ความโปร่งใส `18`, `border-left: 4px solid ...`) และแถวกลุ่มงานย่อย (เมื่อเลือกมุมมองที่ 2)

---

## 4. ข้อควรระวังและการรักษาความสมบูรณ์ของระบบ (Safeguards)
1. **ตารางบัญชีหลัก (Main Users Table):**
   - โครงสร้าง 6 คอลัมน์เดิมคงอยู่ครบถ้วน (ลำดับ, Username, ชื่อ-นามสกุล, Role, ขอบเขตการมองเห็น, จัดการ)
   - สิทธิ์คอลัมน์ "จัดการ": แสดงปุ่มแก้ไข/ลบเฉพาะ SuperAdmin (`this.canEditOrDeleteUsers`), ซ่อนคอลัมน์สำหรับ Admin สำนักงาน (`colSpan = 5`)
2. **ตารางที่ 2 (คำสั่งอนุมัติเปลี่ยนรหัสผ่าน):**
   - ทำงานได้ปกติ 100% แยกจากตารางหลัก พร้อมปุ่มอนุมัติ/ไม่อนุมัติ และ Badge จำนวนรออนุมัติ
3. **ปุ่มคำสั่งหลัก:**
   - เพิ่มบัญชี, นำเข้า Excel, ส่งออก Excel และ Template Excel ทำงานได้สมบูรณ์
