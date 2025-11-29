const { query } = require('../config/db');

class ProductoModel {
    /**
     * Obtener todos los productos con filtros opcionales
     * @param {Object} filters - Filtros de búsqueda
     * @returns {Promise<Array>} Lista de productos
     */
    static async findAll(filters = {}) {
        const {
            categoria,
            marca,
            precioMin,
            precioMax,
            destacado,
            busqueda,
            limit = 12,
            offset = 0,
            orderBy = 'fecha_creacion',
            orderDir = 'DESC'
        } = filters;

        let queryText = `
      SELECT 
        p.id_producto,
        p.sku,
        p.nombre,
        p.descripcion_corta,
        p.precio_actual,
        p.precio_anterior,
        p.stock,
        p.badge,
        p.destacado,
        p.calificacion_promedio,
        p.total_resenas,
        p.modelo,
        p.color,
        c.nombre AS categoria,
        c.slug AS categoria_slug,
        sc.nombre AS subcategoria,
        m.nombre AS marca,
        m.logo_url AS marca_logo,
        (
          SELECT url_imagen 
          FROM producto_imagenes 
          WHERE id_producto = p.id_producto AND es_principal = TRUE 
          LIMIT 1
        ) AS imagen_principal,
        (
          SELECT json_agg(url_imagen ORDER BY orden)
          FROM producto_imagenes
          WHERE id_producto = p.id_producto
        ) AS imagenes
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN subcategorias sc ON p.id_subcategoria = sc.id_subcategoria
      INNER JOIN marcas m ON p.id_marca = m.id_marca
      WHERE p.activo = TRUE
    `;

        const params = [];
        let paramIndex = 1;

        // Filtro por categoría
        if (categoria) {
            queryText += ` AND c.slug = $${paramIndex}`;
            params.push(categoria);
            paramIndex++;
        }

        // Filtro por marca
        if (marca) {
            queryText += ` AND m.id_marca = $${paramIndex}`;
            params.push(marca);
            paramIndex++;
        }

        // Filtro por precio mínimo
        if (precioMin) {
            queryText += ` AND p.precio_actual >= $${paramIndex}`;
            params.push(precioMin);
            paramIndex++;
        }

        // Filtro por precio máximo
        if (precioMax) {
            queryText += ` AND p.precio_actual <= $${paramIndex}`;
            params.push(precioMax);
            paramIndex++;
        }

        // Filtro por destacado
        if (destacado !== undefined) {
            queryText += ` AND p.destacado = $${paramIndex}`;
            params.push(destacado);
            paramIndex++;
        }

        // Búsqueda por texto
        if (busqueda) {
            queryText += ` AND (
        to_tsvector('spanish', p.nombre || ' ' || COALESCE(p.descripcion_corta, '')) 
        @@ plainto_tsquery('spanish', $${paramIndex})
        OR p.nombre ILIKE $${paramIndex + 1}
        OR p.sku ILIKE $${paramIndex + 1}
      )`;
            params.push(busqueda, `%${busqueda}%`);
            paramIndex += 2;
        }

        // Ordenamiento
        const validOrderBy = ['precio_actual', 'nombre', 'fecha_creacion', 'calificacion_promedio', 'ventas_totales'];
        const validOrderDir = ['ASC', 'DESC'];
        const safeOrderBy = validOrderBy.includes(orderBy) ? orderBy : 'fecha_creacion';
        const safeOrderDir = validOrderDir.includes(orderDir.toUpperCase()) ? orderDir.toUpperCase() : 'DESC';

        queryText += ` ORDER BY p.${safeOrderBy} ${safeOrderDir}`;

        // Paginación
        queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await query(queryText, params);
        return result.rows;
    }

    /**
     * Obtener un producto por ID
     * @param {number} id - ID del producto
     * @returns {Promise<Object|null>} Producto encontrado o null
     */
    static async findById(id) {
        const queryText = `
      SELECT 
        p.*,
        c.nombre AS categoria,
        c.slug AS categoria_slug,
        sc.nombre AS subcategoria,
        sc.slug AS subcategoria_slug,
        m.nombre AS marca,
        m.logo_url AS marca_logo,
        m.sitio_web AS marca_sitio_web,
        (
          SELECT json_agg(
            json_build_object(
              'id', id_imagen,
              'url', url_imagen,
              'alt', alt_text,
              'orden', orden,
              'es_principal', es_principal
            ) ORDER BY orden
          )
          FROM producto_imagenes
          WHERE id_producto = p.id_producto
        ) AS imagenes,
        (
          SELECT json_agg(
            json_build_object(
              'nombre', nombre_atributo,
              'valor', valor_atributo,
              'grupo', grupo
            ) ORDER BY grupo, orden
          )
          FROM producto_especificaciones
          WHERE id_producto = p.id_producto
        ) AS especificaciones
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN subcategorias sc ON p.id_subcategoria = sc.id_subcategoria
      INNER JOIN marcas m ON p.id_marca = m.id_marca
      WHERE p.id_producto = $1 AND p.activo = TRUE
    `;

        const result = await query(queryText, [id]);
        return result.rows[0] || null;
    }

    /**
     * Obtener un producto por SKU
     * @param {string} sku - SKU del producto
     * @returns {Promise<Object|null>} Producto encontrado o null
     */
    static async findBySku(sku) {
        const queryText = `
      SELECT * FROM productos
      WHERE sku = $1 AND activo = TRUE
    `;

        const result = await query(queryText, [sku]);
        return result.rows[0] || null;
    }

    /**
     * Obtener productos destacados
     * @param {number} limit - Número de productos a retornar
     * @returns {Promise<Array>} Lista de productos destacados
     */
    static async findFeatured(limit = 8) {
        return this.findAll({ destacado: true, limit, orderBy: 'ventas_totales', orderDir: 'DESC' });
    }

    /**
     * Obtener productos relacionados
     * @param {number} productoId - ID del producto
     * @param {number} limit - Número de productos a retornar
     * @returns {Promise<Array>} Lista de productos relacionados
     */
    static async findRelated(productoId, limit = 4) {
        const queryText = `
      SELECT 
        p.id_producto,
        p.sku,
        p.nombre,
        p.descripcion_corta,
        p.precio_actual,
        p.precio_anterior,
        p.stock,
        p.badge,
        p.calificacion_promedio,
        p.total_resenas,
        c.nombre AS categoria,
        m.nombre AS marca,
        (
          SELECT url_imagen 
          FROM producto_imagenes 
          WHERE id_producto = p.id_producto AND es_principal = TRUE 
          LIMIT 1
        ) AS imagen_principal
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      INNER JOIN marcas m ON p.id_marca = m.id_marca
      WHERE p.activo = TRUE
        AND p.id_producto != $1
        AND (
          p.id_categoria = (SELECT id_categoria FROM productos WHERE id_producto = $1)
          OR p.id_marca = (SELECT id_marca FROM productos WHERE id_producto = $1)
        )
      ORDER BY 
        CASE WHEN p.id_categoria = (SELECT id_categoria FROM productos WHERE id_producto = $1) THEN 1 ELSE 2 END,
        p.ventas_totales DESC
      LIMIT $2
    `;

        const result = await query(queryText, [productoId, limit]);
        return result.rows;
    }

    /**
     * Contar productos con filtros
     * @param {Object} filters - Filtros de búsqueda
     * @returns {Promise<number>} Número total de productos
     */
    static async count(filters = {}) {
        const { categoria, marca, precioMin, precioMax, destacado, busqueda } = filters;

        let queryText = `
      SELECT COUNT(*) as total
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      INNER JOIN marcas m ON p.id_marca = m.id_marca
      WHERE p.activo = TRUE
    `;

        const params = [];
        let paramIndex = 1;

        if (categoria) {
            queryText += ` AND c.slug = $${paramIndex}`;
            params.push(categoria);
            paramIndex++;
        }

        if (marca) {
            queryText += ` AND m.id_marca = $${paramIndex}`;
            params.push(marca);
            paramIndex++;
        }

        if (precioMin) {
            queryText += ` AND p.precio_actual >= $${paramIndex}`;
            params.push(precioMin);
            paramIndex++;
        }

        if (precioMax) {
            queryText += ` AND p.precio_actual <= $${paramIndex}`;
            params.push(precioMax);
            paramIndex++;
        }

        if (destacado !== undefined) {
            queryText += ` AND p.destacado = $${paramIndex}`;
            params.push(destacado);
            paramIndex++;
        }

        if (busqueda) {
            queryText += ` AND (
        to_tsvector('spanish', p.nombre || ' ' || COALESCE(p.descripcion_corta, '')) 
        @@ plainto_tsquery('spanish', $${paramIndex})
        OR p.nombre ILIKE $${paramIndex + 1}
      )`;
            params.push(busqueda, `%${busqueda}%`);
        }

        const result = await query(queryText, params);
        return parseInt(result.rows[0].total);
    }

    /**
     * Incrementar vistas de un producto
     * @param {number} id - ID del producto
     * @returns {Promise<void>}
     */
    static async incrementViews(id) {
        const queryText = `
      UPDATE productos
      SET vistas = vistas + 1
      WHERE id_producto = $1
    `;

        await query(queryText, [id]);
    }

    /**
     * Verificar disponibilidad de stock
     * @param {number} id - ID del producto
     * @param {number} cantidad - Cantidad solicitada
     * @returns {Promise<boolean>} True si hay stock disponible
     */
    static async checkStock(id, cantidad) {
        const queryText = `
      SELECT stock FROM productos
      WHERE id_producto = $1 AND activo = TRUE
    `;

        const result = await query(queryText, [id]);
        if (result.rows.length === 0) return false;

        return result.rows[0].stock >= cantidad;
    }
}

module.exports = ProductoModel;
