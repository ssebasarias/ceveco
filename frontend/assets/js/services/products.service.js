/**
 * Product Service (Frontend)
 * Gestión de productos y catálogo
 */

const ProductService = {
    /**
     * Obtener listado de productos con filtros
     */
    getAll: async (params = {}) => {
        try {
            return await window.API.get(window.CONSTANTS.API_PATHS.PRODUCTS.LIST, params);
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    /**
     * Obtener producto por ID
     */
    getById: async (id) => {
        try {
            return await window.API.get(window.CONSTANTS.API_PATHS.PRODUCTS.DETAIL(id));
        } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            throw error;
        }
    },

    /**
     * Buscar productos
     */
    search: async (query, additionalFilters = {}) => {
        try {
            const params = { q: query, ...additionalFilters };
            return await window.API.get(window.CONSTANTS.API_PATHS.PRODUCTS.SEARCH, params);
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    },

    /**
     * Obtener productos destacados
     */
    getFeatured: async (limit = 8) => {
        try {
            return await window.API.get(window.CONSTANTS.API_PATHS.PRODUCTS.FEATURED, { limit });
        } catch (error) {
            console.error('Error fetching featured products:', error);
            throw error;
        }
    },

    /**
     * Obtener productos relacionados
     */
    getRelated: async (id, limit = 4) => {
        try {
            return await window.API.get(window.CONSTANTS.API_PATHS.PRODUCTS.RELATED(id), { limit });
        } catch (error) {
            console.error(`Error fetching related for ${id}:`, error);
            throw error;
        }
    },

    /**
     * Verificar stock
     */
    checkStock: async (id, quantity = 1) => {
        try {
            return await window.API.get(window.CONSTANTS.API_PATHS.PRODUCTS.STOCK(id), { cantidad: quantity });
        } catch (error) {
            console.error('Stock check error:', error);
            throw error;
        }
    },

    /**
     * Obtener metadatos para filtros (marcas, categorías, etc)
     */
    getFilters: async (category) => {
        try {
            return await window.API.get(window.CONSTANTS.API_PATHS.PRODUCTS.FILTERS, { categoria: category });
        } catch (error) {
            console.error('Filter metadata error:', error);
            throw error;
        }
    },

    /**
     * Obtener marcas activas
     */
    getBrands: async () => {
        try {
            return await window.API.get(window.CONSTANTS.API_PATHS.MARCAS.LIST);
        } catch (error) {
            console.error('Error fetching brands:', error);
            throw error;
        }
    }
};

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.ProductService = ProductService;
}
