# 📝 Guía para Cargar Productos - Ceveco

## 🎯 Estado Actual

✅ **Base de datos limpia y lista**
- ✅ 0 productos
- ✅ 0 imágenes
- ✅ 0 atributos
- ✅ Categorías preservadas (5)
- ✅ Marcas preservadas (21)
- ✅ Subcategorías preservadas (60)

---

## 📋 Métodos para Cargar Productos

### Método 1: API REST (Recomendado)

Usa los endpoints del backend para crear productos:

**Endpoint:** `POST /api/v1/productos`

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/productos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "sku": "CEV-TV-001",
    "nombre": "TV Samsung 55 pulgadas 4K",
    "descripcion_corta": "Smart TV 4K con HDR",
    "descripcion_larga": "Televisor Samsung de 55 pulgadas con resolución 4K...",
    "id_categoria": 1,
    "id_subcategoria": 4,
    "id_marca": 4,
    "precio_actual": 2500000,
    "precio_anterior": 2800000,
    "stock": 10,
    "garantia_meses": 12,
    "destacado": true,
    "activo": true
  }'
```

**Ejemplo con JavaScript/Node.js:**
```javascript
const axios = require('axios');

async function crearProducto() {
  try {
    const response = await axios.post('http://localhost:3000/api/v1/productos', {
      sku: 'CEV-TV-001',
      nombre: 'TV Samsung 55 pulgadas 4K',
      descripcion_corta: 'Smart TV 4K con HDR',
      descripcion_larga: 'Televisor Samsung de 55 pulgadas...',
      id_categoria: 1,
      id_subcategoria: 4,
      id_marca: 4,
      precio_actual: 2500000,
      stock: 10,
      activo: true
    }, {
      headers: {
        'Authorization': 'Bearer TU_TOKEN',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Producto creado:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

crearProducto();
```

---

### Método 2: Carga Masiva desde CSV/Excel

Si tienes muchos productos en Excel o CSV, puedes usar este script:

**1. Prepara tu archivo CSV** (`productos.csv`):
```csv
sku,nombre,descripcion_corta,id_categoria,id_marca,precio_actual,stock
CEV-TV-001,TV Samsung 55",Smart TV 4K,1,4,2500000,10
CEV-NEV-001,Nevera LG 420L,No Frost,1,5,3200000,5
```

**2. Usa el script de carga masiva:**
```javascript
// bulk-load-products.js
const fs = require('fs');
const { Pool } = require('pg');
const csv = require('csv-parser');

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'ceveco_db',
  user: 'postgres',
  password: 'postgres'
});

async function cargarProductosDesdeCSV(archivo) {
  const productos = [];
  
  // Leer CSV
  fs.createReadStream(archivo)
    .pipe(csv())
    .on('data', (row) => productos.push(row))
    .on('end', async () => {
      console.log(`📦 Cargando ${productos.length} productos...`);
      
      for (const producto of productos) {
        try {
          await pool.query(`
            INSERT INTO productos (
              sku, nombre, descripcion_corta, id_categoria, 
              id_marca, precio_actual, stock, activo
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
          `, [
            producto.sku,
            producto.nombre,
            producto.descripcion_corta,
            producto.id_categoria,
            producto.id_marca,
            producto.precio_actual,
            producto.stock
          ]);
          console.log(`✅ ${producto.sku} - ${producto.nombre}`);
        } catch (error) {
          console.error(`❌ Error en ${producto.sku}:`, error.message);
        }
      }
      
      await pool.end();
      console.log('✅ Carga completada');
    });
}

cargarProductosDesdeCSV('productos.csv');
```

---

### Método 3: Inserción Directa SQL

Para cargar productos directamente en la base de datos:

```sql
-- Conectar a la base de datos
psql -h localhost -p 5433 -U postgres -d ceveco_db

-- Insertar producto
INSERT INTO productos (
  sku, nombre, descripcion_corta, descripcion_larga,
  id_categoria, id_subcategoria, id_marca,
  precio_actual, precio_anterior, stock,
  garantia_meses, destacado, activo
) VALUES (
  'CEV-TV-001',
  'TV Samsung 55 pulgadas 4K UHD',
  'Smart TV 4K con HDR y procesador Crystal',
  'Televisor Samsung de 55 pulgadas con resolución 4K Ultra HD...',
  1,  -- Electro Hogar
  4,  -- Televisores
  4,  -- Samsung
  2500000,
  2800000,
  10,
  12,
  true,
  true
);

-- Agregar imagen al producto
INSERT INTO producto_imagenes (
  id_producto, url_imagen, alt_text, orden, es_principal
) VALUES (
  (SELECT id_producto FROM productos WHERE sku = 'CEV-TV-001'),
  '/images/productos/tv-samsung-55.jpg',
  'TV Samsung 55 pulgadas',
  1,
  true
);

-- Agregar atributos/especificaciones
INSERT INTO producto_atributos (id_producto, id_atributo, valor_texto, valor_numero)
VALUES 
  (
    (SELECT id_producto FROM productos WHERE sku = 'CEV-TV-001'),
    (SELECT id_atributo FROM atributos WHERE nombre = 'Tamaño de Pantalla'),
    NULL,
    55
  ),
  (
    (SELECT id_producto FROM productos WHERE sku = 'CEV-TV-001'),
    (SELECT id_atributo FROM atributos WHERE nombre = 'Resolución'),
    '4K UHD',
    NULL
  );
```

---

## 📊 IDs de Referencia

### Categorías Disponibles
```sql
SELECT id_categoria, nombre FROM categorias;
```
| ID | Nombre |
|----|--------|
| 1 | Electro Hogar |
| 2 | Muebles y Organización |
| 3 | Motos |
| 4 | Herramientas STIHL |
| 5 | Otros |

### Marcas Disponibles
```sql
SELECT id_marca, nombre FROM marcas ORDER BY nombre;
```
Algunas marcas: Honda, Kalley, Haceb, Samsung, LG, STIHL, Yamaha, etc.

### Subcategorías por Categoría
```sql
SELECT s.id_subcategoria, s.nombre, c.nombre as categoria
FROM subcategorias s
JOIN categorias c ON s.id_categoria = c.id_categoria
ORDER BY c.nombre, s.nombre;
```

---

## 🔍 Consultas Útiles

### Ver productos creados
```sql
SELECT 
  p.id_producto,
  p.sku,
  p.nombre,
  c.nombre as categoria,
  m.nombre as marca,
  p.precio_actual,
  p.stock
FROM productos p
JOIN categorias c ON p.id_categoria = c.id_categoria
JOIN marcas m ON p.id_marca = m.id_marca
ORDER BY p.fecha_creacion DESC;
```

### Contar productos por categoría
```sql
SELECT 
  c.nombre as categoria,
  COUNT(p.id_producto) as total_productos
FROM categorias c
LEFT JOIN productos p ON c.id_categoria = p.id_categoria
GROUP BY c.nombre
ORDER BY total_productos DESC;
```

### Ver productos sin imágenes
```sql
SELECT p.sku, p.nombre
FROM productos p
LEFT JOIN producto_imagenes pi ON p.id_producto = pi.id_producto
WHERE pi.id_imagen IS NULL;
```

---

## ✅ Checklist de Validación

Antes de dar por terminada la carga de productos, verifica:

- [ ] Todos los productos tienen SKU único
- [ ] Todos los productos tienen nombre y descripción
- [ ] Todos los productos tienen categoría y marca asignada
- [ ] Todos los productos tienen precio > 0
- [ ] Todos los productos tienen al menos una imagen
- [ ] Los productos destacados están marcados correctamente
- [ ] El stock está actualizado
- [ ] Las especificaciones técnicas están completas

---

## 🛠️ Scripts de Ayuda

### Verificar estado actual
```bash
node check-db.js
```

### Crear backup antes de cargar
```bash
node backup-and-clean.js
# (cancela cuando te pida confirmación si solo quieres backup)
```

### Restaurar si algo sale mal
```bash
node restore-backup.js ceveco_backup_2025-12-22T14-38-17.sql
```

---

## 📞 Contacto

Si tienes dudas durante la carga de productos:
1. Revisa esta guía
2. Consulta el archivo `BACKUP_README.md`
3. Contacta al equipo de desarrollo

---

**¡Buena suerte con la carga de productos!** 🚀
