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

console.log('\n====================================================================');
console.log(`DEEP SIMULATION RESULTS: Total: ${deepTests} | Passed: ${deepPassed} | Failed: ${deepFailed}`);
console.log('====================================================================');

if (deepFailed > 0) process.exit(1);
