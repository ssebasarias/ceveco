# Scripts de Carga Normalizada de Productos

Este directorio contiene scripts normalizados para cargar productos desde archivos JSONL a la base de datos, asegurando que todos los campos se mapeen correctamente y que las imágenes se inserten en la tabla `producto_imagenes`.

## Problema Resuelto

Los archivos JSONL tenían diferentes formatos que causaban problemas:
- Campos con nombres diferentes (sku, referencia, referencia_excel, etc.)
- Imágenes no se insertaban correctamente en `producto_imagenes`
- Especificaciones en diferentes formatos (objeto, string, anidado)
- Precios con nombres diferentes (precio, precio_base, precio_promocion, etc.)

## Solución

Se creó una arquitectura de carga normalizada:

1. **BaseProductLoader** (`base-loader.js`): Clase base que maneja:
   - Normalización de campos comunes (SKU, nombre, precio, imágenes)
   - Inserción en BD (productos, producto_imagenes, producto_atributos)
   - Manejo de marcas, categorías y subcategorías

2. **Loaders Específicos**: Cada JSONL tiene su propio loader que extiende `BaseProductLoader`:
   - `load-suzuki.js` - Productos Suzuki
   - `load-maximuebles.js` - Productos Maximuebles
   - `load-comodisimos.js` - Productos Comodisimos
   - `load-honda.js` - Productos Honda
   - `load-corbeta.js` - Productos Corbeta (Kalley)
   - `load-haceb.js` - Productos Haceb
   - `load-lg.js` - Productos LG
   - `load-lyl.js` - Productos L&L
   - `load-inval.js` - Productos Inval
   - `load-hyundai.js` - Productos Hyundai
   - `load-stihl.js` - Productos STIHL

3. **Script Maestro** (`load-all.js`): Ejecuta todos los loaders en secuencia

## Uso

### Cargar un archivo específico

```bash
# Desde la raíz del proyecto
node scripts/loaders/load-suzuki.js
node scripts/loaders/load-maximuebles.js
node scripts/loaders/load-comodisimos.js
# etc...
```

### Cargar todos los archivos

```bash
node scripts/loaders/load-all.js
```

## Características

### Normalización de Campos

Cada loader normaliza los campos del JSONL al formato estándar de la BD:

- **SKU**: Se extrae de `sku`, `referencia`, `referencia_excel`, `ean_referencia`, etc.
- **Nombre**: Se normaliza desde `nombre` o `name`
- **Precio**: Se normaliza desde `precio`, `precio_base`, `precio_actual`
- **Precio Promocional**: Se normaliza desde `precio_promocion`, `precio_promocional`, `precio_descuento`
- **Imágenes**: Se normaliza desde `imagenes` (array de strings o objetos)
- **Especificaciones**: Se normaliza desde `especificaciones`, `caracteristicas` (objeto o string)

### Manejo de Imágenes

Las imágenes se insertan correctamente en `producto_imagenes`:
- La primera imagen se marca como `es_principal = true`
- Se evitan duplicados
- Se valida que las URLs sean válidas
- Se ordenan por el campo `orden`

### Manejo de Especificaciones

Las especificaciones se insertan en `producto_atributos`:
- Se crean atributos dinámicamente si no existen
- Se aplanan objetos anidados
- Se parsean strings con formato "Key: Value; Key2: Value2"

## Estructura de Archivos

```
scripts/loaders/
├── base-loader.js          # Clase base con lógica común
├── load-suzuki.js          # Loader específico para Suzuki
├── load-maximuebles.js     # Loader específico para Maximuebles
├── load-comodisimos.js     # Loader específico para Comodisimos
├── load-honda.js           # Loader específico para Honda
├── load-corbeta.js         # Loader específico para Corbeta
├── load-haceb.js           # Loader específico para Haceb
├── load-lg.js              # Loader específico para LG
├── load-lyl.js             # Loader específico para L&L
├── load-inval.js           # Loader específico para Inval
├── load-hyundai.js         # Loader específico para Hyundai
├── load-stihl.js           # Loader específico para STIHL
├── load-all.js             # Script maestro para cargar todos
└── README.md               # Esta documentación
```

## Formato de Salida

Cada script muestra:
- Progreso de carga por producto
- Estadísticas finales:
  - Productos procesados
  - Productos insertados
  - Productos actualizados
  - Imágenes insertadas
  - Errores encontrados

## Notas

- Los scripts son idempotentes: pueden ejecutarse múltiples veces sin crear duplicados
- Si un producto ya existe (por SKU), se actualiza en lugar de insertar
- Las imágenes duplicadas se evitan automáticamente
- Los errores en productos individuales no detienen la carga completa

## Troubleshooting

### Las imágenes no aparecen en el frontend

1. Verificar que las imágenes se insertaron en `producto_imagenes`:
   ```sql
   SELECT * FROM producto_imagenes WHERE id_producto = <id_producto>;
   ```

2. Verificar que al menos una imagen tenga `es_principal = true`:
   ```sql
   SELECT * FROM producto_imagenes WHERE id_producto = <id_producto> AND es_principal = true;
   ```

3. Verificar que las URLs de las imágenes sean válidas y accesibles

### Errores de categoría no encontrada

Los scripts intentan crear categorías y subcategorías automáticamente si no existen. Si falla, verificar:
- Que la categoría base exista en la tabla `categorias`
- Que los nombres de categoría en el JSONL coincidan con los de la BD

### Errores de SKU duplicado

Si hay errores de SKU duplicado, el script actualizará el producto existente en lugar de crear uno nuevo. Esto es el comportamiento esperado.
