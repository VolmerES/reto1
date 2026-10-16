import {config,context,complete,assertConfigured} from '../src/model.mjs';
import {randomUUID} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const marker='GALAXY_'+randomUUID().slice(0,12),ctx=context('connection-'+marker);
let report={kind:'REAL_LOCAL_MODEL',model:config.model,base:config.base,marker};
try{
 assertConfigured();
 const text=await complete(ctx,{system:'Repite exactamente el marcador del usuario.',user:marker});
 if(!text.includes(marker))throw new Error('El modelo respondió, pero no devolvió el marcador enviado. Conserva esta evidencia para revisar la conexión.');
 report={...report,ok:true,response:text};
}catch(e){report={...report,ok:false,error:e.code||'CONNECTION_CHECK_FAILED',message:e.message};process.exitCode=1;}
report.calls=ctx.calls;report.at=new Date().toISOString();
await mkdir('results',{recursive:true});const path='results/connection-'+Date.now()+'.json';await writeFile(path,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));console.log('Evidencia: '+path);
