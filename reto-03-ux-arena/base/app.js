(() => {
  'use strict';
  const app = document.getElementById('app');
  const homes = window.alojamientos;
  const state = { selected: [], reference: null, referenceName: '', saved: false };
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = value => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  const status = document.createElement('div');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  app.after(status);
  function announce(message) { status.textContent = message; }
  function brand() { return '<div class="brand"><span class="brand-mark" aria-hidden="true">s.</span> soria, sin prisa<span class="edition">ESCAPADAS LOCALES</span></div>'; }
  function heading() { return `${brand()}<div class="intro"><p class="eyebrow">UN POCO MÁS CERCA DE DESCONECTAR</p><h1>Tu próxima <em>pausa.</em></h1><p>Tres refugios en Soria. Encuentra el tuyo.</p><div class="destination"><span aria-hidden="true">⌖</span> Soria y alrededores <span class="destination-tag">3 alojamientos</span></div></div>`; }
  function card(home, index) {
    const chosen = state.selected.includes(home.id);
    const amenities = window.atributos.filter(attr => home.servicios[attr.id]).slice(0, 3).map(attr => attr.nombre).join(' · ');
    return `<article class="stay-card"><div class="stay-picture"><img src="${escape(home.imagen)}" alt="Ilustración de ${escape(home.nombre)}"><span class="picture-label">${['ENTRE PINOS', 'VIDA DE PUEBLO', 'AIRE DE MONTAÑA'][index]}</span><span class="picture-number">0${index + 1}</span></div><div class="stay-content"><div class="stay-title"><h2>${escape(home.nombre)}</h2><p class="price">${money(home.precio)}<small>/ noche</small></p></div><p class="location">${escape(home.ubicacion)}</p><p class="description">${escape(home.descripcion)}</p><div class="card-bottom"><span class="amenities">${amenities}</span><button class="select-button ${chosen ? 'chosen' : ''}" data-select="${home.id}" data-focus="select-${home.id}" aria-label="${chosen ? 'Quitar' : 'Seleccionar'} ${escape(home.nombre)}" aria-pressed="${chosen}" ${!chosen && state.selected.filter(Boolean).length === 2 ? 'aria-disabled="true"' : ''}>${chosen ? '✓ Seleccionado' : '+ Seleccionar'}</button></div></div></article>`;
  }
  function switcher(index) {
    return `<label class="slot-control"><span>ALOJAMIENTO 0${index + 1}</span><select aria-label="Cambiar alojamiento ${index + 1}" data-slot="${index}" data-focus="slot-${index}"><option value="">Elegir alojamiento</option>${homes.map(home => `<option value="${home.id}" ${state.selected[index] === home.id ? 'selected' : ''} ${state.selected.some((id, i) => id === home.id && i !== index) ? 'disabled' : ''}>${escape(home.nombre)}</option>`).join('')}</select></label>`;
  }
  function comparison() {
    const pair = [0, 1].map(index => homes.find(home => home.id === state.selected[index]));
    return `<div class="comparison-slots">${switcher(0)}${switcher(1)}</div><div class="table-wrap"><table><caption class="sr-only">Comparación de precio, ubicación y servicios de los alojamientos seleccionados</caption><thead><tr><th scope="col">Tu escapada</th>${pair.map(home => `<th scope="col">${home ? escape(home.nombre) : 'Sin seleccionar'}</th>`).join('')}</tr></thead><tbody><tr class="price-row"><th scope="row">Por noche</th>${pair.map(home => `<td>${home ? money(home.precio) : '—'}</td>`).join('')}</tr><tr><th scope="row">Ubicación</th>${pair.map(home => `<td>${home ? escape(home.ubicacion) : '—'}</td>`).join('')}</tr>${window.atributos.map(attr => `<tr><th scope="row">${escape(attr.nombre)}</th>${pair.map(home => `<td>${home ? home.servicios[attr.id] ? '<span class="yes">✓ <span class="service-word">Sí</span></span>' : '<span class="no">— <span class="service-word">No</span></span>' : '—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function reference() {
    return `<section class="reference-panel" aria-labelledby="reference-title"><div class="reference-copy"><p class="eyebrow">TU MOODBOARD</p><h2 id="reference-title">Una idea para llevarte.</h2><p>${state.reference ? 'Tu inspiración sigue aquí, junto a tus opciones.' : '¿Una terraza con vistas? Guarda esa imagen mientras decides.'}</p></div><div class="dropzone" data-drop>${state.reference ? `<img src="${escape(state.reference)}" alt="Imagen de inspiración: ${escape(state.referenceName)}"><div class="reference-actions"><span>Referencia guardada</span><button class="text-button" data-action="remove-reference" data-focus="remove-reference">Eliminar imagen</button></div>` : '<span class="drop-icon" aria-hidden="true">↧</span><span>Arrastra aquí tu inspiración</span><span class="file-hint">JPG, PNG, WebP o SVG · hasta 10 MB</span>'}<label class="file-button">${state.reference ? 'Cambiar imagen' : 'Elegir imagen'}<input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" aria-label="Elegir imagen de referencia" data-file data-focus="file"></label></div></section>`;
  }
  function actionBar(closed) {
    const count = state.selected.filter(Boolean).length;
    return `<footer class="action-bar"><div><strong>${closed ? `${count} de 2 seleccionados` : state.saved ? '✓ Tu selección está lista' : 'Tu escapada empieza aquí'}</strong><span>${closed ? count === 2 ? 'Todo listo para comparar.' : 'Elige tus favoritos para comparar.' : state.saved ? 'Guardada durante esta visita.' : 'Sin reservas. Sin compromisos.'}</span></div><button class="primary-button" data-action="${closed ? 'compare' : 'save'}" data-focus="primary" ${count !== 2 ? 'disabled' : ''}>${closed ? 'Comparar' : state.saved ? 'Selección guardada ✓' : 'Guardar selección'} <span aria-hidden="true">↗</span></button></footer>`;
  }
  function render(focusKey) {
    const mode = window.foldState.mode;
    app.className = `travel-app mode-${mode}`;
    if (mode === 'cerrado') {
      app.innerHTML = `<div class="browse-panel">${heading()}<div class="list-heading"><h2>Pequeños lugares, grandes pausas</h2><span>01 — 03</span></div><div class="stay-list">${homes.map(card).join('')}</div><p class="end-note">Hecho para ir despacio. Y elegir bien.</p></div>${actionBar(true)}`;
    } else if (mode === 'abierto') {
      app.innerHTML = `<div class="open-panel">${brand()}<header class="compare-heading"><div><p class="eyebrow">DOS FORMAS DE DESCONECTAR</p><h1>Elige tu <em>lugar.</em></h1></div><span class="selection-pill">${state.selected.filter(Boolean).length} / 2 elegidos</span></header>${comparison()}${reference()}</div>${actionBar(false)}`;
    } else {
      const pair = state.selected.filter(Boolean).map(id => homes.find(home => home.id === id));
      app.innerHTML = `<section class="flex-top" aria-label="Imágenes de los alojamientos">${brand()}<div class="flex-heading"><h1>Imagina estar <em>aquí.</em></h1><span>SORIA · A TU RITMO</span></div><div class="flex-gallery">${pair.length ? pair.map(home => `<figure><img src="${escape(home.imagen)}" alt="Ilustración de ${escape(home.nombre)}"><figcaption>${escape(home.nombre)}<span>${money(home.precio)} / noche</span></figcaption></figure>`).join('') : '<div class="empty-gallery"><p>Tu escapada, todavía por imaginar.</p><span>Elige dos alojamientos en los controles de abajo.</span></div>'}</div></section><div class="fold-space" aria-hidden="true"></div><section class="flex-bottom" aria-label="Comparación y acciones"><div class="flex-comparison"><div class="flex-section-title"><h2>Los detalles marcan la diferencia.</h2><span>COMPARA Y ELIGE</span></div>${comparison()}</div>${actionBar(false)}</section>`;
    }
    if (focusKey) app.querySelector(`[data-focus="${focusKey}"]`)?.focus({ preventScroll: true });
  }
  app.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.select) {
      const id = button.dataset.select;
      if (state.selected.includes(id)) state.selected = state.selected.filter(value => value !== id);
      else if (state.selected.filter(Boolean).length < 2) { const empty = state.selected.findIndex(value => !value); if (empty >= 0) state.selected[empty] = id; else state.selected.push(id); }
      else { announce('Ya hay dos alojamientos seleccionados. Quita uno antes de elegir otro.'); return; }
      state.saved = false;
      const scroll = app.querySelector('.browse-panel').scrollTop;
      render(button.dataset.focus);
      app.querySelector('.browse-panel').scrollTop = scroll;
      announce(`${state.selected.filter(Boolean).length} de 2 alojamientos seleccionados.`);
    } else if (button.dataset.action === 'compare') {
      document.querySelector('[data-set="abierto"]').click();
      app.querySelector('[data-slot]')?.focus();
    } else if (button.dataset.action === 'save') {
      state.saved = true; render('primary'); announce('Selección guardada durante esta visita. No se ha realizado ninguna reserva.');
    } else if (button.dataset.action === 'remove-reference') {
      clearReference(); render('file'); announce('Imagen de referencia eliminada.');
    }
  });
  app.addEventListener('change', event => {
    if (event.target.matches('[data-slot]')) {
      const index = Number(event.target.dataset.slot);
      const value = event.target.value;
      if (value && state.selected.some((id, i) => id === value && i !== index)) return;
      state.selected[index] = value;
      state.saved = false; render(`slot-${index}`); announce('Comparación actualizada.');
    } else if (event.target.matches('[data-file]') && event.target.files[0]) importFile(event.target.files[0]);
  });
  function clearReference() {
    if (state.reference?.startsWith('blob:')) URL.revokeObjectURL(state.reference);
    state.reference = null; state.referenceName = '';
  }
  function importFile(file) {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      announce('Elige una imagen JPG, PNG, WebP o SVG de hasta 10 MB.');
      const hint = app.querySelector('.file-hint');
      if (hint) hint.textContent = 'Formato no admitido o imagen de más de 10 MB.';
      return;
    }
    clearReference(); state.reference = URL.createObjectURL(file); state.referenceName = file.name;
    render('file'); announce('Imagen de referencia añadida.');
  }
  app.addEventListener('dragover', event => {
    const zone = event.target.closest('[data-drop]');
    if (zone) { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; zone.classList.add('dragging'); }
  });
  app.addEventListener('dragleave', event => {
    const zone = event.target.closest('[data-drop]');
    if (zone && !zone.contains(event.relatedTarget)) zone.classList.remove('dragging');
  });
  app.addEventListener('drop', event => {
    const zone = event.target.closest('[data-drop]');
    if (!zone) return;
    event.preventDefault(); zone.classList.remove('dragging');
    if (event.dataTransfer.files.length) { importFile(event.dataTransfer.files[0]); return; }
    const raw = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain');
    try {
      const url = new URL(raw.split('\n').find(line => line.trim() && !line.startsWith('#')).trim(), location.href);
      const supplied = new URL(document.getElementById('source-image').src, location.href);
      if (url.href !== supplied.href) throw new Error('Unsupported reference');
      clearReference(); state.reference = url.href; state.referenceName = 'Terraza con vistas a la montaña';
      render('file'); announce('Terraza añadida como referencia.');
    } catch { announce('Arrastra la terraza suministrada o elige una imagen de tu dispositivo.'); }
  });
  window.addEventListener('foldchange', () => render());
  render();
})();
