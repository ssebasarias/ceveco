/**
 * Auth Service (Frontend)
 * Gestión de autenticación y sesión
 */

const AuthService = {
    /**
     * Iniciar sesión
     */
    login: async (email, password, remember = false) => {
        try {
            const response = await window.API.post(
                window.CONSTANTS.API_PATHS.AUTH.LOGIN,
                { email, password, remember }
            );

            if (response.success) {
                // Guardar usuario en storage
                window.StorageUtils.setUser(response.user);

                // Disparar evento de login
                document.dispatchEvent(new CustomEvent(
                    window.CONSTANTS.CUSTOM_EVENTS.USER_LOGGED_IN,
                    { detail: response.user }
                ));
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Registro
     */
    register: async (userData) => {
        try {
            const response = await window.API.post(
                window.CONSTANTS.API_PATHS.AUTH.REGISTER,
                userData
            );

            if (response.success) {
                window.StorageUtils.setUser(response.user);
                document.dispatchEvent(new CustomEvent(
                    window.CONSTANTS.CUSTOM_EVENTS.USER_LOGGED_IN,
                    { detail: response.user }
                ));
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cerrar sesión
     */
    logout: async () => {
        try {
            // Intentar logout en backend (opcional pero recomendado)
            await window.API.post(window.CONSTANTS.API_PATHS.AUTH.LOGOUT).catch(() => { });

            // Limpiar datos locales
            window.StorageUtils.removeUser();
            window.StorageUtils.remove('jwt_token'); // Por si acaso

            // Disparar evento
            document.dispatchEvent(new CustomEvent(
                window.CONSTANTS.CUSTOM_EVENTS.USER_LOGGED_OUT
            ));

            // Redirigir a login o home
            window.location.href = '/pages/login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    /**
     * Login con OAuth (Google, etc)
     */
    oauthLogin: async (provider, payload) => {
        try {
            const response = await window.API.post(
                window.CONSTANTS.API_PATHS.AUTH.OAUTH,
                { provider, ...payload }
            );

            if (response.success) {
                window.StorageUtils.setUser(response.user);
                document.dispatchEvent(new CustomEvent(
                    window.CONSTANTS.CUSTOM_EVENTS.USER_LOGGED_IN,
                    { detail: response.user }
                ));
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtener usuario actual (sincronizado)
     */
    getCurrentUser: () => {
        return window.StorageUtils.getUser();
    },

    /**
     * Verificar si está autenticado
     */
    isAuthenticated: () => {
        return !!window.StorageUtils.getUser();
    },

    /**
     * Refrescar perfil desde backend
     */
    refreshProfile: async () => {
        try {
            const response = await window.API.get(window.CONSTANTS.API_PATHS.AUTH.PROFILE);
            if (response.success) {
                window.StorageUtils.setUser(response.user);
                document.dispatchEvent(new CustomEvent(
                    window.CONSTANTS.CUSTOM_EVENTS.PROFILE_UPDATED,
                    { detail: response.user }
                ));
            }
            return response.user;
        } catch (error) {
            console.error('Profile refresh failed:', error);
            return null;
        }
    }
};

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.AuthService = AuthService;
}
