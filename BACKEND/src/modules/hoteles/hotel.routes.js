const express = require('express');
const router = express.Router();
const hotelController = require('./hotel.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

// --- RUTAS PÚBLICAS ---
// Obtener todos los hoteles
router.get('/', hotelController.getHoteles);

// Obtener un hotel específico por ID (Para Detalles y carga de Edición)
router.get('/:id', hotelController.getHotelById);

// --- RUTAS PROTEGIDAS (Requieren Token de Administrador) ---
// Registrar un nuevo hotel
router.post('/', verifyToken, hotelController.crearHotel);

// Actualizar un hotel existente (ACTIVADA)
router.put('/:id', verifyToken, hotelController.actualizarHotel); 

// Eliminar un hotel
router.delete('/:id', verifyToken, hotelController.eliminarHotel);

module.exports = router;