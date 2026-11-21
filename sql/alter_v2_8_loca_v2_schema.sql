-- ==============================================================================
-- สคริปต์ Migration Additive v2.8 - v2.10.0 (Loca-V2 & System Announcement)
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

-- 1.1 เพิ่มคอลัมน์แยกตัวเลือก ลักษณะงานนอกสถานที่ และ เหตุผลคำขอกรณีพิเศษ
ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS offsite_job_types JSONB NOT NULL 
DEFAULT '["ปฏิบัติงานนอกสถานที่", "อบรม/สัมมนา/ประชุมราชการ", "ปฏิบัติงานที่บ้าน (WFH)", "ปฏิบัติงานเวรประจำวัน", "อื่นๆ"]'::jsonb;

ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS special_request_reasons JSONB NOT NULL 
DEFAULT '["ลืมลงเวลาปฏิบัติราชการ", "โทรศัพท์/อุปกรณ์ขัดข้อง", "ระบบอินเทอร์เน็ตขัดข้อง", "ปฏิบัติงานภารกิจเร่งด่วน", "อื่นๆ"]'::jsonb;

-- 1.2 เพิ่มคอลัมน์ระบบประกาศระบบ 9 คอลัมน์ (v2.10.0)
ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS announcement_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS announcement_mode TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS announcement_start_date TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS announcement_end_date TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS announcement_title TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS announcement_body TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS announcement_image_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS announcement_drive_folder_id TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS announcement_updated_at TEXT DEFAULT '';

-- ตั้งค่าประกาศเริ่มต้น (Pre-seed) เฉพาะกรณียังไม่เคยตั้งค่าประกาศมาก่อน
UPDATE public.system_settings
SET
  announcement_enabled = true,
  announcement_mode = 'text',
  announcement_start_date = '2026-11-17',
  announcement_end_date = '',
  announcement_title = 'แจ้งปรับปรุง ระบบลงเวลาปฏิบัติราชการ (สตบ.)',
  announcement_body = E'- ปรับปรุงหน้าลงเวลาปฏิบัติราชการใหม่ ใช้ง่ายกว่าเดิม\n- เพิ่มเลือก "ในสถานที่/นอกสถานที่" และจำกัดรัศมีลงเวลากรณีใช้ในสถานที่ (ต้องอยู่ในพิกัดรัศมีเท่านั้นถึงลงเวลาได้)\n- ระบบผู้ดูแล Admin , เพิ่มฟังชั่น Sync ข้อมูล RealTime ไม่ต้องคอยรีเฟรชจออัพเดทข้อมูล\n- ระบบผู้ดูแล Admin , แก้ไขการพิมพ์ข้อมูลหน้ารายงาน ให้สวยงามและตารางต่อเนื่องไม่เว้นช่วงหน้ากระดาษ',
  announcement_image_url = COALESCE(announcement_image_url, ''),
  announcement_drive_folder_id = COALESCE(announcement_drive_folder_id, ''),
  announcement_updated_at = NOW()::TEXT
WHERE id = 1 AND COALESCE(announcement_updated_at, '') = '';

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

-- 3. เพิ่มคอลัมน์ใน public.attendance_logs รองรับโหมดปฏิบัติงาน ระยะทาง และข้อมูลขาออก
ALTER TABLE public.attendance_logs 
ADD COLUMN IF NOT EXISTS location_mode TEXT NOT NULL DEFAULT 'ONSITE';

ALTER TABLE public.attendance_logs 
ADD COLUMN IF NOT EXISTS distance_from_official_meters DOUBLE PRECISION DEFAULT NULL;

ALTER TABLE public.attendance_logs
ADD COLUMN IF NOT EXISTS offsite_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS check_out_location_mode TEXT DEFAULT 'ONSITE',
ADD COLUMN IF NOT EXISTS check_out_distance_from_official_meters DOUBLE PRECISION DEFAULT NULL,
ADD COLUMN IF NOT EXISTS check_out_offsite_reason TEXT DEFAULT NULL;

-- 4. เปิดใช้งาน Supabase Realtime Publication สำหรับตารางในสคีมา public
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_logs;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.personnel;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.user_accounts;
    EXCEPTION WHEN duplicate_object OR undefined_table THEN NULL;
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
  AND column_name IN (
    'official_locations',
    'enforce_geofence_radius',
    'offsite_job_types',
    'special_request_reasons',
    'announcement_enabled',
    'announcement_mode',
    'announcement_updated_at'
  );
