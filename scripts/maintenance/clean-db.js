/**
 * Utility: Clean Database
 * TRUNCATES all product data (use with caution!)
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

async function cleanDatabase() {
    console.log('⚠️  DANGER: CLEANING DATABASE IN 3 SECONDS... (Ctrl+C to cancel)');
    await new Promise(r => setTimeout(r, 3000));

    try {
        await pool.query('BEGIN');

        // Clean dependent tables first
        console.log('🧹 Cleaning images...');
        await pool.query('TRUNCATE TABLE producto_imagenes RESTART IDENTITY CASCADE');

        console.log('🧹 Cleaning attributes...');
        await pool.query('TRUNCATE TABLE producto_atributos RESTART IDENTITY CASCADE');

        console.log('🧹 Cleaning products...');
        await pool.query('TRUNCATE TABLE productos RESTART IDENTITY CASCADE');

        await pool.query('COMMIT');
        console.log('\n✅ Database Cleaned Successfully.');
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('\n❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    cleanDatabase();
}
