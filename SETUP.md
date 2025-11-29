# Ceveco Project Configuration

## Estructura del Proyecto

```
ceveco/
├── backend/                    # Backend API (Node.js + Express + PostgreSQL)
│   ├── src/
│   │   ├── config/            # Configuración de base de datos
│   │   ├── models/            # Modelos de datos
│   │   ├── services/          # Lógica de negocio
│   │   ├── controllers/       # Controladores HTTP
│   │   └── routes/            # Rutas de la API
│   ├── index.js               # Punto de entrada del servidor
│   ├── package.json           # Dependencias del backend
│   └── .env                   # Variables de entorno (CONFIGURAR)
│
├── frontend/                   # Frontend Web (HTML + CSS + JS)
│   ├── assets/                # Imágenes y recursos estáticos
│   ├── css/                   # Hojas de estilo CSS
│   │   ├── variables.css      # Variables y tokens de diseño
│   │   ├── base.css           # Reset y estilos base
│   │   ├── components.css     # Componentes reutilizables
│   │   └── styles.css         # Estilos principales
│   ├── js/                    # JavaScript
│   │   ├── config.js          # Configuración de la API
│   │   ├── api.js             # Cliente API
│   │   ├── utils.js           # Funciones utilitarias
│   │   ├── cart.js            # Lógica del carrito
│   │   └── main.js            # JavaScript principal
│   └── pages/                 # Páginas HTML
│       ├── index.html         # Página principal
│       ├── productos.html     # Listado de productos
│       ├── detalle-producto.html  # Detalle de producto
│       ├── sedes.html         # Sedes/tiendas
│       └── contacto.html      # Página de contacto
│
├── bd.sql                     # Script de base de datos PostgreSQL
├── README.md                  # Documentación principal
└── start.bat                  # Script de inicio (Windows)
```

## Configuración Inicial

### 1. Base de Datos PostgreSQL

**Crear la base de datos:**
```bash
psql -U postgres -f bd.sql
```

**O desde pgAdmin:**
1. Abrir pgAdmin
2. Conectar al servidor PostgreSQL
3. Click derecho en "Databases" → "Query Tool"
4. Abrir el archivo `bd.sql`
5. Ejecutar (F5)

### 2. Backend

**Configurar variables de entorno:**

Editar `backend/.env`:
```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_AQUI          # ⚠️ CAMBIAR
DB_NAME=ceveco_db

# Autenticación
JWT_SECRET=TU_SECRETO_SEGURO_AQUI     # ⚠️ CAMBIAR

# CORS
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

**Instalar dependencias:**
```bash
cd backend
npm install
```

**Iniciar servidor:**
```bash
npm run dev
```

### 3. Frontend

**Opción 1: Live Server (Recomendado)**
1. Instalar extensión "Live Server" en VS Code
2. Click derecho en `frontend/pages/index.html`
3. Seleccionar "Open with Live Server"

**Opción 2: Python**
```bash
cd frontend
python -m http.server 5500
```

**Opción 3: Node.js**
```bash
npx http-server frontend -p 5500
```

## URLs de Acceso

- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5500/pages/index.html
- **API Health Check**: http://localhost:3000/health
- **API Productos**: http://localhost:3000/api/v1/productos

## Comandos Útiles

### Backend
```bash
npm run dev      # Desarrollo con auto-reload
npm start        # Producción
```

### PostgreSQL
```bash
psql -U postgres                    # Conectar a PostgreSQL
\l                                  # Listar bases de datos
\c ceveco_db                        # Conectar a ceveco_db
\dt                                 # Listar tablas
\d productos                        # Describir tabla productos
SELECT * FROM productos LIMIT 5;   # Ver productos
```

## Tecnologías Utilizadas

### Backend
- Node.js v16+
- Express.js 4.x
- PostgreSQL 17
- pg (cliente PostgreSQL)
- JWT (autenticación)
- bcryptjs (encriptación)
- express-validator (validación)
- helmet (seguridad)
- cors (CORS)
- morgan (logging)

### Frontend
- HTML5
- CSS3 (Variables, Grid, Flexbox)
- JavaScript ES6+
- Fetch API
- LocalStorage

## Características Implementadas

✅ API REST completa con Express  
✅ Base de datos PostgreSQL 17  
✅ Sistema de productos con filtros y búsqueda  
✅ Paginación con metadata  
✅ Carrito de compras (LocalStorage)  
✅ Diseño responsive  
✅ Sistema de componentes CSS  
✅ Cliente API con manejo de errores  
✅ Validación de datos  
✅ Seguridad (Helmet, CORS)  

## Próximos Pasos

1. **Poblar la base de datos** con productos de ejemplo
2. **Configurar autenticación** de usuarios
3. **Implementar pasarela de pagos**
4. **Agregar panel de administración**
5. **Optimizar imágenes** y assets
6. **Implementar PWA**
7. **Agregar tests** unitarios y de integración

## Solución de Problemas

### "no existe la base de datos ceveco_db"
→ Ejecutar `psql -U postgres -f bd.sql`

### "psql no se reconoce como comando"
→ Agregar PostgreSQL al PATH o usar pgAdmin

### Error de CORS
→ Verificar CORS_ORIGIN en backend/.env

### Puerto 3000 ya en uso
→ Cambiar PORT en backend/.env

### Puerto 5500 ya en uso
→ Usar otro puerto: `python -m http.server 8080`

## Contacto y Soporte

Para reportar problemas o sugerencias, crear un issue en el repositorio.

---

**Última actualización:** 2025-11-29
