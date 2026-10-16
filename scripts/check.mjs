import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {inventory,dossier} from '../src/data.mjs';
import {NOT_FOUND_ANSWER} from '../src/contracts.mjs';
import {context,config} from '../src/model.mjs';
import {interpret} from '../src/actions/interpret.mjs';
import {answer} from '../src/actions/answer.mjs';
import {assign} from '../src/actions/assign.mjs';
import {release} from '../src/actions/release.mjs';
import {createService} from '../src/service.mjs';
// Proceso SIMULADO, sin red. No guarda configuración ni acredita conexión real.
config.base='http://127.0.0.1:1234/v1';config.model='SIMULATED_ONLY';
const pick=process.argv[2]||'all';
if(!['all','extraccion','consulta','reserva','liberacion'].includes(pick))throw Error('Usa extraccion, consulta, reserva o liberacion. La conexión real se comprueba con npm run check:connection.');
const tests=[],copy=()=>structuredClone(inventory);
function add(section,name,run){tests.push({section,name,run});}
function mock(values){
 const requests=[],ctx=context(randomUUID(),async(url,opt)=>{
  const body=JSON.parse(opt.body);requests.push({url,body});
  const value=values[Math.min(requests.length-1,values.length-1)];
  return new Response(JSON.stringify({model:config.model,choices:[{message:{content:typeof value==='string'?value:JSON.stringify(value)}}]}));
 });
 return {ctx,requests};
}
function wiring(m,message){
 assert(m.requests.length>=1&&m.requests.length<=2,'Debe llamar al transporte preparado una o dos veces.');
 for(const {body} of m.requests){assert.equal(body.model,config.model);assert.equal(body.response_format?.type,'json_schema');assert(body.messages.some(x=>x.role==='user'&&x.content.includes(message)),'No se envió el mensaje variable.');}
}
const intent={action:'assign',query_type:null,model_id:'FOLD8',quantity:2,room_id:'AZUL',device_ids:[]};
add('extraccion','Pasa texto y devuelve la intención recibida',async()=>{
 const evidence=[];for(const [message,value]of [['Reserva dos Fold8 en Azul',intent],['Libera FP8-02',{action:'release',query_type:null,model_id:'FLIP8',quantity:null,room_id:null,device_ids:['FP8-02']}] ]){
  const m=mock([value]);assert.deepEqual(await interpret(message,m.ctx),value);wiring(m,message);evidence.push(m.ctx.calls);
 }return evidence;
});
add('extraccion','Usa validación/reparación y propaga salida inválida',async()=>{
 const m=mock(['{}',intent]);assert.deepEqual(await interpret('Asigna dos Fold8 a Azul',m.ctx),intent);assert.equal(m.requests.length,2);
 const bad=mock(['{}']);await assert.rejects(interpret('Asigna dos Fold8',bad.ctx),{code:'MODEL_OUTPUT_INVALID'});assert.equal(bad.requests.length,2);
 return {repair:m.ctx.calls,rejected:bad.ctx.calls};
});
add('consulta','Envía dossier e inventario recibidos, no copias antiguas',async()=>{
 const evidence=[];
 for(const room of ['PRENSA','VERDE']){
  const sheets=structuredClone(dossier),inv=copy();sheets[0].text='MARCADOR_'+room+' aforo 31; apertura 15:00-21:00.';
  inv.devices[0].status='assigned';inv.devices[0].room_id=room;
  const value={status:'found',answer:'Respuesta de prueba',sources:[{type:'inventory',id:null}],facts:[{subject:'F8-01',field:'room_id',value:room,source:'inventory'}]};
  const m=mock([value]),message='¿Dónde está F8-01? '+room;
  const before=JSON.stringify({sheets,inv});assert.deepEqual(await answer(message,sheets,inv,m.ctx),value);wiring(m,message);
  const user=m.requests[0].body.messages.find(x=>x.role==='user').content;
  assert(user.includes(JSON.stringify(sheets)),'Falta el dossier recibido.');
  assert(user.includes(JSON.stringify(inv)),'Falta la instantánea recibida.');
  assert.equal(JSON.stringify({sheets,inv}),before);evidence.push(m.ctx.calls);
 }return evidence;
});
add('consulta','Conserva hechos/fuentes y propaga errores',async()=>{
 const value={status:'not_found',answer:NOT_FOUND_ANSWER,sources:[],facts:[]},m=mock([value]);
 assert.deepEqual(await answer('Dato ausente',dossier,copy(),m.ctx),value);
 const bad=mock(['{}']);await assert.rejects(answer('Pregunta',dossier,copy(),bad.ctx),{code:'MODEL_OUTPUT_INVALID'});
 return {ok:m.ctx.calls,bad:bad.ctx.calls};
});
add('reserva','Reserva válida, resto intacto',async()=>{
 const inv=copy(),r=assign(inv.devices,['F8-01','F8-02'],2,'PRENSA');assert.equal(r.ok,true);assert.deepEqual(r.device_ids,['F8-01','F8-02']);
 for(const d of inv.devices.slice(0,2)){assert.equal(d.status,'assigned');assert.equal(d.room_id,'PRENSA');}assert.deepEqual(inv.devices.slice(2),inventory.devices.slice(2));return r;
});
add('reserva','Sin stock, ninguna mutación',async()=>{
 const inv=copy(),before=copy(),r=assign(inv.devices,['F8-01','F8-02'],3,'PRENSA');assert.equal(r.ok,false);assert.deepEqual(inv,before);return r;
});
add('reserva','Rechaza IDs ocupados sin modificar estado',async()=>{
 const s=createService(),before=s.snapshot(),r=s.execute({...intent,device_ids:['F8-01','F8-03']});assert.equal(r.operation.ok,false);assert.deepEqual(s.snapshot(),before);return r;
});
add('liberacion','Libera estado y sala; conserva otras unidades',async()=>{
 const inv=copy(),r=release(inv.devices,['F8-03']);assert.equal(r.ok,true);assert.equal(inv.devices[2].status,'available');assert.equal(inv.devices[2].room_id,null);assert.deepEqual(inv.devices.filter(d=>d.id!=='F8-03'),inventory.devices.filter(d=>d.id!=='F8-03'));return r;
});
add('liberacion','Libre es no-op y puede reasignarse',async()=>{
 const inv=copy();release(inv.devices,['F8-01']);assert.deepEqual(inv,inventory);release(inv.devices,['F8-03']);assert.equal(inv.devices[2].room_id,null);
 const r=assign(inv.devices,['F8-03'],1,'PRENSA');assert.equal(r.ok,true);assert.equal(inv.devices[2].room_id,'PRENSA');return r;
});
const results=[];
for(const t of tests.filter(t=>pick==='all'||t.section===pick)){
 const start=Date.now(),row={section:t.section,name:t.name};
 try{row.evidence=await t.run();row.ok=true;}catch(e){row.ok=false;row.error=e.code||'ASSERTION_FAILED';row.message=e.message;}
 row.duration_ms=Date.now()-start;results.push(row);console.log((row.ok?'PASS':'FAIL')+' '+t.section+' '+t.name+(row.error?' '+row.error:''));
}
const passed=results.filter(r=>r.ok).length;
const report={version:6,kind:'SIMULATED_CODE_CHECK',ok:passed===results.length,passed,total:results.length,results,at:new Date().toISOString()};
await mkdir('results',{recursive:true});const path='results/code-'+Date.now()+'.json';await writeFile(path,JSON.stringify(report,null,2));
console.log(passed+' de '+results.length+' comprobaciones correctas. Evidencia: '+path);
if(!report.ok)process.exitCode=1;
