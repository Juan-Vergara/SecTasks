// =============================================
// Middleware de Rate Limiting
// RNF4: Protección contra fuerza bruta y DoS
// =============================================

const rateLimit = require('express-rate-limit');
const { auditLogger } = require('../config/logger');

// Rate limiter para intentos de login
// Máximo 5 intentos cada 15 minutos por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Intente de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    auditLogger.warn(`Rate limit alcanzado en LOGIN`, {
      ip: req.ip,
      email: req.body.email || 'desconocido'
    });
    res.status(429).json(options.message);
  }
});

// Rate limiter general para la API
// Máximo 100 requests cada 15 minutos por IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intente de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    auditLogger.warn(`Rate limit general alcanzado`, {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json(options.message);
  }
});

// Rate limiter para recuperación de contraseña
// Máximo 3 solicitudes cada 30 minutos por IP
const passwordResetLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutos
  max: 3,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de recuperación. Intente de nuevo en 30 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    auditLogger.warn(`Rate limit alcanzado en PASSWORD RESET`, {
      ip: req.ip
    });
    res.status(429).json(options.message);
  }
});

module.exports = { loginLimiter, generalLimiter, passwordResetLimiter };
