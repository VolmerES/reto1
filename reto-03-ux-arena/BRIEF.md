# Abre el móvil, amplía la experiencia
**Samsung Dev Challenge · 16 de octubre de 2026**  
Raúl Marín Calleja · Mentor de UX  
**30 minutos de desarrollo · 3–4 minutos de revisión**

## El reto
Buscas alojamiento para una escapada a Soria. Con el móvil cerrado exploras tres opciones y seleccionas hasta dos. Al abrirlo las comparas. En Flex consultas las imágenes y los detalles, con las acciones a mano. La selección se conserva entre los tres contextos.

Programad una experiencia clara, accesible y cuidada. Podéis utilizar IA, respetando las reglas generales del evento. Se evalúa el resultado funcional y visible, no el número de prompts ni la calidad interna del código. No hace falta una presentación.

## Qué tenéis preparado
Un armazón HTML/CSS/JS con tres botones de contexto, datos e imágenes de tres alojamientos ficticios, tres wireframes orientativos y una lámina del arrastre. También se incluye una imagen de referencia y una página para abrirla en otra ventana. Todo funciona localmente, sin instalación ni Internet.

**El área de la aplicación está vacía. Debéis construir la lista, la selección, la comparación y las interacciones.** Los controles exteriores pertenecen al banco de prueba y no puntúan.

## Qué debéis construir
1. **Explorar y comparar.** En Cerrado, consultar tres alojamientos y seleccionar hasta dos. En Abierto, comparar precio, ubicación y servicios alineados; sustituir uno conservando el otro. Puede hacerse con un control Cambiar o quitando uno y eligiendo otro: no se exige un modal.
2. **Adaptación y continuidad.** Conservar las selecciones al cambiar de contexto. En Flex, repartir imágenes, información y acciones entre las dos mitades, dejando libre el pliegue. Debe poder consultarse la comparación y utilizarse una acción principal en la mitad inferior.
3. **Accesibilidad de la tarea.** Seleccionar dos alojamientos y sustituir uno solo con teclado, viendo siempre qué control tiene el foco. La selección se reconoce mediante texto, icono o marca, además del color.
4. **Diseño y experiencia de usuario.** Crear una interfaz clara, coherente y fácil de usar. Se valoran en conjunto las imágenes, la tipografía y el color, la composición y la respuesta a las acciones. Suma que el resultado se parezca a un producto real: creíble y consistente en los tres contextos. Se puede usar el material suministrado y obtener todos los puntos; no se exige comprar recursos ni añadir fotografías externas.
5. **Referencia, opcional.** En Abierto, incorporar la imagen suministrada mediante arrastre y mediante un botón Elegir imagen. Mostrarla junto a la comparación, conservarla al cambiar de contexto y permitir eliminarla. La comparación mantiene sus dos alojamientos.

## Para qué sirve la referencia
Has visto una terraza que te gusta y quieres recordarla mientras comparas. La imagen es una ayuda visual, no otro alojamiento. No se extraen automáticamente precio, ubicación ni servicios. Añadir una nota es opcional y no da puntos adicionales. No hace falta mostrar la referencia en todos los contextos, pero debe seguir disponible al volver a Abierto.

## Empezar
Descomprime el ZIP completo y abre **base/index.html**. Edita **base/app.js** y **base/app.css**; los datos están en **base/datos.js**. Consulta **base/CONTRATO.md**, **Brief-y-rubrica.pdf** y **wireframes-tareas/Wireframes.pdf**.

Entrega la carpeta completa como **equipo-N-ux.zip** y ten preparada la aplicación para revisarla. La organización indicará el canal de entrega. Si usas otro entorno, incluye instrucciones y tenlo funcionando al comenzar la revisión.

## Alcance
Sin backend, inicio de sesión, reservas reales, servicios externos ni guardado después de recargar. Se permite scroll vertical. Los wireframes orientan; no hay que copiar su estilo. Los estados vacíos, los errores de archivos, la nota y las animaciones no añaden requisitos puntuables.

Se prueba en el entorno suministrado, sin necesitar un Fold físico. Medidas convencionales: Cerrado **360 × 740 px**; Abierto y Flex **720 × 740 px**. Flex reserva una franja de **24 px**, desde y=358 hasta y=382. Es una simulación de interfaz, no un emulador de Android.

## Entregar
Entrega el proyecto completo en un archivo llamado equipo-N-ux.zip, con index.html en la raíz y todos los recursos necesarios incluidos. Al descomprimirlo, la aplicación debe funcionar abriendo directamente ese archivo, sin localhost, instalación ni compilación. 
