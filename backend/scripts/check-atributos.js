const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'ceveco_db'
});

async function checkTables() {
    const client = await pool.connect();

    try {
        // Ver estructura de producto_atributos
        console.log('=== Estructura de producto_atributos ===');
        const structure = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'producto_atributos'
            ORDER BY ordinal_position;
        `);
        console.log(structure.rows);

        // Ver si hay datos en producto_atributos
        console.log('\n=== Datos en producto_atributos ===');
        const data = await client.query(`
            SELECT * FROM producto_atributos 
            WHERE id_producto = (SELECT id_producto FROM productos WHERE nombre LIKE '%NAVI 2026%' LIMIT 1)
            LIMIT 5;
        `);
        console.log(`Total atributos para NAVI 2026: ${data.rows.length}`);
        data.rows.forEach(row => console.log(row));

        // Ver si existe la tabla atributos
        console.log('\n=== Tabla atributos ===');
        const atributosTable = await client.query(`
            SELECT COUNT(*) as total FROM atributos;
        `);
        console.log(`Total registros en atributos: ${atributosTable.rows[0].total}`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkTables();
