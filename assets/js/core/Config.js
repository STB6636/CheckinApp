/**
 * @file assets/js/core/Config.js
 * @description คลาสเก็บค่าคงที่ การตั้งค่าเชื่อมต่อ Supabase และค่ามาตรฐานของระบบ V2.7
 */

export class Config {
    static SUPABASE_URL = 'https://yicatrqogmcncfpqdyra.supabase.co';
    static SUPABASE_ANON_KEY = 'sb_publishable_eF5hCLSrg74gre5UXNtVgw_UsPRbPZl';
    static PROJECT_REF = 'yicatrqogmcncfpqdyra';
    static GITHUB_REPO = 'https://github.com/STB6636/CheckinApp.git';

    static STORAGE_KEYS = {
        SESSION_USER: 'bma_checkin_session_user_v2_7',
        THEME_MODE: 'bma_checkin_theme_mode_v2_7',
        CACHED_SETTINGS: 'bma_checkin_cached_settings_v2_7',
        WELCOME_TOAST: 'bma_checkin_welcome_toast_v2_7',
        REMEMBER_ME: 'bma_remember_me',
        REMEMBER_USERNAME: 'bma_remember_username'
    };

    static OFFICIAL_STATUSES = [
        { key: 'normal', label: 'ปฏิบัติงานปกติ', defaultColor: '#007B3E', icon: 'fa-user-check' },
        { key: 'late', label: 'มาสาย', defaultColor: '#EAB308', icon: 'fa-user-clock' },
        { key: 'absent_duty', label: 'ขาดราชการ', defaultColor: '#EA580C', icon: 'fa-user-slash' },
        { key: 'no_checkin', label: 'ไม่ลงเวลา', defaultColor: '#E11D48', icon: 'fa-user-xmark' },
        { key: 'overtime', label: 'ปฏิบัติงานนอกเวลา', defaultColor: '#2563EB', icon: 'fa-business-time' }
    ];

    static DEFAULT_SETTINGS = {
        id: 1,
        organization_name: 'กรุงเทพมหานคร',
        bureau_name: 'สำนักเทศกิจ',
        header_system_title: 'BMA e-Government Time Attendance System',
        logo_url: '',
        footer_description: 'ระบบบันทึกเวลาปฏิบัติราชการอิเล็กทรอนิกส์ เพื่อการบริหารงานบุคคลที่มีประสิทธิภาพ',
        require_photo: true,
        allow_gallery_fallback: true,
        require_gps: true,
        single_click_checkin: false,
        randomize_gps_checkout: false,
        randomize_gps_radius_meters: 20,
        allow_checkin_start_time: '06:00',
        standard_check_in: '08:30',
        standard_check_out: '16:30',
        late_threshold_minutes: 30,
        checkout_grace_minutes: 30,
        filter_shifts_by_realtime: true,
        google_drive_script_url: '',
        google_drive_folder_id: '',
        prefixes: ['นาย', 'นาง', 'นางสาว', 'ว่าที่ร้อยตรี', 'ว่าที่ร้อยตรีหญิง'],
        positions: [
            { type: 'ประเภททั่วไป', title: 'เจ้าพนักงานเทศกิจ', level: 'ปฏิบัติงาน' },
            { type: 'ประเภททั่วไป', title: 'เจ้าพนักงานเทศกิจ', level: 'ชำนาญงาน' },
            { type: 'ประเภทวิชาการ', title: 'นักจัดการงานเทศกิจ', level: 'ปฏิบัติการ' },
            { type: 'ประเภทวิชาการ', title: 'นักจัดการงานเทศกิจ', level: 'ชำนาญการ' },
            { type: 'ประเภทวิชาการ', title: 'นักวิชาการคอมพิวเตอร์', level: 'ปฏิบัติการ' }
        ],
        affiliations: [
            { organization: 'กรุงเทพมหานคร', bureau: 'สำนักเทศกิจ', division: 'สำนักงานเลขานุการ', group: 'กลุ่มงานการเจ้าหน้าที่' },
            { organization: 'กรุงเทพมหานคร', bureau: 'สำนักเทศกิจ', division: 'สำนักงานเลขานุการ', group: 'กลุ่มงานบริหารทั่วไป' },
            { organization: 'กรุงเทพมหานคร', bureau: 'สำนักเทศกิจ', division: 'กองตรวจและปฏิบัติการพื้นที่ 1', group: 'กลุ่มงานตรวจและปฏิบัติการ 1' },
            { organization: 'กรุงเทพมหานคร', bureau: 'สำนักเทศกิจ', division: 'กองตรวจและปฏิบัติการพื้นที่ 2', group: 'กลุ่มงานตรวจและปฏิบัติการ 2' }
        ],
        remarks: [
            'ปฏิบัติราชการนอกสถานที่',
            'อบรม/สัมมนา/ประชุมราชการ',
            'ปฏิบัติงานเวรประจำวัน',
            'ลืมลงเวลาปฏิบัติราชการ',
            'โทรศัพท์/อุปกรณ์ขัดข้อง'
        ],
        work_shifts: [
            { name: 'เวลาราชการปกติ', check_in: '08:30', check_out: '16:30', is_custom: false, is_overtime: false, is_overnight: false },
            { name: 'ผลัดเช้า', check_in: '06:00', check_out: '14:00', is_custom: false, is_overtime: false, is_overnight: false },
            { name: 'ผลัดบ่าย', check_in: '14:00', check_out: '22:00', is_custom: false, is_overtime: false, is_overnight: false },
            { name: 'ปฏิบัติงานนอกเวลา ช่วงเช้า', check_in: '05:00', check_out: '14:00', is_custom: false, is_overtime: true, is_overnight: false },
            { name: 'ปฏิบัติงานนอกเวลา ช่วงเย็น', check_in: '16:30', check_out: '20:30', is_custom: false, is_overtime: true, is_overnight: false },
            { name: 'ปฏิบัติงานนอกเวลา ข้ามวัน', check_in: '22:00', check_out: '01:00', is_custom: false, is_overtime: true, is_overnight: true },
            { name: 'อื่นๆ', check_in: '08:30', check_out: '16:30', is_custom: true, is_overtime: false, is_overnight: false }
        ],
        category_colors: {
            normal: '#007B3E',
            late: '#EAB308',
            absent_duty: '#EA580C',
            no_checkin: '#E11D48',
            overtime: '#2563EB',
            group_header: '#007B3E'
        }
    };
}