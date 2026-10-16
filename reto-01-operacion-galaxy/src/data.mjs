// Datos iniciales del ejercicio, compartidos por el backend y el comprobador.
export const inventory = {
  models: [
    { id: 'FOLD8', name: 'Samsung Galaxy Z Fold8', year: 2026 },
    { id: 'FOLD8_ULTRA', name: 'Samsung Galaxy Z Fold8 Ultra', year: 2026 },
    { id: 'FLIP8', name: 'Samsung Galaxy Z Flip8', year: 2026 }
  ],
  rooms: [{ id: 'AZUL', name: 'Sala Azul' }, { id: 'VERDE', name: 'Sala Verde' }, { id: 'PRENSA', name: 'Sala Prensa' }, { id: 'TALLER', name: 'Sala Taller' }],
  devices: [
    { id: 'F8-01', model_id: 'FOLD8', status: 'available', room_id: null },
    { id: 'F8-02', model_id: 'FOLD8', status: 'available', room_id: null },
    { id: 'F8-03', model_id: 'FOLD8', status: 'assigned', room_id: 'AZUL' },
    { id: 'F8U-01', model_id: 'FOLD8_ULTRA', status: 'available', room_id: null },
    { id: 'F8U-02', model_id: 'FOLD8_ULTRA', status: 'assigned', room_id: 'VERDE' },
    { id: 'FP8-01', model_id: 'FLIP8', status: 'available', room_id: null },
    { id: 'FP8-02', model_id: 'FLIP8', status: 'available', room_id: null },
    { id: 'FP8-03', model_id: 'FLIP8', status: 'assigned', room_id: 'TALLER' }
  ]
};
export const dossier = [
  { id: 'D01', title: 'Sala Azul', text: 'Aforo máximo de 24 personas. Abierta de 16:00 a 19:00.' },
  { id: 'D02', title: 'Demo Galaxy Z Fold8', text: 'La demostración de Galaxy Z Fold8 en la Sala Azul termina a las 18:00.' },
  { id: 'D03', title: 'Demo Galaxy Z Fold8 Ultra', text: 'La demostración de Galaxy Z Fold8 Ultra en la Sala Verde va de 16:30 a 18:30.' },
  { id: 'D04', title: 'Asignaciones', text: 'Una unidad permanece asignada a su sala hasta que se registra una liberación explícita.' },
  { id: 'D05', title: 'Uso de dispositivos', text: 'Los dispositivos de demostración deben permanecer en las mesas señalizadas.' },
  { id: 'D06', title: 'Asistencia técnica', text: 'El equipo técnico está en el punto de soporte junto a la entrada norte.' },
  { id: 'D07', title: 'Sala Taller · Galaxy Z Flip8', text: 'Aforo de 16 personas. Sala abierta de 16:00 a 19:00. La demo de Galaxy Z Flip8 va de 17:00 a 18:00.' },
  { id: 'D08', title: 'Sala Prensa', text: 'Aforo de 12 personas. Abierta de 16:00 a 19:00 para demostraciones al equipo de prensa.' }
];

