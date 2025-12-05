/**
 * Authentication Module
 * Maneja el registro, login, OAuth y gestión de sesiones de usuario
 * Conecta con el backend API
 */

// Configuración de autenticación
const AUTH_CONFIG = {
    API_URL: 'http://localhost:3000/api/v1/auth',
    SESSION_KEY: 'ceveco_user_session',
    TOKEN_KEY: 'ceveco_auth_token',
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
};

/**
 * Clase para manejar la autenticación
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        this.init();
    }

    /**
     * Inicializar - verificar token existente
     */
    async init() {
        if (this.token) {
            try {
                await this.verifyToken();
            } catch (error) {
                console.log('Token inválido, sesión cerrada');
                this.clearSession();
            }
        }
        updateAuthUI();
    }

    /**
     * Verificar token con el backend
     */
    async verifyToken() {
        const response = await fetch(`${AUTH_CONFIG.API_URL}/verify`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (!response.ok) {
            throw new Error('Token inválido');
        }

        const data = await response.json();
        this.currentUser = data.data.user;
        return data.data.user;
    }

    /**
     * Registrar nuevo usuario
     */
    async register(userData) {
        try {
            const response = await fetch(`${AUTH_CONFIG.API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password,
                    nombre: userData.nombre,
                    apellido: userData.apellido || null,
                    telefono: userData.telefono || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en registro');
            }

            // Guardar sesión
            this.saveSession(data.data.user, data.data.token);

            return {
                success: true,
                user: data.data.user
            };
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    /**
     * Iniciar sesión con email/contraseña
     */
    async login(credentials) {
        try {
            const response = await fetch(`${AUTH_CONFIG.API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                    remember: credentials.remember || false
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Credenciales inválidas');
            }

            // Guardar sesión
            this.saveSession(data.data.user, data.data.token);

            return {
                success: true,
                user: data.data.user
            };
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    /**
     * Login con OAuth (Google, Facebook, etc.)
     * @param {Object} oauthData - Datos del proveedor OAuth
     */
    async loginWithOAuth(oauthData) {
        try {
            const response = await fetch(`${AUTH_CONFIG.API_URL}/oauth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(oauthData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en autenticación OAuth');
            }

            // Guardar sesión
            this.saveSession(data.data.user, data.data.token);

            return {
                success: true,
                user: data.data.user,
                isNewUser: data.data.isNewUser
            };
        } catch (error) {
            console.error('Error en OAuth login:', error);
            throw error;
        }
    }

    /**
     * Login con Google usando Google Identity Services
     */
    async loginWithGoogle() {
        return new Promise((resolve, reject) => {
            // Verificar que Google Identity Services esté cargado
            if (typeof google === 'undefined' || !google.accounts) {
                // Intentar cargar dinámicamente
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.onload = () => this.initGoogleLogin(resolve, reject);
                script.onerror = () => reject(new Error('No se pudo cargar Google Sign-In'));
                document.head.appendChild(script);
            } else {
                this.initGoogleLogin(resolve, reject);
            }
        });
    }

    /**
     * Inicializar login de Google
     */
    initGoogleLogin(resolve, reject) {
        // Necesitas configurar tu Client ID de Google Cloud Console
        const GOOGLE_CLIENT_ID = window.GOOGLE_CLIENT_ID || 'TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

        if (GOOGLE_CLIENT_ID.includes('TU_GOOGLE')) {
            console.warn('⚠️ Configura GOOGLE_CLIENT_ID en tu aplicación');
            reject(new Error('Google Client ID no configurado. Configura GOOGLE_CLIENT_ID en el código.'));
            return;
        }

        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
                try {
                    // Decodificar el JWT de Google para obtener los datos del usuario
                    const payload = this.decodeJWT(response.credential);

                    // Enviar datos al backend
                    const result = await this.loginWithOAuth({
                        provider: 'google',
                        providerUid: payload.sub,
                        email: payload.email,
                        nombre: payload.name,
                        apellido: payload.family_name || null,
                        avatarUrl: payload.picture,
                        rawData: payload
                    });

                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }
        });

        // Mostrar el popup de Google
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Si no se puede mostrar el popup, usar el botón de Google
                google.accounts.id.renderButton(
                    document.getElementById('google-signin-button') || document.body,
                    { theme: 'outline', size: 'large', text: 'signin_with' }
                );
            }
        });
    }

    /**
     * Decodificar JWT (solo para obtener payload, no para verificar)
     */
    decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decodificando JWT:', error);
            return null;
        }
    }

    /**
     * Cerrar sesión
     */
    logout() {
        this.clearSession();
        // Revocar sesión de Google si está activa
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }
        window.location.href = 'index.html';
    }

    /**
     * Guardar sesión
     */
    saveSession(user, token) {
        this.currentUser = user;
        this.token = token;

        const session = {
            user,
            token,
            expiresAt: new Date(Date.now() + AUTH_CONFIG.SESSION_DURATION).toISOString()
        };

        localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    }

    /**
     * Limpiar sesión
     */
    clearSession() {
        localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        this.currentUser = null;
        this.token = null;
    }

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated() {
        return this.currentUser !== null && this.token !== null;
    }

    /**
     * Obtener usuario actual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Obtener token actual
     */
    getToken() {
        return this.token;
    }

    /**
     * Obtener perfil completo del usuario
     */
    async getProfile() {
        if (!this.token) {
            throw new Error('No autenticado');
        }

        const response = await fetch(`${AUTH_CONFIG.API_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener perfil');
        }

        const data = await response.json();
        return data.data;
    }

    /**
     * Actualizar perfil de usuario
     */
    async updateProfile(updates) {
        if (!this.token) {
            throw new Error('No autenticado');
        }

        const response = await fetch(`${AUTH_CONFIG.API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al actualizar perfil');
        }

        const data = await response.json();

        // Actualizar usuario en sesión local
        this.currentUser = { ...this.currentUser, ...data.data.user };
        const session = JSON.parse(localStorage.getItem(AUTH_CONFIG.SESSION_KEY));
        session.user = this.currentUser;
        localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session));

        return {
            success: true,
            user: data.data.user
        };
    }

    /**
     * Cambiar contraseña
     */
    async changePassword(currentPassword, newPassword) {
        if (!this.token) {
            throw new Error('No autenticado');
        }

        const response = await fetch(`${AUTH_CONFIG.API_URL}/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al cambiar contraseña');
        }

        return { success: true };
    }

    /**
     * Solicitar recuperación de contraseña
     */
    async forgotPassword(email) {
        const response = await fetch(`${AUTH_CONFIG.API_URL}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        return data;
    }

    /**
     * Restablecer contraseña con token
     */
    async resetPassword(token, newPassword) {
        const response = await fetch(`${AUTH_CONFIG.API_URL}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, newPassword })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al restablecer contraseña');
        }

        return { success: true };
    }

    /**
     * Obtener proveedores OAuth vinculados
     */
    async getLinkedProviders() {
        if (!this.token) {
            throw new Error('No autenticado');
        }

        const response = await fetch(`${AUTH_CONFIG.API_URL}/providers`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener proveedores');
        }

        const data = await response.json();
        return data.data.providers;
    }

    /**
     * Vincular nuevo proveedor OAuth
     */
    async linkProvider(providerData) {
        if (!this.token) {
            throw new Error('No autenticado');
        }

        const response = await fetch(`${AUTH_CONFIG.API_URL}/providers/link`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(providerData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al vincular proveedor');
        }

        return { success: true };
    }

    /**
     * Desvincular proveedor OAuth
     */
    async unlinkProvider(provider) {
        if (!this.token) {
            throw new Error('No autenticado');
        }

        const response = await fetch(`${AUTH_CONFIG.API_URL}/providers/${provider}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al desvincular proveedor');
        }

        return { success: true };
    }
}

// Instancia global del gestor de autenticación
const authManager = new AuthManager();

/**
 * Funciones helper para usar en las páginas
 */

// Manejar registro
async function handleRegistro(formData) {
    return await authManager.register(formData);
}

// Manejar login
async function handleLogin(credentials) {
    return await authManager.login(credentials);
}

// Manejar login con Google
async function loginWithGoogle() {
    try {
        const result = await authManager.loginWithGoogle();
        if (result.success) {
            if (result.isNewUser) {
                alert('¡Cuenta creada exitosamente con Google!');
            } else {
                alert('¡Bienvenido de nuevo!');
            }
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error en login con Google:', error);
        alert(error.message || 'Error al iniciar sesión con Google');
    }
}

// Cerrar sesión
function handleLogout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        authManager.logout();
    }
}

// Verificar autenticación
function isUserAuthenticated() {
    return authManager.isAuthenticated();
}

// Obtener usuario actual
function getCurrentUser() {
    return authManager.getCurrentUser();
}

// Obtener token de autenticación
function getAuthToken() {
    return authManager.getToken();
}

/**
 * Actualizar UI basado en estado de autenticación
 */
function updateAuthUI() {
    const user = getCurrentUser();
    const userMenuContainer = document.getElementById('user-menu-container');
    const userButton = document.querySelector('[data-auth-button]');

    // Buscar el contenedor correcto
    const container = userMenuContainer || userButton;
    if (!container) return;

    if (user) {
        // Usuario autenticado - mostrar menú de usuario con click toggle
        const avatarHtml = user.avatar_url
            ? `<img src="${user.avatar_url}" alt="${user.nombre}" class="w-8 h-8 rounded-full object-cover">`
            : `<i data-lucide="user" class="w-6 h-6"></i>`;

        container.innerHTML = `
            <div class="relative" id="user-dropdown-container">
                <button onclick="toggleUserMenu()" class="flex items-center gap-2 hover:text-primary transition-colors">
                    ${avatarHtml}
                    <span class="hidden lg:inline font-medium">${user.nombre.split(' ')[0]}</span>
                    <i data-lucide="chevron-down" class="w-4 h-4 hidden lg:inline"></i>
                </button>
                
                <!-- Dropdown Menu -->
                <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <a href="perfil.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        <i data-lucide="user" class="w-4 h-4 inline mr-2"></i>
                        Mi Perfil
                    </a>
                    <a href="pedidos.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        <i data-lucide="package" class="w-4 h-4 inline mr-2"></i>
                        Mis Pedidos
                    </a>
                    <hr class="my-2 border-gray-100">
                    <button onclick="handleLogout()" class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors">
                        <i data-lucide="log-out" class="w-4 h-4 inline mr-2"></i>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        `;
    } else {
        // Usuario no autenticado - mostrar opciones de login
        container.innerHTML = `
            <div class="relative" id="user-dropdown-container">
                <button onclick="toggleUserMenu()" class="flex items-center gap-1 hover:text-primary transition-colors">
                    <i data-lucide="user" class="w-6 h-6"></i>
                </button>
                
                <!-- Dropdown Menu para no autenticados -->
                <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-3 z-50">
                    <a href="login.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        <i data-lucide="log-in" class="w-4 h-4 inline mr-2"></i>
                        Iniciar Sesión
                    </a>
                    <a href="registro.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        <i data-lucide="user-plus" class="w-4 h-4 inline mr-2"></i>
                        Registrarse
                    </a>
                    <hr class="my-2 border-gray-100">
                    <button onclick="loginWithGoogle()" class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continuar con Google
                    </button>
                </div>
            </div>
        `;
    }

    // Reinicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Toggle del menú de usuario (para usuarios no autenticados)
 */
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Cerrar menú al hacer click fuera
document.addEventListener('click', (e) => {
    const container = document.getElementById('user-dropdown-container');
    const dropdown = document.getElementById('user-dropdown');

    if (container && dropdown && !container.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

// Ejecutar al cargar la página
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // updateAuthUI se llama automáticamente en el constructor de AuthManager
    });
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        authManager,
        handleRegistro,
        handleLogin,
        loginWithGoogle,
        handleLogout,
        isUserAuthenticated,
        getCurrentUser,
        getAuthToken,
        updateAuthUI,
    };
}
