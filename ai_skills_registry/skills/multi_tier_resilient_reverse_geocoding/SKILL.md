---
id: "multi_tier_resilient_reverse_geocoding"
name: "Multi-Tier Resilient Reverse Geocoding & POI Resolution Pattern"
version: "1.0.0"
type: "skill"
last_updated_phase: "PIPE-20261111-checkin-gps-nearby-places-algorithm-redesign"
flow_links: ["FLOW_GPS_01", "FLOW_CHECKIN_01"]
---

# Multi-Tier Resilient Reverse Geocoding & POI Resolution Pattern

## 1. Overview & Problem Statement
When resolving human-readable place names from raw mobile device GPS coordinates (`lat`, `lng`), standard third-party reverse geocoders (such as OpenStreetMap Nominatim or Overpass API) frequently cause severe UX degradation:
1. **Third-Party Latency & Throttling**: Public servers in foreign regions suffer 5–25s delays or return HTTP 406/429/504 errors when queried without proper headers (`User-Agent`, `Accept`).
2. **Hierarchy Inversion**: Nearest street/road/soi names take precedence over nearby landmarks, government buildings, schools, hospitals, or commercial places.
3. **Cache Poisoning**: Temporary network drops permanently cache empty/fallback strings across the session.
4. **Coordinate Leakage**: Fallback logic drops into raw numbers like `"ใกล้เคียง ซอยในพื้นที่ (13.75633, 100.50177)"`.

This pattern establishes a 5-Tier Resilient Reverse Geocoding Architecture designed for high-availability enterprise attendance systems.

---

## 2. 5-Tier Architectural Hierarchy

```mermaid
flowchart TD
    In["Input Coordinates (lat, lng, options)"] --> T0{"Tier 0: In-Memory Official Locations<br>(0ms, 100% Uptime, zero network)"}
    T0 -- "Match <= effective radius" --> R0["Return: 'บริเวณ [Official Name]' (z=20)"]
    T0 -- "Outside official boundaries" --> Par["Parallel Network Request Race<br>&bull; Nominatim z=18 (Building/POI, 1800ms)<br>&bull; Nominatim z=19/20 (Local feature, 1400ms)<br>&bull; Overpass Mirror Racing (Promise.any, 1800ms)"]
    Par --> T1{"Tier 1: High-Priority POI Places<br>(Gov, Landmarks, Transit, Shops, Condos)"}
    T1 -- "POI found within 150m" --> R1["Return: 'บริเวณ/ใกล้เคียง [POI Name]'"]
    T1 -- "No POIs found" --> T2{"Tier 2: Clean Soi / Sub-Soi<br>(Only when NO POIs exist)"}
    T2 -- "Soi found" --> R2["Return: 'ใกล้เคียง [Soi Name]'"]
    T2 -- "No Soi found" --> T3{"Tier 3: Targeted Radial Retry<br>(Expand radius: 180m, 300m)"}
    T3 -- "Retry POI found" --> R1
    T3 -- "Retry Soi found" --> R2
    T3 -- "Exhausted" --> T4["Tier 4: Smart Semantic Fallback<br>(Province/District/Road context, zero raw coords)"]
```

---

## 3. Implementation Blueprint

### 3.1 Network Optimization & Mirror Racing
1. **User-Agent & Accept Headers**:
   ```javascript
   headers: {
       'Accept': 'application/json, application/osm3s+json, */*',
       'User-Agent': 'BMA-CheckinApp-Mobile/2.7 (Bangkok Metropolitan Administration Attendance)'
   }
   ```
2. **Overpass Mirror Racing with `Promise.any`**:
   Never use `Promise.all` across third-party mirrors. Race them using `Promise.any`:
   ```javascript
   const fetchMirror = async (baseUrl) => {
       const res = await this.#fetchWithFastTimeout(`${baseUrl}?data=${encoded}`, timeoutMs);
       if (res && Array.isArray(res.elements) && res.elements.length > 0) return res;
       throw new Error('Empty');
   };
   return await Promise.any(mirrors.map(fetchMirror)).catch(() => null);
   ```

### 3.2 Strict Place-Over-Soi Classification
- Scan candidate POIs across 0–150m first.
- Only if `places.length === 0`, evaluate `#extractCleanSoiOrSubSoi`.
- In Thai text, word boundaries lack spaces; use `/^(ซอย|ซ\.|ตรอก|แยก)\s*/i` rather than requiring `\s+`.

### 3.3 Anti-Cache-Poisoning Rule
Never cache degraded fallbacks caused by transient network outages:
```javascript
const isOfflineNetworkFailure = !nomZ18 && !nomZ19 && !nomZ20 && initialElements.length === 0;
if (!isOfflineNetworkFailure) {
    this.#locationCache.set(cacheKey, resultObj);
}
```
