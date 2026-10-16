// Preparado: el modelo clasifica la pregunta; el código cuenta el estado actual.
import {validateIntent} from './contracts.mjs';
import {fail} from './errors.mjs';
// Preparado: conserva referencias explícitas al catálogo tras la inferencia.
// No clasifica la acción ni calcula cantidades a partir del texto.
export function availabilityIntent(raw,message){
 const intent=validateIntent(raw);
 const query=intent.action==='query'&&['count_available','location'].includes(intent.query_type);
 const operation=['assign','release'].includes(intent.action)&&intent.device_ids.length>0;
 if(!query&&!operation)return intent;
 const text=message.normalize('NFKC').replaceAll('_',' ').replaceAll('-',' ');
 const names=[...text.matchAll(/\b(fold|flip)\s*(\d+)(?:\s*(ultra))?\b/gi)];
 if(!names.length)return intent;
 const ids=new Set(names.map(([,family,version,ultra])=>{
  const name=family.toLowerCase()+version+(ultra?' ultra':'');
  const id={'fold8':'FOLD8','fold8 ultra':'FOLD8_ULTRA','flip8':'FLIP8'}[name];
  if(!id)throw fail('INVALID_INPUT','Modelo desconocido. Usa Fold8, Fold8 Ultra o Flip8.');
  return id;
 }));
 if(ids.size!==1||/\b(excepto|salvo|menos|excluyendo)\b/i.test(text))
  throw fail('INVALID_INPUT','Indica un solo modelo cada vez, sin exclusiones.');
 return {...intent,model_id:[...ids][0]};
}
export function availabilityAnswer(raw,inventory){
 const intent=validateIntent(raw);
 if(intent.action!=='query'||intent.query_type!=='count_available')
  throw fail('INVALID_INPUT','Esta consulta no es un recuento de disponibilidad.');
 if(intent.model_id!==null&&!inventory.models.some(m=>m.id===intent.model_id))
  throw fail('INVALID_INPUT','Modelo desconocido.');
 const count=inventory.devices.filter(d=>d.status==='available'&&(intent.model_id===null||d.model_id===intent.model_id)).length;
 const label=intent.model_id===null?'dispositivos':inventory.models.find(m=>m.id===intent.model_id).name;
 return {status:'found',answer:`Disponibles (${label}): ${count}.`,
  sources:[{type:'inventory',id:null}],
  facts:[{subject:intent.model_id??'TOTAL',field:'available',value:count,source:'inventory'}]};
}
