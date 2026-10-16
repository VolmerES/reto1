import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createService,dossier} from './service.mjs';
import {config,inferenceVerified} from './model.mjs';
import {fail} from './errors.mjs';
import {randomBytes} from 'node:crypto';
import {createEvaluationLoader} from './evaluation-loader.mjs';
const service=createService();
const port=Number(process.env.PORT||3030);
const evaluationToken=randomBytes(32).toString('hex');
const evaluator=createEvaluationLoader(new URL('../evaluar.mjs',import.meta.url),{
 base:()=> 'http://127.0.0.1:'+server.address().port,
 token:evaluationToken,
 modelConfig:()=>({...config}),
});
const assets={'/':['index.html','text/html'],'/style.css':['style.css','text/css'],'/app.js':['app.js','text/javascript'],'/samsung-dev-spain.png':['samsung-dev-spain.png','image/png']};
export const server=http.createServer(async(req,res)=>{
 res.setHeader('cache-control','no-store');res.setHeader('x-content-type-options','nosniff');
 res.setHeader('content-security-policy',"default-src 'self'; connect-src 'self'; style-src 'self'; img-src 'self' data:; script-src 'self'; frame-ancestors 'none'");
 const send=(status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
 try{
  if(!['127.0.0.1','localhost','[::1]'].includes(new URL('http://'+req.headers.host).hostname))throw fail('HOST_REJECTED','Host no permitido.',403);
  if(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host)throw fail('ORIGIN_REJECTED','Origen no permitido.',403);
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/evaluar'||path.startsWith('/evaluar/')){
   const plugin=await evaluator.load();
   if(!plugin)return send(404,{ok:false,error:'NOT_FOUND',message:'Evaluador no instalado.'});
   return await plugin.handle(req,res,path);
  }
  if(evaluator.running&&req.method==='POST'&&['/api/message','/api/reset'].includes(path)&&req.headers['x-evaluation-token']!==evaluationToken)
   return send(423,{ok:false,error:'EVALUATION_RUNNING',message:'Evaluación en curso. Espera a que termine.'});
  if(req.method==='GET'&&assets[path]){
   const [name,type]=assets[path];const file=await readFile(fileURLToPath(new URL('../public/'+name,import.meta.url)));
   res.writeHead(200,{'content-type':type+'; charset=utf-8'});res.end(file);return;
  }
  if(req.method==='GET'&&path==='/api/status'){
   let available=false;
   try{const r=await fetch(config.base+'/models',{signal:AbortSignal.timeout(2000),redirect:'error'});const j=await r.json();available=r.ok&&j.data?.some(m=>m.id===config.model)===true;}catch{}
   return send(200,{ok:true,model:config.model,model_available:available,inference_verified:inferenceVerified,request_timeout_ms:2*config.timeout+15000});
  }
  if(req.method==='GET'&&path==='/api/inventory')return send(200,{ok:true,inventory:service.snapshot()});
  if(req.method==='GET'&&path==='/api/dossier')return send(200,{ok:true,dossier});
  if(req.method==='POST'&&['/api/message','/api/reset'].includes(path)){
   let raw='',bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>16384)throw fail('BODY_TOO_LARGE','Máximo 16 KiB.',413);raw+=chunk;}
   let body;try{body=JSON.parse(raw);}catch{throw fail('INVALID_JSON','Cuerpo JSON inválido.');}
   if(path==='/api/reset'){if(body?.confirm!==true)throw fail('INVALID_INPUT','Confirma el reinicio.');return send(200,{ok:true,inventory:await service.reset()});}
   return send(200,await service.process(body));
  }
  send(404,{ok:false,error:'NOT_FOUND',message:'Ruta inexistente.'});
 }catch(e){send(e.status||500,{ok:false,error:e.code||'INTERNAL_ERROR',message:e.code?e.message:'Error interno.',calls:e.calls||[]});}
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'Puerto ocupado. Cambia PORT en .env (por ejemplo 3052) y vuelve a ejecutar npm start.':e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log('Operación Galaxy: http://127.0.0.1:'+server.address().port));
