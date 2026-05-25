const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '../../../backend/public/images/productos');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const MIN_DIMENSION = 300;
const MAX_DIMENSION = 1200;
const THUMB_DIMENSION = 400;

async function processAndSave(buffer, idProducto) {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) {
        throw new Error('Imagen sin metadata válida');
    }
    if (meta.width < MIN_DIMENSION || meta.height < MIN_DIMENSION) {
        throw new Error(`Imagen demasiado pequeña: ${meta.width}x${meta.height}`);
    }

    const baseName = String(idProducto);
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

    await sharp(buffer)
        .resize(THUMB_DIMENSION, THUMB_DIMENSION, { fit: 'cover', position: 'centre' })
        .webp({ quality: 80 })
        .toFile(thumbWebp);

    return {
        main: `/images/productos/${baseName}.webp`,
        mainJpg: `/images/productos/${baseName}.jpg`,
        thumb: `/images/productos/${baseName}_thumb.webp`,
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

module.exports = { processAndSave, generatePlaceholder };
