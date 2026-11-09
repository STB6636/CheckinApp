/**
 * @file assets/js/utils/DOMDiffHelper.js
 * @description ผู้ช่วยจัดการ DOM แบบ Differential Sync และ Animation สำหรับตารางและตัวชี้วัดในระบบ
 */

export class DOMDiffHelper {
    /**
     * คำนวณและปรับปรุงลำดับตัวเลข (1, 2, 3...) ของแถวในตารางใหม่โดยไม่ทำลายโครงสร้าง DOM
     * @param {HTMLElement} tbody - ตัวแม่ตาราง <tbody>
     * @param {string} seqSelector - selector สำหรับระบุ cell ตัวเลขลำดับ (ค่าเริ่มต้น '.seq-num')
     * @param {number} startIndex - เลขเริ่มต้น (ค่าเริ่มต้น 1)
     */
    static reindexTableSequence(tbody, seqSelector = '.seq-num', startIndex = 1) {
        if (!tbody) return;
        const visibleRows = Array.from(tbody.querySelectorAll('tr')).filter(row => {
            return !row.classList.contains('row-leave-fade') && !row.classList.contains('hidden') && row.style.display !== 'none' && !row.querySelector('td[colspan]');
        });

        let currentIdx = startIndex;
        for (const row of visibleRows) {
            const seqCell = row.querySelector(seqSelector);
            if (seqCell) {
                seqCell.textContent = String(currentIdx);
                currentIdx++;
            }
        }
    }

    /**
     * ล็อกแถวและแสดงป้ายกำกับเมื่อมีผู้ดูแลระบบท่านอื่น (Concurrent Admin) ดำเนินการไปแล้ว
     * @param {HTMLElement} rowEl - แถว <tr> ที่ต้องการล็อก
     * @param {string} adminName - ชื่อผู้ดูแลระบบที่ดำเนินการ
     * @param {string} actionText - ข้อความการกระทำ เช่น 'อนุมัติแล้ว' หรือ 'ไม่อนุมัติ'
     */
    static lockRowForConcurrentAdmin(rowEl, adminName = 'ผู้ดูแลระบบ', actionText = 'อนุมัติแล้ว') {
        if (!rowEl) return;
        rowEl.classList.add('row-locked-highlight');

        // ปิดการใช้งานปุ่มและตัวเลือกทั้งหมดในแถว
        rowEl.querySelectorAll('button, input, select, a').forEach(el => {
            el.disabled = true;
            el.classList.add('pointer-events-none', 'opacity-60');
        });

        // ค้นหาเซลล์การจัดการ (เซลล์สุดท้าย หรือที่มีปุ่มคำสั่ง)
        const cells = rowEl.querySelectorAll('td');
        if (cells.length > 0) {
            const actionCell = cells[cells.length - 1];
            actionCell.innerHTML = `
                <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold flex items-center justify-center gap-1">
                    <i class="fa-solid fa-lock text-[9px]"></i> ${actionText} โดย ${adminName}
                </span>
            `;
        }
    }

    /**
     * แทรกแถวใหม่ด้านบนสุดของตารางพร้อม Effect Pulse ไฮไลต์สีเขียว
     * @param {HTMLElement} tbody - ตัวแม่ตาราง <tbody>
     * @param {string} rowHtml - โค้ด HTML ของแถว <tr>
     * @param {string} highlightClass - CSS class ที่ใช้ทำแอนิเมชัน (ค่าเริ่มต้น 'row-enter-highlight')
     * @returns {HTMLElement|null} แถวที่ถูกสร้างขึ้น
     */
    static prependRowWithAnimation(tbody, rowHtml, highlightClass = 'row-enter-highlight') {
        if (!tbody || !rowHtml) return null;

        // ลบแถวข้อความแจ้งว่างเปล่า (Empty state placeholder) ถ้ามี
        const emptyPlaceholder = tbody.querySelector('td[colspan]');
        if (emptyPlaceholder) {
            const parentRow = emptyPlaceholder.closest('tr');
            if (parentRow) parentRow.remove();
        }

        tbody.insertAdjacentHTML('afterbegin', rowHtml);
        const newRow = tbody.firstElementChild;
        if (newRow && highlightClass) {
            newRow.classList.add(highlightClass);
            setTimeout(() => {
                newRow.classList.remove(highlightClass);
            }, 2600);
        }
        return newRow;
    }

    /**
     * ค่อยๆ เลื่อนจางแถวออก (Fade-out slide) แล้วลบออกจาก DOM
     * @param {HTMLElement} rowEl - แถว <tr> ที่ต้องการลบ
     * @param {number} durationMs - ระยะเวลา Transition มิลลิวินาที (ค่าเริ่มต้น 600)
     * @param {Function|null} onComplete - ฟังก์ชันเรียกกลับหลังลบเสร็จ
     */
    static removeRowWithFade(rowEl, durationMs = 600, onComplete = null) {
        if (!rowEl) {
            if (typeof onComplete === 'function') onComplete();
            return;
        }

        rowEl.classList.add('row-leave-fade');
        setTimeout(() => {
            if (rowEl && rowEl.parentNode) {
                rowEl.remove();
            }
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }, durationMs);
    }

    /**
     * อัปเดตไฮไลต์แถวเมื่อมีการแก้ไขข้อมูล (Amber Pulse)
     * @param {HTMLElement} rowEl - แถว <tr> ที่ต้องการกะพริบ
     */
    static highlightRowUpdate(rowEl) {
        if (!rowEl) return;
        rowEl.classList.remove('row-update-highlight');
        void rowEl.offsetWidth; // บังคับ Re-flow
        rowEl.classList.add('row-update-highlight');
        setTimeout(() => {
            rowEl.classList.remove('row-update-highlight');
        }, 2100);
    }

    /**
     * นับตัวเลขอย่างนุ่มนวลจาก startVal ไปยัง endVal พร้อม Effect Badge Pop
     * @param {HTMLElement} element - element ที่บรรจุตัวเลข
     * @param {number} startVal - ค่าเริ่มต้น
     * @param {number} endVal - ค่าสิ้นสุด
     * @param {number} durationMs - ระยะเวลาแอนิเมชัน (มิลลิวินาที)
     */
    static animateNumericValue(element, startVal, endVal, durationMs = 800) {
        if (!element) return;
        const start = parseInt(startVal, 10) || 0;
        const end = parseInt(endVal, 10) || 0;

        if (start === end) {
            element.textContent = String(end);
            return;
        }

        element.classList.remove('counter-badge-pop');
        void element.offsetWidth; // บังคับ Re-flow
        element.classList.add('counter-badge-pop');

        const startTime = performance.now();
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            // Ease-out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * ease);
            element.textContent = String(current);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = String(end);
                setTimeout(() => {
                    element.classList.remove('counter-badge-pop');
                }, 300);
            }
        };
        requestAnimationFrame(step);
    }
}
