-- ==============================================================================
-- สคริปต์ Migration ฉบับสมบูรณ์: ซิงก์ Schema public ให้ครบเทียบเท่า staging (Loca-V2 + v2.8 - v2.11.0)
-- Task ID: PIPE-20261121-switch-schema-staging-to-public
-- รันสคริปต์นี้ใน Supabase Dashboard > SQL Editor (โครงการ yicatrqogmcncfpqdyra)
-- คุณสมบัติ: 100% Additive & Idempotent (ไม่ลบตาราง ไม่ลบแถว ไม่ทับข้อมูลเดิม)
-- ==============================================================================

-- ==============================================================================
-- ส่วนที่ 1: เพิ่มคอลัมน์ที่ขาดทั้งหมด 13 คอลัมน์ใน public.system_settings (29 -> 42 คอลัมน์)
-- ==============================================================================

-- 1.1 พิกัดจุดเช็กอินอย่างเป็นทางการ และสวิตช์บังคับรัศมี Geofence (v2.8)
ALTER TABLE public.system_settings
  ADD COLUMN IF NOT EXISTS official_locations JSONB NOT NULL
    DEFAULT '[{"id":"LOC-289985","name":"สำนักเทศกิจ","latitude":13.738721075492425,"longitude":100.49554097825852,"radius_meters":150,"is_active":true}]'::jsonb,
  ADD COLUMN IF NOT EXISTS enforce_geofence_radius BOOLEAN NOT NULL DEFAULT true;

UPDATE public.system_settings
SET enforce_geofence_radius = COALESCE(
  CASE
    WHEN lower(COALESCE(category_colors->>'enforce_geofence_radius', '')) IN ('true', 'false')
      THEN (category_colors->>'enforce_geofence_radius')::boolean
    ELSE NULL
  END,
  enforce_geofence_radius,
  true
);

-- 1.2 แยกตัวเลือกลักษณะงานนอกสถานที่ และเหตุผลคำขอกรณีพิเศษ (v2.9)
ALTER TABLE public.system_settings
  ADD COLUMN IF NOT EXISTS offsite_job_types JSONB NOT NULL
    DEFAULT '["ปฏิบัติงานนอกสถานที่", "อบรม/สัมมนา/ประชุมราชการ", "ปฏิบัติงานที่บ้าน (WFH)", "ปฏิบัติงานเวรประจำวัน", "อื่นๆ"]'::jsonb,
  ADD COLUMN IF NOT EXISTS special_request_reasons JSONB NOT NULL
    DEFAULT '["ลืมลงเวลาปฏิบัติราชการ", "โทรศัพท์/อุปกรณ์ขัดข้อง", "ระบบอินเทอร์เน็ตขัดข้อง", "ปฏิบัติงานภารกิจเร่งด่วน", "อื่นๆ"]'::jsonb;

-- 1.3 คอลัมน์ระบบประกาศระบบ 9 คอลัมน์ (v2.10.0)
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

-- ตั้งค่าประกาศเริ่มต้น (Pre-seed) แบบ Idempotent เฉพาะเมื่อยังไม่เคยมี announcement_updated_at
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

-- 1.4 ผสานตัวเลือก remarks เดิมของ id = 1 ให้รองรับโหมดปฏิบัติงานนอกสถานที่ (Union แบบไม่ซ้ำ)
UPDATE public.system_settings
SET remarks = (
  SELECT jsonb_agg(DISTINCT elem)
  FROM jsonb_array_elements_text(
    COALESCE(remarks, '[]'::jsonb) ||
    '["ปฏิบัติงานนอกสถานที่", "อบรม", "ประชุม", "ปฏิบัติงานที่บ้าน (WFH)", "ปฏิบัติงานเวรประจำวัน", "ลืมลงเวลาปฏิบัติราชการ", "โทรศัพท์/อุปกรณ์ขัดข้อง", "อื่นๆ"]'::jsonb
  ) AS elem
)
WHERE id = 1;

-- ==============================================================================
-- ส่วนที่ 2: เพิ่มคอลัมน์ที่ขาดทั้งหมด 15 คอลัมน์ใน public.attendance_logs (25 -> 40 คอลัมน์)
-- ==============================================================================

-- 2.1 คอลัมน์ Loca-V2 (6 คอลัมน์)
-- สำคัญมาก: location_mode และ check_out_location_mode ต้องใช้ DEFAULT NULL (ห้ามใช้ NOT NULL DEFAULT 'ONSITE')
-- เพื่อไม่ให้ข้อมูลประวัติเดิมทั้งหมด (691 แถว) ถูกบังคับติดป้าย 'ONSITE' ผิดพลาด
ALTER TABLE public.attendance_logs
  ADD COLUMN IF NOT EXISTS location_mode TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS distance_from_official_meters DOUBLE PRECISION DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS offsite_reason TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS check_out_location_mode TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS check_out_distance_from_official_meters DOUBLE PRECISION DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS check_out_offsite_reason TEXT DEFAULT NULL;

-- 2.2 คอลัมน์ระบบคำขอแก้ไขเวลาเข้า-ออกงาน v2.11.0 (9 คอลัมน์)
ALTER TABLE public.attendance_logs
  ADD COLUMN IF NOT EXISTS correction_status TEXT
    CHECK (correction_status IN ('none', 'pending', 'approved', 'rejected'))
    NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS correction_requested_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS correction_request_reason TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS correction_reviewed_by UUID DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS correction_reviewed_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS correction_reject_reason TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS correction_original_check_in TIME WITHOUT TIME ZONE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS correction_original_check_out TIME WITHOUT TIME ZONE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS correction_original_status TEXT DEFAULT NULL;

-- ==============================================================================
-- ส่วนที่ 3: Foreign Key & Partial Index สำหรับระบบคำขอแก้ไขเวลา
-- ==============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_public_attendance_correction_reviewer'
      AND conrelid = 'public.attendance_logs'::regclass
  ) THEN
    ALTER TABLE public.attendance_logs
      ADD CONSTRAINT fk_public_attendance_correction_reviewer
      FOREIGN KEY (correction_reviewed_by)
      REFERENCES public.user_accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_public_attendance_correction_status
  ON public.attendance_logs (correction_status, work_date DESC)
  WHERE correction_status <> 'none';

-- ==============================================================================
-- ส่วนที่ 4: คำอธิบายคอลัมน์ (COMMENT ON COLUMN)
-- ==============================================================================

COMMENT ON COLUMN public.system_settings.official_locations IS 'รายการพิกัดสถานที่ปฏิบัติราชการอย่างเป็นทางการและรัศมี Geofence (เมตร)';
COMMENT ON COLUMN public.system_settings.enforce_geofence_radius IS 'สวิตช์บังคับตรวจสอบรัศมี Geofence เมื่อลงเวลาในสถานที่';
COMMENT ON COLUMN public.system_settings.offsite_job_types IS 'รายการตัวเลือกลักษณะงานนอกสถานที่ (เช่น อบรม, ประชุม, WFH)';
COMMENT ON COLUMN public.system_settings.special_request_reasons IS 'รายการตัวเลือกเหตุผลในการยื่นคำขอลงเวลากรณีพิเศษ (เช่น ลืมลงเวลา, อุปกรณ์ขัดข้อง)';
COMMENT ON COLUMN public.system_settings.announcement_enabled IS 'สวิตช์เปิด/ปิดการแสดงป๊อปอัปประกาศระบบ';
COMMENT ON COLUMN public.system_settings.announcement_mode IS 'รูปแบบประกาศ: text (ข้อความ) หรือ image (รูปภาพแทนตัวหนังสือ)';
COMMENT ON COLUMN public.system_settings.announcement_start_date IS 'วันที่เริ่มแสดงประกาศ (YYYY-MM-DD เวลาไทย UTC+7)';
COMMENT ON COLUMN public.system_settings.announcement_end_date IS 'วันที่สิ้นสุดประกาศ (YYYY-MM-DD เว้นว่าง = แสดงต่อเนื่อง)';
COMMENT ON COLUMN public.system_settings.announcement_title IS 'หัวข้อประกาศ (Head)';
COMMENT ON COLUMN public.system_settings.announcement_body IS 'รายละเอียดประกาศ (Body)';
COMMENT ON COLUMN public.system_settings.announcement_image_url IS 'ลิงก์รูปภาพประกาศ (ใช้เมื่อ announcement_mode = image)';
COMMENT ON COLUMN public.system_settings.announcement_drive_folder_id IS 'รหัส/ลิงก์โฟลเดอร์ Google Drive เก็บรูปประกาศระบบ';
COMMENT ON COLUMN public.system_settings.announcement_updated_at IS 'Timestamp รอบประกาศล่าสุด สำหรับนับการรับทราบครั้งเดียวต่อ 1 รอบประกาศ';

COMMENT ON COLUMN public.attendance_logs.location_mode IS 'โหมดสถานที่ขาเข้า: ONSITE, OFFSITE หรือ NULL (ข้อมูลประวัติเดิม)';
COMMENT ON COLUMN public.attendance_logs.distance_from_official_meters IS 'ระยะห่างจากจุดพิกัดอย่างเป็นทางการตอนลงเวลาเข้างาน (เมตร)';
COMMENT ON COLUMN public.attendance_logs.offsite_reason IS 'เหตุผล/ลักษณะงานเมื่อลงเวลาเข้างานนอกสถานที่';
COMMENT ON COLUMN public.attendance_logs.check_out_location_mode IS 'โหมดสถานที่ขาออก: ONSITE, OFFSITE หรือ NULL';
COMMENT ON COLUMN public.attendance_logs.check_out_distance_from_official_meters IS 'ระยะห่างจากจุดพิกัดอย่างเป็นทางการตอนลงเวลาออกงาน (เมตร)';
COMMENT ON COLUMN public.attendance_logs.check_out_offsite_reason IS 'เหตุผล/ลักษณะงานเมื่อลงเวลาออกงานนอกสถานที่';
COMMENT ON COLUMN public.attendance_logs.correction_status IS 'สถานะคำขอแก้ไขเวลา: none, pending, approved, rejected';
COMMENT ON COLUMN public.attendance_logs.correction_requested_at IS 'วันเวลาที่ผู้ใช้งานส่งคำขอแก้ไขเวลา';
COMMENT ON COLUMN public.attendance_logs.correction_request_reason IS 'เหตุผลการขอแก้ไขเวลา';
COMMENT ON COLUMN public.attendance_logs.correction_reviewed_by IS 'รหัสผู้ดูแลระบบที่พิจารณาคำขอแก้ไขเวลา';
COMMENT ON COLUMN public.attendance_logs.correction_reviewed_at IS 'วันเวลาที่พิจารณาคำขอแก้ไขเวลา';
COMMENT ON COLUMN public.attendance_logs.correction_reject_reason IS 'เหตุผลที่ไม่อนุมัติคำขอแก้ไขเวลา (ถ้ามี)';
COMMENT ON COLUMN public.attendance_logs.correction_original_check_in IS 'Snapshot เวลาเข้างานเดิมก่อนถูกแก้ไข';
COMMENT ON COLUMN public.attendance_logs.correction_original_check_out IS 'Snapshot เวลาออกงานเดิมก่อนถูกแก้ไข';
COMMENT ON COLUMN public.attendance_logs.correction_original_status IS 'Snapshot สถานะเดิมก่อนถูกแก้ไข';

-- ==============================================================================
-- ส่วนที่ 5: เปิดใช้งาน Supabase Realtime Publication บน Schema public
-- ==============================================================================

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

-- ==============================================================================
-- ส่วนที่ 6: คืนสิทธิ์ GRANT และรีโหลด Schema Cache ของ PostgREST
-- ==============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- ส่วนที่ 7: ตรวจสอบความสมบูรณ์ของโครงสร้างหลัง Migration
-- ==============================================================================

-- 7.1 ยืนยันจำนวนคอลัมน์รวม: system_settings = 42, attendance_logs = 40
SELECT
  table_name,
  COUNT(*) AS total_columns,
  CASE table_name
    WHEN 'system_settings' THEN 42
    WHEN 'attendance_logs' THEN 40
  END AS expected_columns,
  CASE
    WHEN (table_name = 'system_settings' AND COUNT(*) = 42)
      OR (table_name = 'attendance_logs' AND COUNT(*) = 40)
    THEN 'OK'
    ELSE 'MISMATCH'
  END AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('system_settings', 'attendance_logs')
GROUP BY table_name
ORDER BY table_name;

-- 7.2 ตรวจสอบรายการคอลัมน์ใหม่ทั้ง 13 คอลัมน์ใน public.system_settings
SELECT column_name, data_type, is_nullable, column_default
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
    'announcement_start_date',
    'announcement_end_date',
    'announcement_title',
    'announcement_body',
    'announcement_image_url',
    'announcement_drive_folder_id',
    'announcement_updated_at'
  )
ORDER BY column_name;

-- 7.3 ตรวจสอบรายการคอลัมน์ใหม่ทั้ง 15 คอลัมน์ใน public.attendance_logs
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'attendance_logs'
  AND column_name IN (
    'location_mode',
    'distance_from_official_meters',
    'offsite_reason',
    'check_out_location_mode',
    'check_out_distance_from_official_meters',
    'check_out_offsite_reason',
    'correction_status',
    'correction_requested_at',
    'correction_request_reason',
    'correction_reviewed_by',
    'correction_reviewed_at',
    'correction_reject_reason',
    'correction_original_check_in',
    'correction_original_check_out',
    'correction_original_status'
  )
ORDER BY column_name;

-- 7.4 ยืนยันว่าข้อมูลเดิมใน public.attendance_logs ไม่ถูกบังคับทับค่า location_mode
SELECT
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE location_mode IS NULL) AS legacy_null_location_mode_rows,
  COUNT(*) FILTER (WHERE correction_status = 'none') AS default_correction_none_rows
FROM public.attendance_logs;
