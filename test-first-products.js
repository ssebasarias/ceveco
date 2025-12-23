/**
 * 🧪 Prueba con Primer Producto de Cada Excel
 * Usa el clasificador basado en reglas (sin APIs)
 */

require('dotenv').config({ path: './backend/.env' });
const ExcelNormalizer = require('./lib/excel-normalizer');
const RuleBasedClassifier = require('./lib/rule-based-classifier');
const fs = require('fs');
const path = require('path');

async function testFirstProducts() {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 PRUEBA: PRIMER PRODUCTO DE CADA EXCEL');
    console.log('='.repeat(80) + '\n');

    // Crear clasificador
    const classifier = new RuleBasedClassifier({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    console.log('✅ Clasificador creado (basado en reglas)\n');

    // Leer archivos Excel
    const rawDataDir = path.join(__dirname, 'raw_data');
    const files = fs.readdirSync(rawDataDir).filter(f => f.endsWith('.xlsx'));

    console.log(`📁 Archivos encontrados: ${files.length}\n`);

    const normalizer = new ExcelNormalizer();
    const results = [];

    for (const file of files) {
        const filePath = path.join(rawDataDir, file);

        console.log('─'.repeat(80));
        console.log(`📄 Archivo: ${file}`);
        console.log('─'.repeat(80));

        try {
            // Normalizar Excel
            const products = normalizer.readAndNormalize(filePath);

            if (products.length === 0) {
                console.log('⚠️  No se encontraron productos\n');
                continue;
            }

            // Tomar solo el primer producto
            const firstProduct = products[0];

            console.log('\n📦 Primer producto detectado:');
            console.log(`   REF: ${firstProduct.ref}`);
            console.log(`   Nombre: ${firstProduct.nombre.substring(0, 60)}${firstProduct.nombre.length > 60 ? '...' : ''}`);
            console.log(`   Categoría Excel: ${firstProduct.categoria}`);
            console.log(`   Precio: $${firstProduct.precio_contado.toLocaleString()}`);

            // Clasificar con el sistema inteligente
            console.log('\n🤖 Clasificando...');

            const classification = await classifier.classifyProduct({
                ref: firstProduct.ref,
                nombre: firstProduct.nombre,
                categoria: firstProduct.categoria,
                archivo: file
            });

            console.log('\n✅ Clasificación:');
            console.log(`   📁 Categoría: ${classification.categoria.nombre} (ID: ${classification.categoria.id})`);
            console.log(`   📂 Subcategoría: ${classification.subcategoria.nombre} (ID: ${classification.subcategoria.id})`);
            console.log(`      Acción: ${classification.subcategoria.accion}`);
            console.log(`   🏷️  Marca: ${classification.marca.nombre} ${classification.marca.id ? `(ID: ${classification.marca.id})` : '(nueva)'}`);
            console.log(`   📝 Nombre sugerido: ${classification.nombre_sugerido.substring(0, 60)}${classification.nombre_sugerido.length > 60 ? '...' : ''}`);

            if (classification.atributos && classification.atributos.length > 0) {
                console.log(`   🔧 Atributos:`);
                classification.atributos.forEach(attr => {
                    console.log(`      - ${attr.nombre}: ${attr.valor}${attr.unidad ? ' ' + attr.unidad : ''}`);
                });
            }

            console.log('');

            results.push({
                archivo: file,
                producto: firstProduct,
                clasificacion: classification,
                exito: true
            });

        } catch (error) {
            console.error(`\n❌ Error: ${error.message}\n`);
            results.push({
                archivo: file,
                error: error.message,
                exito: false
            });
        }
    }

    // Resumen final
    console.log('='.repeat(80));
    console.log('📊 RESUMEN DE LA PRUEBA');
    console.log('='.repeat(80));

    const exitosos = results.filter(r => r.exito);
    const fallidos = results.filter(r => !r.exito);

    console.log(`\n✅ Exitosos: ${exitosos.length}/${files.length}`);
    console.log(`❌ Fallidos: ${fallidos.length}/${files.length}`);

    if (exitosos.length > 0) {
        console.log('\n📋 Productos clasificados por categoría:');

        const porCategoria = {};
        exitosos.forEach(r => {
            const cat = r.clasificacion.categoria.nombre;
            if (!porCategoria[cat]) porCategoria[cat] = [];
            porCategoria[cat].push(r.archivo);
        });

        for (const [categoria, archivos] of Object.entries(porCategoria)) {
            console.log(`\n   ${categoria} (${archivos.length}):`);
            archivos.forEach(archivo => {
                console.log(`      - ${archivo}`);
            });
        }
    }

    if (fallidos.length > 0) {
        console.log('\n❌ Archivos con errores:');
        fallidos.forEach(r => {
            console.log(`   - ${r.archivo}: ${r.error}`);
        });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ PRUEBA COMPLETADA');
    console.log('='.repeat(80));
    console.log('\n💡 Si todo se ve bien, puedes procesar todos los productos con:');
    console.log('   node product-enrichment-full.js raw_data/*.xlsx\n');

    await classifier.close();
}

testFirstProducts().catch(error => {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
});
