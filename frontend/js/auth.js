/**
 * Authentication Module
 * Maneja el registro, login y gestión de sesiones de usuario
 */

// Configuración de autenticación
const AUTH_CONFIG = {
    SESSION_KEY: 'ceveco_user_session',
    TOKEN_KEY: 'ceveco_auth_token',
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
};

/**
 * Clase para manejar la autenticación
 */
class AuthManager {
    constructor() {
        this.currentUser = this.loadSession();
    }

    /**
     * Registrar nuevo usuario
     */
    async register(userData) {
        try {
            // En producción, esto haría una llamada al backend
            // Por ahora, simulamos el registro guardando en localStorage

            const user = {
                id: Date.now(),
                nombre: userData.nombre,
                email: userData.email,
                telefono: userData.telefono,
                createdAt: new Date().toISOString(),
            };

            // Guardar usuario (en producción esto iría al backend)
            const users = this.getStoredUsers();

            // Verificar si el email ya existe
            if (users.find(u => u.email === userData.email)) {
                throw new Error('Este email ya está registrado');
            }

            // Guardar contraseña hasheada (en producción usar bcrypt en backend)
            user.passwordHash = this.simpleHash(userData.password);
            users.push(user);
            localStorage.setItem('ceveco_users', JSON.stringify(users));

            // Crear sesión automáticamente
            this.createSession(user);

            return {
                success: true,
                user: this.sanitizeUser(user),
            };
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    /**
     * Iniciar sesión
     */
    async login(credentials) {
        try {
            const users = this.getStoredUsers();
            const user = users.find(u => u.email === credentials.email);

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar contraseña
            const passwordHash = this.simpleHash(credentials.password);
            if (user.passwordHash !== passwordHash) {
                throw new Error('Contraseña incorrecta');
            }

            // Crear sesión
            this.createSession(user, credentials.remember);

            return {
                success: true,
                user: this.sanitizeUser(user),
            };
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    /**
     * Cerrar sesión
     */
    logout() {
        localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        this.currentUser = null;
        window.location.href = 'index.html';
    }

    /**
     * Crear sesión de usuario
     */
    createSession(user, remember = false) {
        const session = {
            user: this.sanitizeUser(user),
            token: this.generateToken(),
            expiresAt: remember
                ? new Date(Date.now() + 30 * AUTH_CONFIG.SESSION_DURATION).toISOString()
                : new Date(Date.now() + AUTH_CONFIG.SESSION_DURATION).toISOString(),
        };

        localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, session.token);
        this.currentUser = session.user;
    }

    /**
     * Cargar sesión guardada
     */
    loadSession() {
        try {
            const sessionData = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
            if (!sessionData) return null;

            const session = JSON.parse(sessionData);

            // Verificar si la sesión ha expirado
            if (new Date(session.expiresAt) < new Date()) {
                this.logout();
                return null;
            }

            return session.user;
        } catch (error) {
            console.error('Error cargando sesión:', error);
            return null;
        }
    }

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Obtener usuario actual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Obtener usuarios almacenados (solo para demo)
     */
    getStoredUsers() {
        try {
            const users = localStorage.getItem('ceveco_users');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Sanitizar datos de usuario (remover información sensible)
     */
    sanitizeUser(user) {
        const { passwordHash, ...sanitized } = user;
        return sanitized;
    }

    /**
     * Generar token simple (en producción usar JWT)
     */
    generateToken() {
        return 'token_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
    }

    /**
     * Hash simple de contraseña (en producción usar bcrypt en backend)
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    /**
     * Actualizar perfil de usuario
     */
    async updateProfile(updates) {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('Usuario no autenticado');
            }

            const users = this.getStoredUsers();
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);

            if (userIndex === -1) {
                throw new Error('Usuario no encontrado');
            }

            // Actualizar datos
            users[userIndex] = { ...users[userIndex], ...updates };
            localStorage.setItem('ceveco_users', JSON.stringify(users));

            // Actualizar sesión
            this.createSession(users[userIndex]);

            return {
                success: true,
                user: this.sanitizeUser(users[userIndex]),
            };
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            throw error;
        }
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

/**
 * Actualizar UI basado en estado de autenticación
 */
function updateAuthUI() {
    const user = getCurrentUser();
    const userButton = document.querySelector('[data-auth-button]');

    if (!userButton) return;

    if (user) {
        // Usuario autenticado - mostrar menú de usuario
        userButton.innerHTML = `
            <div class="relative group">
                <button class="flex items-center gap-2 hover:text-primary transition-colors">
                    <i data-lucide="user" class="w-6 h-6"></i>
                    <span class="hidden lg:inline font-medium">${user.nombre.split(' ')[0]}</span>
                    <i data-lucide="chevron-down" class="w-4 h-4 hidden lg:inline"></i>
                </button>
                
                <!-- Dropdown Menu -->
                <div class="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
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
        // Usuario no autenticado - mostrar botón de login
        userButton.innerHTML = `
            <a href="login.html" class="hover:text-primary transition-colors" title="Iniciar Sesión">
                <i data-lucide="user" class="w-6 h-6"></i>
            </a>
        `;
    }

    // Reinicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Ejecutar al cargar la página
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', updateAuthUI);
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        authManager,
        handleRegistro,
        handleLogin,
        handleLogout,
        isUserAuthenticated,
        getCurrentUser,
        updateAuthUI,
    };
}
