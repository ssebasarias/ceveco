/**
 * Middleware Central Export
 * Punto único de importación para todos los middlewares
 * 
 * @example
 * // En lugar de:
 * const { authMiddleware } = require('./middleware/auth.middleware');
 * const { requireAdmin } = require('./middleware/role.middleware');
 * 
 * // Usar:
 * const { authMiddleware, requireAdmin } = require('./middleware');
 */

// ============================================
// AUTENTICACIÓN
// ============================================
const {
    authMiddleware,
    optionalAuth,
    extractToken,
    hasToken,
    COOKIE_NAME
} = require('./auth.middleware');

// ============================================
// AUTORIZACIÓN / ROLES
// ============================================
const {
    requireRole,
    requireAdmin,
    requireOwner,
    requireAuthorization
} = require('./role.middleware');

// ============================================
// VALIDACIÓN
// ============================================
const {
    validateRequest,
    validateId,
    validatePagination,
    sanitizeInput,
    requireBody,
    requireFields
} = require('./validation.middleware');

// ============================================
// RATE LIMITING
// ============================================
const {
    apiLimiter,
    authLimiter,
    createLimiter,
    searchLimiter,
    passwordResetLimiter,
    adminLimiter
} = require('./rateLimiter.middleware');

// ============================================
// MANEJO DE ERRORES
// ============================================
const {
    AppError,
    notFound,
    errorHandler,
    asyncHandler,
    handleDatabaseError,
    handleJWTError,
    logErrorToService
} = require('./error.middleware');

// ============================================
// EXPORTACIÓN AGRUPADA
// ============================================
module.exports = {
    // Autenticación
    authMiddleware,
    optionalAuth,
    extractToken,
    hasToken,
    COOKIE_NAME,

    // Autorización
    requireRole,
    requireAdmin,
    requireOwner,
    requireAuthorization,

    // Validación
    validateRequest,
    validateId,
    validatePagination,
    sanitizeInput,
    requireBody,
    requireFields,

    // Rate Limiting
    apiLimiter,
    authLimiter,
    createLimiter,
    searchLimiter,
    passwordResetLimiter,
    adminLimiter,

    // Manejo de Errores
    AppError,
    notFound,
    errorHandler,
    asyncHandler,
    handleDatabaseError,
    handleJWTError,
    logErrorToService
};
