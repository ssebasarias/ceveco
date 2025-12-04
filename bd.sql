-- ============================================
-- BASE DE DATOS CEVECO E-COMMERCE
-- Sistema de gestión para tienda de electrodomésticos,
-- muebles, motos y herramientas
-- Compatible con PostgreSQL 17
-- ============================================

-- Crear base de datos
-- Ejecutar como superusuario o con permisos CREATE DATABASE
-- CREATE DATABASE ceveco_db
--     WITH 
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'es_CO.UTF-8'
--     LC_CTYPE = 'es_CO.UTF-8'
--     TEMPLATE = template0;

-- Conectar a la base de datos
-- \c ceveco_db;

-- ============================================
-- TIPOS ENUMERADOS PERSONALIZADOS
-- ============================================

CREATE TYPE tipo_documento_enum AS ENUM ('CC', 'CE', 'NIT', 'Pasaporte');
CREATE TYPE genero_enum AS ENUM ('M', 'F', 'Otro', 'Prefiero no decir');
CREATE TYPE rol_usuario_enum AS ENUM ('cliente', 'vendedor', 'admin');
CREATE TYPE tipo_direccion_enum AS ENUM ('casa', 'trabajo', 'otro');
CREATE TYPE estado_pedido_enum AS ENUM ('pendiente', 'confirmado', 'procesando', 'enviado', 'entregado', 'cancelado', 'devuelto');
CREATE TYPE metodo_pago_enum AS ENUM ('efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'pse', 'contraentrega');
CREATE TYPE estado_pago_enum AS ENUM ('pendiente', 'pagado', 'fallido', 'reembolsado');
CREATE TYPE tipo_descuento_enum AS ENUM ('porcentaje', 'monto_fijo');
CREATE TYPE posicion_banner_enum AS ENUM ('hero', 'sidebar', 'footer', 'popup');
CREATE TYPE tipo_config_enum AS ENUM ('string', 'number', 'boolean', 'json');

-- ============================================
-- TABLAS DE CATÁLOGO Y PRODUCTOS
-- ============================================

-- Tabla de categorías principales
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url VARCHAR(255),
    icono VARCHAR(50),
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categorias_slug ON categorias(slug);
CREATE INDEX idx_categorias_activo ON categorias(activo);

-- Tabla de subcategorías
CREATE TABLE subcategorias (
    id_subcategoria SERIAL PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE CASCADE,
    UNIQUE (id_categoria, slug)
);

CREATE INDEX idx_subcategorias_categoria ON subcategorias(id_categoria);
CREATE INDEX idx_subcategorias_slug ON subcategorias(slug);

-- Tabla de marcas
CREATE TABLE marcas (
    id_marca SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(255),
    descripcion TEXT,
    sitio_web VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_marcas_nombre ON marcas(nombre);

-- Tabla de productos
CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    id_categoria INT NOT NULL,
    id_subcategoria INT,
    id_marca INT NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion_corta TEXT,
    descripcion_larga TEXT,
    precio_actual NUMERIC(12, 2) NOT NULL,
    precio_anterior NUMERIC(12, 2),
    precio_promocional NUMERIC(12, 2),
    costo NUMERIC(12, 2),
    referencia_proveedor VARCHAR(100),
    stock INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    garantia_meses INT DEFAULT 12,
    badge VARCHAR(50), -- Nuevo, Oferta, Destacado, etc.
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    vistas INT DEFAULT 0,
    ventas_totales INT DEFAULT 0,
    calificacion_promedio NUMERIC(3, 2) DEFAULT 0.00,
    total_resenas INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_subcategoria) REFERENCES subcategorias(id_subcategoria) ON DELETE SET NULL,
    FOREIGN KEY (id_marca) REFERENCES marcas(id_marca)
);

CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_productos_marca ON productos(id_marca);
CREATE INDEX idx_productos_precio ON productos(precio_actual);
CREATE INDEX idx_productos_destacado ON productos(destacado);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_sku ON productos(sku);
CREATE INDEX idx_productos_ref_proveedor ON productos(referencia_proveedor) WHERE referencia_proveedor IS NOT NULL;

-- Índice de búsqueda de texto completo
CREATE INDEX idx_productos_busqueda ON productos USING GIN(to_tsvector('spanish', nombre || ' ' || COALESCE(descripcion_corta, '')));

-- Tabla de imágenes de productos
CREATE TABLE producto_imagenes (
    id_imagen SERIAL PRIMARY KEY,
    id_producto INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    orden INT DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);

CREATE INDEX idx_producto_imagenes_producto ON producto_imagenes(id_producto);
CREATE INDEX idx_producto_imagenes_principal ON producto_imagenes(es_principal);

-- Tabla de especificaciones técnicas
-- Tabla de definición de atributos (Nueva estructura flexible)
CREATE TABLE atributos (
    id_atributo SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,      -- Ej: "Potencia", "Peso", "Color", "Resolución"
    unidad VARCHAR(50),                -- Ej: "W", "Kg", "Pulgadas"
    tipo_dato VARCHAR(50) DEFAULT 'texto',  -- texto, numero, booleano
    id_categoria INT,  -- opcional: atributo solo para esta categoría
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL
);

CREATE INDEX idx_atributos_categoria ON atributos(id_categoria);

-- Tabla de valores de atributos por producto
CREATE TABLE producto_atributos (
    id_producto_atributo SERIAL PRIMARY KEY,
    id_producto INT NOT NULL,
    id_atributo INT NOT NULL,
    valor_texto TEXT,
    valor_numero NUMERIC(12,2),
    valor_booleano BOOLEAN,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    FOREIGN KEY (id_atributo) REFERENCES atributos(id_atributo) ON DELETE CASCADE,
    UNIQUE (id_producto, id_atributo)
);

CREATE INDEX idx_producto_atributos_producto ON producto_atributos(id_producto);
CREATE INDEX idx_producto_atributos_atributo ON producto_atributos(id_atributo);

-- ============================================
-- TABLAS DE USUARIOS Y AUTENTICACIÓN
-- ============================================

-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    celular VARCHAR(20),
    tipo_documento tipo_documento_enum DEFAULT 'CC',
    numero_documento VARCHAR(50) UNIQUE,
    fecha_nacimiento DATE,
    genero genero_enum,
    avatar_url VARCHAR(255),
    rol rol_usuario_enum DEFAULT 'cliente',
    activo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(255),
    token_recuperacion VARCHAR(255),
    fecha_ultimo_acceso TIMESTAMP NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_documento ON usuarios(numero_documento);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Tabla de direcciones de usuarios
CREATE TABLE direcciones (
    id_direccion SERIAL PRIMARY KEY,
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
    tipo tipo_direccion_enum DEFAULT 'casa',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE INDEX idx_direcciones_usuario ON direcciones(id_usuario);
CREATE INDEX idx_direcciones_principal ON direcciones(es_principal);

-- ============================================
-- TABLAS DE CARRITO Y FAVORITOS
-- ============================================

-- Tabla de carrito de compras
CREATE TABLE carrito (
    id_carrito SERIAL PRIMARY KEY,
    id_usuario INT,
    session_id VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE INDEX idx_carrito_usuario ON carrito(id_usuario);
CREATE INDEX idx_carrito_session ON carrito(session_id);

-- Tabla de items del carrito
CREATE TABLE carrito_items (
    id_item SERIAL PRIMARY KEY,
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(12, 2) NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_carrito) REFERENCES carrito(id_carrito) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    UNIQUE (id_carrito, id_producto)
);

CREATE INDEX idx_carrito_items_carrito ON carrito_items(id_carrito);
CREATE INDEX idx_carrito_items_producto ON carrito_items(id_producto);

-- Tabla de productos favoritos/wishlist
CREATE TABLE favoritos (
    id_favorito SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    UNIQUE (id_usuario, id_producto)
);

CREATE INDEX idx_favoritos_usuario ON favoritos(id_usuario);

-- ============================================
-- TABLAS DE PEDIDOS Y VENTAS
-- ============================================

-- Tabla de pedidos
CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    id_usuario INT NOT NULL,
    id_direccion_envio INT NOT NULL,
    
    -- Información de contacto
    email_contacto VARCHAR(255) NOT NULL,
    telefono_contacto VARCHAR(20) NOT NULL,
    
    -- Montos
    subtotal NUMERIC(12, 2) NOT NULL,
    descuento NUMERIC(12, 2) DEFAULT 0.00,
    costo_envio NUMERIC(12, 2) DEFAULT 0.00,
    impuestos NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    
    -- Estado y seguimiento
    estado estado_pedido_enum DEFAULT 'pendiente',
    metodo_pago metodo_pago_enum NOT NULL,
    estado_pago estado_pago_enum DEFAULT 'pendiente',
    
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
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_direccion_envio) REFERENCES direcciones(id_direccion)
);

CREATE INDEX idx_pedidos_usuario ON pedidos(id_usuario);
CREATE INDEX idx_pedidos_numero_pedido ON pedidos(numero_pedido);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha_pedido ON pedidos(fecha_pedido);

-- Tabla de items de pedidos
CREATE TABLE pedido_items (
    id_item SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    descuento NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

CREATE INDEX idx_pedido_items_pedido ON pedido_items(id_pedido);
CREATE INDEX idx_pedido_items_producto ON pedido_items(id_producto);

-- Tabla de historial de estados de pedidos
CREATE TABLE pedido_historial (
    id_historial SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    comentario TEXT,
    id_usuario_cambio INT,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario_cambio) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

CREATE INDEX idx_pedido_historial_pedido ON pedido_historial(id_pedido);

-- ============================================
-- TABLAS DE RESEÑAS Y CALIFICACIONES
-- ============================================

-- Tabla de reseñas de productos
CREATE TABLE resenas (
    id_resena SERIAL PRIMARY KEY,
    id_producto INT NOT NULL,
    id_usuario INT NOT NULL,
    id_pedido INT,
    calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    titulo VARCHAR(255),
    comentario TEXT,
    verificado BOOLEAN DEFAULT FALSE, -- Compra verificada
    aprobado BOOLEAN DEFAULT FALSE,
    util_count INT DEFAULT 0, -- Votos de utilidad
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE SET NULL
);

CREATE INDEX idx_resenas_producto ON resenas(id_producto);
CREATE INDEX idx_resenas_usuario ON resenas(id_usuario);
CREATE INDEX idx_resenas_calificacion ON resenas(calificacion);
CREATE INDEX idx_resenas_aprobado ON resenas(aprobado);

-- ============================================
-- TABLAS DE SEDES Y UBICACIONES
-- ============================================

-- Tabla de sedes/tiendas físicas
CREATE TABLE sedes (
    id_sede SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(255),
    whatsapp VARCHAR(20),
    latitud NUMERIC(10, 8),
    longitud NUMERIC(11, 8),
    horario_atencion TEXT,
    servicios TEXT, -- Servicios disponibles en JSON
    imagen_url VARCHAR(255),
    es_principal BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_apertura DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sedes_ciudad ON sedes(ciudad);
CREATE INDEX idx_sedes_activo ON sedes(activo);

-- Tabla de inventario por sede
CREATE TABLE sede_inventario (
    id_inventario SERIAL PRIMARY KEY,
    id_sede INT NOT NULL,
    id_producto INT NOT NULL,
    stock INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    ubicacion_fisica VARCHAR(100),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sede) REFERENCES sedes(id_sede) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    UNIQUE (id_sede, id_producto)
);

CREATE INDEX idx_sede_inventario_sede ON sede_inventario(id_sede);
CREATE INDEX idx_sede_inventario_producto ON sede_inventario(id_producto);

-- ============================================
-- TABLAS DE PROMOCIONES Y DESCUENTOS
-- ============================================

-- Tabla de cupones de descuento
CREATE TABLE cupones (
    id_cupon SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    tipo_descuento tipo_descuento_enum NOT NULL,
    valor_descuento NUMERIC(12, 2) NOT NULL,
    monto_minimo_compra NUMERIC(12, 2) DEFAULT 0.00,
    usos_maximos INT,
    usos_por_usuario INT DEFAULT 1,
    usos_actuales INT DEFAULT 0,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cupones_codigo ON cupones(codigo);
CREATE INDEX idx_cupones_activo ON cupones(activo);
CREATE INDEX idx_cupones_fechas ON cupones(fecha_inicio, fecha_fin);

-- Tabla de uso de cupones
CREATE TABLE cupon_usos (
    id_uso SERIAL PRIMARY KEY,
    id_cupon INT NOT NULL,
    id_usuario INT NOT NULL,
    id_pedido INT NOT NULL,
    monto_descuento NUMERIC(12, 2) NOT NULL,
    fecha_uso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cupon) REFERENCES cupones(id_cupon) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE
);

CREATE INDEX idx_cupon_usos_cupon ON cupon_usos(id_cupon);
CREATE INDEX idx_cupon_usos_usuario ON cupon_usos(id_usuario);

-- ============================================
-- TABLAS DE CONTENIDO Y MARKETING
-- ============================================

-- Tabla de banners/sliders
CREATE TABLE banners (
    id_banner SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    subtitulo VARCHAR(255),
    descripcion TEXT,
    imagen_url VARCHAR(255) NOT NULL,
    imagen_mobile_url VARCHAR(255),
    enlace_url VARCHAR(255),
    texto_boton VARCHAR(50),
    posicion posicion_banner_enum DEFAULT 'hero',
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_banners_posicion ON banners(posicion);
CREATE INDEX idx_banners_activo ON banners(activo);

-- Tabla de newsletter/suscriptores
CREATE TABLE newsletter (
    id_suscriptor SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_baja TIMESTAMP NULL
);

CREATE INDEX idx_newsletter_email ON newsletter(email);
CREATE INDEX idx_newsletter_activo ON newsletter(activo);

-- ============================================
-- TABLAS DE CONFIGURACIÓN Y SISTEMA
-- ============================================

-- Tabla de configuración general
CREATE TABLE configuracion (
    id_config SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo tipo_config_enum DEFAULT 'string',
    descripcion TEXT,
    grupo VARCHAR(50),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_configuracion_clave ON configuracion(clave);
CREATE INDEX idx_configuracion_grupo ON configuracion(grupo);

-- Tabla de logs de actividad
CREATE TABLE logs_actividad (
    id_log BIGSERIAL PRIMARY KEY,
    id_usuario INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(100),
    id_registro INT,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

CREATE INDEX idx_logs_actividad_usuario ON logs_actividad(id_usuario);
CREATE INDEX idx_logs_actividad_accion ON logs_actividad(accion);
CREATE INDEX idx_logs_actividad_fecha ON logs_actividad(fecha_creacion);

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
-- Electro Hogar (19 subcategorías)
(1, 'Lavadoras', 'lavadoras'),
(1, 'Neveras', 'neveras'),
(1, 'Estufas', 'estufas'),
(1, 'Televisores', 'televisores'),
(1, 'Microondas', 'microondas'),
(1, 'Licuadoras', 'licuadoras'),
(1, 'Cafeteras', 'cafeteras'),
(1, 'Aires Acondicionados', 'aires-acondicionados'),
(1, 'Ventiladores', 'ventiladores'),
(1, 'Calentadores', 'calentadores'),
(1, 'Planchas', 'planchas'),
(1, 'Aspiradoras', 'aspiradoras'),
(1, 'Secadoras', 'secadoras'),
(1, 'Hornos', 'hornos'),
(1, 'Campanas', 'campanas'),
(1, 'Congeladores', 'congeladores'),
(1, 'Equipos de Sonido', 'equipos-sonido'),
(1, 'Barras de Sonido', 'barras-sonido'),
(1, 'Teatros en Casa', 'teatros-casa'),
-- Muebles y Organización (14 subcategorías)
(2, 'Escritorios', 'escritorios'),
(2, 'Sillas', 'sillas'),
(2, 'Estanterías', 'estanterias'),
(2, 'Mesas', 'mesas'),
(2, 'Camas', 'camas'),
(2, 'Closets', 'closets'),
(2, 'Comedores', 'comedores'),
(2, 'Salas', 'salas'),
(2, 'Bibliotecas', 'bibliotecas'),
(2, 'Organizadores', 'organizadores'),
(2, 'Muebles de Cocina', 'muebles-cocina'),
(2, 'Muebles de Baño', 'muebles-bano'),
(2, 'Colchones', 'colchones'),
(2, 'Bases de Cama', 'bases-cama'),
-- Motos (8 subcategorías)
(3, 'Motos Urbanas', 'motos-urbanas'),
(3, 'Motos Deportivas', 'motos-deportivas'),
(3, 'Motos de Trabajo', 'motos-trabajo'),
(3, 'Motos Scooter', 'motos-scooter'),
(3, 'Motos Enduro', 'motos-enduro'),
(3, 'Accesorios para Motos', 'accesorios-motos'),
(3, 'Cascos', 'cascos'),
(3, 'Repuestos', 'repuestos'),
-- Herramientas STIHL (8 subcategorías)
(4, 'Motosierras', 'motosierras'),
(4, 'Guadañas', 'guadanas'),
(4, 'Sopladores', 'sopladores'),
(4, 'Cortasetos', 'cortasetos'),
(4, 'Podadoras', 'podadoras'),
(4, 'Fumigadoras', 'fumigadoras'),
(4, 'Accesorios STIHL', 'accesorios-stihl'),
(4, 'Repuestos STIHL', 'repuestos-stihl');

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
('Sony'),
('TCL'),
('Samurai'),
('Comodisimos'),
('Profilan'),
('Durespo');

-- Insertar atributos comunes y específicos
INSERT INTO atributos (nombre, unidad, tipo_dato, id_categoria) VALUES
-- Generales (NULL en id_categoria para que apliquen a todos)
('Marca', NULL, 'texto', NULL),
('Modelo', NULL, 'texto', NULL),
('Color', NULL, 'texto', NULL),
('Material', NULL, 'texto', NULL),
('Peso', 'Kg', 'numero', NULL),
('Alto', 'cm', 'numero', NULL),
('Ancho', 'cm', 'numero', NULL),
('Profundo', 'cm', 'numero', NULL),
('Garantía', 'Meses', 'numero', NULL),

-- Electro Hogar (id_categoria = 1)
('Voltaje', 'V', 'texto', 1),
('Potencia', 'W', 'numero', 1),
('Eficiencia Energética', NULL, 'texto', 1),
('Capacidad', 'Litros', 'numero', 1), -- Neveras
('Capacidad de Carga', 'Kg', 'numero', 1), -- Lavadoras
('Tipo de Pantalla', NULL, 'texto', 1), -- TV
('Resolución', 'Pixeles', 'texto', 1), -- TV
('Tamaño de Pantalla', 'Pulgadas', 'numero', 1), -- TV
('Smart TV', NULL, 'booleano', 1), -- TV
('Tecnología de Frío', NULL, 'texto', 1), -- Neveras (No Frost, etc)
('Puertos HDMI', 'Cantidad', 'numero', 1), -- TV
('Puertos USB', 'Cantidad', 'numero', 1), -- TV
('Sistema Operativo', NULL, 'texto', 1), -- TV/Celulares
('Asistente de Voz', NULL, 'booleano', 1), -- TV
('Dispensador de Agua', NULL, 'booleano', 1), -- Neveras
('Fabricador de Hielo', NULL, 'booleano', 1), -- Neveras
('Tipo de Refrigeración', NULL, 'texto', 1), -- Neveras (Frio directo, No Frost)
('Tecnología Inverter', NULL, 'booleano', 1), -- Aires/Neveras/Lavadoras
('Ciclos de Lavado', 'Cantidad', 'numero', 1), -- Lavadoras

-- Muebles (id_categoria = 2)
('Tipo de Madera', NULL, 'texto', 2),
('Tipo de Tela', NULL, 'texto', 2),
('Requiere Armado', NULL, 'booleano', 2),
('Número de Puestos', NULL, 'numero', 2),
('Estilo', NULL, 'texto', 2),

-- Motos (id_categoria = 3)
('Cilindraje', 'cc', 'numero', 3),
('Tipo de Motor', NULL, 'texto', 3),
('Potencia Máxima', 'HP', 'texto', 3),
('Torque Máximo', 'Nm', 'texto', 3),
('Arranque', NULL, 'texto', 3), -- Eléctrico/Pedal
('Capacidad Tanque', 'Galones', 'numero', 3),
('Freno Delantero', NULL, 'texto', 3),
('Freno Trasero', NULL, 'texto', 3),
('Transmisión', NULL, 'texto', 3),

-- Herramientas (id_categoria = 4)
('Potencia Motor', 'HP', 'numero', 4),
('Longitud de Espada', 'cm', 'numero', 4), -- Motosierras
('Paso de Cadena', 'Pulgadas', 'texto', 4),
('Peso sin Combustible', 'Kg', 'numero', 4),
('Cilindrada', 'cm³', 'numero', 4);

-- Insertar producto de ejemplo con sus atributos
INSERT INTO productos (
    sku, referencia_proveedor, nombre, descripcion_larga, id_categoria, id_subcategoria, id_marca, 
    precio_actual, precio_anterior, precio_promocional, stock, activo
) VALUES (
    'CEV-TV-001', '50UA8050', 'TV LG 50" Smart TV 4K', 
    'TV LED 50" Smart Tv Ultra UHD 4K HDR10 PRO con procesador inteligente y sonido envolvente.',
    1, 4, 5, 2250000, 2500000, 2050000, 10, TRUE
);

-- Asignar atributos al producto de ejemplo (Asumiendo ID 1 para el producto y IDs secuenciales para atributos)
-- Nota: En un script real se buscarían los IDs, aquí usamos valores fijos basados en el orden de inserción
INSERT INTO producto_atributos (id_producto, id_atributo, valor_texto, valor_numero, valor_booleano) VALUES
((SELECT id_producto FROM productos WHERE sku = 'CEV-TV-001'), (SELECT id_atributo FROM atributos WHERE nombre = 'Color'), 'Negro', NULL, NULL),
((SELECT id_producto FROM productos WHERE sku = 'CEV-TV-001'), (SELECT id_atributo FROM atributos WHERE nombre = 'Resolución'), '4K UHD', NULL, NULL),
((SELECT id_producto FROM productos WHERE sku = 'CEV-TV-001'), (SELECT id_atributo FROM atributos WHERE nombre = 'Tamaño de Pantalla'), NULL, 50, NULL),
((SELECT id_producto FROM productos WHERE sku = 'CEV-TV-001'), (SELECT id_atributo FROM atributos WHERE nombre = 'Smart TV'), NULL, NULL, TRUE),
((SELECT id_producto FROM productos WHERE sku = 'CEV-TV-001'), (SELECT id_atributo FROM atributos WHERE nombre = 'Garantía'), NULL, 12, NULL);

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
    p.referencia_proveedor,
    p.nombre,
    p.descripcion_corta,
    p.precio_actual,
    p.precio_anterior,
    p.precio_promocional,
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
-- FUNCIONES Y PROCEDIMIENTOS ALMACENADOS
-- ============================================

-- Función para actualizar fecha de actualización automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de actualización a tablas relevantes
CREATE TRIGGER trigger_actualizar_categorias
    BEFORE UPDATE ON categorias
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_productos
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_carrito
    BEFORE UPDATE ON carrito
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_pedidos
    BEFORE UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_resenas
    BEFORE UPDATE ON resenas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_configuracion
    BEFORE UPDATE ON configuracion
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_sede_inventario
    BEFORE UPDATE ON sede_inventario
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Procedimiento para actualizar calificación promedio de producto
CREATE OR REPLACE FUNCTION actualizar_calificacion_producto(p_id_producto INT)
RETURNS VOID AS $$
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
END;
$$ LANGUAGE plpgsql;

-- Función para generar número de pedido único
CREATE OR REPLACE FUNCTION generar_numero_pedido()
RETURNS VARCHAR(50) AS $$
DECLARE
    v_fecha VARCHAR(8);
    v_contador INT;
    v_numero_pedido VARCHAR(50);
BEGIN
    v_fecha := TO_CHAR(NOW(), 'YYYYMMDD');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_pedido FROM 12) AS INTEGER)), 0) + 1
    INTO v_contador
    FROM pedidos
    WHERE numero_pedido LIKE 'PED' || v_fecha || '%';
    
    v_numero_pedido := 'PED' || v_fecha || LPAD(v_contador::TEXT, 4, '0');
    
    RETURN v_numero_pedido;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para actualizar stock después de crear un pedido
CREATE OR REPLACE FUNCTION after_pedido_item_insert()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos 
    SET stock = stock - NEW.cantidad,
        ventas_totales = ventas_totales + NEW.cantidad
    WHERE id_producto = NEW.id_producto;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_after_pedido_item_insert
    AFTER INSERT ON pedido_items
    FOR EACH ROW
    EXECUTE FUNCTION after_pedido_item_insert();

-- Trigger para registrar cambios de estado en pedidos
CREATE OR REPLACE FUNCTION after_pedido_estado_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO pedido_historial (id_pedido, estado_anterior, estado_nuevo)
        VALUES (NEW.id_pedido, OLD.estado::VARCHAR, NEW.estado::VARCHAR);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_after_pedido_estado_update
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION after_pedido_estado_update();

-- Trigger para actualizar calificación después de aprobar reseña
CREATE OR REPLACE FUNCTION after_resena_aprobada()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.aprobado = FALSE AND NEW.aprobado = TRUE THEN
        PERFORM actualizar_calificacion_producto(NEW.id_producto);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_after_resena_aprobada
    AFTER UPDATE ON resenas
    FOR EACH ROW
    EXECUTE FUNCTION after_resena_aprobada();

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para búsquedas y filtros comunes
CREATE INDEX idx_productos_precio_categoria ON productos(id_categoria, precio_actual);
CREATE INDEX idx_productos_destacado_activo ON productos(destacado, activo);
CREATE INDEX idx_pedidos_usuario_fecha ON pedidos(id_usuario, fecha_pedido);
CREATE INDEX idx_resenas_producto_aprobado ON resenas(id_producto, aprobado);

