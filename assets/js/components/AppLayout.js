/**
 * @file assets/js/components/AppLayout.js
 * @description คลาสสร้างโครงสร้าง Layout ส่วนกลาง พร้อมระบบ AJAX SPA Navigation (โหลดเฉพาะ <main> ไม่ต้องโหลด Sidebar/Topbar/Footer ซ้ำ)
 */

import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { AttendanceModel } from '../models/AttendanceModel.js';
import { UserModel } from '../models/UserModel.js';

export class AppLayout {
    static #isLayoutMounted = false;
    static #currentUser = null;
    static #settings = null;

    // แผนผังจับคู่ไฟล์ HTML กับ Controller และชื่อเมนู
    static PAGE_ROUTES = {
        'dashboard.html': {
            activePage: 'dashboard',
            controllerPath: '../controllers/DashboardController.js',
            controllerClass: 'DashboardController'
        },
        'reports.html': {
            activePage: 'reports',
            controllerPath: '../controllers/ReportsController.js',
            controllerClass: 'ReportsController'
        },
        'approvals.html': {
            activePage: 'approvals',
            controllerPath: '../controllers/ApprovalsController.js',
            controllerClass: 'ApprovalsController'
        },
        'personnel.html': {
            activePage: 'personnel',
            controllerPath: '../controllers/PersonnelController.js',
            controllerClass: 'PersonnelController'
        },
        'users.html': {
            activePage: 'users',
            controllerPath: '../controllers/UsersController.js',
            controllerClass: 'UsersController'
        },
        'settings.html': {
            activePage: 'settings',
            controllerPath: '../controllers/SettingsController.js',
            controllerClass: 'SettingsController'
        }
    };

    /**
     * เริ่มต้นเรนเดอร์โครงสร้างหน้าจอผู้ดูแลระบบ
     * หาก Sidebar/Topbar/Footer ถูกสร้างไว้แล้ว (กรณีสลับหน้าด้วย AJAX) จะไม่อัปเดตซ้ำ แต่จะเปลี่ยนเฉพาะหัวข้อและสถานะเมนู
     */
    static async initAdminLayout({ activePage, pageTitle, pageSubtitle = '' }) {
        UIHelpers.initTheme();

        const allowedRoles = activePage === 'settings' ? ['SuperAdmin'] : ['SuperAdmin', 'Admin'];
        const currentUser = AuthService.requireAuth(allowedRoles);
        if (!currentUser) return { currentUser: null, settings: null };

        AppLayout.#currentUser = currentUser;
        AppLayout.#settings = await SettingsModel.getSettings();

        const sidebarEl = document.getElementById('bmaSidebarDrawer');
        if (!AppLayout.#isLayoutMounted || !sidebarEl) {
            // โหลดครั้งแรก: สร้าง Sidebar, Topbar, Mobile Nav, Footer ครบชุด
            AppLayout.#renderSidebar(currentUser, AppLayout.#settings, activePage);
            AppLayout.#renderTopbar(currentUser, AppLayout.#settings, pageTitle, pageSubtitle);
            AppLayout.#renderMobileBottomNav(currentUser, activePage);
            AppLayout.#renderFooter(AppLayout.#settings);
            AppLayout.#bindEvents();
            AppLayout.#initAjaxSpaRouter();
            AppLayout.#isLayoutMounted = true;

            window.addEventListener('bma:settings-updated', (e) => {
                AppLayout.#settings = e.detail;
                AppLayout.#renderSidebar(currentUser, AppLayout.#settings, activePage);
                AppLayout.#renderFooter(AppLayout.#settings);
            });
        } else {
            // โหลดผ่าน AJAX SPA: ไม่ต้องสร้าง Sidebar/Topbar/Footer ใหม่ เปลี่ยนเฉพาะชื่อหน้าและไฮไลต์เมนู
            AppLayout.#updateActiveNavState(activePage, pageTitle, pageSubtitle);
        }

        AppLayout.refreshNotificationBell(currentUser);
        return { currentUser, settings: AppLayout.#settings };
    }

    /**
     * อัปเดตเฉพาะสถานะเมนูที่เลือก (Active) และชื่อหัวข้อบน Topbar โดยไม่ต้องเรนเดอร์ Sidebar/Topbar ใหม่
     */
    static #updateActiveNavState(activePage, pageTitle, pageSubtitle) {
        const titleEl = document.getElementById('topbarPageTitle');
        const subEl = document.getElementById('topbarPageSubtitle');
        if (titleEl) titleEl.textContent = pageTitle;
        if (subEl) subEl.textContent = pageSubtitle || '';
        document.title = `${pageTitle} - กรุงเทพมหานคร`;

        // อัปเดตปุ่ม Active ใน Sidebar
        document.querySelectorAll('#bmaSidebarDrawer a[data-nav-id]').forEach(link => {
            const isMatch = link.dataset.navId === activePage;
            link.classList.toggle('active', isMatch);
        });

        // อัปเดตปุ่ม Active ใน Mobile Bottom Nav
        document.querySelectorAll('#bmaMobileBottomNav a[data-nav-id]').forEach(link => {
            const isMatch = link.dataset.navId === activePage;
            link.style.color = isMatch ? 'var(--bma-primary)' : '';
            link.classList.toggle('bma-text-sub', !isMatch);
        });

        // ปิด Sidebar Drawer บนมือถือหากเปิดค้างอยู่
        document.getElementById('bmaSidebarDrawer')?.classList.add('-translate-x-full');
        document.getElementById('bmaSidebarBackdrop')?.classList.add('hidden');
    }

    /**
     * ระบบ AJAX SPA Router ดักจับการคลิกเมนูหลังบ้านเพื่อโหลดเฉพาะ <main> พร้อมแสดง Spin + Progress Bar
     */
    static #initAjaxSpaRouter() {
        document.addEventListener('click', async (e) => {
            const anchor = e.target.closest('a[href]');
            if (!anchor) return;

            const href = anchor.getAttribute('href') || '';
            const cleanFile = href.split('?')[0].split('#')[0].split('/').pop();

            // ตรวจสอบว่าเป็นลิงก์ภายในระบบผู้ดูแลระบบทั้ง 6 หน้าหรือไม่
            if (!AppLayout.PAGE_ROUTES[cleanFile]) return;

            e.preventDefault();
            await AppLayout.navigateAjaxPage(cleanFile, true);
        });

        // รองรับการกดปุ่มย้อนกลับ/ไปข้างหน้า (Back / Forward) บนเบราว์เซอร์
        window.addEventListener('popstate', async () => {
            const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
            if (AppLayout.PAGE_ROUTES[currentFile]) {
                await AppLayout.navigateAjaxPage(currentFile, false);
            }
        });
    }

    /**
     * โหลดเนื้อหาเฉพาะหน้าเมนู (<main> และ Modal) แบบ AJAX พร้อมแสดง Spin + Progress Bar
     * @param {string} targetFile ชื่อไฟล์ HTML เช่น 'reports.html'
     * @param {boolean} pushHistory บันทึก URL ลง History หรือไม่
     */
    static async navigateAjaxPage(targetFile, pushHistory = true) {
        const routeInfo = AppLayout.PAGE_ROUTES[targetFile];
        if (!routeInfo) {
            window.location.href = targetFile;
            return;
        }

        UIHelpers.showLoading('กำลังสลับหน้าเมนู...');
        try {
            // ดึงไฟล์ HTML ปลายทางผ่าน Fetch API
            const response = await fetch(targetFile, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`ไม่สามารถโหลดหน้า ${targetFile} ได้`);
            }

            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            const newMain = doc.querySelector('main');
            const currentMain = document.querySelector('main');

            if (newMain && currentMain) {
                currentMain.replaceWith(newMain);
            }

            // ลบ Modal ประจำหน้าเดิมออก และนำ Modal ของหน้าใหม่มาใส่แทน (ยกเว้น Spinner และ Layout หลัก)
            document.querySelectorAll('.bma-page-modal-dynamic, body > div[id^="modal"]').forEach(el => el.remove());
            doc.querySelectorAll('body > div[id^="modal"]').forEach(modalEl => {
                modalEl.classList.add('bma-page-modal-dynamic');
                document.body.appendChild(modalEl);
            });

            if (pushHistory) {
                window.history.pushState({ file: targetFile }, '', targetFile);
            }

            // โหลดและสร้างอินสแตนซ์ของ Controller ประจำหน้านั้นใหม่
            const module = await import(routeInfo.controllerPath);
            const ControllerClass = module[routeInfo.controllerClass];
            if (ControllerClass) {
                new ControllerClass();
            } else {
                UIHelpers.hideLoading();
            }
        } catch (err) {
            console.error('AJAX Navigation error:', err);
            UIHelpers.hideLoading();
            window.location.href = targetFile;
        }
    }

    /**
     * สร้างแถบเมนูด้านซ้ายมือ (เปลี่ยนชื่อ "แดชบอร์ดภาพรวม" เป็น "ภาพรวม")
     */
    static #renderSidebar(currentUser, settings, activePage) {
        const sidebarEl = document.getElementById('bmaSidebarContainer');
        if (!sidebarEl) return;

        const logoHtml = settings.logo_url
            ? `<img src="${settings.logo_url}" alt="Logo" class="w-12 h-12 rounded-xl object-contain bg-white p-1 border-2 border-[#FDD835] shadow-md">`
            : `<div class="w-12 h-12 rounded-xl flex items-center justify-center text-[#00351B] font-extrabold text-xl shadow-md bg-gradient-to-br from-[#FDD835] to-[#F59E0B] border border-white/40">
                   <i class="fa-solid fa-landmark"></i>
               </div>`;

        // รายการเมนูหลัก (เปลี่ยนชื่อเมนูแรกเป็น "ภาพรวม" ตามข้อกำหนด)
        const menuItems = [
            { id: 'dashboard', href: 'dashboard.html', icon: 'fa-chart-pie', label: 'ภาพรวม', roles: ['SuperAdmin', 'Admin'] },
            { id: 'reports', href: 'reports.html', icon: 'fa-file-invoice', label: 'รายงานการลงเวลา', roles: ['SuperAdmin', 'Admin'] },
            { id: 'approvals', href: 'approvals.html', icon: 'fa-bell-concierge', label: 'อนุมัติลงเวลากรณีพิเศษ', roles: ['SuperAdmin', 'Admin'], badgeId: 'sidebarSpecialBadge' },
            { id: 'personnel', href: 'personnel.html', icon: 'fa-id-card-clip', label: 'จัดการข้อมูลบุคลากร', roles: ['SuperAdmin', 'Admin'] },
            { id: 'users', href: 'users.html', icon: 'fa-users-gear', label: 'จัดการบัญชีผู้ใช้งาน', roles: ['SuperAdmin', 'Admin'], badgeId: 'sidebarResetBadge' },
            { id: 'settings', href: 'settings.html', icon: 'fa-sliders', label: 'ตั้งค่าระบบ', roles: ['SuperAdmin'] }
        ];

        const visibleMenus = menuItems.filter(m => m.roles.includes(currentUser.role));

        const scopeText = currentUser.role === 'SuperAdmin'
            ? 'สิทธิ์สูงสุด (ทุกสังกัด)'
            : (currentUser.visibility_level === 'bureau'
                ? `ขอบเขต: ${currentUser.scope_bureau}`
                : `ขอบเขต: ${currentUser.scope_division || currentUser.scope_bureau}`);

        sidebarEl.innerHTML = `
            <div id="bmaSidebarBackdrop" class="fixed inset-0 bg-black/60 z-40 hidden lg:hidden backdrop-blur-xs transition-opacity"></div>

            <aside id="bmaSidebarDrawer" class="fixed top-0 left-0 bottom-0 w-72 sidebar-dark-bma z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 flex flex-col justify-between">
                <div>
                    <div class="p-5 border-b border-white/15 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3 min-w-0">
                            ${logoHtml}
                            <div class="min-w-0">
                                <h2 class="font-bold text-base truncate text-white tracking-wide">${settings.organization_name}</h2>
                                <p class="text-xs font-semibold truncate text-[#FDD835]">${settings.bureau_name}</p>
                            </div>
                        </div>
                        <button id="btnCloseSidebarMobile" type="button" class="lg:hidden p-2 rounded-lg text-white/80 hover:bg-white/10">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    <div class="px-5 py-3 border-b border-white/10 bg-black/20">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-medium text-emerald-100/80">ระดับสิทธิ์ผู้ใช้งาน</span>
                            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${currentUser.role === 'SuperAdmin' ? 'bg-[#FDD835] text-[#00351B]' : 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30'}">
                                ${currentUser.role}
                            </span>
                        </div>
                        <p class="text-xs text-emerald-100/90 mt-1.5 truncate" title="${scopeText}">
                            <i class="fa-solid fa-shield-halved mr-1.5 text-[#FDD835]"></i>${scopeText}
                        </p>
                    </div>

                    <nav class="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-260px)]">
                        <div class="text-[11px] font-bold uppercase tracking-wider text-emerald-200/60 px-3 mb-2">เมนูบริหารจัดการระบบ</div>
                        ${visibleMenus.map(item => `
                            <a href="${item.href}" data-nav-id="${item.id}" class="bma-nav-item menu-item ${activePage === item.id ? 'active' : ''}">
                                <i class="fa-solid ${item.icon} w-5 text-center"></i>
                                <span class="flex-1 truncate">${item.label}</span>${item.badgeId ? `<span id="${item.badgeId}" class="hidden px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white shadow">0</span>` : ''}
                            </a>
                        `).join('')}

                        <div class="pt-3 mt-3 border-t border-white/15">
                            <a href="checkin.html" class="bma-nav-item menu-item bg-white/5 hover:bg-white/15">
                                <i class="fa-solid fa-camera-retro w-5 text-center text-[#FDD835]"></i>
                                <span class="flex-1 truncate font-semibold text-white">ไปหน้าลงเวลาปฏิบัติราชการ</span>
                            </a>
                        </div>
                    </nav>
                </div>

                <div class="p-4 border-t border-white/15 bg-black/25">
                    <div class="flex items-center gap-3 mb-3 px-2">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-[#00351B] text-sm bg-[#FDD835] shadow">
                            ${String(currentUser.full_name || 'U').charAt(0)}
                        </div>
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-bold truncate text-white">${currentUser.full_name}</p>
                            <p class="text-xs truncate text-emerald-200/80">@${currentUser.username}</p>
                        </div>
                    </div>
                    <button id="btnSidebarLogout" type="button" class="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-200 bg-rose-500/20 border border-rose-400/30 hover:bg-rose-500 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>ออกจากระบบ</span>
                    </button>
                </div>
            </aside>
        `;
    }

    static #renderTopbar(currentUser, settings, pageTitle, pageSubtitle) {
        const topbarEl = document.getElementById('bmaTopbarContainer');
        if (!topbarEl) return;

        const isDark = document.documentElement.classList.contains('dark');

        topbarEl.innerHTML = `
            <header class="sticky top-0 z-30 bma-card rounded-none border-t-0 border-x-0 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4" style="border-top: 3px solid var(--g1);">
                <div class="flex items-center gap-3 min-w-0">
                    <button id="btnOpenSidebarMobile" type="button" class="lg:hidden p-2.5 rounded-xl border bma-border bma-text-main hover:bg-emerald-500/10">
                        <i class="fa-solid fa-bars-staggered text-lg" style="color: var(--bma-primary);"></i>
                    </button>
                    <div class="min-w-0">
                        <h1 id="topbarPageTitle" class="text-lg lg:text-xl font-extrabold truncate bma-text-main">${pageTitle}</h1>
                        <p id="topbarPageSubtitle" class="text-xs lg:text-sm bma-text-sub truncate">${pageSubtitle || ''}</p>
                    </div>
                </div>

                <div class="flex items-center gap-2.5 lg:gap-3">
                    <div class="relative">
                        <button id="btnNotificationBell" type="button" class="relative p-2.5 rounded-xl border bma-border bma-text-main hover:border-emerald-500 transition cursor-pointer" title="การแจ้งเตือนรออนุมัติ">
                            <i class="fa-solid fa-bell text-base" style="color: var(--bma-primary);"></i>
                            <span id="topBellBadgeCount" class="hidden absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shadow">0</span>
                        </button>

                        <div id="notificationDropdownMenu" class="hidden absolute right-0 mt-2 w-80 sm:w-96 bma-card bma-modal-surface p-4 shadow-2xl z-50">
                            <div class="flex items-center justify-between pb-2.5 mb-2.5 border-b bma-border">
                                <span class="font-bold text-sm bma-text-main">รายการรออนุมัติตามขอบเขต</span>
                                <span id="notificationSummaryTag" class="bma-badge bma-badge-warning">0 รายการ</span>
                            </div>
                            <div id="notificationListContainer" class="space-y-2.5 max-h-72 overflow-y-auto text-sm">
                                <p class="text-center py-4 bma-text-sub">กำลังตรวจสอบรายการแจ้งเตือน...</p>
                            </div>
                        </div>
                    </div>

                    <button id="btnToggleThemeMode" type="button" class="p-2.5 rounded-xl border bma-border bma-text-main hover:border-emerald-500 transition cursor-pointer" title="สลับโหมดถนอมสายตา (Light/Dark Mode)">
                        <i id="themeModeIcon" class="fa-solid ${isDark ? 'fa-sun text-amber-400' : 'fa-moon text-emerald-800'} text-base"></i>
                    </button>

                    <button id="btnTopbarLogout" type="button" class="hidden sm:inline-flex btn-bma-outline text-sm py-2 px-3 text-rose-600 border-rose-500/30 hover:bg-rose-500/10">
                        <i class="fa-solid fa-power-off"></i>
                        <span class="hidden md:inline">ออกระบบ</span>
                    </button>
                </div>
            </header>
        `;
    }

    static #renderMobileBottomNav(currentUser, activePage) {
        const mobileNavEl = document.getElementById('bmaMobileBottomNav');
        if (!mobileNavEl) return;

        const items = [
            { id: 'dashboard', href: 'dashboard.html', icon: 'fa-chart-pie', label: 'ภาพรวม' },
            { id: 'reports', href: 'reports.html', icon: 'fa-file-lines', label: 'รายงาน' },
            { id: 'approvals', href: 'approvals.html', icon: 'fa-check-double', label: 'อนุมัติเวลา' },
            { id: 'personnel', href: 'personnel.html', icon: 'fa-address-book', label: 'บุคลากร' },
            { id: 'users', href: 'users.html', icon: 'fa-user-shield', label: 'บัญชีผู้ใช้' }
        ];

        if (currentUser.role === 'SuperAdmin') {
            items.push({ id: 'settings', href: 'settings.html', icon: 'fa-gear', label: 'ตั้งค่า' });
        }

        mobileNavEl.innerHTML = `
            <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bma-card rounded-none border-b-0 border-x-0 px-2 py-1.5 flex items-center justify-around shadow-lg">
                ${items.map(item => {
                    const isActive = activePage === item.id;
                    return `
                        <a href="${item.href}" data-nav-id="${item.id}" class="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-bold transition no-underline ${isActive ? '' : 'bma-text-sub'}" style="${isActive ? 'color: var(--bma-primary);' : ''}">
                            <i class="fa-solid ${item.icon} text-base mb-0.5"></i>
                            <span>${item.label}</span>
                        </a>
                    `;
                }).join('')}
            </nav>
        `;
    }

    static getMobileShortcutGridHtml(currentUser) {
        const shortcuts = [
            { href: 'checkin.html', icon: 'fa-camera', label: 'ลงเวลา', bg: 'linear-gradient(135deg, #007B3E, #4EBA6F)' },
            { href: 'dashboard.html', icon: 'fa-chart-pie', label: 'ภาพรวม', bg: 'linear-gradient(135deg, #0284C7, #38BDF8)' },
            { href: 'reports.html', icon: 'fa-file-pdf', label: 'รายงาน PDF', bg: 'linear-gradient(135deg, #D97706, #F59E0B)' },
            { href: 'approvals.html', icon: 'fa-bell-concierge', label: 'อนุมัติพิเศษ', bg: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' },
            { href: 'personnel.html', icon: 'fa-users', label: 'บุคลากร', bg: 'linear-gradient(135deg, #005B2E, #059669)' },
            { href: 'users.html', icon: 'fa-key', label: 'รีเซ็ตรหัส', bg: 'linear-gradient(135deg, #BE123C, #F43F5E)' }
        ];

        if (currentUser?.role === 'SuperAdmin') {
            shortcuts.push({ href: 'settings.html', icon: 'fa-sliders', label: 'ตั้งค่าระบบ', bg: 'linear-gradient(135deg, #EA580C, #FB923C)' });
        }

        return `
            <div class="block lg:hidden bma-card p-4 mb-5">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold uppercase tracking-wider bma-text-sub">
                        <i class="fa-solid fa-mobile-screen-button mr-1" style="color: var(--bma-primary);"></i>ทางลัดด่วน (Mobile Shortcuts)
                    </span>
                </div>
                <div class="grid grid-cols-4 sm:grid-cols-6 gap-3 text-center">
                    ${shortcuts.map(s => `
                        <a href="${s.href}" class="flex flex-col items-center gap-1.5 no-underline group">
                            <div class="ios-shortcut-icon" style="background: ${s.bg};">
                                <i class="fa-solid ${s.icon}"></i>
                            </div>
                            <span class="text-xs font-semibold bma-text-main truncate w-full">${s.label}</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    static #renderFooter(settings) {
        const footerEl = document.getElementById('bmaFooterContainer');
        if (!footerEl) return;

        const yearBuddhist = new Date().getFullYear() + 543;
        footerEl.innerHTML = `
            <footer class="mt-10 py-5 px-4 lg:px-8 border-t bma-border text-center sm:flex sm:items-center sm:justify-between text-xs bma-text-sub mb-14 lg:mb-0">
                <div class="font-bold bma-text-main">
                    ระบบลงเวลาปฏิบัติราชการออนไลน์ • <span>${settings.organization_name}</span>
                </div>
                <div class="mt-1 sm:mt-0">
                    สังกัด: <span class="font-bold" style="color: var(--bma-primary);">${settings.bureau_name}</span> © พ.ศ. ${yearBuddhist}
                </div>
            </footer>
        `;
    }

    static async refreshNotificationBell(currentUser) {
        if (!currentUser) return;

        const [pendingSpecial, pendingResets] = await Promise.all([
            AttendanceModel.getSpecialRequests(currentUser, 'pending'),
            UserModel.getPendingPasswordResetRequests(currentUser)
        ]);

        const totalCount = pendingSpecial.length + pendingResets.length;

        const topBellBadge = document.getElementById('topBellBadgeCount');
        const sidebarSpecialBadge = document.getElementById('sidebarSpecialBadge');
        const sidebarResetBadge = document.getElementById('sidebarResetBadge');
        const summaryTag = document.getElementById('notificationSummaryTag');
        const listContainer = document.getElementById('notificationListContainer');

        if (topBellBadge) {
            topBellBadge.textContent = String(totalCount);
            topBellBadge.classList.toggle('hidden', totalCount === 0);
        }
        if (sidebarSpecialBadge) {
            sidebarSpecialBadge.textContent = String(pendingSpecial.length);
            sidebarSpecialBadge.classList.toggle('hidden', pendingSpecial.length === 0);
        }
        if (sidebarResetBadge) {
            sidebarResetBadge.textContent = String(pendingResets.length);
            sidebarResetBadge.classList.toggle('hidden', pendingResets.length === 0);
        }
        if (summaryTag) {
            summaryTag.textContent = `${totalCount} รายการ`;
        }

        if (listContainer) {
            if (totalCount === 0) {
                listContainer.innerHTML = `
                    <div class="text-center py-6 bma-text-sub">
                        <i class="fa-regular fa-circle-check text-2xl mb-2 text-emerald-500 block"></i>
                        ไม่มีรายการคำขอที่รออนุมัติในขณะนี้
                    </div>
                `;
            } else {
                let itemsHtml = '';
                if (pendingSpecial.length > 0) {
                    itemsHtml += `
                        <a href="approvals.html" class="block p-3 rounded-xl border bma-border hover:border-emerald-500 transition no-underline">
                            <div class="flex items-center justify-between">
                                <span class="font-semibold bma-text-main">
                                    <i class="fa-solid fa-clock-rotate-left text-indigo-500 mr-1.5"></i>คำขอลงเวลากรณีพิเศษ
                                </span>
                                <span class="bma-badge bma-badge-indigo">${pendingSpecial.length} รายการ</span>
                            </div>
                            <p class="text-xs bma-text-sub mt-1">คลิกเพื่อตรวจสอบและอนุมัติเวลาปฏิบัติราชการ</p>
                        </a>
                    `;
                }
                if (pendingResets.length > 0) {
                    itemsHtml += `
                        <a href="users.html" class="block p-3 rounded-xl border bma-border hover:border-emerald-500 transition no-underline">
                            <div class="flex items-center justify-between">
                                <span class="font-semibold bma-text-main">
                                    <i class="fa-solid fa-key text-rose-500 mr-1.5"></i>คำขอลืมรหัสผ่าน (รีเซ็ตรหัส)
                                </span>
                                <span class="bma-badge bma-badge-danger">${pendingResets.length} รายการ</span>
                            </div>
                            <p class="text-xs bma-text-sub mt-1">คลิกเพื่ออนุมัติรีเซ็ตรหัสผ่านเป็นเลข 6 ตัวท้ายบัตรประชาชน</p>
                        </a>
                    `;
                }
                listContainer.innerHTML = itemsHtml;
            }
        }
    }

    static #bindEvents() {
        const drawer = document.getElementById('bmaSidebarDrawer');
        const backdrop = document.getElementById('bmaSidebarBackdrop');
        const btnOpen = document.getElementById('btnOpenSidebarMobile');
        const btnClose = document.getElementById('btnCloseSidebarMobile');

        const toggleSidebar = (show) => {
            if (!drawer || !backdrop) return;
            if (show) {
                drawer.classList.remove('-translate-x-full');
                backdrop.classList.remove('hidden');
            } else {
                drawer.classList.add('-translate-x-full');
                backdrop.classList.add('hidden');
            }
        };

        btnOpen?.addEventListener('click', () => toggleSidebar(true));
        btnClose?.addEventListener('click', () => toggleSidebar(false));
        backdrop?.addEventListener('click', () => toggleSidebar(false));

        const btnTheme = document.getElementById('btnToggleThemeMode');
        const themeIcon = document.getElementById('themeModeIcon');
        btnTheme?.addEventListener('click', () => {
            const mode = UIHelpers.toggleTheme();
            if (themeIcon) {
                themeIcon.className = mode === 'dark'
                    ? 'fa-solid fa-sun text-amber-400 text-base'
                    : 'fa-solid fa-moon text-emerald-800 text-base';
            }
        });

        const btnBell = document.getElementById('btnNotificationBell');
        const bellMenu = document.getElementById('notificationDropdownMenu');
        btnBell?.addEventListener('click', (e) => {
            e.stopPropagation();
            bellMenu?.classList.toggle('hidden');
        });
        document.addEventListener('click', () => {
            bellMenu?.classList.add('hidden');
        });

        const handleLogout = async () => {
            const confirmed = await UIHelpers.confirm(
                'ยืนยันการออกจากระบบ',
                'คุณต้องการออกจากระบบลงเวลาปฏิบัติราชการใช่หรือไม่?',
                'ออกจากระบบ',
                'question'
            );
            if (confirmed) {
                AuthService.clearSession();
                window.location.href = 'index.html';
            }
        };

        document.getElementById('btnSidebarLogout')?.addEventListener('click', handleLogout);
        document.getElementById('btnTopbarLogout')?.addEventListener('click', handleLogout);
    }
}