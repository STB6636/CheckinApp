/**
 * @file pipeline/PIPE-20261121-fix-cloudflare-loading-path-loop/qa_cloudflare_loading_path_test.mjs
 * @description QA Path Resolution, Loop Prevention & 10-HTML Cache Sync Test Suite
 * Tests REAL UIHelpers module, exact inline scripts from index.html & loading.html,
 * LoadingController/LoginController redirect wrapping, and 10-HTML Cache Version Sync.
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, '../../');

// ---------------------------------------------------------------------------
// Minimal Browser Environment Shim BEFORE importing real UIHelpers.js
// ---------------------------------------------------------------------------
function createMemoryStorage(initial = {}) {
    const map = new Map(Object.entries(initial));
    return {
        get length() { return map.size; },
        key(i) { return Array.from(map.keys())[i] ?? null; },
        getItem(k) { return map.has(k) ? map.get(k) : null; },
        setItem(k, v) { map.set(String(k), String(v)); },
        removeItem(k) { map.delete(String(k)); },
        clear() { map.clear(); },
        _dump() { return Object.fromEntries(map.entries()); }
    };
}

let lastHistoryReplace = null;
let lastLocationReplace = null;

function setMockBrowserContext({
    origin = 'https://checkin-stb.pages.dev',
    pathname = '/',
    search = '',
    hash = '',
    protocol = 'https:',
    sessionInit = {},
    localInit = {}
} = {}) {
    lastHistoryReplace = null;
    lastLocationReplace = null;

    const href = protocol === 'file:'
        ? `file:///D:/STB%20ChkIn/CheckinApp${pathname.startsWith('/') ? pathname : '/' + pathname}${search}${hash}`
        : `${origin}${pathname}${search}${hash}`;

    const sessionStore = createMemoryStorage(sessionInit);
    const localStore = createMemoryStorage(localInit);

    const mockWindow = {
        location: {
            origin: protocol === 'file:' ? 'null' : origin,
            protocol,
            pathname,
            search,
            hash,
            href,
            replace(url) {
                lastLocationReplace = String(url);
            }
        },
        history: {
            replaceState(state, title, url) {
                lastHistoryReplace = { state, title, url: String(url) };
                // Reflect history URL rewrite into mockWindow.location like a real browser
                if (url) {
                    const parsed = new URL(String(url), origin);
                    mockWindow.location.pathname = parsed.pathname;
                    mockWindow.location.search = parsed.search;
                    mockWindow.location.hash = parsed.hash;
                    mockWindow.location.href = parsed.toString();
                }
            }
        },
        addEventListener() {},
        performance: { getEntriesByType: () => [] }
    };

    globalThis.window = mockWindow;
    globalThis.sessionStorage = sessionStore;
    globalThis.localStorage = localStore;
    return { mockWindow, sessionStore, localStore };
}

setMockBrowserContext();
const uiHelpersUrl = pathToFileURL(path.join(WORKSPACE_ROOT, 'assets/js/core/UIHelpers.js')).href;
const { UIHelpers } = await import(uiHelpersUrl);

let total = 0;
let passed = 0;
let failed = 0;

function assert(condition, message) {
    total++;
    if (condition) {
        passed++;
        console.log(`  [PASS] ${message}`);
    } else {
        failed++;
        console.error(`  [FAIL] ${message}`);
    }
}

console.log('=========================================================================');
console.log('QA AUDIT: PIPE-20261121 Cloudflare Loading Path Loop & Cache Sync Tests');
console.log('=========================================================================');

// ---------------------------------------------------------------------------
// 1. UIHelpers.getRootBasePath() — Cloudflare Pages & GitHub Pages
// ---------------------------------------------------------------------------
console.log('\n--- 1. UIHelpers.getRootBasePath() Across Hosting Environments ---');

const cloudflarePaths = [
    '/',
    '/loading',
    '/loading/',
    '/loading.html',
    '/loading/loading.html',
    '/loading/loading.html/',
    '/loading/checkin.html',
    '/checkin',
    '/dashboard',
    '/time-corrections',
    '/index.html'
];

for (const p of cloudflarePaths) {
    setMockBrowserContext({ origin: 'https://checkin-stb.pages.dev', pathname: p });
    const actual = UIHelpers.getRootBasePath();
    assert(actual === '/', `Cloudflare pathname "${p}" -> getRootBasePath() === "/" (got "${actual}")`);
}

const githubPagesPaths = [
    '/CheckinApp/',
    '/CheckinApp/loading',
    '/CheckinApp/loading/',
    '/CheckinApp/loading.html',
    '/CheckinApp/loading/loading.html',
    '/CheckinApp/loading/checkin.html',
    '/CheckinApp/dashboard',
    '/CheckinApp/time-corrections',
    '/CheckinApp/index.html'
];

for (const p of githubPagesPaths) {
    setMockBrowserContext({ origin: 'https://stb6636.github.io', pathname: p });
    const actual = UIHelpers.getRootBasePath();
    assert(actual === '/CheckinApp/', `GitHub Pages pathname "${p}" -> getRootBasePath() === "/CheckinApp/" (got "${actual}")`);
}

// Edge case: directory whose name merely starts with "loading-" must NOT be stripped
{
    setMockBrowserContext({ origin: 'https://example.com', pathname: '/loading-portal/loading' });
    const actual = UIHelpers.getRootBasePath();
    assert(
        actual === '/loading-portal/',
        `Non-matching prefix "/loading-portal/loading" -> getRootBasePath() === "/loading-portal/" (got "${actual}")`
    );
}

// ---------------------------------------------------------------------------
// 2. UIHelpers.maskUrlToRoot() — History Rewrite & VIEW_PAGE_STORAGE_KEY Safety
// ---------------------------------------------------------------------------
console.log('\n--- 2. UIHelpers.maskUrlToRoot() History & Storage Preservation ---');

{
    const { sessionStore } = setMockBrowserContext({
        origin: 'https://checkin-stb.pages.dev',
        pathname: '/loading',
        search: '?entry=session',
        sessionInit: { [UIHelpers.VIEW_PAGE_STORAGE_KEY]: 'dashboard.html' }
    });
    UIHelpers.maskUrlToRoot();
    assert(
        lastHistoryReplace && lastHistoryReplace.url === '/',
        `maskUrlToRoot() on /loading?entry=session rewrites URL to "/" (got "${lastHistoryReplace?.url}")`
    );
    assert(
        sessionStore.getItem(UIHelpers.VIEW_PAGE_STORAGE_KEY) === 'dashboard.html',
        `maskUrlToRoot() on /loading does NOT overwrite VIEW_PAGE_STORAGE_KEY (kept "${sessionStore.getItem(UIHelpers.VIEW_PAGE_STORAGE_KEY)}")`
    );
    assert(
        lastHistoryReplace?.state?.file === 'dashboard.html',
        `maskUrlToRoot() on /loading preserves state.file === "dashboard.html"`
    );
}

{
    const { sessionStore } = setMockBrowserContext({
        origin: 'https://checkin-stb.pages.dev',
        pathname: '/loading/loading.html',
        search: '?entry=session',
        sessionInit: {}
    });
    UIHelpers.maskUrlToRoot();
    assert(
        lastHistoryReplace && lastHistoryReplace.url === '/',
        `maskUrlToRoot() on /loading/loading.html?entry=session rewrites URL to "/" (got "${lastHistoryReplace?.url}")`
    );
    assert(
        sessionStore.getItem(UIHelpers.VIEW_PAGE_STORAGE_KEY) === null,
        'maskUrlToRoot() on /loading/loading.html does NOT create VIEW_PAGE_STORAGE_KEY'
    );
}

{
    const { sessionStore } = setMockBrowserContext({
        origin: 'https://stb6636.github.io',
        pathname: '/CheckinApp/loading',
        search: '?entry=login',
        sessionInit: { [UIHelpers.VIEW_PAGE_STORAGE_KEY]: 'reports.html' }
    });
    UIHelpers.maskUrlToRoot();
    assert(
        lastHistoryReplace && lastHistoryReplace.url === '/CheckinApp/',
        `maskUrlToRoot() on /CheckinApp/loading?entry=login rewrites URL to "/CheckinApp/" (got "${lastHistoryReplace?.url}")`
    );
    assert(
        sessionStore.getItem(UIHelpers.VIEW_PAGE_STORAGE_KEY) === 'reports.html',
        'maskUrlToRoot() on /CheckinApp/loading does NOT overwrite VIEW_PAGE_STORAGE_KEY'
    );
}

{
    const { sessionStore } = setMockBrowserContext({
        origin: 'https://checkin-stb.pages.dev',
        pathname: '/checkin'
    });
    UIHelpers.maskUrlToRoot();
    assert(
        lastHistoryReplace && lastHistoryReplace.url === '/',
        `maskUrlToRoot() on Cloudflare pretty URL /checkin rewrites URL to "/" (got "${lastHistoryReplace?.url}")`
    );
    assert(
        sessionStore.getItem(UIHelpers.VIEW_PAGE_STORAGE_KEY) === 'checkin.html',
        'maskUrlToRoot() on /checkin stores VIEW_PAGE_STORAGE_KEY === "checkin.html"'
    );
}

// ---------------------------------------------------------------------------
// 3. UIHelpers.resolveAppUrl() Across Cloudflare, GitHub Pages & file:
// ---------------------------------------------------------------------------
console.log('\n--- 3. UIHelpers.resolveAppUrl() Target Resolution ---');

const resolveCases = [
    // Cloudflare Pages stuck on /loading or /loading/loading.html
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading', protocol: 'https:', in: 'loading.html?entry=session', expected: '/loading.html?entry=session' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading/loading.html', protocol: 'https:', in: 'loading.html?entry=session', expected: '/loading.html?entry=session' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading/', protocol: 'https:', in: 'checkin.html', expected: '/checkin.html' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading', protocol: 'https:', in: 'index.html', expected: '/index.html' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/', protocol: 'https:', in: 'https://example.com', expected: 'https://example.com' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading', protocol: 'https:', in: 'https://example.com/a?b=1', expected: 'https://example.com/a?b=1' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading', protocol: 'https:', in: '', expected: '/' },
    // GitHub Pages subpath
    { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/loading', protocol: 'https:', in: 'loading.html?entry=session', expected: '/CheckinApp/loading.html?entry=session' },
    { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/loading/loading.html', protocol: 'https:', in: 'checkin.html', expected: '/CheckinApp/checkin.html' },
    { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/', protocol: 'https:', in: 'index.html', expected: '/CheckinApp/index.html' },
    { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/loading', protocol: 'https:', in: 'https://example.com', expected: 'https://example.com' },
    { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/loading', protocol: 'https:', in: '/CheckinApp/dashboard.html', expected: '/CheckinApp/dashboard.html' },
    { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/loading', protocol: 'https:', in: '/CheckinApp', expected: '/CheckinApp/' },
    // file: protocol
    { origin: 'null', pathname: '/D:/STB ChkIn/CheckinApp/loading.html', protocol: 'file:', in: 'loading.html?entry=session', expected: 'loading.html?entry=session' },
    { origin: 'null', pathname: '/D:/STB ChkIn/CheckinApp/loading.html', protocol: 'file:', in: 'checkin.html', expected: 'checkin.html' },
    { origin: 'null', pathname: '/D:/STB ChkIn/CheckinApp/loading.html', protocol: 'file:', in: 'index.html', expected: 'index.html' },
    { origin: 'null', pathname: '/D:/STB ChkIn/CheckinApp/loading.html', protocol: 'file:', in: 'https://example.com', expected: 'https://example.com' }
];

for (const tc of resolveCases) {
    setMockBrowserContext({ origin: tc.origin, pathname: tc.pathname, protocol: tc.protocol });
    const actual = UIHelpers.resolveAppUrl(tc.in);
    assert(
        actual === tc.expected,
        `resolveAppUrl("${tc.in}") @ (${tc.protocol} ${tc.pathname}) === "${tc.expected}" (got "${actual}")`
    );
}

// ---------------------------------------------------------------------------
// 4. Real Inline Script Execution from index.html & loading.html
// ---------------------------------------------------------------------------
console.log('\n--- 4. Real Inline Script Path Resolution in index.html & loading.html ---');

const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
const loadingHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'loading.html'), 'utf8');

function extractInlineScripts(htmlContent) {
    return [...htmlContent.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)]
        .filter((m) => !/\bsrc\s*=/.test(m[0]))
        .map((m) => m[1]);
}

const indexScripts = extractInlineScripts(indexHtml);
const loadingScripts = extractInlineScripts(loadingHtml);

assert(indexScripts.length === 3, `index.html has expected 3 inline script blocks (got ${indexScripts.length})`);
assert(loadingScripts.length === 4, `loading.html has expected 4 inline script blocks (got ${loadingScripts.length})`);

const indexCacheBusterScript = indexScripts.find((s) => s.includes('CURRENT_APP_BUILD') && s.includes('performHardCachePurge'));
const indexFastPathScript = indexScripts.find((s) => s.includes('Fast-path Session Redirect Guard'));
const loadingPageshowScript = loadingScripts.find((s) => s.includes('event.persisted') && s.includes('appRootPath'));

assert(Boolean(indexCacheBusterScript), 'index.html CacheBuster inline script found');
assert(Boolean(indexFastPathScript), 'index.html Fast-path Session Redirect Guard inline script found');
assert(Boolean(loadingPageshowScript), 'loading.html BFCache pageshow inline script found');

function runIndexFastPath({ origin, pathname, protocol = 'https:', hasSession = true }) {
    let replacedUrl = null;
    const classes = new Set();
    const activeSession = JSON.stringify({
        id: 'usr_qa_01',
        role: 'Admin',
        expires_at: Date.now() + 86400000
    });
    const href = protocol === 'file:'
        ? `file:///D:/STB%20ChkIn/CheckinApp${pathname}`
        : `${origin}${pathname}`;

    const sandbox = {
        URL,
        Promise,
        setTimeout,
        Date,
        JSON,
        localStorage: createMemoryStorage(hasSession ? { bma_checkin_session_user_v2_7: activeSession } : {}),
        document: {
            documentElement: {
                classList: {
                    add(c) { classes.add(c); },
                    contains(c) { return classes.has(c); }
                }
            }
        },
        window: {
            location: {
                origin: protocol === 'file:' ? 'null' : origin,
                protocol,
                pathname,
                href,
                replace(url) { replacedUrl = String(url); }
            }
        }
    };
    vm.runInNewContext(indexFastPathScript, sandbox);
    return { replacedUrl, classes };
}

const indexLoopRecoveryCases = [
    { origin: 'https://checkin-stb.pages.dev', pathname: '/', expected: '/loading.html?entry=session' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/index.html', expected: '/loading.html?entry=session' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading', expected: '/loading.html?entry=session' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading/', expected: '/loading.html?entry=session' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading/loading.html', expected: '/loading.html?entry=session' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading/loading.html/', expected: '/loading.html?entry=session' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading/checkin.html', expected: '/loading.html?entry=session' },
    { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/', expected: '/CheckinApp/loading.html?entry=session' },
    { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/index.html', expected: '/CheckinApp/loading.html?entry=session' },
    { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/loading', expected: '/CheckinApp/loading.html?entry=session' },
    { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/loading/loading.html', expected: '/CheckinApp/loading.html?entry=session' },
    { origin: 'null', pathname: '/D:/STB%20ChkIn/CheckinApp/index.html', protocol: 'file:', expected: 'loading.html?entry=session' }
];

for (const tc of indexLoopRecoveryCases) {
    const res = runIndexFastPath(tc);
    assert(
        res.replacedUrl === tc.expected && res.classes.has('bma-session-redirecting'),
        `index.html Fast-path @ (${tc.protocol || 'https:'} ${tc.pathname}) -> "${res.replacedUrl}"`
    );
}

// Verify CacheBuster in index.html also redirects out of /loading/loading.html when purge triggers during active session
{
    let cacheReplacedUrl = null;
    const classes = new Set(['bma-session-redirecting']);
    const winObj = {
        location: {
            origin: 'https://checkin-stb.pages.dev',
            protocol: 'https:',
            pathname: '/loading/loading.html',
            search: '?entry=session',
            href: 'https://checkin-stb.pages.dev/loading/loading.html?entry=session',
            replace(url) { cacheReplacedUrl = String(url); }
        },
        caches: { keys: async () => [], delete: async () => true },
        addEventListener() {}
    };
    const sandbox = {
        URL,
        Promise,
        Date,
        console,
        fetch: async () => ({ ok: false }),
        navigator: {},
        localStorage: createMemoryStorage({ bma_app_build: 'old_build_000' }),
        sessionStorage: createMemoryStorage(),
        document: {
            documentElement: {
                classList: {
                    add(c) { classes.add(c); },
                    contains(c) { return classes.has(c); }
                }
            },
            visibilityState: 'hidden',
            addEventListener() {}
        },
        window: winObj
    };
    vm.runInNewContext(indexCacheBusterScript, sandbox);
    await winObj.__bmaPurgePromise;
    assert(
        cacheReplacedUrl &&
        cacheReplacedUrl.startsWith('https://checkin-stb.pages.dev/loading.html?') &&
        cacheReplacedUrl.includes('entry=session') &&
        cacheReplacedUrl.includes('_cb=') &&
        !cacheReplacedUrl.includes('/loading/loading.html'),
        `index.html CacheBuster purge redirect @ /loading/loading.html resolves cleanly to root /loading.html (got "${cacheReplacedUrl}")`
    );
}

// Verify loading.html BFCache pageshow handler
function runLoadingPageshow({ origin, pathname, protocol = 'https:' }) {
    let replacedUrl = null;
    let pageshowHandler = null;
    const sandbox = {
        window: {
            location: {
                origin: protocol === 'file:' ? 'null' : origin,
                protocol,
                pathname
            },
            performance: { getEntriesByType: () => [] },
            addEventListener(evt, fn) {
                if (evt === 'pageshow') pageshowHandler = fn;
            }
        }
    };
    sandbox.window.location.replace = (url) => { replacedUrl = String(url); };
    vm.runInNewContext(loadingPageshowScript, sandbox);
    pageshowHandler({ persisted: true });
    return replacedUrl;
}

const bfcacheCases = [
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading', expected: '/loading.html?entry=session' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading/', expected: '/loading.html?entry=session' },
    { origin: 'https://checkin-stb.pages.dev', pathname: '/loading/loading.html', expected: '/loading.html?entry=session' },
    { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/loading', expected: '/CheckinApp/loading.html?entry=session' },
    { origin: 'https://stb6636.github.io', pathname: '/CheckinApp/loading.html', expected: '/CheckinApp/loading.html?entry=session' },
    { origin: 'null', pathname: '/D:/STB%20ChkIn/CheckinApp/loading.html', protocol: 'file:', expected: 'loading.html?entry=session' }
];

for (const tc of bfcacheCases) {
    const actual = runLoadingPageshow(tc);
    assert(
        actual === tc.expected,
        `loading.html BFCache pageshow @ (${tc.protocol || 'https:'} ${tc.pathname}) -> "${actual}"`
    );
}

// ---------------------------------------------------------------------------
// 5. Controller Source Audit: Zero Bare Relative Redirects Left
// ---------------------------------------------------------------------------
console.log('\n--- 5. LoadingController.js & LoginController.js Bare Redirect Audit ---');

const loadingCtrlSrc = fs.readFileSync(path.join(WORKSPACE_ROOT, 'assets/js/controllers/LoadingController.js'), 'utf8');
const loginCtrlSrc = fs.readFileSync(path.join(WORKSPACE_ROOT, 'assets/js/controllers/LoginController.js'), 'utf8');

const bareReplacePattern = /window\.location\.replace\(\s*['"`](?:index\.html|loading\.html)/;
assert(
    !bareReplacePattern.test(loadingCtrlSrc),
    'LoadingController.js has ZERO bare window.location.replace("loading.html...") or ("index.html") calls'
);
assert(
    !bareReplacePattern.test(loginCtrlSrc),
    'LoginController.js has ZERO bare window.location.replace("loading.html...") or ("index.html") calls'
);

const loadingReplaceCalls = [...loadingCtrlSrc.matchAll(/window\.location\.replace\(([^;]+)\);/g)].map((m) => m[1].trim());
const loginReplaceCalls = [...loginCtrlSrc.matchAll(/window\.location\.replace\(([^;]+)\);/g)].map((m) => m[1].trim());

assert(
    loadingReplaceCalls.length === 5 && loadingReplaceCalls.every((arg) => arg.startsWith('UIHelpers.resolveAppUrl(')),
    `LoadingController.js: all ${loadingReplaceCalls.length} window.location.replace(...) calls use UIHelpers.resolveAppUrl(...)`
);
assert(
    loginReplaceCalls.length === 2 && loginReplaceCalls.every((arg) => arg.startsWith('UIHelpers.resolveAppUrl(')),
    `LoginController.js: all ${loginReplaceCalls.length} window.location.replace(...) calls use UIHelpers.resolveAppUrl(...)`
);

// ---------------------------------------------------------------------------
// 6. Mandatory 10-HTML Cache Version Sync Audit
// ---------------------------------------------------------------------------
console.log('\n--- 6. Mandatory 10-HTML Cache Version Sync Audit ---');

const ALL_10_HTML_FILES = [
    'index.html',
    'loading.html',
    'checkin.html',
    'dashboard.html',
    'approvals.html',
    'time-corrections.html',
    'reports.html',
    'settings.html',
    'personnel.html',
    'users.html'
];

const versionJson = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'version.json'), 'utf8'));
const expectedBuildId = versionJson.buildId;
assert(typeof expectedBuildId === 'string' && expectedBuildId.length > 0, `version.json buildId = "${expectedBuildId}"`);

for (const htmlFile of ALL_10_HTML_FILES) {
    const content = fs.readFileSync(path.join(WORKSPACE_ROOT, htmlFile), 'utf8');
    const buildMatch = content.match(/const\s+CURRENT_APP_BUILD\s*=\s*['"]([^'"]+)['"]/);
    assert(
        buildMatch && buildMatch[1] === expectedBuildId,
        `${htmlFile}: CURRENT_APP_BUILD === "${buildMatch ? buildMatch[1] : 'MISSING'}"`
    );

    const assetMatches = [...content.matchAll(/(?:href|src)\s*=\s*["'](assets\/[^"']+)["']/g)].map((m) => m[1]);
    const mismatched = assetMatches.filter((url) => !url.includes(`?v=${expectedBuildId}`));
    assert(
        assetMatches.length > 0 && mismatched.length === 0,
        `${htmlFile}: ${assetMatches.length}/${assetMatches.length} assets stamped with ?v=${expectedBuildId}`
    );
}

console.log('\n=========================================================================');
console.log(`QA CLOUDFLARE PATH & CACHE SYNC RESULTS: Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
console.log('=========================================================================');

if (failed > 0) process.exit(1);
