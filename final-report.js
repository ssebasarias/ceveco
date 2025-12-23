require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

(async () => {
    const p = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    console.log('\n' + '='.repeat(100));
    console.log('📊 REPORTE FINAL DEL PROCESAMIENTO');
    console.log('='.repeat(100) + '\n');

    // Contar productos
    const productos = await p.query('SELECT COUNT(*) as total FROM productos');
    console.log(`📦 PRODUCTOS EN BD: ${productos.rows[0].total}`);

    // Contar imágenes
    const imagenes = await p.query('SELECT COUNT(*) as total FROM producto_imagenes');
    console.log(`🖼️  IMÁGENES EN BD: ${imagenes.rows[0].total}`);

    // Promedio de imágenes por producto
    const promedio = (imagenes.rows[0].total / productos.rows[0].total).toFixed(1);
    console.log(`   Promedio por producto: ${promedio} imágenes`);

    // Contar marcas
    const marcas = await p.query('SELECT COUNT(*) as total FROM marcas');
    console.log(`\n🏷️  MARCAS EN BD: ${marcas.rows[0].total}`);

    // Contar subcategorías
    const subcategorias = await p.query('SELECT COUNT(*) as total FROM subcategorias');
    console.log(`📂 SUBCATEGORÍAS EN BD: ${subcategorias.rows[0].total}`);

    // Distribución por categoría
    console.log('\n📊 DISTRIBUCIÓN POR CATEGORÍA:');
    const porCategoria = await p.query(`
    SELECT c.nombre, COUNT(p.id_producto) as total
    FROM categorias c
    LEFT JOIN productos p ON p.id_categoria = c.id_categoria
    GROUP BY c.nombre
    ORDER BY total DESC
  `);
    porCategoria.rows.forEach(row => {
        console.log(`   ${row.nombre.padEnd(30)} ${row.total} productos`);
    });

    // Distribución por marca (top 10)
    console.log('\n🏷️  TOP 10 MARCAS:');
    const porMarca = await p.query(`
    SELECT m.nombre, COUNT(p.id_producto) as total
    FROM marcas m
    LEFT JOIN productos p ON p.id_marca = m.id_marca
    GROUP BY m.nombre
    ORDER BY total DESC
    LIMIT 10
  `);
    porMarca.rows.forEach((row, i) => {
        console.log(`   ${(i + 1).toString().padStart(2)}. ${row.nombre.padEnd(25)} ${row.total} productos`);
    });

    // Imágenes en disco
    const imagesDir = path.join(__dirname, 'product_images_final');
    if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        const totalSize = files.reduce((sum, file) => {
            const stats = fs.statSync(path.join(imagesDir, file));
            return sum + stats.size;
        }, 0);

        console.log('\n💾 IMÁGENES EN DISCO:');
        console.log(`   Total archivos: ${files.length}`);
        console.log(`   Tamaño total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Promedio por imagen: ${(totalSize / files.length / 1024).toFixed(1)} KB`);
    }

    // Últimos productos
    console.log('\n📋 ÚLTIMOS 10 PRODUCTOS PROCESADOS:');
    const ultimos = await p.query(`
    SELECT p.sku, p.nombre, p.precio_actual, m.nombre as marca, c.nombre as categoria
    FROM productos p
    LEFT JOIN marcas m ON p.id_marca = m.id_marca
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    ORDER BY p.fecha_actualizacion DESC
    LIMIT 10
  `);
    ultimos.rows.forEach((p, i) => {
        const precio = p.precio_actual ? `$${parseFloat(p.precio_actual).toLocaleString()}` : 'N/A';
        console.log(`   ${(i + 1).toString().padStart(2)}. [${p.categoria}] ${p.marca} - ${p.sku}`);
        console.log(`       ${p.nombre.substring(0, 70)}... (${precio})`);
    });

    console.log('\n' + '='.repeat(100));
    console.log('✅ PROCESAMIENTO EXITOSO');
    console.log('='.repeat(100) + '\n');

    await p.end();
})();
