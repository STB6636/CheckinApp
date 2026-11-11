/**
 * @file assets/js/components/SystemUpdateModal.js
 * @description คอมโพเนนต์แสดงป้ายกำกับเวอร์ชัน (Version Badge) และหน้าต่างป๊อปอัปแจ้งเตือนการอัปเดตระบบ (What's New / System Update Modal)
 * พัฒนาแบบ OOP สมบูรณ์แบบ (Pure OOP Component), ดึงข้อมูลเวอร์ชันแบบไดนามิกจาก version.json พร้อม Fallback
 * และมีระบบตรวจสอบการเปิดดูอัตโนมัติเพียง 1 ครั้งต่อเวอร์ชันอัปเดต (Single-view per build update)
 */

export class SystemUpdateModal {
    static STORAGE_KEY = 'bma_last_seen_update_build';
    static MODAL_CONTAINER_ID = 'bmaSystemUpdateModal';
    static #versionData = null;
    static #currentBuildId = null;
    static #escKeyHandler = null;

    static DEFAULT_DATA = {
        appVersion: 'v2.9.2',
        buildId: '20261111_f9aeaab1',
        releaseNotes: {
            releaseDate: '11 พฤศจิกายน 2569',
            title: 'ปรับปรุงรูปแบบระบบลงเวลาและระบบ Sync Data RealTime ของผู้ดูแลระบบ',
            highlights: [
                {
                    icon: 'fa-satellite-dish',
                    color: 'teal',
                    title: 'รีเฟรช GPS สดจากดาวเทียม',
                    desc: 'ดึงพิกัดสดจากชิป GPS โดยตรง ไม่ค้างพิกัดเก่าจากแคช พร้อมระบบล็อกปุ่มและไอคอนหมุนแสดงสถานะ'
                },
                {
                    icon: 'fa-map-location-dot',
                    color: 'emerald',
                    title: 'ระบบค้นหาสถานที่อัจฉริยะ 5 ระดับ (5-Tier)',
                    desc: 'ค้นหาสถานที่สำคัญจริง (ราชการ, วัด, รพ., ร้านค้า) ก่อนชื่อถนน/ซอย แก้ปัญหาพิกัดหลุดเป็นชื่อซอย'
                },
                {
                    icon: 'fa-clock',
                    color: 'indigo',
                    title: 'ปรับรูปแบบเวลาปัจจุบัน (ชั่วโมง:นาที น.)',
                    desc: 'แสดงเวลาแบบสบายตาและกระชับในรูปแบบ HH:mm น. โดยตัดหน่วยวินาทีออก'
                }
            ]
        }
    };

    /**
     * ดึงค่า Build ID ปัจจุบันของแอปอย่างปลอดภัย (Fallback จาก localStorage หรือ DEFAULT_DATA)
     * @returns {string}
     */
    static getCurrentAppBuild() {
        if (typeof localStorage !== 'undefined') {
            try {
                const storedBuild = localStorage.getItem('bma_app_build');
                if (storedBuild && typeof storedBuild === 'string' && storedBuild.trim()) {
                    return storedBuild.trim();
                }
            } catch (_) {}
        }
        return this.DEFAULT_DATA.buildId;
    }

    /**
     * Helper สำหรับป้องกัน XSS Injection ในข้อความ
     * @param {string} str
     * @returns {string}
     */
    static #escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * คำนวณ URL สำหรับ fetch version.json ให้แม่นยำทุก path
     * @returns {string}
     */
    static #resolveVersionUrl() {
        if (typeof window !== 'undefined' && window.location && window.location.origin) {
            try {
                const basePath = window.location.pathname.replace(/\/[^/]*$/, '/');
                return new URL('version.json', window.location.origin + basePath).href;
            } catch (_) {}
        }
        return './version.json';
    }

    /**
     * ติดตั้ง CSS Animations และสไตล์ที่จำเป็นแบบ Self-contained
     */
    static #injectStyles() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('bmaSystemUpdateModalStyles')) return;

        const style = document.createElement('style');
        style.id = 'bmaSystemUpdateModalStyles';
        style.textContent = `
            @keyframes bmaModalBackdropFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes bmaModalCardPopIn {
                from { opacity: 0; transform: scale(0.95) translateY(8px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .bma-modal-backdrop-anim {
                animation: bmaModalBackdropFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .bma-modal-card-anim {
                animation: bmaModalCardPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            body.bma-modal-open {
                overflow: hidden !important;
            }
            .fa-sparkles:not(.fa-wand-magic-sparkles):before {
                content: "\\f005";
            }
        `;
        const head = document.head || (typeof document.getElementsByTagName === 'function' && document.getElementsByTagName('head')?.[0]) || document.body;
        if (head?.appendChild) {
            head.appendChild(style);
        }
    }

    /**
     * กำหนดค่าเริ่มต้นและติดตั้ง Badge / Modal
     * @param {Object} options
     * @param {string} [options.targetBadgeSlot='#loginVersionBadgeSlot']
     * @param {boolean} [options.autoShow=true]
     * @returns {Promise<typeof SystemUpdateModal>}
     */
    static async init(options = {}) {
        const { targetBadgeSlot = '#loginVersionBadgeSlot', autoShow = true } = options;

        await this.fetchVersionData();
        this.renderBadge(targetBadgeSlot);

        if (autoShow) {
            this.checkAndShowAuto();
        }

        return this;
    }

    /**
     * ดึงข้อมูล metadata เวอร์ชันจาก version.json พร้อม Fallback อัตโนมัติ
     * @returns {Promise<Object>}
     */
    static async fetchVersionData() {
        const fallbackBuildId = this.getCurrentAppBuild();

        try {
            const versionUrl = this.#resolveVersionUrl();
            const res = await fetch(`${versionUrl}?_t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data && (data.buildId || data.appVersion)) {
                    this.#versionData = {
                        appVersion: data.appVersion || this.DEFAULT_DATA.appVersion,
                        buildId: data.buildId || fallbackBuildId,
                        releaseNotes: data.releaseNotes || this.DEFAULT_DATA.releaseNotes
                    };
                    this.#currentBuildId = data.buildId || fallbackBuildId;
                    return this.#versionData;
                }
            }
        } catch (err) {
            console.warn('[SystemUpdateModal] Could not fetch version.json, using fallback:', err);
        }

        this.#versionData = {
            ...this.DEFAULT_DATA,
            buildId: fallbackBuildId
        };
        this.#currentBuildId = fallbackBuildId;
        return this.#versionData;
    }

    /**
     * เรนเดอร์ป้ายกำกับเวอร์ชัน (Version Badge) สไตล์ Glassmorphism ในตำแหน่งที่กำหนด
     * @param {string|HTMLElement} targetSlotSelector
     */
    static renderBadge(targetSlotSelector = '#loginVersionBadgeSlot') {
        this.#injectStyles();
        const slotEl = typeof targetSlotSelector === 'string'
            ? document.querySelector(targetSlotSelector)
            : targetSlotSelector;

        if (!slotEl) {
            console.warn(`[SystemUpdateModal] Target badge slot '${targetSlotSelector}' not found.`);
            return;
        }

        const rawVersion = this.#versionData?.appVersion || this.DEFAULT_DATA.appVersion;
        const appVersion = this.#escapeHtml(rawVersion);

        slotEl.innerHTML = `
            <button
                id="btnLoginVersionBadge"
                type="button"
                class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/15 hover:bg-white/30 active:scale-95 text-white backdrop-blur-md border border-white/25 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer select-none"
                title="คลิกเพื่อดูรายละเอียดการอัปเดตระบบ (${appVersion})"
                aria-label="รายละเอียดการอัปเดตระบบ เวอร์ชัน ${appVersion}"
            >
                <i class="fa-solid fa-wand-magic-sparkles fa-sparkles text-[9px] text-[#F6DE51]"></i>
                <span id="loginVersionBadgeText">${appVersion}</span>
            </button>
        `;

        const badgeBtn = slotEl.querySelector('#btnLoginVersionBadge');
        if (badgeBtn) {
            badgeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.show();
            });
        }
    }

    /**
     * ตรวจสอบว่าผู้ใช้เคยดูการแจ้งเตือนของ Build ปัจจุบันหรือยัง หากยังไม่เคยจะเปิด Modal อัตโนมัติ 1 ครั้ง
     */
    static checkAndShowAuto() {
        try {
            const lastSeenBuild = localStorage.getItem(this.STORAGE_KEY);
            const currentBuild = this.#currentBuildId || this.getCurrentAppBuild();

            if (currentBuild && lastSeenBuild !== currentBuild) {
                this.show();
            }
        } catch (err) {
            console.warn('[SystemUpdateModal] Error checking last seen build:', err);
        }
    }

    /**
     * เปิดหน้าต่างแจ้งเตือนการอัปเดตระบบ (What's New Modal)
     */
    static show() {
        this.#injectStyles();
        // ล้าง Modal เดิมถ้ามีค้างอยู่
        this.close(false);

        const versionData = this.#versionData || this.DEFAULT_DATA;
        const notes = versionData.releaseNotes || this.DEFAULT_DATA.releaseNotes;
        const rawAppVersion = versionData.appVersion || this.DEFAULT_DATA.appVersion;
        const rawTitle = notes.title || 'อัปเดตระบบใหม่';
        const rawReleaseDate = notes.releaseDate || '';
        const rawBuildId = versionData.buildId || this.getCurrentAppBuild();

        const appVersion = this.#escapeHtml(rawAppVersion);
        const title = this.#escapeHtml(rawTitle);
        const releaseDate = this.#escapeHtml(rawReleaseDate);
        const buildId = this.#escapeHtml(rawBuildId);

        const fallbackHighlights = [
            {
                icon: 'fa-circle-check',
                color: 'emerald',
                title: 'ปรับปรุงประสิทธิภาพการทำงานของระบบ',
                desc: 'ระบบได้รับการปรับปรุงประสิทธิภาพและความเสถียรทั่วไป'
            }
        ];

        let highlights = Array.isArray(notes.highlights) && notes.highlights.length > 0
            ? notes.highlights
            : (Array.isArray(this.DEFAULT_DATA?.releaseNotes?.highlights) && this.DEFAULT_DATA.releaseNotes.highlights.length > 0
                ? this.DEFAULT_DATA.releaseNotes.highlights
                : fallbackHighlights);

        const modalDiv = document.createElement('div');
        modalDiv.id = this.MODAL_CONTAINER_ID;
        modalDiv.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none bma-modal-backdrop-anim';
        modalDiv.setAttribute('role', 'dialog');
        modalDiv.setAttribute('aria-modal', 'true');
        modalDiv.setAttribute('aria-labelledby', 'bmaUpdateModalTitle');

        const highlightsHtml = highlights.map((h) => {
            const color = h.color || 'emerald';
            const hTitle = this.#escapeHtml(h.title || '');
            const hDesc = this.#escapeHtml(h.desc || '');
            const hIcon = this.#escapeHtml(h.icon || 'fa-check');

            const bgClass = color === 'teal'
                ? 'bg-teal-50 dark:bg-slate-800/80 border-teal-100 dark:border-slate-700'
                : color === 'indigo'
                    ? 'bg-indigo-50 dark:bg-slate-800/80 border-indigo-100 dark:border-slate-700'
                    : 'bg-emerald-50 dark:bg-slate-800/80 border-emerald-100 dark:border-slate-700';

            const iconBg = color === 'teal'
                ? 'bg-teal-600'
                : color === 'indigo'
                    ? 'bg-indigo-600'
                    : 'bg-emerald-600';

            const titleColor = color === 'teal'
                ? 'text-teal-950 dark:text-teal-300'
                : color === 'indigo'
                    ? 'text-indigo-950 dark:text-indigo-300'
                    : 'text-emerald-950 dark:text-emerald-300';

            const descColor = color === 'teal'
                ? 'text-teal-800/80 dark:text-slate-300'
                : color === 'indigo'
                    ? 'text-indigo-800/80 dark:text-slate-300'
                    : 'text-emerald-800/80 dark:text-slate-300';

            return `
                <div class="p-3 rounded-2xl ${bgClass} border flex gap-3 items-start transition-all">
                    <span class="w-7 h-7 rounded-xl ${iconBg} text-white flex items-center justify-center text-xs shrink-0 shadow-xs mt-0.5">
                        <i class="fa-solid ${hIcon}"></i>
                    </span>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold ${titleColor} text-xs sm:text-[13px] leading-snug">${hTitle}</h4>
                        <p class="text-[11px] ${descColor} mt-0.5 leading-relaxed">${hDesc}</p>
                    </div>
                </div>
            `;
        }).join('');

        modalDiv.innerHTML = `
            <div id="bmaUpdateModalCard" class="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative flex flex-col max-h-[90vh] bma-modal-card-anim">
                <!-- Header with BMA Green gradient & Civic Crest -->
                <div class="bg-gradient-to-r from-[#00351B] to-[#00744B] p-5 text-white text-center relative shrink-0">
                    <!-- Close button 1 (Top-Right): Circular X icon button -->
                    <button
                        id="btnModalCloseTopX"
                        type="button"
                        class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 text-white flex items-center justify-center transition cursor-pointer"
                        title="ปิดหน้าต่าง"
                        aria-label="ปิดหน้าต่าง"
                    >
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>

                    <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-[#F6DE51] text-xl shadow-inner mb-2 border border-white/20">
                        <i class="fa-solid fa-bullhorn drop-shadow-sm"></i>
                    </div>
                    <h3 id="bmaUpdateModalTitle" class="text-base sm:text-lg font-black tracking-wide text-white drop-shadow-sm leading-snug px-2">${title}</h3>
                    <p class="text-xs text-emerald-100 font-medium mt-0.5">
                        เวอร์ชัน <span class="font-bold text-[#F6DE51]">${appVersion}</span>${releaseDate ? ` &bull; ประจำวันที่ ${releaseDate}` : ''}
                    </p>
                </div>

                <!-- Scrollable Body with Highlights -->
                <div class="p-5 overflow-y-auto space-y-3 flex-1 text-slate-800 dark:text-slate-100 text-xs">
                    <div class="text-slate-500 dark:text-slate-400 font-medium text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span>รายละเอียดฟังก์ชันและประสิทธิภาพที่ได้รับการปรับปรุง:</span>
                        <span class="font-mono text-[10px] text-slate-400 dark:text-slate-500">${buildId ? `Build ${buildId}` : ''}</span>
                    </div>
                    <div class="space-y-2.5">
                        ${highlightsHtml}
                    </div>
                </div>

                <!-- Center-Bottom Close Action Button -->
                <div class="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center shrink-0">
                    <button
                        id="btnModalCloseBottomAck"
                        type="button"
                        class="w-full max-w-[260px] py-2.5 px-6 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#00351B] to-[#00744B] hover:brightness-110 active:scale-95 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <i class="fa-solid fa-circle-check"></i>
                        <span>รับทราบและเข้าสู่ระบบ</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalDiv);

        if (typeof document !== 'undefined' && document.body?.classList?.add) {
            document.body.classList.add('bma-modal-open');
        }

        // Bind Close Events
        const btnTopX = modalDiv.querySelector('#btnModalCloseTopX');
        const btnBottomAck = modalDiv.querySelector('#btnModalCloseBottomAck');

        if (btnTopX) {
            btnTopX.addEventListener('click', (e) => {
                e.preventDefault();
                this.close(true);
            });
        }

        if (btnBottomAck) {
            btnBottomAck.addEventListener('click', (e) => {
                e.preventDefault();
                this.close(true);
            });
        }

        // Click-outside backdrop handler
        modalDiv.addEventListener('click', (e) => {
            if (e.target === modalDiv) {
                this.close(true);
            }
        });

        // ESC key handler
        this.#escKeyHandler = (e) => {
            if (e.key === 'Escape' || e.keyCode === 27) {
                this.close(true);
            }
        };
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('keydown', this.#escKeyHandler);
        }
    }

    /**
     * Alias for show()
     */
    static open() {
        this.show();
    }

    /**
     * ปิดหน้าต่าง Modal พร้อมบันทึกสถานะการเปิดดูลง localStorage
     * @param {boolean} [saveAcknowledge=true]
     */
    static close(saveAcknowledge = true) {
        if (saveAcknowledge) {
            const currentBuild = this.#currentBuildId || this.getCurrentAppBuild();
            if (currentBuild) {
                try {
                    localStorage.setItem(this.STORAGE_KEY, currentBuild);
                } catch (err) {
                    console.warn('[SystemUpdateModal] Error saving last seen build:', err);
                }
            }
        }

        if (this.#escKeyHandler) {
            if (typeof window !== 'undefined' && window.removeEventListener) {
                window.removeEventListener('keydown', this.#escKeyHandler);
            }
            this.#escKeyHandler = null;
        }

        if (typeof document !== 'undefined' && document.body?.classList?.remove) {
            document.body.classList.remove('bma-modal-open');
        }

        const modalDiv = document.getElementById(this.MODAL_CONTAINER_ID);
        if (modalDiv && modalDiv.parentNode) {
            modalDiv.parentNode.removeChild(modalDiv);
        }
    }

    /**
     * คืนค่าข้อมูลเวอร์ชันที่แคชไว้
     * @returns {Object|null}
     */
    static getVersionData() {
        return this.#versionData || this.DEFAULT_DATA;
    }
}
