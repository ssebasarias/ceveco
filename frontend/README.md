# 🎨 Ceveco Frontend

Frontend de la aplicación e-commerce Ceveco, construido con HTML5, CSS3 y JavaScript vanilla.

## 📁 Estructura del Proyecto

```
frontend/
├── assets/              # Recursos estáticos
│   ├── logo.png
│   └── hero.png
├── css/                 # Estilos CSS
│   ├── variables.css    # Variables y tokens de diseño
│   ├── base.css         # Reset y estilos base
│   ├── components.css   # Componentes reutilizables
│   └── styles.css       # Estilos principales (importa todos)
├── js/                  # JavaScript
│   ├── config.js        # Configuración de la API
│   ├── api.js           # Cliente API
│   ├── utils.js         # Funciones utilitarias
│   ├── cart.js          # Lógica del carrito
│   └── main.js          # JavaScript principal
└── pages/               # Páginas HTML
    ├── index.html       # Página principal
    ├── productos.html   # Listado de productos
    ├── detalle-producto.html  # Detalle de producto
    └── sedes.html       # Sedes/tiendas
```

## 🚀 Inicio Rápido

### 1. Configurar la API

Edita `js/config.js` y asegúrate de que la URL de la API sea correcta:

```javascript
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api/v1',
  // ...
};
```

### 2. Servir los Archivos

Puedes usar cualquier servidor web local. Algunas opciones:

**Opción 1: Live Server (VS Code)**
- Instala la extensión "Live Server"
- Click derecho en `pages/index.html` → "Open with Live Server"

**Opción 2: Python**
```bash
cd frontend
python -m http.server 5500
```

**Opción 3: Node.js**
```bash
npx http-server frontend -p 5500
```

La aplicación estará disponible en: `http://localhost:5500/pages/index.html`

## 🎨 Sistema de Diseño

### Colores

- **Primario**: `#FF6B35` (Naranja vibrante)
- **Secundario**: `#004E89` (Azul profundo)
- **Acento**: `#FFD23F` (Amarillo dorado)
- **Éxito**: `#10B981`
- **Error**: `#EF4444`

### Tipografía

- **Fuente Principal**: Inter
- **Fuente de Títulos**: Outfit
- **Tamaños**: 12px - 48px (sistema de escala)

### Espaciado

Sistema de espaciado basado en múltiplos de 4px:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

## 📦 Componentes Disponibles

### Botones
```html
<button class="btn btn-primary">Primario</button>
<button class="btn btn-secondary">Secundario</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-ghost">Ghost</button>
```

### Tarjetas
```html
<div class="card">
  <div class="card-header">Header</div>
  <div class="card-body">Body</div>
  <div class="card-footer">Footer</div>
</div>
```

### Badges
```html
<span class="badge badge-primary">Nuevo</span>
<span class="badge badge-success">En Stock</span>
<span class="badge badge-sale">Oferta</span>
```

### Notificaciones Toast
```javascript
Utils.showToast('Mensaje de éxito', 'success');
Utils.showToast('Mensaje de error', 'error');
Utils.showToast('Mensaje de advertencia', 'warning');
```

## 🔌 API Client

### Uso Básico

```javascript
// Obtener todos los productos
const productos = await ProductosAPI.getAll({
  page: 1,
  limit: 12,
  categoria: 'electro-hogar'
});

// Obtener producto por ID
const producto = await ProductosAPI.getById(1);

// Buscar productos
const resultados = await ProductosAPI.buscar('lavadora');

// Productos destacados
const destacados = await ProductosAPI.getDestacados(8);
```

## 🛠️ Utilidades

### Formateo de Precios
```javascript
Utils.formatPrice(1500000); // "$1.500.000"
```

### Calcular Descuento
```javascript
Utils.calculateDiscount(2000000, 1500000); // 25
```

### Generar Estrellas
```javascript
Utils.generateStars(4.5); // HTML con estrellas
```

### WhatsApp
```javascript
const url = Utils.getWhatsAppUrl('+573001234567', 'Hola, me interesa...');
```

## 🎯 Características

✅ **Diseño Responsive** - Adaptable a todos los dispositivos  
✅ **Componentes Reutilizables** - Sistema de diseño modular  
✅ **API Client** - Comunicación con backend  
✅ **Carrito de Compras** - Gestión de productos  
✅ **Búsqueda y Filtros** - Filtrado avanzado de productos  
✅ **Lazy Loading** - Carga optimizada de imágenes  
✅ **Notificaciones Toast** - Feedback visual  
✅ **Animaciones Suaves** - Transiciones CSS  

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎨 Personalización

### Cambiar Colores

Edita `css/variables.css`:

```css
:root {
  --color-primary: #TU_COLOR;
  --color-secondary: #TU_COLOR;
  /* ... */
}
```

### Agregar Nuevos Componentes

1. Crea el componente en `css/components.css`
2. Documenta su uso en este README
3. Agrega ejemplos de uso

## 🐛 Debugging

### Habilitar Logs de API

En `js/api.js`, descomenta las líneas de console.log para ver las peticiones.

### Verificar Conexión con Backend

Abre la consola del navegador y ejecuta:

```javascript
api.get('/productos').then(console.log);
```

## 📄 Licencia

ISC
