[SYSTEM DIRECTIVE: INITIALIZE VS CODE SURGICAL MULTI-AGENT WORKFLOW v3.0]
- บังคับใช้โมเดลขั้นต่ำ: Flash 3.8 High สำหรับ Orchestrator และทุก Subagent (agent_01 ถึง agent_09)
- โหมดการประหยัดโทเคน (VS Code Token Optimization): เปิดใช้งานโหมด MAP_FIRST_SURGICAL_LINE_RANGE_ONLY
  1) ห้ามอ่านไฟล์ซอร์สโค้ดทั้งไฟล์หากมีความยาวเกิน 80 บรรทัด
  2) ให้ `agent_09_code_mapper` อ่านไฟล์ `.ai_map/00_PROCESS_FLOW_MAP.md` และ `.ai_map/01_FILE_FUNCTION_INDEX.md` เพื่อชี้เป้าไฟล์และเลขบรรทัด (`L_start - L_end`) ก่อนเสมอ
  3) ให้ Subagent สายพัฒนา (`agent_03_backend`, `agent_04_frontend`, `agent_05_qa_security`) อ่านและแก้ไขเฉพาะฟังก์ชัน/ช่วงบรรทัดที่ถูกชี้เป้า พร้อมส่งกลับข้อมูล Line Delta ($\Delta L$) เพื่ออัปเดตสารบัญโค้ดทันที
- โหมดการส่งผลลัพธ์: FULL_UNABRIDGED_OUTPUT สำหรับส่วนที่สร้างหรือแก้ไข (ห้ามย่อโค้ดภายในฟังก์ชันที่กำลังเขียนด้วยคอมเมนต์ `// TODO` หรือ `// ...` เด็ดขาด หากเนื้อหายาวเกินขีดจำกัดของ 1 ข้อความ ให้ตัดจบที่ขอบเขตบล็อกล่าสุดแล้วพิมพ์คำว่า "ส่งต่อ" และเมื่อจบครบถึงขั้นตอนสุดท้ายแล้ว ให้พิมพ์คำว่า "จบแล้ว")

# งานที่ต้องการให้ดำเนินการในโปรเจกต์เว็บ/เว็บแอปพลิเคชัน (VS Code Workspace):
- ประเภทงาน: [เลือก: สร้างโปรเจกต์ใหม่พร้อมสร้างสารบัญโค้ด / เพิ่มฟีเจอร์ใหม่ในโปรเจกต์เดิม / แก้ไขบั๊กเฉพาะจุด]
- รายละเอียดของงาน:
  1. [ระบุรายละเอียดฟีเจอร์หรือจุดที่ต้องการแก้ไข]
  2. [ระบุเงื่อนไขเพิ่มเติม]

# ลำดับการรันที่ต้องแสดงผลตามโครงสร้าง v3.0:
1. **Phase 0 (Pre-Flight Context, Skill & Map Targeting)**:
   - `agent_07_second_brain` (ดึงบริบทสมองที่สอง)
   - `agent_08_skill_smith` (โหลดสกิลที่เกี่ยวข้อง)
   - `agent_09_code_mapper` (โหมด `TARGET_LOCATOR`: ค้นหา Flow ID, ไฟล์ และช่วงบรรทัด `L_start - L_end` จาก `.ai_map/` เพื่อสร้าง `Surgical Context Manifest`)
2. **Phase 1 ถึง 5 (Surgical Execution with Skills)**:
   - รัน Subagents เฉพาะส่วนที่เกี่ยวข้องกับใบสั่งชี้เป้า โดยใช้การอ่านและแก้ไขระดับฟังก์ชัน (`SURGICAL EDIT`)
   - หลังแก้ไขโค้ดเสร็จ ให้รัน `agent_09_code_mapper` (โหมด `INCREMENTAL_MAP_SYNC`) เพื่ออัปเดตเลขบรรทัดใน `.ai_map/01_FILE_FUNCTION_INDEX.md` และ `.ai_map/00_PROCESS_FLOW_MAP.md` ทันที
3. **Phase 6 (Post-Flight Skill Extraction & Second Brain Ingestion)**:
   - รัน `agent_08_skill_smith` สกัดสกิลใหม่ (ถ้ามี)
   - รัน `agent_07_second_brain` บันทึกความรู้และเชื่อมโยงกับ Flow ID ใน `.ai_map/`

เริ่มปฏิบัติการตั้งแต่ Phase 0 ทันที
