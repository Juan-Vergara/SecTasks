// =============================================
// Rutas de Tareas
// Todas protegidas con autenticación
// =============================================

const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const { taskCreateValidation, taskUpdateValidation, idParamValidation } = require('../middlewares/validationMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/tasks — Listar tareas del usuario
router.get('/', TaskController.getTasks);

// POST /api/tasks — Crear nueva tarea
router.post('/', taskCreateValidation, TaskController.createTask);

// PUT /api/tasks/:id — Editar tarea
router.put('/:id', idParamValidation, taskUpdateValidation, TaskController.updateTask);

// DELETE /api/tasks/:id — Eliminar tarea
router.delete('/:id', idParamValidation, TaskController.deleteTask);

module.exports = router;
