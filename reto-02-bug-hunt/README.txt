BUG HUNT
========

Este es uno de los cinco retos del torneo. Aquí tenéis la API de una tienda online hecha con
Spring Boot: se pueden ver productos, hacer pedidos con cupones y promociones, cancelarlos...

El problema es que tiene 5 bugs. Cada uno tiene su test y ahora mismo los 5 fallan. Vuestro
trabajo es arreglar el código para que pasen. Tenéis 30 minutos.


CÓMO PASAR LOS TESTS
--------------------

No hace falta tener nada instalado. Si no tenéis Java, el script descarga uno solo para este
proyecto. La primera vez tarda unos minutos, así que lanzadlo antes de que empiece el reto.

  Windows:          doble clic en run-tests.cmd
  macOS y Linux:    abrid una terminal en esta carpeta y escribid  ./run-tests.sh
                    (si dice "permission denied":  sh run-tests.sh)

Al terminar veréis algo así:

  Resultado:
    Bug 1   FALLA
    Bug 2   PASA
    ...

Para pasar solo un bug, poned su número:  ./run-tests.sh 3   (en Windows: run-tests.cmd 3)

También podéis abrir la carpeta en IntelliJ, VS Code o Eclipse como proyecto Maven y lanzar los
tests desde ahí. Y si tenéis el proyecto en GitHub, podéis trabajar desde el navegador sin
instalar nada: botón "Code", pestaña "Codespaces", "Create codespace", y en la terminal
./run-tests.sh


DÓNDE ESTÁ CADA COSA
--------------------

  src/main          el código de la tienda. Aquí están los bugs.
  src/test          los 5 tests, uno por bug (de Bug1... a Bug5...).
  RESPUESTAS.txt    donde contáis qué fallaba en cada bug.


NORMAS
------

- No toquéis nada de src/test. Al corregir pasamos también otros tests que no veis, que
  prueban lo mismo con otros datos. Un apaño que solo sirva para que pase el test no cuenta.
- No cambiéis las URLs de la API ni el JSON que entra y sale.
- Podéis pedir hasta 2 pistas, pero cada una os quita 5 puntos.


PUNTOS
------

Cada bug vale 20 puntos, 100 en total:

  10   si está arreglado de verdad (pasa su test y los ocultos)
   4   si su test pasa sin haber tocado los tests
   4   por la calidad del arreglo: que vaya a la causa y no rompa otra cosa
   2   si explicáis bien en RESPUESTAS.txt qué fallaba

Si hay empate, gana el equipo que entregó antes.


ENTREGA
-------

Rellenad RESPUESTAS.txt con una frase por bug y entregad el proyecto como os diga la organización.
