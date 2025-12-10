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

            if (response.success && response.user) {
                // Crear sesión con expiración
                const session = {
                    user: response.user,
                    expiresAt: new Date(Date.now() + (remember ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString() // 30 días o 24h
                };

                // Guardar sesión en storage
                window.StorageUtils.setUser(session);

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

            if (response.success && response.user) {
                const session = {
                    user: response.user,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                };

                window.StorageUtils.setUser(session);
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
            window.StorageUtils.remove('jwt_token');

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

            if (response.success && response.user) {
                const session = {
                    user: response.user,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                };

                window.StorageUtils.setUser(session);
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
     * Retorna solo el objeto usuario, extrayéndolo de la sesión si es necesario
     */
    getCurrentUser: () => {
        const session = window.StorageUtils.getUser();
        if (!session) return null;

        // Si tiene estructura de sesión, validar y retornar user
        if (session.user && session.expiresAt) {
            if (new Date(session.expiresAt) < new Date()) {
                window.StorageUtils.removeUser();
                return null;
            }
            return session.user;
        }

        // Si es el objeto usuario antiguo directo
        return session;
    },

    /**
     * Verificar si está autenticado
     */
    isAuthenticated: () => {
        return !!AuthService.getCurrentUser();
    },

    /**
     * Refrescar perfil desde backend
     */
    refreshProfile: async () => {
        try {
            const response = await window.API.get(window.CONSTANTS.API_PATHS.AUTH.PROFILE);
            if (response.success && response.user) {
                // Mantener expiración actual si existe, o crear nueva
                const currentSession = window.StorageUtils.getUser();
                const session = {
                    user: response.user,
                    expiresAt: (currentSession && currentSession.expiresAt)
                        ? currentSession.expiresAt
                        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                };

                window.StorageUtils.setUser(session);
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
    },

    /**
     * Solicitar recuperación de contraseña
     */
    forgotPassword: async (email) => {
        try {
            return await window.API.post('/api/v1/auth/forgot-password', { email });
        } catch (error) {
            throw error;
        }
    },

    /**
     * Restablecer contraseña con token
     */
    resetPassword: async (token, newPassword) => {
        try {
            return await window.API.post('/api/v1/auth/reset-password', {
                token,
                newPassword
            });
        } catch (error) {
            throw error;
        }
    }
};

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.AuthService = AuthService;
}
