-- ============================================================================
-- ระบบลงเวลาปฏิบัติราชการ (BMA Check-in App V2.5 - Branch: Test-Argon)
-- เพิ่มคอลัมน์ header_system_title ในตาราง system_settings
-- ============================================================================

ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS header_system_title TEXT NOT NULL DEFAULT 'BMA e-Government Time Attendance System';

UPDATE public.system_settings
SET header_system_title = COALESCE(NULLIF(header_system_title, ''), 'BMA e-Government Time Attendance System'),
    updated_at = NOW()
WHERE id = 1;