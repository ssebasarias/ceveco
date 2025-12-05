/**
 * Cliente API para comunicación con el backend
 */

class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    /**
     * Realizar petición HTTP
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} options - Opciones de fetch
     * @returns {Promise<Object>} Respuesta de la API
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('Error en API request:', error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Crear instancia del cliente API
const api = new ApiClient(CONFIG.API_BASE_URL);

/**
 * Servicios de la API
 */
const ProductosAPI = {
    /**
     * Obtener todos los productos con filtros
     */
    async getAll(filters = {}) {
        return api.get(CONFIG.API_ENDPOINTS.productos, filters);
    },

    /**
     * Obtener producto por ID
     */
    async getById(id) {
        return api.get(CONFIG.API_ENDPOINTS.productoById(id));
    },

    /**
     * Obtener productos destacados
     */
    async getDestacados(limit = 8) {
        return api.get(CONFIG.API_ENDPOINTS.productosDestacados, { limit });
    },

    /**
     * Obtener productos relacionados
     */
    async getRelacionados(id, limit = 4) {
        return api.get(CONFIG.API_ENDPOINTS.productosRelacionados(id), { limit });
    },

    /**
     * Buscar productos
     */
    async buscar(query, options = {}) {
        return api.get(CONFIG.API_ENDPOINTS.productosBuscar, { q: query, ...options });
    },

    /**
     * Verificar stock
     */
    async verificarStock(id, cantidad = 1) {
        return api.get(CONFIG.API_ENDPOINTS.productoStock(id), { cantidad });
    }
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.api = api;
    window.ProductosAPI = ProductosAPI;
}
