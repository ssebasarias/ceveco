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

async function checkImages() {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT p.nombre, COUNT(pi.id_imagen) as total_imagenes
            FROM productos p
            LEFT JOIN producto_imagenes pi ON p.id_producto = pi.id_producto
            WHERE p.nombre LIKE '%NAVI 2026%'
            GROUP BY p.nombre;
        `);

        console.log('Resultado:', result.rows);

        // También ver las imágenes
        const images = await client.query(`
            SELECT pi.url_imagen, pi.orden
            FROM productos p
            JOIN producto_imagenes pi ON p.id_producto = pi.id_producto
            WHERE p.nombre LIKE '%NAVI 2026%'
            ORDER BY pi.orden;
        `);

        console.log('\nImágenes:');
        images.rows.forEach(img => console.log(`  ${img.orden}. ${img.url_imagen}`));

    } finally {
        client.release();
        await pool.end();
    }
}

checkImages();
