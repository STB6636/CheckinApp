---
skill_id: "offcanvas_drawer_race_free_tab_mounting"
name: "Zero-Scroll Viewport-Locked & Race-Free Mobile Slide Drawer Pattern"
version: "1.0.0"
target_subagents: ["agent_00_orchestrator", "agent_02_architect", "agent_04_frontend", "agent_05_qa_security"]
trigger: "ใช้เมื่อต้องการทำ Mobile Drawer หรือ Responsive Navigation ที่ต้องย้าย Component หรือ DOM Node ที่มีความซับซ้อน (เช่น ตารางข้อมูล, ฟอร์ม, แท็บประวัติ) สลับระหว่างมุมมอง Desktop และ Mobile Drawer โดยไม่ให้เกิด Race Condition, DOM ID ซ้ำซ้อน, หรือสูญเสีย Event Listeners"
dependencies: ["HTML5", "CSS3 (Tailwind CSS / 100dvh)", "ES6+ DOM manipulation"]
---

# SKILL INSTRUCTION: Zero-Scroll Viewport-Locked & Race-Free Mobile Slide Drawer Pattern

## 1. วัตถุประสงค์และขอบเขตของสกิล (Purpose & Scope)
สกิลนี้กำหนดแบบแผนมาตรฐานในการพัฒนา Mobile Slide Drawer สำหรับ Web App/SPA ที่มีองค์ประกอบข้อมูลขนาดใหญ่ (เช่น ตารางประวัติการลงเวลา, รายการคำขอพิเศษ, ฟอร์มซับซ้อน):
1. **Single DOM Ownership (การถือครองโหนดเดียว):** หลีกเลี่ยงการสร้าง DOM ซ้ำซ้อน (Duplicate DOM IDs) ซึ่งทำให้เกิดบั๊กในการ Bind Event Listener หรือการอัปเดตข้อมูล Supabase โดยใช้วิธี **Dynamic Node Reparenting** (`appendChild`) สลับโหนดระหว่าง Container บน Desktop และ Mount Container ภายใน Mobile Drawer
2. **Race-Free Animation Lifecycle:** ป้องกัน Race Condition ระหว่างการกดเปิด/ปิดซ้ำๆ ของผู้ใช้ โดยใช้ State Flag (`isDrawerClosing`), `requestAnimationFrame` สำหรับ Entrance, และ Transition Timeout สำหรับ Exit
3. **Zero-Scroll Viewport Lock:** ล็อกการเลื่อนของ Viewport ด้านหลัง (Background Scrolling / iOS Rubberbanding) เมื่อเปิด Drawer และคืนสภาพการเลื่อนอย่างปลอดภัยเมื่อปิด Drawer
4. **Responsive Auto-Recovery:** มีกลไกตรวจจับการปรับขนาดหน้าจอ (Resize Listener) เพื่อย้าย DOM Nodes กลับคืนหน้าจอหลักอัตโนมัติหากผู้ใช้ขยายหน้าจอเกิน Breakpoint

---

## 2. ขั้นตอนการปฏิบัติตามสกิล (Mandatory Execution Steps)

### Step 1: ออกแบบโครงสร้าง HTML แบ่งระหว่าง Desktop Container และ Mobile Drawer
สร้าง Container แยก 2 จุดใน HTML:
- `#desktopPanesContainer`: จุดวางแท็บและเนื้อหาบนหน้าจอ Desktop
- `#mobileHistoryDrawer`: Off-canvas Drawer บนหน้าจอมือถือ ซึ่งมี `#mobileDrawerHistoryMount` เป็นจุด Mount โหนด

```html
<!-- Desktop Panes Container -->
<div id="desktopPanesContainer" class="hidden md:block">
    <div id="desktopHistoryWrapper">...</div>
    <div id="desktopSpecialWrapper">...</div>
</div>

<!-- Mobile Drawer -->
<div id="mobileHistoryDrawer" class="fixed inset-0 z-50 hidden">
    <!-- Backdrop Overlay -->
    <div id="btnMobileHistoryDrawerBackdrop" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs opacity-0 transition-opacity duration-300"></div>
    
    <!-- Drawer Slide Panel -->
    <div id="mobileDrawerPanel" class="fixed inset-y-0 right-0 w-[90vw] max-w-md bg-white dark:bg-slate-900 shadow-2xl translate-x-full transition-transform duration-300 flex flex-col">
        <!-- Drawer Header with Fast Nav -->
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 class="font-bold text-sm">เมนูและประวัติการลงเวลา</h3>
            <button id="btnCloseMobileDrawer" type="button" class="p-2"><i class="fa-solid fa-xmark"></i></button>
        </div>
        
        <!-- Dynamic Mount Target -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div id="mobileDrawerHistoryMount"></div>
        </div>
    </div>
</div>
```

### Step 2: จัดการ Single DOM Ownership ด้วย Dynamic Node Reparenting
ในการเปิด Drawer ให้ย้าย Node ของแท็บประวัติเข้าสู่ Drawer Mount โดยไม่ทำลายข้อมูลเดิม:
```javascript
drawerMount.appendChild(paneHistory);
drawerMount.appendChild(paneSpecial);
```
และเมื่อปิด Drawer หรือเมื่อสลับกลับ Desktop Tab ให้นำ Node กลับมาที่ Container เดิม:
```javascript
desktopPanes.appendChild(paneHistory);
desktopPanes.appendChild(paneSpecial);
```

### Step 3: บังคับใช้ Race-Free Animation Lifecycle
- ใช้ตัวแปรควบคุม `isDrawerClosing`
- ใช้ `requestAnimationFrame` เพื่อรอให้เบราว์เซอร์ปลดคลาส `hidden` ก่อนเริ่ม CSS Transition (`opacity-100`, `translate-x-0`)
- เมื่อปิด Drawer ให้เริ่ม CSS Transition ก่อน (`opacity-0`, `translate-x-full`) แล้วรอให้ Transition เสร็จสิ้น (300ms) จึงใส่คลาส `hidden` และย้าย Node คืน

---

## 3. กฎเหล็กและข้อห้ามของสกิล (Strict Rules & Anti-Patterns)

- **MUST DO (Single DOM Identity):** ห้ามก็อปปี้หรือสร้าง DOM Node ตารางซ้ำ 2 ชุดบนหน้าเดียวกัน เพราะจะทำให้ `document.getElementById` หา Element ผิดตัว และทำให้ตัวนับหรือตัวเลือกแบบ Checkbox สับสน
- **MUST DO (State Flag Protection):** ต้องป้องกันการกดเปิดหรือปิดซ้ำขณะอนิเมชันกำลังทำงานด้วย `if (isDrawerClosing) return;`
- **MUST DO (Safe Viewport-Lock):** ล็อกการเลื่อนของพื้นหลังด้วยคลาส เช่น `overflow-hidden` หรือ `checkin-viewport-lock` เพื่อไม่ให้เกิดการเลื่อนซ้อน (Double Scroll) บนอุปกรณ์สัมผัส
- **NEVER DO (Hardcoded Style Mutations):** ห้ามใช้ inline style `style.display = 'block'` สลับกับ Tailwind class `hidden` ให้ใช้ class manipulation สม่ำเสมอ
- **NEVER DO (Instant Node Removal):** ห้ามสั่ง `drawer.classList.add('hidden')` ทันทีที่กดปิดโดยไม่รอให้อนิเมชันปิดเสร็จสิ้น เพราะจะทำให้ภาพกระตุกอย่างรุนแรง

---

## 4. โค้ดต้นแบบมาตรฐานฉบับเต็ม (Full Reference Implementation)

### 4.1 Controller Drawer Lifecycle (`CheckinController.js` Pattern)
```javascript
export class ResponsiveDrawerManager {
    constructor() {
        this.paneCheckin = document.getElementById('checkinWorkspaceWrapper');
        this.paneHistory = document.getElementById('desktopHistoryWrapper');
        this.paneSpecial = document.getElementById('desktopSpecialWrapper');
        this.drawer = document.getElementById('mobileHistoryDrawer');
        this.drawerPanel = document.getElementById('mobileDrawerPanel');
        this.drawerBackdrop = document.getElementById('btnMobileHistoryDrawerBackdrop');
        this.drawerMount = document.getElementById('mobileDrawerHistoryMount');
        this.desktopPanes = document.getElementById('desktopPanesContainer');

        this.isDrawerClosing = false;
        this.#initDrawer();
    }

    #initDrawer() {
        // Desktop Tab Switcher
        const setDesktopActiveTab = (activeName) => {
            // คืน Node กลับหน้า Desktop หากเคยถูก Mount ใน Drawer
            if (this.desktopPanes && this.paneHistory && this.paneSpecial && 
                this.drawerMount && this.drawerMount.contains(this.paneHistory)) {
                this.desktopPanes.appendChild(this.paneHistory);
                this.desktopPanes.appendChild(this.paneSpecial);
            }

            this.paneCheckin?.classList.toggle('hidden', activeName !== 'checkin');
            this.paneHistory?.classList.toggle('hidden', activeName !== 'history');
            this.paneSpecial?.classList.toggle('hidden', activeName !== 'special');

            if (activeName === 'history') this.renderPersonalAttendanceTabs();
            if (activeName === 'special') this.renderSpecialRequestsHistoryTable();
        };

        // 1. ฟังก์ชันเปิด Mobile Drawer อย่างปลอดภัย
        const openMobileDrawer = () => {
            if (this.isDrawerClosing) return;

            // ย้าย DOM Nodes เข้ามาใน Drawer
            if (this.drawerMount && this.paneHistory && this.paneSpecial) {
                this.drawerMount.appendChild(this.paneHistory);
                this.drawerMount.appendChild(this.paneSpecial);
                this.paneHistory.classList.remove('hidden');
                this.paneSpecial.classList.remove('hidden');
            }

            // แสดง Drawer และรัน Animation Entrance
            this.drawer?.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');

            requestAnimationFrame(() => {
                this.drawerBackdrop?.classList.remove('opacity-0');
                this.drawerBackdrop?.classList.add('opacity-100');
                this.drawerPanel?.classList.remove('translate-x-full');
                this.drawerPanel?.classList.add('translate-x-0');
            });

            this.renderPersonalAttendanceTabs();
            this.renderSpecialRequestsHistoryTable();
        };

        // 2. ฟังก์ชันปิด Mobile Drawer พร้อมป้องกัน Race Condition
        const closeMobileDrawer = (targetTab = null) => {
            if (this.isDrawerClosing) return;
            this.isDrawerClosing = true;

            // รัน Animation Exit
            this.drawerBackdrop?.classList.remove('opacity-100');
            this.drawerBackdrop?.classList.add('opacity-0');
            this.drawerPanel?.classList.remove('translate-x-0');
            this.drawerPanel?.classList.add('translate-x-full');

            setTimeout(() => {
                this.drawer?.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');

                // คืน Node กลับ Container หลัก
                if (this.desktopPanes && this.paneHistory && this.paneSpecial && 
                    this.drawerMount && this.drawerMount.contains(this.paneHistory)) {
                    this.desktopPanes.appendChild(this.paneHistory);
                    this.desktopPanes.appendChild(this.paneSpecial);
                }

                if (targetTab) {
                    setDesktopActiveTab(targetTab);
                }

                this.isDrawerClosing = false;
            }, 300); // 300ms ตรงกับ CSS duration-300
        };

        // Binding Triggers
        document.getElementById('btnMobileHistoryMenu')?.addEventListener('click', openMobileDrawer);
        document.getElementById('btnCloseMobileDrawer')?.addEventListener('click', () => closeMobileDrawer());
        document.getElementById('btnMobileHistoryDrawerBackdrop')?.addEventListener('click', () => closeMobileDrawer());

        // Fast Anchor Navigation ภายใน Drawer
        document.getElementById('btnDrawerNavHistory')?.addEventListener('click', () => {
            this.paneHistory?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        document.getElementById('btnDrawerNavSpecial')?.addEventListener('click', () => {
            this.paneSpecial?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // 3. Responsive Resize Recovery
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                if (this.drawerMount && this.paneHistory && this.drawerMount.contains(this.paneHistory)) {
                    this.desktopPanes.appendChild(this.paneHistory);
                    this.desktopPanes.appendChild(this.paneSpecial);
                }
                this.drawer?.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        });
    }
}
```

---

## 5. รายการตรวจสอบความสมบูรณ์ (Self-Verification Checklist)
- [ ] DOM Node ของ Component ซับซ้อนมีชุดเดียวในเอกสาร ไม่มีการ Duplicate DOM IDs
- [ ] มีตัวแปรป้องกันสถานะ `isDrawerClosing` ป้องกันการคลิกถี่ยิบจน Transition พัง
- [ ] การเปิด Drawer มีการรอ `requestAnimationFrame` ก่อนเติมคลาสแอนิเมชัน
- [ ] การปิด Drawer มีการตั้ง `setTimeout` เท่ากับระยะเวลาของ CSS Transition ก่อนซ่อนด้วย `.hidden`
- [ ] มีการย้าย Node กลับ Container บน Desktop เมื่อผู้ใช้ขยายขนาดหน้าจอ
- [ ] มีการล็อกการเลื่อนของพื้นหลังด้วย `overflow-hidden` ระหว่างที่ Drawer เปิดอยู่
