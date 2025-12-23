/**
 * 🖼️ ACTUALIZACIÓN DE IMÁGENES A ALTA RESOLUCIÓN
 * 
 * - Elimina imágenes antiguas (800x800px)
 * - Descarga nuevas imágenes en 1600x1600px
 * - Actualiza base de datos
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const axios = require('axios');
const cheerio = require('cheerio');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// CONFIGURACIÓN
const NUEVA_RESOLUCION = 1600; // Aumentado de 800 a 1600px
const IMAGENES_POR_PRODUCTO = 3;
const TIMEOUT = 10000;

class ImageUpgrader {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });

        this.imageDir = path.join(__dirname, 'product_images_final');
        this.backendImageDir = path.join(__dirname, 'backend', 'public', 'images', 'products');

        this.stats = {
            productos_procesados: 0,
            imagenes_eliminadas: 0,
            imagenes_descargadas: 0,
            errores: 0
        };
    }

    /**
     * Buscar imágenes en Google
     */
    async buscarImagenesGoogle(query, maxResults = IMAGENES_POR_PRODUCTO) {
        try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;

            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: TIMEOUT
            });

            const $ = cheerio.load(response.data);
            const imageUrls = [];

            $('img').each((i, elem) => {
                if (imageUrls.length >= maxResults) return false;

                const src = $(elem).attr('src') || $(elem).attr('data-src');
                if (src && src.startsWith('http') && !src.includes('gstatic')) {
                    imageUrls.push(src);
                }
            });

            return imageUrls.slice(0, maxResults);
        } catch (error) {
            console.log(`   ⚠️  Error buscando imágenes: ${error.message}`);
            return [];
        }
    }

    /**
     * Descargar y optimizar imagen
     */
    async descargarYOptimizarImagen(url, outputPath) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: TIMEOUT,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            // Optimizar con Sharp a NUEVA RESOLUCIÓN
            await sharp(response.data)
                .resize(NUEVA_RESOLUCION, NUEVA_RESOLUCION, {
                    fit: 'inside',
                    withoutEnlargement: false // Permitir agrandar para mejor calidad
                })
                .webp({ quality: 90 }) // Calidad alta
                .toFile(outputPath);

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Eliminar imágenes antiguas de un producto
     */
    async eliminarImagenesAntiguas(sku) {
        const skuSanitizado = sku.replace(/[^a-zA-Z0-9]/g, '_');
        let eliminadas = 0;

        // Eliminar de product_images_final
        if (fs.existsSync(this.imageDir)) {
            const files = fs.readdirSync(this.imageDir);
            files.forEach(file => {
                if (file.includes(skuSanitizado)) {
                    fs.unlinkSync(path.join(this.imageDir, file));
                    eliminadas++;
                }
            });
        }

        // Eliminar de backend/public/images/products
        if (fs.existsSync(this.backendImageDir)) {
            const files = fs.readdirSync(this.backendImageDir);
            files.forEach(file => {
                if (file.includes(skuSanitizado)) {
                    fs.unlinkSync(path.join(this.backendImageDir, file));
                    eliminadas++;
                }
            });
        }

        // Eliminar de BD
        await this.pool.query(
            'DELETE FROM producto_imagenes WHERE id_producto = (SELECT id_producto FROM productos WHERE sku = $1)',
            [sku]
        );

        this.stats.imagenes_eliminadas += eliminadas;
        return eliminadas;
    }

    /**
     * Procesar un producto
     */
    async procesarProducto(producto) {
        console.log(`\n📦 Procesando: ${producto.nombre}`);
        console.log(`   SKU: ${producto.sku}`);

        try {
            // 1. Eliminar imágenes antiguas
            const eliminadas = await this.eliminarImagenesAntiguas(producto.sku);
            console.log(`   🗑️  Eliminadas: ${eliminadas} imágenes antiguas`);

            // 2. Buscar nuevas imágenes
            const searchQuery = `${producto.marca || ''} ${producto.nombre} producto`.trim();
            console.log(`   🔍 Buscando: "${searchQuery}"`);

            const imageUrls = await this.buscarImagenesGoogle(searchQuery);
            console.log(`   📸 Encontradas: ${imageUrls.length} URLs`);

            if (imageUrls.length === 0) {
                console.log(`   ⚠️  No se encontraron imágenes`);
                this.stats.errores++;
                return;
            }

            // 3. Descargar y optimizar
            const skuSanitizado = producto.sku.replace(/[^a-zA-Z0-9]/g, '_');
            const imagenesDescargadas = [];

            for (let i = 0; i < imageUrls.length; i++) {
                const filename = `${skuSanitizado}_${i + 1}.webp`;
                const outputPath = path.join(this.imageDir, filename);
                const backendPath = path.join(this.backendImageDir, filename);

                console.log(`   ⬇️  Descargando imagen ${i + 1}/${imageUrls.length}...`);

                const success = await this.descargarYOptimizarImagen(imageUrls[i], outputPath);

                if (success) {
                    // Copiar también a backend/public
                    fs.copyFileSync(outputPath, backendPath);

                    imagenesDescargadas.push({
                        url: `/images/products/${filename}`,
                        orden: i + 1
                    });

                    this.stats.imagenes_descargadas++;
                    console.log(`   ✅ Guardada: ${filename} (${NUEVA_RESOLUCION}x${NUEVA_RESOLUCION}px)`);
                } else {
                    console.log(`   ❌ Error descargando imagen ${i + 1}`);
                }
            }

            // 4. Actualizar base de datos
            if (imagenesDescargadas.length > 0) {
                for (const img of imagenesDescargadas) {
                    await this.pool.query(`
            INSERT INTO producto_imagenes (id_producto, url_imagen, orden, es_principal)
            VALUES ($1, $2, $3, $4)
          `, [
                        producto.id_producto,
                        img.url,
                        img.orden,
                        img.orden === 1
                    ]);
                }

                // Actualizar imagen principal del producto
                await this.pool.query(`
          UPDATE productos 
          SET imagen_principal = $1 
          WHERE id_producto = $2
        `, [imagenesDescargadas[0].url, producto.id_producto]);

                console.log(`   💾 Base de datos actualizada`);
            }

            this.stats.productos_procesados++;

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            this.stats.errores++;
        }
    }

    /**
     * Ejecutar actualización
     */
    async ejecutar(limite = null) {
        console.log('\n' + '█'.repeat(100));
        console.log('🖼️  ACTUALIZACIÓN DE IMÁGENES A ALTA RESOLUCIÓN');
        console.log('█'.repeat(100));
        console.log(`\n📐 Nueva resolución: ${NUEVA_RESOLUCION}x${NUEVA_RESOLUCION}px`);
        console.log(`📸 Imágenes por producto: ${IMAGENES_POR_PRODUCTO}`);
        console.log(`🎨 Calidad WebP: 90%\n`);

        // Crear directorios si no existen
        if (!fs.existsSync(this.imageDir)) fs.mkdirSync(this.imageDir, { recursive: true });
        if (!fs.existsSync(this.backendImageDir)) fs.mkdirSync(this.backendImageDir, { recursive: true });

        try {
            // Obtener productos
            let query = `
        SELECT p.id_producto, p.sku, p.nombre, m.nombre as marca
        FROM productos p
        LEFT JOIN marcas m ON p.id_marca = m.id_marca
        ORDER BY p.id_producto
      `;

            if (limite) {
                query += ` LIMIT ${limite}`;
            }

            const result = await this.pool.query(query);
            console.log(`📦 Productos a procesar: ${result.rows.length}\n`);

            for (let i = 0; i < result.rows.length; i++) {
                const producto = result.rows[i];
                const progreso = ((i + 1) / result.rows.length * 100).toFixed(1);
                console.log(`\n[${progreso}%] Producto ${i + 1}/${result.rows.length}`);

                await this.procesarProducto(producto);

                // Pausa para no saturar Google
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Reporte final
            console.log('\n\n' + '█'.repeat(100));
            console.log('📊 REPORTE FINAL');
            console.log('█'.repeat(100));
            console.log(`\n✅ Productos procesados:     ${this.stats.productos_procesados}`);
            console.log(`🗑️  Imágenes eliminadas:      ${this.stats.imagenes_eliminadas}`);
            console.log(`📸 Imágenes descargadas:     ${this.stats.imagenes_descargadas}`);
            console.log(`❌ Errores:                  ${this.stats.errores}`);
            console.log(`\n📐 Resolución: ${NUEVA_RESOLUCION}x${NUEVA_RESOLUCION}px`);
            console.log('\n' + '█'.repeat(100) + '\n');

        } catch (error) {
            console.error('\n❌ Error fatal:', error);
            console.error(error.stack);
        } finally {
            await this.pool.end();
        }
    }
}

// Ejecutar
const limite = process.argv[2] ? parseInt(process.argv[2]) : null;

if (limite) {
    console.log(`\n⚠️  Modo prueba: procesando solo ${limite} productos\n`);
}

const upgrader = new ImageUpgrader();
upgrader.ejecutar(limite);
