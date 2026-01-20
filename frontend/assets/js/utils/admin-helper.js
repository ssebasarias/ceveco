/**
 * Admin Helper Utilities
 * Funciones para verificar permisos de administrador y mostrar/ocultar controles CRUD
 */

/**
 * Verificar si el usuario actual es administrador
 * @returns {boolean}
 */
function isAdmin() {
    try {
        const user = window.AuthService?.getCurrentUser() || 
                     window.getCurrentUser?.() || 
                     window.StorageUtils?.getUser()?.user ||
                     window.StorageUtils?.getUser();
        
        if (!user) return false;
        
        // Verificar rol
        return user.rol === 'admin';
    } catch (error) {
        console.error('Error verificando rol admin:', error);
        return false;
    }
}

/**
 * Obtener token de autenticación para requests
 * @returns {string|null}
 */
function getAuthToken() {
    // Intentar obtener de StorageUtils primero (tiene mejor lógica de búsqueda)
    if (window.StorageUtils && typeof window.StorageUtils.getToken === 'function') {
        const token = window.StorageUtils.getToken();
        if (token) return token;
    }
    
    // Intentar obtener de cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'jwt_token' && value) {
            return value;
        }
    }
    
    // Intentar obtener de localStorage como fallback
    try {
        const token = localStorage.getItem('jwt_token');
        if (token) return token;
    } catch (error) {
        console.warn('Error accediendo a localStorage:', error);
    }
    
    // Intentar obtener de sessionStorage como último recurso
    try {
        const token = sessionStorage.getItem('jwt_token');
        if (token) return token;
    } catch (error) {
        console.warn('Error accediendo a sessionStorage:', error);
    }
    
    return null;
}

/**
 * Mostrar controles admin si el usuario es admin
 * @param {string} selector - Selector CSS de los elementos a mostrar
 */
function showAdminControls(selector) {
    if (isAdmin()) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.classList.remove('hidden');
            el.style.display = '';
        });
    }
}

/**
 * Ocultar controles admin
 * @param {string} selector - Selector CSS de los elementos a ocultar
 */
function hideAdminControls(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        el.classList.add('hidden');
        el.style.display = 'none';
    });
}

/**
 * Agregar clase admin a elementos si el usuario es admin
 * @param {string} selector - Selector CSS
 */
function addAdminClass(selector) {
    if (isAdmin()) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.classList.add('admin-mode'));
    }
}

// Exportar funciones globalmente
window.AdminHelper = {
    isAdmin,
    getAuthToken,
    showAdminControls,
    hideAdminControls,
    addAdminClass
};
