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
}

module.exports = OrdersController;
