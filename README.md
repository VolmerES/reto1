# Operación Galaxy

El encargo y la hoja de pruebas están en [ENUNCIADO.md](ENUNCIADO.md).

## Qué recibís y qué debéis completar

La interfaz, el servidor, las rutas, los datos ficticios, el cliente del modelo, los prompts y las validaciones ya están preparados. El trabajo se concentra en la configuración y cuatro funciones:

| Trabajo | Archivo |
| --- | --- |
| Conectar vuestro modelo local | `.env` |
| Completar `interpret`: interpretar las peticiones con el modelo | [src/actions/interpret.mjs](src/actions/interpret.mjs) |
| Completar `answer`: responder con contexto y fuentes | [src/actions/answer.mjs](src/actions/answer.mjs) |
| Investigar y corregir la reserva | [src/actions/assign.mjs](src/actions/assign.mjs) |
| Investigar y corregir la liberación | [src/actions/release.mjs](src/actions/release.mjs) |

El enunciado define el trabajo y los resultados esperados. No hay que construir otro frontend, reescribir el cliente HTTP ni modificar los prompts, contratos o comprobadores.

## Arranque

Necesitáis Node.js 22 o posterior y un modelo descargado y cargado localmente. Recomendamos Qwen3.5-2B, exactamente la versión 3.5 de 2B: es la configuración de referencia con la que se ha validado el ejercicio.

Podéis utilizar otro modelo local compatible con el cliente preparado, pero no garantizamos las mismas respuestas ni que supere las validaciones. Los criterios no cambian según el modelo. Para seguir la configuración de referencia, utilizad Qwen3.5-2B. No se admiten variantes cloud.

Recomendamos [Bionic](https://lmstudio.ai/) u [Ollama](https://ollama.com/). El motor debe exponer una API compatible con Chat Completions, salida estructurada JSON y `reasoning_effort: "none"`. Este ajuste ya viene preparado en el cliente; no tenéis que implementarlo.

Configuraciones de referencia verificadas en macOS:

| Motor | MODEL_BASE_URL | MODEL_ID |
| --- | --- | --- |
| Ollama 0.40.2 | `http://127.0.0.1:11434/v1` | `qwen3.5:2b` |
| Bionic | `http://127.0.0.1:1234/v1` | `qwen3.5-2b-mlx` |

En Ollama, descargad el modelo con `ollama pull qwen3.5:2b`. En Bionic se ha comprobado `mlx-community/Qwen3.5-2B-MLX-4bit`. Usad el identificador exacto con el que lo sirva vuestro motor. Estas pruebas no acreditan otras cuantizaciones, Windows ni otros motores.

Desde la raíz del proyecto:

```sh
cp .env.example .env
npm ci
```

Configurad en `.env`:

- `MODEL_BASE_URL`: URL HTTP local terminada en `/v1`, con `127.0.0.1`, `localhost` o `[::1]`. Ejemplos orientativos: `http://127.0.0.1:1234/v1` o `http://127.0.0.1:11434/v1`.
- `MODEL_ID`: identificador exacto del modelo local elegido, cargado en vuestro motor. Recomendado: Qwen3.5-2B.

Después:

```sh
npm run check:connection
npm start
```

Abrid la URL que muestra la consola. La comprobación de conexión realiza una inferencia real y puede pasar aunque las cuatro funciones sigan pendientes. No acredita que el ejercicio esté terminado.

`PORT` y `MODEL_TIMEOUT_MS` están en `.env.example`. Reiniciad la aplicación después de cambiar código o configuración. El modelo debe ejecutarse en este ordenador, no en un servicio cloud.

## Consultas ya preparadas

Una vez completada `interpret`, el modelo identifica la petición y el backend resuelve:

- `count_available`: recuento actual de dispositivos libres, en total o de una familia.
- `location`: ubicación actual de las unidades indicadas por ID.

Ambas respuestas usan el inventario actual y la fuente `inventory`. No tenéis que implementar esas consultas. En los recuentos, consultad una familia cada vez: Fold8, Fold8 Ultra o Flip8.

La validación preparada conserva la familia indicada explícitamente y rechaza peticiones con familia e ID incompatibles, sin modificar el inventario. No tenéis que añadir esta lógica.

Las demás consultas (`other`), incluidas las del dossier y los datos ausentes, pasan por `answer`. Esta función debe utilizar el contexto recibido y conservar datos y fuentes válidos. El aviso de ausencia de información ya está preparado para las respuestas `not_found`.

[API.md](API.md) contiene el contrato completo. Los esquemas y prompts están en [src/contracts.mjs](src/contracts.mjs) y [src/prompts.mjs](src/prompts.mjs).

## Comprobar el trabajo

```sh
npm run check
npm run check -- extraccion
npm run check -- consulta
npm run check -- reserva
npm run check -- liberacion
npm run check:flow
npm test
```

- `check`: pruebas de las cuatro funciones con transporte simulado, sin inferencia real. Los comandos por apartado permiten comprobar cada parte por separado.
- `check:flow`: recorrido breve con el modelo real, en un servidor temporal independiente. No sustituye la hoja completa del enunciado.
- `test`: pruebas de infraestructura y lógica preparada, con errores de modelo simulados. Pueden pasar con el ejercicio todavía sin resolver.

Al principio, `NOT_IMPLEMENTED` indica una función pendiente; los fallos de reserva y liberación forman parte del ejercicio. Un error `MODEL_*` requiere revisar la conexión o la salida del modelo, no se considera una operación confirmada.

Los comandos `check:connection`, `check` y `check:flow` guardan sus resultados en `results/`. Al terminar, ejecutad también la hoja del enunciado en la aplicación, desde el inventario restablecido y conservando el estado entre pasos. Comprobad su funcionamiento con Internet desconectado y el modelo local activo.

## Reglas del servicio

El cliente admite como máximo dos llamadas al modelo por petición. Puede reparar una salida inválida si queda presupuesto; no reintenta timeouts ni indisponibilidad. Conservad la evidencia de llamadas y propagad los errores, sin sustituir inferencia por respuestas fijas.

El inventario se mantiene durante la ejecución. Restablecerlo o reiniciar el servidor recupera el estado inicial; recargar la página no lo cambia. Las consultas y las operaciones rechazadas no deben alterar el inventario.

## Entrega

Al terminar, comprimid el proyecto con vuestros cambios y las evidencias de funcionamiento en un archivo ZIP. Indicad el motor y el identificador del modelo utilizados. Excluid `.env` personal, pesos del modelo, `node_modules` y archivos ajenos al ejercicio.

Subid el ZIP a la misma web de participantes de Samsung desde la que habéis descargado el enunciado y el proyecto. Una vez subido, avisad a Kiko para que valide la aplicación con vuestro equipo y registre los puntos obtenidos.
