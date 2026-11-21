# ADR 0027: Reports Table GPS 2-Line Format and Civil Service Remarks Normalization

- **Date**: 2026-11-13
- **Status**: Accepted & Verified (`Build ID: 20261113_6dcf28ee`)
- **Task ID**: `PIPE-20261113-reports-table-gps-and-remarks-redesign`
- **Linked Flows**: `FLOW_REPORTS_01` (Attendance Reports, Tag Filtering & Print/Export Flow), `FLOW_CHECKIN_01` (Regular & Special Check-in/Check-out Lifecycle)

---

## Context & Problem Statement
In the Attendance Reports view (`reports.html` / `ReportsController.js`), attendance logs across 5 official status tables (*ปกติ*, *มาสาย*, *ขาดราชการ*, *ไม่ลงเวลา*, *นอกเวลา*) presented significant ergonomic and presentation issues:
1. **Visual Noise in GPS Columns**: The previous implementation rendered raw geographic coordinates (e.g. `13.756331° N, 100.501765° E`) under each location name. These long strings cluttered the tabular view, cramped civil servant full names and positions, and did not add value for administrative reviewers.
2. **Tag Stomping & Redundant Status in Remarks**: The remarks column frequently showed redundant strings matching the table header itself (such as "ปฏิบัติงานปกติ", "มาสาย", "ขาดราชการ", or "ในสถานที่").
3. **Desynchronized Output Across Presentation Modes**: Formatting logic was inconsistently handled between interactive Web DOM tables, A4 landscape Print/PDF generation (`UIHelpers.printReportInNewTab`), and Excel exports (`btnExportReportExcel`).
4. **Data Query Limitation in `AttendanceModel.js`**: `AttendanceModel.getReportRecordsByDateRange()` selected fixed columns from `attendance_logs` without querying `location_mode`, leaving `rec.location_mode` undefined at the presentation layer.

---

## Decision & Implementation

### 1. Inclusion of `location_mode` and Staging Schema Zero-Overwrite Architecture
- **Staging-Only Dedicated Columns**:
  - `staging.attendance_logs` extended with 4 dedicated columns: `offsite_reason`, `check_out_location_mode`, `check_out_distance_from_official_meters`, `check_out_offsite_reason`.
  - Public schema remained strictly untouched per user direction.
- **Strict Zero-Overwrite Preservation**:
  - In `AttendanceModel.submitCheckinOrCheckout` (`updateOut`), removed `updateOut.remark = payload.remark`. Regular check-out strictly writes to dedicated check-out columns (`check_out_location_mode`, `check_out_distance_from_official_meters`, `check_out_offsite_reason`), permanently eliminating the regression where check-out overwrote the morning check-in `remark` or `offsite_reason` with `'ในสถานที่'`.
- **42703 Resilience & Graceful Fallback**:
  - All writes and reads in `AttendanceModel.js` implement fallback retries upon encountering Postgres error code `42703` (column does not exist), guaranteeing 100% operational continuity before and after schema migrations.
- Updated `AttendanceModel.getReportRecordsByDateRange()` to select `location_mode`, `offsite_reason`, `check_out_location_mode`, `check_out_distance_from_official_meters`, `check_out_offsite_reason`.
- Mapped all attributes cleanly in `AttendanceModel.#formatReportRow()`.
- Synchronized connected surfaces: `#modalResumeProfile` (Admin check-in details), `#buildHistoryRowHtml` (personal attendance history), and `saveAdminAttendanceRecord` (preserves existing check-in mode and offsite reason).

### 2. GPS 2-Line Presentation Standard (Zero Coordinate Numbers)
- **Line 1 (`[ในสถานที่, นอกสถานที่]`)**:
  - Web: Rendered as lightweight, accessible pill badges (emerald for `ในสถานที่`, sky for `นอกสถานที่`).
  - Print PDF: Rendered with print-safe inline badges.
  - Excel: Exported as prefix `[ในสถานที่]` or `[นอกสถานที่]`.
  - Fallback Geofence: When resolving check-out mode in regular 2-click flows without a separate checkout mode column, coordinates are checked against `settings.official_locations` radius. Unrecorded/unclosed states render `-`.
- **Line 2 (`[บริเวณ..., ใกล้เคียง...]`)**:
  - Formats location name ensuring natural Thai prefix (`บริเวณ` or `ใกล้เคียง`).
  - Strictly suppresses numeric coordinate strings (`° N`, `° E`, decimal numbers).

### 3. Normalization of Remarks Column (Rules 2.1–2.4)
- **Tag Status Suppression**: Strictly filters out status strings (`ปฏิบัติงานปกติ`, `มาสาย`, `ขาดราชการ`, `ไม่ลงเวลา`, `ปฏิบัติงานนอกเวลา`, `ปฏิบัติงานนอกเวลาราชการ`, `ในสถานที่`).
- **Rule 2.1 & 2.3 (Onsite vs Offsite)**:
  - Onsite (`ในสถานที่`): Remarks column renders `-` (no text displayed).
  - Offsite (`นอกสถานที่`): Remarks column displays offsite job nature (เช่น "อบรม", "ประชุม", "ปฏิบัติงานนอกสถานที่", "ปฏิบัติงานที่บ้าน (WFH)", etc.).
- **Rule 2.2 (Regular Check-out Invariance)**:
  - Check-out events never overwrite check-in remarks; check-in job nature remains authoritative.
- **Rule 2.4 (Special Attendance Requests)**:
  - Renders user-selected reason (`rec.remark` from `#spRemarkSelect`, เช่น "ลืมลงเวลาปฏิบัติราชการ", "โทรศัพท์/อุปกรณ์ขัดข้อง").
- **Unrecorded / Absent**: Renders `-`.

### 4. Tri-Surface Synchronization
- Integrated identically across Web DOM table rendering, A4 landscape print CSS / HTML, and Excel export rows (`btnExportReportExcel` & `btnTemplateReportExcel`).

### 5. Mandatory Cache Auto-Stamping
- Executed `node ./.ai_map/vscode_ast_mapper.mjs`.
- Synchronized `buildId: 20261113_a5af5dd7` across `version.json` and all 8 HTML files.

---

## Verification & Impact
- Automated test suite `qa_reports_redesign_verification.mjs` passed 96/96 assertions (100%).
- Regression suites `qa_post_implementation_test.mjs` (29/29) and `qa_loca_v2_verification.mjs` (25/25) passed.
- Zero syntax errors via `node --check`.
- Column widths balanced and clean on both desktop and mobile viewports.
