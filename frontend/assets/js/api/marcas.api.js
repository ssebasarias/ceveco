// API base URL from config
const API_BASE = 'http://localhost:3000/api/v1';

const MarcasAPI = {
    /**
     * Obtener todas las marcas activas
     */
    async getActivas() {
        try {
            const response = await fetch(`${API_BASE}/marcas`);

            if (!response.ok) {
                throw new Error('Error al obtener marcas');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching brands:', error);
            return { success: false, data: [] };
        }
    }
};

// Export for use in HTML
window.MarcasAPI = MarcasAPI;
