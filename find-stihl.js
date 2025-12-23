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
    const r = await p.query(`
    SELECT p.id_producto, p.sku, p.nombre 
    FROM productos p 
    JOIN marcas m ON p.id_marca = m.id_marca 
    WHERE m.nombre = 'STIHL' 
    AND (p.nombre LIKE '%HP%' OR p.nombre LIKE '%cc%' OR p.nombre LIKE '%kg%') 
    LIMIT 5
  `);
    console.log('Productos STIHL con especificaciones:');
    r.rows.forEach(prod => console.log(`${prod.id_producto} - ${prod.sku} - ${prod.nombre.substring(0, 80)}`));
    await p.end();
})();
