// =============================================
// Configuración de Logger (Winston + Morgan)
// RNF2: Logs de Auditoría
// =============================================

const winston = require('winston');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');

// Formato personalizado para los logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let log = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      log += ` | ${JSON.stringify(metadata)}`;
    }
    return log;
  })
);

// Logger principal de la aplicación
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    // Log general - todos los niveles
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3
    }),
    // Solo errores
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 3
    }),
    // Consola en desarrollo
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      )
    })
  ]
});

// Logger específico para auditoría (RNF2)
const auditLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      maxsize: 5242880,
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [AUDIT] ${level}: ${message}`;
        })
      )
    })
  ]
});

// Stream para Morgan (logs HTTP)
const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = { logger, auditLogger, morganStream };
