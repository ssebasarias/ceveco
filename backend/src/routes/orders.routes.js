const express = require('express');
const router = express.Router();
const OrdersController = require('../controllers/orders.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/v1/orders
 * @desc    Crear un nuevo pedido
 * @access  Private
 */
router.post('/', authMiddleware, OrdersController.createOrder);

/**
 * @route   GET /api/v1/orders
 * @desc    Obtener historial de pedidos del usuario
 * @access  Private
 */
router.get('/', authMiddleware, OrdersController.getUserOrders);

module.exports = router;
