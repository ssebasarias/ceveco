#!/usr/bin/env node
/**
 * Genera imágenes placeholder limpias y profesionales para productos cuyas
 * imágenes actuales no corresponden con el producto (ej. fotos genéricas de
 * marca, ilustraciones AI sin relación, "imagen no disponible").
 *
 * Salida: writes `{id}.webp` y `{id}_thumb.webp` en backend/public/images/productos/
 * y actualiza producto_imagenes para apuntar a ellas. Marca el producto con
 * fuente_scrape='placeholder' para que el admin sepa que necesita subir la real.
 *
 * Lista de productos viene por argumento o --all-brand=<marca>.
 *
 * Uso:
 *   node scripts/maintenance/regenerate-placeholders.js --ids 518,519,520,521,523
 *   node scripts/maintenance/regenerate-placeholders.js --all-brand Samurai
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../backend/.env') });
const { Pool } = require('pg');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'ceveco_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

const OUTPUT_DIR = path.join(__dirname, '../../backend/public/images/productos');

function escapeXml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function buildSvg(marca, nombre) {
    const m = escapeXml((marca || '').toUpperCase());
    const n = escapeXml((nombre || '').slice(0, 44));
    return `
<svg width="1200" height="1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <rect x="60" y="60" width="1080" height="1080" rx="32" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  <g transform="translate(600 540)">
    <circle r="120" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    <path d="M-50 -10 L-10 30 L60 -40" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
  <text x="600" y="780" text-anchor="middle" font-family="Inter, Manrope, sans-serif" font-size="56" font-weight="700" fill="#091C49" letter-spacing="2">${m}</text>
  <text x="600" y="860" text-anchor="middle" font-family="Inter, sans-serif" font-size="32" fill="#475569">${n}</text>
  <text x="600" y="1100" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" fill="#94a3b8">Imagen no disponible · Contacta a un asesor</text>
</svg>`.trim();
}

async function regeneratePlaceholder(p) {
    const svg = buildSvg(p.marca, p.nombre);
    const mainWebp = path.join(OUTPUT_DIR, `${p.id_producto}.webp`);
    const thumbWebp = path.join(OUTPUT_DIR, `${p.id_producto}_thumb.webp`);
    const jpg = path.join(OUTPUT_DIR, `${p.id_producto}.jpg`);

    const buf = Buffer.from(svg);

    await sharp(buf).webp({ quality: 85 }).toFile(mainWebp);
    await sharp(buf).resize(400, 400).webp({ quality: 80 }).toFile(thumbWebp);
    await sharp(buf).resize(1200, 1200).jpeg({ quality: 88 }).toFile(jpg);

    const url = `/images/productos/${p.id_producto}.webp`;
    const altText = `${p.marca} ${p.nombre}`;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Borrar todas las imágenes existentes (las reemplazamos)
        await client.query('DELETE FROM producto_imagenes WHERE id_producto = $1', [p.id_producto]);
        await client.query(
            `INSERT INTO producto_imagenes (id_producto, url_imagen, alt_text, orden, es_principal)
             VALUES ($1, $2, $3, 0, TRUE)`,
            [p.id_producto, url, altText]
        );
        await client.query(
            `UPDATE productos
                SET fuente_scrape = 'placeholder',
                    ultima_actualizacion_scrape = NOW()
              WHERE id_producto = $1`,
            [p.id_producto]
        );
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

function parseArgs() {
    const args = { ids: null, brand: null };
    for (let i = 2; i < process.argv.length; i++) {
        const a = process.argv[i];
        if (a === '--ids') args.ids = process.argv[++i].split(',').map(n => parseInt(n, 10)).filter(Boolean);
        else if (a === '--all-brand') args.brand = process.argv[++i];
    }
    return args;
}

async function main() {
    const args = parseArgs();
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    let products;
    if (args.brand) {
        const { rows } = await pool.query(
            `SELECT p.id_producto, p.nombre, m.nombre AS marca
               FROM productos p
               JOIN marcas m ON m.id_marca = p.id_marca
              WHERE p.activo = TRUE AND LOWER(m.nombre) = LOWER($1)
              ORDER BY p.id_producto`,
            [args.brand]
        );
        products = rows;
    } else if (args.ids?.length) {
        const { rows } = await pool.query(
            `SELECT p.id_producto, p.nombre, m.nombre AS marca
               FROM productos p
               JOIN marcas m ON m.id_marca = p.id_marca
              WHERE p.id_producto = ANY($1::int[])
              ORDER BY p.id_producto`,
            [args.ids]
        );
        products = rows;
    } else {
        console.error('Uso: --ids 518,519  ó  --all-brand Samurai');
        process.exit(1);
    }

    console.log(`📦 Regenerando placeholders para ${products.length} productos`);
    for (const p of products) {
        console.log(`→ #${p.id_producto} ${p.marca} ${p.nombre.slice(0, 50)}`);
        await regeneratePlaceholder(p);
    }
    console.log('✅ Listo.');
    await pool.end();
}

main().catch(err => {
    console.error('FATAL:', err);
    process.exit(1);
});
