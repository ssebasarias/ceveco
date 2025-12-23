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
    const r = await p.query("SELECT column_name FROM information_schema.columns WHERE table_name='producto_imagenes' ORDER BY ordinal_position");
    console.log('Columnas en producto_imagenes:');
    r.rows.forEach(c => console.log('  -', c.column_name));
    await p.end();
})();
