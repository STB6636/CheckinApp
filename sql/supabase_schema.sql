-- ============================================================================
-- ระบบลงเวลาปฏิบัติราชการ (BMA Check-in App V2.1)
-- Supabase PostgreSQL Schema
-- Project Ref: yicatrqogmcncfpqdyra
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ตารางตั้งค่าระบบ (system_settings)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id INT PRIMARY KEY DEFAULT 1,
    organization_name TEXT NOT NULL DEFAULT 'กรุงเทพมหานคร',
    bureau_name TEXT NOT NULL DEFAULT 'สำนักเทศกิจ',
    logo_url TEXT DEFAULT '',
    require_photo BOOLEAN NOT NULL DEFAULT true,
    require_gps BOOLEAN NOT NULL DEFAULT true,
    prefixes JSONB NOT NULL DEFAULT '["นาย", "นาง", "นางสาว", "ว่าที่ร้อยตรี", "ว่าที่ร้อยตรีหญิง"]'::jsonb,
    positions JSONB NOT NULL DEFAULT '[
        {"type": "ประเภททั่วไป", "title": "เจ้าพนักงานเทศกิจ", "level": "ปฏิบัติงาน"},
        {"type": "ประเภททั่วไป", "title": "เจ้าพนักงานเทศกิจ", "level": "ชำนาญงาน"},
        {"type": "ประเภททั่วไป", "title": "เจ้าพนักงานธุรการ", "level": "ปฏิบัติงาน"},
        {"type": "ประเภทวิชาการ", "title": "นักจัดการงานเทศกิจ", "level": "ปฏิบัติการ"},
        {"type": "ประเภทวิชาการ", "title": "นักจัดการงานเทศกิจ", "level": "ชำนาญการ"},
        {"type": "ประเภทวิชาการ", "title": "นักวิชาการคอมพิวเตอร์", "level": "ปฏิบัติการ"},
        {"type": "ประเภทอำนวยการ", "title": "ผู้อำนวยการส่วน", "level": "ต้น"}
    ]'::jsonb,
    affiliations JSONB NOT NULL DEFAULT '[
        {"organization": "กรุงเทพมหานคร", "bureau": "สำนักเทศกิจ", "division": "สำนักงานเลขานุการ", "group": "กลุ่มงานการเจ้าหน้าที่"},
        {"organization": "กรุงเทพมหานคร", "bureau": "สำนักเทศกิจ", "division": "สำนักงานเลขานุการ", "group": "กลุ่มงานบริหารทั่วไป"},
        {"organization": "กรุงเทพมหานคร", "bureau": "สำนักเทศกิจ", "division": "กองตรวจและปฏิบัติการพื้นที่ 1", "group": "กลุ่มงานตรวจและปฏิบัติการ 1"},
        {"organization": "กรุงเทพมหานคร", "bureau": "สำนักเทศกิจ", "division": "กองตรวจและปฏิบัติการพื้นที่ 2", "group": "กลุ่มงานตรวจและปฏิบัติการ 2"},
        {"organization": "กรุงเทพมหานคร", "bureau": "สำนักเทศกิจ", "division": "กองนโยบายและแผนงาน", "group": "กลุ่มงานยุทธศาสตร์และประเมินผล"}
    ]'::jsonb,
    remarks JSONB NOT NULL DEFAULT '["ปฏิบัติราชการนอกสถานที่", "อบรม/สัมมนา/ประชุมราชการ", "ปฏิบัติงานเวรประจำวัน", "ลืมลงเวลาปฏิบัติราชการ", "โทรศัพท์/อุปกรณ์ขัดข้อง"]'::jsonb,
    work_shifts JSONB NOT NULL DEFAULT '[
        {"name": "เวลาราชการปกติ (08:30 - 16:30)", "check_in": "08:30", "check_out": "16:30", "is_custom": false},
        {"name": "ผลัดเช้า (06:00 - 14:00)", "check_in": "06:00", "check_out": "14:00", "is_custom": false},
        {"name": "ผลัดบ่าย (14:00 - 22:00)", "check_in": "14:00", "check_out": "22:00", "is_custom": false},
        {"name": "ผลัดดึก (22:00 - 06:00)", "check_in": "22:00", "check_out": "06:00", "is_custom": false},
        {"name": "อื่นๆ (ระบุเวลาเอง)", "check_in": "", "check_out": "", "is_custom": true}
    ]'::jsonb,
    category_colors JSONB NOT NULL DEFAULT '{
        "normal": "#059669",
        "late": "#F59E0B",
        "special": "#6366F1",
        "absent": "#E11D48",
        "group_header": "#00744B"
    }'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- 2. ตารางข้อมูลบุคลากร (personnel)
CREATE TABLE IF NOT EXISTS public.personnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    national_id VARCHAR(13) UNIQUE,
    prefix TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    position_type TEXT NOT NULL DEFAULT '',
    position_title TEXT NOT NULL,
    position_level TEXT NOT NULL DEFAULT '',
    organization TEXT NOT NULL DEFAULT 'กรุงเทพมหานคร',
    bureau TEXT NOT NULL,
    division TEXT NOT NULL,
    work_group TEXT NOT NULL DEFAULT '',
    badge_color TEXT DEFAULT '#00744B',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ตารางบัญชีผู้ใช้งาน (user_accounts)
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personnel_id UUID REFERENCES public.personnel(id) ON DELETE SET NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    national_id VARCHAR(13),
    role TEXT NOT NULL CHECK (role IN ('SuperAdmin', 'Admin', 'User')) DEFAULT 'User',
    visibility_level TEXT CHECK (visibility_level IN ('all', 'bureau', 'division', 'none')) DEFAULT 'none',
    scope_bureau TEXT DEFAULT '',
    scope_division TEXT DEFAULT '',
    password_reset_requested BOOLEAN NOT NULL DEFAULT false,
    password_reset_requested_at TIMESTAMPTZ,
    password_reset_status TEXT CHECK (password_reset_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ตารางบันทึกเวลาปฏิบัติราชการ (attendance_logs)
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personnel_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_accounts(id) ON DELETE SET NULL,
    work_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift_name TEXT DEFAULT 'เวลาราชการปกติ (08:30 - 16:30)',
    check_in_time TIME,
    check_out_time TIME,
    check_in_photo TEXT DEFAULT '',
    check_out_photo TEXT DEFAULT '',
    check_in_lat DOUBLE PRECISION,
    check_in_lng DOUBLE PRECISION,
    check_in_location TEXT DEFAULT '',
    check_out_lat DOUBLE PRECISION,
    check_out_lng DOUBLE PRECISION,
    check_out_location TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'ปกติ',
    remark TEXT DEFAULT '',
    row_color TEXT DEFAULT '#059669',
    is_special_request BOOLEAN NOT NULL DEFAULT false,
    approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',
    approved_by UUID REFERENCES public.user_accounts(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- สร้าง Index เพื่อเพิ่มความเร็วในการค้นหาและจัดกลุ่ม
CREATE INDEX IF NOT EXISTS idx_personnel_org_hierarchy ON public.personnel(bureau, division, work_group);
CREATE INDEX IF NOT EXISTS idx_personnel_national_id ON public.personnel(national_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_username ON public.user_accounts(username);
CREATE INDEX IF NOT EXISTS idx_user_accounts_reset_req ON public.user_accounts(password_reset_requested);
CREATE INDEX IF NOT EXISTS idx_attendance_work_date ON public.attendance_logs(work_date);
CREATE INDEX IF NOT EXISTS idx_attendance_approval ON public.attendance_logs(is_special_request, approval_status);

-- เปิดใช้งาน RLS และอนุญาตให้เข้าถึงผ่าน Publishable Anon Key สำหรับเว็บแอปพลิเคชัน
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to system_settings" ON public.system_settings;
CREATE POLICY "Allow full access to system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to personnel" ON public.personnel;
CREATE POLICY "Allow full access to personnel" ON public.personnel FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to user_accounts" ON public.user_accounts;
CREATE POLICY "Allow full access to user_accounts" ON public.user_accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to attendance_logs" ON public.attendance_logs;
CREATE POLICY "Allow full access to attendance_logs" ON public.attendance_logs FOR ALL USING (true) WITH CHECK (true);

-- เพิ่มข้อมูลตั้งค่าระบบเริ่มต้น
INSERT INTO public.system_settings (id, organization_name, bureau_name, require_photo, require_gps)
VALUES (1, 'กรุงเทพมหานคร', 'สำนักเทศกิจ', true, true)
ON CONFLICT (id) DO NOTHING;

-- เพิ่มข้อมูลบุคลากรและบัญชีเริ่มต้น (SuperAdmin, Admin, User ตัวอย่าง)
DO $$
DECLARE
    v_super_pid UUID;
    v_admin_pid UUID;
    v_user_pid UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE username = 'superadmin') THEN
        INSERT INTO public.personnel (national_id, prefix, first_name, last_name, position_type, position_title, position_level, organization, bureau, division, work_group, badge_color)
        VALUES ('1100100100019', 'นาย', 'กิตติพงศ์', 'พัฒนากิจ', 'ประเภทวิชาการ', 'นักวิชาการคอมพิวเตอร์', 'ชำนาญการ', 'กรุงเทพมหานคร', 'สำนักเทศกิจ', 'สำนักงานเลขานุการ', 'กลุ่มงานการเจ้าหน้าที่', '#00744B')
        RETURNING id INTO v_super_pid;

        INSERT INTO public.user_accounts (personnel_id, username, password, full_name, national_id, role, visibility_level, scope_bureau, scope_division)
        VALUES (v_super_pid, 'superadmin', '123456', 'นายกิตติพงศ์ พัฒนากิจ', '1100100100019', 'SuperAdmin', 'all', 'สำนักเทศกิจ', 'สำนักงานเลขานุการ');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE username = 'admin01') THEN
        INSERT INTO public.personnel (national_id, prefix, first_name, last_name, position_type, position_title, position_level, organization, bureau, division, work_group, badge_color)
        VALUES ('1100200200024', 'นางสาว', 'วรัญญา', 'รักษ์เมือง', 'ประเภทวิชาการ', 'นักจัดการงานเทศกิจ', 'ชำนาญการ', 'กรุงเทพมหานคร', 'สำนักเทศกิจ', 'กองตรวจและปฏิบัติการพื้นที่ 1', 'กลุ่มงานตรวจและปฏิบัติการ 1', '#6366F1')
        RETURNING id INTO v_admin_pid;

        INSERT INTO public.user_accounts (personnel_id, username, password, full_name, national_id, role, visibility_level, scope_bureau, scope_division)
        VALUES (v_admin_pid, 'admin01', '123456', 'นางสาววรัญญา รักษ์เมือง', '1100200200024', 'Admin', 'division', 'สำนักเทศกิจ', 'กองตรวจและปฏิบัติการพื้นที่ 1');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE username = '1231254684532') THEN
        INSERT INTO public.personnel (national_id, prefix, first_name, last_name, position_type, position_title, position_level, organization, bureau, division, work_group, badge_color)
        VALUES ('1231254684532', 'นาย', 'สมชาย', 'สายตรวจ', 'ประเภททั่วไป', 'เจ้าพนักงานเทศกิจ', 'ปฏิบัติงาน', 'กรุงเทพมหานคร', 'สำนักเทศกิจ', 'กองตรวจและปฏิบัติการพื้นที่ 1', 'กลุ่มงานตรวจและปฏิบัติการ 1', '#059669')
        RETURNING id INTO v_user_pid;

        INSERT INTO public.user_accounts (personnel_id, username, password, full_name, national_id, role, visibility_level, scope_bureau, scope_division)
        VALUES (v_user_pid, '1231254684532', '684532', 'นายสมชาย สายตรวจ', '1231254684532', 'User', 'none', 'สำนักเทศกิจ', 'กองตรวจและปฏิบัติการพื้นที่ 1');
    END IF;
END $$;