/**
 * Utilidades de Almacenamiento (LocalStorage/SessionStorage)
 * Manejo seguro de datos persistentes en el navegador
 */

const Storage = {
    /**
     * Guardar datos
     */
    set: (key, value, type = 'local') => {
        try {
            const storage = type === 'local' ? localStorage : sessionStorage;
            const serializedValue = JSON.stringify(value);
            storage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error(`Error guardando ${key} en storage:`, error);
            return false;
        }
    },

    /**
     * Obtener datos
     */
    get: (key, defaultValue = null, type = 'local') => {
        try {
            const storage = type === 'local' ? localStorage : sessionStorage;
            const serializedValue = storage.getItem(key);

            if (serializedValue === null) {
                return defaultValue;
            }

            return JSON.parse(serializedValue);
        } catch (error) {
            console.error(`Error obteniendo ${key} de storage:`, error);
            return defaultValue;
        }
    },

    /**
     * Eliminar datos
     */
    remove: (key, type = 'local') => {
        try {
            const storage = type === 'local' ? localStorage : sessionStorage;
            storage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error eliminando ${key} de storage:`, error);
            return false;
        }
    },

    /**
     * Limpiar todo
     */
    clear: (type = 'local') => {
        try {
            const storage = type === 'local' ? localStorage : sessionStorage;
            storage.clear();
            return true;
        } catch (error) {
            console.error('Error limpiando storage:', error);
            return false;
        }
    },

    /**
     * Verificar si existe una key
     */
    has: (key, type = 'local') => {
        const storage = type === 'local' ? localStorage : sessionStorage;
        return storage.getItem(key) !== null;
    },

    /**
     * Helpers específicos para el proyecto
     */

    // Auth Token
    getToken: () => {
        // Buscar en cookies primero (para compatibilidad con backend)
        const match = document.cookie.match(new RegExp('(^| )jwt_token=([^;]+)'));
        if (match) return match[2];

        // Fallback a localStorage (si se decide usar storage en lugar de cookie httpOnly)
        return Storage.get('jwt_token');
    },

    setToken: (token) => {
        // Set cookie manually for basic frontend access
        document.cookie = `jwt_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
        return Storage.set('jwt_token', token);
    },


    // User Data
    getUser: () => {
        return Storage.get(window.CONSTANTS?.STORAGE_KEYS?.USER_SESSION || 'ceveco_user');
    },

    setUser: (user) => {
        return Storage.set(window.CONSTANTS?.STORAGE_KEYS?.USER_SESSION || 'ceveco_user', user);
    },

    removeUser: () => {
        return Storage.remove(window.CONSTANTS?.STORAGE_KEYS?.USER_SESSION || 'ceveco_user');
    },

    // Carrito
    getCart: () => {
        return Storage.get(window.CONSTANTS?.STORAGE_KEYS?.CART || 'ceveco_cart', []);
    },

    setCart: (cart) => {
        return Storage.set(window.CONSTANTS?.STORAGE_KEYS?.CART || 'ceveco_cart', cart);
    },

    // Favoritos (cache local)
    getFavorites: () => {
        return Storage.get(window.CONSTANTS?.STORAGE_KEYS?.FAVORITES || 'ceveco_favorites', []);
    },

    setFavorites: (favorites) => {
        return Storage.set(window.CONSTANTS?.STORAGE_KEYS?.FAVORITES || 'ceveco_favorites', favorites);
    }
};

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.StorageUtils = Storage;
}
