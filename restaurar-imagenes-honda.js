/**
 * 🖼️ RESTAURAR IMÁGENES HONDA
 * 
 * Agrega imágenes a los productos Honda existentes
 * NO modifica nombres, descripciones ni precios
 * SOLO agrega imágenes
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class RestaurarImagenesHonda {
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
            imagenes_agregadas: 0,
            errores: 0
        };
    }

    /**
     * Descargar imagen de placeholder de alta calidad
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

            fs.writeFileSync(outputPath, response.data);

            const stats = fs.statSync(outputPath);
            return { success: true, size: (stats.size / 1024).toFixed(2) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Generar URLs de imágenes de alta calidad
     */
    generarImagenes(producto) {
        const modelo = producto.nombre.replace('Honda ', '').substring(0, 30);
        const urls = [];

        // Generar 3 imágenes de 1600x1600px
        for (let i = 0; i < 3; i++) {
            urls.push(`https://placehold.co/1600x1600/CC0000/FFFFFF/png?text=${encodeURIComponent(modelo)}&font=roboto`);
        }

        return urls;
    }

    /**
     * Procesar un producto
     */
    async procesarProducto(producto) {
        console.log(`\n📦 ${producto.nombre}`);
        console.log(`   ID: ${producto.id_producto} | SKU: ${producto.sku}`);

        try {
            // Verificar si ya tiene imágenes
            const existentes = await this.pool.query(
                'SELECT COUNT(*) as total FROM producto_imagenes WHERE id_producto = $1',
                [producto.id_producto]
            );

            if (parseInt(existentes.rows[0].total) > 0) {
                console.log(`   ⏭️  Ya tiene ${existentes.rows[0].total} imágenes, saltando...`);
                return;
            }

            // Generar URLs
            const urls = this.generarImagenes(producto);
            const skuSanitizado = producto.sku.replace(/[^a-zA-Z0-9]/g, '_');

            // Descargar y guardar cada imagen
            for (let i = 0; i < urls.length; i++) {
                const filename = `${skuSanitizado}_${i + 1}.png`;
                const outputPath = path.join(this.imageDir, filename);

                const result = await this.descargarImagen(urls[i], outputPath);

                if (result.success) {
                    // Insertar en BD
                    await this.pool.query(`
                        INSERT INTO producto_imagenes (id_producto, url_imagen, orden, es_principal)
                        VALUES ($1, $2, $3, $4)
                    `, [producto.id_producto, `/images/products/honda/${filename}`, i + 1, i === 0]);

                    this.stats.imagenes_agregadas++;
                    console.log(`   ✅ ${filename} (${result.size} KB)`);
                } else {
                    console.log(`   ❌ Error: ${result.error}`);
                }

                // Pequeña pausa entre descargas
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            this.stats.procesados++;

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            this.stats.errores++;
        }
    }

    async ejecutar() {
        console.log('\n' + '='.repeat(100));
        console.log('🖼️  RESTAURAR IMÁGENES HONDA');
        console.log('='.repeat(100));
        console.log('\n✅ Solo agrega imágenes a productos existentes');
        console.log('✅ NO modifica nombres, descripciones ni precios');
        console.log('✅ Usa placeholders de alta calidad (1600x1600px)\n');

        // Crear directorio si no existe
        if (!fs.existsSync(this.imageDir)) {
            fs.mkdirSync(this.imageDir, { recursive: true });
            console.log(`📁 Directorio creado: ${this.imageDir}\n`);
        }

        try {
            // Obtener productos Honda sin imágenes
            const productos = await this.pool.query(`
                SELECT 
                    p.id_producto,
                    p.sku,
                    p.nombre
                FROM productos p
                WHERE p.nombre ILIKE '%Honda%'
                ORDER BY p.nombre
            `);

            console.log(`📦 Productos Honda encontrados: ${productos.rows.length}\n`);
            console.log('='.repeat(100));

            // Procesar cada producto
            for (let i = 0; i < productos.rows.length; i++) {
                const progreso = ((i + 1) / productos.rows.length * 100).toFixed(0);
                console.log(`\n[${progreso}%] ${i + 1}/${productos.rows.length}`);

                await this.procesarProducto(productos.rows[i]);
            }

            // Reporte final
            console.log('\n' + '='.repeat(100));
            console.log('📊 REPORTE FINAL');
            console.log('='.repeat(100));
            console.log(`\n✅ Productos procesados: ${this.stats.procesados}`);
            console.log(`📸 Imágenes agregadas:   ${this.stats.imagenes_agregadas}`);
            console.log(`❌ Errores:              ${this.stats.errores}`);
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

const restaurador = new RestaurarImagenesHonda();
restaurador.ejecutar();
