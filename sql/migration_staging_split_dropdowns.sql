-- ==============================================================================
-- Migration: Add offsite_job_types and special_request_reasons to staging.system_settings
-- Task ID: PIPE-20261113-split-dropdowns-and-special-request-official-locations
-- Schema: staging (สำหรับสภาพแวดล้อมทดสอบ Loca-V2 Isolated Testing)
-- รันสคริปต์นี้ใน Supabase Dashboard > SQL Editor
-- ==============================================================================

-- 1. เพิ่มคอลัมน์ offsite_job_types สำหรับจัดเก็บ "ลักษณะงานนอกสถานที่"
ALTER TABLE staging.system_settings 
ADD COLUMN IF NOT EXISTS offsite_job_types JSONB NOT NULL 
DEFAULT '[
  "ปฏิบัติงานนอกสถานที่",
  "อบรม/สัมมนา/ประชุมราชการ",
  "ปฏิบัติงานที่บ้าน (WFH)",
  "ปฏิบัติงานเวรประจำวัน",
  "อื่นๆ"
]'::jsonb;

-- 2. เพิ่มคอลัมน์ special_request_reasons สำหรับจัดเก็บ "เหตุผลลงเวลากรณีพิเศษ"
ALTER TABLE staging.system_settings 
ADD COLUMN IF NOT EXISTS special_request_reasons JSONB NOT NULL 
DEFAULT '[
  "ลืมลงเวลาปฏิบัติราชการ",
  "โทรศัพท์/อุปกรณ์ขัดข้อง",
  "ระบบอินเทอร์เน็ตขัดข้อง",
  "ปฏิบัติงานภารกิจเร่งด่วน",
  "อื่นๆ"
]'::jsonb;

-- 3. อัปเดตข้อมูลแถว id = 1 ใน staging.system_settings ให้มีค่าเริ่มต้นทันที
UPDATE staging.system_settings
SET 
  offsite_job_types = COALESCE(
    offsite_job_types,
    '[
      "ปฏิบัติงานนอกสถานที่",
      "อบรม/สัมมนา/ประชุมราชการ",
      "ปฏิบัติงานที่บ้าน (WFH)",
      "ปฏิบัติงานเวรประจำวัน",
      "อื่นๆ"
    ]'::jsonb
  ),
  special_request_reasons = COALESCE(
    special_request_reasons,
    '[
      "ลืมลงเวลาปฏิบัติราชการ",
      "โทรศัพท์/อุปกรณ์ขัดข้อง",
      "ระบบอินเทอร์เน็ตขัดข้อง",
      "ปฏิบัติงานภารกิจเร่งด่วน",
      "อื่นๆ"
    ]'::jsonb
  )
WHERE id = 1;

-- 4. คำอธิบายคอลัมน์ (Comments)
COMMENT ON COLUMN staging.system_settings.offsite_job_types IS 'รายการตัวเลือกลักษณะงานนอกสถานที่ (เช่น อบรม, ประชุม, WFH)';
COMMENT ON COLUMN staging.system_settings.special_request_reasons IS 'รายการตัวเลือกเหตุผลในการยื่นคำขอลงเวลากรณีพิเศษ (เช่น ลืมลงเวลา, อุปกรณ์ขัดข้อง)';

-- 5. ตรวจสอบความถูกต้องหลังการรัน
SELECT 
  id, 
  jsonb_array_length(offsite_job_types) AS total_offsite_types,
  jsonb_array_length(special_request_reasons) AS total_special_reasons,
  offsite_job_types,
  special_request_reasons 
FROM staging.system_settings 
WHERE id = 1;
