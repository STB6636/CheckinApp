---
id: "rule_realtime_settings_hotreload_and_geofence_toggle"
title: "Domain Rule: ระบบ Realtime Settings Hot-Reload, สวิตช์ระบบรัศมี และ Realtime Differential Sync (Dashboard & Reports)"
type: "rule"
last_updated_phase: "PIPE-20261110-realtime-sync-expansion-and-settings-geofence"
linked_flows: ["FLOW_SETTINGS_01", "FLOW_CHECKIN_01", "FLOW_ADMIN_DASHBOARD_01", "FLOW_REPORTS_01", "FLOW_LAYOUT_01"]
---

# ⚙️ Domain Rule: Realtime Settings Hot-Reload, สวิตช์ระบบรัศมี และ Differential Sync

## 1. บริบทและสถาปัตยกรรม (Architecture Context)
ในระบบเดิม เมื่อผู้ดูแลระบบ (SuperAdmin) เปลี่ยนแปลงการตั้งค่าใน `settings.html` ผู้ใช้ที่เปิดหน้าจอ `checkin.html` ทิ้งไว้บนโทรศัพท์มือถือจะไม่อัปเดตสถานะตามจนกว่าจะปิดเบราว์เซอร์หรือรีเฟรชหน้าเว็บ นอกจากนี้ การตรวจสอบรัศมีสถานที่ทำงานเดิมถูกผูกติดกับ `require_gps` ทำให้องค์กรไม่สามารถบังคับบันทึกพิกัดจริงโดยไม่บล็อกการลงเวลานอกรัศมีได้

## 2. กฎการทำงาน Realtime Settings Hot-Reload บน `checkin.html`
1. **ช่องสัญญาณ WebSocket:** `CheckinController` เชื่อมต่อ Supabase Realtime Channel `bma_checkin_settings_realtime` ดักฟัง Event `UPDATE` และ `INSERT` บนตาราง `system_settings`
2. **การล้างแคชและอัปเดตสด (Zero-Reload Hot Update):**
   - ล้างแคชใน `sessionStorage.removeItem(Config.STORAGE_KEYS.CACHED_SETTINGS)`
   - ดึงการตั้งค่าล่าสุดผ่าน `SettingsModel.getSettings(true)`
   - สลับเลย์เอาต์การ์ดคู่ (กล้อง 3:4 และแผนที่ GPS) ทันทีผ่าน `#applyDynamicWorkspaceLayout()`
   - อัปเดตสถานะรัศมีทันทีผ่าน `#renderGeofenceStatusUI()`
   - คำนวณช่วงเวลากะและปุ่มบันทึกเวลาสดๆ ผ่าน `#evaluateTimeWindowAndPopulateShifts()` และ `#updateStatusCardsAndMainButton()`
   - ดักฟัง `visibilitychange` เพื่อตรวจสอบการตั้งค่าล่าสุดอัตโนมัติเมื่อผู้ใช้สลับกลับมาที่แอป
3. **การ Harmonize กับรูปแบบปกติ:**
   - ใน "รูปแบบปกติ" ที่เปิดรับเวลาปกติ ในช่วงเวลาทำงานปกติ (เช่น 07:37 น.) ต้องไม่แสดงการ์ดเลือกช่วงเวลา และปุ่ม "บันทึกลงเวลาเข้าปฏิบัติงาน" จะบันทึกเข้างานปกติได้อย่างราบรื่น ไม่แสดงกล่องเตือนเลือกช่วงเวลา

## 3. กฎของสวิตช์ระบบรัศมี (`enforce_geofence_radius`)
1. **ฟิลด์การตั้งค่า:** `enforce_geofence_radius: true/false` (ค่าเริ่มต้นคือ `true`) ใน `Config.DEFAULT_SETTINGS`
2. **เมื่อเปิดใช้งาน (`true`):** บังคับตรวจพิกัดให้อยู่ในรัศมีที่กำหนด หากอยู่นอกรัศมีจะแสดงป้ายเตือนสีแดง/ชมพู และบล็อกไม่ให้ลงเวลาในโหมดในสถานที่
3. **เมื่อปิดใช้งาน (`false`):**
   - ผู้ใช้ยังคงต้องเปิด GPS ตามปกติหากเปิด `require_gps`
   - ระบบบันทึกพิกัดจริงและระยะทางจริงลงฐานข้อมูล
   - บนหน้าจอลงเวลาจะแสดงป้ายสีเขียว `"ไม่จำกัดรัศมี"` พร้อมข้อความระบุว่าเปิดให้ลงเวลาโดยไม่จำกัดรัศมี
   - อนุญาตให้กดบันทึกลงเวลาได้ทันทีโดยไม่บล็อก

## 4. มาตรฐานสวิตช์ Modern Tailwind CSS Toggle Switches บน `settings.html`
แปลงการควบคุมฟังก์ชันลงเวลาทั้ง 7 ตัวให้เป็นสวิตช์เลื่อนเปิดปิด (iOS Style):
- ใช้ `<input type="checkbox" class="sr-only peer">` ซ่อนอยู่หลังสวิตช์ ทำให้ JavaScript เดิมสามารถใช้ `.checked = true/false` ได้ 100%
- สวิตช์ใช้สไตล์: `peer-checked:bg-[#00744B]` พร้อมแอนิเมชันลูกกลมเลื่อนนุ่มนวล

## 5. กฎ Realtime Differential DOM Diffing บน Dashboard และ Reports
1. **AppLayout WebSocket Bus:** เชื่อมต่อผ่าน `DatabaseService.getInstance().client` เพื่อความเสถียรและกระจาย `bma:realtime-delta-sync`
2. **DashboardController:**
   - ตัวเลข KPI เคลื่อนไหวนุ่มนวลด้วย `DOMDiffHelper.animateNumericValue`
   - แถวลงเวลาใหม่แทรกด้านบนสุดพร้อมแอนิเมชันด้วย `DOMDiffHelper.prependRowWithAnimation`
   - การลงเวลาออกหรือเปลี่ยนสถานะอัปเดต In-Place พร้อมเอฟเฟกต์สีเขียว
3. **ReportsController:**
   - ค้นหาแถวด้วย `r.row_uid` หรือ `${r.personnel_id}_${r.work_date}`
   - อัปเดตเวลาเข้า/ออก/สถานะ/สีประจำแถว In-Place โดยไม่รีเฟรชตาราง ไม่ล้างหน้า ไม่ทำลาย Accordion และไม่ทำให้ Scroll กระโดด
