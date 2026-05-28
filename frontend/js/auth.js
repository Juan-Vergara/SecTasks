// =============================================
// Auth.js - Lógica de Autenticación Frontend
// =============================================

// === LOGIN ===
async function handleLogin(event) {
  event.preventDefault();
  clearAlert('alert-container');
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const recaptchaToken = grecaptcha.getResponse();

  if (!email || !password) {
    showAlert('alert-container', 'danger', 'Complete todos los campos.');
    return;
  }
  if (!recaptchaToken) {
    showAlert('alert-container', 'danger', 'Por favor, completa el CAPTCHA.');
    return;
  }

  try {
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando...';
    const response = await axios.post('/api/auth/login', { email, password, recaptchaToken });
    if (response.data.success) {
      showAlert('alert-container', 'success', '¡Bienvenido! Redirigiendo...');
      setTimeout(() => { window.location.href = '/dashboard.html'; }, 500);
    }
  } catch (error) {
    showAlert('alert-container', 'danger', error.response?.data?.message || 'Error al iniciar sesión.');
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = false;
    btn.innerHTML = 'Iniciar Sesión';
    grecaptcha.reset();
  }
}

// === REGISTRO ===
async function handleRegister(event) {
  event.preventDefault();
  clearAlert('alert-container');
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  if (!username || !email || !password || !confirmPassword) {
    showAlert('alert-container', 'danger', 'Complete todos los campos.');
    return;
  }
  if (password !== confirmPassword) {
    showAlert('alert-container', 'danger', 'Las contraseñas no coinciden.');
    return;
  }
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    showAlert('alert-container', 'danger', 'La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.');
    return;
  }

  const recaptchaToken = grecaptcha.getResponse();
  if (!recaptchaToken) {
    showAlert('alert-container', 'danger', 'Por favor, completa el CAPTCHA.');
    return;
  }

  try {
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...';
    const response = await axios.post('/api/auth/register', { username, email, password, recaptchaToken });
    if (response.data.success) {
      showAlert('alert-container', 'success', '¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => { window.location.href = '/index.html'; }, 1500);
    }
  } catch (error) {
    const data = error.response?.data;
    let message = data?.message || 'Error al registrarse.';
    if (data?.errors?.length > 0) message = data.errors.map(e => e.message).join('<br>');
    showAlert('alert-container', 'danger', message);
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = false;
    btn.innerHTML = 'Crear Cuenta';
    grecaptcha.reset();
  }
}

// === FORGOT PASSWORD ===
async function handleForgotPassword(event) {
  event.preventDefault();
  clearAlert('alert-container');
  const email = document.getElementById('email').value.trim();
  if (!email) {
    showAlert('alert-container', 'danger', 'Ingrese su email.');
    return;
  }
  try {
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
    const response = await axios.post('/api/auth/forgot-password', { email });
    if (response.data.success) {
      let msg = response.data.message;
      if (response.data.dev_resetUrl) {
        msg += '<br><br><strong>🔧 Modo desarrollo:</strong><br><a href="' + response.data.dev_resetUrl + '" class="text-info">' + response.data.dev_resetUrl + '</a><br><small class="text-muted">Expira: ' + new Date(response.data.dev_expiresAt).toLocaleString() + '</small>';
      }
      showAlert('alert-container', 'success', msg);
    }
    btn.disabled = false;
    btn.innerHTML = 'Enviar Enlace';
  } catch (error) {
    showAlert('alert-container', 'danger', error.response?.data?.message || 'Error al procesar la solicitud.');
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = false;
    btn.innerHTML = 'Enviar Enlace';
  }
}

// === RESET PASSWORD ===
async function handleResetPassword(event) {
  event.preventDefault();
  clearAlert('alert-container');
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  if (!token) { showAlert('alert-container', 'danger', 'Token no encontrado.'); return; }
  if (!newPassword || !confirmPassword) { showAlert('alert-container', 'danger', 'Complete todos los campos.'); return; }
  if (newPassword !== confirmPassword) { showAlert('alert-container', 'danger', 'Las contraseñas no coinciden.'); return; }
  if (newPassword.length < 8) { showAlert('alert-container', 'danger', 'Mínimo 8 caracteres.'); return; }
  try {
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Actualizando...';
    const response = await axios.post('/api/auth/reset-password', { token, newPassword });
    if (response.data.success) {
      showAlert('alert-container', 'success', '¡Contraseña actualizada! Redirigiendo al login...');
      setTimeout(() => { window.location.href = '/index.html'; }, 2000);
    }
  } catch (error) {
    showAlert('alert-container', 'danger', error.response?.data?.message || 'Error al actualizar.');
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = false;
    btn.innerHTML = 'Actualizar Contraseña';
  }
}
