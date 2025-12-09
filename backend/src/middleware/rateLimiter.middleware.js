/**
 * Rate Limiter Middleware
 * Configuraciones predefinidas para limitar peticiones
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter general para la API
 * 100 requests por 15 minutos por IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de requests
    message: {
        success: false,
        message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.'
    },
    standardHeaders: true, // Retorna info de rate limit en headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
});

/**
 * Rate limiter estricto para autenticación
 * 10 requests por minuto por IP
 * Previene ataques de fuerza bruta
 */
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // 10 intentos por minuto
    message: {
        success: false,
        message: 'Demasiados intentos de autenticación. Por favor espera un momento antes de intentar de nuevo.',
        code: 'RATE_LIMIT_AUTH'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Contar también requests exitosos
});

/**
 * Rate limiter para creación de recursos
 * 20 requests por 10 minutos por usuario autenticado
 */
const createLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 20,
    message: {
        success: false,
        message: 'Límite de creación excedido. Por favor espera antes de crear más recursos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Usar ID de usuario en lugar de IP si está autenticado
    keyGenerator: (req) => {
        return req.user ? `user_${req.user.id}` : req.ip;
    }
});

/**
 * Rate limiter para búsquedas
 * 30 requests por minuto
 * Previene scraping masivo
 */
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30,
    message: {
        success: false,
        message: 'Demasiadas búsquedas en poco tiempo. Por favor espera un momento.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter muy estricto para recuperación de contraseña
 * 3 intentos por hora por IP
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3,
    message: {
        success: false,
        message: 'Demasiadas solicitudes de recuperación de contraseña. Por favor intenta de nuevo en una hora.',
        code: 'RATE_LIMIT_PASSWORD_RESET'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter para operaciones administrativas
 * 50 requests por 5 minutos por usuario admin
 */
const adminLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 50,
    message: {
        success: false,
        message: 'Límite de operaciones administrativas excedido. Por favor espera un momento.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user ? `admin_${req.user.id}` : req.ip;
    },
    // Solo aplicar si el usuario es admin
    skip: (req) => {
        return !req.user || req.user.rol !== 'admin';
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    createLimiter,
    searchLimiter,
    passwordResetLimiter,
    adminLimiter
};
