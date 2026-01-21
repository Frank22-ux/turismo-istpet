const router = require('express').Router(); 
const TourController = require('./tour.controller'); 

router.post('/', TourController.createTour); 
router.get('/', TourController.getTours); 

// --- NUEVAS RUTAS ---
router.get('/:id', TourController.getTourById);    // Obtener uno para el formulario
router.put('/:id', TourController.updateTour);     // Guardar cambios
router.delete('/:id', TourController.deleteTour);  // Eliminar

module.exports = router;