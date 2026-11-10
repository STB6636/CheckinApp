-- ==============================================================================
-- สคริปต์ Migration Additive v2.8 (Loca-V2: Onsite/Offsite & Official Locations & Geofence Toggle)
-- สรุปคำสั่ง SQL สะสมทั้งหมดสำหรับ Schema public เมื่อต้องการ Merge โค้ดเข้าสู่ main ในอนาคต
-- ไม่กระทบข้อมูลเดิม ไม่ลบตารางเดิม 100%
-- ==============================================================================

-- 1. เพิ่มคอลัมน์ official_locations และ enforce_geofence_radius ใน public.system_settings
ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS official_locations JSONB NOT NULL 
DEFAULT '[{"id":"LOC-001","name":"สำนักเทศกิจ","latitude":13.756331,"longitude":100.501765,"radius_meters":150,"is_active":true}]'::jsonb;

ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS enforce_geofence_radius BOOLEAN NOT NULL DEFAULT true;

UPDATE public.system_settings
SET enforce_geofence_radius = COALESCE(
  (category_colors->>'enforce_geofence_radius')::boolean,
  enforce_geofence_radius,
  true
);

-- 2. อัปเดต remarks ใน public.system_settings ให้รองรับโหมดปฏิบัติงานนอกสถานที่
UPDATE public.system_settings
SET remarks = (
    SELECT jsonb_agg(DISTINCT elem)
    FROM jsonb_array_elements_text(
        COALESCE(remarks, '[]'::jsonb) || 
        '["ปฏิบัติงานนอกสถานที่", "อบรม", "ประชุม", "ปฏิบัติงานที่บ้าน (WFH)", "ปฏิบัติงานเวรประจำวัน", "ลืมลงเวลาปฏิบัติราชการ", "โทรศัพท์/อุปกรณ์ขัดข้อง", "อื่นๆ"]'::jsonb
    ) AS elem
)
WHERE id = 1;

-- 3. เพิ่มคอลัมน์ใน public.attendance_logs รองรับโหมดปฏิบัติงานและระยะทาง
ALTER TABLE public.attendance_logs 
ADD COLUMN IF NOT EXISTS location_mode TEXT NOT NULL DEFAULT 'ONSITE';

ALTER TABLE public.attendance_logs 
ADD COLUMN IF NOT EXISTS distance_from_official_meters DOUBLE PRECISION DEFAULT NULL;

ALTER TABLE public.attendance_logs
ADD COLUMN IF NOT EXISTS work_mode TEXT DEFAULT 'onsite',
ADD COLUMN IF NOT EXISTS offsite_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS check_out_work_mode TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS check_out_offsite_reason TEXT DEFAULT NULL;

-- 4. เปิดใช้งาน Supabase Realtime Publication สำหรับตารางในสคีมา public
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_logs;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.personnel;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.holidays;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- 5. รีโหลด Schema Cache ของ PostgREST
NOTIFY pgrst, 'reload schema';

-- ยืนยันผลการ Migration
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'system_settings' 
  AND column_name IN ('official_locations', 'enforce_geofence_radius');
