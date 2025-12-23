/**
 * 🏍️ DESCARGADOR DE IMÁGENES REALES - MOTOS HONDA
 * 
 * Descarga imágenes REALES de motos desde Google Images
 * Organiza por marca en carpetas
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

class RealImageDownloader {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });

        this.baseImageDir = path.join(__dirname, 'backend', 'public', 'images', 'products');

        this.stats = {
            procesados: 0,
            descargadas: 0,
            errores: 0
        };
    }

    /**
     * Buscar imágenes en Google Images con mejor scraping
     */
    async buscarImagenesGoogle(query, maxResults = 3) {
        try {
            console.log(`      🔍 Buscando: "${query}"`);

            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&tbs=isz:l`; // isz:l = large images

            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                    'Referer': 'https://www.google.com/'
                },
                timeout: 10000
            });

            // Extraer URLs de imágenes del HTML
            const imageUrls = [];
            const matches = response.data.match(/"(https?:\/\/[^"]+\.(jpg|jpeg|png|webp))"/gi);

            if (matches) {
                for (const match of matches) {
                    const url = match.replace(/"/g, '');
                    // Filtrar URLs válidas y de buena calidad
                    if (url.includes('http') &&
                        !url.includes('gstatic') &&
                        !url.includes('google') &&
                        !url.includes('logo') &&
                        imageUrls.length < maxResults) {
                        imageUrls.push(url);
                    }
                }
            }

            console.log(`      📸 Encontradas: ${imageUrls.length} URLs`);
            return imageUrls;

        } catch (error) {
            console.log(`      ⚠️  Error en búsqueda: ${error.message}`);
            return [];
        }
    }

    /**
     * Descargar imagen
     */
    async descargarImagen(url, outputPath) {
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

            fs.writeFileSync(outputPath, response.data);
            const stats = fs.statSync(outputPath);

            // Verificar que sea una imagen válida (mínimo 10KB)
            if (stats.size < 10000) {
                fs.unlinkSync(outputPath);
                return { success: false, error: 'Imagen muy pequeña' };
            }

            return { success: true, size: (stats.size / 1024).toFixed(2) };
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
            // Crear carpeta para la marca
            const marcaDir = path.join(this.baseImageDir, 'honda');
            if (!fs.existsSync(marcaDir)) {
                fs.mkdirSync(marcaDir, { recursive: true });
            }

            // Eliminar imágenes antiguas del producto
            await this.pool.query('DELETE FROM producto_imagenes WHERE id_producto = $1', [producto.id_producto]);

            // Generar búsquedas específicas
            const modelo = producto.nombre.replace('Honda ', '');
            const busquedas = [
                `Honda ${modelo} moto Colombia`,
                `Honda ${modelo} motorcycle`,
                `moto Honda ${modelo} 2026`
            ];

            let imagenesDescargadas = [];
            let intentos = 0;

            // Intentar con cada búsqueda hasta conseguir 3 imágenes
            for (const busqueda of busquedas) {
                if (imagenesDescargadas.length >= 3) break;

                const urls = await this.buscarImagenesGoogle(busqueda, 5);

                for (const url of urls) {
                    if (imagenesDescargadas.length >= 3) break;

                    intentos++;
                    const ext = url.toLowerCase().includes('.png') ? 'png' : 'jpg';
                    const filename = `${producto.sku.replace(/[^a-zA-Z0-9]/g, '_')}_${imagenesDescargadas.length + 1}.${ext}`;
                    const outputPath = path.join(marcaDir, filename);

                    const result = await this.descargarImagen(url, outputPath);

                    if (result.success) {
                        imagenesDescargadas.push({
                            url: `/images/products/honda/${filename}`,
                            orden: imagenesDescargadas.length + 1,
                            size: result.size
                        });

                        console.log(`      ✅ ${filename} (${result.size} KB)`);
                        this.stats.descargadas++;
                    }

                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // Si no se consiguieron imágenes, usar placeholder
            if (imagenesDescargadas.length === 0) {
                console.log(`      ⚠️  No se encontraron imágenes, usando placeholder`);
                // Aquí podrías usar un placeholder genérico
            }

            // Actualizar BD
            for (const img of imagenesDescargadas) {
                await this.pool.query(`
          INSERT INTO producto_imagenes (id_producto, url_imagen, orden, es_principal)
          VALUES ($1, $2, $3, $4)
        `, [producto.id_producto, img.url, img.orden, img.orden === 1]);
            }

            console.log(`      💾 ${imagenesDescargadas.length} imágenes guardadas`);
            this.stats.procesados++;

        } catch (error) {
            console.log(`      ❌ Error: ${error.message}`);
            this.stats.errores++;
        }
    }

    /**
     * Ejecutar
     */
    async ejecutar() {
        console.log('\n' + '='.repeat(100));
        console.log('🏍️  DESCARGADOR DE IMÁGENES REALES - MOTOS HONDA');
        console.log('='.repeat(100));
        console.log('\n📸 Descargando imágenes REALES de motos desde Google Images');
        console.log('📁 Organizando por marca: /images/products/honda/\n');

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
            console.log('='.repeat(100));

            for (let i = 0; i < result.rows.length; i++) {
                const progreso = ((i + 1) / result.rows.length * 100).toFixed(0);
                console.log(`\n[${progreso}%] ${i + 1}/${result.rows.length}`);

                await this.procesarProducto(result.rows[i]);

                // Pausa entre productos para no saturar Google
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log('\n' + '='.repeat(100));
            console.log('📊 RESUMEN');
            console.log('='.repeat(100));
            console.log(`\n✅ Procesados:   ${this.stats.procesados}`);
            console.log(`📸 Descargadas:  ${this.stats.descargadas}`);
            console.log(`❌ Errores:      ${this.stats.errores}`);
            console.log('\n' + '='.repeat(100));

            console.log('\n🎯 VERIFICAR EN:');
            console.log('   http://localhost:5173/pages/productos.html?categoria=motos');
            console.log('\n   Recarga con Ctrl + F5\n');
            console.log('='.repeat(100) + '\n');

        } catch (error) {
            console.error('\n❌ Error:', error.message);
        } finally {
            await this.pool.end();
        }
    }
}

const downloader = new RealImageDownloader();
downloader.ejecutar();
