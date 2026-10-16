import {test} from 'node:test';
import assert from 'node:assert/strict';
import {availabilityAnswer,availabilityIntent} from '../src/availability.mjs';
import {validateIntent} from '../src/contracts.mjs';
import {inventory} from '../src/data.mjs';
const intent={action:'query',query_type:'count_available',model_id:null,quantity:null,room_id:null,device_ids:[]};
test('Filtro explícito: Fold8, Ultra y Flip8, alias y mayúsculas; sin mutar intención',()=>{
 for(const [message,model_id] of [
  ['¿Cuántos Fold8 están disponibles?','FOLD8'],['Número de Samsung Galaxy Z Fold 8 libres','FOLD8'],
  ['¿Cuántos FOLD8 ULTRA quedan sin asignar?','FOLD8_ULTRA'],
  ['¿Cuántos Fold8Ultra están libres?','FOLD8_ULTRA'],['Unidades FOLD8_ULTRA libres','FOLD8_ULTRA'],
  ['¿Cuántos Flip 8 están disponibles?','FLIP8']
 ]){
  for(const wrong of [null,'UNKNOWN','FLIP8']){
   const raw={...intent,model_id:wrong},before=structuredClone(raw);
   assert.equal(availabilityIntent(raw,message).model_id,model_id);
   assert.deepEqual(raw,before);
  }
 }
});
test('Sin familia explícita no inventa un filtro; otras acciones no se resuelven',()=>{
 assert.deepEqual(availabilityIntent(intent,'¿Cuántos dispositivos están libres?'),intent);
 for(const raw of [{...intent,query_type:'other'},{...intent,action:'assign',query_type:null}]){
  assert.deepEqual(availabilityIntent(raw,'Asigna Fold8 a Azul'),raw);
 }
});
test('Familias desconocidas o varias: rechaza sin devolver un total silencioso',()=>{
 for(const message of ['¿Cuántos Fold9 están libres?','¿Cuántos Fold80 quedan?','¿Cuántos Flip8 Ultra hay?',
  '¿Cuántos Fold8 y Fold8 Ultra están libres?','Todos excepto Fold8','Todos salvo Flip8']){
  assert.throws(()=>availabilityIntent(intent,message),{code:'INVALID_INPUT'});
 }
});
test('Recuento preparado: 5, 3 y 0 según estado, fuentes correctas y sin mutaciones',()=>{
 for(const expected of [5,3,0]){
  const inv=structuredClone(inventory);
  const free=inv.devices.filter(d=>d.status==='available');
  for(const d of free.slice(expected)){d.status='assigned';d.room_id='AZUL';}
  const before=structuredClone(inv),result=availabilityAnswer(intent,inv);
  assert.deepEqual(result.facts,[{subject:'TOTAL',field:'available',value:expected,source:'inventory'}]);
  assert.deepEqual(result.sources,[{type:'inventory',id:null}]);
  assert.equal(result.status,'found');assert.deepEqual(inv,before);
 }
});
test('Recuento por modelo, sin confundir Fold8 con Ultra',()=>{
 for(const [model_id,n] of [['FOLD8',2],['FOLD8_ULTRA',1],['FLIP8',2]])
  assert.equal(availabilityAnswer({...intent,model_id},inventory).facts[0].value,n);
 assert.throws(()=>availabilityAnswer({...intent,model_id:'UNKNOWN'},inventory),{code:'INVALID_INPUT'});
});
test('No convierte consultas distintas, campos ausentes ni incoherentes en recuentos',()=>{
 for(const raw of [
  {...intent,query_type:'other'},{...intent,query_type:undefined},{...intent,query_type:'inventado'},
  {...intent,action:'assign'},{...intent,quantity:5},{...intent,room_id:'AZUL'},{...intent,device_ids:['F8-01']}
 ])assert.throws(()=>availabilityAnswer(raw,inventory));
 assert.doesNotThrow(()=>validateIntent({...intent,query_type:'other'}));
 assert.doesNotThrow(()=>validateIntent({...intent,action:'assign',query_type:null}));
});
