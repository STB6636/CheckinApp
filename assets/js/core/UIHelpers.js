/**
 * @file assets/js/core/UIHelpers.js
 * @description คลาสจัดการ UI, SweetAlert2, Loading Spinner, Skeleton, ตรวจเลขบัตร 13 หลัก, Excel และ PDF
 */

import { Config } from './Config.js';

export class UIHelpers {
    /**
     * เริ่มต้นโหลดโหมดสี (Light / Dark Mode) จาก LocalStorage
     */
    static initTheme() {
        const savedTheme = localStorage.getItem(Config.STORAGE_KEYS.THEME_MODE) || 'light';
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return savedTheme;
    }

    /**
     * สลับโหมดสี Light <-> Dark (Eye-Care Mode)
     * @returns {string} โหมดสีปัจจุบัน ('light' หรือ 'dark')
     */
    static toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        const currentMode = isDark ? 'dark' : 'light';
        localStorage.setItem(Config.STORAGE_KEYS.THEME_MODE, currentMode);
        window.dispatchEvent(new CustomEvent('bma:theme-changed', { detail: { mode: currentMode } }));
        return currentMode;
    }

    /**
     * แสดง Loading Spinner แบบเต็มหน้าจอในทุกกระบวนการทำงาน
     * @param {string} message ข้อความขณะกำลังโหลด
     */
    static showLoading(message = 'กำลังประมวลผลข้อมูล...') {
        let spinner = document.getElementById('bmaGlobalSpinner');
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'bmaGlobalSpinner';
            spinner.className = 'fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-200';
            spinner.innerHTML = `
                <div class="bma-card px-8 py-6 flex flex-col items-center gap-4 max-w-sm text-center shadow-2xl">
                    <div class="bma-spin-ring"></div>
                    <p id="bmaGlobalSpinnerText" class="text-base font-semibold bma-text-main"></p>
                </div>
            `;
            document.body.appendChild(spinner);
        }
        const textEl = document.getElementById('bmaGlobalSpinnerText');
        if (textEl) textEl.textContent = message;
        spinner.classList.remove('hidden');
    }

    /**
     * ซ่อน Loading Spinner
     */
    static hideLoading() {
        const spinner = document.getElementById('bmaGlobalSpinner');
        if (spinner) {
            spinner.classList.add('hidden');
        }
    }

    /**
     * สร้าง HTML Skeleton Loading สำหรับตารางข้อมูล
     * @param {number} rows จำนวนแถวจำลอง
     * @param {number} cols จำนวนคอลัมน์จำลอง
     */
    static renderTableSkeleton(rows = 5, cols = 6) {
        let html = '';
        for (let r = 0; r < rows; r++) {
            html += `<tr class="animate-pulse">`;
            for (let c = 0; c < cols; c++) {
                html += `<td class="p-3"><div class="bma-skeleton h-5 w-full"></div></td>`;
            }
            html += `</tr>`;
        }
        return html;
    }

    /**
     * แสดงแจ้งเตือนด้วย SweetAlert2
     * @param {string} title หัวข้อ
     * @param {string} text รายละเอียด
     * @param {'success'|'error'|'warning'|'info'} icon ประเภทไอคอน
     */
    static async alert(title, text = '', icon = 'success') {
        const isDark = document.documentElement.classList.contains('dark');
        if (window.Swal) {
            return window.Swal.fire({
                title,
                text,
                icon,
                confirmButtonText: 'ตกลง',
                confirmButtonColor: isDark ? '#34D399' : '#00744B',
                background: isDark ? '#24332F' : '#FFFFFF',
                color: isDark ? '#F1F5F9' : '#0F172A'
            });
        } else {
            window.alert(`${title}\n${text}`);
        }
    }

    /**
     * แสดงกล่องยืนยันการทำงานด้วย SweetAlert2 (สำหรับการลบ หรือออกจากระบบ)
     * @param {string} title หัวข้อการยืนยัน
     * @param {string} text รายละเอียดเพิ่มเติม
     * @param {string} confirmText ข้อความปุ่มยืนยัน
     * @param {'warning'|'question'|'error'} icon ประเภทไอคอน
     * @returns {Promise<boolean>}
     */
    static async confirm(title, text = '', confirmText = 'ยืนยัน', icon = 'warning') {
        const isDark = document.documentElement.classList.contains('dark');
        if (window.Swal) {
            const result = await window.Swal.fire({
                title,
                text,
                icon,
                showCancelButton: true,
                confirmButtonColor: icon === 'error' || icon === 'warning' ? '#E11D48' : (isDark ? '#34D399' : '#00744B'),
                cancelButtonColor: '#64748B',
                confirmButtonText: confirmText,
                cancelButtonText: 'ยกเลิก',
                background: isDark ? '#24332F' : '#FFFFFF',
                color: isDark ? '#F1F5F9' : '#0F172A'
            });
            return Boolean(result.isConfirmed);
        }
        return window.confirm(`${title}\n${text}`);
    }

    /**
     * ตรวจสอบเลขบัตรประจำตัวประชาชนไทย 13 หลัก
     * (รองรับทั้งรูปแบบเลข 13 หลักทั่วไป และอัลกอริทึม Check Digit มาตรฐานกรมการปกครอง)
     * @param {string} id เลขบัตรประชาชน 13 หลัก
     * @param {boolean} strictCheckDigit บังคับตรวจ Check Digit หรือตรวจเฉพาะตัวเลข 13 หลัก
     * @returns {{valid: boolean, message: string}}
     */
    static validateThaiNationalId(id, strictCheckDigit = false) {
        if (!id || id.trim() === '') {
            return { valid: true, message: '' }; // กรณีไม่บังคับกรอกในหน้าบุคลากรทั่วไป
        }
        const cleanId = id.replace(/[\s-]/g, '');
        if (!/^\d{13}$/.test(cleanId)) {
            return { valid: false, message: 'หมายเลขบัตรประจำตัวประชาชนต้องเป็นตัวเลข 13 หลักเท่านั้น' };
        }
        if (strictCheckDigit) {
            let sum = 0;
            for (let i = 0; i < 12; i++) {
                sum += parseInt(cleanId.charAt(i), 10) * (13 - i);
            }
            const checkDigit = (11 - (sum % 11)) % 10;
            if (checkDigit !== parseInt(cleanId.charAt(12), 10)) {
                return { valid: false, message: 'หมายเลขบัตรประจำตัวประชาชนไม่ถูกต้องตามหลักเกณฑ์การคำนวณ' };
            }
        }
        return { valid: true, message: 'ถูกต้อง' };
    }

    /**
     * ดึงรหัสผ่านอัตโนมัติ 6 ตัวท้ายจากเลขบัตรประชาชน 13 หลัก
     * เช่น 1231254684532 -> 684532
     * @param {string} nationalId เลขบัตรประชาชน 13 หลัก
     * @returns {string}
     */
    static getLast6DigitsFromNationalId(nationalId) {
        const cleanId = String(nationalId || '').replace(/\D/g, '');
        if (cleanId.length < 6) return cleanId;
        return cleanId.slice(-6);
    }

    /**
     * แปลงวันที่ YYYY-MM-DD เป็นวันที่ภาษาไทย (พ.ศ.)
     * @param {string} dateStr
     * @returns {string}
     */
    static formatThaiDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * ดึงวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD ตามเวลาท้องถิ่นประเทศไทย
     * @returns {string}
     */
    static getTodayISO() {
        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
        return localISOTime;
    }

    /**
     * ดึงเวลาปัจจุบันในรูปแบบ HH:MM
     * @returns {string}
     */
    static getCurrentTimeHHMM() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    /**
     * ส่งออกข้อมูลเป็นไฟล์ Excel (.xlsx หรือ .csv UTF-8 BOM) รองรับภาษาไทย 100%
     * @param {Array<Object>} dataRows ข้อมูลแบบ Array of Objects
     * @param {string} fileName ชื่อไฟล์ไม่ต้องมีนามสกุล
     * @param {string} sheetName ชื่อชีต
     */
    static exportToExcelUTF8(dataRows, fileName = 'export_data', sheetName = 'Sheet1') {
        if (window.XLSX) {
            const worksheet = window.XLSX.utils.json_to_sheet(dataRows);
            const workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            window.XLSX.writeFile(workbook, `${fileName}.xlsx`);
            return;
        }

        // Fallback: สร้างไฟล์ CSV พร้อม UTF-8 BOM เพื่อให้เปิดใน Excel ภาษาไทยไม่เพี้ยน
        if (!dataRows || dataRows.length === 0) return;
        const headers = Object.keys(dataRows[0]);
        const csvLines = [
            headers.join(','),
            ...dataRows.map(row =>
                headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
            )
        ];
        const csvContent = '\uFEFF' + csvLines.join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * อ่านข้อมูลจากไฟล์ Excel (.xlsx / .csv) ที่ผู้ใช้นำเข้า รองรับ UTF-8
     * @param {File} file ไฟล์จากการเลือกใน input[type="file"]
     * @returns {Promise<Array<Object>>}
     */
    static parseExcelFileUTF8(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    if (window.XLSX) {
                        const data = new Uint8Array(e.target.result);
                        const workbook = window.XLSX.read(data, { type: 'array', codepage: 65001 });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const json = window.XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                        resolve(json);
                    } else {
                        reject(new Error('ไม่พบไลบรารี SheetJS (XLSX) สำหรับอ่านไฟล์ Excel'));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * พิมพ์และส่งออกเป็น PDF โดยใช้วิธีเปิด Tab ใหม่ด้วยเค้าโครง HTML รองรับภาษาไทย UTF-8
     * ไม่บันทึกไฟล์ลงไดรฟ์ของผู้ใช้โดยตรง (สร้างเฉพาะหน้าต่างชั่วคราวสำหรับการสั่งพิมพ์/บันทึก PDF)
     * @param {Object} options
     * @param {string} options.title หัวข้อรายงาน
     * @param {string} options.subtitle หัวข้อย่อย (เช่น วันที่ และชื่อหน่วยงาน)
     * @param {string} options.tableHtml โครงสร้าง HTML ของตารางการลงเวลา
     * @param {string} options.headerColor สีพื้นหลังหัวตารางจาก Color Picker
     */
    static printReportInNewTab({ title, subtitle, tableHtml, headerColor = '#00744B' }) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            UIHelpers.alert('ไม่สามารถเปิดแท็บใหม่ได้', 'กรุณาอนุญาตให้เบราว์เซอร์เปิดหน้าต่างป๊อปอัป (Pop-up) สำหรับเว็บไซต์นี้', 'warning');
            return;
        }

        const htmlDocument = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            font-family: 'Sarabun', sans-serif;
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 24px;
            color: #0F172A;
            background: #FFFFFF;
        }
        .report-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid ${headerColor};
            padding-bottom: 12px;
        }
        .report-header h1 {
            margin: 0 0 6px 0;
            font-size: 20px;
            color: ${headerColor};
        }
        .report-header p {
            margin: 0;
            font-size: 14px;
            color: #475569;
        }
        .toolbar {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-bottom: 16px;
        }
        .btn-print {
            background: ${headerColor};
            color: #FFFFFF;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        th, td {
            border: 1px solid #CBD5E1;
            padding: 8px 10px;
            text-align: left;
        }
        th {
            background-color: ${headerColor};
            color: #FFFFFF;
            font-weight: 600;
        }
        .group-row td {
            background-color: #E2E8F0;
            font-weight: 700;
            color: #0F172A;
        }
        .sub-group-row td {
            background-color: #F1F5F9;
            font-weight: 600;
            color: #334155;
        }
        @media print {
            .toolbar { display: none !important; }
            body { padding: 0; }
            @page { size: A4 portrait; margin: 12mm; }
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <button class="btn-print" onclick="window.print()">พิมพ์ / บันทึกเป็น PDF</button>
    </div>
    <div class="report-header">
        <h1>${title}</h1>
        <p>${subtitle}</p>
    </div>
    ${tableHtml}
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>`;

        printWindow.document.open();
        printWindow.document.write(htmlDocument);
        printWindow.document.close();
    }
}