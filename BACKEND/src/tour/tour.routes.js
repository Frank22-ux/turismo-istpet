const router = require('express').Router();
const TourController = require('./tour.controller');

// 🚀 LOG DE DIAGNÓSTICO: Si ves esto en la terminal de Docker, el archivo se cargó.
console.log('🚀 === RUTAS DE TOURS CARGADAS CORRECTAMENTE ===');
console.log('🔍 Verificando métodos del controlador:', Object.keys(TourController));

// --- RUTA DE PRUEBA (DEBUG) ---
// Si entras a /api/tours/debug/1 y funciona, el problema es el Controlador.
// Si esto da 404, el problema es Docker o el Index.js
router.get('/debug/:id', (req, res) => {
    console.log(`🛠️ DEBUG: Se recibió el ID ${req.params.id}`);
    res.json({
        status: "success",
        mensaje: "Express está funcionando correctamente",
        id_recibido: req.params.id,
        nota: "Si ves esto, la ruta /:id también debería funcionar"
    });
});

// 1. Rutas generales (Sin ID)
router.get('/', (req, res, next) => {
    console.log('GET /api/tours - Solicitado');
    next();
}, TourController.getTours);

router.post('/', TourController.createTour);

// 2. Rutas específicas (Con ID)
router.get('/:id', (req, res, next) => {
    console.log(`🔍 Buscando datos reales para ID: ${req.params.id}`);
    next();
}, TourController.getTourById); 

router.put('/:id', (req, res, next) => {
    console.log(`📝 Solicitud de actualización para ID: ${req.params.id}`);
    next();
}, TourController.updateTour);

router.delete('/:id', (req, res, next) => {
    console.log(`🗑️ Solicitud de eliminación para ID: ${req.params.id}`);
    next();
}, TourController.deleteTour);

module.exports = router;