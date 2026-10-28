# Domain Rule: มาตรฐานการแจ้งเตือน SweetAlert2 สไตล์ Soft UI Dashboard (Creative Tim Tailwind)

- **Flow ID:** `FLOW_LAYOUT_01` & Cross-system Alerting (`UIHelpers.alert`, `UIHelpers.confirm`)
- **Reference:** [Creative Tim Soft UI Dashboard Tailwind SweetAlerts](https://www.creative-tim.com/learning-lab/tailwind/html/sweetAlerts/soft-ui-dashboard/)

## Design Specifications:
1. **Modal Popup Styling:**
   - ขอบมนพรีเมียม `rounded-3xl` พร้อม Padding นุ่มนวล `p-6 sm:p-7`
   - เงาฟุ้งมิติสูง `shadow-2xl`
   - ขอบเรืองแสงโปร่งใสตามสถานะ (เช่น `border-emerald-500/20` สำหรับ success)
   - กระจกฝ้าเบลอ `bg-white/95 dark:bg-slate-900/95 backdrop-blur-md`
2. **Buttons (`buttonsStyling: false`):**
   - ปุ่มยืนยัน `confirmButton`:
     - โค้งมน `rounded-xl`
     - เงามิติ Soft Shadow: `shadow-soft-md hover:shadow-soft-xs`
     - อนิเมชันขยายปุ่มเมื่อชี้เมาส์: `hover:scale-102 active:opacity-85`
     - การไล่สี Gradient ตามสถานะ:
       - `success`: `bg-gradient-to-tl from-[#00744B] to-emerald-500`
       - `error`: `bg-gradient-to-tl from-rose-600 to-red-500`
       - `warning`: `bg-gradient-to-tl from-amber-500 to-orange-400`
       - `info`: `bg-gradient-to-tl from-[#0971CE] to-sky-400`
3. **SweetAlert2 Icon Skinning:**
   - ปรับเส้นวงกลมและ Checkmark ของ `swal2-success` ให้เป็นโทนสีมรกต `#10B981` (โหมดสว่าง) และ `#34D399` (โหมดถนอมสายตา) เพื่อความสมบูรณ์แบบในการแสดงผล
