/**
 * Configuración global de la aplicación
 */

const CONFIG = {
    // URL base de la API
    API_BASE_URL: 'http://localhost:3000/api/v1',

    // Endpoints de la API
    API_ENDPOINTS: {
        productos: '/productos',
        productoById: (id) => `/productos/${id}`,
        productosDestacados: '/productos/destacados',
        productosRelacionados: (id) => `/productos/${id}/relacionados`,
        productosBuscar: '/productos/buscar',
        productoStock: (id) => `/productos/${id}/stock`,
        categorias: '/categorias',
        marcas: '/marcas',
        sedes: '/sedes'
    },

    // Configuración de paginación
    PAGINATION: {
        defaultLimit: 12,
        maxLimit: 100
    },

    // Configuración de la aplicación
    APP: {
        nombre: 'Ceveco',
        whatsapp: '+573001234567',
        email: 'contacto@ceveco.com.co',
        telefono: '+57 (606) 859 1234'
    },

    // Configuración de localStorage
    STORAGE_KEYS: {
        cart: 'ceveco_cart',
        favorites: 'ceveco_favorites',
        user: 'ceveco_user'
    }
};

// Hacer CONFIG disponible globalmente
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
