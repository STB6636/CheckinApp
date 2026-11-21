import assert from 'assert';

// Mock DOM elements
class MockClassList {
  constructor() {
    this.classes = new Set();
  }
  add(...names) {
    names.forEach(n => this.classes.add(n));
  }
  remove(...names) {
    names.forEach(n => this.classes.delete(n));
  }
  contains(name) {
    return this.classes.has(name);
  }
}

class MockElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.classList = new MockClassList();
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.attributes = new Map();
    this.textContent = '';
    this.innerHTML = '';
    this.disabled = false;
  }

  setAttribute(name, val) {
    this.attributes.set(name, String(val));
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  get firstElementChild() {
    return this.children[0] || null;
  }

  get lastElementChild() {
    return this.children[this.children.length - 1] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const traverse = (node) => {
      for (const child of node.children) {
        if (matches(child, selector)) {
          results.push(child);
        }
        traverse(child);
      }
    };
    traverse(this);
    return results;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (matches(curr, selector)) return curr;
      curr = curr.parentNode;
    }
    return null;
  }

  insertAdjacentHTML(position, html) {
    const newEl = new MockElement('tr');
    newEl.innerHTML = html;
    if (position === 'afterbegin') {
      this.children.unshift(newEl);
      newEl.parentNode = this;
    } else {
      this.children.push(newEl);
      newEl.parentNode = this;
    }
  }
}

function matches(el, selector) {
  if (selector === 'tr' && el.tagName === 'TR') return true;
  if (selector === 'td' && el.tagName === 'TD') return true;
  if (selector.startsWith('.') && el.classList.contains(selector.slice(1))) return true;
  if (selector === 'td[colspan]' && el.tagName === 'TD' && el.attributes.has('colspan')) return true;
  if (selector === 'button, input, select, a') {
    return ['BUTTON', 'INPUT', 'SELECT', 'A'].includes(el.tagName);
  }
  return false;
}

// Global mocks for animation
global.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
global.performance = { now: () => Date.now() };

// Import DOMDiffHelper
const { DOMDiffHelper } = await import('../../assets/js/utils/DOMDiffHelper.js');

console.log('--- Starting DOMDiffHelper Unit Tests ---');

// Test 1: reindexTableSequence
{
  const tbody = new MockElement('tbody');
  for (let i = 0; i < 5; i++) {
    const tr = new MockElement('tr');
    const tdSeq = new MockElement('td');
    tdSeq.classList.add('seq-num');
    tdSeq.textContent = 'old';
    tr.appendChild(tdSeq);
    tbody.appendChild(tr);
  }

  // Row 2 is hidden, row 3 is fading
  tbody.children[1].classList.add('hidden');
  tbody.children[2].classList.add('row-leave-fade');

  DOMDiffHelper.reindexTableSequence(tbody, '.seq-num', 1);

  assert.strictEqual(tbody.children[0].querySelector('.seq-num').textContent, '1', 'Row 0 should be 1');
  assert.strictEqual(tbody.children[1].querySelector('.seq-num').textContent, 'old', 'Row 1 hidden should not be reindexed');
  assert.strictEqual(tbody.children[2].querySelector('.seq-num').textContent, 'old', 'Row 2 leave-fade should not be reindexed');
  assert.strictEqual(tbody.children[3].querySelector('.seq-num').textContent, '2', 'Row 3 should be 2');
  assert.strictEqual(tbody.children[4].querySelector('.seq-num').textContent, '3', 'Row 4 should be 3');
  console.log('✓ Test 1: reindexTableSequence passed');
}

// Test 2: lockRowForConcurrentAdmin
{
  const tr = new MockElement('tr');
  const td1 = new MockElement('td');
  const btn = new MockElement('button');
  td1.appendChild(btn);
  const td2 = new MockElement('td');
  tr.appendChild(td1);
  tr.appendChild(td2);

  DOMDiffHelper.lockRowForConcurrentAdmin(tr, 'Admin ทดสอบ', 'อนุมัติแล้ว');

  assert.strictEqual(tr.classList.contains('row-locked-highlight'), true, 'Should add row-locked-highlight class');
  assert.strictEqual(btn.disabled, true, 'Button should be disabled');
  assert.strictEqual(btn.classList.contains('pointer-events-none'), true, 'Button should have pointer-events-none');
  assert.strictEqual(td2.innerHTML.includes('อนุมัติแล้ว โดย Admin ทดสอบ'), true, 'Action badge rendered');
  console.log('✓ Test 2: lockRowForConcurrentAdmin passed');
}

// Test 3: prependRowWithAnimation
{
  const tbody = new MockElement('tbody');
  const emptyTr = new MockElement('tr');
  const emptyTd = new MockElement('td');
  emptyTd.setAttribute('colspan', '5');
  emptyTr.appendChild(emptyTd);
  tbody.appendChild(emptyTr);

  const newRow = DOMDiffHelper.prependRowWithAnimation(tbody, '<tr class="mock-row"></tr>');
  assert.strictEqual(tbody.children.length, 1, 'Empty placeholder removed');
  assert.strictEqual(newRow.classList.contains('row-enter-highlight'), true, 'Added highlight animation');
  console.log('✓ Test 3: prependRowWithAnimation passed');
}

// Test 4: removeRowWithFade
{
  const tbody = new MockElement('tbody');
  const tr = new MockElement('tr');
  tbody.appendChild(tr);

  let completed = false;
  DOMDiffHelper.removeRowWithFade(tr, 50, () => {
    completed = true;
  });

  assert.strictEqual(tr.classList.contains('row-leave-fade'), true, 'Has leave-fade class');
  await new Promise(r => setTimeout(r, 80));
  assert.strictEqual(completed, true, 'onComplete fired');
  assert.strictEqual(tbody.children.length, 0, 'Row removed from tbody');
  console.log('✓ Test 4: removeRowWithFade passed');
}

// Test 5: animateNumericValue
{
  const span = new MockElement('span');
  DOMDiffHelper.animateNumericValue(span, 0, 10, 50);
  await new Promise(r => setTimeout(r, 100));
  assert.strictEqual(span.textContent, '10', 'Number animated to 10');
  console.log('✓ Test 5: animateNumericValue passed');
}

console.log('All Unit Tests PASSED Successfully!');
