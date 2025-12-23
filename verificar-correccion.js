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

    console.log('\n📊 VERIFICACIÓN POST-CORRECCIÓN\n');

    // Ver un producto corregido
    const prod = await p.query(`
    SELECT p.id_producto, p.sku, p.nombre, p.descripcion_corta, c.nombre as categoria, s.nombre as subcategoria
    FROM productos p
    JOIN marcas m ON p.id_marca = m.id_marca
    JOIN categorias c ON p.id_categoria = c.id_categoria
    LEFT JOIN subcategorias s ON p.id_subcategoria = s.id_subcategoria
    WHERE m.nombre = 'STIHL' AND (p.nombre LIKE '%HP%' OR p.nombre LIKE '%cc%')
    LIMIT 1
  `);

    if (prod.rows.length > 0) {
        const producto = prod.rows[0];
        console.log('📦 PRODUCTO CORREGIDO:');
        console.log(`   SKU: ${producto.sku}`);
        console.log(`   Nombre: ${producto.nombre}`);
        console.log(`   Categoría: ${producto.categoria}`);
        console.log(`   Subcategoría: ${producto.subcategoria || 'N/A'}`);
        console.log(`   Descripción: ${producto.descripcion_corta.substring(0, 100)}...`);

        // Ver atributos
        const attrs = await p.query(`
      SELECT a.nombre, a.unidad, a.tipo_dato, pa.valor_texto, pa.valor_numero
      FROM producto_atributos pa
      JOIN atributos a ON pa.id_atributo = a.id_atributo
      WHERE pa.id_producto = $1
    `, [producto.id_producto]);

        console.log(`\n🔧 ATRIBUTOS (${attrs.rows.length} total):`);
        attrs.rows.forEach(attr => {
            console.log(`   • ${attr.nombre}: ${attr.valor_texto || attr.valor_numero} ${attr.unidad || ''}`);
        });
    }

    await p.end();
    console.log('\n✅ Verificación completada\n');
})();
