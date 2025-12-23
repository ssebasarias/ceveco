const path = require('path');
const fs = require('fs');
const db = require('../lib/db-config');
const excelParser = require('../lib/excel-parser');
const imageScraper = require('../lib/image-scraper');

class MotosIngestor {
    constructor() {
        this.stats = { processed: 0, inserted: 0, images: 0, errors: 0 };
        this.imageDir = path.join(__dirname, '../../../backend/public/images/products/motos');
    }

    async ensureDirectory() {
        if (!fs.existsSync(this.imageDir)) {
            fs.mkdirSync(this.imageDir, { recursive: true });
        }
    }

    // ---------------------------------------------------------
    // 🧠 LOGIC: BRAND SPECIFIC STRATEGIES
    // ---------------------------------------------------------

    getBrandStrategy(brandName) {
        if (brandName.match(/honda/i)) return this.strategyHonda;
        if (brandName.match(/suzuki/i)) return this.strategySuzuki;
        return this.strategyGeneric;
    }

    strategyHonda = {
        generateTitle: (product) => {
            let title = 'Honda';
            const name = product.nombre || product.referencia || '';
            const modelMatch = name.match(/([A-Z]+\s*\d+[A-Z]*(?:\s*\d+\.\d+)?)/i);
            if (modelMatch) title += ` ${modelMatch[1].trim()}`;

            const yearMatch = name.match(/(\d{4})/);
            if (yearMatch) title += ` ${yearMatch[1]}`;

            const features = [];
            if (name.includes('CBS')) features.push('CBS');
            if (name.includes('DLX')) features.push('DLX');
            if (name.includes('ABS')) features.push('ABS');

            if (features.length > 0) title += ` ${features.join(' ')}`;
            return title;
        },
        generateDescription: (title) => {
            const model = title.replace('Honda ', '');
            let usage = 'ciudad y carretera';
            if (model.includes('WAVE') || model.includes('DIO')) usage = 'ciudad, económica y ágil';
            if (model.includes('XR') || model.includes('XRE')) usage = 'todoterreno y aventura';
            if (model.includes('CB')) usage = 'urbano y deportivo';

            return {
                short: `Motocicleta ${title}. Ideal para ${usage}.`,
                long: `<div class="product-description">
                        <h3>${title}</h3>
                        <p>Motocicleta Honda ${model}. Diseñada para ofrecer rendimiento y durabilidad.</p>
                        <ul>
                            <li><strong>Marca:</strong> Honda</li>
                            <li><strong>Modelo:</strong> ${model}</li>
                            <li><strong>Uso:</strong> ${usage}</li>
                        </ul>
                        <p><strong>Garantía y respaldo Honda.</strong></p>
                       </div>`
            };
        }
    };

    strategySuzuki = {
        generateTitle: (product) => {
            let title = 'Suzuki';
            const name = product.nombre || product.referencia || '';
            const modelMatch = name.match(/([A-Z]+\s*\d+[A-Z]*(?:\s*\d+\.\d+)?)/i);
            if (modelMatch) title += ` ${modelMatch[1].trim()}`;

            const yearMatch = name.match(/(\d{4})/);
            if (yearMatch) title += ` ${yearMatch[1]}`;

            return title;
        },
        generateDescription: (title) => {
            return {
                short: `Motocicleta ${title}. Tecnología Japonesa.`,
                long: `<div class="product-description"><h3>${title}</h3><p>Suzuki ${title}, rendimiento superior.</p></div>`
            };
        }
    };

    strategyGeneric = {
        generateTitle: (p) => p.nombre,
        generateDescription: (t) => ({ short: t, long: t })
    };

    // ---------------------------------------------------------
    // ⚙️ CORE PROCESS
    // ---------------------------------------------------------

    async processProduct(product, brandName, categoryIds) {
        const strategy = this.getBrandStrategy(brandName);
        const title = strategy.generateTitle(product);
        const description = strategy.generateDescription(title);

        console.log(`\n📦 Processing: ${title}`);

        try {
            // Check existence
            const sku = product.ref || product.sku || product.referencia;
            const existing = await db.query('SELECT id_producto FROM productos WHERE sku = $1', [sku]);
            let productId;

            if (existing.rows.length > 0) {
                productId = existing.rows[0].id_producto;
                console.log(`   ⏭️  Exists (ID: ${productId})`);
            } else {
                const price = product.precio_contado || product.precio || 0;
                const promo = product.precio_promo || null;

                const res = await db.query(`
                    INSERT INTO productos (sku, nombre, descripcion_corta, descripcion_larga, precio_actual, precio_promocional, id_marca, id_categoria, id_subcategoria, stock, activo)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 10, true)
                    RETURNING id_producto
                `, [sku, title, description.short, description.long, price, promo, categoryIds.marca, categoryIds.categoria, categoryIds.subcategoria]);

                productId = res.rows[0].id_producto;
                this.stats.inserted++;
                console.log(`   ✅ Inserted (ID: ${productId})`);
            }

            // Image Logic (Shared Scraper)
            await this.processImages(productId, title, sku);

            this.stats.processed++;
        } catch (err) {
            console.error(`   ❌ Error: ${err.message}`);
            this.stats.errors++;
        }
    }

    async processImages(productId, title, sku) {
        const existingImgs = await db.query('SELECT COUNT(*) as c FROM producto_imagenes WHERE id_producto = $1', [productId]);
        if (parseInt(existingImgs.rows[0].c) > 0) return; // Skip if has images

        const modelName = title.split(' ').slice(1).join(' '); // Remove Brand
        const queries = [
            `${title} moto Colombia`,
            `${title} motorcycle official`,
            `moto ${modelName} nueva`
        ];

        let imageCount = 0;
        const seenHashes = new Set();

        for (const query of queries) {
            if (imageCount >= 3) break;
            console.log(`   🔍 Searching img: "${query}"`);

            const urls = await imageScraper.searchGoogleImages(query, 5);

            for (const url of urls) {
                if (imageCount >= 3) break;

                const result = await imageScraper.downloadImage(url);
                if (result.success && !seenHashes.has(result.hash)) {
                    seenHashes.add(result.hash);
                    const filename = `${sku.replace(/[^a-z0-9]/gi, '_')}_${imageCount + 1}.${result.extension}`;
                    fs.writeFileSync(path.join(this.imageDir, filename), result.buffer);

                    await db.query(`
                        INSERT INTO producto_imagenes (id_producto, url_imagen, orden, es_principal)
                        VALUES ($1, $2, $3, $4)
                    `, [productId, `/images/products/motos/${filename}`, imageCount + 1, imageCount === 0]);

                    imageCount++;
                    this.stats.images++;
                    console.log(`      📸 Saved: ${filename}`);
                }
                await new Promise(r => setTimeout(r, 500)); // Politeness
            }
            await new Promise(r => setTimeout(r, 1500)); // Politeness
        }
    }

    async execute(filePath, brandName = 'Honda') {
        console.log('='.repeat(50));
        console.log(`🏍️  MOTO INGESTOR - Brand: ${brandName}`);
        console.log('='.repeat(50));

        await this.ensureDirectory();

        // simple Category lookup (assumed fixed IDs based on docs, but good to query)
        // For brevity, querying assuming existing structure
        const catRes = await db.query("SELECT id_categoria FROM categorias WHERE nombre = 'Motos'");
        const catId = catRes.rows[0]?.id_categoria || 3;

        const subCatRes = await db.query("SELECT id_subcategoria FROM subcategorias WHERE nombre = 'Motos Urbanas' OR nombre = 'Motocicletas' LIMIT 1");
        const subCatId = subCatRes.rows[0]?.id_subcategoria || 1;

        // Get/Create Brand
        let brandId;
        const brandRes = await db.query('SELECT id_marca FROM marcas WHERE nombre ILIKE $1', [brandName]);
        if (brandRes.rows.length === 0) {
            const newBrand = await db.query('INSERT INTO marcas (nombre, slug, activo) VALUES ($1, $2, true) RETURNING id_marca', [brandName, brandName.toLowerCase()]);
            brandId = newBrand.rows[0].id_marca;
        } else {
            brandId = brandRes.rows[0].id_marca;
        }

        const data = excelParser.processData(filePath);
        console.log(`📂 Found ${data.length} items in ${path.basename(filePath)}\n`);

        for (const item of data) {
            await this.processProduct(item, brandName, { marca: brandId, categoria: catId, subcategoria: subCatId });
        }

        console.log('\n' + '='.repeat(50));
        console.log('✅ DONE');
        console.log(this.stats);
        await db.end();
    }
}

// Allow direct execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const fileArg = args.find(a => a.endsWith('.xlsx')) || path.join(__dirname, '../../../raw_data/HONDA AGOSTO 01 2025.xlsx');
    const brandArg = args.find(a => !a.endsWith('.xlsx')) || 'Honda';

    new MotosIngestor().execute(fileArg, brandArg);
}

module.exports = MotosIngestor;
