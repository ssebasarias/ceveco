/**
 * 📊 Reporte Completo de Scraping - Primer Producto de Cada Excel
 * Muestra TODA la información obtenida y el plan de inserción en BD
 */

require('dotenv').config({ path: './backend/.env' });
const ExcelNormalizer = require('./lib/excel-normalizer');
const RuleBasedClassifier = require('./lib/rule-based-classifier');
const axios = require('axios');
const cheerio = require('cheerio');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class DetailedEnricher {
    constructor() {
        this.imagesDir = path.join(__dirname, 'scraped_images');
        if (!fs.existsSync(this.imagesDir)) {
            fs.mkdirSync(this.imagesDir, { recursive: true });
        }
    }

    async searchImages(query) {
        try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            const images = [];

            $('img').each((i, elem) => {
                const src = $(elem).attr('src') || $(elem).attr('data-src');
                if (src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon')) {
                    images.push(src);
                }
            });

            return images.slice(0, 3);
        } catch (error) {
            return [];
        }
    }

    async downloadImage(url, productRef, index) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 15000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            const buffer = Buffer.from(response.data);
            const filename = `${productRef.replace(/[^a-zA-Z0-9]/g, '_')}_${index}.webp`;
            const filepath = path.join(this.imagesDir, filename);

            await sharp(buffer)
                .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 85 })
                .toFile(filepath);

            const stats = fs.statSync(filepath);

            return {
                filename,
                filepath,
                size: stats.size,
                url: `/images/products/${filename}`,
                original_url: url
            };
        } catch (error) {
            return null;
        }
    }
}

async function generateScrapingReport() {
    console.log('\n' + '█'.repeat(120));
    console.log('📊 REPORTE COMPLETO DE SCRAPING - PRIMER PRODUCTO DE CADA EXCEL');
    console.log('█'.repeat(120) + '\n');

    const enricher = new DetailedEnricher();
    const classifier = new RuleBasedClassifier({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    const normalizer = new ExcelNormalizer();
    const rawDataDir = path.join(__dirname, 'raw_data');
    const files = fs.readdirSync(rawDataDir).filter(f => f.endsWith('.xlsx'));

    const allResults = [];

    for (const file of files) {
        console.log('\n' + '═'.repeat(120));
        console.log(`📁 ARCHIVO: ${file}`);
        console.log('═'.repeat(120));

        try {
            const filePath = path.join(rawDataDir, file);
            const products = normalizer.readAndNormalize(filePath);

            if (products.length === 0) {
                console.log('⚠️  Sin productos\n');
                continue;
            }

            const product = products[0];

            // ═══════════════════════════════════════════════════════════════
            console.log('\n┌─ DATOS ORIGINALES DEL EXCEL ─────────────────────────────────────────────────┐');
            console.log('│');
            console.log(`│  📋 REF Excel:           ${product.ref}`);
            console.log(`│  📝 Nombre Excel:        ${product.nombre}`);
            console.log(`│  📂 Categoría Excel:     ${product.categoria}`);
            console.log(`│  💰 Precio Contado:      $${product.precio_contado.toLocaleString()}`);
            console.log(`│  🏷️  Precio Promoción:    $${product.precio_promo.toLocaleString()}`);
            console.log('│');
            console.log('└──────────────────────────────────────────────────────────────────────────────┘');

            // ═══════════════════════════════════════════════════════════════
            console.log('\n┌─ CLASIFICACIÓN AUTOMÁTICA ───────────────────────────────────────────────────┐');
            const classification = await classifier.classifyProduct({
                ref: product.ref,
                nombre: product.nombre,
                categoria: product.categoria,
                archivo: file
            });

            console.log('│');
            console.log(`│  📁 Categoría Principal:  ${classification.categoria.nombre} (ID: ${classification.categoria.id})`);
            console.log(`│     Confianza:           ${(classification.categoria.confianza * 100).toFixed(0)}%`);
            console.log('│');
            console.log(`│  📂 Subcategoría:        ${classification.subcategoria.nombre} (ID: ${classification.subcategoria.id})`);
            console.log(`│     Acción:              ${classification.subcategoria.accion}`);
            console.log(`│     Razón:               ${classification.subcategoria.razon}`);
            console.log('│');
            console.log(`│  🏷️  Marca:               ${classification.marca.nombre} ${classification.marca.id ? `(ID: ${classification.marca.id})` : '(nueva)'}`);
            console.log(`│     Acción:              ${classification.marca.accion}`);
            console.log('│');

            if (classification.atributos && classification.atributos.length > 0) {
                console.log(`│  🔧 Atributos Detectados:`);
                classification.atributos.forEach(attr => {
                    console.log(`│     • ${attr.nombre}: ${attr.valor}${attr.unidad ? ' ' + attr.unidad : ''}`);
                });
            } else {
                console.log(`│  🔧 Atributos:           Ninguno detectado`);
            }

            console.log(`│`);
            console.log(`│  📝 Nombre Sugerido:     ${classification.nombre_sugerido}`);
            console.log('│');
            console.log('└──────────────────────────────────────────────────────────────────────────────┘');

            // ═══════════════════════════════════════════════════════════════
            console.log('\n┌─ SCRAPING WEB ───────────────────────────────────────────────────────────────┐');
            const searchQuery = `${classification.marca.nombre} ${product.ref} ${product.nombre}`;
            console.log('│');
            console.log(`│  🔍 Query de búsqueda:   "${searchQuery.substring(0, 70)}${searchQuery.length > 70 ? '...' : ''}"`);
            console.log('│');

            const images = await enricher.searchImages(searchQuery);
            console.log(`│  🖼️  Imágenes encontradas: ${images.length}`);

            if (images.length > 0) {
                console.log('│');
                images.forEach((img, idx) => {
                    console.log(`│     ${idx + 1}. ${img.substring(0, 80)}${img.length > 80 ? '...' : ''}`);
                });
            }
            console.log('│');
            console.log('└──────────────────────────────────────────────────────────────────────────────┘');

            // ═══════════════════════════════════════════════════════════════
            console.log('\n┌─ DESCARGA Y OPTIMIZACIÓN DE IMÁGENES ────────────────────────────────────────┐');
            console.log('│');

            const downloadedImages = [];
            for (let i = 0; i < images.length; i++) {
                console.log(`│  📥 Descargando imagen ${i + 1}/${images.length}...`);
                const result = await enricher.downloadImage(images[i], product.ref, i + 1);
                if (result) {
                    console.log(`│     ✅ ${result.filename}`);
                    console.log(`│        Tamaño: ${(result.size / 1024).toFixed(1)} KB`);
                    console.log(`│        Ruta: ${result.filepath}`);
                    console.log(`│        URL BD: ${result.url}`);
                    downloadedImages.push(result);
                } else {
                    console.log(`│     ❌ Error descargando`);
                }
                console.log('│');
            }

            console.log(`│  ✅ Total descargadas: ${downloadedImages.length}/${images.length}`);
            console.log('│');
            console.log('└──────────────────────────────────────────────────────────────────────────────┘');

            // ═══════════════════════════════════════════════════════════════
            console.log('\n┌─ DATOS FINALES PARA INSERCIÓN EN BD ─────────────────────────────────────────┐');

            const finalProduct = {
                ref: product.ref,
                nombre: classification.nombre_sugerido || product.nombre,
                descripcion_corta: `${classification.marca.nombre} ${product.nombre.substring(0, 150)}`,
                descripcion_larga: `<p>${classification.marca.nombre} ${product.nombre}</p><p>Precio especial: $${product.precio_contado.toLocaleString()}</p>`,
                id_categoria: classification.categoria.id,
                id_subcategoria: classification.subcategoria.id,
                id_marca: classification.marca.id || 1,
                precio: product.precio_contado,
                precio_oferta: product.precio_promo,
                stock: 10,
                activo: true,
                destacado: false,
                imagenes: downloadedImages,
                atributos: classification.atributos || []
            };

            console.log('│');
            console.log('│  📦 TABLA: productos');
            console.log('│  ─────────────────────────────────────────────────────────────────────────────');
            console.log(`│     ref:                 '${finalProduct.ref}'`);
            console.log(`│     nombre:              '${finalProduct.nombre.substring(0, 60)}${finalProduct.nombre.length > 60 ? '...' : ''}'`);
            console.log(`│     descripcion_corta:   '${finalProduct.descripcion_corta.substring(0, 60)}${finalProduct.descripcion_corta.length > 60 ? '...' : ''}'`);
            console.log(`│     descripcion_larga:   '${finalProduct.descripcion_larga.substring(0, 60)}${finalProduct.descripcion_larga.length > 60 ? '...' : ''}'`);
            console.log(`│     id_categoria:        ${finalProduct.id_categoria}`);
            console.log(`│     id_subcategoria:     ${finalProduct.id_subcategoria}`);
            console.log(`│     id_marca:            ${finalProduct.id_marca}`);
            console.log(`│     precio:              ${finalProduct.precio}`);
            console.log(`│     precio_oferta:       ${finalProduct.precio_oferta}`);
            console.log(`│     stock:               ${finalProduct.stock}`);
            console.log(`│     activo:              ${finalProduct.activo}`);
            console.log(`│     destacado:           ${finalProduct.destacado}`);
            console.log('│');

            if (downloadedImages.length > 0) {
                console.log('│  🖼️  TABLA: producto_imagenes');
                console.log('│  ─────────────────────────────────────────────────────────────────────────────');
                downloadedImages.forEach((img, idx) => {
                    console.log(`│     Imagen ${idx + 1}:`);
                    console.log(`│       url:             '${img.url}'`);
                    console.log(`│       orden:           ${idx + 1}`);
                    console.log(`│       es_principal:    ${idx === 0}`);
                    console.log('│');
                });
            }

            if (finalProduct.atributos.length > 0) {
                console.log('│  🔧 TABLA: producto_atributos');
                console.log('│  ─────────────────────────────────────────────────────────────────────────────');
                finalProduct.atributos.forEach(attr => {
                    console.log(`│     Atributo:`);
                    console.log(`│       nombre:          '${attr.nombre}'`);
                    console.log(`│       valor:           '${attr.valor}'`);
                    console.log(`│       unidad:          ${attr.unidad ? `'${attr.unidad}'` : 'NULL'}`);
                    console.log('│');
                });
            }

            console.log('└──────────────────────────────────────────────────────────────────────────────┘');

            allResults.push({
                archivo: file,
                original: product,
                clasificacion: classification,
                imagenes_scrapeadas: images.length,
                imagenes_descargadas: downloadedImages.length,
                final: finalProduct,
                exito: true
            });

        } catch (error) {
            console.error(`\n❌ Error: ${error.message}`);
            allResults.push({
                archivo: file,
                error: error.message,
                exito: false
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════
    console.log('\n\n' + '█'.repeat(120));
    console.log('📊 RESUMEN GENERAL');
    console.log('█'.repeat(120));

    const exitosos = allResults.filter(r => r.exito);
    const fallidos = allResults.filter(r => !r.exito);

    console.log(`\n✅ Productos procesados exitosamente: ${exitosos.length}/${files.length}`);
    console.log(`❌ Errores: ${fallidos.length}/${files.length}`);

    console.log('\n📊 ESTADÍSTICAS:');
    console.log(`   Total imágenes scrapeadas: ${exitosos.reduce((sum, r) => sum + r.imagenes_scrapeadas, 0)}`);
    console.log(`   Total imágenes descargadas: ${exitosos.reduce((sum, r) => sum + r.imagenes_descargadas, 0)}`);
    console.log(`   Promedio imágenes por producto: ${(exitosos.reduce((sum, r) => sum + r.imagenes_descargadas, 0) / exitosos.length).toFixed(1)}`);

    const totalSize = fs.readdirSync(enricher.imagesDir)
        .map(f => fs.statSync(path.join(enricher.imagesDir, f)).size)
        .reduce((sum, size) => sum + size, 0);

    console.log(`   Espacio total imágenes: ${(totalSize / 1024).toFixed(1)} KB`);
    console.log(`   Promedio por imagen: ${(totalSize / exitosos.reduce((sum, r) => sum + r.imagenes_descargadas, 0) / 1024).toFixed(1)} KB`);

    console.log('\n📁 ARCHIVOS GENERADOS:');
    console.log(`   📂 Carpeta imágenes: ${enricher.imagesDir}`);
    console.log(`   🖼️  Total archivos: ${fs.readdirSync(enricher.imagesDir).length}`);

    console.log('\n💡 SIGUIENTE PASO:');
    console.log('   Si todo se ve correcto, puedes:');
    console.log('   1. Revisar las imágenes en: scraped_images/');
    console.log('   2. Procesar todos los productos: node product-enrichment-full.js');
    console.log('   3. O procesar por lotes para ir verificando');

    console.log('\n' + '█'.repeat(120));
    console.log('✅ REPORTE COMPLETADO');
    console.log('█'.repeat(120) + '\n');

    // Guardar reporte JSON
    const reportPath = path.join(__dirname, 'reporte_scraping_completo.json');
    fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2));
    console.log(`💾 Reporte JSON guardado en: ${reportPath}\n`);

    await classifier.close();
}

generateScrapingReport().catch(error => {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
});
