const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

const MarcasController = {
    // ── Public ──────────────────────────────────────────────
    async getActivas(req, res) {
        try {
            const { rows } = await pool.query(
                `SELECT id_marca, nombre, logo_url, descripcion, sitio_web
                 FROM marcas
                 WHERE activo = TRUE
                 ORDER BY nombre ASC`
            );
            res.json({ success: true, count: rows.length, data: rows });
        } catch (error) {
            console.error('Error al obtener marcas:', error);
            res.status(500).json({ success: false, message: 'Error al obtener marcas' });
        }
    },

    // ── Admin ────────────────────────────────────────────────
    // GET /api/v1/admin/marcas
    async adminList(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ success: false, errors: errors.array() });
            }

            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 25, 100);
            const offset = (page - 1) * limit;
            const q = req.query.q || '';

            const where = [];
            const params = [];

            if (q) {
                params.push(`%${q}%`);
                where.push(`(nombre ILIKE $${params.length} OR slug ILIKE $${params.length})`);
            }

            const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

            const sql = `
                SELECT id_marca, nombre, slug, logo_url, descripcion, sitio_web, activo, fecha_creacion
                FROM marcas
                ${whereSQL}
                ORDER BY nombre ASC
                LIMIT $${params.length + 1} OFFSET $${params.length + 2}
            `;
            const countSql = `SELECT count(*) FROM marcas ${whereSQL}`;

            const [{ rows }, { rows: [{ count }] }] = await Promise.all([
                pool.query(sql, [...params, limit, offset]),
                pool.query(countSql, params)
            ]);

            const total = parseInt(count, 10);
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: rows,
                pagination: {
                    page, limit, total, totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            });
        } catch (error) {
            console.error('Error en adminList marcas:', error);
            res.status(500).json({ success: false, message: 'Error al listar marcas' });
        }
    },

    // GET /api/v1/admin/marcas/:id
    async adminGetById(req, res) {
        try {
            const { rows } = await pool.query(
                'SELECT * FROM marcas WHERE id_marca = $1',
                [req.params.id]
            );
            if (!rows[0]) {
                return res.status(404).json({ success: false, message: 'Marca no encontrada' });
            }
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            console.error('Error en adminGetById marcas:', error);
            res.status(500).json({ success: false, message: 'Error al obtener marca' });
        }
    },

    // POST /api/v1/admin/marcas
    async adminCreate(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ success: false, errors: errors.array() });
            }

            const { nombre, slug, logo_url, descripcion, sitio_web, activo } = req.body;
            const { rows } = await pool.query(
                `INSERT INTO marcas (nombre, slug, logo_url, descripcion, sitio_web, activo)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [nombre, slug, logo_url || null, descripcion || null,
                 sitio_web || null, activo !== false]
            );
            res.status(201).json({ success: true, data: rows[0], message: 'Marca creada exitosamente' });
        } catch (error) {
            console.error('Error en adminCreate marcas:', error);
            res.status(500).json({ success: false, message: 'Error al crear marca' });
        }
    },

    // PUT /api/v1/admin/marcas/:id
    async adminUpdate(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ success: false, errors: errors.array() });
            }

            const { nombre, slug, logo_url, descripcion, sitio_web, activo } = req.body;
            const { rows } = await pool.query(
                `UPDATE marcas
                 SET nombre = COALESCE($1, nombre),
                     slug = COALESCE($2, slug),
                     logo_url = $3,
                     descripcion = $4,
                     sitio_web = $5,
                     activo = COALESCE($6, activo),
                     fecha_actualizacion = NOW()
                 WHERE id_marca = $7
                 RETURNING *`,
                [nombre || null, slug || null, logo_url || null,
                 descripcion || null, sitio_web || null,
                 activo != null ? activo : null, req.params.id]
            );
            if (!rows[0]) {
                return res.status(404).json({ success: false, message: 'Marca no encontrada' });
            }
            res.json({ success: true, data: rows[0], message: 'Marca actualizada exitosamente' });
        } catch (error) {
            console.error('Error en adminUpdate marcas:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar marca' });
        }
    },

    // DELETE /api/v1/admin/marcas/:id
    async adminDelete(req, res) {
        try {
            // FK guard
            const { rows: [{ count }] } = await pool.query(
                'SELECT count(*) FROM productos WHERE id_marca = $1',
                [req.params.id]
            );
            const total = parseInt(count, 10);
            if (total > 0) {
                return res.status(409).json({
                    success: false,
                    message: `No se puede eliminar marca con productos asociados (${total} productos). Reasignelos primero.`
                });
            }

            const { rowCount } = await pool.query(
                'DELETE FROM marcas WHERE id_marca = $1',
                [req.params.id]
            );
            if (rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Marca no encontrada' });
            }
            res.json({ success: true, message: 'Marca eliminada exitosamente' });
        } catch (error) {
            console.error('Error en adminDelete marcas:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar marca' });
        }
    }
};

module.exports = MarcasController;
