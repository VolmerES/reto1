import {json} from '../model.mjs';
import {answerOptions,validateAnswer} from '../prompts.mjs';
export async function answer(message,dossier,inventory,ctx){
 return json(ctx,answerOptions(message,dossier,inventory),validateAnswer);
}
