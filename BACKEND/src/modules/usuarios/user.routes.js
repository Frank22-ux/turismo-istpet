const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyToken } = require('../../middleware/auth.middleware'); // <--- IMPORTANTE

// Endpoints
router.get('/perfil', verifyToken, userController.getPerfil);
router.put('/perfil', verifyToken, userController.actualizarPerfil);

module.exports = router;