/**
 * 🖼️ ACTUALIZACIÓN DE IMÁGENES - VERSIÓN MEJORADA
 * 
 * Usa múltiples fuentes para encontrar imágenes de alta calidad
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// CONFIGURACIÓN
const NUEVA_RESOLUCION = 1600;
const IMAGENES_POR_PRODUCTO = 3;

class ImageUpgraderV2 {
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
     * Buscar imágenes usando Unsplash API (gratis, alta calidad)
     */
    async buscarImagenesUnsplash(query, maxResults = IMAGENES_POR_PRODUCTO) {
        try {
            // Unsplash API pública (sin key para búsquedas básicas)
            const response = await axios.get(`https://source.unsplash.com/1600x1600/?${encodeURIComponent(query)}`, {
                maxRedirects: 0,
                validateStatus: () => true
            });

            if (response.status === 302 && response.headers.location) {
                return [response.headers.location];
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Buscar imágenes usando Pixabay (requiere API key gratuita)
     */
    async buscarImagenesPixabay(query, maxResults = IMAGENES_POR_PRODUCTO) {
        // Por ahora retornamos vacío, se puede agregar API key después
        return [];
    }

    /**
     * Generar URLs de placeholder de alta calidad
     */
    generarPlaceholders(producto, cantidad = IMAGENES_POR_PRODUCTO) {
        const urls = [];
        const colors = ['4A90E2', 'E24A4A', '4AE290', 'E2904A', '904AE2'];

        for (let i = 0; i < cantidad; i++) {
            const color = colors[i % colors.length];
            const text = encodeURIComponent(producto.nombre.substring(0, 30));
            urls.push(`https://via.placeholder.com/1600x1600/${color}/FFFFFF?text=${text}`);
        }

        return urls;
    }

    /**
     * Descargar y optimizar imagen
     */
    async descargarYOptimizarImagen(url, outputPath) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            await sharp(response.data)
                .resize(NUEVA_RESOLUCION, NUEVA_RESOLUCION, {
                    fit: 'cover', // Cambiar a 'cover' para llenar completamente
                    position: 'center'
                })
                .webp({ quality: 90 })
                .toFile(outputPath);

            // Verificar tamaño del archivo
            const stats = fs.statSync(outputPath);
            const sizeKB = (stats.size / 1024).toFixed(2);

            return { success: true, size: sizeKB };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Eliminar imágenes antiguas
     */
    async eliminarImagenesAntiguas(sku) {
        const skuSanitizado = sku.replace(/[^a-zA-Z0-9]/g, '_');
        let eliminadas = 0;

        [this.imageDir, this.backendImageDir].forEach(dir => {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                files.forEach(file => {
                    if (file.includes(skuSanitizado)) {
                        fs.unlinkSync(path.join(dir, file));
                        eliminadas++;
                    }
                });
            }
        });

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
        console.log(`\n📦 ${producto.nombre}`);
        console.log(`   SKU: ${producto.sku}`);

        try {
            // 1. Eliminar antiguas
            const eliminadas = await this.eliminarImagenesAntiguas(producto.sku);
            if (eliminadas > 0) {
                console.log(`   🗑️  ${eliminadas} imágenes antiguas eliminadas`);
            }

            // 2. Buscar nuevas imágenes
            const searchQuery = `${producto.marca || ''} ${producto.nombre}`.trim();
            let imageUrls = await this.buscarImagenesUnsplash(searchQuery);

            // Si no encuentra, usar placeholders de alta calidad
            if (imageUrls.length === 0) {
                console.log(`   ⚠️  Usando placeholders de alta calidad`);
                imageUrls = this.generarPlaceholders(producto);
            } else {
                console.log(`   ✅ ${imageUrls.length} imágenes encontradas`);
            }

            // 3. Descargar y optimizar
            const skuSanitizado = producto.sku.replace(/[^a-zA-Z0-9]/g, '_');
            const imagenesDescargadas = [];

            for (let i = 0; i < Math.min(imageUrls.length, IMAGENES_POR_PRODUCTO); i++) {
                const filename = `${skuSanitizado}_${i + 1}.webp`;
                const outputPath = path.join(this.imageDir, filename);
                const backendPath = path.join(this.backendImageDir, filename);

                const result = await this.descargarYOptimizarImagen(imageUrls[i], outputPath);

                if (result.success) {
                    fs.copyFileSync(outputPath, backendPath);

                    imagenesDescargadas.push({
                        url: `/images/products/${filename}`,
                        orden: i + 1
                    });

                    this.stats.imagenes_descargadas++;
                    console.log(`   📸 ${filename} (${result.size} KB)`);
                }
            }

            // 4. Actualizar BD
            if (imagenesDescargadas.length > 0) {
                for (const img of imagenesDescargadas) {
                    await this.pool.query(`
            INSERT INTO producto_imagenes (id_producto, url_imagen, orden, es_principal)
            VALUES ($1, $2, $3, $4)
          `, [producto.id_producto, img.url, img.orden, img.orden === 1]);
                }

                await this.pool.query(`
          UPDATE productos SET imagen_principal = $1 WHERE id_producto = $2
        `, [imagenesDescargadas[0].url, producto.id_producto]);

                console.log(`   💾 BD actualizada`);
            }

            this.stats.productos_procesados++;

        } catch (error) {
            console.log(`   ❌ ${error.message}`);
            this.stats.errores++;
        }
    }

    async ejecutar(limite = null) {
        console.log('\n' + '='.repeat(80));
        console.log('🖼️  ACTUALIZACIÓN DE IMÁGENES A ALTA RESOLUCIÓN');
        console.log('='.repeat(80));
        console.log(`\n📐 Resolución: ${NUEVA_RESOLUCION}x${NUEVA_RESOLUCION}px`);
        console.log(`📸 Imágenes por producto: ${IMAGENES_POR_PRODUCTO}`);
        console.log(`🎨 Calidad: 90%\n`);

        [this.imageDir, this.backendImageDir].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        try {
            let query = `
        SELECT p.id_producto, p.sku, p.nombre, m.nombre as marca
        FROM productos p
        LEFT JOIN marcas m ON p.id_marca = m.id_marca
        ORDER BY p.id_producto
      `;

            if (limite) query += ` LIMIT ${limite}`;

            const result = await this.pool.query(query);
            console.log(`📦 Productos: ${result.rows.length}\n`);

            for (let i = 0; i < result.rows.length; i++) {
                const progreso = ((i + 1) / result.rows.length * 100).toFixed(0);
                console.log(`[${progreso}%] ${i + 1}/${result.rows.length}`);

                await this.procesarProducto(result.rows[i]);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            console.log('\n' + '='.repeat(80));
            console.log('📊 RESUMEN');
            console.log('='.repeat(80));
            console.log(`✅ Procesados:   ${this.stats.productos_procesados}`);
            console.log(`🗑️  Eliminadas:   ${this.stats.imagenes_eliminadas}`);
            console.log(`📸 Descargadas:  ${this.stats.imagenes_descargadas}`);
            console.log(`❌ Errores:      ${this.stats.errores}`);
            console.log('='.repeat(80) + '\n');

        } catch (error) {
            console.error('\n❌ Error:', error.message);
        } finally {
            await this.pool.end();
        }
    }
}

const limite = process.argv[2] ? parseInt(process.argv[2]) : null;
const upgrader = new ImageUpgraderV2();
upgrader.ejecutar(limite);
