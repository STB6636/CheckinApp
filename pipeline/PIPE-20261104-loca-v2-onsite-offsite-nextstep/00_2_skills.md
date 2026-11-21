# Phase 0.2 — Skill Matching (`PIPE-20261104-loca-v2-onsite-offsite-nextstep`)

## Matched Skills & Specifications
1. **`ai-software-pipeline`** (`.agents/skills/ai-software-pipeline/SKILL.md`):
   - Enforces the **Lean 2-SubAgent + 1-Orchestrator Architecture**:
     - Orchestrator: Phase 0, Dual Plan (`implementation_plan.md` + `interactive_plan.html`), SubAgent coordination, Phase 6 & Final Report.
     - SubAgent 1 (`Flash 3.8 High`, 1 instance): Surgical line-range implementation + `.ai_map` AST sync.
     - SubAgent 2 (`Flash 3.8 High`, 1 instance): QA verification against plan + `git diff main` compatibility check.
2. **User-Provided Spec 1: `onsite-offsite-geofence-remark-module` (`v1.0.0`)**:
   - Default mode: `"ในสถานที่"` (`ONSITE`).
   - Multi-location Haversine geofencing with 25m capped accuracy buffer (`evaluateOnsiteGeofence`).
   - Out-of-radius behavior: Disable submit button and display `"พิกัดตำแหน่งอยู่นอกสถานที่ทำงาน"`.
   - Settings > Tab `"สถานที่และรัศมี"`: Add/Edit/Delete multiple official locations (`id, name, latitude, longitude, radius_meters, is_active`).
   - Offsite mode (`"นอกสถานที่"`): Bypasses geofence radius, requires selecting a Work Format / Remark from Settings `"จัดการตัวเลือกหมายเหตุ"` (e.g., `ปฏิบัติงานนอกสถานที่`, `อบรม`, `ประชุม`, `ปฏิบัติงานที่บ้าน (WFH)`, `อื่นๆ` with custom text input), and saves it into `remark` so it appears in the `"หมายเหตุ"` column of `"ตารางรายงานสถานะ"`.
   - Offsite GPS: 2 options (`1. ใช้พิกัด GPS ปัจจุบัน`, `2. ค้นหาสถานที่ด้วยตัวเอง`) recorded into `"พิกัด GPS เข้างาน"` / `"พิกัด GPS ออกงาน"`.
3. **User-Provided Spec 2: `micro-2-step-attendance-ui` & Next-Step Wizard (`[ถ่ายรูป, พิกัดสถานที่, ช่วงเวลา (กรณีเป็นช่วงปฏิบัติงานนอกเวลา)]`)**:
   - Step-by-step wizard UI with bottom-docked action bar:
     - Step 1: ถ่ายรูป (`STEP_1_PHOTO`)
     - Step 2: พิกัดสถานที่ (`STEP_2_LOCATION`: เลือก `[ในสถานที่ / นอกสถานที่]`, ตรวจสอบรัศมี หรือ เลือกรูปแบบการปฏิบัติงาน + พิกัด GPS)
     - Step 3: ช่วงเวลา (`STEP_3_SHIFT` — แสดงเฉพาะกรณีเป็นช่วงปฏิบัติงานนอกเวลา หรือโหมดที่ต้องเลือกช่วงเวลา)
   - Bottom Action Bar:
     - Shows Yellow `"ถัดไป"` button (`#EAB308` / `bg-amber-500`) when not on the final step (and step requirements are met).
     - Shows Green `"บันทึกลงเวลาปฏิบัติงาน"` button (`#16A34A` / `bg-[#00744B]`) on the final step.
   - Confirmation & Submission Popups:
     - 1) Summary Confirmation Popup before saving
     - 2) Loading Popup: `"ระบบกำลังบันทึกข้อมูล"`
     - 3) Completion Popup: `"ลงเวลาปฏิบัติงานเรียบร้อยแล้ว"`

