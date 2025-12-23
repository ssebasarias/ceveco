/**
 * 📊 Reporte Detallado - Primeros 5 Productos de Cada Excel
 */

require('dotenv').config({ path: './backend/.env' });
const ExcelNormalizer = require('./lib/excel-normalizer');
const RuleBasedClassifier = require('./lib/rule-based-classifier');
const fs = require('fs');
const path = require('path');

async function generateDetailedReport() {
    console.log('\n' + '='.repeat(100));
    console.log('📊 REPORTE DETALLADO - PRIMEROS 5 PRODUCTOS POR ARCHIVO');
    console.log('='.repeat(100) + '\n');

    const classifier = new RuleBasedClassifier({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    const rawDataDir = path.join(__dirname, 'raw_data');
    const files = fs.readdirSync(rawDataDir).filter(f => f.endsWith('.xlsx'));

    const normalizer = new ExcelNormalizer();
    const allResults = [];

    for (const file of files) {
        const filePath = path.join(rawDataDir, file);

        console.log('\n' + '█'.repeat(100));
        console.log(`📁 ARCHIVO: ${file}`);
        console.log('█'.repeat(100));

        try {
            const products = normalizer.readAndNormalize(filePath);

            if (products.length === 0) {
                console.log('⚠️  No se encontraron productos\n');
                continue;
            }

            console.log(`\n✅ Total productos en archivo: ${products.length}`);
            console.log(`📋 Analizando primeros 5 productos...\n`);

            const first5 = products.slice(0, 5);

            for (let i = 0; i < first5.length; i++) {
                const product = first5[i];

                console.log('─'.repeat(100));
                console.log(`PRODUCTO ${i + 1}/5`);
                console.log('─'.repeat(100));

                // Datos originales del Excel
                console.log('\n📥 DATOS ORIGINALES DEL EXCEL:');
                console.log(`   REF Excel: ${product.ref}`);
                console.log(`   Nombre Excel: ${product.nombre}`);
                console.log(`   Categoría Excel: ${product.categoria}`);
                console.log(`   Precio Contado: $${product.precio_contado.toLocaleString()}`);
                console.log(`   Precio Promo: $${product.precio_promo.toLocaleString()}`);

                // Clasificación automática
                const classification = await classifier.classifyProduct({
                    ref: product.ref,
                    nombre: product.nombre,
                    categoria: product.categoria,
                    archivo: file
                });

                console.log('\n🤖 CLASIFICACIÓN AUTOMÁTICA:');
                console.log(`   📁 Categoría Principal: ${classification.categoria.nombre} (ID: ${classification.categoria.id})`);
                console.log(`      Confianza: ${(classification.categoria.confianza * 100).toFixed(0)}%`);
                console.log(`   📂 Subcategoría: ${classification.subcategoria.nombre} (ID: ${classification.subcategoria.id})`);
                console.log(`      Acción: ${classification.subcategoria.accion}`);
                console.log(`      Razón: ${classification.subcategoria.razon}`);
                console.log(`   🏷️  Marca: ${classification.marca.nombre} ${classification.marca.id ? `(ID: ${classification.marca.id})` : '(nueva)'}`);
                console.log(`      Acción: ${classification.marca.accion}`);

                if (classification.atributos && classification.atributos.length > 0) {
                    console.log(`   🔧 Atributos Detectados:`);
                    classification.atributos.forEach(attr => {
                        console.log(`      • ${attr.nombre}: ${attr.valor}${attr.unidad ? ' ' + attr.unidad : ''}`);
                    });
                } else {
                    console.log(`   🔧 Atributos: Ninguno detectado`);
                }

                console.log(`   📝 Nombre Sugerido: ${classification.nombre_sugerido}`);

                // Verificación
                console.log('\n✅ VERIFICACIÓN:');
                const isCorrect = classification.categoria.confianza > 0.8;
                console.log(`   ¿Clasificación correcta? ${isCorrect ? '✅ Probablemente SÍ' : '⚠️  Revisar manualmente'}`);

                if (product.ref !== classification.nombre_sugerido && !classification.nombre_sugerido.includes(product.ref)) {
                    console.log(`   ⚠️  NOTA: El nombre sugerido difiere de la referencia original`);
                }

                console.log('');

                allResults.push({
                    archivo: file,
                    producto_num: i + 1,
                    original: product,
                    clasificacion: classification
                });
            }

            console.log('═'.repeat(100));
            console.log(`✅ Completado: ${file} (${first5.length} productos analizados)`);
            console.log('═'.repeat(100));

        } catch (error) {
            console.error(`\n❌ ERROR: ${error.message}\n`);
        }
    }

    // Resumen final
    console.log('\n\n' + '█'.repeat(100));
    console.log('📊 RESUMEN GENERAL');
    console.log('█'.repeat(100));

    const porCategoria = {};
    allResults.forEach(r => {
        const cat = r.clasificacion.categoria.nombre;
        if (!porCategoria[cat]) {
            porCategoria[cat] = {
                archivos: new Set(),
                productos: 0,
                subcategorias: new Set(),
                marcas: new Set()
            };
        }
        porCategoria[cat].archivos.add(r.archivo);
        porCategoria[cat].productos++;
        porCategoria[cat].subcategorias.add(r.clasificacion.subcategoria.nombre);
        porCategoria[cat].marcas.add(r.clasificacion.marca.nombre);
    });

    console.log('\n📋 DISTRIBUCIÓN POR CATEGORÍA:');
    for (const [categoria, data] of Object.entries(porCategoria)) {
        console.log(`\n   ${categoria}:`);
        console.log(`      Productos analizados: ${data.productos}`);
        console.log(`      Archivos: ${data.archivos.size}`);
        console.log(`      Subcategorías: ${Array.from(data.subcategorias).join(', ')}`);
        console.log(`      Marcas: ${Array.from(data.marcas).join(', ')}`);
    }

    console.log('\n\n📈 ESTADÍSTICAS:');
    console.log(`   Total productos analizados: ${allResults.length}`);
    console.log(`   Total archivos procesados: ${files.length}`);
    console.log(`   Promedio por archivo: ${(allResults.length / files.length).toFixed(1)} productos`);

    const confianzaAlta = allResults.filter(r => r.clasificacion.categoria.confianza > 0.8).length;
    console.log(`   Clasificaciones con alta confianza (>80%): ${confianzaAlta}/${allResults.length} (${(confianzaAlta / allResults.length * 100).toFixed(0)}%)`);

    const subcategoriasCreadas = allResults.filter(r => r.clasificacion.subcategoria.accion === 'crear_nueva').length;
    console.log(`   Subcategorías nuevas creadas: ${subcategoriasCreadas}`);

    const marcasCreadas = allResults.filter(r => r.clasificacion.marca.accion === 'crear_nueva').length;
    console.log(`   Marcas nuevas creadas: ${marcasCreadas}`);

    console.log('\n\n💡 RECOMENDACIONES:');
    console.log('   1. Revisa las clasificaciones con confianza < 80%');
    console.log('   2. Verifica que las subcategorías creadas sean apropiadas');
    console.log('   3. Confirma que las marcas detectadas sean correctas');
    console.log('   4. Si todo se ve bien, procesa el resto de productos');

    console.log('\n' + '█'.repeat(100));
    console.log('✅ REPORTE COMPLETADO');
    console.log('█'.repeat(100) + '\n');

    // Guardar reporte en JSON
    const reportPath = path.join(__dirname, 'reporte_5_productos.json');
    fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2));
    console.log(`💾 Reporte detallado guardado en: ${reportPath}\n`);

    await classifier.close();
}

generateDetailedReport().catch(error => {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
});
