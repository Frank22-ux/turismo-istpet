const router = require('express').Router();
const AuthController = require('./auth.controller'); // <--- Debe decir AuthController

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

module.exports = router;