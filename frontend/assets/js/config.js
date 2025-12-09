/**
 * Configuración Frontend (Legacy Adapter)
 * Mantiene compatibilidad con código existente mientras migra a nueva estructura
 */

const CONFIG = {
    // URL base (sincronizada con nuevas constantes)
    API_BASE_URL: '/api/v1',

    // Endpoints (Referencia a constantes nuevas para evitar duplicación)
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

    // Paginación
    PAGINATION: {
        defaultLimit: 12,
        maxLimit: 100
    },

    // App Info
    APP: {
        nombre: 'Ceveco',
        whatsapp: '+573001234567',
        email: 'contacto@ceveco.com.co',
        telefono: '+57 (606) 859 1234'
    },

    // Storage Keys (Referencia a constantes nuevas)
    STORAGE_KEYS: {
        cart: 'ceveco_cart',
        favorites: 'ceveco_favorites',
        user: 'ceveco_user'
    },

    // OAuth
    OAUTH: {
        GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com'
    }
};

// Exponer globalmente y sincronizar con nuevas estructuras si existen
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;

    // Si CONSTANTS ya cargó, podríamos fusionar o validar
    if (window.CONSTANTS) {
        console.log('✅ Sistema de constantes cargado correctamente');
    }
}
