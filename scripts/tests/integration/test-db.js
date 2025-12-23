/**
 * Test de conexión a BD - Unificado
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../backend/.env') });
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'ceveco_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

async function test() {
    try {
        console.log('🔌 Conectando a BD...');

        // Test 1: Verificar marcas
        const marcas = await pool.query('SELECT * FROM marcas LIMIT 5');
        console.log(`\n✅ Marcas encontradas: ${marcas.rows.length}`);
        marcas.rows.forEach(m => console.log(`   - ${m.nombre} (ID: ${m.id_marca})`));

        // Test 2: Verificar categorías
        const categorias = await pool.query('SELECT * FROM categorias LIMIT 5');
        console.log(`\n✅ Categorías encontradas: ${categorias.rows.length}`);
        categorias.rows.forEach(c => console.log(`   - ${c.nombre} (ID: ${c.id_categoria})`));

        // Test 3: Verificar productos
        const productos = await pool.query('SELECT COUNT(*) as total FROM productos');
        console.log(`\n✅ Total productos: ${productos.rows[0].total}`);

        console.log('\n✅ Conexión exitosa!');
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    test();
}

module.exports = test;
