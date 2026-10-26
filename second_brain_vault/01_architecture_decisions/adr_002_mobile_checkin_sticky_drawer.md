---
id: "adr_002_mobile_checkin_sticky_drawer"
title: "ADR-002: สถาปัตยกรรมหน้าลงเวลามือถือแบบ Zero-Scroll ด้วย Sticky Bottom Bar, Two-Tier Banner และ Hamburger History Drawer"
type: "adr"
status: "accepted"
date: "2026-10-26"
tags: ["ux-ui", "mobile-first", "sticky-bar", "hamburger-drawer", "bma-checkin", "checkin.html"]
linked_flows: ["FLOW_CHECKIN_01", "FLOW_CHECKIN_02", "FLOW_SPECIAL_01"]
---

# ADR-002: สถาปัตยกรรมหน้าลงเวลามือถือแบบ Zero-Scroll

## สถานะ (Status)
**Accepted** (ใช้งานจริงในเวอร์ชัน V22 / Branch: `Test-UXUI`)

## บริบท (Context)
จากการเปรียบเทียบหน้าจอลงเวลาบนสมาร์ตโฟนระหว่างระบบเดิม (`Img - Check In App\ระบบของเราเอง`) กับระบบต้นแบบของกรุงเทพมหานคร (`Img - Check In App\ระบบตัวอย่างของ กทม` - `ckin.bangkok.go.th`):
1. **ปัญหาการเลื่อนหน้าจอ (High Scroll Friction):** ตารางประวัติการลงเวลาส่วนตัวและตารางคำขอกรณีพิเศษวางต่อท้ายในหน้าเดียวกัน ทำให้หน้าจอยืดยาว ผู้ใช้ต้องเลื่อนขึ้นลงเพื่อกดปุ่มบันทึกเวลา
2. **ตำแหน่งปุ่มไม่ติดมือ (Thumb Inaccessibility):** ปุ่มลงเวลาเลื่อนหายไปตามการเลื่อนหน้าจอ
3. **Hero Header ใช้พื้นที่สูงเกินไป:** แสดงทั้งตำแหน่งและสังกัดยืดยาว บดบังพื้นที่สำคัญบนจอมือถือ

## การตัดสินใจ (Decision)
1. **Sticky Bottom Check-in Bar (`.bma-sticky-checkin-bar`):**
   - บนจอมือถือ (`<1024px`): ปุ่มบันทึกลงเวลาจะ Fixed Dock อยู่ที่ขอบล่างของหน้าจอเสมอ (`bottom: 0, z-index: 40`) พร้อม Backdrop Blur แผงลอยเหนือเนื้อหา ทำให้ใช้นิ้วโป้งกดลงเวลาได้ทันทีใน 1 แตะโดยไม่ต้องเลื่อนหน้าจอ
   - บนจอคอมพิวเตอร์ (`>=1024px`): เปลี่ยนเป็น `position: static` ฝังตัวเรียบเนียนใน Checkin Action Card โดยอัตโนมัติผ่าน Media Query
   - เพิ่ม `pb-28 lg:pb-8` ในแท็ก `<main>` เพื่อป้องกันไม่ให้ปุ่มบังเนื้อหาด้านล่าง

2. **Two-Tier Header Architecture:**
   - **Tier 1 (Slim Name Banner):** แถบบนสุดความสูงกระชับ (~34px) แสดงเฉพาะ `[คำนำหน้า + ชื่อ + นามสกุล]` พร้อม User Role Badge ขนาดเล็กกะทัดรัด โดยซ่อนตำแหน่งและสังกัดจากหน้าลงเวลา (`class="hidden"`) เพื่อประหยัดพื้นที่แนวตั้ง
   - **Tier 2 (Balanced Live Clock Card):** การ์ดนาฬิกาดิจิทัลขนาดสบายตา แสดงวันที่ย่อภาษาไทยด้านบน (`liveDateDisplay`) และเวลาดิจิทัลเฉพาะ `hh:mm น.` (`liveClockDisplay`) กึ่งกลางอย่างชัดเจน

3. **Hamburger History Drawer สำหรับมือถือ (`#mobileHistoryDrawer`):**
   - นำตารางประวัติการลงเวลาและตารางคำขอพิเศษออกจากหน้าจอหลักของมือถือ
   - ผู้ใช้เข้าถึงได้ผ่านปุ่ม `[ ☰ เมนูประวัติฯ ]` (`#btnMobileHistoryMenu`) บน Topbar
   - เมื่อเปิด Drawer ขึ้นมา ระบบจะ Mount ตารางประวัติและประวัติคำขอพิเศษ พร้อมปุ่มยื่นคำขอพิเศษด่วน (`#btnOpenSpecialRequestDrawer`) แบบ Off-Canvas ไม่เปลืองหน่วยความจำและไม่มีปัญหา DOM ID ซ้ำซ้อน

4. **Desktop Navigation Tabs Bar (`hidden lg:block`):**
   - บนจอคอมพิวเตอร์ จัดระบบเป็น 3 แท็บด้านบน คล้ายหน้าตั้งค่าระบบ:
     - `[ ลงเวลาปฏิบัติราชการ ]` (`tabDesktopCheckin`): เวิร์กสเปซ 2 คอลัมน์ ไร้ตารางประวัติด้านล่าง
     - `[ ตารางประวัติการลงเวลาส่วนตัว ]` (`tabDesktopHistory`): ประวัติวันปัจจุบันและย้อนหลัง
     - `[ ประวัติการขอลงเวลากรณีพิเศษ ]` (`tabDesktopSpecial`): ประวัติคำขอพิเศษพร้อมปุ่มยื่นคำขอ

5. **Dynamic Workspace Layout (4 โหมดตามการตั้งค่าระบบ):**
   - โหมดที่ 1: บังคับถ่ายภาพ ON + บังคับ GPS ON (มาตรฐาน กทม.)
   - โหมดที่ 2: บังคับถ่ายภาพ OFF + บังคับ GPS ON (GPS อย่างเดียว)
   - โหมดที่ 3: บังคับถ่ายภาพ ON + บังคับ GPS OFF (ภาพถ่ายอย่างเดียว)
   - โหมดที่ 4: บังคับถ่ายภาพ OFF + บังคับ GPS OFF (Quick Punch แตะเดียวจบ)

## ผลลัพธ์และข้อดี (Consequences)
- **Zero-Scroll Experience:** จอมือถือสั้น กระชับ เห็นข้อมูลครบใน 1 วิวพอร์ต
- **Thumb Reachability 100%:** ปุ่มลงเวลาอยู่ตำแหน่งธรรมชาติของนิ้วโป้งเสมอ
- **100% Backward Compatibility:** DOM IDs เดิมทั้ง 93 สัญลักษณ์ใน `CheckinController.js` ทำงานได้ครบถ้วน
- **Responsive Symmetry:** ประสบการณ์ใช้งานบนมือถือเทียบเท่า Mobile App ตัวจริง ขณะที่บนคอมพิวเตอร์มีพื้นที่ทำงานกว้างขวางและเป็นสัดส่วนด้วยระบบแท็บ
