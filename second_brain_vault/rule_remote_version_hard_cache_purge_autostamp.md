---
id: "rule_remote_version_hard_cache_purge_autostamp"
title: "ระบบบังคับเคลียร์แคชอัตโนมัติ (Remote version.json + Hard Cache Purge + Auto-Stamp) และข้อกำหนดเหล็กของโปรเจกต์"
type: "rule"
tags: ["cache-control", "version-json", "hard-cache-purge", "auto-stamp", "mandatory-rule", "github-pages"]
related_flows: ["FLOW-01", "FLOW-02", "FLOW-03", "FLOW-04", "FLOW-05", "FLOW-06", "FLOW-07", "FLOW-08"]
created_phase: "PIPE-20261109-remote-version-hard-cache-purge"
last_updated: "2026-11-09"
---

# ระบบบังคับเคลียร์แคชอัตโนมัติ (`Remote version.json + Hard Cache Purge + Auto-Stamp`)

## 1. บริบทและปัญหาที่แก้ไข (Context & Problem)
- เดิมมีเพียงหน้า `checkin.html` หน้าเดียวที่มีสคริปต์ตรวจเช็ค `CURRENT_APP_BUILD` ส่วนอีก 7 หน้าหลัก (`index.html`, `dashboard.html`, `approvals.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`) ไม่มีระบบป้องกันแคช
- บนมือถือ (LINE In-App Browser, iOS Safari, Android Chrome/Brave) เบราว์เซอร์มักดึงไฟล์ `.html` เดิมจาก Disk Cache ทำให้ `CURRENT_APP_BUILD` ในไฟล์แคชยังเป็นค่าเดิม และคำสั่ง `window.location.reload(true)` ถูกเพิกเฉยหาก URL ไม่เปลี่ยน

## 2. สถาปัตยกรรม 2 ชั้น + Auto-Stamp อัตโนมัติ
1. **`version.json` ที่ Project Root**:
   - เก็บ `{ buildId, contentHash, updatedAt }` สำหรับให้ทุกหน้าตรวจสอบเวอร์ชันล่าสุดของเซิร์ฟเวอร์แบบ `cache: 'no-store'`
2. **Unified Hard Cache Purge + Remote Poller ใน `<head>` ครบทั้ง 8 หน้า HTML**:
   - ตรวจสอบทั้ง `CURRENT_APP_BUILD` และยิง `fetch('./version.json?_t=' + Date.now(), { cache: 'no-store' })` ตอนโหลดหน้า, ตอน `pageshow` (BFCache), และตอน `visibilitychange`
   - เมื่อพบเวอร์ชันใหม่:
     1. เก็บ `bma_auth_session_v2` และ `bma_theme_mode` ไว้ (ผู้ใช้ไม่หลุด Login)
     2. ล้าง `window.caches` และยกเลิก Service Workers ทั้งหมด
     3. สั่ง `fetch(window.location.pathname, { cache: 'reload', credentials: 'same-origin' })` เขียนทับ Disk Cache ของหน้า HTML
     4. Redirect ไปยัง `?_cb=<buildId>` (ป้องกัน Loop ด้วย `sessionStorage.getItem('bma_reloaded_build')`) แล้วลบ `_cb` ออกด้วย `history.replaceState` เมื่อโหลดหน้าใหม่เสร็จ
3. **Auto-Stamp อัตโนมัติใน `.ai_map/vscode_ast_mapper.mjs` (`syncFrontendCacheVersion()`)**:
   - ทุกครั้งที่รัน `node ./.ai_map/vscode_ast_mapper.mjs` สคริปต์จะคำนวณ SHA-256 ของไฟล์ Frontend ทั้งหมดแบบ Idempotent และอัปเดต `version.json` พร้อมปั๊ม `CURRENT_APP_BUILD` และ `?v=<buildId>` ลงใน HTML ทั้ง 8 หน้าอัตโนมัติ

## 3. ข้อกำหนดเหล็กของโปรเจกต์ (Mandatory Project Requirement)
- บัญญัติไว้ใน `AGENTS.md` และ `.agents/skills/ai-software-pipeline/SKILL.md`:
  - **`subagent_01_implementer`**: ต้องรัน `node ./.ai_map/vscode_ast_mapper.mjs` ทุกครั้งที่แก้ไขไฟล์ Frontend เพื่อ Auto-Stamp `version.json` และ HTML ทั้ง 8 หน้า
  - **`subagent_02_qa_auditor`**: ต้องตรวจสอบว่า `buildId` ใน `version.json` ตรงกับ `CURRENT_APP_BUILD` และ `?v=<buildId>` ใน HTML ทั้ง 8 หน้าครบ 100% ก่อนอนุมัติ `PASS`

