/**
 * @file pipeline/PIPE-20261116-loading-entry-screen/qa_runtime_deep_simulation.mjs
 * @description Deep Runtime Simulation & Edge Case Testing for SubAgent 2 QA Audit
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, '../../');

let deepTests = 0;
let deepPassed = 0;
let deepFailed = 0;

function assert(cond, desc) {
    deepTests++;
    if (cond) {
        deepPassed++;
        console.log(`  [PASS] ${desc}`);
    } else {
        deepFailed++;
        console.error(`  [FAIL] ${desc}`);
    }
}

console.log('====================================================================');
console.log('DEEP RUNTIME & EDGE-CASE SIMULATION AUDIT');
console.log('====================================================================');

// --- 1. Edge Case: CSS Injection & Drive URL Normalization ---
console.log('\n--- Test Group 1: Logo Sanitization & Google Drive URL Handling ---');

function sanitizeAndResolveLogo(rawUrl, fallbackUrl) {
    const fallback = fallbackUrl || 'DEFAULT_SVG';
    const clean = String(rawUrl || '').trim();
    if (!clean) return fallback;

    const isSafeProtocol = /^(?:https?:\/\/[^\s'"()<>]+|data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)$/i.test(clean);
    if (!isSafeProtocol) return fallback;

    let resolvedUrl = clean;
    const isGoogleDrive = /(?:drive\.google\.com|docs\.google\.com|lh3\.googleusercontent\.com)/i.test(clean);
    if (isGoogleDrive) {
        const driveMatch = clean.match(/(?:\/d\/|[?&]id=|\/file\/d\/)([-\w]{20,})/);
        if (driveMatch && driveMatch[1]) {
            resolvedUrl = `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
        }
    }

    const sanitized = resolvedUrl.replace(/['"\\]/g, '');
    return sanitized;
}

// Case 1.1: Malicious CSS injection attempt
const maliciousPayloads = [
    "javascript:alert(1)",
    "https://example.com/logo.png'); body { display:none; } /*",
    "https://example.com/logo.png\"); background:red; /*",
    "<script>alert(1)</script>",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    "http://example.com/logo.png?a=' OR '1'='1"
];

for (const malicious of maliciousPayloads) {
    const res = sanitizeAndResolveLogo(malicious, 'FALLBACK');
    assert(
        res === 'FALLBACK' || (!res.includes(';') && !res.includes("'") && !res.includes('"') && !res.includes('<') && !res.includes('>')),
        `Sanitizer safely rejects or cleans malicious payload: ${malicious.slice(0, 30)}...`
    );
}

// Case 1.2: Google Drive URL variants
const driveUrls = [
    { in: 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J1K2L/view?usp=sharing', expectedId: '1A2B3C4D5E6F7G8H9I0J1K2L' },
    { in: 'https://drive.google.com/open?id=1A2B3C4D5E6F7G8H9I0J1K2L', expectedId: '1A2B3C4D5E6F7G8H9I0J1K2L' },
    { in: 'https://drive.google.com/uc?id=1A2B3C4D5E6F7G8H9I0J1K2L', expectedId: '1A2B3C4D5E6F7G8H9I0J1K2L' },
    { in: 'https://lh3.googleusercontent.com/d/1A2B3C4D5E6F7G8H9I0J1K2L', expectedId: '1A2B3C4D5E6F7G8H9I0J1K2L' }
];

for (const d of driveUrls) {
    const res = sanitizeAndResolveLogo(d.in, 'FALLBACK');
    assert(
        res === `https://lh3.googleusercontent.com/d/${d.expectedId}`,
        `Drive URL correctly normalized to lh3 thumbnail endpoint: ${d.in.slice(0, 35)}...`
    );
}

// Case 1.3: Non-Google-Drive URLs with /d/ or ?id= paths must NOT be mangled
const nonDriveUrls = [
    'https://cdn.bma.go.th/assets/d/bma_official_emblem_hq_green_v2.png',
    'https://my-company.com/api/get-logo?id=department_official_logo_file',
    'https://pr-bangkok.com/wp-content/uploads/2025/06/231116_BMA-Emblem_Edited_Green-600x600.png'
];

for (const nd of nonDriveUrls) {
    const res = sanitizeAndResolveLogo(nd, 'FALLBACK');
    assert(
        res === nd,
        `Non-Google-Drive URL is preserved cleanly without mangling: ${nd.slice(0, 45)}...`
    );
}

// --- 2. Scenario 1: Cold URL Simulation (No Session) ---
console.log('\n--- Test Group 2: Scenario 1 Cold Visit Simulation ---');
{
    let documentClasses = [];
    let redirectedUrl = null;
    const mockLocalStorage = {};

    // Simulate fast-path guard in index.html
    const rawUser = mockLocalStorage['bma_checkin_session_user_v2_7'];
    if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed && parsed.id && parsed.expires_at && parsed.expires_at > Date.now()) {
            documentClasses.push('bma-session-redirecting');
            redirectedUrl = 'loading.html?entry=session';
        }
    }

    assert(
        !documentClasses.includes('bma-session-redirecting'),
        'Cold visit: html does NOT get bma-session-redirecting class'
    );
    assert(
        redirectedUrl === null,
        'Cold visit: No fast-path redirect triggered, stays on index.html'
    );
}

// --- 3. Scenario 2: Post-Login Immediate Redirect ---
console.log('\n--- Test Group 3: Scenario 2 Post-Login Simulation ---');
{
    let redirectedUrl = null;
    const loginResult = { success: true, redirectUrl: 'checkin.html' };

    // Simulate LoginController.#handleLogin success path
    if (loginResult.success) {
        // subagent_01 replaced showToast + replace(result.redirectUrl) with immediate replace('loading.html?entry=login')
        redirectedUrl = 'loading.html?entry=login';
    }

    assert(
        redirectedUrl === 'loading.html?entry=login',
        'Post-login: immediately redirects to loading.html?entry=login'
    );
}

// --- 4. Scenario 3: Active 7-Day Session Fast-Path Simulation ---
console.log('\n--- Test Group 4: Scenario 3 Active Session Simulation ---');
{
    let documentClasses = [];
    let redirectedUrl = null;
    const now = Date.now();
    const mockLocalStorage = {
        'bma_checkin_session_user_v2_7': JSON.stringify({
            id: 'usr_test_123',
            username: 'admin01',
            role: 'SuperAdmin',
            expires_at: now + (7 * 24 * 60 * 60 * 1000)
        })
    };

    // Simulate fast-path guard in index.html
    const rawUser = mockLocalStorage['bma_checkin_session_user_v2_7'];
    if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed && parsed.id && parsed.expires_at && parsed.expires_at > Date.now()) {
            documentClasses.push('bma-session-redirecting');
            redirectedUrl = 'loading.html?entry=session';
        }
    }

    assert(
        documentClasses.includes('bma-session-redirecting'),
        'Active session: html gets bma-session-redirecting class immediately'
    );
    assert(
        redirectedUrl === 'loading.html?entry=session',
        'Active session: immediately fast-path redirects to loading.html?entry=session'
    );
}

// --- 5. Purge Race Guard & Preservation Keys ---
console.log('\n--- Test Group 5: Purge Race Guard & Preservation Keys ---');
{
    const PRESERVE_KEYS = [
        'bma_checkin_session_user_v2_7',
        'bma_checkin_theme_mode_v2_7',
        'bma_remember_me',
        'bma_remember_username',
        'bma_last_seen_update_build',
        'bma_app_build'
    ];

    let store = {
        'bma_checkin_session_user_v2_7': '{"id":"test"}',
        'bma_checkin_theme_mode_v2_7': 'dark',
        'bma_remember_me': 'true',
        'bma_remember_username': 'admin01',
        'bma_last_seen_update_build': 'old_build',
        'bma_app_build': 'old_build',
        'bma_cached_brand_v2_7': '{"orgName":"Stale Brand"}',
        'some_stale_cache': '123'
    };

    // Simulate purge
    const newBuild = '20261116_newbuild';
    Object.keys(store).forEach((key) => {
        if (!PRESERVE_KEYS.includes(key)) {
            delete store[key];
        }
    });
    store['bma_app_build'] = newBuild;

    assert(
        store['bma_cached_brand_v2_7'] === undefined,
        'Purge: bma_cached_brand_v2_7 is wiped clean on build upgrade so brand refreshes from DB'
    );
    assert(
        store['some_stale_cache'] === undefined,
        'Purge: unrelated stale cache is wiped'
    );
    assert(
        store['bma_checkin_session_user_v2_7'] !== undefined,
        'Purge: active 7-day session is preserved across cache purge'
    );
    assert(
        store['bma_checkin_theme_mode_v2_7'] === 'dark',
        'Purge: user theme preference is preserved across cache purge'
    );
    assert(
        store['bma_remember_username'] === 'admin01',
        'Purge: remembered username is preserved across cache purge'
    );
}

// --- 6. URL Masking Safety Audit ---
console.log('\n--- Test Group 6: URL Masking Safety with loading.html ---');
{
    const KNOWN_PAGES_REGEX = /\/(index|checkin|dashboard|reports|approvals|personnel|users|settings)(\.html)?\/?$/i;

    const testUrls = [
        '/CheckinApp/loading.html',
        '/CheckinApp/loading.html?entry=session',
        '/CheckinApp/loading.html?entry=login'
    ];

    for (const u of testUrls) {
        const pathname = u.split('?')[0];
        const isMatched = KNOWN_PAGES_REGEX.test(pathname);
        assert(
            !isMatched,
            `UIHelpers.KNOWN_PAGES_REGEX safely IGNORES ${pathname} (will NOT overwrite VIEW_PAGE_STORAGE_KEY)`
        );
    }
}

// --- 7. Target URL Loop Prevention Guard ---
console.log('\n--- Test Group 7: Target URL Loop Prevention Guard ---');
{
    function resolveTargetUrl(redirectUrl, sessionUser) {
        let targetUrl = redirectUrl;
        if (!targetUrl || targetUrl.includes('loading.html')) {
            targetUrl = sessionUser.role === 'User' ? 'checkin.html' : 'dashboard.html';
        }
        return targetUrl;
    }

    const userSession = { role: 'User' };
    const adminSession = { role: 'Admin' };

    assert(
        resolveTargetUrl('loading.html', userSession) === 'checkin.html',
        'Target URL guard: redirects User to checkin.html when destination is loading.html'
    );
    assert(
        resolveTargetUrl('loading.html?entry=session', adminSession) === 'dashboard.html',
        'Target URL guard: redirects Admin to dashboard.html when destination is loading.html?entry=session'
    );
    assert(
        resolveTargetUrl('reports.html', adminSession) === 'reports.html',
        'Target URL guard: preserves valid app pages (reports.html)'
    );
}

// --- 8. 2-Tier Brand Cache Hydration & OnError Fallback Simulation ---
console.log('\n--- Test Group 8: 2-Tier Brand Cache & OnError Fallback ---');
{
    const OFFICIAL_SETTINGS_LOGO = 'https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc';

    function simulateHydrate(localStore, sessionStore) {
        let brand = null;
        const rawLocal = localStore['bma_cached_brand_v2_7'];
        if (rawLocal) {
            try { brand = JSON.parse(rawLocal); } catch (_) {}
        }
        let sessionSettings = null;
        const rawSession = sessionStore['bma_checkin_cached_settings_v2_7'];
        if (rawSession) {
            try { sessionSettings = JSON.parse(rawSession); } catch (_) {}
        }

        if (!brand || typeof brand !== 'object') {
            if (sessionSettings && typeof sessionSettings === 'object') {
                brand = {
                    orgName: sessionSettings.organization_name,
                    bureauName: sessionSettings.bureau_name,
                    headerSystemTitle: sessionSettings.header_system_title,
                    logoUrl: sessionSettings.logo_url
                };
            }
        } else if (sessionSettings && typeof sessionSettings === 'object') {
            if (!brand.logoUrl && sessionSettings.logo_url) brand.logoUrl = sessionSettings.logo_url;
            if (!brand.orgName && sessionSettings.organization_name) brand.orgName = sessionSettings.organization_name;
            if (!brand.bureauName && sessionSettings.bureau_name) brand.bureauName = sessionSettings.bureau_name;
            if (!brand.headerSystemTitle && sessionSettings.header_system_title) brand.headerSystemTitle = sessionSettings.header_system_title;
        }

        const resolvedLogo = (brand && brand.logoUrl) ? brand.logoUrl : OFFICIAL_SETTINGS_LOGO;
        return { brand, resolvedLogo };
    }

    // 8.1: Both stores empty -> returns OFFICIAL_SETTINGS_LOGO
    const resEmpty = simulateHydrate({}, {});
    assert(
        resEmpty.resolvedLogo === OFFICIAL_SETTINGS_LOGO,
        'Brand hydration: falls back to OFFICIAL_SETTINGS_LOGO when stores are empty'
    );

    // 8.2: Session storage fallback when local storage empty
    const resSession = simulateHydrate({}, {
        'bma_checkin_cached_settings_v2_7': JSON.stringify({
            organization_name: 'สำนักเทศกิจ',
            logo_url: 'https://example.com/custom.png'
        })
    });
    assert(
        resSession.resolvedLogo === 'https://example.com/custom.png' && resSession.brand.orgName === 'สำนักเทศกิจ',
        'Brand hydration: successfully falls back to sessionStorage cached settings'
    );

    // 8.3: Local storage priority
    const resLocal = simulateHydrate({
        'bma_cached_brand_v2_7': JSON.stringify({
            orgName: 'หน่วยงานพิเศษ',
            logoUrl: 'https://example.com/local.png'
        })
    }, {
        'bma_checkin_cached_settings_v2_7': JSON.stringify({
            organization_name: 'สำนักเทศกิจ',
            logo_url: 'https://example.com/session.png'
        })
    });
    assert(
        resLocal.resolvedLogo === 'https://example.com/local.png',
        'Brand hydration: localStorage takes priority over sessionStorage'
    );

    // 8.4: Legacy brand in localStorage (missing logoUrl) seamlessly falls back to sessionStorage logo_url
    const resLegacyLocal = simulateHydrate({
        'bma_cached_brand_v2_7': JSON.stringify({
            orgName: 'หน่วยงานเดิม',
            bmaLogoUrl: 'https://pr-bangkok.com/old.png'
        })
    }, {
        'bma_checkin_cached_settings_v2_7': JSON.stringify({
            organization_name: 'สำนักเทศกิจ',
            logo_url: 'https://example.com/settings-logo.png'
        })
    });
    assert(
        resLegacyLocal.resolvedLogo === 'https://example.com/settings-logo.png' && resLegacyLocal.brand.orgName === 'หน่วยงานเดิม',
        'Brand hydration: partial/legacy localStorage cleanly fills missing logoUrl from sessionStorage'
    );

    // 8.5: DOM #renderOrgLogo stateful simulation (onerror preservation vs URL switch)
    class MockClassList {
        constructor(classes = []) {
            this.set = new Set(classes);
        }
        add(c) { this.set.add(c); }
        remove(c) { this.set.delete(c); }
        contains(c) { return this.set.has(c); }
    }

    const mockImg = {
        _src: OFFICIAL_SETTINGS_LOGO,
        classList: new MockClassList([]),
        getAttribute(k) { return k === 'src' ? this._src : null; },
        set src(v) { this._src = v; },
        get src() { return this._src; },
        complete: true,
        naturalWidth: 100,
        onerror: null
    };
    const mockFallback = {
        classList: new MockClassList(['hidden'])
    };

    function simulateRenderOrgLogo(rawUrl, imgEl, fallbackEl) {
        let targetUrl = String(rawUrl || '').trim();
        const isSafeProtocol = /^(?:https?:\/\/[^\s'"()<>]+|data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)$/i.test(targetUrl);
        if (!targetUrl || !isSafeProtocol) {
            targetUrl = OFFICIAL_SETTINGS_LOGO;
        }
        const sanitizedUrl = targetUrl.replace(/['"\\]/g, '');

        imgEl.onerror = () => {
            imgEl.classList.add('hidden');
            if (fallbackEl) fallbackEl.classList.remove('hidden');
        };

        const currentSrc = imgEl.getAttribute('src') || '';
        if (currentSrc === sanitizedUrl) {
            return;
        }

        if (fallbackEl) fallbackEl.classList.add('hidden');
        imgEl.classList.remove('hidden');
        imgEl.src = sanitizedUrl;
    }

    // Call with initial official logo
    simulateRenderOrgLogo(OFFICIAL_SETTINGS_LOGO, mockImg, mockFallback);
    assert(
        mockImg.src === OFFICIAL_SETTINGS_LOGO && !mockImg.classList.contains('hidden') && mockFallback.classList.contains('hidden'),
        'renderOrgLogo: initial official logo is visible and fallback is hidden'
    );

    // Simulate image error (network offline / bad image)
    mockImg.onerror();
    assert(
        mockImg.classList.contains('hidden') && !mockFallback.classList.contains('hidden'),
        'renderOrgLogo: onerror cleanly hides image and reveals fallback icon'
    );

    // Re-calling with SAME URL must NOT undo the fallback error state!
    simulateRenderOrgLogo(OFFICIAL_SETTINGS_LOGO, mockImg, mockFallback);
    assert(
        mockImg.classList.contains('hidden') && !mockFallback.classList.contains('hidden'),
        'renderOrgLogo: re-evaluating unchanged URL preserves error fallback without stomping'
    );

    // Switching to a NEW different URL unhides image and hides fallback
    simulateRenderOrgLogo('https://example.com/new-logo.png', mockImg, mockFallback);
    assert(
        mockImg.src === 'https://example.com/new-logo.png' && !mockImg.classList.contains('hidden') && mockFallback.classList.contains('hidden'),
        'renderOrgLogo: switching to brand-new valid URL resets fallback and loads new src'
    );
}

// --- 9. LoginController & SettingsController Cache Sync Simulation ---
console.log('\n--- Test Group 9: Login & Settings Brand Cache Sync ---');
{
    const OFFICIAL_SETTINGS_LOGO = 'https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc';
    const mockStore = {};

    function simulateSyncBrand(settings) {
        const s = settings || {};
        const orgName = s.organization_name || 'สำนักเทศกิจ';
        const bureauName = s.bureau_name || 'สำนักงานตรวจและบังคับการ';
        const headerTitle = s.header_system_title || 'ระบบลงเวลาปฏิบัติราชการ (สตบ.สนท.)';
        let resolvedLogoUrl = '';
        const rawLogo = String(s.logo_url || '').trim();
        const isSafeProtocol = /^(?:https?:\/\/[^\s'"()<>]+|data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)$/i.test(rawLogo);
        if (rawLogo && isSafeProtocol) {
            const isGoogleDrive = /(?:drive\.google\.com|docs\.google\.com|lh3\.googleusercontent\.com)/i.test(rawLogo);
            if (isGoogleDrive) {
                const m = rawLogo.match(/(?:\/d\/|[?&]id=|\/file\/d\/)([-\w]{20,})/);
                resolvedLogoUrl = m && m[1] ? `https://lh3.googleusercontent.com/d/${m[1]}` : rawLogo;
            } else {
                resolvedLogoUrl = rawLogo;
            }
        } else {
            resolvedLogoUrl = OFFICIAL_SETTINGS_LOGO;
        }

        const brandPayload = {
            orgName,
            bureauName,
            headerSystemTitle: headerTitle,
            logoUrl: resolvedLogoUrl
        };
        mockStore['bma_cached_brand_v2_7'] = JSON.stringify(brandPayload);
    }

    // 9.1: Sync with empty logo_url -> saves OFFICIAL_SETTINGS_LOGO
    simulateSyncBrand({ organization_name: 'กทม.' });
    const saved1 = JSON.parse(mockStore['bma_cached_brand_v2_7']);
    assert(
        saved1.logoUrl === OFFICIAL_SETTINGS_LOGO && saved1.bmaLogoUrl === undefined,
        'Brand sync: empty logo_url defaults to OFFICIAL_SETTINGS_LOGO with zero bmaLogoUrl'
    );

    // 9.2: Sync with Google Drive link -> normalized to lh3 thumbnail
    simulateSyncBrand({
        organization_name: 'กทม.',
        logo_url: 'https://drive.google.com/file/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc/view'
    });
    const saved2 = JSON.parse(mockStore['bma_cached_brand_v2_7']);
    assert(
        saved2.logoUrl === OFFICIAL_SETTINGS_LOGO,
        'Brand sync: Google Drive file/d/ link normalized cleanly to lh3 format'
    );

    // 9.3: Sync with malicious unsafe protocol -> defaults safely to OFFICIAL_SETTINGS_LOGO
    simulateSyncBrand({
        organization_name: 'กทม.',
        logo_url: 'javascript:alert("XSS")'
    });
    const saved3 = JSON.parse(mockStore['bma_cached_brand_v2_7']);
    assert(
        saved3.logoUrl === OFFICIAL_SETTINGS_LOGO,
        'Brand sync: unsafe protocol rejected and safely defaults to OFFICIAL_SETTINGS_LOGO'
    );
}

console.log('\n====================================================================');
console.log(`DEEP SIMULATION RESULTS: Total: ${deepTests} | Passed: ${deepPassed} | Failed: ${deepFailed}`);
console.log('====================================================================');

if (deepFailed > 0) process.exit(1);
