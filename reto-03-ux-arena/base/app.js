// Construid vuestra interfaz dentro de #app.
// Recursos disponibles: window.alojamientos y window.atributos (datos.js).
// Contexto disponible: window.foldState y #experience[data-mode].
// Este archivo no implementa ningún nivel del reto.
const app = document.getElementById('app');

function render() {
  // Sustituid este mensaje por vuestra interfaz.
  app.innerHTML = '<p class="placeholder">Espacio para vuestra interfaz</p>';
}

// La infraestructura comunica el contexto sin recargar la página.
window.addEventListener('foldchange', render);
render();
