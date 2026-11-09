---
name: "realtime_differential_dom_diffing_and_concurrency"
description: "Pattern สำหรับอัปเดตตารางและแดชบอร์ดแบบ Realtime Differential DOM Diffing (ไร้ Skeleton กระพริบ) แทรกแถวใหม่ ลบแถวที่จัดการแล้ว รันเลขลำดับอัตโนมัติ และระบบ Concurrency Shield ป้องกัน Admin หลายคนทำงานชนกัน"
version: "1.0.0"
---

# Realtime Differential DOM Diffing & Multi-Admin Concurrency Engine Pattern

## Context & Problem
เมื่อแอปพลิเคชันทำงานแบบเรียลไทม์ (Supabase WebSocket หรือ Polling):
1. การทำ Full Reload (`tbody.innerHTML = skeleton`) ทำให้เกิดหน้าจอกระพริบ สปินเนอร์หมุนบังจอ ตำแหน่ง Scroll เลื่อนหลุด และ Checkbox ที่เลือกไว้หลุด
2. เมื่อมี Admin หลายคนเปิดหน้าจอเดียวกัน (เช่น หน้าอนุมัติ) การกดอนุมัติคำขอเดียวกันพร้อมกันจะทำให้เกิด Race Condition หรือ 409 Conflict
3. การเปิดหน้าต่าง Modal แก้ไขข้อมูลบุคคลเดียวกันอาจเกิดการเขียนทับข้อมูลโดยไม่ตั้งใจ (Dirty Write)

## Core Solution Architecture
1. **Shared Utility `DOMDiffHelper.js`**:
   - `reindexTableSequence(tbody, seqSelector, startIndex)`: รันเลขลำดับ 1, 2, 3 ใหม่เฉพาะแถวที่ยังมองเห็น
   - `lockRowForConcurrentAdmin(rowEl, adminName, actionText)`: ล็อกปุ่มแถวเมื่อแอดมินอื่นจัดการ พร้อมไฮไลต์สีฟ้า
   - `prependRowWithAnimation(tbody, rowHtml, highlightClass)`: แทรกแถวใหม่ด้านบนพร้อมแอนิเมชันสีเขียว
   - `removeRowWithFade(rowEl, durationMs, onComplete)`: จางแถวออกและลบจาก DOM
   - `animateNumericValue(element, startVal, endVal, durationMs)`: เลื่อนตัวเลขนับขึ้นแบบ Odometer
2. **Global PubSub Bus ใน `AppLayout.js`**:
   - ส่ง `bma:realtime-delta-sync` พร้อมระบุ `actor: currentUser.full_name` เพื่อให้ไคลเอนต์อื่นทราบว่าใครกระทำ
3. **Multi-Admin Protection**:
   - ปลด Checkbox ออกจากชุดเลือก `selectedIds` อัตโนมัติเมื่อรายการถูกจัดการโดยแอดมินอื่น
   - แสดงแถบเตือนสีส้มใน Modal เมื่อข้อมูลที่เปิดอยู่ถูกอัปเดตโดยแอดมินอื่น

