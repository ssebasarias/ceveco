/**
 * 🧪 Prueba Completa con SQL e Imágenes Reales
 * - Scraping genérico (funciona con cualquier página)
 * - Muestra SQL real que se ejecutará
 * - Descarga y optimiza imágenes
 */

require('dotenv').config({ path: './backend/.env' });
const ExcelNormalizer = require('./lib/excel-normalizer');
const RuleBasedClassifier = require('./lib/rule-based-classifier');
const axios = require('axios');
const cheerio = require('cheerio');
const sharp = require('sharp');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class SimpleProductEnricher {
    constructor() {
        this.imagesDir = path.join(__dirname, 'product_images');
        if (!fs.existsSync(this.imagesDir)) {
            fs.mkdirSync(this.imagesDir, { recursive: true });
        }
    }

    /**
     * Búsqueda simple en Google (sin Puppeteer)
     */
    async searchImages(query) {
        try {
            // Usar API de búsqueda de imágenes gratuita
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;

            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            const images = [];

            // Extraer URLs de imágenes del HTML
            $('img').each((i, elem) => {
                const src = $(elem).attr('src') || $(elem).attr('data-src');
                if (src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon')) {
                    images.push(src);
                }
            });

            return images.slice(0, 5); // Primeras 5

        } catch (error) {
            console.log(`   ⚠️  Error en búsqueda: ${error.message}`);
            return [];
        }
    }

    /**
     * Descargar y optimizar imagen
     */
    async downloadAndOptimizeImage(url, productRef, index) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const buffer = Buffer.from(response.data);

            // Generar nombre de archivo
            const filename = `${productRef.replace(/[^a-zA-Z0-9]/g, '_')}_${index}.webp`;
            const filepath = path.join(this.imagesDir, filename);

            // Optimizar y convertir a WebP
            await sharp(buffer)
                .resize(800, 800, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 85 })
                .toFile(filepath);

            const stats = fs.statSync(filepath);

            return {
                filename,
                filepath,
                size: stats.size,
                url: `/images/products/${filename}`
            };

        } catch (error) {
            console.log(`   ⚠️  Error descargando imagen ${index}: ${error.message}`);
            return null;
        }
    }

    /**
     * Generar SQL de inserción
     */
    generateInsertSQL(product) {
        const sqls = [];

        // 1. Insertar producto
        const productSQL = `
-- Insertar producto
INSERT INTO productos (
  ref, nombre, descripcion_corta, descripcion_larga,
  id_categoria, id_subcategoria, id_marca,
  precio, precio_oferta, stock, activo, destacado,
  fecha_creacion, fecha_actualizacion
) VALUES (
  '${product.ref.replace(/'/g, "''")}',
  '${product.nombre.replace(/'/g, "''")}',
  '${product.descripcion_corta.replace(/'/g, "''")}',
  '${product.descripcion_larga.replace(/'/g, "''")}',
  ${product.id_categoria},
  ${product.id_subcategoria},
  ${product.id_marca},
  ${product.precio},
  ${product.precio_oferta || 'NULL'},
  ${product.stock},
  ${product.activo},
  ${product.destacado},
  NOW(),
  NOW()
) RETURNING id_producto;
`;
        sqls.push(productSQL);

        // 2. Insertar imágenes
        if (product.imagenes && product.imagenes.length > 0) {
            product.imagenes.forEach((img, idx) => {
                const imageSQL = `
-- Insertar imagen ${idx + 1}
INSERT INTO producto_imagenes (
  id_producto, url, orden, es_principal
) VALUES (
  (SELECT id_producto FROM productos WHERE ref = '${product.ref.replace(/'/g, "''")}'),
  '${img.url}',
  ${idx + 1},
  ${idx === 0}
);`;
                sqls.push(imageSQL);
            });
        }

        // 3. Insertar atributos
        if (product.atributos && product.atributos.length > 0) {
            product.atributos.forEach(attr => {
                const attrSQL = `
-- Insertar atributo: ${attr.nombre}
INSERT INTO producto_atributos (
  id_producto, nombre, valor, unidad
) VALUES (
  (SELECT id_producto FROM productos WHERE ref = '${product.ref.replace(/'/g, "''")}'),
  '${attr.nombre.replace(/'/g, "''")}',
  '${attr.valor.replace(/'/g, "''")}',
  ${attr.unidad ? `'${attr.unidad}'` : 'NULL'}
);`;
                sqls.push(attrSQL);
            });
        }

        return sqls.join('\n');
    }
}

async function testWithRealData() {
    console.log('\n' + '='.repeat(100));
    console.log('🧪 PRUEBA COMPLETA CON SQL E IMÁGENES REALES');
    console.log('='.repeat(100) + '\n');

    const enricher = new SimpleProductEnricher();

    const classifier = new RuleBasedClassifier({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    // Tomar 1 producto de LG para probar
    const normalizer = new ExcelNormalizer();
    const filePath = path.join(__dirname, 'raw_data', 'LG NOVIEMBRE 29 2025.xlsx');
    const products = normalizer.readAndNormalize(filePath);
    const product = products[0];

    console.log('📦 PRODUCTO SELECCIONADO:');
    console.log(`   REF: ${product.ref}`);
    console.log(`   Nombre: ${product.nombre}`);
    console.log(`   Precio: $${product.precio_contado.toLocaleString()}\n`);

    // 1. Clasificar
    console.log('🤖 PASO 1: Clasificación...');
    const classification = await classifier.classifyProduct({
        ref: product.ref,
        nombre: product.nombre,
        categoria: product.categoria,
        archivo: 'LG NOVIEMBRE 29 2025.xlsx'
    });

    console.log(`   ✅ Categoría: ${classification.categoria.nombre} (ID: ${classification.categoria.id})`);
    console.log(`   ✅ Subcategoría: ${classification.subcategoria.nombre} (ID: ${classification.subcategoria.id})`);
    console.log(`   ✅ Marca: ${classification.marca.nombre} (ID: ${classification.marca.id})\n`);

    // 2. Buscar imágenes
    console.log('🔍 PASO 2: Buscando imágenes...');
    const searchQuery = `${classification.marca.nombre} ${product.ref} ${product.nombre}`;
    console.log(`   Query: "${searchQuery}"`);

    const images = await enricher.searchImages(searchQuery);
    console.log(`   ✅ Imágenes encontradas: ${images.length}\n`);

    // 3. Descargar y optimizar imágenes
    console.log('📥 PASO 3: Descargando y optimizando imágenes...');
    const downloadedImages = [];

    for (let i = 0; i < Math.min(3, images.length); i++) {
        console.log(`   Procesando imagen ${i + 1}/${Math.min(3, images.length)}...`);
        const result = await enricher.downloadAndOptimizeImage(images[i], product.ref, i + 1);
        if (result) {
            console.log(`      ✅ Guardada: ${result.filename} (${(result.size / 1024).toFixed(1)} KB)`);
            downloadedImages.push(result);
        }
    }

    console.log(`   ✅ Total descargadas: ${downloadedImages.length}\n`);

    // 4. Preparar producto enriquecido
    console.log('✨ PASO 4: Preparando producto enriquecido...');

    const enrichedProduct = {
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

    console.log(`   ✅ Producto enriquecido preparado\n`);

    // 5. Generar SQL
    console.log('📝 PASO 5: Generando SQL...\n');
    const sql = enricher.generateInsertSQL(enrichedProduct);

    console.log('─'.repeat(100));
    console.log('SQL GENERADO:');
    console.log('─'.repeat(100));
    console.log(sql);
    console.log('─'.repeat(100));

    // Guardar SQL en archivo
    const sqlPath = path.join(__dirname, 'insert_product_example.sql');
    fs.writeFileSync(sqlPath, sql);
    console.log(`\n💾 SQL guardado en: ${sqlPath}`);

    // Resumen
    console.log('\n\n' + '='.repeat(100));
    console.log('📊 RESUMEN');
    console.log('='.repeat(100));
    console.log(`\n✅ Producto: ${enrichedProduct.nombre}`);
    console.log(`✅ Categoría: ${classification.categoria.nombre} → ${classification.subcategoria.nombre}`);
    console.log(`✅ Marca: ${classification.marca.nombre}`);
    console.log(`✅ Imágenes descargadas: ${downloadedImages.length}`);
    console.log(`✅ Atributos: ${enrichedProduct.atributos.length}`);
    console.log(`✅ SQL generado: ${sqlPath}`);
    console.log(`✅ Imágenes en: ${enricher.imagesDir}`);

    console.log('\n💡 ARCHIVOS GENERADOS:');
    console.log(`   📄 SQL: ${sqlPath}`);
    console.log(`   🖼️  Imágenes:`);
    downloadedImages.forEach(img => {
        console.log(`      - ${img.filename} (${(img.size / 1024).toFixed(1)} KB)`);
    });

    console.log('\n' + '='.repeat(100));
    console.log('✅ PRUEBA COMPLETADA');
    console.log('='.repeat(100) + '\n');

    await classifier.close();
}

testWithRealData().catch(error => {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
});
