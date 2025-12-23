/**
 * 🚀 PROCESAMIENTO COMPLETO - Todos los Excel a BD
 * - Normaliza Excel
 * - Clasifica productos
 * - Descarga imágenes
 * - Genera descripciones
 * - Inserta en BD
 * - Verifica duplicados
 */

require('dotenv').config({ path: './backend/.env' });
const ExcelNormalizer = require('./lib/excel-normalizer');
const RuleBasedClassifier = require('./lib/rule-based-classifier');
const axios = require('axios');
const sharp = require('sharp');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class ProductProcessor {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });

        this.imagesDir = path.join(__dirname, 'product_images_final');
        if (!fs.existsSync(this.imagesDir)) {
            fs.mkdirSync(this.imagesDir, { recursive: true });
        }

        this.stats = {
            total: 0,
            inserted: 0,
            updated: 0,
            errors: 0,
            images: 0,
            marcas_creadas: 0,
            subcategorias_creadas: 0
        };
    }

    async searchImages(query) {
        try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                timeout: 10000
            });

            const cheerio = require('cheerio');
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

            return `/images/products/${filename}`;
        } catch (error) {
            return null;
        }
    }

    async checkProductExists(sku) {
        const result = await this.pool.query(
            'SELECT id_producto FROM productos WHERE sku = $1',
            [sku]
        );
        return result.rows.length > 0 ? result.rows[0].id_producto : null;
    }

    async insertProduct(productData, classification, images) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Verificar si existe
            const existingId = await this.checkProductExists(productData.ref);

            let id_producto;

            if (existingId) {
                // UPDATE
                await client.query(`
          UPDATE productos SET
            nombre = $1,
            descripcion_corta = $2,
            descripcion_larga = $3,
            id_categoria = $4,
            id_subcategoria = $5,
            id_marca = $6,
            precio_actual = $7,
            precio_promocional = $8,
            stock = $9,
            activo = $10,
            fecha_actualizacion = NOW()
          WHERE id_producto = $11
        `, [
                    productData.nombre,
                    productData.descripcion_corta,
                    productData.descripcion_larga,
                    classification.categoria.id,
                    classification.subcategoria.id,
                    classification.marca.id,
                    productData.precio_contado,
                    productData.precio_promo,
                    10, // stock
                    true, // activo
                    existingId
                ]);

                id_producto = existingId;
                this.stats.updated++;

                // Eliminar imágenes antiguas
                await client.query('DELETE FROM producto_imagenes WHERE id_producto = $1', [id_producto]);

            } else {
                // INSERT
                const result = await client.query(`
          INSERT INTO productos (
            sku, nombre, descripcion_corta, descripcion_larga,
            id_categoria, id_subcategoria, id_marca,
            precio_actual, precio_promocional, stock, activo, destacado,
            fecha_creacion, fecha_actualizacion
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
          RETURNING id_producto
        `, [
                    productData.ref,
                    productData.nombre,
                    productData.descripcion_corta,
                    productData.descripcion_larga,
                    classification.categoria.id,
                    classification.subcategoria.id,
                    classification.marca.id,
                    productData.precio_contado,
                    productData.precio_promo,
                    10, // stock
                    true, // activo
                    false // destacado
                ]);

                id_producto = result.rows[0].id_producto;
                this.stats.inserted++;
            }

            // Insertar imágenes
            for (let i = 0; i < images.length; i++) {
                if (images[i]) {
                    await client.query(`
            INSERT INTO producto_imagenes (id_producto, url_imagen, orden, es_principal)
            VALUES ($1, $2, $3, $4)
          `, [id_producto, images[i], i + 1, i === 0]);
                    this.stats.images++;
                }
            }

            await client.query('COMMIT');
            return { success: true, id_producto, action: existingId ? 'UPDATE' : 'INSERT' };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async processAllProducts() {
        console.log('\n' + '█'.repeat(120));
        console.log('🚀 PROCESAMIENTO COMPLETO - TODOS LOS PRODUCTOS');
        console.log('█'.repeat(120) + '\n');

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

        console.log(`📁 Archivos encontrados: ${files.length}\n`);

        for (const file of files) {
            console.log('\n' + '═'.repeat(120));
            console.log(`📄 Procesando: ${file}`);
            console.log('═'.repeat(120));

            try {
                const filePath = path.join(rawDataDir, file);
                const products = normalizer.readAndNormalize(filePath);

                console.log(`\n✅ ${products.length} productos detectados`);
                console.log(`⏳ Procesando...`);

                for (let i = 0; i < products.length; i++) {
                    const product = products[i];
                    this.stats.total++;

                    try {
                        // Clasificar
                        const classification = await classifier.classifyProduct({
                            ref: product.ref,
                            nombre: product.nombre,
                            categoria: product.categoria,
                            archivo: file
                        });

                        if (classification.marca.accion === 'crear_nueva') this.stats.marcas_creadas++;
                        if (classification.subcategoria.accion === 'crear_nueva') this.stats.subcategorias_creadas++;

                        // Buscar imágenes
                        const searchQuery = `${classification.marca.nombre} ${product.ref} ${product.nombre}`;
                        const imageUrls = await this.searchImages(searchQuery);

                        // Descargar imágenes
                        const downloadedImages = [];
                        for (let j = 0; j < imageUrls.length; j++) {
                            const url = await this.downloadImage(imageUrls[j], product.ref, j + 1);
                            if (url) downloadedImages.push(url);
                        }

                        // Generar descripciones
                        const descripcion_corta = `${classification.marca.nombre} ${product.nombre.substring(0, 150)}`;
                        const descripcion_larga = `<div class="product-description">
              <h3>${classification.marca.nombre} ${product.nombre}</h3>
              <p>Producto de alta calidad de la marca ${classification.marca.nombre}.</p>
              <div class="price-highlight">
                <p>Precio especial: <strong>$${product.precio_promo.toLocaleString()}</strong></p>
                ${product.precio_promo < product.precio_contado ? `<p>Antes: <s>$${product.precio_contado.toLocaleString()}</s></p>` : ''}
              </div>
            </div>`;

                        // Insertar en BD
                        const result = await this.insertProduct({
                            ref: product.ref,
                            nombre: product.nombre,
                            descripcion_corta,
                            descripcion_larga,
                            precio_contado: product.precio_contado,
                            precio_promo: product.precio_promo
                        }, classification, downloadedImages);

                        const progress = ((i + 1) / products.length * 100).toFixed(0);
                        console.log(`   [${progress}%] ${result.action} - ${product.ref} (${downloadedImages.length} imgs)`);

                    } catch (error) {
                        console.error(`   ❌ Error en ${product.ref}: ${error.message}`);
                        this.stats.errors++;
                    }
                }

                console.log(`\n✅ Archivo completado: ${file}`);

            } catch (error) {
                console.error(`\n❌ Error procesando ${file}: ${error.message}`);
            }
        }

        // Reporte final
        console.log('\n\n' + '█'.repeat(120));
        console.log('📊 REPORTE FINAL');
        console.log('█'.repeat(120));

        console.log(`\n📦 PRODUCTOS:`);
        console.log(`   Total procesados:        ${this.stats.total}`);
        console.log(`   Insertados (nuevos):     ${this.stats.inserted}`);
        console.log(`   Actualizados:            ${this.stats.updated}`);
        console.log(`   Errores:                 ${this.stats.errors}`);

        console.log(`\n🖼️  IMÁGENES:`);
        console.log(`   Total descargadas:       ${this.stats.images}`);
        console.log(`   Promedio por producto:   ${(this.stats.images / (this.stats.inserted + this.stats.updated)).toFixed(1)}`);

        console.log(`\n🏷️  MARCAS Y SUBCATEGORÍAS:`);
        console.log(`   Marcas creadas:          ${this.stats.marcas_creadas}`);
        console.log(`   Subcategorías creadas:   ${this.stats.subcategorias_creadas}`);

        const successRate = ((this.stats.inserted + this.stats.updated) / this.stats.total * 100).toFixed(1);
        console.log(`\n✅ TASA DE ÉXITO: ${successRate}%`);

        console.log('\n' + '█'.repeat(120));
        console.log('✅ PROCESAMIENTO COMPLETADO');
        console.log('█'.repeat(120) + '\n');

        await classifier.close();
        await this.pool.end();
    }
}

// Ejecutar
const processor = new ProductProcessor();
processor.processAllProducts().catch(error => {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
});
