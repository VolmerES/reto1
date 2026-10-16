import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Exercise the event handlers without browser dependencies or a local server.
function fixture() {
  const listeners = {};
  const windowListeners = {};
  const focused = [];
  const scrollPanel = { scrollTop: 125 };
  const status = { setAttribute() {} };
  const app = {
    innerHTML: '',
    after() {},
    addEventListener(type, handler) { listeners[type] = handler; },
    querySelector(selector) {
      if (selector === '.browse-panel') return scrollPanel;
      if (selector === '.file-hint') return null;
      return { focus() { focused.push(selector); } };
    }
  };
  const window = { foldState: { mode: 'cerrado' }, addEventListener(type, handler) { windowListeners[type] = handler; } };
  const document = {
    getElementById(id) { return id === 'app' ? app : { src: 'file:///challenge/recursos/referencia-terraza.svg' }; },
    createElement() { return status; },
    querySelector() { return { click() { mode('abierto'); } }; }
  };
  const revoked = [];
  class TestURL extends URL {
    static createObjectURL() { return 'blob:test-image'; }
    static revokeObjectURL(value) { revoked.push(value); }
  }
  const context = { window, document, URL: TestURL, location: { href: 'file:///challenge/base/index.html' }, Intl };
  runInNewContext(readFileSync(new URL('../base/datos.js', import.meta.url), 'utf8'), context);
  runInNewContext(readFileSync(new URL('../base/app.js', import.meta.url), 'utf8'), context);
  function mode(value) { window.foldState.mode = value; windowListeners.foldchange(); }
  function click(dataset) { listeners.click({ target: { closest() { return { dataset }; } } }); }
  function select(id) { click({ select: id, focus: `select-${id}` }); }
  function changeSlot(index, value) { listeners.change({ target: { dataset: { slot: String(index) }, value, matches(selector) { return selector === '[data-slot]'; } } }); }
  function upload(file) { listeners.change({ target: { files: [file], matches(selector) { return selector === '[data-file]'; } } }); }
  function drop(raw) {
    listeners.drop({ preventDefault() {}, target: { closest() { return { classList: { remove() {} } }; } }, dataTransfer: { files: [], getData() { return raw; } } });
  }
  const slots = () => [...app.innerHTML.matchAll(/<select[^>]*>(.*?)<\/select>/g)].map(match => /value="([^"]+)" selected/.exec(match[1])?.[1] || '');
  return { app, status, focused, scrollPanel, revoked, mode, select, click, changeSlot, upload, drop, slots };
}

test('selection limit, removal, continuity, individual replacement and focus', () => {
  const f = fixture();
  assert.match(f.app.innerHTML, /0 de 2 seleccionados/);
  f.select('pinar'); f.select('patio'); f.select('sierra');
  assert.match(f.status.textContent, /Ya hay dos/);
  assert.equal(f.scrollPanel.scrollTop, 125);
  assert.equal(f.focused.at(-1), '[data-focus="select-patio"]');
  f.click({ action: 'compare' });
  assert.deepEqual(f.slots(), ['pinar', 'patio']);
  f.changeSlot(1, 'sierra');
  assert.deepEqual(f.slots(), ['pinar', 'sierra']);
  assert.equal(f.focused.at(-1), '[data-focus="slot-1"]');
  f.changeSlot(1, 'pinar');
  assert.deepEqual(f.slots(), ['pinar', 'sierra']);
  f.mode('flex'); assert.deepEqual(f.slots(), ['pinar', 'sierra']);
  assert.match(f.app.innerHTML, /fold-space/);
  f.click({ action: 'save' }); assert.match(f.app.innerHTML, /Selección guardada/);
  f.mode('cerrado'); f.select('pinar');
  assert.match(f.app.innerHTML, /1 de 2 seleccionados/);
  f.mode('abierto'); assert.deepEqual(f.slots(), ['sierra', '']);
});

test('empty slots can be populated in either order and survive context changes', () => {
  const f = fixture(); f.mode('abierto');
  f.changeSlot(1, 'patio'); f.mode('cerrado'); f.select('pinar');
  f.mode('abierto'); assert.deepEqual(f.slots(), ['pinar', 'patio']);
  f.changeSlot(0, ''); assert.deepEqual(f.slots(), ['', 'patio']);
  f.changeSlot(0, 'sierra'); assert.deepEqual(f.slots(), ['sierra', 'patio']);
});

test('reference drop persists, leaves both selections intact and can be removed', () => {
  const f = fixture(); f.select('pinar'); f.select('sierra'); f.mode('abierto');
  f.drop('file:///challenge/recursos/referencia-terraza.svg');
  assert.match(f.app.innerHTML, /Referencia guardada/);
  assert.deepEqual(f.slots(), ['pinar', 'sierra']);
  f.mode('flex'); f.mode('cerrado'); f.mode('abierto');
  assert.match(f.app.innerHTML, /Referencia guardada/);
  f.click({ action: 'remove-reference' });
  assert.doesNotMatch(f.app.innerHTML, /Referencia guardada/);
  assert.deepEqual(f.slots(), ['pinar', 'sierra']);
  f.drop('javascript:alert(1)'); assert.doesNotMatch(f.app.innerHTML, /Referencia guardada/);
});

test('file upload validates input and releases replaced object URLs', () => {
  const f = fixture(); f.mode('abierto');
  f.upload({ name: 'bad.html', type: 'text/html', size: 5 });
  assert.match(f.status.textContent, /hasta 10 MB/);
  f.upload({ name: 'large.png', type: 'image/png', size: 11 * 1024 * 1024 });
  assert.doesNotMatch(f.app.innerHTML, /Referencia guardada/);
  f.upload({ name: '<terraza>.svg', type: 'image/svg+xml', size: 400 });
  assert.match(f.app.innerHTML, /blob:test-image/);
  assert.match(f.app.innerHTML, /&lt;terraza&gt;/);
  f.mode('flex'); f.mode('abierto'); assert.match(f.app.innerHTML, /blob:test-image/);
  f.click({ action: 'remove-reference' }); assert.deepEqual(f.revoked, ['blob:test-image']);
});
