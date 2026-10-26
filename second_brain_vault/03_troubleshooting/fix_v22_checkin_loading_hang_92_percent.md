---
id: "fix_v22_checkin_loading_hang_92_percent"
title: "Post-mortem V22: แก้ไขหน้าลงเวลาค้างที่ 92% จาก CDN Scripts และ DOM IDs ตกหล่นใน checkin.html"
type: "postmortem"
status: "resolved"
date: "2026-10-26"
tags: ["checkin.html", "CheckinController.js", "loading-hang", "supabase-cdn", "sweetalert2", "null-safe-dom"]
linked_flows: ["FLOW_CHECKIN_01", "FLOW_SPECIAL_01"]
---

# Post-mortem V22: แก้ไขหน้าลงเวลาปฏิบัติราชการค้างที่ 92%

## อาการของปัญหา (Symptom)
เมื่อเปิดหน้าลงเวลาปฏิบัติราชการ (`checkin.html`) ระบบแสดงหน้าต่างโหลด `"กำลังเตรียมระบบลงเวลาปฏิบัติราชการ... 92%"` ค้างอยู่และไม่สามารถเข้าสู่หน้าใช้งานได้

## สาเหตุรากเหง้า (Root Causes)
1. **ขาด CDN Scripts ใน `<head>` ของ `checkin.html`:**
   - สคริปต์ `<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>` และ `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>` ตกหล่นไปในระหว่างการปรับโครงสร้าง HTML V22
2. **เกิด `Uncaught TypeError` ใน `CheckinController.#renderUserAndSettingsInfo()`:**
   - DOM IDs 4 จุด (`footerCheckinOrg`, `footerCheckinBureau`, `footerCheckinDesc`, และ `spRemarkSelect`) ตกหล่นไปจาก `checkin.html`
   - เมื่อ `CheckinController.init()` เรียก `#renderUserAndSettingsInfo()` ที่บรรทัด 53 จึงเกิด `TypeError: Cannot set properties of null (setting 'textContent')` ที่บรรทัด 266 ทันที
3. **ไม่มี `try ... finally` ครอบบล็อกโหลดข้อมูลใน `CheckinController.init()`:**
   - เมื่อเกิด Error ที่บรรทัด 53 โปรแกรมจึงหยุดทำงานก่อนถึงบรรทัด 56 (`UIHelpers.hideLoading()`) ส่งผลให้แถบโหลดค้างอยู่ที่ 92%

## การแก้ไขและแนวทางป้องกัน (Resolution & Prevention)
1. คืนค่าสคริปต์ CDN (`sweetalert2@11` และ `@supabase/supabase-js@2`), `.checkin-civic-gradient` และ DOM IDs ทั้ง 4 จุดใน `checkin.html` ครบทั้ง 96 IDs
2. ครอบบล็อกโหลดข้อมูลใน `CheckinController.init()` ด้วย `try ... catch ... finally { UIHelpers.hideLoading(); }` เพื่อรับประกันว่าหน้าต่างโหลดจะถูกปิดเสมอแม้เกิดข้อผิดพลาด
3. ปรับ `CheckinController.#renderUserAndSettingsInfo()` ให้ใช้ฟังก์ชัน `setElText(id, text)` แบบ Null-safe ทุกจุด
