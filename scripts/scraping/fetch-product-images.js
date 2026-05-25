#!/usr/bin/env node
/**
 * Scraper de imágenes de producto para Ceveco.
 *
 * Estrategia:
 *   1. Para cada producto sin imagen local, buscar en fuentes en orden:
 *      - Google Images (con preferencia por dominios .co y de marca)
 *      - DuckDuckGo Images (fallback)
 *   2. Descargar el primer resultado válido (>5 KB, >300x300).
 *   3. Procesar con sharp → WebP 1200x1200 + JPG + thumb 400x400.
 *   4. Guardar en backend/public/images/productos/.
 *   5. UPSERT en producto_imagenes con es_principal=true.
 *   6. Para los que fallen, generar placeholder SVG con marca + nombre.
 *
 * Salida:
 *   - scripts/scraping/report.json con detalle de éxitos/fallos
 *   - logs en stdout (también en scripts/scraping/scraper.log si se redirige)
 *
 * Uso:
 *   node scripts/scraping/fetch-product-images.js              # todos
 *   node scripts/scraping/fetch-product-images.js --limit 5    # primeros 5
 *   node scripts/scraping/fetch-product-images.js --only 954   # solo ese id
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const { getProductsNeedingImage, upsertMainImage, close } = require('./utils/db');
const { processAndSave, generatePlaceholder } = require('./utils/image-processor');

const SOURCES = [
    { name: 'google-images', ...require('./sources/google-images') },
    { name: 'duckduckgo-images', ...require('./sources/duckduckgo-images') }
];

const RATE_LIMIT_MS = parseInt(process.env.SCRAPER_RATE_MS || '1500', 10);
const MAX_RETRIES_PER_SOURCE = 1;
const MIN_FILE_SIZE = 5000;
const DOWNLOAD_TIMEOUT_MS = 20000;

function parseArgs(argv) {
    const args = { limit: null, only: null };
    for (let i = 2; i < argv.length; i++) {
        if (argv[i] === '--limit') args.limit = parseInt(argv[++i], 10);
        else if (argv[i] === '--only') args.only = parseInt(argv[++i], 10);
    }
    return args;
}

async function downloadBuffer(url, referer = null) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    };
    if (referer) headers['Referer'] = referer;
    const r = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: DOWNLOAD_TIMEOUT_MS,
        headers,
        maxRedirects: 5,
        validateStatus: s => s >= 200 && s < 400
    });
    return Buffer.from(r.data);
}

async function tryProduct(product, browser) {
    const errors = [];
    for (const source of SOURCES) {
        const sourceName = source.name || 'unknown';
        for (let attempt = 0; attempt < MAX_RETRIES_PER_SOURCE + 1; attempt++) {
            try {
                const result = await source.search(product, browser);
                if (!result || !result.url) {
                    errors.push(`${result?.source || sourceName}: no result`);
                    break;
                }
                const buffer = await downloadBuffer(result.url);
                if (buffer.length < MIN_FILE_SIZE) {
                    errors.push(`${result.source}: archivo muy pequeño (${buffer.length}B)`);
                    break;
                }
                const paths = await processAndSave(buffer, product.id);
                await upsertMainImage(product.id, paths.main, `${product.marca} ${product.nombre}`);
                return { ok: true, source: result.source, url: result.url, paths };
            } catch (err) {
                errors.push(`${sourceName} attempt ${attempt + 1}: ${err.message}`);
                if (attempt < MAX_RETRIES_PER_SOURCE) {
                    await new Promise(r => setTimeout(r, 800));
                }
            }
        }
    }
    return { ok: false, errors };
}

async function processAll() {
    const args = parseArgs(process.argv);
    let products = await getProductsNeedingImage();
    if (args.only) products = products.filter(p => p.id === args.only);
    if (args.limit) products = products.slice(0, args.limit);

    console.log(`📦 Procesando ${products.length} productos`);
    if (products.length === 0) {
        console.log('Nada que hacer. Salida.');
        await close();
        return;
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });

    const report = {
        started_at: new Date().toISOString(),
        total: products.length,
        success: [],
        placeholder: [],
        failed: []
    };

    let i = 0;
    for (const product of products) {
        i++;
        const tag = `[${i}/${products.length}] #${product.id} ${product.marca} ${product.nombre}`;
        console.log(`\n→ ${tag}`);
        try {
            const r = await tryProduct(product, browser);
            if (r.ok) {
                console.log(`   ✅ OK via ${r.source} (${r.paths.meta?.width}x${r.paths.meta?.height})`);
                report.success.push({ id: product.id, sku: product.sku, source: r.source, url: r.url, paths: r.paths });
            } else {
                console.log(`   ⚠️  Fallaron todas las fuentes: ${r.errors.join(' | ')}`);
                console.log(`   🎨 Generando placeholder...`);
                const ph = await generatePlaceholder(product.id, product.marca, product.nombre);
                await upsertMainImage(product.id, ph.main, `${product.marca} ${product.nombre}`);
                report.placeholder.push({ id: product.id, sku: product.sku, errors: r.errors });
            }
        } catch (err) {
            console.error(`   ❌ Error fatal: ${err.message}`);
            report.failed.push({ id: product.id, sku: product.sku, error: err.message });
        }

        // Save report incrementally so we can monitor progress
        report.last_processed_at = new Date().toISOString();
        report.progress = { done: i, total: products.length };
        fs.writeFileSync(
            path.join(__dirname, 'report.json'),
            JSON.stringify(report, null, 2)
        );

        if (i < products.length) {
            await new Promise(r => setTimeout(r, RATE_LIMIT_MS));
        }
    }

    await browser.close();
    await close();
    report.finished_at = new Date().toISOString();
    fs.writeFileSync(
        path.join(__dirname, 'report.json'),
        JSON.stringify(report, null, 2)
    );

    console.log(`\n🎉 Listo.`);
    console.log(`   ✅ Éxitos:      ${report.success.length}`);
    console.log(`   🎨 Placeholders: ${report.placeholder.length}`);
    console.log(`   ❌ Errores:     ${report.failed.length}`);
    console.log(`   Reporte: scripts/scraping/report.json`);
}

processAll().catch(err => {
    console.error('FATAL:', err);
    process.exit(1);
});
