const express = require('express');
const router = express.Router();
const geocodingController = require('./geocoding.controller');

router.get('/search', geocodingController.search);
router.get('/reverse', geocodingController.reverse);

module.exports = router;
