const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ceveco_secret_key_change_in_production';

// nombre de la cookie para token
const COOKIE_NAME = 'jwt_token';

/**
 * Middleware de autenticación JWT
 * Verifica el token en el header Authorization
 */
const authMiddleware = (req, res, next) => {
    try {
        // Obtener token del header o de la cookie
        let token = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies && req.cookies[COOKIE_NAME]) {
            token = req.cookies[COOKIE_NAME];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token dev autenticación no proporcionado'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Agregar datos del usuario al request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            rol: decoded.rol
        };

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                code: 'TOKEN_INVALID'
            });
        }

        console.error('Error en middleware de autenticación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar autenticación'
        });
    }
};

/**
 * Middleware opcional de autenticación
 * Permite acceso sin token, pero si hay token lo valida
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        req.user = null;
        return next();
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        req.user = null;
        return next();
    }

    try {
        const token = parts[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = {
            id: decoded.id,
            email: decoded.email,
            rol: decoded.rol
        };

    } catch (error) {
        req.user = null;
    }

    next();
};

/**
 * Middleware para verificar roles
 * @param {string[]} allowedRoles - Roles permitidos
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Autenticación requerida'
            });
        }

        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para realizar esta acción'
            });
        }

        next();
    };
};

/**
 * Middleware para verificar que el usuario es admin
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Autenticación requerida'
        });
    }

    if (req.user.rol !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Se requieren permisos de administrador'
        });
    }

    next();
};

/**
 * Middleware para verificar que el usuario es el propietario del recurso
 * @param {Function} getResourceOwner - Función async que retorna el id del propietario
 */
const requireOwner = (getResourceOwner) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Autenticación requerida'
                });
            }

            // Admin puede acceder a cualquier recurso
            if (req.user.rol === 'admin') {
                return next();
            }

            const ownerId = await getResourceOwner(req);

            if (ownerId !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para acceder a este recurso'
                });
            }

            next();

        } catch (error) {
            console.error('Error en requireOwner:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar permisos'
            });
        }
    };
};

module.exports = {
    authMiddleware,
    optionalAuth,
    requireRole,
    requireAdmin,
    requireOwner
};
