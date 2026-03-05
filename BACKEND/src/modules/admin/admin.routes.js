const express = require('express');
const router = express.Router();
const AdminController = require('./admin.controller');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

router.get('/stats', verifyToken, requireRoles([1]), AdminController.getStats);
router.get('/recent-reservations', verifyToken, requireRoles([1]), AdminController.getRecentReservations);
router.get('/clientes', verifyToken, requireRoles([1]), AdminController.getClientes);
router.get('/reservas', verifyToken, requireRoles([1]), AdminController.getReservations);

module.exports = router;
