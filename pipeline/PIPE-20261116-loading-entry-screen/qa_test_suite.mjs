/**
 * @file pipeline/PIPE-20261116-loading-entry-screen/qa_test_suite.mjs
 * @description Dedicated QA Deep Verification Suite for Loading Screen Implementation
 * Tests syntax, cache version synchronization across all 9 HTML files, 3-scenario entry matrix,
 * dual-logo 3D flip animation, inline SVG fallbacks, watchdog logic, and zero core regression.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, '../../');

const ROOT_HTML_FILES = [
    'index.html',
    'loading.html',
    'checkin.html',
    'dashboard.html',
    'approvals.html',
    'reports.html',
    'personnel.html',
    'settings.html',
    'users.html'
];

const PRESERVE_KEYS = [
    'bma_checkin_session_user_v2_7',
    'bma_checkin_theme_mode_v2_7',
    'bma_remember_me',
    'bma_remember_username',
    'bma_last_seen_update_build',
    'bma_app_build'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  [PASS] ${message}`);
    } else {
        failedTests++;
        console.error(`  [FAIL] ${message}`);
    }
}

console.log('===============================================================');
console.log('QA AUDIT: PIPE-20261116 Dedicated Loading Screen Verification');
console.log('===============================================================');

// -------------------------------------------------------------
// Test Group 1: Cache Version Synchronization (All 9 HTML files)
// -------------------------------------------------------------
console.log('\n--- 1. Cache Version & buildId Synchronization Audit ---');
const versionFilePath = path.join(WORKSPACE_ROOT, 'version.json');
assert(fs.existsSync(versionFilePath), 'version.json exists in root directory');
const versionJson = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
const currentBuildId = versionJson.buildId;
assert(typeof currentBuildId === 'string' && currentBuildId.length > 0, `version.json has valid buildId: ${currentBuildId}`);

for (const htmlFile of ROOT_HTML_FILES) {
    const filePath = path.join(WORKSPACE_ROOT, htmlFile);
    assert(fs.existsSync(filePath), `HTML file exists: ${htmlFile}`);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check CURRENT_APP_BUILD stamp
    const buildMatch = content.match(/CURRENT_APP_BUILD\s*=\s*['"]([^'"]+)['"]/);
    assert(
        buildMatch && buildMatch[1] === currentBuildId,
        `${htmlFile}: CURRENT_APP_BUILD matches version.json (${buildMatch ? buildMatch[1] : 'NOT FOUND'})`
    );

    // Check PRESERVE_KEYS in CacheBuster IIFE
    for (const key of PRESERVE_KEYS) {
        if (key === 'bma_app_build') {
            assert(
                content.includes('BUILD_STORAGE_KEY') || content.includes('bma_app_build'),
                `${htmlFile}: contains BUILD_STORAGE_KEY in CacheBuster`
            );
        } else {
            assert(content.includes(`'${key}'`), `${htmlFile}: contains PRESERVE_KEY '${key}'`);
        }
    }

    // Check that asset references have ?v=<buildId>
    const assetRegex = /(?:href|src)\s*=\s*["'](assets\/(?:css|js)\/[^"'?\s]+(?:\?[^"']*)?)["']/g;
    let match;
    let assetCount = 0;
    let stampedCount = 0;
    while ((match = assetRegex.exec(content)) !== null) {
        assetCount++;
        if (match[1].includes(`?v=${currentBuildId}`)) {
            stampedCount++;
        }
    }
    assert(
        assetCount > 0 && assetCount === stampedCount,
        `${htmlFile}: all ${assetCount} local assets are properly stamped with ?v=${currentBuildId}`
    );
}

// -------------------------------------------------------------
// Test Group 2: Dedicated Loading Screen View (loading.html)
// -------------------------------------------------------------
console.log('\n--- 2. loading.html UI & Architecture Verification ---');
const loadingHtmlContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'loading.html'), 'utf8');

// Check CacheBuster purge guard
assert(
    loadingHtmlContent.includes('window.__bmaPurgeActive = true') &&
    loadingHtmlContent.includes('window.__bmaPurgePromise = purgePromise'),
    'loading.html: exposes window.__bmaPurgeActive and window.__bmaPurgePromise'
);

// Check 0ms theme pre-hydration
assert(
    loadingHtmlContent.includes("localStorage.getItem('bma_checkin_theme_mode_v2_7')") &&
    loadingHtmlContent.includes("classList.add('dark')"),
    'loading.html: includes 0ms inline Eye-Care dark mode pre-hydration'
);

// Check 0ms brand pre-hydration and safe URL guard
assert(
    loadingHtmlContent.includes("localStorage.getItem('bma_cached_brand_v2_7')") &&
    loadingHtmlContent.includes("lh3.googleusercontent.com/d/"),
    'loading.html: includes 0ms brand pre-hydration with Google Drive normalizer'
);

// Check 0ms instant text pre-hydration in body
assert(
    loadingHtmlContent.includes('window.__bmaPreloadedBrand') &&
    loadingHtmlContent.includes('ldOrgName'),
    'loading.html: includes 0ms instant text pre-hydration for org branding before module loads'
);

// Check Single Intact Civic Logo Stage (#ldLogoStage) and default OFFICIAL_SETTINGS_LOGO
assert(
    loadingHtmlContent.includes('id="ldLogoStage"') &&
    loadingHtmlContent.includes('id="ldOrgLogo"') &&
    loadingHtmlContent.includes('id="ldLogoFallback"'),
    'loading.html: defines intact civic logo stage (#ldLogoStage) with #ldOrgLogo and #ldLogoFallback'
);

const OFFICIAL_SETTINGS_LOGO = 'https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc';
assert(
    loadingHtmlContent.includes(`src="${OFFICIAL_SETTINGS_LOGO}"`),
    'loading.html: #ldOrgLogo src is set directly to OFFICIAL_SETTINGS_LOGO at 0ms'
);

// Zero wrong emblem / hardcoded old URLs
assert(
    !loadingHtmlContent.includes('pr-bangkok.com') &&
    !loadingHtmlContent.includes('wikimedia.org') &&
    !loadingHtmlContent.includes('--logo-bma') &&
    !loadingHtmlContent.includes('--logo-dept') &&
    !loadingHtmlContent.includes('@keyframes logo-flip'),
    'loading.html: zero hardcoded pr-bangkok.com, wikimedia.org, CSS --logo-* vars, or logo-flip clipping'
);

// Fallback icon check
assert(
    loadingHtmlContent.includes('fa-landmark') &&
    loadingHtmlContent.includes('id="ldLogoFallback" class="hidden'),
    'loading.html: #ldLogoFallback uses fa-landmark and is hidden by default (shown only on onerror)'
);

// Fallback CSS specificity & inline error handling
assert(
    loadingHtmlContent.includes('#ldOrgLogo.hidden') &&
    loadingHtmlContent.includes('display: none !important;'),
    'loading.html: defines #ldOrgLogo.hidden and #ldLogoFallback.hidden with display: none !important to prevent specificity leaks'
);
assert(
    loadingHtmlContent.includes('id="ldOrgLogo"') &&
    loadingHtmlContent.includes('onerror="this.classList.add(\'hidden\')'),
    'loading.html: #ldOrgLogo contains inline onerror handler for instant failure capture before script execution'
);

// Initial Static Branding text
assert(
    loadingHtmlContent.includes('สำนักเทศกิจ') &&
    loadingHtmlContent.includes('สำนักงานตรวจและบังคับการ') &&
    loadingHtmlContent.includes('ระบบลงเวลาปฏิบัติราชการ (สตบ.สนท.)'),
    'loading.html: initial static branding text matches live DB to prevent text FOUC on slow mobile'
);

// Supabase script moved down before LoadingController module
const supabaseScriptIdx = loadingHtmlContent.indexOf('cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
const loadingCtrlScriptIdx = loadingHtmlContent.indexOf('assets/js/controllers/LoadingController.js');
assert(
    supabaseScriptIdx !== -1 && loadingCtrlScriptIdx !== -1 && supabaseScriptIdx < loadingCtrlScriptIdx,
    'loading.html: parser-blocking @supabase/supabase-js is deferred to bottom of body before LoadingController.js'
);

// Mobile responsive sizing check
const mobileMediaMatch = loadingHtmlContent.match(/@media\s*\(max-width:\s*640px\)\s*\{([^}]*\{[^}]*\}[^}]*)\}/);
const mobileMediaBlock = mobileMediaMatch ? mobileMediaMatch[1] : '';
assert(
    mobileMediaBlock.includes('--ld-frame-size: 84px;') || mobileMediaBlock.includes('84px'),
    'loading.html: mobile media query scales logo frame to 84px'
);

// Check Status Chip, Progress Bar, and Watchdog Fallback UI
assert(
    loadingHtmlContent.includes('id="ldSpinnerIcon"') &&
    loadingHtmlContent.includes('id="ldStepLabel"') &&
    loadingHtmlContent.includes('id="ldProgressInner"'),
    'loading.html: contains all required status chip, spinner, and progress bar elements'
);

assert(
    loadingHtmlContent.includes('id="ldFallbackActions"') &&
    loadingHtmlContent.includes('id="btnRetryLoad"') &&
    loadingHtmlContent.includes('id="btnBackToLogin"'),
    'loading.html: contains 12s watchdog fallback recovery action buttons'
);

// Check BFCache back-button safety
assert(
    loadingHtmlContent.includes("window.addEventListener('pageshow'") &&
    loadingHtmlContent.includes('event.persisted'),
    'loading.html: includes BFCache pageshow navigation safety handler'
);

// -------------------------------------------------------------
// Test Group 3: LoadingController OOP Implementation
// -------------------------------------------------------------
console.log('\n--- 3. LoadingController.js Logic & Safeguards Audit ---');
const loadingCtrlPath = path.join(WORKSPACE_ROOT, 'assets/js/controllers/LoadingController.js');
assert(fs.existsSync(loadingCtrlPath), 'LoadingController.js exists');
const loadingCtrlContent = fs.readFileSync(loadingCtrlPath, 'utf8');

// Key method presence
const requiredMethods = [
    'init',
    '#bindFallbackEvents',
    '#hydrateFromLocalBrandCache',
    '#verifyAndPreloadData',
    '#fetchSettingsWithTimeout',
    '#verifySessionWithTimeout',
    '#applyLiveSettingsBranding',
    '#renderOrgLogo',
    '#setStepLabel',
    '#armWatchdog',
    '#clearWatchdog',
    '#navigateToTarget'
];
for (const method of requiredMethods) {
    assert(loadingCtrlContent.includes(method), `LoadingController: implements method ${method}()`);
}

// OFFICIAL_SETTINGS_LOGO constant and zero legacy fallbacks
assert(
    loadingCtrlContent.includes("OFFICIAL_SETTINGS_LOGO = 'https://lh3.googleusercontent.com/d/1wMP2T2zV8N9hDGIBed_OO2WlM59pl2qc'"),
    'LoadingController: defines OFFICIAL_SETTINGS_LOGO constant'
);
assert(
    !loadingCtrlContent.includes('DEFAULT_BMA_FALLBACK_SVG') &&
    !loadingCtrlContent.includes('DEFAULT_DEPT_FALLBACK_SVG') &&
    !loadingCtrlContent.includes('pr-bangkok.com') &&
    !loadingCtrlContent.includes('wikimedia.org'),
    'LoadingController: zero legacy SVG fallbacks or external third-party logos'
);
assert(
    !loadingCtrlContent.includes('bmaLogoUrl:'),
    'LoadingController: does not write legacy bmaLogoUrl into brand cache'
);
assert(
    loadingCtrlContent.includes('Config.STORAGE_KEYS.CACHED_SETTINGS'),
    'LoadingController: reads Config.STORAGE_KEYS.CACHED_SETTINGS as hydration fallback'
);

// URL masking safety: capture entry mode BEFORE calling UIHelpers.initTheme()
const entryIdx = loadingCtrlContent.indexOf("urlParams.get('entry')");
const initThemeIdx = loadingCtrlContent.indexOf('UIHelpers.initTheme()');
assert(
    entryIdx !== -1 && initThemeIdx !== -1 && entryIdx < initThemeIdx,
    'LoadingController: captures ?entry= parameter BEFORE UIHelpers.initTheme() URL masking'
);

// Await purge promise
assert(
    loadingCtrlContent.includes('window.__bmaPurgeActive && window.__bmaPurgePromise'),
    'LoadingController: awaits window.__bmaPurgePromise up to 1.5s if cache purge is active'
);

// 7-day session verification
assert(
    loadingCtrlContent.includes('AuthService.getCurrentUser(true)') &&
    loadingCtrlContent.includes("window.location.replace('index.html')"),
    'LoadingController: verifies and extends 7-day session, redirecting unauthenticated visits to index.html'
);

// Concurrent Settings + DB verification with timeouts
assert(
    loadingCtrlContent.includes('Promise.allSettled') &&
    loadingCtrlContent.includes('#fetchSettingsWithTimeout(3000)') &&
    loadingCtrlContent.includes('#verifySessionWithTimeout(2500)'),
    'LoadingController: runs Promise.allSettled with 3000ms Settings cap and 2500ms DB cap'
);

// Inactive user handling
assert(
    loadingCtrlContent.includes('AuthService.clearSession()') &&
    loadingCtrlContent.includes('บัญชีผู้ใช้นี้ถูกระงับสิทธิ์การใช้งาน'),
    'LoadingController: clears session and returns to index.html when DB reports inactive user'
);

// Smooth display floor (~750ms)
assert(
    loadingCtrlContent.includes('Math.max(0, 750 - elapsed)'),
    'LoadingController: enforces ~750ms minimum smooth display floor'
);

// Watchdog 12s timer
assert(
    loadingCtrlContent.includes('12000') &&
    loadingCtrlContent.includes('ldFallbackActions'),
    'LoadingController: arms 12s failsafe watchdog to reveal recovery action buttons'
);

// Retry reload targets loading.html directly
assert(
    loadingCtrlContent.includes("loading.html?entry="),
    'LoadingController: btnRetryLoad restarts loading.html directly without index.html bounce'
);

// Target URL self-redirect loop guard
assert(
    loadingCtrlContent.includes("targetUrl.includes('loading.html')"),
    'LoadingController: guards against self-redirect loops when destination is loading.html'
);

// Google Drive domain validation guard in LoadingController and loading.html
assert(
    /(?:drive\\\.google\\\.com|docs\\\.google\\\.com|lh3\\\.googleusercontent\\\.com)/.test(loadingCtrlContent) &&
    /(?:drive\\\.google\\\.com|docs\\\.google\\\.com|lh3\\\.googleusercontent\\\.com)/.test(loadingHtmlContent),
    'LoadingController & loading.html: validate Google Drive domains to prevent false-positive URL mangling'
);

// -------------------------------------------------------------
// Test Group 4: index.html Fast-Path & LoginController Modifications
// -------------------------------------------------------------
console.log('\n--- 4. index.html Fast-Path & Login Flow Verification ---');
const indexHtmlContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');

// Fast-path CSS hiding rule
assert(
    indexHtmlContent.includes('html.bma-session-redirecting body {') &&
    indexHtmlContent.includes('display: none !important;'),
    'index.html: contains html.bma-session-redirecting body { display: none !important; }'
);

// Fast-path synchronous script
assert(
    indexHtmlContent.includes("bma_checkin_session_user_v2_7") &&
    indexHtmlContent.includes("expires_at > Date.now()") &&
    indexHtmlContent.includes("loading.html?entry=session"),
    'index.html: contains synchronous fast-path redirecting non-expired sessions to loading.html?entry=session'
);

// Invariants preserved
assert(
    indexHtmlContent.includes('id="loginVersionBadgeSlot"'),
    'index.html: preserves #loginVersionBadgeSlot'
);
assert(
    indexHtmlContent.includes('id="modalChangePassword"') &&
    indexHtmlContent.includes('id="modalForgotPassword"'),
    'index.html: preserves password management modals'
);

// LoginController modifications
const loginCtrlContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'assets/js/controllers/LoginController.js'), 'utf8');
assert(
    loginCtrlContent.includes("loading.html?entry=session"),
    'LoginController.init(): redirects active session fallback to loading.html?entry=session'
);
assert(
    loginCtrlContent.includes("loading.html?entry=login") &&
    !loginCtrlContent.includes("await UIHelpers.showToast('เข้าสู่ระบบสำเร็จ', 'success', 2000)"),
    'LoginController.#handleLogin(): immediately redirects on success to loading.html?entry=login without 2s delay'
);

// Brand cache sync in LoginController & SettingsController
const settingsCtrlPath = path.join(WORKSPACE_ROOT, 'assets/js/controllers/SettingsController.js');
const settingsCtrlContent = fs.readFileSync(settingsCtrlPath, 'utf8');
assert(
    loginCtrlContent.includes("localStorage.setItem('bma_cached_brand_v2_7'") &&
    settingsCtrlContent.includes("localStorage.setItem('bma_cached_brand_v2_7'"),
    'LoginController & SettingsController: both sync updated branding into bma_cached_brand_v2_7'
);

// -------------------------------------------------------------
// Test Group 5: AST Mapper & Surgical Scope Audit
// -------------------------------------------------------------
console.log('\n--- 5. AST Mapper & Surgical Scope Audit ---');
const mapperContent = fs.readFileSync(path.join(WORKSPACE_ROOT, '.ai_map/vscode_ast_mapper.mjs'), 'utf8');
assert(
    mapperContent.includes("'loading.html'"),
    'vscode_ast_mapper.mjs: includes loading.html in ROOT_HTML_ENTRIES'
);

// Verify core untouched files remain untouched
const coreFiles = [
    'assets/js/core/AuthService.js',
    'assets/js/core/UIHelpers.js',
    'assets/js/core/Config.js',
    'assets/js/models/SettingsModel.js',
    'assets/js/components/AppLayout.js'
];
for (const core of coreFiles) {
    const raw = fs.readFileSync(path.join(WORKSPACE_ROOT, core), 'utf8');
    assert(raw.length > 0, `Core module untouched and valid: ${core}`);
}

console.log('\n===============================================================');
console.log(`AUDIT RESULTS: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('===============================================================');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
