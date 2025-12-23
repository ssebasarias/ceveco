/**
 * Verificar estructura de tabla producto_atributos
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

async function checkTableStructure() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    try {
        console.log('\n📋 Estructura de tabla producto_atributos:\n');

        const result = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'producto_atributos'
      ORDER BY ordinal_position
    `);

        if (result.rows.length === 0) {
            console.log('⚠️  Tabla producto_atributos no existe\n');
            console.log('💡 Necesitas crear la tabla primero');
        } else {
            console.log('Columnas:');
            result.rows.forEach(col => {
                console.log(`  - ${col.column_name} (${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkTableStructure();
