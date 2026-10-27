---
id: "doc_system_user_manuals_html"
title: "Documentation: คู่มือการใช้งานระบบ CheckinApp แบบ Standalone HTML แยก 3 ระดับสิทธิ์"
type: "context"
last_updated_phase: "PIPE-20261027-user-manuals-html"
flows:
  - "FLOW_AUTH_01"
  - "FLOW_LAYOUT_01"
  - "FLOW_CHECKIN_01"
  - "FLOW_DASHBOARD_01"
  - "FLOW_REPORTS_01"
  - "FLOW_SPECIAL_REQ_01"
  - "FLOW_PERSONNEL_01"
  - "FLOW_SETTINGS_01"
  - "FLOW_USERS_01"
---

# 📚 เอกสารคู่มือการใช้งานระบบ CheckinApp (Standalone HTML User Manuals)

## 1. วัตถุประสงค์และสถาปัตยกรรม (Architecture & Purpose)
คู่มือการใช้งานระบบถูกออกแบบเป็นไฟล์ **Standalone HTML** แยกอิสระจากโค้ดแอปพลิเคชันหลัก ตั้งอยู่ที่โฟลเดอร์ `docs/manual/` เพื่อความสะดวกในการเปิดอ่าน พิมพ์ออกกระดาษ (Print-to-PDF) และแชร์ให้แก่ข้าราชการและบุคลากรทุกระดับ โดยไม่ต้องล็อกอินเข้าสู่ระบบจริง

## 2. โครงสร้างไฟล์คู่มือ (`docs/manual/`)

| ไฟล์ | กลุ่มเป้าหมาย | สาระสำคัญ |
| :--- | :--- | :--- |
| `docs/manual/index.html` | ผู้ใช้งานทุกระดับ | หน้ารวมศูนย์กลาง การ์ดเข้าสู่คู่มือทั้ง 3 บทบาท และ **Permissions Matrix ตารางเปรียบเทียบสิทธิ์ 4 ระดับ** (User, Admin ฝ่าย, Admin กอง, SuperAdmin) ต่อทุกเมนูในระบบ |
| `docs/manual/manual-user.html` | ผู้ใช้งานทั่วไป (User) | 10 บท + FAQ: การล็อกอิน, ลืมรหัสผ่านด้วยบัตร ปชช., ส่วนประกอบหน้าจอ PC/มือถือ, กล้อง Mirror 3:4, ลงเวลาปกติ + กล่องยืนยัน Soft UI, ลงเวลากะ/Dropdown, ยื่นคำขอพิเศษ, ตรวจสอบ 5 ป้ายสถานะ, สลับธีม/ออกจากระบบ, การแก้ปัญหาเบื้องต้น |
| `docs/manual/manual-admin.html` | ผู้ดูแลระบบ (Admin) | 10 บท + FAQ: สิทธิ์ Admin กอง (`bureau`) vs Admin ฝ่าย (`division`), โครงสร้างเมนู Sidebar/มือถือ, Dashboard การ์ดสถิติ 5 ด้าน, อนุมัติคำขอเดี่ยว/Bulk, รายงาน & ปรับปรุงเวลา, พิมพ์ PDF/ส่งออก Excel, ทะเบียนบุคลากร/Excel หลายแผ่น, จัดการบัญชี & อนุมัติรหัสผ่าน (**เฉพาะ Admin กอง**), กระดิ่งแจ้งเตือน |
| `docs/manual/manual-superadmin.html` | ผู้ดูแลระบบสูงสุด (SuperAdmin) | 9 บท + FAQ: สิทธิ์สูงสุดแบบเบ็ดเสร็จ (`all`), ข้อมูลหน่วยงาน & โลโก้, เกณฑ์เวลา & บันทึกครั้งเดียว, นโยบายกล้อง/GPS & Google Drive Web App, กะเวลาทำงาน (ปกติ/OT/ข้ามวัน/กำหนดเอง), ตำแหน่ง 3 ขั้น & สังกัด 4 ขั้น, ควบคุม Admin Scope, อ้างอิงเมนู Admin, ความปลอดภัย PDPA/การสำรองข้อมูล |

## 3. จุดเด่นด้านการออกแบบ (Design Highlights)
- **ธีม กทม. (BMA Emerald & Soft UI):** สีเขียว `#00744B`, ฟ้า `#0971CE`, ส้ม `#FFB449`, แดง `#E11D48`
- **ระบบถนอมสายตา (Eye-Care Dark Mode):** สวิตช์สลับโหมดสว่าง/มืด จดจำค่าใน `localStorage` (`bma_manual_theme`)
- **Responsive & Sticky TOC:** สารบัญด้านข้างเลื่อนติดตามหน้าจอ พร้อมปุ่มเปิดเมนูสารบัญบนหน้าจอมือถือ
- **Print Optimization (`@media print`):** ซ่อนปุ่มและสารบัญอัตโนมัติเมื่อสั่งพิมพ์ เพื่อพิมพ์ลงกระดาษ A4 หรือบันทึกเป็น PDF สวยงาม
- **ความแม่นยำ 100%:** อิงตามฟังก์ชันจริงล่าสุดบน Branch `Test-UXUI` (Dropdown กะว่าง, กล้อง Mirror, Soft UI Confirmation Modal)

## 4. จุดเชื่อมโยงเข้าสู่คู่มือในระบบ (Manual Access Entry Points in Application)
1. **Sidebar ระบบบริหารจัดการ (`AppLayout.js`):** เมนู "คู่มือการใช้งานระบบ" ลิงก์ไปยัง `docs/manual/index.html` (เป้าหมาย `target="_blank"`) จัดวางระหว่างกลุ่มเมนูหลักกับปุ่ม "ไปหน้าลงเวลาปฏิบัติราชการ" สำหรับผู้ดูแลระบบทุกระดับ (SuperAdmin และ Admin)
2. **ระบบลงเวลาปฏิบัติราชการ มุมมอง PC/Tablet (`checkin.html`):** ปุ่มแท็บที่ 4 "คู่มือการใช้งาน" (`#tabDesktopManual`) ต่อท้ายแท็บ "ประวัติการขอลงเวลากรณีพิเศษ"
3. **ระบบลงเวลาปฏิบัติราชการ มุมมองมือถือ (`checkin.html`):** ปุ่ม "คู่มือ" (`#btnMobileManual`) บน Header ติดกับปุ่มแฮมเบอร์เกอร์ โดยซ่อนปุ่มระบบผู้ดูแลบน Header มือถือ (`max-lg:hidden`) เนื่องจากมีให้เข้าใช้งานผ่านเมนูแฮมเบอร์เกอร์อยู่แล้ว


