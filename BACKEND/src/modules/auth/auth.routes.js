const router = require('express').Router();
const AuthController = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/verify', verifyToken, AuthController.verify);
router.post('/logout', verifyToken, AuthController.logout);

module.exports = router;