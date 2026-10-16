import {test} from 'node:test';
import assert from 'node:assert/strict';
import {context,json,config} from '../src/model.mjs';
import {validateIntent,validateMessage,validateAnswer,NOT_FOUND_ANSWER} from '../src/contracts.mjs';
import {createService} from '../src/service.mjs';
const valid={action:'query',query_type:'other',model_id:null,quantity:null,room_id:null,device_ids:[]};
// Solo este proceso de pruebas simuladas: jamás configura el servidor real.
config.base='http://127.0.0.1:1234/v1';config.model='SIMULATED_ONLY';
const response=text=>new Response(JSON.stringify({model:config.model,choices:[{message:{content:text}}]}));
test('SIMULADO: reparación acotada, mismo modelo y dos llamadas',async()=>{
 let n=0;const ctx=context('repair',async(url,opts)=>{assert.equal(JSON.parse(opts.body).model,config.model);return response(++n===1?'no json':JSON.stringify(valid));});
 assert.deepEqual(await json(ctx,{system:'',user:''},validateIntent),valid);assert.equal(ctx.calls.length,2);
});
test('SIMULADO: dos salidas inválidas terminan',async()=>{
 const ctx=context('bad',async()=>response('{}'));await assert.rejects(json(ctx,{system:'',user:''},validateIntent),{code:'MODEL_OUTPUT_INVALID'});assert.equal(ctx.calls.length,2);
});
test('SIMULADO: modelo incorrecto no aceptado',async()=>{
 const ctx=context('wrong',async()=>new Response(JSON.stringify({model:'otro',choices:[{message:{content:'{}'}}]})));
 await assert.rejects(json(ctx,{system:'',user:''},validateIntent),{code:'MODEL_OUTPUT_INVALID'});
});
test('SIMULADO: indisponibilidad no reintenta',async()=>{
 const ctx=context('down',async()=>{throw new TypeError('offline');});await assert.rejects(json(ctx,{system:'',user:''},validateIntent),{code:'MODEL_UNAVAILABLE'});assert.equal(ctx.calls.length,1);
});
test('SIMULADO: timeout separado, respuesta tardía descartada',async()=>{
 const original=config.timeout;config.timeout=15;
 try{
  const old=context('late',async()=>{await new Promise(r=>setTimeout(r,60));return response(JSON.stringify(valid));});
  await assert.rejects(json(old,{system:'',user:''},validateIntent),{code:'MODEL_TIMEOUT'});
  const next=context('next',async()=>response(JSON.stringify(valid)));await json(next,{system:'',user:''},validateIntent);
  await new Promise(r=>setTimeout(r,80));
  assert.equal(old.calls.length,1);assert.equal(old.calls[0].outcome,'MODEL_TIMEOUT');assert.equal(next.calls.length,1);assert.equal(next.calls[0].request_id,'next');
 }finally{config.timeout=original;}
});
test('Entrada vacía y JSON de contrato: sin inferencia ni cambios',async()=>{
 assert.throws(()=>validateMessage({message:'',request_id:'abcdefgh'}),{code:'INVALID_INPUT'});
 const s=createService(),before=s.snapshot();await assert.rejects(s.process({message:'',request_id:'abcdefgh'}),{code:'INVALID_INPUT'});assert.deepEqual(s.snapshot(),before);
});
test('Servidor de servicio conserva snapshot y reset explícito',async()=>{
 const s=createService();const before=s.snapshot();before.devices.length=0;assert.equal(s.snapshot().devices.length,8);assert.equal((await s.reset()).devices.length,8);
});
test('not_found: el backend sustituye prosa variable o inventada por el aviso seguro',()=>{
 for(const answer of ['No lo sé.','No consta.','La contraseña es Galaxy123.']){
  const raw={status:'not_found',answer,facts:[],sources:[]};
  assert.deepEqual(validateAnswer(raw),{...raw,answer:NOT_FOUND_ANSWER});
  assert.equal(raw.answer,answer);
 }
});
test('Estado de consulta obligatorio y coherente, sin aceptar hechos en not_found',()=>{
 for(const value of [
  {answer:'No sé',facts:[],sources:[]},
  {status:'otro',answer:'No sé',facts:[],sources:[]},
  {status:'found',answer:'Inventado',facts:[],sources:[]},
  {status:'not_found',answer:'No sé',facts:[{subject:'AZUL',field:'capacity',value:24,source:'D01'}],sources:[{type:'dossier',id:'D01'}]},
  {status:'not_found',answer:'No sé',facts:[],sources:[{type:'inventory',id:null}]},
 ])assert.throws(()=>validateAnswer(value),{code:'MODEL_OUTPUT_INVALID'});
 const found={status:'found',answer:'24 personas',facts:[{subject:'AZUL',field:'capacity',value:24,source:'D01'}],sources:[{type:'dossier',id:'D01'}]};
 assert.deepEqual(validateAnswer(found),found);
});
