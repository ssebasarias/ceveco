import { AUTH_CONFIG } from './config.js';

export class SessionManager {
    constructor() {
        this.currentUser = null;
        // Token is now HttpOnly cookie, transparent to JS
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
            }
        }
    }

    saveSession(user) {
        this.currentUser = user;

        const session = {
            user,
            // token: No longer stored in local storage
            expiresAt: new Date(Date.now() + AUTH_CONFIG.SESSION_DURATION).toISOString()
        };

        localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session));
        // localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token); // REMOVED
    }

    clearSession() {
        // Clear LocalStorage
        localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        localStorage.removeItem('cevecoCart');

        // Clear SessionStorage
        sessionStorage.clear();

        this.currentUser = null;
    }

    // getToken() no longer returns anything useful for Authorization header
    getToken() {
        return null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        // We trust the local user state primarily, 
        // real verification happens via API calls returning 401
        return this.currentUser !== null;
    }
}
