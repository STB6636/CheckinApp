/**
 * @file assets/js/components/AppLayout.js
 * @description คลาสสร้างโครงสร้าง Layout ส่วนกลาง (Sidebar, Topbar, กระดิ่งแจ้งเตือน, Mobile Navigation, Footer)
 */

import { AuthService } from '../core/AuthService.js';
import { UIHelpers } from '../core/UIHelpers.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { AttendanceModel } from '../models/AttendanceModel.js';
import { UserModel } from '../models/UserModel.js';

export class AppLayout {
    /**
     * เริ่มต้นเรนเดอร์โครงสร้างหน้าจอผู้ดูแลระบบทั้งหมด
     * @param {Object} options
     * @param {string} options.activePage ชื่อเมนูที่กำลังเปิดอยู่ ('dashboard'|'personnel'|'users'|'approvals'|'reports'|'settings')
     * @param {string} options.pageTitle หัวข้อหน้าจอปัจจุบัน
     * @param {string} options.pageSubtitle คำอธิบายย่อยของหน้าจอ
     * @returns {Promise<{currentUser: Object, settings: Object}>}
     */
    static async initAdminLayout({ activePage, pageTitle, pageSubtitle = '' }) {
        UIHelpers.initTheme();

        // ตรวจสอบสิทธิ์ (เฉพาะ SuperAdmin และ Admin เท่านั้นที่เข้าหลังบ้านได้)
        const allowedRoles = activePage === 'settings' ? ['SuperAdmin'] : ['SuperAdmin', 'Admin'];
        const currentUser = AuthService.requireAuth(allowedRoles);
        if (!currentUser) return { currentUser: null, settings: null };

        const settings = await SettingsModel.getSettings();

        AppLayout.#renderSidebar(currentUser, settings, activePage);
        AppLayout.#renderTopbar(currentUser, settings, pageTitle, pageSubtitle);
        AppLayout.#renderMobileBottomNav(currentUser, activePage);
        AppLayout.#renderFooter(settings);
        AppLayout.#bindEvents();

        // โหลดตัวเลขแจ้งเตือนที่กระดิ่งแบบ Async
        AppLayout.refreshNotificationBell(currentUser);

        // อัปเดตข้อมูลเมื่อมีการแก้ไขตั้งค่าระบบ
        window.addEventListener('bma:settings-updated', (e) => {
            const newSettings = e.detail;
            AppLayout.#renderSidebar(currentUser, newSettings, activePage);
            AppLayout.#renderFooter(newSettings);
        });

        return { currentUser, settings };
    }

    /**
     * สร้างแถบเมนูด้านซ้ายมือ (Sidebar Navigation)
     */
    static #renderSidebar(currentUser, settings, activePage) {
        const sidebarEl = document.getElementById('bmaSidebarContainer');
        if (!sidebarEl) return;

        const logoHtml = settings.logo_url
            ? `<img src="${settings.logo_url}" alt="Logo" class="w-11 h-11 rounded-xl object-contain bg-white p-1 border border-emerald-500/30 shadow-sm">`
            : `<div class="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm" style="background-color: var(--bma-primary);">
                   <i class="fa-solid fa-landmark"></i>
               </div>`;

        // รายการเมนูหลัก (ซ่อนเมนูตั้งค่าระบบหากไม่ใช่ SuperAdmin ตามข้อกำหนด V2.1)
        const menuItems = [
            { id: 'dashboard', href: 'dashboard.html', icon: 'fa-chart-pie', label: 'แดชบอร์ดภาพรวม', roles: ['SuperAdmin', 'Admin'] },
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
            <!-- Backdrop สำหรับ Mobile -->
            <div id="bmaSidebarBackdrop" class="fixed inset-0 bg-black/50 z-40 hidden lg:hidden backdrop-blur-xs transition-opacity"></div>

            <!-- ตัว Sidebar ด้านซ้ายมือ -->
            <aside id="bmaSidebarDrawer" class="fixed top-0 left-0 bottom-0 w-72 bma-card rounded-none border-y-0 border-l-0 z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 flex flex-col justify-between">
                <div>
                    <!-- ส่วนหัวโลโก้และชื่อหน่วยงาน -->
                    <div class="p-5 border-b bma-border flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3 min-w-0">
                            ${logoHtml}
                            <div class="min-w-0">
                                <h2 class="font-bold text-base truncate bma-text-main">${settings.organization_name}</h2>
                                <p class="text-xs font-medium truncate" style="color: var(--bma-primary);">${settings.bureau_name}</p>
                            </div>
                        </div>
                        <button id="btnCloseSidebarMobile" type="button" class="lg:hidden p-2 rounded-lg bma-text-sub hover:bg-black/5">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    <!-- ข้อมูลสิทธิ์และขอบเขตการมองเห็น -->
                    <div class="px-5 py-3 border-b bma-border bg-emerald-500/5">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-semibold bma-text-sub">ระดับบัญชีผู้ใช้</span>
                            <span class="bma-badge ${currentUser.role === 'SuperAdmin' ? 'bma-badge-success' : 'bma-badge-indigo'}">
                                ${currentUser.role}
                            </span>
                        </div>
                        <p class="text-xs bma-text-sub mt-1 truncate" title="${scopeText}">
                            <i class="fa-solid fa-eye mr-1"></i>${scopeText}
                        </p>
                    </div>

                    <!-- รายการเมนู -->
                    <nav class="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
                        <div class="text-[11px] font-bold uppercase tracking-wider bma-text-muted px-3 mb-2">เมนูการจัดการระบบ</div>
                        ${visibleMenus.map(item => `
                            <a href="${item.href}" class="bma-nav-item ${activePage === item.id ? 'active' : ''}">
                                <i class="fa-solid ${item.icon} w-5 text-center"></i>
                                <span class="flex-1 truncate">${item.label}</span>
                                ${item.badgeId ? `<span id="${item.badgeId}" class="hidden px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">0</span>` : ''}
                            </a>
                        `).join('')}

                        <div class="pt-3 mt-3 border-t bma-border">
                            <a href="checkin.html" class="bma-nav-item">
                                <i class="fa-solid fa-camera-retro w-5 text-center text-emerald-500"></i>
                                <span class="flex-1 truncate">ไปหน้าลงเวลาปฏิบัติราชการ</span>
                            </a>
                        </div>
                    </nav>
                </div>

                <!-- ส่วนท้าย Sidebar แสดงชื่อผู้ใช้และปุ่มออกจากระบบ -->
                <div class="p-4 border-t bma-border">
                    <div class="flex items-center gap-3 mb-3 px-2">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm" style="background-color: var(--bma-sec-6);">
                            ${String(currentUser.full_name || 'U').charAt(0)}
                        </div>
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-semibold truncate bma-text-main">${currentUser.full_name}</p>
                            <p class="text-xs truncate bma-text-sub">@${currentUser.username}</p>
                        </div>
                    </div>
                    <button id="btnSidebarLogout" type="button" class="w-full btn-bma-outline text-rose-500 border-rose-500/30 hover:bg-rose-500/10 text-sm py-2">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>ออกจากระบบ</span>
                    </button>
                </div>
            </aside>
        `;
    }

    /**
     * สร้างแถบด้านบน (Top Navigation Bar) พร้อมกระดิ่งแจ้งเตือน และปุ่มสลับ Dark Mode
     */
    static #renderTopbar(currentUser, settings, pageTitle, pageSubtitle) {
        const topbarEl = document.getElementById('bmaTopbarContainer');
        if (!topbarEl) return;

        const isDark = document.documentElement.classList.contains('dark');

        topbarEl.innerHTML = `
            <header class="sticky top-0 z-30 bma-card rounded-none border-t-0 border-x-0 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 min-w-0">
                    <button id="btnOpenSidebarMobile" type="button" class="lg:hidden p-2.5 rounded-xl border bma-border bma-text-main hover:bg-emerald-500/10">
                        <i class="fa-solid fa-bars-staggered text-lg"></i>
                    </button>
                    <div class="min-w-0">
                        <h1 class="text-lg lg:text-xl font-bold truncate bma-text-main">${pageTitle}</h1>
                        ${pageSubtitle ? `<p class="text-xs lg:text-sm bma-text-sub truncate">${pageSubtitle}</p>` : ''}
                    </div>
                </div>

                <div class="flex items-center gap-2.5 lg:gap-3">
                    <!-- กระดิ่งแจ้งเตือน (คำขอลงเวลากรณีพิเศษ + คำขอรีเซ็ตรหัสผ่าน) -->
                    <div class="relative">
                        <button id="btnNotificationBell" type="button" class="relative p-2.5 rounded-xl border bma-border bma-text-main hover:border-emerald-500 transition" title="การแจ้งเตือนรออนุมัติ">
                            <i class="fa-solid fa-bell text-base"></i>
                            <span id="topBellBadgeCount" class="hidden absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shadow">0</span>
                        </button>

                        <!-- Dropdown รายการแจ้งเตือน -->
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

                    <!-- ปุ่มสลับโหมดสี Light / Eye-Care Dark Mode -->
                    <button id="btnToggleThemeMode" type="button" class="p-2.5 rounded-xl border bma-border bma-text-main hover:border-emerald-500 transition" title="สลับโหมดถนอมสายตา (Light/Dark Mode)">
                        <i id="themeModeIcon" class="fa-solid ${isDark ? 'fa-sun text-amber-400' : 'fa-moon text-slate-700'} text-base"></i>
                    </button>

                    <!-- ปุ่มออกจากระบบบน Topbar -->
                    <button id="btnTopbarLogout" type="button" class="hidden sm:inline-flex btn-bma-outline text-sm py-2 px-3 text-rose-500 border-rose-500/30">
                        <i class="fa-solid fa-power-off"></i>
                        <span class="hidden md:inline">ออกระบบ</span>
                    </button>
                </div>
            </header>
        `;
    }

    /**
     * สร้างแถบเมนูด้านล่างสำหรับหน้าจอมือถือ (Mobile Bottom Navigation Bar)
     */
    static #renderMobileBottomNav(currentUser, activePage) {
        const mobileNavEl = document.getElementById('bmaMobileBottomNav');
        if (!mobileNavEl) return;

        const items = [
            { id: 'dashboard', href: 'dashboard.html', icon: 'fa-chart-pie', label: 'แดชบอร์ด' },
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
                        <a href="${item.href}" class="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-semibold transition ${isActive ? '' : 'bma-text-sub'}" style="${isActive ? 'color: var(--bma-primary);' : ''}">
                            <i class="fa-solid ${item.icon} text-base mb-0.5"></i>
                            <span>${item.label}</span>
                        </a>
                    `;
                }).join('')}
            </nav>
        `;
    }

    /**
     * สร้างชุดไอคอนทางลัดสไตล์โทรศัพท์ iPhone สำหรับแสดงเฉพาะบนหน้าจอมือถือ (Responsive Mobile)
     * ใช้ในหน้าแดชบอร์ดและหน้ารายงานตามข้อกำหนด
     * @param {Object} currentUser
     * @returns {string} HTML string
     */
    static getMobileShortcutGridHtml(currentUser) {
        const shortcuts = [
            { href: 'checkin.html', icon: 'fa-camera', label: 'ลงเวลา', bg: '#00744B' },
            { href: 'dashboard.html', icon: 'fa-chart-pie', label: 'แดชบอร์ด', bg: '#0284C7' },
            { href: 'reports.html', icon: 'fa-file-pdf', label: 'รายงาน PDF', bg: '#F59E0B' },
            { href: 'approvals.html', icon: 'fa-bell-concierge', label: 'อนุมัติพิเศษ', bg: '#6366F1' },
            { href: 'personnel.html', icon: 'fa-users', label: 'บุคลากร', bg: '#059669' },
            { href: 'users.html', icon: 'fa-key', label: 'รีเซ็ตรหัส', bg: '#F43F5E' }
        ];

        if (currentUser?.role === 'SuperAdmin') {
            shortcuts.push({ href: 'settings.html', icon: 'fa-sliders', label: 'ตั้งค่าระบบ', bg: '#EA580C' });
        }

        return `
            <div class="block lg:hidden bma-card p-4 mb-5">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold uppercase tracking-wider bma-text-sub">
                        <i class="fa-solid fa-mobile-screen-button mr-1"></i>ทางลัดด่วน (Mobile Shortcuts)
                    </span>
                </div>
                <div class="grid grid-cols-4 sm:grid-cols-6 gap-3 text-center">
                    ${shortcuts.map(s => `
                        <a href="${s.href}" class="flex flex-col items-center gap-1.5 no-underline group">
                            <div class="ios-shortcut-icon" style="background: ${s.bg};">
                                <i class="fa-solid ${s.icon}"></i>
                            </div>
                            <span class="text-xs font-medium bma-text-main truncate w-full">${s.label}</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * สร้าง Footer ดึงข้อมูลชื่อหน่วยงานและชื่อสังกัด [สำนักงาน/กอง] จากฐานข้อมูล
     */
    static #renderFooter(settings) {
        const footerEl = document.getElementById('bmaFooterContainer');
        if (!footerEl) return;

        const yearBuddhist = new Date().getFullYear() + 543;
        footerEl.innerHTML = `
            <footer class="mt-10 py-5 px-4 lg:px-8 border-t bma-border text-center sm:flex sm:items-center sm:justify-between text-xs bma-text-sub mb-14 lg:mb-0">
                <div class="font-semibold bma-text-main">
                    ระบบลงเวลาปฏิบัติราชการออนไลน์ • <span>${settings.organization_name}</span>
                </div>
                <div class="mt-1 sm:mt-0">
                    สังกัด: <span class="font-semibold" style="color: var(--bma-primary);">${settings.bureau_name}</span> © พ.ศ. ${yearBuddhist}
                </div>
            </footer>
        `;
    }

    /**
     * โหลดและอัปเดตตัวเลขกระดิ่งแจ้งเตือน (คำขอลงเวลากรณีพิเศษ + คำขอรีเซ็ตรหัสผ่าน)
     * @param {Object} currentUser
     */
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

    /**
     * ผูกเหตุการณ์ปุ่มเปิด/ปิด Sidebar, ปุ่มสลับโหมดสี, กระดิ่งแจ้งเตือน และปุ่มออกจากระบบ
     */
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

        // สลับโหมดสี Light / Dark
        const btnTheme = document.getElementById('btnToggleThemeMode');
        const themeIcon = document.getElementById('themeModeIcon');
        btnTheme?.addEventListener('click', () => {
            const mode = UIHelpers.toggleTheme();
            if (themeIcon) {
                themeIcon.className = mode === 'dark'
                    ? 'fa-solid fa-sun text-amber-400 text-base'
                    : 'fa-solid fa-moon text-slate-700 text-base';
            }
        });

        // เปิด/ปิด Dropdown กระดิ่งแจ้งเตือน
        const btnBell = document.getElementById('btnNotificationBell');
        const bellMenu = document.getElementById('notificationDropdownMenu');
        btnBell?.addEventListener('click', (e) => {
            e.stopPropagation();
            bellMenu?.classList.toggle('hidden');
        });
        document.addEventListener('click', () => {
            bellMenu?.classList.add('hidden');
        });

        // ออกจากระบบด้วย SweetAlert2 Confirm
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