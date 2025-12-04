Esta base de datos está diseñada para soportar:
- Catálogo completo de productos con categorías, marcas e imágenes
- Sistema de usuarios con roles y direcciones
- Carrito de compras y lista de favoritos
- Gestión completa de pedidos y seguimiento
- Sistema de reseñas y calificaciones
- Múltiples sedes con inventario independiente
- Cupones y promociones
- Newsletter y marketing
- Configuración flexible del sistema
- Logs de actividad para auditoría

Características adicionales:
- Soporte para múltiples imágenes por producto
- Especificaciones técnicas flexibles
- Historial de estados de pedidos
- Inventario por sede
- Sistema de calificaciones con compra verificada
- Triggers automáticos para mantener integridad
- Vistas optimizadas para consultas frecuentes
- Funciones almacenadas para operaciones comunes

Compatibilidad PostgreSQL 17:
- Uso de SERIAL/BIGSERIAL en lugar de AUTO_INCREMENT
- Tipos ENUM personalizados
- NUMERIC en lugar de DECIMAL
- Índices GIN para búsqueda de texto completo
- Funciones y triggers con sintaxis PL/pgSQL
- JSONB para datos JSON
- Triggers automáticos para actualización de timestamps

Mejoras Sutiles Aplicadas (Diciembre 2025):
- Ampliación de subcategorías: de 11 a 49 subcategorías
  * Electro Hogar: 19 subcategorías
  * Muebles y Organización: 14 subcategorías
  * Motos: 8 subcategorías
  * Herramientas STIHL: 8 subcategorías
- Campo precio_promocional en productos para precios en oferta/financiados
- Campo referencia_proveedor en productos para REF del fabricante
- Campo referencia_proveedor en productos para REF del fabricante
- Reestructuración completa de atributos (EAV) para mayor flexibilidad
- Nueva tabla 'atributos' y 'producto_atributos'
- Eliminación de campos técnicos hardcoded en tabla productos
- Índice para búsquedas por referencia_proveedor
- Vista actualizada con nuevos campos

============================================
DOCUMENTACIÓN DEL MODELO EAV (Atributos Flexibles)
============================================

El sistema utiliza un modelo Entidad-Atributo-Valor (EAV) para manejar las especificaciones técnicas
de los productos sin sobrecargar la tabla principal 'productos' con columnas nulas.

TABLAS INVOLUCRADAS:
1. atributos: Define qué características existen (ej: Potencia, Color, Voltaje).
2. producto_atributos: Asigna valores específicos a un producto para un atributo dado.

EJEMPLO DE USO:
Supongamos un producto con ID 88 (Una Lavadora Samsung) que tiene las siguientes características:
- Capacidad de Lavado: 20 Kg
- Peso: 45 Kg
- Color: Blanco
- Potencia: 500 W

Así se verían los datos en la tabla 'producto_atributos':

| id_producto | id_atributo          | valor_numero | valor_texto | valor_booleano |
| ----------- | -------------------- | ------------ | ----------- | -------------- |
| 88          | 4 (Capacidad Lavado) | 20.00        | NULL        | NULL           |
| 88          | 1 (Peso)             | 45.00        | NULL        | NULL           |
| 88          | 3 (Color)            | NULL         | "Blanco"    | NULL           |
| 88          | 7 (Potencia)         | 500.00       | NULL        | NULL           |

CONSULTAS COMUNES:

-- Obtener todas las especificaciones de un producto:
SELECT a.nombre, a.unidad, 
       COALESCE(pa.valor_texto, pa.valor_numero::TEXT, pa.valor_booleano::TEXT) as valor
FROM producto_atributos pa
JOIN atributos a ON pa.id_atributo = a.id_atributo
WHERE pa.id_producto = 88;

-- Filtrar productos por atributo (ej: Televisores 4K):
SELECT p.* 
FROM productos p
JOIN producto_atributos pa ON p.id_producto = pa.id_producto
JOIN atributos a ON pa.id_atributo = a.id_atributo
WHERE a.nombre = 'Resolución' AND pa.valor_texto = '4K UHD';



---

## 9. Ejemplo de Inserción del Mundo Real

A continuación se muestra cómo registrar un producto complejo basándose en una ficha técnica real (ejemplo: TV Kalley 32").

### Datos del Producto (Extraídos de Ficha Técnica)
*   **Marca**: Kalley
*   **SKU (Código de Barras)**: 7705946478663
*   **Referencia Proveedor**: K-RTV32FHD
*   **Nombre**: TV Kalley 32" Smart TV HD
*   **Precios**: $800.000 (Contado) / $730.000 (Promo)
*   **Especificaciones**: 32 Pulgadas, Smart TV, HD, 2 HDMI, 2 USB, Roku TV.

### Script SQL Completo

```sql
-- 1. Verificar o Insertar la Marca
-- Usamos ON CONFLICT para no duplicar si ya existe
INSERT INTO marcas (nombre) VALUES ('Kalley') 
ON CONFLICT (nombre) DO NOTHING;

-- 2. Insertar el Producto
-- Se asume que id_categoria=1 (Electro) y id_subcategoria=4 (Televisores)
-- Se busca dinámicamente el ID de la marca 'Kalley'
INSERT INTO productos (
    sku, 
    referencia_proveedor, 
    nombre, 
    descripcion_larga, 
    id_categoria, 
    id_subcategoria, 
    id_marca, 
    precio_actual, 
    precio_promocional, 
    stock, 
    activo
) VALUES (
    '7705946478663',           -- SKU (Código de barras)
    'K-RTV32FHD',              -- Referencia del Proveedor
    'TV Kalley 32" Smart TV HD',
    'TV 32", Smart Tv, HD, DVB-T2, 2 HDMI, 2 USB, Roku TV, Bluetooth.',
    1,                         -- ID Electro Hogar
    4,                         -- ID Televisores
    (SELECT id_marca FROM marcas WHERE nombre = 'Kalley'), 
    800000,                    -- Precio Contado
    730000,                    -- Precio Promo
    15,                        -- Stock inicial
    TRUE
) RETURNING id_producto; -- Retorna el ID generado (ej: 205)

-- 3. Insertar Atributos (Especificaciones Técnicas)
-- Suponiendo que el ID del producto insertado fue 205

-- Tamaño de Pantalla: 32"
INSERT INTO producto_atributos (id_producto, id_atributo, valor_numero)
VALUES (205, (SELECT id_atributo FROM atributos WHERE nombre = 'Tamaño de Pantalla'), 32);

-- Resolución: HD
INSERT INTO producto_atributos (id_producto, id_atributo, valor_texto)
VALUES (205, (SELECT id_atributo FROM atributos WHERE nombre = 'Resolución'), 'HD');

-- Smart TV: Sí
INSERT INTO producto_atributos (id_producto, id_atributo, valor_booleano)
VALUES (205, (SELECT id_atributo FROM atributos WHERE nombre = 'Smart TV'), TRUE);

-- Puertos HDMI: 2
INSERT INTO producto_atributos (id_producto, id_atributo, valor_numero)
VALUES (205, (SELECT id_atributo FROM atributos WHERE nombre = 'Puertos HDMI'), 2);

-- Puertos USB: 2
INSERT INTO producto_atributos (id_producto, id_atributo, valor_numero)
VALUES (205, (SELECT id_atributo FROM atributos WHERE nombre = 'Puertos USB'), 2);

-- Sistema Operativo: Roku TV
INSERT INTO producto_atributos (id_producto, id_atributo, valor_texto)
VALUES (205, (SELECT id_atributo FROM atributos WHERE nombre = 'Sistema Operativo'), 'Roku TV');
```

Este flujo garantiza que toda la información técnica y comercial del producto quede correctamente estructurada y normalizada en la base de datos.

