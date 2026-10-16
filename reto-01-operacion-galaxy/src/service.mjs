import {inventory as initial,dossier} from './data.mjs';
import {validateMessage,validateIntent,validateAnswer} from './contracts.mjs';
import {fail} from './errors.mjs';
import {context} from './model.mjs';
import {interpret} from './actions/interpret.mjs';
import {normalize} from './normalize.mjs';
import {answer} from './actions/answer.mjs';
import {availabilityAnswer,availabilityIntent} from './availability.mjs';
import {locationAnswer} from './location.mjs';
import {assign} from './actions/assign.mjs';
import {release} from './actions/release.mjs';
export {dossier};
export function createService(){
 let inventory=structuredClone(initial),counter=0;const cache=new Map();let queue=Promise.resolve();
 const snapshot=()=>structuredClone(inventory);
 function execute(raw){
  const intent=normalize(validateIntent(raw));
  if(intent.missing.length)return {ok:true,answer:'Faltan datos: '+intent.missing.join(', ')+'. Envía una petición completa.',sources:[],intent,facts:[],operation:null};
  const {action,model_id,quantity,room_id,device_ids}=intent;
  if(action==='query')throw fail('INVALID_INPUT','Las consultas se procesan con el modelo.');
  if(model_id!==null&&!inventory.models.some(m=>m.id===model_id))throw fail('INVALID_INPUT','Modelo desconocido.');
  if(action==='assign'&&!inventory.rooms.some(r=>r.id===room_id))throw fail('INVALID_INPUT','Sala desconocida.');
  if(new Set(device_ids).size!==device_ids.length||device_ids.some(id=>!inventory.devices.some(d=>d.id===id)))throw fail('INVALID_INPUT','IDs inexistentes o duplicados.');
  const explicit=inventory.devices.filter(d=>device_ids.includes(d.id));
  if(model_id!==null&&explicit.some(d=>d.model_id!==model_id))throw fail('INVALID_INPUT','Modelo e IDs incompatibles.');
  if(action==='assign'&&((!device_ids.length&&(!Number.isInteger(quantity)||quantity<1))||(device_ids.length&&quantity!==null&&quantity!==device_ids.length)))throw fail('INVALID_INPUT','Cantidad inválida o incompatible con IDs.');
  let result;
  if(action==='assign'){
   if(explicit.some(d=>d.status!=='available'))result={ok:false,device_ids:[],reason:'Una unidad solicitada ya está asignada.'};
   else{
    const ids=device_ids.length?[...device_ids]:inventory.devices.filter(d=>d.model_id===model_id&&d.status==='available').map(d=>d.id).sort();
    result=assign(inventory.devices,ids,device_ids.length||quantity,room_id);
   }
  }else result=release(inventory.devices,device_ids);
  const operation={...result,action,model_id,room_id:action==='release'?null:room_id};
  if(result.ok)operation.operation_id='OP-'+String(++counter).padStart(3,'0');
  else operation.reason ||= 'Sin disponibilidad suficiente. No se ha confirmado ninguna asignación.';
  if(model_id)operation.remaining_available=inventory.devices.filter(d=>d.model_id===model_id&&d.status==='available').length;
  return {ok:true,answer:result.ok?(action==='assign'?'Asignadas: ':'Liberadas: ')+result.device_ids.join(', '):operation.reason,sources:[{type:'inventory'}],intent,facts:[],operation};
 }
 async function process(body){
  validateMessage(body);
  const existing=cache.get(body.request_id);
  if(existing){
   if(existing.message!==body.message)throw fail('REQUEST_CONFLICT','request_id reutilizado con otro mensaje.',409);
   return existing.response;
  }
  const ctx=context(body.request_id);
  try{
   const raw=availabilityIntent(validateIntent(await interpret(body.message,ctx)),body.message);
   let response;
   if(raw.action==='query'){
    const result=raw.query_type==='count_available'
     ?availabilityAnswer(raw,snapshot())
     :raw.query_type==='location'?locationAnswer(raw,snapshot())
     :await answer(body.message,structuredClone(dossier),snapshot(),ctx);
    response={ok:true,...validateAnswer(result),intent:raw,operation:null};
   }else response=execute(raw);
   response.calls=ctx.calls;
   cache.set(body.request_id,{message:body.message,response});return response;
  }catch(e){e.calls=ctx.calls;throw e;}
 }
 return {snapshot,execute,process(body){const task=queue.then(()=>process(body));queue=task.catch(()=>{});return task;},
 reset(){const task=queue.then(()=>{inventory=structuredClone(initial);counter=0;cache.clear();return snapshot();});queue=task.catch(()=>{});return task;}};
}
