export function assign(devices,ids,quantity,room_id){
 if(ids.length<quantity)return {ok:false,device_ids:[],requested:quantity,available:ids.length};
 const selected=ids.slice(0,quantity);
 for(const id of selected){const d=devices.find(d=>d.id===id);d.status='assigned';d.room_id=room_id;}
 return {ok:true,device_ids:selected,requested:quantity,available:ids.length};
}
