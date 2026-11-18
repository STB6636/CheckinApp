/**
 * qa_admin_mobile_cards_users_tabs_test.mjs
 * Dedicated QA Verification Suite for PIPE-20261118-admin-mobile-cards-and-users-tabs
 */

import fs from 'node:fs';
import assert from 'node:assert/strict';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`  ✅ [PASS] #${String(totalTests).padStart(2, '0')}: ${name}`);
    } catch (err) {
        failedTests++;
        console.error(`  ❌ [FAIL] #${String(totalTests).padStart(2, '0')}: ${name}`);
        console.error(`     ${err.stack || err.message}`);
    }
}

async function runAsyncTest(name, fn) {
    totalTests++;
    try {
        await fn();
        passedTests++;
        console.log(`  ✅ [PASS] #${String(totalTests).padStart(2, '0')}: ${name}`);
    } catch (err) {
        failedTests++;
        console.error(`  ❌ [FAIL] #${String(totalTests).padStart(2, '0')}: ${name}`);
        console.error(`     ${err.stack || err.message}`);
    }
}

function checkBalancedHtmlTags(filePath, html) {
    const cleaned = html.replace(/<!--[\s\S]*?-->/g, '');
    const tagStack = [];
    const tagRe = /<\/?([a-zA-Z0-9\-]+)(?:\s+[^>]*)?>/g;
    const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype']);
    let m;
    while ((m = tagRe.exec(cleaned)) !== null) {
        const raw = m[0];
        const name = m[1].toLowerCase();
        if (voidTags.has(name) || raw.endsWith('/>')) continue;
        if (raw.startsWith('</')) {
            const last = tagStack.pop();
            assert.strictEqual(last, name, `${filePath} tag mismatch: expected </${last}> got </${name}>`);
        } else {
            tagStack.push(name);
        }
    }
    assert.strictEqual(tagStack.length, 0, `${filePath} unclosed tags: ${tagStack.join(', ')}`);
}

function setupMockEnv(options = {}) {
    const store = new Map(Object.entries(options.localStorage || {}));
    const sessionStore = new Map(Object.entries(options.sessionStorage || {}));
    const domElements = {};
    const windowListeners = {};
    const docListeners = {};
    const intervals = [];
    const timeouts = [];
    const REAL_SET_INTERVAL = globalThis.setInterval;
    const REAL_SET_TIMEOUT = globalThis.setTimeout;

    class MockClassList {
        constructor(el, initial = []) {
            this._el = el;
            this._set = new Set(initial);
        }
        contains(c) { return this._set.has(c); }
        add(...cls) { cls.forEach(c => this._set.add(c)); this._el._syncClassName(); }
        remove(...cls) { cls.forEach(c => this._set.delete(c)); this._el._syncClassName(); }
        toggle(c, force) {
            if (force !== undefined) {
                if (force) this._set.add(c);
                else this._set.delete(c);
                this._el._syncClassName();
                return Boolean(force);
            }
            const next = !this._set.has(c);
            if (next) this._set.add(c);
            else this._set.delete(c);
            this._el._syncClassName();
            return next;
        }
        toString() { return [...this._set].join(' '); }
    }

    function createEl(id, initialClasses = [], attrs = {}) {
        const el = {
            id,
            tagName: 'DIV',
            parentElement: null,
            parentNode: null,
            children: [],
            listeners: {},
            dataset: {},
            attributes: { ...attrs },
            style: {},
            textContent: '',
            innerHTML: '',
            value: attrs.value ?? '',
            checked: false,
            disabled: false,
            _className: initialClasses.join(' '),
            _syncClassName() { this._className = this.classList.toString(); },
            setAttribute(k, v) { this.attributes[k] = String(v); },
            getAttribute(k) { return this.attributes[k] ?? null; },
            appendChild(child) {
                child.parentElement = this;
                child.parentNode = this;
                this.children.push(child);
                return child;
            },
            prepend(child) {
                child.parentElement = this;
                child.parentNode = this;
                this.children.unshift(child);
            },
            remove() {
                if (this.parentNode && Array.isArray(this.parentNode.children)) {
                    this.parentNode.children = this.parentNode.children.filter(c => c !== this);
                }
            },
            get firstElementChild() { return this.children[0] || null; },
            get lastElementChild() { return this.children[this.children.length - 1] || null; },
            insertAdjacentHTML(pos, html) {
                const node = createEl(`ins_${Math.random().toString(36).slice(2, 7)}`);
                node.innerHTML = html;
                if (pos === 'afterbegin') {
                    this.children.unshift(node);
                    node.parentNode = this;
                    node.parentElement = this;
                } else {
                    this.children.push(node);
                    node.parentNode = this;
                    node.parentElement = this;
                }
            },
            addEventListener(type, fn) {
                this.listeners[type] = this.listeners[type] || [];
                this.listeners[type].push(fn);
            },
            dispatchEvent(evt) {
                const event = {
                    type: evt.type,
                    target: evt.target || this,
                    currentTarget: this,
                    preventDefault() {},
                    stopPropagation() {},
                    ...evt
                };
                for (const fn of (this.listeners[event.type] || [])) {
                    fn(event);
                }
                return event;
            },
            closest() { return null; },
            querySelector(sel) {
                return this.querySelectorAll(sel)[0] || null;
            },
            querySelectorAll(sel) {
                const res = [];
                const walk = (n) => {
                    for (const c of n.children || []) {
                        if (sel === '[data-card-item]' && c.attributes['data-card-item']) res.push(c);
                        else if (sel === '.seq-num' && c.classList.contains('seq-num')) res.push(c);
                        else if (sel === 'button, input, select, a' && ['BUTTON', 'INPUT', 'SELECT', 'A'].includes(c.tagName)) res.push(c);
                        else if (sel === '[data-card-actions]' && c.attributes['data-card-actions']) res.push(c);
                        walk(c);
                    }
                };
                walk(this);
                return res;
            }
        };
        el.classList = new MockClassList(el, initialClasses);
        Object.defineProperty(el, 'className', {
            get() { return this._className; },
            set(val) {
                this._className = String(val || '');
                this.classList._set = new Set(this._className.split(/\s+/).filter(Boolean));
            }
        });
        return el;
    }

    function getOrCreateElem(id, initialClasses = [], attrs = {}) {
        if (!domElements[id]) {
            domElements[id] = createEl(id, initialClasses, attrs);
        }
        return domElements[id];
    }

    globalThis.document = {
        hidden: false,
        documentElement: { classList: new MockClassList({ _syncClassName() {} }, []) },
        body: createEl('body'),
        getElementById: (id) => getOrCreateElem(id),
        querySelector: () => null,
        querySelectorAll: (sel) => {
            if (sel === '.users-tab-pane') {
                return [getOrCreateElem('tab-panel-users'), getOrCreateElem('tab-panel-password-resets', ['hidden'])];
            }
            if (sel === '.users-tab-btn, [data-users-tab-target]') {
                return [
                    getOrCreateElem('btnUsersTab1', ['users-tab-btn', 'active'], { 'data-users-tab-target': 'tab-panel-users' }),
                    getOrCreateElem('btnUsersTab2', ['users-tab-btn'], { 'data-users-tab-target': 'tab-panel-password-resets' })
                ];
            }
            return [];
        },
        addEventListener: (t, fn) => {
            docListeners[t] = docListeners[t] || [];
            docListeners[t].push(fn);
        },
        createElement: (tag) => {
            const el = createEl(`dyn_${Math.random().toString(36).slice(2, 7)}`);
            el.tagName = tag.toUpperCase();
            return el;
        }
    };

    globalThis.window = {
        location: { pathname: options.pathname || '/users.html', search: options.search || '', href: 'http://localhost/users.html', replace() {}, reload() {} },
        localStorage: {
            getItem: (k) => (store.has(k) ? store.get(k) : null),
            setItem: (k, v) => store.set(k, String(v)),
            removeItem: (k) => store.delete(k)
        },
        sessionStorage: {
            getItem: (k) => (sessionStore.has(k) ? sessionStore.get(k) : null),
            setItem: (k, v) => sessionStore.set(k, String(v)),
            removeItem: (k) => sessionStore.delete(k)
        },
        history: { replaceState() {}, pushState() {} },
        addEventListener: (t, fn) => {
            windowListeners[t] = windowListeners[t] || [];
            windowListeners[t].push(fn);
        },
        dispatchEvent: (evt) => {
            for (const fn of (windowListeners[evt.type] || [])) fn(evt);
        },
        navigator: { userAgent: 'Mozilla/5.0' }
    };

    globalThis.localStorage = globalThis.window.localStorage;
    globalThis.sessionStorage = globalThis.window.sessionStorage;
    globalThis.CustomEvent = class CustomEvent {
        constructor(type, init = {}) {
            this.type = type;
            this.detail = init.detail;
        }
    };
    globalThis.Swal = { isVisible: () => false, close: () => {}, fire: async () => ({ isConfirmed: true }), showLoading: () => {} };
    globalThis.supabase = {
        createClient: () => ({
            from: () => ({
                select() { return this; },
                eq() { return this; },
                neq() { return this; },
                order() { return this; },
                limit() { return this; },
                maybeSingle() { return Promise.resolve({ data: null, error: null }); },
                then(resolve) { return resolve({ data: [], error: null }); }
            }),
            channel: () => ({ on() { return this; }, subscribe() { return this; } })
        })
    };
    globalThis.setInterval = (fn, ms) => { const id = REAL_SET_INTERVAL(fn, ms); intervals.push(id); return id; };
    globalThis.setTimeout = (fn, ms) => { const id = REAL_SET_TIMEOUT(fn, ms); timeouts.push(id); return id; };

    return {
        createEl,
        getOrCreateElem,
        docListeners,
        windowListeners,
        cleanup() {
            intervals.forEach(clearInterval);
            timeouts.forEach(clearTimeout);
            globalThis.setInterval = REAL_SET_INTERVAL;
            globalThis.setTimeout = REAL_SET_TIMEOUT;
        }
    };
}

console.log('======================================================================');
console.log('🧪 Starting QA Suite: Admin Mobile Cards & Users 2-Tab + RBAC Badges');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: DOMDiffHelper Card Helpers
// -----------------------------------------------------------------------------
console.log('▶️ Suite 1: DOMDiffHelper Card Helpers');
const env1 = setupMockEnv();
const { DOMDiffHelper } = await import('../../assets/js/utils/DOMDiffHelper.js');

runTest('DOMDiffHelper exposes reindexCardSequence, lockCardForConcurrentAdmin, and prependCardWithAnimation without breaking table methods', () => {
    assert.strictEqual(typeof DOMDiffHelper.reindexTableSequence, 'function');
    assert.strictEqual(typeof DOMDiffHelper.lockRowForConcurrentAdmin, 'function');
    assert.strictEqual(typeof DOMDiffHelper.prependRowWithAnimation, 'function');
    assert.strictEqual(typeof DOMDiffHelper.reindexCardSequence, 'function');
    assert.strictEqual(typeof DOMDiffHelper.lockCardForConcurrentAdmin, 'function');
    assert.strictEqual(typeof DOMDiffHelper.prependCardWithAnimation, 'function');

    const container = env1.createEl('cardsContainer');
    const c1 = env1.createEl('c1', [], { 'data-card-item': 'true' });
    const s1 = env1.createEl('s1', ['seq-num']);
    s1.textContent = '99';
    c1.appendChild(s1);
    const c2 = env1.createEl('c2', ['hidden'], { 'data-card-item': 'true' });
    const s2 = env1.createEl('s2', ['seq-num']);
    s2.textContent = '88';
    c2.appendChild(s2);
    const c3 = env1.createEl('c3', [], { 'data-card-item': 'true' });
    const s3 = env1.createEl('s3', ['seq-num']);
    s3.textContent = '77';
    const act = env1.createEl('act', [], { 'data-card-actions': 'true' });
    const btn = env1.createEl('btn');
    btn.tagName = 'BUTTON';
    act.appendChild(btn);
    c3.appendChild(s3);
    c3.appendChild(act);
    container.appendChild(c1);
    container.appendChild(c2);
    container.appendChild(c3);

    DOMDiffHelper.reindexCardSequence(container, '[data-card-item]', '.seq-num', 1);
    assert.strictEqual(s1.textContent, '1');
    assert.strictEqual(s2.textContent, '88', 'Hidden card skipped');
    assert.strictEqual(s3.textContent, '2');

    DOMDiffHelper.lockCardForConcurrentAdmin(c3, '<script>Admin</script>', 'อนุมัติแล้ว');
    assert.strictEqual(c3.classList.contains('row-locked-highlight'), true);
    assert.strictEqual(btn.disabled, true);
    assert.ok(act.innerHTML.includes('dark:bg-sky-900/50'), 'Lock banner supports dark mode contrast');
    assert.ok(!act.innerHTML.includes('<script>'), 'Lock banner XSS escaped');

    const inserted = DOMDiffHelper.prependCardWithAnimation(container, '<div data-card-item="true">new</div>');
    assert.ok(inserted && inserted.classList.contains('row-enter-highlight'));
});
env1.cleanup();

// -----------------------------------------------------------------------------
// Suite 2: Admin HTML Structure, Card Containers, & Tag Balance
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 2: Admin HTML Structure & Mobile Card Containers');

const htmlFilesToAudit = [
    { file: 'dashboard.html', containerId: 'dashboardRecentCardsContainer' },
    { file: 'approvals.html', containerId: 'approvalsCardsContainer' },
    { file: 'personnel.html', containerId: 'personnelCardsContainer' },
    { file: 'users.html', containerId: 'usersCardsContainer' }
];

for (const { file, containerId } of htmlFilesToAudit) {
    runTest(`${file} wraps desktop table in hidden lg:block, adds #${containerId}, uses slate mobile canvas, and has balanced tags`, () => {
        const html = fs.readFileSync(file, 'utf8');
        assert.ok(html.includes(`id="${containerId}" class="lg:hidden space-y-3"`));
        assert.ok(html.includes('hidden lg:block'));
        assert.ok(html.includes('bg-slate-100/80 lg:bg-white dark:bg-slate-900/60 lg:dark:bg-slate-800'));
        checkBalancedHtmlTags(file, html);
    });
}

runTest('approvals.html has #approvalsPendingCountBadge and #approvalsSelectAllMobileBar (#chkSelectAllApprovalsMobile)', () => {
    const html = fs.readFileSync('approvals.html', 'utf8');
    assert.ok(html.includes('id="approvalsPendingCountBadge"'));
    assert.ok(html.includes('id="approvalsSelectAllMobileBar"'));
    assert.ok(html.includes('id="chkSelectAllApprovalsMobile"'));
});

runTest('personnel.html updates legend to justify-start lg:justify-end and preserves all 6 filter IDs', () => {
    const html = fs.readFileSync('personnel.html', 'utf8');
    assert.ok(html.includes('justify-start lg:justify-end'));
    for (const id of ['hierarchicalPersonnelOrgFilterDock', 'selectPersonnelFilterBureau', 'selectPersonnelFilterDivision', 'selectPersonnelFilterWorkGroup', 'personnelTableBody', 'personnelTotalCountBadge']) {
        assert.ok(html.includes(`id="${id}"`), `Missing #${id}`);
    }
});

runTest('users.html implements isolated 2-tab nav (.users-tab-btn, no .settings-tab-btn), Tab 2 #searchPasswordResetInput, #passwordResetCardsContainer, and no .bma-card on Table 2', () => {
    const html = fs.readFileSync('users.html', 'utf8');
    assert.ok(html.includes('id="usersTabNav"'));
    assert.ok(html.includes('class="users-tab-btn'));
    assert.ok(!html.includes('settings-tab-btn'), 'users.html must NEVER use .settings-tab-btn');
    assert.ok(html.includes('data-users-tab-target="tab-panel-users"'));
    assert.ok(html.includes('data-users-tab-target="tab-panel-password-resets"'));
    assert.ok(html.includes('id="usersTotalTabBadge"'));
    assert.ok(html.includes('id="pendingResetTabBadge"'));
    assert.ok(html.includes('id="searchPasswordResetInput"'));
    assert.ok(html.includes('id="passwordResetCardsContainer" class="lg:hidden space-y-3"'));
    const tab2Start = html.indexOf('id="tab-panel-password-resets"');
    const tab2Chunk = html.slice(tab2Start, html.indexOf('</main>', tab2Start));
    assert.ok(!/class="[^"]*\bbma-card\b(?![-])/.test(tab2Chunk), 'Table 2 wrapper must not have .bma-card (!important override)');
});

// -----------------------------------------------------------------------------
// Suite 3: ReportsController Print PDF Purity, Dark Mode Remark & Card Tap
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 3: ReportsController Print PDF Purity, Dark Contrast & XSS');

runTest('ReportsController preserves forPrintPdf === true print tables only and removes inline dark-breaking colors on web/mobile', () => {
    const repSrc = fs.readFileSync('assets/js/controllers/ReportsController.js', 'utf8');
    assert.ok(repSrc.includes('#resolveReportRemark(rec, { forExcel = false, forPrint = false } = {})'));
    assert.ok(repSrc.includes('if (forPrint) {'));
    assert.ok(repSrc.includes('lg:hidden space-y-3 bg-slate-100/80 dark:bg-slate-900/60 p-3 rounded-2xl'), 'Bypasses .bma-card !important');
    assert.ok(repSrc.includes("const personRow = e.target.closest('tr.report-person-row');"));
    assert.ok(repSrc.includes("const personCard = e.target.closest('.report-person-card');"));
    assert.ok(repSrc.includes('((forPrintPdf || !this.canManageRecords) ? 8 : 9)'));
    assert.ok(repSrc.includes('((forPrintPdf || !this.canManageRecords) ? 6 : 7)'));
    assert.ok(repSrc.includes('#escapeHtml(val)'));
});

// -----------------------------------------------------------------------------
// Suite 4: PersonnelController PDPA & SuperAdmin-Only Delete + Approvals Contract
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 4: PersonnelController PDPA / RBAC & ApprovalsController Contracts');

runTest('PersonnelController #buildPersonCardHtml omits national_id (PDPA) and gates delete-personnel behind this.canDeletePersonnel', () => {
    const perSrc = fs.readFileSync('assets/js/controllers/PersonnelController.js', 'utf8');
    const cardFnStart = perSrc.indexOf('#buildPersonCardHtml(person, indexNo)');
    const cardFnEnd = perSrc.indexOf('#buildPersonRowHtml(person, indexNo)', cardFnStart);
    const cardFnBody = perSrc.slice(cardFnStart, cardFnEnd);
    assert.ok(!cardFnBody.includes('national_id'), 'PDPA: national_id must NOT appear inside #buildPersonCardHtml');
    assert.ok(cardFnBody.includes('this.canDeletePersonnel'), 'Delete button must be gated behind this.canDeletePersonnel');
    assert.ok(perSrc.includes("e.target.closest('tr[data-person-id], [data-card-item][data-person-id]')"));
});

runTest('ApprovalsController keeps #buildRequestRowHtml/#formatRemarkCellHtml/#escapeHtml and adds #buildRequestCardHtml with WCAG AA classes', () => {
    const appSrc = fs.readFileSync('assets/js/controllers/ApprovalsController.js', 'utf8');
    assert.ok(appSrc.includes('#buildRequestRowHtml(req, indexNo)'));
    assert.ok(appSrc.includes('#formatRemarkCellHtml(req, isOffsite)'));
    assert.ok(appSrc.includes('#buildRequestCardHtml(req, indexNo)'));
    assert.ok(appSrc.includes('text-[#00744B] dark:text-emerald-400'));
    assert.ok(appSrc.includes('text-[#E11D48] dark:text-rose-400'));
    assert.ok(appSrc.includes('text-[#D97706] dark:text-amber-400'));
    assert.ok(appSrc.includes('DOMDiffHelper.lockCardForConcurrentAdmin'));
});

// -----------------------------------------------------------------------------
// Suite 5: UserModel RBAC Scope Guard + AppLayout Mobile Badges + Deep-Link
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 5: UserModel RBAC Guard & AppLayout Mobile Nav Badges');

const envRbac = setupMockEnv();
const { UserModel } = await import('../../assets/js/models/UserModel.js');
const { DatabaseService } = await import('../../assets/js/core/DatabaseService.js');
const { AppLayout } = await import('../../assets/js/components/AppLayout.js');

await runAsyncTest('UserModel.processPasswordResetRequest enforces SuperAdmin / Admin(bureau) / Admin(division) RBAC scope', async () => {
    const origGetInstance = DatabaseService.getInstance;
    const targetRecords = {
        'U-SUPER': { id: 'U-SUPER', username: 'sa1', full_name: 'SA One', role: 'SuperAdmin', national_id: '1111111111111', scope_bureau: 'สำนักเทศกิจ', scope_division: '', personnel: { national_id: '1111111111111', bureau: 'สำนักเทศกิจ', division: 'กองตรวจ 1' } },
        'U-OTHER-BUREAU': { id: 'U-OTHER-BUREAU', username: 'u2', full_name: 'Other Bureau', role: 'User', national_id: '2222222222222', scope_bureau: 'สำนักการโยธา', scope_division: 'ฝ่ายถนน', personnel: { national_id: '2222222222222', bureau: 'สำนักการโยธา', division: 'ฝ่ายถนน' } },
        'U-SAME-BUREAU': { id: 'U-SAME-BUREAU', username: 'u3', full_name: 'Same Bureau', role: 'User', national_id: '3333333333123', scope_bureau: 'สำนักเทศกิจ', scope_division: 'กองตรวจ 1', personnel: { national_id: '3333333333123', bureau: 'สำนักเทศกิจ', division: 'กองตรวจ 1' } }
    };

    DatabaseService.getInstance = () => ({
        client: {
            from() {
                let queryId = null;
                let isUpdate = false;
                const chain = {
                    select() { return chain; },
                    update() { isUpdate = true; return chain; },
                    eq(col, val) { if (col === 'id') queryId = val; return chain; },
                    maybeSingle() { return Promise.resolve({ data: targetRecords[queryId] || null, error: null }); },
                    then(resolve) {
                        if (isUpdate) return resolve({ error: null });
                        return resolve({ data: null, error: null });
                    }
                };
                return chain;
            }
        }
    });

    try {
        const divAdmin = { id: 'A-DIV', role: 'Admin', visibility_level: 'division', scope_bureau: 'สำนักเทศกิจ', scope_division: 'กองตรวจ 1' };
        const bureauAdmin = { id: 'A-BUR', role: 'Admin', visibility_level: 'bureau', scope_bureau: 'สำนักเทศกิจ', scope_division: '' };
        const superAdmin = { id: 'SA', role: 'SuperAdmin', visibility_level: 'all' };

        const rDiv = await UserModel.processPasswordResetRequest('U-SAME-BUREAU', true, divAdmin);
        assert.strictEqual(rDiv.success, false, 'Division Admin must be rejected');

        const rBurSuper = await UserModel.processPasswordResetRequest('U-SUPER', true, bureauAdmin);
        assert.strictEqual(rBurSuper.success, false, 'Bureau Admin cannot reset SuperAdmin');

        const rBurCross = await UserModel.processPasswordResetRequest('U-OTHER-BUREAU', true, bureauAdmin);
        assert.strictEqual(rBurCross.success, false, 'Bureau Admin cannot reset out-of-scope user');

        const rBurSame = await UserModel.processPasswordResetRequest('U-SAME-BUREAU', true, bureauAdmin);
        assert.strictEqual(rBurSame.success, true, 'Bureau Admin can approve in-scope user');
        assert.strictEqual(rBurSame.resetPasswordTo, '333123');

        const rSuper = await UserModel.processPasswordResetRequest('U-OTHER-BUREAU', true, superAdmin);
        assert.strictEqual(rSuper.success, true, 'SuperAdmin can approve across bureaus');
    } finally {
        DatabaseService.getInstance = origGetInstance;
    }
});

runTest('AppLayout adds #mobileNavSpecialBadge and #mobileNavResetBadge gated by canViewUsersMenu and deep-links Bell to users Tab 2', () => {
    const appLayoutSrc = fs.readFileSync('assets/js/components/AppLayout.js', 'utf8');
    assert.ok(appLayoutSrc.includes("badgeId: 'mobileNavSpecialBadge'"));
    assert.ok(appLayoutSrc.includes("badgeId: 'mobileNavResetBadge'"));
    assert.ok(appLayoutSrc.includes('data-users-deep-link="tab-panel-password-resets"'));
    assert.ok(appLayoutSrc.includes("sessionStorage.setItem('bma_users_active_tab', usersDeepLink)"));
    assert.ok(appLayoutSrc.includes("new CustomEvent('bma:users-switch-tab'"));

    assert.strictEqual(AppLayout.canViewUsersMenu({ role: 'SuperAdmin' }), true);
    assert.strictEqual(AppLayout.canViewUsersMenu({ role: 'Admin', visibility_level: 'bureau' }), true);
    assert.strictEqual(AppLayout.canViewUsersMenu({ role: 'Admin', visibility_level: 'division' }), false);
});
envRbac.cleanup();

// -----------------------------------------------------------------------------
// Suite 6: UsersController 2-Tab Decoupled Filtering, RBAC Cards & Sync
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 6: UsersController 2-Tab Isolation, RBAC Cards & Silent Sync');

runTest('UsersController enforces 2-tab isolation, Tab 2 decoupled #searchPasswordResetInput, Admin bureau Edit/Delete hiding, and card sync', () => {
    const usersSrc = fs.readFileSync('assets/js/controllers/UsersController.js', 'utf8');
    assert.ok(usersSrc.includes('#switchUsersTab(targetTabId)'));
    assert.ok(usersSrc.includes('#buildUserCardHtml(u, indexNo)'));
    assert.ok(usersSrc.includes('#buildResetCardHtml(u, indexNo)'));
    assert.ok(usersSrc.includes('#updateTabCountBadges('));
    assert.ok(usersSrc.includes("document.getElementById('searchPasswordResetInput')?.addEventListener('input'"));
    assert.ok(usersSrc.includes('UserModel.processPasswordResetRequest(id, true, this.currentUser)'));
    assert.ok(usersSrc.includes('UserModel.processPasswordResetRequest(id, false, this.currentUser)'));
    assert.ok(usersSrc.includes('passwordResetCardsContainer'));
    assert.ok(usersSrc.includes('usersCardsContainer'));
    assert.ok(usersSrc.includes('this.canEditOrDeleteUsers'), 'Edit/Delete gated behind this.canEditOrDeleteUsers');
});

// -----------------------------------------------------------------------------
// Suite 7: AGENTS.md, Skill Specs, Manual & Mandatory 9-HTML Cache Sync
// -----------------------------------------------------------------------------
console.log('\n▶️ Suite 7: AGENTS.md, Skill Configs, Manual & 9-HTML Cache Sync');

runTest('AGENTS.md and ai-software-pipeline skill specs upgraded from Flash 3.8 High to Gemini 4 Hydrogen (High)', () => {
    const files = [
        'AGENTS.md',
        '.agents/skills/ai-software-pipeline/SKILL.md',
        '.agents/skills/ai-software-pipeline/resources/model_routing.yaml',
        '.agents/skills/ai-software-pipeline/resources/extended_config_v2.yaml',
        '.agents/skills/ai-software-pipeline/references/agents/agent_00_orchestrator.md',
        '.agents/skills/ai-software-pipeline/references/agents/agent_00_orchestrator_v2.md',
        '.agents/skills/ai-software-pipeline/resources/closed_loop_state_machine_v3.md',
        '.agents/skills/ai-software-pipeline/resources/user_trigger_prompt_template_v3.md'
    ];
    for (const f of files) {
        const txt = fs.readFileSync(f, 'utf8');
        assert.ok(txt.includes('Gemini 4 Hydrogen (High)'), `${f} must specify Gemini 4 Hydrogen (High)`);
        assert.ok(!/Flash 3\.8 High/i.test(txt), `${f} must not retain Flash 3.8 High`);
    }
});

runTest('docs/manual/manual-admin.html Topic 8 updated for Tab 2 & mobile Card-List', () => {
    const manualHtml = fs.readFileSync('docs/manual/manual-admin.html', 'utf8');
    assert.ok(manualHtml.includes('แท็บที่ 2: <b>"อนุมัติการเปลี่ยนรหัสผ่าน"</b>'));
    assert.ok(manualHtml.includes('การ์ดเรียงแนวตั้งอ่านง่าย'));
});

runTest('version.json and all 9 root HTML files match buildId 100%', () => {
    const versionData = JSON.parse(fs.readFileSync('version.json', 'utf8'));
    const buildId = versionData.buildId;
    assert.ok(buildId && buildId.length > 8, `Valid buildId: ${buildId}`);

    const rootHtmls = [
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
    for (const file of rootHtmls) {
        const src = fs.readFileSync(file, 'utf8');
        assert.ok(src.includes(`CURRENT_APP_BUILD = '${buildId}'`), `${file} CURRENT_APP_BUILD matches ${buildId}`);
        assert.ok(src.includes(`?v=${buildId}`), `${file} assets stamped with ?v=${buildId}`);
    }
});

console.log('\n======================================================================');
console.log(`📊 Test Summary: Total ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('======================================================================');
if (failedTests > 0) process.exit(1);
console.log('🎉 ALL ADMIN MOBILE CARDS, 2-TAB USERS & RBAC TESTS PASSED 100%!\n');
