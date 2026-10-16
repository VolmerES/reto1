# Operación Galaxy
El equipo de producción de una demostración de Galaxy plegables necesita un asistente para consultar información del evento y gestionar los dispositivos de cada sala.

Recibís una aplicación web con la interfaz y el backend unidos. Debéis conectar vuestro modelo local, completar dos funciones e investigar dos errores de inventario para que el asistente responda con fuentes y gestione los dispositivos correctamente.

El resto de la aplicación, incluidos el cliente del modelo, los prompts, los contratos y las comprobaciones, se entrega preparado.

## 1. Conectar el modelo local
Conectad la aplicación con un modelo ejecutado en vuestro ordenador. Recomendamos Qwen3.5-2B como configuración de referencia del ejercicio. La URL del servicio y el identificador del modelo se configuran en .env.

Comprobad una petición real: la aplicación debe enviar el mensaje al modelo y utilizar su respuesta. Las tareas de lenguaje deben ejecutarse localmente, no mediante una API de IA en la nube.

## 2. Interpretar las peticiones
Completad `interpret` en `src/actions/interpret.mjs` para convertir el mensaje del usuario en una intención estructurada mediante una llamada al modelo local. Utilizad el cliente y el esquema preparados.

Por ejemplo, "Asigna dos Fold8 a la Sala Azul" debe identificar la acción de asignar, el modelo Fold8, dos unidades y la Sala Azul. Si faltan datos, no deben inventarse.

## 3. Consultar el dossier y el inventario
Completad `answer` en `src/actions/answer.mjs` para que el modelo responda usando las fichas del evento y el inventario actual que recibe la función.

El recuento de unidades libres, también por familia, y la ubicación de dispositivos por ID ya están implementados. Necesitan que `interpret` obtenga del modelo el tipo de consulta y las unidades; después el backend lee el inventario actual. No tenéis que añadir esa lógica. El resto de consultas utiliza `answer`.

La respuesta debe conservar los datos y las fuentes devueltos por el modelo. Una consulta no debe modificar el inventario. El contrato distingue `found` y `not_found`: si no hay información, el modelo devuelve `not_found`, sin datos ni fuentes, y el backend muestra el aviso de ausencia ya preparado.

<!-- PAGE -->
## 4. Corregir la reserva de dispositivos
Hay un error en la gestión de las reservas. Investigad el comportamiento de `assign` en `src/actions/assign.mjs` y corregidlo. Utilizad la hoja de pruebas para comprobar el resultado.

## 5. Corregir la liberación de dispositivos
Hay un error en la gestión de las liberaciones. Investigad el comportamiento de `release` en `src/actions/release.mjs` y corregidlo. Utilizad la hoja de pruebas para comprobar el resultado.

## Modelo y motor local
Recomendamos utilizar [Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B), exactamente la versión 3.5 de 2B. Es el modelo de referencia con el que se ha validado el ejercicio.

Podéis elegir otro modelo local, pero no garantizamos que produzca las respuestas esperadas ni que supere las mismas validaciones. Los criterios de comprobación no cambian según el modelo.

Podéis elegir el motor local. Recomendamos [Bionic](https://lmstudio.ai/) u [Ollama](https://ollama.com/). El README incluye los identificadores y la configuración.

## Resultado esperado
Completad la hoja de pruebas de la página siguiente desde la aplicación conectada al modelo local. Debéis poder demostrar su funcionamiento con Internet desconectado. Se comprueban los datos, las fuentes y los cambios del inventario, no frases idénticas.

## Entrega y validación
Al terminar, comprimid el proyecto con vuestros cambios y las evidencias de funcionamiento en un archivo ZIP. Subidlo a la misma web de participantes de Samsung desde la que habéis descargado el enunciado y el proyecto.

Una vez subido el ZIP, avisad a Kiko para que valide la aplicación con vuestro equipo y registre los puntos obtenidos.

El README incluye las instrucciones de arranque, configuración, comprobación y preparación del ZIP.

<!-- PAGE -->
# Hoja de pruebas
Restableced el inventario una vez al principio. Enviad estas peticiones en orden, conservando el estado entre pasos. Consultad también el inventario después de cada operación. Las consultas deben aportar la fuente y no cambiar el estado.

## 1. Consultar

- "¿Cuántos dispositivos están libres?" Resultado: 5 unidades disponibles; fuente: inventario.
- "¿Cuál es el aforo y el horario de la Sala Azul?" Resultado: 24 personas, de 16:00 a 19:00; fuente: D01.
- "¿Cuál es la contraseña del wifi?" Resultado: no consta en el dossier, sin inventar una contraseña ni una fuente.

## 2. Reservar

- "Asigna tres Fold8 a la Sala Prensa." Resultado: petición rechazada. Se mantienen las 5 unidades disponibles y el inventario anterior.
- "Asigna dos Fold8 a la Sala Azul." Resultado: F8-01 y F8-02 asignados a Azul. Quedan 3 unidades disponibles en total.
- "¿En qué sala está F8-01?" Resultado: Sala Azul; fuente: inventario.
- "Asigna F8-01 a la Sala Verde." Resultado: petición rechazada; el inventario no cambia.

## 3. Liberar y volver a utilizar

- "Libera F8-01." Después: "¿En qué sala está F8-01?" Resultado: ninguna sala; fuente: inventario. Hay 4 unidades disponibles.
- "Libera F8-01." Resultado: no cambia el inventario respecto al paso anterior.
- "Asigna F8-01 a la Sala Verde." Después: "¿En qué sala está F8-01?" Resultado: Sala Verde; fuente: inventario. Quedan 3 unidades disponibles.

## 4. Completar datos

- "Asigna dos Flip8." Resultado: solicita la sala que falta y no modifica el inventario.

En las respuestas del dossier y del inventario, los datos estructurados y sus fuentes deben corresponder a la respuesta. Conservad evidencias de cada paso y de las llamadas al modelo local. El README incluye las comprobaciones de código que ayudan a localizar fallos.
