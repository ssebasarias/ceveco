import { AUTH_CONFIG } from '../auth/config.js';

export const FavoritosAPI = {

    /**
     * Alternar favorito (Toggle)
     * @param {number} productId 
     */
    async toggle(productId) {
        const token = localStorage.getItem('ceveco_auth_token');
        if (!token) {
            console.error('No token found - user not authenticated');
            throw new Error('Usuario no autenticado');
        }

        console.log('Sending toggle request for product:', productId);

        const response = await fetch(`${AUTH_CONFIG.API_URL.replace('/auth', '')}/favoritos/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Toggle failed:', error);
            throw new Error(error.message || 'Error al actualizar favoritos');
        }

        const result = await response.json();
        console.log('Toggle result:', result);
        return result;
    },

    /**
     * Obtener listado de favoritos
     */
    async getList() {
        const token = localStorage.getItem('ceveco_auth_token');
        if (!token) return { success: true, data: [] }; // Empty if not logged in

        const response = await fetch(`${AUTH_CONFIG.API_URL.replace('/auth', '')}/favoritos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error al obtener favoritos');
        return await response.json();
    },

    /**
     * Obtener IDs de favoritos (para marcar UI)
     */
    async getIds() {
        const token = localStorage.getItem('ceveco_auth_token');
        if (!token) return [];

        try {
            const response = await fetch(`${AUTH_CONFIG.API_URL.replace('/auth', '')}/favoritos/ids`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.ids || [];
            }
            return [];
        } catch (e) {
            console.error('Error fetching favorite IDs', e);
            return [];
        }
    }
};
