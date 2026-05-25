const { pool } = require('../config/db');
const AsesorModel = require('../models/asesor.model');
const { validationResult } = require('express-validator');

class AsesorController {
    // ── Public ──────────────────────────────────────────────
    static async getAll(req, res) {
        try {
            const asesores = await AsesorModel.findAll();
            res.json({ success: true, data: asesores });
        } catch (error) {
            console.error('Error obteniendo asesores:', error);
            res.status(500).json({ success: false, message: 'Error al obtener asesores' });
        }
    }

    static async getRandom(req, res) {
        try {
            const asesor = await AsesorModel.findRandom();
            if (!asesor) {
                return res.status(404).json({ success: false, message: 'No hay asesores disponibles' });
            }
            res.json({ success: true, data: asesor });
        } catch (error) {
            console.error('Error obteniendo asesor aleatorio:', error);
            res.status(500).json({ success: false, message: 'Error al obtener asesor' });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const asesor = await AsesorModel.findById(id);
            if (!asesor) {
                return res.status(404).json({ success: false, message: 'Asesor no encontrado' });
            }
            res.json({ success: true, data: asesor });
        } catch (error) {
            console.error('Error obteniendo asesor:', error);
            res.status(500).json({ success: false, message: 'Error al obtener asesor' });
        }
    }

    // ── Admin ────────────────────────────────────────────────
    // GET /api/v1/asesores/admin/all
    static async adminList(req, res) {
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
                where.push(`(nombre_completo ILIKE $${params.length} OR especialidad ILIKE $${params.length})`);
            }

            const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

            const sql = `
                SELECT id_asesor, nombre_completo, telefono, foto_url,
                       especialidad, horario_atencion, activo, orden,
                       calificacion_promedio, total_calificaciones, fecha_creacion
                FROM asesores
                ${whereSQL}
                ORDER BY orden ASC, nombre_completo ASC
                LIMIT $${params.length + 1} OFFSET $${params.length + 2}
            `;
            const countSql = `SELECT count(*) FROM asesores ${whereSQL}`;

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
            console.error('Error en adminList asesores:', error);
            res.status(500).json({ success: false, message: 'Error al listar asesores' });
        }
    }

    // GET /api/v1/asesores/admin/:id
    static async adminGetById(req, res) {
        try {
            const { rows } = await pool.query(
                'SELECT * FROM asesores WHERE id_asesor = $1',
                [req.params.id]
            );
            if (!rows[0]) {
                return res.status(404).json({ success: false, message: 'Asesor no encontrado' });
            }
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            console.error('Error en adminGetById asesores:', error);
            res.status(500).json({ success: false, message: 'Error al obtener asesor' });
        }
    }

    // POST /api/v1/asesores/admin
    static async adminCreate(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ success: false, errors: errors.array() });
            }

            const { nombre_completo, telefono, foto_url, especialidad, horario_atencion, activo, orden } = req.body;
            const { rows } = await pool.query(
                `INSERT INTO asesores (nombre_completo, telefono, foto_url, especialidad, horario_atencion, activo, orden)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [nombre_completo, telefono || null, foto_url || null,
                 especialidad || null, horario_atencion || null,
                 activo !== false, orden != null ? orden : 0]
            );
            res.status(201).json({ success: true, data: rows[0], message: 'Asesor creado exitosamente' });
        } catch (error) {
            console.error('Error en adminCreate asesores:', error);
            res.status(500).json({ success: false, message: 'Error al crear asesor' });
        }
    }

    // PUT /api/v1/asesores/admin/:id
    static async adminUpdate(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ success: false, errors: errors.array() });
            }

            const { nombre_completo, telefono, foto_url, especialidad, horario_atencion, activo, orden } = req.body;
            const { rows } = await pool.query(
                `UPDATE asesores SET
                     nombre_completo = COALESCE($1, nombre_completo),
                     telefono = $2,
                     foto_url = $3,
                     especialidad = $4,
                     horario_atencion = $5,
                     activo = COALESCE($6, activo),
                     orden = COALESCE($7, orden),
                     fecha_actualizacion = NOW()
                 WHERE id_asesor = $8
                 RETURNING *`,
                [nombre_completo || null, telefono || null, foto_url || null,
                 especialidad || null, horario_atencion || null,
                 activo != null ? activo : null,
                 orden != null ? orden : null, req.params.id]
            );
            if (!rows[0]) {
                return res.status(404).json({ success: false, message: 'Asesor no encontrado' });
            }
            res.json({ success: true, data: rows[0], message: 'Asesor actualizado exitosamente' });
        } catch (error) {
            console.error('Error en adminUpdate asesores:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar asesor' });
        }
    }

    // DELETE /api/v1/asesores/admin/:id
    static async adminDelete(req, res) {
        try {
            const { rowCount } = await pool.query(
                'DELETE FROM asesores WHERE id_asesor = $1',
                [req.params.id]
            );
            if (rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Asesor no encontrado' });
            }
            res.json({ success: true, message: 'Asesor eliminado exitosamente' });
        } catch (error) {
            console.error('Error en adminDelete asesores:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar asesor' });
        }
    }
}

module.exports = AsesorController;
