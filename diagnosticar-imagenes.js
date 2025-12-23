/**
 * 🔍 DIAGNÓSTICO DE IMÁGENES
 * Verifica: BD → Backend → Frontend
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function diagnosticarImagenes() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    console.log('\n' + '='.repeat(100));
    console.log('🔍 DIAGNÓSTICO DE IMÁGENES');
    console.log('='.repeat(100) + '\n');

    try {
        // 1. Verificar imágenes en BD
        console.log('1️⃣  VERIFICANDO BASE DE DATOS:\n');

        const totalImagenes = await pool.query('SELECT COUNT(*) as total FROM producto_imagenes');
        console.log(`   Total imágenes en BD: ${totalImagenes.rows[0].total}`);

        const imagenesRotas = await pool.query(`
      SELECT COUNT(*) as total 
      FROM producto_imagenes 
      WHERE url_imagen IS NULL OR url_imagen = ''
    `);
        console.log(`   Imágenes rotas (NULL/vacías): ${imagenesRotas.rows[0].total}`);

        // Ver ejemplos de URLs
        const ejemplos = await pool.query(`
      SELECT pi.url_imagen, p.nombre, p.sku
      FROM producto_imagenes pi
      JOIN productos p ON pi.id_producto = p.id_producto
      WHERE pi.url_imagen IS NOT NULL AND pi.url_imagen != ''
      LIMIT 5
    `);

        console.log('\n   Ejemplos de URLs en BD:');
        ejemplos.rows.forEach((img, i) => {
            console.log(`   ${i + 1}. ${img.url_imagen}`);
            console.log(`      Producto: ${img.nombre.substring(0, 50)}...`);
        });

        // 2. Verificar archivos en disco
        console.log('\n\n2️⃣  VERIFICANDO ARCHIVOS EN DISCO:\n');

        const imagesDirs = [
            path.join(__dirname, 'product_images_final'),
            path.join(__dirname, 'scraped_images'),
            path.join(__dirname, 'public', 'images', 'products'),
            path.join(__dirname, 'frontend', 'public', 'images', 'products'),
            path.join(__dirname, 'backend', 'public', 'images', 'products')
        ];

        for (const dir of imagesDirs) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                console.log(`   ✅ ${dir}`);
                console.log(`      Archivos: ${files.length}`);
                if (files.length > 0) {
                    console.log(`      Ejemplos: ${files.slice(0, 3).join(', ')}`);
                }
            } else {
                console.log(`   ❌ ${dir} - NO EXISTE`);
            }
        }

        // 3. Verificar configuración del backend
        console.log('\n\n3️⃣  VERIFICANDO CONFIGURACIÓN DEL BACKEND:\n');

        const backendDir = path.join(__dirname, 'backend');
        const serverFile = path.join(backendDir, 'server.js');

        if (fs.existsSync(serverFile)) {
            const serverContent = fs.readFileSync(serverFile, 'utf8');

            // Buscar configuración de archivos estáticos
            if (serverContent.includes('express.static')) {
                console.log('   ✅ Backend tiene configuración de archivos estáticos');

                // Extraer rutas
                const staticMatches = serverContent.match(/express\.static\(['"`]([^'"`]+)['"`]\)/g);
                if (staticMatches) {
                    console.log('   Rutas configuradas:');
                    staticMatches.forEach(match => {
                        console.log(`      ${match}`);
                    });
                }
            } else {
                console.log('   ⚠️  Backend NO tiene configuración de archivos estáticos');
            }
        }

        // 4. Verificar estructura de URLs
        console.log('\n\n4️⃣  ANÁLISIS DE URLS:\n');

        if (ejemplos.rows.length > 0) {
            const primeraUrl = ejemplos.rows[0].url_imagen;
            console.log(`   URL en BD: ${primeraUrl}`);

            // Extraer nombre de archivo
            const filename = primeraUrl.split('/').pop();
            console.log(`   Nombre archivo: ${filename}`);

            // Buscar archivo en todos los directorios
            console.log('\n   Buscando archivo en disco:');
            for (const dir of imagesDirs) {
                if (fs.existsSync(dir)) {
                    const filepath = path.join(dir, filename);
                    if (fs.existsSync(filepath)) {
                        const stats = fs.statSync(filepath);
                        console.log(`   ✅ ENCONTRADO: ${filepath}`);
                        console.log(`      Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
                    }
                }
            }
        }

        // 5. Recomendaciones
        console.log('\n\n' + '='.repeat(100));
        console.log('💡 DIAGNÓSTICO Y RECOMENDACIONES:');
        console.log('='.repeat(100) + '\n');

        const problemas = [];
        const soluciones = [];

        if (imagenesRotas.rows[0].total > 0) {
            problemas.push(`${imagenesRotas.rows[0].total} imágenes rotas en BD`);
            soluciones.push('Ejecutar: DELETE FROM producto_imagenes WHERE url_imagen IS NULL OR url_imagen = \'\'');
        }

        // Verificar si las imágenes están en el lugar correcto
        const productImagesFinal = path.join(__dirname, 'product_images_final');
        const backendPublic = path.join(__dirname, 'backend', 'public', 'images', 'products');

        if (fs.existsSync(productImagesFinal) && !fs.existsSync(backendPublic)) {
            problemas.push('Imágenes están en product_images_final pero no en backend/public');
            soluciones.push('Mover o copiar imágenes a backend/public/images/products');
        }

        if (problemas.length > 0) {
            console.log('❌ PROBLEMAS DETECTADOS:\n');
            problemas.forEach((p, i) => console.log(`   ${i + 1}. ${p}`));

            console.log('\n✅ SOLUCIONES SUGERIDAS:\n');
            soluciones.forEach((s, i) => console.log(`   ${i + 1}. ${s}`));
        } else {
            console.log('✅ No se detectaron problemas obvios');
            console.log('\n💡 Verifica:');
            console.log('   1. Que el backend esté sirviendo archivos estáticos correctamente');
            console.log('   2. Que las URLs en la BD coincidan con la estructura de carpetas');
            console.log('   3. Que el frontend esté haciendo las peticiones correctas');
        }

        console.log('\n' + '='.repeat(100) + '\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

diagnosticarImagenes();
