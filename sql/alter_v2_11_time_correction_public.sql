-- ==============================================================================
-- สคริปต์ Migration v2.11.0: ระบบคำขอแก้ไขเวลาเข้า-ออกงาน (Time Correction) สำหรับ Schema public
-- (ไฟล์คู่ขนานพร้อมใช้งานเมื่อ Merge สาขา Loca-V2 เข้า main)
-- ==============================================================================

-- 1. เพิ่มคอลัมน์ระบบขอแก้ไขเวลา 9 คอลัมน์บน public.attendance_logs (Additive / Idempotent 100%)
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

-- 2. เพิ่ม Foreign Key ผู้พิจารณาคำขอแก้ไขเวลาอ้างอิงไปยัง public.user_accounts(id) แบบ Idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_public_attendance_correction_reviewer'
  ) THEN
    ALTER TABLE public.attendance_logs
      ADD CONSTRAINT fk_public_attendance_correction_reviewer
      FOREIGN KEY (correction_reviewed_by)
      REFERENCES public.user_accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. สร้าง Partial Index เพื่อความรวดเร็วในการดึงรายการคำขอแก้ไขเวลาและคำนวณ Badge เตือน
CREATE INDEX IF NOT EXISTS idx_public_attendance_correction_status
  ON public.attendance_logs (correction_status, work_date DESC)
  WHERE correction_status <> 'none';

-- 4. คำอธิบายคอลัมน์ (Comments)
COMMENT ON COLUMN public.attendance_logs.correction_status IS 'สถานะคำขอแก้ไขเวลา: none, pending, approved, rejected';
COMMENT ON COLUMN public.attendance_logs.correction_requested_at IS 'วันเวลาที่ผู้ใช้งานส่งคำขอแก้ไขเวลา';
COMMENT ON COLUMN public.attendance_logs.correction_request_reason IS 'เหตุผลการขอแก้ไขเวลา (ไม่บังคับกรอก)';
COMMENT ON COLUMN public.attendance_logs.correction_reviewed_by IS 'รหัสผู้ดูแลระบบที่พิจารณาคำขอแก้ไขเวลา';
COMMENT ON COLUMN public.attendance_logs.correction_reviewed_at IS 'วันเวลาที่พิจารณาคำขอแก้ไขเวลา';
COMMENT ON COLUMN public.attendance_logs.correction_reject_reason IS 'เหตุผลที่ไม่อนุมัติคำขอแก้ไขเวลา (ถ้ามี)';
COMMENT ON COLUMN public.attendance_logs.correction_original_check_in IS 'Snapshot เวลาเข้างานเดิมก่อนถูกแก้ไข';
COMMENT ON COLUMN public.attendance_logs.correction_original_check_out IS 'Snapshot เวลาออกงานเดิมก่อนถูกแก้ไข';
COMMENT ON COLUMN public.attendance_logs.correction_original_status IS 'Snapshot สถานะเดิมก่อนถูกแก้ไข';

-- 5. คืนสิทธิ์ให้ anon, authenticated, service_role และรีโหลด Schema Cache ของ PostgREST
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
NOTIFY pgrst, 'reload schema';
