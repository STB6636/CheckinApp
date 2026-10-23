/**
 * @file assets/js/components/AppLayout.js
 * @description คลาสสร้างโครงสร้าง Layout ส่วนกลาง (แก้ปุ่มออกจากระบบ Sidebar, ลบปุ่มออกระบบมุมขวาบน, กระดิ่งแจ้งเตือนตามขอบเขต & โหลดเร็วด้วย Cache)
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

    static async initAdminLayout({ activePage, pageTitle, pageSubtitle = '' }) {
        UIHelpers.initTheme();

        const allowedRoles = activePage === 'settings' ? ['SuperAdmin'] : ['SuperAdmin', 'Admin'];
        const currentUser = AuthService.requireAuth(allowedRoles);
        if (!currentUser) return { currentUser: null, settings: null };

        AppLayout.#currentUser = currentUser;
        // ใช้ Smart Session Cache (forceRefresh = false) เพื่อความรวดเร็วในการสลับหน้า
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

        // โหลดข้อมูลกระดิ่งแจ้งเตือนแบบ Async Non-blocking เพื่อไม่ให้หน่วงตารางหลัก
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
        if (titleEl) titleEl.textContent = pageTitle;
        if (subEl) subEl.textContent = pageSubtitle || '';
        document.title = `${pageTitle} - กรุงเทพมหานคร`;

        document.querySelectorAll('#bmaSidebarDrawer a[data-nav-id]').forEach(link => {
            const isMatch = link.dataset.navId === activePage;
            link.classList.toggle('active', isMatch);
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
        const routeInfo = AppLayout.PAGE_ROUTES[targetFile];
        if (!routeInfo) {
            window.location.href = targetFile;
            return;
        }

        UIHelpers.showLoading('กำลังสลับหน้าเมนู...');
        try {
            const response = await fetch(targetFile);
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

            document.querySelectorAll('.bma-page-modal-dynamic, body > div[id^="modal"]').forEach(el => el.remove());
            doc.querySelectorAll('body > div[id^="modal"]').forEach(modalEl => {
                modalEl.classList.add('bma-page-modal-dynamic');
                document.body.appendChild(modalEl);
            });

            if (pushHistory) {
                window.history.pushState({ file: targetFile }, '', targetFile);
            }

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

    static #renderSidebar(currentUser, settings, activePage) {
        const sidebarEl = document.getElementById('bmaSidebarContainer');
        if (!sidebarEl) return;

        const logoHtml = settings.logo_url
            ? `<img src="${settings.logo_url}" alt="Logo" class="w-12 h-12 rounded-xl object-contain bg-white p-1 border-2 border-[#FDD835] shadow-md">`
            : `<div class="w-12 h-12 rounded-xl flex items-center justify-center text-[#00351B] font-extrabold text-xl shadow-md bg-gradient-to-br from-[#FDD835] to-[#F59E0B] border border-white/40">
                   <i class="fa-solid fa-landmark"></i>
               </div>`;

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
                        <button id="btnCloseSidebarMobile" type="button" class="lg:hidden p-2 rounded-lg text-white/80 hover:bg-white/10 cursor-pointer">
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
                                <span class="flex-1 truncate">${item.label}</span>
                                ${item.badgeId ? `<span id="${item.badgeId}" class="hidden px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white shadow">0</span>` : ''}
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

                <!-- ปุ่มออกจากระบบที่ Sidebar (ใช้งานได้ 100% ผ่าน Global Event Delegation) -->
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
                    <button id="btnSidebarLogout" type="button" class="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-rose-100 bg-rose-600/35 border border-rose-400/40 hover:bg-rose-600 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>ออกจากระบบ</span>
                    </button>
                </div>
            </aside>
        `;
    }

    /**
     * สร้างแถบด้านบน (เอาปุ่มออกจากระบบที่มุมขวาบนออกตามข้อกำหนด)
     */
    static #renderTopbar(currentUser, settings, pageTitle, pageSubtitle) {
        const topbarEl = document.getElementById('bmaTopbarContainer');
        if (!topbarEl) return;

        const isDark = document.documentElement.classList.contains('dark');

        topbarEl.innerHTML = `
            <header class="sticky top-0 z-30 bma-header-bar px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 min-w-0">
                    <button id="btnOpenSidebarMobile" type="button" class="lg:hidden p-2.5 rounded-xl border bma-border bma-text-main hover:bg-emerald-500/10 cursor-pointer">
                        <i class="fa-solid fa-bars-staggered text-lg" style="color: var(--bma-primary);"></i>
                    </button>
                    <div class="min-w-0">
                        <h1 id="topbarPageTitle" class="text-lg lg:text-xl font-extrabold truncate bma-text-main">${pageTitle}</h1>
                        <p id="topbarPageSubtitle" class="text-xs lg:text-sm bma-text-sub truncate">${pageSubtitle || ''}</p>
                    </div>
                </div>

                <div class="flex items-center gap-2.5 lg:gap-3">
                    <!-- ระบบกระดิ่งแจ้งเตือน (แจ้งเตือนคำขออนุมัติลงเวลากรณีพิเศษและรีเซ็ตรหัสผ่านตามขอบเขตการมองเห็น) -->
                    <div class="relative" id="notificationBellWrapper">
                        <button id="btnNotificationBell" type="button" class="relative p-2.5 rounded-xl border bma-border bma-text-main hover:border-emerald-500 transition cursor-pointer" title="การแจ้งเตือนรออนุมัติ">
                            <i class="fa-solid fa-bell text-base" style="color: var(--bma-primary);"></i>
                            <span id="topBellBadgeCount" class="hidden absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shadow">0</span>
                        </button>

                        <div id="notificationDropdownMenu" class="hidden absolute right-0 mt-2 w-80 sm:w-96 bma-card bma-modal-surface p-4 shadow-2xl z-50">
                            <div class="flex items-center justify-between pb-2.5 mb-2.5 border-b bma-border">
                                <span class="font-bold text-sm bma-text-main">
                                    <i class="fa-solid fa-bell text-amber-500 mr-1.5"></i>แจ้งเตือนรออนุมัติตามขอบเขต
                                </span>
                                <span id="notificationSummaryTag" class="bma-badge bma-badge-warning">0 รายการ</span>
                            </div>
                            <div id="notificationListContainer" class="space-y-2.5 max-h-80 overflow-y-auto text-sm pr-1">
                                <p class="text-center py-4 bma-text-sub">กำลังตรวจสอบรายการแจ้งเตือน...</p>
                            </div>
                        </div>
                    </div>

                    <!-- ปุ่มสลับโหมดสี Light / Eye-Care Dark Mode -->
                    <button id="btnToggleThemeMode" type="button" class="p-2.5 rounded-xl border bma-border bma-text-main hover:border-emerald-500 transition cursor-pointer" title="สลับโหมดถนอมสายตา (Light/Dark Mode)">
                        <i id="themeModeIcon" class="fa-solid ${isDark ? 'fa-sun text-amber-400' : 'fa-moon text-emerald-800'} text-base"></i>
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
        const footerDesc = settings.footer_description || '';

        footerEl.innerHTML = `
            <footer class="mt-10 py-4 px-4 lg:px-8 bma-footer-bar text-center sm:flex sm:items-center sm:justify-between mb-14 lg:mb-0">
                <div class="text-left">
                    <div class="text-xs font-bold bma-text-main">
                        ระบบลงเวลาปฏิบัติราชการออนไลน์ • <span>${settings.organization_name}</span>
                    </div>
                    ${footerDesc ? `<div class="text-[11px] bma-text-muted mt-0.5">${footerDesc}</div>` : ''}
                </div>
                <div class="text-xs bma-text-sub mt-1.5 sm:mt-0">
                    สังกัด: <span class="font-bold" style="color: var(--bma-primary);">${settings.bureau_name}</span> © พ.ศ. ${yearBuddhist}
                </div>
            </footer>
        `;
    }

    /**
     * โหลดและอัปเดตตัวเลขกระดิ่งแจ้งเตือนเมื่อมีผู้ขออนุมัติลงเวลากรณีพิเศษเข้ามา (กรองตามขอบเขตการมองเห็นของ SuperAdmin และ Admin)
     */
    static async refreshNotificationBell(currentUser) {
        if (!currentUser) return;

        try {
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

    /**
     * ผูกเหตุการณ์แบบ Global Event Delegation เพียงครั้งเดียว
     * ทำให้ปุ่มออกจากระบบที่ Sidebar (#btnSidebarLogout) ทำงานได้ 100% แม้มีการเรนเดอร์ Sidebar ซ้ำ
     */
    static #bindGlobalDelegatedEvents() {
        if (AppLayout.#isGlobalEventsBound) return;
        AppLayout.#isGlobalEventsBound = true;

        document.addEventListener('click', async (e) => {
            // 1. ปุ่มออกจากระบบที่ Sidebar (#btnSidebarLogout)
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
                    window.location.href = 'index.html';
                }
                return;
            }

            // 2. ปุ่มเปิด/ปิด Sidebar บนมือถือ
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

            // 3. ปุ่มสลับโหมดสี Light / Dark
            if (e.target.closest('#btnToggleThemeMode')) {
                const mode = UIHelpers.toggleTheme();
                const themeIcon = document.getElementById('themeModeIcon');
                if (themeIcon) {
                    themeIcon.className = mode === 'dark'
                        ? 'fa-solid fa-sun text-amber-400 text-base'
                        : 'fa-solid fa-moon text-emerald-800 text-base';
                }
                return;
            }

            // 4. ปุ่มเปิด/ปิด Dropdown กระดิ่งแจ้งเตือน
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

            // 5. ดักคลิกลิงก์เมนูภายในระบบผู้ดูแลระบบเพื่อโหลดเฉพาะ <main> แบบ AJAX SPA
            const anchor = e.target.closest('a[href]');
            if (anchor) {
                const href = anchor.getAttribute('href') || '';
                const cleanFile = href.split('?')[0].split('#')[0].split('/').pop();
                if (AppLayout.PAGE_ROUTES[cleanFile]) {
                    e.preventDefault();
                    bellMenu?.classList.add('hidden');
                    await AppLayout.navigateAjaxPage(cleanFile, true);
                }
            }
        });

        window.addEventListener('popstate', async () => {
            const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
            if (AppLayout.PAGE_ROUTES[currentFile]) {
                await AppLayout.navigateAjaxPage(currentFile, false);
            }
        });
    }
}