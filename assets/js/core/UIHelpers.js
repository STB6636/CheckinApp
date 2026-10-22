/**
 * @file assets/js/core/UIHelpers.js
 * @description คลาสจัดการ UI, SweetAlert2, Loading Spin + Progress Bar, Skeleton, ตรวจเลขบัตร 13 หลัก, Excel และ PDF
 */

import { Config } from './Config.js';

export class UIHelpers {
    static #progressTimer = null;
    static #currentProgress = 0;

    /**
     * เริ่มต้นโหลดโหมดสี (Light / Dark Mode) จาก LocalStorage และล็อก Tailwind darkMode: 'class'
     */
    static initTheme() {
        if (window.tailwind) {
            window.tailwind.config = {
                ...(window.tailwind.config || {}),
                darkMode: 'class'
            };
        }

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
     * แสดง Loading Spin + Progress Bar (ทั้งแถบด้านบนสุดและกล่องตรงกลาง)
     * @param {string} message ข้อความขณะกำลังโหลด
     */
    static showLoading(message = 'กำลังโหลดข้อมูล...') {
        // 1. แถบ Progress Bar บนสุดของหน้าจอ
        let topBar = document.getElementById('bmaTopProgressBar');
        if (!topBar) {
            topBar = document.createElement('div');
            topBar.id = 'bmaTopProgressBar';
            document.body.appendChild(topBar);
        }

        // 2. กล่อง Spin + Progress Bar
        let spinner = document.getElementById('bmaGlobalSpinner');
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'bmaGlobalSpinner';
            spinner.className = 'fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-200';
            spinner.innerHTML = `
                <div class="bma-card px-8 py-6 flex flex-col items-center gap-3.5 w-80 sm:w-96 text-center shadow-2xl">
                    <div class="bma-spin-ring"></div>
                    <p id="bmaGlobalSpinnerText" class="text-sm font-bold bma-text-main"></p>
                    <div class="w-full space-y-1">
                        <div class="bma-ajax-progress-track">
                            <div id="bmaGlobalProgressFill" class="bma-ajax-progress-fill" style="width: 15%;"></div>
                        </div>
                        <div class="flex items-center justify-between text-[11px] font-bold bma-text-sub">
                            <span>กำลังประมวลผล</span>
                            <span id="bmaGlobalProgressPercent">15%</span>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(spinner);
        }

        const textEl = document.getElementById('bmaGlobalSpinnerText');
        if (textEl) textEl.textContent = message;

        spinner.classList.remove('hidden');
        topBar.style.opacity = '1';

        // จำลองการวิ่งของ Progress Bar จาก 15% -> 90% ระหว่างรอโหลดเสร็จ
        if (UIHelpers.#progressTimer) clearInterval(UIHelpers.#progressTimer);
        UIHelpers.#currentProgress = 18;
        UIHelpers.#updateProgressDOM(UIHelpers.#currentProgress);

        UIHelpers.#progressTimer = setInterval(() => {
            if (UIHelpers.#currentProgress < 90) {
                const step = UIHelpers.#currentProgress < 50 ? 12 : 5;
                UIHelpers.#currentProgress = Math.min(90, UIHelpers.#currentProgress + step);
                UIHelpers.#updateProgressDOM(UIHelpers.#currentProgress);
            }
        }, 120);
    }

    static #updateProgressDOM(percent) {
        const fillEl = document.getElementById('bmaGlobalProgressFill');
        const pctEl = document.getElementById('bmaGlobalProgressPercent');
        const topBar = document.getElementById('bmaTopProgressBar');
        if (fillEl) fillEl.style.width = `${percent}%`;
        if (pctEl) pctEl.textContent = `${percent}%`;
        if (topBar) topBar.style.width = `${percent}%`;
    }

    /**
     * ซ่อน Loading Spin + Progress Bar เมื่อโหลดหน้าเสร็จสมบูรณ์ (ดันไปที่ 100% ก่อนซ่อน)
     */
    static hideLoading() {
        if (UIHelpers.#progressTimer) {
            clearInterval(UIHelpers.#progressTimer);
            UIHelpers.#progressTimer = null;
        }

        UIHelpers.#updateProgressDOM(100);

        setTimeout(() => {
            const spinner = document.getElementById('bmaGlobalSpinner');
            const topBar = document.getElementById('bmaTopProgressBar');
            if (spinner) spinner.classList.add('hidden');
            if (topBar) {
                topBar.style.opacity = '0';
                setTimeout(() => { topBar.style.width = '0%'; }, 200);
            }
        }, 140);
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
     */
    static async alert(title, text = '', icon = 'success') {
        const isDark = document.documentElement.classList.contains('dark');
        if (window.Swal) {
            return window.Swal.fire({
                title,
                text,
                icon,
                confirmButtonText: 'ตกลง',
                confirmButtonColor: isDark ? '#34D399' : '#007B3E',
                background: isDark ? '#1F2733' : '#FFFFFF',
                color: isDark ? '#F1F5F9' : '#0F172A'
            });
        } else {
            window.alert(`${title}\n${text}`);
        }
    }

    /**
     * แสดงกล่องยืนยันการทำงานด้วย SweetAlert2
     */
    static async confirm(title, text = '', confirmText = 'ยืนยัน', icon = 'warning') {
        const isDark = document.documentElement.classList.contains('dark');
        if (window.Swal) {
            const result = await window.Swal.fire({
                title,
                text,
                icon,
                showCancelButton: true,
                confirmButtonColor: icon === 'error' || icon === 'warning' ? '#E11D48' : (isDark ? '#34D399' : '#007B3E'),
                cancelButtonColor: '#64748B',
                confirmButtonText: confirmText,
                cancelButtonText: 'ยกเลิก',
                background: isDark ? '#1F2733' : '#FFFFFF',
                color: isDark ? '#F1F5F9' : '#0F172A'
            });
            return Boolean(result.isConfirmed);
        }
        return window.confirm(`${title}\n${text}`);
    }

    /**
     * ตรวจสอบเลขบัตรประจำตัวประชาชนไทย 13 หลัก
     */
    static validateThaiNationalId(id, strictCheckDigit = false) {
        if (!id || id.trim() === '') {
            return { valid: true, message: '' };
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
     */
    static getLast6DigitsFromNationalId(nationalId) {
        const cleanId = String(nationalId || '').replace(/\D/g, '');
        if (cleanId.length < 6) return cleanId;
        return cleanId.slice(-6);
    }

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

    static getTodayISO() {
        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
    }

    static getCurrentTimeHHMM() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    static exportToExcelUTF8(dataRows, fileName = 'export_data', sheetName = 'Sheet1') {
        if (window.XLSX) {
            const worksheet = window.XLSX.utils.json_to_sheet(dataRows);
            const workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            window.XLSX.writeFile(workbook, `${fileName}.xlsx`);
            return;
        }

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

    static printReportInNewTab({ title, subtitle, tableHtml, headerColor = '#007B3E' }) {
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
        * { font-family: 'Sarabun', sans-serif; box-sizing: border-box; }
        body { margin: 0; padding: 24px; color: #0F172A; background: #FFFFFF; }
        .report-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid ${headerColor}; padding-bottom: 12px; }
        .report-header h1 { margin: 0 0 6px 0; font-size: 20px; color: ${headerColor}; }
        .report-header p { margin: 0; font-size: 14px; color: #475569; }
        .toolbar { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 16px; }
        .btn-print { background: ${headerColor}; color: #FFFFFF; border: none; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; }
        th { background-color: ${headerColor}; color: #FFFFFF; font-weight: 600; }
        .group-row td { background-color: #eef7f1; font-weight: 700; color: #2c4a38; }
        .sub-group-row td { background-color: #F8FAFC; font-weight: 600; color: #334155; }
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
            setTimeout(function() { window.print(); }, 500);
        };
    </script>
</body>
</html>`;

        printWindow.document.open();
        printWindow.document.write(htmlDocument);
        printWindow.document.close();
    }
}