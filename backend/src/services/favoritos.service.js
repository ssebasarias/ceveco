/**
 * Favoritos Service
 * Lógica de negocio para gestión de favoritos
 */

const { pool } = require('../config/db');

class FavoritosService {
    /**
     * Alternar favorito (agregar/eliminar)
     */
    static async toggle(userId, productId) {
        // Verificar que el producto exista
        const productCheck = await pool.query(
            'SELECT id_producto FROM productos WHERE id_producto = $1',
            [productId]
        );

        if (productCheck.rows.length === 0) {
            throw new Error('Producto no encontrado');
        }

        // Verificar si ya existe en favoritos
        const checkQuery = 'SELECT id_favorito FROM favoritos WHERE id_usuario = $1 AND id_producto = $2';
        const checkResult = await pool.query(checkQuery, [userId, productId]);

        let action = '';

        if (checkResult.rows.length > 0) {
            // Existe -> Eliminar
            await pool.query(
                'DELETE FROM favoritos WHERE id_usuario = $1 AND id_producto = $2',
                [userId, productId]
            );
            action = 'removed';
        } else {
            // No existe -> Agregar
            await pool.query(
                'INSERT INTO favoritos (id_usuario, id_producto) VALUES ($1, $2)',
                [userId, productId]
            );
            action = 'added';
        }

        return { action, productId };
    }

    /**
     * Obtener lista de favoritos del usuario
     */
    static async getList(userId) {
        const query = `
            SELECT 
                f.id_favorito,
                f.fecha_agregado,
                p.id_producto,
                p.nombre,
                p.precio_actual,
                p.precio_anterior,
                pi.url_imagen as imagen,
                c.nombre as categoria,
                p.badge
            FROM favoritos f
            JOIN productos p ON f.id_producto = p.id_producto
            LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
            LEFT JOIN producto_imagenes pi ON p.id_producto = pi.id_producto AND pi.es_principal = TRUE
            WHERE f.id_usuario = $1 AND p.activo = TRUE
            ORDER BY f.fecha_agregado DESC
        `;

        const result = await pool.query(query, [userId]);

        // Parsear precios
        const favoritos = result.rows.map(row => ({
            ...row,
            precio_actual: parseFloat(row.precio_actual),
            precio_anterior: row.precio_anterior ? parseFloat(row.precio_anterior) : null
        }));

        return favoritos;
    }

    /**
     * Obtener solo los IDs de productos favoritos
     */
    static async getIds(userId) {
        const query = 'SELECT id_producto FROM favoritos WHERE id_usuario = $1';
        const result = await pool.query(query, [userId]);
        return result.rows.map(r => r.id_producto);
    }

    /**
     * Verificar si un producto está en favoritos
     */
    static async isFavorite(userId, productId) {
        const query = 'SELECT id_favorito FROM favoritos WHERE id_usuario = $1 AND id_producto = $2';
        const result = await pool.query(query, [userId, productId]);
        return result.rows.length > 0;
    }

    /**
     * Eliminar todos los favoritos de un usuario
     */
    static async clearAll(userId) {
        const result = await pool.query(
            'DELETE FROM favoritos WHERE id_usuario = $1 RETURNING id_favorito',
            [userId]
        );
        return { count: result.rowCount };
    }
}

module.exports = FavoritosService;
