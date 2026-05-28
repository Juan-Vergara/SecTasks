// =============================================
// SecTask - Servidor Principal
// Sistema de Gestión de Tareas con Seguridad
// =============================================

// Cargar variables de entorno primero
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

// Importar configuraciones
const { testConnection } = require('./config/database');
const { logger, morganStream } = require('./config/logger');
const { generalLimiter } = require('./middlewares/rateLimitMiddleware');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// Crear directorio de logs si no existe
// =============================================
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// =============================================
// Middlewares de Seguridad (RNF4: OWASP Top 10)
// =============================================

// Helmet - Protección de headers HTTP
// Configura headers como X-Content-Type-Options, X-Frame-Options, etc.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://www.google.com/recaptcha/", "https://www.gstatic.com"],
      frameSrc: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  }
}));

// CORS - Configuración de origenes permitidos
app.use(cors({
  origin: `http://localhost:${PORT}`,
  credentials: true // Necesario para cookies
}));

// Rate Limiting General (RNF4)
app.use('/api/', generalLimiter);

// Parsers
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de body
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Morgan - Logs de peticiones HTTP (RNF2)
app.use(morgan('combined', { stream: morganStream }));

// =============================================
// Servir Frontend (archivos estáticos)
// =============================================
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// =============================================
// Rutas de la API
// =============================================
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// =============================================
// Ruta de salud del servidor
// =============================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SecTask API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// =============================================
// Manejo de rutas no encontradas
// =============================================
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado.'
  });
});

// =============================================
// Middleware Global de Manejo de Errores (RNF4)
// No expone detalles internos al cliente
// =============================================
app.use((err, req, res, next) => {
  logger.error(`Error no controlado: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor.'
    // NO exponer err.stack ni detalles (RNF4 - OWASP)
  });
});

// =============================================
// Iniciar servidor
// =============================================
async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await testConnection();

    app.listen(PORT, () => {
      console.log('\n=============================================');
      console.log('  🔒 SecTask - Servidor Iniciado');
      console.log('=============================================');
      console.log(`  🌐 URL:     http://localhost:${PORT}`);
      console.log(`  📡 API:     http://localhost:${PORT}/api`);
      console.log(`  🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('=============================================\n');
      
      logger.info(`Servidor iniciado en puerto ${PORT}`);
    });
  } catch (error) {
    logger.error(`Error al iniciar servidor: ${error.message}`);
    process.exit(1);
  }
}

startServer();
