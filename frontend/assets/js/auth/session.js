import { AUTH_CONFIG } from './config.js';

export class SessionManager {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        this.restoreUser();
    }

    restoreUser() {
        const storedSession = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
        if (storedSession) {
            try {
                const session = JSON.parse(storedSession);
                if (session.user) {
                    this.currentUser = session.user;
                }
            } catch (e) {
                console.error('Error recovering session:', e);
                // Don't clear here, let verifyToken handle validity
            }
        }
    }

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

    clearSession() {
        // Clear LocalStorage
        localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        localStorage.removeItem('cevecoCart'); // Clear cart as requested in prompt analysis

        // Clear SessionStorage (User specific data)
        sessionStorage.clear();

        this.currentUser = null;
        this.token = null;
    }

    getToken() {
        return this.token;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null && this.token !== null;
    }
}
