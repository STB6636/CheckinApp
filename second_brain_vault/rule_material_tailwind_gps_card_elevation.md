---
id: "rule_material_tailwind_gps_card_elevation"
title: "Domain Rule: มาตรฐานการ์ดพิกัด GPS สไตล์ Material Tailwind Inset Header และปุ่มล็อกขอบล่าง 100%"
type: "rule"
last_updated_phase: "PIPE-20261105-loca-v2-material-tailwind-cards"
flow_links: ["FLOW_CHECKIN_01", "FLOW_GPS_01", "FLOW_LAYOUT_01"]
---

# 📌 Domain Rule: มาตรฐานการ์ดพิกัด GPS สไตล์ Material Tailwind Inset Header และปุ่มล็อกขอบล่าง 100%

## 1. บริบทและปัญหาที่แก้ไข (Context & Problem Solved)
เดิมการ์ดพิกัด GPS (`#gpsSectionCard`) ใช้ `p-2.5` คลุมทั้งการ์ดและจัดวางด้วย `flex justify-between` ส่งผลให้:
1. เมื่อข้อความชื่อสถานที่สั้นหรือหน้าจอมีความสูงมาก ปุ่ม Action ทั้งสองจะลอยอยู่ตรงกลางการ์ดและเหลือช่องว่างสีขาว (Dead Space) ด้านล่าง
2. สไตล์ของการ์ดไม่กลมกลืนกับส่วนหัวของแอปและคอมโพเนนต์ร่วมสมัย

## 2. สถาปัตยกรรม Material Tailwind Card แบบดัดแปลง (Adapted Material Tailwind Architecture)
อ้างอิงจากโครงสร้าง [Material Tailwind Login Card](https://www.material-tailwind.com/docs/html/card) โดยปรับให้เข้ากับธีม Civic Emerald ของ กทม.:

### โครงสร้างหลัก (Root Container):
- ใช้คลาส: `bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/60 p-0 flex flex-col w-full aspect-[3/4] max-h-[30dvh] overflow-hidden`
- **หัวใจสำคัญ:** กำหนด `p-0` ที่ขอบนอก เพื่อให้คอนเทนต์ภายในควบคุมระยะ Margin/Padding ได้อย่างอิสระ 100%

### หัวการ์ดลอยนูนมน (Elevated Inset Header):
- ใช้คลาส: `relative mx-2.5 mt-2.5 py-2 px-3 rounded-xl bg-gradient-to-r from-[#00351B] to-[#00744B] text-white shadow-md shadow-emerald-950/20 flex items-center justify-between shrink-0`
- มีลูกเล่น `animate-ping` แสดงสถานะดาวเทียมพร้อมใช้งาน

### บอดี้กึ่งกลางการ์ด (Centered Card Body):
- ใช้คลาส: `flex-1 flex flex-col justify-center px-2.5 py-1 text-center my-auto`
- ภายในมีกล่องพื้นหลังมรกตอ่อน `bg-emerald-50/50 border border-emerald-200/60` กำจัดช่องว่าง Dead Space ได้หมดจด

### ส่วนท้ายล็อกติดขอบล่าง (Docked Bottom Footer):
- ใช้คลาส: `mt-auto px-2.5 pb-2.5 pt-0 space-y-1.5 shrink-0 w-full`
- `mt-auto` ใน `flex-col` ที่ไม่มี padding ล่างจากกล่องแม่ จะผลักปุ่มทั้งสองให้แนบชิดติดกับขอบล่างของการ์ดเสมอ (Flush to Bottom Edge) ไม่ว่าหน้าจอจะมีขนาดใด

## 3. การรักษาความเข้ากันได้ของระบบ (DOM IDs Compatibility)
ต้องรักษา ID ทั้งหมด 9 จุดไว้ครบถ้วนเสมอ:
1. `gpsSectionCard`
2. `gpsRequirementBadge`
3. `gpsLocationNameText`
4. `gpsLocationName`
5. `gpsCoordsText`
6. `btnRefreshGps`
7. `btnViewGpsMapModal`
8. `googleMapEmbedWrapper` (พร้อม `googleMapPlaceholder`, `googleMapRealtimeIframe`)
9. `linkViewGoogleMap`
