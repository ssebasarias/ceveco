const { validationResult } = require('express-validator');
const CategoriasService = require('../services/categorias.service');

const CategoriasController = {
    // GET /api/v1/categorias  (public – only active)
    async getActivas(req, res) {
        try {
            const { pool } = require('../config/db');
            const { rows } = await pool.query(
                `SELECT id_categoria, nombre, slug, descripcion, imagen_url, icono, orden
                 FROM categorias
                 WHERE activo = TRUE
                 ORDER BY orden ASC, nombre ASC`
            );
            res.json({ success: true, count: rows.length, data: rows });
        } catch (error) {
            console.error('Error en getActivas categorias:', error);
            res.status(500).json({ success: false, message: 'Error al obtener categorías' });
        }
    },

    // GET /api/v1/admin/categorias
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

            const { rows, total } = await CategoriasService.getAllForAdmin({ page, limit, offset, q });
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
            console.error('Error en adminList categorias:', error);
            res.status(500).json({ success: false, message: 'Error al listar categorías' });
        }
    },

    // GET /api/v1/admin/categorias/:id
    async adminGetById(req, res) {
        try {
            const categoria = await CategoriasService.getById(req.params.id);
            if (!categoria) {
                return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
            }
            res.json({ success: true, data: categoria });
        } catch (error) {
            console.error('Error en adminGetById categorias:', error);
            res.status(500).json({ success: false, message: 'Error al obtener categoría' });
        }
    },

    // POST /api/v1/admin/categorias
    async adminCreate(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ success: false, errors: errors.array() });
            }

            const categoria = await CategoriasService.create(req.body);
            res.status(201).json({ success: true, data: categoria, message: 'Categoría creada exitosamente' });
        } catch (error) {
            console.error('Error en adminCreate categorias:', error);
            res.status(500).json({ success: false, message: 'Error al crear categoría' });
        }
    },

    // PUT /api/v1/admin/categorias/:id
    async adminUpdate(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ success: false, errors: errors.array() });
            }

            const categoria = await CategoriasService.update(req.params.id, req.body);
            if (!categoria) {
                return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
            }
            res.json({ success: true, data: categoria, message: 'Categoría actualizada exitosamente' });
        } catch (error) {
            console.error('Error en adminUpdate categorias:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar categoría' });
        }
    },

    // DELETE /api/v1/admin/categorias/:id
    async adminDelete(req, res) {
        try {
            await CategoriasService.delete(req.params.id);
            res.json({ success: true, message: 'Categoría eliminada exitosamente' });
        } catch (error) {
            if (error.status === 409) {
                return res.status(409).json({ success: false, message: error.message });
            }
            console.error('Error en adminDelete categorias:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar categoría' });
        }
    }
};

module.exports = CategoriasController;
