---
skill_id: "client_side_hierarchical_rbac"
name: "Client-Side 3-Tier Granular Permission Gate Pattern"
version: "1.0.0"
target_subagents: ["agent_00_orchestrator", "agent_01_ba_sa", "agent_02_architect", "agent_03_backend", "agent_04_frontend", "agent_05_qa_security"]
trigger: "ใช้เมื่อต้องออกแบบหรือพัฒนาการควบคุมสิทธิ์การเข้าถึงข้อมูล (RBAC) ทั้งในระดับ UI และ Logic ภายในแอปพลิเคชันที่มีลำดับชั้น เช่น SuperAdmin, Admin ระดับสำนัก/กอง (bureau), และ Admin ระดับกลุ่ม/ส่วน/ฝ่าย (division)"
dependencies: ["ES6+ Javascript (AuthService, localStorage, session verification)"]
---

# SKILL INSTRUCTION: Client-Side 3-Tier Granular Permission Gate Pattern

## 1. วัตถุประสงค์และขอบเขตของสกิล (Purpose & Scope)
สกิลนี้กำหนดแบบแผนสถาปัตยกรรมการควบคุมสิทธิ์ (Role-Based Access Control - RBAC) ฝั่ง Client-Side แบบ 3 ระดับชั้น (3-Tier Granular Gate) สำหรับเว็บแอปพลิเคชันองค์กร โดยเฉพาะระบบงานภาครัฐหรือหน่วยงานที่มีโครงสร้างการบังคับบัญชาแบบลำดับชั้น:
1. **SuperAdmin (ผู้ดูแลระบบสูงสุด):** สิทธิ์สมบูรณ์ (Full Control) เข้าถึง ดู แก้ไข และลบข้อมูลได้ทุกสำนัก ทุกกอง ทุกฝ่าย
2. **Admin ระดับสำนัก/กอง (`visibility_level: bureau` หรือ `all`):** สิทธิ์เฉพาะสังกัดสำนักตนเอง สามารถดูและแก้ไขข้อมูลการลงเวลาของบุคลากรในสำนักได้ แต่ **"ไม่มีสิทธิ์ลบข้อมูล"**
3. **Admin ระดับกลุ่ม/ส่วน/ฝ่าย (`visibility_level: division`):** สิทธิ์เฉพาะฝ่าย/ส่วนตนเอง สามารถดูและตรวจสอบข้อมูลได้ แต่ **"ไม่มีสิทธิ์แก้ไขและไม่มีสิทธิ์ลบข้อมูล"**
4. **User (ผู้ใช้งานทั่วไป):** สิทธิ์เข้าถึงเฉพาะหน้าลงเวลาและประวัติตนเอง

แบบแผนนี้เน้นการบังคับใช้แบบ **Dual-Gating (UI Gating + Programmatic Handler Gating)** เพื่อป้องกันการทะลุผ่าน (Bypass) จาก Developer Tools หรือ DOM Manipulation

---

## 2. ขั้นตอนการปฏิบัติตามสกิล (Mandatory Execution Steps)

### Step 1: ออกแบบ Schema ของ User Session ใน AuthService
ข้อมูลผู้ใช้งานใน Session ต้องเก็บ Attributes ขั้นต่ำสำหรับการตรวจสอบสิทธิ์ดังนี้:
```javascript
{
    id: "uuid",
    role: "SuperAdmin" | "Admin" | "User",
    visibility_level: "all" | "bureau" | "division",
    scope_bureau: "สำนักการโยธา",
    scope_division: "กองควบคุมการก่อสร้าง"
}
```

### Step 2: สร้าง Centralized Scope & Action Evaluators ใน AuthService
รวมตรรกะการตรวจสอบสิทธิ์ไว้ที่ศูนย์กลางใน `AuthService` ห้ามเขียน if-else กระจายตาม Controller:
- `canViewRecordByScope(currentUser, targetRecord)`: ตรวจสอบสิทธิ์การมองเห็นข้อมูล
- `canEditAttendanceRecord(currentUser, record)`: ตรวจสอบสิทธิ์การแก้ไขข้อมูล
- `canDeleteAttendanceRecord(currentUser, record)`: ตรวจสอบสิทธิ์การลบข้อมูล (เฉพาะ SuperAdmin)

### Step 3: บังคับใช้ UI Gating (Conditional Rendering)
ในการสร้าง HTML Table / Action Buttons ให้เรียกใช้ `AuthService.canEdit...` และ `AuthService.canDelete...` เพื่อแสดงหรือซ่อนปุ่มตามสิทธิ์จริง

### Step 4: บังคับใช้ Programmatic Action Gating (Event Handler Interceptor)
ใน Event Listener (เช่น การกดปุ่มแก้ไข หรือกดปุ่มลบ) ต้องทำการ Re-check สิทธิ์เสมอ แม้จะมีปุ่มแสดงอยู่ก็ตาม:
- หากตรวจสอบไม่ผ่าน ให้แสดงแจ้งเตือนผ่าน `UIHelpers.alert('ไม่มีสิทธิ์เข้าถึง', ...)` และ `return` ยุติการทำงานทันที

---

## 3. กฎเหล็กและข้อห้ามของสกิล (Strict Rules & Anti-Patterns)

- **MUST DO (Dual Gating):** ต้องตรวจสิทธิ์ทั้ง 2 ด่านเสมอ คือ ด่านแรกที่ UI Rendering Template และ ด่านสองที่ Action Handler / Modal Opener
- **MUST DO (SuperAdmin Delete Only):** สิทธิ์ในการลบข้อมูลบันทึกเวลา (`canDeleteAttendanceRecord`) ต้องสงวนไว้เฉพาะ `SuperAdmin` เท่านั้น Admin ทุกขอบเขต (ทั้ง bureau และ division) ห้ามลบเด็ดขาด
- **MUST DO (Scope Matching):** Admin ระดับ bureau ต้องตรวจตรงทั้งสำนัก ส่วน Admin ระดับ division ต้องตรวจตรงทั้งสำนัก **และ** ฝ่าย
- **NEVER DO (Hardcoded Role Checks):** ห้ามตรวจเช็ค `if (user.role === 'Admin')` โดดๆ โดยไม่ตรวจสอบ `visibility_level` และ `scope`
- **NEVER DO (UI-Only Security):** ห้ามพึ่งพาเฉพาะการซ่อนปุ่มด้วย CSS (`display: none` หรือ `.hidden`) โดยไม่มีการตรวจสอบใน JavaScript Handler

---

## 4. โค้ดต้นแบบมาตรฐานฉบับเต็ม (Full Reference Implementation)

### 4.1 AuthService Core Permission Evaluator (`assets/js/core/AuthService.js`)
```javascript
export class AuthService {
    /**
     * ตรวจสอบสิทธิ์การดูข้อมูลตามขอบเขตความรับผิดชอบ
     * @param {Object} currentUser ผู้ใช้งานปัจจุบันใน Session
     * @param {Object} targetRecord ระเบียนข้อมูลเป้าหมาย (มี bureau และ division)
     * @returns {boolean}
     */
    static canViewRecordByScope(currentUser, targetRecord) {
        if (!currentUser) return false;
        if (currentUser.role === 'SuperAdmin') return true;
        if (currentUser.role === 'Admin') {
            if (currentUser.visibility_level === 'all') return true;
            if (currentUser.visibility_level === 'bureau') {
                return targetRecord.bureau === currentUser.scope_bureau;
            }
            if (currentUser.visibility_level === 'division') {
                return (
                    targetRecord.bureau === currentUser.scope_bureau &&
                    targetRecord.division === currentUser.scope_division
                );
            }
        }
        return false;
    }

    /**
     * ตรวจสอบสิทธิ์การแก้ไขข้อมูลการลงเวลา
     * - SuperAdmin: แก้ไขได้ทุกรายการ
     * - Admin (bureau / all): แก้ไขได้เฉพาะรายการในสังกัดสำนักตนเอง
     * - Admin (division): ไม่มีสิทธิ์แก้ไขข้อมูล
     * @param {Object} currentUser 
     * @param {Object|null} record 
     * @returns {boolean}
     */
    static canEditAttendanceRecord(currentUser, record = null) {
        if (!currentUser) return false;
        if (currentUser.role === 'SuperAdmin') return true;
        if (currentUser.role === 'Admin') {
            if (currentUser.visibility_level === 'bureau' || currentUser.visibility_level === 'all') {
                return record ? AuthService.canViewRecordByScope(currentUser, record) : true;
            }
            // Admin ระดับ ส่วน/ฝ่าย ดูได้อย่างเดียว แก้ไขไม่ได้
            return false;
        }
        return false;
    }

    /**
     * ตรวจสอบสิทธิ์การลบข้อมูลการลงเวลา
     * - SuperAdmin เท่านั้นที่สามารถลบได้
     * - Admin ทุกขอบเขต (bureau / division) ไม่มีสิทธิ์ลบ
     * @param {Object} currentUser 
     * @param {Object|null} record 
     * @returns {boolean}
     */
    static canDeleteAttendanceRecord(currentUser, record = null) {
        if (!currentUser) return false;
        return currentUser.role === 'SuperAdmin';
    }
}
```

### 4.2 การนำไปใช้ใน Page Controller (`ReportsController.js` Pattern)
```javascript
// 1. Dual Gate ด่านที่ 1: การ Render ปุ่ม Action ในตาราง
#buildRecordRowHtml(rec) {
    const canEdit = AuthService.canEditAttendanceRecord(this.currentUser, rec);
    const canDelete = AuthService.canDeleteAttendanceRecord(this.currentUser, rec) && rec.log_id;

    return `
        <tr>
            <td>${rec.full_name}</td>
            <td>${rec.bureau} / ${rec.division}</td>
            <td class="text-center space-x-1 whitespace-nowrap">
                ${canEdit ? `
                    <button type="button" data-action="edit-record" data-row-uid="${rec.row_uid}" class="btn-edit text-sky-500" title="แก้ไขเวลา">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                ` : ''}
                ${canDelete ? `
                    <button type="button" data-action="delete-record" data-logid="${rec.log_id}" data-name="${rec.full_name}" class="btn-delete text-rose-500" title="ลบเวลา">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `;
}

// 2. Dual Gate ด่านที่ 2: การดักจับเหตุการณ์ใน Event Handler
#handleTableActions(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === 'edit-record') {
        const rowUid = btn.dataset.rowUid;
        const rec = this.records.find(r => r.row_uid === rowUid);
        if (!rec) return;

        // Programmatic Gate Check
        if (!AuthService.canEditAttendanceRecord(this.currentUser, rec)) {
            UIHelpers.alert('ไม่มีสิทธิ์เข้าถึง', 'คุณไม่มีสิทธิ์แก้ไขข้อมูลการลงเวลาของรายการนี้', 'warning');
            return;
        }

        this.#openEditModal(rec);
    } else if (action === 'delete-record') {
        // Programmatic Gate Check
        if (!AuthService.canDeleteAttendanceRecord(this.currentUser)) {
            UIHelpers.alert('ไม่มีสิทธิ์เข้าถึง', 'เฉพาะผู้ดูแลระบบระดับสูงสุด (SuperAdmin) เท่านั้นที่สามารถลบข้อมูลการลงเวลาได้', 'warning');
            return;
        }

        this.#confirmAndDelete(btn.dataset.logid, btn.dataset.name);
    }
}
```

---

## 5. รายการตรวจสอบความสมบูรณ์ (Self-Verification Checklist)
- [ ] มีการจัดเก็บ `visibility_level`, `scope_bureau`, และ `scope_division` ใน Session ของผู้ใช้
- [ ] มีเมธอดตรวจสอบสิทธิ์ส่วนกลางใน `AuthService` ครบทั้ง `canViewRecordByScope`, `canEditAttendanceRecord`, และ `canDeleteAttendanceRecord`
- [ ] มีการทำ Dual Gating: ตรวจสอบทั้งตอนเรนเดอร์ UI Template และตอนประมวลผล Event Listener
- [ ] สิทธิ์การลบข้อมูลถูกจำกัดไว้เฉพาะ `SuperAdmin` เท่านั้น Admin ระดับสำนักและฝ่ายไม่สามารถลบได้
- [ ] Admin ระดับฝ่าย (`division`) ถูกจำกัดสิทธิ์ให้ดูได้อย่างเดียว ไม่ปรากฏปุ่มแก้ไขและไม่สามารถเปิดฟอร์มแก้ไขได้
