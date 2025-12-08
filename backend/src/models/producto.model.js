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
      orderDir = 'DESC',
      atributos
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

    // Filtros dinámicos de atributos
    if (atributos) {
      try {
        const attrs = typeof atributos === 'string' ? JSON.parse(atributos) : atributos;
        Object.keys(attrs).forEach(key => {
          const attrId = parseInt(key);
          if (isNaN(attrId)) return;
          const values = attrs[key];
          if (values && values.length > 0) {
            // Cast numeric and boolean values to text for comparison against string array
            queryText += ` AND EXISTS (
                 SELECT 1 FROM producto_atributos pa_${attrId}
                 WHERE pa_${attrId}.id_producto = p.id_producto
                 AND pa_${attrId}.id_atributo = $${paramIndex}
                 AND (
                    pa_${attrId}.valor_texto = ANY($${paramIndex + 1}::text[]) 
                    OR pa_${attrId}.valor_numero::text = ANY($${paramIndex + 1}::text[])
                    OR (CASE WHEN pa_${attrId}.valor_booleano THEN 'Sí' ELSE 'No' END) = ANY($${paramIndex + 1}::text[])
                 )
              )`;
            params.push(attrId, values);
            paramIndex += 2;
          }
        });
      } catch (e) {
        console.error('Error parsing attributes filter', e);
      }
    }

    // Búsqueda por texto (mejorada con fuzzy search usando pg_trgm)
    if (busqueda) {
      queryText += ` AND (
        -- Full-text search en español (alta prioridad)
        to_tsvector('spanish', p.nombre || ' ' || COALESCE(p.descripcion_corta, '') || ' ' || m.nombre || ' ' || c.nombre) 
        @@ plainto_tsquery('spanish', $${paramIndex})
        -- ILIKE para coincidencias parciales (case-insensitive)
        OR LOWER(p.nombre) ILIKE LOWER($${paramIndex + 1})
        OR LOWER(p.sku) ILIKE LOWER($${paramIndex + 1})
        OR LOWER(COALESCE(p.descripcion_corta, '')) ILIKE LOWER($${paramIndex + 1})
        OR LOWER(m.nombre) ILIKE LOWER($${paramIndex + 1})
        OR LOWER(c.nombre) ILIKE LOWER($${paramIndex + 1})
        -- Búsqueda difusa con pg_trgm (tolerante a errores ortográficos)
        -- similarity > 0.3 significa 30% de similitud mínima
        OR similarity(LOWER(p.nombre), LOWER($${paramIndex})) > 0.3
        OR similarity(LOWER(m.nombre), LOWER($${paramIndex})) > 0.3
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
              'nombre', a.nombre,
              'valor', COALESCE(pa.valor_texto, pa.valor_numero::TEXT, 
                       CASE WHEN pa.valor_booleano THEN 'Sí' ELSE 'No' END),
              'unidad', a.unidad
            ) ORDER BY a.nombre
          )
          FROM producto_atributos pa
          INNER JOIN atributos a ON pa.id_atributo = a.id_atributo
          WHERE pa.id_producto = p.id_producto
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
        to_tsvector('spanish', p.nombre || ' ' || COALESCE(p.descripcion_corta, '') || ' ' || m.nombre || ' ' || c.nombre) 
        @@ plainto_tsquery('spanish', $${paramIndex})
        OR LOWER(p.nombre) ILIKE LOWER($${paramIndex + 1})
        OR LOWER(COALESCE(p.descripcion_corta, '')) ILIKE LOWER($${paramIndex + 1})
        OR LOWER(m.nombre) ILIKE LOWER($${paramIndex + 1})
        OR LOWER(c.nombre) ILIKE LOWER($${paramIndex + 1})
        OR similarity(LOWER(p.nombre), LOWER($${paramIndex})) > 0.3
        OR similarity(LOWER(m.nombre), LOWER($${paramIndex})) > 0.3
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
  /**
   * Obtener atributos para filtros por categoría
   * @param {string} categorySlug - Slug de la categoría
   * @returns {Promise<Array>} Lista de atributos con valores
   */
  static async findAttributesByCategory(categorySlug) {
    const queryText = `
      SELECT 
        a.id_atributo,
        a.nombre,
        a.unidad,
        a.tipo_dato,
        a.id_categoria,
        (
            SELECT json_agg(DISTINCT 
                COALESCE(pa.valor_texto, pa.valor_numero::TEXT, 
                CASE WHEN pa.valor_booleano THEN 'Sí' ELSE 'No' END)
            )
            FROM producto_atributos pa
            INNER JOIN productos p ON pa.id_producto = p.id_producto
            INNER JOIN categorias c2 ON p.id_categoria = c2.id_categoria
            WHERE pa.id_atributo = a.id_atributo 
            AND p.activo = TRUE
            AND (c2.slug = $1 OR a.id_categoria IS NULL)
        ) as valores
      FROM atributos a
      LEFT JOIN categorias c ON a.id_categoria = c.id_categoria
      WHERE c.slug = $1 OR a.id_categoria IS NULL
      ORDER BY a.priority DESC, a.nombre ASC
    `;
    // Note: 'priority' column doesn't exist in schema shown, I should remove it or use default order.
    // Schema: id_atributo, nombre, unidad, tipo_dato, id_categoria.

    // Correct query without 'priority':
    const queryTextCorrect = `
      SELECT 
        a.id_atributo,
        a.nombre,
        a.unidad,
        a.tipo_dato,
        a.id_categoria,
        (
            SELECT json_agg(DISTINCT 
                COALESCE(pa.valor_texto, pa.valor_numero::TEXT, 
                CASE WHEN pa.valor_booleano THEN 'Sí' ELSE 'No' END)
            )
            FROM producto_atributos pa
            INNER JOIN productos p ON pa.id_producto = p.id_producto
            INNER JOIN categorias c2 ON p.id_categoria = c2.id_categoria
            WHERE pa.id_atributo = a.id_atributo 
            AND p.activo = TRUE
            AND (c2.slug = $1 OR a.id_categoria IS NULL)
        ) as valores
      FROM atributos a
      LEFT JOIN categorias c ON a.id_categoria = c.id_categoria
      WHERE c.slug = $1 OR a.id_categoria IS NULL
      ORDER BY a.nombre ASC
    `;

    const result = await query(queryTextCorrect, [categorySlug]);
    return result.rows;
  }
}

module.exports = ProductoModel;
