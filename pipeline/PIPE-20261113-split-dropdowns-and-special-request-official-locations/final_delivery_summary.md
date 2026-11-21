# Final Delivery Summary: Split Dropdowns & Official Locations for Onsite Special Requests

- **Task ID**: `PIPE-20261113-split-dropdowns-and-special-request-official-locations`
- **Build ID**: `20261113_96384181`
- **Target Branch**: `Loca-V2`
- **Target Schema**: `staging` (`Config.SUPABASE_SCHEMA = 'staging'`)
- **Public Schema**: Strictly untouched (100% Isolated)
- **Status**: Completed & Fully Verified (PASS)

---

## 1. Summary of Changes Implemented

### 1.1 Tri-Card System Settings (Tab 4: คำนำหน้า, ลักษณะงาน & หมายเหตุ)
- **Problem Solved**: Previously, offsite duties (e.g. WFH, อบรม) and administrative reasons (e.g. ลืมลงเวลา, อุปกรณ์ขัดข้อง) were combined in one shared `remarks` array, leading to inappropriate options appearing in normal check-in offsite dropdowns.
- **Solution**: Restructured Tab 4 into 3 dedicated Material Tailwind cards:
  1. **จัดการคำนำหน้าชื่อ** (`prefixListContainer`, `btnAddPrefix`)
  2. **จัดการลักษณะงานนอกสถานที่** (`offsiteJobTypeListContainer`, `btnAddOffsiteJobType`) -> maps to `settings.offsite_job_types`
  3. **จัดการเหตุผลลงเวลากรณีพิเศษ** (`specialReasonListContainer`, `btnAddSpecialReason`) -> maps to `settings.special_request_reasons`
- **Zero Breaking Changes**: `settings.remarks` is continuously synchronized to the union of both arrays, guaranteeing backward compatibility with all legacy features.
- **Iterative Schema Resilience**: `SettingsModel.updateSettings` implements a multi-column retry loop (up to 6 retries) that safely strips missing columns if Supabase migrations haven't run yet, storing updates in localStorage/sessionStorage.

### 1.2 Special Request Modal Form Reordering & Onsite Official Locations
- **Form Order Reorganized**:
  1. วันที่ปฏิบัติราชการ (`spWorkDate`)
  2. กะเวลา (`spShiftSelect` + `spCustomTimeContainer`)
  3. **เหตุผลคำขอกรณีพิเศษ (`spRemarkSelect`)**: Placed *before* location selection, populated from `settings.special_request_reasons`.
  4. **รูปแบบสถานที่ปฏิบัติราชการ**:
     - **ในสถานที่ (`ONSITE`)**: Shows Dropdown **เลือกสถานที่ราชการ** (`spOfficialLocationSelect`) listing only names from active `settings.official_locations` (e.g. "สำนักเทศกิจ"). Coordinates for both check-in and check-out are 100% locked to official coordinates with **strictly 0 jitter** and zero sensor latency.
     - **นอกสถานที่ (`OFFSITE`)**: Shows Dropdown **ลักษณะงานนอกสถานที่** (`spOffsiteReasonSelect`) from `settings.offsite_job_types` + GPS source (Current GPS / Map Pin). Checkout coordinates strictly reference the first coordinate (with optional jitter if enabled).
- **Normal Check-in Isolation**: When choosing "นอกสถานที่" on the check-in card, `#offsiteRemarkSelect` strictly displays `settings.offsite_job_types`. Administrative reasons never appear.

### 1.3 Reports & Approvals Harmonization
- **2-Line Remark Rendering**: Displays `[กรณีพิเศษ]` on Line 1, and `เหตุผล (ลักษณะงาน)` on Line 2 with duplicate parenthesis stripping (`ลืมลงเวลา (อบรม)` without duplicated tags).
- **Badge Harmonization**:
  - `ApprovalsController.js`: Renders `[ในสถานที่: <สถานที่>]` (green badge) or `[นอกสถานที่: <สถานที่>] (<ลักษณะงาน>)` (sky blue badge).
  - `ReportsController.js`: Renders `[ในสถานที่]` or `[นอกสถานที่]` badges consistently for check-in and check-out. Added inheritance so special requests never have mismatched badges between check-in and check-out.

---

## 2. Quality Assurance & Audit Results
- **Automated Test Suites**: **264 / 264 assertions passed (100% success rate)**
  - `qa_deep_adversarial_verification.mjs`: 23/23 PASSED
  - `qa_split_dropdowns_verification.mjs`: 8/8 PASSED
  - `qa_special_request_mode_verification.mjs`: 83/83 PASSED
  - `qa_reports_redesign_verification.mjs`: 96/96 PASSED
  - `qa_loca_v2_verification.mjs`: 25/25 PASSED
  - `qa_post_implementation_test.mjs`: 29/29 PASSED
- **Syntax Checks (`node --check`)**: 0 errors across all 7 modified JS files.
- **Cache Version Sync**: All 8 root HTML files stamped with `buildId: 20261113_96384181`.

---

## 3. Database Migration Script (`staging`)
File: `sql/migration_staging_split_dropdowns.sql`
Run in Supabase Dashboard SQL Editor for schema `staging`:
```sql
ALTER TABLE staging.system_settings
ADD COLUMN IF NOT EXISTS offsite_job_types JSONB DEFAULT '["ปฏิบัติงานนอกสถานที่", "อบรม/สัมมนา/ประชุมราชการ", "ปฏิบัติงานที่บ้าน (WFH)", "ปฏิบัติงานเวรประจำวัน", "อื่นๆ"]'::jsonb;

ALTER TABLE staging.system_settings
ADD COLUMN IF NOT EXISTS special_request_reasons JSONB DEFAULT '["ลืมลงเวลาปฏิบัติราชการ", "โทรศัพท์/อุปกรณ์ขัดข้อง", "ระบบอินเทอร์เน็ตขัดข้อง", "ปฏิบัติงานภารกิจเร่งด่วน", "อื่นๆ"]'::jsonb;

UPDATE staging.system_settings
SET 
  offsite_job_types = COALESCE(offsite_job_types, '["ปฏิบัติงานนอกสถานที่", "อบรม/สัมมนา/ประชุมราชการ", "ปฏิบัติงานที่บ้าน (WFH)", "ปฏิบัติงานเวรประจำวัน", "อื่นๆ"]'::jsonb),
  special_request_reasons = COALESCE(special_request_reasons, '["ลืมลงเวลาปฏิบัติราชการ", "โทรศัพท์/อุปกรณ์ขัดข้อง", "ระบบอินเทอร์เน็ตขัดข้อง", "ปฏิบัติงานภารกิจเร่งด่วน", "อื่นๆ"]'::jsonb);
```
