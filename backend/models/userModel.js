// =============================================
// Modelo de Usuario
// Consultas parametrizadas para prevenir SQL Injection (RNF1)
// =============================================

const { pool } = require('../config/database');

const UserModel = {
  // Buscar usuario por email
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  // Buscar usuario por username
  async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0] || null;
  },

  // Buscar usuario por ID
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Crear nuevo usuario
  async create(username, email, passwordHash) {
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    return result.insertId;
  },

  // Actualizar contraseña
  async updatePassword(userId, passwordHash) {
    const [result] = await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, userId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = UserModel;
