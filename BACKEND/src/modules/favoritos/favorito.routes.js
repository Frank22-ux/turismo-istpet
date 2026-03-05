const express = require('express');
const router = express.Router();
const FavoritoController = require('./favorito.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

router.post('/', verifyToken, FavoritoController.addFavorito);
router.delete('/', verifyToken, FavoritoController.removeFavorito);
router.get('/', verifyToken, FavoritoController.getMisFavoritos);

module.exports = router;
