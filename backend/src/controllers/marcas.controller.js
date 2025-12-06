const { pool } = require('../config/db');

const MarcasController = {
    /**
     * Obtener todas las marcas activas
     */
    async getActivas(req, res) {
        try {
            const query = `
                SELECT 
                    id_marca,
                    nombre,
                    logo_url,
                    descripcion,
                    sitio_web
                FROM marcas
                WHERE activo = TRUE
                ORDER BY nombre ASC
            `;

            const result = await pool.query(query);

            res.json({
                success: true,
                count: result.rows.length,
                data: result.rows
            });

        } catch (error) {
            console.error('Error al obtener marcas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener marcas'
            });
        }
    }
};

module.exports = MarcasController;
