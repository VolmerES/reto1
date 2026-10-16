import {performance} from 'node:perf_hooks';
import {fail} from './errors.mjs';
export const config={
 base:process.env.MODEL_BASE_URL||'',model:process.env.MODEL_ID||'',
 timeout:Number(process.env.MODEL_TIMEOUT_MS||20000)
};
export function assertConfigured(){
 if(!config.base||!config.model)throw fail('MODEL_CONFIG_MISSING','Configura MODEL_BASE_URL y MODEL_ID en .env.',503);
 let u;try{u=new URL(config.base);}catch{throw fail('MODEL_CONFIG_INVALID','MODEL_BASE_URL no es una URL válida.',503);}
 if(u.protocol!=='http:'||!['127.0.0.1','localhost','[::1]'].includes(u.hostname)||u.username||u.password)throw fail('MODEL_CONFIG_INVALID','Usa HTTP loopback sin credenciales.',503);
}
if(!Number.isInteger(config.timeout)||config.timeout<100||config.timeout>45000)throw new Error('MODEL_TIMEOUT_MS debe estar entre 100 y 45000.');
export let inferenceVerified=false;
export function context(requestId='local',transport=fetch){return {requestId,calls:[],transport};}
export async function complete(ctx,{system,user,schema}){
 assertConfigured();
 if(ctx.calls.length>=2)throw fail('MODEL_CALL_LIMIT','Máximo dos llamadas al modelo por petición.',502);
 const record={request_id:ctx.requestId,model:config.model,started_at:new Date().toISOString(),duration_ms:0,outcome:'pending'};
 ctx.calls.push(record);
 const start=performance.now(),controller=new AbortController();
 let timer;
 try{
  const work=(async()=>{
   const response=await ctx.transport(config.base.replace(/\/$/,'')+'/chat/completions',{
    method:'POST',redirect:'error',headers:{'content-type':'application/json'},signal:controller.signal,
    body:JSON.stringify({model:config.model,messages:[{role:'system',content:system},{role:'user',content:user}],
     temperature:0,max_tokens:1200,stream:false,reasoning_effort:'none',
     ...(schema?{response_format:{type:'json_schema',json_schema:{name:'galaxy',strict:true,schema}}}:{})})
   });
   if(!response.ok)throw fail('MODEL_UNAVAILABLE','El servidor de inferencia ha rechazado la llamada.',503);
   const data=await response.json();
   if(data.model!==config.model)throw fail('MODEL_OUTPUT_INVALID','El servidor devolvió otro identificador de modelo.',502);
   record.returned_model=data.model;
   const text=data.choices?.[0]?.message?.content;
   if(typeof text!=='string'||!text.trim())throw fail('MODEL_OUTPUT_INVALID','Respuesta de modelo vacía.',502);
   return text;
  })();
  const text=await Promise.race([work,new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(fail('MODEL_TIMEOUT','El modelo superó el tiempo por llamada.',504));},config.timeout);})]);
  inferenceVerified=true;record.outcome='ok';record.output=text;return text;
 }catch(e){record.outcome=e.code||'MODEL_UNAVAILABLE';throw e.code?e:fail('MODEL_UNAVAILABLE','No se pudo conectar con el modelo local.',503);}
 finally{clearTimeout(timer);record.duration_ms=Math.round(performance.now()-start);}
}
export async function json(ctx,options,validate){
 let issue='';
 for(;;){
  const text=await complete(ctx,{...options,user:options.user+issue});
  try{return validate(JSON.parse(text));}
  catch(e){
   if(!(e instanceof SyntaxError)&&e.code!=='MODEL_OUTPUT_INVALID')throw e;
   if(ctx.calls.length>=2)throw fail('MODEL_OUTPUT_INVALID','Salida inválida tras agotar el presupuesto de dos llamadas.',502);
   issue='\nCorrige tu salida anterior: '+text+'\nError de contrato: '+e.message+'\nDevuelve el objeto completo corregido. Usa únicamente los datos proporcionados.';
  }
 }
}
