/**
 * 🖼️ DESCARGADOR DE IMÁGENES ESPECÍFICAS HONDA
 * 
 * Busca imágenes REALES por nombre específico de cada modelo
 * Usa Google Images con búsquedas específicas
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class HondaSpecificImageDownloader {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });

        this.imageDir = path.join(__dirname, 'backend', 'public', 'images', 'products', 'honda');

        this.stats = {
            procesados: 0,
            descargadas: 0,
            errores: 0
        };
    }

    /**
     * Calcular hash de imagen
     */
    calcularHash(buffer) {
        return crypto.createHash('md5').update(buffer).digest('hex');
    }

    /**
     * Buscar imágenes en Google por nombre específico
     */
    async buscarImagenesGoogle(query, maxResults = 15) {
        try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&tbs=isz:l`;

            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                    'Referer': 'https://www.google.com/',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 15000
            });

            const imageUrls = [];

            // Buscar URLs de imágenes en el HTML
            const regex = /"(https?:\/\/[^"]+\.(jpg|jpeg|png|webp))"/gi;
            const matches = response.data.matchAll(regex);

            for (const match of matches) {
                const url = match[1];

                // Filtrar URLs no deseadas
                if (url.includes('gstatic') ||
                    url.includes('google') ||
                    url.includes('logo') ||
                    url.includes('icon') ||
                    url.length > 500) {
                    continue;
                }

                imageUrls.push(url);

                if (imageUrls.length >= maxResults) break;
            }

            return imageUrls;
        } catch (error) {
            console.log(`      ⚠️  Error en búsqueda: ${error.message}`);
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
                timeout: 20000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.google.com/'
                },
                maxRedirects: 5
            });

            const buffer = Buffer.from(response.data);
            const size = buffer.length;

            // Validar tamaño mínimo (100KB para asegurar calidad)
            if (size < 100000) {
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
     * Generar búsquedas específicas para cada modelo
     */
    generarBusquedas(producto) {
        const modelo = producto.nombre.replace('Honda ', '');

        // Búsquedas MUY específicas para cada modelo
        return [
            `Honda ${modelo} moto Colombia`,
            `Honda ${modelo} motorcycle 2026`,
            `moto Honda ${modelo} nueva`,
            `Honda ${modelo} oficial`,
            `${modelo} Honda moto`,
            `Honda ${modelo} bike`
        ];
    }

    /**
     * Procesar un producto
     */
    async procesarProducto(producto) {
        console.log(`\n📦 ${producto.nombre}`);
        console.log(`   ID: ${producto.id_producto} | SKU: ${producto.sku}`);

        try {
            // Eliminar imágenes antiguas
            await this.pool.query('DELETE FROM producto_imagenes WHERE id_producto = $1', [producto.id_producto]);

            const skuSanitizado = producto.sku.replace(/[^a-zA-Z0-9]/g, '_');

            // Eliminar archivos antiguos
            const files = fs.readdirSync(this.imageDir);
            files.forEach(file => {
                if (file.includes(skuSanitizado)) {
                    fs.unlinkSync(path.join(this.imageDir, file));
                }
            });

            // Generar búsquedas específicas
            const busquedas = this.generarBusquedas(producto);

            const imagenesUnicas = [];
            const hashesVistos = new Set();
            const tamañosVistos = [];

            // Intentar con cada búsqueda hasta conseguir 3 imágenes únicas
            for (const busqueda of busquedas) {
                if (imagenesUnicas.length >= 3) break;

                console.log(`   🔍 "${busqueda}"`);
                const urls = await this.buscarImagenesGoogle(busqueda, 15);
                console.log(`   📸 ${urls.length} URLs encontradas`);

                for (const url of urls) {
                    if (imagenesUnicas.length >= 3) break;

                    const result = await this.descargarImagen(url);

                    if (result.success) {
                        // Verificar si es duplicada por hash
                        if (hashesVistos.has(result.hash)) {
                            continue;
                        }

                        // Verificar si es similar por tamaño (diferencia < 5%)
                        const esSimilar = tamañosVistos.some(size => {
                            const diferencia = Math.abs(size - result.size);
                            const porcentaje = (diferencia / Math.max(size, result.size)) * 100;
                            return porcentaje < 5;
                        });

                        if (esSimilar) {
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
                        console.log(`   ✅ ${filename} (${(result.size / 1024).toFixed(2)} KB)`);
                    }

                    // Pausa entre descargas para no ser bloqueado
                    await new Promise(resolve => setTimeout(resolve, 800));
                }

                // Pausa entre búsquedas
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Guardar en BD
            if (imagenesUnicas.length > 0) {
                for (const img of imagenesUnicas) {
                    await this.pool.query(`
                        INSERT INTO producto_imagenes (id_producto, url_imagen, orden, es_principal)
                        VALUES ($1, $2, $3, $4)
                    `, [producto.id_producto, img.url, img.orden, img.orden === 1]);
                }

                console.log(`   💾 ${imagenesUnicas.length} imágenes guardadas`);
                this.stats.procesados++;
            } else {
                console.log(`   ⚠️  No se encontraron imágenes para este modelo`);
                this.stats.errores++;
            }

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            this.stats.errores++;
        }
    }

    async ejecutar() {
        console.log('\n' + '='.repeat(100));
        console.log('🖼️  DESCARGADOR DE IMÁGENES ESPECÍFICAS HONDA');
        console.log('='.repeat(100));
        console.log('\n✅ Busca por nombre ESPECÍFICO de cada modelo');
        console.log('✅ Scraping de Google Images');
        console.log('✅ Filtra duplicados y similares\n');

        if (!fs.existsSync(this.imageDir)) {
            fs.mkdirSync(this.imageDir, { recursive: true });
        }

        try {
            const productos = await this.pool.query(`
                SELECT id_producto, sku, nombre
                FROM productos
                WHERE nombre ILIKE '%Honda%'
                ORDER BY nombre
            `);

            console.log(`📦 Productos Honda: ${productos.rows.length}\n`);
            console.log('⚠️  NOTA: Este proceso puede tardar 10-15 minutos');
            console.log('⚠️  Google puede bloquear algunas búsquedas\n');
            console.log('='.repeat(100));

            for (let i = 0; i < productos.rows.length; i++) {
                const progreso = ((i + 1) / productos.rows.length * 100).toFixed(0);
                console.log(`\n[${progreso}%] ${i + 1}/${productos.rows.length}`);

                await this.procesarProducto(productos.rows[i]);
            }

            console.log('\n' + '='.repeat(100));
            console.log('📊 REPORTE FINAL');
            console.log('='.repeat(100));
            console.log(`\n✅ Procesados exitosamente: ${this.stats.procesados}`);
            console.log(`📸 Imágenes descargadas:    ${this.stats.descargadas}`);
            console.log(`❌ Errores:                 ${this.stats.errores}`);
            console.log('\n' + '='.repeat(100));

            console.log('\n🎯 VERIFICAR EN:');
            console.log('   http://localhost:5173/pages/productos.html?marca=Honda\n');
            console.log('='.repeat(100) + '\n');

        } catch (error) {
            console.error('\n❌ Error:', error.message);
            console.error(error.stack);
        } finally {
            await this.pool.end();
        }
    }
}

const downloader = new HondaSpecificImageDownloader();
downloader.ejecutar();
