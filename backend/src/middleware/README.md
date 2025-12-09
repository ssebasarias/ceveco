# Middlewares - Documentación

Esta carpeta contiene todos los middlewares de la aplicación organizados de forma modular y profesional.

## 📁 Estructura

```
middleware/
├── index.js                    // Punto central de exportación
├── auth.middleware.js          // Autenticación JWT
├── role.middleware.js          // Autorización por roles
├── validation.middleware.js    // Validaciones reutilizables
├── rateLimiter.middleware.js   // Limitación de peticiones
└── error.middleware.js         // Manejo de errores
```

---

## 📖 Guía de Uso

### Importación Centralizada

**✅ Recomendado** - Importar desde el índice:
```javascript
const { authMiddleware, requireAdmin, validateId } = require('../middleware');
```

**❌ No recomendado** - Importar archivos individuales:
```javascript
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');
```

---

## 🔐 1. Auth Middleware (`auth.middleware.js`)

### `authMiddleware`
Verifica el token JWT y adjunta `req.user` si es válido.

```javascript
router.get('/perfil', authMiddleware, controller);
```

**Responde con:**
- `401` si no hay token
- `401` si el token es inválido o expirado
- Adjunta `req.user = { id, email, rol }` si es válido

### `optionalAuth`
Permite acceso sin token, pero valida si existe.

```javascript
router.get('/productos', optionalAuth, controller);
// En controller: if (req.user) { ... personalizado }
```

---

## 🛡️ 2. Role Middleware (`role.middleware.js`)

### `requireAdmin`
Solo permite acceso a administradores.

```javascript
router.delete('/productos/:id', authMiddleware, requireAdmin, controller);
```

### `requireRole(...roles)`
Permite acceso a usuarios con roles específicos.

```javascript
router.post('/content', authMiddleware, requireRole('admin', 'moderator'), controller);
```

### `requireOwner(getOwnerFn)`
Verifica que el usuario sea el propietario del recurso.

```javascript
router.get('/pedidos/:id', 
    authMiddleware, 
    requireOwner(async (req) => {
        const order = await OrderModel.findById(req.params.id);
        return order.id_usuario;
    }), 
    controller
);
```

### `requireAuthorization(options)`
Combina verificación de rol y ownership.

```javascript
router.put('/posts/:id', 
    authMiddleware, 
    requireAuthorization({
        roles: ['admin', 'moderator'],
        ownerCheck: async (req) => {
            const post = await Post.findById(req.params.id);
            return post.userId;
        },
        allowOwner: true
    }), 
    controller
);
```

---

## ✅ 3. Validation Middleware (`validation.middleware.js`)

### `validateRequest`
Valida resultados de `express-validator`.

```javascript
router.post('/productos',
    [
        body('nombre').notEmpty(),
        body('precio').isFloat({ min: 0 })
    ],
    validateRequest,
    controller
);
```

### `validateId(paramName)`
Valida IDs numéricos en parámetros.

```javascript
router.get('/productos/:id', validateId(), controller);
router.get('/categorias/:categoryId', validateId('categoryId'), controller);
```

### `validatePagination(defaults)`
Valida y establece valores de paginación.

```javascript
router.get('/productos', validatePagination({ limit: 12, maxLimit: 100 }), controller);
// En controller: req.pagination = { page, limit, offset }
```

### `sanitizeInput(fields)`
Elimina espacios en blanco de campos específicos.

```javascript
router.post('/usuarios', sanitizeInput(['nombre', 'email']), controller);
```

### `requireFields(fields)`
Verifica que campos requeridos existan.

```javascript
router.post('/productos', requireFields(['nombre', 'precio', 'stock']), controller);
```

---

## 🚦  4. Rate Limiter Middleware (`rateLimiter.middleware.js`)

### Limitadores Disponibles:

| Middleware | Ventana | Límite | Uso |
|-----------|---------|--------|-----|
| `apiLimiter` | 15 min | 100 | API general |
| `authLimiter` | 1 min | 10 | Login/registro |
| `createLimiter` | 10 min | 20 | Creación de recursos |
| `searchLimiter` | 1 min | 30 | Búsquedas |
| `passwordResetLimiter` | 1 hora | 3 | Recuperación de contraseña |
| `adminLimiter` | 5 min | 50 | Operaciones admin |

**Uso:**
```javascript
const { authLimiter, createLimiter } = require('../middleware');

router.post('/auth/login', authLimiter, controller);
router.post('/productos', authMiddleware, requireAdmin, createLimiter, controller);
```

---

## ⚠️ 5. Error Middleware (`error.middleware.js`)

### `AppError`
Clase para crear errores personalizados.

```javascript
const { AppError } = require('../middleware');

throw new AppError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND');
```

### `asyncHandler`
Wrapper para eliminar try-catch en rutas async.

```javascript
const { asyncHandler } = require('../middleware');

router.get('/productos', asyncHandler(async (req, res) => {
    const productos = await ProductoService.getAll();
    res.json(productos);
}));
```

### `notFound`
Middleware para rutas 404 (colocar DESPUÉS de todas las rutas).

```javascript
app.use('/api/v1/productos', productosRoutes);
app.use('/api/v1/auth', authRoutes);
app.use(notFound); // ← Al final de las rutas
```

### `errorHandler`
Manejador global de errores (colocar AL FINAL de todo).

```javascript
app.use(errorHandler); // ← Último middleware
```

### Handlers Específicos

```javascript
app.use(handleDatabaseError);  // Errores de PostgreSQL
app.use(handleJWTError);       // Errores de JWT
app.use(logErrorToService);    // Logging a servicio externo
app.use(errorHandler);         // Al final
```

---

## 🔄 Orden de Middlewares en Rutas

```javascript
router.post('/productos/:id',
    authLimiter,           // 1. Rate limiting
    authMiddleware,        // 2. Autenticación
    requireAdmin,          // 3. Autorización
    validateId(),          // 4. Validación de parámetros
    [                      // 5. Validación de body
        body('nombre').notEmpty(),
        body('precio').isFloat()
    ],
    validateRequest,       // 6. Procesar validaciones
    sanitizeInput(['nombre']), // 7. Sanitización
    asyncHandler(controller)   // 8. Controller con manejo de errores
);
```

---

## 🎯 Ejemplos Completos

### Ruta Pública con Paginación
```javascript
const { validatePagination, asyncHandler } = require('../middleware');

router.get('/productos', 
    validatePagination({ limit: 12 }),
    asyncHandler(async (req, res) => {
        const { page, limit, offset } = req.pagination;
        const productos = await ProductoService.getAll({ limit, offset });
        res.json(productos);
    })
);
```

### Ruta Privada de Usuario
```javascript
const { authMiddleware, requireFields, asyncHandler } = require('../middleware');

router.post('/favoritos',
    authMiddleware,
    requireFields(['productId']),
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { productId } = req.body;
        await FavoritosService.toggle(userId, productId);
        res.json({ success: true });
    })
);
```

### Ruta Administrativa Completa
```javascript
const { 
    authMiddleware, 
    requireAdmin, 
    validateId,
    validateRequest,
    asyncHandler 
} = require('../middleware');
const { body } = require('express-validator');

router.put('/productos/:id',
    authMiddleware,
    requireAdmin,
    validateId(),
    [
        body('nombre').optional().isString(),
        body('precio').optional().isFloat({ min: 0 }),
        body('stock').optional().isInt({ min: 0 })
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updates = req.body;
        const producto = await ProductoService.update(id, updates);
        res.json({ success: true, data: producto });
    })
);
```

---

## 🔧 Configuración en `index.js`

### Aplicar Middlewares Globales

```javascript
const { 
    apiLimiter, 
    notFound, 
    errorHandler,
    handleDatabaseError,
    handleJWTError 
} = require('./src/middleware');

// Rate limiting general
app.use(apiLimiter);

// ... rutas ...

// Manejo de errores (AL FINAL)
app.use(notFound);
app.use(handleDatabaseError);
app.use(handleJWTError);
app.use(errorHandler);
```

---

## 📝 Mejores Prácticas

1. **Siempre importar desde el índice central**
   ```javascript
   const { authMiddleware, requireAdmin } = require('../middleware');
   ```

2. **Orden correcto en las rutas**
   - Rate limiting → Auth → Authorization → Validation → Controller

3. **Usar `asyncHandler` en controladores async**
   - Evita try-catch repetitivos

4. **Aplicar rate limiting apropiado**
   - `authLimiter` para login
   - `createLimiter` para creación
   - `apiLimiter` global

5. **Validar siempre IDs de parámetros**
   ```javascript
   router.get('/:id', validateId(), controller);
   ```

6. **Middlewares de error AL FINAL**
   ```javascript
   app.use(notFound);
   app.use(errorHandler);
   ```

---

## 🆕 Agregar Nuevos Middlewares

1. Crear archivo en `middleware/`
2. Exportar funciones
3. Agregar al `index.js`:
   ```javascript
   const { myMiddleware } = require('./myMiddleware.middleware');
   
   module.exports = {
       // ... otros middlewares
       myMiddleware
   };
   ```
4. Usar en rutas:
   ```javascript
   const { myMiddleware } = require('../middleware');
   ```

---

**Mantenido por:** Equipo Ceveco  
**Última actualización:** 2025-12-09
