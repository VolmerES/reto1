// Escapada a Soria · interfaz para los tres contextos del plegable.
// La selección, la referencia y la nota viven fuera del render para conservarse
// entre Cerrado, Abierto y Flex. El render es una función pura del estado + contexto.
const app = document.getElementById('app');
const stays = window.alojamientos;
const attributes = window.atributos;
const MAX_SELECTED = 2;

const state = {
  selected: [],     // ids en orden de elección (máximo 2)
  changing: null,   // hueco (0 | 1) que está eligiendo sustituto, o null
  reference: null,  // {src, name} de la imagen de referencia, o null
  note: ''          // nota opcional de la referencia
};

// La región viva (toast) se crea una sola vez para que los lectores de pantalla anuncien los cambios.
app.innerHTML = '<div id="view"></div><div id="status" class="toast" role="status" aria-live="polite" hidden></div>';
const view = document.getElementById('view');
const status = document.getElementById('status');
let toastTimer = null;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = (id) => stays.find((s) => s.id === id);
const mode = () => (window.foldState && window.foldState.mode) || 'cerrado';
const slotStay = (i) => (state.selected[i] ? byId(state.selected[i]) : null);

function notify(text) {
  status.hidden = false;
  status.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { status.hidden = true; }, 3800);
}

// ---------- Piezas comunes ----------
function header(title, subtitle) {
  const n = state.selected.length;
  return `<header class="hd">
    <div class="hd-row"><span class="kicker">Tu escapada · Soria</span><span class="count${n === MAX_SELECTED ? ' is-full' : ''}">${n} / ${MAX_SELECTED} seleccionados</span></div>
    <h1 class="title">${title}</h1>
    <p class="sub">${subtitle}</p>
  </header>`;
}

function chips(stay) {
  const list = attributes.filter((a) => stay.servicios[a.id]).map((a) => `<span class="chip">${esc(a.nombre)}</span>`);
  return list.length ? list.join('') : '<span class="chip chip-none">Sin servicios</span>';
}

function card(stay) {
  const index = state.selected.indexOf(stay.id);
  const on = index >= 0;
  return `<article class="card${on ? ' is-on' : ''}">
    <div class="card-media"><img src="${stay.imagen}" alt="${esc(stay.nombre)}">${on ? `<span class="badge">✓ Opción ${index + 1}</span>` : ''}</div>
    <div class="card-body">
      <div class="card-top"><h2 class="name">${esc(stay.nombre)}</h2><p class="price"><strong>${stay.precio} €</strong><span>/ noche</span></p></div>
      <p class="loc">${esc(stay.ubicacion)}</p>
      <p class="desc">${esc(stay.descripcion)}</p>
      <div class="chips">${chips(stay)}</div>
    </div>
    <button type="button" class="btn" data-act="toggle" data-id="${stay.id}" data-key="sel-${stay.id}" aria-pressed="${on}">${on ? '✓ Seleccionado · quitar' : 'Seleccionar'}</button>
  </article>`;
}

function yesNo(value) {
  return value ? '<span class="yes">✓ Sí</span>' : '<span class="no">— No</span>';
}

function compareTable(a, b) {
  const rows = [
    ['Por noche', (s) => `<strong class="p">${s.precio} €</strong>`],
    ['Ubicación', (s) => esc(s.ubicacion)],
    ...attributes.map((attr) => [attr.nombre, (s) => yesNo(s.servicios[attr.id])])
  ];
  const cell = (s, f) => (s ? f(s) : '<span class="empty">—</span>');
  return `<table class="cmp"><caption class="sr-only">Comparación de alojamientos</caption>
    <thead><tr><th scope="col" class="lbl">Comparar</th><th scope="col">${a ? esc(a.nombre) : 'Opción 1'}</th><th scope="col">${b ? esc(b.nombre) : 'Opción 2'}</th></tr></thead>
    <tbody>${rows.map(([label, f]) => `<tr><th scope="row">${esc(label)}</th><td>${cell(a, f)}</td><td>${cell(b, f)}</td></tr>`).join('')}</tbody></table>`;
}

function slotMedia(stay, i) {
  if (!stay) {
    return `<div class="slot-media placeholder-media"><span>Opción ${i + 1} · sin elegir</span></div>`;
  }
  return `<div class="slot-media"><img src="${stay.imagen}" alt="${esc(stay.nombre)}"><span class="badge">✓ Opción ${i + 1}</span></div>`;
}

function slotName(stay, i) {
  if (!stay) return `<p class="slot-name muted">Opción ${i + 1}</p><p class="slot-meta">Aún sin elegir.</p>`;
  return `<p class="slot-name">${esc(stay.nombre)}</p><p class="slot-meta">${stay.precio} € / noche · ${esc(stay.ubicacion)}</p>`;
}

function chooser(i, title) {
  const options = stays.filter((s) => !state.selected.includes(s.id));
  return `<div class="chooser" role="group" aria-label="${esc(title)}"><p class="chooser-title">${esc(title)}</p>
    ${options.map((s) => `<button type="button" class="pick" data-act="pick" data-slot="${i}" data-id="${s.id}" data-key="pick-${i}-${s.id}">
      <img src="${s.imagen}" alt=""><span><strong>${esc(s.nombre)}</strong><small>${s.precio} € / noche · ${esc(s.ubicacion)}</small></span><em>Elegir</em></button>`).join('')}
  </div>`;
}

// Acciones de un hueco: Cambiar/Quitar y, si procede, la lista para elegir o sustituir.
function slotControls(stay, i, withName) {
  const n = state.selected.length;
  let extra = '';
  if (stay && state.changing === i) extra = chooser(i, `Sustituir ${stay.nombre} por…`);
  else if (!stay && (i === 0 || state.selected[0])) extra = chooser(i, n === 0 ? 'Elige tu primera opción.' : 'Te falta una opción. Elige otro alojamiento para comparar.');
  else if (!stay) extra = '<p class="slot-meta">Elige primero la opción 1.</p>';
  const actions = stay ? `<div class="slot-actions">
      <button type="button" class="btn btn-sm" data-act="change" data-slot="${i}" data-key="change-${i}" aria-expanded="${state.changing === i}">${state.changing === i ? 'Cancelar' : 'Cambiar'}</button>
      <button type="button" class="btn btn-sm btn-ghost" data-act="remove" data-slot="${i}" data-id="${stay.id}" data-key="remove-${i}">Quitar</button>
    </div>` : '';
  return `<div class="ctl">${withName ? `<p class="ctl-name">${stay ? esc(stay.nombre) : `Opción ${i + 1}`}</p>` : ''}${actions}${extra}</div>`;
}

function referenceSection() {
  const r = state.reference;
  return `<section class="ref" aria-labelledby="ref-title">
    <div class="ref-head"><h2 id="ref-title" class="h2">Referencia para decidir</h2><p class="sub">Guarda algo que buscas mientras comparas. No es un alojamiento.</p></div>
    ${r ? `<div class="ref-card">
        <img class="ref-img" src="${r.src}" alt="Imagen de referencia guardada">
        <div class="ref-body">
          <label class="lbl-note" for="ref-note">Qué quieres recordar <small>(opcional)</small></label>
          <textarea id="ref-note" class="note" rows="2" placeholder="Busco una terraza como esta.">${esc(state.note)}</textarea>
          <div class="ref-foot"><span class="ref-ok">✓ Referencia guardada${r.name ? ` · ${esc(r.name)}` : ''}</span>
          <button type="button" class="btn btn-sm btn-ghost" data-act="ref-remove" data-key="ref-remove">Eliminar referencia</button></div>
        </div></div>`
      : `<div class="drop">
        <p class="drop-main"><span class="when-idle">↓ Suelta aquí una imagen de referencia</span><span class="when-over">Suelta para guardar esta referencia.</span></p>
        <p class="drop-sub">Desde la otra ventana, o</p>
        <button type="button" class="btn btn-sm" data-act="ref-pick" data-key="ref-pick">Elegir imagen</button>
        <input type="file" id="ref-file" accept="image/*" hidden>
      </div>`}
  </section>`;
}

// ---------- Vistas por contexto ----------
function viewClosed() {
  const n = state.selected.length;
  const foot = n === MAX_SELECTED
    ? '<strong>Tus dos opciones están listas.</strong> Activa Abierto para compararlas.'
    : n === 1 ? '<strong>Te falta una opción.</strong> Elige otro alojamiento para comparar.'
      : '<strong>Elige hasta dos alojamientos.</strong> Al abrir el móvil los compararás frente a frente.';
  return `<div class="screen screen-cerrado">${header('Elige tu escapada.', 'Tu selección se conserva entre estados.')}
    <section class="list" aria-label="Alojamientos">${stays.map(card).join('')}</section>
    <p class="foot" aria-live="polite">${foot}</p>
    ${state.reference ? `<p class="foot foot-ref"><img src="${state.reference.src}" alt="">Referencia guardada · la verás en Abierto.</p>` : ''}
  </div>`;
}

function viewOpen() {
  const a = slotStay(0), b = slotStay(1);
  return `<div class="screen screen-abierto">${header('Tus opciones, frente a frente.', 'Compara precio, ubicación y servicios. Sustituye una opción conservando la otra.')}
    <section class="compare" aria-label="Comparación">
      <div class="cols">
        <div class="slot">${slotMedia(a, 0)}${slotName(a, 0)}${slotControls(a, 0, false)}</div>
        <div class="slot">${slotMedia(b, 1)}${slotName(b, 1)}${slotControls(b, 1, false)}</div>
      </div>
      ${compareTable(a, b)}
    </section>
    ${referenceSection()}
  </div>`;
}

function viewFlex() {
  const a = slotStay(0), b = slotStay(1);
  const r = state.reference;
  return `<div class="screen screen-flex">
    <div class="pane pane-top">${header('Mira arriba. Decide a mano.', 'Tu selección se conserva entre estados.')}
      <div class="cols${r ? ' cols-3' : ''}">
        <div class="slot">${slotMedia(a, 0)}${slotName(a, 0)}</div>
        <div class="slot">${slotMedia(b, 1)}${slotName(b, 1)}</div>
        ${r ? `<div class="slot slot-ref"><div class="slot-media"><img src="${r.src}" alt="Imagen de referencia"><span class="badge badge-ref">Referencia</span></div><p class="slot-name">Tu referencia</p><p class="slot-meta">${state.note ? esc(state.note) : 'Guardada en Abierto.'}</p></div>` : ''}
      </div>
    </div>
    <div class="pane pane-gap" aria-hidden="true"></div>
    <div class="pane pane-bottom">
      <p class="kicker kicker-row"><span>A mano</span><span>Comparación y acciones</span></p>
      <div class="cols">${slotControls(a, 0, true)}${slotControls(b, 1, true)}</div>
      ${compareTable(a, b)}
    </div>
  </div>`;
}

// ---------- Render con continuidad del foco ----------
function render(focusKey) {
  const active = document.activeElement;
  const key = focusKey || (active && view.contains(active) ? active.dataset.key : null);
  const m = mode();
  view.className = 'mode-' + m;
  view.innerHTML = m === 'abierto' ? viewOpen() : m === 'flex' ? viewFlex() : viewClosed();
  if (!key) return;
  let target = view.querySelector(`[data-key="${CSS.escape(key)}"]`);
  // Si el control ya no existe (p. ej. se quitó una opción), pasa el foco a la lista para elegir de ese hueco.
  if (!target && /^(change|remove)-(\d)$/.test(key)) target = view.querySelector(`[data-key^="pick-${key.slice(-1)}-"]`);
  if (!target && key.startsWith('pick-')) target = view.querySelector(`[data-key="change-${key.split('-')[1]}"]`);
  if (!target && key === 'ref-remove') target = view.querySelector('[data-key="ref-pick"]');
  if (!target && key === 'ref-pick') target = view.querySelector('[data-key="ref-remove"]');
  if (target) target.focus();
}

// ---------- Acciones ----------
function toggle(id) {
  const stay = byId(id);
  const index = state.selected.indexOf(id);
  if (index >= 0) {
    state.selected.splice(index, 1);
    notify(`${stay.nombre} quitado de tu selección.`);
  } else if (state.selected.length >= MAX_SELECTED) {
    notify('Ya tienes dos. Quita una selección antes de añadir otra.');
    return;
  } else {
    state.selected.push(id);
    notify(`${stay.nombre} seleccionado · ${state.selected.length} de ${MAX_SELECTED}.`);
  }
  state.changing = null;
}

function pick(slot, id) {
  const previous = slotStay(slot);
  if (slot < state.selected.length) state.selected[slot] = id; else state.selected.push(id);
  state.changing = null;
  notify(previous ? `${previous.nombre} sustituido por ${byId(id).nombre}.` : `${byId(id).nombre} añadido a la comparación.`);
}

function remove(slot) {
  const stay = slotStay(slot);
  if (!stay) return;
  state.selected.splice(slot, 1);
  state.changing = null;
  notify(`${stay.nombre} quitado. Elige otro alojamiento para comparar.`);
}

function setReference(src, name) {
  state.reference = { src, name: name || '' };
  notify('Referencia guardada. La comparación se mantiene.');
  render('ref-remove');
}

function readImageFile(file) {
  const reader = new FileReader();
  reader.onload = () => setReference(reader.result, file.name);
  reader.onerror = () => notify('No se pudo leer el archivo. Prueba con otra imagen.');
  reader.readAsDataURL(file);
}

function handleDrop(dt) {
  const file = Array.from(dt.files || []).find((f) => f.type.startsWith('image/'));
  if (file) return readImageFile(file);
  const raw = dt.getData('text/uri-list') || dt.getData('text/plain') || '';
  const url = raw.split(/\r?\n/).map((l) => l.trim()).find((l) => l && !l.startsWith('#'));
  if (url && /^(https?|file|data|blob):/i.test(url)) {
    const name = url.startsWith('data:') ? 'imagen' : decodeURIComponent(url.split('/').pop().split('?')[0]);
    return setReference(url, name);
  }
  notify('Suelta una imagen o elige un archivo de imagen.');
}

view.addEventListener('click', (e) => {
  const button = e.target.closest('[data-act]');
  if (!button) return;
  const { act, id, slot } = button.dataset;
  const i = Number(slot);
  if (act === 'toggle') { toggle(id); render(`sel-${id}`); }
  else if (act === 'change') { state.changing = state.changing === i ? null : i; render(`change-${i}`); }
  else if (act === 'remove') { remove(i); render(`remove-${i}`); }
  else if (act === 'pick') { pick(i, id); render(`change-${i}`); }
  else if (act === 'ref-pick') { const input = document.getElementById('ref-file'); if (input) input.click(); }
  else if (act === 'ref-remove') { state.reference = null; state.note = ''; notify('Referencia eliminada. La comparación se mantiene.'); render('ref-pick'); }
});

view.addEventListener('change', (e) => {
  if (e.target.id !== 'ref-file') return;
  const file = e.target.files && e.target.files[0];
  if (file && file.type.startsWith('image/')) readImageFile(file);
  else if (file) notify('Elige un archivo de imagen.');
});

view.addEventListener('input', (e) => {
  if (e.target.id === 'ref-note') state.note = e.target.value;
});

// Arrastre: la zona receptora es toda la sección de referencia (en Abierto).
view.addEventListener('dragenter', (e) => { if (e.target.closest('.ref')) e.preventDefault(); });
view.addEventListener('dragover', (e) => {
  const zone = e.target.closest('.ref');
  if (!zone) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  zone.classList.add('is-over');
});
view.addEventListener('dragleave', (e) => {
  const zone = e.target.closest('.ref');
  if (zone && !zone.contains(e.relatedTarget)) zone.classList.remove('is-over');
});
view.addEventListener('drop', (e) => {
  const zone = e.target.closest('.ref');
  if (!zone) return;
  e.preventDefault();
  zone.classList.remove('is-over');
  handleDrop(e.dataTransfer);
});

// El entorno comunica el contexto sin recargar la página; el primer render lee foldState.
window.addEventListener('foldchange', () => render());
render();
