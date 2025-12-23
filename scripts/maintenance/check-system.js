/**
 * Utility: System Health Check
 * Validates connection, tables, and basic data integrity.
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

async function checkSystem() {
    console.log('🩺 SYSTEM HEALTH CHECK\n');
    try {
        // 1. DB Connection
        const res = await pool.query('SELECT NOW()');
        console.log(`✅ DB Connection: OK (${res.rows[0].now})`);

        // 2. Table Existence
        const tables = ['productos', 'marcas', 'categorias', 'subcategorias', 'producto_imagenes', 'producto_atributos'];
        console.log('\n📊 Checking Tables:');
        for (const table of tables) {
            const count = await pool.query(`SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '${table}'`);
            if (count.rows[0].count > 0) {
                const rows = await pool.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`   - ${table}: OK (${rows.rows[0].count} rows)`);
            } else {
                console.error(`   ❌ ${table}: MISSING!`);
            }
        }

        // 3. Data Integrity Sample (Products without images)
        const orphanProducts = await pool.query(`
            SELECT COUNT(*) FROM productos p 
            LEFT JOIN producto_imagenes pi ON p.id_producto = pi.id_producto 
            WHERE pi.id_imagen IS NULL AND p.activo = true
        `);

        if (parseInt(orphanProducts.rows[0].count) > 0) {
            console.warn(`\n⚠️  Warning: ${orphanProducts.rows[0].count} active products have NO images.`);
        } else {
            console.log('\n✅ Data Integrity: All active products have images.');
        }

    } catch (error) {
        console.error('\n❌ CRITICAL ERROR:', error.message);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    checkSystem();
}

module.exports = checkSystem;
