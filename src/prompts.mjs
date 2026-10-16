import {intentSchema,answerSchema,validateIntent,validateAnswer} from './contracts.mjs';
export {intentSchema,answerSchema,validateIntent,validateAnswer};
export function intentOptions(message){
 return {schema:intentSchema,system:`Convierte el mensaje en JSON. No ejecutes operaciones.
action: assign para asignar/reservar, release para liberar, query para preguntas.
query_type: count_available SOLO si pregunta CUÁNTOS dispositivos libres/disponibles quedan en total o de un modelo. No cuentes: el programa calcula el número. quantity y room_id null, device_ids [].
query_type: location SOLO para consultar la sala o ubicación actual de unidades con IDs explícitos. Extrae esos IDs en device_ids; quantity y room_id null. No adivines la sala: el programa consulta el inventario actual.
query_type: other para las demás preguntas (aforo, horarios, listas de dispositivos, información ausente, ubicación sin ID explícito); null para assign/release.
Catálogo de modelos: Fold8 => FOLD8; Fold8 Ultra => FOLD8_ULTRA; Flip8 => FLIP8.
model_id también se extrae en preguntas: si se menciona una familia, conserva su ID como filtro. Solo es null si no se menciona ninguna. "Dispositivos" o "unidades" sin familia significa todos.
Catálogo de salas: Azul => AZUL; Verde => VERDE; Prensa => PRENSA; Taller => TALLER.
quantity es el número solicitado (un=1, dos=2). Campos no mencionados: null. IDs explícitos en device_ids, si no hay [].
Copia los IDs explícitos en device_ids. Un ID no cuenta como mención de familia: si el mensaje solo nombra IDs, model_id debe ser null. Extrae model_id solo de nombres de familia escritos (Fold8, Fold8 Ultra o Flip8), también si aparecen junto a IDs. El backend valida los IDs con el inventario. Nunca inventes IDs.
Ejemplo: "Asigna un Flip8 a Verde" => {"action":"assign","query_type":null,"model_id":"FLIP8","quantity":1,"room_id":"VERDE","device_ids":[]}
Ejemplo: "Libera F8-02" => {"action":"release","query_type":null,"model_id":null,"quantity":null,"room_id":null,"device_ids":["F8-02"]}
Ejemplo: "Asigna dos Fold8" => {"action":"assign","query_type":null,"model_id":"FOLD8","quantity":2,"room_id":null,"device_ids":[]}
Ejemplo: "¿Cuál es el horario?" => {"action":"query","query_type":"other","model_id":null,"quantity":null,"room_id":null,"device_ids":[]}
Ejemplo: "¿Cuántos dispositivos están libres?" => {"action":"query","query_type":"count_available","model_id":null,"quantity":null,"room_id":null,"device_ids":[]}
Ejemplo: "Dime el número de Flip8 disponibles." => {"action":"query","query_type":"count_available","model_id":"FLIP8","quantity":null,"room_id":null,"device_ids":[]}
Ejemplo: "¿Cuántos Fold8 están disponibles?" => {"action":"query","model_id":"FOLD8","quantity":null,"room_id":null,"device_ids":[],"query_type":"count_available"}
Ejemplo: "Número de Fold8 Ultra libres" => {"action":"query","model_id":"FOLD8_ULTRA","quantity":null,"room_id":null,"device_ids":[],"query_type":"count_available"}
Ejemplo: "¿Dónde está FP8-02?" => {"action":"query","model_id":null,"quantity":null,"room_id":null,"device_ids":["FP8-02"],"query_type":"location"}
Si un nombre no aparece en el catálogo usa UNKNOWN. No confundas Fold8 con Fold8 Ultra.`,user:message};
}
export function answerOptions(message,dossier,inventory){
 return {schema:answerSchema,system:`Contesta preguntas con datos verificables. Usa solo el contexto recibido. Devuelve JSON.
Para aforo y horario devuelve facts con capacity (número), opens y closes (HH:MM); subject es ID de sala.
Para ubicación devuelve room_id; subject es ID de unidad, value es ID de sala, source SIEMPRE inventory.
Cada hecho tiene source (D01..D08 o inventory); sources contiene sus referencias. Las unidades no proceden del dossier.
status: found si puedes responder con datos del contexto, not_found si el dato no está disponible.
Si status es not_found, facts y sources deben ser []. El programa mostrará su propio aviso, no tu texto libre.
Ejemplos de FORMATO con datos distintos:
Pregunta: aforo y horario de Ámbar. Contexto D99: Ámbar aforo 9, abierta 10:00-11:00.
Respuesta: {"status":"found","facts":[{"subject":"AMBAR","field":"capacity","value":9,"source":"D99"},{"subject":"AMBAR","field":"opens","value":"10:00","source":"D99"},{"subject":"AMBAR","field":"closes","value":"11:00","source":"D99"}],"sources":[{"type":"dossier","id":"D99"}],"answer":"Admite 9 personas; abre de 10:00 a 11:00."}
Pregunta: dónde está X-99. Inventario: X-99 asignado a AMBAR.
Respuesta: {"status":"found","facts":[{"subject":"X-99","field":"room_id","value":"AMBAR","source":"inventory"}],"sources":[{"type":"inventory","id":null}],"answer":"X-99 está en Ámbar."}
Pregunta: teléfono del restaurante. Contexto sin teléfono.
Respuesta: {"status":"not_found","facts":[],"sources":[],"answer":"No consta en la información disponible."}
No uses estos datos de ejemplo: utiliza únicamente el contexto real y responde la pregunta real.`,
 user:'CONTEXTO REAL:\n'+JSON.stringify({dossier,inventory})+'\nPREGUNTA REAL:\n'+message};
}
