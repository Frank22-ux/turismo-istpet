const express = require('express');
const router = express.Router();
const GuiaController = require('./guia.controller');
const { verifyToken, requireRoles } = require('../../middleware/auth.middleware');

// Admin (1) gestiona guías
router.post('/', verifyToken, requireRoles([1]), GuiaController.registrarGuia);
router.get('/', verifyToken, requireRoles([1]), GuiaController.getGuias);
router.put('/:id', verifyToken, requireRoles([1]), GuiaController.updateGuia);
router.delete('/:id', verifyToken, requireRoles([1]), GuiaController.deleteGuia);

module.exports = router;
