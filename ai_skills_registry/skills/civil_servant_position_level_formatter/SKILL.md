---
skill_id: "civil_servant_position_level_formatter"
name: "Civil Service Position & Level String Normalizer Pattern"
version: "1.0.0"
target_subagents: ["agent_00_orchestrator", "agent_01_ba_sa", "agent_03_backend", "agent_04_frontend", "agent_05_qa_security"]
trigger: "ใช้เมื่อต้องแสดงผล ค้นหา จัดกลุ่ม หรือส่งออกข้อมูลตำแหน่งและระดับของข้าราชการ/บุคลากรภาครัฐ (กทม./ก.พ.) ให้เป็นไปตามมาตรฐานภาษาไทยที่ถูกต้อง โดยตัดคำซ้ำซ้อน จัดการวรรคตอน และมี Fallback ที่ปลอดภัย"
dependencies: ["ES6+ Javascript (RegExp, String methods)"]
---

# SKILL INSTRUCTION: Civil Service Position & Level String Normalizer Pattern

## 1. วัตถุประสงค์และขอบเขตของสกิล (Purpose & Scope)
สกิลนี้กำหนดระเบียบวิธีและฟังก์ชันมาตรฐานในการแปลง ทำความสะอาด (Sanitize) และประกอบสตริงแสดงผลตำแหน่งของข้าราชการและบุคลากรภาครัฐ (กรุงเทพมหานคร และ ก.พ.):
1. **มาตรฐานตำแหน่งข้าราชการพลเรือน/กทม.:** ตำแหน่งสายงาน (`position_title`) และระดับตำแหน่ง (`position_level`) ต้องเขียนติดกันโดย **"ไม่มีการเว้นวรรค"** และ **"ไม่มีคำว่าระดับนำหน้า"** เช่น:
   - ✅ ถูกต้อง: `นิติกรชำนาญการ`, `เจ้าพนักงานธุรการปฏิบัติงาน`, `นักวิเคราะห์นโยบายและแผนชำนาญการพิเศษ`
   - ❌ ผิดมาตรฐาน: `นิติกร ชำนาญการ` (มีเว้นวรรค), `นิติกร ระดับชำนาญการ` (มีคำว่าระดับแทรก), `นิติกรชำนาญการ ชำนาญการ` (ชื่อตำแหน่งมีระดับติดมาแล้วซ้ำซ้อน)
2. **การทำความสะอาดข้อมูลดิบจากฐานข้อมูล (Data Cleansing):** ฐานข้อมูลเก่าหรือการนำเข้าจาก Excel มักมีค่าผิดรูป เช่น มีคำว่า `"ระดับ "` ติดมาในฟิลด์ `position_level` หรือมีช่องว่างหัวท้าย สกิลนี้จัดเตรียม Pattern ให้ทำความสะอาดได้ 100%
3. **Graceful Fallback Handling:** หากข้อมูลบางฟิลด์เป็น `null`, `undefined` หรือค่าว่าง ระบบจะสลับไปใช้ `cleanTitle`, `cleanLevel`, หรือฟอกข้อความใน `position_full` และคืนค่า `'-'` หากไม่มีข้อมูลเลย

---

## 2. ขั้นตอนการปฏิบัติตามสกิล (Mandatory Execution Steps)

### Step 1: ลบคำว่า "ระดับ" ออกจากระดับตำแหน่ง
ลบคำนำหน้าที่เกินมาด้วย Regular Expression `^ระดับ\s*`:
```javascript
const cleanLevel = (rawLevel || '').replace(/^ระดับ\s*/, '').trim();
```

### Step 2: ตัดช่องว่างรอบชื่อตำแหน่ง
```javascript
const cleanTitle = (rawTitle || '').trim();
```

### Step 3: รวมสตริงและตรวจสอบการซ้ำซ้อน (Deduplication)
- หาก `cleanTitle` มีคำลงท้ายตรงกับ `cleanLevel` อยู่แล้ว ไม่ต้องนำมาต่อซ้ำ
- หากมีทั้งคู่ ให้ต่อกันโดยไม่เว้นวรรค `${cleanTitle}${cleanLevel}`
- หากมีเพียงค่าใดค่าหนึ่ง ให้ใช้ค่านั้น
- หากไม่มีทั้งสองค่า ให้สลับไปใช้ `position_full` ที่ถูกทำความสะอาดด้วย `/\s*ระดับ\s*/g` หรือ Fallback เป็น `'-'`

---

## 3. กฎเหล็กและข้อห้ามของสกิล (Strict Rules & Anti-Patterns)

- **MUST DO (No Spacing between Title and Level):** การต่อชื่อตำแหน่งและระดับต้องเขียนติดกันเสมอ เช่น `นายช่างโยธาปฏิบัติงาน` ห้ามเว้นวรรคเป็น `นายช่างโยธา ปฏิบัติงาน`
- **MUST DO (Strip Prefix):** ต้องตัดคำว่า `ระดับ ` ออกจากระดับตำแหน่งเสมอ
- **MUST DO (Safe Fallback):** หากไม่มีข้อมูลตำแหน่งเลย ต้องคืนค่า `'-'` เสมอ ห้ามแสดง `null`, `undefined`, หรือสตริงว่าง `""` บน UI หรือรายงาน
- **NEVER DO (Double Level):** ห้ามนำ `cleanLevel` ไปต่อท้าย หากใน `cleanTitle` มีคำดังกล่าวปรากฏอยู่แล้ว เช่น ถ้า Title คือ `"นิติกรชำนาญการ"` และ Level คือ `"ชำนาญการ"` ผลลัพธ์ต้องเป็น `"นิติกรชำนาญการ"` ไม่ใช่ `"นิติกรชำนาญการชำนาญการ"`
- **NEVER DO (Hardcoded Type Suffix):** ห้ามนำ `position_type` (เช่น ทั่วไป, วิชาการ) มาต่อท้ายชื่อตำแหน่งโดยไม่มีวงเล็บกำกับ เช่น `"นิติกรวิชาการ"` เป็นรูปแบบที่ผิด

---

## 4. โค้ดต้นแบบมาตรฐานฉบับเต็ม (Full Reference Implementation)

### 4.1 Standalone Utility Function / Helper
```javascript
/**
 * ฟังก์ชันปรับแต่งและรวมสตริงตำแหน่งข้าราชการ/บุคลากรภาครัฐตามระเบียบ ก.พ. และ กทม.
 * @param {Object|string} target วัตถุข้อมูลบุคลากร หรือชื่อตำแหน่ง (position_title)
 * @param {string} [rawLevel] ระดับตำแหน่ง (position_level)
 * @param {string} [rawFull] ข้อความตำแหน่งเต็มเดิม (position_full)
 * @returns {string} สตริงตำแหน่งที่ผ่านการปรับแต่งแล้ว เช่น 'นิติกรชำนาญการ'
 */
export function formatCivilServantPosition(target, rawLevel = '', rawFull = '') {
    let title = '';
    let level = '';
    let full = '';

    if (target && typeof target === 'object') {
        title = target.position_title || '';
        level = target.position_level || '';
        full = target.position_full || '';
    } else {
        title = target || '';
        level = rawLevel || '';
        full = rawFull || '';
    }

    const cleanTitle = String(title).trim();
    const cleanLevel = String(level).replace(/^ระดับ\s*/, '').trim();

    if (cleanTitle && cleanLevel) {
        // ป้องกันกรณีชื่อตำแหน่งมีระดับติดมาอยู่แล้ว
        if (cleanTitle.endsWith(cleanLevel)) {
            return cleanTitle;
        }
        return `${cleanTitle}${cleanLevel}`;
    }

    if (cleanTitle) return cleanTitle;
    if (cleanLevel) return cleanLevel;

    if (full) {
        const cleanedFull = String(full).replace(/\s*ระดับ\s*/g, '').trim();
        if (cleanedFull) return cleanedFull;
    }

    return '-';
}
```

### 4.2 ตัวอย่างการประยุกต์ใช้งานจริงในโมเดลและคอนโทรลเลอร์

#### 1) ใน Data Model (`AttendanceModel.js` Pattern)
```javascript
// สร้างฟิลด์ position_full สำหรับ Record ลงเวลา
position_full: (() => {
    const cleanTitle = (person.position_title || '').trim();
    const cleanLevel = (person.position_level || '').replace(/^ระดับ\s*/, '').trim();
    if (cleanTitle && cleanLevel) {
        return cleanTitle.endsWith(cleanLevel) ? cleanTitle : `${cleanTitle}${cleanLevel}`;
    }
    return cleanTitle || cleanLevel || (person.position_full || '').replace(/\s*ระดับ\s*/g, '').trim() || '-';
})()
```

#### 2) ใน UI Controller Table Builder (`ApprovalsController.js` & `DashboardController.js` Pattern)
```javascript
#buildRequestRowHtml(req, indexNo) {
    const p = req.personnel || {};
    const fullName = p.first_name ? `${p.prefix}${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อบุคลากร';
    
    // ใช้งาน Formatter
    const cleanTitle = (p.position_title || '').trim();
    const cleanLevel = (p.position_level || '').replace(/^ระดับ\s*/, '').trim();
    const posFull = (cleanTitle && cleanLevel)
        ? (cleanTitle.endsWith(cleanLevel) ? cleanTitle : `${cleanTitle}${cleanLevel}`)
        : (cleanTitle || cleanLevel || (p.position_full || '').replace(/\s*ระดับ\s*/g, '').trim() || '-');

    return `
        <tr>
            <td>${indexNo}</td>
            <td class="font-bold">${fullName}</td>
            <td>${posFull}</td>
            <td>${req.bureau}</td>
        </tr>
    `;
}
```

---

## 5. รายการตรวจสอบความสมบูรณ์ (Self-Verification Checklist)
- [ ] มีการตัดคำนำหน้า `ระดับ` ออกจาก `position_level` ด้วย Regular Expression
- [ ] สตริงผลลัพธ์ระหว่าง Title และ Level เขียนติดกันโดยไม่มีช่องว่าง (เช่น `นิติกรชำนาญการ`)
- [ ] มีการป้องกันชื่อตำแหน่งซ้ำซ้อนด้วย `cleanTitle.endsWith(cleanLevel)`
- [ ] มี Fallback ลำดับขั้น: Title+Level -> Title -> Level -> Sanitized Full -> `'-'`
- [ ] ผลลัพธ์ไม่คืนค่า `null` หรือ `undefined` ไปแสดงผลบนหน้าจอ
