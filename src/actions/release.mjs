// Libera unidades: vuelven a estar disponibles y dejan de pertenecer a una sala.
// Fallo corregido: solo se cambiaba status, pero room_id conservaba la sala antigua,
// así que la unidad contaba como libre (availability lee status) y a la vez seguía
// "en" su sala (location lee room_id). Liberar una unidad ya libre no cambia nada.
export function release(devices,ids){
 for(const id of ids){
  const d=devices.find(d=>d.id===id);
  if(!d)continue; // el servicio ya rechaza IDs inexistentes antes de llegar aquí
  d.status='available';
  d.room_id=null;
 }
 return {ok:true,device_ids:[...ids]};
}
