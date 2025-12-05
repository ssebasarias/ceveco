-- ============================================
-- SCRIPT DE ACTUALIZACIÓN: Soporte OAuth
-- Para ejecutar en pgAdmin sobre BD existente
-- Fecha: 5 de Diciembre 2025
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Abre pgAdmin y conecta a tu base de datos ceveco_db
-- 2. Click derecho en la base de datos -> Query Tool
-- 3. Copia y pega TODO este contenido
-- 4. Ejecuta (F5)
-- 
-- NOTA: Este script es seguro de ejecutar múltiples veces
-- ============================================

-- =============================================
-- PASO 1: Crear tipos ENUM nuevos
-- =============================================

-- Tipo para método de autenticación principal
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_method_enum') THEN
        CREATE TYPE auth_method_enum AS ENUM ('local', 'google', 'facebook', 'github', 'apple', 'microsoft');
        RAISE NOTICE '✅ Tipo auth_method_enum creado';
    ELSE
        RAISE NOTICE '⏭️ Tipo auth_method_enum ya existe';
    END IF;
END $$;

-- Tipo para proveedores OAuth
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_provider_enum') THEN
        CREATE TYPE auth_provider_enum AS ENUM ('google', 'facebook', 'github', 'apple', 'microsoft');
        RAISE NOTICE '✅ Tipo auth_provider_enum creado';
    ELSE
        RAISE NOTICE '⏭️ Tipo auth_provider_enum ya existe';
    END IF;
END $$;

-- =============================================
-- PASO 2: Modificar tabla usuarios
-- =============================================

-- Hacer password_hash nullable (para usuarios OAuth sin contraseña local)
ALTER TABLE usuarios ALTER COLUMN password_hash DROP NOT NULL;

-- Hacer apellido nullable (algunos proveedores solo dan nombre completo)
ALTER TABLE usuarios ALTER COLUMN apellido DROP NOT NULL;

-- Agregar columna auth_method
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'auth_method') THEN
        ALTER TABLE usuarios ADD COLUMN auth_method auth_method_enum DEFAULT 'local';
        RAISE NOTICE '✅ Columna auth_method agregada a usuarios';
    ELSE
        RAISE NOTICE '⏭️ Columna auth_method ya existe';
    END IF;
END $$;

-- Agregar columna fecha_recuperacion_expira
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'fecha_recuperacion_expira') THEN
        ALTER TABLE usuarios ADD COLUMN fecha_recuperacion_expira TIMESTAMP;
        RAISE NOTICE '✅ Columna fecha_recuperacion_expira agregada a usuarios';
    ELSE
        RAISE NOTICE '⏭️ Columna fecha_recuperacion_expira ya existe';
    END IF;
END $$;

-- =============================================
-- PASO 3: Crear tabla auth_providers
-- =============================================

CREATE TABLE IF NOT EXISTS auth_providers (
    id_provider SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    provider auth_provider_enum NOT NULL,       -- 'google', 'facebook', 'github', etc.
    provider_uid VARCHAR(255) NOT NULL,          -- ID único que da el proveedor (sub de Google)
    email VARCHAR(255),                          -- Email del proveedor
    nombre VARCHAR(255),                         -- Nombre del perfil del proveedor
    avatar_url TEXT,                             -- Foto de perfil del proveedor
    access_token TEXT,                           -- Token de acceso (opcional)
    refresh_token TEXT,                          -- Token de refresh (opcional)
    token_expiry TIMESTAMP,                      -- Expiración del token
    raw_data JSONB,                              -- Datos raw del proveedor
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_autenticacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    UNIQUE (provider, provider_uid)
);

-- Índices para auth_providers
CREATE INDEX IF NOT EXISTS idx_auth_providers_usuario ON auth_providers(id_usuario);
CREATE INDEX IF NOT EXISTS idx_auth_providers_provider ON auth_providers(provider);
CREATE INDEX IF NOT EXISTS idx_auth_providers_email ON auth_providers(email);
CREATE INDEX IF NOT EXISTS idx_auth_providers_lookup ON auth_providers(provider, provider_uid);

-- =============================================
-- PASO 4: Crear tabla user_sessions
-- =============================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id_session SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,     -- Hash del token de sesión
    ip_address VARCHAR(45),                       -- IPv4 o IPv6
    user_agent TEXT,                              -- Información del navegador
    device_info VARCHAR(255),                     -- Información del dispositivo
    es_activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    fecha_ultimo_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Índices para user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_usuario ON user_sessions(id_usuario);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_activa ON user_sessions(es_activa);

-- =============================================
-- PASO 5: Crear funciones OAuth
-- =============================================

-- Función principal: Buscar o crear usuario desde OAuth
CREATE OR REPLACE FUNCTION find_or_create_oauth_user(
    p_provider auth_provider_enum,
    p_provider_uid VARCHAR(255),
    p_email VARCHAR(255),
    p_nombre VARCHAR(255),
    p_apellido VARCHAR(100) DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_raw_data JSONB DEFAULT NULL
)
RETURNS TABLE(
    user_id INT,
    is_new_user BOOLEAN,
    provider_id INT
) AS $$
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
$$ LANGUAGE plpgsql;

-- Función para vincular proveedor OAuth a usuario existente
CREATE OR REPLACE FUNCTION link_oauth_provider(
    p_user_id INT,
    p_provider auth_provider_enum,
    p_provider_uid VARCHAR(255),
    p_email VARCHAR(255) DEFAULT NULL,
    p_nombre VARCHAR(255) DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_raw_data JSONB DEFAULT NULL
)
RETURNS INT AS $$
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
$$ LANGUAGE plpgsql;

-- Función para desvincular proveedor OAuth
CREATE OR REPLACE FUNCTION unlink_oauth_provider(
    p_user_id INT,
    p_provider auth_provider_enum
)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql;

-- =============================================
-- PASO 6: Crear trigger para user_sessions
-- =============================================

DROP TRIGGER IF EXISTS trigger_actualizar_user_sessions ON user_sessions;
CREATE TRIGGER trigger_actualizar_user_sessions
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- =============================================
-- ✅ MIGRACIÓN COMPLETADA
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ MIGRACIÓN OAUTH COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Nuevas tablas creadas:';
    RAISE NOTICE '  - auth_providers (proveedores OAuth vinculados)';
    RAISE NOTICE '  - user_sessions (sesiones de usuario)';
    RAISE NOTICE '';
    RAISE NOTICE 'Modificaciones a usuarios:';
    RAISE NOTICE '  - password_hash ahora es nullable';
    RAISE NOTICE '  - apellido ahora es nullable';
    RAISE NOTICE '  - Nueva columna: auth_method';
    RAISE NOTICE '  - Nueva columna: fecha_recuperacion_expira';
    RAISE NOTICE '';
    RAISE NOTICE 'Funciones disponibles:';
    RAISE NOTICE '  - find_or_create_oauth_user()';
    RAISE NOTICE '  - link_oauth_provider()';
    RAISE NOTICE '  - unlink_oauth_provider()';
    RAISE NOTICE '';
END $$;
