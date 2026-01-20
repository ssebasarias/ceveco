--
-- PostgreSQL database dump
--

\restrict WS0OBAlVmpKtbryxN8IHUQcutGjY3JMtgsOOEFVuEKbaIinCnLAL3xhfyfZ3QjP

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_id_usuario_fkey;
ALTER TABLE IF EXISTS ONLY public.subcategorias DROP CONSTRAINT IF EXISTS subcategorias_id_categoria_fkey;
ALTER TABLE IF EXISTS ONLY public.sede_inventario DROP CONSTRAINT IF EXISTS sede_inventario_id_sede_fkey;
ALTER TABLE IF EXISTS ONLY public.sede_inventario DROP CONSTRAINT IF EXISTS sede_inventario_id_producto_fkey;
ALTER TABLE IF EXISTS ONLY public.resenas DROP CONSTRAINT IF EXISTS resenas_id_usuario_fkey;
ALTER TABLE IF EXISTS ONLY public.resenas DROP CONSTRAINT IF EXISTS resenas_id_producto_fkey;
ALTER TABLE IF EXISTS ONLY public.resenas DROP CONSTRAINT IF EXISTS resenas_id_pedido_fkey;
ALTER TABLE IF EXISTS ONLY public.productos DROP CONSTRAINT IF EXISTS productos_id_subcategoria_fkey;
ALTER TABLE IF EXISTS ONLY public.productos DROP CONSTRAINT IF EXISTS productos_id_marca_fkey;
ALTER TABLE IF EXISTS ONLY public.productos DROP CONSTRAINT IF EXISTS productos_id_categoria_fkey;
ALTER TABLE IF EXISTS ONLY public.producto_imagenes DROP CONSTRAINT IF EXISTS producto_imagenes_id_producto_fkey;
ALTER TABLE IF EXISTS ONLY public.producto_atributos DROP CONSTRAINT IF EXISTS producto_atributos_id_producto_fkey;
ALTER TABLE IF EXISTS ONLY public.producto_atributos DROP CONSTRAINT IF EXISTS producto_atributos_id_atributo_fkey;
ALTER TABLE IF EXISTS ONLY public.pedidos DROP CONSTRAINT IF EXISTS pedidos_id_usuario_fkey;
ALTER TABLE IF EXISTS ONLY public.pedidos DROP CONSTRAINT IF EXISTS pedidos_id_direccion_envio_fkey;
ALTER TABLE IF EXISTS ONLY public.pedido_items DROP CONSTRAINT IF EXISTS pedido_items_id_producto_fkey;
ALTER TABLE IF EXISTS ONLY public.pedido_items DROP CONSTRAINT IF EXISTS pedido_items_id_pedido_fkey;
ALTER TABLE IF EXISTS ONLY public.pedido_historial DROP CONSTRAINT IF EXISTS pedido_historial_id_usuario_cambio_fkey;
ALTER TABLE IF EXISTS ONLY public.pedido_historial DROP CONSTRAINT IF EXISTS pedido_historial_id_pedido_fkey;
ALTER TABLE IF EXISTS ONLY public.logs_actividad DROP CONSTRAINT IF EXISTS logs_actividad_id_usuario_fkey;
ALTER TABLE IF EXISTS ONLY public.favoritos DROP CONSTRAINT IF EXISTS favoritos_id_usuario_fkey;
ALTER TABLE IF EXISTS ONLY public.favoritos DROP CONSTRAINT IF EXISTS favoritos_id_producto_fkey;
ALTER TABLE IF EXISTS ONLY public.direcciones DROP CONSTRAINT IF EXISTS direcciones_id_usuario_fkey;
ALTER TABLE IF EXISTS ONLY public.cupon_usos DROP CONSTRAINT IF EXISTS cupon_usos_id_usuario_fkey;
ALTER TABLE IF EXISTS ONLY public.cupon_usos DROP CONSTRAINT IF EXISTS cupon_usos_id_pedido_fkey;
ALTER TABLE IF EXISTS ONLY public.cupon_usos DROP CONSTRAINT IF EXISTS cupon_usos_id_cupon_fkey;
ALTER TABLE IF EXISTS ONLY public.carrito_items DROP CONSTRAINT IF EXISTS carrito_items_id_producto_fkey;
ALTER TABLE IF EXISTS ONLY public.carrito_items DROP CONSTRAINT IF EXISTS carrito_items_id_carrito_fkey;
ALTER TABLE IF EXISTS ONLY public.carrito DROP CONSTRAINT IF EXISTS carrito_id_usuario_fkey;
ALTER TABLE IF EXISTS ONLY public.auth_providers DROP CONSTRAINT IF EXISTS auth_providers_id_usuario_fkey;
ALTER TABLE IF EXISTS ONLY public.atributos DROP CONSTRAINT IF EXISTS atributos_id_categoria_fkey;
DROP TRIGGER IF EXISTS trigger_after_resena_aprobada ON public.resenas;
DROP TRIGGER IF EXISTS trigger_after_pedido_item_insert ON public.pedido_items;
DROP TRIGGER IF EXISTS trigger_after_pedido_estado_update ON public.pedidos;
DROP TRIGGER IF EXISTS trigger_actualizar_usuarios ON public.usuarios;
DROP TRIGGER IF EXISTS trigger_actualizar_user_sessions ON public.user_sessions;
DROP TRIGGER IF EXISTS trigger_actualizar_sede_inventario ON public.sede_inventario;
DROP TRIGGER IF EXISTS trigger_actualizar_resenas ON public.resenas;
DROP TRIGGER IF EXISTS trigger_actualizar_productos ON public.productos;
DROP TRIGGER IF EXISTS trigger_actualizar_pedidos ON public.pedidos;
DROP TRIGGER IF EXISTS trigger_actualizar_configuracion ON public.configuracion;
DROP TRIGGER IF EXISTS trigger_actualizar_categorias ON public.categorias;
DROP TRIGGER IF EXISTS trigger_actualizar_carrito ON public.carrito;
DROP INDEX IF EXISTS public.idx_usuarios_rol;
DROP INDEX IF EXISTS public.idx_usuarios_email;
DROP INDEX IF EXISTS public.idx_usuarios_documento;
DROP INDEX IF EXISTS public.idx_user_sessions_usuario;
DROP INDEX IF EXISTS public.idx_user_sessions_token;
DROP INDEX IF EXISTS public.idx_user_sessions_activa;
DROP INDEX IF EXISTS public.idx_subcategorias_slug;
DROP INDEX IF EXISTS public.idx_subcategorias_categoria;
DROP INDEX IF EXISTS public.idx_sedes_ciudad;
DROP INDEX IF EXISTS public.idx_sedes_activo;
DROP INDEX IF EXISTS public.idx_sede_inventario_sede;
DROP INDEX IF EXISTS public.idx_sede_inventario_producto;
DROP INDEX IF EXISTS public.idx_resenas_usuario;
DROP INDEX IF EXISTS public.idx_resenas_producto_aprobado;
DROP INDEX IF EXISTS public.idx_resenas_producto;
DROP INDEX IF EXISTS public.idx_resenas_calificacion;
DROP INDEX IF EXISTS public.idx_resenas_aprobado;
DROP INDEX IF EXISTS public.idx_productos_sku;
DROP INDEX IF EXISTS public.idx_productos_ref_proveedor;
DROP INDEX IF EXISTS public.idx_productos_precio_categoria;
DROP INDEX IF EXISTS public.idx_productos_precio;
DROP INDEX IF EXISTS public.idx_productos_marca;
DROP INDEX IF EXISTS public.idx_productos_destacado_activo;
DROP INDEX IF EXISTS public.idx_productos_destacado;
DROP INDEX IF EXISTS public.idx_productos_categoria;
DROP INDEX IF EXISTS public.idx_productos_busqueda;
DROP INDEX IF EXISTS public.idx_productos_activo;
DROP INDEX IF EXISTS public.idx_producto_imagenes_producto;
DROP INDEX IF EXISTS public.idx_producto_imagenes_principal;
DROP INDEX IF EXISTS public.idx_producto_atributos_producto;
DROP INDEX IF EXISTS public.idx_producto_atributos_atributo;
DROP INDEX IF EXISTS public.idx_pedidos_usuario_fecha;
DROP INDEX IF EXISTS public.idx_pedidos_usuario;
DROP INDEX IF EXISTS public.idx_pedidos_numero_pedido;
DROP INDEX IF EXISTS public.idx_pedidos_fecha_pedido;
DROP INDEX IF EXISTS public.idx_pedidos_estado;
DROP INDEX IF EXISTS public.idx_pedido_items_producto;
DROP INDEX IF EXISTS public.idx_pedido_items_pedido;
DROP INDEX IF EXISTS public.idx_pedido_historial_pedido;
DROP INDEX IF EXISTS public.idx_newsletter_email;
DROP INDEX IF EXISTS public.idx_newsletter_activo;
DROP INDEX IF EXISTS public.idx_marcas_nombre;
DROP INDEX IF EXISTS public.idx_logs_actividad_usuario;
DROP INDEX IF EXISTS public.idx_logs_actividad_fecha;
DROP INDEX IF EXISTS public.idx_logs_actividad_accion;
DROP INDEX IF EXISTS public.idx_favoritos_usuario;
DROP INDEX IF EXISTS public.idx_direcciones_usuario;
DROP INDEX IF EXISTS public.idx_direcciones_principal;
DROP INDEX IF EXISTS public.idx_cupones_fechas;
DROP INDEX IF EXISTS public.idx_cupones_codigo;
DROP INDEX IF EXISTS public.idx_cupones_activo;
DROP INDEX IF EXISTS public.idx_cupon_usos_usuario;
DROP INDEX IF EXISTS public.idx_cupon_usos_cupon;
DROP INDEX IF EXISTS public.idx_configuracion_grupo;
DROP INDEX IF EXISTS public.idx_configuracion_clave;
DROP INDEX IF EXISTS public.idx_categorias_slug;
DROP INDEX IF EXISTS public.idx_categorias_activo;
DROP INDEX IF EXISTS public.idx_carrito_usuario;
DROP INDEX IF EXISTS public.idx_carrito_session;
DROP INDEX IF EXISTS public.idx_carrito_items_producto;
DROP INDEX IF EXISTS public.idx_carrito_items_carrito;
DROP INDEX IF EXISTS public.idx_banners_posicion;
DROP INDEX IF EXISTS public.idx_banners_activo;
DROP INDEX IF EXISTS public.idx_auth_providers_usuario;
DROP INDEX IF EXISTS public.idx_auth_providers_provider;
DROP INDEX IF EXISTS public.idx_auth_providers_lookup;
DROP INDEX IF EXISTS public.idx_auth_providers_email;
DROP INDEX IF EXISTS public.idx_atributos_categoria;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_numero_documento_key;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_email_key;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_token_hash_key;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.subcategorias DROP CONSTRAINT IF EXISTS subcategorias_pkey;
ALTER TABLE IF EXISTS ONLY public.subcategorias DROP CONSTRAINT IF EXISTS subcategorias_id_categoria_slug_key;
ALTER TABLE IF EXISTS ONLY public.sedes DROP CONSTRAINT IF EXISTS sedes_pkey;
ALTER TABLE IF EXISTS ONLY public.sedes DROP CONSTRAINT IF EXISTS sedes_codigo_key;
ALTER TABLE IF EXISTS ONLY public.sede_inventario DROP CONSTRAINT IF EXISTS sede_inventario_pkey;
ALTER TABLE IF EXISTS ONLY public.sede_inventario DROP CONSTRAINT IF EXISTS sede_inventario_id_sede_id_producto_key;
ALTER TABLE IF EXISTS ONLY public.resenas DROP CONSTRAINT IF EXISTS resenas_pkey;
ALTER TABLE IF EXISTS ONLY public.productos DROP CONSTRAINT IF EXISTS productos_sku_key;
ALTER TABLE IF EXISTS ONLY public.productos DROP CONSTRAINT IF EXISTS productos_pkey;
ALTER TABLE IF EXISTS ONLY public.producto_imagenes DROP CONSTRAINT IF EXISTS producto_imagenes_pkey;
ALTER TABLE IF EXISTS ONLY public.producto_atributos DROP CONSTRAINT IF EXISTS producto_atributos_pkey;
ALTER TABLE IF EXISTS ONLY public.producto_atributos DROP CONSTRAINT IF EXISTS producto_atributos_id_producto_id_atributo_key;
ALTER TABLE IF EXISTS ONLY public.pedidos DROP CONSTRAINT IF EXISTS pedidos_pkey;
ALTER TABLE IF EXISTS ONLY public.pedidos DROP CONSTRAINT IF EXISTS pedidos_numero_pedido_key;
ALTER TABLE IF EXISTS ONLY public.pedido_items DROP CONSTRAINT IF EXISTS pedido_items_pkey;
ALTER TABLE IF EXISTS ONLY public.pedido_historial DROP CONSTRAINT IF EXISTS pedido_historial_pkey;
ALTER TABLE IF EXISTS ONLY public.newsletter DROP CONSTRAINT IF EXISTS newsletter_pkey;
ALTER TABLE IF EXISTS ONLY public.newsletter DROP CONSTRAINT IF EXISTS newsletter_email_key;
ALTER TABLE IF EXISTS ONLY public.marcas DROP CONSTRAINT IF EXISTS marcas_pkey;
ALTER TABLE IF EXISTS ONLY public.marcas DROP CONSTRAINT IF EXISTS marcas_nombre_key;
ALTER TABLE IF EXISTS ONLY public.logs_actividad DROP CONSTRAINT IF EXISTS logs_actividad_pkey;
ALTER TABLE IF EXISTS ONLY public.favoritos DROP CONSTRAINT IF EXISTS favoritos_pkey;
ALTER TABLE IF EXISTS ONLY public.favoritos DROP CONSTRAINT IF EXISTS favoritos_id_usuario_id_producto_key;
ALTER TABLE IF EXISTS ONLY public.direcciones DROP CONSTRAINT IF EXISTS direcciones_pkey;
ALTER TABLE IF EXISTS ONLY public.cupones DROP CONSTRAINT IF EXISTS cupones_pkey;
ALTER TABLE IF EXISTS ONLY public.cupones DROP CONSTRAINT IF EXISTS cupones_codigo_key;
ALTER TABLE IF EXISTS ONLY public.cupon_usos DROP CONSTRAINT IF EXISTS cupon_usos_pkey;
ALTER TABLE IF EXISTS ONLY public.configuracion DROP CONSTRAINT IF EXISTS configuracion_pkey;
ALTER TABLE IF EXISTS ONLY public.configuracion DROP CONSTRAINT IF EXISTS configuracion_clave_key;
ALTER TABLE IF EXISTS ONLY public.categorias DROP CONSTRAINT IF EXISTS categorias_slug_key;
ALTER TABLE IF EXISTS ONLY public.categorias DROP CONSTRAINT IF EXISTS categorias_pkey;
ALTER TABLE IF EXISTS ONLY public.carrito DROP CONSTRAINT IF EXISTS carrito_pkey;
ALTER TABLE IF EXISTS ONLY public.carrito_items DROP CONSTRAINT IF EXISTS carrito_items_pkey;
ALTER TABLE IF EXISTS ONLY public.carrito_items DROP CONSTRAINT IF EXISTS carrito_items_id_carrito_id_producto_key;
ALTER TABLE IF EXISTS ONLY public.banners DROP CONSTRAINT IF EXISTS banners_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_providers DROP CONSTRAINT IF EXISTS auth_providers_provider_provider_uid_key;
ALTER TABLE IF EXISTS ONLY public.auth_providers DROP CONSTRAINT IF EXISTS auth_providers_pkey;
ALTER TABLE IF EXISTS ONLY public.atributos DROP CONSTRAINT IF EXISTS atributos_pkey;
ALTER TABLE IF EXISTS public.usuarios ALTER COLUMN id_usuario DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_sessions ALTER COLUMN id_session DROP DEFAULT;
ALTER TABLE IF EXISTS public.subcategorias ALTER COLUMN id_subcategoria DROP DEFAULT;
ALTER TABLE IF EXISTS public.sedes ALTER COLUMN id_sede DROP DEFAULT;
ALTER TABLE IF EXISTS public.sede_inventario ALTER COLUMN id_inventario DROP DEFAULT;
ALTER TABLE IF EXISTS public.resenas ALTER COLUMN id_resena DROP DEFAULT;
ALTER TABLE IF EXISTS public.productos ALTER COLUMN id_producto DROP DEFAULT;
ALTER TABLE IF EXISTS public.producto_imagenes ALTER COLUMN id_imagen DROP DEFAULT;
ALTER TABLE IF EXISTS public.producto_atributos ALTER COLUMN id_producto_atributo DROP DEFAULT;
ALTER TABLE IF EXISTS public.pedidos ALTER COLUMN id_pedido DROP DEFAULT;
ALTER TABLE IF EXISTS public.pedido_items ALTER COLUMN id_item DROP DEFAULT;
ALTER TABLE IF EXISTS public.pedido_historial ALTER COLUMN id_historial DROP DEFAULT;
ALTER TABLE IF EXISTS public.newsletter ALTER COLUMN id_suscriptor DROP DEFAULT;
ALTER TABLE IF EXISTS public.marcas ALTER COLUMN id_marca DROP DEFAULT;
ALTER TABLE IF EXISTS public.logs_actividad ALTER COLUMN id_log DROP DEFAULT;
ALTER TABLE IF EXISTS public.favoritos ALTER COLUMN id_favorito DROP DEFAULT;
ALTER TABLE IF EXISTS public.direcciones ALTER COLUMN id_direccion DROP DEFAULT;
ALTER TABLE IF EXISTS public.cupones ALTER COLUMN id_cupon DROP DEFAULT;
ALTER TABLE IF EXISTS public.cupon_usos ALTER COLUMN id_uso DROP DEFAULT;
ALTER TABLE IF EXISTS public.configuracion ALTER COLUMN id_config DROP DEFAULT;
ALTER TABLE IF EXISTS public.categorias ALTER COLUMN id_categoria DROP DEFAULT;
ALTER TABLE IF EXISTS public.carrito_items ALTER COLUMN id_item DROP DEFAULT;
ALTER TABLE IF EXISTS public.carrito ALTER COLUMN id_carrito DROP DEFAULT;
ALTER TABLE IF EXISTS public.banners ALTER COLUMN id_banner DROP DEFAULT;
ALTER TABLE IF EXISTS public.auth_providers ALTER COLUMN id_provider DROP DEFAULT;
ALTER TABLE IF EXISTS public.atributos ALTER COLUMN id_atributo DROP DEFAULT;
DROP VIEW IF EXISTS public.vista_productos_completa;
DROP VIEW IF EXISTS public.vista_pedidos_completa;
DROP SEQUENCE IF EXISTS public.usuarios_id_usuario_seq;
DROP TABLE IF EXISTS public.usuarios;
DROP SEQUENCE IF EXISTS public.user_sessions_id_session_seq;
DROP TABLE IF EXISTS public.user_sessions;
DROP SEQUENCE IF EXISTS public.subcategorias_id_subcategoria_seq;
DROP TABLE IF EXISTS public.subcategorias;
DROP SEQUENCE IF EXISTS public.sedes_id_sede_seq;
DROP TABLE IF EXISTS public.sedes;
DROP SEQUENCE IF EXISTS public.sede_inventario_id_inventario_seq;
DROP TABLE IF EXISTS public.sede_inventario;
DROP SEQUENCE IF EXISTS public.resenas_id_resena_seq;
DROP TABLE IF EXISTS public.resenas;
DROP SEQUENCE IF EXISTS public.productos_id_producto_seq;
DROP TABLE IF EXISTS public.productos;
DROP SEQUENCE IF EXISTS public.producto_imagenes_id_imagen_seq;
DROP TABLE IF EXISTS public.producto_imagenes;
DROP SEQUENCE IF EXISTS public.producto_atributos_id_producto_atributo_seq;
DROP TABLE IF EXISTS public.producto_atributos;
DROP SEQUENCE IF EXISTS public.pedidos_id_pedido_seq;
DROP TABLE IF EXISTS public.pedidos;
DROP SEQUENCE IF EXISTS public.pedido_items_id_item_seq;
DROP TABLE IF EXISTS public.pedido_items;
DROP SEQUENCE IF EXISTS public.pedido_historial_id_historial_seq;
DROP TABLE IF EXISTS public.pedido_historial;
DROP SEQUENCE IF EXISTS public.newsletter_id_suscriptor_seq;
DROP TABLE IF EXISTS public.newsletter;
DROP SEQUENCE IF EXISTS public.marcas_id_marca_seq;
DROP TABLE IF EXISTS public.marcas;
DROP SEQUENCE IF EXISTS public.logs_actividad_id_log_seq;
DROP TABLE IF EXISTS public.logs_actividad;
DROP SEQUENCE IF EXISTS public.favoritos_id_favorito_seq;
DROP TABLE IF EXISTS public.favoritos;
DROP SEQUENCE IF EXISTS public.direcciones_id_direccion_seq;
DROP TABLE IF EXISTS public.direcciones;
DROP SEQUENCE IF EXISTS public.cupones_id_cupon_seq;
DROP TABLE IF EXISTS public.cupones;
DROP SEQUENCE IF EXISTS public.cupon_usos_id_uso_seq;
DROP TABLE IF EXISTS public.cupon_usos;
DROP SEQUENCE IF EXISTS public.configuracion_id_config_seq;
DROP TABLE IF EXISTS public.configuracion;
DROP SEQUENCE IF EXISTS public.categorias_id_categoria_seq;
DROP TABLE IF EXISTS public.categorias;
DROP SEQUENCE IF EXISTS public.carrito_items_id_item_seq;
DROP TABLE IF EXISTS public.carrito_items;
DROP SEQUENCE IF EXISTS public.carrito_id_carrito_seq;
DROP TABLE IF EXISTS public.carrito;
DROP SEQUENCE IF EXISTS public.banners_id_banner_seq;
DROP TABLE IF EXISTS public.banners;
DROP SEQUENCE IF EXISTS public.auth_providers_id_provider_seq;
DROP TABLE IF EXISTS public.auth_providers;
DROP SEQUENCE IF EXISTS public.atributos_id_atributo_seq;
DROP TABLE IF EXISTS public.atributos;
DROP FUNCTION IF EXISTS public.unlink_oauth_provider(p_user_id integer, p_provider public.auth_provider_enum);
DROP FUNCTION IF EXISTS public.link_oauth_provider(p_user_id integer, p_provider public.auth_provider_enum, p_provider_uid character varying, p_email character varying, p_nombre character varying, p_avatar_url text, p_raw_data jsonb);
DROP FUNCTION IF EXISTS public.generar_numero_pedido();
DROP FUNCTION IF EXISTS public.find_or_create_oauth_user(p_provider public.auth_provider_enum, p_provider_uid character varying, p_email character varying, p_nombre character varying, p_apellido character varying, p_avatar_url text, p_raw_data jsonb);
DROP FUNCTION IF EXISTS public.after_resena_aprobada();
DROP FUNCTION IF EXISTS public.after_pedido_item_insert();
DROP FUNCTION IF EXISTS public.after_pedido_estado_update();
DROP FUNCTION IF EXISTS public.actualizar_fecha_actualizacion();
DROP FUNCTION IF EXISTS public.actualizar_calificacion_producto(p_id_producto integer);
DROP TYPE IF EXISTS public.tipo_documento_enum;
DROP TYPE IF EXISTS public.tipo_direccion_enum;
DROP TYPE IF EXISTS public.tipo_descuento_enum;
DROP TYPE IF EXISTS public.tipo_config_enum;
DROP TYPE IF EXISTS public.rol_usuario_enum;
DROP TYPE IF EXISTS public.posicion_banner_enum;
DROP TYPE IF EXISTS public.metodo_pago_enum;
DROP TYPE IF EXISTS public.genero_enum;
DROP TYPE IF EXISTS public.estado_pedido_enum;
DROP TYPE IF EXISTS public.estado_pago_enum;
DROP TYPE IF EXISTS public.auth_provider_enum;
DROP TYPE IF EXISTS public.auth_method_enum;
--
-- Name: auth_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.auth_method_enum AS ENUM (
    'local',
    'google',
    'facebook',
    'github',
    'apple',
    'microsoft'
);


ALTER TYPE public.auth_method_enum OWNER TO postgres;

--
-- Name: auth_provider_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.auth_provider_enum AS ENUM (
    'google',
    'facebook',
    'github',
    'apple',
    'microsoft'
);


ALTER TYPE public.auth_provider_enum OWNER TO postgres;

--
-- Name: estado_pago_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_pago_enum AS ENUM (
    'pendiente',
    'pagado',
    'fallido',
    'reembolsado'
);


ALTER TYPE public.estado_pago_enum OWNER TO postgres;

--
-- Name: estado_pedido_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_pedido_enum AS ENUM (
    'pendiente',
    'confirmado',
    'procesando',
    'enviado',
    'entregado',
    'cancelado',
    'devuelto'
);


ALTER TYPE public.estado_pedido_enum OWNER TO postgres;

--
-- Name: genero_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.genero_enum AS ENUM (
    'M',
    'F',
    'Otro',
    'Prefiero no decir'
);


ALTER TYPE public.genero_enum OWNER TO postgres;

--
-- Name: metodo_pago_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.metodo_pago_enum AS ENUM (
    'efectivo',
    'tarjeta_credito',
    'tarjeta_debito',
    'transferencia',
    'pse',
    'contraentrega'
);


ALTER TYPE public.metodo_pago_enum OWNER TO postgres;

--
-- Name: posicion_banner_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.posicion_banner_enum AS ENUM (
    'hero',
    'sidebar',
    'footer',
    'popup'
);


ALTER TYPE public.posicion_banner_enum OWNER TO postgres;

--
-- Name: rol_usuario_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rol_usuario_enum AS ENUM (
    'cliente',
    'vendedor',
    'admin'
);


ALTER TYPE public.rol_usuario_enum OWNER TO postgres;

--
-- Name: tipo_config_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_config_enum AS ENUM (
    'string',
    'number',
    'boolean',
    'json'
);


ALTER TYPE public.tipo_config_enum OWNER TO postgres;

--
-- Name: tipo_descuento_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_descuento_enum AS ENUM (
    'porcentaje',
    'monto_fijo'
);


ALTER TYPE public.tipo_descuento_enum OWNER TO postgres;

--
-- Name: tipo_direccion_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_direccion_enum AS ENUM (
    'casa',
    'trabajo',
    'otro'
);


ALTER TYPE public.tipo_direccion_enum OWNER TO postgres;

--
-- Name: tipo_documento_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_documento_enum AS ENUM (
    'CC',
    'CE',
    'NIT',
    'Pasaporte'
);


ALTER TYPE public.tipo_documento_enum OWNER TO postgres;

--
-- Name: actualizar_calificacion_producto(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_calificacion_producto(p_id_producto integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.actualizar_calificacion_producto(p_id_producto integer) OWNER TO postgres;

--
-- Name: actualizar_fecha_actualizacion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_fecha_actualizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_fecha_actualizacion() OWNER TO postgres;

--
-- Name: after_pedido_estado_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.after_pedido_estado_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO pedido_historial (id_pedido, estado_anterior, estado_nuevo)
        VALUES (NEW.id_pedido, OLD.estado::VARCHAR, NEW.estado::VARCHAR);
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.after_pedido_estado_update() OWNER TO postgres;

--
-- Name: after_pedido_item_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.after_pedido_item_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE productos 
    SET stock = stock - NEW.cantidad,
        ventas_totales = ventas_totales + NEW.cantidad
    WHERE id_producto = NEW.id_producto;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.after_pedido_item_insert() OWNER TO postgres;

--
-- Name: after_resena_aprobada(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.after_resena_aprobada() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.aprobado = FALSE AND NEW.aprobado = TRUE THEN
        PERFORM actualizar_calificacion_producto(NEW.id_producto);
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.after_resena_aprobada() OWNER TO postgres;

--
-- Name: find_or_create_oauth_user(public.auth_provider_enum, character varying, character varying, character varying, character varying, text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.find_or_create_oauth_user(p_provider public.auth_provider_enum, p_provider_uid character varying, p_email character varying, p_nombre character varying, p_apellido character varying DEFAULT NULL::character varying, p_avatar_url text DEFAULT NULL::text, p_raw_data jsonb DEFAULT NULL::jsonb) RETURNS TABLE(user_id integer, is_new_user boolean, provider_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id INT;
    v_provider_id INT;
    v_is_new BOOLEAN := FALSE;
    v_existing_user_id INT;
BEGIN
    -- 1. Buscar si ya existe este proveedor+uid
    SELECT ap.id_usuario, ap.id_provider INTO v_user_id, v_provider_id
    FROM auth_providers ap
    WHERE ap.provider = p_provider AND ap.provider_uid = p_provider_uid;
    
    IF v_user_id IS NOT NULL THEN
        -- Proveedor ya existe, actualizar último acceso
        UPDATE auth_providers 
        SET fecha_ultima_autenticacion = CURRENT_TIMESTAMP,
            nombre = COALESCE(p_nombre, nombre),
            avatar_url = COALESCE(p_avatar_url, avatar_url),
            raw_data = COALESCE(p_raw_data, raw_data)
        WHERE id_provider = v_provider_id;
        
        UPDATE usuarios SET fecha_ultimo_acceso = CURRENT_TIMESTAMP
        WHERE id_usuario = v_user_id;
        
        RETURN QUERY SELECT v_user_id, FALSE, v_provider_id;
        RETURN;
    END IF;
    
    -- 2. Si no existe el proveedor, buscar usuario por email
    SELECT id_usuario INTO v_existing_user_id
    FROM usuarios WHERE email = p_email;
    
    IF v_existing_user_id IS NOT NULL THEN
        -- Usuario existe por email, vincular el nuevo proveedor
        INSERT INTO auth_providers (id_usuario, provider, provider_uid, email, nombre, avatar_url, raw_data)
        VALUES (v_existing_user_id, p_provider, p_provider_uid, p_email, p_nombre, p_avatar_url, p_raw_data)
        RETURNING id_provider INTO v_provider_id;
        
        -- Actualizar email_verificado si viene de OAuth
        UPDATE usuarios 
        SET email_verificado = TRUE,
            fecha_ultimo_acceso = CURRENT_TIMESTAMP,
            avatar_url = COALESCE(usuarios.avatar_url, p_avatar_url)
        WHERE id_usuario = v_existing_user_id;
        
        RETURN QUERY SELECT v_existing_user_id, FALSE, v_provider_id;
        RETURN;
    END IF;
    
    -- 3. Usuario completamente nuevo
    INSERT INTO usuarios (email, nombre, apellido, avatar_url, email_verificado, auth_method)
    VALUES (p_email, p_nombre, p_apellido, p_avatar_url, TRUE, p_provider::auth_method_enum)
    RETURNING id_usuario INTO v_user_id;
    
    -- Crear registro de proveedor
    INSERT INTO auth_providers (id_usuario, provider, provider_uid, email, nombre, avatar_url, raw_data)
    VALUES (v_user_id, p_provider, p_provider_uid, p_email, p_nombre, p_avatar_url, p_raw_data)
    RETURNING id_provider INTO v_provider_id;
    
    v_is_new := TRUE;
    
    RETURN QUERY SELECT v_user_id, v_is_new, v_provider_id;
END;
$$;


ALTER FUNCTION public.find_or_create_oauth_user(p_provider public.auth_provider_enum, p_provider_uid character varying, p_email character varying, p_nombre character varying, p_apellido character varying, p_avatar_url text, p_raw_data jsonb) OWNER TO postgres;

--
-- Name: generar_numero_pedido(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generar_numero_pedido() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.generar_numero_pedido() OWNER TO postgres;

--
-- Name: link_oauth_provider(integer, public.auth_provider_enum, character varying, character varying, character varying, text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.link_oauth_provider(p_user_id integer, p_provider public.auth_provider_enum, p_provider_uid character varying, p_email character varying DEFAULT NULL::character varying, p_nombre character varying DEFAULT NULL::character varying, p_avatar_url text DEFAULT NULL::text, p_raw_data jsonb DEFAULT NULL::jsonb) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_provider_id INT;
BEGIN
    -- Verificar que el usuario existe
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = p_user_id) THEN
        RAISE EXCEPTION 'Usuario no encontrado: %', p_user_id;
    END IF;
    
    -- Verificar que este proveedor+uid no esté vinculado a otro usuario
    IF EXISTS (
        SELECT 1 FROM auth_providers 
        WHERE provider = p_provider AND provider_uid = p_provider_uid AND id_usuario != p_user_id
    ) THEN
        RAISE EXCEPTION 'Este proveedor ya está vinculado a otro usuario';
    END IF;
    
    -- Insertar o actualizar el proveedor
    INSERT INTO auth_providers (id_usuario, provider, provider_uid, email, nombre, avatar_url, raw_data)
    VALUES (p_user_id, p_provider, p_provider_uid, p_email, p_nombre, p_avatar_url, p_raw_data)
    ON CONFLICT (provider, provider_uid) 
    DO UPDATE SET 
        email = COALESCE(EXCLUDED.email, auth_providers.email),
        nombre = COALESCE(EXCLUDED.nombre, auth_providers.nombre),
        avatar_url = COALESCE(EXCLUDED.avatar_url, auth_providers.avatar_url),
        raw_data = COALESCE(EXCLUDED.raw_data, auth_providers.raw_data),
        fecha_ultima_autenticacion = CURRENT_TIMESTAMP
    RETURNING id_provider INTO v_provider_id;
    
    RETURN v_provider_id;
END;
$$;


ALTER FUNCTION public.link_oauth_provider(p_user_id integer, p_provider public.auth_provider_enum, p_provider_uid character varying, p_email character varying, p_nombre character varying, p_avatar_url text, p_raw_data jsonb) OWNER TO postgres;

--
-- Name: unlink_oauth_provider(integer, public.auth_provider_enum); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.unlink_oauth_provider(p_user_id integer, p_provider public.auth_provider_enum) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_provider_count INT;
    v_has_password BOOLEAN;
BEGIN
    -- Contar cuántos proveedores tiene el usuario
    SELECT COUNT(*) INTO v_provider_count
    FROM auth_providers WHERE id_usuario = p_user_id;
    
    -- Verificar si tiene contraseña local
    SELECT (password_hash IS NOT NULL) INTO v_has_password
    FROM usuarios WHERE id_usuario = p_user_id;
    
    -- No permitir desvincular si es el único método de autenticación
    IF v_provider_count <= 1 AND NOT v_has_password THEN
        RAISE EXCEPTION 'No puedes desvincular tu único método de autenticación. Primero establece una contraseña.';
    END IF;
    
    -- Eliminar el proveedor
    DELETE FROM auth_providers 
    WHERE id_usuario = p_user_id AND provider = p_provider;
    
    RETURN FOUND;
END;
$$;


ALTER FUNCTION public.unlink_oauth_provider(p_user_id integer, p_provider public.auth_provider_enum) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: atributos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.atributos (
    id_atributo integer NOT NULL,
    nombre character varying(255) NOT NULL,
    unidad character varying(50),
    tipo_dato character varying(50) DEFAULT 'texto'::character varying,
    id_categoria integer
);


ALTER TABLE public.atributos OWNER TO postgres;

--
-- Name: atributos_id_atributo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.atributos_id_atributo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atributos_id_atributo_seq OWNER TO postgres;

--
-- Name: atributos_id_atributo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.atributos_id_atributo_seq OWNED BY public.atributos.id_atributo;


--
-- Name: auth_providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_providers (
    id_provider integer NOT NULL,
    id_usuario integer NOT NULL,
    provider public.auth_provider_enum NOT NULL,
    provider_uid character varying(255) NOT NULL,
    email character varying(255),
    nombre character varying(255),
    avatar_url text,
    access_token text,
    refresh_token text,
    token_expiry timestamp without time zone,
    raw_data jsonb,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_autenticacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.auth_providers OWNER TO postgres;

--
-- Name: auth_providers_id_provider_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auth_providers_id_provider_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_providers_id_provider_seq OWNER TO postgres;

--
-- Name: auth_providers_id_provider_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auth_providers_id_provider_seq OWNED BY public.auth_providers.id_provider;


--
-- Name: banners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banners (
    id_banner integer NOT NULL,
    titulo character varying(255) NOT NULL,
    subtitulo character varying(255),
    descripcion text,
    imagen_url character varying(255) NOT NULL,
    imagen_mobile_url character varying(255),
    enlace_url character varying(255),
    texto_boton character varying(50),
    posicion public.posicion_banner_enum DEFAULT 'hero'::public.posicion_banner_enum,
    orden integer DEFAULT 0,
    activo boolean DEFAULT true,
    fecha_inicio timestamp without time zone,
    fecha_fin timestamp without time zone,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.banners OWNER TO postgres;

--
-- Name: banners_id_banner_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banners_id_banner_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.banners_id_banner_seq OWNER TO postgres;

--
-- Name: banners_id_banner_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banners_id_banner_seq OWNED BY public.banners.id_banner;


--
-- Name: carrito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrito (
    id_carrito integer NOT NULL,
    id_usuario integer,
    session_id character varying(255),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.carrito OWNER TO postgres;

--
-- Name: carrito_id_carrito_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carrito_id_carrito_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.carrito_id_carrito_seq OWNER TO postgres;

--
-- Name: carrito_id_carrito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carrito_id_carrito_seq OWNED BY public.carrito.id_carrito;


--
-- Name: carrito_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrito_items (
    id_item integer NOT NULL,
    id_carrito integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad integer DEFAULT 1 NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    fecha_agregado timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.carrito_items OWNER TO postgres;

--
-- Name: carrito_items_id_item_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carrito_items_id_item_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.carrito_items_id_item_seq OWNER TO postgres;

--
-- Name: carrito_items_id_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carrito_items_id_item_seq OWNED BY public.carrito_items.id_item;


--
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id_categoria integer NOT NULL,
    nombre character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    descripcion text,
    imagen_url character varying(255),
    icono character varying(50),
    orden integer DEFAULT 0,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- Name: categorias_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categorias_id_categoria_seq OWNER TO postgres;

--
-- Name: categorias_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_categoria_seq OWNED BY public.categorias.id_categoria;


--
-- Name: configuracion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion (
    id_config integer NOT NULL,
    clave character varying(100) NOT NULL,
    valor text,
    tipo public.tipo_config_enum DEFAULT 'string'::public.tipo_config_enum,
    descripcion text,
    grupo character varying(50),
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.configuracion OWNER TO postgres;

--
-- Name: configuracion_id_config_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.configuracion_id_config_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.configuracion_id_config_seq OWNER TO postgres;

--
-- Name: configuracion_id_config_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configuracion_id_config_seq OWNED BY public.configuracion.id_config;


--
-- Name: cupon_usos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cupon_usos (
    id_uso integer NOT NULL,
    id_cupon integer NOT NULL,
    id_usuario integer NOT NULL,
    id_pedido integer NOT NULL,
    monto_descuento numeric(12,2) NOT NULL,
    fecha_uso timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cupon_usos OWNER TO postgres;

--
-- Name: cupon_usos_id_uso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cupon_usos_id_uso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cupon_usos_id_uso_seq OWNER TO postgres;

--
-- Name: cupon_usos_id_uso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cupon_usos_id_uso_seq OWNED BY public.cupon_usos.id_uso;


--
-- Name: cupones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cupones (
    id_cupon integer NOT NULL,
    codigo character varying(50) NOT NULL,
    descripcion text,
    tipo_descuento public.tipo_descuento_enum NOT NULL,
    valor_descuento numeric(12,2) NOT NULL,
    monto_minimo_compra numeric(12,2) DEFAULT 0.00,
    usos_maximos integer,
    usos_por_usuario integer DEFAULT 1,
    usos_actuales integer DEFAULT 0,
    fecha_inicio timestamp without time zone NOT NULL,
    fecha_fin timestamp without time zone NOT NULL,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cupones OWNER TO postgres;

--
-- Name: cupones_id_cupon_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cupones_id_cupon_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cupones_id_cupon_seq OWNER TO postgres;

--
-- Name: cupones_id_cupon_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cupones_id_cupon_seq OWNED BY public.cupones.id_cupon;


--
-- Name: direcciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.direcciones (
    id_direccion integer NOT NULL,
    id_usuario integer NOT NULL,
    nombre_destinatario character varying(100) NOT NULL,
    telefono_contacto character varying(20) NOT NULL,
    departamento character varying(100) NOT NULL,
    ciudad character varying(100) NOT NULL,
    direccion_linea1 character varying(255) NOT NULL,
    direccion_linea2 character varying(255),
    codigo_postal character varying(20),
    barrio character varying(100),
    referencias text,
    es_principal boolean DEFAULT false,
    tipo public.tipo_direccion_enum DEFAULT 'casa'::public.tipo_direccion_enum,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.direcciones OWNER TO postgres;

--
-- Name: direcciones_id_direccion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.direcciones_id_direccion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.direcciones_id_direccion_seq OWNER TO postgres;

--
-- Name: direcciones_id_direccion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.direcciones_id_direccion_seq OWNED BY public.direcciones.id_direccion;


--
-- Name: favoritos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favoritos (
    id_favorito integer NOT NULL,
    id_usuario integer NOT NULL,
    id_producto integer NOT NULL,
    fecha_agregado timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.favoritos OWNER TO postgres;

--
-- Name: favoritos_id_favorito_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favoritos_id_favorito_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.favoritos_id_favorito_seq OWNER TO postgres;

--
-- Name: favoritos_id_favorito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favoritos_id_favorito_seq OWNED BY public.favoritos.id_favorito;


--
-- Name: logs_actividad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs_actividad (
    id_log bigint NOT NULL,
    id_usuario integer,
    accion character varying(100) NOT NULL,
    tabla_afectada character varying(100),
    id_registro integer,
    datos_anteriores jsonb,
    datos_nuevos jsonb,
    ip_address character varying(45),
    user_agent text,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.logs_actividad OWNER TO postgres;

--
-- Name: logs_actividad_id_log_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_actividad_id_log_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.logs_actividad_id_log_seq OWNER TO postgres;

--
-- Name: logs_actividad_id_log_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_actividad_id_log_seq OWNED BY public.logs_actividad.id_log;


--
-- Name: marcas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marcas (
    id_marca integer NOT NULL,
    nombre character varying(100) NOT NULL,
    logo_url character varying(255),
    descripcion text,
    sitio_web character varying(255),
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marcas OWNER TO postgres;

--
-- Name: marcas_id_marca_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.marcas_id_marca_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.marcas_id_marca_seq OWNER TO postgres;

--
-- Name: marcas_id_marca_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.marcas_id_marca_seq OWNED BY public.marcas.id_marca;


--
-- Name: newsletter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.newsletter (
    id_suscriptor integer NOT NULL,
    email character varying(255) NOT NULL,
    nombre character varying(100),
    activo boolean DEFAULT true,
    fecha_suscripcion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_baja timestamp without time zone
);


ALTER TABLE public.newsletter OWNER TO postgres;

--
-- Name: newsletter_id_suscriptor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.newsletter_id_suscriptor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.newsletter_id_suscriptor_seq OWNER TO postgres;

--
-- Name: newsletter_id_suscriptor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.newsletter_id_suscriptor_seq OWNED BY public.newsletter.id_suscriptor;


--
-- Name: pedido_historial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido_historial (
    id_historial integer NOT NULL,
    id_pedido integer NOT NULL,
    estado_anterior character varying(50),
    estado_nuevo character varying(50) NOT NULL,
    comentario text,
    id_usuario_cambio integer,
    fecha_cambio timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pedido_historial OWNER TO postgres;

--
-- Name: pedido_historial_id_historial_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedido_historial_id_historial_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pedido_historial_id_historial_seq OWNER TO postgres;

--
-- Name: pedido_historial_id_historial_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedido_historial_id_historial_seq OWNED BY public.pedido_historial.id_historial;


--
-- Name: pedido_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido_items (
    id_item integer NOT NULL,
    id_pedido integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    descuento numeric(12,2) DEFAULT 0.00,
    total numeric(12,2) NOT NULL
);


ALTER TABLE public.pedido_items OWNER TO postgres;

--
-- Name: pedido_items_id_item_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedido_items_id_item_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pedido_items_id_item_seq OWNER TO postgres;

--
-- Name: pedido_items_id_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedido_items_id_item_seq OWNED BY public.pedido_items.id_item;


--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    id_pedido integer NOT NULL,
    numero_pedido character varying(50) NOT NULL,
    id_usuario integer NOT NULL,
    id_direccion_envio integer NOT NULL,
    email_contacto character varying(255) NOT NULL,
    telefono_contacto character varying(20) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    descuento numeric(12,2) DEFAULT 0.00,
    costo_envio numeric(12,2) DEFAULT 0.00,
    impuestos numeric(12,2) DEFAULT 0.00,
    total numeric(12,2) NOT NULL,
    estado public.estado_pedido_enum DEFAULT 'pendiente'::public.estado_pedido_enum,
    metodo_pago public.metodo_pago_enum NOT NULL,
    estado_pago public.estado_pago_enum DEFAULT 'pendiente'::public.estado_pago_enum,
    empresa_envio character varying(100),
    numero_guia character varying(100),
    fecha_estimada_entrega date,
    notas_cliente text,
    notas_admin text,
    fecha_pedido timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion timestamp without time zone,
    fecha_envio timestamp without time zone,
    fecha_entrega timestamp without time zone,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- Name: pedidos_id_pedido_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_id_pedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pedidos_id_pedido_seq OWNER TO postgres;

--
-- Name: pedidos_id_pedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_id_pedido_seq OWNED BY public.pedidos.id_pedido;


--
-- Name: producto_atributos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto_atributos (
    id_producto_atributo integer NOT NULL,
    id_producto integer NOT NULL,
    id_atributo integer NOT NULL,
    valor_texto text,
    valor_numero numeric(12,2),
    valor_booleano boolean
);


ALTER TABLE public.producto_atributos OWNER TO postgres;

--
-- Name: producto_atributos_id_producto_atributo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producto_atributos_id_producto_atributo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producto_atributos_id_producto_atributo_seq OWNER TO postgres;

--
-- Name: producto_atributos_id_producto_atributo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producto_atributos_id_producto_atributo_seq OWNED BY public.producto_atributos.id_producto_atributo;


--
-- Name: producto_imagenes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto_imagenes (
    id_imagen integer NOT NULL,
    id_producto integer NOT NULL,
    url_imagen character varying(255) NOT NULL,
    alt_text character varying(255),
    orden integer DEFAULT 0,
    es_principal boolean DEFAULT false,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.producto_imagenes OWNER TO postgres;

--
-- Name: producto_imagenes_id_imagen_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producto_imagenes_id_imagen_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producto_imagenes_id_imagen_seq OWNER TO postgres;

--
-- Name: producto_imagenes_id_imagen_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producto_imagenes_id_imagen_seq OWNED BY public.producto_imagenes.id_imagen;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id_producto integer NOT NULL,
    id_categoria integer NOT NULL,
    id_subcategoria integer,
    id_marca integer NOT NULL,
    sku character varying(50) NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion_corta text,
    descripcion_larga text,
    precio_actual numeric(12,2) NOT NULL,
    precio_anterior numeric(12,2),
    precio_promocional numeric(12,2),
    costo numeric(12,2),
    referencia_proveedor character varying(100),
    stock integer DEFAULT 0,
    stock_minimo integer DEFAULT 5,
    garantia_meses integer DEFAULT 12,
    badge character varying(50),
    destacado boolean DEFAULT false,
    activo boolean DEFAULT true,
    vistas integer DEFAULT 0,
    ventas_totales integer DEFAULT 0,
    calificacion_promedio numeric(3,2) DEFAULT 0.00,
    total_resenas integer DEFAULT 0,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: productos_id_producto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_id_producto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.productos_id_producto_seq OWNER TO postgres;

--
-- Name: productos_id_producto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_id_producto_seq OWNED BY public.productos.id_producto;


--
-- Name: resenas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resenas (
    id_resena integer NOT NULL,
    id_producto integer NOT NULL,
    id_usuario integer NOT NULL,
    id_pedido integer,
    calificacion integer NOT NULL,
    titulo character varying(255),
    comentario text,
    verificado boolean DEFAULT false,
    aprobado boolean DEFAULT false,
    util_count integer DEFAULT 0,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT resenas_calificacion_check CHECK (((calificacion >= 1) AND (calificacion <= 5)))
);


ALTER TABLE public.resenas OWNER TO postgres;

--
-- Name: resenas_id_resena_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resenas_id_resena_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.resenas_id_resena_seq OWNER TO postgres;

--
-- Name: resenas_id_resena_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resenas_id_resena_seq OWNED BY public.resenas.id_resena;


--
-- Name: sede_inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sede_inventario (
    id_inventario integer NOT NULL,
    id_sede integer NOT NULL,
    id_producto integer NOT NULL,
    stock integer DEFAULT 0,
    stock_minimo integer DEFAULT 5,
    ubicacion_fisica character varying(100),
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sede_inventario OWNER TO postgres;

--
-- Name: sede_inventario_id_inventario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sede_inventario_id_inventario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sede_inventario_id_inventario_seq OWNER TO postgres;

--
-- Name: sede_inventario_id_inventario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sede_inventario_id_inventario_seq OWNED BY public.sede_inventario.id_inventario;


--
-- Name: sedes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sedes (
    id_sede integer NOT NULL,
    nombre character varying(100) NOT NULL,
    codigo character varying(20) NOT NULL,
    departamento character varying(100) NOT NULL,
    ciudad character varying(100) NOT NULL,
    direccion character varying(255) NOT NULL,
    telefono character varying(20),
    celular character varying(20),
    email character varying(255),
    whatsapp character varying(20),
    latitud numeric(10,8),
    longitud numeric(11,8),
    horario_atencion text,
    servicios text,
    imagen_url character varying(255),
    es_principal boolean DEFAULT false,
    activo boolean DEFAULT true,
    fecha_apertura date,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sedes OWNER TO postgres;

--
-- Name: sedes_id_sede_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sedes_id_sede_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sedes_id_sede_seq OWNER TO postgres;

--
-- Name: sedes_id_sede_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sedes_id_sede_seq OWNED BY public.sedes.id_sede;


--
-- Name: subcategorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subcategorias (
    id_subcategoria integer NOT NULL,
    id_categoria integer NOT NULL,
    nombre character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subcategorias OWNER TO postgres;

--
-- Name: subcategorias_id_subcategoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subcategorias_id_subcategoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subcategorias_id_subcategoria_seq OWNER TO postgres;

--
-- Name: subcategorias_id_subcategoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subcategorias_id_subcategoria_seq OWNED BY public.subcategorias.id_subcategoria;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id_session integer NOT NULL,
    id_usuario integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    ip_address character varying(45),
    user_agent text,
    device_info character varying(255),
    es_activa boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion timestamp without time zone NOT NULL,
    fecha_ultimo_acceso timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: user_sessions_id_session_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_sessions_id_session_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_sessions_id_session_seq OWNER TO postgres;

--
-- Name: user_sessions_id_session_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_sessions_id_session_seq OWNED BY public.user_sessions.id_session;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    nombre character varying(100) NOT NULL,
    apellido character varying(100),
    telefono character varying(20),
    celular character varying(20),
    tipo_documento public.tipo_documento_enum DEFAULT 'CC'::public.tipo_documento_enum,
    numero_documento character varying(50),
    fecha_nacimiento date,
    genero public.genero_enum,
    avatar_url character varying(255),
    rol public.rol_usuario_enum DEFAULT 'cliente'::public.rol_usuario_enum,
    activo boolean DEFAULT true,
    email_verificado boolean DEFAULT false,
    auth_method public.auth_method_enum DEFAULT 'local'::public.auth_method_enum,
    token_verificacion character varying(255),
    token_recuperacion character varying(255),
    fecha_recuperacion_expira timestamp without time zone,
    fecha_ultimo_acceso timestamp without time zone,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: vista_pedidos_completa; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_pedidos_completa AS
 SELECT p.id_pedido,
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
   FROM ((public.pedidos p
     JOIN public.usuarios u ON ((p.id_usuario = u.id_usuario)))
     JOIN public.direcciones d ON ((p.id_direccion_envio = d.id_direccion)));


ALTER TABLE public.vista_pedidos_completa OWNER TO postgres;

--
-- Name: vista_productos_completa; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_productos_completa AS
 SELECT p.id_producto,
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
    ( SELECT producto_imagenes.url_imagen
           FROM public.producto_imagenes
          WHERE ((producto_imagenes.id_producto = p.id_producto) AND (producto_imagenes.es_principal = true))
         LIMIT 1) AS imagen_principal
   FROM (((public.productos p
     JOIN public.categorias c ON ((p.id_categoria = c.id_categoria)))
     LEFT JOIN public.subcategorias sc ON ((p.id_subcategoria = sc.id_subcategoria)))
     JOIN public.marcas m ON ((p.id_marca = m.id_marca)))
  WHERE (p.activo = true);


ALTER TABLE public.vista_productos_completa OWNER TO postgres;

--
-- Name: atributos id_atributo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.atributos ALTER COLUMN id_atributo SET DEFAULT nextval('public.atributos_id_atributo_seq'::regclass);


--
-- Name: auth_providers id_provider; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_providers ALTER COLUMN id_provider SET DEFAULT nextval('public.auth_providers_id_provider_seq'::regclass);


--
-- Name: banners id_banner; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners ALTER COLUMN id_banner SET DEFAULT nextval('public.banners_id_banner_seq'::regclass);


--
-- Name: carrito id_carrito; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito ALTER COLUMN id_carrito SET DEFAULT nextval('public.carrito_id_carrito_seq'::regclass);


--
-- Name: carrito_items id_item; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito_items ALTER COLUMN id_item SET DEFAULT nextval('public.carrito_items_id_item_seq'::regclass);


--
-- Name: categorias id_categoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id_categoria SET DEFAULT nextval('public.categorias_id_categoria_seq'::regclass);


--
-- Name: configuracion id_config; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion ALTER COLUMN id_config SET DEFAULT nextval('public.configuracion_id_config_seq'::regclass);


--
-- Name: cupon_usos id_uso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cupon_usos ALTER COLUMN id_uso SET DEFAULT nextval('public.cupon_usos_id_uso_seq'::regclass);


--
-- Name: cupones id_cupon; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cupones ALTER COLUMN id_cupon SET DEFAULT nextval('public.cupones_id_cupon_seq'::regclass);


--
-- Name: direcciones id_direccion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direcciones ALTER COLUMN id_direccion SET DEFAULT nextval('public.direcciones_id_direccion_seq'::regclass);


--
-- Name: favoritos id_favorito; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favoritos ALTER COLUMN id_favorito SET DEFAULT nextval('public.favoritos_id_favorito_seq'::regclass);


--
-- Name: logs_actividad id_log; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_actividad ALTER COLUMN id_log SET DEFAULT nextval('public.logs_actividad_id_log_seq'::regclass);


--
-- Name: marcas id_marca; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marcas ALTER COLUMN id_marca SET DEFAULT nextval('public.marcas_id_marca_seq'::regclass);


--
-- Name: newsletter id_suscriptor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter ALTER COLUMN id_suscriptor SET DEFAULT nextval('public.newsletter_id_suscriptor_seq'::regclass);


--
-- Name: pedido_historial id_historial; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_historial ALTER COLUMN id_historial SET DEFAULT nextval('public.pedido_historial_id_historial_seq'::regclass);


--
-- Name: pedido_items id_item; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_items ALTER COLUMN id_item SET DEFAULT nextval('public.pedido_items_id_item_seq'::regclass);


--
-- Name: pedidos id_pedido; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN id_pedido SET DEFAULT nextval('public.pedidos_id_pedido_seq'::regclass);


--
-- Name: producto_atributos id_producto_atributo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_atributos ALTER COLUMN id_producto_atributo SET DEFAULT nextval('public.producto_atributos_id_producto_atributo_seq'::regclass);


--
-- Name: producto_imagenes id_imagen; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_imagenes ALTER COLUMN id_imagen SET DEFAULT nextval('public.producto_imagenes_id_imagen_seq'::regclass);


--
-- Name: productos id_producto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN id_producto SET DEFAULT nextval('public.productos_id_producto_seq'::regclass);


--
-- Name: resenas id_resena; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas ALTER COLUMN id_resena SET DEFAULT nextval('public.resenas_id_resena_seq'::regclass);


--
-- Name: sede_inventario id_inventario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sede_inventario ALTER COLUMN id_inventario SET DEFAULT nextval('public.sede_inventario_id_inventario_seq'::regclass);


--
-- Name: sedes id_sede; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sedes ALTER COLUMN id_sede SET DEFAULT nextval('public.sedes_id_sede_seq'::regclass);


--
-- Name: subcategorias id_subcategoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategorias ALTER COLUMN id_subcategoria SET DEFAULT nextval('public.subcategorias_id_subcategoria_seq'::regclass);


--
-- Name: user_sessions id_session; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id_session SET DEFAULT nextval('public.user_sessions_id_session_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Data for Name: atributos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.atributos (id_atributo, nombre, unidad, tipo_dato, id_categoria) FROM stdin;
1	Marca	\N	texto	\N
2	Modelo	\N	texto	\N
3	Color	\N	texto	\N
4	Material	\N	texto	\N
5	Peso	Kg	numero	\N
6	Alto	cm	numero	\N
7	Ancho	cm	numero	\N
8	Profundo	cm	numero	\N
9	Garantía	Meses	numero	\N
10	Voltaje	V	texto	1
11	Potencia	W	numero	1
12	Eficiencia Energética	\N	texto	1
13	Capacidad	Litros	numero	1
14	Capacidad de Carga	Kg	numero	1
15	Tipo de Pantalla	\N	texto	1
16	Resolución	Pixeles	texto	1
17	Tamaño de Pantalla	Pulgadas	numero	1
18	Smart TV	\N	booleano	1
19	Tecnología de Frío	\N	texto	1
20	Puertos HDMI	Cantidad	numero	1
21	Puertos USB	Cantidad	numero	1
22	Sistema Operativo	\N	texto	1
23	Asistente de Voz	\N	booleano	1
24	Dispensador de Agua	\N	booleano	1
25	Fabricador de Hielo	\N	booleano	1
26	Tipo de Refrigeración	\N	texto	1
27	Tecnología Inverter	\N	booleano	1
28	Ciclos de Lavado	Cantidad	numero	1
29	Tipo de Madera	\N	texto	2
30	Tipo de Tela	\N	texto	2
31	Requiere Armado	\N	booleano	2
32	Número de Puestos	\N	numero	2
33	Estilo	\N	texto	2
34	Cilindraje	cc	numero	3
35	Tipo de Motor	\N	texto	3
36	Potencia Máxima	HP	texto	3
37	Torque Máximo	Nm	texto	3
38	Arranque	\N	texto	3
39	Capacidad Tanque	Galones	numero	3
40	Freno Delantero	\N	texto	3
41	Freno Trasero	\N	texto	3
42	Transmisión	\N	texto	3
43	Potencia Motor	HP	numero	4
44	Longitud de Espada	cm	numero	4
45	Paso de Cadena	Pulgadas	texto	4
46	Peso sin Combustible	Kg	numero	4
47	Cilindrada	cm³	numero	4
\.


--
-- Data for Name: auth_providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_providers (id_provider, id_usuario, provider, provider_uid, email, nombre, avatar_url, access_token, refresh_token, token_expiry, raw_data, fecha_creacion, fecha_ultima_autenticacion) FROM stdin;
\.


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banners (id_banner, titulo, subtitulo, descripcion, imagen_url, imagen_mobile_url, enlace_url, texto_boton, posicion, orden, activo, fecha_inicio, fecha_fin, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: carrito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carrito (id_carrito, id_usuario, session_id, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: carrito_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carrito_items (id_item, id_carrito, id_producto, cantidad, precio_unitario, fecha_agregado) FROM stdin;
\.


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id_categoria, nombre, slug, descripcion, imagen_url, icono, orden, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
1	Electro Hogar	electro-hogar	Electrodomésticos para el hogar	\N	zap	1	t	2026-01-14 17:39:11.035592	2026-01-14 17:39:11.035592
2	Muebles y Organización	muebles	Muebles y soluciones de organización	\N	home	2	t	2026-01-14 17:39:11.035592	2026-01-14 17:39:11.035592
3	Motos	motos	Motocicletas urbanas y deportivas	\N	bike	3	t	2026-01-14 17:39:11.035592	2026-01-14 17:39:11.035592
4	Herramientas STIHL	herramientas	Herramientas profesionales para jardín	\N	wrench	4	t	2026-01-14 17:39:11.035592	2026-01-14 17:39:11.035592
\.


--
-- Data for Name: configuracion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracion (id_config, clave, valor, tipo, descripcion, grupo, fecha_actualizacion) FROM stdin;
1	sitio_nombre	Ceveco	string	Nombre del sitio web	general	2026-01-14 17:39:11.07348
2	sitio_email	contacto@ceveco.com.co	string	Email de contacto	general	2026-01-14 17:39:11.07348
3	sitio_telefono	+57 (606) 859 1234	string	Teléfono principal	general	2026-01-14 17:39:11.07348
4	sitio_whatsapp	+573001234567	string	WhatsApp de contacto	general	2026-01-14 17:39:11.07348
5	envio_gratis_minimo	500000	number	Monto mínimo para envío gratis	envios	2026-01-14 17:39:11.07348
6	iva_porcentaje	19	number	Porcentaje de IVA	impuestos	2026-01-14 17:39:11.07348
7	moneda	COP	string	Moneda del sitio	general	2026-01-14 17:39:11.07348
8	productos_por_pagina	12	number	Productos por página	catalogo	2026-01-14 17:39:11.07348
\.


--
-- Data for Name: cupon_usos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cupon_usos (id_uso, id_cupon, id_usuario, id_pedido, monto_descuento, fecha_uso) FROM stdin;
\.


--
-- Data for Name: cupones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cupones (id_cupon, codigo, descripcion, tipo_descuento, valor_descuento, monto_minimo_compra, usos_maximos, usos_por_usuario, usos_actuales, fecha_inicio, fecha_fin, activo, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: direcciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.direcciones (id_direccion, id_usuario, nombre_destinatario, telefono_contacto, departamento, ciudad, direccion_linea1, direccion_linea2, codigo_postal, barrio, referencias, es_principal, tipo, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: favoritos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favoritos (id_favorito, id_usuario, id_producto, fecha_agregado) FROM stdin;
\.


--
-- Data for Name: logs_actividad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs_actividad (id_log, id_usuario, accion, tabla_afectada, id_registro, datos_anteriores, datos_nuevos, ip_address, user_agent, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: marcas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marcas (id_marca, nombre, logo_url, descripcion, sitio_web, activo, fecha_creacion) FROM stdin;
1	Honda	\N	\N	\N	t	2026-01-14 17:39:11.046079
2	Kalley	\N	\N	\N	t	2026-01-14 17:39:11.046079
3	Haceb	\N	\N	\N	t	2026-01-14 17:39:11.046079
4	Samsung	\N	\N	\N	t	2026-01-14 17:39:11.046079
5	LG	\N	\N	\N	t	2026-01-14 17:39:11.046079
6	Rimax	\N	\N	\N	t	2026-01-14 17:39:11.046079
7	STIHL	\N	\N	\N	t	2026-01-14 17:39:11.046079
8	Yamaha	\N	\N	\N	t	2026-01-14 17:39:11.046079
9	Mabe	\N	\N	\N	t	2026-01-14 17:39:11.046079
10	Whirlpool	\N	\N	\N	t	2026-01-14 17:39:11.046079
11	Oster	\N	\N	\N	t	2026-01-14 17:39:11.046079
12	Sony	\N	\N	\N	t	2026-01-14 17:39:11.046079
13	TCL	\N	\N	\N	t	2026-01-14 17:39:11.046079
14	Samurai	\N	\N	\N	t	2026-01-14 17:39:11.046079
15	Comodisimos	\N	\N	\N	t	2026-01-14 17:39:11.046079
16	Profilan	\N	\N	\N	t	2026-01-14 17:39:11.046079
17	Durespo	\N	\N	\N	t	2026-01-14 17:39:11.046079
\.


--
-- Data for Name: newsletter; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.newsletter (id_suscriptor, email, nombre, activo, fecha_suscripcion, fecha_baja) FROM stdin;
\.


--
-- Data for Name: pedido_historial; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedido_historial (id_historial, id_pedido, estado_anterior, estado_nuevo, comentario, id_usuario_cambio, fecha_cambio) FROM stdin;
\.


--
-- Data for Name: pedido_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedido_items (id_item, id_pedido, id_producto, cantidad, precio_unitario, subtotal, descuento, total) FROM stdin;
\.


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos (id_pedido, numero_pedido, id_usuario, id_direccion_envio, email_contacto, telefono_contacto, subtotal, descuento, costo_envio, impuestos, total, estado, metodo_pago, estado_pago, empresa_envio, numero_guia, fecha_estimada_entrega, notas_cliente, notas_admin, fecha_pedido, fecha_confirmacion, fecha_envio, fecha_entrega, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: producto_atributos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producto_atributos (id_producto_atributo, id_producto, id_atributo, valor_texto, valor_numero, valor_booleano) FROM stdin;
1	1	3	Negro	\N	\N
2	1	16	4K UHD	\N	\N
3	1	17	\N	50.00	\N
4	1	18	\N	\N	t
5	1	9	\N	12.00	\N
\.


--
-- Data for Name: producto_imagenes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producto_imagenes (id_imagen, id_producto, url_imagen, alt_text, orden, es_principal, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id_producto, id_categoria, id_subcategoria, id_marca, sku, nombre, descripcion_corta, descripcion_larga, precio_actual, precio_anterior, precio_promocional, costo, referencia_proveedor, stock, stock_minimo, garantia_meses, badge, destacado, activo, vistas, ventas_totales, calificacion_promedio, total_resenas, fecha_creacion, fecha_actualizacion) FROM stdin;
1	1	4	5	CEV-TV-001	TV LG 50" Smart TV 4K	\N	TV LED 50" Smart Tv Ultra UHD 4K HDR10 PRO con procesador inteligente y sonido envolvente.	2250000.00	2500000.00	2050000.00	\N	50UA8050	10	5	12	\N	f	t	0	0	0.00	0	2026-01-14 17:39:11.055671	2026-01-14 17:39:11.055671
\.


--
-- Data for Name: resenas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resenas (id_resena, id_producto, id_usuario, id_pedido, calificacion, titulo, comentario, verificado, aprobado, util_count, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: sede_inventario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sede_inventario (id_inventario, id_sede, id_producto, stock, stock_minimo, ubicacion_fisica, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: sedes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sedes (id_sede, nombre, codigo, departamento, ciudad, direccion, telefono, celular, email, whatsapp, latitud, longitud, horario_atencion, servicios, imagen_url, es_principal, activo, fecha_apertura, fecha_creacion) FROM stdin;
1	Ceveco Riosucio	RS001	Caldas	Riosucio	Carrera 5 # 9-45	(606) 859 1234	+573001234567	riosucio@ceveco.com.co	+573001234567	\N	\N	\N	\N	\N	t	t	\N	2026-01-14 17:39:11.076191
\.


--
-- Data for Name: subcategorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subcategorias (id_subcategoria, id_categoria, nombre, slug, descripcion, activo, fecha_creacion) FROM stdin;
1	1	Lavadoras	lavadoras	\N	t	2026-01-14 17:39:11.039168
2	1	Neveras	neveras	\N	t	2026-01-14 17:39:11.039168
3	1	Estufas	estufas	\N	t	2026-01-14 17:39:11.039168
4	1	Televisores	televisores	\N	t	2026-01-14 17:39:11.039168
5	1	Microondas	microondas	\N	t	2026-01-14 17:39:11.039168
6	1	Licuadoras	licuadoras	\N	t	2026-01-14 17:39:11.039168
7	1	Cafeteras	cafeteras	\N	t	2026-01-14 17:39:11.039168
8	1	Aires Acondicionados	aires-acondicionados	\N	t	2026-01-14 17:39:11.039168
9	1	Ventiladores	ventiladores	\N	t	2026-01-14 17:39:11.039168
10	1	Calentadores	calentadores	\N	t	2026-01-14 17:39:11.039168
11	1	Planchas	planchas	\N	t	2026-01-14 17:39:11.039168
12	1	Aspiradoras	aspiradoras	\N	t	2026-01-14 17:39:11.039168
13	1	Secadoras	secadoras	\N	t	2026-01-14 17:39:11.039168
14	1	Hornos	hornos	\N	t	2026-01-14 17:39:11.039168
15	1	Campanas	campanas	\N	t	2026-01-14 17:39:11.039168
16	1	Congeladores	congeladores	\N	t	2026-01-14 17:39:11.039168
17	1	Equipos de Sonido	equipos-sonido	\N	t	2026-01-14 17:39:11.039168
18	1	Barras de Sonido	barras-sonido	\N	t	2026-01-14 17:39:11.039168
19	1	Teatros en Casa	teatros-casa	\N	t	2026-01-14 17:39:11.039168
20	2	Escritorios	escritorios	\N	t	2026-01-14 17:39:11.039168
21	2	Sillas	sillas	\N	t	2026-01-14 17:39:11.039168
22	2	Estanterías	estanterias	\N	t	2026-01-14 17:39:11.039168
23	2	Mesas	mesas	\N	t	2026-01-14 17:39:11.039168
24	2	Camas	camas	\N	t	2026-01-14 17:39:11.039168
25	2	Closets	closets	\N	t	2026-01-14 17:39:11.039168
26	2	Comedores	comedores	\N	t	2026-01-14 17:39:11.039168
27	2	Salas	salas	\N	t	2026-01-14 17:39:11.039168
28	2	Bibliotecas	bibliotecas	\N	t	2026-01-14 17:39:11.039168
29	2	Organizadores	organizadores	\N	t	2026-01-14 17:39:11.039168
30	2	Muebles de Cocina	muebles-cocina	\N	t	2026-01-14 17:39:11.039168
31	2	Muebles de Baño	muebles-bano	\N	t	2026-01-14 17:39:11.039168
32	2	Colchones	colchones	\N	t	2026-01-14 17:39:11.039168
33	2	Bases de Cama	bases-cama	\N	t	2026-01-14 17:39:11.039168
34	3	Motos Urbanas	motos-urbanas	\N	t	2026-01-14 17:39:11.039168
35	3	Motos Deportivas	motos-deportivas	\N	t	2026-01-14 17:39:11.039168
36	3	Motos de Trabajo	motos-trabajo	\N	t	2026-01-14 17:39:11.039168
37	3	Motos Scooter	motos-scooter	\N	t	2026-01-14 17:39:11.039168
38	3	Motos Enduro	motos-enduro	\N	t	2026-01-14 17:39:11.039168
39	3	Accesorios para Motos	accesorios-motos	\N	t	2026-01-14 17:39:11.039168
40	3	Cascos	cascos	\N	t	2026-01-14 17:39:11.039168
41	3	Repuestos	repuestos	\N	t	2026-01-14 17:39:11.039168
42	4	Motosierras	motosierras	\N	t	2026-01-14 17:39:11.039168
43	4	Guadañas	guadanas	\N	t	2026-01-14 17:39:11.039168
44	4	Sopladores	sopladores	\N	t	2026-01-14 17:39:11.039168
45	4	Cortasetos	cortasetos	\N	t	2026-01-14 17:39:11.039168
46	4	Podadoras	podadoras	\N	t	2026-01-14 17:39:11.039168
47	4	Fumigadoras	fumigadoras	\N	t	2026-01-14 17:39:11.039168
48	4	Accesorios STIHL	accesorios-stihl	\N	t	2026-01-14 17:39:11.039168
49	4	Repuestos STIHL	repuestos-stihl	\N	t	2026-01-14 17:39:11.039168
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id_session, id_usuario, token_hash, ip_address, user_agent, device_info, es_activa, fecha_creacion, fecha_expiracion, fecha_ultimo_acceso) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id_usuario, email, password_hash, nombre, apellido, telefono, celular, tipo_documento, numero_documento, fecha_nacimiento, genero, avatar_url, rol, activo, email_verificado, auth_method, token_verificacion, token_recuperacion, fecha_recuperacion_expira, fecha_ultimo_acceso, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Name: atributos_id_atributo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.atributos_id_atributo_seq', 47, true);


--
-- Name: auth_providers_id_provider_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_providers_id_provider_seq', 1, false);


--
-- Name: banners_id_banner_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banners_id_banner_seq', 1, false);


--
-- Name: carrito_id_carrito_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrito_id_carrito_seq', 1, false);


--
-- Name: carrito_items_id_item_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrito_items_id_item_seq', 1, false);


--
-- Name: categorias_id_categoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_categoria_seq', 4, true);


--
-- Name: configuracion_id_config_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuracion_id_config_seq', 8, true);


--
-- Name: cupon_usos_id_uso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cupon_usos_id_uso_seq', 1, false);


--
-- Name: cupones_id_cupon_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cupones_id_cupon_seq', 1, false);


--
-- Name: direcciones_id_direccion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.direcciones_id_direccion_seq', 1, false);


--
-- Name: favoritos_id_favorito_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favoritos_id_favorito_seq', 1, false);


--
-- Name: logs_actividad_id_log_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_actividad_id_log_seq', 1, false);


--
-- Name: marcas_id_marca_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.marcas_id_marca_seq', 17, true);


--
-- Name: newsletter_id_suscriptor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.newsletter_id_suscriptor_seq', 1, false);


--
-- Name: pedido_historial_id_historial_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedido_historial_id_historial_seq', 1, false);


--
-- Name: pedido_items_id_item_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedido_items_id_item_seq', 1, false);


--
-- Name: pedidos_id_pedido_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_id_pedido_seq', 1, false);


--
-- Name: producto_atributos_id_producto_atributo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producto_atributos_id_producto_atributo_seq', 5, true);


--
-- Name: producto_imagenes_id_imagen_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producto_imagenes_id_imagen_seq', 1, false);


--
-- Name: productos_id_producto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_id_producto_seq', 1, true);


--
-- Name: resenas_id_resena_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resenas_id_resena_seq', 1, false);


--
-- Name: sede_inventario_id_inventario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sede_inventario_id_inventario_seq', 1, false);


--
-- Name: sedes_id_sede_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sedes_id_sede_seq', 1, true);


--
-- Name: subcategorias_id_subcategoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subcategorias_id_subcategoria_seq', 49, true);


--
-- Name: user_sessions_id_session_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_sessions_id_session_seq', 1, false);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 1, false);


--
-- Name: atributos atributos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.atributos
    ADD CONSTRAINT atributos_pkey PRIMARY KEY (id_atributo);


--
-- Name: auth_providers auth_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_providers
    ADD CONSTRAINT auth_providers_pkey PRIMARY KEY (id_provider);


--
-- Name: auth_providers auth_providers_provider_provider_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_providers
    ADD CONSTRAINT auth_providers_provider_provider_uid_key UNIQUE (provider, provider_uid);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id_banner);


--
-- Name: carrito_items carrito_items_id_carrito_id_producto_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito_items
    ADD CONSTRAINT carrito_items_id_carrito_id_producto_key UNIQUE (id_carrito, id_producto);


--
-- Name: carrito_items carrito_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito_items
    ADD CONSTRAINT carrito_items_pkey PRIMARY KEY (id_item);


--
-- Name: carrito carrito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_pkey PRIMARY KEY (id_carrito);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria);


--
-- Name: categorias categorias_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_slug_key UNIQUE (slug);


--
-- Name: configuracion configuracion_clave_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion
    ADD CONSTRAINT configuracion_clave_key UNIQUE (clave);


--
-- Name: configuracion configuracion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion
    ADD CONSTRAINT configuracion_pkey PRIMARY KEY (id_config);


--
-- Name: cupon_usos cupon_usos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cupon_usos
    ADD CONSTRAINT cupon_usos_pkey PRIMARY KEY (id_uso);


--
-- Name: cupones cupones_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cupones
    ADD CONSTRAINT cupones_codigo_key UNIQUE (codigo);


--
-- Name: cupones cupones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cupones
    ADD CONSTRAINT cupones_pkey PRIMARY KEY (id_cupon);


--
-- Name: direcciones direcciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direcciones
    ADD CONSTRAINT direcciones_pkey PRIMARY KEY (id_direccion);


--
-- Name: favoritos favoritos_id_usuario_id_producto_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT favoritos_id_usuario_id_producto_key UNIQUE (id_usuario, id_producto);


--
-- Name: favoritos favoritos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT favoritos_pkey PRIMARY KEY (id_favorito);


--
-- Name: logs_actividad logs_actividad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_actividad
    ADD CONSTRAINT logs_actividad_pkey PRIMARY KEY (id_log);


--
-- Name: marcas marcas_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marcas
    ADD CONSTRAINT marcas_nombre_key UNIQUE (nombre);


--
-- Name: marcas marcas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marcas
    ADD CONSTRAINT marcas_pkey PRIMARY KEY (id_marca);


--
-- Name: newsletter newsletter_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter
    ADD CONSTRAINT newsletter_email_key UNIQUE (email);


--
-- Name: newsletter newsletter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter
    ADD CONSTRAINT newsletter_pkey PRIMARY KEY (id_suscriptor);


--
-- Name: pedido_historial pedido_historial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_historial
    ADD CONSTRAINT pedido_historial_pkey PRIMARY KEY (id_historial);


--
-- Name: pedido_items pedido_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_pkey PRIMARY KEY (id_item);


--
-- Name: pedidos pedidos_numero_pedido_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_numero_pedido_key UNIQUE (numero_pedido);


--
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id_pedido);


--
-- Name: producto_atributos producto_atributos_id_producto_id_atributo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_atributos
    ADD CONSTRAINT producto_atributos_id_producto_id_atributo_key UNIQUE (id_producto, id_atributo);


--
-- Name: producto_atributos producto_atributos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_atributos
    ADD CONSTRAINT producto_atributos_pkey PRIMARY KEY (id_producto_atributo);


--
-- Name: producto_imagenes producto_imagenes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_imagenes
    ADD CONSTRAINT producto_imagenes_pkey PRIMARY KEY (id_imagen);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id_producto);


--
-- Name: productos productos_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_sku_key UNIQUE (sku);


--
-- Name: resenas resenas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_pkey PRIMARY KEY (id_resena);


--
-- Name: sede_inventario sede_inventario_id_sede_id_producto_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sede_inventario
    ADD CONSTRAINT sede_inventario_id_sede_id_producto_key UNIQUE (id_sede, id_producto);


--
-- Name: sede_inventario sede_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sede_inventario
    ADD CONSTRAINT sede_inventario_pkey PRIMARY KEY (id_inventario);


--
-- Name: sedes sedes_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sedes
    ADD CONSTRAINT sedes_codigo_key UNIQUE (codigo);


--
-- Name: sedes sedes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sedes
    ADD CONSTRAINT sedes_pkey PRIMARY KEY (id_sede);


--
-- Name: subcategorias subcategorias_id_categoria_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategorias
    ADD CONSTRAINT subcategorias_id_categoria_slug_key UNIQUE (id_categoria, slug);


--
-- Name: subcategorias subcategorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategorias
    ADD CONSTRAINT subcategorias_pkey PRIMARY KEY (id_subcategoria);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id_session);


--
-- Name: user_sessions user_sessions_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_token_hash_key UNIQUE (token_hash);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_numero_documento_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_numero_documento_key UNIQUE (numero_documento);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: idx_atributos_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_atributos_categoria ON public.atributos USING btree (id_categoria);


--
-- Name: idx_auth_providers_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_providers_email ON public.auth_providers USING btree (email);


--
-- Name: idx_auth_providers_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_providers_lookup ON public.auth_providers USING btree (provider, provider_uid);


--
-- Name: idx_auth_providers_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_providers_provider ON public.auth_providers USING btree (provider);


--
-- Name: idx_auth_providers_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_providers_usuario ON public.auth_providers USING btree (id_usuario);


--
-- Name: idx_banners_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banners_activo ON public.banners USING btree (activo);


--
-- Name: idx_banners_posicion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_banners_posicion ON public.banners USING btree (posicion);


--
-- Name: idx_carrito_items_carrito; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carrito_items_carrito ON public.carrito_items USING btree (id_carrito);


--
-- Name: idx_carrito_items_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carrito_items_producto ON public.carrito_items USING btree (id_producto);


--
-- Name: idx_carrito_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carrito_session ON public.carrito USING btree (session_id);


--
-- Name: idx_carrito_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carrito_usuario ON public.carrito USING btree (id_usuario);


--
-- Name: idx_categorias_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categorias_activo ON public.categorias USING btree (activo);


--
-- Name: idx_categorias_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categorias_slug ON public.categorias USING btree (slug);


--
-- Name: idx_configuracion_clave; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_configuracion_clave ON public.configuracion USING btree (clave);


--
-- Name: idx_configuracion_grupo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_configuracion_grupo ON public.configuracion USING btree (grupo);


--
-- Name: idx_cupon_usos_cupon; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cupon_usos_cupon ON public.cupon_usos USING btree (id_cupon);


--
-- Name: idx_cupon_usos_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cupon_usos_usuario ON public.cupon_usos USING btree (id_usuario);


--
-- Name: idx_cupones_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cupones_activo ON public.cupones USING btree (activo);


--
-- Name: idx_cupones_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cupones_codigo ON public.cupones USING btree (codigo);


--
-- Name: idx_cupones_fechas; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cupones_fechas ON public.cupones USING btree (fecha_inicio, fecha_fin);


--
-- Name: idx_direcciones_principal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_direcciones_principal ON public.direcciones USING btree (es_principal);


--
-- Name: idx_direcciones_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_direcciones_usuario ON public.direcciones USING btree (id_usuario);


--
-- Name: idx_favoritos_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_favoritos_usuario ON public.favoritos USING btree (id_usuario);


--
-- Name: idx_logs_actividad_accion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_actividad_accion ON public.logs_actividad USING btree (accion);


--
-- Name: idx_logs_actividad_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_actividad_fecha ON public.logs_actividad USING btree (fecha_creacion);


--
-- Name: idx_logs_actividad_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_actividad_usuario ON public.logs_actividad USING btree (id_usuario);


--
-- Name: idx_marcas_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_marcas_nombre ON public.marcas USING btree (nombre);


--
-- Name: idx_newsletter_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_newsletter_activo ON public.newsletter USING btree (activo);


--
-- Name: idx_newsletter_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_newsletter_email ON public.newsletter USING btree (email);


--
-- Name: idx_pedido_historial_pedido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedido_historial_pedido ON public.pedido_historial USING btree (id_pedido);


--
-- Name: idx_pedido_items_pedido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedido_items_pedido ON public.pedido_items USING btree (id_pedido);


--
-- Name: idx_pedido_items_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedido_items_producto ON public.pedido_items USING btree (id_producto);


--
-- Name: idx_pedidos_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedidos_estado ON public.pedidos USING btree (estado);


--
-- Name: idx_pedidos_fecha_pedido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedidos_fecha_pedido ON public.pedidos USING btree (fecha_pedido);


--
-- Name: idx_pedidos_numero_pedido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedidos_numero_pedido ON public.pedidos USING btree (numero_pedido);


--
-- Name: idx_pedidos_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedidos_usuario ON public.pedidos USING btree (id_usuario);


--
-- Name: idx_pedidos_usuario_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedidos_usuario_fecha ON public.pedidos USING btree (id_usuario, fecha_pedido);


--
-- Name: idx_producto_atributos_atributo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_producto_atributos_atributo ON public.producto_atributos USING btree (id_atributo);


--
-- Name: idx_producto_atributos_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_producto_atributos_producto ON public.producto_atributos USING btree (id_producto);


--
-- Name: idx_producto_imagenes_principal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_producto_imagenes_principal ON public.producto_imagenes USING btree (es_principal);


--
-- Name: idx_producto_imagenes_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_producto_imagenes_producto ON public.producto_imagenes USING btree (id_producto);


--
-- Name: idx_productos_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_activo ON public.productos USING btree (activo);


--
-- Name: idx_productos_busqueda; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_busqueda ON public.productos USING gin (to_tsvector('spanish'::regconfig, (((nombre)::text || ' '::text) || COALESCE(descripcion_corta, ''::text))));


--
-- Name: idx_productos_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_categoria ON public.productos USING btree (id_categoria);


--
-- Name: idx_productos_destacado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_destacado ON public.productos USING btree (destacado);


--
-- Name: idx_productos_destacado_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_destacado_activo ON public.productos USING btree (destacado, activo);


--
-- Name: idx_productos_marca; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_marca ON public.productos USING btree (id_marca);


--
-- Name: idx_productos_precio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_precio ON public.productos USING btree (precio_actual);


--
-- Name: idx_productos_precio_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_precio_categoria ON public.productos USING btree (id_categoria, precio_actual);


--
-- Name: idx_productos_ref_proveedor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_ref_proveedor ON public.productos USING btree (referencia_proveedor) WHERE (referencia_proveedor IS NOT NULL);


--
-- Name: idx_productos_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_sku ON public.productos USING btree (sku);


--
-- Name: idx_resenas_aprobado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resenas_aprobado ON public.resenas USING btree (aprobado);


--
-- Name: idx_resenas_calificacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resenas_calificacion ON public.resenas USING btree (calificacion);


--
-- Name: idx_resenas_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resenas_producto ON public.resenas USING btree (id_producto);


--
-- Name: idx_resenas_producto_aprobado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resenas_producto_aprobado ON public.resenas USING btree (id_producto, aprobado);


--
-- Name: idx_resenas_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resenas_usuario ON public.resenas USING btree (id_usuario);


--
-- Name: idx_sede_inventario_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sede_inventario_producto ON public.sede_inventario USING btree (id_producto);


--
-- Name: idx_sede_inventario_sede; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sede_inventario_sede ON public.sede_inventario USING btree (id_sede);


--
-- Name: idx_sedes_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sedes_activo ON public.sedes USING btree (activo);


--
-- Name: idx_sedes_ciudad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sedes_ciudad ON public.sedes USING btree (ciudad);


--
-- Name: idx_subcategorias_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subcategorias_categoria ON public.subcategorias USING btree (id_categoria);


--
-- Name: idx_subcategorias_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subcategorias_slug ON public.subcategorias USING btree (slug);


--
-- Name: idx_user_sessions_activa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_activa ON public.user_sessions USING btree (es_activa);


--
-- Name: idx_user_sessions_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_token ON public.user_sessions USING btree (token_hash);


--
-- Name: idx_user_sessions_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_usuario ON public.user_sessions USING btree (id_usuario);


--
-- Name: idx_usuarios_documento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_documento ON public.usuarios USING btree (numero_documento);


--
-- Name: idx_usuarios_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_email ON public.usuarios USING btree (email);


--
-- Name: idx_usuarios_rol; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_rol ON public.usuarios USING btree (rol);


--
-- Name: carrito trigger_actualizar_carrito; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_carrito BEFORE UPDATE ON public.carrito FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: categorias trigger_actualizar_categorias; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_categorias BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: configuracion trigger_actualizar_configuracion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_configuracion BEFORE UPDATE ON public.configuracion FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: pedidos trigger_actualizar_pedidos; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_pedidos BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: productos trigger_actualizar_productos; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_productos BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: resenas trigger_actualizar_resenas; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_resenas BEFORE UPDATE ON public.resenas FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: sede_inventario trigger_actualizar_sede_inventario; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_sede_inventario BEFORE UPDATE ON public.sede_inventario FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: user_sessions trigger_actualizar_user_sessions; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_user_sessions BEFORE UPDATE ON public.user_sessions FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: usuarios trigger_actualizar_usuarios; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_usuarios BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: pedidos trigger_after_pedido_estado_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_after_pedido_estado_update AFTER UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.after_pedido_estado_update();


--
-- Name: pedido_items trigger_after_pedido_item_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_after_pedido_item_insert AFTER INSERT ON public.pedido_items FOR EACH ROW EXECUTE FUNCTION public.after_pedido_item_insert();


--
-- Name: resenas trigger_after_resena_aprobada; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_after_resena_aprobada AFTER UPDATE ON public.resenas FOR EACH ROW EXECUTE FUNCTION public.after_resena_aprobada();


--
-- Name: atributos atributos_id_categoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.atributos
    ADD CONSTRAINT atributos_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria) ON DELETE SET NULL;


--
-- Name: auth_providers auth_providers_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_providers
    ADD CONSTRAINT auth_providers_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: carrito carrito_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: carrito_items carrito_items_id_carrito_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito_items
    ADD CONSTRAINT carrito_items_id_carrito_fkey FOREIGN KEY (id_carrito) REFERENCES public.carrito(id_carrito) ON DELETE CASCADE;


--
-- Name: carrito_items carrito_items_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito_items
    ADD CONSTRAINT carrito_items_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE CASCADE;


--
-- Name: cupon_usos cupon_usos_id_cupon_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cupon_usos
    ADD CONSTRAINT cupon_usos_id_cupon_fkey FOREIGN KEY (id_cupon) REFERENCES public.cupones(id_cupon) ON DELETE CASCADE;


--
-- Name: cupon_usos cupon_usos_id_pedido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cupon_usos
    ADD CONSTRAINT cupon_usos_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE;


--
-- Name: cupon_usos cupon_usos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cupon_usos
    ADD CONSTRAINT cupon_usos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: direcciones direcciones_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direcciones
    ADD CONSTRAINT direcciones_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: favoritos favoritos_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT favoritos_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE CASCADE;


--
-- Name: favoritos favoritos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT favoritos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: logs_actividad logs_actividad_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_actividad
    ADD CONSTRAINT logs_actividad_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE SET NULL;


--
-- Name: pedido_historial pedido_historial_id_pedido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_historial
    ADD CONSTRAINT pedido_historial_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE;


--
-- Name: pedido_historial pedido_historial_id_usuario_cambio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_historial
    ADD CONSTRAINT pedido_historial_id_usuario_cambio_fkey FOREIGN KEY (id_usuario_cambio) REFERENCES public.usuarios(id_usuario) ON DELETE SET NULL;


--
-- Name: pedido_items pedido_items_id_pedido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE;


--
-- Name: pedido_items pedido_items_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto);


--
-- Name: pedidos pedidos_id_direccion_envio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_id_direccion_envio_fkey FOREIGN KEY (id_direccion_envio) REFERENCES public.direcciones(id_direccion);


--
-- Name: pedidos pedidos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: producto_atributos producto_atributos_id_atributo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_atributos
    ADD CONSTRAINT producto_atributos_id_atributo_fkey FOREIGN KEY (id_atributo) REFERENCES public.atributos(id_atributo) ON DELETE CASCADE;


--
-- Name: producto_atributos producto_atributos_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_atributos
    ADD CONSTRAINT producto_atributos_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE CASCADE;


--
-- Name: producto_imagenes producto_imagenes_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_imagenes
    ADD CONSTRAINT producto_imagenes_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE CASCADE;


--
-- Name: productos productos_id_categoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria);


--
-- Name: productos productos_id_marca_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_id_marca_fkey FOREIGN KEY (id_marca) REFERENCES public.marcas(id_marca);


--
-- Name: productos productos_id_subcategoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_id_subcategoria_fkey FOREIGN KEY (id_subcategoria) REFERENCES public.subcategorias(id_subcategoria) ON DELETE SET NULL;


--
-- Name: resenas resenas_id_pedido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido) ON DELETE SET NULL;


--
-- Name: resenas resenas_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE CASCADE;


--
-- Name: resenas resenas_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: sede_inventario sede_inventario_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sede_inventario
    ADD CONSTRAINT sede_inventario_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE CASCADE;


--
-- Name: sede_inventario sede_inventario_id_sede_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sede_inventario
    ADD CONSTRAINT sede_inventario_id_sede_fkey FOREIGN KEY (id_sede) REFERENCES public.sedes(id_sede) ON DELETE CASCADE;


--
-- Name: subcategorias subcategorias_id_categoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategorias
    ADD CONSTRAINT subcategorias_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict WS0OBAlVmpKtbryxN8IHUQcutGjY3JMtgsOOEFVuEKbaIinCnLAL3xhfyfZ3QjP

