-- ============================================
-- BASE DE DATOS CEVECO E-COMMERCE
-- Sistema de gestión para tienda de electrodomésticos,
-- muebles, motos y herramientas
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS ceveco_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ceveco_db;

-- ============================================
-- TABLAS DE CATÁLOGO Y PRODUCTOS
-- ============================================

-- Tabla de categorías principales
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url VARCHAR(255),
    icono VARCHAR(50),
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de subcategorías
CREATE TABLE subcategorias (
    id_subcategoria INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE CASCADE,
    INDEX idx_categoria (id_categoria),
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de marcas
CREATE TABLE marcas (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(255),
    descripcion TEXT,
    sitio_web VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de productos
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    id_subcategoria INT,
    id_marca INT NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion_corta TEXT,
    descripcion_larga TEXT,
    precio_actual DECIMAL(12, 2) NOT NULL,
    precio_anterior DECIMAL(12, 2),
    costo DECIMAL(12, 2),
    stock INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    peso DECIMAL(8, 2) COMMENT 'Peso en kilogramos',
    dimensiones VARCHAR(100) COMMENT 'Alto x Ancho x Profundo en cm',
    garantia_meses INT DEFAULT 12,
    clasificacion_energetica VARCHAR(10),
    modelo VARCHAR(100),
    color VARCHAR(50),
    material VARCHAR(100),
    badge VARCHAR(50) COMMENT 'Nuevo, Oferta, Destacado, etc.',
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    vistas INT DEFAULT 0,
    ventas_totales INT DEFAULT 0,
    calificacion_promedio DECIMAL(3, 2) DEFAULT 0.00,
    total_resenas INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_subcategoria) REFERENCES subcategorias(id_subcategoria) ON DELETE SET NULL,
    FOREIGN KEY (id_marca) REFERENCES marcas(id_marca),
    INDEX idx_categoria (id_categoria),
    INDEX idx_marca (id_marca),
    INDEX idx_precio (precio_actual),
    INDEX idx_destacado (destacado),
    INDEX idx_activo (activo),
    INDEX idx_sku (sku),
    FULLTEXT idx_busqueda (nombre, descripcion_corta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de imágenes de productos
CREATE TABLE producto_imagenes (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    orden INT DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    INDEX idx_producto (id_producto),
    INDEX idx_principal (es_principal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de especificaciones técnicas
CREATE TABLE producto_especificaciones (
    id_especificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    nombre_atributo VARCHAR(100) NOT NULL,
    valor_atributo TEXT NOT NULL,
    grupo VARCHAR(50) COMMENT 'General, Técnico, Dimensiones, etc.',
    orden INT DEFAULT 0,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    INDEX idx_producto (id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE USUARIOS Y AUTENTICACIÓN
-- ============================================

-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    celular VARCHAR(20),
    tipo_documento ENUM('CC', 'CE', 'NIT', 'Pasaporte') DEFAULT 'CC',
    numero_documento VARCHAR(50) UNIQUE,
    fecha_nacimiento DATE,
    genero ENUM('M', 'F', 'Otro', 'Prefiero no decir'),
    avatar_url VARCHAR(255),
    rol ENUM('cliente', 'vendedor', 'admin') DEFAULT 'cliente',
    activo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(255),
    token_recuperacion VARCHAR(255),
    fecha_ultimo_acceso TIMESTAMP NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_documento (numero_documento),
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de direcciones de usuarios
CREATE TABLE direcciones (
    id_direccion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre_destinatario VARCHAR(100) NOT NULL,
    telefono_contacto VARCHAR(20) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    direccion_linea1 VARCHAR(255) NOT NULL,
    direccion_linea2 VARCHAR(255),
    codigo_postal VARCHAR(20),
    barrio VARCHAR(100),
    referencias TEXT,
    es_principal BOOLEAN DEFAULT FALSE,
    tipo ENUM('casa', 'trabajo', 'otro') DEFAULT 'casa',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_principal (es_principal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE CARRITO Y FAVORITOS
-- ============================================

-- Tabla de carrito de compras
CREATE TABLE carrito (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    session_id VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de items del carrito
CREATE TABLE carrito_items (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12, 2) NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_carrito) REFERENCES carrito(id_carrito) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    INDEX idx_carrito (id_carrito),
    INDEX idx_producto (id_producto),
    UNIQUE KEY unique_carrito_producto (id_carrito, id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de productos favoritos/wishlist
CREATE TABLE favoritos (
    id_favorito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_producto (id_usuario, id_producto),
    INDEX idx_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE PEDIDOS Y VENTAS
-- ============================================

-- Tabla de pedidos
CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    id_usuario INT NOT NULL,
    id_direccion_envio INT NOT NULL,
    
    -- Información de contacto
    email_contacto VARCHAR(255) NOT NULL,
    telefono_contacto VARCHAR(20) NOT NULL,
    
    -- Montos
    subtotal DECIMAL(12, 2) NOT NULL,
    descuento DECIMAL(12, 2) DEFAULT 0.00,
    costo_envio DECIMAL(12, 2) DEFAULT 0.00,
    impuestos DECIMAL(12, 2) DEFAULT 0.00,
    total DECIMAL(12, 2) NOT NULL,
    
    -- Estado y seguimiento
    estado ENUM('pendiente', 'confirmado', 'procesando', 'enviado', 'entregado', 'cancelado', 'devuelto') DEFAULT 'pendiente',
    metodo_pago ENUM('efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'pse', 'contraentrega') NOT NULL,
    estado_pago ENUM('pendiente', 'pagado', 'fallido', 'reembolsado') DEFAULT 'pendiente',
    
    -- Información de envío
    empresa_envio VARCHAR(100),
    numero_guia VARCHAR(100),
    fecha_estimada_entrega DATE,
    
    -- Notas
    notas_cliente TEXT,
    notas_admin TEXT,
    
    -- Fechas
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion TIMESTAMP NULL,
    fecha_envio TIMESTAMP NULL,
    fecha_entrega TIMESTAMP NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_direccion_envio) REFERENCES direcciones(id_direccion),
    INDEX idx_usuario (id_usuario),
    INDEX idx_numero_pedido (numero_pedido),
    INDEX idx_estado (estado),
    INDEX idx_fecha_pedido (fecha_pedido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de items de pedidos
CREATE TABLE pedido_items (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    descuento DECIMAL(12, 2) DEFAULT 0.00,
    total DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
    INDEX idx_pedido (id_pedido),
    INDEX idx_producto (id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de historial de estados de pedidos
CREATE TABLE pedido_historial (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    comentario TEXT,
    id_usuario_cambio INT,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario_cambio) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_pedido (id_pedido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE RESEÑAS Y CALIFICACIONES
-- ============================================

-- Tabla de reseñas de productos
CREATE TABLE resenas (
    id_resena INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    id_usuario INT NOT NULL,
    id_pedido INT,
    calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    titulo VARCHAR(255),
    comentario TEXT,
    verificado BOOLEAN DEFAULT FALSE COMMENT 'Compra verificada',
    aprobado BOOLEAN DEFAULT FALSE,
    util_count INT DEFAULT 0 COMMENT 'Votos de utilidad',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE SET NULL,
    INDEX idx_producto (id_producto),
    INDEX idx_usuario (id_usuario),
    INDEX idx_calificacion (calificacion),
    INDEX idx_aprobado (aprobado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE SEDES Y UBICACIONES
-- ============================================

-- Tabla de sedes/tiendas físicas
CREATE TABLE sedes (
    id_sede INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(255),
    whatsapp VARCHAR(20),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    horario_atencion TEXT,
    servicios TEXT COMMENT 'Servicios disponibles en JSON',
    imagen_url VARCHAR(255),
    es_principal BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_apertura DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ciudad (ciudad),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de inventario por sede
CREATE TABLE sede_inventario (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    id_sede INT NOT NULL,
    id_producto INT NOT NULL,
    stock INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    ubicacion_fisica VARCHAR(100),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sede) REFERENCES sedes(id_sede) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    UNIQUE KEY unique_sede_producto (id_sede, id_producto),
    INDEX idx_sede (id_sede),
    INDEX idx_producto (id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE PROMOCIONES Y DESCUENTOS
-- ============================================

-- Tabla de cupones de descuento
CREATE TABLE cupones (
    id_cupon INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    tipo_descuento ENUM('porcentaje', 'monto_fijo') NOT NULL,
    valor_descuento DECIMAL(12, 2) NOT NULL,
    monto_minimo_compra DECIMAL(12, 2) DEFAULT 0.00,
    usos_maximos INT,
    usos_por_usuario INT DEFAULT 1,
    usos_actuales INT DEFAULT 0,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_activo (activo),
    INDEX idx_fechas (fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de uso de cupones
CREATE TABLE cupon_usos (
    id_uso INT AUTO_INCREMENT PRIMARY KEY,
    id_cupon INT NOT NULL,
    id_usuario INT NOT NULL,
    id_pedido INT NOT NULL,
    monto_descuento DECIMAL(12, 2) NOT NULL,
    fecha_uso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cupon) REFERENCES cupones(id_cupon) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    INDEX idx_cupon (id_cupon),
    INDEX idx_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE CONTENIDO Y MARKETING
-- ============================================

-- Tabla de banners/sliders
CREATE TABLE banners (
    id_banner INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    subtitulo VARCHAR(255),
    descripcion TEXT,
    imagen_url VARCHAR(255) NOT NULL,
    imagen_mobile_url VARCHAR(255),
    enlace_url VARCHAR(255),
    texto_boton VARCHAR(50),
    posicion ENUM('hero', 'sidebar', 'footer', 'popup') DEFAULT 'hero',
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_posicion (posicion),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de newsletter/suscriptores
CREATE TABLE newsletter (
    id_suscriptor INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_baja TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE CONFIGURACIÓN Y SISTEMA
-- ============================================

-- Tabla de configuración general
CREATE TABLE configuracion (
    id_config INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    descripcion TEXT,
    grupo VARCHAR(50),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clave (clave),
    INDEX idx_grupo (grupo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de logs de actividad
CREATE TABLE logs_actividad (
    id_log BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(100),
    id_registro INT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_usuario (id_usuario),
    INDEX idx_accion (accion),
    INDEX idx_fecha (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar categorías principales
INSERT INTO categorias (nombre, slug, descripcion, icono, orden) VALUES
('Electro Hogar', 'electro-hogar', 'Electrodomésticos para el hogar', 'zap', 1),
('Muebles y Organización', 'muebles', 'Muebles y soluciones de organización', 'home', 2),
('Motos', 'motos', 'Motocicletas urbanas y deportivas', 'bike', 3),
('Herramientas STIHL', 'herramientas', 'Herramientas profesionales para jardín', 'wrench', 4);

-- Insertar subcategorías
INSERT INTO subcategorias (id_categoria, nombre, slug) VALUES
(1, 'Lavadoras', 'lavadoras'),
(1, 'Neveras', 'neveras'),
(1, 'Estufas', 'estufas'),
(1, 'Televisores', 'televisores'),
(2, 'Escritorios', 'escritorios'),
(2, 'Sillas', 'sillas'),
(2, 'Estanterías', 'estanterias'),
(3, 'Motos Urbanas', 'motos-urbanas'),
(3, 'Motos Deportivas', 'motos-deportivas'),
(4, 'Motosierras', 'motosierras'),
(4, 'Guadañas', 'guadanas');

-- Insertar marcas
INSERT INTO marcas (nombre) VALUES
('Honda'),
('Kalley'),
('Haceb'),
('Samsung'),
('LG'),
('Rimax'),
('STIHL'),
('Yamaha'),
('Mabe'),
('Whirlpool'),
('Oster'),
('Sony');

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor, tipo, descripcion, grupo) VALUES
('sitio_nombre', 'Ceveco', 'string', 'Nombre del sitio web', 'general'),
('sitio_email', 'contacto@ceveco.com.co', 'string', 'Email de contacto', 'general'),
('sitio_telefono', '+57 (606) 859 1234', 'string', 'Teléfono principal', 'general'),
('sitio_whatsapp', '+573001234567', 'string', 'WhatsApp de contacto', 'general'),
('envio_gratis_minimo', '500000', 'number', 'Monto mínimo para envío gratis', 'envios'),
('iva_porcentaje', '19', 'number', 'Porcentaje de IVA', 'impuestos'),
('moneda', 'COP', 'string', 'Moneda del sitio', 'general'),
('productos_por_pagina', '12', 'number', 'Productos por página', 'catalogo');

-- Insertar sede principal
INSERT INTO sedes (nombre, codigo, departamento, ciudad, direccion, telefono, celular, email, whatsapp, es_principal, activo) VALUES
('Ceveco Riosucio', 'RS001', 'Caldas', 'Riosucio', 'Carrera 5 # 9-45', '(606) 859 1234', '+573001234567', 'riosucio@ceveco.com.co', '+573001234567', TRUE, TRUE);

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de productos con información completa
CREATE VIEW vista_productos_completa AS
SELECT 
    p.id_producto,
    p.sku,
    p.nombre,
    p.descripcion_corta,
    p.precio_actual,
    p.precio_anterior,
    p.stock,
    p.badge,
    p.destacado,
    p.calificacion_promedio,
    p.total_resenas,
    c.nombre AS categoria,
    c.slug AS categoria_slug,
    sc.nombre AS subcategoria,
    m.nombre AS marca,
    (SELECT url_imagen FROM producto_imagenes WHERE id_producto = p.id_producto AND es_principal = TRUE LIMIT 1) AS imagen_principal
FROM productos p
INNER JOIN categorias c ON p.id_categoria = c.id_categoria
LEFT JOIN subcategorias sc ON p.id_subcategoria = sc.id_subcategoria
INNER JOIN marcas m ON p.id_marca = m.id_marca
WHERE p.activo = TRUE;

-- Vista de pedidos con información de usuario
CREATE VIEW vista_pedidos_completa AS
SELECT 
    p.id_pedido,
    p.numero_pedido,
    p.total,
    p.estado,
    p.estado_pago,
    p.metodo_pago,
    p.fecha_pedido,
    u.nombre AS usuario_nombre,
    u.apellido AS usuario_apellido,
    u.email AS usuario_email,
    u.celular AS usuario_celular,
    d.ciudad AS ciudad_envio,
    d.direccion_linea1 AS direccion_envio
FROM pedidos p
INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
INNER JOIN direcciones d ON p.id_direccion_envio = d.id_direccion;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS
-- ============================================

DELIMITER //

-- Procedimiento para actualizar calificación promedio de producto
CREATE PROCEDURE actualizar_calificacion_producto(IN p_id_producto INT)
BEGIN
    UPDATE productos 
    SET 
        calificacion_promedio = (
            SELECT COALESCE(AVG(calificacion), 0) 
            FROM resenas 
            WHERE id_producto = p_id_producto AND aprobado = TRUE
        ),
        total_resenas = (
            SELECT COUNT(*) 
            FROM resenas 
            WHERE id_producto = p_id_producto AND aprobado = TRUE
        )
    WHERE id_producto = p_id_producto;
END //

-- Procedimiento para generar número de pedido único
CREATE PROCEDURE generar_numero_pedido(OUT p_numero_pedido VARCHAR(50))
BEGIN
    DECLARE v_fecha VARCHAR(8);
    DECLARE v_contador INT;
    
    SET v_fecha = DATE_FORMAT(NOW(), '%Y%m%d');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_pedido, 10) AS UNSIGNED)), 0) + 1
    INTO v_contador
    FROM pedidos
    WHERE numero_pedido LIKE CONCAT('PED', v_fecha, '%');
    
    SET p_numero_pedido = CONCAT('PED', v_fecha, LPAD(v_contador, 4, '0'));
END //

DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER //

-- Trigger para actualizar stock después de crear un pedido
CREATE TRIGGER after_pedido_item_insert
AFTER INSERT ON pedido_items
FOR EACH ROW
BEGIN
    UPDATE productos 
    SET stock = stock - NEW.cantidad,
        ventas_totales = ventas_totales + NEW.cantidad
    WHERE id_producto = NEW.id_producto;
END //

-- Trigger para registrar cambios de estado en pedidos
CREATE TRIGGER after_pedido_estado_update
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO pedido_historial (id_pedido, estado_anterior, estado_nuevo)
        VALUES (NEW.id_pedido, OLD.estado, NEW.estado);
    END IF;
END //

-- Trigger para actualizar calificación después de aprobar reseña
CREATE TRIGGER after_resena_aprobada
AFTER UPDATE ON resenas
FOR EACH ROW
BEGIN
    IF OLD.aprobado = FALSE AND NEW.aprobado = TRUE THEN
        CALL actualizar_calificacion_producto(NEW.id_producto);
    END IF;
END //

DELIMITER ;

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para búsquedas y filtros comunes
CREATE INDEX idx_productos_precio_categoria ON productos(id_categoria, precio_actual);
CREATE INDEX idx_productos_destacado_activo ON productos(destacado, activo);
CREATE INDEX idx_pedidos_usuario_fecha ON pedidos(id_usuario, fecha_pedido);
CREATE INDEX idx_resenas_producto_aprobado ON resenas(id_producto, aprobado);

-- ============================================
-- COMENTARIOS FINALES
-- ============================================

/*
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
- Procedimientos almacenados para operaciones comunes
*/
