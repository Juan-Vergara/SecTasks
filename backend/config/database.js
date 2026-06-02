// =============================================
// Configuración de conexión a MySQL
// Usa pool de conexiones para mejor rendimiento
// =============================================

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sectask_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar conexión al iniciar
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a MySQL establecida correctamente');
    connection.release();
  } catch (error) {
    console.error('Error al conectar a MySQL:', error.message);
    console.error('Verifica que MySQL esté corriendo y la base de datos exista.');
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
