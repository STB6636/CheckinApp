-- ==============================================================================
-- สคริปต์ Migration v2.10.0: ระบบประกาศระบบ (System Announcement) สำหรับ Schema staging
-- รันสคริปต์นี้ใน Supabase Dashboard > SQL Editor (โครงการ yicatrqogmcncfpqdyra)
-- ==============================================================================

-- 1. เพิ่มคอลัมน์ประกาศระบบ 9 คอลัมน์ใน staging.system_settings (Additive / Idempotent)
ALTER TABLE staging.system_settings
ADD COLUMN IF NOT EXISTS announcement_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS announcement_mode TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS announcement_start_date TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS announcement_end_date TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS announcement_title TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS announcement_body TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS announcement_image_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS announcement_drive_folder_id TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS announcement_updated_at TEXT DEFAULT '';

-- 2. กำหนดค่าเริ่มต้น (Pre-seed) ให้แถว id = 1 พร้อมเปิดใช้งานประกาศเวอร์ชัน v2.10.0 ทันที
UPDATE staging.system_settings
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
WHERE id = 1;

-- 3. คำอธิบายคอลัมน์ (Comments)
COMMENT ON COLUMN staging.system_settings.announcement_enabled IS 'สวิตช์เปิด/ปิดการแสดงป๊อปอัปประกาศระบบ';
COMMENT ON COLUMN staging.system_settings.announcement_mode IS 'รูปแบบประกาศ: text (ข้อความ) หรือ image (รูปภาพแทนตัวหนังสือ)';
COMMENT ON COLUMN staging.system_settings.announcement_start_date IS 'วันที่เริ่มแสดงประกาศ (YYYY-MM-DD เวลาไทย UTC+7)';
COMMENT ON COLUMN staging.system_settings.announcement_end_date IS 'วันที่สิ้นสุดประกาศ (YYYY-MM-DD เว้นว่าง = แสดงต่อเนื่อง)';
COMMENT ON COLUMN staging.system_settings.announcement_title IS 'หัวข้อประกาศ (Head)';
COMMENT ON COLUMN staging.system_settings.announcement_body IS 'รายละเอียดประกาศ (Body)';
COMMENT ON COLUMN staging.system_settings.announcement_image_url IS 'ลิงก์รูปภาพประกาศ (ใช้เมื่อ announcement_mode = image)';
COMMENT ON COLUMN staging.system_settings.announcement_drive_folder_id IS 'รหัส/ลิงก์โฟลเดอร์ Google Drive เก็บรูปประกาศระบบ';
COMMENT ON COLUMN staging.system_settings.announcement_updated_at IS 'Timestamp รอบประกาศล่าสุด สำหรับนับการรับทราบครั้งเดียวต่อ 1 รอบประกาศ';

-- 4. ตรวจสอบและคืนสิทธิ์ให้ anon, authenticated, service_role บน Schema staging
GRANT USAGE ON SCHEMA staging TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA staging TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA staging TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA staging TO anon, authenticated, service_role;

-- 5. รีโหลด Schema Cache ของ PostgREST เพื่อให้รู้จักคอลัมน์ใหม่ทันที (ป้องกัน PGRST204)
NOTIFY pgrst, 'reload schema';

-- 6. ตรวจสอบผลลัพธ์
SELECT
  id,
  announcement_enabled,
  announcement_mode,
  announcement_start_date,
  announcement_end_date,
  announcement_title,
  announcement_updated_at
FROM staging.system_settings
WHERE id = 1;
