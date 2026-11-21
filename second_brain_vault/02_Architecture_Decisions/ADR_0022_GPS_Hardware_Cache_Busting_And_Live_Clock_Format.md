# ADR 0022: GPS Hardware Cache-Busting, Re-entrancy Resilience & Live Clock Format

> **Status**: Accepted & Implemented  
> **Date**: 2026-11-11  
> **Task ID**: `PIPE-20261111-gps-refresh-cachebust-and-clock-format-fix`  
> **Build ID**: `20261111_1da74619`  
> **Flows**: `FLOW_GPS_01` (Multi-Tier Reverse Geocoding & POI Resolution Flow), `FLOW_CHECKIN_01` (Checkin Layout & GPS Card Flow)

---

## Context & Problem
1. **GPS Cache Stagnation on Refresh**:
   - `navigator.geolocation.getCurrentPosition(...)` was hardcoded with `maximumAge: 30000`, which instructed mobile and desktop browsers to reuse cached satellite/cellular triangulation fixes up to 30 seconds old rather than polling the GPS receiver hardware.
   - `#initGpsLocation()` lacked Promise-based synchronization, causing the `#btnRefreshGps` click handler to prematurely dismiss spinners and pop a success toast before the GPS hardware fix settled.
   - `AttendanceModel.#locationCache` retained previous in-memory POI results, preventing fresh reverse-geocoding resolution.
   - Stale in-memory coordinates (`this.gpsData.lat`, `lng`) remained valid during re-acquisition.
2. **Clock Display Redundancy**:
   - `#liveClockDisplay` rendered seconds (`${hh}:${mm}:${ss} น.`), causing constant distracting visual churn on the unified checkin status banner.

---

## Decision & Implementation
1. **W3C Geolocation Hardware Cache Invalidation**:
   - When `forceRefresh === true`: passed `maximumAge: 0` to completely bypass OS/browser geolocation caches.
   - Extended `timeout` to 12,000ms to allow sufficient cold-start satellite acquisition time.
   - Purged stale coordinates (`ready = false; lat = null; lng = null;`) and re-rendered geofence/step-validation UI immediately.
2. **Reverse Geocoding Cache Invalidation**:
   - Explicitly invoked `AttendanceModel.clearLocationCache()` and passed `bypassCache: true` during force refresh.
3. **Re-entrancy & Toast Guards**:
   - Added `isResolvingLocation` guard and `pointer-events-none opacity-70` class toggling to `#btnRefreshGps`.
   - Conditioned success toasts strictly on `res?.ready === true`.
4. **Live Clock Simplification**:
   - Formatted `#liveClockDisplay` to `${hh}:${mm} น.` (hours and minutes only).

---

## Consequences
- **Positive**: 100% fresh hardware GPS fixes on manual refresh, zero premature success toasts, zero stale coordinate race conditions, and clean distraction-free clock formatting.
- **Negative/Tradeoff**: Initial satellite cold fix on `maximumAge: 0` may take 2–6 seconds depending on outdoor sky visibility and device hardware.
