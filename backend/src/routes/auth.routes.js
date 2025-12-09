const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
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
router.post('/register', authLimiter, AuthController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Iniciar sesión con email/contraseña
 * @access  Public
 */
router.post('/login', authLimiter, AuthController.login);

/**
 * @route   POST /api/v1/auth/oauth
 * @desc    Login/registro con OAuth (Google, Facebook, etc.)
 * @access  Public
 * @body    { provider, providerUid, email, nombre, apellido?, avatarUrl?, rawData? }
 */
router.post('/oauth', AuthController.oauthLogin);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Solicitar recuperación de contraseña
 * @access  Public
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Restablecer contraseña con token
 * @access  Public
 */
router.post('/reset-password', AuthController.resetPassword);

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
router.put('/change-password', authMiddleware, AuthController.changePassword);

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

module.exports = router;
