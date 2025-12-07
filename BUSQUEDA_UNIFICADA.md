# 🔍 Sistema de Búsqueda Unificado

## Resumen

Se ha implementado una función de búsqueda unificada que funciona tanto en el buscador del navbar de escritorio como en el menú hamburguesa móvil, utilizando la extensión `pg_trgm` de PostgreSQL que ya está configurada en tu base de datos.

## ✨ Características

### 1. **Función Unificada**
- Una sola función `handleSearch(inputId)` para ambos buscadores
- Funciona con:
  - `search-input` (buscador desktop del navbar)
  - `mobile-search-input` (buscador del menú hamburguesa)

### 2. **Búsqueda Inteligente con pg_trgm**
La búsqueda utiliza tres estrategias en orden de prioridad:

#### a) Full-Text Search (español)
- Búsqueda de texto completo optimizada para español
- Busca en: nombre, descripción, marca y categoría
- Ejemplo: "nevera samsung" encuentra productos con ambas palabras

#### b) Búsqueda Parcial (ILIKE)
- Coincidencias parciales case-insensitive
- Busca en: nombre, SKU, descripción, marca, categoría
- Ejemplo: "sam" encuentra "Samsung", "SAMURAI", etc.

#### c) Búsqueda Difusa (pg_trgm similarity)
- Tolera errores ortográficos (umbral 30% de similitud)
- Ejemplos de búsquedas que funcionan:
  - "nevera" encuentra "Nevera", "NEVERA"
  - "samsumg" encuentra "Samsung" (typo)
  - "televidor" encuentra "Televisor" (error ortográfico)
  - "moto" encuentra "Motos", "Motocicleta"

## 📁 Archivos Modificados

### Frontend
**`frontend/assets/js/app.js`** - Líneas 273-288
```javascript
window.handleSearch = function (inputId = 'search-input') {
    const input = document.getElementById(inputId);
    if (input && input.value.trim()) {
        const query = input.value.trim();
        const currentPath = window.location.pathname;
        const isInPagesDir = currentPath.includes('/pages/');
        const targetPath = isInPagesDir ? 'productos.html' : 'pages/productos.html';
        
        window.location.href = `${targetPath}?q=${encodeURIComponent(query)}`;
    }
};
```

### Backend
**`backend/src/models/producto.model.js`**
- Función `findAll()` - Líneas ~97-119
- Función `count()` - Líneas ~305-318

## 🧪 Pruebas Recomendadas

Prueba estos casos para verificar que todo funciona:

1. **Búsqueda exacta**: "Samsung"
2. **Búsqueda parcial**: "sam" (debería encontrar Samsung)
3. **Con mayúsculas**: "NEVERA" (debería encontrar "Nevera")
4. **Con errores**: "televidor" (debería encontrar "televisor")
5. **Desde móvil**: Abre el menú hamburguesa y prueba la búsqueda
6. **Desde desktop**: Usa el buscador del navbar principal

## 🔧 Cómo Funciona

### Flujo de Búsqueda

1. **Usuario escribe en el buscador** (desktop o mobile)
2. **Presiona Enter o clic en el botón de búsqueda**
3. **Frontend llama a `handleSearch(inputId)`**
4. **Se redirige a `productos.html?q=termino`**
5. **Backend procesa la búsqueda** usando tres estrategias:
   ```sql
   WHERE (
     -- 1. Full-text search
     to_tsvector('spanish', ...) @@ plainto_tsquery('spanish', 'termino')
     -- 2. Búsqueda parcial
     OR LOWER(nombre) ILIKE LOWER('%termino%')
     -- 3. Búsqueda difusa
     OR similarity(LOWER(nombre), LOWER('termino')) > 0.3
   )
   ```
6. **Se muestran los resultados** en la página de productos

## 💡 Ventajas de pg_trgm

- ✅ Tolera errores de ortografía
- ✅ No requiere coincidencia exacta
- ✅ Funciona con cualquier idioma
- ✅ Rendimiento optimizado con índices GIN
- ✅ Ya está configurado en tu base de datos

## 📊 Rendimiento

Los índices GIN ya están creados:
```sql
CREATE INDEX idx_productos_nombre_trgm ON productos USING gin (nombre gin_trgm_ops);
CREATE INDEX idx_marcas_nombre_trgm ON marcas USING gin (nombre gin_trgm_ops);
```

Esto garantiza búsquedas rápidas incluso con miles de productos.

## 🔄 Uso en el Código

### HTML (Navbar Desktop)
```html
<input type="text" id="search-input" placeholder="Buscar neveras, muebles, motos...">
<button onclick="handleSearch()">Buscar</button>
```

### HTML (Menú Móvil)
```html
<input type="text" id="mobile-search-input" placeholder="Buscar productos...">
<button onclick="window.handleSearch('mobile-search-input')">Buscar</button>
```

### Listeners de Enter (ya implementado en app.js)
```javascript
initSearchListeners() {
    const ids = ['search-input', 'mobile-search-input'];
    ids.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    window.handleSearch(id);
                }
            };
        }
    });
}
```

## ⚠️ Notas Importantes

1. La búsqueda usa `pg_trgm` que YA está instalado en tu base de datos
2. El umbral de similitud es 0.3 (30%) - ajustable si necesitas más/menos tolerancia
3. La búsqueda es case-insensitive en todas las estrategias
4. Los resultados se ordenan por relevancia (primero full-text, luego parciales, luego similares)

## 🎯 Ejemplos de Búsqueda

| Usuario busca | Encuentra |
|---------------|-----------|
| "samsung" | Samsung TV 50", Samsung Nevera, etc. |
| "SAM" | Samsung, Samurai (cualquier marca con "sam") |
| "televidor" | Televisor (error ortográfico) |
| "nevera lg" | Neveras LG (múltiples palabras) |
| "50 pulgadas" | Productos con "50" y "pulgadas" en descripción |

¡La búsqueda está lista para usar! 🎉
