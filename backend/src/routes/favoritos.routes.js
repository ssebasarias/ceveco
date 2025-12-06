const express = require('express');
const router = express.Router();
const FavoritosController = require('../controllers/favoritos.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Todas las rutas de favoritos requieren autenticación
router.use(authMiddleware);

/**
 * @route   GET /api/v1/favoritos
 * @desc    Obtener lista de favoritos del usuario
 * @access  Private
 */
router.get('/', FavoritosController.getList);

/**
 * @route   GET /api/v1/favoritos/ids
 * @desc    Obtener solo los IDs de productos favoritos (para marcar UI)
 * @access  Private
 */
router.get('/ids', FavoritosController.checkIds);

/**
 * @route   POST /api/v1/favoritos/toggle
 * @desc    Agregar o quitar de favoritos
 * @access  Private
 * @body    { productId: number }
 */
router.post('/toggle', FavoritosController.toggle);

module.exports = router;
