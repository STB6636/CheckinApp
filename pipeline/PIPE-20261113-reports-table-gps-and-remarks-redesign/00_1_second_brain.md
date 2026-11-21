# Second Brain Retrieval — Task: PIPE-20261113-reports-table-gps-and-remarks-redesign

- **Task ID**: `PIPE-20261113-reports-table-gps-and-remarks-redesign`
- **Flow ID**: `FLOW_REPORTS_01` (Attendance Reports, Tag Filtering & Print/Export Flow)
- **Target Branch**: `Loca-V2`
- **Retrieval Date**: 2026-11-13

---

## 1. Relevant Architecture Decisions (ADRs) & Rules
1. **[[ADR_0020_Reports_Print_PDF_PageBreak_Architecture]]**:
   - Standardizes `@page { size: A4 landscape; margin: 8mm 10mm; }`.
   - Table headers must use `thead { display: table-header-group; }` so they repeat automatically across all printed pages.
   - Any modifications to table cells in `#buildSingleRowHtml(rec, indexNo, forPrintPdf)` must maintain clean column width alignment and avoid nested blocks with page-break conflicts.
2. **[[rule_loca_v2_onsite_offsite_nextstep_and_staging_schema]]**:
   - `location_mode` (`ONSITE` / `OFFSITE`) distinguishes between workplace-based check-in and outside field work.
   - For OFFSITE check-in, remarks contain specific job nature (เช่น "อบรม", "ประชุม", "ปฏิบัติงานนอกสถานที่", "ปฏิบัติงานที่บ้าน (WFH)", หรือตัวเลือกอื่นๆ).
   - For ONSITE check-in, remark is set to "ในสถานที่" or blank.
3. **[[rule_dual_gps_columns_and_jitter]]**:
   - Reports table separates Check-in GPS and Check-out GPS into two dedicated columns.
   - Coordinate jitter (if enabled) affects check-out coordinate resolution.
4. **[[rule_civil_servant_position_level_formatter]]**:
   - Preserves normalized format for position, type, and level without regression.
5. **[[rule_remote_version_hard_cache_purge_autostamp]]**:
   - Every modification to `assets/js/**` or `reports.html` requires running `node ./.ai_map/vscode_ast_mapper.mjs` to auto-stamp a new `buildId` in `version.json` and sync `?v=<buildId>` across all 8 HTML files.

---

## 2. Past Pitfalls to Avoid (`past_pitfalls_to_avoid`)
1. **Missing `location_mode` in SQL Select**:
   - In `AttendanceModel.getReportRecordsByDateRange`, line 2333 specifies exact columns in `.select(...)`. If `location_mode` is omitted from `.select(...)`, `rec.location_mode` will be `undefined`, causing the reports table to fall back incorrectly. Must ensure `location_mode` is safely queried and mapped in `#formatReportRow`.
2. **Overwriting Check-in Remarks with Check-out Events**:
   - In 2-click regular attendance flow, checking out should NOT overwrite or modify the remarks column in the report table. The rule explicitly demands:
     - `2.1 รูปแบบปกติ, เวลาเข้างาน`: ดูค่าเฉพาะบันทึกลงเวลาเข้างานเท่านั้น
     - `2.2 รูปแบบปกติ, เวลาออกงาน`: ไม่ต้องแสดงข้อความใดๆ ในช่องหมายเหตุ
3. **Redundant Status Name Leakage ("Tag Stomping")**:
   - Currently, some records contain status labels (เช่น "ปฏิบัติงานปกติ", "มาสาย", "ขาดราชการ", "ไม่ลงเวลา", "ปฏิบัติงานนอกเวลา") stored in `rec.remark`. The rule explicitly states:
     - "ไม่ต้องแสดงสถานะตาม TAG ตาราง เพราะแสดงอยู่ที่หัวตารางอยู่แล้ว"
     - We must actively sanitize/filter out status names matching the table's tag or default status names so they never display in the remarks column.
4. **Showing Raw GPS Coordinate Numbers**:
   - The rule explicitly mandates: "1.2 บรรทัดที่ 2 : แสดงสถานที่ [บริเวณ,ใกล้เคียง] , ไม่ต้องแสดงค่าพิกัด".
   - Never print latitude/longitude numbers (`13.xxxxxx° N, 100.xxxxxx° E`) in either Web View, Print PDF, or Excel export.
5. **Excel Export and Print PDF Desynchronization**:
   - When modifying web table rendering in `#buildSingleRowHtml`, developers often forget `forPrintPdf` branch or `btnExportReportExcel` click handler. All 3 presentation surfaces (Web DOM, PDF print HTML, and XLSX/CSV export) must strictly follow the new 2-line GPS rules and remarks rules.
