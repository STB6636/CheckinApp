-- ============================================================================
-- ระบบลงเวลาปฏิบัติราชการ (BMA Check-in App V2.7 - Branch: Test-Argon)
-- เพิ่มคอลัมน์ตั้งค่าเวลาเริ่มบันทึกเข้างาน, ระยะเวลาหลังเลิกงาน, และการกรองช่วงเวลาตามเวลาจริง
-- ============================================================================

ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS allow_checkin_start_time TEXT NOT NULL DEFAULT '06:00',
ADD COLUMN IF NOT EXISTS checkout_grace_minutes INT NOT NULL DEFAULT 30,
ADD COLUMN IF NOT EXISTS filter_shifts_by_realtime BOOLEAN NOT NULL DEFAULT true;

UPDATE public.system_settings
SET
    allow_checkin_start_time = COALESCE(NULLIF(allow_checkin_start_time, ''), '06:00'),
    checkout_grace_minutes = COALESCE(checkout_grace_minutes, 30),
    filter_shifts_by_realtime = COALESCE(filter_shifts_by_realtime, true),
    updated_at = NOW()
WHERE id = 1;