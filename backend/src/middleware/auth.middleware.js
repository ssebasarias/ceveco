/**
 * Middleware de Autenticación JWT
 * Verifica tokens y adjunta información del usuario al request
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ceveco_secret_key_change_in_production';
const COOKIE_NAME = 'jwt_token';

/**
 * Middleware principal de autenticación JWT
 * Verifica el token en header Authorization o en cookies
 * Adjunta req.user si es válido
 * 
 * @example
 * router.get('/perfil', authMiddleware, controller);
 */
const authMiddleware = (req, res, next) => {
    try {
        // Obtener token del header Authorization o de la cookie
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
                message: 'Token de autenticación no proporcionado',
                code: 'NO_TOKEN'
            });
        }

        // Verificar y decodificar token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Adjuntar datos del usuario al request
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
 * Middleware de autenticación opcional
 * Permite acceso sin token, pero si hay token lo valida
 * Útil para rutas públicas que personalizan contenido si usuario está logueado
 * 
 * @example
 * router.get('/productos', optionalAuth, controller);
 * // En el controller: if (req.user) { ... contenido personalizado }
 */
const optionalAuth = (req, res, next) => {
    try {
        let token = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies && req.cookies[COOKIE_NAME]) {
            token = req.cookies[COOKIE_NAME];
        }

        // Si no hay token, continuar sin usuario
        if (!token) {
            req.user = null;
            return next();
        }

        // Intentar verificar token
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = {
            id: decoded.id,
            email: decoded.email,
            rol: decoded.rol
        };

    } catch (error) {
        // En caso de error, continuar sin usuario (token inválido/expirado)
        req.user = null;
    }

    next();
};

/**
 * Helper para extraer token sin validarlo
 * Útil para debugging o análisis
 */
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    if (req.cookies && req.cookies[COOKIE_NAME]) {
        return req.cookies[COOKIE_NAME];
    }
    return null;
};

/**
 * Verificar si existe un token (sin validarlo completamente)
 * Útil para rate limiting personalizado
 */
const hasToken = (req) => {
    return extractToken(req) !== null;
};

module.exports = {
    authMiddleware,
    optionalAuth,
    extractToken,
    hasToken,
    COOKIE_NAME
};
