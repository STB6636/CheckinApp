# Phase 0.1 — Second Brain Retrieval (`PIPE-20261104-loca-v2-onsite-offsite-nextstep`)

## Retrieved Architecture & Rules from `second_brain_vault/`
1. **`adr_002_mobile_checkin_sticky_drawer` & `adr_004_checkin_viewport_lock_and_drawer`**:
   - `checkin.html` uses a Zero-Scroll viewport lock (`100dvh`) and Off-canvas Slide Drawer (`#mobileDrawerPanel`).
   - All existing DOM IDs in `checkin.html` must be preserved so existing functionality (history tabs, special requests, desktop layout) never breaks.
2. **`rule_reports_hierarchical_org_filter` & `rule_users_hierarchical_org_filter_and_grouping`**:
   - Hierarchical 3-tier Organization Filter (`1. สำนักงาน/กอง` > `2. ส่วน/ฝ่าย` > `3. กลุ่มงาน`) is visible only to `SuperAdmin` and `Admin` with `visibility_level === 'bureau'` (`ขอบเขต สำนักงาน/กอง`).
3. **`rule_dual_gps_columns_and_jitter` & `FLOW_REPORTS_01`**:
   - `ReportsController` displays `rec.remark` in the `"หมายเหตุ"` column of `"ตารางรายงานสถานะ"`, and displays `check_in_location`/`check_in_lat`/`check_in_lng` in `"พิกัด GPS เข้างาน"` and `check_out_location`/`check_out_lat`/`check_out_lng` in `"พิกัด GPS ออกงาน"`.
4. **Backward Compatibility Strategy (Cloudflare Pages `main` vs GitHub Pages `Loca-V2`)**:
   - Both environments share the same Supabase database (`yicatrqogmcncfpqdyra`).
   - Therefore, any SQL schema migration (`sql/alter_v2_8_loca_v2_schema.sql`) MUST use `ADD COLUMN IF NOT EXISTS` with safe defaults (`official_locations JSONB DEFAULT '[]'::jsonb`, `location_mode TEXT DEFAULT 'ONSITE'`, `distance_from_official_meters DOUBLE PRECISION DEFAULT NULL`), and `SettingsModel` / `AttendanceModel` must include automatic fallback retry logic (stripping unknown columns if the SQL script hasn't been executed yet) + `localStorage` persistence so neither the old production app on Cloudflare Pages nor the new `Loca-V2` branch ever errors out.

