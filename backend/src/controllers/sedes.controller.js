const { pool } = require('../config/db');
const SedeModel = require('../models/sede.model');
const { validationResult } = require('express-validator');

class SedeController {
    // ── Public ──────────────────────────────────────────────
    async getAll(req, res) {
        try {
            const sedes = await SedeModel.findAll();
            res.json({ success: true, data: sedes });
        } catch (error) {
            console.error('Error getting sedes:', error);
            res.status(500).json({ success: false, message: 'Error al obtener las sedes' });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const sede = await SedeModel.findById(id);
            if (!sede) {
                return res.status(404).json({ success: false, message: 'Sede no encontrada' });
            }
            res.json({ success: true, data: sede });
        } catch (error) {
            console.error('Error getting sede:', error);
            res.status(500).json({ success: false, message: 'Error al obtener la sede' });
        }
    }

    // ── Admin ────────────────────────────────────────────────
    // GET /api/v1/sedes/admin/all
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
                where.push(`(nombre ILIKE $${params.length} OR ciudad ILIKE $${params.length} OR direccion ILIKE $${params.length})`);
            }

            const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

            const sql = `
                SELECT id_sede, nombre, codigo, ciudad, departamento, direccion, telefono, celular,
                       email, whatsapp, latitud, longitud, horario_atencion, es_principal, activo, fecha_creacion
                FROM sedes
                ${whereSQL}
                ORDER BY es_principal DESC, nombre ASC
                LIMIT $${params.length + 1} OFFSET $${params.length + 2}
            `;
            const countSql = `SELECT count(*) FROM sedes ${whereSQL}`;

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
            console.error('Error en adminList sedes:', error);
            res.status(500).json({ success: false, message: 'Error al listar sedes' });
        }
    }

    // GET /api/v1/sedes/admin/:id
    async adminGetById(req, res) {
        try {
            const { rows } = await pool.query(
                'SELECT * FROM sedes WHERE id_sede = $1',
                [req.params.id]
            );
            if (!rows[0]) {
                return res.status(404).json({ success: false, message: 'Sede no encontrada' });
            }
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            console.error('Error en adminGetById sedes:', error);
            res.status(500).json({ success: false, message: 'Error al obtener sede' });
        }
    }

    // POST /api/v1/sedes/admin
    async adminCreate(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ success: false, errors: errors.array() });
            }

            const {
                nombre, codigo, ciudad, departamento, direccion,
                telefono, celular, email, whatsapp,
                latitud, longitud, horario_atencion, servicios,
                imagen_url, es_principal, activo, link_google_maps
            } = req.body;

            const { rows } = await pool.query(
                `INSERT INTO sedes
                 (nombre, codigo, ciudad, departamento, direccion, telefono, celular,
                  email, whatsapp, latitud, longitud, horario_atencion, servicios,
                  imagen_url, es_principal, activo, link_google_maps)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
                 RETURNING *`,
                [nombre, codigo || null, ciudad, departamento || null, direccion,
                 telefono || null, celular || null, email || null, whatsapp || null,
                 latitud || null, longitud || null, horario_atencion || null, servicios || null,
                 imagen_url || null, es_principal || false, activo !== false,
                 link_google_maps || null]
            );
            res.status(201).json({ success: true, data: rows[0], message: 'Sede creada exitosamente' });
        } catch (error) {
            console.error('Error en adminCreate sedes:', error);
            res.status(500).json({ success: false, message: 'Error al crear sede' });
        }
    }

    // PUT /api/v1/sedes/admin/:id
    async adminUpdate(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ success: false, errors: errors.array() });
            }

            const {
                nombre, codigo, ciudad, departamento, direccion,
                telefono, celular, email, whatsapp,
                latitud, longitud, horario_atencion, servicios,
                imagen_url, es_principal, activo, link_google_maps
            } = req.body;

            const { rows } = await pool.query(
                `UPDATE sedes SET
                     nombre = COALESCE($1, nombre),
                     codigo = $2,
                     ciudad = COALESCE($3, ciudad),
                     departamento = $4,
                     direccion = COALESCE($5, direccion),
                     telefono = $6,
                     celular = $7,
                     email = $8,
                     whatsapp = $9,
                     latitud = $10,
                     longitud = $11,
                     horario_atencion = $12,
                     servicios = $13,
                     imagen_url = $14,
                     es_principal = COALESCE($15, es_principal),
                     activo = COALESCE($16, activo),
                     link_google_maps = $17
                 WHERE id_sede = $18
                 RETURNING *`,
                [nombre || null, codigo || null, ciudad || null, departamento || null,
                 direccion || null, telefono || null, celular || null, email || null,
                 whatsapp || null, latitud || null, longitud || null,
                 horario_atencion || null, servicios || null, imagen_url || null,
                 es_principal != null ? es_principal : null,
                 activo != null ? activo : null,
                 link_google_maps || null, req.params.id]
            );
            if (!rows[0]) {
                return res.status(404).json({ success: false, message: 'Sede no encontrada' });
            }
            res.json({ success: true, data: rows[0], message: 'Sede actualizada exitosamente' });
        } catch (error) {
            console.error('Error en adminUpdate sedes:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar sede' });
        }
    }

    // DELETE /api/v1/sedes/admin/:id
    async adminDelete(req, res) {
        try {
            const { rowCount } = await pool.query(
                'DELETE FROM sedes WHERE id_sede = $1',
                [req.params.id]
            );
            if (rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Sede no encontrada' });
            }
            res.json({ success: true, message: 'Sede eliminada exitosamente' });
        } catch (error) {
            console.error('Error en adminDelete sedes:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar sede' });
        }
    }
}

module.exports = new SedeController();
