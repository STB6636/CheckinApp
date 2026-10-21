# ระบบลงเวลาปฏิบัติราชการ (BMA Check-in App V2.1 - OOP Architecture)

ระบบลงเวลาปฏิบัติราชการออนไลน์ พัฒนาด้วยสถาปัตยกรรม **Object-Oriented Programming (OOP)** แยกไฟล์ตามกลุ่มการใช้งาน และแยกหน้าจอ HTML หน้าละไฟล์ เชื่อมต่อฐานข้อมูล **Supabase** และโฮสต์บน **GitHub Pages** ภายใต้ระบบสีอัตลักษณ์องค์กรกรุงเทพมหานคร (BMA Enterprise Design System) รองรับทั้งโหมดปกติ (Light Mode) และโหมดมืดถนอมสายตา (Eye-Care Dark Mode `#111816`)

---

## 1. ข้อมูลการเชื่อมต่อระบบ (Project Configuration)
* **GitHub Repository:** `https://github.com/STB6636/CheckinApp.git`
* **Supabase URL:** `https://yicatrqogmcncfpqdyra.supabase.co`
* **Supabase Project Ref:** `yicatrqogmcncfpqdyra`

---

## 2. ขั้นตอนการติดตั้งฐานข้อมูล Supabase
1. เข้าสู่ระบบ Supabase Dashboard ของโปรเจกต์ `yicatrqogmcncfpqdyra`
2. ไปที่เมนู **SQL Editor** ทางด้านซ้ายมือ
3. คัดลอกโค้ดทั้งหมดจากไฟล์ `sql/supabase_schema.sql` ไปวางแล้วกดปุ่ม **Run**
4. ระบบจะสร้างตารางทั้ง 4 ตาราง (`system_settings`, `personnel`, `user_accounts`, `attendance_logs`) พร้อมตั้งค่าสิทธิ์การเข้าถึง (RLS Policy) และสร้างบัญชีผู้ใช้งานเริ่มต้นให้ทันที:
   * **SuperAdmin:** Username `superadmin` / Password `123456`
   * **Admin:** Username `admin01` / Password `123456`
   * **User (ตัวอย่างบัตรประชาชน 13 หลัก):** Username `1231254684532` / Password `684532`

---

## 3. ขั้นตอนการอัปโหลดขึ้น GitHub และเปิดใช้งาน GitHub Pages
รันคำสั่งต่อไปนี้ใน Terminal ที่โฟลเดอร์โปรเจกต์:

```bash
git init
git add .
git commit -m "Deploy BMA CheckinApp V2.1 OOP Architecture"
git branch -M main
git remote add origin [https://github.com/STB6636/CheckinApp.git](https://github.com/STB6636/CheckinApp.git)
git push -u origin main