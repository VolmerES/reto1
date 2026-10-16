import {test} from 'node:test';
import assert from 'node:assert/strict';
import {locationAnswer} from '../src/location.mjs';
import {validateAnswer} from '../src/contracts.mjs';
import {inventory} from '../src/data.mjs';
const intent={action:'query',query_type:'location',model_id:'FOLD8',quantity:null,room_id:null,device_ids:['F8-01']};
test('Ubicación preparada: lee AZUL, null y VERDE del estado actual, sin mutar',()=>{
 const inv=structuredClone(inventory);
 for(const value of ['AZUL',null,'VERDE']){
  inv.devices[0].room_id=value;inv.devices[0].status=value===null?'available':'assigned';
  const before=structuredClone(inv),result=validateAnswer(locationAnswer(intent,inv));
  assert.equal(result.status,'found');
  assert.deepEqual(result.facts,[{subject:'F8-01',field:'room_id',value,source:'inventory'}]);
  assert.deepEqual(result.sources,[{type:'inventory',id:null}]);
  assert.ok(result.answer.includes(value===null?'no tiene sala':value==='AZUL'?'Sala Azul':'Sala Verde'));
  assert.deepEqual(inv,before);
 }
});
test('Ubicación: IDs múltiples, familias distintas y orden conservado',()=>{
 const result=locationAnswer({...intent,model_id:null,device_ids:['FP8-03','F8-01']},inventory);
 assert.deepEqual(result.facts.map(f=>[f.subject,f.value]),[['FP8-03','TALLER'],['F8-01',null]]);
});
test('Ubicación: rechaza IDs inexistentes y modelo incompatible sin cambiar stock',()=>{
 const inv=structuredClone(inventory);
 for(const raw of [{...intent,device_ids:['F8-99']},{...intent,model_id:'FLIP8'}])
  assert.throws(()=>locationAnswer(raw,inv),{code:'INVALID_INPUT'});
 assert.deepEqual(inv,inventory);
});
test('Ubicación: no admite IDs ausentes/duplicados, sala inventada ni otra acción',()=>{
 for(const raw of [
  {...intent,device_ids:[]},{...intent,device_ids:['F8-01','F8-01']},{...intent,room_id:'AZUL'},
  {...intent,quantity:1},{...intent,action:'release',query_type:null},{...intent,query_type:'other'}
 ])assert.throws(()=>locationAnswer(raw,inventory));
});
