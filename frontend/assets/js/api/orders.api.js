import { API_URL } from '../config.js';

export class OrdersAPI {
    static async create(orderData) {
        const token = localStorage.getItem('ceveco_auth_token');
        if (!token) throw new Error('Usuario no autenticado');

        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear el pedido');
        }

        return await response.json();
    }

    static async getAll() {
        const token = localStorage.getItem('ceveco_auth_token');
        if (!token) throw new Error('Usuario no autenticado');

        const response = await fetch(`${API_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener pedidos');
        }

        const data = await response.json();
        return data.data;
    }
}
