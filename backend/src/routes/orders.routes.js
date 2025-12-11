const express = require('express');
const router = express.Router();
const OrdersController = require('../controllers/orders.controller');
const { authMiddleware, requireAdmin, optionalAuth } = require('../middleware');

// ============================================
// RUTAS DE USUARIO (Requieren Auth)
// ============================================

/**
 * @route   POST /api/v1/orders
 * @desc    Crear un nuevo pedido
 * @access  Public (Guest allowed)
 */
router.post('/', optionalAuth, OrdersController.createOrder);

/**
 * @route   GET /api/v1/orders
 * @desc    Obtener historial de pedidos del usuario autenticado
 * @access  Private
 */
router.get('/', authMiddleware, OrdersController.getUserOrders);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Obtener detalle de un pedido específico del usuario
 * @access  Private
 */
router.get('/:id', authMiddleware, OrdersController.getOrderById);

// ============================================
// RUTAS ADMINISTRATIVAS (Requieren Auth + Admin Role)
// ============================================

/**
 * @route   GET /api/v1/orders/admin/all
 * @desc    Obtener todas las órdenes del sistema (Admin)
 * @access  Private (Admin only)
 */
router.get('/admin/all', authMiddleware, requireAdmin, OrdersController.getAllOrders);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Actualizar estado de una orden (Admin)
 * @access  Private (Admin only)
 */
router.patch('/:id/status', authMiddleware, requireAdmin, OrdersController.updateOrderStatus);

/**
 * @route   DELETE /api/v1/orders/:id
 * @desc    Cancelar/Eliminar orden (Admin)
 * @access  Private (Admin only)
 */
router.delete('/:id', authMiddleware, requireAdmin, OrdersController.cancelOrder);

module.exports = router;
