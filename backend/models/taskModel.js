// =============================================
// Modelo de Tareas
// Consultas parametrizadas para prevenir SQL Injection (RNF1)
// =============================================

const { pool } = require('../config/database');

const TaskModel = {
  // Obtener todas las tareas de un usuario
  async findAllByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  // Buscar tarea por ID
  async findById(taskId) {
    const [rows] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );
    return rows[0] || null;
  },

  // Crear nueva tarea
  async create(userId, title, description, deadline) {
    const [result] = await pool.execute(
      'INSERT INTO tasks (user_id, title, description, deadline) VALUES (?, ?, ?, ?)',
      [userId, title, description, deadline]
    );
    return result.insertId;
  },

  // Actualizar tarea
  async update(taskId, title, description, status, deadline) {
    const [result] = await pool.execute(
      'UPDATE tasks SET title = ?, description = ?, status = ?, deadline = ? WHERE id = ?',
      [title, description, status, deadline, taskId]
    );
    return result.affectedRows > 0;
  },

  // Eliminar tarea
  async delete(taskId) {
    const [result] = await pool.execute(
      'DELETE FROM tasks WHERE id = ?',
      [taskId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = TaskModel;
