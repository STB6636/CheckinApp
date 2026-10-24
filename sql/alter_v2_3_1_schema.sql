-- ============================================================================
-- ระบบลงเวลาปฏิบัติราชการ (BMA Check-in App V2.3.1 - Branch: Test-Argon)
-- สคริปต์อัปเกรดโครงสร้างตาราง system_settings และ attendance_logs
-- Project Ref: yicatrqogmcncfpqdyra
-- ============================================================================

-- 1. เพิ่มคอลัมน์ใหม่ในตาราง system_settings
ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS standard_check_in TEXT NOT NULL DEFAULT '08:30',
ADD COLUMN IF NOT EXISTS standard_check_out TEXT NOT NULL DEFAULT '16:30',
ADD COLUMN IF NOT EXISTS late_threshold_minutes INT NOT NULL DEFAULT 30,
ADD COLUMN IF NOT EXISTS google_drive_script_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS google_drive_folder_id TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS footer_description TEXT DEFAULT 'ระบบบันทึกเวลาปฏิบัติราชการอิเล็กทรอนิกส์ เพื่อการบริหารงานบุคคลที่มีประสิทธิภาพ';

-- 2. เพิ่มคอลัมน์ระบุการปฏิบัติงานนอกเวลาราชการในตาราง attendance_logs
ALTER TABLE public.attendance_logs
ADD COLUMN IF NOT EXISTS is_overtime BOOLEAN NOT NULL DEFAULT false;

-- 3. ลบข้อจำกัด Unique เดิม (หากมี) เพื่อให้ 1 คนสามารถลงเวลาปกติ + ลงเวลานอกเวลาราชการแยก Row ในวันเดียวกันได้
CREATE INDEX IF NOT EXISTS idx_attendance_overtime ON public.attendance_logs(personnel_id, work_date, is_overtime);

-- 4. อัปเดตค่าสีสถานะทางการทั้ง 5 สถานะ และโครงสร้างช่วงเวลาเริ่มต้นใน system_settings (id = 1)
UPDATE public.system_settings
SET
    standard_check_in = COALESCE(standard_check_in, '08:30'),
    standard_check_out = COALESCE(standard_check_out, '16:30'),
    late_threshold_minutes = COALESCE(late_threshold_minutes, 30),
    footer_description = COALESCE(NULLIF(footer_description, ''), 'ระบบบันทึกเวลาปฏิบัติราชการอิเล็กทรอนิกส์ เพื่อการบริหารงานบุคคลที่มีประสิทธิภาพ'),
    category_colors = '{
        "normal": "#007B3E",
        "late": "#EAB308",
        "absent_duty": "#EA580C",
        "no_checkin": "#E11D48",
        "overtime": "#2563EB",
        "group_header": "#007B3E"
    }'::jsonb,
    work_shifts = '[
        {"name": "เวลาราชการปกติ (08:30 - 16:30)", "check_in": "08:30", "check_out": "16:30", "is_custom": false, "is_overtime": false, "is_overnight": false},
        {"name": "ผลัดเช้า (06:00 - 14:00)", "check_in": "06:00", "check_out": "14:00", "is_custom": false, "is_overtime": false, "is_overnight": false},
        {"name": "ผลัดบ่าย (14:00 - 22:00)", "check_in": "14:00", "check_out": "22:00", "is_custom": false, "is_overtime": false, "is_overnight": false},
        {"name": "ปฏิบัติงานนอกเวลาราชการ ช่วงเย็น (16:30 - 20:30)", "check_in": "16:30", "check_out": "20:30", "is_custom": false, "is_overtime": true, "is_overnight": false},
        {"name": "ปฏิบัติงานนอกเวลาราชการ ข้ามวัน (22:00 - 01:00)", "check_in": "22:00", "check_out": "01:00", "is_custom": false, "is_overtime": true, "is_overnight": true},
        {"name": "อื่นๆ (ระบุเวลาเอง)", "check_in": "08:30", "check_out": "16:30", "is_custom": true, "is_overtime": false, "is_overnight": false}
    ]'::jsonb,
    updated_at = NOW()
WHERE id = 1;