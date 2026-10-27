# Phase 0.1: Second Brain Retrieval

**Pipeline ID:** `PIPE-20261027-soft-ui-logout-alert`  
**Flows ที่เกี่ยวข้อง:**
- `FLOW_AUTH_01`: User Authentication, Role Redirect & Session Management Flow (Logout & Session Clearing)
- `FLOW_LAYOUT_01`: Admin Layout Shell & Tailwind CSS Soft UI Dashboard Integrity
- `FLOW_CHECKIN_01`: Check-in Page Navbar & Drawer Logout

## 1. ข้อมูลจาก Second Brain Vault
- `[[rule_shift_select_empty_and_soft_ui_alerts]]`: การใช้งาน SweetAlerts Soft UI Dashboard (Creative Tim) เป็นมาตรฐานหลักของแอป
- `[[checkinapp_project_context]]`: สถาปัตยกรรมการจัดการ Session และการเรียก `AuthService.clearSession()` เมื่อออกจากระบบ

## 2. การวิเคราะห์ปัญหาและการออกแบบแนวทางแก้ไข
1. **ปัจจุบัน:** เมธอด `UIHelpers.confirm()` ใช้ SweetAlert2 ค่าเริ่มต้นพร้อมปุ่มสี่เหลี่ยมธรรมดาและสีแบบ inline color (`#E11D48`, `#007B3E`, `#64748B`)
2. **แนวทางแก้ไขตามสไตล์ Creative Tim Soft UI Dashboard:**
   - ยกระดับ `UIHelpers.confirm()` ให้รองรับคลาส Soft UI Dashboard (ขอบมน `rounded-2xl`, Backdrop blur, `buttonsStyling: false`)
   - ปุ่มยืนยันออกจากระบบ: ใช้ Soft UI Gradient สี Rose-Red (`bg-gradient-to-tl from-rose-600 to-red-500 text-white shadow-soft-md hover:scale-102`)
   - ปุ่มยกเลิก: ใช้ Soft UI Slate (`bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200`)
   - รองรับการเรียกจากทั้ง 3 จุด: หน้าลงเวลาเดสก์ท็อป (`#btnCheckinLogout`), หน้าระบบลงเวลามือถือ (`#btnDrawerLogout`) และหน้าแอดมิน (`#btnSidebarLogout`)

