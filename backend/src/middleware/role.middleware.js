/**
 * Middleware de Autorización por Roles
 * Maneja permisos y control de acceso basado en roles de usuario
 */

/**
 * Middleware para verificar roles específicos
 * @param {...string} allowedRoles - Lista de roles permitidos
 * @returns {Function} Middleware function
 * 
 * @example
 * router.get('/admin', authMiddleware, requireRole('admin'), controller);
 * router.post('/content', authMiddleware, requireRole('admin', 'moderator'), controller);
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Verificar que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Autenticación requerida'
            });
        }

        // Verificar que el rol del usuario esté en los permitidos
        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para realizar esta acción',
                requiredRoles: allowedRoles,
                yourRole: req.user.rol
            });
        }

        next();
    };
};

/**
 * Middleware específico para verificar que el usuario es administrador
 * Shortcut de requireRole('admin')
 * 
 * @example
 * router.delete('/productos/:id', authMiddleware, requireAdmin, controller);
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
 * @returns {Function} Middleware function
 * 
 * @example
 * router.get('/pedidos/:id', authMiddleware, requireOwner(async (req) => {
 *     const order = await OrderModel.findById(req.params.id);
 *     return order.id_usuario;
 * }), controller);
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

            // Obtener el ID del propietario del recurso
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

/**
 * Middleware para verificar múltiples condiciones de autorización
 * @param {Object} options - Opciones de autorización
 * @param {string[]} options.roles - Roles permitidos
 * @param {Function} options.ownerCheck - Función para verificar ownership
 * @param {boolean} options.allowOwner - Permitir al propietario aunque no tenga el rol
 * 
 * @example
 * router.put('/posts/:id', authMiddleware, requireAuthorization({
 *     roles: ['admin', 'moderator'],
 *     ownerCheck: async (req) => {
 *         const post = await Post.findById(req.params.id);
 *         return post.userId;
 *     },
 *     allowOwner: true
 * }), controller);
 */
const requireAuthorization = (options) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Autenticación requerida'
                });
            }

            const { roles, ownerCheck, allowOwner = false } = options;

            // Verificar rol
            const hasRole = roles && roles.includes(req.user.rol);

            // Verificar ownership si está permitido
            let isOwner = false;
            if (allowOwner && ownerCheck) {
                const ownerId = await ownerCheck(req);
                isOwner = ownerId === req.user.id;
            }

            // Permitir si tiene rol correcto o es propietario (cuando está permitido)
            if (hasRole || isOwner) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para realizar esta acción'
            });

        } catch (error) {
            console.error('Error en requireAuthorization:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar permisos'
            });
        }
    };
};

module.exports = {
    requireRole,
    requireAdmin,
    requireOwner,
    requireAuthorization
};
