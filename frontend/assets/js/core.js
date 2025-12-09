/**
 * Core Bootstrapper
 * Inicializa los servicios y utilidades esenciales
 * Debe cargarse antes que app.js o cualquier lógica de página
 */

(function () {
    console.log('🚀 Ceveco Frontend Core Initializing...');

    // Verificar dependencias críticas
    const dependencies = [
        'CONSTANTS',
        'StorageUtils',
        'API',
        'AuthService',
        'ProductService',
        'FavoritesService',
        'OrdersService'
    ];

    let missing = [];

    // Pequeño delay para asegurar que otros scripts hayan cargado si usamos defer
    window.addEventListener('DOMContentLoaded', () => {
        dependencies.forEach(dep => {
            if (!window[dep]) {
                missing.push(dep);
            }
        });

        if (missing.length > 0) {
            console.warn('⚠️ Algunas dependencias del Core no estÃ¡n cargadas:', missing.join(', '));
            console.warn('AsegÃºrate de incluir los scripts en el orden correcto en tu HTML.');
        } else {
            console.log('✅ Core Services Ready');

            // Inicializar estado global si es necesario
            initializeGlobalState();
        }
    });

    function initializeGlobalState() {
        // Restaurar sesiÃ³n si existe token
        if (window.AuthService.isAuthenticated()) {
            // Refrescar perfil en segundo plano
            window.AuthService.refreshProfile().catch(() => {
                // Si falla (token expirado), hacer logout silencioso
                window.StorageUtils.removeUser();
            });
        }

        // Inicializar carrito desde storage si no estÃ¡ en memoria
        if (!window.cart) {
            window.cart = window.StorageUtils.getCart();
        }
    }

})();
