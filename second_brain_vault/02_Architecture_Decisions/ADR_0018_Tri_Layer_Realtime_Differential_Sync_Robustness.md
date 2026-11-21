# ADR 0018: Tri-Layer Robust Realtime Differential Sync (Dashboard, Reports, Checkin)

- **Date**: 2026-11-10
- **Status**: Accepted & Verified (`Build ID: 20261110_441919b6`)
- **Task ID**: `PIPE-20261110-realtime-diff-sync-robustness-fix`
- **Linked Flows**: `FLOW_02` (Checkin/Checkout), `FLOW_03` (Executive Dashboard), `FLOW_05` (Daily Reports), `FLOW_07` (Global Realtime Notification)

## Context & Problem Statement
In previous iterations, Realtime Differential Sync failed on `dashboard.html`, `reports.html`, and `checkin.html` due to four critical bottlenecks:
1. `AttendanceModel.getTodaySyncWatermark()` invoked `UIHelpers.getTodayDateString()` which threw an unhandled `TypeError` (since only `getTodayISO()` existed), halting the 6-second polling watermark detector completely.
2. `AttendanceModel.js` never emitted `broadcastRealtimeEvent('attendance_updated')`, leaving the peer-to-peer Broadcast layer unutilized.
3. `ReportsController.js` evaluated `prev.status_key !== fr.status_key`, but `AttendanceModel.#formatReportRow()` populated `status_category` rather than `status_key`, rendering `categoryChanged` permanently `false` (`undefined !== undefined`). In addition, `oldMap` did not match empty placeholder UIDs against fresh UUIDs, preventing cross-table row movement.
4. `DashboardController.js` sorted recent check-in entries using `.reverse()`, reversing the Thai alphabet A-Z into Z-A (ฮ-ก), causing new check-in records to fall outside the Top 5.
5. `AppLayout.js` simultaneously emitted both `bma:realtime-delta-sync` and `bma:realtime-sync` without debouncing, creating race conditions between concurrent asynchronous fetch operations.

## Decision & Implementation
1. **Tri-Layer Architecture**:
   - **Layer 1 (Peer Broadcast Bus)**: Instant broadcast via `bma_global_realtime_bus` on `submitCheckinOrCheckout()`, `saveAdminAttendanceRecord()`, `deleteAttendanceRecord()`, `processSpecialRequestsBulk()`, and `submitSpecialRequest()`.
   - **Layer 2 (Supabase WebSocket)**: `postgres_changes` on `attendance_logs` and `user_accounts` with status logging.
   - **Layer 3 (Watermark Fallback Polling)**: Fallback every 6 seconds computing live signature from `attendance_logs` and `system_settings` using `UIHelpers.getTodayISO()`.
2. **Debounce & Event Deduplication**:
   - Single event `bma:realtime-delta-sync` dispatched.
   - 250ms debounce timers introduced in `DashboardController` and `ReportsController`.
3. **Deterministic Chronological Sorting in Dashboard**:
   - Sort `freshCheckedIn` by `updated_at || created_at` descending, followed by checkout and checkin times.
4. **Resilient Mapping in Reports**:
   - Map `oldMap` by `row_uid`, `log_id`, and `${personnel_id}_${work_date}` to handle both INSERT (empty -> uuid) and DELETE (uuid -> empty) transitions.
   - Compare `(prev.status_category || prev.status_key) !== (fr.status_category || fr.status_key)`.
5. **Checkin In-Place Synchronization**:
   - Listen to `attendance_logs` and `attendance_updated` to in-place refresh active records and today's history for the current user.
