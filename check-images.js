require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

(async () => {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    console.log('\nDIAGNOSTICO DE IMAGENES\n');

    // 1. URLs en BD
    const urls = await pool.query('SELECT url_imagen FROM producto_imagenes LIMIT 3');
    console.log('URLs en BD:');
    urls.rows.forEach(r => console.log('  ', r.url_imagen));

    // 2. Archivos en disco
    const dirs = [
        'product_images_final',
        'backend/public/images/products',
        'frontend/public/images/products'
    ];

    console.log('\nArchivos en disco:');
    dirs.forEach(dir => {
        const fullPath = path.join(__dirname, dir);
        if (fs.existsSync(fullPath)) {
            const files = fs.readdirSync(fullPath);
            console.log(`  ${dir}: ${files.length} archivos`);
        } else {
            console.log(`  ${dir}: NO EXISTE`);
        }
    });

    // 3. Problema
    const productImages = path.join(__dirname, 'product_images_final');
    const backendPublic = path.join(__dirname, 'backend', 'public', 'images', 'products');

    console.log('\nPROBLEMA:');
    if (fs.existsSync(productImages) && !fs.existsSync(backendPublic)) {
        console.log('  Las imagenes estan en product_images_final');
        console.log('  Pero el backend busca en backend/public/images/products');
        console.log('\nSOLUCION:');
        console.log('  Copiar imagenes a backend/public/images/products');
    }

    await pool.end();
})();
