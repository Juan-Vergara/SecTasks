// =============================================
// Middleware de Autenticación
// Verifica JWT en cookies httpOnly
// =============================================

const jwt = require('jsonwebtoken');
const { logger } = require('../config/logger');

function authMiddleware(req, res, next) {
  try {
    // Obtener token de la cookie httpOnly
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token de autenticación.'
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar datos del usuario al request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };

    next();
  } catch (error) {
    logger.warn(`Token inválido o expirado: ${error.message}`);
    
    // Limpiar cookie inválida
    res.clearCookie('token');
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado. Por favor, inicie sesión nuevamente.'
    });
  }
}

module.exports = authMiddleware;
