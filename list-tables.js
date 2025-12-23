/**
 * Listar todas las tablas de la BD
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

async function listTables() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    try {
        console.log('\n📋 Tablas en la base de datos:\n');

        const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

        result.rows.forEach((row, idx) => {
            console.log(`${idx + 1}. ${row.table_name}`);
        });

        console.log(`\nTotal: ${result.rows.length} tablas\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

listTables();
