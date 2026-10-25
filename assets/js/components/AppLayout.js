/**
 * @file assets/js/components/AppLayout.js
 * @description คลาสสร้างโครงสร้าง Layout ส่วนกลาง (ซ่อนชื่อไฟล์ .html บนแถบ URL ทุกหน้าให้แสดงเฉพาะ https://stb6636.github.io/CheckinApp/, จัด Footer กึ่งกลาง และต่ออายุ Session 7 วัน)
 */

import { Config } from '../core/Config.js';
import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { AttendanceModel } from '../models/AttendanceModel.js';
import { UserModel } from '../models/UserModel.js';

export class AppLayout {
    static #isLayoutMounted = false;
    static #isGlobalEventsBound = false;
    static #currentUser = null;
    static #settings = null;

    static PAGE_ROUTES = {
        'dashboard.html': {
            activePage: 'dashboard',
            pageTitle: 'ภาพรวม',
            controllerPath: '../controllers/DashboardController.js',
            controllerClass: 'DashboardController'
        },
        'reports.html': {
            activePage: 'reports',
            pageTitle: 'รายงานการลงเวลาปฏิบัติราชการ',
            controllerPath: '../controllers/ReportsController.js',
            controllerClass: 'ReportsController'
        },
        'approvals.html': {
            activePage: 'approvals',
            pageTitle: 'อนุมัติลงเวลาปฏิบัติราชการกรณีพิเศษ',
            controllerPath: '../controllers/ApprovalsController.js',
            controllerClass: 'ApprovalsController'
        },
        'personnel.html': {
            activePage: 'personnel',
            pageTitle: 'จัดการข้อมูลบุคลากร',
            controllerPath: '../controllers/PersonnelController.js',
            controllerClass: 'PersonnelController'
        },
        'users.html': {
            activePage: 'users',
            pageTitle: 'จัดการบัญชีผู้ใช้งานและสิทธิ์การเข้าถึง',
            controllerPath: '../controllers/UsersController.js',
            controllerClass: 'UsersController'
        },
        'settings.html': {
            activePage: 'settings',
            pageTitle: 'ตั้งค่าระบบพื้นฐาน (สำหรับ SuperAdmin)',
            controllerPath: '../controllers/SettingsController.js',
            controllerClass: 'SettingsController'
        }
    };

    static canViewUsersMenu(user) {
        if (!user) return false;
        if (user.role === 'SuperAdmin') return true;
        if (user.role === 'Admin') {
            return user.visibility_level === 'bureau' || user.visibility_level === 'all';
        }
        return false;
    }

    static async initAdminLayout({ activePage, pageTitle, pageSubtitle = '' }) {
        UIHelpers.initTheme();
        UIHelpers.maskUrlToRoot(`${activePage}.html`);

        const allowedRoles = activePage === 'settings' ? ['SuperAdmin'] : ['SuperAdmin', 'Admin'];
        const currentUser = AuthService.requireAuth(allowedRoles);
        if (!currentUser) return { currentUser: null, settings: null };

        if (activePage === 'users' && !AppLayout.canViewUsersMenu(currentUser)) {
            window.location.replace('dashboard.html');
            return { currentUser: null, settings: null };
        }

        AppLayout.#currentUser = currentUser;
        AppLayout.#settings = await SettingsModel.getSettings(false);

        const sidebarEl = document.getElementById('bmaSidebarDrawer');
        if (!AppLayout.#isLayoutMounted || !sidebarEl) {
            AppLayout.#renderSidebar(currentUser, AppLayout.#settings, activePage);
            AppLayout.#renderTopbar(currentUser, AppLayout.#settings, pageTitle, pageSubtitle);
            AppLayout.#renderMobileBottomNav(currentUser, activePage);
            AppLayout.#renderFooter(AppLayout.#settings);
            AppLayout.#bindGlobalDelegatedEvents();
            AppLayout.#isLayoutMounted = true;

            window.addEventListener('bma:settings-updated', (e) => {
                AppLayout.#settings = e.detail;
                const currentActive = document.querySelector('#bmaSidebarDrawer a.active')?.dataset?.navId || activePage;
                AppLayout.#renderSidebar(currentUser, AppLayout.#settings, currentActive);
                AppLayout.#renderFooter(AppLayout.#settings);
                AppLayout.refreshNotificationBell(currentUser);
            });
        } else {
            AppLayout.#updateActiveNavState(activePage, pageTitle, pageSubtitle);
        }

        AppLayout.checkAndShowWelcomeToast(currentUser);

        setTimeout(() => {
            AppLayout.refreshNotificationBell(currentUser);
        }, 50);

        return { currentUser, settings: AppLayout.#settings };
    }

    static checkAndShowWelcomeToast(currentUser) {
        const welcomeName = sessionStorage.getItem(Config.STORAGE_KEYS.WELCOME_TOAST);
        if (welcomeName) {
            sessionStorage.removeItem(Config.STORAGE_KEYS.WELCOME_TOAST);
            const displayName = welcomeName || currentUser?.full_name || '';
            setTimeout(() => {
                UIHelpers.showToast(`ยินดีต้อนรับคุณ ${displayName}`, 'success', 2800);
            }, 200);
        }
    }

    static #updateActiveNavState(activePage, pageTitle, pageSubtitle) {
        const titleEl = document.getElementById('topbarPageTitle');
        const subEl = document.getElementById('topbarPageSubtitle');
        if (titleEl && pageTitle) titleEl.textContent = pageTitle;
        if (subEl) subEl.textContent = pageSubtitle || '';

        const bcEl = document.getElementById('topbarBreadcrumbPageTitle');
        if (bcEl && pageTitle) bcEl.textContent = pageTitle;

        if (pageTitle) document.title = `${pageTitle} - กรุงเทพมหานคร`;

        document.querySelectorAll('#bmaSidebarDrawer a[data-nav-id]').forEach(link => {
            const isMatch = link.dataset.navId === activePage;
            if (isMatch) {
                link.className = 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 no-underline bg-gradient-to-r from-[#00744B] to-[#00995D] text-white shadow-lg shadow-emerald-700/40 active';
                const iconDiv = link.querySelector('div');
                if (iconDiv) {
                    iconDiv.className = 'w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 bg-white/20 text-white';
                }
            } else {
                link.className = 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 no-underline text-slate-300 hover:text-white hover:bg-slate-800/70';
                const iconDiv = link.querySelector('div');
                if (iconDiv) {
                    iconDiv.className = 'w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 bg-slate-800 text-slate-400';
                }
            }
        });

        document.querySelectorAll('#bmaMobileBottomNav a[data-nav-id]').forEach(link => {
            const isMatch = link.dataset.navId === activePage;
            link.style.color = isMatch ? 'var(--bma-primary)' : '';
            link.classList.toggle('bma-text-sub', !isMatch);
        });

        document.getElementById('bmaSidebarDrawer')?.classList.add('-translate-x-full');
        document.getElementById('bmaSidebarBackdrop')?.classList.add('hidden');
    }

    static async navigateAjaxPage(targetFile, pushHistory = true) {
        const cleanFile = targetFile.split('?')[0].split('#')[0].split('/').pop();
        const routeInfo = AppLayout.PAGE_ROUTES[cleanFile];

        // 1. ตรวจสอบสิทธิ์การเข้าถึงเมนูผู้ใช้งาน (Users)
        if (cleanFile === 'users.html' && !AppLayout.canViewUsersMenu(AppLayout.#currentUser)) {
            await UIHelpers.showToast('ท่านไม่มีสิทธิ์เข้าถึงเมนูจัดการบัญชีผู้ใช้งาน', 'warning', 2500);
            return;
        }

        // 2. ถ้าเป็นหน้าปัจจุบันอยู่แล้ว ให้ปิดเมนูด้านข้างบนมือถือและไม่ต้องโหลดซ้ำ
        const currentActive = sessionStorage.getItem(UIHelpers.VIEW_PAGE_STORAGE_KEY) || window.location.pathname.split('/').pop() || 'dashboard.html';
        if (cleanFile === currentActive) {
            document.getElementById('bmaSidebarDrawer')?.classList.add('-translate-x-full');
            document.getElementById('bmaSidebarBackdrop')?.classList.add('hidden');
            return;
        }

        // 3. ปิด Sidebar Mobile Drawer ทันที
        document.getElementById('bmaSidebarDrawer')?.classList.add('-translate-x-full');
        document.getElementById('bmaSidebarBackdrop')?.classList.add('hidden');

        // 4. บันทึกประวัติหน้าปัจจุบันลง sessionStorage
        sessionStorage.setItem(UIHelpers.VIEW_PAGE_STORAGE_KEY, cleanFile);

        // 5. อัปเดตสถานะ Active Navigation บนแถบเมนูและ Breadcrumb ทันที
        AppLayout.#updateActiveNavState(cleanFile.replace('.html', ''), routeInfo?.pageTitle || '', '');

        // 6. คำนวณ URL ปลายทางที่แน่นอน (รองรับทั้ง file:///, localhost, และ GitHub Pages)
        let targetUrl = cleanFile;
        try {
            if (window.location.protocol === 'file:') {
                const currentHref = window.location.href.split('?')[0].split('#')[0];
                const baseDir = currentHref.substring(0, currentHref.lastIndexOf('/') + 1);
                targetUrl = new URL(cleanFile, baseDir).href;
            } else {
                const cleanRoot = UIHelpers.getRootBasePath();
                const baseDir = new URL(cleanRoot, window.location.origin).href;
                targetUrl = new URL(cleanFile, baseDir).href;
            }
        } catch (e) {
            targetUrl = cleanFile;
        }

        // 7. นำทางไปยังเป้าหมายอย่างปลอดภัยและแม่นยำ
        window.location.href = targetUrl;
    }

    static #renderSidebar(currentUser, settings, activePage) {
        const sidebarEl = document.getElementById('bmaSidebarContainer');
        if (!sidebarEl) return;

        const logoHtml = settings.logo_url
            ? `<img src="${settings.logo_url}" alt="Logo" class="w-10 h-10 rounded-xl object-contain bg-white/10 p-1 border border-white/15 shadow-xs">`
            : `<div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-xs bg-gradient-to-tr from-[#00744B] to-[#00C08A] border border-white/20">
                   <i class="fa-solid fa-landmark"></i>
               </div>`;

        const menuItems = [
            { id: 'dashboard', href: 'dashboard.html', icon: 'fa-chart-pie', label: 'ภาพรวม', show: true },
            { id: 'reports', href: 'reports.html', icon: 'fa-file-invoice', label: 'รายงานการลงเวลา', show: true },
            { id: 'approvals', href: 'approvals.html', icon: 'fa-bell-concierge', label: 'อนุมัติลงเวลากรณีพิเศษ', show: true, badgeId: 'sidebarSpecialBadge' },
            { id: 'personnel', href: 'personnel.html', icon: 'fa-id-card-clip', label: 'จัดการข้อมูลบุคลากร', show: true },
            { id: 'users', href: 'users.html', icon: 'fa-users-gear', label: 'จัดการบัญชีผู้ใช้งาน', show: AppLayout.canViewUsersMenu(currentUser), badgeId: 'sidebarResetBadge' },
            { id: 'settings', href: 'settings.html', icon: 'fa-sliders', label: 'ตั้งค่าระบบ', show: currentUser.role === 'SuperAdmin' }
        ];

        const visibleMenus = menuItems.filter(m => m.show);

        const scopeText = currentUser.role === 'SuperAdmin'
            ? 'สิทธิ์สูงสุด (ทุกสังกัด)'
            : (currentUser.visibility_level === 'bureau'
                ? `สำนักงาน: ${currentUser.scope_bureau}`
                : `ส่วน/ฝ่าย: ${currentUser.scope_division || currentUser.scope_bureau}`);

        sidebarEl.innerHTML = `
            <div id="bmaSidebarBackdrop" class="fixed inset-0 bg-black/60 z-40 hidden lg:hidden backdrop-blur-xs transition-opacity"></div>

            <aside id="bmaSidebarDrawer" class="fixed top-0 left-0 bottom-0 w-72 bg-[#111827] dark:bg-[#0B132B] z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 flex flex-col justify-between shadow-2xl border-r border-slate-800">
                <div>
                    <!-- Brand Header -->
                    <div class="p-5 border-b border-slate-800 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3 min-w-0">
                            ${logoHtml}
                            <div class="min-w-0">
                                <h2 class="font-extrabold text-sm truncate text-white tracking-wide">${settings.organization_name}</h2>
                                <p class="text-xs font-semibold truncate text-emerald-400">${settings.bureau_name}</p>
                            </div>
                        </div>
                        <button id="btnCloseSidebarMobile" type="button" class="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    <!-- User Profile Capsule -->
                    <div class="mx-3 my-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs bg-gradient-to-tr from-[#00744B] to-[#00C08A] shadow-md shrink-0">
                                ${String(currentUser.full_name || 'U').charAt(0)}
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="text-xs font-bold truncate text-white">${currentUser.full_name}</p>
                                <div class="flex items-center gap-1.5 mt-0.5">
                                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${currentUser.role === 'SuperAdmin' ? 'bg-[#FFB449]/20 text-[#FFB449] border border-[#FFB449]/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">
                                        ${currentUser.role}
                                    </span>
                                    <span class="text-[10px] text-slate-400 truncate" title="${scopeText}">${scopeText}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Navigation Items -->
                    <nav class="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-270px)]">
                        <div class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-4 pt-2 pb-1">เมนูระบบบริหารจัดการ</div>
                        ${visibleMenus.map(item => {
                            const isActive = activePage === item.id;
                            return `
                                <a href="${item.href}" data-nav-id="${item.id}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 no-underline ${isActive ? 'bg-gradient-to-r from-[#00744B] to-[#00995D] text-white shadow-lg shadow-emerald-700/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'}">
                                    <div class="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}">
                                        <i class="fa-solid ${item.icon}"></i>
                                    </div>
                                    <span class="flex-1 truncate">${item.label}</span>
                                    ${item.badgeId ? `<span id="${item.badgeId}" class="hidden px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow">0</span>` : ''}
                                </a>
                            `;
                        }).join('')}

                        <div class="pt-3 mt-3 border-t border-slate-800">
                            <a href="checkin.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all no-underline">
                                <div class="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-sm text-emerald-400 shrink-0">
                                    <i class="fa-solid fa-camera-retro"></i>
                                </div>
                                <span class="flex-1 truncate">ไปหน้าลงเวลาปฏิบัติราชการ</span>
                            </a>
                        </div>
                    </nav>
                </div>

                <!-- Logout Bottom -->
                <div class="p-4 border-t border-slate-800 bg-[#0B132B]">
                    <button id="btnSidebarLogout" type="button" class="w-full py-2.5 px-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
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
            <header class="sticky top-0 z-30 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
                <div class="flex items-center gap-3 min-w-0">
                    <button id="btnOpenSidebarMobile" type="button" class="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer">
                        <i class="fa-solid fa-bars-staggered text-base"></i>
                    </button>
                    <div class="min-w-0">
                        <div class="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                            <i class="fa-solid fa-house text-[10px]"></i>
                            <span>/</span>
                            <span id="topbarBreadcrumbPageTitle" class="text-emerald-700 dark:text-emerald-400 font-bold">${pageTitle}</span>
                        </div>
                        <h1 id="topbarPageTitle" class="text-base lg:text-lg font-black text-slate-800 dark:text-white tracking-tight truncate">${pageTitle}</h1>
                        <p id="topbarPageSubtitle" class="hidden">${pageSubtitle || ''}</p>
                    </div>
                </div>

                <div class="flex items-center gap-2.5 lg:gap-3 shrink-0">
                    <div class="relative hidden md:block">
                        <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input type="text" placeholder="ค้นหาข้อมูล..." class="pl-9 pr-4 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 lg:w-56 transition-all">
                    </div>

                    <div class="relative" id="notificationBellWrapper">
                        <button id="btnNotificationBell" type="button" class="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition flex items-center justify-center cursor-pointer" title="การแจ้งเตือนรออนุมัติ">
                            <i class="fa-solid fa-bell text-sm text-[#00744B] dark:text-emerald-400"></i>
                            <span id="topBellBadgeCount" class="hidden absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow">0</span>
                        </button>

                        <div id="notificationDropdownMenu" class="hidden absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-700 z-50">
                            <div class="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700">
                                <span class="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                    <i class="fa-solid fa-bell text-amber-500"></i>
                                    <span>แจ้งเตือนรออนุมัติ</span>
                                </span>
                                <span id="notificationSummaryTag" class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">0 รายการ</span>
                            </div>
                            <div id="notificationListContainer" class="space-y-2 max-h-72 overflow-y-auto text-xs pr-1">
                                <p class="text-center py-4 text-slate-400">กำลังตรวจสอบรายการแจ้งเตือน...</p>
                            </div>
                        </div>
                    </div>

                    <button id="btnToggleThemeMode" type="button" class="h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer" title="สลับโหมดสี">
                        <i id="themeModeIcon" class="fa-solid ${isDark ? 'fa-sun' : 'fa-moon'} text-amber-500"></i>
                        <span id="themeModeTextLabel" class="hidden sm:inline">${isDark ? 'โหมดสว่าง' : 'โหมดถนอมสายตา'}</span>
                    </button>
                </div>
            </header>
        `;
    }

    static #renderMobileBottomNav(currentUser, activePage) {
        const mobileNavEl = document.getElementById('bmaMobileBottomNav');
        if (!mobileNavEl) return;

        const items = [
            { id: 'dashboard', href: 'dashboard.html', icon: 'fa-chart-pie', label: 'ภาพรวม', show: true },
            { id: 'reports', href: 'reports.html', icon: 'fa-file-lines', label: 'รายงาน', show: true },
            { id: 'approvals', href: 'approvals.html', icon: 'fa-check-double', label: 'อนุมัติเวลา', show: true },
            { id: 'personnel', href: 'personnel.html', icon: 'fa-address-book', label: 'บุคลากร', show: true },
            { id: 'users', href: 'users.html', icon: 'fa-user-shield', label: 'บัญชีผู้ใช้', show: AppLayout.canViewUsersMenu(currentUser) },
            { id: 'settings', href: 'settings.html', icon: 'fa-gear', label: 'ตั้งค่า', show: currentUser.role === 'SuperAdmin' }
        ].filter(i => i.show);

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
            { href: 'checkin.html', icon: 'fa-camera', label: 'ลงเวลา', bg: 'linear-gradient(135deg, #007B3E, #4EBA6F)', show: true },
            { href: 'dashboard.html', icon: 'fa-chart-pie', label: 'ภาพรวม', bg: 'linear-gradient(135deg, #0284C7, #38BDF8)', show: true },
            { href: 'reports.html', icon: 'fa-file-pdf', label: 'รายงาน PDF', bg: 'linear-gradient(135deg, #D97706, #F59E0B)', show: true },
            { href: 'approvals.html', icon: 'fa-bell-concierge', label: 'อนุมัติพิเศษ', bg: 'linear-gradient(135deg, #4F46E5, #8B5CF6)', show: true },
            { href: 'personnel.html', icon: 'fa-users', label: 'บุคลากร', bg: 'linear-gradient(135deg, #005B2E, #059669)', show: true },
            { href: 'users.html', icon: 'fa-key', label: 'บัญชีผู้ใช้', bg: 'linear-gradient(135deg, #BE123C, #F43F5E)', show: AppLayout.canViewUsersMenu(currentUser) },
            { href: 'settings.html', icon: 'fa-sliders', label: 'ตั้งค่าระบบ', bg: 'linear-gradient(135deg, #EA580C, #FB923C)', show: currentUser?.role === 'SuperAdmin' }
        ].filter(s => s.show);

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
        const footerDesc = settings.footer_description || '';

        footerEl.innerHTML = `
            <footer class="mt-10 py-3.5 px-4 lg:px-8 bma-footer-bar flex flex-col items-center justify-center text-center mb-14 lg:mb-0 transition-colors">
                <div class="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>ระบบลงเวลาปฏิบัติราชการออนไลน์ • </span>
                    <span class="font-bold text-slate-800 dark:text-slate-200">${settings.organization_name}</span>
                    <span> • สังกัด </span>
                    <span class="footer-highlight text-[#00744B] dark:text-[#00C08A] font-bold">${settings.bureau_name}</span>
                    <span> © พ.ศ. ${yearBuddhist}</span>
                </div>
                ${footerDesc ? `<div class="text-[11px] footer-desc-line text-slate-500 dark:text-slate-400 mt-0.5 font-medium">${footerDesc}</div>` : ''}
            </footer>
        `;
    }

    static async refreshNotificationBell(currentUser) {
        if (!currentUser) return;

        try {
            const canSeeUsers = AppLayout.canViewUsersMenu(currentUser);
            const [pendingSpecial, pendingResets] = await Promise.all([
                AttendanceModel.getSpecialRequests(currentUser, 'pending'),
                canSeeUsers ? UserModel.getPendingPasswordResetRequests(currentUser) : Promise.resolve([])
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
                        const previewItems = pendingSpecial.slice(0, 4).map(req => {
                            const p = req.personnel || {};
                            const fullName = p.first_name ? `${p.prefix}${p.first_name} ${p.last_name}` : 'บุคลากร';
                            const division = p.division || p.bureau || '';
                            return `
                                <div class="text-xs py-1.5 border-t bma-border flex items-start justify-between gap-2">
                                    <div class="min-w-0">
                                        <span class="font-bold bma-text-main block truncate">${fullName}</span>
                                        <span class="text-[11px] bma-text-sub block truncate">${division} • ${req.remark || 'ขอลงเวลากรณีพิเศษ'}</span>
                                    </div>
                                    <span class="text-[11px] font-bold text-indigo-600 whitespace-nowrap">${UIHelpers.formatThaiShortDate(req.work_date)}</span>
                                </div>
                            `;
                        }).join('');

                        itemsHtml += `
                            <a href="approvals.html" class="block p-3 rounded-xl border bma-border hover:border-emerald-500 transition no-underline bg-indigo-500/5">
                                <div class="flex items-center justify-between mb-1.5">
                                    <span class="font-extrabold bma-text-main text-xs">
                                        <i class="fa-solid fa-bell-concierge text-indigo-600 mr-1.5"></i>ขออนุมัติลงเวลากรณีพิเศษ
                                    </span>
                                    <span class="bma-badge bma-badge-indigo">${pendingSpecial.length} รายการ</span>
                                </div>
                                ${previewItems}
                                <p class="text-[11px] font-bold text-center mt-2 pt-1.5 border-t bma-border" style="color: var(--bma-primary);">
                                    คลิกเพื่อไปหน้าพิจารณาอนุมัติทั้งหมด &rarr;
                                </p>
                            </a>
                        `;
                    }

                    if (pendingResets.length > 0) {
                        itemsHtml += `
                            <a href="users.html" class="block p-3 rounded-xl border bma-border hover:border-emerald-500 transition no-underline bg-rose-500/5">
                                <div class="flex items-center justify-between">
                                    <span class="font-extrabold bma-text-main text-xs">
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
        } catch (err) {
            console.warn('Notification bell refresh error:', err);
        }
    }

    static #bindGlobalDelegatedEvents() {
        if (AppLayout.#isGlobalEventsBound) return;
        AppLayout.#isGlobalEventsBound = true;

        window.addEventListener('storage', (e) => {
            if (e.key === Config.STORAGE_KEYS.SESSION_USER && !e.newValue) {
                window.location.replace(UIHelpers.getRootBasePath());
            }
        });

        document.addEventListener('click', async (e) => {
            const logoutBtn = e.target.closest('#btnSidebarLogout');
            if (logoutBtn) {
                e.preventDefault();
                const confirmed = await UIHelpers.confirm(
                    'ยืนยันการออกจากระบบ',
                    'คุณต้องการออกจากระบบผู้ดูแลระบบใช่หรือไม่?',
                    'ออกจากระบบ',
                    'question'
                );
                if (confirmed) {
                    AuthService.clearSession();
                    window.location.replace(UIHelpers.getRootBasePath());
                }
                return;
            }

            if (e.target.closest('#btnOpenSidebarMobile')) {
                document.getElementById('bmaSidebarDrawer')?.classList.remove('-translate-x-full');
                document.getElementById('bmaSidebarBackdrop')?.classList.remove('hidden');
                return;
            }
            if (e.target.closest('#btnCloseSidebarMobile') || e.target.closest('#bmaSidebarBackdrop')) {
                document.getElementById('bmaSidebarDrawer')?.classList.add('-translate-x-full');
                document.getElementById('bmaSidebarBackdrop')?.classList.add('hidden');
                return;
            }

            const tabBtn = e.target.closest('.settings-tab-btn, [data-tab-target]');
            if (tabBtn) {
                const targetId = tabBtn.getAttribute('data-tab-target');
                if (targetId) {
                    document.querySelectorAll('.settings-tab-pane, .settings-tab-panel').forEach(panel => {
                        panel.classList.toggle('hidden', panel.id !== targetId);
                    });
                    document.querySelectorAll('.settings-tab-btn, [data-tab-target]').forEach(btn => {
                        const isMatch = btn.getAttribute('data-tab-target') === targetId;
                        btn.classList.toggle('active', isMatch);
                        if (isMatch) {
                            btn.classList.add('bg-[#00744B]', 'text-white', 'shadow-md', 'shadow-emerald-900/20');
                            btn.classList.remove('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200', 'dark:bg-slate-700/60', 'dark:text-slate-300', 'dark:hover:bg-slate-700');
                        } else {
                            btn.classList.remove('bg-[#00744B]', 'text-white', 'shadow-md', 'shadow-emerald-900/20');
                            btn.classList.add('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200', 'dark:bg-slate-700/60', 'dark:text-slate-300', 'dark:hover:bg-slate-700');
                        }
                    });
                }
                return;
            }

            if (e.target.closest('#btnToggleThemeMode')) {
                const mode = UIHelpers.toggleTheme();
                const themeIcon = document.getElementById('themeModeIcon');
                const themeLabel = document.getElementById('themeModeTextLabel');
                if (themeIcon) {
                    themeIcon.className = mode === 'dark'
                        ? 'fa-solid fa-sun text-sm'
                        : 'fa-solid fa-moon text-sm';
                }
                if (themeLabel) {
                    themeLabel.textContent = mode === 'dark' ? 'โหมดสว่าง' : 'โหมดถนอมสายตา';
                }
                return;
            }

            const bellBtn = e.target.closest('#btnNotificationBell');
            const bellMenu = document.getElementById('notificationDropdownMenu');
            if (bellBtn) {
                e.stopPropagation();
                bellMenu?.classList.toggle('hidden');
                return;
            }
            if (bellMenu && !bellMenu.classList.contains('hidden') && !e.target.closest('#notificationDropdownMenu')) {
                bellMenu.classList.add('hidden');
            }

            const anchor = e.target.closest('a[href]');
            if (anchor) {
                const href = anchor.getAttribute('href') || '';
                if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
                const cleanFile = href.split('?')[0].split('#')[0].split('/').pop();
                if (AppLayout.PAGE_ROUTES[cleanFile]) {
                    e.preventDefault();
                    bellMenu?.classList.add('hidden');
                    await AppLayout.navigateAjaxPage(cleanFile, true);
                } else if (cleanFile === 'checkin.html') {
                    sessionStorage.setItem(UIHelpers.VIEW_PAGE_STORAGE_KEY, 'checkin.html');
                }
            }
        });

        window.addEventListener('popstate', async (e) => {
            const targetFile = e.state?.file || sessionStorage.getItem(UIHelpers.VIEW_PAGE_STORAGE_KEY) || 'dashboard.html';
            if (AppLayout.PAGE_ROUTES[targetFile]) {
                await AppLayout.navigateAjaxPage(targetFile, false);
            }
        });
    }
}