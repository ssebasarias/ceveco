/**
 * Orders Service (Frontend)
 * Gestión de pedidos
 */

const OrdersService = {
    /**
     * Crear pedido
     */
    createOrder: async (orderData) => {
        try {
            return await window.API.post(window.CONSTANTS.API_PATHS.ORDERS.CREATE, orderData);
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    /**
     * Obtener historial de pedidos
     */
    getUserOrders: async () => {
        try {
            const response = await window.API.get(window.CONSTANTS.API_PATHS.ORDERS.LIST);
            if (response.success) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    /**
     * Obtener detalle de pedido
     */
    getOrderById: async (id) => {
        try {
            return await window.API.get(window.CONSTANTS.API_PATHS.ORDERS.DETAIL(id));
        } catch (error) {
            console.error(`Error fetching order ${id}:`, error);
            throw error;
        }
    }
};

if (typeof window !== 'undefined') {
    window.OrdersService = OrdersService;
}
