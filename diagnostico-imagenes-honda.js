/**
 * 🔍 DIAGNÓSTICO DE IMÁGENES HONDA
 * 
 * Verifica el estado actual de las imágenes de productos Honda
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class DiagnosticoImagenesHonda {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });

        this.imageDir = path.join(__dirname, 'backend', 'public', 'images', 'products');
    }

    async diagnosticar() {
        console.log('\n' + '='.repeat(100));
        console.log('🔍 DIAGNÓSTICO DE IMÁGENES HONDA');
        console.log('='.repeat(100) + '\n');

        try {
            // 1. Verificar productos Honda en BD
            console.log('📊 PASO 1: Productos Honda en Base de Datos\n');

            const productosResult = await this.pool.query(`
                SELECT 
                    p.id_producto,
                    p.sku,
                    p.nombre,
                    p.precio_actual,
                    COUNT(pi.id_imagen) as num_imagenes
                FROM productos p
                LEFT JOIN producto_imagenes pi ON p.id_producto = pi.id_producto
                WHERE p.nombre ILIKE '%Honda%' OR p.sku ILIKE '%Honda%'
                GROUP BY p.id_producto, p.sku, p.nombre, p.precio_actual
                ORDER BY p.nombre
            `);

            console.log(`   Total productos Honda: ${productosResult.rows.length}\n`);

            const conImagenes = productosResult.rows.filter(p => p.num_imagenes > 0).length;
            const sinImagenes = productosResult.rows.filter(p => p.num_imagenes === 0).length;

            console.log(`   ✅ Con imágenes: ${conImagenes}`);
            console.log(`   ❌ Sin imágenes: ${sinImagenes}\n`);

            // Mostrar detalle de productos
            console.log('   Detalle de productos:\n');
            productosResult.rows.forEach((p, i) => {
                const status = p.num_imagenes > 0 ? '✅' : '❌';
                console.log(`   ${i + 1}. ${status} ${p.nombre}`);
                console.log(`      SKU: ${p.sku}`);
                console.log(`      Imágenes: ${p.num_imagenes}`);
                console.log(`      Precio: $${p.precio_actual ? p.precio_actual.toLocaleString('es-CO') : 'N/A'}\n`);
            });

            // 2. Verificar imágenes en BD
            console.log('\n' + '='.repeat(100));
            console.log('📸 PASO 2: Registros de Imágenes en Base de Datos\n');

            const imagenesResult = await this.pool.query(`
                SELECT 
                    pi.id_imagen,
                    pi.id_producto,
                    pi.url_imagen,
                    pi.orden,
                    pi.es_principal,
                    p.nombre,
                    p.sku
                FROM producto_imagenes pi
                INNER JOIN productos p ON pi.id_producto = p.id_producto
                WHERE p.nombre ILIKE '%Honda%' OR p.sku ILIKE '%Honda%'
                ORDER BY p.nombre, pi.orden
            `);

            console.log(`   Total registros de imágenes: ${imagenesResult.rows.length}\n`);

            if (imagenesResult.rows.length > 0) {
                console.log('   Detalle de imágenes registradas:\n');
                imagenesResult.rows.forEach((img, i) => {
                    console.log(`   ${i + 1}. ${img.nombre}`);
                    console.log(`      URL: ${img.url_imagen}`);
                    console.log(`      Orden: ${img.orden} | Principal: ${img.es_principal ? 'Sí' : 'No'}\n`);
                });
            } else {
                console.log('   ⚠️  NO HAY REGISTROS DE IMÁGENES EN LA BASE DE DATOS\n');
            }

            // 3. Verificar archivos físicos
            console.log('\n' + '='.repeat(100));
            console.log('📁 PASO 3: Archivos Físicos de Imágenes\n');

            const directorios = [
                path.join(this.imageDir),
                path.join(this.imageDir, 'honda'),
                path.join(this.imageDir, 'suzuki')
            ];

            for (const dir of directorios) {
                console.log(`   📂 ${path.basename(dir) || 'products'}:`);

                if (fs.existsSync(dir)) {
                    const files = fs.readdirSync(dir);

                    if (files.length > 0) {
                        console.log(`      Total archivos: ${files.length}`);

                        // Filtrar archivos de Honda
                        const hondaFiles = files.filter(f =>
                            f.toLowerCase().includes('honda') ||
                            f.toLowerCase().includes('wave') ||
                            f.toLowerCase().includes('cb') ||
                            f.toLowerCase().includes('xr') ||
                            f.toLowerCase().includes('dio') ||
                            f.toLowerCase().includes('navi') ||
                            f.toLowerCase().includes('pcx') ||
                            f.toLowerCase().includes('nx')
                        );

                        console.log(`      Archivos Honda: ${hondaFiles.length}`);

                        if (hondaFiles.length > 0) {
                            console.log('\n      Archivos encontrados:');
                            hondaFiles.slice(0, 10).forEach(f => {
                                const filePath = path.join(dir, f);
                                const stats = fs.statSync(filePath);
                                console.log(`      - ${f} (${(stats.size / 1024).toFixed(2)} KB)`);
                            });
                            if (hondaFiles.length > 10) {
                                console.log(`      ... y ${hondaFiles.length - 10} más`);
                            }
                        }
                    } else {
                        console.log(`      ⚠️  Directorio vacío`);
                    }
                } else {
                    console.log(`      ❌ Directorio no existe`);
                }
                console.log('');
            }

            // 4. Verificar inconsistencias
            console.log('\n' + '='.repeat(100));
            console.log('⚠️  PASO 4: Análisis de Problemas\n');

            const problemas = [];

            if (sinImagenes > 0) {
                problemas.push(`❌ ${sinImagenes} productos Honda sin imágenes en BD`);
            }

            if (imagenesResult.rows.length === 0) {
                problemas.push('❌ NO hay registros de imágenes en la tabla producto_imagenes');
            }

            // Verificar si hay URLs pero no archivos
            for (const img of imagenesResult.rows) {
                const filePath = path.join(__dirname, 'backend', 'public', img.url_imagen);
                if (!fs.existsSync(filePath)) {
                    problemas.push(`❌ Archivo no existe: ${img.url_imagen} (producto: ${img.nombre})`);
                }
            }

            if (problemas.length > 0) {
                console.log('   Problemas encontrados:\n');
                problemas.forEach((p, i) => {
                    console.log(`   ${i + 1}. ${p}`);
                });
            } else {
                console.log('   ✅ No se encontraron problemas');
            }

            // 5. Recomendaciones
            console.log('\n' + '='.repeat(100));
            console.log('💡 PASO 5: Recomendaciones\n');

            if (imagenesResult.rows.length === 0) {
                console.log('   🔧 PROBLEMA IDENTIFICADO: Las imágenes se eliminaron de la BD\n');
                console.log('   SOLUCIONES POSIBLES:\n');
                console.log('   1. Ejecutar script que descargó imágenes originalmente');
                console.log('      → node download-honda-images.js\n');
                console.log('   2. Ejecutar script de procesamiento completo');
                console.log('      → node process-honda-final.js\n');
                console.log('   3. Verificar si hay un script que eliminó las imágenes');
                console.log('      → Revisar download-images-improved.js (línea 140)\n');
            } else if (sinImagenes > 0) {
                console.log('   🔧 Algunos productos sin imágenes\n');
                console.log('   SOLUCIÓN:');
                console.log('   → Ejecutar descarga de imágenes para productos faltantes\n');
            } else {
                console.log('   ✅ Todo parece estar en orden\n');
            }

            console.log('='.repeat(100) + '\n');

        } catch (error) {
            console.error('\n❌ Error en diagnóstico:', error.message);
            console.error(error.stack);
        } finally {
            await this.pool.end();
        }
    }
}

const diagnostico = new DiagnosticoImagenesHonda();
diagnostico.diagnosticar();
