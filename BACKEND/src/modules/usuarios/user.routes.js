const express = require('express');
const router = express.Router();

// Importaciones
const userController = require('./user.controller'); 
const guiaController = require('./guia.controller'); 
const { verifyToken } = require('../../middleware/auth.middleware');

// ==========================================
// --- RUTAS DE PERFIL (USUARIOS GENERAL) ---
// ==========================================
router.get('/perfil', verifyToken, userController.getPerfil);
router.put('/perfil-actualizar', verifyToken, userController.actualizarPerfil);

// ==========================================
// --- RUTAS DE GESTIÓN DE GUÍAS ---
// ==========================================

// 1. LISTAR TODOS LOS GUÍAS
router.get('/guias-lista', verifyToken, guiaController.listarGuias);

// 2. OBTENER DETALLE DE UN GUÍA (Para ver o para cargar en el formulario de edición)
router.get('/guia/:id', verifyToken, guiaController.obtenerGuiaPorId);

// 3. REGISTRAR / CREAR GUÍA
router.post('/registrar-guia', verifyToken, guiaController.registrarNuevoGuia);

// 4. ACTUALIZAR GUÍA
router.put('/guia/:id', verifyToken, guiaController.actualizarGuia);

// 5. ELIMINAR / DESVINCULAR GUÍA
router.delete('/guia/:id', verifyToken, guiaController.eliminarGuia);

module.exports = router;