# ADR 0030: Two-Line Remark Badge Rendering in Special Request Approvals Table

- **Date**: 2026-11-14
- **Status**: Accepted & Verified (`Build ID: 20261114_63a734d6`)
- **Task ID**: `PIPE-20261114-approvals-remark-two-line`
- **Linked Flows**: `FLOW_APPROVALS_01` (Special Requests Approvals Flow), `FLOW_SPECIAL_REQ_01` (Special Attendance Requests Flow)

---

## Context & Problem Statement
In `approvals.html` (`ApprovalsController.#buildRequestRowHtml`), special request records with both a request reason (e.g. `ปฏิบัติงานภารกิจเร่งด่วน`) and an offsite job type (e.g. `ปฏิบัติงานนอกสถานที่`) were concatenated onto a single line (`"ปฏิบัติงานภารกิจเร่งด่วน (ปฏิบัติงานนอกสถานที่)"`) inside `<span class="bma-badge bma-badge-indigo">`. Because `.bma-badge` in `assets/css/bma-theme.css` sets `white-space: nowrap; border-radius: 9999px;`, the remark badge stretched horizontally across the table.

---

## Decision & Implementation
1. **Surgical 2-Line Formatter in `ApprovalsController.js` (`#buildRequestRowHtml`, `#formatRemarkCellHtml`, `#escapeHtml`)**:
   - **Line 1**: Primary request reason (`ปฏิบัติงานภารกิจเร่งด่วน`) in `font-semibold break-words`.
   - **Line 2**: Offsite job type in parentheses (`(ปฏิบัติงานนอกสถานที่)`) in `text-[11px] font-medium opacity-90 break-words`, rendered only when `isOffsite` and a distinct offsite reason exists.
   - **Scoped CSS Only**: Left `.bma-badge` in `assets/css/bma-theme.css` untouched; used `bma-badge-indigo inline-flex flex-col items-start gap-0.5 px-2.5 py-1.5 rounded-xl text-xs leading-snug max-w-[240px] text-left whitespace-normal` directly in the cell HTML.
2. **Hardened Edge-Case Guards**:
   - **Dash / Empty Offsite Guard**: `hasValidOffsiteReason` prevents `offsite_reason: "-"` from falsely inferring `OFFSITE` when `location_mode` is null.
   - **Legacy Pre-Combined String Splitting & Deduplication**: Splits pre-combined offsite strings into 2 lines and deduplicates identical primary/offsite parts (e.g. `"ปฏิบัติงานนอกสถานที่ (ปฏิบัติงานนอกสถานที่)"` -> 1 line).
   - **WFH Protection**: Keeps standalone `"ปฏิบัติงานที่บ้าน (WFH)"` on 1 line (even when `offsite_reason` is `"WFH"`), while splitting combined `"ปฏิบัติงานภารกิจเร่งด่วน"` + `"ปฏิบัติงานที่บ้าน (WFH)"` into 2 lines.
   - **Onsite Purity**: Onsite requests strictly display 1 line and ignore stale `offsite_reason`.
   - **XSS Escaping**: Escapes all rendered text via `#escapeHtml()`.
3. **Mandatory Cache Version Sync**:
   - Ran `node ./.ai_map/vscode_ast_mapper.mjs` to stamp `buildId: 20261114_63a734d6` across `version.json`, all 8 HTML files, and `.ai_map/`.

---

## Verification Summary
- `node --check assets/js/controllers/ApprovalsController.js`: 0 errors
- `qa_real_instance_test.mjs`: 8 / 8 PASS (real `ApprovalsController` DOM rendering)
- `test_approvals_remark.mjs`: 21 / 21 PASS
- Regression suites (`qa_deep_adversarial_verification.mjs` 23/23, `qa_split_dropdowns_verification.mjs` 8/8, `qa_special_request_mode_verification.mjs` 83/83): 100% PASS
- `verify_cache_sync.mjs`: All 8 HTML files 100% synced with `version.json` (`20261114_63a734d6`)
