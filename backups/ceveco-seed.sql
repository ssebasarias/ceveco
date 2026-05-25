--
-- PostgreSQL database dump
--

\restrict 6Q76yzebqgrSoX4VCaTJfYQMNedMO5HuGMpTsyQgvvGKAzMtkLlkCHoGOsZmdks

-- Dumped from database version 17.7
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
DROP TRIGGER IF EXISTS trigger_update_asesores_timestamp ON public.asesores;
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
DROP INDEX IF EXISTS public.idx_productos_nombre_trgm;
DROP INDEX IF EXISTS public.idx_productos_marca;
DROP INDEX IF EXISTS public.idx_productos_manual_override;
DROP INDEX IF EXISTS public.idx_productos_destacado_activo;
DROP INDEX IF EXISTS public.idx_productos_destacado;
DROP INDEX IF EXISTS public.idx_productos_categoria;
DROP INDEX IF EXISTS public.idx_productos_busqueda;
DROP INDEX IF EXISTS public.idx_productos_activo;
DROP INDEX IF EXISTS public.idx_producto_imagenes_producto;
DROP INDEX IF EXISTS public.idx_producto_imagenes_principal;
DROP INDEX IF EXISTS public.idx_producto_imagenes_orden;
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
DROP INDEX IF EXISTS public.idx_marcas_nombre_trgm;
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
DROP INDEX IF EXISTS public.idx_asesores_orden;
DROP INDEX IF EXISTS public.idx_asesores_activo;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_numero_documento_key;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_email_key;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_token_hash_key;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.producto_imagenes DROP CONSTRAINT IF EXISTS uq_producto_imagenes_producto_url;
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
ALTER TABLE IF EXISTS ONLY public.asesores DROP CONSTRAINT IF EXISTS asesores_pkey;
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
ALTER TABLE IF EXISTS public.asesores ALTER COLUMN id_asesor DROP DEFAULT;
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
DROP SEQUENCE IF EXISTS public.asesores_id_asesor_seq;
DROP TABLE IF EXISTS public.asesores;
DROP FUNCTION IF EXISTS public.update_asesores_timestamp();
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
DROP EXTENSION IF EXISTS pg_trgm;
--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: auth_method_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.auth_method_enum AS ENUM (
    'local',
    'google',
    'facebook',
    'github',
    'apple',
    'microsoft'
);


--
-- Name: auth_provider_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.auth_provider_enum AS ENUM (
    'google',
    'facebook',
    'github',
    'apple',
    'microsoft'
);


--
-- Name: estado_pago_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_pago_enum AS ENUM (
    'pendiente',
    'pagado',
    'fallido',
    'reembolsado'
);


--
-- Name: estado_pedido_enum; Type: TYPE; Schema: public; Owner: -
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


--
-- Name: genero_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.genero_enum AS ENUM (
    'M',
    'F',
    'Otro',
    'Prefiero no decir'
);


--
-- Name: metodo_pago_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.metodo_pago_enum AS ENUM (
    'efectivo',
    'tarjeta_credito',
    'tarjeta_debito',
    'transferencia',
    'pse',
    'contraentrega'
);


--
-- Name: posicion_banner_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.posicion_banner_enum AS ENUM (
    'hero',
    'sidebar',
    'footer',
    'popup'
);


--
-- Name: rol_usuario_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.rol_usuario_enum AS ENUM (
    'cliente',
    'vendedor',
    'admin'
);


--
-- Name: tipo_config_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_config_enum AS ENUM (
    'string',
    'number',
    'boolean',
    'json'
);


--
-- Name: tipo_descuento_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_descuento_enum AS ENUM (
    'porcentaje',
    'monto_fijo'
);


--
-- Name: tipo_direccion_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_direccion_enum AS ENUM (
    'casa',
    'trabajo',
    'otro'
);


--
-- Name: tipo_documento_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_documento_enum AS ENUM (
    'CC',
    'CE',
    'NIT',
    'Pasaporte'
);


--
-- Name: actualizar_calificacion_producto(integer); Type: FUNCTION; Schema: public; Owner: -
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


--
-- Name: actualizar_fecha_actualizacion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.actualizar_fecha_actualizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: after_pedido_estado_update(); Type: FUNCTION; Schema: public; Owner: -
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


--
-- Name: after_pedido_item_insert(); Type: FUNCTION; Schema: public; Owner: -
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


--
-- Name: after_resena_aprobada(); Type: FUNCTION; Schema: public; Owner: -
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


--
-- Name: find_or_create_oauth_user(public.auth_provider_enum, character varying, character varying, character varying, character varying, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
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
    SELECT u.id_usuario INTO v_existing_user_id
    FROM usuarios u WHERE u.email = p_email;
    
    IF v_existing_user_id IS NOT NULL THEN
        -- Usuario existe por email, vincular el nuevo proveedor
        INSERT INTO auth_providers (id_usuario, provider, provider_uid, email, nombre, avatar_url, raw_data)
        VALUES (v_existing_user_id, p_provider, p_provider_uid, p_email, p_nombre, p_avatar_url, p_raw_data)
        RETURNING auth_providers.id_provider INTO v_provider_id;
        
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
    RETURNING usuarios.id_usuario INTO v_user_id;
    
    -- Crear registro de proveedor
    INSERT INTO auth_providers (id_usuario, provider, provider_uid, email, nombre, avatar_url, raw_data)
    VALUES (v_user_id, p_provider, p_provider_uid, p_email, p_nombre, p_avatar_url, p_raw_data)
    RETURNING auth_providers.id_provider INTO v_provider_id;
    
    v_is_new := TRUE;
    
    RETURN QUERY SELECT v_user_id, v_is_new, v_provider_id;
END;
$$;


--
-- Name: generar_numero_pedido(); Type: FUNCTION; Schema: public; Owner: -
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


--
-- Name: link_oauth_provider(integer, public.auth_provider_enum, character varying, character varying, character varying, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
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
    RETURNING auth_providers.id_provider INTO v_provider_id;
    
    RETURN v_provider_id;
END;
$$;


--
-- Name: unlink_oauth_provider(integer, public.auth_provider_enum); Type: FUNCTION; Schema: public; Owner: -
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


--
-- Name: update_asesores_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_asesores_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asesores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asesores (
    id_asesor integer NOT NULL,
    nombre_completo character varying(100) NOT NULL,
    telefono character varying(20) NOT NULL,
    foto_url text,
    calificacion_promedio numeric(2,1) DEFAULT 5.0,
    total_calificaciones integer DEFAULT 0,
    activo boolean DEFAULT true,
    orden integer DEFAULT 0,
    especialidad character varying(100),
    horario_atencion character varying(100),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT asesores_calificacion_promedio_check CHECK (((calificacion_promedio >= (0)::numeric) AND (calificacion_promedio <= (5)::numeric)))
);


--
-- Name: TABLE asesores; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.asesores IS 'Tabla de asesores comerciales para atención al cliente';


--
-- Name: COLUMN asesores.calificacion_promedio; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.asesores.calificacion_promedio IS 'Promedio de calificaciones del asesor (0-5 estrellas)';


--
-- Name: COLUMN asesores.total_calificaciones; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.asesores.total_calificaciones IS 'Número total de calificaciones recibidas';


--
-- Name: COLUMN asesores.orden; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.asesores.orden IS 'Orden de aparición en el carrusel (menor = primero)';


--
-- Name: asesores_id_asesor_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asesores_id_asesor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asesores_id_asesor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asesores_id_asesor_seq OWNED BY public.asesores.id_asesor;


--
-- Name: atributos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.atributos (
    id_atributo integer NOT NULL,
    nombre character varying(255) NOT NULL,
    unidad character varying(50),
    tipo_dato character varying(50) DEFAULT 'texto'::character varying,
    id_categoria integer
);


--
-- Name: atributos_id_atributo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.atributos_id_atributo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: atributos_id_atributo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.atributos_id_atributo_seq OWNED BY public.atributos.id_atributo;


--
-- Name: auth_providers; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: auth_providers_id_provider_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auth_providers_id_provider_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auth_providers_id_provider_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auth_providers_id_provider_seq OWNED BY public.auth_providers.id_provider;


--
-- Name: banners; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: banners_id_banner_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banners_id_banner_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: banners_id_banner_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.banners_id_banner_seq OWNED BY public.banners.id_banner;


--
-- Name: carrito; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carrito (
    id_carrito integer NOT NULL,
    id_usuario integer,
    session_id character varying(255),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: carrito_id_carrito_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carrito_id_carrito_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carrito_id_carrito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carrito_id_carrito_seq OWNED BY public.carrito.id_carrito;


--
-- Name: carrito_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carrito_items (
    id_item integer NOT NULL,
    id_carrito integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad integer DEFAULT 1 NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    fecha_agregado timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: carrito_items_id_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carrito_items_id_item_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carrito_items_id_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carrito_items_id_item_seq OWNED BY public.carrito_items.id_item;


--
-- Name: categorias; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: categorias_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categorias_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categorias_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categorias_id_categoria_seq OWNED BY public.categorias.id_categoria;


--
-- Name: configuracion; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: configuracion_id_config_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.configuracion_id_config_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: configuracion_id_config_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.configuracion_id_config_seq OWNED BY public.configuracion.id_config;


--
-- Name: cupon_usos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cupon_usos (
    id_uso integer NOT NULL,
    id_cupon integer NOT NULL,
    id_usuario integer NOT NULL,
    id_pedido integer NOT NULL,
    monto_descuento numeric(12,2) NOT NULL,
    fecha_uso timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: cupon_usos_id_uso_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cupon_usos_id_uso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cupon_usos_id_uso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cupon_usos_id_uso_seq OWNED BY public.cupon_usos.id_uso;


--
-- Name: cupones; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: cupones_id_cupon_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cupones_id_cupon_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cupones_id_cupon_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cupones_id_cupon_seq OWNED BY public.cupones.id_cupon;


--
-- Name: direcciones; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: direcciones_id_direccion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.direcciones_id_direccion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: direcciones_id_direccion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.direcciones_id_direccion_seq OWNED BY public.direcciones.id_direccion;


--
-- Name: favoritos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favoritos (
    id_favorito integer NOT NULL,
    id_usuario integer NOT NULL,
    id_producto integer NOT NULL,
    fecha_agregado timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: favoritos_id_favorito_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favoritos_id_favorito_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favoritos_id_favorito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favoritos_id_favorito_seq OWNED BY public.favoritos.id_favorito;


--
-- Name: logs_actividad; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: logs_actividad_id_log_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.logs_actividad_id_log_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: logs_actividad_id_log_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.logs_actividad_id_log_seq OWNED BY public.logs_actividad.id_log;


--
-- Name: marcas; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: marcas_id_marca_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.marcas_id_marca_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: marcas_id_marca_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.marcas_id_marca_seq OWNED BY public.marcas.id_marca;


--
-- Name: newsletter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter (
    id_suscriptor integer NOT NULL,
    email character varying(255) NOT NULL,
    nombre character varying(100),
    activo boolean DEFAULT true,
    fecha_suscripcion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_baja timestamp without time zone
);


--
-- Name: newsletter_id_suscriptor_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.newsletter_id_suscriptor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: newsletter_id_suscriptor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.newsletter_id_suscriptor_seq OWNED BY public.newsletter.id_suscriptor;


--
-- Name: pedido_historial; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: pedido_historial_id_historial_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pedido_historial_id_historial_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pedido_historial_id_historial_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pedido_historial_id_historial_seq OWNED BY public.pedido_historial.id_historial;


--
-- Name: pedido_items; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: pedido_items_id_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pedido_items_id_item_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pedido_items_id_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pedido_items_id_item_seq OWNED BY public.pedido_items.id_item;


--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: pedidos_id_pedido_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pedidos_id_pedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pedidos_id_pedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pedidos_id_pedido_seq OWNED BY public.pedidos.id_pedido;


--
-- Name: producto_atributos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.producto_atributos (
    id_producto_atributo integer NOT NULL,
    id_producto integer NOT NULL,
    id_atributo integer NOT NULL,
    valor_texto text,
    valor_numero numeric(12,2),
    valor_booleano boolean
);


--
-- Name: producto_atributos_id_producto_atributo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.producto_atributos_id_producto_atributo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: producto_atributos_id_producto_atributo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.producto_atributos_id_producto_atributo_seq OWNED BY public.producto_atributos.id_producto_atributo;


--
-- Name: producto_imagenes; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: producto_imagenes_id_imagen_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.producto_imagenes_id_imagen_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: producto_imagenes_id_imagen_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.producto_imagenes_id_imagen_seq OWNED BY public.producto_imagenes.id_imagen;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: -
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
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    specs jsonb DEFAULT '{}'::jsonb,
    componentes jsonb DEFAULT '[]'::jsonb,
    manual_override boolean DEFAULT false,
    fuente_scrape text,
    ultima_actualizacion_scrape timestamp without time zone
);


--
-- Name: productos_id_producto_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.productos_id_producto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: productos_id_producto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.productos_id_producto_seq OWNED BY public.productos.id_producto;


--
-- Name: resenas; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: resenas_id_resena_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.resenas_id_resena_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: resenas_id_resena_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.resenas_id_resena_seq OWNED BY public.resenas.id_resena;


--
-- Name: sede_inventario; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: sede_inventario_id_inventario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sede_inventario_id_inventario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sede_inventario_id_inventario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sede_inventario_id_inventario_seq OWNED BY public.sede_inventario.id_inventario;


--
-- Name: sedes; Type: TABLE; Schema: public; Owner: -
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
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    link_google_maps text
);


--
-- Name: sedes_id_sede_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sedes_id_sede_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sedes_id_sede_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sedes_id_sede_seq OWNED BY public.sedes.id_sede;


--
-- Name: subcategorias; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: subcategorias_id_subcategoria_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subcategorias_id_subcategoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subcategorias_id_subcategoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subcategorias_id_subcategoria_seq OWNED BY public.subcategorias.id_subcategoria;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: user_sessions_id_session_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_sessions_id_session_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_sessions_id_session_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_sessions_id_session_seq OWNED BY public.user_sessions.id_session;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
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
    token_verificacion character varying(255),
    token_recuperacion character varying(255),
    fecha_ultimo_acceso timestamp without time zone,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    auth_method public.auth_method_enum DEFAULT 'local'::public.auth_method_enum,
    fecha_recuperacion_expira timestamp without time zone
);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: vista_pedidos_completa; Type: VIEW; Schema: public; Owner: -
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


--
-- Name: vista_productos_completa; Type: VIEW; Schema: public; Owner: -
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


--
-- Name: asesores id_asesor; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asesores ALTER COLUMN id_asesor SET DEFAULT nextval('public.asesores_id_asesor_seq'::regclass);


--
-- Name: atributos id_atributo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atributos ALTER COLUMN id_atributo SET DEFAULT nextval('public.atributos_id_atributo_seq'::regclass);


--
-- Name: auth_providers id_provider; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_providers ALTER COLUMN id_provider SET DEFAULT nextval('public.auth_providers_id_provider_seq'::regclass);


--
-- Name: banners id_banner; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners ALTER COLUMN id_banner SET DEFAULT nextval('public.banners_id_banner_seq'::regclass);


--
-- Name: carrito id_carrito; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrito ALTER COLUMN id_carrito SET DEFAULT nextval('public.carrito_id_carrito_seq'::regclass);


--
-- Name: carrito_items id_item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrito_items ALTER COLUMN id_item SET DEFAULT nextval('public.carrito_items_id_item_seq'::regclass);


--
-- Name: categorias id_categoria; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id_categoria SET DEFAULT nextval('public.categorias_id_categoria_seq'::regclass);


--
-- Name: configuracion id_config; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion ALTER COLUMN id_config SET DEFAULT nextval('public.configuracion_id_config_seq'::regclass);


--
-- Name: cupon_usos id_uso; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cupon_usos ALTER COLUMN id_uso SET DEFAULT nextval('public.cupon_usos_id_uso_seq'::regclass);


--
-- Name: cupones id_cupon; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cupones ALTER COLUMN id_cupon SET DEFAULT nextval('public.cupones_id_cupon_seq'::regclass);


--
-- Name: direcciones id_direccion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direcciones ALTER COLUMN id_direccion SET DEFAULT nextval('public.direcciones_id_direccion_seq'::regclass);


--
-- Name: favoritos id_favorito; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoritos ALTER COLUMN id_favorito SET DEFAULT nextval('public.favoritos_id_favorito_seq'::regclass);


--
-- Name: logs_actividad id_log; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs_actividad ALTER COLUMN id_log SET DEFAULT nextval('public.logs_actividad_id_log_seq'::regclass);


--
-- Name: marcas id_marca; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marcas ALTER COLUMN id_marca SET DEFAULT nextval('public.marcas_id_marca_seq'::regclass);


--
-- Name: newsletter id_suscriptor; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter ALTER COLUMN id_suscriptor SET DEFAULT nextval('public.newsletter_id_suscriptor_seq'::regclass);


--
-- Name: pedido_historial id_historial; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_historial ALTER COLUMN id_historial SET DEFAULT nextval('public.pedido_historial_id_historial_seq'::regclass);


--
-- Name: pedido_items id_item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_items ALTER COLUMN id_item SET DEFAULT nextval('public.pedido_items_id_item_seq'::regclass);


--
-- Name: pedidos id_pedido; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN id_pedido SET DEFAULT nextval('public.pedidos_id_pedido_seq'::regclass);


--
-- Name: producto_atributos id_producto_atributo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_atributos ALTER COLUMN id_producto_atributo SET DEFAULT nextval('public.producto_atributos_id_producto_atributo_seq'::regclass);


--
-- Name: producto_imagenes id_imagen; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_imagenes ALTER COLUMN id_imagen SET DEFAULT nextval('public.producto_imagenes_id_imagen_seq'::regclass);


--
-- Name: productos id_producto; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos ALTER COLUMN id_producto SET DEFAULT nextval('public.productos_id_producto_seq'::regclass);


--
-- Name: resenas id_resena; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resenas ALTER COLUMN id_resena SET DEFAULT nextval('public.resenas_id_resena_seq'::regclass);


--
-- Name: sede_inventario id_inventario; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sede_inventario ALTER COLUMN id_inventario SET DEFAULT nextval('public.sede_inventario_id_inventario_seq'::regclass);


--
-- Name: sedes id_sede; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sedes ALTER COLUMN id_sede SET DEFAULT nextval('public.sedes_id_sede_seq'::regclass);


--
-- Name: subcategorias id_subcategoria; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategorias ALTER COLUMN id_subcategoria SET DEFAULT nextval('public.subcategorias_id_subcategoria_seq'::regclass);


--
-- Name: user_sessions id_session; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id_session SET DEFAULT nextval('public.user_sessions_id_session_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Data for Name: asesores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asesores (id_asesor, nombre_completo, telefono, foto_url, calificacion_promedio, total_calificaciones, activo, orden, especialidad, horario_atencion, fecha_creacion, fecha_actualizacion) FROM stdin;
1	María González	+573001234567	https://ui-avatars.com/api/?name=Maria+Gonzalez&background=0D8ABC&color=fff&size=200	4.8	156	t	1	Electrohogar	Lun-Vie 8am-6pm, Sáb 9am-1pm	2026-01-17 15:17:42.806713	2026-01-17 15:17:42.806713
2	Carlos Rodríguez	+573007654321	https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=4CAF50&color=fff&size=200	4.9	203	t	2	Motos	Lun-Sáb 8am-6pm	2026-01-17 15:17:42.806713	2026-01-17 15:17:42.806713
3	Ana Martínez	+573009876543	https://ui-avatars.com/api/?name=Ana+Martinez&background=FF5722&color=fff&size=200	4.7	98	t	3	Muebles	Lun-Vie 9am-5pm	2026-01-17 15:17:42.806713	2026-01-17 15:17:42.806713
4	Juan Pérez	+573002345678	https://ui-avatars.com/api/?name=Juan+Perez&background=9C27B0&color=fff&size=200	5.0	45	t	4	Herramientas	Lun-Vie 8am-6pm, Sáb 9am-2pm	2026-01-17 15:17:42.806713	2026-01-17 15:17:42.806713
\.


--
-- Data for Name: atributos; Type: TABLE DATA; Schema: public; Owner: -
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
48	Temperatura Máxima	°C	texto	1
49	Gas Refrigerante	\N	texto	1
50	Tipo de Instalación	\N	texto	1
51	Tipo de Carga	\N	texto	1
52	Sistema de Enfriamiento	\N	texto	1
59	Tipo de Ventilador	\N	texto	1
60	Velocidades	\N	numero	1
61	Oscilación	\N	booleano	1
62	Temporizador	\N	texto	1
72	Cilindraje	CC	numero	3
73	Potencia Máxima	HP	texto	3
74	Torque Máximo	NM	texto	3
75	Velocidad Sin Carga	RPM	texto	3
76	Cilindraje	CC	numero	3
77	Potencia Máxima	HP	texto	3
78	Torque Máximo	NM	texto	3
86	Bluetooth	\N	booleano	1
87	Bluetooth	\N	booleano	1
88	Potencia Kw	kW	numero	4
89	Combustible	\N	texto	4
90	Longitud Espada	cm	numero	4
91	Tipo Motor	\N	numero	4
92	Potencia	HP	numero	3
93	Combustible	\N	texto	3
94	Peso	kg	numero	3
95	Sistema de Frenos	\N	texto	3
96	Tipo de Arranque	\N	texto	3
97	Año	\N	numero	3
98	Codigo de barras	\N	texto	\N
99	Pantalla tipo	\N	texto	\N
100	Pantalla resolucion	\N	texto	\N
101	Pantalla retroiluminacion	\N	texto	\N
102	Pantalla tasa refresco	\N	texto	\N
103	Procesamiento procesador	\N	texto	\N
104	Procesamiento hdr	\N	texto	\N
105	Procesamiento escalador ai	\N	texto	\N
106	Procesamiento modos imagen	\N	texto	\N
107	Sonido potencia	\N	texto	\N
108	Sonido sistema altavoces	\N	texto	\N
109	Sonido tecnologias	\N	texto	\N
110	Smart tv sistema operativo	\N	texto	\N
111	Smart tv thinq ai	\N	texto	\N
112	Smart tv reconocimiento voz	\N	texto	\N
113	Smart tv magic remote	\N	texto	\N
114	Smart tv conectividad hogar	\N	texto	\N
115	Conectividad hdmi	\N	texto	\N
116	Conectividad usb	\N	texto	\N
117	Conectividad wifi	\N	texto	\N
118	Conectividad bluetooth	\N	texto	\N
119	Conectividad otros	\N	texto	\N
120	Pantalla pulgadas	\N	texto	\N
121	Pantalla cm	\N	texto	\N
122	Procesamiento escalador	\N	texto	\N
123	Sonido canales	\N	texto	\N
124	Smart tv navegador web	\N	texto	\N
125	Smart tv apps	\N	texto	\N
126	Procesamiento escalado	\N	texto	\N
127	Procesamiento filmmaker mode	\N	texto	\N
128	Videojuegos vrr	\N	texto	\N
129	Videojuegos allm	\N	texto	\N
130	Videojuegos optimizador juegos	\N	texto	\N
131	Videojuegos hgig	\N	texto	\N
132	Sonido ai sound	\N	texto	\N
133	Sonido wow orquesta	\N	texto	\N
134	Sonido afinacion acustica ia	\N	texto	\N
135	Smart tv ia features	\N	texto	\N
136	Smart tv hogar inteligente	\N	texto	\N
137	Dimensiones peso sin soporte	\N	texto	\N
138	Dimensiones peso con soporte	\N	texto	\N
139	Dimensiones peso peso sin soporte	\N	texto	\N
140	Dimensiones peso vesa	\N	texto	\N
141	Conectividad ethernet	\N	texto	\N
142	Sonido sistema	\N	texto	\N
143	Sonido afinacion ia	\N	texto	\N
144	Smart tv os	\N	texto	\N
145	Smart tv thinq app	\N	texto	\N
146	Smart tv google cast	\N	texto	\N
147	Smart tv apple airplay	\N	texto	\N
148	Dimensiones sin soporte	\N	texto	\N
149	Dimensiones con soporte	\N	texto	\N
150	Dimensiones vesa	\N	texto	\N
151	Pantalla gama colores	\N	texto	\N
152	Smart tv alexa built in	\N	texto	\N
153	Videojuegos optimizador	\N	texto	\N
154	Dimensiones peso total	\N	texto	\N
155	Pantalla gama	\N	texto	\N
156	Dimensiones peso	\N	texto	\N
157	Procesamiento hfr	\N	texto	\N
158	Videojuegos freesync	\N	texto	\N
159	Sonido tecnologia	\N	texto	\N
160	Sonido wisa ready	\N	texto	\N
161	Smart tv multi view	\N	texto	\N
162	Dimensiones peso neto	\N	texto	\N
163	Funciones party karaoke star	\N	texto	\N
164	Funciones party efectos vocales	\N	texto	\N
165	Funciones party cancelador voz	\N	texto	\N
166	Funciones party luces rgb	\N	texto	\N
167	Conectividad entrada guitarra	\N	texto	\N
168	Conectividad entrada mic	\N	texto	\N
169	Sonido modos eq	\N	texto	\N
170	Sonido wireless party link	\N	texto	\N
171	Dimensiones producto	\N	texto	\N
172	Audio avanzado dolby audio	\N	texto	\N
173	Audio avanzado sound sync optico	\N	texto	\N
174	Audio avanzado entrada optica	\N	texto	\N
175	Karaoke y dj efectos vocales	\N	texto	\N
176	Karaoke y dj dj pad	\N	texto	\N
177	Karaoke y dj multi bluetooth	\N	texto	\N
178	Audio canales	\N	texto	\N
179	Audio potencia	\N	texto	\N
180	Audio eq	\N	texto	\N
181	Resistencia y bateria certificacion	\N	texto	\N
182	Resistencia y bateria duracion bateria	\N	texto	\N
183	Resistencia y bateria tiempo carga	\N	texto	\N
184	Conectividad multi point	\N	texto	\N
185	Conectividad comandos voz	\N	texto	\N
186	Conectividad party link	\N	texto	\N
187	Dimensiones parlante	\N	texto	\N
188	Accesorios	\N	texto	\N
189	Audio numero de canales	\N	texto	\N
190	Audio potencia de salida	\N	texto	\N
191	Audio formatos compatibles	\N	texto	\N
192	Audio ecualizacion	\N	texto	\N
193	Altavoz hardware radiador pasivo	\N	texto	\N
194	Altavoz hardware tweeter	\N	texto	\N
195	Altavoz hardware woofer	\N	texto	\N
196	Resistencia y bateria certificacion ip	\N	texto	\N
197	Resistencia y bateria resistencia adicional	\N	texto	\N
198	Resistencia y bateria tiempo de carga	\N	texto	\N
199	Conectividad y funciones version bluetooth	\N	texto	\N
200	Conectividad y funciones multipunto	\N	texto	\N
201	Conectividad y funciones party link	\N	texto	\N
202	Conectividad y funciones comandos de voz	\N	texto	\N
203	Conectividad y funciones funciones extra	\N	texto	\N
204	Dimensiones y peso dimensiones producto	\N	texto	\N
205	Dimensiones y peso peso neto	\N	texto	\N
206	Dimensiones y peso peso bruto	\N	texto	\N
207	Fuente de alimentacion puerto	\N	texto	\N
208	Fuente de alimentacion salida dc powerbank	\N	texto	\N
209	Fuente de alimentacion consumo encendido	\N	texto	\N
210	Accesorios incluidos	\N	texto	\N
211	Audio potencia salida	\N	texto	\N
212	Audio unidades	\N	texto	\N
213	Conectividad aux 3.5mm	\N	texto	\N
214	Bateria y energia duracion	\N	texto	\N
215	Bateria y energia tiempo carga	\N	texto	\N
216	Bateria y energia consumo encendido	\N	texto	\N
217	Dimensiones y peso producto	\N	texto	\N
218	Otros resistencia	\N	texto	\N
219	Otros iluminacion	\N	texto	\N
220	Otros app control	\N	texto	\N
221	Dimensiones	\N	texto	\N
222	Motor	\N	texto	\N
223	Tecnologias	\N	texto	\N
224	Caracteristicas motor	\N	texto	\N
225	Caracteristicas tambor	\N	texto	\N
226	Caracteristicas diagnostico	\N	texto	\N
227	Caracteristicas puerta	\N	texto	\N
228	Tecnologia inteligente ia	\N	texto	\N
229	Tecnologia inteligente conectividad	\N	texto	\N
230	Tecnologia inteligente motor	\N	texto	\N
231	Funciones lavado	\N	texto	\N
232	Caracteristicas	\N	texto	\N
233	Funciones especiales	\N	texto	\N
234	Capacidad lavado	\N	texto	\N
235	Capacidad secado	\N	texto	\N
236	Tecnologia motor tipo	\N	texto	\N
237	Tecnologia motor movimientos	\N	texto	\N
238	Tecnologia motor garantia	\N	texto	\N
239	Caracteristicas especiales ia	\N	texto	\N
240	Caracteristicas especiales vapor	\N	texto	\N
241	Caracteristicas especiales lavado rapido	\N	texto	\N
242	Caracteristicas especiales conectividad	\N	texto	\N
243	Eficiencia	\N	texto	\N
244	Potencia salida	\N	texto	\N
245	Potencia consumo	\N	texto	\N
246	Tecnologia limpieza	\N	texto	\N
247	Control	\N	texto	\N
248	Funciones	\N	texto	\N
249	Capacidad total	\N	texto	\N
250	Enfriamiento	\N	texto	\N
251	Conveniencia dispensador agua	\N	texto	\N
252	Conveniencia pantalla	\N	texto	\N
253	Conveniencia ia smart	\N	texto	\N
254	Acabado	\N	texto	\N
255	Tecnologia	\N	texto	\N
256	Iluminacion	\N	texto	\N
257	Pantalla	\N	texto	\N
258	Eficiencia energetica	\N	texto	\N
259	Smart features	\N	texto	\N
260	Dispensador	\N	texto	\N
261	Tipo	\N	texto	\N
262	Hielo maquina automatica	\N	texto	\N
263	Hielo capacidad almacenaje	\N	texto	\N
264	Hielo filtro	\N	texto	\N
265	Material puerta	\N	texto	\N
266	Especificaciones basicas grado consumo energia	\N	texto	\N
267	Especificaciones basicas tipo producto	\N	texto	\N
268	Especificaciones basicas profundidad estante	\N	texto	\N
269	Capacidad volumen refrigerador	\N	texto	\N
270	Capacidad total almacenamiento	\N	texto	\N
271	Dimensiones peso dimensiones mm	\N	texto	\N
272	Dimensiones peso peso producto kg	\N	texto	\N
273	Dimensiones peso peso paquete kg	\N	texto	\N
274	Caracteristicas enfriamiento instaview	\N	texto	\N
275	Caracteristicas enfriamiento door cooling	\N	texto	\N
276	Caracteristicas enfriamiento door in door	\N	texto	\N
277	Caracteristicas enfriamiento compresor	\N	texto	\N
278	Agua y hielo maquina hielo	\N	texto	\N
279	Agua y hielo dispensador agua	\N	texto	\N
280	Tecnologia smart thinq wifi	\N	texto	\N
281	Tecnologia smart smart diagnosis	\N	texto	\N
282	Acabado color puerta	\N	texto	\N
283	Acabado material	\N	texto	\N
284	Capacidad volumen congelador	\N	texto	\N
285	Caracteristicas especiales instaview	\N	texto	\N
286	Caracteristicas especiales door in door	\N	texto	\N
287	Caracteristicas especiales uv nano	\N	texto	\N
288	Caracteristicas especiales hygiene fresh	\N	texto	\N
289	Agua y hielo dispensador	\N	texto	\N
290	Agua y hielo luz dispensador	\N	texto	\N
291	Acabado metal fresh	\N	texto	\N
63	Diámetro del Disco	Pulgadas	texto	\N
64	Mandril	Pulgadas	texto	\N
65	Temperatura Máxima	°C	numero	\N
69	Torque Máximo	Nm	numero	\N
70	Velocidad Sin Carga	RPM	texto	\N
71	Longitud Manguera	Metros	numero	\N
292	Tamaño alto	\N	texto	\N
293	Tamaño ancho	\N	texto	\N
294	Tamaño profundo	\N	texto	\N
295	Dispensador agua	\N	texto	\N
296	Generador hielo	\N	texto	\N
297	Todas Ancho	\N	texto	\N
298	Todas Referencia	\N	texto	\N
299	Todas Tipo consumo energético	\N	texto	\N
300	Todas EAN	\N	texto	\N
301	Todas Código	\N	texto	\N
302	Todas Alto	\N	texto	\N
303	Todas Dispensador de Agua	\N	texto	\N
304	Todas Iluminación	\N	texto	\N
305	Todas Panel de Control	\N	texto	\N
306	Todas Consumo Energía	\N	texto	\N
307	Todas Capacidad neta en litros	\N	texto	\N
308	Todas Capacidad neta congelador	\N	texto	\N
309	Todas Capacidad neta refrigerador	\N	texto	\N
310	Todas Material De Las Bandejas	\N	texto	\N
311	Todas Panel Digital	\N	texto	\N
312	Todas Cantidad Puertas	\N	texto	\N
313	Todas Fabricador De Hielo	\N	texto	\N
314	Todas Peso	\N	texto	\N
315	Todas País de origen	\N	texto	\N
316	Todas Profundo	\N	texto	\N
317	Todas Material	\N	texto	\N
318	Todas Capacidad bruta En Litros	\N	texto	\N
319	Todas Color	\N	texto	\N
320	Todas Clasificación energetica	\N	texto	\N
321	Todas Tipo de producto	\N	texto	\N
322	Todas Tipo de Refrigeración	\N	texto	\N
323	Todas Característica a destacar	\N	texto	\N
324	Todas Garantía	\N	texto	\N
325	Todas Numero filtros	\N	texto	\N
326	Todas Potencia iluminación	\N	texto	\N
327	Todas Tipo de encendido	\N	texto	\N
328	Todas Peso (kg)	\N	texto	\N
329	Todas Tipo de sistema	\N	texto	\N
330	Todas Numero velocidades	\N	texto	\N
331	Todas Tipo	\N	texto	\N
332	Error	\N	texto	\N
333	Todas Capacidad en libras	\N	texto	\N
334	Todas Línea	\N	texto	\N
335	Todas Tipo de panel	\N	texto	\N
336	Todas Número de ciclos	\N	texto	\N
337	Todas Programas	\N	texto	\N
338	Todas Capacidad en Kilogramos	\N	texto	\N
339	Todas Sistemas de seguridad	\N	texto	\N
340	Todas Dimensiones de Ruteo (Ancho X Profundo)	\N	texto	\N
341	Todas Tipo cubierta	\N	texto	\N
342	Todas Tipo de conexión	\N	texto	\N
343	Todas Cantidad quemadores	\N	texto	\N
344	Todas Voltaje	\N	texto	\N
345	Todas Tipo de parrilla	\N	texto	\N
346	Todas Medida	\N	texto	\N
347	Todas Encendido automático	\N	texto	\N
348	Todas Uso de baterías	\N	texto	\N
349	Todas Control De Temperatura	\N	texto	\N
350	Todas Tipo calentador	\N	texto	\N
351	Todas Requiere ducto de evacuación	\N	texto	\N
352	Todas Tecnología modulante	\N	texto	\N
353	Todas Mecanismo de evacuación	\N	texto	\N
354	Todas Capacidad	\N	texto	\N
355	Todas Tipo de Gas	\N	texto	\N
356	Todas Vídeo genérico categoría	\N	texto	\N
357	Tipo estructura	\N	texto	\N
358	Tela	\N	texto	\N
359	Uso	\N	texto	\N
360	Antiacaros	\N	texto	\N
361	Medida ancho largo	\N	texto	\N
362	Altura borde	\N	texto	\N
363	Motor cilindraje	\N	texto	\N
364	Motor tipo de motor	\N	texto	\N
365	Motor potencia	\N	texto	\N
366	Motor torque	\N	texto	\N
367	Motor relacion de compresion	\N	texto	\N
368	Motor tipo de transmision	\N	texto	\N
369	Caracteristicas adicionales tipo de arranque	\N	texto	\N
370	Caracteristicas adicionales certificacion	\N	texto	\N
371	Caracteristicas adicionales colores	\N	texto	\N
372	Dimensiones rueda delantera	\N	texto	\N
373	Dimensiones rueda trasera	\N	texto	\N
374	Dimensiones dimension total	\N	texto	\N
375	Dimensiones distancia entre ejes	\N	texto	\N
376	Seguridad freno delantero	\N	texto	\N
377	Seguridad freno trasero	\N	texto	\N
378	Seguridad tipo de suspension delantera	\N	texto	\N
379	Seguridad tipo de suspension trasera	\N	texto	\N
380	Tecnologia y confort tablero instrumentos	\N	texto	\N
381	Tecnologia y confort conectividad	\N	texto	\N
382	Tecnologia y confort puerto usb	\N	texto	\N
383	Tecnologia y confort capacidad baul	\N	texto	\N
384	Tecnologia y confort iluminacion	\N	texto	\N
385	Fabricante	\N	texto	\N
386	Categoría	\N	texto	\N
387	Subcategoría	\N	texto	\N
388	Control por voz con Google Assistant integrado	\N	texto	\N
389	Dolby Audio con potencia de 20 W	\N	texto	\N
390	Sintonizador DVB‑T2 integrado	\N	texto	\N
391	Capacidad 43 Litros	\N	texto	\N
392	Potencia 70 W	\N	texto	\N
393	Refrigerante R600a	\N	texto	\N
394	Refrigerador y congelador	\N	texto	\N
395	Incluye accesorios	\N	texto	\N
396	Nota	\N	texto	\N
397	Detalles	\N	texto	\N
398	Ideal para preparaciones saludables	\N	texto	\N
399	Potencia de 1500 W	\N	texto	\N
400	Capacidad 3.5 Litros	\N	texto	\N
401	Temporizador de 60 min y Apagado Automático	\N	texto	\N
402	Temperatura hasta 200°C	\N	texto	\N
403	Indicador luminoso de encendido	\N	texto	\N
404	Flujo de aire constante y circular	\N	texto	\N
405	Cesta interior y base antiadherente	\N	texto	\N
406	Características ideales	\N	texto	\N
407	Salidas de aire caliente	\N	texto	\N
408	Mango antideslizante	\N	texto	\N
409	Suiche de seguridad	\N	texto	\N
410	Color negro y plateado	\N	texto	\N
411	Medidas y peso del empaque	\N	texto	\N
412	Medidas y peso del producto	\N	texto	\N
413	6 opciones de cocción programadas	\N	texto	\N
414	Botellón Superior	\N	texto	\N
415	Dispensador de agua Kalley con botellón superior	\N	texto	\N
416	Enfriamiento por compresor	\N	texto	\N
417	Dispensador de agua fría y caliente	\N	texto	\N
418	Potencia de enfriamiento	\N	texto	\N
419	Potencia de calentamiento	\N	texto	\N
420	Capacidad de calentamiento 90 °C   5 l/h	\N	texto	\N
421	Gabinete de almacenamiento de 8.4 litros	\N	texto	\N
422	Potencia de enfriamiento 75W	\N	texto	\N
423	Capacidad de enfriamiento 10 °C   2 l/h	\N	texto	\N
424	Potencia de lavado	\N	texto	\N
425	Potencia centrifigurado	\N	texto	\N
426	Lavadora semi automática Kalley	\N	texto	\N
427	Tanques independientes	\N	texto	\N
428	Clasificación energética tipo A	\N	texto	\N
429	Panel de control digital	\N	texto	\N
430	Dispensador para detergente en polvo y líquido	\N	texto	\N
431	Temporizador de encendido	\N	texto	\N
432	Bloqueo para niños	\N	texto	\N
433	Limpieza de tambor (Klean+)	\N	texto	\N
434	Diseño Magic Care Tube	\N	texto	\N
435	Filtro atrapa motas	\N	texto	\N
436	Tecnología FUZZY	\N	texto	\N
437	Tecnología No Frost	\N	texto	\N
438	Sistema de flujo de aire múltiple	\N	texto	\N
439	Iluminación LED interior	\N	texto	\N
440	Panel de control y pantalla LED digital	\N	texto	\N
441	Ruedas + Soportes de nivelación ajustables	\N	texto	\N
442	Tipo de producto	\N	texto	\N
443	Potencia de 60 Watts	\N	texto	\N
444	Sistema 2 en 1 con tecnología MAXX	\N	texto	\N
445	3 velocidades ajustables	\N	texto	\N
446	Oscilación horizontal e inclinable	\N	texto	\N
447	Sistema de inclinación vertical	\N	texto	\N
448	Malla frontal removible	\N	texto	\N
449	Tamaño de aspas de 16 pulgadas	\N	texto	\N
450	Funcionamiento alámbrico	\N	texto	\N
451	Temporizador máximo	\N	texto	\N
452	Tamaño de aspas	\N	texto	\N
453	Potencia 200 W	\N	texto	\N
454	3 velocidades	\N	texto	\N
455	Flujo de aire de alta velocidad	\N	texto	\N
456	120° de inclinación	\N	texto	\N
457	Aspas de 20"	\N	texto	\N
458	Ventilador de metal reforzado	\N	texto	\N
459	Dimensiones y pesos	\N	texto	\N
460	Ventilador de torre Kalley	\N	texto	\N
461	Control total y comodidad a tu alcance	\N	texto	\N
462	Interruptor	\N	texto	\N
463	Giratorio	\N	texto	\N
464	Potencia 230 W	\N	texto	\N
465	Aspas de 26 pulgadas	\N	texto	\N
466	Estructura desarmable y rejilla metálica	\N	texto	\N
467	Giro manual 90°	\N	texto	\N
468	Detalles Técnicos	\N	texto	\N
469	Tensión nominal	\N	texto	\N
470	Tensión máx.	\N	texto	\N
471	Consumo de potencia	\N	texto	\N
472	Sistema de acumulador	\N	texto	\N
473	Peso del dispositivo sin batería	\N	texto	\N
474	Longitud de la espada	\N	texto	\N
475	Ancho de ranura	\N	texto	\N
476	Cortes máx. por carga de batería AS 2	\N	texto	\N
477	Peso de la unidad sin combustible	\N	texto	\N
478	Diámetro del círculo de corte	\N	texto	\N
479	Cabida del depósito	\N	texto	\N
480	Cabida del depósito:	\N	texto	\N
481	Largo del dispositivo sin herramienta de corte	\N	texto	\N
482	Nivel de presión sonora	\N	texto	\N
483	Nivel de potencia acústica	\N	texto	\N
484	Valor de vibraciones del lado izquierdo en servicio con diestros	\N	texto	\N
485	Valor de vibraciones del lado derecho en servicio con diestros	\N	texto	\N
486	CO2	\N	texto	\N
487	Peso del sistema, sin combustible	\N	texto	\N
488	Relación peso/potencia	\N	texto	\N
489	Paso de cadena de aserrado	\N	texto	\N
490	Longitud del dispositivo con tope de garra	\N	texto	\N
491	Valor de vibraciones, izquierda	\N	texto	\N
492	Valor de vibraciones, derecha	\N	texto	\N
493	Acumulador recomendado	\N	texto	\N
494	Tiempo máx. de funcionamiento de la batería AK 10	\N	texto	\N
495	Tiempo máx. de funcionamiento de la batería AK 20	\N	texto	\N
496	Tiempo máx. de funcionamiento de la batería AK 30	\N	texto	\N
497	Tiempo máx. de funcionamiento de la batería AK 30 S	\N	texto	\N
498	Diámetro herramienta de acople	\N	texto	\N
499	Ancho del dispositivo	\N	texto	\N
500	Altura del dispositivo	\N	texto	\N
501	Caudal de aire sin sistema	\N	texto	\N
502	Alcance de atomizado horizontal máx.	\N	texto	\N
503	Tensión de red	\N	texto	\N
504	Peso del dispositivo con cable	\N	texto	\N
505	Depresión máx.	\N	texto	\N
506	Caudal volumétrico en la turbina	\N	texto	\N
507	Volumen del depósito	\N	texto	\N
508	Grado de protección IP	\N	texto	\N
509	Longitud del tubo flexible de aspiración	\N	texto	\N
510	Diámetro del tubo flexible	\N	texto	\N
511	Frecuencia de carreras	\N	texto	\N
512	Longitud de corte	\N	texto	\N
513	Distancia entre dientes	\N	texto	\N
514	Largo del dispositivo con cuchillo	\N	texto	\N
515	Cantidad de fases	\N	texto	\N
516	Número de revoluciones	\N	texto	\N
517	Peso del dispositivo sin cable	\N	texto	\N
518	Presión de trabajo	\N	texto	\N
519	Presión máx.	\N	texto	\N
520	Caudal de agua de paso mín.	\N	texto	\N
521	Caudal de agua de paso máx.	\N	texto	\N
522	Temperatura del agua de afluencia máx.	\N	texto	\N
523	Frecuencia	\N	texto	\N
524	Longitud del tubo flexible de alta presión	\N	texto	\N
525	Longitud de cable	\N	texto	\N
526	Valor K (nivel de presión acústica)	\N	texto	\N
527	Valor K (nivel de potencia acústica)	\N	texto	\N
528	Accionamiento	\N	texto	\N
529	Superficie de césped máx.	\N	texto	\N
530	Ancho de corte	\N	texto	\N
531	Altura de corte	\N	texto	\N
532	Régimen nominal herramienta de trabajo	\N	texto	\N
533	Volumen colector de hierba	\N	texto	\N
534	Ancho del dispositivo sin archivos adjuntos	\N	texto	\N
535	Altura máx. del dispositivo	\N	texto	\N
536	Diámetro de la rueda delantera	\N	texto	\N
537	Diámetro de la rueda trasera	\N	texto	\N
538	Nivel de presión sonora medido LpA	\N	texto	\N
539	Nivel de potencia acústica garantizado LWA	\N	texto	\N
540	Factor de inseguridad nivel de presión sonora KpA	\N	texto	\N
541	Vibración manillar ahw	\N	texto	\N
542	Vibraciones, inseguridad K	\N	texto	\N
543	Régimen nominal	\N	texto	\N
544	Anchura de trabajo estándar	\N	texto	\N
545	Diámetro del juego de fresadoras	\N	texto	\N
546	Ancho del dispositivo con alcance de suministro estándar	\N	texto	\N
547	Longitud máx. del dispositivo	\N	texto	\N
548	Driver	\N	texto	\N
549	Imán	\N	texto	\N
550	Amplificación	\N	texto	\N
551	Sistema	\N	texto	\N
552	Incluye	\N	texto	\N
553	Madera	\N	texto	\N
554	Conectividad	\N	texto	\N
555	Torque	\N	texto	\N
556	Transmision	\N	texto	\N
557	Frenos	\N	texto	\N
558	Tanque	\N	texto	\N
559	Capacidad de calentamiento 90 °C - 5 l/h	\N	texto	\N
560	Capacidad de enfriamiento 10 °C - 2 l/h	\N	texto	\N
561	Tamaño	\N	texto	\N
562	Todas	\N	texto	\N
563	Audio	\N	texto	\N
\.


--
-- Data for Name: auth_providers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_providers (id_provider, id_usuario, provider, provider_uid, email, nombre, avatar_url, access_token, refresh_token, token_expiry, raw_data, fecha_creacion, fecha_ultima_autenticacion) FROM stdin;
\.


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banners (id_banner, titulo, subtitulo, descripcion, imagen_url, imagen_mobile_url, enlace_url, texto_boton, posicion, orden, activo, fecha_inicio, fecha_fin, fecha_creacion) FROM stdin;
1	Banner Hero 1	\N	\N	/assets/img/banner-hero/banner-ceveco-1768755928640-116886076.png	\N	\N	\N	hero	0	t	\N	\N	2026-05-24 22:14:58.718155
2	Banner Hero 2	\N	\N	/assets/img/banner-hero/banner2.jpg	\N	\N	\N	hero	1	t	\N	\N	2026-05-24 22:14:58.720811
3	Banner Hero 3	\N	\N	/assets/img/banner-hero/banner3.jpg	\N	\N	\N	hero	2	t	\N	\N	2026-05-24 22:14:58.721593
4	Banner Hero 4	\N	\N	/assets/img/banner-hero/banner4.jpg	\N	\N	\N	hero	3	t	\N	\N	2026-05-24 22:14:58.722169
5	Banner Hero 5	\N	\N	/assets/img/banner-hero/banner5.jpg	\N	\N	\N	hero	4	t	\N	\N	2026-05-24 22:14:58.722602
6	Banner Hero 6	\N	\N	/assets/img/banner-hero/banner6.jpg	\N	\N	\N	hero	5	t	\N	\N	2026-05-24 22:14:58.723281
\.


--
-- Data for Name: carrito; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.carrito (id_carrito, id_usuario, session_id, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: carrito_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.carrito_items (id_item, id_carrito, id_producto, cantidad, precio_unitario, fecha_agregado) FROM stdin;
\.


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categorias (id_categoria, nombre, slug, descripcion, imagen_url, icono, orden, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
1	Electro Hogar	electro-hogar	Electrodomésticos para el hogar	\N	zap	1	t	2025-12-04 14:30:43.98025	2025-12-04 14:30:43.98025
2	Muebles y Organización	muebles	Muebles y soluciones de organización	\N	home	2	t	2025-12-04 14:30:43.98025	2025-12-04 14:30:43.98025
3	Motos	motos	Motocicletas urbanas y deportivas	\N	bike	3	t	2025-12-04 14:30:43.98025	2025-12-04 14:30:43.98025
4	Herramientas STIHL	herramientas	Herramientas profesionales para jardín	\N	wrench	4	t	2025-12-04 14:30:43.98025	2025-12-04 14:30:43.98025
\.


--
-- Data for Name: configuracion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.configuracion (id_config, clave, valor, tipo, descripcion, grupo, fecha_actualizacion) FROM stdin;
1	sitio_nombre	Ceveco	string	Nombre del sitio web	general	2025-12-04 14:30:43.98025
2	sitio_email	contacto@ceveco.com.co	string	Email de contacto	general	2025-12-04 14:30:43.98025
3	sitio_telefono	+57 (606) 859 1234	string	Teléfono principal	general	2025-12-04 14:30:43.98025
4	sitio_whatsapp	+573001234567	string	WhatsApp de contacto	general	2025-12-04 14:30:43.98025
5	envio_gratis_minimo	500000	number	Monto mínimo para envío gratis	envios	2025-12-04 14:30:43.98025
6	iva_porcentaje	19	number	Porcentaje de IVA	impuestos	2025-12-04 14:30:43.98025
7	moneda	COP	string	Moneda del sitio	general	2025-12-04 14:30:43.98025
8	productos_por_pagina	12	number	Productos por página	catalogo	2025-12-04 14:30:43.98025
\.


--
-- Data for Name: cupon_usos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cupon_usos (id_uso, id_cupon, id_usuario, id_pedido, monto_descuento, fecha_uso) FROM stdin;
\.


--
-- Data for Name: cupones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cupones (id_cupon, codigo, descripcion, tipo_descuento, valor_descuento, monto_minimo_compra, usos_maximos, usos_por_usuario, usos_actuales, fecha_inicio, fecha_fin, activo, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: direcciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.direcciones (id_direccion, id_usuario, nombre_destinatario, telefono_contacto, departamento, ciudad, direccion_linea1, direccion_linea2, codigo_postal, barrio, referencias, es_principal, tipo, fecha_creacion) FROM stdin;
1	7	Sebastian	3226749257	Caldas	Manizales	calle 54 # 34 32	\N		\N		f	casa	2025-12-10 18:13:22.095195
5	7	Sebastian  Guerrero Arias	3226749257	Caldas	Manizales	Calle 54 # 34 - 32 (Casa) Apto 501, Torre A	Apto 501, Torre A	\N	\N	\N	f	casa	2025-12-10 19:56:07.086407
6	7	Sebastian  Guerrero Arias	3226749257	Caldas	Manizales	Calle 54 # 34 - 32 (Casa) Apto 501, Torre A	Apto 501, Torre A	\N	\N	\N	f	casa	2025-12-10 19:58:05.406641
7	7	Sebastian  Guerrero Arias	3226749257	Caldas	Manizales	Calle 57 # 47 - 35 (Casa)	\N	\N	\N	toque la puerta	f	casa	2025-12-10 20:22:41.480358
8	7	Sebastian  Guerrero Arias	3226749257	Caldas	Manizales	Calle 68 # 75 - 17 (Casa)	\N	\N	\N	\N	f	casa	2025-12-10 20:27:10.948887
9	7	Sebastian  Guerrero Arias	3226749257	Caldas	Manizales	Calle 75 # 638 - 41 (Casa)	\N	\N	\N	\N	f	casa	2025-12-10 20:31:21.030082
\.


--
-- Data for Name: favoritos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.favoritos (id_favorito, id_usuario, id_producto, fecha_agregado) FROM stdin;
\.


--
-- Data for Name: logs_actividad; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.logs_actividad (id_log, id_usuario, accion, tabla_afectada, id_registro, datos_anteriores, datos_nuevos, ip_address, user_agent, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: marcas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.marcas (id_marca, nombre, logo_url, descripcion, sitio_web, activo, fecha_creacion) FROM stdin;
1	Honda	\N	\N	\N	t	2025-12-04 14:30:43.98025
2	Kalley	\N	\N	\N	t	2025-12-04 14:30:43.98025
3	Haceb	\N	\N	\N	t	2025-12-04 14:30:43.98025
4	Samsung	\N	\N	\N	t	2025-12-04 14:30:43.98025
5	LG	\N	\N	\N	t	2025-12-04 14:30:43.98025
6	Rimax	\N	\N	\N	t	2025-12-04 14:30:43.98025
7	STIHL	\N	\N	\N	t	2025-12-04 14:30:43.98025
8	Yamaha	\N	\N	\N	t	2025-12-04 14:30:43.98025
9	Mabe	\N	\N	\N	t	2025-12-04 14:30:43.98025
10	Whirlpool	\N	\N	\N	t	2025-12-04 14:30:43.98025
11	Oster	\N	\N	\N	t	2025-12-04 14:30:43.98025
12	Sony	\N	\N	\N	t	2025-12-04 14:30:43.98025
13	TCL	\N	\N	\N	t	2025-12-04 14:30:43.98025
14	Samurai	\N	\N	\N	t	2025-12-04 14:30:43.98025
15	Comodisimos	\N	\N	\N	t	2025-12-04 14:30:43.98025
16	Profilan	\N	\N	\N	t	2025-12-04 14:30:43.98025
17	Durespo	\N	\N	\N	t	2025-12-04 14:30:43.98025
20	Einhell	\N	\N	\N	t	2025-12-04 15:41:28.873304
21	AKT	\N	\N	\N	t	2025-12-04 15:47:00.221404
22	VOGE	\N	\N	\N	t	2025-12-04 15:47:00.221404
23	SYM	\N	\N	\N	t	2025-12-04 15:47:00.221404
30	Comodísimos	\N	\N	\N	t	2026-01-14 16:19:41.631528
31	Corbeta	\N	\N	\N	t	2026-01-15 18:39:23.805132
32	Hyundai	\N	\N	\N	t	2026-01-15 18:54:02.560862
33	Suzuki	\N	\N	\N	t	2026-01-16 10:37:53.65872
34	L&L	\N	\N	\N	t	2026-01-16 13:23:41.779907
35	Maximuebles	\N	\N	\N	t	2026-01-16 13:23:41.975336
36	Inval	\N	\N	\N	t	2026-01-16 13:23:42.386563
\.


--
-- Data for Name: newsletter; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.newsletter (id_suscriptor, email, nombre, activo, fecha_suscripcion, fecha_baja) FROM stdin;
\.


--
-- Data for Name: pedido_historial; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedido_historial (id_historial, id_pedido, estado_anterior, estado_nuevo, comentario, id_usuario_cambio, fecha_cambio) FROM stdin;
\.


--
-- Data for Name: pedido_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedido_items (id_item, id_pedido, id_producto, cantidad, precio_unitario, subtotal, descuento, total) FROM stdin;
\.


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedidos (id_pedido, numero_pedido, id_usuario, id_direccion_envio, email_contacto, telefono_contacto, subtotal, descuento, costo_envio, impuestos, total, estado, metodo_pago, estado_pago, empresa_envio, numero_guia, fecha_estimada_entrega, notas_cliente, notas_admin, fecha_pedido, fecha_confirmacion, fecha_envio, fecha_entrega, fecha_actualizacion) FROM stdin;
1	SIM-1765414567062	7	5	sebgameover5@gmail.com	3226749257	830000.00	0.00	0.00	0.00	830000.00	pendiente	tarjeta_credito	pendiente	\N	\N	\N	\N	\N	2025-12-10 19:56:07.086407	\N	\N	\N	2025-12-10 19:56:07.086407
2	SIM-1765414685339	7	6	sebgameover5@gmail.com	3226749257	570000.00	0.00	0.00	0.00	570000.00	pendiente	tarjeta_credito	pendiente	\N	\N	\N	\N	\N	2025-12-10 19:58:05.406641	\N	\N	\N	2025-12-10 19:58:05.406641
3	SIM-1765416161383	7	7	sebgameover5@gmail.com	3226749257	320000.00	0.00	0.00	0.00	320000.00	pendiente	tarjeta_credito	pendiente	\N	\N	\N	\N	\N	2025-12-10 20:22:41.480358	\N	\N	\N	2025-12-10 20:22:41.480358
4	SIM-1765416430860	7	8	sebgameover5@gmail.com	3226749257	260000.00	0.00	0.00	0.00	260000.00	pendiente	tarjeta_credito	pendiente	\N	\N	\N	\N	\N	2025-12-10 20:27:10.948887	\N	\N	\N	2025-12-10 20:27:10.948887
5	SIM-1765416680952	7	9	sebgameover5@gmail.com	3226749257	260000.00	0.00	0.00	0.00	260000.00	pendiente	tarjeta_credito	pendiente	\N	\N	\N	\N	\N	2025-12-10 20:31:21.030082	\N	\N	\N	2025-12-10 20:31:21.030082
\.


--
-- Data for Name: producto_atributos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.producto_atributos (id_producto_atributo, id_producto, id_atributo, valor_texto, valor_numero, valor_booleano) FROM stdin;
2319	482	364	4 tiempos	\N	\N
758	389	99	HD	\N	\N
759	389	100	1,366 x 768	\N	\N
760	389	101	Directa	\N	\N
761	389	102	60Hz	\N	\N
763	389	104	HDR10 / HLG	\N	\N
764	389	105	Escalador de Resolución	\N	\N
766	389	107	10W	\N	\N
767	389	108	2.0 Ch	\N	\N
768	389	109	AI Sound (Virtual 5.1 Up-mix), Clear Voice Pro, LG Sound Sync, Bluetooth Surround Ready	\N	\N
769	389	110	webOS 23	\N	\N
770	389	111	Si	\N	\N
771	389	112	Si (con LG ThinQ app.)	\N	\N
772	389	113	Listo (requiere Magic Remote)	\N	\N
773	389	114	Apple Airplay2, Apple Home, Compartir de Habitación a Habitación	\N	\N
774	389	115	2ea (soporte eARC)	\N	\N
775	389	116	1ea (v 2.0)	\N	\N
776	389	117	Wi-Fi 5	\N	\N
777	389	118	V5.0	\N	\N
778	389	119	Ethernet, RF, SPDIF, Simplink	\N	\N
779	390	99	LCD (LED)	\N	\N
780	390	120	43	\N	\N
781	390	121	108	\N	\N
782	390	100	FHD (1920 x 1080)	\N	\N
783	390	102	60Hz	\N	\N
784	390	103	Quad Core Processor	\N	\N
785	390	104	Active HDR	\N	\N
786	390	122	Resolution Upscaler	\N	\N
787	390	107	20W	\N	\N
788	390	123	2.0 ch	\N	\N
789	390	109	Virtual Surround Plus, Clear Voice	\N	\N
790	390	110	webOS Smart TV (6.0)	\N	\N
791	390	111	Si	\N	\N
792	390	124	Si	\N	\N
793	390	125	LG TV Plus, Quick Access	\N	\N
794	390	115	3	\N	\N
795	390	116	2	\N	\N
796	390	117	Si	\N	\N
797	390	118	Si	\N	\N
798	390	119	ARC, LAN, Salida Óptica	\N	\N
799	391	98	8806096329405	\N	\N
800	391	99	4K UHD	\N	\N
801	391	100	3,840 x 2,160	\N	\N
802	391	101	Directa	\N	\N
803	391	102	60Hz	\N	\N
804	391	103	Procesador α7 AI 4K Gen8	\N	\N
805	391	126	Superescalado 4K	\N	\N
806	391	104	HDR10 / HLG	\N	\N
807	391	127	Si	\N	\N
808	391	128	Si (Hasta 60Hz)	\N	\N
809	391	129	Si	\N	\N
810	391	130	Si	\N	\N
811	391	131	Si	\N	\N
812	391	107	20W	\N	\N
813	391	132	IA Sound Pro α7 (Virtual 9.1.2 Up-mix)	\N	\N
814	391	133	Si	\N	\N
815	391	134	Si	\N	\N
816	391	110	webOS 25	\N	\N
817	391	113	Incorporado (MR25)	\N	\N
819	391	136	Apple Airplay2, Google Home, Google Cast, Apple Home	\N	\N
820	391	137	1,122 x 654 x 67.9 mm	\N	\N
821	391	138	1,122 x 718 x 230 mm	\N	\N
822	391	139	9.4 kg	\N	\N
823	391	140	200 x 200	\N	\N
824	391	115	3ea (soporte eARC, ALLM)	\N	\N
825	391	116	Compatible	\N	\N
826	391	117	Wi-Fi 5	\N	\N
827	391	118	V5.0	\N	\N
828	391	141	1ea	\N	\N
829	392	98	8806096329887	\N	\N
830	392	99	4K UHD	\N	\N
831	392	100	3,840 x 2,160	\N	\N
832	392	102	60Hz	\N	\N
833	392	101	Directa	\N	\N
834	392	103	Procesador α7 AI 4K Gen8	\N	\N
835	392	104	HDR10 / HLG	\N	\N
836	392	105	Superescalado 4K	\N	\N
837	392	127	Si	\N	\N
838	392	107	20W	\N	\N
840	392	133	Si	\N	\N
841	392	143	Si	\N	\N
842	392	144	webOS 25	\N	\N
843	392	113	Incorporado (MR25)	\N	\N
844	392	112	Si	\N	\N
845	392	145	Si	\N	\N
846	392	146	Si	\N	\N
847	392	147	Si	\N	\N
848	392	148	1 236 x 718 x 67,9 mm	\N	\N
849	392	149	1 236 x 780 x 230 mm	\N	\N
850	392	137	11,5 kg	\N	\N
851	392	150	300 x 200	\N	\N
852	392	115	3ea (eARC, ALLM)	\N	\N
853	392	116	1ea	\N	\N
854	392	117	Wi-Fi 5	\N	\N
855	392	118	V5.0	\N	\N
856	393	98	8806091881533	\N	\N
857	393	99	4K NanoCell	\N	\N
858	393	151	Nano Color	\N	\N
859	393	102	60Hz	\N	\N
860	393	103	Procesador α5 IA 4K Gen7	\N	\N
861	393	104	HDR10 / HLG	\N	\N
862	393	106	9 modos	\N	\N
863	393	144	WebOS 24	\N	\N
864	393	113	Incorporado	\N	\N
865	393	152	Si	\N	\N
867	393	137	14,0 kg	\N	\N
868	393	150	300 x 300	\N	\N
869	393	115	3ea	\N	\N
870	393	116	2ea	\N	\N
871	393	118	V5.0	\N	\N
872	394	98	8806096330241	\N	\N
873	394	99	4K UHD	\N	\N
874	394	100	4K Ultra HD	\N	\N
875	394	132	IA Sound Pro α7 (Virtual 9.1.2)	\N	\N
876	394	133	Si	\N	\N
877	394	128	Si (60Hz)	\N	\N
878	394	129	Si	\N	\N
879	394	153	Si	\N	\N
881	394	154	16,7 kg	\N	\N
882	395	98	8806091860101	\N	\N
883	395	99	4K NanoCell	\N	\N
884	395	155	Nano Color	\N	\N
885	395	103	α5 IA 4K Gen7	\N	\N
886	395	148	1 454 x 838 x 57,7 mm	\N	\N
887	395	156	21,5 kg	\N	\N
888	396	98	8806096488881	\N	\N
889	396	148	1 678 x 964 x 59,9 mm	\N	\N
890	396	154	31,8 kg	\N	\N
891	396	118	v 5.1	\N	\N
892	396	116	2ea	\N	\N
893	396	117	Wi-Fi 5	\N	\N
894	397	98	8806091858092	\N	\N
896	397	149	1 678 x 1 027 x 361 mm	\N	\N
897	397	150	400 x 400	\N	\N
898	398	98	8806096339596	\N	\N
899	398	148	1 927 x 1 104 x 59,9 mm	\N	\N
901	398	150	600 x 400	\N	\N
902	398	103	Procesador α7 AI 4K Gen8	\N	\N
903	398	126	Superescalado 4K	\N	\N
904	398	118	v 5.1	\N	\N
905	398	115	3ea	\N	\N
906	398	116	2ea	\N	\N
907	399	99	4K NanoCell	\N	\N
908	399	100	3,840 x 2,160	\N	\N
909	399	102	120Hz	\N	\N
910	399	151	Nano Color	\N	\N
912	399	122	α8 IA Super Upscaling 4K	\N	\N
913	399	104	HDR10 / HLG	\N	\N
914	399	157	4K 120 fps (HDMI)	\N	\N
915	399	158	Si	\N	\N
916	399	128	Si	\N	\N
917	399	129	Si	\N	\N
918	399	153	Si	\N	\N
919	399	107	20W	\N	\N
920	399	123	2.0 Ch	\N	\N
922	399	160	Si (hasta 2.1 canales)	\N	\N
923	399	144	WebOS 24	\N	\N
924	399	113	Incorporado	\N	\N
925	399	161	Si	\N	\N
926	399	111	Si	\N	\N
927	399	148	1 927 x 1 104 x 59,9 mm	\N	\N
928	399	162	45,2 kg	\N	\N
929	399	150	600 x 400	\N	\N
930	400	163	Si	\N	\N
931	400	164	Si	\N	\N
932	400	165	Si	\N	\N
933	400	166	Multi Color Speaker Lighting	\N	\N
934	400	118	Si	\N	\N
935	400	116	2 puertos	\N	\N
936	400	167	Si (Φ6.3)	\N	\N
937	400	168	Si (Φ6.3)	\N	\N
938	400	169	Standard, Pop, Rock, Bass Blast, Regueton, Salsa	\N	\N
939	400	170	Si (Modo Twin)	\N	\N
940	400	171	33 x 68.5 x 34.4 cm	\N	\N
941	400	156	13.8 kg	\N	\N
942	401	172	Si	\N	\N
943	401	173	Si	\N	\N
944	401	174	Si	\N	\N
945	401	171	33 x 78.5 x 34.4 cm	\N	\N
946	401	156	16 kg	\N	\N
948	402	156	22.5 kg	\N	\N
949	402	175	Si	\N	\N
950	402	176	Si	\N	\N
951	402	177	Si (Android)	\N	\N
952	403	178	2.1ch	\N	\N
953	403	179	30W (20W + 10W)	\N	\N
954	403	180	AI Sound, Bass Boost, Standard	\N	\N
955	403	181	IP67 (Agua y Polvo)	\N	\N
956	403	182	20 Horas	\N	\N
957	403	183	3 Horas	\N	\N
958	403	118	5.3	\N	\N
959	403	184	Si	\N	\N
960	403	185	Asistente de Google / Siri	\N	\N
961	403	186	Modo Dual y Multi	\N	\N
962	403	187	211.0 x 71.6 x 70.0 mm	\N	\N
963	403	156	0.7 kg	\N	\N
965	404	98	8806096327234	\N	\N
966	404	189	2.1ch (Stereo)	\N	\N
967	404	190	40W (30W Woofer + 10W Tweeters)	\N	\N
968	404	191	AAC, SBC	\N	\N
969	404	192	AI Sound, Bass Boost, Standard, Custom (App)	\N	\N
970	404	193	Si (2)	\N	\N
971	404	194	20 mm x 2 (Cúpula)	\N	\N
972	404	195	93 x 53 mm	\N	\N
973	404	196	IP67 (Resistente al agua, polvo y salpicaduras)	\N	\N
974	404	197	Resistente a golpes	\N	\N
975	404	182	30 Horas	\N	\N
976	404	198	3 Horas	\N	\N
977	404	199	5.3	\N	\N
978	404	200	Si	\N	\N
979	404	201	Modo Dual y Modo Multi	\N	\N
981	404	203	Altavoz del teléfono (Hands-free), Iluminación integrada, Gestor FOTA	\N	\N
982	404	204	272 x 103 x 88 mm	\N	\N
983	404	205	1.42 kg	\N	\N
984	404	206	2.04 kg	\N	\N
985	404	207	USB tipo C	\N	\N
986	404	208	Sí (Tipo USB C)	\N	\N
987	404	209	20 W	\N	\N
989	405	211	120W	\N	\N
990	405	178	2.1ch (2Way)	\N	\N
991	405	212	Woofer 6.5" x 1, Rango medio 2.5" x 2	\N	\N
992	405	192	AI Sound, Bass Boost, Standard, Custom (App)	\N	\N
993	405	118	5.3	\N	\N
994	405	116	1	\N	\N
995	405	213	Sí	\N	\N
996	405	186	Modo Dual y Multi	\N	\N
997	405	214	12 Horas	\N	\N
998	405	215	3 Horas	\N	\N
999	405	216	50W	\N	\N
1000	405	217	312 x 311 x 282 mm	\N	\N
1001	405	205	6.5 kg	\N	\N
1002	405	218	IPX4 (Salpicaduras)	\N	\N
1003	405	219	Sí (Ajustable)	\N	\N
1004	405	220	Android/iOS	\N	\N
1005	406	13	13 kg	\N	\N
1006	406	221	590 x 965 x 610 mm	\N	\N
1007	406	222	Smart Inverter (10 años de garantía)	\N	\N
1008	406	223	TurboDrum, Punch + 3, Smart Motion, Tub Clean, Smart Diagnosis	\N	\N
1009	407	13	19 kg	\N	\N
1010	407	221	632 x 970 x 670 mm	\N	\N
1011	407	224	Smart Inverter	\N	\N
1012	407	225	TurboDrum	\N	\N
1013	407	226	Smart Diagnosis	\N	\N
1014	407	227	Cerrado suave	\N	\N
1015	408	13	23 kg	\N	\N
1016	408	221	651 x 1060 x 680 mm	\N	\N
1017	408	228	AI DD	\N	\N
1018	408	229	ThinQ (Wi-Fi)	\N	\N
1019	408	230	Inverter Direct Drive	\N	\N
1021	409	13	25 kg	\N	\N
1022	409	221	690 x 1130 x 730 mm	\N	\N
1023	409	232	6 Motion DD, TurboWash 3D, JetSpray, TurboDrum, Inverter Direct Drive	\N	\N
1024	410	13	Lavado 16kg / Secado 8kg	\N	\N
1025	410	222	Inverter Direct Drive (10 años garantía)	\N	\N
1026	410	223	AI DD, 6 Motion DD, Steam, TurboWash, ThinQ	\N	\N
1027	411	13	Lavado 16kg / Secado 8kg	\N	\N
1028	411	233	Pet Care, Vapor, TurboWash360, AI DD	\N	\N
1029	412	234	22kg (48lbs)	\N	\N
1030	412	235	13kg (29lbs)	\N	\N
1031	412	221	70 x 77 x 99 cm	\N	\N
1032	412	236	Inverter Direct Drive	\N	\N
1033	412	237	6MotionDD	\N	\N
1034	412	238	10 años	\N	\N
1035	412	239	AI DD	\N	\N
1036	412	240	SPA Steam / Allergiene	\N	\N
2318	482	363	98.98 cc	\N	\N
2320	482	365	6,9 HP @ 7.500 rpm	\N	\N
2321	482	366	7,5 Nm @ 4.500 rpm	\N	\N
2322	482	367	10.1	\N	\N
2324	482	369	Eléctrico y de pedal	\N	\N
2335	482	379	Basculante de doble amortiguador	\N	\N
2355	484	371	Gris, Blanco, Rojo, Negro	\N	\N
2372	485	364	4T - OHC - Refrigerado por aire	\N	\N
2390	486	364	4T SOHC 4 Válvulas, monocilíndrico, SI, refrigerado por aceite	\N	\N
2418	487	374	1.781 x 710 x 1.113 mm	\N	\N
2433	488	371	Azul Gris Mate, Rojo Gris Mate	\N	\N
2444	489	364	Monocilíndrico, 4 tiempos, 2 válvulas, OHC refrigerado por aire	\N	\N
2479	491	380	TFT 5" con indicador de marcha, reloj, combustible, Odómetro, Honda RoadSync	\N	\N
6715	768	11	1.60 / 1.70 bhp	\N	\N
6716	768	477	4.5 kg 1)	\N	\N
6717	768	488	3.80 / 3.30 kg/kW	\N	\N
6718	768	489	3/8"P	\N	\N
6719	768	490	395 mm 1)	\N	\N
6720	768	487	5.08 kg 2)	\N	\N
1038	412	242	ThinQ (WiFi)	\N	\N
1039	412	243	Clasificación A	\N	\N
1040	413	13	20 Litros	\N	\N
1041	413	244	700W	\N	\N
1042	413	245	1050W	\N	\N
1043	413	246	EasyClean	\N	\N
1045	413	221	454 x 261 x 328 mm	\N	\N
1046	413	248	Cocina automática, Descongelado uniforme, Bloqueo para niños, Smart Diagnosis	\N	\N
1047	414	249	343 Litros	\N	\N
1048	414	221	595 x 1860 x 682 mm	\N	\N
1049	414	222	Smart Inverter Compressor (10 años de garantía)	\N	\N
1050	414	250	Door Cooling+, Linear Cooling, Multi-Air Flow	\N	\N
1051	414	251	Externo	\N	\N
1052	414	252	LED externa	\N	\N
1053	414	253	ThinQ Wi-Fi, Smart Diagnosis	\N	\N
1054	414	254	Negro Mate VCM	\N	\N
1055	415	249	519 Litros	\N	\N
1056	415	221	910 x 1786 x 643 mm	\N	\N
1057	415	255	Multi Air Flow	\N	\N
1058	415	222	Smart Inverter Compressor	\N	\N
1060	415	257	Táctil LED externa	\N	\N
1061	416	249	461 Litros	\N	\N
1062	416	258	Grado A	\N	\N
1063	416	221	700 x 1850 x 700 mm	\N	\N
1064	416	250	Door Cooling+	\N	\N
1065	416	259	Smart Diagnosis, ThinQ Wi-Fi	\N	\N
1066	416	260	Agua (Externo)	\N	\N
1067	417	249	618 Litros	\N	\N
1068	417	261	French Door (3 puertas)	\N	\N
1069	417	221	756 x 1740 x 901 mm	\N	\N
1070	417	262	Sí	\N	\N
1071	417	263	12.0 lb	\N	\N
1072	417	264	LT1000P	\N	\N
1073	417	265	Acero Inoxidable	\N	\N
1075	418	266	B	\N	\N
1076	418	267	Side by Side	\N	\N
1077	418	268	Estándar	\N	\N
1078	418	269	416 L	\N	\N
1079	418	270	635 L	\N	\N
1080	418	271	913 x 1 790 x 735	\N	\N
1081	418	272	138	\N	\N
1082	418	273	148	\N	\N
1083	418	274	Sí	\N	\N
1084	418	275	Sí	\N	\N
1085	418	276	Solo InstaView	\N	\N
1086	418	277	Smart Inverter	\N	\N
1087	418	278	Automática (Spaceplus)	\N	\N
1088	418	279	No	\N	\N
1089	418	280	Sí	\N	\N
1090	418	281	Sí	\N	\N
1091	418	282	Prime Silver	\N	\N
1092	418	283	PET	\N	\N
1093	419	266	B	\N	\N
1094	419	267	Side by Side	\N	\N
1095	419	268	Estándar	\N	\N
1096	419	269	416 L	\N	\N
1097	419	284	190 L	\N	\N
1098	419	270	635 L	\N	\N
1099	419	271	913 x 1 790 x 735	\N	\N
1100	419	272	144	\N	\N
1101	419	273	154	\N	\N
1102	419	285	Sí	\N	\N
1103	419	286	InstaView Door-in-Door (Ventana Polarizada)	\N	\N
1104	419	287	Sí (99.9% reducción bacterias)	\N	\N
1105	419	288	Sí	\N	\N
1107	419	289	Hielo en esferas y cubos / Agua	\N	\N
1108	419	290	Sí	\N	\N
1109	419	282	Negro mate PCM	\N	\N
1110	419	291	F/R Metal	\N	\N
1111	419	280	Sí	\N	\N
1112	419	281	Sí	\N	\N
6721	768	474	35 cm 3)	\N	\N
6722	768	475	1.10 mm	\N	\N
6724	768	483	110 dB(A) 4)	\N	\N
6725	768	491	3.7 m/s² 5)	\N	\N
6726	768	492	3.7 m/s² 5)	\N	\N
6727	769	47	31.8 cm³	\N	\N
6728	769	11	1.90 / 2.01 bhp	\N	\N
6729	769	486	849 g/kWh	\N	\N
6730	769	477	4.5 kg 1)	\N	\N
6731	769	487	5.17 / 5.28 kg 2)	\N	\N
6732	769	488	3.20 / 3.00 kg/kW	\N	\N
6733	769	474	35 / 40 cm 3)	\N	\N
6734	769	475	1.30 mm	\N	\N
6735	769	489	3/8"P	\N	\N
6736	769	490	395 / 410 mm 1)	\N	\N
6738	769	483	112.0 / 110.0 dB(A) 4)	\N	\N
6739	769	491	3.5 / 3.0 m/s² 5)	\N	\N
6740	769	492	3.2 / 3.4 m/s² 5)	\N	\N
6741	770	47	35.8 cm³	\N	\N
6742	770	11	2.20 bhp	\N	\N
6743	770	486	927 g/kWh	\N	\N
6744	770	477	4.6 / 4.5 kg 1)	\N	\N
6745	770	487	5.08 / 5.38 kg 2)	\N	\N
6746	770	488	2.80 kg/kW	\N	\N
6747	770	474	30 / 45 cm 3)	\N	\N
6748	770	475	1.30 mm	\N	\N
6749	770	489	3/8"P	\N	\N
6750	770	490	400 mm 1)	\N	\N
6751	770	482	103.0 / 100.0 dB(A) 4)	\N	\N
6753	770	491	3.1 / 2.5 m/s² 5)	\N	\N
6754	770	492	3.7 / 3.4 m/s² 5)	\N	\N
6755	771	469	36 V	\N	\N
6756	771	470	40 V	\N	\N
6757	771	471	0.90 kW	\N	\N
6758	771	11	0.70 kW 1)	\N	\N
6759	771	472	AK	\N	\N
6760	771	493	AK 20	\N	\N
6761	771	473	2.5 kg 2)	\N	\N
6762	771	474	30 cm 3)	\N	\N
6763	771	475	1.10 mm	\N	\N
2892	498	385	Kalley	\N	\N
2893	498	386	TV y Video	\N	\N
2894	498	387	Televisores	\N	\N
2895	498	1	Kalley	\N	\N
2897	498	389	Brinda una experiencia de sonido envolvente y clara con buena potencia, ideal para películas y música	\N	\N
2898	498	390	Permite recepción de señal de TV abierta en alta definición sin necesidad de decodificador adicional	\N	\N
2899	499	385	Kalley	\N	\N
2900	499	386	Electrohogar	\N	\N
2901	499	387	Otros	\N	\N
2902	499	1	Kalley	\N	\N
2903	499	11	70 W	\N	\N
2904	499	13	43 Litros	\N	\N
2905	499	391	Cuenta con la capacidad perfecta para conservar y refrigerar alimentos y bebidas.	\N	\N
2906	499	392	Mayor potencia para un rápido enfriamiento.	\N	\N
2907	499	393	Refrigerante ecológico. No afecta el medio ambiente.	\N	\N
2908	499	394	Permite preservar adecuadamente los alimentos.	\N	\N
2909	499	395	Llave de seguridad, cubeta de hielo, bandeja para descongelar y entrepaño.	\N	\N
2910	499	221	47.2 ancho x 45 prof x 49.2 alto (cm)	\N	\N
2925	507	385	Kalley	\N	\N
2926	507	386	Electrohogar	\N	\N
2927	507	387	Otros	\N	\N
2928	507	1	Kalley	\N	\N
2931	509	385	Kalley	\N	\N
2932	509	386	Electrohogar	\N	\N
2933	509	387	Otros	\N	\N
2934	509	1	Kalley	\N	\N
2935	509	11	1500W	\N	\N
2936	509	13	3.5 Litros	\N	\N
2937	509	10	Rango entre 110V y 120V	\N	\N
2938	509	398	Permite freír, tostar, asar y hornear los alimentos de manera rápida, sencilla y saludable, sin necesidad de utilizar aceites.	\N	\N
2939	509	399	Mayor eficiencia y potencia para la preparación de tus alimentos.	\N	\N
2940	509	400	Cesta interior de gran capacidad para preparar tus comidas favoritas.	\N	\N
2941	509	401	Cuando termina el ciclo de cocción, emite un sonido de campana y el Airfryer se apaga automáticamente.	\N	\N
2942	509	402	Alcanza temperaturas altas para tus diferentes recetas y preparaciones.	\N	\N
2943	509	403	Al seleccionar el tiempo se encenderá la luz.	\N	\N
2944	509	404	Cocina de manera homogénea y rápida los alimentosa tu gusto.	\N	\N
2945	509	405	Evita que los alimentos se peguen al recipiente interno, facilitando su limpieza.	\N	\N
2946	509	406	Permite freír, tostar, asar y hornear los alimentos de manera rápida, sencilla y saludable, sin necesidad de utilizar aceite.	\N	\N
2947	509	407	Permite que la coccion sea homogénea y que no se sobrecailente el producto.	\N	\N
2948	509	408	Mango frío al tacto, permite verificar el contenido del Air fryer con seguridad.	\N	\N
2949	509	409	El Airfryer solo funcionará si su cesta se encuentre bien posicionada.	\N	\N
2950	509	410	Da un toque elegante a tu cocina.	\N	\N
2951	509	411	(LxWxH [mm] y kg) - 350x313x341 mm - 4.7 Kg	\N	\N
2952	509	412	(LxWxH [mm] y kg) - 350 x 260 x 306 mm - 4.1 kg	\N	\N
2953	510	385	Kalley	\N	\N
2954	510	386	Electrohogar	\N	\N
2955	510	387	Otros	\N	\N
2956	510	257	Led	\N	\N
2957	510	1	Kalley	\N	\N
2958	510	4	Metal	\N	\N
2959	510	11	700W	\N	\N
2960	510	3	Plata y Negro	\N	\N
2961	510	413	Oprimes solo un botón para acceder a estas opciones (Crispetas, papas, pizza, vegetales congelados, bebidas, cena).	\N	\N
2962	511	385	Kalley	\N	\N
2963	511	386	Electrohogar	\N	\N
2964	511	387	Otros	\N	\N
2965	511	1	Kalley	\N	\N
2966	511	48	90 Grados Centígrados	\N	\N
2967	511	414	Admite botellones de 5 galones.	\N	\N
2969	511	416	Permite bajar la temperatura del agua a niveles óptimos, incluso en lugares donde la temperatura del ambiente es muy elevada.	\N	\N
2970	511	417	Permite elegir entre agua fría o agua caliente dependiendo de tu necesidad.	\N	\N
2971	512	385	Kalley	\N	\N
2972	512	386	Electrohogar	\N	\N
2973	512	387	Otros	\N	\N
2974	512	1	Kalley	\N	\N
2975	512	418	75W	\N	\N
2976	512	419	430 W	\N	\N
2977	512	417	Permite elegir entre agua fría o agua caliente dependiendo de tu necesidad.	\N	\N
2980	512	420	En una hora, la temperatura de 5 litros de agua puede aumentar hasta 90 °C.	\N	\N
2983	512	423	En una hora puede bajar la temperatura de 2 litros de agua hasta 10 °C.	\N	\N
2993	513	420	En una hora, la temperatura de 5 litros de agua puede aumentar hasta 90 °C.	\N	\N
2995	513	423	En una hora puede bajar la temperatura de 2 litros de agua hasta 10 °C.	\N	\N
2981	512	421	Compartimiento con capacidad ideal para guardar algunos de tus alimentos favoritos.	\N	\N
2982	512	422	Permite alcanzar la temperatura ideal en menor tiempo. Mayor eficiencia.	\N	\N
2984	512	412	(LxWxH) 270 x 300 x 850 mm / 11.3 kg	\N	\N
2985	513	385	Kalley	\N	\N
2986	513	386	Electrohogar	\N	\N
2987	513	387	Otros	\N	\N
2988	513	1	Kalley	\N	\N
2989	513	418	75W	\N	\N
2990	513	419	430 W	\N	\N
2991	513	417	Permite elegir entre agua fría o agua caliente dependiendo de tu necesidad.	\N	\N
2994	513	422	Permite alcanzar la temperatura ideal en menor tiempo. Mayor eficiencia.	\N	\N
2996	513	412	(LxWxH) 325 x 345 x 970 mm / 15.9 kg	\N	\N
2997	514	385	Kalley	\N	\N
2998	514	386	Electrohogar	\N	\N
2999	514	387	Lavado	\N	\N
3000	514	1	Kalley	\N	\N
3001	514	424	320W	\N	\N
3002	514	425	120W	\N	\N
3003	514	426	Con su potencia de lavado de 340 W y de centrifugado de 135 W tus prendas siempre lucirán limpias.	\N	\N
3004	514	427	Lava y centriguga simultáneamente gracias a sus dos compartimientos. La capacidad de lavado es de 7 kg y centrifugado de 4.6 kg.	\N	\N
3005	515	385	Kalley	\N	\N
3006	515	386	Electrohogar	\N	\N
3007	515	387	Lavado	\N	\N
3008	515	1	Kalley	\N	\N
3009	515	428	Más ahorro, menos consumo y excelente rendimiento.	\N	\N
3010	515	429	Panel digital con programas preestablecidos y luces LED que facilitan su buen funcionamiento.	\N	\N
3011	515	430	Cuenta con 2 compartimientos para disponer de estos productos por separado.	\N	\N
3012	515	28	Gran variedad de funciones que se ajustan a tus necesidades (Normal, Jeans, Mixto, Suave, Fuerte, Pesado, Rápido 15" y Klean+).	\N	\N
3013	515	431	Programa el inicio de lavado de tus prendas hasta en 24 horas.	\N	\N
3014	515	432	Bloquea todas las funciones, evitando que tus niños manipulen la lavadora.	\N	\N
3015	515	433	Te permite conservar tu lavadora en excelente estado; eliminando las bacterias, olores y suciedad que se acumula en el interior.	\N	\N
3016	515	434	Gracias al diseño del tambor logra una limpieza eficiente a través de diferentes movimientos, cuidando de tu ropa delicada y favorita.	\N	\N
3017	515	435	Recolecta motas y/o pelusa durante el ciclo de lavado.	\N	\N
3018	515	436	Selecciona automáticamente el nivel de agua de acuerdo a la cantidad de ropa que se introduzca en la lavadora.	\N	\N
3021	517	385	Kalley	\N	\N
3022	517	386	Electrohogar	\N	\N
3023	517	387	Refrigeración	\N	\N
3024	517	1	Kalley	\N	\N
3026	517	437	Distribuye el aire frio de manera uniforme, evitando que se genere escarcha en el interior y ayudando a conservar las propiedades nutritivas de los alimentos. Fácil limpieza y mantenimiento gracias a su descongelamiento automático.	\N	\N
2337	483	364	4T - OHC Refrigerado por aire	\N	\N
2338	483	365	8,41 HP @ 7.500 rpm	\N	\N
2339	483	366	9,65 Nm @ 5.000 rpm	\N	\N
3027	517	438	Cuenta con pequeños ventiladores que garantizan el enfriamiento uniforme de los alimentos en todos los niveles del nevecón. Los alimentos se mantienen frescos durante más tiempo y la temperatura se mantiene constante incluso al abrir la puerta.	\N	\N
3028	517	439	Ajusta y visualiza la temperatura y modos de operación del nevecón	\N	\N
3029	517	440	Ajusta y visualiza la temperatura y modos de operacióon del nevecón.	\N	\N
3030	517	441	Cuenta con sistema de nivelación ajustable en la parte delantera	\N	\N
3031	518	385	Samurai	\N	\N
3032	518	386	Electrohogar	\N	\N
3033	518	387	Climatización	\N	\N
3034	518	1	Samurai	\N	\N
3035	518	3	Blanco, Aspa Azul	\N	\N
3036	518	442	Ventilador de pedestal	\N	\N
3037	519	385	Samurai	\N	\N
3038	519	386	Electrohogar	\N	\N
3039	519	387	Climatización	\N	\N
3040	519	3	Negro	\N	\N
3041	519	11	70W	\N	\N
3042	519	1	Samurai	\N	\N
3043	520	385	Samurai	\N	\N
3044	520	386	Electrohogar	\N	\N
3045	520	387	Climatización	\N	\N
3046	520	1	Samurai	\N	\N
3047	520	443	Este ventilador cuenta con una potencia de 60 watts que garantiza un rendimiento eficiente en la circulación del aire, ideal para refrescar espacios medianos de manera continua y con bajo consumo energético	\N	\N
3048	520	444	El diseño 2 en 1 permite usar el ventilador como pedestal o de mesa, adaptándose a distintos espacios y necesidades gracias a la tecnología MAXX que optimiza el flujo de aire con mayor potencia y cobertura	\N	\N
3049	520	445	Ofrece tres niveles de velocidad que permiten regular el flujo de aire según la preferencia del usuario, brindando frescura personalizada en diferentes momentos del día	\N	\N
3050	520	446	Su sistema de oscilación horizontal combinado con una inclinación vertical permite una distribución amplia y uniforme del aire en toda la habitación	\N	\N
3051	520	447	La función de inclinación vertical mejora la cobertura del flujo de aire hacia arriba o hacia abajo, facilitando su uso tanto en espacios altos como bajos	\N	\N
3052	520	448	La malla protectora puede retirarse fácilmente para una limpieza más cómoda y segura, contribuyendo al mantenimiento del ventilador en óptimas condiciones	\N	\N
3053	520	449	Las aspas plásticas de 16 pulgadas proporcionan un flujo de aire potente y constante, ideales para refrescar áreas amplias dentro del hogar	\N	\N
3055	520	396	Información obtenida de catálogo interno	\N	\N
3056	520	397	SAMURAI de piso, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas.	\N	\N
3057	521	396	Información obtenida de catálogo interno	\N	\N
3058	521	397	SAMURAI de PARED, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas.	\N	\N
3059	522	385	Kalley	\N	\N
3060	522	386	Electrohogar	\N	\N
3061	522	387	Climatización	\N	\N
3062	522	10	120	\N	\N
3063	522	1	Kalley	\N	\N
3064	522	11	45W	\N	\N
3065	522	60	3	\N	\N
3066	522	4	Plástico	\N	\N
3067	522	451	7 horas	\N	\N
3068	523	385	Samurai	\N	\N
3069	523	386	Electrohogar	\N	\N
3070	523	387	Climatización	\N	\N
3071	523	1	Samurai	\N	\N
3074	525	385	Kalley	\N	\N
3075	525	386	Electrohogar	\N	\N
3076	525	387	Climatización	\N	\N
3077	525	1	Kalley	\N	\N
3078	525	4	Metal	\N	\N
3079	525	11	200W	\N	\N
3080	525	452	20"	\N	\N
3081	525	453	Alta potencia para mayor desempeño.	\N	\N
3082	525	454	Baja, media y alta para adaptar el ambiente a tu gusto.	\N	\N
3083	525	455	Refresca aun en zonas muy cálidas con un flujo de aire mayor al de un ventilador común.	\N	\N
3084	525	456	Ajusta la dirección del aire de acuerdo con tus preferencias.	\N	\N
3085	525	457	Aspas de gran tamaño para refrescar una mayor área.	\N	\N
3086	525	458	Diseño sobrio y resistente	\N	\N
3087	525	459	LxWxH (Producto) 620 x 600 x 150 mm - Peso (Producto) 6.8 kg	\N	\N
3088	526	385	Kalley	\N	\N
3089	526	386	Electrohogar	\N	\N
3090	526	387	Climatización	\N	\N
3091	526	1	Kalley	\N	\N
3092	526	460	El ventilador de torre Kalley es tu nuevo aliado para combatir los calores con sus 6 velocidades y 3 modos de ventilación el calor ya no será un impedimento para tus tareas del día a día.	\N	\N
3094	527	385	Kalley	\N	\N
3095	527	386	Electrohogar	\N	\N
3096	527	387	Climatización	\N	\N
3097	527	1	Kalley	\N	\N
3098	527	60	3	\N	\N
3099	527	11	230W	\N	\N
3100	527	4	Plástico	\N	\N
3101	527	462	On-Off	\N	\N
3102	527	463	Manual 90º	\N	\N
3103	527	452	26"	\N	\N
3104	527	464	Mas flujo de aire, más potencia, mayor confort.	\N	\N
3105	528	385	Kalley	\N	\N
3106	528	386	Electrohogar	\N	\N
3107	528	387	Climatización	\N	\N
3108	528	1	Kalley	\N	\N
3109	528	11	230W	\N	\N
3110	528	452	26"	\N	\N
3111	528	465	Este tamaño de aspas te brindad un flujo de aire más amplio que puede refrescar una mayor área; puedes ubicarlo como salas de estar, dormitorios grandes o áreas abiertas. No olvides, su potencia es de 230 W que hacen de este ventilador de alta potencia, un complemento perfecto para refrescar tus espacios.	\N	\N
3112	528	466	Fácil de guardar y limpiar, además sus piezas plásticas brindan mayor durabilidad.	\N	\N
3113	528	467	Ajusta la dirección del aire de acuerdo con tus preferencias. Para poner a girar el ventilador suelte el tornillo del oscilador y muévalo a la posición que necesite. (Mientras más afuera mayor ángulo de oscilación) luego apriete el tornillo.	\N	\N
6764	771	489	1/4"P	\N	\N
6765	771	494	18 min 4)	\N	\N
6766	771	495	40 min 4)	\N	\N
6767	771	496	55 min 4)	\N	\N
6768	771	497	55 min 4)	\N	\N
6769	771	490	451 mm 2)	\N	\N
6770	771	483	91 dB(A) 5)	\N	\N
6771	771	491	3.2 m/s² 6)	\N	\N
6772	771	492	3.4 m/s² 6)	\N	\N
6773	772	47	45.4 cm³	\N	\N
6774	772	11	3.10 bhp	\N	\N
6775	772	477	4.6 kg 1)	\N	\N
6776	772	488	2 kg/kW	\N	\N
6777	772	474	45 / 50 / 40 cm 2)	\N	\N
6778	772	475	1.60 mm	\N	\N
6779	772	489	.325"	\N	\N
6780	772	490	415 mm 1)	\N	\N
6781	772	482	101 dB(A) 3)	\N	\N
6782	772	483	111.0 / 112.0 dB(A) 3)	\N	\N
6783	772	491	6.9 m/s² 4)	\N	\N
6784	772	492	8.9 m/s² 4)	\N	\N
6785	772	487	5.57 / 5.47 / 5.71 kg 5)	\N	\N
6786	773	47	59 cm³	\N	\N
6787	773	11	4.30 bhp	\N	\N
6788	773	477	6.1 kg 1)	\N	\N
6789	773	487	7.38 / 7.71 / 8.08 / 8.28 / 7.91 / 7.35 kg 2)	\N	\N
6790	773	488	1.80 kg/kW	\N	\N
6791	773	474	50 / 63 cm 3)	\N	\N
6792	773	475	1.60 mm	\N	\N
6793	773	489	3/8"	\N	\N
6794	773	490	426 mm 1)	\N	\N
6795	773	482	102 dB(A) 4)	\N	\N
6796	773	483	114 dB(A) 4)	\N	\N
6797	773	491	4.3 m/s² 5)	\N	\N
6798	773	492	4.7 m/s² 5)	\N	\N
6799	774	47	62.6 cm³	\N	\N
6800	774	11	4.80 bhp	\N	\N
6801	774	477	5.6 kg 1)	\N	\N
6802	774	487	7.78 / 7.08 / 7.41 kg 2)	\N	\N
6803	774	488	1.60 kg/kW	\N	\N
6804	774	474	63 / 50 cm 3)	\N	\N
6805	774	475	1.60 mm	\N	\N
6806	774	489	3/8"	\N	\N
6807	774	490	457 mm 1)	\N	\N
6808	774	482	107 dB(A) 4)	\N	\N
6809	774	483	115 dB(A) 4)	\N	\N
6810	774	491	3.9 m/s² 5)	\N	\N
6811	774	492	4.6 m/s² 5)	\N	\N
6812	775	47	72.2 cm³	\N	\N
6813	775	11	5.20 bhp	\N	\N
3115	529	1	Hyundai	\N	\N
3116	529	2	HYLED4328G	\N	\N
3117	530	468	TV LED 4K UHD, 58" Smart Tv,Google Tv- , asistente de voz de Google, Tecnología HDR10: imágenes más nítidas y realistas, Dolby Atmos: audio envolvente y experiencia inmersiva,Control por voz: interacción más práctica e intuitiva, Navegación fluida con su sistema operativo google tv, Acceso directo a apps favoritas: facilidad de uso y entretenimiento inmediato.	\N	\N
3118	530	1	Hyundai	\N	\N
3119	530	2	HYLED5812G	\N	\N
3120	531	468	TV LED 4K UHD, 60" Smart Tv,Google Tv- , asistente de voz de Google, Tecnología HDR10: imágenes más nítidas y realistas, Dolby Atmos: audio envolvente y experiencia inmersiva,Control por voz: interacción más práctica e intuitiva, Navegación fluida con su sistema operativo google tv, Acceso directo a apps favoritas: facilidad de uso y entretenimiento inmediato.	\N	\N
3121	531	1	Hyundai	\N	\N
3122	531	2	HYLED6512G	\N	\N
6814	775	477	6.2 kg 1)	\N	\N
6815	775	487	8.01 / 8.38 / 8.83 / 7.29 kg 2)	\N	\N
6816	775	488	1.60 kg/kW	\N	\N
6817	775	474	63 / 75 / 37 cm 3)	\N	\N
1874	373	361	120x190	\N	\N
1875	373	362	21 cm	\N	\N
6818	775	475	1.60 mm	\N	\N
6819	775	489	3/8"	\N	\N
6820	775	490	450 mm 1)	\N	\N
6821	775	482	106 dB(A) 4)	\N	\N
6822	775	483	117 dB(A) 4)	\N	\N
6823	775	491	5.4 m/s² 5)	\N	\N
6824	775	492	5.4 m/s² 5)	\N	\N
6825	776	47	72.2 cm³	\N	\N
6826	776	11	5.90 bhp	\N	\N
6827	776	486	631 g/kWh	\N	\N
6828	776	477	6 kg 1)	\N	\N
6829	776	487	7.48 / 7.09 / 8.63 kg 2)	\N	\N
6830	776	488	1.40 kg/kW	\N	\N
6831	776	474	50 / 37 / 75 cm 3)	\N	\N
6832	776	475	1.60 mm	\N	\N
6833	776	489	3/8"	\N	\N
6834	776	490	469 mm 1)	\N	\N
6835	776	482	108 dB(A) 4)	\N	\N
6836	776	483	118 dB(A) 4)	\N	\N
6837	776	491	4.8 m/s² 5)	\N	\N
6838	776	492	3.6 m/s² 5)	\N	\N
6839	777	47	91.1 cm³	\N	\N
6840	777	11	6.70 bhp	\N	\N
6841	777	477	7.3 kg 1)	\N	\N
6842	777	488	1.50 kg/kW	\N	\N
6843	777	474	63 / 75 / 90 cm 2)	\N	\N
6844	777	475	1.60 mm	\N	\N
6845	777	489	3/8" / .404"	\N	\N
6846	777	490	467 mm 1)	\N	\N
6847	777	482	107 dB(A) 3)	\N	\N
6848	777	491	6.9 / 7.4 m/s² 4)	\N	\N
6849	777	492	6.9 / 7.4 m/s² 4)	\N	\N
6850	777	487	10.03 / 10.95 / 9.93 kg 5)	\N	\N
6851	777	483	116 dB(A) 3)	\N	\N
6852	778	487	11.05 / 10.13 / 10.04 / 9.60 / 9.47 / 9.12 kg 1)	\N	\N
6853	778	474	90 / 75 / 63 / 71 cm 2)	\N	\N
6854	778	475	1.60 mm	\N	\N
6855	778	47	91.1 cm³	\N	\N
6856	778	11	7.20 bhp	\N	\N
6857	778	477	7.4 / 7.5 kg 3)	\N	\N
6858	778	488	1.40 kg/kW	\N	\N
6859	778	489	.404" / 3/8"	\N	\N
6860	778	490	467 mm 3)	\N	\N
6861	778	482	105 dB(A) 4)	\N	\N
6862	778	491	7.9 / 6.9 m/s² 5)	\N	\N
6863	778	492	6.9 / 5.6 m/s² 5)	\N	\N
6864	778	486	776 / 818 g/kWh	\N	\N
6865	778	483	115 dB(A) 4)	\N	\N
6866	779	47	30.8 cm³	\N	\N
6867	779	11	1.70 bhp	\N	\N
6868	779	477	6.4 kg 1)	\N	\N
6869	779	478	420 mm	\N	\N
6870	779	479	21.6 fl oz (US)	\N	\N
6871	779	480	640 cm³	\N	\N
6872	779	481	176 cm	\N	\N
6873	779	482	97 dB(A) 2)	\N	\N
6874	779	483	107 dB(A) 2)	\N	\N
6875	779	484	4.9 m/s² 3)	\N	\N
6876	779	485	2.8 m/s² 3)	\N	\N
6877	780	47	27.2 cm³	\N	\N
6878	780	11	1 bhp	\N	\N
6879	780	477	4.4 kg 1)	\N	\N
6880	780	478	420 mm	\N	\N
6881	780	479	11.2 fl oz (US)	\N	\N
6882	780	480	330 cm³	\N	\N
6883	780	481	170 cm	\N	\N
6884	780	482	95 dB(A) 2)	\N	\N
6885	780	483	106 dB(A) 2)	\N	\N
6886	780	484	8.5 m/s² 3)	\N	\N
6887	780	485	9 m/s² 3)	\N	\N
6888	781	47	40.2 cm³	\N	\N
6889	781	11	2.08 bhp	\N	\N
6890	781	477	7.2 kg 1)	\N	\N
6891	781	478	420 mm	\N	\N
6892	781	479	27.4 fl oz (US)	\N	\N
6893	781	480	810 cm³	\N	\N
6894	781	481	182 cm	\N	\N
6895	781	482	98 dB(A) 2)	\N	\N
6896	781	483	108 dB(A) 2)	\N	\N
6897	781	484	4.8 m/s² 3)	\N	\N
6898	781	485	4.8 m/s² 3)	\N	\N
6899	782	47	30.8 cm³	\N	\N
6900	782	11	1.70 bhp	\N	\N
6901	782	477	6.4 kg 1)	\N	\N
6902	782	478	420 mm	\N	\N
6903	782	479	21.6 fl oz (US)	\N	\N
6904	782	480	640 cm³	\N	\N
6905	782	481	176 cm	\N	\N
6906	782	482	97 dB(A) 2)	\N	\N
6907	782	483	107 dB(A) 2)	\N	\N
6908	782	484	4.9 m/s² 3)	\N	\N
6909	782	485	2.8 m/s² 3)	\N	\N
6910	783	47	30.8 cm³	\N	\N
6911	783	11	1.70 bhp	\N	\N
6912	783	477	6 kg 1)	\N	\N
6913	783	478	420 mm	\N	\N
6915	783	480	640 cm³	\N	\N
6916	783	481	176 cm	\N	\N
6917	783	482	99 dB(A) 2)	\N	\N
6918	783	484	8 m/s² 3)	\N	\N
6919	783	485	10.5 m/s² 3)	\N	\N
6920	784	47	36.3 cm³	\N	\N
6921	784	11	2.10 bhp	\N	\N
6922	784	486	864 g/kWh	\N	\N
6923	784	477	6.8 kg 1)	\N	\N
6924	784	478	420 mm	\N	\N
6925	784	479	27.4 fl oz (US)	\N	\N
6926	784	480	810 cm³	\N	\N
6927	784	481	181 cm	\N	\N
6928	784	482	99 dB(A) 2)	\N	\N
1800	361	357	Espuma	\N	\N
1801	361	358	Tejido de Punto	\N	\N
1802	361	359	Confort	\N	\N
1803	361	360	No	\N	\N
1804	361	361	90x190	\N	\N
1805	362	357	Espuma	\N	\N
1806	362	358	Tejido de Punto	\N	\N
1807	362	359	Confort	\N	\N
1808	362	360	No	\N	\N
1809	362	361	100x190	\N	\N
1810	362	362	15 cm	\N	\N
1811	363	357	Espuma	\N	\N
1812	363	358	Tejido de Punto	\N	\N
1813	363	359	Confort	\N	\N
1814	363	360	No	\N	\N
1815	363	361	120x190	\N	\N
1816	363	362	15 cm	\N	\N
1817	364	357	Espuma	\N	\N
1818	364	358	Tejido de Punto	\N	\N
1819	364	359	Confort	\N	\N
1820	364	360	No	\N	\N
1821	364	361	130x190	\N	\N
1822	364	362	15 cm	\N	\N
1823	365	357	Espuma	\N	\N
1824	365	358	Tejido de Punto	\N	\N
1825	365	359	Confort	\N	\N
1826	365	360	No	\N	\N
1827	365	361	140x190	\N	\N
1828	365	362	15 cm	\N	\N
1829	366	357	Espuma	\N	\N
1830	366	358	Tejido de Punto	\N	\N
1831	366	359	Confort	\N	\N
1832	366	360	No	\N	\N
1833	366	361	90x190	\N	\N
1834	367	357	Espuma	\N	\N
1835	367	358	Tejido de Punto	\N	\N
1836	367	359	Confort	\N	\N
1837	367	360	No	\N	\N
1838	367	361	100x180	\N	\N
1839	367	362	22 cm	\N	\N
1840	368	357	Espuma	\N	\N
1841	368	358	Tejido de Punto	\N	\N
1842	368	359	Confort	\N	\N
1843	368	360	No	\N	\N
1844	368	361	120x180	\N	\N
1845	368	362	22 cm	\N	\N
1846	369	357	Espuma	\N	\N
1847	369	358	Tejido de Punto	\N	\N
1848	369	359	Confort	\N	\N
1849	369	360	No	\N	\N
1850	369	361	140x190	\N	\N
1851	369	362	22 cm	\N	\N
1852	370	357	Espuma	\N	\N
1853	370	358	Tejido de Punto	\N	\N
1854	370	359	Confort	\N	\N
1855	370	360	No	\N	\N
1856	370	361	160x190	\N	\N
1857	370	362	22 cm	\N	\N
1858	371	357	Espuma	\N	\N
1859	371	358	Tejido de Punto	\N	\N
1860	371	359	Confort	\N	\N
1861	371	360	No	\N	\N
1862	371	361	200x200	\N	\N
1863	371	362	22 cm	\N	\N
1864	372	357	Espuma	\N	\N
1865	372	358	Tejido de Punto	\N	\N
1866	372	359	Confort	\N	\N
1867	372	360	No	\N	\N
1868	372	361	100x190	\N	\N
1869	372	362	21 cm	\N	\N
1870	373	357	Espuma	\N	\N
1871	373	358	Tejido de Punto	\N	\N
1872	373	359	Confort	\N	\N
1873	373	360	No	\N	\N
6930	784	484	5.1 m/s² 3)	\N	\N
6931	784	485	2.9 m/s² 3)	\N	\N
6932	785	47	36.3 cm³	\N	\N
6933	785	11	2.10 bhp	\N	\N
6934	785	486	864 g/kWh	\N	\N
6935	785	477	6.5 kg 1)	\N	\N
6937	785	479	27.4 fl oz (US)	\N	\N
6938	785	480	810 cm³	\N	\N
6939	785	481	181 cm	\N	\N
6940	785	482	99 dB(A) 2)	\N	\N
6941	785	483	108 dB(A) 2)	\N	\N
6942	785	484	5 m/s² 3)	\N	\N
6943	785	485	5.8 m/s² 3)	\N	\N
6944	786	47	40.2 cm³	\N	\N
6945	786	11	2.10 bhp	\N	\N
6946	786	477	6.3 kg 1)	\N	\N
6947	786	478	420 mm	\N	\N
6949	786	480	640 cm³	\N	\N
6950	786	481	176 / 177 cm	\N	\N
6951	786	482	100.0 / 98.0 dB(A) 2)	\N	\N
6952	786	483	109 dB(A) 2)	\N	\N
6953	786	484	5.7 / 6.4 m/s² 3)	\N	\N
6954	786	485	4.3 / 3.4 m/s² 3)	\N	\N
6955	787	47	30.8 cm³	\N	\N
6956	787	11	1.70 bhp	\N	\N
6957	787	477	6.4 kg 1)	\N	\N
6958	787	478	420 mm	\N	\N
6959	787	479	21.6 fl oz (US)	\N	\N
6960	787	480	640 cm³	\N	\N
6961	787	481	176 cm	\N	\N
6962	787	482	97 dB(A) 2)	\N	\N
6964	787	484	4.9 m/s² 3)	\N	\N
6965	787	485	2.8 m/s² 3)	\N	\N
6966	788	47	37.7 cm³	\N	\N
6967	788	11	2 bhp	\N	\N
6968	788	477	7.6 kg 1)	\N	\N
6969	788	478	420 mm	\N	\N
6970	788	479	25.4 fl oz (US)	\N	\N
6971	788	480	750 cm³	\N	\N
6972	788	481	178 cm	\N	\N
6973	788	482	98 dB(A) 2)	\N	\N
6974	788	483	109 dB(A) 2)	\N	\N
6975	788	484	6 m/s² 3)	\N	\N
6976	788	485	4 m/s² 3)	\N	\N
6977	789	47	37.7 cm³	\N	\N
6978	789	11	2.30 bhp	\N	\N
6980	789	478	420 mm	\N	\N
6981	789	479	25.4 fl oz (US)	\N	\N
6982	789	480	750 cm³	\N	\N
6983	789	481	178 cm	\N	\N
6984	789	482	99 dB(A) 2)	\N	\N
6985	789	483	110 dB(A) 2)	\N	\N
6986	789	484	5.8 m/s² 3)	\N	\N
6987	789	485	4.6 m/s² 3)	\N	\N
6988	790	47	41.6 cm³	\N	\N
6989	790	11	2.70 bhp	\N	\N
6990	790	477	8.1 kg 1)	\N	\N
6991	790	478	420 mm	\N	\N
6993	790	480	750 cm³	\N	\N
6994	790	481	178 cm	\N	\N
6995	790	482	100 dB(A) 2)	\N	\N
6996	790	483	111 dB(A) 2)	\N	\N
6997	790	484	4.6 m/s² 3)	\N	\N
6998	790	485	4.2 m/s² 3)	\N	\N
6999	791	47	37.7 cm³	\N	\N
7000	791	11	2.30 bhp	\N	\N
7001	791	477	8.8 kg 1)	\N	\N
7002	791	478	420 mm	\N	\N
7003	791	479	25.4 fl oz (US)	\N	\N
7004	791	480	750 cm³	\N	\N
7005	791	481	185 cm	\N	\N
1876	374	357	Espuma	\N	\N
1877	374	358	Tejido de Punto	\N	\N
1878	374	359	Confort	\N	\N
1879	374	360	No	\N	\N
1880	374	361	130x190	\N	\N
1881	374	362	21 cm	\N	\N
1882	375	357	Espuma	\N	\N
1883	375	358	Tejido de Punto	\N	\N
1884	375	359	Confort	\N	\N
1885	375	360	No	\N	\N
1886	375	361	140x190	\N	\N
1887	375	362	21 cm	\N	\N
1888	376	357	Espuma	\N	\N
1889	376	358	Tejido de Punto	\N	\N
1890	376	359	Confort	\N	\N
1891	376	360	No	\N	\N
1892	376	361	160x190	\N	\N
1893	376	362	21 cm	\N	\N
1894	377	357	Espuma	\N	\N
1895	377	358	Jacquard	\N	\N
1896	377	359	Firmeza y Confort	\N	\N
1897	377	360	Sí	\N	\N
1898	377	361	100x190	\N	\N
1899	377	362	25 cm	\N	\N
1900	378	357	Espuma	\N	\N
1901	378	358	Jacquard	\N	\N
1902	378	359	Firmeza y Confort	\N	\N
1903	378	360	Sí	\N	\N
1904	378	361	120x190	\N	\N
1905	378	362	25 cm	\N	\N
1906	379	357	Espuma	\N	\N
1907	379	358	Jacquard	\N	\N
1908	379	359	Firmeza y Confort	\N	\N
1909	379	360	Sí	\N	\N
1910	379	361	140x190	\N	\N
1911	379	362	25 cm	\N	\N
1912	380	357	Espuma	\N	\N
1913	380	358	Jacquard	\N	\N
1914	380	359	Firmeza y Confort	\N	\N
1915	380	360	Sí	\N	\N
1916	380	361	160x190	\N	\N
1917	380	362	25 cm	\N	\N
1918	381	357	Espuma	\N	\N
1919	381	358	Jacquard	\N	\N
1920	381	359	Firmeza y Confort	\N	\N
1921	381	360	Sí	\N	\N
1922	381	361	200x200	\N	\N
1923	381	362	25 cm	\N	\N
1924	382	357	Resorte	\N	\N
1925	382	358	Tejido de Punto	\N	\N
1926	382	359	Confort	\N	\N
1927	382	360	Sí	\N	\N
1928	382	361	140x190	\N	\N
1929	382	362	24 cm	\N	\N
1930	383	357	Resorte	\N	\N
1931	383	358	Tejido de Punto	\N	\N
1932	383	359	Confort	\N	\N
1933	383	360	Sí	\N	\N
1934	383	361	160x190	\N	\N
1935	383	362	24 cm	\N	\N
1936	384	357	Resorte	\N	\N
1937	384	358	Tejido de Punto	\N	\N
1938	384	359	Confort	\N	\N
1939	384	360	Sí	\N	\N
1940	384	361	200x200	\N	\N
1941	384	362	24 cm	\N	\N
1942	385	357	Resorte	\N	\N
1943	385	358	Tejido de Punto	\N	\N
1944	385	359	Firmeza y Confort	\N	\N
1945	385	360	No	\N	\N
1946	385	361	140x190	\N	\N
1947	386	357	Resorte	\N	\N
1948	386	358	Tejido de Punto	\N	\N
1949	386	359	Confort	\N	\N
1950	386	360	No	\N	\N
1951	386	361	140x190	\N	\N
1952	387	357	Resorte	\N	\N
1953	387	358	Tejido de Punto	\N	\N
1954	387	359	Confort	\N	\N
1955	387	360	No	\N	\N
1956	387	361	160x190	\N	\N
1957	388	357	Resorte	\N	\N
1958	388	358	Tejido de Punto	\N	\N
1959	388	359	Confort	\N	\N
1960	388	360	No	\N	\N
1961	388	361	200x200	\N	\N
757	389	98	8806096406090	\N	\N
762	389	103	Procesador α5 AI Gen6	\N	\N
765	389	106	8 modos (Vívido, Estándar, Eco, Cine, Deportes, Juego, (ISF)Experto(Habitación luminosa), (ISF)Experto(Habitación oscura))	\N	\N
818	391	135	AI Chatbot, Voice ID, Vista múltiple	\N	\N
839	392	142	IA Sound Pro α7 (Virtual 9.1.2 Up-mix)	\N	\N
866	393	148	1 235 x 715 x 57,5 mm	\N	\N
880	394	149	1 455 x 904 x 269 mm	\N	\N
895	397	132	Virtual 9.1.2 Up-mix	\N	\N
900	398	137	45,2 kg	\N	\N
911	399	103	Procesador α8 IA 4K	\N	\N
921	399	159	IA Sound Pro α8 (Virtual 9.1.2 Up-mix)	\N	\N
947	402	171	33 x 105.6 x 36.8 cm	\N	\N
964	403	188	Correa, Cable USB tipo C	\N	\N
980	404	202	Google Assistant, Siri	\N	\N
988	404	210	Cable USB tipo C, Correa de transporte, Tarjeta de garantía	\N	\N
1020	408	231	TurboWash, TurboDrum, JetSpray, EasyUnload	\N	\N
1037	412	241	TurboWash	\N	\N
1044	413	247	Panel Táctil con pantalla LED	\N	\N
1059	415	256	LED superior en refrigerador y congelador	\N	\N
1074	417	255	Smart Inverter Compressor, Smart Diagnosis, Luz LED superior	\N	\N
1106	419	278	Doble (Spaceplus + Hielo Esférico Craft Ice)	\N	\N
2323	482	368	Mecánica	\N	\N
2325	482	370	Euro III	\N	\N
2326	482	371	Negro gris, Negro rojo, Negro azul	\N	\N
2327	482	372	2.75 - 17 M 41 P	\N	\N
2328	482	373	3.00 - 17 M 50 P	\N	\N
2329	482	374	1.955 mm x 754 mm x 1.050 mm	\N	\N
2330	482	375	1.245 mm	\N	\N
2331	482	156	97 Kilogramos	\N	\N
2332	482	376	Tambor, sistema CBS	\N	\N
2333	482	377	Tambor, sistema CBS	\N	\N
2334	482	378	Telescópica	\N	\N
2336	483	363	124.7 cc	\N	\N
2340	483	368	Mecánica	\N	\N
2341	483	369	Eléctrico y de pedal	\N	\N
2342	483	370	Euro III	\N	\N
2343	483	371	Rojo, Gris	\N	\N
2344	483	372	80/100 - 18 M 47 P	\N	\N
2345	483	373	90/90 - 18 M 51 P	\N	\N
2346	483	374	2.037 mm x 772 mm x 1.070 mm	\N	\N
2347	483	375	1.310 mm	\N	\N
2348	483	156	117 Kilogramos	\N	\N
2349	483	376	Disco CBS	\N	\N
2350	483	377	Tambor 130 mm	\N	\N
2351	483	378	Horquilla Telescópica	\N	\N
2352	483	379	Brazo Oscilante	\N	\N
2353	484	369	Eléctrico y de Pedal	\N	\N
2354	484	370	EURO III	\N	\N
7009	791	485	2.7 m/s² 3)	\N	\N
2356	484	363	109.1 cc	\N	\N
2357	484	364	OHC, Monocilíndrico, 4 tiempos, refrigerado por aire	\N	\N
2358	484	365	8,11 Hp @ 7.500 rpm	\N	\N
2359	484	366	8.45 Nm @ 6.000 rpm	\N	\N
2360	484	367	9:0 a 1	\N	\N
2361	484	368	4 velocidades	\N	\N
2362	484	376	Disco CBS	\N	\N
2363	484	377	Tambor	\N	\N
2364	484	378	Telescópica	\N	\N
2365	484	379	Doble Amortiguador	\N	\N
2366	484	372	70/90-17	\N	\N
2367	484	373	80/90-17	\N	\N
2368	484	374	1.897 x 706 x 1.083 mm	\N	\N
2369	484	375	1.227 mm	\N	\N
2370	484	156	101 kg	\N	\N
2371	485	363	184.4 cc	\N	\N
2373	485	365	16,4 HP / 8.500 RPM	\N	\N
2374	485	366	15,5 Nm / 6.000 RPM	\N	\N
2375	485	367	9,5 : 1	\N	\N
2376	485	368	5 Velocidades	\N	\N
2377	485	369	Eléctrico	\N	\N
2378	485	370	EURO III	\N	\N
2379	485	371	Negro, Rojo	\N	\N
2380	485	372	110/70 - R 17	\N	\N
2381	485	373	140/70 - R 17	\N	\N
2382	485	374	2034 x 783 x 1064 mm	\N	\N
2383	485	375	1.355 mm	\N	\N
2384	485	156	141 kg	\N	\N
2385	485	376	Disco - ABS	\N	\N
2386	485	377	Disco - ABS	\N	\N
2387	485	378	Telescópica invertida	\N	\N
2388	485	379	Monoamortiguada	\N	\N
2389	486	363	293.52cc	\N	\N
2391	486	365	24,1 hp @ 7500rpm	\N	\N
2392	486	366	25,6 N-m a 5500 rpm	\N	\N
2393	486	367	9,3:1	\N	\N
2394	486	368	Embrague multidisco en baño de aceite	\N	\N
2395	486	369	Arranque automático	\N	\N
2396	486	370	Euro III	\N	\N
2397	486	371	Rojo, Azul mate, Gris mate	\N	\N
2398	486	372	110/70R-17M/C 54H	\N	\N
2399	486	373	150/60R-17M/C 66H	\N	\N
2400	486	374	2084 x 765 x 1075 mm	\N	\N
2401	486	375	1390 mm	\N	\N
2402	486	156	153 Kg (vacio)	\N	\N
2403	486	376	Disco 276mm ABS	\N	\N
2404	486	377	Disco 220mm ABS	\N	\N
2405	486	378	Telescópica (USD) SHOWA	\N	\N
2406	486	379	Monoamortiguador	\N	\N
2407	487	363	109.2 cc	\N	\N
2408	487	364	4T OHC - Refrigerado por aire	\N	\N
2409	487	365	7.9 Hp @ 7500 Rpm	\N	\N
2410	487	366	8.9 Nm @ 5000 Rpm	\N	\N
2411	487	367	9.5	\N	\N
2412	487	368	Automatica V-Matic	\N	\N
2413	487	369	Eléctrico y Pedal	\N	\N
2414	487	370	EURO III	\N	\N
2415	487	371	Gris Mate	\N	\N
2416	487	372	90/100 – 10	\N	\N
2417	487	373	90/100 – 10	\N	\N
2419	487	375	1.238 mm	\N	\N
2420	487	156	104 Kg	\N	\N
2421	487	376	Tambor 130 mm – Combinado	\N	\N
2422	487	377	Tambor 130 mm	\N	\N
2423	487	378	Doble brazo articulado	\N	\N
2424	487	379	Brazo Oscilante	\N	\N
2425	488	363	109,2 c.c.	\N	\N
2426	488	364	4T OHC - Refrigerado por Aire	\N	\N
2427	488	365	7,9 Hp @ 7500 rpm	\N	\N
2428	488	366	8,9 Nm @ 5000 rpm	\N	\N
2429	488	367	9.5	\N	\N
2430	488	368	Automatica V-Matic	\N	\N
2431	488	369	Eléctrico y Pedal	\N	\N
2432	488	370	EURO III	\N	\N
2434	488	376	Tambor 130 mm – Combinado	\N	\N
2435	488	377	Tambor 130 mm	\N	\N
2436	488	378	Doble brazo articulado	\N	\N
2437	488	379	Brazo Oscilante	\N	\N
2438	488	372	90/100 – 10	\N	\N
2439	488	373	90/100 – 10	\N	\N
2440	488	374	1.781 x 710 x 1.113 mm	\N	\N
2441	488	375	1.238 mm	\N	\N
2442	488	156	104 Kg	\N	\N
2443	489	363	109,19 cm³	\N	\N
2445	489	365	7,9 Hp @ 7.500 rpm	\N	\N
2446	489	366	8.91 Nm @ 5.000 rpm	\N	\N
2447	489	367	9.5 : 1	\N	\N
2448	489	368	Automática (V-Matic)	\N	\N
2449	489	369	Eléctrico / Pedal	\N	\N
2450	489	370	EURO III	\N	\N
2451	489	371	Rojo, Negro, Blanco, Naranja, Azul	\N	\N
2452	489	376	Tambor 130 mm	\N	\N
2453	489	377	Tambor 130 mm	\N	\N
2454	489	378	Telescópica	\N	\N
2455	489	379	Telescópica/ Unidad mono-amortiguada	\N	\N
2456	489	372	90/90-12	\N	\N
2457	489	373	90/100-10	\N	\N
2458	489	374	1.805 mm x 748 mm x 1.039 mm	\N	\N
2459	489	375	1.286 mm	\N	\N
2460	489	156	101 kg	\N	\N
2461	490	363	109,19 cm³	\N	\N
2462	490	364	Monocilíndrico, 4 tiempos, 2 válvulas, OHC refrigerado por aire	\N	\N
2463	490	365	7,9 Hp @ 7.500 rpm	\N	\N
2464	490	366	8.91 Nm @ 5.000 rpm	\N	\N
2465	490	367	9.5 : 1	\N	\N
2466	490	368	Automática (V-Matic)	\N	\N
2467	490	369	Eléctrico / Pedal	\N	\N
2468	490	370	EURO III	\N	\N
2469	490	371	Negro, Rojo	\N	\N
2470	490	376	Tambor 130 mm	\N	\N
2471	490	377	Tambor 130 mm	\N	\N
2472	490	378	Telescópica	\N	\N
2473	490	379	Telescópica/ Unidad mono-amortiguada	\N	\N
2474	490	372	90/90-12	\N	\N
2475	490	373	90/100-10	\N	\N
2476	490	374	1.805 mm x 748 mm x 1.039 mm	\N	\N
2477	490	375	1.286 mm	\N	\N
2478	490	156	101 kg	\N	\N
2480	491	381	Bluetooth, Honda RoadSync	\N	\N
2481	491	382	Tipo C	\N	\N
2482	491	383	30 Litros	\N	\N
2483	491	384	Full LED	\N	\N
2484	491	363	156.9 cc	\N	\N
2485	491	364	Monocilindro, 4 tiempos, OHC, 4 válvulas, refrigeración liquida	\N	\N
2486	491	365	15.8 HP a 8.500 rpm	\N	\N
2487	491	366	14.7 Nm a 6.500 rpm	\N	\N
2488	491	367	12.0: 1	\N	\N
2489	491	368	Automática, tipo CVT	\N	\N
2490	491	376	Hidráulico, Disco Único de 220 mm Sistema ABS	\N	\N
2491	491	377	Hidráulico, Disco único de 220 mm.	\N	\N
2492	491	378	Horquilla telescopica, 31 mm diametro, 89 mm de recorrido	\N	\N
2493	491	379	Twin, 95 mm de recorrido	\N	\N
2494	491	372	110/70 - 14 M/C 50P (tubeless)	\N	\N
2495	491	373	130/70 - 13 M/C 63P (tubeless)	\N	\N
2496	491	374	1935 x 742 x 1108 mm	\N	\N
2497	491	375	1.313 mm	\N	\N
2498	491	156	126 Kg	\N	\N
2499	492	363	149.1 cc	\N	\N
2500	492	364	4 Tiempos OHC, Refrigerado por aire	\N	\N
2501	492	365	11.7 Hp @ 8000 rpm	\N	\N
2502	492	366	12.1 NM @ 6000 rpm	\N	\N
2503	492	367	9.5 : 1	\N	\N
2504	492	368	Mecánica	\N	\N
2505	492	376	Disco ABS	\N	\N
2506	492	377	Tambor	\N	\N
2507	492	378	Telescópica	\N	\N
2508	492	379	Monoamortiguador PRO ARM	\N	\N
2509	492	372	90/90-19	\N	\N
2510	492	373	110/90-17	\N	\N
2511	492	374	2091 x 811 x 1125 mm	\N	\N
2512	492	375	1.358 mm	\N	\N
2513	492	156	129 Kg	\N	\N
2514	492	369	Eléctrico y de pedal	\N	\N
2515	492	370	EURO III	\N	\N
2516	492	371	Blanco, Negro, Rojo	\N	\N
2517	493	363	184 cc	\N	\N
2518	493	364	4 Tiempos OHC, Refrigerado por aire	\N	\N
2519	493	365	15,6 Hp @ 8500 rpm	\N	\N
2520	493	366	15,7 Nm @ 6000 rpm	\N	\N
2521	493	367	9.5 : 1	\N	\N
2522	493	368	Mecánica	\N	\N
2523	493	376	Disco ABS unicanal	\N	\N
2524	493	377	Disco	\N	\N
2525	493	378	Telescópica	\N	\N
2526	493	379	Monosuspensión PRO ARM	\N	\N
2527	493	372	90 / 90-19	\N	\N
2528	493	373	110 / 90-17	\N	\N
2529	493	374	2075 x 812 x 1124 mm	\N	\N
2530	493	375	1.351 mm	\N	\N
2531	493	156	133 Kg	\N	\N
2532	493	369	Eléctrico y de pedal	\N	\N
2533	493	370	EURO III	\N	\N
2534	493	371	Beige, Rojo, Blanco	\N	\N
2535	494	363	293 cc	\N	\N
2536	494	364	4 tiempos, 4 válvulas, monocilíndrico, OHC y refrigerado por aire y aceite	\N	\N
2537	494	365	24,3 HP a 7.500 rpm	\N	\N
2538	494	366	26,5 Nm a 5.750 rpm	\N	\N
2539	494	367	9.3 : 1	\N	\N
2540	494	368	Mecánica	\N	\N
2541	494	376	Disco; sistema ABS delantero	\N	\N
2542	494	377	Disco; sistema ABS trasero	\N	\N
2543	494	378	Horquilla telescópica convencional Showa 221 mm de recorrido	\N	\N
2544	494	379	Monoshock Pro-Link Showa ajuste en precarga 7 posiciones	\N	\N
2545	494	372	90 / 90-21	\N	\N
2546	494	373	120 / 80-18	\N	\N
2547	494	374	2202 x 828 x 1298 mm	\N	\N
2548	494	375	1.429 mm	\N	\N
2549	494	156	143 Kg	\N	\N
2550	494	369	Eléctrico	\N	\N
2551	494	370	EURO III	\N	\N
2552	494	371	Rojo, Blanco, Gris	\N	\N
2553	495	363	184.4 cc	\N	\N
2554	495	364	4T - OHC - Refrigerado por aire	\N	\N
2555	495	365	16,4 HP / 8.500 RPM	\N	\N
2556	495	366	15,5 Nm / 6.000 RPM	\N	\N
2557	495	367	9,5 : 1	\N	\N
2558	495	368	5 Velocidades	\N	\N
2559	495	376	Disco - ABS	\N	\N
2560	495	377	Disco - ABS	\N	\N
2561	495	378	Telescópica invertida	\N	\N
2562	495	379	Mono suspensión	\N	\N
2563	495	372	110/70 - R 17	\N	\N
2564	495	373	140/70 - R 17	\N	\N
2565	495	374	2035 x 843 x 1248 mm	\N	\N
2566	495	375	1.355 mm	\N	\N
2567	495	156	146 kg	\N	\N
2568	495	369	Eléctrico	\N	\N
2569	495	370	EURO III	\N	\N
2570	495	371	Rojo, Negro	\N	\N
2571	496	363	162.71 cc	\N	\N
2572	496	364	4T OHC – Refrigerado por aire	\N	\N
2573	496	365	13.7 HP @ 8000 rpm	\N	\N
2574	496	366	14.7 Nm @ 5500 rpm	\N	\N
2575	496	367	10.0 a 1	\N	\N
2576	496	376	Disco con ABS	\N	\N
2577	496	377	Disco	\N	\N
2578	496	378	Telescópica	\N	\N
2579	496	379	Mono amortiguador	\N	\N
2580	496	372	80/100-17	\N	\N
2581	496	373	130/70-17	\N	\N
2582	496	374	2.013 x 786 x 1.115 mm	\N	\N
2583	496	375	1.347 mm	\N	\N
2584	496	156	144 kg	\N	\N
2585	496	369	Eléctrico y pedal	\N	\N
2586	496	370	EURO III	\N	\N
2587	496	371	Gris, Negro, Rojo, Azul	\N	\N
2588	497	363	162.71 cc	\N	\N
2589	497	364	4T OHC – Refrigerado por aire	\N	\N
2590	497	365	13.7 HP @ 8000 rpm	\N	\N
2591	497	366	14.7 Nm @ 5500 rpm	\N	\N
2592	497	367	10.0 a 1	\N	\N
2593	497	376	Disco con ABS	\N	\N
2594	497	377	Disco	\N	\N
2595	497	378	Telescópica	\N	\N
2596	497	379	Mono amortiguador	\N	\N
2597	497	372	80/100-17	\N	\N
2598	497	373	130/70-17	\N	\N
2599	497	374	2.013 x 786 x 1.115 mm	\N	\N
2600	497	375	1.347 mm	\N	\N
2601	497	156	144 kg	\N	\N
2602	497	369	Eléctrico y pedal	\N	\N
2603	497	370	EURO III	\N	\N
2604	497	371	Gris, Negro, Rojo, Azul	\N	\N
7011	792	11	1.70 bhp	\N	\N
7012	792	477	6.4 kg 1)	\N	\N
7014	792	479	21.6 fl oz (US)	\N	\N
7015	792	480	640 cm³	\N	\N
7016	792	481	176 cm	\N	\N
7017	792	482	97 dB(A) 2)	\N	\N
7018	792	483	107 dB(A) 2)	\N	\N
7019	792	484	4.9 m/s² 3)	\N	\N
7021	793	47	40.2 cm³	\N	\N
7022	793	11	2.10 bhp	\N	\N
7023	793	477	10.1 kg 1)	\N	\N
7024	793	478	420 mm	\N	\N
7026	793	480	810 cm³	\N	\N
7027	793	481	272 cm	\N	\N
7028	793	482	111 dB(A) 2)	\N	\N
7029	793	483	109 dB(A) 2)	\N	\N
7030	793	484	4.4 m/s² 3)	\N	\N
7031	793	485	5.8 m/s² 3)	\N	\N
7032	794	47	36.3 cm³	\N	\N
7033	794	11	2.10 bhp	\N	\N
7034	794	486	864 g/kWh	\N	\N
7035	794	477	10.3 kg 1)	\N	\N
7036	794	478	420 mm	\N	\N
7037	794	479	27.4 fl oz (US)	\N	\N
7038	794	480	810 cm³	\N	\N
7039	794	481	275 cm	\N	\N
7041	794	483	108 dB(A) 2)	\N	\N
7042	794	484	2.2 m/s² 3)	\N	\N
7043	794	485	4.9 m/s² 3)	\N	\N
7044	795	479	18 l	\N	\N
7045	795	499	398 mm	\N	\N
7046	795	500	548 mm	\N	\N
7047	796	47	27.2 cm³	\N	\N
7048	796	11	1.10 bhp	\N	\N
7049	796	477	7.8 kg 1)	\N	\N
7050	796	479	35.5 fl oz (US)	\N	\N
7051	796	480	1050 cm³	\N	\N
7052	796	501	780 m³/h	\N	\N
7053	796	502	9 m	\N	\N
7055	796	500	540 mm	\N	\N
7056	797	47	56.5 cm³	\N	\N
7057	797	11	2.60 kW	\N	\N
7058	797	477	10.8 / 11.1 kg 1)	\N	\N
7059	797	479	50.7 fl oz (US)	\N	\N
7060	797	480	1500 cm³	\N	\N
7061	797	501	1260 m³/h	\N	\N
7062	797	502	12 m	\N	\N
7063	797	499	480 mm	\N	\N
7064	797	500	625 mm	\N	\N
7066	797	483	113 dB(A) 2)	\N	\N
7067	797	492	2.3 m/s² 3)	\N	\N
7068	798	47	63.3 cm³	\N	\N
7069	798	11	2.90 kW	\N	\N
7070	798	477	12.1 kg 1)	\N	\N
7071	798	479	57.5 fl oz (US)	\N	\N
7072	798	480	1700 cm³	\N	\N
7073	798	501	1300 m³/h	\N	\N
7074	798	502	14.5 m	\N	\N
7075	799	47	63.3 cm³	\N	\N
7076	799	11	2.90 kW	\N	\N
7077	799	477	12.6 kg 1)	\N	\N
7078	799	479	57.5 fl oz (US)	\N	\N
7079	799	480	1700 cm³	\N	\N
7080	799	501	1300 m³/h	\N	\N
7082	799	499	423 mm	\N	\N
7083	799	500	751 mm	\N	\N
7084	799	482	97 dB(A) 2)	\N	\N
7085	799	483	108 dB(A) 2)	\N	\N
7086	799	492	1.9 m/s² 3)	\N	\N
7087	800	47	63.3 cm³	\N	\N
7088	800	11	2.90 kW	\N	\N
7089	800	477	12.7 kg 1)	\N	\N
7090	800	479	57.5 fl oz (US)	\N	\N
7091	800	480	1700 cm³	\N	\N
7092	800	501	1300 m³/h	\N	\N
7093	800	502	14.5 m	\N	\N
7095	801	471	1400 W	\N	\N
7096	801	504	5.3 kg 1)	\N	\N
7097	801	505	200 / 210 mbar	\N	\N
7098	801	506	127 cf/min	\N	\N
7099	801	507	3.2 gal (US)	\N	\N
7100	801	508	IPX4	\N	\N
7101	801	509	2 m	\N	\N
7102	801	510	37 mm	\N	\N
7103	801	482	73 dB(A) 2)	\N	\N
7104	802	503	120 V/1 PH/60 Hz	\N	\N
7105	802	505	210 mbar	\N	\N
7106	803	47	27.2 cm³	\N	\N
7107	803	11	1 bhp	\N	\N
7109	803	477	5.0 / 5.1 kg 1)	\N	\N
7110	803	512	60 cm	\N	\N
7111	803	513	30 mm	\N	\N
7112	803	482	98.0 / 97.0 dB(A) 2)	\N	\N
7113	803	483	104.0 / 106.0 dB(A) 2)	\N	\N
7114	803	491	5.6 / 10.0 m/s² 3)	\N	\N
7115	803	492	9.7 / 9.0 m/s² 3)	\N	\N
7116	803	486	975 g/kWh	\N	\N
7117	803	514	110 cm	\N	\N
7118	804	47	22.7 cm³	\N	\N
7119	804	11	0.90 bhp	\N	\N
7120	804	511	3200 r/min	\N	\N
7121	804	486	967 g/kWh	\N	\N
7123	804	512	60 cm	\N	\N
7124	804	513	38 mm	\N	\N
7125	804	482	94 dB(A) 2)	\N	\N
7126	804	491	2.2 / 2.7 m/s² 3)	\N	\N
7127	804	492	2.8 / 3.1 m/s² 3)	\N	\N
7128	804	514	120 cm	\N	\N
7129	804	483	106 dB(A) 2)	\N	\N
7130	805	469	120 - 127 V	\N	\N
7131	805	515	1	\N	\N
7132	805	471	1.50 kW	\N	\N
7133	805	516	21000 r/min	\N	\N
7134	805	517	7 kg 1)	\N	\N
7135	805	518	70 bar	\N	\N
7136	805	519	100 bar 2)	\N	\N
7137	805	520	310 l/h	\N	\N
7138	805	521	430 l/h	\N	\N
7140	805	523	60 Hz	\N	\N
7141	805	524	5 m	\N	\N
7142	805	525	5 m	\N	\N
7143	806	469	127 / 120 V	\N	\N
7144	806	471	1.60 / 1.40 kW	\N	\N
7145	806	515	1	\N	\N
7146	806	516	3450 r/min	\N	\N
7147	806	517	17.6 kg 1)	\N	\N
7148	806	518	95 / 84 bar	\N	\N
7149	806	519	1880 / 1450 psi 2)	\N	\N
7150	806	520	355 l/h	\N	\N
7151	806	521	440 l/h	\N	\N
7153	806	523	60 Hz	\N	\N
7154	806	524	7 m	\N	\N
7155	806	525	5 m	\N	\N
7156	806	482	73 dB(A)	\N	\N
7157	806	483	85 dB(A)	\N	\N
7158	806	526	2 dB(A) 3)	\N	\N
7159	806	527	2 dB(A) 3)	\N	\N
7160	806	491	0.9 m/s² 4)	\N	\N
7161	806	492	1.8 m/s² 4)	\N	\N
7162	807	469	127 V	\N	\N
7163	807	515	1	\N	\N
7164	807	471	1.60 kW	\N	\N
7166	807	517	19.1 kg 1)	\N	\N
7167	807	518	1370 psi	\N	\N
7168	807	519	2030 psi 2)	\N	\N
7169	807	520	355 l/h	\N	\N
7170	807	521	440 l/h	\N	\N
7257	886	548	Titanio 44mm	\N	\N
7258	886	549	80 onzas	\N	\N
7259	887	221	72 x 46 x 38 cm	\N	\N
7260	887	3	Negro	\N	\N
7261	887	4	Gabinete de polímero de alta densidad con aislamiento acústico	\N	\N
7262	887	5	24kg	\N	\N
7263	887	550	Bi-AMP Clase H	\N	\N
7264	887	11	800W RMS	\N	\N
7265	888	221	112 x 46 x 40 cm	\N	\N
7266	888	3	Negro Industrial	\N	\N
7267	888	4	Estructura de madera con recubrimiento elastómero resistente	\N	\N
7268	888	5	26kg	\N	\N
7269	888	551	Doble ventilador activo y EQ gráfico	\N	\N
7272	891	221	100cm x 190cm x 30cm	\N	\N
7273	892	221	120cm x 190cm	\N	\N
7274	893	221	140cm x 190cm	\N	\N
7275	894	221	2 módulos de 70cm x 190cm cada uno	\N	\N
7276	895	221	Total 160cm x 190cm	\N	\N
7277	896	221	2 módulos de 100cm x 200cm	\N	\N
7278	897	221	140cm x 190cm	\N	\N
7280	899	221	240cm x 160cm	\N	\N
7281	899	3	Gris Ártico / Beige	\N	\N
7282	899	358	Lona tipo exportación	\N	\N
7283	899	553	Pino inmunizado	\N	\N
7284	900	221	250cm x 170cm	\N	\N
7285	900	3	Azul Petróleo	\N	\N
7286	900	358	Microfibra antipelusa	\N	\N
7287	900	553	Roble	\N	\N
7288	901	221	210cm x 150cm	\N	\N
7289	901	3	Plata	\N	\N
7290	901	358	Velvet premium	\N	\N
7291	901	553	Cedro	\N	\N
7292	902	221	260cm x 180cm	\N	\N
7293	902	3	Café Tabaco	\N	\N
7294	902	358	Cuerotex de alta resistencia	\N	\N
7295	902	553	Pino	\N	\N
7296	903	221	230cm x 160cm	\N	\N
7297	903	3	Gris Jaspeado	\N	\N
7298	903	358	Lino pesado	\N	\N
7299	903	553	Fresno	\N	\N
7300	904	221	220cm ancho	\N	\N
7301	904	3	Carbón	\N	\N
7302	904	358	Sintético Premium	\N	\N
7303	904	553	Teca	\N	\N
7304	905	221	270cm x 190cm	\N	\N
7305	905	3	Arena	\N	\N
7306	905	358	Chenille	\N	\N
7307	905	553	Pino Canadiense	\N	\N
7308	906	221	Sofa 3: 200cm / Sofa 2: 150cm	\N	\N
7309	906	3	Chocolate	\N	\N
7310	906	358	Microcuero	\N	\N
7311	906	553	Pino	\N	\N
7312	907	221	290cm x 200cm	\N	\N
7313	907	3	Blanco Invierno / Gris Perla	\N	\N
7314	907	358	Jacquard seda	\N	\N
7315	907	553	Roble Americano	\N	\N
7316	908	221	60cm x 110cm (altura ajustable)	\N	\N
7317	908	3	Negro	\N	\N
7172	807	523	60 Hz	\N	\N
7254	886	3	Negro Mate	\N	\N
7256	886	5	18.5kg	\N	\N
7173	807	524	8 m	\N	\N
7174	807	525	5 m	\N	\N
7175	807	482	68 dB(A)	\N	\N
7176	807	483	80 dB(A)	\N	\N
7177	807	526	2 dB(A) 3)	\N	\N
7178	807	527	2 dB(A) 3)	\N	\N
7179	807	491	2.5 m/s² 4)	\N	\N
7180	807	492	2.5 m/s² 4)	\N	\N
7181	810	47	127 cm³	\N	\N
7182	810	528	--	\N	\N
7183	810	35	EVC 205.0	\N	\N
7184	810	486	1227 g/kWh	\N	\N
7185	810	477	30 kg	\N	\N
7186	810	529	1200 m² 1)	\N	\N
7187	810	530	46 cm	\N	\N
7188	810	531	20 - 100 mm	\N	\N
7189	810	532	2800 r/min	\N	\N
7190	810	533	52 l	\N	\N
7191	810	534	51 cm	\N	\N
7192	810	535	117 cm	\N	\N
7193	810	536	180 mm	\N	\N
7194	810	537	200 mm	\N	\N
7195	810	538	82 dB(A)	\N	\N
7196	810	539	96 dB(A)	\N	\N
7197	810	540	2 dB(A) 2)	\N	\N
7198	810	541	4.40 m/s²	\N	\N
7199	810	542	2.20 m/s² 2)	\N	\N
7200	811	47	127 cm³	\N	\N
7201	811	528	3,5 km/h	\N	\N
7202	811	35	EVC 205.0	\N	\N
7203	811	486	1227 g/kWh	\N	\N
7204	811	477	32 kg	\N	\N
7205	811	529	1800 m² 1)	\N	\N
7206	811	530	51 cm	\N	\N
7207	811	531	20 - 100 mm	\N	\N
7208	811	532	2800 r/min	\N	\N
7209	811	533	55 l	\N	\N
7210	811	534	55 cm	\N	\N
7211	811	535	117 cm	\N	\N
7212	811	536	180 mm	\N	\N
7213	811	537	200 mm	\N	\N
7214	811	538	83 dB(A)	\N	\N
7215	811	539	97 dB(A)	\N	\N
7216	811	540	2 dB(A) 2)	\N	\N
7217	811	541	4.40 m/s²	\N	\N
7218	811	542	2.20 m/s² 2)	\N	\N
7219	812	47	212 cm³	\N	\N
7220	812	528	2V + 1R	\N	\N
7221	812	35	EHC 600.0	\N	\N
7222	812	486	811 g/kWh	\N	\N
7223	812	477	61 kg	\N	\N
7224	812	480	3.6 l	\N	\N
7225	812	543	3600 r/min	\N	\N
7226	812	544	79	\N	\N
7227	812	545	31 cm	\N	\N
7228	812	546	85 cm	\N	\N
7229	812	535	105 cm	\N	\N
7271	890	221	190cm x 95cm	\N	\N
7346	915	4	Madera procesada con acabado en melamina	\N	\N
7347	915	397	Múltiples entrepaños y tubos para colgar	\N	\N
7348	916	221	Escritorio: 120cm Ancho | Biblioteca: 150cm Alto	\N	\N
7349	916	3	Duna	\N	\N
7350	916	4	Tablero de partículas de madera	\N	\N
7351	916	397	Diseño abierto tipo loft	\N	\N
7352	917	221	120cm Ancho x 190cm Largo	\N	\N
7353	917	3	Miel / Blanco	\N	\N
7354	917	4	Madera MDP de alta densidad	\N	\N
7355	917	397	No incluye colchón, base de tablones reforzada	\N	\N
7356	918	221	140cm Ancho x 183cm Alto x 47cm Fondo	\N	\N
7357	918	3	Bellota Blanco	\N	\N
7831	948	557	Disco con ABS (D) / Disco (T)	\N	\N
7832	948	5	141 kg	\N	\N
7833	948	558	12 L	\N	\N
7834	949	34	249 cm3	\N	\N
7253	886	221	70 x 45 x 40 cm	\N	\N
7255	886	4	Polipropileno reforzado con estructura interna antivibración	\N	\N
7813	946	555	13.8 Nm @ 6000 RPM	\N	\N
7318	908	358	Malla Antitranspirante	\N	\N
7319	908	553	N/A (Base Nylon)	\N	\N
7320	909	221	90cm x 100cm	\N	\N
7321	909	3	Marrón	\N	\N
7322	909	358	Microfibra térmica	\N	\N
7323	909	553	Estructura Metálica/Madera	\N	\N
7324	910	221	120cm x 80cm	\N	\N
7325	910	3	Wengue	\N	\N
7326	910	358	Microfibra	\N	\N
7327	910	553	MDF de alta densidad	\N	\N
7328	911	221	110cm x 110cm (Circular)	\N	\N
7329	911	3	Roble Claro	\N	\N
7330	911	358	Lino Gris	\N	\N
7331	911	553	Roble Macizo	\N	\N
7332	912	221	140cm x 90cm	\N	\N
7333	912	3	Negro Mate / Nogal	\N	\N
7334	912	358	Sintético Premium	\N	\N
7335	912	553	Cedro Inmunizado	\N	\N
7336	913	221	72cm Alto x 40cm Ancho x 45cm Fondo	\N	\N
7337	913	3	Gris/Madera	\N	\N
7338	913	4	Madera aglomerada MDP con recubrimiento melamínico	\N	\N
7339	913	397	Rieles metálicos y cerradura central	\N	\N
7340	914	221	150cm Ancho x 200cm Alto x 50cm Fondo	\N	\N
7341	914	3	Arena / Blanco	\N	\N
7342	914	4	Madera aglomerada de 15mm	\N	\N
7343	914	397	Bisagras de acero y manijas ergonómicas	\N	\N
7344	915	221	200cm Ancho x 200cm Alto x 52cm Fondo	\N	\N
7345	915	3	Arena / Blanco	\N	\N
7358	918	4	Madera laminada	\N	\N
7359	918	397	Puertas batientes y cajones externos con correderas	\N	\N
7835	949	222	4 tiempos, 1 cilindro, SOCS	\N	\N
7848	951	11	18.9 HP @ 10500 RPM	\N	\N
7849	951	555	14.0 Nm @ 9000 RPM	\N	\N
7850	951	556	6 velocidades	\N	\N
7851	951	557	Disco ABS (D) / Disco ABS (T)	\N	\N
7852	951	5	130 kg	\N	\N
7853	951	558	11 L	\N	\N
7854	952	34	147 cm3	\N	\N
7855	952	222	4 tiempos, DOHC, Refrigeración Líquida	\N	\N
7856	952	11	18.9 HP @ 10500 RPM	\N	\N
7857	952	555	14.0 Nm @ 9000 RPM	\N	\N
7858	952	556	6 velocidades	\N	\N
7270	889	221	180cm de largo x 90cm de profundidad (modo sofá)	\N	\N
7811	946	222	4 tiempos, 1 cilindro	\N	\N
7812	946	11	13.6 HP @ 8000 RPM	\N	\N
7814	946	556	5 velocidades	\N	\N
7815	946	557	Disco / Disco	\N	\N
7816	946	5	140 kg	\N	\N
7817	946	558	12 L	\N	\N
7818	947	34	155 cm3	\N	\N
7819	947	222	4 tiempos, 1 cilindro	\N	\N
7820	947	11	13.6 HP @ 8000 RPM	\N	\N
7821	947	555	13.8 Nm @ 6000 RPM	\N	\N
7822	947	556	5 velocidades	\N	\N
7823	947	557	Disco con ABS (D) / Disco (T)	\N	\N
7824	947	5	140 kg	\N	\N
7825	947	558	12 L	\N	\N
7826	948	34	155 cm3	\N	\N
7827	948	222	4 tiempos, SOHC	\N	\N
7828	948	11	13.6 HP	\N	\N
7836	949	11	26.1 HP @ 9000 RPM	\N	\N
7837	949	555	22.2 Nm @ 7300 RPM	\N	\N
7838	949	556	6 velocidades	\N	\N
7839	949	557	Disco ABS (D) / Disco ABS (T)	\N	\N
7840	949	5	156 kg	\N	\N
7841	949	558	12 L	\N	\N
7842	950	34	160 cm3	\N	\N
7843	950	222	4 tiempos	\N	\N
7844	950	556	5 velocidades	\N	\N
7845	950	557	Disco / Tambor	\N	\N
7846	951	34	147 cm3	\N	\N
7847	951	222	4 tiempos, DOHC, Refrigeración Líquida	\N	\N
7829	948	555	13.8 Nm	\N	\N
7830	948	556	5 velocidades	\N	\N
7698	931	556	4 velocidades	\N	\N
7699	931	557	Tambor / Tambor	\N	\N
7700	931	5	108 kg	\N	\N
7701	931	558	9.2 L	\N	\N
7702	932	34	113 cm3	\N	\N
7703	932	222	4 tiempos, 1 cilindro, SOHC	\N	\N
7704	932	11	8.03 HP @ 8000 RPM	\N	\N
7705	932	555	8.3 Nm @ 5500 RPM	\N	\N
7706	932	556	4 velocidades	\N	\N
7707	932	557	Tambor / Tambor	\N	\N
7694	931	34	113 cm3	\N	\N
7708	932	5	109 kg	\N	\N
7714	933	556	4 velocidades	\N	\N
7715	933	557	Disco con ABS (D) / Tambor (T)	\N	\N
7716	933	5	109 kg	\N	\N
7717	933	558	9.2 L	\N	\N
7718	934	34	125 cm3	\N	\N
7719	934	222	4 tiempos, 1 cilindro, SOHC	\N	\N
7720	934	11	10.4 HP @ 9000 RPM	\N	\N
7721	934	555	9.2 Nm @ 7500 RPM	\N	\N
7722	934	556	5 velocidades	\N	\N
7723	934	557	Disco / Tambor	\N	\N
7724	934	5	117 kg	\N	\N
7725	934	558	10.3 L	\N	\N
7726	935	34	125 cm3	\N	\N
7727	935	222	4 tiempos, 1 cilindro, SOHC	\N	\N
7728	935	11	10.46 HP @ 8500 RPM	\N	\N
7729	935	555	9.6 Nm @ 6500 RPM	\N	\N
7730	935	556	5 velocidades	\N	\N
7731	935	557	Disco con ABS (D) / Tambor (T)	\N	\N
7732	935	5	117 kg	\N	\N
7733	935	558	10.3 L	\N	\N
7734	936	34	112.8 cm3	\N	\N
7735	936	222	4 tiempos, refrigerado por aire	\N	\N
7736	936	11	7.5 HP @ 7000 RPM	\N	\N
7737	936	555	0.89 Kg-m @ 5000 RPM	\N	\N
7738	936	556	4 velocidades semiautomática	\N	\N
7739	936	557	Tambor / Tambor	\N	\N
7740	936	5	98.5 kg	\N	\N
7741	936	558	4.3 L	\N	\N
7742	937	34	113 cm3	\N	\N
7743	937	222	4 tiempos, SOHC	\N	\N
7744	937	11	7.5 HP @ 7000 RPM	\N	\N
7745	937	555	8.6 Nm @ 4250 RPM	\N	\N
7746	937	556	4 velocidades semiautomática	\N	\N
7747	937	557	Disco / Tambor	\N	\N
7748	937	5	102 kg	\N	\N
7749	937	558	4.3 L	\N	\N
7750	938	34	125 cm3	\N	\N
7751	938	222	4 tiempos, FI	\N	\N
7752	938	556	Automática CVT	\N	\N
7753	938	557	Disco / Tambor	\N	\N
7754	939	34	125 cm3	\N	\N
7755	939	222	4 tiempos OHC	\N	\N
7756	939	11	10.5 HP @ 9000 RPM	\N	\N
7757	939	555	9.2 Nm @ 7000 RPM	\N	\N
7758	939	556	5 velocidades	\N	\N
7759	939	557	Disco / Tambor	\N	\N
7760	939	5	126 kg	\N	\N
7761	939	558	14.2 L	\N	\N
7762	940	34	125 cm3	\N	\N
7763	940	222	4 tiempos, SOHC	\N	\N
7764	940	11	10.5 HP	\N	\N
7765	940	555	10.4 Nm	\N	\N
7766	940	556	Automática CVT	\N	\N
7767	940	557	Disco (D) / IBS Combined (T)	\N	\N
7768	940	5	123 kg	\N	\N
7769	940	558	5.2 L	\N	\N
7770	941	34	113 cm3	\N	\N
7771	941	222	4 tiempos, refrigerado por aire	\N	\N
7772	941	11	8 HP	\N	\N
7773	941	555	10 Nm	\N	\N
7774	941	556	Automática Correa en V	\N	\N
7775	941	557	Disco / Tambor	\N	\N
7776	941	5	95 kg	\N	\N
7777	941	558	5.2 L	\N	\N
7778	942	34	124 cm3	\N	\N
7779	942	222	4 tiempos, SOHC	\N	\N
7780	942	11	8.7 HP @ 6750 RPM	\N	\N
7781	942	555	10 Nm @ 5500 RPM	\N	\N
7782	942	556	Automática CVT	\N	\N
7783	942	557	Disco / Tambor	\N	\N
7784	942	5	107 kg	\N	\N
7785	942	558	5.2 L	\N	\N
7786	943	34	124 cm3	\N	\N
7787	943	222	4 tiempos, FI	\N	\N
7788	943	11	8.58 HP @ 6750 RPM	\N	\N
7789	943	555	10 Nm @ 5500 RPM	\N	\N
7790	943	556	Automática CVT	\N	\N
7791	943	557	Disco / Tambor	\N	\N
7792	943	5	108 kg	\N	\N
7793	943	558	5.6 L	\N	\N
7794	944	34	149 cm3	\N	\N
7279	898	552	Colchón resortado, Somier 140x190, Mesa de noche (nochero) y 2 Almohadas	\N	\N
7695	931	222	4 tiempos, 1 cilindro, SOHC	\N	\N
7696	931	11	8.03 HP @ 8000 RPM	\N	\N
7709	932	558	9.2 L	\N	\N
7710	933	34	113 cm3	\N	\N
7711	933	222	4 tiempos, 1 cilindro, SOHC	\N	\N
7697	931	555	8.3 Nm @ 5500 RPM	\N	\N
7712	933	11	7.1 HP	\N	\N
7713	933	555	8.3 Nm	\N	\N
7234	812	541	6.90 m/s²	\N	\N
7235	812	542	2.76 m/s² 1)	\N	\N
7236	813	47	252 cm³	\N	\N
7237	813	528	2V + 1R	\N	\N
7238	813	35	EHC 700.0	\N	\N
7239	813	486	792 g/kWh	\N	\N
7240	813	477	102 kg	\N	\N
7241	813	480	4 l	\N	\N
7242	813	543	3600 r/min	\N	\N
7243	813	544	98	\N	\N
7244	813	545	36 cm	\N	\N
7245	813	546	105 cm	\N	\N
7246	813	535	105 cm	\N	\N
7247	813	547	155 cm	\N	\N
7248	813	538	86 dB(A)	\N	\N
7249	813	539	100 dB(A)	\N	\N
7250	813	540	2 dB(A) 1)	\N	\N
7251	813	541	8 m/s²	\N	\N
7252	813	542	3.20 m/s² 1)	\N	\N
7230	812	547	163 cm	\N	\N
7231	812	538	86 dB(A)	\N	\N
7232	812	539	101 dB(A)	\N	\N
7233	812	540	3 dB(A) 1)	\N	\N
7795	944	222	4 tiempos, 1 cilindro	\N	\N
7796	944	11	11.8 HP @ 8000 RPM	\N	\N
7797	944	555	11.6 Nm @ 6000 RPM	\N	\N
7798	944	556	5 velocidades	\N	\N
7799	944	557	Disco / Tambor	\N	\N
7800	944	5	139 kg	\N	\N
7801	944	558	12.5 L	\N	\N
7802	945	34	149 cm3	\N	\N
7803	945	222	4 tiempos, FI	\N	\N
7804	945	11	12.2 HP @ 7500 RPM	\N	\N
7805	945	555	12.7 Nm @ 6000 RPM	\N	\N
7806	945	556	5 velocidades	\N	\N
7807	945	557	Disco con ABS (D) / Tambor (T)	\N	\N
7808	945	5	139 kg	\N	\N
7809	945	558	12.5 L	\N	\N
7810	946	34	155 cm3	\N	\N
7859	952	557	Disco ABS (D) / Disco ABS (T)	\N	\N
7860	952	5	131 kg	\N	\N
7861	952	558	11 L	\N	\N
7862	953	34	249 cm3	\N	\N
2896	498	388	Permite manejar el televisor mediante comandos de voz usando el control remoto, facilitando la búsqueda de contenido y control de funciones	\N	\N
2968	511	415	Este dispensador de mesa Kalley para botellón de 5 galones en la parte superior te permite elegir entre agua fría o caliente según tu necesidad y ubicarlo en el espacio de tu oficina o casa que tú desees.	\N	\N
2978	512	414	Admite botellones de 5 galones.	\N	\N
2979	512	416	Permite bajar el nivel de temperatura del agua hasta 10°C.	\N	\N
8295	512	559	En una hora, la temperatura de 5 litros de agua puede aumentar hasta 90 °C.	\N	\N
8298	512	560	En una hora puede bajar la temperatura de 2 litros de agua hasta 10 °C.	\N	\N
2992	513	416	Permite bajar la temperatura del agua a niveles óptimos, incluso en lugares donde la temperatura del ambiente es muy elevada.	\N	\N
8308	513	559	En una hora, la temperatura de 5 litros de agua puede aumentar hasta 90 °C.	\N	\N
8310	513	560	En una hora puede bajar la temperatura de 2 litros de agua hasta 10 °C.	\N	\N
3025	517	27	Ahorra energía y ofrece un rendimiento superior. Mantiene una temperatura constante dentro del nevecón, lo que ayuda a preservar mejor los alimentos y mantener su frescura por más tiempo.	\N	\N
3054	520	450	Opera con cable de alimentación convencional, ofreciendo estabilidad y uso prolongado sin interrupciones gracias a su compatibilidad con voltajes entre 110 y 120 V	\N	\N
3093	526	461	¡Disfruta de un ambiente fresco sin preocuparte por apagar el ventilador! Gracias a su temporizador programable de hasta 12 horas y control remoto incluido, podrás ajustar la ventilación a tu gusto y dejar que el equipo se apague automáticamente. Perfecto para noches de descanso o jornadas de trabajo sin interrupciones.	\N	\N
3114	529	468	TV LED Full HD 43" Smart Tv, GOOGLE TV, asistente de voz de Google, Tecnología HDR10: imágenes más nítidas y realistas, Dolby Atmos: audio envolvente y experiencia inmersiva,Control por voz: interacción más práctica e intuitiva, Navegación fluida con su sistema operativo google tv, Acceso directo a apps favoritas: facilidad de uso y entretenimiento inmediato.	\N	\N
6714	768	47	30.1 cm³	\N	\N
6723	768	482	100 dB(A) 4)	\N	\N
6737	769	482	101.0 / 100.0 dB(A) 4)	\N	\N
6752	770	483	112.0 / 111.0 dB(A) 4)	\N	\N
6914	783	479	21.6 fl oz (US)	\N	\N
6929	784	483	108 dB(A) 2)	\N	\N
6936	785	478	420 mm	\N	\N
6948	786	479	21.6 fl oz (US)	\N	\N
6963	787	483	107 dB(A) 2)	\N	\N
6979	789	477	7.7 kg 1)	\N	\N
6992	790	479	25.4 fl oz (US)	\N	\N
7006	791	482	101.0 / 100.0 dB(A) 2)	\N	\N
7007	791	483	111 dB(A) 2)	\N	\N
7008	791	484	2.6 m/s² 3)	\N	\N
7010	792	47	30.8 cm³	\N	\N
7013	792	478	420 mm	\N	\N
7020	792	485	2.8 m/s² 3)	\N	\N
7025	793	479	27.4 fl oz (US)	\N	\N
7040	794	482	99 dB(A) 2)	\N	\N
7054	796	499	350 mm	\N	\N
7065	797	482	101 dB(A) 2)	\N	\N
7081	799	502	14.5 m	\N	\N
7094	801	503	120 V/1 PH/60 Hz	\N	\N
7108	803	511	3800 / 4000 r/min	\N	\N
7122	804	477	5.4 / 5.3 kg 1)	\N	\N
7139	805	522	40 °C	\N	\N
7152	806	522	40 °C	\N	\N
7165	807	516	3450 r/min	\N	\N
7171	807	522	40 °C	\N	\N
7863	953	222	4 tiempos, SOCS	\N	\N
7864	953	11	26.1 HP @ 9300 RPM	\N	\N
7865	953	555	22.2 Nm @ 7300 RPM	\N	\N
7866	953	556	6 velocidades	\N	\N
7867	953	557	Disco ABS (D) / Disco ABS (T)	\N	\N
7868	953	5	167 kg	\N	\N
7869	953	558	12 L	\N	\N
7870	954	34	645 cm3	\N	\N
7871	954	222	V-Twin a 90 grados, Refrigeración Líquida	\N	\N
7872	954	11	70 HP	\N	\N
7873	954	556	6 velocidades	\N	\N
7874	954	557	Doble Disco ABS (D) / Disco ABS (T)	\N	\N
7875	954	5	216 kg	\N	\N
7876	954	558	20 L	\N	\N
10085	889	3	Gris plomo o Negro	\N	\N
10086	889	4	Estructura en pino seco y espuma de alta densidad D26	\N	\N
10088	890	3	Azul petróleo o Beige	\N	\N
10089	890	4	Madera de roble inmunizada y tela tipo lino premium	\N	\N
10091	891	3	Café Chocolate	\N	\N
10092	891	4	Madera de pino y tapicería en microcuero	\N	\N
10094	892	3	Negro azabache	\N	\N
10095	892	4	Estructura en madera nativa y forro en tela antideslizante	\N	\N
10097	893	3	Gris Oxford	\N	\N
10098	893	4	Bastidor de madera inmunizada y patas de polipropileno de alta resistencia	\N	\N
10100	894	3	Wengue	\N	\N
10101	894	4	Madera de pino y tapicería en lona reforzada	\N	\N
10103	895	3	Beige Almendra	\N	\N
10104	895	4	Madera de alta densidad y tela microfibra antirasguño	\N	\N
10106	896	3	Gris Perla	\N	\N
10107	896	4	Estructura metálica interna opcional y madera inmunizada externa	\N	\N
10109	897	3	Champagne o Gris Plata	\N	\N
10110	897	4	Madera de alta calidad y tapizado en terciopelo italiano	\N	\N
10112	898	3	Coordinado en tonos oscuros	\N	\N
10113	898	4	Mezcla de madera aglomerada, espumas y textiles	\N	\N
\.


--
-- Data for Name: producto_imagenes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.producto_imagenes (id_imagen, id_producto, url_imagen, alt_text, orden, es_principal, fecha_creacion) FROM stdin;
2901	787	https://www.stihl.com.co/content/dam/stihl/media/pim/43955.jpg	\N	0	f	2026-01-15 22:02:35.13681
4070	787	/images/productos/787.webp	STIHL FS 160	0	t	2026-05-24 22:11:24.008727
2902	788	https://www.stihl.com.co/content/dam/stihl/media/pim/97309.jpg	\N	0	f	2026-01-15 22:02:35.163147
4071	788	/images/productos/788.webp	STIHL FS 161	0	t	2026-05-24 22:11:31.632287
2903	789	https://www.stihl.com.co/content/dam/stihl/media/pim/97308.jpg	\N	0	f	2026-01-15 22:02:35.197554
2904	790	https://www.stihl.com.co/content/dam/stihl/media/pim/57501.jpg	\N	0	f	2026-01-15 22:02:35.225263
2905	791	https://www.stihl.com.co/content/dam/stihl/media/pim/97310.jpg	\N	0	f	2026-01-15 22:02:35.255044
2906	792	https://www.stihl.com.co/content/dam/stihl/media/pim/43955.jpg	\N	0	f	2026-01-15 22:02:35.291496
2907	793	https://www.stihl.com.co/content/dam/stihl/media/pim/45627.jpg	\N	0	f	2026-01-15 22:02:35.323249
2909	794	https://www.stihl.com.co/content/dam/stihl/media/pim/10620.jpg	\N	0	f	2026-01-15 22:02:35.352001
2910	794	https://www.stihl.com.co/content/dam/stihl/media/pim/9809.jpg	\N	1	f	2026-01-15 22:02:35.352492
2912	795	https://www.stihl.com.co/content/dam/stihl/media/pim/37247.jpg	\N	0	f	2026-01-15 22:02:35.390079
2913	796	https://www.stihl.com.co/content/dam/stihl/media/pim/35748.jpg	\N	0	f	2026-01-15 22:02:35.404404
2914	796	https://www.stihl.com.co/content/dam/stihl/media/pim/37500.jpg	\N	1	f	2026-01-15 22:02:35.405119
2915	797	https://www.stihl.com.co/content/dam/stihl/media/pim/16594.jpg	\N	0	f	2026-01-15 22:02:35.431253
2916	798	https://www.stihl.com.co/content/dam/stihl/media/pim/35729.jpg	\N	0	f	2026-01-15 22:02:35.458148
2917	798	https://www.stihl.com.co/content/dam/stihl/media/pim/27901.jpg	\N	1	f	2026-01-15 22:02:35.458608
2918	799	https://www.stihl.com.co/content/dam/stihl/media/pim/39278.jpg	\N	0	f	2026-01-15 22:02:35.480785
2919	800	https://www.stihl.com.co/content/dam/stihl/media/pim/34612.jpg	\N	0	f	2026-01-15 22:02:35.511369
2920	801	https://www.stihl.com.co/content/dam/stihl/media/pim/16483.jpg	\N	0	f	2026-01-15 22:02:35.529005
2921	801	https://www.stihl.com.co/content/dam/stihl/media/pim/19760.jpg	\N	1	f	2026-01-15 22:02:35.529817
2922	801	https://www.stihl.com.co/content/dam/stihl/media/pim/19756.jpg	\N	2	f	2026-01-15 22:02:35.530363
2868	769	https://www.stihl.com.co/content/dam/stihl/media/pim/16880.jpg	\N	0	f	2026-01-15 22:02:34.489647
2869	769	https://www.stihl.com.co/content/dam/stihl/media/pim/16877.jpg	\N	1	f	2026-01-15 22:02:34.49044
2870	769	https://www.stihl.com.co/content/dam/stihl/media/pim/16878.jpg	\N	2	f	2026-01-15 22:02:34.491121
2871	770	https://www.stihl.com.co/content/dam/stihl/media/pim/16885.jpg	\N	0	f	2026-01-15 22:02:34.526782
2872	770	https://www.stihl.com.co/content/dam/stihl/media/pim/16883.jpg	\N	1	f	2026-01-15 22:02:34.527425
2873	770	https://www.stihl.com.co/content/dam/stihl/media/pim/16884.jpg	\N	2	f	2026-01-15 22:02:34.528011
2874	771	https://www.stihl.com.co/content/dam/stihl/media/pim/98308.jpg	\N	0	f	2026-01-15 22:02:34.567861
2875	771	https://www.stihl.com.co/content/dam/stihl/media/pim/93757.jpg	\N	1	f	2026-01-15 22:02:34.568616
2876	771	https://www.stihl.com.co/content/dam/stihl/media/pim/93754.jpg	\N	2	f	2026-01-15 22:02:34.570091
2877	772	https://www.stihl.com.co/content/dam/stihl/media/pim/15426.jpg	\N	0	f	2026-01-15 22:02:34.631897
2878	773	https://www.stihl.com.co/content/dam/stihl/media/pim/127111.jpg	\N	0	f	2026-01-15 22:02:34.66533
2879	773	https://www.stihl.com.co/content/dam/stihl/media/pim/127110.jpg	\N	1	f	2026-01-15 22:02:34.666056
2881	774	https://www.stihl.com.co/content/dam/stihl/media/pim/117454.jpg	\N	0	f	2026-01-15 22:02:34.706705
2882	774	https://www.stihl.com.co/content/dam/stihl/media/pim/117455.jpg	\N	1	f	2026-01-15 22:02:34.707362
2883	774	https://www.stihl.com.co/content/dam/stihl/media/pim/117456.jpg	\N	2	f	2026-01-15 22:02:34.707902
2884	775	https://www.stihl.com.co/content/dam/stihl/media/pim/41078.jpg	\N	0	f	2026-01-15 22:02:34.739968
2885	775	https://www.stihl.com.co/content/dam/stihl/media/pim/10494.jpg	\N	1	f	2026-01-15 22:02:34.740576
2886	776	https://www.stihl.com.co/content/dam/stihl/media/pim/43587.jpg	\N	0	f	2026-01-15 22:02:34.77164
2887	776	https://www.stihl.com.co/content/dam/stihl/media/pim/43589.jpg	\N	1	f	2026-01-15 22:02:34.77268
2888	776	https://www.stihl.com.co/content/dam/stihl/media/pim/6189.jpg	\N	2	f	2026-01-15 22:02:34.773279
2889	777	https://www.stihl.com.co/content/dam/stihl/media/pim/42958.jpg	\N	0	f	2026-01-15 22:02:34.813426
2890	777	https://www.stihl.com.co/content/dam/stihl/media/pim/42960.jpg	\N	1	f	2026-01-15 22:02:34.81405
2891	778	https://www.stihl.com.co/content/dam/stihl/media/pim/35170.jpg	\N	0	f	2026-01-15 22:02:34.845426
2892	778	https://www.stihl.com.co/content/dam/stihl/media/pim/35171.jpg	\N	1	f	2026-01-15 22:02:34.846066
2893	779	https://www.stihl.com.co/content/dam/stihl/media/pim/43955.jpg	\N	0	f	2026-01-15 22:02:34.88208
2894	780	https://www.stihl.com.co/content/dam/stihl/media/pim/10506.jpg	\N	0	f	2026-01-15 22:02:34.917056
2895	781	https://www.stihl.com.co/content/dam/stihl/media/pim/54850.jpg	\N	0	f	2026-01-15 22:02:34.946226
2896	782	https://www.stihl.com.co/content/dam/stihl/media/pim/43955.jpg	\N	0	f	2026-01-15 22:02:34.978864
2897	783	https://www.stihl.com.co/content/dam/stihl/media/pim/3357.jpg	\N	0	f	2026-01-15 22:02:35.017562
2898	784	https://www.stihl.com.co/content/dam/stihl/media/pim/7889.jpg	\N	0	f	2026-01-15 22:02:35.045263
2899	785	https://www.stihl.com.co/content/dam/stihl/media/pim/7891.jpg	\N	0	f	2026-01-15 22:02:35.076757
2900	786	https://www.stihl.com.co/content/dam/stihl/media/pim/43955.jpg	\N	0	f	2026-01-15 22:02:35.110057
2923	802	https://www.stihl.com.co/content/dam/stihl/media/pim/37388.jpg	\N	0	f	2026-01-15 22:02:35.55697
2924	803	https://www.stihl.com.co/content/dam/stihl/media/pim/43858.jpg	\N	0	f	2026-01-15 22:02:35.566256
2925	804	https://www.stihl.com.co/content/dam/stihl/media/pim/7492.jpg	\N	0	f	2026-01-15 22:02:35.601413
2926	805	https://www.stihl.com.co/content/dam/stihl/media/pim/48220.jpg	\N	0	f	2026-01-15 22:02:35.627563
2927	805	https://www.stihl.com.co/content/dam/stihl/media/pim/48221.jpg	\N	1	f	2026-01-15 22:02:35.628121
2928	805	https://www.stihl.com.co/content/dam/stihl/media/pim/48223.jpg	\N	2	f	2026-01-15 22:02:35.628649
2929	806	https://www.stihl.com.co/content/dam/stihl/media/pim/5747.jpg	\N	0	f	2026-01-15 22:02:35.664745
2930	806	https://www.stihl.com.co/content/dam/stihl/media/pim/5746.jpg	\N	1	f	2026-01-15 22:02:35.665517
2931	806	https://www.stihl.com.co/content/dam/stihl/media/pim/5748.jpg	\N	2	f	2026-01-15 22:02:35.666402
2932	807	https://www.stihl.com.co/content/dam/stihl/media/pim/54918.jpg	\N	0	f	2026-01-15 22:02:35.717221
2933	807	https://www.stihl.com.co/content/dam/stihl/media/pim/54916.jpg	\N	1	f	2026-01-15 22:02:35.717758
2934	807	https://www.stihl.com.co/content/dam/stihl/media/pim/54911.jpg	\N	2	f	2026-01-15 22:02:35.71822
4072	789	/images/productos/789.webp	STIHL FS 221	0	t	2026-05-24 22:11:39.998998
4073	790	/images/productos/790.webp	STIHL FS 291	0	t	2026-05-24 22:11:48.823177
4074	791	/images/productos/791.webp	STIHL FS 351	0	t	2026-05-24 22:11:57.047072
2939	810	https://www.stihl.com.co/content/dam/stihl/media/pim/105381.jpg	\N	0	f	2026-01-15 22:02:35.788779
2940	810	https://www.stihl.com.co/content/dam/stihl/media/pim/105380.jpg	\N	1	f	2026-01-15 22:02:35.789569
2941	811	https://www.stihl.com.co/content/dam/stihl/media/pim/105405.jpg	\N	0	f	2026-01-15 22:02:35.85184
2942	811	https://www.stihl.com.co/content/dam/stihl/media/pim/105403.jpg	\N	1	f	2026-01-15 22:02:35.852894
2943	812	https://www.stihl.com.co/content/dam/stihl/media/pim/20759.jpg	\N	0	f	2026-01-15 22:02:35.904025
2944	813	https://www.stihl.com.co/content/dam/stihl/media/pim/20765.jpg	\N	0	f	2026-01-15 22:02:35.947695
2945	886	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:41.881044
4138	942	/images/productos/942.webp	Suzuki Suzuki Avenis	0	t	2026-05-24 22:22:12.407242
4139	943	/images/productos/943.webp	Suzuki Suzuki Burgman FI	0	t	2026-05-24 22:22:21.670387
4140	944	/images/productos/944.webp	Suzuki Suzuki DR 150	0	t	2026-05-24 22:22:30.071423
4141	945	/images/productos/945.webp	Suzuki Suzuki DR 150 FI ABS	0	t	2026-05-24 22:22:37.502982
4142	946	/images/productos/946.webp	Suzuki Suzuki Gixxer FI	0	t	2026-05-24 22:22:45.046149
2113	362	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.34484
2114	362	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.346086
2115	362	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.346927
2116	362	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.34765
2117	363	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.353909
2118	363	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.354675
2119	363	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.355356
2120	363	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.356009
2121	364	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.361595
2122	364	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.362466
2123	364	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.363096
2124	364	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.363719
2125	365	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.371262
2126	365	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.372017
2127	365	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.372698
2128	365	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.373287
2129	366	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.379624
2130	366	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.380797
2131	366	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.381425
2132	366	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.381995
2133	367	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.387153
2134	367	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.387742
2135	367	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.388336
2136	367	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.388868
2137	368	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.394767
2138	368	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.39537
2139	368	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.39619
2141	369	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.402649
2142	369	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.403782
2143	369	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.404631
2144	369	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.405628
2145	370	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.411091
2146	370	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.411932
2355	418	https://www.lg.com/co/images/neveras/gs66gpy/gallery/large01.jpg	\N	0	f	2026-01-15 16:37:13.818114
4075	792	/images/productos/792.webp	STIHL FS 460	0	t	2026-05-24 22:12:07.56438
2908	793	https://www.stihl.com.co/content/dam/stihl/media/pim/9915.jpg	\N	1	f	2026-01-15 22:02:35.323836
4076	793	/images/productos/793.webp	STIHL FR 230	0	t	2026-05-24 22:12:14.941331
2911	794	https://www.stihl.com.co/content/dam/stihl/media/pim/10923.jpg	\N	2	f	2026-01-15 22:02:35.352964
4077	794	/images/productos/794.webp	STIHL FR 235	0	t	2026-05-24 22:12:23.97693
4078	795	/images/productos/795.webp	STIHL SG 71	0	t	2026-05-24 22:12:32.108287
4079	796	/images/productos/796.webp	STIHL SR 200	0	t	2026-05-24 22:12:41.795649
4143	947	/images/productos/947.webp	Suzuki Suzuki Gixxer FI 150 ABS	0	t	2026-05-24 22:22:52.237796
2149	371	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.419048
2150	371	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.419894
2153	372	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.42919
2154	372	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.429986
2155	372	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.430656
2156	372	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.431431
2157	373	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.437688
2158	373	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.438497
2159	373	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.439275
2160	373	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.440159
2161	374	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.447465
2162	374	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.448277
2163	374	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.449001
2164	374	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.4499
2165	375	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.455257
2166	375	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.45628
2167	375	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.457356
2168	375	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.457981
2169	376	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.462693
2170	376	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.463332
2171	376	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.464033
2173	377	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.470358
2174	377	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.471153
2175	377	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.471758
2176	377	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.472379
2177	378	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.478788
2178	378	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.479525
2179	378	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.480235
2180	378	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.480824
2181	379	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.485473
2182	379	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.486173
2183	379	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.486832
2184	379	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.487366
2185	380	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.492768
2186	380	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.493454
2187	380	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.494065
2188	380	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.494644
2189	381	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.499217
4080	797	/images/productos/797.webp	STIHL SR 420	0	t	2026-05-24 22:12:52.164576
4081	798	/images/productos/798.webp	STIHL SR 430	0	t	2026-05-24 22:13:00.357042
4082	799	/images/productos/799.webp	STIHL SR 440	0	t	2026-05-24 22:13:08.903584
4083	800	/images/productos/800.webp	STIHL SR 450	0	t	2026-05-24 22:13:16.888754
4144	948	/images/productos/948.webp	Suzuki Suzuki Gixxer SF FI 150 ABS	0	t	2026-05-24 22:23:00.959454
4145	949	/images/productos/949.webp	Suzuki Suzuki Gixxer 250	0	t	2026-05-24 22:23:08.798764
4146	950	/images/productos/950.webp	Suzuki Suzuki V-Strom 160	0	t	2026-05-24 22:23:16.217674
4147	951	/images/productos/951.webp	Suzuki Suzuki GSX-S 150 ABS	0	t	2026-05-24 22:23:23.617303
2193	382	https://colchonescomodisimos.vtexassets.com/arquivos/ids/179132-800-auto?v=639011425672300000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.508086
2194	382	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162251-800-auto?v=638748982175870000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.508793
2195	382	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.509563
2197	383	https://colchonescomodisimos.vtexassets.com/arquivos/ids/179132-800-auto?v=639011425672300000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.515066
2198	383	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162251-800-auto?v=638748982175870000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.515904
2199	383	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.516452
2200	383	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.516919
2201	384	https://colchonescomodisimos.vtexassets.com/arquivos/ids/179132-800-auto?v=639011425672300000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.521678
2202	384	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162251-800-auto?v=638748982175870000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.522528
2203	384	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.523205
2204	384	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.523851
2205	385	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.53236
2206	385	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.533187
2207	385	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.534001
2208	385	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.534712
2209	386	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.54359
2210	386	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.544511
2211	386	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.545272
2212	386	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.546026
2213	387	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.55137
2214	387	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.552256
2215	387	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.552844
2216	387	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.553505
2217	388	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.560542
2218	388	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.562094
2219	388	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.563042
2221	389	https://www.lg.com/content/dam/channel/wcms/co/ms/tv-/hd-/32lr600bpsc-awcq/gallery/2010-x-1334/hd-lr60-32-a-gallery-01.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:12.930278
2222	389	https://www.lg.com/content/dam/channel/wcms/co/ms/tv-/hd-/32lr600bpsc-awcq/gallery/2010-x-1334/hd-lr60-32-a-gallery-04.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:12.932597
2223	389	https://www.lg.com/content/dam/channel/wcms/co/ms/tv-/hd-/32lr600bpsc-awcq/gallery/2010-x-1334/hd-lr60-32-a-gallery-05.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:12.933698
2224	390	https://www.lg.com/content/dam/channel/wcms/co/images/televisores/43lm6370pdb_awc_escb_co_c/gallery/DZ-01.jpg?w=800	\N	0	f	2026-01-15 16:37:13.011111
2225	390	https://www.lg.com/content/dam/channel/wcms/co/images/televisores/43lm6370pdb_awc_escb_co_c/gallery/DZ-04.jpg?w=800	\N	1	f	2026-01-15 16:37:13.012349
2226	390	https://www.lg.com/content/dam/channel/wcms/co/images/televisores/43lm6370pdb_awc_escb_co_c/gallery/DZ-05.jpg?w=800	\N	2	f	2026-01-15 16:37:13.01341
2227	390	https://www.lg.com/content/dam/channel/wcms/co/images/televisores/43lm6370pdb_awc_escb_co_c/gallery/DZ-03.jpg?w=800	\N	3	f	2026-01-15 16:37:13.014562
2228	391	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/50-ua75-a/gallery/uhd-ua75-2025-50-gallery-01.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.075446
2229	391	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/50-ua75-a/gallery/uhd-ua75-2025-50-gallery-05.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.076463
2230	391	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/50-ua75-a/gallery/uhd-ua75-2025-50-gallery-03.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.077585
4084	801	/images/productos/801.webp	STIHL SE33	0	t	2026-05-24 22:13:27.859718
4148	952	/images/productos/952.webp	Suzuki Suzuki GSX-R 150 ABS	0	t	2026-05-24 22:23:31.013051
2232	392	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/55-ua75-a/gallery/uhd-ua75-2025-55-gallery-01.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.139883
2235	393	https://www.lg.com/content/dam/channel/wcms/co/banner/cambio-de-imagen-tv/55nano80tsa/55NANO80TSA-2011x1336.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.200819
2236	393	https://www.lg.com/content/dam/channel/wcms/co/images/televisores/55nano80tsa/nanocell-nano80-55-50-a-gallery-03.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.201447
2237	393	https://www.lg.com/content/dam/channel/wcms/co/images/televisores/55nano80tsa/nanocell-nano80-55-50-a-gallery-05.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.202079
2238	394	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/65-ua75-a/gallery/uhd-ua75-2025-65-gallery-01.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.235535
2239	394	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/65-ua75-a/gallery/uhd-ua75-2025-65-gallery-05.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.236088
2240	394	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/65-ua75-a/gallery/uhd-ua75-2025-65-gallery-03.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.23665
2241	395	https://www.lg.com/content/dam/channel/wcms/co/banner/cambio-de-imagen-tv/65nano80tsa/65NANO80TSA-2011x1336.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.260178
2242	395	https://www.lg.com/content/dam/channel/wcms/co/images/televisores/65nano80tsa/nanocell-nano80-65-a-gallery-04.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.261199
2243	395	https://www.lg.com/content/dam/channel/wcms/co/images/televisores/65nano80tsa/nanocell-nano80-65-a-gallery-05.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.261859
2244	396	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/75-ua75-a/gallery/uhd-ua75-2025-75-gallery-01.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.279153
2245	396	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/75-ua75-a/gallery/uhd-ua75-2025-75-gallery-05.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.279999
2247	397	https://www.lg.com/content/dam/channel/wcms/co/banner/imagen-de-galeria-tv/75nano80tsa/75NANO80TSA-2011x1336-2.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.297155
2248	397	https://www.lg.com/content/dam/channel/wcms/co/images/televisores/75nano80tsa/nanocell-nano80-75-a-gallery-04.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.297834
2249	397	https://www.lg.com/content/dam/channel/wcms/co/images/televisores/75nano80tsa/nanocell-nano80-75-a-gallery-05.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.298452
2250	398	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/86-ua75-a/gallery/uhd-ua75-2025-86-gallery-01.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.311255
2251	398	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/86-ua75-a/gallery/uhd-ua75-2025-86-gallery-05.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.312349
2252	398	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/86-ua75-a/gallery/uhd-ua75-2025-86-gallery-03.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.31315
2253	399	https://www.lg.com/content/dam/channel/wcms/co/banner/imagen-de-galeria-tv/86nano80tsa/86NANO80TSA-2011x1336.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.335462
2254	399	https://www.lg.com/content/dam/channel/wcms/co/images/televisores/86nano80tsa/nanocell-nano80-75-a-gallery-05.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.33612
2255	399	https://www.lg.com/content/dam/channel/wcms/co/images/televisores/86nano80tsa/nanocell-nano80-75-a-gallery-04.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.336896
2256	399	https://www.lg.com/content/dam/channel/wcms/co/images/televisores/86nano80tsa/nanocell-nano80-75-a-gallery-03.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	3	f	2026-01-15 16:37:13.337739
2257	400	https://www.lg.com/content/dam/channel/wcms/co/images/barras-de-sonido/rnc5_dcolllk_escb_co_c/gallery/large01.jpg?w=800	\N	0	f	2026-01-15 16:37:13.392568
2258	400	https://www.lg.com/content/dam/channel/wcms/co/images/barras-de-sonido/rnc5_dcolllk_escb_co_c/gallery/large05.jpg?w=800	\N	1	f	2026-01-15 16:37:13.393896
2259	400	https://www.lg.com/content/dam/channel/wcms/co/images/barras-de-sonido/rnc5_dcolllk_escb_co_c/gallery/large06.jpg?w=800	\N	2	f	2026-01-15 16:37:13.395266
2260	401	https://www.lg.com/content/dam/channel/wcms/co/images/barras-de-sonido/rnc7_dcolllk_escb_co_c/gallery/DZ-01.jpg?w=800	\N	0	f	2026-01-15 16:37:13.421037
2261	401	https://www.lg.com/content/dam/channel/wcms/co/images/barras-de-sonido/rnc7_dcolllk_escb_co_c/gallery/DZ-07.jpg?w=800	\N	1	f	2026-01-15 16:37:13.421658
2262	402	https://www.lg.com/content/dam/channel/wcms/co/images/sistemas-de-audio/rnc9_dcolllk_escb_co_c/gallery/DZ-02.jpg?w=800	\N	0	f	2026-01-15 16:37:13.435918
2263	402	https://www.lg.com/content/dam/channel/wcms/co/images/sistemas-de-audio/rnc9_dcolllk_escb_co_c/gallery/DZ-06.jpg?w=800	\N	1	f	2026-01-15 16:37:13.436445
2264	403	https://www.lg.com/content/dam/channel/wcms/co/ms/av/grab/grab-negro-/gallery/2010-x-1334/xboom-grab-2025-gallery-10.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.454794
2265	403	https://www.lg.com/content/dam/channel/wcms/co/ms/av/grab/grab-negro-/gallery/2010-x-1334/xboom-grab-2025-gallery-08.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.455578
2266	403	https://www.lg.com/content/dam/channel/wcms/co/ms/av/grab/grab-negro-/gallery/2010-x-1334/xboom-grab-2025-gallery-14.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.4563
2267	404	https://www.lg.com/content/dam/channel/wcms/co/ms/av/bounce/gallery/2010-x-1334/DZ-10.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.489402
4085	802	/images/productos/802.webp	STIHL SE62	0	t	2026-05-24 22:13:38.325473
4149	953	/images/productos/953.webp	Suzuki Suzuki V-Strom 250 SX	0	t	2026-05-24 22:23:41.090502
4150	954	/images/productos/954.webp	Suzuki Suzuki V-Strom 650 XT	0	t	2026-05-24 22:23:49.773689
2271	405	https://www.lg.com/content/dam/channel/wcms/co/ms/av/stage301/gallery/2010-x-1334/xboom-stage301-2025-gallery-09.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.540474
2272	405	https://www.lg.com/content/dam/channel/wcms/co/ms/av/stage301/gallery/2010-x-1334/DZ-02.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.541176
2273	405	https://www.lg.com/content/dam/channel/wcms/co/ms/av/stage301/gallery/2010-x-1334/DZ-04.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.54174
2275	406	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt13bpb_abmecol_escb_co_c/gallery/DZ-1.jpg?w=800	\N	0	f	2026-01-15 16:37:13.574503
2276	406	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt13bpb_abmecol_escb_co_c/gallery/DZ-4.jpg?w=800	\N	1	f	2026-01-15 16:37:13.575116
2277	406	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt13bpb_abmecol_escb_co_c/gallery/DZ-5.jpg?w=800	\N	2	f	2026-01-15 16:37:13.575712
2278	406	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt13bpb_abmecol_escb_co_c/gallery/large07.jpg?w=800	\N	3	f	2026-01-15 16:37:13.576896
2279	407	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt19mvtb/gallery/DZ-01VB-T_T11V1NDHT2_Front.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.591012
2280	407	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt19mvtb/gallery/DZ-02VB-T_T11V1NDHT2_FrontOpen.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.591976
2281	407	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt19mvtb/gallery/DZ-04VB-T_T11V1NDHT2_DetergentInlet.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.592719
2285	408	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/ejm1/gallery/2010-x-1334/2010x1334.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.618704
2286	408	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/ejm1/gallery/2010-x-1334/2010x133416.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.619741
2287	408	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/ejm1/gallery/2010-x-1334/2010x133412.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.620731
2288	408	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/ejm1/gallery/2010-x-1334/2010x133414.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	3	f	2026-01-15 16:37:13.621366
2289	408	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/ejm1/gallery/2010-x-1334/2010x13344.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	4	f	2026-01-15 16:37:13.622075
2290	408	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/ejm1/gallery/2010-x-1334/2010x133410.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	5	f	2026-01-15 16:37:13.622682
2291	409	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt25mt6hk_abmecol_escb_co_c/gallery/DZ-01.jpg?w=800	\N	0	f	2026-01-15 16:37:13.641853
2292	409	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt25mt6hk_abmecol_escb_co_c/gallery/DZ-02.jpg?w=800	\N	1	f	2026-01-15 16:37:13.642707
2293	409	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt25mt6hk_abmecol_escb_co_c/gallery/DZ-04.jpg?w=800	\N	2	f	2026-01-15 16:37:13.643335
2294	409	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt25mt6hk_abmecol_escb_co_c/gallery/DZ-10.jpg?w=800	\N	3	f	2026-01-15 16:37:13.643969
2295	409	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt25mt6hk_abmecol_escb_co_c/gallery/DZ-11.jpg?w=800	\N	4	f	2026-01-15 16:37:13.644675
2296	409	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt25mt6hk_abmecol_escb_co_c/gallery/DZ-12.jpg?w=800	\N	5	f	2026-01-15 16:37:13.645266
2297	410	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wd16eg2s6_aesecol_escb_co_c/gallery/Desktop_zoom_11.jpg?w=800	\N	0	f	2026-01-15 16:37:13.657864
2298	410	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wd16eg2s6_aesecol_escb_co_c/gallery/Desktop_zoom_03.jpg?w=800	\N	1	f	2026-01-15 16:37:13.658646
2299	410	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wd16eg2s6_aesecol_escb_co_c/gallery/Desktop_zoom_06.jpg?w=800	\N	2	f	2026-01-15 16:37:13.659403
2300	410	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wd16eg2s6_aesecol_escb_co_c/gallery/Desktop_zoom_13.jpg?w=800	\N	3	f	2026-01-15 16:37:13.660509
2301	410	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wd16eg2s6_aesecol_escb_co_c/gallery/Desktop_zoom_14.jpg?w=800	\N	4	f	2026-01-15 16:37:13.662717
2302	410	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wd16eg2s6_aesecol_escb_co_c/gallery/Desktop_zoom_16.jpg?w=800	\N	5	f	2026-01-15 16:37:13.66417
2303	411	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/wd16egnts6p/gallery/01%202010x1334-100.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.674151
2304	411	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/wd16egnts6p/gallery/02%202010x1334-100.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.674905
2305	411	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/wd16egnts6p/gallery/03%202010x1334-100.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.67555
2306	411	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/wd16egnts6p/gallery/07%202010x1334-100.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	3	f	2026-01-15 16:37:13.676133
2438	512	https://www.corbeta.com.co/media/catalog/product/7/7/7705946477819_3.png	\N	2	f	2026-01-15 18:39:24.198868
4086	803	/images/productos/803.webp	STIHL HS 45	0	t	2026-05-24 22:13:48.47102
4087	804	/images/productos/804.webp	STIHL HS 82 R	0	t	2026-05-24 22:13:56.779648
4088	805	/images/productos/805.webp	STIHL RE 80X	0	t	2026-05-24 22:14:05.389848
4089	806	/images/productos/806.webp	STIHL RE 110	0	t	2026-05-24 22:14:13.671061
4090	807	/images/productos/807.webp	STIHL RE 125	0	t	2026-05-24 22:14:21.589516
4151	888	/images/productos/888.webp	L&L Parlante Doble 15 Pulgadas con Doble Ventilador y EQ	0	t	2026-05-25 02:01:25.028672
2311	412	https://www.lg.com/content/dam/channel/wcms/co/images/lavadorasysecadoras/wd22vv2s6b_assecol_escb_co_c/gallery/DZ-01.jpg?w=800	\N	0	f	2026-01-15 16:37:13.688567
2312	412	https://www.lg.com/content/dam/channel/wcms/co/images/lavadorasysecadoras/wd22vv2s6b_assecol_escb_co_c/gallery/DZ-02.jpg?w=800	\N	1	f	2026-01-15 16:37:13.689746
2313	412	https://www.lg.com/content/dam/channel/wcms/co/images/lavadorasysecadoras/wd22vv2s6b_assecol_escb_co_c/gallery/DZ-03.jpg?w=800	\N	2	f	2026-01-15 16:37:13.690517
2314	412	https://www.lg.com/content/dam/channel/wcms/co/images/lavadorasysecadoras/wd22vv2s6b_assecol_escb_co_c/gallery/DZ-05.jpg?w=800	\N	3	f	2026-01-15 16:37:13.691124
2315	412	https://www.lg.com/content/dam/channel/wcms/co/images/lavadorasysecadoras/wd22vv2s6b_assecol_escb_co_c/gallery/DZ-V11.jpg?w=800	\N	4	f	2026-01-15 16:37:13.691811
2319	413	https://www.lg.com/content/dam/channel/wcms/co/images/microondas/ms2032gas_bbkelat_escb_co_c/MS2032GAS-2010x1334.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.722256
2320	413	https://www.lg.com/content/dam/channel/wcms/co/images/microondas/ms2032gas_bbkelat_escb_co_c/gallery/DZ-2.jpg?w=800	\N	1	f	2026-01-15 16:37:13.72293
2321	413	https://www.lg.com/content/dam/channel/wcms/co/images/microondas/ms2032gas_bbkelat_escb_co_c/gallery/DZ-5.jpg?w=800	\N	2	f	2026-01-15 16:37:13.723486
2322	413	https://www.lg.com/content/dam/channel/wcms/co/images/microondas/ms2032gas_bbkelat_escb_co_c/gallery/DZ-8.jpg?w=800	\N	3	f	2026-01-15 16:37:13.724094
2323	413	https://www.lg.com/content/dam/channel/wcms/co/images/microondas/ms2032gas_bbkelat_escb_co_c/gallery/DZ-12.jpg?w=800	\N	4	f	2026-01-15 16:37:13.724686
2324	414	https://www.lg.com/content/dam/channel/wcms/co/banner/cambio-de-galerias/ha/gb37spv/GB37SPV-2010x1334-NEW.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.739815
2325	414	https://www.lg.com/content/dam/channel/wcms/co/banner/cambio-de-galerias/ha/gb37spv/2010x1334/GB37SPV-2010x1334-9.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.740336
2326	414	https://www.lg.com/content/dam/channel/wcms/co/banner/cambio-de-galerias/ha/gb37spv/2010x1334/GB37SPV-2010x1334-6.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.740809
2327	414	https://www.lg.com/content/dam/channel/wcms/co/banner/cambio-de-galerias/ha/gb37spv/2010x1334/GB37SPV-2010x1334-14.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	3	f	2026-01-15 16:37:13.741401
2328	414	https://www.lg.com/content/dam/channel/wcms/co/banner/cambio-de-galerias/ha/gb37spv/2010x1334/GB37SPV-2010x1334-8.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	4	f	2026-01-15 16:37:13.741881
2329	414	https://www.lg.com/content/dam/channel/wcms/co/banner/cambio-de-galerias/ha/gb37spv/2010x1334/GB37SPV-2010x1334-17.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	5	f	2026-01-15 16:37:13.74238
2333	415	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs51bpp_ahscclm_escb_co_c/gallery/large01.jpg?w=800	\N	0	f	2026-01-15 16:37:13.760686
2334	415	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs51bpp_ahscclm_escb_co_c/gallery/large02.jpg?w=800	\N	1	f	2026-01-15 16:37:13.76157
2335	415	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs51bpp_ahscclm_escb_co_c/gallery/large04.jpg?w=800	\N	2	f	2026-01-15 16:37:13.762184
2336	415	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs51bpp_ahscclm_escb_co_c/gallery/large07.jpg?w=800	\N	3	f	2026-01-15 16:37:13.762708
2337	415	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs51bpp_ahscclm_escb_co_c/gallery/large14.jpg?w=800	\N	4	f	2026-01-15 16:37:13.763159
2338	415	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs51bpp_ahscclm_escb_co_c/gallery/large15.jpg?w=800	\N	5	f	2026-01-15 16:37:13.763587
2339	415	https://www.lg.com/content/dam/channel/wcms/co/banner/retiq/gs51bpp/GS51BPP-2010x1334-RETIQ.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	6	f	2026-01-15 16:37:13.764087
2340	416	https://www.lg.com/content/dam/channel/wcms/co/ref/b-f/gb45wpt/gallery/2010-x-1334/1%20.2010x1334_.png/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.775841
2341	416	https://www.lg.com/content/dam/channel/wcms/co/ref/b-f/gb45wpt/gallery/2010-x-1334/2%20.2010x1334.png/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.776364
2342	416	https://www.lg.com/content/dam/channel/wcms/co/ref/b-f/gb45wpt/gallery/2010-x-1334/4%20.2010x1334.png/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.776892
2343	416	https://www.lg.com/content/dam/channel/wcms/co/ref/b-f/gb45wpt/gallery/2010-x-1334/9%20.2010x1334.png/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	3	f	2026-01-15 16:37:13.777447
2344	416	https://www.lg.com/content/dam/channel/wcms/co/ref/b-f/gb45wpt/gallery/2010-x-1334/12%20.2010x1334.png/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	4	f	2026-01-15 16:37:13.778166
2345	416	https://www.lg.com/content/dam/channel/wcms/co/ref/b-f/gb45wpt/gallery/2010-x-1334/17%20.2010x1334.png/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	5	f	2026-01-15 16:37:13.778876
2371	419	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66sxtc/gallery/14.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	9	f	2026-01-15 16:37:13.860009
4091	810	/images/productos/810.webp	STIHL RM 248.3	0	t	2026-05-24 22:14:31.87689
4092	811	/images/productos/811.webp	STIHL RM 253.3	0	t	2026-05-24 22:14:41.411162
4093	812	/images/productos/812.webp	STIHL MH 610	0	t	2026-05-24 22:14:49.584877
4094	813	/images/productos/813.webp	STIHL MH 710	0	t	2026-05-24 22:14:58.015077
4095	886	/images/productos/886.webp	L&L Bafle Profesional Clase D de 15 Pulgadas con TWS	0	t	2026-05-24 22:15:06.312516
4096	887	/images/productos/887.webp	L&L Cabina Elite 15 Pulgadas Bi-Amplificada Clase H	0	t	2026-05-24 22:15:15.062987
2374	482	https://motos.honda.com.co/images/cms/honda-cb-100-rojo.png	\N	1	f	2026-01-15 17:51:10.889261
2375	482	https://motos.honda.com.co/images/cms/honda-cb-100-azul.png	\N	2	f	2026-01-15 17:51:10.890463
2373	482	https://motos.honda.com.co/images/cms/honda-cb-100-negra.png	\N	0	f	2026-01-15 17:51:10.88581
2347	417	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/lm22sgp/2010x1334%201.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.795032
2356	418	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66gpy-apycclm-escb_co-c/gallery/2010-2.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.818872
2357	418	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66gpy-apycclm-escb_co-c/gallery/2010-5.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.819443
2358	418	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66gpy-apycclm-escb_co-c/gallery/2010-8.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	3	f	2026-01-15 16:37:13.820134
2359	418	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66gpy-apycclm-escb_co-c/gallery/2010-13.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	4	f	2026-01-15 16:37:13.820696
2360	418	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66gpy-apycclm-escb_co-c/gallery/2010-15.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	5	f	2026-01-15 16:37:13.821241
2361	418	https://www.lg.com/content/dam/channel/wcms/co/banner/cambio-de-galerias/ha/gs66gpy/retiq/RETIQ-GS66GPY-2010x1334.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	6	f	2026-01-15 16:37:13.821741
2362	419	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66sxtc/gallery/2.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	0	f	2026-01-15 16:37:13.854955
2363	419	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66sxtc/gallery/3.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.855522
2364	419	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66sxtc/gallery/4.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.855977
2365	419	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66sxtc/gallery/5.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	3	f	2026-01-15 16:37:13.856386
2366	419	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66sxtc/gallery/6.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	4	f	2026-01-15 16:37:13.856802
2367	419	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66sxtc/gallery/7.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	5	f	2026-01-15 16:37:13.857344
2368	419	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66sxtc/gallery/9.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	6	f	2026-01-15 16:37:13.857937
2369	419	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66sxtc/gallery/10.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	7	f	2026-01-15 16:37:13.858372
2376	483	https://motos.honda.com.co/images/cms/honda-cb125f-20-dlx-rojo.png	\N	0	f	2026-01-15 17:51:10.958952
2377	483	https://motos.honda.com.co/images/cms/honda-cb125f-20-dlx-gris2.png	\N	1	f	2026-01-15 17:51:10.959753
2378	484	https://motos.honda.com.co/images/cms/nueva-honda-wave-110-gris.png	\N	0	f	2026-01-15 17:51:10.998567
2379	484	https://motos.honda.com.co/images/cms/nueva-honda-wave-110-blanca.png	\N	1	f	2026-01-15 17:51:10.999848
2380	484	https://motos.honda.com.co/images/cms/nueva-honda-wave-110-roja.png	\N	2	f	2026-01-15 17:51:11.000628
2381	484	https://motos.honda.com.co/images/cms/nueva-honda-wave-110-negra3.png	\N	3	f	2026-01-15 17:51:11.001369
2382	485	https://motos.honda.com.co/images/cms/honda-cb190r-gris.png	\N	0	f	2026-01-15 17:51:11.060686
2383	485	https://motos.honda.com.co/images/cms/honda-cb190r-rojo.png	\N	1	f	2026-01-15 17:51:11.062037
2384	486	https://motos.honda.com.co/images/cms/Nueva-CB-300F-rojo.png	\N	0	f	2026-01-15 17:51:11.120369
2385	486	https://motos.honda.com.co/images/cms/Nueva-CB-300F-azul-mate.png	\N	1	f	2026-01-15 17:51:11.121093
2386	486	https://motos.honda.com.co/images/cms/gris-mate-CB300F.png	\N	2	f	2026-01-15 17:51:11.121694
2387	487	https://motos.honda.com.co/images/cms/nueva-dio-dlx-gris.png	\N	0	f	2026-01-15 17:51:11.175834
2388	488	https://motos.honda.com.co/images/cms/nueva-dio-std-azul.png	\N	0	f	2026-01-15 17:51:11.221574
2389	488	https://motos.honda.com.co/images/cms/nueva-dio-std-rojo.png	\N	1	f	2026-01-15 17:51:11.222609
2390	489	https://motos.honda.com.co/images/cms/navi-rojo-n.png	\N	0	f	2026-01-15 17:51:11.265899
2391	489	https://motos.honda.com.co/images/cms/navi-rojo-ne.png	\N	1	f	2026-01-15 17:51:11.26644
2392	489	https://motos.honda.com.co/images/cms/navi-rojo-b.png	\N	2	f	2026-01-15 17:51:11.26691
2393	490	https://motos.honda.com.co/images/cms/navi-mix-negro.png	\N	0	f	2026-01-15 17:51:11.302198
2394	490	https://motos.honda.com.co/images/cms/Web_Lateral_De.png	\N	1	f	2026-01-15 17:51:11.302837
2395	491	https://motos.honda.com.co/images/cms/Gris-54dba.png	\N	0	f	2026-01-15 17:51:11.344957
2396	491	https://motos.honda.com.co/images/cms/Blanca-b3c5f.png	\N	1	f	2026-01-15 17:51:11.345595
2397	491	https://motos.honda.com.co/images/cms/Azul-8194f.png	\N	2	f	2026-01-15 17:51:11.346145
2437	512	https://www.corbeta.com.co/media/catalog/product/7/7/7705946477819_2.png	\N	1	f	2026-01-15 18:39:24.197636
2951	889	https://maximuebles.com.co/productos/sofa-cama-clic-clac/	\N	0	f	2026-01-16 13:23:41.981893
4097	889	/images/productos/889.webp	Maximuebles Sofá Cama Clic Clac	0	t	2026-05-24 22:15:32.887165
4152	518	/images/productos/518.webp	Samurai VENTILADOR SAMURAI AIR MAXX BLANCO ASPA AZUL 16 P 4703	0	t	2026-05-25 14:49:40.702588
4153	519	/images/productos/519.webp	Samurai VENTILADOR SAMURAI TURBO POWER DE PARED NEGRO	0	t	2026-05-25 14:49:40.814779
4154	520	/images/productos/520.webp	Samurai SAMURAI de piso, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas.	0	t	2026-05-25 14:49:40.916741
4155	521	/images/productos/521.webp	Samurai SAMURAI de PARED, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas.	0	t	2026-05-25 14:49:41.021652
2400	492	https://motos.honda.com.co/images/cms/XR150L-20-negro.png	\N	1	f	2026-01-15 17:51:11.39521
2402	493	https://motos.honda.com.co/images/cms/nueva-xr190l-abs-20-blanca.png	\N	0	f	2026-01-15 17:51:11.441711
2403	493	https://motos.honda.com.co/images/cms/xr-190l-abs-beige.png	\N	1	f	2026-01-15 17:51:11.442825
2405	494	https://motos.honda.com.co/images/cms/imgi_1_xr-300l-tornado-roja.png	\N	0	f	2026-01-15 17:51:11.490573
2406	494	https://motos.honda.com.co/images/cms/imgi_1_xr-300l-tornado-gris.png	\N	1	f	2026-01-15 17:51:11.491158
2407	494	https://motos.honda.com.co/images/cms/imgi_1_xr-300l-tornado-blanco.png	\N	2	f	2026-01-15 17:51:11.491639
2408	495	https://motos.honda.com.co/images/cms/honda-nx190-negro-nueva.png	\N	0	f	2026-01-15 17:51:11.531194
2409	495	https://motos.honda.com.co/images/cms/honda-nx190-rojo-nueva.png	\N	1	f	2026-01-15 17:51:11.531702
2410	496	https://motos.honda.com.co/images/cms/xblade160-rojo.png	\N	0	f	2026-01-15 17:51:11.57941
2411	496	https://motos.honda.com.co/images/cms/xblade160-beige.png	\N	1	f	2026-01-15 17:51:11.579943
2412	496	https://motos.honda.com.co/images/cms/xblade160-gris.png	\N	2	f	2026-01-15 17:51:11.580367
2413	497	https://motos.honda.com.co/images/cms/xblade160-rojo.png	\N	0	f	2026-01-15 17:51:11.615928
2414	497	https://motos.honda.com.co/images/cms/xblade160-beige.png	\N	1	f	2026-01-15 17:51:11.616464
2415	497	https://motos.honda.com.co/images/cms/xblade160-gris.png	\N	2	f	2026-01-15 17:51:11.616903
2416	498	https://www.corbeta.com.co/media/catalog/product/7/7/7705946480017-001-750wx750h.jpg	\N	0	f	2026-01-15 18:39:23.878156
2417	498	https://www.corbeta.com.co/media/catalog/product/7/7/7705946480017-002-750wx750h.jpg	\N	1	f	2026-01-15 18:39:23.880693
2418	499	https://www.corbeta.com.co/media/catalog/product/w/h/whatsapp_image_2022-04-11_at_4.33.50_pm.jpeg	\N	0	f	2026-01-15 18:39:23.931527
2419	499	https://www.corbeta.com.co/media/catalog/product/w/h/whatsapp_image_2022-04-11_at_4.33.50_pm_1_.jpeg	\N	1	f	2026-01-15 18:39:23.932593
2423	507	https://www.corbeta.com.co/media/catalog/product/8/_/8_1_5.jpg	\N	0	f	2026-01-15 18:39:24.044971
2424	507	https://www.corbeta.com.co/media/catalog/product/9/_/9_5_2.jpg	\N	1	f	2026-01-15 18:39:24.046434
2425	509	https://www.corbeta.com.co/media/catalog/product/7/7/7705946806725_002.jpg	\N	0	f	2026-01-15 18:39:24.068882
2426	509	https://www.corbeta.com.co/media/catalog/product/7/7/7705946806725_003.jpg	\N	1	f	2026-01-15 18:39:24.069523
2427	509	https://www.corbeta.com.co/media/catalog/product/7/7/7705946806725_005.jpg	\N	2	f	2026-01-15 18:39:24.070026
2428	509	https://www.corbeta.com.co/media/catalog/product/7/7/7705946806725_004.jpg	\N	3	f	2026-01-15 18:39:24.070516
2429	509	https://www.corbeta.com.co/media/catalog/product/7/7/7705946806725_006.jpg	\N	4	f	2026-01-15 18:39:24.071042
2430	510	https://www.corbeta.com.co/media/catalog/product/7/7/7705946173858.jpg	\N	0	f	2026-01-15 18:39:24.139987
2431	510	https://www.corbeta.com.co/media/catalog/product/7/7/7705946173858_1.jpg	\N	1	f	2026-01-15 18:39:24.141149
2432	510	https://www.corbeta.com.co/media/catalog/product/h/o/hor.jpg	\N	2	f	2026-01-15 18:39:24.141998
2433	511	https://www.corbeta.com.co/media/catalog/product/i/m/image-removebg-preview_1__32_1.png	\N	0	f	2026-01-15 18:39:24.16992
2434	511	https://www.corbeta.com.co/media/catalog/product/i/m/image-removebg-preview_2__28_1.png	\N	1	f	2026-01-15 18:39:24.17052
2435	511	https://www.corbeta.com.co/media/catalog/product/i/m/image-removebg-preview_3__29_1.png	\N	2	f	2026-01-15 18:39:24.171092
2436	512	https://www.corbeta.com.co/media/catalog/product/7/7/7705946477819_1.png	\N	0	f	2026-01-15 18:39:24.196973
2439	513	https://www.corbeta.com.co/media/catalog/product/d/i/dispensador.jpg	\N	0	f	2026-01-15 18:39:24.238251
2440	513	https://www.corbeta.com.co/media/catalog/product/7/7/7705946477802.1.jpg	\N	1	f	2026-01-15 18:39:24.239085
2441	513	https://www.corbeta.com.co/media/catalog/product/7/7/7705946477802.2.jpg	\N	2	f	2026-01-15 18:39:24.239635
2442	513	https://www.corbeta.com.co/media/catalog/product/7/7/7705946477802.3.jpg	\N	3	f	2026-01-15 18:39:24.240196
2443	513	https://www.corbeta.com.co/media/catalog/product/7/7/7705946477802.4.jpg	\N	4	f	2026-01-15 18:39:24.240791
2444	514	https://www.corbeta.com.co/media/catalog/product/7/7/7705946374064.jpg	\N	0	f	2026-01-15 18:39:24.271059
2445	514	https://www.corbeta.com.co/media/catalog/product/7/7/7705946374064_2.jpg	\N	1	f	2026-01-15 18:39:24.271682
2446	514	https://www.corbeta.com.co/media/catalog/product/7/7/7705946374064.5.jpg	\N	2	f	2026-01-15 18:39:24.27239
2447	514	https://www.corbeta.com.co/media/catalog/product/7/7/7705946374064.2.jpg	\N	3	f	2026-01-15 18:39:24.273014
2448	514	https://www.corbeta.com.co/media/catalog/product/7/7/7705946374064.3.jpg	\N	4	f	2026-01-15 18:39:24.273555
2450	515	https://www.corbeta.com.co/media/catalog/product/7/7/7705946478748-001-750wx750h.jpg	\N	0	f	2026-01-15 18:39:24.298229
2451	515	https://www.corbeta.com.co/media/catalog/product/7/7/7705946478748-001-750wx750h_2.jpg	\N	1	f	2026-01-15 18:39:24.298932
2452	515	https://www.corbeta.com.co/media/catalog/product/7/7/7705946478748.2.jpg	\N	2	f	2026-01-15 18:39:24.299609
2453	515	https://www.corbeta.com.co/media/catalog/product/7/7/7705946478748.jpg	\N	3	f	2026-01-15 18:39:24.300201
2454	515	https://www.corbeta.com.co/media/catalog/product/7/7/7705946478748.1.jpg	\N	4	f	2026-01-15 18:39:24.300848
2455	515	https://www.corbeta.com.co/media/catalog/product/7/7/7705946478748.3.jpg	\N	5	f	2026-01-15 18:39:24.301405
2458	517	https://www.corbeta.com.co/media/catalog/product/7/7/7705946478021-001-750wx750h.jpg	\N	0	f	2026-01-15 18:39:24.359621
2459	517	https://www.corbeta.com.co/media/catalog/product/7/7/7705946478021.jpg	\N	1	f	2026-01-15 18:39:24.360268
2460	517	https://www.corbeta.com.co/media/catalog/product/7/7/7705946478021-009-1400wx1400h.jpg	\N	2	f	2026-01-15 18:39:24.360815
2461	517	https://www.corbeta.com.co/media/catalog/product/7/7/7705946478021.1.jpg	\N	3	f	2026-01-15 18:39:24.361366
2946	886	https://audioluces.com/wp-content/uploads/cabina-activa-15-pulgadas-profesional.jpg	\N	1	f	2026-01-16 13:23:41.885877
2948	887	https://jblpro.com/en/site_elements/prx915-rear-panel.jpg	\N	1	f	2026-01-16 13:23:41.931396
2947	887	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:41.930664
2952	889	https://maximuebles.com.co/wp-content/uploads/sofa-cama-clic-clac-extendido.jpg	\N	1	f	2026-01-16 13:23:41.983125
2954	890	https://maximuebles.com.co/wp-content/uploads/sofa-cama-montreal-detalle.jpg	\N	1	f	2026-01-16 13:23:41.993348
2953	890	https://maximuebles.com.co/productos/sofa-cama-montreal/	\N	0	f	2026-01-16 13:23:41.992561
4098	890	/images/productos/890.webp	Maximuebles Sofá Cama Montreal	0	t	2026-05-24 22:16:23.886392
2956	891	https://maximuebles.com.co/wp-content/uploads/somier-100-190-ambiente.jpg	\N	1	f	2026-01-16 13:23:42.016453
4099	891	/images/productos/891.webp	Maximuebles Somier Tapizado 100 X 190	0	t	2026-05-24 22:16:31.801772
2958	892	https://maximuebles.com.co/wp-content/uploads/somier-120-190-detalle.jpg	\N	1	f	2026-01-16 13:23:42.029785
4100	892	/images/productos/892.webp	Maximuebles Somier Tapizado 120 X 190	0	t	2026-05-24 22:16:38.668941
2960	893	https://maximuebles.com.co/wp-content/uploads/somier-140-190-frontal.jpg	\N	1	f	2026-01-16 13:23:42.042281
2962	894	https://maximuebles.com.co/wp-content/uploads/somier-dividido-union.jpg	\N	1	f	2026-01-16 13:23:42.058435
2964	895	https://maximuebles.com.co/wp-content/uploads/somier-queen-ambiente.jpg	\N	1	f	2026-01-16 13:23:42.066717
2470	522	https://www.corbeta.com.co/media/catalog/product/k/-/k-tf45_002.jpg	\N	0	f	2026-01-15 18:39:24.49513
2471	522	https://www.corbeta.com.co/media/catalog/product/k/-/k-tf45_003.jpg	\N	1	f	2026-01-15 18:39:24.495648
2472	522	https://www.corbeta.com.co/media/catalog/product/k/-/k-tf45_004.jpg	\N	2	f	2026-01-15 18:39:24.496226
2476	525	https://www.corbeta.com.co/media/catalog/product/7/7/7701023127554_001.jpg	\N	0	f	2026-01-15 18:39:24.536885
2477	525	https://www.corbeta.com.co/media/catalog/product/7/7/7701023127554_004.jpg	\N	1	f	2026-01-15 18:39:24.537554
2478	525	https://www.corbeta.com.co/media/catalog/product/7/7/7701023127554_003.jpg	\N	2	f	2026-01-15 18:39:24.538119
2480	526	https://www.corbeta.com.co/media/catalog/product/7/7/7705946479875-001-750wx750h.jpg	\N	0	f	2026-01-15 18:39:24.576166
2481	526	https://www.corbeta.com.co/media/catalog/product/7/7/7705946479875-005-750wx750h.jpg	\N	1	f	2026-01-15 18:39:24.576651
2482	527	https://www.corbeta.com.co/media/catalog/product/7/7/7705946255226-1.jpg	\N	0	f	2026-01-15 18:39:24.591912
2483	527	https://www.corbeta.com.co/media/catalog/product/7/7/7705946255226-2.jpg	\N	1	f	2026-01-15 18:39:24.592437
2484	528	https://www.corbeta.com.co/media/catalog/product/k/-/k-vap26p_001.jpg	\N	0	f	2026-01-15 18:39:24.621027
2485	528	https://www.corbeta.com.co/media/catalog/product/k/-/k-vap26p_002.jpg	\N	1	f	2026-01-15 18:39:24.621539
2486	528	https://www.corbeta.com.co/media/catalog/product/v/e/ventilador.jpg	\N	2	f	2026-01-15 18:39:24.622088
2487	529	https://s3.pagegear.co/477/articulos/70207/63496_700x933.jpg?8684400	\N	0	f	2026-01-15 18:54:02.613596
2488	529	https://s3.pagegear.co/477/articulos/70207/60388_700x933.jpg?8616564	\N	1	f	2026-01-15 18:54:02.616207
2489	529	https://s3.pagegear.co/477/articulos/70207/60389_700x933.jpg?8616573	\N	2	f	2026-01-15 18:54:02.617049
2490	529	https://s3.pagegear.co/477/articulos/70207/60392_700x933.jpg?8616588	\N	3	f	2026-01-15 18:54:02.61776
2491	530	https://s3.pagegear.co/477/articulos/70205/60336_700x933.jpg?8607832	\N	0	f	2026-01-15 18:54:02.637181
2492	530	https://s3.pagegear.co/477/articulos/70205/60337_700x933.jpg?8607837	\N	1	f	2026-01-15 18:54:02.638045
2493	530	https://s3.pagegear.co/477/articulos/70205/60339_700x933.jpg?8607847	\N	2	f	2026-01-15 18:54:02.638732
2494	531	https://s3.pagegear.co/477/articulos/70206/63482_700x933.jpg?8684057	\N	0	f	2026-01-15 18:54:02.651541
2495	531	https://s3.pagegear.co/477/articulos/70206/63483_700x933.jpg?8684062	\N	1	f	2026-01-15 18:54:02.652287
2496	531	https://s3.pagegear.co/477/articulos/70206/63485_700x933.jpg?8684072	\N	2	f	2026-01-15 18:54:02.652986
2966	896	https://maximuebles.com.co/wp-content/uploads/somier-king-detalle.jpg	\N	1	f	2026-01-16 13:23:42.07535
2968	897	https://maximuebles.com.co/wp-content/uploads/somier-berlin-acabado.jpg	\N	1	f	2026-01-16 13:23:42.082634
2972	899	https://m.media-amazon.com/images/I/81I7T+fG9KL._AC_SL1500_.jpg	\N	1	f	2026-01-16 13:23:42.109188
2974	900	https://i.pinimg.com/originals/de/85/33/de85333f677d33d9943e93a0a38f972b.jpg	\N	1	f	2026-01-16 13:23:42.130419
2976	901	https://images.thdstatic.com/productImages/3f6b78d2-432a-4f51-874e-5e361286c4a4/svn/grey-sectional-sofas-64_1000.jpg	\N	1	f	2026-01-16 13:23:42.153296
2978	902	https://i.ytimg.com/vi/3E8p5WvKj78/maxresdefault.jpg	\N	1	f	2026-01-16 13:23:42.172707
2980	903	https://i.pinimg.com/736x/8b/6e/5c/8b6e5c8f8c8d8f8d8f8d8f8d8f8d8f8d.jpg	\N	1	f	2026-01-16 13:23:42.191681
2982	904	https://i.pinimg.com/originals/9e/7a/8b/9e7a8b4f4f4f4f4f4f4f4f4f4f4f4f4f.jpg	\N	1	f	2026-01-16 13:23:42.213819
2984	905	https://i.pinimg.com/736x/2a/3b/4c/2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p.jpg	\N	1	f	2026-01-16 13:23:42.236359
2986	906	https://i.pinimg.com/originals/1a/2b/3c/1a2b3c4d5e6f7g8h9i0j.jpg	\N	1	f	2026-01-16 13:23:42.256365
2988	907	https://i.pinimg.com/originals/5e/6f/7g/5e6f7g8h9i0j1k2l3m4n.jpg	\N	1	f	2026-01-16 13:23:42.277686
2990	908	https://i.pinimg.com/originals/8a/9b/0c/8a9b0c1d2e3f4g5h6i7j.jpg	\N	1	f	2026-01-16 13:23:42.301945
2992	909	https://i.pinimg.com/originals/3d/4e/5f/3d4e5f6g7h8i9j0k1l2m.jpg	\N	1	f	2026-01-16 13:23:42.328336
2994	910	https://i.pinimg.com/originals/1a/2b/3c/1a2b3c4d5e6f7g8h9i0j.jpg	\N	1	f	2026-01-16 13:23:42.34701
2996	911	https://i.pinimg.com/originals/de/85/33/de85333f677d33d9943e93a0a38f972b.jpg	\N	1	f	2026-01-16 13:23:42.362816
2998	912	https://i.pinimg.com/originals/de/85/33/de85333f677d33d9943e93a0a38f972b.jpg	\N	1	f	2026-01-16 13:23:42.37605
3000	913	https://m.media-amazon.com/images/I/51pW5-k7pSL._AC_SL1500_.jpg	\N	1	f	2026-01-16 13:23:42.393374
3010	918	https://exitocol.vtexassets.com/arquivos/ids/17263542/Armario-Arizona-Interior.jpg	\N	1	f	2026-01-16 13:23:42.467912
2949	888	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:41.956931
2955	891	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.013882
2957	892	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.02862
2959	893	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.041412
2961	894	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.057517
2963	895	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.066125
2965	896	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.074663
2967	897	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.082034
2969	898	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.091202
2971	899	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.108429
2973	900	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.129505
2975	901	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.15233
2977	902	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.171649
2979	903	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.190911
2981	904	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.212745
2983	905	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.235455
2985	906	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.255553
2987	907	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.276738
2989	908	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.300666
2991	909	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.327489
2993	910	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.346377
2995	911	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.362317
2997	912	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.375471
2999	913	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.392632
3004	915	https://falabella.scene7.com/is/image/FalabellaCO/6280436_2	\N	1	f	2026-01-16 13:23:42.429251
3003	915	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.428462
3006	916	https://rtamuebles.com/wp-content/uploads/2022/CDB-9445-AMBIENTE.jpg	\N	1	f	2026-01-16 13:23:42.443683
3005	916	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.44306
3008	917	https://m.media-amazon.com/images/I/61fIqK2-v8L._AC_SL1500_.jpg	\N	1	f	2026-01-16 13:23:42.456346
3007	917	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.455747
3009	918	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.467347
3014	932	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:42:49.227996
3015	932	https://sumotosa.com.co/wp-content/uploads/2020/08/AX4-EVO-roja.png	\N	1	f	2026-01-16 13:42:49.228783
3016	932	https://sumotosa.com.co/wp-content/uploads/2020/08/AX4-EVO-negra.png	\N	2	f	2026-01-16 13:42:49.229638
3017	933	https://www.suzuki.com.co/sites/default/files/2026-01/AX4%20ABS%20NEGRA.png	\N	0	f	2026-01-16 13:42:49.253659
3018	933	https://www.suzuki.com.co/sites/default/files/2026-01/AX4%20ABS%20BLANCA.png	\N	1	f	2026-01-16 13:42:49.254251
3012	931	https://suzukimotosneocross.co/wp-content/uploads/2021/06/2-AX4-NEGRA.png	\N	1	f	2026-01-16 13:42:49.202387
3020	934	https://suzukimotosneocross.co/wp-content/uploads/2021/06/GNE3-125-NEGRA-renovada.png	\N	0	f	2026-01-16 13:42:49.271738
3021	934	https://suzukimotosneocross.co/wp-content/uploads/2021/06/GNE3-ROJA-2022-renovada-600x347.png	\N	1	f	2026-01-16 13:42:49.272238
3023	935	https://www.suzuki.com.co/sites/default/files/2025-07/GN125%20ABS%20AZUL-NEGRO.png	\N	0	f	2026-01-16 13:42:49.288762
3011	931	https://suzukimotosneocross.co/wp-content/uploads/2021/06/3-AX4-ROJA.png	\N	0	f	2026-01-16 13:42:49.200422
3025	935	https://www.suzuki.com.co/sites/default/files/2025-07/GN125%20ABS%20NARANJA%20-%20NEGRO.png	\N	2	f	2026-01-16 13:42:49.289665
3027	936	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:42:49.307124
3028	936	https://sumotosa.com.co/wp-content/uploads/2020/08/viva-r-cool-blanca-1385-X-800.png	\N	1	f	2026-01-16 13:42:49.307547
3029	936	https://sumotosa.com.co/wp-content/uploads/2020/08/viva-r-cool-gris-1385-X-800-1.png	\N	2	f	2026-01-16 13:42:49.307956
3030	937	https://suzukimotosneocross.co/wp-content/uploads/2021/06/VIVA-R-STYLE-NEGRA-E3.png	\N	0	f	2026-01-16 13:42:49.323047
3031	937	https://suzukimotosneocross.co/wp-content/uploads/2021/02/vivastyle.png	\N	1	f	2026-01-16 13:42:49.323544
3032	938	https://suzukimotosneocross.co/wp-content/uploads/2021/06/SUZUKI-NEW-BEST-125-NEGRA-min.png	\N	0	f	2026-01-16 13:42:49.346072
3033	939	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:42:49.358832
3034	939	https://moto.suzuki.es/storage/images/80l3ly4lbbxtuitx7kwmjpt38psikwupxluhbjej.jpg	\N	1	f	2026-01-16 13:42:49.359447
3035	939	https://moto.suzuki.es/storage/images/jggiox2eof4s0o1qiivhkusqci4k2vouuwepxwe8.jpg	\N	2	f	2026-01-16 13:42:49.360079
3036	940	https://www.suzuki.com.co/sites/default/files/2026-01/ADDRESS%20NM%20AZUL.png	\N	0	f	2026-01-16 13:42:49.379128
3037	940	https://www.suzuki.com.co/sites/default/files/2026-01/ADDRESS%20NM%20NEGRA.png	\N	1	f	2026-01-16 13:42:49.379634
3038	941	https://suzukimotosneocross.co/wp-content/uploads/2022/06/ADDRESS-NZ-AZUL-1385-X-800.png	\N	0	f	2026-01-16 13:42:49.397845
3039	942	https://www.suzuki.com.co/sites/default/files/2026-01/AVENIS%20NEGRA.png	\N	0	f	2026-01-16 13:42:49.412267
3040	942	https://www.suzuki.com.co/sites/default/files/2026-01/AVENIS%20BLANCA.png	\N	1	f	2026-01-16 13:42:49.412689
3053	947	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:42:49.51208
3054	948	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:42:49.535252
3057	951	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:42:49.589927
2950	888	https://stockmusik.com.co/wp-content/uploads/2021/04/cabina-lyl-doble-15.jpg	\N	1	f	2026-01-16 13:23:41.958019
4101	893	/images/productos/893.webp	Maximuebles Somier Tapizado 140 X 190	0	t	2026-05-24 22:16:45.506166
4102	894	/images/productos/894.webp	Maximuebles Somier 140 X 190 (2 Somier de 70 X 190)	0	t	2026-05-24 22:16:52.685104
4103	895	/images/productos/895.webp	Maximuebles Somier 160 X 190 (2 Somier de 80 X 190)	0	t	2026-05-24 22:17:00.02224
4104	896	/images/productos/896.webp	Maximuebles Somier 200 X 200 (2 Somier de 100X200)	0	t	2026-05-24 22:17:06.795192
3042	942	https://www.suzuki.com.co/sites/default/files/2026-01/AVENIS%20AMARILLA.png	\N	3	f	2026-01-16 13:42:49.413575
3043	943	https://www.suzuki.com.co/sites/default/files/2026-01/BURGMAN%20NEGRA.png	\N	0	f	2026-01-16 13:42:49.428493
3045	943	https://www.suzuki.com.co/sites/default/files/2026-01/BURGMAN%20GRIS.png	\N	2	f	2026-01-16 13:42:49.429524
3047	944	https://suzukimotocrossdeloriente.com/motocicleta/dr-150/	\N	0	f	2026-01-16 13:42:49.453048
3048	945	https://www.suzuki.com.co/sites/default/files/2026-01/DR150%20FI%20ABS%20NEGRA.png	\N	0	f	2026-01-16 13:42:49.4716
3049	945	https://www.suzuki.com.co/sites/default/files/2026-01/DR150%20FI%20ABS%20AZUL.png	\N	1	f	2026-01-16 13:42:49.472039
3051	945	https://www.suzuki.com.co/sites/default/files/2026-01/DR150%20FI%20ABS%20ROJA.png	\N	3	f	2026-01-16 13:42:49.472909
3052	946	https://suzukimotocrossdeloriente.com/motocicleta/gixxer-fi-150-abs/	\N	0	f	2026-01-16 13:42:49.491408
3055	949	https://motos-suzuki.com/catalogo/gixxer-250-abs/	\N	0	f	2026-01-16 13:42:49.557747
3056	950	https://www.suzuki.com.co/motocicletas/categoria/v-strom	\N	0	f	2026-01-16 13:42:49.578638
3058	952	https://sukymoto.com/motocicleta/gsxr-150-abs/	\N	0	f	2026-01-16 13:42:49.607413
3059	953	https://suzukicycles.com/adventure/2025/v-strom-250	\N	0	f	2026-01-16 13:42:49.624648
3060	954	https://suzukicycles.com/adventure/2025/v-strom-650xt	\N	0	f	2026-01-16 13:42:49.644421
4156	523	/images/productos/523.webp	Samurai VENTILADOR SILENCE FORCE PLUS 2 EN 1 NEGRO SAMURAI	0	t	2026-05-25 14:49:41.115307
2109	361	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162269-800-auto?v=638948563142100000&width=800&height=auto&aspect=true	\N	0	f	2026-01-15 16:37:12.332765
2110	361	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.334786
2111	361	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.335691
2112	361	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.336542
3952	361	/images/productos/361.webp	Comodísimos Semiortopedico 90x190	0	t	2026-05-24 21:54:06.908823
3953	362	/images/productos/362.webp	Comodísimos Semiortopedico 100x190	0	t	2026-05-24 21:54:15.21547
3975	384	/images/productos/384.webp	Comodísimos Colchón Titanium Special 200x200	0	t	2026-05-24 21:57:44.380947
2346	416	https://www.lg.com/content/dam/channel/wcms/co/ref/b-f/gb45wpt/gallery/2010-x-1334/18%20.2010x1334_1%20Retiq.png/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	6	f	2026-01-15 16:37:13.779594
4007	416	/images/productos/416.webp	LG Nevera LG Congelador Inferior 461L Negro Mate Disp. agua	0	t	2026-05-24 22:02:37.799058
2348	417	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/lm22sgp/2010x1334%202.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.795702
2349	417	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/lm22sgp/2010x1334%206.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.796419
2350	417	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/lm22sgp/2010x1334%208.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	3	f	2026-01-15 16:37:13.797447
2351	417	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/lm22sgp/2010x1334%203.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	4	f	2026-01-15 16:37:13.798726
2352	417	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/lm22sgp/2010x1334%2013.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	5	f	2026-01-15 16:37:13.799489
2353	417	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/lm22sgp/gallery/DZ-15.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	6	f	2026-01-15 16:37:13.800194
2354	417	https://www.lg.com/content/dam/channel/wcms/co/banner/retiq/lm22sgp/LM22SGP-1600x1062-RETIQ.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	7	f	2026-01-15 16:37:13.800833
4008	417	/images/productos/417.webp	LG Nevecon LG French Door 618L Plata Disp. de agua	0	t	2026-05-24 22:02:45.406971
4009	418	/images/productos/418.webp	LG Nevecon LG Side by Side 635L Plata Mate InstaView™ ThinQ™	0	t	2026-05-24 22:02:53.935587
4042	522	/images/productos/522.webp	Kalley VENTILADOR DE TORRE NEGRO KALLEY K-TF45	0	t	2026-05-24 22:07:31.174216
2479	525	https://www.corbeta.com.co/media/catalog/product/7/7/7701023127554_002.jpg	\N	3	f	2026-01-15 18:39:24.538816
4044	525	/images/productos/525.webp	Kalley VENTILADOR ALTA POTENCIA NEGRO Y PLATEADO KALLEY K-VP20HS	0	t	2026-05-24 22:07:46.529593
4045	526	/images/productos/526.webp	Kalley VENTILADOR BLANCO DE PISO KALLEY TORRE K-TFB	0	t	2026-05-24 22:07:53.53141
4046	527	/images/productos/527.webp	Kalley VENTILADOR NEGRO KALLEY PARED K-VAP26W	0	t	2026-05-24 22:08:01.260575
4047	528	/images/productos/528.webp	Kalley VENTILADOR DE PEDESTAL NEGRO KALLEY K-VAP26P	0	t	2026-05-24 22:08:08.655056
4048	529	/images/productos/529.webp	Hyundai Televisor HYUNDAI 43" Smart Google TV FHD	0	t	2026-05-24 22:08:16.208253
4105	897	/images/productos/897.webp	Maximuebles Somier Suiza - Berlín - Tokio 140X190	0	t	2026-05-24 22:17:19.555036
2970	898	https://maximuebles.com.co/wp-content/uploads/combo-tokio-nochero-detalle.jpg	\N	1	f	2026-01-16 13:23:42.091886
4106	898	/images/productos/898.webp	Maximuebles Combo Tokio 140 (Colchón+Base Cama+Nochero+2 Almohadas)	0	t	2026-05-24 22:17:27.450881
4107	899	/images/productos/899.webp	Maximuebles Sala L Sahara + Mesa de Centro	0	t	2026-05-24 22:17:35.104208
3954	363	/images/productos/363.webp	Comodísimos Semiortopedico 120x190	0	t	2026-05-24 21:54:41.938284
3955	364	/images/productos/364.webp	Comodísimos Semiortopedico 130x190	0	t	2026-05-24 21:54:49.80016
3956	365	/images/productos/365.webp	Comodísimos Semiortopedico 140x190	0	t	2026-05-24 21:54:58.905058
3976	385	/images/productos/385.webp	Comodísimos Colchón Silver Pillow 140x190	0	t	2026-05-24 21:57:55.291369
3977	386	/images/productos/386.webp	Comodísimos Colchón Gold Pillow 140x190	0	t	2026-05-24 21:58:03.810674
3978	387	/images/productos/387.webp	Comodísimos Colchón Gold Pillow 160x190	0	t	2026-05-24 21:58:11.012351
2220	388	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.563713
3979	388	/images/productos/388.webp	Comodísimos Colchón Gold Pillow 200x200	0	t	2026-05-24 21:58:19.434536
2370	419	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66sxtc/gallery/12.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	8	f	2026-01-15 16:37:13.85915
2372	419	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gs66sxtc/gallery/15.png/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	10	f	2026-01-15 16:37:13.860625
4010	419	/images/productos/419.webp	LG Nevecon LG Side by Side 635L Negro Mate InstaView™ ThinQ™	0	t	2026-05-24 22:03:04.491036
4012	483	/images/productos/483.webp	Honda CB 125F DLX 2026	0	t	2026-05-24 22:03:20.19322
4013	484	/images/productos/484.webp	Honda WAVE 110S CBS 2026	0	t	2026-05-24 22:03:28.652383
4014	485	/images/productos/485.webp	Honda CB 190R 2.0 2026	0	t	2026-05-24 22:03:36.046481
4015	486	/images/productos/486.webp	Honda CB 300F 2024	0	t	2026-05-24 22:03:44.573926
4016	487	/images/productos/487.webp	Honda DIO LED DLX 2026	0	t	2026-05-24 22:03:51.940635
4017	488	/images/productos/488.webp	Honda DIO LED STD 2026	0	t	2026-05-24 22:04:00.371901
4018	489	/images/productos/489.webp	Honda NAVI 2026	0	t	2026-05-24 22:04:07.897549
4049	530	/images/productos/530.webp	Hyundai Televisor HYUNDAI 58" Smart Google TV 4K	0	t	2026-05-24 22:08:26.752294
4050	531	/images/productos/531.webp	Hyundai Televisor HYUNDAI 65" Smart Google TV 4K	0	t	2026-05-24 22:08:34.728859
4052	769	/images/productos/769.webp	STIHL MS 172 40CM	0	t	2026-05-24 22:08:52.425964
4053	770	/images/productos/770.webp	STIHL MS 182 45CM	0	t	2026-05-24 22:09:00.452998
4054	771	/images/productos/771.webp	STIHL MSA 60.0	0	t	2026-05-24 22:09:08.105723
4055	772	/images/productos/772.webp	STIHL MS 250 50CM	0	t	2026-05-24 22:09:18.107091
4108	900	/images/productos/900.webp	Maximuebles Sala L Verona + Mesa de Centro	0	t	2026-05-24 22:17:45.423191
4109	901	/images/productos/901.webp	Maximuebles Sala L Italiana JR + Mesa de Centro	0	t	2026-05-24 22:17:53.232364
4110	902	/images/productos/902.webp	Maximuebles Sala Hilton + Mesa de Centro	0	t	2026-05-24 22:18:00.378967
4111	903	/images/productos/903.webp	Maximuebles Sala L Ottawa + Mesa de Centro	0	t	2026-05-24 22:18:07.927619
4112	904	/images/productos/904.webp	Maximuebles Sofa Manhatan + Mesa de Centro	0	t	2026-05-24 22:18:15.399415
4113	905	/images/productos/905.webp	Maximuebles Sala L Anni + Mesa de Centro	0	t	2026-05-24 22:18:24.626145
4114	906	/images/productos/906.webp	Maximuebles Sala Montreal 3x2 + Mesa de Centro	0	t	2026-05-24 22:18:32.012688
4115	907	/images/productos/907.webp	Maximuebles Sala L Paris + Mesa de Centro	0	t	2026-05-24 22:18:39.144083
4116	908	/images/productos/908.webp	Maximuebles Silla Operativa Atlanta	0	t	2026-05-24 22:18:46.933613
4117	909	/images/productos/909.webp	Maximuebles Silla Reclinable Alem	0	t	2026-05-24 22:18:55.461768
4118	910	/images/productos/910.webp	Maximuebles Comedor Hilton 4 PTS	0	t	2026-05-24 22:19:05.377807
4119	911	/images/productos/911.webp	Maximuebles Comedor Manhatan 4 PTS	0	t	2026-05-24 22:19:12.743803
4120	912	/images/productos/912.webp	Maximuebles Comedor Moscu 4 TS	0	t	2026-05-24 22:19:20.148194
4011	482	/images/productos/482.webp	Honda CB 100 2026	0	t	2026-05-24 22:03:12.036616
2865	768	https://www.stihl.com.co/content/dam/stihl/media/pim/16882.jpg	\N	0	f	2026-01-15 22:02:34.441558
2866	768	https://www.stihl.com.co/content/dam/stihl/media/pim/16876.jpg	\N	1	f	2026-01-15 22:02:34.443775
2867	768	https://www.stihl.com.co/content/dam/stihl/media/pim/16881.jpg	\N	2	f	2026-01-15 22:02:34.444811
4051	768	/images/productos/768.webp	STIHL MS 162 35CM	0	t	2026-05-24 22:08:44.077299
3957	366	/images/productos/366.webp	Comodísimos Colchón Ortopedico Dual O Clasic Foam 90x190	0	t	2026-05-24 21:55:09.358981
3980	389	/images/productos/389.webp	LG Televisor LG 32" HD AI Smart TV - LR600	0	t	2026-05-24 21:58:28.553911
3981	390	/images/productos/390.webp	LG Televisor LG 43'' Full HD - 43LM6370PDB	0	t	2026-05-24 21:58:36.139485
2231	391	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/50-ua75-a/gallery/uhd-ua75-2025-50-gallery-04.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	3	f	2026-01-15 16:37:13.078474
3982	391	/images/productos/391.webp	LG Televisor LG 50" UHD AI 4K Smart TV 2025 – Incluye Magic Remote AI	0	t	2026-05-24 21:58:45.869283
2233	392	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/55-ua75-a/gallery/uhd-ua75-2025-55-gallery-04.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.140658
2234	392	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/55-ua75-a/gallery/uhd-ua75-2025-55-gallery-05.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.141417
3983	392	/images/productos/392.webp	LG Televisor LG 55" UHD AI 4K Smart TV 2025 – Incluye Magic Remote AI	0	t	2026-05-24 21:58:53.726049
3984	393	/images/productos/393.webp	LG Televisor LG 55'' NanoCell 4K - 55NANO80TSA	0	t	2026-05-24 21:59:00.965344
3985	394	/images/productos/394.webp	LG Televisor LG 65" UHD AI 4K Smart TV 2025 – Incluye Magic Remote AI	0	t	2026-05-24 21:59:08.759043
3986	395	/images/productos/395.webp	LG Televisor LG 65'' NanoCell 4K - 65NANO80TSA	0	t	2026-05-24 21:59:16.455807
2246	396	https://www.lg.com/content/dam/channel/wcms/co/2025_ms_lg-com/tv/uhd/ua75/gp1/gallery/75-ua75-a/gallery/uhd-ua75-2025-75-gallery-03.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.280655
3987	396	/images/productos/396.webp	LG Televisor LG 75" UHD AI 4K Smart TV 2025 – Incluye Magic Remote AI	0	t	2026-05-24 21:59:24.601063
3988	397	/images/productos/397.webp	LG Televisor LG 75'' NanoCell 4K - 75NANO80TSA	0	t	2026-05-24 21:59:34.234638
3989	398	/images/productos/398.webp	LG Televisor LG 86" UHD AI 4K Smart TV 2025 – Incluye Magic Remote AI	0	t	2026-05-24 21:59:42.399457
3990	399	/images/productos/399.webp	LG Televisor LG 86'' NanoCell 4K - 86NANO80TSA	0	t	2026-05-24 21:59:49.620698
3991	400	/images/productos/400.webp	LG Torre de sonido LG XBOOM RNC5 - Karaoke Star - DJ APP	0	t	2026-05-24 21:59:57.534624
3992	401	/images/productos/401.webp	LG Torre de sonido LG XBOOM RNC7 - Karaoke Star - DJ APP	0	t	2026-05-24 22:00:05.007717
3993	402	/images/productos/402.webp	LG Torre de sonido LG XBOOM RNC9 - Karaoke Star - DJ APP	0	t	2026-05-24 22:00:12.180594
3994	403	/images/productos/403.webp	LG Parlante LG xboom Grab - Portabilidad y Resistencia Total - Sonido IA	0	t	2026-05-24 22:00:19.869699
2268	404	https://www.lg.com/content/dam/channel/wcms/co/ms/av/bounce/gallery/2010-x-1334/DZ-04.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	1	f	2026-01-15 16:37:13.490204
2269	404	https://www.lg.com/content/dam/channel/wcms/co/ms/av/bounce/gallery/2010-x-1334/DZ-12.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	2	f	2026-01-15 16:37:13.490857
2270	404	https://www.lg.com/content/dam/channel/wcms/co/ms/av/bounce/gallery/2010-x-1334/DZ-13.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	3	f	2026-01-15 16:37:13.491512
3995	404	/images/productos/404.webp	LG LG xboom Bounce - Sonido IA y Resistencia Militar - 30H de Música	0	t	2026-05-24 22:00:29.153457
2274	405	https://www.lg.com/content/dam/channel/wcms/co/ms/av/stage301/gallery/2010-x-1334/xboom-stage301-2025-gallery-11.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	3	f	2026-01-15 16:37:13.542362
3996	405	/images/productos/405.webp	LG LG xboom Stage 301 - Sonido y Luces para tu Fiesta - 120W	0	t	2026-05-24 22:00:39.048373
4019	490	/images/productos/490.webp	Honda NAVI MIX 2026	0	t	2026-05-24 22:04:21.123753
2398	491	https://motos.honda.com.co/images/cms/Roja-6981e.png	\N	3	f	2026-01-15 17:51:11.346862
4020	491	/images/productos/491.webp	Honda PCX 160 ABS 2026	0	t	2026-05-24 22:04:28.617931
2399	492	https://motos.honda.com.co/images/cms/XR150L-20-blanco-version.png	\N	0	f	2026-01-15 17:51:11.394436
2401	492	https://motos.honda.com.co/images/cms/XR150L-20-rojo.png	\N	2	f	2026-01-15 17:51:11.396267
4021	492	/images/productos/492.webp	Honda XR 150L 2.0 2026	0	t	2026-05-24 22:04:36.732873
2404	493	https://motos.honda.com.co/images/cms/xr-190l-abs-rojo.png	\N	2	f	2026-01-15 17:51:11.445182
4022	493	/images/productos/493.webp	Honda XR 190L 2.0 2026	0	t	2026-05-24 22:04:44.875844
4023	494	/images/productos/494.webp	Honda XR 300L 2026	0	t	2026-05-24 22:04:52.418082
2880	773	https://www.stihl.com.co/content/dam/stihl/media/pim/127109.jpg	\N	2	f	2026-01-15 22:02:34.666673
4056	773	/images/productos/773.webp	STIHL MS 310 63CM	0	t	2026-05-24 22:09:28.982951
4057	774	/images/productos/774.webp	STIHL MS 363 63 CM	0	t	2026-05-24 22:09:37.181385
4121	913	/images/productos/913.webp	Inval Archivador 2 Gavetas	0	t	2026-05-24 22:19:31.219787
3002	914	https://inval.com.co/wp-content/uploads/2021/08/AM-31023-INTERIOR.jpg	\N	1	f	2026-01-16 13:23:42.411083
3001	914	https://via.placeholder.com/400x400?text=Sin+Imagen	\N	0	f	2026-01-16 13:23:42.410318
4122	914	/images/productos/914.webp	Inval Armario Inval (150X200) Arena / Blanco	0	t	2026-05-24 22:19:39.181387
4123	915	/images/productos/915.webp	Inval Armario Inval (200X200) Arena / Blanco	0	t	2026-05-24 22:19:47.151092
4124	916	/images/productos/916.webp	Inval Combo Escritorio + Biblioteca Astana Duna	0	t	2026-05-24 22:19:55.01507
4125	917	/images/productos/917.webp	Inval Cama 120X190 Kaia Miel / Blanco	0	t	2026-05-24 22:20:02.357604
4126	918	/images/productos/918.webp	Inval Armario Arizona (140x183) Bellota Blanco	0	t	2026-05-24 22:20:10.389244
4128	932	/images/productos/932.webp	Suzuki Suzuki AX4H Evolution EIII	0	t	2026-05-24 22:20:26.265267
3013	931	https://suzukimotosneocross.co/wp-content/uploads/2021/06/1-AX4-BLANCA.png	\N	2	f	2026-01-16 13:42:49.203062
4127	931	/images/productos/931.webp	Suzuki Suzuki AX4 EIII	0	t	2026-05-24 22:20:18.478239
3958	367	/images/productos/367.webp	Comodísimos Colchón Ortopedico Dual O Clasic Foam 100x180	0	t	2026-05-24 21:55:20.76897
3997	406	/images/productos/406.webp	LG Lavadora LG Carga Superior 13Kg Negro TurboDrum™ Punch+3	0	t	2026-05-24 22:00:50.814111
2282	407	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt19mvtb/gallery/DZ-07VB-T_T11V1NDHT2_Top.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	3	f	2026-01-15 16:37:13.593742
2283	407	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt19mvtb/gallery/DZ-15VB-T_T11V1NDHT2_Back.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	4	f	2026-01-15 16:37:13.594452
2284	407	https://www.lg.com/content/dam/channel/wcms/co/images/lavadoras-y-secadoras/wt19mvtb/gallery/RETIC-WT19MVTB-2010x1334.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	5	f	2026-01-15 16:37:13.59573
3998	407	/images/productos/407.webp	LG Lavadora LG Carga Superior 19Kg Negro TurboDrum™ Silencioso	0	t	2026-05-24 22:00:58.14182
3999	408	/images/productos/408.webp	LG Lavadora LG Carga Superior 23Kg Gris Grafito AIDD EasyUnload	0	t	2026-05-24 22:01:06.345682
4000	409	/images/productos/409.webp	LG Lavadora LG Carga Superior 25Kg Negro 6 Motion™ TurboWash3D™	0	t	2026-05-24 22:01:13.830454
4001	410	/images/productos/410.webp	LG Lavaseca LG 2 en 1 Carga Frontal 16Kg/8Kg Plata AIDD™	0	t	2026-05-24 22:01:21.130001
2307	411	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/wd16egnts6p/gallery/12%202010x1334-100.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	4	f	2026-01-15 16:37:13.676705
2308	411	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/wd16egnts6p/gallery/16%202010x1334-100.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	5	f	2026-01-15 16:37:13.677268
2309	411	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/wd16egnts6p/gallery/17%202010x1334-100.jpg/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	6	f	2026-01-15 16:37:13.678138
2310	411	https://www.lg.com/content/dam/channel/wcms/co/hs-2025/wm/wd16egnts6p/gallery/RETIQ-WO16EGNTS6P-2010x1334.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	7	f	2026-01-15 16:37:13.678987
4002	411	/images/productos/411.webp	LG Lavaseca 2 en 1 Carga Frontal LG 16kg Gris Grafito AI DD™ Pet Care	0	t	2026-05-24 22:01:28.643056
2316	412	https://www.lg.com/content/dam/channel/wcms/co/images/lavadorasysecadoras/wd22vv2s6b_assecol_escb_co_c/gallery/DZ-13.jpg?w=800	\N	5	f	2026-01-15 16:37:13.692481
2317	412	https://www.lg.com/content/dam/channel/wcms/co/images/lavadorasysecadoras/wd22vv2s6b_assecol_escb_co_c/gallery/DZ-14.jpg?w=800	\N	6	f	2026-01-15 16:37:13.693152
2318	412	https://www.lg.com/content/dam/channel/wcms/co/images/lavadorasysecadoras/wd22vv2s6b_assecol_escb_co_c/gallery/DZ-15.jpg?w=800	\N	7	f	2026-01-15 16:37:13.693725
4003	412	/images/productos/412.webp	LG Lava-Secadora Carga Frontal Victor 2 VCM Tipo Acero Inox (22kg/48lbs)	0	t	2026-05-24 22:01:37.209624
4024	495	/images/productos/495.webp	Honda NX 190 2026	0	t	2026-05-24 22:05:03.740942
4025	496	/images/productos/496.webp	Honda X-Blade 160 2026	0	t	2026-05-24 22:05:12.343207
4058	775	/images/productos/775.webp	STIHL MS 382 75CM	0	t	2026-05-24 22:09:48.015254
4059	776	/images/productos/776.webp	STIHL MS 462 75CM	0	t	2026-05-24 22:09:56.073928
4060	777	/images/productos/777.webp	STIHL MS 651 90 CM	0	t	2026-05-24 22:10:04.475899
4061	778	/images/productos/778.webp	STIHL MS 661 90CM	0	t	2026-05-24 22:10:12.234706
4062	779	/images/productos/779.webp	STIHL FS A57	0	t	2026-05-24 22:10:20.23745
4063	780	/images/productos/780.webp	STIHL FS 55 R	0	t	2026-05-24 22:10:28.095129
4064	781	/images/productos/781.webp	STIHL FS 230	0	t	2026-05-24 22:10:35.937157
4065	782	/images/productos/782.webp	STIHL FS 120	0	t	2026-05-24 22:10:44.531397
4066	783	/images/productos/783.webp	STIHL FS 120R	0	t	2026-05-24 22:10:51.947413
4067	784	/images/productos/784.webp	STIHL FS 235	0	t	2026-05-24 22:10:59.754899
4068	785	/images/productos/785.webp	STIHL FS 235R	0	t	2026-05-24 22:11:07.390219
4069	786	/images/productos/786.webp	STIHL FS 250	0	t	2026-05-24 22:11:16.369571
4129	933	/images/productos/933.webp	Suzuki Suzuki AX4 ABS	0	t	2026-05-24 22:20:40.166661
3022	934	https://suzukimotosneocross.co/wp-content/uploads/2021/06/GNE3-GRIS-2022-renovada.png	\N	2	f	2026-01-16 13:42:49.272813
4130	934	/images/productos/934.webp	Suzuki Suzuki GN 125 EIII	0	t	2026-05-24 22:20:47.785292
3026	935	https://www.suzuki.com.co/sites/default/files/2025-07/GN125%20ABS%20ROJO-NEGRO.png	\N	3	f	2026-01-16 13:42:49.290081
4131	935	/images/productos/935.webp	Suzuki Suzuki GN 125 ABS	0	t	2026-05-24 22:20:55.238728
2140	368	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.397087
3959	368	/images/productos/368.webp	Comodísimos Colchón Ortopedico Dual O Clasic Foam 120x180	0	t	2026-05-24 21:55:32.6742
3960	369	/images/productos/369.webp	Comodísimos Colchón Ortopedico Dual O Clasic Foam 140x190	0	t	2026-05-24 21:55:40.789894
2147	370	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.412629
2148	370	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.41328
3961	370	/images/productos/370.webp	Comodísimos Colchón Ortopedico Dual O Clasic Foam 160x190	0	t	2026-05-24 21:55:48.091814
2151	371	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.420968
2152	371	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.421897
3962	371	/images/productos/371.webp	Comodísimos Colchón Ortopedico Dual O Clasic Foam 200x200	0	t	2026-05-24 21:55:55.402876
3963	372	/images/productos/372.webp	Comodísimos Colchón Ortopedico Estandar 100x190	0	t	2026-05-24 21:56:03.422479
3964	373	/images/productos/373.webp	Comodísimos Colchón Ortopedico Estandar 120x190	0	t	2026-05-24 21:56:10.49937
4004	413	/images/productos/413.webp	LG Horno Microondas LG 20L Negro SlimNeoChef™ EasyClean™	0	t	2026-05-24 22:02:08.990495
2330	414	https://www.lg.com/content/dam/channel/wcms/co/banner/cambio-de-galerias/ha/gb37spv/2010x1334/GB37SPV-2010x1334-4.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	6	f	2026-01-15 16:37:13.74304
2331	414	https://www.lg.com/content/dam/channel/wcms/co/banner/cambio-de-galerias/ha/gb37spv/F459FSZW-GB37SPV-2010X1334.webp/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	7	f	2026-01-15 16:37:13.74374
2332	414	https://www.lg.com/content/dam/channel/wcms/co/images/neveras/gb37spv(gallery)/GB37SPV_COTAS_2010x1334_FICHA.png/jcr:content/renditions/thum-1600x1062.jpeg?w=800	\N	8	f	2026-01-15 16:37:13.744589
4005	414	/images/productos/414.webp	LG Nevera LG Congelador Inferior 343L Negro Mate Disp. agua	0	t	2026-05-24 22:02:16.180816
4026	497	/images/productos/497.webp	Honda X-Blade 160 2025	0	t	2026-05-24 22:05:27.970358
4027	498	/images/productos/498.webp	Kalley TV KALLEY 40" K-TV40G200 FHD	0	t	2026-05-24 22:05:35.640865
2420	499	https://www.corbeta.com.co/media/catalog/product/w/h/whatsapp_image_2022-04-11_at_4.33.50_pm_2_.jpeg	\N	2	f	2026-01-15 18:39:23.933834
2421	499	https://www.corbeta.com.co/media/catalog/product/7/7/7705946909716.jpg	\N	3	f	2026-01-15 18:39:23.935973
2422	499	https://www.corbeta.com.co/media/catalog/product/w/h/whatsapp_image_2022-04-11_at_4.33.50_pm_3_.jpeg	\N	4	f	2026-01-15 18:39:23.936946
4028	499	/images/productos/499.webp	Kalley MINIBAR KALLEY FROST K-MB43G	0	t	2026-05-24 22:05:42.91201
4029	507	/images/productos/507.webp	Kalley NEVERA VITRINA KALLEY FROST UNA PUERTA 211 LITROS	0	t	2026-05-24 22:05:50.061766
4030	509	/images/productos/509.webp	Kalley FREIDORA DE AIRE NEGRA 3.5 LITROS KALLEY K-MAF35	0	t	2026-05-24 22:05:57.831639
4031	510	/images/productos/510.webp	Kalley HORNO MICROONDAS KALLEY 0.7 K-MW07N	0	t	2026-05-24 22:06:05.509522
4032	511	/images/productos/511.webp	Kalley DISPENSADOR DE AGUA KALLEY K-DAM	0	t	2026-05-24 22:06:13.076741
4033	512	/images/productos/512.webp	Kalley DISPENSADOR DE AGUA BLANCO KALLEY DE PISO PARA BOTELLÓN K-DAG2	0	t	2026-05-24 22:06:20.494838
4132	936	/images/productos/936.webp	Suzuki Suzuki Viva R Cool EIII	0	t	2026-05-24 22:21:09.315314
4133	937	/images/productos/937.webp	Suzuki Suzuki Viva R Style EIII	0	t	2026-05-24 22:21:18.460426
4134	938	/images/productos/938.webp	Suzuki Suzuki Bets 125 FI	0	t	2026-05-24 22:21:26.302375
4135	939	/images/productos/939.webp	Suzuki Suzuki GSX 125	0	t	2026-05-24 22:21:34.945099
4136	940	/images/productos/940.webp	Suzuki Suzuki Address NM	0	t	2026-05-24 22:21:42.561072
3965	374	/images/productos/374.webp	Comodísimos Colchón Ortopedico Estandar 130x190	0	t	2026-05-24 21:56:21.96848
3966	375	/images/productos/375.webp	Comodísimos Colchón Ortopedico Estandar 140x190	0	t	2026-05-24 21:56:31.340325
2172	376	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.464784
3967	376	/images/productos/376.webp	Comodísimos Colchón Ortopedico Estandar 160x190	0	t	2026-05-24 21:56:38.204796
3968	377	/images/productos/377.webp	Comodísimos Colchón Super Flex Pillow 2 100x190	0	t	2026-05-24 21:56:47.063496
3969	378	/images/productos/378.webp	Comodísimos Colchón Super Flex Pillow 2 120x190	0	t	2026-05-24 21:56:54.408035
3970	379	/images/productos/379.webp	Comodísimos Colchón Super Flex Pillow 2 140x190	0	t	2026-05-24 21:57:01.583992
3971	380	/images/productos/380.webp	Comodísimos Colchón Super Flex Pillow 2 160x190	0	t	2026-05-24 21:57:08.787361
2190	381	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	1	f	2026-01-15 16:37:12.499804
2191	381	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162274-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	2	f	2026-01-15 16:37:12.50048
2192	381	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162278-800-auto?v=638748708309730000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.501119
3972	381	/images/productos/381.webp	Comodísimos Colchón Super Flex Pillow 2 200x200	0	t	2026-05-24 21:57:16.637622
2196	382	https://colchonescomodisimos.vtexassets.com/arquivos/ids/162273-800-auto?v=638948563142470000&width=800&height=auto&aspect=true	\N	3	f	2026-01-15 16:37:12.510164
3973	382	/images/productos/382.webp	Comodísimos Colchón Titanium Special 140x190	0	t	2026-05-24 21:57:24.857836
3974	383	/images/productos/383.webp	Comodísimos Colchón Titanium Special 160x190	0	t	2026-05-24 21:57:32.96366
4006	415	/images/productos/415.webp	LG Nevecon LG Side by Side 519L Plata Disp. agua Multi Air Flow	0	t	2026-05-24 22:02:26.881735
4034	513	/images/productos/513.webp	Kalley DISPENSADOR DE AGUA KALLEY DE PISO PARA RED HIDRÁULICA K-DAF	0	t	2026-05-24 22:06:27.748486
2449	514	https://www.corbeta.com.co/media/catalog/product/7/7/7705946374064.4_1.jpg	\N	5	f	2026-01-15 18:39:24.27432
4035	514	/images/productos/514.webp	Kalley LAVADORA KALLEY SEMI AUTOMÁTICA 7 KILOGRAMOS K-LAVSA7B	0	t	2026-05-24 22:06:34.836229
2456	515	https://www.corbeta.com.co/media/catalog/product/7/7/7705946478748.4.jpg	\N	6	f	2026-01-15 18:39:24.302019
2457	515	https://www.corbeta.com.co/media/catalog/product/7/7/7705946478748.5.jpg	\N	7	f	2026-01-15 18:39:24.302586
4036	515	/images/productos/515.webp	Kalley LAVADORA GRIS KALLEY CARGA SUPERIOR 16 KILOS K-LD16GE	0	t	2026-05-24 22:06:42.242126
4037	517	/images/productos/517.webp	Kalley NEVECÓN GRIS KALLEY LADO A LADO 529 LITROS K-N529L2	0	t	2026-05-24 22:06:49.37619
4137	941	/images/productos/941.webp	Suzuki Suzuki Address NZ	0	t	2026-05-24 22:21:54.053606
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.productos (id_producto, id_categoria, id_subcategoria, id_marca, sku, nombre, descripcion_corta, descripcion_larga, precio_actual, precio_anterior, precio_promocional, costo, referencia_proveedor, stock, stock_minimo, garantia_meses, badge, destacado, activo, vistas, ventas_totales, calificacion_promedio, total_resenas, fecha_creacion, fecha_actualizacion, specs, componentes, manual_override, fuente_scrape, ultima_actualizacion_scrape) FROM stdin;
521	1	102	14	SILENCE	SAMURAI de PARED, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas.	SAMURAI de PARED, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas. SAMURAI de PARED, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas.	SAMURAI de PARED, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas. SAMURAI de PARED, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas.	240000.00	\N	220000.00	\N	\N	10	5	12	\N	f	t	2	0	0.00	0	2026-01-15 18:39:24.486597	2026-05-25 14:49:41.021652	{}	[]	f	placeholder	2026-05-25 14:49:41.021652
811	4	111	7	WB220113415	RM 253.3	Cortacesped alta intensidad, 4T a gasolina, poten 2.8 hp, peso 33kg	Cortacesped alta intensidad, 4T a gasolina, poten 2.8 hp	2795000.00	\N	2385000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.848805	2026-05-25 14:23:08.263798	{"Peso": "33kg"}	[]	f	\N	\N
487	3	97	1	DIO-LED-DLX-2026	DIO LED DLX 2026	La DIO LED DLX es la compañera ideal para moverte por la ciudad con estilo y eficiencia. Su renovado sistema de iluminación LED y su diseño aerodinámico no solo te hacen destacar, sino que su motor confiable y transmisión automática V-Matic te ofrecen una conducción suave y práctica. Es la scooter perfecta para quienes buscan versatilidad, economía y el respaldo	La DIO LED DLX es la compañera ideal para moverte por la ciudad con estilo y eficiencia. Su renovado sistema de iluminación LED y su diseño aerodinámico no solo te hacen destacar, sino que su motor confiable y transmisión automática V-Matic te ofrecen una conducción suave y práctica. Es la scooter perfecta para quienes buscan versatilidad, economía y el respaldo	7850000.00	\N	7650000.00	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-15 17:51:11.172698	2026-05-25 15:03:17.463006	{}	[]	f	\N	\N
802	4	109	7	47840124406	SE62	Potente aspiradora de liquidos y solidos con encendido automatico	Potente aspiradora de liquidos y solidos con encendido automatico	1115000.00	\N	955000.00	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-15 22:02:35.554922	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
395	1	86	5	65NANO80T	Televisor LG 65'' NanoCell 4K - 65NANO80TSA	Disfruta de la pureza del color en una escala mayor. El LG NanoCell de 65 pulgadas ofrece una experiencia visual envolvente con colores reales y un contraste mejorado. Su tecnología de IA adapta la imagen y el sonido a tu entorno, mientras que webOS te permite navegar sin límites por tus plataformas de streaming.	Disfruta de la pureza del color en una escala mayor. El LG NanoCell de 65 pulgadas ofrece una experiencia visual envolvente con colores reales y un contraste mejorado. Su tecnología de IA adapta la imagen y el sonido a tu entorno, mientras que webOS te permite navegar sin límites por tus plataformas de streaming.	3265000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.256051	2026-05-25 14:23:08.241157	{"Color": "en una escala mayor"}	[]	f	\N	\N
412	1	90	5	WD22VV2S	Lava-Secadora Carga Frontal Victor 2 VCM Tipo Acero Inox (22kg/48lbs)	Potencia y elegancia se unen en la Victor 2. Con una capacidad masiva de 22 Kg para lavado, esta lavaseca integra tecnología AI DD™ para detectar el peso y suavidad de las telas, optimizando el ciclo automáticamente. Su función Steam™ elimina bacterias y arrugas con vapor, mientras que TurboWash™ reduce los tiempos de lavado sin comprometer la limpieza. Todo controlable desde tu smartphone vía ThinQ™.	Potencia y elegancia se unen en la Victor 2. Con una capacidad masiva de 22 Kg para lavado, esta lavaseca integra tecnología AI DD™ para detectar el peso y suavidad de las telas, optimizando el ciclo automáticamente. Su función Steam™ elimina bacterias y arrugas con vapor, mientras que TurboWash™ reduce los tiempos de lavado sin comprometer la limpieza. Todo controlable desde tu smartphone vía ThinQ™.	5025000.00	\N	\N	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-15 16:37:13.68578	2026-05-25 14:23:08.247893	{"Potencia": "y elegancia se unen en la Victor 2"}	[]	f	\N	\N
416	1	91	5	GB-45WPT	Nevera LG Congelador Inferior 461L Negro Mate Disp. agua	Gran capacidad y diseño sofisticado se unen en este modelo Bottom Freezer de 461 litros. Con tecnología Door Cooling+™, tus bebidas se enfrían más rápido y los alimentos se mantienen frescos por más tiempo. Su acabado en Negro Mate PCM es resistente y moderno, ideal para familias que buscan eficiencia energética grado A y un sistema de organización inteligente con 3 cajones de congelador transparentes.	Gran capacidad y diseño sofisticado se unen en este modelo Bottom Freezer de 461 litros. Con tecnología Door Cooling+™, tus bebidas se enfrían más rápido y los alimentos se mantienen frescos por más tiempo. Su acabado en Negro Mate PCM es resistente y moderno, ideal para familias que buscan eficiencia energética grado A y un sistema de organización inteligente con 3 cajones de congelador transparentes.	3980000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.774184	2026-05-25 14:23:08.248895	{"Capacidad": "y diseño sofisticado se unen en este modelo Bottom Freezer de 461 litros"}	[]	f	\N	\N
499	1	99	2	K-MB43G	MINIBAR KALLEY FROST K-MB43G	Capacidad 43 Litros: Cuenta con la capacidad perfecta para conservar y refrigerar alimentos y bebidas. Potencia 70 W: Mayor potencia para un rápido enfriamiento. Refrigerante R600a: Refrigerante ecológico. No afecta el medio ambiente. Refrigerador y congelador: Permite preservar adecuadamente los alimentos. Incluye accesorios: Llave de seguridad, cubeta de hielo, bandeja para descongelar y entrepaño. Dimensiones: 47.2 ancho x 45 prof x 49.2 alto (cm)	Capacidad 43 Litros: Cuenta con la capacidad perfecta para conservar y refrigerar alimentos y bebidas. Potencia 70 W: Mayor potencia para un rápido enfriamiento. Refrigerante R600a: Refrigerante ecológico. No afecta el medio ambiente. Refrigerador y congelador: Permite preservar adecuadamente los alimentos. Incluye accesorios: Llave de seguridad, cubeta de hielo, bandeja para descongelar y entrepaño. Dimensiones: 47.2 ancho x 45 prof x 49.2 alto (cm)	570000.00	\N	515000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:23.925929	2026-05-25 14:23:08.250738	{"Potencia": "70 W: Mayor potencia para un rápido enfriamiento"}	[]	f	\N	\N
509	1	99	2	K-MAF35	FREIDORA DE AIRE NEGRA 3.5 LITROS KALLEY K-MAF35	Ideal para preparaciones saludables: Permite freír, tostar, asar y hornear los alimentos de manera rápida, sencilla y saludable, sin necesidad de utilizar aceites. Potencia de 1500 W: Mayor eficiencia y potencia para la preparación de tus alimentos. Capacidad 3.5 Litros: Cesta interior de gran capacidad para preparar tus comidas favoritas. Temporizador de 60 min y Apagado Automático: Cuando termina el ciclo de cocción, emite un sonido de campana y el Airfryer se apaga automáticamente. Temper	Ideal para preparaciones saludables: Permite freír, tostar, asar y hornear los alimentos de manera rápida, sencilla y saludable, sin necesidad de utilizar aceites. Potencia de 1500 W: Mayor eficiencia y potencia para la preparación de tus alimentos. Capacidad 3.5 Litros: Cesta interior de gran capacidad para preparar tus comidas favoritas. Temporizador de 60 min y Apagado Automático: Cuando termina el ciclo de cocción, emite un sonido de campana y el Airfryer se apaga automáticamente. Temperatura hasta 200°C: Alcanza temperaturas altas para tus diferentes recetas y preparaciones. Indicador luminoso de encendido: Al seleccionar el tiempo se encenderá la luz. Flujo de aire constante y circular: Cocina de manera homogénea y rápida los alimentosa tu gusto. Cesta interior y base antiadherente: Evita que los alimentos se peguen al recipiente interno, facilitando su limpieza. Características ideales: Permite freír, tostar, asar y hornear los alimentos de manera rápida, sencilla y saludable, sin necesidad de utilizar aceite. Salidas de aire caliente: Permite que la coccion sea homogénea y que no se sobrecailente el producto. Mango antideslizante: Mango frío al tacto, permite verificar el contenido del Air fryer con seguridad. Suiche de seguridad: El Airfryer solo funcionará si su cesta se encuentre bien posicionada. Color negro y plateado: Da un toque elegante a tu cocina. Medidas y peso del empaque: (LxWxH [mm] y kg) - 350x313x341 mm - 4.7 Kg Medidas y peso del producto: (LxWxH [mm] y kg) - 350 x 260 x 306 mm - 4.1 kg	260000.00	\N	225000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.065045	2026-05-25 14:23:08.251419	{"Color": "negro y plateado: Da un toque elegante a tu cocina", "Potencia": "de 1500 W: Mayor eficiencia y potencia para la preparación de tus alimentos", "Capacidad": "para preparar tus comidas favoritas"}	[]	f	\N	\N
396	1	86	5	75UA8050	Televisor LG 75" UHD AI 4K Smart TV 2025 – Incluye Magic Remote AI	Una pantalla colosal para una inmersión absoluta. El LG UHD de 75 pulgadas (2025) redefine el entretenimiento en casa con procesamiento de imagen avanzado por IA y un diseño ultra delgado. Con control por voz Voice ID y compatibilidad total con Apple y Google, es el centro inteligente perfecto para tu hogar.	Una pantalla colosal para una inmersión absoluta. El LG UHD de 75 pulgadas (2025) redefine el entretenimiento en casa con procesamiento de imagen avanzado por IA y un diseño ultra delgado. Con control por voz Voice ID y compatibilidad total con Apple y Google, es el centro inteligente perfecto para tu hogar.	3795000.00	\N	\N	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-15 16:37:13.27484	2026-05-25 14:51:05.238769	{"Pantalla": "colosal para una inmersión absoluta"}	[]	f	\N	\N
510	1	99	2	K-MW07N	HORNO MICROONDAS KALLEY 0.7 K-MW07N	El Horno Microondas Kalley K-MW07N cuenta con una potencia de 700W que permite cocinar tus alimentos en menor tiempo. Sus niveles de potencia son de 0 a 10, ajustable y 6 opciones preprogramadas para que elijas de acuerdo con lo que quieras cocinar. Su capacidad es de 20L, practico y con el tamaño ideal para que prepares, cocines o calientes tus preparaciones favoritas. Su material interno es refractario para facilitar la limpieza y la puerta en acabado de microperforado dan elegancia a tu cocin	El Horno Microondas Kalley K-MW07N cuenta con una potencia de 700W que permite cocinar tus alimentos en menor tiempo. Sus niveles de potencia son de 0 a 10, ajustable y 6 opciones preprogramadas para que elijas de acuerdo con lo que quieras cocinar. Su capacidad es de 20L, practico y con el tamaño ideal para que prepares, cocines o calientes tus preparaciones favoritas. Su material interno es refractario para facilitar la limpieza y la puerta en acabado de microperforado dan elegancia a tu cocina. 6 opciones de cocción programadas: Oprimes solo un botón para acceder a estas opciones (Crispetas, papas, pizza, vegetales congelados, bebidas, cena). Descongelar por peso o tiempo Menú con programas prestablecidos para mayor rapidez Bandeja de vidrio rotatoria y de alta durabilidad Capacidad 20 Litros Función de inicio rápido	335000.00	\N	300000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.135428	2026-05-25 14:23:08.252494	{"Potencia": "de 700W que permite cocinar tus alimentos en menor tiempo"}	[]	f	\N	\N
515	1	100	2	K-LD16G"G	LAVADORA GRIS KALLEY CARGA SUPERIOR 16 KILOS K-LD16GE	¡Descubre la lavadora ideal para tu hogar! Con 12 kilos de capacidad y un diseño compacto, es perfecta para espacios reducidos. Su panel digital y 8 ciclos de lavado garantizan un rendimiento personalizado y eficiente. La tapa con control de caída evita accidentes, y su manejo es intuitivo para tu comodidad. Aprovecha esta combinación de gran capacidad y tamaño reducido. ¡Lleva la tecnología y conveniencia a tu casa hoy mismo! Clasificación energética tipo A: Más ahorro, menos consumo y excelen	¡Descubre la lavadora ideal para tu hogar! Con 12 kilos de capacidad y un diseño compacto, es perfecta para espacios reducidos. Su panel digital y 8 ciclos de lavado garantizan un rendimiento personalizado y eficiente. La tapa con control de caída evita accidentes, y su manejo es intuitivo para tu comodidad. Aprovecha esta combinación de gran capacidad y tamaño reducido. ¡Lleva la tecnología y conveniencia a tu casa hoy mismo! Clasificación energética tipo A: Más ahorro, menos consumo y excelente rendimiento. Panel de control digital: Panel digital con programas preestablecidos y luces LED que facilitan su buen funcionamiento. Dispensador para detergente en polvo y líquido: Cuenta con 2 compartimientos para disponer de estos productos por separado. Ciclos de lavado: Gran variedad de funciones que se ajustan a tus necesidades (Normal, Jeans, Mixto, Suave, Fuerte, Pesado, Rápido 15" y Klean+). Temporizador de encendido: Programa el inicio de lavado de tus prendas hasta en 24 horas. Bloqueo para niños: Bloquea todas las funciones, evitando que tus niños manipulen la lavadora. Limpieza de tambor (Klean+): Te permite conservar tu lavadora en excelente estado; eliminando las bacterias, olores y suciedad que se acumula en el interior. Diseño Magic Care Tube: Gracias al diseño del tambor logra una limpieza eficiente a través de diferentes movimientos, cuidando de tu ropa delicada y favorita. Filtro atrapa motas: Recolecta motas y/o pelusa durante el ciclo de lavado. Tapa con ventana en vidrio templado y sistema de suspensión: Ideal para poder visualizar el estado del ciclo de lavado. Cierre automático y paulatino. Tecnología FUZZY: Selecciona automáticamente el nivel de agua de acuerdo a la cantidad de ropa que se introduzca en la lavadora.	1905000.00	\N	1715000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.294996	2026-05-25 14:23:08.255534	{"Consumo": "y excelente rendimiento", "Sistema": "de suspensión: Ideal para poder visualizar el estado del ciclo de lavado", "Capacidad": "y tamaño reducido"}	[]	f	\N	\N
810	4	111	7	WB210113405	RM 248.3	Cortacesped mediana intensidad, 4T a gasolina, poten 2.8 hp, peso 30kg	Cortacesped mediana intensidad, 4T a gasolina, poten 2.8 hp	2255000.00	\N	1925000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.786058	2026-05-25 14:23:08.263042	{"Peso": "30kg"}	[]	f	\N	\N
887	2	113	34	10007772183 LLR15-A31	Cabina Elite 15 Pulgadas Bi-Amplificada Clase H	Elegancia y potencia se fusionan en la serie Elite LLR15-A31. Este equipo bi-amplificado representa la máxima organización técnica, separando el procesamiento de bajos y agudos para una fidelidad inigualable. Su acabado profesional y múltiples puertos de conexión lo convierten en el elemento organizador de su estudio o sala de juntas, permitiendo integrar micrófonos, instrumentos y dispositivos digitales con facilidad. Experimente un rango dinámico completo en un gabinete diseñado para durar y d	Elegancia y potencia se fusionan en la serie Elite LLR15-A31. Este equipo bi-amplificado representa la máxima organización técnica, separando el procesamiento de bajos y agudos para una fidelidad inigualable. Su acabado profesional y múltiples puertos de conexión lo convierten en el elemento organizador de su estudio o sala de juntas, permitiendo integrar micrófonos, instrumentos y dispositivos digitales con facilidad. Experimente un rango dinámico completo en un gabinete diseñado para durar y destacar estéticamente.	2665000.00	\N	2360000.00	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-16 13:23:41.929079	2026-05-25 14:53:20.866936	{"Potencia": "se fusionan en la serie Elite LLR15-A31"}	[]	f	\N	\N
369	1	95	30	COLCH-N-ORTOPEDICO-DUAL-O-CLASIC-FOAM-14	Colchón Ortopedico Dual O Clasic Foam 140x190	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	1130000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.399827	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
370	1	95	30	COLCH-N-ORTOPEDICO-DUAL-O-CLASIC-FOAM-16	Colchón Ortopedico Dual O Clasic Foam 160x190	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	1190000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.408456	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
371	1	95	30	COLCH-N-ORTOPEDICO-DUAL-O-CLASIC-FOAM-20	Colchón Ortopedico Dual O Clasic Foam 200x200	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	1775000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.416157	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
372	1	95	30	COLCH-N-ORTOPEDICO-ESTANDAR-100X190	Colchón Ortopedico Estandar 100x190	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	1045000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.425263	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
373	1	95	30	COLCH-N-ORTOPEDICO-ESTANDAR-120X190	Colchón Ortopedico Estandar 120x190	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	1125000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.434966	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
374	1	95	30	COLCH-N-ORTOPEDICO-ESTANDAR-130X190	Colchón Ortopedico Estandar 130x190	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	1240000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.444822	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
375	1	95	30	COLCH-N-ORTOPEDICO-ESTANDAR-140X190	Colchón Ortopedico Estandar 140x190	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	1240000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.453218	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
519	1	102	14	POWER	VENTILADOR SAMURAI TURBO POWER DE PARED NEGRO	¡El ventilador que tu habitación necesita! Si te encanta dormir con frescura y descansar al máximo, nuestro Ventilador de Pared SAMURAI Turbo Power es perfecto para ti. Este ventilador, gracias a su fácil acople en la pared, no ocupará espacio y te permitirá refrescarte al máximo. Sus 3 velocidades son ideales para que lo uses según tus necesidades y cuenta con un sistema de oscilación horizontal automática para que cubra toda tu habitación. Su malla frontal removible permite una fácil limpieza.	¡El ventilador que tu habitación necesita! Si te encanta dormir con frescura y descansar al máximo, nuestro Ventilador de Pared SAMURAI Turbo Power es perfecto para ti. Este ventilador, gracias a su fácil acople en la pared, no ocupará espacio y te permitirá refrescarte al máximo. Sus 3 velocidades son ideales para que lo uses según tus necesidades y cuenta con un sistema de oscilación horizontal automática para que cubra toda tu habitación. Su malla frontal removible permite una fácil limpieza. Cuenta con una garantía de 2 años y el respaldo ¡Adquiere el tuyo aquí! ¡MAYOR DESEMPEÑO, POTENTE Y DURABLE! VENTILADOR DE PARED SAMURAI TURBO POWER NEGRO: El ventilador Turbo Power de Samurai, es súper potente y más silencioso que otros ventiladores Samurai. Disfrútalo en casa en todos los momentos del día y descúbre una verdadera sensación de frescura. Cuenta con una	200000.00	\N	180000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.412766	2026-05-25 14:49:40.814779	{"Aspas": "y motor turbo", "Garantía": "de 2 años y el respaldo Mejor combinación de mallas"}	[]	f	placeholder	2026-05-25 14:49:40.814779
394	1	86	5	65UA8050	Televisor LG 65" UHD AI 4K Smart TV 2025 – Incluye Magic Remote AI	Lleva el cine a tu sala con la pantalla de 65 pulgadas del LG UHD 2025. Su potente Procesador α7 AI 4K Gen8 garantiza imágenes vibrantes y una fluidez excepcional para gaming gracias al VRR y ALLM. Con webOS 25, tendrás acceso a tus apps favoritas y un control inteligente total sobre tu hogar.	Lleva el cine a tu sala con la pantalla de 65 pulgadas del LG UHD 2025. Su potente Procesador α7 AI 4K Gen8 garantiza imágenes vibrantes y una fluidez excepcional para gaming gracias al VRR y ALLM. Con webOS 25, tendrás acceso a tus apps favoritas y un control inteligente total sobre tu hogar.	2970000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.233585	2026-05-25 14:23:08.237789	{"Pantalla": "de 65 pulgadas del LG UHD 2025"}	[]	f	\N	\N
937	3	129	33	VIVA R STYLE EIII	Suzuki Viva R Style EIII	Versión estilizada de la Viva R con freno de disco delantero y acabados premium para el uso diario.	Versión estilizada de la Viva R con freno de disco delantero y acabados premium para el uso diario.	8790000.00	\N	8590000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.321933	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
518	1	102	14	MAXX	VENTILADOR SAMURAI AIR MAXX BLANCO ASPA AZUL 16 P 4703	Disfruta de la frescura que te ofrece el ventilador SAMURAI Air Maxx. Este dispositivo cuenta con tres velocidades y un rendimiento excepcional, lo cual lo convierte en una opción perfecta para cualquier ocasión. Además, está equipado con mallas de seguridad que impiden el contacto con la hélice y su base de suelo proporciona una gran estabilidad. Sus componentes están fabricados en plástico, lo que garantiza una mayor durabilidad, evita la corrosión y facilita su mantenimiento y limpieza. Pote	Disfruta de la frescura que te ofrece el ventilador SAMURAI Air Maxx. Este dispositivo cuenta con tres velocidades y un rendimiento excepcional, lo cual lo convierte en una opción perfecta para cualquier ocasión. Además, está equipado con mallas de seguridad que impiden el contacto con la hélice y su base de suelo proporciona una gran estabilidad. Sus componentes están fabricados en plástico, lo que garantiza una mayor durabilidad, evita la corrosión y facilita su mantenimiento y limpieza	180000.00	\N	165000.00	\N	\N	10	5	12	\N	f	t	6	0	0.00	0	2026-01-15 18:39:24.391859	2026-05-25 15:09:07.851378	{"Potencia": "40 W Garantía: 24 meses Aspas: 4 Malla Plásticas"}	[]	f	placeholder	2026-05-25 14:49:40.702588
402	1	87	5	RNC-9	Torre de sonido LG XBOOM RNC9 - Karaoke Star - DJ APP	El titán de la línea XBOOM. La RNC9 es la torre de sonido más alta y potente, diseñada para grandes eventos. Con una altura de más de un metro, ofrece una presión sonora masiva sin distorsión. Incluye todas las funciones de karaoke, efectos DJ y una conectividad completa incluyendo puerto óptico y múltiples entradas USB.	El titán de la línea XBOOM. La RNC9 es la torre de sonido más alta y potente, diseñada para grandes eventos. Con una altura de más de un metro, ofrece una presión sonora masiva sin distorsión. Incluye todas las funciones de karaoke, efectos DJ y una conectividad completa incluyendo puerto óptico y múltiples entradas USB.	1330000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.43405	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
413	1	5	5	MS2032GAS	Horno Microondas LG 20L Negro SlimNeoChef™ EasyClean™	Horno Microondas LG Neo Chef, ofrece una cocción más rápida y descongela los alimentos de manera uniforme. Limpia el interior del horno fácilmente eliminando bacterias con la tecnología EasyClean sin necesidad de químicos abrasivos. Su plato giratorio de mayor estabilidad evita derrames, permitiéndote realizar preparaciones increíbles más allá de simplemente calentar.	Horno Microondas LG Neo Chef, ofrece una cocción más rápida y descongela los alimentos de manera uniforme. Limpia el interior del horno fácilmente eliminando bacterias con la tecnología EasyClean sin necesidad de químicos abrasivos. Su plato giratorio de mayor estabilidad evita derrames, permitiéndote realizar preparaciones increíbles más allá de simplemente calentar.	410000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.720295	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
415	1	92	5	GS51BPP	Nevecon LG Side by Side 519L Plata Disp. agua Multi Air Flow	Nevecón LG tipo Side by Side con tecnología Multi Air Flow para una circulación de aire frío constante. Su pantalla táctil LED externa permite un control minimalista y cómodo de todas las funciones. Disfruta de la tranquilidad y el ahorro de energía con el Smart Inverter Compressor.	Nevecón LG tipo Side by Side con tecnología Multi Air Flow para una circulación de aire frío constante. Su pantalla táctil LED externa permite un control minimalista y cómodo de todas las funciones. Disfruta de la tranquilidad y el ahorro de energía con el Smart Inverter Compressor.	3665000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.75855	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
378	1	95	30	COLCH-N-SUPER-FLEX-PILLOW-2-120X190	Colchón Super Flex Pillow 2 120x190	Tela género o Jacquard de la mejor calidad, con tratamiento anti-ácaros y antibacterial. Suave y agradable al contacto con la piel. Lámina de espuma ultraflex. Bloque de espuma particle foam. Para personas que exigen firmeza y mayor confort. 20 cms de espesor aproximadamente.	Tela género o Jacquard de la mejor calidad, con tratamiento anti-ácaros y antibacterial. Suave y agradable al contacto con la piel. Lámina de espuma ultraflex. Bloque de espuma particle foam. Para personas que exigen firmeza y mayor confort. 20 cms de espesor aproximadamente.	2225000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.475031	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
807	4	110	7	49500114597	RE 125	Presión 95 Bar, 120 V, Peso 19,1Kg, dosificador detergente, manguera resistente	Presión 95 Bar, 120 V, Peso 19,1Kg, dosificador detergente, manguera resistente	1510000.00	\N	1290000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.715076	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
906	2	117	35	SALA-MONTREAL-3X2-MC	Sala Montreal 3x2 + Mesa de Centro	Clásica distribución 3+2. La Sala Montreal ofrece versatilidad para acomodar a todos tus invitados. Incluye cojinería decorativa y una mesa de centro a juego.	Clásica distribución 3+2. La Sala Montreal ofrece versatilidad para acomodar a todos tus invitados. Incluye cojinería decorativa y una mesa de centro a juego.	3255000.00	\N	2905000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.253303	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
917	2	121	36	CMB 3881	Cama 120X190 Kaia Miel / Blanco	Descanso y estilo en una sola pieza. La cama Kaia presenta una estructura minimalista en color miel con acentos blancos, ideal para habitaciones juveniles o de invitados que buscan un look fresco y acogedor.	Descanso y estilo en una sola pieza. La cama Kaia presenta una estructura minimalista en color miel con acentos blancos, ideal para habitaciones juveniles o de invitados que buscan un look fresco y acogedor.	870000.00	\N	770000.00	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-16 13:23:42.454372	2026-05-25 14:59:17.492152	{}	[]	f	\N	\N
939	3	96	33	GSX 125	Suzuki GSX 125	Poderosa máquina urbana diseñada para dominar la ciudad con una excelente relación de consumo y agilidad.	Poderosa máquina urbana diseñada para dominar la ciudad con una excelente relación de consumo y agilidad.	8185000.00	\N	7985000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.357142	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
482	3	96	1	CB-100-2026	CB 100 2026	La nueva CB100 de HONDA está SIEMPRE FIRME con la Calidad, con tu Bolsillo, Seguridad, Tiempo y tu Futuro. En ella encontrarás todo lo que buscas en una moto para transportarte y trabajar gracias al respaldo y confianza de Honda Motos, la marca #1 de motos en el mundo.	Explora las características únicas de la CB 100, la moto de bajo cilindraje diseñada para trabajar. Economía, rendimiento y durabilidad en tu día a día.	5900000.00	\N	5700000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 17:51:10.86315	2026-05-25 13:55:17.538863	{}	[]	f	honda-oficial	2026-05-25 13:55:17.538863
517	1	101	2	KN529"G	NEVECÓN GRIS KALLEY LADO A LADO 529 LITROS K-N529L2	Tecnología Inverter: Ahorra energía y ofrece un rendimiento superior. Mantiene una temperatura constante dentro del nevecón, lo que ayuda a preservar mejor los alimentos y mantener su frescura por más tiempo. Tecnología No Frost: Distribuye el aire frio de manera uniforme, evitando que se genere escarcha en el interior y ayudando a conservar las propiedades nutritivas de los alimentos. Fácil limpieza y mantenimiento gracias a su descongelamiento automático. Funciones: Súper congelamiento: Co	Tecnología Inverter: Ahorra energía y ofrece un rendimiento superior. Mantiene una temperatura constante dentro del nevecón, lo que ayuda a preservar mejor los alimentos y mantener su frescura por más tiempo. Tecnología No Frost: Distribuye el aire frio de manera uniforme, evitando que se genere escarcha en el interior y ayudando a conservar las propiedades nutritivas de los alimentos. Fácil limpieza y mantenimiento gracias a su descongelamiento automático. Funciones: Súper congelamiento: Congela rápidamente los alimentos sin perder sus propiedades nutritivas. Alarma de puerta abierta: Cuenta con sensor en las puertas que avisa cuando alguna de ellas queda abierta por largos periodos de tiempo. ECO: El nevecón trabaja con la configuración de	3790000.00	\N	3435000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.355558	2026-05-25 14:23:08.256428	{"Consumo": "de energía más baja", "Pantalla": "LED digital: Ajusta y visualiza la temperatura y modos de operacióon del nevecón"}	[]	f	\N	\N
769	4	42	7	11482000273	MS 172 40CM	Peso 3.9 Kg, potencia 1,74 Hp/1.3 Kw, tipo cadena 3/8"P, cilindrada 30.1 cm³	Peso 3.9 Kg, potencia 1,74 Hp/1.3 Kw, tipo cadena 3/8"P, cilindrada 30.1 cm³	1005000.00	\N	860000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.486487	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
888	2	114	34	LLJ22-152	Parlante Doble 15 Pulgadas con Doble Ventilador y EQ	Para los entornos más exigentes donde la música nunca se detiene, el LLJ22-152 ofrece una robustez sin igual. Este sistema doble cuenta con refrigeración forzada para garantizar un rendimiento estable durante horas, ideal para salones de eventos que requieren una organización impecable y un sonido contundente de 5000W. Su ecualizador gráfico integrado le permite moldear el sonido según la acústica de su mueble o habitación, asegurando que cada nota se proyecte con la máxima eficiencia espacial.	Para los entornos más exigentes donde la música nunca se detiene, el LLJ22-152 ofrece una robustez sin igual. Este sistema doble cuenta con refrigeración forzada para garantizar un rendimiento estable durante horas, ideal para salones de eventos que requieren una organización impecable y un sonido contundente de 5000W. Su ecualizador gráfico integrado le permite moldear el sonido según la acústica de su mueble o habitación, asegurando que cada nota se proyecte con la máxima eficiencia espacial.	2595000.00	\N	2295000.00	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-16 13:23:41.95462	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
913	2	119	36	AR 2X2	Archivador 2 Gavetas	Optimiza tu espacio de trabajo con este archivador funcional y compacto. Diseñado para mantener tus documentos organizados y protegidos, su estructura robusta garantiza durabilidad en entornos de oficina o estudio en casa.	Optimiza tu espacio de trabajo con este archivador funcional y compacto. Diseñado para mantener tus documentos organizados y protegidos, su estructura robusta garantiza durabilidad en entornos de oficina o estudio en casa.	375000.00	\N	335000.00	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-16 13:23:42.390718	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
891	2	116	35	MX-ST-100-190	Somier Tapizado 100 X 190	La base ideal para un descanso reparador en habitaciones individuales. Este somier tapizado combina una estética moderna con la resistencia necesaria para el uso cotidiano. Sus patas metálicas o de madera maciza proporcionan la altura perfecta, facilitando la limpieza del área inferior y aportando un toque de elegancia al dormitorio.	La base ideal para un descanso reparador en habitaciones individuales. Este somier tapizado combina una estética moderna con la resistencia necesaria para el uso cotidiano. Sus patas metálicas o de madera maciza proporcionan la altura perfecta, facilitando la limpieza del área inferior y aportando un toque de elegancia al dormitorio.	500000.00	\N	445000.00	\N	\N	10	5	12	\N	f	t	2	0	0.00	0	2026-01-16 13:23:42.010551	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
889	2	115	35	MX-SC-CLIC-CLAC	Sofá Cama Clic Clac	El equilibrio perfecto entre funcionalidad y diseño contemporáneo. Este sofá cama cuenta con un mecanismo de 3 posiciones que permite transformarlo de un elegante sofá de sala a una cómoda cama en segundos. Su tapizado en tela de alto tráfico asegura durabilidad, mientras que su estructura de madera inmunizada garantiza una base sólida para el descanso diario.	El equilibrio perfecto entre funcionalidad y diseño contemporáneo. Este sofá cama cuenta con un mecanismo de 3 posiciones que permite transformarlo de un elegante sofá de sala a una cómoda cama en segundos. Su tapizado en tela de alto tráfico asegura durabilidad, mientras que su estructura de madera inmunizada garantiza una base sólida para el descanso diario.	1115000.00	\N	995000.00	\N	\N	10	5	12	\N	f	t	3	0	0.00	0	2026-01-16 13:23:41.980023	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
890	2	115	35	MX-SC-MONTREAL	Sofá Cama Montreal	Eleve el estilo de su hogar con el Sofá Cama Montreal, una pieza de lujo diseñada para quienes no comprometen la sofisticación por la practicidad. Su sistema abatible premium ofrece una transición suave entre sus funciones, ideal para apartamentos modernos. Un mueble que captura miradas y brinda un confort inigualable.	Eleve el estilo de su hogar con el Sofá Cama Montreal, una pieza de lujo diseñada para quienes no comprometen la sofisticación por la practicidad. Su sistema abatible premium ofrece una transición suave entre sus funciones, ideal para apartamentos modernos. Un mueble que captura miradas y brinda un confort inigualable.	1560000.00	\N	1395000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:41.990308	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
912	2	26	35	COMEDOR-MOSCU-4P	Comedor Moscu 4 TS	Inspirado en el diseño clásico renovado, el Comedor Moscú ofrece robustez y una estética impecable que se adapta a cualquier estilo de decoración.	Inspirado en el diseño clásico renovado, el Comedor Moscú ofrece robustez y una estética impecable que se adapta a cualquier estilo de decoración.	2630000.00	\N	2350000.00	\N	\N	10	5	12	\N	f	t	3	0	0.00	0	2026-01-16 13:23:42.373758	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
377	1	95	30	COLCH-N-SUPER-FLEX-PILLOW-2-100X190	Colchón Super Flex Pillow 2 100x190	Tela género o Jacquard de la mejor calidad, con tratamiento anti-ácaros y antibacterial. Suave y agradable al contacto con la piel. Lámina de espuma ultraflex. Bloque de espuma particle foam. Para personas que exigen firmeza y mayor confort. 20 cms de espesor aproximadamente.	Tela género o Jacquard de la mejor calidad, con tratamiento anti-ácaros y antibacterial. Suave y agradable al contacto con la piel. Lámina de espuma ultraflex. Bloque de espuma particle foam. Para personas que exigen firmeza y mayor confort. 20 cms de espesor aproximadamente.	1885000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.467914	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
935	3	127	33	GN 125 ABS	Suzuki GN 125 ABS	La clásica GN 125 ahora con seguridad mejorada mediante un sistema de frenos ABS monocanal delantero y rines de aspas.	La clásica GN 125 ahora con seguridad mejorada mediante un sistema de frenos ABS monocanal delantero y rines de aspas.	7599000.00	\N	7399000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.287602	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
507	1	99	2	K-SC211L2	NEVERA VITRINA KALLEY FROST UNA PUERTA 211 LITROS	La vitrina de 211 litros K-SC211L3 de KALLEY es ideal para que guardes todos tus alimentos y bebidas, además, tiene gas refrigerante R600a, el cual cuida el medio ambiente. Gracias a su iluminación Led tendrás excelente visualización y su ventilación en la parte interior conserva mejor tus alimentos y bebidas. No esperes más y adquiérela ya.	La vitrina de 211 litros K-SC211L3 de KALLEY es ideal para que guardes todos tus alimentos y bebidas, además, tiene gas refrigerante R600a, el cual cuida el medio ambiente. Gracias a su iluminación Led tendrás excelente visualización y su ventilación en la parte interior conserva mejor tus alimentos y bebidas. No esperes más y adquiérela ya.	2085000.00	\N	1875000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.042524	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
376	1	95	30	COLCH-N-ORTOPEDICO-ESTANDAR-160X190	Colchón Ortopedico Estandar 160x190	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	1365000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.460755	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
379	1	95	30	COLCH-N-SUPER-FLEX-PILLOW-2-140X190	Colchón Super Flex Pillow 2 140x190	Tela género o Jacquard de la mejor calidad, con tratamiento anti-ácaros y antibacterial. Suave y agradable al contacto con la piel. Lámina de espuma ultraflex. Bloque de espuma particle foam. Para personas que exigen firmeza y mayor confort. 20 cms de espesor aproximadamente.	Tela género o Jacquard de la mejor calidad, con tratamiento anti-ácaros y antibacterial. Suave y agradable al contacto con la piel. Lámina de espuma ultraflex. Bloque de espuma particle foam. Para personas que exigen firmeza y mayor confort. 20 cms de espesor aproximadamente.	2510000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.483363	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
380	1	95	30	COLCH-N-SUPER-FLEX-PILLOW-2-160X190	Colchón Super Flex Pillow 2 160x190	Tela género o Jacquard de la mejor calidad, con tratamiento anti-ácaros y antibacterial. Suave y agradable al contacto con la piel. Lámina de espuma ultraflex. Bloque de espuma particle foam. Para personas que exigen firmeza y mayor confort. 20 cms de espesor aproximadamente.	Tela género o Jacquard de la mejor calidad, con tratamiento anti-ácaros y antibacterial. Suave y agradable al contacto con la piel. Lámina de espuma ultraflex. Bloque de espuma particle foam. Para personas que exigen firmeza y mayor confort. 20 cms de espesor aproximadamente.	2805000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.48998	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
936	3	129	33	VIVA R COOL EIII	Suzuki Viva R Cool EIII	Motocicleta semiautomática económica y liviana, diseñada para una movilidad urbana ágil sin necesidad de embrague manual.	Motocicleta semiautomática económica y liviana, diseñada para una movilidad urbana ágil sin necesidad de embrague manual.	7600000.00	\N	7400000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.306091	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
381	1	95	30	COLCH-N-SUPER-FLEX-PILLOW-2-200X200	Colchón Super Flex Pillow 2 200x200	Tela género o Jacquard de la mejor calidad, con tratamiento anti-ácaros y antibacterial. Suave y agradable al contacto con la piel. Lámina de espuma ultraflex. Bloque de espuma particle foam. Para personas que exigen firmeza y mayor confort. 20 cms de espesor aproximadamente.	Tela género o Jacquard de la mejor calidad, con tratamiento anti-ácaros y antibacterial. Suave y agradable al contacto con la piel. Lámina de espuma ultraflex. Bloque de espuma particle foam. Para personas que exigen firmeza y mayor confort. 20 cms de espesor aproximadamente.	3875000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.497154	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
382	1	95	30	COLCH-N-TITANIUM-SPECIAL-140X190	Colchón Titanium Special 140x190	Tela Jaquard de la mejor calidad con tratamiento anti-ácaros y antibacterial. Suave y agradable al ontacto con la piel. Lámina Espuma paticle foam. Panal de resortes pocket system que permiten un soporte independiente para cada zona del cuerpo.	Tela Jaquard de la mejor calidad con tratamiento anti-ácaros y antibacterial. Suave y agradable al ontacto con la piel. Lámina Espuma paticle foam. Panal de resortes pocket system que permiten un soporte independiente para cada zona del cuerpo.	4145000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.504747	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
383	1	95	30	COLCH-N-TITANIUM-SPECIAL-160X190	Colchón Titanium Special 160x190	Tela Jaquard de la mejor calidad con tratamiento anti-ácaros y antibacterial. Suave y agradable al ontacto con la piel. Lámina Espuma paticle foam. Panal de resortes pocket system que permiten un soporte independiente para cada zona del cuerpo.	Tela Jaquard de la mejor calidad con tratamiento anti-ácaros y antibacterial. Suave y agradable al ontacto con la piel. Lámina Espuma paticle foam. Panal de resortes pocket system que permiten un soporte independiente para cada zona del cuerpo.	4655000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.512527	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
384	1	95	30	COLCH-N-TITANIUM-SPECIAL-200X200	Colchón Titanium Special 200x200	Tela Jaquard de la mejor calidad con tratamiento anti-ácaros y antibacterial. Suave y agradable al ontacto con la piel. Lámina Espuma paticle foam. Panal de resortes pocket system que permiten un soporte independiente para cada zona del cuerpo.	Tela Jaquard de la mejor calidad con tratamiento anti-ácaros y antibacterial. Suave y agradable al ontacto con la piel. Lámina Espuma paticle foam. Panal de resortes pocket system que permiten un soporte independiente para cada zona del cuerpo.	5755000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.51923	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
386	1	95	30	COLCH-N-GOLD-PILLOW-140X190	Colchón Gold Pillow 140x190	Resortes Bonnell protege el colchón y mantiene cada componente en su lugar, logrando gran estabilidad y haciéndolo más perdurable. Cuenta con tres soportes internos en el centro que no solo cuidan la zona lumbar, sino que también evita deformaciones tempranas del producto.	Resortes Bonnell protege el colchón y mantiene cada componente en su lugar, logrando gran estabilidad y haciéndolo más perdurable. Cuenta con tres soportes internos en el centro que no solo cuidan la zona lumbar, sino que también evita deformaciones tempranas del producto.	3665000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.538759	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
387	1	95	30	COLCH-N-GOLD-PILLOW-160X190	Colchón Gold Pillow 160x190	Resortes Bonnell protege el colchón y mantiene cada componente en su lugar, logrando gran estabilidad y haciéndolo más perdurable. Cuenta con tres soportes internos en el centro que no solo cuidan la zona lumbar, sino que también evita deformaciones tempranas del producto.	Resortes Bonnell protege el colchón y mantiene cada componente en su lugar, logrando gran estabilidad y haciéndolo más perdurable. Cuenta con tres soportes internos en el centro que no solo cuidan la zona lumbar, sino que también evita deformaciones tempranas del producto.	3910000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.548623	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
389	1	86	5	32LR600	Televisor LG 32" HD AI Smart TV - LR600	Nuevo LG HD AI de 32” + de 160 canales gratis, Con inteligencia artificial que reconoce quién lo usa, recomienda contenido, ajusta imagen y sonido automáticamente y responde a tu voz. Un TV compacto y funcional, perfecto para habitaciones pequeñas sin renunciar a la calidad LG.	Nuevo LG HD AI de 32” + de 160 canales gratis, Con inteligencia artificial que reconoce quién lo usa, recomienda contenido, ajusta imagen y sonido automáticamente y responde a tu voz. Un TV compacto y funcional, perfecto para habitaciones pequeñas sin renunciar a la calidad LG.	765000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.913528	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
390	1	86	5	43LM6370	Televisor LG 43'' Full HD - 43LM6370PDB	Disfruta tu TV FHD de 43 pulgadas con inteligencia artificial. Obtén imágenes precisas y colores vivos que harán que tus contenidos favoritos sean más realistas y vibrantes. Equipado con Dolby Audio, este TV te sumerge en una experiencia de sonido realista y multidimensional gracias a sus altavoces integrados que emiten sonido en todas direcciones.	Disfruta tu TV FHD de 43 pulgadas con inteligencia artificial. Obtén imágenes precisas y colores vivos que harán que tus contenidos favoritos sean más realistas y vibrantes. Equipado con Dolby Audio, este TV te sumerge en una experiencia de sonido realista y multidimensional gracias a sus altavoces integrados que emiten sonido en todas direcciones.	1330000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.00713	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
392	1	86	5	55UA8050	Televisor LG 55" UHD AI 4K Smart TV 2025 – Incluye Magic Remote AI	Experimenta la nueva era del entretenimiento con el LG UHD 2025 de 55 pulgadas. Equipado con el Procesador α7 AI 4K Gen8, este televisor optimiza cada escena para una claridad excepcional. Disfruta de una experiencia sonora cinematográfica con AI Sound Pro de 9.1.2 canales virtuales y accede a un mundo de posibilidades con webOS 25 y el Magic Remote incluido.	Experimenta la nueva era del entretenimiento con el LG UHD 2025 de 55 pulgadas. Equipado con el Procesador α7 AI 4K Gen8, este televisor optimiza cada escena para una claridad excepcional. Disfruta de una experiencia sonora cinematográfica con AI Sound Pro de 9.1.2 canales virtuales y accede a un mundo de posibilidades con webOS 25 y el Magic Remote incluido.	2305000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.137307	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
393	1	86	5	55NANO80T	Televisor LG 55'' NanoCell 4K - 55NANO80TSA	Disfruta de como las imágenes cobran vida con los colores puros de LG Nanocell con tu TV de 55 pulgadas. Imágenes más nítidas y reales dando mayor claridad a la imagen para vivir una experiencia visual inolvidable. Con su procesador de IA logras obtener todo un entorno inmersivo que se adapta a tu forma de mirar tu serie, película o contenido favorito.	Disfruta de como las imágenes cobran vida con los colores puros de LG Nanocell con tu TV de 55 pulgadas. Imágenes más nítidas y reales dando mayor claridad a la imagen para vivir una experiencia visual inolvidable. Con su procesador de IA logras obtener todo un entorno inmersivo que se adapta a tu forma de mirar tu serie, película o contenido favorito.	2560000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.198618	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
398	1	86	5	86UA8050	Televisor LG 86" UHD AI 4K Smart TV 2025 – Incluye Magic Remote AI	El gigante de la familia LG UHD (2025). Con una asombrosa diagonal de 86 pulgadas, este televisor convierte cualquier espacio en un auditorio privado. Con inteligencia artificial avanzada para el procesamiento de imagen y sonido, webOS 25 y el Magic Remote MR25, disfrutarás de la tecnología más vanguardista en el tamaño más impactante.	El gigante de la familia LG UHD (2025). Con una asombrosa diagonal de 86 pulgadas, este televisor convierte cualquier espacio en un auditorio privado. Con inteligencia artificial avanzada para el procesamiento de imagen y sonido, webOS 25 y el Magic Remote MR25, disfrutarás de la tecnología más vanguardista en el tamaño más impactante.	6180000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.308525	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
399	1	86	5	86NANO80T	Televisor LG 86'' NanoCell 4K - 86NANO80TSA	Disfruta de como las imágenes cobran vida con los colores puros de LG Nanocell con tu TV de 86 pulgadas. Imágenes más nítidas y reales dando mayor claridad a la imagen para vivir una experiencia visual inolvidable. Con su procesador de IA logras obtener todo un entorno inmersivo que se adapta a tu forma de mirar tu serie, película o contenido favorito.	Disfruta de como las imágenes cobran vida con los colores puros de LG Nanocell con tu TV de 86 pulgadas. Imágenes más nítidas y reales dando mayor claridad a la imagen para vivir una experiencia visual inolvidable. Con su procesador de IA logras obtener todo un entorno inmersivo que se adapta a tu forma de mirar tu serie, película o contenido favorito.	6750000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.33308	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
403	1	88	5	GRAB.ACOLL	Parlante LG xboom Grab - Portabilidad y Resistencia Total - Sonido IA	Lleva el ritmo a cualquier terreno con el LG XBOOM Grab. Diseñado con una ergonomía ultra resistente y certificación IP67, es a prueba de agua y polvo, ideal para exteriores. No dejes que su tamaño te engañe: sus 30W de potencia y 20 horas de autonomía, respaldados por IA Sound, aseguran una claridad impecable en cada aventura.	Lleva el ritmo a cualquier terreno con el LG XBOOM Grab. Diseñado con una ergonomía ultra resistente y certificación IP67, es a prueba de agua y polvo, ideal para exteriores. No dejes que su tamaño te engañe: sus 30W de potencia y 20 horas de autonomía, respaldados por IA Sound, aseguran una claridad impecable en cada aventura.	450000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.450235	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
406	1	89	5	WT13BPB	Lavadora LG Carga Superior 13Kg Negro TurboDrum™ Punch+3	Lavadora LG Carga Superior 13 Kg, Con la tecnología de Motor Smart Inverter proporciona un lavado silencioso y potente reduciendo las vibraciones. TurboDrum™ permite un lavado más poderoso y remueve hasta la mancha más difícil. Su diseño delgado ofrece mayor comodidad y eficacia.	Lavadora LG Carga Superior 13 Kg, Con la tecnología de Motor Smart Inverter proporciona un lavado silencioso y potente reduciendo las vibraciones. TurboDrum™ permite un lavado más poderoso y remueve hasta la mancha más difícil. Su diseño delgado ofrece mayor comodidad y eficacia.	1670000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.572546	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
408	1	89	5	WT23EGT	Lavadora LG Carga Superior 23Kg Gris Grafito AIDD EasyUnload	Lavadora LG de carga superior con inteligencia artificial AI DD™, que cuida tus prendas con la máxima delicadeza. Gracias a TurboWash™, lava rápidamente ahorrando tiempo. Con EasyUnload™, sacar la ropa es más cómodo gracias a su diseño ergonómico e inclinado. Control total desde tu celular con LG ThinQ™.	Lavadora LG de carga superior con inteligencia artificial AI DD™, que cuida tus prendas con la máxima delicadeza. Gracias a TurboWash™, lava rápidamente ahorrando tiempo. Con EasyUnload™, sacar la ropa es más cómodo gracias a su diseño ergonómico e inclinado. Control total desde tu celular con LG ThinQ™.	2400000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.615086	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
900	2	117	35	SALA-L-VERONA-MC	Sala L Verona + Mesa de Centro	La Sala Verona es sinónimo de sofisticación europea. Con detalles de capitoneado sutil y patas de madera sólida, es el equilibrio ideal entre durabilidad y tendencia decorativa.	La Sala Verona es sinónimo de sofisticación europea. Con detalles de capitoneado sutil y patas de madera sólida, es el equilibrio ideal entre durabilidad y tendencia decorativa.	2330000.00	\N	2080000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.127381	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
400	1	87	5	RNC-5	Torre de sonido LG XBOOM RNC5 - Karaoke Star - DJ APP	Sumérgete en un mundo de sonido envolvente con la torre de sonido LG RNC5. Diseñada para ofrecer una experiencia auditiva excepcional, esta torre combina potencia y claridad para llenar tu espacio con música vibrante. Incluye luces LED de colores que cambian al ritmo de la música y funciones de DJ profesionales vía App.	Sumérgete en un mundo de sonido envolvente con la torre de sonido LG RNC5. Diseñada para ofrecer una experiencia auditiva excepcional, esta torre combina	925000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.388694	2026-05-25 14:23:08.244949	{"Potencia": "y claridad para llenar tu espacio con música vibrante"}	[]	f	\N	\N
401	1	87	5	RNC-7	Torre de sonido LG XBOOM RNC7 - Karaoke Star - DJ APP	La LG RNC7 eleva la potencia con mayor fidelidad. Esta torre integra Dolby Audio y conexión óptica para una integración perfecta con tu TV. Sus luces estroboscópicas y efectos de DJ desde la App XBOOM garantizan que tu fiesta sea inolvidable, con el respaldo de un diseño robusto y manijas de transporte.	La LG RNC7 eleva la potencia con mayor fidelidad. Esta torre integra Dolby Audio y conexión óptica para una integración perfecta con tu TV. Sus luces estroboscópicas y efectos de DJ desde la App XBOOM garantizan que tu fiesta sea inolvidable, con el respaldo de un diseño robusto y manijas de transporte.	1180000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.41902	2026-05-25 14:23:08.245501	{"Potencia": "con mayor fidelidad"}	[]	f	\N	\N
407	1	89	5	WT19MVTB	Lavadora LG Carga Superior 19Kg Negro TurboDrum™ Silencioso	Lavadora LG Carga Superior 19 Kg color Negro Medio. El motor Smart Inverter garantiza un lavado silencioso mientras que los tres movimientos Smart Motion cuidan tus prendas adaptándose a cada tejido. Diseño elegante con puerta de cerrado suave.	Lavadora LG Carga Superior 19 Kg color Negro Medio. El motor Smart Inverter garantiza un lavado silencioso mientras que los tres movimientos Smart Motion cuidan tus prendas adaptándose a cada tejido. Diseño elegante con puerta de cerrado suave.	1985000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.588016	2026-05-25 14:23:08.246951	{"Color": "Negro Medio"}	[]	f	\N	\N
409	1	89	5	WT25MT6HK	Lavadora LG Carga Superior 25Kg Negro 6 Motion™ TurboWash3D™	Máxima capacidad de 25 Kg con tecnología 6 Motion Direct Drive que mueve la tina en 6 direcciones diferentes. TurboWash3D™ y JetSpray ofrecen un lavado profundo y rápido, mientras que Smart Diagnosis soluciona problemas de forma sencilla.	Máxima capacidad de 25 Kg con tecnología 6 Motion Direct Drive que mueve la tina en 6 direcciones diferentes. TurboWash3D™ y JetSpray ofrecen un lavado profundo y rápido, mientras que Smart Diagnosis soluciona problemas de forma sencilla.	2715000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.639378	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
410	1	90	5	WD16EG2S6	Lavaseca LG 2 en 1 Carga Frontal 16Kg/8Kg Plata AIDD™	Lava y seca en un solo equipo. Con tecnología AIDD™ que protege tus fibras un 14.5% más y función Steam™ que elimina el 99.9% de alérgenos. Control inteligente con LG ThinQ™ y diseño elegante en color Silver.	Lava y seca en un solo equipo. Con tecnología AIDD™ que protege tus fibras un 14.5% más y función Steam™ que elimina el 99.9% de alérgenos. Control inteligente con LG ThinQ™ y diseño elegante en color Silver.	3710000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.654993	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
411	1	90	5	WD16EGN	Lavaseca 2 en 1 Carga Frontal LG 16kg Gris Grafito AI DD™ Pet Care	Lavaseca compacta con ciclo especializado Pet Care para eliminar olores y manchas de mascotas. Incluye IA DD para un cuidado superior de las telas y conectividad WiFi para gestión remota.	Lavaseca compacta con ciclo especializado Pet Care para eliminar olores y manchas de mascotas. Incluye IA DD para un cuidado superior de las telas y conectividad WiFi para gestión remota.	3795000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.671728	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
483	3	96	1	CB-125F-DLX-2026	CB 125F DLX 2026	Una motocicleta desarrollada para destacarse por su diseño superior, que ha demostrado su éxito con cerca de 40.000 unidades vendidas desde su lanzamiento en Diciembre de 2018. Su diseño, comodidad y respaldo de tecnología Honda la convierten en la mejor opción para salir a conquistar las calles.	Una motocicleta desarrollada para destacarse por su diseño superior, que ha demostrado su éxito con cerca de 40.000 unidades vendidas desde su lanzamiento en Diciembre de 2018. Su diseño, comodidad y respaldo de tecnología Honda la convierten en la mejor opción para salir a conquistar las calles.	7350000.00	\N	7150000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 17:51:10.956174	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
418	1	92	5	GS66GPY	Nevecon LG Side by Side 635L Plata Mate InstaView™ ThinQ™	Nevecon LG tipo Side by Side InstaView solo con un TocToc en la puerta de tu nevera puedes mirar el interior sin necesidad de abrirla evitando la perdida de aire frio dentro del refrigerador, mantén tus alimentos y bebidas siempre frescos y con la misma temperatura inclusive desde la puerta con la tecnología DoorCooling, LINEARCooling reduce las fluctuaciones de temperatura para una frescura en tus alimentos dando una sensación como del campo a la mesa, Monitorea o ajusta la temperatura de tu nevera desde un dispositivo móvil solo debes de descargar la App ThinQ. ¡Compra Ahora!	Nevecon LG tipo Side by Side InstaView solo con un TocToc en la puerta de tu nevera puedes mirar el interior sin necesidad de abrirla evitando la perdida de aire frio dentro del refrigerador, mantén tus alimentos y bebidas siempre frescos y con la misma temperatura inclusive desde la puerta con la tecnología DoorCooling, LINEARCooling reduce las fluctuaciones de temperatura para una frescura en tus alimentos dando una sensación como del campo a la mesa, Monitorea o ajusta la temperatura de tu nevera desde un dispositivo móvil solo debes de descargar la App ThinQ. ¡Compra Ahora!	7995000.00	\N	\N	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-15 16:37:13.815652	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
414	1	91	5	GB37SPV	Nevera LG Congelador Inferior 343L Negro Mate Disp. agua	Optimiza la frescura de tus alimentos con la nevera LG de 343 litros y congelador inferior. Gracias a Linear Door Cooling™ y Multi-Air Flow, la temperatura se mantiene constante en cada rincón. Su Compresor Smart Inverter ofrece 10 años de garantía, asegurando un funcionamiento silencioso y eficiente, mientras que el diseño Negro Mate y su dispensador de agua externo aportan elegancia y comodidad a tu cocina.	Optimiza la frescura de tus alimentos con la nevera LG de 343 litros y congelador inferior. Gracias a Linear Door Cooling™ y Multi-Air Flow, la temperatura se mantiene constante en cada rincón. Su Compresor Smart Inverter ofrece 10 años de garantía, asegurando un funcionamiento silencioso y eficiente, mientras que el diseño Negro Mate y su dispensador de agua externo aportan elegancia y comodidad a tu cocina.	3245000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.737836	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
523	1	102	14	SILEN	VENTILADOR SILENCE FORCE PLUS 2 EN 1 NEGRO SAMURAI	- Marca: Samurai\n- Motor potente, durable y silencioso\n- Malla frontal removible para fácil limpieza\n- Diseño práctico y sofisticado en color gris\n- Altura ajustable para mayor alcance de aire\n- Tres velocidades ajustables según necesidad\n- Sistema de inclinación vertical con botón lateral\n- Seis aspas aerodinámicas para mayor flujo de aire\n- Oscilación horizontal de 90° para mejor distribución	- Marca: Samurai\n- Motor potente, durable y silencioso\n- Malla frontal removible para fácil limpieza\n- Diseño práctico y sofisticado en color gris\n- Altura ajustable para mayor alcance de aire\n- Tres velocidades ajustables según necesidad\n- Sistema de inclinación vertical con botón lateral\n- Seis aspas aerodinámicas para mayor flujo de aire\n- Oscilación horizontal de 90° para mejor distribución	290000.00	\N	260000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.514487	2026-05-25 14:49:41.115307	{}	[]	f	placeholder	2026-05-25 14:49:41.115307
388	1	95	30	COLCH-N-GOLD-PILLOW-200X200	Colchón Gold Pillow 200x200	Resortes Bonnell protege el colchón y mantiene cada componente en su lugar, logrando gran estabilidad y haciéndolo más perdurable. Cuenta con tres soportes internos en el centro que no solo cuidan la zona lumbar, sino que también evita deformaciones tempranas del producto.	Resortes Bonnell protege el colchón y mantiene cada componente en su lugar, logrando gran estabilidad y haciéndolo más perdurable. Cuenta con tres soportes internos en el centro que no solo cuidan la zona lumbar, sino que también evita deformaciones tempranas del producto.	4770000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.556524	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
530	1	4	32	HYLED5812G	Televisor HYUNDAI 58" Smart Google TV 4K	Gracias a la tecnología HDR10, disfruta de imágenes más claras y realistas en cada escena. Sumérgete en el sonido envolvente Dolby Atmos, que hace que cada película, serie o juego sea más emocionante.	Gracias a la tecnología HDR10, disfruta de imágenes más claras y realistas en cada escena. Sumérgete en el sonido envolvente Dolby Atmos, que hace que cada película, serie o juego sea más emocionante.	1815000.00	\N	1645000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:54:02.634577	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
793	4	43	7	41512000043	FR 230	Peso de 7.3 Kg, potencia de 2.1 Hp/ 1.55 Kw, cilindrada en 40.2 cm³	Peso de 7.3 Kg, potencia de 2.1 Hp/ 1.55 Kw, cilindrada en 40.2 cm³	1400000.00	\N	1195000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.321325	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
804	4	45	7	4237.011.2940	HS 82 R	Cilindr 27,2 cm³,poten0,94 Kw,corte 60cms, peso5,5kg, Dist de dientes 38 mm.	Cilindr 27,2 cm³,poten0,94 Kw,corte 60cms, peso5,5kg, Dist de dientes 38 mm.	3175000.00	\N	2710000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.599717	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
794	4	43	7	41512000032	FR 235	Peso11Kg,Potencia 2,07Hp/1,55Kw,cilindrada36.3 cm³,guaya flexible	Peso11Kg,Potencia 2,07Hp/1,55Kw,cilindrada36.3 cm³,guaya flexible	2420000.00	\N	2065000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.350366	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
795	4	47	7	42550194972	SG 71	Mochila, intensidad media, presion rociado 6 bar, caudal 1.4 L/min, capacidad 18L.	Mochila, intensidad media, presion rociado 6 bar, caudal 1.4 L/min, capacidad 18L.	510000.00	\N	440000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.387384	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
796	4	47	7	42410112604	SR 200	Poten1.07 Hp/0.8Kw,Peso7,9 Kg,cilindrada27.2 cm³, capacidad10 Lt, Alcance 9 mts.	Poten1.07 Hp/0.8Kw,Peso7,9 Kg,cilindrada27.2 cm³, capacidad10 Lt, Alcance 9 mts.	2425000.00	\N	2070000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.402234	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
797	4	47	7	42030112619	SR 420	Potencia2.6 Kw/ 3,49 Kw, Peso11.1Kg, Caudal aire 1260 m³/h, cilindrada 56.5 cm³.	Potencia2.6 Kw/ 3,49 Kw, Peso11.1Kg, Caudal aire 1260 m³/h, cilindrada 56.5 cm³.	2700000.00	\N	2305000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.428887	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
798	4	47	7	42440112624	SR 430	Potencia3.35 Hp/ 2.5 Kw, Peso11Kg, Caudal aire 1060 m³/h, cilindrada 63.3 cm³.	Potencia3.35 Hp/ 2.5 Kw, Peso11Kg, Caudal aire 1060 m³/h, cilindrada 63.3 cm³.	2765000.00	\N	2360000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.456576	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
799	4	47	7	42440112630	SR 440	Poten3.9 Kw,vuelo aire90 m/s,cabida deposito14L, almace 14,5 m, peso12,2 Kg.	Poten3.9 Kw,vuelo aire90 m/s,cabida deposito14L, almace 14,5 m, peso12,2 Kg.	2930000.00	\N	2500000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.478161	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
800	4	47	7	42440112663	SR 450	Almace 14.5 m,peso12.5 Kg,Potencia3.9 Hp/ 2.9 Kw, capacidad14L, cilin 63.3 cm³	Almace 14.5 m,peso12.5 Kg,Potencia3.9 Hp/ 2.9 Kw, capacidad14L, cilin 63.3 cm³	3110000.00	\N	2655000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.509626	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
801	4	109	7	SE010124410	SE33	Aspiradora de liquidos y solidos, Potencia máx.1.400, Peso kg 5,4	Aspiradora de liquidos y solidos, Potencia máx.1.400, Peso kg 5,4	595000.00	\N	510000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.526438	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
803	4	45	7	42280112938	HS 45	Cilindrada 27,2 cm³,diametro piston34 mm,carrera de piston 30 mm, pote 0,75 Kw.	Cilindrada 27,2 cm³,diametro piston34 mm,carrera de piston 30 mm, pote 0,75 Kw.	1360000.00	\N	1160000.00	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-15 22:02:35.564407	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
805	4	110	7	RE020114552	RE 80X	Presión1450PSI,Poten Mt1.5kW,dosificador deterg, manguera alta resistencia	Presión1450PSI,Poten Mt1.5kW,dosificador deterg, manguera alta resistencia	700000.00	\N	595000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.625699	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
806	4	110	7	49500124526	RE 110	Presión1450PSI,Poten Mt1.4 kW,dosificador detergente,manguera alta resistencia.	Presión1450PSI,Poten Mt1.4 kW,dosificador detergente,manguera alta resistencia.	1455000.00	\N	1245000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.661856	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
391	1	86	5	50UA8050	Televisor LG 50" UHD AI 4K Smart TV 2025 – Incluye Magic Remote AI	Eleva tu entretenimiento con el nuevo LG UHD 2025 de 50 pulgadas. Gracias a su Procesador α7 AI 4K Gen8, experimentarás una claridad asombrosa y un sonido envolvente virtual de 9.1.2 canales. Diseñado para el futuro, integra webOS 25, control Magic Remote con IA y funciones avanzadas para gaming como VRR y ALLM, ofreciendo una experiencia cinematográfica y de juego fluida en resolución 4K Ultra HD.	Eleva tu entretenimiento con el nuevo LG UHD 2025 de 50 pulgadas. Gracias a su Procesador α7 AI 4K Gen8, experimentarás una claridad asombrosa y un sonido envolvente virtual de 9.1.2 canales. Diseñado para el futuro, integra webOS 25, control Magic Remote con IA y funciones avanzadas para gaming como VRR y ALLM, ofreciendo una experiencia cinematográfica y de juego fluida en resolución 4K Ultra HD.	2050000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.071252	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
397	1	86	5	75NANO80T	Televisor LG 75'' NanoCell 4K - 75NANO80TSA	La máxima expresión de los colores puros en un formato de 75 pulgadas. Con tecnología NanoCell, este televisor filtra las impurezas de los colores para entregar imágenes nítidas y vibrantes. Su procesador α5 IA Gen7 optimiza el escalado a 4K, haciendo que incluso el contenido antiguo luzca increíble en gran formato.	La máxima expresión de los colores puros en un formato de 75 pulgadas. Con tecnología NanoCell, este televisor filtra las impurezas de los colores para entregar imágenes nítidas y vibrantes. Su procesador α5 IA Gen7 optimiza el escalado a 4K, haciendo que incluso el contenido antiguo luzca increíble en gran formato.	4095000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.294682	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
901	2	117	35	SALA-L-ITALIANA-JR-MC	Sala L Italiana JR + Mesa de Centro	Diseño compacto pero lujoso. La Italiana Junior está pensada para apartamentos modernos que no quieren sacrificar el estilo por el espacio. Textura suave al tacto y gran soporte lumbar.	Diseño compacto pero lujoso. La Italiana Junior está pensada para apartamentos modernos que no quieren sacrificar el estilo por el espacio. Textura suave al tacto y gran soporte lumbar.	2630000.00	\N	2135000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.149998	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
404	1	88	5	BOUNCE.ACO	LG xboom Bounce - Sonido IA y Resistencia Militar - 30H de Música	Lleva la fiesta a cualquier lugar sin límites con el LG XBOOM Bounce. Diseñado para los más aventureros, este parlante ofrece un sonido potente y claro incluso al aire libre gracias a su configuración de 2.1 canales. Su estructura ultra resistente no solo soporta agua y polvo con certificación IP67, sino que está fabricado para resistir golpes, garantizando que el ritmo no se detenga. Con una batería líder en su clase de hasta 30 horas, es el compañero definitivo para viajes largos y experiencias extremas.	Lleva la fiesta a cualquier lugar sin límites con el LG XBOOM Bounce. Diseñado para los más aventureros, este parlante ofrece un sonido potente y claro incluso al aire libre gracias a su configuración de 2.1 canales. Su estructura ultra resistente no solo soporta agua y polvo con certificación IP67, sino que está fabricado para resistir golpes, garantizando que el ritmo no se detenga. Con una batería líder en su clase de hasta 30 horas, es el compañero definitivo para viajes largos y experiencias extremas.	675000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.48527	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
417	1	92	5	LM22SGP	Nevecon LG French Door 618L Plata Disp. de agua	El Nevecón French Door de 618 litros redefine el espacio en tu cocina. Su diseño de 3 puertas permite una organización superior con estantes voladizos híbridos y una amplia despensa. Equipado con fábrica de hielos automática instalada y dispensador de agua externo con filtro LT1000P. Su acabado en Acero Inoxidable y el Compresor Smart Inverter garantizan durabilidad y un rendimiento premium para los hogares más exigentes.	El Nevecón French Door de 618 litros redefine el espacio en tu cocina. Su diseño de 3 puertas permite una organización superior con estantes voladizos híbridos y una amplia despensa. Equipado con fábrica de hielos automática instalada y dispensador de agua externo con filtro LT1000P. Su acabado en Acero Inoxidable y el Compresor Smart Inverter garantizan durabilidad y un rendimiento premium para los hogares más exigentes.	5760000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.792566	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
419	1	92	5	GS66SXTC	Nevecon LG Side by Side 635L Negro Mate InstaView™ ThinQ™	Nevecon LG tipo Side by Side InstaView solo con un TocToc en la puerta de tu nevera puedes mirar el interior sin necesidad de abrirla evitando la perdida de aire frio dentro del refrigerador, para ti una nevera que encaja con tu espacio mas delgado menos profundo con mayor capacidad de almacenamiento, mantén tus alimentos y bebidas siempre frescos y con la misma temperatura inclusive desde la puerta con la tecnología DoorCooling, disfruta de la exclusividad y la versatilidad de Craft Ice en cada bebida y prolongando el sabor de la misma con el hielo esférico de difusión lenta, protege a todos los que amas con la tecnologia UVNano reduce automáticamente el *99,99% de las bacterias de la boquilla de agua con luz UV. ¡Compra Ahora!	Nevecon LG tipo Side by Side InstaView solo con un TocToc en la puerta de tu nevera puedes mirar el interior sin necesidad de abrirla evitando la perdida de aire frio dentro del refrigerador, para ti una nevera que encaja con tu espacio mas delgado menos profundo con mayor capacidad de almacenamiento, mantén tus alimentos y bebidas siempre frescos y con la misma temperatura inclusive desde la puerta con la tecnología DoorCooling, disfruta de la exclusividad y la versatilidad de Craft Ice en cada bebida y prolongando el sabor de la misma con el hielo esférico de difusión lenta, protege a todos los que amas con la tecnologia UVNano reduce automáticamente el *99,99% de las bacterias de la boquilla de agua con luz UV. ¡Compra Ahora!	8795000.00	\N	\N	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-15 16:37:13.852733	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
485	3	96	1	CB-190R-2-0-2026	CB 190R 2.0 2026	La CB190 2.0 es una motocicleta para cambiar tu mundo y hacer divertida la ciudad. Cada recorrido te hará sentir emoción gracias a su diseño agresivo con ADN deportivo, seguridad gracias a sus frenos ABS, Control de Tracción y confort por cómoda posición de manejo para disfrutar de una conducción extraordinaria y divertida.	La CB190 2.0 es una motocicleta para cambiar tu mundo y hacer divertida la ciudad. Cada recorrido te hará sentir emoción gracias a su diseño agresivo con ADN deportivo, seguridad gracias a sus frenos ABS, Control de Tracción y confort por cómoda posición de manejo para disfrutar de una conducción extraordinaria y divertida.	12390000.00	\N	12190000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 17:51:11.057355	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
405	1	87	5	STAGE301.AC	LG xboom Stage 301 - Sonido y Luces para tu Fiesta - 120W	Convierte cualquier lugar en un escenario con el LG XBOOM Stage 301. Con una potencia de 120W y un sistema de 2.1 canales, este altavoz ofrece bajos profundos y agudos nítidos gracias a su tecnología de Sonido IA. Sus luces LED ajustables crean la atmósfera perfecta mientras que su conectividad inteligente te permite sincronizar la fiesta sin límites. Resistente a salpicaduras (IPX4) y con 12 horas de batería, la música nunca se detiene.	Convierte cualquier lugar en un escenario con el LG XBOOM Stage 301. Con una potencia de 120W y un sistema de 2.1 canales, este altavoz ofrece bajos profundos y agudos nítidos gracias a su tecnología de Sonido IA. Sus luces LED ajustables crean la atmósfera perfecta mientras que su	1125000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:13.538386	2026-05-25 14:23:08.246221	{"Conectividad": "inteligente te permite sincronizar la fiesta sin límites"}	[]	f	\N	\N
486	3	96	1	CB-300F-2024	CB 300F 2024	Domina la ciudad y la carretera con la nueva CB 300F, una naked imponente que combina potencia y tecnología avanzada. Diseñada para quienes buscan un nivel superior de desempeño, integra un embrague asistido y frenos ABS de doble canal, ofreciendo una experiencia de conducción agresiva, estable y llena de adrenalina con el sello de calidad global de Honda.	Domina la ciudad y la carretera con la nueva CB 300F, una naked imponente que combina potencia y tecnología avanzada. Diseñada para quienes buscan un nivel superior de desempeño, integra un embrague asistido y frenos ABS de doble canal, ofreciendo una experiencia de conducción agresiva, estable y llena de adrenalina con el sello de calidad global de Honda.	19100000.00	\N	18900000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 17:51:11.11712	2026-05-25 14:23:08.249888	{"Potencia": "y tecnología avanzada"}	[]	f	\N	\N
488	3	97	1	DIO-LED-STD-2026	DIO LED STD 2026	La DIO LED STD 2026 es la esencia de la movilidad urbana inteligente. Equipada con tecnología de iluminación LED de alta visibilidad y el confiable motor Honda de 109cc, esta scooter ofrece un equilibrio perfecto entre economía de combustible y agilidad. Su diseño bitono y sistema de frenado combinado la convierten en la opción más segura y estilizada para quienes buscan practicidad en cada trayecto.	La DIO LED STD 2026 es la esencia de la movilidad urbana inteligente. Equipada con tecnología de iluminación LED de alta visibilidad y el confiable motor Honda de 109cc, esta scooter ofrece un equilibrio perfecto entre economía de combustible y agilidad. Su diseño bitono y sistema de frenado combinado la convierten en la opción más segura y estilizada para quienes buscan practicidad en cada trayecto.	7700000.00	\N	7500000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 17:51:11.2187	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
489	3	97	1	NAVI-2026	NAVI 2026	No es scooter, nos es una sport, ¡es una NAVI! Una motocicleta única en el mercado de motor automático especialmente diseñado para salir de la rutina. Además, su espíritu personalizable será tu mayor aliado para encontrar aventuras a donde vayas.	No es scooter, nos es una sport, ¡es una NAVI! Una motocicleta única en el mercado de motor automático especialmente diseñado para salir de la rutina. Además, su espíritu personalizable será tu mayor aliado para encontrar aventuras a donde vayas.	7700000.00	\N	7500000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 17:51:11.263228	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
490	3	97	1	NAVI-MIX-2026	NAVI MIX 2026	La NAVI MIX lleva la versatilidad al siguiente nivel con una estética vibrante y contrastada. Es la combinación perfecta para quienes buscan la facilidad de una transmisión automática con una apariencia robusta y atrevida. Con un motor eficiente y una maniobrabilidad inigualable, la versión MIX está diseñada para aquellos que ven la ciudad como su patio de juegos.	La NAVI MIX lleva la versatilidad al siguiente nivel con una estética vibrante y contrastada. Es la combinación perfecta para quienes buscan la facilidad de una transmisión automática con una apariencia robusta y atrevida. Con un motor eficiente y una maniobrabilidad inigualable, la versión MIX está diseñada para aquellos que ven la ciudad como su patio de juegos.	8000000.00	\N	7800000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 17:51:11.300232	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
484	3	96	1	WAVE-110S-CBS-2026	WAVE 110S CBS 2026	Tener una Wave 110s es tener una verdadera Honda. Su diseño moderno y de espíritu juvenil integra la experiencia del mayor fabricante del segmento en toda su historia. Además, su carenaje deportivo y motor OHC de bajas vibraciones te garantizan una moto llena de energía, alta resistencia y durabilidad.	Tener una Wave 110s es tener una verdadera Honda. Su diseño moderno y de espíritu juvenil integra la experiencia del mayor fabricante del segmento en toda su historia. Además, su carenaje deportivo y motor OHC de bajas vibraciones te garantizan una moto llena de energía, alta resistencia y durabilidad.	7750000.00	\N	7550000.00	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-15 17:51:10.996334	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
491	3	97	1	PCX-160-ABS-2026	PCX 160 ABS 2026	La nueva scooter PCX 160 es MÁS QUE UNA Motocicleta MAS, su Comfort y Tecnologías te sorprenderán para vivir una experiencia diferente a cualquier otra scooter. QUE SIGNIFICA PCX: Personal Comfort Experience o una Experiencia de Comodidad Personalizada para sus usuarios.	La nueva scooter PCX 160 es MÁS QUE UNA Motocicleta MAS, su Comfort y Tecnologías te sorprenderán para vivir una experiencia diferente a cualquier otra scooter. QUE SIGNIFICA PCX: Personal Comfort Experience o una Experiencia de Comodidad Personalizada para sus usuarios.	15190000.00	\N	14800000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 17:51:11.341894	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
492	3	98	1	XR-150L-2-0-2026	XR 150L 2.0 2026	La nueva XR150L ABS es ideal para iniciar tu camino en el mundo doble propósito. Con un legado histórico de 21 años. Su motor HONDA está diseñado para durar y enfrentar cualquier terreno, mientras vives una experiencia segura, cómoda y emocionante.	La nueva XR150L ABS es ideal para iniciar tu camino en el mundo doble propósito. Con un legado histórico de 21 años. Su motor HONDA está diseñado para durar y enfrentar cualquier terreno, mientras vives una experiencia segura, cómoda y emocionante.	11050000.00	\N	10850000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 17:51:11.392299	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
493	3	98	1	XR-190L-2-0-2026	XR 190L 2.0 2026	La renovada XR190L ABS cuenta el balance perfecto entre diseño, tecnología y desempeño para transformar tu camino en un recorrido emocionante y seguro en terrenos OFF y ON. Además, disfruta del reconocido ADN doble propósito de Honda con la confianza y respaldo 21 años del legado XR.	La renovada XR190L ABS cuenta el balance perfecto entre diseño, tecnología y desempeño para transformar tu camino en un recorrido emocionante y seguro en terrenos OFF y ON. Además, disfruta del reconocido ADN doble propósito de Honda con la confianza y respaldo 21 años del legado XR.	14000000.00	\N	13800000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 17:51:11.43811	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
494	3	98	1	XR-300L-2026	XR 300L 2026	La mítica Honda XR 300 L ABS Tornado llega a Colombia para hacer de cada aventura una experiencia inolvidable. La XR300L es una moto que entrega la potencia y resistencia que anhelas, con un diseño vibrante y todo el respaldo del legado XR. Disfruta del viaje y ve por la aventura de tus sueños	La mítica Honda XR 300 L ABS Tornado llega a Colombia para hacer de cada aventura una experiencia inolvidable. La XR300L es una moto que entrega la potencia y resistencia que anhelas, con un diseño vibrante y todo el respaldo del legado XR. Disfruta del viaje y ve por la aventura de tus sueños	30190000.00	\N	29990000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 17:51:11.48671	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
495	3	98	1	NX-190-2026	NX 190 2026	Recuerdas la sensación de vivir una nueva experiencia y sorprenderte fácilmente. En tu vida aún queda mucho por hacer y muchas primeras veces por recorrer. Porque arriba de una NX190, nuestra vida se vuelve a llenar de asombro.	Recuerdas la sensación de vivir una nueva experiencia y sorprenderte fácilmente. En tu vida aún queda mucho por hacer y muchas primeras veces por recorrer. Porque arriba de una NX190, nuestra vida se vuelve a llenar de asombro.	14000000.00	\N	13800000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 17:51:11.529467	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
496	3	96	1	X-BLADE-160-2026	X-Blade 160 2026	Nuestra X-Blade 160 llega a revolucionar el segmento sport con Xtraordinario desempeño, Xpresivo diseño deportivo y moderno que integra altas tecnologías en seguridad. Se une con orgullo a la reconocida Línea Honda CB.	Nuestra X-Blade 160 llega a revolucionar el segmento sport con Xtraordinario desempeño, Xpresivo diseño deportivo y moderno que integra altas tecnologías en seguridad. Se une con orgullo a la reconocida Línea Honda CB.	10300000.00	\N	10100000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 17:51:11.577097	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
768	4	42	7	11482000270	MS 162 35CM	Baja intensidad de uso, cilindrada 30 cm³ , potencia 1,74 hp, peso 4,5 km	Baja intensidad de uso	840000.00	\N	715000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.438799	2026-05-25 14:23:08.25975	{"Cilindrada": "30 cm³"}	[]	f	\N	2026-05-25 13:56:39.68275
497	3	96	1	X-BLADE-160-2025	X-Blade 160 2025	La versión 2025 de la X-Blade 160 continúa ofreciendo un desempeño extraordinario y un diseño agresivo que redefine el concepto sport en la ciudad. Con tecnología de punta y seguridad ABS, es la opción ideal para quienes buscan eficiencia y estilo en su día a día.	La versión 2025 de la X-Blade 160 continúa ofreciendo un desempeño extraordinario y un diseño agresivo que redefine el concepto sport en la ciudad. Con tecnología de punta y seguridad ABS, es la opción ideal para quienes buscan eficiencia y estilo en su día a día.	10190000.00	\N	9990000.00	\N	\N	10	5	12	\N	f	t	2	0	0.00	0	2026-01-15 17:51:11.613411	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
770	4	42	7	11482000305	MS 182 45CM	Peso 3.9 Kg, potencia de 2 Hp/1.5 Kw, tipo cadena 3/8"P,. cilindrada 31.8 cm³	Peso 3.9 Kg, potencia de 2 Hp/1.5 Kw, tipo cadena 3/8"P,. cilindrada 31.8 cm³	1175000.00	\N	1005000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.524731	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
772	4	42	7	11232000842	MS 250 50CM	Peso 4.6 Kg, potencia 2,95 Hp/2,2 Kw, tipo cadena, paso .325,cilindrada 45,4 cm³	Peso 4.6 Kg, potencia 2,95 Hp/2,2 Kw, tipo cadena, paso .325,cilindrada 45,4 cm³	1805000.00	\N	1540000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.629738	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
773	4	42	7	11272000385	MS 310 63CM	Peso 5.9 Kg, potencia 4,29 Hp/ 3,2 Kw, tipo cadena 3/8",cilindrada 59,0 cm³	Peso 5.9 Kg, potencia 4,29 Hp/ 3,2 Kw, tipo cadena 3/8",cilindrada 59,0 cm³	2535000.00	\N	2165000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.662739	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
774	4	42	7	MB012000055	MS 363 63 CM	Alta intensidad de uso, cilindada 62.6 cm³, peso 5.5 Kg, 4.69 Hp.	Alta intensidad de uso, cilindada 62.6 cm³, peso 5.5 Kg, 4.69 Hp.	2955000.00	\N	2525000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.704384	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
775	4	42	7	1119.200.0283	MS 382 75CM	Peso 6,2 Kg, potencia 5,23 Hp/ 3,9 Kw, tipo cadena 3/8",cilindrada 72,2 cm³	Peso 6,2 Kg, potencia 5,23 Hp/ 3,9 Kw, tipo cadena 3/8",cilindrada 72,2 cm³	3285000.00	\N	2805000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.738226	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
777	4	42	7	11442000356	MS 651 90 CM	Peso 7.4 kg, potencia 5.0 kw, Hp 6.70, tipo cadena 404, cilindrada 91.1 cm³.	Peso 7.4 kg, potencia 5.0 kw, Hp 6.70, tipo cadena 404, cilindrada 91.1 cm³.	4370000.00	\N	3730000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.811398	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
778	4	42	7	11442000349	MS 661 90CM	Peso 7.4 kg, potencia 7,24 Hp/ 5.4 Kw, tipo cadena 404, cilindrada 91.1 cm³.	Peso 7.4 kg, potencia 7,24 Hp/ 5.4 Kw, tipo cadena 404, cilindrada 91.1 cm³.	4795000.00	\N	4095000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.843382	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
779	4	43	7	45220115771	FS A57	Peso con bateria 3,5 KgGuadaña a bateria para cuidado y borde del cesped,	Peso con bateria 3,5 KgGuadaña a bateria para cuidado y borde del cesped,	1430000.00	\N	1220000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.879467	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
780	4	43	7	41402000585	FS 55 R	Peso 4,8 Kg, potencia 1,0 Hp/ 0,75 Kw, cilindrada 27,2 cm³,	Peso 4,8 Kg, potencia 1,0 Hp/ 0,75 Kw, cilindrada 27,2 cm³,	1000000.00	\N	855000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.914858	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
781	4	43	7	41512000038	FS 230	Peso de 7.3 Kg, potencia de 2.1 Hp/ 1.55 Kw, cilindrada en 40.2 cm³	Peso de 7.3 Kg, potencia de 2.1 Hp/ 1.55 Kw, cilindrada en 40.2 cm³	1245000.00	\N	1065000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.943732	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
782	4	43	7	4134.200.0326	FS 120	Peso 6,3 K, potencia 1,8hp/1,3 K, cilindrada en 30,9 cm³,	Peso 6,3 K, potencia 1,8hp/1,3 K, cilindrada en 30,9 cm³,	1715000.00	\N	1465000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.976398	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
783	4	43	7	41342000346	FS 120R	Peso 6,3 K, potencia 1,8hp/1,3 K, cilindrada en 30,9 cm³,	Peso 6,3 K, potencia 1,8hp/1,3 K, cilindrada en 30,9 cm³,	1715000.00	\N	1465000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.014767	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
771	4	42	7	MAO040115867	MSA 60.0	Motosierra a bateria de baja intesidad de uso voltaje 36v, bateria Ion litio, peso 29k	Motosierra a bateria de baja intesidad de uso voltaje 36v, bateria Ion litio	1705000.00	\N	1460000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.564021	2026-05-25 14:23:08.260295	{"Peso": "29k"}	[]	f	\N	\N
787	4	43	7	4119.200.0063	FS 160	Peso7,4Kg, poten 1,9 Hp/1,4Kw, cilindrada29,8 cm³, Cortahierbas Ø305-2	Peso7,4Kg, poten 1,9 Hp/1,4Kw, cilindrada29,8 cm³, Cortahierbas Ø305-2	2190000.00	\N	1870000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.135219	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
788	4	43	7	41472000676	FS 161	Alta intensidad de uso, mt 2 mix, 2,01 Hp, cilindraje 37,7 cm³, peso 7, 5 Kg.	Alta intensidad de uso, mt 2 mix, 2,01 Hp, cilindraje 37,7 cm³, peso 7, 5 Kg.	2280000.00	\N	1945000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.160435	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
789	4	43	7	4147.200.0677	FS 221	Peso 6,92 Kg, poten 1.7 Hp/ 2.27 Kw, cilindrada 37.7cm³, RMP 12800, MT 2-mix	Peso 6,92 Kg, poten 1.7 Hp/ 2.27 Kw, cilindrada 37.7cm³, RMP 12800, MT 2-mix	2355000.00	\N	2010000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.195382	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
790	4	43	7	41472000678	FS 291	Peso de 6,62 Kg, potencia de 2.68 Hp/ 2.0 Kw, cilindrada en 41.6 cm³.	Peso de 6,62 Kg, potencia de 2.68 Hp/ 2.0 Kw, cilindrada en 41.6 cm³.	2495000.00	\N	2130000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.222053	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
791	4	43	7	41472000680	FS 351	Alta intensidad de uso, mt 2 mix, 2,27 Hp, cilindraje 37,7 cm³, peso 8,3 Kg.	Alta intensidad de uso, mt 2 mix, 2,27 Hp, cilindraje 37,7 cm³, peso 8,3 Kg.	2715000.00	\N	2315000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.253091	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
792	4	43	7	41472000679	FS 460	Peso de 6,62 Kg, potencia de 2.68 Hp/ 2.0 Kw, cilindrada en 41.6 cm³.	Peso de 6,62 Kg, potencia de 2.68 Hp/ 2.0 Kw, cilindrada en 41.6 cm³.	3750000.00	\N	3200000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.289599	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
812	4	111	7	62500113900	MH 610	Peso 60kg, 6 HP, cilindarada 212 cm³, Motor 4 T a gasolina, alta intensidad de uso.	Peso 60kg, 6 HP, cilindarada 212 cm³, Motor 4 T a gasolina, alta intensidad de uso.	4815000.00	\N	4110000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.902093	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
776	4	42	7	11422000166	MS 462 75CM	Peso 6 Kg, potencia 6 Hp,espada 15", 18",20" ,cilindrada 72,2 cm³	Peso 6 Kg, potencia 6 Hp,espada 15", 18",20" ,cilindrada 72,2 cm³	4285000.00	\N	3655000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:34.767711	2026-05-25 14:23:08.260758	{"Peso": "6 Kg"}	[]	f	\N	\N
784	4	43	7	41512000037	FS 235	Cilindrada 36,3 cm³, 1,55 KW/2.07 HP, 6,8 Kg. Sistema antivibración	Cilindrada 36,3 cm³, 1,55 KW/2.07 HP, 6,8 Kg	1920000.00	\N	1640000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.042729	2026-05-25 14:23:08.261366	{"Sistema": "antivibración"}	[]	f	\N	\N
785	4	43	7	41512000045	FS 235R	Cilindrada 36,3 cm³, 1,55 KW/2.07 HP, 6,8 Kg. Sistema antivibración	Cilindrada 36,3 cm³, 1,55 KW/2.07 HP, 6,8 Kg	1920000.00	\N	1640000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.074387	2026-05-25 14:23:08.261953	{"Sistema": "antivibración"}	[]	f	\N	\N
896	2	116	35	MX-ST-200-DIV	Somier 200 X 200 (2 Somier de 100X200)	La experiencia definitiva del descanso King Size. Con 2 metros de ancho y largo, esta base dividida es el cimiento de un dormitorio de ensueño. Su estructura está diseñada para soportar colchones de alto peso, manteniendo la independencia de lechos y evitando la transferencia de movimiento.	La experiencia definitiva del descanso King Size. Con 2 metros de ancho y largo, esta base dividida es el cimiento de un dormitorio de ensueño. Su estructura está diseñada para soportar colchones de alto peso, manteniendo la independencia de lechos y evitando la transferencia de movimiento.	940000.00	\N	840000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.073045	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
897	2	116	35	MX-ST-SUI-BER-TOK	Somier Suiza - Berlín - Tokio 140X190	Una línea de diseño exclusiva que rinde homenaje a la estética europea y asiática. Este somier destaca por sus acabados detallados en las costuras y el uso de textiles de lujo. La serie Suiza-Berlín-Tokio representa el tope de gama en bases de cama, ideal para quienes buscan un mueble con personalidad propia.	Una línea de diseño exclusiva que rinde homenaje a la estética europea y asiática. Este somier destaca por sus acabados detallados en las costuras y el uso de textiles de lujo. La serie Suiza-Berlín-Tokio representa el tope de gama en bases de cama, ideal para quienes buscan un mueble con personalidad propia.	1370000.00	\N	1225000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.080399	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
895	2	116	35	MX-ST-160-DIV	Somier 160 X 190 (2 Somier de 80 X 190)	Alcance el máximo confort con la medida Queen Size en un formato modular. Estos dos somieres de 80x190 se integran para formar una base espaciosa y robusta. El tapizado continuo en ambos módulos asegura que la separación sea imperceptible bajo el colchón, ofreciendo un soporte uniforme.	Alcance el máximo confort con la medida Queen Size en un formato modular. Estos dos somieres de 80x190 se integran para formar una base espaciosa y robusta. El tapizado continuo en ambos módulos asegura que la separación sea imperceptible bajo el colchón, ofreciendo un soporte uniforme.	850000.00	\N	760000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.064493	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
902	2	117	35	SALA-HILTON-MC	Sala Hilton + Mesa de Centro	Lleva la comodidad de un hotel de 5 estrellas a tu sala. El modelo Hilton destaca por sus cojines de respaldo extra acolchados y una estructura robusta para uso intensivo.	Lleva la comodidad de un hotel de 5 estrellas a tu sala. El modelo Hilton destaca por sus cojines de respaldo extra acolchados y una estructura robusta para uso intensivo.	2580000.00	\N	2305000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.169713	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
903	2	117	35	SALA-L-OTAWWA-MC	Sala L Ottawa + Mesa de Centro	Inspirada en el estilo nórdico, la Sala Ottawa ofrece líneas limpias y colores neutros que aportan luminosidad y sensación de amplitud a tu zona social.	Inspirada en el estilo nórdico, la Sala Ottawa ofrece líneas limpias y colores neutros que aportan luminosidad y sensación de amplitud a tu zona social.	2820000.00	\N	2520000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.1887	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
904	2	117	35	SOFA-MANHATAN-MC	Sofa Manhatan + Mesa de Centro	El estilo industrial neoyorquino en tu hogar. El sofá Manhatan combina elegancia urbana con una estructura de gran durabilidad, ideal para recibir visitas con estilo.	El estilo industrial neoyorquino en tu hogar. El sofá Manhatan combina elegancia urbana con una estructura de gran durabilidad, ideal para recibir visitas con estilo.	2935000.00	\N	2620000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.210024	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
905	2	117	35	SALA-L-ANNI-MC	Sala L Anni + Mesa de Centro	Comodidad envolvente y diseño contemporáneo. La Sala Anni es la pieza central perfecta para familias que buscan un lugar acogedor para el descanso diario.	Comodidad envolvente y diseño contemporáneo. La Sala Anni es la pieza central perfecta para familias que buscan un lugar acogedor para el descanso diario.	3135000.00	\N	2800000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.232888	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
907	2	117	35	SALA-L-PARIS-MC	Sala L Paris + Mesa de Centro	Nuestra gama más alta. La Sala Paris ofrece acabados de lujo, patas metálicas cromadas y un diseño de vanguardia que redefine el concepto de elegancia en el hogar.	Nuestra gama más alta. La Sala Paris ofrece acabados de lujo, patas metálicas cromadas y un diseño de vanguardia que redefine el concepto de elegancia en el hogar.	3510000.00	\N	3135000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.273422	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
908	2	118	35	SILLA-ATLANTA	Silla Operativa Atlanta	Ergonomía avanzada para tus jornadas de trabajo. La silla Atlanta cuenta con soporte lumbar ajustable, malla transpirable y ruedas de alta resistencia para cualquier superficie.	Ergonomía avanzada para tus jornadas de trabajo. La silla Atlanta cuenta con soporte lumbar ajustable, malla transpirable y ruedas de alta resistencia para cualquier superficie.	430000.00	\N	385000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.298696	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
909	2	118	35	SILLA-ALEM	Silla Reclinable Alem	El máximo confort en un solo lugar. La silla Alem es perfecta para zonas de TV o lectura, con un mecanismo de reclinación suave y acolchado tipo nube.	El máximo confort en un solo lugar. La silla Alem es perfecta para zonas de TV o lectura, con un mecanismo de reclinación suave y acolchado tipo nube.	2165000.00	\N	1935000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.322396	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
910	2	26	35	COMEDOR-HILTON-4P	Comedor Hilton 4 PTS	Elegante comedor de 4 puestos ideal para cenas familiares. Su mesa de vidrio templado y sillas ergonómicas Hilton crean un ambiente moderno y acogedor.	Elegante comedor de 4 puestos ideal para cenas familiares. Su mesa de vidrio templado y sillas ergonómicas Hilton crean un ambiente moderno y acogedor.	2520000.00	\N	2250000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.345022	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
911	2	26	35	COMEDOR-MANHATAN-4P	Comedor Manhatan 4 PTS	Diseño vanguardista para espacios contemporáneos. El comedor Manhatan destaca por sus acabados en madera natural y sillas con diseño ergonómico.	Diseño vanguardista para espacios contemporáneos. El comedor Manhatan destaca por sus acabados en madera natural y sillas con diseño ergonómico.	2540000.00	\N	2270000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.36083	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
899	2	117	35	SALA-L-SAHARA-MC	Sala L Sahara + Mesa de Centro	Transforma tu hogar con la elegancia de la Sala Sahara. Su diseño en L optimiza el espacio brindando un confort excepcional con espumas de alta densidad. Incluye una mesa de centro minimalista que complementa el set de forma perfecta.	Transforma tu hogar con la elegancia de la Sala Sahara. Su diseño en L optimiza el espacio brindando un confort excepcional con espumas de alta densidad. Incluye una mesa de centro minimalista que complementa el set de forma perfecta.	1880000.00	\N	1680000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.105498	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
916	2	121	36	CDB 9445	Combo Escritorio + Biblioteca Astana Duna	Crea el ambiente de estudio perfecto con el combo Astana. Su color Duna aporta un toque natural y orgánico, mientras que la integración del escritorio con la biblioteca maximiza el aprovechamiento de los metros cuadrados.	Crea el ambiente de estudio perfecto con el combo Astana. Su color Duna aporta un toque natural y orgánico, mientras que la integración del escritorio con la biblioteca maximiza el aprovechamiento de los metros cuadrados.	650000.00	\N	575000.00	\N	\N	10	5	12	\N	f	t	4	0	0.00	0	2026-01-16 13:23:42.441686	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
914	2	120	36	AM 31023	Armario Inval (150X200) Arena / Blanco	Amplio armario de diseño contemporáneo que combina los tonos Arena y Blanco para aportar luminosidad a tu habitación. Cuenta con una distribución interna inteligente para ropa colgada y doblada.	Amplio armario de diseño contemporáneo que combina los tonos Arena y Blanco para aportar luminosidad a tu habitación. Cuenta con una distribución interna inteligente para ropa colgada y doblada.	1495000.00	\N	1320000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.408075	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
915	2	120	36	AM 30923	Armario Inval (200X200) Arena / Blanco	La solución definitiva de almacenamiento para parejas o espacios amplios. Este armario de 2 metros de ancho ofrece una estética moderna y una resistencia superior para organizar todo tu guardarropa en un solo lugar.	La solución definitiva de almacenamiento para parejas o espacios amplios. Este armario de 2 metros de ancho ofrece una estética moderna y una resistencia superior para organizar todo tu guardarropa en un solo lugar.	2080000.00	\N	1845000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.426308	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
954	3	137	33	DL 650 XT	Suzuki V-Strom 650 XT	Referencia mundial del turismo aventura con motor V-Twin y rines de radios tubeless para máxima absorción de impactos.	Referencia mundial del turismo aventura con motor V-Twin y rines de radios tubeless para máxima absorción de impactos.	50050000.00	\N	49850000.00	\N	\N	10	5	12	\N	f	t	7	0	0.00	0	2026-01-16 13:42:49.642975	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
940	3	97	33	ADRESS NM	Suzuki Address NM	Scooter inteligente con sistema de frenado combinado IBS que mejora la estabilidad y seguridad en detenciones.	Scooter inteligente con sistema de frenado combinado IBS que mejora la estabilidad y seguridad en detenciones.	8690000.00	\N	8490000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.378013	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
941	3	97	33	ADRESS NZ	Suzuki Address NZ	Scooter llamativa y liviana que ofrece una aceleración deportiva con un peso ultra bajo de 95kg.	Scooter llamativa y liviana que ofrece una aceleración deportiva con un peso ultra bajo de 95kg.	8600000.00	\N	8400000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.396759	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
938	3	97	33	BETS 125 FI	Suzuki Bets 125 FI	Nueva scooter automática con inyección electrónica (FI) diseñada para optimizar el consumo de combustible y facilitar el encendido en frío.	Nueva scooter automática con inyección electrónica (FI) diseñada para optimizar el consumo de combustible y facilitar el encendido en frío.	10690000.00	\N	10490000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.344333	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
942	3	97	33	AVENIS	Suzuki Avenis	Scooter de alto desempeño que fusiona elegancia con deportividad, destacando por su tapa de combustible externa.	Scooter de alto desempeño que fusiona elegancia con deportividad, destacando por su tapa de combustible externa.	9899000.00	\N	9699000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.411258	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
898	2	116	35	MX-COMBO-TOKIO-140	Combo Tokio 140 (Colchón+Base Cama+Nochero+2 Almohadas)	La solución integral para renovar su alcoba con un solo clic. Este combo incluye todo lo necesario para un descanso de hotel en su hogar: un colchón ortopédico de 140x190, una base cama tapizada de alta resistencia, un elegante nochero a juego y dos almohadas de nube. Calidad, estilo y ahorro en un solo paquete.	La solución integral para renovar su alcoba con un solo clic. Este combo incluye todo lo necesario para un descanso de hotel en su hogar: un colchón ortopédico de 140x190, una base cama tapizada de alta resistencia, un elegante nochero a juego y dos almohadas de nube. Calidad, estilo y ahorro en un solo paquete.	2540000.00	\N	2270000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.0881	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
886	2	112	34	LLH915D	Bafle Profesional Clase D de 15 Pulgadas con TWS	La cúspide de la ingeniería acústica aplicada al hogar y la oficina. El bafle LLH915D ofrece una eficiencia Clase D que permite un diseño más liviano y estilizado, facilitando su ubicación en trípodes o montajes de pared. Gracias a su tecnología TWS, usted podrá organizar un sistema estéreo inalámbrico de alta gama, evitando el desorden de cables a través de su sala. Su driver de titanio y potente imán de 80oz garantizan una durabilidad y claridad que satisfacen hasta al audiófilo más exigente.	La cúspide de la ingeniería acústica aplicada al hogar y la oficina. El bafle LLH915D ofrece una eficiencia Clase D que permite un diseño más liviano y estilizado, facilitando su ubicación en trípodes o montajes de pared. Gracias a su tecnología TWS, usted podrá organizar un sistema estéreo inalámbrico de alta gama, evitando el desorden de cables a través de su sala. Su driver de titanio y potente imán de 80oz garantizan una durabilidad y claridad que satisfacen hasta al audiófilo más exigente.	1650000.00	\N	1460000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:41.845054	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
894	2	116	35	MX-ST-140-DIV	Somier 140 X 190 (2 Somier de 70 X 190)	La solución inteligente para accesos difíciles. Este somier dividido permite disfrutar de una cama doble de 140x190 en habitaciones con puertas o pasillos estrechos. Al ser dos módulos independientes que se unen de forma segura, facilita la mudanza y el transporte sin sacrificar la estabilidad del descanso.	La solución inteligente para accesos difíciles. Este somier dividido permite disfrutar de una cama doble de 140x190 en habitaciones con puertas o pasillos estrechos. Al ser dos módulos independientes que se unen de forma segura, facilita la mudanza y el transporte sin sacrificar la estabilidad del descanso.	755000.00	\N	675000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.055514	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
892	2	116	35	MX-ST-120-190	Somier Tapizado 120 X 190	Diseñado para quienes buscan un espacio extra de confort sin ocupar el área de una cama doble. El somier semidoble de 120x190 es la opción preferida para adolescentes y jóvenes adultos. Su construcción reforzada evita ruidos molestos durante el movimiento, asegurando un sueño ininterrumpido.	Diseñado para quienes buscan un espacio extra de confort sin ocupar el área de una cama doble. El somier semidoble de 120x190 es la opción preferida para adolescentes y jóvenes adultos. Su construcción reforzada evita ruidos molestos durante el movimiento, asegurando un sueño ininterrumpido.	530000.00	\N	475000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.025995	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
932	3	126	33	AX4H EVOLUTION EIII	Suzuki AX4H Evolution EIII	Versión evolucionada de la AX4 con farola carenada y rines de aspas para mayor durabilidad urbana.	Versión evolucionada de la AX4 con farola carenada y rines de aspas para mayor durabilidad urbana.	6260000.00	\N	5960000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.22616	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
933	3	127	33	AX4 ABS	Suzuki AX4 ABS	Primera motocicleta del segmento de trabajo en incorporar sistema de frenos ABS delantero para mayor seguridad activa.	Primera motocicleta del segmento de trabajo en incorporar sistema de frenos ABS delantero para mayor seguridad activa.	6509000.00	\N	6309000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.252172	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
946	3	96	33	GIXXER FI	Suzuki Gixxer FI	Motocicleta sport con inyección electrónica de última generación para una aceleración más suave y eficiente.	Motocicleta sport con inyección electrónica de última generación para una aceleración más suave y eficiente.	10590000.00	\N	10390000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.489807	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
947	3	132	33	GIXXER FI 150 ABS	Suzuki Gixxer FI 150 ABS	Equipada con ABS delantero controlado electrónicamente para evitar bloqueos en frenadas de emergencia.	Equipada con ABS delantero controlado electrónicamente para evitar bloqueos en frenadas de emergencia.	11390000.00	\N	11190000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.510811	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
948	3	133	33	GIXXER SF FI 150 ABS	Suzuki Gixxer SF FI 150 ABS	Versión con carenado aerodinámico inspirado en Moto GP, ofreciendo mayor protección contra el viento y estética deportiva.	Versión con carenado aerodinámico inspirado en Moto GP, ofreciendo mayor protección contra el viento y estética deportiva.	12890000.00	\N	12690000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.534099	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
944	3	130	33	DR 150	Suzuki DR 150	Motocicleta todoterreno diseñada para la aventura tanto en ciudad como fuera del asfalto con gran altura al piso.	Motocicleta todoterreno diseñada para la aventura tanto en ciudad como fuera del asfalto con gran altura al piso.	10830000.00	\N	10630000.00	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-16 13:42:49.451814	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
945	3	131	33	DR 150 FI ABS	Suzuki DR 150 FI ABS	Versión con inyección electrónica y ABS delantero de la DR 150, ofreciendo mayor control en superficies resbaladizas.	Versión con inyección electrónica y ABS delantero de la DR 150, ofreciendo mayor control en superficies resbaladizas.	13199000.00	\N	12999000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.47045	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
949	3	96	33	GIXXER 250	Suzuki Gixxer 250	Motocicleta naked deportiva con sistema de refrigeración por aceite (SOCS) y frenos ABS de doble canal.	Motocicleta naked deportiva con sistema de refrigeración por aceite (SOCS) y frenos ABS de doble canal.	15780000.00	\N	15580000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.555319	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
950	3	134	33	V STROM 160	Suzuki V-Strom 160	Iniciación al mundo Adventure de Suzuki, ofreciendo la ergonomía de la familia V-Strom en un cilindraje accesible.	Iniciación al mundo Adventure de Suzuki, ofreciendo la ergonomía de la familia V-Strom en un cilindraje accesible.	14190000.00	\N	13990000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.577282	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
951	3	135	33	GSX S 150 ABS	Suzuki GSX-S 150 ABS	Naked de alto rendimiento con motor DOHC y refrigeración líquida, líder en relación peso-potencia de su categoría.	Naked de alto rendimiento con motor DOHC y refrigeración líquida, líder en relación peso-potencia de su categoría.	13870000.00	\N	13670000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.588657	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
952	3	136	33	GSX R 150 ABS	Suzuki GSX-R 150 ABS	La deportiva más rápida de 150cc con sistema de encendido Keyless y ADN de competencia de la serie GSX-R.	La deportiva más rápida de 150cc con sistema de encendido Keyless y ADN de competencia de la serie GSX-R.	15190000.00	\N	14990000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.606329	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
529	1	4	32	HYLED4328G	Televisor HYUNDAI 43" Smart Google TV FHD	Disfruta de cada escena como nunca antes con imágenes en Full HD y sonido envolvente Dolby Audio. Los Smart Google TV de Hyundai te permiten acceder a tus apps favoritas con tu voz y transmitir contenido fácilmente .	Disfruta de cada escena como nunca antes con imágenes en Full HD y sonido envolvente Dolby Audio. Los Smart Google TV de Hyundai te permiten acceder a tus apps favoritas con tu voz y transmitir contenido fácilmente .	1045000.00	\N	945000.00	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-15 18:54:02.588113	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
934	3	128	33	GN 125 EIII	Suzuki GN 125 EIII	Íconodiseño retro, conocida por su comodidad y durabilidad legendaria en el mercado colombiano.	Íconodiseño retro, conocida por su comodidad y durabilidad legendaria en el mercado colombiano.	7199000.00	\N	6999000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.270554	2026-05-25 14:22:22.654779	{}	[]	f	\N	\N
953	3	134	33	V STROM 250 SX	Suzuki V-Strom 250 SX	Crossover versátil con rueda delantera de 19 pulgadas y motor SOCS para largos recorridos en carretera y terrenos irregulares.	Crossover versátil con rueda delantera de 19 pulgadas y motor SOCS para largos recorridos en carretera y terrenos irregulares.	20390000.00	\N	20190000.00	\N	\N	10	5	12	\N	f	t	6	0	0.00	0	2026-01-16 13:42:49.623404	2026-05-25 15:03:18.333131	{}	[]	f	\N	\N
520	1	102	14	AIRPR	SAMURAI de piso, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas.	SAMURAI de piso, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas. SAMURAI de piso, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas.	SAMURAI de piso, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas. SAMURAI de piso, 70W, bajo consumo energía, 3 velocidades, mallas seguras, función inclinable, oscilación horizontal, 4 aspas.	230000.00	\N	210000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.432314	2026-05-25 14:49:40.916741	{}	[]	f	placeholder	2026-05-25 14:49:40.916741
893	2	116	35	MX-ST-140-190	Somier Tapizado 140 X 190	La medida estándar para el descanso en pareja, ahora con la elegancia del tapizado perimetral. Este somier de una sola pieza ofrece una superficie totalmente nivelada para su colchón, prolongando su vida útil. Un diseño sobrio que se adapta a cualquier decoración de alcoba principal.	La medida estándar para el descanso en pareja, ahora con la elegancia del tapizado perimetral. Este somier de una sola pieza ofrece una superficie totalmente nivelada para su colchón, prolongando su vida útil. Un diseño sobrio que se adapta a cualquier decoración de alcoba principal.	580000.00	\N	520000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:23:42.039188	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
943	3	97	33	BURGMAN FI	Suzuki Burgman FI	Scooter de estilo sofisticado tipo maxi-scooter con inyección electrónica y tecnología Suzuki Eco Performance.	Scooter de estilo sofisticado tipo maxi-scooter con inyección electrónica y tecnología Suzuki Eco Performance.	10690000.00	\N	10490000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.427241	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
361	1	95	30	SEMIORTOPEDICO-90X190	Semiortopedico 90x190	Colchón semiortopédico con estructura resistente y soporte firme para un descanso saludable.	Colchón semiortopédico con estructura resistente y soporte firme para un descanso saludable.	705000.00	\N	\N	\N	\N	10	5	12	\N	t	t	0	0	0.00	0	2026-01-15 16:37:12.316788	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
362	1	95	30	SEMIORTOPEDICO-100X190	Semiortopedico 100x190	Colchón semiortopédico con estructura resistente y soporte firme para un descanso saludable.	Colchón semiortopédico con estructura resistente y soporte firme para un descanso saludable.	770000.00	\N	\N	\N	\N	10	5	12	\N	t	t	0	0	0.00	0	2026-01-15 16:37:12.340434	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
363	1	95	30	SEMIORTOPEDICO-120X190	Semiortopedico 120x190	Colchón semiortopédico con estructura resistente y soporte firme para un descanso saludable.	Colchón semiortopédico con estructura resistente y soporte firme para un descanso saludable.	920000.00	\N	\N	\N	\N	10	5	12	\N	t	t	0	0	0.00	0	2026-01-15 16:37:12.350518	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
364	1	95	30	SEMIORTOPEDICO-130X190	Semiortopedico 130x190	Colchón semiortopédico con estructura resistente y soporte firme para un descanso saludable.	Colchón semiortopédico con estructura resistente y soporte firme para un descanso saludable.	1045000.00	\N	\N	\N	\N	10	5	12	\N	t	t	0	0	0.00	0	2026-01-15 16:37:12.358863	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
365	1	95	30	SEMIORTOPEDICO-140X190	Semiortopedico 140x190	Colchón semiortopédico con estructura resistente y soporte firme para un descanso saludable.	Colchón semiortopédico con estructura resistente y soporte firme para un descanso saludable.	1045000.00	\N	\N	\N	\N	10	5	12	\N	t	t	0	0	0.00	0	2026-01-15 16:37:12.367956	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
366	1	95	30	COLCH-N-ORTOPEDICO-DUAL-O-CLASIC-FOAM-90	Colchón Ortopedico Dual O Clasic Foam 90x190	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	730000.00	\N	\N	\N	\N	10	5	12	\N	t	t	0	0	0.00	0	2026-01-15 16:37:12.37621	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
367	1	95	30	COLCH-N-ORTOPEDICO-DUAL-O-CLASIC-FOAM-10	Colchón Ortopedico Dual O Clasic Foam 100x180	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	795000.00	\N	\N	\N	\N	10	5	12	\N	t	t	0	0	0.00	0	2026-01-15 16:37:12.384975	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
368	1	95	30	COLCH-N-ORTOPEDICO-DUAL-O-CLASIC-FOAM-12	Colchón Ortopedico Dual O Clasic Foam 120x180	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	Colchón ortopédico diseñado para el máximo soporte y alineación de la espalda.	915000.00	\N	\N	\N	\N	10	5	12	\N	t	t	0	0	0.00	0	2026-01-15 16:37:12.392623	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
931	3	126	33	AX4 EIII	Suzuki AX4 EIII	Motocicleta de trabajo reconocida por su resistencia y bajos costos de mantenimiento, ideal para mensajería y carga ligera.	Motocicleta de trabajo reconocida por su resistencia y bajos costos de mantenimiento, ideal para mensajería y carga ligera.	6020000.00	\N	5820000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-16 13:42:49.197795	2026-05-25 14:18:55.749323	{}	[]	f	\N	2026-05-25 13:56:14.100833
918	2	121	36	CCB 7796	Armario Arizona (140x183) Bellota Blanco	El armario Arizona destaca por su acabado en Bellota Blanco, ofreciendo un aire rústico-moderno. Es la pieza ideal para quienes buscan elegancia y funcionalidad sin sacrificar espacio en la habitación.	El armario Arizona destaca por su acabado en Bellota Blanco, ofreciendo un aire rústico-moderno. Es la pieza ideal para quienes buscan elegancia y funcionalidad sin sacrificar espacio en la habitación.	1125000.00	\N	995000.00	\N	\N	10	5	12	\N	f	t	1	0	0.00	0	2026-01-16 13:23:42.466134	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
531	1	4	32	HYLED6512G	Televisor HYUNDAI 65" Smart Google TV 4K	Gracias a la tecnología HDR10, disfruta de imágenes más claras y realistas en cada escena. Sumérgete en el sonido envolvente Dolby Atmos, que hace que cada película, serie o juego sea más emocionante.	Gracias a la tecnología HDR10, disfruta de imágenes más claras y realistas en cada escena. Sumérgete en el sonido envolvente Dolby Atmos, que hace que cada película, serie o juego sea más emocionante.	2395000.00	\N	2175000.00	\N	\N	10	5	12	\N	f	t	3	0	0.00	0	2026-01-15 18:54:02.647609	2026-05-25 14:18:55.749323	{}	[]	f	\N	\N
385	1	95	30	COLCH-N-SILVER-PILLOW-140X190	Colchón Silver Pillow 140x190	Silver Pillow Special de resortes, con firmezas intermedias, pero con un sutil confort, sistema pillow, proporciona comodidad y un excelente soporte de peso.Unidad resortada Bonell Units, soportes en espuma particle foam en la zona más pesada del cuerpo y que además evita deformaciones en la mitad del colchón.	Silver Pillow Special de resortes, con firmezas intermedias, pero con un sutil confort, sistema pillow, proporciona comodidad y un excelente soporte de peso.Unidad resortada Bonell Units, soportes en espuma particle foam en la zona más pesada del cuerpo y que además evita deformaciones en la mitad del colchón.	2405000.00	\N	\N	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 16:37:12.529324	2026-05-25 14:18:55.777281	{}	[]	f	\N	\N
813	4	111	7	62510113900	MH 710	Peso101kg, 7HP, cilindrada 252 cm³, Motor 4T a gasolina, alta intensidad de uso.	Peso101kg, 7HP, cilindrada 252 cm³, Motor 4T a gasolina, alta intensidad de uso.	7000000.00	\N	5970000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.945824	2026-05-25 14:18:55.777281	{}	[]	f	\N	\N
512	1	99	2	K-DAG2"B	DISPENSADOR DE AGUA BLANCO KALLEY DE PISO PARA BOTELLÓN K-DAG2	Dispensador de agua fría y caliente: Permite elegir entre agua fría o agua caliente dependiendo de tu necesidad. Botellón superior: Admite botellones de 5 galones. Enfriamiento por compresor: Permite bajar el nivel de temperatura del agua hasta 10°C. Capacidad de calentamiento 90 °C - 5 l/h: En una hora, la temperatura de 5 litros de agua puede aumentar hasta 90 °C. Gabinete de almacenamiento de 8.4 litros: Compartimiento con capacidad ideal para guardar algunos de tus alimentos favoritos.	Dispensador de agua fría y caliente: Permite elegir entre agua fría o agua caliente dependiendo de tu necesidad. Botellón superior: Admite botellones de 5 galones. Enfriamiento por compresor: Permite bajar el nivel de temperatura del agua hasta 10°C. Capacidad de calentamiento 90 °C - 5 l/h: En una hora, la temperatura de 5 litros de agua puede aumentar hasta 90 °C. Gabinete de almacenamiento de 8.4 litros: Compartimiento con	635000.00	\N	570000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.194321	2026-05-25 14:23:08.253842	{"Potencia": "de enfriamiento 75W: Permite alcanzar la temperatura ideal en menor tiempo", "Capacidad": "ideal para guardar algunos de tus alimentos favoritos"}	[]	f	\N	\N
513	1	99	2	K-DAF"B	DISPENSADOR DE AGUA KALLEY DE PISO PARA RED HIDRÁULICA K-DAF	Dispensador de agua fría y caliente: Permite elegir entre agua fría o agua caliente dependiendo de tu necesidad. Enfriamiento por compresor: Permite bajar la temperatura del agua a niveles óptimos, incluso en lugares donde la temperatura del ambiente es muy elevada. Capacidad de calentamiento 90 °C - 5 l/h: En una hora, la temperatura de 5 litros de agua puede aumentar hasta 90 °C. Potencia de enfriamiento 75W: Permite alcanzar la temperatura ideal en menor tiempo. Mayor eficiencia. Capacida	Dispensador de agua fría y caliente: Permite elegir entre agua fría o agua caliente dependiendo de tu necesidad. Enfriamiento por compresor: Permite bajar la temperatura del agua a niveles óptimos, incluso en lugares donde la temperatura del ambiente es muy elevada. Capacidad de calentamiento 90 °C - 5 l/h: En una hora, la temperatura de 5 litros de agua puede aumentar hasta 90 °C	960000.00	\N	865000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.236028	2026-05-25 14:23:08.254482	{"Potencia": "de enfriamiento 75W: Permite alcanzar la temperatura ideal en menor tiempo"}	[]	f	\N	\N
514	1	100	2	K-LAVSA7B/K	LAVADORA KALLEY SEMI AUTOMÁTICA 7 KILOGRAMOS K-LAVSA7B	La lavadora doble tina KALLEY K-LAVSA7B Blanca con capacidad de 7kgs de lavado y 4,6kgs de centrifugado. Cuenta con tinas independientes para lavado y centrifugado. La tapa de lavado es removible para facilitar la carga y descarga de la ropa. Su manejo es muy sencillo, el panel de control tiene temporizador de lavado y centrifugado, además 2 niveles de lavado: Normal y fuerte. La garantía del producto es de 1 año. ¿Qué esperas para comprarla? Lavadora semi automática Kalley: Con su potencia de	La lavadora doble tina KALLEY K-LAVSA7B Blanca con capacidad de 7kgs de lavado y 4,6kgs de centrifugado. Cuenta con tinas independientes para lavado y centrifugado. La tapa de lavado es removible para facilitar la carga y descarga de la ropa. Su manejo es muy sencillo, el panel de control tiene temporizador de lavado y centrifugado, además 2 niveles de lavado: Normal y fuerte. La	810000.00	\N	725000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.268558	2026-05-25 14:23:08.255094	{"Garantía": "del producto es de 1 año", "Eficiencia": "energética tipo A para menor consumo"}	[]	f	\N	\N
786	4	43	7	41342000442	FS 250	Peso 7Kg, potencia 2.14 Hp/ 1.9 Kw, cilindrada 40,2 cm³, autocut y cuchilla 3 p.	Peso 7Kg, potencia 2.14 Hp/ 1.9 Kw, cilindrada 40,2 cm³, autocut y cuchilla 3 p.	2120000.00	\N	1810000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 22:02:35.10824	2026-05-25 14:23:08.262577	{"Peso": "7Kg"}	[]	f	\N	\N
498	1	4	2	K-GTV40G200	TV KALLEY 40" K-TV40G200 FHD	Pantalla LED Full HD de 40″ con compatibilidad HDR10: Proporciona imágenes nítidas y colores vibrantes con un contraste mejorado gracias al soporte HDR10 Sistema operativo Google TV con más de 10.000 apps: Ofrece acceso a una amplia variedad de aplicaciones, juegos y contenido personalizado mediante perfiles de usuario Control por voz con Google Assistant integrado: Permite manejar el televisor mediante comandos de voz usando el control remoto, facilitando la búsqueda de contenido y control d	Pantalla LED Full HD de 40″ con compatibilidad HDR10: Proporciona imágenes nítidas y colores vibrantes con un contraste mejorado gracias al soporte HDR10 Sistema operativo Google TV con más de 10.000 apps: Ofrece acceso a una amplia variedad de aplicaciones, juegos y contenido personalizado mediante perfiles de usuario Control por voz con Google Assistant integrado: Permite manejar el televisor mediante comandos de voz usando el control remoto, facilitando la búsqueda de contenido y control de funciones Dolby Audio con potencia de 20 W: Brinda una experiencia de sonido envolvente y clara con buena potencia, ideal para películas y música Perfiles personalizados, incluyendo control parental: Permite crear cuentas para niños con restricciones de contenido y tiempos de uso específicos Conectividad completa (Wi‑Fi, Bluetooth, HDMI ×2, USB ×1, Ethernet, Chromecast/FastCast): Facilita la conexión a internet, dispositivos externos y transmisión desde móviles Sintonizador DVB‑T2 integrado: Permite recepción de señal de TV abierta en alta definición sin necesidad de decodificador adicional	1010000.00	\N	915000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:23.844505	2026-05-25 14:18:55.777281	{}	[]	f	\N	\N
526	1	102	2	K-TFB	VENTILADOR BLANCO DE PISO KALLEY TORRE K-TFB	Ventilador de torre digital KALLEY K-TFB, perfecto para tener un ambiente fresco y cómodo, con potencia de 45W, 6 velocidad, 3 modos y giro de 60° se adapta a tus necesidades. Puedes programarlo hasta 12 horas. Su iluminación LED y pantalla digital añaden un toque moderno y el control remoto permite ajustarlo fácilmente desde cualquier lugar. Que esperas para comprarlo! Ventilador de torre Kalley: El ventilador de torre Kalley es tu nuevo aliado para combatir los calores con sus 6 velocidades y	Ventilador de torre digital KALLEY K-TFB, perfecto para tener un ambiente fresco y cómodo, con potencia de 45W, 6 velocidad, 3 modos y giro de 60° se adapta a tus necesidades. Puedes programarlo hasta 12 horas. Su iluminación LED y pantalla digital añaden un toque moderno y el control remoto permite ajustarlo fácilmente desde cualquier lugar. Que esperas para comprarlo! Ventilador de torre Kalley: El ventilador de torre Kalley es tu nuevo aliado para combatir los calores con sus 6 velocidades y 3 modos de ventilación el calor ya no será un impedimento para tus tareas del día a día. Ventilador de torre con oscilación y pantalla digital: Refresca tus espacios con estilo y eficiencia gracias a este ventilador Kalley. Su oscilación horizontal de 60° distribuye el aire de manera uniforme, cubriendo más área para un confort total. La pantalla digital con iluminación LED te visualizar el estado del ventilador, aportando un toque moderno a tu hogar. Ideal para mantenerte fresco en cualquier momento, con la calidad y confianza que solo Kalley te ofrece. Control total y comodidad a tu alcance: ¡Disfruta de un ambiente fresco sin preocuparte por apagar el ventilador! Gracias a su temporizador programable de hasta 12 horas y control remoto incluido, podrás ajustar la ventilación a tu gusto y dejar que el equipo se apague automáticamente. Perfecto para noches de descanso o jornadas de trabajo sin interrupciones.	410000.00	\N	370000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.574144	2026-05-25 14:18:55.777281	{}	[]	f	\N	\N
511	1	99	2	K-DAM"G	DISPENSADOR DE AGUA KALLEY K-DAM	El dispensador de Agua KALLEY K-DAM Gris de mesa para botellón de 5 galones en la parte superior te brinda agua caliente (5 litros/hora) o fria (2 Litros/ Hora) para disfrutar cada una de tus bebidas. Es fácil de usar y su tamaño es muy práctico para ubicar sobre mesas u otras superficies. Además su sistema de enfriamiento es por compresor, lo cual lo hace mucho más eficiente. Cuenta con garantía de 1 año. ¿Qué esperas para comprarlo? Botellón Superior: Admite botellones de 5 galones. Dispensa	El dispensador de Agua KALLEY K-DAM Gris de mesa para botellón de 5 galones en la parte superior te brinda agua caliente (5 litros/hora) o fria (2 Litros/ Hora) para disfrutar cada una de tus bebidas. Es fácil de usar y su tamaño es muy práctico para ubicar sobre mesas u otras superficies. Además su sistema de enfriamiento es por compresor, lo cual lo hace mucho más eficiente. Cuenta con	600000.00	\N	540000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.167593	2026-05-25 14:23:08.253239	{"Garantía": "de 1 año"}	[]	f	\N	\N
522	1	102	2	K-TF45N	VENTILADOR DE TORRE NEGRO KALLEY K-TF45	Ventilador de torre digital, con 3 velocidades y 3 modos para que lo ajustes a tus necesidades. Puedes programarlo para que se apague automáticamente en la noche (máximo 7 horas de programación) y la pantalla LED se apaga en la noche para no interferir con tu descanso. Gira hasta 60° permitiendo una mejor cobertura de la habitación. Incluye control remoto pensando en tu comodidad. Potencia 45 W: Bajo consumo de energía para un mejor desempeño. 3 velocidad: Bajo, media y alta para adaptar el a	Ventilador de torre digital, con 3 velocidades y 3 modos para que lo ajustes a tus necesidades. Puedes programarlo para que se apague automáticamente en la noche (máximo 7 horas de programación) y la pantalla LED se apaga en la noche para no interferir con tu descanso. Gira hasta 60° permitiendo una mejor cobertura de la habitación. Incluye control remoto pensando en tu comodidad. Potencia 45 W: Bajo consumo de energía para un mejor desempeño. 3 velocidad: Bajo, media y alta para adaptar el ambiente a tu gusto. Modo: El ventilador cuenta con 3 modos de ventilación: normal, natural y noche. Temporizador: Máximo 7h con incremento de 1 hora. programa tu ventilador para que se apague automáticamente . Giro 60: Ajusta la dirección del aire de acuerdo con tus preferencias. Protección contra sobrecalentamiento de motor: El ventilador se apaga. evitando daños en el motor, cuando las temperaturas en el bobinado del motor están por encima de la temperatura de operación normal. Oscilación: Estas funciones te dan un mayor confort: Modo Nocturno: La pantalla LED se apaga en la noche para no interferir con tu descanso. Incluye control remoto: Controla sus funciones de manera inalámbrica.	280000.00	\N	250000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.493231	2026-05-25 14:23:08.257934	{"Pantalla": "LED se apaga en la noche para no interferir con tu descanso", "Potencia": "45 W: Bajo consumo de energía para un mejor desempeño", "Velocidades": "y 3 modos para que lo ajustes a tus necesidades"}	[]	f	\N	\N
525	1	102	2	K-VP20HS	VENTILADOR ALTA POTENCIA NEGRO Y PLATEADO KALLEY K-VP20HS	¿Desesperado por el calor intenso en tu hogar? El Ventilador Alta Potencia KALLEY K-VP20HS Negro es la solución perfecta. Con 200W de potencia, este ventilador garantiza un flujo de aire fuerte y constante, refrescando incluso las zonas más cálidas y grandes. Su diseño sobrio y resistente en metal reforzado ofrece durabilidad y estilo. Disfruta de su modo ultra silencioso para mayor comodidad. Ajusta la dirección del aire con sus 120° de inclinación y elige entre sus 3 velocidades para un confor	¿Desesperado por el calor intenso en tu hogar? El Ventilador Alta Potencia KALLEY K-VP20HS Negro es la solución perfecta. Con 200W de potencia, este ventilador garantiza un flujo de aire fuerte y constante, refrescando incluso las zonas más cálidas y grandes. Su diseño sobrio y resistente en metal reforzado ofrece durabilidad y estilo. Disfruta de su modo ultra silencioso para mayor comodidad. Ajusta la dirección del aire con sus 120° de inclinación y elige entre sus 3 velocidades para un confort personalizado. ¡No esperes más y adquiere el tuyo hoy! Compra ahora. Potencia 200 W: Alta potencia para mayor desempeño. 3 velocidades: Baja, media y alta para adaptar el ambiente a tu gusto. Flujo de aire de alta velocidad: Refresca aun en zonas muy cálidas con un flujo de aire mayor al de un ventilador común. 120° de inclinación: Ajusta la dirección del aire de acuerdo con tus preferencias. Aspas de 20": Aspas de gran tamaño para refrescar una mayor área. Ventilador de metal reforzado: Diseño sobrio y resistente Dimensiones y pesos: LxWxH (Producto) 620 x 600 x 150 mm - Peso (Producto) 6.8 kg	385000.00	\N	345000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.534741	2026-05-25 14:23:08.258325	{"Aspas": "de 20\\": Aspas de gran tamaño para refrescar una mayor área", "Potencia": "200 W: Alta potencia para mayor desempeño", "Velocidades": "para un confort personalizado"}	[]	f	\N	\N
527	1	102	2	K-VAP26W	VENTILADOR NEGRO KALLEY PARED K-VAP26W	Potencia 230 W: Mas flujo de aire, más potencia, mayor confort. 3 velocidades: Bajo, medida y alta para adopta el ambiente a tu gusta. Giro manual 90: Ajustan la dirección del aire de cuerdo con tus preferencias. Para poner la girar el ventilador suelte el tornillo del oscilador y mueve a la posición que necesite. (Mientras más afuera mayor Angulo de oscuridad) luego aprieta el tornillo. Dirección de aire ajustado: Ajusta la dirección de aire acuerdo con tus preferencias. Sistema de fijac	Potencia 230 W: Mas flujo de aire, más potencia, mayor confort. 3 velocidades: Bajo, medida y alta para adopta el ambiente a tu gusta. Giro manual 90: Ajustan la dirección del aire de cuerdo con tus preferencias. Para poner la girar el ventilador suelte el tornillo del oscilador y mueve a la posición que necesite. (Mientras más afuera mayor Angulo de oscuridad) luego aprieta el tornillo. Dirección de aire ajustado: Ajusta la dirección de aire acuerdo con tus preferencias	480000.00	\N	435000.00	\N	\N	10	5	12	\N	f	t	0	0	0.00	0	2026-01-15 18:39:24.589617	2026-05-25 14:23:08.25871	{"Sistema": "de fijación a la pared: Obtén una buena distribución de aire"}	[]	f	\N	\N
528	1	102	2	K-VAP26P	VENTILADOR DE PEDESTAL NEGRO KALLEY K-VAP26P	¿Te gusta tener tu casa fresca? El Ventilador de Pedestal KALLEY K-VAP26P Negro es la solución perfecta. Con 230W de potencia y aspas de 26 pulgadas, refresca grandes áreas con facilidad. Sus 3 velocidades ajustables y rotación de 90° te permiten dirigir el aire donde más lo necesitas. Disfruta de su estructura metálica desarmable, fácil de limpiar, y altura regulable para mayor versatilidad. Ideal para cualquier espacio, ofrece control total sobre tu comodidad. ¡No esperes más y transforma tu h	¿Te gusta tener tu casa fresca? El Ventilador de Pedestal KALLEY K-VAP26P Negro es la solución perfecta. Con 230W de potencia y aspas de 26 pulgadas, refresca grandes áreas con facilidad. Sus 3 velocidades ajustables y rotación de 90° te permiten dirigir el aire donde más lo necesitas. Disfruta de su estructura metálica desarmable, fácil de limpiar, y altura regulable para mayor versatilidad. Ideal para cualquier espacio, ofrece control total sobre tu comodidad. ¡No esperes más y transforma tu hogar con frescura y confort! Compra ahora y siente la diferencia. Este ventilador es perfecto para tu comodidad en cualquier momento del día ya que cuenta con características excepcionales que te ofrece la libertad de disfrutar de un fresco ambiente. Su giro manual de 90° te permite dirigir el flujo de aire hacia donde más lo necesitas y ajustar la dirección del aire hacia arriba o abajo ¡Tú decides! No importa si necesitas un suave susurro para dormir, una brisa moderada para trabajar o un poderoso vendaval para combatir el calor, nuestro ventilador de 3 velocidades te ofrece el control total sobre la intensidad del flujo de aire. Este tipo de ventilador con diseño desarmable y altura ajustable te brinda la libertad de disfrutar de la frescura en cualquier lugar y en cualquier momento. Altura ajustable adaptado a tus necesidades; su altura mínima 1.62m y máxima 1.97m para encontrar la posición perfecta para cada ocasión, brindándote el control total sobre tu confort. Aspas de 26 pulgadas: Este tamaño de aspas te brindad un flujo de aire más amplio que puede refrescar una mayor área; puedes ubicarlo como salas de estar, dormitorios grandes o áreas abiertas. No olvides, su potencia es de 230 W que hacen de este ventilador de alta potencia, un complemento perfecto para refrescar tus espacios. Estructura desarmable y rejilla metálica: Fácil de guardar y limpiar, además sus piezas plásticas brindan mayor durabilidad. Giro manual 90°: Ajusta la dirección del aire de acuerdo con tus preferencias. Para poner a girar el ventilador suelte el tornillo del oscilador y muévalo a la posición que necesite. (Mientras más afuera mayor ángulo de oscilación) luego apriete el tornillo.	545000.00	\N	490000.00	\N	\N	10	5	12	\N	f	t	3	0	0.00	0	2026-01-15 18:39:24.617925	2026-05-25 14:23:08.259232	{"Altura": "regulable para mayor versatilidad", "Velocidades": "te ofrece el control total sobre la intensidad del flujo de aire"}	[]	f	\N	\N
\.


--
-- Data for Name: resenas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.resenas (id_resena, id_producto, id_usuario, id_pedido, calificacion, titulo, comentario, verificado, aprobado, util_count, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: sede_inventario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sede_inventario (id_inventario, id_sede, id_producto, stock, stock_minimo, ubicacion_fisica, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: sedes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sedes (id_sede, nombre, codigo, departamento, ciudad, direccion, telefono, celular, email, whatsapp, latitud, longitud, horario_atencion, servicios, imagen_url, es_principal, activo, fecha_apertura, fecha_creacion, link_google_maps) FROM stdin;
1	Ceveco Riosucio	RS001	Caldas	Riosucio	Cl. 9 #575	3218108179	+573001234567	riosucio@ceveco.com.co	+573001234567	5.42129850	-75.70379800	Lunes a Viernes: 7:30 AM - 12:00 PM | 2:00 PM - 6:00 PM\nSábados: 7:30 AM - 1:00 PM	\N	\N	t	t	\N	2025-12-04 14:30:43.98025	https://www.google.com/maps/place/CEVECO+S.A.S/@5.1594593,-75.959166,11z/data=!4m10!1m2!2m1!1sceveco+la+virgunia!3m6!1s0x8e470785607d6591:0x81328d9b87aa18f2!8m2!3d5.4212985!4d-75.703798!15sChJjZXZlY28gbGEgdmlyZ2luaWFaFCISY2V2ZWNvIGxhIHZpcmdpbmlhkgEPYXBwbGlhbmNlX3N0b3Jl4AEA!16s%2Fg%2F11c44d5ksb?entry=ttu
3	Ceveco Supía	SP001	Caldas	Supía	Supia-Caramanta #33-2 a 33-80	3127449591	\N	\N	\N	5.45642450	-75.65055180	Lunes a Viernes: 7:30 AM - 12:00 PM | 2:00 PM - 6:00 PM\nSábados: 7:30 AM - 1:00 PM	\N	\N	f	t	\N	2025-12-10 21:06:18.198463	https://www.google.com/maps/place/Ceveco/@5.4388828,-75.6874746,15z/data=!4m10!1m2!2m1!1sceveco+supia!3m6!1s0x8e470703af2f6077:0xfdd6e3bf39629ce0!8m2!3d5.4564245!4d-75.6505518!15sCgxjZXZlY28gc3VwaWGSARFnb3Zlcm5tZW50X29mZmljZeABAA!16s%2Fg%2F11rbyxdd2g?entry=ttu
4	Ceveco La Virginia	LV001	Risaralda	La Virginia	Cra. 5a #9-21	3105348479	\N	\N	\N	4.89697870	-75.88492240	Lunes a Viernes: 7:30 AM - 12:00 PM | 2:00 PM - 6:00 PM\nSábados: 7:30 AM - 1:00 PM	\N	\N	f	t	\N	2025-12-10 21:06:18.20456	https://www.google.com/maps/place/Ceveco+La+Virginia/@5.1594593,-75.959166,11z/data=!4m10!1m2!2m1!1sceveco+la+virgunia!3m6!1s0x8e4689ef47a7c443:0x93f96a2d2f69d2af!8m2!3d4.8969787!4d-75.8849224!15sChJjZXZlY28gbGEgdmlyZ2luaWFaFCISY2V2ZWNvIGxhIHZpcmdpbmlhkgERZWxlY3Ryb25pY3Nfc3RvcmXgAQA!16s%2Fg%2F11gsbbx_cj?entry=ttu
5	Ceveco La Pintada	LP001	Antioquia	La Pintada	av 30, EL CRUCERO, Rafael Uribe Uribe	3146302935	\N	\N	\N	5.74037980	-75.60639250	Lunes a Viernes: 7:30 AM - 12:00 PM | 2:00 PM - 6:00 PM\nSábados: 7:30 AM - 1:00 PM	\N	\N	f	t	\N	2025-12-10 21:06:18.20606	https://www.google.com/maps/place/CEVECO+S.A.S/@5.7378352,-75.6075257,17.5z/data=!4m10!1m2!2m1!1sceveco+la+pintada!3m6!1s0x8e46f17cc3c27c77:0x232444c29ca9d086!8m2!3d5.7403798!4d-75.6063925!15sChFjZXZlY28gbGEgcGludGFkYVoTIhFjZXZlY28gbGEgcGludGFkYZIBD2FwcGxpYW5jZV9zdG9yZeABAA!16s%2Fg%2F11fp3gqx7_?entry=ttu
6	Ceveco Anserma	AN001	Caldas	Anserma	Cra. 4 #1446	3128859141	\N	\N	\N	5.23431580	-75.78595930	Lunes a Viernes: 7:30 AM - 12:00 PM | 2:00 PM - 6:00 PM\nSábados: 7:30 AM - 1:00 PM	\N	\N	f	t	\N	2025-12-10 21:06:18.207606	https://www.google.com/maps/place/Ceveco+Anserma/@5.2343433,-75.7859615,16z/data=!4m10!1m2!2m1!1sceveco+anserma!3m6!1s0x8e47a1e0d04f692d:0x36395836e4792d8!8m2!3d5.2343158!4d-75.7859593!15sCg5jZXZlY28gYW5zZXJtYeABAA!16s%2Fg%2F11kmn1p2y_?entry=ttu
\.


--
-- Data for Name: subcategorias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subcategorias (id_subcategoria, id_categoria, nombre, slug, descripcion, activo, fecha_creacion) FROM stdin;
1	1	Lavadoras	lavadoras	\N	t	2025-12-04 14:30:43.98025
2	1	Neveras	neveras	\N	t	2025-12-04 14:30:43.98025
3	1	Estufas	estufas	\N	t	2025-12-04 14:30:43.98025
4	1	Televisores	televisores	\N	t	2025-12-04 14:30:43.98025
5	1	Microondas	microondas	\N	t	2025-12-04 14:30:43.98025
6	1	Licuadoras	licuadoras	\N	t	2025-12-04 14:30:43.98025
7	1	Cafeteras	cafeteras	\N	t	2025-12-04 14:30:43.98025
8	1	Aires Acondicionados	aires-acondicionados	\N	t	2025-12-04 14:30:43.98025
9	1	Ventiladores	ventiladores	\N	t	2025-12-04 14:30:43.98025
10	1	Calentadores	calentadores	\N	t	2025-12-04 14:30:43.98025
11	1	Planchas	planchas	\N	t	2025-12-04 14:30:43.98025
12	1	Aspiradoras	aspiradoras	\N	t	2025-12-04 14:30:43.98025
13	1	Secadoras	secadoras	\N	t	2025-12-04 14:30:43.98025
14	1	Hornos	hornos	\N	t	2025-12-04 14:30:43.98025
15	1	Campanas	campanas	\N	t	2025-12-04 14:30:43.98025
16	1	Congeladores	congeladores	\N	t	2025-12-04 14:30:43.98025
17	1	Equipos de Sonido	equipos-sonido	\N	t	2025-12-04 14:30:43.98025
18	1	Barras de Sonido	barras-sonido	\N	t	2025-12-04 14:30:43.98025
19	1	Teatros en Casa	teatros-casa	\N	t	2025-12-04 14:30:43.98025
20	2	Escritorios	escritorios	\N	t	2025-12-04 14:30:43.98025
21	2	Sillas	sillas	\N	t	2025-12-04 14:30:43.98025
22	2	Estanterías	estanterias	\N	t	2025-12-04 14:30:43.98025
23	2	Mesas	mesas	\N	t	2025-12-04 14:30:43.98025
24	2	Camas	camas	\N	t	2025-12-04 14:30:43.98025
25	2	Closets	closets	\N	t	2025-12-04 14:30:43.98025
26	2	Comedores	comedores	\N	t	2025-12-04 14:30:43.98025
27	2	Salas	salas	\N	t	2025-12-04 14:30:43.98025
28	2	Bibliotecas	bibliotecas	\N	t	2025-12-04 14:30:43.98025
29	2	Organizadores	organizadores	\N	t	2025-12-04 14:30:43.98025
30	2	Muebles de Cocina	muebles-cocina	\N	t	2025-12-04 14:30:43.98025
31	2	Muebles de Baño	muebles-bano	\N	t	2025-12-04 14:30:43.98025
33	2	Bases de Cama	bases-cama	\N	t	2025-12-04 14:30:43.98025
34	3	Motos Urbanas	motos-urbanas	\N	t	2025-12-04 14:30:43.98025
35	3	Motos Deportivas	motos-deportivas	\N	t	2025-12-04 14:30:43.98025
36	3	Motos de Trabajo	motos-trabajo	\N	t	2025-12-04 14:30:43.98025
37	3	Motos Scooter	motos-scooter	\N	t	2025-12-04 14:30:43.98025
38	3	Motos Enduro	motos-enduro	\N	t	2025-12-04 14:30:43.98025
39	3	Accesorios para Motos	accesorios-motos	\N	t	2025-12-04 14:30:43.98025
40	3	Cascos	cascos	\N	t	2025-12-04 14:30:43.98025
41	3	Repuestos	repuestos	\N	t	2025-12-04 14:30:43.98025
42	4	Motosierras	motosierras	\N	t	2025-12-04 14:30:43.98025
43	4	Guadañas	guadanas	\N	t	2025-12-04 14:30:43.98025
44	4	Sopladores	sopladores	\N	t	2025-12-04 14:30:43.98025
45	4	Cortasetos	cortasetos	\N	t	2025-12-04 14:30:43.98025
46	4	Podadoras	podadoras	\N	t	2025-12-04 14:30:43.98025
47	4	Fumigadoras	fumigadoras	\N	t	2025-12-04 14:30:43.98025
48	4	Accesorios STIHL	accesorios-stihl	\N	t	2025-12-04 14:30:43.98025
49	4	Repuestos STIHL	repuestos-stihl	\N	t	2025-12-04 14:30:43.98025
50	1	Freidoras	freidoras	\N	t	2025-12-04 14:31:23.926711
51	1	Dispensadores	dispensadores	\N	t	2025-12-04 14:31:23.926711
52	1	Vitrinas	vitrinas	\N	t	2025-12-04 14:31:23.926711
66	3	Motos Semiautomáticas	motos-semiautomaticas	\N	t	2025-12-04 15:47:00.221404
67	3	Motocarros	motocarros	\N	t	2025-12-04 15:47:00.221404
77	1	Electrodomésticos	electrodomesticos	\N	t	2025-12-22 10:47:34.666269
78	2	Archivadores	archivadores	\N	t	2025-12-22 10:47:34.864202
79	1	Audio y Sonido	audio-y-sonido	\N	t	2025-12-22 10:47:34.911566
80	4	Herramientas STIHL	herramientas-stihl	\N	t	2025-12-22 12:11:19.301086
81	2	Muebles	muebles	\N	t	2025-12-22 12:31:08.018337
82	3	Motocicletas Sport	motocicletas-sport	\N	t	2025-12-22 23:30:36.080373
83	3	Motocicletas	motocicletas	\N	t	2025-12-22 23:30:36.251935
84	3	Motocicletas Enduro	motocicletas-enduro	\N	t	2025-12-22 23:30:36.275451
85	3	Urbanas	urbanas	\N	t	2026-01-14 16:17:01.921649
86	1	Televisor	televisor	\N	t	2026-01-14 16:17:10.28217
87	1	Torre de sonido	torre-de-sonido	\N	t	2026-01-14 16:17:10.669952
88	1	Parlante	parlante	\N	t	2026-01-14 16:17:10.731505
89	1	Lavadora	lavadora	\N	t	2026-01-14 16:17:10.832542
90	1	Lavaseca	lavaseca	\N	t	2026-01-14 16:17:10.885664
91	1	Nevera	nevera	\N	t	2026-01-14 16:17:10.956075
92	1	Nevecon	nevecon	\N	t	2026-01-14 16:17:10.977382
95	1	Colchones	colchones	\N	t	2026-01-15 16:36:39.577887
96	3	Sport	sport	\N	t	2026-01-15 17:51:10.838374
97	3	Automática	automtica	\N	t	2026-01-15 17:51:11.17089
98	3	Todo Terreno	todo-terreno	\N	t	2026-01-15 17:51:11.390389
99	1	Otros	otros	\N	t	2026-01-15 18:39:23.922978
100	1	Lavado	lavado	\N	t	2026-01-15 18:39:24.266478
101	1	Refrigeración	refrigeracin	\N	t	2026-01-15 18:39:24.344526
102	1	Climatización	climatizacin	\N	t	2026-01-15 18:39:24.388656
103	1	Motosierras	motosierras	\N	t	2026-01-15 19:41:19.605599
104	1	Guadañas	guadaas	\N	t	2026-01-15 19:41:20.007334
105	1	Fumigadoras	fumigadoras	\N	t	2026-01-15 19:41:20.46617
106	1	Cortasetos	cortasetos	\N	t	2026-01-15 19:41:20.673029
107	1	Hidrolavadoras	hidrolavadoras	\N	t	2026-01-15 19:41:20.735987
108	1	Motoazadas	motoazadas	\N	t	2026-01-15 19:41:20.865417
109	4	Aspiradoras	aspiradoras	\N	t	2026-01-15 19:43:38.648809
110	4	Hidrolavadoras	hidrolavadoras	\N	t	2026-01-15 19:43:38.740448
111	4	Motoazadas	motoazadas	\N	t	2026-01-15 19:43:38.896754
112	2	Sistemas de Audio Profesional	sistemas-de-audio-profesional	\N	t	2026-01-16 13:23:41.813311
113	2	Equipos de Audio de Alta Fidelidad	equipos-de-audio-de-alta-fidelidad	\N	t	2026-01-16 13:23:41.927434
114	2	Sistemas de Sonido de Alto Desempeño	sistemas-de-sonido-de-alto-desempeno	\N	t	2026-01-16 13:23:41.952814
115	2	Sofa Cama	sofa-cama	\N	t	2026-01-16 13:23:41.978177
116	2	Somier Tapizados	somier-tapizados	\N	t	2026-01-16 13:23:42.004165
117	2	Salas - Sofas	salas---sofas	\N	t	2026-01-16 13:23:42.102841
118	2	Varios	varios	\N	t	2026-01-16 13:23:42.296595
119	2	Archivador	archivador	\N	t	2026-01-16 13:23:42.389174
120	2	Armarios Inval	armarios-inval	\N	t	2026-01-16 13:23:42.406019
121	2	Varios RTA	varios-rta	\N	t	2026-01-16 13:23:42.440227
122	2	Cabinas de Sonido Portátiles	cabinas-de-sonido-portatiles	\N	t	2026-01-16 13:40:03.018418
123	2	Cabinas de Sonido de Gran Formato	cabinas-de-sonido-de-gran-formato	\N	t	2026-01-16 13:40:03.084268
124	2	Camas - Alcobas	camas---alcobas	\N	t	2026-01-16 13:40:04.22805
125	2	Colchones	colchones-4305	\N	t	2026-01-16 13:40:04.305824
126	3	Trabajo	trabajo	\N	t	2026-01-16 13:42:49.195848
127	3	Trabajo / Seguridad	trabajo--seguridad	\N	t	2026-01-16 13:42:49.25078
128	3	Trabajo / Clásica	trabajo--clasica	\N	t	2026-01-16 13:42:49.269454
129	3	Semiautomática	semiautomatica	\N	t	2026-01-16 13:42:49.304881
130	3	Enduro / Aventura	enduro--aventura	\N	t	2026-01-16 13:42:49.450036
131	3	Enduro / Seguridad	enduro--seguridad	\N	t	2026-01-16 13:42:49.469154
132	3	Sport / Seguridad	sport--seguridad	\N	t	2026-01-16 13:42:49.509733
133	3	Sport Carenada	sport-carenada	\N	t	2026-01-16 13:42:49.532953
134	3	Aventura	aventura	\N	t	2026-01-16 13:42:49.575026
135	3	Sport Naked	sport-naked	\N	t	2026-01-16 13:42:49.587292
136	3	Super Sport	super-sport	\N	t	2026-01-16 13:42:49.605296
137	3	Trail / Aventura	trail--aventura	\N	t	2026-01-16 13:42:49.641245
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (id_session, id_usuario, token_hash, ip_address, user_agent, device_info, es_activa, fecha_creacion, fecha_expiracion, fecha_ultimo_acceso) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id_usuario, email, password_hash, nombre, apellido, telefono, celular, tipo_documento, numero_documento, fecha_nacimiento, genero, avatar_url, rol, activo, email_verificado, token_verificacion, token_recuperacion, fecha_ultimo_acceso, fecha_creacion, fecha_actualizacion, auth_method, fecha_recuperacion_expira) FROM stdin;
1	test@ceveco.com	$2a$12$Ly0TMU537FfrjdxQbyySneG7AUeoHRYs2ubsTpnNTF46T4uijrFIi	Usuario Test	\N	\N	\N	CC	\N	\N	\N	\N	cliente	t	f	\N	\N	2025-12-05 11:16:01.561692	2025-12-05 11:10:36.761959	2025-12-05 11:16:01.561692	local	\N
2	testuser_1764954304618@example.com	$2a$12$cQLFhZf5XmjRY18ilkTevu9MSmF0qRvfrk1ClAR6dpxhFn6pXxaNi	TestUser	\N	\N	1234567890	CC	\N	\N	\N	\N	cliente	t	f	\N	\N	\N	2025-12-05 12:05:32.409772	2025-12-05 12:05:32.409772	local	\N
7	sebgameover5@gmail.com	$2a$12$IlQnk4tj1mAtHCJKRDe.7eTYkATmKtDtTfmXybbSRUAuKa4xV4ERC	Sebastian 	Guerrero Arias	\N	3226749257	CC	\N	\N	\N	\N	cliente	t	f	\N	\N	2025-12-10 19:14:24.977442	2025-12-08 22:35:21.206463	2025-12-10 19:14:24.977442	local	\N
3	testauth_1764978811@example.com	$2a$12$NSjeRZPUHZSEEz1md1YgYuHNM1P1yZhPGbCADy3uNA4OjbdgHfqEC	Usuario Test	\N	\N	3001234567	CC	\N	\N	\N	\N	cliente	t	f	\N	\N	2025-12-06 09:27:16.201757	2025-12-05 19:10:27.530555	2025-12-06 09:27:16.201757	local	\N
4	subagent_1765034435612@test.com	$2a$12$jxJ4ZC1FFyZz8VzrhBnA8O1H3JYwDRCvMCRa8SebSuy5Gnlv78hWu	Test Subagent	\N	\N	3000000000	CC	\N	\N	\N	\N	cliente	t	f	\N	\N	\N	2025-12-06 10:20:36.229234	2025-12-06 10:20:36.229234	local	\N
5	testuser_2@example.com	$2a$12$tOrMMk4AAhtqjQE/A3Uqye24RYDh8qHy5KUH1MFaXA66Av1hxXcvi	Test User	\N	\N	3001234567	CC	\N	\N	\N	\N	cliente	t	f	\N	\N	2025-12-06 11:10:06.350027	2025-12-06 11:05:22.204053	2025-12-06 11:10:06.350027	local	\N
6	dahellonline@gmail.com	$2a$12$X911mbvS0IL/zs1PscvVkeA6M/OMy5iKJIO1Jz2m3ZQsm2voK9yNW	alesander	\N	\N	3132771498	CC	\N	\N	\N	\N	cliente	t	f	\N	\N	2025-12-06 14:46:59.90795	2025-12-06 13:07:17.959445	2025-12-06 14:46:59.90795	local	\N
8	test_script_1765315010339@test.com	$2a$12$1bX9nCJkH/N9EGCjbP8bLeLLjqf4NPvbRFSoL5LQexqZd0VuADLl6	Test Script	\N	\N	3000000000	CC	\N	\N	\N	\N	cliente	t	f	\N	\N	\N	2025-12-09 16:16:50.916826	2025-12-09 16:16:50.916826	local	\N
11	admin@ceveco.com	$2a$12$iWBFlc52fNycGVCelTFHXORH.AtCOnf6OXDS38dU4A.cx.n3pX1k6	Administrador	Ceveco	\N	\N	CC	\N	\N	\N	\N	admin	t	f	\N	\N	2026-05-25 11:16:31.873345	2026-01-17 19:39:59.640307	2026-05-25 11:16:31.873345	local	\N
\.


--
-- Name: asesores_id_asesor_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asesores_id_asesor_seq', 4, true);


--
-- Name: atributos_id_atributo_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.atributos_id_atributo_seq', 563, true);


--
-- Name: auth_providers_id_provider_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auth_providers_id_provider_seq', 1, false);


--
-- Name: banners_id_banner_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.banners_id_banner_seq', 6, true);


--
-- Name: carrito_id_carrito_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.carrito_id_carrito_seq', 1, false);


--
-- Name: carrito_items_id_item_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.carrito_items_id_item_seq', 1, false);


--
-- Name: categorias_id_categoria_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categorias_id_categoria_seq', 6, true);


--
-- Name: configuracion_id_config_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.configuracion_id_config_seq', 8, true);


--
-- Name: cupon_usos_id_uso_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cupon_usos_id_uso_seq', 1, false);


--
-- Name: cupones_id_cupon_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cupones_id_cupon_seq', 1, false);


--
-- Name: direcciones_id_direccion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.direcciones_id_direccion_seq', 9, true);


--
-- Name: favoritos_id_favorito_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.favoritos_id_favorito_seq', 1, false);


--
-- Name: logs_actividad_id_log_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.logs_actividad_id_log_seq', 1, false);


--
-- Name: marcas_id_marca_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.marcas_id_marca_seq', 36, true);


--
-- Name: newsletter_id_suscriptor_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.newsletter_id_suscriptor_seq', 1, false);


--
-- Name: pedido_historial_id_historial_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pedido_historial_id_historial_seq', 1, false);


--
-- Name: pedido_items_id_item_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pedido_items_id_item_seq', 1, false);


--
-- Name: pedidos_id_pedido_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pedidos_id_pedido_seq', 5, true);


--
-- Name: producto_atributos_id_producto_atributo_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.producto_atributos_id_producto_atributo_seq', 10296, true);


--
-- Name: producto_imagenes_id_imagen_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.producto_imagenes_id_imagen_seq', 4156, true);


--
-- Name: productos_id_producto_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.productos_id_producto_seq', 1139, true);


--
-- Name: resenas_id_resena_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.resenas_id_resena_seq', 1, false);


--
-- Name: sede_inventario_id_inventario_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sede_inventario_id_inventario_seq', 1, false);


--
-- Name: sedes_id_sede_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sedes_id_sede_seq', 51, true);


--
-- Name: subcategorias_id_subcategoria_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subcategorias_id_subcategoria_seq', 137, true);


--
-- Name: user_sessions_id_session_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_sessions_id_session_seq', 1, false);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 11, true);


--
-- Name: asesores asesores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asesores
    ADD CONSTRAINT asesores_pkey PRIMARY KEY (id_asesor);


--
-- Name: atributos atributos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atributos
    ADD CONSTRAINT atributos_pkey PRIMARY KEY (id_atributo);


--
-- Name: auth_providers auth_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_providers
    ADD CONSTRAINT auth_providers_pkey PRIMARY KEY (id_provider);


--
-- Name: auth_providers auth_providers_provider_provider_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_providers
    ADD CONSTRAINT auth_providers_provider_provider_uid_key UNIQUE (provider, provider_uid);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id_banner);


--
-- Name: carrito_items carrito_items_id_carrito_id_producto_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrito_items
    ADD CONSTRAINT carrito_items_id_carrito_id_producto_key UNIQUE (id_carrito, id_producto);


--
-- Name: carrito_items carrito_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrito_items
    ADD CONSTRAINT carrito_items_pkey PRIMARY KEY (id_item);


--
-- Name: carrito carrito_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_pkey PRIMARY KEY (id_carrito);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria);


--
-- Name: categorias categorias_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_slug_key UNIQUE (slug);


--
-- Name: configuracion configuracion_clave_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion
    ADD CONSTRAINT configuracion_clave_key UNIQUE (clave);


--
-- Name: configuracion configuracion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion
    ADD CONSTRAINT configuracion_pkey PRIMARY KEY (id_config);


--
-- Name: cupon_usos cupon_usos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cupon_usos
    ADD CONSTRAINT cupon_usos_pkey PRIMARY KEY (id_uso);


--
-- Name: cupones cupones_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cupones
    ADD CONSTRAINT cupones_codigo_key UNIQUE (codigo);


--
-- Name: cupones cupones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cupones
    ADD CONSTRAINT cupones_pkey PRIMARY KEY (id_cupon);


--
-- Name: direcciones direcciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direcciones
    ADD CONSTRAINT direcciones_pkey PRIMARY KEY (id_direccion);


--
-- Name: favoritos favoritos_id_usuario_id_producto_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT favoritos_id_usuario_id_producto_key UNIQUE (id_usuario, id_producto);


--
-- Name: favoritos favoritos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT favoritos_pkey PRIMARY KEY (id_favorito);


--
-- Name: logs_actividad logs_actividad_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs_actividad
    ADD CONSTRAINT logs_actividad_pkey PRIMARY KEY (id_log);


--
-- Name: marcas marcas_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marcas
    ADD CONSTRAINT marcas_nombre_key UNIQUE (nombre);


--
-- Name: marcas marcas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marcas
    ADD CONSTRAINT marcas_pkey PRIMARY KEY (id_marca);


--
-- Name: newsletter newsletter_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter
    ADD CONSTRAINT newsletter_email_key UNIQUE (email);


--
-- Name: newsletter newsletter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter
    ADD CONSTRAINT newsletter_pkey PRIMARY KEY (id_suscriptor);


--
-- Name: pedido_historial pedido_historial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_historial
    ADD CONSTRAINT pedido_historial_pkey PRIMARY KEY (id_historial);


--
-- Name: pedido_items pedido_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_pkey PRIMARY KEY (id_item);


--
-- Name: pedidos pedidos_numero_pedido_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_numero_pedido_key UNIQUE (numero_pedido);


--
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id_pedido);


--
-- Name: producto_atributos producto_atributos_id_producto_id_atributo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_atributos
    ADD CONSTRAINT producto_atributos_id_producto_id_atributo_key UNIQUE (id_producto, id_atributo);


--
-- Name: producto_atributos producto_atributos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_atributos
    ADD CONSTRAINT producto_atributos_pkey PRIMARY KEY (id_producto_atributo);


--
-- Name: producto_imagenes producto_imagenes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_imagenes
    ADD CONSTRAINT producto_imagenes_pkey PRIMARY KEY (id_imagen);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id_producto);


--
-- Name: productos productos_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_sku_key UNIQUE (sku);


--
-- Name: resenas resenas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_pkey PRIMARY KEY (id_resena);


--
-- Name: sede_inventario sede_inventario_id_sede_id_producto_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sede_inventario
    ADD CONSTRAINT sede_inventario_id_sede_id_producto_key UNIQUE (id_sede, id_producto);


--
-- Name: sede_inventario sede_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sede_inventario
    ADD CONSTRAINT sede_inventario_pkey PRIMARY KEY (id_inventario);


--
-- Name: sedes sedes_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sedes
    ADD CONSTRAINT sedes_codigo_key UNIQUE (codigo);


--
-- Name: sedes sedes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sedes
    ADD CONSTRAINT sedes_pkey PRIMARY KEY (id_sede);


--
-- Name: subcategorias subcategorias_id_categoria_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategorias
    ADD CONSTRAINT subcategorias_id_categoria_slug_key UNIQUE (id_categoria, slug);


--
-- Name: subcategorias subcategorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategorias
    ADD CONSTRAINT subcategorias_pkey PRIMARY KEY (id_subcategoria);


--
-- Name: producto_imagenes uq_producto_imagenes_producto_url; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_imagenes
    ADD CONSTRAINT uq_producto_imagenes_producto_url UNIQUE (id_producto, url_imagen);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id_session);


--
-- Name: user_sessions user_sessions_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_token_hash_key UNIQUE (token_hash);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_numero_documento_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_numero_documento_key UNIQUE (numero_documento);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: idx_asesores_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asesores_activo ON public.asesores USING btree (activo);


--
-- Name: idx_asesores_orden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asesores_orden ON public.asesores USING btree (orden);


--
-- Name: idx_atributos_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_atributos_categoria ON public.atributos USING btree (id_categoria);


--
-- Name: idx_auth_providers_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_providers_email ON public.auth_providers USING btree (email);


--
-- Name: idx_auth_providers_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_providers_lookup ON public.auth_providers USING btree (provider, provider_uid);


--
-- Name: idx_auth_providers_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_providers_provider ON public.auth_providers USING btree (provider);


--
-- Name: idx_auth_providers_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_providers_usuario ON public.auth_providers USING btree (id_usuario);


--
-- Name: idx_banners_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_banners_activo ON public.banners USING btree (activo);


--
-- Name: idx_banners_posicion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_banners_posicion ON public.banners USING btree (posicion);


--
-- Name: idx_carrito_items_carrito; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_carrito_items_carrito ON public.carrito_items USING btree (id_carrito);


--
-- Name: idx_carrito_items_producto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_carrito_items_producto ON public.carrito_items USING btree (id_producto);


--
-- Name: idx_carrito_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_carrito_session ON public.carrito USING btree (session_id);


--
-- Name: idx_carrito_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_carrito_usuario ON public.carrito USING btree (id_usuario);


--
-- Name: idx_categorias_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categorias_activo ON public.categorias USING btree (activo);


--
-- Name: idx_categorias_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categorias_slug ON public.categorias USING btree (slug);


--
-- Name: idx_configuracion_clave; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_configuracion_clave ON public.configuracion USING btree (clave);


--
-- Name: idx_configuracion_grupo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_configuracion_grupo ON public.configuracion USING btree (grupo);


--
-- Name: idx_cupon_usos_cupon; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cupon_usos_cupon ON public.cupon_usos USING btree (id_cupon);


--
-- Name: idx_cupon_usos_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cupon_usos_usuario ON public.cupon_usos USING btree (id_usuario);


--
-- Name: idx_cupones_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cupones_activo ON public.cupones USING btree (activo);


--
-- Name: idx_cupones_codigo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cupones_codigo ON public.cupones USING btree (codigo);


--
-- Name: idx_cupones_fechas; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cupones_fechas ON public.cupones USING btree (fecha_inicio, fecha_fin);


--
-- Name: idx_direcciones_principal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_direcciones_principal ON public.direcciones USING btree (es_principal);


--
-- Name: idx_direcciones_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_direcciones_usuario ON public.direcciones USING btree (id_usuario);


--
-- Name: idx_favoritos_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_favoritos_usuario ON public.favoritos USING btree (id_usuario);


--
-- Name: idx_logs_actividad_accion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_actividad_accion ON public.logs_actividad USING btree (accion);


--
-- Name: idx_logs_actividad_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_actividad_fecha ON public.logs_actividad USING btree (fecha_creacion);


--
-- Name: idx_logs_actividad_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_actividad_usuario ON public.logs_actividad USING btree (id_usuario);


--
-- Name: idx_marcas_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marcas_nombre ON public.marcas USING btree (nombre);


--
-- Name: idx_marcas_nombre_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marcas_nombre_trgm ON public.marcas USING gin (nombre public.gin_trgm_ops);


--
-- Name: idx_newsletter_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_newsletter_activo ON public.newsletter USING btree (activo);


--
-- Name: idx_newsletter_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_newsletter_email ON public.newsletter USING btree (email);


--
-- Name: idx_pedido_historial_pedido; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pedido_historial_pedido ON public.pedido_historial USING btree (id_pedido);


--
-- Name: idx_pedido_items_pedido; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pedido_items_pedido ON public.pedido_items USING btree (id_pedido);


--
-- Name: idx_pedido_items_producto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pedido_items_producto ON public.pedido_items USING btree (id_producto);


--
-- Name: idx_pedidos_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pedidos_estado ON public.pedidos USING btree (estado);


--
-- Name: idx_pedidos_fecha_pedido; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pedidos_fecha_pedido ON public.pedidos USING btree (fecha_pedido);


--
-- Name: idx_pedidos_numero_pedido; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pedidos_numero_pedido ON public.pedidos USING btree (numero_pedido);


--
-- Name: idx_pedidos_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pedidos_usuario ON public.pedidos USING btree (id_usuario);


--
-- Name: idx_pedidos_usuario_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pedidos_usuario_fecha ON public.pedidos USING btree (id_usuario, fecha_pedido);


--
-- Name: idx_producto_atributos_atributo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_producto_atributos_atributo ON public.producto_atributos USING btree (id_atributo);


--
-- Name: idx_producto_atributos_producto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_producto_atributos_producto ON public.producto_atributos USING btree (id_producto);


--
-- Name: idx_producto_imagenes_orden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_producto_imagenes_orden ON public.producto_imagenes USING btree (id_producto, orden);


--
-- Name: idx_producto_imagenes_principal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_producto_imagenes_principal ON public.producto_imagenes USING btree (es_principal);


--
-- Name: idx_producto_imagenes_producto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_producto_imagenes_producto ON public.producto_imagenes USING btree (id_producto);


--
-- Name: idx_productos_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_activo ON public.productos USING btree (activo);


--
-- Name: idx_productos_busqueda; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_busqueda ON public.productos USING gin (to_tsvector('spanish'::regconfig, (((nombre)::text || ' '::text) || COALESCE(descripcion_corta, ''::text))));


--
-- Name: idx_productos_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_categoria ON public.productos USING btree (id_categoria);


--
-- Name: idx_productos_destacado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_destacado ON public.productos USING btree (destacado);


--
-- Name: idx_productos_destacado_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_destacado_activo ON public.productos USING btree (destacado, activo);


--
-- Name: idx_productos_manual_override; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_manual_override ON public.productos USING btree (manual_override) WHERE (manual_override = true);


--
-- Name: idx_productos_marca; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_marca ON public.productos USING btree (id_marca);


--
-- Name: idx_productos_nombre_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_nombre_trgm ON public.productos USING gin (nombre public.gin_trgm_ops);


--
-- Name: idx_productos_precio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_precio ON public.productos USING btree (precio_actual);


--
-- Name: idx_productos_precio_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_precio_categoria ON public.productos USING btree (id_categoria, precio_actual);


--
-- Name: idx_productos_ref_proveedor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_ref_proveedor ON public.productos USING btree (referencia_proveedor) WHERE (referencia_proveedor IS NOT NULL);


--
-- Name: idx_productos_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_productos_sku ON public.productos USING btree (sku);


--
-- Name: idx_resenas_aprobado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resenas_aprobado ON public.resenas USING btree (aprobado);


--
-- Name: idx_resenas_calificacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resenas_calificacion ON public.resenas USING btree (calificacion);


--
-- Name: idx_resenas_producto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resenas_producto ON public.resenas USING btree (id_producto);


--
-- Name: idx_resenas_producto_aprobado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resenas_producto_aprobado ON public.resenas USING btree (id_producto, aprobado);


--
-- Name: idx_resenas_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resenas_usuario ON public.resenas USING btree (id_usuario);


--
-- Name: idx_sede_inventario_producto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sede_inventario_producto ON public.sede_inventario USING btree (id_producto);


--
-- Name: idx_sede_inventario_sede; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sede_inventario_sede ON public.sede_inventario USING btree (id_sede);


--
-- Name: idx_sedes_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sedes_activo ON public.sedes USING btree (activo);


--
-- Name: idx_sedes_ciudad; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sedes_ciudad ON public.sedes USING btree (ciudad);


--
-- Name: idx_subcategorias_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subcategorias_categoria ON public.subcategorias USING btree (id_categoria);


--
-- Name: idx_subcategorias_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subcategorias_slug ON public.subcategorias USING btree (slug);


--
-- Name: idx_user_sessions_activa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_activa ON public.user_sessions USING btree (es_activa);


--
-- Name: idx_user_sessions_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_token ON public.user_sessions USING btree (token_hash);


--
-- Name: idx_user_sessions_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_usuario ON public.user_sessions USING btree (id_usuario);


--
-- Name: idx_usuarios_documento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_documento ON public.usuarios USING btree (numero_documento);


--
-- Name: idx_usuarios_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_email ON public.usuarios USING btree (email);


--
-- Name: idx_usuarios_rol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_rol ON public.usuarios USING btree (rol);


--
-- Name: carrito trigger_actualizar_carrito; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_actualizar_carrito BEFORE UPDATE ON public.carrito FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: categorias trigger_actualizar_categorias; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_actualizar_categorias BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: configuracion trigger_actualizar_configuracion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_actualizar_configuracion BEFORE UPDATE ON public.configuracion FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: pedidos trigger_actualizar_pedidos; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_actualizar_pedidos BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: productos trigger_actualizar_productos; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_actualizar_productos BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: resenas trigger_actualizar_resenas; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_actualizar_resenas BEFORE UPDATE ON public.resenas FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: sede_inventario trigger_actualizar_sede_inventario; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_actualizar_sede_inventario BEFORE UPDATE ON public.sede_inventario FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: user_sessions trigger_actualizar_user_sessions; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_actualizar_user_sessions BEFORE UPDATE ON public.user_sessions FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: usuarios trigger_actualizar_usuarios; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_actualizar_usuarios BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_actualizacion();


--
-- Name: pedidos trigger_after_pedido_estado_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_after_pedido_estado_update AFTER UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.after_pedido_estado_update();


--
-- Name: pedido_items trigger_after_pedido_item_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_after_pedido_item_insert AFTER INSERT ON public.pedido_items FOR EACH ROW EXECUTE FUNCTION public.after_pedido_item_insert();


--
-- Name: resenas trigger_after_resena_aprobada; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_after_resena_aprobada AFTER UPDATE ON public.resenas FOR EACH ROW EXECUTE FUNCTION public.after_resena_aprobada();


--
-- Name: asesores trigger_update_asesores_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_asesores_timestamp BEFORE UPDATE ON public.asesores FOR EACH ROW EXECUTE FUNCTION public.update_asesores_timestamp();


--
-- Name: atributos atributos_id_categoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atributos
    ADD CONSTRAINT atributos_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria) ON DELETE SET NULL;


--
-- Name: auth_providers auth_providers_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_providers
    ADD CONSTRAINT auth_providers_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: carrito carrito_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: carrito_items carrito_items_id_carrito_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrito_items
    ADD CONSTRAINT carrito_items_id_carrito_fkey FOREIGN KEY (id_carrito) REFERENCES public.carrito(id_carrito) ON DELETE CASCADE;


--
-- Name: carrito_items carrito_items_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carrito_items
    ADD CONSTRAINT carrito_items_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE CASCADE;


--
-- Name: cupon_usos cupon_usos_id_cupon_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cupon_usos
    ADD CONSTRAINT cupon_usos_id_cupon_fkey FOREIGN KEY (id_cupon) REFERENCES public.cupones(id_cupon) ON DELETE CASCADE;


--
-- Name: cupon_usos cupon_usos_id_pedido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cupon_usos
    ADD CONSTRAINT cupon_usos_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE;


--
-- Name: cupon_usos cupon_usos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cupon_usos
    ADD CONSTRAINT cupon_usos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: direcciones direcciones_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direcciones
    ADD CONSTRAINT direcciones_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: favoritos favoritos_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT favoritos_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE CASCADE;


--
-- Name: favoritos favoritos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT favoritos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: logs_actividad logs_actividad_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs_actividad
    ADD CONSTRAINT logs_actividad_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE SET NULL;


--
-- Name: pedido_historial pedido_historial_id_pedido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_historial
    ADD CONSTRAINT pedido_historial_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE;


--
-- Name: pedido_historial pedido_historial_id_usuario_cambio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_historial
    ADD CONSTRAINT pedido_historial_id_usuario_cambio_fkey FOREIGN KEY (id_usuario_cambio) REFERENCES public.usuarios(id_usuario) ON DELETE SET NULL;


--
-- Name: pedido_items pedido_items_id_pedido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido) ON DELETE CASCADE;


--
-- Name: pedido_items pedido_items_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto);


--
-- Name: pedidos pedidos_id_direccion_envio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_id_direccion_envio_fkey FOREIGN KEY (id_direccion_envio) REFERENCES public.direcciones(id_direccion);


--
-- Name: pedidos pedidos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: producto_atributos producto_atributos_id_atributo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_atributos
    ADD CONSTRAINT producto_atributos_id_atributo_fkey FOREIGN KEY (id_atributo) REFERENCES public.atributos(id_atributo) ON DELETE CASCADE;


--
-- Name: producto_atributos producto_atributos_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_atributos
    ADD CONSTRAINT producto_atributos_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE CASCADE;


--
-- Name: producto_imagenes producto_imagenes_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_imagenes
    ADD CONSTRAINT producto_imagenes_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE CASCADE;


--
-- Name: productos productos_id_categoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria);


--
-- Name: productos productos_id_marca_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_id_marca_fkey FOREIGN KEY (id_marca) REFERENCES public.marcas(id_marca);


--
-- Name: productos productos_id_subcategoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_id_subcategoria_fkey FOREIGN KEY (id_subcategoria) REFERENCES public.subcategorias(id_subcategoria) ON DELETE SET NULL;


--
-- Name: resenas resenas_id_pedido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido) ON DELETE SET NULL;


--
-- Name: resenas resenas_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE CASCADE;


--
-- Name: resenas resenas_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: sede_inventario sede_inventario_id_producto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sede_inventario
    ADD CONSTRAINT sede_inventario_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto) ON DELETE CASCADE;


--
-- Name: sede_inventario sede_inventario_id_sede_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sede_inventario
    ADD CONSTRAINT sede_inventario_id_sede_fkey FOREIGN KEY (id_sede) REFERENCES public.sedes(id_sede) ON DELETE CASCADE;


--
-- Name: subcategorias subcategorias_id_categoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategorias
    ADD CONSTRAINT subcategorias_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 6Q76yzebqgrSoX4VCaTJfYQMNedMO5HuGMpTsyQgvvGKAzMtkLlkCHoGOsZmdks

