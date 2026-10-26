---
skill_id: "vscode_surgical_codebase_mapping"
name: "VS Code Surgical Context & Automated AST Codebase Mapping"
version: "3.0.0"
target_subagents: ["agent_00_orchestrator", "agent_01_ba_sa", "agent_02_architect", "agent_03_backend", "agent_04_frontend", "agent_05_qa_security", "agent_06_devops", "agent_09_code_mapper"]
trigger: "บังคับโหลดทุกครั้งที่มีการค้นหา อ่าน แก้ไข หรือเพิ่มฟีเจอร์ในโปรเจกต์เว็บไซต์/เว็บแอปพลิเคชันใน VS Code เพื่อบังคับใช้โหมด MAP_FIRST_SURGICAL_LINE_RANGE_ONLY"
dependencies: ["node >= 18.0.0 (fs, path, crypto built-ins)"]
---

# SKILL INSTRUCTION: VS Code Surgical Context & Automated AST Codebase Mapping

## 1. วัตถุประสงค์และขอบเขตของสกิล (Purpose & Scope)
สกิลนี้กำหนดมาตรฐานการสร้าง ดูแลรักษา และใช้งานสารบัญโค้ดอัตโนมัติ (`.ai_map/00_PROCESS_FLOW_MAP.md`, `.ai_map/01_FILE_FUNCTION_INDEX.md`, และ `.ai_map/CODE_INDEX.json`) เพื่อให้ Subagents ทุกตัวเข้าถึงและแก้ไขซอร์สโค้ดแบบเจาะจงช่วงบรรทัด (`L_start - L_end`) โดยเสียโทเคนในการนับบรรทัดเป็น 0 ด้วยสคริปต์ `.ai_map/vscode_ast_mapper.mjs`

## 2. ขั้นตอนการปฏิบัติตามสกิล (Mandatory Execution Steps)
เมื่อสกิลนี้ถูกเปิดใช้งาน Subagent ต้องปฏิบัติตามลำดับขั้นตอนนี้โดยห้ามข้ามขั้นตอน:
1. **Pre-Flight Map Check (Phase 0.3):** `agent_09_code_mapper` อ่านเฉพาะ `.ai_map/00_PROCESS_FLOW_MAP.md` และ `.ai_map/01_FILE_FUNCTION_INDEX.md` เพื่อสร้างใบสั่งชี้เป้า (`Surgical Context Manifest` JSON) ระบุ `matched_process_flows`, `surgical_read_targets` (`exact_line_range` และ `recommended_read_window`), และ `signature_only_references`
2. **Surgical Line-Range Read (Phase 1–4):** Subagents สายพัฒนาอ่านซอร์สโค้ดเฉพาะช่วงบรรทัดที่ระบุใน `recommended_read_window` (`StartLine` ถึง `EndLine` $\pm 10$ บรรทัด) และใช้ `signature_only_references` สำหรับฟังก์ชันข้างเคียงโดยไม่เปิดอ่านไฟล์เต็ม
3. **Surgical Function/Block Replacement (Phase 3A/3B/4):** เมื่อแก้ไขไฟล์เดิม ให้ส่งมอบโค้ดภายในฟังก์ชันที่แก้ไขแบบครบ 100% ทุกบรรทัด พร้อมบล็อกเมทาดาทา `SURGICAL EDIT` ระบุ `Original Line Range`, `New Line Range`, `Line Delta` ($\Delta L$), `Updated Function Signature`, และ `Process Flow Impact`
4. **Zero-Token Incremental Map Sync (Phase 3.5 & Post-QA):** รันคำสั่ง `node ./.ai_map/vscode_ast_mapper.mjs` ทันทีหลังแก้ไขโค้ด เพื่อคำนวณเลขบรรทัดใหม่และอัปเดต `.ai_map/01_FILE_FUNCTION_INDEX.md` และ `.ai_map/CODE_INDEX.json` ให้ตรงกับไฟล์จริง 100% พร้อมปรับปรุง `.ai_map/00_PROCESS_FLOW_MAP.md` หากลำดับการเรียกหรือช่วงบรรทัดใน `Flow ID` เปลี่ยนแปลง

## 3. กฎเหล็กและข้อห้ามของสกิล (Strict Rules & Anti-Patterns)
- **MUST DO**: อ่าน `.ai_map/00_PROCESS_FLOW_MAP.md` และ `.ai_map/01_FILE_FUNCTION_INDEX.md` ก่อนเปิดไฟล์ซอร์สโค้ดเสมอ และซิงค์สารบัญด้วย `node ./.ai_map/vscode_ast_mapper.mjs` ทุกครั้งหลังแก้ไขไฟล์
- **NEVER DO**: ห้ามใช้คำสั่งอ่านไฟล์ทั้งไฟล์กับซอร์สโค้ดที่ยาวเกิน 80 บรรทัดโดยไม่ผ่าน `.ai_map/` และห้ามใส่คอมเมนต์ย่อโค้ด (`// TODO`, `// ... existing code ...`) ภายในฟังก์ชันที่กำลังแก้ไขโดยเด็ดขาด

## 4. โค้ดต้นแบบมาตรฐานฉบับเต็ม (Full Reference Implementation & Templates)
- สคริปต์สแกนและสร้างสารบัญอัตโนมัติ: `.ai_map/vscode_ast_mapper.mjs` (สำเนาต้นแบบอยู่ใน `./templates/vscode_ast_mapper.mjs`)
- ไฟล์ตั้งค่า VS Code Task อัตโนมัติ: `.vscode/tasks.json`

## 5. รายการตรวจสอบความสมบูรณ์ (Self-Verification Checklist)
- [ ] ตรวจสอบจาก `.ai_map/00_PROCESS_FLOW_MAP.md` และ `.ai_map/01_FILE_FUNCTION_INDEX.md` ก่อนเปิดอ่านซอร์สโค้ดแล้ว
- [ ] ดึงซอร์สโค้ดมาอ่านเฉพาะช่วงบรรทัด `recommended_read_window` (`StartLine`–`EndLine`) แล้ว
- [ ] โค้ดในฟังก์ชันที่แก้ไขเขียนครบ 100% ทุกบรรทัด ไม่มี Placeholder และระบุเมทาดาทา `SURGICAL EDIT` ($\Delta L$) ครบถ้วนแล้ว
- [ ] รัน `node ./.ai_map/vscode_ast_mapper.mjs` และอัปเดต `.ai_map/00_PROCESS_FLOW_MAP.md` ให้เลขบรรทัดตรงกับไฟล์จริง 100% แล้ว

