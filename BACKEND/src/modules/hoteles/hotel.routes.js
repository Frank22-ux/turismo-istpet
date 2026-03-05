const express = require('express');
const router = express.Router();
const HotelController = require('./hotel.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

router.post('/', verifyToken, HotelController.createHotel);
router.get('/', HotelController.getHoteles);
router.get('/:id', HotelController.getHotelById);
router.put('/:id', HotelController.updateHotel);
router.delete('/:id', HotelController.deleteHotel);

module.exports = router;
