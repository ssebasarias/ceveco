/**
 * 🖼️ DESCARGADOR DE IMÁGENES HONDA - ALTA CALIDAD
 * 
 * Descarga imágenes de 1600x1600px específicas para motos Honda
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const RESOLUCION = 1600;
const IMAGENES_POR_PRODUCTO = 3;

class HondaImageDownloader {
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
            procesados: 0,
            descargadas: 0,
            errores: 0
        };
    }

    /**
     * Generar búsqueda específica para motos Honda
     */
    generarBusqueda(producto) {
        const nombre = producto.nombre;

        // Extraer modelo
        let modelo = '';
        if (nombre.includes('WAVE')) modelo = 'WAVE 110S';
        else if (nombre.includes('CB 100')) modelo = 'CB 100';
        else if (nombre.includes('CB 125F')) modelo = 'CB 125F';
        else if (nombre.includes('CB190R')) modelo = 'CB190R';
        else if (nombre.includes('CB 300')) modelo = 'CB 300F';
        else if (nombre.includes('DIO')) modelo = 'DIO 110';
        else if (nombre.includes('NAVI')) modelo = 'NAVI';
        else if (nombre.includes('MIX')) modelo = 'NAVI MIX';
        else if (nombre.includes('XR 150L')) modelo = 'XR 150L';
        else if (nombre.includes('XR 190L')) modelo = 'XR 190L';
        else if (nombre.includes('XR 300L')) modelo = 'XR 300L Tornado';
        else if (nombre.includes('NX 190')) modelo = 'NX 190';
        else if (nombre.includes('PCX')) modelo = 'PCX 160';
        else if (nombre.includes('XBLADE')) modelo = 'XBLADE 160';
        else {
            modelo = nombre.replace('Honda ', '');
        }

        // Búsquedas específicas
        return [
            `Honda ${modelo} moto Colombia`,
            `Honda ${modelo} motorcycle`,
            `moto Honda ${modelo}`
        ];
    }

    /**
     * Descargar imagen desde URL específica
     */
    async descargarImagen(url, outputPath) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            await sharp(response.data)
                .resize(RESOLUCION, RESOLUCION, {
                    fit: 'cover',
                    position: 'center'
                })
                .webp({ quality: 90 })
                .toFile(outputPath);

            const stats = fs.statSync(outputPath);
            return { success: true, size: (stats.size / 1024).toFixed(2) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * URLs de imágenes específicas para cada modelo Honda
     */
    getImagenesEspecificas(producto) {
        const nombre = producto.nombre;
        const urls = [];

        // WAVE 110S
        if (nombre.includes('WAVE 110S')) {
            urls.push(
                'https://www.honda.com.co/motos/images/productos/wave-110s/wave-110s-1.jpg',
                'https://www.honda.com.co/motos/images/productos/wave-110s/wave-110s-2.jpg',
                'https://www.honda.com.co/motos/images/productos/wave-110s/wave-110s-3.jpg'
            );
        }
        // CB 100
        else if (nombre.includes('CB 100')) {
            urls.push(
                'https://www.honda.com.co/motos/images/productos/cb-100/cb-100-1.jpg',
                'https://www.honda.com.co/motos/images/productos/cb-100/cb-100-2.jpg',
                'https://www.honda.com.co/motos/images/productos/cb-100/cb-100-3.jpg'
            );
        }
        // CB 125F
        else if (nombre.includes('CB 125F')) {
            urls.push(
                'https://www.honda.com.co/motos/images/productos/cb-125f/cb-125f-1.jpg',
                'https://www.honda.com.co/motos/images/productos/cb-125f/cb-125f-2.jpg',
                'https://www.honda.com.co/motos/images/productos/cb-125f/cb-125f-3.jpg'
            );
        }
        // CB190R
        else if (nombre.includes('CB190R')) {
            urls.push(
                'https://www.honda.com.co/motos/images/productos/cb190r/cb190r-1.jpg',
                'https://www.honda.com.co/motos/images/productos/cb190r/cb190r-2.jpg',
                'https://www.honda.com.co/motos/images/productos/cb190r/cb190r-3.jpg'
            );
        }
        // XR 150L
        else if (nombre.includes('XR 150L')) {
            urls.push(
                'https://www.honda.com.co/motos/images/productos/xr-150l/xr-150l-1.jpg',
                'https://www.honda.com.co/motos/images/productos/xr-150l/xr-150l-2.jpg',
                'https://www.honda.com.co/motos/images/productos/xr-150l/xr-150l-3.jpg'
            );
        }
        // XR 190L
        else if (nombre.includes('XR 190L')) {
            urls.push(
                'https://www.honda.com.co/motos/images/productos/xr-190l/xr-190l-1.jpg',
                'https://www.honda.com.co/motos/images/productos/xr-190l/xr-190l-2.jpg',
                'https://www.honda.com.co/motos/images/productos/xr-190l/xr-190l-3.jpg'
            );
        }
        // NX 190
        else if (nombre.includes('NX 190')) {
            urls.push(
                'https://www.honda.com.co/motos/images/productos/nx-190/nx-190-1.jpg',
                'https://www.honda.com.co/motos/images/productos/nx-190/nx-190-2.jpg',
                'https://www.honda.com.co/motos/images/productos/nx-190/nx-190-3.jpg'
            );
        }
        // PCX 160
        else if (nombre.includes('PCX')) {
            urls.push(
                'https://www.honda.com.co/motos/images/productos/pcx-160/pcx-160-1.jpg',
                'https://www.honda.com.co/motos/images/productos/pcx-160/pcx-160-2.jpg',
                'https://www.honda.com.co/motos/images/productos/pcx-160/pcx-160-3.jpg'
            );
        }
        // DIO 110
        else if (nombre.includes('DIO')) {
            urls.push(
                'https://www.honda.com.co/motos/images/productos/dio-110/dio-110-1.jpg',
                'https://www.honda.com.co/motos/images/productos/dio-110/dio-110-2.jpg',
                'https://www.honda.com.co/motos/images/productos/dio-110/dio-110-3.jpg'
            );
        }
        // NAVI
        else if (nombre.includes('NAVI')) {
            urls.push(
                'https://www.honda.com.co/motos/images/productos/navi/navi-1.jpg',
                'https://www.honda.com.co/motos/images/productos/navi/navi-2.jpg',
                'https://www.honda.com.co/motos/images/productos/navi/navi-3.jpg'
            );
        }

        // Si no hay URLs específicas, usar placeholders de alta calidad
        if (urls.length === 0) {
            const modelo = producto.nombre.replace('Honda ', '').substring(0, 30);
            for (let i = 0; i < 3; i++) {
                urls.push(`https://via.placeholder.com/${RESOLUCION}x${RESOLUCION}/1976D2/FFFFFF?text=Honda+${encodeURIComponent(modelo)}`);
            }
        }

        return urls;
    }

    /**
     * Procesar un producto
     */
    async procesarProducto(producto) {
        console.log(`\n📦 ${producto.nombre}`);
        console.log(`   SKU: ${producto.sku}`);

        try {
            // 1. Eliminar imágenes antiguas
            const skuSanitizado = producto.sku.replace(/[^a-zA-Z0-9]/g, '_');

            // Eliminar de BD
            await this.pool.query(
                'DELETE FROM producto_imagenes WHERE id_producto = $1',
                [producto.id_producto]
            );

            // Eliminar archivos
            [this.imageDir, this.backendImageDir].forEach(dir => {
                if (fs.existsSync(dir)) {
                    const files = fs.readdirSync(dir);
                    files.forEach(file => {
                        if (file.includes(skuSanitizado)) {
                            fs.unlinkSync(path.join(dir, file));
                        }
                    });
                }
            });

            // 2. Obtener URLs de imágenes
            const urls = this.getImagenesEspecificas(producto);
            console.log(`   🔍 ${urls.length} URLs encontradas`);

            // 3. Descargar imágenes
            const imagenesDescargadas = [];

            for (let i = 0; i < Math.min(urls.length, IMAGENES_POR_PRODUCTO); i++) {
                const filename = `${skuSanitizado}_${i + 1}.webp`;
                const outputPath = path.join(this.imageDir, filename);
                const backendPath = path.join(this.backendImageDir, filename);

                const result = await this.descargarImagen(urls[i], outputPath);

                if (result.success) {
                    fs.copyFileSync(outputPath, backendPath);

                    imagenesDescargadas.push({
                        url: `/images/products/${filename}`,
                        orden: i + 1
                    });

                    this.stats.descargadas++;
                    console.log(`   ✅ ${filename} (${result.size} KB)`);
                } else {
                    console.log(`   ⚠️  Error: ${result.error}`);
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

            this.stats.procesados++;

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            this.stats.errores++;
        }
    }

    /**
     * Ejecutar
     */
    async ejecutar() {
        console.log('\n' + '='.repeat(80));
        console.log('🖼️  DESCARGA DE IMÁGENES HONDA - ALTA CALIDAD');
        console.log('='.repeat(80));
        console.log(`\n📐 Resolución: ${RESOLUCION}x${RESOLUCION}px`);
        console.log(`📸 Imágenes por producto: ${IMAGENES_POR_PRODUCTO}\n`);

        // Crear directorios
        [this.imageDir, this.backendImageDir].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        try {
            // Obtener productos Honda
            const result = await this.pool.query(`
        SELECT p.id_producto, p.sku, p.nombre
        FROM productos p
        INNER JOIN marcas m ON p.id_marca = m.id_marca
        WHERE m.nombre = 'Honda'
        ORDER BY p.nombre
      `);

            console.log(`📦 Productos Honda: ${result.rows.length}\n`);

            for (let i = 0; i < result.rows.length; i++) {
                const progreso = ((i + 1) / result.rows.length * 100).toFixed(0);
                console.log(`[${progreso}%] ${i + 1}/${result.rows.length}`);

                await this.procesarProducto(result.rows[i]);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            console.log('\n' + '='.repeat(80));
            console.log('📊 RESUMEN');
            console.log('='.repeat(80));
            console.log(`✅ Procesados:   ${this.stats.procesados}`);
            console.log(`📸 Descargadas:  ${this.stats.descargadas}`);
            console.log(`❌ Errores:      ${this.stats.errores}`);
            console.log('='.repeat(80) + '\n');

        } catch (error) {
            console.error('\n❌ Error:', error.message);
        } finally {
            await this.pool.end();
        }
    }
}

const downloader = new HondaImageDownloader();
downloader.ejecutar();
