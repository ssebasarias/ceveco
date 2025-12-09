import { AUTH_CONFIG } from './config.js';
import { SessionManager } from './session.js';

export class AuthManager {
    constructor() {
        this.sessionManager = new SessionManager();
        // Init is called manually or by the consumer
    }

    async init() {
        // We rely on verifyToken to check if the httpOnly cookie is valid
        if (this.sessionManager.getCurrentUser()) {
            try {
                await this.verifyToken();
            } catch (error) {
                console.log('Sesión inválida o expirada');
                this.sessionManager.clearSession();
            }
        }
    }

    async verifyToken() {
        // No headers needed, browser sends cookie automatically
        const response = await fetch(`${AUTH_CONFIG.API_URL}/verify`, {
            credentials: 'include' // Needed for HttpOnly cookies
        });

        if (!response.ok) throw new Error('Token inválido');

        const data = await response.json();
        const user = data.data.user;
        // Update user in session (without overwriting token if not provided)
        this.sessionManager.currentUser = user;
        return user;
    }

    async register(userData) {
        try {
            const response = await fetch(`${AUTH_CONFIG.API_URL}/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password,
                    nombre: userData.nombre,
                    apellido: userData.apellido || null,
                    telefono: userData.telefono || null
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error en registro');

            this.sessionManager.saveSession(data.data.user);
            return { success: true, user: data.data.user };
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    async login(credentials) {
        try {
            const response = await fetch(`${AUTH_CONFIG.API_URL}/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                    remember: credentials.remember || false
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Credenciales inválidas');

            this.sessionManager.saveSession(data.data.user);
            return { success: true, user: data.data.user };
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    async loginWithOAuth(oauthData) {
        try {
            const response = await fetch(`${AUTH_CONFIG.API_URL}/oauth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(oauthData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error en autenticación OAuth');

            this.sessionManager.saveSession(data.data.user);
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

    // Google Login Logic
    async loginWithGoogle() {
        return new Promise((resolve, reject) => {
            if (typeof google === 'undefined' || !google.accounts) {
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

    initGoogleLogin(resolve, reject) {
        // Obtener Client ID de la configuración global
        const GOOGLE_CLIENT_ID = window.CONFIG?.OAUTH?.GOOGLE_CLIENT_ID;

        // Check if Client ID is configured
        if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('TU_GOOGLE') || GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE')) {
            console.warn('⚠️ Google Client ID no configurado. Usando Mock Login para desarrollo.');

            // Simular login exitoso para pruebas
            const mockUser = {
                provider: 'google',
                providerUid: `mock_google_${Date.now()}`,
                email: `usuario_demo_${Math.floor(Math.random() * 1000)}@gmail.com`,
                nombre: 'Usuario',
                apellido: 'Demo',
                avatarUrl: null
            };

            this.loginWithOAuth(mockUser)
                .then(resolve)
                .catch(reject);
            return;
        }

        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
                try {
                    const payload = this.decodeJWT(response.credential);
                    const result = await this.loginWithOAuth({
                        provider: 'google',
                        providerUid: payload.sub,
                        email: payload.email,
                        nombre: payload.name,
                        apellido: payload.family_name || null,
                        avatarUrl: payload.picture,
                        rawData: payload,
                        idToken: response.credential // Send raw token for backend verification
                    });
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }
        });

        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                const btn = document.getElementById('google-signin-button');
                if (btn) google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large', text: 'signin_with' });
            }
        });
    }

    decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    }

    async logout() {
        try {
            await fetch(`${AUTH_CONFIG.API_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {
            console.error('Error logout API', e);
        }

        this.sessionManager.clearSession();

        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }

        // Smart Redirect
        const isPagesDir = window.location.pathname.includes('/pages/');
        const loginPath = isPagesDir ? 'login.html' : 'pages/login.html';

        console.log('Redirecting to:', loginPath);
        window.location.href = loginPath;
    }

    logoutUser() {
        this.logout();
    }

    // Proxy methods
    getToken() { return this.sessionManager.getToken(); }
    getCurrentUser() { return this.sessionManager.getCurrentUser(); }
    isAuthenticated() { return this.sessionManager.isAuthenticated(); }
}
