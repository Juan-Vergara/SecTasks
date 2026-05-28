// =============================================
// Rutas de Autenticación
// =============================================

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { loginLimiter, passwordResetLimiter } = require('../middlewares/rateLimitMiddleware');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../middlewares/validationMiddleware');
const recaptchaMiddleware = require('../middlewares/recaptchaMiddleware');

// POST /api/auth/register — Registro de usuario
router.post('/register', recaptchaMiddleware, registerValidation, AuthController.register);

// POST /api/auth/login — Inicio de sesión (con rate limiting)
router.post('/login', loginLimiter, recaptchaMiddleware, loginValidation, AuthController.login);

// POST /api/auth/logout — Cierre de sesión (requiere autenticación)
router.post('/logout', authMiddleware, AuthController.logout);

// POST /api/auth/forgot-password — Solicitar recuperación (con rate limiting)
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidation, AuthController.forgotPassword);

// POST /api/auth/reset-password — Cambiar contraseña con token
router.post('/reset-password', resetPasswordValidation, AuthController.resetPassword);

// GET /api/auth/me — Verificar sesión actual (requiere autenticación)
router.get('/me', authMiddleware, AuthController.me);

module.exports = router;
