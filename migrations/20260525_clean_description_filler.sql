-- 20260525_clean_description_filler.sql
-- Limpieza de muletillas y duplicaciones detectadas en las descripciones
-- generadas durante la ingesta inicial:
--
-- 1) "Adquiere tu X. de la marca Y." → quita la frase repetida "de la marca Y."
-- 2) "Adquiere tu X. X." (mismo texto repetido inmediatamente) → deja una sola copia.
-- 3) Normaliza espacios.
--
-- Diseñada para correr una sola vez. Idempotente: ejecutar dos veces no cambia nada.

-- 1) Quitar "de la marca <Palabra>." (case-insensitive)
UPDATE productos
SET
    descripcion_corta = TRIM(BOTH FROM regexp_replace(descripcion_corta, '\s*de la marca [A-Za-zÁÉÍÓÚÑáéíóúñ]+\s*\.?', '', 'gi')),
    descripcion_larga = TRIM(BOTH FROM regexp_replace(descripcion_larga, '\s*de la marca [A-Za-zÁÉÍÓÚÑáéíóúñ]+\s*\.?', '', 'gi'))
WHERE
    descripcion_corta ~* 'de la marca \w+'
 OR descripcion_larga ~* 'de la marca \w+';

-- 2) Quitar "Adquiere tu" y otros openers cliché que no aportan al ecommerce
UPDATE productos
SET
    descripcion_corta = TRIM(BOTH FROM regexp_replace(descripcion_corta, '^\s*Adquiere tu\s+', '', 'i')),
    descripcion_larga = TRIM(BOTH FROM regexp_replace(descripcion_larga, '^\s*Adquiere tu\s+', '', 'i'))
WHERE
    descripcion_corta ILIKE 'Adquiere tu%'
 OR descripcion_larga ILIKE 'Adquiere tu%';

-- 3) Normalizar espacios múltiples una vez más
UPDATE productos
SET
    descripcion_corta = TRIM(BOTH FROM regexp_replace(descripcion_corta, '\s+', ' ', 'g')),
    descripcion_larga = TRIM(BOTH FROM regexp_replace(descripcion_larga, '\s+', ' ', 'g'))
WHERE
    descripcion_corta ~ '\s{2,}'
 OR descripcion_larga ~ '\s{2,}';

-- 4) Si descripcion_larga es exactamente igual a descripcion_corta repetida 2 veces,
--    quedarse con una sola copia. Ejemplo: "Texto X. Texto X." → "Texto X."
UPDATE productos
SET descripcion_larga = descripcion_corta
WHERE descripcion_corta IS NOT NULL
  AND descripcion_corta <> ''
  AND descripcion_larga = descripcion_corta || ' ' || descripcion_corta;
