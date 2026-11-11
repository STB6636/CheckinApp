import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log(' Deep QA Stress & Edge-Case Verification Suite');
console.log(' Feature: Login Version Badge & What\'s New Modal');
console.log('================================================================\n');

let pass = 0;
let fail = 0;

async function check(name, fn) {
    try {
        await fn();
        console.log(`[PASS] ${name}`);
        pass++;
    } catch (err) {
        console.error(`[FAIL] ${name}`);
        console.error(`       Details: ${err.message}`);
        fail++;
    }
}

async function run() {
    // -------------------------------------------------------------------------
    // Edge Case 1: Font Awesome Free Compatibility
    // -------------------------------------------------------------------------
    await check('Edge Case 1: Badge markup supports Font Awesome 6 Free (fa-wand-magic-sparkles)', async () => {
        const { SystemUpdateModal } = await import(`../../assets/js/components/SystemUpdateModal.js?t=${Date.now()}`);
        
        let capturedHtml = '';
        const mockSlot = {
            set innerHTML(val) { capturedHtml = val; },
            get innerHTML() { return capturedHtml; },
            querySelector: () => ({ addEventListener: () => {} })
        };

        SystemUpdateModal.renderBadge(mockSlot);
        assert(capturedHtml.includes('fa-wand-magic-sparkles'), 'Must contain fa-wand-magic-sparkles for FA Free support');
        assert(capturedHtml.includes('fa-sparkles'), 'Must contain fa-sparkles for backward compatibility');
    });

    // -------------------------------------------------------------------------
    // Edge Case 2: XSS Injection Protection
    // -------------------------------------------------------------------------
    await check('Edge Case 2: XSS Injection in releaseNotes title and desc is sanitized', async () => {
        // Mock minimal DOM
        let appendedChild = null;
        global.document = {
            body: {
                appendChild: (el) => { appendedChild = el; },
                classList: { add: () => {}, remove: () => {} }
            },
            createElement: (tag) => ({
                tagName: tag.toUpperCase(),
                attributes: new Map(),
                setAttribute: (k, v) => {},
                querySelector: () => null,
                addEventListener: () => {}
            }),
            getElementById: () => null
        };

        const { SystemUpdateModal } = await import(`../../assets/js/components/SystemUpdateModal.js?t=${Date.now()}`);
        const originalReleaseNotes = JSON.parse(JSON.stringify(SystemUpdateModal.DEFAULT_DATA.releaseNotes));
        
        // Inject malicious data
        const xssPayload = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
        SystemUpdateModal.DEFAULT_DATA.releaseNotes = {
            title: xssPayload,
            releaseDate: xssPayload,
            highlights: [
                { title: xssPayload, desc: xssPayload, icon: 'fa-check' }
            ]
        };

        SystemUpdateModal.show();
        assert(appendedChild, 'Modal was not appended');
        assert(!appendedChild.innerHTML.includes('<script>alert("xss")</script>'), 'Unsanitized script tag found');
        assert(appendedChild.innerHTML.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'), 'Script tag not entity escaped');
        assert(!appendedChild.innerHTML.includes('<img src=x'), 'Unsanitized img onerror tag found');
        assert(appendedChild.innerHTML.includes('&lt;img src=x onerror=alert(1)&gt;'), 'Img tag not entity escaped');

        SystemUpdateModal.close(false);
        SystemUpdateModal.DEFAULT_DATA.releaseNotes = originalReleaseNotes;
    });

    // -------------------------------------------------------------------------
    // Edge Case 3: Empty / Null Highlights Fallback
    // -------------------------------------------------------------------------
    await check('Edge Case 3: Null or empty highlights array safely falls back to default highlights', async () => {
        let modalEl = null;
        global.document = {
            body: {
                appendChild: (el) => { modalEl = el; },
                classList: { add: () => {}, remove: () => {} }
            },
            createElement: (tag) => ({
                tagName: tag.toUpperCase(),
                attributes: new Map(),
                setAttribute: () => {},
                querySelector: () => null,
                addEventListener: () => {}
            }),
            getElementById: () => null
        };

        const { SystemUpdateModal } = await import(`../../assets/js/components/SystemUpdateModal.js?t=${Date.now()}`);
        const originalReleaseNotes = JSON.parse(JSON.stringify(SystemUpdateModal.DEFAULT_DATA.releaseNotes));
        
        // Test with empty array
        SystemUpdateModal.DEFAULT_DATA.releaseNotes = {
            title: 'Empty Test',
            releaseDate: '11 พ.ย. 2569',
            highlights: []
        };

        SystemUpdateModal.show();
        assert(modalEl, 'Modal element was not created');
        // Should fallback to default highlights, not leave body blank
        assert(modalEl.innerHTML.includes('ปรับปรุงประสิทธิภาพการทำงานของระบบ') || modalEl.innerHTML.includes('รีเฟรช GPS'), 'Empty highlights did not fallback properly');

        SystemUpdateModal.close(false);
        SystemUpdateModal.DEFAULT_DATA.releaseNotes = originalReleaseNotes;
    });

    // -------------------------------------------------------------------------
    // Edge Case 4: Offline / Failed Fetch Fallback to localStorage bma_app_build
    // -------------------------------------------------------------------------
    await check('Edge Case 4: Offline mode resolves buildId from localStorage bma_app_build without mismatch', async () => {
        const expectedBuild = '20261111_test_offline_build';
        const storage = new Map();
        storage.set('bma_app_build', expectedBuild);

        global.localStorage = {
            getItem: (k) => storage.get(k) || null,
            setItem: (k, v) => storage.set(k, String(v)),
            removeItem: (k) => storage.delete(k)
        };

        // Break fetch to simulate offline
        global.fetch = async () => { throw new Error('Network failure (offline)'); };

        const { SystemUpdateModal } = await import(`../../assets/js/components/SystemUpdateModal.js?t=${Date.now()}`);
        const data = await SystemUpdateModal.fetchVersionData();
        
        assert.strictEqual(data.buildId, expectedBuild, `buildId should match bma_app_build (${expectedBuild}) in offline mode`);
        assert.strictEqual(SystemUpdateModal.getCurrentAppBuild(), expectedBuild);
    });

    // -------------------------------------------------------------------------
    // Edge Case 5: Fast Concurrent Initialization in LoginController
    // -------------------------------------------------------------------------
    await check('Edge Case 5: LoginController uses Promise.allSettled for non-blocking init', () => {
        const loginControllerSource = fs.readFileSync('assets/js/controllers/LoginController.js', 'utf8');
        assert(loginControllerSource.includes('Promise.allSettled'), 'LoginController must use Promise.allSettled to prevent Supabase settings latency from blocking SystemUpdateModal');
        assert(loginControllerSource.includes('SystemUpdateModal.init'), 'LoginController must initialize SystemUpdateModal');
    });

    // -------------------------------------------------------------------------
    // Edge Case 6: Cache version synchronization across all 8 HTML files
    // -------------------------------------------------------------------------
    await check('Edge Case 6: version.json buildId exactly matches all 8 root HTML files (100% sync)', () => {
        const version = JSON.parse(fs.readFileSync('version.json', 'utf8'));
        const htmlFiles = [
            'index.html', 'checkin.html', 'dashboard.html', 'approvals.html',
            'reports.html', 'personnel.html', 'settings.html', 'users.html'
        ];

        for (const f of htmlFiles) {
            const html = fs.readFileSync(f, 'utf8');
            const match = html.match(/CURRENT_APP_BUILD\s*=\s*['"]([^'"]+)['"]/);
            assert(match, `${f} missing CURRENT_APP_BUILD`);
            assert.strictEqual(match[1], version.buildId, `${f} CURRENT_APP_BUILD mismatch: expected ${version.buildId}, got ${match[1]}`);
        }
    });

    console.log(`\n================================================================`);
    console.log(` Stress & Edge-Case Suite Completed: ${pass} Passed, ${fail} Failed.`);
    console.log(`================================================================`);

    if (fail > 0) process.exit(1);
}

run().catch((e) => {
    console.error('Fatal runner error:', e);
    process.exit(1);
});
