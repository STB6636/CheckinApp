# Phase 0.1: Second Brain & Architecture Analysis
Task ID: `PIPE-20261110-realtime-diff-sync-robustness-fix`
Timestamp: 2026-11-10T16:55:00+07:00

## 1. Flow Identification & Impacted Modules
- **FLOW_02: Check-in / Check-out (`checkin.html` -> `CheckinController.js` -> `AttendanceModel.js`)**
  - Action: User records check-in, checkout, or OT.
  - Defect: Does not broadcast `attendance_updated` on `bma_global_realtime_bus`, preventing peer tabs and mobile/desktop clients from synchronizing immediately without waiting for DB replication.
- **FLOW_03: Executive Dashboard (`dashboard.html` -> `DashboardController.js`)**
  - Action: Realtime Differential Sync of KPI cards and recent check-in table.
  - Defect:
    1. Double-triggered by both `bma:realtime-delta-sync` and `bma:realtime-sync` back-to-back, causing race condition in `loadDashboardData(true)` which corrupts `this.lastMetrics`.
    2. `newCat.percentage` rendered as `undefined%` due to property mismatch (`newCat.percent`).
- **FLOW_05: Daily Reports (`reports.html` -> `ReportsController.js`)**
  - Action: Realtime in-place status category movement and highlight.
  - Defect: Double-triggered by dual events without debounce, leading to conflicting asynchronous fetch cycles.
- **FLOW_07: System Settings & Global Notification Layout (`AppLayout.js` -> `SettingsModel.js`)**
  - Defect:
    1. `AttendanceModel.getTodaySyncWatermark()` crashed with `TypeError: UIHelpers.getTodayDateString is not a function`, killing the 6-second watermark sync loop entirely.
    2. Realtime listener listened to non-existent table `password_reset_requests` instead of `user_accounts`.

## 2. ADR Decision
- Add alias `UIHelpers.getTodayDateString()` pointing to `UIHelpers.getTodayISO()`.
- Add Broadcast dispatch to `AttendanceModel.submitCheckinOrCheckout()`, `saveAdminAttendanceRecord()`, `deleteAttendanceRecord()`.
- Implement 250ms Debounced Event Dispatch in `DashboardController` and `ReportsController`.
- Correct `DashboardController` percent property and progress fill.
