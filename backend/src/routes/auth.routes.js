const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
// Express‑validator helpers
const { body, validationResult } = require('express-validator');

// Middleware to return validation errors in a unified format
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Datos de entrada inválidos',
            errors: errors.array().map(e => ({ field: e.param, msg: e.msg }))
        });
    }
    next();
};
// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post(
    '/register',
    authLimiter,
    [
        body('email').isEmail().withMessage('Email debe ser válido'),
        body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
        body('nombre').notEmpty().withMessage('Nombre es requerido'),
        body('apellido').optional().isString(),
        body('telefono').optional().isString()
    ],
    validate,
    AuthController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Iniciar sesión con email/contraseña
 * @access  Public
 */
router.post(
    '/login',
    authLimiter,
    [
        body('email').isEmail().withMessage('Email debe ser válido'),
        body('password').notEmpty().withMessage('Contraseña es requerida')
    ],
    validate,
    AuthController.login
);

/**
 * @route   POST /api/v1/auth/oauth
 * @desc    Login/registro con OAuth (Google, Facebook, etc.)
 * @access  Public
 * @body    { provider, providerUid, email, nombre, apellido?, avatarUrl?, rawData? }
 */
router.post(
    '/oauth',
    [
        body('provider')
            .isIn(['google', 'facebook', 'github', 'apple', 'microsoft'])
            .withMessage('Proveedor no soportado'),
        body('providerUid').notEmpty().withMessage('providerUid es requerido'),
        body('email').isEmail().withMessage('Email debe ser válido'),
        body('nombre').optional().isString()
    ],
    validate,
    AuthController.oauthLogin
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Solicitar recuperación de contraseña
 * @access  Public
 */
router.post(
    '/forgot-password',
    [body('email').isEmail().withMessage('Email debe ser válido')],
    validate,
    AuthController.forgotPassword
);


/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Restablecer contraseña con token
 * @access  Public
 */
router.post(
    '/reset-password',
    [
        body('token').notEmpty().withMessage('Token es requerido'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    ],
    validate,
    AuthController.resetPassword
);


// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * @route   GET /api/v1/auth/verify
 * @desc    Verificar token JWT y obtener datos básicos del usuario
 * @access  Private
 */
router.get('/verify', authMiddleware, AuthController.verifyToken);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Obtener perfil completo del usuario autenticado
 * @access  Private
 */
router.get('/profile', authMiddleware, AuthController.getProfile);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Actualizar perfil del usuario
 * @access  Private
 */
router.put('/profile', authMiddleware, AuthController.updateProfile);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Cambiar contraseña (requiere contraseña actual si existe)
 * @access  Private
 */
router.put(
    '/change-password',
    authMiddleware,
    [
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
        body('currentPassword').optional().isString()
    ],
    validate,
    AuthController.changePassword
);


/**
 * @route   GET /api/v1/auth/providers
 * @desc    Obtener proveedores OAuth vinculados
 * @access  Private
 */
router.get('/providers', authMiddleware, AuthController.getLinkedProviders);

/**
 * @route   POST /api/v1/auth/providers/link
 * @desc    Vincular nuevo proveedor OAuth a la cuenta
 * @access  Private
 */
router.post('/providers/link', authMiddleware, AuthController.linkProvider);

/**
 * @route   DELETE /api/v1/auth/providers/:provider
 * @desc    Desvincular proveedor OAuth
 * @access  Private
 */
router.delete('/providers/:provider', authMiddleware, AuthController.unlinkProvider);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Cerrar sesión (Invalidar cookie)
 * @access  Public
 */
router.post('/logout', AuthController.logout);

module.exports = router;
