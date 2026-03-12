const express = require('express');
const router = express.Router();
const ResenaController = require('./resena.controller');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

// Rutas
router.post('/', verifyToken, requireRoles([3]), ResenaController.crearResena); // Solo turistas
router.get('/tour/:id_tour', ResenaController.getResenasByTour);
router.get('/guia/:id_guia', ResenaController.getResenasByGuia);
router.get('/hotel/:id_hotel', ResenaController.getResenasByHotel);
router.get('/recientes', ResenaController.getRecentReviews);

module.exports = router;
