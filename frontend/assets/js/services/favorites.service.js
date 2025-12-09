/**
 * Favorites Service (Frontend)
 * Gestión de lista de deseos
 */

const FavoritesService = {
    /**
     * Obtener lista de favoritos
     */
    getAll: async () => {
        if (!window.AuthService.isAuthenticated()) return [];

        try {
            const response = await window.API.get(window.CONSTANTS.API_PATHS.FAVORITES.LIST);
            if (response.success) {
                // Actualizar cache local
                window.StorageUtils.setFavorites(response.data);
                return response.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }
    },

    /**
     * Obtener solo IDs (para marcar corazones en UI)
     */
    getIds: async () => {
        if (!window.AuthService.isAuthenticated()) return [];

        try {
            const response = await window.API.get(window.CONSTANTS.API_PATHS.FAVORITES.IDS);
            if (response.success) {
                return response.data;
            }
            return [];
        } catch (error) {
            return [];
        }
    },

    /**
     * Alternar favorito (Toggle)
     */
    toggle: async (productId) => {
        if (!window.AuthService.isAuthenticated()) {
            throw new Error(window.CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED);
        }

        try {
            const response = await window.API.post(window.CONSTANTS.API_PATHS.FAVORITES.TOGGLE, { productId });

            if (response.success) {
                // Disparar evento para actualizar UI inmediatamente
                document.dispatchEvent(new CustomEvent(
                    window.CONSTANTS.CUSTOM_EVENTS.FAVORITES_UPDATED,
                    { detail: { productId, action: response.action } }
                ));
            }
            return response;
        } catch (error) {
            console.error('Toggle favorite error:', error);
            throw error;
        }
    },

    /**
     * Verificar si un producto es favorito (localmente)
     */
    isFavorite: (productId) => {
        const favorites = window.StorageUtils.getFavorites() || [];
        // Si favorites es array de objetos o IDs, manejar ambos casos
        if (favorites.length > 0 && typeof favorites[0] === 'object') {
            return favorites.some(f => f.id_producto === productId);
        }
        return favorites.includes(productId);
    }
};

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.FavoritesService = FavoritesService;
}
