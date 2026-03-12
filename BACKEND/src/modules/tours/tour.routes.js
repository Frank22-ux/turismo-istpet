const router = require('express').Router();
const TourController = require('./tour.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

// Rutas protegidas (requieren token)
// Rutas para Guías
router.get('/available', verifyToken, TourController.getAvailableTours);
router.get('/mis-tours', verifyToken, TourController.getGuiasTours);
router.post('/:id/assign', verifyToken, TourController.assignGuia);
router.delete('/:id/assign', verifyToken, TourController.unassignGuia);

router.post('/', verifyToken, TourController.createTour);
router.get('/', verifyToken, TourController.getTours);
router.get('/:id', verifyToken, TourController.getTourById);
router.put('/:id', verifyToken, TourController.updateTour);
router.delete('/:id', verifyToken, TourController.deleteTour);

module.exports = router;