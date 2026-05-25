const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../backend/.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'ceveco_db',
});

async function getProductsNeedingImage() {
    const { rows } = await pool.query(`
        SELECT p.id_producto AS id,
               p.sku,
               p.nombre,
               m.nombre AS marca,
               c.nombre AS categoria,
               sc.nombre AS subcategoria
        FROM productos p
        JOIN marcas m ON m.id_marca = p.id_marca
        JOIN categorias c ON c.id_categoria = p.id_categoria
        LEFT JOIN subcategorias sc ON sc.id_subcategoria = p.id_subcategoria
        WHERE p.activo = true
          AND NOT EXISTS (
              SELECT 1
              FROM producto_imagenes pi
              WHERE pi.id_producto = p.id_producto
                AND pi.es_principal = true
                AND pi.url_imagen LIKE '/images/productos/%'
          )
        ORDER BY p.id_producto
    `);
    return rows;
}

async function upsertMainImage(idProducto, urlImagen, altText) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE producto_imagenes SET es_principal = false WHERE id_producto = $1`,
            [idProducto]
        );
        const existing = await client.query(
            `SELECT id_imagen FROM producto_imagenes WHERE id_producto = $1 AND url_imagen = $2`,
            [idProducto, urlImagen]
        );
        if (existing.rows.length === 0) {
            await client.query(
                `INSERT INTO producto_imagenes (id_producto, url_imagen, alt_text, orden, es_principal)
                 VALUES ($1, $2, $3, 0, true)`,
                [idProducto, urlImagen, altText]
            );
        } else {
            await client.query(
                `UPDATE producto_imagenes SET es_principal = true WHERE id_imagen = $1`,
                [existing.rows[0].id_imagen]
            );
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function close() {
    await pool.end();
}

module.exports = { getProductsNeedingImage, upsertMainImage, close, pool };
