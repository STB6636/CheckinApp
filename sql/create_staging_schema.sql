-- ==============================================================================
-- สคริปต์สร้าง Schema staging และคัดลอกข้อมูลทั้งหมดจาก public 100% (Loca-V2 Isolated Testing)
-- รันสคริปต์นี้ใน Supabase SQL Editor
-- หมายเหตุ: หลังรันสคริปต์นี้ ให้ไปที่ Supabase Dashboard > Settings > API > "Exposed schemas"
--          แล้วเพิ่ม "staging" ต่อจาก "public" เพื่อให้ Client เข้าถึง Schema staging ได้
-- ==============================================================================

-- 1. สร้าง Schema staging
CREATE SCHEMA IF NOT EXISTS staging;

-- 2. สร้างตารางทั้ง 4 ใน Schema staging โดยโคลนโครงสร้าง ดัชนี และ Constraints ทั้งหมดจาก public
CREATE TABLE IF NOT EXISTS staging.system_settings (LIKE public.system_settings INCLUDING ALL);
CREATE TABLE IF NOT EXISTS staging.personnel (LIKE public.personnel INCLUDING ALL);
CREATE TABLE IF NOT EXISTS staging.user_accounts (LIKE public.user_accounts INCLUDING ALL);
CREATE TABLE IF NOT EXISTS staging.attendance_logs (LIKE public.attendance_logs INCLUDING ALL);

-- 3. คัดลอกข้อมูลเดิมทั้งหมด 100% จาก public มายัง staging (ผู้ใช้ไม่ต้องกรอกข้อมูลใหม่)
INSERT INTO staging.system_settings SELECT * FROM public.system_settings ON CONFLICT (id) DO NOTHING;
INSERT INTO staging.personnel SELECT * FROM public.personnel ON CONFLICT (id) DO NOTHING;
INSERT INTO staging.user_accounts SELECT * FROM public.user_accounts ON CONFLICT (id) DO NOTHING;
INSERT INTO staging.attendance_logs SELECT * FROM public.attendance_logs ON CONFLICT (id) DO NOTHING;

-- 4. เพิ่มคอลัมน์ใหม่สำหรับฟังก์ชันสถานที่และรัศมี (Loca-V2) ใน staging.system_settings
ALTER TABLE staging.system_settings 
ADD COLUMN IF NOT EXISTS official_locations JSONB NOT NULL 
DEFAULT '[{"id":"LOC-001","name":"สำนักเทศกิจ","latitude":13.756331,"longitude":100.501765,"radius_meters":150,"is_active":true}]'::jsonb;

ALTER TABLE staging.system_settings 
ADD COLUMN IF NOT EXISTS enforce_geofence_radius BOOLEAN NOT NULL DEFAULT true;

UPDATE staging.system_settings
SET enforce_geofence_radius = COALESCE(
  (category_colors->>'enforce_geofence_radius')::boolean,
  enforce_geofence_radius,
  true
);

-- อัปเดต remarks ใน staging.system_settings ให้มีตัวเลือกสำหรับโหมดนอกสถานที่ครบถ้วน
UPDATE staging.system_settings
SET remarks = (
    SELECT jsonb_agg(DISTINCT elem)
    FROM jsonb_array_elements_text(
        COALESCE(remarks, '[]'::jsonb) || 
        '["ปฏิบัติงานนอกสถานที่", "อบรม", "ประชุม", "ปฏิบัติงานที่บ้าน (WFH)", "ปฏิบัติงานเวรประจำวัน", "ลืมลงเวลาปฏิบัติราชการ", "โทรศัพท์/อุปกรณ์ขัดข้อง", "อื่นๆ"]'::jsonb
    ) AS elem
)
WHERE id = 1;

-- 5. เพิ่มคอลัมน์ใหม่สำหรับบันทึกโหมดและระยะทางใน staging.attendance_logs
ALTER TABLE staging.attendance_logs 
ADD COLUMN IF NOT EXISTS location_mode TEXT NOT NULL DEFAULT 'ONSITE';

ALTER TABLE staging.attendance_logs 
ADD COLUMN IF NOT EXISTS distance_from_official_meters DOUBLE PRECISION DEFAULT NULL;

ALTER TABLE staging.attendance_logs
ADD COLUMN IF NOT EXISTS work_mode TEXT DEFAULT 'onsite',
ADD COLUMN IF NOT EXISTS offsite_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS check_out_work_mode TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS check_out_offsite_reason TEXT DEFAULT NULL;

-- 6. เปิดใช้งาน Row Level Security (RLS) และกำหนดสิทธิ์การเข้าถึงสำหรับ Schema staging
ALTER TABLE staging.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.attendance_logs ENABLE ROW LEVEL SECURITY;

-- สร้าง RLS Policies อนุญาตให้อ่าน/เขียนได้ตามเงื่อนไขแอปพลิเคชัน
DROP POLICY IF EXISTS "staging_system_settings_all" ON staging.system_settings;
CREATE POLICY "staging_system_settings_all" ON staging.system_settings FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "staging_personnel_all" ON staging.personnel;
CREATE POLICY "staging_personnel_all" ON staging.personnel FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "staging_user_accounts_all" ON staging.user_accounts;
CREATE POLICY "staging_user_accounts_all" ON staging.user_accounts FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "staging_attendance_logs_all" ON staging.attendance_logs;
CREATE POLICY "staging_attendance_logs_all" ON staging.attendance_logs FOR ALL TO public USING (true) WITH CHECK (true);

-- 7. Grant สิทธิ์การใช้งานให้ anon, authenticated, service_role เข้าถึง Schema staging และตารางทั้งหมด
GRANT USAGE ON SCHEMA staging TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA staging TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA staging TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA staging TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA staging GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA staging GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA staging GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ตรวจสอบความถูกต้อง
SELECT count(*) AS total_staging_personnel FROM staging.personnel;
SELECT count(*) AS total_staging_settings FROM staging.system_settings;

-- 8. เปิดใช้งาน Supabase Realtime Publication สำหรับตารางในสคีมา staging
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE staging.attendance_logs;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE staging.system_settings;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE staging.personnel;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE staging.user_accounts;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END;
  END IF;
END $$;

-- รีโหลด Schema Cache ของ PostgREST
NOTIFY pgrst, 'reload schema';
