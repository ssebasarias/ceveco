
// Cache para templates de menú
const UserMenuTemplates = {
    guest: null,
    auth: null
};

// Cargar templates
async function loadUserMenuTemplates() {
    if (UserMenuTemplates.guest && UserMenuTemplates.auth) return;
    try {
        const [guest, auth] = await Promise.all([
            fetch('../components/user-menu-guest.html').then(r => r.ok ? r.text() : null),
            fetch('../components/user-menu-auth.html').then(r => r.ok ? r.text() : null)
        ]);
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
        // Usuario autenticado
        if (UserMenuTemplates.auth) {
            const avatarHtml = user.avatar_url
                ? `<img src="${user.avatar_url}" alt="${user.nombre}" class="w-8 h-8 rounded-full object-cover">`
                : `<i data-lucide="user" class="w-6 h-6"></i>`;

            const userName = user.nombre ? user.nombre.split(' ')[0] : 'Usuario';

            container.innerHTML = UserMenuTemplates.auth
                .replace('{{avatar_html}}', avatarHtml)
                .replace('{{user_name}}', userName);

            // Attach event listeners
            document.getElementById('user-menu-toggle')?.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleUserMenu();
            });
            document.getElementById('logout-btn')?.addEventListener('click', (e) => {
                if (window.handleLogout) window.handleLogout();
            });

        } else {
            // Fallback
            container.innerHTML = `<button id="user-menu-fallback" class="flex items-center gap-2"><span>${user.nombre}</span></button>`;
            document.getElementById('user-menu-fallback')?.addEventListener('click', toggleUserMenu);
        }
    } else {
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
