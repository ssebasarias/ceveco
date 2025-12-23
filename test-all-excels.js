/**
 * 🧪 Script de Prueba y Análisis de Excel
 * Analiza todos los archivos en raw_data/ y genera reporte
 */

const ExcelNormalizer = require('./lib/excel-normalizer');
const fs = require('fs');
const path = require('path');

const normalizer = new ExcelNormalizer();

async function analyzeAllExcels() {
    const rawDataDir = path.join(__dirname, 'raw_data');
    const files = fs.readdirSync(rawDataDir).filter(f => f.endsWith('.xlsx'));

    console.log('\n' + '='.repeat(80));
    console.log('🧪 ANÁLISIS DE ARCHIVOS EXCEL');
    console.log('='.repeat(80));
    console.log(`\n📁 Archivos encontrados: ${files.length}\n`);

    const results = [];

    for (const file of files) {
        const filePath = path.join(rawDataDir, file);

        console.log('\n' + '-'.repeat(80));
        console.log(`📄 Analizando: ${file}`);
        console.log('-'.repeat(80));

        try {
            const products = normalizer.readAndNormalize(filePath);

            results.push({
                file,
                status: 'SUCCESS',
                products: products.length,
                sample: products[0] || null,
                error: null
            });

            console.log(`✅ Éxito: ${products.length} productos detectados`);

        } catch (error) {
            results.push({
                file,
                status: 'ERROR',
                products: 0,
                sample: null,
                error: error.message
            });

            console.log(`❌ Error: ${error.message}`);
        }
    }

    // Generar reporte
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMEN DEL ANÁLISIS');
    console.log('='.repeat(80));

    const successful = results.filter(r => r.status === 'SUCCESS');
    const failed = results.filter(r => r.status === 'ERROR');

    console.log(`\n✅ Exitosos: ${successful.length}/${files.length}`);
    console.log(`❌ Con errores: ${failed.length}/${files.length}`);
    console.log(`📦 Total de productos: ${successful.reduce((sum, r) => sum + r.products, 0)}`);

    // Detalles de exitosos
    if (successful.length > 0) {
        console.log('\n✅ ARCHIVOS EXITOSOS:');
        successful.forEach(r => {
            console.log(`\n  📄 ${r.file}`);
            console.log(`     Productos: ${r.products}`);
            if (r.sample) {
                console.log(`     Muestra:`);
                console.log(`       REF: ${r.sample.ref}`);
                console.log(`       Nombre: ${r.sample.nombre.substring(0, 50)}...`);
                console.log(`       Precio: $${r.sample.precio_contado.toLocaleString()}`);
            }
        });
    }

    // Detalles de errores
    if (failed.length > 0) {
        console.log('\n❌ ARCHIVOS CON ERRORES:');
        failed.forEach(r => {
            console.log(`\n  📄 ${r.file}`);
            console.log(`     Error: ${r.error}`);
        });
    }

    // Guardar reporte
    const reportPath = path.join(__dirname, 'analisis_excel_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Reporte guardado en: ${reportPath}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ ANÁLISIS COMPLETADO');
    console.log('='.repeat(80) + '\n');
}

analyzeAllExcels().catch(console.error);
