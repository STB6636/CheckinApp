---
id: "rule_realtime_differential_dom_diffing_and_multi_admin_concurrency"
title: "Domain Rule: ระบบ Realtime DOM Diffing & Multi-Admin Concurrency Engine"
type: "rule"
tags: ["realtime", "dom-diffing", "delta-patching", "concurrency", "multi-admin", "approvals", "dashboard", "reports", "personnel", "users"]
last_updated_phase: "PIPE-20261109-admin-realtime-differential-table-sync"
related_flows: ["FLOW_LAYOUT_01", "FLOW_SPECIAL_REQ_01", "FLOW_ADMIN_DASHBOARD_01", "FLOW_REPORTS_01", "FLOW_PERSONNEL_01", "FLOW_USERS_01"]
---

# ⚡ Domain Rule: ระบบ Realtime DOM Diffing & Multi-Admin Concurrency Engine

## 1. ที่มาและปัญหา (Background & Root Cause)
1. **ปัญหาเดิม**:
   - เมื่อมีการเปลี่ยนแปลงข้อมูลในระบบ (เช่น บุคลากรส่งคำขออนุมัติ หรือลงเวลาเข้างาน) ฟังก์ชันเดิมใน Controller มักสั่งรัน `loadData()` แบบ Full Reload ซึ่งสั่งล้าง DOM ทั้งหมด (`tbody.innerHTML = renderTableSkeleton(...)`) และเปิดหน้าต่างหมุน `UIHelpers.showLoading(...)`
   - ผลกระทบ: หน้าจอแอดมินกระพริบ เสียสมาธิ ตำแหน่ง Scroll เลื่อนหลุด และ Checkbox ที่แอดมินกำลังติ๊กเลือกจะหลุดหายทันที
2. **ปัญหา Concurrency เมื่อมี Admin หลายคน**:
   - หาก Admin A และ Admin B เปิดหน้าเดียวกัน (เช่น หน้าอนุมัติกรณีพิเศษ) แล้ว Admin A กดอนุมัติคำขอ #101 Admin B ที่ยังเห็นคำขอนั้นอยู่อาจกดอนุมัติหรือปฏิเสธซ้ำ ทำให้เกิด 409 Conflict หรือ Audit Log ขัดแย้ง
   - ในหน้าบุคลากร/ผู้ใช้งาน หากเปิดหน้าต่าง Modal แก้ไขคนเดียวกัน อาจเกิด Dirty Write เขียนทับข้อมูลของกันและกัน

---

## 2. กฎและมาตรฐานสถาปัตยกรรม (Architectural Rules)

### 2.1 ยูทิลิตีแกนกลาง `DOMDiffHelper.js` (`assets/js/utils/DOMDiffHelper.js`)
ทุกตารางและหน้าจอหลักของผู้ดูแลระบบต้องใช้ `DOMDiffHelper` ในการจัดการ DOM ดังนี้:
- **`reindexTableSequence(tbody, seqSelector = '.seq-num', startIndex = 1)`**:
  วนลูปนับเฉพาะแถวที่ยังมองเห็นใน DOM เพื่อรันหมายเลข `ลำดับ 1, 2, 3...` อัตโนมัติทุกครั้งที่มีการแทรกหรือลบแถว ป้องกันปัญหาตัวเลขลำดับฟันหลอ
- **`lockRowForConcurrentAdmin(rowEl, adminName, actionText)`**:
  เมื่อแอดมินท่านอื่นดำเนินการ ล็อกปุ่มคำสั่งทันที (`disabled`), ใส่ป้ายกำกับ `อนุมัติแล้ว โดย {adminName}` พร้อมไฮไลต์สีฟ้า (`.row-locked-highlight`)
- **`prependRowWithAnimation(tbody, rowHtml, highlightClass = 'row-enter-highlight')`**:
  แทรกแถวใหม่ที่ด้านบนของกลุ่ม พร้อมแอนิเมชันสีเขียวนุ่มนวล (`rowGreenPulse`)
- **`removeRowWithFade(rowEl, durationMs = 600, onComplete)`**:
  ค่อยๆ เลื่อนและจางแถวออกด้วย `.row-leave-fade` (opacity 0 + translateX 25px) แล้วนำออกจาก DOM พร้อมเรียก Callback
- **`animateNumericValue(element, startVal, endVal, durationMs = 800)`**:
  นับตัวเลขสถิติบนการ์ด Jewel Stat Cards ให้เลื่อนขึ้นอย่างนุ่มนวล พร้อมใส่ `.counter-badge-pop`

### 2.2 การกระจาย Event จาก `AppLayout.js`
`AppLayout.js` ทำหน้าที่เป็น Event Bus กลาง:
- ดักจับทั้ง Supabase Realtime WebSocket `postgres_changes` และ Polling Fallback 15 วินาที
- เมื่อตรวจพบการเปลี่ยนแปลง กระจาย CustomEvent:
  ```javascript
  window.dispatchEvent(new CustomEvent('bma:realtime-delta-sync', {
      detail: { table, record, action, actor: currentUser?.full_name || 'Admin', timestamp: Date.now() }
  }));
  ```
- คง `bma:realtime-sync` ไว้เพื่อความเข้ากันได้ย้อนหลัง

### 2.3 กฎการรองรับ Admin มากกว่า 2 คน (Multi-Admin Concurrency Protocol)
1. **Approvals & Password Reset**:
   - เมื่อ Admin A กดอนุมัติ ทันทีที่ Event ถึง Admin B ให้ทำการ:
     * ถอด `id` ออกจาก `this.selectedIds`
     * ปลด Checkbox
     * ปรับตัวเลขนับ Bulk Action
     * ล็อกปุ่มแถวนั้นและแสดงชื่อ Admin A
     * หน่วงเวลา 2.5 วินาที เพื่อให้ Admin B มองเห็นชัดเจน ก่อนสไลด์แถวออก
2. **Personnel & Users Modals**:
   - หากหน้าต่าง Modal แก้ไขกำลังเปิดอยู่ แล้วตรวจพบ Event แก้ไขบุคคลเดียวกัน (`currentEditingId === deltaRecord.id`):
     * แสดงแถบแจ้งเตือนสีส้มแบบ Non-blocking ใน Modal:  
       `⚠️ ข้อมูลนี้เพิ่งถูกอัปเดตโดย [Admin อื่น] [ดูความแตกต่าง] [โหลดข้อมูลล่าสุด]`
     * ห้ามเขียนทับข้อมูลในฟอร์มโดยพลการ เพื่อให้แอดมินตัดสินใจ
3. **Reports (หน้ารายงาน)**:
   - ตรวจสอบเงื่อนไขตัวกรอง (Filter-Aware):
     * หากตรงกับสังกัด/วันที่/สถานะที่เลือกอยู่ -> แทรก/อัปเดต Cell เวลาออกและสถานะแบบ In-Place
     * หากไม่ตรง -> อัปเดตเฉพาะแคชหลังบ้าน ไม่รบกวนหน้าจอ Pagination หรือ Filter ที่แอดมินกำลังตรวจดู

