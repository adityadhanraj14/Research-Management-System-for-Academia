const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);
// router.post('/forgot-password', authController.forgot_password);
// router.get('/reset-password/:token', authController.reset_password_get);
// router.post('/reset-password/:token', authController.reset_password_post);

module.exports = router;