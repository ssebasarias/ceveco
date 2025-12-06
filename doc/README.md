# 🛍️ Ceveco E-Commerce

Sistema completo de e-commerce para Ceveco, especializado en electrodomésticos, muebles, motos y herramientas STIHL.

## 📋 Descripción del Proyecto

Ceveco es una plataforma de comercio electrónico full-stack que incluye:

- **Backend API REST** - Node.js + Express + PostgreSQL
- **Frontend Web** - HTML5 + CSS3 + JavaScript Vanilla
- **Base de Datos** - PostgreSQL 17
- **Sistema de Carrito** - LocalStorage con persistencia
- **Gestión de Productos** - CRUD completo con filtros y búsqueda
- **Sistema de Sedes** - Múltiples ubicaciones físicas

## 🏗️ Arquitectura del Proyecto

```
ceveco/
├── backend/                 # API REST
│   ├── src/
│   │   ├── config/         # Configuración DB
│   │   ├── models/         # Modelos de datos
│   │   ├── services/       # Lógica de negocio
│   │   ├── controllers/    # Controladores HTTP
│   │   └── routes/         # Rutas de la API
│   ├── index.js            # Servidor Express
│   ├── package.json
│   └── .env                # Variables de entorno
│
├── frontend/               # Aplicación Web
│   ├── assets/            # Imágenes y recursos
│   ├── css/               # Estilos CSS
│   ├── js/                # JavaScript
│   └── pages/             # Páginas HTML
│
└── bd.sql                 # Script de base de datos
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js v16+ ([Descargar](https://nodejs.org/))
- PostgreSQL 17 ([Descargar](https://www.postgresql.org/download/))
- Git

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd ceveco
```

### 2. Configurar la Base de Datos

```bash
# Crear la base de datos
psql -U postgres -f bd.sql

# O desde psql:
# psql -U postgres
# \i bd.sql
```

### 3. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Edita el archivo .env y actualiza:
# - DB_PASSWORD (tu contraseña de PostgreSQL)
# - JWT_SECRET (un secreto seguro)

# Iniciar el servidor
npm run dev
```

El backend estará disponible en: `http://localhost:3000`

### 4. Configurar el Frontend

```bash
# Desde la raíz del proyecto
cd frontend

# Servir con Live Server (VS Code) o cualquier servidor HTTP
# Opción 1: Live Server (recomendado)
# - Instala la extensión "Live Server" en VS Code
# - Click derecho en pages/index.html → "Open with Live Server"

# Opción 2: Python
python -m http.server 5500

# Opción 3: Node.js
npx http-server -p 5500
```

El frontend estará disponible en: `http://localhost:5500/pages/index.html`

## 📚 Documentación

- [Backend README](./backend/README.md) - Documentación de la API
- [Frontend README](./frontend/README.md) - Documentación del frontend

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### Productos
```
GET    /api/v1/productos                    # Listar productos
GET    /api/v1/productos/:id                # Obtener producto
GET    /api/v1/productos/destacados         # Productos destacados
GET    /api/v1/productos/:id/relacionados   # Productos relacionados
GET    /api/v1/productos/buscar?q=...       # Buscar productos
GET    /api/v1/productos/:id/stock          # Verificar stock
```

Ver [Backend README](./backend/README.md) para documentación completa de la API.

## 🎨 Stack Tecnológico

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional
- **pg** - Cliente PostgreSQL
- **JWT** - Autenticación
- **bcryptjs** - Encriptación
- **express-validator** - Validación de datos

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos (Variables CSS, Grid, Flexbox)
- **JavaScript ES6+** - Lógica
- **Fetch API** - Comunicación con backend
- **LocalStorage** - Persistencia del carrito

### Base de Datos
- **PostgreSQL 17** - RDBMS
- **Tipos ENUM** - Enumeraciones tipadas
- **Índices GIN** - Búsqueda de texto completo
- **Triggers** - Automatización
- **Funciones PL/pgSQL** - Lógica en BD

## 📦 Características Principales

### Backend
✅ Arquitectura en capas (Routes → Controllers → Services → Models)  
✅ Validación de parámetros con express-validator  
✅ Búsqueda de texto completo con PostgreSQL  
✅ Paginación con metadata  
✅ Filtros avanzados (categoría, marca, precio, etc.)  
✅ Seguridad (Helmet, CORS, prepared statements)  
✅ Logging de queries y peticiones HTTP  
✅ Manejo de errores centralizado  
✅ Pool de conexiones optimizado  

### Frontend
✅ Diseño responsive (Mobile, Tablet, Desktop)  
✅ Sistema de componentes reutilizables  
✅ Cliente API con manejo de errores  
✅ Carrito de compras con LocalStorage  
✅ Búsqueda y filtros en tiempo real  
✅ Lazy loading de imágenes  
✅ Notificaciones toast  
✅ Animaciones CSS suaves  

### Base de Datos
✅ Catálogo completo de productos  
✅ Sistema de usuarios con roles  
✅ Carrito de compras  
✅ Gestión de pedidos  
✅ Sistema de reseñas  
✅ Múltiples sedes con inventario  
✅ Cupones y promociones  
✅ Newsletter  
✅ Logs de actividad  

## 🔒 Seguridad

- **Helmet** - Protección de headers HTTP
- **CORS** - Control de acceso entre dominios
- **Prepared Statements** - Prevención de SQL injection
- **Variables de entorno** - Configuración sensible protegida
- **Validación de datos** - express-validator en todas las rutas
- **Bcrypt** - Hash de contraseñas
- **JWT** - Tokens de autenticación

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
# Abrir pages/index.html en el navegador
# Verificar consola para errores
```

## 📈 Próximas Características

- [ ] Sistema de autenticación completo
- [ ] Panel de administración
- [ ] Pasarela de pagos
- [ ] Sistema de notificaciones por email
- [ ] Chat en vivo
- [ ] App móvil (React Native)
- [ ] PWA (Progressive Web App)
- [ ] Analytics y reportes

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas de Desarrollo

### Variables de Entorno Importantes

**Backend (.env)**
```env
DB_PASSWORD=tu_password_postgresql
JWT_SECRET=secreto_muy_seguro
```

### Puertos por Defecto

- Backend: `3000`
- Frontend: `5500`
- PostgreSQL: `5432`

### Comandos Útiles

```bash
# Backend
npm run dev          # Modo desarrollo con nodemon
npm start            # Modo producción

# PostgreSQL
psql -U postgres     # Conectar a PostgreSQL
\l                   # Listar bases de datos
\c ceveco_db         # Conectar a ceveco_db
\dt                  # Listar tablas
```

## 🐛 Solución de Problemas

### Error: "no existe la base de datos ceveco_db"
```bash
# Ejecutar el script de base de datos
psql -U postgres -f bd.sql
```

### Error: "psql no se reconoce como comando"
- Agregar PostgreSQL al PATH de Windows
- O usar pgAdmin para ejecutar bd.sql

### Error de CORS en el frontend
- Verificar que CORS_ORIGIN en backend/.env incluya tu URL
- Por defecto: `http://localhost:5500,http://127.0.0.1:5500`

## 📄 Licencia

ISC

## 👥 Autores

- **Equipo Ceveco** - Desarrollo inicial

## 🙏 Agradecimientos

- Comunidad de Node.js
- PostgreSQL Team
- Todos los contribuidores

---

**¿Necesitas ayuda?** Abre un issue en el repositorio.
