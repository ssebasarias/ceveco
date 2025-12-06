
// Cache para templates de menú
const UserMenuTemplates = {
    guest: null,
    auth: null
};

// Cargar templates
// Cargar templates
async function loadUserMenuTemplates() {
    if (UserMenuTemplates.guest && UserMenuTemplates.auth) return;

    // Determine base path based on current location
    const isPagesDir = window.location.pathname.includes('/pages/');
    const basePath = isPagesDir ? '../components/' : './components/';

    // If we are in the root frontend folder (e.g. /frontend/index.html), it might be ./components/
    // If we are served from root (e.g. localhost:3000/index.html mapping to frontend/index.html), it depends on server config.
    // Safest strategy: Try relative, if fail, try absolute or adjust.
    // For now, let's assume standard structure:
    // /frontend/pages/x.html -> ../components/
    // /frontend/index.html -> ./components/

    const getPath = (file) => `${basePath}${file}`;

    try {
        const [guest, auth] = await Promise.all([
            fetch(getPath('user-menu-guest.html')).then(r => r.ok ? r.text() : null),
            fetch(getPath('user-menu-auth.html')).then(r => r.ok ? r.text() : null)
        ]);

        // Retry with alternative path if null (simple fallback)
        if (!guest && !isPagesDir) {
            // Maybe we are in /frontend/ but components are in ./components
            // Or maybe we are in root and need frontend/components
            // Not overcomplicating now, assuming the proposed fix covers the reported context (sedes.html is in pages/)
        }

        UserMenuTemplates.guest = guest;
        UserMenuTemplates.auth = auth;
    } catch (error) {
        console.error('Error loading user menu templates:', error);
    }
}

/**
 * Actualizar UI basado en el usuario actual
 * @param {Object|null} user - El objeto usuario o null si no hay sesión
 */
export async function updateAuthUI(user) {
    const userMenuContainer = document.getElementById('user-menu-container');
    const userButton = document.querySelector('[data-auth-button]');

    // Buscar el contenedor correcto
    const container = userMenuContainer || userButton;
    if (!container) {
        console.warn('User menu container not found');
        return;
    }

    // Asegurar templates cargados
    await loadUserMenuTemplates();

    if (user) {
        renderAuthMenu(container, user);
    } else {
        renderGuestMenu(container);
    }

    // Gestionar visibilidad de Favoritos
    const favLink = document.getElementById('favorites-link');
    if (favLink) {
        if (user) {
            favLink.classList.remove('hidden');
        } else {
            favLink.classList.add('hidden');
        }
    }

    // Reinicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderAuthMenu(container, user) {
    // Usuario autenticado
    if (UserMenuTemplates.auth) {
        const avatarHtml = user.avatar_url
            ? `<img src="${user.avatar_url}" alt="${user.nombre}" class="w-6 h-6 rounded-full object-cover">`
            : `<i data-lucide="user" class="w-6 h-6"></i>`;

        const userName = user.nombre ? user.nombre.split(' ')[0] : 'Usuario';

        container.innerHTML = UserMenuTemplates.auth
            .replace('{{avatar_html}}', avatarHtml)
            .replace('{{user_name}}', userName);

        // Attach event listeners

        // 1. Toggle Button
        const toggleBtn = container.querySelector('#user-menu-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleUserMenu();
            });
        }

        // 2. Logout Button
        // Use setTimeout to ensure DOM is ready if there's any weird timing, though innerHTML is sync.
        // Just for safety in case of render queuing. But sync is better.
        const logoutBtn = container.querySelector('#logout-btn');
        if (logoutBtn) {
            console.log('Logout button found, attaching listener');
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Stop menu from potentially closing or other handlers interference
                console.log('Logout button clicked');

                if (typeof window.handleLogout === 'function') {
                    window.handleLogout();
                } else if (window.authManager) {
                    console.log('Using fallback authManager.logout');
                    window.authManager.logout();
                } else {
                    console.error('CRITICAL: No logout handler available');
                    window.location.href = 'login.html';
                }
            });
        } else {
            console.error('CRITICAL: Logout button NOT found in template injection');
        }

    } else {
        // Fallback
        container.innerHTML = `<button id="user-menu-fallback" class="flex items-center gap-2"><span>${user.nombre}</span></button>`;
        document.getElementById('user-menu-fallback')?.addEventListener('click', toggleUserMenu);
    }
}

export function renderGuestMenu(container) {
    // Usuario no autenticado
    if (UserMenuTemplates.guest) {
        container.innerHTML = UserMenuTemplates.guest;

        // Attach event listeners
        document.getElementById('user-menu-toggle')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleUserMenu();
        });
        document.getElementById('google-login-btn')?.addEventListener('click', (e) => {
            if (window.loginWithGoogle) window.loginWithGoogle();
        });
    } else {
        // Fallback
        container.innerHTML = `<a href="login.html">Iniciar Sesión</a>`;
    }
}

export function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Global click listener for closing menu
export function initGlobalListeners() {
    document.addEventListener('click', (e) => {
        const container = document.getElementById('user-dropdown-container');
        const dropdown = document.getElementById('user-dropdown');

        // Check if click was inside the toggle button itself (to avoid closing immediately after opening)
        // Note: The toggle button usually has onclick="toggleUserMenu()", which runs before this listener.
        // We need to ensure we don't double-toggle or close it immediately.
        // Actually, preventing immediate close usually requires checking if target is the button.

        // But here the button calls toggleUserMenu.
        // If we want to close when clicking OUTSIDE:
        if (container && dropdown && !container.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
}
