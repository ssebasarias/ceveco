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

/**
 * Productos sin imagen principal apuntando a /images/productos/.
 * Conservado para compatibilidad con el scraper legacy fetch-product-images.js.
 */
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

/**
 * Productos candidatos para el scraper profesional fetch-product-data.js.
 * Excluye productos marcados con manual_override=TRUE (editados por admin).
 */
async function getProductsNeedingData() {
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
          AND COALESCE(p.manual_override, FALSE) = FALSE
        ORDER BY p.id_producto
    `);
    return rows;
}

/**
 * Marca la imagen como principal en producto_imagenes. Si ya existe la URL
 * para este producto, la actualiza; si no, la inserta. El resto de imágenes
 * del producto quedan con es_principal=false.
 */
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
            // urlImagen not needed — we already matched on it in the SELECT.
            // Passing only typed params Postgres can bind.
            await client.query(
                `UPDATE producto_imagenes
                    SET es_principal = true,
                        alt_text     = COALESCE($2::text, alt_text),
                        orden        = 0
                  WHERE id_imagen = $1`,
                [existing.rows[0].id_imagen, altText]
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

/**
 * Inserta o actualiza una imagen secundaria de galería. Idempotente vía
 * UNIQUE(id_producto, url_imagen) introducido en la migración 20260525.
 */
async function upsertExtraImage(idProducto, urlImagen, altText, orden) {
    const sql = `
        INSERT INTO producto_imagenes (id_producto, url_imagen, alt_text, es_principal, orden)
        VALUES ($1, $2, $3, FALSE, $4)
        ON CONFLICT (id_producto, url_imagen)
        DO UPDATE SET alt_text = EXCLUDED.alt_text,
                      orden    = EXCLUDED.orden
    `;
    await pool.query(sql, [idProducto, urlImagen, altText, orden]);
}

/**
 * Actualiza datos extendidos del producto siempre que manual_override=false.
 *
 * `descripcion_larga`, `specs` y `componentes` se actualizan solo si vienen
 * con un valor no-null (COALESCE preserva lo existente). `fuente_scrape` y
 * `ultima_actualizacion_scrape` se reescriben en cada corrida.
 */
async function updateProductData(idProducto, { descripcion_larga, specs, componentes, fuente }) {
    // Explicit ::text on $2 and $5 so Postgres can determine parameter types
    // when the value is NULL (otherwise: "could not determine type of parameter").
    const sql = `
        UPDATE productos
           SET descripcion_larga          = COALESCE($2::text, descripcion_larga),
               specs                      = COALESCE($3::jsonb, specs),
               componentes                = COALESCE($4::jsonb, componentes),
               fuente_scrape              = $5::text,
               ultima_actualizacion_scrape = NOW()
         WHERE id_producto = $1
           AND COALESCE(manual_override, FALSE) = FALSE
    `;
    await pool.query(sql, [
        idProducto,
        descripcion_larga || null,
        specs ? JSON.stringify(specs) : null,
        componentes ? JSON.stringify(componentes) : null,
        fuente || null
    ]);
}

/**
 * Helper para que el coordinador pueda marcar manualmente un producto como
 * no-pisable por el scraper (cuando el admin sube imagen/descripción a mano).
 */
async function markManualOverride(idProducto, value = true) {
    await pool.query(
        `UPDATE productos SET manual_override = $2 WHERE id_producto = $1`,
        [idProducto, value]
    );
}

async function close() {
    await pool.end();
}

module.exports = {
    pool,
    getProductsNeedingImage,
    getProductsNeedingData,
    upsertMainImage,
    upsertExtraImage,
    updateProductData,
    markManualOverride,
    close
};
