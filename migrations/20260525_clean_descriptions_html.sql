-- 20260525_clean_descriptions_html.sql
-- Limpieza one-time: quitar etiquetas HTML (<div>, <p>, <span>, etc.) de las
-- columnas de descripción que se generaron con wrappers HTML durante la carga
-- inicial. También colapsa espacios y trim.
--
-- El esquema usa descripcion_corta y descripcion_larga (no hay columna
-- "descripcion" suelta).
--
-- Idempotente: se puede correr varias veces sin efecto adicional.

UPDATE productos
SET
    descripcion_corta  = TRIM(BOTH FROM regexp_replace(COALESCE(descripcion_corta, ''),  '<[^>]+>', '', 'g')),
    descripcion_larga  = TRIM(BOTH FROM regexp_replace(COALESCE(descripcion_larga, ''),  '<[^>]+>', '', 'g'))
WHERE
    descripcion_corta LIKE '%<%>%'
 OR descripcion_larga LIKE '%<%>%';

-- Colapsar múltiples espacios y newlines a uno solo
UPDATE productos
SET
    descripcion_corta  = TRIM(BOTH FROM regexp_replace(descripcion_corta, '\s+', ' ', 'g')),
    descripcion_larga  = TRIM(BOTH FROM regexp_replace(descripcion_larga, '\s+', ' ', 'g'))
WHERE
    descripcion_corta ~ '\s{2,}'
 OR descripcion_larga ~ '\s{2,}';
