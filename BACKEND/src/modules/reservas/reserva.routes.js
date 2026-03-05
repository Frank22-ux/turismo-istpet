const express = require('express');
const router = express.Router();
const ReservaController = require('./reserva.controller');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

router.post('/', verifyToken, requireRoles([3]), ReservaController.crearReserva);
router.get('/mis-reservas', verifyToken, requireRoles([3]), ReservaController.getMisReservas);
router.get('/guia', verifyToken, requireRoles([2]), ReservaController.getGuiasReservas);
router.get('/all', verifyToken, requireRoles([1]), ReservaController.getAllReservas);
router.patch('/:id/estado', verifyToken, requireRoles([1]), ReservaController.actualizarEstado);

module.exports = router;
