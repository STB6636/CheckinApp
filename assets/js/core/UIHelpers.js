/**
 * @file assets/js/core/UIHelpers.js
 * @description คลาสจัดการ UI, ระบบ Popup รอโหลดระหว่างประมวลผลทั้งระบบ (แสดงผลทันที 0ms), ซ่อนชื่อไฟล์บนแถบ URL, พิมพ์ PDF A4 แนวนอน, ตรวจสอบลิงก์รูปโลโก้ & Google Drive
 */

import { Config } from './Config.js';

export class UIHelpers {
    static #progressTimer = null;
    static #hideTimer = null;
    static #currentProgress = 0;

    static VIEW_PAGE_STORAGE_KEY = 'bma_checkin_active_view_page_v2_9';

    static KNOWN_PAGES_REGEX = /\/(index|checkin|dashboard|reports|approvals|personnel|users|settings)(\.html)?\/?$/i;

    static THAI_MONTHS_SHORT = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    static THAI_MONTHS_FULL = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    static getRootBasePath() {
        const pathname = window.location.pathname || '/';
        if (UIHelpers.KNOWN_PAGES_REGEX.test(pathname)) {
            return pathname.replace(UIHelpers.KNOWN_PAGES_REGEX, '/');
        }
        if (/\/[^\/]+\.html$/i.test(pathname)) {
            return pathname.replace(/\/[^\/]+\.html$/i, '/');
        }
        return pathname.endsWith('/') ? pathname : `${pathname}/`;
    }

    static maskUrlToRoot(explicitPageName = '') {
        try {
            if (window.location.protocol === 'file:') return;
            const pathname = window.location.pathname || '/';
            const match = pathname.match(UIHelpers.KNOWN_PAGES_REGEX);
            const detectedPage = match ? `${match[1].toLowerCase()}.html` : '';
            const currentFile = explicitPageName || detectedPage;

            if (currentFile && currentFile.toLowerCase() !== 'index.html') {
                sessionStorage.setItem(UIHelpers.VIEW_PAGE_STORAGE_KEY, currentFile);
            }

            const cleanRootPath = UIHelpers.getRootBasePath();
            if (window.location.pathname !== cleanRootPath || window.location.search || window.location.hash) {
                window.history.replaceState(
                    { file: currentFile || sessionStorage.getItem(UIHelpers.VIEW_PAGE_STORAGE_KEY) || 'index.html' },
                    '',
                    cleanRootPath
                );
            }
        } catch (err) {
            console.warn('URL masking warning:', err);
        }
    }

    static initTheme() {
        UIHelpers.maskUrlToRoot();

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

    static toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        const currentMode = isDark ? 'dark' : 'light';
        localStorage.setItem(Config.STORAGE_KEYS.THEME_MODE, currentMode);
        window.dispatchEvent(new CustomEvent('bma:theme-changed', { detail: { mode: currentMode } }));
        return currentMode;
    }

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

    static formatThaiDate(dateStr) {
        return UIHelpers.formatThaiShortDate(dateStr);
    }

    static formatTime24(timeStr) {
        if (!timeStr) return '';
        const clean = String(timeStr).trim();
        const match = clean.match(/^(\d{1,2})[:.](\d{2})/);
        if (!match) return clean.slice(0, 5);
        const hh = String(Math.min(23, Math.max(0, parseInt(match[1], 10)))).padStart(2, '0');
        const mm = String(Math.min(59, Math.max(0, parseInt(match[2], 10)))).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    static timeToMinutes(timeStr) {
        const formatted = UIHelpers.formatTime24(timeStr);
        if (!formatted) return -1;
        const [hh, mm] = formatted.split(':').map(n => parseInt(n, 10));
        if (isNaN(hh) || isNaN(mm)) return -1;
        return (hh * 60) + mm;
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

    static capturePortrait3x4FromVideo(videoEl, canvasEl) {
        const targetWidth = 480;
        const targetHeight = 640;
        const targetRatio = targetWidth / targetHeight;

        const srcW = videoEl.videoWidth || 640;
        const srcH = videoEl.videoHeight || 480;
        const srcRatio = srcW / srcH;

        let cropW = srcW;
        let cropH = srcH;
        let cropX = 0;
        let cropY = 0;

        if (srcRatio > targetRatio) {
            cropW = Math.round(srcH * targetRatio);
            cropX = Math.round((srcW - cropW) / 2);
        } else {
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

    static verifyImageUrl(rawUrl) {
        return new Promise((resolve) => {
            let cleanUrl = String(rawUrl || '').trim();
            if (!cleanUrl) {
                resolve({
                    success: false,
                    normalizedUrl: '',
                    message: 'กรุณาวางลิงก์ URL ของรูปภาพโลโก้ก่อนกดปุ่มตรวจสอบ'
                });
                return;
            }

            if (cleanUrl.includes('drive.google.com/file/d/')) {
                const match = cleanUrl.match(/\/d\/([-\w]{20,})/);
                if (match && match[1]) {
                    cleanUrl = `https://lh3.googleusercontent.com/d/${match[1]}`;
                }
            }

            const img = new Image();
            let isSettled = false;

            const timer = setTimeout(() => {
                if (isSettled) return;
                isSettled = true;
                resolve({
                    success: false,
                    normalizedUrl: cleanUrl,
                    message: 'หมดเวลาเชื่อมต่อลิงก์รูปภาพ กรุณาตรวจสอบว่าลิงก์เปิดสิทธิ์สาธารณะแล้ว'
                });
            }, 8000);

            img.onload = () => {
                if (isSettled) return;
                isSettled = true;
                clearTimeout(timer);
                resolve({
                    success: true,
                    normalizedUrl: cleanUrl,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    message: `ตรวจสอบลิงก์รูปโลโก้สำเร็จ! รูปภาพพร้อมใช้งาน (ขนาด ${img.naturalWidth} × ${img.naturalHeight} พิกเซล)`
                });
            };

            img.onerror = () => {
                if (isSettled) return;
                isSettled = true;
                clearTimeout(timer);
                resolve({
                    success: false,
                    normalizedUrl: cleanUrl,
                    message: 'ไม่สามารถโหลดรูปภาพจากลิงก์ URL ที่ระบุได้ กรุณาตรวจสอบความถูกต้องของลิงก์อีกครั้ง'
                });
            };

            img.src = cleanUrl;
        });
    }

    static async verifyGoogleDriveLink(scriptUrl, folderId = '') {
        const cleanUrl = String(scriptUrl || '').trim();
        if (!cleanUrl) {
            return { success: false, message: 'กรุณากรอกลิงก์ Google Drive / Apps Script Web App ก่อนกดตรวจสอบ' };
        }

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

    static async uploadPhotoToGoogleDrive(base64DataUrl, fileNamePrefix, settings) {
        if (!base64DataUrl) return '';
        if (!base64DataUrl.startsWith('data:image')) return base64DataUrl;

        const scriptUrl = String(settings?.google_drive_script_url || '').trim();
        const cleanFolderId = String(settings?.google_drive_folder_id || '').trim();

        if (scriptUrl && scriptUrl.includes('script.google.com')) {
            const fileName = `${fileNamePrefix}_${UIHelpers.getTodayISO()}_${Date.now()}.jpg`;

            // Attempt 1: Upload to configured folderId
            try {
                const response = await fetch(scriptUrl, {
                    method: 'POST',
                    redirect: 'follow',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'upload',
                        folderId: cleanFolderId,
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
                console.warn('Google Drive upload attempt 1 failed:', err);
            }

            // Attempt 2: If cleanFolderId was non-empty and failed, retry with default folder ('')
            if (cleanFolderId) {
                try {
                    const fallbackResponse = await fetch(scriptUrl, {
                        method: 'POST',
                        redirect: 'follow',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify({
                            action: 'upload',
                            folderId: '',
                            fileName,
                            mimeType: 'image/jpeg',
                            base64Data: base64DataUrl
                        })
                    });
                    const fallbackResult = await fallbackResponse.json();
                    if (fallbackResult && fallbackResult.success && fallbackResult.url) {
                        return fallbackResult.url;
                    }
                } catch (err2) {
                    console.warn('Google Drive upload attempt 2 failed:', err2);
                }
            }
        }

        if (scriptUrl && scriptUrl.includes('drive.google.com')) {
            const match = scriptUrl.match(/[-\w]{25,}/);
            const fid = match ? match[0] : 'drive_folder';
            return `https://drive.google.com/drive/folders/${fid}?file=${encodeURIComponent(fileNamePrefix + '_' + Date.now() + '.jpg')}`;
        }

        return base64DataUrl;
    }

    /**
     * แสดง Popup รอโหลดระหว่างรอการประมวลผลทั้งระบบ (Login, บันทึก, แก้ไข, ลบ)
     * ใช้ Inline Style z-index: 999999 เพื่อให้แสดงผลขึ้นหน้าจอทันที (0ms) อยู่เหนือทุก Modal
     * @param {string} message ข้อความสถานะการทำงาน
     */
    static showLoading(message = 'กำลังประมวลผลข้อมูล กรุณารอสักครู่...') {
        // ยกเลิก Timer ปิดหน้าต่างอันเก่า (ถ้ามี) เพื่อป้องกันไม่ให้ Popup ถูกซ่อนก่อนเวลา
        if (UIHelpers.#hideTimer) {
            clearTimeout(UIHelpers.#hideTimer);
            UIHelpers.#hideTimer = null;
        }

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
            spinner.style.cssText = 'position: fixed; inset: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; background-color: rgba(4, 31, 17, 0.65); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); transition: opacity 0.15s ease;';
            spinner.innerHTML = `
                <div class="bma-card px-7 py-6 flex flex-col items-center gap-3.5 w-80 sm:w-96 text-center shadow-2xl border-2 border-[#007B3E]" style="background-color: var(--bma-surface-1); border-radius: 1.25rem;">
                    <div class="bma-spin-ring"></div>
                    <div class="space-y-1">
                        <p id="bmaGlobalSpinnerText" class="text-sm sm:text-base font-extrabold bma-text-main">กำลังประมวลผล...</p>
                        <p class="text-xs bma-text-sub">ระบบกำลังดำเนินการ กรุณารอสักครู่</p>
                    </div>
                    <div class="w-full space-y-1.5 pt-1">
                        <div class="bma-ajax-progress-track">
                            <div id="bmaGlobalProgressFill" class="bma-ajax-progress-fill" style="width: 20%;"></div>
                        </div>
                        <div class="flex items-center justify-between text-[11px] font-bold bma-text-sub">
                            <span><i class="fa-solid fa-circle-notch fa-spin mr-1" style="color: var(--bma-primary);"></i>กำลังเชื่อมต่อระบบ</span>
                            <span id="bmaGlobalProgressPercent">20%</span>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(spinner);
        }

        const textEl = document.getElementById('bmaGlobalSpinnerText');
        if (textEl) textEl.textContent = message;

        spinner.classList.remove('hidden');
        spinner.style.display = 'flex';
        spinner.style.opacity = '1';
        topBar.style.opacity = '1';

        // บังคับให้เบราว์เซอร์คำนวณ Layout ทันที (Force Synchronous Reflow) เพื่อให้ผู้ใช้เห็น Popup ทันทีที่กดปุ่ม
        void spinner.offsetHeight;

        if (UIHelpers.#progressTimer) clearInterval(UIHelpers.#progressTimer);
        UIHelpers.#currentProgress = 24;
        UIHelpers.#updateProgressDOM(UIHelpers.#currentProgress);

        UIHelpers.#progressTimer = setInterval(() => {
            if (UIHelpers.#currentProgress < 92) {
                const step = UIHelpers.#currentProgress < 60 ? 12 : 5;
                UIHelpers.#currentProgress = Math.min(92, UIHelpers.#currentProgress + step);
                UIHelpers.#updateProgressDOM(UIHelpers.#currentProgress);
            }
        }, 90);
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

        if (UIHelpers.#hideTimer) {
            clearTimeout(UIHelpers.#hideTimer);
        }

        UIHelpers.#hideTimer = setTimeout(() => {
            const spinner = document.getElementById('bmaGlobalSpinner');
            const topBar = document.getElementById('bmaTopProgressBar');
            if (spinner) {
                spinner.style.display = 'none';
                spinner.classList.add('hidden');
            }
            if (topBar) {
                topBar.style.opacity = '0';
                setTimeout(() => { topBar.style.width = '0%'; }, 120);
            }
            UIHelpers.#hideTimer = null;
        }, 120);
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

    /**
     * ส่งออกไฟล์ Excel แบบหลายแผ่นงาน (Multi-Sheet Workbook) พร้อมกำหนดความกว้างคอลัมน์
     * @param {Array<{sheetName: string, data: Array<Object>, colWidths?: Array<number|{wch: number}>}>} sheets 
     * @param {string} fileName 
     */
    static exportMultiSheetExcel(sheets, fileName = 'export_data') {
        if (window.XLSX && Array.isArray(sheets) && sheets.length > 0) {
            const workbook = window.XLSX.utils.book_new();
            sheets.forEach(sheetItem => {
                const sheetName = String(sheetItem.sheetName || 'Sheet').slice(0, 31);
                const data = Array.isArray(sheetItem.data) ? sheetItem.data : [];
                const worksheet = window.XLSX.utils.json_to_sheet(data);
                if (Array.isArray(sheetItem.colWidths)) {
                    worksheet['!cols'] = sheetItem.colWidths.map(w => typeof w === 'number' ? { wch: w } : w);
                }
                window.XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            });
            window.XLSX.writeFile(workbook, `${fileName}.xlsx`);
            return;
        }

        // Fallback หากไม่มี XLSX ให้ส่งออกแผ่นงานแรกเป็น CSV
        if (Array.isArray(sheets) && sheets.length > 0) {
            UIHelpers.exportToExcelUTF8(sheets[0].data || [], fileName, sheets[0].sheetName || 'Sheet1');
        }
    }

    /**
     * ส่งออกไฟล์แม่แบบ Excel ด้วย ExcelJS พร้อม Data Validation Dropdowns เชื่อมโยงข้ามแผ่นงาน
     * @param {Object} params
     * @param {Object} params.settings ข้อมูลการตั้งค่าระบบและ Master Data (affiliations, positions, prefixes)
     * @param {Array<Object>} params.templateRows ข้อมูลตัวอย่างสำหรับแผ่นงานที่ 1
     * @param {string} params.fileName ชื่อไฟล์ผลลัพธ์
     */
    static async exportTemplateWithValidationsExcel({ settings, templateRows, fileName = 'Template_นำเข้าบุคลากร_กทม' }) {
        if (!window.ExcelJS) {
            console.warn('ExcelJS not loaded, falling back to exportMultiSheetExcel');
            const affiliations = settings?.affiliations || [];
            const positions = settings?.positions || [];
            UIHelpers.exportMultiSheetExcel([
                {
                    sheetName: 'ตารางข้อมูลนำเข้า',
                    data: templateRows || [],
                    colWidths: [18, 12, 16, 16, 16, 22, 14, 18, 24, 24, 20]
                },
                {
                    sheetName: 'โครงสร้างสังกัด',
                    data: affiliations.map(a => ({
                        'หน่วยงาน': a.organization || 'กรุงเทพมหานคร',
                        'สำนักงาน/กอง': a.bureau || '',
                        'ส่วน/ฝ่าย': a.division || '',
                        'กลุ่มงาน': a.group || '-'
                    })),
                    colWidths: [18, 26, 26, 22]
                },
                {
                    sheetName: 'โครงสร้างตำแหน่ง',
                    data: positions.map(p => ({
                        'ประเภทตำแหน่ง': p.type || '',
                        'ตำแหน่ง': p.title || '',
                        'ระดับ': p.level || ''
                    })),
                    colWidths: [18, 24, 16]
                }
            ], fileName);
            return;
        }

        const workbook = new window.ExcelJS.Workbook();
        workbook.creator = 'กรุงเทพมหานคร (BMA)';
        workbook.lastModifiedBy = 'ระบบบันทึกเวลาปฏิบัติราชการ กทม.';
        workbook.created = new Date();
        workbook.modified = new Date();

        const affiliations = settings?.affiliations || [];
        const positions = settings?.positions || [];
        const prefixes = settings?.prefixes || ['นาย', 'นาง', 'นางสาว', 'ว่าที่ร้อยตรี', 'ว่าที่ร้อยตรีหญิง'];

        // --- Sheet 1: ตารางข้อมูลนำเข้า ---
        const ws1 = workbook.addWorksheet('ตารางข้อมูลนำเข้า', {
            views: [{ showGridLines: true, state: 'frozen', xSplit: 0, ySplit: 1 }]
        });

        const headers1 = [
            { header: 'เลขบัตรประชาชน', key: 'national_id', width: 20 },
            { header: 'คำนำหน้า', key: 'prefix', width: 14 },
            { header: 'ชื่อ', key: 'first_name', width: 18 },
            { header: 'นามสกุล', key: 'last_name', width: 18 },
            { header: 'ประเภทตำแหน่ง', key: 'position_type', width: 18 },
            { header: 'ตำแหน่ง', key: 'position_title', width: 26 },
            { header: 'ระดับ', key: 'position_level', width: 16 },
            { header: 'หน่วยงาน', key: 'organization', width: 20 },
            { header: 'สำนักงาน/กอง', key: 'bureau', width: 28 },
            { header: 'ส่วน/ฝ่าย', key: 'division', width: 28 },
            { header: 'กลุ่มงาน', key: 'work_group', width: 24 }
        ];

        ws1.columns = headers1;

        // Populate sample data rows in Sheet 1
        if (Array.isArray(templateRows) && templateRows.length > 0) {
            templateRows.forEach(row => {
                ws1.addRow({
                    national_id: String(row['เลขบัตรประชาชน'] || row['national_id'] || ''),
                    prefix: String(row['คำนำหน้า'] || row['prefix'] || ''),
                    first_name: String(row['ชื่อ'] || row['first_name'] || ''),
                    last_name: String(row['นามสกุล'] || row['last_name'] || ''),
                    position_type: String(row['ประเภทตำแหน่ง'] || row['position_type'] || ''),
                    position_title: String(row['ตำแหน่ง'] || row['position_title'] || ''),
                    position_level: String(row['ระดับ'] || row['position_level'] || ''),
                    organization: String(row['หน่วยงาน'] || row['organization'] || ''),
                    bureau: String(row['สำนักงาน/กอง'] || row['bureau'] || ''),
                    division: String(row['ส่วน/ฝ่าย'] || row['division'] || ''),
                    work_group: String(row['กลุ่มงาน'] || row['work_group'] || '')
                });
            });
        }

        // --- Sheet 2: โครงสร้างสังกัด ---
        const ws2 = workbook.addWorksheet('โครงสร้างสังกัด', {
            views: [{ showGridLines: true, state: 'frozen', xSplit: 0, ySplit: 1 }]
        });
        ws2.columns = [
            { header: 'หน่วยงาน', key: 'organization', width: 20 },
            { header: 'สำนักงาน/กอง', key: 'bureau', width: 28 },
            { header: 'ส่วน/ฝ่าย', key: 'division', width: 28 },
            { header: 'กลุ่มงาน', key: 'group', width: 24 }
        ];
        affiliations.forEach(a => {
            ws2.addRow({
                organization: a.organization || 'กรุงเทพมหานคร',
                bureau: a.bureau || '',
                division: a.division || '',
                group: a.group || '-'
            });
        });

        // --- Sheet 3: โครงสร้างตำแหน่ง ---
        const ws3 = workbook.addWorksheet('โครงสร้างตำแหน่ง', {
            views: [{ showGridLines: true, state: 'frozen', xSplit: 0, ySplit: 1 }]
        });
        ws3.columns = [
            { header: 'ประเภทตำแหน่ง', key: 'type', width: 20 },
            { header: 'ตำแหน่ง', key: 'title', width: 28 },
            { header: 'ระดับ', key: 'level', width: 18 }
        ];
        positions.forEach(p => {
            ws3.addRow({
                type: p.type || '',
                title: p.title || '',
                level: p.level || ''
            });
        });

        // Format Headers for all 3 worksheets (BMA Emerald #00744B, White Text, Bold, Thin Border)
        [ws1, ws2, ws3].forEach(ws => {
            const headerRow = ws.getRow(1);
            headerRow.height = 28;
            headerRow.eachCell(cell => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF00744B' }
                };
                cell.font = {
                    name: 'Sarabun',
                    bold: true,
                    color: { argb: 'FFFFFFFF' },
                    size: 11
                };
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: false
                };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF005234' } },
                    left: { style: 'thin', color: { argb: 'FF005234' } },
                    bottom: { style: 'medium', color: { argb: 'FF003C26' } },
                    right: { style: 'thin', color: { argb: 'FF005234' } }
                };
            });
        });

        // Data Validation Formulas
        const affMaxRow = Math.max(2, affiliations.length + 1);
        const posMaxRow = Math.max(2, positions.length + 1);
        const prefixFormula = `"${prefixes.join(',')}"`;
        const posTypeFormula = `'โครงสร้างตำแหน่ง'!$A$2:$A$${posMaxRow}`;
        const posTitleFormula = `'โครงสร้างตำแหน่ง'!$B$2:$B$${posMaxRow}`;
        const posLevelFormula = `'โครงสร้างตำแหน่ง'!$C$2:$C$${posMaxRow}`;
        const orgFormula = `'โครงสร้างสังกัด'!$A$2:$A$${affMaxRow}`;
        const bureauFormula = `'โครงสร้างสังกัด'!$B$2:$B$${affMaxRow}`;
        const divisionFormula = `'โครงสร้างสังกัด'!$C$2:$C$${affMaxRow}`;
        const workGroupFormula = `'โครงสร้างสังกัด'!$D$2:$D$${affMaxRow}`;

        // Apply Data Validations on Sheet 1 (Rows 2 to 300)
        for (let r = 2; r <= 300; r++) {
            const row = ws1.getRow(r);

            // Set font for clean look
            row.eachCell({ includeEmpty: false }, cell => {
                cell.font = { name: 'Sarabun', size: 10 };
            });

            // Col 2: คำนำหน้า (B)
            row.getCell(2).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [prefixFormula],
                showErrorMessage: true,
                errorTitle: 'คำนำหน้าไม่ถูกต้อง',
                error: 'กรุณาเลือกคำนำหน้าจากรายการที่กำหนด'
            };

            // Col 5: ประเภทตำแหน่ง (E)
            row.getCell(5).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [posTypeFormula],
                showErrorMessage: true,
                errorTitle: 'ประเภทตำแหน่งไม่ถูกต้อง',
                error: 'กรุณาเลือกประเภทตำแหน่งจากรายการที่กำหนด'
            };

            // Col 6: ตำแหน่ง (F)
            row.getCell(6).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [posTitleFormula],
                showErrorMessage: true,
                errorTitle: 'ตำแหน่งไม่ถูกต้อง',
                error: 'กรุณาเลือกตำแหน่งจากรายการที่กำหนด'
            };

            // Col 7: ระดับ (G)
            row.getCell(7).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [posLevelFormula],
                showErrorMessage: true,
                errorTitle: 'ระดับตำแหน่งไม่ถูกต้อง',
                error: 'กรุณาเลือกระดับตำแหน่งจากรายการที่กำหนด'
            };

            // Col 8: หน่วยงาน (H)
            row.getCell(8).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [orgFormula],
                showErrorMessage: true,
                errorTitle: 'หน่วยงานไม่ถูกต้อง',
                error: 'กรุณาเลือกหน่วยงานจากรายการที่กำหนด'
            };

            // Col 9: สำนักงาน/กอง (I)
            row.getCell(9).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [bureauFormula],
                showErrorMessage: true,
                errorTitle: 'สำนักงาน/กองไม่ถูกต้อง',
                error: 'กรุณาเลือกสำนักงาน/กองจากรายการที่กำหนด'
            };

            // Col 10: ส่วน/ฝ่าย (J)
            row.getCell(10).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [divisionFormula],
                showErrorMessage: true,
                errorTitle: 'ส่วน/ฝ่ายไม่ถูกต้อง',
                error: 'กรุณาเลือกส่วน/ฝ่ายจากรายการที่กำหนด'
            };

            // Col 11: กลุ่มงาน (K)
            row.getCell(11).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [workGroupFormula],
                showErrorMessage: true,
                errorTitle: 'กลุ่มงานไม่ถูกต้อง',
                error: 'กรุณาเลือกกลุ่มงานจากรายการที่กำหนด'
            };
        }

        // Generate binary buffer and download in browser
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
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
    <title>&nbsp;</title>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            font-family: 'Sarabun', sans-serif;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            margin: 0;
            padding: 18px 24px;
            color: #0F172A;
            background: #FFFFFF;
        }
        .report-header {
            text-align: center;
            margin-bottom: 16px;
            border-bottom: 2px solid ${headerColor};
            padding-bottom: 10px;
        }
        .report-header h1 {
            margin: 0 0 4px 0;
            font-size: 20px;
            font-weight: 800;
            color: ${headerColor};
        }
        .report-header p {
            margin: 0;
            font-size: 13.5px;
            font-weight: 600;
            color: #334155;
        }
        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            margin-bottom: 14px;
            padding: 10px 16px;
            background: #eef7f1;
            border: 1px solid #cde3d5;
            border-radius: 10px;
        }
        .toolbar-hint {
            font-size: 13px;
            font-weight: 600;
            color: #1B432C;
        }
        .btn-print {
            background: ${headerColor};
            color: #FFFFFF;
            border: none;
            padding: 8px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
        }
        .tag-section-block {
            margin-bottom: 22px;
            page-break-inside: avoid;
        }
        .tag-section-title {
            font-size: 14px;
            font-weight: 700;
            padding: 7px 14px;
            border-radius: 6px;
            color: #FFFFFF;
            margin-bottom: 6px;
        }
        table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 12px;
        }
        th, td {
            border: 1px solid #CBD5E1;
            padding: 7px 10px;
            text-align: left;
            vertical-align: middle;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        th {
            background-color: ${headerColor};
            color: #FFFFFF;
            font-weight: 700;
            white-space: nowrap;
        }
        .group-row td {
            background-color: #E3F2E9 !important;
            font-weight: 700;
            color: #1B432C !important;
        }
        .sub-group-row td {
            background-color: #F8FAFC !important;
            font-weight: 600;
            color: #334155 !important;
        }
        @page {
            size: A4 landscape;
            margin: 0mm;
        }
        @media print {
            .toolbar { display: none !important; }
            body {
                margin: 0;
                padding: 10mm 12mm;
            }
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <span class="toolbar-hint">ขนาดมาตรฐาน: กระดาษ A4 แนวนอน (Landscape) — จัดขนาดคอลัมน์พอดีกับข้อมูล</span>
        <button class="btn-print" onclick="window.print()">พิมพ์/ส่งออก PDF</button>
    </div>
    <div class="report-header">
        <h1>${title}</h1>
        <p>${subtitle}</p>
    </div>
    ${tableHtml}
    <script>
        document.title = "";
        window.onload = function() {
            document.title = "";
            setTimeout(function() { window.print(); }, 450);
        };
    </script>
</body>
</html>`;

        printWindow.document.open();
        printWindow.document.write(htmlDocument);
        printWindow.document.close();
    }
}