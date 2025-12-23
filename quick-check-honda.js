/**
 * 🔍 DIAGNÓSTICO RÁPIDO - IMÁGENES HONDA
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'ceveco',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

async function diagnosticar() {
    try {
        // Productos Honda
        const productos = await pool.query(`
            SELECT 
                p.id_producto,
                p.sku,
                p.nombre,
                COUNT(pi.id_imagen) as num_imagenes
            FROM productos p
            LEFT JOIN producto_imagenes pi ON p.id_producto = pi.id_producto
            WHERE p.nombre ILIKE '%Honda%'
            GROUP BY p.id_producto, p.sku, p.nombre
            ORDER BY p.nombre
        `);

        // Imágenes registradas
        const imagenes = await pool.query(`
            SELECT COUNT(*) as total
            FROM producto_imagenes pi
            INNER JOIN productos p ON pi.id_producto = p.id_producto
            WHERE p.nombre ILIKE '%Honda%'
        `);

        const reporte = {
            total_productos: productos.rows.length,
            con_imagenes: productos.rows.filter(p => p.num_imagenes > 0).length,
            sin_imagenes: productos.rows.filter(p => p.num_imagenes === 0).length,
            total_imagenes_bd: parseInt(imagenes.rows[0].total),
            productos: productos.rows.map(p => ({
                nombre: p.nombre,
                sku: p.sku,
                imagenes: parseInt(p.num_imagenes)
            }))
        };

        console.log(JSON.stringify(reporte, null, 2));

        await pool.end();
    } catch (error) {
        console.error('ERROR:', error.message);
        await pool.end();
        process.exit(1);
    }
}

diagnosticar();
