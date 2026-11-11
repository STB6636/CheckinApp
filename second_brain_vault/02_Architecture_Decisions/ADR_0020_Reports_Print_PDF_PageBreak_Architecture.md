# ADR 0020: Reports Print PDF Pagination & Paged Media Architecture

- **Date**: 2026-11-11
- **Status**: Accepted & Verified (`Build ID: 20261111_da291023`)
- **Task ID**: `PIPE-20261111-reports-print-pdf-pagebreak-fix`
- **Linked Flows**: `FLOW_REPORTS_01` (Attendance Reports, Tag Filtering & Print/Export Flow)

## Context & Problem Statement
When printing attendance reports in landscape A4 (`window.print()` / Save as PDF), users identified a severe pagination bug:
On multi-page reports (e.g. 243 records in "ไม่ลงเวลา"), the formal report header:
`[รายงานการลงเวลาปฏิบัติราชการ สำนักเทศกิจ สังกัด: สำนักงานตรวจและบังคับการ • ประจำวันที่ 11 พฤศจิกายน 2569]`
was isolated on Page 1 completely by itself, followed by ~90% empty white space. The table data did not begin until Page 2.

### Root Cause Analysis
1. In `assets/js/core/UIHelpers.js` (`printReportInNewTab`), `.tag-section-block` was styled with `page-break-inside: avoid;`.
2. In `assets/js/controllers/ReportsController.js`, `<div class="tag-section-block">` wrapped both the section title and the entire `<table>` containing all 243 rows.
3. Because 243 rows cannot fit in the remaining height of Page 1 under the `.report-header`, Chromium's CSS Paged Media layout engine inserted a page break *before* `.tag-section-block`, pushing the entire table to Page 2.
4. Furthermore, table headers (`thead`) were not explicitly enforced to repeat on subsequent pages, table rows (`tr`) risked cross-page horizontal split, and section banners (`.day-section-banner`, `.tag-section-title`) lacked `break-after: avoid;`.

## Decision & Implementation
1. **Container Paging Unlock (`page-break-inside: auto`)**:
   - In `UIHelpers.js`, updated `.tag-section-block` to `page-break-inside: auto; break-inside: auto;`.
   - Updated `table` to `page-break-inside: auto; break-inside: auto;`.
   - Result: Table rows immediately follow the `.report-header` on Page 1, filling the available vertical space (18–22 rows on Page 1) without artificial white space gaps.
2. **Header Binding (`break-after: avoid`)**:
   - Added `page-break-after: avoid; break-after: avoid;` to `.report-header`, `.tag-section-title`, `.day-section-banner`, `.group-row`, and `.sub-group-row`.
   - Result: Report titles and department groupings are never orphaned at the bottom of a page without data rows beneath them.
3. **Repeating Column Headers & Row Integrity**:
   - Added `thead { display: table-header-group; page-break-inside: avoid; break-inside: avoid; page-break-after: avoid; break-after: avoid; }`.
   - Added `tr { page-break-inside: avoid; break-inside: avoid; }`.
   - Result: Column headers (ลำดับ, ชื่อ-นามสกุล, ตำแหน่ง, เวลาเข้างาน, เวลาออกงาน...) repeat automatically at the top of Pages 2..12, and individual rows are never sliced horizontally.
4. **Normalized A4 Landscape Margins**:
   - Standardized `@page { size: A4 landscape; margin: 8mm 10mm; }` and `@media print { body { margin: 0; padding: 0; } }`.

## Verification & Audit
- Validated with 4 automated test suites covering syntax, paged media rules, 250-row multi-page dataset generation, and popup-blocker error handling.
- Mandatory Cache Version Sync confirmed matching `buildId: 20261111_da291023` across `version.json` and all 8 root HTML files.
- Main-diff verified zero unrelated changes.
