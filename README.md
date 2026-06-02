# 🔒 SecTask - Sistema de Gestión de Tareas Seguro

<div align="center">

![SecTask Logo](https://img.shields.io/badge/SecTask-Secure%20Task%20Management-6366f1?style=for-the-badge&logo=security&logoColor=white)

**Proyecto Final - Introducción a la Criptografía y Seguridad de la Información**

Universidad Nacional de Colombia

</div>

---

## Equipo de Desarrollo

| Nombre | Correo Institucional |
|--------|---------------------|
| Alejandro Argüello Muñoz | aarguello@unal.edu.co |
| Deiber David Gongora Hurtado | dgongora@unal.edu.co |
| Juan Luis Vergara Novoa | jvergaran@unal.edu.co |
| Yeiner Arwawingumu Zapata Vallejo | yezapatav@unal.edu.co |

---

## Descripción del Proyecto

**SecTask** es un sistema de gestión de tareas web diseñado con un enfoque en seguridad, implementando los principales controles y buenas prácticas de la industria. El proyecto tiene como objetivo demostrar la aplicación práctica de Requisitos No Funcionales (RNF) de seguridad en una aplicación full-stack.

### Objetivos

- Implementar requisitos no funcionales de seguridad en un sistema web funcional
- Aplicar controles de seguridad basados en OWASP Top 10
- Demostrar prácticas seguras de desarrollo de software
- Realizar pruebas de seguridad y auditoría del sistema

---

## Requisitos No Funcionales de Seguridad Implementados

### **RNF1: Validación y Sanitización de Entradas**
**Objetivo:** Prevenir ataques de SQL Injection y Cross-Site Scripting (XSS)

**Implementación:**
- Uso de `express-validator` para validación de datos de entrada
- Sanitización automática de todos los inputs del usuario
- Consultas parametrizadas con `mysql2` para prevenir SQL Injection
- Validación de tipos de datos, longitudes y formatos
- Mensajes de error seguros sin exposición de información sensible

**Archivos clave:**
- `backend/middlewares/validationMiddleware.js`
- `backend/models/*.js` (consultas parametrizadas)

---

### **RNF2: Logs de Auditoría**
**Objetivo:** Registrar eventos críticos del sistema para auditoría y trazabilidad

**Implementación:**
- Logger Winston para registro estructurado de eventos
- Morgan para logs HTTP de acceso
- Registro de eventos críticos:
  - Intentos de login exitosos y fallidos
  - Registro de nuevos usuarios
  - Operaciones CRUD sobre tareas
  - Recuperación y reset de contraseñas
  - Errores del sistema
- Logs separados por niveles (info, error, audit)
- Persistencia en archivos rotables

**Archivos clave:**
- `backend/config/logger.js`
- `backend/models/auditModel.js`
- `backend/logs/` (directorio de logs)

---

### **RNF3: Recuperación de Contraseña con Token Expirable**
**Objetivo:** Implementar mecanismo seguro de recuperación de contraseña

**Implementación:**
- Generación de tokens únicos UUID v4
- Expiración automática de tokens (10 minutos configurable)
- Tokens de un solo uso (se marcan como usados)
- Almacenamiento seguro en base de datos
- Validación de integridad y vigencia del token
- Prevención de enumeración de usuarios (respuestas genéricas)

**Archivos clave:**
- `backend/controllers/authController.js` (forgotPassword, resetPassword)
- `backend/models/tokenModel.js`

---

### **RNF4: Controles OWASP Top 10**
**Objetivo:** Implementar controles de seguridad basados en mejores prácticas

**Implementación:**
- **Helmet**: Configuración de headers HTTP seguros
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security
- **Rate Limiting**: Protección contra fuerza bruta
  - Login: 5 intentos por 15 minutos
  - Password reset: 3 intentos por hora
- **Variables de entorno**: Uso de `dotenv` para secretos
- **Bcrypt**: Hashing de contraseñas con salt rounds alto (12)
- **JWT**: Autenticación con tokens firmados
- **Cookies seguras**: httpOnly, secure, sameSite
- **Manejo de errores**: Sin exposición de stack traces en producción

**Archivos clave:**
- `backend/server.js` (configuración de Helmet)
- `backend/middlewares/rateLimitMiddleware.js`
- `backend/.env` (variables de entorno)

---

### **RNF5: Protección reCAPTCHA**
**Objetivo:** Prevenir ataques automatizados y bots maliciosos

**Implementación:**
- Google reCAPTCHA v2 integrado
- Validación server-side de tokens
- Protección en endpoints críticos:
  - Registro de usuarios
  - Inicio de sesión
- Configuración en Docker y desarrollo
- Manejo de errores de validación

**Archivos clave:**
- `backend/middlewares/recaptchaMiddleware.js`
- `frontend/*.html` (integración en formularios)

---

## Arquitectura del Sistema

```
SecTask/
├── frontend/                 # Interfaz de usuario (HTML, CSS, JS)
│   ├── css/
│   │   └── styles.css       # Estilos modernos con glassmorphism
│   ├── js/
│   │   ├── app.js           # Utilidades comunes
│   │   ├── auth.js          # Lógica de autenticación
│   │   └── tasks.js         # Gestión de tareas
│   ├── index.html           # Login
│   ├── register.html        # Registro
│   ├── dashboard.html       # Panel principal
│   ├── forgot-password.html # Recuperación
│   └── reset-password.html  # Reseteo
│
├── backend/                 # API REST (Node.js + Express)
│   ├── config/
│   │   ├── database.js      # Conexión MySQL
│   │   └── logger.js        # Configuración Winston
│   ├── controllers/
│   │   ├── authController.js    # Autenticación
│   │   └── taskController.js    # Tareas
│   ├── middlewares/
│   │   ├── authMiddleware.js        # Verificación JWT
│   │   ├── validationMiddleware.js  # Validación de inputs
│   │   ├── rateLimitMiddleware.js   # Rate limiting
│   │   └── recaptchaMiddleware.js   # Validación reCAPTCHA
│   ├── models/
│   │   ├── userModel.js     # Usuarios
│   │   ├── taskModel.js     # Tareas
│   │   ├── tokenModel.js    # Tokens de reset
│   │   └── auditModel.js    # Logs de auditoría
│   ├── routes/
│   │   ├── authRoutes.js    # Rutas de auth
│   │   └── taskRoutes.js    # Rutas de tareas
│   ├── logs/               # Archivos de logs
│   ├── .env                # Variables de entorno
│   └── server.js           # Servidor principal
│
├── database/
│   └── schema.sql          # Esquema de base de datos
│
├── docker-compose.yml      # Orquestación de contenedores
├── Dockerfile              # Imagen de la aplicación
├── .env.docker             # Variables para Docker
└── README.md              # Este archivo
```

---

## Tecnologías Utilizadas

### **Backend**
- **Node.js** v20 - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** 8.0 - Base de datos relacional
- **JWT** - Autenticación basada en tokens
- **Bcrypt** - Hashing de contraseñas
- **Winston** - Sistema de logging
- **Morgan** - Logger HTTP
- **Helmet** - Seguridad de headers HTTP
- **express-validator** - Validación de datos
- **express-rate-limit** - Rate limiting
- **Axios** - Cliente HTTP para reCAPTCHA
- **dotenv** - Gestión de variables de entorno

### **Frontend**
- **HTML5, CSS3, JavaScript** (Vanilla JS)
- **Bootstrap 5.3** - Framework CSS
- **Axios** - Cliente HTTP
- **Google reCAPTCHA v2** - Protección anti-bot
- **Inter Font** - Tipografía moderna

### **DevOps**
- **Docker** - Containerización
- **Docker Compose** - Orquestación multi-contenedor
- **MySQL** - Base de datos en contenedor

---

## Instalación y Ejecución

### **Prerequisitos**
- Docker y Docker Compose instalados
- Conexión a internet (para reCAPTCHA)

### **Método 1: Usando Docker (Recomendado)**

1. **Clonar el repositorio**
```bash
git clone <https://github.com/Juan-Vergara/SecTasks.git>
cd SecTask
```

2. **Configurar variables de entorno**
```bash
# Copiar el archivo de ejemplo
cp .env.docker.example .env.docker

# Editar con tus claves de reCAPTCHA (opcional para desarrollo)
nano .env.docker
```

3. **Levantar los servicios**
```bash
# Construir y ejecutar
docker-compose up --build -d

# Ver logs
docker-compose logs -f app
```

4. **Acceder a la aplicación**
- Aplicación: http://localhost:3000
- Base de datos: localhost:3306

5. **Detener los servicios**
```bash
docker-compose down

# Para eliminar también los volúmenes (datos)
docker-compose down -v
```

---

### **Método 2: Instalación Local**

1. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

2. **Configurar MySQL**
```bash
# Crear la base de datos
mysql -u root -p < ../database/schema.sql
```

3. **Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar configuración
nano .env
```

Configurar en `.env`:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=sectask_db

JWT_SECRET=tu_clave_secreta_muy_larga_y_segura
JWT_EXPIRES_IN=24h

RESET_TOKEN_EXPIRES_MINUTES=10

RECAPTCHA_SECRET_KEY=tu_clave_secreta_de_recaptcha
```

4. **Ejecutar el servidor**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

5. **Acceder a la aplicación**
- Frontend: http://localhost:3000
- API: http://localhost:3000/api

---

## Configuración de reCAPTCHA

Para obtener las claves de reCAPTCHA:

1. Visitar https://www.google.com/recaptcha/admin
2. Registrar un nuevo sitio con reCAPTCHA v2 "No soy un robot"
3. Agregar dominio: `localhost` (para desarrollo)
4. Copiar las claves:
   - **Site Key**: Agregar en archivos HTML (`data-sitekey`)
   - **Secret Key**: Agregar en `.env` o `.env.docker`

---

## Estructura de la Base de Datos

### **Tabla: users**
Almacena información de usuarios registrados
```sql
- id (INT, PK, AUTO_INCREMENT)
- username (VARCHAR(50), UNIQUE)
- email (VARCHAR(100), UNIQUE)
- password_hash (VARCHAR(255))
- created_at (TIMESTAMP)
```

### **Tabla: tasks**
Gestión de tareas de usuarios
```sql
- id (INT, PK, AUTO_INCREMENT)
- user_id (INT, FK)
- title (VARCHAR(100))
- description (TEXT)
- status (ENUM: pending, in_progress, completed)
- deadline (DATETIME)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **Tabla: reset_tokens**
Tokens temporales para recuperación de contraseña
```sql
- id (INT, PK, AUTO_INCREMENT)
- user_id (INT, FK)
- token (VARCHAR(255), UNIQUE)
- expires_at (DATETIME)
- used (BOOLEAN)
- created_at (TIMESTAMP)
```

### **Tabla: audit_logs**
Registro de eventos para auditoría
```sql
- id (INT, PK, AUTO_INCREMENT)
- user_id (INT, FK)
- event_type (VARCHAR(50))
- description (TEXT)
- ip_address (VARCHAR(45))
- created_at (TIMESTAMP)
```

---

## Pruebas de Seguridad

### **Casos de Prueba Implementados**

#### **1. Prevención de SQL Injection**
```javascript
// Intento de inyección SQL en login
POST /api/auth/login
{
  "email": "admin'--",
  "password": "anything"
}
// Rechazado por validación y consultas parametrizadas
```

#### **2. Prevención de XSS**
```javascript
// Intento de XSS en título de tarea
POST /api/tasks
{
  "title": "<script>alert('XSS')</script>"
}
// Sanitizado por express-validator
```

#### **3. Rate Limiting**
```javascript
// 6 intentos de login fallidos en 15 minutos
// Bloqueado después del 5to intento
```

#### **4. Validación de Token JWT**
```javascript
// Acceso sin token
GET /api/tasks
// 401 Unauthorized

// Token expirado
// 401 Token expirado
```

#### **5. Expiración de Token de Reset**
```javascript
// Usar token después de 10 minutos
POST /api/auth/reset-password
// 400 Token inválido o expirado
```

#### **6. Headers de Seguridad**
```bash
curl -I http://localhost:3000
# Verifica presencia de:
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - Strict-Transport-Security
```

---

## Mejores Prácticas de Seguridad Implementadas

### **Autenticación y Autorización**
- [x] Contraseñas hasheadas con bcrypt (12 salt rounds)
- [x] JWT con expiración (24h configurable)
- [x] Cookies httpOnly, secure y sameSite
- [x] Validación de sesión en cada request protegido

### **Protección de Datos**
- [x] Variables sensibles en archivo .env
- [x] .env excluido del control de versiones
- [x] Conexiones a BD con credenciales seguras
- [x] Sin exposición de información sensible en errores

### **Validación y Sanitización**
- [x] Validación server-side obligatoria
- [x] Sanitización de todos los inputs
- [x] Validación de tipos y formatos
- [x] Límites de longitud en campos

### **Protección contra Ataques**
- [x] SQL Injection - Consultas parametrizadas
- [x] XSS - Sanitización y headers CSP
- [x] CSRF - Tokens sameSite y validación
- [x] Fuerza bruta - Rate limiting
- [x] Bots - reCAPTCHA
- [x] Clickjacking - X-Frame-Options

### **Logging y Auditoría**
- [x] Registro de eventos críticos
- [x] Trazabilidad de acciones de usuarios
- [x] Logs persistentes y rotables
- [x] Separación por niveles de severidad

---

## Contribuciones

Este proyecto fue desarrollado como parte del curso de Introducción a la Criptografía y Seguridad de la Información en la Universidad Nacional de Colombia.

### **Responsabilidades del Equipo**
- **Alejandro Argüello**: Backend y API REST
- **Deiber Gongora**: Frontend y diseño UI/UX
- **Juan Luis Vergara**: Base de datos y modelos
- **Yeiner Zapata**: Seguridad y pruebas

---

## Licencia

Este proyecto fue desarrollado con fines educativos para la Universidad Nacional de Colombia.

---

## Contacto

Para preguntas o comentarios sobre el proyecto, contactar a cualquier miembro del equipo a través de sus correos institucionales listados al inicio de este documento.

---

<div align="center">

**SecTask** - Gestión de Tareas con Seguridad de Nivel Empresarial

Desarrollado por estudiantes de la Universidad Nacional de Colombia

</div>
