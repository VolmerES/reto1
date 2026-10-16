# Soria, sin prisa

Interfaz local del reto 3, sin dependencias, conexión ni compilación.

## Abrir

Equipo **Dobles parejas**. Abre `index.html` en la raíz (redirige a `base/index.html`), tanto en el proyecto como en el ZIP de entrega descomprimido. Los botones exteriores simulan Cerrado, Abierto y Flex.

## Recorrido

1. En Cerrado, selecciona hasta dos alojamientos. Las tarjetas se desplazan verticalmente y el botón Comparar permanece disponible abajo.
2. Pulsa Comparar o cambia a Abierto. Los dos selectores permiten cambiar un alojamiento conservando el otro. Un mismo alojamiento no puede ocupar ambos lugares.
3. En Flex, las imágenes ocupan la mitad superior y la comparación y la acción principal la inferior. Hay una franja libre de 24 px en el pliegue; la comparación tiene desplazamiento independiente.
4. Guardar selección confirma los dos alojamientos durante esta visita. No realiza reservas ni persiste tras recargar.
5. En Abierto, arrastra la terraza suministrada al recuadro o utiliza Elegir imagen. Admite JPG, PNG, WebP y SVG de hasta 10 MB. La referencia permanece al cambiar de modo y se puede eliminar.

## Teclado y accesibilidad

Usa Tab y Mayús+Tab para recorrer controles y Enter o Espacio para activar botones. Los selectores nativos permiten cambiar una opción con teclado. El foco se restablece en el control que actualiza la interfaz. Las selecciones tienen texto, marca y estado `aria-pressed`; la tabla incluye encabezados y las acciones anuncian su resultado mediante una región de estado.

## Verificación

Desde esta carpeta, con Node.js disponible: `node --test tests/app.test.mjs`.

Cuatro pruebas de lógica cubren selección y sustitución, huecos y continuidad entre modos, referencia por arrastre, validación de archivos y liberación de URL temporales. No sustituyen una revisión visual ni una prueba real con teclado en el navegador. La política del navegador integrado bloqueó la apertura de archivos `file:`, por lo que esa revisión está pendiente.

El ZIP de entrega es `equipo-dobles-parejas-ux.zip` (en la carpeta superior). Si la organización da un número de equipo, renómbralo a `equipo-N-ux.zip`.

Las ilustraciones de los alojamientos son SVG propios en `base/img/`; `recursos/` queda como lo entregó la organización.
