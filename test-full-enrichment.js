/**
 * 🧪 Prueba de Enriquecimiento Completo
 * Procesa 1 producto de cada categoría con scraping, imágenes y BD
 */

require('dotenv').config({ path: './backend/.env' });
const ExcelNormalizer = require('./lib/excel-normalizer');
const RuleBasedClassifier = require('./lib/rule-based-classifier');
const ProductSearcher = require('./lib/product-searcher');
const AIEnricher = require('./lib/ai-enricher');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function testFullEnrichment() {
    console.log('\n' + '='.repeat(100));
    console.log('🧪 PRUEBA DE ENRIQUECIMIENTO COMPLETO');
    console.log('='.repeat(100) + '\n');

    // Inicializar componentes
    const classifier = new RuleBasedClassifier({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    const searcher = new ProductSearcher();
    await searcher.init();

    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    console.log('✅ Componentes inicializados\n');

    // Seleccionar 1 producto de cada categoría
    const testProducts = [
        { file: 'LG NOVIEMBRE 29 2025.xlsx', categoria: 'Electro Hogar' },
        { file: 'HONDA AGOSTO 01 2025.xlsx', categoria: 'Motos' },
        { file: 'INVAL OCTUBRE 25 2025.xlsx', categoria: 'Muebles' },
        { file: 'STIHL NOVIEMBRE 18 2025.xlsx', categoria: 'STIHL' }
    ];

    const normalizer = new ExcelNormalizer();
    const results = [];

    for (const test of testProducts) {
        console.log('\n' + '█'.repeat(100));
        console.log(`📁 Procesando: ${test.file}`);
        console.log('█'.repeat(100));

        try {
            const filePath = path.join(__dirname, 'raw_data', test.file);
            const products = normalizer.readAndNormalize(filePath);

            if (products.length === 0) {
                console.log('⚠️  No hay productos\n');
                continue;
            }

            const product = products[0]; // Tomar el primero

            console.log('\n📦 PRODUCTO SELECCIONADO:');
            console.log(`   REF: ${product.ref}`);
            console.log(`   Nombre: ${product.nombre}`);
            console.log(`   Precio: $${product.precio_contado.toLocaleString()}`);

            // 1. Clasificar
            console.log('\n🤖 PASO 1: Clasificación...');
            const classification = await classifier.classifyProduct({
                ref: product.ref,
                nombre: product.nombre,
                categoria: product.categoria,
                archivo: test.file
            });

            console.log(`   ✅ Categoría: ${classification.categoria.nombre}`);
            console.log(`   ✅ Subcategoría: ${classification.subcategoria.nombre}`);
            console.log(`   ✅ Marca: ${classification.marca.nombre}`);

            // 2. Buscar en web
            console.log('\n🔍 PASO 2: Búsqueda web...');
            const searchQuery = `${classification.marca.nombre} ${product.nombre}`;
            console.log(`   Query: "${searchQuery}"`);

            const searchResults = await searcher.searchProduct(searchQuery);

            if (searchResults.urls && searchResults.urls.length > 0) {
                console.log(`   ✅ URLs encontradas: ${searchResults.urls.length}`);
                console.log(`      Primera: ${searchResults.urls[0].substring(0, 60)}...`);
            } else {
                console.log(`   ⚠️  No se encontraron URLs`);
            }

            if (searchResults.images && searchResults.images.length > 0) {
                console.log(`   ✅ Imágenes encontradas: ${searchResults.images.length}`);
                console.log(`      Primera: ${searchResults.images[0].substring(0, 60)}...`);
            } else {
                console.log(`   ⚠️  No se encontraron imágenes`);
            }

            // 3. Extraer info de la primera URL (si existe)
            let productInfo = null;
            if (searchResults.urls && searchResults.urls.length > 0) {
                console.log('\n📄 PASO 3: Extrayendo información de la página...');
                try {
                    productInfo = await searcher.extractProductInfo(searchResults.urls[0]);

                    if (productInfo.title) {
                        console.log(`   ✅ Título: ${productInfo.title.substring(0, 60)}...`);
                    }
                    if (productInfo.description) {
                        console.log(`   ✅ Descripción: ${productInfo.description.substring(0, 60)}...`);
                    }
                    if (productInfo.specs && Object.keys(productInfo.specs).length > 0) {
                        console.log(`   ✅ Especificaciones: ${Object.keys(productInfo.specs).length} encontradas`);
                        const firstSpecs = Object.entries(productInfo.specs).slice(0, 3);
                        firstSpecs.forEach(([key, value]) => {
                            console.log(`      - ${key}: ${value}`);
                        });
                    }
                    if (productInfo.images && productInfo.images.length > 0) {
                        console.log(`   ✅ Imágenes en página: ${productInfo.images.length}`);
                    }
                } catch (error) {
                    console.log(`   ⚠️  Error extrayendo info: ${error.message}`);
                }
            }

            // 4. Preparar datos para inserción
            console.log('\n💾 PASO 4: Preparando para inserción en BD...');

            const enrichedProduct = {
                ref: product.ref,
                nombre: classification.nombre_sugerido || product.nombre,
                descripcion_corta: productInfo?.description?.substring(0, 200) || `${classification.marca.nombre} ${product.nombre}`,
                descripcion_larga: productInfo?.description || '',
                id_categoria: classification.categoria.id,
                id_subcategoria: classification.subcategoria.id,
                id_marca: classification.marca.id || 1,
                precio: product.precio_contado,
                precio_oferta: product.precio_promo,
                stock: 10, // Default
                activo: true,
                destacado: false,
                imagenes: searchResults.images?.slice(0, 5) || [],
                especificaciones: productInfo?.specs || {},
                atributos: classification.atributos || []
            };

            console.log(`   ✅ Producto enriquecido:`);
            console.log(`      - Nombre: ${enrichedProduct.nombre.substring(0, 50)}...`);
            console.log(`      - Descripción corta: ${enrichedProduct.descripcion_corta.substring(0, 50)}...`);
            console.log(`      - Imágenes: ${enrichedProduct.imagenes.length}`);
            console.log(`      - Especificaciones: ${Object.keys(enrichedProduct.especificaciones).length}`);
            console.log(`      - Atributos: ${enrichedProduct.atributos.length}`);

            // 5. Insertar en BD (simulado por ahora)
            console.log('\n📝 PASO 5: Insertando en BD...');
            console.log(`   ⚠️  MODO PRUEBA: No se insertará realmente`);
            console.log(`   ✅ Datos listos para inserción`);

            results.push({
                archivo: test.file,
                categoria: test.categoria,
                producto: product,
                clasificacion: classification,
                busqueda: searchResults,
                info: productInfo,
                enriquecido: enrichedProduct,
                exito: true
            });

            console.log('\n✅ Producto procesado exitosamente');

        } catch (error) {
            console.error(`\n❌ Error: ${error.message}`);
            console.error(error.stack);
            results.push({
                archivo: test.file,
                categoria: test.categoria,
                error: error.message,
                exito: false
            });
        }
    }

    // Resumen final
    console.log('\n\n' + '='.repeat(100));
    console.log('📊 RESUMEN DE LA PRUEBA');
    console.log('='.repeat(100));

    const exitosos = results.filter(r => r.exito);
    const fallidos = results.filter(r => !r.exito);

    console.log(`\n✅ Exitosos: ${exitosos.length}/${testProducts.length}`);
    console.log(`❌ Fallidos: ${fallidos.length}/${testProducts.length}`);

    if (exitosos.length > 0) {
        console.log('\n📋 Productos enriquecidos:');
        exitosos.forEach(r => {
            console.log(`\n   ${r.categoria}:`);
            console.log(`      Archivo: ${r.archivo}`);
            console.log(`      Producto: ${r.producto.nombre.substring(0, 40)}...`);
            console.log(`      URLs encontradas: ${r.busqueda.urls?.length || 0}`);
            console.log(`      Imágenes: ${r.enriquecido.imagenes.length}`);
            console.log(`      Especificaciones: ${Object.keys(r.enriquecido.especificaciones).length}`);
        });
    }

    if (fallidos.length > 0) {
        console.log('\n❌ Errores:');
        fallidos.forEach(r => {
            console.log(`   - ${r.archivo}: ${r.error}`);
        });
    }

    console.log('\n💡 SIGUIENTE PASO:');
    if (exitosos.length === testProducts.length) {
        console.log('   ✅ Todo funciona correctamente');
        console.log('   🚀 Listo para procesar todos los productos');
        console.log('   📝 Comando: node product-enrichment-full.js raw_data/*.xlsx');
    } else {
        console.log('   ⚠️  Revisar errores antes de continuar');
    }

    console.log('\n' + '='.repeat(100));
    console.log('✅ PRUEBA COMPLETADA');
    console.log('='.repeat(100) + '\n');

    // Guardar reporte
    const reportPath = path.join(__dirname, 'reporte_enriquecimiento_prueba.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`💾 Reporte guardado en: ${reportPath}\n`);

    await searcher.close();
    await classifier.close();
    await pool.end();
}

testFullEnrichment().catch(error => {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
});
