# 🛍️ Ceveco Backend API

Backend API REST para el e-commerce Ceveco, construido con Node.js, Express y PostgreSQL 17.

## 📋 Requisitos Previos

- Node.js v16 o superior
- PostgreSQL 17
- npm o yarn

## 🚀 Instalación

1. **Instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**

Edita el archivo `.env` y actualiza las siguientes variables:

```env
# Configuración de PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_aqui  # ⚠️ CAMBIAR
DB_NAME=ceveco_db

# Configuración de Autenticación
JWT_SECRET=tu_secreto_jwt_super_seguro_cambialo_en_produccion  # ⚠️ CAMBIAR
```

3. **Crear la base de datos:**

Ejecuta el archivo `bd.sql` en PostgreSQL:

```bash
psql -U postgres -f ../bd.sql
```

O desde psql:
```sql
\i ../bd.sql
```

## 🏃‍♂️ Ejecución

### Modo Desarrollo (con auto-reload)
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📚 Endpoints de la API

### Health Check
```
GET /health
```

### Productos

#### Obtener todos los productos
```
GET /api/v1/productos
```

**Query Parameters:**
- `page` (number): Número de página (default: 1)
- `limit` (number): Productos por página (default: 12, max: 100)
- `categoria` (string): Slug de la categoría
- `marca` (number): ID de la marca
- `precioMin` (number): Precio mínimo
- `precioMax` (number): Precio máximo
- `destacado` (boolean): Solo productos destacados
- `busqueda` (string): Término de búsqueda
- `orderBy` (string): Campo de ordenamiento (precio_actual, nombre, fecha_creacion, calificacion_promedio, ventas_totales)
- `orderDir` (string): Dirección (ASC, DESC)

**Ejemplo:**
```
GET /api/v1/productos?categoria=electro-hogar&page=1&limit=12&orderBy=precio_actual&orderDir=ASC
```

#### Obtener producto por ID
```
GET /api/v1/productos/:id
```

#### Obtener productos destacados
```
GET /api/v1/productos/destacados?limit=8
```

#### Obtener productos relacionados
```
GET /api/v1/productos/:id/relacionados?limit=4
```

#### Buscar productos
```
GET /api/v1/productos/buscar?q=lavadora
```

#### Verificar stock
```
GET /api/v1/productos/:id/stock?cantidad=5
```

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # Configuración de PostgreSQL
│   ├── models/
│   │   └── producto.model.js  # Modelo de datos de productos
│   ├── services/
│   │   └── productos.service.js  # Lógica de negocio
│   ├── controllers/
│   │   └── productos.controller.js  # Controladores HTTP
│   └── routes/
│       └── productos.routes.js  # Definición de rutas
├── index.js                   # Punto de entrada
├── package.json
├── .env                       # Variables de entorno
├── .gitignore
└── README.md
```

## 🔒 Seguridad

- **Helmet**: Protección de headers HTTP
- **CORS**: Control de acceso entre dominios
- **express-validator**: Validación de parámetros
- **Prepared Statements**: Prevención de SQL injection
- **Variables de entorno**: Configuración sensible protegida

## 🛠️ Tecnologías Utilizadas

- **Express.js**: Framework web
- **PostgreSQL**: Base de datos
- **pg**: Cliente PostgreSQL para Node.js
- **dotenv**: Gestión de variables de entorno
- **helmet**: Seguridad HTTP
- **cors**: Control de CORS
- **express-validator**: Validación de datos
- **morgan**: Logger HTTP
- **nodemon**: Auto-reload en desarrollo

## 📝 Notas de Desarrollo

### Búsqueda de Texto Completo
La API utiliza índices GIN de PostgreSQL con diccionario español para búsquedas eficientes:
```sql
to_tsvector('spanish', nombre || ' ' || descripcion)
```

### Paginación
Todas las respuestas paginadas incluyen metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Manejo de Errores
Todos los errores devuelven el formato:
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Stack trace (solo en desarrollo)"
}
```

## 🧪 Testing

```bash
npm test
```

## 📄 Licencia

ISC
