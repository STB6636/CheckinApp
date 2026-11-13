# Phase 0.1: Second Brain Notes & Past Pitfalls (RETRIEVE)

- **Task ID**: `PIPE-20261113-remove-special-request-btn-from-shift-card`
- **Date**: 2026-11-13
- **Linked Flows**: `FLOW_CHECKIN_01` (Checkin Layout Flow), `FLOW_SPECIAL_REQ_01` (Special Attendance Request Flow)

## 1. Relevant Architecture Decisions & Domain Rules
- **[[adr_002_mobile_checkin_sticky_drawer]]**:
  - สถาปัตยกรรมหน้าลงเวลามือถือแบบ Zero-Scroll ด้วย Sticky Bottom Bar, Two-Tier Banner และ Hamburger History Drawer
  - การลด Element ที่ไม่จำเป็นออกจากการ์ดหน้าหลักช่วยประหยัดพื้นที่แนวตั้ง (Vertical Real Estate) บนหน้าจอมือถือ ทำให้หน้าจออยู่ในมุมมอง Zero-Scroll พอดี
- **[[adr_004_checkin_viewport_lock_and_drawer]]**:
  - การรักษา DOM IDs 98 จุด เพื่อความเข้ากันได้ย้อนหลังและการผ่านการทดสอบแบบถดถอย (Regression Guard)
  - เมื่อนำ Element ออกจากมุมมองหลัก (Visual Layout) ให้ย้าย DOM ID ไปไว้ในส่วน `<!-- Hidden legacy containers to preserve 100% DOM IDs -->` เพื่อให้ Controller event listeners (`?.addEventListener`) และ Automated Regression Test Suites (`qa_loca_v2_verification.mjs`, `qa_cockpit_split_test.mjs`) ไม่พัง
- **[[rule_desktop_zero_scroll_and_gps_layout]]**:
  - มาตรฐานการจัดวางองค์ประกอบหน้าจอให้กะทัดรัด สะอาดตา และไม่เกิดการเลื่อนหลุดหน้าจอโดยไม่จำเป็น

## 2. Past Pitfalls & Traps to Avoid
1. **PITFALL 1: Complete Deletion Breaking Regression Test Suites**:
   - Automated tests like `qa_loca_v2_verification.mjs` and `qa_cockpit_split_test.mjs` verify that `checkin.html` includes `id="btnOpenSpecialRequestModal"`.
   - *Trap*: Deleting the tag entirely will cause test assertion failures.
   - *Mitigation*: Remove the visible container `<div class="pt-1"><button ...>...</button></div>` from `#checkinActionCard` and place `<button type="button" id="btnOpenSpecialRequestModal" class="hidden" aria-hidden="true"></button>` inside the designated `<!-- Hidden legacy containers to preserve 100% DOM IDs -->` at lines 484-486.
2. **PITFALL 2: Breaking Special Request Access for Users**:
   - Users still need to submit special requests when necessary.
   - *Verification*: Ensure special requests remain fully accessible via:
     1. Desktop: Tab Header button `#btnOpenSpecialFromDesktopTab` (line 615).
     2. Mobile: Hamburger History Drawer `#btnOpenSpecialRequestDrawer` (line 723).
