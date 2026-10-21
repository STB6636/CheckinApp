/**
 * @file assets/js/core/Config.js
 * @description คลาสเก็บค่าคงที่และการตั้งค่าการเชื่อมต่อ Supabase และ GitHub Pages
 */

export class Config {
    // ข้อมูลการเชื่อมต่อ Supabase จากไฟล์ Project ID STB.txt
    static SUPABASE_URL = 'https://yicatrqogmcncfpqdyra.supabase.co';
    static SUPABASE_ANON_KEY = 'sb_publishable_eF5hCLSrg74gre5UXNtVgw_UsPRbPZl';
    static PROJECT_REF = 'yicatrqogmcncfpqdyra';
    static GITHUB_REPO = 'https://github.com/STB6636/CheckinApp.git';

    // คีย์สำหรับจัดเก็บสถานะใน LocalStorage / SessionStorage
    static STORAGE_KEYS = {
        SESSION_USER: 'bma_checkin_session_user_v2_1',
        THEME_MODE: 'bma_checkin_theme_mode_v2_1',
        CACHED_SETTINGS: 'bma_checkin_cached_settings_v2_1'
    };

    // ชุดรหัสสีอัตลักษณ์องค์กร กทม. (BMA Design System Tokens)
    static BMA_COLORS = {
        primaryLight: '#00744B',
        primaryDark: '#34D399',
        pastelLight: '#66C19E',
        pastelDark: '#A7F3D0',
        secondary: [
            { id: 1, name: 'Green Space (งานสิ่งแวดล้อม)', light: '#059669', dark: '#4ADE80' },
            { id: 2, name: 'Lime Eco (เมืองน่าอยู่และพลังงานสะอาด)', light: '#84CC16', dark: '#BEF264' },
            { id: 3, name: 'City Amber (แสงสว่างและการศึกษา)', light: '#F59E0B', dark: '#FCD34D' },
            { id: 4, name: 'Warm Sunset (วิถีชีวิตริมน้ำและงานสร้างสรรค์)', light: '#FB923C', dark: '#FDBA74' },
            { id: 5, name: 'Giant Swing Rose (เสาชิงช้าและการบรรเทาสาธารณภัย)', light: '#F43F5E', dark: '#FDA4AF' },
            { id: 6, name: 'BMA Indigo (ความเป็นระเบียบ งานเทศกิจ และเทคโนโลยี)', light: '#6366F1', dark: '#A5B4FC' },
            { id: 7, name: 'Crimson Red (สถานะฉุกเฉินและข้อผิดพลาดร้ายแรง)', light: '#E11D48', dark: '#F87171' },
            { id: 8, name: 'Public Works Orange (งานโยธาและรักษาความสะอาด)', light: '#EA580C', dark: '#FB923C' },
            { id: 9, name: 'Temple Gold (เกียรติยศและวัฒนธรรมพระนคร)', light: '#EAB308', dark: '#FDE047' },
            { id: 10, name: 'Chao Phraya Sky Blue (การระบายน้ำและสายน้ำเจ้าพระยา)', light: '#0284C7', dark: '#38BDF8' }
        ]
    };

    // ค่าเริ่มต้นกรณีฐานข้อมูลยังไม่มีการตั้งค่า
    static DEFAULT_SETTINGS = {
        id: 1,
        organization_name: 'กรุงเทพมหานคร',
        bureau_name: 'สำนักเทศกิจ',
        logo_url: '',
        require_photo: true,
        require_gps: true,
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
            { name: 'เวลาราชการปกติ (08:30 - 16:30)', check_in: '08:30', check_out: '16:30', is_custom: false },
            { name: 'ผลัดเช้า (06:00 - 14:00)', check_in: '06:00', check_out: '14:00', is_custom: false },
            { name: 'ผลัดบ่าย (14:00 - 22:00)', check_in: '14:00', check_out: '22:00', is_custom: false },
            { name: 'ผลัดดึก (22:00 - 06:00)', check_in: '22:00', check_out: '06:00', is_custom: false },
            { name: 'อื่นๆ (ระบุเวลาเอง)', check_in: '', check_out: '', is_custom: true }
        ],
        category_colors: {
            normal: '#059669',
            late: '#F59E0B',
            special: '#6366F1',
            absent: '#E11D48',
            group_header: '#00744B'
        }
    };
}