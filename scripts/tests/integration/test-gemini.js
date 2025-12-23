/**
 * 🧪 Prueba Simple de Gemini API - Unificado
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../backend/.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log('\n🧪 PRUEBA UNIFICADA DE GEMINI API\n');

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY no encontrada');
        process.exit(1);
    }

    console.log(`✅ API Key encontrada: ${apiKey.substring(0, 20)}...`);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        console.log('✅ Modelo creado: gemini-pro');
        console.log('\n📤 Enviando prompt de prueba...\n');

        const result = await model.generateContent('Di "Hola, la integración funciona" en español');
        const response = await result.response;
        const text = response.text();

        console.log('📥 Respuesta de Gemini:');
        console.log(`   "${text}"`);
        console.log('\n✅ ¡Gemini API funciona correctamente! 🎉\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nDetalles completos:', error);
    }
}

if (require.main === module) {
    testGemini();
}
