require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
(async () => {
    const p = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    console.log('\n📊 VERIFICACIÓN DE DATOS EN BD\n');

    const productos = await p.query('SELECT COUNT(*) as total FROM productos');
    console.log(`✅ Productos en BD: ${productos.rows[0].total}`);

    const imagenes = await p.query('SELECT COUNT(*) as total FROM producto_imagenes');
    console.log(`✅ Imágenes en BD: ${imagenes.rows[0].total}`);

    const marcas = await p.query('SELECT COUNT(*) as total FROM marcas');
    console.log(`✅ Marcas en BD: ${marcas.rows[0].total}`);

    const subcategorias = await p.query('SELECT COUNT(*) as total FROM subcategorias');
    console.log(`✅ Subcategorías en BD: ${subcategorias.rows[0].total}`);

    console.log('\n📋 Últimos 5 productos insertados:\n');
    const ultimos = await p.query('SELECT sku, nombre, precio_actual FROM productos ORDER BY fecha_creacion DESC LIMIT 5');
    ultimos.rows.forEach((p, i) => {
        console.log(`${i + 1}. ${p.sku} - ${p.nombre.substring(0, 50)}... ($${p.precio_actual?.toLocaleString() || 0})`);
    });

    await p.end();
    console.log('');
})();
