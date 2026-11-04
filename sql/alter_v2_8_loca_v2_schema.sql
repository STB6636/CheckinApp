-- ==============================================================================
-- สคริปต์ Migration Additive v2.8 (Loca-V2: Onsite/Offsite & Official Locations)
-- สำหรับรันใน Schema public เมื่อต้องการ Merge โค้ดเข้าสู่ main ในอนาคต
-- ไม่กระทบข้อมูลเดิม ไม่ลบตารางเดิม 100%
-- ==============================================================================

-- 1. เพิ่มคอลัมน์ official_locations ใน public.system_settings
ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS official_locations JSONB NOT NULL 
DEFAULT '[{"id":"LOC-001","name":"สำนักเทศกิจ","latitude":13.756331,"longitude":100.501765,"radius_meters":150,"is_active":true}]'::jsonb;

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

-- 3. เพิ่มคอลัมน์ location_mode และ distance_from_official_meters ใน public.attendance_logs
ALTER TABLE public.attendance_logs 
ADD COLUMN IF NOT EXISTS location_mode TEXT NOT NULL DEFAULT 'ONSITE';

ALTER TABLE public.attendance_logs 
ADD COLUMN IF NOT EXISTS distance_from_official_meters DOUBLE PRECISION DEFAULT NULL;

-- ยืนยันผลการ Migration
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'system_settings' 
  AND column_name = 'official_locations';
