const express = require('express');
const router = express.Router();
const AdminController = require('./admin.controller');
const NotificacionController = require('./notificacion.controller');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

router.get('/stats', verifyToken, requireRoles([1]), AdminController.getStats);
router.get('/recent-reservations', verifyToken, requireRoles([1]), AdminController.getRecentReservations);
router.get('/clientes', verifyToken, requireRoles([1]), AdminController.getClientes);
router.get('/clientes/:id', verifyToken, requireRoles([1]), AdminController.getClienteById);
router.put('/clientes/:id', verifyToken, requireRoles([1]), AdminController.updateCliente);
router.delete('/clientes/:id', verifyToken, requireRoles([1]), AdminController.deleteCliente);
router.get('/reservas', verifyToken, requireRoles([1]), AdminController.getReservations);

// Notificaciones
router.get('/notificaciones', verifyToken, requireRoles([1]), NotificacionController.getNotificaciones);
router.put('/notificaciones/:id/leida', verifyToken, requireRoles([1]), NotificacionController.markAsRead);
router.put('/notificaciones/todas-leidas', verifyToken, requireRoles([1]), NotificacionController.markAllAsRead);
router.delete('/notificaciones/todas', verifyToken, requireRoles([1]), NotificacionController.deleteAll);

// Configuración del sistema
router.get('/config', verifyToken, requireRoles([1]), AdminController.getConfig);
router.post('/config', verifyToken, requireRoles([1]), AdminController.saveConfig);

// Backup de base de datos
router.get('/backup', verifyToken, requireRoles([1]), AdminController.downloadBackup);

module.exports = router;
