/**
 * Error Handling Middleware
 * Manejo centralizado de errores de la aplicación
 */

/**
 * Clase de error personalizada para errores de la aplicación
 */
class AppError extends Error {
    constructor(message, statusCode, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true; // Distinguir errores operacionales de bugs

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Middleware para rutas no encontradas (404)
 * Debe colocarse DESPUÉS de todas las rutas
 */
const notFound = (req, res, next) => {
    const error = new AppError(
        `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
        404,
        'ROUTE_NOT_FOUND'
    );
    next(error);
};

/**
 * Middleware de manejo global de errores
 * Debe colocarse al FINAL de todos los middlewares
 */
const errorHandler = (err, req, res, next) => {
    // Log del error en desarrollo
    if (process.env.NODE_ENV === 'development') {
        console.error('═══════════════════════════════════════');
        console.error('ERROR DETECTADO:');
        console.error('Mensaje:', err.message);
        console.error('Status:', err.statusCode || 500);
        console.error('Stack:', err.stack);
        console.error('═══════════════════════════════════════');
    } else {
        // En producción, solo loguear información esencial
        console.error(`[${new Date().toISOString()}] Error ${err.statusCode || 500}: ${err.message}`);
    }

    // Preparar respuesta de error
    const statusCode = err.statusCode || 500;
    const response = {
        success: false,
        message: err.message || 'Error interno del servidor',
    };

    // Agregar código de error si existe
    if (err.code) {
        response.code = err.code;
    }

    // Agregar detalles adicionales SOLO en desarrollo
    if (process.env.NODE_ENV === 'development') {
        response.error = {
            stack: err.stack,
            name: err.name
        };

        // Si hay errores de validación, incluirlos
        if (err.errors) {
            response.errors = err.errors;
        }
    }

    res.status(statusCode).json(response);
};

/**
 * Wrapper para funciones async en rutas
 * Captura errores automáticamente sin necesidad de try-catch
 * 
 * @example
 * router.get('/productos', asyncHandler(async (req, res) => {
 *     const productos = await ProductoService.getAll();
 *     res.json(productos);
 * }));
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Middleware para validar errores de base de datos
 * Convierte errores de PostgreSQL en respuestas amigables
 */
const handleDatabaseError = (err, req, res, next) => {
    // Error de duplicado (unique constraint)
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'El recurso ya existe',
            code: 'DUPLICATE_ENTRY'
        });
    }

    // Error de foreign key
    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            message: 'Referencia inválida. El recurso relacionado no existe.',
            code: 'INVALID_REFERENCE'
        });
    }

    // Error de tipo de dato
    if (err.code === '22P02') {
        return res.status(400).json({
            success: false,
            message: 'Formato de dato inválido',
            code: 'INVALID_DATA_TYPE'
        });
    }

    // Si no es un error de BD conocido, pasar al siguiente middleware
    next(err);
};

/**
 * Middleware para validar errores de JWT
 */
const handleJWTError = (err, req, res, next) => {
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token inválido',
            code: 'INVALID_TOKEN'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expirado',
            code: 'EXPIRED_TOKEN'
        });
    }

    next(err);
};

/**
 * Middleware para logging de errores a servicio externo
 * (Ejemplo: Sentry, LogRocket, etc.)
 */
const logErrorToService = (err, req, res, next) => {
    // Solo loguear errores graves en producción
    if (process.env.NODE_ENV === 'production' && err.statusCode >= 500) {
        // TODO: Integrar con servicio de logging (Sentry, etc.)
        // Sentry.captureException(err);
        console.error('Error crítico:', {
            url: req.originalUrl,
            method: req.method,
            error: err.message,
            stack: err.stack,
            user: req.user?.id
        });
    }
    next(err);
};

module.exports = {
    AppError,
    notFound,
    errorHandler,
    asyncHandler,
    handleDatabaseError,
    handleJWTError,
    logErrorToService
};
