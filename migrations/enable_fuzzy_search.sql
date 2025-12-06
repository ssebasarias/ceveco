-- Habilitar extensión pg_trgm para búsqueda difusa (fuzzy search)
-- Esta extensión permite buscar texto similar aunque tenga errores ortográficos

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Crear índice GIN para mejorar performance de búsqueda por similaridad
CREATE INDEX IF NOT EXISTS idx_productos_nombre_trgm ON productos USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_marcas_nombre_trgm ON marcas USING gin (nombre gin_trgm_ops);

-- Verificar que funciona
SELECT 'Extension pg_trgm habilitada correctamente' as status;
SELECT similarity('nevera', 'nebera') as test_similarity; -- Debería retornar ~0.5
