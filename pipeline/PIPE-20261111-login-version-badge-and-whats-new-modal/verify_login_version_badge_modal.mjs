import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log(' Comprehensive Automated Verification Suite');
console.log(' Feature: Login Version Badge & What\'s New Modal (PIPE-20261111)');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

async function test(description, fn) {
    try {
        await fn();
        console.log(`[PASS] ${description}`);
        passCount++;
    } catch (err) {
        console.error(`[FAIL] ${description}`);
        console.error(`       Error: ${err.message}`);
        failCount++;
    }
}

async function runSuite() {
    // -----------------------------------------------------------------------------
    // Test 1: version.json structure and validity
    // -----------------------------------------------------------------------------
    await test('version.json exists and has valid structure with appVersion and releaseNotes', () => {
        assert(fs.existsSync('version.json'), 'version.json does not exist');
        const version = JSON.parse(fs.readFileSync('version.json', 'utf8'));
        assert(version.buildId, 'Missing buildId');
        assert.strictEqual(version.appVersion, 'v2.9.2', 'appVersion is not v2.9.2');
        assert(version.contentHash, 'Missing contentHash');
        assert(version.updatedAt, 'Missing updatedAt');
        assert(version.releaseNotes, 'Missing releaseNotes');
        assert(version.releaseNotes.title, 'Missing releaseNotes.title');
        assert(version.releaseNotes.releaseDate, 'Missing releaseNotes.releaseDate');
        assert(Array.isArray(version.releaseNotes.highlights), 'releaseNotes.highlights is not an array');
        assert(version.releaseNotes.highlights.length >= 3, 'highlights should have at least 3 items');
    });

    // -----------------------------------------------------------------------------
    // Test 2: Cache sync across all 8 root HTML files
    // -----------------------------------------------------------------------------
    await test('All 8 HTML files have matching CURRENT_APP_BUILD and ?v= params with version.json', () => {
        const version = JSON.parse(fs.readFileSync('version.json', 'utf8'));
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

        for (const file of htmlFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const buildRegex = new RegExp(`CURRENT_APP_BUILD\\s*=\\s*['"]${version.buildId}['"]`);
            assert(buildRegex.test(content), `${file} does not contain CURRENT_APP_BUILD = '${version.buildId}'`);

            // Check asset ?v= params
            const assetMatches = content.match(/assets\/(?:css|js)\/[^"'?\s]+\?v=([^"'\s>]+)/g) || [];
            assert(assetMatches.length > 0, `${file} has no versioned asset links`);
            for (const match of assetMatches) {
                assert(match.endsWith(`?v=${version.buildId}`), `${file} asset link ${match} does not match buildId`);
            }
        }
    });

    // -----------------------------------------------------------------------------
    // Test 3: index.html has #loginVersionBadgeSlot in the correct header location
    // -----------------------------------------------------------------------------
    await test('index.html contains #loginVersionBadgeSlot in the card header', () => {
        const indexHtml = fs.readFileSync('index.html', 'utf8');
        assert(indexHtml.includes('id="loginVersionBadgeSlot"'), 'Missing #loginVersionBadgeSlot in index.html');
        
        // Check that it is inside login-card-header-gradient
        const headerIndex = indexHtml.indexOf('login-card-header-gradient');
        const slotIndex = indexHtml.indexOf('id="loginVersionBadgeSlot"');
        const orgNameIndex = indexHtml.indexOf('id="orgNameText"');
        assert(headerIndex !== -1 && slotIndex !== -1 && orgNameIndex !== -1, 'Could not find header elements in index.html');
        assert(slotIndex > headerIndex && slotIndex < orgNameIndex, '#loginVersionBadgeSlot must be inside header before orgNameText');
    });

    // -----------------------------------------------------------------------------
    // Test 4: LoginController.js integration
    // -----------------------------------------------------------------------------
    await test('LoginController.js imports and initializes SystemUpdateModal with slot selector', () => {
        const controller = fs.readFileSync('assets/js/controllers/LoginController.js', 'utf8');
        assert(controller.includes("import { SystemUpdateModal } from '../components/SystemUpdateModal.js';"), 'Missing import of SystemUpdateModal');
        assert(controller.includes("SystemUpdateModal.init({ targetBadgeSlot: '#loginVersionBadgeSlot' })"), 'Missing SystemUpdateModal.init call');
    });

    // -----------------------------------------------------------------------------
    // Test 5: AST Mapper preserves appVersion and releaseNotes
    // -----------------------------------------------------------------------------
    await test('vscode_ast_mapper.mjs preserves existingVersion.appVersion and releaseNotes', () => {
        const mapper = fs.readFileSync('.ai_map/vscode_ast_mapper.mjs', 'utf8');
        assert(mapper.includes('existingVersion?.appVersion'), 'AST mapper must preserve existingVersion.appVersion');
        assert(mapper.includes('existingVersion?.releaseNotes'), 'AST mapper must preserve existingVersion.releaseNotes');
    });

    // -----------------------------------------------------------------------------
    // Test 6: SystemUpdateModal class unit and simulated DOM behavior
    // -----------------------------------------------------------------------------
    await test('SystemUpdateModal class functions properly in simulated DOM', async () => {
        // Mock minimal DOM environment
        const storage = new Map();

        global.localStorage = {
            getItem: (k) => storage.get(k) || null,
            setItem: (k, v) => storage.set(k, String(v)),
            removeItem: (k) => storage.delete(k),
            clear: () => storage.clear()
        };

        const windowListeners = new Map();
        global.window = {
            location: { href: 'http://localhost/index.html', origin: 'http://localhost', pathname: '/index.html' },
            addEventListener: (event, cb) => {
                if (!windowListeners.has(event)) windowListeners.set(event, []);
                windowListeners.get(event).push(cb);
            },
            removeEventListener: (event, cb) => {
                if (!windowListeners.has(event)) return;
                const arr = windowListeners.get(event).filter(fn => fn !== cb);
                windowListeners.set(event, arr);
            }
        };

        class MockElement {
            constructor(tagName) {
                this.tagName = tagName ? tagName.toUpperCase() : 'DIV';
                this.id = '';
                this.className = '';
                this.innerHTML = '';
                this.children = [];
                this.parentNode = null;
                this.attributes = new Map();
                this.listeners = new Map();
                this.classList = {
                    add: (cls) => { if (!this.className.includes(cls)) this.className += ` ${cls}`; },
                    remove: (cls) => { this.className = this.className.replace(new RegExp(`\\b${cls}\\b`, 'g'), '').trim(); },
                    contains: (cls) => this.className.includes(cls)
                };
            }

            setAttribute(k, v) { this.attributes.set(k, v); }
            getAttribute(k) { return this.attributes.get(k); }

            addEventListener(ev, cb) {
                if (!this.listeners.has(ev)) this.listeners.set(ev, []);
                this.listeners.get(ev).push(cb);
            }

            querySelector(sel) {
                if (sel.startsWith('#')) {
                    const targetId = sel.slice(1);
                    if (this.id === targetId) return this;
                    if (this.innerHTML.includes(`id="${targetId}"`)) {
                        const el = new MockElement();
                        el.id = targetId;
                        return el;
                    }
                }
                return null;
            }

            appendChild(child) {
                child.parentNode = this;
                this.children.push(child);
                return child;
            }

            removeChild(child) {
                this.children = this.children.filter(c => c !== child);
                child.parentNode = null;
                return child;
            }
        }

        const docElements = new Map();
        const bodyEl = new MockElement('BODY');
        docElements.set('body', bodyEl);

        const badgeSlotEl = new MockElement('DIV');
        badgeSlotEl.id = 'loginVersionBadgeSlot';
        docElements.set('#loginVersionBadgeSlot', badgeSlotEl);
        docElements.set('loginVersionBadgeSlot', badgeSlotEl);

        global.document = {
            body: bodyEl,
            createElement: (tag) => new MockElement(tag),
            querySelector: (sel) => {
                if (sel === '#loginVersionBadgeSlot') return badgeSlotEl;
                return docElements.get(sel) || null;
            },
            getElementById: (id) => {
                if (id === 'loginVersionBadgeSlot') return badgeSlotEl;
                if (id === 'bmaSystemUpdateModal') {
                    return bodyEl.children.find(c => c.id === 'bmaSystemUpdateModal') || null;
                }
                return null;
            }
        };

        // Import SystemUpdateModal dynamically
        const { SystemUpdateModal } = await import(`../../assets/js/components/SystemUpdateModal.js?t=${Date.now()}`);
        assert(SystemUpdateModal, 'SystemUpdateModal class should be exported');

        // 6.1 Test badge rendering
        SystemUpdateModal.renderBadge('#loginVersionBadgeSlot');
        assert(badgeSlotEl.innerHTML.includes('id="btnLoginVersionBadge"'), 'Badge button not rendered');
        assert(badgeSlotEl.innerHTML.includes('v2.9.2'), 'Badge button does not include version v2.9.2');
        assert(badgeSlotEl.innerHTML.includes('fa-sparkles'), 'Badge button missing sparkles icon');
        assert(badgeSlotEl.innerHTML.includes('fa-wand-magic-sparkles'), 'Badge button missing Font Awesome Free sparkles icon');

        // 6.2 Test modal show
        SystemUpdateModal.show();
        const modalInBody = document.getElementById('bmaSystemUpdateModal');
        assert(modalInBody, 'Modal was not injected into document.body');
        assert(modalInBody.innerHTML.includes('id="btnModalCloseTopX"'), 'Modal missing top-right close X button');
        assert(modalInBody.innerHTML.includes('id="btnModalCloseBottomAck"'), 'Modal missing bottom acknowledge button');
        assert(modalInBody.innerHTML.includes('รับทราบและเข้าสู่ระบบ'), 'Modal missing acknowledgment text');
        assert(modalInBody.innerHTML.includes('from-[#00351B] to-[#00744B]'), 'Modal header missing BMA green gradient');

        // 6.3 Test close with acknowledge saves to localStorage
        storage.clear();
        assert.strictEqual(localStorage.getItem('bma_last_seen_update_build'), null);
        SystemUpdateModal.close(true);
        assert.strictEqual(document.getElementById('bmaSystemUpdateModal'), null, 'Modal should be removed after close');
        const savedBuild = localStorage.getItem('bma_last_seen_update_build');
        assert(savedBuild && savedBuild.length > 0, 'last_seen_update_build should be persisted to localStorage');

        // 6.4 Test single-view checkAndShowAuto logic
        // Now that last_seen is set to current build, checkAndShowAuto() should NOT open the modal
        SystemUpdateModal.checkAndShowAuto();
        assert.strictEqual(document.getElementById('bmaSystemUpdateModal'), null, 'Modal should NOT open if already seen');

        // If new build arrives, checkAndShowAuto() SHOULD open the modal
        storage.set('bma_last_seen_update_build', '20261101_oldbuild');
        SystemUpdateModal.checkAndShowAuto();
        assert(document.getElementById('bmaSystemUpdateModal') !== null, 'Modal SHOULD open when new build is detected');

        // Clean up
        SystemUpdateModal.close(true);
    });

    // -----------------------------------------------------------------------------
    // Test 7: Pre-flight regression audit
    // -----------------------------------------------------------------------------
    await test('qa_regression_preflight_audit.mjs passes all checks without regressions', async () => {
        const preflightPath = path.resolve('pipeline/PIPE-20261111-login-version-badge-and-whats-new-modal/qa_regression_preflight_audit.mjs');
        const { execSync } = await import('child_process');
        const out = execSync(`node "${preflightPath}"`, { encoding: 'utf8' });
        assert(out.includes('Pre-flight Regression Audit: 24 Passed, 0 Failed'), 'Pre-flight audit did not report 24 Passed');
    });

    console.log(`\n================================================================`);
    console.log(` Verification Suite Completed: ${passCount} Passed, ${failCount} Failed.`);
    console.log(`================================================================`);

    if (failCount > 0) {
        process.exit(1);
    }
}

runSuite().catch((err) => {
    console.error('Fatal suite runner error:', err);
    process.exit(1);
});
