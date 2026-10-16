import {test} from 'node:test';
import assert from 'node:assert/strict';
import {availabilityIntent} from '../src/availability.mjs';
import {locationAnswer} from '../src/location.mjs';
import {inventory} from '../src/data.mjs';
const raw={action:'query',query_type:'location',model_id:null,quantity:null,room_id:null,device_ids:['F8-03']};
test('Ubicación: familia explícita se conserva tras inferencia aunque el modelo la omita',()=>{
 for(const model_id of [null,'FOLD8','FLIP8']){
  const input={...raw,model_id},before=structuredClone(input),inv=structuredClone(inventory);
  const intent=availabilityIntent(input,'¿Dónde está el Flip8 F8-03?');
  assert.equal(intent.model_id,'FLIP8');
  assert.throws(()=>locationAnswer(intent,inv),{code:'INVALID_INPUT'});
  assert.deepEqual(input,before);assert.deepEqual(inv,inventory);
 }
});
test('Ubicación: familias coherentes, aliases y sin familia explícita',()=>{
 for(const [message,id,family,room] of [
  ['¿Dónde está el Fold8 F8-03?','F8-03','FOLD8','AZUL'],
  ['¿Dónde está el FOLD8_ULTRA F8U-02?','F8U-02','FOLD8_ULTRA','VERDE'],
  ['¿Dónde está el Flip 8 FP8-03?','FP8-03','FLIP8','TALLER'],
  ['¿Dónde está F8-03?','F8-03',null,'AZUL']
 ]){
  const intent=availabilityIntent({...raw,device_ids:[id]},message);
  assert.equal(intent.model_id,family);assert.equal(locationAnswer(intent,inventory).facts[0].value,room);
 }
});
test('Ubicación: no acepta familias desconocidas, múltiples ni exclusiones',()=>{
 for(const message of ['Dónde está el Fold9 F8-03','Dónde están Fold8 y Flip8 F8-03','Dónde están todos salvo Fold8 F8-03'])
  assert.throws(()=>availabilityIntent(raw,message),{code:'INVALID_INPUT'});
});
test('Operaciones con IDs: conserva familia explícita sin resolver reserva ni liberación',()=>{
 for(const action of ['assign','release']){
  const intent={...raw,action,query_type:null,room_id:action==='assign'?'AZUL':null};
  for(const model_id of [null,'FOLD8']){
   const input={...intent,model_id},before=structuredClone(input);
   const result=availabilityIntent(input,'El Flip8 F8-03');
   assert.deepEqual(result,{...input,model_id:'FLIP8'});assert.deepEqual(input,before);
  }
 }
});
