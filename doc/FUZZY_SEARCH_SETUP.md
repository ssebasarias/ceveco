# Instrucciones para habilitar Búsqueda Difusa (Fuzzy Search)

El buscador ahora soporta búsqueda inteligente tolerante a errores ortográficos.

## Paso 1: Habilitar extensión pg_trgm en PostgreSQL

Ejecuta este comando en tu base de datos PostgreSQL:

```sql
-- Conectar a la base de datos
psql -U postgres -d ceveco_db

-- O ejecutar el archivo directamente
psql -U postgres -d ceveco_db -f backend/migrations/enable_fuzzy_search.sql
```

O desde pgAdmin o tu cliente SQL favorito, ejecuta:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_productos_nombre_trgm ON productos USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_marcas_nombre_trgm ON marcas USING gin (nombre gin_trgm_ops);
```

## ¿Qué hace esto?

### Características del nuevo buscador:

1. **Búsqueda tolerante a errores**: 
   - "nevera" encontrará "Nevera Samsung"
   - "nebera" (error ortográfico) también encontrará "Nevera"
   - "lg" encontrará productos de marca LG

2. **Búsqueda inteligente**:
   - Busca en nombre del producto
   - Busca en descripción
   - Busca en nombre de marca
   - Busca en categoría
   - Busca en SKU

3. **Fuzzy matching** (similaridad):
   - Usa algoritmo de trigramas
   - Encuentra palabras similares aunque tengan typos
   - Umbral de similaridad: 30%

## Cómo usar el buscador:

1. Escribe cualquier término en el buscador del navbar
2. Presiona Enter o clic en el botón de búsqueda
3. Te redirige automáticamente a `/productos.html?q=tu_busqueda`
4. Los resultados se muestran ordenados por relevancia

## Ejemplos de búsquedas que funcionarán:

- "nevra" → encontrará "Nevera"
- "sansung" → encontrará productos "Samsung"
- "motos" → encontrará categoría Motos y productos relacionados
- "stil" → encontrará "STIHL"
- "mueble sala" → encontrará muebles para sala

¡El buscador es muy inteligente y flexible!
