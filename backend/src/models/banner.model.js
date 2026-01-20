const { query } = require('../config/db');

class BannerModel {
  /**
   * Obtener todos los banners con filtros opcionales
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>} Lista de banners
   */
  static async findAll(filters = {}) {
    const {
      posicion,
      activo,
      limit,
      offset = 0,
      orderBy = 'orden',
      orderDir = 'ASC'
    } = filters;

    let queryText = `
      SELECT 
        id_banner,
        titulo,
        subtitulo,
        descripcion,
        imagen_url,
        imagen_mobile_url,
        enlace_url,
        texto_boton,
        posicion,
        orden,
        activo,
        fecha_inicio,
        fecha_fin,
        fecha_creacion
      FROM banners
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (posicion) {
      paramCount++;
      queryText += ` AND posicion = $${paramCount}`;
      params.push(posicion);
    }

    if (activo !== undefined) {
      paramCount++;
      queryText += ` AND activo = $${paramCount}`;
      params.push(activo);
    }

    // Validar orderBy para prevenir SQL injection
    const allowedOrderBy = ['orden', 'fecha_creacion', 'titulo', 'fecha_inicio', 'fecha_fin'];
    const safeOrderBy = allowedOrderBy.includes(orderBy) ? orderBy : 'orden';
    const safeOrderDir = orderDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    queryText += ` ORDER BY ${safeOrderBy} ${safeOrderDir}`;

    if (limit) {
      paramCount++;
      queryText += ` LIMIT $${paramCount}`;
      params.push(limit);
    }

    if (offset > 0) {
      paramCount++;
      queryText += ` OFFSET $${paramCount}`;
      params.push(offset);
    }

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Obtener un banner por ID
   * @param {number} id - ID del banner
   * @returns {Promise<Object|null>} Banner o null
   */
  static async findById(id) {
    const queryText = `
      SELECT 
        id_banner,
        titulo,
        subtitulo,
        descripcion,
        imagen_url,
        imagen_mobile_url,
        enlace_url,
        texto_boton,
        posicion,
        orden,
        activo,
        fecha_inicio,
        fecha_fin,
        fecha_creacion
      FROM banners
      WHERE id_banner = $1
    `;
    const result = await query(queryText, [id]);
    return result.rows[0] || null;
  }

  /**
   * Crear un nuevo banner
   * @param {Object} bannerData - Datos del banner
   * @returns {Promise<Object>} Banner creado
   */
  static async create(bannerData) {
    const {
      titulo,
      subtitulo,
      descripcion,
      imagen_url,
      imagen_mobile_url,
      enlace_url,
      texto_boton,
      posicion = 'hero',
      orden = 0,
      activo = true,
      fecha_inicio,
      fecha_fin
    } = bannerData;

    const queryText = `
      INSERT INTO banners (
        titulo, subtitulo, descripcion, imagen_url, imagen_mobile_url,
        enlace_url, texto_boton, posicion, orden, activo, fecha_inicio, fecha_fin
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const params = [
      titulo,
      subtitulo || null,
      descripcion || null,
      imagen_url,
      imagen_mobile_url || null,
      enlace_url || null,
      texto_boton || null,
      posicion,
      orden,
      activo,
      fecha_inicio || null,
      fecha_fin || null
    ];

    const result = await query(queryText, params);
    return result.rows[0];
  }

  /**
   * Actualizar un banner
   * @param {number} id - ID del banner
   * @param {Object} bannerData - Datos a actualizar
   * @returns {Promise<Object|null>} Banner actualizado o null
   */
  static async update(id, bannerData) {
    const fields = [];
    const params = [];
    let paramCount = 0;

    const allowedFields = [
      'titulo', 'subtitulo', 'descripcion', 'imagen_url', 'imagen_mobile_url',
      'enlace_url', 'texto_boton', 'posicion', 'orden', 'activo',
      'fecha_inicio', 'fecha_fin'
    ];

    for (const [key, value] of Object.entries(bannerData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        params.push(value);
      }
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    paramCount++;
    params.push(id);

    const queryText = `
      UPDATE banners
      SET ${fields.join(', ')}
      WHERE id_banner = $${paramCount}
      RETURNING *
    `;

    const result = await query(queryText, params);
    return result.rows[0] || null;
  }

  /**
   * Eliminar un banner (soft delete - marca como inactivo)
   * @param {number} id - ID del banner
   * @returns {Promise<boolean>} True si se eliminó
   */
  static async delete(id) {
    const queryText = `
      UPDATE banners
      SET activo = FALSE
      WHERE id_banner = $1
      RETURNING id_banner
    `;

    const result = await query(queryText, [id]);
    return result.rows.length > 0;
  }

  /**
   * Eliminar un banner permanentemente
   * @param {number} id - ID del banner
   * @returns {Promise<boolean>} True si se eliminó
   */
  static async deletePermanent(id) {
    const queryText = `
      DELETE FROM banners
      WHERE id_banner = $1
      RETURNING id_banner
    `;

    const result = await query(queryText, [id]);
    return result.rows.length > 0;
  }

  /**
   * Obtener banners activos por posición
   * @param {string} posicion - Posición del banner
   * @returns {Promise<Array>} Lista de banners activos
   */
  static async findActiveByPosition(posicion) {
    const queryText = `
      SELECT *
      FROM banners
      WHERE posicion = $1
        AND activo = TRUE
        AND (fecha_inicio IS NULL OR fecha_inicio <= CURRENT_TIMESTAMP)
        AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_TIMESTAMP)
      ORDER BY orden ASC, fecha_creacion DESC
    `;

    const result = await query(queryText, [posicion]);
    return result.rows;
  }
}

module.exports = BannerModel;
