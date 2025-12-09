# 🎨 Auditoría del Frontend - Plan de Optimización

**Fecha:** 2025-12-09  
**Proyecto:** Ceveco E-commerce

---

## 📋 Estructura Actual

```
frontend/
├── assets/
│   ├── css/               ✅ BIEN ORGANIZADO (NO TOCAR)
│   │   ├── base/
│   │   ├── components/
│   │   ├── layout/
│   │   ├── tokens/
│   │   ├── utilities/
│   │   └── main.css
│   ├── img/               ✅ BIEN
│   └── js/                ⚠️ NECESITA REORGANIZACIÓN
│       ├── api/           ✅ BIEN
│       ├── auth/          ✅ BIEN
│       ├── components/    ✅ BIEN
│       ├── favorites/     ✅ BIEN
│       ├── filters/       ✅ BIEN
│       ├── pages/         ✅ BIEN
│       ├── utils/         ⚠️ NECESITA EXPANSIÓN
│       ├── app.js         ✅ BIEN
│       ├── config.js      ⚠️ NECESITA MEJORA
│       └── theme.config.js ✅ BIEN (NO TOCAR)
├── components/            ✅ BIEN
└── pages/                 ✅ BIEN
```

---

## 🎯 Optimizaciones Planificadas

### ❌ NO TOCAR (Aprobado por cliente):
- ✅ CSS (colores, diseño, estilos)
- ✅ theme.config.js
- ✅ HTML de páginas (estructura visual)
- ✅ Componentes HTML

### ✨ SÍ OPTIMIZAR (Estructura interna):
1. **Config** - Expandir y separar
2. **API clients** - Agregar índice centralizado
3. **Utils** - Agregar helpers y constantes
4. **Services** - Crear capa de servicios (conectar con backend)
5. **State Management** - Organizar mejor
6. **Validators** - Crear validadores frontend

---

## 📝 Cambios Propuestos

### 1. Expandir Config
- Separar constantes de configuración
- Crear variables de entorno frontend
- Sincronizar con backend

### 2. Crear Services Layer
- `ProductService` - Conecta con API productos
- `AuthService` - Conecta con API auth
- `CartService` - Gestión del carrito
- `FavoritesService` - Gestión de favoritos

### 3. Expandir Utils
- Constantes (estados, roles, etc.)
- Helpers (formatters, validators)
- Storage helpers

### 4. Mejorar API Clients
- Índice centralizado
- Interceptors para auth
- Error handling consistente

### 5. Crear Validators
- Validaciones de formularios
- Validaciones de datos
- Feedback visual consistente

---

## ⚠️ REGLAS ESTRICTAS

1. **NO modificar colores CSS**
2. **NO cambiar estructura HTML visible**
3. **NO alterar diseño aprobado**
4. **SÍ mejorar organización JS**
5. **SÍ conectar mejor con backend**
6. **SÍ agregar validaciones**
