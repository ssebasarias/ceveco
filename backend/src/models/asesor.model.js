const { query } = require('../config/db');

class AsesorModel {
    /**
     * Obtener todos los asesores activos
     * @returns {Promise<Array>} Lista de asesores
     */
    static async findAll() {
        const queryText = `
      SELECT 
        id_asesor,
        nombre_completo,
        telefono,
        foto_url,
        calificacion_promedio,
        total_calificaciones,
        especialidad,
        horario_atencion
      FROM asesores
      WHERE activo = TRUE
      ORDER BY orden ASC, calificacion_promedio DESC
    `;

        const result = await query(queryText);
        return result.rows;
    }

    /**
     * Obtener un asesor aleatorio
     * @returns {Promise<Object|null>} Asesor aleatorio
     */
    static async findRandom() {
        const queryText = `
      SELECT 
        id_asesor,
        nombre_completo,
        telefono,
        foto_url,
        calificacion_promedio,
        total_calificaciones,
        especialidad,
        horario_atencion
      FROM asesores
      WHERE activo = TRUE
      ORDER BY RANDOM()
      LIMIT 1
    `;

        const result = await query(queryText);
        return result.rows[0] || null;
    }

    /**
     * Obtener un asesor por ID
     * @param {number} id - ID del asesor
     * @returns {Promise<Object|null>} Asesor encontrado
     */
    static async findById(id) {
        const queryText = `
      SELECT 
        id_asesor,
        nombre_completo,
        telefono,
        foto_url,
        calificacion_promedio,
        total_calificaciones,
        especialidad,
        horario_atencion
      FROM asesores
      WHERE id_asesor = $1 AND activo = TRUE
    `;

        const result = await query(queryText, [id]);
        return result.rows[0] || null;
    }

    /**
     * Actualizar calificación de un asesor
     * @param {number} id - ID del asesor
     * @param {number} nuevaCalificacion - Nueva calificación (1-5)
     * @returns {Promise<void>}
     */
    static async updateCalificacion(id, nuevaCalificacion) {
        const queryText = `
      UPDATE asesores
      SET 
        calificacion_promedio = (
          (calificacion_promedio * total_calificaciones + $2) / (total_calificaciones + 1)
        ),
        total_calificaciones = total_calificaciones + 1
      WHERE id_asesor = $1
    `;

        await query(queryText, [id, nuevaCalificacion]);
    }
}

module.exports = AsesorModel;
