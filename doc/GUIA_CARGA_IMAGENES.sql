-- =========================================================================
-- GUÍA DE CARGA SEGURA DE PRODUCTOS E IMÁGENES - CEVECO
-- =========================================================================

-- PASO 1: INSERTAR EL PRODUCTO
-- Es importante insertar primero el producto para obtener su ID.
-- Usamos una transacción para asegurar que todo se guarde o nada.

BEGIN;

-- 1.1 Insertar datos del producto
INSERT INTO productos (
    sku, 
    nombre, 
    descripcion_corta, 
    descripcion_larga, 
    precio_actual, 
    precio_anterior,
    stock, 
    id_categoria, 
    id_subcategoria,
    id_marca,
    activo,
    destacado
) VALUES (
    'LAV-SAMSUNG-22KG',                  -- SKU (Debe ser único)
    'Lavadora Samsung Digital Inverter 22kg', -- Nombre
    'Lavadora carga superior con tecnología BubbleStorm', -- Resumen
    'Descripción larga y detallada del producto...', -- Detalle completo
    2500000,                             -- Precio Actual
    2900000,                             -- Precio Anterior (Opcional, para mostrar oferta)
    10,                                  -- Stock inicial
    1,                                   -- ID Categoría (Electro Hogar)
    1,                                   -- ID Subcategoría (Lavadoras)
    4,                                   -- ID Marca (Samsung)
    TRUE,                                -- Activo
    FALSE                                -- Destacado
);

-- PASO 2: RECUPERAR EL ID (Si lo haces manual)
-- Si estás en un script automático, usa RETURNING id_producto en el INSERT anterior.
-- Aquí asumimos que buscamos el ID del producto que acabamos de crear por su SKU:

-- Definir variable (conceptual, en SQL puro debes copiar y pegar el ID)
-- Supongamos que el ID es 150.

-- PASO 3: INSERTAR IMÁGENES
-- Recomendación: Usa imágenes WebP de máximo 1000px de ancho.
-- Sube los archivos a: frontend/assets/img/productos/

INSERT INTO producto_imagenes (id_producto, url_imagen, alt_text, es_principal, orden) VALUES
(
    (SELECT id_producto FROM productos WHERE sku = 'LAV-SAMSUNG-22KG'), -- Busca el ID automáticamente
    '../assets/img/productos/lavadora-samsung-main.webp', -- Ruta Relativa (Optimizada)
    'Lavadora Samsung 22kg Vista Frontal',
    TRUE, -- Esta es la PRINCIPAL (Portada)
    1
),
(
    (SELECT id_producto FROM productos WHERE sku = 'LAV-SAMSUNG-22KG'),
    '../assets/img/productos/lavadora-samsung-panel.webp',
    'Panel de control digital',
    FALSE,
    2
),
(
    (SELECT id_producto FROM productos WHERE sku = 'LAV-SAMSUNG-22KG'),
    '../assets/img/productos/lavadora-samsung-interior.webp',
    'Interior tambor diamante',
    FALSE,
    3
);

-- PASO 4: ASIGNAR ESPECIFICACIONES (Opcional pero recomendado)
-- Ayuda a los filtros de búsqueda

INSERT INTO producto_atributos (id_producto, id_atributo, valor_texto, valor_numero) VALUES
(
    (SELECT id_producto FROM productos WHERE sku = 'LAV-SAMSUNG-22KG'),
    (SELECT id_atributo FROM atributos WHERE nombre = 'Capacidad de Carga'),
    NULL,
    22 -- Valor numérico (22 Kg)
),
(
    (SELECT id_producto FROM productos WHERE sku = 'LAV-SAMSUNG-22KG'),
    (SELECT id_atributo FROM atributos WHERE nombre = 'Color'),
    'Gris Inox',
    NULL
);

COMMIT;

-- =========================================================================
-- TIPS DE RENDIMIENTO
-- =========================================================================
-- 1. Formato: Usa siempre .webp en lugar de .png o .jpg pesados.
-- 2. Tamaño: Redimensiona a máx 1000px de ancho antes de subir.
-- 3. Lazy Loading: El frontend ya ha sido actualizado para cargar imágenes bajo demanda.
-- 4. CDNs: Si el proyecto crece, cambia las rutas relativas '../assets' por URLs absolutas de un CDN (ej: https://cdn.ceveco.com/img/...)
