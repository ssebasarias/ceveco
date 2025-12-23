/**
 * 🔧 CORRECCIÓN MASIVA DE PRODUCTOS
 * - Elimina precios de descripciones
 * - Reclasifica productos incorrectos
 * - Limpia datos
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

async function corregirTodosProductos() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    console.log('\n🔧 CORRECCIÓN MASIVA DE PRODUCTOS\n');

    try {
        // 1. Eliminar precios de TODAS las descripciones
        console.log('1️⃣  Eliminando precios de descripciones...\n');

        const productos = await pool.query(`
      SELECT id_producto, nombre, descripcion_larga, id_marca, id_categoria
      FROM productos
      WHERE descripcion_larga LIKE '%Precio especial%' 
         OR descripcion_larga LIKE '%Antes:%'
         OR descripcion_larga LIKE '%$%'
    `);

        console.log(`   Productos con precios en descripción: ${productos.rows.length}`);

        for (const prod of productos.rows) {
            // Generar descripción sin precios
            const marca = await pool.query('SELECT nombre FROM marcas WHERE id_marca = $1', [prod.id_marca]);
            const marcaNombre = marca.rows[0]?.nombre || 'Producto';

            const nuevaDescripcion = `<div class="product-description">
  <h3>${marcaNombre} ${prod.nombre}</h3>
  <p>Producto de alta calidad de la marca ${marcaNombre}.</p>
  
  <h4>Características:</h4>
  <p>Consulta las especificaciones técnicas en la ficha del producto.</p>
  
  <h4>Garantía y Soporte:</h4>
  <ul class="benefits">
    <li>✓ Garantía de fábrica</li>
    <li>✓ Envío a todo el país</li>
    <li>✓ Soporte técnico especializado</li>
  </ul>
</div>`;

            await pool.query(
                'UPDATE productos SET descripcion_larga = $1 WHERE id_producto = $2',
                [nuevaDescripcion, prod.id_producto]
            );
        }

        console.log(`   ✅ ${productos.rows.length} descripciones actualizadas\n`);

        // 2. Reclasificar productos mal clasificados
        console.log('2️⃣  Reclasificando productos incorrectos...\n');

        // Productos de muebles/escritorios que están en otras categorías
        const mueblesMalClasificados = await pool.query(`
      SELECT p.id_producto, p.nombre, p.sku, c.nombre as categoria_actual
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE (
        LOWER(p.nombre) LIKE '%escritorio%' 
        OR LOWER(p.nombre) LIKE '%biblioteca%'
        OR LOWER(p.nombre) LIKE '%mueble%'
        OR LOWER(p.nombre) LIKE '%silla%'
        OR LOWER(p.nombre) LIKE '%mesa%'
        OR LOWER(p.nombre) LIKE '%archivador%'
      )
      AND c.id_categoria != 2
    `);

        console.log(`   Muebles mal clasificados: ${mueblesMalClasificados.rows.length}`);

        // Obtener ID de categoría Muebles
        const categoriaMuebles = await pool.query("SELECT id_categoria FROM categorias WHERE nombre = 'Muebles y Organización'");
        const idMuebles = categoriaMuebles.rows[0]?.id_categoria || 2;

        // Obtener subcategoría genérica de muebles
        let subcategoriaMuebles = await pool.query(
            "SELECT id_subcategoria FROM subcategorias WHERE nombre = 'Muebles' AND id_categoria = $1",
            [idMuebles]
        );

        if (subcategoriaMuebles.rows.length === 0) {
            // Crear subcategoría
            const nueva = await pool.query(
                "INSERT INTO subcategorias (id_categoria, nombre, slug, activo) VALUES ($1, 'Muebles', 'muebles', true) RETURNING id_subcategoria",
                [idMuebles]
            );
            subcategoriaMuebles = nueva;
        }

        const idSubcatMuebles = subcategoriaMuebles.rows[0].id_subcategoria;

        for (const prod of mueblesMalClasificados.rows) {
            await pool.query(
                'UPDATE productos SET id_categoria = $1, id_subcategoria = $2 WHERE id_producto = $3',
                [idMuebles, idSubcatMuebles, prod.id_producto]
            );
            console.log(`   ✅ Reclasificado: ${prod.nombre.substring(0, 50)}...`);
        }

        // 3. Actualizar descripciones cortas
        console.log('\n3️⃣  Actualizando descripciones cortas...\n');

        await pool.query(`
      UPDATE productos 
      SET descripcion_corta = SUBSTRING(nombre FROM 1 FOR 200)
      WHERE LENGTH(descripcion_corta) > 200 OR descripcion_corta IS NULL
    `);

        console.log('   ✅ Descripciones cortas actualizadas\n');

        // 4. Reporte final
        console.log('📊 REPORTE FINAL:\n');

        const stats = await pool.query(`
      SELECT 
        c.nombre as categoria,
        COUNT(p.id_producto) as total
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      GROUP BY c.nombre
      ORDER BY total DESC
    `);

        console.log('   Distribución por categoría:');
        stats.rows.forEach(s => {
            console.log(`   ${s.categoria.padEnd(30)} ${s.total} productos`);
        });

        console.log('\n✅ CORRECCIÓN COMPLETADA\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

corregirTodosProductos();
