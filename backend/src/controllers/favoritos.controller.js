const { pool } = require('../config/db');

const FavoritosController = {
    /**
     * Alternar estado de favorito (Agregar/Eliminar)
     */
    toggle: async (req, res) => {
        const userId = req.user.id; // Del middleware de auth
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'ID de producto requerido' });
        }

        try {
            // Verificar que el producto exista
            const productCheck = await pool.query('SELECT id_producto FROM productos WHERE id_producto = $1', [productId]);
            if (productCheck.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            }

            // Verificar si ya existe en favoritos
            const checkQuery = 'SELECT id_favorito FROM favoritos WHERE id_usuario = $1 AND id_producto = $2';
            const checkResult = await pool.query(checkQuery, [userId, productId]);

            let action = '';

            if (checkResult.rows.length > 0) {
                // Existe -> Eliminar
                await pool.query('DELETE FROM favoritos WHERE id_usuario = $1 AND id_producto = $2', [userId, productId]);
                action = 'removed';
            } else {
                // No existe -> Agregar
                await pool.query('INSERT INTO favoritos (id_usuario, id_producto) VALUES ($1, $2)', [userId, productId]);
                action = 'added';
            }

            res.json({
                success: true,
                message: action === 'added' ? 'Agregado a favoritos' : 'Eliminado de favoritos',
                action: action, // 'added' | 'removed'
                productId
            });

        } catch (error) {
            console.error('Error al alternar favorito:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    },

    /**
     * Obtener lista de favoritos del usuario
     */
    getList: async (req, res) => {
        const userId = req.user.id;

        try {
            // Query para traer detalles del producto usando la vista completa si es posible, o join manual
            // Usando vista_productos_completa si existe, sino join basico
            const query = `
                SELECT 
                    f.id_favorito, 
                    f.fecha_agregado,
                    p.id_producto,
                    p.nombre,
                    p.precio_actual,
                    p.precio_anterior,
                    p.imagen_principal AS imagen,
                    p.categoria,
                    p.badge
                FROM favoritos f
                JOIN vista_productos_completa p ON f.id_producto = p.id_producto
                WHERE f.id_usuario = $1
                ORDER BY f.fecha_agregado DESC
            `;

            // Fallback si la vista no existe o para asegurar compatibilidad simple
            // Revisando bd.sql, vista_productos_completa sí se crea.
            // Pero `imagen_principal` no es columna directa en productos, la vista lo maneja?
            // bd.sql línea 789: vista_productos_completa. La vista se cortó en el output anterior.
            // Asumiremos que la vista tiene lo necesario o haremos JOIN manual para ir a la segura.

            /* JOIN Manual para seguridad, ya que no vi la definición completa de la vista */
            const safeQuery = `
                SELECT 
                    f.id_favorito,
                    f.fecha_agregado,
                    p.id_producto,
                    p.nombre,
                    p.precio_actual,
                    p.precio_anterior,
                    pk.url_imagen as imagen,
                    c.nombre as categoria,
                    p.badge
                FROM favoritos f
                JOIN productos p ON f.id_producto = p.id_producto
                LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
                LEFT JOIN producto_imagenes pk ON p.id_producto = pk.id_producto AND pk.es_principal = TRUE
                WHERE f.id_usuario = $1
                ORDER BY f.fecha_agregado DESC
            `;

            const result = await pool.query(safeQuery, [userId]);

            // Parsear datos si es necesario (precios a numero, etc)
            const favoritos = result.rows.map(row => ({
                ...row,
                precio_actual: parseFloat(row.precio_actual),
                precio_anterior: row.precio_anterior ? parseFloat(row.precio_anterior) : null
            }));

            res.json({
                success: true,
                count: favoritos.length,
                data: favoritos
            });

        } catch (error) {
            console.error('Error al obtener favoritos:', error);
            res.status(500).json({ success: false, message: 'Error al obtener favoritos' });
        }
    },

    /**
     * Verificar si un producto está en favoritos (IDS array o single)
     */
    checkIds: async (req, res) => {
        const userId = req.user.id;
        try {
            const query = 'SELECT id_producto FROM favoritos WHERE id_usuario = $1';
            const result = await pool.query(query, [userId]);

            const ids = result.rows.map(r => r.id_producto);

            res.json({
                success: true,
                ids: ids
            });
        } catch (error) {
            console.error('Error al verificar favoritos:', error);
            res.status(500).json({ success: false, message: 'Error interno' });
        }
    }
};

module.exports = FavoritosController;
