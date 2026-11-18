/**
 * @file assets/js/components/SystemUpdateModal.js
 * @description คอมโพเนนต์แสดงป้ายกำกับเวอร์ชัน (Version Badge) และหน้าต่างประกาศระบบ (DB-Driven System Announcement Modal)
 * รองรับโหมดข้อความ (Auto-Formatted Cards + ป้องกัน XSS) และโหมดรูปภาพแนวมือถือ (Mobile-First Image Showcase)
 * พร้อมระบบนับการรับทราบ 1 ครั้งต่อ 1 รอบประกาศ (bma_last_seen_announcement_id) ข้ามทั้งหน้า Login และ Session 7 วัน
 */

export class SystemUpdateModal {
    static STORAGE_KEY = 'bma_last_seen_update_build';
    static ANNOUNCEMENT_STORAGE_KEY = 'bma_last_seen_announcement_id';
    static MODAL_CONTAINER_ID = 'bmaSystemUpdateModal';
    static #versionData = null;
    static #currentBuildId = null;
    static #announcementSettings = null;
    static #activeModalMode = 'version'; // 'announcement' | 'version'
    static #activeAnnouncementToken = '';
    static #activeIsPreview = false;
    static #escKeyHandler = null;

    static DEFAULT_DATA = {
        appVersion: 'v2.10.0',
        buildId: '20261117_v2100',
        releaseNotes: {
            releaseDate: '17 พฤศจิกายน 2569',
            title: 'แจ้งปรับปรุง ระบบลงเวลาปฏิบัติราชการ (สตบ.)',
            highlights: [
                {
                    icon: 'fa-mobile-screen-button',
                    color: 'emerald',
                    title: 'ปรับปรุงหน้าลงเวลาปฏิบัติราชการใหม่ ใช้ง่ายกว่าเดิม',
                    desc: 'รูปแบบ Ultra Zero-Scroll แบ่งสัดส่วนภาพถ่ายและแผนที่ชัดเจน พร้อมกล้องเต็มจอและรองรับการใช้งานบนมือถืออย่างเต็มประสิทธิภาพ'
                },
                {
                    icon: 'fa-location-dot',
                    color: 'teal',
                    title: 'เพิ่มเลือก "ในสถานที่/นอกสถานที่" และจำกัดรัศมีลงเวลากรณีใช้ในสถานที่',
                    desc: 'ต้องอยู่ในพิกัดรัศมีสถานที่ราชการที่กำหนดเท่านั้นจึงลงเวลาในสถานที่ได้ และรองรับการปฏิบัติงานนอกสถานที่พร้อมระบุลักษณะงาน'
                },
                {
                    icon: 'fa-arrows-rotate',
                    color: 'indigo',
                    title: 'ระบบผู้ดูแล Admin เพิ่มฟังก์ชัน Sync ข้อมูล RealTime',
                    desc: 'ข้อมูลอัปเดตอัตโนมัติแบบเรียลไทม์ ไม่ต้องคอยรีเฟรชหน้าจอ และแจ้งเตือนเมื่อมีผู้ดูแลดำเนินการพร้อมกัน'
                },
                {
                    icon: 'fa-print',
                    color: 'emerald',
                    title: 'แก้ไขการพิมพ์ข้อมูลหน้ารายงาน ให้สวยงามและตารางต่อเนื่อง',
                    desc: 'ปรับปรุงการพิมพ์ PDF หน้ารายงานให้ตารางต่อเนื่องไม่เว้นช่วงหน้ากระดาษ พร้อมแสดงสถานที่ลงเวลาชัดเจน'
                }
            ]
        }
    };

    /**
     * ดึงค่า Build ID ปัจจุบันของแอปอย่างปลอดภัย
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
     * ป้องกัน XSS Injection ในข้อความ
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
     * ตรวจสอบความปลอดภัยและแปลงลิงก์รูปภาพ Google Drive ให้แสดงผลผ่าน Direct URL
     * @param {string} rawUrl
     * @returns {string}
     */
    static sanitizeImageUrl(rawUrl) {
        const cleanUrl = String(rawUrl || '').trim();
        if (!cleanUrl) return '';
        const isSafe = /^(?:https?:\/\/[^\s'"()<>]+|data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)$/i.test(cleanUrl);
        if (!isSafe) return '';

        if (/(?:drive\.google\.com|docs\.google\.com)/i.test(cleanUrl)) {
            const match = cleanUrl.match(/(?:\/d\/|[?&]id=|\/file\/d\/)([-\w]{20,})/);
            if (match && match[1]) {
                return `https://lh3.googleusercontent.com/d/${match[1]}`;
            }
        }
        return cleanUrl;
    }

    /**
     * คืนค่าวันที่ปัจจุบันตามเวลาประเทศไทย (Asia/Bangkok, UTC+7) ในรูปแบบ YYYY-MM-DD
     * @param {Date} [referenceDate=new Date()]
     * @returns {string}
     */
    static getTodayBangkokISO(referenceDate = new Date()) {
        try {
            const fmt = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Bangkok',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            const formatted = fmt.format(referenceDate);
            if (/^\d{4}-\d{2}-\d{2}$/.test(formatted)) {
                return formatted;
            }
        } catch (_) {}

        const bangkokMs = referenceDate.getTime() + (7 * 60 * 60 * 1000);
        const d = new Date(bangkokMs);
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    /**
     * ตรวจสอบว่าประกาศระบบอยู่ในสถานะเปิดใช้งานและอยู่ในช่วงวันที่กำหนดหรือไม่ (เวลาไทย UTC+7 แบบรวมวัน)
     * @param {Object} settings
     * @param {Date} [referenceDate=new Date()]
     * @returns {boolean}
     */
    static isAnnouncementActive(settings, referenceDate = new Date()) {
        if (!settings || settings.announcement_enabled !== true) {
            return false;
        }

        const mode = settings.announcement_mode === 'image' ? 'image' : 'text';
        if (mode === 'image') {
            if (!this.sanitizeImageUrl(settings.announcement_image_url)) {
                return false;
            }
        } else {
            const hasTitle = Boolean(String(settings.announcement_title || '').trim());
            const hasBody = Boolean(String(settings.announcement_body || '').trim());
            if (!hasTitle && !hasBody) {
                return false;
            }
        }

        const today = this.getTodayBangkokISO(referenceDate);
        const startDate = String(settings.announcement_start_date || '').trim();
        const endDate = String(settings.announcement_end_date || '').trim();

        if (startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate) && today < startDate) {
            return false;
        }
        if (endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate) && today > endDate) {
            return false;
        }

        return true;
    }

    /**
     * คืนค่า Token รอบประกาศสำหรับการจดจำการรับทราบ (bma_last_seen_announcement_id)
     * @param {Object} settings
     * @returns {string}
     */
    static getAnnouncementToken(settings) {
        const updatedAt = String(settings?.announcement_updated_at || '').trim();
        if (updatedAt) return updatedAt;
        const sig = `${settings?.announcement_mode || 'text'}|${settings?.announcement_title || ''}|${settings?.announcement_body || ''}|${settings?.announcement_image_url || ''}|${settings?.announcement_start_date || ''}`;
        let hash = 2166136261;
        for (let i = 0; i < sig.length; i++) {
            hash ^= sig.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return `ann_${sig.length}_${(hash >>> 0).toString(36)}`;
    }

    /**
     * แปลงข้อความประกาศให้เป็นย่อหน้าและรายการไฮไลต์การ์ดสวยอัตโนมัติ (XSS Safe)
     * รองรับบรรทัดขึ้นต้นด้วย -, •, *, หรือ 1.
     * @param {string} rawBody
     * @returns {string}
     */
    static formatAnnouncementBodyHtml(rawBody) {
        const lines = String(rawBody || '').split(/\r?\n/);
        const blocks = [];
        const palette = [
            { bg: 'bg-emerald-50 dark:bg-slate-800/80 border-emerald-100 dark:border-slate-700', badge: 'bg-emerald-600', text: 'text-emerald-950 dark:text-slate-100' },
            { bg: 'bg-teal-50 dark:bg-slate-800/80 border-teal-100 dark:border-slate-700', badge: 'bg-teal-600', text: 'text-teal-950 dark:text-slate-100' },
            { bg: 'bg-indigo-50 dark:bg-slate-800/80 border-indigo-100 dark:border-slate-700', badge: 'bg-indigo-600', text: 'text-indigo-950 dark:text-slate-100' },
            { bg: 'bg-amber-50 dark:bg-slate-800/80 border-amber-100 dark:border-slate-700', badge: 'bg-amber-600', text: 'text-amber-950 dark:text-slate-100' }
        ];
        let bulletIdx = 0;

        for (const rawLine of lines) {
            const trimmed = rawLine.trim();
            if (!trimmed) continue;

            const bulletMatch = trimmed.match(/^(?:[-•*]|\d+\.)\s+(.+)$/);
            if (bulletMatch) {
                const style = palette[bulletIdx % palette.length];
                const numMatch = trimmed.match(/^(\d+)\.\s+/);
                const iconHtml = numMatch
                    ? `<span class="font-bold text-[11px]">${this.#escapeHtml(numMatch[1])}</span>`
                    : '<i class="fa-solid fa-check text-[10px]"></i>';
                bulletIdx++;
                blocks.push(`
                    <div class="p-3 rounded-2xl ${style.bg} border flex gap-3 items-start transition-all">
                        <span class="w-6 h-6 rounded-xl ${style.badge} text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                            ${iconHtml}
                        </span>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs sm:text-[13px] ${style.text} font-medium leading-relaxed break-words">${this.#escapeHtml(bulletMatch[1])}</p>
                        </div>
                    </div>
                `);
            } else {
                blocks.push(`
                    <p class="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed break-words px-1">${this.#escapeHtml(trimmed)}</p>
                `);
            }
        }

        if (blocks.length === 0) {
            return '<p class="text-xs text-slate-400 italic text-center py-4">ไม่มีรายละเอียดเพิ่มเติม</p>';
        }
        return `<div class="space-y-2.5">${blocks.join('')}</div>`;
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
     * กำหนดค่าเริ่มต้นและติดตั้ง Version Badge (ไม่เด้ง version.json อัตโนมัติอีกต่อไป)
     * หากส่ง options.settings มาด้วย จะตรวจสอบประกาศจากฐานข้อมูลทันที
     * @param {Object} options
     * @returns {Promise<typeof SystemUpdateModal>}
     */
    static async init(options = {}) {
        const { targetBadgeSlot = '#loginVersionBadgeSlot', settings = null } = options;

        if (settings) {
            this.#announcementSettings = settings;
        }

        await this.fetchVersionData();
        this.renderBadge(targetBadgeSlot);

        if (settings) {
            this.checkAndShowAnnouncement(settings);
        }

        return this;
    }

    /**
     * เริ่มต้นคอมโพเนนต์พร้อมข้อมูล system_settings สำหรับตรวจสอบประกาศระบบ
     * @param {Object} settings
     * @param {Object} [options={}]
     * @returns {Promise<typeof SystemUpdateModal>}
     */
    static async initWithAnnouncement(settings, options = {}) {
        this.#announcementSettings = settings || null;
        await this.init({
            ...options,
            settings: this.#announcementSettings
        });
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
     * เมื่อคลิกจะเปิดประกาศที่กำลังใช้งานอยู่ หรือสรุปข้อมูลเวอร์ชันปัจจุบัน
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
                title="คลิกเพื่อดูประกาศและรายละเอียดระบบ (${appVersion})"
                aria-label="รายละเอียดเวอร์ชัน ${appVersion}"
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
                if (this.#announcementSettings && this.isAnnouncementActive(this.#announcementSettings)) {
                    this.showAnnouncement(this.#announcementSettings, { isPreview: false });
                } else {
                    this.show();
                }
            });
        }
    }

    /**
     * (Retired version.json auto-popup) ตรวจสอบประกาศระบบจากฐานข้อมูลแทนหากมี
     */
    static checkAndShowAuto() {
        if (this.#announcementSettings) {
            return this.checkAndShowAnnouncement(this.#announcementSettings);
        }
        return false;
    }

    /**
     * ตรวจสอบประกาศจาก system_settings และแสดงป๊อปอัปอัตโนมัติเพียง 1 ครั้งต่อรอบประกาศ
     * @param {Object} settings
     * @returns {boolean} true หากแสดงป๊อปอัปประกาศ, false หากไม่เข้าเงื่อนไขหรือเคยรับทราบแล้ว
     */
    static checkAndShowAnnouncement(settings) {
        if (!settings) return false;
        this.#announcementSettings = settings;

        if (!this.isAnnouncementActive(settings)) {
            return false;
        }

        const token = this.getAnnouncementToken(settings);
        try {
            const lastSeen = localStorage.getItem(this.ANNOUNCEMENT_STORAGE_KEY);
            if (lastSeen && lastSeen === token) {
                return false;
            }
        } catch (err) {
            console.warn('[SystemUpdateModal] Error reading announcement acknowledgment:', err);
        }

        this.showAnnouncement(settings, { isPreview: false });
        return true;
    }

    /**
     * แสดงหน้าต่างประกาศระบบตามรูปแบบ (ข้อความ หรือ รูปภาพแทนตัวหนังสือ)
     * @param {Object} settings
     * @param {Object} [options={}]
     * @param {boolean} [options.isPreview=false]
     */
    static showAnnouncement(settings, { isPreview = false } = {}) {
        if (!settings) return;
        this.#injectStyles();
        this.close(false);

        const mode = settings.announcement_mode === 'image' ? 'image' : 'text';
        const rawTitle = String(settings.announcement_title || '').trim() || 'ประกาศจากระบบ';
        const safeTitle = this.#escapeHtml(rawTitle);
        const safeImageUrl = this.sanitizeImageUrl(settings.announcement_image_url);
        const startDate = String(settings.announcement_start_date || '').trim();
        const endDate = String(settings.announcement_end_date || '').trim();

        this.#activeModalMode = 'announcement';
        this.#activeAnnouncementToken = this.getAnnouncementToken(settings);
        this.#activeIsPreview = Boolean(isPreview);

        const dateLabelParts = [];
        if (startDate) dateLabelParts.push(`เริ่ม ${this.#escapeHtml(startDate)}`);
        if (endDate) dateLabelParts.push(`ถึง ${this.#escapeHtml(endDate)}`);
        const dateSubtitle = dateLabelParts.length > 0 ? dateLabelParts.join(' • ') : '';

        const modalDiv = document.createElement('div');
        modalDiv.id = this.MODAL_CONTAINER_ID;
        modalDiv.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto select-none bma-modal-backdrop-anim';
        modalDiv.setAttribute('role', 'dialog');
        modalDiv.setAttribute('aria-modal', 'true');
        modalDiv.setAttribute('aria-labelledby', 'bmaUpdateModalTitle');

        const previewPillHtml = isPreview
            ? '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/25 border border-amber-300/50 text-[#F6DE51] text-[10px] font-bold mb-1.5"><i class="fa-solid fa-eye"></i> โหมดตัวอย่าง (Preview)</span>'
            : '';

        const ackButtonText = isPreview ? 'ปิดตัวอย่างประกาศ' : 'รับทราบ';

        if (mode === 'image') {
            modalDiv.innerHTML = `
                <div id="bmaUpdateModalCard" class="w-full max-w-md my-auto bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative flex flex-col max-h-[92dvh] bma-modal-card-anim">
                    <div class="bg-gradient-to-r from-[#00351B] to-[#00744B] px-5 py-3.5 text-white relative shrink-0 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <span class="w-8 h-8 rounded-xl bg-white/15 text-[#F6DE51] flex items-center justify-center shrink-0 border border-white/20">
                                <i class="fa-solid fa-bullhorn text-sm"></i>
                            </span>
                            <div class="min-w-0">
                                ${previewPillHtml}
                                <h3 id="bmaUpdateModalTitle" class="text-sm sm:text-base font-bold text-white leading-snug truncate">${safeTitle}</h3>
                            </div>
                        </div>
                        <button
                            id="btnModalCloseTopX"
                            type="button"
                            class="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 text-white flex items-center justify-center transition cursor-pointer shrink-0"
                            title="ปิดหน้าต่าง"
                            aria-label="ปิดหน้าต่าง"
                        >
                            <i class="fa-solid fa-xmark text-sm"></i>
                        </button>
                    </div>

                    <div class="p-3 sm:p-4 overflow-y-auto overscroll-contain flex-1 min-h-0 bg-slate-100 dark:bg-slate-900/70 flex flex-col">
                        ${safeImageUrl ? `
                            <div class="w-full flex flex-col items-center justify-center my-auto">
                                <img
                                    id="bmaAnnouncementModalImg"
                                    src="${this.#escapeHtml(safeImageUrl)}"
                                    alt="${safeTitle}"
                                    class="max-h-[70dvh] w-auto max-w-full object-contain rounded-2xl shadow-md bg-white dark:bg-slate-800"
                                />
                                <div id="bmaAnnouncementImgErrorBox" class="hidden flex-col items-center justify-center py-8 px-4 text-center text-slate-500 dark:text-slate-400">
                                    <i class="fa-regular fa-image text-3xl mb-2 text-rose-400"></i>
                                    <p class="text-xs font-semibold text-rose-600 dark:text-rose-400">ไม่สามารถโหลดรูปภาพประกาศได้</p>
                                    <p class="text-[11px] mt-1">กรุณาตรวจสอบลิงก์รูปภาพหรือสิทธิ์การเข้าถึงบน Google Drive</p>
                                </div>
                            </div>
                        ` : `
                            <div class="py-8 px-4 text-center text-slate-500 dark:text-slate-400 text-xs">
                                <i class="fa-regular fa-image text-3xl mb-2 opacity-60"></i>
                                <p>ยังไม่ได้ระบุลิงก์รูปภาพประกาศ</p>
                            </div>
                        `}
                    </div>

                    <div class="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-center shrink-0">
                        <button
                            id="btnModalCloseBottomAck"
                            type="button"
                            class="w-full max-w-[260px] py-2.5 px-6 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#00351B] to-[#00744B] hover:brightness-110 active:scale-95 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <i class="fa-solid fa-circle-check"></i>
                            <span>${ackButtonText}</span>
                        </button>
                    </div>
                </div>
            `;
        } else {
            const bodyHtml = this.formatAnnouncementBodyHtml(settings.announcement_body);
            modalDiv.innerHTML = `
                <div id="bmaUpdateModalCard" class="w-full max-w-md my-auto bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative flex flex-col max-h-[90dvh] bma-modal-card-anim">
                    <div class="bg-gradient-to-r from-[#00351B] to-[#00744B] p-5 text-white text-center relative shrink-0">
                        <button
                            id="btnModalCloseTopX"
                            type="button"
                            class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 text-white flex items-center justify-center transition cursor-pointer"
                            title="ปิดหน้าต่าง"
                            aria-label="ปิดหน้าต่าง"
                        >
                            <i class="fa-solid fa-xmark text-sm"></i>
                        </button>

                        ${previewPillHtml ? `<div class="mb-1">${previewPillHtml}</div>` : ''}
                        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-[#F6DE51] text-xl shadow-inner mb-2 border border-white/20">
                            <i class="fa-solid fa-bullhorn drop-shadow-sm"></i>
                        </div>
                        <h3 id="bmaUpdateModalTitle" class="text-base sm:text-lg font-black tracking-wide text-white drop-shadow-sm leading-snug px-2">${safeTitle}</h3>
                        ${dateSubtitle ? `<p class="text-[11px] text-emerald-100/90 font-medium mt-1">${dateSubtitle}</p>` : ''}
                    </div>

                    <div class="p-5 overflow-y-auto overscroll-contain flex-1 min-h-0 text-slate-800 dark:text-slate-100">
                        ${bodyHtml}
                    </div>

                    <div class="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center shrink-0">
                        <button
                            id="btnModalCloseBottomAck"
                            type="button"
                            class="w-full max-w-[260px] py-2.5 px-6 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#00351B] to-[#00744B] hover:brightness-110 active:scale-95 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <i class="fa-solid fa-circle-check"></i>
                            <span>${ackButtonText}</span>
                        </button>
                    </div>
                </div>
            `;
        }

        document.body.appendChild(modalDiv);
        if (typeof document !== 'undefined' && document.body?.classList?.add) {
            document.body.classList.add('bma-modal-open');
        }

        if (mode === 'image') {
            const imgEl = modalDiv.querySelector('#bmaAnnouncementModalImg');
            const errBox = modalDiv.querySelector('#bmaAnnouncementImgErrorBox');
            if (imgEl && errBox) {
                imgEl.addEventListener('error', () => {
                    imgEl.classList.add('hidden');
                    errBox.classList.remove('hidden');
                    errBox.classList.add('flex');
                });
            }
        }

        this.#bindModalCloseHandlers(modalDiv);
    }

    /**
     * ผูก Event ปิด Modal (X, ปุ่มรับทราบ, Backdrop, ESC)
     * @param {HTMLElement} modalDiv
     */
    static #bindModalCloseHandlers(modalDiv) {
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

        modalDiv.addEventListener('click', (e) => {
            if (e.target === modalDiv) {
                this.close(true);
            }
        });

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
     * เปิดหน้าต่างสรุปข้อมูลเวอร์ชันปัจจุบัน (เรียกเมื่อกด Badge เวอร์ชันในกรณีที่ไม่มีประกาศเปิดใช้งาน)
     */
    static show() {
        this.#injectStyles();
        this.close(false);

        this.#activeModalMode = 'version';
        this.#activeAnnouncementToken = '';
        this.#activeIsPreview = false;

        const versionData = this.#versionData || this.DEFAULT_DATA;
        const notes = versionData.releaseNotes || this.DEFAULT_DATA.releaseNotes;
        const rawAppVersion = versionData.appVersion || this.DEFAULT_DATA.appVersion;
        const rawTitle = notes.title || 'รายละเอียดเวอร์ชันระบบ';
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

        const highlights = Array.isArray(notes.highlights) && notes.highlights.length > 0
            ? notes.highlights
            : (Array.isArray(this.DEFAULT_DATA?.releaseNotes?.highlights) && this.DEFAULT_DATA.releaseNotes.highlights.length > 0
                ? this.DEFAULT_DATA.releaseNotes.highlights
                : fallbackHighlights);

        const modalDiv = document.createElement('div');
        modalDiv.id = this.MODAL_CONTAINER_ID;
        modalDiv.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto select-none bma-modal-backdrop-anim';
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
            <div id="bmaUpdateModalCard" class="w-full max-w-md my-auto bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative flex flex-col max-h-[90dvh] bma-modal-card-anim">
                <div class="bg-gradient-to-r from-[#00351B] to-[#00744B] p-5 text-white text-center relative shrink-0">
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

                <div class="p-5 overflow-y-auto overscroll-contain space-y-3 flex-1 min-h-0 text-slate-800 dark:text-slate-100 text-xs">
                    <div class="text-slate-500 dark:text-slate-400 font-medium text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span>รายละเอียดฟังก์ชันและประสิทธิภาพที่ได้รับการปรับปรุง:</span>
                        <span class="font-mono text-[10px] text-slate-400 dark:text-slate-500">${buildId ? `Build ${buildId}` : ''}</span>
                    </div>
                    <div class="space-y-2.5">
                        ${highlightsHtml}
                    </div>
                </div>

                <div class="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center shrink-0">
                    <button
                        id="btnModalCloseBottomAck"
                        type="button"
                        class="w-full max-w-[260px] py-2.5 px-6 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#00351B] to-[#00744B] hover:brightness-110 active:scale-95 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <i class="fa-solid fa-circle-check"></i>
                        <span>รับทราบ</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalDiv);
        if (typeof document !== 'undefined' && document.body?.classList?.add) {
            document.body.classList.add('bma-modal-open');
        }
        this.#bindModalCloseHandlers(modalDiv);
    }

    /**
     * Alias for show()
     */
    static open() {
        this.show();
    }

    /**
     * ปิดหน้าต่าง Modal พร้อมบันทึกสถานะการรับทราบประกาศลง localStorage (หากไม่ใช่ Preview)
     * @param {boolean} [saveAcknowledge=true]
     */
    static close(saveAcknowledge = true) {
        if (saveAcknowledge && this.#activeModalMode === 'announcement' && !this.#activeIsPreview && this.#activeAnnouncementToken) {
            try {
                localStorage.setItem(this.ANNOUNCEMENT_STORAGE_KEY, this.#activeAnnouncementToken);
            } catch (err) {
                console.warn('[SystemUpdateModal] Error saving announcement acknowledgment:', err);
            }
        }

        if (this.#escKeyHandler) {
            if (typeof window !== 'undefined' && window.removeEventListener) {
                window.removeEventListener('keydown', this.#escKeyHandler);
            }
            this.#escKeyHandler = null;
        }

        const modalDiv = document.getElementById(this.MODAL_CONTAINER_ID);
        if (modalDiv && modalDiv.parentNode) {
            modalDiv.parentNode.removeChild(modalDiv);
        }

        if (typeof document !== 'undefined' && document.body?.classList?.remove) {
            const hasOtherModal = typeof document.querySelectorAll === 'function'
                ? Array.from(document.querySelectorAll('.fixed.inset-0:not(.hidden)')).some(
                    (el) => el && el.id !== 'bmaSidebarBackdrop' && !(typeof el.closest === 'function' && el.closest('.hidden')) && !el.classList?.contains?.('invisible')
                )
                : false;
            if (!hasOtherModal) {
                document.body.classList.remove('bma-modal-open');
            }
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
