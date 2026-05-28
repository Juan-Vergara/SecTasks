// =============================================
// Modelo de Logs de Auditoría
// RNF2: Registro de eventos del sistema
// =============================================

const { pool } = require('../config/database');

const AuditModel = {
  // Registrar evento de auditoría en la base de datos
  async log(userId, action, details = null, ipAddress = null) {
    try {
      await pool.execute(
        'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
        [userId, action, details, ipAddress]
      );
    } catch (error) {
      // Si falla el log en BD, no debe romper la aplicación
      console.error('Error al registrar audit log:', error.message);
    }
  },

  // Obtener logs recientes (útil para la demo)
  async getRecent(limit = 50) {
    const [rows] = await pool.execute(
      `SELECT al.*, u.username 
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.timestamp DESC 
       LIMIT ?`,
      [limit.toString()]
    );
    return rows;
  }
};

module.exports = AuditModel;
