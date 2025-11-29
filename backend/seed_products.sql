-- Insertar productos
INSERT INTO productos (id_categoria, id_marca, sku, nombre, precio_actual, precio_anterior, badge, destacado, stock, activo, descripcion_corta) VALUES
(3, 1, 'MOTO-001', 'Moto CB 125F DLX Modelo 2026', 6500000, 6800000, 'Nuevo', TRUE, 10, TRUE, 'Moto Honda CB 125F DLX'),
(1, 2, 'LAV-001', 'Lavadora Carga Superior 14KG Gris', 1200000, 1450000, 'Oferta', TRUE, 15, TRUE, 'Lavadora Kalley 14KG'),
(1, 3, 'NEV-001', 'Nevera No Frost 243 Litros Titanio', 1500000, NULL, NULL, TRUE, 8, TRUE, 'Nevera Haceb 243L'),
(1, 4, 'TV-001', 'TV 50" Crystal UHD 4K Smart TV', 1800000, 2200000, 'Destacado', TRUE, 20, TRUE, 'TV Samsung 50 Pulgadas'),
(1, 4, 'AUD-001', 'Barra de Sonido HW-C400', 450000, NULL, NULL, TRUE, 12, TRUE, 'Barra de sonido Samsung'),
(1, 5, 'LAV-002', 'Lavadora Smart Inverter 19kg Negra', 2100000, 2500000, 'Oferta', TRUE, 5, TRUE, 'Lavadora LG 19KG'),
(2, 6, 'MUE-001', 'Escritorio Moderno con Cajones', 350000, NULL, NULL, TRUE, 30, TRUE, 'Escritorio Rimax'),
(4, 7, 'HER-001', 'Motosierra MS 170', 850000, NULL, NULL, TRUE, 10, TRUE, 'Motosierra STIHL MS 170'),
(3, 8, 'MOTO-002', 'Moto XTZ 150 Modelo 2024', 7200000, NULL, NULL, TRUE, 4, TRUE, 'Moto Yamaha XTZ 150'),
(2, 6, 'MUE-002', 'Estantería 5 Niveles Blanca', 280000, NULL, NULL, TRUE, 25, TRUE, 'Estantería Rimax'),
(4, 7, 'HER-002', 'Guadaña FS 38', 620000, NULL, NULL, TRUE, 15, TRUE, 'Guadaña STIHL FS 38'),
(1, 3, 'EST-001', 'Estufa 4 Puestos Acero Inoxidable', 980000, NULL, NULL, TRUE, 10, TRUE, 'Estufa Haceb 4 Puestos')
ON CONFLICT (sku) DO NOTHING;

-- Insertar imágenes
INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal) VALUES
((SELECT id_producto FROM productos WHERE sku = 'MOTO-001'), 'https://placehold.co/400x400/png?text=Moto+CB125F', TRUE),
((SELECT id_producto FROM productos WHERE sku = 'LAV-001'), 'https://placehold.co/400x400/png?text=Lavadora+14KG', TRUE),
((SELECT id_producto FROM productos WHERE sku = 'NEV-001'), 'https://placehold.co/400x400/png?text=Nevera+Haceb', TRUE),
((SELECT id_producto FROM productos WHERE sku = 'TV-001'), 'https://placehold.co/400x400/png?text=TV+Samsung', TRUE),
((SELECT id_producto FROM productos WHERE sku = 'AUD-001'), 'https://placehold.co/400x400/png?text=Soundbar', TRUE),
((SELECT id_producto FROM productos WHERE sku = 'LAV-002'), 'https://placehold.co/400x400/png?text=Lavadora+LG', TRUE),
((SELECT id_producto FROM productos WHERE sku = 'MUE-001'), 'https://placehold.co/400x400/png?text=Escritorio', TRUE),
((SELECT id_producto FROM productos WHERE sku = 'HER-001'), 'https://placehold.co/400x400/png?text=Motosierra', TRUE),
((SELECT id_producto FROM productos WHERE sku = 'MOTO-002'), 'https://placehold.co/400x400/png?text=Moto+XTZ', TRUE),
((SELECT id_producto FROM productos WHERE sku = 'MUE-002'), 'https://placehold.co/400x400/png?text=Estanteria', TRUE),
((SELECT id_producto FROM productos WHERE sku = 'HER-002'), 'https://placehold.co/400x400/png?text=Guadana', TRUE),
((SELECT id_producto FROM productos WHERE sku = 'EST-001'), 'https://placehold.co/400x400/png?text=Estufa', TRUE);
