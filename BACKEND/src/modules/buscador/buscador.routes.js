const express = require('express');
const router = express.Router();
const SearchController = require('./buscador.controller');

router.get('/', SearchController.globalSearch);

module.exports = router;
