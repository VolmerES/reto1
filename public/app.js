const $ = (id) => document.getElementById(id);
let currentInventory = null;
let busy = false;
let requestTimeout = 55000;
let records = [];
let changedIds = [];
let refreshing = false;

function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = String(text);
  return el;
}
function announce(message) {
  $('notice').textContent = message;
  $('notice').hidden = !message;
}
function record(entry) {
  records.push({ at: new Date().toISOString(), ...entry });
  records = records.slice(-100);
  $('debug-output').textContent = JSON.stringify(entry, null, 2);
}
async function api(path, body, timeout = 10000) {
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
    });
    let data;
    try { data = await response.json(); }
    catch { throw new Error('El backend no ha devuelto JSON válido.'); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('El backend debe devolver un objeto JSON.');
    record({ path, request: body ?? null, http_status: response.status, duration_ms: Math.round(performance.now() - started), response: data });
    if (!response.ok || data.ok !== true) {
      const error = new Error(typeof data.message === 'string' ? data.message : 'La petición no se ha completado.');
      error.code = data.error;
      error.data = data;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      record({ path, request: body ?? null, error: 'CLIENT_TIMEOUT', duration_ms: Math.round(performance.now() - started) });
      throw new Error('Se agotó la espera. No hay confirmación de la operación; consulta el inventario antes de repetirla.');
    }
    if (error instanceof TypeError) {
      record({ path, request: body ?? null, error: 'NETWORK_ERROR' });
      throw new Error('No se pudo conectar con el servidor. No hay confirmación de la operación.');
    }
    throw error;
  } finally { clearTimeout(timer); }
}
function setBusy(value) {
  busy = value;
  $('send').disabled = value;
  $('reset').disabled = value || !currentInventory;
  $('refresh').disabled = value || refreshing;
  $('prompt').readOnly = value;
  $('message-form').setAttribute('aria-busy', String(value));
  $('request-status').textContent = value ? 'Procesando en el backend…' : 'Enter para enviar · Mayús + Enter para nueva línea';
  $('send').textContent = value ? 'Procesando…' : 'Enviar ↗';
}
function badge(text, kind) {
  $('connection-badge').textContent = text;
  $('connection-badge').className = 'badge ' + kind;
}
function validateInventory(inventory) {
  if (!inventory || !Array.isArray(inventory.models) || !Array.isArray(inventory.rooms) || !Array.isArray(inventory.devices)) throw new Error('Inventario incompatible: consulta API.md.');
  const models = new Set();
  const rooms = new Set();
  const devices = new Set();
  for (const item of inventory.models) {
    if (typeof item.id !== 'string' || typeof item.name !== 'string' || models.has(item.id)) throw new Error('Catálogo de modelos inválido.');
    models.add(item.id);
  }
  for (const item of inventory.rooms) {
    if (typeof item.id !== 'string' || typeof item.name !== 'string' || rooms.has(item.id)) throw new Error('Catálogo de salas inválido.');
    rooms.add(item.id);
  }
  for (const device of inventory.devices) {
    if (typeof device.id !== 'string' || devices.has(device.id) || !models.has(device.model_id)
      || !['available', 'assigned'].includes(device.status)
      || (device.status === 'available' ? device.room_id !== null : !rooms.has(device.room_id))) throw new Error('El backend devolvió un inventario incoherente.');
    devices.add(device.id);
  }
  return inventory;
}
function option(value, text) { const el = node('option', '', text); el.value = value; return el; }
function acceptInventory(inventory) {
  validateInventory(inventory);
  currentInventory = inventory;
  const modelFilter = $('model-filter').value;
  const roomFilter = $('room-filter').value;
  $('model-filter').replaceChildren(option('', 'Todos los modelos'), ...inventory.models.map((m) => option(m.id, m.name.replace('Samsung Galaxy Z ', ''))));
  $('room-filter').replaceChildren(option('', 'Todas las salas'), option('available', 'Sin asignar'), ...inventory.rooms.map((r) => option(r.id, r.name)));
  if (inventory.models.some((m) => m.id === modelFilter)) $('model-filter').value = modelFilter;
  if (roomFilter === 'available' || inventory.rooms.some((r) => r.id === roomFilter)) $('room-filter').value = roomFilter;
  $('total-count').textContent = inventory.devices.length;
  $('free-count').textContent = inventory.devices.filter((d) => d.status === 'available').length;
  $('assigned-count').textContent = inventory.devices.filter((d) => d.status === 'assigned').length;
  $('updated-at').textContent = 'Consultado ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  $('reset').disabled = busy;
  renderInventory();
}
function renderInventory() {
  if (!currentInventory) return;
  const { models, rooms, devices } = currentInventory;
  const filtered = devices.filter((d) => (!$('model-filter').value || d.model_id === $('model-filter').value) && (!$('room-filter').value || ($('room-filter').value === 'available' ? d.status === 'available' : d.room_id === $('room-filter').value)));
  $('device-list').replaceChildren();
  for (const device of filtered) {
    const row = node('tr', changedIds.includes(device.id) ? 'changed' : '');
    const identity = node('td');
    identity.append(node('strong', '', device.id), node('small', '', models.find((m) => m.id === device.model_id).name.replace('Samsung Galaxy Z ', 'Galaxy Z ')));
    const status = node('td');
    status.append(node('span', 'device-status ' + device.status, device.status === 'available' ? 'Disponible' : 'Asignado'));
    row.append(identity, status, node('td', '', rooms.find((r) => r.id === device.room_id)?.name ?? 'Sin asignar'));
    $('device-list').append(row);
  }
  if (!filtered.length) {
    const row = node('tr'); const cell = node('td', 'empty', 'No hay unidades con estos filtros.'); cell.colSpan = 3; row.append(cell); $('device-list').append(row);
  }
  $('room-list').replaceChildren(...rooms.map((room) => {
    const card = node('div', 'room');
    card.append(node('span', '', room.name), node('strong', '', devices.filter((d) => d.room_id === room.id).length), node('small', '', 'unidades'));
    return card;
  }));
}
function renderDossier(items) {
  if (!Array.isArray(items) || items.some((d) => typeof d.id !== 'string' || typeof d.title !== 'string' || typeof d.text !== 'string')) throw new Error('Dossier incompatible: consulta API.md.');
  $('dossier-count').textContent = items.length + ' fichas';
  $('dossier-list').replaceChildren(...items.map((item) => {
    const el = node('article', 'dossier-card');
    el.append(node('span', 'eyebrow', item.id), node('strong', '', item.title), node('p', '', item.text));
    return el;
  }));
}
function addMessage(text, kind = 'assistant', data) {
  const el = node('article', 'message ' + kind);
  el.append(node('p', 'message-label', kind === 'user' ? 'TÚ / PRODUCCIÓN' : kind === 'error' ? 'SOLICITUD SIN CONFIRMAR' : kind === 'system' ? 'INFORMACIÓN' : 'ASISTENTE / BACKEND'));
  el.append(node('p', '', text));
  if (data?.sources?.length) {
    const sources = node('div', 'source-list');
    for (const source of data.sources) {
      if (source.type === 'dossier' && typeof source.id === 'string') sources.append(node('span', 'source-tag', 'Dossier · ' + source.id));
      if (source.type === 'inventory') sources.append(node('span', 'source-tag', 'Inventario actual'));
      if (source.type === 'user_input') sources.append(node('span', 'source-tag', 'Dato aportado por el usuario'));
    }
    el.append(sources);
  }
  if (data?.operation) {
    const op = data.operation;
    const lines = [
      op.ok === true ? 'Operación confirmada por el backend' : 'Operación rechazada',
      op.operation_id ? 'Operación: ' + op.operation_id : '',
      op.action ? 'Acción: ' + op.action : '',
      Array.isArray(op.device_ids) ? 'Unidades: ' + op.device_ids.join(', ') : '',
      op.room_id ? 'Sala: ' + op.room_id : '',
      Number.isInteger(op.remaining_available) ? 'Disponibles del modelo: ' + op.remaining_available : '',
      typeof op.reason === 'string' ? op.reason : '',
    ].filter(Boolean);
    el.append(node('div', 'operation', lines.join('\n')));
  }
  if (data?.facts?.length) {
    const facts = node('details'); facts.append(node('summary', '', 'Ver datos estructurados'), node('pre', '', JSON.stringify(data.facts, null, 2))); el.append(facts);
  }
  $('messages').append(el);
  $('messages').scrollTop = $('messages').scrollHeight;
}
async function refreshInventory() {
  try {
    const data = await api('/api/inventory');
    acceptInventory(data.inventory);
    return true;
  } catch (error) {
    announce('No se pudo actualizar el inventario: ' + error.message);
    return false;
  }
}
async function refresh() {
  if (busy || refreshing) return;
  refreshing = true; $('refresh').disabled = true;
  announce('');
  const results = await Promise.allSettled([
    (async () => {
      const data = await api('/api/status');
      $('model-name').textContent = typeof data.model === 'string' ? data.model : 'Modelo sin configurar';
      if (typeof data.request_timeout_ms === 'number' && data.request_timeout_ms >= 1000 && data.request_timeout_ms <= 110000) requestTimeout = data.request_timeout_ms;
      if (data.model_available === false) badge('Modelo no disponible', 'bad');
      else if (data.model_available === true && data.inference_verified === true) badge('Inferencia comprobada', 'good');
      else if (data.model_available === true) badge('Modelo disponible · sin inferencia', 'neutral');
      else badge('Backend disponible · modelo sin comprobar', 'neutral');
    })(),
    refreshInventory(),
    (async () => { const data = await api('/api/dossier'); renderDossier(data.dossier); })(),
  ]);
  if (results[0].status === 'rejected') {
    const error = results[0].reason;
    badge(error.code === 'MISSION_PENDING' ? 'Backend pendiente' : 'Backend sin conexión', 'warn');
    $('model-name').textContent = 'Completa la conexión con tu servicio';
    announce(error.message);
  }
  if (results[2].status === 'rejected') {
    $('dossier-count').textContent = 'No disponible';
    $('dossier-list').replaceChildren(node('p', 'quiet', results[2].reason.message));
  }
  refreshing = false; $('refresh').disabled = busy;
}
$('message-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy || refreshing) return;
  const message = $('prompt').value.trim();
  if (!message) { $('prompt').focus(); return; }
  setBusy(true); announce(''); changedIds = [];
  addMessage(message, 'user'); $('prompt').value = '';
  let messageRecord;
  try {
    const data = await api('/api/message', { message, request_id: crypto.randomUUID() }, requestTimeout);
    messageRecord = records.at(-1);
    if (typeof data.answer !== 'string' || !data.answer.trim() || !Array.isArray(data.sources)
      || data.sources.some((source) => !source || !['dossier', 'inventory', 'user_input'].includes(source.type) || (source.type === 'dossier' && !/^D0[1-8]$/.test(source.id)))) throw new Error('Respuesta incompatible: se esperan answer y sources según API.md.');
    if (data.operation && (data.operation.ok !== true && data.operation.ok !== false)) throw new Error('La operación no incluye una confirmación válida.');
    if (data.operation?.ok === true && (typeof data.operation.operation_id !== 'string' || !['assign', 'release'].includes(data.operation.action) || !Array.isArray(data.operation.device_ids))) throw new Error('La confirmación de la operación está incompleta.');
    changedIds = data.operation?.ok === true ? data.operation.device_ids : [];
    addMessage(data.answer, data.operation?.ok === false ? 'error' : 'assistant', data);
  } catch (error) {
    messageRecord = records.at(-1);
    addMessage(error.code === 'MISSION_PENDING' ? 'Misión pendiente. ' + error.message : error.message, error.code === 'MISSION_PENDING' ? 'system' : 'error');
  } finally {
    await refreshInventory();
    if (messageRecord) $('debug-output').textContent = JSON.stringify(messageRecord, null, 2);
    setBusy(false); $('prompt').focus();
  }
});
$('prompt').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); $('message-form').requestSubmit(); }
});
document.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => {
  if (!busy) { $('prompt').value = button.dataset.prompt; $('prompt').focus(); }
}));
$('model-filter').addEventListener('change', renderInventory);
$('room-filter').addEventListener('change', renderInventory);
$('refresh').addEventListener('click', refresh);
$('reset').addEventListener('click', async () => {
  if (busy || !confirm('¿Restablecer las ocho unidades al inventario inicial? Se perderán las asignaciones de esta ejecución.')) return;
  setBusy(true); announce(''); changedIds = [];
  try {
    const data = await api('/api/reset', { confirm: true });
    if (!data.inventory) throw new Error('El backend no devolvió el inventario restablecido.');
    acceptInventory(data.inventory);
    addMessage('El backend ha confirmado el restablecimiento del inventario.', 'system');
  } catch (error) { addMessage(error.message, 'error'); await refreshInventory(); }
  finally { setBusy(false); }
});
$('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ frontend: '1.0.0', note: 'Registro del navegador. No demuestra por sí solo inferencia real.', records }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = node('a'); a.href = url; a.download = 'operacion-galaxy-registro.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
await refresh();
