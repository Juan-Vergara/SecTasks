// =============================================
// Middleware de Validación y Sanitización
// RNF1: Validación de datos de entrada
// Usa express-validator para prevenir SQL Injection y XSS
// =============================================

const { body, param, validationResult } = require('express-validator');

// Middleware que procesa los errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación en los datos enviados.',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// === Reglas de Validación para Registro ===
const registerValidation = [
  body('username')
    .trim()
    .escape()
    .isLength({ min: 3, max: 30 })
    .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres.')
    .isAlphanumeric()
    .withMessage('El nombre de usuario solo puede contener letras y números.'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Debe proporcionar un email válido.')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula.')
    .matches(/[0-9]/)
    .withMessage('La contraseña debe contener al menos un número.'),

  handleValidationErrors
];

// === Reglas de Validación para Login ===
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Debe proporcionar un email válido.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida.'),

  handleValidationErrors
];

// === Reglas de Validación para Crear Tarea (incluye deadline) ===
const taskCreateValidation = [
  body('title')
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage('El título debe tener entre 1 y 100 caracteres.'),

  body('description')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres.'),

  body('deadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('La fecha límite debe ser una fecha válida en formato ISO.'),

  handleValidationErrors
];

// === Reglas de Validación para Actualizar Tarea (campo opcional, incluye deadline) ===
const taskUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage('El título debe tener entre 1 y 100 caracteres.'),

  body('description')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres.'),

  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('El estado debe ser: pending, in_progress o completed.'),

  body('deadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('La fecha límite debe ser una fecha válida en formato ISO.'),

  handleValidationErrors
];

// === Reglas de Validación para Forgot Password ===
const forgotPasswordValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Debe proporcionar un email válido.')
    .normalizeEmail(),

  handleValidationErrors
];

// === Reglas de Validación para Reset Password ===
const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('El token es requerido.')
    .trim(),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres.')
    .matches(/[A-Z]/)
    .withMessage('La nueva contraseña debe contener al menos una letra mayúscula.')
    .matches(/[0-9]/)
    .withMessage('La nueva contraseña debe contener al menos un número.'),

  handleValidationErrors
];

// === Validación de parámetro ID ===
const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo.'),

  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  taskCreateValidation,
  taskUpdateValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  idParamValidation,
  handleValidationErrors
};
