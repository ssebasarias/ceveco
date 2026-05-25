const { pool } = require('../config/db');

const CategoriasService = {
    async getAllForAdmin({ page, limit, offset, q }) {
        const where = [];
        const params = [];

        if (q) {
            params.push(`%${q}%`);
            where.push(`(nombre ILIKE $${params.length} OR slug ILIKE $${params.length})`);
        }

        const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const sql = `
            SELECT id_categoria, nombre, slug, descripcion, imagen_url, icono, orden, activo, fecha_creacion
            FROM categorias
            ${whereSQL}
            ORDER BY orden ASC, id_categoria ASC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const countSql = `SELECT count(*) FROM categorias ${whereSQL}`;

        const [{ rows }, { rows: [{ count }] }] = await Promise.all([
            pool.query(sql, [...params, limit, offset]),
            pool.query(countSql, params)
        ]);

        return { rows, total: parseInt(count, 10) };
    },

    async getById(id) {
        const { rows } = await pool.query(
            'SELECT * FROM categorias WHERE id_categoria = $1',
            [id]
        );
        return rows[0] || null;
    },

    async create({ nombre, slug, descripcion, imagen_url, icono, orden, activo }) {
        const { rows } = await pool.query(
            `INSERT INTO categorias (nombre, slug, descripcion, imagen_url, icono, orden, activo)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [nombre, slug, descripcion || null, imagen_url || null, icono || null,
             orden != null ? orden : 0, activo !== false]
        );
        return rows[0];
    },

    async update(id, { nombre, slug, descripcion, imagen_url, icono, orden, activo }) {
        const { rows } = await pool.query(
            `UPDATE categorias
             SET nombre = COALESCE($1, nombre),
                 slug = COALESCE($2, slug),
                 descripcion = $3,
                 imagen_url = $4,
                 icono = $5,
                 orden = COALESCE($6, orden),
                 activo = COALESCE($7, activo),
                 fecha_actualizacion = NOW()
             WHERE id_categoria = $8
             RETURNING *`,
            [nombre || null, slug || null, descripcion || null, imagen_url || null,
             icono || null, orden != null ? orden : null, activo != null ? activo : null, id]
        );
        return rows[0] || null;
    },

    async delete(id) {
        // FK guard: check products
        const { rows: [{ count }] } = await pool.query(
            'SELECT count(*) FROM productos WHERE id_categoria = $1',
            [id]
        );
        const total = parseInt(count, 10);
        if (total > 0) {
            const err = new Error(
                `No se puede eliminar categoría con productos asociados (${total} productos). Reasignelos primero.`
            );
            err.status = 409;
            throw err;
        }
        await pool.query('DELETE FROM categorias WHERE id_categoria = $1', [id]);
    }
};

module.exports = CategoriasService;
