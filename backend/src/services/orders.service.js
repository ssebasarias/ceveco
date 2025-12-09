/**
 * Orders Service
 * Lógica de negocio para gestión de pedidos
 */

const OrderModel = require('../models/order.model');

class OrdersService {
    /**
     * Crear nuevo pedido
     */
    static async create(userId, orderData) {
        // Validación básica
        if (!orderData.items || orderData.items.length === 0) {
            throw new Error('El carrito está vacío');
        }

        // Validar que todos los items tengan datos requeridos
        for (const item of orderData.items) {
            if (!item.id_producto || !item.cantidad || !item.precio_unitario) {
                throw new Error('Datos de producto incompletos');
            }

            if (item.cantidad < 1) {
                throw new Error('La cantidad debe ser mayor a 0');
            }
        }

        // Crear pedido usando el modelo
        const newOrder = await OrderModel.create(userId, orderData);

        return newOrder;
    }

    /**
     * Obtener pedidos del usuario
     */
    static async getUserOrders(userId, filters = {}) {
        const { page = 1, limit = 10, estado } = filters;

        const orders = await OrderModel.findByUser(userId, {
            page,
            limit,
            estado
        });

        return orders;
    }

    /**
     * Obtener detalle de un pedido
     */
    static async getById(orderId, userId = null) {
        const order = await OrderModel.findById(orderId);

        if (!order) {
            throw new Error('Pedido no encontrado');
        }

        // Si se proporciona userId, verificar ownership (a menos que sea admin)
        if (userId && order.id_usuario !== userId) {
            throw new Error('No tienes permiso para ver este pedido');
        }

        return order;
    }

    /**
     * Actualizar estado de pedido (Admin)
     */
    static async updateStatus(orderId, nuevoEstado) {
        const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

        if (!estadosValidos.includes(nuevoEstado)) {
            throw new Error(`Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`);
        }

        // TODO: Implementar OrderModel.updateStatus()
        throw new Error('Funcionalidad pendiente de implementación');
    }

    /**
     * Cancelar pedido (Admin)
     */
    static async cancel(orderId, motivo = null) {
        // TODO: Implementar OrderModel.cancel()
        throw new Error('Funcionalidad pendiente de implementación');
    }

    /**
     * Obtener todas las órdenes (Admin)
     */
    static async getAll(filters = {}) {
        const { page = 1, limit = 20, estado, fechaDesde, fechaHasta } = filters;

        // TODO: Implementar OrderModel.findAll()
        throw new Error('Funcionalidad pendiente de implementación');
    }

    /**
     * Obtener estadísticas de órdenes (Admin)
     */
    static async getStats() {
        // TODO: Implementar estadísticas
        // - Total de órdenes
        // - Órdenes por estado
        // - Ventas totales
        // - Ventas del mes
        throw new Error('Funcionalidad pendiente de implementación');
    }
}

module.exports = OrdersService;
