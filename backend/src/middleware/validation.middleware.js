/**
 * Middleware de Validación
 * Helpers reutilizables para validación de datos
 */

const { validationResult } = require('express-validator');

/**
 * Middleware para validar resultados de express-validator
 * Retorna errores en formato estándar si la validación falla
 * 
 * @example
 * router.post('/productos',
 *     [
 *         body('nombre').notEmpty(),
 *         body('precio').isFloat({ min: 0 })
 *     ],
 *     validateRequest,
 *     controller
 * );
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Datos de entrada inválidos',
            errors: errors.array().map(e => ({
                field: e.param,
                message: e.msg,
                value: e.value
            }))
        });
    }

    next();
};

/**
 * Middleware para validar IDs numéricos en parámetros
 * @param {string} paramName - Nombre del parámetro a validar (default: 'id')
 * 
 * @example
 * router.get('/productos/:id', validateId(), controller);
 * router.get('/categorias/:categoryId/productos', validateId('categoryId'), controller);
 */
const validateId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!id || isNaN(id) || parseInt(id) < 1) {
            return res.status(400).json({
                success: false,
                message: `ID inválido en parámetro '${paramName}'`,
                receivedValue: id
            });
        }

        // Convertir a número para evitar problemas posteriores
        req.params[paramName] = parseInt(id);
        next();
    };
};

/**
 * Middleware para validar paginación
 * Establece valores por defecto si no se proporcionan
 * 
 * @param {Object} defaults - Valores por defecto
 * @param {number} defaults.page - Página por defecto
 * @param {number} defaults.limit - Límite por defecto
 * @param {number} defaults.maxLimit - Límite máximo permitido
 * 
 * @example
 * router.get('/productos', validatePagination(), controller);
 */
const validatePagination = (defaults = {}) => {
    const {
        page: defaultPage = 1,
        limit: defaultLimit = 12,
        maxLimit = 100
    } = defaults;

    return (req, res, next) => {
        // Validar y establecer página
        let page = parseInt(req.query.page) || defaultPage;
        if (page < 1) page = defaultPage;

        // Validar y establecer límite
        let limit = parseInt(req.query.limit) || defaultLimit;
        if (limit < 1) limit = defaultLimit;
        if (limit > maxLimit) limit = maxLimit;

        // Calcular offset
        const offset = (page - 1) * limit;

        // Agregar valores validados a req
        req.pagination = {
            page,
            limit,
            offset
        };

        next();
    };
};

/**
 * Middleware para sanitizar entrada de usuario
 * Elimina espacios en blanco innecesarios de strings
 * 
 * @param {string[]} fields - Campos a sanitizar
 * 
 * @example
 * router.post('/usuarios', sanitizeInput(['nombre', 'email']), controller);
 */
const sanitizeInput = (fields = []) => {
    return (req, res, next) => {
        fields.forEach(field => {
            if (req.body[field] && typeof req.body[field] === 'string') {
                req.body[field] = req.body[field].trim();
            }
        });
        next();
    };
};

/**
 * Middleware para validar que el body no esté vacío
 */
const requireBody = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El cuerpo de la petición no puede estar vacío'
        });
    }
    next();
};

/**
 * Middleware para validar campos requeridos específicos
 * @param {string[]} requiredFields - Lista de campos requeridos
 * 
 * @example
 * router.post('/productos', requireFields(['nombre', 'precio', 'stock']), controller);
 */
const requireFields = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = [];

        requiredFields.forEach(field => {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos',
                missingFields
            });
        }

        next();
    };
};

module.exports = {
    validateRequest,
    validateId,
    validatePagination,
    sanitizeInput,
    requireBody,
    requireFields
};
