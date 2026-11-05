# Phase 0.1 — Second Brain Knowledge Retrieval
Task: PIPE-20261105-loca-v2-material-tailwind-cards
Timestamp: 2026-11-05

## Context & Prior Decisions Retrieved
- `[[rule_loca_v2_ultra_zero_scroll_fullscreen_camera_and_modal_map]]`: สถาปัตยกรรม 2 คอลัมน์บน checkin.html: ฝั่งซ้ายคือ กล้อง Portrait 3:4 และฝั่งขวาคือ การ์ดพิกัด GPS (`#gpsSectionCard`) ที่มีความสูงสัมพันธ์กัน (`aspect-[3/4] max-h-[30dvh]`).
- `[[rule_multi_admin_realtime_sync_and_cache_defense]]`: สถาปัตยกรรมแคช 4 ชั้น และระบบ Realtime sync ป้องกันคำขอชนกันที่เพิ่งส่งมอบในรอบก่อนหน้าบน Branch `Loca-V2`.
- `[[adr_004_checkin_viewport_lock_and_drawer]]`: DOM IDs 9 จุดในการ์ดพิกัด GPS ที่ต้องรักษาอย่างเคร่งครัด (Zero Breaking Changes):
  1. `gpsSectionCard`
  2. `gpsRequirementBadge`
  3. `gpsLocationNameText`
  4. `gpsLocationName`
  5. `gpsCoordsText`
  6. `btnRefreshGps`
  7. `btnViewGpsMapModal`
  8. `googleMapEmbedWrapper`
  9. `linkViewGoogleMap`

## Material Tailwind Card Pattern Requirements
- Source component: Material Tailwind Login Card (`https://www.material-tailwind.com/docs/html/card`)
- Root structure: `relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-2xl w-full aspect-[3/4] max-h-[30dvh] overflow-hidden`
- Inset header: `relative mx-2.5 mt-2.5 py-2 px-3 rounded-xl shadow-md ...`
- Body: `flex-1 flex flex-col justify-center px-2.5 py-1 text-center`
- Docked footer: `px-2.5 pb-2.5 pt-0 mt-auto w-full space-y-1.5 shrink-0` (กำจัด Dead Space และทำให้ปุ่มยึดติดขอบล่าง 100%)

