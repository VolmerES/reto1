// Preparado: el modelo interpreta la consulta y extrae IDs; el código lee el estado actual.
import {validateIntent} from './contracts.mjs';
import {fail} from './errors.mjs';
export function locationAnswer(raw,inventory){
 const intent=validateIntent(raw);
 if(intent.action!=='query'||intent.query_type!=='location')
  throw fail('INVALID_INPUT','Esta consulta no es de ubicación.');
 const devices=intent.device_ids.map(id=>{
  const device=inventory.devices.find(d=>d.id===id);
  if(!device)throw fail('INVALID_INPUT','Unidad desconocida: '+id);
  if(intent.model_id!==null&&intent.model_id!==device.model_id)
   throw fail('INVALID_INPUT','Modelo e IDs incompatibles.');
  return device;
 });
 return {
  status:'found',
  answer:devices.map(d=>d.room_id===null
   ?d.id+' no tiene sala asignada.'
   :d.id+' está en '+(inventory.rooms.find(r=>r.id===d.room_id)?.name??d.room_id)+'.').join(' '),
  sources:[{type:'inventory',id:null}],
  facts:devices.map(d=>({subject:d.id,field:'room_id',value:d.room_id,source:'inventory'}))
 };
}
