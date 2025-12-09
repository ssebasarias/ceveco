const OrderModel = require('../models/order.model');

class OrdersController {

    // Crear un nuevo pedido
    static async createOrder(req, res) {
        try {
            const userId = req.user ? req.user.id : null; // Asumiendo middleware de auth

            // Si el usuario es null (ej: compra como invitado), el sistema actual requiere login.
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const orderData = req.body;

            // Validación básica
            if (!orderData.items || orderData.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El carrito está vacío'
                });
            }

            const newOrder = await OrderModel.create(userId, orderData);

            res.status(201).json({
                success: true,
                message: 'Pedido creado exitosamente',
                data: newOrder
            });

        } catch (error) {
            console.error('Error en createOrder:', error);
            res.status(500).json({
                success: false,
                message: 'Error al procesar el pedido',
                error: error.message
            });
        }
    }

    // Obtener historial de pedidos
    static async getUserOrders(req, res) {
        try {
            const userId = req.user.id;
            const orders = await OrderModel.findByUser(userId);

            res.json({
                success: true,
                data: orders
            });
        } catch (error) {
            console.error('Error en getUserOrders:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener pedidos'
            });
        }
    }

    // Obtener detalle de un pedido específico (usuario o admin)
    static async getOrderById(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            // TODO: Implementar OrderModel.findById() con validación de ownership
            // Solo el dueño o un admin pueden ver el pedido
            return res.status(501).json({
                success: false,
                message: 'Funcionalidad en desarrollo',
                info: 'Requiere implementar OrderModel.findById()'
            });

        } catch (error) {
            console.error('Error en getOrderById:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener pedido'
            });
        }
    }

    // ============================================
    // MÉTODOS ADMINISTRATIVOS
    // ============================================

    // Obtener todas las órdenes (Admin only)
    static async getAllOrders(req, res) {
        try {
            // Verificar que sea admin (el middleware ya lo hizo, pero por claridad)
            if (req.user.rol !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado'
                });
            }

            // TODO: Implementar OrderModel.findAll() con filtros y paginación
            return res.status(501).json({
                success: false,
                message: 'Funcionalidad en desarrollo',
                info: 'Requiere implementar OrderModel.findAll() para admin'
            });

        } catch (error) {
            console.error('Error en getAllOrders:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener órdenes'
            });
        }
    }

    // Actualizar estado de orden (Admin only)
    static async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            // Validar estado
            const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
            if (!estado || !estadosValidos.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
                });
            }

            // TODO: Implementar OrderModel.updateStatus()
            return res.status(501).json({
                success: false,
                message: 'Funcionalidad en desarrollo',
                info: 'Requiere implementar OrderModel.updateStatus()'
            });

        } catch (error) {
            console.error('Error en updateOrderStatus:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar estado'
            });
        }
    }

    // Cancelar orden (Admin only)
    static async cancelOrder(req, res) {
        try {
            const { id } = req.params;

            // TODO: Implementar OrderModel.cancel() o soft delete
            return res.status(501).json({
                success: false,
                message: 'Funcionalidad en desarrollo',
                info: 'Requiere implementar OrderModel.cancel()'
            });

        } catch (error) {
            console.error('Error en cancelOrder:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cancelar orden'
            });
        }
    }
}

module.exports = OrdersController;
