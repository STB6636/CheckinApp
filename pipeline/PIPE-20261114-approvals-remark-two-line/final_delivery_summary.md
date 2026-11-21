# Final Delivery Summary: Two-Line Remark Column in Approvals Table

- **Task ID**: `PIPE-20261114-approvals-remark-two-line`
- **Build ID**: `20261114_63a734d6`
- **Target Branch**: `Loca-V2`
- **Status**: Completed, QA Verified (`PASS`), Committed & Pushed to `origin/Loca-V2`

## 1. Summary of Changes
1. **`assets/js/controllers/ApprovalsController.js`**:
   - Updated `#buildRequestRowHtml(req, indexNo)` and added `#formatRemarkCellHtml(req, isOffsite)` + `#escapeHtml(str)` to display the "หมายเหตุ" column in 2 lines when `isOffsite` and an offsite job type exists:
     - Line 1: Primary reason (e.g. `ปฏิบัติงานภารกิจเร่งด่วน`)
     - Line 2: Offsite job type in parentheses (e.g. `(ปฏิบัติงานนอกสถานที่)`)
   - Left global `.bma-badge` in `assets/css/bma-theme.css` untouched; used scoped `bma-badge-indigo` with `whitespace-normal`, `break-words`, and `max-w-[240px]` compatible with both Light and Dark mode.
   - Handled legacy pre-combined strings, duplicate-parenthesis unwrapping, `WFH` standalone protection, `ONSITE` purity (`offsite_reason: "-"` or stale values ignored), and XSS escaping.
2. **Cache Version & Codebase Map Sync**:
   - Ran `node ./.ai_map/vscode_ast_mapper.mjs` -> stamped `buildId: 20261114_63a734d6` in `version.json`, all 8 root HTML files, and `.ai_map/`.
3. **Second Brain Ingestion**:
   - Added `second_brain_vault/02_Architecture_Decisions/ADR_0030_approvals_two_line_remark_badge.md` and linked in `second_brain_vault/00_INDEX_MOC.md`.

## 2. Verification Results
- `node --check assets/js/controllers/ApprovalsController.js`: **0 errors**
- `qa_real_instance_test.mjs`: **8 / 8 PASS**
- `test_approvals_remark.mjs`: **21 / 21 PASS**
- `qa_deep_adversarial_verification.mjs`: **23 / 23 PASS**
- `qa_split_dropdowns_verification.mjs`: **8 / 8 PASS**
- `qa_special_request_mode_verification.mjs`: **83 / 83 PASS**
- `verify_cache_sync.mjs`: **8 / 8 HTML files synced to `20261114_63a734d6`**
