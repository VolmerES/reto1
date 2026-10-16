export function fail(code,message,status=400){return Object.assign(new Error(message),{code,status});}
export function pending(task){throw fail('NOT_IMPLEMENTED',task+': función pendiente. Consulta ENUNCIADO.md.',501);}
