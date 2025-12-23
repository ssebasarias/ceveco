/**
 * Ver estructura de tabla atributos
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

async function checkAtributos() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    try {
        console.log('\n📋 Estructura de tabla atributos:\n');

        const result = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'atributos'
      ORDER BY ordinal_position
    `);

        result.rows.forEach(col => {
            console.log(`  ${col.column_name.padEnd(30)} ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''.padEnd(10)} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });

        console.log('\n📋 Estructura de tabla producto_atributos:\n');

        const result2 = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'producto_atributos'
      ORDER BY ordinal_position
    `);

        result2.rows.forEach(col => {
            console.log(`  ${col.column_name.padEnd(30)} ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''.padEnd(10)} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkAtributos();
