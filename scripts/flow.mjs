import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {config,assertConfigured} from '../src/model.mjs';
const results=[];let child,stage='configuration',report={kind:'REAL_INTEGRATION',model:config.model};
try{
 assertConfigured();
 child=spawn(process.execPath,['src/server.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','inherit']});
 const ready=await Promise.race([once(child.stdout,'data'),new Promise((_,rej)=>setTimeout(()=>rej(Error('No arrancó el servidor')),5000).unref())]);
 const url=String(ready[0]).match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];assert(url);
 async function inventory(){const r=await fetch(url+'/api/inventory');assert.equal(r.status,200);return (await r.json()).inventory;}
 async function say(message){
  const start=Date.now(),request_id=randomUUID();
  const r=await fetch(url+'/api/message',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message,request_id}),signal:AbortSignal.timeout(2*config.timeout+15000)});
  const response=await r.json();results.push({message,status:r.status,duration_ms:Date.now()-start,response});
  if(!r.ok)throw Object.assign(Error(response.message),{code:response.error});
  assert(response.calls.length>=1&&response.calls.length<=2,'Debe haber inferencia real.');
  assert(response.calls.every(c=>c.model===config.model&&c.returned_model===config.model),'Modelo distinto del configurado.');
  return response;
 }
 stage='reserve';
 const reservation=await say('Asigna dos Fold8 a la Sala Azul');
 assert.equal(reservation.intent.action,'assign');assert.equal(reservation.operation?.ok,true);
 assert.deepEqual(reservation.operation.device_ids,['F8-01','F8-02']);
 const after=await inventory();assert.equal(after.devices.filter(d=>d.status==='available').length,3);
 stage='query';
 const query=await say('¿En qué sala está F8-01 ahora?');
 assert.equal(query.intent.action,'query');assert.equal(query.operation,null);assert.equal(typeof query.answer,'string');
 assert(Array.isArray(query.sources)&&Array.isArray(query.facts));assert.deepEqual(await inventory(),after);
 stage='release';
 const release=await say('Libera F8-01');assert.equal(release.operation?.ok,true);
 const d=(await inventory()).devices.find(d=>d.id==='F8-01');assert.equal(d.status,'available');assert.equal(d.room_id,null);
 report={...report,ok:true};console.log('PASS recorrido real: interpretar y reservar -> consultar -> liberar.');
}catch(e){
 const code=e.code||'MODEL_RESULT_REVIEW';
 report={...report,ok:false,stage,error:code,message:e.message};
 console.error(code+': '+e.message);
 console.error(code==='NOT_IMPLEMENTED'?'Completa la función indicada.':'Revisa la configuración y conserva el resultado si el modelo devuelve una salida inválida.');
 process.exitCode=1;
}finally{
 child?.kill('SIGTERM');report.results=results;report.at=new Date().toISOString();await mkdir('results',{recursive:true});
 const path='results/flow-'+Date.now()+'.json';await writeFile(path,JSON.stringify(report,null,2));console.log('Evidencia: '+path);
}
