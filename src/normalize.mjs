// Preparado: normaliza faltantes sin inventar datos. Se entrega implementado.
// Una asignación sin sala debe incluir "room_id" en missing y conservar room_id:null.
// No debe inventar campos ni mutar la entrada. No lanza errores: cataloga faltantes.
// El resto de validaciones de catálogo y cantidad ya lo realiza el servicio.
export function normalize(intent){
 const result={...intent,device_ids:[...intent.device_ids],missing:[]};
 if(result.action==='assign'){
  if(!result.room_id) result.missing.push('room_id');
  if(!result.device_ids.length){
   if(!result.model_id)result.missing.push('model_id');
   if(result.quantity===null)result.missing.push('quantity');
  }
 }
 if(result.action==='release'&&!result.device_ids.length)result.missing.push('device_ids');
 return result;
}
