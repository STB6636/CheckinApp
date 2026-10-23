/**
 * @file assets/js/core/UIHelpers.js
 * @description คลาสจัดการ UI, วันที่ไทย (15 ม.ค. 69 / 15 มกราคม 2569), เวลา 24 ชม., Toast Popup, บีบอัดรูป 3:4 & Google Drive
 */

import { Config } from './Config.js';

export class UIHelpers {
    static #progressTimer = null;
    static #currentProgress = 0;

    static THAI_MONTHS_SHORT = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    static THAI_MONTHS_FULL = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    /**
     * เริ่มต้นโหลดโหมดสี (Light / Dark Mode)
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
     * สลับโหมดสี Light <-> Dark
     */
    static toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        const currentMode = isDark ? 'dark' : 'light';
        localStorage.setItem(Config.STORAGE_KEYS.THEME_MODE, currentMode);
        window.dispatchEvent(new CustomEvent('bma:theme-changed', { detail: { mode: currentMode } }));
        return currentMode;
    }

    /**
     * แสดง Popup เล็กๆ (Toast Notification) มุมขวาบน (PC) หรือด้านบนกึ่งกลาง (มือถือ)
     * แสดงเป็นเวลา 2-3 วินาทีแล้วหายไปเองโดยไม่ต้องกดปุ่มตกลง
     * @param {string} message ข้อความที่ต้องการแสดง
     * @param {'success'|'error'|'warning'} type ประเภท
     * @param {number} durationMs ระยะเวลาแสดงผล (ค่าเริ่มต้น 2600 มิลลิวินาที)
     * @returns {Promise<void>}
     */
    static showToast(message, type = 'success', durationMs = 2600) {
        return new Promise((resolve) => {
            let wrapper = document.getElementById('bmaToastWrapper');
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.id = 'bmaToastWrapper';
                document.body.appendChild(wrapper);
            }

            const iconMap = {
                success: 'fa-circle-check text-[#FDD835]',
                error: 'fa-circle-exclamation text-rose-200',
                warning: 'fa-triangle-exclamation text-amber-200'
            };

            const toastEl = document.createElement('div');
            toastEl.className = `bma-toast-item ${type === 'error' ? 'toast-error' : (type === 'warning' ? 'toast-warning' : '')}`;
            toastEl.innerHTML = `
                <i class="fa-solid ${iconMap[type] || iconMap.success} text-lg shrink-0"></i>
                <span class="flex-1 leading-snug">${message}</span>
            `;

            wrapper.appendChild(toastEl);

            setTimeout(() => {
                toastEl.classList.add('toast-fade-out');
                setTimeout(() => {
                    toastEl.remove();
                    resolve();
                }, 240);
            }, durationMs);
        });
    }

    /**
     * แปลงวันที่ YYYY-MM-DD เป็นรูปแบบไทยแบบย่อ เช่น "15 ม.ค. 69"
     * @param {string} dateStr
     * @returns {string}
     */
    static formatThaiShortDate(dateStr) {
        if (!dateStr) return '-';
        const parts = String(dateStr).slice(0, 10).split('-');
        if (parts.length === 3) {
            const yearAD = parseInt(parts[0], 10);
            const monthIdx = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            if (!isNaN(yearAD) && monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
                const shortYearBE = String(yearAD + 543).slice(-2);
                return `${day} ${UIHelpers.THAI_MONTHS_SHORT[monthIdx]} ${shortYearBE}`;
            }
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const shortYear = String(d.getFullYear() + 543).slice(-2);
        return `${d.getDate()} ${UIHelpers.THAI_MONTHS_SHORT[d.getMonth()]} ${shortYear}`;
    }

    /**
     * แปลงวันที่ YYYY-MM-DD เป็นรูปแบบไทยแบบเต็มสำหรับหน้ารายงาน เช่น "15 มกราคม 2569"
     * @param {string} dateStr
     * @returns {string}
     */
    static formatThaiFullDate(dateStr) {
        if (!dateStr) return '-';
        const parts = String(dateStr).slice(0, 10).split('-');
        if (parts.length === 3) {
            const yearAD = parseInt(parts[0], 10);
            const monthIdx = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            if (!isNaN(yearAD) && monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
                const fullYearBE = yearAD + 543;
                return `${day} ${UIHelpers.THAI_MONTHS_FULL[monthIdx]} ${fullYearBE}`;
            }
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return `${d.getDate()} ${UIHelpers.THAI_MONTHS_FULL[d.getMonth()]} ${d.getFullYear() + 543}`;
    }

    /**
     * เมธอดเดิม (Alias) ให้คืนค่ารูปแบบย่อ "15 ม.ค. 69" สำหรับตารางทั่วไป
     */
    static formatThaiDate(dateStr) {
        return UIHelpers.formatThaiShortDate(dateStr);
    }

    /**
     * จัดรูปแบบเวลาให้เป็นระบบ 24 ชั่วโมง (HH:mm) เสมอ
     * @param {string} timeStr เช่น "08:30:00" หรือ "8:30"
     * @returns {string} เช่น "08:30"
     */
    static formatTime24(timeStr) {
        if (!timeStr) return '';
        const clean = String(timeStr).trim();
        const match = clean.match(/^(\d{1,2})[:.](\d{2})/);
        if (!match) return clean.slice(0, 5);
        const hh = String(Math.min(23, Math.max(0, parseInt(match[1], 10)))).padStart(2, '0');
        const mm = String(Math.min(59, Math.max(0, parseInt(match[2], 10)))).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    /**
     * แปลงเวลา HH:mm เป็นจำนวนนาทีนับจาก 00:00 (สำหรับคำนวณมาสายและออกก่อนเวลา)
     * @param {string} timeStr
     * @returns {number}
     */
    static timeToMinutes(timeStr) {
        const formatted = UIHelpers.formatTime24(timeStr);
        if (!formatted) return -1;
        const [hh, mm] = formatted.split(':').map(n => parseInt(n, 10));
        if (isNaN(hh) || isNaN(mm)) return -1;
        return (hh * 60) + mm;
    }

    /**
     * ดึงวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
     */
    static getTodayISO() {
        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
    }

    /**
     * ดึงเวลาปัจจุบันในรูปแบบ 24 ชั่วโมง (HH:mm)
     */
    static getCurrentTimeHHMM() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    /**
     * ครอปและบีบอัดภาพจากวิดีโอกล้องให้เป็นแนวตั้ง อัตราส่วน 3:4 (ขนาดเล็กแต่คมชัดสูง)
     * @param {HTMLVideoElement} videoEl
     * @param {HTMLCanvasElement} canvasEl
     * @returns {string} Base64 JPEG Data URL
     */
    static capturePortrait3x4FromVideo(videoEl, canvasEl) {
        const targetWidth = 480;
        const targetHeight = 640; // อัตราส่วนแนวตั้ง 3:4
        const targetRatio = targetWidth / targetHeight; // 0.75

        const srcW = videoEl.videoWidth || 640;
        const srcH = videoEl.videoHeight || 480;
        const srcRatio = srcW / srcH;

        let cropW = srcW;
        let cropH = srcH;
        let cropX = 0;
        let cropY = 0;

        if (srcRatio > targetRatio) {
            // วิดีโอต้นฉบับกว้างกว่า 3:4 -> ตัดด้านซ้ายและขวามาให้อยู่กึ่งกลาง
            cropW = Math.round(srcH * targetRatio);
            cropX = Math.round((srcW - cropW) / 2);
        } else {
            // วิดีโอต้นฉบับสูงกว่า 3:4 -> ตัดด้านบนและล่างมาให้อยู่กึ่งกลาง
            cropH = Math.round(srcW / targetRatio);
            cropY = Math.round((srcH - cropH) / 2);
        }

        canvasEl.width = targetWidth;
        canvasEl.height = targetHeight;
        const ctx = canvasEl.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(videoEl, cropX, cropY, cropW, cropH, 0, 0, targetWidth, targetHeight);

        return canvasEl.toDataURL('image/jpeg', 0.78);
    }

    /**
     * ตรวจสอบลิงก์ Google Drive / Google Apps Script ก่อนบันทึกในหน้าตั้งค่าระบบ
     * @param {string} scriptUrl ลิงก์ Web App หรือ Folder Link
     * @param {string} folderId รหัสโฟลเดอร์ (ถ้ามี)
     * @returns {Promise<{success: boolean, message: string, folderName?: string}>}
     */
    static async verifyGoogleDriveLink(scriptUrl, folderId = '') {
        const cleanUrl = String(scriptUrl || '').trim();
        if (!cleanUrl) {
            return { success: false, message: 'กรุณากรอกลิงก์ Google Drive / Apps Script Web App ก่อนกดตรวจสอบ' };
        }

        // กรณีเป็นลิงก์ Google Apps Script Web App (/exec)
        if (cleanUrl.includes('script.google.com') && cleanUrl.includes('/exec')) {
            try {
                const verifyEndpoint = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=verify&folderId=${encodeURIComponent(folderId || '')}`;
                const res = await fetch(verifyEndpoint, { method: 'GET', redirect: 'follow' });
                const data = await res.json();
                if (data && data.success) {
                    return {
                        success: true,
                        folderName: data.folderName || 'BMA_Checkin_Photos',
                        message: data.message || 'ตรวจสอบลิงก์สำเร็จ พร้อมจัดเก็บไฟล์รูปถ่ายใน Google Drive'
                    };
                }
                return { success: false, message: data?.message || 'ลิงก์ตอบกลับแต่ไม่สามารถเข้าถึงโฟลเดอร์ได้' };
            } catch (err) {
                return {
                    success: false,
                    message: 'ไม่สามารถเชื่อมต่อกับ Google Apps Script ได้ กรุณาตรวจสอบว่าตั้งค่าสิทธิ์ Web App เป็น Anyone แล้ว'
                };
            }
        }

        // กรณีผู้ใช้ใส่ลิงก์โฟลเดอร์ Google Drive โดยตรง (https://drive.google.com/drive/folders/...)
        if (cleanUrl.includes('drive.google.com')) {
            const match = cleanUrl.match(/[-\w]{25,}/);
            if (match) {
                return {
                    success: true,
                    folderName: `Folder ID: ${match[0]}`,
                    message: `ตรวจสอบรูปแบบลิงก์โฟลเดอร์ Google Drive ถูกต้อง (Folder ID: ${match[0]})`
                };
            }
        }

        return {
            success: false,
            message: 'รูปแบบลิงก์ไม่ถูกต้อง กรุณาระบุลิงก์ Google Apps Script Web App (.../exec) หรือลิงก์โฟลเดอร์ Google Drive'
        };
    }

    /**
     * อัปโหลดรูปถ่ายลงเวลา (ที่บีบอัดแล้ว) ไปยัง Google Drive และคืนค่าเฉพาะ URL เพื่อจัดเก็บลงใน Supabase
     * @param {string} base64DataUrl รูปภาพ Base64
     * @param {string} fileNamePrefix ชื่อไฟล์
     * @param {Object} settings ข้อมูลตั้งค่าระบบ
     * @returns {Promise<string>} คืนค่า URL ของรูปภาพบน Google Drive
     */
    static async uploadPhotoToGoogleDrive(base64DataUrl, fileNamePrefix, settings) {
        if (!base64DataUrl) return '';
        if (!base64DataUrl.startsWith('data:image')) return base64DataUrl;

        const scriptUrl = String(settings?.google_drive_script_url || '').trim();
        const folderId = String(settings?.google_drive_folder_id || '').trim();

        if (scriptUrl && scriptUrl.includes('script.google.com')) {
            try {
                const fileName = `${fileNamePrefix}_${UIHelpers.getTodayISO()}_${Date.now()}.jpg`;
                const response = await fetch(scriptUrl, {
                    method: 'POST',
                    redirect: 'follow',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'upload',
                        folderId,
                        fileName,
                        mimeType: 'image/jpeg',
                        base64Data: base64DataUrl
                    })
                });
                const result = await response.json();
                if (result && result.success && result.url) {
                    return result.url;
                }
            } catch (err) {
                console.warn('Google Drive upload fallback:', err);
            }
        }

        // หากยังไม่ได้ตั้งค่า Web App URL แต่ใส่ลิงก์ Google Drive ไว้ จะสร้าง Reference URL ที่ไม่เก็บ Base64 ยาวลง Supabase
        if (scriptUrl && scriptUrl.includes('drive.google.com')) {
            const match = scriptUrl.match(/[-\w]{25,}/);
            const fid = match ? match[0] : 'drive_folder';
            return `https://drive.google.com/drive/folders/${fid}?file=${encodeURIComponent(fileNamePrefix + '_' + Date.now() + '.jpg')}`;
        }

        return base64DataUrl;
    }

    /**
     * แสดง Loading Spin + Progress Bar
     */
    static showLoading(message = 'กำลังโหลดข้อมูล...') {
        let topBar = document.getElementById('bmaTopProgressBar');
        if (!topBar) {
            topBar = document.createElement('div');
            topBar.id = 'bmaTopProgressBar';
            document.body.appendChild(topBar);
        }

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

    static async alert(title, text = '', icon = 'success') {
        const isDark = document.documentElement.classList.contains('dark');
        if (window.Swal) {
            return window.Swal.fire({
                title,
                text,
                icon,
                confirmButtonText: 'ตกลง',
                confirmButtonColor: isDark ? '#34D399' : '#007B3E',
                background: isDark ? '#183025' : '#FFFFFF',
                color: isDark ? '#F1F5F9' : '#0F172A'
            });
        } else {
            window.alert(`${title}\n${text}`);
        }
    }

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
                background: isDark ? '#183025' : '#FFFFFF',
                color: isDark ? '#F1F5F9' : '#0F172A'
            });
            return Boolean(result.isConfirmed);
        }
        return window.confirm(`${title}\n${text}`);
    }

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

    static getLast6DigitsFromNationalId(nationalId) {
        const cleanId = String(nationalId || '').replace(/\D/g, '');
        if (cleanId.length < 6) return cleanId;
        return cleanId.slice(-6);
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
        .tag-section-block { margin-bottom: 28px; page-break-inside: avoid; }
        .tag-section-title { font-size: 15px; font-weight: 700; padding: 8px 12px; border-radius: 6px; color: #FFFFFF; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
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