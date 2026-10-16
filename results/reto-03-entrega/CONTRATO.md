# Contrato del armazón
Editad app.js y app.css. Los datos están en window.alojamientos y window.atributos (datos.js). index.html, entorno.js y entorno.css proporcionan el entorno de prueba; sus controles exteriores no puntúan.

## Contexto
window.foldState = {mode, width, height, hinge}
- mode: cerrado | abierto | flex
- width: 360 o 720; height: 740
- hinge: null o {top:358, height:24}

El atributo #experience[data-mode] refleja el contexto. Cambiarlo emite el evento foldchange sin recargar la página. El primer render lee window.foldState directamente.

La aplicación vive en #app, no en un iframe. Las media queries responden al navegador completo. Podéis usar #experience[data-mode="abierto"] y #experience[data-mode="flex"].

## Trabajo de los participantes
La base presenta solo un mensaje de espacio vacío. Los datos e imágenes están preparados, pero no hay listado, selección, comparación, adaptación interior ni receptor de imágenes implementados. Debéis construirlos. Guardad selección y referencia fuera del renderizado para mantenerlas entre contextos.

## Flex
Dos áreas de 358 px separadas por 24 px. La guía visible no reserva el espacio automáticamente. Una opción es una rejilla de filas 358px 24px 358px y scroll vertical dentro de cada panel.

## Teclado
Los controles nativos facilitan la activación mediante teclado. Comprobad el foco visible y su continuidad si reemplazáis contenido al renderizar. La selección debe tener una señal adicional al color.

## Referencia opcional
El origen suministrado entrega la URL absoluta de recursos/referencia-terraza.svg en text/uri-list y text/plain. El receptor permite dragover y procesa drop. El equipo implementa la zona receptora y los mensajes.

El botón Elegir imagen debe abrir un selector de archivos. La revisión utiliza el mismo referencia-terraza.svg. Mostrad la imagen, conservadla entre contextos y permitid eliminarla. No se exige importar cualquier web ni extraer atributos de la imagen. El panel lateral sirve para practicar; la revisión usa recursos/referencia.html en otra ventana.

## Evaluación
Consulta RUBRICA.md: cinco criterios, cinco casillas y valores completos, parciales o cero. Las pistas no constituyen requisitos adicionales.
