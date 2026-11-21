# ADR 0026: Shift Selection Card Zero-Scroll Optimization via Special Request Button Removal & DOM ID Invariance

- **Date**: 2026-11-13
- **Status**: Accepted & Verified (`Build ID: 20261113_5994aba7`)
- **Task ID**: `PIPE-20261113-remove-special-request-btn-from-shift-card`
- **Linked Flows**: `FLOW_CHECKIN_01` (Check-in / Check-out Core Lifecycle), `FLOW_SPECIAL_REQ_01` (Special Attendance Request Submission), `FLOW_LAYOUT_01` (Responsive Cockpit Layout Architecture)

## Context & Problem Statement
In `checkin.html`, the Shift Selection Card (`#checkinActionCard`) previously contained a secondary button:
`#btnOpenSpecialRequestModal` ("ส่งคำขอลงเวลากรณีพิเศษ") located directly below the shift dropdown selector.

1. **Mobile Viewport Clutter**:
   - The primary purpose of `#checkinActionCard` during daily operational routines is shift selection and check-in/check-out execution.
   - Having an infrequent secondary action ("ส่งคำขอลงเวลากรณีพิเศษ") inside the primary card consumed ~45px of vertical space, conflicting with the Zero-Scroll Viewport Lock principles defined in ADR-002 and ADR-004.
2. **Redundant Access Points**:
   - Special request submission is already accessible from designated secondary navigation surfaces:
     - **Desktop PC**: `#btnOpenSpecialFromDesktopTab` (within the desktop tab navigation bar at L609).
     - **Mobile / Tablet**: `#btnOpenSpecialRequestDrawer` (inside the slide-out history drawer at L717).
3. **DOM ID Invariance & Regression Risk**:
   - Simply deleting the HTML tag would break event bindings in `CheckinController.js` (L2642: `btnOpenModal?.addEventListener('click', ...)`), fail automated testing suites (`qa_cockpit_split_test.mjs`, `qa_loca_v2_verification.mjs`), and violate ADR-004 (preservation of 98 core DOM IDs).

## Decision & Implementation

### 1. Surgical Removal from Visible Shift Card
- Removed `<div class="pt-1"><button type="button" id="btnOpenSpecialRequestModal" ...>ส่งคำขอลงเวลากรณีพิเศษ</button></div>` from inside `#checkinActionCard` (lines 467–474).
- The shift selection card is now streamlined to contain strictly the shift dropdown and its status indicator.

### 2. DOM ID Preservation (ADR-004 Invariance)
- Added `<button type="button" id="btnOpenSpecialRequestModal" class="hidden" aria-hidden="true"></button>` into the existing `<!-- Hidden legacy containers to preserve 100% DOM IDs -->` block (line 478).
- `document.getElementById('btnOpenSpecialRequestModal')` remains valid in the DOM tree, ensuring 100% safety for controller listener attachments and automated test runners without throwing runtime null reference errors.

### 3. Preserved Operational Access Points
- Special request flow remains fully operational via:
  - Desktop Tab Navigation: `#btnOpenSpecialFromDesktopTab`
  - Mobile History Drawer: `#btnOpenSpecialRequestDrawer`
  - Modal Container: `#modalSpecialRequest` (L738)

### 4. Mandatory Cache Version Synchronization
- Executed `node ./.ai_map/vscode_ast_mapper.mjs`.
- Stamped `buildId: 20261113_5994aba7` into `version.json` and synchronized `CURRENT_APP_BUILD = '20261113_5994aba7'` and `?v=20261113_5994aba7` across all 8 root HTML files (`index.html`, `checkin.html`, `dashboard.html`, `approvals.html`, `reports.html`, `personnel.html`, `settings.html`, `users.html`).

## Verification & Impact
- **Automated Verification**:
  - `qa_post_implementation_test.mjs`: 29/29 assertions passed (100%).
  - `qa_loca_v2_verification.mjs`: 25/25 assertions passed (100%).
  - JavaScript syntax audit: 0 errors across all controllers.
- **Visual & Ergonomic Benefit**:
  - Reclaimed ~45px of vertical screen space on mobile viewports.
  - Zero-scroll UX achieved without UI truncation on compact mobile devices.
