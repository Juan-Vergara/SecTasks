// =============================================
// Controlador de Autenticación
// Implementa: RNF1 (sanitización), RNF2 (auditoría),
//             RNF3 (tokens expirables), RNF4 (OWASP)
// =============================================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserModel = require('../models/userModel');
const TokenModel = require('../models/tokenModel');
const AuditModel = require('../models/auditModel');
const { logger, auditLogger } = require('../config/logger');

const SALT_ROUNDS = 12;

const AuthController = {
  // =============================================
  // POST /api/auth/register
  // =============================================
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Verificar si el email ya existe
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado.'
        });
      }

      // Verificar si el username ya existe
      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: 'El nombre de usuario ya está en uso.'
        });
      }

      // Hash de la contraseña con bcrypt
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Crear usuario
      const userId = await UserModel.create(username, email, passwordHash);

      // Registrar evento de auditoría (RNF2)
      await AuditModel.log(userId, 'REGISTRO_USUARIO', `Usuario ${username} registrado`, req.ip);
      auditLogger.info(`Nuevo usuario registrado: ${username} (${email})`, { userId, ip: req.ip });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente.'
      });

    } catch (error) {
      logger.error(`Error en registro: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.'
      });
    }
  },

  // =============================================
  // POST /api/auth/login
  // =============================================
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuario por email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Registrar intento fallido (RNF2)
        await AuditModel.log(null, 'LOGIN_FALLIDO', `Intento con email: ${email}`, req.ip);
        auditLogger.warn(`Login fallido - email no encontrado: ${email}`, { ip: req.ip });

        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas.'
        });
      }

      // Comparar contraseña con hash
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid) {
        // Registrar intento fallido (RNF2)
        await AuditModel.log(user.id, 'LOGIN_FALLIDO', `Contraseña incorrecta`, req.ip);
        auditLogger.warn(`Login fallido - contraseña incorrecta para: ${email}`, { userId: user.id, ip: req.ip });

        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas.'
        });
      }

      // Generar JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Setear cookie httpOnly (segura)
      res.cookie('token', token, {
        httpOnly: true,       // No accesible desde JavaScript del cliente
        secure: process.env.NODE_ENV === 'production', // HTTPS solo en producción
        sameSite: 'strict',   // Protección CSRF
        maxAge: 24 * 60 * 60 * 1000 // 24 horas en milisegundos
      });

      // Registrar login exitoso (RNF2)
      await AuditModel.log(user.id, 'LOGIN_EXITOSO', null, req.ip);
      auditLogger.info(`Login exitoso: ${user.username}`, { userId: user.id, ip: req.ip });

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });

    } catch (error) {
      logger.error(`Error en login: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.'
      });
    }
  },

  // =============================================
  // POST /api/auth/logout
  // =============================================
  async logout(req, res) {
    try {
      // Registrar evento de auditoría (RNF2)
      if (req.user) {
        await AuditModel.log(req.user.id, 'LOGOUT', null, req.ip);
        auditLogger.info(`Logout: ${req.user.username}`, { userId: req.user.id });
      }

      // Limpiar cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente.'
      });

    } catch (error) {
      logger.error(`Error en logout: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.'
      });
    }
  },

  // =============================================
  // POST /api/auth/forgot-password
  // RNF3: Genera token temporal con expiración
  // =============================================
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await UserModel.findByEmail(email);

      // Siempre responder igual (no revelar si el email existe)
      if (!user) {
        return res.json({
          success: true,
          message: 'Si el email está registrado, se ha generado un enlace de recuperación.'
        });
      }

      // Generar token UUID único
      const resetToken = uuidv4();

      // Calcular fecha de expiración (10 minutos)
      const expiresMinutes = parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES) || 10;
      const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

      // Guardar token en la base de datos
      await TokenModel.create(user.id, resetToken, expiresAt);

      // === EN DESARROLLO: Mostrar token en consola (sin enviar email) ===
      const resetUrl = `http://localhost:${process.env.PORT || 3000}/reset-password.html?token=${resetToken}`;
      
      console.log('\n------------------------------------');
      console.log(' TOKEN DE RECUPERACIÓN DE CONTRASEÑA');
      console.log('------------------------------------');
      console.log(`   Usuario: ${user.username} (${user.email})`);
      console.log(`   Token:   ${resetToken}`);
      console.log(`   URL:     ${resetUrl}`);
      console.log(`   Expira:  ${expiresAt.toLocaleString()}`);
      console.log('------------------------------------\n');

      // Registrar evento (RNF2)
      await AuditModel.log(user.id, 'SOLICITUD_RESET_PASSWORD', null, req.ip);
      auditLogger.info(`Solicitud de reset de contraseña: ${user.email}`, { userId: user.id, ip: req.ip });

      res.json({
        success: true,
        message: 'Si el email está registrado, se ha generado un enlace de recuperación.',
        // Solo en desarrollo: incluir el token en la respuesta
        ...(process.env.NODE_ENV === 'development' && {
          dev_resetUrl: resetUrl,
          dev_token: resetToken,
          dev_expiresAt: expiresAt
        })
      });

    } catch (error) {
      logger.error(`Error en forgot-password: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.'
      });
    }
  },

  // =============================================
  // POST /api/auth/reset-password
  // RNF3: Verifica token y cambia contraseña
  // =============================================
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // Buscar token válido (no expirado, no usado)
      const tokenRecord = await TokenModel.findValidToken(token);

      if (!tokenRecord) {
        auditLogger.warn(`Intento de reset con token inválido/expirado`, { ip: req.ip });
        return res.status(400).json({
          success: false,
          message: 'El token es inválido o ha expirado.'
        });
      }

      // Hash de la nueva contraseña
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Actualizar contraseña del usuario
      await UserModel.updatePassword(tokenRecord.user_id, passwordHash);

      // Marcar token como usado
      await TokenModel.markAsUsed(tokenRecord.id);

      // Registrar evento (RNF2)
      await AuditModel.log(tokenRecord.user_id, 'RESET_PASSWORD_EXITOSO', null, req.ip);
      auditLogger.info(`Contraseña reseteada: ${tokenRecord.username}`, { userId: tokenRecord.user_id, ip: req.ip });

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente. Ya puede iniciar sesión.'
      });

    } catch (error) {
      logger.error(`Error en reset-password: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.'
      });
    }
  },

  // =============================================
  // GET /api/auth/me — Verificar sesión activa
  // =============================================
  async me(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado.'
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      logger.error(`Error en /me: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.'
      });
    }
  }
};

module.exports = AuthController;
