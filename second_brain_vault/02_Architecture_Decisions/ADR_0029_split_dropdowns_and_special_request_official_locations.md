# ADR 0029: Split Dropdowns (Offsite Job Types vs Special Request Reasons) and Official Locations Selector for Special Requests

- **Date**: 2026-11-13
- **Status**: Accepted & Verified (`Build ID: 20261113_96384181`)
- **Task ID**: `PIPE-20261113-split-dropdowns-and-special-request-official-locations`
- **Linked Flows**: `FLOW_SETTINGS_01` (System Settings & Organization Flow), `FLOW_CHECKIN_01` (Check-in & Shift Lifecycle), `FLOW_SPECIAL_REQ_01` (Special Attendance Requests Flow), `FLOW_REPORTS_01` (Attendance Reports Flow), `FLOW_APPROVALS_01` (Special Requests Approvals Flow)

---

## Context & Problem Statement
In the attendance management system, two critical architectural and UX limitations were identified:
1. **Dropdown Pollution Across Modules**:
   - The system previously stored both offsite work nature (e.g. "อบรม/สัมมนา/ประชุมราชการ", "ปฏิบัติงานที่บ้าน (WFH)") and administrative special request reasons (e.g. "ลืมลงเวลาปฏิบัติราชการ", "โทรศัพท์/อุปกรณ์ขัดข้อง") in a single shared array `system_settings.remarks`.
   - Consequently, when civil servants selected "นอกสถานที่" on the regular check-in card, administrative reasons like "ลืมลงเวลาปฏิบัติราชการ" leaked into the offsite dropdown.
2. **GPS Drift & Sensor Timeout for Onsite Special Requests**:
   - In `#modalSpecialRequest`, selecting "ในสถานที่" required live GPS sensor polling. When civil servants submitted retroactive requests or worked indoors, device GPS drift or timeout caused coordinates to deviate from official facility bounds or even triggered unwanted random jitter on check-out.

---

## Decision & Implementation

### 1. Database Schema & Data Modeling (`staging.system_settings`)
- Extended `staging.system_settings` with 2 dedicated `JSONB` columns:
  - `offsite_job_types`: List of official offsite work categories (เช่น ปฏิบัติงานนอกสถานที่, อบรม/สัมมนา/ประชุมราชการ, WFH, ปฏิบัติงานเวรประจำวัน, อื่นๆ)
  - `special_request_reasons`: List of special attendance request reasons (เช่น ลืมลงเวลาปฏิบัติราชการ, โทรศัพท์/อุปกรณ์ขัดข้อง, ระบบอินเทอร์เน็ตขัดข้อง, ปฏิบัติงานภารกิจเร่งด่วน, อื่นๆ)
- Prepared migration script [sql/migration_staging_split_dropdowns.sql](file:///f:/STB%20System/CheckinApp-UXUI/sql/migration_staging_split_dropdowns.sql).
- Implemented an iterative while-loop (up to 6 retries) in `SettingsModel.updateSettings` to safely strip consecutive missing columns if migrations haven't run yet, caching both arrays locally in `localStorage` and `sessionStorage`.
- Synchronized `remarks` strictly to the union of `offsite_job_types` and `special_request_reasons` for 100% backward compatibility (Zero Breaking Changes).

### 2. Tri-Card Layout in Admin Settings Tab 4 (`settings.html`)
- Renamed Tab 4 header to: **`4. คำนำหน้า, ลักษณะงาน & หมายเหตุ`**
- Restructured into 3 independent Material Tailwind cards:
  - **Card 1: จัดการคำนำหน้าชื่อ** (`prefixListContainer`, `btnAddPrefix`)
  - **Card 2: จัดการลักษณะงานนอกสถานที่** (`offsiteJobTypeListContainer`, `btnAddOffsiteJobType`)
  - **Card 3: จัดการเหตุผลลงเวลากรณีพิเศษ** (`specialReasonListContainer`, `btnAddSpecialReason`)
- Added complete add, edit, delete, and reorder (up/down) lifecycle in `SettingsController.js`.

### 3. Streamlined Special Request Form Order (`#modalSpecialRequest`)
- Restructured the form into a logical civic workflow:
  1. วันที่ปฏิบัติราชการ (`spWorkDate`)
  2. เลือกช่วงเวลาทำงาน (`spShiftSelect` + `spCustomTimeContainer`)
  3. **เลือกเหตุผลคำขอกรณีพิเศษ (`spRemarkSelect`)**: Placed before location selection, populated from `settings.special_request_reasons`.
  4. **รูปแบบสถานที่ปฏิบัติราชการ (`spModeOnsite` vs `spModeOffsite`)**:
     - **ในสถานที่ (`ONSITE`)**: Shows Dropdown **เลือกสถานที่ราชการ** (`spOfficialLocationSelect`) displaying only names from active `settings.official_locations` (e.g. "สำนักเทศกิจ") without extra coordinate summary cards. Check-in and check-out coordinates are 100% locked to the official facility with 0 GPS latency and **strictly 0 jitter**.
     - **นอกสถานที่ (`OFFSITE`)**: Shows Dropdown **ลักษณะงานนอกสถานที่** (`spOffsiteReasonSelect`) from `settings.offsite_job_types` and location source options (Current GPS vs Leaflet map pin). Check-out coordinates strictly reference the first (check-in) coordinate with optional jitter.

### 4. Normal Check-in Card Isolation
- In `checkin.html` / `CheckinController.js`:
  - When selecting "นอกสถานที่", `#offsiteRemarkSelect` populates strictly from `settings.offsite_job_types`.
  - Administrative reasons ("ลืมลงเวลา", "อุปกรณ์ขัดข้อง") are permanently filtered out.

### 5. Approvals & Reports Harmonization
- In `ApprovalsController.js`: Added visual badges `[ในสถานที่: <สถานที่>]` or `[นอกสถานที่: <สถานที่>] (<ลักษณะงาน>)` with parenthesis deduplication.
- In `ReportsController.js`: 2-line remarks display `[กรณีพิเศษ]` on Line 1 and `เหตุผล (ลักษณะงาน)` on Line 2 with regex duplicate-prefix stripping across Web DOM, Print PDF, and Excel exports.

---

## Verification & Impact
- Comprehensive automated verification passed **264/264 assertions (100% success rate)** across 6 test suites:
  1. `qa_deep_adversarial_verification.mjs` (23/23)
  2. `qa_split_dropdowns_verification.mjs` (8/8)
  3. `qa_special_request_mode_verification.mjs` (83/83)
  4. `qa_reports_redesign_verification.mjs` (96/96)
  5. `qa_loca_v2_verification.mjs` (25/25)
  6. `qa_post_implementation_test.mjs` (29/29)
- JavaScript syntax checks: **0 errors** across all modified files (`node --check`).
- Cache Version Sync: **100% matched (`buildId: 20261113_96384181`) across all 8 root HTML files**.
