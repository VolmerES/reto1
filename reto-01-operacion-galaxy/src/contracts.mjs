import {fail} from './errors.mjs';
export const NOT_FOUND_ANSWER='Ese dato no está disponible en el dossier ni en el inventario.';
const nullableString={type:['string','null']};
export const intentSchema={type:'object',additionalProperties:false,required:['action','model_id','quantity','room_id','device_ids','query_type'],properties:{
 action:{type:'string',enum:['assign','release','query']},model_id:{type:['string','null'],enum:['FOLD8','FOLD8_ULTRA','FLIP8','UNKNOWN',null]},
 quantity:{type:['integer','null']},room_id:{type:['string','null'],enum:['AZUL','VERDE','PRENSA','TALLER','UNKNOWN',null]},device_ids:{type:'array',items:{type:'string'}},
 query_type:{type:['string','null'],enum:['count_available','location','other',null]}}};
export const answerSchema={type:'object',additionalProperties:false,required:['status','answer','sources','facts'],properties:{
 status:{type:'string',enum:['found','not_found']},
 answer:{type:'string'},sources:{type:'array',items:{type:'object',additionalProperties:false,required:['type','id'],properties:{type:{type:'string',enum:['dossier','inventory','user_input']},id:nullableString}}},
 facts:{type:'array',items:{type:'object',additionalProperties:false,required:['subject','field','value','source'],properties:{subject:{type:'string'},field:{type:'string',enum:['capacity','opens','closes','demo_end','room_id','available']},value:{type:['string','number','null']},source:{type:'string',enum:['D01','D02','D03','D04','D05','D06','D07','D08','inventory','user_input']}}}}
}};
export function validateIntent(x){
 if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).sort().join()!==['action','query_type','model_id','quantity','room_id','device_ids'].sort().join()
 ||!(x.action==='query'?['count_available','location','other'].includes(x.query_type):x.query_type===null)
 ||(x.query_type==='count_available'&&(x.quantity!==null||x.room_id!==null||!Array.isArray(x.device_ids)||x.device_ids.length!==0))
 ||(x.query_type==='location'&&(x.quantity!==null||x.room_id!==null||!Array.isArray(x.device_ids)||x.device_ids.length===0||new Set(x.device_ids).size!==x.device_ids.length))
 ||!['assign','release','query'].includes(x.action)||!['FOLD8','FOLD8_ULTRA','FLIP8','UNKNOWN',null].includes(x.model_id)||!['AZUL','VERDE','PRENSA','TALLER','UNKNOWN',null].includes(x.room_id)
 ||!(x.quantity===null||Number.isInteger(x.quantity))||!Array.isArray(x.device_ids)||!x.device_ids.every(i=>typeof i==='string'))
 throw fail('MODEL_OUTPUT_INVALID','Intención fuera de contrato. query requiere query_type count_available, location u other; assign/release requieren null. count_available no lleva quantity, room_id ni device_ids. location requiere IDs explícitos únicos, quantity y room_id null.',502); return x;
}
export function validateAnswer(x){
 if(!x||!['found','not_found'].includes(x.status)||typeof x.answer!=='string'||!x.answer.trim()||!Array.isArray(x.sources)||!Array.isArray(x.facts)
 ||!x.sources.every(s=>s&&['dossier','inventory','user_input'].includes(s.type)&&(s.id===null||typeof s.id==='string'))
 ||!x.facts.every(f=>f&&['subject','field','source'].every(k=>typeof f[k]==='string')&&(f.value===null||['string','number'].includes(typeof f.value))))
 throw fail('MODEL_OUTPUT_INVALID','Respuesta fuera de contrato.',502);
 if(x.status==='not_found'&&(x.facts.length!==0||x.sources.length!==0))
  throw fail('MODEL_OUTPUT_INVALID','not_found requiere facts y sources vacíos.',502);
 if(x.status==='found'&&(!x.facts.length||!x.sources.length))
  throw fail('MODEL_OUTPUT_INVALID','found requiere datos y fuentes.',502);
 for(const f of x.facts){
  if(f.field==='opens'&&!x.facts.some(g=>g.subject===f.subject&&g.field==='closes'&&g.source===f.source))
   throw fail('MODEL_OUTPUT_INVALID','Un horario debe incluir opens Y closes para la misma sala y fuente. Falta closes.',502);
  if(['room_id','available'].includes(f.field)&&f.source!=='inventory')
   throw fail('MODEL_OUTPUT_INVALID','La fuente de room_id y available debe ser inventory.',502);
  if(!x.sources.some(s=>['inventory','user_input'].includes(f.source)?s.type===f.source:s.type==='dossier'&&s.id===f.source))
   throw fail('MODEL_OUTPUT_INVALID','sources debe incluir la fuente de cada hecho.',502);
 }
 return x.status==='not_found'?{status:'not_found',answer:NOT_FOUND_ANSWER,facts:[],sources:[]}:x;
}
export function validateMessage(body){
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!['message','request_id'].includes(k))
 ||typeof body.message!=='string'||!body.message.trim()||body.message.length>2000||typeof body.request_id!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(body.request_id))
 throw fail('INVALID_INPUT','message: texto de 1 a 2000 caracteres; request_id: 8 a 100 letras, números, guiones o guiones bajos.');
}
