// =============================================
// Tasks.js - Lógica de Gestión de Tareas
// CRUD de tareas en el dashboard
// =============================================

let currentEditId = null;

// === HELPER FECHA LÍMITE ===
function formatDeadline(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Cargar tareas del usuario
async function loadTasks() {
  const container = document.getElementById('task-list');
  container.innerHTML = '<div class="loading-spinner"><div class="spinner-border"></div></div>';
  try {
    const response = await axios.get('/api/tasks');
    const tasks = response.data.tasks;
    if (tasks.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="icon">📋</div><p>No tienes tareas aún.<br>¡Crea tu primera tarea!</p></div>';
      return;
    }
    container.innerHTML = tasks.map(task => renderTaskCard(task)).join('');
  } catch (error) {
    container.innerHTML = '<div class="empty-state"><p>Error al cargar las tareas.</p></div>';
  }
}

// Renderizar una tarjeta de tarea
function renderTaskCard(task) {
  const statusBadge = {
    pending: '<span class="badge-pending">Pendiente</span>',
    in_progress: '<span class="badge-in-progress">En Progreso</span>',
    completed: '<span class="badge-completed">Completada</span>'
  };
  const date = new Date(task.created_at).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  const completedClass = task.status === 'completed' ? 'completed' : '';
  const deadlineHtml = task.deadline ? `<div class="task-deadline mt-2" style="font-size: 0.85em; color: var(--accent-warning);">⏳ Vence: ${formatDeadline(task.deadline)}</div>` : '';
  
  return `
    <div class="task-card ${completedClass} fade-in" data-id="${task.id}">
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
        ${deadlineHtml}
        <div class="task-meta">
          ${statusBadge[task.status] || ''}
          <span class="task-date">📅 ${date}</span>
        </div>
      </div>
      <div class="task-actions">
        ${task.status !== 'completed' ? `<button class="btn btn-sm btn-outline-light" onclick="completeTask(${task.id})" title="Completar">✓</button>` : ''}
        <button class="btn btn-sm btn-outline-light" onclick="openEditModal(${task.id}, '${escapeAttr(task.title)}', '${escapeAttr(task.description || '')}', '${task.status}', '${task.deadline || ''}')" title="Editar">✏️</button>
        <button class="btn btn-sm btn-outline-light" onclick="deleteTask(${task.id}, '${escapeAttr(task.title)}')" title="Eliminar" style="color: var(--accent-danger);">🗑️</button>
      </div>
    </div>`;
}

// Crear tarea
async function handleCreateTask(event) {
  event.preventDefault();
  clearAlert('modal-alert');
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const deadline = document.getElementById('taskDeadline').value || null;
  if (!title) { showAlert('modal-alert', 'danger', 'El título es requerido.'); return; }
  try {
    const response = await axios.post('/api/tasks', { title, description, deadline });
    if (response.data.success) {
      const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('taskModal'));
      modal.hide();
      document.getElementById('taskForm').reset();
      loadTasks();
    }
  } catch (error) {
    const data = error.response?.data;
    let msg = data?.message || 'Error al crear la tarea.';
    if (data?.errors?.length > 0) msg = data.errors.map(e => e.message).join('<br>');
    showAlert('modal-alert', 'danger', msg);
  }
}

// Abrir modal de edición
function openEditModal(id, title, description, status, deadline) {
  currentEditId = id;
  document.getElementById('taskModalLabel').textContent = 'Editar Tarea';
  document.getElementById('taskTitle').value = unescapeHtml(title);
  document.getElementById('taskDescription').value = unescapeHtml(description);
  document.getElementById('taskStatus').value = status;
  
  // Format deadline for datetime-local input (YYYY-MM-DDThh:mm)
  if (deadline) {
    const d = new Date(deadline);
    if (!isNaN(d)) {
      const pad = n => n.toString().padStart(2, '0');
      const localDatetime = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      document.getElementById('taskDeadline').value = localDatetime;
    } else {
      document.getElementById('taskDeadline').value = '';
    }
  } else {
    document.getElementById('taskDeadline').value = '';
  }

  document.getElementById('taskStatusGroup').style.display = 'block';
  document.getElementById('taskDeadlineGroup').style.display = 'block';
  document.getElementById('taskSubmitBtn').textContent = 'Guardar Cambios';
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('taskModal'));
  modal.show();
}

// Abrir modal de creación
function openCreateModal() {
  currentEditId = null;
  document.getElementById('taskModalLabel').textContent = 'Nueva Tarea';
  document.getElementById('taskForm').reset();
  document.getElementById('taskStatusGroup').style.display = 'none';
  document.getElementById('taskDeadlineGroup').style.display = 'block';
  document.getElementById('taskDeadline').value = '';
  document.getElementById('taskSubmitBtn').textContent = 'Crear Tarea';
  clearAlert('modal-alert');
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('taskModal'));
  modal.show();
}

// Guardar tarea (crear o editar)
async function handleSaveTask(event) {
  event.preventDefault();
  clearAlert('modal-alert');
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const deadline = document.getElementById('taskDeadline').value || null;
  if (!title) { showAlert('modal-alert', 'danger', 'El título es requerido.'); return; }
  try {
    if (currentEditId) {
      const status = document.getElementById('taskStatus').value;
      await axios.put(`/api/tasks/${currentEditId}`, { title, description, status, deadline });
    } else {
      await axios.post('/api/tasks', { title, description, deadline });
    }
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('taskModal'));
    modal.hide();
    document.getElementById('taskForm').reset();
    currentEditId = null;
    loadTasks();
  } catch (error) {
    const data = error.response?.data;
    let msg = data?.message || 'Error al guardar la tarea.';
    if (data?.errors?.length > 0) msg = data.errors.map(e => e.message).join('<br>');
    showAlert('modal-alert', 'danger', msg);
  }
}

// Completar tarea
async function completeTask(id) {
  try {
    await axios.put(`/api/tasks/${id}`, { status: 'completed' });
    loadTasks();
  } catch (error) {
    alert('Error al completar la tarea.');
  }
}

// Eliminar tarea
async function deleteTask(id, title) {
  if (!confirm(`¿Eliminar la tarea "${unescapeHtml(title)}"?`)) return;
  try {
    await axios.delete(`/api/tasks/${id}`);
    loadTasks();
  } catch (error) {
    alert('Error al eliminar la tarea.');
  }
}

// Logout
async function handleLogout() {
  try {
    await axios.post('/api/auth/logout');
  } catch (e) { /* ignore */ }
  window.location.href = '/index.html';
}

// Utilidades de escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
function escapeAttr(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
function unescapeHtml(text) {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent;
}
