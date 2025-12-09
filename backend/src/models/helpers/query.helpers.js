/**
 * Query Helpers
 * Funciones reutilizables para construcción de queries SQL
 */

/**
 * Construir cláusula WHERE dinámica
 * @param {Object} filters - Objeto con filtros
 * @param {number} startIndex - Índice inicial para parámetros ($1, $2, etc.)
 * @returns {Object} { whereClause, params }
 */
const buildWhereClause = (filters, startIndex = 1) => {
    const conditions = [];
    const params = [];
    let paramIndex = startIndex;

    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
            conditions.push(`${key} = $${paramIndex}`);
            params.push(value);
            paramIndex++;
        }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return { whereClause, params, nextIndex: paramIndex };
};

/**
 * Construir cláusula de paginación
 * @param {number} page - Número de página (1-indexed)
 * @param {number} limit - Elementos por página
 * @returns {Object} { offset, limit }
 */
const buildPagination = (page = 1, limit = 12) => {
    const offset = (page - 1) * limit;
    return { offset, limit };
};

/**
 * Construir cláusula ORDER BY
 * @param {string} orderBy - Campo de ordenamiento
 * @param {string} orderDir - Dirección (ASC/DESC)
 * @param {Array} allowedFields - Campos permitidos para ordenar
 * @returns {string} Cláusula ORDER BY
 */
const buildOrderBy = (orderBy, orderDir = 'DESC', allowedFields = []) => {
    // Validar campo
    if (allowedFields.length > 0 && !allowedFields.includes(orderBy)) {
        orderBy = allowedFields[0]; // Usar primer campo permitido como default
    }

    // Validar dirección
    const direction = orderDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return `ORDER BY ${orderBy} ${direction}`;
};

/**
 * Construir query de búsqueda con ILIKE
 * @param {string} searchTerm - Término de búsqueda
 * @param {Array} fields - Campos donde buscar
 * @param {number} paramIndex - Índice del parámetro
 * @returns {Object} { searchClause, param }
 */
const buildSearchClause = (searchTerm, fields, paramIndex = 1) => {
    if (!searchTerm || fields.length === 0) {
        return { searchClause: '', param: null };
    }

    const conditions = fields.map(field => `${field} ILIKE $${paramIndex}`);
    const searchClause = `(${conditions.join(' OR ')})`;
    const param = `%${searchTerm}%`;

    return { searchClause, param };
};

/**
 * Construir query de rango (para precios, fechas, etc.)
 * @param {string} field - Campo a filtrar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {number} startIndex - Índice inicial de parámetros
 * @returns {Object} { rangeClause, params }
 */
const buildRangeClause = (field, min, max, startIndex = 1) => {
    const conditions = [];
    const params = [];
    let paramIndex = startIndex;

    if (min !== undefined && min !== null) {
        conditions.push(`${field} >= $${paramIndex}`);
        params.push(min);
        paramIndex++;
    }

    if (max !== undefined && max !== null) {
        conditions.push(`${field} <= $${paramIndex}`);
        params.push(max);
        paramIndex++;
    }

    const rangeClause = conditions.length > 0 ? conditions.join(' AND ') : '';

    return { rangeClause, params, nextIndex: paramIndex };
};

/**
 * Construir IN clause para arrays
 * @param {string} field - Campo a filtrar
 * @param {Array} values - Valores
 * @param {number} paramIndex - Índice del parámetro
 * @returns {Object} { inClause, param }
 */
const buildInClause = (field, values, paramIndex = 1) => {
    if (!values || values.length === 0) {
        return { inClause: '', param: null };
    }

    const inClause = `${field} = ANY($${paramIndex})`;
    return { inClause, param: values };
};

/**
 * Sanitizar input para LIKE queries
 * @param {string} input - Input del usuario
 * @returns {string} Input sanitizado
 */
const sanitizeLikeInput = (input) => {
    if (!input) return '';
    // Escapar caracteres especiales de LIKE
    return input.replace(/[%_]/g, '\\$&');
};

/**
 * Construir respuesta paginada estándar
 * @param {Array} data - Datos
 * @param {number} total - Total de elementos
 * @param {number} page - Página actual
 * @param {number} limit - Elementos por página
 * @returns {Object} Respuesta formateada
 */
const buildPaginatedResponse = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPrevPage
        }
    };
};

module.exports = {
    buildWhereClause,
    buildPagination,
    buildOrderBy,
    buildSearchClause,
    buildRangeClause,
    buildInClause,
    sanitizeLikeInput,
    buildPaginatedResponse
};
