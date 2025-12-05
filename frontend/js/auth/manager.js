import { AUTH_CONFIG } from './config.js';
import { SessionManager } from './session.js';

export class AuthManager {
    constructor() {
        this.sessionManager = new SessionManager();
        // Init is called manually or by the consumer
    }

    async init() {
        if (this.sessionManager.getToken()) {
            try {
                await this.verifyToken();
            } catch (error) {
                console.log('Token inválido, sesión cerrada');
                this.sessionManager.clearSession();
            }
        }
    }

    async verifyToken() {
        const response = await fetch(`${AUTH_CONFIG.API_URL}/verify`, {
            headers: {
                'Authorization': `Bearer ${this.sessionManager.getToken()}`
            }
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

            this.sessionManager.saveSession(data.data.user, data.data.token);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                    remember: credentials.remember || false
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Credenciales inválidas');

            this.sessionManager.saveSession(data.data.user, data.data.token);
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

            this.sessionManager.saveSession(data.data.user, data.data.token);
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
        const GOOGLE_CLIENT_ID = window.GOOGLE_CLIENT_ID || 'TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
        if (GOOGLE_CLIENT_ID.includes('TU_GOOGLE')) {
            console.warn('⚠️ Configura GOOGLE_CLIENT_ID en tu aplicación');
            reject(new Error('Google Client ID no configurado.'));
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
                        rawData: payload
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

    logout() {
        this.sessionManager.clearSession();
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }
        window.location.href = 'index.html';
    }

    // Proxy methods
    getToken() { return this.sessionManager.getToken(); }
    getCurrentUser() { return this.sessionManager.getCurrentUser(); }
    isAuthenticated() { return this.sessionManager.isAuthenticated(); }
}
