
-- Insertar producto
INSERT INTO productos (
  ref, nombre, descripcion_corta, descripcion_larga,
  id_categoria, id_subcategoria, id_marca,
  precio, precio_oferta, stock, activo, destacado,
  fecha_creacion, fecha_actualizacion
) VALUES (
  '32LR600',
  'TV  32" HD,USB - 2 HDMI - TDT, SMART TV - WebOS 3,5, Procesador Dual core .',
  'LG TV  32" HD,USB - 2 HDMI - TDT, SMART TV - WebOS 3,5, Procesador Dual core .',
  '<p>LG TV  32" HD,USB - 2 HDMI - TDT, SMART TV - WebOS 3,5, Procesador Dual core .</p><p>Precio especial: $845,000</p>',
  1,
  4,
  5,
  845000,
  765000,
  10,
  true,
  false,
  NOW(),
  NOW()
) RETURNING id_producto;


-- Insertar imagen 1
INSERT INTO producto_imagenes (
  id_producto, url, orden, es_principal
) VALUES (
  (SELECT id_producto FROM productos WHERE ref = '32LR600'),
  '/images/products/32LR600_1.webp',
  1,
  true
);

-- Insertar imagen 2
INSERT INTO producto_imagenes (
  id_producto, url, orden, es_principal
) VALUES (
  (SELECT id_producto FROM productos WHERE ref = '32LR600'),
  '/images/products/32LR600_2.webp',
  2,
  false
);

-- Insertar imagen 3
INSERT INTO producto_imagenes (
  id_producto, url, orden, es_principal
) VALUES (
  (SELECT id_producto FROM productos WHERE ref = '32LR600'),
  '/images/products/32LR600_3.webp',
  3,
  false
);

-- Insertar atributo: Tamaño de Pantalla
INSERT INTO producto_atributos (
  id_producto, nombre, valor, unidad
) VALUES (
  (SELECT id_producto FROM productos WHERE ref = '32LR600'),
  'Tamaño de Pantalla',
  '32',
  'pulgadas'
);

-- Insertar atributo: Año Modelo
INSERT INTO producto_atributos (
  id_producto, nombre, valor, unidad
) VALUES (
  (SELECT id_producto FROM productos WHERE ref = '32LR600'),
  'Año Modelo',
  '2025',
  NULL
);