# API: frontend y backend unidos

Todas las rutas son del mismo origen. npm start sirve la interfaz y la API en 127.0.0.1:3030.
JSON, no-store, sin CORS externo, máximo 16 KiB por cuerpo. No se sirve src/, .env ni scripts/.
Las rutas están preparadas. El trabajo de código se concentra en las cuatro funciones de src/actions/. La normalización ya está resuelta.

## GET /api/status
{ok:true, model:string, model_available:boolean, inference_verified:boolean, request_timeout_ms:number}.
Disponibilidad en catálogo no implica inferencia. inference_verified se activa tras recibir una respuesta del modelo configurado en este proceso.
El navegador espera 2 * MODEL_TIMEOUT_MS + 15000 ms: 55000 por defecto. No hay proxy.

## GET /api/inventory
{ok:true,inventory:{models:[],rooms:[],devices:[]}}.
Datos completos iniciales en src/data.mjs. Una unidad available tiene room_id null; assigned tiene sala válida.
El frontend muestra el estado del backend y detecta inconsistencias.

## GET /api/dossier
{ok:true,dossier:[{id,title,text},...]} con las ocho fichas D01..D08.

## POST /api/message
Entrada: {message:string,request_id:string}. Texto no vacío, máximo 2000 caracteres; request_id de 8 a 100 letras, números, guiones o guiones bajos.
Mismo ID y texto: respuesta ya registrada, sin otra operación; otro texto con el mismo ID: 409 REQUEST_CONFLICT.

Respuesta:
```json
{
  "ok":true,
  "answer":"Asignadas: F8-01, F8-02",
  "sources":[{"type":"inventory"}],
  "intent":{"action":"assign","query_type":null,"model_id":"FOLD8","quantity":2,"room_id":"AZUL","device_ids":[],"missing":[]},
  "facts":[],
  "operation":{"ok":true,"action":"assign","operation_id":"OP-001","device_ids":["F8-01","F8-02"],"room_id":"AZUL","model_id":"FOLD8","remaining_available":0},
  "calls":[]
}
```

calls contiene la evidencia real (request_id, model, returned_model, duration_ms, outcome y output). El ejemplo abrevia calls; en una petición de lenguaje real no está vacío.
Una consulta o datos insuficientes devuelve operation:null. Un rechazo de stock devuelve HTTP 200 y operation.ok:false, sin operation_id y debe conservar el inventario.

Intención: action assign/release/query; model_id FOLD8/FOLD8_ULTRA/FLIP8, room_id AZUL/VERDE/PRENSA/TALLER. Datos ausentes null; nombre fuera del catálogo UNKNOWN (el servicio lo rechaza). device_ids es array, nunca IDs inventados. La normalización añade missing.

query_type es obligatorio: count_available para contar dispositivos libres en total o de un modelo; location para ubicación actual de unidades identificadas; other para otras preguntas; null para assign/release. count_available lleva quantity y room_id null y device_ids vacío. El modelo interpreta la petición sin recibir ni calcular el stock. El backend cuenta status available en el inventario actual y genera answer, status found, sources inventory y el hecho available con subject TOTAL o el ID del modelo. No llama a answer para este recuento; sigue siendo necesaria la inferencia real de interpret. Las listas de unidades y las consultas de aforo/horario/dossier siguen por other.

location requiere device_ids explícitos, no vacíos y sin duplicados; quantity y room_id son null. El modelo clasifica y extrae los IDs, pero no decide su sala. locationAnswer consulta la instantánea actual del inventario y devuelve status found, sources inventory y un hecho room_id por unidad. Un valor null significa que la unidad existe y no tiene sala, no ausencia de información. IDs inexistentes o modelo incompatible devuelven INVALID_INPUT, sin respuesta parcial ni cambios. No llama a answer ni modifica el inventario; calls conserva la inferencia original. Preguntas sin un ID explícito siguen por other.

Tras validar la inferencia, availabilityIntent conserva la familia explícita del mensaje en los recuentos, consultas de ubicación y reservas/liberaciones con IDs explícitos: Fold8, Fold8 Ultra o Flip8 (sin distinguir mayúsculas y admitiendo espacio antes del 8). Ultra se reconoce como familia distinta, no como Fold8. La intención devuelta por la API incluye el filtro normalizado; calls conserva íntegra la salida original del modelo, sin reescribir la evidencia. Si no se menciona una familia reconocida, se mantiene el filtro interpretado. Referencias Fold/Flip con versión desconocida, varias familias o exclusiones explícitas se rechazan con INVALID_INPUT, sin ejecutar la petición ni cambiar el stock. Esta normalización preparada no clasifica la acción, no reemplaza la inferencia ni completa interpret.

Cuando el mensaje solo contiene IDs, el prompt indica model_id:null: la familia real procede del inventario. Si se escribe también una familia, se conserva y se comprueba su compatibilidad con los IDs. El cliente preparado usa reasoning_effort:none y conserva el límite de dos llamadas.

facts y fuentes: ver ENUNCIADO.md y src/contracts.mjs. Para horarios, opens y closes van juntos. Ubicaciones y disponibilidad usan source inventory; los hechos del dossier usan D01..D08. Se comprueban valores estructurados, no números encontrados en prosa.

Las consultas añaden `status: "found" | "not_found"`, decidido por el modelo en las consultas other y por el programa en recuentos y ubicaciones. `found` requiere datos y fuentes; `not_found` exige ambos arrays vacíos. El backend valida el estado y sustituye siempre el texto libre de `not_found` por «Ese dato no está disponible en el dossier ni en el inventario.». No se exige esa frase al modelo. Las operaciones de reserva/liberación no necesitan este campo.

La salida original del modelo se conserva únicamente como evidencia técnica en `calls`; no se usa como respuesta del asistente cuando el estado es `not_found`.

## POST /api/reset
Entrada {confirm:true}. Respuesta {ok:true,inventory:{...}}. Reinicia solo el inventario ficticio y el historial de IDs de petición. Reiniciar el proceso también restablece el estado; una recarga del navegador no.

## Errores
{ok:false,error:string,message:string,calls:[]}.
400 INVALID_INPUT/INVALID_JSON, 403 ORIGIN_REJECTED, 409 REQUEST_CONFLICT, 413 BODY_TOO_LARGE,
501 NOT_IMPLEMENTED, 502 MODEL_OUTPUT_INVALID/MODEL_CALL_LIMIT, 503 MODEL_UNAVAILABLE/MODEL_CONFIG_MISSING/MODEL_CONFIG_INVALID, 504 MODEL_TIMEOUT.

El cliente permite dos llamadas totales por petición. Solo una salida inválida admite reparación si queda presupuesto; timeout/indisponibilidad no se reintentan. Una consulta integrada suele consumir dos llamadas: interpretación y respuesta, sin tercera llamada posible.
Las peticiones inválidas se rechazan antes de inferir. El servicio nunca ejecuta código generado por el modelo. Errores de inferencia no mutan inventario.
