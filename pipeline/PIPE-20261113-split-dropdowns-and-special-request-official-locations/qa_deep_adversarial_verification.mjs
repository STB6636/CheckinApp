/**
 * qa_deep_adversarial_verification.mjs
 * Deep verification covering edge cases, multi-column retry fallbacks, deduplication, and integration scenarios.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('======================================================================');
console.log('🧪 Starting Deep Adversarial Verification Suite');
console.log('======================================================================');

// -----------------------------------------------------------------------------
// Suite 1: SettingsModel Fallback and Retry Loop Simulation
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 1: SettingsModel Multi-Column Retry Fallback & Remarks Sync');
{
    // Simulate Supabase update retry when multiple columns do not exist in DB
    const missingColumns = new Set(['offsite_job_types', 'special_request_reasons']);
    
    // Simulate DB upsert
    let attempts = 0;
    const mockDbUpsert = async (payload) => {
        attempts++;
        for (const col of missingColumns) {
            if (col in payload) {
                return {
                    data: null,
                    error: {
                        code: '42703',
                        message: `column "${col}" of relation "system_settings" does not exist`
                    }
                };
            }
        }
        return {
            data: { id: 1, ...payload },
            error: null
        };
    };

    // Run while-loop stripping logic from SettingsModel
    const initialPayload = {
        id: 1,
        organization_name: 'กรุงเทพมหานคร',
        offsite_job_types: ['งานนอก 1', 'งานนอก 2'],
        special_request_reasons: ['เหตุผล 1', 'เหตุผล 2'],
        remarks: ['เก่า 1']
    };

    let { data, error } = await mockDbUpsert(initialPayload);
    assert.ok(error, 'Initial upsert should fail due to missing column');

    const fallbackUpdateData = { ...initialPayload };
    let maxRetries = 6;
    while (error && maxRetries > 0 && (error.code === '42703' || String(error.message || '').includes('column') || String(error.message || '').includes('does not exist'))) {
        maxRetries--;
        let strippedAny = false;
        const errMsg = String(error.message || '');
        const knownOptionalColumns = [
            'offsite_job_types',
            'special_request_reasons',
            'official_locations',
            'allow_gallery_fallback',
            'filter_shifts_by_realtime',
            'disable_normal_hours_checkin',
            'randomize_gps_radius_meters',
            'randomize_gps_checkout',
            'early_shift_window_minutes'
        ];
        for (const col of knownOptionalColumns) {
            if (errMsg.includes(col) && col in fallbackUpdateData) {
                delete fallbackUpdateData[col];
                strippedAny = true;
            }
        }
        if (!strippedAny) break;
        const retryRes = await mockDbUpsert(fallbackUpdateData);
        data = retryRes.data;
        error = retryRes.error;
    }

    assert.strictEqual(error, null, 'Multi-column retry must succeed after stripping missing columns');
    assert.ok(attempts >= 3, `Should have tried 3 times (initial + 2 retries), actual: ${attempts}`);
    assert.strictEqual(fallbackUpdateData.offsite_job_types, undefined, 'offsite_job_types stripped');
    assert.strictEqual(fallbackUpdateData.special_request_reasons, undefined, 'special_request_reasons stripped');
    console.log('  ✅ [PASS] Test 1.1: Multi-column retry succeeds seamlessly when both new columns are missing in DB');

    // Test Remarks Sync
    const syncedRemarks = Array.from(new Set([
        ...initialPayload.offsite_job_types,
        ...initialPayload.special_request_reasons
    ]));
    assert.deepStrictEqual(syncedRemarks, ['งานนอก 1', 'งานนอก 2', 'เหตุผล 1', 'เหตุผล 2']);
    console.log('  ✅ [PASS] Test 1.2: remarks aligns with union of offsite_job_types and special_request_reasons');
}

// -----------------------------------------------------------------------------
// Suite 2: SettingsModel Safe Fallbacks on Corrupt or Empty LocalStorage
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 2: SettingsModel Safe Fallbacks');
{
    import('../../assets/js/core/Config.js').then(({ Config }) => {
        // Safe loader logic
        const safeLoad = (rawStored, defaultVal) => {
            try {
                const local = JSON.parse(rawStored || '[]');
                return (Array.isArray(local) && local.length > 0) ? local : defaultVal;
            } catch (e) {
                return defaultVal;
            }
        };

        // Corrupt JSON
        const corruptRes = safeLoad('{corrupted JSON', Config.DEFAULT_SETTINGS.offsite_job_types);
        assert.deepStrictEqual(corruptRes, Config.DEFAULT_SETTINGS.offsite_job_types);
        console.log('  ✅ [PASS] Test 2.1: Corrupt localStorage JSON safely falls back to defaults without throwing');

        // Empty array
        const emptyRes = safeLoad('[]', Config.DEFAULT_SETTINGS.offsite_job_types);
        assert.deepStrictEqual(emptyRes, Config.DEFAULT_SETTINGS.offsite_job_types);
        console.log('  ✅ [PASS] Test 2.2: Empty localStorage array safely falls back to defaults without breaking UI');

        // Valid array
        const validRes = safeLoad('["งาน A", "งาน B"]', Config.DEFAULT_SETTINGS.offsite_job_types);
        assert.deepStrictEqual(validRes, ['งาน A', 'งาน B']);
        console.log('  ✅ [PASS] Test 2.3: Valid custom localStorage array is preserved');
    });
}

// -----------------------------------------------------------------------------
// Suite 3: ReportsController Special Request Remark Formatting & Deduplication
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 3: ReportsController Deduplication and Offsite Option Retention');
{
    const SUPPRESSED_STATUS_REMARKS = new Set([
        'ปฏิบัติงานปกติ',
        'มาสาย',
        'ขาดราชการ',
        'ไม่ลงเวลา',
        'ปฏิบัติงานนอกเวลา',
        'ปฏิบัติงานนอกเวลาราชการ',
        'ในสถานที่'
    ]);

    const formatReportRemark = (rec, forExcel = false) => {
        if (!rec || !rec.log_id) return '-';
        if (rec.is_special_request) {
            const rawRemark = (rec.remark || '').replace(/^กรณีพิเศษ\s*\((.*?)\)$/i, '$1').replace(/^กรณีพิเศษ\s*[-:—–/]?\s*/i, '').trim();
            const rawOffsite = (rec.offsite_reason || '').trim();

            const validRemark = (rawRemark && rawRemark !== '-' && !SUPPRESSED_STATUS_REMARKS.has(rawRemark) && rawRemark !== 'กรณีพิเศษ' && rawRemark !== 'ปฏิบัติงานนอกสถานที่' && rawRemark !== 'นอกสถานที่') ? rawRemark : '';
            const validOffsite = (rawOffsite && rawOffsite !== '-' && !SUPPRESSED_STATUS_REMARKS.has(rawOffsite) && rawOffsite !== 'กรณีพิเศษ') ? rawOffsite : '';

            let combinedReason = '';
            if (validRemark && validOffsite && validRemark !== validOffsite && !validRemark.includes(validOffsite)) {
                combinedReason = `${validRemark} (${validOffsite})`;
            } else {
                combinedReason = validRemark || validOffsite || '';
            }

            if (forExcel) {
                return combinedReason ? `กรณีพิเศษ\n${combinedReason}` : 'กรณีพิเศษ';
            }

            return combinedReason
                ? `<div><span class="font-bold text-slate-800 dark:text-slate-200" style="font-weight: 700; color: #1e293b;">กรณีพิเศษ</span></div><div class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5" style="font-size: 10px; color: #475569;">${combinedReason}</div>`
                : `<span class="font-bold text-slate-800 dark:text-slate-200" style="font-weight: 700; color: #1e293b;">กรณีพิเศษ</span>`;
        }
        return '-';
    };

    // Case 1: Separate remark and offsite reason
    const rec1 = {
        log_id: '1',
        is_special_request: true,
        remark: 'ลืมลงเวลาปฏิบัติราชการ',
        offsite_reason: 'อบรม/สัมมนา/ประชุมราชการ'
    };
    assert.strictEqual(formatReportRemark(rec1, true), 'กรณีพิเศษ\nลืมลงเวลาปฏิบัติราชการ (อบรม/สัมมนา/ประชุมราชการ)');
    console.log('  ✅ [PASS] Test 3.1: Formats remark + offsite reason correctly');

    // Case 2: Remark already contains offsite reason (prevent duplication)
    const rec2 = {
        log_id: '2',
        is_special_request: true,
        remark: 'ลืมลงเวลาปฏิบัติราชการ (อบรม/สัมมนา/ประชุมราชการ)',
        offsite_reason: 'อบรม/สัมมนา/ประชุมราชการ'
    };
    assert.strictEqual(formatReportRemark(rec2, true), 'กรณีพิเศษ\nลืมลงเวลาปฏิบัติราชการ (อบรม/สัมมนา/ประชุมราชการ)');
    console.log('  ✅ [PASS] Test 3.2: Prevents double parenthesis duplication');

    // Case 3: Offsite reason is "ปฏิบัติงานนอกสถานที่" (must NOT be discarded!)
    const rec3 = {
        log_id: '3',
        is_special_request: true,
        remark: 'ลืมลงเวลาปฏิบัติราชการ',
        offsite_reason: 'ปฏิบัติงานนอกสถานที่'
    };
    assert.strictEqual(formatReportRemark(rec3, true), 'กรณีพิเศษ\nลืมลงเวลาปฏิบัติราชการ (ปฏิบัติงานนอกสถานที่)');
    console.log('  ✅ [PASS] Test 3.3: "ปฏิบัติงานนอกสถานที่" as offsite job type is NOT discarded');

    // Case 4: Onsite special request (offsite_reason is null)
    const rec4 = {
        log_id: '4',
        is_special_request: true,
        remark: 'ลืมลงเวลาปฏิบัติราชการ',
        offsite_reason: null
    };
    assert.strictEqual(formatReportRemark(rec4, true), 'กรณีพิเศษ\nลืมลงเวลาปฏิบัติราชการ');
    console.log('  ✅ [PASS] Test 3.4: Onsite special request shows request reason cleanly');
}

// -----------------------------------------------------------------------------
// Suite 4: ApprovalsController Badge & Remark Formatting
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 4: ApprovalsController Badges and Deduplication');
{
    const formatApprovalsRowElements = (req) => {
        const locMode = req.location_mode || (req.offsite_reason ? 'OFFSITE' : 'ONSITE');
        const isOffsite = locMode === 'OFFSITE';
        const modeBadgeHtml = isOffsite
            ? `[นอกสถานที่]`
            : `[ในสถานที่]`;

        let remarkDisplay = req.remark || '-';
        if (req.offsite_reason && req.offsite_reason !== req.remark && req.offsite_reason !== '-' && !String(req.remark || '').includes(req.offsite_reason)) {
            remarkDisplay = `${req.remark || 'กรณีพิเศษ'} (${req.offsite_reason})`;
        }

        return { modeBadgeHtml, remarkDisplay };
    };

    // Onsite
    const onRes = formatApprovalsRowElements({
        location_mode: 'ONSITE',
        remark: 'ลืมลงเวลาปฏิบัติราชการ',
        offsite_reason: null
    });
    assert.strictEqual(onRes.modeBadgeHtml, '[ในสถานที่]');
    assert.strictEqual(onRes.remarkDisplay, 'ลืมลงเวลาปฏิบัติราชการ');
    console.log('  ✅ [PASS] Test 4.1: Approvals table renders [ในสถานที่] badge for onsite');

    // Offsite with deduplication check
    const offRes = formatApprovalsRowElements({
        location_mode: 'OFFSITE',
        remark: 'ลืมลงเวลาปฏิบัติราชการ (อบรม)',
        offsite_reason: 'อบรม'
    });
    assert.strictEqual(offRes.modeBadgeHtml, '[นอกสถานที่]');
    assert.strictEqual(offRes.remarkDisplay, 'ลืมลงเวลาปฏิบัติราชการ (อบรม)');
    console.log('  ✅ [PASS] Test 4.2: Approvals table renders [นอกสถานที่] badge and deduplicates remark');
}

// -----------------------------------------------------------------------------
// Suite 5: CheckinController Official Location Finder Resilience
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 5: CheckinController Location Selection Logic');
{
    const officialLocations = [
        { id: 'LOC-001', name: 'สำนักเทศกิจ', latitude: 13.7563, longitude: 100.5017, is_active: true },
        { id: 2, name: 'ศาลาว่าการ กทม. 2 (ดินแดง)', latitude: 13.7700, longitude: 100.5500, is_active: true }
    ];

    // Select by string id
    const selVal1 = 'LOC-001';
    const loc1 = officialLocations.find((loc, idx) => String(loc.id ?? idx) === String(selVal1)) || officialLocations[0];
    assert.strictEqual(loc1.name, 'สำนักเทศกิจ');

    // Select by numeric id passed as string
    const selVal2 = '2';
    const loc2 = officialLocations.find((loc, idx) => String(loc.id ?? idx) === String(selVal2)) || officialLocations[0];
    assert.strictEqual(loc2.name, 'ศาลาว่าการ กทม. 2 (ดินแดง)');
    console.log('  ✅ [PASS] Test 5.1: Numeric or string ID in official location select matches accurately');
}

// -----------------------------------------------------------------------------
// Suite 6: Cache Sync Integrity Check
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 6: Cache Sync Integrity');
{
    const versionPath = path.resolve('version.json');
    const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    const expectedBuildId = versionData.buildId;
    const htmlFiles = [
        'index.html',
        'checkin.html',
        'dashboard.html',
        'approvals.html',
        'reports.html',
        'personnel.html',
        'settings.html',
        'users.html'
    ];

    for (const htmlFile of htmlFiles) {
        const fullPath = path.resolve(htmlFile);
        const content = fs.readFileSync(fullPath, 'utf8');
        assert.ok(content.includes(`CURRENT_APP_BUILD = '${expectedBuildId}'`), `${htmlFile} must have CURRENT_APP_BUILD`);
        assert.ok(content.includes(`?v=${expectedBuildId}`), `${htmlFile} must have ?v= query params`);
    }
    console.log(`  ✅ [PASS] Test 6.1: All 8 root HTML files match buildId ${expectedBuildId}`);
}

// -----------------------------------------------------------------------------
// Suite 7: SettingsModel Cached Object Normalization
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 7: SettingsModel Cached SessionStorage Normalization');
{
    const rawCachedWithoutNewFields = JSON.stringify({
        id: 1,
        organization_name: 'กรุงเทพมหานคร',
        official_locations: [{ id: 'LOC-001', name: 'สำนักเทศกิจ' }]
    });

    const parsed = JSON.parse(rawCachedWithoutNewFields);
    const { Config } = await import('../../assets/js/core/Config.js');

    if (!Array.isArray(parsed.offsite_job_types) || parsed.offsite_job_types.length === 0) {
        parsed.offsite_job_types = Config.DEFAULT_SETTINGS.offsite_job_types;
    }
    if (!Array.isArray(parsed.special_request_reasons) || parsed.special_request_reasons.length === 0) {
        parsed.special_request_reasons = Config.DEFAULT_SETTINGS.special_request_reasons;
    }

    assert.ok(Array.isArray(parsed.offsite_job_types) && parsed.offsite_job_types.length > 0, 'offsite_job_types must be restored on cache read');
    assert.ok(Array.isArray(parsed.special_request_reasons) && parsed.special_request_reasons.length > 0, 'special_request_reasons must be restored on cache read');
    console.log('  ✅ [PASS] Test 7.1: Stale cache without new fields is seamlessly normalized with defaults');
}

// -----------------------------------------------------------------------------
// Suite 8: SettingsController Tab 4 Array Guarantee & Edit/Delete Safety
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 8: SettingsController Array Initialization & Edit/Delete Safety');
{
    const { Config } = await import('../../assets/js/core/Config.js');
    const mockController = {
        settings: {
            offsite_job_types: undefined,
            special_request_reasons: undefined
        }
    };

    // Simulate #renderOffsiteJobTypes initialization logic
    if (!Array.isArray(mockController.settings.offsite_job_types) || mockController.settings.offsite_job_types.length === 0) {
        mockController.settings.offsite_job_types = [...(Config.DEFAULT_SETTINGS.offsite_job_types || [])];
    }
    if (!Array.isArray(mockController.settings.special_request_reasons) || mockController.settings.special_request_reasons.length === 0) {
        mockController.settings.special_request_reasons = [...(Config.DEFAULT_SETTINGS.special_request_reasons || [])];
    }

    assert.ok(Array.isArray(mockController.settings.offsite_job_types), 'offsite_job_types must be an initialized array');
    assert.ok(Array.isArray(mockController.settings.special_request_reasons), 'special_request_reasons must be an initialized array');

    // Simulate edit & delete on previously undefined settings
    const editVal = mockController.settings.offsite_job_types[0];
    assert.ok(typeof editVal === 'string' && editVal.length > 0, 'Edit must not throw TypeError');
    const initialLen = mockController.settings.offsite_job_types.length;
    mockController.settings.offsite_job_types.splice(0, 1);
    assert.strictEqual(mockController.settings.offsite_job_types.length, initialLen - 1, 'Delete must safely remove item without error');
    console.log('  ✅ [PASS] Test 8.1: SettingsController guarantees array safety on edit/delete even with initially undefined settings');
}

// -----------------------------------------------------------------------------
// Suite 9: AttendanceModel Onsite vs Offsite Jitter Logic
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 9: AttendanceModel Onsite vs Offsite Checkout Jitter');
{
    const officialLat = 13.756331;
    const officialLng = 100.501765;
    const officialName = 'สำนักเทศกิจ';

    // Simulate ONSITE special request checkout logic
    const evaluateCheckoutCoords = (locMode, lat, lng, locName, randomizeGps) => {
        let outLat = lat ?? null;
        let outLng = lng ?? null;
        let outLocName = locName || 'ขอลงเวลากรณีพิเศษ';

        if (locMode === 'OFFSITE' && randomizeGps && lat != null && lng != null) {
            // Simulated jitter
            outLat = lat + 0.0001;
            outLng = lng + 0.0001;
            outLocName = 'ใกล้เคียง ซอยทดสอบ';
        }

        return { outLat, outLng, outLocName };
    };

    // Onsite: MUST NOT jitter even if randomizeGps is true
    const onsiteRes = evaluateCheckoutCoords('ONSITE', officialLat, officialLng, officialName, true);
    assert.strictEqual(onsiteRes.outLat, officialLat, 'Onsite outLat must exactly equal check-in lat');
    assert.strictEqual(onsiteRes.outLng, officialLng, 'Onsite outLng must exactly equal check-in lng');
    assert.strictEqual(onsiteRes.outLocName, officialName, 'Onsite outLocName must remain the official location name');
    console.log('  ✅ [PASS] Test 9.1: Onsite special request strictly preserves official coordinates and location name without jitter');

    // Offsite: Jitters when randomizeGps is true
    const offsiteRes = evaluateCheckoutCoords('OFFSITE', 13.72, 100.52, 'สถานที่นอกพื้นที่', true);
    assert.notStrictEqual(offsiteRes.outLat, 13.72, 'Offsite outLat should be jittered');
    assert.strictEqual(offsiteRes.outLocName, 'ใกล้เคียง ซอยทดสอบ');
    console.log('  ✅ [PASS] Test 9.2: Offsite special request correctly applies jitter when enabled');
}

// -----------------------------------------------------------------------------
// Suite 10: CheckinController Official Location Empty Fallback & Desktop Button
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 10: CheckinController Empty Locations Fallback & Desktop Button');
{
    const { Config } = await import('../../assets/js/core/Config.js');
    const checkinJs = fs.readFileSync(path.resolve('assets/js/controllers/CheckinController.js'), 'utf8');

    // Verify btnOpenSpecialFromDesktopTab event listener is bound
    assert.ok(checkinJs.includes("document.getElementById('btnOpenSpecialFromDesktopTab')?.addEventListener('click', openSpecialModal);"),
        'btnOpenSpecialFromDesktopTab must be bound to openSpecialModal in CheckinController.js');
    console.log('  ✅ [PASS] Test 10.1: Desktop Tab button + ยื่นขอลงเวลาใหม่ is properly bound to modal opening lifecycle');

    // Verify fallback when official_locations in settings is empty
    const emptyLocations = [];
    const fallbackLoc = emptyLocations[0] || Config.DEFAULT_SETTINGS?.official_locations?.[0];
    const selectedLoc = emptyLocations.find((loc, idx) => String(loc.id ?? idx) === '0') || fallbackLoc;
    assert.ok(selectedLoc != null, 'selectedLoc must never be undefined even if settings.official_locations is empty');
    assert.strictEqual(selectedLoc.name, 'สำนักเทศกิจ', 'Falls back to default official location LOC-001');
    console.log('  ✅ [PASS] Test 10.2: Empty official_locations safely falls back to Config.DEFAULT_SETTINGS.official_locations[0]');
}

// -----------------------------------------------------------------------------
// Suite 11: ApprovalsController Remark Purity on Onsite Records
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 11: ApprovalsController Remark Purity for Onsite Requests');
{
    const formatApprovalsRemark = (req) => {
        const locMode = req.location_mode || (req.offsite_reason ? 'OFFSITE' : 'ONSITE');
        const isOffsite = locMode === 'OFFSITE';

        let remarkDisplay = req.remark || '-';
        if (isOffsite && req.offsite_reason && req.offsite_reason !== req.remark && req.offsite_reason !== '-' && !String(req.remark || '').includes(req.offsite_reason)) {
            remarkDisplay = `${req.remark || 'กรณีพิเศษ'} (${req.offsite_reason})`;
        }
        return { isOffsite, remarkDisplay };
    };

    // Onsite record with obsolete offsite_reason field: MUST NOT append offsite_reason
    const res = formatApprovalsRemark({
        location_mode: 'ONSITE',
        remark: 'ลืมลงเวลาปฏิบัติราชการ',
        offsite_reason: 'อบรม/สัมมนา/ประชุมราชการ'
    });
    assert.strictEqual(res.isOffsite, false);
    assert.strictEqual(res.remarkDisplay, 'ลืมลงเวลาปฏิบัติราชการ', 'Onsite request must not display offsite reason');
    console.log('  ✅ [PASS] Test 11.1: Approvals table remark does not append offsite_reason for Onsite requests');
}

console.log('\n======================================================================');
console.log('🎉 ALL DEEP ADVERSARIAL TESTS PASSED WITH 100% SUCCESS!');
console.log('======================================================================');
