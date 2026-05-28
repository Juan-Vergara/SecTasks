// =============================================
// Modelo de Token de Recuperación de Contraseña
// RNF3: Tokens expirables para reset de contraseña
// =============================================

const { pool } = require('../config/database');

const TokenModel = {
  // Crear token de recuperación
  async create(userId, token, expiresAt) {
    // Invalidar tokens anteriores del mismo usuario
    await pool.execute(
      'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ? AND used = FALSE',
      [userId]
    );

    const [result] = await pool.execute(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
    return result.insertId;
  },

  // Buscar token válido (no expirado y no usado)
  async findValidToken(token) {
    const [rows] = await pool.execute(
      `SELECT prt.*, u.email, u.username 
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = ? 
         AND prt.used = FALSE 
         AND prt.expires_at > NOW()`,
      [token]
    );
    return rows[0] || null;
  },

  // Marcar token como usado
  async markAsUsed(tokenId) {
    const [result] = await pool.execute(
      'UPDATE password_reset_tokens SET used = TRUE WHERE id = ?',
      [tokenId]
    );
    return result.affectedRows > 0;
  },

  // Limpiar tokens expirados (mantenimiento)
  async deleteExpired() {
    const [result] = await pool.execute(
      'DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = TRUE'
    );
    return result.affectedRows;
  }
};

module.exports = TokenModel;
