const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

async function autocomplete(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, errors: errors.array() });
    }
    const q = String(req.query.q || '').trim();
    if (q.length < 2) {
        return res.json({ success: true, data: [] });
    }
    try {
        // Use pg_trgm similarity for fuzzy matching. Also rank exact prefix higher.
        const sql = `
            SELECT
                p.id_producto,
                p.sku,
                p.nombre,
                p.precio_actual,
                m.nombre AS marca,
                c.nombre AS categoria,
                (SELECT url_imagen FROM producto_imagenes
                 WHERE id_producto = p.id_producto AND es_principal LIMIT 1) AS imagen,
                similarity(p.nombre, $1) AS score
            FROM productos p
            JOIN marcas m ON m.id_marca = p.id_marca
            JOIN categorias c ON c.id_categoria = p.id_categoria
            WHERE p.activo = true
              AND (p.nombre % $1 OR p.sku ILIKE $2 OR m.nombre ILIKE $2)
            ORDER BY
                CASE WHEN p.nombre ILIKE $3 THEN 0 ELSE 1 END,
                score DESC,
                p.vistas DESC NULLS LAST
            LIMIT 8
        `;
        const { rows } = await pool.query(sql, [q, `%${q}%`, `${q}%`]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error en autocomplete:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar productos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = { autocomplete };
