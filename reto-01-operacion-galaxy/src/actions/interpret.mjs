import {json} from '../model.mjs';
import {intentOptions,validateIntent} from '../prompts.mjs';
// Convierte el mensaje del usuario en una intención estructurada con el modelo local.
// Usa el cliente preparado (json): una llamada con el esquema de intención y, si la salida
// no cumple el contrato, una única reparación dentro del presupuesto de dos llamadas.
// Los datos ausentes quedan en null o [] y nunca se inventan: el backend (normalize)
// cataloga lo que falta y se lo pide al usuario.
export async function interpret(message,ctx){
 return json(ctx,intentOptions(message),validateIntent);
}
