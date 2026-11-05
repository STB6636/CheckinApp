---
id: "rule_multi_admin_realtime_sync_and_cache_defense"
title: "ระบบ Realtime Concurrency Sync ป้องกันคำขอชนกันของผู้ดูแลระบบ และสถาปัตยกรรมป้องกันแคช 4 ชั้น (GitHub Pages Cache Defense)"
type: "rule"
tags: ["realtime", "supabase", "concurrency", "cache-control", "approvals", "admin", "loca-v2"]
related_flows: ["FLOW_LAYOUT_01", "FLOW_SPECIAL_REQ_01", "FLOW_CHECKIN_01", "FLOW_DASHBOARD_01"]
created_phase: "PIPE-20261105-loca-v2-gps-gold-realtime"
last_updated: "2026-11-05"
---

# ระบบ Realtime Concurrency Sync ป้องกันคำขอชนกันของผู้ดูแลระบบ และสถาปัตยกรรมป้องกันแคช 4 ชั้น

## 1. บริบทและปัญหา (Context & Problem)
1. **ปัญหาคำขอชนกัน (Multi-Admin Collision):** เมื่อมีผู้ดูแลระบบหลายคนเปิดหน้า `approvals.html` หรือ `dashboard.html` ค้างไว้พร้อมกัน เมื่อแอดมินคนแรกกด "อนุมัติ" หรือ "ปฏิเสธ" คำขอ หน้าจอของแอดมินคนที่สองจะไม่ทราบข้อมูลและยังคงแสดงคำขอเดิมค้างอยู่ หากกดซ้ำจะเกิดความสับสนหรือข้อผิดพลาด
2. **ปัญหาแคชของ GitHub Pages / มือถือ:** เบราว์เซอร์บนมือถือ (Chrome, Safari, LINE In-App Browser) มักแคชไฟล์ static HTML/JS/CSS ไว้อย่างฝังแน่น เมื่อนักพัฒนา Deploy โค้ดใหม่ขึ้น GitHub Pages ผู้ใช้จะยังคงเห็นหน้าจอเวอร์ชันเก่าจนกว่าจะกดเคลียร์แคชด้วยตนเอง

## 2. โซลูชันสถาปัตยกรรม (Architectural Blueprint)

### 2.1 Multi-Admin Real-time Concurrency Sync (Supabase Realtime)
- **การติดตั้ง Realtime Channel ใน `AppLayout.js` (`initAdminRealtimeSync`):**
  * สับสไครบ์ช่อง `'bma_admin_realtime'` ผ่าน WebSocket ดักฟัง `postgres_changes` บนตาราง `'attendance_logs'`
  * เมื่อตรวจพบการ INSERT หรือ UPDATE (เช่น มีคำขอใหม่ หรือแอดมินคนใดคนหนึ่งอนุมัติ):
    1. เรียก `AppLayout.refreshNotificationBell(currentUser)` ทันทีเพื่ออัปเดตตัวเลขกระดิ่งทุกเครื่อง
    2. ส่ง Custom Event `window.dispatchEvent(new CustomEvent('bma:realtime-sync', { detail: payload }))`
- **การรับฟังเหตุการณ์ใน Controller (`ApprovalsController` และ `DashboardController`):**
  * คอนโทรลเลอร์ดักฟังอีเวนต์ `'bma:realtime-sync'` และเรียกฟังก์ชันโหลดข้อมูลใหม่แบบ Silent Re-fetch โดยไม่ต้องรีโหลดหน้าเว็บทั้งหน้า
- **Network Fallback & Visibility Sync:**
  * มี Polling fallback ทุก 15 วินาที
  * มี `visibilitychange` listener ตรวจสอบและซิงค์ข้อมูลทันทีเมื่อผู้ใช้สลับแท็บกลับมา
- **Concurrency Conflict Guard ใน `AttendanceModel.processSpecialRequestsBulk`:**
  * ก่อนทำการอัปเดตสถานะ ระบบจะคิวรีตาราง `attendance_logs` ตรวจสอบว่าคำขอยังคงมีสถานะ `'pending'` หรือไม่
  * หากพบว่าคำขอถูกประมวลผลโดยแอดมินคนอื่นไปแล้ว ระบบจะคืนค่า `{ success: false, conflict: true, message: 'คำขอนี้ได้รับการดำเนินการโดยผู้ดูแลระบบท่านอื่นแล้ว' }` ป้องกันการเขียนทับซ้ำซ้อน

### 2.2 สถาปัตยกรรมป้องกันแคช 4 ชั้น (4-Layer Cache Defense)
1. **HTTP-Equiv Headers ใน `<head>`:**
   - `<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">`
   - `<meta http-equiv="Pragma" content="no-cache">`
   - `<meta http-equiv="Expires" content="0">`
2. **Cache-Busting Query Strings:** ใส่พารามิเตอร์เวอร์ชันตามเวลาบิลด์ (`?v=20261105_1545`) บนไฟล์ CSS และ JavaScript
3. **Client-Side Version Checker (`AppVersionManager`):**
   - ฝังสคริปต์ใน `<head>` ตรวจสอบ `localStorage.getItem('bma_app_build')` เทียบกับ `CURRENT_APP_BUILD`
   - หากตรวจพบบิลด์ใหม่ จะสั่งล้าง Cache Storage (`caches.delete()`) และบังคับ Reload ทันที
4. **Visibility Auto-Sync:** ตรวจสอบการอัปเดตทุกครั้งเมื่อแท็บแอปกลับมา Active

### 2.3 การ์ด GPS สไตล์วิดเจ็ต 2-Tone สีเหลืองเข้ม (Deep Golden Amber Widget)
- **ครึ่งบน (สีเหลืองเข้ม):** ไล่เฉดสีทองเข้ม `bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white` แสดงไอคอนหมุด, หัวข้อ "พิกัด (GPS)", ชื่อสถานที่ตัวหนาสีขาวสว่าง, และพิกัดละติจูด/ลองจิจูดสีทองอ่อน
- **ครึ่งล่าง (พื้นหลังขาว/เทา):** ปุ่ม `[ 🔄 ค้นหาพิกัดใหม่ ]` และ `[ 🗺️ ดูแผนที่ ]` ตรึงติดขอบล่างของการ์ด (`mt-auto`) สวยงาม ไม่มีช่องว่างสีขาวตกค้างใต้ปุ่ม
- **กระชับพื้นที่ล่างสุด:** ลด Padding ขอบล่างของ `<main>` เหลือ `pb-16 sm:pb-20 lg:pb-1.5` เพื่อให้ขอบล่างของหน้าจอจบพอดีกับการ์ดใบสุดท้าย
