/**
 * 🧪 Prueba del Clasificador Inteligente
 * Verifica que Gemini API funciona correctamente
 */

require('dotenv').config({ path: './backend/.env' });
const IntelligentClassifier = require('./lib/intelligent-classifier');

async function testClassifier() {
    console.log('\n🧪 PRUEBA DEL CLASIFICADOR INTELIGENTE\n');

    // Verificar API key
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ Error: GEMINI_API_KEY no encontrada en .env');
        process.exit(1);
    }

    console.log('✅ API Key encontrada');

    // Crear clasificador
    const classifier = new IntelligentClassifier(
        process.env.GEMINI_API_KEY,
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        }
    );

    console.log('✅ Clasificador creado\n');

    // Productos de prueba
    const testProducts = [
        {
            ref: 'WAVE 110S CBS',
            nombre: '2026',
            categoria: 'HONDA',
            archivo: 'HONDA AGOSTO 01 2025.xlsx'
        },
        {
            ref: 'CSO 90 - 15 cm',
            nombre: 'SEMIORTOPEDICO',
            categoria: 'COMODISIMOS',
            archivo: 'COMODISIMOS AGOSTO 15 2025.xlsx'
        },
        {
            ref: '32LR600',
            nombre: 'TV 32" HD Smart TV WebOS',
            categoria: 'LG',
            archivo: 'LG NOVIEMBRE 29 2025.xlsx'
        }
    ];

    console.log('📊 Probando con 3 productos diferentes:\n');

    for (let i = 0; i < testProducts.length; i++) {
        const product = testProducts[i];

        console.log(`${'-'.repeat(70)}`);
        console.log(`Prueba ${i + 1}/3: ${product.ref}`);
        console.log(`${'-'.repeat(70)}`);

        try {
            const result = await classifier.classifyProduct(product);

            console.log('\n✅ Clasificación exitosa:');
            console.log(`   Categoría: ${result.categoria.nombre} (ID: ${result.categoria.id})`);
            console.log(`   Subcategoría: ${result.subcategoria.nombre || 'N/A'} ${result.subcategoria.id ? `(ID: ${result.subcategoria.id})` : ''}`);
            console.log(`   Acción: ${result.subcategoria.accion}`);
            console.log(`   Marca: ${result.marca.nombre} ${result.marca.id ? `(ID: ${result.marca.id})` : ''}`);
            console.log(`   Nombre sugerido: ${result.nombre_sugerido}`);

            if (result.atributos && result.atributos.length > 0) {
                console.log(`   Atributos:`);
                result.atributos.forEach(attr => {
                    console.log(`     - ${attr.nombre}: ${attr.valor}${attr.unidad ? ' ' + attr.unidad : ''}`);
                });
            }

            console.log('');

        } catch (error) {
            console.error(`\n❌ Error en clasificación: ${error.message}\n`);
        }

        // Pequeña pausa entre requests
        if (i < testProducts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log('='.repeat(70));
    console.log('✅ PRUEBA COMPLETADA');
    console.log('='.repeat(70));
    console.log('\nSi viste las 3 clasificaciones arriba, ¡todo funciona perfecto! 🎉\n');

    await classifier.close();
}

testClassifier().catch(error => {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
});
