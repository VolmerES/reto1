export function release(devices,ids){
 for(const id of ids){const d=devices.find(d=>d.id===id);d.status='available';}
 return {ok:true,device_ids:[...ids]};
}
