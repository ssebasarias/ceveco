#!/usr/bin/env node
/**
 * scripts/scraping/fetch-product-data.js
 *
 * Scraper profesional de productos: imágenes + descripción + specs reales
 * desde sitios oficiales de marca usando Playwright.
 *
 * Reemplaza al legacy `fetch-product-images.js` (que usaba Google Images y
 * DuckDuckGo y traía imágenes inconsistentes).
 *
 * Estrategia por producto:
 *   1. Resolver adaptador por marca (honda, suzuki, akt, yamaha, samurai,
 *      whirlpool, lg, samsung, mabe, haceb, challenger).
 *   2. Adaptador devuelve { source, sourceUrl, images, description, specs }.
 *      Si falla, intenta el fallback genérico (Google Images con
 *      site:<dominio-oficial>).
 *   3. Para cada URL de imagen: descargar, validar (≥800x800, ratio sano,
 *      tamaño mínimo), procesar con sharp y guardar en disco.
 *   4. UPSERT en producto_imagenes: la primera como principal, el resto como
 *      galería en order de aparición.
 *   5. updateProductData → descripcion_larga, specs, componentes,
 *      fuente_scrape, ultima_actualizacion_scrape.
 *      No pisa productos con manual_override = TRUE.
 *
 * Genera scripts/scraping/report.json con éxitos/placeholders/fallos para
 * que el coordinador resuelva manualmente los pendientes.
 *
 * Flags:
 *   --only <id>         Solo el producto con ese id_producto.
 *   --marca <nombre>    Solo productos cuya marca contenga ese texto.
 *   --limit <n>         Primeros N productos.
 *   --retry-placeholders  Repetir solo productos con fuente_scrape='placeholder'.
 *
 * Variables de entorno:
 *   SCRAPER_RATE_MS   Delay entre productos (default 2500 ms).
 *   SCRAPER_HEADED    "1" para abrir Chromium con UI (debug).
 */

const fs = require('fs');
const path = require('path');

const { launchBrowser, newPage, downloadImage } = require('./utils/playwright-driver');
const {
    processAndSave,
    validateBuffer,
    generatePlaceholder
} = require('./utils/image-processor');
const {
    pool,
    getProductsNeedingData,
    upsertMainImage,
    upsertExtraImage,
    updateProductData,
    close
} = require('./utils/db');

const BRAND_ADAPTERS = {
    honda: require('./brands/honda'),
    suzuki: require('./brands/suzuki'),
    akt: require('./brands/akt'),
    yamaha: require('./brands/yamaha'),
    samurai: require('./brands/samurai'),
    whirlpool: require('./brands/whirlpool'),
    lg: require('./brands/lg'),
    samsung: require('./brands/samsung'),
    mabe: require('./brands/mabe'),
    haceb: require('./brands/haceb'),
    challenger: require('./brands/challenger')
};
const FALLBACK = require('./brands/_generic-fallback');

const REPORT_PATH = path.join(__dirname, 'report.json');
const MAX_IMAGES_PER_PRODUCT = 4;

function pickAdapterKey(marca) {
    const m = (marca || '').toLowerCase();
    return Object.keys(BRAND_ADAPTERS).find(k => m.includes(k)) || null;
}

function parseArgs(argv) {
    const args = { only: null, marca: null, retryPlaceholders: false, limit: null };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--only') args.only = parseInt(argv[++i], 10);
        else if (a === '--marca') args.marca = argv[++i];
        else if (a === '--limit') args.limit = parseInt(argv[++i], 10);
        else if (a === '--retry-placeholders') args.retryPlaceholders = true;
    }
    return args;
}

function writeReport(report) {
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
}

/**
 * Procesa un producto individual: intenta primero el adaptador específico de
 * la marca, luego el fallback genérico. Devuelve { ok, source, count } o
 * { ok: false }. Acumula errores en report.lastErrors para debug.
 */
async function processProduct(product, browser, report) {
    const adapterKey = pickAdapterKey(product.marca);
    const adapters = [];
    if (adapterKey) {
        adapters.push({ name: adapterKey, mod: BRAND_ADAPTERS[adapterKey] });
    }
    adapters.push({ name: 'fallback', mod: FALLBACK });

    for (const { name, mod } of adapters) {
        let result;
        try {
            result = await mod.search(product, browser, { newPage });
        } catch (err) {
            report.lastErrors.push(`${name} error: ${err.message}`);
            continue;
        }

        if (!result || !Array.isArray(result.images) || result.images.length === 0) {
            report.lastErrors.push(`${name}: sin resultado`);
            continue;
        }

        // Descargar + validar + guardar imágenes.
        const saved = [];
        // Reutilizamos una página para todas las descargas (mismo contexto =
        // mismas cookies que el sitio nos sirvió la lista).
        const downloadPage = await newPage(browser);
        try {
            for (let i = 0; i < result.images.length && saved.length < MAX_IMAGES_PER_PRODUCT; i++) {
                const src = result.images[i];
                try {
                    const buf = await downloadImage(downloadPage, src, result.sourceUrl);
                    const val = await validateBuffer(buf);
                    if (!val.ok) {
                        report.lastErrors.push(`img ${i} (${src.slice(0, 60)}): ${val.reason}`);
                        continue;
                    }
                    const paths = await processAndSave(buf, product.id, saved.length);
                    saved.push(paths);
                } catch (err) {
                    report.lastErrors.push(`img ${i} (${src.slice(0, 60)}) descarga falló: ${err.message}`);
                }
            }
        } finally {
            await downloadPage.context().close().catch(() => {});
        }

        if (!saved.length) {
            // El adaptador encontró URLs pero ninguna pasó la validación.
            // Probamos el siguiente adaptador.
            continue;
        }

        // Persistir en BD.
        try {
            const altBase = `${product.marca} ${product.nombre}`;
            await upsertMainImage(product.id, saved[0].main, altBase);
            for (let i = 1; i < saved.length; i++) {
                await upsertExtraImage(product.id, saved[i].main, `${altBase} (${i + 1})`, i);
            }
            await updateProductData(product.id, {
                descripcion_larga: result.description,
                specs: result.specs,
                componentes: result.componentes,
                fuente: result.source
            });
        } catch (err) {
            report.lastErrors.push(`db persist falló: ${err.message}`);
            return { ok: false };
        }

        return { ok: true, source: result.source, count: saved.length, sourceUrl: result.sourceUrl };
    }

    return { ok: false };
}

async function loadProducts(args) {
    let products = await getProductsNeedingData();

    if (args.retryPlaceholders) {
        // Cuando se pide retry, solo procesar los marcados como placeholder.
        const { rows } = await pool.query(
            `SELECT p.id_producto AS id, p.sku, p.nombre,
                    m.nombre AS marca, c.nombre AS categoria
               FROM productos p
               JOIN marcas m      ON m.id_marca      = p.id_marca
               JOIN categorias c  ON c.id_categoria  = p.id_categoria
              WHERE p.fuente_scrape = 'placeholder'
                AND COALESCE(p.manual_override, FALSE) = FALSE
              ORDER BY p.id_producto`
        );
        products = rows;
    }

    if (args.only) products = products.filter(p => p.id === args.only);
    if (args.marca) {
        const needle = args.marca.toLowerCase();
        products = products.filter(p => (p.marca || '').toLowerCase().includes(needle));
    }
    if (args.limit) products = products.slice(0, args.limit);

    return products;
}

async function main() {
    const args = parseArgs(process.argv);
    const products = await loadProducts(args);

    console.log(`📦 ${products.length} productos a procesar`);
    if (!products.length) {
        await close();
        return;
    }

    const browser = await launchBrowser({
        headless: !(process.env.SCRAPER_HEADED === '1')
    });

    const report = {
        started_at: new Date().toISOString(),
        total: products.length,
        success: [],
        placeholder: [],
        failed: [],
        lastErrors: []
    };

    const rateMs = parseInt(process.env.SCRAPER_RATE_MS || '2500', 10);

    try {
        let i = 0;
        for (const p of products) {
            i++;
            const tag = `[${i}/${products.length}] #${p.id} ${p.marca} ${p.nombre}`;
            console.log(`\n→ ${tag}`);
            report.lastErrors = [];

            try {
                const r = await processProduct(p, browser, report);
                if (r.ok) {
                    console.log(`   ✅ ${r.source} (${r.count} imgs)`);
                    report.success.push({
                        id: p.id,
                        sku: p.sku,
                        marca: p.marca,
                        source: r.source,
                        sourceUrl: r.sourceUrl,
                        count: r.count
                    });
                } else {
                    console.log(`   ⚠️  Fallaron adaptadores. Generando placeholder.`);
                    const ph = await generatePlaceholder(p.id, p.marca || '', p.nombre || '');
                    await upsertMainImage(p.id, ph.main, `${p.marca} ${p.nombre}`);
                    await updateProductData(p.id, {
                        descripcion_larga: null,
                        specs: null,
                        componentes: null,
                        fuente: 'placeholder'
                    });
                    report.placeholder.push({
                        id: p.id,
                        sku: p.sku,
                        marca: p.marca,
                        errors: [...report.lastErrors]
                    });
                }
            } catch (err) {
                console.error(`   ❌ FATAL: ${err.message}`);
                report.failed.push({ id: p.id, sku: p.sku, error: err.message });
            }

            report.last_processed_at = new Date().toISOString();
            report.progress = { done: i, total: products.length };
            writeReport(report);

            if (i < products.length) {
                await new Promise(r => setTimeout(r, rateMs));
            }
        }
    } finally {
        await browser.close().catch(() => {});
        await close().catch(() => {});
        report.finished_at = new Date().toISOString();
        writeReport(report);
    }

    console.log(`\n🎉 Listo.`);
    console.log(`   ✅ Éxitos:        ${report.success.length}`);
    console.log(`   🎨 Placeholders:  ${report.placeholder.length}`);
    console.log(`   ❌ Errores:       ${report.failed.length}`);
    console.log(`   Reporte: ${REPORT_PATH}`);
}

main().catch(err => {
    console.error('FATAL:', err);
    process.exit(1);
});
