# Second Brain Context: PIPE-20261111-gps-refresh-cachebust-and-clock-format-fix

## Relevant Architecture Decisions & Knowledge Assets
- **ADR 0021**: `second_brain_vault/02_Architecture_Decisions/ADR_0021_GPS_5Tier_Nearby_Places_Resolution_Architecture.md`
  - Flow ID: `FLOW_GPS_01` (Multi-Tier Reverse Geocoding & POI Resolution Flow)
  - Flow ID: `FLOW_CHECKIN_01` (Checkin Layout & GPS Card Flow)
- **Key Concepts**:
  - `maximumAge: 0` is required by W3C Geolocation API to force the browser to invalidate cached coordinates and query the GPS hardware/satellite receiver fresh.
  - `AttendanceModel.#locationCache` must be bypassed (`bypassCache: true`) or cleared via `AttendanceModel.clearLocationCache()` when the user initiates a manual refresh.
  - Geolocation callbacks must be wrapped in a Promise to allow `await this.#initGpsLocation({ forceRefresh: true })` to synchronize UI spinners and toasts.
  - Current clock display (`#liveClockDisplay`) standardizes on `HH:mm น.` without seconds (`${hh}:${mm} น.`).
