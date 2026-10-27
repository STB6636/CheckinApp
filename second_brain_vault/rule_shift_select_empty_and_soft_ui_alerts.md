---
id: "rule_shift_select_empty_and_soft_ui_alerts"
title: "Domain Rule: Dropdown กะว่างเริ่มต้น, กล้อง Mirror Mode และ SweetAlerts Soft UI แยก 2 รูปแบบ"
type: "rule"
last_updated_phase: "PIPE-20261027-camera-mirror-and-detailed-confirm-modal"
flows:
  - "FLOW_PHOTO_01"
  - "FLOW_CHECKIN_01"
  - "FLOW_GPS_01"
  - "FLOW_LAYOUT_01"
---

# 📋 Domain Rule: Dropdown กะว่างเริ่มต้น, กล้อง Mirror Mode และ SweetAlerts Soft UI แยก 2 รูปแบบ

## 1. บริบทและวัตถุประสงค์ (Context & Objective)
เพื่อป้องกันไม่ให้ผู้ใช้ลงเวลาผิดกะโดยไม่ได้ตั้งใจ ระบบจึงกำหนดให้ Dropdown เลือกช่วงเวลาทำงาน (`#checkinShiftSelect`) ต้องมีสถานะเริ่มต้นเป็น **"ค่าว่างเปล่า"** เสมอ และบังคับให้ผู้ใช้คลิกเลือกด้วยตนเอง พร้อมทั้งใช้การแจ้งเตือนสไตล์ **Tailwind CSS SweetAlerts - Soft UI Dashboard (Creative Tim)** ทั้งการแจ้งเตือนลืมเลือกกะ (Warning Alert) และการยืนยันข้อมูลก่อนบันทึก (Confirmation Modal) รวมถึงการแสดงผลกล้องหน้าแบบกระจกเงา (Mirror View) เพื่อให้เป็นธรรมชาติแก่ผู้ใช้งาน

## 2. กฎเกณฑ์เชิงเทคนิค (Technical Specifications)

### 2.1 กล้อง Mirror Mode (Observer View ➔ Mirror View)
1. ใน `checkin.html`:
   - แท็ก `<video id="cameraVideoStream">` ต้องมีคลาส `-scale-x-100` (`transform: scaleX(-1);`) เพื่อสะท้อนภาพพรีวิวกล้องหน้าเสมือนกระจกเงา
2. ใน `UIHelpers.capturePortrait3x4FromVideo(videoEl, canvasEl)`:
   - ต้องใช้ Canvas transform flip: `ctx.save(); ctx.translate(targetWidth, 0); ctx.scale(-1, 1); ctx.drawImage(...); ctx.restore();` เพื่อให้ภาพถ่ายจริงไม่กลับด้านและตรงกับภาพพรีวิว 100%

### 2.2 Default Empty Option ใน HTML และ Controller
1. ใน `checkin.html`:
   ```html
   <select id="checkinShiftSelect" class="bma-select text-sm font-semibold rounded-xl w-full">
       <option value="">-- กรุณาเลือกช่วงเวลาปฏิบัติงาน --</option>
   </select>
   ```
2. ใน `CheckinController.#evaluateTimeWindowAndPopulateShifts()`:
   - ต้อง prepend `<option value="">-- กรุณาเลือกช่วงเวลาปฏิบัติงาน --</option>` เสมอ
   - หากผู้ใช้ยังไม่ได้เลือกกะ ให้เซ็ต `selectEl.value = ""` ไม่เลือกกะแรกให้อัตโนมัติ

### 2.3 Validation & Mobile Smooth Scroll
- ใน `CheckinController.#handleMainCheckin()`:
  - ตรวจสอบ `isShiftSelectorActive && (!shiftSelectEl || shiftSelectEl.value === '')`
  - หากยังไม่ได้เลือก:
    1. คืนสถานะปุ่มบันทึก (`btnSubmitMain.disabled = false`, คืนข้อความเดิม)
    2. แสดง SweetAlert2 Warning สไตล์ Soft UI (Gradient Amber)
    3. เมื่อปิดกล่อง สั่ง Smooth Scroll ไปที่ `#checkinShiftSelect`, โฟกัส และใส่กรอบ Highlight สีแดง (`ring-2 ring-rose-500 border-rose-500`) 3 วินาที

### 2.4 Soft UI Dashboard Confirmation Modal (แยก 2 รูปแบบ)
- **การตรวจสอบ GPS (`isGpsActive = Boolean(this.settings?.require_gps)`):**
  - หาก `isGpsActive === false`: **ไม่แสดงข้อ "สถานที่ ตาม GPS" ในกล่องยืนยันโดยเด็ดขาด**
  - หาก `isGpsActive === true`: แสดงชื่อสถานที่ใกล้เคียง และแสดงพิกัดละติจูด/ลองจิจูดในบรรทัดถัดมา
- **ก. การบันทึกรูปแบบปกติ (`!isSpecialShiftMode`):**
  1. `ช่วงเวลาบันทึก:` แสดง `"เวลาเข้างาน"` (ขาเข้า) หรือ `"เวลาออกงาน"` (ขาออก) โดยไม่แสดงเวลา
  2. `เวลาขณะบันทึก:` แสดงเวลาเรียลไทม์ ณ ขณะกด (`HH:mm:ss น.`)
  3. `สถานที่ ตาม GPS:` (เฉพาะเมื่อเปิด GPS)
- **ข. การบันทึกรูปแบบพิเศษ (`isSpecialShiftMode` เช่น กะพิเศษ/OT/กำหนดเอง/Single-Click):**
  1. `ชื่อช่วงเวลา:` แสดงชื่อกะหรือช่วงเวลาที่เลือก
  2. `เวลาเข้างาน:` แสดงเวลาเข้างานของกะนั้น (`HH:mm น.`)
  3. `เวลาออกงาน:` แสดงเวลาออกงานของกะนั้น (`HH:mm น.`)
  4. `สถานที่ ตาม GPS:` (เฉพาะเมื่อเปิด GPS)
- **การคืนสถานะปุ่มกด:** หากกดยกเลิกใน Modal ให้คืนสถานะปุ่มบันทึก (`btnSubmitMain.disabled = false; btnSubmitMain.innerHTML = originalBtnHtml;`)

### 2.5 การแจ้งเตือนออกจากระบบ (Soft UI Dashboard Logout Alert)
- เมธอด `UIHelpers.confirm(title, text, confirmText, icon, options = {})` ได้รับการยกระดับเป็นมาตรฐาน Tailwind CSS SweetAlerts - Soft UI Dashboard:
  - `customClass.popup`: `rounded-2xl p-5 shadow-2xl border border-rose-500/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md max-w-sm sm:max-w-md`
  - `buttonsStyling: false`, `reverseButtons: true`
  - ปุ่มยืนยันออกจากระบบ: Soft UI Gradient สี Rose-Red (`bg-gradient-to-tl from-rose-600 to-red-500 text-white shadow-soft-md hover:scale-102`) พร้อมไอคอน `<i class="fa-solid fa-arrow-right-from-bracket mr-1.5"></i>`
  - ปุ่มยกเลิก: Soft UI Slate (`bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 hover:scale-102`)
  - รองรับการ์ด `options.infoNote` แนะนำผู้ใช้งานอย่างนุ่มนวล
- ครอบคลุมทั้ง 3 จุด: Topbar หน้าลงเวลา (`#btnCheckinLogout`), Mobile Drawer หน้าลงเวลา (`#btnDrawerLogout`), และ Sidebar เมนูผู้ดูแลระบบ (`#btnSidebarLogout`)

### 2.6 การรักษาความสมบูรณ์ของระบบเดิม (Compatibility Guarantee)
- **โหมดปกติ (เวลาราชการปกติ 06:00-08:30 และการลงเวลาออกงาน):** `#shiftSelectorContainer` ถูกซ่อน ทำให้ `isShiftSelectorActive` เป็น `false` ระบบจึงทำงานได้รวดเร็วและไม่ถูกบล็อก
- **ระบบคำขอพิเศษ (`#spShiftSelect`):** ทำงานเป็นอิสระต่อกัน 100%
- **ความสูงหน้าจอเดสก์ท็อป PC:** SweetAlert ทำงานเป็น Modal Overlay ไม่กระทบ Layout ความสูงรวม (~840px ไร้ Scroll Bar 100%)
