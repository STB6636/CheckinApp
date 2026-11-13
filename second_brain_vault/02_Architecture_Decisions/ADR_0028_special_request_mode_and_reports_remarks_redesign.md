# ADR 0028: Special Request Onsite/Offsite Mode Alignment, Checkout Coordinate Referencing, and 2-Line Civil Service Remarks

- **Date**: 2026-11-13
- **Status**: Accepted & Verified (`Build ID: 20261113_04d9fb32`)
- **Task ID**: `PIPE-20261113-special-request-mode-and-reports-remarks-redesign`
- **Linked Flows**: `FLOW_SPECIAL_REQ_01` (Special Attendance Requests Flow), `FLOW_CHECKIN_01` (Check-in & Shift Lifecycle), `FLOW_REPORTS_01` (Attendance Reports, Tag Filtering & Print/Export Flow)

---

## Context & Problem Statement
In the attendance management system, special attendance requests (`#modalSpecialRequest` in `checkin.html` / `CheckinController.js`) and their presentation in attendance reports (`reports.html` / `ReportsController.js`) exhibited two critical architectural defects:
1. **Discordant In/Out GPS Badges (Item 2 & 2.1)**:
   - `#modalSpecialRequest` lacked UI controls for selecting between `[ในสถานที่]` (`ONSITE`) and `[นอกสถานที่]` (`OFFSITE`), as well as offsite work nature (`spOffsiteReasonSelect`).
   - Requests submitted from the modal did not persist `check_out_location_mode`, leaving it `null` in the database.
   - When generating report rows, `AttendanceModel.#formatReportRow` contained a fallback forcing `check_out_location_mode` to `'ONSITE'` whenever `check_out_time` was present (`log?.check_out_location_mode || (log?.check_out_time ? 'ONSITE' : null)`), bypassing special request handling in `ReportsController.#resolveLocationMode`.
   - As a result, offsite special requests displayed `[นอกสถานที่]` on check-in and `[ในสถานที่]` on check-out, creating confusing and contradictory reports.
2. **Missing Status Distinction in Remarks Column (Item 1 & 1.1)**:
   - Special request records in the 5 TAG reports tables displayed only the raw reason string without identifying the record as a special request (`กรณีพิเศษ`).
   - The user required a clear 2-line format:
     - **Line 1**: `กรณีพิเศษ` (clearly highlighted)
     - **Line 2**: Selected reason / job nature from `spRemarkSelect` / `offsite_reason`.

---

## Decision & Implementation

### 1. Upgrade `#modalSpecialRequest` with Segmented Location Mode
- In `checkin.html`:
  - Added segmented toggle buttons: `[ในสถานที่]` (`id="spModeOnsite"`) and `[นอกสถานที่]` (`id="spModeOffsite"`).
  - When `ONSITE`: Displays official workplace details (สำนักเทศกิจ) and hides custom search/map boxes.
  - When `OFFSITE`: Displays `ลักษณะงานนอกสถานที่` dropdown (`id="spOffsiteReasonSelect"`) with standard offsite work categories (WFH, อบรม/สัมมนา/ประชุม, ตรวจพื้นที่, ฯลฯ) alongside GPS options (Current GPS vs Leaflet map pin).
  - Maintained 100% existing DOM IDs for backwards compatibility and test stability.
- In `CheckinController.js`:
  - Integrated smart bidirectional synchronization between location mode and remark selection: opening or switching to `ONSITE` defaults to `"ลืมลงเวลาปฏิบัติราชการ"`, while switching to `OFFSITE` defaults to `"ปฏิบัติงานนอกสถานที่"`.
  - Filtered administrative non-work reasons from `spOffsiteReasonSelect`.
  - Extracted and forwarded `location_mode`, `check_out_location_mode`, `offsite_reason`, and `check_out_offsite_reason` to `AttendanceModel.submitSpecialRequest`.

### 2. Strictly Reference First (Check-in) Coordinates for Check-out
- In `AttendanceModel.submitSpecialRequest`:
  - Check-out coordinates strictly reference the first (check-in) coordinate: `outLat = payload.lat`, `outLng = payload.lng`, `outLocName = payload.location_name`.
  - When `settings.randomize_gps_checkout` is enabled, check-out coordinates are jittered from the first coordinate using `AttendanceModel.resolveJitteredCheckoutWithLocation`.
  - Explicitly persists `location_mode`, `check_out_location_mode`, `offsite_reason`, `check_out_offsite_reason`, `distance_from_official_meters`, and `check_out_distance_from_official_meters`.

### 3. Report Row Formatting & Checkout Mode Inheritance
- In `AttendanceModel.#formatReportRow`:
  - For special requests (`is_special_request: true`), `check_out_location_mode` explicitly inherits `location_mode` (`log?.location_mode || 'ONSITE'`) when `check_out_location_mode` is null/empty, permanently eliminating the issue of check-out defaulting to `ONSITE`.
  - Check-out coordinates and location names safely inherit check-in values when unclosed.
- In `ReportsController.#resolveLocationMode`:
  - For special requests, check-out mode strictly inherits check-in mode when `check_out_location_mode` is not explicitly set (`this.#resolveLocationMode(rec, 'check_in') || 'ONSITE'`), fixing both new and historical records.

### 4. 2-Line Remarks Presentation Standard (Web, Print PDF, Excel)
- In `ReportsController.#resolveReportRemark`:
  - For special requests, generates 2-line output:
    - **Line 1**: `กรณีพิเศษ` (styled with amber badges on Web DOM, bold amber on Print PDF, and bracketed/stacked in Excel).
    - **Line 2**: Specific reason (with regex stripping of duplicate "กรณีพิเศษ" prefixes).
  - Seamlessly applied across Web DOM (`#buildSingleRowHtml`), Print PDF (`forPrintPdf`), and Excel export (`btnExportReportExcel` & `btnTemplateReportExcel`).

### 5. Mandatory Cache Auto-Stamping
- Executed `node ./.ai_map/vscode_ast_mapper.mjs`.
- Synchronized `buildId: 20261113_04d9fb32` across `version.json` and all 8 HTML files.

---

## Verification & Impact
- Comprehensive automated verification passed **252/252 assertions (100% success)** across 5 test suites:
  1. `qa_special_request_mode_verification.mjs` (83/83)
  2. `qa_adversarial_deep_audit.mjs` (19/19)
  3. `qa_reports_redesign_verification.mjs` (96/96)
  4. `qa_loca_v2_verification.mjs` (25/25)
  5. `qa_post_implementation_test.mjs` (29/29)
- JavaScript syntax check (`node --check`): **0 syntax errors**.
- Cache Version Sync: **100% matched across all 8 root HTML files**.
