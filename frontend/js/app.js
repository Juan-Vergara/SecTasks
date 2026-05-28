// =============================================
// App.js - Configuración Global de Axios
// Interceptores y verificación de sesión
// =============================================

// Configurar Axios globalmente
axios.defaults.baseURL = window.location.origin;
axios.defaults.withCredentials = true; // Enviar cookies con cada request
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor de respuesta: redirigir a login si 401
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Solo redirigir si NO estamos en una página de auth
      const authPages = ['index.html', 'register.html', 'forgot-password.html', 'reset-password.html'];
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      
      if (!authPages.includes(currentPage)) {
        window.location.href = '/index.html';
      }
    }
    return Promise.reject(error);
  }
);

// Verificar si el usuario tiene sesión activa
async function checkAuth() {
  try {
    const response = await axios.get('/api/auth/me');
    return response.data.user;
  } catch (error) {
    return null;
  }
}

// Redirigir a dashboard si ya tiene sesión (para páginas de auth)
async function redirectIfAuthenticated() {
  const user = await checkAuth();
  if (user) {
    window.location.href = '/dashboard.html';
  }
}

// Redirigir a login si NO tiene sesión (para páginas protegidas)
async function requireAuth() {
  const user = await checkAuth();
  if (!user) {
    window.location.href = '/index.html';
    return null;
  }
  return user;
}

// Mostrar mensaje de alerta
function showAlert(containerId, type, message) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="alert alert-${type} fade-in" role="alert">
      ${message}
    </div>
  `;

  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    const alert = container.querySelector('.alert');
    if (alert) {
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-10px)';
      setTimeout(() => container.innerHTML = '', 300);
    }
  }, 5000);
}

// Limpiar alerta
function clearAlert(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}

// Limpiar alertas
function clearAlert(containerId) {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
}
