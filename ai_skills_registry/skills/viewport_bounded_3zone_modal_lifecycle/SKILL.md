---
name: viewport_bounded_3zone_modal_lifecycle
description: Unified mobile-safe 3-zone Flex Column modal architecture using 100dvh dynamic viewport caps, my-auto negative-Y overflow prevention, Tailwind v3 backdrop-blur-sm, strict z-[9990]/z-[9999]/99990 stacking hierarchy, and idempotent SPA-safe body scroll lock & dismiss lifecycle.
version: 1.0.0
---

# Viewport-Bounded 3-Zone Responsive Modal Lifecycle Pattern (`v1.0.0`)

## When to Use
Use whenever building, auditing, or refactoring modals/dialogs in Tailwind v3 mobile-first web apps (especially Admin Portals with fixed mobile bottom navbars, long vertical forms, Android Chrome/Brave dynamic toolbars, or soft-keyboard resize).

## Core Pitfalls Eliminated
1. **Flexbox `items-center` Negative-Y Top Clipping**: Tall flex children (`> viewportHeight`) inside an `align-items: center; overflow-y: auto` container overflow symmetrically into negative `y` above `scrollTop = 0`, permanently slicing headers and close `[X]` buttons off-screen.
2. **Legacy `overflow: hidden` + `100vh` CSS Hacks**: Clamping modal cards via external CSS without `flex-1 min-h-0 overflow-y-auto` internal scroll severs lower fields, ignores mobile dynamic address bars, and creates bottom gaps that expose fixed bottom navigation bars.
3. **Tailwind v4 `backdrop-blur-xs` Under Tailwind Play CDN v3**: Compiles silently to `backdrop-filter: none`, removing frosted backdrop separation unless `backdrop-blur-sm` (or v3-valid utilities) is used.
4. **`z-50` Chrome Ties & Stale Body Scroll Locks**: Page modals at `z-50` collide with sidebar drawers / notification dropdowns, and SPA route transitions can leave `body.bma-modal-open` locked if not synchronized cleanly.

## Standard Architecture
1. **Strict Z-Index Layering**:
   - Fixed Nav / Topbar (`z-30`) < Backdrop / Sticky Bar (`z-40`) < Drawer / Dropdown (`z-50`) < **Page Modals (`z-[9990]`)** < **Fullscreen/Check-in/System Update Modals (`z-[9999]`)** < **SweetAlert2 `.swal2-container` (`99990 !important`)** < Progress (`99999`) < Toast (`100000`) < Global Spinner (`999999`).
2. **Outer Overlay + Card Anatomy**:
   - Overlay: `fixed inset-0 z-[9990] hidden flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto overscroll-contain`
   - Card (`> div`): `w-full <max-w-*> my-auto bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl border ... flex flex-col max-h-[calc(100dvh-1.25rem)] sm:max-h-[90dvh] overflow-hidden` (no `my-8`/`my-6`, keep `my-auto`).
   - 3-Zone Internal Structure:
     1. **Pinned Header (`shrink-0`)**: Always reachable at `top >= 0` with close `[X]` button.
     2. **Scrollable Middle (`flex-1 min-h-0 overflow-y-auto overscroll-contain`)**: For form modals, `<form class="flex-1 min-h-0 flex flex-col overflow-hidden">` wraps both the scrollable field region and the sticky footer.
     3. **Pinned Footer (`shrink-0 flex-wrap`)**: Action/Cancel/Save buttons remain visible and clickable above mobile bottom chrome.
3. **Idempotent Lifecycle Helpers (`UIHelpers.js`)**:
   - `UIHelpers.syncBodyModalLock()`: Toggles `body.bma-modal-open` (`overflow: hidden !important; overscroll-behavior: contain;`) based on genuinely visible `.fixed.inset-0:not(.hidden)` overlays (excluding `#bmaSidebarBackdrop`, hidden ancestors, `.invisible`, and `pointer-events-none`). Also invoked in `AppLayout.navigateAjaxPage()`.
   - `UIHelpers.prepareModalOpen(modalEl)`: Resets `scrollTop = 0` on `modalEl` and all `.overflow-y-auto, .overflow-auto` children before syncing body lock.
   - `UIHelpers.bindModalDismiss(modalEl, closeCallback)`: Uses `dataset.bmaDismissBound` guard to bind backdrop-click dismiss, top-most `Escape` dismiss (ignoring active `.swal2-popup:not(.swal2-toast)` popups), and mobile `< 1024px` focused-input `scrollIntoView`.
