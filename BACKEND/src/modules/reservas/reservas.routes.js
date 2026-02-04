const express = require('express');
const router = express.Router();
const { createReserva, getMisReservas } = require('./reservas.controller');

// 1. Quitamos la 's' a middleware para que coincida con tu carpeta src/middleware
// 2. Cambiamos verificarToken por verifyToken para que coincida con tu archivo
const { verifyToken } = require('../../middleware/auth.middleware');

// Proteger todas las rutas de este archivo
router.use(verifyToken);

/**
 * @route POST /api/reservas
 */
router.post('/', createReserva);

/**
 * @route GET /api/reservas/mis-reservas
 */
router.get('/mis-reservas', getMisReservas);

module.exports = router;