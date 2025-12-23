/**
 * 🖼️ DESCARGADOR DE IMÁGENES MEJORADO - SIN DUPLICADOS
 * 
 * - Filtra imágenes duplicadas por tamaño
 * - Valida que sean diferentes
 * - Permite 1-3 imágenes (no fuerza 3)
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ImprovedImageDownloader {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });

        this.imageDir = path.join(__dirname, 'backend', 'public', 'images', 'products', 'honda');

        this.stats = {
            procesados: 0,
            descargadas: 0,
            duplicadas: 0,
            errores: 0
        };
    }

    /**
     * Calcular hash de una imagen para detectar duplicados
     */
    calcularHash(buffer) {
        return crypto.createHash('md5').update(buffer).digest('hex');
    }

    /**
     * Verificar si dos imágenes son similares por tamaño
     */
    sonSimilares(size1, size2) {
        const diferencia = Math.abs(size1 - size2);
        const porcentaje = (diferencia / Math.max(size1, size2)) * 100;
        return porcentaje < 5; // Si la diferencia es menor al 5%, son similares
    }

    /**
     * Buscar imágenes en Google
     */
    async buscarImagenesGoogle(query, maxResults = 10) {
        try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&tbs=isz:l`;

            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'es-ES,es;q=0.9',
                    'Referer': 'https://www.google.com/'
                },
                timeout: 10000
            });

            const imageUrls = [];
            const matches = response.data.match(/"(https?:\/\/[^"]+\.(jpg|jpeg|png|webp))"/gi);

            if (matches) {
                for (const match of matches) {
                    const url = match.replace(/"/g, '');
                    if (url.includes('http') &&
                        !url.includes('gstatic') &&
                        !url.includes('google') &&
                        !url.includes('logo') &&
                        imageUrls.length < maxResults) {
                        imageUrls.push(url);
                    }
                }
            }

            return imageUrls;
        } catch (error) {
            return [];
        }
    }

    /**
     * Descargar y validar imagen
     */
    async descargarImagen(url) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.google.com/'
                },
                maxRedirects: 5
            });

            const buffer = Buffer.from(response.data);
            const size = buffer.length;

            // Validar tamaño mínimo (50KB)
            if (size < 50000) {
                return { success: false, error: 'Imagen muy pequeña' };
            }

            // Validar tamaño máximo (10MB)
            if (size > 10000000) {
                return { success: false, error: 'Imagen muy grande' };
            }

            const hash = this.calcularHash(buffer);

            return {
                success: true,
                buffer,
                size,
                hash
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Procesar un producto
     */
    async procesarProducto(producto) {
        console.log(`\n   📦 ${producto.nombre}`);

        try {
            // Eliminar imágenes antiguas
            await this.pool.query('DELETE FROM producto_imagenes WHERE id_producto = $1', [producto.id_producto]);

            const skuSanitizado = producto.sku.replace(/[^a-zA-Z0-9]/g, '_');
            const files = fs.readdirSync(this.imageDir);
            files.forEach(file => {
                if (file.includes(skuSanitizado)) {
                    fs.unlinkSync(path.join(this.imageDir, file));
                }
            });

            // Generar búsquedas
            const modelo = producto.nombre.replace('Honda ', '');
            const busquedas = [
                `Honda ${modelo} moto Colombia`,
                `Honda ${modelo} motorcycle`,
                `moto Honda ${modelo} 2026`,
                `Honda ${modelo} oficial`
            ];

            const imagenesUnicas = [];
            const hashesVistos = new Set();
            const tamañosVistos = [];

            // Intentar con cada búsqueda
            for (const busqueda of busquedas) {
                if (imagenesUnicas.length >= 3) break;

                console.log(`      🔍 "${busqueda}"`);
                const urls = await this.buscarImagenesGoogle(busqueda, 10);
                console.log(`      📸 ${urls.length} URLs encontradas`);

                for (const url of urls) {
                    if (imagenesUnicas.length >= 3) break;

                    const result = await this.descargarImagen(url);

                    if (result.success) {
                        // Verificar si es duplicada por hash
                        if (hashesVistos.has(result.hash)) {
                            this.stats.duplicadas++;
                            console.log(`      ⚠️  Duplicada (hash)`);
                            continue;
                        }

                        // Verificar si es similar por tamaño
                        const esSimilar = tamañosVistos.some(size => this.sonSimilares(size, result.size));
                        if (esSimilar) {
                            this.stats.duplicadas++;
                            console.log(`      ⚠️  Similar (tamaño)`);
                            continue;
                        }

                        // Es única, guardarla
                        const ext = url.toLowerCase().includes('.png') ? 'png' : 'jpg';
                        const filename = `${skuSanitizado}_${imagenesUnicas.length + 1}.${ext}`;
                        const outputPath = path.join(this.imageDir, filename);

                        fs.writeFileSync(outputPath, result.buffer);

                        imagenesUnicas.push({
                            url: `/images/products/honda/${filename}`,
                            orden: imagenesUnicas.length + 1,
                            size: (result.size / 1024).toFixed(2)
                        });

                        hashesVistos.add(result.hash);
                        tamañosVistos.push(result.size);

                        this.stats.descargadas++;
                        console.log(`      ✅ ${filename} (${(result.size / 1024).toFixed(2)} KB)`);
                    }

                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Actualizar BD solo con las imágenes únicas
            if (imagenesUnicas.length > 0) {
                for (const img of imagenesUnicas) {
                    await this.pool.query(`
            INSERT INTO producto_imagenes (id_producto, url_imagen, orden, es_principal)
            VALUES ($1, $2, $3, $4)
          `, [producto.id_producto, img.url, img.orden, img.orden === 1]);
                }

                console.log(`      💾 ${imagenesUnicas.length} imágenes únicas guardadas`);
            } else {
                console.log(`      ⚠️  No se encontraron imágenes únicas`);
            }

            this.stats.procesados++;

        } catch (error) {
            console.log(`      ❌ Error: ${error.message}`);
            this.stats.errores++;
        }
    }

    async ejecutar() {
        console.log('\n' + '='.repeat(100));
        console.log('🖼️  DESCARGADOR MEJORADO - SIN DUPLICADOS');
        console.log('='.repeat(100));
        console.log('\n📸 Filtra imágenes duplicadas y similares');
        console.log('✅ Permite 1-3 imágenes únicas por producto\n');

        if (!fs.existsSync(this.imageDir)) {
            fs.mkdirSync(this.imageDir, { recursive: true });
        }

        try {
            const productos = await this.pool.query(`
        SELECT p.id_producto, p.sku, p.nombre
        FROM productos p
        INNER JOIN marcas m ON p.id_marca = m.id_marca
        WHERE m.nombre = 'Honda'
        ORDER BY p.nombre
      `);

            console.log(`📦 Productos: ${productos.rows.length}\n`);
            console.log('='.repeat(100));

            for (let i = 0; i < productos.rows.length; i++) {
                const progreso = ((i + 1) / productos.rows.length * 100).toFixed(0);
                console.log(`\n[${progreso}%] ${i + 1}/${productos.rows.length}`);

                await this.procesarProducto(productos.rows[i]);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log('\n' + '='.repeat(100));
            console.log('📊 RESUMEN');
            console.log('='.repeat(100));
            console.log(`\n✅ Procesados:   ${this.stats.procesados}`);
            console.log(`📸 Descargadas:  ${this.stats.descargadas}`);
            console.log(`🔄 Duplicadas:   ${this.stats.duplicadas}`);
            console.log(`❌ Errores:      ${this.stats.errores}`);
            console.log('\n' + '='.repeat(100) + '\n');

        } catch (error) {
            console.error('\n❌ Error:', error.message);
        } finally {
            await this.pool.end();
        }
    }
}

const downloader = new ImprovedImageDownloader();
downloader.ejecutar();
