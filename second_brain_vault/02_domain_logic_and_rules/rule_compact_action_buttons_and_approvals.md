---
id: "rule_compact_action_buttons_and_approvals"
title: "Domain Rule: มาตรฐานปุ่มคำสั่งไอคอนเดี่ยว (w-8.5 h-8.5) และการจัดรูปแบบตำแหน่งในระบบอนุมัติพิเศษ"
type: "domain_rule"
status: "verified_active"
date: "2026-10-26"
tags: ["ui-rules", "compact-buttons", "table-design", "approvals", "position-formatting"]
related_notes: ["[[adr_003_double_layer_rbac_hierarchy]]", "[[checkinapp_project_context]]"]
related_skills: ["civil_servant_position_level_formatter", "ai-software-pipeline"]
linked_flows: ["FLOW_SPECIAL_REQ_01", "FLOW_DASHBOARD_01"]
last_updated_phase: "PIPE-20261026-enhance-approval-perm-checkin-overview"
---

# Domain Rule: มาตรฐานปุ่มคำสั่งไอคอนเดี่ยว (w-8.5 h-8.5) และการจัดรูปแบบตำแหน่ง

## 1. บริบทและปัญหา (Context & Problem Statement)
ในหน้าจอพิจารณาอนุมัติคำขอลงเวลาปฏิบัติราชการกรณีพิเศษ (`approvals.html` / `ApprovalsController.js`):
1. **ปัญหาตารางล้นขอบจอแนวนอน (Horizontal Overflow):**
   - ส่วนหัวตารางเดิมระบุข้อความยาวเกินจำเป็น เช่น `"คำนำหน้า + ชื่อ + นามสกุล"`, `"ตำแหน่ง + ระดับ"`, และ `"คำสั่ง [อนุมัติ / ไม่อนุมัติ]"` (กินพื้นที่กว้างถึง `w-48` หรือ 192px)
   - ปุ่มคำสั่งเดิมใช้ปุ่มแบบมีข้อความยาว `btn-bma-primary` ("อนุมัติ") และ `btn-bma-outline` ("ไม่อนุมัติ") วางเคียงกัน ทำให้คอลัมน์คำสั่งกินพื้นที่เกือบ 25% ของตาราง ส่งผลให้คอลัมน์ชื่อ-สกุล และหมายเหตุถูกบีบจนขึ้นบรรทัดใหม่หลายบรรทัด
2. **ปัญหาการแสดงผลชื่อตำแหน่งราชการไม่เป็นระเบียบ:**
   - ฐานข้อมูลหรือฟอร์มบางส่วนบันทึกคำว่า `"ระดับ"` ปะปนมาในคอลัมน์ `position_level` หรือมีการเว้นวรรคแปลกๆ ทำให้เมื่อนำมาต่อกับ `position_title` เกิดข้อความซ้ำซ้อน เช่น `"เจ้าพนักงานเทศกิจ ระดับระดับปฏิบัติงาน"` หรือ `"นิติกร ระดับ ชำนาญการ"` ซึ่งขัดกับหลักการแสดงชื่อตำแหน่งตามมาตรฐาน กทม.

## 2. กฎเกณฑ์และมาตรฐานทางเทคนิค (Specification & Domain Rules)

### 2.1 มาตรฐานหัวตารางแบบกระชับ (Compact Header Labels & 8-Column Layout)
ให้ใช้คำกระชับที่เข้าใจได้ทันทีตามหลักสากล พร้อมรองรับคอลัมน์พิกัดสถานที่ รวม 8 คอลัมน์ที่สมมาตร:
- [1] Checkbox: `w-12 text-center`
- [2] ลำดับ: `w-12 text-center`
- [3] ชื่อ-นามสกุล: `min-w-[170px]`
- [4] ตำแหน่ง: `min-w-[160px]`
- [5] วันที่ขอ / ช่วงเวลา: `min-w-[150px]`
- [6] **พิกัดสถานที่ (เพิ่มใหม่):** `min-w-[180px]` (แสดงชื่อสถานที่, พิกัด `lat, lng` พร้อมลิงก์ Google Maps)
- [7] หมายเหตุ: `min-w-[140px]`
- [8] คำสั่ง: `w-24 text-center`

> [!IMPORTANT]
> **กฎการป้องกันตารางพัง (Colspan Rule):** ทุกแถวจัดกลุ่มหัวข้อ (Group Header Rows) และแถว Empty State ในตารางต้องกำหนด `colspan="8"` ให้ตรงกับจำนวน 8 คอลัมน์จริงเสมอเพื่อป้องกันตารางบิดเบี้ยวหรือรอยแหว่ง

### 2.2 มาตรฐานปุ่มคำสั่งไอคอนเดี่ยว (Single-Action Icon Buttons w-8.5 h-8.5)
ใน `assets/css/bma-theme.css` กำหนด Utility Class:
```css
.w-8\.5 { width: 2.125rem; } /* 34px */
.h-8\.5 { height: 2.125rem; } /* 34px */
```

โครงสร้าง HTML/Tailwind ของปุ่มคำสั่งทั้งสอง:
```html
<div class="flex items-center justify-center gap-1.5">
    <!-- ปุ่มอนุมัติ (Emerald Green) -->
    <button type="button" 
            data-action="approve-single" 
            data-id="${req.id}" 
            class="w-8.5 h-8.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-xs flex items-center justify-center transition cursor-pointer" 
            title="อนุมัติ">
        <i class="fa-solid fa-check text-sm"></i>
    </button>
    
    <!-- ปุ่มไม่อนุมัติ (Rose Red) -->
    <button type="button" 
            data-action="reject-single" 
            data-id="${req.id}" 
            class="w-8.5 h-8.5 rounded-lg text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-xs flex items-center justify-center transition cursor-pointer" 
            title="ไม่อนุมัติ">
        <i class="fa-solid fa-xmark text-sm"></i>
    </button>
</div>
```

**คุณสมบัติบังคับของ Single-Action Icon Button:**
1. ขนาดคงที่ `34x34px` (`w-8.5 h-8.5`) พอดีกับการสัมผัสหรือคลิก
2. มี Micro-interaction ด้วย `active:scale-95 transition`
3. มี Accessibility Tooltip ผ่าน `title="..."` เสมอ เพื่อให้ผู้ใช้งานทราบหน้าที่ของปุ่มเมื่อนำเมาส์ไปชี้
4. โทนสีชัดเจน: เขียวมรกต (`emerald-600`) สำหรับยืนยัน/อนุมัติ และ แดงกุหลาบ (`rose-600`) สำหรับปฏิเสธ/ไม่อนุมัติ

### 2.3 กฎการเชื่อมต่อชื่อตำแหน่งและระดับ (Position & Level Concatenation Rule)
ชื่อตำแหน่งทางการของ กทม. ต้องเขียนตำแหน่งและระดับ **"ชิดติดกันโดยไม่มีคำว่าระดับและไม่มีช่องว่าง"** เช่น:
- ถูกต้อง: `เจ้าพนักงานเทศกิจชำนาญงาน`, `นิติกรปฏิบัติการ`, `พนักงานสถานที่ บ2`
- ไม่ถูกต้อง: `เจ้าพนักงานเทศกิจ ระดับ ชำนาญงาน`, `นิติกร ระดับปฏิบัติการ`

**สูตรการทำความสะอาดและต่อสตริง (Sanitization Formula):**
```javascript
const cleanTitle = (person.position_title || '').trim();
const cleanLevel = (person.position_level || '').replace(/^ระดับ\s*/, '').trim();

const posFull = (cleanTitle && cleanLevel) 
    ? `${cleanTitle}${cleanLevel}` 
    : (cleanTitle || cleanLevel || (person.position_full || '').replace(/\s*ระดับ\s*/g, '').trim() || '-');
```

## 3. ข้อควรระวังและกรณีศึกษา (Pitfalls & Edge Cases)
1. **การคลิกโดนแท็ก `<i>` ภายในปุ่ม:**
   - ใน Event Delegation บนตาราง ต้องใช้ `e.target.closest('button[data-action]')` เสมอ ห้ามใช้ `e.target.dataset.action` ตรงๆ เพราะเมื่อผู้ใช้คลิกโดนไอคอน `<i>` ค่า `dataset` จะกลายเป็น `undefined`
2. **ตำแหน่งที่เป็นลูกจ้างชั่วคราว/ลูกจ้างประจำ:**
   - ลูกจ้างบางประเภทอาจไม่มี `position_level` แต่ระบุระดับไว้ใน `position_title` อยู่แล้ว (เช่น "พนักงานขับรถยนต์ บ2") การใช้สูตรข้างต้นจะไม่ทำให้เกิดคำว่า "undefined" ปรากฏบนหน้าจอ
3. **การใช้งานร่วมกับ Mobile Screen:**
   - คอลัมน์ `w-24` เป็นความกว้างที่ปลอดภัยบนอุปกรณ์แท็บเล็ตและแล็ปท็อปขนาดเล็ก โดยไม่เบียดคอลัมน์วันที่ขอ/ช่วงเวลา

## 4. ความเชื่อมโยงในระบบความรู้ (Knowledge Graph Links)
- เชื่อมโยงกับสถาปัตยกรรมสิทธิ์: [[adr_003_double_layer_rbac_hierarchy]]
- เชื่อมโยงกับบั๊กที่เกี่ยวข้อง: [[fix_attendance_model_missing_position_level]]
- เชื่อมโยงกับสารบัญกระบวนการ: Flow ID `FLOW_SPECIAL_REQ_01` (การยื่นและอนุมัติคำขอพิเศษ)
