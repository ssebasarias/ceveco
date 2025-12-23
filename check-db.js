// Script rápido para verificar el estado de la base de datos
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'ceveco_db',
    user: 'postgres',
    password: 'postgres'
});

async function checkDatabase() {
    try {
        const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM productos) as productos,
        (SELECT COUNT(*) FROM producto_imagenes) as imagenes,
        (SELECT COUNT(*) FROM producto_atributos) as atributos,
        (SELECT COUNT(*) FROM categorias) as categorias,
        (SELECT COUNT(*) FROM marcas) as marcas,
        (SELECT COUNT(*) FROM subcategorias) as subcategorias;
    `);

        console.log('\n📊 Estado actual de la base de datos:\n');
        console.table(result.rows[0]);

        if (result.rows[0].productos === '0') {
            console.log('✅ Base de datos limpia - Lista para nuevos productos\n');
        } else {
            console.log(`⚠️  Hay ${result.rows[0].productos} productos en la base de datos\n`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkDatabase();
