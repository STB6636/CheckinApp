---
id: "sb_00_index_moc"
title: "Second Brain — Map of Content (MOC)"
type: "index"
last_updated_phase: "PIPE-20261026-codebase-mapping-v3"
---

# 🧠 Second Brain — Map of Content (v3.0)

> อ่านไฟล์นี้เป็นอันดับแรกเสมอ (`agent_07_second_brain` / `RETRIEVE`) แล้วติดตาม `[[Wiki-links]]` ไปยังโน้ตที่เกี่ยวข้อง
> ทุกครั้งที่สร้าง/อัปเดตโน้ต (`INGEST_AND_LINK`) ต้องเพิ่มลิงก์ในหมวดที่ถูกต้องด้านล่าง และเชื่อมโยงกับ `Flow ID` ใน `.ai_map/00_PROCESS_FLOW_MAP.md`

## 01 — Architecture Decisions (ADR)
- [[adr_001_vscode_surgical_codebase_map]] — ADR-001: ระบบสารบัญโค้ดอัตโนมัติและการเข้าถึงไฟล์แบบเจาะจงบรรทัด (VS Code Surgical Context & Codebase Mapping v3.0)
- [[adr_002_mobile_checkin_sticky_drawer]] — ADR-002: สถาปัตยกรรมหน้าลงเวลามือถือแบบ Zero-Scroll ด้วย Sticky Bottom Bar, Two-Tier Banner และ Hamburger History Drawer (Flow 1, 2, 4)

## 02 — Domain Logic & Rules
_ยังไม่มีโน้ตแยกเฉพาะ (ดูดัชนี `FLOW_AUTH_01` ถึง `FLOW_USERS_01` ใน [[checkinapp_project_context]] และ `.ai_map/00_PROCESS_FLOW_MAP.md`)_

## 03 — Bug Post-mortems & Fixes
- [[fix_v19_realtime_shift_filter_and_personnel_modal]] — Post-mortem V19: แก้ไข `filter_shifts_by_realtime` (Flow 3, 5, 11) และปรับปรุง Layout ฟอร์มประวัติบุคลากรไร้ข้อมูลซ้ำซ้อน (Flow 9)

## 04 — Project Contexts
- [[checkinapp_project_context]] — CheckinApp (BMA Check-in App V2.1–V2.7): โครงสร้างโปรเจกต์, Supabase, GitHub Pages และดัชนีกระบวนการทำงานทั้ง 12 Flows (`FLOW_AUTH_01` – `FLOW_USERS_01`)

## Codebase Map (`.ai_map/`)
- สารบัญกระบวนการทำงานและ Call Chain: `.ai_map/00_PROCESS_FLOW_MAP.md`
- สารบัญไฟล์และฟังก์ชันพร้อมเลขบรรทัด (30 ไฟล์ / 367 สัญลักษณ์): `.ai_map/01_FILE_FUNCTION_INDEX.md`
- ดัชนีโครงสร้างโค้ด JSON: `.ai_map/CODE_INDEX.json`
- สคริปต์สแกนอัตโนมัติ (0 AI Tokens): `.ai_map/vscode_ast_mapper.mjs`

## Skill Registry (`ai_skills_registry/`)
- ดัชนีสกิล: `ai_skills_registry/SKILL_CATALOG.json`
- [[vscode_surgical_codebase_mapping]] — VS Code Surgical Context & Automated AST Codebase Mapping (`v3.0.0`)
