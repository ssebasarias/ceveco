/**
 * 🧪 Prueba Simple de Gemini API
 */

require('dotenv').config({ path: './backend/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log('\n🧪 PRUEBA SIMPLE DE GEMINI API\n');

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

        const result = await model.generateContent('Di "Hola" en español');
        const response = await result.response;
        const text = response.text();

        console.log('📥 Respuesta de Gemini:');
        console.log(`   "${text}"`);
        console.log('\n✅ ¡Gemini API funciona correctamente! 🎉\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nDetalles completos:');
        console.error(error);
        console.log('\n💡 Posibles soluciones:');
        console.log('   1. Verifica que la API key sea correcta');
        console.log('   2. Ve a https://makersuite.google.com/app/apikey');
        console.log('   3. Genera una nueva API key si es necesario\n');
    }
}

testGemini();
