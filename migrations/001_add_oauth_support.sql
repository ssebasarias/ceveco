-- ============================================
-- MIGRACIÓN: Agregar soporte OAuth
-- Fecha: Diciembre 2025
-- Descripción: Agrega tablas y columnas para soportar
--              autenticación con Google, Facebook, GitHub, etc.
-- ============================================

-- IMPORTANTE: Ejecutar con cuidado si ya tienes datos
-- Este script es ADICIONAL al bd.sql principal

BEGIN;

-- 1. Agregar nuevo tipo ENUM para método de autenticación
DO $$ BEGIN
    CREATE TYPE auth_method_enum AS ENUM ('local', 'google', 'facebook', 'github', 'apple', 'microsoft');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Agregar nuevo tipo ENUM para proveedores
DO $$ BEGIN
    CREATE TYPE auth_provider_enum AS ENUM ('google', 'facebook', 'github', 'apple', 'microsoft');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Modificar tabla usuarios (si ya existe)
-- Hacer password_hash nullable
ALTER TABLE usuarios 
    ALTER COLUMN password_hash DROP NOT NULL;

-- Hacer apellido nullable
ALTER TABLE usuarios 
    ALTER COLUMN apellido DROP NOT NULL;

-- Agregar columna auth_method si no existe
DO $$ BEGIN
    ALTER TABLE usuarios ADD COLUMN auth_method auth_method_enum DEFAULT 'local';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Agregar columna fecha_recuperacion_expira si no existe
DO $$ BEGIN
    ALTER TABLE usuarios ADD COLUMN fecha_recuperacion_expira TIMESTAMP;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 4. Crear tabla auth_providers
CREATE TABLE IF NOT EXISTS auth_providers (
    id_provider SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    provider auth_provider_enum NOT NULL,
    provider_uid VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    nombre VARCHAR(255),
    avatar_url TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expiry TIMESTAMP,
    raw_data JSONB,
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

-- 5. Crear tabla user_sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id_session SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info VARCHAR(255),
    es_activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    fecha_ultimo_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_usuario ON user_sessions(id_usuario);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_activa ON user_sessions(es_activa);

-- 6. Función para buscar o crear usuario OAuth
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
$$ LANGUAGE plpgsql;

-- 7. Función para vincular proveedor OAuth a usuario existente
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
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = p_user_id) THEN
        RAISE EXCEPTION 'Usuario no encontrado: %', p_user_id;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM auth_providers 
        WHERE provider = p_provider AND provider_uid = p_provider_uid AND id_usuario != p_user_id
    ) THEN
        RAISE EXCEPTION 'Este proveedor ya está vinculado a otro usuario';
    END IF;
    
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
$$ LANGUAGE plpgsql;

-- 8. Función para desvincular proveedor OAuth
CREATE OR REPLACE FUNCTION unlink_oauth_provider(
    p_user_id INT,
    p_provider auth_provider_enum
)
RETURNS BOOLEAN AS $$
DECLARE
    v_provider_count INT;
    v_has_password BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO v_provider_count
    FROM auth_providers WHERE id_usuario = p_user_id;
    
    SELECT (password_hash IS NOT NULL) INTO v_has_password
    FROM usuarios WHERE id_usuario = p_user_id;
    
    IF v_provider_count <= 1 AND NOT v_has_password THEN
        RAISE EXCEPTION 'No puedes desvincular tu único método de autenticación. Primero establece una contraseña.';
    END IF;
    
    DELETE FROM auth_providers 
    WHERE id_usuario = p_user_id AND provider = p_provider;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para actualizar sesiones
DROP TRIGGER IF EXISTS trigger_actualizar_user_sessions ON user_sessions;
CREATE TRIGGER trigger_actualizar_user_sessions
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

COMMIT;

-- ============================================
-- EJEMPLO DE USO
-- ============================================
-- 
-- Login/Registro con Google:
-- SELECT * FROM find_or_create_oauth_user(
--     'google',                              -- proveedor
--     '123456789012345678901',               -- sub de Google (provider_uid)
--     'usuario@gmail.com',                   -- email
--     'Juan Pérez',                          -- nombre
--     NULL,                                  -- apellido (opcional)
--     'https://lh3.googleusercontent.com/...', -- foto
--     '{"iss": "accounts.google.com", ...}'::JSONB -- datos raw
-- );
--
-- Vincular Facebook a usuario existente:
-- SELECT link_oauth_provider(
--     123,                                   -- id_usuario
--     'facebook',                            -- proveedor
--     '9876543210',                          -- id de Facebook
--     'usuario@facebook.com',                -- email
--     'Juan',                                -- nombre
--     'https://graph.facebook.com/...'       -- foto
-- );
--
-- Desvincular proveedor:
-- SELECT unlink_oauth_provider(123, 'facebook');
