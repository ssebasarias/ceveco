import { AuthManager } from './manager.js';
import * as UI from './ui.js';

// Instancia global
const authManager = new AuthManager();

// --- Global API Exposition (Backend Compatibility) ---

window.authManager = authManager;

window.handleRegistro = (formData) => authManager.register(formData);
window.handleLogin = (credentials) => authManager.login(credentials);

window.isUserAuthenticated = () => authManager.isAuthenticated();
window.getCurrentUser = () => authManager.getCurrentUser();
window.getAuthToken = () => authManager.getToken();

// UI Functions
window.toggleUserMenu = UI.toggleUserMenu;

// UI Update Wrapper
window.updateAuthUI = async () => {
    const user = authManager.getCurrentUser();
    await UI.updateAuthUI(user);
};

window.handleLogout = () => {
    console.log('handleLogout llamado');
    // Direct logout without confirmation for better UX response
    authManager.logout();
};

// Google Login Wrapper with UI Logic
window.loginWithGoogle = async () => {
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
};


// --- Initialization ---

async function init() {
    UI.initGlobalListeners();
    await authManager.init(); // Verifies token and updates session state

    // Try to update UI. If navbar isn't ready, wait for event.
    const container = document.getElementById('user-menu-container') || document.querySelector('[data-auth-button]');
    if (container) {
        window.updateAuthUI();
    } else {
        console.log('Auth: Navbar not ready, waiting for components:loaded event...');
        document.addEventListener('components:loaded', () => {
            console.log('Auth: components:loaded event received, updating UI');
            window.updateAuthUI();
        });
    }
}

// Run initialization
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}
