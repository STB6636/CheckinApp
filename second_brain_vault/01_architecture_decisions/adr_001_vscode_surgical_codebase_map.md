---
id: "sb_01_adr_001_vscode_surgical_codebase_map"
title: "ADR-001: ระบบสารบัญโค้ดอัตโนมัติและการเข้าถึงไฟล์แบบเจาะจงบรรทัด (VS Code Surgical Context & Codebase Mapping v3.0)"
type: "ADR"
tags: ["architecture", "codebase_mapping", "ast_mapper", "token_optimization", "vscode", "checkinapp"]
related_notes: ["[[checkinapp_project_context]]", "[[00_INDEX_MOC]]"]
related_skills: ["vscode_surgical_codebase_mapping"]
last_updated_phase: "PIPE-20261026-codebase-mapping-v3"
status: "verified_active"
---

# ADR-001: ระบบสารบัญโค้ดอัตโนมัติและการเข้าถึงไฟล์แบบเจาะจงบรรทัด (VS Code Surgical Context & Codebase Mapping v3.0)

## 1. บริบทและปัญหา (Context & Problem Statement)
โปรเจกต์ CheckinApp (BMA Check-in App V2.1–V2.7) มีซอร์สโค้ดรวม 30 ไฟล์ (367 สัญลักษณ์/ฟังก์ชัน/ตาราง/ส่วนหน้าจอ) โดยมีไฟล์ขนาดใหญ่หลายไฟล์ เช่น `AttendanceModel.js` (1,515 บรรทัด), `PersonnelController.js` (1,451 บรรทัด), `CheckinController.js` (1,179 บรรทัด), `SettingsController.js` (1,161 บรรทัด), และ `UIHelpers.js` (1,079 บรรทัด) การอ่านไฟล์ทั้งหมดทุกครั้งที่แก้ไขทำให้สิ้นเปลืองโทเคนและเสี่ยงต่อการเขียนทับโค้ดส่วนอื่นที่ไม่เกี่ยวข้อง

## 2. โครงสร้างทางเทคนิคและกฎเกณฑ์ (Technical Specification & Rules)
1. **Zero-Token Automated AST/Symbol Scanner (`.ai_map/vscode_ast_mapper.mjs`):**
   - รันด้วย Node.js (ผูกกับ `.vscode/tasks.json` ให้ทำงานอัตโนมัติเมื่อเปิดโฟลเดอร์ `runOn: folderOpen` และใน Phase 3.5)
   - สแกนไฟล์ `.js`, `.mjs`, `.ts`, `.tsx`, `.jsx`, `.py`, `.gs`, `.html`, `.sql` ทั้งโปรเจกต์ (รองรับ ES2022 Private Methods `#methodName`, `static async`, `constructor`, HTML DOM Sections, และ Supabase SQL DDL/RLS)
   - สร้างไฟล์ `.ai_map/01_FILE_FUNCTION_INDEX.md` และ `.ai_map/CODE_INDEX.json` พร้อมค่า SHA-256 Hash และช่วงบรรทัด `L_start - L_end`
2. **End-to-End Process Flow Map (`.ai_map/00_PROCESS_FLOW_MAP.md`):**
   - จัดทำแผนผังกระบวนการทำงานตั้งแต่ต้นจนจบของทั้งระบบรวม 12 กระบวนการหลัก (`FLOW_AUTH_01`, `FLOW_AUTH_02`, `FLOW_LAYOUT_01`, `FLOW_CHECKIN_01`, `FLOW_GPS_01`, `FLOW_PHOTO_01`, `FLOW_SPECIAL_REQ_01`, `FLOW_DASHBOARD_01`, `FLOW_PERSONNEL_01`, `FLOW_REPORTS_01`, `FLOW_SETTINGS_01`, `FLOW_USERS_01`) พร้อมระบุ Call Chain ข้ามไฟล์และช่วงบรรทัดแม่นยำ 100%
3. **Surgical Workflow Protocol (`MAP_FIRST_SURGICAL_LINE_RANGE_ONLY`):**
   - **Phase 0.3 (`agent_09_code_mapper` — `TARGET_LOCATOR`):** อ่านเฉพาะไฟล์ใน `.ai_map/` เพื่อออกใบสั่งชี้เป้า (`Surgical Context Manifest`)
   - **Phase 1–4:** อ่านเฉพาะช่วงบรรทัด `recommended_read_window` (`StartLine`–`EndLine` $\pm 10$ บรรทัด) และส่งมอบการแก้ไขแบบ `SURGICAL EDIT` พร้อมระบุ $\Delta L$
   - **Phase 3.5 (`INCREMENTAL_MAP_SYNC`):** รัน `node ./.ai_map/vscode_ast_mapper.mjs` และอัปเดต `.ai_map/00_PROCESS_FLOW_MAP.md` ทันทีหลังแก้ไขโค้ด

## 3. ข้อควรระวังและกรณีศึกษา (Pitfalls & Edge Cases)
- ห้ามใช้ `read_file` แบบไม่ระบุ `StartLine`/`EndLine` กับไฟล์ซอร์สโค้ดที่มีความยาวเกิน 80 บรรทัดก่อนตรวจสอบ `.ai_map/`
- เมธอดภายในคลาสของ CheckinApp ใช้ไวยากรณ์ ES2022 Private Methods (`#methodName`) เป็นหลัก สคริปต์ `.ai_map/vscode_ast_mapper.mjs` ต้องรองรับเครื่องหมาย `#` หน้าชื่อเมธอดเสมอ
- ทุกครั้งที่เพิ่มหรือลบโค้ดในไฟล์เดิม ต้องรัน `node ./.ai_map/vscode_ast_mapper.mjs` เพื่อซิงค์เลขบรรทัดก่อนส่งต่อให้ `agent_05_qa_security`

## 4. ความเชื่อมโยงในระบบความรู้ (Knowledge Graph Links)
- เชื่อมโยงกับบริบทโปรเจกต์: [[checkinapp_project_context]]
- เชื่อมโยงกับสารบัญโค้ด: `.ai_map/00_PROCESS_FLOW_MAP.md`, `.ai_map/01_FILE_FUNCTION_INDEX.md`, `.ai_map/CODE_INDEX.json`
- เชื่อมโยงกับสกิลที่ใช้: [[vscode_surgical_codebase_mapping]]

