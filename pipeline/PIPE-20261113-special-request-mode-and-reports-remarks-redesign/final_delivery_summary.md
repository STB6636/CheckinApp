# Final Delivery Summary: PIPE-20261113-special-request-mode-and-reports-remarks-redesign

- **Task Name**: ปรับปรุงฟอร์มคำขอลงเวลากรณีพิเศษ [ในสถานที่/นอกสถานที่], อ้างอิงพิกัดแรกขาออก และแสดงผลหมายเหตุ 2 บรรทัด (กรณีพิเศษ + เหตุผล)
- **Task ID**: `PIPE-20261113-special-request-mode-and-reports-remarks-redesign`
- **Target Branch**: `Loca-V2`
- **Build ID**: `20261113_04d9fb32`
- **Architectural Reference**: ADR-0028 (`second_brain_vault/02_Architecture_Decisions/ADR_0028_special_request_mode_and_reports_remarks_redesign.md`)
- **Status**: Completed & Verified (252/252 Automated Test Assertions Passed, 100% Success)

---

## 1. Summary of Changes
1. **Special Request Modal (`checkin.html`)**:
   - Added Segmented Mode Toggle: `[ในสถานที่]` (`spModeOnsite`) vs `[นอกสถานที่]` (`spModeOffsite`).
   - When Onsite: displays official workplace info ("สำนักเทศกิจ") and suppresses custom map search.
   - When Offsite: displays `ลักษณะงานนอกสถานที่` dropdown (`spOffsiteReasonSelect`) and location source options (`spGpsModeCurrent` vs `spGpsModeCustom` with Leaflet map).
   - Preserved 100% of existing DOM IDs.
2. **CheckinController (`assets/js/controllers/CheckinController.js`)**:
   - Implemented bidirectional smart synchronization: switching to Onsite defaults to `"ลืมลงเวลาปฏิบัติราชการ"`, switching to Offsite defaults to `"ปฏิบัติงานนอกสถานที่"`.
   - Filtered non-work reasons from `spOffsiteReasonSelect`.
   - Updated `#handleSubmitSpecialRequest` to pass `location_mode`, `check_out_location_mode`, `offsite_reason`, and `check_out_offsite_reason` to `AttendanceModel.submitSpecialRequest`.
3. **AttendanceModel (`assets/js/models/AttendanceModel.js`)**:
   - Updated `submitSpecialRequest`:
     * Check-out coordinates strictly reference first (check-in) coordinates.
     * When `settings.randomize_gps_checkout` is enabled, check-out coordinates jitter from the first coordinate using `AttendanceModel.resolveJitteredCheckoutWithLocation`.
     * Persists `location_mode`, `check_out_location_mode`, `offsite_reason`, `check_out_offsite_reason`, `distance_from_official_meters`, `check_out_distance_from_official_meters`.
   - Updated `#formatReportRow`:
     * For special requests, `check_out_location_mode` inherits `location_mode` (`log?.location_mode || 'ONSITE'`) when null/empty, permanently eliminating the issue of check-out defaulting to `ONSITE`.
   - Updated `getSpecialRequests`: includes new columns in select query.
4. **ReportsController (`assets/js/controllers/ReportsController.js`)**:
   - Updated `#resolveReportRemark`:
     * Special requests render 2 lines: Line 1: `กรณีพิเศษ` (amber badge), Line 2: reason from `rec.remark` (with regex stripping of duplicate prefixes).
   - Updated `#resolveLocationMode`:
     * For special requests, check-out mode strictly inherits check-in mode when `check_out_location_mode` is null/empty (`inMode || 'ONSITE'`), fixing both new and historical records.
   - Applied across Web DOM, Print PDF, and Excel export.
5. **Mandatory Cache Version Sync**:
   - Auto-stamped `buildId: 20261113_04d9fb32` across `version.json` and all 8 root HTML files.

---

## 2. QA Verification Results (252/252 Assertions Passed)
- `qa_special_request_mode_verification.mjs`: **83/83 passed (100%)**
- `qa_adversarial_deep_audit.mjs`: **19/19 passed (100%)**
- `qa_reports_redesign_verification.mjs`: **96/96 passed (100%)**
- `qa_loca_v2_verification.mjs`: **25/25 passed (100%)**
- `qa_post_implementation_test.mjs`: **29/29 passed (100%)**
- JavaScript Syntax Checks: **0 syntax errors** (`node --check`).
- Cache Version Sync Audit: **100% matched across all 8 root HTML files**.
