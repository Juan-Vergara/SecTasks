// =============================================
// Controlador de Tareas
// Implementa: RNF1 (sanitización), RNF2 (auditoría)
// =============================================

const TaskModel = require('../models/taskModel');
const AuditModel = require('../models/auditModel');
const { logger, auditLogger } = require('../config/logger');

const TaskController = {
  // =============================================
  // GET /api/tasks — Listar tareas del usuario
  // =============================================
  async getTasks(req, res) {
    try {
      const tasks = await TaskModel.findAllByUserId(req.user.id);

      res.json({
        success: true,
        tasks
      });

    } catch (error) {
      logger.error(`Error al obtener tareas: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.'
      });
    }
  },

  // =============================================
  // POST /api/tasks — Crear tarea
  // =============================================
  async createTask(req, res) {
    try {
      const { title, description, deadline } = req.body;

      const taskId = await TaskModel.create(req.user.id, title, description || '', deadline || null);

      // Registrar evento de auditoría (RNF2)
      await AuditModel.log(
        req.user.id,
        'TAREA_CREADA',
        `Tarea "${title}" creada (ID: ${taskId})`,
        req.ip
      );
      auditLogger.info(`Tarea creada: "${title}" por ${req.user.username}`, {
        taskId,
        userId: req.user.id,
        deadline: deadline || null
      });

      res.status(201).json({
        success: true,
        message: 'Tarea creada exitosamente.',
        taskId
      });

    } catch (error) {
      logger.error(`Error al crear tarea: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.'
      });
    }
  },

  // =============================================
  // PUT /api/tasks/:id — Editar tarea
  // =============================================
  async updateTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const { title, description, status, deadline } = req.body;

      // Verificar que la tarea existe y pertenece al usuario
      const task = await TaskModel.findById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada.'
        });
      }

      if (task.user_id !== req.user.id) {
        auditLogger.warn(`Intento de editar tarea ajena`, {
          taskId,
          ownerId: task.user_id,
          attemptBy: req.user.id,
          ip: req.ip
        });
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para editar esta tarea.'
        });
      }

      // Actualizar tarea
      await TaskModel.update(
        taskId,
        title || task.title,
        description !== undefined ? description : task.description,
        status || task.status,
        deadline !== undefined ? deadline : task.deadline
      );

      // Registrar evento de auditoría (RNF2)
      await AuditModel.log(
        req.user.id,
        'TAREA_EDITADA',
        `Tarea ID: ${taskId} editada`,
        req.ip
      );
      auditLogger.info(`Tarea editada: ID ${taskId} por ${req.user.username}`, {
        taskId,
        userId: req.user.id,
        deadline: deadline
      });

      res.json({
        success: true,
        message: 'Tarea actualizada exitosamente.'
      });

    } catch (error) {
      logger.error(`Error al editar tarea: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.'
      });
    }
  },

  // =============================================
  // DELETE /api/tasks/:id — Eliminar tarea
  // =============================================
  async deleteTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);

      // Verificar que la tarea existe y pertenece al usuario
      const task = await TaskModel.findById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada.'
        });
      }

      if (task.user_id !== req.user.id) {
        auditLogger.warn(`Intento de eliminar tarea ajena`, {
          taskId,
          ownerId: task.user_id,
          attemptBy: req.user.id,
          ip: req.ip
        });
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para eliminar esta tarea.'
        });
      }

      // Eliminar tarea
      await TaskModel.delete(taskId);

      // Registrar evento de auditoría (RNF2)
      await AuditModel.log(
        req.user.id,
        'TAREA_ELIMINADA',
        `Tarea "${task.title}" (ID: ${taskId}) eliminada`,
        req.ip
      );
      auditLogger.info(`Tarea eliminada: "${task.title}" por ${req.user.username}`, {
        taskId,
        userId: req.user.id
      });

      res.json({
        success: true,
        message: 'Tarea eliminada exitosamente.'
      });

    } catch (error) {
      logger.error(`Error al eliminar tarea: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.'
      });
    }
  }
};

module.exports = TaskController;
