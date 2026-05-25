-- 20260525_product_specs_columns.sql
-- Agrega columnas para datos extendidos extraídos por el scraper profesional.
--
-- Notas sobre el esquema real (ver bd.sql):
--   * `productos` ya tiene `descripcion_larga TEXT` desde antes. La migración
--     no la recrea; solo agrega los campos nuevos (specs/componentes,
--     manual_override, fuente_scrape, ultima_actualizacion_scrape).
--   * `producto_imagenes` ya tiene `orden INTEGER DEFAULT 0` desde antes. Se
--     agrega únicamente el índice y el constraint UNIQUE necesarios para que
--     el scraper haga UPSERT idempotente sobre (id_producto, url_imagen).
--
-- Todas las sentencias usan IF NOT EXISTS para que la migración sea
-- idempotente y reaplicable.

-- --- productos: columnas para datos scrapeados ----------------------------
ALTER TABLE productos
    ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS componentes JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS manual_override BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS fuente_scrape TEXT,
    ADD COLUMN IF NOT EXISTS ultima_actualizacion_scrape TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_productos_manual_override
    ON productos(manual_override)
    WHERE manual_override = TRUE;

-- --- producto_imagenes: índice por orden y unique para upsert -------------
CREATE INDEX IF NOT EXISTS idx_producto_imagenes_orden
    ON producto_imagenes(id_producto, orden);

-- UNIQUE (id_producto, url_imagen) — necesario para el ON CONFLICT del
-- scraper al insertar imágenes extra de galería. Se crea con un guard
-- (DO ... EXCEPTION) para que no falle si ya existe.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_producto_imagenes_producto_url'
    ) THEN
        ALTER TABLE producto_imagenes
            ADD CONSTRAINT uq_producto_imagenes_producto_url
            UNIQUE (id_producto, url_imagen);
    END IF;
END$$;
