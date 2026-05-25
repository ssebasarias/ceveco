const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '../../../backend/public/images/productos');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Mínimo aceptable a la entrada del pipeline (antes de redimensionar).
// El scraper exige >=800 (validateBuffer) para evitar miniaturas pequeñas
// de Google Images. processAndSave sigue tolerando 300+ para compat con el
// flujo existente (placeholders / re-uploads vía admin).
const MIN_DIMENSION = 300;
const MAX_DIMENSION = 1200;
const THUMB_DIMENSION = 400;

// Parámetros usados por validateBuffer (más exigentes).
const VALIDATE_MIN_DIMENSION = 800;
const VALIDATE_MIN_FILE_SIZE = 15000; // 15 KB — debajo de eso suele ser un favicon o un sprite roto
const VALIDATE_MIN_RATIO = 0.5;
const VALIDATE_MAX_RATIO = 2.0;

/**
 * Valida un Buffer de imagen antes de procesarlo.
 * Devuelve { ok, reason?, meta? } sin lanzar excepciones.
 *
 * Reglas:
 *   - Tamaño de archivo >= 15 KB.
 *   - Sharp puede leer la metadata.
 *   - Ancho y alto >= 800 px.
 *   - Aspect ratio entre 0.5 y 2.0 (descarta banners horizontales y tiras
 *     verticales que casi nunca son la imagen del producto).
 */
async function validateBuffer(buffer) {
    if (!buffer || buffer.length < VALIDATE_MIN_FILE_SIZE) {
        return {
            ok: false,
            reason: `archivo muy pequeño (${buffer ? buffer.length : 0} B, mínimo ${VALIDATE_MIN_FILE_SIZE})`
        };
    }

    let meta;
    try {
        meta = await sharp(buffer).metadata();
    } catch (err) {
        return { ok: false, reason: `no es imagen válida: ${err.message}` };
    }

    if (!meta.width || !meta.height) {
        return { ok: false, reason: 'sin dimensiones detectables' };
    }

    if (meta.width < VALIDATE_MIN_DIMENSION || meta.height < VALIDATE_MIN_DIMENSION) {
        return {
            ok: false,
            reason: `dimensiones bajas: ${meta.width}x${meta.height} (mín ${VALIDATE_MIN_DIMENSION}x${VALIDATE_MIN_DIMENSION})`
        };
    }

    const ratio = meta.width / meta.height;
    if (ratio < VALIDATE_MIN_RATIO || ratio > VALIDATE_MAX_RATIO) {
        return {
            ok: false,
            reason: `aspect ratio inválido: ${ratio.toFixed(2)} (esperado ${VALIDATE_MIN_RATIO}-${VALIDATE_MAX_RATIO})`
        };
    }

    return { ok: true, meta };
}

/**
 * Procesa un buffer y lo guarda en backend/public/images/productos/.
 *
 * Si index === 0 → imagen principal: `{id}.webp`, `{id}.jpg`, `{id}_thumb.webp`.
 * Si index >= 1 → imagen de galería: `{id}_alt{index}.webp`, `{id}_alt{index}.jpg`.
 *
 * Las rutas devueltas son las que se guardan en la columna
 * `producto_imagenes.url_imagen` (prefijo `/images/productos/`).
 */
async function processAndSave(buffer, idProducto, index = 0) {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) {
        throw new Error('Imagen sin metadata válida');
    }
    if (meta.width < MIN_DIMENSION || meta.height < MIN_DIMENSION) {
        throw new Error(`Imagen demasiado pequeña: ${meta.width}x${meta.height}`);
    }

    const isMain = index === 0;
    const baseName = isMain ? String(idProducto) : `${idProducto}_alt${index}`;

    const mainWebp = path.join(OUTPUT_DIR, `${baseName}.webp`);
    const mainJpg = path.join(OUTPUT_DIR, `${baseName}.jpg`);
    const thumbWebp = path.join(OUTPUT_DIR, `${baseName}_thumb.webp`);

    await sharp(buffer)
        .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(mainWebp);

    await sharp(buffer)
        .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 88, progressive: true })
        .toFile(mainJpg);

    // Solo generamos thumb para la imagen principal; ahorra espacio en galería.
    if (isMain) {
        await sharp(buffer)
            .resize(THUMB_DIMENSION, THUMB_DIMENSION, { fit: 'cover', position: 'centre' })
            .webp({ quality: 80 })
            .toFile(thumbWebp);
    }

    return {
        main: `/images/productos/${baseName}.webp`,
        mainJpg: `/images/productos/${baseName}.jpg`,
        thumb: isMain ? `/images/productos/${baseName}_thumb.webp` : null,
        meta: { width: meta.width, height: meta.height, originalFormat: meta.format }
    };
}

function escapeXml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

async function generatePlaceholder(idProducto, marca, nombre) {
    const baseName = String(idProducto);
    const mainWebp = path.join(OUTPUT_DIR, `${baseName}.webp`);

    const svg = `
    <svg width="1200" height="1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="1200" fill="#f1f5f9"/>
      <rect x="40" y="40" width="1120" height="1120" rx="40" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="600" y="500" text-anchor="middle" font-family="Inter, sans-serif" font-size="60" font-weight="700" fill="#FE2418">${escapeXml(marca.toUpperCase())}</text>
      <text x="600" y="600" text-anchor="middle" font-family="Inter, sans-serif" font-size="40" fill="#091C49">${escapeXml(nombre.slice(0, 32))}</text>
      <text x="600" y="700" text-anchor="middle" font-family="Inter, sans-serif" font-size="24" fill="#64748b">Imagen no disponible</text>
    </svg>`;

    await sharp(Buffer.from(svg))
        .webp({ quality: 80 })
        .toFile(mainWebp);

    return { main: `/images/productos/${baseName}.webp`, source: 'placeholder' };
}

module.exports = {
    processAndSave,
    generatePlaceholder,
    validateBuffer
};
